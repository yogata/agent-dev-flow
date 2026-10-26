<#
.SYNOPSIS
    REQ-009-053 導入時整合検査（check モード）の機械工程 script 実行時前提検証の
    実スクリプト挙動テスト（Case #3862 テスト戦略 TS-002/TS-003/TS-006 の
    installer 面検証）。

.DESCRIPTION
    一時 consumer 型リポジトリ上で scripts/install.ps1 -Mode apply により完全
    provisions 環境を構築した上で -Mode check を実行し、配布物の主要機械工程 script
    （定義PR準備、定義PR受入検査、クローズ機械工程、横断依存検査）の実行時前提検証が
    実 consumer 条件 fixture により成立すること、前提欠落が divergence 報告と非ゼロ終了
    で検出されること、および検証が管理対象ファイルとディレクトリ状態を変更しないこと
    （REQ-050-005 非破壊契約）を検証する。

    検証観点（TS-002/TS-003/TS-006）:
    - (1) 構造検査: check モードに機械工程前提検証セクション・検証専用経路
          （--validate-input）呼出し・project root 内検査入力配置・横断依存の
          応答解析述語が実装されている
    - (2) 完全 provisions 正例: 4 script の検証が [OK] で通過し、installer 全体が
          exit 0 で受入する。検証実行前後で git status が同一、git diff --quiet が
          終了コード 0、検査入力の一時領域（.agentdev/integrity/reports）に残留なし
    - (3) script 不在環境: 不在 script が [DIVERGENCE] で報告され、他 script の
          検証は継続する（1本の不在で他の検証を止めない）
    - (4) 依存ツール（bun）不在環境: 検証不能として [DIVERGENCE] 報告され、
          検証実行失敗が成功扱いにならない
    - (5) 入口契約の破綻（script が検証専用経路の応答契約どおりに応答しない）:
          [DIVERGENCE] で報告され、検証実行失敗が成功扱いにならない
    - (6) 必須ゲート実行体不在環境（正例から前提のみ欠落）: 実 consumer 条件 fixture が
          参照するゲート実行体（agentdev-traceability の checker）が不在の場合、
          検証専用経路の [DIVERGENCE] と非ゼロ終了で検出される
    - (7) TS-003 runtime 副作用なし証明（git/gh shim）: PATH 分離した git/gh
          記録 shim の下で check を実行し、shim 呼出し記録ゼロ・前提検証 [OK]・
          管理対象内容とディレクトリ状態の同一性を確認する

    実行方法:
        pwsh -NoProfile -File scripts/self/release/install-check-mechanical-prerequisites.Tests.ps1
    終了コード: 0 = 全合格、1 = 不合格あり（不合格アサーションを標準出力へ報告する）。

    前提: Windows（junction 使用）、pwsh 7、git と bun コマンドが利用可能なこと。
    メインリポジトリの管理対象ファイルは変更しない（変異は一時リポジトリの実
    ディレクトリコピー側へ適用する。一時ディレクトリのみ使用）。
#>

# ADF-COVERS(verification): REQ-009-053

#Requires -Version 7.0

$ErrorActionPreference = 'Stop'

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..')).Path
$InstallScript = Join-Path $RepoRoot 'scripts\install.ps1'
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

$PwshExe = (Get-Command pwsh -ErrorAction Stop).Source

function Invoke-Check {
    <#
    .SYNOPSIS
        consumer 型一時リポジトリ上で install.ps1 -Mode check を子 pwsh プロセスで
        実行し、終了コードと出力を返す。
    #>
    param([string]$Cwd, [string]$PathPrefix = '')
    $prev = $PWD.Path
    Push-Location -LiteralPath $Cwd
    try {
        if ($PathPrefix) {
            $output = & $PwshExe -NoProfile -NonInteractive -Command "`$env:PATH = '$PathPrefix' + `$env:PATH; & '$InstallScript' -Mode check" 2>&1 | Out-String
        } else {
            $output = & $PwshExe -NoProfile -NonInteractive -File $InstallScript -Mode 'check' 2>&1 | Out-String
        }
        $code = $LASTEXITCODE
    } finally {
        Pop-Location
    }
    [PSCustomObject]@{ ExitCode = $code; Output = $output }
}

function Invoke-Apply {
    <#
    .SYNOPSIS
        consumer 型一時リポジトリ上で install.ps1 -Mode apply を実行し、完全 provisions
        環境（全 skill・tools・plugins 投影）を構築する（TS-002 正例環境）。
    #>
    param([string]$Cwd)
    $prev = $PWD.Path
    Push-Location -LiteralPath $Cwd
    try {
        $output = & $PwshExe -NoProfile -NonInteractive -File $InstallScript -Mode 'apply' 2>&1 | Out-String
        $code = $LASTEXITCODE
    } finally {
        Pop-Location
    }
    [PSCustomObject]@{ ExitCode = $code; Output = $output }
}

function New-TempRepo {
    param([string]$Prefix)
    $root = Join-Path $RepoRoot ".agentdev\tmp\$Prefix-$([guid]::NewGuid().ToString('N'))"
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

function Convert-PlacedSkillToRealCopy {
    <#
    .SYNOPSIS
        apply が配置した skill の junction を実ディレクトリコピーへ置き換える。
        以降の変異（script の移動・破壊）が正本側へ波及しないようにする（producer
        正本非破壊、TS-002 不足条件構成の前提）。
    #>
    param([string]$Root, [string]$SkillName)
    $link = Join-Path $Root ".opencode\skills\$SkillName"
    $target = (Get-Item -LiteralPath $link).Target
    [System.IO.Directory]::Delete($link, $false)
    robocopy $target $link /E /XD node_modules /NFL /NDL /NJH /NJS /NP | Out-Null
    if ($LASTEXITCODE -ge 8) { throw "robocopy failed for $SkillName (exit=$LASTEXITCODE)" }
}

function New-MechanicalProbeConsumerRepo {
    <#
    .SYNOPSIS
        機械工程前提検証の検証用 consumer 型一時リポジトリを構築する。
        チェックアウト（.agentdev-plugin 正本への junction）と scripts コピーと
        git init を用意し、完全 provisions は install.ps1 -Mode apply で構築する。
    #>
    param([string]$Prefix = 'adf-mech-prereq')
    $root = New-TempRepo $Prefix
    New-TestJunction -LinkPath (Join-Path $root '.agentdev-plugin\src') -TargetPath (Join-Path $RepoRoot 'src')
    New-Item -ItemType Directory -Path (Join-Path $root 'scripts\consumer') -Force | Out-Null
    Copy-Item -LiteralPath $InstallScript -Destination (Join-Path $root 'scripts\install.ps1')
    Copy-Item -LiteralPath (Join-Path $RepoRoot 'scripts\consumer\common.ps1') -Destination (Join-Path $root 'scripts\consumer\common.ps1')
    git init -q $root
    if ($LASTEXITCODE -ne 0) { throw "git init failed: $root" }
    return $root
}

function Get-GitStatusText {
    <#
    .SYNOPSIS
        一時リポジトリの git status --porcelain 出力を返す（非破壊性の前後比較用）。
    #>
    param([string]$Root)
    $prev = $PWD.Path
    Push-Location -LiteralPath $Root
    try {
        return (git status --porcelain 2>&1 | Out-String)
    } finally {
        Pop-Location
    }
}

function Test-GitTreeUnchanged {
    <#
    .SYNOPSIS
        検証実行で管理対象ファイルが変更されないことを git diff --quiet の
        終了コード 0 で確認する（TS-002 の合格条件）。
    #>
    param([string]$Root)
    $prev = $PWD.Path
    Push-Location -LiteralPath $Root
    try {
        git diff --quiet 2>$null
        return ($LASTEXITCODE -eq 0)
    } finally {
        Pop-Location
    }
}

function Get-DirectorySnapshot {
    <#
    .SYNOPSIS
        ディレクトリ状態の同一性比較用のスナップショット（TS-003 の合格条件）。
        実ファイル相対パス一覧に各ファイルの SHA256 内容ハッシュを含め、空ディレクトリ
        も相対パスで列挙する（ファイル名のみ・git 未追跡比較のみでは検出できない
        内容変更と空ディレクトリの消失を検出対象に含める）。
    #>
    param([string]$Root)
    $files = (Get-ChildItem -LiteralPath $Root -Recurse -File -Force |
        ForEach-Object {
            $hash = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash
            "$($_.FullName.Substring($Root.Length)):$hash"
        } |
        Sort-Object)
    $emptyDirs = (Get-ChildItem -LiteralPath $Root -Recurse -Directory -Force |
        ForEach-Object { "DIR:$($_.FullName.Substring($Root.Length))" } |
        Sort-Object)
    return (($files + $emptyDirs) -join "`n")
}

# ============================================================
# TS-002 / TS-003 / TS-006 機械工程 script 実行時前提検証（REQ-009-053）
# ============================================================

function Invoke-Ts002MechanicalPrerequisites {
    Write-Host '=== TS-002 mechanical-step script prerequisite check (REQ-009-053) ==='

    # (1) 構造検査: check モードに機械工程前提検証と検証専用経路・配置指針・応答解析が実装されている
    $scriptText = [System.IO.File]::ReadAllText($InstallScript, [System.Text.Encoding]::UTF8)
    Assert-True 'TS-002 (1) check mode contains the mechanical-step prerequisites section' `
        ($scriptText -match '--- Mechanical-step script prerequisites ---') $InstallScript
    Assert-True 'TS-002 (1) probe contract covers the four mechanical-step scripts' `
        (($scriptText -match 'prepare_definition_pr\.ts') -and
         ($scriptText -match 'accept_definition_checks\.ts') -and
         ($scriptText -match 'close_mechanical_steps\.ts') -and
         ($scriptText -match 'inspect_cross_dependencies\.ts')) $InstallScript
    Assert-True 'TS-002 (1) probes invoke the verification-only entry (--validate-input)' `
        ($scriptText -match '--validate-input') $InstallScript
    Assert-True 'TS-006 (1) probe inputs are placed under the project root (.agentdev/integrity/reports), not the OS temp area' `
        (($scriptText -match '\.agentdev\\integrity\\reports') -and
         ($scriptText -notmatch 'GetTempPath\(\)\s*\)\s*"adf-install-check')) $InstallScript
    Assert-True 'TS-001 (1) cross-dependency response analysis predicates are implemented' `
        (($scriptText -match 'population_count') -and
         ($scriptText -match 'detection_unavailable') -and
         ($scriptText -match 'read_ok')) $InstallScript
    Assert-True 'TS-005 (1) section summary line reports per-section results independently' `
        ($scriptText -match 'Mechanical-step prerequisites: .* target\(s\), .* divergence\(s\)') $InstallScript

    # (2) 完全 provisions 正例: apply 後に 4 script の検証が [OK] で通過し、installer 全体が exit 0、非破壊である
    $root = New-MechanicalProbeConsumerRepo
    try {
        $prov = Invoke-Apply -Cwd $root
        if ($prov.ExitCode -ne 0) {
            throw "apply provisioning failed (exit=$($prov.ExitCode)): $($prov.Output.Substring(0, [Math]::Min(300, $prov.Output.Length)))"
        }
        $statusBefore = Get-GitStatusText -Root $root
        $dirBefore = Get-DirectorySnapshot -Root $root
        $r = Invoke-Check -Cwd $root
        Assert-True 'TS-002 (2) all three validate-input scripts pass with consumer-condition fixtures' `
            (($r.Output -split "`n" | Where-Object { $_ -match '\[OK\] Mechanical-step script prerequisite \(validate-input\):' }).Count -eq 3) $r.Output
        Assert-True 'TS-002 (2) cross-dependency passes the response-analysis predicates' `
            (($r.Output -split "`n" | Where-Object { $_ -match '\[OK\] Mechanical-step script prerequisite \(cross-dependency\):' }).Count -eq 1) $r.Output
        Assert-True 'TS-002 (2) no mechanical-step divergence is reported in the fully provisioned environment' `
            ($r.Output -notmatch '\[DIVERGENCE\] Mechanical-step') $r.Output
        Assert-True 'TS-002 (2) installer overall accepts the fully provisioned environment with exit 0' `
            ($r.ExitCode -eq 0) "exit=$($r.ExitCode) output=$($r.Output.Substring(0, [Math]::Min(400, $r.Output.Length)))"
        Assert-True 'TS-005 (2) section summary reports 4 targets with 0 divergences' `
            ($r.Output -match 'Mechanical-step prerequisites: 4 target\(s\), 0 divergence\(s\)') $r.Output
        $statusAfter = Get-GitStatusText -Root $root
        Assert-True 'TS-002 (2) git status is unchanged by the check run' `
            ($statusAfter -eq $statusBefore) ($statusAfter -replace [regex]::Escape($statusBefore), '(diff)')
        Assert-True 'TS-002 (2) git diff --quiet exits 0 after the check run (no managed-file change)' `
            (Test-GitTreeUnchanged -Root $root) $r.Output
        Assert-True 'TS-006 (2) probe input temp area leaves no residue under .agentdev' `
            (-not (Test-Path -LiteralPath (Join-Path $root '.agentdev'))) (Join-Path $root '.agentdev')
        Assert-True 'TS-003 (2) directory state is identical before and after the check run' `
            ((Get-DirectorySnapshot -Root $root) -eq $dirBefore) 'directory snapshot differs'
    } finally {
        Remove-TempRepo $root
    }

    # (3) script 不在: 不在 script が [DIVERGENCE] で報告され、他の検証は継続する
    #     （変異は実ディレクトリコピー側へ適用し、producer 正本へ波及させない）
    $root = New-MechanicalProbeConsumerRepo
    try {
        $prov = Invoke-Apply -Cwd $root
        if ($prov.ExitCode -ne 0) {
            throw "apply provisioning failed (exit=$($prov.ExitCode))"
        }
        Convert-PlacedSkillToRealCopy -Root $root -SkillName 'agentdev-workflow-case-close'
        $missingScript = Join-Path $root '.opencode\skills\agentdev-workflow-case-close\scripts\src\close_mechanical_steps.ts'
        Move-Item -LiteralPath $missingScript -Destination (Join-Path $root 'close_mechanical_steps.ts.bak')
        $r = Invoke-Check -Cwd $root
        Assert-True 'TS-002 (3) missing mechanical-step script is reported as divergence' `
            ($r.Output -match '\[DIVERGENCE\] Mechanical-step script missing: agentdev-workflow-case-close/scripts/src/close_mechanical_steps\.ts') $r.Output
        Assert-True 'TS-002 (3) remaining scripts are still verified after one missing script' `
            (($r.Output -split "`n" | Where-Object { $_ -match '\[OK\] Mechanical-step script prerequisite \((validate-input|cross-dependency)\):' }).Count -eq 3) $r.Output
        Assert-True 'TS-002 (3) check exits non-zero when a mechanical-step script is missing' `
            ($r.ExitCode -ne 0) "exit=$($r.ExitCode)"
    } finally {
        Remove-TempRepo $root
    }

    # (4) 依存ツール（bun）不在: 検証不能として [DIVERGENCE] 報告され、成功扱いにならない
    $root = New-MechanicalProbeConsumerRepo
    try {
        $prov = Invoke-Apply -Cwd $root
        if ($prov.ExitCode -ne 0) {
            throw "apply provisioning failed (exit=$($prov.ExitCode))"
        }
        $minimalPath = "$env:SystemRoot\System32"
        $prev = $PWD.Path
        Push-Location -LiteralPath $root
        try {
            $output = & $PwshExe -NoProfile -NonInteractive -Command "`$env:PATH = '$minimalPath'; & '$InstallScript' -Mode check" 2>&1 | Out-String
            $code = $LASTEXITCODE
        } finally {
            Pop-Location
        }
        Assert-True 'TS-002 (4) missing bun runtime is reported as verification-unavailable divergence (not success)' `
            ($output -match '\[DIVERGENCE\] Mechanical-step script runtime prerequisite \(bun\) not found in PATH') $output
        Assert-True 'TS-002 (4) check exits non-zero when the mechanical-step runtime is unavailable' `
            ($code -ne 0) "exit=$code"
    } finally {
        Remove-TempRepo $root
    }

    # (5) 入口契約の破綻: script が検証専用経路の応答契約どおりに応答しない場合、
    #     [DIVERGENCE] 報告され、成功扱いにならない（変異は実ディレクトリコピー側へ適用）
    $root = New-MechanicalProbeConsumerRepo
    try {
        $prov = Invoke-Apply -Cwd $root
        if ($prov.ExitCode -ne 0) {
            throw "apply provisioning failed (exit=$($prov.ExitCode))"
        }
        Convert-PlacedSkillToRealCopy -Root $root -SkillName 'agentdev-workflow-case-close'
        $brokenScript = Join-Path $root '.opencode\skills\agentdev-workflow-case-close\scripts\src\close_mechanical_steps.ts'
        [System.IO.File]::WriteAllText($brokenScript,
            "process.stderr.write(`"fatal: simulated entry-contract breakage`n`");process.exit(3);`n",
            [System.Text.Encoding]::UTF8)
        $r = Invoke-Check -Cwd $root
        Assert-True 'TS-002 (5) verification-entry contract breakage is reported as divergence (not success)' `
            ($r.Output -match '\[DIVERGENCE\] Mechanical-step script prerequisite contract mismatch: agentdev-workflow-case-close/scripts/src/close_mechanical_steps\.ts') $r.Output
        Assert-True 'TS-002 (5) check exits non-zero on entry-contract breakage' `
            ($r.ExitCode -ne 0) "exit=$($r.ExitCode)"
    } finally {
        Remove-TempRepo $root
    }

    # (6) 必須ゲート実行体不在（正例から前提のみ欠落）: fixture が参照するゲート実行体
    #     （agentdev-traceability の checker）が配置に存在しない場合、検証専用経路の
    #     [DIVERGENCE] と非ゼロ終了で検出される
    $root = New-MechanicalProbeConsumerRepo
    try {
        $prov = Invoke-Apply -Cwd $root
        if ($prov.ExitCode -ne 0) {
            throw "apply provisioning failed (exit=$($prov.ExitCode))"
        }
        Remove-Item -LiteralPath (Join-Path $root '.opencode\skills\agentdev-traceability') -Recurse -Force
        $r = Invoke-Check -Cwd $root
        Assert-True 'TS-002 (6) missing gate executable is detected as prerequisite divergence via validate-input' `
            (($r.Output -split "`n" | Where-Object { $_ -match '\[DIVERGENCE\] Mechanical-step script prerequisite contract mismatch: .*expected: exit 0 with a validation report' }).Count -eq 3) $r.Output
        Assert-True 'TS-002 (6) cross-dependency probe itself still passes (its fixture does not reference the missing gate)' `
            (($r.Output -split "`n" | Where-Object { $_ -match '\[OK\] Mechanical-step script prerequisite \(cross-dependency\):' }).Count -eq 1) $r.Output
        Assert-True 'TS-002 (6) check exits non-zero when a required gate executable is missing' `
            ($r.ExitCode -ne 0) "exit=$($r.ExitCode)"
    } finally {
        Remove-TempRepo $root
    }

    # (7) TS-003 runtime 副作用なし証明（PATH 分離した git/gh shim）: 呼出しを記録し
    #     呼出し検出時に失敗する shim を PATH 先頭へ配置して check を実行し、shim 記録
    #     ゼロ・前提検証 [OK]・前後同一性を確認する
    $root = New-MechanicalProbeConsumerRepo
    try {
        $prov = Invoke-Apply -Cwd $root
        if ($prov.ExitCode -ne 0) {
            throw "apply provisioning failed (exit=$($prov.ExitCode))"
        }
        $shimDir = Join-Path $root 'shim-bin'
        $shimLog = Join-Path $shimDir 'shim-invocations.log'
        New-Item -ItemType Directory -Path $shimDir -Force | Out-Null
        foreach ($tool in @('git', 'gh')) {
            [System.IO.File]::WriteAllText((Join-Path $shimDir "$tool.cmd"),
                "@echo $tool-shim-invocation >> `"$shimLog`"`r`nexit 1`r`n",
                [System.Text.Encoding]::ASCII)
        }
        $statusBefore = Get-GitStatusText -Root $root
        $snapshotBefore = Get-DirectorySnapshot -Root $root
        $r = Invoke-Check -Cwd $root -PathPrefix "$shimDir;"
        $shimRecords = if (Test-Path -LiteralPath $shimLog) { (Get-Content -LiteralPath $shimLog | Measure-Object).Count } else { 0 }
        Assert-True 'TS-003 (7) git/gh shim records zero invocations during the whole check run' `
            ($shimRecords -eq 0) "shim log: $shimLog records=$shimRecords"
        Assert-True 'TS-003 (7) mechanical-step prerequisites still pass under the shimmed PATH' `
            (($r.Output -split "`n" | Where-Object { $_ -match '\[OK\] Mechanical-step script prerequisite \((validate-input|cross-dependency)\):' }).Count -eq 4) $r.Output
        Assert-True 'TS-003 (7) installer overall still accepts the environment (exit 0) under the shimmed PATH' `
            ($r.ExitCode -eq 0) "exit=$($r.ExitCode)"
        Assert-True 'TS-003 (7) git status is unchanged by the shimmed check run' `
            ((Get-GitStatusText -Root $root) -eq $statusBefore) 'git status differs'
        Assert-True 'TS-003 (7) hashes and directory structure are unchanged under shims' `
            ((Get-DirectorySnapshot -Root $root) -eq $snapshotBefore) 'content or directories differ'
    } finally {
        Remove-TempRepo $root
    }

    $root = New-MechanicalProbeConsumerRepo
    try {
        $prov = Invoke-Apply -Cwd $root
        if ($prov.ExitCode -ne 0) { throw 'apply failed for response tests' }
        Convert-PlacedSkillToRealCopy -Root $root -SkillName 'agentdev-workflow-case-open'
        $script = Join-Path $root '.opencode\skills\agentdev-workflow-case-open\scripts\src\inspect_cross_dependencies.ts'
        $valid = '{"ok":true,"scan":{"population_count":1},"condition_a":{"count":0},"condition_b":[{"file_results":[{"read_ok":true}]}],"detection_unavailable":[]}'
        foreach ($mutation in @('missing-unavailable', 'empty-areas', 'missing-files', 'false-read', 'string-read', 'string-ok')) {
            $report = $valid | ConvertFrom-Json -AsHashtable
            switch ($mutation) {
                'missing-unavailable' { $report.Remove('detection_unavailable') }
                'empty-areas' { $report.condition_b = @() }
                'missing-files' { $report.condition_b = @(@{}) }
                'false-read' { $report.condition_b[0].file_results[0].read_ok = $false }
                'string-read' { $report.condition_b[0].file_results[0].read_ok = 'true' }
                'string-ok' { $report.ok = 'true' }
            }
            $json = $report | ConvertTo-Json -Depth 10 -Compress
            [System.IO.File]::WriteAllText($script, "process.stdout.write(JSON.stringify($json));", [System.Text.Encoding]::UTF8)
            $r = Invoke-Check -Cwd $root
            Assert-True "TS-001 (8) rejects malformed response $mutation" `
                (($r.ExitCode -ne 0) -and ($r.Output -match 'contract mismatch: .*inspect_cross_dependencies')) $r.Output
        }
    } finally {
        Remove-TempRepo $root
    }

    $root = New-MechanicalProbeConsumerRepo
    $outside = New-TempRepo 'adf-mechanical-outside'
    try {
        $prov = Invoke-Apply -Cwd $root
        if ($prov.ExitCode -ne 0) { throw 'apply failed for containment test' }
        [System.IO.File]::WriteAllText((Join-Path $outside 'sentinel.txt'), 'unchanged', [System.Text.Encoding]::UTF8)
        $before = Get-DirectorySnapshot -Root $outside
        New-TestJunction -LinkPath (Join-Path $root '.agentdev') -TargetPath $outside
        $r = Invoke-Check -Cwd $root
        Assert-True 'TS-006 (9) rejects ancestor junction before any probe writes' `
            (($r.ExitCode -ne 0) -and ($r.Output -match 'probe ancestor is a junction/reparse point')) $r.Output
        Assert-True 'TS-002 (9) external target content and directories are unchanged' `
            ((Get-DirectorySnapshot -Root $outside) -eq $before) 'external target changed'
        [System.IO.Directory]::Delete((Join-Path $root '.agentdev'), $false)
    } finally {
        Remove-TempRepo $root
        Remove-TempRepo $outside
    }

    $root = New-MechanicalProbeConsumerRepo
    $lockJob = $null
    try {
        $prov = Invoke-Apply -Cwd $root
        if ($prov.ExitCode -ne 0) { throw 'apply failed for cleanup test' }
        $ready = Join-Path $root 'watcher-ready'
        $lockJob = Start-Job -ArgumentList $root, $ready -ScriptBlock {
            param($Root, $Ready)
            [System.IO.File]::WriteAllText($Ready, 'ready')
            $until = [DateTime]::UtcNow.AddSeconds(30)
            while ([DateTime]::UtcNow -lt $until) {
                $file = Get-ChildItem -LiteralPath (Join-Path $Root '.agentdev\integrity\reports') -Filter 'cross-dependency.json' -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
                if ($file) {
                    $handle = [System.IO.File]::Open($file.FullName, 'Open', 'Read', 'ReadWrite')
                    try { Start-Sleep -Seconds 12 } finally { $handle.Dispose() }
                    break
                }
                Start-Sleep -Milliseconds 5
            }
        }
        $until = [DateTime]::UtcNow.AddSeconds(10)
        while (-not (Test-Path -LiteralPath $ready) -and [DateTime]::UtcNow -lt $until) { Start-Sleep -Milliseconds 20 }
        if (-not (Test-Path -LiteralPath $ready)) { throw 'cleanup watcher did not start' }
        $r = Invoke-Check -Cwd $root
        Assert-True 'TS-002 (10) locked probe cleanup surfaces divergence and nonzero exit' `
            (($r.ExitCode -ne 0) -and ($r.Output -match 'probe input cleanup failed')) $r.Output
        Wait-Job $lockJob | Out-Null
        Receive-Job $lockJob | Out-Null
    } finally {
        if ($lockJob) { Remove-Job $lockJob -Force }
        Remove-TempRepo $root
    }
}

# ============================================================
# Main
# ============================================================

Write-Host "install check mechanical prerequisites tests: $TestFilePath"
Invoke-Ts002MechanicalPrerequisites

Write-Host ''
if ($script:FailureCount -gt 0) {
    Write-Host "FAILED: $script:FailureCount assertion(s) failed."
    exit 1
}
Write-Host 'PASSED: all install check mechanical prerequisites tests passed.'
exit 0
