# 機械置換アルゴリズム適用スクリプト (mechanical-replacement-rules.md 準拠)
# X-1: 中黒並列 → 読点
# X-4: 一文一行違反 → 句点で行分割 (table/list/heading/frontmatter/code fence/括弧内句点は除外)
# X-5: LLM 空虚動詞 → 機械判定代表例のみ
# X-6: 「において」→「で」 (-SkipX6 でスキップ)

param(
    [Parameter(Mandatory=$true)][string]$TargetDir,
    [switch]$SkipX6,
    [string[]]$ExcludePathPatterns = @()
)

$specAllowedNakaguro = @(
    '実行時・編集時',
    'コマンド・スキル・テンプレート・スクリプト',
    'コマンド・スキル・テンプレート',
    '要求・設計・実装'
)

function Test-SpecAllowed($line) {
    foreach ($example in $specAllowedNakaguro) {
        if ($line.Contains($example)) { return $true }
    }
    return $false
}

function Apply-X1($line) {
    if (-not $line.Contains('・')) { return $line, 0 }
    if (Test-SpecAllowed $line) { return $line, 0 }
    # NN時ペアを含む行は機械置換スキップ（文脈判断へ委譲）
    if ($line -match '(\d+時|開始時|終了時|起動時|停止時)・(\d+時|開始時|終了時|起動時|停止時)') {
        return $line, 0
    }
    $count = ($line.ToCharArray() | Where-Object { $_ -eq '・' }).Count
    $newLine = $line -replace '・', '、'
    return $newLine, $count
}

$x5Patterns = @(
    @{ pattern = 'することとしている'; replace = 'する' },
    @{ pattern = '非常に'; replace = '' },
    @{ pattern = '極めて'; replace = '' }
)
$x5NitsuitePatterns = @(
    @{ pattern = 'について説明する'; replace = 'を説明する' },
    @{ pattern = 'について述べる'; replace = 'を述べる' },
    @{ pattern = 'について記載する'; replace = 'に記載する' },
    @{ pattern = 'について記述する'; replace = 'に記述する' },
    @{ pattern = 'について記載し'; replace = 'に記載し' },
    @{ pattern = 'について記述し'; replace = 'に記述し' },
    @{ pattern = 'について説明し'; replace = 'を説明し' }
)

function Apply-X5Simple($line) {
    $newLine = $line
    $edits = 0
    foreach ($p in $x5Patterns) {
        if ($newLine.Contains($p.pattern)) {
            $cnt = ([regex]::Matches($newLine, [regex]::Escape($p.pattern))).Count
            $newLine = $newLine.Replace($p.pattern, $p.replace)
            $edits += $cnt
        }
    }
    foreach ($p in $x5NitsuitePatterns) {
        if ($newLine.Contains($p.pattern)) {
            $cnt = ([regex]::Matches($newLine, [regex]::Escape($p.pattern))).Count
            $newLine = $newLine.Replace($p.pattern, $p.replace)
            $edits += $cnt
        }
    }
    $newLine = $newLine -replace '  +', ' '
    return $newLine, $edits
}

function Apply-X6($line) {
    if (-not $line.Contains('において')) { return $line, 0 }
    # 規範記述（"において | で" 等の表や SPEC 記述）はスキップ
    if ($line -match 'において.*で.*文語調' -or $line -match 'において.*機械判定' -or $line -match '機械判定.*において' -or $line -match '許容.*において' -or $line -match 'において.*置換' -or $line -match '置換.*において') {
        return $line, 0
    }
    $count = ([regex]::Matches($line, 'において')).Count
    $newLine = $line.Replace('において', 'で')
    return $newLine, $count
}

function Apply-X4Split($line) {
    # 括弧内句点をマスク
    $masked = [regex]::Replace($line, '（[^）]*）', { param($m) $m.Value.Replace('。', '⊙') })
    $masked = [regex]::Replace($masked, '\([^)]*\)', { param($m) $m.Value.Replace('。', '⊙') })
    $masked = [regex]::Replace($masked, '「[^」]*」', { param($m) $m.Value.Replace('。', '⊙') })
    $masked = [regex]::Replace($masked, '【[^】]*】', { param($m) $m.Value.Replace('。', '⊙') })
    $masked = [regex]::Replace($masked, '『[^』]*』', { param($m) $m.Value.Replace('。', '⊙') })
    
    $count = ($masked.ToCharArray() | Where-Object { $_ -eq '。' }).Count
    if ($count -lt 2) { return @($line), 0 }
    
    # block quote プレフィックス保持
    $quotePrefix = ''
    if ($line -match '^(\s*(?:>\s*)+)') {
        $quotePrefix = $matches[1]
    }
    
    $result = New-Object System.Collections.Generic.List[string]
    $startIdx = 0
    for ($i = 0; $i -lt $masked.Length; $i++) {
        if ($masked[$i] -eq '。') {
            $segment = $line.Substring($startIdx, $i - $startIdx + 1)
            if ($result.Count -eq 0) {
                $result.Add($segment)
            } else {
                $segmentTrimmed = $segment.TrimStart()
                if ($quotePrefix) {
                    $result.Add($quotePrefix + $segmentTrimmed)
                } else {
                    $result.Add($segmentTrimmed)
                }
            }
            $startIdx = $i + 1
        }
    }
    if ($startIdx -lt $line.Length) {
        $rest = $line.Substring($startIdx).Trim()
        if ($rest) {
            if ($quotePrefix -and $result.Count -gt 0) {
                $result.Add($quotePrefix + $rest)
            } else {
                $result.Add($rest)
            }
        }
    }
    return $result.ToArray(), ($count - 1)
}

function Process-File($file) {
    $utf8NoBom = [System.Text.UTF8Encoding]::new($false)
    $content = [System.IO.File]::ReadAllText($file.FullName, $utf8NoBom)
    # 元の改行コード検出
    $lineEnding = "`n"
    if ($content.Contains("`r`n")) { $lineEnding = "`r`n" }
    
    $lines = $content -split "`r?`n"
    $newLines = New-Object System.Collections.Generic.List[string]
    $totalEdits = 0
    
    $inFrontmatter = $false
    $inCodeFence = $false
    $firstLine = $true
    
    foreach ($line in $lines) {
        if ($firstLine -and $line -match '^---\s*$') { $inFrontmatter = $true; $firstLine = $false; $newLines.Add($line); continue }
        if ($inFrontmatter -and $line -match '^---\s*$') { $inFrontmatter = $false; $newLines.Add($line); continue }
        $firstLine = $false
        
        if ($line -match '^```') { $inCodeFence = -not $inCodeFence; $newLines.Add($line); continue }
        if ($inCodeFence) { $newLines.Add($line); continue }
        if ($inFrontmatter) { $newLines.Add($line); continue }
        
        if ($line -match '^title:.*・') { $newLines.Add($line); continue }
        
        $isTable = $line -match '^\s*\|'
        $isList = $line -match '^\s*[-*+]\s'
        $isHeading = $line -match '^\s*#'
        
        $line, $edits1 = Apply-X1 $line
        $totalEdits += $edits1
        
        if (-not $SkipX6) {
            $line, $edits6 = Apply-X6 $line
            $totalEdits += $edits6
        }
        
        $line, $edits5 = Apply-X5Simple $line
        $totalEdits += $edits5
        
        if (-not ($isTable -or $isList -or $isHeading) -and $line.Trim() -ne '') {
            $splitLines, $edits4 = Apply-X4Split $line
            foreach ($sl in $splitLines) { $newLines.Add($sl) }
            $totalEdits += $edits4
        } else {
            $newLines.Add($line)
        }
    }
    
    $newContent = $newLines -join $lineEnding
    # 末尾改行の保持（元が末尾改行ありなら維持）
    if ($content.EndsWith("`n") -and -not $newContent.EndsWith("`n")) {
        $newContent += $lineEnding
    }
    
    if ($newContent -ne $content) {
        [System.IO.File]::WriteAllText($file.FullName, $newContent, $utf8NoBom)
        return $true, $totalEdits
    }
    return $false, 0
}

$excludeFiles = @('mechanical-replacement-rules.md', 'llm-expression-patterns.md')

$files = Get-ChildItem -Recurse -File -Path $TargetDir -Filter "*.md" -ErrorAction SilentlyContinue
$changedFiles = 0
$totalEdits = 0
$changedFileNames = @()

foreach ($f in $files) {
    if ($excludeFiles -contains $f.Name) { continue }
    $skip = $false
    foreach ($p in $ExcludePathPatterns) {
        if ($f.FullName -like "*$p*") { $skip = $true; break }
    }
    if ($skip) { continue }
    
    $changed, $edits = Process-File $f
    if ($changed) {
        $changedFiles++
        $totalEdits += $edits
        $rel = $f.FullName.Substring($TargetDir.Length).TrimStart('\','/')
        $changedFileNames += $rel
    }
}

Write-Output "Changed files: $changedFiles"
Write-Output "Total edits: $totalEdits"
if ($changedFileNames.Count -gt 0) {
    Write-Output "---"
    foreach ($n in $changedFileNames) { Write-Output "  $n" }
}
