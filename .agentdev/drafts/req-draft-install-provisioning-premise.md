---
draft_type: req_draft
topic_slug: install-provisioning-premise
status: saved
created_at: 2026-08-15T00:00:00+09:00
source_rus:
---

# draft-data

```yaml
work_type: feature

scale: standard

spec_actions_consumed: true

summary: |
  ADF 導入モデルの前提を「install スクリプト自身が clone する」から「利用者がチェックアウト済み
  （git clone または GitHub ソース ZIP 展開）の .agentdev-plugin/ を用意する」へ変更する。
  install スクリプトから provisioning（clone/fetch/reset）を削除し network access を排除する
  （副作用ゼロ原則として Decision を新設する）。チェックアウト未検出時はエラー停止＋手順案内とし、
  ZIP 展開チェックアウト（.git なし）を正規の provisioning 形態として許容する。
  check スクリプトの版報告は git がある場合のみとし、README.md・導入ガイドの導線を新前提へ更新する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      provisioning（agent-dev-flow チェックアウトの取得）は利用者の責務とする。
      install スクリプト（install-consumer-opencode.ps1）は clone、fetch、reset を一切実行せず、
      チェックアウト済みの .agentdev-plugin/（git clone または GitHub ソースアーカイブ ZIP の展開）
      を前提に動作する。スクリプトは network access を行わない。
  - id: AG-002
    content: |
      チェックアウトが検出できない場合（.agentdev-plugin/ 不在、または src/opencode/ が存在しない）、
      install スクリプトはエラー停止し、clone コマンド例とソース ZIP 取得手順を案内表示する。
      provisioning を代行実行しない。
  - id: AG-003
    content: |
      ZIP 展開チェックアウト（.git なし）を正規の provisioning 形式として許容する。
      check-consumer-opencode.ps1 は「.agentdev-plugin/ が git リポジトリでない」を乖離（DIVERGENCE）
      から情報報告へ格下げし、版（commit/branch）報告は .git が存在する場合のみ行う。
      ZIP 展開環境の版は unknown とし、version manifest ファイルは導入しない。
      ZIP 展開環境からの不具合報告は受け付けない運用とする。
  - id: AG-004
    content: |
      導入済み環境の更新は利用者の責務とする（git pull、または ZIP 再取得・ディレクトリ差し替え後の
      install 再実行）。install スクリプトの apply は冪等とし、ZIP 更新時の install 再実行の要否を
      仕様として推奨・不推奨の形で定めない（利用者判断に委ねる）。
  - id: AG-005
    content: |
      install スクリプトのオプションを整理する。-RepoUrl と -Branch を廃止する（provisioning を
      行わないため）。-PluginDir は「チェックアウト済みディレクトリの位置指定」として存続する。
      対話ウィザードの文言から「clone して実行」系の表現を除去し、チェックアウト済み前提の案内へ
      更新する。
  - id: AG-006
    content: |
      README.md の導入セクションと docs/guides/consumer-project-setup.md を新前提の導線へ更新する。
      現行 README の「scripts/ を適用先リポジトリにコピー」という手順は新前提と矛盾するため、
      「git clone または ZIP 展開で .agentdev-plugin/ を用意し、install スクリプトを実行する」
      導線へ書き換える。更新手順も git 専用から provisioning 形式別の案内へ整理する。
      scripts/ のコピー元は .agentdev-plugin/ と同一チェックアウトとする推奨（スクリプトと
      チェックアウトの版不一致の防止）と、ZIP 展開環境がサポート対象外である旨の注記を
      導線に含める。
  - id: AG-007
    content: |
      REQ-009-009 の「任意の手動 copy インストールは対象外」との整合を明確化する。
      provisioning（チェックアウトの取得手段: clone / ZIP 展開）と install 手段（link mode による
      junction 接続）は別軸であり、ZIP 展開による provisioning は手動 copy インストールに該当
      しない。install 手段は引き続き link mode に限定される。あわせて「source ZIP による
      チェックアウト供給」と「release archive projection」を別個の概念として扱い、両者を混同
      する説明をしない。
  - id: AG-008
    content: |
      導入系スクリプトの副作用ゼロ原則を Decision として新設する（ユーザー確定）。
      導入系スクリプト（install-consumer-opencode.ps1、check-consumer-opencode.ps1）は
      provisioning を行わず network access を行わない。provisioning 責務は利用者にあり、
      チェックアウトの出所と版は利用者が制御する。判断根拠は offline-first、副作用の排除、
      スクリプトの単純化であり、relates-to は DEC-002（原本/プロジェクション分離における
      移行・同期責務分離の類推）とする。既存 DEC-002、DEC-004、DEC-014 との衝突はなし
      （アーキテクチャ助言サブエージェントによる検証済み）。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-009.md
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-007]
    content: |
      REQ-009（配布基盤と導入モデル）を更新する。
      既存行の UPDATE:
      - REQ-009-010: 「導入先リポジトリでは agent-dev-flow 本体を .agentdev-plugin/ へ clone し、
        .agentdev/ へは clone しないこと」を「導入先リポジトリでは agent-dev-flow 本体の
        チェックアウトを利用者が .agentdev-plugin/ 配下に配置し、.agentdev/ へは配置しないこと」
        へ更新する。.agentdev/ 配置禁止という行の本質は不変とする。
      - REQ-009-009: 「任意の手動 copy インストール」を「.opencode/ 配下へ配布成果物の実体を
        複製する方式」と語義限定する（最小 UPDATE）。install 手段の copy は引き続き対象外。
      - REQ-009-041: 括弧内「clone 先」を「チェックアウト配置先」へ wording 更新する。
        停止条件の実体（.agentdev-plugin/ 配下での停止）は不変。
      - REQ-009-043: clone 先・clone 元オプションの廃止に伴い、「チェックアウト配置先を変更する
        上級者向けオプション（-PluginDir）」へ更新する。
      新規行の APPEND:
      - 導入系スクリプトは provisioning（clone、fetch、reset 等のチェックアウト取得・更新）を
        行わず、network access を行わないこと。
      - チェックアウトが検出できない場合（チェックアウト配置先に src/opencode/ が存在しない
        場合を含む）、エラー停止し clone とソースアーカイブ取得の手順を案内すること。
        provisioning を代行実行しないこと。
      - ZIP 展開チェックアウト（.git なし）を正規の配置形態として許容すること。版報告は
        .git が存在する場合のみ行い、ZIP 展開環境は unknown を許容すること。version
        manifest ファイルは導入しないこと。ZIP 展開環境はサポート対象外とし、不具合報告の
        受け付け対象から除外する運用とすること。
      - 導入済み環境の更新は利用者の責務とすること（git pull または ZIP 再取得・配置後に
        install を再実行）。install の apply は冪等とし、ZIP 更新時の install 再実行の要否を
        仕様として推奨・不推奨の形で定めないこと。
  - id: ACT-DEC-001
    artifact: decision
    operation: create
    target: DEC-016
    source_items: [AG-008]
    content: |
      Decision「導入系スクリプトの副作用ゼロ原則」を新設する。
      決定: 導入系スクリプト（install-consumer-opencode.ps1、check-consumer-opencode.ps1）は
      provisioning（チェックアウトの取得・更新）を行わず、network access を行わない。
      provisioning は利用者の責務（git clone または GitHub ソースアーカイブ ZIP の展開）とし、
      チェックアウトの出所と版は利用者が制御する。
      判断根拠: offline-first（導入時に network 前提を置かない）、スクリプト副作用の排除
      （実行がチェックアウト状態を変えない）、provisioning と install の責務分離による
      スクリプトの単純化、利用者による版固定の許容。
      relates-to: DEC-002（原本/プロジェクション分離における移行・同期の責務分離の類推）。
      影響: REQ-009、runtime-package-boundary SPEC、install-script-usability SPEC、README、
      consumer-project-setup guide。
  - id: ACT-SPEC-001
    artifact: spec
    operation: update
    target: docs/specs/local/runtime-package-boundary.md
    target_area: 導入方式ポリシー（Installation Method Policy）
    source_items: [AG-001, AG-002]
    content: |
      導入方式ポリシーを更新する。provisioning 形態を「利用者による git clone」と「利用者による
      ソース ZIP 展開」の2形態として定義する。install スクリプトはチェックアウト済み前提で
      junction 設定のみを行い、provisioning と network access を行わない。provisioning と
      install 手段（link mode）が別軸であること（AG-007 の2軸定義に対応）を明記する。
  - id: ACT-SPEC-002
    artifact: spec
    operation: update
    target: docs/specs/local/runtime-package-boundary.md
    target_area: link mode 接続手順技術詳細
    source_items: [AG-002, AG-003, AG-004]
    content: |
      link mode 接続手順技術詳細を更新する。install・check 両スクリプトの git リポジトリ性
      必須判定を usable checkout 判定（src/opencode/ の存在。.git ではなく）へ置き換える。
      チェックアウト未検出時のエラー停止と手順案内、ZIP 展開チェックアウトの正規扱い
      （版報告は .git 存在時のみ、unknown 許容）、更新運用（git pull または ZIP 再取得後に
      install 再実行、apply の冪等性）を記述する。
  - id: ACT-SPEC-003
    artifact: spec
    operation: update
    target: docs/specs/local/install-script-usability.md
    target_area: 対話ウィザード
    source_items: [AG-002, AG-005]
    content: |
      対話ウィザード節を更新する。ウィザード文言から「clone して実行」系の表現を除去し、
      チェックアウト済み前提の案内へ更新する。チェックアウト未検出時のエラーメッセージ
      （clone コマンド例と ZIP 取得手順、ZIP 展開時のディレクトリ配置に関する注意:
      agent-dev-flow-<ref>/ の一段ネストを避け .agentdev-plugin/src/opencode/ となる配置を
      指示、scripts/ は .agentdev-plugin/ と同一チェックアウトからコピーする案内）を定義する。
  - id: ACT-SPEC-004
    artifact: spec
    operation: update
    target: docs/specs/local/install-script-usability.md
    target_area: dry-run/check/apply の技術的差
    source_items: [AG-005]
    content: |
      dry-run/check/apply の技術的差節を更新する。clone 軸を除去し、「検証のみ（check）/
      変更予測（dry-run）/実行（apply）」へ再定義する。REQ-009-042 のヘルプ記述も新前提へ
      更新する。
  - id: ACT-SPEC-005
    artifact: spec
    operation: update
    target: docs/specs/local/install-script-usability.md
    target_area: 上級者向けオプション
    source_items: [AG-005]
    content: |
      上級者向けオプション節を更新する。-RepoUrl と -Branch を廃止する。-PluginDir を
      「チェックアウト配置先を変更する上級者向けオプション」として存続させる。
  - id: ACT-SPEC-006
    artifact: spec
    operation: update
    target: docs/specs/local/install-script-usability.md
    target_area: cwd 安全化
    source_items: [AG-005]
    content: |
      cwd 安全化節を更新する。停止理由の文言「agent-dev-flow の clone 先」を「チェックアウト
      配置先」へ更新する。停止条件の実体（.agentdev-plugin/ 配下での停止）は不変とする。

conflict_resolutions:
  - id: CR-001
    conflict: |
      REQ-009-010「導入先リポジトリでは agent-dev-flow 本体を .agentdev-plugin/ へ clone し」が
      git clone による provisioning を手段として固定しており、ZIP 展開前提と衝突する。
    resolution: |
      REQ-009-010 を UPDATE し「clone またはソースアーカイブの展開により利用者が配置する」へ
      文言を変更する。provisioning の実施主体が利用者であることを要件へ明記する。
  - id: CR-002
    conflict: |
      REQ-009-009「任意の手動 copy インストールと npm/package 配布は対象外」が ZIP 展開
      provisioning を copy インストールと誤読させる恐れがある。
    resolution: |
      provisioning（チェックアウト取得）と install 手段（link mode）の別軸定義を明記する
      （AG-007）。install 手段の copy は引き続き対象外のまま。
  - id: CR-003
    conflict: |
      check-consumer-opencode.ps1 が「.agentdev-plugin/ が git リポジトリでない」を DIVERGENCE
      （乖離）として報告し、ZIP 展開チェックアウトを不正状態として扱う。
    resolution: |
      git リポジトリ性は必須要件から外し、情報報告へ格下げする（AG-003）。版報告は .git
      存在時のみとし、ZIP 環境は unknown を許容する。usable checkout の判定は .git ではなく
      src/opencode/ の存在で行う。
  - id: CR-004
    conflict: |
      provisioning 責務の利用者移転を Decision として記録すべきか。アーキテクチャ助言は
      DEC 不要（REQ-009 UPDATE のみで十分、確信度 70%）を推奨した。
    resolution: |
      ユーザー判断により DEC を新設する（AG-008）。導入系スクリプトの副作用ゼロ原則を
      長寿命の設計原則として記録し、将来の clone 復活提案を Decision でも止める。

operation_units:
  - ou_id: OU-001
    target_req: REQ-009
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_req_docs: [REQ-009]
      action_to_doc:
        ACT-REQ-001: "REQ-009（UPDATE: REQ-009-009/010/041/043、APPEND: REQ-009-046〜049）"
        ACT-DEC-001: "DEC-016（CREATE: docs/decisions/DEC-016.md）"
  - ou_id: OU-002
    target_spec: docs/specs/local/runtime-package-boundary.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result:
      saved_spec_docs: [docs/specs/local/runtime-package-boundary.md]
      action_to_doc:
        ACT-SPEC-001: "runtime-package-boundary.md 導入方式ポリシー（UPDATE）"
        ACT-SPEC-002: "runtime-package-boundary.md link mode 接続手順技術詳細（UPDATE）"
  - ou_id: OU-003
    target_spec: docs/specs/local/install-script-usability.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result:
      saved_spec_docs: [docs/specs/local/install-script-usability.md]
      action_to_doc:
        ACT-SPEC-003: "install-script-usability.md 対話ウィザード（UPDATE）"
        ACT-SPEC-004: "install-script-usability.md dry-run/check/apply の技術的差（UPDATE）"
        ACT-SPEC-005: "install-script-usability.md 上級者向けオプション（UPDATE）"
        ACT-SPEC-006: "install-script-usability.md cwd 安全化（UPDATE）"

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      チェックアウト済みの .agentdev-plugin/（git あり）を用意した consumer リポジトリで
      install-consumer-opencode.ps1 -Mode apply を実行する。clone、fetch、reset 等の
      network 系 git コマンドが起動されないことをスクリプト出力とコード検査で確認する
      （ローカル参照系 git コマンドは本要件の対象外）。
    pass_criteria: |
      junction が既存 src/opencode/ へ作成され、exit 0 で完了する。clone、fetch、reset、
      およびその他の network access が一切実行されない。
    on_failure: |
      fix-and-reverify。provisioning 処理の残存（Initialize-PluginCheckout 相当の削除漏れ）を
     特定して修正し、再検証する。
  - id: TS-002
    target_item: AG-002
    verification: |
      .agentdev-plugin/ を持たない consumer リポジトリで install-consumer-opencode.ps1
      -Mode apply を実行する。
    pass_criteria: |
      exit 0 以外で停止し、clone コマンド例と ZIP 取得手順を含む案内が表示される。
      .opencode/ 配下にファイル変更が発生しない。
    on_failure: |
      fix-and-reverify。エラー分岐と案内メッセージを修正し、再検証する。
  - id: TS-003
    target_item: AG-003
    verification: |
      GitHub ソース ZIP を展開した .agentdev-plugin/（.git なし）で apply を実行し、
      続けて check-consumer-opencode.ps1 を実行する。
    pass_criteria: |
      apply が exit 0 で完了し、check が git リポジトリ性を乖離ではなく情報として報告する。
      版表示は行わない、または unknown と表示する。
    on_failure: |
      fix-and-reverify。check の git 必須判定の残存を修正し、再検証する。
  - id: TS-004
    target_item: AG-006
    verification: |
      README.md の導入手順と docs/guides/consumer-project-setup.md の手順を、ZIP 展開環境で
      文書記載の通り実行する。
    pass_criteria: |
      文書の手順のみで導入が完了し、手順中にスクリプトが要求する前提と文書の記述が一致する。
    on_failure: |
      fix-and-reverify。文書の手順を実際の挙動へ一致させ、再検証する。
  - id: TS-005
    target_item: AG-007
    verification: |
      REQ-009、runtime-package-boundary.md、install-script-usability.md、README.md の更新後に
      /repo/docs-check を実行する。
    pass_criteria: |
      REQ-009 関連の整合性検証で乖離が報告されない。
    on_failure: |
      fix-and-reverify。指摘箇所を修正し、再実行する。
  - id: TS-006
    target_item: AG-004
    verification: |
      チェックアウト済みの consumer リポジトリで install-consumer-opencode.ps1 -Mode apply を
      2回連続実行し、junction 構成を比較する。
    pass_criteria: |
      2回とも exit 0 で完了し、junction 構成が同一である（2回目の実行で変更・破損が生じない）。
    on_failure: |
      fix-and-reverify。apply の非冪等な分岐を特定して修正し、再検証する。
  - id: TS-007
    target_item: AG-005
    verification: |
      廃止オプション（-RepoUrl、-Branch）を指定して install-consumer-opencode.ps1 を起動する。
      また別ディレクトリ名に ZIP チェックアウトを配置し、-PluginDir で指定して -Mode apply を
      実行する。ウィザード表示文言を確認する。
    pass_criteria: |
      廃止オプションはパラメータエラーで拒否される。-PluginDir 指定の ZIP チェックアウトで
      junction が作成される。ウィザード文言に clone 系の表現が残らない。
    on_failure: |
      fix-and-reverify。オプション定義とウィザード文言を修正し、再検証する。

review_dispositions: []

case_open_hints:
  epic_needed: false
  wave_hints: []
```

# summary

導入モデルの前提変更。install スクリプトから provisioning（clone/fetch/reset）を削除して
network access を排除し、チェックアウト済み前提（git clone / ZIP 展開）で junction 接続のみを
行う。未検出時はエラー停止＋手順案内。ZIP 展開を正規 provisioning 形式として許容し、check の
版報告は git 存在時のみに整理する。README・導入ガイドの導線を新前提へ更新する。
対象は install-consumer-opencode.ps1、check-consumer-opencode.ps1、REQ-009、SPEC 2件
（runtime-package-boundary、install-script-usability）、README.md、consumer-project-setup.md。
release archive 系スクリプト、sync-self-opencode.ps1、配布依存境界 gate は対象外。
