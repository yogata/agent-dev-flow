---
draft_type: req_draft
topic_slug: verification-resource-cleanup
status: draft
created_at: 2026-11-05T11:20:00+09:00
source_rus:
---

<!-- req_draft: 検証用一時資材の撤去・再発防止の是正要件。
  入力: C:/Users/ogatay/work/hermes-vault/project-list/req-input-adf-verification-resource-cleanup.md（合意済み単一入力、参照専用）
  処理の正は下記 # draft-data YAML ブロックである。 -->

# draft-data

```yaml
work_type: feature

scale: large

summary: >-
  Case実行で作成される検証用一時資材（検証用remote、clone、bare repository、退避ログ、補助スクリプト、専用server・process等）を正式な成果物と役割で区別し、作成・委譲入口での機械的な登録、終了前の生成記録と実物の照合、識別情報に紐付いた削除確認、証跡の本体Issue/PRへの保存と読み戻しを、新規REQとREQ-032・REQ-052への追加要件行、新規Designとcase-close Design・委譲契約Design・custom-tool-contracts Designの更新として定義する。終了操作を実行できる全経路（agentdev_gh issue_closeへの直接呼出しを含む）で機械受理判定を前提条件とし、Tool実行境界での機械的検証により検査結果を渡さない直接呼出しを拒否する。未登録・残存・未確認・検査不能・検査器異常時の完了を拒否し、機械検出も実行制限も成立しない必須経路が残る場合は受入未達として完了を許可しない。申告集合だけの検査、404単独の不存在判定、任意実行checker、残置許容例外への読み替えは行わない。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: >-
      正式な成果物と一時資材を役割で区別する。実装、テストコード、必要なテストデータ・期待結果・環境再現スクリプト、正式な手順文書は対象repoに登録して維持する。テスト実行で生成したデータ、clone、検証用remote、ログ、専用process等は一時資材として回収対象に分類する。拡張子、testという名前、git追跡済みという事実だけで分類しない。
  - id: AG-002
    content: >-
      ADFの作成・委譲入口は、Case実行で作成する一時資材の案件・種別・所在・識別情報・回収担当を実行処理の記録として登録する。PR本文への自由文自己申告と終了時のLLM抽出のみで登録を代替しない。登録は親・子・共通の所有区分を持ち、子Issueの完了後も親または共通の一時資材が残る場合は全体を未完了として扱う。
  - id: AG-003
    content: >-
      一時資材は案件スコープの専用領域へ配置し、専用領域の運用と実行可能な作成経路の制限を接続する。任意のshell/Python/native/OpenCode子processを自由に実行させたまま、引数のpattern検査だけで全作成物の捕捉を主張しない。未登録・範囲外の作成を機械検出または実行制限し、機械検出も実行制限も成立しない作成経路が残る場合は未達として報告する。申告された集合だけの検査を成立扱いにしない。
  - id: AG-004
    content: >-
      検証の必要な結果（入力、対象版、操作、実結果、失敗、訂正、判定理由）は本体Issue/PRへ保存し、回収した一時資材へのアクセスなしで読み戻して理解できる状態にする。全生ログ、環境一式、Git bundleを別保管庫へ移して恒久保持する方式を採らない。機械判定のためにローカル生ログの永久保持を要求しない。
  - id: AG-005
    content: >-
      一時資材の削除は、利用者の削除確認と対象の正確な識別情報（所在、種別、内容の識別。同名別物、PID再利用、symlink/junctionの参照先を含む）との対応が確認できた場合だけ実行する。確認なし、対象の追加変更後、別物への入替え時は削除しない。実行担当が生成したapproval等の機械可読値だけを利用者確認として扱わない。確認済み識別情報との対応を残置許容の例外として流用しない。
  - id: AG-006
    content: >-
      case-closeは完了判定工程で、当該Case実行の登録済み一時資材の生成記録と実物を照合し、ローカル、remote、分岐、process、listen、およびgitignore対象の一時出力を検査する。未登録・残存・削除確認の不存在または識別情報の不一致・検査不能・検査器の異常を検出した場合は完了扱いとせず、private GitHubの404を権限不足との区別なしに不存在扱いにしない（認証・可視性・対象IDを確認しても判断できない場合は拒否する）。必要な検証結果が本体Issue/PRへ保存され、確認された一時資材の回収が確認できた場合だけ終了を許可する。
  - id: AG-007
    content: >-
      同一の終了操作を実行できる全ての経路（公開Custom Toolの直接issue_close、Local版実装、親の集約経路を含む）は、機械受理の判定を終了操作の前提条件として消費し、判定を経由しない終了経路を残さない。通常の作成物ゼロと生成記録の欠落を区別する。検査設定の省略・解除、過去の合格結果の再利用で終了を通過させない。
  - id: AG-008
    content: >-
      既存REQ/Design/SKILL/実装/テストの適切な所有者を確認し、正規workflowで修正する。新規サービスの構築や常時監視を目的とせず、必要な機械的処理（登録、検出、照合）を省略しない。一時資材の登録・追跡に使う記録自体も一時資材とし終了時の回収対象に含め、保存すべき最終記録は本体Issue/PRへ収束させる。
  - id: AG-009
    content: >-
      実装と対応する自動テストをrepoへ登録する。既存のclose_mechanical_steps.test.ts等の既存テスト基盤を再利用し、不必要な別系統の検査基盤を作らない。失敗を先に確認し、修正後に同じ試験で成功することを確認する。import/構文/依存の失敗を要求の拒否が成立した証拠にしない。
  - id: AG-010
    content: >-
      正式なtest source/dataを残したまま、テスト実行が生成した一時資材だけを回収できることを確認する。今回の旧検証資材は削除せず、その残存による終了拒否を確認できることを検証とする。削除許可後の実不存在確認は監督側の今回対応で実施する。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: create
    target: new:verification-resource-cleanup
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-007, AG-008]
    content: |
      ## 目的

      Case実行で作成される検証用一時資材を正式な成果物と役割で区別し、作成から回収までの登録・追跡の契約を所有する。検証用remote、clone、bare repository、退避ログ、補助スクリプト、専用server・process等がCaseやEpicの終了後に残存する状態を排除する。
      完了判定工程での照合・拒否・全終了経路の強制はcase-close実行契約（REQ-032）が、worktree構造上の一時ファイル配置分類はworktree構造的制約REQ（REQ-018）が、検証証跡の必須要素と保存様式の一般契約は完了報告と成果物品質ゲートREQ（REQ-007）とCase Issue工程記録モデルREQ（REQ-101）が所有する。本REQはこれらと重複する要件行を持たず、一時資材の登録と回収のライフサイクル契約に限定する。

      ## 要件

      保存時に REQ 番号と要件行ID（REQ-{NNNN}-{MMM}）を決定的採番スクリプト（alloc-req-number.ts、要件行IDは採番時に確定）で確定し、テーブル形式（| ID | 要件 |）で構築する。本節は要件行の本文と対応する合意項目を行単位で示す。行頭の「要件行N」は採番対象を識別するための相対位置であり、要件行IDではない（ bare ID を本文に残さない先例に従う）。

      - 要件行1（AG-002）: ADFの作成・委譲入口は、Case実行で作成する一時資材の案件・種別・所在・識別情報・回収担当を実行処理の記録として登録すること。PR本文への自由文自己申告と終了時のLLM抽出のみで登録を代替しないこと
      - 要件行2（AG-002）: 一時資材の登録は親・子・共通の所有区分を持つこと。子Issueの完了後も親または共通の一時資材が残る場合は全体（親の管理する終了単位）を未完了として扱うこと
      - 要件行3（AG-001）: 正式な成果物（実装、テストコード、必要なテストデータ・期待結果・環境再現スクリプト、正式な手順文書）は対象repoに登録して維持し、テスト実行で生成したデータ、clone、検証用remote、ログ、専用process等は一時資材として回収対象に分類すること。拡張子、testという名前、git追跡済みという事実だけで分類しないこと
      - 要件行4（AG-003）: 一時資材は案件スコープの専用領域へ配置すること。専用領域の運用と実行可能な作成経路の制限を接続し、任意のshell/Python/native/OpenCode子processを自由に実行させたまま引数のpattern検査だけで全作成物の捕捉を主張しないこと
      - 要件行5（AG-003）: 未登録・範囲外の一時資材の作成を機械検出または実行制限すること。機械検出も実行制限も成立しない作成経路が残る場合は未達として報告し、解消されない限り完了扱いとしないこと。申告された集合だけの検査を成立扱いにしないこと
      - 要件行6（AG-005）: 一時資材の削除は、利用者の削除確認と対象の正確な識別情報（所在、種別、内容の識別。同名別物、PID再利用、symlink/junctionの参照先を含む）との対応が確認できた場合だけ実行すること。確認なし、対象の追加変更後、別物への入替え時は削除しないこと。実行担当が生成したapproval等の機械可読値だけを利用者確認として扱わないこと。確認済み識別情報との対応を残置許容の例外として流用しないこと
      - 要件行7（AG-004）: 検証の必要な結果（入力、対象版、操作、実結果、失敗、訂正、判定理由）は本体Issue/PRへ保存し、回収した一時資材へのアクセスなしで読み戻して理解できること。全生ログ、環境一式、Git bundleを別保管庫へ移して恒久保持する方式を採らないこと。機械判定のためにローカル生ログの永久保持を要求しないこと
      - 要件行8（AG-007）: 一時資材の生成記録が空の場合、作成物が存在しないことと生成記録が欠落していることを区別して扱うこと。区別できない空の生成記録を作成物なしの根拠にしないこと
      - 要件行9（AG-008）: 一時資材の登録・追跡に使う記録自体も一時資材とし、終了時の回収対象に含めること。保存すべき最終記録は本体Issue/PRへ収束させること

      ## 適用範囲

      - 対象: ADFの作成・委譲入口（case-open、case-runの実行委譲を含む）における一時資材の登録、正式成果物と一時資材の役割分類、案件スコープ専用領域、未登録・範囲外作成の機械検出・実行制限、削除確認と識別情報の対応、証跡の本体Issue/PR保存と読み戻し、生成記録の空状態区別、登録・追跡記録自体の回収
      - 対象外: 完了判定工程での照合・拒否・全終了経路の強制（case-close実行契約 REQ-032）、worktree構造上の一時ファイル配置分類とworktree削除手順（worktree構造的制約 REQ-018）、検証証跡の必須要素と保存様式の一般契約（REQ-007、REQ-101）、未追跡残存の恒常checkerと承認一覧（自己監査コマンド REQ-010、IR-073）、Hermes固有のtool実行基盤・ToDo・Goal・自由文完了報告の配信前判定・既定profileの監督スキル（監督側で別に是正）、新規サービスの構築と常時監視、今回の旧検証資材の個別削除実行（利用者の明示確認後の監督側対応）
  - id: ACT-REQ-002
    artifact: req
    operation: append
    target: docs/requirements/REQ-032.md
    target_area: 要件
    source_items: [AG-006, AG-007]
    content: |
      | REQ-032-043 | case-close は完了判定工程で、当該 Case 実行の登録済み一時資材の生成記録と実物を照合し、ローカル、remote、分岐、process、listen、および gitignore 対象の一時出力を検査すること。照合の評価範囲は一時資材の登録契約から導出すること |
      | REQ-032-044 | case-close は終了対象について未登録の一時資材、残存、削除確認の不存在または識別情報の不一致、検査不能、検査器の異常のいずれかを検出した場合、完了扱いとしないこと。必要な検証結果が本体 Issue/PR へ保存され、確認された一時資材の回収が確認できた場合だけ終了を許可すること |
      | REQ-032-045 | case-close は remote 上の対象の不存在判定を HTTP 404 単独で行わないこと。private リポジトリでは権限不足も 404 で発生するため、認証、可視性、対象 ID を確認し、確認後も判断できない場合は終了を拒否すること |
      | REQ-032-046 | case-close と同一の終了操作を実行できる全ての経路（公開 Custom Tool の直接 issue_close、Local 版実装、親の集約経路を含む）は、終了操作の前提条件として機械受理の判定を消費すること。判定を経由しない終了経路を残さず、検査設定の省略・解除、過去の合格結果の再利用で終了を通過させないこと |
  - id: ACT-DESIGN-001
    artifact: design
    operation: create
    target_design:
      operation: create
      domain: workflows
      slug: verification-resource-lifecycle
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-008]
    content: |
      # 検証用一時資材のライフサイクル（登録・検出・照合・回収）

      ## 目的

      Case実行で作成される検証用一時資材を正式な成果物と区別し、作成入口での登録、終了時の照合・回収、削除確認、証跡の保存を単一契約として所有する。RU-0255〜0260のCase/PR終了後に検証用remote、clone、bare repository、退避ログ、補助スクリプト、専用serverが残存し、全作業完了と誤報告された事象の再発防止を目的とする。

      新規統制の正当性（DEC-001 決定4の7条件）:
      (1) 問題の再現性 — 2026-11-05時点で複数種別の一時資材残存が実観測済みである。
      (2) 統制に見合う害 — 完了誤報告と検証資材の残存である。
      (3) 除外・統合・助言で防げない — PR自己申告と終了時LLM抽出では防げないことが事象で確認済みである。
      (4) 機械強制の実現性 — 台帳と照合scriptで実現する（検出不能経路は未達報告とする）。
      (5) 単一の正規所有者 — 本Designと一時資材の登録と回収を所有するREQである。
      (6) 削除・簡略化できる既存物 — case-close Designの旧「tmp 残存確認」単独記述は本照合へ吸収して拡張し、別系統の検査基盤は作らず既存close_mechanical_steps.tsとそのテストを拡張する。
      (7) 将来の再評価・撤去条件 — 作成経路の制限により未登録作成が構造的に排除され、台帳・照合が不要と評価された場合である。

      ## 台帳（生成記録）

      - データモデル: 案件識別子（Case/Root Case/Epic Issue番号）、種別（remote/clone/bare repository/退避ログ/補助スクリプト/専用server/専用process/その他一時出力）、所在（絶対パスまたはURL）、識別情報（パス、サイズ、内容ハッシュ、PID、コマンドライン、listenポート、URL、repo識別）、回収担当（記録した入口の識別）、所有区分（親/子/共通）、作成経路（記録主体）、作成時刻
      - 記録主体: ADFの作成・委譲入口（case-openの検証環境構築、case-runの実行委譲、委譲先からの作成報告を受領する実行処理）が実行処理として記録する。委譲契約（v4-delegation-contracts Design「検証用一時資材の作成・報告義務」節）に専用領域作成義務と作成報告義務を組み込む。PR本文への自由文自己申告と終了時のLLM抽出で代替しない
      - 保存場所: メインrepo rootの `.agentdev/tmp/verification-resources/{案件識別子}.json`（gitignore対象・非永続）。worktree root相対の `.agentdev/tmp/`（REQ-018-008の証跡退避分類 (b)）とは区別し、worktreeライフサイクルをまたぐ案件スコープの記録はメインroot側に置く。並列Caseは案件単位ファイルで分離され書込み競合しない
      - durable state上の位置づけ: ローカル実行環境状態の一部として、close時照合までの期間に限定したローカル一時保持（DEC-038 決定(3)。起動時対象集合と同型の先例に従う）。恒久証跡とは扱わない。保存すべき最終記録は本体Issue/PRへ収束する（v4-durable-state-and-recovery Design「repo 外の一時証跡退避先…恒久的な証跡は Issue コメントまたは PR 本文へ記録する」規定に従う）
      - 空状態の区別: 台帳ファイル不在または空の場合、作成物が存在しないことと記録が欠落していることを区別する。区別できない空の記録を作成物なしの根拠にしない
      - 評価単位: 子 Issue の終了判定は子所有の一時資材のみを評価し、親・共通の一時資材は親（Epic/Root Case）の最終終了時に評価する（REQ-032-038 の子 Issue 終了判定との整合。「全体を未完了として扱う」は親の管理する終了単位への適用である）
      - 適用開始境界: 本Designの導入commit以降に作成・委譲される一時資材から適用する。導入前に作成された未登録資材は照合で未登録として検出・報告し、拒否の解消は利用者確認済みの削除による

      ## 正式成果物と一時資材の役割分類

      - 正式な成果物（対象repoに登録し維持）: 実装、テストコード、必要なテストデータ・期待結果、環境再現スクリプト、正式な手順文書
      - 一時資材（回収対象）: テスト実行で生成したデータ、clone、検証用remote、ログ、専用server・process
      - 分類は役割で判定し、拡張子、testという名前、git追跡済みという事実だけでは判定しない

      ## 専用領域と作成経路の制限（機械検出と実行制限）

      - 一時資材は案件スコープの専用領域（repo外の案件識別子付きディレクトリ等、台帳に記録された所在）へ配置する
      - 正規の作成経路: 検証用資材の作成ヘルパー（case-open・case-runの実行処理から呼ばれるscript。作成と同時に台帳へ登録する）を提供し、作成時の機械登録を実現する
      - 委譲契約上の専用領域作成義務と作成報告義務は委譲先の責務の宣言であり、それ自体は機械的制限ではない。機械的な抑止は次の2点が担う
      - close時の機械検出（観測）: (a) 専用領域の実在物と台帳の差分、(b) 対象repoのremote・worktree・branch列挙と台帳照合、(c) 台帳記録PIDの生存確認とコマンドライン一致、(d) OS一時領域の案件識別子パターン走査、(e) gitignore対象一時出力の列挙、(f) 導入時既知残存リストとの照合（導入前資材の所在・識別情報を導入時に一度だけ収集したリスト。リスト記載資材は存在する限り拒否理由となり、リスト外の実在物は未登録として検出する。リストは回収の進捗とともに更新し、全回収後に空となる）。観測は申告（台帳・委譲報告）と独立に実行し、観測が申告の欠落・不一致を検出した場合は未登録として完了を拒否する
      - 検出範囲の除外規則: 観測 (e) の gitignore 対象一時出力の検査は、台帳・終了判定記録自身（.agentdev/tmp/verification-resources/、.agentdev/close-acceptance/）と、正規の gitignore 運用領域（REQ-018-008 の定める .agentdev/tmp/ 証跡退避、.agentdev/integrity/reports/ 等）を検査対象から除外する。除外は検出範囲の宣言として事前に定義し、無制限な除外（残置許容）としない
      - 実行制限（機械的拒否）: 終了操作の前提条件としての機械受理判定と、agentdev_gh issue_close の Tool 境界検証（REQ-052-018）により、照合不成立時は終了操作そのものが実行されない
      - 検出範囲の宣言: 観測 (a)〜(e) の範囲を検出範囲として事前に宣言する。観測範囲外の任意パスへの作成（例: 案件識別子を含まない任意名での作成）を事前に阻止する機構は、委譲先が任意のshell/Python/native/OpenCode子processを実行できる以上、ADFの管理外である。この経路は申告と観測の不一致・未登録検出による終了拒否で抑止し、機械検出も実行制限も成立しない必須の作成経路が残る場合は受入未達として完了を許可しない（申告された集合だけの検査を成立扱いにしない）
      - 本checker族に承認一覧（baseline）形式の残置許容は持たせない（IR-073の未追跡残存承認一覧とは別契約である）

      ## 削除確認

      - 回収の削除は、利用者の明示確認と対象の正確な識別情報（所在・種別・内容識別・PIDとコマンドライン・URL）との対応が確認できた場合だけ実行する
      - 確認なし、削除提案からの対象の追加変更（識別情報不一致）、別物への入替え時は削除しない。実行担当が生成したapproval等の機械可読値だけを利用者確認として扱わない。同名別物、PID再利用、symlink/junctionの参照先誤消去を識別情報照合で防ぐ。確認済み識別情報との対応を残置許容の例外として流用しない

      ## 照合（close時）と全終了経路

      - 照合手続きはcase-closeの機械工程に組込む。検査対象・拒否条件・許可条件はcase-close実行契約（REQ-032-043〜046）とcase-close Designが所有し、本Designは照合の入力（台帳）と分類規則を所有する
      - 照合結果は機械工程の報告JSONを通じて終了操作の許可判定（close_mechanical_steps.ts の isCloseOperationPermitted の判定材料）へ反映する。あわせて機械工程は終了判定記録を `.agentdev/close-acceptance/issue-{NNNN}.json` へ書き出す。終了判定記録の様式は対象 Issue 番号、判定対象版（close 時点の対象を識別する版情報）、判定生成時刻、判定内容を含み、issue_reopen は当該 Issue の終了判定記録を無効化する（過去の合格結果の再利用を許さない）
      - agentdev_gh の issue_close は、Case Issue（case role）への終了操作について、呼出元の申告によらず自ら終了判定記録を読み取り検証し、検証できない場合は終了の副作用を実行しない（Tool 実行境界での機械的拒否。REQ-052-018、custom-tool-contracts Design「issue_close の終了前提」）
      - これにより、単一IssueのSTEP-5、Epic E1〜E6、case-autoの集約経路、ローカル版実装、および公開Toolへの直接呼出しのすべてで、機械受理の判定を経由しない終了操作が実行境界で拒否される。判定を経由しない終了経路を残さない
      - 生gh WRITEの迂回は既存のPlugin/Hook guard（gh-write系）が担う（REQ-052-002）。同一マシン上の呼出元による終了判定記録の偽造防止は本契約の対象外（事故的迂回と規律欠落の抑止を対象とする）
      - 認証・可視性・対象IDの確認を要するremote判定（404単独不採用）も機械工程で実行する

      ## 証跡の保存と読み戻し

      - 検証の必要な結果（入力、対象版、操作、実結果、失敗、訂正、判定理由）は本体Issue/PRへ保存する（SSoTコメント・PR本文検証差分の既存チャネル。様式はagentdev-workflow-templates Designとissue-lifecycle-records Designの既存契約に従う）
      - 回収した一時資材へのアクセスなしで読み戻して理解できることを保存形式の要件とする
      - 全生ログ、環境一式、Git bundleを別保管庫へ移して恒久保持する方式は採らない。機械判定のためにローカル生ログの永久保持を要求しない
      - 台帳（追跡記録）自体も終了時の回収対象とし、保存すべき最終記録は本体Issue/PRへ収束させる
      - 終了判定記録（.agentdev/close-acceptance/）もローカル実行環境状態として終了後に回収する

      ## 実装面

      - 登録・検出・照合の機械処理は、既存のcase-close機械工程script（close_mechanical_steps.ts）とそのテスト基盤（bun:test、fakeRunner注入、参照pin。FP-n/FN-nシナリオはfinal-acceptance.test.ts・wave-gate.test.tsが所有）を拡張して実装し、別系統の検査基盤を作らない
      - 新規サービスの構築と常時監視は行わない。照合・検出はclose時のオンデマンド実行に限る
      - agentdev_gh の Tool 境界強制（issue_close の前提検証）は runner-cli.ts・runner-local.ts の両実装と contracts/engine の失敗分類に実装し、終了判定記録の書出し（機械工程）との結合を単体試験で固定する
      - Windows環境のprocess・listen検出の実現可能性は実装時に検証し、成立しない経路は未達として報告する
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: commands
      slug: case-close
    target_area: full integrity suite 実行と tmp 残存確認
    source_items: [AG-006]
    content: |
      ### full integrity suite 実行と tmp 残存確認

      - full integrity suite 実行（QG-4 合格基準）: bun test 実行形態は 3 cwd 分割正規形に従う（① integrity suite、② src 側 skill script テスト、③ repo ルート系 guard テストの3分割。各実行の cwd はリポジトリルートに統一、`./` prefix 付きの対象ディレクトリ明示指定、分割② 前の依存パッケージ前置、N/M 件数突合、固定値の期待値化なし、カレントディレクトリトリビアな実行の禁止）。実行形態契約の正は agentdev-quality-gates Design「full integrity suite 合格基準（QG-4）における bun test 実行形態契約」と同スキル references/qg-4-final-acceptance.md が所有する
      - 配布物変更を含む case の3検査結果確認: case-close の最終 gate で配布物変更を含む case を検証する場合、配布依存境界・IR-055・traceability の3検査の実行結果（case-run での commit 前実行記録）を確認する。case-run で3検査が実行されていない配布物変更を検出した場合は、検査を実行して新規違反 0 件を確認してからマージに進む。base 既知違反と新規違反の分離突合を省略せず、baseline 既知違反の無断削除・隠蔽を受け入れない
      - tmp 残存確認: 単一 Issue ルートの正常終了を前提として、当該実行で `.agentdev/tmp/` に作成した一時ファイルが残存していないことをクリーンアップ工程で確認する。Epic Wave ルートでは、当該 Wave スコープの一時成果物（draft、RU、検出事項等の未消化ドメイン状態）の残留と `.agentdev/tmp/` 一時ファイルの残存がないことを確認し、残留時は当該 Wave を完了扱いにしない
      - 検証用一時資材の照合と回収: 完了判定工程は、当該 Case 実行の登録済み一時資材（検証用remote、clone、bare repository、退避ログ、補助スクリプト、専用server・process等。登録契約は検証用一時資材のライフサイクル Design）の生成記録と実物を照合する。検査対象はローカル、remote、分岐、process、listen、および gitignore 対象の一時出力とし、評価範囲は登録契約から導出する（REQ-032-043）。未登録・残存・削除確認の不存在または識別情報の不一致、検査不能、検査器の異常を検出した場合は完了扱いとせず、必要な検証結果が本体 Issue/PR へ保存され、確認された一時資材の回収が確認できた場合だけ終了を許可する（REQ-032-044）。remote 上の対象の不存在判定は HTTP 404 単独で行わず、認証・可視性・対象 ID を確認しても判断できない場合は終了を拒否する（REQ-032-045）

      #### 保存済み検証証跡の解析と再実行条件の適用

      - 検証結果の件数、失敗明細、サマリーの表示変更は、保存済み証跡（退避ファイル、PR 本文検証差分セクション、SSoT コメント）から行う。同一情報の取得だけを目的とした full suite や checker の再実行をしない（REQ-007-014）
      - 再実行の正当理由（変更後検証、環境変更、失敗由来分類、非決定的失敗の再現確認、必須独立検査、証跡欠落）と証跡の必須要素の正は agentdev-quality-gates Design「QG-4 検証証拠の再利用と再実行条件」が所有し、本 Design は再規定しない
      - close の最終検証（full integrity suite、配布物変更を含む case の3検査結果確認、QG-4 checker 実測）は origin/main 取り込み済み・マージ直前の branch HEAD で実行する既存契約を維持し、case-run の保存結果だけによる省略を行わない。verify-only closure の SSoT コメント参照判定も維持する
      - textlint 共通基盤によるファイル単位結果の再利用（同一性条件付きの規則実行省略）は検査基盤内部の実行形態であり、close の最終検査の実行義務の省略を構成しない。close の最終検査は対象全件の列挙・全文取得と現在入力との照合を伴う検査基盤の実行を毎回行い、その内部で同一性が機械検証できた対象の規則実行省略が許容される

      #### verify-only closure の QG-4 達成判定（SSoT コメント参照）

      verify-only closure（PR も carrier commit も存在しない Issue 完了）の QG-4 達成判定では、case-run が記録した SSoT コメント（Issue コメント）を実行コマンド列・検証結果の判定根拠として参照する。PR が存在しないため PR 本文の検証差分セクションは存在せず、SSoT コメントが検証証跡の恒久記録の正となる。

      - 参照手順: SSoT コメントから (1) 3検査（配布依存境界・IR-055・traceability）の実行記録と新規違反 0 件確認、(2) integrity suite の N/M 件数突合と直前実績比較、(3) 実行コマンド列の再実行可能性（実行 cwd・実行形態の記載）を確認する
      - 完了抑止: SSoT コメントが存在しない verify-only closure、または SSoT コメントに検証結果の記載が欠落している場合は QG-4 不合格として完了扱いにしない
      - capture 回収の N/A: verify-only closure では PR 本文が存在しないため capture 回収（REQ-032-005 の PR 本文入力源）は N/A とする。SSoT コメントを capture 入力源として扱わない（SSoT コメントは検証証跡チャネルであり capture チャネルではない）
  - id: ACT-DESIGN-003
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: commands
      slug: case-close
    target_area: 機械工程の script 呼び出し契約（RU-0162）
    source_items: [AG-006, AG-007]
    content: |
      ## 機械工程の script 呼び出し契約（RU-0162）

      case-close の機械工程（mergeable ポーリング、squash merge 前後のローカル状態検査、Epic 実行構成表の解析と状態更新、完了条件チェックボックス評価の機械的抽出、AUTOGEN 再生成差分検出、full integrity suite の起動と結果集約、検証用一時資材の生成記録と実物の照合および回収、worktree/branch クリーンアップ）は、工程別 script 1 回の呼び出しに束ねる。GitHub I/O（pr_merge、issue_close、Issue 本文更新）は Custom Tool agentdev_gh の境界を維持する。

      - 入力 JSON / 報告 JSON / 終了コードの契約、品質ゲートの script 内実行（省略禁止）、final-acceptance.ts・inspect_cross_dependencies.ts と同じ作り（共通基盤不作成）、意味判断（警告の重要度評価、Design 確定判断、未達判定の確定）のモデル担当は、case-open Design「機械工程の script 呼び出し契約（RU-0162）」節と同一の規律に従う
      - 報告 JSON にはマージ・検証・クリーンアップの各結果、差分、警告、提案するコメント本文を含める
      - workflow skill 参照文面は script 呼び出しと報告 JSON 解釈へ置き換えて短縮する
      - 完了条件チェックボックス評価の機械的抽出（close_mechanical_steps.ts の抽出フェーズ）は、受入評価（final-acceptance.ts への入力）の母集団導出を兼ねる。抽出結果（正規完了条件の一覧とその取得成否）を受入評価入力へ渡し、報告 JSON に母集団と判定の対応を含める。抽出失敗は評価の blockers 扱いとし、空の判定入力を「条件なし」へ変換しない
      - final-acceptance.ts（evaluateFinalAcceptance）は完了条件単位評価の機械評価部品として、判定入力（verdicts・crossObligations）の構造検査と必須未達・根拠欠落の検出を担う。証拠の意味対応評価（証拠が条件の意味命題を立証しているか）はモデルが担当し、機械部品の通過だけで完了を確定しない
      - 受入評価の拒否・未確定の結果（closeAllowed 相当の判定とその根拠）は報告 JSON を通じて終了操作の実行抑制として消費される。STEP-5 の issue_close 実行と E1〜E6 の Epic 終了は、受入評価の許可を前提条件として扱い、拒否結果を保持したまま終了操作を実行しない
      - gate 証跡保持要件: 機械工程の品質ゲート（full integrity suite 等）のうち stderr 出力ランナー（bun test 等）を含む検証は、当該ランナーの検証実行（script 外の直接実行）に stdout と stderr の分離退避を常時付与する。機械工程 script 呼び出し自体のリダイレクトラップは現行 runner が stderr を内部捕捉するため証跡成立手段にならない。件数突合系 gate の受理根拠は stderr 退避ファイル（件数サマリーの出力先）に置き、検証差分には既存の検証差分記録規約（agentdev-workflow-templates）に従い保存先・終了コード・checker の版・検査範囲・実行環境を記録する。報告 JSON の保持構造への依存（stdout のみ保持等）を証跡の成立根拠にしない

      ### QG-4 機械受理基準と機械判定経路の対応（RU-0226）

      機械受理基準の full integrity suite 判定と QG-4 最終受入規範（agentdev-quality-gates の references/qg-4-final-acceptance.md）の機械受理基準との対応は本節が単一所有する。機械受理基準の記録様式の定義は QG-4 規範が正であり、本節は対応関係のみを記述し様式を再掲しない。

      - 機械受理基準と機械判定経路の対応: 受理条件5（fail 全件の由来分類、由来不明 0）と受理条件7（pre-existing fail の baseline 再現確認記録）を満たす検証結果記録は、full integrity suite に fail 件数が残存していても規範が合格として認める受理経路である。機械工程は当該記録の存在・形式を機械受理基準の10項目の記録完備で検証し、終了操作許可の判定に反映する。受理条件8の「非ゼロ終了・timeout 打ち切り・切断した実行結果を pass 証拠として扱わない」は、由来分類記録を欠く生の実行結果単独を pass 証拠としない意味として適用する
      - 拒否経路の背反防止: 受入評価の拒否（closeAllowed 相当）と機械工程の exitCategory による拒否の2系統は、同一入力に対して同一の判定結果へ収束すること。機械受理基準を満たす記録で分類済みの fail が残る場合、機械工程の当該 step は規範の判定に従い、機械受理基準の記録欠落、由来不明 fail の残存、未登録の既知欠陥を合格の根拠にする場合は fail-closed として終了操作を拒否する
      - 終了コードの非変換: 機械工程は検証ランナーの非ゼロ終了コードを成功へ変換しない。終了コードは受理条件8の記録として保持し、分類記録の検証は終了コードの変換ではなく独立の判定層として重ねる
      - 既知欠陥登録経路の対応: checker NG の登録は provenance 付き NG baseline（契約の正は checker 実行契約 Design「baseline 退避物と BaselineFile の役割分離と合否判定基準」節と integrity 契約 Design「NG baseline 運用手順」）とする。bun test suite fail の登録様式は文言統合とする（ユーザー判断 2026-10-15・判断記録 CR-003/CR-004）: 機械受理基準の記録一式（受理条件5の由来分類記録・受理条件7の baseline 再現確認記録・provenance・件数記録）を登録様式と定義し、恒久台帳は新設せず、既存の PR 本文検証差分が当該記録一式の登録として機能する。整合方向は機械工程側の修正（implementation-first）に確定済みであり、機械工程は当該記録一式の存在・形式を機械受理基準の10項目の記録完備で検証して終了操作許可の判定に反映する。未登録の既知欠陥を合格の根拠にする結果の拒否は維持する
  - id: ACT-DESIGN-004
    artifact: design
    operation: append
    target_design:
      operation: update
      domain: workflows
      slug: v4-delegation-contracts
    target_area: 委譲時最小契約
    source_items: [AG-002, AG-003]
    content: |
      ### 検証用一時資材の作成・報告義務

      実行委譲（case-run から実行担当サブエージェントへの委譲）の委譲時最小契約は、検証用一時資材の作成に関する次の義務を含む。所有契約の正は検証用一時資材のライフサイクル Design が担い、本節は委譲契約への接続のみを定める。

      - 委譲先は検証用一時資材を案件スコープの専用領域へ作成し、作成した資材の種別・所在・識別情報を委譲元の実行処理へ報告する。報告を受領した実行処理が生成記録（台帳）へ登録する
      - 専用領域外への作成は委譲制約（MUST NOT DO）とする。報告のない作成物は未登録資材として close 時照合の検出対象となる

  - id: ACT-REQ-003
    artifact: req
    operation: append
    target: docs/requirements/REQ-052.md
    target_area: 要件
    source_items: [AG-007]
    content: |
      | REQ-052-018 | agentdev_gh の issue_close は、Case Issue（case role の Issue）への終了操作について、case-close 機械工程が生成した機械受理の判定記録を呼出元の申告によらず自ら読み取り検証し、記録が存在しない、読み取れない、対象と一致しない、判定が不成立のいずれかの場合は終了の副作用を実行せず失敗すること。判定記録の様式・保存場所は Design が所有すること |
  - id: ACT-DESIGN-005
    artifact: design
    operation: append
    target_design:
      operation: update
      domain: responsibilities
      slug: custom-tool-contracts
    target_area: 対象操作の境界（初期セット）
    source_items: [AG-006, AG-007]
    content: |
      ### issue_close の終了前提（Case Issue）

      issue_close は、対象が Case Issue（case role の Issue）である場合、終了操作の前提として機械受理の判定記録を検証する。判定記録は case-close 機械工程が生成し、決定的な保存場所（メイン repo root の `.agentdev/close-acceptance/issue-{NNNN}.json`）に置かれる。Tool は呼出元の申告を受け取らず、自ら記録を読み取り、対象 Issue 番号と判定対象版（close 時点の対象を識別する版情報。様式はライフサイクル Design が所有）への束縛と判定内容（検証用一時資材の照合を含む機械受理の成立）を検証してから副作用を実行する。記録が存在しない、読み取れない、対象 Issue または対象版と一致しない（過去の合格結果の再利用を含む）、判定が不成立のいずれかの場合は副作用を実行せず構造化失敗を返す（fail-closed、REQ-052-004 と同型）。追跡Issue（tracking role）の終了には本前提を適用しない。記録の保存場所はメイン repo root に固定し、Tool は worktree コンテキストから呼び出された場合も main repo root 側の保存場所へ解決する（呼出側の cwd に依存しない単一の決定的解決規則。agentdev_jev 観測と同一の内部解決）。判定記録の様式・保存場所・回収は検証用一時資材のライフサイクル Design が所有する。同一マシン上の呼出元による判定記録の偽造防止は本契約の対象外（事故的迂回と規律欠落の抑止を対象とする）とし、生 gh WRITE の迂回検出は REQ-052-002 の既存 Plugin/Hook guard が担う。

conflict_resolutions:
  - id: CR-001
    conflict: 「ADFに全くcleanupがない」とする説明
    resolution: 当該説明は誤りとして採用しない。既存機構（REQ-032-022/042、case-close Designのtmp残存確認、IR-073）の調査で限定されたcleanupが実在するため、既存機構の拡張として実装する方針を確定した（入力本文の事実確認に基づく）
  - id: CR-002
    conflict: Hermes固有実装（tool実行基盤、ToDo、Goal、自由文完了報告の配信前判定、既定profileの監督スキル・実行側Python）の取り扱い
    resolution: 監督側で別に是正する対象として本件入力に含めない。両者の結果の受渡しが必要な部分はADF側の明示された境界契約として扱い、自己申告成功を受理しない（入力「責任の分離と対象外」の合意に基づく）
  - id: CR-003
    conflict: RU-0254、既存の別draft（req-draft-caseready-cleanup-suppression.md、req-draft-correction-3887-verification.md）、既存open Issue #3899 との関係
    resolution: 本件入力に含めない。過去RUのAC追加や再試験、既存の失敗・訂正・未検証の成功への書き換えを行わない（入力「責任の分離と対象外」の合意に基づく）
  - id: CR-004
    conflict: 今回の旧検証資材（RU-0255〜0260由来の残存物）と保護対象ファイルの扱い
    resolution: 旧資材は削除せず、その残存による終了拒否を確認できることを検証とする。旧資材の個別削除と削除許可後の実不存在確認は利用者の明示確認後の監督側対応とする。AGENTS.md等の保護対象は個別許可なく変更しない（入力「受入と検証」「責任の分離と対象外」の合意に基づく）
  - id: CR-005
    conflict: 合意の弱化リスク（申告資材だけの検査、404単独判定、任意実行checker、残置許容への読き替え）
    resolution: いずれも行わない。検証は台帳と照合の機械処理を必須とし、checkerを任意実行にしない。既存の監視・権限・品質検査を弱めない（入力の明示的合意に基づく）
  - id: CR-006
    conflict: 終了経路の強制点（監督照合による訂正 2026-11-05）
    resolution: workflow入口での判定消費のみとし「新規tool境界強制とguard拡張は行わない」とする除外は利用者の合意に含まれないため採用しない。agentdev_gh issue_close の Tool 実行境界において、case-close 機械工程が生成した終了判定記録を呼出元の申告によらず自ら読み取り検証し、検証できない直接呼出しを実際に拒否する実現面（runner-cli.ts・runner-local.ts・contracts/engine・REQ-052-018・custom-tool-contracts Design）を必須として確定した。参照pinや呼び方の規約のみで成立させない。生gh WRITEの迂回は既存guardの所管のまま
  - id: CR-007
    conflict: 作成時の機械登録と検出・制限の実現面（監督照合による訂正 2026-11-05）
    resolution: 委譲契約のMUST NOT DOは機械的制限ではないため、実行制限として書かない。作成と同時に台帳登録する作成ヘルパー（正規の作成経路）、close時の機械観測（申告と独立な検出スキャン）、Tool境界・終了判定による機械的拒否を実現面として確定し、担当の申告と機械の観測を分離した。機械検出も実行制限も成立しない必須経路が残る場合は受入未達として完了を許可せず、未実現の必須経路を成立済みと書かない

operation_units:
  - ou_id: OU-001
    target_req: new:verification-resource-cleanup
    operation: create
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: single
  - ou_id: OU-002
    target_req: REQ-032
    operation: append
    scale: standard
    depends_on: [OU-001]
    recommended_order: 3
    issue_policy: single
  - ou_id: OU-003
    target_design:
      operation: create
      domain: workflows
      slug: verification-resource-lifecycle
    operation: create
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
  - ou_id: OU-004
    target_design: docs/designs/commands/case-close.md
    operation: update
    scale: standard
    depends_on: [OU-003]
    recommended_order: 4
    issue_policy: single
  - ou_id: OU-005
    target_design: docs/designs/workflows/v4-delegation-contracts.md
    operation: append
    scale: standard
    depends_on: [OU-003]
    recommended_order: 5
    issue_policy: single
  - ou_id: OU-006
    target_req: REQ-052
    operation: append
    scale: standard
    depends_on: [OU-003]
    recommended_order: 6
    issue_policy: single
  - ou_id: OU-007
    target_design: docs/designs/responsibilities/custom-tool-contracts.md
    operation: append
    scale: standard
    depends_on: [OU-003]
    recommended_order: 7
    issue_policy: single

result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      役割分類規則の単体テストをcase-close scripts配下のテスト基盤と同じ慣例（bun:test、fakeRunner等の依存注入、日本語describe/test、参照pin。FP-n/FN-nシナリオはfinal-acceptance.test.ts・wave-gate.test.tsが所有）で作成する。正式成果物候補（テストコード、期待結果データ、環境再現スクリプト、正式な手順文書）が回収対象外、テスト実行生成物（実行時生成データ、ログ、clone、専用process）が回収対象に分類されることと、拡張子・test名・git追跡済み事実だけでは判定しないことを含む判定例を検証する。実装前にテストが失敗すること（fail-first）を確認し、実装後に同一試験で成功することを確認する。
    pass_criteria: |
      全分類シナリオが期待どおり判定され、fail-firstの記録と修正後の同一試験成功が確認できること。
    on_failure: |
      fix-and-reverify。分類規則または実装を修正し同一試験を再実行する（拒否経路の検証を省略しないため）。
  - id: TS-002
    target_item: AG-002
    verification: |
      作成・委譲入口の実行処理が台帳へ案件・種別・所在・識別情報・回収担当を記録すること、親・子・共通の所有区分が記録されることを単体テストで検証する。子Issue完了時の照合で親・共通資材の残存が全体未完了として扱われることを完了判定の単体テストで検証する（評価単位: 子closeは子所有資材のみ評価し、親・共通は親の最終終了時に評価する）。PR本文の自由文自己申告のみでは台帳記録が成立しないことを、申告入力のみの経路のテストで確認する。
    pass_criteria: |
      台帳記録の必須項目が実行処理により記録され、親・子・共通区分が保持され、親・共通残存時の全体未完了が機械判定されること。
    on_failure: |
      fix-and-reverify。登録経路または完了判定の修正後に同一試験を再実行する。
  - id: TS-003
    target_item: AG-003
    verification: |
      検証環境で未登録の資材（専用領域外のファイル、repo外の案件識別子付きディレクトリ、未登録remote、未登録process）を実際に作成し、close時検査が未登録・範囲外として検出して拒否することを確認する。観測手段 (a)〜(f) の検出範囲の宣言（除外規則を含む）と実装の観測範囲の一致を確認する。機械検出も実行制限も成立しない作成経路が残る場合、当該経路が受入未達として報告され、かつ完了拒否（REQ-032-044、新規REQ 要件行5）の対象となることを集約判定で確認する。未達の報告だけでは試験合格・Case完了とならないことを確認する。試験で作成する資材は本件の案件スコープ専用領域へ配置して回収担当を定め、不要な新remote/clone/検証repoを作成しない。
    pass_criteria: |
      実装済み観測範囲での検出・拒否の成立と、未成立経路の受入未達扱い（報告のみで完了扱い・合格扱いにしない集約判定）が確認できること。
    on_failure: |
      fix-and-reverify。観測手段または受入未達の集約判定を修正し同一試験を再実行する。未実現の必須経路を成立済みとして記録しない。
  - id: TS-004
    target_item: AG-004
    verification: |
      一時資材の回収後、本体Issue/PRに保存された記録のみから入力・対象版・操作・実結果・失敗・訂正・判定理由が復元できることを、保存形式の単体テストと実経路での保存確認で検証する。全生ログ・環境一式・Git bundleの別保管庫が実装に存在しないことを構造確認で確かめる。機械判定のためにローカル生ログの永久保持を要求する実装でないことを確認する。
    pass_criteria: |
      回収後の読み戻しで7要素が復元でき、別保管庫・恒久保持方式が存在しないこと。
    on_failure: |
      fix-and-reverify。保存形式を修正し同一試験を再実行する。
  - id: TS-005
    target_item: AG-005
    verification: |
      削除提案が識別情報（パス、種別、内容識別、PIDとコマンドライン、URL）とともに提示され、確認なし・対象の追加変更後（識別情報不一致）・別物への入替え時に削除が実行されないことを単体テストで検証する。実行担当が生成したapproval等の機械可読値のみで削除が実行されないこと、同名別物・PID再利用・symlink/junction参照先の誤消去が識別情報照合で防止されることを検証する。試験内の仮確認を実際の利用者の削除承認に流用しないことを、確認境界の実装確認で保証する。
    pass_criteria: |
      識別情報不一致時の削除不実行、機械可読値のみの削除不実行、リンク参照先の誤消去防止がすべて確認できること。
    on_failure: |
      fix-and-reverify。識別情報照合または確認境界を修正し同一試験を再実行する。
  - id: TS-006
    target_item: AG-006
    verification: |
      終了前照合の単体テストと実経路検証で、ローカル残存1件、remote・分岐・process・listen残存、gitignore対象一時出力残存（除外規則で除く領域を誤検出しないことを含む）、未登録資材を検出して完了を拒否することを確認する。台帳登録済み資材が削除確認記録なしに消失した場合（確認フロー外の削除）に削除確認の不存在として完了を拒否することを確認する。認証失敗・timeout・検査器異常時にfail-closedで拒否することを検証する。remote不存在判定で404単独の判定を行わないこと（認証・可視性・対象ID確認後、判断不能時の拒否）を検証する。今回の旧検証資材（削除しない）は導入時既知残存リスト経由で検出され、その残存により終了が拒否されることを確認する。実経路で拒否を確認した後の完了順序（利用者の削除確認、監督側の削除、実不存在確認、close再実行による完了）を満たすことを確認する。
    pass_criteria: |
      列挙した全拒否条件が検出時に完了拒否となり、旧資材残存による拒否が確認できること。
    on_failure: |
      fix-and-reverify。照合・検出の修正後に同一試験を再実行する。
  - id: TS-007
    target_item: AG-007
    verification: |
      agentdev_gh の issue_close について、(1) 終了判定記録が存在しない、(2) 記録が読み取れない・形式不正、(3) 対象Issue番号と一致しない、(4) 判定が不成立（照合拒否を含む）の各場合に、CliRunner と LocalRunner の両実装で終了の副作用が実行されず構造化失敗することを単体試験で検証する。(5) 過去の合格結果の再利用（判定対象版の不一致、issue_reopen 後の旧記録）で拒否されることを検証する。(6) worktree コンテキストから呼び出された場合も記録の保存場所が main repo root 側へ解決され検証されることを検証する。機械受理成立時のみ終了が実行されること、追跡Issue（tracking role）の終了に前提が適用されないことを確認する。あわせて four-combination 共有シナリオの拡張で、STEP-5・E1〜E6・case-auto集約・ローカル版の各経路が機械受理不成立時に終了操作を実行しないことを確認する。作成物ゼロ（正当な空）と生成記録欠落が区別されること、検査設定の省略・解除、過去の合格結果の再利用で通過できないことを確認する。
    pass_criteria: |
      全拒否条件で両runnerの副作用不実行と構造化失敗、成立時のみの実行、追跡Issueへの非適用、全終了経路での不実行、空状態の区別と設定操作の拒否が確認できること。
    on_failure: |
      fix-and-reverify。Tool境界の前提検証または終了経路の消費を修正し同一試験を再実行する。規約や参照pinの追加だけで合格扱いにしない。
  - id: TS-008
    target_item: AG-008
    verification: |
      実装が既存の適切な所有者（close_mechanical_steps.ts、close_mechanical_steps.test.ts、case-close Design、委譲契約Design）を拡張していることを変更ファイル構成の確認で検証する。新規の別系統検査基盤ファイルと常時監視プロセスが存在しないことを構造確認する。一時追跡記録（台帳）が終了時の回収対象に含まれることを単体テストで確認する。最終記録が本体Issue/PRへ収束することを保存確認で検証する。
    pass_criteria: |
      既存所有者経由の変更であること、別系統基盤と常時監視の不存在、台帳回収とIssue/PR収束が確認できること。
    on_failure: |
      fix-and-reverify。実装構成を正規所有者経由へ修正し同一試験を再実行する。
  - id: TS-009
    target_item: AG-009
    verification: |
      実装と対応する自動テストがrepoへ登録され、既存close_mechanical_steps.test.ts等のスイートを再利用（拡張）していることをテスト構成の確認で検証する。各試験のfail-firstの記録と、修正後に同じ試験で成功した記録を確認する。テスト失敗の理由が要求の拒否（assertionによる拒否条件の成立）であり、import/構文/依存の失敗でないことを失敗出力の確認で区別する。
    pass_criteria: |
      テスト登録、既存基盤再用、fail-firstと同一試験での成功、拒否成立の証拠がimport等の失敗と区別されて確認できること。
    on_failure: |
      fix-and-reverify。テストまたは実装を修正し同一試験を再実行する。
  - id: TS-010
    target_item: AG-010
    verification: |
      正式なtest source/dataを残したまま、テスト実行が生成した一時資材だけが回収されることを、回収実行後の存在確認（test source/dataの存在と生成物の不在）で検証する。
    pass_criteria: |
      正式資材の残置と一時資材のみの回収が確認できること。
    on_failure: |
      fix-and-reverify。回収対象の分類を修正し同一試験を再実行する。

realization_actions:
  - id: RA-001
    concern: 台帳（生成記録）モジュールと作成・委譲入口での登録
    responsibility: 一時資材の案件・種別・所在・識別情報・回収担当・所有区分を記録する台帳の読み書きモジュールを提供する。作成と同時に台帳へ登録する作成ヘルパー（正規の作成経路）を提供し、case-open・case-runの作成・委譲入口の実行処理から登録する。委譲契約に専用領域作成義務と作成報告義務を組み込む（義務の宣言は機械的制限ではなく、抑止は機械観測と終了拒否が担う）。本Case自身の実装・検証で作成する試験資材も専用領域へ配置し回収担当を定める。不要な新remote/clone/検証repoを作成しない
    ownership_hints:
      - 新規モジュール（case-close scripts配下またはその共通lib。docs/designs/workflows/verification-resource-lifecycle.md の台帳仕様に従う）
      - 作成ヘルパー script（作成と同時の台帳登録。case-open/case-runの実行処理から使用）
      - src/common/skills/agentdev-workflow-case-open/（検証環境構築の入口）
      - src/common/skills/agentdev-workflow-case-run/（実行委譲の入口）
      - src/common/skills/agentdev-case-run-execution-adapter/（委譲結果の受領と報告の登録）
      - docs/designs/workflows/v4-delegation-contracts.md（委譲時最小契約への追加）
    intent: PR自己申告と終了時LLM抽出に依存しない、実行処理による登録の機械的保証を与える
    verification_refs: [TS-002, TS-003]
    source_items: [AG-002, AG-003]
  - id: RA-002
    concern: case-close機械工程の照合拡張
    responsibility: close_mechanical_steps.tsの完了判定工程に、台帳と実物の照合（ローカル・remote・分岐・process・listen・gitignore対象一時出力）、未登録・残存・検査不能・検査器異常の検出、404単独不採用のremote判定を組込み、照合結果をisCloseOperationPermittedの判定材料へ反映する。機械受理の終了判定記録を .agentdev/close-acceptance/issue-{NNNN}.json へ書き出し、Tool境界検証（RA-003）と接続する
    ownership_hints:
      - src/common/skills/agentdev-workflow-case-close/scripts/src/close_mechanical_steps.ts
      - src/common/skills/agentdev-workflow-case-close/scripts/tests/close_mechanical_steps.test.ts
    intent: 終了前の生成記録と実物の一致を機械判定し、残存時の完了を構造的に拒否する
    verification_refs: [TS-001, TS-006]
    source_items: [AG-001, AG-006]
  - id: RA-003
    concern: 全終了経路での機械受理前提の実行境界強制
    responsibility: 機械工程が終了判定記録を決定的パス（.agentdev/close-acceptance/issue-{NNNN}.json）へ書き出し、agentdev_gh の issue_close（CliRunner・LocalRunner両実装）が Case Issue への終了操作の前提として記録を呼出元の申告によらず自ら読み取り検証し、検証不成立時に終了の副作用を実行しない。単一IssueのSTEP-5、Epic E1〜E6、case-autoの集約経路、ローカル版実装、公開Toolへの直接呼出しのすべてが同一の検証を通る。参照pin・four-combination に加えて Tool 境界の直接拒否試験で固定する
    ownership_hints:
      - src/common/tools/agentdev-gh/runner-cli.ts（issueClose の前提検証）
      - src/common/tools/agentdev-gh/local/runner-local.ts（issueClose の前提検証）
      - src/common/tools/agentdev-gh/contracts.ts・engine.ts・specs-issue.ts（失敗分類と操作仕様の拡張）
      - src/common/tools/agentdev-gh/tests/four-combination-shared.ts（終了経路シナリオ拡張）
      - src/common/skills/agentdev-workflow-case-close/scripts/tests/close_mechanical_steps.test.ts（参照pin拡張・判定記録書出し試験）
    intent: 検査結果を渡さない直接呼出しが実行境界で実際に拒否されることを機械的に保証する（呼び方の規約や参照pinのみに依存しない）
    verification_refs: [TS-007]
    source_items: [AG-007]
  - id: RA-004
    concern: 削除確認フロー（識別情報対応・利用者確認境界）
    responsibility: 回収の削除提案に正確な識別情報を付与し、利用者の明示確認との対応が確認できた場合だけ削除を実行する。対象変更・別物入替え・機械可読値のみの確認を拒否し、symlink/junction参照先の誤消去を防止する
    ownership_hints:
      - 照合・回収を実装するcase-close機械工程script（RA-002と同一面）
      - 利用者確認のHITL境界（case-closeの停止・確認手順）
    intent: 削除確認と対象識別情報の対応を機械的に保証し、残置許容例外への流用を防ぐ
    verification_refs: [TS-005]
    source_items: [AG-005]
  - id: RA-005
    concern: 証跡の保存・読み戻し形式
    responsibility: 検証の必要な結果（入力・対象版・操作・実結果・失敗・訂正・判定理由）をSSoTコメント・PR本文検証差分の既存チャネルで本体Issue/PRへ保存し、回収後の読み戻し可能性を保存形式の要件として満たす。台帳自体の回収と最終記録のIssue/PR収束を実装する
    ownership_hints:
      - docs/designs/skills/agentdev-workflow-templates.md（検証差分記録規約の適用）
      - docs/designs/workflows/issue-lifecycle-records.md（SSoTコメント様式の適用）
      - case-close機械工程script（保存・回収の実行面）
    intent: 削除先へのアクセスなしで検証結果が理解できる状態を保証し、一時記録の恒久保持を作らない
    verification_refs: [TS-004, TS-008]
    source_items: [AG-004, AG-008]
  - id: RA-006
    concern: 正規成果物（REQ・Design文書）の保存と既存所有者の更新
    responsibility: 新規REQ、REQ-032への要件行追加、新規Design（verification-resource-lifecycle）、case-close Designの2節更新、委譲契約Designへの追記を、Definition保存内部責務（case-ready）を通じて正規workflowで反映する
    ownership_hints:
      - docs/requirements/REQ-032.md
      - docs/requirements/（新規REQ。採番はDefinition保存時）
      - docs/designs/workflows/verification-resource-lifecycle.md（新規）
      - docs/designs/commands/case-close.md
      - docs/designs/workflows/v4-delegation-contracts.md
    intent: 是正を既存の適切な所有者経由の正規workflowで完結させる
    verification_refs: [TS-008, TS-009]
    source_items: [AG-008]

review_dispositions: []

assembly_evidence:
  - target_file: docs/designs/commands/case-close.md
    target_content_sha256: e213ad57bb64ae48fb42f47425a593ce3066bf73dcde08e57800b9685bbef5cd
    check_scope:
      heading: "### full integrity suite 実行と tmp 残存確認"
      start_line: 157
      end_line: 186
    execution_conditions:
      operation: replace
      edit_sha256: 06f97e84e7a6c08a722b4770ceac8b55f182c07e7eb58d2a79587ec0c73eb533
      expected_old_count: 1
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
      pre: { count: 3, all_ok: true }
      post: { count: 3, all_ok: true }
    diff_compact: { changed_lines_count: 1, added: 1, removed: 0 }
    executed_at: "2026-11-05T02:43:45.833Z"
  - target_file: docs/designs/commands/case-close.md
    target_content_sha256: e213ad57bb64ae48fb42f47425a593ce3066bf73dcde08e57800b9685bbef5cd
    check_scope:
      heading: "## 機械工程の script 呼び出し契約（RU-0162）"
      start_line: 342
      end_line: 362
    execution_conditions:
      operation: replace
      edit_sha256: 46f01ed38106823d46f3bd55a8710a8b4417d3ca50d9b0123fba4baf4b0137d7
      expected_old_count: 1
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
      pre: { count: 3, all_ok: true }
      post: { count: 3, all_ok: true }
    diff_compact: { changed_lines_count: 1, added: 1, removed: 1 }
    executed_at: "2026-11-05T02:17:33.951Z"
  - target_file: docs/designs/workflows/v4-delegation-contracts.md
    target_content_sha256: ce2e19c0915943ca188e8630760a52dfa52a7630bdf9e7cf20561ac3e343a51d
    check_scope:
      heading: "## 委譲時最小契約"
      start_line: 28
      end_line: 85
    execution_conditions:
      operation: append
      edit_sha256: 04433427ba3654aea81341b60c2045ae4b2618f264496287f956658db5e10b98
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
      pre: { count: 2, all_ok: true }
      post: { count: 2, all_ok: true }
    diff_compact: { changed_lines_count: 7, added: 7, removed: 0 }
    executed_at: "2026-11-05T02:19:58.645Z"
  - target_file: docs/designs/responsibilities/custom-tool-contracts.md
    target_content_sha256: 7262b5aa18ea035cbe3dc3fe095aa0e4bbf85bd01966a0e4752d8b9fd5a867fb
    check_scope:
      heading: "## 対象操作の境界（初期セット）"
      start_line: 38
      end_line: 101
    execution_conditions:
      operation: append
      edit_sha256: 2b96d25d067d4f2bb4e8117a9318f20b91b4b9134a6a0e510a1db2f10e686197
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
      pre: { count: 2, all_ok: true }
      post: { count: 2, all_ok: true }
    diff_compact: { changed_lines_count: 4, added: 4, removed: 0 }
    executed_at: "2026-11-05T02:58:00.681Z"

case_open_hints:
  epic_needed: true
  decomposition: |
    - Wave 1: 台帳モジュールと作成・委譲入口の登録（RA-001）と契約・設計文書の確定（OU-001〜OU-003）
    - Wave 2: case-close機械工程の照合拡張（RA-002）と削除確認フロー（RA-004）
    - Wave 3: 全終了経路の前提条件消費と Tool 境界強制の固定（RA-003）、証跡形式（RA-005）、文書反映（OU-004〜OU-007、RA-006）
  wave_hints:
    - RA-001（台帳・登録）が RA-002/RA-003/RA-004/RA-005 の前提依存
    - RA-004/RA-005 は RA-002 と並列実行可
    - 各面のテストは fail-first（TS-009）で同一 Wave 内に配置
    - 本Case自身のcloseは旧資材残存により一度拒否される。完了は「拒否確認→利用者の削除確認→監督側削除→実不存在確認→close再実行」の順序で成立する（AG-010、CR-004、TS-006）
```

# summary

- 入力: `C:/Users/ogatay/work/hermes-vault/project-list/req-input-adf-verification-resource-cleanup.md`（2026-11-05 合意、単一入力・参照専用）。
- 操作分類: 新規REQ（CREATE）+ REQ-032 APPEND（4行）+ REQ-052 APPEND（1行）+ 新規Design（workflows/verification-resource-lifecycle）+ case-close Design 2節 UPDATE + 委譲契約Design APPEND + custom-tool-contracts Design APPEND。REQ番号・要件行IDは Definition 保存時（case-ready）に決定的採番スクリプトで確定する（新規REQ本文の要件行は AG 紐付きの行リストで表現し、bare ID 表を採らない先例〔Case #3866・REQ-117〕に従う）。
- Design update の適用形式: ACT-DESIGN-002/003 の content は置換後のセクション全文（design-file-manager の UPDATE＝target_area セクション置換契約に対応し、既存の full integrity suite・QG-4 等の既存契約本文を保持する）。ACT-DESIGN-004/005 は APPEND（既存本文保持）。
- adversarial-review 反映（2026-11-05、独立2系統+監督訂正）: 受理所見をすべて反映 — 未確認の不在まで拒否条件に含める（REQ-032-044/AG-006/case-close Design）、gitignore対象一時出力検査の除外規則と導入時既知残存リスト（Design 検出手段 (e)(f)）、相対行IDの bare 表を先例方式へ変更、評価単位の明示（REQ-032-038 整合）、自己適用の完了順序（TS-006・wave_hints）、FP-n/FN-n 帰属先修正、Design update の節置換対応（全文content化）、試験資材の専用領域・回収担当と不要な新remote/clone/検証repo不作成（TS-003/RA-001）。Tool境界強制と未達=受入未達は監督訂正により反映済み（CR-006/007）。
- 収束ラウンド結果（2026-11-05）: 両系統とも全処分「確認」・「収束可能」判定。収束条件の新所見2件を反映 — (1) 終了判定記録の様式に判定対象版・生成時刻を含め issue_reopen が旧記録を無効化する（過去の合格結果の再利用の Tool 境界拒否。ライフサイクル Design 様式 + custom-tool-contracts Design 対象版束縛 + TS-007 ケース(5)）、(2) 記録保存場所の worktree コンテキスト解決規則（main repo root 固定・cwd 非依存。custom-tool-contracts Design + TS-007 ケース(6)）。
- Decision判断記録: Decision不要。本変更はworkflow定義・仕様変更であり（Decision禁止ゲート該当）、既存 DEC-022/035/038/039/048 の内部で成立し、置換すべき旧判断を持たない（agentdev-architecture-advisory の助言を親エージェントが分類・採用。Q1=B、Q3=第6分類不要。Q2の強制点は監督訂正により下記のとおり修正）。
- 強制点の確定（監督照合による訂正 2026-11-05 を反映）: workflow入口での判定消費に加え、機械工程が終了判定記録を .agentdev/close-acceptance/issue-{NNNN}.json へ書き出し、agentdev_gh の issue_close（CliRunner・LocalRunner両実装）が Case Issue への終了操作の前提として当該記録を呼出元の申告によらず自ら読み取り検証する。検査結果を渡さない直接呼出しは実行境界で拒否される（REQ-052-018、custom-tool-contracts Design「issue_close の終了前提」）。参照pinや呼び方の規約のみで成立させない。生gh WRITE迂回は既存guardの所管のまま。
- 作成時登録と検出の分離（監督照合による訂正 2026-11-05 を反映）: 作成ヘルパーによる作成時の機械登録を正規の作成経路とし、close時の機械観測（検出スキャン）は申告と独立に実行して不一致を未登録として扱う。委譲契約のMUST NOT DOは機械的制限ではないため実行制限として扱わない。機械検出も実行制限も成立しない必須経路が残る場合は受入未達として完了を許可しない（TS-003 の集約判定を含む）。
- REQ-032/REQ-052 テーブル行追加の適用は Definition 保存内部責務の機械置換手順が所管する（組立scriptの事前検査は見出し一意性・旧文存在件数とも合格済み。節末尾の表行追加は组立scriptのreplace契約の対象外）。
