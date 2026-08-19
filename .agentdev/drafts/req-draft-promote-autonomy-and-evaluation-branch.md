---
draft_type: req_draft
topic_slug: promote-autonomy-and-evaluation-branch
status: saved
created_at: 2026-08-19T21:40:00+09:00
source_rus:
  - RU-0001
  - RU-0002
  - RU-0003
  - RU-0004
---

# draft-data

```yaml
# work_type: 新規REQ作成を伴う機能追加のため feature
# scale: 複数REQ（新規2件+更新10件）、Decision 1件、SPEC 11件。実装スコープシグナル
#   （command/skill/SPEC 多数の修正候補）により large 昇格。
#   判定根拠: agentdev-workflow-lifecycle スケール判定基準 1（要件の複雑さ）および 2（実装スコープシグナル）
work_type: feature
scale: large

# summary: 当該 draft が何を合意したかの1段落要約。人間可読補助（処理の正ではない）
summary: >
  4件のRUを一括処理する。(1) intake-promote / learning-promote / inspect-promote の判断確定を、
  取得可能な根拠から一意に確定できる事項はエージェントの自律確定とし、ユーザー判断が必要な事項のみHITLへ送る
  共通原則へ再定義する（REQ-003 APPEND + REQ-036/037/038/041 UPDATE + 横断SPEC）。
  (2) Case統合先を main 固定から「Caseに割り当てられた統合先（既定 main）」へ一般化し（新規REQ-042）、
  (3) 評価ブランチ上で実証・評価・正式化を行うワークフローを導入し（新規REQ-043）、
  (4) case-auto の実証自走対応を定義する（REQ-034 UPDATE）。
  ブランチモデルの意思決定として DEC-018 を作成する。REQ-042/REQ-043/DEC-018 は仮採番であり
  req-save の採番確定値へ置換される。

# auto_gate: case-auto 自走可否の判定材料
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

# agreed_items: 合意された個別項目。artifact_actions.source_items から ID 参照される
agreed_items:
  - id: AG-001
    content: |
      promote系自律確定の共通原則。intake-promote、learning-promote、inspect-promote の判断確定について、
      取得可能な根拠（現行REQ、Decision、SPEC、対象成果物、証拠）から判断を一意に確定できる事項は
      エージェント自身の自律確定として処理し、ユーザー固有の目的・価値観・優先順位を要する事項、
      正規情報源間の未解決矛盾、判断に必要な情報不足、対論型レビューで未解決の本質的争点、
      要件・仕様の対象範囲の新規決定、既存の明示的な安全境界を要求する操作を含む事項のみを
      ユーザー判断（HITL）へ送る。自律確定はユーザー承認の擬制（自動承認）ではなく、
      モデルの自己申告による確信度や固定パーセンテージのみで可否を判定しない。
      単独実行と backlog-auto 経由で原則を変えず、backlog-auto 自身は子ワークフローの判定を
      承認・上書きするロジックを持たない。同一実行内に自律確定可能項目とユーザー判断必要項目が
      混在する場合は、自律確定可能であり未決項目に依存しない項目を先行確定する。
      自律確定の証跡（判定結果、主要根拠、HITL不要と判断した理由）は既存の評価レポート、分類結果、
      採用済み成果物、実行報告を優先利用し、新規永続成果物を必須としない。
      処理対象が空の場合はHITLを発生させず正常な「対象なし」として完了する。
      inspect-promote --auto は従来どおり明示opt-inのfast pathとして維持し、通常経路の自律確定とは
      別概念とする。backlog-review のHITL契約、破壊的変更等の明示承認安全境界、learning の
      deferred・未処理自動削除禁止の既存安全境界は変更しない。
      自律確定可否の詳細判定条件（8要件・8HITL移送条件）は横断契約SPECが所有し、3つのWorkflow Skillで
      同一内容を重複保持しない。REQ-036-018、REQ-037-003、REQ-038-002/003 のユーザー承認要求は、
      破壊的操作の安全境界ではなく判断確定の確認であったと再分類し、共通原則に基づく契約へ更新する。
      REQ-041-008 の「既存 HITL 境界を維持」は「子ワークフロー側所有の HITL 境界（内容は子REQの
      定めによる）を維持」へ意味を一般化する。
  - id: AG-002
    content: |
      ブランチモデルとCase統合先の一般化。main を正式状態の唯一の正規ブランチとして維持する。
      評価ブランチは必要な場合のみ作成し、同時に0本以上存在できる。原則として1つの実証単位につき
      1つの評価ブランチを割り当て、異なる実証単位が同一の評価ブランチを共有せず、評価ブランチ同士を
      通常の依存・派生関係として扱わない。先行実証の未正式成果を前提に後続実証が必要な場合は
      同一Epic/Waveとして扱うか、先行実証を正式化した後に別実証として開始する。
      現在の「統合先 = main」固定前提を「統合先 = Caseに割り当てられた統合先、既定値 main」へ一般化し、
      worktreeの作成元、PRのbase、rebase・同期基準、鮮度確認、case-closeのsquash merge先、
      Epic後続Waveの作業起点を同一の統合先基準へ統一する。通常Case（評価を利用しない Standard / Epic）の
      利用者向け操作と挙動を維持する。case-close の公開コマンドは維持しマージ処理を分離しない。
      QG-4 は Issue 完了条件の最終判定として維持され意味を変えない。Case完了と main への反映を
      同一概念として扱わず、main 以外を統合先にして完了した Case を main 反映済みとして扱わない。
      評価ブランチを正規成果物とせず、評価ブランチ専用の公開Gitコマンド体系を追加せず、
      作成・削除には既存Git/worktree能力を再利用する。初版で許容する統合先の種類は main と評価ブランチに
      限定し、release branch 等の汎用複数ブランチ運用へ先回りして拡張しない。
      統合先を表す内部フィールド名と評価ブランチの命名規則は実装設計で決定する（公開要件外）。
  - id: AG-003
    content: |
      実証Caseの判定と評価契約。実証は work_type（bugfix/feature/maintenance/docs_chore）と別の性質として
      扱い、work_type へ experiment 等の値を追加しない。req-define は、調査・設計だけでは重要な採否判断を
      確定できず実行・測定・観察が必要な場合に実証Caseを推奨し、単なる追加調査だけを理由に実証Caseとしない。
      ユーザーが実証を明示している場合は再確認せず実証Caseとして扱い、明示していない場合は req-define が
      実証を推奨する理由を提示し壁打ちで実証Caseへの移行を確定する。実証Case確定後は評価ブランチ利用を
      別途確認せず、実証Caseなら評価ブランチ、通常Caseなら main と決定的に導出する。
      req-define は実証開始前に、必要に応じて評価対象・仮説、比較対象、比較条件、評価方法、評価観点、
      評価シナリオ、測定・観察項目、判定基準、必要証拠、採用条件、不採用条件、判定不能条件、中止条件、
      再実行条件、比較条件逸脱時の扱いを確定する（構成要素の詳細は req-define command SPEC が所有）。
      評価契約とテスト戦略を分離する。テスト戦略は実証手段・計測手段・実証環境が正常に動作したかを扱い、
      評価契約は評価対象から得られた結果と採否を扱い、評価対象が採用基準を満たさなかったことを
      実装不具合として自動修正しない。実証開始後、実行側の自律判断では評価契約を変更せず、
      ユーザーが明示的に指示した場合のみ変更できる。変更時は変更内容、変更理由、既存評価結果への影響を
      追跡可能にし、変更後の契約に影響する既存評価について必要な再評価または再実行を行い、
      変更前の契約と結果を失わない。実証全体の最終完了後は当該実証の評価契約および最終結果を書き換えず、
      完了後に異なる条件で評価する場合は新しい実証として扱う。
  - id: AG-004
    content: |
      評価ブランチ上の実行と状態管理。req-define 自身に Git 副作用を追加せず、実証Case確定後の最初の
      保存処理より前に当該実証専用の評価ブランチと必要な worktree を準備する。評価ブランチ作成だけの
      新しい公開コマンドは追加しない。req-define が生成した draft を内容欠落なく評価環境へ引き継ぎ、
      req-save / spec-save を継続実行できる。評価ブランチ上では通常のADF工程を利用し、REQ、SPEC、
      Decision、実証コード、評価基盤、評価用データを必要に応じて作成・更新できる。
      評価ブランチ上で文書が status: accepted 等となってもそれだけで main の正式成果物とはみなさず、
      ADFの正式状態は main 上に存在することを含めて判断する。評価ブランチによる隔離により main 側の
      ADF ワークフロー状態（RU 消費等のドメイン状態一般）が巻き戻らず、実証Issue作成とVERIFYが成功したRUは
      評価ブランチ削除後に main 側で未処理RUとして再出現しない。実証Issueに対象評価ブランチを記録し、
      会話コンテキスト喪失後も Issue 等の永続情報から実証Caseであること、対象評価ブランチ、
      所属する実証単位を復元できる。Epic実証では Epic Issue から共有評価ブランチを特定できる。
      Case実行状態（completed/blocked/failed/delegation-unavailable 等）と評価結果
      （採用/不採用/判定不能/未確定）を別概念として扱う。「判定不能」は計画どおり評価を完遂したが証拠から
      採否を区別できない場合に限り、実行失敗、必要データ不足、外部依存失敗は blocked / failed として扱う。
      blocked / failed / ユーザー中断時に再開可能な実証は評価ブランチを保持し、blocked / failed を理由に
      自動破棄せず、実証の明示的な終了・放棄時のみ必要な記録を残した後に破棄する。
  - id: AG-005
    content: |
      記録・追跡・正式化導線。Issue本文を実行前の評価契約の正規記録、PRを実行条件・測定結果・観察結果・
      証拠・評価結果の記録、Issue最終コメントを最終評価結果の正規記録とする。初版では専用評価成果物
      ファイルを追加せず、評価ブランチ削除後も Issue/PR から必要な結果と証拠を追跡できる。
      case-open は実証Caseの場合、Issue本文に評価契約と対象評価ブランチを記録する。work_type と実証の
      組み合わせごとに専用Issueテンプレートを増殖させず、既存テンプレートへ条件付き評価情報を追加する。
      case-run は評価ブランチを作業起点およびPR baseとし、必要な実証手段の準備、実行、測定、観察、
      証拠生成、評価を行う。コード作成が不要な実証も許容する。実証CaseのPRには実際の実行条件、
      測定結果、観察結果、証拠、評価結果を記録する。各実証Caseの case-close はPRを評価ブランチへ
      squash merge する。実証全体の最終 case-close は新しい評価を始めず、事前の評価契約と蓄積済み証拠から
      最終結果を導出する。評価開始時の main commit を固定契約とせず、main が進んだことだけを理由に
      評価結果を失効させたり再実証を要求したりしない。実証中の main の変更取り込みを一律禁止せず、
      評価条件へ影響する場合は必要な再評価を行う。評価結果がどのような前提・実行状態から得られたかを
      既存PR/Git証跡等から追跡可能にする。実証完了時に評価ブランチを main へ merge せず、
      評価ブランチ上の実装をそのまま正式実装へ昇格しない。実証結果・証拠を永続記録してから
      評価ブランチを削除できる。実証全体の最終 case-close は正式化経路として
      req-define <実証Issue> を利用者へ明示する。Standardでは Standard Issue、Epicでは Epic Issue を指定し、
      Epic中間Waveでは正式化案内を出さない。case-close は後続 req-define を自動実行しない。
      req-define <実証Issue> は評価契約、最終評価結果、参照証拠を入力として扱い、最新 main に対して
      知見の適用可能性を再評価したうえで Requirement、SPEC、Decision、Implementation、追加実証の必要性を
      判断する。Standard実証とEpic実証の双方を対象とし、実証のEpic要否を feature-only の規模判定に
      限定しない。Epic実証では Epic に割り当てられた評価ブランチを全Waveが統合状態として継承する。
      複数Waveの統合状態を実際に動かさなければ評価できない場合、case-open は統合状態を実行・測定する
      Child Issue または Wave を計画へ含め、各Childで必要十分な評価が完了する場合は不要な統合評価Waveを
      強制しない。
  - id: AG-006
    content: |
      case-auto の実証対応。case-auto は通常Caseと実証Caseを区別でき、通常Caseの既存挙動を維持する。
      実証Caseでは当該実証専用の評価ブランチを利用し、Issue等の永続情報から評価ブランチを復元して
      全工程へ一貫して伝播する。同時に複数実証を処理する場合、それぞれ異なる評価ブランチを利用する。
      評価ブランチ上で必要な req-save、spec-save、case-open、case-run、case-close を実行し、
      実証であることだけを理由に req-save / spec-save を省略しない。Standard / Epic双方を扱い、
      Epicでは各Waveの case-run → case-close を同じ評価ブランチ上で反復する。
      評価ブランチへの squash merge を正常なCase完了として扱う。Case実行状態と評価結果を混同しない。
      採用でも評価ブランチを main へ merge せず、同一実行内で正式化・本実装を開始せず、実証全体の
      最終 case-close を当該 case-auto 実行の正常終了点とする。Epic中間Waveでは正式化案内を出さない。
      blocked / failed / 中断時に再開可能なら評価ブランチを保持し、実証が明示的に終了・放棄された場合のみ
      必要な記録後に評価ブランチを破棄する。評価契約を自律変更せず、ユーザーが評価契約変更を明示した
      場合は変更履歴と既存結果への影響を保持し、必要な再評価または再実行を行う。
      最終出力に、評価結果、実証Issue、主要PRまたは証拠、main 未反映であること、次の
      req-define <実証Issue> を示す。case-auto は独自の実証判定・評価判定を所有せず、上流で確定した
      実証Case契約とIssueの永続情報を利用する。

# artifact_actions: REQ/Decision/SPEC への保存対象（1 action = 1 artifact × 1 editing concern）
# REQ-042 / REQ-043 / DEC-018 は仮採番（既存最大+1、採番空き確認済み）。req-save は new:{slug} 形式の
# target を採番結果へ置換する（REQ-008-031）。本文中の具体 ID は置換対象外のため、採番結果が
# 仮採番と異なる場合は draft 側の参照修正が必要。
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: create
    target: REQ-042
    source_items: [AG-002]
    content: |
      REQ-042「Case統合先とブランチモデル」（ワークフロー全体REQ、新規作成）

      ## 目的

      正式状態の正規ブランチとして main を唯一維持しつつ、Caseの統合先を main 固定から
      「Caseに割り当てられた統合先（既定値 main）」へ一般化し、必要な場合に一時的な評価ブランチを
      Caseの統合先として利用できる基盤契約を所有する。評価ブランチを用いた実証・評価ワークフロー自体は
      REQ-043 が所有する。

      ## 要件

      | ID | 要件 |
      |---|---|
      | REQ-042-001 | main は正式状態の唯一の正規ブランチとして維持すること |
      | REQ-042-002 | 評価ブランチは必要な場合のみ作成し、同時に0本以上存在できること |
      | REQ-042-003 | 原則として1つの実証単位につき1つの評価ブランチを割り当て、異なる実証単位が同一の評価ブランチを共有しないこと |
      | REQ-042-004 | 評価ブランチ同士を通常の依存・派生関係として扱わないこと。先行実証の未正式成果を前提に後続実証が必要な場合は同一Epic/Waveとして扱うか、先行実証を正式化した後に別実証として開始すること |
      | REQ-042-005 | Case は割り当てられた統合先を持ち、その既定値は main であること |
      | REQ-042-006 | worktree の作成元、PR の base、rebase・同期基準、鮮度確認、case-close の squash merge 先、Epic 後続 Wave の作業起点は、同一の統合先を参照すること |
      | REQ-042-007 | 通常Case（評価を利用しない Standard / Epic Case）の利用者向け操作と挙動を維持すること |
      | REQ-042-008 | QG-4 は Issue 完了条件の最終判定として維持され、統合先の一般化によって意味を変更しないこと |
      | REQ-042-009 | 評価ブランチを正規成果物とせず、評価ブランチ専用の公開 Git コマンド体系を追加せず、作成・削除に既存 Git/worktree 能力を再利用すること |
      | REQ-042-010 | 初版で許容する統合先の種類は main と評価ブランチに限定し、release branch 等の汎用的な複数ブランチ運用へ先回りして拡張しないこと |
      | REQ-042-011 | Case の完了と main への反映を同一概念として扱わず、main 以外を統合先として完了した Case を main 反映済みとして扱わないこと |
      | REQ-042-012 | ADF 制御状態（RU の消費、draft、intake/learning の capture 等 .agentdev 配下のワークフロー状態）の正規位置は main であり、実証Case の実行によって生じる ADF 制御状態の変更は評価ブランチの削除によらず main 側で維持されること（実現方式は SPEC・実装設計が所有する）。評価ブランチ上で作成・更新される実証内容（docs、コード等の成果物）はこの限りではないこと |

      ## 適用範囲

      - 対象: ブランチモデル（main の正規性、評価ブランチの位置づけ）、Case統合先の一般化と統合先基準の統一、ADF 制御状態の正規位置（main）と評価ブランチ上の実証内容の分離、通常Caseの外部仕様維持、QG-4 の意味不変
      - 対象外: 評価ブランチを用いた実証・評価ワークフロー（REQ-043）、case-auto の実証対応（REQ-034）、統合先の内部フィールド名・評価ブランチの命名規則（実装設計）、統合先の伝播形式の詳細（SPEC）
  - id: ACT-REQ-002
    artifact: req
    operation: create
    target: REQ-043
    source_items: [AG-003, AG-004, AG-005]
    content: |
      REQ-043「評価ブランチ実証ワークフロー」（ワークフロー全体REQ、新規作成）

      ## 目的

      評価ブランチ上での実証・評価・正式化ワークフロー契約を所有する。実証Caseの判定、評価契約とその変更、
      評価ブランチ上の実行と状態管理、評価結果、記録と追跡、正式化導線、Standard/Epic実証を含む。
      統合先とブランチモデルの基盤契約は REQ-042 が、Epic/Waveモデルの機構は REQ-035 が、
      case-auto の実証自走は REQ-034 が所有する。

      ## 要件

      | ID | 要件 |
      |---|---|
      | REQ-043-001 | 実証は work_type（bugfix、feature、maintenance、docs_chore）と別の性質として扱い、work_type へ experiment 等の値を追加しないこと |
      | REQ-043-002 | req-define は、調査・設計だけでは重要な採否判断を確定できず実行・測定・観察が必要な場合に実証Caseを推奨すること。単なる追加調査だけを理由に実証Caseとしないこと |
      | REQ-043-003 | ユーザーが実証を明示している場合は再確認せず実証Caseとして扱うこと。明示していない場合は req-define が実証を推奨する理由を提示し、壁打ちにより実証Caseへの移行を確定すること |
      | REQ-043-004 | 実証Caseとして確定した後は評価ブランチ利用を別途確認せず、実証Caseなら評価ブランチ、通常Caseなら main と決定的に導出すること |
      | REQ-043-005 | req-define は実証開始前に、評価対象・仮説、比較対象・比較条件、判定基準、必要証拠、採用条件・不採用条件、中止・再実行条件等の評価契約の構成要素を必要に応じて確定すること（構成要素の一覧と詳細は req-define command SPEC が所有する） |
      | REQ-043-006 | 評価契約とテスト戦略を分離すること。テスト戦略は実証手段・計測手段・実証環境が正常に動作したかを扱い、評価契約は評価対象から得られた結果と採否を扱うこと。評価対象が採用基準を満たさなかったことを実装不具合として自動修正しないこと |
      | REQ-043-007 | 実証開始後、実行側の自律判断で評価契約を変更しないこと。ユーザーが評価契約の変更を明示的に指示した場合のみ変更でき、変更内容、変更理由、既存評価結果への影響を追跡可能にし、影響する既存評価について必要な再評価または再実行を行い、変更前の契約と結果を失わないこと |
      | REQ-043-008 | 実証全体の最終完了後は当該実証の評価契約および最終結果を書き換えないこと。完了後に異なる条件で評価する場合は新しい実証として扱うこと |
      | REQ-043-009 | req-define 自身に Git 副作用を追加しないこと。実証Case確定後、最初の保存処理より前に当該実証専用の評価ブランチと必要な worktree を準備すること（準備の実行主体・手順は SPEC が所有し、req-define 単独の Git 副作用としない）。評価ブランチ作成だけの新しい公開コマンドを追加しないこと |
      | REQ-043-010 | req-define が生成した draft を内容欠落なく評価環境へ引き継ぎ、req-save / spec-save を評価ブランチ上で継続実行できること |
      | REQ-043-011 | 評価ブランチ上で REQ、SPEC、Decision、実証コード、評価基盤、評価用データを必要に応じて作成・更新でき、評価ブランチ上で status: accepted 等となった文書をそれだけで main の正式成果物とみなさないこと（ADF の正式状態は main 上に存在することを含めて判断する） |
      | REQ-043-012 | 評価ブランチによる隔離により main 側の ADF ワークフロー状態（RU 消費等のドメイン状態一般）が巻き戻らないこと。実証Issue 作成と VERIFY が成功した RU は、評価ブランチ削除後に main 側で未処理 RU として再出現しないこと（ADF 制御状態の正規位置と維持機構は REQ-042-012 が所有する） |
      | REQ-043-013 | 実証Issue に対象評価ブランチ等の実証状態を永続記録し、会話コンテキスト喪失後も Issue 等の永続情報から実証Caseであること、対象評価ブランチ、所属する実証単位を復元できること。Epic 実証では Epic Issue から共有評価ブランチを特定できること |
      | REQ-043-014 | case-open は実証Caseの場合、Issue 本文に評価契約と対象評価ブランチを記録すること。work_type と実証の組み合わせごとに専用 Issue テンプレートを増殖させず、既存テンプレートへ条件付き評価情報を追加すること |
      | REQ-043-015 | case-run は評価ブランチを作業起点および PR base とし、必要な実証手段の準備、実行、測定、観察、証拠生成、評価を行うこと。コード作成が不要な実証も許容すること |
      | REQ-043-016 | 実証Caseの PR には実際の実行条件、測定結果、観察結果、証拠、評価結果を記録すること |
      | REQ-043-017 | 各実証Caseの case-close は PR を評価ブランチへ squash merge すること |
      | REQ-043-018 | 実証全体の最終 case-close は新しい評価を始めず、事前の評価契約と蓄積済み証拠から最終結果を導出すること |
      | REQ-043-019 | Case実行状態と評価結果を別概念として扱うこと。評価結果は採用、不採用、判定不能、未確定を区別すること。判定不能は計画どおり評価を完遂したが証拠から採否を区別できない場合に限り、実行失敗、必要データ不足、外部依存失敗は blocked / failed として扱うこと |
      | REQ-043-020 | Issue 本文を実行前の評価契約の正規記録、PR を実行条件・測定結果・技術証拠・評価結果の記録、Issue 最終コメントを最終評価結果の正規記録とすること。初版では専用評価成果物ファイルを追加せず、評価ブランチ削除後も Issue/PR から必要な結果と証拠を追跡できること |
      | REQ-043-021 | 評価開始時の main commit を固定契約とせず、main が進んだことだけを理由に評価結果を失効させたり再実証を要求したりしないこと。実証中の main の変更取り込みを一律禁止せず、評価条件へ影響する場合は必要な再評価を行うこと |
      | REQ-043-022 | blocked / failed / ユーザー中断時に、再開可能な実証は評価ブランチを保持すること。保持された評価ブランチと Issue の永続情報から実証を再開できること。blocked / failed を理由に評価ブランチを自動破棄せず、実証の明示的な終了・放棄時のみ必要な記録を残した後に破棄できること |
      | REQ-043-023 | 実証完了時に評価ブランチを main へ merge せず、評価ブランチ上の実装をそのまま正式実装へ昇格しないこと。実証結果・証拠を永続記録してから評価ブランチを削除できること |
      | REQ-043-024 | 実証全体の最終 case-close は正式化経路として req-define <実証Issue> を利用者へ明示すること。Standard では Standard Issue、Epic では Epic Issue を指定し、Epic 中間Waveでは正式化案内を出さないこと。case-close は後続 req-define を自動実行しないこと |
      | REQ-043-025 | req-define <実証Issue> は評価契約、最終評価結果、参照証拠を入力として扱い、最新 main に対して知見の適用可能性を再評価したうえで Requirement、SPEC、Decision、Implementation、追加実証の必要性を判断すること |
      | REQ-043-026 | Standard 実証と Epic 実証の双方を対象とすること。実証の Epic 要否を feature-only の規模判定に限定しないこと（Epic 実証の Wave 間での評価ブランチ継承は REQ-035-012 が所有する） |
      | REQ-043-027 | 複数 Wave の統合状態を実際に動かさなければ評価できない場合、case-open は統合状態を実行・測定する Child Issue または Wave を計画へ含めること。各 Child で必要十分な評価が完了する場合は不要な統合評価 Wave を強制しないこと |
      | REQ-043-028 | 実証Caseの Issue 完了条件には評価の実施とその結果の記録を含めることとし、評価結果の採否（採用、不採用、判定不能）自体を完了条件に含めないこと（不採用や判定不能も評価を完遂していれば正常な完了である） |
      | REQ-043-029 | 評価ブランチ上で採番した REQ/Decision 番号は当該実証にローカルな一時識別であり、正式化（REQ-043-025）時に最新 main の採番へ置き換わること。評価ブランチ由来の番号参照は対象評価ブランチ等の追跡情報（REQ-043-013）とともに解釈すること |
      | REQ-043-030 | req-define は実証Case の draft-data に実証Caseであること、評価契約、評価ブランチ識別情報を出力すること。下流コマンドは Issue 等の永続情報または draft-data の当該情報から実証Caseを認識すること |

      ## 適用範囲

      - 対象: 実証Case判定、評価契約とその変更管理、評価ブランチ上の実行とADF制御状態の分離、実証状態の永続識別、評価結果の区分、記録と追跡、正式化導線（req-define <実証Issue>）、Standard/Epic実証の適用
      - 対象外: 統合先とブランチモデルの基盤契約（REQ-042）、Epic/Waveモデルの機構と Wave 間評価ブランチ継承（REQ-035）、case-auto の実証自走（REQ-034）、実証専用公開コマンド、評価専用の新しい正規成果物、評価ブランチ命名規則・draft引き継ぎ方式・評価契約変更履歴の識別形式の詳細（実装設計、Issue の既存履歴・コメントを優先）
  - id: ACT-DEC-001
    artifact: decision
    operation: create
    target: DEC-018
    source_items: [AG-002, AG-003]
    content: |
      DEC-018「評価ブランチモデルとCase統合先の一般化」

      ## コンテキスト

      ADF は Case の統合先を常に main と暗黙に前提していた。方式比較、技術選定、性能評価、
      AIエージェント方式、アーキテクチャ等について、調査や設計だけでは重要な採否判断を確定できない場合に、
      正式な main へ未確定成果を入れずに構築・実行・測定・評価する手段が存在しなかった。

      ## 決定

      1. main を正式状態の唯一の正規ブランチとし、Case の統合先を「Case に割り当てられた統合先
         （既定値 main）」へ一般化する。worktree の作成元、PR の base、rebase・同期基準、鮮度確認、
         squash merge 先、Epic 後続 Wave の作業起点は同一の統合先を参照する。
      2. 評価ブランチを一時的・非正規の成果物として位置づける。1実証単位につき1評価ブランチを割り当て、
         評価ブランチ専用の公開 Git コマンド体系を追加せず、既存 Git/worktree 能力を再利用する。
         初版で許容する統合先の種類は main と評価ブランチに限定する。
      3. 実証完了時に評価ブランチを main へ merge せず、評価ブランチ上の実装をそのまま正式実装へ
         昇格しない。実証結果・証拠を Issue/PR へ永続記録した後、req-define <実証Issue> により
         最新 main に対して改めて正式化する。

      ## 影響

      REQ-042（新規）、REQ-043（新規）、REQ-004、REQ-005、REQ-017、REQ-030、REQ-031、REQ-032、
      REQ-034、REQ-035 の更新、各 command / skill / workflow SPEC の更新。
      relates-to: DEC-008（bounded parent decision resolution。実証の評価契約変更はユーザー明示指示のみとし
      case-auto は自律変更しない運用は DEC-008 決定4の適用）、DEC-011（STEP resume point。実証の中断・再開は
      評価ブランチ保持と Issue 永続情報からの復元により durable state 原則を適用）、DEC-015（ADF決定論的実行中核
      と実行基盤実行機構の責務分界。実証ワークフローは状態機械の選択的適用対象の拡張であり新規ハード統制を
      追加しない）。
  - id: ACT-REQ-003
    artifact: req
    operation: append
    target: docs/requirements/REQ-003.md
    source_items: [AG-001]
    content: |
      REQ-003（委譲時の判断・承認・副作用境界）へ要件テーブル末尾に次の2行を追加する
      （REQ-003-055、REQ-003-056）。

      | REQ-003-055 | intake-promote、learning-promote、inspect-promote の判断確定は、取得可能な根拠から判断を一意に確定できる事項をエージェント自身の自律確定として処理し、ユーザー固有の目的・価値観・優先順位を要する事項、正規情報源間の未解決矛盾、判断に必要な情報不足、対論型レビューで未解決の本質的争点、要件・仕様の対象範囲の新規決定、既存の明示的な安全境界を要求する操作など、横断契約SPEC の定める HITL 移送条件に該当する事項のみをユーザー判断へ送ること（列挙は代表例であり、HITL 移送条件の完全な一覧は横断契約SPEC が所有する）。自律確定はユーザー承認の擬制ではなく、モデルの自己申告による確信度や固定パーセンテージのみで可否を判定しないこと |
      | REQ-003-056 | 同一実行内に自律確定可能項目とユーザー判断必要項目が混在する場合、自律確定可能であり未決項目に依存しない項目を先行確定し、ユーザー判断必要項目のみを HITL 対象とすること。自律確定した判断について、判定結果、主要根拠、HITL 不要と判断した理由を後から確認できること（証跡は既存の評価レポート、分類結果、採用済み成果物、実行報告を優先利用し、新規永続成果物を必須としない） |

      追加位置は要件テーブル末尾。REQ-003-021〜024、REQ-003-032/033 の既有原則の promote 系判断確定への
      具体化であり、矛盾しない。
  - id: ACT-REQ-004
    artifact: req
    operation: update
    target: docs/requirements/REQ-036.md
    source_items: [AG-001]
    content: |
      REQ-036-018 を次の内容へ更新する。

      旧: 「inspect-promote は採用済み成果物をユーザーの明示的な承認を得た後に生成すること」
      新: 「inspect-promote は、分類・検証・必要なレビューを経て取得可能な根拠から promote / defer / reject
      を一意に確定できる検出事項についてはユーザー承認なしで確定し、ユーザー判断が必要な検出事項のみを
      HITL 対象とすること（判断確定の境界は REQ-003-055 の共通原則に従う）」

      更新根拠: 従来のユーザー承認要求は破壊的操作の安全境界ではなく判断確定の確認であったため、
      promote 系共通原則へ再分類する。REQ-036-021（--auto の明示opt-in fast path）は変更しない。
      あわせて REQ-036 目的節の「検出事項の分類と採用済み成果物への昇格はユーザーの明示的な承認に基づき」を
      「検出事項の分類と採用済み成果物への昇格は REQ-003-055 の共通原則に基づき（一意に確定できる事項は
      自律確定し、ユーザー判断が必要な事項のみ HITL を経る）」へ更新する（「自動的な要件化を行わない」は維持）。
  - id: ACT-REQ-005
    artifact: req
    operation: update
    target: docs/requirements/REQ-037.md
    source_items: [AG-001]
    content: |
      REQ-037-003 を次の内容へ更新する。

      旧: 「intake-promote は採用判定とユーザー承認を経て promoted へ配置するか削除すること」
      新: 「intake-promote は、取得可能な根拠から採用・保留・却下を一意に確定できる item はユーザー承認なしで
      確定して promoted へ配置または削除し、ユーザー判断が必要な item のみを HITL 対象とすること
      （判断確定の境界は REQ-003-055 の共通原則に従う）」

      更新根拠: 従来のユーザー承認要求は判断確定の確認であったため、promote 系共通原則へ再分類する。
      あわせて REQ-037 目的節の「採用判定はユーザー承認を経て確定し」を「採用判定は REQ-003-055 の
      共通原則に基づき確定し」へ更新する（「自動的な要件化を行わない」は維持）。
  - id: ACT-REQ-006
    artifact: req
    operation: update
    target: docs/requirements/REQ-038.md
    source_items: [AG-001]
    content: |
      REQ-038-002 と REQ-038-003 を次の内容へ更新する。

      REQ-038-002
      旧: 「learning-promote は多軸評価とユーザー承認を経て採用済み成果物を生成すること」
      新: 「learning-promote は、問題クラス分類、多軸評価、廃棄判定、昇華可能性、既存対策との関係から
      取得可能な根拠で処置を一意に確定できる学習項目はユーザー承認なしで確定して採用済み成果物を生成し、
      ユーザー判断が必要な項目のみを HITL 対象とすること（判断確定の境界は REQ-003-055 の共通原則に従う。
      deferred・未処理項目を自動削除しない既存安全境界は維持する）」

      REQ-038-003
      旧: 「learning-promote の最終確定はユーザーの判断を挟む確定ステップを経ること」
      新: 「learning-promote の最終確定は、ユーザー判断が必要な項目についてのみユーザーの判断を挟む
      確定ステップを経ること」

      あわせて REQ-038 目的節の「最終確定はユーザーの判断を挟む確定ステップを経て」を「最終確定は
      REQ-003-055 の共通原則に基づき、ユーザー判断が必要な項目についてのみユーザーの判断を挟む
      確定ステップを経て」へ更新する（「自動的な要件化を行わない」は維持）。
  - id: ACT-REQ-007
    artifact: req
    operation: update
    target: docs/requirements/REQ-041.md
    source_items: [AG-001]
    content: |
      REQ-041-008 を次の内容へ更新する。

      旧: 「各子ワークフローの既存 HITL 境界、安全境界、停止条件、自動昇格 opt-in を維持すること」
      新: 「各子ワークフローの HITL 境界、安全境界、停止条件、自動昇格 opt-in を子ワークフロー側の所有として
      維持すること（子ワークフローは REQ-003-055 の promote 系共通原則に基づき境界を定める）」

      あわせて REQ-041-016 を次の内容へ更新する（backlog-auto 起因の変更がないという趣旨を明確化）。
      旧: 「新コマンド追加後も既存5コマンドを従来どおり単独実行でき、各公開契約を変更しないこと。
      通常の backlog-auto 実行によって inspect-promote --auto を暗黙的に有効化しないこと」
      新: 「新コマンド追加後も既存5コマンドを従来どおり単独実行でき、backlog-auto が子ワークフローの
      公開契約を変更しないこと（子ワークフロー自身の契約変更は各コマンドの正規変更経路による）。
      通常の backlog-auto 実行によって inspect-promote --auto を暗黙的に有効化しないこと」
  - id: ACT-REQ-008
    artifact: req
    operation: update
    target: docs/requirements/REQ-004.md
    source_items: [AG-003]
    content: |
      REQ-004-001 を次の内容へ更新し、要件テーブル末尾へ新規行（REQ-004-054）を追加する。

      REQ-004-001
      旧: 「req-define はセッション履歴、現在コンテキスト、明示入力ファイル、RU、ユーザー対話を入力として
      受け入れること」
      新: 「req-define はセッション履歴、現在コンテキスト、明示入力ファイル、RU、実証Issue、ユーザー対話を
      入力として受け入れること」

      新規行:
      | REQ-004-054 | req-define は実証必要性の推論・提案と評価契約の確定を要件展開工程の一部として実行すること（実証Case判定と評価契約の意味論は REQ-043 が所有する） |
  - id: ACT-REQ-009
    artifact: req
    operation: update
    target: docs/requirements/REQ-005.md
    source_items: [AG-003, AG-005]
    content: |
      REQ-005-005 を次の内容へ更新する（撤廃ではなく例外の追加）。

      旧: 「ワークフローを work_type（bugfix、feature、maintenance、docs_chore）と scale（feature のみ
      standard、large）で分類すること」
      新: 「ワークフローを work_type（bugfix、feature、maintenance、docs_chore）と scale で分類すること。
      通常Caseの scale は feature のみ standard、large とし、実証Case（REQ-043 の定義による）は
      work_type にかかわらず scale と Issue 構造を選択できること」
  - id: ACT-REQ-010
    artifact: req
    operation: update
    target: docs/requirements/REQ-017.md
    source_items: [AG-005]
    content: |
      REQ-017-001 を次の内容へ更新する（投影要素の追加。評価契約の意味論は REQ-043 が所有し、
      REQ-017 は投影責務のみ。REQ-017-006 の先例に倣う）。

      旧: 「case-open は Issue 作成時に、対象範囲、変更対象成果物、関連 REQ/Decision/SPEC、完了条件
      （成果状態）、test strategy（3要素）、必須 artifact-specific quality control、scope-affecting
      impact candidate、ユーザー明示 review 発動契約、work_type/scale/Issue structure を
      execution contract として Issue 本文に確定すること」
      新: 「case-open は Issue 作成時に、対象範囲、変更対象成果物、関連 REQ/Decision/SPEC、完了条件
      （成果状態）、test strategy（3要素）、必須 artifact-specific quality control、scope-affecting
      impact candidate、ユーザー明示 review 発動契約、work_type/scale/Issue structure に加え、
      実証Caseの場合は評価契約と対象評価ブランチ（REQ-043 所有契約の投影）を execution contract として
      Issue 本文に確定すること」
  - id: ACT-REQ-011
    artifact: req
    operation: update
    target: docs/requirements/REQ-030.md
    source_items: [AG-002]
    content: |
      REQ-030-020 を次の内容へ更新する（main 固定の一般化。評価契約・評価ブランチの Issue 記録は
      REQ-043-014 が所有するため REQ-030 への追加行は不要）。

      旧: 「case-open は RU ファイル削除後に main 作業ディレクトリとリモートの同期を確認し不一致を検出した
      場合停止すること」
      新: 「case-open は RU ファイル削除後に統合先ブランチ（REQ-042 の定義による、既定 main）の作業
      ディレクトリとリモートの同期を確認し不一致を検出した場合停止すること」
  - id: ACT-REQ-012
    artifact: req
    operation: append
    target: docs/requirements/REQ-031.md
    source_items: [AG-002]
    content: |
      REQ-031（case-run 実行契約）へ要件テーブル末尾に次の新規行（REQ-031-024。既存 REQ-031-023 と重複しない次番）を追加する。

      | REQ-031-024 | case-run の作業用 worktree の作成元と PR の base は、当該 Case の統合先（REQ-042 の定義による、既定 main）を参照すること |

      実証Case固有の実行挙動（評価ブランチを作業起点・PR base とする実証実行、PR 記録要素）は
      REQ-043-015/016 が所有するため REQ-031 への追加行は不要。
  - id: ACT-REQ-013
    artifact: req
    operation: update
    target: docs/requirements/REQ-032.md
    source_items: [AG-002]
    content: |
      REQ-032-013 を次の内容へ更新する（語句置換ではなく意図の再定式化: 同期妨害リスクの検出基準を
      統合先へ一般化）。

      旧: 「case-close は git main 同期時に worktree 状態、ref lock 競合、非 main ブランチ占有のリスクを
      事前検出し安全な代替同期手順を選択すること」
      新: 「case-close は統合先ブランチ（REQ-042 の定義による、既定 main）同期時に worktree 状態、
      ref lock 競合、統合先以外のブランチ占有のリスクを事前検出し安全な代替同期手順を選択すること」

      squash merge 先の統合先基準は REQ-042-006 が、実証最終 case-close の挙動は REQ-043-017/018/024 が
      所有する。
  - id: ACT-REQ-014
    artifact: req
    operation: update
    target: docs/requirements/REQ-034.md
    source_items: [AG-002]
    content: |
      REQ-034-026 を次の内容へ更新する（main 固定の一般化）。

      旧: 「case-auto は orchestration stage 1 と 3 を直列集約ポイントとし main push、capture、commit を
      並列実行区間の外で処理すること」
      新: 「case-auto は orchestration stage 1 と 3 を直列集約ポイントとし統合先（REQ-042 の定義による、
      既定 main）への push、capture、commit を並列実行区間の外で処理すること」
  - id: ACT-REQ-015
    artifact: req
    operation: append
    target: docs/requirements/REQ-034.md
    source_items: [AG-006]
    content: |
      REQ-034（case-auto 実行契約）へ要件テーブル末尾に次の新規行ブロック（REQ-034-037〜043、
      実証Case自走の単一関心ブロック）を追加する。既存行へは変更しない。

      | REQ-034-037 | case-auto は通常Caseと実証Case（REQ-043 の定義による）を区別でき、通常Caseの既存挙動を維持すること |
      | REQ-034-038 | case-auto は実証Caseを Issue 等の永続情報から復元した評価ブランチで実行し、全工程へ一貫して伝播すること。同時に複数実証を処理する場合、それぞれ異なる評価ブランチを利用すること |
      | REQ-034-039 | case-auto は実証であることだけを理由に req-save / spec-save を省略せず、評価ブランチ上で実行すること |
      | REQ-034-040 | case-auto は Epic 実証の各 Wave の case-run → case-close を同じ評価ブランチ上で反復すること |
      | REQ-034-041 | case-auto は評価ブランチへの squash merge を正常なCase完了として扱うこと。採用でも評価ブランチを main へ merge せず、同一実行内で正式化・本実装へ自動継続せず、実証全体の最終 case-close を当該実行の正常終了点とすること |
      | REQ-034-042 | case-auto は評価契約を自律変更しないこと。ユーザーが評価契約変更を明示した場合は、変更履歴と既存結果への影響を保持し、必要な再評価または再実行を継続すること |
      | REQ-034-043 | case-auto の最終出力に、評価結果、実証Issue、主要PRまたは証拠、main 未反映であること、次の req-define <実証Issue> を示すこと。実証全体の完了時のみ正式化案内を示し、blocked / failed 等で実証が未完のまま終了する場合は評価結果を未確定として再開手段を示すこと。Epic 中間Waveを実証全体完了と誤認せず正式化案内を出さないこと |

      blocked / failed / 中断時の評価ブランチ保持と明示放棄時のみの破棄は REQ-043-022 が所有するため
      REQ-034 への追加行は不要。適用範囲「対象」へ「実証Caseの自走（REQ-043 所有契約の消費）」を追記する。
  - id: ACT-REQ-016
    artifact: req
    operation: update
    target: docs/requirements/REQ-035.md
    source_items: [AG-002]
    content: |
      REQ-035-009 を次の内容へ更新する（rebase 基準の統合先一般化）。

      旧: 「並列実行時に PR マージコンフリクトが発生した場合後続 PR を rebase により機械的解消すること」
      新: 「並列実行時に PR マージコンフリクトが発生した場合後続 PR を統合先（REQ-042 の定義による、
      既定 main）基準で rebase により機械的解消すること」
  - id: ACT-REQ-017
    artifact: req
    operation: append
    target: docs/requirements/REQ-035.md
    source_items: [AG-005]
    content: |
      REQ-035（Epic と Wave 実行モデル）へ要件テーブル末尾に次の新規行（REQ-035-012）を追加する。

      | REQ-035-012 | Epic 実証では Epic に割り当てられた評価ブランチを全 Wave が統合状態として継承すること（実証Caseの判定と実証の意味論は REQ-043 が所有する） |
  - id: ACT-SPEC-001
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: workflows
      slug: workflow-contracts
    target_area: promote系判断確定とHITL境界（新規セクション）
    source_items: [AG-001]
    content: |
      横断契約SPEC（workflows/workflow-contracts.md）へ「promote系判断確定とHITL境界」セクションを追加する。
      intake-promote / learning-promote / inspect-promote 共通の自律確定可否詳細判定表を集約所有する
      （3つのWorkflow Skill・command SPECで同一内容を重複保持しない）。内容:
      自律確定可能要件（適用すべき既存契約と判断根拠を特定できる、選択肢間に本質的な競合が残っていない、
      ユーザー固有の目的・価値観・優先順位の推測を要しない、要件・仕様の新しい対象範囲をユーザーに代わって
      決定しない、正規情報源間に未解決の矛盾がない、判断に必要な情報が欠落していない、必要な対論型
      レビューを実施済みなら未解決の本質的争点が残っていない、既存の明示的な安全境界を迂回しない）、
      HITL移送条件（複数の妥当な選択肢が残る、ユーザー固有の価値判断・優先順位が必要、対象範囲の新規決定、
      正規情報源同士の矛盾、証拠・情報不足、レビュー未解決争点の残存、必須検証・外部依存の利用不能、
      明示承認そのものを安全境界と要求する契約）、確信度・固定パーセンテージのみによる判定禁止、
      部分自律確定（未決項目に依存しない項目の先行確定）、単純な意見差・形式的最終確認のみを理由とする
      HITL移送禁止、証跡の既存成果物利用、空入力時のHITL不発生、--auto fast path との区別。
      REQ-003-055/056 が所有する原則の詳細判定表として位置づける。
      あわせて同 SPEC「ワークフロー経路制御」節のスケール記述（scale は feature のみ standard / large）
      へ実証Case例外（REQ-005-005 の更新に対応。実証Caseは work_type にかかわらず scale と Issue 構造を
      選択可能）を追記し、経路表の適用前提を通常Caseと明示する。なお現行の当該節が scale 規則の根拠として
      引用する REQ-001-011 は現行文書と廃止文書の区別に関する行であり scale の正規所有者でないため、
      参照を REQ-005-005 へ修正する。
  - id: ACT-SPEC-002
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: commands
      slug: req-define
    target_area: 実証Case判定と評価契約（新規セクション）
    source_items: [AG-003]
    content: |
      req-define command SPEC へ「実証Case判定と評価契約」セクションを追加する。
      実証必要性推論の観点（調査・設計で採否確定不能か、実行・測定・観察が必要か、単純追加調査でないか）、
      実証Case推奨時の壁打ち手順、実証Issue 入力（req-define <実証Issue>）の解釈と評価契約・最終評価結果・
      参照証拠の取込み、実証Issue 明示指定時は当該実証の正式化を主たる入力とし RU 自動検出との混在時は
      どちらを処理するかユーザーへ確認する入力優先規定、評価契約の構成要素一覧（評価対象・仮説、比較対象、
      比較条件、評価方法、評価観点、評価シナリオ、測定・観察項目、判定基準、必要証拠、採用条件、不採用条件、
      判定不能条件、中止条件、再実行条件、比較条件逸脱時の扱い）、評価契約と test strategy の分離基準、
      実証Case確定後の評価ブランチ・worktree 準備タイミングと実行主体（req-define 単独の Git 副作用と
      しない）、実証Case の draft-data への出力形式（実証であること、評価契約、評価ブランチ識別情報。
      REQ-043-030 の詳細）、draft の評価環境への引き継ぎ契約。意味論の正規所有は REQ-043。
  - id: ACT-SPEC-003
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: commands
      slug: case-open
    target_area: 統合先と実証CaseのIssue構成（新規セクション）
    source_items: [AG-002, AG-005]
    content: |
      case-open command SPEC へ「統合先と実証CaseのIssue構成」セクションを追加する。
      統合先の Issue 本文への記録形式、実証Case識別情報（実証フラグ、対象評価ブランチ、所属実証単位）の
      Issue 本文記録形式、評価契約の Issue 本文への投影形式（評価結果の採否を Issue 完了条件へ含めない
      投影は REQ-043-028 による）、既存テンプレート（standard / epic / child）への条件付き評価情報の
      追加形式（実証×work_type の組み合わせごとの専用テンプレート増殖禁止）、draft-data の実証情報
      （REQ-043-030）からの実証Case認識、REQ-017-014 の presence-based 判定に用いる新契約必須セクション
      の一覧から実証Case専用要素（評価契約・対象評価ブランチ）を除外する規定、REQ-043-027 の統合評価
      Child Issue / Wave の計画反映。REQ-030-020 の統合先同期確認の実行詳細、実証Case の RU/draft 削除と
      ADF 制御状態の main 反映手順（REQ-042-012 の実行詳細）。
  - id: ACT-SPEC-004
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: commands
      slug: case-run
    target_area: 統合先基準の作業起点と実証実行（新規セクション）
    source_items: [AG-002, AG-004]
    content: |
      case-run command SPEC へ「統合先基準の作業起点と実証実行」セクションを追加する。
      worktree 作成元・PR base の統合先参照の実行詳細、実証Caseにおける実証手段の準備・実行・測定・観察・
      証拠生成・評価の実行位置、コード作成が不要な実証の扱い、実証Caseの PR 本文への実行条件・測定結果・
      観察結果・証拠・評価結果の記録形式。REQ-043-015/016 の実行詳細。
  - id: ACT-SPEC-005
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: commands
      slug: case-close
    target_area: 統合先へのマージと実証最終クローズ（新規セクション）
    source_items: [AG-002, AG-005]
    content: |
      case-close command SPEC へ「統合先へのマージと実証最終クローズ」セクションを追加する。
      squash merge 先の統合先解決、統合先ブランチ同期時のリスク事前検出（worktree 状態、ref lock 競合、
      統合先以外のブランチ占有）の実行詳細、実証全体の最終 case-close における評価結果の導出
      （事前の評価契約と蓄積済み証拠から導出し新規評価を開始しない）、Issue 最終コメントへの最終評価結果
      正規記録形式、実証Case の capture 回収の扱い（評価ブランチ上で回収した intake/learning capture を
      main 側パイプラインへ反映する、または PR 本文記録を正として main 側から追跡可能とする手順。
      REQ-042-012 の実行詳細）、正式化経路（req-define <実証Issue>）の案内と Epic 中間Waveでの案内抑制。
      REQ-043-017/018/024 の実行詳細。
  - id: ACT-SPEC-006
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: commands
      slug: case-auto
    target_area: 実証Case自走（新規セクション）
    source_items: [AG-006]
    content: |
      case-auto command SPEC へ「実証Case自走」セクションを追加する。
      実証Case認識（Issue 永続情報または draft-data の実証情報〔REQ-043-030〕からの復元）、
      評価ブランチの全工程への伝播、req-save / spec-save の省略禁止、Epic 実証の Wave 反復、
      評価ブランチへの squash merge を正常完了とする扱い、実証完了終端と正式化非継続、
      blocked / failed / 中断時の評価ブランチ保持、明示放棄時のみの破棄、評価契約の自律変更禁止と
      ユーザー指示変更時の継続、blocked / failed で実証が未完のまま終了する場合の再開手段提示と
      正式化案内抑制（REQ-034-043 の詳細）、最終出力の構成要素。REQ-034-037〜043 の実行詳細。
  - id: ACT-SPEC-007
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: commands
      slug: intake-promote
    target_area: 自律確定の判定位置とHITLフォールバック（新規セクション）
    source_items: [AG-001]
    content: |
      intake-promote command SPEC へ「自律確定の判定位置とHITLフォールバック」セクションを追加する。
      classification〜review〜HITL〜persistence の各 STEP における自律確定判定の挿入位置、
      横断契約SPEC（promote系判断確定とHITL境界）の詳細判定表の参照（重複保持しない）、部分自律確定の
      実行手順、自律確定項目の結果・主要根拠・HITL不要理由の報告形式（既存成果物優先）、
      ユーザー判断必要 item のみの HITL 提示形式。
  - id: ACT-SPEC-008
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: commands
      slug: learning-promote
    target_area: 自律確定の判定位置とHITLフォールバック（新規セクション）
    source_items: [AG-001]
    content: |
      learning-promote command SPEC へ「自律確定の判定位置とHITLフォールバック」セクションを追加する。
      8軸評価・廃棄判定・昇華可能性・既存対策確認後の自律確定判定の挿入位置、横断契約SPEC
      （promote系判断確定とHITL境界）の詳細判定表の参照（重複保持しない）、部分自律確定の実行手順、
      deferred・未処理自動削除禁止の安全境界維持、自律確定項目の報告形式（evaluation-report 等の既存
      成果物優先）。
  - id: ACT-SPEC-009
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: commands
      slug: inspect-promote
    target_area: 自律確定の判定位置とHITLフォールバック（新規セクション）
    source_items: [AG-001]
    content: |
      inspect-promote command SPEC へ「自律確定の判定位置とHITLフォールバック」セクションを追加する。
      分類・検証・経路B review 後の自律確定判定の挿入位置、横断契約SPEC（promote系判断確定とHITL境界）の
      詳細判定表の参照（重複保持しない）、部分自律確定の実行手順、--auto fast path（高確信度カテゴリの
      事前定義による早期処理）と通常経路の自律確定（レビュー・検証を経た最終確認省略）の区別、
      自律確定項目の報告形式。
  - id: ACT-SPEC-010
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: skills
      slug: agentdev-git-worktree
    target_area: 統合先基準のworktree操作（新規セクション）
    source_items: [AG-002]
    content: |
      agentdev-git-worktree skill SPEC へ「統合先基準のworktree操作」セクションを追加する。
      worktree 作成元の統合先解決（既定 main、実証Caseは評価ブランチ）、評価ブランチの作成・削除に
      既存 Git/worktree 能力を再利用する手順、評価ブランチの命名規則（実装設計で決定した形式）の適用。
  - id: ACT-SPEC-011
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: workflows
      slug: epic-wave-model
    target_area: Epic実証の評価ブランチ継承（新規セクション）
    source_items: [AG-005]
    content: |
      epic-wave-model SPEC（workflows）へ「Epic実証の評価ブランチ継承」セクションを追加する。
      Epic 実証における全 Wave の評価ブランチ継承の execution_unit 構成への反映、統合状態を実行・測定する
      Child Issue / Wave の計画判定、Epic Issue からの共有評価ブランチ特定。REQ-035-012、REQ-043-026/027
      の実行詳細。
  - id: ACT-SPEC-012
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: skills
      slug: agentdev-workflow-lifecycle
    target_area: スケール判定と工程分類の実証Case例外（新規セクション）
    source_items: [AG-003]
    content: |
      agentdev-workflow-lifecycle skill SPEC へ「スケール判定と工程分類の実証Case例外」セクションを追加する。
      同 SPEC のスケール判定記述（feature のみ standard / large）へ実証Case例外（REQ-005-005 の更新に対応。
      実証Caseは work_type にかかわらず scale と Issue 構造を選択可能、実証の判定は REQ-043 の定義による）
      を追記し、work_type・scale 判定の宣言的定義（REQ-005-012）と実証Case例外の関係を明示する。

# conflict_resolutions: 壁打ちで解消された衝突の記録
conflict_resolutions:
  - id: CR-001
    conflict: 4RUの正規所有者構成（RU-0002〜0004は新規REQ 1本集約か2本分離か、RU-0004は新規REQか既存REQ更新か）
    resolution: |
      補正版Aを採用（ユーザー合意）。RU-0002 は新規REQ「Case統合先とブランチモデル」、RU-0003 は新規REQ
      「評価ブランチ実証ワークフロー」へ分離（変更理由・適用範囲が異なり、統合先一般化の将来再利用性を
      損なう結合を避ける）。RU-0004 は REQ-034（case-auto 実行契約）UPDATE（自走オーケストレーションは
      既存関心）。REQ-031 を更新対象に追加（worktree と PR の所有コマンドのため）。REQ-005 の scale
      feature-only 制約は例外追加形式で見直し。REQ-004 を更新対象に追加（req-define <実証Issue> 入力と
      実証Case判定・評価契約確定の工程位置づけ。意味論は REQ-043 が所有）。
  - id: CR-002
    conflict: REQ-003 の肥大化（54要件行、行数シグナル +1）と RU-0001 APPEND の両立
    resolution: |
      APPEND 継続（ユーザー合意）。RU-0001 は REQ-003 の既有関心（判断・承認境界）の具体化であり新規関心を
      持ち込まない。行数シグナルは分割検討の契機であって分割理由ではなく、REQ-003 自体の肥大化は独立した
      構造診断対象として扱い、本RU処理をブロックしない。今回の追加は2行に留める。
  - id: CR-003
    conflict: RU-0001 の「既存契約が明示承認そのものを安全境界として要求する場合は自律確定しない」と REQ-036-018 / REQ-037-003 / REQ-038-002/003 の明示承認要求の関係
    resolution: |
      当該承認要求は破壊的操作の安全境界ではなく判断確定の確認であったと再分類する。REQ-003-055 追加と
      各コマンドREQ行の UPDATE を同一 req-save で一貫して適用し、原則と各契約の矛盾を残さない。
      破壊的変更・矛盾解消・要件仕様スコープ変更の明示承認、learning の deferred・未処理自動削除禁止は
      安全境界として維持する。
  - id: CR-004
    conflict: REQ-017（Issue Execution Contract）への評価契約記録の所在（意味論を REQ-017 に持たせるか投影に留めるか）
    resolution: |
      投影に留める（ユーザー合意、Oracle 助言 Q4 採用）。評価契約・評価ブランチの意味論は REQ-043 が所有し、
      REQ-017-001 は実証Caseの場合の投影要素追加のみ。REQ-017-006（合成と投影契約のみを所有）の先例に倣う。

# operation_units: 複数RU入力の統合/分離結果。RU-0001系（promote自律確定）とRU-0002〜0004系（評価ブランチ）は
# トピック・対象REQ・変更理由が異なるため個別の保存操作へ分離し、単一draftで管理する。
operation_units:
  - {ou_id: OU-0001, source_ru: RU-0001, target_req: REQ-003, operation: append, scale: standard, depends_on: [], recommended_order: 1, issue_policy: single, result: {status: applied, saved: [REQ-003], lines: [REQ-003-055, REQ-003-056]}}
  - {ou_id: OU-0002, source_ru: RU-0002, target_req: REQ-042, operation: create, scale: standard, depends_on: [], recommended_order: 1, issue_policy: single, result: {status: applied, saved: [REQ-042]}}
  - {ou_id: OU-0003, source_ru: RU-0002, target_req: DEC-018, operation: create, scale: standard, depends_on: [], recommended_order: 2, issue_policy: single, result: {status: applied, saved: [DEC-018]}} # Decision（DEC-018）作成単位。target_req はテンプレート上の代替表記であり、対応する artifact_action は ACT-DEC-001（artifact: decision）
  - {ou_id: OU-0004, source_ru: RU-0003, target_req: REQ-043, operation: create, scale: standard, depends_on: [OU-0002], recommended_order: 2, issue_policy: single, result: {status: applied, saved: [REQ-043]}}
  - {ou_id: OU-0005, source_ru: RU-0001, target_req: REQ-036, operation: update, scale: standard, depends_on: [OU-0001], recommended_order: 2, issue_policy: single, result: {status: applied, saved: [REQ-036], lines: [REQ-036-018]}}
  - {ou_id: OU-0006, source_ru: RU-0001, target_req: REQ-037, operation: update, scale: standard, depends_on: [OU-0001], recommended_order: 2, issue_policy: single, result: {status: applied, saved: [REQ-037], lines: [REQ-037-003]}}
  - {ou_id: OU-0007, source_ru: RU-0001, target_req: REQ-038, operation: update, scale: standard, depends_on: [OU-0001], recommended_order: 2, issue_policy: single, result: {status: applied, saved: [REQ-038], lines: [REQ-038-002, REQ-038-003]}}
  - {ou_id: OU-0008, source_ru: RU-0001, target_req: REQ-041, operation: update, scale: standard, depends_on: [OU-0001], recommended_order: 2, issue_policy: single, result: {status: applied, saved: [REQ-041], lines: [REQ-041-008, REQ-041-016]}}
  - {ou_id: OU-0009, source_ru: RU-0003, target_req: REQ-004, operation: update, scale: standard, depends_on: [OU-0004], recommended_order: 3, issue_policy: single, result: {status: applied, saved: [REQ-004], lines: [REQ-004-001, REQ-004-054]}}
  - {ou_id: OU-0010, source_ru: RU-0003, target_req: REQ-005, operation: update, scale: standard, depends_on: [OU-0004], recommended_order: 3, issue_policy: single, result: {status: applied, saved: [REQ-005], lines: [REQ-005-005]}}
  - {ou_id: OU-0011, source_ru: RU-0003, target_req: REQ-017, operation: update, scale: standard, depends_on: [OU-0004], recommended_order: 3, issue_policy: single, result: {status: applied, saved: [REQ-017], lines: [REQ-017-001]}}
  - {ou_id: OU-0012, source_ru: RU-0002, target_req: REQ-030, operation: update, scale: standard, depends_on: [OU-0002], recommended_order: 3, issue_policy: single, result: {status: applied, saved: [REQ-030], lines: [REQ-030-020]}}
  - {ou_id: OU-0013, source_ru: RU-0002, target_req: REQ-031, operation: append, scale: standard, depends_on: [OU-0002], recommended_order: 3, issue_policy: single, result: {status: applied, saved: [REQ-031], lines: [REQ-031-024]}}
  - {ou_id: OU-0014, source_ru: RU-0002, target_req: REQ-032, operation: update, scale: standard, depends_on: [OU-0002], recommended_order: 3, issue_policy: single, result: {status: applied, saved: [REQ-032], lines: [REQ-032-013]}}
  - {ou_id: OU-0015, source_ru: RU-0002, target_req: REQ-034, operation: update, scale: standard, depends_on: [OU-0002], recommended_order: 3, issue_policy: single, result: {status: applied, saved: [REQ-034], lines: [REQ-034-026]}}
  - {ou_id: OU-0016, source_ru: RU-0004, target_req: REQ-034, operation: append, scale: standard, depends_on: [OU-0004, OU-0015], recommended_order: 4, issue_policy: single, result: {status: applied, saved: [REQ-034], lines: [REQ-034-037, REQ-034-038, REQ-034-039, REQ-034-040, REQ-034-041, REQ-034-042, REQ-034-043]}}
  - {ou_id: OU-0017, source_ru: RU-0002, target_req: REQ-035, operation: update, scale: standard, depends_on: [OU-0002], recommended_order: 3, issue_policy: single, result: {status: applied, saved: [REQ-035], lines: [REQ-035-009]}}
  - {ou_id: OU-0018, source_ru: RU-0003, target_req: REQ-035, operation: append, scale: standard, depends_on: [OU-0004, OU-0017], recommended_order: 4, issue_policy: single, result: {status: applied, saved: [REQ-035], lines: [REQ-035-012]}}
  - {ou_id: OU-0019, source_ru: RU-0001, target_spec: docs/specs/workflows/workflow-contracts.md, operation: spec-update, scale: standard, depends_on: [OU-0001], recommended_order: 3, issue_policy: single, result: {}}
  - {ou_id: OU-0020, source_ru: RU-0003, target_spec: docs/specs/commands/req-define.md, operation: spec-update, scale: standard, depends_on: [OU-0004, OU-0009], recommended_order: 4, issue_policy: single, result: {}}
  - {ou_id: OU-0021, source_ru: RU-0002, target_spec: docs/specs/commands/case-open.md, operation: spec-update, scale: standard, depends_on: [OU-0004, OU-0012], recommended_order: 4, issue_policy: single, result: {}}
  - {ou_id: OU-0022, source_ru: RU-0002, target_spec: docs/specs/commands/case-run.md, operation: spec-update, scale: standard, depends_on: [OU-0004, OU-0013], recommended_order: 4, issue_policy: single, result: {}}
  - {ou_id: OU-0023, source_ru: RU-0002, target_spec: docs/specs/commands/case-close.md, operation: spec-update, scale: standard, depends_on: [OU-0004, OU-0014], recommended_order: 4, issue_policy: single, result: {}}
  - {ou_id: OU-0024, source_ru: RU-0004, target_spec: docs/specs/commands/case-auto.md, operation: spec-update, scale: standard, depends_on: [OU-0016], recommended_order: 5, issue_policy: single, result: {}}
  - {ou_id: OU-0025, source_ru: RU-0001, target_spec: docs/specs/commands/intake-promote.md, operation: spec-update, scale: standard, depends_on: [OU-0006], recommended_order: 4, issue_policy: single, result: {}}
  - {ou_id: OU-0026, source_ru: RU-0001, target_spec: docs/specs/commands/learning-promote.md, operation: spec-update, scale: standard, depends_on: [OU-0007], recommended_order: 4, issue_policy: single, result: {}}
  - {ou_id: OU-0027, source_ru: RU-0001, target_spec: docs/specs/commands/inspect-promote.md, operation: spec-update, scale: standard, depends_on: [OU-0005], recommended_order: 4, issue_policy: single, result: {}}
  - {ou_id: OU-0028, source_ru: RU-0002, target_spec: docs/specs/skills/agentdev-git-worktree.md, operation: spec-update, scale: standard, depends_on: [OU-0002], recommended_order: 3, issue_policy: single, result: {}}
  - {ou_id: OU-0029, source_ru: RU-0003, target_spec: docs/specs/workflows/epic-wave-model.md, operation: spec-update, scale: standard, depends_on: [OU-0018], recommended_order: 4, issue_policy: single, result: {}}
  - {ou_id: OU-0030, source_ru: RU-0003, target_spec: docs/specs/skills/agentdev-workflow-lifecycle.md, operation: spec-update, scale: standard, depends_on: [OU-0010], recommended_order: 4, issue_policy: single, result: {}}

# test_strategy: 各合意項目（AG-*）の検証方法。3要素（verification / pass_criteria / on_failure）を必須とする
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      intake-promote / learning-promote / inspect-promote を単独実行と backlog-auto 経由の両方で実行し、
      明確な採用・却下事例、判断が拮抗する事例、ユーザー固有の価値判断が必要な事例、正規情報源の矛盾、
      証拠不足、レビュー未解決、自律/HITL混在、空入力、inspect-promote --auto の各シナリオで、自律確定と
      HITL移送の境界、部分自律確定、証跡記録を確認する。RU-0001 の決定的受け入れ条件 1〜20 を
      pass / fail / blocked / not applicable で個別評価する。
    pass_criteria: |
      (1) 根拠から一意に確定できる item がユーザー承認なしで確定される (2) 単独実行と backlog-auto 経由で
      境界が同一 (3) backlog-auto が子の判定を承認・上書きしない (4) 混在時、非依存の自律確定可能項目が
      HITL待ちにならない (5) 価値判断・矛盾・情報不足・未解決争点・対象範囲決定・明示承認安全境界では
      自律確定しない (6) 自律確定の結果・根拠・HITL不要理由が既存成果物から確認できる (7) 空入力でHITLなしの
      正常完了 (8) --auto が明示opt-in fast path のまま (9) backlog-review のHITL契約が不変
      (10) REQ-003/036/037/038/041 と command SPEC・Workflow Skill の記述が相互に矛盾しない。
    on_failure: |
      fix-and-reverify。HITL境界は契約の中核であり、境界の誤りはユーザー判断の侵害または不要な待機を
      生むため、実装修正後に同一シナリオで再検証する。
  - id: TS-002
    target_item: AG-002
    verification: |
      通常 Standard Case・通常 Epic Case の回帰確認（worktree 起点、PR base、merge 先が main のまま）と、
      評価ブランチを統合先とする Case で worktree 起点・PR base・同期基準・鮮度確認・merge 先・
      Epic 後続 Wave 起点が同一統合先へ切り替わること、複数評価ブランチ並行 Case で状態混入がないことを
      確認する。RU-0002 の決定的受け入れ条件 1〜9 を個別評価する。
    pass_criteria: |
      (1) main が唯一の正規ブランチ (2) 通常 Standard Case が従来どおり main へ squash merge される
      (3) 通常 Epic Case が従来どおり main を介して Wave を進められる (4) 統合先を評価ブランチへ設定できる
      (5) 統合先の6項目が一致 (6) 複数評価ブランチ並行で混在なし (7) 新規公開Gitコマンドなし
      (8) QG-4 の意味不変 (9) main 以外統合先の完了を main 反映扱いにしない。
    on_failure: |
      fix-and-reverify。統合先の不整合は通常Case回帰を壊すため、修正後に通常Case回帰と実証Case切替の
      両方を再検証する。
  - id: TS-003
    target_item: AG-003
    verification: |
      実証が明示された場合・未明示の場合の req-define 挙動、実証Case確定後の評価ブランチ決定的導出、
      評価契約の確定とテスト戦略との分離、ユーザー指示による評価契約変更と再評価、完了後の契約変更要求を
      検証する。RU-0003 の決定的受け入れ条件 1、2、8、9、10 を個別評価する。
    pass_criteria: |
      (1) 実証必要性を推論し未明示時は理由提示と合意後に確定 (2) 確定後に評価ブランチ利用を再確認しない
      (3) 評価契約が実証開始前に確定し実行側が自律変更しない (4) ユーザー指示変更が記録され必要な再評価・
      再実行が行われる (5) 完了済み実証の契約と結果が書き換えられない。
    on_failure: |
      fix-and-reverify。評価契約の自律変更は実証の意味を壊すため、修正後に同一シナリオで再検証する。
  - id: TS-004
    target_item: AG-004
    verification: |
      Standard 実証の評価ブランチ上での req-save / spec-save 実行、draft 引き継ぎ、評価ブランチ上 accepted
      文書の正式性判定、RU 消費状態の main 側維持（評価ブランチ削除後の再出現なし）、Issue からの実証状態
      復元、採用 / 不採用 / 判定不能 / blocked / failed の区別、中断・再開・明示的放棄を検証する。
      RU-0003 の決定的受け入れ条件 3、4、5、6、7、14、15 を個別評価する。
    pass_criteria: |
      (1) 1実証単位=1評価ブランチで複数実証が並行可能 (2) draft が欠落なく引き継がれ req-save / spec-save が
      継続実行可能 (3) 評価ブランチ上文書を main 正式成果物と誤認しない (4) 評価ブランチ削除後も RU 消費状態が
      巻き戻らない (5) Issue から実証種別・評価ブランチ・実証単位を復元できる (6) 4評価結果区分と
      blocked / failed 未確定扱いが正しい (7) blocked / failed / 中断時にブランチ保持、明示放棄時のみ破棄。
    on_failure: |
      fix-and-reverify。RU 巻き戻りはドメイン状態の破壊のため、修正後に評価ブランチ削除を含む
      シナリオで再検証する。
  - id: TS-005
    target_item: AG-005
    verification: |
      Issue 本文・PR・Issue 最終コメントへの記録、評価ブランチ削除後の証拠追跡、main 進行と評価結果の
      独立性、実証完了時の merge 非実施とブランチ削除、最終 case-close の req-define <実証Issue> 案内
      （Epic 中間Waveを除く）、req-define <実証Issue> の最新 main 再評価、Epic 実証の Wave 継承と
      統合評価 Wave 要否を検証する。RU-0003 の決定的受け入れ条件 11、12、13、16、17、18、19 を個別評価する。
    pass_criteria: |
      (1) Standard 実証が評価ブランチで完結 (2) Epic 各Waveが同一評価ブランチを継承し必要時のみ統合評価
      (3) feature 以外の実証で Epic 利用可能 (4) 評価ブランチを main へ merge せず完了 (5) 削除後も
      Issue/PR から結果と証拠を追跡可能 (6) 最終 case-close が正式化経路を案内し中間Waveでは案内しない
      (7) req-define <実証Issue> が最新 main への適用可能性を再評価する。
    on_failure: |
      fix-and-reverify。正式化導線の欠落は実証知見を喪失させるため、修正後に導線全体を再検証する。
  - id: TS-006
    target_item: AG-006
    verification: |
      RU-0003 の主要シナリオ（Standard / Epic、採用 / 不採用 / 判定不能、blocked / failed、中断・再開、
      評価契約変更、複数実証並行）を case-auto 経由で実行し、手動ワークフローとの最終状態・副作用・
      Issue/PR 証跡・main 非反映が一致することを確認する。通常 case-auto の回帰も確認する。
      RU-0004 の決定的受け入れ条件 1〜14 を個別評価する。
    pass_criteria: |
      (1) 通常 case-auto の回帰なし (2) Standard 実証を評価ブランチ上で完遂 (3) Epic 実証を複数Waveにわたり
      同一評価ブランチ上で完遂 (4) 独立した複数実証を別々の評価ブランチで扱える (5) req-save / spec-save が
      省略されない (6) 各PRが対応評価ブランチへ squash merge される (7) 採用・不採用・判定不能を正常な
      評価結果として扱い blocked / failed を実証完了扱いしない。加えて不採用・判定不能の実証Caseが
      評価を完遂していれば QG-4 合格で完了できる（採否を完了条件にしない）
      (8) 中断再実行時に正しい評価ブランチを復元
      (9) 明示放棄時のみ記録後に破棄 (10) 評価契約を自律変更しない (11) main へ merge しない
      (12) 実証完了後に正式化・本実装へ自動継続しない (13) 最終出力に評価結果・証拠・main 未反映・次の
      req-define <実証Issue> が表示される（実証未完の blocked / failed 終了時は再開手段を示す）
      (14) Epic 中間Waveで正式化案内なし。
    on_failure: |
      fix-and-reverify。case-auto と手動ワークフローの不整合は自走事故につながるため、修正後に
      手動との一致比較を再検証する。

# review_dispositions: 採否判断の記録。4RUはすべて全量採用（covered）
review_dispositions:
  - id: RD-001
    source_ru: RU-0001
    source_item: RU-0001
    disposition: covered
    reason_code: fully_adopted
    reason: |
      RU-0001 の全合意内容（共通原則、各promote適用、backlog-auto関係、--auto維持、安全境界維持、
      証跡方針、決定的受け入れ条件1〜20）を AG-001、ACT-REQ-003〜008、ACT-SPEC-001、007〜009、
      TS-001 へ反映した。対象外リストも尊重済み。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 全体
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0002
    source_item: RU-0002
    disposition: covered
    reason_code: fully_adopted
    reason: |
      RU-0002 の全合意内容（ブランチモデル、統合先一般化、case-close、評価ブランチの位置づけ、決定的受け入れ
      条件1〜9）を AG-002、ACT-REQ-001、ACT-DEC-001、ACT-REQ-011〜014、016、017（AG-002 由来の更新）、
      ACT-SPEC-010、TS-002 へ反映した。REQ-043-012 が参照する ADF 制御状態の正規位置（REQ-042-012）も
      RU-0002 の基盤契約として所有する。ACT-SPEC-003〜005 は AG-005 と共有する基盤整備であり
      RD-003 側に主たる反映を記録する。
    evidence:
      path: .agentdev/backlog/req-units/RU-0002.md
      section: 全体
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_ru: RU-0003
    source_item: RU-0003
    disposition: covered
    reason_code: fully_adopted
    reason: |
      RU-0003 の全合意内容（実証Case判定、評価契約、変更管理、実行と状態、評価ブランチ上の成果物、ADF制御
      状態、永続識別、case-open/run/close、Standard/Epic、評価結果、記録と追跡、mainとの関係、中断・失敗・
      再開、正式化、決定的受け入れ条件1〜19）を AG-003〜005、ACT-REQ-002、ACT-REQ-008〜010、018（AG-003/005
      由来）、ACT-SPEC-002〜006、011、012、TS-003〜005 へ反映した。REQ-030/031/032 の統合先一般化
      （ACT-REQ-011〜014）と ACT-SPEC-010 は RU-0002 側（RD-002）が主たる所有者。
    evidence:
      path: .agentdev/backlog/req-units/RU-0003.md
      section: 全体
      checked_at_commit: null
    related_removed_items: []
  - id: RD-004
    source_ru: RU-0004
    source_item: RU-0004
    disposition: covered
    reason_code: fully_adopted
    reason: |
      RU-0004 の全合意内容（実証Case認識、評価ブランチ利用と復元、req-save/spec-save省略禁止、Epic反復、
      squash merge正常完了、実行状態と評価結果の区分、main非merge、正式化非継続、最終case-close終端、
      中断時保持、明示放棄時破棄、評価契約自律変更禁止、最終出力、決定的受け入れ条件1〜14）を AG-006、
      ACT-REQ-015、ACT-SPEC-006、TS-006 へ反映した。
    evidence:
      path: .agentdev/backlog/req-units/RU-0004.md
      section: 全体
      checked_at_commit: null
    related_removed_items: []

# case_open_hints: case-open 構成生成への参考情報（Issue 階層は case-open が決定する）
case_open_hints:
  epic_needed: true
  decomposition: |
    2系統を独立 Issue 階層へ分割可能。(a) RU-0001系: promote自律確定（REQ-003 append、REQ-036/037/038/041
    update、workflow-contracts・3 promote command SPEC 更新）。(b) RU-0002〜0004系: 評価ブランチ
    （REQ-042/043 create、DEC-018、REQ-004/005/017/030/031/032/034/035 更新、各 command/skill/workflow
    SPEC 更新）。(b)内は Wave 順序依存あり（OU の depends_on 参照）。
  wave_hints:
    - wave 1: 基盤原則（OU-0001 REQ-003 append、OU-0002 REQ-042 create、OU-0003 DEC-018 create）
    - wave 2: 実証ワークフローとpromote系各REQ（OU-0004、OU-0005〜0008、OU-0009〜0011）
    - wave 3: 接続REQ群と基盤SPEC（OU-0012〜0015、0017、0019、0028）
    - wave 4: 同一ファイル追記とcommand SPEC群・workflow-lifecycle SPEC（OU-0016、0018、0020〜0023、0025〜0027、0030）
    - wave 5: case-auto SPEC と epic-wave SPEC（OU-0024、OU-0029。OU-0029 は OU-0018 への必須依存により後続 Wave）
```

# summary

4件のRU（promote系自律確定、Case統合先一般化、評価ブランチ実証ワークフロー、case-auto実証対応）を
単一ドラフトへ整理した。正規所有者構成は壁打ちで合意した補正版A（新規REQ 2本 + REQ-034/035 UPDATE、
RU-0001はREQ-003 APPEND）。REQ-042/REQ-043/DEC-018 は仮採番（採番空き確認済み）。req-save は
new:{slug} 形式の target を採番結果へ置換する（REQ-008-031）。adversarial-review（経路A）の
accepted finding 反映済み（ドメイン状態の main 正規位置、採番ローカル性、実証情報の draft-data 出力、
REQ-031-024 採番修正、REQ-036/037/038 目的節更新、経路制御節・workflow-lifecycle SPEC 更新追加、他）。
検討経緯（SPLIT 案の比較、REQ-006 確認結果）は本文に含めない。
