---
draft_type: req_draft
topic_slug: req-spec-semantic-classification-and-canonical-ownership
status: saved
created_at: 2026-07-22T23:30:00+09:00
source_rus:
  - RU-20260722-02
agentdev_handoff: true
---

<!-- req_draft: RU-20260722-02（REQ/SPEC責任分界とlearning/intake由来変更の適正配置）単独処理。
  Step 11-2 SPLIT 判定により、全20 RU から本 RU のみを単独切り出し。
  アーキテクチャ助言サブエージェント（oracle）相談結果と evidence-first 原則により
  ユーザー確認事項2点・ブロッカー1点を確定事項へ再分類済み。
  agentdev_handoff: true（AgentDevFlow 本体・配布物の改善、Step 3-1）。 -->

# draft-data

```yaml
# work_type: feature（REQ/SPEC 意味分類と正規所有モデルの新規確立、既存 REQ/SPEC 拡張）
work_type: feature

# scale: large（Epic 規模。7 OU 構成、全現行 REQ/SPEC 横断的再評価を含む）
scale: large

# agentdev_handoff: AgentDevFlow 本体・配布物の改善（Step 3-1）
agentdev_handoff: true

# summary: 合意内容の1段落要約
summary: |
  RU-20260722-02 に基づき、REQ/SPEC 責任分界を意味分類と正規所有の一体モデルとして再構築する。
  REQ をステークホルダー視点（4妥当性基準: 要求元ステークホルダー特定、観測可能成果、内部実装非依存、要求文存立）に限定し、
  SPEC 論理区分を現行4区分（挙動/カタログ/横断契約/実装詳細）から5区分（パラメータ責務を独立）へ拡張する。
  正規所有の単位は REQ-0119-033「責務ごと」の延長として安定した関心キーとし、同一関心への複数正規所有宣言を禁止する。
  learning/intake 由来変更は変更種別（新規利用者要求/外部契約変更/バリエーション/エッジケース/パラメータ調整/不適合修正/内部再構成/文書訂正）で分類し、
  REQ 拡張を新規利用者要求・外部契約変更に限定する。分類根拠を learning/intake → RU → req-define → spec-save へ伝播させる。
  req-define は REQ 影響と SPEC 正規所有者を確定し、REQ 影響なし変更から REQ 保存操作を生成しない。
  spec-save は対象 SPEC の主論理区分・正規所有対象と保存内容の整合を「配置一貫性検証」として検証する（REQ-0136-030 の内容品質再検証禁止との整合を保持）。
  強制ゲート（保存拒否）は宣言形式定義後に有効化し、宣言未完了の既存 SPEC は警告モードで経過観察する（後方互換）。
  REQ/SPEC 横断診断を強化し、ステークホルダー不在要件・内部成果物主語要件・パラメータ主題要件・作業履歴主題要件・要件行なしREQ、
  主論理区分不明SPEC・正規所有対象不明SPEC・所有権重複・不当混在・所有先なしパラメータ・実装/履歴混入・REQ重複・accepted間分界不一致・実装-SPEC所有不一致を検出する。
  既存 REQ/SPEC を新基準でパターンベース再評価する（個別修正ではなく同型違反の横断適用）。
  新規 ADR（new:req-spec-semantic-classification-and-canonical-ownership）を ADR-0103/0123/0107 への relates-to として作成する。

# auto_gate: case-auto 自走可否
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
      REQ は識別可能なステークホルダーが求める状態、振る舞い、制約、外部契約を記述する文書種別として定義される。
      REQ 候補は次の4妥当性基準を満たす: (a) 要求するステークホルダーを特定できる、(b) ステークホルダーが得る成果または回避できる問題を説明できる、(c) 成果物内部を知らなくても達成を観測できる、(d) 内部構成を変更しても要求文が成立する。
      REQ 要件行が具体パス、スキーマフィールド、enum 値一覧、route/category/status 詳細判定表、ファイルパターン、テンプレート種別、レポート形式、テストデータ詳細、回帰テスト条件、個別 checker ルール、誤検出抑制方式、retry 回数、token 目安、行数上限、Step 番号、Phase 番号、内部アルゴリズム、作業履歴、Case/RU/Issue/PR/OU 由来の作業記録のみを主たる文意とする場合、当該内容は SPEC 等へ配置する対象である（REQ-0101-068 の延長）。
      安定契約例外（REQ-0101-069）は維持する: 公開 command 名、公開入口、ドメイン状態の位置づけ、他 command との接続契約、利用者に見える分類体系、安全境界、停止条件の大枠、後続工程が依存する安定した外部契約は REQ に要約として記述できる。

  - id: AG-002
    content: |
      SPEC 論理区分は現行4区分（挙動SPEC、カタログSPEC、横断契約SPEC、実装詳細SPEC）を拡張し、5区分（挙動SPEC、カタログSPEC、横断契約SPEC、パラメータSPEC、実装詳細SPEC）とする。
      パラメータ責務（retry 回数、timeout、閾値、重み、優先順位、上限、下限、fallback、許容範囲等）を実装詳細から区別し、learning/intake 由来のパラメータ調整の正規所有先として機能させる。
      パラメータは単一の全体パラメータファイルへ集約せず、対象 command、skill、workflow、品質ルール、整合性ルール等の所有責務に基づいて配置先を決定する。

  - id: AG-003
    content: |
      各 SPEC は当該ファイルが主として所有する論理区分（主論理区分）および成果物、関心対象を frontmatter または冒頭宣言節で識別可能にする。
      複数論理区分を含む SPEC は主論理区分と従属する区分を判別できる状態にする。
      正規所有の単位は「安定した関心キー」である（REQ-0119-033「責務ごとに最も安定した最小の定義元を正規とする」の延長）。
      1ファイルが複数関心を参照することは許容するが、正規定義だけを単一所有とする。同一仕様関心について複数 SPEC が正規所有者を主張しないこと。

  - id: AG-004
    content: |
      learning/intake 由来の知見は文書種別を直接確定する前に、次の変更種別で分類する: 新しい利用者要求、利用者から見える外部契約の変更、既存要求を満たすバリエーション追加、エッジケース対応、パラメータ調整、既存REQ/SPECへの不適合修正、外部挙動を変えない内部再構成、文書記述の訂正。
      新しい利用者要求または外部契約変更に該当する場合のみ、REQ の作成または拡張を候補とする。それ以外（バリエーション追加、エッジケース、パラメータ調整、不適合修正、内部再構成、文書訂正）は、既存REQ が要求を既に保持している限り REQ を拡張しない。
      learning/intake 成果物から後続工程（RU、req-define、spec-save）へ、次の分類根拠を引き継ぐ: 変更の性質、REQ影響の有無、対象ステークホルダー、利用者から見える変更の有無、SPEC論理区分、正規所有対象、追記先を選択した理由、根拠となる観測事実。
      分類根拠は追加情報として扱い、欠落時は unknown 相当の推定と警告を許す（後方互換、soft-contract 維持: ADR-0124）。具体的なフィールド名、enum 表現、シリアライズ形式は SPEC で定義する。

  - id: AG-005
    content: |
      req-define は backlog-review の暫定分類（tentative_classification）をそのまま採用せず、次を確定する: 新しいステークホルダー要求か、既存REQ が要求を既に保持しているか、利用者から見える外部契約が変わるか、REQ の作成・更新が必要か、SPEC のどの論理区分へ配置するか、どの成果物またはドメインが正規所有者か、既存 SPEC のどの領域が正規追記先か。
      REQ 影響なしと確定した変更からは REQ 保存操作を生成しない。

  - id: AG-006
    content: |
      spec-save は対象 SPEC ファイルおよび見出しの存在確認に加え、次を「配置一貫性検証」として検証する: 変更の論理区分と対象 SPEC の主論理区分が整合する、変更の所有対象と対象 SPEC の正規所有対象が整合する、同一関心の別の正規所有 SPEC が存在しない、command 固有仕様を不当に横断 SPEC へ配置していない、パラメータ変更を不当に挙動説明またはカタログへ混入させていない、accepted SPEC 間で責任分界が矛盾しない。
      この検証は「確定済み分類・所有情報と保存先の整合確認」であり、「内容品質の再査読」ではない（REQ-0136-030 の内容品質再検証禁止との整合）。
      内容品質は引き続き req-define QG-1 の責務である。
      不一致を検出した場合、保存せず、分類または追記先の再判定へ戻す。

  - id: AG-007
    content: |
      spec-save の強制ゲート（保存拒否条件: 重複所有、配置不一致）は、SPEC 宣言形式（主論理区分、正規所有対象）の定義完了後に有効化する。
      宣言形式が未定義の既存 SPEC は警告モードで経過観察する（後方互換期間）。導入順序: (a) 分類と所有の宣言形式を定義、(b) 既存 SPEC を警告モードで棚卸し、(c) 重複を解消、(d) 新規/変更 SPEC にのみ強制、(e) 最後に全件強制。
      bootstrap 問題（宣言前に強制すると既存 SPEC 処理不能）を避けるため、強制は段階的に有効化する。

  - id: AG-008
    content: |
      REQ 健全性診断は行数・関心数に加え、次を検出する: ステークホルダーが特定できない要件、内部成果物（command、skill、script、ファイル）だけを主語とする要件、パス・フィールド・enum・閾値・内部アルゴリズムを主題とする要件、作業履歴または是正結果を主題とする要件、要件行を持たない現行 REQ。
      SPEC 健全性診断は行数・status・配置に加え、次を検出する: 主論理区分が不明な SPEC、正規所有対象が不明な SPEC、同一関心の所有権重複、論理区分の不当な混在、所有先のないパラメータ群、実装計画または作業履歴の混入、REQ との規範重複、accepted SPEC 間の責任分界不一致、実装成果物と SPEC の所有権不一致。

  - id: AG-009
    content: |
      新規 ADR「REQ/SPEC 意味分類と正規所有モデル」を ADR-0103（文書種別責務境界）、ADR-0123（SPEC lifecycle と spec-save の導入）、ADR-0107（コマンド・スキル・テンプレート・スクリプト責任分界）への relates-to 関係として作成する（supersede ではない）。
      根拠: document-model.md L226「accepted ADR の意味変更を禁止、変更時は新規 ADR」、REQ-0119-033 自身も「適用条件の精緻化のため新規 ADR は作成しない」の先例。
      ADR-0103/0123/0107 の意味（文書種別境界、SPEC lifecycle、責任分界）は維持し、新規概念（5分類、パラメータ責務、関心キー所有、分類根拠伝播）を追加する。
      ADR 番号は new:req-spec-semantic-classification-and-canonical-ownership 形式とし、確定番号は req-save が agentdev-adr-file-manager の採番ルールで付与する。

  - id: AG-010
    content: |
      現行 REQ および現行 SPEC について、ステークホルダー視点と成果物視点に基づく再分類を実施する。局所的な文言修正ではなく、同型の責任分界違反を全現行 REQ/SPEC へ横断適用する。
      REQ の主題が妥当であっても、要件行単位で SPEC 詳細を分離する。SPEC は主論理区分、正規所有対象、重複責務、不適切な実装計画または履歴記述を評価する。
      後方互換性: 分類メタデータは追加情報として扱い、欠落時は unknown 既定値で警告する。既存の採用済み成果物、RU、req_draft を欠落により拒否しない。厳格なバージョン付きスキーマへは変更しない（ADR-0124 soft-contract 維持）。

# artifact_actions: REQ/ADR/SPEC への保存対象を1つの配列に統合
# 1 action = 1 artifact × 1 editing concern
artifact_actions:
  # === REQ 操作（7件）===
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: REQ-0101
    source_items: [AG-001]
    content: |
      REQ-0101（文書・REQ管理基準）へ次を APPEND する:
      - REQ は識別可能なステークホルダーが求める状態、振る舞い、制約、外部契約を記述する文書種別であること。REQ 候補は4妥当性基準（要求元ステークホルダー特定、観測可能成果、内部実装非依存、要求文存立）を満たすこと。
      - 既存 REQ-0101-067（REQ/SPEC文書種別境界）、REQ-0101-068（SPEC分離基準）、REQ-0101-069（安定契約例外）は維持し、ステークホルダー視点と4妥当性基準を追加で明文化する。
      - 内部成果物（command、skill、script、ファイル）だけを主語とし、具体パス、フィールド、enum、閾値、アルゴリズム、作業履歴が主題となる記述は原則として SPEC へ配置することを再確認する。

  - id: ACT-REQ-002
    artifact: req
    operation: append
    target: REQ-0102
    source_items: [AG-005]
    content: |
      REQ-0102（要件定義・保存）へ次を APPEND する:
      - req-define は backlog-review の暫定分類（tentative_classification）をそのまま採用せず、次を確定する責務を持つ: 新しいステークホルダー要求か、既存REQ が要求を既に保持しているか、利用者から見える外部契約が変わるか、REQ の作成・更新が必要か、SPEC のどの論理区分へ配置するか、どの成果物またはドメインが正規所有者か、既存 SPEC のどの領域が正規追記先か。
      - REQ 影響なしと確定した変更から REQ 保存操作を生成しないこと。

  - id: ACT-REQ-003
    artifact: req
    operation: append
    target: REQ-0108
    source_items: [AG-008]
    content: |
      REQ-0108（docs-check / Validation / Tests）へ次を APPEND する:
      - REQ 健全性診断は行数・関心数に加え、次を検出すること: ステークホルダーが特定できない要件、内部成果物だけを主語とする要件、パス・フィールド・enum・閾値・内部アルゴリズムを主題とする要件、作業履歴または是正結果を主題とする要件、要件行を持たない現行 REQ。
      - SPEC 健全性診断は行数・status・配置に加え、次を検出すること: 主論理区分が不明な SPEC、正規所有対象が不明な SPEC、同一関心の所有権重複、論理区分の不当な混在、所有先のないパラメータ群、実装計画または作業履歴の混入、REQ との規範重複、accepted SPEC 間の責任分界不一致、実装成果物と SPEC の所有権不一致。

  - id: ACT-REQ-004
    artifact: req
    operation: append
    target: REQ-0119
    source_items: [AG-003]
    content: |
      REQ-0119（コマンド・スキル・サブエージェント責務分界）へ次を APPEND する:
      - REQ-0119-033「責務ごとに正規な定義元を指定する原則」における「責務ごと」の単位は「安定した関心キー」であることを明記する。
      - 1ファイルが複数関心を参照することは許容するが、正規定義だけを単一所有とすること。同一仕様関心について複数 SPEC が正規所有者を主張しないこと。

  - id: ACT-REQ-005
    artifact: req
    operation: append
    target: REQ-0136
    source_items: [AG-004, AG-006, AG-007]
    content: |
      REQ-0136（REQ/SPEC 責務分離の徹底と新ワークフロー）へ次を APPEND する:
      - learning/intake 成果物から後続工程（RU、req-define、spec-save）へ引き継ぐ分類根拠を定義する: 変更の性質、REQ影響の有無、対象ステークホルダー、利用者から見える変更の有無、SPEC論理区分、正規所有対象、追記先を選択した理由、根拠となる観測事実。分類根拠は追加情報とし、欠落時は unknown 相当の推定と警告を許す（後方互換、soft-contract: ADR-0124）。
      - spec-save は対象 SPEC の主論理区分・正規所有対象と保存内容の整合を「配置一貫性検証」として検証する。これは REQ-0136-030「内容品質は req-define QG-1 の責務、spec-save は再検証しない」との整合を保持し、配置一貫性検証を内容品質再査読として実装しない。
      - spec-save の強制ゲート（保存拒否条件: 重複所有、配置不一致）は SPEC 宣言形式の定義完了後に有効化し、宣言未完了の既存 SPEC は警告モードで経過観察する（段階適用: 宣言→警告→強制）。

  - id: ACT-REQ-006
    artifact: req
    operation: append
    target: REQ-0155
    source_items: [AG-002]
    content: |
      REQ-0155（文書粒度モデル）へ次を APPEND する:
      - SPEC 論理区分は5区分（挙動SPEC、カタログSPEC、横断契約SPEC、パラメータSPEC、実装詳細SPEC）とする。パラメータ責務（retry 回数、timeout、閾値、重み、優先順位、上限、下限、fallback、許容範囲等）を実装詳細から区別する。

  - id: ACT-REQ-007
    artifact: req
    operation: append
    target: REQ-0156
    source_items: [AG-003]
    content: |
      REQ-0156（docs/specs 基盤SPECドメイン別体系化）へ次を APPEND する:
      - 各 SPEC は frontmatter または冒頭宣言節で主論理区分（5区分のいずれか）および正規所有対象（対象 command、skill、workflow、品質ルール、整合性ルール等）を識別可能にすること。複数論理区分を含む SPEC は主論理区分と従属する区分を判別できる状態にすること。

  # === ADR 操作（1件）===
  - id: ACT-ADR-001
    artifact: adr
    operation: create
    target: new:req-spec-semantic-classification-and-canonical-ownership
    source_items: [AG-009]
    content: |
      新規 ADR「REQ/SPEC 意味分類と正規所有モデル」を作成する。

      決定事項:
      1. REQ は識別可能なステークホルダーが求める状態、振る舞い、制約、外部契約を記述する文書種別とし、4妥当性基準（要求元ステークホルダー特定、観測可能成果、内部実装非依存、要求文存立）を満たす要件行のみを受け入れる。
      2. SPEC 論理区分を5区分（挙動SPEC、カタログSPEC、横断契約SPEC、パラメータSPEC、実装詳細SPEC）とし、パラメータ責務を実装詳細から区別する。
      3. 正規所有の単位を「安定した関心キー」とする。1ファイルが複数関心を参照することは許容するが、正規定義だけを単一所有とし、同一仕様関心について複数 SPEC が正規所有者を主張しない。
      4. learning/intake 由来変更は変更種別（新規利用者要求/外部契約変更/バリエーション/エッジケース/パラメータ調整/不適合修正/内部再構成/文書訂正）で分類し、REQ 拡張を新規利用者要求・外部契約変更に限定する。分類根拠を後続工程へ伝播する。
      5. req-define は REQ 影響と SPEC 正規所有者を確定し、spec-save は配置一貫性検証（主論理区分・正規所有対象と保存先の整合確認）を実施する。

      関係: ADR-0103（文書種別責務境界）への relates-to、ADR-0123（SPEC lifecycle と spec-save の導入）への relates-to、ADR-0107（コマンド・スキル・テンプレート・スクリプト責任分界）への relates-to。
      ADR-0103/0123/0107 の意味を変更せず、新規概念（5分類、パラメータ責務、関心キー所有、分類根拠伝播）を追加する。

      根拠: document-model.md L226「accepted ADR の意味変更を禁止、変更時は新規 ADR」、REQ-0119-033「適用条件の精緻化のため新規 ADR は作成しない」の先例。

  # === SPEC 操作（12件）===
  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-update
    target: docs/specs/foundations/document-model.md
    target_area: "## SPEC 論理区分"
    source_items: [AG-002, AG-003]
    content: |
      document-model.md「SPEC 論理区分」節を5区分（挙動SPEC、カタログSPEC、横断契約SPEC、パラメータSPEC、実装詳細SPEC）へ拡張する。
      パラメータSPEC を新設し、retry 回数、timeout、閾値、重み、優先順位、上限、下限、fallback、許容範囲等のパラメータ責務を実装詳細SPEC から区別する。
      各 SPEC は frontmatter または冒頭宣言節で主論理区分（5区分のいずれか）と正規所有対象（関心キー、所有責務）を識別可能にする要件を追加する。
      主論理区分・正規所有対象の宣言形式（frontmatter schema、または冒頭宣言節フォーマット）は SPEC 詳細として本ファイルまたは artifact-contracts.md で定義する。

  - id: ACT-SPEC-002
    artifact: spec
    operation: spec-update
    target: docs/specs/responsibilities/document-type-responsibilities.md
    target_area: "## REQ/SPEC 記述基準"
    source_items: [AG-001, AG-004]
    content: |
      document-type-responsibilities.md「REQ/SPEC 記述基準」節へ次を追記する:
      - REQ 記述はステークホルダー視点と4妥当性基準（要求元ステークホルダー特定、観測可能成果、内部実装非依存、要求文存立）に従うこと。
      - learning/intake 由来変更の変更種別分類（新規利用者要求/外部契約変更/バリエーション/エッジケース/パラメータ調整/不適合修正/内部再構成/文書訂正）と、REQ 拡張条件（新規利用者要求または外部契約変更のみ）を明記する。
      - 分類根拠（変更の性質、REQ影響、対象ステークホルダー、利用者可視変更、SPEC論理区分、正規所有対象、追記先選択理由、観測根拠）の引き継ぎ要件を追記する。

  - id: ACT-SPEC-003
    artifact: spec
    operation: spec-update
    target: docs/specs/responsibilities/artifact-responsibilities.md
    target_area: "## 正規所有者台帳"
    source_items: [AG-003]
    content: |
      artifact-responsibilities.md「正規所有者台帳」節へ次を追記する:
      - 正規所有の単位は「安定した関心キー」であることを明示する（REQ-0119-033「責務ごと」の延長）。
      - 関心キーの定義、命名規則、安定性基準（最も安定した最小の定義元の選定規則）を整備する。
      - 同一関心キーに対する複数所有宣言を重複として検出するための機械判定可能な形式を規定する。

  - id: ACT-SPEC-004
    artifact: spec
    operation: spec-update
    target: docs/specs/responsibilities/artifact-contracts.md
    target_area: "## 分類根拠伝播契約"
    source_items: [AG-004]
    content: |
      artifact-contracts.md へ「分類根拠伝播契約」節を新設する（または既存節を拡張）。
      - learning/intake → RU → req-define → spec-save の各工程間で引き継ぐ分類根拠フィールドを定義する: 変更の性質、REQ影響の有無、対象ステークホルダー、利用者から見える変更の有無、SPEC論理区分、正規所有対象、追記先を選択した理由、根拠となる観測事実。
      - 分類根拠は soft-contract（ADR-0124）として追加情報扱いとし、欠落時は unknown 既定値で警告する後方互換運用を規定する。
      - 具体的なフィールド名、enum 表現、シリアライズ形式は本 SPEC で定義する（req_draft 本体には確定事項として混入させない）。

  - id: ACT-SPEC-005
    artifact: spec
    operation: spec-update
    target: docs/specs/quality/req-health-metrics.md
    target_area: "## REQ 横断診断"
    source_items: [AG-008]
    content: |
      req-health-metrics.md へ「REQ 横断診断」節を新設または拡張する。
      次の検出パターンを追加する:
      - ステークホルダーが特定できない要件（主語がステークホルダーでなく内部成果物、または要求元が不明）
      - 内部成果物（command、skill、script、ファイル）だけを主語とする要件
      - パス、フィールド、enum、閾値、内部アルゴリズムを主題とする要件（REQ-0101-068 SPEC分離基準違反）
      - 作業履歴または是正結果を主題とする要件
      - 要件行を持たない現行 REQ（要件テーブルが空、または目的・適用範囲のみ）
      各検出パターンに SPLIT シグナル計算への反映基準を併記する。

  - id: ACT-SPEC-006
    artifact: spec
    operation: spec-update
    target: docs/specs/quality/spec-health-metrics.md
    target_area: "## SPEC 横断診断"
    source_items: [AG-008]
    content: |
      spec-health-metrics.md へ「SPEC 横断診断」節を新設または拡張する。
      次の検出パターンを追加する:
      - 主論理区分が不明な SPEC（宣言節不在、または5区分のいずれにも該当しない）
      - 正規所有対象が不明な SPEC（関心キー宣言不在）
      - 同一関心の所有権重複（複数 SPEC が同一関心キーの正規所有を主張）
      - 論理区分の不当な混在（1 SPEC に主従判別不能な複数区分が混在）
      - 所有先のないパラメータ群（パラメータSPEC 正規所有者が不在）
      - 実装計画または作業履歴の混入（SPEC に実装計画、マイルストーン、完了履歴が混入）
      - REQ との規範重複（SPEC 記述が REQ 要件と重複）
      - accepted SPEC 間の責任分界不一致（複数 accepted SPEC 間で所有権が矛盾）
      - 実装成果物と SPEC の所有権不一致（実装側の所有者が SPEC 宣言と不一致）

  - id: ACT-SPEC-007
    artifact: spec
    operation: spec-update
    target: docs/specs/commands/req-define.md
    target_area: "## REQ影響判定とSPEC正規所有者確定"
    source_items: [AG-005]
    content: |
      req-define.md SPEC へ「REQ影響判定とSPEC正規所有者確定」節を新設または拡張する。
      - req-define は backlog-review tentative_classification を暫定入力とし、最終分類を自身で確定することを明文化する。
      - 最終分類確定ステップで判定する項目を列挙する: 新しいステークホルダー要求か、既存REQ が要求を既に保持しているか、利用者から見える外部契約が変わるか、REQ の作成・更新が必要か、SPEC の論理区分、正規所有者、正規追記先。
      - REQ 影響なしと確定した変更からは artifact_actions の artifact: req エントリを生成しないことを明記する。

  - id: ACT-SPEC-008
    artifact: spec
    operation: spec-update
    target: docs/specs/commands/spec-save.md
    target_area: "## 配置一貫性検証"
    source_items: [AG-006, AG-007]
    content: |
      spec-save.md SPEC へ「配置一貫性検証」節を新設または拡張する。
      - 検証項目: 変更の論理区分と対象 SPEC の主論理区分の整合、変更の所有対象と対象 SPEC の正規所有対象の整合、同一関心の別の正規所有 SPEC の不存在、command 固有仕様の不当な横断 SPEC 配置の不存在、パラメータ変更の挙動説明またはカタログへの不当混入の不存在、accepted SPEC 間の責任分界矛盾の不存在。
      - この検証は「配置一貫性検証」であり、「内容品質の再査読」ではない（REQ-0136-030 との整合）。
      - 強制ゲート（保存拒否）の有効化条件: SPEC 宣言形式（主論理区分、正規所有対象）の定義完了後。
      - 段階適用: 宣言形式定義 → 警告モード棚卸し → 重複解消 → 新規/変更 SPEC 強制 → 全件強制。
      - 不一致検出時の処置: 保存せず、分類または追記先の再判定へ戻す。

  - id: ACT-SPEC-009
    artifact: spec
    operation: spec-update
    target: docs/specs/commands/backlog-review.md
    target_area: "## tentative_classification と分類根拠伝播"
    source_items: [AG-004]
    content: |
      backlog-review.md SPEC へ「tentative_classification と分類根拠伝播」節を新設または拡張する。
      - backlog-review が RU へ付与する tentative_classification に加え、分類根拠（変更の性質、REQ影響、対象ステークホルダー、利用者可視変更、SPEC論理区分、正規所有対象、追記先選択理由、観測根拠）を伝播させる。
      - 分類根拠は暫定（tentative）扱いであり、req-define が最終確定することを明記する。
      - 後方互換: 分類根拠が欠落した旧 RU も unknown 既定値で受け入れる。

  - id: ACT-SPEC-010
    artifact: spec
    operation: spec-update
    target: docs/specs/commands/learning-promote.md
    target_area: "## 変更種別分類"
    source_items: [AG-004]
    content: |
      learning-promote.md SPEC へ「変更種別分類」節を新設または拡張する。
      - learning 成果物から RU へ引き継ぐ変更種別（新規利用者要求/外部契約変更/バリエーション/エッジケース/パラメータ調整/不適合修正/内部再構成/文書訂正）を定義する。
      - 各変更種別から REQ 拡張可否への対応表を記載する（新規利用者要求/外部契約変更のみ REQ 拡張候補）。

  - id: ACT-SPEC-011
    artifact: spec
    operation: spec-update
    target: docs/specs/commands/intake-promote.md
    target_area: "## 変更種別分類"
    source_items: [AG-004]
    content: |
      intake-promote.md SPEC へ「変更種別分類」節を新設または拡張する。
      - intake 成果物から RU へ引き継ぐ変更種別（新規利用者要求/外部契約変更/バリエーション/エッジケース/パラメータ調整/不適合修正/内部再構成/文書訂正）を定義する。
      - 各変更種別から REQ 拡張可否への対応表を記載する（learning-promote.md と整合）。

  - id: ACT-SPEC-012
    artifact: spec
    operation: spec-update
    target: docs/specs/responsibilities/responsibility-boundary-purification.md
    target_area: "## 横断的再評価基準"
    source_items: [AG-010]
    content: |
      responsibility-boundary-purification.md へ「横断的再評価基準」節を新設または拡張する。
      - 現行 REQ 全件について、ステークホルダー視点と4妥当性基準に基づく再評価を実施する基準を定める。
      - 現行 SPEC 全件について、主論理区分、正規所有対象、重複責務、不適切な実装計画または履歴記述の評価を実施する基準を定める。
      - 局所的な文言修正ではなく、同型の責任分界違反を全現行 REQ/SPEC へ横断適用するパターンベース是正の指針を規定する。
      - 後方互換: 分類メタデータ欠落時は unknown 既定値で警告し、既存成果物を拒否しない。

# conflict_resolutions: 壁打ちで解消された衝突の記録
conflict_resolutions:
  - id: CR-001
    conflict: "REQ-0103（Artifact責任分界、90行）への APPEND は SPLIT シグナル +2（81行超過）に達し、req-health-metrics SPEC の SPLIT 推奨閾値に合致。新規概念の追加がさらに肥大化を進める。"
    resolution: "REQ-0103 へは APPEND しない。新規概念を既存の正規所有者 REQ へ分配する（アーキテクチャ助言サブエージェント推奨、high 確信度）: 文書統治→REQ-0101、req-define 責務→REQ-0102、検査・診断→REQ-0108、正規所有単位→REQ-0119、req-define/spec-save 接続→REQ-0136、文書粒度→REQ-0155、SPEC 体系化→REQ-0156。"

  - id: CR-002
    conflict: "spec-save の意味的配置検証と REQ-0136-030「内容品質は req-define QG-1 の責務、spec-save は再検証しない」が衝突候試。"
    resolution: "spec-save の検証を「配置一貫性検証（確定済み分類・所有情報と保存先の整合確認）」と定義し、「内容品質の再査読」として実装しない。REQ-0136-030 との整合を保持する（アーキテクチャ助言サブエージェント推奨、high 確信度）。"

  - id: CR-003
    conflict: "正規所有の識別単位（ファイル/セクション/関心キー）が未確定のため、spec-save 強制ゲートの条件を確定できない（ブロッカー）。"
    resolution: "evidence-first 原則により、REQ-0119-033「責務ごとに正規な定義元を指定する原則」と document-model.md「関心対象」「独立関心対象」の用語使用から、正規所有の単位は「安定した関心キー」と確定。1ファイルが複数関心を参照することは許容、正規定義だけを単一所有とする。強制ゲート条件は「同一関心キーに対する複数正規所有宣言の検出」として定義可能。"

  - id: CR-004
    conflict: "新規 ADR を ADR-0103 への relates-to とするか、supersede とするかが未確定（ユーザー確認事項）。"
    resolution: "evidence-first 原則により、document-model.md L226「accepted ADR の意味変更を禁止、変更時は新規 ADR」と REQ-0119-033 自身の先例「適用条件の精緻化のため新規 ADR は作成しない」から、relates-to と確定。ADR-0103 の意味（文書種別責務境界）は維持し、新規概念（5分類、パラメータ責務、関心キー所有）を追加するのみ。"

  - id: CR-005
    conflict: "分類根拠の必須化は既存の採用済み成果物、RU、req_draft を一斉に無効にする後方互換性問題を生む。"
    resolution: "ADR-0124（soft-contract）を維持し、分類根拠を追加情報として導入する。欠落時は unknown 既定値で推定と警告を許す。既存成果物を欠落により拒否しない。厳格なバージョン付きスキーマへは変更しない（アーキテクチャ助言サブエージェント推奨、high 確信度）。"

  - id: CR-006
    conflict: "auto_gate.auto_ready の判定基準の解釈が未確定。Epic 規模（7 OU、20 artifact_actions）を auto_ready:false の理由とする解釈（解釈A: 規模＝停止理由）と、auto_ready を未解決 item（unresolved_*、真の blocker）の有無で判定し Epic 規模自体は停止理由に含めない解釈（解釈B: 真の blocker のみ停止理由）が並立。"
    resolution: "evidence-based で解釈B を採用。draft-data テンプレートコメントは 'auto_ready が false の場合、または未解決 item が残る場合、後続コマンドは停止する' と記載し、unresolved_* フィールドと並列で stop_reasons を扱う。stop_reasons は未解決 item に準ずる停止理由であり、正常な Epic 動作（規模、依存関係、段階的実装計画）は含まない。Step 10-2 壁打ちで合意。当初記載の3件（Epic 規模、OU-007 依存、強制ゲート段階適用）はいずれも正常動作の説明であり真の blocker ではないため削除。auto_ready:true へ更新。"

# operation_units: 複数RU入力時の統合/分離結果。単一REQ操作の場合も1件の OU として出力
operation_units:
  - ou_id: OU-001
    source_ru: RU-20260722-02
    target_req: REQ-0101
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-002
    source_ru: RU-20260722-02
    target_req: REQ-0156
    target_spec: docs/specs/foundations/document-model.md
    operation: append
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    result: {}
  - ou_id: OU-003
    source_ru: RU-20260722-02
    target_req: REQ-0119
    target_spec: docs/specs/responsibilities/artifact-responsibilities.md
    operation: append
    scale: standard
    depends_on: [OU-002]
    recommended_order: 3
    issue_policy: single
    result: {}
  - ou_id: OU-004
    source_ru: RU-20260722-02
    target_req: REQ-0102
    target_spec: docs/specs/commands/req-define.md
    operation: append
    scale: standard
    depends_on: [OU-002, OU-003]
    recommended_order: 4
    issue_policy: single
    result: {}
  - ou_id: OU-005
    source_ru: RU-20260722-02
    target_req: REQ-0136
    target_spec: docs/specs/commands/spec-save.md
    operation: append
    scale: standard
    depends_on: [OU-002, OU-004]
    recommended_order: 5
    issue_policy: single
    result: {}
  - ou_id: OU-006
    source_ru: RU-20260722-02
    target_req: REQ-0108
    target_spec: docs/specs/quality/req-health-metrics.md
    operation: append
    scale: standard
    depends_on: [OU-002, OU-005]
    recommended_order: 6
    issue_policy: single
    result: {}
  - ou_id: OU-007
    source_ru: RU-20260722-02
    target_spec: docs/specs/responsibilities/responsibility-boundary-purification.md
    operation: spec-update
    scale: large
    depends_on: [OU-001, OU-002, OU-003, OU-004, OU-005, OU-006]
    recommended_order: 7
    issue_policy: epic
    result: {}

# 補足: ADR と SPEC-only 操作（artifact_actions に含まれるが operation_units の主対象に含まれないもの）
# - ACT-ADR-001（新規 ADR）: OU-002 と同タイミングで作成、OU-002 の target_req/spec と併存
# - ACT-REQ-006（REQ-0155 APPEND）: OU-002 に含む
# - ACT-SPEC-001（document-model.md）: OU-002 に含む
# - ACT-SPEC-002（document-type-responsibilities.md）: OU-001 または OU-002 に含む
# - ACT-SPEC-003（artifact-responsibilities.md）: OU-003 に含む
# - ACT-SPEC-004（artifact-contracts.md）: OU-003 または OU-004 に含む
# - ACT-SPEC-005（req-health-metrics.md）: OU-006 に含む
# - ACT-SPEC-006（spec-health-metrics.md）: OU-006 に含む
# - ACT-SPEC-007（req-define.md）: OU-004 に含む
# - ACT-SPEC-008（spec-save.md）: OU-005 に含む
# - ACT-SPEC-009（backlog-review.md）: OU-004 または OU-005 に含む
# - ACT-SPEC-010（learning-promote.md）: OU-003 または OU-004 に含む
# - ACT-SPEC-011（intake-promote.md）: OU-003 または OU-004 に含む
# - ACT-SPEC-012（responsibility-boundary-purification.md）: OU-007 に含む

# test_strategy: 各合意項目の検証方法（verification / pass_criteria / on_failure の3要素必須）
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      REQ-0101 を読み、ステークホルダー視点の定義と4妥当性基準（要求元ステークホルダー特定、観測可能成果、内部実装非依存、要求文存立）が新しい要件行として追加されていることを確認する。REQ-0101-067/068/069 が維持されていることも確認する。
    pass_criteria: |
      REQ-0101 に4妥当性基準を明記した要件行が存在し、既存 REQ-0101-067/068/069 が削除されずに残っていること。
    on_failure: |
      fix-and-reverify。要件行が欠落している場合は req-save 工程で追加し、既存行が削除されている場合は git 履歴から復元して再検証する。

  - id: TS-002
    target_item: AG-002
    verification: |
      REQ-0155 と document-model.md を読み、SPEC 論理区分が5区分（挙動/カタログ/横断契約/パラメータ/実装詳細）として定義されていることを確認する。パラメータ責務（retry 回数、timeout、閾値、重み等）が実装詳細から区別されていることを確認する。
    pass_criteria: |
      document-model.md に5区分が明記され、パラメータSPEC が実装詳細SPEC と独立して定義されていること。
    on_failure: |
      fix-and-reverify。区分が4のまま、またはパラメータが実装詳細に包含されている場合は SPEC を修正して再検証する。

  - id: TS-003
    target_item: AG-003
    verification: |
      REQ-0119、REQ-0156、artifact-responsibilities.md を読み、正規所有の単位が「安定した関心キー」と明記されていることを確認する。同一仕様関心への複数正規所有宣言禁止が規定されていることを確認する。
    pass_criteria: |
      REQ-0119-033 または新規要件行で「安定した関心キー」が正規所有単位として明記され、artifact-responsibilities.md に関心キー定義と重複検出形式が記載されていること。
    on_failure: |
      fix-and-reverify。単位が未定義、または重複禁止が未規定の場合は REQ/SPEC を修正して再検証する。

  - id: TS-004
    target_item: AG-004
    verification: |
      artifact-contracts.md、backlog-review.md、learning-promote.md、intake-promote.md を読み、変更種別分類（8種）と分類根拠伝播フィールドが定義されていることを確認する。REQ 拡張条件（新規利用者要求/外部契約変更のみ）が明記されていることを確認する。
    pass_criteria: |
      4 SPEC 全てに変更種別分類と分類根拠伝播が規定され、REQ 拡張条件が明記されていること。
    on_failure: |
      fix-and-reverify。欠落 SPEC がある場合は追加し、REQ 拡張条件が不明な場合は明記して再検証する。

  - id: TS-005
    target_item: AG-005
    verification: |
      REQ-0102 と req-define.md SPEC を読み、req-define が tentative_classification を暫定入力として最終分類を確定する責務を持つことが明記されていることを確認する。REQ 影響なし変更から artifact_actions の artifact: req エントリを生成しないことが規定されていることを確認する。
    pass_criteria: |
      req-define.md SPEC に最終分類確定ステップと判定項目が列挙され、REQ 影響なし時の操作生成禁止が明記されていること。
    on_failure: |
      fix-and-reverify。最終分類確定ステップが未記載、または操作生成禁止が未規定の場合は修正して再検証する。

  - id: TS-006
    target_item: AG-006
    verification: |
      REQ-0136 と spec-save.md SPEC を読み、配置一貫性検証の6項目（論理区分整合、所有対象整合、別所有SPEC不存在、横断SPEC不当配置不存在、パラメータ混入不存在、accepted間矛盾不存在）が規定されていることを確認する。「内容品質の再査読ではない」ことが REQ-0136-030 と整合して明記されていることを確認する。
    pass_criteria: |
      spec-save.md SPEC に6項目の配置一貫性検証が規定され、REQ-0136-030 との整合注記があること。
    on_failure: |
      fix-and-reverify。検証項目が欠落、または REQ-0136-030 との整合が未注記の場合は修正して再検証する。

  - id: TS-007
    target_item: AG-007
    verification: |
      spec-save.md SPEC を読み、強制ゲートの有効化条件（SPEC 宣言形式定義完了後）と段階適用（宣言→警告→強制）が規定されていることを確認する。宣言未完了 SPEC の警告モード取扱いが明記されていることを確認する。
    pass_criteria: |
      spec-save.md SPEC に段階適用5ステップ（宣言形式定義、警告モード棚卸し、重複解消、新規/変更 SPEC 強制、全件強制）が規定されていること。
    on_failure: |
      fix-and-reverify。段階適用が未規定、または警告モード取扱いが不明な場合は修正して再検証する。

  - id: TS-008
    target_item: AG-008
    verification: |
      REQ-0108、req-health-metrics.md、spec-health-metrics.md を読み、REQ 横断診断5パターン（ステークホルダー不在、内部成果物主語、パラメータ主題、作業履歴主題、要件行なしREQ）と SPEC 横断診断9パターン（主論理区分不明、正規所有対象不明、所有権重複、不当混在、所有先なしパラメータ、実装/履歴混入、REQ重複、accepted間不一致、実装-SPEC所有不一致）が規定されていることを確認する。
    pass_criteria: |
      req-health-metrics.md に5パターン、spec-health-metrics.md に9パターンの検出ルールが記載されていること。
    on_failure: |
      fix-and-reverify。検出パターンが欠けている場合は追加して再検証する。

  - id: TS-009
    target_item: AG-009
    verification: |
      docs/adr/ への新規 ADR ファイル作成後、ADR-0103/0123/0107 への relates-to 関係が ADR 本文と docs/adr/README.md Decision Map に記載されていることを確認する。5決定事項（REQ ステークホルダー視点、SPEC 5分類、関心キー所有、変更種別分類、req-define/spec-save 責務）が全て記載されていることを確認する。
    pass_criteria: |
      新規 ADR ファイルが存在し、5決定事項が記載され、3つの relates-to 関係が README Decision Map に反映されていること。
    on_failure: |
      fix-and-reverify。決定事項が欠落、または relates-to が未記載の場合は ADR または README を修正して再検証する。

  - id: TS-010
    target_item: AG-010
    verification: |
      responsibility-boundary-purification.md を読み、横断的再評価基準（REQ は4妥当性基準、SPEC は主論理区分・正規所有対象・重複責務・実装/履歴混入）とパターンベース是正指針が規定されていることを確認する。後方互換（unknown 既定値、警告、既存成果物拒否なし）が明記されていることを確認する。
    pass_criteria: |
      responsibility-boundary-purification.md に横断的再評価基準と後方互換運用が規定されていること。実施は別途 case-open/case-run 工程で行う（本要件 doc は基準定義までを対象とする）。
    on_failure: |
      record-in-findings。本要件 doc は基準定義を対象とし、全件再評価の実施成果は case-run 工程の出力であるため、再評価結果に不備があっても本 draft の不合格とはしない。発見事項は Findings へ out-of-scope として記録する。

# case_open_hints: case-open 構成生成への参考情報
case_open_hints:
  epic_needed: true
  decomposition:
    summary: "7 OU 構成。OU-001〜006 は standard 規模、OU-007 は large 規模（全件再評価）。"
    units:
      - ou_id: OU-001
        target: "REQ-0101 APPEND + document-type-responsibilities.md UPDATE（文書統治・REQ定義）"
      - ou_id: OU-002
        target: "REQ-0156 APPEND + REQ-0155 APPEND + document-model.md UPDATE + 新規ADR create（SPEC 5分類・関心キー所有）"
      - ou_id: OU-003
        target: "REQ-0119 APPEND + artifact-responsibilities.md UPDATE + artifact-contracts.md UPDATE + learning-promote/intake-promote UPDATE（正規所有・分類根拠伝播）"
      - ou_id: OU-004
        target: "REQ-0102 APPEND + req-define.md UPDATE + backlog-review.md UPDATE（req-define 最終分類責務）"
      - ou_id: OU-005
        target: "REQ-0136 APPEND + spec-save.md UPDATE（spec-save 配置一貫性検証・強制ゲート）"
      - ou_id: OU-006
        target: "REQ-0108 APPEND + req-health-metrics.md UPDATE + spec-health-metrics.md UPDATE（REQ/SPEC 横断診断）"
      - ou_id: OU-007
        target: "responsibility-boundary-purification.md UPDATE + 全現行 REQ/SPEC 再評価（large、OU-001〜006 完了後）"
  wave_hints:
    - wave: 1
      units: [OU-001, OU-002]
      rationale: "基盤定義（REQ定義、SPEC 5分類、関心キー所有、新規 ADR）"
    - wave: 2
      units: [OU-003, OU-004]
      rationale: "パイプライン伝播と req-define 責務拡張"
    - wave: 3
      units: [OU-005, OU-006]
      rationale: "spec-save 検証と横断診断"
    - wave: 4
      units: [OU-007]
      rationale: "既存 REQ/SPEC 全件再評価（OU-001〜006 完了後）"
```

# summary

<!-- 人間可読サマリー。処理の原本は上記 # draft-data YAML ブロックである。 -->

RU-20260722-02（REQ/SPEC責任分界とlearning/intake由来変更の適正配置）を単独処理した結果、Epic 規模の要件 doc を生成した。

主な合意内容:
- REQ をステークホルダー視点（4妥当性基準）に限定、SPEC 論理区分を5区分へ拡張（パラメータ責務独立）
- 正規所有の単位は安定した関心キー（REQ-0119-033「責務ごと」の延長）
- learning/intake 由来変更を8種別で分類し、REQ 拡張を新規利用者要求・外部契約変更に限定
- req-define が REQ 影響と SPEC 正規所有者を確定、spec-save が配置一貫性検証を実施
- 強制ゲートは段階適用（宣言→警告→強制）で bootstrap 問題を回避
- 新規 ADR を ADR-0103/0123/0107 への relates-to として作成

要件 doc 構成:
- 10 agreed_items（AG-001〜010）
- 20 artifact_actions（REQ 7、ADR 1、SPEC 12）
- 5 conflict_resolutions（CR-001〜005、全て evidence-first 原則またはアーキテクチャ助言サブエージェント推奨に基づき解消）
- 7 operation_units（OU-001〜007、4 Wave 構成）
- 10 test_strategy（TS-001〜010）
- case_open_hints: epic_needed=true、4 Wave

agentdev_handoff: true（AgentDevFlow 本体・配布物の改善）。
次コマンド: `/agentdev/req-save`（feature のため）。
