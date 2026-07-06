---
draft_type: req_draft
topic_slug: spec-4-way-classification
status: saved
created_at: 2026-07-06T12:00:00+09:00
source_rus: [RU-20260706-02]
req_saved: true
spec_consumed: true
---

<!-- req_draft テンプレート
  このテンプレートは req-define が生成する構造化引き継ぎ成果物の原本である。
  後続工程（req-save/ spec-save/ case-open/ case-auto/ case-run/ case-close）が参照する
  原本の情報源は # draft-data 内の YAML コードブロックであり、人間可読 Markdown セクションではない。
  soft contract（生成元側標準）であり、LLM 推論経由で消費される。
  厳格なスキーマバージョン、JSON Schema、バリデータは導入しない。 -->

# draft-data

```yaml
# work_type: 要件の分類（bugfix / feature / maintenance / docs_chore）
work_type: feature

# scale: feature のみ standard / large。
scale: standard

# summary: 当該 draft が何を合意したかの1段落要約。
summary: >
  SPEC 内部論理区分を 5 区分（挙動/カタログ/横断contract/索引/詳細）から 4 区分（挙動SPEC、カタログSPEC、横断契約SPEC、実装詳細SPEC）へ整理する。
  索引 SPEC は廃止し、索引文書（DOC-MAP.md、specs/README.md）は既存文書種別（探索経路インデックス、SPEC マニフェスト）の役割表現として SPEC 内部論理区分から分離する。
  横断 contract SPEC は横断契約 SPEC へ、詳細 SPEC は実装詳細 SPEC へ名称変更する。
  共通コマンドは SPEC 内部論理区分の区分数をハードコードしない（REQ-0155-006 の一般化）。

# auto_gate: case-auto 自走可否の判定材料
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

# agreed_items: 合意された個別項目。
agreed_items:
  - id: AG-001
    content: >
      SPEC 内部論理区分は、挙動SPEC、カタログSPEC、横断契約SPEC、実装詳細SPECの 4 区分とする。
      索引 SPEC は廃止し、索引文書（DOC-MAP.md、specs/README.md）は SPEC 内部論理区分に含めない。
      各区分の規範は各レポジトリの document-model.md が定義する。
      横断 contract SPEC は横断契約 SPEC へ、詳細 SPEC は実装詳細 SPEC へ名称変更する（英字混在の解消、スコープの明確化）。
      対象ファイル: docs/requirements/REQ-0155.md、docs/specs/foundations/document-model.md、docs/specs/responsibilities/document-type-responsibilities.md、docs/DOC-MAP.md、docs/requirements/README.md。
  - id: AG-002
    content: >
      索引文書（DOC-MAP.md、specs/README.md）は既存文書種別（DOC-MAP.md = 探索経路インデックス、specs/README.md = SPEC マニフェスト）の役割表現であり、新文書種別ではない。
      索引文書を SPEC 内部論理区分とは別の位置づけとして document-model.md に明記し、文書 7 分類との整合性を保持する。
  - id: AG-003
    content: >
      共通コマンド（agentdev-* コマンド、スキル）は SPEC 内部論理区分の区分数をハードコードしない。
      各レポジトリの document-model.md が規範。
      唯一の例外は intake/learning のキャプチャ内容が AgentDevFlow 本体か適用レポジトリかの区別とする。
      数値（4、5 等）に固定せず、document-model.md の規範を参照する設計とする。

# artifact_actions: REQ/ADR/SPEC への保存対象を成果物別ではなく1つの配列に統合
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-0155.md
    target_area: "要件テーブル REQ-0155-001 行、REQ-0155-006 行、関連情報 関連SPEC 行"
    source_items: [AG-001, AG-003]
    content: |
      更新後 REQ-0155-001 行:
      | REQ-0155-001 | SPEC は文書種別として維持し、内部を挙動SPEC、カタログSPEC、横断契約SPEC、実装詳細SPECの論理区分で整理すること。各区分の規範は各レポジトリの document-model.md が定義すること |

      更新後 REQ-0155-006 行:
      | REQ-0155-006 | agentdev-* コマンド、スキルは AgentDevFlow レポジトリと適用レポジトリを区別せず、SPEC内部論理区分は各レポジトリの document-model.md が定義する規範を参照すること。共通コマンドはSPEC内部論理区分の区分数をハードコードしないこと。唯一の例外は intake/learning のキャプチャ内容が AgentDevFlow 本体か適用レポジトリかの区別とすること |

      更新後 関連情報 関連SPEC 行:
      - **関連 SPEC**: document-model.md（SPEC内部論理区分、7分類、局所物理分離の規範）、req-health-metrics.md（粒度ゲート閾値）

  - id: ACT-SPEC-001
    artifact: spec
    operation: update
    target: docs/specs/foundations/document-model.md
    target_area: "関心分担表（SPEC 内部論理区分 行）+ 「SPEC 内部論理区分」セクション（見出し〜文書7分類モデル 前）"
    source_items: [AG-001, AG-002, AG-003]
    content: |
      関心分担表 該当行（21行）の更新後:
      | SPEC 内部論理区分、文書7分類、局所物理分離、docs/specs/ 直下のドメイン別体系化規範 | 本 SPEC |

      「SPEC 内部論理区分」セクション全体の更新後（見出し〜文書7分類モデル 前）:

      ## SPEC 内部論理区分

      SPEC は文書種別として維持し、内部を以下の論理区分で整理する（REQ-0155-001）。各区分の規範は各レポジトリの document-model.md が定義する。
      従来の3層ディレクトリ構造（commands/skills/workflows/直下）を維持しつつ、各 SPEC ファイルの内容がいずれの論理区分に属するかを明確にする。

      | 論理区分 | 記述対象 | 代表例 |
      |---|---|---|
      | 挙動SPEC | コマンド、スキル、ワークフローの振る舞い、入出力、副作用、停止条件 | commands/req-define.md、skills/`agentdev-req-analysis`.md |
      | カタログSPEC | スキーマ、enum、判定表、ルールカタログ、テンプレート種別 | integrity-rule-catalog.md、req-impact-map.md |
      | 横断契約SPEC | 複数コマンド、スキルにまたがる共通契約 | workflows/workflow-contracts.md、workflows/delegation-contracts.md |
      | 実装詳細SPEC | 内部アルゴリズム、パラメータ、実装詳細 | req-health-metrics.md、quality-gates.md |

      1つの SPEC ファイルが複数の論理区分にまたがる場合、主たる区分をファイルの冒頭に明示する。
      論理区分は物理的なディレクトリ分離を意味せず、既存3層構造内での内容整理のための区分である。
      従来の workflows/ 層が横断契約 SPEC に対応する。

      索引文書（DOC-MAP.md、specs/README.md）は文書探索、参照経路の入口を担うが、SPEC 内部論理区分には含まれない。索引文書は既存文書種別（DOC-MAP.md = 探索経路インデックス、specs/README.md = SPEC マニフェスト）の役割表現であり、新文書種別ではない。

  - id: ACT-SPEC-002
    artifact: spec
    operation: update
    target: docs/specs/responsibilities/document-type-responsibilities.md
    target_area: "冒頭 SPEC 分担表の行（11行）"
    source_items: [AG-001]
    content: |
      更新後（冒頭引用ブロック 11行）:
      > 文書種別の基準境界（REQ/ADR/SPEC/guides/DOC-MAP の役割定義、ライフサイクル、優先順位、参照規則、投影方向、SPEC内部論理区分、文書7分類、局所物理分離、ドメイン別体系化規範）は `../foundations/document-model.md` の正本を参照する。

# conflict_resolutions: 壁打ちで解消された衝突の記録
conflict_resolutions:
  - id: CR-001
    conflict: >
      索引 SPEC と文書 7 分類の矛盾。DOC-MAP.md は ADR-0103/ADR-0110 が独立文書種別「探索経路インデックス」と定義済みであり、specs/README.md は SPEC マニフェストであるにもかかわらず、索引 SPEC として SPEC 内部論理区分に含まれていた。
    resolution: >
      索引 SPEC を廃止し、索引文書を既存文書種別の役割表現として SPEC 内部論理区分から分離する。
      これにより ADR-0103/ADR-0110 との整合性が高まる。Oracle 相談（bg_4d3ef45b）で確定。
  - id: CR-002
    conflict: >
      ADR-0103 supersede の可能性。SPEC 内部論理区分の変更が ADR-0103（文書種別責務境界）の管轄か。
    resolution: >
      ADR 不要。ADR-0103 は文書「種別」境界を定め、SPEC 内部論理区分は管轄外。
      5 区分は元来 REQ-0155-001（2026-06-26 新設）と document-model.md で確立された REQ/SPEC 構築物であり、どの ADR も「SPEC は 5 区分を持つべし」と決定していない。
      Oracle 相談（bg_4d3ef45b）で確定。agentdev-adr-guidelines #4（命名規約）、#5（artifact contract 変更）、#10（既存文書種別適合）に該当し ADR 作成不可条件にも合致。

# operation_units: 複数RU入力時の統合/分離結果。
operation_units:
  - ou_id: OU-001
    source_ru: RU-20260706-02
    target_req: REQ-0155
    target_spec: docs/specs/foundations/document-model.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

# test_strategy: 各合意項目（AG-*）の検証方法。
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      旧用語の残存を検出:
      rg "横断contract SPEC|索引SPEC" docs src .agentdev
      ※ 「詳細SPEC」単独は「実装詳細SPEC」の文脈で「詳細」が現れる場合があるため、「詳細SPEC」単独の rg は偽陽性の可能性あり。手動で文脈確認。
      また 5 区分表記の残存を検出:
      rg "SPEC内部5|SPEC 内部5|5論理区分|5区分" docs src .agentdev
    pass_criteria: |
      「横断contract SPEC」「索引SPEC」の残存なし。
      「SPEC内部5」「SPEC 内部5」「5論理区分」「5区分」の残存なし。
    on_failure: |
      fix-and-reverify。残存箇所を新しい用語に置換して再検証。
  - id: TS-002
    target_item: AG-002
    verification: |
      document-model.md の「SPEC 内部論理区分」セクション末尾に、索引文書の位置づけを明記した段落が存在することを確認。
    pass_criteria: |
      索引文書（DOC-MAP.md、specs/README.md）が SPEC 内部論理区分に含まれないこと、既存文書種別の役割表現であることが明記されていること。
    on_failure: |
      fix-and-reverify。段落を追記して再検証。
  - id: TS-003
    target_item: AG-003
    verification: |
      REQ-0155-006 と document-model.md の見出し・導入文で「5区分」等の数値固定がないことを確認。
      rg "5区分" docs/requirements/REQ-0155.md docs/specs/foundations/document-model.md
    pass_criteria: |
      REQ-0155-006 に「5区分」のハードコードなし。
      document-model.md の見出しに「（5区分）」等の数値固定なし。
    on_failure: |
      fix-and-reverify。数値固定を一般化表現に置換して再検証。

# case_open_hints: case-open 構成生成への参考情報
case_open_hints:
  epic_needed: false
  decomposition: []
  wave_hints: []
```

# summary

SPEC 内部論理区分の整理（5 区分 → 4 区分）と名称変更、索引 SPEC 廃止を合意した。

**反映対象ファイル**（case-open が Issue 本文に含める対象）:
- docs/requirements/REQ-0155.md（REQ-0155-001、REQ-0155-006、関連情報 関連SPEC）
- docs/specs/foundations/document-model.md（関心分担表 21 行、SPEC 内部論理区分セクション 395-411 行）
- docs/specs/responsibilities/document-type-responsibilities.md（冒頭分担表 11 行）
- docs/DOC-MAP.md（67 行、136 行: 用語置換）
- docs/requirements/README.md（59 行: 用語置換）

**対象外**（RU-20260706-02 本文で明示）:
- ADR 新規作成（Oracle 相談で ADR 不要確定）
- tentative_classification 許容値追加
- 文書 7 分類の値変更
- backlog-review/req-define 分類ロジック変更
- docs/specs/ 物理ディレクトリ再編
- workflows/ ディレクトリ名変更
- DOC-MAP.md 文書種別変更（探索経路インデックスを維持）
- specs/README.md status 追跡責務変更

**執筆方針**: canonical docs（REQ-0155.md、document-model.md、document-type-responsibilities.md）には変更後の現在形のみを記述し、「5 区分から」「廃止」「移行」等の履歴語は使用しない。

**ADR 不要の根拠**（Oracle bg_4d3ef45b）: 5 区分は REQ/SPEC 構築物であり ADR で一度も決定されていない。変更に ADR 不要。索引 SPEC 廃止は ADR-0103/ADR-0110 との整合性向上。名称変更は ADR ガイドライン #4（命名規約）。
