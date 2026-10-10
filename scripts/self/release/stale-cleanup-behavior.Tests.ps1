<#
.SYNOPSIS
    REQ-058 stale 管理投影物クリーンアップの実スクリプト挙動テスト。

.DESCRIPTION
    一時リポジトリ上で scripts/install.ps1（consumer 向け公開入口）と
    scripts/self-sync.ps1（self-hosting 向け公開入口）の実スクリプトを実行し、
    stale 管理投影物の検出・変更予測・適用・同期完了条件
    （REQ-058-001〜012、REQ-050-015）を検証する。
    検証対象は Issue #2540 テスト戦略 TS-001〜TS-005 に対応する。
    TS-006〜TS-008 は Issue #3605 受入条件1〜5 に対応する（ジャンクション投影の正本一致
    検査の統一: 旧正本 wrong-target の修復と収束、候補外 wrong-target の保持と衝突報告、
    LocalMode 正本解決の期待値）。健全・修復可能群（TS-001〜004、TS-006、TS-008）と
    判定不能衝突群（TS-007）を分離し、TS-007 に修復全件の収束を要求しない。

    実行方法:
        pwsh -NoProfile -File scripts/self/release/stale-cleanup-behavior.Tests.ps1
    終了コード: 0 = 全合格、1 = 不合格あり（不合格アサーションを標準出力へ報告する）。

    前提: Windows（junction 使用）、pwsh 7、git コマンドが利用可能なこと。
    provisioning と network access は行わない（REQ-009-046、REQ-050-013）。
    削除失敗の注入（TS-004 (3)）は stale plugin loader shim（実ファイル）への
    排他ハンドル保持で構成する。junction 自体は実環境の OS 動作上
    削除不能状態を作れないため、実ファイルである stale 管理投影物で
    失敗伝播（全件処理の継続と判別可能な終了コード）を検証する。
#>

# ADF-COVERS(verification): REQ-058-001, REQ-058-002, REQ-058-003, REQ-058-004, REQ-058-005, REQ-058-006, REQ-058-007, REQ-058-008, REQ-058-009, REQ-058-010, REQ-058-011, REQ-058-012
# ADF-COVERS(verification): REQ-050-015
# ADF-COVERS(verification): REQ-050-002, REQ-050-003, REQ-050-005
# ADF-COVERS(verification): REQ-099-012

#Requires -Version 7.0

$ErrorActionPreference = 'Stop'

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..')).Path
$InstallScript = Join-Path $RepoRoot 'scripts\install.ps1'
$SelfSyncScript = Join-Path $RepoRoot 'scripts\self-sync.ps1'
$Req050Path = Join-Path $RepoRoot 'docs\requirements\REQ-050.md'
$Req058Path = Join-Path $RepoRoot 'docs\requirements\REQ-058.md'
$Req009Path = Join-Path $RepoRoot 'docs\requirements\REQ-009.md'
$TestFilePath = $PSCommandPath

$script:FailureCount = 0

function Assert-True {
    <#
    .SYNOPSIS
        1アサーションの判定。不合格は集計に記録し、検証を続行する。
    #>
    param([string]$Label, [object]$Condition, [string]$Detail = '')
    if ($Condition) {
        Write-Host "  [PASS] $Label"
    } else {
        Write-Host "  [FAIL] $Label"
        if ($Detail) {
            Write-Host "         detail: $Detail"
        }
        $script:FailureCount++
    }
}

function Invoke-EntryScript {
    <#
    .SYNOPSIS
        公開入口スクリプトを子 pwsh プロセスで実行し、終了コードと出力を返す。
    #>
    param([string]$ScriptPath, [string]$Mode, [string]$Cwd, [string[]]$ExtraArgs = @())
    $prev = $PWD.Path
    Push-Location -LiteralPath $Cwd
    try {
        $output = & pwsh -NoProfile -NonInteractive -File $ScriptPath -Mode $Mode @ExtraArgs 2>&1 | Out-String
        $code = $LASTEXITCODE
    } finally {
        Pop-Location
    }
    [PSCustomObject]@{ ExitCode = $code; Output = $output }
}

function Get-TestJunctionTargetString {
    <#
    .SYNOPSIS
        junction のリンク先文字列（reparse data）を返す。broken junction でも取得できる。
    #>
    param([string]$Path)
    $item = Get-Item -LiteralPath $Path -Force -ErrorAction SilentlyContinue
    if (-not $item -or -not ($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint)) { return $null }
    return (@($item.Target) | Select-Object -First 1)
}

function Remove-TestJunction {
    <#
    .SYNOPSIS
        junction を削除する（リンク自体のみ。リンク先実体には触れない）。
    #>
    param([string]$LinkPath)
    if (-not (Test-PathExists $LinkPath)) { throw "junction not found: $LinkPath" }
    cmd /c "rmdir `"$LinkPath`"" | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "rmdir failed: $LinkPath"
    }
}

function New-OldCanonicalLayout {
    <#
    .SYNOPSIS
        旧単一正本（src/opencode/ 配下に commands・skills・tools を配置していた旧構成）を
        正本側へ再現し、旧側確認用ファイル（probe）を置く（REQ-099-012 の旧構成 consumer /
        旧構成本体の再現）。$SourceRoot は src\ を含むディレクトリ
        （consumer: <root>\.agentdev-plugin、self-hosting: <root>）。
    #>
    param([string]$SourceRoot)
    New-Item -ItemType Directory -Path (Join-Path $SourceRoot 'src\opencode\commands\agentdev') -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $SourceRoot 'src\opencode\skills\agentdev-testskill') -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $SourceRoot 'src\opencode\tools\agentdev-testtool') -Force | Out-Null
    Set-Content -LiteralPath (Join-Path $SourceRoot 'src\opencode\commands\agentdev\old-cmd.txt') -Value 'old-canonical'
    Set-Content -LiteralPath (Join-Path $SourceRoot 'src\opencode\skills\agentdev-testskill\old-skill.txt') -Value 'old-canonical'
    Set-Content -LiteralPath (Join-Path $SourceRoot 'src\opencode\tools\agentdev-testtool\old-tool.txt') -Value 'old-canonical'
}

function Test-ProjectionContentEquals {
    <#
    .SYNOPSIS
        投影経由で参照したファイル内容が期待値と一致するか判定する（受入条件3:
        投影経由の実体内容が現行正本と一致することの確認）。改行コード差は吸収する。
    #>
    param([string]$FilePath, [string]$Expected)
    if (-not (Test-PathExists $FilePath)) { return $false }
    return ((Get-Content -LiteralPath $FilePath -Raw).Trim() -eq $Expected)
}

function Test-PathExists {
    <#
    .SYNOPSIS
        broken junction を含むパス存在確認（Test-Path は broken junction で false になり得る）。
    #>
    param([string]$Path)
    return $null -ne (Get-Item -LiteralPath $Path -Force -ErrorAction SilentlyContinue)
}

function New-TempRepo {
    param([string]$Prefix)
    $root = Join-Path ([System.IO.Path]::GetTempPath()) "$Prefix-$(Get-Random)"
    New-Item -ItemType Directory -Path $root | Out-Null
    return $root
}

function Remove-TempRepo {
    param([string]$Root)
    if ($Root -and (Test-Path -LiteralPath $Root)) {
        Remove-Item -LiteralPath $Root -Recurse -Force -ErrorAction SilentlyContinue
    }
}

function New-TestJunction {
    param([string]$LinkPath, [string]$TargetPath)
    $parent = Split-Path $LinkPath -Parent
    if (-not (Test-Path -LiteralPath $parent)) {
        New-Item -ItemType Directory -Path $parent -Force | Out-Null
    }
    cmd /c "mklink /J `"$LinkPath`" `"$TargetPath`"" | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "mklink failed: $LinkPath -> $TargetPath"
    }
}

function New-SourceTree {
    <#
    .SYNOPSIS
        正本（マルチホスト正本モデル: src/common/ 共通正本 + src/opencode/ OpenCode
        接続領域 + src/senpi/ Senpi 接続領域）に ADF 管理対象を構築する。
    #>
    param([string]$CommonSourceDir, [string]$OpencodeSourceDir, [string]$SenpiSourceDir)
    New-Item -ItemType Directory -Path (Join-Path $CommonSourceDir 'commands\agentdev') -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $CommonSourceDir 'skills\agentdev-testskill') -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $CommonSourceDir 'tools\agentdev-testtool') -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $OpencodeSourceDir 'plugins\agentdev-testplugin') -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $SenpiSourceDir 'connection-demo') -Force | Out-Null
    Set-Content -LiteralPath (Join-Path $CommonSourceDir 'commands\agentdev\test.md') -Value '# test'
    Set-Content -LiteralPath (Join-Path $CommonSourceDir 'skills\agentdev-testskill\SKILL.md') -Value '# skill'
    Set-Content -LiteralPath (Join-Path $CommonSourceDir 'tools\agentdev-testtool\index.ts') -Value '// tool'
    Set-Content -LiteralPath (Join-Path $OpencodeSourceDir 'plugins\agentdev-testplugin\plugin.ts') -Value '// plugin'
    Set-Content -LiteralPath (Join-Path $SenpiSourceDir 'connection-demo\connection.ts') -Value '// senpi connection'
}

function New-ConsumerRepo {
    <#
    .SYNOPSIS
        consumer 型一時リポジトリを構築する（.agentdev-plugin チェックアウト + scripts コピー）。
        install.ps1 の cwd 安全化（.git 要求）のため git init する。
    #>
    $root = New-TempRepo 'adf-stale-consumer'
    New-SourceTree -CommonSourceDir (Join-Path $root '.agentdev-plugin\src\common') -OpencodeSourceDir (Join-Path $root '.agentdev-plugin\src\opencode') -SenpiSourceDir (Join-Path $root '.agentdev-plugin\src\senpi')
    New-Item -ItemType Directory -Path (Join-Path $root 'scripts\consumer') -Force | Out-Null
    Copy-Item -LiteralPath $InstallScript -Destination (Join-Path $root 'scripts\install.ps1')
    Copy-Item -LiteralPath (Join-Path $RepoRoot 'scripts\consumer\common.ps1') -Destination (Join-Path $root 'scripts\consumer\common.ps1')
    git init -q $root
    if ($LASTEXITCODE -ne 0) { throw "git init failed: $root" }
    return $root
}

function New-SelfRepo {
    <#
    .SYNOPSIS
        self-hosting 型一時リポジトリを構築する（src/common + src/opencode + src/senpi
        正本 + scripts/self-sync.ps1）。
    #>
    $root = New-TempRepo 'adf-stale-self'
    New-SourceTree -CommonSourceDir (Join-Path $root 'src\common') -OpencodeSourceDir (Join-Path $root 'src\opencode') -SenpiSourceDir (Join-Path $root 'src\senpi')
    New-Item -ItemType Directory -Path (Join-Path $root 'scripts') -Force | Out-Null
    Copy-Item -LiteralPath $SelfSyncScript -Destination (Join-Path $root 'scripts\self-sync.ps1')
    return $root
}

function Invoke-Ts001Consumer {
    <#
    .SYNOPSIS
        TS-001: consumer 入口（install.ps1）の check → dry-run → apply → check 状態遷移。
        REQ-058-001/002/003/004/005/006、REQ-050-015、REQ-058-012（consumer 側）。
    #>
    Write-Host '=== TS-001 (consumer: scripts/install.ps1) ==='
    $root = New-ConsumerRepo
    try {
        $projSkill = Join-Path $root '.opencode\skills\agentdev-testskill'
        $srcSkill = Join-Path $root '.agentdev-plugin\src\common\skills\agentdev-testskill'

        $apply = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'apply' -Cwd $root
        Assert-True 'TS-001 apply succeeds' ($apply.ExitCode -eq 0) $apply.Output
        Assert-True 'TS-001 apply creates managed junction' (Test-PathExists $projSkill) ''

        # 正本から管理対象 junction を削除する（stale 化。REQ-058-002）
        Remove-Item -LiteralPath $srcSkill -Recurse -Force

        $check1 = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'check' -Cwd $root
        Assert-True 'TS-001 check reports stale orphan with failure exit code (REQ-058-003)' `
            (($check1.ExitCode -eq 1) -and ($check1.Output -match 'agentdev-testskill')) $check1.Output
        Assert-True 'TS-001 check does not modify filesystem' (Test-PathExists $projSkill) ''

        $dry = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'dry-run' -Cwd $root
        Assert-True 'TS-001 dry-run predicts removal without change (REQ-058-004)' `
            (($dry.ExitCode -eq 0) -and ($dry.Output -match 'WOULD REMOVE') -and ($dry.Output -match 'agentdev-testskill')) $dry.Output
        Assert-True 'TS-001 dry-run leaves junction in place' (Test-PathExists $projSkill) ''

        $apply2 = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'apply' -Cwd $root
        Assert-True 'TS-001 apply removes stale junction (REQ-058-005)' `
            (($apply2.ExitCode -eq 0) -and (-not (Test-PathExists $projSkill))) $apply2.Output

        $check2 = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'check' -Cwd $root
        Assert-True 'TS-001 post-apply check converges = sync completion condition (REQ-058-006, REQ-050-015)' `
            ($check2.ExitCode -eq 0) $check2.Output
    } finally {
        Remove-TempRepo $root
    }
}

function Invoke-Ts001SelfSync {
    <#
    .SYNOPSIS
        TS-001: self-hosting 入口（self-sync.ps1）の同一構成の状態遷移（REQ-058-012）。
    #>
    Write-Host '=== TS-001 (self-hosting: scripts/self-sync.ps1) ==='
    $root = New-SelfRepo
    try {
        # self-sync.ps1 は $PSScriptRoot の親をリポジトリルートと解決するため、
        # 必ず一時リポジトリ内のコピーを実行する（本体の worktree を同期対象にしない）。
        $entry = Join-Path $root 'scripts\self-sync.ps1'
        $projSkill = Join-Path $root '.opencode\skills\agentdev-testskill'
        $srcSkill = Join-Path $root 'src\common\skills\agentdev-testskill'

        $apply = Invoke-EntryScript -ScriptPath $entry -Mode 'apply' -Cwd $root
        Assert-True 'TS-001 apply succeeds (self-sync)' ($apply.ExitCode -eq 0) $apply.Output
        Assert-True 'TS-001 apply creates managed junction (self-sync)' (Test-PathExists $projSkill) ''

        Remove-Item -LiteralPath $srcSkill -Recurse -Force

        $check1 = Invoke-EntryScript -ScriptPath $entry -Mode 'check' -Cwd $root
        Assert-True 'TS-001 check reports stale orphan with failure exit code (self-sync)' `
            (($check1.ExitCode -eq 1) -and ($check1.Output -match 'agentdev-testskill')) $check1.Output
        Assert-True 'TS-001 check does not modify filesystem (self-sync)' (Test-PathExists $projSkill) ''

        $dry = Invoke-EntryScript -ScriptPath $entry -Mode 'dry-run' -Cwd $root
        Assert-True 'TS-001 dry-run predicts removal without change (self-sync)' `
            (($dry.ExitCode -eq 0) -and ($dry.Output -match 'WOULD REMOVE') -and ($dry.Output -match 'agentdev-testskill')) $dry.Output
        Assert-True 'TS-001 dry-run leaves junction in place (self-sync)' (Test-PathExists $projSkill) ''

        $apply2 = Invoke-EntryScript -ScriptPath $entry -Mode 'apply' -Cwd $root
        Assert-True 'TS-001 apply removes stale junction (self-sync)' `
            (($apply2.ExitCode -eq 0) -and (-not (Test-PathExists $projSkill))) $apply2.Output

        $check2 = Invoke-EntryScript -ScriptPath $entry -Mode 'check' -Cwd $root
        Assert-True 'TS-001 post-apply check converges (self-sync, REQ-058-012)' `
            ($check2.ExitCode -eq 0) $check2.Output
    } finally {
        Remove-TempRepo $root
    }
}

function Invoke-Ts002 {
    <#
    .SYNOPSIS
        TS-002: ADF 管理対象外の成果物の非破壊境界（REQ-058-008）。
    #>
    Write-Host '=== TS-002 (consumer: non-destructive boundary) ==='
    $root = New-ConsumerRepo
    try {
        $apply = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'apply' -Cwd $root
        Assert-True 'TS-002 apply succeeds' ($apply.ExitCode -eq 0) $apply.Output

        # repo-local 成果物（repo- prefix、実ディレクトリ）
        New-Item -ItemType Directory -Path (Join-Path $root '.opencode\commands\repo') -Force | Out-Null
        Set-Content -LiteralPath (Join-Path $root '.opencode\commands\repo\my.md') -Value '# repo command'
        New-Item -ItemType Directory -Path (Join-Path $root '.opencode\skills\repo-my-skill') -Force | Out-Null
        Set-Content -LiteralPath (Join-Path $root '.opencode\skills\repo-my-skill\SKILL.md') -Value '# repo skill'

        # 利用者独自成果物（agentdev- で始まらない任意名、実ディレクトリ）
        New-Item -ItemType Directory -Path (Join-Path $root '.opencode\skills\my-custom-skill') -Force | Out-Null
        Set-Content -LiteralPath (Join-Path $root '.opencode\skills\my-custom-skill\SKILL.md') -Value '# custom'

        # 管理物判定不能な成果物（agentdev- で始まるが正本・配布リストのどちらにも存在しない
        # 名前近似の junction。正本以外を向くため管理物と確定できない）
        New-Item -ItemType Directory -Path (Join-Path $root 'mimic-target') -Force | Out-Null
        Set-Content -LiteralPath (Join-Path $root 'mimic-target\keep.txt') -Value 'keep'
        New-TestJunction -LinkPath (Join-Path $root '.opencode\tools\agentdev-mimic') -TargetPath (Join-Path $root 'mimic-target')

        $apply2 = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'apply' -Cwd $root
        Assert-True 'TS-002 apply succeeds with unmanaged artifacts present' ($apply2.ExitCode -eq 0) $apply2.Output
        Assert-True 'TS-002 repo-local command kept' (Test-PathExists (Join-Path $root '.opencode\commands\repo\my.md')) ''
        Assert-True 'TS-002 repo-local skill kept' (Test-PathExists (Join-Path $root '.opencode\skills\repo-my-skill\SKILL.md')) ''
        Assert-True 'TS-002 user artifact kept' (Test-PathExists (Join-Path $root '.opencode\skills\my-custom-skill\SKILL.md')) ''
        Assert-True 'TS-002 name-approximation junction kept (content reachable)' `
            (Test-PathExists (Join-Path $root '.opencode\tools\agentdev-mimic\keep.txt')) ''

        $check = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'check' -Cwd $root
        Assert-True 'TS-002 check treats unmanaged artifacts as out-of-scope (exit 0)' `
            ($check.ExitCode -eq 0) $check.Output
    } finally {
        Remove-TempRepo $root
    }
}

function Invoke-Ts003Consumer {
    <#
    .SYNOPSIS
        TS-003: consumer 入口での投影物種別横断の契約統一。
        ケース1: 正本から Plugin loader shim 元パッケージを削除（REQ-058-007）。
        ケース2: 配布・投影対象から明示的に除外された管理対象 junction（REQ-058-002）。
    #>
    Write-Host '=== TS-003 case1 (consumer: stale plugin loader shim) ==='
    $root = New-ConsumerRepo
    try {
        $shim = Join-Path $root '.opencode\plugins\agentdev-testplugin.ts'
        $projPkg = Join-Path $root '.opencode\plugins\agentdev-testplugin'
        $srcPkg = Join-Path $root '.agentdev-plugin\src\opencode\plugins\agentdev-testplugin'

        $apply = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'apply' -Cwd $root
        Assert-True 'TS-003 apply creates plugin package junction and shim (existing shim contract intact)' `
            (($apply.ExitCode -eq 0) -and (Test-PathExists $shim) -and (Test-PathExists $projPkg)) $apply.Output
        $check0 = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'check' -Cwd $root
        Assert-True 'TS-003 check is clean after normal apply (shim contract no regression)' `
            ($check0.ExitCode -eq 0) $check0.Output

        Remove-Item -LiteralPath $srcPkg -Recurse -Force

        $check1 = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'check' -Cwd $root
        Assert-True 'TS-003 check detects stale junction and stale shim (REQ-058-007)' `
            (($check1.ExitCode -eq 1) -and ($check1.Output -match 'plugins\\agentdev-testplugin') -and ($check1.Output -match 'agentdev-testplugin\.ts')) $check1.Output

        $dry = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'dry-run' -Cwd $root
        Assert-True 'TS-003 dry-run predicts both removals' `
            (($dry.ExitCode -eq 0) -and ($dry.Output -match 'plugins\\agentdev-testplugin') -and ($dry.Output -match 'agentdev-testplugin\.ts')) $dry.Output
        Assert-True 'TS-003 dry-run removes nothing' ((Test-PathExists $shim) -and (Test-PathExists $projPkg)) ''

        $apply2 = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'apply' -Cwd $root
        Assert-True 'TS-003 apply removes stale junction and stale shim by the same principle' `
            (($apply2.ExitCode -eq 0) -and (-not (Test-PathExists $shim)) -and (-not (Test-PathExists $projPkg))) $apply2.Output

        $check2 = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'check' -Cwd $root
        Assert-True 'TS-003 post-apply check converges (case1)' ($check2.ExitCode -eq 0) $check2.Output
    } finally {
        Remove-TempRepo $root
    }

    Write-Host '=== TS-003 case2 (consumer: explicitly excluded managed junction) ==='
    $root2 = New-ConsumerRepo
    try {
        # 正本に配布除外名（install.ps1 の $RepoLocalPluginNames と同一）の plugin を置く。
        # consumer 配布対象から明示的に除外されている（REQ-052-006、REQ-002-045）。
        $excludedSrc = Join-Path $root2 '.agentdev-plugin\src\opencode\plugins\agentdev-distribution-boundary-guard'
        New-Item -ItemType Directory -Path $excludedSrc -Force | Out-Null
        Set-Content -LiteralPath (Join-Path $excludedSrc 'plugin.ts') -Value '// excluded plugin'

        $apply = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'apply' -Cwd $root2
        Assert-True 'TS-003 apply succeeds with excluded plugin in source' ($apply.ExitCode -eq 0) $apply.Output
        Assert-True 'TS-003 apply does not junction the excluded plugin' `
            (-not (Test-PathExists (Join-Path $root2 '.opencode\plugins\agentdev-distribution-boundary-guard'))) ''

        # 過去に配布対象だった時代の管理対象 junction を配置先へ再現する
        New-TestJunction `
            -LinkPath (Join-Path $root2 '.opencode\plugins\agentdev-distribution-boundary-guard') `
            -TargetPath $excludedSrc

        $check1 = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'check' -Cwd $root2
        Assert-True 'TS-003 check detects excluded managed junction (REQ-058-002)' `
            (($check1.ExitCode -eq 1) -and ($check1.Output -match 'agentdev-distribution-boundary-guard')) $check1.Output

        $dry = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'dry-run' -Cwd $root2
        Assert-True 'TS-003 dry-run predicts removal of excluded managed junction' `
            (($dry.ExitCode -eq 0) -and ($dry.Output -match 'agentdev-distribution-boundary-guard')) $dry.Output

        $apply2 = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'apply' -Cwd $root2
        Assert-True 'TS-003 apply removes excluded managed junction' `
            (($apply2.ExitCode -eq 0) -and (-not (Test-PathExists (Join-Path $root2 '.opencode\plugins\agentdev-distribution-boundary-guard')))) $apply2.Output

        $check2 = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'check' -Cwd $root2
        Assert-True 'TS-003 post-apply check converges (case2)' ($check2.ExitCode -eq 0) $check2.Output
    } finally {
        Remove-TempRepo $root2
    }
}

function Invoke-Ts003SelfSync {
    <#
    .SYNOPSIS
        TS-003: self-hosting 入口でも shim 既存契約と同一原則が動作する（REQ-058-012）。
    #>
    Write-Host '=== TS-003 (self-hosting: stale plugin loader shim, same principle) ==='
    $root = New-SelfRepo
    try {
        $entry = Join-Path $root 'scripts\self-sync.ps1'
        $shim = Join-Path $root '.opencode\plugins\agentdev-testplugin.ts'
        $projPkg = Join-Path $root '.opencode\plugins\agentdev-testplugin'
        $srcPkg = Join-Path $root 'src\opencode\plugins\agentdev-testplugin'

        $apply = Invoke-EntryScript -ScriptPath $entry -Mode 'apply' -Cwd $root
        Assert-True 'TS-003 apply creates shim (self-sync)' (($apply.ExitCode -eq 0) -and (Test-PathExists $shim)) $apply.Output

        Remove-Item -LiteralPath $srcPkg -Recurse -Force

        $check1 = Invoke-EntryScript -ScriptPath $entry -Mode 'check' -Cwd $root
        Assert-True 'TS-003 check detects stale junction and shim (self-sync)' `
            (($check1.ExitCode -eq 1) -and ($check1.Output -match 'plugins\\agentdev-testplugin') -and ($check1.Output -match 'agentdev-testplugin\.ts')) $check1.Output

        $apply2 = Invoke-EntryScript -ScriptPath $entry -Mode 'apply' -Cwd $root
        Assert-True 'TS-003 apply removes stale junction and shim (self-sync)' `
            (($apply2.ExitCode -eq 0) -and (-not (Test-PathExists $shim)) -and (-not (Test-PathExists $projPkg))) $apply2.Output

        $check2 = Invoke-EntryScript -ScriptPath $entry -Mode 'check' -Cwd $root
        Assert-True 'TS-003 post-apply check converges (self-sync)' ($check2.ExitCode -eq 0) $check2.Output
    } finally {
        Remove-TempRepo $root
    }
}

function Invoke-Ts004Consumer {
    <#
    .SYNOPSIS
        TS-004: consumer 入口での完全性・冪等性・失敗報告（REQ-058-009/010/011）。
    #>
    Write-Host '=== TS-004 (consumer: completeness / idempotency / failure report) ==='

    Write-Host '--- TS-004 (1) multiple stale junctions are all removed ---'
    $root = New-ConsumerRepo
    try {
        $apply = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'apply' -Cwd $root
        Assert-True 'TS-004(1) apply succeeds' ($apply.ExitCode -eq 0) $apply.Output

        for ($i = 1; $i -le 3; $i++) {
            New-TestJunction `
                -LinkPath (Join-Path $root ".opencode\skills\agentdev-gone$i") `
                -TargetPath (Join-Path $root ".agentdev-plugin\src\common\skills\agentdev-gone$i")
        }

        $apply2 = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'apply' -Cwd $root
        $allRemoved = $true
        for ($i = 1; $i -le 3; $i++) {
            if (Test-PathExists (Join-Path $root ".opencode\skills\agentdev-gone$i")) { $allRemoved = $false }
        }
        Assert-True 'TS-004(1) apply removes all stale junctions (REQ-058-009)' `
            (($apply2.ExitCode -eq 0) -and $allRemoved) $apply2.Output

        Write-Host '--- TS-004 (2) re-apply is idempotent ---'
        $apply3 = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'apply' -Cwd $root
        Assert-True 'TS-004(2) re-apply makes no stale-removal changes (REQ-058-010)' `
            (($apply3.ExitCode -eq 0) -and ($apply3.Output -notmatch 'Removing stale managed junction') -and ($apply3.Output -notmatch 'Removing stale plugin loader shim')) $apply3.Output
        $check = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'check' -Cwd $root
        Assert-True 'TS-004(2) check stays clean after re-apply' ($check.ExitCode -eq 0) $check.Output
    } finally {
        Remove-TempRepo $root
    }

    Write-Host '--- TS-004 (3) removal failure is reported with distinguishable exit code ---'
    $root2 = New-ConsumerRepo
    try {
        $apply = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'apply' -Cwd $root2
        Assert-True 'TS-004(3) apply succeeds' ($apply.ExitCode -eq 0) $apply.Output

        # 正本から skill と plugin を削除し、配置先に stale junction（2件）と stale shim（1件）を残す
        Remove-Item -LiteralPath (Join-Path $root2 '.agentdev-plugin\src\common\skills\agentdev-testskill') -Recurse -Force
        Remove-Item -LiteralPath (Join-Path $root2 '.agentdev-plugin\src\opencode\plugins\agentdev-testplugin') -Recurse -Force

        $shimPath = Join-Path $root2 '.opencode\plugins\agentdev-testplugin.ts'
        $projPkg = Join-Path $root2 '.opencode\plugins\agentdev-testplugin'
        $projSkill = Join-Path $root2 '.opencode\skills\agentdev-testskill'

        # stale shim（実ファイル）を排他ハンドルでロックし、削除失敗を注入する
        $stream = [System.IO.File]::Open($shimPath, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::None)
        try {
            $applyFail = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'apply' -Cwd $root2
            Assert-True 'TS-004(3) apply does not return success when a stale artifact fails to remove (REQ-058-011)' `
                ($applyFail.ExitCode -eq 1) $applyFail.Output
            Assert-True 'TS-004(3) failure is reported with an identifiable message' `
                ($applyFail.Output -match 'Failed to remove stale plugin loader shim') $applyFail.Output
            Assert-True 'TS-004(3) locked stale shim survives' (Test-PathExists $shimPath) ''
            Assert-True 'TS-004(3) remaining stale targets were still processed (all-or-nothing success)' `
                ((-not (Test-PathExists $projPkg)) -and (-not (Test-PathExists $projSkill))) $applyFail.Output
        } finally {
            $stream.Dispose()
        }

        $applyOk = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'apply' -Cwd $root2
        Assert-True 'TS-004(3) apply succeeds after lock release' `
            (($applyOk.ExitCode -eq 0) -and (-not (Test-PathExists $shimPath))) $applyOk.Output
        $check2 = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'check' -Cwd $root2
        Assert-True 'TS-004(3) check converges after failure recovery' ($check2.ExitCode -eq 0) $check2.Output
    } finally {
        Remove-TempRepo $root2
    }
}

function Invoke-Ts004SelfSync {
    <#
    .SYNOPSIS
        TS-004: self-hosting 入口でも同一構成の完全性・冪等性・失敗報告（REQ-058-012）。
    #>
    Write-Host '=== TS-004 (self-hosting: completeness / idempotency / failure report) ==='

    Write-Host '--- TS-004 self (1)(2) multiple stale + idempotency ---'
    $root = New-SelfRepo
    try {
        $entry = Join-Path $root 'scripts\self-sync.ps1'
        $apply = Invoke-EntryScript -ScriptPath $entry -Mode 'apply' -Cwd $root
        Assert-True 'TS-004 self(1) apply succeeds' ($apply.ExitCode -eq 0) $apply.Output

        for ($i = 1; $i -le 3; $i++) {
            New-TestJunction `
                -LinkPath (Join-Path $root ".opencode\skills\agentdev-gone$i") `
                -TargetPath (Join-Path $root "src\common\skills\agentdev-gone$i")
        }

        $apply2 = Invoke-EntryScript -ScriptPath $entry -Mode 'apply' -Cwd $root
        $allRemoved = $true
        for ($i = 1; $i -le 3; $i++) {
            if (Test-PathExists (Join-Path $root ".opencode\skills\agentdev-gone$i")) { $allRemoved = $false }
        }
        Assert-True 'TS-004 self(1) apply removes all stale junctions (REQ-058-009)' `
            (($apply2.ExitCode -eq 0) -and $allRemoved) $apply2.Output

        $apply3 = Invoke-EntryScript -ScriptPath $entry -Mode 'apply' -Cwd $root
        Assert-True 'TS-004 self(2) re-apply makes no stale-removal changes (REQ-058-010)' `
            (($apply3.ExitCode -eq 0) -and ($apply3.Output -notmatch 'Removing stale managed junction') -and ($apply3.Output -notmatch 'Removing stale plugin loader shim')) $apply3.Output
        $check = Invoke-EntryScript -ScriptPath $entry -Mode 'check' -Cwd $root
        Assert-True 'TS-004 self(2) check stays clean after re-apply' ($check.ExitCode -eq 0) $check.Output
    } finally {
        Remove-TempRepo $root
    }

    Write-Host '--- TS-004 self (3) removal failure report ---'
    $root2 = New-SelfRepo
    try {
        $entry = Join-Path $root2 'scripts\self-sync.ps1'
        $apply = Invoke-EntryScript -ScriptPath $entry -Mode 'apply' -Cwd $root2
        Assert-True 'TS-004 self(3) apply succeeds' ($apply.ExitCode -eq 0) $apply.Output

        Remove-Item -LiteralPath (Join-Path $root2 'src\common\skills\agentdev-testskill') -Recurse -Force
        Remove-Item -LiteralPath (Join-Path $root2 'src\opencode\plugins\agentdev-testplugin') -Recurse -Force

        $shimPath = Join-Path $root2 '.opencode\plugins\agentdev-testplugin.ts'
        $stream = [System.IO.File]::Open($shimPath, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::None)
        try {
            $applyFail = Invoke-EntryScript -ScriptPath $entry -Mode 'apply' -Cwd $root2
            Assert-True 'TS-004 self(3) apply does not return success on stale removal failure (REQ-058-011)' `
                ($applyFail.ExitCode -eq 1) $applyFail.Output
            Assert-True 'TS-004 self(3) failure is reported' `
                ($applyFail.Output -match 'Failed to remove stale plugin loader shim') $applyFail.Output
        } finally {
            $stream.Dispose()
        }

        $applyOk = Invoke-EntryScript -ScriptPath $entry -Mode 'apply' -Cwd $root2
        Assert-True 'TS-004 self(3) apply succeeds after lock release' `
            (($applyOk.ExitCode -eq 0) -and (-not (Test-PathExists $shimPath))) $applyOk.Output
        $check2 = Invoke-EntryScript -ScriptPath $entry -Mode 'check' -Cwd $root2
        Assert-True 'TS-004 self(3) check converges (self-sync)' ($check2.ExitCode -eq 0) $check2.Output
    } finally {
        Remove-TempRepo $root2
    }
}

function Invoke-Ts005 {
    <#
    .SYNOPSIS
        TS-005: REQ-050-015 と REQ-058 の交叉参照・番号連続性・検証対応宣言の整合。
        docs-check（配布物整合性検査）は worktree の検証手段として別途実施する
        （bun test 必要のため、メインリポジトリ側の検証手段を参照）。
    #>
    Write-Host '=== TS-005 (docs cross-reference integrity) ==='
    $req050 = Get-Content -LiteralPath $Req050Path -Raw
    $req058 = Get-Content -LiteralPath $Req058Path -Raw
    $req009 = Get-Content -LiteralPath $Req009Path -Raw

    # REQ-050-001〜016 の番号連続（欠番・重複なし）
    $ids050 = [regex]::Matches($req050, '\|\s*(REQ-050-\d{3})\s*\|') | ForEach-Object { $_.Groups[1].Value }
    $expected050 = @(1..16 | ForEach-Object { 'REQ-050-{0:D3}' -f $_ })
    $missing050 = @($expected050 | Where-Object { $_ -notin $ids050 })
    Assert-True 'TS-005 REQ-050-001..015 are consecutive without gaps or duplicates' `
        (($ids050.Count -eq $expected050.Count) -and ($missing050.Count -eq 0)) "found: $($ids050 -join ', ')"

    # REQ-058-001〜012 の番号連続
    $ids058 = [regex]::Matches($req058, '\|\s*(REQ-058-\d{3})\s*\|') | ForEach-Object { $_.Groups[1].Value }
    $expected058 = @(1..12 | ForEach-Object { 'REQ-058-{0:D3}' -f $_ })
    $missing058 = @($expected058 | Where-Object { $_ -notin $ids058 })
    Assert-True 'TS-005 REQ-058-001..012 are consecutive without gaps or duplicates' `
        (($ids058.Count -eq $expected058.Count) -and ($missing058.Count -eq 0)) "found: $($ids058 -join ', ')"

    # 交叉参照: REQ-050-015 は REQ-058 を参照する
    Assert-True 'TS-005 REQ-050-015 cross-references REQ-058' `
        ($req050 -match 'REQ-050-015[^\r\n]*REQ-058') ''

    # 交叉参照: REQ-058 は REQ-009 と REQ-050 を参照する
    Assert-True 'TS-005 REQ-058 cross-references REQ-009 and REQ-050' `
        (($req058 -match 'REQ-009') -and ($req058 -match 'REQ-050')) ''

    # 参照先の既存契約行が存在する
    foreach ($ref in @('REQ-009-001', 'REQ-009-046')) {
        Assert-True "TS-005 referenced contract line exists: $ref" `
            ($req009 -match [regex]::Escape($ref)) ''
    }
    foreach ($ref in @('REQ-050-002', 'REQ-050-003', 'REQ-050-004', 'REQ-050-005', 'REQ-050-013')) {
        Assert-True "TS-005 referenced contract line exists: $ref" `
            ($req050 -match [regex]::Escape($ref)) ''
    }

    # 検証対応宣言（ADF-COVERS(verification)）が検証対応必須行を網羅する
    $testContent = Get-Content -LiteralPath $TestFilePath -Raw
    foreach ($id in @($expected058 + @('REQ-050-015'))) {
        Assert-True "TS-005 verification declaration covers $id" `
            ($testContent -match ('ADF-COVERS\(verification\)[^\r\n]*' + [regex]::Escape($id))) ''
    }
}

function Invoke-Ts006Consumer {
    <#
    .SYNOPSIS
        TS-006: consumer 入口での旧正本 wrong-target リンクの正本一致検査と自己修復
        （受入条件1/2/3/5、REQ-050-002、REQ-050-015、REQ-058-004/005/006、REQ-099-012）。
        commands・skills・tools の 3 分類の旧正本リンクについて、check 乖離・dry-run 予測・
        apply 修復・適用後 check 収束・旧側実体保持・冪等性を検証する。
        健全・修復可能群の試験であり、修復全件の収束を要求する。
    #>
    Write-Host '=== TS-006 (consumer: old-canonical wrong-target links are repaired) ==='
    $root = New-ConsumerRepo
    try {
        $srcRoot = Join-Path $root '.agentdev-plugin'
        New-OldCanonicalLayout -SourceRoot $srcRoot
        $projCmd = Join-Path $root '.opencode\commands\agentdev'
        $projSkill = Join-Path $root '.opencode\skills\agentdev-testskill'
        $projTool = Join-Path $root '.opencode\tools\agentdev-testtool'
        $oldCmd = Join-Path $srcRoot 'src\opencode\commands\agentdev'
        $oldSkill = Join-Path $srcRoot 'src\opencode\skills\agentdev-testskill'
        $oldTool = Join-Path $srcRoot 'src\opencode\tools\agentdev-testtool'
        New-TestJunction -LinkPath $projCmd -TargetPath $oldCmd
        New-TestJunction -LinkPath $projSkill -TargetPath $oldSkill
        New-TestJunction -LinkPath $projTool -TargetPath $oldTool

        # 受入条件1: check は旧正本リンクを正常扱いせず全件乖離報告と終了コード 1
        $check1 = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'check' -Cwd $root
        Assert-True 'TS-006 check reports all 3 old-canonical links as divergence with exit 1 (REQ-050-002)' `
            (($check1.ExitCode -eq 1) -and
             ($check1.Output -match 'commands\\agentdev') -and
             ($check1.Output -match 'skills\\agentdev-testskill') -and
             ($check1.Output -match 'tools\\agentdev-testtool')) $check1.Output

        # 受入条件2: check・dry-run 前後でリンク先文字列・リンク先実体・配置先ファイルが不変
        $targetsBefore = @((Get-TestJunctionTargetString $projCmd), (Get-TestJunctionTargetString $projSkill), (Get-TestJunctionTargetString $projTool))
        $probesBefore = @(
            (Get-Content -LiteralPath (Join-Path $oldCmd 'old-cmd.txt') -Raw),
            (Get-Content -LiteralPath (Join-Path $oldTool 'old-tool.txt') -Raw)
        )

        $dry = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'dry-run' -Cwd $root
        Assert-True 'TS-006 dry-run predicts removal and re-creation for all 3 (REQ-058-004)' `
            (($dry.ExitCode -eq 0) -and
             ($dry.Output -match 'WOULD REMOVE') -and ($dry.Output -match 'WOULD ADD') -and
             ($dry.Output -match 'WOULD REMOVE[^\r\n]*commands\\agentdev') -and
             ($dry.Output -match 'WOULD REMOVE[^\r\n]*skills\\agentdev-testskill') -and
             ($dry.Output -match 'WOULD REMOVE[^\r\n]*tools\\agentdev-testtool')) $dry.Output
        Assert-True 'TS-006 dry-run prediction shows the planned canonical target (fidelity)' `
            ($dry.Output -match [regex]::Escape((Join-Path $srcRoot 'src\common\commands\agentdev'))) $dry.Output
        Assert-True 'TS-006 dry-run does not treat wrong-target links as normal (no Already junctioned for the 3)' `
            ($dry.Output -notmatch 'Already junctioned: (commands\\agentdev|skills\\agentdev-testskill|tools\\agentdev-testtool)') $dry.Output

        $targetsAfter = @((Get-TestJunctionTargetString $projCmd), (Get-TestJunctionTargetString $projSkill), (Get-TestJunctionTargetString $projTool))
        $probesAfter = @(
            (Get-Content -LiteralPath (Join-Path $oldCmd 'old-cmd.txt') -Raw),
            (Get-Content -LiteralPath (Join-Path $oldTool 'old-tool.txt') -Raw)
        )
        Assert-True 'TS-006 check and dry-run change nothing (link strings unchanged)' `
            (($targetsBefore -join '|') -eq ($targetsAfter -join '|')) (($targetsBefore -join '|') + ' vs ' + ($targetsAfter -join '|'))
        Assert-True 'TS-006 check and dry-run change nothing (old-side probe files unchanged)' `
            (($probesBefore -join '|') -eq ($probesAfter -join '|')) ''

        # 受入条件3: broken junction（旧リンク先消失）を 1 件混入させたまま apply で修復
        Remove-Item -LiteralPath $oldSkill -Recurse -Force
        $apply = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'apply' -Cwd $root
        Assert-True 'TS-006 apply repairs all 3 old-canonical links (incl. broken junction) (REQ-058-005)' `
            ($apply.ExitCode -eq 0) $apply.Output
        Assert-True 'TS-006 repaired command junction resolves to current canonical' `
            ((Get-TestJunctionTargetString $projCmd) -ieq [System.IO.Path]::GetFullPath((Join-Path $srcRoot 'src\common\commands\agentdev'))) `
            (Get-TestJunctionTargetString $projCmd)
        Assert-True 'TS-006 projection content equals current canonical (command)' `
            (Test-ProjectionContentEquals (Join-Path $projCmd 'test.md') '# test') (Get-Content -LiteralPath (Join-Path $projCmd 'test.md') -Raw)
        Assert-True 'TS-006 projection content equals current canonical (skill, broken repaired)' `
            (Test-ProjectionContentEquals (Join-Path $projSkill 'SKILL.md') '# skill') ''
        Assert-True 'TS-006 projection content equals current canonical (tool)' `
            (Test-ProjectionContentEquals (Join-Path $projTool 'index.ts') '// tool') ''
        Assert-True 'TS-006 old-side entities are preserved (probe files intact)' `
            ((Test-PathExists (Join-Path $oldCmd 'old-cmd.txt')) -and (Test-PathExists (Join-Path $oldTool 'old-tool.txt'))) ''

        $check2 = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'check' -Cwd $root
        Assert-True 'TS-006 post-apply same-condition check converges to 0 divergence (REQ-058-006, REQ-050-015)' `
            ($check2.ExitCode -eq 0) $check2.Output

        # 受入条件5: 修復後の冪等性（健全な apply 再実行の不要操作なし）
        $apply2 = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'apply' -Cwd $root
        Assert-True 'TS-006 healthy re-apply makes no repair actions (idempotency)' `
            (($apply2.ExitCode -eq 0) -and
             ($apply2.Output -notmatch 'Removing junction \(wrong target\)') -and
             ($apply2.Output -notmatch 'Removing broken junction') -and
             ($apply2.Output -notmatch '\[ACTION\] Creating junction')) $apply2.Output
        $check3 = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'check' -Cwd $root
        Assert-True 'TS-006 check stays clean after healthy re-apply' ($check3.ExitCode -eq 0) $check3.Output
    } finally {
        Remove-TempRepo $root
    }
}

function Invoke-Ts006SelfSync {
    <#
    .SYNOPSIS
        TS-006: self-hosting 入口（self-sync.ps1、-Hosts both）でも同一の正本一致検査と
        自己修復が動作する（受入条件1/2/3/5、REQ-050-003、REQ-050-015、REQ-058-012）。
    #>
    Write-Host '=== TS-006 (self-hosting: old-canonical wrong-target links are repaired, both hosts) ==='
    $root = New-SelfRepo
    try {
        $entry = Join-Path $root 'scripts\self-sync.ps1'
        $srcRoot = $root
        New-OldCanonicalLayout -SourceRoot $srcRoot
        $projCmd = Join-Path $root '.opencode\commands\agentdev'
        $projSkill = Join-Path $root '.opencode\skills\agentdev-testskill'
        $projTool = Join-Path $root '.opencode\tools\agentdev-testtool'
        $oldCmd = Join-Path $srcRoot 'src\opencode\commands\agentdev'
        $oldSkill = Join-Path $srcRoot 'src\opencode\skills\agentdev-testskill'
        $oldTool = Join-Path $srcRoot 'src\opencode\tools\agentdev-testtool'
        New-TestJunction -LinkPath $projCmd -TargetPath $oldCmd
        New-TestJunction -LinkPath $projSkill -TargetPath $oldSkill
        New-TestJunction -LinkPath $projTool -TargetPath $oldTool

        $check1 = Invoke-EntryScript -ScriptPath $entry -Mode 'check' -Cwd $root -ExtraArgs @('-Hosts', 'both')
        Assert-True 'TS-006 self check reports all 3 old-canonical links as divergence with exit 1 (REQ-050-003)' `
            (($check1.ExitCode -eq 1) -and
             ($check1.Output -match 'commands\\agentdev') -and
             ($check1.Output -match 'skills\\agentdev-testskill') -and
             ($check1.Output -match 'tools\\agentdev-testtool')) $check1.Output

        $dry = Invoke-EntryScript -ScriptPath $entry -Mode 'dry-run' -Cwd $root -ExtraArgs @('-Hosts', 'both')
        Assert-True 'TS-006 self dry-run predicts removal and re-creation for all 3 (REQ-058-004)' `
            (($dry.ExitCode -eq 0) -and
             ($dry.Output -match 'WOULD REMOVE[^\r\n]*commands\\agentdev') -and
             ($dry.Output -match 'WOULD REMOVE[^\r\n]*skills\\agentdev-testskill') -and
             ($dry.Output -match 'WOULD REMOVE[^\r\n]*tools\\agentdev-testtool') -and
             ($dry.Output -match 'WOULD ADD[^\r\n]*commands\\agentdev')) $dry.Output
        Assert-True 'TS-006 self dry-run leaves links in place (broken-junction detection survives dry-run)' `
            ((Get-TestJunctionTargetString $projCmd) -ieq [System.IO.Path]::GetFullPath($oldCmd)) ''

        # broken junction（旧リンク先消失）を混入させて apply
        Remove-Item -LiteralPath $oldSkill -Recurse -Force
        $apply = Invoke-EntryScript -ScriptPath $entry -Mode 'apply' -Cwd $root -ExtraArgs @('-Hosts', 'both')
        Assert-True 'TS-006 self apply repairs all 3 old-canonical links (REQ-058-005)' `
            ($apply.ExitCode -eq 0) $apply.Output
        Assert-True 'TS-006 self repaired skill junction resolves to current canonical' `
            ((Get-TestJunctionTargetString $projSkill) -ieq [System.IO.Path]::GetFullPath((Join-Path $srcRoot 'src\common\skills\agentdev-testskill'))) `
            (Get-TestJunctionTargetString $projSkill)
        Assert-True 'TS-006 self old-side entities are preserved (probe files intact)' `
            ((Test-PathExists (Join-Path $oldCmd 'old-cmd.txt')) -and (Test-PathExists (Join-Path $oldTool 'old-tool.txt'))) ''

        $check2 = Invoke-EntryScript -ScriptPath $entry -Mode 'check' -Cwd $root -ExtraArgs @('-Hosts', 'both')
        Assert-True 'TS-006 self post-apply same-condition check converges (REQ-058-012, REQ-050-015)' `
            ($check2.ExitCode -eq 0) $check2.Output

        $apply2 = Invoke-EntryScript -ScriptPath $entry -Mode 'apply' -Cwd $root -ExtraArgs @('-Hosts', 'both')
        Assert-True 'TS-006 self healthy re-apply makes no repair actions (idempotency)' `
            (($apply2.ExitCode -eq 0) -and
             ($apply2.Output -notmatch 'Removing junction \(wrong target\)') -and
             ($apply2.Output -notmatch 'Removing broken junction') -and
             ($apply2.Output -notmatch '\[ACTION\] Creating junction')) $apply2.Output
    } finally {
        Remove-TempRepo $root
    }
}

function Invoke-Ts007Consumer {
    <#
    .SYNOPSIS
        TS-007: consumer 入口での管理物判定不能 wrong-target リンクの非破壊境界
        （受入条件4、REQ-058-008）。plugins・Senpi の正本候補外リンク（存在する候補外
        リンク先・消失した候補外リンク先の両反例）について、自動置換 0 件・衝突報告・
        apply 非正常終了・リンクとリンク先実体の保持を検証する。
        判定不能衝突群の試験であり、修復全件の収束を要求しない。
    #>
    Write-Host '=== TS-007 (consumer: unidentifiable wrong-target links are kept with conflict) ==='
    $root = New-ConsumerRepo
    try {
        $apply0 = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'apply' -Cwd $root
        Assert-True 'TS-007 baseline healthy apply succeeds' ($apply0.ExitCode -eq 0) $apply0.Output

        # (a) plugins: 存在する候補外リンク先
        $alienPlugin = Join-Path $root 'alien-plugin-target'
        New-Item -ItemType Directory -Path $alienPlugin -Force | Out-Null
        Set-Content -LiteralPath (Join-Path $alienPlugin 'probe.txt') -Value 'alien'
        Remove-TestJunction -LinkPath (Join-Path $root '.opencode\plugins\agentdev-testplugin')
        New-TestJunction -LinkPath (Join-Path $root '.opencode\plugins\agentdev-testplugin') -TargetPath $alienPlugin

        # (b) Senpi: 存在する候補外リンク先
        $alienSenpi = Join-Path $root 'alien-senpi-target'
        New-Item -ItemType Directory -Path $alienSenpi -Force | Out-Null
        Set-Content -LiteralPath (Join-Path $alienSenpi 'probe.txt') -Value 'alien'
        Remove-TestJunction -LinkPath (Join-Path $root '.senpi\connection-demo')
        New-TestJunction -LinkPath (Join-Path $root '.senpi\connection-demo') -TargetPath $alienSenpi

        $check1 = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'check' -Cwd $root
        Assert-True 'TS-007 check reports candidate-外 links as NG with identified targets (exit 1)' `
            (($check1.ExitCode -eq 1) -and
             ($check1.Output -match 'plugins\\agentdev-testplugin') -and
             ($check1.Output -match 'connection-demo')) $check1.Output

        $dry = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'dry-run' -Cwd $root
        Assert-True 'TS-007 dry-run does not predict removal or re-creation for candidate-外 links (keep report instead)' `
            (($dry.ExitCode -eq 0) -and
             ($dry.Output -notmatch '\[WOULD REMOVE[^\r\n]*agentdev-testplugin') -and
             ($dry.Output -notmatch '\[WOULD[^\r\n]*connection-demo') -and
             ($dry.Output -match 'Unmanaged junction at managed path')) $dry.Output

        $apply = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'apply' -Cwd $root
        Assert-True 'TS-007 apply exits non-zero on conflicts (REQ-058-008)' ($apply.ExitCode -eq 1) $apply.Output
        Assert-True 'TS-007 apply reports the conflict with identified targets' `
            ($apply.Output -match 'were kept \(conflict\)') $apply.Output
        Assert-True 'TS-007 candidate-外 plugin link kept (link and target intact)' `
            ((Get-TestJunctionTargetString (Join-Path $root '.opencode\plugins\agentdev-testplugin')) -ieq [System.IO.Path]::GetFullPath($alienPlugin)) ''
        Assert-True 'TS-007 candidate-外 plugin target entity kept' `
            (Test-PathExists (Join-Path $alienPlugin 'probe.txt')) ''
        Assert-True 'TS-007 candidate-外 Senpi link kept (link and target intact)' `
            ((Get-TestJunctionTargetString (Join-Path $root '.senpi\connection-demo')) -ieq [System.IO.Path]::GetFullPath($alienSenpi)) ''
        Assert-True 'TS-007 candidate-外 Senpi target entity kept' `
            (Test-PathExists (Join-Path $alienSenpi 'probe.txt')) ''

        # (c) 消失した候補外リンク先（broken junction、管理物判定不能）を tools に混入
        Remove-TestJunction -LinkPath (Join-Path $root '.opencode\tools\agentdev-testtool')
        New-TestJunction -LinkPath (Join-Path $root '.opencode\tools\agentdev-testtool') -TargetPath (Join-Path $root 'vanished-target')

        $apply2 = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'apply' -Cwd $root
        Assert-True 'TS-007 apply exits non-zero with vanished candidate-外 target too (REQ-058-008)' `
            ($apply2.ExitCode -eq 1) $apply2.Output
        Assert-True 'TS-007 vanished candidate-外 link kept (broken junction not auto-replaced)' `
            ($null -ne (Get-TestJunctionTargetString (Join-Path $root '.opencode\tools\agentdev-testtool'))) ''
        Assert-True 'TS-007 vanished candidate-外 link kept (target string unchanged)' `
            ((Get-TestJunctionTargetString (Join-Path $root '.opencode\tools\agentdev-testtool')) -like '*vanished-target') ''
    } finally {
        Remove-TempRepo $root
    }
}

function Invoke-Ts007SelfSync {
    <#
    .SYNOPSIS
        TS-007: self-hosting 入口（self-sync.ps1、-Hosts both）でも同一の非破壊境界が
        動作する（受入条件4、REQ-058-008、REQ-058-012）。
    #>
    Write-Host '=== TS-007 (self-hosting: unidentifiable wrong-target links are kept with conflict) ==='
    $root = New-SelfRepo
    try {
        $entry = Join-Path $root 'scripts\self-sync.ps1'
        $apply0 = Invoke-EntryScript -ScriptPath $entry -Mode 'apply' -Cwd $root -ExtraArgs @('-Hosts', 'both')
        Assert-True 'TS-007 self baseline healthy apply succeeds' ($apply0.ExitCode -eq 0) $apply0.Output

        # OpenCode tools: 存在する候補外リンク先
        $alienTool = Join-Path $root 'alien-tool-target'
        New-Item -ItemType Directory -Path $alienTool -Force | Out-Null
        Set-Content -LiteralPath (Join-Path $alienTool 'probe.txt') -Value 'alien'
        Remove-TestJunction -LinkPath (Join-Path $root '.opencode\tools\agentdev-testtool')
        New-TestJunction -LinkPath (Join-Path $root '.opencode\tools\agentdev-testtool') -TargetPath $alienTool

        # Senpi: 消失した候補外リンク先
        Remove-TestJunction -LinkPath (Join-Path $root '.senpi\connection-demo')
        New-TestJunction -LinkPath (Join-Path $root '.senpi\connection-demo') -TargetPath (Join-Path $root 'vanished-senpi-target')

        $check1 = Invoke-EntryScript -ScriptPath $entry -Mode 'check' -Cwd $root -ExtraArgs @('-Hosts', 'both')
        Assert-True 'TS-007 self check reports candidate-外 links as NG (exit 1)' `
            (($check1.ExitCode -eq 1) -and
             ($check1.Output -match 'tools\\agentdev-testtool') -and
             ($check1.Output -match 'connection-demo')) $check1.Output

        $dry = Invoke-EntryScript -ScriptPath $entry -Mode 'dry-run' -Cwd $root -ExtraArgs @('-Hosts', 'both')
        Assert-True 'TS-007 self dry-run does not predict removal or re-creation for candidate-外 links' `
            (($dry.ExitCode -eq 0) -and
             ($dry.Output -notmatch '\[WOULD REMOVE[^\r\n]*agentdev-testtool') -and
             ($dry.Output -notmatch '\[WOULD[^\r\n]*connection-demo') -and
             ($dry.Output -match 'Unmanaged junction at managed path')) $dry.Output

        $apply = Invoke-EntryScript -ScriptPath $entry -Mode 'apply' -Cwd $root -ExtraArgs @('-Hosts', 'both')
        Assert-True 'TS-007 self apply exits non-zero on conflicts' ($apply.ExitCode -eq 1) $apply.Output
        Assert-True 'TS-007 self candidate-外 tool link kept (target entity intact)' `
            ((Get-TestJunctionTargetString (Join-Path $root '.opencode\tools\agentdev-testtool')) -ieq [System.IO.Path]::GetFullPath($alienTool)) ''
        Assert-True 'TS-007 self vanished candidate-外 Senpi link kept (broken junction not auto-replaced)' `
            ((Get-TestJunctionTargetString (Join-Path $root '.senpi\connection-demo')) -like '*vanished-senpi-target') ''
    } finally {
        Remove-TempRepo $root
    }
}

function Invoke-Ts008Consumer {
    <#
    .SYNOPSIS
        TS-008: consumer 入口の LocalMode 正本解決の期待値（受入条件5、REQ-009-020、
        REQ-050-002）。LocalMode 指定時は src/common/tools/agentdev-gh/local/ を期待値として
        健全と判定し、通常構成から LocalMode への既存の参照先変更が維持されること、
        誤修復が 0 件であることを検証する。
    #>
    Write-Host '=== TS-008 (consumer: LocalMode resolution expectations) ==='
    $root = New-ConsumerRepo
    try {
        # Local 実装原本（runner-local.ts）を正本に用意する（導入時の LocalMode 必須条件）
        $localSrc = Join-Path $root '.agentdev-plugin\src\common\tools\agentdev-gh\local'
        New-Item -ItemType Directory -Path $localSrc -Force | Out-Null
        Set-Content -LiteralPath (Join-Path $localSrc 'runner-local.ts') -Value '// local runner'
        $ghProj = Join-Path $root '.opencode\tools\agentdev-gh'
        $expectedLocalFull = [System.IO.Path]::GetFullPath($localSrc)

        # 通常構成を先に apply する（tools/agentdev-gh は共通原本へ接続される）
        $applyNormal = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'apply' -Cwd $root
        Assert-True 'TS-008 normal apply succeeds' ($applyNormal.ExitCode -eq 0) $applyNormal.Output
        Assert-True 'TS-008 normal apply links tools/agentdev-gh to the shared canonical' `
            ((Get-TestJunctionTargetString $ghProj) -ieq [System.IO.Path]::GetFullPath((Join-Path $root '.agentdev-plugin\src\common\tools\agentdev-gh'))) ''

        # 通常構成から LocalMode への既存の参照先変更が維持される（受入条件5）
        $applyLocal = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'apply' -Cwd $root -ExtraArgs @('-LocalMode')
        Assert-True 'TS-008 apply -LocalMode redirects the existing normal link to local (managed repair)' `
            (($applyLocal.ExitCode -eq 0) -and ((Get-TestJunctionTargetString $ghProj) -ieq $expectedLocalFull)) $applyLocal.Output

        # LocalMode 指定時の健全判定（check は乖離 0）
        $checkLocal = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'check' -Cwd $root -ExtraArgs @('-LocalMode')
        Assert-True 'TS-008 check -LocalMode treats the local link as healthy (exit 0)' `
            ($checkLocal.ExitCode -eq 0) $checkLocal.Output

        # LocalMode 指定時の dry-run / apply 再実行の不要操作なし（誤修復 0 件）
        $dryLocal = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'dry-run' -Cwd $root -ExtraArgs @('-LocalMode')
        Assert-True 'TS-008 dry-run -LocalMode reports no repair for the healthy local link' `
            (($dryLocal.ExitCode -eq 0) -and
             ($dryLocal.Output -notmatch '\[WOULD REMOVE[^\r\n]*agentdev-gh') -and
             ($dryLocal.Output -match 'Already junctioned: tools\\agentdev-gh')) $dryLocal.Output
        $applyLocal2 = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'apply' -Cwd $root -ExtraArgs @('-LocalMode')
        Assert-True 'TS-008 healthy re-apply -LocalMode makes no repair actions' `
            (($applyLocal2.ExitCode -eq 0) -and
             ($applyLocal2.Output -notmatch 'Removing junction \(wrong target\)') -and
             ($applyLocal2.Output -notmatch 'Removing broken junction') -and
             ($applyLocal2.Output -notmatch '\[ACTION\] Creating junction: tools\\agentdev-gh')) $applyLocal2.Output
        Assert-True 'TS-008 local link unchanged after healthy re-apply (no misrepair)' `
            ((Get-TestJunctionTargetString $ghProj) -ieq $expectedLocalFull) ''
    } finally {
        Remove-TempRepo $root
    }
}

# ============================================================
# Main
# ============================================================

Write-Host "stale-cleanup behavior tests: $TestFilePath"
Invoke-Ts001Consumer
Invoke-Ts001SelfSync
Invoke-Ts002
Invoke-Ts003Consumer
Invoke-Ts003SelfSync
Invoke-Ts004Consumer
Invoke-Ts004SelfSync
Invoke-Ts005
Invoke-Ts006Consumer
Invoke-Ts006SelfSync
Invoke-Ts007Consumer
Invoke-Ts007SelfSync
Invoke-Ts008Consumer

Write-Host ''
if ($script:FailureCount -gt 0) {
    Write-Host "FAILED: $script:FailureCount assertion(s) failed."
    exit 1
}
Write-Host 'PASSED: all stale-cleanup behavior tests passed.'
exit 0
