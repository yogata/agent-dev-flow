# Windows 環境で Write ツールが既存 UTF-8 ファイルを cp932 で書き出す問題の是正

## 背景

Windows 環境で OpenCode の Write ツールが、既存 UTF-8（BOM なし）ファイルを上書きする際にシステムデフォルトエンコーディング（cp932/Shift-JIS）で書き出す事象が PR #1085（#1077/OU-005）で発生した。`docs/requirements/README.md` の編集時に発生し、edit ツール（per-line string replace）で回避した。現在 `agentdev-gh-cli/references/standard-procedures.md` L57 は「OpenCode の Write tool も使用可能（BOMなしUTF-8で書き出す）」と記載するが、これは既存ファイル上書き時の cp932 化事象と矛盾しており、誤った安全保証を与えている。

## 問題

`agentdev-gh-cli` は「Write ツールは BOM なし UTF-8 で書き出す」と記載しているが、実際には既存 UTF-8 ファイルの上書きで cp932 が書き出される事象が実証されている（L-005）。この記載と事実の矛盾により、実装担当者が Write ツールで既存ファイルを安易に上書きし、エンコーディング破損を発生させるリスクがある。consumer repo 配布先環境でも同様の落とし穴が予測される。

## 望ましい変更

1. **`agentdev-gh-cli/references/standard-procedures.md` の記載修正**: L57「OpenCode の Write tool も使用可能（BOMなしUTF-8で書き出す）」を、既存 UTF-8 ファイル編集時は edit ツール（per-line string replace）を優先し、Write ツールの全面上書きは新規ファイル作成時に限定する旨に修正。
2. **AGENTS.md 常時ルール候補の検討**: Windows 環境で既存 UTF-8（BOM なし）ファイルを編集する場合の edit ツール優先ルールを、常時必要な短いルールとして AGENTS.md に記載するか検討。

## 対象範囲

### 対象

- `src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md` L57 周辺（Write ツール許可記載）
- `AGENTS.md`（常時ルール候補、要検討）

### 対象外

- verify_body.ts のエンコーディング検証ロジック（既存で BOM 検出・UTF-8 検証が実装済み）
- PowerShell の `[System.IO.File]::WriteAllText` 規定（既存で正しく機能、変更不要）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | `src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md` | L57 の Write ツール許可記載を、既存ファイル編集時 edit 優先・新規ファイル作成時のみ Write 許可に修正 |
| agents | `AGENTS.md` | Windows 環境で既存 UTF-8 ファイル編集時の edit ツール優先ルール（常時ルール候補、要検討） |

## 既存対策確認

- **確認結果**: あり（部分的・事実矛盾）
- **該当ファイル**: `src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md` L57
- **ギャップ分類**: fix gap
- **ギャップ詳細**: L57 は「Write tool も使用可能（BOMなしUTF-8で書き出す）」と記載するが、L-005 は既存 UTF-8 ファイル上書き時に cp932 で書き出される事象を実証。記載が事実と矛盾し、誤った安全保証を与えている。`[System.IO.File]::WriteAllText` 規定は正しく機能するが、Write ツールの既存ファイル上書き挙動の注意喚起がない。

## 制約

- 新規ファイル作成時の Write ツール使用は引き続き許可する（cp932 化は既存ファイル上書き時に発生）。
- edit ツール（per-line string replace）は行単位の置換のため、大規模な構造変更には不向き。その場合は `[System.IO.File]::WriteAllText` with `UTF8Encoding($false)` を使用する既存規定に従う。
- AGENTS.md への常時ルール記載は、AGENTS.md の他ルールとのバランスを検討して決定する（本成果物では候補提示まで）。

## 受け入れ条件

- [ ] `standard-procedures.md` L57 の Write ツール許可記載が、既存ファイル編集時 edit 優先に修正されている
- [ ] 修正後の記載が新規ファイル作成時の Write 許可を維持している
- [ ] AGENTS.md 常時ルール候補の検討結果が文書化されている（採用/非採用いずれも可、判断根拠を明記）

## 元learning item / 根拠

- **要約**: Windows 環境で Write ツールが既存 UTF-8 ファイルを cp932 で書き出す事象が実証。gh-cli の既存記載と矛盾し、edit ツール優先ルールの明文化が必要。
- **根拠**:
  - **L-005**（PR #1085, #1077/OU-005）: Windows 環境で OpenCode の Write ツールが、既存 UTF-8（BOM なし）ファイルを上書きする際に cp932（Shift-JIS）で書き出す事象を確認。`docs/requirements/README.md` の編集時に発生し、edit ツールで回避。`agentdev-gh-cli` は gh CLI 用に `[System.IO.File]::WriteAllText` または Write ツールを許可するが、既存 UTF-8 ファイルの編集では edit ツールが安全。consumer repo 配布先でも同様の落とし穴が発生する可能性。
- **再発条件**: Windows 環境で Write ツールにより既存 UTF-8（BOM なし）ファイルを全面上書きする場合。
- **横展開可能性**: Windows 環境全般、consumer repo 配布先環境。README.md 等、改行・エンコーディングが厳格なファイルで特に高リスク。

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: bug, documentation
- **関連Issue**: なし（新規）
