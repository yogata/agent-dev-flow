---
draft_type: req_draft
topic_slug: issue-tracking-system
status: saved
design_actions_consumed: true
created_at: "2026-08-23T10:07:55+09:00"
source_rus:
  - RU-0002
---

# draft-data

```yaml
work_type: feature

scale: large

summary: |
  RU-0002(session由来、合意成立済み)に基づき、ADF へ課題管理機構を導入する。
  未解決事項を docs/issue-list/ に1課題1ファイルで永続管理し(状態は各ファイル自身が保持、
  解決済みとクローズ済みを区別)、課題管理能力を複数 workflow から利用可能な共通 Capability Skill
  として提供し、/agentdev/issue を自然言語の公開入口とする。
  Intake / Learning、GitHub Issue、Decision、RU とは別系統の責務として分離する。
  実装時に初期課題「サブエージェント探索責務分割の要否」を保留状態で登録する。
  課題管理系統の導入は新規 Decision として記録し、文書体系拡張(REQ-001-001、
  document-model、artifact-responsibilities)を伴う。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      課題の対象と他成果物との境界。
      課題管理は、要件定義、方式設計、HLD、LLD、パラメータ設計、実装、レビュー、検証、外部確認等で
      生じた未解決事項を、発生から検討、保留、解決、正規成果物への反映確認まで継続して追跡する。
      対象を設計判断だけ、実装課題だけ、特定の成果物粒度だけに限定しない。
      課題の解決結果は Decision、REQ、HLD、LLD、その他の Design、パラメータ設計、RU、実装、検証方法、
      対応不要という結論のいずれにもなり得る。課題起票時点で反映先を決め打ちしない。
      課題管理は「まだ解決していない問い、問題、確認事項、判断待ち事項」を管理し、
      Decision(解決結果のうち判断理由を保持すべきもの)、RU(変更実施が必要と判断された変更要求)、
      GitHub Issue(req/case パイプラインの実装対象作業単位)、Intake / Learning(AI 駆動開発の改善循環)
      とは別系統の責務として分離する。
  - id: AG-002
    content: |
      課題成果物の配置、管理単位、識別、状態。
      正規配置先は docs/issue-list/ とし、課題ファイルは永続的な git 管理対象の正規成果物として
      .agentdev/ 配下の一時成果物とは扱いを区別する。
      1課題につき1ファイルとし、課題の状態によってディレクトリを移動しない。
      各課題ファイル自身が状態を保持し、解決済み、クローズ済みの課題も同一体系内で履歴として追跡できる。
      各課題は一意な課題 ID を持ち、GitHub Issue 番号と明確に識別できる
      (接頭辞、採番規則、ファイル名規則の詳細は Design が確定する)。
      状態は少なくとも未着手、検討中、保留、解決済み、クローズ済みの意味を表現できる
      (具体的な保存値は Design が確定する)。
      解決済み(課題に対する結論が出た状態)とクローズ済み(必要な正規成果物への反映、
      または反映不要の確認まで完了した状態)は区別する。
      課題ファイルは検討経過を保持する履歴系文書であり、文意品質検査における現行文書基準の
      適用対象とは区別される(検査区分の詳細は Design が確定する)。
  - id: AG-003
    content: |
      課題に保持する情報。
      課題は課題 ID、件名、状態、課題内容、背景、影響、関連成果物、現時点の選択肢、判断材料・証拠、
      不足情報、担当、期限、再評価条件、検討経過、結論、反映先、クローズ確認の情報を保持できる。
      担当、期限等、課題によって不要な項目は空値または省略可能とする。
      保留状態では、原則として「なぜ現在判断できないか」と「何が成立すれば再評価するか」を識別できる。
      解決済みでは結論を保持し、クローズ時は反映先または反映不要の理由を確認できる。
  - id: AG-004
    content: |
      エージェンティックな課題管理能力。
      課題管理は単なるファイル形式ではなく、ADF エージェントが利用可能な共通能力として提供する。
      少なくとも検知、新規起票、検索・参照、更新、検討経過の追加、保留、再評価、解決、反映確認、
      クローズ、再オープンの操作能力を持つ。
      課題管理能力は特定の単一 workflow に閉じず、要件定義、設計、レビュー、実装、検証等の
      複数 workflow から利用可能である。
      内部構成は現行 ADF の Command / Workflow Skill / Capability Skill の責務分離に従い Design で
      確定する。単なる操作差だけを理由として Skill を不必要に細分化しない。
      課題管理 Capability Skill は既存の GitHub Issue 管理 skill(agentdev-issue-management)と
      区別される名称と責務を持つ(最終命名は Design が確定する)。
  - id: AG-005
    content: |
      /agentdev/issue 公開入口と自然言語操作、コマンド非依存。
      課題管理の人間向け公開入口として /agentdev/issue を提供する。
      ユーザーに add、list、update、resolve、close、reopen 等のサブコマンド、引数、操作文法の
      暗記を要求しない。ユーザーは自然言語で意図を伝え、課題管理側が現在の会話文脈、対象課題、
      状態等から必要な操作を判断する(内部実装で明示的な操作種別を持つことは禁止しない)。
      課題管理能力の利用に /agentdev/issue の明示実行を必須としない。
      ADF workflow が未解決事項を認識した場合、必要に応じて課題管理能力を利用できる。
      ユーザーが明示的に課題登録を指示しなかったことだけを理由に、将来の設計、実装、検証、
      合意に影響する未解決事項を会話コンテキストだけへ残さない。
  - id: AG-006
    content: |
      課題化判定と自律性の境界。
      すべての疑問、TODO、一時エラーを課題化しない。
      少なくとも、現在の作業で解決できず、かつ将来の設計、実装、検証、合意等に影響する
      未解決事項を課題化候補とする。
      正規成果物の確認等によってその場で解決可能な疑問は、原則として課題化前に解決を試みる。
      同一論点の不必要な重複起票を避け、既存課題の検索を起票前に実行できる。
      エージェントによる課題管理は既存の承認、判断境界を迂回しない。
      ユーザー合意が必要な設計判断を課題管理能力自身が勝手に確定しない。
      一方、既に正規成果物または現在の会話で結論が確定している場合は、その結果を課題へ反映可能とする。
  - id: AG-007
    content: |
      課題の再評価。
      保留課題を単に保存して忘れる状態にしない。
      再評価条件を持つ課題について、関連する作業、設計、レビュー、分析等を行う際に条件成立を確認できる。
      すべての ADF コマンド実行時に docs/issue-list/ 全文を読み込むことを要求しない。
      課題 ID、状態、関連成果物、再評価条件等を利用し、必要な課題へ効率的に到達できる設計とする
      (到達機構の詳細は Design が確定する)。
      再評価後は次のいずれかを選択できる。
      結論が出た場合は解決済みとする。
      まだ判断できない場合は、理由と不足情報を更新して保留を継続する。
      課題自体が消滅した場合は、対応不要という結論で解決する。
      必要な変更が確定した場合は、解決結果を正規成果物へ反映し、必要に応じて RU 化する。
  - id: AG-008
    content: |
      課題解決後の反映。
      課題管理能力自身が Decision、REQ、HLD、LLD 等すべての成果物更新責務を直接所有する必要はない。
      課題管理では少なくとも何が結論となったか、どこへ反映すべきか、実際に反映されたかを追跡する。
      成果物更新そのものは、その成果物を所有する ADF 能力へ委譲してよい。
      課題をクローズする前に、必要な反映が完了していること、または反映不要であることを確認する。
      解決済みだが反映が完了していない課題をクローズ済みとして扱わない。
  - id: AG-009
    content: |
      初期課題の登録。
      本要件の実装時に、課題管理機構の最初の実課題として「サブエージェント探索責務分割の要否」を
      docs/issue-list/ に保留状態で登録する。
      判断材料: 改善前分析では、read を伴う97論理実行単位のうち68単位で、異なる子セッション間の
      同一 path 参照が確認された。
      現時点で判断しない理由: 観測されている重複には工程間の文脈引き継ぎ不足、
      source / projection の二重探索、必要な独立検証、サブエージェントの探索責務自体の重複が
      混在する可能性がある。RU-0001 では前二者を含む改善と検証価値の観測可能化を実施しており、
      その効果を観測する前に構造を変更すると原因と効果を分離できない。
      再評価条件: RU-0001 の改善を実運用へ反映した後、通常の ADF 開発を一定量継続し、
      改善前と同じ観点で比較可能な OpenCode セッション履歴が十分に蓄積したこと
      (単に時間が経過したことではなく、改善後の実行実績が比較可能になったこと)。
      再分析事項: 子セッション間の同一 path 再読込、source / projection 由来の重複を除いた残存重複、
      工程間の文脈引き継ぎ不足による重複、独立検証として必要な重複、同種検証による新規 finding の有無、
      残存する不要な探索重複、残存重複の token 消費への影響。
      再評価結果の分岐: 不要(必要な重複である、または RU-0001 によって十分改善された場合は
      探索責務分割を実施せず解決・クローズ)、判断不能(原因分離または実績が不足する場合は
      理由を追記して保留継続)、必要(不要な探索重複が有意に残り分割が有効と判断した場合は
      解決し、その変更を新規 RU として要件化)。
      課題管理から直接実装へ進めない。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: create
    target: new:issue-tracking-system
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007, AG-008, AG-009]
    content: |
      ## 目的

      ADF へ、一般的なシステム開発で用いられる課題管理の仕組みを導入する。

      要件定義、方式設計、HLD、LLD、パラメータ設計、実装、レビュー、検証、外部確認等で生じた
      未解決事項を、発生から検討、保留、解決、正規成果物への反映確認まで継続して追跡できるようにする。

      課題管理は、Intake / Learning 等の AI 駆動開発におけるループエンジニアリングとは別系統として扱う。

      ## 要件

      | ID | 要件 |
      |---|---|
      | REQ-049-001 | 課題管理は、要件定義、方式設計、HLD、LLD、パラメータ設計、実装、レビュー、検証、外部確認等で生じた未解決事項を、発生から検討、保留、解決、正規成果物への反映確認まで継続して追跡できること |
      | REQ-049-002 | 課題の対象を設計判断だけ、実装課題だけ、特定の成果物粒度だけに限定しないこと。課題の解決結果は Decision、REQ、HLD、LLD、その他の Design、パラメータ設計、RU、実装、検証方法、対応不要という結論のいずれにもなり得ること |
      | REQ-049-003 | 課題起票時点で反映先を決め打ちしないこと |
      | REQ-049-004 | 課題管理を Intake / Learning(AI 駆動開発の改善循環)、GitHub Issue(req/case パイプラインの作業単位)、Decision(判断理由を保持すべき解決結果)、RU(変更要求)とは別系統の責務として分離すること |
      | REQ-049-005 | 課題の正規配置先を `docs/issue-list/` とすること。課題ファイルは永続的な git 管理対象の正規成果物であり、`.agentdev/` 配下の一時成果物とは扱いを区別すること |
      | REQ-049-006 | 1課題につき1ファイルで管理し、課題の状態によってディレクトリを移動しないこと。各課題ファイル自身が状態を保持すること |
      | REQ-049-007 | 解決済み、クローズ済みの課題も課題管理の履歴として同一体系内で追跡できること |
      | REQ-049-008 | 各課題は一意な課題 ID を持ち、GitHub Issue 番号と明確に識別できること(接頭辞、採番規則、ファイル名規則の詳細は Design が確定すること) |
      | REQ-049-009 | 課題の状態は少なくとも未着手、検討中、保留、解決済み、クローズ済みの意味を表現できること(具体的な保存値は Design が確定すること) |
      | REQ-049-010 | 解決済み(課題に対する結論が出た状態)とクローズ済み(必要な正規成果物への反映、または反映不要の確認まで完了した状態)を区別すること |
      | REQ-049-011 | 課題は課題 ID、件名、状態、課題内容、背景、影響、関連成果物、現時点の選択肢、判断材料・証拠、不足情報、担当、期限、再評価条件、検討経過、結論、反映先、クローズ確認の情報を保持できること(課題によって不要な項目は空値または省略可能とすること) |
      | REQ-049-012 | 保留状態の課題は、なぜ現在判断できないかと、何が成立すれば再評価するかを識別できること |
      | REQ-049-013 | 解決済みの課題は結論を保持すること。クローズ時は反映先または反映不要の理由を確認できること |
      | REQ-049-014 | 課題ファイルは検討経過を保持する履歴系文書であり、文意品質検査における現行文書基準の適用対象と区別されること(検査区分の詳細は Design が確定すること) |
      | REQ-049-015 | 課題管理の操作能力(検知、新規起票、検索・参照、更新、検討経過の追加、保留、再評価、解決、反映確認、クローズ、再オープン)を ADF エージェントが利用可能な共通能力として提供すること |
      | REQ-049-016 | 課題管理能力は特定の単一 workflow に閉じず、要件定義、設計、レビュー、実装、検証等の複数 workflow から利用可能であること |
      | REQ-049-017 | 課題管理能力の内部構成は現行 ADF の Command / Workflow Skill / Capability Skill の責務分離に従い Design で確定すること。単なる操作差だけを理由として Skill を不必要に細分化しないこと |
      | REQ-049-018 | 課題管理 Capability Skill は既存の GitHub Issue 管理 skill(`agentdev-issue-management`)と区別される名称と責務を持つこと(最終命名は Design が確定すること) |
      | REQ-049-019 | `/agentdev/issue` を課題管理の人間向け公開入口として提供すること |
      | REQ-049-020 | ユーザーにサブコマンド、引数、操作文法の暗記を要求しないこと。ユーザーは自然言語で意図を伝え、課題管理側が現在の会話文脈、対象課題、状態等から必要な操作を判断すること(内部実装で明示的な操作種別を持つことは禁止しない) |
      | REQ-049-021 | 課題管理能力の利用に `/agentdev/issue` の明示実行を必須としないこと |
      | REQ-049-022 | ADF workflow が未解決事項を認識した場合、必要に応じて課題管理能力を利用できること。ユーザーが明示的に課題登録を指示しなかったことだけを理由に、将来の設計、実装、検証、合意に影響する未解決事項を会話コンテキストだけへ残さないこと |
      | REQ-049-023 | すべての疑問、TODO、一時エラーを課題化しないこと。現在の作業で解決できず、かつ将来の設計、実装、検証、合意等に影響する未解決事項を課題化候補とすること。正規成果物の確認等によってその場で解決可能な疑問は、原則として課題化前に解決を試みること |
      | REQ-049-024 | エージェントによる課題管理は既存の承認、判断境界を迂回しないこと。ユーザー合意が必要な設計判断を課題管理能力自身が勝手に確定しないこと。既に正規成果物または現在の会話で結論が確定している場合は、その結果を課題へ反映可能とすること |
      | REQ-049-025 | 保留課題を単に保存して忘れる状態にしないこと。再評価条件を持つ課題について、関連する作業、設計、レビュー、分析等を行う際に条件成立を確認できること |
      | REQ-049-026 | すべての ADF コマンド実行時に `docs/issue-list/` 全文を読み込むことを要求しないこと。課題 ID、状態、関連成果物、再評価条件等を利用し、必要な課題へ効率的に到達できる設計とすること(到達機構の詳細は Design が確定すること) |
      | REQ-049-027 | 再評価後は、結論が出た場合は解決済みとすること、まだ判断できない場合は理由と不足情報を更新して保留を継続すること、課題自体が消滅した場合は対応不要という結論で解決すること、必要な変更が確定した場合は解決結果を正規成果物へ反映し必要に応じて RU 化すること、のいずれかを選択できること |
      | REQ-049-028 | 課題管理能力自身が Decision、REQ、HLD、LLD 等すべての成果物更新責務を直接所有する必要はないこと。課題管理では少なくとも何が結論となったか、どこへ反映すべきか、実際に反映されたかを追跡し、成果物更新はその成果物を所有する ADF 能力へ委譲してよいこと |
      | REQ-049-029 | 課題をクローズする前に、必要な反映が完了していること、または反映不要であることを確認すること |
      | REQ-049-030 | 本要件の実装時に、課題管理機構の最初の実課題として「サブエージェント探索責務分割の要否」を保留状態で `docs/issue-list/` に登録すること。当該課題は判断材料(改善前分析で read を伴う97論理実行単位のうち68単位で異なる子セッション間の同一 path 参照を確認)、現在判断しない理由(RU-0001 の改善効果を観測する前に構造を変更すると原因と効果を分離できない)、再評価条件(RU-0001 の改善を実運用へ反映した後、改善前と同じ観点で比較可能な OpenCode セッション履歴が十分に蓄積したこと)、再分析事項(子セッション間の同一 path 再読込、source / projection 由来の重複を除いた残存重複、工程間の文脈引き継ぎ不足による重複、独立検証として必要な重複、同種検証による新規 finding の有無、残存する不要な探索重複、残存重複の token 消費への影響)、再評価結果の分岐(不要の場合は探索責務分割を実施せず解決・クローズ、判断不能の場合は理由を追記して保留継続、必要の場合は解決して当該変更を新規 RU として要件化)を保持すること。課題管理から直接実装へ進めないこと |

      ## 適用範囲

      ### 対象

      - 課題管理機構(課題成果物、課題管理能力、`/agentdev/issue` 公開入口、再評価、反映追跡、初期課題登録)
      - `docs/issue-list/` 導入に伴う文書体系への拡張(REQ-001-001 の文書種別リスト、文書7分類モデル、成果物責任表)

      ### 対象外

      - Intake / Learning パイプラインへの統合
      - GitHub Issue による課題管理への置換
      - すべての課題を Decision 化すること
      - 課題起票時点で反映先を固定すること
      - 課題管理から直接実装を開始すること
      - ユーザーに課題管理用 CLI 構文の暗記を要求すること
      - 課題 ID の接頭辞、採番規則、ファイル名規則、状態の具体的保存値、Skill 分割の最終構成、`/agentdev/issue` の内部実装構成、再評価の到達機構の詳細(Design が確定する事項)
  - id: ACT-DEC-001
    artifact: decision
    operation: create
    target: new:issue-tracking-system
    source_items: [AG-001, AG-002]
    content: |
      # 課題管理系統の導入

      ## Status

      proposed

      ## Context

      ADF には、システム開発中に生じた未解決事項(設計判断待ち、確認事項、判断保留中の問い)を
      発生から解決、正規成果物への反映確認まで継続追跡する正規成果物系統が存在しなかった。

      近接する既存系統はいずれもこの責務を担わない。

      - Intake / Learning: AI 駆動開発の改善循環(検出事項、学びの取り込み)を扱う。
      - GitHub Issue: req/case パイプラインで実装対象となった作業単位であり、未解決期間の問いの保持を目的としない。
      - Decision: 課題を解決した結果のうち、判断理由を保持すべきものを扱う。解決後の正規化手段であり、未解決期間の追跡手段ではない。
      - RU: 課題解決後に変更実施が必要と判断された場合の変更要求を扱う。

      REQ-001 は課題追跡を版管理履歴、廃止文書と並ぶ履歴保持機構として参照しており(REQ-001-015、REQ-001-035)、
      課題、変更要求の状態管理を課題追跡系に一元化する前提を置いているが、その実体が docs/ 体系に存在していなかった。

      ## Decision

      課題管理を独立した正規成果物系統として `docs/issue-list/` に導入する。

      - 課題は1課題1ファイルとし、状態によってディレクトリを移動せず、各課題ファイル自身が状態を保持する。
      - 解決済み(結論が出た状態)とクローズ済み(正規成果物への反映または反映不要の確認完了状態)を区別し、
        解決・クローズ後も同一体系内で履歴として追跡する。
      - 課題ファイルは永続的な git 管理対象の正規成果物とし、`.agentdev/` 配下の一時成果物とは扱いを区別する。
      - 課題管理能力は Capability Skill として共通提供し、複数 workflow から利用する。
      - `/agentdev/issue` を自然言語の単一公開入口とする。
      - 課題管理を Intake / Learning、GitHub Issue、Decision、RU とは別系統の責務とする。

      ## Alternatives Considered

      - GitHub Issue による管理: req/case パイプラインの作業単位と混線し、リポジトリ外部依存を
        正規追跡に持ち込むため却下した。
      - Decision / REQ への吸収: 未解決事項の保持と解決結果の正規化は時制も責務も異なるため却下した。
      - `.agentdev/` 一時成果物としての配置: 一時成果物は消費成功後に削除され、永続文書からの
        根拠参照に使用できないため、解決・クローズ後も追跡する履歴体系の要件に反するとして却下した。

      ## Consequences

      - docs/ の文書種別が拡張される(REQ-001-001)。
      - 文書7分類モデル(document-model Design)と成果物責任表(artifact-responsibilities Design)に
        課題追跡系統が追加される。
      - 課題ファイルは検討経過を保持する履歴系文書として、文意品質検査の現行文書基準とは
        検査対象区分が区別される。
      - 課題 ID 体系、状態保存値、Skill 分割、効率的到達機構の詳細は Design が確定する。
  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: docs/requirements/REQ-001.md
    source_items: [AG-002]
    content: |
      REQ-001-001 を次の内容へ更新する(文書種別リストへ課題追跡を追加)。

      | ID | 要件 |
      |---|---|
      | REQ-001-001 | 文書種別(要件、判断記録、設計、案内、報告、索引、状態早見、課題追跡)ごとの責務は重複せず、各文書の配置基準が一意に定まること |

      更新理由: 課題管理系統の導入(RU-0002、新規 REQ)により `docs/issue-list/` が正規配置先として
      加わるため。REQ-001-015、REQ-001-035 が課題追跡系を履歴保持・状態一元化の前提として
      既に参照しており、本更新はその実体化に伴う文書種別リストの拡張である。
  - id: ACT-DESIGN-001
    artifact: design
    operation: create
    target_design:
      operation: create
      domain: commands
      slug: issue
    source_items: [AG-005, AG-006]
    content: |
      `/agentdev/issue` command Design。

      - 公開入口としての責務: 自然言語入力の受け付け、現在の会話文脈・対象課題・状態からの
        操作種別判定(検知、新規起票、検索、参照、更新、検討経過追加、保留、再評価、解決、
        反映確認、クローズ、再オープン)。
      - サブコマンド、引数、操作文法をユーザーに要求しない自然言語インターフェースの設計。
        内部実装で明示的な操作種別を持つことは禁止しない。
      - Workflow Skill への委譲構造(Command / Workflow Skill / Capability Skill 責務分離に従う)。
      - ガードレール: 編集スコープを課題ファイル操作へ限定、既存の承認・判断境界の迂回禁止、
        ユーザー合意が必要な設計判断の代理確定禁止。
      - 課題化判定の実行位置(現在の作業で解決できず将来に影響する未解約事項の候補判定、
        正規成果物確認による事前解決の試行、重複起票防止のための既存課題検索)。
  - id: ACT-DESIGN-002
    artifact: design
    operation: create
    target_design:
      operation: create
      domain: skills
      slug: agentdev-issue-tracking
    source_items: [AG-002, AG-003, AG-004, AG-006, AG-007, AG-008]
    content: |
      課題管理 Capability Skill Design(slug は候補。最終命名は本 Design が確定する)。

      - 課題ファイル形式の詳細: 課題 ID の接頭辞、採番規則、ファイル名規則(GitHub Issue 番号と
        明確に識別できること)、frontmatter スキーマ、状態の具体的保存値(未着手、検討中、保留、
        解決済み、クローズ済みの5意味の表現)、保持情報(課題 ID、件名、状態、課題内容、背景、影響、
        関連成果物、選択肢、判断材料、不足情報、担当、期限、再評価条件、検討経過、結論、反映先、
        クローズ確認)の格納形式、保留状態における再評価条件の記述形式。
      - 操作能力(検知、新規起票、検索・参照、更新、検討経過追加、保留、再評価、解決、反映確認、
        クローズ、再オープン)の実行手順と Skill 内構成(操作単位の references/ 分割または
        単一 Skill 構成。単なる操作差だけを理由とした不必要な細分化禁止)。
      - 既存 GitHub Issue 管理 skill(agentdev-issue-management)との命名・責務境界の明示
        (新スキルは docs/issue-list/ 課題管理を、既存スキルは GitHub Issue 操作手続きを担う)。
      - 複数 workflow からの利用契約(/agentdev/issue 明示実行を必須としない共有能力としての公開方法)。
      - 効率的到達機構: 全 ADF コマンド実行時の docs/issue-list/ 全文読込を要求しない設計
        (課題 ID、状態、関連成果物、再評価条件を利用した索引・検索手段。詳細形式は本 Design が確定)。
      - 反映追跡と委譲: 反映先成果物の所有する ADF 能力への更新委譲、クローズ前の反映確認手順、
        解決済み未反映課題のクローズ抑止。
      - 検査対象区分: 課題ファイルを検討経過を保持する履歴系文書として定義し、
        文意品質検査の現行文書基準との適用区分を明示。
  - id: ACT-DESIGN-003
    artifact: design
    operation: update
    target: docs/designs/foundations/document-model.md
    target_area: 文書7分類モデル
    source_items: [AG-002]
    content: |
      文書7分類モデルへ課題追跡分類を追加する(8分類への拡張、または相当の定義追加)。

      追加する分類の要点:

      - 課題追跡: `docs/issue-list/` 配下の課題ファイル。未解決事項の発生から検討、保留、解決、
        正規成果物への反映確認までを追跡し、解決・クローズ後も履歴として保持する永続文書。
        検討経過を保持する履歴系文書であり、現行文書基準(検討過程を本文に含まない)の適用対象外。
      - 責務マトリックスへ課題ファイルの行を追加し、近接系統(Intake / Learning、GitHub Issue、
        Decision、RU)との責務境界を明記する。

      既存7分類(REQ、挙動Design、カタログDesign、guide、learning維持、作業記録、対象外)のいずれにも
      課題ファイルは適合しない(作業記録は一時性を前提とし、恒久課題ファイルは収まらない)ための拡張である。
  - id: ACT-DESIGN-004
    artifact: design
    operation: update
    target: docs/designs/responsibilities/artifact-responsibilities.md
    target_area: 成果物責任表
    source_items: [AG-004, AG-008]
    content: |
      成果物責任表へ課題管理系統の行を追加する。

      追加行の要点:

      - 成果物: 課題ファイル(`docs/issue-list/`)。
      - 正規所有者: 課題管理 Capability Skill(最終命名は skill Design が確定)。
      - 責務: 未解決事項の追跡(検知、起票、検索、更新、保留、再評価、解決、反映確認、クローズ、再オープン)。
      - 反映先成果物の更新は当該成果物を所有する ADF 能力へ委譲し、課題管理側は反映要否の追跡に徹する。

conflict_resolutions:
  - id: CR-001
    conflict: .agentdev/ 一時成果物領域(REQ-008)との配置境界の懸念。課題ファイルを .agentdev/ へ置く案は一時成果物の削除契約と永続追跡要件が矛盾する。
    resolution: |
      課題ファイルは docs/issue-list/ の永続 git 管理成果物とし、REQ-008 の一時成果物スコープ外とする。
      新 REQ の対象外節で .agentdev/ 一時成果物ではないことを明示し、REQ-008 本文の編集は不要
      (根拠: REQ-008-001〜003、REQ-001-030)。
  - id: CR-002
    conflict: 既存配布 skill `agentdev-issue-management`(GitHub Issue 操作の安全手続き)と新規課題管理 Capability Skill の名称・責務の衝突可能性。
    resolution: |
      既存 skill は改名せず、新 Capability Skill は区別される別名(候補: agentdev-issue-tracking。
      最終命名は skill Design が確定)とする。要件行 REQ-049-018 で区別を要求する。
      改名案は case-open/close/update の対称更新コストが高く意味利得に見合わないため不採用。
  - id: CR-003
    conflict: REQ-001-001 の文書種別リストに課題追跡が含まれず、docs/issue-list/ 導入により文書種別の網羅性が崩れる。
    resolution: 競合ではなく拡張として REQ-001 UPDATE(ACT-REQ-002)で処理する。REQ-001-015、REQ-001-035 が課題追跡系を既に前提しており整合する。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0002
    target_req: new:issue-tracking-system
    operation: create
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: epic
    result:
      saved_req_docs:
        - REQ-049
      updated_req_rows:
        - REQ-001-001
      saved_decisions:
        - DEC-020
      action_mapping:
        ACT-REQ-001: { artifact: req, operation: create, saved: REQ-049 }
        ACT-REQ-002: { artifact: req, operation: update, saved: REQ-001, rows: [REQ-001-001] }
        ACT-DEC-001: { artifact: decision, operation: create, saved: DEC-020 }
      source_ru_mapping:
        RU-0002: [ACT-REQ-001, ACT-REQ-002, ACT-DEC-001]
      case_open_input:
        target_req: REQ-049
        req_rows: REQ-049-001〜REQ-049-030
        decision: DEC-020

test_strategy:
  - id: TS-001
    target_item: AG-005
    verification: |
      /agentdev/issue に自然言語で新規課題の起票を指示する(例: 「この論点を課題として残して」)。
      生成された課題ファイルを docs/issue-list/ で確認する。
    pass_criteria: |
      指示内容を反映した課題ファイルが1課題1ファイルで生成されている。課題 ID が一意に付与され、
      状態が frontmatter または相当の形式で保持され、件名、課題内容等の必須情報が保持されている。
    on_failure: |
      fix-and-reverify。起票またはファイル形式の実装不具合であるため、修正して再検証する。
  - id: TS-002
    target_item: AG-005
    verification: |
      /agentdev/issue に自然言語で未解決課題の検索・確認を指示する(例: 「未解決の課題を確認したい」)。
    pass_criteria: |
      サブコマンドや引数の指定なしに、未解決課題の一覧または該当課題の内容が応答される。
    on_failure: |
      fix-and-reverify。自然言語解釈または検索の実装不具合であるため、修正して再検証する。
  - id: TS-003
    target_item: AG-005
    verification: |
      既存課題を自然言語で更新、保留、解決、クローズする指示を /agentdev/issue へ与える
      (例: 「サブエージェント探索重複の課題を再検討して」)。
    pass_criteria: |
      指示に対応する課題ファイルの状態、検討経過、結論等が更新される。クローズ指示では反映確認が
      先行し、解決済み未反映の課題はクローズされない。
    on_failure: |
      fix-and-reverify。状態遷移または反映確認の実装不具合であるため、修正して再検証する。
  - id: TS-004
    target_item: AG-004
    verification: |
      /agentdev/issue を明示実行せずに、課題管理 Capability Skill を他の workflow または skill から
      参照・利用する構成を確認する(例: 要件定義 workflow からの未解決事項の課題化)。
    pass_criteria: |
      課題管理能力が /agentdev/issue を経由せず利用できる経路が実装・文書化されている。
    on_failure: |
      fix-and-reverify。共有能力としての公開契約の実装不具合であるため、修正して再検証する。
  - id: TS-005
    target_item: AG-006
    verification: |
      既に登録済みの論点と同一内容の課題起票を自然言語で指示する。
    pass_criteria: |
      既存課題の検索が実行され、同一論点の重複起票が行われない、または既存課題への統合・参照が提案される。
    on_failure: |
      fix-and-reverify。重複防止策の実装不具合であるため、修正して再検証する。
  - id: TS-006
    target_item: AG-007
    verification: |
      保留状態の課題について、再評価条件を後から取得する操作を自然言語で実行する。
    pass_criteria: |
      保留理由(なぜ現在判断できないか)と再評価条件(何が成立すれば再評価するか)が取得できる。
    on_failure: |
      fix-and-reverify。保留課題の情報保持の実装不具合であるため、修正して再検証する。
  - id: TS-007
    target_item: AG-007
    verification: |
      課題数を複数件用意した状態で、代表する ADF コマンド実行時の docs/issue-list/ への読込範囲を
      確認する( trace ログまたは手順書の確認)。
    pass_criteria: |
      すべての ADF コマンド実行時に docs/issue-list/ 全文読込を要求する構成になっていない。
      課題 ID、状態、関連成果物、再評価条件等を利用した到達手段が設計・実装されている。
    on_failure: |
      fix-and-reverify。効率的到達機構の実装不具合であるため、修正して再検証する。
  - id: TS-008
    target_item: AG-008
    verification: |
      解決結果を Decision へ反映する課題を用意し、解決から反映確認、クローズまでを通しで実行する。
    pass_criteria: |
      Decision への反映が decision 管理能力へ委譲されて実行され、反映完了が確認された後に
      課題がクローズされる。反映先が課題ファイルに記録される。
    on_failure: |
      fix-and-reverify。反映委譲またはクローズ確認の実装不具合であるため、修正して再検証する。
  - id: TS-009
    target_item: AG-008
    verification: |
      解決結果を HLD、LLD 等の Design へ直接反映する課題を用意し、同様に通しで実行する。
    pass_criteria: |
      Design 更新が当該成果物を所有する能力へ委譲されて実行され、反映確認後に課題がクローズされる。
    on_failure: |
      fix-and-reverify。反映委譲の実装不具合であるため、修正して再検証する。
  - id: TS-010
    target_item: AG-008
    verification: |
      解決の結果対応不要と結論した課題を用意し、解決からクローズまでを実行する。
    pass_criteria: |
      対応不要という結論とその理由が課題ファイルに保持され、反映不要の確認をもってクローズされる。
    on_failure: |
      fix-and-reverify。対応不要系の状態遷移の実装不具合であるため、修正して再検証する。
  - id: TS-011
    target_item: AG-002
    verification: |
      解決済み(結論保持済み)だが正規成果物への反映が未完了の課題に対してクローズを指示する。
    pass_criteria: |
      当該課題はクローズ済みとならず、反映完了または反映不要の確認を求められる。
    on_failure: |
      fix-and-reverify。状態区別の実装不具合であるため、修正して再検証する。
  - id: TS-012
    target_item: AG-002
    verification: |
      課題 ID の付与規則(接頭辞、形式)を GitHub Issue 番号と比較して確認する。
    pass_criteria: |
      課題 ID と GitHub Issue 番号が機械的にも人間にも混同できない形式で付与されている。
    on_failure: |
      fix-and-reverify。ID 体系の実装不具合であるため、修正して再検証する。
  - id: TS-013
    target_item: AG-009
    verification: |
      本要件の実装完了後、docs/issue-list/ の初期課題「サブエージェント探索責務分割の要否」を確認する。
    pass_criteria: |
      初期課題が保留状態で登録され、判断材料(68/97 同一 path 参照)、現在判断しない理由、
      再評価条件(RU-0001 改善の実運用反映後の比較可能なセッション履歴蓄積)、再分析事項(7項目)、
      再評価結果の分岐(不要、判断不能、必要→新規 RU 化)が保持されている。
    on_failure: |
      fix-and-reverify。初期課題登録の実装不具合であるため、修正して再検証する。

review_dispositions:
  - id: RD-001
    source_ru: RU-0002
    source_item: RU-0002
    disposition: covered
    reason_code: adopted_in_full
    reason: |
      RU-0002 の全内容(課題成果物、管理能力、/agentdev/issue、再評価、反映、初期課題登録、対象外)を
      新規 REQ の要件行、Decision、Design actions へ展開して採用した。
      RU 本文のうち Design 委筆事項(ID 体系、状態保存値、Skill 分割、内部実装構成)は
      artifact_actions の design エントリへ分離した。RU は合意成立済み(session由来、
      agreement_confirmed_at: 2026-08-23T00:09:00+09:00)であり、内容の取捨選択は発生していない。
    evidence:
      path: .agentdev/backlog/req-units/RU-0002.md
      section: null
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: true
  decomposition:
    - "Wave 1 文書体系正規化: REQ-049 作成、REQ-001-001 更新、Decision 作成、document-model 文書7分類モデル拡張、artifact-responsibilities 成果物責任表追加(中間不整合を残さないため同一 Wave で完了させる)"
    - "Wave 2 課題管理 Capability Skill 実装: skill 定義、skill Design、課題ファイル形式、効率的到達機構"
    - "Wave 3 公開入口とガイド: /agentdev/issue command 定義、command Design、workflow skill、README 入口表、コマンド選択、成果物・状態モデル等 guides 更新(Wave 2 と並行可)"
    - "Wave 4 初期課題登録と全体確認: 初期課題「サブエージェント探索責務分割の要否」の保留登録、test strategy の通し確認"
  wave_hints:
    - "Wave 2、Wave 3 は Wave 1 の文書種別確定後に開始する(相互依存は Wave 1 が所有)"
    - "Wave 4 は Wave 2、Wave 3 完結後に実施する(実課題には能力と入口の両方が必要)"
```

# summary

RU-0002(合意成立済み)を入力に、ADF 課題管理機構の要件docを作成した。

- 新規 REQ 1件(要件行30行)+ Decision 1件(課題管理系統の独立導入)+ REQ-001-001 更新 + Design 4件(command、capability skill、document-model、artifact-responsibilities)を artifact_actions として統合。
- 課題の正規配置先は `docs/issue-list/`(永続 git 管理成果物、`.agentdev/` 一時成果物と区別)。
- Design 委譲事項(課題 ID 体系、状態保存値、Skill 分割、内部実装、到達機構)は要件本文から分離済み。
- work_type: feature、scale: large(影響ファイル 10 超の実装スコープシグナル)。Epic 構成を case-open へ hints 提示(Wave 4 段階)。
- 実行時の留意: `/agentdev/issue` という公開コマンド名は GitHub Issue 系 case-* コマンドと「Issue」語が重複する混淆リスクがある(アーキテクチャ助言のユーザー確認事項)。RU-0002 の合意内容ではあるため本 draft では採用したが、名称変更を望む場合は壁打ちに差し戻せる。
