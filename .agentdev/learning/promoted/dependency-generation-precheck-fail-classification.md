# dependency-generation-precheck-fail-classification

## 背景

worktree・新規 checkout 環境で依存生成手順（README「開発者セットアップ」の bun install && bun run build:engine）未実施のまま bun test を実行すると、textlint-guard の vendor 依存が未伝播の fail-closed 挙動により fail が大量に混入し（repo root 全体実行で 76 fail を観測）、変更起因の失敗との分類にスイート分解が必要となった。同一問題は 3 回発生（deferred L3617〔2026-10-08 移動・vendor 未生成環境で bun test ③ が 9-10 件 fail〕・L4037〔2026-10-11 移動・worktree 初回テスト 76 fail→依存生成後 184 pass〕・本件）しており、L4037 の処分判定は「判別前置の明記は再発時に統合具体化」として保持されていた。

## 問題

README セットアップ節は fail-closed 案内（「依存実体（vendor/ 配下）が未生成のまま導入系スクリプトや検査を実行すると、fail-closed で停止し上記手順が案内される」）を既に記載し、worktree-environment-fail-classification.md は由来分離 3 手手段（main root 対照実行・baseline 再現・同一条件実行）と「依存前提の実行形態別判断」表（textlint vendor・package 依存の script は bun install・vendor 生成が前置で必要）を持つ。しかし「依存生成済み/未生成の判別前置（vendor 配下 bundle・辞書の存在確認を実行前に確認する手順）」の明記は不在である（adversarial-review A 系実測: worktree-operations.md L167 は vendor 前置の必要性と fail-closed 挙動を既に記載するが L169-174 の伝播状態確認手順は node_modules 系のみ・L4037 が「checker 本体・README は未修正」を記録済み）。

## 望ましい変更

依存生成未実施環境の判別前置（vendor 配下 bundle・辞書の存在確認を実行前に確認する手順）と、依存由来 fail の判別指針（fail 明細が依存関連に集中することの確認・スイート分解による検査範囲確定）を、既存知識文書 worktree-environment-fail-classification.md への接続追記候補として提案する。追記は同知識文書 L35-37 の「検知導入は未解決論点として範囲外・解決は intake item 起票」との整合を保つ形（手順明記は知識内容の範囲内・機構導入は範囲外のまま）で行う。知識文書の更新は backlog-review の利用者承認後に docs/knowledge/ へ直接保存される正規昇華経路を経る。worktree-operations.md 依存整備節への vendor 判別前置補足は併記の情報候補とする。

## 対象範囲

### 対象

- docs/knowledge/worktree-environment-fail-classification.md（判別前置手順＋fail 明細の依存集中観点の接続追記候補。backlog-review 承認経由）
- src/common/skills/agentdev-git-worktree/references/worktree-operations.md（依存整備節への vendor 判別前置補足候補）

### 対象外

- vendor 空化の検知機構の導入・根本原因調査（worktree-environment-fail-classification.md L35-37 が未解決論点として範囲外宣言している領域）
- README セットアップ手順自体の変更（既存 fail-closed 案内は維持）
- bun test 正規形（QG-4 3 cwd 分割）の変更

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| knowledge（backlog-review 承認後に直接保存） | docs/knowledge/worktree-environment-fail-classification.md | 依存生成判別前置手順＋fail 明細の依存集中観点の接続追記 |
| 配布skill references（候補） | src/common/skills/agentdev-git-worktree/references/worktree-operations.md | 依存整備節への vendor 判別前置補足（node_modules 系確認手順との並置） |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: README.md セットアップ節（fail-closed 案内）、worktree-environment-fail-classification.md（由来分離 3 手手段・依存前提の実行形態別判断表）、worktree-operations.md L167（vendor 前置の必要性と fail-closed 挙動）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: vendor 系の判別前置（実行前の存在確認手順）の明記不在。既存記載は「前置が必要であること」の分類であり「実行前に確認する」手順ではない。3 回の実発生で判別コストが繰り返し発生

## 制約

- 追記は手順の明記に限定し、L35-37 の未解決論点（検知機構導入）を範囲外とする既存宣言を変更しないこと
- 知識文書の更新は backlog-review の利用者承認後に docs/knowledge/ へ直接保存される正規昇華経路を経ること（RU 化を経ない）
- 判別指針は fail-closed 案内出力との突合を基本とし、案内メッセージの実装変更を要求しない

## 受け入れ条件

- [ ] worktree-environment-fail-classification.md に、依存生成済み/未生成の判別前置手順（vendor 配下 bundle・辞書の存在確認）が追記されていること
- [ ] 追記が同文書の未解決論点宣言（検知機構導入は範囲外）と矛盾しないこと
- [ ] 依存由来 fail と検査 fail の判別指針（fail 明細の依存集中確認・スイート分解）が記載されていること

## 元learning item / 根拠

- **要約**: 依存生成未実施環境の判別前置の明記と依存由来 fail 分類の統合具体化（3 回目の再発による）
- **根拠**: 3 回の再発（L3617・L4037・本件）と判別前置明記の不在（実測）。L3617・L4037 は「判別前置の明記は再発時に統合具体化」の処分判定を持ち、3 回目の再発で統合具体化の機会。両先行エントリは promote 統合の根拠として本節と evaluation-report.md に証拠保存のうえ prune
- **再発条件**: worktree または新規 checkout 環境で依存生成を実施せず bun test を実行する場合（繰り返し起こり得る）
- **横展開可能性**: worktree・新規 checkout 環境全般（vendor 依存生成を要する plugin テスト・integrity suite）

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: docs
- **関連Issue**: なし
