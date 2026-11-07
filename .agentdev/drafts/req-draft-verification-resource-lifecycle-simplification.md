---
draft_type: req_draft
topic_slug: verification-resource-lifecycle-simplification
status: draft
created_at: "2026-11-08T02:03:07+09:00"
source_rus: [RU-0270]
---

# draft-data

```yaml
work_type: feature

scale: large

summary: >-
  RU-0270（2026-11-08 利用者承認済み。session由来RU、自己ホスティング契約により通常入力として処理）に基づき、
  検証に伴う一時資材の管理を、詳細台帳・OS全域走査・帰属推測・一律の利用者削除承認・作成先拒否などの過剰機構から、
  ADFと実行担当の責務分担と後片付けを含む作業完遂責任の共通方針へ再構成する。REQ-118 を9行体系ごと再構成し
  （行IDは安定IDとして維持）、REQ-032-043/044 を必要な回収結果・証拠の評価へ置換し、REQ-003・REQ-017 に
  境界整合と検証義務・裁量の区別を追加する。Design は verification-resource-lifecycle.md を全面改稿し、
  v4-delegation-contracts・case-close・custom-tool-contracts・case-ready の各節を整合させる。
  Decision は新規作成しない（DEC-001 決定1〜4・DEC-036 維持分・DEC-038 決定(3)・DEC-048 決定(2)(4) の適用として
  architecture-advisory が2026-11-08に確定。ブロッカー・未決事項なし）。実装層（機械工程の縮小改編、台帳系
  モジュール・テストの撤去、agentdev_gh 両実装の判定内容適合、adapter SKILL 文言、knowledge 返却条件、索引追随）は
  realization_actions（RA-001〜RA-006）として構造化し、AC-01〜AC-11 と検証方針・判定の原則を test_strategy
  （TS-001〜TS-012）へ投影した（文言の省略・弱化・反転なし）。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: >-
      共通の作業完遂原則。ADFが管理する作業では、実行担当が許可された範囲で一時的な資材を作成・利用できること。
      実行担当は、作業に伴って発生させた一時資材を把握し、必要な成果物と検証証拠を保存したうえで、利用終了時に
      安全に回収すること。継続利用する資材は、適切な管理責任者へ引き継ぐこと。回収または引継ぎが成立していない
      場合は、未処理事項として報告し、完全完了として扱わないこと。この原則は検証作業を中心に、ADF管理下の
      一時的な副作用を伴う作業へ共通して適用する。
  - id: AG-002
    content: >-
      ADFと実行担当の責務分担。ADFは、作業目的、対象範囲、受け入れ条件、必要な検証水準と環境条件、許可・禁止する
      副作用の境界、実行担当への作業条件の引渡し、実行結果と必要な証拠に基づく完了評価を所有する。実行担当
      AIエージェントは、具体的な検証方法の選択、必要な資材の準備・作成・利用、作業中に発見された追加的な環境条件への
      対応、一時資材の安全な回収と結果確認、未回収事項・確認不能事項・引継ぎ事項の報告を所有する。ハーネスは実行機構を
      提供する。ADFは、ハーネス固有の内部状態や起動方式、資材管理の実装方法を共通契約へ取り込まない。
  - id: AG-003
    content: >-
      検証環境条件の引渡し。要件定義や実行準備の段階で、通常と異なる検証環境の必要性が判明している場合は、その
      必要条件（環境の種別、検証範囲、利用上の制約、後片付け責任）を既存の実行契約に反映すること。具体的な
      ファイル名、作業用ディレクトリ名、削除コマンド、内部的な管理方法まで事前に確定する必要はないこと。実行時に
      初めて環境の必要性が判明した場合は、実行担当が既存の許可範囲に基づいて対応すること。必要な副作用が許可範囲を
      超える場合は、既存の停止・判断経路を利用し、許可範囲を独断で拡張しないこと。通常の小規模変更では、特殊な
      検証環境の計画や管理記録を一律に要求しないこと。
  - id: AG-004
    content: >-
      一時資材の配置と利用。通常の短命な一時ファイルやディレクトリは、原則として実行環境の標準的な一時領域に
      作業専用の領域を確保して利用すること。必要な場合は、既存の配置規則と権限に従い、リポジトリ内の作業領域や
      許可された外部環境を利用できること。利用終了時に不要な資材を回収すること。
  - id: AG-005
    content: >-
      安全な自律回収と同一性保護。安全な自動回収は、少なくとも次の条件が成立する範囲に限定する。当該作業が作成した
      専用資材であることを確認できること、回収対象の範囲を特定できること、正式な成果物、必要な証拠、他の作業や
      利用者が管理する資材を失わないこと、回収操作が既存の副作用・承認境界に適合すること。回収直前に具体的対象の
      同一性・範囲を確認し、同名別物、PID再利用、共有物、リンク先、正式な成果物と証拠を保護する。判断できないものは
      削除しない。専用台帳や同一性確認の新基盤を必須にしない。条件が不明確な既存資材、共有資材、管理者が常備する
      環境は、自動削除しない。作業専用一時資材の回収に利用者の都度承認を一律に要求しない。
  - id: AG-006
    content: >-
      常備する検証環境と引継ぎ。管理者が常備する検証環境については、個別作業の終了時に環境全体を削除せず、
      定められた利用終了・状態復旧・返却条件を満たすこと。新しい外部資材の作成・削除は既存の許可境界に従うこと。
      引継ぎは受け手、対象、状態、残る処置、権限と、受領または既存の常設受入条件への適合を確認して成立させること。
      管理者への通知だけを移転成立としないこと。管理者の後続処置が残ることと実行担当の返却責任が成立することを
      区別すること。新しい確認フォームや毎回の人間の応答は一律に要求しない。
  - id: AG-007
    content: >-
      実行結果と完了評価。実行担当は、検証結果に加え、必要な後片付けの実施結果、確認根拠、未処理事項を既存の作業記録
      経路へ返すこと。ADFは、既存の受け入れ評価を通じて、検証義務と後片付け義務の成立を確認すること。実行したという
      申告だけで、要求された後片付けの成立を認めないこと。確認可能な具体的な資材については、提示された証拠が回収
      または引継ぎを実際に立証しているかを評価すること。一方、ADFが管理・観測していない任意の資材について、機械的に
      不存在を完全証明することまでは要求しないこと。証拠不足、回収失敗、引継ぎ不成立、確認不能を区別し、必須条件が
      未達の場合は完全完了としないこと。中止・失敗・異常終了は、既存の停止・再開経路で扱うこと。作業の中止と、後片付けを
      含む全責任の完遂を混同しないこと。子Issueと親Caseの責任範囲は区別し、親が引き受けた横断的な後処理義務だけを
      理由に、条件を満たした子Issueの完了を禁止しないこと。終了操作後にしか実施できないADF自身の後処理については、
      終了前の受理判定と区別し、後処理失敗が残る場合はワークフロー全体の完遂を報告しないこと。既知の残件・回収失敗・
      必要な証拠不足は未達として扱う一方、観測も報告もされていない任意資材の不在を完全に証明する義務は追加しない。
  - id: AG-008
    content: >-
      既存機構の簡素化。一時資材の作成・回収を実行担当へ委ねる方針に合わせ、既存の一時資材管理機構を再構成する。
      次の仕組みは原則として撤去対象とする。すべての検証用一時資材を対象とした詳細台帳、作成操作を制御しない登録処理に
      よる機械的作成保証、OS全域のプロセス・待受ポート等の探索、資材名やプロセス属性等からの案件帰属推測、未登録資材の
      完全検出を前提とする終了拒否、作業専用一時資材への一律の利用者削除承認、上記の機構を維持するためだけの除外・補正・
      重複照合処理。ただし、ADF自身が管理する資材の回収、外部副作用の権限制御、受け入れ条件に基づく終了操作の機械的な
      安全境界は維持すること。既存機構の撤去に伴い不要となる文書、参照、状態、試験、実装を整理すること。削除する実装が
      別の有効な要件を担っている場合は、その責務を失わせず、必要な部分を維持または既存機構へ統合すること。旧機構が
      存在しないことを理由に、新たな資材管理基盤やOS全域監視を追加しない。
  - id: AG-009
    content: >-
      正式成果物と一時資材の役割分類と証跡保存の維持。正式な成果物（実装、テストコード、必要なテストデータ・期待結果・
      環境再現スクリプト、正式な手順文書）は対象repoに登録して維持し、テスト実行で生成したデータ、clone、検証用remote、
      ログ、専用process等は一時資材として回収対象に分類する。拡張子、testという名前、git追跡済みという事実だけで
      分類しない。検証の必要な結果（入力、対象版、操作、実結果、失敗、訂正、判定理由）は本体Issue/PRへ保存し、回収した
      一時資材へのアクセスなしで読み戻して理解できる。全生ログ、環境一式、Git bundleを別保管庫へ移して恒久保持する方式は
      採らず、機械判定のためにローカル生ログの永久保持を要求しない。
  - id: AG-010
    content: >-
      委譲時の副作用境界と許可された一時検証環境の整合。REQ-003 の委譲時の副作用の許可境界について、作業ツリー外変更の
      禁止は正式な成果物への変更を対象とするものであり、既存の配置規則と権限に従う一時的な検証資材の作成・利用、
      許可された外部検証環境の使用をそれ自体で禁止しないことを明確化する。必要な副作用が許可範囲を超える場合は、
      既存の停止・判断経路を利用し、許可範囲を独断で拡張しない。
  - id: AG-011
    content: >-
      実行契約における検証義務・必須手段の保持と未指定手段の裁量。実行契約へ、合意された検証義務、証明水準、権限、
      および利用者等が必須と指定した検証手段を保持する。一方、必須指定のない内部手順や環境の具体化は、許可範囲内で
      実行担当が選べるようにする。現行の検証方法をすべて永久に固定する方針ではない。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-118.md
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007, AG-008, AG-009]
    content: |-
      REQ-118 全体再構成（frontmatter の title を「検証に伴う一時資材の取扱いと後片付け責任」へ更新し、目的・要件・適用範囲を次のとおり置き換える。要件行の ID は安定 ID として維持する）:

      ## 目的

      Case実行に伴う一時的な副作用（検証用の一時資材、作業環境、外部検証環境の利用）について、ADFと実行担当の責務分担と後片付けを含む作業完遂責任の共通契約を所有する。検証用remote、clone、bare repository、退避ログ、補助スクリプト、専用server・process等がCaseやEpicの終了後に残存する状態を排除するとともに、資材の把握と回収を作成・委譲入口の機械的登録に依存させない。本再構成は、旧機構（詳細台帳、作成時機械登録、close時の全観測照合、OS全域走査、帰属推測、一律の利用者削除承認、作成先拒否）が要求する未登録作成の完全機械検出を実現できず、統制の対象と手法がDEC-001の統制是正原則（決定3のhard governance 8点限定、決定4の新規統制既定不追加）に照らして過剰・不適切であったことの是正である（RU-0270、2026-11-08 利用者承認）。
      完了判定工程での評価条件と終了拒否はcase-close実行契約（REQ-032）が、worktree構造上の一時ファイル配置分類はworktree構造的制約REQ（REQ-018）が、検証証跡の必須要素と保存様式の一般契約は完了報告と成果物品質ゲートREQ（REQ-007）とCase Issue工程記録モデルREQ（REQ-101）が、委譲時の副作用の許可境界は委譲時の判断・承認・副作用境界REQ（REQ-003）が所有する。本REQはこれらと重複する要件行を持たず、一時的な副作用を伴う作業の完遂責任の共通契約に限定する。

      ## 要件

      | ID | 要件 |
      |---|---|
      | REQ-118-001 | ADFの管理する作業では、実行担当が許可された範囲で一時的な資材を作成・利用できること。実行担当は、作業に伴って発生させた一時資材を把握し、必要な成果物と検証証拠を保存したうえで、利用終了時に安全に回収すること。継続利用する資材は、適切な管理責任者へ引き継ぐこと。回収または引継ぎが成立していない場合は、未処理事項として報告し、完全完了として扱わないこと。この原則は検証作業を中心に、ADFの管理下で一時的な副作用を伴う作業へ共通して適用すること（AG-001） |
      | REQ-118-002 | ADFは、作業目的、対象範囲、受け入れ条件、必要な検証水準と環境条件、許可・禁止する副作用の境界、実行担当への作業条件の引渡し、実行結果と必要な証拠に基づく完了評価を所有すること。実行担当AIエージェントは、具体的な検証方法の選択、必要な資材の準備・作成・利用、作業中に判明した追加的な環境条件への対応、一時資材の安全な回収と結果確認、未回収事項・確認不能事項・引継ぎ事項の報告を所有すること。ハーネス固有の内部状態、起動方式、資材管理の実装方法を共通契約へ取り込まないこと（AG-002、AG-003） |
      | REQ-118-003 | 正式な成果物（実装、テストコード、必要なテストデータ・期待結果・環境再現スクリプト、正式な手順文書）は対象repoに登録して維持し、テスト実行で生成したデータ、clone、検証用remote、ログ、専用process等は一時資材として回収対象に分類すること。拡張子、testという名前、git追跡済みという事実だけで分類しないこと（AG-009） |
      | REQ-118-004 | 通常の短命な一時ファイルやディレクトリは、原則として実行環境の標準的な一時領域に作業専用の領域を確保して利用すること。必要な場合は、既存の配置規則と権限に従い、リポジトリ内の作業領域や許可された外部環境を利用できること。具体的なファイル名、作業用ディレクトリ名、削除コマンド、内部的な管理方法を事前に確定することを一律に要求しないこと（AG-003、AG-004） |
      | REQ-118-005 | 利用終了時に不要な資材を回収すること。安全な自動回収は、当該作業が作成した専用資材であることを確認できること、回収対象の範囲を特定できること、正式な成果物、必要な証拠、他の作業や利用者が管理する資材を失わないこと、回収操作が既存の副作用・承認境界に適合することの各条件が成立する範囲に限定すること。回収直前に具体的対象の同一性・範囲を確認し、同名別物、識別子の再利用、共有物、リンク先、正式な成果物と証拠を保護すること。判断できないものは削除しないこと。条件が不明確な既存資材、共有資材、管理者が常備する環境は自動削除しないこと。作業専用一時資材の回収に利用者の都度承認を一律に要求しないこと（AG-005） |
      | REQ-118-006 | 管理者が常備する検証環境は個別作業の終了時に環境全体を削除せず、定められた利用終了・状態復旧・返却条件を満たすこと。新しい外部資材の作成・削除は既存の許可境界に従うこと。引継ぎは、受け手、対象、状態、残る処置、権限と、受領または既存の常設受入条件への適合を確認して成立させること。管理者への通知だけを移転成立と扱わず、管理者の後続処置が残ることと実行担当の返却責任が成立することを区別すること。新しい確認フォームや毎回の人間の応答を一律に要求しないこと（AG-006） |
      | REQ-118-007 | 検証の必要な結果（入力、対象版、操作、実結果、失敗、訂正、判定理由）は本体Issue/PRへ保存し、回収した一時資材へのアクセスなしで読み戻して理解できること。全生ログ、環境一式、Git bundleを別保管庫へ移して恒久保持する方式を採らないこと。機械判定のためにローカル生ログの永久保持を要求しないこと（AG-009） |
      | REQ-118-008 | 実行担当は、検証結果に加え、必要な後片付けの実施結果、確認根拠、未処理事項を既存の作業記録経路へ返すこと。ADFは、既存の受け入れ評価を通じて、検証義務と後片付け義務の成立を確認すること。実行したという申告だけで、要求された後片付けの成立を認めないこと。確認可能な具体的な資材については、提示された証拠が回収または引継ぎを実際に立証しているかを評価すること。一方、ADFが管理・観測していない任意の資材について、機械的に不存在を完全証明することまでは要求しないこと。証拠不足、回収失敗、引継ぎ不成立、確認不能を区別し、必須条件が未達の場合は完全完了としないこと。中止・失敗・異常終了は既存の停止・再開経路で扱い、作業の中止と後片付けを含む全責任の完遂を混同しないこと。子Issueと親Caseの責任範囲は区別し、親が引き受けた横断的な後処理義務だけを理由に、条件を満たした子Issueの完了を禁止しないこと。終了操作後にしか実施できないADF自身の後処理については、終了前の受理判定と区別し、後処理失敗が残る場合はワークフロー全体の完遂を報告しないこと（AG-007） |
      | REQ-118-009 | 一時資材の作成・回収を実行担当へ委ねる方針に合わせ、すべての検証用一時資材を対象とした詳細台帳、作成操作を制御しない登録処理による機械的作成保証、OS全域のプロセス・待受ポート等の探索、資材名やプロセス属性等からの案件帰属推測、未登録資材の完全検出を前提とする終了拒否、作業専用一時資材への一律の利用者削除承認、および上記の機構を維持するためだけの除外・補正・重複照合処理を、作成・維持しないこと。ただし、ADF自身が管理する資材の回収、外部副作用の権限制御、受け入れ条件に基づく終了操作の機械的な安全境界は維持すること。既存機構の撤去に伴い不要となる文書、参照、状態、試験、実装を整理すること。削除する実装が別の有効な要件を担っている場合は、その責務を失わせず、必要な部分を維持または既存機構へ統合すること。旧機構が存在しないことを理由に、新たな資材管理基盤やOS全域監視を追加しないこと（AG-008） |

      ## 適用範囲

      - 対象: ADFの管理する作業に伴う一時的な副作用の共通取扱い（後片付け責任の伝達、資材の作成・利用・回収・引継ぎ、常備検証環境の返却、実行結果と回収結果の報告、完了評価との接続、中断・異常終了・回収失敗時の未処理責任の扱い、既存の一時資材管理機構の簡素化・撤去）
      - 対象外: 完了判定工程での評価条件と終了拒否（case-close実行契約 REQ-032）、worktree構造上の一時ファイル配置分類とworktree削除手順（worktree構造的制約 REQ-018）、検証証跡の必須要素と保存様式の一般契約（REQ-007、REQ-101）、委譲時の判断・承認・副作用の許可境界（REQ-003）、未追跡残存の恒常checkerと承認一覧（自己監査コマンド REQ-010）、検証水準の一般原則（REQ-055）、管理者が常備する検証環境の用意方針（REQ-116）、ADF独自の汎用資材管理基盤の新設、すべてのファイル・ディレクトリ・プロセスの個別登録、OS全域の常時監視や一時資材の完全捕捉、任意の外部コマンドによる全副作用の機械的制御、個々の一時資材のファイル名・作成順序・削除コマンドの固定、ハーネス固有の実装・内部状態管理への介入、新規のGitHubリポジトリ作成操作の追加や既存の書込み制限の緩和、既存の検証義務・証明水準の引下げ、過去に残存した資材の個別削除実行
  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: docs/requirements/REQ-032.md
    source_items: [AG-007, AG-008]
    content: |-
      REQ-032-043・REQ-032-044 の置換（他行は変更しない。置換後の全文行）:

      | REQ-032-043 | case-close は完了判定工程で、当該 Case 実行に伴う一時資材の後片付けの成立を評価すること。評価対象は実行担当が既存の作業記録経路へ返した後片付けの実施結果、確認根拠、未処理事項と提示された証拠とし、確認可能な具体的な資材については提示された証拠が回収または引継ぎを実際に立証しているかを評価すること。評価範囲は一時資材の共通取扱い契約（REQ-118）と実行契約に反映された条件から導出すること。実行したという申告だけを後片付けの成立根拠にしないこと（AG-007、AG-008） |
      | REQ-032-044 | case-close は、必須の後片付けが未完了・確認不能である場合、または既知の残存、回収失敗、証拠不足、引継ぎ不成立を検出した場合に、完了扱いとしないこと。検証の成功と後片付けの未達を区別して報告し、対応対象、不足事項、再開条件を確認できること。必要な検証結果が本体 Issue/PR へ保存され、確認された一時資材の回収または引継ぎが確認できた場合だけ終了を許可すること。ただし ADF が管理・観測していない任意の資材の不存在を機械的に完全証明することを、終了の条件にしないこと（AG-007、AG-008） |
  - id: ACT-REQ-003
    artifact: req
    operation: append
    target: docs/requirements/REQ-003.md
    source_items: [AG-010]
    content: |-
      新要件行（付与番号は保存時の採番規則に従う）: 委譲時の副作用の境界は、正式な成果物への変更を作業ツリー（または当該実行に割り当てられた作業領域）の外へ及ぼすことを禁止するものであり、既存の配置規則と権限に従う一時的な検証資材（当該作業が作成した寿命限定の作業専用領域内の資材を含む）の作成・利用・回収、および許可された外部検証環境の使用をそれ自体で禁止しないこと。安全な回収の条件と配置規則は一時資材の共通取扱い契約（REQ-118）が、許可された外部環境の用意方針は REQ-116 が所有する。必要な副作用が許可範囲を超える場合は、既存の停止・判断経路を利用し、許可範囲を独断で拡張しないこと（AG-010）
  - id: ACT-REQ-004
    artifact: req
    operation: append
    target: docs/requirements/REQ-017.md
    source_items: [AG-003, AG-011]
    content: |-
      新要件行（付与番号は保存時の採番規則に従う）: case-ready は、合意された検証義務、必要な証明水準、権限、および利用者等が必須と指定した検証手段を完了条件へ保持して投影すること。必須指定のない内部手順や検証環境の具体化は、許可範囲内で実行担当が選択できる裁量として扱い、実行契約で固定しないこと。予見された検証環境の必要条件（環境の種別、検証範囲、利用上の制約、後片付け責任）は実行契約へ反映し、実行時に初めて判明した条件は既存の許可範囲と停止・判断経路で扱うこと。通常の小規模変更に、特殊な検証環境の計画や管理記録を一律に要求しないこと（AG-003、AG-011）
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: workflows
      slug: verification-resource-lifecycle
    target_area: "# 検証用一時資材のライフサイクル（登録・検出・照合・回収）"
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007, AG-008, AG-009]
    content: |-
      # 検証に伴う一時資材の取扱いと後片付け責任

      ## 目的

      ADFの管理する作業に伴う一時的な副作用（検証用の一時資材、作業環境、外部検証環境の利用）について、ADFと実行担当の責務分担、資材の作成・利用・回収・引継ぎ、実行結果と完了評価への接続を単一契約として所有する。RU-0255〜0260のCase/PR終了後に検証用remote、clone、bare repository、退避ログ、補助スクリプト、専用serverが残存し、全作業完了と誤報告された事象の再発防止を目的とする。

      本Designは、旧機構（詳細台帳、作成時機械登録、close時の全観測照合、OS全域走査、帰属推測、一律の利用者削除承認、作成先拒否）を撤去し、後片付けを作業完遂責任の一部として既存の実行契約へ接続する方針（RU-0270、2026-11-08 利用者承認）を実現する。撤去の正当性は、旧機構が要求する未登録作成の完全機械検出が達成不能であり（旧Design自身が「検出不能経路は未達として報告」を例外として内包していた）、統制の対象と手法がDEC-001の統制是正原則（決定3のhard governance 8点限定、決定4の新規統制既定不追加）に照らして過剰・不適切であったことによる。旧統制が自ら保持していた再評価・撤去条件（旧Design「新規統制の正当性」節(7)）を踏まえ、維持すべき安全境界（ADF自身の資材回収、外部副作用の権限制御、受け入れ条件に基づく終了操作の機械的境界）は維持する。

      ## ADFと実行担当の責務分担

      - ADFは、作業目的、対象範囲、受け入れ条件、必要な検証水準と環境条件、許可・禁止する副作用の境界、実行担当への作業条件の引渡し、実行結果と必要な証拠に基づく完了評価を所有する
      - 実行担当AIエージェントは、具体的な検証方法の選択、必要な資材の準備・作成・利用、作業中に判明した追加的な環境条件への対応、一時資材の安全な回収と結果確認、未回収事項・確認不能事項・引継ぎ事項の報告を所有する
      - ハーネスは実行機構を提供する。ADFは、ハーネス固有の内部状態や起動方式、資材管理の実装方法を共通契約へ取り込まない
      - 委譲契約への文言接続は v4-delegation-contracts Design「検証用一時資材の作成・報告義務」節（RU-0270 で内容を再構成）が、委譲時の副作用の許可境界は REQ-003（委譲時の判断・承認・副作用境界）が、完了条件への投影規定は case-ready Design「受け入れ義務の実行構成への投影完全性」節が所有する

      ## 検証環境条件の引渡し

      - 要件定義や実行準備の段階で、通常と異なる検証環境（別ディレクトリ、隔離リポジトリ、外部検証環境等）の必要性が判明している場合、その必要条件（環境の種別、検証範囲、利用上の制約、後片付け責任）を既存の実行契約（req-define の test_strategy・実現方針から case-ready の完了条件・実現方針への投影）へ反映する
      - 具体的なファイル名、作業用ディレクトリ名、削除コマンド、内部的な管理方法まで事前に確定することを要求しない
      - 実行時に初めて環境の必要性が判明した場合は、実行担当が既存の許可範囲に基づいて対応する。必要な副作用が許可範囲を超える場合は既存の停止・判断経路を利用し、許可範囲を独断で拡張しない
      - 通常の小規模変更では、特殊な検証環境の計画や管理記録を一律に要求しない

      ## 一時資材の配置・利用・回収

      - 通常の短命な一時ファイルやディレクトリは、原則として実行環境の標準的な一時領域に作業専用の領域を確保して利用する。必要な場合は既存の配置規則と権限に従い、リポジトリ内の作業領域（REQ-018-008 の .agentdev/tmp/ 等の配置分類）や許可された外部環境を利用できる
      - 正式な成果物と一時資材の役割分類は REQ-118-003 が所有する。分類は役割で判定し、拡張子、testという名前、git追跡済みという事実だけでは判定しない
      - 利用終了時に不要な資材を回収する。安全な自動回収は、当該作業が作成した専用資材であることを確認できること、回収対象の範囲を特定できること、正式な成果物、必要な証拠、他の作業や利用者が管理する資材を失わないこと、回収操作が既存の副作用・承認境界に適合することの各条件が成立する範囲に限定する（REQ-118-005）
      - 回収直前に具体的対象の同一性・範囲を確認する。同名別物、識別子（PID等）の再利用、共有物、リンク先（symlink/junction の参照先）、正式な成果物と証拠を保護し、判断できないものは削除しない。専用台帳や同一性確認の新基盤を必須にしない
      - 条件が不明確な既存資材、共有資材、管理者が常備する環境は自動削除しない。作業専用一時資材の回収に利用者の都度承認を一律に要求しない
      - 削除操作は既存の副作用・承認境界（REQ-003、DEC-039 の authority 格子）に適合する。寿命限定の作業専用領域内の資材の回収は、対象・操作・寿命の格子内で権限が与えられる範囲で自律実行できる

      ## 常備する検証環境と引継ぎ

      - 管理者が常備する検証環境（GitHub隔離検証リポジトリ等。用意方針は REQ-116 と gh-isolated-verification-repository knowledge）は、個別作業の終了時に環境全体を削除せず、定められた利用終了・状態復旧・返却条件を満たす
      - 引継ぎは、受け手、対象、状態、残る処置、権限と、受領または既存の常設受入条件への適合を確認して成立させる。管理者への通知だけを移転成立と扱わない。管理者の後続処置が残ることと実行担当の返却責任が成立することを区別する。新しい確認フォームや毎回の人間の応答を一律に要求しない
      - 新しい外部資材の作成・削除は既存の許可境界に従う（agentdev_gh 操作カタログの拡張なし、gh-write guard の維持）

      ## 実行結果の報告と完了評価

      - 実行担当は、検証結果に加え、必要な後片付けの実施結果、確認根拠、未処理事項を既存の作業記録経路（PR本文、Issue コメント、SSoT コメント等）へ返す
      - ADFは既存の受け入れ評価（case-close の完了判定）を通じて、検証義務と後片付け義務の成立を確認する。実行したという申告だけで要求された後片付けの成立を認めない。確認可能な具体的な資材については、提示された証拠が回収または引継ぎを実際に立証しているかを評価する
      - ADFが管理・観測していない任意の資材について、機械的に不存在を完全証明することまでは要求しない。証拠不足、回収失敗、引継ぎ不成立、確認不能を区別する
      - 中止・失敗・異常終了は既存の停止・再開経路で扱う。作業の中止と、後片付けを含む全責任の完遂を混同しない。中断前に作成された資材は、取得可能な実行記録や実際の作業状態に基づいて回収の要否を再評価する
      - 子Issueと親Caseの責任範囲は区別する（子の終了判定は子が負う必須条件で判定し、親の横断的後処理義務は Epic または Root Case の最終終了時に評価する。REQ-032-038）
      - 終了操作後にしか実施できないADF自身の後処理（終了判定記録の回収、worktree の削除等）については、終了前の受理判定と区別する。後処理失敗が残る場合はワークフロー全体の完遂を報告しない
      - 証跡の保存と読み戻し: 検証の必要な結果（入力、対象版、操作、実結果、失敗、訂正、判定理由）は本体Issue/PRへ保存し、回収した一時資材へのアクセスなしで読み戻して理解できることを保存形式の要件とする（REQ-118-007）。全生ログ、環境一式、Git bundleを別保管庫へ移して恒久保持する方式は採らない。機械判定のためにローカル生ログの永久保持を要求しない

      ## 終了操作の安全境界と終了判定記録（維持機構）

      - 終了操作の前提条件としての機械受理の判定と、agentdev_gh の issue_close の Tool 境界検証（REQ-052-018）は維持する。機械受理不成立（変更後の正規完了条件の未達）時は終了操作そのものが実行されない（REQ-032-046）
      - 機械工程は終了判定記録を `.agentdev/close-acceptance/issue-{NNNN}.json` へ書き出す。終了判定記録の様式は、対象 Issue 番号、判定対象版（close 時点の対象を識別する版情報）、判定生成時刻、判定内容（変更後の正規完了判定: 必須完了条件の評価結果。旧台帳照合の結果は含まない）を含み、issue_reopen は当該 Issue の終了判定記録を無効化する（過去の合格結果の再利用を許さない）
      - 終了判定記録もローカル実行環境状態として終了後に回収する。回収結果は報告へ含め、回収失敗はワークフロー全体の完遂から区別して報告する
      - 生gh WRITEの迂回は既存のPlugin/Hook guard（gh-write系、REQ-052-002）が担う。同一マシン上の呼出元による終了判定記録の偽造防止は本契約の対象外（事故的迂回と規律欠落の抑止を対象とする）
      - 一般的な未追跡・状態記録検査（REQ-032-042 の状態記録コミット済み検証・未追跡残存検査、REQ-010-084 の承認一覧付き恒常checker）は別責務として維持し、本変更で撤去しない
      - remote 上の対象の不存在判定で HTTP 404 単独で判断せず、認証・可視性・対象 ID を確認する規律（REQ-032-045）は維持する

      ## 撤去対象と整理

      次の旧機構を正規の実行経路から撤去する。

      - 検証用一時資材の詳細台帳（メインrepo root の `.agentdev/tmp/verification-resources/{案件識別子}.json`）とそのデータモデル（所有区分、registrationBasis、caseCreationScope を含む）
      - 作成ヘルパーによる作成時機械登録（verification-resource-register.ts）と作成先拒否の機械検査（evaluateCreationDestination）
      - close時の6観測（専用領域の実在物と台帳の差分、対象repoのremote・worktree・branch列挙と台帳照合、台帳記録PIDの生存確認とコマンドライン一致、OS一時領域の案件識別子パターン走査、gitignore対象一時出力の列挙、導入時既知残存リストとの照合）と実物側網羅列挙、未記録entityの検出対象性、除外根拠の機械消費
      - 資材名・プロセス属性等からの案件帰属推測（attribution-unknown 報告区分を含む）
      - 未登録資材の完全検出を前提とする終了拒否と、受入未達（gap）導出のための4制御接続観測
      - 一律の利用者削除承認と識別情報照合の旧削除確認処理（deletion-confirmation.ts）
      - 上記の機構を維持するためだけの除外・補正・重複照合処理

      撤去に伴い、不要となる文書、参照、状態、試験、実装を整理する。削除する実装が別の有効な要件を担っている場合はその責務を失わせない。

      - close_mechanical_steps.ts のうち REQ-032-042（git管理契約の状態記録のコミット済み検証とリポジトリ未追跡かつgitignore対象外の残存検査）と REQ-032-046（終了前提の機械受理）に相当する部分は維持する
      - 終了判定記録の書出し・読取（close-acceptance.ts、runner-cli.ts、runner-local.ts）は判定内容を変更後の正規完了判定へ適合させて維持する
      - 撤去する機構のためのテスト（verification-resources-ledger.test.ts、verification-resource-register.test.ts、verification-resource-reclamation.test.ts、deletion-confirmation.test.ts）は削除し、維持機構のテストは維持する。full integrity suite の実行形態契約（3 cwd 分割正規形、REQ-060）は変更しない
      - 実行委譲の adapter SKILL（agentdev-case-run-execution-adapter）の作成・報告文言は本Designの修正後境界へ再整合する（投影同期 src/common → .opencode を含む）
      - ヘッダの ADF-COVERS 宣言ブロックは design 保存工程の更新確認手順に従い、design 対応（REQ-118-001〜009。行IDは安定IDとして維持）と実装対応（REQ-119-004 は履歴対応として整理）の過不足を反映する

      ## 実装面

      - 機械処理は、既存のcase-close機械工程script（close_mechanical_steps.ts）とそのテスト基盤を縮小・改編して実装し、別系統の検査基盤を作らない
      - 新規サービスの構築と常時監視は行わない。検査はclose時のオンデマンド実行に限る
      - Windows環境固有のprocess・listen検出の実装依存は撤去により解消する
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: workflows
      slug: v4-delegation-contracts
    target_area: "### 検証用一時資材の作成・報告義務"
    source_items: [AG-001, AG-004, AG-010]
    content: |-
      ### 検証用一時資材の作成・報告義務

      実行委譲（case-run から実行担当サブエージェントへの委譲）の委譲時最小契約は、一時的な資材の取扱いに関する次の義務を含む。所有契約の正は検証に伴う一時資材の取扱いと後片付け責任 Design が担い、本節は委譲契約への接続のみを定める（RU-0270 で節の内容を再構成。節の見出しは既存の安定参照を維持する）。

      - 委譲先は、許可された範囲（既存の配置規則と権限に従う標準的な一時領域への作業専用領域、リポジトリ内の作業領域、許可された外部環境）で一時資材を作成・利用し、利用終了時に安全条件（当該作業が作成した専用資材であることの確認、回収対象範囲の特定、正式な成果物・必要な証拠・他の作業や利用者が管理する資材の保護、既存の副作用・承認境界への適合）が成立する範囲で回収する。継続利用する資材は引継ぎ事項として報告する
      - 委譲先は、検証結果に加え、必要な後片付けの実施結果、確認根拠、未処理事項（未回収・確認不能・引継ぎ）を既存の報告経路で委譲元へ返す
      - 必要な副作用が許可範囲を超える場合は既存の停止・判断経路を利用し、許可範囲を独断で拡張しない。許可境界の正は REQ-003（委譲時の判断・承認・副作用境界）が、安全条件と配置規則の詳細は検証に伴う一時資材の取扱いと後片付け責任 Design が所有する
      - 予見された検証環境の必要条件が実行契約へ反映されている場合、委譲先はその条件で検証を開始する。実行時に初めて判明した追加的な環境条件への対応も委譲先の責務とする
  - id: ACT-DESIGN-003
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: commands
      slug: case-close
    target_area: "### full integrity suite 実行と tmp 残存確認"
    source_items: [AG-007, AG-008]
    content: |-
      - 一時資材の後片付けの評価: 完了判定工程は、当該 Case 実行に伴う一時資材の後片付けの成立を、実行担当が作業記録経路へ返した実施結果、確認根拠、未処理事項と提示された証拠に基づいて評価する。評価範囲は一時資材の共通取扱い契約（REQ-118）と実行契約に反映された条件から導出し（REQ-032-043）、実行したという申告だけを成立根拠にせず、確認可能な具体的な資材については提示された証拠が回収または引継ぎを実際に立証しているかを評価する。必須の後片付けが未完了・確認不能である場合、既知の残存、回収失敗、証拠不足、引継ぎ不成立を検出した場合は完了扱いとせず、検証の成功と後片付けの未達を区別して報告する（REQ-032-044）。ただし ADF が管理・観測していない任意の資材の不存在を機械的に完全証明することを終了の条件にしない。remote 上の対象の不存在判定は HTTP 404 単独で行わず、認証・可視性・対象 ID を確認しても判断できない場合は終了を拒否する（REQ-032-045）
  - id: ACT-DESIGN-004
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: responsibilities
      slug: custom-tool-contracts
    target_area: "### issue_close の終了前提（Case Issue）"
    source_items: [AG-007, AG-008]
    content: |-
      issue_close は、対象が Case Issue（case role の Issue）である場合、終了操作の前提として機械受理の判定記録を検証する。判定記録は case-close 機械工程が生成し、決定的な保存場所（メイン repo root の `.agentdev/close-acceptance/issue-{NNNN}.json`）に置かれる。Tool は呼出元の申告を受け取らず、自ら記録を読み取り、対象 Issue 番号と判定対象版（close 時点の対象を識別する版情報。様式はライフサイクル Design が所有）への束縛と判定内容（変更後の正規完了判定に基づく機械受理の成立）を検証してから副作用を実行する。記録が存在しない、読み取れない、対象 Issue または対象版と一致しない（過去の合格結果の再利用を含む）、判定が不成立のいずれかの場合は副作用を実行せず構造化失敗を返す（fail-closed、REQ-052-004 と同型）。追跡Issue（tracking role）の終了には本前提を適用しない。記録の保存場所はメイン repo root に固定し、Tool は worktree コンテキストから呼び出された場合も main repo root 側の保存場所へ解決する（呼出側の cwd に依存しない単一の決定的解決規則。agentdev_jev 観測と同一の内部解決）。判定記録の様式・保存場所・回収は検証に伴う一時資材の取扱いと後片付け責任 Design が所有する。同一マシン上の呼出元による判定記録の偽造防止は本契約の対象外（事故的迂回と規律欠落の抑止を対象とする）とし、生 gh WRITE の迂回検出は REQ-052-002 の既存 Plugin/Hook guard が担う。
  - id: ACT-DESIGN-005
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: commands
      slug: case-ready
    target_area: "## 受け入れ義務の実行構成への投影完全性（REQ-061-041/042、REQ-017-021〜023、RU-20261004-08）"
    source_items: [AG-003, AG-011]
    content: |-
      - 完了条件・実現方針への投影は、合意された検証義務、必要な証明水準、権限、および利用者等が必須と指定した検証手段を保持する。必須指定のない内部手順や検証環境の具体化は、許可範囲内で実行担当が選択できる裁量として扱い、実行契約で固定しない（REQ-017 の新要件行、RU-0270）
      - 予見された検証環境の必要条件（環境の種別、検証範囲、利用上の制約、後片付け責任）は、通常と異なる環境を必要とする Case で完了条件・実現方針へ反映する。通常の小規模変更に特殊な検証環境の計画や管理記録を一律に要求しない（RU-0270）

conflict_resolutions:
  - id: CR-001
    conflict: >-
      旧REQ-118-006（一時資材の削除は利用者の削除確認と識別情報との対応が確認できた場合だけ実行する契約）と、
      新方針の安全条件を満たす作業専用一時資材の自律回収（利用者の都度承認なし）の衝突。
    resolution: >-
      安全条件（当該作業が作成した専用資材であることの確認、回収対象範囲の特定、正式な成果物・必要な証拠・他の作業や
      利用者が管理する資材の保護、既存の副作用・承認境界への適合）が成立する作業専用一時資材に限定して自律回収を
      認める。同一性・範囲の回収直前確認と判断できない対象の削除禁止は維持する。恒久的な成果物と利用者判断対象の
      保護という REQ-003-023 の趣旨は4安全条件が担い、例外の正規化は REQ-003 の新要件行と REQ-118-005 で行う
      （RU 5.4・AC-04・合意項目5。advisory ユーザー確認事項2に対応し、文言は合意済みの安全条件の範囲を超えない）。
  - id: CR-002
    conflict: >-
      旧REQ-032-043/044（登録済み一時資材の生成記録と実物の照合、未登録・残存・削除確認不存在の検出時の完了拒否）と、
      台帳・網羅検出機構の撤去後の評価の衝突。
    resolution: >-
      登録集合の網羅検出を前提としない「必要な回収結果・証拠の評価」へ置換する。既知の残件・回収失敗・必要な証拠不足を
      未達とする評価、終了操作の機械受理（REQ-032-046・REQ-052-018）、REQ-032-042/REQ-010-084 の一般検査は維持する。
      置換は、旧機構が達成不能だった保証（未報告任意資材の機械的不存在証明）を撤去するものであり、合意された検証義務・
      証明水準の引下げには該当しない（正規変更経路による合意済み要件変更。RU 5.5・5.6・AC-06/09。advisory 推定事項3の
      同等性解釈を文言に明示）。
  - id: CR-003
    conflict: 終了操作の機械受理判定の維持と、旧照合内容（台帳照合ベースの判定）の撤去の関係。
    resolution: >-
      判定記録の読取検証、全終了経路での機械受理の消費、issue_reopen による無効化の枠組みは維持し、判定内容を
      変更後の正規完了判定（必須完了条件の評価結果）へ適合させる。判定記録の様式・保存場所は Design 所有
      （REQ-052-018）のため、REQ-052-018 の行変更なしで吸収する（RU 5.6・AC-09）。
  - id: CR-004
    conflict: >-
      REQ-003-011 の委譲禁止事項「作業ツリー外変更」と、許可された一時検証環境（標準一時領域、repo内作業領域、
      許可された外部環境）の使用の解釈の衝突。
    resolution: >-
      禁止対象は正式な成果物への変更であることを明確化する新行を REQ-003 へ追加する。advisory 推定事項1
      （DEC-039 の authority 格子との整合）を踏まえ、裁量の対象を既存の配置規則と権限に従う寿命限定の作業専用領域内の
      資材に限定する文言とし、必要な副作用が許可範囲を超える場合は既存の停止・判断経路を利用する（RU 対象表 REQ-003 行）。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0270
    target_req: REQ-118
    target_design: docs/designs/workflows/verification-resource-lifecycle.md
    operation: update
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: single
  - ou_id: OU-002
    source_ru: RU-0270
    target_req: REQ-032
    target_design: docs/designs/commands/case-close.md
    operation: update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
  - ou_id: OU-003
    source_ru: RU-0270
    target_req: REQ-003
    target_design: docs/designs/workflows/v4-delegation-contracts.md
    operation: append
    scale: standard
    depends_on: [OU-001]
    recommended_order: 3
    issue_policy: single
  - ou_id: OU-004
    source_ru: RU-0270
    target_req: REQ-017
    target_design: docs/designs/commands/case-ready.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 4
    issue_policy: single
result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |-
      変更後の正規委譲経路（req-define の test_strategy・実現方針 → case-ready の完了条件・実現方針 → case-run の実行委譲）を、
      通常の小規模変更の Case と別環境での検証を要する Case の双方で実行し、実行担当が受領した契約（Issue 本文・委譲 prompt）に
      共通の後片付け義務が含まれることを確認する（AC-01）。
    pass_criteria: |-
      共通の後片付け義務が双方の類型の委譲先へ届き、特殊な資材管理が不要な通常作業に追加の個別登録・管理工程が要求されないこと。
      case-run のスキル文面だけに規則を追加し実際の委譲先には伝達されていない状態になっていないこと。
    on_failure: |-
      fix-and-reverify。委譲契約・委譲 prompt の伝達経路は本変更の直接対象のため、伝達経路を修正して再検証する。
  - id: TS-002
    target_item: AG-003
    verification: |-
      別ディレクトリ、隔離リポジトリ、外部検証環境等が必要と事前に判明する Case を用意し、要件定義・実行準備で確定した
      環境条件・検証範囲・利用上の制約・後片付け責任が、実行担当が受領した契約（完了条件・実現方針・委譲 prompt）と
      欠落なく一致することを照合する（AC-02）。
    pass_criteria: |-
      必要な環境条件、検証範囲、利用上の制約、後片付け責任が欠落せず、実行担当が正しい条件で検証を開始できること。
      別リポジトリでの検証が必須なのに、実行担当には通常の作業ツリー内での単体試験しか伝達されない状態になっていないこと。
    on_failure: |-
      fix-and-reverify。投影経路（draft の test_strategy から実行契約への反映）を修正して再検証する。
  - id: TS-003
    target_item: AG-004
    verification: |-
      実行途中で追加の一時領域が必要になるシナリオを実行する。許可範囲内の資材（標準的な一時領域に確保した作業専用領域）の
      自律的な作成・回収と、許可されていない外部副作用を要する資材（新規GitHubリポジトリの無断作成等）で既存の判断・停止経路へ
      接続することを確認する（AC-03）。
    pass_criteria: |-
      許可範囲内では自律的な作成・回収が成立し、許可範囲外の副作用は無断実行されず既存の停止・判断経路へ接続されること。
      計画時に記載していないことだけを理由に回収対象から除外する運用になっていないこと。
    on_failure: |-
      fix-and-reverify。
  - id: TS-004
    target_item: AG-005
    verification: |-
      通常の一時ディレクトリと試験用生成物を実際に作成し、検証・証跡保存・回収・回収後確認を実行する。同じ親領域内に
      別作業の資材を配置して保護されることを確認する（AC-04）。
    pass_criteria: |-
      当該作業の不要資材が利用終了後に存在せず、必要な証拠と他作業の資材が保持され、通常の専用資材の回収に個別利用者承認が
      要求されないこと。作業全体の一時ディレクトリを削除して別作業の資材まで消失させる構成、および削除可能な専用資材の回収が
      承認待ちで停止する構成になっていないこと。
    on_failure: |-
      fix-and-reverify。
  - id: TS-005
    target_item: AG-006
    verification: |-
      管理者が用意した隔離GitHubリポジトリを利用する実経路検証を行い、利用終了後の状態（検証由来の残存物の処理、状態復旧、
      返却条件の成立）を確認する。あわせて、許可されない新規リポジトリ作成・削除が実行されないことを確認する。実行時に
      隔離リポジトリの準備と利用権限を確認し、未準備の場合は当該実環境検証のみを再開条件（管理者による準備。RU-0254 は
      別在庫であり本案の停止条件としない）付きで保留する（AC-05）。
    pass_criteria: |-
      常備リポジトリが保持され、当該作業による不要な変更が許可された範囲で処理され、返却条件が成立すること。
      許可されない外部副作用が実行されないこと。Case完了時に常備リポジトリ自体を自動削除する構成になっていないこと。
    on_failure: |-
      fix-and-reverify。隔離環境未準備による保留は blocked 判定と再開条件の記録で扱い、検証の合否と後片付けの合否を区別する。
  - id: TS-006
    target_item: AG-007
    verification: |-
      検証成功後に既知の一時ディレクトリを残存させる場合、回収が失敗する場合、回収証拠が不足する場合の3シナリオを作り、
      実行結果の引渡しから完了評価（case-close の完了判定と終了操作）までを確認する（AC-06）。
    pass_criteria: |-
      検証成功と後片付け未達が区別され、必須条件未達のまま完全完了へ進まないこと。対応対象・不足事項・再開条件を確認できること。
      「検証成功」「後片付け完了」という自己申告だけを採用し、提示済みの具体的な残存証拠や確認不能事項を無視して完了としないこと。
    on_failure: |-
      fix-and-reverify。
  - id: TS-007
    target_item: AG-007
    verification: |-
      資材作成後、回収前に実行担当を中断させ、既存の再開経路から処理を継続する。別作業に利用を引き継ぐ場合も確認する（AC-07）。
    pass_criteria: |-
      再特定できる資材は安全に回収または引継ぎできること。再特定・確認できない事項は不明として報告され、未確認の回収を
      完了済みとしないこと。中断前の資材を確認せず再開し後片付け未実施のまま完了としないこと。引継ぎが成立していない資材の
      管理責任を消失させないこと。
    on_failure: |-
      fix-and-reverify。
  - id: TS-008
    target_item: AG-009
    verification: |-
      別環境での実経路検証を実施し、資材回収後に本体 Issue・PR 等の既存の正規記録から必要な証拠（対象版、検証範囲、実行結果、
      合否判断、後片付け結果）を読み戻す。GitHub版の Issue・PR だけでなく Local版の正規記録も対象とする（AC-08）。
    pass_criteria: |-
      対象版、検証範囲、実行結果、合否判断、後片付け結果が必要な範囲で確認でき、一時資材が存在しないことを理由に検証根拠が
      失われないこと。検証の唯一の証拠が削除済みのローカル一時ファイルにしか存在しないことになっていないこと。
    on_failure: |-
      fix-and-reverify。
  - id: TS-009
    target_item: AG-008
    verification: |-
      変更対象の REQ・Design・Skill・Script・Tool・試験・参照関係を照合し、旧機構（詳細台帳、作成時機械登録と作成先拒否、
      OS全域走査、帰属推測、未登録完全検出前提の終了拒否、一律の利用者削除承認、維持のためだけの除外・補正・重複照合）の
      実行経路と参照残存を機械的検索（rg 等）で確認する。検索の網羅範囲は docs/（docs/reports/ は履歴記録領域として除外）、
      src/、.opencode/、traceability/ とし、修正対象列挙と一致させる（See Also 等の参照行は検出対象外と明示する）。
      さらに GitHub版・Local版のうち影響を受ける正規終了経路で、必須条件未達時の終了拒否と条件成立時の正常終了を実行確認する。
      各証拠の対象版・入口・受渡し・証明範囲を照合し、未観測部分は未確認として扱う（AC-09）。
    pass_criteria: |-
      不要と判断した旧機構が正規の実行経路から除去されていること。廃止した契約への参照や旧機構のためだけの重複管理が残って
      いないこと。ADF自身の作業ツリー回収、許可された副作用の安全制御、必須完了条件に基づく終了拒否が維持されていること。
      旧機構が存在しないことを理由に新たな資材管理基盤やOS全域監視が追加されていないこと。旧照合処理の撤去によって
      未達条件でも issue_close が成功しないこと。
    on_failure: |-
      fix-and-reverify。
  - id: TS-010
    target_item: AG-001
    verification: |-
      少なくとも次の3類型について、正規の実行委譲から完了評価までの利用経路を確認する。(1) 通常の作業ツリー内で完結する
      小規模変更、(2) 複数文書・ディレクトリを対象とし一時的な作業環境を利用する変更、(3) 別リポジトリまたは隔離環境を必要とする
      ワークフローの実経路検証。3類型と GitHub版・Local版の全組合せを無条件に追加せず、各証拠の対象版・入口・受渡し・証明範囲を
      照合し、未観測部分は未確認とする（AC-10）。
    pass_criteria: |-
      3類型とも必要な検証義務が維持され、資材管理・回収・証跡・完了評価が成立すること。通常変更に専用台帳や不要な環境準備が
      要求されず、複雑な変更では必要な環境条件と後片付け責任が欠落しないこと。小規模変更だけで検証を完了し別環境を用いる検証の
      接続を未確認のまま全体完遂としないこと。
    on_failure: |-
      fix-and-reverify。
  - id: TS-011
    target_item: AG-007
    verification: |-
      終了操作後の後処理（終了判定記録の回収、worktree クリーンアップ等）を実際に実行し、正常回収と回収失敗をそれぞれ確認
      する（AC-11）。
    pass_criteria: |-
      正常系では不要資材の回収が確認できること。失敗系では Issue の終了状態と後処理未完了が区別され、残る対象と処置が報告
      されること。Issue が closed になったことだけを理由に後続の回収失敗を無視して全作業完了と報告しないこと。
    on_failure: |-
      fix-and-reverify。
  - id: TS-012
    target_item: AG-007
    verification: |-
      各受け入れ条件（AC-01〜AC-11）を pass、fail、blocked、not applicable で判定し、その判定記録を確認する（RU 検証方針と
      判定の原則）。
    pass_criteria: |-
      個別部品の動作確認と実際の利用経路を通した成立確認が区別されていること。文書や委譲指示の存在だけが後片付け成立の証拠と
      して採用されていないこと。実行担当の申告と実物の確認結果が矛盾する場合に具体的な不一致を解消せず合格していないこと。
      申告されなかった任意のOS資材が存在しないことまで機械的に証明したと扱っていないこと。検証の合否と後片付けの合否が区別
      されていること。not applicable は正規契約上その条件が当該対象に適用されないと説明できる場合に限られ、未投影・未実装・
      未検証・証拠不足・担当外を理由に未達を隠していないこと。必要な証拠は回収前に保存され、回収後に既存の正規記録から読み
      戻されていること。既存の有効な機械的検査が再利用され、同じ判定目的のために新しい恒久的な検査基盤が作成されていないこと。
      必須条件に未達や証拠不足が残る場合は全体完遂としないこと。
    on_failure: |-
      fix-and-reverify。

realization_actions:
  - id: RA-001
    concern: case-close 機械工程の簡素化と維持機構の適合
    responsibility: >-
      close_mechanical_steps.ts（および final-acceptance.ts）から旧機構（台帳照合、6観測、作成先再評価、gap 導出の4制御接続観測）を
      除去し、REQ-032-042（git管理契約の状態記録のコミット済み検証と未追跡残存検査）と REQ-032-046（終了前提の機械受理）に
      相当する検査を維持する。終了判定記録の書出しは維持し、判定内容を変更後の正規完了判定（必須完了条件の評価結果）へ
      適合させる。full integrity suite の実行形態契約（3 cwd 分割正規形、REQ-060）は変更しない。
    ownership_hints:
      - src/common/skills/agentdev-workflow-case-close/scripts/src/close_mechanical_steps.ts
      - src/common/skills/agentdev-workflow-case-close/scripts/src/final-acceptance.ts
      - src/common/skills/agentdev-workflow-case-close/scripts/tests/close_mechanical_steps.test.ts
      - docs/designs/commands/case-close.md
    intent: >-
      RU-0270 5.6（既存機構の簡素化）の実現面。撤去と維持の境界を実装に正しく反映し、有効な検査を一括撤去しない。
    verification_refs: [TS-006, TS-009, TS-010, TS-011]
    source_items: [AG-007, AG-008]
  - id: RA-002
    concern: 台帳・作成ヘルパー・回収・削除確認モジュールの撤去
    responsibility: >-
      verification-resources-ledger.ts、verification-resource-register.ts（作成ヘルパーと evaluateCreationDestination の作成先拒否）、
      verification-resource-reclamation.ts、deletion-confirmation.ts と、それぞれのテスト（verification-resources-ledger.test.ts、
      verification-resource-register.test.ts、verification-resource-reclamation.test.ts、deletion-confirmation.test.ts）を撤去する。
      撤去した実装が別の有効な要件を担う部分（REQ-118-003 の役割分類に関わる検査等）は維持または既存機構へ統合する。
      台帳格納領域（.agentdev/tmp/verification-resources/）の残存状態の整理を含む。
    ownership_hints:
      - src/common/skills/agentdev-workflow-case-close/scripts/src/verification-resources-ledger.ts
      - src/common/skills/agentdev-workflow-case-close/scripts/src/verification-resource-register.ts
      - src/common/skills/agentdev-workflow-case-close/scripts/src/verification-resource-reclamation.ts
      - src/common/skills/agentdev-workflow-case-close/scripts/src/deletion-confirmation.ts
      - src/common/skills/agentdev-workflow-case-close/scripts/tests/verification-*.test.ts
      - src/common/skills/agentdev-workflow-case-close/scripts/tests/deletion-confirmation.test.ts
    intent: RU-0270 5.6（撤去対象の機構と維持のためだけの処理の除去）の実現面。
    verification_refs: [TS-009]
    source_items: [AG-008]
  - id: RA-003
    concern: agentdev_gh issue_close 前提検証の判定内容適合（GitHub版・Local版）
    responsibility: >-
      close-acceptance.ts、runner-cli.ts、runner-local.ts（および engine.ts、senpi 接続 registration.ts）の終了判定記録の読取検証を
      維持し、検証する判定内容を変更後の正規完了判定の様式へ適合させる。両実装で同一の操作契約を維持する。close-acceptance.test.ts
      等のテストを適合させる。
    ownership_hints:
      - src/common/tools/agentdev-gh/close-acceptance.ts
      - src/common/tools/agentdev-gh/runner-cli.ts
      - src/common/tools/agentdev-gh/local/runner-local.ts
      - src/common/tools/agentdev-gh/engine.ts
      - src/common/tools/agentdev-gh/tests/close-acceptance.test.ts
      - src/senpi/tools/agentdev-gh-tool/registration.ts
    intent: >-
      RU-0270 5.6（受け入れ条件に基づく終了操作の機械的な安全境界の維持）と advisory 確定事項(c) の実現面。2版間の不整合を
      作らない。
    verification_refs: [TS-006, TS-009]
    source_items: [AG-007, AG-008]
  - id: RA-004
    concern: 実行委譲契約と配布スキル文言の再整合
    responsibility: >-
      agentdev-case-run-execution-adapter SKILL.md の検証用一時資材の作成報告の文言（作成ヘルパー経由の作成時機械登録・台帳登録・
      作成先拒否の旧記述）を、新方針（許可範囲での作成・利用・安全な回収・後片付け結果の報告）へ再整合する。委譲 prompt 生成に
      おける後片付け義務の伝達を含む。投影同期（src/common → .opencode）を含む。
    ownership_hints:
      - src/common/skills/agentdev-case-run-execution-adapter/SKILL.md
      - docs/designs/workflows/v4-delegation-contracts.md
    intent: AC-01（委譲先への義務伝達）の実現面。REQ-119 の知見（実装境界変更時の文言整合の対象一覧化）を適用する。
    verification_refs: [TS-001, TS-003]
    source_items: [AG-001, AG-010]
  - id: RA-005
    concern: 常備検証環境の返却条件の文書整合
    responsibility: >-
      docs/knowledge/gh-isolated-verification-repository.md の運用手順と責務（検証実行者）に、利用終了時の状態復旧・返却条件
      （検証由来の残存物の報告と整理、状態の初期化依頼、返却の成立条件）を明記し、管理者の後続処置と実行担当の返却責任の区別が
      できるようにする。新しい確認フォームや毎回の人間の応答は要求しない。
    ownership_hints:
      - docs/knowledge/gh-isolated-verification-repository.md
    intent: AC-05（常備環境と返却条件）の実現面。
    verification_refs: [TS-005]
    source_items: [AG-006]
  - id: RA-006
    concern: 索引・frontmatter・covers 宣言・テスト基盤の追随
    responsibility: >-
      REQ-118 の frontmatter title 変更に伴う README 索引（AUTOGEN）の再生成、docs/designs/README.md 横断 Design 一覧の
      タイトル列更新（verification-resource-lifecycle.md の H1 変更に伴う）、verification-resource-lifecycle.md ヘッダの
      ADF-COVERS 宣言ブロックの更新（design 対応 REQ-118-001〜009 の維持、implementation covers REQ-119-004 の履歴対応としての
      整理。inline と sidecar の両方向一致の維持）、撤去テストの削除と維持テストの整理を行う。
    ownership_hints:
      - docs/requirements/REQ-118.md
      - docs/designs/README.md
      - docs/designs/workflows/verification-resource-lifecycle.md
      - docs/README.md
      - docs/requirements/README.md
      - traceability/
    intent: 撤去に伴う参照・索引の整理（RU 5.6）と AC-09（参照残存なし）の実現面。
    verification_refs: [TS-009]
    source_items: [AG-008, AG-009]

review_dispositions:
  - id: RD-001
    source_ru: RU-0270
    source_item: 要件化の方向
    disposition: covered
    reason_code: adopted
    reason: |-
      5.1〜5.6 と評価による補強事項・実装上の裁量・完遂条件を AG-001〜AG-011 へ対応付け、REQ 行（REQ-118 再構成、
      REQ-032-043/044 置換、REQ-003・REQ-017 追加行）と Design 5件の保存対象へ構造化した。文言の省略・弱化・反転はない。
    evidence:
      path: .agentdev/backlog/req-units/RU-0270.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0270
    source_item: 決定的受け入れ条件
    disposition: covered
    reason_code: adopted
    reason: |-
      AC-01〜AC-11 を TS-001〜TS-011 へ、検証方針と判定の原則（not applicable の限定、3類型と2版の組合せ抑制、証拠の回収前
      保存と正規記録からの読み戻し、RU-0254 の別在庫扱い）を TS-005・TS-009・TS-010・TS-012 へ投影した。
    evidence:
      path: .agentdev/backlog/req-units/RU-0270.md
      section: 決定的受け入れ条件
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_ru: RU-0270
    source_item: 対象外
    disposition: not_applicable
    reason_code: out_of_scope
    reason: |-
      RU の対象外リスト（汎用資材管理基盤の新設、個別登録、OS全域の常時監視、全副作用の機械的制御、ファイル名・作成順序・
      削除コマンドの固定、ハーネス固有実装への介入、新規GitHubリポジトリ作成操作の追加と書込み制限の緩和、検証義務・証明水準の
      引下げ、無関係な機能・品質改善、過去の残存資材の個別削除実行）を REQ-118 の適用範囲（対象外）として維持し、
      本 draft は対象外項目を要件化しない。
    evidence:
      path: .agentdev/backlog/req-units/RU-0270.md
      section: 対象外
      checked_at_commit: null
    related_removed_items: []
  - id: RD-004
    source_ru: RU-0270
    source_item: 依存関係
    disposition: not_applicable
    reason_code: out_of_scope
    reason: |-
      必須依存なし（depends_on: []）。RU-0254（常備隔離GitHub環境の管理者による準備）は別在庫であり、本件への統合も
      停止条件化もしない。AC-05（TS-005）で実行時に準備状況を確認し、未準備なら当該実環境検証のみを再開条件付きで保留する。
      個別Caseの是正案や case-ready の削除案は本案へ自動統合しない。
    evidence:
      path: .agentdev/backlog/req-units/RU-0270.md
      section: 依存関係
      checked_at_commit: null
    related_removed_items: []

assembly_evidence:
  - target_file: docs/requirements/REQ-032.md
    target_content_sha256: 09e442216050bf9e57e2f91956321217bf02f930a1bcab8a0ed8fa15dfcc76d0
    check_scope: { heading: "## 要件", start_line: 15, end_line: 65 }
    execution_conditions: { operation: replace, edit_sha256: 0e160e8d85fc6aa374485d379fb1b73677412ec71f6919eaf1ccd78025324822, expected_old_count: 1 }
    checker: { name: assemble-draft-section, version: 0.2.0, settings: { heading_match: exact-after-normalization, old_text_count_check: true } }
    result_affecting_references: { heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan", scan_scope: "target section only" }
    checks_summary: { pre: { count: 3, all_ok: true }, post: { count: 3, all_ok: true } }
    diff_compact: { changed_lines_count: 1, added: 1, removed: 1 }
    executed_at: "2026-11-07T17:07:34.609Z"
  - target_file: docs/requirements/REQ-032.md
    target_content_sha256: 09e442216050bf9e57e2f91956321217bf02f930a1bcab8a0ed8fa15dfcc76d0
    check_scope: { heading: "## 要件", start_line: 15, end_line: 65 }
    execution_conditions: { operation: replace, edit_sha256: 71463df10ac7be829437cd48e38f2ef79ed7dd9fc67206d0caa331b3ec00595a, expected_old_count: 1 }
    checker: { name: assemble-draft-section, version: 0.2.0, settings: { heading_match: exact-after-normalization, old_text_count_check: true } }
    result_affecting_references: { heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan", scan_scope: "target section only" }
    checks_summary: { pre: { count: 3, all_ok: true }, post: { count: 3, all_ok: true } }
    diff_compact: { changed_lines_count: 1, added: 1, removed: 1 }
    executed_at: "2026-11-07T17:07:34.685Z"
  - target_file: docs/designs/workflows/v4-delegation-contracts.md
    target_content_sha256: 024f718c2067f2e8674c68346210559547b19d341c5a31d222fcbf92966bb90e
    check_scope: { heading: "### 検証用一時資材の作成・報告義務", start_line: 86, end_line: 93 }
    execution_conditions: { operation: replace, edit_sha256: ec69ebf59a8074d6963a1c42c84a07851961a7d3c3d23bc5eb04b42e3b4b4e48, expected_old_count: 1 }
    checker: { name: assemble-draft-section, version: 0.2.0, settings: { heading_match: exact-after-normalization, old_text_count_check: true } }
    result_affecting_references: { heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan", scan_scope: "target section only" }
    checks_summary: { pre: { count: 3, all_ok: true }, post: { count: 3, all_ok: true } }
    diff_compact: { changed_lines_count: 6, added: 6, removed: 4 }
    executed_at: "2026-11-07T17:09:13.875Z"
  - target_file: docs/designs/commands/case-close.md
    target_content_sha256: 286bc26e94eb96471787539839ad04165f746a629b1427663b2f54c2c5dff153
    check_scope: { heading: "### full integrity suite 実行と tmp 残存確認", start_line: 157, end_line: 187 }
    execution_conditions: { operation: replace, edit_sha256: 01defc8d566782ee6c580fb97cb6c2b44254a443efbd6e6212d0dee8bd91fe11, expected_old_count: 1 }
    checker: { name: assemble-draft-section, version: 0.2.0, settings: { heading_match: exact-after-normalization, old_text_count_check: true } }
    result_affecting_references: { heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan", scan_scope: "target section only" }
    checks_summary: { pre: { count: 3, all_ok: true }, post: { count: 3, all_ok: true } }
    diff_compact: { changed_lines_count: 1, added: 1, removed: 1 }
    executed_at: "2026-11-07T17:07:34.849Z"
  - target_file: docs/designs/responsibilities/custom-tool-contracts.md
    target_content_sha256: 4c289220b5e7a25e1c9618a4a313144c0438f3cbe0e541be5907e156a04e53d3
    check_scope: { heading: "### issue_close の終了前提（Case Issue）", start_line: 103, end_line: 107 }
    execution_conditions: { operation: replace, edit_sha256: 996de17df5ae1963ba10597d5cd7573fc707f81f281aeed066b03efbf97a6ade, expected_old_count: 1 }
    checker: { name: assemble-draft-section, version: 0.2.0, settings: { heading_match: exact-after-normalization, old_text_count_check: true } }
    result_affecting_references: { heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan", scan_scope: "target section only" }
    checks_summary: { pre: { count: 3, all_ok: true }, post: { count: 3, all_ok: true } }
    diff_compact: { changed_lines_count: 1, added: 1, removed: 1 }
    executed_at: "2026-11-07T17:07:34.931Z"
  - target_file: docs/designs/commands/case-ready.md
    target_content_sha256: ad4ee010fe2a9f733419dfbfdfea1648fb3e4035b092b38fb4b707f067260050
    check_scope: { heading: "## 受け入れ義務の実行構成への投影完全性（REQ-061-041/042、REQ-017-021〜023、RU-20261004-08）", start_line: 69, end_line: 78 }
    execution_conditions: { operation: append, edit_sha256: 4c61789b00c3daa6600165f234b8d0d1fed445c3bbabb1d7bd1b66d6727bdeba, expected_old_count: null }
    checker: { name: assemble-draft-section, version: 0.2.0, settings: { heading_match: exact-after-normalization, old_text_count_check: true } }
    result_affecting_references: { heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan", scan_scope: "target section only" }
    checks_summary: { pre: { count: 2, all_ok: true }, post: { count: 2, all_ok: true } }
    diff_compact: { changed_lines_count: 3, added: 3, removed: 0 }
    executed_at: "2026-11-07T17:07:35.010Z"

case_open_hints:
  epic_needed: true
  decomposition: >-
    規範層（OU-001〜OU-004 の REQ・Design 更新）は RU の相互関連変更の一体扱いの要求に従い、単一の Definition PR で
    一体適用する（REQ-032-043/044 の新評価条件は REQ-118 の共通取扱い契約を評価範囲の導出元として参照し、委譲契約節は
    再構成後の Design を所有契約の正として参照するため、OU-002/OU-003 は OU-001 に必須依存する）。custom-tool-contracts.md
    の更新は OU-002 と同じ完了判定系の関心として同時に適用する。実装層（RA-001〜RA-006）は Definition 確定後の子 Issue 群へ
    構成する。実経路検証（TS-001〜TS-012、AC-01〜AC-11・3類型・2版）は最終段で実行する。
  wave_hints:
    - "Wave 1: 規範・Design 一括適用（OU-001〜OU-004、単一設計PR）"
    - "Wave 2: 実装・試験（RA-001〜RA-006: 機械工程の縮小改編、台帳系モジュールとテストの撤去、agentdev_gh 両実装の判定内容適合、adapter SKILL と委譲文言の再整合、knowledge 返却条件、索引・frontmatter・covers の追随）"
    - "Wave 3: 実経路検証と完了評価（TS-001〜TS-012。AC-05 は隔離環境の準備状況で当該検証のみ blocked 保留可）"
```

# summary

RU-0270（session由来RU・2026-11-08 利用者承認済み）を入力とする要件再定義である。検証に伴う一時資材の管理を、台帳・OS全域走査・帰属推測・一律削除承認・作成先拒否の過剰機構から、ADFと実行担当の責務分担と後片付けを含む作業完遂責任の共通方針へ再構成する。REQ-118（9行全面再構成、行ID維持）、REQ-032-043/044（証拠評価へ置換）、REQ-003・REQ-017（境界整合・検証義務と裁量の区別の新行）、Design 5件（verification-resource-lifecycle 全面改稿、v4-delegation-contracts・case-close・custom-tool-contracts・case-ready の節更新）を保存対象とし、実装層を RA-001〜RA-006 へ、AC-01〜AC-11 と検証方針を TS-001〜TS-012 へ投影した。

Decision は新規作成しない。architecture-advisory（2026-11-08）は、撤去の正当性（DEC-001 決定3/4 の統制是正原則と旧Design自身の撤去条件(7)）、責務分担（DEC-001 決定1/2・DEC-036 維持分・DEC-048 決定(2)(4)）、終了操作 gating の維持（DEC-022・DEC-038 決定(3)・DEC-039）を確定事項として根拠づけ、ブロッカーなしと判定した。推定事項（DEC-039 格子との整合読み、撤去理由の記録方針、REQ-032-037 同等性の解釈）は確定事項として混入せず、REQ-003 新行の文言設計条件・REQ-118 目的節の正当化記録・CR-002 の文言として反映した。ユーザー確認事項3件はいずれも RU の承認済み合意（合意項目5・10、5.5）の範囲内の文言判断であり、再質問せず、文言が合意範囲を超えないことを CR-001/CR-002 と提示内容で明示した。

adversarial-review（2系統の独立チャレンジ、convergence audit 実施）は本質的破綻を検出せず、追加実測（REQ-118 行IDの外部参照の機械検査）は docs 側が改稿対象2ファイルに閉じ、src 側が撤去・改編対象テストに閉じることを確認した（TS-009・RA-006 で完了後に検証）。Jev 先行評価2件（既存REQ照合判断・要件展開の最終分類、観測 20261107T164558Z-90ac・20261107T165121Z-8a79）はいずれも呼出側の最終判断と一致した（boolean 3件のみ意味判断で是正し差異理由 semantic_disagreement を記録済み）。
