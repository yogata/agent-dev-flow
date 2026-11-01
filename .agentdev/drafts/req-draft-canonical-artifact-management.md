---
draft_type: req_draft
topic_slug: canonical-artifact-management
status: draft
created_at: 2026-11-02T08:02:39+09:00
source_rus:
  - RU-0255
---

<!-- req_draft: RU-0255（正規成果物の照合・所有先判断・確実な反映）の要件定義ドラフト。
  基準 commit: 2cf2799802e7a4b3b312debc522044649bf99b19（main HEAD と一致確認済み）。
  入力: .agentdev/backlog/req-units/RU-0255.md（session由来RU。参照専用）、
  利用者指示（段階的実装指示のうち RU-0255 のみを今回の入力として処理。RU-0254〜RU-0260 は対象外）。 -->

# draft-data

```yaml
work_type: feature

scale: standard

summary: |
  RU-0255（正規成果物の照合・所有先判断・確実な反映）を要件定義した。変更駆動系経路（req-define と
  Definition 保存内部責務）の側の規範ギャップ（正規情報取得の fail-closed、持続的な目的・関心に基づく
  所有先判断、判断根拠の反映先までの維持、採用範囲と変更権限の維持、保存後の再取得と整合確認、
  中断・部分失敗後の安全な再実行、両利用経路での同一原則の成立）を REQ-004 への 7 要件行
  （REQ-004-069〜075）の APPEND として所有させる。工程駆動系経路の側は REQ-110 の既存行
  （110-001/009/017/019/020/021/026/027/029/030/033）が相当義務を既に所有しているため無変更とし、
  REQ-107/108/111 は参照接続のみとする（重複追加なし）。Design は新規行の design 対応として
  agentdev-req-file-manager（照合基準・保存確認/再実行）と req-define command（判断根拠・採用範囲・
  両経路原則）の 3 箇所に追記する。新規の中央判断機構・恒久的な照合台帳は設けない（RU の要件化の方向・
  利用者指示の基本原則に従う）。重要変更識別: 該当なし（既存行の意味変更を含まない増分追記のみ）。

auto_gate:
  auto_ready: false
  unresolved_questions:
    - "UQ-1（SPLIT 要否提案）: REQ-004 は現行 68 要件行（行数シグナル +1）。7 行の APPEND で 75 行となる。関心分類は単一（要求の形成と合意）と判断するが、アーティファクト種別数を厳格に数えると SPLIT シグナル合計 2 相当となり得るため、req-health-metrics Design の手順に従い SPLIT 要否を利用者へ提案する。本 draft の推奨は分割不要（追加行は既存関心内であり、REQ-004 は目的に定めるとおり横断基本契約として設計済み）。"
    - "UQ-2（REQ-110-017 の判断基準の非対称）: REQ-110-017 は所有先判断の基準（持続的な目的・関心、作業種別・部品一致・一括入力のみによる判断の禁止、変更不要の区別）を文言上明示しない。RU1-AC7（両経路で同じ基本原則）との整合のため、(a) REQ-110 への最小追記、(b) 現行文言（現在の正規成果物との照合により決定）からの導出で足りるとして無変更、のいずれかを選択する必要がある。architecture-advisory は (a) を推奨。本 draft は (b) を基準に REQ-110 を無変更として構成した。"
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons:
    - "利用者指示により、ドラフト保存後に case-auto・Issue 作成・実装へ進まず停止し、入力条件・保存先・判断待ちを報告する（監督者が忠実性を照合した後に同一セッションで継続）。"
    - "第1段階全体の AC1〜AC8 と検証事例 A〜H の本文は現時点で未取得のため、本 draft は RU-0255 本文に記載のある RU1-AC1〜AC7 の条件のみを検証対象とし、段階スコープの条件は捏造しない。"

agreed_items:
  - id: AG-001
    content: |
      有効な正規情報と採用判断の取得。既存REQ・Decision・Design の実ファイルから必要な範囲で正規情報を取得し、実在するREQの見落としや取得の失敗を該当なしとして扱わず、判断を保留して失敗の内容と不足を報告する（fail-closed）。正規ファイルの実内容と後続判断に用いた情報を照合し、現行と廃止済みの情報、採用済みと未採用・未決の内容を混同しない。
  - id: AG-002
    content: |
      要求内容ごとの所有先判断。REQ は持続的な目的・関心に基づいて管理し、適切な既存REQを優先して、独立した目的を持つ新要求のみ新規REQの候補とする。不具合修正や一時作業という作業種別、実装部品の一致、個別投入か一括投入かという入力の体裁だけを理由に、独立した目的を持つ要求を既存REQへ統合し、またはREQ変更の要否を決定しない。追加・更新・新規作成・変更不要・保留を内容ごとの目的・関心を基準に区別し、既存の要件行の規定だけで要求が成立する場合は重複する要件行を追加しない。
  - id: AG-003
    content: |
      判断根拠の維持。照合・操作分類の初期判断、要件doc（draft）、保存対象、実際の反映先を照合・追跡でき、選択した所有先と理由が追跡可能であること。初期判断と異なる所有先へ保存する場合は再判断の根拠を記録し、判断不能な部分は保留として無断で解決済みに扱わない。
  - id: AG-004
    content: |
      採用範囲と変更権限の維持。採用済み・未採用・採否不明の内容が混在し、同じファイル内に承認対象外の内容がある状態で、採用された対象・内容・範囲だけを変更し、工程駆動と変更駆動の権限境界を維持する。ファイルパスへの書込み権限の存在だけを根拠に、未承認の意味的変更を確定しない。重要変更では既存 REQ-108 に従う反映前通知と結果説明を確認し、通知を新たな承認の代替にせず、委任範囲内の変更へ不要な一律停止を追加しない。
  - id: AG-005
    content: |
      実際の反映結果の確認。既存REQの追加・更新、新規REQ、Design更新、必要なDecision作成・更新を正規保存経路で実行した後、保存結果の実体を再取得し、採用内容、既存の有効内容、識別子、必要な参照関係、索引、状態規則を照合する。意図した変更が正しく反映され、既存内容の意図しない消失・変更や必要な参照不整合が残らないことを確認して保存を完了とする。保存操作の成功だけを完了とはしない。
  - id: AG-006
    content: |
      部分反映・中断後の安全な再実行。書込み前、一部書込み後、保存後・検証前の各段階での中断、同一入力の再投入、判断不能内容との混在において、実際の正規状態から成立済み・未成立・保留を再構成し、未成立部分のみを継続する。重複作成、内容消失、誤改番、未検証の完了扱いを生じない。
  - id: AG-007
    content: |
      両利用経路での成立。変更駆動の req-define 系経路と工程駆動の phase-artifacts-update 系経路の双方を公開入口から正規保存・結果確認まで実行し、GitHub版・Local版の対象となる正規経路を含めて、共通の所有先判断・反映規則の成立と個別の採用権限の維持を確認する。部品試験だけが成功しても公開入口から成果物を更新できない場合は合格としない。実行できない必須経路は未検証とし、別経路の成功によって代替しない。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-004.md
    target_area: 要件
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007]
    content: |
      | REQ-004-069 | req-define は、既存REQ照合と要件展開に用いる正規情報を REQ・Decision・Design の実ファイルから必要な範囲で取得すること。実在するREQの見落としや取得の失敗を該当なしとして扱わず、判断を保留して失敗の内容と不足を報告すること。正規ファイルの実内容と判断に用いた情報を照合し、現行と廃止済みの情報、採用済みと未採用・未決の内容を区別なく判断材料へ混入しないこと |
      | REQ-004-070 | req-define の既存REQ照合と操作分類は、要求の持続的な目的・関心と既存REQの目的・所有範囲との対応を基準とすること。不具合修正や一時作業という作業種別、実装部品の一致、個別投入か一括投入かという入力の体裁だけを理由に、独立した目的を持つ要求を既存REQへ統合し、またはREQ変更の要否を決定しないこと。既存の要件行の規定だけで要求が成立する場合は変更不要として重複する要件行を追加せず、所有先を一意に決定できない内容は保留として候補と不足を報告すること（工程駆動系経路の相当義務は REQ-110 が所有する） |
      | REQ-004-071 | req-define は、照合・操作分類の判断とその根拠を、要件doc（draft）、保存対象、実際の反映先まで追跡可能な形で維持すること。初期判断と異なる所有先へ保存する場合は再判断の根拠を記録し、判断不能な部分は未決として保留し、無断で解決済みに扱わないこと |
      | REQ-004-072 | req-define および Definition 保存内部責務は、採用済み・未採用・採否不明の内容が混在する入力では、利用者の明示判断または有効な正規決定によって採用された対象・内容・範囲だけを保存対象とすること。保存先ファイルへの書込み権限や許可された編集範囲の存在だけを根拠に、採用されていない意味的変更を確定しないこと。重要変更の反映前通知と結果説明および通知と承認の区別は REQ-108 の規定に従うこと |
      | REQ-004-073 | Definition 保存内部責務は、REQ・Decision・Design の保存を実行した後、保存結果を正規ファイルから再取得し、採用内容、既存の有効内容、識別子、必要な参照関係、索引、状態規則を照合すること（README 整合確認と書込み時引用識別子実在検証はこの照合の構成要素とする）。意図した変更が反映され、既存内容の意図しない消失・変更や必要な参照不整合が残らないことを確認できて初めて保存を完了とし、保存操作の成功だけを保存の完了根拠としないこと |
      | REQ-004-074 | Definition 保存内部責務は、書込み前、一部書込み後、保存後・検証前の各段階での中断、および同一入力の再投入において、実際の正規状態から成立済み・未成立・保留を再構成し、未成立部分のみを継続すること（REQ-108-006 の既有義務の、Definition 保存内部責務での適用を明示する）。成立済み変更の重複適用、採用済み内容の消失、誤った採番、未検証のままの完了扱いを生じないこと |
      | REQ-004-075 | req-define 系経路（req-define と Definition 保存内部責務）における所有先判断、採用範囲の維持、保存結果の確認、中断後の再実行は、工程駆動系経路（phase-artifacts-update）の相当規律（REQ-110 が所有）と同じ基本原則に基づいて成立すること。この原則的一致を含む本条および関連条の成立は、公開入口から正規保存と保存結果の確認までの実経路で確認すること（局所試験だけでの完了判定の禁止は REQ-107-007 に従う） |
  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: docs/requirements/REQ-004.md
    target_area: 適用範囲
    source_items: [AG-007]
    content: |
      **対象**:

      - req-define コマンド
      - Definition 保存内部責務（case-ready / case-revise 委譲先）
      - 要件形成プロセス全体
      - ユーザー合意形成プロセス
      - 既存REQ照合と操作分類の判断根拠の維持、採用範囲の維持、保存結果の再取得と整合確認、中断・部分失敗後の再実行

      **対象外**:

      - Case 実行プロセス
      - Intake と Learning lifecycle
      - コード実装
      - テスト実行
      - 工程駆動系経路（phase 系操作）における反映先判断・採用規律の所有（REQ-110 が所有する。変更駆動経路側の対応は本 REQ が所有する）
  - id: ACT-DESIGN-001
    artifact: design
    operation: append
    target: docs/designs/skills/agentdev-req-file-manager.md
    target_design:
      operation: update
      domain: skills
      slug: agentdev-req-file-manager
    target_area: 提供する判断、操作
    source_items: [AG-001, AG-002]
    content: |
      ### 所有先判断の基準（RU-0255）

      照合・操作分類の判断基準は、要求の持続的な目的・関心と既存REQの目的・所有範囲との対応を第一基準とする。操作分類の5軸評価（対象コンポーネント、対象スコープ、目的の連続性、要件行追加可能性、独立目的の有無）は、目的の連続性と独立目的の有無を主軸として解釈し、対象コンポーネントと対象スコープの一致は補助材料とする。作業種別（不具合修正、一時作業等）、実装部品の一致、個別投入か一括投入かという入力の体裁だけを理由に、独立した目的を持つ要求を既存REQへ統合する運用は行わない。既存の要件行の規定だけで要求が成立する場合は変更不要（REQ操作なし）として重複する要件行を追加せず、所有先を一意に決定できない内容は保留として候補と不足を報告する。正規情報の取得に失敗した場合は該当なしとして扱わず、判断を保留して失敗の内容と不足を報告する（fail-closed）。
  - id: ACT-DESIGN-002
    artifact: design
    operation: append
    target: docs/designs/skills/agentdev-req-file-manager.md
    target_design:
      operation: update
      domain: skills
      slug: agentdev-req-file-manager
    target_area: 現在の動作
    source_items: [AG-005, AG-006]
    content: |
      ### 保存後の再取得・整合確認と中断後の再実行（RU-0255）

      保存内部責務は、REQ・Decision・Design の各保存操作の成功後、保存結果を正規ファイルから再取得し、採用内容、既存の有効内容、識別子、必要な参照関係、索引、状態規則を照合する。既存の書込み時引用識別子実在検証、インデックス・ハブ更新、局所矛盾防止、リモート同期と hash 検証の各手順をこの照合の構成要素として位置付ける。保存操作の成功報告だけを保存の完了根拠としない。

      中断・部分失敗後の再実行では、書込み前、一部書込み後、保存後・検証前の各段階を区別し、実際の正規状態（ファイル実在、要件行・識別子の採番状態、インデックス登録状態、frontmatter）から成立済み・未成立・保留を再構成して未成立部分のみを継続する。成立済み変更の重複適用、採用済み内容の消失、誤った採番、未検証の完了扱いを生じない。
  - id: ACT-DESIGN-003
    artifact: design
    operation: append
    target: docs/designs/commands/req-define.md
    target_design:
      operation: update
      domain: commands
      slug: req-define
    target_area: 現在の動作
    source_items: [AG-003, AG-004, AG-007]
    content: |
      ### 判断根拠の維持・採用範囲の維持・両経路共通原則（RU-0255）

      壁打ちからドラフト保存、Definition 保存までの各段階で、所有先判断（CREATE、APPEND、UPDATE、REQ操作なし、保留）とその根拠を draft-data（agreed_items、artifact_actions の source_items、conflict_resolutions）を通じて追跡可能に維持する。初期判断と異なる所有先へ保存する場合は再判断の根拠を記録する。判断不能な部分は未解決質問・保留として扱い、無断で解決済みにしない。

      採用済み・未採用・採否不明が混在する入力では、採用根拠照合（STEP-2）の結果に基づき採用された対象・内容・範囲だけを保存対象とする。保存先ファイルへの書込み権限や編集範囲の存在だけを根拠に、採用されていない意味的変更を確定しない。重要変更の反映前通知と結果説明は既存の通知契約（REQ-108）に従う。

      req-define 系経路の所有先判断、採用範囲の維持、保存結果の確認、中断後の再実行は、工程駆動系経路（phase-artifacts-update、REQ-110）に適用されるのと同じ基本原則に基づいて成立させる。両経路の成立は、公開入口から正規保存と保存結果確認までの実経路（GitHub版・Local版の対象経路を含む）で確認し、部品試験だけの成功をもって完了としない。

conflict_resolutions:
  - id: CR-001
    conflict: RU-0255 が主対象として REQ-004 と REQ-110 を挙げる一方、本 draft は REQ-110 を無変更とする構成の間の解釈の違い。
    resolution: |
      RU 自身が「対象候補のすべてを変更することは要求しない」「既存REQの規定だけで成立する要求は重複追加せず」と定めるため、工程駆動側は REQ-110 の既存行（110-001/009/017/019/020/021/026/027/029/030/033）で成立すると判断し無変更とした。所有状況の対応は review_dispositions（RD-002）に記録する。判断基準の文言上の非対称（110-017 が目的・関心基準等を明示しない）は UQ-2 として判断待ちとする。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0255
    target_req: REQ-004
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      既存REQ・Decision・Design が存在する状態、正規成果物が存在しない状態、複数の関連情報がある状態、取得に失敗する状態の4条件を用意し、公開入口（req-define）からの既存REQ照合を実行する。入力と採用状態、判断に用いた情報と正規ファイルの実内容を照合し、判断結果（所有先候補、保留）とあわせて記録する。
    pass_criteria: |
      RU1-AC1 のとおり、正規ファイルの実内容と後続判断に用いた情報を照合し、有効な情報を必要な範囲で取得でき、古い情報・未採用内容・未決事項と混同しないこと。実在するREQの見落とし、または取得失敗の「該当なし」扱いが1件でも検出された場合は不合格とする。
    on_failure: |
      fix-and-reverify。照合手順・取得経路の実装を修正して同一条件で再検証する。入力、採用状態、判断に用いた情報、正規ファイル実内容の各証拠を検証記録に残す。
  - id: TS-002
    target_item: AG-002
    verification: |
      RU1-AC2 の8事例（既存要求を満たす不具合修正でREQ変更が不要、既存REQの目的を拡張する要求で既存REQへの追加が必要、同じ部品を対象とするが独立した目的の新要求、恒久要求・既存REQ更新・一時作業を含む複数入力、同じ内容の個別投入と一括投入、Designのみの変更、既存要件行の修正、REQ・Decision・Designのいずれも変更不要）を用意し、照合・操作分類を実行して判断結果と根拠を記録する。
    pass_criteria: |
      内容ごとの目的・関心を基準に、追加・更新・新規作成・変更不要・保留を適切に選択できること。一括入力や対象部品の一致だけを理由に独立要求を統合した事例が1件でもあれば不合格とする。
    on_failure: |
      fix-and-reverify。照合基準・操作分類手順（matching-and-merge.md の5軸評価の主軸修正を含む）を修正して再検証する。
  - id: TS-003
    target_item: AG-003
    verification: |
      複数候補がある内容、新規REQ候補、所有先を一意に決められない内容を用いて req-define を実行し、初期判断、ドラフト（draft-data の agreed_items・artifact_actions・conflict_resolutions）、保存対象、実際の反映先を突合する。
    pass_criteria: |
      RU1-AC3 のとおり、選択した所有先と理由を追跡でき、変更した場合は再判断の根拠があり、判断不能な部分を保留できていること。初期判断と異なる所有先へ理由なく保存していれば不合格とする。
    on_failure: |
      fix-and-reverify。判断根拠の記録構造（draft-data の追跡経路）を修正して再検証する。
  - id: TS-004
    target_item: AG-004
    verification: |
      採用済み・未採用・採否不明の内容が混在し、同じファイル内に承認対象外の内容がある状態を用意し、Definition 保存内部責務（case-ready / case-revise 経路）での保存を実行する。重要変更を含む場面では、REQ-108-016/017 に従う反映前通知と結果説明の実行時記録を確認する。
    pass_criteria: |
      RU1-AC4 のとおり、採用された対象・内容・範囲だけが変更され、工程駆動と変更駆動の権限境界が維持されること。通知が新たな承認の代替となっておらず、委任範囲内の変更へ不要な一律停止が追加されていないこと。ファイルパスが許可されていることだけを理由に未承認の意味的変更を確定した事例が1件でもあれば不合格とする。
    on_failure: |
      fix-and-reverify。採用範囲の判定・保存対象の絞り込み実装を修正して再検証する。
  - id: TS-005
    target_item: AG-005
    verification: |
      既存REQの追加・更新、新規REQ、Design更新、必要なDecision作成・更新を正規保存経路（Definition 保存内部責務）で実行し、保存後に実体を再取得して、採用内容、既存の有効内容、識別子、必要な参照関係、索引、状態規則を照合する。既存の検証契約（README 整合確認、書込み時引用識別子実在検証）がこの照合の構成要素として機能することを含めて確認する。
    pass_criteria: |
      RU1-AC5 のとおり、意図した変更が正しく反映され、既存内容の意図しない消失・変更や必要な参照不整合が残らないこと。保存操作の成功だけで完了とした扱いが1件でもあれば不合格とする。
    on_failure: |
      fix-and-reverify。保存後照合手順を修正して再検証する。
  - id: TS-006
    target_item: AG-006
    verification: |
      書込み前、一部書込み後、保存後・検証前の各段階での中断、同一入力の再投入、判断不能内容との混在を再現し、再実行時に実際の正規状態（ファイル実在、採番状態、インデックス登録状態、frontmatter）との突合を行う。
    pass_criteria: |
      RU1-AC6 のとおり、実際の正規状態から成立済み・未成立・保留を再構成し、未成立部分のみ継続できること。重複作成、内容消失、誤改番、未検証の完了扱いが1件でも発生したら不合格とする。
    on_failure: |
      fix-and-reverify。中断段階別の再構成手順を修正して再検証する。
  - id: TS-007
    target_item: AG-007
    verification: |
      変更駆動の req-define 系経路（req-define → Definition 保存内部責務）と工程駆動の phase-artifacts-update 系経路の双方を公開入口から正規保存・結果確認まで実行する。GitHub版・Local版の対象となる正規経路を含め、配布物投影同期（src/common → .opencode）の確認も含める。必要な検証環境・権限が不足する経路は未検証として記録する。
    pass_criteria: |
      RU1-AC7 のとおり、共通の所有先判断・反映規則が両経路で成立し、個別の採用権限が維持されること。部品試験だけが成功し公開入口から成果物を更新できない経路がある場合、当該経路は不合格として扱う。
    on_failure: |
      fix-and-reverify。実装起因の場合は該当経路の接続を修正して再検証する。検証環境・権限の不足に起因する場合は不合格と断定せず blocked（未検証）として記録し、判断が必要な事項として報告する（別経路の成功で代替しない）。

realization_actions:
  - id: RA-001
    concern: 既存REQ照合・操作分類の判断基準の修正（目的・関心基準の一次化、種別・部品一致・入力体裁のみによる判断の禁止、変更不要・保留の区分、取得失敗の fail-closed）
    responsibility: agentdev-req-file-manager の照合方法論（5軸評価の主軸解釈）と req-define workflow の既存REQ照合 STEP が判断基準を本件基準に従って解釈・適用する。REQ・Decision・Design 各ファイル管理スキルの保存経路とトレーサビリティ sidecar の対応宣言が新規行（REQ-004-069〜075）の design/verification 対応として登録される。
    ownership_hints:
      - "src/common/skills/agentdev-req-file-manager/references/matching-and-merge.md（5軸評価・判定フローの主軸修正）"
      - "docs/designs/skills/agentdev-req-file-manager.md（ACT-DESIGN-001）"
      - "src/common/skills/agentdev-workflow-req-define/references/requirement-development.md（STEP-3 照合手順への反映）"
      - "traceability/agentdev-req-file-manager.yaml、traceability/agentdev-workflow-req-define.yaml（sidecar 対応登録）"
    intent: 作業種別・実装部品の一致・一括入力の体裁を過度に重視した所有先判断（REQ-117 型の不適切な一括集約の再発）を防ぎ、目的・関心基準による追加・更新・新規作成・変更不要・保留の区別を両経路で成立させる。
    verification_refs: [TS-001, TS-002]
    source_items: [AG-001, AG-002]
  - id: RA-002
    concern: 判断根拠の維持と採用範囲の維持の経路接続（壁打ち→draft-data→Definition 保存への追跡、採用根拠照合の保存対象への適用）
    responsibility: req-define workflow の採用根拠照合（STEP-2）と draft-data の追跡構造（agreed_items、artifact_actions.source_items、conflict_resolutions）が Definition 保存内部責務の分類ゲート・文書分類適合確認と接続し、採用された範囲だけが保存対象となる。
    ownership_hints:
      - "src/common/skills/agentdev-workflow-req-define/references/input-and-dialogue.md、requirement-development.md"
      - "src/common/skills/agentdev-req-file-manager/references/save-procedure.md（分類ゲート・文書分類適合確認）"
      - "docs/designs/commands/req-define.md（ACT-DESIGN-003）"
    intent: 初期判断と保存内容の不一致、判断根拠の喪失、パス許可だけを根拠とした未承認の意味的変更の確定を防ぐ。
    verification_refs: [TS-003, TS-004]
    source_items: [AG-003, AG-004]
  - id: RA-003
    concern: 保存後の再取得・整合確認の確立（採用内容・既存の有効内容・識別子・参照関係・索引・状態規則の照合、既存検証契約の構成要素化）
    responsibility: Definition 保存内部責務（case-ready / case-revise 委譲先）の保存手順が、REQ・Decision・Design 各保存（agentdev-req-file-manager / agentdev-decision-file-manager / agentdev-design-file-manager）で保存後の再取得と照合を実行し、agentdev-artifact-validation の公開検証契約を構成要素として利用する。
    ownership_hints:
      - "src/common/skills/agentdev-req-file-manager/references/save-procedure.md（保存後照合ステップの明確化）"
      - "src/common/skills/agentdev-decision-file-manager、src/common/skills/agentdev-design-file-manager（Decision/Design 保存経路の同等手順）"
      - "src/common/skills/agentdev-artifact-validation（公開検証契約）"
      - "docs/designs/skills/agentdev-req-file-manager.md（ACT-DESIGN-002）"
    intent: 保存操作の成功と採用内容の実反映を区別し、意図しない消失・変更や参照不整合の残存を保存完了前に検出する。
    verification_refs: [TS-005]
    source_items: [AG-005]
  - id: RA-004
    concern: 部分反映・中断後の安全な再実行の確立（中断段階別の再構成、未成立部分のみの継続、重複適用・誤採番防止）
    responsibility: Definition 保存内部責務の保存手順が、書込み前・一部書込み後・保存後検証前の各段階での中断と同一入力再投入において、実際の正規状態からの再構成と未成立部分のみの継続を実行する。既存のリモート同期・hash 検証手順と接続する。
    ownership_hints:
      - "src/common/skills/agentdev-req-file-manager/references/save-procedure.md（中断段階別再開手順）"
      - "src/common/skills/agentdev-workflow-case-ready、agentdev-workflow-case-revise（Definition 保存の呼出元 STEP）"
      - "docs/designs/skills/agentdev-req-file-manager.md（ACT-DESIGN-002）"
    intent: 中断・部分失敗後の再実行で重複作成、内容消失、誤改番、未検証の完了扱いを生じない（REQ-108-006 の Definition 保存での適用）。
    verification_refs: [TS-006]
    source_items: [AG-006]
  - id: RA-005
    concern: 両利用経路の接続確認（工程駆動側既存規律との等価性確認、GitHub版・Local版実経路検証、投影同期）
    responsibility: phase-artifacts-update（agentdev-workflow-phase-artifacts-update）の既存規律（REQ-110-017/019/021 等）が RU1-AC1〜AC7 の工程駆動側を満たすことを確認し、不足が判明した場合のみ最小修正する。新規行（REQ-004-069〜075）の design/verification 対応を sidecar へ登録し、配布物投影同期を完了する。REQ-110-017 の判断基準の非対称（UQ-2）の対応方針確定後、(a) 選択時は REQ-110 への最小追記を本 Case の変更へ組込む。
    ownership_hints:
      - "src/common/skills/agentdev-workflow-phase-artifacts-update（工程駆動側の接続確認。必要時のみ最小修正）"
      - "traceability/agentdev-workflow-req-define.yaml、traceability/agentdev-req-file-manager.yaml（sidecar 対応登録）"
      - "GitHub版・Local版の検証環境・権限（REQ-108-024、REQ-111-011 の両版検証規律に従う）"
    intent: 共通の所有先判断・反映規則が両経路で成立し、部品試験だけでなく公開入口からの実経路で証明できる状態にする。
    verification_refs: [TS-007]
    source_items: [AG-007]

review_dispositions:
  - id: RD-001
    source_ru: RU-0255
    source_item: 主対象REQ（REQ-004）
    disposition: covered
    reason_code: addressed_by_this_draft
    reason: |
      本 draft の ACT-REQ-001（REQ-004-069〜075 の APPEND）と ACT-REQ-002（適用範囲の更新）で対応する。REQ-004 の目的（req-define プロセスと Definition 保存内部責務の横断基本契約）の範囲内の追加であり、既存行の意味変更を含まない。
    evidence:
      path: docs/requirements/REQ-004.md
      section: 要件
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0255
    source_item: 主対象REQ（REQ-110）
    disposition: covered
    reason_code: already_satisfied
    reason: |
      工程駆動側は REQ-110 の既存行（110-001 工程特定の保留・報告、110-009 部分反映・再投入、110-017 反映先の照合による解決と保留、110-019/020/021 保存規則と結果の再構成、110-026/027 受領の再投入、110-029/030/033 採用根拠の限定）が相当義務を既に所有するため追加変更不要と判断した。RU が「対象候補のすべてを変更することは要求しない」と定めるため。判断基準の文言上の非対称は UQ-2 として判断待ちとする。
    evidence:
      path: docs/requirements/REQ-110.md
      section: 要件
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_ru: RU-0255
    source_item: 関連要件（REQ-107、REQ-108、REQ-111）
    disposition: not_applicable
    reason_code: out_of_scope_owned_elsewhere
    reason: |
      保存検証の構造/意味分離は REQ-107-007/009、重要変更の反映前通知・通知と承認の区別は REQ-108-014〜024、採用・未決状態の維持は REQ-111-017/018 が所有する。本 draft はこれらを参照接続のみとし、重複追加しない。
    evidence:
      path: docs/requirements/REQ-108.md
      section: 要件
      checked_at_commit: null
    related_removed_items: []
  - id: RD-004
    source_ru: RU-0255
    source_item: 検証範囲と証拠（第1段階のA〜E、F、G、H）
    disposition: not_applicable
    reason_code: out_of_scope_stage_verification
    reason: |
      段階全体の検証事例A〜Hと段階AC1〜AC8の本文は現時点で未取得のため、本 draft では対象とせず捏造しない。本 draft の test_strategy は RU-0255 本文に記載のある RU1-AC1〜AC7 の条件（AC2 の8事例を含む）のみを検証対象とする。段階検証は RU-0256 以降を含む第1段階全体の検証スコープで実施する。
    evidence:
      path: null
      section: null
      checked_at_commit: null
    related_removed_items: []
  - id: RD-005
    source_ru: RU-0255
    source_item: 対象外（実行作業の構成を管理するためだけのREQ新設、REQ-117の自動的な分割・廃止、独立した意味判断機構の一律新設、工程遷移や下流全工程への更新・再検証完遂、変更のたびに全正規成果物を再生成する仕組み）
    disposition: not_applicable
    reason_code: out_of_scope_ru_exclusion
    reason: |
      本 draft はいずれも含まない。REQ-117 は背景の不適切な一括集約の過去事例としての参照のみ。下流全工程への更新・再検証完遂は RU-0259 側のスコープ。新規台帳・中央判断機構は RU の要件化の方向と利用者指示の基本原則により設けない。
    evidence:
      path: docs/requirements/REQ-117.md
      section: 目的
      checked_at_commit: null
    related_removed_items: []

assembly_evidence:
  - target_file: docs/designs/skills/agentdev-req-file-manager.md
    target_content_sha256: 21cbd50b02f4c0aba6b063256c01cb50733b501859459d6060d95d8c4ed4d98d
    check_scope:
      heading: "## 提供する判断、操作"
      start_line: 24
      end_line: 33
    execution_conditions:
      operation: append
      edit_sha256: f6847dcbcc9afc4c4d7677a65374cc98737b9e33d6ee2918b66cb7bdef57ab76
      expected_old_count: null
    checker:
      name: assemble-draft-section
      version: 0.2.0
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: target section only
    checks_summary:
      pre:
        count: 2
        all_ok: true
      post:
        count: 2
        all_ok: true
    diff_compact:
      changed_lines_count: 4
      added: 4
      removed: 0
    executed_at: "2026-11-01T23:00:14.635Z"
  - target_file: docs/designs/skills/agentdev-req-file-manager.md
    target_content_sha256: 21cbd50b02f4c0aba6b063256c01cb50733b501859459d6060d95d8c4ed4d98d
    check_scope:
      heading: "## 現在の動作"
      start_line: 38
      end_line: 45
    execution_conditions:
      operation: append
      edit_sha256: b761c5b2f7d8779738fc2507f97315a8d96afb303066267217bed22116f18119
      expected_old_count: null
    checker:
      name: assemble-draft-section
      version: 0.2.0
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: target section only
    checks_summary:
      pre:
        count: 2
        all_ok: true
      post:
        count: 2
        all_ok: true
    diff_compact:
      changed_lines_count: 6
      added: 6
      removed: 0
    executed_at: "2026-11-01T23:00:14.736Z"
  - target_file: docs/designs/commands/req-define.md
    target_content_sha256: 1b9d46bcc2ada763b335fed0c9fc0eaec047657fd1bf7b8764da1debc0c6b629
    check_scope:
      heading: "## 現在の動作"
      start_line: 54
      end_line: 119
    execution_conditions:
      operation: append
      edit_sha256: bd1b71e550d116129915f0b802fe97e0520af858979a6b0c5a13b914711d2e59
      expected_old_count: null
    checker:
      name: assemble-draft-section
      version: 0.2.0
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: target section only
    checks_summary:
      pre:
        count: 2
        all_ok: true
      post:
        count: 2
        all_ok: true
    diff_compact:
      changed_lines_count: 8
      added: 8
      removed: 0
    executed_at: "2026-11-01T23:00:14.827Z"

case_open_hints:
  epic_needed: false
  wave_hints: []
```

# summary

- 対象は RU-0255 のみ。RU-0254〜RU-0260 は今回の入力として処理していない（RU-0256 以降は後続の個別の req-define 実行で処理する。本 draft の所有先判断を固定的な一括分類として後続 RU へ適用しないこと）。
- Jev 先行評価（観測 20261101T225558Z-c1c8、confidence 0.44）は q1 帰属を「REQ操作なし」と判定したが、最終判断は従来基準により「APPEND（REQ-004）」として確定した（差異理由: semantic_disagreement。既存行から RU1-AC1〜AC7 の合格/不合格条件が導出不能であるため）。要件展開の最終分類は「REQ行」、Design 分離は「あり」（手順詳細は Design/実現面へ分離）。
- architecture-advisory の助言（確定事項 5、推定事項 3、ユーザー確認事項 2、ブロッカー 0）のうち、表現規律（経路別適用・引用形式、REQ-047 を単独の一般根拠としない）を採用反映した。ユーザー確認事項①（REQ-110-017 の非対称）は UQ-2 として判断待ち、②（075 の phase 側 Design 参照の要否）は RA-005 に組込んだ。
- REQ-004 表行追記（ACT-REQ-001）と適用範囲更新（ACT-REQ-002）の本文はモデル生成として作成し、実ファイル突合（表列構造 2 列、## 要件 テーブルの最終行が REQ-004-068、## 適用範囲 の対象/対象外箇条書き構造、新行 ID 069〜075 の未使用）を完了している。design 3 件は assemble-draft-section（v0.2.0）による構造・変更前提検査・差分・完結性検査に合格し、証拠を assembly_evidence に記録した。
- 5観点境界の case-specific risk は test_strategy へ投影済み（dependency: TS-007、execution: TS-003/004、build/runtime: TS-005、environment propagation: TS-007、client/server: 対象変更なし）。
- 重要変更識別: 該当なし（既存行の意味変更を含まない増分追記のみ）。本 draft 保存後、case-auto・Issue 作成・実装へ進まず停止する（利用者指示）。
