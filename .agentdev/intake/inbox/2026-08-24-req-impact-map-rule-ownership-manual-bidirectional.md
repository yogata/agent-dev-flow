# req-impact-map と rule-ownership の逆方向対が手動双方向管理として残存

## 観測

PR #2432（Issue #2428、OU-001）の TS-009 検証により、`docs/designs/responsibilities/req-impact-map.md`（REQ → 影響するルール/アーティファクト）と `docs/designs/integrity/rule-ownership.md`（ルールドメイン → canonical REQ/Design）の逆方向対が「同期更新が必要」な手動双方向管理として残存していることが確認された。各 Design の備考にも「同期更新が必要なケースあり」と明記されている。

## 今回扱わない理由

OU-001 の委譲では docs/designs 配下は編集対象外（配布成果物 src/opencode 配下の正規化が対象）であるため、派生情報の一方向生成（生成 Script による導出）への移行は未実施。Issue #2428 の scope-affecting impact candidate では「派生情報の索引・逆引き表（一方向生成への移行候補）」として挙げられていたが、docs 側変更を要するため本 Case の範囲外とした。

## 影響

両表の片方だけを更新する変更で不整合が発生するリスクが残る（AG-009「派生情報の手動二重管理」の完全解消は未成立）。REQ-002-041 は Command/Workflow Skill 組の重複を対象としており、docs 側の逆方向対は本要件行の完了条件には含まれない。

## レビューで決めること

- 一方向生成への移行方式（どちらを正として導出するか、生成 Script の配置先）
- 移行を実施する Case の割当（独立 RU 化するか、既存 OU に含めるか）

## 根拠

- PR #2432 本文「Findings / Capture候補」intake 2件目（発見元: TS-009 検証）
- Issue #2428「Execution Contract」scope-affecting impact candidate（派生情報の索引・逆引き表（一方向生成への移行候補））
