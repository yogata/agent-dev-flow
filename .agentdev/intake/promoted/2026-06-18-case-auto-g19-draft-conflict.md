# case-auto G19 と case-open Step 18 のドラフト削除扱いの矛盾

## 観測

case-auto 実行中、case-open 完了後にドラフト（`.agentdev/drafts/req-draft-*.md`）を残置する事象が発生した。

- **case-open.md Step 18**: 「ドラフトが存在する場合、削除（Standard / Epic 全フロー共通）」と規定
- **case-auto Guardrail G19**: 「case-auto は draft を OU 情報の SSoT として扱い、独自の OU 状態管理を持たないこと（REQ-0114-058）」と規定

この2つの規定の関係性が明確でなく、実行エージェントが case-open 完了後もドラフトを残置する誤りを発生させた。実際の事象として REQ-0136 の case-auto 実行時に、case-open 完了後にドラフトを残置し、ユーザー指摘で削除するに至った。

## 影響

- case-open 完了後にドラフトが残置され、後続処理でドラフトと子Issue の二重管理状態になる可能性
- case-auto Step 4-1 のクリーンアップ検証ゲートで「ドラフト残存」として停止するリスク
- ドラフトの operation_units.result と子Issue のステータス追跡テーブルが乖離する可能性

## 既存要件との関連

- **case-open.md Step 18**: 「ドラフトが存在する場合、`.agentdev/drafts/req-draft-{topic-slug}.md` を削除（Standard / Epic 全フロー共通）」
- **case-auto Guardrail G19**: 「case-auto は draft を OU 情報の SSoT として扱い、独自の OU 状態管理を持たないこと（REQ-0114-058）」
- **case-auto Step 4-1**: 「ドラフトの operation_units セクションから OU 構造を読み取り、処理順序を決定する」→ 直後に「Epic Issue の子Issue 一覧を読み取る」が続く
- **REQ-0114-058**: G19 の根拠要件

## レビューで決めること

- case-auto G19 を case-open 完了前（req-save 段階）に限定する文言に明確化するか
- case-open 完了後は子Issue（Epic Issue のステータス追跡テーブル含む）が SSoT になることを case-auto に明記するか
- case-auto Step 4-1 の「ドラフトの operation_units から OU 構造を読み取る」と「クリーンアップ検証ゲート（ドラフト削除検証）」の順序関係を整理するか

## 根拠

- case-open.md Step 18: 「ドラフトが存在する場合、`.agentdev/drafts/req-draft-{topic-slug}.md` を削除（Standard / Epic 全フロー共通）」
- case-auto Guardrail G19: 「case-auto は draft を OU 情報の SSoT として扱い、独自の OU 状態管理を持たないこと（REQ-0114-058）」
- case-auto Step 4-1: 「ドラフトの operation_units セクションから OU 構造を読み取り、処理順序を決定する」と直後に「Epic Issue の子Issue 一覧を読み取る」が続く
- 実際の事象: REQ-0136 の case-auto 実行時に、case-open 完了後にドラフトを残置し、ユーザー指摘で削除
