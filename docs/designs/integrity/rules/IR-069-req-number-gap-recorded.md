---
title: "IR-069: req-number-gap-recorded"
status: accepted
created: 2026-09-17
updated: 2026-09-17
---

# IR-069: req-number-gap-recorded

| Field | Value |
|-------|-------|
| rule_id | IR-069 |
| description | REQ 番号（3桁帯 REQ-001〜REQ-999）の実体（active + retired）から欠番を算出し、`docs/requirements/README.md` と `docs/README.md` の両「欠番」明記と突合する。帯中（末尾予約枠を除く）の欠番が README 2件のいずれかで「欠番」を含む本文行（AUTOGEN 外）の REQ-NNN 単体または REQ-NNN〜REQ-NNN 範囲で明記されていない場合、無記録欠番として検出する。範囲明記の全番号が実体を持つ場合は陳腐化した欠番明記として検出する（REQ-087-002/003、Case #2917、RU-0034） |
| severity | strict（無記録欠番・陳腐化範囲明記ともに strict） |
| category | document-drift |
| detection_method | `check_integrity.ts`（`checkReqNumberGapRecorded`）による実体列挙と README 明記の突合。(1) `docs/requirements/REQ-{NNN}.md`（3桁帯のみ。4桁の旧番号帯は対象外）と `docs/requirements/retired/REQ-{NNN}.md` から実在番号集合を列挙する（retired 番号は欠番ではない）。(2) [1..最大番号] の欠番を算出し、最大番号の直前開区間（第2最大実在番号と最大番号の間）を末尾予約枠として許容する。(3) 両 README の「欠番」を含む行（AUTOGEN ブロック内を除外）から REQ-NNN 単体（実体不在のもの）と REQ-NNN〜REQ-NNN 範囲を明記主張として抽出する。実体が存在する単体トークン（採番由来などの文脈言及）は主張として扱わない。(4) 帯中の欠番が当該 README の主張でカバーされない場合、連番単位に集約して無記録欠番として strict fail する。(5) 範囲主張の全番号が実在する場合、陳腐化した欠番明記として strict fail する |
| affected_artifacts | [docs/requirements/REQ-*.md, docs/requirements/retired/REQ-*.md, docs/requirements/README.md, docs/README.md] |
| related_req | [REQ-087-002, REQ-087-003, REQ-010-068, REQ-010-070] |
| related_design | [../integrity-rule-catalog.md, ../../foundations/numbering-policy.md, ../checker-execution-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 低。検査対象は現行 3桁帯（REQ-{NNN}）に限定し、4桁の旧番号帯（v2:REQ-01XX）は検出しない。最大番号直前の末尾予約枠（並行 Case の共有予約・採番返却の過渡帯。REQ-083〜096 共有予約枠運用）は許容し、予約枠解消（当該番号の実体化または恒久欠番確定）後に帯中欠番として検出対象へ移行する。README の AUTOGEN ブロック内の言及は機械生成領域のため明記として数えない。実在番号の単体トークンは文脈言及として主張扱いしない（例: 「REQ-082 採番時」の REQ-082）。fixture リポジトリ（4桁 REQ 番号のみ、または単一 3桁番号）は帯空または末尾予約枠のみとなり検出しない |
| regression_test | `check_integrity.test.ts` describe "IR-069 req-number-gap-recorded (REQ-087-002/003, Case #2917)"。正常例（帯中欠番の両 README 明記）・違反例（無記録欠番・陳腐化範囲明記）・境界例（AUTOGEN 内のみの明記・4桁帯混在）・許容例（retired 番号・文脈言及）・再現例（RU-0034 形状: 帯中予約欠番の無記録 + 末尾予約枠の過渡帯許容）の 5 種 fixture。加えて describe "broken-req-ref range-span exemption (v2:REQ-0108-194, Case #2917)"（帯表現端点の broken-req-ref 除外と範囲外単独参照の継続検出） |
| finding_route | intake |
| triage_action | 無記録欠番は `numbering-policy.md`「既知の欠番」への記録と README 2件への「欠番」明記（AUTOGEN 外の本文行、REQ 接頭辞付きの単体または範囲表記）で解消する。陳腐化した範囲明記は実体の採番状態に合わせて範囲を修正する。末尾予約枠に属する番号は予約枠解消のタイミング（当該番号の実体化または恒久欠番確定）で既知欠番記録へ移行する |
| last_verified | 2026-09-17 |

## 検査項目

| # | 検査項目 | 失敗時 |
|---|----------|--------|
| 1 | 帯中の欠番（末尾予約枠を除く）が `docs/requirements/README.md` の「欠番」を含む本文行（AUTOGEN 外）で明記されていること | strict fail |
| 2 | 帯中の欠番が `docs/README.md` の「欠番」を含む本文行（AUTOGEN 外）で明記されていること | strict fail |
| 3 | 欠番明記の範囲主張（REQ-NNN〜REQ-NNN）の全番号が実体を持たないこと（陳腐化した範囲明記の検出） | strict fail |
| 4 | retired 配下の REQ 番号は欠番として扱わないこと | 設計要件 |
| 5 | 最大番号直前の末尾予約枠は「欠番」明記なしで許容すること（過渡帯の info 可視化） | 設計要件 |
| 6 | 検査対象を現行 3桁帯（REQ-001〜REQ-999）に限定し、4桁の旧番号帯を検出しないこと | 設計要件 |

## numbering-policy との関係

欠番の維持・明記義務は `numbering-policy.md`「欠番の扱い」「既知の欠番」が正規所有する。本ルールは同 Design が要求する「各 README、索引類で『欠番』として明記し、実体不在と整合する」状態の機械検証を担う。採番例外（ユーザー裁定による番号指定）の規定自体は numbering-policy「新規採番」が所有し、本ルールは採番結果としての欠番状態のみを検査する。

## exemption（許容条件）

| 対象 | 理由 |
|------|------|
| 4桁の旧 REQ 番号帯（v2:REQ-01XX） | 過去版の番号体系。現行 3桁帯の採番規則の対象外 |
| `retired/` 配下の REQ 番号 | 廃止済み識別子は実在として扱う（廃止は欠番を生じない、numbering-policy「廃止時の扱い」） |
| 最大番号直前の末尾予約枠 | 並行 Case の共有予約・採番返却の過渡帯（REQ-083〜096 共有予約枠運用）。恒久欠番と機械的に区別できないため info で可視化のみ行う |
| README の AUTOGEN ブロック内の言及 | 機械生成領域。手書きの明記は再生成で失われるため明記として数えない（明記は AUTOGEN 外の本文に置く） |
| 「欠番」行上の実在番号の単体トークン | 採番由来などの文脈言及（例: 「REQ-082 採番時」）。実体不在の単体トークンのみ明記主張として扱う |

## baseline 運用

導入時点（Case #2917、2026-09-17）の現行リポジトリは、REQ-063〜REQ-081（19連番）が README 2件に明記済み、REQ-084〜REQ-086 が末尾予約枠（共有予約枠 REQ-083〜096 の未使用・返却枠）として本ルールの検出対象外である。既知違反は存在しないため NG baseline の追加登録は行わない。予約枠解消後も実体化しない番号が残る場合は、numbering-policy「既知の欠番」への記録と README 明記を追加して解消する。

## See Also

- [integrity-rule-catalog.md](../integrity-rule-catalog.md)
- [rule-ownership.md](../rule-ownership.md)
- [../../foundations/numbering-policy.md](../../foundations/numbering-policy.md)（採番規則・欠番維持の正規所有者）
- [checker-execution-contracts.md](../checker-execution-contracts.md)（checker 共通実行契約）
