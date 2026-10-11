---
draft_type: req_draft
topic_slug: case-open-step4-mechanical-procedures
status: draft
created_at: 2026-10-11T15:30:00+09:00
source_rus:
  - RU-0001
  - RU-0004
  - RU-0005
  - RU-0010
---

# draft-data

```yaml
work_type: maintenance

scale: standard

summary: >
  case-open STEP-4 機械工程（prepare_definition_pr 呼び出しから Definition PR 作成まで）の手順明文化を
  4 RU 統合で行う。(1) 計測日収束の 2 段構造（計測日 AUTOGEN 更新 + IR-072 req-updated-freshness による
  frontmatter updated 追随）と generate_indexes 派生物の changedFiles 事後突合・明示パス指定補正 commit、
  (2) traceability gate の既存債務対照救済手順（findings 差分 0 件機械証明）と coverage union 結果の
  行単位帰着証明不可の注意、(3) docs 配下日本語変更を含む Definition PR 作成直後の yomiyasu 適用記録工程、
  (4) 新規 REQ/DEC ファイルの前段手動配置手順（DefinitionEdit の create 操作拡張は行わず現行契約の
  解釈を確定）を、case-open Design 機械工程契約節と配布 reference（definition-pr-and-idempotency.md）へ
  規定する。REQ 行の変更は行わない。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      計測日収束の 2 段構造と派生物突合補正（RU-0001）。計測日収束は (a) req-metrics の計測日 AUTOGEN 更新と
      (b) IR-072 req-updated-freshness による frontmatter updated 追随の 2 段検出であり、両方を同一 PR 内の
      追加 commit で収束させて初めて「計測日収束完了」と扱う手順を reference へ明文化する。
      generate_indexes の派生物（docs/README.md、docs/designs/quality/req-health-metrics.md の REQ 行数
      AUTOGEN 等）は script 実行後に確定するため stagePaths 事前包含は構造的に不能であり、commit 後の
      changedFiles 事後突合と stagePaths 外派生物の明示パス指定による補正 commit を標準 contingency として
      規定する。既存の工程順序契約（check_integrity / traceability-check は commit 後実行、generate_indexes は
      commit 前配置維持）と矛盾しないことを確認する。
  - id: AG-002
    content: |
      traceability gate の既存債務対照救済と coverage union 注意の明文化（RU-0004）。gate 判定仕様節へ、
      対象 REQ 行外の既存債務（corpus 全体の missing-implementation 等）による gate fail 時の対照救済手順
      （worktree HEAD と main HEAD の両方で check を実行し、findings が完全一致・差分 0 件であることを機械
      証明して本変更起因の検出悪化 0 件を根拠づけ、PR 作成可と判断する手順）を明文化する。対照救済は
      既存債務を本工程の失敗へ読み替えないことを機械証明する手続であり、対象 REQ 行内の missing-design には
      適用しない。missing-design 0 件ゲート節へ、coverage --req のカンマ連結指定が複数 REQ 行の union の
      関係一覧を返し行単位の design 対応帰着証明に使えない旨（行単位の確認は coverage 単行実行または
      check --req の missing-design findings による）を明記する。いずれの補足も「fail を pass へ変換しない」
      原則と整合する。判断と証跡は PR 本文の検証差分へ記録する。
  - id: AG-003
    content: |
      Definition PR 作成直後の yomiyasu 適用記録工程の追加（RU-0005）。docs 配下の日本語変更を含む
      Definition PR では、PR 作成直後に yomiyasu 適用記録（対象、実施結果、保持した指摘理由の最小限記録）を
      PR 本文または PR コメントへ記録する工程を PR 作成手順へ追加する。記録コメントの投稿完了までを
      STEP-4 の完了条件として扱い、記録欠落が case-ready の acceptance gate（マージ抑止）段まで搬送される
      構造を解消する。case-ready 側 acceptance gate の検出条件（PR 上に記録が存在すること）と整合し、
      既存の二重安全網は維持する。記録様式の新規定義は行わない（既存 PR 検証欄等への記録が rule の想定）。
      STEP-4 の完了検証（prepare_definition_pr 報告レビュー）との順序関係を崩さない。
  - id: AG-004
    content: |
      新規 REQ/DEC ファイルの前段手動配置手順の明文化と契約解釈の確定（RU-0010）。case-open Design
      「機械工程の script 呼び出し契約」節の「工程別 script 1 回の呼び出し」は Definition 編集（対象パス +
      旧文完全一致置換）の script 適用についての規定であり、新規 REQ/DEC ファイルの worktree 内前置作成を
      排除しない、と解釈を確定する。DefinitionEdit への create 操作（対象パス + 全文 content）の追加は
      行わない。前置作成手順（agentdev-git-worktree 標準手順 type=definition による worktree 前置作成、
      node の writeFileSync による UTF-8 明示での worktree 内配置、script の冪等再利用〔branch 確認済み
      worktree 再利用〕との整合）を reference の STEP-4 手順へ明文化する。

conflict_resolutions:
  - id: CR-001
    conflict: |
      RU-0010 の方向選択。(1) DefinitionEdit に create 操作を追加して REQ/DEC 新規作成を入力 JSON で
      表現可能にする、(2) 現行契約（旧文一致置換のみ）を正とし新規ファイル配置の前段手順を明文化する、
      の二方向が取り得る。
    resolution: |
      (2) を採用する。根拠: Case #3560 で前置作成構成（worktree 前置作成 + node writeFileSync 配置 +
      script 冪等再利用）が実証済みであり現行契約と整合する。(1) は入力スキーマ変更・script 実装変更を
      伴い、手順明文化を主とする本変更群と比較して変更規模が不釣合いである。契約の意味確定だけで新規
      REQ/DEC を含む Definition 変更の実行経路再現性（実装者依存の解消）を達成できる。(1) は将来の
      別 Case で再評価可能であり、本採択は不可逆な契約変更ではない。RU-0001 が RU-0010 の入力契約拡張を
      対象外明示しており、両 RU の対象範囲は本採用で整合する。

artifact_actions:
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: commands
      slug: case-open
    target_area: 機械工程の script 呼び出し契約（RU-0162）
    source_items: [AG-004]
    content: |
      「工程別 script 1 回の呼び出し」契約の解釈確定として、次を追記する: 本契約は Definition 編集
      （DefinitionEdit による対象パス + 旧文完全一致置換）の script 適用について規定するものであり、
      新規 REQ/Decision ファイルの worktree 内前置作成（agentdev-git-worktree 標準手順 type=definition
      による前置作成、node writeFileSync による UTF-8 明示配置）を排除しない。前置作成済みファイルは
      script の冪等再利用（branch 確認済み worktree 再利用）と整合して扱う。前置作成の具体的手順は
      配布 reference（definition-pr-and-idempotency.md）の STEP-4 手順が所有する。

operation_units:
  - ou_id: OU-001
    source_ru:
      - RU-0001
      - RU-0004
      - RU-0005
      - RU-0010
    target_design: docs/designs/commands/case-open.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      reference（src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md）の
      計測日収束節を対象に、(1) 2 段構造（計測日 AUTOGEN 更新 + IR-072 frontmatter updated 追随）の記述、
      (2) changedFiles 事後突合と明示パス指定補正 commit の記述、(3) 工程順序（generate_indexes は commit 前、
      check_integrity / traceability-check は commit 後）の維持記述を機械的検索（rg）と全文読取で確認する。
    pass_criteria: |
      (1)(2)(3) の規定が計測日収束節（または直後の補足節）に存在し、現行の工程順序契約記述と矛盾しない
      （generate_indexes の commit 前配置・後段 2 検査の commit 後実行が維持されている）こと。
    on_failure: |
      fix-and-reverify。追記が欠落・工程順序と矛盾する場合は reference の当該節を修正して再検証する
      （実行手順文書の欠落は実行時の初動消費・往復を残すため、記録留保では完了しない）。
  - id: TS-002
    target_item: AG-002
    verification: |
      reference の gate 判定仕様節と missing-design 0 件ゲート節を対象に、(1) 対照実行（worktree HEAD と
      main HEAD の check 実行、findings 差分 0 件の機械証明）による救済手順の記述、(2) 救済の適用対象外
      （対象 REQ 行内の missing-design）の記述、(3) coverage union 結果を行単位帰着証明に使わない注意
      （行単位は coverage 単行実行または check --req の findings で確認）の記述、(4)「fail を pass へ
      変換しない」原則との整合を機械的検索と全文読取で確認する。
    pass_criteria: |
      (1)〜(3) の規定が存在し、(4) 既存の gate 判定仕様（対象 REQ 行の missing-design 0 件判定、
      対象行外の missing-design は読み替えない）が変更されていないこと。
    on_failure: |
      fix-and-reverify。手順・注意の記述欠落または gate 判定仕様の改変を検出した場合は修正して再検証する。
  - id: TS-003
    target_item: AG-003
    verification: |
      reference の PR 作成手順節を対象に、(1) docs 配下日本語変更を含む PR での yomiyasu 適用記録工程
      （作成直後・対象・実施結果・保持した指摘理由の最小限記録）の追記、(2) 記録の PR 本文またはコメントへ
      の記録先、(3) case-ready 側 acceptance gate の検出条件（PR 上に記録が存在すること）との整合、
      を機械的検索と全文読取で確認する。
    pass_criteria: |
      記録工程が PR 作成手順に追加されており、記録の存在確認条件が case-ready 側の検出条件と矛盾しない
      こと。yomiyasu 適用 rule の記録義務（extension rule）が case-open STEP-4 手順上で履行可能な形式に
      なっていること。
    on_failure: |
      fix-and-reverify。記録工程の追記欠落・検出条件との不整合は case-ready でのマージ抑止往復が残る
      ため、修正して再検証する。
  - id: TS-004
    target_item: AG-004
    verification: |
      (1) case-open Design（docs/designs/commands/case-open.md）機械工程の script 呼び出し契約節に
      前置作成を排除しない解釈の追記があることを機械的検索で確認する。(2) reference の STEP-4 手順に
      新規 REQ/DEC ファイルの前段手動配置手順（worktree 前置作成・node writeFileSync UTF-8 明示・冪等
      再利用との整合）の追記があることを機械的検索と全文読取で確認する。(3) prepare_definition_pr.ts の
      DefinitionEdit が旧文完全一致置換のみである現行入力契約が変更されていないことを型定義の読取で
      確認する。
    pass_criteria: |
      (1)(2) の追記が存在し、(3) DefinitionEdit の入力契約（path / oldText / newText）に create 操作が
      追加されていないこと（現行契約の維持）。
    on_failure: |
      fix-and-reverify。解釈確定の追記欠落、または誤って入力契約拡張が実施された場合は修正して再検証する。

realization_actions:
  - id: RA-001
    concern: case-open 配布 reference（definition-pr-and-idempotency.md）への機械工程手順の 4 系統補足
    responsibility: >
      case-open STEP-4 機械工程の実行時手順を所有する配布 reference。計測日収束節・gate 判定仕様節・
      missing-design 0 件ゲート節・PR 作成手順節・機械工程の script 呼び出し節の該当箇所へ、
      AG-001〜AG-004 の手順規定を追記する。
    ownership_hints:
      - "src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md（計測日収束: 『traceability check の gate 判定仕様と計測日収束』節。対照救済: 同節の gate 判定仕様。union 注意: 『PR 作成（実変更がある場合）』節の missing-design 0 件ゲート。yomiyasu 記録: 同節の PR 作成手順。前段手動配置: 『機械工程の script 呼び出し（prepare_definition_pr）』節）"
      - "契約の正: docs/designs/commands/case-open.md「機械工程の script 呼び出し契約（RU-0162）」節"
    intent: >
      実証済み手順（Case #3552/#3550/#3560/#3603/#3605）を reference 規定へ昇格し、実行者が script 不具合や
      commit 漏れと誤診して意味判断をゼロから構築する余地と、case-open → case-ready 再委譲の往復を解消する。
    verification_refs: [TS-001, TS-002, TS-003, TS-004]
    source_items: [AG-001, AG-002, AG-003, AG-004]

review_dispositions:
  - id: RD-001
    source_ru: RU-0001
    source_item: RU-0001
    disposition: covered
    reason_code: covered
    reason: |
      計測日収束 2 段構造と generate_indexes 派生物 changedFiles 突合補正の reference 補足を AG-001 +
      RA-001（reference 計測日収束節・機械工程節への追記）で採用。受け入れ条件 (1)(2)(3) を TS-001 で検証。
      対象外（prepare_definition_pr.ts 入力契約拡張、check_integrity / IR-072 検出側変更）は本 draft で
      変更しない。
    evidence:
      path: src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md
      section: traceability check の gate 判定仕様と計測日収束
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0004
    source_item: RU-0004
    disposition: covered
    reason_code: covered
    reason: |
      既存債務対照救済手順と coverage union 注意の明文化を AG-002 + RA-001（gate 判定仕様節・
      missing-design 0 件ゲート節への追記）で採用。受け入れ条件 (1)(2)(3) を TS-002 で検証。制約
      （fail を pass へ変換しない、coverage は advisory、証跡は PR 本文検証差分へ記録）を AG-002 に反映。
    evidence:
      path: src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md
      section: gate 判定仕様 / missing-design 0 件ゲート
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_ru: RU-0005
    source_item: RU-0005
    disposition: covered
    reason_code: covered
    reason: |
      yomiyasu 適用記録工程の追加を AG-003 + RA-001（PR 作成手順節への追記）で採用。受け入れ条件 (1)(2) を
      TS-003 で検証。対象外（case-ready acceptance gate 変更・適用タイミング規律改訂・記録様式の新規定義）を
      AG-003 に反映。
    evidence:
      path: src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md
      section: PR 作成（実変更がある場合）
      checked_at_commit: null
    related_removed_items: []
  - id: RD-004
    source_ru: RU-0010
    source_item: RU-0010
    disposition: covered
    reason_code: covered
    reason: |
      DefinitionEdit create 操作対応の評価を AG-004 + CR-001（方向 (2) 現行契約正 + 前段手順明文化）で
      確定。受け入れ条件 (1)(2)(3) を ACT-DESIGN-001（Design 節の解釈確定）と TS-004 で検証。方向選択の
      根拠を CR-001 に記録。
    evidence:
      path: src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts
      section: DefinitionEdit interface（L53-60。path/oldText/newText の旧文一致置換のみを確認）
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: false
```

# summary

RU-0001・RU-0004・RU-0005・RU-0010 の 4 RU を統合し、case-open STEP-4 機械工程の手順明文化として
1 Case で処理する。統合根拠は同一対象（case-open Design 機械工程契約節 + 配布 reference
definition-pr-and-idempotency.md）・同一理由（未規定・未明文化による初動消費と工程間往復の解消）であり、
分割すると同一 reference への並行変更として横断依存検査の同一パス重複を生むためである。

負荷のかかる判断は RU-0010 の方向選択（CR-001）で、現行契約（DefinitionEdit は旧文完全一致置換のみ）を
正とし前段手動配置手順を明文化する方向を採用した。採用根拠と将来の再評価可能性を CR-001 に記録した。

実装は case-open Design 1 節の追記（ACT-DESIGN-001）と配布 reference の 4 系統補足（RA-001）であり、
REQ 行の変更は行わない。実行時の既知の派生物突合・対照救済・yomiyasu 記録・前置作成の各手順はすべて
過去 Case で実証済みの運用を規定へ昇格するものであり、新規の動作契約は追加しない。
