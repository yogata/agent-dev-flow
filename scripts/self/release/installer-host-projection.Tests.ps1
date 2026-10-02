<#
.SYNOPSIS
    REQ-099 installer 配置対象ホスト選択・両ホスト投影・冪等・保護・診断区別の
    実スクリプト挙動テスト（Issue #3322 テスト戦略 TS-005 / TS-006）。

.DESCRIPTION
    一時リポジトリ上で scripts/install.ps1（consumer 向け公開入口）と
    scripts/self-sync.ps1（self-hosting 向け公開入口）の実スクリプトを実行し、
    配置対象ホスト選択（OpenCode のみ / Senpi のみ / 両方）、check/dry-run/apply
    の3モード維持、片対象の更新・除去時の他ホスト投影・repo-local 資産・
    ユーザー設定の保護、再実行冪等、CLI 未導入環境での配置検査と実行環境診断の
    区別（REQ-099-010 / REQ-099-011 / REQ-099-012）を検証する。
    検証対象は Issue #3322 テスト戦略 TS-005（試験行列）と TS-006（診断区別）。

    試験行列（TS-005）: check/dry-run/apply × 配置対象（opencode / senpi / both）
    ×（新規導入、既存更新、明示変更、再実行、対象別除去）。

    実行方法:
        pwsh -NoProfile -File scripts/self/release/installer-host-projection.Tests.ps1
    終了コード: 0 = 全合格、1 = 不合格あり（不合格アサーションを標準出力へ報告する）。

    前提: Windows（junction 使用）、pwsh 7、git コマンドが利用可能なこと。
    メインリポジトリ・実ユーザー環境には一切書き込まない（一時ディレクトリのみ）。
    provisioning と network access は行わない（REQ-009-046、REQ-050-013）。
#>

# ADF-COVERS(verification): REQ-099-010, REQ-099-011, REQ-099-012

#Requires -Version 7.0

$ErrorActionPreference = 'Stop'

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..')).Path
$InstallScript = Join-Path $RepoRoot 'scripts\install.ps1'
$SelfSyncScript = Join-Path $RepoRoot 'scripts\self-sync.ps1'
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

# Child pwsh executable, resolved once before any PATH manipulation (TS-006
# runs the entry scripts with a minimal PATH where 'pwsh' itself is not on PATH).
$PwshExe = (Get-Command pwsh -ErrorAction Stop).Source

function Invoke-EntryScript {
    <#
    .SYNOPSIS
        公開入口スクリプトを子 pwsh プロセスで実行し、終了コードと出力を返す。
    #>
    param([string]$ScriptPath, [string]$Mode, [string]$Cwd, [string[]]$ExtraArgs = @())
    $prev = $PWD.Path
    Push-Location -LiteralPath $Cwd
    try {
        $output = & $PwshExe -NoProfile -NonInteractive -File $ScriptPath -Mode $Mode @ExtraArgs 2>&1 | Out-String
        $code = $LASTEXITCODE
    } finally {
        Pop-Location
    }
    [PSCustomObject]@{ ExitCode = $code; Output = $output }
}

function Invoke-EntryScriptWithMinimalPath {
    <#
    .SYNOPSIS
        実行環境診断（TS-006）用。CLI（opencode / omo）が PATH に存在しない状態を
        再現するため、System32 のみを PATH とする子 pwsh プロセスで実行する。
    #>
    param([string]$ScriptPath, [string]$Mode, [string]$Cwd, [string[]]$ExtraArgs = @())
    $prevPath = $env:PATH
    try {
        $env:PATH = "$env:SystemRoot\System32"
        $result = Invoke-EntryScript -ScriptPath $ScriptPath -Mode $Mode -Cwd $Cwd -ExtraArgs $ExtraArgs
    } finally {
        $env:PATH = $prevPath
    }
    return $result
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

function New-CanonicalCheckout {
    <#
    .SYNOPSIS
        マルチホスト正本モデルの疑似チェックアウト（src/common + src/opencode +
        src/senpi）を構築する。
    #>
    param([string]$PluginDir)
    $common = Join-Path $PluginDir 'src\common'
    $opencode = Join-Path $PluginDir 'src\opencode'
    $senpi = Join-Path $PluginDir 'src\senpi'
    New-Item -ItemType Directory -Path (Join-Path $common 'commands\agentdev') -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $common 'skills\agentdev-testskill') -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $common 'tools\agentdev-testtool') -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $opencode 'plugins\agentdev-testplugin') -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $senpi 'connection-demo') -Force | Out-Null
    Set-Content -LiteralPath (Join-Path $common 'commands\agentdev\test.md') -Value '# test'
    Set-Content -LiteralPath (Join-Path $common 'skills\agentdev-testskill\SKILL.md') -Value '# skill'
    Set-Content -LiteralPath (Join-Path $common 'tools\agentdev-testtool\index.ts') -Value '// tool'
    Set-Content -LiteralPath (Join-Path $opencode 'plugins\agentdev-testplugin\plugin.ts') -Value '// plugin'
    Set-Content -LiteralPath (Join-Path $senpi 'README.md') -Value '# src/senpi/ (Senpi host connection area)'
    Set-Content -LiteralPath (Join-Path $senpi 'connection-demo\connection.ts') -Value '// senpi connection'
}

function New-ConsumerRepo {
    <#
    .SYNOPSIS
        consumer 型一時リポジトリを構築する（.agentdev-plugin チェックアウト +
        scripts コピー + git init）。
    #>
    param([string]$Prefix = 'adf-host-proj')
    $root = New-TempRepo $Prefix
    New-CanonicalCheckout -PluginDir (Join-Path $root '.agentdev-plugin')
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
        self-hosting 型一時リポジトリを構築する（正本 + scripts/self-sync.ps1）。
    #>
    param([string]$Prefix = 'adf-host-self')
    $root = New-TempRepo $Prefix
    New-CanonicalCheckout -PluginDir $root
    New-Item -ItemType Directory -Path (Join-Path $root 'scripts') -Force | Out-Null
    Copy-Item -LiteralPath $SelfSyncScript -Destination (Join-Path $root 'scripts\self-sync.ps1')
    return $root
}

function New-ProtectedAssets {
    <#
    .SYNOPSIS
        保護対象の repo-local 資産とユーザー設定を配置先リポジトリへ配置する。
    #>
    param([string]$Root)
    # repo-local 成果物（実ディレクトリ）
    New-Item -ItemType Directory -Path (Join-Path $Root '.opencode\skills\repo-my-skill') -Force | Out-Null
    Set-Content -LiteralPath (Join-Path $Root '.opencode\skills\repo-my-skill\SKILL.md') -Value '# repo skill'
    # third-party Skill 配置（実ディレクトリ + provenance マーカー）
    New-Item -ItemType Directory -Path (Join-Path $Root '.opencode\skills\third-party-placed') -Force | Out-Null
    Set-Content -LiteralPath (Join-Path $Root '.opencode\skills\third-party-placed\SKILL.md') -Value '# third-party skill'
    Set-Content -LiteralPath (Join-Path $Root '.opencode\skills\third-party-placed\.agentdev-third-party.json') -Value '{"tool":"agentdev_third_party","name":"third-party-placed"}'
    # project extensions（.agentdev/extensions/**）
    New-Item -ItemType Directory -Path (Join-Path $Root '.agentdev\extensions\skills') -Force | Out-Null
    Set-Content -LiteralPath (Join-Path $Root '.agentdev\extensions\skills\agentdev-workflow-case-run.yaml') -Value "version: 1`nkind: workflow-extension`nid: agentdev-workflow-case-run"
    # ユーザー設定
    Set-Content -LiteralPath (Join-Path $Root 'AGENTS.md') -Value '# user settings (harness selection)'
}

function Get-ProtectedStateDigest {
    <#
    .SYNOPSIS
        保護対象（repo-local 資産・ユーザー設定・他ホスト投影の内容）の状態ダイジェストを返す。
        保護検証（REQ-099-012）は apply 前後のダイジェスト一致で行う。
    #>
    param([string]$Root)
    $targets = @(
        (Join-Path $Root 'AGENTS.md'),
        (Join-Path $Root '.agentdev\extensions'),
        (Join-Path $Root '.opencode\skills\repo-my-skill'),
        (Join-Path $Root '.opencode\skills\third-party-placed')
    )
    $parts = [System.Collections.Generic.List[string]]::new()
    foreach ($t in $targets) {
        if (-not (Test-Path -LiteralPath $t)) { $parts.Add("${t}:absent"); continue }
        $item = Get-Item -LiteralPath $t -Force
        if ($item.PSIsContainer) {
            $files = @(Get-ChildItem -LiteralPath $t -Recurse -File -Force)
            $parts.Add("${t}:dir:$($files.Count)")
            foreach ($f in $files) {
                $hash = (Get-FileHash -LiteralPath $f.FullName -Algorithm SHA256).Hash
                $rel = $f.FullName.Substring($t.Length)
                $parts.Add("${t}:${rel}:${hash}")
            }
        } else {
            $hash = (Get-FileHash -LiteralPath $t -Algorithm SHA256).Hash
            $parts.Add("${t}:file:${hash}")
        }
    }
    return ($parts -join "`n")
}

function Get-ProjectionStateDigest {
    <#
    .SYNOPSIS
        配置先投影状態のダイジェスト（リンク先パス一覧）。冪等検証（再実行で
        不要な登録を増やさない）に使用する。
    #>
    param([string]$Root)
    $parts = [System.Collections.Generic.List[string]]::new()
    foreach ($base in @((Join-Path $Root '.opencode'), (Join-Path $Root '.senpi'))) {
        if (-not (Test-Path -LiteralPath $base)) { $parts.Add("$base:absent"); continue }
        $items = @(Get-ChildItem -LiteralPath $base -Recurse -Force -ErrorAction SilentlyContinue |
            Where-Object { $_.Attributes -band [System.IO.FileAttributes]::ReparsePoint })
        foreach ($i in $items) {
            $rel = $i.FullName.Substring($base.Length)
            $target = ($i.Target | ForEach-Object { [string]$_ }) -join '|'
            $parts.Add("${base}:${rel}:${target}")
        }
    }
    return (($parts | Sort-Object) -join "`n")
}

# ============================================================
# TS-005 試験行列
# ============================================================

function Invoke-Ts005ModeHostsMatrix {
    <#
    .SYNOPSIS
        TS-005 行列: 3モード × 3配置対象。新規導入環境で各組合せが期待どおりに
        動作すること（check は乖離報告、dry-run は変更なし、apply は配置）。
    #>
    Write-Host '=== TS-005 matrix: modes x placement targets (fresh install) ==='
    $matrix = @(
        @{ Mode = 'check';   Hosts = 'opencode' },
        @{ Mode = 'check';   Hosts = 'senpi' },
        @{ Mode = 'check';   Hosts = 'both' },
        @{ Mode = 'dry-run'; Hosts = 'opencode' },
        @{ Mode = 'dry-run'; Hosts = 'senpi' },
        @{ Mode = 'dry-run'; Hosts = 'both' },
        @{ Mode = 'apply';   Hosts = 'opencode' },
        @{ Mode = 'apply';   Hosts = 'senpi' },
        @{ Mode = 'apply';   Hosts = 'both' }
    )
    foreach ($cell in $matrix) {
        $root = New-ConsumerRepo
        try {
            $r = Invoke-EntryScript -ScriptPath $InstallScript -Mode $cell.Mode -Cwd $root -ExtraArgs @('-Hosts', $cell.Hosts)
            $label = "TS-005 matrix $($cell.Mode) x $($cell.Hosts) exits as expected"
            $expectedCode = if ($cell.Mode -eq 'check') { 1 } else { 0 }
            # 新規導入環境の check は投影欠落を乖離として報告する（終了コード 1）
            $ok = ($r.ExitCode -eq $expectedCode)
            if ($cell.Mode -eq 'apply') {
                $oc = Test-PathExists (Join-Path $root '.opencode\commands\agentdev')
                $sc = Test-PathExists (Join-Path $root '.senpi\connection-demo')
                if ($cell.Hosts -eq 'opencode') { $ok = $ok -and $oc -and (-not $sc) }
                elseif ($cell.Hosts -eq 'senpi') { $ok = $ok -and $sc -and (-not $oc) }
                else { $ok = $ok -and $oc -and $sc }
            }
            if ($cell.Mode -eq 'dry-run') {
                $oc = Test-PathExists (Join-Path $root '.opencode\commands\agentdev')
                $sc = Test-PathExists (Join-Path $root '.senpi\connection-demo')
                $ok = $ok -and (-not $oc) -and (-not $sc) -and ($r.Output -match 'Dry run complete. No changes made.')
            }
            Assert-True $label $ok $r.Output
        } finally {
            Remove-TempRepo $root
        }
    }
}

function Invoke-Ts005FreshInstallDefaultsToBoth {
    <#
    .SYNOPSIS
        TS-005 新規導入: -Hosts 省略時は both（新規導入の推奨）が適用される（REQ-099-010）。
    #>
    Write-Host '=== TS-005 fresh install: omitted -Hosts defaults to both ==='
    $root = New-ConsumerRepo
    try {
        $r = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'apply' -Cwd $root
        $oc = Test-PathExists (Join-Path $root '.opencode\skills\agentdev-testskill')
        $sc = Test-PathExists (Join-Path $root '.senpi\connection-demo')
        Assert-True 'TS-005 fresh install (no -Hosts) places both hosts' `
            (($r.ExitCode -eq 0) -and $oc -and $sc -and ($r.Output -match 'both')) $r.Output
    } finally {
        Remove-TempRepo $root
    }
}

function Invoke-Ts005ExistingUpdateKeepsHosts {
    <#
    .SYNOPSIS
        TS-005 既存更新: -Hosts 省略時は現在の配置対象を検出して維持する（REQ-099-010）。
    #>
    Write-Host '=== TS-005 existing update: omitted -Hosts keeps detected placement targets ==='
    $root = New-ConsumerRepo
    try {
        # OpenCode のみで導入する
        $apply1 = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'apply' -Cwd $root -ExtraArgs @('-Hosts', 'opencode')
        Assert-True 'TS-005 existing update setup: opencode-only apply succeeds' ($apply1.ExitCode -eq 0) $apply1.Output

        # 正本へ新しい skill を追加し、-Hosts 省略で更新する
        $newSkill = Join-Path $root '.agentdev-plugin\src\common\skills\agentdev-second'
        New-Item -ItemType Directory -Path $newSkill -Force | Out-Null
        Set-Content -LiteralPath (Join-Path $newSkill 'SKILL.md') -Value '# second skill'
        $apply2 = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'apply' -Cwd $root
        $secondProjected = Test-PathExists (Join-Path $root '.opencode\skills\agentdev-second\SKILL.md')
        $senpiStillEmpty = -not (Test-PathExists (Join-Path $root '.senpi\connection-demo'))
        Assert-True 'TS-005 existing update keeps opencode-only placement and projects new skill' `
            (($apply2.ExitCode -eq 0) -and $secondProjected -and $senpiStillEmpty) $apply2.Output

        # 両ホスト適用後の省略更新は both を維持する
        $apply3 = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'apply' -Cwd $root -ExtraArgs @('-Hosts', 'both')
        Assert-True 'TS-005 existing update setup: both apply succeeds' ($apply3.ExitCode -eq 0) $apply3.Output
        $check = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'check' -Cwd $root
        Assert-True 'TS-005 omitted check keeps both placement targets' `
            (($check.ExitCode -eq 0) -and ($check.Output -match '両方')) $check.Output
    } finally {
        Remove-TempRepo $root
    }
}

function Invoke-Ts005ExplicitChangeAndRemoval {
    <#
    .SYNOPSIS
        TS-005 明示変更・対象別除去: 明示指定により配置対象を変更した場合、
        選択から外れたホストの ADF 管理投影物のみが除去され、他ホスト投影・
        repo-local 資産・ユーザー設定は保護される（REQ-099-010、REQ-099-012）。
    #>
    Write-Host '=== TS-005 explicit change / per-target removal with protection ==='
    $root = New-ConsumerRepo
    try {
        New-ProtectedAssets -Root $root
        $protectedBefore = Get-ProtectedStateDigest -Root $root

        $applyBoth = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'apply' -Cwd $root -ExtraArgs @('-Hosts', 'both')
        Assert-True 'TS-005 removal setup: both apply succeeds' ($applyBoth.ExitCode -eq 0) $applyBoth.Output

        # 明示変更: OpenCode のみへ変更（Senpi 管理投影の対象別除去）
        $applyOC = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'apply' -Cwd $root -ExtraArgs @('-Hosts', 'opencode')
        $senpiProjectionGone = -not (Test-PathExists (Join-Path $root '.senpi\connection-demo'))
        # 非選択ホストの実ディレクトリ自体は非破壊で残る（管理投影のみが除去される）
        $senpiRootKeptAsRealDir = Test-PathExists (Join-Path $root '.senpi')
        $ocProjectionIntact = (Test-PathExists (Join-Path $root '.opencode\skills\agentdev-testskill')) -and
            (Test-PathExists (Join-Path $root '.opencode\plugins\agentdev-testplugin'))
        Assert-True 'TS-005 explicit change removes only the deselected host managed projection' `
            (($applyOC.ExitCode -eq 0) -and $senpiProjectionGone -and $senpiRootKeptAsRealDir -and $ocProjectionIntact) $applyOC.Output

        # 予測の一致: dry-run -Hosts opencode は stale 除去を予測しない（既に除去済み）
        $dryOC = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'dry-run' -Cwd $root -ExtraArgs @('-Hosts', 'opencode')
        Assert-True 'TS-005 dry-run predicts no stale removal after explicit change' `
            (($dryOC.ExitCode -eq 0) -and ($dryOC.Output -match 'No stale managed junctions to remove')) $dryOC.Output

        # 対象別除去: Senpi のみへ変更（OpenCode 管理投影を除去、保護資産は無傷）
        $protectedBeforeOCOnly = Get-ProtectedStateDigest -Root $root
        Assert-True 'TS-005 protected assets unchanged by the first removal' ($protectedBeforeOCOnly -eq $protectedBefore) ''
        $applySenpi = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'apply' -Cwd $root -ExtraArgs @('-Hosts', 'senpi')
        $ocProjectionGone = (-not (Test-PathExists (Join-Path $root '.opencode\skills\agentdev-testskill'))) -and
            (-not (Test-PathExists (Join-Path $root '.opencode\tools\agentdev-testtool'))) -and
            (-not (Test-PathExists (Join-Path $root '.opencode\plugins\agentdev-testplugin')))
        $senpiProjectionIntact = Test-PathExists (Join-Path $root '.senpi\connection-demo')
        Assert-True 'TS-005 per-target removal removes only OpenCode managed projections' `
            (($applySenpi.ExitCode -eq 0) -and $ocProjectionGone -and $senpiProjectionIntact) $applySenpi.Output

        $protectedAfter = Get-ProtectedStateDigest -Root $root
        Assert-True 'TS-005 protected assets (repo-local, third-party, extensions, AGENTS.md) unchanged across removals (REQ-099-012)' `
            ($protectedAfter -eq $protectedBefore) ''
    } finally {
        Remove-TempRepo $root
    }
}

function Invoke-Ts005IdempotentReapply {
    <#
    .SYNOPSIS
        TS-005 再実行: apply 再実行が不要な登録を増やさず、投影状態を変化させない
        （REQ-099-010、REQ-099-012）。両ホスト・片ホスト双方で確認する。
    #>
    Write-Host '=== TS-005 idempotent re-apply ==='
    foreach ($hostsSpec in @(@('both', @()), @('opencode', @('-Hosts', 'opencode')), @('senpi', @('-Hosts', 'senpi')))) {
        $labelHosts = $hostsSpec[0]
        $extraArgs = [string[]]$hostsSpec[1]
        $root = New-ConsumerRepo
        try {
            $apply1 = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'apply' -Cwd $root -ExtraArgs $extraArgs
            Assert-True "TS-005 idempotency [$labelHosts] first apply succeeds" ($apply1.ExitCode -eq 0) $apply1.Output
            $digest1 = Get-ProjectionStateDigest -Root $root

            $apply2 = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'apply' -Cwd $root -ExtraArgs $extraArgs
            $digest2 = Get-ProjectionStateDigest -Root $root
            Assert-True "TS-005 idempotency [$labelHosts] re-apply keeps the projection state identical (no unneeded registrations)" `
                (($apply2.ExitCode -eq 0) -and ($digest2 -eq $digest1) -and
                    ($apply2.Output -notmatch 'Removing stale managed junction')) $apply2.Output

            # apply 完了後の同一条件 check が乖離なしに収束する（同期完了条件）
            $check = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'check' -Cwd $root -ExtraArgs $extraArgs
            Assert-True "TS-005 idempotency [$labelHosts] check converges after apply" ($check.ExitCode -eq 0) $check.Output
        } finally {
            Remove-TempRepo $root
        }
    }
}

function Invoke-Ts005SelfSyncHosts {
    <#
    .SYNOPSIS
        TS-005 self-sync: 共通正本・両ホストの投影に整合する（REQ-099-010）。
        既定は現在の配置対象の維持、明示指定で Senpi 投影を含められる。
    #>
    Write-Host '=== TS-005 self-sync hosts integration ==='
    $root = New-SelfRepo
    try {
        $entry = Join-Path $root 'scripts\self-sync.ps1'
        # 既定（-Hosts 省略、新規）: OpenCode のみ（first-class reference harness）
        $apply1 = Invoke-EntryScript -ScriptPath $entry -Mode 'apply' -Cwd $root
        $ocProjected = (Test-PathExists (Join-Path $root '.opencode\commands\agentdev')) -and
            (Test-PathExists (Join-Path $root '.opencode\plugins\agentdev-testplugin'))
        $senpiNotPlaced = -not (Test-PathExists (Join-Path $root '.senpi\connection-demo'))
        Assert-True 'TS-005 self-sync default (fresh) places OpenCode only' `
            (($apply1.ExitCode -eq 0) -and $ocProjected -and $senpiNotPlaced) $apply1.Output

        # 明示指定 both: Senpi 接続領域を .senpi/ へ投影する
        $apply2 = Invoke-EntryScript -ScriptPath $entry -Mode 'apply' -Cwd $root -ExtraArgs @('-Hosts', 'both')
        $senpiProjected = Test-PathExists (Join-Path $root '.senpi\connection-demo')
        Assert-True 'TS-005 self-sync explicit both projects the Senpi host connection area' `
            (($apply2.ExitCode -eq 0) -and $senpiProjected) $apply2.Output

        # 冪等: 再実行で変化しない
        $digest1 = Get-ProjectionStateDigest -Root $root
        $apply3 = Invoke-EntryScript -ScriptPath $entry -Mode 'apply' -Cwd $root -ExtraArgs @('-Hosts', 'both')
        $digest2 = Get-ProjectionStateDigest -Root $root
        Assert-True 'TS-005 self-sync re-apply is idempotent' `
            (($apply3.ExitCode -eq 0) -and ($digest2 -eq $digest1)) $apply3.Output

        # 対象別除去: opencode へ明示変更し Senpi 管理投影のみ除去
        $apply4 = Invoke-EntryScript -ScriptPath $entry -Mode 'apply' -Cwd $root -ExtraArgs @('-Hosts', 'opencode')
        $senpiRemoved = -not (Test-PathExists (Join-Path $root '.senpi\connection-demo'))
        $ocIntact = Test-PathExists (Join-Path $root '.opencode\skills\agentdev-testskill')
        Assert-True 'TS-005 self-sync explicit change removes only the deselected host managed projection' `
            (($apply4.ExitCode -eq 0) -and $senpiRemoved -and $ocIntact) $apply4.Output

        $check = Invoke-EntryScript -ScriptPath $entry -Mode 'check' -Cwd $root
        Assert-True 'TS-005 self-sync check converges' ($check.ExitCode -eq 0) $check.Output
    } finally {
        Remove-TempRepo $root
    }
}

# ============================================================
# TS-006 診断区別
# ============================================================

function Invoke-Ts006DiagnosticSeparation {
    <#
    .SYNOPSIS
        TS-006: CLI 未導入環境で配置を実行し、配置成功と実行確認不能の診断が
        区別されること（REQ-099-011）。OmO 版報告を根拠とした配置先自動変更と、
        未検証組合せの対応済み宣言が出ないこと。
    #>
    Write-Host '=== TS-006 CLI-less placement and diagnostic separation ==='

    # (1) opencode / omo 両方が PATH に存在しない環境でも両ホスト配置が成功する
    $root = New-ConsumerRepo
    try {
        New-ProtectedAssets -Root $root
        $protectedBefore = Get-ProtectedStateDigest -Root $root
        $r = Invoke-EntryScriptWithMinimalPath -ScriptPath $InstallScript -Mode 'apply' -Cwd $root -ExtraArgs @('-Hosts', 'both')
        $ocProjected = Test-PathExists (Join-Path $root '.opencode\skills\agentdev-testskill')
        $scProjected = Test-PathExists (Join-Path $root '.senpi\connection-demo')
        Assert-True 'TS-006 (1) CLI-less environment: placement succeeds for both hosts' `
            (($r.ExitCode -eq 0) -and $ocProjected -and $scProjected) $r.Output

        # (2) 診断メッセージが配置検査と区別され、CLI 未導入を実行確認不能として報告する
        Assert-True 'TS-006 (2) runtime diagnostics section is separated from placement inspection' `
            ($r.Output -match 'Runtime diagnostics \(placement inspection is reported separately above\)') $r.Output
        Assert-True 'TS-006 (2) OpenCode CLI absence is reported as informational diagnostic' `
            ($r.Output -match '\[INFO\] Runtime diagnostic: OpenCode CLI \(opencode\): not found in PATH') $r.Output
        Assert-True 'TS-006 (2) OmO CLI absence is reported as informational diagnostic' `
            ($r.Output -match '\[INFO\] Runtime diagnostic: OmO native CLI \(omo\): not found in PATH') $r.Output
        Assert-True 'TS-006 (2) diagnostics never change placement targets' `
            ($r.Output -match 'Runtime diagnostics never select or change placement targets') $r.Output

        # (3) 未検証組合せの対応済み宣言が出ない
        Assert-True 'TS-006 (3) no verified-combination claim is reported' `
            ($r.Output -notmatch '対応済み組合せ|supported combination|verified compatible') $r.Output

        # (4) 診断は配置検査の判定（divergence / 終了コード）に反映されない
        $check = Invoke-EntryScriptWithMinimalPath -ScriptPath $InstallScript -Mode 'check' -Cwd $root -ExtraArgs @('-Hosts', 'both')
        Assert-True 'TS-006 (4) check converges in the CLI-less environment (diagnostics not counted as divergence)' `
            (($check.ExitCode -eq 0) -and ($check.Output -match 'No divergence detected')) $check.Output

        # (5) CLI の有無で配置対象が変わらない（OmO 版報告による配置先自動振分けなし）
        $protectedAfter = Get-ProtectedStateDigest -Root $root
        Assert-True 'TS-006 (5) protected assets unchanged by CLI-less placement' ($protectedAfter -eq $protectedBefore) ''
        $senpiPlaced = Test-PathExists (Join-Path $root '.senpi\connection-demo')
        Assert-True 'TS-006 (5) Senpi placement is not suppressed by CLI detection' $senpiPlaced ''
    } finally {
        Remove-TempRepo $root
    }

    # (6) 配置対象未指定時の検出も CLI の有無に依存しない（配置先の管理物に基づく）
    $root2 = New-ConsumerRepo
    try {
        $setup = Invoke-EntryScript -ScriptPath $InstallScript -Mode 'apply' -Cwd $root2 -ExtraArgs @('-Hosts', 'opencode')
        Assert-True 'TS-006 (6) setup opencode-only apply succeeds' ($setup.ExitCode -eq 0) $setup.Output
        $checkNoCli = Invoke-EntryScriptWithMinimalPath -ScriptPath $InstallScript -Mode 'check' -Cwd $root2
        Assert-True 'TS-006 (6) omitted check in CLI-less environment keeps detected placement targets (OpenCode のみ)' `
            (($checkNoCli.ExitCode -eq 0) -and ($checkNoCli.Output -match 'OpenCode のみ')) $checkNoCli.Output
    } finally {
        Remove-TempRepo $root2
    }
}

# ============================================================
# Main
# ============================================================

Write-Host "installer host projection tests: $TestFilePath"
Invoke-Ts005ModeHostsMatrix
Invoke-Ts005FreshInstallDefaultsToBoth
Invoke-Ts005ExistingUpdateKeepsHosts
Invoke-Ts005ExplicitChangeAndRemoval
Invoke-Ts005IdempotentReapply
Invoke-Ts005SelfSyncHosts
Invoke-Ts006DiagnosticSeparation

Write-Host ''
if ($script:FailureCount -gt 0) {
    Write-Host "FAILED: $script:FailureCount assertion(s) failed."
    exit 1
}
Write-Host 'PASSED: all installer host projection tests passed.'
exit 0
