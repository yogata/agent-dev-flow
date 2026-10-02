# REQ-082.md:12 の「現行の REQ-003 は …029 → 055」記述の現状乖離（phantom citation の温床）

- **分類**: inspect finding promote（F-03・severity low・confidence medium）
- **由来**: inspect-docs finding 20261002T154006Z（backlog-auto stage 1）

## 観測（evidence）

- `docs/requirements/REQ-082.md:12`「（REQ-003-030〜054 は当時の行番号帯であり、現行の REQ-003 は …029 → 055。）」
- REQ-003-055/056 は 2026-10-01 に REQ-096 へ移管され廃止済み。「現行の」という語を使いながら旧状態を記述し、REQ-003-055 が現行であると誤認させる
- REQ-087-001 採番例外記録としての意図的保持の可能性は残るが、「現行の」語の使用が現状記述と矛盾している点は確定

## 影響課題

REQ-003-055 phantom citation 3箇所（REQ-003.md:56・v4-responsibility-boundabilities.md 2箇所）と並ぶ誤認導線。REQ-082 を読んだ実装者が REQ-003-055 を現行参照してしまう温床。

## 対応候補

「現行の REQ-003 は …029 → 055」を「当時の REQ-003 は …029 → 055（055/056 は 2026-10-01 REQ-096 移管で廃止）」等の履歴参照形式へ文面更新。

## 既存要件関連

現行 REQ-003.md:56（廃止記録）を正とする。REQ-087-001（採番例外記録の意図）は更新時に維持。

## 統合注記（backlog-review での統合判定候補）

- intake promoted `2026-10-01-3293`（REQ-003-055 phantom citation 現行化）と同一バッチでの文面更新候補。統合を backlog-review で判定。
