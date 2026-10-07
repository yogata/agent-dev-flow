---
draft_type: req_draft
topic_slug: adf-v4-canonical-convergence
status: draft
created_at: "2026-10-07T14:25:00+09:00"
source_rus: [RU-0181]
agentdev_handoff: true
---

# draft-data

```yaml
work_type: maintenance

scale: large

summary: |
  RU-0181 の合意内容を、ADF v4 の正規モデル再確定と現行規範の全面収束を所有する単一の新規REQとして構造化した。
  判断アーキテクチャ（決定的処理第一・閉じた意味評価の適格性・開いた LLM 推論の限定・LLM fallback 禁止・評価器障害時の判定未確定と依存後続抑止・再開経路）、
  soft contract の再定義、ライフサイクル責務の単一所有、現行規範の全面再評価（keep/redefine/merge/supersede/retire と反映完了）、
  過剰統制の除去、歴史記録の保全、docs 全体整合・実現物整合・入力忠実性、互換維持による妥協の禁止と v4 境界、
  baseline tag（付与済み baseline-v4-canonical-convergence-20261007）、有限な完了（AC-01〜AC-25 の個別判定と AC-26 の判定規則の適用）を状態要件 31 行として確定し、
  検証義務 17 項目と実現面変更方針 5 領域を対応させた。
  既存 REQ/Decision/Design の個別処遇は RU 合意（正規モデル確定後に確定）に従い本 draft では確定しない。
  DEC-044 決定3（評価器失敗時の reasoning model 経由継続）と本件の障害時契約の矛盾は、正規モデル確定後の後継 Decision による部分置換で解消する方針として記録した。
  生成主体（session-supervisor）の取り扱いは、ユーザーの最新指示により Hermes 側の責務とされ、ADF で別件正規化する並行作業は取り下げられた。当該実装作業を本 draft の対象外とする（全面再評価の評価対象からは除外しない）。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      正規モデルの自足性と独立軸。現在の ADF の目的、Standard Operating Model と Runtime / Adapter / Project Model の責務境界、成果物モデル（REQ、Decision、Design、Implementation、Evidence の意味境界）、公開入口と内部ライフサイクル、品質モデル、人間判断境界、Project Extensions と安全境界、Intake / Learning / Backlog の責務、durable state と再構成・再実行の原則を、旧設計を前提とせず正規文書群から一意に説明できる。本 RU の合意済み原則からの具体化と、新しい人間判断を要する選択とを区別し、未確定事項に依存する下流の確定・変更を開始しない。判断方法、判断結果を確定してよい主体の区分、副作用実行可否を独立した軸として説明できる。既存成果物は正規モデルを確定するための情報源ではあるが、維持すべき制約とはしない。
  - id: AG-002
    content: |
      決定的処理優先と二重判定禁止。入力と確定済み規則から一意に導出可能で、責務に見合う実装・維持費用で機械化できる判断・チェックは決定的処理として実行し、同じ命題を閉じた意味評価や LLM 推論へ二重に委ねない。同じ命題の再判定と、入力の十分性・規則の妥当性という異なる命題の評価は区別する。一意に導出可能でも機械化が不相応に複雑になる場合は例外とし、その理由を説明する。数値的な費用判定器や中央ルーターは新設しない。
  - id: AG-003
    content: |
      閉じた意味評価の適格性と機械化過剰の回避。閉じた意味評価として残す各判断について、必要な事実、判断基準、結果空間、評価入力が評価前に閉じ、入力構成の内部に別の未解決意味判断を隠していないこと、および決定的処理ではなく閉じた意味評価を使用する理由（機械化の不可能性、または機械化が責務に対して不相応な複雑性を生じることと、採らなかった機械化案の具体的な実装・維持負担）が正規文書から確認できる。「機械的でない」「意味を扱う」という理由や結果空間の有限性だけでは閉じた意味評価へ分類しない。閉包条件の成立と評価器の判定品質は別であり、正規判定主体として残す各判断について評価器の適格性根拠（代表例、反例、判定不能例）を確認する。必要性または適格性を示せない評価は縮小・分解・廃止を含めて再検討する。廃止する評価の大規模な性能実証、評価器全体の有効性研究、全仮説の実証は要求しない。
  - id: AG-004
    content: |
      開いた LLM 推論の限定。LLM 推論は、決定的処理と閉じた意味評価のいずれにも適合しない本質的に結果空間を事前閉包できない問題（根本原因の探索、設計案の探索、未整理情報からの候補形成、複数文脈を統合した考察等）のみ例外的に利用する。前段が失敗した場合の一般 fallback としない。LLM 推論によって新しい目的、対象範囲、外部契約、受け入れ条件、恒久規範、規範間優先順位を自動確定しない。
  - id: AG-005
    content: |
      閉じた意味評価の障害時契約。必須の閉じた意味評価が評価器の未設定、利用不能、timeout、rate limit、network error、provider error、応答検証失敗、その他評価を成立させられない障害になった場合、LLM 推論へ fallback して判定を継続せず、必要な判定を未確定として当該判定に依存する後続の副作用・状態遷移を開始しない。当該状態を「新しい意味判断が必要な状態」ではなく「必要な評価能力の利用不能または実行前提不成立」として扱う。判定不能を不合格または非該当へ変換せず、依存しない独立作業を一律に停止しない。評価器障害だけを理由に人間判断へ移行せず、人間判断への移行は当該判断自体が人間に留保された判断である場合に限る。
  - id: AG-006
    content: |
      再開可能性。評価器復旧後、未確定状態から正規の再実行・再開経路によって評価を再実行できる。再開前に入力、規則、成果物、証拠への変更影響を確認し、影響する古い判定を再利用せず、成功済み副作用を重複実行せず、影響しない証拠は一律破棄せず再利用する。新しい状態・台帳の追加を前提とせず、既存の再開経路で成立させる。修復・再試行は判定方式の代替と区別し、設定・認証等の運用介入は新規規範を確定する人間判断と区別する。
  - id: AG-007
    content: |
      人間判断境界。新しい目的、価値、優先順位、対象範囲、外部契約、受け入れ条件、恒久規範、または既存規範だけでは解決できない規範間優先順位の確定だけが、人間に留保された判断として扱われる。委譲された裁量内の具体化を新規規範の確定と同じ承認対象にせず、人間に留保された内容判断と運用上の介入・副作用実行の許可を混同しない。文書ごとの再承認や新しい承認ゲートを設けない。本案から導出できる具体化は自律的に進め、未合意の新規規範・能力削減等だけを人間判断へ戻す。
  - id: AG-008
    content: |
      soft contract と機械処理の両立。soft contract は、厳格な API schema や過剰な互換維持機構を要求しないという契約特性を表すものと再定義する。soft contract であることを、LLM が読み取らなければならない理由、機械的処理を避ける理由、schema validation を全面禁止する理由として扱わない。存在確認、型、列挙値、ID、参照関係、明示的フィールド等、決定的に扱える部分は soft contract のまま機械的に処理できる。
  - id: AG-009
    content: |
      ライフサイクル責務の単一性と Wave/依存概念の整合。現在の正規モデルを基準に case-open、case-ready、case-run、case-close、case-revise 等の責務を再確定し、同一責務を複数工程が所有する状態、旧工程からの移管漏れ、Guide と正規 Design の不一致を残さない。特に Root Case 確立、Definition 受入、REQ/Decision/Design 保存、execution contract 確定、Standard/Epic 構成、Child Issue 構成、Wave/依存 DAG、実装実行、Verification/QG、merge/close、revise/resume を再評価する。Wave、意味的依存、実行並列上限、競合情報の各概念が互いに混同されず、それぞれの正規責務と決定方法が一意である。
  - id: AG-010
    content: |
      現行規範の全面再評価。作業開始時の基準状態から現行の REQ、Decision、Design、Guide 等の評価対象集合を確定し、それぞれを keep、redefine、merge、supersede、retire のいずれかに分類する。accepted であること、現在実装されていること、既存 workflow が依存していること、最近是正されたことだけを keep の理由または評価免除の理由としない。keep 以外の分類は分類の記録だけで完了とせず、必要な反映、消費側・参照先・検証期待値の更新までを完了対象とする。記録は今回限りの既存成果物または検証記録で行い、恒久台帳は新設しない。規範自体の誤りと、妥当な規範の投影・履行・検証不成立を区別し、規範変更が不要な問題まで再設計しない。全域を評価するが全域を作り直さず、妥当な既存成果と現在にも有効な検証証拠を再利用する。
  - id: AG-011
    content: |
      過剰統制の不存在と新規統制の抑制。現行の hard gate、fail-closed、checker、MUST NOT、禁止事項、must_not、adversarial-review、HITL、fallback、duplicated validation、state、ledger、routing、additional schema の各統制について、必要な安全境界・整合性保証として正規モデル上の必要性を説明できることを要求し、必要性を説明できない統制は維持しない。問題を統制追加で解決する前に、責務削減、契約縮小、重複除去、決定的導出、所有者統合、不要経路廃止での解消を優先する。本変更の実現のためだけに、必要性が立証されていない中央 router、ledger、新規状態、新規 gate、新規 schema、新規 checker 等を追加しない。
  - id: AG-012
    content: |
      歴史記録の保全と識別性。retired REQ、superseded Decision、historical report、過去の観測記録、過去の release/migration 記録は、現行規範として参照されない限り過去時点の事実として原則保持する。現在の用語や設計思想に合わせるためだけに歴史的本文を書き換えない。歴史的成果物が現行契約として誤認されず、現在の正規所有者へ到達できる。
  - id: AG-013
    content: |
      用語整合と docs 全体整合。廃止済み command、旧 lifecycle 名、旧成果物名等の旧語彙が、歴史的説明を除いて現行規範として使用されていない。現行規範として有効な docs 配下全体を横断して読んだとき、ADF の設計思想、判断責務、ライフサイクル、用語、所有関係について相互矛盾する現在像が得られない。
  - id: AG-014
    content: |
      実現物整合と入力忠実性。Command、Workflow Skill、Capability Skill、Script、Tool、Template、Extension、checker 等の実現物が、確定した正規モデルと矛盾する責務・判断経路を実装していない。実現物同士の整合だけでなく、本 RU の合意が正規契約・実行入力・検証義務へ意味を保って届いている。試験内の参照モデルや手順文面の存在だけを、実運用入力の検査と拒否結果による副作用抑止の証明として扱わない。
  - id: AG-015
    content: |
      互換維持による妥協の禁止と v4 境界。現行 v4 の実装・文書・accepted Decision 等との互換維持だけを理由として、正規モデルと矛盾する構造を残さない。OpenCode/Senpi、GitHub/ローカル Issue 等の現在提供する能力は維持を出発点とし、能力自体の廃止案は失う用途と効果を示して個別の人間判断へ戻す（内部互換不要の合意を提供能力削減の包括承認と扱わない）。正規モデルへ収束するために必要であれば破壊的な変更を許容する。再収束後も v4 の Standard Operating Model の目的と中核（要件に基づく継続的な開発という目的、要求・判断権限・永続状態・実行安全・証拠連鎖の意味上の性質）を維持できる。維持できないことが判明した場合、本作業内で暗黙に v5 化せず、その理由と必要な新規判断事項を提示して停止する。工程名・工程数・内部配置・現在の実現方式の変更だけで中核放棄と判定せず、公開入口やライフサイクルの構成変更だけではこの停止条件に該当しない。外部契約の変更は別途、人間に留保された判断として扱う。
  - id: AG-016
    content: |
      作業前 baseline。再収束の変更開始前の main の静止点を Git tag として保存する。タグは release version を表す SemVer tag と混同しない baseline 用の非 SemVer 名とし、既存 release tag を移動・再利用しない。再収束後の状態から baseline tag を用いて作業前状態との差分を一意に比較できる。目的は、作業前状態の一意な参照、before/after 比較、必要時の調査・回復基準、現行状態を維持制約にせず破壊的再評価を可能にすることである。本 draft 時点で付与済み（baseline-v4-canonical-convergence-20261007、指す commit は 72e04cadc4ff8fa00b6f484f421975c99a75b449）。
  - id: AG-017
    content: |
      有限な実施範囲と完了。作業開始時の基準状態から評価対象集合を確定し、今回を一度で閉じる有限な再評価とする。無関係な改善、新しい研究、継続的再評価能力の整備を追加しない。作業中に見つかった同じ対象問題の残存と変更による不整合は扱い、範囲外の発見は別課題として記録できるが本要件の未達を別課題へ送って完了としない。正規モデルの合意後、領域別の反映を独立性に従って並列化し、最終的に横断整合と実経路での成立を確認する。評価対象の増殖を防ぐためだけの中央管理機構や工程を追加しない。最終検証では本要件の受け入れ条件 AC-01〜AC-25 を少なくとも pass、fail、blocked、not applicable で個別判定し、fail または blocked が残る場合に完了と報告しない。非該当は正規モデル上の廃止等、適用されない根拠を説明できる場合に限り、未評価・未投影・未実装・未検証・証拠不足・検証不能を非該当としない。判定は現在の契約・対象成果物・評価範囲に有効な証拠に基づく。新しい観測が増えたことだけでは今回の完了を取り消さず、確定した完了条件への具体的な反証が出た場合は正規の訂正経路で扱う。既存証拠は現在の契約・成果物・評価範囲への有効性を確認して再利用し、全試験の無条件な二重実行を要求しない。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: create
    target: new:adf-v4-canonical-convergence
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007, AG-008, AG-009, AG-010, AG-011, AG-012, AG-013, AG-014, AG-015, AG-016, AG-017]
    content: |
      # ADF v4 正規モデル再確定と現行規範の全面収束

      ## 目的

      ADF v4 の正規モデル（責務層、判断アーキテクチャ、公開入口と内部ライフサイクル、品質モデル、人間判断境界）を ADF の目的と v4 の中核思想から再確定し、その正規モデルと矛盾する現行規範および実現物を置換・統合・廃止を含めて全面的に収束させる。
      合意した要求の意味・禁止・検証義務が実行と完了判定まで保持され、未達を完了として扱わないことを成立条件とする。その範囲で、機械工程のモデルによる逐次駆動、不要な二重判断、処理時間、人間介入、変更時の同期負担を最小化する。
      全域を一度再評価し、必要な箇所だけ変更し、実経路で成立を確認して閉じる。文書数、要求数、検査数の削減自体は成功条件としない。
      本要件は文書クリーンアップではなく、v4 内部で蓄積した矛盾、古い設計思想、責務のずれ、および実証結果を踏まえて v4 が本来表現すべきモデルへ再収束させるものである（v5 新設ではない）。

      ## 要件

      | ID | 要件 |
      |---|---|
      | REQ-{NNN}-001 | ADF の目的、Standard Operating Model と Runtime / Adapter / Project Model の責務境界、成果物モデル（REQ、Decision、Design、Implementation、Evidence の意味境界）、公開入口と内部ライフサイクル、品質モデル、人間判断境界、Project Extensions と安全境界、Intake / Learning / Backlog の責務、durable state と再構成・再実行の原則を、旧設計を前提とせずに正規文書群から一意に説明できること |
      | REQ-{NNN}-002 | 判断方法（決定的処理、閉じた意味評価、開いた推論）、判断結果を確定してよい主体の区分（正規契約からの導出、委譲された裁量、人間に留保された判断）、および副作用実行可否を独立した軸として扱い、それぞれ正規文書から判別できること |
      | REQ-{NNN}-003 | 入力と確定済み規則から一意に導出可能で、責務に見合う実装・維持費用で機械化できる判断・チェックを決定的処理として実行すること。同じ命題を閉じた意味評価または LLM 推論で正規工程として再判定しないこと（入力の十分性・規則の妥当性という別命題の評価は区別する） |
      | REQ-{NNN}-004 | 閉じた意味評価として正規判定主体に残す各判断について、必要な事実、判断基準、結果空間、評価入力が評価前に閉じ、入力構成の内部に別の未解決意味判断を隠していないことを正規文書から確認できること |
      | REQ-{NNN}-005 | 閉じた意味評価として残す各判断について、決定的処理を採らない理由（機械化の不可能性、または機械化が責務に対して不相応な複雑性を生じることと、採らなかった機械化案の具体的な実装・維持負担）を正規文書から確認できること（「意味判断である」ことや結果空間の有限性だけを理由に閉じた意味評価へ分類しない） |
      | REQ-{NNN}-006 | 閉じた意味評価として残す各判断について、判断契約を満たす評価器の適格性根拠（代表例、反例、判定不能例）を正規文書から確認できること（必要性を示せない評価を必須化しない。廃止する評価の大規模な性能実証や評価器全体の有効性研究を完了条件に含めない） |
      | REQ-{NNN}-007 | 正規判定に LLM 推論を使用する箇所を、本質的に結果空間を事前閉包できない開いた問題（根本原因の探索、設計案の探索、未整理情報からの候補形成、複数文脈を統合した考察等）に限定すること（LLM 推論を前段失敗時の一般 fallback または新しい目的・対象範囲・外部契約・受け入れ条件・恒久規範・規範間優先順位の自動確定に使用しない） |
      | REQ-{NNN}-008 | 必須の閉じた意味評価が、評価器の未設定、利用不能、timeout、rate limit、network error、provider error、応答検証失敗等で成立しない場合、LLM 推論へ fallback して判定を継続しないこと |
      | REQ-{NNN}-009 | 前項の状態において、必要な判定を未確定として扱い、当該判定に依存する後続の副作用および状態遷移を開始しないこと（判定不能を不合格または非該当へ変換せず、依存しない独立処理を一律に停止しない） |
      | REQ-{NNN}-010 | 評価器障害だけを理由に人間判断へ移行しないこと（人間判断への移行は、当該判断自体が人間に留保された判断である場合に限る） |
      | REQ-{NNN}-011 | 評価器復旧後、未確定状態から正規の再実行・再開経路によって評価を再実行できること（再開前に入力・規則・成果物・証拠への変更影響を確認し、影響する古い判定を再利用せず、成功済み副作用を重複実行せず、影響しない証拠は再利用する。修復・再試行・設定等の運用介入を判定方式の代替または新規規範の確定と混同しない） |
      | REQ-{NNN}-012 | 新しい目的、価値、優先順位、対象範囲、外部契約、受け入れ条件、恒久規範、および既存規範だけでは解決できない規範間優先順位の確定のみを、人間に留保された判断として扱うこと（委譲された裁量内の具体化を新規規範の確定と同じ承認対象にせず、人間に留保された内容判断と運用上の介入・副作用実行の許可を混同しない） |
      | REQ-{NNN}-013 | soft contract を、厳格な API schema や過剰な互換維持機構を要求しない契約特性として定義すること（soft contract を LLM 解釈必須の理由、機械的処理を避ける理由、schema validation の全面禁止の理由として扱わない。存在確認、型、列挙値、ID、参照関係、明示的フィールド等の決定的に扱える部分を機械的に処理できる） |
      | REQ-{NNN}-014 | Root Case 確立、Definition 受入、REQ/Decision/Design 保存、execution contract 確定、Standard/Epic 構成、Child Issue 構成、Wave/依存 DAG、実装実行、Verification/QG、merge/close、revise/resume の主要責務について正規所有者が一意であること（同一責務を複数工程が現行責務として所有しない） |
      | REQ-{NNN}-015 | Wave、意味的依存、実行並列上限、競合情報の各概念を混同せず、それぞれの正規責務と決定方法を一意に定めること |
      | REQ-{NNN}-016 | 作業開始時の基準状態から評価対象集合を確定し、対象となる現行 REQ/Decision/Design/Guide の全域について正規モデルとの関係を keep、redefine、merge、supersede、retire のいずれかに判定済みとし、未評価の現行規範を残さないこと（accepted であること、現在実装されていること、既存 workflow が依存していること、最近是正されたことだけを keep または評価免除の理由としない） |
      | REQ-{NNN}-017 | keep 以外に分類した現行規範について、分類の記録だけでなく、必要な反映、参照先・消費側の更新、検証期待値の更新までを完了対象とすること（妥当な既存成果と現在も有効な検証証拠を確認して再利用し、不要に作り直さない。記録は今回限りの既存成果物または検証記録で行い、恒久台帳を新設しない） |
      | REQ-{NNN}-018 | 現行の hard gate、fail-closed、checker、禁止規則、must_not、adversarial-review、HITL、fallback、duplicated validation、state、ledger、routing、additional schema の各統制について、正規モデル上の必要性を説明できること（必要性を説明できない統制を維持せず、統制追加の前に責務削減、契約縮小、重複除去、決定的導出、所有者統合、不要経路廃止での解消を優先する） |
      | REQ-{NNN}-019 | 本要件の実現のために、必要性が立証されていない中央 router、ledger、新規状態、新規 gate、新規 schema、新規 checker、恒久台帳を追加しないこと |
      | REQ-{NNN}-020 | retired REQ、superseded Decision、historical report、過去の観測記録、過去の release/migration 記録を、現行規範として参照されない限り過去時点の事実として保持すること（現在の用語や設計思想に合わせるためだけに歴史的本文を書き換えない） |
      | REQ-{NNN}-021 | 歴史的成果物が現行契約として誤認されず、現在の正規所有者へ到達できること |
      | REQ-{NNN}-022 | 廃止済み command、旧 lifecycle 名、旧成果物名等の旧語彙が、歴史的説明を除いて現行規範として使用されていないこと |
      | REQ-{NNN}-023 | 現行規範として有効な docs 配下全体を横断して読んだとき、ADF の設計思想、判断責務、ライフサイクル、用語、所有関係について相互矛盾する現在像が得られないこと |
      | REQ-{NNN}-024 | Command、Workflow Skill、Capability Skill、Script、Tool、Template、Extension、checker 等の実現物が、確定した正規モデルと矛盾する責務・判断経路を実装していないこと |
      | REQ-{NNN}-025 | 本要件の合意内容が、正規契約、実行入力、検証義務へ意味を保って投影されていること（静的呼出元の有無、試験内参照モデル、手順文面の存在確認を、実運用入力の検査と拒否結果による副作用抑止の証明として扱わない） |
      | REQ-{NNN}-026 | 現行 v4 の実装、文書、accepted Decision との互換維持だけを理由として、正規モデルと矛盾する構造を残さないこと（OpenCode/Senpi、GitHub/ローカル Issue 等の現在提供する能力は維持を出発点とし、能力自体の廃止案は失う用途と効果を示して個別の人間判断へ戻す） |
      | REQ-{NNN}-027 | 再収束後も v4 の Standard Operating Model の目的と中核（要件に基づく継続的な開発という目的、要求・判断権限・永続状態・実行安全、証拠連鎖の意味上の性質）を維持できること（維持できないことが判明した場合は本要件の作業内で暗黙に v5 化せず、理由と必要な新規判断事項を提示して停止する。工程名・工程数・内部配置・現在の実現方式の変更だけを中核放棄と判定しない。外部契約の変更は人間に留保された判断として扱う） |
      | REQ-{NNN}-028 | 再収束の変更開始前の main commit に、release version と混同されない非 SemVer の baseline tag（baseline-v4-canonical-convergence-20261007）が存在し、既存 tag の移動・再利用を行わないこと。再収束後の状態から当該 tag により作業前状態との差分を一意に比較できること |
      | REQ-{NNN}-029 | 全域再評価を今回限りの有限な作業として完了させること（無関係な改善、新しい研究、継続的再評価能力の整備を完了条件に追加せず、作業中に見つかった同じ対象問題の残存と変更による不整合を扱い、範囲外の発見は別課題として記録するが本要件の未達を別課題へ送って完了としない） |
      | REQ-{NNN}-030 | 正規モデル合意後の領域別の反映を独立性に従って並列化し、最終的に横断整合と実経路での成立を確認すること |
      | REQ-{NNN}-031 | 最終検証において、受け入れ条件対応節に定義のある AC-01 から AC-25 までを少なくとも pass、fail、blocked、not applicable で個別に判定し、fail または blocked が残る場合に完了と報告しないこと（各判定は受け入れ条件対応節の定義所在と検証義務から根拠証拠へ到達できること。covered の自己宣言、AC 番号の言及のみ、工程終了の記録を証明として扱わない。not applicable は正規モデル上の廃止等、適用されない根拠を説明できる場合に限り、未評価、未投影、未実装、未検証、証拠不足、検証不能を not applicable としない。判定は現在の契約・対象成果物・評価範囲に有効な証拠に基づく。確定した完了条件への具体的な反証が出た場合は正規の訂正経路で扱い、新しい観測の増加だけを理由に完了対象を無期限に拡張しない） |

      ## 受け入れ条件対応

      本要件の完了判定は本節の対応に従い、受け入れ条件 AC-01〜AC-26 を個別に判定する。本節が AC 番号の定義所在を所有し、RU-0181 および要件ドラフトの消費後も番号、条件の定義所在、検証義務を一意に再構成できる（中央台帳・checker は新設しない）。

      | AC | 条件の定義所在（要件行） | 検証義務 |
      |---|---|---|
      | AC-01 | REQ-{NNN}-001、REQ-{NNN}-002 | TS-001 |
      | AC-02 | REQ-{NNN}-016、REQ-{NNN}-017 | TS-010 |
      | AC-03 | REQ-{NNN}-003 | TS-002 |
      | AC-04 | REQ-{NNN}-003 | TS-002 |
      | AC-05 | REQ-{NNN}-004、REQ-{NNN}-006 | TS-003 |
      | AC-06 | REQ-{NNN}-005 | TS-003 |
      | AC-07 | REQ-{NNN}-007 | TS-004 |
      | AC-08 | REQ-{NNN}-008 | TS-005 |
      | AC-09 | REQ-{NNN}-009 | TS-005 |
      | AC-10 | REQ-{NNN}-011 | TS-006 |
      | AC-11 | REQ-{NNN}-010、REQ-{NNN}-012 | TS-005、TS-007 |
      | AC-12 | REQ-{NNN}-013 | TS-008 |
      | AC-13 | REQ-{NNN}-014 | TS-009 |
      | AC-14 | REQ-{NNN}-015 | TS-009 |
      | AC-15 | REQ-{NNN}-022 | TS-013 |
      | AC-16 | REQ-{NNN}-018 | TS-011 |
      | AC-17 | REQ-{NNN}-019 | TS-011 |
      | AC-18 | REQ-{NNN}-020 | TS-012 |
      | AC-19 | REQ-{NNN}-021 | TS-012 |
      | AC-20 | REQ-{NNN}-023 | TS-013、TS-001 |
      | AC-21 | REQ-{NNN}-024、REQ-{NNN}-025 | TS-014 |
      | AC-22 | REQ-{NNN}-026 | TS-015 |
      | AC-23 | REQ-{NNN}-027 | TS-015 |
      | AC-24 | REQ-{NNN}-028 | TS-016 |
      | AC-25 | REQ-{NNN}-028 | TS-016 |
      | AC-26 | REQ-{NNN}-031（判定規則） | TS-017 |

      ## 適用範囲

      ### 対象

      - docs 配下の現行規範全体（現行 REQ、現行 Decision、現行 Design、現行 Guide）
      - 正規規範を実現する Command、Workflow Skill、Capability Skill、Script、Tool、Template、Extension、checker 等の実現物
      - 正規規範から導出される責務・判断・ライフサイクルの整合
      - 過剰統制の再評価
      - 旧責務、旧 command、旧語彙の現行規範からの除去
      - 作業前 baseline tag の維持と before/after の全体整合検証

      ### 対象外

      - 新しい製品機能要求の追加
      - 今回の再収束と無関係な機能改善
      - v5 の採用確定、v5 の移行方式・release 計画
      - 歴史的事実を現在の表現へ書き換えること
      - retired、superseded、reports 等の歴史的記録の一括現代化
      - 必要性が確認されていない新規 checker、gate、state、schema、registry、router、ledger の追加
      - 実装都合のみを理由とした新しい恒久規範の追加
      - 生成主体（session-supervisor）を ADF で別件正規化する作業（ユーザーの最新指示により並行作業は取り下げ。本要件の全面再評価の評価対象からは除外しない）

conflict_resolutions:
  - id: CR-001
    conflict: |
      DEC-044 決定3（「evaluator 失敗・未設定・事前検証失敗時も reasoning model 経由で Workflow を継続する」）および 6系統 Workflow 実装の Jev 逐次経路に含まれる評価器失敗時の従来 LLM 経路 fallback 記述が、本件の閉じた意味評価の障害時契約（LLM fallback 禁止、判定未確定として依存後続の開始禁止）と矛盾する。
    resolution: |
      本件の正規モデル確定後に、DEC-044 決定3 の該当部分を後継 Decision（部分置換）によって置換し、実装・正規契約を再整合する。歴史的判断本文の事実は保持する（RU-0181 の H 節・アンカー表のとおり）。解決方針自体は RU-0181 の合意（Source Summary「LLM 推論を一般的な fallback として使用しない」「評価器が未設定…LLM 推論へ fallback せず」）として確定済みであり、新規のユーザー判断は不要。後継 Decision の作成は実行時の反映作業であり、本 draft では Decision を作成しない。DEC-044 決定6 の観測保存 fail-open は保存処理の契約であり、評価成立の停止契約とは適用対象が異なるため混同しない。
  - id: CR-002
    conflict: |
      REQ-096（ADF判断アーキテクチャ）および DEC-048（判断方法・確定権限・人間判断境界の統一モデル）の現行判断モデルと、本件の判断アーキテクチャ再確定（評価器障害時契約の追加、soft contract 再定義、全域再評価）の関係。
    resolution: |
      REQ-096 および DEC-048 は本件の全面再評価の対象として扱い、keep、redefine、merge、supersede、retire の処遇を正規モデル確定後に確定する（RU-0181 の「既存 ID を本 RU の時点で維持・廃止確定しない」合意）。現行 REQ-096-002/-003 の判断3分類・確定権限の定義は本件の原則と同型であり、REQ-096-009 が Jev 逐次経路を実証・観測段階の契約と識別していることから、置換は現行規範自身が予期する発展である。中央判断機構の新設禁止（REQ-096-022/-029）等の整合原則は本件でも維持する。
  - id: CR-003
    conflict: |
      RU-0181 の generation_actor（session-supervisor）と artifact-contracts の session 由来 RU 固定値（req-define-parent）の差異、および当該生成主体契約を巡る並行正規化作業とされた領域との重複。
    resolution: |
      差異の経緯として、RU-0181 承認状態に「今回限りの差異承認」が記録されている（RU 本文の記録どおり、一般契約の改訂や他 RU への例外適用ではない）。その後、ユーザーは session-supervisor による RU 生成経路の正規ルート化を一般契約変更として指示し別 Root での処理が進行したが、最新指示により生成主体の取り扱いは Hermes 側の責務とされ、当該 ADF Case は取り下げられた（Issue #3528 は not_planned で close、PR #3529 は未マージで close、関連する 2 コミットは revert 済み）。以上を指示履歴の事実として記録し、承認済み RU-0181 の受入を例外確認で再度停止せず、生成主体の別件正規化を本要件に吸収しない。並行する実装作業とその反映を待つ実行依存は存在しない。本要件の全面再評価（AG-010）は REQ-008-051 および artifact-contracts「RU アーティファクト契約（session由来RU）」を評価対象として含み、元 RU の目的・判断境界に従い処遇を確定する（同領域を全面再評価の範囲から恒久免除しない）。評価の結果、生成主体契約の変更が必要と判定された場合は、人間判断境界（AG-007）に従って確定を求める。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0181
    target_req: new:adf-v4-canonical-convergence
    operation: create
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: epic
result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      正規文書群（docs/requirements、docs/decisions、docs/designs、docs/guides の現行規範）を横断読解し、ADF の目的、Standard Operating Model と Runtime / Adapter / Project Model の責務境界、成果物モデル、判断モデル、公開入口と内部ライフサイクル、品質モデル、人間判断境界、Project Extensions と安全境界、Intake / Learning / Backlog の責務、durable state と再構成・再実行の原則を一意に説明できることを確認する。旧設計（旧判断モデル、旧責務モデル、旧語彙）を前提とした記述の残存を、修正対象列挙（docs、src、.opencode、traceability sidecars、.agentdev/extensions/skills 配下の yaml）と一致する網羅範囲の全文検索で確認する。歴史的説明（retired、superseded、historical 本文、docs/reports）は検出対象外とする。参照行（See Also 等を含む）は検出対象であり、現行規範として旧 ID、廃止済み command、廃止済み所有先を指す参照を検出した場合は参照先の更新または参照の除去を反映対象とする。正規所有者と参照元の双方向確認（所有者から被参照、被参照から所有者）により突合する。
    pass_criteria: |
      列挙した全要素が正規文書群から一意に説明でき、相反する説明が存在せず、旧設計前提の残存が検出されない。判断方法・確定権限・副作用実行可否が独立軸として説明できる。合意済み原則からの具体化と新規人間判断を要する選択が区別されている。
    on_failure: |
      fix-and-reverify。正規文書の該当箇所を修正し、横断読解と全文検索を再実行する。意味の確定に新規人間判断が必要な箇所は人間判断へ移行し、当該箇所に依存する下流の確定を取りやめた上で再検証する。
  - id: TS-002
    target_item: AG-002
    verification: |
      正規判定主体として識別された判断・チェックの全体一覧（今回限りの評価記録）から、入力と確定済み規則からの機械的導出が可能なものの抽出を決定的処理（列挙・検査）で行い、それらが決定的処理に分類されていること、および同じ命題への閉じた意味評価・LLM 推論の再判定経路が正規工程として存在しないことを確認する。
    pass_criteria: |
      一意導出可能な判断の全てが決定的処理に分類されており、同じ命題の再判定経路が存在しない。入力の十分性・規則の妥当性という別命題の評価が区別されている。機械化の例外には理由の説明が存在する。数値的な費用判定器や中央ルーターが新設されていない。
    on_failure: |
      fix-and-reverify。二重判定経路を正規契約と実装から除去し、一覧の再抽出と確認を再実行する。
  - id: TS-003
    target_item: AG-003
    verification: |
      閉じた意味評価として残す各判断について、(1) 必要な事実・判断基準・結果空間・評価入力の評価前閉包と入力内部の未解決意味判断の非内包、(2) 決定的処理不採用の理由と採らなかった機械化案の実装・維持負担の説明、(3) 評価器適格性根拠（代表例・反例・判定不能例）の3点が正規文書から確認できることを照合する。
    pass_criteria: |
      残存する全ての閉じた意味評価で3点とも確認できる。説明を欠く評価は縮小・分解・廃止の再検討が反映済みである。結果空間の有限性だけを根拠とする分類が存在しない。
    on_failure: |
      fix-and-reverify。説明を正規文書へ整備するか、当該評価の縮小・分解・廃止を反映し、再照合する。
  - id: TS-004
    target_item: AG-004
    verification: |
      正規判定に LLM 推論を使用する箇所を一覧化し、各々について結果空間の事前閉包不能性（開放性）の根拠を確認する。LLM 推論を一般 fallback とする経路、および LLM 推論による新規規範自動確定の経路の残存を、修正対象列挙（docs、src、.opencode、traceability sidecars、.agentdev/extensions/skills 配下の yaml）と一致する網羅範囲で全文検索する。歴史的説明（retired、superseded、historical 本文、docs/reports）は検出対象外とし、参照行（See Also 等を含む）は検出対象として、検出された現行参照は反映対象とする（TS-001 と同一の網羅規則）。
    pass_criteria: |
      LLM 利用箇所の全てが開いた問題に限定されており、一般 fallback 経路と新規規範自動確定経路が存在しない。
    on_failure: |
      fix-and-reverify。fallback 経路・自動確定経路を正規契約と実装から除去し、再検索する。
  - id: TS-005
    target_item: AG-005
    verification: |
      未設定、API 失敗、応答不正等の障害系を実際の呼出経路またはそこで使用する判定処理へ与え、(1) 別方式の一般代替推論へ進まないこと、(2) 当該判定に依存する進行・副作用が抑止されること、(3) 依存しない独立処理が停止しないこと、(4) 評価器障害だけを理由とする人間判断移行が発生しないことを確認する。不合格と判定不能の区別が結果の表現に反映されていることを確認する。
    pass_criteria: |
      全ての障害系で (1)〜(4) が成立し、判定不能と不合格の区別が維持される。
    on_failure: |
      fix-and-reverify。障害時契約の実装・正規契約を修正し、実経路で再検証する。
  - id: TS-006
    target_item: AG-006
    verification: |
      復旧後の再評価、入力または規則変更時の旧判定不使用、成功済み副作用の非重複、正常評価時の進行許可を、同じ実経路で確認する。再開前の変更影響確認と、影響しない証拠の再利用が経路に組み込まれていることを確認する。
    pass_criteria: |
      4項目すべてが同一経路で成立する。新しい状態・台帳の追加を前提とせず既存の再開経路で成立している。新規の状態・台帳を追加した場合は、既存経路では成立しない理由の説明が正規文書に記録されている。
    on_failure: |
      fix-and-reverify。再開経路の契約・実装を修正し、再検証する。
  - id: TS-007
    target_item: AG-007
    verification: |
      人間判断へ移行する条件を正規契約全体から一覧化し、各移行が留保事由（新しい目的、価値、優先順位、対象範囲、外部契約、受け入れ条件、恒久規範、規範間優先順位の確定）のみを根拠とすること、評価器障害由来の移行が存在しないことを確認する。委譲された裁量内の具体化が新規規範確定と同一の承認対象に含まれていないこと、文書ごとの再承認・新しい承認ゲートが存在しないことを確認する。
    pass_criteria: |
      人間判断移行条件の全てが留保事由のみを根拠とし、評価器障害由来の移行・裁量具体化への承認要求・新設承認ゲートが存在しない。
    on_failure: |
      fix-and-reverify。移行条件を修正し、再確認する。
  - id: TS-008
    target_item: AG-008
    verification: |
      soft contract を採用する成果物について、存在確認、型、列挙値、ID、参照関係、明示的フィールド等の決定的処理可能部分の機械処理が契約・実装として存在することを確認する。soft contract を LLM 解釈必須の根拠とする記述の残存を、TS-004 と同一の網羅規則で全文検索する。
    pass_criteria: |
      決定的処理可能部分の機械処理が可能であり、LLM 解釈必須根拠・機械処理回避・schema validation 全面禁止を主張する記述が存在しない。
    on_failure: |
      fix-and-reverify。契約・実装を修正し、再検証する。
  - id: TS-009
    target_item: AG-009
    verification: |
      Root Case 確立、Definition 受入、REQ/Decision/Design 保存、execution contract 確定、Standard/Epic 構成、Child Issue 構成、Wave/依存 DAG、実装実行、Verification/QG、merge/close、revise/resume の各責務と正規所有者の対応表を作成し、重複所有、旧工程からの移管漏れ、Guide と正規 Design の不一致を突合と検索で確認する。Wave、意味的依存、実行並列上限、競合情報の概念定義が一意であることを確認する。
    pass_criteria: |
      全責務の正規所有者が一意であり、重複所有・移管漏れ・不一致が存在しない。4概念の正規責務と決定方法が一意である。
    on_failure: |
      fix-and-reverify。責務の正規所有を移管し、参照・消費側を更新して再検証する。
  - id: TS-010
    target_item: AG-010
    verification: |
      作業開始時の基準状態（baseline tag 時点）から現行 REQ/Decision/Design/Guide の評価対象集合を機械的列挙で確定し、処遇（keep、redefine、merge、supersede、retire）の判定記録と照合する。keep 以外の全件について、必要な反映、参照先・消費側の更新、検証期待値の更新の完了を今回限りの記録で確認する。妥当な既存成果と現在も有効な検証証拠の再利用（不要な作り直しの不存在）を確認する。恒久台帳が新設されていないことを確認する。
    pass_criteria: |
      評価対象集合の全件が処遇判定済みであり、未評価の現行規範が残存せず、keep 以外の全件で反映が完了している。恒久台帳が存在しない。
    on_failure: |
      fix-and-reverify。未評価・未反映の対象を処理し、再照合する。
  - id: TS-011
    target_item: AG-011
    verification: |
      統制種別（hard gate、fail-closed、checker、MUST NOT、禁止規則、must_not、adversarial-review、HITL、fallback、duplicated validation、state、ledger、routing、additional schema）ごとに現行の適用箇所を列挙し、各々の正規モデル上の必要性説明の存在を確認する。本変更に伴い追加された中央 router、ledger、新規状態、新規 gate、新規 schema、新規 checker、恒久台帳のそれぞれについて、追加が存在する場合はその必要性説明の記録を確認し、必要性説明のない追加が存在しないことを検索で確認する。
    pass_criteria: |
      全統制適用箇所で必要性説明が存在し、必要性を説明できない統制と、必要性説明を欠く新規統制の追加が存在しない。
    on_failure: |
      fix-and-reverify。統制の除去・縮小を契約と実装へ反映し、再検証する。
  - id: TS-012
    target_item: AG-012
    verification: |
      retired REQ、superseded Decision、historical report、過去の観測記録、過去の release/migration 記録について、baseline tag との差分により、歴史本文の変更が「現在モデルに合わせるためだけの改変」に該当しないことを確認する。歴史的成果物から現在の正規所有者へ到達できる導線（現行契約との識別）を確認する。
    pass_criteria: |
      歴史本文の現代言い換えが存在せず、現行契約との識別性と正規所有者への到達性が確保されている。
    on_failure: |
      fix-and-reverify。歴史本文を原状へ戻し、導線を整備して再検証する。
  - id: TS-013
    target_item: AG-013
    verification: |
      廃止済み command、旧 lifecycle 名、旧成果物名等の旧語彙の使用を、修正対象列挙（docs、src、.opencode、traceability sidecars、.agentdev/extensions/skills 配下の yaml）と一致する網羅範囲で全文検索する。歴史的説明（retired、superseded、historical 本文、docs/reports）は検出対象外とする。参照行（See Also 等を含む）は検出対象であり、現行規範として旧 ID、廃止済み command、廃止済み所有先を指す参照を検出した場合は参照先の更新または参照の除去を反映対象とする。正規所有者と参照元の双方向確認により突合する。現行規範として有効な docs 全体の横断読解で、設計思想・判断責務・ライフサイクル・用語・所有関係について相互矛盾する現在像が得られないことを確認する。
    pass_criteria: |
      旧語彙の現行規範としての使用が 0 件であり、横断読解で相互矛盾する現在像が検出されない。
    on_failure: |
      fix-and-reverify。用語と参照を更新し、索引類（AUTOGEN ブロック）を再生成して再検証する。
  - id: TS-014
    target_item: AG-014
    verification: |
      Command、Workflow Skill、Capability Skill、Script、Tool、Template、Extension、checker 等の実現物が確定した正規モデルと矛盾する責務・判断経路を実装していないことを対応確認する。実 Case 構成等の実運用入力の検査と結果消費の接続を実経路で確認し、静的呼出元の有無、試験内参照モデル、手順文面の存在確認を実経路の成立と区別する。合意入力から正規契約・実行入力・検証義務への投影を照合し、未合意の規範確定および提供能力の削減が行われていないことを確認する。既存 integrity、traceability、test 群のうち正規モデル上有効な検証を実行する。共通原本（src/common）からホスト接続領域（src/opencode、src/senpi）および .opencode 投影への同期の一致を確認する。
    pass_criteria: |
      実現物に矛盾する責務・判断経路が存在せず、実運用入力の検査と結果消費が接続し、有効な既存検証の実行と投影先の同期が完了している。投影照合により、未合意の規範確定と提供能力の削減は検出されない。
    on_failure: |
      fix-and-reverify。実現物と投影を修正し、実経路で再検証する。
  - id: TS-015
    target_item: AG-015
    verification: |
      全処遇判定について keep の理由を照合し、互換維持だけを理由とする keep が存在しないことを確認する。提供能力（OpenCode/Senpi、GitHub/ローカル Issue 等）の維持出発点の扱いと、能力廃止案の個別人間判断への戻しを確認する。再収束後の正規文書群から v4 の目的と中核（要件に基づく継続的な開発という目的、要求・判断権限・永続状態・実行安全・証拠連鎖の意味上の性質）の維持を説明できることを確認する。中核放棄が判明した場合の停止と別判断事項化の扱いが正規契約どおりであることを確認する。
    pass_criteria: |
      互換維持だけを理由とする keep が存在せず、能力維持の扱いが正しく、中核の維持が正規文書から説明できる。停止条件の扱いが正規契約どおりである。
    on_failure: |
      fix-and-reverify。処遇と正規契約を修正し、再検証する。中核放棄の判明は停止条件に該当するため完了報告を行わない。
  - id: TS-016
    target_item: AG-016
    verification: |
      baseline tag（baseline-v4-canonical-convergence-20261007）が存在し、release version と混同されない非 SemVer 名であること、指す commit（72e04cadc4ff8fa00b6f484f421975c99a75b449）が作業前の main の静止点であること、既存 release tag の移動・再利用が行われていないことを確認する。再収束後の状態から当該 tag を用いた差分比較が一意に実行できることを確認する。
    pass_criteria: |
      tag の存在、指す先、非移動が確認され、baseline tag を用いた before/after の差分比較が一意に成立する。
    on_failure: |
      fix-and-reverify。tag の不備を修正の上 再検証する。ただし既存 tag の移動は行わず、新規 tag 付与の要否は人間判断へ戻す。
  - id: TS-017
    target_item: AG-017
    verification: |
      最終検証として AC-01 から AC-25 までを pass、fail、blocked、not applicable で個別判定し、判定記録（今回限り）を作成する。判定は REQ 本文の受け入れ条件対応節の定義所在と検証義務に従い、各判定から根拠証拠へ到達できることを確認する（covered の自己宣言、AC 番号の言及のみ、工程終了の記録を証拠として扱わない）。各判定について、証拠の対象・鮮度・命題対応（現在の契約・対象成果物・評価範囲に有効であること）を確認する。not applicable 判定には適用されない根拠の説明があることを確認する。無関係な改善、新しい研究、継続的再評価能力の整備が完了条件に追加されていないことを確認する。
    pass_criteria: |
      AC-01 から AC-25 まで全てに個別判定があり、fail と blocked が 0 件であり、not applicable の全てに根拠説明がある。完了条件への無関係な追加が存在しない。
    on_failure: |
      fix-and-reverify。fail または blocked の残存個所を修正・完遂して再判定する。範囲外の発見の別課題記録は record-in-findings 扱いとし、本要件の完了判定に含めない。

realization_actions:
  - id: RA-001
    concern: 判断経路・意味評価統合の実装面（Jev 逐次経路、agentdev_jev 呼出、閉じた意味評価の障害時契約の実装）
    responsibility: |
      正規モデル確定後、6系統 Workflow（learning-promote、req-define、case-ready、intake-promote、inspect-promote、backlog-review）の Jev 逐次経路の実装記述、Custom Tool agentdev_jev の呼出側契約、および閉じた意味評価の必要性・適格性説明を、確定した判断アーキテクチャ（決定的処理第一、閉じた意味評価の適格性条件、LLM fallback 禁止、評価器障害時の判定未確定と依存後続抑止、復旧後の正規再開経路）へ再整合させる。DEC-044 決定3 の意味変更は実行時に後継 Decision（部分置換）で行い、accepted Decision の静かな直接編集を行わない。
    ownership_hints:
      - "src/common/skills/agentdev-workflow-req-define/references/requirement-development.md（Jev 逐次経路・API 失敗時 fallback 記述）"
      - "6系統 Workflow Skill の references 配下の Jev 逐次経路記述"
      - "src/common/tools/agentdev-jev/"
      - "docs/designs/responsibilities/custom-tool-contracts.md「Jev 先行評価」節"
      - "docs/decisions/DEC-044.md 決定3（後継 Decision による部分置換対象）"
    intent: |
      決定的に処理できる判断を LLM 推論・閉じた意味評価へ二重に委ねる経路、評価器障害時の代替推論経路、必要性説明を欠く閉じた意味評価を、正規モデルから導出される判断契約へ置換する。観測保存の fail-open（DEC-044 決定6）は保存処理の契約であり、評価成立の停止契約とは適用対象が異なるため混同しない。
    verification_refs: [TS-002, TS-003, TS-004, TS-005, TS-006]
    source_items: [AG-002, AG-003, AG-004, AG-005, AG-006]
  - id: RA-002
    concern: ライフサイクル責務の実装面（case-open、case-ready、case-run、case-close、case-revise の責務記述と Guide）
    responsibility: |
      正規モデル確定後、内部 lifecycle 各段階の Workflow Skill、command 業務契約、利用者向け Guide の責務記述を、再確定された単一所有の責務構造（Root Case 確立、Definition 受入、保存、execution contract 確定、構成、実行、検証、merge/close、revise/resume）へ整合させる。旧責務の移管漏れと Guide と正規 Design の不一致を残さない。
    ownership_hints:
      - "src/common/skills/agentdev-workflow-case-open/、agentdev-workflow-case-ready/、agentdev-workflow-case-run/、agentdev-workflow-case-close/、agentdev-workflow-case-revise/"
      - "src/common/commands/agentdev/case-auto.md ほか各 command 業務契約"
      - "docs/guides/req-case-flow.md"
      - "src/common/skills/agentdev-workflow-case-ready/references/execution-structure.md"
      - "docs/designs/workflows/v4-standard-lifecycle.md"
    intent: |
      同一責務の複数工程所有、旧語彙、旧工程説明を、正規モデルの責務割当へ収束させる。
    verification_refs: [TS-009, TS-013]
    source_items: [AG-009, AG-013]
  - id: RA-003
    concern: 統制・検査実装面（guards、checkers、scripts、QG、fail-closed、HITL、adversarial-review）
    responsibility: |
      正規モデル確定後、現行の hard gate、fail-closed、checker、禁止規則、must_not、adversarial-review、HITL、fallback、duplicated validation、state、ledger、routing、additional schema の適用箇所ごとに必要性を監査し、説明できない統制の除去・縮小を契約と実装の両面へ反映する。統制追加の前に、責務削減、契約縮小、重複除去、決定的導出、所有者統合、不要経路廃止での解消を優先する。本変更の実現のためだけの新規統制（中央 router、ledger、新規状態、新規 gate、新規 schema、新規 checker）を追加しない。
    ownership_hints:
      - "src/common/guards/"
      - "scripts/self/、scripts/consumer/ 配下の checker・検証系 script（実行入口 scripts/engine.ts、scripts/index.ts）"
      - "src/common/skills/agentdev-quality-gates/"
      - "src/common/skills/agentdev-adversarial-review/"
      - "docs/designs/integrity/ 配下、docs/designs/quality/ 配下"
    intent: |
      統制自体の維持が目的化した箇所を、必要な安全境界のみへ縮小する。
    verification_refs: [TS-011, TS-014]
    source_items: [AG-011, AG-014]
  - id: RA-004
    concern: 語彙・配布物・マルチホスト投影の実装面
    responsibility: |
      廃止済み command・旧語彙の現行規範からの除去を配布物（command、skill、template、script、guard）へ反映し、共通原本（src/common）からホスト接続領域（src/opencode、src/senpi）および .opencode 投影への同期を完了する。README 索引等の AUTOGEN ブロックを再生成する。
    ownership_hints:
      - "src/opencode/、src/senpi/、.opencode/"
      - "docs/requirements/README.md、docs/decisions/README.md（AUTOGEN ブロック）"
      - "docs/designs/authoring/vocabulary-registry.md"
      - "docs/designs/integrity/index-auto-generation.md"
    intent: |
      正規モデルと矛盾する語彙・構造が配布物と投影先に残存しないようにする。
    verification_refs: [TS-013, TS-014]
    source_items: [AG-013, AG-014]
  - id: RA-005
    concern: トレーサビリティ・参照整合の実装面（処遇反映時の参照残存と宣言整合）
    responsibility: |
      keep、redefine、merge、supersede、retire の反映実行時、廃止・移管対象の旧 ID を指す参照の残存を機械的検索（docs、src、.opencode、traceability sidecars、.agentdev/extensions/skills 配下の yaml の網羅。歴史的説明（retired、superseded、historical 本文、docs/reports）は検出対象外とし、参照行は検出対象とする）で確認し、正規所有者と参照元の双方向確認により突合し、inline ADF-COVERS 宣言と sidecar の関係宣言集合の一致を保つ。既存 integrity、traceability、test 群のうち正規モデル上有効な検証を実行する。
    ownership_hints:
      - "traceability/ 配下 sidecar"
      - ".agentdev/extensions/skills/ 配下 yaml"
      - "src/common/skills/agentdev-traceability/"
      - "docs/designs/foundations/v4-traceability-model.md"
      - "docs/designs/responsibilities/artifact-contracts.md（宣言集合一致の検証契約）"
    intent: |
      処遇反映に伴う参照断絶・宣言不一致を検出・解消し、入力忠実性（合意の正規契約・実行入力・検証義務への投影保持）を実経路で成立させる。
    verification_refs: [TS-010, TS-013, TS-014]
    source_items: [AG-010, AG-012, AG-013, AG-014]

review_dispositions:
  - id: RD-001
    source_ru: RU-0181
    source_item: RU-0181
    disposition: covered
    reason_code: fully_projected
    reason: |
      RU-0181 の合意事項（Source Summary、要件化の方向 A〜K）と決定的受け入れ条件 AC-01〜AC-26 が、AG-001〜AG-017、REQ 要件行（REQ-{NNN}-001〜031）と受け入れ条件対応節（AC 番号の定義所在を REQ 本文が所有し、RU/draft 消費後も AC-01〜AC-26 の意味と判定義務を一意に再構成できる）、test_strategy（TS-001〜TS-017）、realization_actions（RA-001〜RA-005）へ投影済みである。既存 REQ/Decision/Design の個別処遇は RU 合意（正規モデル確定後に確定）に従い本 draft では確定しない。AC 対応: AC-01→AG-001、AC-02→AG-010、AC-03/04→AG-002、AC-05/06→AG-003、AC-07→AG-004、AC-08/09→AG-005、AC-10→AG-006、AC-11→AG-005/AG-007、AC-12→AG-008、AC-13/14→AG-009、AC-15→AG-013、AC-16/17→AG-011、AC-18/19→AG-012、AC-20→AG-013、AC-21→AG-014、AC-22/23→AG-015、AC-24/25→AG-016、AC-26→AG-017。
    evidence:
      path: .agentdev/backlog/req-units/RU-0181.md
      section: 決定的受け入れ条件
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: true
  decomposition: |
    段階1（直列）: 正規モデルの再確定（AG-001〜AG-004 の正規文書化。未合意の新規規範・規範間優先順位が必要になった時点で人間判断へ移行し、依存する下流の確定・変更を開始しない）。
    段階2（並列化可能な領域別反映）: 判断経路・意味評価統合（RA-001）、ライフサイクル責務（RA-002）、統制・検査（RA-003）、語彙・配布物・投影（RA-004）、トレーサビリティ・参照整合（RA-005）を独立性に従って並列化する。
    段階3（直列）: 横断整合・実経路検証・最終判定（AC-01〜AC-25 の個別判定と AC-26 の判定規則の適用）。
    後継 Decision 候補（正規モデル確定後に処遇確定）: DEC-044 決定3（評価器失敗時の継続方式の意味変更。後継 Decision による部分置換が必須）。照合候補: DEC-003（soft contract 原則と AG-008 の整合）、DEC-048（大部分整合のため keep または軽微更新が有力）。REQ-045、REQ-088、REQ-096 等は AG-010 の全面再評価の対象。
    調整方針: 生成主体（session-supervisor）の取り扱いは Hermes 側の責務であり、ADF で別件正規化する並行作業は存在しない（ユーザーの最新指示により取り下げ）。本要件の全面再評価（AG-010）は REQ-008-051 および artifact-contracts を評価対象として含み、元 RU の目的・判断境界に従い評価する。評価で生成主体契約の変更が必要と判定された場合は人間判断境界（AG-007）に従う。実施開始時の並行変更の再確認と取り込み時の差分照合は RU-0181 依存関係節の一般条項として維持する。競合を理由として独立した領域の並列化を一律に禁止しない。
  wave_hints:
    - "Wave 1: 正規モデル再確定（AG-001〜AG-004。直列）"
    - "Wave 2: 領域別反映（RA-001〜RA-005 を独立性に従い並列）"
    - "Wave 3: 横断整合・実経路検証・最終判定（AG-017。AC-01〜AC-25 の個別判定と AC-26 の判定規則の適用）"
```

# summary

RU-0181（ADF v4 の正規モデル再確定と現行規範の全面収束）を単一の新規REQ（maintenance、scale: large、Epic 構成候補）として要件化した。
合意済みの判断アーキテクチャ（決定的処理第一・閉じた意味評価の適格性・開いた LLM 推論の限定・評価器障害時の LLM fallback 禁止と依存後続抑止・再開経路）、soft contract 再定義、ライフサイクル責務の単一所有、全面再評価と反映完了、過剰統制の除去、歴史保全、docs 全体整合・実現物整合・入力忠実性、v4 境界、baseline tag、有限完了を 31 の状態要件行に構造化し、17 の検証義務と 5 領域の実現面変更方針を対応させた。
既存 REQ/Decision/Design の個別処遇（keep/redefine/merge/supersede/retire）は RU-0181 の合意どおり正規モデル確定後に確定するため本 draft では判定しない。DEC-044 決定3 との矛盾は正規モデル確定後の後継 Decision による部分置換で解消する方針を conflict_resolutions に記録した。生成主体（session-supervisor）の別件正規化は、ユーザーの最新指示による取り下げを受けて対象外に明記し、全面再評価の評価対象から REQ-008-051 と artifact-contracts を除外していない。
