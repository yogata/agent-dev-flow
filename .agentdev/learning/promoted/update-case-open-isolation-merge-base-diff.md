# 並行 case-open 隔離検査の diff は merge-base 起点で実行する

## 背景
Case #3192 の隔離検査で `git diff --stat origin/main HEAD` が兄弟 Case の先行 push 分の
逆差分を含み、「自 Case 分のみ」の直接判定ができなかった。

## 問題
definition-pr-and-idempotency.md「並行 case-open の PR 作成前隔離検査」手順1は
merge-base と diff --stat を組み合わせるが、diff は origin/main 直指定のまま記載され、
並行 case-open の常態（origin/main 先行進行）で非自 Case 差分を含む。

## 望ましい変更
手順1の diff を `git diff --stat $(git merge-base origin/main HEAD) HEAD`（merge-base 起点）
へ変更し、HEAD 親と merge-base の一致確認（スタック検出）の併記を明文化する。

## 対象範囲
### 対象
- src/opencode/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md 手順1・Evidence 行
### 対象外
- 差分再構成救済手順（既存のまま）

## 反映先候補
| 種別 | パス | 変更内容 |
|---|---|---|
| 配布skill reference | definition-pr-and-idempotency.md | merge-base 起点 diff のコマンド形式への修正 |

## 既存対策確認
- **確認結果**: あり
- **該当ファイル**: definition-pr-and-idempotency.md L51
- **ギャップ分類**: fix gap
- **ギャップ詳細**: merge-base 起点の差分確認形式が未明示（origin/main 直指定のまま）

## 制約
REQ-030-017 の隔離検査要件自体は不変。

## 受け入れ条件
- [ ] 手順1が merge-base 起点の diff 形式を明示している

## 元learning item / 根拠
- **要約**: 隔離検査 diff の origin/main 直指定が並行実行で非自 Case 差分を含む
- **根拠**: #3192（docs/requirements/REQ-092.md +5 -3 に加え inbox.md -16 が表示→merge-base 起点で機械確認）
- **再発条件**: 並行 case-open 中に兄弟 Case が origin/main へ push した状態での隔離検査
- **横展開可能性**: 隔離検査・コンフリクト判定で origin/main 直指定 diff を使う全工程

## 推奨Issue分類
- **分類**: fix
- **推奨ラベル**: documentation
- **関連Issue**: Root Case #3192・Definition PR #3195
