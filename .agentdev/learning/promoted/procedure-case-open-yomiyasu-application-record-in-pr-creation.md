# case-open-yomiyasu-application-record-in-pr-creation

## 背景

case-open が docs 配下の日本語変更を含む Definition PR（PR #3551）を作成した際、extension rule（yomiyasu-application-before-write）の記録義務（yomiyasu 適用の対象、実施結果、保持した指摘理由の最小限記録）を履行しないまま PR を作成した。case-ready STEP-1 の acceptance_gates[2] 前置確認（yomiyasu 適用記録が PR 上に存在すること。不足時はマージせず対象文章の修正へ差し戻し）で記録不在が検出され、merge を実行できずに blocked 停止した（Issue #3550 / PR #3551）。適用の実施有無と記録の存在が別管理で、記録が存在しないと適用済みを証明できない構造が根本原因。

PR 作成直後に yomiyasu 適用記録コメントを投稿するまでを case-open STEP-4 の完了条件として扱えば、case-ready での検出→case-open 再委譲の往復（実害: blocked 1 回・再委譲往復コスト）を防げる。

## 問題

`src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md` の PR 作成手順に、「docs 配下の日本語変更を含む PR では作成直後に yomiyasu 適用記録を PR へ記録する」工程が存在しない（grep 実測: 同 reference 内に yomiyasu 表記なし）。acceptance_gates（case-ready 側ガード）は機能しているが、手順側の前置がなく、記録欠落が case-ready 段まで搬送されてから検出される構造になっている。

## 望ましい変更

definition-pr-and-idempotency.md の PR 作成手順に、docs 配下の日本語変更を含む Definition PR では作成直後に yomiyasu 適用記録（対象、実施結果、保持した指摘理由）を PR 本文またはコメントへ記録する工程を追加する。

## 対象範囲

### 対象

- `src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md` の PR 作成手順節

### 対象外

- case-ready 側 acceptance_gates の変更（既存ガードは正しく機能した。二重安全網として維持）
- yomiyasu 適用のタイミング規律自体の workflow 手順改訂（extension rules 読込の前置化は別件・今回 deferred で維持）
- PR 作成直後の記録以外の文書追加（Report記録の様式は agentdev-workflow-templates 側）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | `src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md` | PR 作成手順への yomiyasu 適用記録工程の追加 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: `.agentdev/extensions/skills/agentdev-workflow-case-ready.yaml`（acceptance_gates[2]。実測確認済み・機能中）/ `.agentdev/extensions/skills/agentdev-workflow-case-open.yaml` L32（「GitHub 文章は agentdev_gh へ渡す前に推敲」rule。記録義務は rules 節に存在するが、case-open reference の PR 作成手順には未反映）
- **ギャップ分類**: application miss（適用は rule に存在するが PR 作成手順に組み込まれておらず、記録欠落が下流検出になる）
- **ギャップ詳細**: rule の記録義務が case-open STEP-4 の手順工程として明文化されていないため、PR 作成者が記録を欠落させても case-open 側の完了検査で捕捉されない

## 制約

- case-ready acceptance_gates[2]（マージ抑止）は既存ガードとして維持する。本変更は手順側前置の追加であり、ガードの代替ではない
- 記録は最小限（対象、実施結果、保持した指摘理由）でよい。既存 PR 検証欄等への記録が rule の想定
- PR 作成直後の記録投稿までを STEP-4 完了条件に含める場合、STEP-4 の完了検証（prepare_definition_pr 報告レビュー）との順序関係を崩さない

## 受け入れ条件

- [ ] definition-pr-and-idempotency.md の PR 作成手順に、docs 配下日本語変更を含む PR の yomiyasu 適用記録工程（作成直後・最小限記録）が追加されている
- [ ] 記録工程は case-ready acceptance_gates[2] の検出条件（PR 上に記録が存在すること）と整合する

## 元learning item / 根拠

- **要約**: case-open が Definition PR へ yomiyasu 適用記録を残さず case-ready 受入ゲートが merge を抑止した（エントリ: 「case-open が Definition PR へ yomiyasu 適用記録を残さず case-ready 受入ゲートが merge を抑止した」）
- **根拠**: Issue #3550 / PR #3551 で発生。acceptance_gates[2] 前置確認（pr_read 本文と comment_list の双方に記録なし）で blocked 停止し、停止記録コメントを Root Case #3550 へ投稿。実害は case-open→case-ready 再委譲の往復 1 回。根本原因は適用の実施有無と記録の存在が別管理で、記録が存在しないと適用済みを証明できない構造
- **再発条件**: case-open が yomiyasu 適用を実施・未実施のいずれであっても記録コメントを投稿せず PR を作成した場合
- **横展開可能性**: docs 配下の日本語変更を含む Definition PR を作成する全 case-open 実行

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: docs
- **関連Issue**: #3550
