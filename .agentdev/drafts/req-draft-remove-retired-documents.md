---
draft_type: req_draft
topic_slug: remove-retired-documents
status: saved
created_at: 2026-07-20T00:00:00+09:00
source_rus: []
spec_actions_consumed: true
---

<!-- req_draft テンプレート
  このテンプレートは req-define が生成する構造化引き継ぎ成果物の原本である。
  後続工程（req-save/ spec-save/ case-open/ case-auto/ case-run/ case-close）が参照する
  原本の情報源は # draft-data 内の YAML コードブロックであり、人間可読 Markdown セクションではない。
  soft contract（生成元側標準）であり、LLM 推論経由で消費される。
  厳格なスキーマバージョン、JSON Schema、バリデータは導入しない。 -->

# draft-data

```yaml
# work_type: maintenance（既存文書体系の整理・削除作業。機能追加でもバグ修正でもない）
work_type: maintenance

# scale: maintenance では未設定でよい
scale:

# summary: 当該 draft が何を合意したかの1段落要約
summary: |
  docs/adr/retired/（ADR 23ファイル）と docs/requirements/retired/（REQ 58ファイル＋README）の計82ファイルを物理削除し、削除によって生じる参照切れ・インデックス不整合・検査除外定義の陳腐化を即時に修復する。retired という概念自体と IR ルール群（IR-015/025/027/036/037/040/041/043 等）は将来のために維持し、REQ-0108 の改訂は行わない。履歴情報（Decision Map、mapping-table.md の対応表）は残し、実体ファイルへのリンクを外してテキスト注記（例: (旧REQ、削除済み)）へ置換する。AUTOGEN block は generate_indexes.ts の再実行で自動再生成する。

# auto_gate: case-auto 自走可否の判定材料
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

# agreed_items: 合意された個別項目
agreed_items:
  - id: AG-001
    content: |
      docs/adr/retired/ 配下の ADR-0001〜ADR-0023（23ファイル、連番・欠番なし）を物理削除する。
      ディレクトリ自体も削除し、空ディレクトリを残さない。
      これらは ADR-01XX 現行基盤導入に伴い retired/ へ移動された歴史的決定記録であり、
      現行アーキテクチャの基盤は ADR-0101 以降の ADR-01XX にあるため、実体削除しても現行判断基盤は影響を受けない。

  - id: AG-002
    content: |
      docs/requirements/retired/ 配下の REQ-0001〜REQ-0050（欠番あり、50ファイル）、
      および REQ-0111, REQ-0115, REQ-0116, REQ-0117, REQ-0118, REQ-0120, REQ-0121, REQ-0122（8ファイル）、
      ならびに README.md（retired 索引）の計59ファイルを物理削除する。
      ディレクトリ自体も削除する。
      これらは REQ 体系再構成（2026-05-30）および OU-04/05/06 再編成で retired となった REQ 群であり、
      恒久内容は REQ-0101〜REQ-0133 の現行セットへ移行済みであるため、実体削除しても現行要件判断は影響を受けない。

  - id: AG-003
    content: |
      削除によって生じる参照切れ（broken-reference）、インデックス不整合（DOC-MAP、各 README、mapping-table）、
      件数表明の陳腐化（docs/README.md、DOC-MAP.md の AUTOGEN block）、検査除外定義の陳腐化（obsolete-path-map.yaml、
      integrity-contracts.md の retired 領域エントリ）を即時に修復する。
      修復対象は .omo/plans/retired-documents-removal.md の節5.2「編集対象」一覧（21ファイル）に列挙したとおり。

  - id: AG-004
    content: |
      retired という概念自体と関連 IR ルール群（IR-015, IR-025, IR-027, IR-036, IR-037, IR-040, IR-041, IR-042, IR-043）
      は本作業では廃止せず、将来の retired 復活に備えて維持する。
      REQ-0108（docs-check / Validation / Tests）、REQ-0101（文書・REQ管理基準）、REQ-0112（ADRライフサイクル）の
      retired 関連条項は、retired 実体が存在しない状態を許容する形で残す。
      完全廃止が必要な場合は別途 req-define を起票して REQ-0108 改訂連鎖を行う（本作業のスコープ外）。

  - id: AG-005
    content: |
      履歴情報は残す。具体的には以下の対応をとる。
      (a) docs/adr/README.md の Decision Map（ADR-0101 supersedes ADR-0005 (retired) 等）:
          テキスト注記は維持し、実体ファイルへのリンクがあれば外す。
          履歴関係性（supersedes / relates-to / superseded-by）は ADR-01XX の本文と Decision Map で参照可能。
      (b) docs/adr/README.md の関連 REQ 表で retired REQ（REQ-0115 等）への絶対パスリンク:
          [REQ-0115](../requirements/retired/REQ-0115.md) (retired) → REQ-0115 (旧REQ、削除済み) のテキスト表記へ。
      (c) docs/requirements/mapping-table.md の旧REQ→現行REQ対応表（22-81行）:
          対応表自体は維持。各エントリの「retired 文書は retired/REQ-XXXX.md を参照」リンク表記を削除し、
          移行判定（migrated / retired-no-successor / historical-only）と移行先のみ残す。

  - id: AG-006
    content: |
      AUTOGEN block（docs/README.md, docs/DOC-MAP.md, docs/adr/README.md, docs/requirements/README.md の各対象領域）は、
      .opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts を再実行することで自動再生成する。
      実体ファイルが削除されることで各 AUTOGEN block の retired 関連エントリは空になるはずである。
      人手編集領域の件数表明（例: docs/README.md の「廃止済み REQ は削除せず requirements/retired/ に移動し〜」）と
      説明文は手動で修正する。Windows 環境のため edit ツール（per-line replace）を使用し、Write ツールは使わない
      （AGENTS.md 既存UTF-8ファイル編集規定、cp932 化け回避）。

  - id: AG-007
    content: |
      src/opencode/ 配下の配布物（agentdev-adr-file-manager/SKILL.md、agentdev-learning-capture/references/example.md、
      commands/agentdev/req-save.md、commands/agentdev/spec-save.md）に残る retired/ への言及は、
      廃止確定時のフロー記述（「retired/ ディレクトリへ移動」等）を「物理削除」へ修正する。
      agentdev-inspect-skills/SKILL.md（3行、69行）の retired REQ/SPEC 検出の記述は、retired 概念を維持するため確認のみで修正不要。

# artifact_actions: REQ/ADR/SPEC への保存対象を成果物別ではなく1つの配列に統合
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: REQ-0101
    source_items: [AG-004]
    content: |
      ## 変更点
      文書・REQ管理基準（REQ-0101）のうち、retired 領域の取り扱いを規定する条項（REQ-0101-063 等）について、
      retired/ ディレクトリの実体が存在しない状態を許容する記述へ整理する。
      「廃止済み REQ は docs/requirements/retired/ に配置」といった路径規定は、
      「廃止済み REQ は物理削除する、または retired/ へ移動する（運用時判断）」のように、
      物理削除を第一選択肢として認める形へ緩和する。
      条項の廃止は行わず、運用上の選択肢を拡張する形での update とする。

  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: REQ-0108
    source_items: [AG-004]
    content: |
      ## 変更点
      docs-check / Validation / Tests（REQ-0108）のうち、retired 領域に関連する条項
      （REQ-0108-070-088、REQ-0108-136、REQ-0108-240/242/243/249/250/251 等）は維持する。
      IR ルール群（IR-015, IR-025, IR-027, IR-036, IR-037, IR-040, IR-041, IR-042, IR-043）も廃止しない。
      変更は、retired 実体が存在しない状態であっても IR ルールがエラーを起こさないことの確認を要件条項へ明記する程度。
      REQ-0108-083（mapping table 全件記録）については、mapping-table.md の対応表は残すため条項変更不要。

  - id: ACT-REQ-003
    artifact: req
    operation: update
    target: REQ-0112
    source_items: [AG-004]
    content: |
      ## 変更点
      ADRライフサイクル・文書体系基盤・実行時独立性（REQ-0112）のうち、
      retired ADR の運用を規定する条項（REQ-0112-047, REQ-0112-048）は維持する。
      「廃止済み ADR は docs/adr/retired/ に配置」という路径規定について、
      物理削除を第一選択肢として認める形へ緩和する点のみ update する。
      ADR status の正規化、Decision Map の関係性表記は現行どおり維持する。

  - id: ACT-SPEC-001
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: foundations
      slug: document-model
    target_area: "## 文書種別マトリックス"
    source_items: [AG-003, AG-005]
    content: |
      ## 変更点
      docs/specs/foundations/document-model.md のうち、retired パスを明示する以下の箇所を修正する。
      - 164行付近: ADR 状態遷移の記述で「ADR-0001〜0099 は docs/adr/retired/ に配置された履歴番号帯である」
        →「ADR-0001〜0099 は過去に存在した履歴番号帯である（実体は2026-07-20に物理削除）」
      - 223行付近: ADR ID の記述で「旧番号帯 ADR-0001〜0099 は廃止（docs/adr/retired/）」
        →「旧番号帯 ADR-0001〜0099 は廃止（実体は物理削除済み）」
      - 227-228行付近: 配置規定「廃止 REQ | docs/requirements/retired/ に配置」「廃止 ADR | docs/adr/retired/ に配置」
        →「廃止 REQ/ADR は物理削除する。ただし運用上 retired/ への移動も選択肢として残す」
      - 280行付近: 廃止文書参照時の (retired) 注記規定は維持（履歴情報を残すため）
      - 302行付近: 世代交代の例「旧番号帯は docs/adr/retired/ に配置」→「旧番号帯は物理削除済み（過去の運用）」
      - 386-387行付近: 履歴参照としての (retired) 注記は維持

  - id: ACT-SPEC-002
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: foundations
      slug: numbering-policy
    target_area: "## 廃止識別子の取り扱い"
    source_items: [AG-003]
    content: |
      ## 変更点
      docs/specs/foundations/numbering-policy.md の37行付近、
      「REQ、ADR、IR を廃止した場合、当該識別子は再利用しない。廃止済みファイルは各 retired/ ディレクトリへ移動し、
      履歴参照に限定する。」という規定について、「retired/ ディレクトリへ移動」を「物理削除、または retired/ ディレクトリへ移動」
      へ緩和する。識別子の再利用禁止（欠番維持）は現行どおり維持する。

  - id: ACT-SPEC-003
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: foundations
      slug: patterns
    target_area: "## URL 参照形式"
    source_items: [AG-003]
    content: |
      ## 変更点
      docs/specs/foundations/patterns.md の137行付近、URL 参照形式の例として
      「docs/adr/retired/ADR-0001.md → https://github.com/.../docs/adr/retired/ADR-0001.md」が掲載されている。
      本例は retired ADR への GitHub URL 参照例だが、実体削除後は URL が 404 となるため例自体を削除する。
      89行付近の retired-no-successor 判定（migrated / retired-no-successor / historical-only の説明）は、
      移行判定区分として維持するため修正しない。

  - id: ACT-SPEC-004
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: integrity
      slug: integrity-contracts
    target_area: "## docs-check delta 検出における除外設定方針"
    source_items: [AG-003]
    content: |
      ## 変更点
      docs/specs/integrity/integrity-contracts.md の213行付近、「正当な除外（legitimate exclusions）」表の
      「retired 領域 | docs/requirements/retired/**、docs/adr/retired/** | 履歴参照用。旧表記を履歴として残すことを許容する」
      という行を削除する。実体ディレクトリが存在しなくなったため、当該除外エントリは意味を成さない。
      他の正当な除外（ルール自己参照、コードブロック内部、template placeholder）は現行どおり維持する。

  - id: ACT-SPEC-005
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: integrity
      slug: obsolete-path-map
    target_area: "scope:"
    source_items: [AG-003]
    content: |
      ## 変更点
      docs/specs/integrity/obsolete-path-map.yaml の scope.exclude（46-47行）から以下の2行を削除する。
        - "docs/requirements/retired/**"
        - "docs/adr/retired/**"
      実体ディレクトリが存在しなくなったため、除外エントリは不要。
      scope.include、entries、legacy_local_generation_vocabulary など他のセクションは修正しない。

  - id: ACT-SPEC-006
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: skills
      slug: agentdev-adr-file-manager
    target_area: "## 現行 ADR と廃止 ADR の区別"
    source_items: [AG-003]
    content: |
      ## 変更点
      docs/specs/skills/agentdev-adr-file-manager.md の26行付近、
      「現行 ADR（docs/adr/ADR-01XX.md）と廃止 ADR（docs/adr/retired/ADR-00XX.md）の区別」について、
      「廃止 ADR は物理削除、または docs/adr/retired/ へ移動する。運用上の選択」へ修正する。
      agentdev-adr-file-manager スキル自体の責務（ADR 作成、status 正規化、採番）は変更しない。

  - id: ACT-SPEC-007
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: skills
      slug: agentdev-req-file-manager
    target_area: "## 旧 REQ 群の取り扱い"
    source_items: [AG-003]
    content: |
      ## 変更点
      docs/specs/skills/agentdev-req-file-manager.md の42行付近、
      「旧 REQ 群（REQ-0001〜0050、retired）を履歴参照として扱い、現行判断の根拠としない」について、
      「旧 REQ 群（REQ-0001〜0050）は2026-07-20に物理削除済み。mapping-table.md の対応表で移行履歴を参照可能」
      へ修正する。REQ ファイル管理スキル自体の責務（REQ 作成、採番、validation）は変更しない。

# conflict_resolutions: 壁打ちで解消された衝突の記録
conflict_resolutions:
  - id: CR-001
    conflict: |
      retired 文書を完全削除すると、過去の判断経緯（なぜその判断したか、いつ変更したか）が追えなくなる。
      特に ADR-0001〜0023 は ADR-01XX 導入時の判断背景を保持しており、将来の類似判断の参考になる。
    resolution: |
      履歴情報は以下の3経路で残すため、完全喪失ではない。
      (a) git log: 物理削除はコミットとして記録されるため、git history からいつでも復元可能。
      (b) Decision Map: docs/adr/README.md の Decision Map は ADR-01XX がどの旧 ADR を supersede したかをテキストで保持（リンクは外す）。
      (c) mapping-table.md: 旧REQ→現行REQ の移行対応表は維持。
      したがって物理削除を採用する。別リポジトリ・別ブランチへのアーカイブ化作業はスコープ外とする。

  - id: CR-002
    conflict: |
      IR ルール群（IR-015, IR-025, IR-027, IR-036, IR-037, IR-040, IR-041, IR-042, IR-043）は
      retired 実体を検出対象とするため、実体が無いことでルールが無用となる。
      ルール自体を廃止すべきか。
    resolution: |
      ルールは維持する。理由は3点。
      (a) retired という概念自体は REQ-0108 / REQ-0101 / REQ-0112 / document-model.md で規定されており、
          将来別の文書が retired になる可能性を残すため、検出基盤としての価値がある。
      (b) IR ルールの廃止は REQ-0108 の改訂を伴い、catalog↔実装双方向同期運用（REQ-0145-003）に従う必要がある。
          本作業のスコープ（物理削除＋整合性修復）を超える。
      (c) retired 実体が存在しないことでルールが誤動作するリスクは test_strategy で検証する。

# operation_units: 1つのメンテナンス作業として単一 OU で処理
operation_units:
  - ou_id: OU-001
    target_req: REQ-0101
    target_spec:
      operation: update
      domain: foundations
      slug: document-model
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      status: saved
      req:
        - path: docs/requirements/REQ-0101.md
          operation: update
        - path: docs/requirements/REQ-0108.md
          operation: update
        - path: docs/requirements/REQ-0112.md
          operation: update
      adr: []
      spec:
        - path: docs/specs/foundations/document-model.md
          operation: update
        - path: docs/specs/foundations/numbering-policy.md
          operation: update
        - path: docs/specs/foundations/patterns.md
          operation: update
        - path: docs/specs/integrity/integrity-contracts.md
          operation: update
        - path: docs/specs/integrity/obsolete-path-map.yaml
          operation: update
        - path: docs/specs/skills/agentdev-adr-file-manager.md
          operation: update
        - path: docs/specs/skills/agentdev-req-file-manager.md
          operation: update

# test_strategy: 各合意項目の検証方法
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      PowerShell で以下を実行する。
        Test-Path -LiteralPath "docs/adr/retired"
        Test-Path -LiteralPath "docs/adr/retired/ADR-0001.md"
        Get-ChildItem -Path "docs/adr/retired" -ErrorAction SilentlyContinue
      併せて git status で docs/adr/retired/ 配下の23ファイルが削除ステージングされていることを確認する。
    pass_criteria: |
      Test-Path が両方とも False を返すこと。
      Get-ChildItem が「Path not found」エラーを返すこと。
      git status で23ファイルが deleted として表示されること。
    on_failure: |
      fix-and-reverify。Remove-Item の -Force -Recurse オプション指定漏れが疑われるため、
      コマンドを再確認して再実行する。

  - id: TS-002
    target_item: AG-002
    verification: |
      PowerShell で以下を実行する。
        Test-Path -LiteralPath "docs/requirements/retired"
        Get-ChildItem -Path "docs/requirements/retired" -ErrorAction SilentlyContinue
      併せて git status で docs/requirements/retired/ 配下の59ファイルが削除ステージングされていることを確認する。
    pass_criteria: |
      Test-Path が False を返すこと。
      Get-ChildItem が「Path not found」エラーを返すこと。
      git status で59ファイルが deleted として表示されること。
    on_failure: |
      fix-and-reverify。Remove-Item の -Force -Recurse オプション指定漏れが疑われるため、
      コマンドを再確認して再実行する。

  - id: TS-003
    target_item: AG-003
    verification: |
      以下のコマンドを順に実行する。
      (1) bun run .opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts
          → AUTOGEN block の再生成。docs/README.md, docs/DOC-MAP.md, docs/adr/README.md, docs/requirements/README.md の各対象領域が空または件数0で再生成されることを確認。
      (2) bun run .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts --json
          → broken-reference 検出を含む全体監査。JSON 出力の failures 配列を確認。
      (3) bun run .opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts を再度実行し、git diff --exit-code で diff が無いことを確認（べき等性）。
    pass_criteria: |
      (1) で AUTOGEN block の retired 関連エントリが空になること。
      (2) の failures が0件、または事前 baseline と一致すること（IR-055 baseline 運用準拠）。
      (3) の git diff --exit-code が終了コード0で diff 無しであること。
    on_failure: |
      fix-and-reverify。検出された failures を1件ずつ確認し、参照元ファイルを修正して再実行する。
      IR ルールの過剰検出（retired 実体不在に起因する偽陽性）が疑われる場合は
      record-in-findings で Findings に記録し、別タスクで IR ルールの調整を検討する。

  - id: TS-004
    target_item: AG-006
    verification: |
      修正対象21ファイル（.omo/plans/retired-documents-removal.md 節5.2 参照）について、
      git diff で各ファイルの変更内容を確認する。特に以下を検証する。
      (a) docs/README.md: 「- [廃止済み要件](requirements/retired/)」行が削除されていること。
      (b) docs/DOC-MAP.md: 基準境界表から「廃止済み REQ」「廃止済み ADR」行が削除されていること。
      (c) docs/adr/README.md: 「## 廃止済み、履歴ビュー」セクションが削除され、関連 REQ 表の retired リンクが外されていること。
      (d) docs/requirements/README.md: 「## 廃止済み要件」セクションが削除されていること。
      (e) obsolete-path-map.yaml: scope.exclude から retired エントリ2件が削除されていること。
      (f) integrity-contracts.md: retired 領域の正当な除外行が削除されていること。
    pass_criteria: |
      (a)〜(f) のすべての変更が確認できること。残余の retired/ パス参照が存在しないこと。
      grep -r "docs/adr/retired" docs/ src/ が0件であること（comments や git log 由来を除く）。
      grep -r "docs/requirements/retired" docs/ src/ が0件であること（同上）。
    on_failure: |
      fix-and-reverify。残存参照を edit ツールで個別に修正し、再度 grep を実行する。

  - id: TS-005
    target_item: AG-007
    verification: |
      以下の配布物ファイルの修正内容を git diff で確認する。
      (a) src/opencode/skills/agentdev-adr-file-manager/SKILL.md（118, 217, 246行）
      (b) src/opencode/skills/agentdev-learning-capture/references/example.md（110行）
      (c) src/opencode/commands/agentdev/req-save.md（262, 266行）
      (d) src/opencode/commands/agentdev/spec-save.md（226, 230行）
      併せて /repo/docs-check がエラーなく完了することを確認する。
    pass_criteria: |
      (a)〜(d) の修正が「retired/ ディレクトリへ移動」→「物理削除」へ更新されていること。
      /repo/docs-check の NG 件数が0件であること。
    on_failure: |
      fix-and-reverify。検出事項を確認し、配布物の修正漏れを再修正する。
      docs-check のみならず inspect-skills で Command/Skill 参照妥当性も確認する。

# case_open_hints: case-open 構成生成への参考情報
case_open_hints:
  epic_needed: false
  decomposition: 単一 Issue で完結するメンテナンス作業。物理削除、SPEC/REQ 更新、配布物更新、インデックス自動更新を1 PR にまとめる。
  wave_hints: []
```

# summary

本ドラフトは `.omo/plans/retired-documents-removal.md` に保存済みの実行計画を、REQ-0135-001（Drafts配置・Draft Type Registry）に従い req_draft 形式へ変換したものである。

## 背景

`docs/adr/retired/`（23ファイル）と `docs/requirements/retired/`（59ファイル）の計82ファイルは、ADR-01XX 現行基盤導入（2026-06-08）および REQ 体系再構成（2026-05-30, OU-04/05/06）に伴い retired 扱いとなった歴史的文書群である。現行アーキテクチャ判断の基盤は ADR-01XX と REQ-0101〜REQ-0133 に集約されており、retired 文書の実体は最早現行判断の根拠として参照されない。一方で retired ファイルは定期的にインデックス類（DOC-MAP、各 README）の件数表明に含まれ、メンテナンスコストを生んでいた。

## 目的

retired 文書を物理削除し、リポジトリを現行文書のみへ浄化する。あわせて削除によって生じる参照切れ、インデックス不整合、検査除外定義の陳腐化を即時に修復する。

## 主要な合意

- retired/ ディレクトリ2つを物理削除（AG-001, AG-002）
- 参照整合性は即時修復、AUTOGEN block は自動再生成で対応（AG-003, AG-006）
- retired 概念・IR ルール群は維持（AG-004）
- 履歴情報はテキスト注記で残す（AG-005）
- 配布物の廃止確定時フローも物理削除へ修正（AG-007）

## スコープ外

- retired 概念の完全廃止（IR ルール廃止、REQ-0108 改訂連鎖）
- 別リポジトリ・別ブランチへの履歴アーカイブ化
- インデックス自動生成のタイミング変更（pre-commit / CI 導入）

## 後続コマンド

本ドラフトは req_draft 形式のため、以下の後続コマンドが実行可能。

- `/agentdev/req-save`: REQ-0101, REQ-0108, REQ-0112 の update を処理（ACT-REQ-001〜003）
- `/agentdev/spec-save`: 7件の SPEC update を処理（ACT-SPEC-001〜007）
- `/agentdev/case-open`: GitHub Issue 作成、実装作業（物理削除・配布物更新・インデックス自動再生成）へ

## 関連文書

- 詳細実行計画: `.omo/plans/retired-documents-removal.md`（手順Step 1〜6、リスク、対象ファイル一覧を保持）
- Momus 評価結果: 実行計画は承認済み、ブロッカーなし
