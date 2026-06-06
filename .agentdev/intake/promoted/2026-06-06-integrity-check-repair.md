# integrity-check 基盤修復

## 観測

integrity-check コマンドが完全に動作不能。3本のスクリプトが単一行化・パース不能。broken junction も残存し、glob や agent 実行時に OS error が発生する。

## 影響

- 自動整合性検査がすべて実行不能
- 今後の integrity 検証が不可能
- 他の integrity 関連 item（regression test 等）の前提となる基盤

## 課題

### 1. 整合性スクリプト非機能（3本）

| スクリプト | サイズ | 状態 |
|-----------|--------|------|
| `check_integrity.ts` | 126 KB (1行) | 単一行化・パース不能 |
| `check_templates.ts` | 13 KB (1行) | 単一行化・文字化け（日本語） |
| `lint_skills.ts` | 8.7 KB (1行) | 単一行化・パース不能 |

- 最終変更コミット `e32b935` で破損
- 復元元: `e32b935` 以前のコミットに正常版が存在する可能性

### 2. agentdev-integrity broken junction

- `.opencode/skills/agentdev-integrity/` → junction 先 `src/opencode/skills/agentdev-integrity/` が存在しない
- namespace 分割（`e32b935`）時の残骸。`repo-agentdev-integrity` に機能移行済み

### 3. false positive 改善（3パターン）

| ID | 内容 | 対象 |
|----|------|------|
| INC-0001 | `parseMarkdownLinks` が inline code block 内を誤検出 | `check_integrity.ts` |
| INC-0012 | `cmd-deprecated-in-inventory` が文脈区別なし | `check_integrity.ts` |
| legacy-namespace | templates/ パスを false positive 検出 | `check_integrity.ts` |

## 既存要件との関連

- REQ-0108: 整合性検査要件
- REQ-0108-055: regression test fixture
- REQ-0108-045: 非リンク placeholder 記法

## 優先度

最高（他の integrity item の前提）

## 対応方針

1. git history（`e32b935` 以前）からスクリプト正常版を復元
2. broken junction `.opencode/skills/agentdev-integrity/` を削除
3. false positive 3パターンを修正（code block 除外、文脈区別追加、templates/ 除外条件追加）
4. エンコーディング破損の原因調査と再発防止策検討

## 元 item

- `2026-06-06-integrity-scripts-non-functional.md`
- `2026-06-06-integrity-broken-junction-agentdev-integrity.md`
- `2026-06-06-epic580-integrity-false-positives.md`
