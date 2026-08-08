---
draft_type: req_draft
topic_slug: adversarial-review-migration
status: saved
created_at: 2026-08-09T00:00:00+09:00
source_rus:
  - RU-0001
agentdev_handoff: true
---

<!-- req_draft テンプレート
  このテンプレートは req-define が生成する構造化引き継ぎ成果物の原本である。
  後続工程（req-save/ spec-save/ case-open/ case-auto/ case-run/ case-close）が参照する
  原本の情報源は # draft-data 内の YAML コードブロックであり、人間可読 Markdown セクションではない。
  soft contract（生成元側標準）であり、LLM 推論経由で消費される。
  厳格なスキーマバージョン、JSON Schema、バリデータは導入しない。
  agentdev_handoff: true は RU-0001 由来の履歴メタデータ。self-hosting repo では通常の req/case workflow 入力として扱う（upstream-handoff.md 行9, 21）。 -->

# draft-data

```yaml
# work_type: feature（既存 agentdev-deep-review スキルの大幅再構成と新機能追加）
work_type: feature

# scale: large（影響ファイル11件 > 10、変更件数30件超のシグナル）
scale: large

# summary: 当該 draft が何を合意したかの1段落要約
summary: |
  現行 agentdev-deep-review を agentdev-adversarial-review へ完全移行する。
  固定5観点レビューを廃止し、評価前に対象依存の動的レビュー戦略を構成するモデルを採用する。
  Reviewer は対象案を正しいと仮定せず反証を試み、Reviewee はレビュー結果を正しいと仮定せず反証する対称的相互反証モデルへ移行する。
  レビュー戦略自体を相互反証対象とし、合意候補形成後に再検証（convergence audit）を必須化する。
  対象範囲を要件、設計、規格・仕様、計画、実装の5領域へ拡張する。
  REQ-003-030〜035 を UPDATE し、新規 036〜040 を APPEND する。
  docs/specs/skills/agentdev-deep-review.md を status: superseded（superseded_by で後継を明示）へ更新し、docs/specs/skills/agentdev-adversarial-review.md を現行正規 SPEC として新規作成する。
  ADR は作成しない。動的戦略、対称的相互反証、戦略メタ反証、合意候補再検証は agentdev-adversarial-review Skill の振る舞い・レビュー手続き・責務構造であり、REQ-003 と Skill SPEC が正規所有する。

# auto_gate: case-auto 自走可否の判定材料
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons:
    - "ユーザー判断で ADR-008 不作成を確定（動的戦略・対称反証・戦略メタ反証は Skill 振る舞い・レビュー手続きであり、REQ-003 と agentdev-adversarial-review SPEC が正規所有）"
    - "ユーザー判断で旧 SPEC（agentdev-deep-review.md）の superseded 残置を確定（document-model のライフサイクル accepted/統合/supersede/retire 遵守、物理削除はライフサイクルに含まれない、同じ関心を新 SPEC が引き継ぐため supersede が意味的に正しい）"
    - "ユーザー判断で REQ-003 APPEND/UPDATE を確定。RU 箇条書きの機械的 REQ 行変換を避け、利用者安定要求のみ REQ へ。役割・状態遷移・戦略詳細・finding 統合アルゴリズム・workflow フェーズは SPEC へ配置"

# agreed_items: 合意された個別項目
agreed_items:
  - id: AG-001
    content: |
      現行 agentdev-deep-review を agentdev-adversarial-review へ完全移行する。
      旧名の互換 alias、並存 Skill、互換目的残置を行わない。
      日本語名称は「対論型レビュー」とする。
      「旧名を残さない」の対象は現行識別子、実行入口、alias、active 索引、有効参照である。履歴証拠（旧 SPEC の superseded 文書、git 履歴、tag、過去版スナップショット）まで消去する意味ではない。
      完全移行には配布 Skill ディレクトリの改名、self-hosting extension の改名、docs/specs/README.md のエントリ更新、間接参照ファイル群の同期を含む。

  - id: AG-002
    content: |
      固定5観点レビューを廃止し、評価前に対象、目的、制約、技術領域、想定失敗条件に応じた動的レビュー戦略を構成するモデルを採用する。
      レビュー戦略の構成要素（何を疑うか、どの立場から評価するか、どの既存知見・方法論を使うか、何を証拠とするか、どの意味単位へ分解して検証するか）、審議中の戦略更新手続き、戦略の品質基準は agentdev-adversarial-review SPEC が所有する。

  - id: AG-003
    content: |
      Reviewer は対象案が正しいという前提を置かず、未発見の破綻条件、欠落、矛盾、不成立な前提、問題のある設計判断、実装方針、トレードオフを探索し反証を試みる。
      Reviewee は Reviewer の finding を未検証の主張として扱い、根拠、前提、対象理解、適用範囲、影響、方法論を反証する。
      Reviewer と Reviewee の双方が自身の以前の主張を撤回、限定、修正でき、一方に恒常的な正解権限を与えない。
      Orchestrator、Reviewer、Reviewee の3論理役割の詳細振る舞い、finding と rebuttal の形式、Reviewer の再評価プロトコルは agentdev-adversarial-review SPEC が所有する。論理役割は物理エージェント構成を固定しない（ADR-001 整合）。

  - id: AG-004
    content: |
      finding は単なる懸念や指摘ではなく、判定、根拠、前提、適用条件を伴う。
      問題が確認された結果だけでなく、限定条件下のみ成立、検証の結果成立しなかった、証拠不足で判定不能、十分な反証を試みても問題を確認できなかった、を正規結果として扱う。
      問題を発見すること自体をレビューの成功条件としない。
      finding と正規結果の形式、判定基準、証拠要件は SPEC が所有する。

  - id: AG-005
    content: |
      合意は形式的全会一致、多数決、Reviewer と Reviewee が同じ文言を返した状態ではなく、本質的争点について相互反証が行われ、利用可能な証拠から維持すべき本質的反論が残らない状態として判断する。
      合意結果は、元案維持、修正、部分修正、finding 撤回、適用範囲限定、代替案採用のいずれも許容する。中間案への機械的妥協を要求しない。
      合意候補を形成しただけでは完了とせず、Reviewer と Reviewee が合意候補とその成立根拠を再度対論的に検証する。
      合意候補の再検証で新しい本質的争点が見つかった場合、その争点について対論を再開する。
      解決済み争点は、新しい証拠、新しい前提、異なる具体的破綻条件、未評価の適用範囲が示されない限り再開しない。
      合意候補の管理、争点状態遷移、convergence audit の手続き詳細は SPEC が所有する。

  - id: AG-006
    content: |
      標準対象を要件、設計、規格・仕様、計画、実装の5領域とする。
      通常のコードレビュー、テスト、機械的検査、QG-1〜QG-4、inspect 系診断の代替とはしない。
      固定5観点を別の固定観点集合へ置換すること、固定された標準レビュー観点セットの新設を行わない。

  - id: AG-007
    content: |
      Reviewer と Reviewee は双方とも、必要に応じて複数のサブエージェントを利用できる。
      小規模対象では物理的な複数サブエージェントを必須としない。
      複数サブエージェントの結果は多数決しない。同一 finding の報告数を証拠の強さとして扱わず、重複統合、共通原因抽出、根拠・前提確認を行い、本質的争点へ正規化する。
      サブエージェント利用プロトコル、並列化アルゴリズム、重複統合アルゴリズム、意味的分解単位、物理エージェント数・並列数・timeout・最大ラウンド数は SPEC と実装詳細へ委譲する（ADR-001 整合）。

  - id: AG-008
    content: |
      関連コンテキストと取得可能な証拠から判断可能な限り自律審議を続け、意見不一致だけを理由にユーザーへ返さない。
      技術的に決着できない優先判断、ユーザー固有の目的・価値判断、両立不能要求、必要情報不足等、自律解決できない争点のみをユーザーへ返す。
      ユーザー回答後は影響を受ける争点から審議を再開し、必要な再検証を行う。

  - id: AG-009
    content: |
      レビュー対象を、元案、レビュー戦略、finding、rebuttal、合意候補等の意味的な対象として管理する。
      共通の challenge / counter-challenge プロトコルによる状態遷移として扱い、「レビューのレビューのレビュー」という無制限の役割再帰ではなく、共通プロトコルで処理する。
      意味的型の定義、状態遷移（strategy → challenge → counter-challenge → convergence → convergence audit）の詳細、プロトコル契約は SPEC が所有する。

  - id: AG-010
    content: |
      agentdev-adversarial-review 自身による対象ファイル変更、レビュー結果のファイル保存、commit、push、merge、Issue と PR の作成・更新・コメント、レビュー結果の自動適用、ユーザー承認代行を行わない。
      レビュー結果の適用・保存・後続工程への引き渡しは本 Skill の責務とせず、レビュー完了後のユーザー責務とする。
      レビュー結果保存用の新しい正規成果物種別を導入しない。
      レビュー終了後、レビュー結果の対象への反映、ファイル保存等を必要に応じて追加指示できることをユーザーへ明示的に促す。ただしその促し自体を理由に Skill が後続操作を実行しない。

  - id: AG-011
    content: |
      OpenAI/Codex adversarial-review 等、実装方針、設計判断、トレードオフ、前提を challenge する既存のレビュー知見を、観点、問い、failure mode、検証方法を構成する知識源として活用する。
      外部知見を権威として自動採用せず、対象への適合性を評価する。
      実行時の外部サービス・外部リポジトリへの必須依存にせず、必要な知見を ADF 側の配布可能なレビュー知識として保持する。

  - id: AG-012
    content: |
      物理的なエージェント数、並列数、DAG 構造、モデル選択、timeout、最大ラウンド数、物理的状態保存形式を仕様で固定せず、SPEC と実装詳細へ委譲する。
      論理的役割を Orchestrator、Reviewer、Reviewee の3役とする。

  - id: AG-013
    content: |
      REQ-003 へ今回の利用者要求を APPEND および UPDATE する。
      REQ-003-030〜035 を UPDATE し、対称的相互反証、合意候補再検証、Deep Review から対論型レビューへの名称変更、完了時追加指示促しを反映する。ただし振る舞い詳細（役割の内部処理、状態遷移、戦略構成要素、finding 形式、合意候補管理）は REQ に混入させず SPEC へ配置する。
      REQ-003-036〜040 を新規 APPEND し、対象5領域、動的レビュー戦略、戦略メタ反証、問題未確認を正規結果とする契約、完了時出力契約を追加する。
      RU 箇条書きを1対1で REQ 行へ変換せず、利用者から見た安定要求を必要十分にまとめる。REQ-003 の要件行数は 35 から 40 へ増加する。同一関心（委譲時の判断・承認・副作用境界の発展）であり、関心分類数、成果物種別数、SPEC 分離違反を合わせた SPLIT シグナルは合計 0、SPLIT 不要。

  - id: AG-014
    content: |
      docs/specs/skills/agentdev-deep-review.md（現行 draft SPEC）を status: superseded へ更新し、superseded_by で docs/specs/skills/agentdev-adversarial-review.md を後継として明示する。旧 SPEC は履歴文書として残置し、現行実行経路、alias、active 索引、有効参照からは完全に除去する。
      docs/specs/skills/agentdev-adversarial-review.md を現行正規 SPEC として新規作成し、3論理役割、レビュー対象の意味的型、strategy → challenge → counter-challenge → convergence → convergence audit の振る舞い、finding と rebuttal の統合、サブエージェント委譲、完了条件、出力契約、read-only 境界を正規所有する。
      docs/specs/README.md の旧エントリを status: superseded へ更新し、新規エントリを追加する。
      document-model SPEC は draft SPEC を放置せず accepted、統合、supersede、retire のいずれかへ確定することを定める。物理削除はこのライフサイクルに含まれない。同じ関心を新 SPEC が引き継ぐため supersede が意味的に正しい。リポジトリには local/artifact-graph.md（ADR-007 で superseded）の実例がある。

  - id: AG-015
    content: |
      src/opencode/skills/agentdev-deep-review/ ディレクトリを agentdev-adversarial-review/ へ改名する。
      SKILL.md を新名称・新プロトコルへ全面書き換えする。
      references/deep-review-protocol.md を references/adversarial-review-protocol.md へ改名し、3論理役割、動的戦略構成、対称的反証、戦略メタ反証、合意候補再検証、サブエージェント利用、重複統合の詳細プロトコルへ全面書き換えする。
      .agentdev/extensions/skills/agentdev-deep-review.yaml を agentdev-adversarial-review.yaml へ改名する。

  - id: AG-016
    content: |
      docs/specs/README.md、docs/specs/skills/agentdev-artifact-graph.md（177行）、docs/specs/quality/spec-health-metrics.md（123行）、docs/specs/local/references/artifact-graph-effect-evaluation.md（38,44行）、docs/specs/local/artifact-graph.md（30,159行・superseded）の agentdev-deep-review 参照を agentdev-adversarial-review へ同期する。

# artifact_actions: REQ/SPEC への保存対象を単一の配列に統合（ADR は含まない）
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: REQ-003
    target_area: 要件
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007, AG-008, AG-009, AG-010, AG-013]
    content: |
      # REQ-003-030 UPDATE
      委譲されたレビュー結果（finding）を自動的に採用せず、Reviewee が根拠、前提、対象範囲、影響を反証する契約を維持すること。

      # REQ-003-031 UPDATE
      Reviewer が対象案を正しいと仮定せず反証を試み、Reviewee がレビュー結果を正しいと仮定せず反証する往復契約を維持すること。Reviewer と Reviewee の双方が自身の主張を撤回、限定、修正でき、一方に恒常的な正解権限を与えないこと。

      # REQ-003-032 UPDATE
      関連コンテキストと取得可能な証拠から判断可能な限り自律審議を継続し、意見不一致だけを理由にユーザー確認へ進まないこと。

      # REQ-003-033 UPDATE
      技術的に決着できない優先判断、ユーザー固有の目的・価値判断、両立不能要求、必要情報不足等、エージェント間で自律解決できない争点のみをユーザーへ返し、回答後に審議状態を引き継いで影響を受ける争点から議論を再開すること。

      # REQ-003-034 UPDATE
      合意が形式的全会一致、多数決ではなく、本質的争点について Reviewer と Reviewee の相互反証を経て閉じること。合意候補を形成しただけでは完了とせず、合意候補とその成立根拠を再度対論的に検証すること。

      # REQ-003-035 UPDATE
      明示呼び出しによる任意のレビュー手段（対論型レビュー）がユーザー承認、および commit、push、merge、ファイル保存、Issue と PR の作成・更新・コメント、レビュー結果の自動適用の副作用権限を代行しないこと。完了時に、結果の反映、ファイル保存等を必要に応じて追加指示できることをユーザーへ明示的に促すこと。ただし、その促し自体を理由に Skill が後続操作を実行しないこと。

      # REQ-003-036 APPEND
      対論型レビューの標準対象を要件、設計、規格・仕様、計画、実装の5領域とすること。通常のコードレビュー、テスト、機械的検査、QG-1〜QG-4、inspect 系診断の代替としないこと。

      # REQ-003-037 APPEND
      評価前に対象、目的、制約、技術領域、想定失敗条件に応じた動的レビュー戦略を構成すること。固定された観点集合の全項目実行をレビュー成立条件、完了条件としないこと。

      # REQ-003-038 APPEND
      レビュー戦略自体を相互反証の対象とし、Reviewer と Reviewee が戦略の不足、過剰、誤適用、前提不成立を指摘し、審議中に観点、立場、方法論を再構成できること。

      # REQ-003-039 APPEND
      問題発見を成功条件とせず、問題確認、限定条件下のみ成立、検証の結果成立せず、証拠不足で判定不能、十分な反証を試みても問題を確認できなかった、のいずれも正規結果として扱えること。

      # REQ-003-040 APPEND
      完了出力から、合意済み最終案または方針、採用した主要 finding と根拠、撤回または棄却した主要 finding と理由、限定 finding と適用範囲、主要なレビュー戦略と方法論、残留リスク、前提、不確実性、未解決事項を確認できること。

  - id: ACT-SPEC-001
    artifact: spec
    operation: create
    target_spec:
      operation: create
      domain: skills
      slug: agentdev-adversarial-review
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007, AG-008, AG-009, AG-010, AG-011, AG-012]
    content: |
      ---
      title: agentdev-adversarial-review SPEC
      status: draft
      spec_logical_division: behavior
      canonical_owner: agentdev-adversarial-review
      created: 2026-08-09
      updated: 2026-08-09
      ---

      # agentdev-adversarial-review SPEC

      本 SPEC は docs/specs/skills/agentdev-deep-review.md（旧 SPEC）の後継である。旧 SPEC は superseded として履歴保持し、本 SPEC が対論型レビューの振る舞い契約、レビュー手続き、責務構造を正規所有する。

      ## 対象
      - 要件、設計、規格・仕様、計画、実装を標準対象とする。
      - 完成済み文書に限定せず、ドラフト、構造化提案、検討中の選択肢を含む。

      ## 発動契約
      - ユーザーまたは呼び出し元が明示的に選択する任意のレビュー手段とする。
      - すべての要件定義や計画作成で自動発動する強制工程ではない。
      - QG-1〜QG-4 を代替する品質ゲートではない。
      - ユーザー承認を代行する承認ゲートではない。
      - 実装開始または変更反映を停止する統制ゲートではない。

      ## 論理的役割
      審議は Orchestrator、Reviewer、Reviewee の3論理役割で構成する。論理役割は物理エージェント構成を固定しない。

      - Orchestrator: 審議全体の進行、状態管理、合意候補管理、完了判断を担う。ただし Orchestrator 自身は本質的争点の正解を判断せず、Reviewer と Reviewee の相互反証が収束する状態を確認する。
      - Reviewer: 対象案を正しいと仮定せず、未発見の破綻条件、欠落、矛盾、不成立な前提、問題のある設計判断、実装方針、トレードオフを探索し反証を試みる。
      - Reviewee: Reviewer の finding を未検証の主張として扱い、根拠、前提、対象理解、適用範囲、影響、方法論を反証する。

      Reviewer と Reviewee の双方が自身の以前の主張を撤回、限定、修正できる。一方に恒常的な正解権限を与えない。

      ## レビュー対象の意味的型
      審議は次の意味的な対象を共通の challenge / counter-challenge プロトコルで扱う。「レビューのレビューのレビュー」という無制限の役割再帰ではなく、共通プロトコルで状態遷移として処理する。

      - 元案: レビュー対象の原本、ドラフト、構造化提案、選択肢。
      - レビュー戦略: 何を疑うか、どの立場から評価するか、どの既存知見・方法論を使うか、何を証拠とするか、どの意味単位へ分解して検証するかを要素とする。
      - finding: Reviewer が提示する判定、根拠、前提、適用範囲、適用条件を伴う主張。
      - rebuttal: Reviewee が finding に対して提示する反証。
      - 合意候補: 本質的争点について相互反証が行われた暫定結果。

      ## 動的レビュー戦略
      評価前に対象、目的、制約、技術領域、想定失敗条件に応じたレビュー戦略を構成する。固定された観点集合の全項目実行をレビュー成立条件、完了条件としない。

      レビュー戦略の構成要素:
      - 何を疑うか
      - どの立場から評価するか
      - どの既存知見・方法論を使うか
      - 何を証拠とするか
      - どの意味単位へ分解して検証するか

      レビュー戦略自体も未検証の判断として扱い、Reviewer と Reviewee が不足、過剰、誤適用、前提不成立を指摘できる。審議中に新しい証拠や争点が生じた場合、観点、立場、方法論を追加、削除、再構成できる。

      OpenAI/Codex adversarial-review 等の外部知見を観点、問い、failure mode、検証方法を構成する知識源として活用する。外部知見を権威として自動採用せず、対象への適合性を評価する。実行時の外部サービス・外部リポジトリへの必須依存にせず、必要な知見を ADF 側の配布可能なレビュー知識として保持する。

      ## 振る舞いプロトコル
      審議は strategy → challenge → counter-challenge → convergence → convergence audit の状態遷移で進行する。

      ### strategy 段階
      Orchestrator が対象、目的、制約、技術領域、想定失敗条件を整理し、初期レビュー戦略を構成する。Reviewer と Reviewee は戦略の不足、過剰、誤適用、前提不成立を指摘し、戦略を修正できる。

      ### challenge 段階
      Reviewer が対象案を正しいと仮定せず、未発見の破綻条件、欠落、矛盾、不成立な前提、問題のある設計判断、実装方針、トレードオフを探索する。finding は判定、根拠、前提、適用範囲、適用条件を伴う。単なる懸念や指摘を finding としない。

      ### counter-challenge 段階
      Reviewee が finding を未検証の主張として扱い、根拠、前提、対象理解、適用範囲、影響、方法論を反証する。Reviewer は反論を再評価し、自身の finding を撤回、維持、限定、修正、部分合意、解決不能のいずれかを判断する。

      ### convergence 段階
      本質的争点について相互反証が行われ、利用可能な証拠から維持すべき本質的反論が残らない状態に至った争点を合意候補として形成する。合意は形式的全会一致、多数決、Reviewer と Reviewee が同じ文言を返した状態ではなく、本質的争点の収束として判断する。合意結果は元案維持、修正、部分修正、finding 撤回、適用範囲限定、代替案採用のいずれも許容する。中間案への機械的妥協を要求しない。

      ### convergence audit 段階
      Reviewer と Reviewee が合意候補とその成立根拠を再度対論的に検証する。合意候補を形成しただけでは完了としない。再検証で新しい本質的争点が見つかった場合、当該争点について対論を再開する。

      ## 争点状態
      争点は次の状態を持つ。状態遷移の物理的保存形式、スキーマは本 SPEC の所有対象外とし、配布スキル実装へ委譲する。

      - 起原型: 未検証の反証候補、初期 finding。
      - 審議中: Reviewer と Reviewee が反証と再評価を往復している状態。
      - 合意候補: 相互反証が一時的に収束した暫定状態。convergence audit 待ち。
      - 撤回: 提起者が反証を取り下げた状態。
      - 限定合意: 適用範囲を限定した上で合意した状態。
      - ユーザー質問中: 自律解決不能でユーザーへエスカレーションした状態。
      - 完了: convergence audit を経て最終的に閉じた状態。

      重複する反証は同一争点へ統合する。解決済み争点は、新しい証拠、新しい前提、異なる具体的破綻条件、未評価の適用範囲が示されない限り再開しない。

      ## 本質的争点と非本質的批判の判定
      具体的破綻、実害を示せない指摘、目的、制約、対象範囲と無関係な改善、好み、理想論のみの指摘、過剰要求、スコープ外、解決済みの再提出、表現変更のみの同一批判、反証条件を持たない抽象的懸念、継続目的化した指摘は、原則として本質的争点としない。Reviewee が一方的に本質的でないと確定せず、反論と Reviewer の再検討を経て争点を閉じる。

      ## finding と正規結果
      finding は単なる懸念や指摘ではなく、判定、根拠、前提、適用条件を伴う。次のいずれも正規結果として扱う。

      - 問題が確認された。
      - 限定条件下のみ成立する。
      - 検証の結果成立しなかった。
      - 証拠不足で判定不能。
      - 十分な反証を試みても問題を確認できなかった。

      問題を発見すること自体をレビューの成功条件としない。

      ## 自律審議とユーザー質問
      関連コンテキストと取得可能な証拠から判断可能な限り自律審議を継続する。意見不一致だけを理由にユーザーへ返さない。

      審議の継続時、未解決争点を閉じるために次の手続きを試行する。
      1. 前提確認: 反証の前提、対象案の前提、審議の暗黙前提を照合し、前提の相違を特定する。
      2. 根拠確認: 反証の根拠、対象案の根拠、関連コンテキストの証拠を照合し、根拠の不足または誤読を特定する。
      3. 誤解解消: Reviewer と Reviewee の表現、意図、対象範囲の誤解を対話により解消する。
      4. 適用範囲の限定: 反証の適用範囲を対象全体から部分へ限定し、限定的な妥当性を確認する。
      5. 部分合意の探索: 反証のうち妥当な部分と妥当でない部分を分離し、妥当な部分について部分合意を形成する。
      6. 代替案の比較: 複数の解決案を比較し、目的、制約、対象範囲への整合で優位な案を特定する。
      7. 追加証拠による再評価: 関連コンテキストから追加証拠を取り出し、争点を再評価する。
      8. 反証内容の再構成: 反証を本来の対象、目的、破綻条件へ再構成し、本質的争点と非本質的批判を分離する。

      技術的に決着できない優先判断、ユーザー固有の目的・価値判断、両立不能要求、必要情報不足等、自律解決できない争点のみをユーザーへ返す。ユーザー回答後は影響を受ける争点から審議を再開し、必要な再検証を行う。

      ## サブエージェント利用と重複統合
      Reviewer と Reviewee は双方とも、必要に応じて複数のサブエージェントを利用できる。大規模対象では観点、コンポーネント、failure mode、仮説、証拠源等の意味的に独立した単位へ分解し、ワークフロー化、並列化できる。小規模対象では物理的な複数サブエージェントを必須としない。

      複数サブエージェントの結果は多数決しない。同一 finding の報告数を証拠の強さとして扱わず、重複統合、共通原因抽出、根拠・前提確認を行い、本質的争点へ正規化する。

      物理的なエージェント数、並列数、DAG 構造、モデル選択、timeout、最大ラウンド数、物理的状態保存形式は本 SPEC の所有対象外とし、配布スキル実装へ委譲する。

      ## 完了条件
      審議全体の完了は、形式的全会一致や固定観点全 PASS ではなく、次の本質的合意条件で判断する。
      1. 本質的争点がすべて閉じていること。
      2. 妥当と合意した finding が元案へ反映されていること。
      3. 撤回または棄却された finding が元案へ混入していないこと。
      4. 部分 finding の採用範囲と非採用範囲が明確であること。
      5. ユーザー判断事項が残っていないこと。
      6. 合意候補の再検証が完了していること。
      7. 再検証後に新たな本質的争点が残っていないこと。
      8. 対論を継続すること自体を目的とした議論だけが残っていないこと。

      ## 出力契約
      完了時には次を確認可能な形で返す。
      - 合意済み最終案または方針。
      - 採用した主要 finding と根拠。
      - 撤回・棄却した主要 finding と理由。
      - 限定 finding と適用範囲。
      - 主要なレビュー戦略と方法論。
      - 残留リスク、前提、不確実性。
      - 未解決事項。

      レビュー終了後、レビュー結果の対象への反映、ファイル保存等を必要に応じて追加指示できることをユーザーへ明示的に促す。ただしその促し自体を理由に Skill が後続操作を実行しない。

      ## 副作用境界
      agentdev-adversarial-review 自身による対象ファイル変更、レビュー結果のファイル保存、commit、push、merge、Issue と PR の作成・更新・コメント、レビュー結果の自動適用、ユーザー承認代行を行わない。レビュー結果保存用の新しい正規成果物種別を導入しない。

      ## QG、通常レビュー、診断との責務分界
      - QG-1〜QG-4 を代替しない。
      - 通常のコードレビュー、テスト、機械的検査を代替しない。
      - inspect-docs、inspect-skills の診断を代替しない。
      - すべての要件作成工程、計画作成工程への強制適用を行わない。

  - id: ACT-SPEC-002
    artifact: spec
    operation: update
    target: docs/specs/skills/agentdev-deep-review.md
    target_area: frontmatter
    source_items: [AG-001, AG-014]
    content: |
      # frontmatter 更新
      status: draft → superseded
      superseded_by: agentdev-adversarial-review.md
      updated: 2026-08-09

      # 備考
      旧 SPEC は agentdev-adversarial-review SPEC へ後継移行した。本ファイルは履歴文書として残置し、docs-check、inspect-docs の通常内容検査対象外とする。現行実行経路、alias、active 索引、有効参照はすべて agentdev-adversarial-review へ同期済み。

# conflict_resolutions: 壁打ちで解消された衝突の記録
conflict_resolutions:
  - id: CR-001
    conflict: |
      現行 docs/specs/skills/agentdev-deep-review.md「既存スキル更新境界」節は「既存 agentdev-deep-review を同名のまま置換的に再構成する。別名称新設、並存、互換目的残置を要件としない」と定める。一方 RU-0001 は agentdev-deep-review を agentdev-adversarial-review へ完全移行し旧名を残さないことを要求する。両立不能。
    resolution: |
      RU-0001 を優先し、完全改名移行を採用する。旧 SPEC は物理削除せず status: superseded（superseded_by で後継を明示）へ更新し履歴文書として残置する。ユーザー判断により、document-model SPEC が draft SPEC を accepted、統合、supersede、retire のいずれかへ確定することを定め、物理削除はライフサイクルに含まれないことを根拠とする。同じ関心を新 SPEC が引き継ぐため supersede が意味的に正しい。リポジトリには local/artifact-graph.md（ADR-007 で superseded）の実例がある。「旧名を残さない」の対象は現行識別子、実行入口、alias、active 索引、有効参照であり、履歴証拠の消去を意味しない。RU-0001 は 2026-08-08 の session 合意であり、現行 SPEC の「同名維持」方針より新しい合意として優先する。

  - id: CR-002
    conflict: |
      ADR 作成の要否。agentdev-adr-guidelines の False Negative 防止基準は「将来の設計、運用、文書システムを制約する決定を含む場合は例外として ADR を認める」と定める。一方で「ADR 作成可否条件」が False Negative 防止基準より優先され、workflow 定義、運用ルール、既存 REQ/SPEC の適用範囲に収まるものは ADR ではなく REQ/SPEC で扱う。今回の動的戦略、対称的相互反証、戦略メタ反証、convergence audit、Orchestrator 争点管理がシステム横断アーキテクチャ決定か、単一 Skill の振る舞い・手続きかが争点。
    resolution: |
      ADR は作成しない。ユーザー判断により、今回の決定事項は agentdev-adversarial-review という単一 Skill の振る舞い、レビュー手続き、責務構造であり、新しいシステム横断アーキテクチャの導入ではない。ADR-001 はモデル選定、サブエージェント階層、コードレビューエージェントの種類・構成等を ADF core が固定しないとし、今回の「Orchestrator、Reviewer、Reviewee は論理役割であり物理エージェント構成を固定しない」と整合する。ADR-001 決定4は新規 ADR 追加を抑制する。REQ-003 と agentdev-adversarial-review SPEC が正規所有する。「将来見直す際の判断根拠が SPEC に埋没する」懸念は新規 ADR 作成の理由としない。REQ で「何を実現したいか」、SPEC で「対論型レビューとしてどの振る舞いを持つか」が自足していれば十分と判断した。

# operation_units: 単一REQ操作 + 2 SPEC 操作を1 OU として出力
operation_units:
  - ou_id: OU-001
    source_ru: RU-0001
    target_req: REQ-003
    target_spec:
      operation: create
      domain: skills
      slug: agentdev-adversarial-review
    operation: append
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_req_docs:
        - docs/requirements/REQ-003.md
      ou_operation_to_req_doc:
        ACT-REQ-001: docs/requirements/REQ-003.md
      source_ru_to_ou_operation:
        RU-0001: ACT-REQ-001
      case_open_consumable:
        req_id: REQ-003
        operations:
          - act_id: ACT-REQ-001
            kind: update
            target: REQ-003
            update_rows: [REQ-003-030, REQ-003-031, REQ-003-032, REQ-003-033, REQ-003-034, REQ-003-035]
            append_rows: [REQ-003-036, REQ-003-037, REQ-003-038, REQ-003-039, REQ-003-040]
            line_count_before: 35
            line_count_after: 40
        adr_created: false
        spec_actions_deferred:
          - ACT-SPEC-001
          - ACT-SPEC-002
        next_command_hint: /agentdev/spec-save

# test_strategy: 各合意項目の検証方法。3要素（verification / pass_criteria / on_failure）を必須
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      リポジトリの現行実行経路から agentdev-deep-review、deep-review、Deep Review の有効な参照を検索する。検索対象は src/opencode/、.agentdev/extensions/、docs/specs/README.md、docs/requirements/、docs/guides/。配布 Skill ディレクトリが agentdev-adversarial-review/ へ改名されていることを確認する。.agentdev/extensions/skills/agentdev-deep-review.yaml が存在せず、agentdev-adversarial-review.yaml が存在することを確認する。docs/specs/README.md の skill SPEC 一覧が agentdev-adversarial-review 行を現行として持ち、agentdev-deep-review 行を superseded として持つことを確認する。docs/specs/skills/agentdev-deep-review.md の frontmatter が status: superseded、superseded_by: agentdev-adversarial-review.md であることを確認する。
    pass_criteria: |
      現行実行経路上の標準 Skill、配布 Skill ディレクトリ、self-hosting extension、docs/specs/README.md の現行索引・有効参照が agentdev-adversarial-review へ同期されていること。agentdev-deep-review の互換 Skill、alias、並存エントリが現行経路に残っていないこと。旧 SPEC（agentdev-deep-review.md）が superseded として残置され、後継 SPEC が明示されていること。履歴参照目的の旧名称言及（旧 SPEC の superseded 文書、tag、過去版スナップショット）は許容されること。
    on_failure: |
      fix-and-reverify。旧名称の現行参照が残存する場合は当該ファイルを修正し再検証する。ただし旧 SPEC の superseded 文書、tag v2.11.0 等の過去版参照、git 履歴は修正対象外（RU-0001 作業仮定「過去の履歴、削除済み成果物、スナップショット等は現行参照整合性のために必要な場合を除き名称変更だけを目的として書き換えない」に従う）。

  - id: TS-002
    target_item: AG-013
    verification: |
      REQ-003 と docs/specs/skills/agentdev-adversarial-review.md を比較する。REQ-003-030〜040 が状態要件・外部契約（振る舞い、制約、状態、安全境界、対象範囲）に限定されていることを確認する。SPEC が振る舞い詳細、3論理役割の詳細振る舞い、状態遷移、finding と rebuttal の形式、合意候補管理、finding 統合アルゴリズム、サブエージェント委譲プロトコル詳細、出力フォーマットを所有していることを確認する。REQ 要件行に SPEC 分離基準違反（schema field、enum 値一覧、route、fixture detail、checker 個別ルール、Step 番号、Phase 番号、内部アルゴリズム、作業履歴）が残留していないことを確認する。
    pass_criteria: |
      REQ-003 と agentdev-adversarial-review SPEC の間で、利用者要求と成果物振る舞い・実行プロトコルが適切に分離されていること。REQ 要件行に SPEC 分離基準違反残留がないこと。安定契約例外（公開コマンド名、公開入口、安全境界等）は REQ に要約として残っていること。レビュー戦略の構成要素、意味的型の定義、Orchestrator 内部処理、finding 統合アルゴリズム、workflow フェーズは SPEC が所有していること。
    on_failure: |
      fix-and-reverify。REQ 要件行に SPEC 分離基準違反が残留する場合は当該行を SPEC 候補へ移送し再検証する。

  - id: TS-003
    target_item: AG-002
    verification: |
      docs/specs/skills/agentdev-adversarial-review.md、src/opencode/skills/agentdev-adversarial-review/SKILL.md、src/opencode/skills/agentdev-adversarial-review/references/adversarial-review-protocol.md を確認する。固定5観点の全項目実行、固定観点全 PASS がレビュー成立条件、完了条件として記述されていないことを確認する。「固定五レーン検査モデル」「全 PASS 完了条件」「finding から直接 DELTA」「局所最小 DELTA 優先」等の旧契約が残っていないことを確認する。
    pass_criteria: |
      SPEC、SKILL、references のいずれにも固定観点全実行が成立条件、完了条件として記述されていないこと。固定された標準レビュー観点セットの新設が行われていないこと。評価前に対象依存のレビュー戦略を構成する契約が存在すること。
    on_failure: |
      fix-and-reverify。旧固定観点契約の残留があれば除去し、動的戦略契約を補強して再検証する。

  - id: TS-004
    target_item: AG-002
    verification: |
      対象種別が異なる複数ケース（例: 要件案、設計案、規格案、計画案、実装案）でレビュー戦略構成を試行する。各ケースで戦略が対象、目的、制約、技術領域、想定失敗条件に応じて異なる観点、立場、方法論を選択できることを確認する。
    pass_criteria: |
      異なる対象種別でレビューを実行したとき、対象に応じて異なるレビュー戦略を構成できること。戦略構成要素（何を疑うか、どの立場から評価するか、どの既存知見を使うか、何を証拠とするか、どの意味単位へ分解するか）が対象ごとに変化すること。
    on_failure: |
      fix-and-reverify。戦略が対象に依存せず固定化される場合は、戦略構成ロジックを見直し再検証する。

  - id: TS-005
    target_item: AG-002
    verification: |
      意図的に不足または過剰なレビュー戦略を与えたケースで審議を実行する。Reviewer と Reviewee が戦略の不足、過剰、誤適用、前提不成立を指摘し、戦略を修正できることを確認する。
    pass_criteria: |
      意図的に不足・過剰な戦略を与えたとき、Reviewer または Reviewee が戦略自体の問題を指摘し修正できること。戦略が審議中に更新されること。
    on_failure: |
      fix-and-reverify。戦略のメタ反証が機能しない場合は、戦略検証プロトコルを補強し再検証する。

  - id: TS-006
    target_item: AG-003
    verification: |
      意図的に誤った finding（根拠不十分、前提誤り、適用範囲不当等）を与えたケースで審議を実行する。Reviewee が根拠付きで finding を棄却または限定できることを確認する。Reviewer が妥当な反論を受けて finding を撤回、限定、修正できることを確認する。
    pass_criteria: |
      誤った finding を含むケースで Reviewee が根拠付きで棄却または限定できること。妥当な反論を返したとき Reviewer が finding を撤回、限定、修正できること。一方が恒常的な正解権限を持たないこと。
    on_failure: |
      fix-and-reverify。対称的反証が機能しない場合は、Reviewer と Reviewee の相互反証プロトコルを見直し再検証する。

  - id: TS-007
    target_item: AG-004
    verification: |
      明確な破綻を確認できない対象で審議を実行する。Reviewer が finding を捏造せず、「十分な反証を試みても問題を確認できなかった」「証拠不足で判定不能」等の正規結果を返せることを確認する。
    pass_criteria: |
      明確な破綻を確認できない対象で、finding を捏造せず問題未確認、判定不能等の正規結果を返せること。問題発見を成功条件として扱っていないこと。
    on_failure: |
      fix-and-reverify。問題未確認結果が正規結果として扱われない場合は、完了条件と成功条件の定義を見直し再検証する。

  - id: TS-008
    target_item: AG-005
    verification: |
      合意候補へ新しい欠陥を混入させた検証ケースで審議を実行する。convergence audit 段階で欠陥を検出し、当該争点へ対論を戻せることを確認する。
    pass_criteria: |
      合意候補に新たな欠陥を含め、convergence audit で検出して審議へ戻れること。合意候補形成だけで完了と判定しないこと。
    on_failure: |
      fix-and-reverify。合意候補再検証が機能しない場合は、convergence audit プロトコルを見直し再検証する。

  - id: TS-009
    target_item: AG-007
    verification: |
      複数サブエージェントから同一 finding が返るケースで審議を実行する。報告数で重み付けせず、同一争点へ統合できることを確認する。
    pass_criteria: |
      複数サブエージェントから同一 finding が返るケースで、報告数を証拠強度として扱わず同一争点へ統合できること。多数決を行わないこと。
    on_failure: |
      fix-and-reverify。重複統合が機能しない場合は、finding 統合アルゴリズムを見直し再検証する。

  - id: TS-010
    target_item: AG-008
    verification: |
      エージェント間で反論可能な争点を与えたケースで審議を実行する。ユーザーへ即時返却せず、自律的に再検討して解決を試みることを確認する。
    pass_criteria: |
      関連コンテキストと利用可能な証拠から解決できる争点を、意見不一致だけを理由にユーザーへ返さず、自律解決を試みること。
    on_failure: |
      fix-and-reverify。自律審議継続が機能しない場合は、自律審議プロトコルを見直し再検証する。

  - id: TS-011
    target_item: AG-008
    verification: |
      技術的に決着できない価値判断を含む争点を与えたケースで審議を実行する。合意済み範囲と未解決争点を分離して返すことを確認する。
    pass_criteria: |
      技術的に決着できない価値判断を残し、合意済み範囲と未解決争点を分離して返すこと。ユーザー回答後に影響を受ける争点から審議を再開できること。
    on_failure: |
      fix-and-reverify。ユーザー判断委譲が適切に機能しない場合は、ユーザー質問契約を見直し再検証する。

  - id: TS-012
    target_item: AG-010
    verification: |
      審議実行前後で対象成果物、Git 状態、Issue と PR の状態を比較する。審議の過程でファイル保存、commit、push、merge、Issue と PR の作成・更新・コメントが発生していないことを確認する。
    pass_criteria: |
      審議実行前後で対象成果物、Git 状態、Issue と PR 状態に Skill 起因の副作用がないこと。
    on_failure: |
      fix-and-reverify。副作用が検出された場合は、副作用境界プロトコルを見直し再検証する。

  - id: TS-013
    target_item: AG-011
    verification: |
      外部参考知見（OpenAI/Codex adversarial-review 等）へアクセスできない環境で ADF 内レビュー知識のみを用いて標準レビューを実行できることを確認する。ADF 配布物内に観点、問い、failure mode、検証方法を構成するレビュー知識が保持されていることを確認する。
    pass_criteria: |
      外部参考知見へアクセスできない環境でも ADF 内レビュー知識で標準レビューを実行できること。実行時の外部サービス・外部リポジトリへの必須依存がないこと。
    on_failure: |
      fix-and-reverify。外部依存が残る場合は、当該知見を ADF 内レビュー知識へ内部化し再検証する。

# review_dispositions: 採否判断の記録
review_dispositions:
  - id: RD-001
    source_ru: RU-0001
    source_item: RU-0001-目的
    disposition: covered
    reason_code: adopted_in_agreed_items
    reason: |
      RU-0001 の目的（現行 deep-review の基本構造を維持しつつ固定観点を廃止し対論型レビューへ再構成）は AG-001, AG-002, AG-003 へ反映した。
    evidence:
      path: .agentdev/drafts/req-draft-adversarial-review-migration.md
      section: agreed_items.AG-001
      checked_at_commit: null
    related_removed_items: []

  - id: RD-002
    source_ru: RU-0001
    source_item: RU-0001-対象
    disposition: covered
    reason_code: adopted_in_agreed_items
    reason: |
      RU-0001 の対象（5領域、3論理役割、動的戦略、対称的反証、合意候補再検証等）は AG-002 〜 AG-012 へ反映した。
    evidence:
      path: .agentdev/drafts/req-draft-adversarial-review-migration.md
      section: agreed_items
      checked_at_commit: null
    related_removed_items: []

  - id: RD-003
    source_ru: RU-0001
    source_item: RU-0001-対象外
    disposition: covered
    reason_code: adopted_in_agreed_items
    reason: |
      RU-0001 の対象外（通常コードレビュー、テスト、QG、inspect 診断の代替、固定観点集合の置換、alias 並存維持等）は AG-001, AG-006, AG-010 へ反映した。
    evidence:
      path: .agentdev/drafts/req-draft-adversarial-review-migration.md
      section: agreed_items.AG-006
      checked_at_commit: null
    related_removed_items: []

  - id: RD-004
    source_ru: RU-0001
    source_item: RU-0001-決定的受け入れ条件
    disposition: covered
    reason_code: adopted_in_test_strategy
    reason: |
      RU-0001 の決定的受け入れ条件25項目は test_strategy TS-001 〜 TS-013 へ検証項目として展開した。REQ 要件行と SPEC 振る舞い契約へ状態要件として配分した。
    evidence:
      path: .agentdev/drafts/req-draft-adversarial-review-migration.md
      section: test_strategy
      checked_at_commit: null
    related_removed_items: []

  - id: RD-005
    source_ru: RU-0001
    source_item: RU-0001-正規所有者とアンカー
    disposition: covered
    reason_code: adopted_in_artifact_actions
    reason: |
      RU-0001 が示した正規所有者（REQ-003、agentdev-adversarial-review SPEC、配布 Skill、extension、索引）は artifact_actions の ACT-REQ-001、ACT-SPEC-001、ACT-SPEC-002、agreed_items AG-013〜AG-016 へ反映した。
    evidence:
      path: .agentdev/drafts/req-draft-adversarial-review-migration.md
      section: artifact_actions
      checked_at_commit: null
    related_removed_items: []

  - id: RD-006
    source_ru: RU-0001
    source_item: RU-0001-要件化の方向
    disposition: covered
    reason_code: adopted_in_agreed_items
    reason: |
      RU-0001 の要件化の方向8項目（REQ-003 APPEND/UPDATE、SPEC 置換的再構成、Skill と protocol 同期、固定観点廃止、外部知見内部化、extension と参照の同期、alias 残さず、物理構成は SPEC 委譲）は AG-001, AG-011, AG-012, AG-013, AG-014, AG-015, AG-016 へ反映した。RU-0001 行138「現行 agentdev-deep-review SPEC を agentdev-adversarial-review SPEC として置換的に再構成」は、旧 SPEC の superseded 残置へ読み替えた（物理削除ではなくライフサイクル上の後継移行）。
    evidence:
      path: .agentdev/drafts/req-draft-adversarial-review-migration.md
      section: agreed_items
      checked_at_commit: null
    related_removed_items: []

# case_open_hints: case-open 構成生成への参考情報
case_open_hints:
  epic_needed: false
  decomposition: |
    scale: large だが RU-0001 は単一トピック（adversarial-review 完全移行）で、作業は論理変更（REQ-003 APPEND/UPDATE、agentdev-adversarial-review SPEC 新規作成、旧 SPEC superseded 化）と物理改名（Skill ディレクトリ、SKILL.md、references、extension、specs/README.md、間接参照4ファイル）へ大別できる。ADR は作成しない。case-open が execution_unit 構成と Issue 階層を決定する。
  wave_hints:
    - "Wave 1 候補: 論理変更作業（REQ-003 への APPEND/UPDATE、agentdev-adversarial-review SPEC 新規作成、旧 SPEC の superseded 化）。req-save、spec-save が実施"
    - "Wave 2 候補: 物理改名作業（src/opencode/skills/agentdev-deep-review/ から agentdev-adversarial-review/ のディレクトリ改名、SKILL.md 全面書き換え、references/adversarial-review-protocol.md 新規作成、extension 改名、docs/specs/README.md エントリ更新）。case-run が実施"
    - "Wave 3 候補: 間接参照同期（docs/specs/skills/agentdev-artifact-graph.md、docs/specs/quality/spec-health-metrics.md、docs/specs/local/references/artifact-graph-effect-evaluation.md、docs/specs/local/artifact-graph.md の agentdev-deep-review 参照を agentdev-adversarial-review へ更新）。case-run が実施。Wave 2 完了後が安全"
```

# summary

<!-- 人間可読サマリー。後続工程の原本としては扱われない。 -->

本 draft は RU-0001（session 由来、agentdev_handoff: true）に基づき、現行 `agentdev-deep-review` を `agentdev-adversarial-review` へ完全移行する要件を構造化した。

主要合意内容:
- **振る舞いモデル**: 固定5観点を廃止し動的レビュー戦略を採用。Reviewer/Reviewee の対称的相互反証。戦略自体を反証対象化。合意候補再検証の必須化。対象範囲を要件/設計/規格・仕様/計画/実装の5領域へ拡張。
- **REQ 構成**: REQ-003-030〜035 の UPDATE + 036〜040 の APPEND（5行追加、35→40行）。利用者安定要求のみ REQ へ。役割・状態遷移・戦略詳細・finding 統合アルゴリズム・workflow フェーズは SPEC へ配置。同一関心、SPEC 分離徹底、SPLIT 不要。
- **SPEC**: docs/specs/skills/agentdev-adversarial-review.md を現行正規 SPEC として新規作成。docs/specs/skills/agentdev-deep-review.md は status: superseded（superseded_by で後継明示）へ更新し履歴文書として残置。
- **ADR**: 作成しない。動的戦略・対称反証・戦略メタ反証は agentdev-adversarial-review Skill の振る舞い・レビュー手続き・責務構造であり、REQ-003 と Skill SPEC が正規所有。
- **配布物**: Skill ディレクトリ、SKILL.md、references、self-hosting extension、specs/README.md、間接参照4ファイルを同期。

ユーザー判断確定事項（Step 11 へ提示済、追加の未決事項なし）:
1. ADR-008 不作成。動的戦略・対称反証は Skill 振る舞い・手続きであり、REQ-003 と agentdev-adversarial-review SPEC が正規所有。ADR False Negative 防止基準を理由に新規 ADR へ昇格させない。
2. 旧 agentdev-deep-review SPEC は物理削除せず superseded として履歴保持。新 agentdev-adversarial-review SPEC を現行正規 SPEC とし、旧名は実行入口、alias、active 索引、有効参照から完全に除去。
3. REQ-003 APPEND/UPDATE で進める。新規 REQ は作成しない。RU 箇条書きを機械的に REQ 行へ展開せず、利用者要求だけを REQ へ置き、役割・状態遷移・レビュー戦略・finding 統合等の詳細は SPEC へ配置。

scale: large（影響ファイル11件 > 10、変更件数30件超のシグナル）。Wave 構成は case-open が決定する。

検討経緯、不採用方針:
- 「ADR-008 作成」は不採用。agentdev-advisory は ADR 作成推奨（False Negative 防止基準）としたが、ユーザー判断により「動的戦略・対称反証は Skill 振る舞い・手続き」を根拠に ADR 不作成とした。ADR 作成可否条件が False Negative 防止基準より優先される。
- 「旧 SPEC 物理削除（案A）」は不採用。document-model SPEC が draft SPEC のライフサイクル（accepted/統合/supersede/retire）を定め、物理削除は含まれない。同じ関心を新 SPEC が引き継ぐため supersede が意味的に正しい。
- 「新規 REQ（REQ-014 等）独立」は不採用。REQ-003-030〜035 と同一責務境界であり、MERGE 観点で逆戻りリスクを避けた。
- 「RU 箇条書きを1対1で REQ 行へ展開」は不採用。利用者安定要求のみ REQ へ凝縮し、振る舞い詳細は SPEC へ分離した。
