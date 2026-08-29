<#
.SYNOPSIS
    Install AgentDevFlow runtime artifacts into a consumer repository.

.DESCRIPTION
    consumer 向け公開入口。3つのモードの技術的差は以下の通り（REQ-009-042、REQ-050-002）:
    - check   : 検証のみ（ファイル変更なし）。旧状態確認専用スクリプトの検査能力
                （orphan 検出、版報告、link mode 検出を含む）を包含する（REQ-050-004）
    - dry-run : 変更予測（ファイル変更なし）
    - apply   : 実行（ファイル変更あり）

    いずれのモードも provisioning（clone、fetch、reset）と network access を行わず、
    チェックアウト済みの .agentdev-plugin/ を前提に動作する（REQ-009-046、REQ-050-013、DEC-016）。

    AgentDevFlow 本体リポジトリでは実行しないこと。本体リポジトリで実行した場合は
    変更前に停止し、scripts/self-sync.ps1 へ案内する（REQ-050-006）。

    Creates junctions for public runtime artifacts ONLY:
    - .opencode/commands/agentdev/  = junction -> .agentdev-plugin/src/opencode/commands/agentdev/
    - .opencode/skills/agentdev-*/  = individual junctions -> .agentdev-plugin/src/opencode/skills/agentdev-*/
    - .opencode/tools/agentdev-*/   = individual junctions -> .agentdev-plugin/src/opencode/tools/agentdev-*/
      (Custom Tool distribution type)
    - .opencode/plugins/agentdev-*/ = individual junctions -> .agentdev-plugin/src/opencode/plugins/agentdev-*/
      (Plugin / Hook distribution type)

    Does NOT touch repo-local commands/skills:
    - .opencode/commands/repo/      = real directory (repo-local only)
    - .opencode/skills/repo-*/      = real directories (repo-local only)

    -LocalMode redirects the agentdev-gh Custom Tool implementation to the local source:
    - tools/agentdev-gh/         = junction -> .agentdev-plugin/src/opencode-local/agentdev-gh-cli/
      (Local implementation of the same operation contract, REQ-011-006 / DEC-004)
    All other agentdev-* artifacts still link to src/opencode/ as normal.

    Plugin packages (plugins/agentdev-*/) also get a depth-1 loader shim
    (.opencode/plugins/<package>.ts) because OpenCode auto-loads plugin files
    only at .opencode/plugins/ depth 1.

.PARAMETER Mode
    One of: dry-run, check, apply
    省略可能。引数なし起動時（-Mode 未指定）は対話ウィザードが起動し、Mode と環境を問う。

.PARAMETER LocalMode
    Switch. When set, the agentdev-gh Custom Tool implementation (.opencode/tools/agentdev-gh/)
    is junctioned to src/opencode-local/agentdev-gh-cli/ instead of
    src/opencode/tools/agentdev-gh/. All other agentdev-* command/skill/tool/plugin
    junctions target src/opencode/ as normal.

    判断基準: GitHub Issue/PR を使わずローカルIssue（.agentdev/issues/）で運用する環境
    （ローカル版 OpenCode）では -LocalMode を指定する。

    -Mode check で -LocalMode を省略した場合、tools/agentdev-gh のリンク先から
    link mode（通常 / local）を自動検出して報告する。

.PARAMETER PluginDir
    Directory name for the agent-dev-flow checkout (default: .agentdev-plugin).
    Expected location of the checkout, relative to the consumer repo root.
    上級者向け: チェックアウト配置先を変更する場合のみ指定。通常は既定値を使用する（REQ-009-043）。

.EXAMPLE
    ./scripts/install.ps1
    引数なし起動時は対話ウィザードが Mode と環境を問う。

    ./scripts/install.ps1 -Mode dry-run
    ./scripts/install.ps1 -Mode check
    ./scripts/install.ps1 -Mode apply
    ./scripts/install.ps1 -Mode apply -PluginDir .agentdev-plugin
    ./scripts/install.ps1 -Mode apply -LocalMode
#>

# ADF-COVERS(implementation): REQ-050-001, REQ-050-002, REQ-050-004, REQ-050-005, REQ-050-006, REQ-050-007, REQ-050-008, REQ-050-013
# ADF-COVERS(implementation): REQ-052-007, REQ-052-008, REQ-011-006

#Requires -Version 7.0

param(
    [Parameter()]
    [ValidateSet('dry-run', 'check', 'apply')]
    [string]$Mode,

    [switch]$LocalMode,

    [string]$PluginDir = '.agentdev-plugin'
)

$ErrorActionPreference = 'Stop'

# 共有定義（URL・ブランチ定数、cwd 安全化、チェックアウト案内）
. (Join-Path $PSScriptRoot 'consumer\common.ps1')

$RepoRoot = $PWD.Path
$PluginPath = Join-Path $RepoRoot $PluginDir
$SourceDir = Join-Path $PluginPath 'src\opencode'
$LocalSourceDir = Join-Path $PluginPath 'src\opencode-local'
$ProjectionDir = Join-Path $RepoRoot '.opencode'
$CommandsDir = Join-Path $ProjectionDir 'commands'
$SkillsDir = Join-Path $ProjectionDir 'skills'
$ToolsDir = Join-Path $ProjectionDir 'tools'
$PluginsDir = Join-Path $ProjectionDir 'plugins'

# Parent directories that must exist as real directories (junction parents).
$ProjectionParentDirs = @($CommandsDir, $SkillsDir, $ToolsDir, $PluginsDir)
$ProjectionParentRels = @('commands', 'skills', 'tools', 'plugins')

# Repo-local patterns excluded from junction management
$RepoLocalCommandNames = @('repo')
$RepoLocalSkillPrefix = 'repo-'

# In LocalMode the agentdev-gh Custom Tool implementation is redirected from
# src/opencode-local/ (REQ-011-006, DEC-004).
$LocalModeRedirectToolRel = 'tools\agentdev-gh'
$LocalModeLocalSourceDirName = 'agentdev-gh-cli'

# --- Helper Functions ---

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

    # skills\agentdev-* (dynamic enumeration)
    $skillsSource = Join-Path $SourceDir 'skills'
    if (Test-Path -LiteralPath $skillsSource) {
        Get-ChildItem -LiteralPath $skillsSource -Directory -Filter 'agentdev-*' |
            ForEach-Object { $targets.Add("skills\$($_.Name)") }
    }

    # tools\agentdev-* (Custom Tool 配布種別、動的列挙)
    $toolsSource = Join-Path $SourceDir 'tools'
    if (Test-Path -LiteralPath $toolsSource) {
        Get-ChildItem -LiteralPath $toolsSource -Directory -Filter 'agentdev-*' |
            ForEach-Object { $targets.Add("tools\$($_.Name)") }
    }

    # plugins\agentdev-* (Plugin / Hook 配布種別、動的列挙)
    $pluginsSource = Join-Path $SourceDir 'plugins'
    if (Test-Path -LiteralPath $pluginsSource) {
        Get-ChildItem -LiteralPath $pluginsSource -Directory -Filter 'agentdev-*' |
            ForEach-Object { $targets.Add("plugins\$($_.Name)") }
    }

    return ($targets | Sort-Object)
}

function Get-TargetSourcePath {
    <#
    .SYNOPSIS
        Resolve the absolute source path backing a projection relative path.
        In LocalMode, tools\agentdev-gh is redirected to
        src/opencode-local/agentdev-gh-cli/ (REQ-011-006, DEC-004).
        All other targets back to src/opencode/ as normal.
    #>
    param([string]$RelPath)
    if ($LocalMode -and $RelPath -eq $LocalModeRedirectToolRel) {
        return Join-Path $LocalSourceDir $LocalModeLocalSourceDirName
    }
    return Join-Path $SourceDir $RelPath
}

function New-PluginLoaderShimContent {
    <#
    .SYNOPSIS
        OpenCode は .opencode/plugins/ 直下（depth-1）のファイルのみ自動読み込みする。
        ディレクトリ型プラグインパッケージ（plugins/agentdev-*/）のローダーシムとして
        plugin.ts の default を再エクスポートする固定内容を返す。
    #>
    param([string]$PackageName)
    return (
        "// Generated by scripts/install.ps1 / scripts/self-sync.ps1 - do not edit.`n" +
        "export { default } from `"./$PackageName/plugin.ts`";`n"
    )
}

# --- Checkout Guidance (AG-002/REQ-009-047) ---

# 案内文言・既定 URL 定数は consumer-opencode-common.ps1 の共有定義を使用する（RU-0014、AG-020）。
# clone コマンドはブランチ指定なし、ZIP 配置の補足（ネスト回避、scripts/ 同一チェックアウトコピー）は
# 当スクリプトの案内文言を維持する。
function Invoke-PluginCheckoutGuidance {
    Show-ConsumerCheckoutGuidance -PluginDir $PluginDir -SourceDir $SourceDir `
        -CloneCommandLine "git clone $ConsumerRepoUrl $PluginDir" `
        -ZipNoteLines @(
            "   注意: ZIP 展開直後の agent-dev-flow-<ref>/ の一段ネストを避け、$PluginDir/src/opencode/ となる配置にすること",
            "   （.git のない ZIP 展開チェックアウトも正規の配置形態）",
            "4. scripts/ は $PluginDir/ と同一チェックアウトからコピーすること（スクリプトとチェックアウトの版不一致の防止）"
        )
}

# --- Main ---

# cwd 安全化（REQ-009-041）。ウィザードの前に通過すること。
Assert-ValidConsumerCwd

# 誤実行防止（REQ-050-006）: 実行ディレクトリ直下に src/opencode/ が存在する場合、
# AgentDevFlow 本体リポジトリ（self-hosting 構成）と判定し、変更前に停止して案内する。
# consumer ではチェックアウトは .agentdev-plugin/ 配下にあり、実行ディレクトリ直下に
# src/opencode/ は存在しない（判定方式は runtime-package-boundary Design「誤実行防止の環境判定方式」）。
if (Test-Path -LiteralPath (Join-Path $RepoRoot 'src\opencode')) {
    Write-Host "このスクリプトは AgentDevFlow を導入するリポジトリ（consumer）専用です。現在のフォルダは AgentDevFlow 本体リポジトリです。本体リポジトリでは scripts/self-sync.ps1 を使ってください。"
    exit 1
}

# 引数なし起動時（-Mode 未指定）の対話ウィザード
if (-not $Mode) {
    Invoke-InstallWizard
}

# usable checkout 判定（AG-002/REQ-009-047）: .git の有無ではなく src/opencode/ の存在で判定する。
# 全モード（check、dry-run、apply）共通の前提であり、provisioning は行わない（AG-001/REQ-009-046、DEC-016）。
# ZIP 展開チェックアウト（.git なし）も正規の配置形態として扱う（AG-003/REQ-009-048）。
if (-not (Test-Path -LiteralPath $SourceDir)) {
    Invoke-PluginCheckoutGuidance
}

# LocalMode requires the local redirect target (Local 実装 Tool) to exist
if ($LocalMode) {
    $localRedirectSource = Join-Path $LocalSourceDir $LocalModeLocalSourceDirName
    if (-not (Test-Path -LiteralPath (Join-Path $localRedirectSource 'runner-local.ts'))) {
        Write-Error "[ERROR] LocalMode redirect source not found: $localRedirectSource (runner-local.ts). Ensure $PluginDir contains agent-dev-flow checkout with src/opencode-local/."
        exit 1
    }
}

$targets = Get-ConsumerJunctionTargets

# ============================================================
# CHECK MODE
# ============================================================

if ($Mode -eq 'check') {
    Write-Host '=== Consumer Install Check ==='

    # Link mode 判定（REQ-050-004 継承能力）: -LocalMode 指定時は指定構成を期待値とする。
    # 未指定時は tools\agentdev-gh のリンク先から link mode を自動検出して報告する
    # （local: src/opencode-local/ へ解決される場合、consumer-generated と判定）。
    $DetectedLocalMode = $false
    $ghToolProjection = Join-Path $ProjectionDir $LocalModeRedirectToolRel
    $ghToolLocalSource = Join-Path $LocalSourceDir $LocalModeLocalSourceDirName
    if (Test-Junction -Path $ghToolProjection) {
        $ghToolTarget = Get-JunctionTarget -Path $ghToolProjection
        if ($ghToolTarget -and (Test-Path -LiteralPath $ghToolTarget) -and
            (Test-Path -LiteralPath $ghToolLocalSource) -and
            ((Resolve-Path -LiteralPath $ghToolTarget).Path -eq (Resolve-Path -LiteralPath $ghToolLocalSource).Path)) {
            $DetectedLocalMode = $true
        }
    }
    $ExpectedLocalMode = if ($LocalMode) { $true } else { $DetectedLocalMode }
    if ($ExpectedLocalMode) {
        Write-Host '[INFO] Link mode: local (consumer-generated) — tools/agentdev-gh -> src/opencode-local/agentdev-gh-cli/'
    } else {
        Write-Host '[INFO] Link mode: normal (consumer-with-agentdev) — tools/agentdev-gh -> src/opencode/tools/agentdev-gh/'
    }
    $divergences = 0

    # 1. Plugin checkout directory
    if (-not (Test-Path -LiteralPath $PluginPath)) {
        Write-Host "[DIVERGENCE] $PluginDir not found (git clone またはソース ZIP 展開が必要)"
        $divergences++
    } else {
        Write-Host "[OK] $PluginDir exists"
    }

    # 2. Source directory (usable checkout 判定: .git の有無ではなく src/opencode/ の存在。ZIP 展開チェックアウトも正規の配置形態)
    if (-not (Test-Path -LiteralPath $SourceDir)) {
        Write-Host "[DIVERGENCE] Usable checkout not found: $PluginDir/src/opencode/ (git clone またはソース ZIP 展開が必要)"
        $divergences++
    } else {
        Write-Host "[OK] Usable checkout exists: $PluginDir/src/opencode/"
    }

    # 2b. Checkout version report (.git 存在時のみ、不在時 unknown。REQ-050-004 継承能力)
    # git リポジトリ性は乖離ではなく情報として報告する。
    if (Test-Path -LiteralPath $PluginPath) {
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

    # 3. Local redirect source (local mode only)
    if ($ExpectedLocalMode) {
        if (-not (Test-Path -LiteralPath (Join-Path $ghToolLocalSource 'runner-local.ts'))) {
            Write-Host "[DIVERGENCE] Local redirect source not found: $PluginDir/src/opencode-local/$LocalModeLocalSourceDirName/"
            $divergences++
        } else {
            Write-Host "[OK] Local redirect source exists: $PluginDir/src/opencode-local/$LocalModeLocalSourceDirName/"
        }
    }

    # 4. .opencode/ must be a real directory
    if (Test-Junction -Path $ProjectionDir) {
        Write-Host '[DIVERGENCE] .opencode/ is a junction (must be real directory)'
        $divergences++
    } elseif (-not (Test-Path -LiteralPath $ProjectionDir)) {
        Write-Host '[DIVERGENCE] .opencode/ does not exist'
        $divergences++
    } else {
        Write-Host '[OK] .opencode/ is a real directory'
    }

    # 5. Parent directories
    foreach ($parentDir in $ProjectionParentDirs) {
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

    # 6. Check each expected junction
    foreach ($relPath in $targets) {
        $targetPath = Join-Path $ProjectionDir $relPath
        if (-not (Test-Path -LiteralPath $targetPath)) {
            Write-Host "[DIVERGENCE] Missing junction: $relPath"
            $divergences++
        } elseif (Test-Junction -Path $targetPath) {
            $expectedSource = if ($ExpectedLocalMode -and $relPath -eq $LocalModeRedirectToolRel) {
                Join-Path $LocalSourceDir $LocalModeLocalSourceDirName
            } else {
                Join-Path $SourceDir $relPath
            }
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

    # 7. Orphan detection (agentdev-* junctions that don't match source。REQ-050-004 継承能力)
    Write-Host ''
    Write-Host '--- Orphan junctions ---'
    $orphansFound = $false
    foreach ($parentRel in $ProjectionParentRels) {
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

    # 7b. Plugin loader shims (depth-1 re-export files, OpenCode auto-load requirement)
    Write-Host ''
    Write-Host '--- Plugin loader shims ---'
    $expectedPluginPackages = $targets | Where-Object { $_ -like 'plugins\*' } | ForEach-Object { ($_ -split '\\')[-1] }
    foreach ($pkg in $expectedPluginPackages) {
        $shimPath = Join-Path $PluginsDir "$pkg.ts"
        if (-not (Test-Path -LiteralPath $shimPath)) {
            Write-Host "[DIVERGENCE] Missing plugin loader shim: plugins/$pkg.ts"
            $divergences++
        } elseif ((Get-Content -LiteralPath $shimPath -Raw) -ne (New-PluginLoaderShimContent -PackageName $pkg)) {
            Write-Host "[DIVERGENCE] Plugin loader shim content mismatch: plugins/$pkg.ts"
            $divergences++
        } else {
            Write-Host "[OK] Plugin loader shim: plugins/$pkg.ts"
        }
    }
    Get-ChildItem -LiteralPath $PluginsDir -File -Filter 'agentdev-*.ts' -ErrorAction SilentlyContinue |
        ForEach-Object {
            $pkgName = $_.BaseName
            if ($pkgName -notin $expectedPluginPackages) {
                Write-Host "[ORPHAN] Plugin loader shim not from current source: plugins/$($_.Name)"
                $divergences++
            }
        }

    # 8. Repo-local directories (informational)
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
        Write-Host "$divergences divergence(s) detected. Run scripts/install.ps1 -Mode apply to fix."
    }
    exit $(if ($divergences -gt 0) { 1 } else { 0 })
}

# ============================================================
# DRY-RUN MODE
# ============================================================

if ($Mode -eq 'dry-run') {
    Write-Host '=== Consumer Install Dry Run ==='
    if ($LocalMode) {
        Write-Host '[INFO] LocalMode: tools/agentdev-gh redirects to src/opencode-local/agentdev-gh-cli/'
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
    foreach ($parentRel in $ProjectionParentRels) {
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
    Write-Host '--- Planned plugin loader shims ---'
    $dryRunPluginPackages = $targets | Where-Object { $_ -like 'plugins\*' } | ForEach-Object { ($_ -split '\\')[-1] }
    foreach ($pkg in $dryRunPluginPackages) {
        $shimPath = Join-Path $PluginsDir "$pkg.ts"
        if (Test-Path -LiteralPath $shimPath) {
            Write-Host "[OK] Already present: plugins/$pkg.ts"
        } else {
            Write-Host "[WOULD ADD] Plugin loader shim: plugins/$pkg.ts"
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
        Write-Host '[INFO] LocalMode: tools/agentdev-gh redirects to src/opencode-local/agentdev-gh-cli/'
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

    # Step 3b: Plugin loader shims (depth-1 re-export files)
    Write-Host ''
    Write-Host '--- Plugin loader shims ---'
    $applyPluginPackages = $targets | Where-Object { $_ -like 'plugins\*' } | ForEach-Object { ($_ -split '\\')[-1] }
    foreach ($pkg in $applyPluginPackages) {
        $shimPath = Join-Path $PluginsDir "$pkg.ts"
        $shimContent = New-PluginLoaderShimContent -PackageName $pkg
        if (Test-Path -LiteralPath $shimPath) {
            if ((Get-Content -LiteralPath $shimPath -Raw) -eq $shimContent) {
                Write-Host "[OK] Plugin loader shim already present: plugins/$pkg.ts"
            } else {
                Write-Host "[ACTION] Updating plugin loader shim: plugins/$pkg.ts"
                [System.IO.File]::WriteAllText($shimPath, $shimContent, (New-Object System.Text.UTF8Encoding($false)))
            }
        } else {
            Write-Host "[ACTION] Creating plugin loader shim: plugins/$pkg.ts"
            [System.IO.File]::WriteAllText($shimPath, $shimContent, (New-Object System.Text.UTF8Encoding($false)))
        }
    }
    Get-ChildItem -LiteralPath $PluginsDir -File -Filter 'agentdev-*.ts' -ErrorAction SilentlyContinue |
        ForEach-Object {
            if ($_.BaseName -notin $applyPluginPackages) {
                Write-Host "[ACTION] Removing stale plugin loader shim: plugins/$($_.Name)"
                Remove-Item -LiteralPath $_.FullName -Force
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
    Write-Host '  .opencode/tools/agentdev-*/'
    Write-Host '  .opencode/plugins/agentdev-*/'
    Write-Host '  .opencode/plugins/agentdev-*.ts'
    exit 0
}
