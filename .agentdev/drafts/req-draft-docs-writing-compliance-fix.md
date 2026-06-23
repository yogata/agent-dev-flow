---
draft_type: req_draft
topic_slug: docs-writing-compliance-fix
status: draft
created_at: 2026-06-23T13:13:02+09:00
source_rus:
  - RU-0001
  - RU-0002
  - RU-0003
  - RU-0004
  - RU-0005
  - RU-0006
  - RU-0007
---

# draft-data

```yaml
work_type: docs_chore

summary: |
  REQ-0140-026 が包括的に mandate する文書品質準拠について、inspect-docs で検出された 7 ディレクトリ
  横断の規範逸脱（中黒・em-dash・LLM 表現・一文一行・requirements 構造・opencode-local 冗長・個別構造）
  を実行する。既存 REQ-0140-026 が執行権限を持つため REQ 変更は行わず、運用ルール（中黒許容範囲・
  em-dash 置換形式・LLM 表現辞書・frontmatter 訳語・推奨訳）を document-type-responsibilities.md SPEC
  および agentdev-doc-writing skill references に集約した上で、7 OU（RU 毎）で機械的整形・構造変更を
  実施する。実行アプローチはスクリプト + AI 併用、完了条件は段階的 grep 検証とする。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      中黒許容範囲: 固定複合名詞並列（「実行時・編集時」「コマンド・スキル・テンプレート・スクリプト」
      等の確定 tech term）は中黒を許容する。流動的並列は読点（、）またはスラッシュ・箇条書きへ置換する。
      識別子・コード値の並列も地の文としては中黒を避ける。判断基準は japanese-tech-writing L18 を踏まえ、
      document-type-responsibilities.md 用語政策節に「固定複合名詞並列は許容」を明文化する。
  - id: AG-002
    content: |
      em-dash 置換形式: japanese-tech-writing L17 の規範（同格・補足は括弧、言い換え・敷衍は句点で2文分割
      または読点でつなぐ）に従い、対象 3 ディレクトリ（docs/specs/・docs/adr/・docs/requirements/）の
      em-dash を機械的置換する。コロン（:）による置換は行わない。
  - id: AG-003
    content: |
      LLM 表現辞書: 接続の型（において・には〜がある・を参照・の観点から）・空虚な動詞（掘り下げる・
      決定する・解決する・適用する 等）・空虚な形容（包括的・不可欠・非常に・極めて・最も・核心的・
      根本的な 等）・ラベル前置き（> **Scope**: ・**注意**: 等）の検出→書き換え辞書を新規ファイル
      `src/opencode/skills/agentdev-doc-writing/references/llm-expression-patterns.md` に作成する。
      document-type-responsibilities.md SPEC には方針のみ記載し、具体例は skill references で管理する
      （REQ-0140-026 「個別用語の正誤表は agentdev-doc-writing スキルの参照資料で管理」に準拠）。
      agentdev-doc-writing/SKILL.md に参照リンクを追加する。辞書ファイル作成・SKILL.md 更新は
      OU-003 の case-run 実装作業として実施する（docs/specs/ 外のため spec-save 対象外）。
  - id: AG-004
    content: |
      一文一行: 複数文 1 行併記・不完全文・述語欠落を是正する。リード文・目的節・概要節は読者が最初に
      読む部分のため 1 文 1 行を厳格適用。テーブルセル内・HTML コメント内も原則として一文一行を適用。
      長文化するテーブルセルは脚注または別行分離を検討する。
  - id: AG-005
    content: |
      docs/requirements/ README 関心対象列・要件行の構造整形: 各 REQ 行の「関心対象」セルは核心 1 文に
      短縮するか箇条書き展開する。要件行は冒頭に操作主体（command 名・skill 名・ユーザー・システム）を
      明示する。SPEC 相当内容（ルールカタログ・検査項目列挙・IR 番号・閾値）は該当 SPEC へ移送する。
      件数・ファイル名列挙の硬直的固定記述は排除し、構造のみを REQ に残す。安定契約例外
      （REQ-0101-069: 公開 command 名・入口・安全境界）は REQ に維持する。
  - id: AG-006
    content: |
      src/opencode-local/ 冗長排除: 同一ファイル内段落重複・ファイル横断同一文重複・節内重複を解消する。
      意図的同期表明を伴うガードレール一覧・レポートフォーマット表・違反判定基準表のファイル間重複は、
      正本を一本化し他方を参照形式に差し替える。AI エージェント参照上の設計意図（同期表明）は参照化でも
      運用上問題ないことを確認する。
  - id: AG-007
    content: |
      用語政策追記: document-type-responsibilities.md 用語政策節に以下を追記する。
      (a) frontmatter 訳語: 「YAML フロントマター」を推奨訳とし、原語併記または初出のみ訳出の運用を許容。
      (b) 推奨訳追加: fixture→テストデータ/検査データ、variant→種別/バリエーション/形式、
      provider→提供元、baseline→基準、current→現行/現在の。識別子（Type ID・enum 値・frontmatter field・
      ファイル名・バッククォート内コード値）は英語のまま。
  - id: AG-008
    content: |
      実行アプローチ: em-dash・中黒は grep/sed 等のスクリプトで機械的置換を試みる。LLM 表現・一文一行・
      requirements 構造・opencode-local 冗長・個別構造は AI エージェントで個別判断する。両者併用。
      完了条件は段階的検証: 中黒・em-dash は許容リスト以外 0 件（grep 検証）。LLM 表現主要パターン
      （において・包括的・不可欠・非常に・極めて・ラベル前置き）は 0 件。一文一行はリード文・目的節・
      概要節での違反 0 件、本文はサンプリング検証。

artifact_actions:
  - id: ACT-SPEC-001
    artifact: spec
    operation: update
    target: docs/specs/document-type-responsibilities.md
    target_area: 用語政策節
    source_items: [AG-001, AG-002, AG-007]
    content: |
      用語政策節に以下の小節を追記・拡充する。

      ### 中黒使用の許容範囲

      中黒（・）は原則として日本語並列に使わない（japanese-tech-writing L18）。ただし以下は許容する:

      - 固定複合名詞の内部（「実行時・編集時」「コマンド・スキル・テンプレート・スクリプト」等の確定 tech term）
      - 単一固有名詞の内部

      流動的並列・識別子の並列・コード値の並列は読点（、）・スラッシュ・箇条書きに置換する。

      ### em-dash 置換形式

      em-dash（`—`・`―`）は japanese-tech-writing L17 に従い、同格・補足は括弧（）、言い換え・敷衍は句点で2文分割または読点でつなぐ。コロン（`:`）による置換は行わない。

      ### frontmatter 訳語

      YAML frontmatter は「YAML フロントマター」を推奨訳とする。原語併記（「frontmatter（YAML 前書き）」）または初出のみ訳出の運用も許容する。ファイル名 `rules/frontmatter.yaml` は原語を保持する。

      ### 推奨訳語（追補）

      既存の用語政策に以下を追加する:

      - fixture → テストデータ/検査データ
      - variant → 種別/バリエーション/形式
      - provider → 提供元
      - baseline → 基準
      - current → 現行/現在の

      識別子（Type ID・enum 値・frontmatter field・ファイル名・バッククォート内コード値）は英語のままとする。

      ### LLM 表現の検出→書き換え方針

      LLM 表現（接続の型・空虚な動詞・空虚な形容・ラベル前置き）の検出→書き換えパターンの具体例は
      `agentdev-doc-writing` スキルの運用参照資料 `references/llm-expression-patterns.md`（OU-003 の case-run で新規作成）で管理する。本 SPEC には方針のみを記載し、具体例の正誤表は skill references に集約する
      （REQ-0140-026「個別用語の正誤表は agentdev-doc-writing スキルの参照資料で管理」準拠）。
    status: consumed

conflict_resolutions:
  - id: CR-001
    conflict: REQ-0140-007 が `rewrite-patterns.md` を「英語混じり表現の検出ルール」に限定しており、LLM 表現辞書の配置先と潜在的衝突
    resolution: 既存 `rewrite-patterns.md` の scope を拡張せず、新規 `references/llm-expression-patterns.md` を作成する。REQ-0140-007 の scope を維持し、本件 REQ 変更なしで運用ルール集約を達成する。
  - id: CR-002
    conflict: REQ-0140 SPLIT シグナル既に 2。本件 APPEND でシグナル 3+ 上昇の懸念
    resolution: REQ-0140-026 が包括 mandate 済みのため新規要件行を追加せず、運用ルールを SPEC・skill references へ集約する。REQ 変更なしで SPLIT 回避。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0001
    operation: update
    scale: large
    depends_on: []
    recommended_order: 5
    issue_policy: single
    result: {}
  - ou_id: OU-002
    source_ru: RU-0002
    operation: update
    scale: large
    depends_on: []
    recommended_order: 6
    issue_policy: single
    result: {}
  - ou_id: OU-003
    source_ru: RU-0003
    operation: update
    scale: large
    depends_on: []
    recommended_order: 7
    issue_policy: single
    result: {}
  - ou_id: OU-004
    source_ru: RU-0004
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 8
    issue_policy: single
    result: {}
  - ou_id: OU-005
    source_ru: RU-0005
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-006
    source_ru: RU-0006
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}
  - ou_id: OU-007
    source_ru: RU-0007
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    result: {}

case_open_hints:
  epic_needed: true
  decomposition: |
    7 OU を Epic Issue 配下の子 Issue として展開する。推奨 Wave 構成:
    - Wave 1（構造変更系）: OU-005（requirements 構造）、OU-006（opencode-local 冗長）、OU-007（個別構造）
    - Wave 2（機械的整形系）: OU-001（中黒）、OU-002（em-dash）、OU-003（LLM 表現）、OU-004（一文一行）
    Wave 1 → Wave 2 の順で実行し、構造変更後に機械的置換を行うことで行番号参照のずれを回避する。
    artifact_actions（ACT-SPEC-001）は spec-save フェーズで先に完了するため、各 OU の実行時には
    更新済み SPEC が参照可能。OU-003 は SPEC 方針に基づき `llm-expression-patterns.md` 新規作成・
    SKILL.md 参照リンク追加を case-run で実施した上で LLM 表現是正を実施する。
  wave_hints:
    - wave: 1
      ous: [OU-005, OU-006, OU-007]
      rationale: 構造変更（README 再編・冗長排除・長文分割等）を先に行い、機械的整形の対象行を安定化
    - wave: 2
      ous: [OU-001, OU-002, OU-003, OU-004]
      rationale: 構造変更完了後に機械的テキスト置換（中黒・em-dash・LLM 表現・一文一行）を実施
```

# summary

## 要件の位置づけ

本件は **REQ-0140-026 が既に mandate する文書品質準拠の実行** である。inspect-docs で検出された 7 ディレクトリ横断の規範逸脱を、既存要件の執行として処理する。そのため:

- **REQ 変更なし**: REQ-0140-026 が執行権限を持つため、REQ-0140 本体への APPEND も新規 REQ CREATE も行わない。REQ-0140 SPLIT シグナル 2 → 3+ への上昇を回避する。
- **運用ルールを SPEC・skill references へ集約**: 中黒許容範囲・em-dash 置換形式・LLM 表現辞書・frontmatter 訳語・推奨訳を、`document-type-responsibilities.md` SPEC（用語政策節）と `agentdev-doc-writing` skill references（新規 `llm-expression-patterns.md`）に配置する。これにより REQ-0140-026「個別用語の正誤表は agentdev-doc-writing スキルの参照資料で管理」に準拠する。

## 実行計画

7 RU を 7 OU として実行する。推奨順序:

1. **Wave 1（構造変更系）**: OU-005（requirements 構造）→ OU-006（opencode-local 冗長）→ OU-007（個別構造）
2. **Wave 2（機械的整形系）**: OU-001（中黒）→ OU-002（em-dash）→ OU-003（LLM 表現）→ OU-004（一文一行）

Wave 1 でセクション再編を完了させた後に Wave 2 の機械的置換を行うことで、行番号参照のずれを回避する。

## ワークフロー経路

`work_type: docs_chore` で `artifact_actions` に `artifact: spec` エントリを含むため:

1. **spec-save**: ACT-SPEC-001 を実行（document-type-responsibilities.md UPDATE・用語政策節拡充）
2. **case-open**: 7 OU から Epic Issue + 子 Issue 7件を生成
3. **case-run × 7**: 各 Issue を実装（Wave 1 → Wave 2）。OU-003 は `llm-expression-patterns.md` 新規作成・SKILL.md 参照リンク追加を含む
4. **case-close × 7**: 各 Issue を完了

REQ/ADR の変更がないため req-save はスキップされる。`llm-expression-patterns.md`・SKILL.md は docs/specs/ 外のため spec-save ではなく case-run 実装作業として扱う。
