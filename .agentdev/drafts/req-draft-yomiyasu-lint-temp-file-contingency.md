---
draft_type: req_draft
topic_slug: yomiyasu-lint-temp-file-contingency
status: draft
created_at: 2026-10-11T15:30:00+09:00
source_rus:
  - RU-0006
---

# draft-data

```yaml
work_type: maintenance

scale: standard

summary: >
  yomiyasu 検査専用本文ファイルの作成先を指示する project extension rule
  （yomiyasu-application-before-write）へ、workspace 外書込み guard による fail-closed 拒否時の
  contingency（(a) bash heredoc / node fs.writeFileSync（UTF-8 明示）によるリポジトリ外一時ディレクトリ
  作成、または (b) project root 内 git 管理対象外領域への作成先切替 + 検査後削除）を追記する。
  同一 rule 文面を持つ全 workflow extension（実測 7 ファイル: case-open / case-ready / case-run /
  case-close / case-auto / case-revise / issue）へ同一 contingency を適用する。guard の fail-closed
  契約は変更しない。REQ 行の変更は行わない。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      contingency の追記（RU-0006）。yomiyasu-application-before-write rule の lint 実行手順文面へ、
      検査専用本文ファイルのリポジトリ外作成が実行環境の workspace 外書込み guard により fail-closed
      拒否された場合の取扱を追記する。guard の解除・迂回を行わず、次のいずれかに切替える。
      (a) bash の heredoc または node の fs.writeFileSync（UTF-8 明示）によりリポジトリ外一時ディレクトリへ
      作成する、または (b) 作成先を project root 内の git 管理対象外領域（例: .agentdev/integrity/reports/）
      へ変更し、検査後に削除する。既存の置き場所指針（agentdev-workflow-case-open scripts/README.md
      「検査入力 JSON の置き場所指針」節: workspace 外 temp 禁止・project root 内限定・commit 対象外・検査後
      削除）と矛盾しない。当該指針の適用対象は横断依存検査の検査入力 JSON であり、yomiyasu lint の検査
      専用本文ファイルは対象外である。contingency (a) は Write ツールに代わる標準書込み手段（heredoc /
      node fs.writeFileSync）による同一作成先への代替経路であり、指針の workspace 外 temp 禁止
      （検査入力 JSON の置き場所規律）との矛盾を生まない。Windows 環境のパイプ・リダイレクト経由の本文渡し禁止規律（文字コード再符号化に
      よる本文破損防止）は現行のまま維持する。guard の fail-closed 契約（ブロックの解除・別 API 経路への
      迂回の禁止）を変更しない。
  - id: AG-002
    content: |
      適用範囲（RU-0006 受け入れ条件 (3)）。同一 rule（yomiyasu-application-before-write）文面を持つ
      全 workflow extension へ同一 contingency を適用する。本 draft 作成時点の実測では 7 ファイル
      （.agentdev/extensions/skills/ 配下の agentdev-workflow-case-open.yaml、case-ready.yaml、
      case-run.yaml、case-close.yaml、case-auto.yaml、case-revise.yaml、issue.yaml）が同一文面の rule を
      持つ。適用漏れ検証は test_strategy の機械的検索で担保する。

conflict_resolutions: []

artifact_actions: []

operation_units:
  - ou_id: OU-001
    source_ru: RU-0006
    target_req: REQ-098
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    note: >-
      REQ ファイル操作は持たない（実現系 OU）。yomiyasu 推敲の工程必須化（REQ-098）の適用手段である
      project extension rule 文面の補足であり、REQ 行・Design の変更を伴わない。
result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      .agentdev/extensions/skills/ 配下の全 yaml を対象に機械的検索（rg）で、
      yomiyasu-application-before-write rule を持つファイルのうち contingency 文面（guard 拒否時の
      切替手順: heredoc / node fs.writeFileSync / project root 内除外領域への切替）を含むものを数える。
      検索対象は rule 定義の instruction 文面に限り、他 rule・参照行は対象外とする。
    pass_criteria: |
      yomiyasu-application-before-write rule を持つ全ファイル（本 draft 時点の実測 7 ファイル）に同一
      contingency 文面が存在すること（適用ファイル数 = rule 保持ファイル数）。contingency 文面が
      guard の fail-closed 契約・置き場所指針・Windows パイプ・リダイレクト禁止規律の各現行規定と矛盾する
      表現を含まないこと。
    on_failure: |
      fix-and-reverify。適用漏れファイルを検出した場合は当該ファイルへ同一文面を追記して再検証する
      （部分適用は実行者の環境依存回復判断を残すため、記録留保では完了しない）。

realization_actions:
  - id: RA-001
    concern: 7 ファイルの workflow extension yaml への yomiyasu rule contingency 追記
    responsibility: >
      yomiyasu-application-before-write rule の文面を所有する各 workflow extension yaml。
      lint 実行手順の「検査専用本文ファイルを非永続領域〔一時ディレクトリ等のリポジトリ外〕に新規作成
      して lint のファイル引数実行を行い、検査後に当該ファイルを削除する」文面に続けて、guard ブロック時
      の contingency（AG-001 (a)(b)）を追記する。
    ownership_hints:
      - ".agentdev/extensions/skills/agentdev-workflow-case-open.yaml（rule 定義 L28-30 相当）"
      - ".agentdev/extensions/skills/agentdev-workflow-case-ready.yaml（L17-19 相当）"
      - ".agentdev/extensions/skills/agentdev-workflow-case-run.yaml（L21-23 相当）"
      - ".agentdev/extensions/skills/agentdev-workflow-case-close.yaml（L35-37 相当）"
      - ".agentdev/extensions/skills/agentdev-workflow-case-auto.yaml（L35-37 相当）"
      - ".agentdev/extensions/skills/agentdev-workflow-case-revise.yaml（L21-23 相当）"
      - ".agentdev/extensions/skills/agentdev-workflow-issue.yaml（L9-11 相当）"
      - "参照規律: scripts/README.md 検査入力 JSON の置き場所指針、worktree 操作の書込み guard 運用指針（いずれも変更対象外）"
    intent: >
      guard の fail-closed 拒否時（Issue #3552/#3585、Case #3605 で 3 Case 再発）に実行者が毎回切替先を
      自力判断する構造を解消し、標準回復手段を rule 文面へ事前規定する。extensions は project-local 資産
      （本リポジトリの git 管理対象）であり、配布物（src/common/**）は変更しない。
    verification_refs: [TS-001]
    source_items: [AG-001, AG-002]

review_dispositions:
  - id: RD-001
    source_ru: RU-0006
    source_item: RU-0006
    disposition: covered
    reason_code: covered
    reason: |
      extension rule への contingency 追記を AG-001 + RA-001 で採用。受け入れ条件 (1)(2)(3) を TS-001 で
      検証。RU の実現先候補は case-open.yaml を主記載としていたが、実測で同一 rule 文面を 7 ファイルが
      持つことを確認したため、受け入れ条件 (3)（同等 rule を持つ他 workflow extension へも同一 contingency
      適用）どおり 7 ファイルへ適用範囲を確定した（AG-002）。対象外（guard 本体の fail-closed 契約変更、
      AGENTS.md 等の共通規律変更、yomiyasu lint の実行方法変更）を AG-001 に反映。
    evidence:
      path: .agentdev/extensions/skills/agentdev-workflow-case-open.yaml
      section: yomiyasu-application-before-write rule（L30 の lint 実行手順に contingency 記述なしを実測確認。同一文面の rule を 7 yaml が保持）
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: false
```

# summary

RU-0006 を単独 Case として処理する。yomiyasu lint の検査専用本文ファイル作成先を指示する extension rule
（7 ファイルで同一文面）へ、workspace 外書込み guard による fail-closed 拒否時の contingency を追記する。
3 Case（#3552/#3585/#3605）で再発した guard ブロック時の実行者自力判断を標準回復手段の事前規定へ置き換え、
guard 契約・置き場所指針・Windows 文字コード規律は現行維持とする。
