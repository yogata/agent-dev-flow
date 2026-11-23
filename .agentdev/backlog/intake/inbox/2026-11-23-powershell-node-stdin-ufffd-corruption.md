---
id: 2026-11-23-powershell-node-stdin-ufffd-corruption
created_at: 2026-11-23T07:50:00+09:00
source: case-close (Epic #4202 Wave-1 PR #4211 本文 Findings の回収)
status: unreviewed
---

# PowerShell here-string → node stdin 経由の日本語送信で U+FFFD の確率的破損

- **課題**: PowerShell here-string → node stdin 経由で日本語コンテンツを送信すると U+FFFD（replacement character）の確率的破損が発生した。PR #4211 の作業中に draft 7/8 回で発生し、U+FFFD スキャンで捕捉・対処した。
- **期待する処分**: Windows 環境の既知破損機構 knowledge（`docs/knowledge/windows-powershell-bulk-io-corruption.md` が cp932 再符号化を扱う）への追補候補。stdin 経由の破損が同一 knowledge 領域に属するか、別知識として整理するかの判断
- **出典**: PR #4211（case #4206・REQ-125-004/005）
- **関連 knowledge**: `docs/knowledge/windows-powershell-bulk-io-corruption.md`
