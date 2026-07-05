---
draft_type: req_draft
topic_slug: integrity-tool-selection
status: saved
created_at: 2026-07-05T21:30:00+09:00
source_rus:
  - RU-0028
agentdev_handoff: true
---

<!-- req_draft: AgentDevFlow 本体（agent-dev-flow repo）向けの通常要件。
     agentdev_handoff: true はトレーサビリティメタデータ（upstream-handoff.md の
     「agent-dev-flow repo 本体では停止せず、通常の req/case workflow 入力として扱う」に準拠）。 -->

# draft-data

```yaml
work_type: maintenance

scale: standard

summary: |
  case-auto 最大自走モード（2026-07-05 バッチ実行）で発見された docs-check/integrity
  ワークフロー監査ディスパッチの3点是正を、2 OU 構成で定義する。
  OU-001（推奨1+3）: check_changed_docs.ts に --workflow case-run プロファイルを
  追加し case-run を targeted docs guard 対象へ拡張（推奨1）、case-close の
  targeted docs guard 実行コマンドを --base-ref から --files へ変更し main 環境での
  false-clean を解消する（推奨3）。両者は check_changed_docs.ts を共通して修正する
  ため1 OU に統合。
  OU-002（推奨2）: 各 workflow SPEC と原本に使用ツールを肯定表現で明文記載し、
  integrity-contracts.md に workflow × 使用ツールのマトリックス表を新設する。
  check_integrity.ts の誤用（draft #8 で全体監査を4回量産）を、明文とマトリックス表で
  予防する。REQ-0144-002（workflow 否定表現禁止）・REQ-0144-003（RFC2119 マーカー禁止）
  に準拠するため肯定表現のみ使用。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      check_changed_docs.ts は --workflow case-run プロファイルをサポートする。
      case-run プロファイルは docs/** 変更ファイルを対象とし、req-save/spec-save
      プロファイルと同等の docs 整合性検査ルールセット（obsolete-spec-path,
      legacy-local-generation-vocab, doc-type-responsibility 等）を適用する。
      case-run プロファイル固有の追加ルールとして full_docs_check_recommended
      判定は持たない（case-close の責務）。appliesTo は docs/specs/**, docs/requirements/**,
      docs/adr/**, docs/guides/**, AGENTS.md, README.md, docs/DOC-MAP.md 等、
      docs 配下および文書整合性に関連するファイルに限定する。

  - id: AG-002
    content: |
      case-run は PR 対象ファイルに docs/** 変更を含む場合、Step 6（実行担当
      サブエージェント起動）の委譲前に check_changed_docs.ts --workflow case-run
      を実行する。変更ファイルは worktree 内の git diff から取得する
      （--base-ref origin/main または --files <changed-paths>）。
      docs/** 変更を含まない PR（コードのみ、SCRIPT のみ等）では case-run プロファイル
      の実行をスキップする。これは REQ-0130-007（QG-3 は PR 作成直前ゲートに限定、
      docs全体grep は QG-3 に含まれない）との整合を維持する（targeted 検査は docs全体grep
      ではなく変更ファイル限定）。検出結果は PR 本文の ## Findings / Capture候補
      セクションに ### docs-integrity 小見出しで記録し、case-update へ連携する
      （Issue 本文単独書き換えは case-update 責務）。

  - id: AG-003
    content: |
      case-close.md（原本）の Step 3-1 targeted docs guard 実行コマンドを
      --base-ref <merge-base-ref> から --files <PR 変更ファイル一覧> に変更する。
      PR 変更ファイル一覧は PR 補助データ読込手続き（agentdev-gh-cli）で
      gh pr view <PR> --json files から取得する。これは case-close がマージ後 main 環境で
      実行される実運用（draft #1〜#9 で確立）に合わせる修正であり、
      --base-ref の false-clean（HEAD==baseRef 付近で git diff が空を返す）を解消する。
      case-close.md SPEC（docs/specs/commands/case-close.md）の該当記載も同期して
      --files に更新する。

  - id: AG-004
    content: |
      check_changed_docs.ts の USAGE 文字列・--help 出力・REQ-0158 に、
      --base-ref と --files の使い分けを明記する。明記内容:
      「--base-ref は worktree 環境（マージ前、case-run 等）で変更ファイル検出に使用。
       --files は main 環境（マージ後、case-close）で PR 変更ファイルを直接指定して使用。」
      これは実装変更ではなく文書追記であり、--base-ref ロジック自体は維持する
      （worktree 向けとして完全削除しない）。

  - id: AG-005
    content: |
      docs/specs/integrity/integrity-contracts.md に workflow × 使用ツールの
      マトリックス表を新設し、全 workflow の使用検査ツールを肯定表現で一元管理する。
      マトリックス表の列: workflow, check_changed_docs.ts, check_extensions.ts,
      check_integrity.ts, test_strategy。全セル肯定表現（✓ または —）で埋め、
      否定表現（"not X"）・RFC2119 マーカー（MUST/SHOULD）を使用しない
      （REQ-0144-002, REQ-0144-003 準拠）。
      マトリックス表の行: req-save, spec-save, case-open, case-run, case-close,
      req-define, /repo/docs-check。check_integrity.ts 列は req-define と /repo/docs-check
      のみ ✓ とし、他 workflow は — で「使用しない」を暗黙表現する。
      この表は単一情報源（SSoT）とし、各 workflow SPEC から参照リンクを張る。

  - id: AG-006
    content: |
      各 workflow SPEC（docs/specs/commands/ 配下の case-run.md, case-close.md,
      req-save.md, spec-save.md, case-open.md）に当該 workflow が使用する検査ツールを
      肯定表現で明記し、integrity-contracts.md マトリックス表への参照リンクを張る。
      明記内容は workflow ごとに以下を基本とする:
        - req-save: check_changed_docs.ts（--workflow req-save、REQ files 変更時）
        - spec-save: check_changed_docs.ts（--workflow spec-save、SPEC files 変更時）
        - case-open: 検査ツールを使用しない（Issue 作成のみ）
        - case-run: check_changed_docs.ts（--workflow case-run、docs/** 変更時）、
                     check_extensions.ts（src/opencode/{commands,skills}/** 変更時、IR-056）、
                     test_strategy（Issue 完了条件検証）
        - case-close: check_changed_docs.ts（--workflow case-close、PR files）、
                      check_extensions.ts（src/opencode/{commands,skills}/** 変更時）、
                      test_strategy（QG-4 完了条件確認）
      各 SPEC の既存「検証観点」「対象外」等のセクション構造に合わせて使用ツール小見出しを
      設けるか、既存の適切なセクションへ追記する。spec-save が最終的な見出し階層・
      マッチ位置を判断する。

  - id: AG-007
    content: |
      case-run.md（原本）・case-close.md（原本）に当該 workflow が使用する検査ツールを
      肯定表現で明記し、integrity-contracts.md マトリックス表への参照リンクを張る。
      これは REQ-0158 L154「command 本文（原本）と SPEC の両方へ記載する」の precedent
      （targeted docs guard の手順を原本と SPEC 両方へ）に準拠する。Sisyphus-Junior は
      委譲プロンプト経由で原本を参照するため、原本にも明文が必要。
      原本への追記位置は、case-run.md は Step 5-3（QG-3 前置 staleness check）の直後
      または Step 6（実行担当サブエージェント起動）の委譲プロンプト前、case-close.md は
      Step 3-1（targeted docs guard）の前後に設ける。詳細位置は case-run 実装時
      （Sisyphus-Junior）で確定する。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-0158.md
    source_items: [AG-001, AG-004]
    content: |
      REQ-0158（Targeted Docs Integrity Guard）への追加要件:
      - check_changed_docs.ts の --workflow 値に case-run を追加する。case-run プロファイル
        は docs/** 変更ファイルを対象とし、req-save/spec-save プロファイルと同等の
        docs 整合性検査ルールセットを適用する（ REQ-0158 既存の targeted docs guard CLI 引数
        --workflow req-save|spec-save|case-close|docs-check を --workflow req-save|spec-save|
        case-run|case-close|docs-check へ拡張）。
      - check_changed_docs.ts の USAGE・--help・本 REQ に --base-ref と --files の使い分けを
        明記する: --base-ref は worktree 環境（マージ前、case-run 等）で変更ファイル検出に
        使用、--files は main 環境（マージ後、case-close）で PR 変更ファイルを直接指定して使用。
      - req-save/spec-save/case-close/case-run/docs-check の各 workflow 間で使用する検査ツールの
        対応表は docs/specs/integrity/integrity-contracts.md のマトリックス表を SSoT とする。

  - id: ACT-REQ-002
    artifact: req
    operation: append
    target: docs/requirements/REQ-0130.md
    source_items: [AG-002]
    content: |
      REQ-0130（case-run / 実装パイプライン）への追加要件:
      - case-run は PR 対象ファイルに docs/** 変更を含む場合、Step 6（実行担当サブエージェント
        起動）の委譲前に check_changed_docs.ts --workflow case-run を実行する。docs/** 変更を
        含まない PR では case-run プロファイルの実行をスキップする（REQ-0130-007 の QG-3 限定
        原則を維持、docs全体grep ではなく変更ファイル限定の targeted 検査）。
      - 検出結果は PR 本文の ## Findings / Capture候補 セクションに ### docs-integrity
        小見出しで記録し、case-update へ連携する（case-run 単独では Issue 本文を書き換えない、
        REQ-0130-034 準拠）。
      - check_changed_docs.ts の実行は QG-3 本体（PR 作成直前ゲート）・QG-3 前置 staleness
        check（REQ-0130-031〜034）とは独立した、新たな前置 docs 整合性検査である。3つの検査は
        順序依存を持たず、それぞれの実施要否に影響しない。

  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-update
    target_spec: docs/specs/commands/case-run.md
    target_area: "### Step 5-3"
    source_items: [AG-002]
    content: |
      case-run SPEC（docs/specs/commands/case-run.md）の Step 5-3（QG-3 前置 staleness check）
      セクションに続き、新規サブセクション「Step 5-4: docs/** 変更時の targeted docs guard
      （REQ-0130-035 相当）」を追加する。内容:
      - case-run は PR 対象ファイルに docs/** 変更を含む場合、Step 6 委譲前に
        check_changed_docs.ts --workflow case-run を実行する。実行コマンド例:
        bun run .opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts \
          --workflow case-run --base-ref origin/main --json
      - docs/** 変更を含まない PR ではスキップする。
      - 検出結果（failures の strict severity）は PR 本文の ## Findings / Capture候補 に
        ### docs-integrity 小見出しで記録し case-update へ連携する。
      - 本検査は QG-3 本体・QG-3 前置 staleness check とは独立（REQ-0130-033 準拠）。

  - id: ACT-SPEC-002
    artifact: spec
    operation: spec-update
    target_spec: docs/specs/commands/case-close.md
    target_area: "### Step 3-1"
    source_items: [AG-003]
    content: |
      case-close SPEC（docs/specs/commands/case-close.md）の Step 3-1（targeted docs guard）
      記載を --base-ref から --files へ変更する。変更後の対象セクション全文:
      ### Step 3-1
      close 時 SPEC/commands/skills 更新漏れの局所確認（実装完了、PRマージ前に、今回の変更に
      伴う以下の更新漏れを局所的に確認する）:
        - SPEC 本文と実装の最終矛盾確認
        - 変更に伴う command 定義の更新漏れ
        - 変更に伴う skill 責務境界の変更漏れ
        - 更新漏れを検出した場合は警告表示してユーザー判断を仰ぐ
        - 局所予防の範囲: この確認は close 時の局所的な漏れ検出であり、/agentdev/inspect-docs
          の全体意味レビューの代替ではない
        - extensions 整合性検査（IR-056、REQ-0144 系）: 当該 PR が src/opencode/commands/
          agentdev/**/*.md, src/opencode/skills/agentdev-*/SKILL.md,
          src/opencode/skills/agentdev-*/references/**/*.md, .agentdev/extensions/** のいずれかを
          変更した場合、check_extensions.ts を strict 実行し、IR-056 違反がないことを確認する。
          違反時はマージを停止しユーザー判断を仰ぐ
        - targeted docs guard（REQ-0158）: 変更ファイルと連動ファイルに対し targeted docs guard
          を実行する。実行コマンド:
          bun run .opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts \
            --workflow case-close --files <PR 変更ファイル一覧> --json
          PR 変更ファイル一覧は PR 補助データ読込手続き（agentdev-gh-cli）で
          gh pr view <PR> --json files から取得する（case-close はマージ後 main 環境で実行
          されるため --files を使用。--base-ref は worktree 環境向け）。
          JSON 出力の failures に strict severity が含まれる場合はマージを停止し、対象ファイルを
          修正して再実行する。full_docs_check_recommended が true の場合は /repo/docs-check
          （全体監査）の実行をユーザーに提案する。draft→accepted 等の SPEC status 変更時は
          spec_readme_update_required を Step 3-2 SPEC 確定フローに反映する。

  - id: ACT-SPEC-003
    artifact: spec
    operation: spec-update
    target_spec: docs/specs/integrity/integrity-contracts.md
    target_area: "## Workflow × 使用ツールマトリックス"
    source_items: [AG-005]
    content: |
      integrity-contracts.md（docs/specs/integrity/integrity-contracts.md）に新規セクション
      「## Workflow × 使用ツールマトリックス」を追加する。本セクションは全 workflow の
      使用検査ツールを肯定表現で一元管理する SSoT であり、各 workflow SPEC から参照される。
      マトリックス表（Markdown テーブル形式）を以下の内容で配置する:

      | workflow | check_changed_docs.ts | check_extensions.ts | check_integrity.ts | test_strategy |
      |---|---|---|---|---|
      | req-save | ✓（REQ files） | — | — | — |
      | spec-save | ✓（SPEC files） | — | — | — |
      | case-open | — | — | — | — |
      | case-run | ✓（docs/** 変更時、--workflow case-run） | ✓（src/opencode/{commands,skills}/** 変更時、IR-056） | — | ✓（Issue 完了条件検証） |
      | case-close | ✓（PR files、--workflow case-close） | ✓（src/opencode/{commands,skills}/** 変更時、IR-056） | — | ✓（QG-4 完了条件確認） |
      | req-define | — | — | ✓（全体監査、検証手順） | — |
      | /repo/docs-check | ✓ | ✓ | ✓（全体監査） | — |

      全セル肯定表現（✓ または —）を使用し、否定表現（"not X"）・RFC2119 マーカー
      （MUST/SHOULD）を使用しない（REQ-0144-002, REQ-0144-003 準拠）。
      check_integrity.ts 列は req-define と /repo/docs-check のみ ✓ とし、他 workflow は — で
      「使用しない」を暗黙表現する。表の直後に参照元 workflow SPEC 一覧をリスト化し、
      各 SPEC から逆参照できるよう案内する。

  - id: ACT-SPEC-004
    artifact: spec
    operation: spec-update
    target_spec: docs/specs/commands/case-run.md
    target_area: "## 対象外"
    source_items: [AG-006, AG-007]
    content: |
      case-run SPEC（docs/specs/commands/case-run.md）の「## 対象外」セクションの直前に
      新規サブセクション「### case-run が使用する検査ツール」を追加する。内容:
      case-run が使用する検査ツール（integrity-contracts.md Workflow × 使用ツールマトリックス参照）:
        - check_changed_docs.ts（--workflow case-run）: PR 対象ファイルに docs/** 変更を含む場合、
          Step 6 委譲前に実行（AG-002, Step 5-4 参照）
        - check_extensions.ts（IR-056）: src/opencode/commands/agentdev/**/*.md,
          src/opencode/skills/agentdev-*/SKILL.md, src/opencode/skills/agentdev-*/references/**/*.md,
          .agentdev/extensions/** のいずれかを変更した場合に実行
        - test_strategy: Issue 完了条件検証（REQ-0130-029/030）
      case-run は check_integrity.ts（全体監査）を使用しない（case-run は worktree で実行、
      PR 単位の targeted 検査が責務。全体監査は /repo/docs-check の責務）。
      ※上記は全て肯定表現であり、否定表現・RFC2119 マーカーは使用しない
      （REQ-0144-002, REQ-0144-003 準拠）。

  - id: ACT-SPEC-005
    artifact: spec
    operation: spec-update
    target_spec: docs/specs/commands/case-close.md
    target_area: "## 対象外"
    source_items: [AG-006, AG-007]
    content: |
      case-close SPEC（docs/specs/commands/case-close.md）の「## 対象外」セクションの直前に
      新規サブセクション「### case-close が使用する検査ツール」を追加する。内容:
      case-close が使用する検査ツール（integrity-contracts.md Workflow × 使用ツールマトリックス参照）:
        - check_changed_docs.ts（--workflow case-close、--files <PR 変更ファイル一覧>）:
          Step 3-1 targeted docs guard で実行（AG-003）
        - check_extensions.ts（IR-056）: src/opencode/commands/agentdev/**/*.md,
          src/opencode/skills/agentdev-*/SKILL.md, src/opencode/skills/agentdev-*/references/**/*.md,
          .agentdev/extensions/** のいずれかを変更した場合に実行（Step 3-1）
        - test_strategy: QG-4 完了条件確認（REQ-0131-026）
      case-close は check_integrity.ts（全体監査）を使用しない（case-close はマージ後 main 環境で
      PR 単位の targeted 検査が責務。全体監査は /repo/docs-check の責務）。
      ※上記は全て肯定表現であり、否定表現・RFC2119 マーカーは使用しない
      （REQ-0144-002, REQ-0144-003 準拠）。

  - id: ACT-SPEC-006
    artifact: spec
    operation: spec-update
    target_spec: docs/specs/commands/req-save.md
    target_area: "## 対象外"
    source_items: [AG-006]
    content: |
      req-save SPEC（docs/specs/commands/req-save.md）の「## 対象外」セクションの直前に
      新規サブセクション「### req-save が使用する検査ツール」を追加する。内容:
      req-save が使用する検査ツール（integrity-contracts.md Workflow × 使用ツールマトリックス参照）:
        - check_changed_docs.ts（--workflow req-save、REQ files 変更時）: REQ 保存工程で実行
      req-save は check_integrity.ts（全体監査）を使用しない（保存工程は変更ファイル限定の
      targeted 検査が責務。全体監査は /repo/docs-check の責務）。
      ※肯定表現のみ（REQ-0144-002, REQ-0144-003 準拠）。

  - id: ACT-SPEC-007
    artifact: spec
    operation: spec-update
    target_spec: docs/specs/commands/spec-save.md
    target_area: "## 対象外"
    source_items: [AG-006]
    content: |
      spec-save SPEC（docs/specs/commands/spec-save.md）の「## 対象外」セクションの直前に
      新規サブセクション「### spec-save が使用する検査ツール」を追加する。内容:
      spec-save が使用する検査ツール（integrity-contracts.md Workflow × 使用ツールマトリックス参照）:
        - check_changed_docs.ts（--workflow spec-save、SPEC files 変更時）: SPEC 保存工程で実行
      spec-save は check_integrity.ts（全体監査）を使用しない（保存工程は変更ファイル限定の
      targeted 検査が責務。全体監査は /repo/docs-check の責務）。
      ※肯定表現のみ（REQ-0144-002, REQ-0144-003 準拠）。

  - id: ACT-SPEC-008
    artifact: spec
    operation: spec-update
    target_spec: docs/specs/commands/case-open.md
    target_area: "## 対象外"
    source_items: [AG-006]
    content: |
      case-open SPEC（docs/specs/commands/case-open.md）の「## 対象外」セクションの直前に
      新規サブセクション「### case-open が使用する検査ツール」を追加する。内容:
      case-open が使用する検査ツール（integrity-contracts.md Workflow × 使用ツールマトリックス参照）:
        - なし（case-open は GitHub Issue 作成を責務とし、docs 整合性検査・extensions 検査を
          実行しない。検査は後続工程の req-save/spec-save/case-run/case-close で実施）
      ※肯定表現のみ（REQ-0144-002, REQ-0144-003 準拠）。

conflict_resolutions:
  - id: CR-001
    conflict: |
      draft #8 case-run（ses_0ce4a66d4ffe493d74v4MnqY2V）が Issue #1444 のベースライン確認のため
      check_integrity.ts（全体監査）を4回実行し、.agentdev/integrity/reports/ に report-9〜12 を
      量産（19:00 JST、内容は重複）。根本原因は case-run.md に検査ツール明示ステップがなく、
      Sisyphus-Junior が独自判断で check_integrity.ts を流用したこと。
    resolution: |
      根本対応として case-run が使うべき検査ツール（check_changed_docs.ts --workflow case-run、
      check_extensions.ts、test_strategy）を原本・SPEC の両方に明文記載し
      （AG-002, AG-006, AG-007）、integrity-contracts.md に workflow × 使用ツールマトリックス表を
      SSoT として新設する（AG-005）。これにより Sisyphus-Junior が原本・SPEC を読めば
      check_integrity.ts を流用すべきでないことが明らかになる。

  - id: CR-002
    conflict: |
      case-close.md（原本 L96 → 現在は L120-127 に移動済み）が --base-ref <merge-base-ref> を
      規定するが、draft #1〜#9 の case-close 実運用は全て --files に切り替え（draft #3 learning
      以降）。--base-ref は main 環境（マージ後）で HEAD==baseRef 付近になり git diff 空を返す
      false-clean バグがある。
    resolution: |
      規定を実運用に合わせ --files に変更する（AG-003, ACT-SPEC-002）。--base-ref は worktree
      環境（マージ前、case-run 等）向けとして完全削除せず、check_changed_docs.ts の USAGE・
      --help・REQ-0158 で使い分けを明記する（AG-004, ACT-REQ-001）。--base-ref ロジック自体は
      修正しない（worktree 向けに有効活用可能）。

  - id: CR-003
    conflict: |
      Q2 の明文化方針で MUST NOT 表現を使うと REQ-0144-002（workflow 否定表現禁止）・
      REQ-0144-003（RFC2119 マーカー禁止）に抵触する。
    resolution: |
      全て肯定表現で書く（AG-005, AG-006, AG-007）。「check_integrity.ts は使わない」ではなく、
      「使うツール」を明示し、マトリックス表の当該セルを — とすることで暗黙に使用しないことを
      表現する。REQ-0144-002/003 準拠。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0028
    target_req: REQ-0158
    target_spec:
      - docs/specs/commands/case-run.md
      - docs/specs/commands/case-close.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_reqs:
        - REQ-0158
        - REQ-0130
      saved_specs:
        - docs/specs/commands/case-run.md
        - docs/specs/commands/case-close.md
      req_operations:
        - req: REQ-0158
          operation: append
          source_items: [AG-001, AG-004]
          applied_section: "case-run プロファイルの追加と --base-ref / --files 使い分け明記"
        - req: REQ-0130
          operation: append
          source_items: [AG-002]
          new_ids: [REQ-0130-035]
      spec_operations:
        - spec: docs/specs/commands/case-run.md
          operation: spec-update
          source_items: [AG-002]
          target_area: "### Step 5-3"
          target_area_status: not_found
          applied_as: new_section_after_qg3_staleness_check
        - spec: docs/specs/commands/case-close.md
          operation: spec-update
          source_items: [AG-003]
          target_area: "### Step 3-1"
          target_area_status: not_found
          applied_as: targeted_docs_guard_files_update
      adr_created: false
      committed: done
      commit_sha: 5c03f6f2
      case_open:
        issue_number: 1455
        issue_url: https://github.com/yogata/agent-dev-flow/issues/1455
        flow: standard
        labels: [refactor, maintenance]

  - ou_id: OU-002
    source_ru: RU-0028
    target_req: null
    target_spec:
      - docs/specs/integrity/integrity-contracts.md
      - docs/specs/commands/case-run.md
      - docs/specs/commands/case-close.md
      - docs/specs/commands/req-save.md
      - docs/specs/commands/spec-save.md
      - docs/specs/commands/case-open.md
    operation: spec-update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      check_changed_docs.ts に --workflow case-run 引数を渡して実行する。
      例: bun run .opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts
          --workflow case-run --files docs/requirements/REQ-0158.md --json
    pass_criteria: |
      引数エラー（--workflow must be one of: req-save, spec-save, case-close, docs-check）
      が発生せず、JSON 出力の workflow フィールドが "case-run" となり、files_checked・
      failures フィールドが返される。
    on_failure: |
      fix-and-reverify。--workflow case-run が未対応の場合、profileFor 関数・parseArgs の
      弾きロジック・Workflow 型定義を修正して再検証する。

  - id: TS-002
    target_item: AG-002
    verification: |
      docs/specs/commands/case-run.md と src/opencode/commands/agentdev/case-run.md を読み、
      Step 6 委譲前に check_changed_docs.ts --workflow case-run を実行する手順が記載されている
      ことを確認する。また、docs/** 変更を含まない PR ではスキップする旨が記載されていることを
      確認する。
    pass_criteria: |
      両ファイル（原本・SPEC）に当該手順が記載されており、REQ-0130-007（docs全体grep 除外）
      との整合（targeted 検査である旨）が明記されている。
    on_failure: |
      fix-and-reverify。手順追記が漏れている場合、原本・SPEC に追記して再検証する。

  - id: TS-003
    target_item: AG-003
    verification: |
      src/opencode/commands/agentdev/case-close.md と docs/specs/commands/case-close.md を読み、
      targeted docs guard 実行コマンドが --files を使用していることを確認する。
      grep -n "\-\-base-ref" docs/specs/commands/case-close.md が targeted docs guard 実行
      コマンド行（bun run ... check_changed_docs.ts --workflow case-close ...）にヒットしない
      ことを確認する。ただし --base-ref/--files 使い分け説明文（AG-004 由来）は例外。
    pass_criteria: |
      targeted docs guard 実行コマンド行が --files <PR 変更ファイル一覧> を使用しており、
      --base-ref <merge-base-ref> を使用していない。
    on_failure: |
      fix-and-reverify。--base-ref が残っている場合、--files に修正して再検証する。

  - id: TS-004
    target_item: AG-004
    verification: |
      check_changed_docs.ts の USAGE 定数・printHelp 関数の出力を確認する。
      bun run .opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts --help
      を実行し、--base-ref と --files の使い分け説明が出力されることを確認する。
      また docs/requirements/REQ-0158.md に使い分け記載があることを確認する。
    pass_criteria: |
      --help 出力に「--base-ref は worktree 環境（マージ前）」「--files は main 環境
      （マージ後）」の旨が記載されている。REQ-0158 にも同様の記載がある。
    on_failure: |
      fix-and-reverify。USAGE 定数・printHelp・REQ-0158 の記載漏れを修正して再検証する。

  - id: TS-005
    target_item: AG-005
    verification: |
      docs/specs/integrity/integrity-contracts.md を読み、「## Workflow × 使用ツール
      マトリックス」セクションが存在することを確認する。マトリックス表の全セルが肯定表現
      （✓ または —）で埋まっており、否定表現・RFC2119 マーカーが無いことを確認する。
      REQ-0144-002/003 準拠を grep で確認: grep -nE 'MUST|SHOULD|MUST NOT|should not'
      docs/specs/integrity/integrity-contracts.md（当該セクション範囲）で0件。
    pass_criteria: |
      マトリックス表が存在し、7 workflow（req-save/spec-save/case-open/case-run/case-close/
      req-define//repo/docs-check）× 4 ツール（check_changed_docs.ts/check_extensions.ts/
      check_integrity.ts/test_strategy）の全セルが ✓ または — で埋まっている。
      check_integrity.ts 列は req-define と /repo/docs-check のみ ✓。
      否定表現・RFC2119 マーカーは0件。
    on_failure: |
      fix-and-reverify。表が未作成・セル未埋・否定表現混入の場合、修正して再検証する。

  - id: TS-006
    target_item: AG-006
    verification: |
      docs/specs/commands/ 配下の case-run.md, case-close.md, req-save.md, spec-save.md,
      case-open.md を読み、それぞれに「使用する検査ツール」小見出し（または同等の記載）と
      integrity-contracts.md マトリックス表への参照リンクがあることを確認する。
      各 SPEC で肯定表現のみが使われていることを確認（REQ-0144-002/003 準拠）。
    pass_criteria: |
      5 SPEC 全てに使用ツール明文とマトリックス表参照がある。各 SPEC の記載が
      マトリックス表（AG-005）と整合している。否定表現・RFC2119 マーカーは0件。
    on_failure: |
      fix-and-reverify。記載漏れ・不整合・否定表現混入の場合、修正して再検証する。

  - id: TS-007
    target_item: AG-007
    verification: |
      src/opencode/commands/agentdev/case-run.md と src/opencode/commands/agentdev/case-close.md
      を読み、原本に使用ツール肯定表現と integrity-contracts.md マトリックス表への参照が
      あることを確認する。REQ-0158 L154 precedent（原本と SPEC 両方へ記載）に準拠している
      ことを確認。
    pass_criteria: |
      case-run.md・case-close.md（原本）の両方に使用ツール肯定表現とマトリックス表参照がある。
      それぞれの対応 SPEC と内容が整合している。否定表現・RFC2119 マーカーは0件。
    on_failure: |
      fix-and-reverify。原本への追記漏れ・不整合・否定表現混入の場合、修正して再検証する。

case_open_hints:
  epic_needed: false
  decomposition: null
  wave_hints:
    - wave: 1
      issue_scope: OU-001（推奨1+3: check_changed_docs.ts case-run profile 追加、case-close --files へ変更、REQ-0158/REQ-0130 APPEND、case-run/case-close 原本・SPEC 同期）
      note: 単一 Issue で完結。check_changed_docs.ts 実装 + REQ 追記 + SPEC 同期 + 原本同期 を1 PR で実施。
    - wave: 2
      issue_scope: OU-002（推奨2: integrity-contracts.md マトリックス表新設、各 workflow SPEC と原本に使用ツール明文）
      depends_on_wave: 1
      note: OU-001 完了後に実施。case-run/case-close SPEC・原本は OU-001 の成果（検査ステップ追記、--files 変更）を踏まえて使用ツール明文を追記。
```

# summary

## 合意内容の要点

- **work_type**: maintenance（AgentDevFlow 本体の運用是正）
- **OU 構成**: 2 OU（OU-001: 推奨1+3、OU-002: 推奨2）。OU-002 は OU-001 に必須依存（公開API依存: check_changed_docs.ts --workflow case-run の実装）
- **ADR**: 新規作成なし。3推奨とも既存 REQ（REQ-0158/0130/0144）の拡張・運用是正であり、アーキテクチャ判断を含まない（Step 6-2 ADR禁止ゲートで除外）
- **REQ/SPEC 境界**: REQ-0158/0130 APPEND、各 workflow SPEC と integrity-contracts.md SPEC update。check_changed_docs.ts・command 原本の変更は case-run（Sisyphus-Junior）実装範囲

## 検討経緯（参考）

- 推奨2の表現方法について、REQ-0144-002（workflow 否定表現禁止）・REQ-0144-003（RFC2119 マーカー禁止）への抵触を回避するため、肯定表現 + マトリックス表の組み合わせ（Q6-(c)+(a)）を採用
- 推奨3の --base-ref 残し位置について、完全削除せず worktree 向けとして明記する方針（Q3-(b) 拡張）。case-run が docs/** 変更検出に --base-ref を活用可能
- OU 分割はファイル衝突回避を優先。OU-A（推奨1+3）が check_changed_docs.ts を修正し、OU-B（推奨2）は明文追記のみ。両者が case-run/case-close 原本・SPEC に触れるが、編集セクションが異なり、OU-B は OU-A の成果（--workflow case-run 実装）に依存するため直列実行

## ADR判断根拠（Step 6-3）

3推奨とも下記のいずれにも該当しないため、ADR 新規作成不要:

- **アーキテクチャ変更**: 既存の targeted docs guard・検査 workflow 体系を変えず、拡張・運用是正のみ
- **複数システム影響**: 影響範囲は AgentDevFlow 本体（check_changed_docs.ts, command 原本/SPEC, REQ）に限定
- **長期間有効な決定**: ワークフロー検査ツールの明文化・使い分け運用であり、後日変更可能
- **取り返しがつかない変更**: すべて可逆（SPEC 追記、実装修正）

既存 ADR との重複（Step 6-1）: docs/adr/README.md の承認済み ADR 22件・proposed 1件（ADR-0134）のいずれとも意味的重複なし。ADR-0128（case-run 実行モデル）の拡張に近いが、実行モデル自体を変えず検査ツール明示を追加するのみ。
