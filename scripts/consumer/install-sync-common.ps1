<#
.SYNOPSIS
    scripts/install.ps1（consumer 向け公開入口）と scripts/self-sync.ps1
    （self-hosting 向け公開入口）が共有する導入・同期判定の単一定義モジュール。

.DESCRIPTION
    ジャンクション正本判定、管理物（所有権）判定、stale / 管理外投影の判定、
    配置対象ホストの検出と確定、正本解決、plugin loader shim の固定内容、
    実行環境診断、third-party Skill 宣言の解決と drift 検知という共有判定を、
    両公開入口の同名重複関数の解消とともに1箇所で所有する（実行時パッケージ境界
    Design「導入方式ポリシー」節の共有定義化契約）。同じ規則に対して両入口が
    同じ結果を返すことを1箇所で管理する。

    公開入口2本から dot-source され、単体実行を前提としない内部処理であるため
    scripts/ 直下には配置しない（REQ-050-009）。consumer へ scripts/ を
    同一チェックアウトからコピーする場合は本ファイルも含めること
    （scripts/install.ps1 の実行依存集合、REQ-050-011）。

    スコープ契約: 本モジュールの関数は dot-source 元スクリプトのスコープ変数
    （$ProjectionDir、$SenpiProjectionDir、$ProjectionParentRels、
    $CommonSourceDir、$OpencodeHostSourceDir、$SenpiHostSourceDir、
    $LocalMode 等）を動的スコープで参照する。呼び出し元スクリプトは本モジュール
    の読込前にこれらの変数を定義すること。入口固有の構成差（LocalMode
    リダイレクト、新規環境の既定配置対象）は関数パラメータで引き渡す。

    配布除外の正本（repo-local Plugin の consumer 配布除外）は本モジュールでは
    なく scripts/consumer/distribution-exclusion.ps1 が単一定義として所有する。
    本モジュールの列挙関数（入口側に残る Get-ConsumerJunctionTargets /
    Get-SelectiveJunctionTargets）は当該正本を参照して除外集合を決定する。
#>

#Requires -Version 7.0

# Repo-local patterns excluded from junction management（両入口同一の投影除外定義）
$RepoLocalCommandNames = @('repo')
$RepoLocalSkillPrefix = 'repo-'

# --- Junction primitives ---

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

function Test-JunctionTargetMatchesSource {
    <#
    .SYNOPSIS
        junction の解決先が正本解決パス（Get-TargetSourcePath の現行正本解決。
        LocalMode を含む）と一致するか判定する（両公開入口・両ホスト・全モード共通の
        正本一致検査。「ジャンクション状態の判定と自己修復」Design 参照）。リンク先実体が
        存在しない場合（broken）は解決に失敗するため不一致扱いとなり、管理物確定は
        Test-ManagedProjectionJunction / Test-ManagedSenpiJunction が reparse data の
        リンク先文字列で行う。
    #>
    param([string]$JunctionFullName, [string]$SourcePath)
    $targetObj = Get-JunctionTarget -Path $JunctionFullName
    $targetList = @($targetObj) | ForEach-Object { [string]$_ } | Where-Object { $_ }
    if ($targetList.Count -eq 0) { return $false }
    $expectedFull = [System.IO.Path]::GetFullPath($SourcePath).TrimEnd('\', '/')
    foreach ($target in $targetList) {
        $resolved = $null
        try {
            $resolved = (Resolve-Path -LiteralPath $target -ErrorAction Stop).Path
        } catch {
            $resolved = $target
        }
        if ($resolved.TrimEnd('\', '/') -ieq $expectedFull) { return $true }
    }
    return $false
}

# --- Senpi helpers ---

function Resolve-SenpiTargetRel {
    <#
    .SYNOPSIS
        Convert a managed enumeration entry ('senpi:<subdir>') to its Senpi
        projection relative path ('<subdir>'). Non-senpi entries return $null.
    #>
    param([string]$TargetEntry)
    if ($TargetEntry -like 'senpi:*') { return $TargetEntry.Substring('senpi:'.Length) }
    return $null
}

function Test-ManagedSenpiJunction {
    <#
    .SYNOPSIS
        .senpi/ 配下の junction が ADF 管理投影物（Senpi 投影）であることを確定する
        （REQ-058-001、REQ-058-008）。

    .DESCRIPTION
        確定基準: リンク先が、当該 junction 名に対応する Senpi 正本パス
        （src/senpi/<名前>）に一致する場合のみ管理物とみなす。正本以外を向く
        junction やリンク先を確定できない junction は管理物判定不能として扱い、
        自動削除の対象にしない非破壊境界である（REQ-058-008）。
    #>
    param([string]$JunctionName, [string]$JunctionFullName)
    $targetObj = Get-JunctionTarget -Path $JunctionFullName
    $targetList = @($targetObj) | ForEach-Object { [string]$_ } | Where-Object { $_ }
    if ($targetList.Count -eq 0) { return $false }
    $expectedFull = [System.IO.Path]::GetFullPath((Join-Path $SenpiHostSourceDir $JunctionName)).TrimEnd('\', '/')
    foreach ($target in $targetList) {
        $resolved = $null
        try {
            $resolved = (Resolve-Path -LiteralPath $target -ErrorAction Stop).Path
        } catch {
            $resolved = $target
        }
        if ($resolved.TrimEnd('\', '/') -ieq $expectedFull) { return $true }
    }
    return $false
}

function Test-HasSenpiManagedProjection {
    <#
    .SYNOPSIS
        .senpi/ に管理物と確定できる Senpi 投影が存在するか判定する（配置対象検出用）。
    #>
    if (-not (Test-Path -LiteralPath $SenpiProjectionDir)) { return $false }
    $found = Get-ChildItem -LiteralPath $SenpiProjectionDir -Directory -Force -ErrorAction SilentlyContinue |
        Where-Object { $_.Attributes -band [System.IO.FileAttributes]::ReparsePoint } |
        Where-Object { Test-ManagedSenpiJunction -JunctionName $_.Name -JunctionFullName $_.FullName }
    return [bool]$found
}

# --- Host detection and resolution ---

function Get-DetectedHosts {
    <#
    .SYNOPSIS
        現在の配置対象を配置先の状態から検出する（REQ-099-010）。
        管理物と確定できる ADF 管理投影物が存在するホストのみ検出対象とし、
        利用者が自前で配置した無関係な junction を誤検出しない。

    .PARAMETER LocalRedirectToolRel
        LocalMode リダイレクト対象の管理列挙相対パス（consumer 入口のみ指定。
        LocalMode 管理物の確定に使う候補の追加）。

    .PARAMETER LocalRedirectSourceDir
        LocalMode リダイレクト先の正本ディレクトリ（consumer 入口のみ指定）。
    #>
    param([string]$LocalRedirectToolRel = '', [string]$LocalRedirectSourceDir = '')
    $hasOpenCode = $false
    foreach ($parentRel in $ProjectionParentRels) {
        $parentPath = Join-Path $ProjectionDir $parentRel
        if (-not (Test-Path -LiteralPath $parentPath)) { continue }
        $found = Get-ChildItem -LiteralPath $parentPath -Directory -Force -ErrorAction SilentlyContinue |
            Where-Object { $_.Attributes -band [System.IO.FileAttributes]::ReparsePoint } |
            Where-Object {
                Test-ManagedProjectionJunction -JunctionRel "$parentRel\$($_.Name)" -JunctionFullName $_.FullName `
                    -LocalRedirectToolRel $LocalRedirectToolRel -LocalRedirectSourceDir $LocalRedirectSourceDir
            }
        if ($found) { $hasOpenCode = $true; break }
    }
    $hasSenpi = Test-HasSenpiManagedProjection
    if ($hasOpenCode -and $hasSenpi) { return 'both' }
    if ($hasOpenCode) { return 'opencode' }
    if ($hasSenpi) { return 'senpi' }
    return 'none'
}

function Resolve-TargetHosts {
    <#
    .SYNOPSIS
        配置対象ホストを確定する（REQ-099-010、DEC-049 決定(3)）。
        明示指定（-Hosts パラメータまたはウィザード選択）を最優先し、未指定時は
        現在の配置対象を検出して維持する。検出不能（新規）は入口固有の既定
        （-FallbackHosts: consumer 入口は both（新規導入の推奨）、self-hosting 入口は
        opencode のみ（first-class reference harness、DEC-049 決定(2)））を返す。

    .PARAMETER ExplicitHosts
        明示指定された配置対象（-Hosts パラメータ値。未指定は空）。

    .PARAMETER FallbackHosts
        検出不能（新規環境）の既定配置対象（入口固有）。

    .PARAMETER LocalRedirectToolRel
        LocalMode リダイレクト対象の管理列挙相対パス（consumer 入口のみ指定）。

    .PARAMETER LocalRedirectSourceDir
        LocalMode リダイレクト先の正本ディレクトリ（consumer 入口のみ指定）。
    #>
    param(
        [string]$ExplicitHosts,
        [string[]]$FallbackHosts = @('opencode', 'senpi'),
        [string]$LocalRedirectToolRel = '',
        [string]$LocalRedirectSourceDir = ''
    )
    if ($ExplicitHosts) {
        if ($ExplicitHosts -eq 'both') { return @('opencode', 'senpi') }
        return @($ExplicitHosts)
    }
    $detected = Get-DetectedHosts -LocalRedirectToolRel $LocalRedirectToolRel -LocalRedirectSourceDir $LocalRedirectSourceDir
    if ($detected -eq 'none') { return $FallbackHosts }
    switch ($detected) {
        'opencode' { return @('opencode') }
        'senpi'    { return @('senpi') }
        'both'     { return @('opencode', 'senpi') }
    }
    return $FallbackHosts
}

function Get-HostsDisplay {
    <#
    .SYNOPSIS
        Human-readable placement-target label for messages.
    #>
    param([string]$HostsValue)
    switch ($HostsValue) {
        'opencode' { return 'OpenCode のみ' }
        'senpi'    { return 'Senpi のみ' }
        'both'     { return '両方（OpenCode + Senpi）' }
        'none'     { return 'なし（新規導入）' }
        default    { return $HostsValue }
    }
}

# --- Source resolution ---

function Get-TargetSourcePath {
    <#
    .SYNOPSIS
        Resolve the absolute source path backing a projection relative path.
        OpenCode targets back to the canonical sources (src/common/ for
        commands/skills/tools, src/opencode/ for plugins). Senpi targets back
        to src/senpi/<subdir>. consumer 入口の LocalMode 指定時のみ、
        tools\agentdev-gh は src/common/tools/agentdev-gh/local/ へ
        リダイレクトされる（REQ-009-020）。

    .PARAMETER LocalRedirectToolRel
        LocalMode リダイレクト対象の管理列挙相対パス（consumer 入口のみ指定）。

    .PARAMETER LocalRedirectSourceDir
        LocalMode リダイレクト先の正本ディレクトリ（consumer 入口のみ指定）。
        リダイレクトは呼び出し元スクリプトの $LocalMode が真の場合のみ適用する。
    #>
    param(
        [string]$RelPath,
        [string]$LocalRedirectToolRel = '',
        [string]$LocalRedirectSourceDir = ''
    )
    $senpiRel = Resolve-SenpiTargetRel -TargetEntry $RelPath
    if ($null -ne $senpiRel) {
        return Join-Path $SenpiHostSourceDir $senpiRel
    }
    if ($LocalRedirectToolRel -and $LocalRedirectSourceDir -and $LocalMode -and $RelPath -eq $LocalRedirectToolRel) {
        return $LocalRedirectSourceDir
    }
    if ($RelPath -like 'plugins\*') {
        return Join-Path $OpencodeHostSourceDir $RelPath
    }
    return Join-Path $CommonSourceDir $RelPath
}

# --- Managed projection judgment ---

function Test-ManagedProjectionJunction {
    <#
    .SYNOPSIS
        配置先の junction が ADF 管理投影物（本スクリプト系が配置した物）であることを
        確定する（REQ-058-001、REQ-058-008）。

    .DESCRIPTION
        確定基準: リンク先が、当該 junction の相対パスに対応する正本パス候補
        （現行正本: src/common/ または src/opencode/plugins/、旧単一正本:
        src/opencode/<相対パス>、または LocalMode リダイレクト先 tools\agentdev-gh のみ）
        に一致する場合のみ管理物とみなす。旧単一正本候補は、旧構成で配置された既存
        consumer の管理投影物を確定し、更新時に安全に扱うために残す（REQ-099-012）。
        正本以外を向く junction やリンク先を確定できない junction は管理物判定不能と
        して扱い、自動削除の対象にしない非破壊境界である（REQ-058-008）。

    .PARAMETER LocalRedirectToolRel
        LocalMode リダイレクト対象の管理列挙相対パス（consumer 入口のみ指定。
        当該相対パスの管理物確定候補にリダイレクト先を追加する）。

    .PARAMETER LocalRedirectSourceDir
        LocalMode リダイレクト先の正本ディレクトリ（consumer 入口のみ指定）。
    #>
    param(
        [string]$JunctionRel,
        [string]$JunctionFullName,
        [string]$LocalRedirectToolRel = '',
        [string]$LocalRedirectSourceDir = ''
    )
    $targetObj = Get-JunctionTarget -Path $JunctionFullName
    $targetList = @($targetObj) | ForEach-Object { [string]$_ } | Where-Object { $_ }
    if ($targetList.Count -eq 0) { return $false }
    $expectedSources = @()
    if ($JunctionRel -like 'plugins\*') {
        $expectedSources += (Join-Path $OpencodeHostSourceDir $JunctionRel)
    } else {
        $expectedSources += (Join-Path $CommonSourceDir $JunctionRel)
    }
    # 旧単一正本候補（旧構成 consumer の管理物確定用。REQ-099-012 更新互換）。
    # 旧単一正本の実パスは OpenCode 接続領域と同一である（consumer 入口が
    # $LegacyUnifiedSourceDir として定義する経路と同一）。未定義の呼び出し元
    # （self-hosting 入口）では OpenCode 接続領域を候補に使う（候補集合は不変）。
    $legacySourceDir = if ($LegacyUnifiedSourceDir) { $LegacyUnifiedSourceDir } else { $OpencodeHostSourceDir }
    $expectedSources += (Join-Path $legacySourceDir $JunctionRel)
    if ($LocalRedirectToolRel -and $LocalRedirectSourceDir -and $JunctionRel -eq $LocalRedirectToolRel) {
        $expectedSources += ($LocalRedirectSourceDir)
    }
    foreach ($target in $targetList) {
        $resolved = $null
        try {
            $resolved = (Resolve-Path -LiteralPath $target -ErrorAction Stop).Path
        } catch {
            # 正本から削除された管理対象 junction はリンク先解決に失敗する（broken）。
            # リンク先の文字列自体は reparse data に残るため判定に使える。
            $resolved = $target
        }
        foreach ($expected in $expectedSources) {
            $expectedFull = [System.IO.Path]::GetFullPath($expected).TrimEnd('\', '/')
            if ($resolved.TrimEnd('\', '/') -ieq $expectedFull) { return $true }
        }
    }
    return $false
}

# --- Stale / unmanaged projection enumeration ---

function Get-StaleManagedJunctions {
    <#
    .SYNOPSIS
        ADF 管理投影物のうち正本の管理対象列挙から外れたもの（stale、削除対象）を返す
        （REQ-058-001、REQ-058-002）。

    .DESCRIPTION
        返却要素は RelPath（管理列挙の相対パス表現）と FullName（絶対パス）を持つ。
        正本の管理対象列挙（追加・修復対象を含む現行対象）に含まれない junction のうち、
        管理物と確定できるものだけを返す。対象範囲は OpenCode 投影（.opencode/ の
        commands/skills/tools/plugins 配下）と Senpi 投影（.senpi/ 直下）の両方であり、
        配置対象から外れたホストの管理投影物も stale として扱う（REQ-099-012 の
        対象別除去）。管理物判定不能な junction は返さない（REQ-058-008 の非破壊境界）。

    .PARAMETER LocalRedirectToolRel
        LocalMode リダイレクト対象の管理列挙相対パス（consumer 入口のみ指定）。

    .PARAMETER LocalRedirectSourceDir
        LocalMode リダイレクト先の正本ディレクトリ（consumer 入口のみ指定）。
    #>
    param(
        [string[]]$CurrentTargets,
        [string]$LocalRedirectToolRel = '',
        [string]$LocalRedirectSourceDir = ''
    )
    $stale = [System.Collections.Generic.List[object]]::new()
    foreach ($parentRel in $ProjectionParentRels) {
        $parentPath = Join-Path $ProjectionDir $parentRel
        if (-not (Test-Path -LiteralPath $parentPath)) { continue }
        Get-ChildItem -LiteralPath $parentPath -Directory -Force |
            Where-Object { $_.Attributes -band [System.IO.FileAttributes]::ReparsePoint } |
            ForEach-Object {
                $junctionRel = "$parentRel\$($_.Name)"
                if ($junctionRel -notin $CurrentTargets) {
                    if (Test-ManagedProjectionJunction -JunctionRel $junctionRel -JunctionFullName $_.FullName `
                            -LocalRedirectToolRel $LocalRedirectToolRel -LocalRedirectSourceDir $LocalRedirectSourceDir) {
                        $stale.Add([PSCustomObject]@{ RelPath = $junctionRel; FullName = $_.FullName })
                    }
                }
            }
    }
    if (Test-Path -LiteralPath $SenpiProjectionDir) {
        Get-ChildItem -LiteralPath $SenpiProjectionDir -Directory -Force |
            Where-Object { $_.Attributes -band [System.IO.FileAttributes]::ReparsePoint } |
            ForEach-Object {
                $targetEntry = "senpi:$($_.Name)"
                if ($targetEntry -notin $CurrentTargets) {
                    if (Test-ManagedSenpiJunction -JunctionName $_.Name -JunctionFullName $_.FullName) {
                        $stale.Add([PSCustomObject]@{ RelPath = $targetEntry; FullName = $_.FullName })
                    }
                }
            }
    }
    return $stale
}

function Get-UnmanagedProjectionJunctionRels {
    <#
    .SYNOPSIS
        配置先の junction のうち、正本の管理対象列挙にも stale 管理投影物にも該当しない
        （管理物判定不能な）ものの相対パス一覧を返す（REQ-058-008）。

    .PARAMETER LocalRedirectToolRel
        LocalMode リダイレクト対象の管理列挙相対パス（consumer 入口のみ指定）。

    .PARAMETER LocalRedirectSourceDir
        LocalMode リダイレクト先の正本ディレクトリ（consumer 入口のみ指定）。
    #>
    param(
        [string[]]$CurrentTargets,
        [string]$LocalRedirectToolRel = '',
        [string]$LocalRedirectSourceDir = ''
    )
    $staleRels = @(Get-StaleManagedJunctions -CurrentTargets $CurrentTargets `
            -LocalRedirectToolRel $LocalRedirectToolRel -LocalRedirectSourceDir $LocalRedirectSourceDir) |
        ForEach-Object { $_.RelPath }
    $unmanaged = [System.Collections.Generic.List[string]]::new()
    foreach ($parentRel in $ProjectionParentRels) {
        $parentPath = Join-Path $ProjectionDir $parentRel
        if (-not (Test-Path -LiteralPath $parentPath)) { continue }
        Get-ChildItem -LiteralPath $parentPath -Directory -Force |
            Where-Object { $_.Attributes -band [System.IO.FileAttributes]::ReparsePoint } |
            ForEach-Object {
                $junctionRel = "$parentRel\$($_.Name)"
                if ($junctionRel -notin $CurrentTargets -and $junctionRel -notin $staleRels) {
                    $unmanaged.Add($junctionRel)
                }
            }
    }
    if (Test-Path -LiteralPath $SenpiProjectionDir) {
        Get-ChildItem -LiteralPath $SenpiProjectionDir -Directory -Force |
            Where-Object { $_.Attributes -band [System.IO.FileAttributes]::ReparsePoint } |
            ForEach-Object {
                $targetEntry = "senpi:$($_.Name)"
                if ($targetEntry -notin $CurrentTargets -and $targetEntry -notin $staleRels) {
                    $unmanaged.Add($targetEntry)
                }
            }
    }
    return $unmanaged
}

# --- Plugin loader shim ---

function New-PluginLoaderShimContent {
    <#
    .SYNOPSIS
        OpenCode は .opencode/plugins/ 直下（depth-1）のファイルのみ自動読み込みする。
        ディレクトリ型プラグインパッケージ（plugins/agentdev-*/）のローダーシムとして
        plugin.ts の default を再エクスポートする固定内容を返す
        （両公開入口・archive installer で同一内容を使用する）。
    #>
    param([string]$PackageName)
    return (
        "// Generated by scripts/install.ps1 / scripts/self-sync.ps1 - do not edit.`n" +
        "export { default } from `"./$PackageName/plugin.ts`";`n"
    )
}

# --- Runtime diagnostics (REQ-099-011) ---

function Show-RuntimeDiagnostics {
    <#
    .SYNOPSIS
        実行環境診断（CLI 導入有無の確認）を配置検査と区別して報告する（REQ-099-011）。

    .DESCRIPTION
        配置検査（junction・投影・乖離の検査）と実行環境診断を別セクションで報告する。
        CLI 未導入でも配置と配置検査は可能であり、診断結果は乖離（divergence）に
        数えない。診断は配置対象の選択・変更に使用せず、対応済み組合せの宣言も
        行わない（OmO 版は診断・互換確認にのみ使用）。
    #>
    Write-Host ''
    Write-Host '--- Runtime diagnostics (placement inspection is reported separately above) ---'
    foreach ($cliSpec in @(
        @{ Name = 'opencode'; Label = 'OpenCode CLI (opencode)' },
        @{ Name = 'omo'; Label = 'OmO native CLI (omo)' }
    )) {
        $cmd = Get-Command -Name $cliSpec.Name -ErrorAction SilentlyContinue
        if ($cmd) {
            Write-Host "[INFO] Runtime diagnostic: $($cliSpec.Label): installed ($($cmd.Source))"
        } else {
            Write-Host "[INFO] Runtime diagnostic: $($cliSpec.Label): not found in PATH (placement and placement checks do not require the CLI; runtime behavior cannot be verified here)"
        }
    }
    Write-Host '[INFO] Runtime diagnostics never select or change placement targets (host placement is user-selected or inherited from the current placement).'
    Write-Host '[INFO] This script does not report verified host/CLI compatibility claims; verified combinations are maintained in the guides (REQ-099-018).'
}

# --- Third-party Skill drift detection ---

# 宣言ファイル（src/third-party/skills.yaml、不在時は .agentdev/third-party/skills.yaml
# の2候補解決）と .opencode/skills/<name>/ の配置（SKILL.md と provenance マーカー）の
# 突合。宣言ファイルが解決できない環境は検査対象外として正常扱いし、宣言済みで配置が
# 欠落する場合は ERROR 停止（終了コード 7）して取得機構 CLI を案内する。取得と
# network access は呼び出し元スクリプトが行わない。name 列挙の抽出に限定し、宣言の
# 構文検証は取得機構のパーサーを正本とする。archive installer（Windows PowerShell 5.1
# で自己完結して動作する投影版）の同名検知は本モジュールへ統合できないため、
# 当該入口とは検知内容の同期を維持すること。
$ThirdPartyDeclRelCandidates = @('src\third-party\skills.yaml', '.agentdev\third-party\skills.yaml')
$ThirdPartyProvenanceMarker = '.agentdev-third-party.json'
$ThirdPartyDriftExitCode = 7

function Get-ThirdPartyDeclaredNames {
    <#
    .SYNOPSIS
        宣言ファイルから name 列挙を抽出する（最小 yaml 解析。name 列挙の抽出に限定）。
    #>
    param([string]$DeclarationPath)
    $names = @()
    $inSkills = $false
    foreach ($line in [System.IO.File]::ReadAllLines($DeclarationPath)) {
        $t = $line.Trim()
        if ($t.Length -eq 0 -or $t.StartsWith('#')) { continue }
        if (-not $inSkills) {
            if ($t -match '^skills:\s*(.*)$') {
                $rest = $Matches[1].Trim()
                if ($rest -eq '') { $inSkills = $true }
                elseif ($rest -eq '[]') { return @() }
                else { throw "unsupported skills value in declaration: $rest" }
            } elseif (-not $t.StartsWith('schema_version:')) {
                throw "unsupported declaration line: $t"
            }
            continue
        }
        if ($t.StartsWith('- name:')) {
            $name = $t.Substring('- name:'.Length).Trim().Trim('"', "'")
            if ($name) { $names += $name }
        } elseif (-not ($t.StartsWith('source:') -or $t.StartsWith('-'))) {
            throw "unsupported declaration line: $t"
        }
    }
    return $names
}

function Invoke-ThirdPartyDriftCheck {
    <#
    .SYNOPSIS
        third-party Skill の drift 検知（宣言済みで配置欠落の ERROR 停止と案内）。
    #>
    param([string]$RootDir, [string]$SkillsRootDir, [string]$CliCommandHint)
    $declarationPath = $null
    foreach ($rel in $ThirdPartyDeclRelCandidates) {
        $candidate = Join-Path $RootDir $rel
        if (Test-Path -LiteralPath $candidate) { $declarationPath = $candidate; break }
    }
    if (-not $declarationPath) {
        Write-Host '[INFO] third-party Skill declaration not found (src/third-party/skills.yaml or .agentdev/third-party/skills.yaml); third-party drift check skipped'
        return
    }
    Write-Host "=== third-party Skill drift check ($declarationPath) ==="
    $declaredNames = @(Get-ThirdPartyDeclaredNames -DeclarationPath $declarationPath)
    $missing = @()
    foreach ($name in $declaredNames) {
        $skillDir = Join-Path $SkillsRootDir $name
        $hasSkillMd = Test-Path -LiteralPath (Join-Path $skillDir 'SKILL.md')
        $hasProvenance = Test-Path -LiteralPath (Join-Path $skillDir $ThirdPartyProvenanceMarker)
        if ($hasSkillMd -and $hasProvenance) {
            Write-Host "[OK] third-party Skill placed: $name"
        } else {
            Write-Host "[ERROR] third-party Skill declared but not placed: $name ($skillDir)"
            $missing += $name
        }
    }
    if ($missing.Count -gt 0) {
        Write-Host "導入手順: 取得機構の CLI で third-party Skill を取得してください: $CliCommandHint"
        exit $ThirdPartyDriftExitCode
    }
}
