---
draft_type: req_draft
topic_slug: scripts-public-entry-boundary
status: saved
created_at: "2026-08-23T21:40:00+09:00"
source_rus:
  - RU-0001
---

# draft-data

```yaml
# work_type: 要件の分類（bugfix / feature / maintenance / docs_chore）
work_type: feature

# scale: feature のみ standard / large
scale: large

# summary: 当該 draft が何を合意したかの1段落要約
summary: >
  scripts/ 直下の通常利用者向け公開入口を scripts/install.ps1（consumer 向け）と
  scripts/self-sync.ps1（self-hosting 向け）の2本に限定し、旧公開入口3本
  （install-consumer-opencode.ps1、check-consumer-opencode.ps1、sync-self-opencode.ps1）を
  互換ラッパーなしで廃止する。install.ps1 は apply / check / dry-run の3モードを提供し、
  check は旧状態確認専用スクリプトの検査能力（orphan 検出を含む）を包含する。
  両入口は対象環境を機械判定して誤実行を変更前に停止・案内する。内部処理は
  scripts/consumer/ と scripts/self/ へ配置する。archive 専用 installer は原本分離のうえ
  archive 内では scripts/install.ps1 の公開名で配置し、checkout 版と別 installation projection
  として扱う。配布 manifest、trust root / protected path、配布境界検査、テスト、現役文書参照を
  同一変更単位で更新し、公開入口の実行依存集合の配布完全性を保証する。公開入口の2本固定と
  入口名の安定契約は新規 Decision として記録する。既存原則（provisioning/network access
  副作用ゼロ、apply 冪等性、-LocalMode / -PluginDir、#Requires + comment-based help、
  ZIP 許容）はすべて維持する。

# auto_gate: case-auto 自走可否の判定材料
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

# agreed_items: 合意された個別項目
agreed_items:
  - id: AG-001
    content: >
      scripts/ 直下の通常利用者向け公開スクリプトは、consumer 向けの scripts/install.ps1 と
      self-hosting 向けの scripts/self-sync.ps1 の2本に限定する。公開入口名に opencode を
      含めない（適用範囲は scripts/ 直下の公開入口名に限定し、.opencode/ や src/opencode/ 等の
      既存正規パスには適用しない）。release 生成、信頼境界検証、self-hosting 保守処理、
      単体実行しない内部共通処理を scripts/ 直下に配置しない。consumer 専用内部処理は
      scripts/consumer/ 配下、self-hosting 固有の配布・検証・保守処理は scripts/self/ 配下
      （release 生成・検証は scripts/self/release/、保守は scripts/self/maintenance/）へ配置する。
      具体的な内部ファイル分割は、公開契約と依存境界を変えない範囲で実装時に調整できる。
  - id: AG-002
    content: >
      scripts/install.ps1 を AgentDevFlow consumer 向けの唯一の通常公開入口とし、apply
      （導入または再同期の実行）、check（導入状態の検査）、dry-run（変更内容の予測、変更なし）
      の3モードを提供する。check は旧状態確認専用スクリプトが提供していた検査能力を包含し、
      orphan 検出等の既存検出能力を欠落させない。check と dry-run は consumer の管理対象
      ファイルを変更しない。apply は既存の冪等性を維持する。-LocalMode、-PluginDir 等の
      現行有効な consumer 向け公開オプションを継承する。引数なし起動時の対話ウィザード
      （REQ-009-040）、cwd 安全化（REQ-009-041）、ヘルプ仕様（REQ-009-042/043）は
      新入口にもそのまま適用する。
  - id: AG-003
    content: >
      scripts/self-sync.ps1 を AgentDevFlow 本体リポジトリ専用の通常公開入口とし、apply、
      check、dry-run の3モードを提供する。責務は AgentDevFlow 本体の原本と実行時配置先の
      同期、乖離確認、変更予測とする。check と dry-run は同期対象を変更しない。
  - id: AG-004
    content: >
      誤実行防止として、両公開入口は実行対象環境を機械的に判定する。install.ps1 は
      AgentDevFlow 本体リポジトリを consumer として変更せず、self-sync.ps1 は consumer
      リポジトリで self-hosting 同期を実行しない。誤った環境では変更前に停止し、
      利用者へ適切な公開入口を案内する。環境判定の判定材料・手順の詳細は Design
      （runtime-package-boundary）が所有する。
  - id: AG-005
    content: >
      旧公開入口3本（scripts/install-consumer-opencode.ps1、scripts/check-consumer-opencode.ps1、
      scripts/sync-self-opencode.ps1）を廃止する。旧名を維持する互換ラッパーを scripts/ 直下に
      設けない。現行の README、Guide、REQ、Design、Decision、実行手順、検証処理、manifest、
      テストに残る旧3入口への現役参照は、新しい入口または内部配置へ更新する。歴史記録として
      旧名称を記録する文書（廃止済み Decision 等）は、現行入口として誤認されない限り
      削除対象としない。
  - id: AG-006
    content: >
      repository 上で archive 専用 installer の原本は通常 consumer installer と分離して保持する
      （基本配置 scripts/consumer/archive/install.ps1）。release archive 内では consumer が実行する
      公開入口として scripts/install.ps1 の名で配置する。通常 checkout 版の scripts/install.ps1 と
      release archive 版の scripts/install.ps1 は同一ファイルである必要はなく、異なる
      installation projection として扱い、それぞれの導入方式の契約を維持する。両版を
      同一実装へ無理に統合しない。
  - id: AG-007
    content: >
      スクリプト再配置に伴い、旧固定パスを参照する配布 manifest、protected path / trust root、
      release archive 構成、配布境界検査、archive-installed 検査、関連テスト、その他スクリプト
      パスを契約として保持する検証処理を新構造へ同期する。公開入口のみを列挙して終えず、
      公開入口が実行時に必要とする内部スクリプト、モジュール、設定等を含む実行依存集合に
      ついて、欠落や未検証状態が生じないことを保証する。trust root / protected path は
      移動後の旧パスだけを保護する状態にしない。trust root / manifest の検証は
      projection スコープで実施し、checkout 版と archive 版の同名 scripts/install.ps1 を
      区別して扱う。
  - id: AG-008
    content: >
      既存原則を維持する。install.ps1 は provisioning（git clone、git fetch、git reset 等の
      チェックアウト取得・更新）を行わず、network access を行わない（REQ-009-046、DEC-016
      を継承）。checkout の取得・更新は引き続き利用者の責務とする。apply の既存冪等性、
      安全な cwd 検査、#Requires ディレクティブと comment-based help の両立（Get-Help 対応）、
      git clone checkout と source ZIP checkout の双方での consumer 導入契約維持も維持する。
  - id: AG-009
    content: >
      REQ-009 を次のとおり更新する。REQ-009-002 は、同一リポジトリ内の同期と導入先への
      インストールの別手段分離の原則を維持しつつ、scripts/ の公開入口境界が REQ-050 に
      移管されたことを示す交叉参照へ更新する。REQ-009-044 は、運用スクリプト名列挙
      （install.ps1、check.ps1、sync-self.ps1）を scripts/install.ps1 と scripts/self-sync.ps1
      の2本へ縮約し、旧状態確認専用スクリプトが install.ps1 -Mode check へ統合されたことを
      付記する。
  - id: AG-010
    content: >
      公開入口の境界モデルを新規 Decision「scripts 公開入口の2本固定と安定契約」として
      記録する。Decision が記録するのは次の3項に限定する: (1) scripts/ 直下の通常利用者向け
      公開入口は consumer 用・self-hosting 用の2本に限定する構造原則、(2) 公開入口名は
      利用者が固定参照する安定契約であり、改名・追加は後継 Decision を必要とする、
      (3) 内部処理、配布生成、検証、保守処理を scripts/ 直下の公開入口としない。
      モード群（apply/check/dry-run）、誤実行防止の機構、命名細則（opencode 禁止）は
      Decision に含めず REQ-050 が所有する。DEC-016（副作用ゼロ原則、accepted）は
      拡張せず、後継 Decision による置換も行わない（軸が異なる: DEC-016 は振る舞い原則、
      新 Decision は構造境界）。
  - id: AG-011
    content: >
      DEC-016（status: accepted）の決定1に列挙された旧スクリプト名
      （install-consumer-opencode.ps1、check-consumer-opencode.ps1）を新入口名
      （scripts/install.ps1、scripts/self-sync.ps1）へ置き換える。本更新は決定内容
      （副作用ゼロ）を変えない誤ったファイルパス修正（非意味修正）であり、
      明示承認記録（2026-08-23 req-define 壁打ちにおけるユーザー承認）に基づき、
      スクリプト改名と同一変更単位でインプレース更新する。frontmatter の updated を
      更新する。あわせて docs/README.md の Decision 表に残る DEC-016「（proposed）」の
      陳腐化注記を actual status（accepted）へ修正する。
  - id: AG-012
    content: >
      Design 3件を更新する。(a) runtime-package-boundary Design: 公開入口2本と内部配置
      （scripts/consumer/、scripts/self/）の構成、誤実行防止の環境判定方式（判定材料・手順）
      を記述する。(b) install-script-usability Design: モード別動作詳細、install.ps1
      -Mode check 統合後の検査項目カタログ（旧 check-consumer-opencode.ps1 の検査能力の
      継承一覧、orphan 検出を含む）、誤実行停止時の案内メッセージを記述する。
      (c) distribution-boundary Design: 安定実装契約のパス追従（package-release-archive.ps1
      の移動先）と、旧 check-consumer-opencode.ps1 への責務追加禁止の拘束を一般化表現
      「consumer 向け公開入口へ新たな責務を追加しない」へ書き換える。配布依存境界の
      意味モデル自体は変更しない。

# artifact_actions: REQ/Decision/Design への保存対象
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: create
    target: REQ-050
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007, AG-008]
    content: |
      ## 目的

      AgentDevFlow の scripts/ 公開入口の境界モデルを所有する。
      consumer と self-hosting の2系統の安定した公開入口、そのモード構成と能力継承、誤実行防止、
      旧入口の廃止、内部配置の境界、release archive における公開名と projection の扱い、
      配布 manifest・trust root の追従、公開入口の実行依存集合の配布完全性を定義する。
      配布・導入の一般モデルは REQ-009 が所有し、本 REQ は公開入口の境界契約を所有する。
      配布依存境界の意味モデルは REQ-029 が所有し、本 REQ はその追従を要求する。

      ## 要件

      | ID | 要件 |
      |---|---|
      | REQ-050-001 | scripts/ 直下の通常利用者向け公開入口は、consumer 向けの scripts/install.ps1 と self-hosting 向けの scripts/self-sync.ps1 の2本に限定すること |
      | REQ-050-002 | scripts/install.ps1 は apply、check、dry-run の3モードを提供すること |
      | REQ-050-003 | scripts/self-sync.ps1 は apply、check、dry-run の3モードを提供すること |
      | REQ-050-004 | scripts/install.ps1 -Mode check は、旧状態確認専用スクリプト（scripts/check-consumer-opencode.ps1）が提供していた検査能力（orphan 検出を含む）を包含すること |
      | REQ-050-005 | scripts/install.ps1 -Mode check と -Mode dry-run は consumer の管理対象ファイルを変更しないこと。scripts/self-sync.ps1 -Mode check と -Mode dry-run は同期対象を変更しないこと |
      | REQ-050-006 | 両公開入口は実行対象環境を機械的に判定し、誤った環境では変更前に停止して適切な公開入口を案内すること。scripts/install.ps1 は AgentDevFlow 本体リポジトリを consumer として変更せず、scripts/self-sync.ps1 は consumer リポジトリで self-hosting 同期を実行しないこと |
      | REQ-050-007 | scripts/ 直下の公開入口名に opencode を含めないこと（本要件の適用範囲は scripts/ 直下の公開入口名に限定する） |
      | REQ-050-008 | 旧公開入口（scripts/install-consumer-opencode.ps1、scripts/check-consumer-opencode.ps1、scripts/sync-self-opencode.ps1）を廃止し、旧公開入口名の互換ラッパーを scripts/ 直下に設けないこと |
      | REQ-050-009 | 単体実行を前提としない内部処理を scripts/ 直下に配置しないこと。consumer 専用の内部処理は scripts/consumer/ 配下に、self-hosting 固有の配布・検証・保守処理は scripts/self/ 配下に配置すること |
      | REQ-050-010 | archive 専用 installer の原本は通常 consumer installer と分離して保持すること。release archive 内では consumer が実行する公開入口として scripts/install.ps1 の名で配置し、通常 checkout 版と release archive 版を異なる installation projection として扱い、同一実装への強制統合を行わないこと |
      | REQ-050-011 | 公開入口とその実行依存集合（内部スクリプト、モジュール、設定等）を配布 manifest の対象として完全に表現すること。依存を欠落させた配布成果物を正常な配布成果物として扱わないこと |
      | REQ-050-012 | trust root / protected path は新しい信頼対象パスを保護すること。移動後の旧パスのみを保護する状態にしないこと |
      | REQ-050-013 | scripts/install.ps1 は provisioning（clone、fetch、reset 等のチェックアウト取得・更新）を行わず、network access を行わないこと（REQ-009-046、DEC-016 を継承する） |
      | REQ-050-014 | 現行の README、Guide、REQ、Design、Decision、実行手順から、旧公開入口3本を現行手順として参照する記述を除去または更新すること。歴史的説明を除き、旧公開入口名を利用者へ実行させる現役導線を残さないこと |

      ## 適用範囲

      - **対象**: scripts/ 直下の公開入口境界と2本の公開入口（モード構成、能力継承、非破壊保証、誤実行防止、命名方針）、旧入口の廃止と互換ラッパー不設置、内部配置の境界（要約レベル）、archive 内公開名と installation projection の区別、配布 manifest・trust root / protected path の追従、実行依存集合の配布完全性、現役参照の更新
      - **対象外**: モード別の動作詳細、検査項目カタログ、環境判定の判定材料・手順、案内メッセージ（Design: runtime-package-boundary、install-script-usability）。配布依存境界の意味モデル自体（REQ-029）。配布・導入の一般モデル、provisioning と install の責務分離、リポジトリ種別、対話ウィザード、cwd 安全化、ヘルプ仕様、ZIP 許容、更新責務（REQ-009）。導入系スクリプトの副作用ゼロ原則（DEC-016、REQ-009-046）。.opencode/ の実行時パッケージ構造の再設計、リポジトリ種別体系の変更、npm/package 配布方式の新設、release archive と link mode の統合、AgentDevFlow の command / skill 自体の公開インターフェース変更、本変更と無関係な scripts 内部実装のリファクタリング、歴史資料に記録された旧スクリプト名の機械的削除

  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: docs/requirements/REQ-009.md
    source_items: [AG-009]
    content: |
      REQ-009 の次の2要件行を更新する（他行は無変更）。

      対象1: REQ-009-002
      現行: 「同一リポジトリ内の同期と導入先へのインストールは別手段として分離し、scripts/ 配下に配置すること」
      更新後: 「同一リポジトリ内の同期と導入先へのインストールは別手段として分離すること。scripts/ 直下の公開入口の境界（2本限定、モード、誤実行防止）は REQ-050 が所有する」

      対象2: REQ-009-044
      現行: 「運用スクリプト（install.ps1、check.ps1、sync-self.ps1）は #Requires ディレクティブと comment-based help 解析を両立すること」
      更新後: 「運用スクリプト（scripts/install.ps1、scripts/self-sync.ps1）は #Requires ディレクティブと comment-based help 解析を両立すること（旧状態確認専用スクリプトは scripts/install.ps1 -Mode check へ統合済み）」

      更新に伴い REQ-009 の frontmatter `updated` を更新する。

  - id: ACT-DEC-001
    artifact: decision
    operation: create
    target: DEC-021
    source_items: [AG-010]
    content: |
      タイトル案: scripts 公開入口の2本固定と安定契約

      ## 決定内容（案）

      1. scripts/ 直下の通常利用者向け公開入口は、consumer 用（scripts/install.ps1）と
         self-hosting 用（scripts/self-sync.ps1）の2本に限定する。
      2. 公開入口名は利用者が導入手順・運用文書で固定参照する安定契約であり、
         公開入口の改名・追加は後継 Decision を必要とする。
      3. 内部処理、配布生成、検証、保守処理を scripts/ 直下の公開入口としない。

      ## 背景（案）

      AgentDevFlow の scripts/ 直下には、利用者が直接実行するスクリプト、内部共通処理、
      配布成果物生成、信頼境界検証、保守処理が混在し、公開入口名に実装・利用形態上の
      情報（consumer、opencode）が入っていた。利用者が scripts/ のファイル名から実行対象を
      判断しなければならない状態を解消するため、公開インターフェース境界を再定義した
      （REQ-050）。境界の構造原則と入口名の安定性は、将来の入口増加・改名提案を恒久的に
      拘束する長寿命の制約であるため、Decision として記録する。

      ## 代替案（案）

      REQ-050 と Design のみで足りるとする案（アーキテクチャ助言の反対解釈も論理的に成立）を
      採らない。理由は DEC-016 の作成経緯と同型である: 将来の公開入口追加・改名の提案を
      REQ/Design レベルの変更だけで通さず、Decision レベルの再審を強制することで境界の
      安定性を担保する。モード群、誤実行防止の機構、命名細則（opencode 禁止）は
      Decision の主題から除外し REQ-050 が所有する（Decision 禁止条件: 命名規約、
      動作仕様、運用ルール）。

      ## 関係（案）

      - relates-to: DEC-016（導入系スクリプトの副作用ゼロ原則。振る舞い原則と構造境界で軸が異なり、相互に置換しない）
      - relates-to: DEC-014（配布依存境界の多層 enforcement。公開入口の依存集合完全性は REQ-029/DEC-014 の枠組みを利用する）

  - id: ACT-DEC-002
    artifact: decision
    operation: update
    target: docs/decisions/DEC-016.md
    source_items: [AG-011]
    content: |
      DEC-016（status: accepted）への非意味修正（誤ったファイルパス修正）。

      対象: 決定1に列挙された旧スクリプト名「install-consumer-opencode.ps1、
      check-consumer-opencode.ps1」を「scripts/install.ps1、scripts/self-sync.ps1」へ置換する。
      決定内容（導入系スクリプトの副作用ゼロ原則）は変更しない。

      実行条件:
      - 明示承認記録: 2026-08-23 req-define 壁打ちにおけるユーザー承認（本 draft の
        AG-011 と conflict_resolutions CR-003 が記録）。
      - 実施タイミング: スクリプト改名と同一変更単位（参照先が存在しない期間を残さない）。
      - frontmatter `updated` を更新する。フォローアップ注記は追加しない
        （非意味修正の直接更新が承認済みのため）。

      あわせて docs/README.md の Decision 表における DEC-016 の「（proposed）」注記を
      actual status（accepted）へ修正する（陳腐化注記の解消。DEC-016.md frontmatter と
      decisions/README.md autogen が accepted を示しており、docs/README.md 表のみ旧表記）。

  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: local
      slug: runtime-package-boundary
    target_area: リポジトリ種別別同期スクリプト範囲（Sync Script Scope）
    source_items: [AG-001, AG-004, AG-006]
    content: |
      runtime-package-boundary Design のスクリプト再編に伴う更新。対象セクションと更新内容:

      1. 「リポジトリ種別別同期スクリプト範囲（Sync Script Scope）」「本体リポジトリでの同期」
         「Consumer での同期」: 旧スクリプト名（install-consumer-opencode.ps1、
         check-consumer-opencode.ps1、sync-self-opencode.ps1）の参照を新公開入口
         （scripts/install.ps1、scripts/self-sync.ps1）とモード構成へ更新する。
      2. 新規セクション「scripts 公開入口と内部配置」を設け、次を記述する:
         公開入口2本（install.ps1、self-sync.ps1）の位置づけ、内部配置構成
         （scripts/consumer/、scripts/consumer/archive/、scripts/self/release/、
         scripts/self/maintenance/）、公開契約と依存境界を変えない範囲での内部ファイル
         分割の調整許容。
      3. 新規セクション「誤実行防止の環境判定方式」を設け、次を記述する:
         対象環境の機械判定に使う判定材料と手順（install.ps1 が AgentDevFlow 本体
         リポジトリを検出する条件、self-sync.ps1 が consumer リポジトリを検出する条件）、
         変更前停止の条件、適切な入口への案内。REQ-009-041（cwd 安全化）との責務境界
         （041 は実行ディレクトリの想定外検知、本判定はリポジトリ種別の誤り検知）。
      4. 「link mode 接続手順技術詳細」配下の旧スクリプト名参照セクション
         （install-consumer-opencode.ps1 -LocalMode の入出力契約、check-consumer-opencode.ps1
         の local mode リンク状態検出条件）を新入口名・モード構成へ更新する
         （-LocalMode の入出力契約自体は継承）。
      5. archive 専用 installer 原本（scripts/consumer/archive/install.ps1）と
         release archive 内投影（scripts/install.ps1）の別 projection 扱いを記述する。

  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: local
      slug: install-script-usability
    target_area: dry-run/check/apply の技術的差
    source_items: [AG-002, AG-004, AG-012]
    content: |
      install-script-usability Design の公開入口統合に伴う更新。対象セクションと更新内容:

      1. 「対話ウィザード」配下の各スクリプト節（install-consumer-opencode.ps1、
         sync-self-opencode.ps1、check-consumer-opencode.ps1）を新公開入口
         （scripts/install.ps1、scripts/self-sync.ps1）の節へ再構成する。
         check-consumer-opencode.ps1 節は install.ps1 -Mode check 統合に伴い削除し、
         統合後のウィザード導線を記述する（REQ-009-040 の適用）。
      2. 「dry-run/check/apply の技術的差」を2本の新入口のモード構成へ更新する。
      3. 新規セクション「install.ps1 -Mode check の検査カタログ」を設け、旧
         check-consumer-opencode.ps1 が提供していた検査能力の継承一覧を記述する
         （orphan 検出、リンク切れ・配置先リンク先不整合検出を含む。能力の欠落がない
         ことを確認可能な形式）。install -Mode check が旧来含めなかった orphan 検出を
         統合により新たに含めることを明記する。
      4. 「cwd 安全化」は REQ-009-041 の一般原則として維持し、誤実行防止（リポジトリ種別
         判定）の案内メッセージ形式を本 Design に記述する（runtime-package-boundary の
         判定方式と対応させる）。
      5. 「上級者向けオプション」配下の各スクリプト節を新入口のオプション参照へ更新する
         （-LocalMode、-PluginDir の継承）。
      6. 「#Requires と comment-based help の両立」は契約を維持し、対象スクリプト列挙を
         新2入口へ更新する（REQ-009-044 の更新に対応）。

  - id: ACT-DESIGN-003
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: integrity
      slug: distribution-boundary
    target_area: 安定実装契約
    source_items: [AG-007, AG-012]
    content: |
      distribution-boundary Design のスクリプト再編に伴う更新。意味モデル（producer と
      distribution、対象モデル、パイプライン、projection の分離）は変更しない。

      対象セクションと更新内容:

      1. 「安定実装契約」: archive 公開前検査の呼び出し点に挙げられている
         scripts/package-release-archive.ps1 のパスを移動先
         scripts/self/release/package-release-archive.ps1 へ更新する。
      2. 「安定実装契約」: 「archive-installed 検証の配置」における
         「check-consumer-opencode.ps1 へ新たな責務を追加しない」の拘束を、一般化表現
         「consumer 向け公開入口（scripts/install.ps1）へ新たな責務を追加しない」へ
         書き換える。archive-installed 検証は consumer 向け公開入口を利用しない別経路の
         ままであることを明記する（特定入口名への再刻印を避け、将来の入口再編で
         再度陳腐化しない表現とする）。
      3. スクリプトパスを契約として保持する検証処理・テストの参照を新構造へ追従させる
         （trust root / protected path の保護対象パス、配布 manifest の対象パス）。
         公開入口の実行依存集合（scripts/consumer/common.ps1 等）が配布 manifest 対象に
         完全に含まれることを検証対象とする。
      4. projection の分離: checkout 版 scripts/install.ps1 と release archive 版
         scripts/install.ps1 の同名併存について、trust root / manifest の検証が
         projection スコープで両者を区別して扱うことを明記する。

# conflict_resolutions: 壁打ちで解消された衝突の記録
conflict_resolutions:
  - id: CR-001
    conflict: RU-0001 を REQ-009 へ APPENDすると REQ-009 の SPLIT シグナルが合計3（SPLIT 強く推奨域）に悪化する（要件行数 51 超え + 関心分類 +1 + アーティファクト種別 +1）。
    resolution: SPLIT 選択肢A を採用。公開入口境界は新規 REQ-050 として独立させ、REQ-009 は既存行（REQ-009-002、REQ-009-044）の UPDATE のみとする。ユーザー合意済み（2026-08-23 壁打ち）。
  - id: CR-002
    conflict: 公開入口境界モデルの Decision 化の要否（Decision 禁止条件「命名規約・動作仕様」と、False Negative 例外「将来の設計を制約する決定」の緊張関係）。
    resolution: 新規 Decision を作成する（スコープは構造原則3項に限定し、モード群・命名細則・誤実行機構は REQ-050 へ除外）。DEC-016 拡張は行わない。アーキテクチャ助言（Oracle、4ラベル構造）の推奨をユーザーが承認（2026-08-23）。
  - id: CR-003
    conflict: DEC-016 の参照更新の可否。DEC-016 の status は frontmatter が accepted（docs/README.md 表の「（proposed）」は陳腐化注記）であり、accepted Decision の直接更新には明示承認記録が必要。
    resolution: 非意味修正（誤ったファイルパス修正）としてインプレース更新を実施する。明示承認記録: 2026-08-23 req-define 壁打ちにおけるユーザー承認。スクリプト改名と同一変更単位で実施。docs/README.md の陳腐化注記も同時修正する。
  - id: CR-004
    conflict: distribution-boundary Design の安定実装契約「check-consumer-opencode.ps1 へ新たな責務を追加しない」の拘束は、当該スクリプト廃止後に参照先を失う。
    resolution: 拘束の継承先として一般化表現「consumer 向け公開入口（scripts/install.ps1）へ新たな責務を追加しない」へ書き換える（特定入口名への再刻印を避ける）。アーキテクチャ助言の推奨を採用。
  - id: CR-005
    conflict: 実証Case と通常Case の別（実証必要性の推論）。
    resolution: 通常Case として確定（main ブランチ、評価契約なし）。公開入口構成は RU-0001 の Source Summary で合意済みで未確定の採否判断が残らず、検証は機械的（スクリプト実行・構成確認・配布境界検査）で test strategy でカバー可能なため、実証の3観点のいずれにも該当しない。ユーザー合意済み（2026-08-23 壁打ち）。

# operation_units: 統合/分離結果（単一RU入力、5操作単位）
operation_units:
  - ou_id: OU-0001
    source_ru: RU-0001
    target_req: REQ-050
    operation: create
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      status: applied
      saved_docs:
        - docs/requirements/REQ-050.md
      action_ids: [ACT-REQ-001, ACT-DEC-001, ACT-DEC-002]
      mapping:
        ACT-REQ-001: docs/requirements/REQ-050.md
        ACT-DEC-001: docs/decisions/DEC-021.md
        ACT-DEC-002: docs/decisions/DEC-016.md
      source_ru_mapping: RU-0001 -> REQ-050 create + DEC-021 create + DEC-016 update
  - ou_id: OU-0002
    source_ru: RU-0001
    target_req: REQ-009
    operation: update
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      status: applied
      saved_docs:
        - docs/requirements/REQ-009.md
      action_ids: [ACT-REQ-002]
      mapping:
        ACT-REQ-002: docs/requirements/REQ-009.md
      source_ru_mapping: RU-0001 -> REQ-009 update (REQ-009-002, REQ-009-044)
  - ou_id: OU-0003
    source_ru: RU-0001
    target_design:
      operation: update
      domain: local
      slug: runtime-package-boundary
    operation: update
    scale: large
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}
  - ou_id: OU-0004
    source_ru: RU-0001
    target_design:
      operation: update
      domain: local
      slug: install-script-usability
    operation: update
    scale: large
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}
  - ou_id: OU-0005
    source_ru: RU-0001
    target_design:
      operation: update
      domain: integrity
      slug: distribution-boundary
    operation: update
    scale: large
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}

# test_strategy: 各合意項目の検証方法（3要素必須）
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      scripts/ 直下のファイル・ディレクトリ構成を確認する。scripts/ 直下に存在する
      ファイルが install.ps1 と self-sync.ps1 の2本のみであること、内部処理が
      scripts/consumer/ 配下と scripts/self/ 配下（release/、maintenance/）に配置されている
      ことを確認する。単体実行しない共通処理・release 生成・信頼境界検証・保守処理が
      scripts/ 直下に存在しないことを確認する。
    pass_criteria: |
      scripts/ 直下の通常利用者向け公開スクリプトが install.ps1 と self-sync.ps1 の
      2本のみである。公開入口名に opencode が含まれていない。内部処理が
      scripts/consumer/ と scripts/self/ 配下に配置されている。
    on_failure: |
      fix-and-reverify。公開入口境界の違反（第三の運用スクリプト存在、opencode を含む
      入口名、内部処理の直下残留）は実装不具合であるため配置を修正して再検証する。
  - id: TS-002
    target_item: AG-002
    verification: |
      scripts/install.ps1 の3モードを検証する。apply は通常 consumer と -LocalMode
      consumer の両方で導入・再同期を行い、再実行して冪等性を確認する。check は
      管理対象ファイルの変更がないことをファイル状態の前後比較で確認し、orphan 検出を
      含む旧 check-consumer-opencode.ps1 の検査能力との同等性を確認する。dry-run は
      変更予測のみを出力し管理対象ファイルを変更しないことを確認する。-LocalMode、
      -PluginDir が新入口から利用できることを確認する。
    pass_criteria: |
      install.ps1 が apply / check / dry-run を提供する。check・dry-run が管理対象
      ファイルを変更しない。check が orphan 検出等の旧検査能力を包含する。apply の
      再実行が同一結果に到達する（冪等）。-LocalMode・-PluginDir が利用できる。
    on_failure: |
      fix-and-reverify。モード欠落・能力欠落・非破壊違反・冪等性破壊は実装不具合である
      ため修正して再検証する。
  - id: TS-003
    target_item: AG-003
    verification: |
      scripts/self-sync.ps1 の3モードを検証する。apply は本体リポジトリの原本と実行時
      配置先の同期を行う。check と dry-run が同期対象を変更しないことをファイル状態の
      前後比較で確認する。
    pass_criteria: |
      self-sync.ps1 が apply / check / dry-run を提供する。check・dry-run が同期対象を
      変更しない。
    on_failure: |
      fix-and-reverify。モード欠落・非破壊違反は実装不具合であるため修正して再検証する。
  - id: TS-004
    target_item: AG-004
    verification: |
      相互誤実行を検証する。AgentDevFlow 本体リポジトリで scripts/install.ps1 を実行し、
      変更前に停止することと適切な入口（self-sync.ps1）への案内を確認する。
      consumer リポジトリで scripts/self-sync.ps1 を実行し、変更前に停止することと
      適切な入口（install.ps1）への案内を確認する。停止時に管理対象ファイルが変更
      されていないことを確認する。
    pass_criteria: |
      誤った環境での実行が変更前に停止する。停止時に適切な公開入口が案内される。
      管理対象ファイルが変更されない。
    on_failure: |
      fix-and-reverify。誤実行時の変更・停止しない・案内欠落は実装不具合であるため
      修正して再検証する。
  - id: TS-005
    target_item: AG-005
    verification: |
      旧公開入口3本が scripts/ 配下に存在しないことを確認する。旧公開入口名の互換
      ラッパーが scripts/ 直下に存在しないことを確認する。現行 README（ルート、docs、
      src/opencode-local）、Guide、REQ、Design、Decision、検証処理、テストから旧3入口を
      現行手順として参照する記述が除去または更新されていることを検索で確認する。
      歴史記録（廃止済み Decision 等）の旧名称は現行入口として誤認されない限り残存を
      許容する。
    pass_criteria: |
      旧3入口のファイルと互換ラッパーが存在しない。現役文書・コードに旧3入口を現行
      手順として参照する記述が残っていない。
    on_failure: |
      fix-and-reverify。残存参照は実装不具合であるため参照更新をして再検証する。
  - id: TS-006
    target_item: AG-006
    verification: |
      release archive を生成する。repository 上で archive 専用 installer 原本が通常
      consumer installer と分離されていることを確認する。生成された archive 内で
      consumer 向け installer が scripts/install.ps1 として存在し、実行できることを
      確認する。archive 版 install.ps1 が archive installation projection の既存契約
      （junction 不作成等）を維持することを確認する。
    pass_criteria: |
      archive 専用 installer 原本が分離保持されている。archive 内で scripts/install.ps1
      が利用できる。archive 版が既存契約を維持する。checkout 版と archive 版が
      強制統合されていない。
    on_failure: |
      fix-and-reverify。投影名・分離・契約違反は実装不具合であるため修正して再検証する。
  - id: TS-007
    target_item: AG-007
    verification: |
      source / link / archive / archive-installed の各配布境界検査を新パス構成で実行する。
      trust root / protected path が新しい信頼対象パスを保護し、移動後の旧パスを保護
      対象から除外していることを確認する。release archive の生成前・生成後検査が新構成で
      機能することを確認する。
    pass_criteria: |
      4種の配布境界検査が新パス構成で正常に機能する。trust root / protected path が
      新パスを保護し、旧パスのみを保護する状態になっていない。
    on_failure: |
      fix-and-reverify。検査の失敗・保護対象の欠落は実装不具合であるため修正して再検証する。
  - id: TS-008
    target_item: AG-007
    verification: |
      公開入口が依存する内部ファイル（scripts/consumer/common.ps1 等）を1件欠落させた
      状態で配布検証を実行し、検証が失敗することを確認する。配布 manifest が公開入口と
      実行依存集合を完全に表現していることを確認する。
    pass_criteria: |
      内部依存の欠落時に配布検証が失敗する（欠落を含む配布成果物が正常扱いされない）。
    on_failure: |
      fix-and-reverify。依存欠落を検出できない状態は検証処理の不具合であるため修正して
      再検証する。
  - id: TS-009
    target_item: AG-008
    verification: |
      install.ps1 の apply 実行時に git clone / git fetch / git reset 等の provisioning
      操作と network access が実行されていないことをコード検査と実行時挙動で確認する。
      apply の再実行が同一結果に到達することを確認する（TS-002 と共用）。
    pass_criteria: |
      install.ps1 が provisioning を実行しない。network access を行わない。apply が
      冪等である。
    on_failure: |
      fix-and-reverify。副作用ゼロ原則違反は DEC-016 違反であるため除去して再検証する。
  - id: TS-010
    target_item: AG-008
    verification: |
      git clone checkout と source ZIP checkout の双方で install.ps1 による consumer
      導入契約（apply / check の主要経路）が維持されることを確認する。通常 consumer と
      -LocalMode consumer の双方で主要経路を検証する。
    pass_criteria: |
      両 checkout 形態で consumer 導入契約が維持される。通常・-LocalMode の双方で
      apply / check が機能する。
    on_failure: |
      fix-and-reverify。特定 checkout 形態での導入不能は実装不具合であるため修正して
      再検証する。
  - id: TS-011
    target_item: AG-008
    verification: |
      scripts/install.ps1 と scripts/self-sync.ps1 に対して Get-Help を実行し、
      comment-based help が解析されることを確認する。#Requires ディレクティブが
      機能することを確認する。
    pass_criteria: |
      2本の新公開入口で Get-Help が comment-based help を表示する。#Requires が
      両立して機能する（REQ-009-044）。
    on_failure: |
      fix-and-reverify。ヘルプ・ディレクティブの不備は実装不具合であるため修正して
      再検証する。
  - id: TS-012
    target_item: AG-011
    verification: |
      保存後の REQ-009（-002、-044 の更新）、新規 Decision、DEC-016（参照更新・
      status: accepted）、docs/README.md（DEC-016 注記）、Design 3件（runtime-package-boundary、
      install-script-usability、distribution-boundary）の内容が artifact_actions の
      content と一致することを確認する。DEC-016 の決定内容（副作用ゼロ）が変更されて
      いないことを確認する。
    pass_criteria: |
      各成果物が draft の artifact_actions に従って保存されている。DEC-016 の意味変更が
      ない（非意味修正のみ）。docs/README.md の DEC-016 表記が accepted に一致する。
    on_failure: |
      fix-and-reverify。保存内容の不一致は保存工程の不具合であるため修正して再検証する。

# review_dispositions: 採否判断の記録
review_dispositions:
  - id: RD-001
    source_ru: RU-0001
    source_item: RU-0001:all
    disposition: covered
    reason_code: adopted_in_full
    reason: |
      RU-0001 の合意内容（Source Summary 17項目）、要件化の方向（§1〜§9）、受け入れ
      条件（36項目）、検証方法（15項目）を、REQ-050 新規作成、REQ-009 UPDATE、
      新規 Decision、DEC-016 参照更新、Design 3件更新の保存対象へ完全反映した。
      対象外（§対象外）は REQ-050 の適用範囲の対象外として明記した。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: Source Summary、要件化の方向、受け入れ条件、検証方法
      checked_at_commit: null
    related_removed_items: []

# case_open_hints: case-open 構成生成への参考情報
case_open_hints:
  epic_needed: false
  decomposition: null
  wave_hints: []
```

# summary

RU-0001（scripts 公開入口の self / consumer 二系統化）を要件化した。公開入口境界は新規
REQ-050（要件14行）、REQ-009 既存行の UPDATE（2行）、新規 Decision「scripts 公開入口の
2本固定と安定契約」、DEC-016 の非意味修正（明示承認済み）、Design 3件の更新
（runtime-package-boundary、install-script-usability、distribution-boundary）として
保存対象を構成した。SPLIT 判定は選択肢A（REQ-009 から新規 REQ-050 へ分離）。通常Case
（実証なし）。影響ファイルは16件超（LIVE 15 + 契約固着 5）のため scale: large と判定した
が、RU-0001 自身が統合を要求する単一変更単位（公開入口・内部配置・配布境界・参照更新の
同時実施）のため Epic 分解は行わず、issue_policy: single を hint として出す。
