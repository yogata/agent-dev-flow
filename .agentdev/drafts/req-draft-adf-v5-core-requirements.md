---
draft_type: req_draft
topic_slug: adf-v5-core-requirements
status: draft
created_at: 2026-10-09T12:55:00+09:00
source_rus:
  - adf-v5-ru-revised-01-core-process-model
  - adf-v5-ru-revised-02-artifact-design-finalization
  - adf-v5-ru-revised-03-change-impact-incremental-update
  - adf-v5-ru-revised-04-traceability-quality-verification
  - adf-v5-ru-revised-05-workflow-responsibility-reorganization
  - adf-v5-ru-revised-06-v5-migration-compatibility
---

# draft-data

```yaml
work_type: feature

scale: large

summary: >
  ADF v5.0.0 の世代交代要件として、6 RU の入力プールを一括して要件化した。
  共通責務（要件定義・設計・実装・構築・各段階の検証）を必須基準とし詳細工程を
  参照モデル化する基本責務モデル、設計責務と独立 Design 文書の分離を含む成果物の
  意味と工程別正式確定、依拠版比較に基づく差分・変更影響と増分更新、隣接工程間対応と
  構造/意味分離による工程間追跡と品質検証の責務分離、有限実行とワークフロー責務再編、
  v5 移行と互換性の境界の6領域を新規 REQ 6 件（REQ-104〜109、採番は case-ready が確定）で
  所有する。あわせて v4 との直接衝突行 12 行を行 ID 不変で再定義し、Decision 4 件
  （DEC-053〜056、採番は case-ready が確定）を新設して DEC-033/034/037 を部分置換する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      ADF v5 の基本責務とプロジェクト別工程構成（RU01、チャット合意 2026-10-08/09 案A）。
      ADF の共通責務は要件定義、設計、実装・構築、および各段階の検証とし、全プロジェクトに
      適用される必須基準として正規所有する。基本設計・詳細設計・環境定義・PD 等の詳細工程は
      任意の参照モデルであり、実際に採用する詳細工程、工程間関係、必須成果物は各プロジェクトの
      方針に従い決定され、重複した定義を増やさない。プロジェクトが詳細工程と必須成果物を採用した
      場合、ADF はそれらを対象作業の基準として参照して解決・保持できる。採用されていない参照例の
      工程・成果物を欠落として誤判定せず、採用済みで必須の成果物が存在しない場合はファイル不在だけを
      根拠に工程省略として合格させない。工程を分割・統合・省略しても、元の要求・制約・受け入れ条件・
      必要な検証義務が失われない。同じ共通責務モデルで単独工程の実施と一気通貫の実施の双方を扱え、
      工程進捗の恒久管理を ADF の共通中核の必須要件としない。工程構成の説明（プロセスモデル）と
      対象システムの設計内容（システムモデル）を混同しない。
  - id: AG-002
    content: |
      成果物の意味と設計の正式確定（RU02、チャット合意 2026-10-08/09 案A）。
      要求は満たすべき条件、Decision は重要判断と理由、設計は実現方式、実装は実体、検証は方法と
      証拠をそれぞれ所有し、各工程の成果物が自らの意味を所有する。設計責務の成立を独立 Design 文書の
      有無から切り離し、設計内容と根拠はプロジェクトが認める適切な成果物（コード、設定、構成ファイル、
      Design 文書等）から確認できればよい。独立 Design 文書を一律必須としない一方、プロジェクトが
      独立設計書を必須成果物として採用した場合はその欠落を見逃さない。コードや設定の存在、
      対応宣言の存在だけを根拠に設計の妥当性を合格としない。同じ設定・構成ファイルが設計と実装の
      双方の役割を担う場合、役割ごとの別ファイルを必須とせず必要な検証を行える。各工程の成果物は、
      当該工程の要求充足・上流整合・必要な検証の成立をもって後続工程を待たずに正式確定でき、
      正式確定と最終的な要求充足は別判定とする。プロジェクトの採用規約が明示的に解決されるまでの
      移行期は、当該プロジェクトの現に実効している工程・成果物の運用を採用済み規約として扱う。
  - id: AG-003
    content: |
      差分・変更影響と増分更新（RU03、チャット合意 2026-10-08）。下流成果物が依拠した上流と現在の
      上流を影響評価に必要な精度で比較可能にする。Git・正規成果物・既存証拠からの再構成を優先し、
      個別の管理情報を一律に要求しない。差分抽出は機械処理を基本とし、意味判断は必要な場面に限定する。
      工程開始時点のコミットやファイルの正味差分だけを旧版扱いせず、比較基準が不明なら十分な整合確認で
      補完するか判断を保留する。明示対応だけに依存せず正規成果物・実体参照を調べて影響候補の漏れを
      減らし、既存の対応関係が空でも無影響の証明と扱わない。影響候補ごとに更新・作成・更新不要・未確認を
      根拠とともく区別する。変更の起点は中間工程で更新不要でも後続に引き継ぎ、変更値が元に戻って正味差分が
      ゼロでも中間版に依拠する下流成果物への影響を無条件に除外しない。未変更部分と再利用する検証証拠は
      新しい上流への整合を確認せずに合格とせず、十分な証拠なく変更反映完了と宣言しない。個別工程の
      正式確定と、影響する必要な全工程への変更反映完了を別に判定できる。新規作成では存在しない
      旧下流成果物との比較を要求しない。
  - id: AG-004
    content: |
      工程間追跡と品質検証の責務分離（RU04、チャット合意 2026-10-08）。実際に採用した隣接工程間の
      成果物・追跡単位を明示的に関連付け、上流下流を双方向に追えるようにする。存在しない詳細工程への
      対応を強制せず、すべての成果物に要件との重複した直接対応を必須としない。正規成果物を宣言済み関係と
      独立に確認（棚卸し）し、宣言外や欠落の候補を発見候補として抽出する。参照先不存在や対応欠落等の
      構造的不整合を検出でき、関係の存在だけで意味品質を合格にしない。構造検査（関係の存在・参照整合）と
      意味的品質検証（要求内容の充足）を別の責務とし、トレーサビリティ機構に別の恒久的な意味品質検証
      ゲートを設けない。見出しや説明節が存在するだけで孤立設計事項として一律不合格としない。追跡関係の
      粒度（グループ化）によって個別受け入れ条件の検証義務を消さない。各工程が上流との内容整合と自工程での
      妥当性を確認し、最終受入は現在有効な条件から必要な検証を独立に評価する。実装上の局所試験の合格だけでは
      対象の受け入れ条件に関する最終的な実証が不足する場合に完了と判定しない。変更前の証拠を再利用する場合、
      その証拠が現在の対象・版・条件に適用可能か確認する。
  - id: AG-005
    content: |
      有限実行と既存ワークフローの責務再編（RU05、チャット合意 2026-10-08/09）。有限作業の実行範囲・
      入力・権限・検証条件をその作業中に確認できるようにする。要件確定、設計確定、実装・構築、検証、
      Issue 協調、後処理の責務を分ける。小規模案件では必要な処理を連続実行し、常に Epic や Issue の
      生成を必須としない。段階案件では工程単独で確定・終了できる。追跡・委譲・分割・再開等の価値がある
      有限作業では Issue を利用し、実行境界が要求・設計の正規情報を再所有しない。後工程で上流の問題が
      判明した場合、上流の無断書換えではなく正規改訂と影響再評価へ接続する。中断した有限作業の再開を
      会話内の一時記憶だけに依存せず、既存の正規入力と必要な実行情報から確認できる。意味的依存が未充足の
      後続作業を、先行作業の停止だけを理由に開始しない。Wave を意味的な依存関係のまとまりとして扱い、
      並列実行の共有上限を Wave や親子 Issue の個数から独立した実行制御として扱う。最終的な要求充足の根拠が
      不十分な場合、PR のマージや Issue の終了だけで完了と宣言しない。外部副作用は成果物の作成と区別し、
      確認済みの権限・安全条件を満たす範囲に限定する。Intake・Learning・Backlog を継続的な発見・改善と
      要件化への接続能力として維持し、発見・学習情報を必要な評価と承認を経て要件候補へ接続して要件化・実行・
      検証へ渡せ、実行から生じた新たな改善情報も同じ循環へ戻せる。旧公開コマンド名や旧内部状態の維持を
      合否条件としない。v5 の実行モデルの実現確定までの間、現行の実行契約が実行経路の正として維持される。
  - id: AG-006
    content: |
      v5 移行と互換性の境界（RU06、チャット合意 2026-10-08/09）。v4 互換性（旧コマンド API・状態名・
      配置パスの維持）を v5 の機能要件としない。既存コマンドや内部状態の変更・廃止だけを理由に v5 の
      要件不適合と判定しない。既存の有効な正規情報（要件、受け入れ条件、重要判断、現在の設計）について、
      移行先で元の意味と必要な理由・参照関係を確認でき、実装成果物と検証手段・証拠について移行によって
      必要な対応関係が失われていないか確認できる。移行元情報を破壊せず、移行が失敗・中断した後も移行元の
      確定情報を読み出して移行前の内容と照合できる。移行結果に欠落・不整合・検証不能がある場合は移行成功と
      して確定せず、検証に不足がある場合も移行成功を宣言しない。自動化の範囲や旧互換層は必要性に応じて
      検討し一律必須とせず、人手介入を含む移行方法であっても必要な意味保存と検証が成立すれば要件に適合し得る。
      移行前に未処理として存在する Intake・Learning・Backlog の各情報について、移行後に内容、処理状態、
      必要な参照関係を確認でき、未処理状態から適切な後続処理を継続できる。未処理情報に移行時の欠落・
      参照不整合・処理状態不明がある場合は対象と理由を検証結果から特定でき、破棄済み・処理済みとして
      黙認せず、移行完了と判定しない。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: create
    target: new:adf-v5-core-process-model
    source_items: [AG-001]
    content: |
      ---
      id: REQ-104
      title: "ADF v5 基盤要件（共通責務とプロジェクト別工程構成）"
      created: "2026-10-09"
      updated: "2026-10-09"
      ---

      ## 目的

      ADF v5 の共通責務を要件定義・設計・実装・構築と各段階の検証として所有し、詳細工程を参照モデルとして
      プロジェクト方針による採用に委ねる。小規模開発と段階開発の双方を、不要な成果物や恒久的な工程進捗
      管理の強制なしで成立させる。

      ## 要件

      | ID | 要件 |
      |---|---|
      | REQ-104-001 | ADF の共通責務は要件定義、設計、実装・構築、および各段階の検証とし、全プロジェクトに適用される必須基準として正規所有されること |
      | REQ-104-002 | 基本設計、詳細設計、環境定義等の詳細工程は任意の参照モデルであり、ADF が全プロジェクトに必須工程として強制しないこと |
      | REQ-104-003 | プロジェクトが詳細工程と必須成果物を採用した場合、ADF は採用済みの工程、工程間関係、必須成果物を対象作業の基準として参照して解決・保持できること |
      | REQ-104-004 | 採用されていない参照例の工程・成果物を欠落として誤判定せず、採用済みで必須の成果物が存在しない場合はファイル不在だけを根拠に工程省略として合格させないこと |
      | REQ-104-005 | 工程の分割・統合・省略に際して、元の要求、制約、受け入れ条件、必要な検証義務が失われないこと |
      | REQ-104-006 | 共通責務モデルは単独工程の実施と一気通貫の実施の双方を扱えること。工程進捗の恒久管理を ADF の共通中核の必須要件としないこと |
      | REQ-104-007 | 工程構成の説明（プロセスモデル）と対象システムの設計内容（システムモデル）を別の関心として区別し、混同しないこと |

      ## 適用範囲

      - **対象**: 共通責務の必須基準化、詳細工程の参照モデル化と採用、採用済み工程・成果物の解決と保持、単独実行と一気通貫実行の双方
      - **対象外**: 工程構成の具体的な保存形式・解析方式・設定ファイル名、WBS・工数・要員・予算・進捗率の管理、参照モデルに示す全工程・全成果物の一律必須化
  - id: ACT-REQ-002
    artifact: req
    operation: create
    target: new:adf-v5-artifact-finalization
    source_items: [AG-002]
    content: |
      ---
      id: REQ-105
      title: "ADF v5 成果物の意味と工程別正式確定"
      created: "2026-10-09"
      updated: "2026-10-09"
      ---

      ## 目的

      設計責務の成立を独立 Design 文書の有無から切り放し、プロジェクトが認める適切な成果物に基づく根拠
      確認と、工程ごとの独立した正式確定を成立させる。正式確定と最終的な要求充足を別判定として管理する。

      ## 要件

      | ID | 要件 |
      |---|---|
      | REQ-105-001 | 要求（満たすべき条件）、Decision（重要判断と理由）、設計（実現方式）、実装（実体）、検証（方法と証拠）の意味が区別され、各工程の成果物が自らの意味を所有すること |
      | REQ-105-002 | 設計責務の成立は独立 Design 文書の存在に一律依存しないこと。設計内容と根拠は、プロジェクトの採用した工程・成果物規約が認める適切な成果物から確認できればよいこと |
      | REQ-105-003 | プロジェクトが独立設計書を必須成果物として採用した場合、その欠落を見逃さず検出できること |
      | REQ-105-004 | コードや設定の存在、対応宣言の存在だけを根拠に、設計の妥当性を合格としないこと |
      | REQ-105-005 | 同じ設定・構成ファイルが設計と実装の双方の役割を担う場合、役割ごとの別ファイルを必須とせず、必要な検証を行えること |
      | REQ-105-006 | 各工程の成果物は、当該工程の要求充足、上流整合、必要な検証の成立をもって、後続工程を待たずに正式確定できること |
      | REQ-105-007 | 正式確定と最終的な要求充足は別判定であり、設計成果物の正式確定をもって最終的な要求充足済みと判定しないこと |
      | REQ-105-008 | プロジェクトが v5 の工程・成果物規約の採用宣言を行うまでの間は、当該プロジェクトの現に実効している工程・成果物の運用を採用済み規約として扱うこと |

      ## 適用範囲

      - **対象**: 要求・Decision・設計・実装・検証の意味境界、設計責務の成立条件、プロジェクト採用規約と設計根拠の確認、工程別の正式確定と最終受け入れの区別
      - **対象外**: 設計書のパス・名前・ファイル形式・固定数、状態名・承認画面・公開コマンドの具体的な設計、実装・構築成果物の物理ディレクトリ規則の統一
  - id: ACT-REQ-003
    artifact: req
    operation: create
    target: new:adf-v5-change-impact-incremental-update
    source_items: [AG-003]
    content: |
      ---
      id: REQ-106
      title: "ADF v5 差分・変更影響と増分更新"
      created: "2026-10-09"
      updated: "2026-10-09"
      ---

      ## 目的

      下流成果物が依拠した上流との差分に基づき、必要な変更と確認を選択し、見落としや根拠のない完了報告を
      防ぐ。既存の正規成果物と Git の変更事実からの再構成を優先し、個別の管理情報を一律に要求しない。

      ## 要件

      | ID | 要件 |
      |---|---|
      | REQ-106-001 | 既存の下流成果物が依拠した上流の状態と現在の上流状態を、影響評価に必要な精度で特定・比較できること。工程開始時点のコミットやタグだけを旧版として機械的に仮定しないこと |
      | REQ-106-002 | 既存の下流成果物がない新規作成では、存在しない旧下流成果物との比較を要求せずに形成・検証できること |
      | REQ-106-003 | 比較基準を特定できない場合は、代替整合確認の対象・結果・判断根拠が示されているときだけその確認範囲で判断し、根拠がなければ「影響なし」や「完了」と判定しないこと |
      | REQ-106-004 | Git の変更事実と内容・意味上の変更を区別し、差分抽出は機械処理を基本とし、意味判断は必要な場面に限定すること |
      | REQ-106-005 | 明示対応だけに依存せず、必要に応じて正規成果物・実体参照を調べて影響候補の漏れを減らすこと。既存の対応関係が空でも無影響の証明として扱わないこと |
      | REQ-106-006 | 影響候補ごとに、更新必要、更新不要、作成、未確認の区別とその根拠を確認できること |
      | REQ-106-007 | 変更の起点は、中間工程で更新不要と評価されても後続工程へ引き継がれること。変更値が元に戻り正味差分がゼロの場合でも、中間版に依拠する下流成果物への影響を無条件に除外しないこと |
      | REQ-106-008 | 未変更部分と再利用する検証証拠について、新しい上流への整合を確認せずに合格としないこと。十分な証拠なく変更反映完了と宣言しないこと |
      | REQ-106-009 | 個別工程の正式確定と、影響する必要な全工程への変更反映完了を別に判定できること |

      ## 適用範囲

      - **対象**: 依拠版と現行版の特定・比較、差分候補・影響候補の抽出、増分更新、変更起点の後続伝播、更新と再検証の完了判定
      - **対象外**: 差分分類の列挙値・保存形式・解析器の実装、専用履歴データベース・全成果物単位の版台帳・汎用依存グラフの一律新設、変更発生のたびの全成果物再生成・全リポジトリの全面的意味評価
  - id: ACT-REQ-004
    artifact: req
    operation: create
    target: new:adf-v5-traceability-quality-verification
    source_items: [AG-004]
    content: |
      ---
      id: REQ-107
      title: "ADF v5 工程間追跡と品質検証の責務分離"
      created: "2026-10-09"
      updated: "2026-10-09"
      ---

      ## 目的

      採用した工程の成果物間の追跡可能性と、実際の要求充足を検証する責務を区別して成立させる。
      構造検査と意味的品質検証の責務分離を維持し、追跡粒度が個別の受け入れ条件の検証義務を消さない。

      ## 要件

      | ID | 要件 |
      |---|---|
      | REQ-107-001 | プロジェクトの採用した隣接工程間の成果物・追跡単位を明示的に関連付け、上流と下流を双方向に追跡できること。存在しない詳細工程への対応を強制しないこと |
      | REQ-107-002 | すべての成果物に要件との重複した直接対応を必須とせず、採用された隣接工程間の対応で追跡できること |
      | REQ-107-003 | 正規成果物を宣言済みの対応関係と独立に確認（棚卸し）し、宣言外の実在成果物・追跡候補を発見候補として扱えること |
      | REQ-107-004 | 参照先の不存在、対応の欠落等の構造的不整合を検出でき、関係の存在だけで意味品質を合格にしないこと |
      | REQ-107-005 | 構造検査（関係の存在・参照整合）と意味的品質検証（要求内容の充足）を別の責務とし、トレーサビリティ機構に恒久的な意味品質検証ゲートを追加しないこと。見出しや説明節の存在だけで孤立設計事項として一律に不合格としないこと |
      | REQ-107-006 | 追跡関係の粒度（グループ化）によって、グループ内の個別に有効な要求・受け入れ条件の検証義務を消さないこと |
      | REQ-107-007 | 各工程が上流との内容整合と自工程での妥当性を確認し、最終受入は現在有効な条件から必要な検証を独立に評価すること。実装上の局所試験に合格しても、対象の受け入れ条件に関する最終的な実証が不足する場合は完了と判定しないこと |
      | REQ-107-008 | 変更前の証拠を再利用する場合、その証拠が現在の対象・版・条件に適用可能かを確認すること |

      ## 適用範囲

      - **対象**: 採用された隣接工程間の成果物・追跡単位の対応、双方向追跡、宣言と独立した成果物確認、構造検査、工程ごとの内容品質検証、最終受け入れ検証
      - **対象外**: 対応関係の YAML 等の物理形式、全見出しの機械的 ID 付与、トレーサビリティ専用の意味品質ゲート・完了台帳の追加、宣言・文書のいずれにも存在しない未知要求の完全発見の保証
  - id: ACT-REQ-005
    artifact: req
    operation: create
    target: new:adf-v5-finite-execution
    source_items: [AG-005]
    content: |
      ---
      id: REQ-108
      title: "ADF v5 有限実行とワークフロー責務再編"
      created: "2026-10-09"
      updated: "2026-10-09"
      ---

      ## 目的

      既存の発見・学習・要求化の循環を維持しつつ、工程ごとの成果物確定と有限実行の責務を切り放す。
      小規模の連続実行と段階開発の独立実行の双方を、Issue や恒久状態の強制なしで成立させる。

      ## 要件

      | ID | 要件 |
      |---|---|
      | REQ-108-001 | 有限作業の実行範囲、入力、権限、検証条件を、その作業の実行中に確認できること |
      | REQ-108-002 | 要件確定、設計確定、実装・構築、検証、Issue 協調、後処理の責務を分けること。確定済み要件を入力とする設計形成を、後続の実装や Issue 作成を強制されずに独立終了できること |
      | REQ-108-003 | 小規模案件では必要な処理を連続実行でき、常に Epic や Issue の生成を必須としないこと。段階案件では工程単独で確定・終了できること |
      | REQ-108-004 | 追跡・委譲・分割・再開等の価値がある有限作業では Issue を利用でき、実行境界が要求・設計の正規情報を再所有しないこと |
      | REQ-108-005 | 後工程で上流の問題が判明した場合、上流の無断書換えではなく、正規改訂と影響再評価へ接続すること |
      | REQ-108-006 | 中断した有限作業の再開を、会話内の一時記憶だけに依存せず、既存の正規入力と必要な実行情報から確認できること |
      | REQ-108-007 | 意味的依存が未充足の後続作業を、先行作業の停止だけを理由に開始しないこと |
      | REQ-108-008 | Wave を意味的な依存関係のまとまりとして扱い、並列実行の共有上限を Wave や親子 Issue の個数から独立した実行制御として扱うこと |
      | REQ-108-009 | 最終的な要求充足の根拠が不十分な場合、PR のマージや Issue の終了だけで完了と宣言しないこと |
      | REQ-108-010 | 外部副作用を成果物の作成と区別し、確認済みの権限・安全条件を満たす範囲に限定すること |
      | REQ-108-011 | Intake・Learning・Backlog を継続的な発見・改善と要件化への接続能力として維持すること。発見・学習情報を必要な評価と承認を経て要件候補へ接続して要件化・実行・検証へ渡せ、実行から生じた改善情報も同じ循環へ戻せること。旧公開コマンド名や旧内部状態の維持を合否条件としないこと |
      | REQ-108-012 | v5 の実行モデルの実現確定までの間、現行の実行契約が実行経路の正として維持されること。v5 モデルと両立しない現行要件行の再定義は、移行の棚卸し構造が優先順位を付けて処理すること |

      ## 適用範囲

      - **対象**: 有限作業の実行境界、責務分割、単独実行と連続実行、Issue/Epic/Wave 協調、停止・再開・完了判定、Intake・Learning・Backlog から要件化と実行へ至る継続的改善能力
      - **対象外**: 公開コマンド名・状態名・具体的な内部処理順序、旧 Case ライフサイクルの互換再現、新しい第一級 Change 台帳や汎用工程管理機構の一律導入
  - id: ACT-REQ-006
    artifact: req
    operation: create
    target: new:adf-v5-migration-compatibility
    source_items: [AG-006]
    content: |
      ---
      id: REQ-109
      title: "ADF v5 移行と互換性の境界"
      created: "2026-10-09"
      updated: "2026-10-09"
      ---

      ## 目的

      既存 ADF の内部互換性に拘束されず v5 へ移行し、開発成果と未処理の改善情報の意味・関係・処理継続性を
      保持する。移行元を破壊せず、移行結果を検証可能にする。

      ## 要件

      | ID | 要件 |
      |---|---|
      | REQ-109-001 | v4 互換性（旧コマンド API・状態名・配置パスの維持）を v5 の機能要件としないこと。既存コマンドや内部状態の変更・廃止だけを理由に v5 の要件不適合と判定しないこと |
      | REQ-109-002 | 既存の有効な正規情報（要件、受け入れ条件、重要判断、現在の設計）について、移行先で元の意味と必要な理由・参照関係を確認できること |
      | REQ-109-003 | 実装成果物と検証手段・証拠について、移行によって必要な対応関係が失われていないか確認できること |
      | REQ-109-004 | 移行元情報を破壊せず、移行が失敗・中断した後も移行元の確定情報を読み出して移行前の内容と照合できること |
      | REQ-109-005 | 移行結果に欠落・不整合・検証不能がある場合、移行成功として確定しないこと。検証に不足がある場合も移行成功を宣言しないこと |
      | REQ-109-006 | 自動化の範囲や旧互換層は必要性に応じて検討し一律必須としないこと。人手介入を含む移行方法であっても、必要な意味保存と検証が成立すれば要件に適合し得ること |
      | REQ-109-007 | 移行前に未処理として存在する Intake・Learning・Backlog の各情報について、移行後に内容、処理状態、必要な参照関係を確認でき、未処理状態から適切な後続処理を継続できること |
      | REQ-109-008 | 未処理の Intake・Learning・Backlog 情報に移行時の欠落・参照不整合・処理状態不明がある場合、対象と理由を検証結果から特定でき、破棄済み・処理済みとして黙認せず、移行完了と判定しないこと |

      ## 適用範囲

      - **対象**: ADF 自身と既存 ADF 適用プロジェクトの v5 移行。有効な正規情報と未処理の Intake・Learning・Backlog 情報の意味・関係・処理状態の保持と移行結果検証
      - **対象外**: 旧コマンド API・状態名・配置パスの永続的互換保証、旧 v4 の移行作業手順や切替構成のそのままの流用、全移行作業の完全自動化・恒久的な旧新併存運用の強制
  - id: ACT-REQ-007
    artifact: req
    operation: update
    target: docs/requirements/REQ-012.md
    source_items: [AG-002]
    content: |
      REQ-012-031 行を次の文面で置き換える:
      | REQ-012-031 | 各現行要件について、その要件の設計内容と根拠が、プロジェクトの採用した工程・成果物規約が認める適切な成果物から確認できること。独立した Design 文書の存在を一律の必須条件としないこと。プロジェクトが独立設計書を必須成果物として採用した場合の欠落の検出は REQ-021 が所有する工程ゲートが担うこと。Definition 保存時点での設計根拠対応の未成立は保存を阻害しないこと |
  - id: ACT-REQ-008
    artifact: req
    operation: update
    target: docs/requirements/REQ-021.md
    source_items: [AG-002]
    content: |
      REQ-021-024 行を次の文面で置き換える:
      | REQ-021-024 | case-open は対象要件行の設計根拠対応が未成立でも Root Case の確立を妨げないこと。case-ready は、対象要件行に、プロジェクトの採用した工程・成果物規約が要求する設計根拠対応（独立 Design 文書を必須とする採用の場合は Design 対応1件以上）が存在すること、およびトレーサビリティポリシーが有効であることを ready への遷移の必要条件として扱うこと |
  - id: ACT-REQ-009
    artifact: req
    operation: update
    target: docs/requirements/REQ-061.md
    source_items: [AG-002]
    content: |
      REQ-061-023 行を次の文面で置き換える:
      | REQ-061-023 | case-ready は、対象要件行に、プロジェクトの採用した工程・成果物規約が要求する設計根拠対応（独立 Design 文書を必須とする採用の場合は Design 対応1件以上）が存在すること、およびトレーサビリティポリシー（traceability/policy.yaml）が有効であることを実行準備完了の必要条件として確認すること。設計根拠対応の欠落または verification policy の不正を検出した場合は実行準備完了としないこと。verification 対応の完全性は本ゲートの条件に含めず、case-run での対応作成・更新と case-close の最終完全性検査（REQ-021-018）が所有すること（REQ-021-024 と整合） |
  - id: ACT-REQ-010
    artifact: req
    operation: update
    target: docs/requirements/REQ-088.md
    source_items: [AG-002]
    content: |
      REQ-088-006 行を次の文面で置き換える:
      | REQ-088-006 | REQ、Decision、Design、Implementation、Evidence の意味境界（何が成立しなければならないか、なぜその選択か、どの構造・実現方式で成立させるか、実体、根拠）が ADF の基盤モデル定義として正規所有されること。工程別の成果物の正式確定と最終的な要求充足の別判定は、v5 の成果物確定要件が所有すること |
  - id: ACT-REQ-011
    artifact: req
    operation: update
    target: docs/requirements/REQ-012.md
    source_items: [AG-003]
    content: |
      REQ-012-046 行を次の文面で置き換える:
      | REQ-012-046 | impact は、要件を起点に当該要件へ明示的に対応する成果物を、成果物を起点にその成果物が対応する要件を経由して同じ要件へ対応する他の成果物を、変更時の再確認候補として取得できること。あわせて、既存の下流成果物が依拠した上流の状態と現在の上流状態の比較に基づく差分候補の取得を妨げないこと。任意深度のグラフ探索を行わず、成果物 ↔ 要件 ↔ 成果物の範囲を超えて探索せず、impact の空結果を「影響なし」の証明として扱わないこと |
  - id: ACT-REQ-012
    artifact: req
    operation: update
    target: docs/requirements/REQ-021.md
    source_items: [AG-003]
    content: |
      REQ-021-011 行を次の文面で置き換える:
      | REQ-021-011 | req-define は、既存の明示的な対応関係と impact に加え、既存の下流成果物が依拠した上流の状態と現在の上流状態の比較に基づく差分候補を、変更影響候補の確認に利用できること。トレーサビリティ情報だけで変更対象、正規所有者、対象範囲を確定せず、impact の空結果を「影響なし」の根拠とせず、将来作成される実装成果物または検証手段との対応関係を推測して正規情報として保存しないこと |
  - id: ACT-REQ-013
    artifact: req
    operation: update
    target: docs/requirements/REQ-012.md
    source_items: [AG-004]
    content: |
      REQ-012-027、REQ-012-032、REQ-012-047 の3行を次の文面で置き換える:
      | REQ-012-027 | TIM の標準コア関係は、成果物が要件へ明示的に対応する対応関係（covers）に加え、プロジェクトの採用した工程に基づく隣接工程間の成果物・追跡単位の対応関係を、有界な標準関係として扱うこと。多数の関係型の持ち込み（REQ-012-039）や汎用の関係拡張機構の新設（REQ-012-040）に該当しないこと |
      | REQ-012-032 | 実装成果物および検証手段の要件への直接対応付けを一律必須とせず、プロジェクトの採用した工程に基づく隣接工程間の対応による追跡を認めること。ただし各現行要件について実装成果物1件以上（REQ-012-029）および検証対応必須行の検証手段1件以上（REQ-012-030）の要件側の直接対応の義務は維持すること。対応関係の存在だけを根拠に、要件に対する実装または検証が成立したものと推定しないこと |
      | REQ-012-047 | check は、少なくとも sidecar とトレーサビリティポリシーの構文不正、未知の成果物役割、存在しない要件への参照、対応先パスの解決不能、隣接工程間対応を含む対応関係の参照不整合、プロジェクトの採用した工程・成果物規約が要求する設計根拠対応の欠落（独立 Design 文書を必須とする採用の場合は Design 対応の欠落）、実装対応の欠落、検証対応の欠落（検証対応必須の要件行のみ計上）、ポリシー参照の不正、同一対応関係の重複宣言の不整合を決定的に検査できること。Decision 対応の欠落を不合格として扱わないこと |
  - id: ACT-REQ-014
    artifact: req
    operation: update
    target: docs/requirements/REQ-021.md
    source_items: [AG-004]
    content: |
      REQ-021-018、REQ-021-025 の2行を次の文面で置き換える:
      | REQ-021-018 | case-close は QG-4 の一部として、対象要件の設計根拠対応、実装対応、検証対応（検証対応必須の要件行）の完全性を、プロジェクトの採用した工程構成に基づき正規成果物から独立して再検査すること。構造検査と要求内容の充足という意味的品質検証は別の責務として扱うこと。対象要件にこれらの対応の欠落が残る場合、マージせず停止し、不足する対応関係を自動追加または修正せず、検査失敗を case-run 側の修正対象として差し戻せること |
      | REQ-021-025 | case-close は、対象要件行に設計根拠対応（プロジェクトの採用した工程・成果物規約が要求するもの）、実装対応、検証対応（検証対応必須行）のいずれかの恒久的な対応が存在しない場合、完了として扱わないこと |
  - id: ACT-REQ-015
    artifact: req
    operation: update
    target: docs/requirements/REQ-009.md
    source_items: [AG-006]
    content: |
      REQ-009-004 行を次の文面で置き換える:
      | REQ-009-004 | 初回導入用の移行手段は一回限り実行可能とし、導入完了後に削除可能。v4 から v5 への移行は、v5 の移行要件（有効な正規情報の意味と関係の保持、移行元の非破壊、移行結果の検証、未処理の Intake・Learning・Backlog 情報の処理継続性）に従うこと。移行作業の標準境界は移行・release の Design が定めること |
  - id: ACT-DEC-001
    artifact: decision
    operation: create
    target: new:adf-v5-process-artifact-model
    source_items: [AG-001, AG-002]
    content: |
      ---
      id: DEC-053
      title: "ADF v5 工程・成果物モデル（共通責務・参照モデル工程・成果物の意味と正式確定）"
      status: proposed
      created: "2026-10-09"
      updated: "2026-10-09"
      related_reqs: [REQ-104, REQ-105, REQ-012, REQ-021, REQ-061, REQ-088]
      relations:
        - type: relates-to
          target: DEC-031
          reason: 概念と実装の分離原則は維持する。工程・成果物モデルの世代交代として位置づける
        - type: relates-to
          target: DEC-032
          reason: 三層モデルと Project Contract 論理ビューは維持する。プロジェクトの採用する工程・成果物規約は Project Contract の再構成要素の一部として扱う
        - type: relates-to
          target: DEC-037
          reason: 設計役割の充填成果物の拡張（独立 Design 文書の一律必須化の撤廃）。標準関係構造の置換は ADF v5 追跡・品質検証モデル Decision が所有する
      ---

      # DEC-053: ADF v5 工程・成果物モデル（共通責務・参照モデル工程・成果物の意味と正式確定）

      ## 背景

      v4 では詳細工程の参照例が既定の必須工程と取り違えられ得る一方、有効な要件ごとに独立 Design 文書を
      必要とする規則が軽量変更に過剰な文書作成を強制していた。v5 では基本設計・詳細設計等の詳細工程を
      全プロジェクトに強制せず、設計責務の成立を独立 Design 文書の有無から切り放す必要がある。

      ## 決定

      ADF の共通責務を要件定義、設計、実装・構築、各段階の検証とし、詳細工程を任意の参照モデルとして
      プロジェクト方針による採用に委ねる。採用された工程、工程間関係、必須成果物を対象作業の基準として
      参照・解決し、未採用の工程・成果物を欠落として誤判定せず、採用済み必須成果物の不在をファイル不在だけ
      で合格させない。要求・Decision・設計・実装・検証の意味は各工程の成果物が所有し、設計内容と根拠は
      プロジェクトが認める適切な成果物から確認できればよい（独立 Design 文書を一律必須としない）。
      各工程の成果物は当該工程の要求充足・上流整合・必要な検証の成立をもって後続工程を待たずに正式確定
      でき、正式確定と最終的な要求充足は別判定とする。採用宣言のない移行期は現行実効規約を採用済み
      規約として扱う。

      ## 結果、影響

      REQ-012-031、REQ-021-024、REQ-061-023、REQ-088-006 の各要件行が本 Decision と同一の
      Definition 変更で再定義される。トレーサビリティの標準関係構造の変更は ADF v5 追跡・品質検証
      モデル Decision が、ワークフロー実行責務の再編は ADF v5 有限実行 Decision が所有する。

      ## 関連する決定

      関係は frontmatter `relations` フィールドが正であり、本文では再掲しない（decision-lifecycle.md）。
  - id: ACT-DEC-002
    artifact: decision
    operation: create
    target: new:adf-v5-traceability-verification-model
    source_items: [AG-003, AG-004]
    content: |
      ---
      id: DEC-054
      title: "ADF v5 追跡・品質検証モデル（隣接工程間対応・構造/意味分離・差分影響評価）"
      status: proposed
      created: "2026-10-09"
      updated: "2026-10-09"
      related_reqs: [REQ-106, REQ-107, REQ-012, REQ-021]
      relations:
        - type: supersedes
          target: DEC-037
          reason: トレーサビリティモデルの標準関係構造（Design への定義権委譲を前提とした covers 単独の標準コア関係を含む）を、採用された隣接工程間対応を含む標準関係構造へ拡張する。DEC-037 の直接走査・標準能力・用語政策の各決定は維持する
        - type: relates-to
          target: DEC-035
          reason: 品質概念の5分解は維持する。ゲートが参照する対応の意味（設計根拠対応の条件付き化）のみ変更する
      ---

      # DEC-054: ADF v5 追跡・品質検証モデル（隣接工程間対応・構造/意味分離・差分影響評価）

      ## 背景

      v4 のトレーサビリティは要件と成果物の直接対応付けを前提とし、対応の有無を機械的に検査する。
      しかし宣言された対応だけの走査では未登録の成果物が候補から漏れ、構造上の対応があっても下流の
      意味・品質の成立は保証されない。変更影響評価も工程開始時点の正味差分に依拠しており、途中で形成した
      成果物や未反映の変更を見落とし得た。

      ## 決定

      プロジェクトの採用した隣接工程間の成果物・追跡単位の対応を covers に加わる有界な標準関係として
      扱い、上流下流を双方向に追跡できるようにする。すべての成果物に要件との重複した直接対応を必須と
      せず、正規成果物を宣言済み関係と独立に棚卸しして宣言外の候補を発見候補として扱う。構造検査と
      意味的品質検証を別の責務とし、トレーサビリティ機構に恒久的な意味品質検証ゲートを追加しない。
      変更影響評価は、既存の下流成果物が依拠した上流の状態と現在の上流状態の比較に基づき、影響候補ごとに
      更新必要・更新不要・作成・未確認を根拠とともに区別する。変更起点は中間工程で更新不要でも後続に
      引き継ぎ、十分な証拠なく変更反映完了と宣言しない。

      ## 結果、影響

      REQ-012-046 および REQ-021-011 は変更影響要件（REQ-106）の Definition 変更で再定義され、
      REQ-012-027、REQ-012-032、REQ-012-047、REQ-021-018、REQ-021-025 は本 Decision と同一の
      Definition 変更で再定義される。DEC-037 の部分置換（標準関係構造の拡張）を本 Decision が実行する。
      実装面（impact 拡張、check の検査項目、差分候補抽出）の変更方針は要件doc の realization_actions が
      ハンドオフする。

      ## 関連する決定

      関係は frontmatter `relations` フィールドが正であり、本文では再掲しない（decision-lifecycle.md）。
  - id: ACT-DEC-003
    artifact: decision
    operation: create
    target: new:adf-v5-finite-execution
    source_items: [AG-005]
    content: |
      ---
      id: DEC-055
      title: "ADF v5 有限実行と責務再編（工程独立実行・Issue 必要時利用・Wave の意味的依存グループ化）"
      status: proposed
      created: "2026-10-09"
      updated: "2026-10-09"
      related_reqs: [REQ-108]
      relations:
        - type: supersedes
          target: DEC-033
          reason: 部分置換。Wave を実行スケジューリング単位とする規定を、Wave を意味的な依存関係のまとまりとする規定へ置き換える。UX 2入口収斂、内部 lifecycle、継続コラボレーションループ、学習昇格ガード、work_type/scale/Epic の規定は維持する
        - type: relates-to
          target: DEC-031
          reason: 概念と実装の分離原則は維持する
        - type: relates-to
          target: DEC-041
          reason: Wave 構成純度の単一所有は維持する。並列上限の Wave からの独立性を引き継ぐ
        - type: relates-to
          target: DEC-051
          reason: Wave の記録単位化（意味的依存 DAG からの決定的導出）と共有 active 枠による並列制御を継承し、第3の Wave 定義を作らない
      ---

      # DEC-055: ADF v5 有限実行と責務再編（工程独立実行・Issue 必要時利用・Wave の意味的依存グループ化）

      ## 背景

      v4 の Case と関連コマンドには要件確定、設計、Issue 分解、実装、検証、PR と後処理の複数責務が
      集中し、実行経路に特定の成果物構成や Issue の作成を強制して小規模開発や工程の独立実行を阻害し
      得た。一方、DEC-051 はすでに Wave 構成の記録単位化と並列上限の Wave サイズからの分離を実現している。

      ## 決定

      有限作業の実行範囲・入力・権限・検証条件を実行中に確認できることを実行契約の基礎とし、要件確定、
      設計確定、実装・構築、検証、Issue 協調、後処理の責務を分ける。小規模案件では必要な処理を連続実行し
      （Epic・Issue の生成を必須としない）、段階案件では工程単独で確定・終了できる。Issue は追跡・委譲・
      分割・再開等の価値がある場合に利用し、実行境界は要求・設計の正規情報を再所有しない。Wave は意味的な
      依存関係のまとまりであり（DEC-041/DEC-051 の定義を継承）、並列実行の共有上限は Wave や親子 Issue の
      個数から独立した実行制御とする。完了は PR マージや Issue 終了などの作業状態ではなく、権限と証拠に
      よって確定する。外部副作用は成果物の作成と区別して確認済みの権限・安全条件に限定する。Intake・
      Learning・Backlog の改善循環は維持し、旧コマンド名・内部状態の固定を要求しない。

      ## 結果、影響

      現行の実行契約（case 系・backlog 系コマンド）は v5 実行モデルの実現確定まで実行経路の正として
      維持される（REQ-108-012）。REQ-030-001、REQ-005-001/010/011、REQ-035-006 等の現行行の再定義は
      移行の棚卸し構造（v4→v5 crosswalk）が優先順位を付けて処理する（v3 case-* command の処遇と同じ
      パターン）。実行経路の公開面の位置づけ（case-auto 内のモードか新たな公開経路か）は実現面の判断であり、
      新たな公開経路とする場合は REQ-005-011 の正規改訂を要する。

      ## 関連する決定

      関係は frontmatter `relations` フィールドが正であり、本文では再掲しない（decision-lifecycle.md）。
  - id: ACT-DEC-004
    artifact: decision
    operation: create
    target: new:adf-v5-migration-boundary
    source_items: [AG-006]
    content: |
      ---
      id: DEC-056
      title: "ADF v5 移行と互換性の境界（後方互換非必須・意味保存移行・未処理改善情報の継続）"
      status: proposed
      created: "2026-10-09"
      updated: "2026-10-09"
      related_reqs: [REQ-109, REQ-009]
      relations:
        - type: supersedes
          target: DEC-034
          reason: 部分置換。v4→v5 移行への v4 移行手順・切替構成の直接適用を本 Decision が置き換える。非破壊移行原則（決定1）と検証重視は維持し、決定2・3の v4.0.0 固有の切替・release 条件は v3→v4 移行の歴史的記録として維持する
        - type: relates-to
          target: DEC-031
          reason: 概念と実装の分離原則は維持する
      ---

      # DEC-056: ADF v5 移行と互換性の境界（後方互換非必須・意味保存移行・未処理改善情報の継続）

      ## 背景

      v5 では v4 の既存コマンド、内部状態、文書関係を抜本的に改め得る。後方互換性を必須にすると旧来の
      構造が温存される一方、既存の有効な開発情報を破壊する移行は利用先プロジェクトに受け入れがたい損失を
      もたらす。DEC-034 の非破壊移行原則と検証重視は維持しつつ、v4 向け移行手順を v5 にそのまま適用する
      合意は存在しない。

      ## 決定

      v4 互換性（旧コマンド API・状態名・配置パスの維持）を v5 の機能要件としない。既存の有効な正規情報
      （要件、受け入れ条件、重要判断、設計、実装、検証根拠）について、必要な意味と関係を保って v5 へ移行
      する。移行元情報を破壊せず、移行結果を検証可能にし、検証に不足や不整合がある場合は移行成功を宣言
      しない。自動化の範囲や旧互換層は必要性に応じて検討し一律必須としない（人手介入を含む移行も、必要な
      意味保存と検証が成立すれば適合し得る）。移行前に未処理として存在する Intake・Learning・Backlog の
      情報について、内容、処理状態、必要な参照関係を失わず、移行後も処理を継続できる。欠落・不整合を
      黙って破棄や処理済みとみなさない。v4 正規収束の baseline tag（REQ-103-028）は v4 収束完了時点の
      一意比較点として移行の意味保存検証の対照基準に利用できる。

      ## 結果、影響

      REQ-009-004 の要件行が本 Decision と同一の Definition 変更で再定義される。移行作業の標準境界
      （手順、切替構成、検証）は移行・release の Design が定める。DEC-034 の部分置換を本 Decision が
      実行する。

      ## 関連する決定

      関係は frontmatter `relations` フィールドが正であり、本文では再掲しない（decision-lifecycle.md）。
  - id: ACT-DEC-005
    artifact: decision
    operation: update
    target: docs/decisions/DEC-037.md
    source_items: [AG-004]
    content: |
      DEC-037 frontmatter に部分置換の記録を付す（status: accepted は維持）:
      superseded_by: DEC-054（採番確定後の実番号）
      supersede_note: トレーサビリティモデルの標準関係構造（Design への定義権委譲を前提とした covers 単独の標準コア関係を含む）を DEC-054 が拡張（covers＋採用された隣接工程間対応）。直接走査、標準能力（coverage/impact/check）、用語政策の各決定は維持する
  - id: ACT-DEC-006
    artifact: decision
    operation: update
    target: docs/decisions/DEC-033.md
    source_items: [AG-005]
    content: |
      DEC-033 frontmatter に部分置換の記録を付す（status: accepted は維持）:
      superseded_by: DEC-055（採番確定後の実番号）
      supersede_note: Wave を実行スケジューリング単位とする規定を DEC-055 が置換（Wave＝意味的な依存関係のまとまり、並列上限は独立した実行制御）。UX 2入口収斂、内部 lifecycle、継続コラボレーションループ、学習昇格ガード、work_type/scale/Epic の規定は維持する
  - id: ACT-DEC-007
    artifact: decision
    operation: update
    target: docs/decisions/DEC-034.md
    source_items: [AG-006]
    content: |
      DEC-034 frontmatter に部分置換の記録を付す（status: accepted は維持）:
      superseded_by: DEC-056（採番確定後の実番号）
      supersede_note: v4→v5 移行への手順・切替構成の直接適用を DEC-056 が置換。非破壊移行原則（決定1）と検証重視は維持する。決定2・3の v4.0.0-rc.1 cutover と v4.0.0 release 条件は v3→v4 移行の歴史的記録として維持する

conflict_resolutions:
  - id: CR-001
    conflict: REQ-012-031（各現行要件に Design 文書1件以上対応）と v5 の「独立 Design 文書を一律必須としない」の直接衝突
    resolution: RU02 案A合意に基づき行 ID 不変で「プロジェクトの採用した工程・成果物規約が認める適切な成果物から確認できる設計根拠」へ再定義する（crosswalk-inventory の redefine 前例。v4-traceability-model 解釈 clause が文言変更再定義を後続段階に留保していた箇所の実行）
  - id: CR-002
    conflict: REQ-021-024（case-ready ゲートの Design 対応1件以上必須）と v5 の条件付き化の衝突、および REQ-061-023 が「（REQ-021-024 と整合）」を明示参照する構造
    resolution: REQ-021-024 と REQ-061-023 を同一 OU（OU-2）で同時に更新し、宣言済み整合を維持する（REQ-021-028 の「規範変更と強制実装の同一 Definition 変更」原則、アーキテクチャ助言 A-4/C-1 採用）。REQ-061-031/033 の REQ-061-023 参照は行参照であり更新不要
  - id: CR-003
    conflict: RU02 が変更候補に指名した REQ-021-013（Design 保存内部責務）の扱い
    resolution: 更新しない。Design 文書は v5 でも認められた成果物形式の一つであり、明示確定された対応の inline 保存機構は条件付き適用として有効（アーキテクチャ助言 A-6）
  - id: CR-004
    conflict: RU04 アンカーの REQ-012-028（役割4種・design/implementation 必須役割）と REQ-012-029/030（要件側の実装/検証直接対応義務）の扱い
    resolution: 更新しない。役割分類と要件側完全性義務は v5 でも維持し、設計役割の充填成果物の拡張は REQ-012-031/032 の更新と REQ-012-033/055 の既存受容で対応する。REQ-012-032 の更新文面で 029/030 義務の維持を明示し矛盾に見えないようにする（アーキテクチャ助言 A-5）
  - id: CR-005
    conflict: RU05（Issue 非必須・工程単独終了・Wave の意味的依存グループ化）と現行実行契約行（REQ-030-001 Root Case の Issue 確立、REQ-005-001/010/011 公開経路、REQ-035-006 Wave＝実行スケジューリング単位）の移行期衝突
    resolution: REQ-108-012（移行期権威行）で現行実行契約の権威を宣言し、現行行の再定義は v4→v5 crosswalk（棚卸し構造）が優先順位を付けて処理する。優先行は REQ-030-001、REQ-005-001/010/011、REQ-035-006、REQ-061 周辺行（v3 case-* command の処遇と同じ宣言型移行パターン、DEC-033 結果節の先例、アーキテクチャ助言 B-2 採用）
  - id: CR-006
    conflict: RU02 アンカーの artifact-contracts.md が意味境界の正規所有者でない（REQ-002 系の Command/Skill 契約文書）
    resolution: 意味境界の正規所有は v4-operating-model 中核文書モデル節と document-type-responsibilities とし、artifact-contracts.md は副次参照として realization_actions に記録する（アーキテクチャ助言 B-5 採用）
  - id: CR-007
    conflict: Decision 構成の粒度（単一の v5 コアモデル Decision か領域別分割か）
    resolution: v4 世代交代の領域別 Decision 先例（DEC-031〜035、037）に倣い 4 Decision に分割する（工程・成果物モデル、追跡・品質検証モデル、有限実行、移行境界）。DEC-033 部分置換は有限実行 Decision が、DEC-034 部分置換は移行境界 Decision が、DEC-037 部分置換は追跡・品質検証 Decision が所有する（アーキテクチャ助言 B-1 採用）
  - id: CR-008
    conflict: stage-standalone 実行（設計形成の独立終了）の公開面の位置づけ（case-auto 内のモードか新たな公開経路か）が確定していない
    resolution: RU05 合意は経路を固定しておらず、実現面判断として realization_actions へ委譲する。新たな公開経路とする場合は REQ-005-011 の正規改訂を要する旨を DEC-055 結果節に明記した（アーキテクチャ助言 C-2 の処置）
  - id: CR-009
    conflict: Wave の位置づけが DEC-033/041/051 と新 Decision で競合定義になるリスク
    resolution: DEC-055 は relates-to DEC-041/DEC-051 を宣言し、Wave の記録単位化（意味的依存 DAG からの決定的導出）と並列上限の独立性を継承して第3の定義を作らない。DEC-033 の部分置換スコープは Wave 句に限定する（アーキテクチャ助言 A-2 採用）
  - id: CR-010
    conflict: 採用規約の解決機構が実装される前に更新済みゲート行（REQ-021-024/061-023）の判定条件が解決不能になり、fail-closed でゲートが全面遮断するリスク
    resolution: REQ-105-008（採用宣言がない移行期は現行実効規約を採用済み規約として扱う）を設け、ゲート条件の評価可能性を保証する（アーキテクチャ助言 C-4 の処置）

operation_units:
  - ou_id: OU-1
    source_ru: adf-v5-ru-revised-01-core-process-model
    target_req: REQ-104
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
  - ou_id: OU-2
    source_ru: adf-v5-ru-revised-02-artifact-design-finalization
    target_req: REQ-105
    operation: create
    scale: standard
    depends_on: [OU-1]
    recommended_order: 2
    issue_policy: single
  - ou_id: OU-3
    source_ru: adf-v5-ru-revised-03-change-impact-incremental-update
    target_req: REQ-106
    operation: create
    scale: standard
    depends_on: [OU-1]
    recommended_order: 3
    issue_policy: single
  - ou_id: OU-4
    source_ru: adf-v5-ru-revised-04-traceability-quality-verification
    target_req: REQ-107
    operation: create
    scale: standard
    depends_on: [OU-1, OU-3]
    recommended_order: 4
    issue_policy: single
  - ou_id: OU-5
    source_ru: adf-v5-ru-revised-05-workflow-responsibility-reorganization
    target_req: REQ-108
    operation: create
    scale: standard
    depends_on: [OU-2]
    recommended_order: 5
    issue_policy: single
  - ou_id: OU-6
    source_ru: adf-v5-ru-revised-06-v5-migration-compatibility
    target_req: REQ-109
    operation: create
    scale: standard
    depends_on: [OU-2, OU-4, OU-5]
    recommended_order: 6
    issue_policy: single
result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      REQ-104 新規ファイルの構造検証（frontmatter id↔ファイル名一致、目的・要件表・適用範囲の必須
      セクション存在、要件行 ID 採番の一意性）を artifact-validation の REQ frontmatter 検証で実行する。
      RU01 の決定的受け入れ条件 AC01〜AC06 が REQ-104-001〜007 のいずれかに対応することを行単位で突合する。
      README の現行 REQ 索引（AUTOGEN 表）に REQ-104 が反映されていることを突合する。
    pass_criteria: |
      構造検証の不合格 0 件。AC01→001/002/006、AC02→003、AC03→004（前半）、AC04→004（後半）、
      AC05→005、AC06→006 の対応で未対応の AC が 0 件。README 索引と実ファイルの乖離 0 件。
    on_failure: |
      fix-and-reverify。構造欠陥・対応欠落は当該 OU の実装側修正対象として修正後に再検証する
      （docs 主体の変更であり外部要因ではないため）。
  - id: TS-002
    target_item: AG-002
    verification: |
      REQ-105 新規ファイルの構造検証（TS-001 と同じ手法）を実行する。RU02 の AC01〜AC06 が
      REQ-105-001〜008 に対応することを突合する。あわせて同一 OU で更新する REQ-012-031、REQ-021-024、
      REQ-061-023、REQ-088-006 の置換後文面が「プロジェクトの採用した工程・成果物規約」を判定条件の
      前提として一貫使用していることを確認する。REQ-105-008（移行期デフォルト行）の存在を確認する。
    pass_criteria: |
      構造検証の不合格 0 件。AC01→001/002、AC02→002、AC03→003、AC04→004、AC05→005、AC06→006/007 の
      対応で未対応 AC 0 件。4 更新行の用語一貫性の不一致 0 件。REQ-105-008 存在。
    on_failure: |
      fix-and-reverify。用語不統一はゲート評価不能の原因となるため修正必須とする。
  - id: TS-003
    target_item: AG-003
    verification: |
      REQ-106 新規ファイルの構造検証（TS-001 と同じ手法）を実行する。RU03 の AC01〜AC09 が
      REQ-106-001〜009 に対応することを突合する。あわせて同一 OU で更新する REQ-012-046、REQ-021-011 の
      置換後文面が差分候補の利用を妨げない旨を含むことを確認する。
    pass_criteria: |
      構造検証の不合格 0 件。AC01→001、AC02→002、AC03→003、AC04→007（前半）、AC05→007（後半）、
      AC06→005、AC07→006、AC08→008、AC09→009 の対応で未対応 AC 0 件。
    on_failure: |
      fix-and-reverify。docs 主体の構造検証であり外部要因ではないため。
  - id: TS-004
    target_item: AG-004
    verification: |
      REQ-107 新規ファイルの構造検証（TS-001 と同じ手法）を実行する。RU04 の AC01〜AC08 が
      REQ-107-001〜008 に対応することを突合する。あわせて同一 OU で更新する REQ-012-027/032/047、
      REQ-021-018/025 の置換後文面が (1) 隣接工程間対応を有界な標準関係としていること、
      (2) REQ-012-029/030 の要件側義務の維持を明示していること、(3) REQ-012-039/040 に該当しない旨を
      明示していることを確認する。
    pass_criteria: |
      構造検証の不合格 0 件。AC01→001、AC02→002、AC03→003、AC04→004、AC05→005、AC06→006、
      AC07→007、AC08→008 の対応で未対応 AC 0 件。(1)〜(3) の文面要件の欠落 0 件。
    on_failure: |
      fix-and-reverify。039/040 との区別の欠落は check 実現時の判断割れの原因となるため修正必須とする。
  - id: TS-005
    target_item: AG-005
    verification: |
      REQ-108 新規ファイルの構造検証（TS-001 と同じ手法）を実行する。RU05 の AC01〜AC10 が
      REQ-108-001〜012 に対応することを突合する。REQ-108-012（移行期権威行）の存在と、CR-005 の
      優先行リストが realization_actions に記録されていることを確認する。
    pass_criteria: |
      構造検証の不合格 0 件。AC01→002、AC02→003、AC03→004、AC04→005、AC05→006、AC06→007、
      AC07→008、AC08→009、AC09→010、AC10→011 の対応で未対応 AC 0 件。REQ-108-012 と RA-006 の記録存在。
    on_failure: |
      fix-and-reverify。REQ 行と実現面記録の不整合は移行期権威管理の欠落につながるため。
  - id: TS-006
    target_item: AG-006
    verification: |
      REQ-109 新規ファイルの構造検証（TS-001 と同じ手法）を実行する。RU06 の AC01〜AC09 が
      REQ-109-001〜008 に対応することを突合する。あわせて同一 OU で更新する REQ-009-004 の置換後文面が
      v5 移行要件への従属を明示していることを確認する。
    pass_criteria: |
      構造検証の不合格 0 件。AC01→001、AC02→002、AC03→002/003、AC04→003、AC05→004、AC06→005、
      AC07→006、AC08→007、AC09→008 の対応で未対応 AC 0 件。
    on_failure: |
      fix-and-reverify。docs 主体の構造検証であり外部要因ではないため。
  - id: TS-007
    target_item: AG-002
    verification: |
      ゲート評価可能性の検証。更新後の REQ-021-024 と REQ-061-023 の判定条件（プロジェクトの採用した
      工程・成果物規約が要求する設計根拠対応）が、REQ-105-008 の移行期デフォルト（現行実効規約を採用済み
      規約として扱う）と組み合わせたときに、採用機構の実装前でも判定可能であることを、自己ホスト環境の
      現行実効規約（独立 Design 文書を要求）を例に確認する。
    pass_criteria: |
      移行期の判定経路が一意に解決できること（解決不能条件による fail-closed 遮断の発生条件 0 件）。
      両ゲート行の判定条件の文言が相互に矛盾しないこと。
    on_failure: |
      fix-and-reverify。ゲートの評価不能は全 Case の実行停止につながるため修正必須とする。
  - id: TS-008
    target_item: AG-005
    verification: |
      移行期権威と棚卸しの網羅検証。REQ-108-012 の移行期権威行の存在、RA-006（v4→v5 crosswalk）の
      優先行リスト（REQ-030-001、REQ-005-001/010/011、REQ-035-006、REQ-061 周辺行）の記録、および
      v5 新規 REQ と現行要件行の間に宣言なしの直接矛盾が残っていないこと（REQ-103-023 の横断読み整合）を
      確認する。矛盾候補は docs/requirements 全体を rg でスキャンして列挙する（docs/reports/ は履歴記録
      として対象外）。
    pass_criteria: |
      移行期権威行の対象外となっている現行行のうち、REQ-108 の行と宣言なしで直接矛盾する行 0 件
      （crosswalk 委譲か移行期権威行のいずれかで管理されていること）。
    on_failure: |
      fix-and-reverify。管理されていない矛盾の発見時は、当該行を UPDATE 集合へ追加するか移行期権威行の
      対象として宣言に含める。
  - id: TS-009
    target_item: AG-004
    verification: |
      更新 12 行の design 対応と実現面記録の確認。REQ-012-027/031/032/046/047、REQ-021-011/018/024/025、
      REQ-061-023、REQ-088-006、REQ-009-004 の design 対応（ADF-COVERS inline 宣言または sidecar）が更新後も存在すること、
      および対応する Design の更新方針が realization_actions（RA-001〜RA-003）に記録されていることを確認する。
      更新前の意味で当該行を参照する docs/designs、traceability/ sidecar、.agentdev/extensions/skills/*.yaml の
      ADF-COVERS を rg で網羅し、陳腐化した語彙（Design 対応1件以上など）の参照残存を列挙する。
    pass_criteria: |
      design 対応の欠落 0 行。RA の ownership_hints 欠落 0 件。更新前語彙の参照残存 0 件
      （履歴記録（docs/reports/、承認記録節、supersede_note の歴史参照）は対象外）。
    on_failure: |
      fix-and-reverify。Design 側の陳腐化は同世代の実現面更新（RA）で解消する。
  - id: TS-010
    target_item: AG-006
    verification: |
      配布整合の検証。各 OU のマージ時点で docs-check（textlint 検査を含む）と repo 整合スクリプトが
      合格すること、新語彙（設計根拠対応、隣接工程間対応、採用規約）が prh 辞書・integrity rules
      （IR-057 等）で矛盾扱いされないことを確認する。consumer プロジェクトへの語彙伝播は v5 移行（OU-6）の
      検証義務（REQ-109-002〜005）に従うことを確認する。
    pass_criteria: |
      docs-check と整合スクリプトの fail 0 件。語彙検査の誤検出 0 件（誤検出時は辞書・ルールの追従更新を
      実施した上で再実行）。
    on_failure: |
      fix-and-reverify。語彙の誤検出は辞書・ルールの追従を本変更の一部として修正する。

realization_actions:
  - id: RA-001
    concern: トレーサビリティモデル Design の v5 化（標準関係の拡張と completeness 2層の更新）
    responsibility: v4-traceability-model が所有する標準コア関係（covers 単独）、completeness 2 層表、解釈 clause を v5 語義（covers＋採用された隣接工程間対応、設計根拠対応の条件付き化）へ更新する
    ownership_hints:
      - docs/designs/foundations/v4-traceability-model.md（ADF-COVERS: REQ-012-026〜042 等）
      - docs/designs/skills/agentdev-traceability.md（ADF-COVERS: REQ-012-027/028/046/047 等）
      - traceability/ 配下 sidecar 群（agentdev-design-file-manager.yaml、agentdev-workflow-case-open.yaml、policy.yaml）
    intent: REQ-012-027/031/032/046/047 の更新行と Design 記述の乖離を同世代で解消し、case-ready/case-close のゲートが新語彙で評価できるようにする
    verification_refs: [TS-009]
    source_items: [AG-002, AG-003, AG-004]
  - id: RA-002
    concern: ゲート関連 command Design の記述更新
    responsibility: case-ready/case-open/case-close/req-define の各 command Design におけるゲート記述（Design 対応1件以上、missing-design 検出、QG-4 完全性）を設計根拠対応の条件付き意味へ更新する
    ownership_hints:
      - docs/designs/commands/case-ready.md（ADF-COVERS design: REQ-021-024）
      - docs/designs/commands/case-open.md（ADF-COVERS implementation: REQ-021-024）
      - docs/designs/commands/case-close.md（ADF-COVERS design/implementation: REQ-021-018/025）
      - docs/designs/commands/req-define.md（ADF-COVERS implementation: REQ-021-011）
      - docs/designs/skills/agentdev-design-file-manager.md（ADF-COVERS design: REQ-021-013）
    intent: REQ-021-011/018/024/025、REQ-061-023 の更新行とゲート実装記述の整合を維持する
    verification_refs: [TS-009]
    source_items: [AG-002, AG-003, AG-004]
  - id: RA-003
    concern: 意味境界の正規所有 Design の更新（artifact-contracts は副次）
    responsibility: v4-operating-model 中核文書モデル節と document-type-responsibilities の意味境界記述に、工程別正式確定と最終要求充足の別判定（v5）を接続する。artifact-contracts.md は Command/Skill 契約文書として副次参照に留める
    ownership_hints:
      - docs/designs/foundations/v4-operating-model.md（ADF-COVERS design: REQ-088-001〜007）
      - docs/designs/responsibilities/document-type-responsibilities.md
      - docs/designs/responsibilities/artifact-contracts.md（副次）
    intent: REQ-088-006 の中立化と REQ-105 の所有する正式確定の区別を Design 側で裏付ける
    verification_refs: [TS-009]
    source_items: [AG-002]
  - id: RA-004
    concern: 工程・成果物採用規約の表現・解決機構の Design
    responsibility: プロジェクトの採用する詳細工程、工程間関係、必須成果物の宣言・保存・解決機構を Design として定義する（RU01/RU02 が対象外とした保存形式・解析方式・設定ファイル名の決定、移行期デフォルトの解決手順を含む）
    ownership_hints:
      - docs/designs/foundations/ 配下の新規または v4-operating-model の拡張セクション
      - REQ-104-003/004、REQ-105-002/003/008 の実現面
    intent: 「採用された工程・成果物規約」を機械的に解決可能にし、REQ-021-024/061-023 のゲート判定を成立させる
    verification_refs: [TS-007]
    source_items: [AG-001, AG-002]
  - id: RA-005
    concern: 差分・変更影響評価の実装面
    responsibility: 依拠版特定、Git ベースの比較、差分候補抽出、影響候補の分類（更新必要/不要/作成/未確認）の機構を agentdev-traceability の impact 拡張と case-revise 統合として実現する
    ownership_hints:
      - docs/designs/skills/agentdev-traceability.md
      - case-revise 関連要件・設計（agentdev-workflow-case-revise）
    intent: REQ-106-001〜009 と REQ-012-046/REQ-021-011 の更新行を実装面で支える
    verification_refs: [TS-003]
    source_items: [AG-003]
  - id: RA-006
    concern: v4→v5 crosswalk（棚卸し構造）の新設
    responsibility: 現行要件行の v5 向け処遇（維持/再定義/廃止）を記録し、権威移行を管理する crosswalk Design を新設する。優先行：REQ-030-001（Root Case の Issue 確立）、REQ-005-001/010/011（公開経路モデル）、REQ-035-006（Wave＝実行スケジューリング単位の文言）、REQ-061 周辺行（ゲート意味論参照行）
    ownership_hints:
      - docs/designs/foundations/references/crosswalk-inventory.md（v3→v4 先例）
      - docs/designs/foundations/v3-v4-crosswalk.md（権威移行パターンの先例）
      - REQ-108-012（移行期権威行）
    intent: RU05 の責務再編と現行実行契約の移行期矛盾を宣言型移行窓で管理し、REQ-103-023 の横断整合を維持する
    verification_refs: [TS-008]
    source_items: [AG-005]
  - id: RA-007
    concern: case 系・backlog 系スキル・コマンド群の責務再編実装
    responsibility: 有限実行の実行境界、Issue 必要時利用、Wave＝意味的依存まとまり、並列上限の独立制御（DEC-051 継承）、Intake/Learning/Backlog 接続の維持を、該当 Workflow Skill・Capability Skill・command Design 群へ反映する。実行主体分類表（adapter skill / command / subagent / harness）はこの再編 Design が所有する
    ownership_hints:
      - docs/designs/workflows/v4-collaboration-loop.md
      - docs/designs/commands/case-auto.md、docs/designs/commands/backlog-auto.md
      - src/common/skills/agentdev-workflow-case-*（内部 lifecycle 群）
      - docs/designs/workflows/v4-delegation-contracts.md（委譲契約）
    intent: REQ-108-001〜011 を実行面で成立させる（旧名称・旧内部状態の固定はしない）
    verification_refs: [TS-005]
    source_items: [AG-005]
  - id: RA-008
    concern: v5 移行手順・検証の Design
    responsibility: v4-migration-and-release Design の v5 版として、意味インベントリ・対応付け・非破壊検証・切替の手順を定義する。未処理 Intake/Learning/Backlog の内容・処理状態・参照関係の移行と継続、baseline tag（baseline-v4-canonical-convergence-20261007）の対照基準活用を含む
    ownership_hints:
      - docs/designs/foundations/v4-migration-and-release.md
      - docs/designs/foundations/references/crosswalk-inventory.md
      - REQ-109 の実現面、DEC-056
    intent: REQ-109-001〜008 と REQ-009-004 の更新行を実現面で支える
    verification_refs: [TS-006, TS-010]
    source_items: [AG-006]
  - id: RA-009
    concern: 用語整合（textlint prh 辞書・integrity rules）の追従
    responsibility: 新語彙（設計根拠対応、隣接工程間対応、採用規約、正式確定）の prh 辞書登録と integrity rules（IR-057 等）の語彙追従を実施する
    ownership_hints:
      - agentdev-textlint-guard plugin のプロジェクト用語 prh 辞書
      - docs/designs/integrity/integrity-rule-catalog.md、docs/designs/integrity/rules/IR-057-*.md
    intent: docs-check と整合スクリプトの誤検出なしでの v5 語彙導入を可能にする
    verification_refs: [TS-010]
    source_items: [AG-002, AG-004]

review_dispositions:
  - id: RD-001
    source_ru: adf-v5-ru-revised-01-core-process-model
    source_item: adf-v5-core-process-model
    disposition: covered
    reason_code: covered_by_new_req
    reason: |
      RU01 の要件化の方向（4項目）と決定的受け入れ条件 AC01〜AC06 は REQ-104-001〜007 に全て対応
      （AC01→001/002/006、AC02→003、AC03→004 前半、AC04→004 後半、AC05→005、AC06→006、方向4の
      プロセスモデル/システムモデル区別→007）。対象外（保存形式、WBS 管理、一律必須化）は REQ-104 の
      対象外節と RA-004 に反映。
    evidence:
      path: .agentdev/backlog/adf-v5-ru-revised-01-core-process-model.md
      section: 決定的受け入れ条件
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: adf-v5-ru-revised-02-artifact-design-finalization
    source_item: adf-v5-artifact-design-finalization
    disposition: covered
    reason_code: covered_by_new_req_and_update
    reason: |
      RU02 の要件化の方向（4項目）と AC01〜AC06 は REQ-105-001〜008 に全て対応（AC01→001/002、
      AC02→002、AC03→003、AC04→004、AC05→005、AC06→006/007、移行期解決→008）。指名アンカーの
      REQ-012-031/REQ-021-024/REQ-061-023/REQ-088-006 は同一 OU で再定義、REQ-021-013 は CR-003 の
      とおり更新不要と判断。アンカー artifact-contracts.md の位置づけは CR-006 で整理。
    evidence:
      path: .agentdev/backlog/adf-v5-ru-revised-02-artifact-design-finalization.md
      section: 決定的受け入れ条件
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_ru: adf-v5-ru-revised-03-change-impact-incremental-update
    source_item: adf-v5-change-impact-incremental-update
    disposition: covered
    reason_code: covered_by_new_req_and_update
    reason: |
      RU03 の要件化の方向（6項目）と AC01〜AC09 は REQ-106-001〜009 に全て対応（AC01→001、AC02→002、
      AC03→003、AC04→007 前半、AC05→007 後半、AC06→005、AC07→006、AC08→008、AC09→009）。指名
      アンカーの REQ-012-046/REQ-021-011 は同一 OU で再定義。case-revise 関連は RA-005 に委譲。
    evidence:
      path: .agentdev/backlog/adf-v5-ru-revised-03-change-impact-incremental-update.md
      section: 決定的受け入れ条件
      checked_at_commit: null
    related_removed_items: []
  - id: RD-004
    source_ru: adf-v5-ru-revised-04-traceability-quality-verification
    source_item: adf-v5-traceability-quality-verification
    disposition: covered
    reason_code: covered_by_new_req_and_update
    reason: |
      RU04 の要件化の方向（5項目）と AC01〜AC08 は REQ-107-001〜008 に全て対応（AC01→001、AC02→002、
      AC03→003、AC04→004、AC05→005、AC06→006、AC07→007、AC08→008）。指名アンカーの REQ-012-027/032/047、
      REQ-021-018/025 は同一 OU で再定義、REQ-012-028/029/030 は CR-004 のとおり更新不要と判断。
    evidence:
      path: .agentdev/backlog/adf-v5-ru-revised-04-traceability-quality-verification.md
      section: 決定的受け入れ条件
      checked_at_commit: null
    related_removed_items: []
  - id: RD-005
    source_ru: adf-v5-ru-revised-05-workflow-responsibility-reorganization
    source_item: adf-v5-workflow-responsibility-reorganization
    disposition: covered
    reason_code: covered_by_new_req
    reason: |
      RU05 の要件化の方向（7項目）と AC01〜AC10 は REQ-108-001〜012 に全て対応（AC01→002、AC02→003、
      AC03→004、AC04→005、AC05→006、AC06→007、AC07→008、AC08→009、AC09→010、AC10→011、移行期権威→012）。
      現行ワークフロー要件行の再定義は CR-005 のとおり crosswalk（RA-006）へ委譲。アンカー REQ-008/REQ-041 は
      循環維持・名称非固定のため更新不要。
    evidence:
      path: .agentdev/backlog/adf-v5-ru-revised-05-workflow-responsibility-reorganization.md
      section: 決定的受け入れ条件
      checked_at_commit: null
    related_removed_items: []
  - id: RD-006
    source_ru: adf-v5-ru-revised-06-v5-migration-compatibility
    source_item: adf-v5-v5-migration-compatibility
    disposition: covered
    reason_code: covered_by_new_req_and_update
    reason: |
      RU06 の要件化の方向（7項目）と AC01〜AC09 は REQ-109-001〜008 に全て対応（AC01→001、AC02→002、
      AC03→002/003、AC04→003、AC05→004、AC06→005、AC07→006、AC08→007、AC09→008）。指名アンカーの
      REQ-009-004 は同一 OU で再定義、DEC-034 は DEC-054 ではなく DEC-056 が部分置換（CR-007）。
      移行手順の具体は RA-008 に委譲。
    evidence:
      path: .agentdev/backlog/adf-v5-ru-revised-06-v5-migration-compatibility.md
      section: 決定的受け入れ条件
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: true
  decomposition: |
    6 OU（OU-1: REQ-104 作成、OU-2: REQ-105 作成＋4行更新＋DEC-053、OU-3: REQ-106 作成＋2行更新、
    OU-4: REQ-107 作成＋5行更新＋DEC-054＋DEC-037 部分置換、OU-5: REQ-108 作成＋DEC-055＋DEC-033 部分置換、
    OU-6: REQ-109 作成＋1行更新＋DEC-056＋DEC-034 部分置換）。各 OU は standard scale の単一 Definition
    変更として完結する。REQ・DEC の採番（REQ-104〜109、DEC-053〜056 は想定番号）は case-ready の
    採番スクリプトが確定する（artifact_actions の target: new:{slug} を参照）。
    新規要件行合計 52 行は単一 CREATE ドラフトの SPLIT 提案閾値（51 行超）に達するため、RU 領域別の
    6 OU 分解（各 REQ 7〜12 行で req-health-metrics の健全域内）を SPLIT 対処として確定済みである
    （入力プール一括処理・内部バッチ分割許可の実行指示に基づく）。
  wave_hints:
    - "Wave 1: OU-1（共通責務・工程構成の基礎。後続全 OU の前提）"
    - "Wave 2: OU-2、OU-3（OU-1 完了後に並列実行可能。OU-2 はゲート行更新を含むため優先）"
    - "Wave 3: OU-4、OU-5（OU-4 は OU-3 の変更影響モデルと境界を共有、OU-5 は OU-2 の正式確定概念に依存）"
    - "Wave 4: OU-6（v5 対象全体の確定後に移行境界を確定）"
```

# summary

ADF v5.0.0 世代交代要件（6 RU 一括入力プール）を要件化した。新規 REQ 6 件（想定 REQ-104〜109）で
v5 の6領域（基本責務と工程構成、成果物の意味と正式確定、差分・変更影響と増分更新、工程間追跡と品質検証の
責務分離、有限実行と責務再編、移行と互換性の境界）を所有し、v4 との直接衝突行 12 行を行 ID 不変で再定義、
Decision 4 件（想定 DEC-053〜056）を新設して DEC-033/034/037 を部分置換する。移行期の権威と評価可能性は
REQ-105-008・REQ-108-012 の移行期行で保証し、現行ワークフロー行の再定義は v4→v5 crosswalk
（realization_actions RA-006）へ委譲する。Jev 先行評価2件（STEP-3 照合、STEP-4 最終分類）と
アーキテクチャ助言（Oracle、4ラベル分類済み）を反映済み。
