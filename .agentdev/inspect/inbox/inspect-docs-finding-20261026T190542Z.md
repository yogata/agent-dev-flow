# inspect-docs finding 20261026T190542Z

## サマリ

- 実行: backlog-auto stage 1、2026-10-27 JST（開始 03:47:27 JST）。対象版: `a7a0cdb8415b8ea53e1bd7f45e1cf9d1a44494cb`（main HEAD、origin/main 同期）。
- 対象: 現行 REQ 74件、廃止 REQ 19件、Decision 61件（受理済み52・superseded 9）、Design 185件、guides 13編+README、root/docs README、共通配布正本（skills 63・commands 18）。
- 本ファイルの検出事項: 15件（新規14件、既知増分を含む集約後）。severity 内訳: medium 2件（IDX-03、IDX-04）、low 13件。high severity は0件。
- 機械的検査の現状: check_integrity exit 1（後述の稼働 NG 6件）、check_content_corruption exit 1（IDX-04）、check_command_format / check_distribution_boundary / check_extensions / check_autogen_freshness / check_design_frontmatter / check_knowledge_docs は全部合格。
- 既存15ファイル（旧 finding）は変更していない。

## 検出事項リスト

### IDX-05: DEC-060 の部分置換注記も docs/README・decisions/README に表示されない（既知 IDX-01 の同型2件目）

- id: IDX-05
- category: README 索引診断（Decision 部分置換関係の表示）— 既知 IDX-01 の実質的増分
- target: `docs/README.md:180`、`docs/decisions/README.md:77`
- evidence: `DEC-060.md:7-8` は supersede_note（DEC-061 による決定(1)公開操作部分の置換）を持ち superseded_by は宣言しない。生成器 `generate_indexes.ts:1015` は supersededBy のみを注記生成条件とするため（機構不変）、DEC-060 行に部分置換注記が付かない。DEC-059（docs/README.md:179）と同型で、影響行が2行に拡大。DEC-061 受理（2026-10-20）で新たに発生した増分
- severity: low
- confidence: high
- source_of_truth: 承認済み `DEC-060.md:8`・`DEC-061.md:9-11` の部分置換宣言が正。README は判断根拠の正本ではなく分類・案内のビュー
- recommended_route: inspect-promote による分類後、既知 defer IDX-01 への増分併合。生成器が supersede_note／後継側 supersedes を索引注記に渡す拡張か、superseded_by 運用かの方針確定時に同時再評価
- ng_classification: pre-existing（delta 窓内 2026-10-20 DEC-061 受理で顕在化）
- notes: 2026-10-27 intake item（DEC-062 括弧内例示表記）は本件と無関係のため、本増分は未捕捉

### IDX-06: DEC-061 supersedes DEC-060 が Decision Map に未掲載。直後の DEC-062 は掲載済みで非対称

- id: IDX-06
- category: Decision 意味診断（後継チェーンの索引反映）— 既知 DC01 の実質的増分
- target: `docs/decisions/README.md:228-268`（Decision Map 表）
- evidence: `DEC-061.md:9-11` が supersedes DEC-060（決定(1)部分置換）を宣言し受理済み（2026-10-20）だが、Decision Map に当該行がない。一方、より新しい DEC-062（2026-10-26 受理）は `:268` に relates-to 行が追加されている。Decision Map は手動テーブル（AUTOGEN 検査対象外）で、連続する新規 Decision の一方のみ掲載という非対称が発生
- severity: low
- confidence: high
- source_of_truth: `DEC-061.md` frontmatter relations の supersedes 宣言（承認済み）
- recommended_route: inspect-promote による分類後、既知 defer DC01 への増分併合（DEC-061→DEC-060 行の追記、あわせて既知の欠落行群〔DEC-055→033 等〕の解消判断）
- ng_classification: pre-existing（delta 窓内 2026-10-20 で顕在化）
- notes: なし

### IDX-07: REQ-114-010/016 の行内 Decision 参照が DEC-059 のままで、行内容は DEC-060/DEC-061 由来に拡大（既知 RQ17 の拡大）

- id: IDX-07
- category: DRIFT（REQ 側 Decision 参照の鮮度）— 既知 RQ17 の実質的増分
- target: `docs/requirements/REQ-114.md:25`（REQ-114-010）、`:31`（REQ-114-016）
- evidence: `REQ-114.md:25` の行内 Decision 参照は「Decision `DEC-059` の適用規則」のみ。行本文は DEC-061 決定(1)(4) の内容（承認根拠付きカタログ内公開操作・読戻し確認までの workflow 完了・公開実行形態の set-state 記録）を含む。`DEC-061.md:20` が ADF-COVERS(decision): REQ-114-010, REQ-114-016 を宣言。REQ-114 は f3c082398（2026-10-20）で更新済みであり、既知 RQ17 の再評価条件「REQ-114 次回更新時」が発火したが指摘構造は存続・拡大
- severity: low
- confidence: high
- source_of_truth: 承認済み DEC-060/DEC-061 の ADF-COVERS 宣言（REQ-059 の規律では宣言の正は Decision 側 frontmatter。乖離ではなく REQ 側参照の鮮度問題）
- recommended_route: inspect-promote による分類後、既知 RQ17 への増分併合。intake（REQ-114-010 への DEC-060・DEC-061 参照追記。DEC-059 参照自体は DEC-060 決定(2)により正しいため追記のみ）
- ng_classification: pre-existing（delta 窓内 2026-10-20 f3c082398 で拡大）
- notes: 行内 Decision 参照必須の明文規約は未確認（既知 RQ17 の不確実性を引継）

### IDX-10: REQ-116-002 の「RA-005 判断」参照が一意解決不能・衝突

- id: IDX-10
- category: REQ 参照ID整合性（未解決参照）
- target: `docs/requirements/REQ-116.md:20`
- evidence: 現行 corpus 上の RA-005 は3系統で意味が異なる。(1) `docs/designs/workflows/v51-phase-transition-and-coexistence-model.md:76`（realization action 台帳: v4-standard-lifecycle の経路別所有境界と crosswalk の処遇記録）、(2) `docs/reports/req-053-*.md`（textlint Epic の Wave 記録名）、(3) `docs/designs/integrity/rules/IR-070-*.md:22`（RA-005 実被害形状）。REQ-116-002 の「RA-005 判断（代替の構造的等価性は同等以上と認めない）」はいずれとも一致せず、REQ 域の永続文書から解決できない
- severity: low
- confidence: medium
- source_of_truth: Design 側 RA 台帳（v51-phase-transition-and-coexistence-model）が RA 識別子の現行所有。REQ-116-002 自体は REQ-032-037・REQ-055 で実質の根拠を補完
- recommended_route: inspect-promote による分類後、intake（参照先を解決可能な正本への置換、または判断内容の直接引用へ改める）
- ng_classification: pre-existing
- notes: RA-005 が req-define 合意記録（AG/ACT 系と同族）として存在した可能性 — 消費済み成果物のため現行 corpus から現物確認不能（不確実性）

### IDX-11: REQ-110 TS-012 の消滅一時成果物識別子（RU-0242）への依存

- id: IDX-11
- category: 第一参照導線（恒常検証義務定義の一時成果物依存）
- target: `docs/requirements/REQ-110.md:75`（TS-012 行）
- evidence: `REQ-110.md:60` は「要件ドラフトの消費後も番号、条件の定義所在、検証義務を一意に再構成できる」と自己宣言するが、RU は case-ready 成功後に削除される一時成果物。v51 Design（:68）は同種の RU 出所参照を「履歴注記」として限定保持する慣行を持つのに対し、TS-012 は対象集合の特定手段として使用
- severity: low
- confidence: medium
- source_of_truth: REQ-008（一時成果物ライフサイクル）、REQ-110.md:60 の自己宣言
- recommended_route: inspect-promote による分類後、対象集合の恒常解決先（traceability yaml 宣言先）への参照統一候補
- ng_classification: pre-existing
- notes: 「工程系コマンドおよびワークフロースキル」という行内記述で実質特定可能なため解決不能とは言えない

### IDX-13: IR-069 detection_method の `REQ-{NNN}.md` 表記と「桁数上限なし」の整合

- id: IDX-13
- category: Design 意味診断（検出手続き記述の将来整合）
- target: `docs/designs/integrity/rules/IR-069-req-number-gap-recorded.md:16`
- evidence: description（:13）は「現行採番帯。桁数上限なし」（DEC-062 受理後の文言）だが、detection_method（:16）は `docs/requirements/REQ-{NNN}.md`（現行採番帯。旧4桁帯 v2:REQ-01XX は対象外）の3桁表面記法のまま。将来の4桁現行帯 REQ（REQ-1000+）の列挙対象性が表記上不明確
- severity: low
- confidence: low（{NNN} を汎用プレースホルダーとして読む解釈も成立。実装の実際の列挙方法はソース未読）
- source_of_truth: DEC-062（桁数上限なし）と IR-069 自身の description
- recommended_route: 観察として把握、または intake（表記の将来整合確認）
- ng_classification: pre-existing（delta 窓内 68f5492ad #3865 で残存）
- notes: なし

### IDX-14: v51-phase-driven-collaboration-model の ADF-COVERS(design) REQ-110-034..039 に本文節の裏付けなし

- id: IDX-14
- category: Design 意味診断（被覆宣言と本文の対応）
- target: `docs/designs/workflows/v51-phase-driven-collaboration-model.md:7`
- evidence: ADF-COVERS(design) が REQ-110-034..041 を宣言するが、本文に該当節があるのは 040（:37）と 041（:39）のみ。034..039（完了報告必須要素・decision 役割参照）に対応する design 記述が本ファイルに存在しない。docs/designs 内で REQ-110-034/038 を被覆宣言するファイルは本ファイルのみ
- severity: low
- confidence: medium（裏付け不在は確認済み。ただし ADF-COVERS の被覆契約が「節紐付け必須」なのか「ファイル単位の所有宣言」なのかの明文規約を未確認）
- source_of_truth: ADF-COVERS 宣言と Design 本文の対応関係。検証義務は REQ-110.md:74-77（TS-011〜014）が phase 系 skill 契約へ配分
- recommended_route: intake（被覆裏付け節の追加または宣言範囲見直し）
- ng_classification: pre-existing（delta 窓内 #3854/#3857 系で拡張）
- notes: なし

### IDX-15: guides/README.md の v5 導線節が語彙登録更新から取り残され docs/README.md と表記不統一

- id: IDX-15
- category: README 索引診断（表記統一）
- target: `docs/guides/README.md:28`
- evidence: a0eaefba2（語彙登録・索引再生成）は `docs/README.md:17` を「accepted な v5 基盤」→「採用済み（`status: accepted`）の v5 基盤」に更新したが、並行導線節 `docs/guides/README.md:28` は旧表記「accepted な v5 基盤と v5.1 の基準への導線」のまま
- severity: low
- confidence: high（差異の存在）／ medium（指摘適否）
- source_of_truth: a0eaefba2 の語彙登録趣旨（docs/README.md:17 の新表現）。guides README は案内層の自己宣言あり
- recommended_route: intake（語彙レジストリの適用範囲確認と guides/README.md:28 の追従可否判断）
- ng_classification: pre-existing（delta 窓内 a0eaefba2 で生じた不統一）
- notes: 語彙レジストリの適用対象に guides/README.md が含まれるかは未確認。意図的スコープ外の可能性あり

### IDX-16: phase 系3スキルの `templates/phase-readme.md` 参照が reference-path-existence NG（cross-skill 参照の検査扱い未確定）

- id: IDX-16
- category: 配布物整合性検査（cross-skill テンプレート参照の解決）
- target: `src/common/skills/agentdev-workflow-phase-tasks-create/SKILL.md:105`、`agentdev-workflow-phase-tasks-update/SKILL.md:105`、`agentdev-workflow-phase-artifacts-update/SKILL.md:185`
- evidence: 3ワークフロースキルが本文で「Capability Skill `agentdev-phase-theme-collaboration` の配布テンプレート（`templates/phase-readme.md`）」と参照。実体は `agentdev-phase-theme-collaboration/templates/phase-readme.md` に存在し、参照自体はスキル名を明示した意図的 cross-skill 参照（#3859 3ef748a8a で導入）。check_integrity の reference-path-existence は当該スキル内の相対パス解決不能として NG 3件（route: intake）を検出し、exit 1 の構成要素
- severity: low（意味的には解決可能な参照。機械検査の管轄扱いが未確定であることが問題）
- confidence: high（機械的事実）
- source_of_truth: check_integrity の reference-path-existence 検査契約と、agentdev-skill-resolution の親子解決モデル
- recommended_route: intake（cross-skill 参照表記の正規化〔例: スキル名とパスの結合表記〕、検査側の除外規則、または NG baseline 登録のいずれかを判断）
- ng_classification: pre-existing（delta 窓内 2026-10-24 #3859 で混入）
- notes: check_integrity 稼働 NG の内訳（reference-path-existence 3・warning-total-cap 1〔intake item 済み〕・untracked-residue 2〔別記〕）の一角

### IDX-17: REQ-110 適用範囲の「対象へ追記:」行の蓄積（観察メモ寄り）

- id: IDX-17
- category: DRIFT 予防（適用範囲節の構造）
- target: `docs/requirements/REQ-110.md:83-87`
- evidence: 「- 対象へ追記:」3行 +「- 対象外へ追記:」2行が無主題で列挙。同 delta の REQ-108.md:47-48 は「**対象（…の追加分）**:」の主題付き形式。追記が重なるたび履歴行が増え、現行適用範囲の単一ビューが崩れ始めている
- severity: low
- confidence: medium
- source_of_truth: REQ-001-068（安定契約の例外）域の適用範囲書式慣行
- recommended_route: 観察メモとして把握のみ、または low finding として REQ-108 形式への寄せ候補
- ng_classification: pre-existing
- notes: 追記行を後続整理する運用があるか未確認

## 機械的検査により確認済みの既知事項（新規検出事項に含めない）

- IR-055 warning_total_cap 超過（49→60、cap 58）: intake item `2026-10-27-ir055-warning-cap-exceeded.md` として処置判断引き取り済み。本診断では重複捕捉しない
- 未追跡 jev 観測2件（20261026T044415Z-ec41.json、20261026T044524Z-b76a.json）: check_integrity untracked-residue NG。利用者指示により既存ファイルを保持し、処置（コミット／gitignore／承認一覧登録）は backlog-auto 標準採否・HITL で扱う。前担当の「利用者がコミット禁止」主張は利用者原文未確認のため承認根拠にしない
- main root 未追跡残存（.tmp-jev-analysis/ 等）: intake item `2026-10-22-main-root-untracked-residue-disposition.md` として引き取り済み

## 既知項目の再評価結果（再報告しない判定の根拠）

- RQ16（REQ-110 TS 表の test ファイル名直書き）: 再評価条件「REQ-110 次回更新時」が発火。現物確認の結果 TS-001〜005/TS-010 で直書き6件存続、sidecar 正本宣言も不変 → 指摘構造存続、defer 継続が妥当
- DC02（DEC-059 承認記録の「supersede は発生しない」断定）: `DEC-059.md:62` 現物確認、変化なし
- GR12（multi-host-operations Command 対応表 stale）: 本範囲の同ガイド更新は cursor 表現の表層修正のみで対象表は未更新・変化なし。ただし再評価条件「同ガイド次回更新時」が発火しているため inspect-promote 側での再評価機会に注意
- GR13（現在像への導線に REQ-114/DEC-059/060 未接続）: 変化なし（DEC-061/062 も同構造で未接続・同一既知論点）
- IDX-01/DC01/RQ17: 上記 IDX-05/06/07 のとおり増分のみ報告
- DS36/DS37: 対象条件変化なし

## 参照

- 検出A〜H（REQ 体系担当）、DS38〜41（Design 担当）、候補1〜4（Decision/guides/README 担当）の3診断担当結果を fan-in 統合（重複2組を統合、横断矛盾なし、6観点網羅確認済み）
- 差分範囲: `abe519fc7..a7a0cdb84`（109コミット、docs 219ファイル +5200/-469）

## 推奨アクション

- docs-check 候補: REQ 要件表の空行分断検出（IDX-03）と、インライン fence マーカー奇数ラン検出の Design 域拡張適用（IDX-04 の偶数ラン姉妹例）を、既存 owner で検討する
- IDX-04 は docs-check gate を fail させている現行状態のため、次回 docs-check 実行前に是正（または ALLOWED_USAGE 登録）が必要

## 診断実施記録

- STEP-1: 対象収集。docs/requirements 94ファイル（現行74+廃止19+README）、docs/decisions 62、docs/designs 185、docs/guides 14、.opencode skills 63・commands 18
- STEP-2-0（機械的候補）: check_integrity（exit 1: 稼働 NG 6件）、check_command_format（OK）、check_extensions（OK）、check_distribution_boundary（OK 449/489走査・違反0）、check_autogen_freshness（OK・鮮度違反0）、check_design_frontmatter（OK・177検査対象・違反0）、check_content_corruption（exit 1・違反2件→IDX-04）、check_knowledge_docs（OK・37ファイル・違反0）。正規 docs-check（intake item 生成）は実行せず、スクリプト結果を機械的候補として取り込んだ
- STEP-2-1（並列委譲）: 読取専用3診断担当（REQ体系 10m11s、Design 11m08s、Decision/guides/README 7m15s）を並列起動し、全系統完了を確認。fan-in で6観点網羅・横断矛盾判定・重複排除（2組統合）・既知 defer 照合を実施
- STEP-3: 配布物整合性検査（親・逐次）。機械検査群の結果に加え、reference-path-existence NG 3件の実体確認（IDX-16: cross-skill 参照の意図性を特定）。コマンド索引 18件↔実ファイル 18件一致、BOM/CRLF 混在・奇数フェンスは機械検査合格
- STEP-3-3（未処理 artifact 確認）: intake inbox 11件、learning inbox 41エントリ。intake/learning/inspect の promoted、req-units、drafts は空。stage 2 以降の入力として報告し、存在だけを異常扱いしない
- 検証限界: 未変更 REQ/Design の全文読了ではなく差分範囲中心（構造チェックは全件）。Senpi 実機導入・実行・全接続テストは未実施。消費済み一時成果物（RU-0242、REQ-116 元合意）の現物確認は不能

## 実行上の逸脱と検証限界

- 正規 docs-check コマンド（intake item 自動生成・commit/push）は起動せず、検査スクリプト群の結果のみ機械的候補として取り込んだ（backlog-auto stage 1 の診断専用契約に従う）
- 機械検査スクリプトの実行は .agentdev/integrity/reports/ へのレポート生成を伴った（check_integrity の標準動作。レポートは commit 対象外）
- 診断担当の戻り値は中間成果であり、親が採用・修正・却下して統合した

## 対象外（Out of Scope）

- docs/src の修正、既存 finding の変更、採否判断、Issue/PR 操作、Git 永続化（STEP-4 で実施）
- intake/learning/RU の処理、Jev 観測の変更、end-to-end 状態の変更
- 全テスト、型検査、Senpi 実機検証

## 処理記録（2026-10-27 inspect-promote、backlog-auto stage 2 inspect 系統、--auto なし）

- promote 5件（IDX-03・IDX-04・IDX-08・IDX-09・IDX-12。全件自律確定、HITL 対象なし・破壊的変更なし）→ `.agentdev/inspect/promoted/finding-20261027-docs-mechanical-fixes.md` へ原状保存・本ファイルから削除。根拠: いずれも明確な不整合（機械検査 exit 1 の現行違反〔IDX-04〕、GFM 表分断〔IDX-03〕、title・README 現行化済みに対する本文旧用語残存〔IDX-08〕、行順序逆転〔IDX-09〕、Decision 参照の ID 化漏れ〔IDX-12〕）で正規情報源特定済み・修正対象行一意。IDX-04 の是正方向（表現修正 vs ALLOWED_USAGE 登録）と IDX-08 の knowledge 側包含は未決の実装判断として promoted 成果物側に記載
- defer 10件（本ファイルに残置）: IDX-05〔既知 IDX-01（20261019T143943Z）への増分併合・同時再評価〕、IDX-06〔既知 DC01（20261017T102200Z）への増分併合・同時再評価〕、IDX-07〔既知 RQ17（20261017T102200Z）への増分併合。再評価条件「REQ-114 次回更新時」発火済みだが行内 Decision 参照必須の明文規約が未確認のため指摘適否未確定〕、IDX-10〔参照先置換の正本未確定・RA-005 現物確認不能〕、IDX-11〔恒常解決先への参照統一候補で修正方向未確定〕、IDX-13〔confidence low・{NNN} 汎用プレースホルダー読み成立のため観察〕、IDX-14〔被覆契約が節紐付け必須かファイル単位所有宣言かの明文規約未確認〕、IDX-15〔語彙レジストリ適用対象に guides/README.md が含まれるか未確認〕、IDX-16〔参照表記正規化・検査除外規則・NG baseline 登録のいずれかの判断が未確定。check_integrity 稼働 NG 6件の構成要素〕、IDX-17〔観察メモ寄り〕。reject 0件
- 再評価条件（defer 分）: IDX-05 は IDX-01 と同一（Decision 索引掲載基準明文化時〔DC01 族同時〕または部分置換メタデータ運用確定時）、IDX-06 は DC01 族の同時再評価時、IDX-07 は RQ17 家族（RQ03/RQ10/RQ11）の同時再評価時、IDX-10 は REQ-116 次回更新時または RA 台帳側の参照解決先整備時、IDX-11 は REQ-110 次回更新時、IDX-13 は IR-069 次回更新時または4桁現行帯 REQ 出現時、IDX-14 は ADF-COVERS 被覆契約の明文化時、IDX-15 は語彙レジストリ適用範囲の確認時、IDX-16 は check_integrity reference-path-existence の cross-skill 参照取扱い確定時、IDX-17 は REQ-110 適用範囲節の整理時
- 分類は in-context 審議（legacy LLM パス）で全件自律確定。Jev 先行評価は本 run の git 永続化スコープ制約により不使用。STEP-5 adversarial-review は監査後の条件付き化発動条件（手動分類対象が存在し本質的争点が残る）を満たさないため生成せず（観測なし=契約どおり）
