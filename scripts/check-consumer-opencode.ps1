<#
.SYNOPSIS
    Check consumer repository AgentDevFlow installation status.

.DESCRIPTION
    導入先リポジトリの AgentDevFlow インストール状態を確認する。軽量確認
    （検証のみ、ファイル変更なし、provisioning なし）。既存の .agentdev-plugin/ と
    junction を検証し、乖離を報告する（REQ-009-046、DEC-016）。

    関連3モードの技術的差（参考）:
    - check（当スクリプト / install -Mode check）: チェックアウトを前提に既存状態を検証（ファイル変更なし）
    - install -Mode dry-run                    : チェックアウトを前提に予測（ファイル変更なし）
    - install -Mode apply                      : チェックアウトを前提に junction 設定を実行（ファイル変更あり）

    当スクリプトと install -Mode check の使い分け:
    - 当スクリプト（check-consumer-opencode.ps1）: 軽量確認。orphan 検出を含む。
    - install -Mode check: 同様にチェックアウトを前提に検証する。orphan 検出は含まない。

    Verifies that the consumer repository's AgentDevFlow installation is healthy:
    - .agentdev-plugin/ has a usable checkout (src/opencode/ exists; .git is not required)
    - All expected junctions exist and point to correct targets
    - Reports divergences

    チェックアウトの git リポジトリ性は乖離（DIVERGENCE）ではなく情報として報告する。
    版（commit/branch）報告は .git が存在する場合のみ行い、ZIP 展開チェックアウト（.git なし）
    の版は unknown とする（AG-003/REQ-009-048）。version manifest ファイルは導入しない。

    Auto-detects link mode from the agentdev-gh-cli junction target:
    - Normal mode: agentdev-gh-cli -> src/opencode/skills/agentdev-gh-cli/
    - Local mode:  agentdev-gh-cli -> src/opencode-local/agentdev-gh-cli/ (consumer-generated)

    No apply mode is provided. Use install-consumer-opencode.ps1 -Mode apply to fix issues.

.PARAMETER PluginDir
    Directory name for the agent-dev-flow checkout (default: .agentdev-plugin).
    上級者向け: チェックアウト配置先ディレクトリ名を変更した環境でのみ指定。通常は既定値を使用する。

.EXAMPLE
    ./scripts/check-consumer-opencode.ps1
    ./scripts/check-consumer-opencode.ps1 -PluginDir .agentdev-plugin
#>

#Requires -Version 7.0

param(
    [string]$PluginDir = '.agentdev-plugin'
)

$ErrorActionPreference = 'Stop'

$RepoRoot = $PWD.Path
$PluginPath = Join-Path $RepoRoot $PluginDir
$SourceDir = Join-Path $PluginPath 'src\opencode'
$LocalSourceDir = Join-Path $PluginPath 'src\opencode-local'
$ProjectionDir = Join-Path $RepoRoot '.opencode'
$CommandsDir = Join-Path $ProjectionDir 'commands'
$SkillsDir = Join-Path $ProjectionDir 'skills'

# Skill redirected to src/opencode-local/ in local mode (REQ-{NNNN}-{NNN}, ADR-{NNNN} decision #3)
$LocalModeRedirectSkill = 'agentdev-gh-cli'

# --- Helper Functions ---

function Assert-ValidConsumerCwd {
    <#
    .SYNOPSIS
        実行ディレクトリが AgentDevFlow 導入先として適切か検査する。
        想定外ディレクトリの場合、即座に停止する（REQ-{NNNN}-{NNN}）。
    #>
    $cwd = $PWD.Path

    # 1. .agentdev-plugin/ 配下（チェックアウト配置先）
    if ($cwd -match '[\\/]\.agentdev-plugin([\\/]|$)') {
        Write-Host "現在のフォルダ: $cwd。このフォルダは agent-dev-flow のチェックアウト配置先です。1つ上のフォルダへ移動してください。AgentDevFlow をインストールしたいリポジトリの一番上のフォルダ（.git がある場所）で実行してください。"
        exit 1
    }

    # 2. src/opencode/ 配下（原本領域）
    if ($cwd -match '[\\/]src[\\/]opencode([\\/]|$)') {
        Write-Host "現在のフォルダ: $cwd。このフォルダは agent-dev-flow の原本領域です。AgentDevFlow をインストールしたいリポジトリの一番上のフォルダ（.git がある場所）で実行してください。"
        exit 1
    }

    # 3. .opencode/ 配下（実行時領域）
    if ($cwd -match '[\\/]\.opencode([\\/]|$)') {
        Write-Host "現在のフォルダ: $cwd。このフォルダは OpenCode の実行時領域です。AgentDevFlow をインストールしたいリポジトリの一番上のフォルダ（.git がある場所）で実行してください。"
        exit 1
    }

    # 4. .git 無し（Git リポジトリでない）
    if (-not (Test-Path -LiteralPath (Join-Path $cwd '.git'))) {
        Write-Host "現在のフォルダ: $cwd。このフォルダは Git リポジトリではありません。AgentDevFlow をインストールしたいリポジトリの一番上のフォルダ（.git がある場所）で実行してください。"
        exit 1
    }
}

function Test-Junction {
    param([string]$Path)
    $item = Get-Item -LiteralPath $Path -Force -ErrorAction SilentlyContinue
    if (-not $item) { return $false }
    return $item.Attributes -band [System.IO.FileAttributes]::ReparsePoint
}

function Get-JunctionTarget {
    param([string]$Path)
    $item = Get-Item -LiteralPath $Path -Force -ErrorAction SilentlyContinue
    if (-not $item) { return $null }
    if (-not ($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint)) { return $null }
    return $item.Target
}

function Get-TargetSourcePath {
    <#
    .SYNOPSIS
        Resolve the absolute source path backing a projection relative path.
        When $DetectedLocalMode is true, skills\<LocalModeRedirectSkill> is redirected
        to src/opencode-local/<LocalModeRedirectSkill>/ (REQ-{NNNN}-{NNN}, ADR-{NNNN} decision #3).
    #>
    param([string]$RelPath, [bool]$LocalMode)
    if ($LocalMode -and $RelPath -eq "skills\$LocalModeRedirectSkill") {
        return Join-Path $LocalSourceDir $LocalModeRedirectSkill
    }
    return Join-Path $SourceDir $RelPath
}

# --- Checkout Guidance (AG-003/REQ-009-047) ---

# 案内表示用の既定値（当スクリプトは provisioning を行わないため、案内以外では使用しない）
$DefaultRepoUrl = 'https://github.com/yogata/agent-dev-flow.git'
$DefaultBranch = 'main'

function Show-PluginCheckoutGuidance {
    <#
    .SYNOPSIS
        チェックアウト未検出時の案内。provisioning（clone、fetch、reset）も network access も
        代行実行しない（AG-001/REQ-009-046、DEC-016）。チェックアウトの取得は利用者の責務。
    #>
    $repoWebUrl = $DefaultRepoUrl -replace '\.git$', ''
    Write-Host "[ERROR] 利用可能なチェックアウトが見つかりません。usable checkout 判定（$PluginDir/src/opencode/ の存在）に失敗しました。"
    Write-Host ''
    Write-Host 'このスクリプトは provisioning（clone、fetch、reset）と network access を行いません（REQ-009-046、DEC-016）。'
    Write-Host '以下のいずれかで agent-dev-flow のチェックアウトを用意してから再実行してください。'
    Write-Host ''
    Write-Host '方法1: git clone でチェックアウトを用意する'
    Write-Host "  git clone --branch $DefaultBranch $DefaultRepoUrl $PluginDir"
    Write-Host ''
    Write-Host '方法2: ソース ZIP を取得して展開する'
    Write-Host "  1. $repoWebUrl を開く"
    Write-Host '  2. [Code] ボタン → [Download ZIP] でソース ZIP をダウンロード'
    Write-Host "  3. ZIP を展開し、中身（src/、scripts/ 等）を $PluginDir/ 直下に配置"
    Write-Host "     （$PluginDir/src/opencode/ が存在すればよく、.git のない ZIP 展開チェックアウトも正規の配置形態）"
    Write-Host ''
    Write-Host "期待される状態: $SourceDir が存在すること"
    exit 1
}

# --- Main ---

# cwd 安全化（REQ-{NNNN}-{NNN}）
Assert-ValidConsumerCwd

Write-Host '=== Consumer Install Status Check ==='
$divergences = 0

# 1. Plugin checkout (usable checkout 判定)
# .git の有無ではなく src/opencode/ の存在で判定する（AG-003/REQ-009-047、REQ-009-048）。
# ZIP 展開チェックアウト（.git なし）も正規の配置形態とする。チェックアウト未検出時は
# エラー停止して clone とソース ZIP の手順を案内する（provisioning の代行はしない）。
if (-not (Test-Path -LiteralPath $SourceDir)) {
    Show-PluginCheckoutGuidance
} else {
    Write-Host "[OK] Usable checkout exists: $PluginDir/src/opencode/"
    # git リポジトリ性は乖離ではなく情報として報告する（AG-003/REQ-009-048）。
    # 版（commit/branch）報告は .git が存在する場合のみ行い、ZIP 展開環境では unknown とする。
    if (Test-Path -LiteralPath (Join-Path $PluginPath '.git')) {
        Write-Host "[INFO] $PluginDir is a git repository"
        Push-Location -LiteralPath $PluginPath
        try {
            $commit = git rev-parse --short HEAD 2>$null
            $branch = git rev-parse --abbrev-ref HEAD 2>$null
            Write-Host "[INFO] Checkout: $branch ($commit)"
        }
        finally {
            Pop-Location
        }
    } else {
        Write-Host "[INFO] $PluginDir is not a git repository (possibly a ZIP-expanded checkout; informational, not a divergence)"
        Write-Host '[INFO] Checkout: unknown'
    }
}

# 2. Link mode detection (agentdev-gh-cli junction target)
# Local mode: agentdev-gh-cli -> src/opencode-local/agentdev-gh-cli/ (consumer-generated)
# Normal mode: agentdev-gh-cli -> src/opencode/skills/agentdev-gh-cli/ (consumer-with-agentdev)
$DetectedLocalMode = $false
$ghCliProjection = Join-Path $SkillsDir $LocalModeRedirectSkill
$ghCliLocalSource = Join-Path $LocalSourceDir $LocalModeRedirectSkill
if (Test-Junction -Path $ghCliProjection) {
    $ghCliTarget = Get-JunctionTarget -Path $ghCliProjection
    if ($ghCliTarget -and (Test-Path -LiteralPath $ghCliTarget) -and
        (Test-Path -LiteralPath $ghCliLocalSource) -and
        ((Resolve-Path -LiteralPath $ghCliTarget).Path -eq (Resolve-Path -LiteralPath $ghCliLocalSource).Path)) {
        $DetectedLocalMode = $true
    }
}
if ($DetectedLocalMode) {
    Write-Host '[INFO] Link mode: local (consumer-generated) — agentdev-gh-cli -> src/opencode-local/'
} else {
    Write-Host '[INFO] Link mode: normal (consumer-with-agentdev) — agentdev-gh-cli -> src/opencode/'
}

# 2b. Local redirect source (local mode only)
if ($DetectedLocalMode) {
    if (-not (Test-Path -LiteralPath $ghCliLocalSource)) {
        Write-Host "[DIVERGENCE] Local redirect source not found: $PluginDir/src/opencode-local/$LocalModeRedirectSkill/"
        $divergences++
    } else {
        Write-Host "[OK] Local redirect source exists: $PluginDir/src/opencode-local/$LocalModeRedirectSkill/"
    }
}

# 3. .opencode/ status
if (-not (Test-Path -LiteralPath $ProjectionDir)) {
    Write-Host '[DIVERGENCE] .opencode/ does not exist'
    $divergences++
} elseif (Test-Junction -Path $ProjectionDir) {
    Write-Host '[DIVERGENCE] .opencode/ is a junction (must be real directory)'
    $divergences++
} else {
    Write-Host '[OK] .opencode/ is a real directory'
}

# 4. Parent directories
if (Test-Path -LiteralPath $ProjectionDir) {
    foreach ($parentRel in @('commands', 'skills')) {
        $parentPath = Join-Path $ProjectionDir $parentRel
        if (-not (Test-Path -LiteralPath $parentPath)) {
            Write-Host "[DIVERGENCE] .opencode/$parentRel/ does not exist"
            $divergences++
        } elseif (Test-Junction -Path $parentPath) {
            Write-Host "[DIVERGENCE] .opencode/$parentRel/ is a junction (must be real directory)"
            $divergences++
        } else {
            Write-Host "[OK] .opencode/$parentRel/ is a real directory"
        }
    }
}

# 5. Junction checks
if (Test-Path -LiteralPath $SourceDir) {
    # Enumerate expected targets from source
    $targets = [System.Collections.Generic.List[string]]::new()

    $cmdSource = Join-Path $SourceDir 'commands\agentdev'
    if (Test-Path -LiteralPath $cmdSource) {
        $targets.Add('commands\agentdev')
    }

    $skillsSource = Join-Path $SourceDir 'skills'
    if (Test-Path -LiteralPath $skillsSource) {
        Get-ChildItem -LiteralPath $skillsSource -Directory -Filter 'agentdev-*' |
            ForEach-Object { $targets.Add("skills\$($_.Name)") }
        if (Test-Path -LiteralPath (Join-Path $skillsSource 'japanese-tech-writing')) {
            $targets.Add('skills\japanese-tech-writing')
        }
    }

    Write-Host ''
    Write-Host '--- Junction checks ---'

    foreach ($relPath in ($targets | Sort-Object)) {
        $targetPath = Join-Path $ProjectionDir $relPath
        $expectedSource = Get-TargetSourcePath -RelPath $relPath -LocalMode $DetectedLocalMode

        if (-not (Test-Path -LiteralPath $targetPath)) {
            Write-Host "[DIVERGENCE] Missing junction: $relPath"
            $divergences++
        } elseif (Test-Junction -Path $targetPath) {
            $actualTarget = Get-JunctionTarget -Path $targetPath
            if ($actualTarget -and (Test-Path -LiteralPath $actualTarget) -and ((Resolve-Path -LiteralPath $actualTarget).Path -eq (Resolve-Path -LiteralPath $expectedSource).Path)) {
                Write-Host "[OK] Junction: $relPath -> $actualTarget"
            } else {
                Write-Host "[DIVERGENCE] Broken junction: $relPath (expected: $expectedSource, actual: $actualTarget)"
                $divergences++
            }
        } else {
            Write-Host "[DIVERGENCE] Exists but not a junction: $relPath"
            $divergences++
        }
    }

    # 6. Orphan detection (agentdev-* junctions that don't match source)
    Write-Host ''
    Write-Host '--- Orphan junctions ---'
    $orphansFound = $false
    foreach ($parentRel in @('commands', 'skills')) {
        $parentPath = Join-Path $ProjectionDir $parentRel
        if (-not (Test-Path -LiteralPath $parentPath)) { continue }
        Get-ChildItem -LiteralPath $parentPath -Directory -Force |
            Where-Object { $_.Attributes -band [System.IO.FileAttributes]::ReparsePoint } |
            ForEach-Object {
                $junctionRel = "$parentRel\$($_.Name)"
                if ($junctionRel -notin $targets) {
                    Write-Host "[ORPHAN] Junction not from current source: $junctionRel"
                    $orphansFound = $true
                    $divergences++
                }
            }
    }
    if (-not $orphansFound) {
        Write-Host '[OK] No orphan junctions detected'
    }
}

# Summary
Write-Host ''
if ($divergences -eq 0) {
    Write-Host 'Consumer install OK. All junctions are in sync.'
    exit 0
} else {
    Write-Host "$divergences divergence(s) detected. Run install-consumer-opencode.ps1 -Mode apply to fix."
    exit 1
}
