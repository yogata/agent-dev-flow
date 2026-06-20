---
draft_type: req_draft
topic_slug: japanese-prose-revision
status: saved
created_at: 2026-06-20T00:00:00+09:00
source_rus: []
---

<!-- req_draft テンプレート（REQ-0138, ADR-0124）
     下流処理（req-save / spec-save / case-open / case-auto / case-run / case-close）の
     正となる情報源は # draft-data 内の fenced YAML であり、人間可読 Markdown セクションではない。 -->

# draft-data

```yaml
work_type: feature

scale: large

summary: |
  docs/ 配下の全日本語文書（REQ/ADR/SPEC/guides/DOC-MAP/README）および AGENTS.md の英語混在・不自然な日本語を、文意に基づく自然な日本語に改訂する。REQ-0101-061（自然な日本語化の規範）を強化し、新規 SPEC docs/specs/writing-style.md（文書執筆スタイルガイドライン）を定義する。既存 REQ-0140（文書表記・文意品質ゲート）および IR-045（英字混じり抽象用語検出）と連動し、forbidden-phrases.md（検出ルール）および glossary.md（用語の読み方・定義）と補完関係にある。
  代表22ファイルで約309件、全78ファイルで1000件以上の問題を推定。全文書の実改訂は後続 case（Epic 構成）で実施する。

auto_gate:
  auto_ready: true
  spec_consumed: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      英語語句は文意に基づいて自然な日本語に書き直す。固定訳（機械置換）ではなく、文脈に応じた適切な表現を選ぶ。現状の用語が常用されない・洗練されていない場合は、より適切で一般的な日本語表現に書き直す。この基本原則を REQ-0101-061 の強化と新規 SPEC docs/specs/writing-style.md の両方に適用する。

  - id: AG-002
    content: |
      英語のまま残す語（固有名詞・識別子）: 製品名（AgentDevFlow, OpenCode）、ID（REQ-0138, ADR-0104）、略語（REQ/ADR/SPEC/RU/OU/PR/SSoT/HITL）、コマンド名（/agentdev/req-define, intake-capture）、ファイルパス（docs/specs/system.md）、YAMLフィールド名（work_type, artifact_actions, operation_units, draft-data 等。説明文で使用する場合は日本語訳を併記）、パイプライン名（Intake/Learning/Backlog は固有名詞として英語のまま）。

  - id: AG-003
    content: |
      修飾語の日本語化の方向性: active→現行、retired→廃止、accepted→承認済み、upstream/downstream→文脈で「前工程/次工程」「上位/下位」等（固定しない）、current→現行/現在の。

  - id: AG-004
    content: |
      複合技術語の訳し方指針（文意に基づく）: domain state→「ドメイン状態」「保持する管理情報」等、runtime command→「実行時コマンド」、command topology→「コマンド構成」、provenance marker→「出典標識」、upstream handoff→「前工程からの引き継ぎ」「上位工程からの受渡し」等、fixture detail→「テストデータ詳細」「検査データ詳細」等、runtime workspace→「実行時作業領域」、canonical path→「正規パス」。いずれも文脈で最も自然な表現を選ぶ。

  - id: AG-005
    content: |
      カタカナ語の基準: 一般的に定着した語（スキーマ、ライフサイクル、カタログ、パイプライン程度）のみカタカナ化を許容。専門領域の語は文意に基づく日本語訳（fixture→「テストデータ」等、variant→「種別」「バリエーション」等、provider→「提供元」等、baseline→「基準」等）。

  - id: AG-006
    content: |
      文体基準: 「だ・である」調統一（ですます調との混在回避）、直訳調の回避（自然な助詞の使用、修飾語の適切な位置）、文の長さ適正化（1文に複数論点を詰め込まない）、英語見出しの日本語化（SPEC/ADR/guides の英見出しを含む）。

  - id: AG-007
    content: |
      用語の個別対応: finding→「検出事項」、promoted artifact→「採用済み成果物」。SSoT/HITL は略語のまま（初出のみ日本語訳併記: 「唯一の情報源（SSoT）」「人の判断を挟む（HITL）」）。

  - id: AG-008
    content: |
      対象範囲: docs/requirements/REQ-*.md（現行32件）、docs/adr/ADR-*.md（16件）、docs/specs/*.md（16件）、docs/guides/*.md（約10件）、docs/DOC-MAP.md、docs/README.md、AGENTS.md、README.md（ルート）。retired REQ（docs/requirements/retired/）は対象外（REQ-0140 の対象外と整合）。

  - id: AG-009
    content: |
      既存基盤との連動: REQ-0101-061（自然な日本語化の規範）を強化し、新規 SPEC docs/specs/writing-style.md を詳細参照先とする。REQ-0140（文書表記・文意品質ゲート）の検査対象語を拡張し、IR-045（英字混じり抽象用語検出）の検出語を追加する。forbidden-phrases.md（検出ルール）は本 SPEC の指針に基づき検出語を拡充し、glossary.md（用語の読み方・定義）は訳語を追加する。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-0101.md
    target_area: REQ-0101-061
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007, AG-009]
    content: |
      REQ-0101-061 を以下のとおり強化する（現行要件行を置き換え）:

      REQ-0101-061 | docs配下の文書（REQ/ADR/SPEC/guides/DOC-MAP/README）および AGENTS.md は、英語語句を文意に基づく自然な日本語に書き直すこと。内部処理段階名が上位docs本文に露出していないこと。以下の基準に従うこと: (a) 英語のまま残す語は、製品名・ID・略語（REQ/ADR/SPEC/RU/OU/PR/SSoT/HITL）・コマンド名・ファイルパス・YAMLフィールド名・パイプライン名（Intake/Learning/Backlog）に限定する。YAMLフィールド名は説明文で使用する場合、日本語訳を併記すること。(b) 修飾語（active/retired/accepted/upstream/downstream/current 等）は文脈に応じた自然な日本語に書き直すこと（固定訳ではない）。(c) 複合技術語（domain state/runtime command/command topology/provenance marker/upstream handoff/fixture detail 等）は文意に基づいて自然な日本語に書き直すこと。(d) カタカナ語は一般的に定着した語（スキーマ・ライフサイクル・カタログ・パイプライン程度）のみ許容し、専門領域の語（フィクスチャ・バリアント・プロバイダ・ベースライン等）は文意に基づく日本語訳を使用すること。(e) 文体は「だ・である」調に統一し、直訳調を回避し、文の長さを適正化すること。(f) 現状の用語が常用されない・洗練されていない場合は、より適切で一般的な日本語表現に書き直すこと。(g) 詳細な判断指針（残す語/訳す語/カタカナ化する語/文体基準/不自然な日本語の典型）は docs/specs/writing-style.md を参照すること

  - id: ACT-SPEC-001
    artifact: spec
    operation: create
    target: new:japanese-prose-revision
    target_area: docs/specs/writing-style.md
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007]
    content: |
      # 文書執筆スタイルガイドライン

      docs/ 配下の文書（REQ/ADR/SPEC/guides/DOC-MAP/README）および AGENTS.md の日本語執筆における判断指針。REQ-0101-061 の詳細参照先。REQ-0140（文書表記・文意品質ゲート）および IR-045（英字混じり抽象用語検出）と連動する。

      ## 基本原則
      英語語句は文意に基づいて自然な日本語に書き直す。固定訳（機械置換）ではなく、文脈に応じた適切な表現を選ぶ。現状の用語が洗練されていない場合は、より適切で一般的な日本語表現に書き直す。

      ## 英語のまま残す語（固有名詞・識別子）
      製品名（AgentDevFlow, OpenCode）、ID（REQ-0138 等）、略語（REQ/ADR/SPEC/RU/OU/PR/SSoT/HITL）、コマンド名、ファイルパス、YAMLフィールド名（説明文では日本語訳を併記）、パイプライン名（Intake/Learning/Backlog）。

      ## 修飾語の日本語化の方向性
      active→現行、retired→廃止、accepted→承認済み、upstream/downstream→文脈で「前工程/次工程」「上位/下位」等（固定しない）、current→現行/現在の。

      ## 複合技術語の訳し方指針（文意に基づく）
      domain state→「ドメイン状態」「保持する管理情報」等、runtime command→「実行時コマンド」、command topology→「コマンド構成」、provenance marker→「出典標識」、upstream handoff→「前工程からの引き継ぎ」「上位工程からの受渡し」等、fixture detail→「テストデータ詳細」「検査データ詳細」等、runtime workspace→「実行時作業領域」、canonical path→「正規パス」。いずれも文脈で最も自然な表現を選ぶ。

      ## 専門カタカナ語の日本語訳（文意に基づく）
      fixture→「テストデータ」「検査データ」、variant→「種別」「バリエーション」「形式」、provider→「提供元」、baseline→「基準」、finding→「検出事項」、promoted artifact→「採用済み成果物」。

      ## カタカナ語（一般的定着語は許容）
      許容: スキーマ、ライフサイクル、カタログ、パイプライン 程度。非許容（文意に基づく日本語訳）: フィクスチャ、バリアント、プロバイダ、ベースライン 等。

      ## 略語の扱い
      SSoT, HITL は略語のまま使用。初出時のみ日本語訳（「唯一の情報源（SSoT）」「人の判断を挟む（HITL）」）を併記。

      ## 文体基準
      「だ・である」調統一、直訳調の回避、文の長さ適正化、英語見出しの日本語化。

      ## 不自然な日本語の典型（検出対象）
      - 英語複合名詞をそのまま日本語の主語・目的語にする（例: 「domain state として扱う」）
      - フィールド名・値が説明なしで文中に露出する
      - 1つの要件行に複数の責務・例外・配置先を詰め込み長文化する
      - 直訳調の複合語（例: 「外科的な変更」「永続ドメイン状態」）
      - 英語名詞をそのまま日本語助詞につなぐ（例: 「drift をチェックする」）
      - 標準構成外セクション（変更履歴・関連情報）の残存

  - id: ACT-SPEC-002
    artifact: spec
    operation: update
    target: docs/specs/integrity-rule-catalog.md
    target_area: IR-045
    source_items: [AG-001, AG-004, AG-005, AG-009]
    content: |
      IR-045（docs 日本語表現・文意整合検査）の検出対象語を拡張する。現行の検出語（read-only/advisor/advisory/architecture-affecting/Architecture advisory gate）に加え、以下の語を検出対象に追加する: 修飾語（active REQ, retired REQ, accepted ADR, active docs）、複合技術語（domain state, runtime command, command topology, provenance marker, upstream handoff, fixture detail）、専門カタカナ語（fixture, variant, provider, baseline）。detection_method の対象ファイル・検出語を拡張し、false_positive_risk の判定基準（識別子として正当な英字語の除外）を維持する。検出語の推奨訳は docs/specs/writing-style.md を参照する。

conflict_resolutions:
  - id: CR-001
    conflict: 固定訳表で機械置換するか、文意に基づく自然な日本語化とするか。
    resolution: |
      文意に基づく自然な日本語化を採用。ユーザー指摘「現状の用語自体が洗練されていないケースがほとんど」「フィクスチャ/バリアントは常用しない」「upstream handoff は文意に基づいて用語を変えるべき」に基づく。SPEC は機械置換の辞書ではなく、執筆時の判断指針を提供する。

operation_units:
  - ou_id: OU-001
    source_ru:
    target_req: REQ-0101
    target_spec:
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

  - ou_id: OU-002
    source_ru:
    target_req:
    target_spec: new:japanese-prose-revision
    operation: spec-create
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

  - ou_id: OU-003
    source_ru:
    target_req:
    target_spec: docs/specs/integrity-rule-catalog.md
    operation: spec-update
    scale: standard
    depends_on: [OU-002]
    recommended_order: 2
    issue_policy: single
    result: {}

case_open_hints:
  epic_needed: true
  decomposition: |
    Wave 1（要件・仕様定義）: REQ-0101-061 UPDATE + writing-style.md SPEC 作成 + forbidden-phrases.md/glossary.md/IR-045 連動更新。単一 Issue。req-save → spec-save → case-open。
    Wave 2〜（全文書改訂）: ファイル群ごとに分割。REQ群（32件）、ADR群（16件）、SPEC群（16件）、guides/AGENTS/README群（約14件）。各群をさらに数ファイル単位の Issue に分割し、Epic 配下で管理。
  wave_hints:
    - "Wave 1: 要件・仕様定義（req-save → spec-save → case-open, 単一 Issue）"
    - "Wave 2: REQ群改訂（複数 Issue、REQ-0101/0103/0108 等の高問題件数ファイル優先）"
    - "Wave 3: ADR群改訂（複数 Issue）"
    - "Wave 4: SPEC群改訂（複数 Issue）"
    - "Wave 5: guides/AGENTS/README群改訂（複数 Issue）"
```

# summary

本ドラフトは、AgentDevFlow の全日本語文書（REQ/ADR/SPEC/guides/AGENTS.md/README 等の計78ファイル）の英語混在・不自然な日本語を、文意に基づく自然な日本語に改訂する要件を定義する。

## 合意した方針（核心）

1. **文意に基づく自然な日本語化**（固定訳・機械置換ではない）
2. **英語のまま残す語**を固有名詞・識別子（製品名・ID・略語・コマンド名・パス・YAMLフィールド名・パイプライン名）に限定
3. **修飾語・複合技術語**は文意に応じた自然な日本語に書き直し
4. **カタカナ語**は一般的定着語のみ許容、専門語は文意に基づく日本語訳
5. **文体**は「だ・である」調統一、直訳調回避、文の長さ適正化、英語見出しの日本語化
6. **用語の洗練**を前提とする（現状の用語が洗練されていない場合は書き直す）

## 成果物

- **REQ-0101-061 UPDATE**: 自然な日本語化の規範を強化。残す語/訳す語/カタカナ語/文体の基準を明記。
- **新規 SPEC docs/specs/writing-style.md**: 文書執筆スタイルガイドライン。執筆時の判断指針（残す語/訳す語/カタカナ化する語/文体基準/不自然な日本語の典型）を提供。
- **連動更新**: forbidden-phrases.md（検出ルール拡充）、glossary.md（訳語追加）、IR-045（検出語拡張）。

## 既存基盤との関係

基盤は既存（REQ-0101-061, REQ-0140, IR-045, glossary.md, forbidden-phrases.md）。本要件は「基準の強化」と「全文書の実改訂」の両面。実改訂は後続 case（Epic 構成）で実施。

# 実装詳細: 全修正点洗い出し結果

<!-- REQ-0102-057 実装詳細の分離: artifact_actions の content（合意内容）とは分離。
     実装詳細がドラフト全体の過半を占めるため、本セクションは要約版とし、
     詳細な全修正点（全78ファイル）は後続 case で実施する。 -->

## 影響規模

- **代表22ファイル**（REQ 8件、ADR/SPEC 7件、guides/AGENTS/README 7件）で **約309件** の問題を抽出
- **全78ファイル**では **1000件以上** の問題を推定
- 英語混在が大部分（約70%）、不自然な日本語・洗練されていない用語が約30%

## ファイル群ごとの問題件数（代表ファイル）

### REQ群（代表8件・約170件）

| ファイル | 問題件数 | 主なパターン |
|---------|---------|-------------|
| REQ-0101 | 約22件 | active/retired の未訳、domain state/canonical path の露出、長文 |
| REQ-0102 | 約15件 | active REQ 残存、catalog entry/scale:large の説明なし露出 |
| REQ-0103 | 約32件 | command/skill/template/script/runtime/canonical/source/projection の多用、variant/provider/baseline 未訳 |
| REQ-0104 | 約20件 | upstream handoff の頻出、workflow_route/metadata/marker/protocol の露出 |
| REQ-0108 | 約24件 | artifact/finding/report/intake item/checker/fixture/baseline/false positive 未訳 |
| REQ-0136 | 約17件 | 変更履歴セクション残存、retire/approach/status/no-op 英語動詞 |
| REQ-0138 | 約16件 | soft contract/producer-side standard/schema/parser 露出、「正」の硬い用法 |
| REQ-0140 | 約14件 | read-only/architecture-affecting/advisory/gate の英語混在 |

### ADR/SPEC群（代表7件・約70件）

| ファイル | 問題件数 | 主なパターン |
|---------|---------|-------------|
| ADR-0104 | 約10件 | runtime/authoring/repo-internal の抽象英語、retired 未訳 |
| ADR-0124 | 約10件 | soft contract 直置き、producer/consumer、schema 周辺 |
| document-model.md | 約10件 | 英語見出し、active/retired/baseline、SPEC分離基準の英語専門語 |
| integrity-rule-catalog.md | 約10件 | 英語列名・値の説明不足、baseline/finding/triage/fixture/variant |
| workflow-contracts.md | 約10件 | 英語見出し、status/work_type/scale 説明不足、promoted artifact/Finding |
| artifact-contracts.md | 約10件 | 英語見出し、runtime/source/canonical/domain knowledge、variant/envelope |
| system.md | 約10件 | agent/frontmatter/Step 混在、active queue/living pool、長文過多 |

### guides/AGENTS/README群（代表7件・約69件）

| ファイル | 問題件数 | 主なパターン |
|---------|---------|-------------|
| AGENTS.md | 約10件 | active/retired 未訳、複合技術語直訳、英語単語混入 |
| glossary.md | 約10件 | promoted artifact/finding/source/projection/runtime 未訳 |
| artifacts-and-state.md | 約10件 | runtime/domain state/projection/source 頻出、handoff 未訳 |
| design-principles.md | 約10件 | 英語見出し、false negative/dispatcher/orchestration skill 未訳、長文 |
| patterns.md | 約9件 | frontmatter 周辺、active/retired 未訳、plan/notepad 説明語が英語 |
| README.md | 約10件 | 英語中心見出し・表項目、promoted artifact/finding/domain state 未訳 |
| docs/README.md | 約10件 | 英語見出し・リンク名、REQタイトル内英語混在、L5 長文 |

## 共通パターン（全ファイル群で頻出）

1. **修飾語の未訳**: active/retired/accepted/current → 現行/廃止/承認済み/現在の
2. **複合技術語の未訳**: domain state/runtime command/command topology/provenance marker/upstream handoff/fixture detail
3. **フィールド名・値の説明なし露出**: work_type/artifact_actions/finding/false positive 等
4. **英語見出し**: SPEC/ADR/guides の英見出し（"Document Model Specification", "Scope", "Purpose" 等）
5. **直訳調の複合語**: 「外科的な変更」「永続ドメイン状態」「ランタイム投射先」等
6. **長文に複数論点を詰め込む**: 特に REQ-0101-052/067/068、docs/README.md L5、design-principles.md L87
7. **標準構成外セクションの残存**: REQ-0136 の変更履歴・関連情報等

## 代表的な問題例（トップ10）

| # | ファイル | 問題箇所 | 修正方向 |
|---|---------|---------|---------|
| 1 | REQ-0101 L10 | `active REQ は現在満たすべき要件を表し、retired REQ は履歴参照に限定する` | 現行REQ/廃止REQ |
| 2 | REQ-0103 L20 | `template variant ... runtime projection ... canonical` | 種別/配置先/正規 に分解 |
| 3 | REQ-0104 L33-39 | `upstream handoff` の頻出 | 前工程からの引き継ぎ 等 |
| 4 | REQ-0108 L10 | `artifact ... finding ... report ... checker ... false positive` | 成果物/検出事項/レポート/検査器/誤検知 に分割 |
| 5 | ADR-0104 L13 | `runtime command` | 実行時コマンド |
| 6 | ADR-0124 L3 | `soft contract` | 緩やかな契約 |
| 7 | document-model.md L59-72 | `schema/command topology/rule catalog/fixture detail` | スキーマ/コマンド構成/ルール一覧/テストデータ詳細 |
| 8 | AGENTS.md L3 | `アクティブな REQ` | 現行REQ |
| 9 | glossary.md L17 | `promoted artifact` | 採用済み成果物 |
| 10 | README.md L5 | `Plugin identity` | プラグイン識別情報 |

## 詳細な全修正点の実施方法

本ドラフトに記載したのは代表22ファイルのサマリ。**全78ファイルの詳細な修正点**（文ごとの書き直し案）は、後続 case で実施する。具体的には：

- Wave 1（要件・仕様定義）完了後、writing-style.md SPEC の指針に基づき、各ファイル群の改訂 case を生成
- 各 case で、対象ファイルを文意に基づいて書き直す（機械置換ではなく、文脈判断）
- 高問題件数ファイル（REQ-0103 約32件、REQ-0108 約24件、REQ-0101 約22件、REQ-0104 約20件）を優先

## 完了条件チェックボックス（要約）

本要件の完了条件は以下のとおり（case-open で展開）:

- [ ] REQ-0101-061 が強化後の基準（(a)〜(g)）に更新されている
- [ ] docs/specs/writing-style.md が作成され、基本原則/残す語/修飾語/複合技術語/専門カタカナ語/カタカナ語基準/略語/文体/不自然な日本語の典型の各セクションを含む
- [ ] forbidden-phrases.md の検出語が本 SPEC の指針に基づき拡充されている
- [ ] glossary.md に主要な訳語（採用済み成果物/検出事項 等）が追加されている
- [ ] IR-045 の検出対象語が本 SPEC の指針に基づき拡張されている
- [ ] docs/requirements/REQ-*.md（32件）の英語混在・不自然な日本語が改訂されている
- [ ] docs/adr/ADR-*.md（16件）の英語混在・不自然な日本語が改訂されている
- [ ] docs/specs/*.md（16件）の英語混在・不自然な日本語が改訂されている
- [ ] docs/guides/*.md（約10件）の英語混在・不自然な日本語が改訂されている
- [ ] AGENTS.md, README.md, docs/README.md, docs/DOC-MAP.md の英語混在・不自然な日本語が改訂されている
- [ ] 英語見出しが日本語化されている（SPEC/ADR/guides を含む）
