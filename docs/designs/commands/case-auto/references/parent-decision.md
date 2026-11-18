---
title: bounded parent decision resolution
status: accepted
created: "2026-11-19"
updated: "2026-11-19"
---

<!-- 親: docs/designs/commands/case-auto.md から参照される詳細仕様（遅延読み込み）。 -->

# bounded parent decision resolution

## bounded parent decision resolution（REQ-034-032〜034、DEC-008）

本節は case-auto が下位 command から受領した decision_context をどの範囲まで自律解決し、どこでユーザーへ返すかの境界を規定する。
default-on + skip policy（REQ-014-013、REQ-015-002）により各 caller command で adversarial-review が原則実行される前提と、case-auto が中央集約 review engine とはならない前提（REQ-015-012）を両立するための限定的親判断解決である。

### 解決範囲

case-auto は下位 command から受領した decision_context について、当該判断事項が既存正規契約（REQ、Decision、Design、Issue その他合意済み情報）から導出できる場合、または case-auto の工程進行・実行調整に委譲された裁量（REQ-096-015）の範囲内にある場合は、ユーザー停止せず回答して下位 command を resume させる（REQ-034-032、DEC-008 決定1）。
判断の難易度、確信度、評価器間の不一致、結果状態、唯一解でないことは人間判断の発動根拠としない（REQ-096-004）。人間に留保された判断（REQ-096-005）と既存安全境界が要求する操作承認は既存の停止経路（blocked、req-define での再合意を要旨とする報告）に従う。
DEC-008 は歴史的判断記録として参照を維持し、本 Design の現行境界は REQ-096 / DEC-048 を正とする。

| 解決可否 | 条件 | case-auto の挙動 |
|---|---|---|
| 自律解決可能 | 正規契約から導出できる（REQ-096-003）、または case-auto の工程進行・実行調整に委譲された裁量（REQ-096-015）の範囲内 | 回答を下位 command へ返し resume させる（REQ-034-032） |
| 作業仮定で継続可能 | 外部仕様・互換性・データ保持・セキュリティ・対象範囲・受け入れ条件を変更しない可逆的内部詳細であり、既存契約で許容された範囲 | 作業仮定と根拠を明示した上で自走継続し、下位 command を resume させる（REQ-034-033、DEC-008 決定2） |
| ユーザー停止（上位合意矛盾） | decision_context が現行正規成果物間の矛盾に起因し、当該矛盾そのものが finding の対象 | 一方を勝手に採用せず停止し、停止理由分類「上位合意矛盾」でユーザーへ返す（REQ-034-034、DEC-008 決定3） |
| ユーザー停止（新規ユーザー判断事項） | 新しいユーザー価値判断、対象範囲変更、外部契約変更が必要（人間に留保された判断〔REQ-096-005〕の新規確定を含む） | 既存停止経路で停止し、停止理由分類「新規ユーザー判断事項」でユーザーへ返す（REQ-034-034、DEC-008 決定4） |

### 作業仮定の明示要件（REQ-034-033）

可逆的内部詳細を作業仮定で継続する場合、case-auto は作業仮定と根拠を明示する。
明示内容は下位 command への回答に含め、ユーザーが事後確認できる形とする。
外部仕様、互換性、データ保持、セキュリティ、対象範囲、受け入れ条件の変更は作業仮定の対象外であり、これらを変更する場合はユーザー停止（新規ユーザー判断事項）へ分類する。

### resume 機構（DEC-008 決定5）

case-auto は回答、根拠、または作業仮定を下位 command へ返し、既存 resume point（REQ-006-114）から処理を継続する。
新規の永続結果型を導入しない。
resume point の仕様は lifecycle-state-machine Design、delegation-contracts Design「review 経路での parent_decision_required / decision_context 適用」節に従う。
adversarial-review の再実行要否は adversarial-review 側の再 review 契約（REQ-014-007/008）に従い、case-auto は独自の再 review 条件を持たない。

### case-auto が行わないこと（REQ-015-012 維持、DEC-008 決定6）

bounded parent decision resolution においても、case-auto は中央集約 review engine とはならず、raw finding を解釈、採否、候補反映しない（REQ-015-012 維持、DEC-008 決定6）。
case-auto が解決対象とするのは下位 command が構造化した decision_context のみであり、下位 command が raw finding を case-auto へそのまま渡すことはない（REQ-034-032、AG-006）。
各 caller command は自身が所有する候補について finding の意味解釈、採否、候補への反映を維持する（REQ-014-006、REQ-015 caller integration）。

### 停止理由分類との関係

本節の「上位合意矛盾」「新規ユーザー判断事項」は前述「停止理由分類（REQ-034-015/108 拡張）」節の分類軸へ統合される。
case-auto が decision_context を自律解決できずユーザー停止へ分類する場合、本2分類のいずれかを停止理由として報告する。
HITL 境界の変更ではなく、既存停止経路（REQ-034-022）の分類精度向上である。
