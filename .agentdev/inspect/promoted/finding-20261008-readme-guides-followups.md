# README・guides の追随漏れ是正（DEC-044 注記・case-open 表記・Design 索引・DEC-018 欠番）

- 出所: inspect-docs 20261008T025952Z F-16・F-17・F-18・F-22（backlog-auto stage 1）
- 種別: 表現是正（索引・案内の追随）
- 対象: docs/README.md・docs/guides/command-selection.md・docs/decisions/README.md

## F-16: DEC-052 部分置換反映の非対称（docs/README.md 注記欠落 + DEC-044 superseded_by 欠落）

- target: `docs/README.md:146`（DEC-044 行）、`docs/decisions/DEC-044.md:8-9`
- evidence: docs/README.md の DEC 表では部分置換済み accepted DEC 行に注記を付与する慣行が一貫（DEC-028:130、DEC-036:138、DEC-040:142、DEC-041:143、DEC-043:145、DEC-045:147）だが DEC-044 行のみ DEC-052 による部分置換注記がない。また frontmatter も同一形態の部分置換済み accepted DEC（DEC-028/036/045/041）がすべて `superseded_by` を持つなか DEC-044 のみ `supersede_note` のみ。同一窓の DEC-041 側は整備済みで DEC-044 側が未整備。
- severity: medium / confidence: high
- source_of_truth: decision-lifecycle.md「部分置換の記録様式」+ DEC-028/036/040/045/041 の前例、DEC-044.md:8 supersede_note
- 処置方針: docs/README.md:146 へ注記追加、DEC-044 frontmatter へ `superseded_by: DEC-052` 追加の要否は RA 判定。
- docs-check route: docs/README.md DEC 表の部分置換注記有無と Decision Map（supersedes 関係）の整合検査 — 新規 IR または check_integrity 拡張候補。

## F-17: command-selection.md の case-open 出力表記が REQ-030・req-case-flow.md と不整合

- target: `docs/guides/command-selection.md:13`
- evidence: 「REQ ファイルまたは要件docがある | /agentdev/case-auto（内部 lifecycle の case-open 段階） | GitHub Issue」— req-case-flow.md:36 は case-open 出力「GitHub Issue（Root Case）、Definition Package、設計PR（実変更がある場合のみ）」、正（REQ-030.md:3,12,21-22）も同じ。隣接行 :12 は「Root Case、Definition Package と実行構造」と表記揺れ。
- severity: low-medium / confidence: medium-high
- source_of_truth: REQ-030-002/003/010、req-case-flow.md:36
- 処置方針: :13 の出力列を REQ-030 整合表記へ更新。

## F-18: docs/README.md の Design 索引が実在 Design 5 件を欠落（選択掲載基準不在の drift）

- target: `docs/README.md` Design 各節（:162-233）
- evidence: 実在かつ designs/README.md（正）に registered な Design のうち `foundations/multi-host-canonical-model.md`、`quality/textlint-quality-runtime.md`、`integrity/prose-quality-sentinel-checks.md`、`workflows/issue-title-policy.md`、`workflows/issue-lifecycle-records.md` の 5 件が docs/README.md 一覧にない。いずれも比較的最近の追加で追随停止の drift 徴候。逆方向（記載→実在）は全リンク解決済み。
- severity: medium / confidence: high（事実）
- source_of_truth: docs/README.md:181「完全一覧は Design インデックスを正とする」・designs/README.md
- 処置方針: (a) 5 件の追随追記、または (b) 分割誘導（docs/README.md の Design ドメイン別一覧を廃止し designs/README.md へ完全委譲。「主要 Design」選択掲載の基準が文書化されておらず drift を構造的に防げないため (b) を推奨）。
- docs-check route: docs/README.md Design 記載と designs/README.md の双方向差分検査 — AUTOGEN 対象拡張（readme-design-summary の自動生成）または新規 IR 候補。

## F-22: decisions/README.md に DEC-018 欠番の明記なし

- target: `docs/decisions/README.md`（全般）
- evidence: DEC-018 は実証 Case 撤回で物理削除済みの欠番（reports/experiment-case-withdrawal-inventory.md、v3-v4-crosswalk.md:53）。numbering-policy.md「欠番の扱い」節（:54。「欠番は各 README、索引類で『欠番』として明記し、実体不在と整合する」）は REQ に限定しない義務的規則だが、decisions/README.md に DEC-018 の言及がない（「欠番」言及は :224 の DEC-013 行 DEC-009 説明のみ）。
- severity: low / confidence: low-medium → 規範根拠により promote 払い出し
- source_of_truth: numbering-policy.md:54（義務規則。「既知の欠番」節 :58-70 は REQ 欠番のみ列挙し DEC 欠番レジストリを持たない）
- 処置方針: decisions/README.md へ DEC-018 欠番の明記を追記する（REQ 欠番の requirements/README.md・docs/README.md:24 明記例に倣う）。明記形式（DEC 表への注記行か、欠番説明節か）は req-define 側で確定する。本 finding は当初 defer 暫定だったが、numbering-policy:54 の義務規則が「明記要否の判定」を既に解決しているため規範未達の具体修正対象として promote に転換した（adversarial-review Stream A 指摘の受理）。

## F-21 の扱い（相互参照）

- F-21（docs/README.md DEC 表の supersede 注記全文埋め込み、:130/:138/:147）は F-18 と同根の「README 索引が詳細を抱え込む drift」構造だが、処置手段が異なる（AUTOGEN 生成元調整を伴う分割誘導・RA 判定推奨）。F-21 は本トリガでは defer（inbox 残置）とし、F-18 (b) 分割誘導を採用する際に F-21 も同時に再評価すること。

## review 検証記録（adversarial-review 2026-10-08）

- Stream A: F-16（README:146 注記なし・前例 6 行注記あり・DEC-044 frontmatter supersede_note のみ）、F-17（:13 vs req-case-flow:36 vs REQ-030）、F-18（5 件の実在と README 非掲載）、F-22（numbering-policy:54 義務規則と decisions/README の DEC-018 言及 0 件）を全て実測検証。F-22 の promote 転換を指摘（反映済み）。
- Stream B: F-16/F-17/F-18 の証拠一致を確認。F-21 と F-18 の同根関係を指摘（相互参照として反映）。
