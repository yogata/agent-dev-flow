<#
.SYNOPSIS
    Install AgentDevFlow runtime artifacts into a consumer repository.

.DESCRIPTION
    導入系スクリプト。3つのモードの技術的差は以下の通り（REQ-009-042）:
    - check   : 検証のみ（ファイル変更なし）
    - dry-run : 変更予測（ファイル変更なし）
    - apply   : 実行（ファイル変更あり）

    いずれのモードも provisioning（clone、fetch、reset）と network access を行わず、
    チェックアウト済みの .agentdev-plugin/ を前提に動作する（REQ-009-046、DEC-016）。

    Creates junctions for public runtime artifacts ONLY:
    - .opencode/commands/agentdev/  = junction -> .agentdev-plugin/src/opencode/commands/agentdev/
    - .opencode/skills/agentdev-*/  = individual junctions -> .agentdev-plugin/src/opencode/skills/agentdev-*/
    - .opencode/skills/japanese-tech-writing/ = junction -> .agentdev-plugin/src/opencode/skills/japanese-tech-writing/
      (distribution-dependent skill referenced by agentdev-doc-writing, ADR-{NNNN}/REQ-{NNNN}-{NNN})

    Does NOT touch repo-local commands/skills:
    - .opencode/commands/repo/      = real directory (repo-local only)
    - .opencode/skills/repo-*/      = real directories (repo-local only)

    -LocalMode redirects agentdev-gh-cli to the local OpenCode source:
    - skills/agentdev-gh-cli/       = junction -> .agentdev-plugin/src/opencode-local/agentdev-gh-cli/
    All other agentdev-* artifacts still link to src/opencode/ as normal.

.PARAMETER Mode
    One of: dry-run, check, apply
    省略可能。引数なし起動時（-Mode 未指定）は対話ウィザードが起動し、Mode と環境を問う（REQ-{NNNN}-{NNN}）。

.PARAMETER LocalMode
    Switch. When set, agentdev-gh-cli is junctioned to src/opencode-local/agentdev-gh-cli/
    instead of src/opencode/skills/agentdev-gh-cli/. All other agentdev-* command/skill
    junctions target src/opencode/ as normal (REQ-{NNNN}-{NNN}, ADR-{NNNN} decision #3).

    判断基準: GitHub Issue/PR を使わずローカルファイル（.agentdev/cases/）で運用する環境
    （ローカル版 OpenCode）では -LocalMode を指定する。

.PARAMETER PluginDir
    Directory name for the agent-dev-flow checkout (default: .agentdev-plugin).
    Expected location of the checkout, relative to the consumer repo root.
    上級者向け: チェックアウト配置先を変更する場合のみ指定。通常は既定値を使用する（REQ-009-043）。

.EXAMPLE
    ./scripts/install-consumer-opencode.ps1
    引数なし起動時は対話ウィザードが Mode と環境を問う（REQ-{NNNN}-{NNN}）。

    ./scripts/install-consumer-opencode.ps1 -Mode dry-run
    ./scripts/install-consumer-opencode.ps1 -Mode check
    ./scripts/install-consumer-opencode.ps1 -Mode apply
    ./scripts/install-consumer-opencode.ps1 -Mode apply -PluginDir .agentdev-plugin
    ./scripts/install-consumer-opencode.ps1 -Mode apply -LocalMode
#>

#Requires -Version 7.0

param(
    [Parameter()]
    [ValidateSet('dry-run', 'check', 'apply')]
    [string]$Mode,

    [switch]$LocalMode,

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

# Repo-local patterns excluded from junction management
$RepoLocalCommandNames = @('repo')
$RepoLocalSkillPrefix = 'repo-'

# In LocalMode this skill is redirected from src/opencode-local/ (REQ-{NNNN}-{NNN}, ADR-{NNNN} decision #3)
$LocalModeRedirectSkill = 'agentdev-gh-cli'

# --- Helper Functions ---

function Assert-ValidConsumerCwd {
    <#
    .SYNOPSIS
        実行ディレクトリが AgentDevFlow 導入先として適切か検査する。
        想定外ディレクトリの場合、即座に停止する（REQ-{NNNN}-{NNN}）。
    #>
    $cwd = $PWD.Path

    # 1. .agentdev-plugin/ 配下（チェックアウト配置先、REQ-009-041）
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

function Invoke-InstallWizard {
    <#
    .SYNOPSIS
        引数なし起動時（-Mode 未指定）の対話ウィザード。Mode と環境を問う（REQ-{NNNN}-{NNN}）。
    #>
    Write-Host '=== AgentDevFlow 導入ウィザード ==='
    Write-Host ''
    Write-Host 'Q1. 目的を選んでください（番号を入力）:'
    Write-Host '  1) 新規インストール（apply: 実行、ファイル変更あり）'
    Write-Host '  2) 更新・再同期（apply: 実行、ファイル変更あり）'
    Write-Host '  3) 状態確認（check: 検証のみ、ファイル変更なし）'
    Write-Host '  4) 変更予測（dry-run: 変更予測のみ、ファイル変更なし）'
    $modeChoice = Read-Host '番号'
    switch ($modeChoice) {
        '1' { $script:Mode = 'apply' }
        '2' { $script:Mode = 'apply' }
        '3' { $script:Mode = 'check' }
        '4' { $script:Mode = 'dry-run' }
        default {
            Write-Host "無効な選択です: $modeChoice"
            exit 1
        }
    }

    Write-Host ''
    Write-Host 'Q2. 環境を選んでください（番号を入力）:'
    Write-Host '  1) GitHub 版（通常）'
    Write-Host '  2) ローカル版（GitHub Issue/PR を使わずローカルファイルで運用）'
    $envChoice = Read-Host '番号'
    switch ($envChoice) {
        '1' { }
        '2' { $script:LocalMode = $true }
        default {
            Write-Host "無効な選択です: $envChoice"
            exit 1
        }
    }
    Write-Host ''
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

function Get-ConsumerJunctionTargets {
    <#
    .SYNOPSIS
        Enumerate all junction targets from .agentdev-plugin/src/opencode/.
        Returns sorted array of relative paths (relative to .opencode/) that should be junctioned.
    #>
    $targets = [System.Collections.Generic.List[string]]::new()

    # commands\agentdev
    $cmdSource = Join-Path $SourceDir 'commands\agentdev'
    if (Test-Path -LiteralPath $cmdSource) {
        $targets.Add('commands\agentdev')
    }

    # skills\agentdev-* (dynamic enumeration) plus japanese-tech-writing
    # (distribution-dependent skill referenced by agentdev-doc-writing, ADR-{NNNN}/REQ-{NNNN}-{NNN}).
    $skillsSource = Join-Path $SourceDir 'skills'
    if (Test-Path -LiteralPath $skillsSource) {
        Get-ChildItem -LiteralPath $skillsSource -Directory -Filter 'agentdev-*' |
            ForEach-Object { $targets.Add("skills\$($_.Name)") }
        # japanese-tech-writing is promoted to src/ but lacks agentdev-* prefix (ADR-{NNNN}).
        if (Test-Path -LiteralPath (Join-Path $skillsSource 'japanese-tech-writing')) {
            $targets.Add('skills\japanese-tech-writing')
        }
    }

    return ($targets | Sort-Object)
}

function Get-TargetSourcePath {
    <#
    .SYNOPSIS
        Resolve the absolute source path backing a projection relative path.
        In LocalMode, skills\<LocalModeRedirectSkill> is redirected to
        src/opencode-local/<LocalModeRedirectSkill>/ (REQ-{NNNN}-{NNN}, ADR-{NNNN} decision #3).
        All other targets back to src/opencode/ as normal.
    #>
    param([string]$RelPath)
    if ($LocalMode -and $RelPath -eq "skills\$LocalModeRedirectSkill") {
        return Join-Path $LocalSourceDir $LocalModeRedirectSkill
    }
    return Join-Path $SourceDir $RelPath
}

# --- Checkout Guidance (AG-002/REQ-009-047) ---

function Show-PluginCheckoutGuidance {
    <#
    .SYNOPSIS
        チェックアウト未検出時の案内。provisioning（clone、fetch、reset）も network access も
        代行実行しない（AG-001/REQ-009-046、DEC-016）。チェックアウトの取得は利用者の責務。
    #>
    $repoUrl = 'https://github.com/yogata/agent-dev-flow.git'
    $repoWebUrl = $repoUrl -replace '\.git$', ''
    Write-Host "[ERROR] 利用可能なチェックアウトが見つかりません。usable checkout 判定（$PluginDir/src/opencode/ の存在）に失敗しました。"
    Write-Host ''
    Write-Host 'このスクリプトは provisioning（clone、fetch、reset）と network access を行いません（REQ-009-046、DEC-016）。'
    Write-Host '以下のいずれかで agent-dev-flow のチェックアウトを用意してから再実行してください。'
    Write-Host ''
    Write-Host '方法1: git clone でチェックアウトを用意する'
    Write-Host "  git clone $repoUrl $PluginDir"
    Write-Host ''
    Write-Host '方法2: ソース ZIP を取得して展開する'
    Write-Host "  1. $repoWebUrl を開く"
    Write-Host '  2. [Code] ボタン → [Download ZIP] でソース ZIP をダウンロード'
    Write-Host "  3. ZIP を展開し、中身（src/、scripts/ 等）を $PluginDir/ 直下に配置"
    Write-Host "     注意: ZIP 展開直後の agent-dev-flow-<ref>/ の一段ネストを避け、$PluginDir/src/opencode/ となる配置にすること"
    Write-Host "     （.git のない ZIP 展開チェックアウトも正規の配置形態）"
    Write-Host "  4. scripts/ は $PluginDir/ と同一チェックアウトからコピーすること（スクリプトとチェックアウトの版不一致の防止）"
    Write-Host ''
    Write-Host "期待される状態: $SourceDir が存在すること"
    exit 1
}

# --- Main ---

# cwd 安全化（REQ-{NNNN}-{NNN}）。ウィザードの前に通過すること。
Assert-ValidConsumerCwd

# 引数なし起動時（-Mode 未指定）の対話ウィザード（REQ-{NNNN}-{NNN}）
if (-not $Mode) {
    Invoke-InstallWizard
}

# usable checkout 判定（AG-002/REQ-009-047）: .git の有無ではなく src/opencode/ の存在で判定する。
# 全モード（check、dry-run、apply）共通の前提であり、provisioning は行わない（AG-001/REQ-009-046、DEC-016）。
# ZIP 展開チェックアウト（.git なし）も正規の配置形態として扱う（AG-003/REQ-009-048）。
if (-not (Test-Path -LiteralPath $SourceDir)) {
    Show-PluginCheckoutGuidance
}

# LocalMode requires the local source redirect target to exist
if ($LocalMode) {
    $localRedirectSource = Join-Path $LocalSourceDir $LocalModeRedirectSkill
    if (-not (Test-Path -LiteralPath $localRedirectSource)) {
        Write-Error "[ERROR] LocalMode redirect source not found: $localRedirectSource. Ensure $PluginDir contains agent-dev-flow checkout with src/opencode-local/."
        exit 1
    }
}

$targets = Get-ConsumerJunctionTargets

# ============================================================
# CHECK MODE
# ============================================================

if ($Mode -eq 'check') {
    Write-Host '=== Consumer Install Check ==='
    if ($LocalMode) {
        Write-Host '[INFO] LocalMode: agentdev-gh-cli redirects to src/opencode-local/agentdev-gh-cli/'
    }
    $divergences = 0

    # 1. Plugin checkout directory
    if (-not (Test-Path -LiteralPath $PluginPath)) {
        Write-Host "[DIVERGENCE] $PluginDir not found (git clone またはソース ZIP 展開が必要)"
        $divergences++
    } else {
        Write-Host "[OK] $PluginDir exists"
    }

    # 2. Source directory (usable checkout 判定: .git の有無ではなく src/opencode/ の存在。ZIP 展開チェックアウトも正規の配置形態、AG-003/REQ-009-048)
    if (-not (Test-Path -LiteralPath $SourceDir)) {
        Write-Host "[DIVERGENCE] Usable checkout not found: $PluginDir/src/opencode/ (git clone またはソース ZIP 展開が必要)"
        $divergences++
    } else {
        Write-Host "[OK] Usable checkout exists: $PluginDir/src/opencode/"
    }

    # 2b. Local redirect source (LocalMode only)
    if ($LocalMode) {
        if (-not (Test-Path -LiteralPath $localRedirectSource)) {
            Write-Host "[DIVERGENCE] LocalMode redirect source not found: $PluginDir/src/opencode-local/$LocalModeRedirectSkill/"
            $divergences++
        } else {
            Write-Host "[OK] LocalMode redirect source exists: $PluginDir/src/opencode-local/$LocalModeRedirectSkill/"
        }
    }

    # 3. .opencode/ must be a real directory
    if (Test-Junction -Path $ProjectionDir) {
        Write-Host '[DIVERGENCE] .opencode/ is a junction (must be real directory)'
        $divergences++
    } elseif (-not (Test-Path -LiteralPath $ProjectionDir)) {
        Write-Host '[DIVERGENCE] .opencode/ does not exist'
        $divergences++
    } else {
        Write-Host '[OK] .opencode/ is a real directory'
    }

    # 4. Parent directories
    foreach ($parentDir in @($CommandsDir, $SkillsDir)) {
        $parentRel = $parentDir.Substring($ProjectionDir.Length).TrimStart('\', '/')
        if (Test-Junction -Path $parentDir) {
            Write-Host "[DIVERGENCE] .opencode/$parentRel is a junction (must be real directory)"
            $divergences++
        } elseif (-not (Test-Path -LiteralPath $parentDir)) {
            Write-Host "[DIVERGENCE] .opencode/$parentRel does not exist"
            $divergences++
        } else {
            Write-Host "[OK] .opencode/$parentRel is a real directory"
        }
    }

    # 5. Check each expected junction
    foreach ($relPath in $targets) {
        $targetPath = Join-Path $ProjectionDir $relPath
        if (-not (Test-Path -LiteralPath $targetPath)) {
            Write-Host "[DIVERGENCE] Missing junction: $relPath"
            $divergences++
        } elseif (Test-Junction -Path $targetPath) {
            $expectedSource = Get-TargetSourcePath -RelPath $relPath
            $actualTarget = Get-JunctionTarget -Path $targetPath
            if ($actualTarget -and (Test-Path -LiteralPath $actualTarget) -and ((Resolve-Path -LiteralPath $actualTarget).Path -eq (Resolve-Path -LiteralPath $expectedSource).Path)) {
                Write-Host "[OK] Junction: $relPath"
            } else {
                Write-Host "[DIVERGENCE] Broken junction: $relPath (expected: $expectedSource, actual: $actualTarget)"
                $divergences++
            }
        } else {
            Write-Host "[DIVERGENCE] Exists but not a junction: $relPath"
            $divergences++
        }
    }

    # 6. Repo-local directories (informational)
    foreach ($cmdName in $RepoLocalCommandNames) {
        $repoLocalPath = Join-Path $CommandsDir $cmdName
        if (Test-Path -LiteralPath $repoLocalPath) {
            Write-Host "[INFO] Repo-local command directory exists: commands\$cmdName (not junction-managed)"
        }
    }
    if (Test-Path -LiteralPath $SkillsDir) {
        Get-ChildItem -LiteralPath $SkillsDir -Directory -Force |
            Where-Object { $_.Name -like "$RepoLocalSkillPrefix*" -and -not ($_.Attributes -band [System.IO.FileAttributes]::ReparsePoint) } |
            ForEach-Object {
                Write-Host "[INFO] Repo-local skill directory exists: skills\$($_.Name) (not junction-managed)"
            }
    }

    Write-Host ''
    if ($divergences -eq 0) {
        Write-Host 'No divergence detected. Consumer install is in sync.'
    } else {
        Write-Host "$divergences divergence(s) detected."
    }
    exit $(if ($divergences -gt 0) { 1 } else { 0 })
}

# ============================================================
# DRY-RUN MODE
# ============================================================

if ($Mode -eq 'dry-run') {
    Write-Host '=== Consumer Install Dry Run ==='
    if ($LocalMode) {
        Write-Host '[INFO] LocalMode: agentdev-gh-cli redirects to src/opencode-local/agentdev-gh-cli/'
    }

    # .opencode/ status
    if (Test-Junction -Path $ProjectionDir) {
        Write-Host '[INFO] Migration required: .opencode/ is a junction'
    } elseif (-not (Test-Path -LiteralPath $ProjectionDir)) {
        Write-Host '[INFO] .opencode/ does not exist, would create as real directory'
    } else {
        Write-Host '[OK] .opencode/ is a real directory'
    }

    # Parent directory status
    foreach ($parentRel in @('commands', 'skills')) {
        $parentPath = Join-Path $ProjectionDir $parentRel
        if (-not (Test-Path -LiteralPath $parentPath)) {
            Write-Host "[WOULD ADD] .opencode/$parentRel/ (real directory)"
        } elseif (Test-Junction -Path $parentPath) {
            Write-Host "[ERROR] .opencode/$parentRel/ is a junction (unexpected state)"
        } else {
            Write-Host "[OK] .opencode/$parentRel/ exists as real directory"
        }
    }

    Write-Host ''
    Write-Host '--- Planned junctions ---'

    foreach ($relPath in $targets) {
        $targetPath = Join-Path $ProjectionDir $relPath
        $expectedSource = Get-TargetSourcePath -RelPath $relPath
        if (Test-Junction -Path $targetPath) {
            $actualTarget = Get-JunctionTarget -Path $targetPath
            if ($actualTarget -and (Test-Path -LiteralPath $actualTarget)) {
                Write-Host "[OK] Already junctioned: $relPath"
            } else {
                Write-Host "[WOULD REMOVE] Broken junction: $relPath"
                Write-Host "[WOULD ADD] Re-create junction: $relPath"
            }
        } elseif (Test-Path -LiteralPath $targetPath) {
            Write-Host "[ERROR] Path exists and is not a junction: $relPath"
        } else {
            Write-Host "[WOULD ADD] Create junction: $relPath -> $expectedSource"
        }
    }

    Write-Host ''
    Write-Host 'Dry run complete. No changes made.'
    exit 0
}

# ============================================================
# APPLY MODE
# ============================================================

if ($Mode -eq 'apply') {
    Write-Host '=== Consumer Install: applying junctions ==='
    if ($LocalMode) {
        Write-Host '[INFO] LocalMode: agentdev-gh-cli redirects to src/opencode-local/agentdev-gh-cli/'
    }

    # Step 1: Ensure .opencode/ is a real directory
    if (Test-Junction -Path $ProjectionDir) {
        Write-Host '[ACTION] Removing whole-directory junction .opencode/'
        $rmResult = cmd /c "rmdir `"$ProjectionDir`"" 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Error "[ERROR] Failed to remove junction: $rmResult"
            exit 1
        }
        Write-Host '[ACTION] Creating .opencode/ as real directory'
        New-Item -ItemType Directory -Path $ProjectionDir -Force | Out-Null
    } elseif (-not (Test-Path -LiteralPath $ProjectionDir)) {
        Write-Host '[ACTION] Creating .opencode/ as real directory'
        New-Item -ItemType Directory -Path $ProjectionDir -Force | Out-Null
    } else {
        Write-Host '[OK] .opencode/ exists as real directory'
    }

    # Step 2: Parent directories
    foreach ($parentRel in @('commands', 'skills')) {
        $parentPath = Join-Path $ProjectionDir $parentRel
        if (Test-Junction -Path $parentPath) {
            Write-Error "[ERROR] .opencode/$parentRel is a junction (must be real directory)"
            exit 1
        }
        if (-not (Test-Path -LiteralPath $parentPath)) {
            Write-Host "[ACTION] Creating .opencode/$parentRel/ as real directory"
            New-Item -ItemType Directory -Path $parentPath -Force | Out-Null
        }
    }

    # Step 3: Selective Junction Creation
    Write-Host ''
    Write-Host '--- Junctions ---'
    foreach ($relPath in $targets) {
        $targetPath = Join-Path $ProjectionDir $relPath
        $sourcePath = Get-TargetSourcePath -RelPath $relPath

        if (Test-Junction -Path $targetPath) {
            $actualTarget = Get-JunctionTarget -Path $targetPath
            $expectedSource = $sourcePath
            if ($actualTarget -and (Test-Path -LiteralPath $actualTarget) -and ((Resolve-Path -LiteralPath $actualTarget).Path -eq (Resolve-Path -LiteralPath $expectedSource).Path)) {
                Write-Host "[OK] Already junctioned: $relPath"
                continue
            } else {
                Write-Host "[ACTION] Removing junction (wrong target): $relPath"
                cmd /c "rmdir `"$targetPath`"" 2>&1
                if ($LASTEXITCODE -ne 0) {
                    Write-Error "[ERROR] Failed to remove junction: $relPath"
                    exit 1
                }
            }
        } elseif (Test-Path -LiteralPath $targetPath) {
            Write-Error "[ERROR] Path exists and is not a junction: $relPath"
            exit 1
        }

        # Ensure parent directory exists
        $parentPath = Split-Path $targetPath -Parent
        if (-not (Test-Path -LiteralPath $parentPath)) {
            New-Item -ItemType Directory -Path $parentPath -Force | Out-Null
        }

        Write-Host "[ACTION] Creating junction: $relPath -> $sourcePath"
        $result = cmd /c "mklink /J `"$targetPath`" `"$sourcePath`" 2>&1"
        if ($LASTEXITCODE -ne 0) {
            Write-Error "[ERROR] Failed to create junction ${relPath}: $result"
            exit 1
        }
    }

    # Step 4: Repo-local directories (informational)
    Write-Host ''
    Write-Host '--- Repo-local artifacts (not junction-managed) ---'
    foreach ($cmdName in $RepoLocalCommandNames) {
        $repoLocalPath = Join-Path $CommandsDir $cmdName
        if (Test-Path -LiteralPath $repoLocalPath) {
            Write-Host "[INFO] Skipping repo-local command: commands\$cmdName"
        }
    }
    if (Test-Path -LiteralPath $SkillsDir) {
        Get-ChildItem -LiteralPath $SkillsDir -Directory -Force |
            Where-Object { $_.Name -like "$RepoLocalSkillPrefix*" } |
            ForEach-Object {
                Write-Host "[INFO] Skipping repo-local skill: skills\$($_.Name)"
            }
    }

    Write-Host ''
    Write-Host 'Consumer install complete.'
    Write-Host ''
    Write-Host 'Recommended .gitignore entries:'
    Write-Host "  $PluginDir/"
    Write-Host '  .sisyphus/'
    Write-Host '  .opencode/commands/agentdev/'
    Write-Host '  .opencode/skills/agentdev-*/'
    Write-Host '  .opencode/skills/japanese-tech-writing/'
    exit 0
}
