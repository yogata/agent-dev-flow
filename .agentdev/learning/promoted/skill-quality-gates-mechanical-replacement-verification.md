# 機械横断修正の完了宣言における再 grep 0 件確認の必須化と QG 検査項目拡充

## 背景

機械的テキスト置換による横断是正（文字種・表記統一等）を複数ディレクトリにわたり実施した PR で、完了宣言時に「再 grep で 0 件確認」手順が省略され、残存見落とし事案が発生した。PR #1090（#1079/X-6「において」濫用の横断是正）は「7 ディレクトリ完全対応」と完了宣言したが、実際には 3 件の残存があった。後続 PR #1122（#1118）で回帰・修正漏れとして是正した。`mechanical-replacement-rules.md`「再現性の担保」節（L178-190）は既に Step 3 で 0 件確認手順を定義しているが、運用されず、QG-3/QG-4 にも機械横断是正向け検査項目がない。

## 問題

`agentdev-doc-writing/references/mechanical-replacement-rules.md` は機械横断修正の再現性担保手順（Step 3-4 で再 grep 0 件確認）を既に定義しているが、以下2問題がある。

1. **運用未徹底（application miss）**: 手順は存在するが PR #1090 で実行されず、残存 3 件を見落とした。手順の存在と実行の間にギャップがある。
2. **QG 検査項目の欠如（guardrail insufficiency）**: `agentdev-quality-gates` の QG-3（実装逸脱）・QG-4（最終受け入れ）に、機械横断是正を含む PR の完了判定に「再 grep 0 件証拠」を要求する検査項目がない。これにより手順の実行が品質ゲートで担保されていない。

## 望ましい変更

1. **QG-3/QG-4 検査項目の拡充**: 機械横断是正（機械的テキスト置換による複数ディレクトリ横断修正）を含む PR の完了判定に、`mechanical-replacement-rules.md` Step 3-4 の再 grep 0 件証拠を要求する検査項目を追加。
2. **`mechanical-replacement-rules.md` の運用徹底明記**: 「再現性の担保」節 Step 3-4 を「必須手順」として強調し、PR 本文の品質メトリクス欄に「再 grep 結果（0 件）」を必須記載項目として運用することを明記。

## 対象範囲

### 対象

- `src/opencode/skills/agentdev-quality-gates/SKILL.md`（QG-3/QG-4 検査項目）
- `src/opencode/skills/agentdev-doc-writing/references/mechanical-replacement-rules.md`（「再現性の担保」節の運用徹底明記）

### 対象外

- `mechanical-replacement-rules.md` の機械置換アルゴリズム本体（既存で正しく機能）
- inspect-docs 等の自動検出（既存で機能中）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | `src/opencode/skills/agentdev-quality-gates/SKILL.md` | QG-3/QG-4 に機械横断是正向け「再 grep 0 件証拠」要求項を追加 |
| skill | `src/opencode/skills/agentdev-doc-writing/references/mechanical-replacement-rules.md` | 「再現性の担保」節 Step 3-4 を必須手順として強調、PR 本文品質メトリクス欄への再 grep 結果記載を運用化 |

## 既存対策確認

- **確認結果**: あり（手順存在・運用未徹底）
- **該当ファイル**: `src/opencode/skills/agentdev-doc-writing/references/mechanical-replacement-rules.md` L178-190（「再現性の担保」節、Step 3 で 0 件確認手順が既存）
- **ギャップ分類**: application miss + guardrail insufficiency
- **ギャップ詳細**: 手順は既存だが PR #1090 で運用されず残存 3 件を見落とした（application miss）。QG-3/QG-4 に機械横断是正向け検査項目がなく、手順実行が品質ゲートで担保されていない（guardrail insufficiency）。

## 制約

- QG-3/QG-4 検査項目の追加は「機械横断是正を含む PR」に限定し、全 PR に再 grep を要求しない（適用範囲の過大化を防ぐ）。
- 「機械横断是正を含む PR」の判定基準（機械的テキスト置換・複数ディレクトリ横断・`mechanical-replacement-rules.md` 対象表の文字種等）を明確にする。
- 再 grep 0 件証拠は PR 本文への記載を基本とし、CI 自動化は別途検討とする。

## 受け入れ条件

- [ ] `agentdev-quality-gates` の QG-3/QG-4 に機械横断是正向け「再 grep 0 件証拠」要求項が追加されている
- [ ] 追加検査項目の適用範囲（機械横断是正を含む PR）が明確に定義されている
- [ ] `mechanical-replacement-rules.md`「再現性の担保」節に Step 3-4 の必須手順化が明記されている
- [ ] PR 本文品質メトリクス欄への再 grep 結果（0 件）記載が運用化されている

## 元learning item / 根拠

- **要約**: 機械横断修正の完了宣言に再 grep 0 件確認が必須。手順は既存だが運用未徹底、QG 検査項目で担保する必要がある。
- **根拠**:
  - **L-012**（PR #1122, #1118 partial）: PR #1090（#1079/X-6「において」濫用の横断是正）は「7 ディレクトリ完全対応」と完了宣言したが、実際には `docs/specs/command-file-format.md` L53、`docs/requirements/REQ-0134.md` L34、`src/opencode/skills/agentdev-inspect-skills/SKILL.md` L51 の 3 件が残存。後続 PR #1122 で回帰・修正漏れとして是正。PR #1090 で機械置換後に「再 grep で 0 件確認」手順が実行されなかった可能性が高い。`mechanical-replacement-rules.md`「再現性の確保」節 Step 3-4 は既にこの手順を定義しているが運用されなかった。
- **再発条件**: 機械横断テキスト置換を実施し、完了宣言時に再 grep 0 件確認を省略した場合。
- **横展開可能性**: 機械横断是正を完了宣言する全 PR。文字種・表記統一・旧名称除去等の横断修正全般。

## 推奨Issue分類

- **分類**: enhancement
- **推奨ラベル**: enhancement, process
- **関連Issue**: なし（新規）
