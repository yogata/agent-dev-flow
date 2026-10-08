# inspect-docs finding 20261008T025952Z

- 実行日時: 2026-10-08T11:35〜12:00 JST（backlog-auto stage 1 として実行）
- 診断体制: STEP-2 意味診断は3診断担当への並列委譲（REQ 体系 / Design / Decision・guides・README、いずれも読取専用）+ 親の fan-in 統合（6観点網羅確認・横断矛盾判定・重複排除・既知 defer 照合・主要候補の親による file:line 再検証を実施、担当間矛盾なし、対象領域分離により重複候補なし）
- 前回診断: 20261006T151122Z（defer 残置分。10-07 実施の inspect-promote で promote 8件・defer 3件処理済み）。今回の対象差分は 10/7〜10/8 の正規コミット群（Case #3530 adf-v4-canonical-convergence: REQ-103 新設と 11 Design の design 宣言追随・RA-001〜RA-005・Case #3525 REQ-061-047/048・DEC-052 新設・Wave-3 完了訂正ほか。docs 65ファイル・配布物 48ファイル変更）
- 機械的検査（docs-check 検査スクリプト群）: check_integrity 0 new unmanaged NG・check_command_format OK・check_extensions OK・check_distribution_boundary OK（407ファイル 0 hits）・check_templates OK・check_autogen_freshness 0 件・lint_skills NG 2件 + WARNING 1件（F-26〜F-28）

## 処理記録（2026-10-08 inspect-promote、backlog-auto stage 2）

- promote 18件 → 成果物 9 ファイルとして `.agentdev/inspect/promoted/finding-20261008-*.md` へ保存: F-01+F-02（req103-internal-quality）、F-03（req103-req096-duplicate）、F-04（req008-059-heading-form）、F-05+F-06（req-row-impl-detail-cleanup-anchor）、F-08（adf-covers-design-body-mismatch）、F-11+F-13（supersede-wave-tense-fixes）、F-16+F-17+F-18+F-22（readme-guides-followups）、F-19+F-20（retired-req-decision-sync）、F-26+F-27+F-28（lint-skills-ng-resolution）
- reject 2件（intake promoted 成果物への包含により却下・即時削除）: F-09（command-file-format.md:40 旧語彙。intake `2026-10-08-dec036-old-vocabulary-residual.md` が target・処置指示・添削材料を完全保持）、F-10（「Definition Amendment PR」裸表記 4 Design。intake `2026-10-08-terminology-policy-scope-definition-amendment-pr.md` が docs 13 行の上位集合として保持）
- defer 8件（本ファイルに残置）: F-07・F-12・F-14・F-15・F-21・F-23・F-24・F-25
- 旧 defer 項目の統合解消: DS-19（20260928T145126Z）は F-13 に、RQ-15/RQ-17（20260926T180630Z）は F-05 cleanup anchor に統合（各ファイルに注記追記）
- 分類は adversarial-review 2 stream（Stream A 分類妥当性・Stream B 証拠適合/成果物化適性）の convergence 後に自律確定（HITL 対象なし・破壊的変更なし）

## 残置 defer 検出事項リスト

source-of-truth priority: 現行 REQ > 承認済み Decision > Design > guides。
NG 分類: false positive / pre-existing / 今回修正対象（docs-spec-rebuild-integrity NG 分類表に従う）。

### REQ 体系

#### F-07: REQ-030-024 の内部適用方式と content 全文適用の曖昧さ
- category: 分類違反（MOVE）+ 表現是正
- target: `docs/requirements/REQ-030.md:43`
- evidence: 「artifact_actions の update 系操作…は、対象セクション・対象行の全文を含む完全な content で適用すること」— REQ-008-030 は「UPDATE で対象成果物全体の全文を複製することは要求しない」と緩和しており、「完全な content」の範囲（変更後範囲の全文か対象成果物全体の全文か）が文面上曖昧。sidecar 両方向一致検査の内部適用手順は実装方式寄り
- severity: low / confidence: low
- source_of_truth: REQ-008-030〜033（content 完全確定義務の正規所有側）、document-model cleanup 対象カテゴリ2
- recommended_route: 観察メモ（曖昧解消自体が表現是正候補）
- ng_classification: 今回修正対象候補（本 delta で追加された行）だが契約意図は実行安全
- defer 理由: 単発・低優先。表現是正の機会は REQ-030 次回更新時（review 検証: 前回同型 F-07 も defer の前例あり、境界ケース）

### Design

#### F-12: v3-v4-crosswalk verification スコープ列挙の欠落
- category: Design間矛盾（割当漏れの疑い）
- target: `docs/designs/foundations/v3-v4-crosswalk.md:64`
- evidence: 「REQ-103-001〜007、010〜013、026〜031 の verification も…」— REQ-103-014/015（TS-009）と 023/024/025（TS-013/TS-014）が列挙から欠落。018/019/020/021/022 は各 Design・IR に割当済みだが 014/015/023〜025 の design レベル検証所有記述が docs/designs/ に見つからない（Wave-3 横断整合の実施記録は Report 側）
- severity: low / confidence: low-medium
- source_of_truth: REQ-103 受け入れ条件対応表（AC-13/14=TS-009、AC-20/21=TS-013/TS-014）
- recommended_route: 観察メモ（Report 側判定記録との突合で実害の有無を判断。列挙精度のみなら記録のみ）
- ng_classification: 今回修正対象の可能性（b84b623e/546b27db 由来）だが実害不確定
- defer 理由（review 検証済み）: docs/reports/req-103-ac-judgment-wave3.md:34/:35/:41/:42 に AC-13/14（REQ-103-014/015）・AC-20/21（REQ-103-023/024/025）の pass 判定記録が実在し実害なし。adversarial-review Stream A が defer 正当を検証。

#### F-14: 行番号参照のずれ
- category: 陳腐化参照
- target: `docs/designs/authoring/vocabulary-registry.md:73`
- evidence: 「v4-standard-lifecycle L13-21 への意味参照リンク行」— 現行の当該節は L14-23（1-2 行のずれ）
- severity: low / confidence: medium
- source_of_truth: v4-standard-lifecycle.md:14-23
- recommended_route: 表現是正候補（行番号参照を節名参照へ置換。行番号参照は陳腐化しやすい）
- ng_classification: pre-existing
- defer 理由: 軽微な単发表現修正。vocabulary-registry 次回更新時に節名参照へ置換。

#### F-15: v4 系 8 Design の「後続 Sequence」boilerplate（将来計画混入・低）
- category: 将来計画混入
- target: `v4-operating-model.md:14`、`v4-responsibility-boundaries.md:14`、`v4-runtime-execution-model.md:12`、`v4-durable-state-and-recovery.md:14`、`v4-quality-gate-model.md:15`、`v4-standard-lifecycle.md:12`、`v4-lifecycle-state-machine.md:13`、`v4-traceability-model.md:13`
- evidence: 「既存 Design 群の本モデルへの準拠更新（置換・廃止を含む）は後続 Sequence で段階的に実施する。」— REQ-103 全面収束完了後の現時点で無期限の「後続 Sequence」宣言が現行仕様文として残存。REQ-103-029 と緊張
- severity: low / confidence: low-medium
- source_of_truth: REQ-103-029、v3-v4-crosswalk 処遇実行原則
- recommended_route: 観察メモ（一斉文言修正は肥大。収束完了後の文言への更新は別課題化候補）
- ng_classification: pre-existing
- defer 理由: 8 Design 一斉の文言修正は自己評価により肥大と判断。収束完了後の文言更新は別課題化候補として記録。

### Decision・guides・README

#### F-21: docs/README.md DEC 表の supersede 注記全文埋め込み（README 内容過多）
- category: README 索引 内容過多
- target: `docs/README.md:101-155`（特に :130 DEC-028、:138 DEC-036、:147 DEC-045）
- evidence: 索引テーブルのタイトル列に部分置換の規範的詳細（どの決定を誰が置換し何を維持するか、status 維持宣言、後継 Design の節名まで）を全文埋め込み（DEC-036 行は索引 1 行として約 400 字超）。同一情報の正は各 DEC frontmatter と decisions/README.md Decision Map
- severity: low-medium / confidence: medium
- source_of_truth: REQ-001 文書責務、guides/README.md:19 導線原則、decisions/README.md:73
- recommended_route: 分割誘導候補（「タイトル＋superseded フラグ」程度へ縮約し詳細への導線リンクへ差替。AUTOGEN 生成元調整を伴うため RA 判定推奨）
- ng_classification: pre-existing（delta 窓の DEC-041 注記追加で増大傾向）
- defer 理由: AUTOGEN 生成元調整を伴う RA 判定事項。F-18 の (b) 分割誘導（README Design 一覧の designs/README.md 完全委譲）採用時に同時再評価する（promote 成果物 `finding-20261008-readme-guides-followups.md` に相互参照記載済み）。

#### F-23: artifacts-and-state.md の状態モデル制約が出典非明示
- category: guides 範囲超過（弱）
- target: `docs/guides/artifacts-and-state.md:147-155`
- evidence: 「REQ / Design の状態管理は Issue ラベル、GitHub Project で行う」「frontmatter や status フィールドによる状態管理は行わず…」等の規範的制約を列挙するが節内に REQ/Decision の出典参照がない
- severity: low / confidence: low
- source_of_truth: 正は REQ-049/REQ-008 系（推定）
- recommended_route: 観察メモ（出典参照の付加または節の所有者明記）
- ng_classification: pre-existing
- defer 理由: guides は source-of-truth 最下層で実害小。同一節は旧 defer GR-06（20261004T162140Z:61、状態遷移モデル否定の論点）が継続指摘中で、GR-06 の再評価時に同時扱いが自然。

#### F-24: intake-learning-backlog-flow.md の 13項目形式が出典非明示
- category: guides 範囲超過（弱）
- target: `docs/guides/intake-learning-backlog-flow.md:86-87`
- evidence: 「13項目形式で記録する。問題事象、…タグ」と学習エントリ形式を列挙するが所有者への参照がない（REQ-038 は形式を所有せず Design/SKILL 側へ委譲）
- severity: low / confidence: medium
- source_of_truth: learning-pipeline 系 Design/SKILL（推定）
- recommended_route: 観察メモ（形式規定の正への参照付加）
- ng_classification: pre-existing
- defer 理由: guides 最下層・参照付加以外の処置なし。learning-pipeline Design 次回更新時に対応。

#### F-25: multi-host-operations.md の日付付き実績スナップショット埋め込み
- category: 履歴混入（軽微・構造的に緩和済み）
- target: `docs/guides/multi-host-operations.md:24-31, 93`
- evidence: 「Wave 2 接続実装を統合した main（2026-10-02 時点）」「全公開 command の対応表（2026-10-02 時点、13件）」等の日付付き検証実績スナップショットを案内ガイドに埋め込み。ただし :113-124 で再生成手順を自前定義しており汚染は構造的に緩和済み
- severity: low / confidence: low-medium
- source_of_truth: guides 案内層原則
- recommended_route: 観察メモ（MOVE 候補: 実測状態を knowledge 側へ置き guide は導線化）
- ng_classification: pre-existing
- defer 理由: 構造的緩和済み（再生成手順自前定義）。GR-05 同型の前例 defer と同様の扱い。

## 観察メモ（対応不要・false positive 寄り）

- 旧行番号帯参照（自己説明付き）: `docs/requirements/REQ-003.md:56`（REQ-003-055/056、後継 REQ-096 明示）、`docs/requirements/REQ-082.md:12`（REQ-003-030〜054、当時の行番号帯と文脈明示）、`docs/requirements/retired/REQ-013.md:28`（REQ-006-040 dangling、:47 に履歴注記済み）— いずれも移管記録・履歴説明として正当。IR-067（旧行番号引用）の機械検査拡張時に要確認
- retired REQ 参照はすべて廃止注記付きで現行 authority 参照なし（REQ-014/015→REQ-016、REQ-003→REQ-016、REQ-010/036→REQ-028、REQ-095/102→旧 REQ-093、いずれも明示済み）
- Wave 構成ルール三段整合（REQ-061-010/038/047/048 ⇔ REQ-035-016/017 ⇔ REQ-034-012 系）は矛盾なし
- REQ-103 と 11 Design の design 宣言のうち専用節を備える 7 Design（v4-quality-gate-model、v4-runtime-execution-model、v4-durable-state-and-recovery、v4-responsibility-boundaries、v4-standard-lifecycle、vocabulary-registry、v3-v4-crosswalk、custom-tool-contracts の所有分担）は相互に単一所有を明示し重複なし（F-08 の 4 件を除く）
- git-error-messages.md 等 code fence 内テンプレート文言の見出し重複は誤検出（配布物構造異常なし。BOM・CRLF/LF 混在・未閉鎖 code fence とも 0 件）

## 既知 defer 項目の状況（前回 20261006T151122Z 残置分）

| 項目 | 状況 | 証拠 |
|---|---|---|
| F-07: IR-063:44 retired REQ-046-006 を「現行要件行」と呼ぶ表現 | 変化なし（defer 維持） | delta で当該行は未変更。再評価条件（誤解実害の観測、retired-req-primary-ref 機械検査実装）未発火 |
| F-10: authoring/ 将来拡張余地の重複言及 | 変化なし（defer 維持） | designs/README.md:249・command-file-format.md:17 とも文言変更なし。方針決定の条件未発火 |
| F-11: docs/README.md 要件欠番説明の内容過多 | 変化なし（defer 維持） | numbering-policy.md:64-70 と docs/README.md:23-26 の構図は不変（REQ-087/092/093 は retired 実体ありで欠番ではなく廃止扱い、整合） |
| GR-05: supervisor-credential-bridge.md:115 実測記録埋め込み | 変化なし（defer 維持） | 実測記録本文は残留（節再構成ありだが本質不変）。MOVE/REFERENCE 候補の性質不変 |
