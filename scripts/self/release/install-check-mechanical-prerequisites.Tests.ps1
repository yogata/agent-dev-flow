<#
.SYNOPSIS
    REQ-009-053 導入時整合検査（check モード）の機械工程 script 実行時前提検証の
    実スクリプト挙動テスト（Issue #3853 テスト戦略 TS-002）。

.DESCRIPTION
    一時 consumer 型リポジトリ上で scripts/install.ps1 -Mode check を実行し、
    配布物の主要な機械工程 script（定義PR準備、定義PR受入検査、クローズ機械工程、
    横断依存検査）の実行時前提の不一致が divergence 報告で検出されること、および
    検証が管理対象ファイルを変更しないこと（REQ-050-005 非破壊契約）を検証する。

    検証観点（TS-002）:
    - (1) check モードに機械工程 script 前提検証セクションが含まれる（構造検査）
    - (2) 前提が揃った環境: 4 script の入力検証 dry-run プローブが [OK] で通過し、
          検証実行前後で git status が同一、git diff --quiet が終了コード 0
    - (3) script 不在環境: 不在 script が [DIVERGENCE] で報告され、他 script の
          検証は継続する（1本の不在で他の検証を止めない）
    - (4) 依存ツール（bun）不在環境: 検証不能として [DIVERGENCE] 報告され、
          検証実行失敗が成功扱いにならない
    - (5) 入口契約の破綻（script が入力検証契約どおりに応答しない）:
          [DIVERGENCE] で報告され、検証実行失敗が成功扱いにならない

    実行方法:
        pwsh -NoProfile -File scripts/self/release/install-check-mechanical-prerequisites.Tests.ps1
    終了コード: 0 = 全合格、1 = 不合格あり（不合格アサーションを標準出力へ報告する）。

    前提: Windows（junction 使用）、pwsh 7、git と bun コマンドが利用可能なこと。
    メインリポジトリ・実ユーザー環境には一切書き込まない（一時ディレクトリのみ）。
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
    param([string]$Cwd)
    $prev = $PWD.Path
    Push-Location -LiteralPath $Cwd
    try {
        $output = & $PwshExe -NoProfile -NonInteractive -File $InstallScript -Mode 'check' 2>&1 | Out-String
        $code = $LASTEXITCODE
    } finally {
        Pop-Location
    }
    [PSCustomObject]@{ ExitCode = $code; Output = $output }
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

function New-MechanicalProbeConsumerRepo {
    <#
    .SYNOPSIS
        機械工程前提検証の検証用 consumer 型一時リポジトリを構築する。
        機械工程 script を参照できる最小構成（.agentdev-plugin 正本への junction +
        機械工程 3 skill の投影 junction + scripts コピー + git init）とする。
    #>
    param([string]$Prefix = 'adf-mech-prereq')
    $root = New-TempRepo $Prefix
    New-TestJunction -LinkPath (Join-Path $root '.agentdev-plugin\src') -TargetPath (Join-Path $RepoRoot 'src')
    foreach ($skill in @('agentdev-workflow-case-open', 'agentdev-workflow-case-ready', 'agentdev-workflow-case-close')) {
        New-TestJunction -LinkPath (Join-Path $root ".opencode\skills\$skill") -TargetPath (Join-Path $RepoRoot "src\common\skills\$skill")
    }
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

# ============================================================
# TS-002 機械工程 script 実行時前提検証（REQ-009-053）
# ============================================================

function Invoke-Ts002MechanicalPrerequisites {
    Write-Host '=== TS-002 mechanical-step script prerequisite check (REQ-009-053) ==='

    # (1) 構造検査: check モードに機械工程前提検証が実装されている
    $scriptText = [System.IO.File]::ReadAllText($InstallScript, [System.Text.Encoding]::UTF8)
    Assert-True 'TS-002 (1) check mode contains the mechanical-step prerequisites section' `
        ($scriptText -match '--- Mechanical-step script prerequisites ---') $InstallScript
    Assert-True 'TS-002 (1) probe contract covers the four mechanical-step scripts' `
        (($scriptText -match 'prepare_definition_pr\.ts') -and
         ($scriptText -match 'accept_definition_checks\.ts') -and
         ($scriptText -match 'close_mechanical_steps\.ts') -and
         ($scriptText -match 'inspect_cross_dependencies\.ts')) $InstallScript

    # (2) 正常系: 前提が揃った環境で 4 script のプローブが [OK] で通過し、非破壊である
    $root = New-MechanicalProbeConsumerRepo
    try {
        $statusBefore = Get-GitStatusText -Root $root
        $r = Invoke-Check -Cwd $root
        Assert-True 'TS-002 (2) all four mechanical-step scripts pass the input-validation dry-run probes' `
            (($r.Output -split "`n" | Where-Object { $_ -match '\[OK\] Mechanical-step script prerequisite \(input-validation dry-run\):' }).Count -eq 4) $r.Output
        Assert-True 'TS-002 (2) no mechanical-step divergence is reported in the prepared environment' `
            ($r.Output -notmatch '\[DIVERGENCE\] Mechanical-step') $r.Output
        $statusAfter = Get-GitStatusText -Root $root
        Assert-True 'TS-002 (2) git status is unchanged by the check run' `
            ($statusAfter -eq $statusBefore) ($statusAfter -replace [regex]::Escape($statusBefore), '(diff)')
        Assert-True 'TS-002 (2) git diff --quiet exits 0 after the check run (no managed-file change)' `
            (Test-GitTreeUnchanged -Root $root) $r.Output
    } finally {
        Remove-TempRepo $root
    }

    # (3) script 不在: 不在 script が [DIVERGENCE] で報告され、他の検証は継続する
    $root = New-MechanicalProbeConsumerRepo
    try {
        $missingScript = Join-Path $RepoRoot 'src\common\skills\agentdev-workflow-case-close\scripts\src\close_mechanical_steps.ts'
        $backup = Join-Path $root 'close_mechanical_steps.ts.bak'
        Move-Item -LiteralPath $missingScript -Destination $backup
        try {
            $r = Invoke-Check -Cwd $root
            Assert-True 'TS-002 (3) missing mechanical-step script is reported as divergence' `
                ($r.Output -match '\[DIVERGENCE\] Mechanical-step script missing: agentdev-workflow-case-close/scripts/src/close_mechanical_steps\.ts') $r.Output
            Assert-True 'TS-002 (3) remaining scripts are still verified after one missing script' `
                (($r.Output -split "`n" | Where-Object { $_ -match '\[OK\] Mechanical-step script prerequisite \(input-validation dry-run\):' }).Count -eq 3) $r.Output
            Assert-True 'TS-002 (3) check exits non-zero when a mechanical-step script is missing' `
                ($r.ExitCode -ne 0) "exit=$($r.ExitCode)"
        } finally {
            Move-Item -LiteralPath $backup -Destination $missingScript
        }
    } finally {
        Remove-TempRepo $root
    }

    # (4) 依存ツール（bun）不在: 検証不能として [DIVERGENCE] 報告され、成功扱いにならない
    $root = New-MechanicalProbeConsumerRepo
    try {
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

    # (5) 入口契約の破綻: script が入力検証契約どおりに応答しない場合、
    #     [DIVERGENCE] 報告され、成功扱いにならない
    $root = New-MechanicalProbeConsumerRepo
    try {
        $brokenDir = Join-Path $root '.broken-case-close\scripts\src'
        New-Item -ItemType Directory -Path $brokenDir -Force | Out-Null
        [System.IO.File]::WriteAllText((Join-Path $brokenDir 'close_mechanical_steps.ts'),
            "process.stderr.write(`"fatal: simulated entry-contract breakage`n`");process.exit(3);`n",
            [System.Text.Encoding]::UTF8)
        $link = Join-Path $root '.opencode\skills\agentdev-workflow-case-close'
        [System.IO.Directory]::Delete($link, $false)
        New-TestJunction -LinkPath $link -TargetPath (Join-Path $root '.broken-case-close')
        try {
            $r = Invoke-Check -Cwd $root
            Assert-True 'TS-002 (5) entry-contract breakage is reported as divergence (not success)' `
                ($r.Output -match '\[DIVERGENCE\] Mechanical-step script entry contract mismatch: agentdev-workflow-case-close/scripts/src/close_mechanical_steps\.ts') $r.Output
            Assert-True 'TS-002 (5) check exits non-zero on entry-contract breakage' `
                ($r.ExitCode -ne 0) "exit=$($r.ExitCode)"
        } finally {
            [System.IO.Directory]::Delete($link, $false)
            New-TestJunction -LinkPath $link -TargetPath (Join-Path $RepoRoot 'src\common\skills\agentdev-workflow-case-close')
        }
    } finally {
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
