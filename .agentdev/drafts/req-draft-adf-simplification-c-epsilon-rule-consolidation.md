---
draft_type: req_draft
topic_slug: adf-simplification-c-epsilon-rule-consolidation
status: draft
created_at: 2026-11-12T23:40:00+09:00
---

# draft-data

```yaml
work_type: maintenance
scale: large
summary: |
  ADF全体簡素化計画（第53報告・2026-11-10 利用者承認）の C-ε として、規則の集約と正本の一元化（B2-1・B2-2・B3-1〜B3-6）の要件を定義する。B2-1 は工程駆動11ファイルと公開 Command・Workflow Skill に反復した共通報告・Decision・自律確定規則を1箇所の共通参照文書へ集約し、REQ-110 の受け入れ条件対応行（TS-011・TS-012）を正本参照で満たす形へ改訂する。B2-2 は7工程拡張に反復した文章品質規則（yomiyasu・guard）を正の1箇所へ集約し、障害対応知識を docs/knowledge/ の条件付き参照へ整理し、guard 拒否後の迂回矛盾（第5報告 C-001）を worktree 運用指針の迂回禁止へ統一して解消する。B3-1 は検査器出力への IR 規則識別子包含・65規則の機械検査／文章のみ分類・実装・試験パスの機械検査可能な記載形式を確立し、rule-ownership 対応表の二重管理を機械検証へ移行して縮小する（着手条件の見通し評価は CR-003 に記録し、見通しは示せると評価済み）。B3-2〜B3-6 は配布除外規則・検出用スキル一覧・Decision 部分置換関係・ガード間編集意味論・Workflow Skill 構造検査・agentdev-gh 操作一覧・install/self-sync 共有判定・ホスト間接続・traceability sidecar 対応宣言の各正本を一元化または機械導出化する。要件操作は REQ-110 の2行改訂（update）と REQ-047 へ3行・REQ-012 へ2行の追記（append）、Design 8ファイル14節への集約契約追加（append）である。試験は C-α1 固定基線に対する新規不合格0・既知不合格の悪化なし、移行前後対比証明、簡素化効果の記録、配布整合検査最終合格を合格条件とする。並行5案件（C-δ case-close・#3989・verify-logs 整理・checker 要件検討）との分離は AG-014・AG-015 が保持する。
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []
agreed_items:
  - id: AG-001
    content: |-
      B2-1（対処: P-001 第21報告、C-001/C-003/C-004/C-006 第20報告、R-001 第23報告）。工程駆動11ファイルに反復した共通報告・Decision 規則を1箇所（共通参照文書）へ集約する。
      対象11ファイルは、公開 Command 5件（src/common/commands/agentdev/phase-tasks-create.md、phase-tasks-update.md、phase-artifacts-update.md、phase-review.md、phase-transition.md）、Workflow Skill 5件（agentdev-workflow-phase-tasks-create、同 tasks-update、同 artifacts-update、同 review、同 transition）、共通 Capability Skill 1件（agentdev-phase-theme-collaboration）である。反復実体は、完了報告の必須要素規則（Issue #3831・commit 81c0fbdc49b で各ファイルへ同一文言を追加、REQ-110-034〜037）と、Decision の役割と正本参照の規則（Issue #3832・commit 17537158cc5、REQ-110-038〜039）である。
      対象は Workflow Skill 側に加え、公開 Command 側の選択表・報告規則・自律確定の言い換え重複（case-auto.md の内部工程制御の重複所有〔C-001〕、inspect-docs.md と inspect-skills.md の同一選択表の重複保有〔C-003/C-004〕、intake-promote・learning-promote・inspect-promote の自律確定よい評価・人間留保判断・大量削除の明示承認・明示指定 auto 昇格の区別の反復〔C-006〕）、および隣接 STEP 間の手順二重（case-open references の handoff.md と root-case-and-definition-package.md における未追跡分先行 commit 規則の二重。handoff.md 側の「req-define は commit できない」は現行 req-define.md の明示パス commit 例外と矛盾した古い前提である〔R-001〕）を含む。
      集約後、各工程は対象範囲と呼出条件のみを保持する。要件行が特定ファイルへの文言存在を合格条件にしている場合（REQ-110 受け入れ条件対応 TS-011・TS-012）、要件行の意味を変えない形（報告内容の確保・正本到達性を維持し、正本参照で満たす）へ要件改訂を実施する。集約の形式は名レベル参照契約（REQ-002-017・REQ-027-001）と両立する（CR-002）。
      受け入れ条件: 集約前後で各工程の報告に含まれる要素が同一であること。全11工程について静的な参照経路（Command→SKILL.md→references の連鎖）を機械確認した上で、異なる参照形態ごとに代表的な実行経路を展開して適用を検証する（全工程の通し試験は要求しない）。要件行・traceability sidecar の整合。textlint・整合性検査合格。
  - id: AG-002
    content: |-
      B2-2（対処: T-002 第32報告、H-001 第33報告、R-004 第23報告、C-001/C-002/C-003 第5報告、X-001/X-002 第16報告）。7工程拡張に反復した文章品質規則（yomiyasu・guard 説明）を正の1箇所へ集約する。
      対象7工程拡張は、agentdev-workflow-case-auto、case-open、case-ready、case-revise、case-run、case-close、workflow-issue の各 references である。障害対応知識（Windows 文字コード破壊、Bun 実行形態差、標準出力消失、Git Bash パス変換、長時間処理起動、Worktree 環境差等）は docs/knowledge/ を参照先とする条件付き参照へ整理する。例外回復の規則も必要なときだけ参照される構造にする。回復知識は通常時必須規則・特定事故のみ回復手順・歴史知識の3区分で整理する（X-002）。
      第5報告 C-001 の実行時指示の矛盾（guard 拒否後に別の書込み手段で同じ作業領域外へ書き込む選択肢を案内するプロジェクト拡張の記述）は、共通規則（worktree 運用指針の迂回禁止）へ統一して解消する。書込み規律の文面と検出器の実効範囲の一致（C-002: 配布境界ガードと GitHub 書込みガードはそれぞれ限定された検出対象を持つ）も本項で扱う。意味・数値・否定条件の保護（REQ-098-006）と書込み前検査の条件（REQ-053-025〜027）は削らない。
      受け入れ条件: 拡張7件の呼出条件が正しく1箇所を参照すること。配布後の環境で共通文書が参照先として実際に読み込めること（相対パス解決・配布対象への同梱）を検証すること。guard 拒否時の迂回禁止・代替書込み規則の維持。共通規則と7工程の拡張（および worktree 運用指針）を照合し、拒否後の回復手順が一致すること（許可された配置先への変更による回復は維持）。書込み規律の文書が規定する拒否対象・許可対象と実際の検出器の判定が代表例で一致すること。通常工程の常時手順が縮小しても障害時の回復手順に到達できること。
  - id: AG-003
    content: |-
      B3-1（対処: R-001 第49報告、G-007 第28報告）。integrity 規則体系の機械検査基盤を確立し、対応表（rule-ownership）の二重管理を縮小する。
      内容: 検査器の出力に IR 規則識別子を必ず含める。65規則（docs/designs/integrity/rules/IR-*.md、実数65件確認済み）の「機械検査／文章のみ」現状分類を先に確定する。機械検査規則の文書には実装・試験の正確なパスを機械検査可能な形式で記載し、文章のみの規則には「文章のみ」分類を明記する（一律のパス記載を要求しない）。機械可読定義の記述と実行時の強制箇所の分離（G-007: agentdev-gh ローカル版 rules/{frontmatter,headings,labels,status}.yaml が操作用スキーマとして記載される一方で実行器 runner-local.ts はコード上の規則のみを消費する状態）もこの対応で解消する。
      着手条件（計画書 B3-1 行の条件付き記述）: 対応表の二重管理が実際に縮小できる見通しを Case 設計で示すこと。見通しの評価結果は CR-003 に記録のとおり「示せる」であり、実施する（見送りにせず再承認を求める必要はない）。
      受け入れ条件: 出力→規則文書の機械対応が成立すること。65規則の分類（機械検査／文章のみ）に未確定の規則が0件であることを記録すること。機械検査規則については実装・試験パスと出力識別子が一致することを全件確認すること。手動対応表が縮小または廃止され、代替の管理表を新設せずに済むこと。
  - id: AG-004
    content: |-
      B3-2（対処: D-001 第37報告、I-004 第39報告）。配布除外規則の正本を1箇所にし、各入口（install・sync・検査）は参照化する。
      現状は scripts/install.ps1・scripts/consumer/archive/install.ps1・scripts/self/release/package-release-archive.ps1 の3経路が配布除外（リポジトリ専用 Plugin 等）を手動同期し、検査側（trusted-distribution-gate/manifest.ts）も RUNTIME_PREFIXES・BOOTSTRAP_PATHS・配置写像を別保有する。self-sync.ps1 は自己環境投影のため除外しない例外入口である。独立検査の期待値を正本と同じ定義から導出すると誤った正規集合を検査が追認する危があるため、実際に配布する処理・配布されるべき集合を独立監査する処理・信頼起点として改ざんを防ぐ処理を区別する（I-004 の留保）。
      受け入れ条件: 各入口の除外集合が単一導出で一致すること。検証範囲は checkout 消費・自己同期・書庫作成・書庫導入で配布対象集合と repo-local 除外が一致すること（自己同期は意図的差異を維持）。
  - id: AG-005
    content: |-
      B3-3（対処: I-005 第39報告）。検出用スキル一覧をスキル配置から機械導出する。
      対象は data/skill-projection-manifest.yaml（正規情報源を src/common/skills/ のディレクトリ列挙とし、追加・削除・改名時に同一 PR 更新を要求し、ずれを厳格検出する現行運用）。宣言的データ運用原則（各 yaml は検出用ビューで正規契約の情報源としない）に従い、「承認対象の独立期待値」ではなく「再計算できる検出ビュー」として機械導出化する。
      受け入れ条件: スキルの追加・削除を行う代表的な変更で、一覧が自動追随し手動更新を要しないことを確認する（初回の導出結果と現行一覧の差分は説明つきで処理する）。
  - id: AG-006
    content: |-
      B3-4（対処: N-001 第31報告）。Decision 部分置換関係を全件確定した上で、旧条項から現行有効条項へ相互参照で到達できるようにする。
      対象となる部分置換関係を全件確定する。確定時点の既知対象は DEC-041（Wave 収束による子 Issue 起動制限の一部判断が DEC-051 で置換）であり、docs/README.md Decision 表の注記から判明する候補群（DEC-028 は DEC-047 による部分置換、DEC-036 は DEC-048/DEC-049、DEC-044 は DEC-052、DEC-045 は DEC-050 等）を含めて列挙して固定する。部分置換された旧決定を現役規範として誤採用するリスクを、相互参照到達で解消する。
      受け入れ条件: 対象全件について、旧 Decision の条項を読んだ実行主体が置換後の現行条項へ到達できることを参照追跡で確認すること。
  - id: AG-007
    content: |-
      B3-5a（対処: T-002 第30報告）。ガード間で重複する編集意味論の解析・再構成部を共通化し、各ガードは拒否条件のみを持つ。
      対象は src/opencode/plugins/agentdev-textlint-guard/lib/reconstruct.ts（write/edit/apply_patch の完成予定全文の再構成）と src/common/guards/distribution-boundary/distribution-boundary-guard-parser.ts・同 -reconstruction.ts（同じ編集操作の引数解析・復元）の重複。対象検査は異なる（文章品質 vs 配布境界）ためガード統合は行わず、編集意味論の解析・再構成のみを共有する。
      受け入れ条件: 共通部の試験が1箇所で管理されること。各ガードの拒否条件の試験は現行のまま残ること。解析不能・検査不能を許可へ変えない保証は双方のガードで維持すること。
  - id: AG-008
    content: |-
      B3-5b（対処: I-001 第35報告、I-006 第39報告）。Workflow Skill 構造検査の正本を1箇所に寄せ、大規模検査器（check_integrity）と専用検査器の責務境界を確定する。
      対象は check_workflow_preventive.ts（WORKFLOW_TRIGGER_ITEM=「単独起動」関連）と lint_skills.ts（同じ定数・公開 Command 対象集合導出・同趣旨検査）が同一 Workflow Skill 検査を独立保持する重複（後者のモジュール読込時 main() 実行の事情を含む）。判定段階が異なる検査は意図的に残す。
      受け入れ条件: 統合対象として削除する検査と、判定段階が異なるため意図的に残す検査を名簿として区別し、統合後に二重保守がなくなった対象と残す根拠を記録すること（第22報告 I-004 の原則を適用）。
  - id: AG-009
    content: |-
      B3-5c（対処: G-003 第27報告）。agentdev-gh の操作一覧と入力検査の複数箇所管理を一元化する。
      対象は contracts.ts（操作名称配列と副作用分類表）、public-schema.ts（説明文の操作名列挙）、contracts.test.ts（20操作の固定一覧）、および specs-pr.ts・specs-release.ts・specs-issue.ts に分散した定型入力検査。
      受け入れ条件: 操作一覧と共通入力検査の正本が1箇所であることを確認する（操作の模擬追加で、正本1箇所の更新だけで全利用側に反映されること。実装内部の変更箇所の数は合格基準としない）。危険な操作が追加されないこと・操作種別・互換性の独立外部契約検査は現行のまま維持する。
  - id: AG-010
    content: |-
      B3-5d（対処: Y-001〜003 第10報告、E-001 第7報告、D-002 第37報告）。導入（install）と自己同期（self-sync）の共有判定をまとめる（同名15関数の重複解消を含む）。
      対象は scripts/install.ps1（26関数）と scripts/self-sync.ps1（21関数）の同名重複15件（うち完全一致5件: Test-Junction、Get-JunctionTarget、Resolve-SenpiTargetRel、Get-UnmanagedProjectionJunctionRels、Get-ThirdPartyDeclaredNames）。scripts/consumer/common.ps1 が共有定義モジュールの先例である。Issue #3605 は両入口の判定差（リンク先存在 vs 現行正本指し）の実害記録であり、ジャンクション正本判定・所有権判定など同じ規則で同じ結果を返す処理の単一化を最優先とする。
      受け入れ条件: 共通化後も配置方式の差異（ジャンクション・投影・配布除外）が現行どおり機能することを両入口の試験で証明すること。公開入口2本（REQ-050-001）と管理外資産保護は維持する。
  - id: AG-011
    content: |-
      B3-5e（対処: G-003 第29報告、H-001 第30報告）。ホスト間（OpenCode・Senpi）の重複を整理する。対象は agentdev-gh、agentdev-jev、第三者スキル取得（agentdev-third-party）の3系統の接続とする。
      共通処理（Tool engine への変換・入力検査・契約解釈）と、OpenCode・Senpi 固有の登録・権限・実行文脈・失敗処理を区別した上で、同等試験の共通判定部分は共通側へ移設し接続差の試験は各ホストに保持する。ホスト別ツール接続（plugin・registration の配線）の多重化を、共通正本を参照する配線へ整理する。現状は OpenCode と Senpi の agentdev-gh-tool/tests/four-combination.test.ts（各4件）・missing-capability.test.ts（各2件）が同等試験を独立保持する。J-001（ツール説明と試験条件の反復による更新漏れ実例）に注意する。
      受け入れ条件: 3系統それぞれについて、①公開契約が両ホストで同一に保たれること（現行の主要接続試験の水準を下げないこと）、②共通契約の検証とホスト固有の登録・権限・実行文脈・失敗処理の検証を区別して実施すること、③共通エンジンの試験と接続試験の目的の区別が文書化されること、④重複していた管理箇所が削減されること。実ホストでの実測は前提条件1により要求しない。
  - id: AG-012
    content: |-
      B3-6（対処: T-001 第32報告）。追跡 sidecar の対応宣言のうち機械導出できるもの（実装・試験ファイルの対応など）を導出化し、手動保守をなくなった分だけ縮小する。
      対象は traceability/ 配下の sidecar 76ファイル。個別実装・テスト・設計文書の REQ-... 参照が同じ変更で複数 sidecar 更新を要求する現状を、機械導出できる対応と人間が根拠を確認して付与すべき対応の区別によって解消する。対応宣言の存在を受け入れ証明としない原則（T-003、REQ-012-032）は維持する。policy.yaml の検証・設計・実装 optional 要件行の大量列挙（1,644件）は見送り（D-002）であり本 Case の対象外である。
      受け入れ条件: 導出と手動付与の境界が契約に明記されること。代表する変更（ファイル新設・改名）で、導入前に手動更新していた sidecar 行が導入後は不要になることと、引き続き手動が必要な行の種類を記録すること。
  - id: AG-013
    content: |-
      計画書§4 完遂判定の共通条件（C-ε の全作業項目に適用）。
      全作業項目が実施または見送りとして記録済みであること。試験は基線（C-α1 固定・基線報告55）に対して新規不合格0・既知不合格の悪化なし（意図的解消は許容）。B2/B3 統合は移行前後の対比で証明する（意図的出力変更を含む変更は合意変更仕様との一致と変更対象外の互換性）。簡素化効果の記録として、従来複数箇所更新が必要だった代表的変更が統合後は単一正本の更新と自動反映で成立し、新たな手動同期によって重複を再導入しないこと（依存数の削減は必須でない）。配布整合検査（trusted-distribution-gate）の最終合格。
  - id: AG-014
    content: |-
      試験基線と並行作業への配慮。本 Case の実装は main への並行コミットが入り得る環境で実施するため、書込み前に git pull --ff-only で同期する。並行5案件（C-δ case-close・#3989 終了・verify-logs 整理・checker 要件検討、および本 C-ε）の他統括の worktree・分岐・Issue・PR・.agentdev/close-acceptance/・本線の未追跡ファイルには触れない。既存 PR への追加コミットは append-only とし force-push しない。使用モデルは glm-5.3 / glm-5.3-flash に限定する。
  - id: AG-015
    content: |-
      対象外の明示。C-δ case-close 残務（QG-4・Design 確定・Capture 回収・Epic Wave クローズ）と C-ω、checker 分離 mode 別案件化（「正本と配置先を分ける mode」の別案件化。別セッションが調査中）、D-002（traceability policy.yaml の optional 要件行 1,644件の見送り扱い）、verify-logs 整理、#3989、C-β 完了時の利用者判断4件（checker 分離・verify-logs git 管理・Jev 観測3件不在・HKCU 環境変数）は本 Case の対象外である。これらへの変更を実施しない。
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-110.md
    target_area: "## 受け入れ条件対応"
    source_items: [AG-001]
    content: |-
      検証義務は完了報告の必須要素規則の単一の正本（工程駆動系の共通参照文書）が所有し、各 phase 系ワークフロースキル（agentdev-workflow-phase-artifacts-update、agentdev-workflow-phase-tasks-create、agentdev-workflow-phase-tasks-update、agentdev-workflow-phase-review、agentdev-workflow-phase-transition）と agentdev-phase-theme-collaboration、および対応する command 契約（src/common/commands/agentdev/phase-*.md）は対象範囲と呼出条件を保持して当該正本を参照することで本義務を満たす。対応関係は
  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: docs/requirements/REQ-110.md
    target_area: "## 受け入れ条件対応"
    source_items: [AG-001]
    content: |-
      検証義務は decision の役割と正本の優先度への参照規則の単一の正本（工程駆動系の共通参照文書）が所有し、各工程系コマンドおよびワークフロースキル（RU-0242 の対象と同一のファイル群）は対象範囲と呼出条件を保持して当該正本を参照することで本義務を満たす。対応関係は
  - id: ACT-REQ-003
    artifact: req
    operation: append
    target: docs/requirements/REQ-047.md
    target_area: "## 要件"
    source_items: [AG-003]
    content: |-
      | ID | 要件 |
      |---|---|
      | REQ-047-011 | integrity 規則を機械検査する checker の出力は、適用した規則の識別子（IR ID）を含み、出力から当該規則文書へ機械的に対応できること |
      | REQ-047-012 | integrity 規則文書は機械検査／文章のみの分類を保持すること。機械検査規則の文書には実装と試験の正確なパスを機械検査可能な形式で記載し、文章のみの規則にはその分類を明記して一律のパス記載を要求しないこと。機械可読な定義として記述したものは実行時の強制箇所が当該定義を消費すること（検出用ビューとして独立所有を同期条件で明示したものはこの限りでない） |
      | REQ-047-013 | 規則から実装・検証資産への対応の手動対応表は、規則文書への機械検査可能な記載と checker 出力の識別子による機械対応が成立する範囲へ縮小または廃止すること。縮小・廃止に伴う代替の管理表を新設しないこと |
  - id: ACT-REQ-004
    artifact: req
    operation: append
    target: docs/requirements/REQ-012.md
    target_area: "## 要件"
    source_items: [AG-012]
    content: |-
      | ID | 要件 |
      |---|---|
      | REQ-012-060 | sidecar の対応宣言のうち、正規成果物の配置と内容から機械導出できる対応（実装・試験ファイルの対応など）は、手動宣言に代えて導出によって宣言できること。導出対象と手動付与対象の境界は Design が所有すること |
      | REQ-012-061 | 導出による対応は、対応関係の存在だけを根拠に要件の実現または検証が成立したものと推定しない原則（REQ-012-032）と、検証対応要否のトレーサビリティポリシー所有（REQ-012-030、REQ-012-051）を維持すること。導出結果と手動宣言の重複・矛盾を決定的に検出できること |
  - id: ACT-DESIGN-001
    artifact: design
    operation: append
    target: docs/designs/workflows/workflow-skill-model.md
    target_area: "## artifact-contracts.md からの委譲"
    source_items: [AG-001, AG-002]
    content: |-
      ## 反復規則の共通参照化と参照形式（B2-1・B2-2）

      - 同一規則の文言が複数の command・Workflow Skill・Capability Skill に反復して配置される場合、規則本文の正本を1箇所へ集約できる。集約先は既存の公開契約面（対象ファイル群が参照可能な既存 Capability Skill の公開契約、または既存の共通参照文書）とし、新規の公開コマンド・正規成果物・管理機構を新設しない
      - 集約は名レベル参照契約（REQ-002-017、REQ-027-001）と両立する形式で行う。各ファイルは対象範囲と呼出条件と正本への名レベル参照のみを保持し、正本側の skill 内部構造（references 内部パス、見出し、Section 名）へ直接依存しない。正本の配置変更は公開契約の変更として扱う
      - 集約対象は反復実体（同一規則の文言複製）に限定し、各工程固有の対象範囲・呼出条件は各ファイルに残す。集約前後で各工程の報告・出力に含まれる要素が同一であることを対比で証明する
      - 集約後の参照経路は静的に機械確認する（Command→SKILL.md→references の連鎖）。参照形態が異なる場合は形態ごとに代表的な実行経路を展開して適用を検証し、全経路の通し試験は要求しない
      - 配布後の環境で正本が参照先として実際に読み込めること（相対パス解決・配布対象への同梱）を検証する
      - 障害対応知識（文字コード破壊・実行形態差等）は docs/knowledge/ を参照先とする条件付き参照へ整理でき、例外回復の規則は必要なときだけ参照される構造にできる。通常工程の常時手順が縮小しても障害時の回復手順へ到達できることを維持する
  - id: ACT-DESIGN-002
    artifact: design
    operation: append
    target: docs/designs/foundations/project-extensions.md
    target_area: "## yomiyasu 推敲の工程必須化"
    source_items: [AG-002]
    content: |-
      ### 工程拡張の文章品質・書込み規則の共通参照化（B2-2）

      - 7つの workflow 拡張（agentdev-workflow-case-auto、case-open、case-ready、case-revise、case-run、case-close、workflow-issue）の references に反復した文章品質規則（yomiyasu・guard 説明）の本文は、正を1箇所へ集約する。各拡張は呼出条件と正本への参照のみを保持する
      - 障害対応知識（Windows 文字コード破壊、Bun 実行形態差、標準出力消失、Git Bash パス変換、長時間処理起動、Worktree 環境差等）は docs/knowledge/ を参照先とする条件付き参照へ整理する。例外回復の規則も必要なときだけ参照される構造にする
      - guard 拒否後の回復は、worktree 運用指針の迂回禁止（許可された配置先への変更による回復は維持し、別の書込み手段で同じ作業領域外へ書き込む選択肢を案内しない）へ統一する。共通規則と各拡張・worktree 運用指針を照合し、拒否後の回復手順が一致することを確認する
      - 書込み規律の文面は、配布境界ガードと GitHub 書込みガードの実際の検出対象（検出器の実効範囲）と一致する。文書が規定する拒否対象・許可対象と実際の検出器の判定が代表例で一致することを確認する
      - yomiyasu 推敲の意味・数値・否定条件の保護（REQ-098-006）と書込み前検査の条件（REQ-053-025〜027）は削らない
  - id: ACT-DESIGN-003
    artifact: design
    operation: append
    target: docs/designs/integrity/integrity-rule-catalog.md
    target_area: "### IR 属性モデル（DEC-013 適用、retired REQ-028-009/010 から移管）"
    source_items: [AG-003]
    content: |-
      #### 機械検査／文章のみ分類と実装・試験パスの記載形式（B3-1）

      - IR 規則文書（rules/IR-NNN-*.md）は detection_method として機械検査／文章のみの分類を保持する。分類は全規則について先に確定し、未確定0件を記録した上で本契約を適用する
      - 機械検査に分類された規則の文書には、実装（checker）と試験（test）の正確なパスを機械検査可能な形式で記載する。パスの実在と、checker 出力に含まれる規則識別子（REQ-047-011）との一致を機械検査で確認できる
      - 文章のみに分類された規則には「文章のみ」分類を明記し、一律のパス記載を要求しない
      - 機械可読な定義として記述したものは、実行時の強制箇所が当該定義を消費する（検出用ビューとして独立所有を同期条件で明示したものはこの限りでない。agentdev-gh ローカル版 rules yaml と実行器の関係を含む。G-007 解消）
  - id: ACT-DESIGN-004
    artifact: design
    operation: append
    target: docs/designs/integrity/checker-execution-contracts.md
    target_area: "## checker 共通実行契約"
    source_items: [AG-003]
    content: |-
      - integrity 規則を機械検査する checker（check_integrity、専用検査器、lint 系検査を含む）の出力は、適用した規則の識別子（IR ID）を必ず含める。出力から当該規則文書（rules/IR-NNN-*.md）へ機械的に対応できることを checker 実行契約の一部とする（B3-1、REQ-047-011）
  - id: ACT-DESIGN-005
    artifact: design
    operation: append
    target: docs/designs/integrity/checker-execution-contracts.md
    target_area: "## data yaml 宣言的データ運用"
    source_items: [AG-005]
    content: |-
      - skill-projection-manifest.yaml は、正規情報源（src/common/skills/ のスキル配置）から機械導出された検出ビューとして再定義する（B3-3）。承認対象の独立期待値ではなく再計算できる検出ビューであることを契約に明記し、checker は配置からの導出結果と一覧の差分を厳格検出する。スキルの追加・削除・改名を行う代表的な変更で一覧が自動追随し手動更新を要しないことを確認し、初回の導出結果と現行一覧の差分は説明つきで処理する
  - id: ACT-DESIGN-006
    artifact: design
    operation: append
    target: docs/designs/integrity/rule-ownership.md
    target_area: "## 対象規則の所有権一方向化マトリクス（REQ-047）"
    source_items: [AG-003]
    content: |-
      ### 対応表の機械検証への移行（B3-1）

      - 一方向化マトリクスの実装詳細（checker）・検証資産（test）の列は、IR 規則文書への機械検査可能なパス記載と checker 出力の規則識別子から機械検証できる（REQ-047-011〜013）。規則追加・変更時に本マトリクスの手動同期を必要としない
      - req-impact-map.md の逆方向対応（REQ から規則への対応）は、IR 文書の frontmatter（Related REQ）から AUTOGEN で導出する（「IR 別関連マッピング（自動生成）」と同一の生成経路）。新規 IR 追加時の対応表手動同期義務を廃止する
      - ルールドメイン一覧は意味グルーピングの案内として残置でき、規則追加ごとの同期対象からは除外する
      - 対応表の縮小・廃止に伴う代替の管理表を新設しない。既存の generate_indexes.ts と IR frontmatter スキーマの拡張で対応する
  - id: ACT-DESIGN-007
    artifact: design
    operation: append
    target: docs/designs/local/runtime-package-boundary.md
    target_area: "### repo-local Plugin の配布・投影契約"
    source_items: [AG-004]
    content: |-
      - 配布除外規則（リポジトリ専用 Plugin 等、配布対象から除外する資産の定義）の正本を1箇所に定め、各入口（scripts/install.ps1、scripts/self-sync.ps1、release archive 生成・導入）は当該正本の参照・導出によって除外集合を決定する（B3-2）。各入口が同一の除外集合に単一導出で一致することを検証する
      - 検査側（trusted-distribution-gate 等）の配布対象期待値は、正本とは独立に定義された監査期待値として区別する。実際に配布する処理、配布されるべき集合を独立監査する処理、信頼起点として改ざんを防ぐ処理を混同しない。独立検査の期待値を正本と同じ定義から機械的に導出すると誤った正規集合を検査が追認する危があるため、監査期待値の独立性を設計上明示する
      - 自己同期（self-sync）は自己環境投影のために意図的に除外しない資産がある例外入口として維持し、当該差異が配置検査で意図的差異として扱われることを維持する
  - id: ACT-DESIGN-008
    artifact: design
    operation: append
    target: docs/designs/local/runtime-package-boundary.md
    target_area: "## 導入方式ポリシー（Installation Method Policy）"
    source_items: [AG-010]
    content: |-
      - scripts/install.ps1 と scripts/self-sync.ps1 が共有する判定（ジャンクション正本判定、所有権判定、管理外投影の判定、第三者スキル宣言の解決等）は、単一の共有定義から両入口が参照する構成にまとめる（B3-5d）。同名重複関数（15件）を解消し、同じ規則に対して両入口が同じ結果を返すことを1箇所で管理する。共有定義モジュールの先例（scripts/consumer/common.ps1）に従う
      - 共通化後も配置方式の差異（ジャンクション・投影・配布除外）が現行どおり機能することを、両入口の試験で証明する。公開入口2本（REQ-050-001）と管理外資産保護は維持する
  - id: ACT-DESIGN-009
    artifact: design
    operation: append
    target: docs/designs/foundations/decision-lifecycle.md
    target_area: "## Decision 関係モデル"
    source_items: [AG-006]
    content: |-
      ### 部分置換関係の表記と到達（B3-4）

      - ある Decision の一部条項が後続 Decision によって置換され、他の条項が現行有効のまま残る関係（部分置換）を、対象となる関係全件について確定した上で表記する。確定時点の既知対象は DEC-041（一部判断が DEC-051 で置換）および docs/README.md Decision 表の注記から判明する候補群（DEC-028・DEC-036・DEC-044・DEC-045 等）とし、全件確定の結果を固定して記録する
      - 部分置換された旧条項から現行の有効条項へ、相互参照で到達できるようにする。旧 Decision を読んだ実行主体が、置換後の現行条項へ到達できることを参照追跡で確認する
  - id: ACT-DESIGN-010
    artifact: design
    operation: append
    target: docs/designs/integrity/distribution-boundary.md
    target_area: "## 共有 detector と adapter の契約"
    source_items: [AG-007]
    content: |-
      - ガード間（textlint 書込み前 guard と配布境界ガード等）で重複する編集意味論の解析・再構成部（write/edit/apply_patch の引数解析と完成予定全文の再構成）は、共通部として1箇所で管理する（B3-5a）。各ガードは固有の拒否条件のみを所有する
      - 共通部の試験は1箇所で管理し、各ガードの拒否条件の試験は現行のまま各ガードが保持する。解析不能・検査不能を許可へ変えない保証は双方のガードで維持する
  - id: ACT-DESIGN-011
    artifact: design
    operation: append
    target: docs/designs/integrity/validator-split-criteria.md
    target_area: "## validator の責務境界"
    source_items: [AG-008]
    content: |-
      - Workflow Skill 構造検査（「単独起動」禁止等）の正本を1箇所に寄せ、check_workflow_preventive.ts と lint_skills.ts が独立保持する同一検査の重複を解消する（B3-5b）。大規模検査器（check_integrity）と専用検査器の責務境界を確定する
      - 統合対象として削除する検査と、判定段階が異なるため意図的に残す検査を名簿として区別し、残す根拠を記録する
  - id: ACT-DESIGN-012
    artifact: design
    operation: append
    target: docs/designs/responsibilities/custom-tool-contracts.md
    target_area: "## 対象操作の境界（初期セット）"
    source_items: [AG-009, AG-003]
    content: |-
      - agentdev-gh の操作一覧と定型入力検査の複数箇所管理（contracts.ts の名称配列と副作用分類、public-schema.ts の説明文列挙、specs-pr.ts・specs-release.ts・specs-issue.ts の定型入力検査）を、単一の正本へ一元化する（B3-5c）。操作の模擬追加で、正本1箇所の更新だけで全利用側へ反映されることを確認する。実装内部の変更箇所の数は合格基準としない
      - 危険な操作が追加されないこと・操作種別・互換性の独立外部契約検査は現行のまま維持する
      - ローカル版 rules yaml（frontmatter・headings・labels・status）は操作用スキーマの記述にとどまらず、実行器が実行時に消費する機械可読定義として運用する（機械可読定義の記述と実行時の強制箇所の分離の解消、G-007）
  - id: ACT-DESIGN-013
    artifact: design
    operation: append
    target: docs/designs/foundations/multi-host-canonical-model.md
    target_area: "## バックエンド×ホスト接続構成"
    source_items: [AG-011]
    content: |-
      - agentdev-gh、agentdev-jev、agentdev-third-party の3系統のホスト間接続について、共通処理（Tool engine への変換、入力検査、契約解釈）とホスト固有処理（OpenCode・Senpi 各自の登録、権限、実行文脈、失敗処理）を区別する（B3-5e）。共通処理は共通原本領域が所有し、ホスト固有処理は各ホスト接続領域が所有する
      - 同等試験の共通判定部分は共通側へ移設し、接続差の試験は各ホストが保持する。公開契約が両ホストで同一に保たれること（現行の主要接続試験の水準を下げないこと）、共通契約の検証とホスト固有の検証の区別、共通エンジンの試験と接続試験の目的の区別の文書化、重複していた管理箇所の削減を確認する。実ホストでの実測は要求しない（実施計画の前提条件1）
  - id: ACT-DESIGN-014
    artifact: design
    operation: append
    target: docs/designs/foundations/v4-traceability-model.md
    target_area: "## 永続情報と導出可能情報の分離"
    source_items: [AG-012]
    content: |-
      - traceability sidecar の対応宣言のうち、正規成果物の配置と内容から機械導出できる対応（実装・試験ファイルの対応等）は導出によって宣言でき、手動保守をなくなった分だけ縮小する（B3-6、REQ-012-060/061）。導出対象と手動付与対象（人間が根拠を確認して付与すべき対応）の境界は本分離契約の一部として明記する
      - 対応宣言の存在を受け入れ証明としない原則（T-003、REQ-012-032）は維持する。代表する変更（ファイル新設・改名）で、導入前に手動更新していた sidecar 行が導入後は不要になることと、引き続き手動が必要な行の種類を記録する
conflict_resolutions:
  - id: CR-001
    conflict: |-
      REQ-110-037「新しい公開コマンド・台帳・報告様式を追加しない」と REQ-110-039「新しい文書・管理機構を追加しない」は、B2-1 の共通参照文書への集約（規則の正本の新設）と衝突するように読める
    resolution: |-
      集約先を「新規の公開コマンド・正規成果物・管理機構の新設」としない既存の公開契約面（対象ファイル群が参照可能な既存 Capability Skill の公開契約、または既存の共通参照文書）へ限定して解消する。REQ-110-037/039 が禁じるのは報告様式・台帳・管理機構の増設であり、既存契約面への正本集約は各ファイルからの参照への置換であるため要件行の意味は維持される。要件行本文の変更は不要
  - id: CR-002
    conflict: |-
      集約によって各ファイルが正本の特定セクションを直接参照すると、名レベル参照契約（REQ-002-017: skill は名レベルで参照し references 内部パスへ直接依存しない、REQ-027-001）と衝突する可能性がある
    resolution: |-
      集約は「正本を既存 Capability Skill の公開契約面または既存共通参照文書へ置き、各ファイルは対象範囲と呼出条件と正本への名レベル参照のみを保持する」形式で行うことで両立する。正本側の skill 内部構造（references 内部パス・見出し・Section 名）への直接依存は禁止を維持し、正本の配置変更は公開契約の変更として扱う。workflow-skill-model.md「Capability Skill の参照契約（過剰共通 reference 化の回避）」と整合するため REQ-002 の改訂は不要。ACT-DESIGN-001 に契約として明記する
  - id: CR-003
    conflict: |-
      B3-1 の着手条件「対応表（rule-ownership）の二重管理が実際に縮小できる見通しを Case 設計で示せること。示せない場合は見送りにせず評価結果を報告して実施・見送りを再承認する」の判定が必要である
    resolution: |-
      見通しは示せると評価し、B3-1 をスコープに含める。根拠: ①rule-ownership.md の「IR 別関連マッピング（自動生成）」は IR frontmatter（Related REQ/Design）から generate_indexes.ts が自動生成しており、req-impact-map.md の逆方向対応も同一経路で AUTOGEN 導出できる実績がある ②一方向化マトリクスの実装・検証資産列は、IR 文書の detection_method への機械検査可能なパス記載と checker 出力の IR ID（REQ-047-011）から機械検証できる ③「どの規則が機械検査されるか」は checker 出力から機械確定できる。これにより規則追加時の手動同期（真の二重管理負担: req-impact-map の手動同期義務とマトリクス手動更新）が解消し、ルールドメイン一覧（41行）は意味グルーピングの案内として残るが規則追加ごとの同期対象から除外される。代替管理表は不要（既存 generate_indexes.ts と IR frontmatter スキーマの拡張で対応）。この評価結果を AG-003 と ACT-DESIGN-006 に記録する
operation_units:
  - ou_id: OU-001
    target_req: REQ-110
    operation: update
    scale: standard
    depends_on: [OU-004]
    recommended_order: 2
    issue_policy: single
  - ou_id: OU-002
    target_req: REQ-047
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
  - ou_id: OU-003
    target_req: REQ-012
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
  - ou_id: OU-004
    target_design: docs/designs/workflows/workflow-skill-model.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
  - ou_id: OU-005
    target_design: docs/designs/foundations/project-extensions.md
    operation: append
    scale: standard
    depends_on: [OU-004]
    recommended_order: 2
    issue_policy: single
  - ou_id: OU-006
    target_design: docs/designs/integrity/integrity-rule-catalog.md
    operation: append
    scale: standard
    depends_on: [OU-002]
    recommended_order: 2
    issue_policy: single
  - ou_id: OU-007
    target_design: docs/designs/integrity/checker-execution-contracts.md
    operation: append
    scale: standard
    depends_on: [OU-002, OU-008]
    recommended_order: 3
    issue_policy: single
  - ou_id: OU-008
    target_design: docs/designs/integrity/rule-ownership.md
    operation: append
    scale: standard
    depends_on: [OU-002]
    recommended_order: 2
    issue_policy: single
  - ou_id: OU-009
    target_design: docs/designs/local/runtime-package-boundary.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
  - ou_id: OU-010
    target_design: docs/designs/foundations/decision-lifecycle.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
  - ou_id: OU-011
    target_design: docs/designs/integrity/distribution-boundary.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
  - ou_id: OU-012
    target_design: docs/designs/integrity/validator-split-criteria.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
  - ou_id: OU-013
    target_design: docs/designs/responsibilities/custom-tool-contracts.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
  - ou_id: OU-014
    target_design: docs/designs/foundations/multi-host-canonical-model.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
  - ou_id: OU-015
    target_design: docs/designs/foundations/v4-traceability-model.md
    operation: append
    scale: standard
    depends_on: [OU-003]
    recommended_order: 3
    issue_policy: single
result: {}
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      B2-1 実装完了後、11工程駆動ファイル（公開 Command 5・Workflow Skill 5・Capability Skill 1）と対象となった公開 Command 側重複（case-auto・inspect-docs・inspect-skills・intake-promote・learning-promote・inspect-promote・case-open references）について、共通報告・Decision・自律確定規則の本文が単一正本のみに存在し各ファイルが対象範囲・呼出条件・名レベル参照のみを保持することを静的検索で確認する。参照経路（Command→SKILL.md→references の連鎖）を機械確認し、参照形態ごとに代表的な実行経路を展開して適用を検証する（全工程の通し試験は不要）。REQ-110 の TS-011・TS-012 改訂行と traceability sidecar の整合を確認する
    pass_criteria: |
      反復実体が正本1箇所に集約され、集約前後で各工程の報告に含まれる要素が同一であること（対比証明）。11工程の静的参照経路の機械確認が全件成立すること。参照形態別の代表実行経路で正本参照が機能すること。要件行・traceability sidecar 整合。textlint・整合性検査（check_integrity 等の関連 checker）合格
    on_failure: |
      fix-and-reverify。参照形態別の適用検証で不正が見つかった場合は集約形式（正本の配置・参照の書き方）を修正して再検証する。REQ 行との不整合は要件改訂の意味を変えない範囲で修正する
  - id: TS-002
    target_item: AG-002
    verification: |
      B2-2 実装完了後、7工程拡張の references について文章品質規則（yomiyasu・guard 説明）の本文が正1箇所へ集約され各拡張が呼出条件と参照のみを保持することを静的検索で確認する。guard 拒否後の回復手順について、共通規則・7拡張・worktree 運用指針を照合して一致することを確認する（許可された配置先への変更による回復は維持）。書込み規律の文書が規定する拒否対象・許可対象と配布境界ガード・GitHub 書込みガードの実際の判定が代表例で一致することを確認する。docs/knowledge/ 参照が配布後環境で解決すること（相対パス・配布対象同梱）を配布検査で確認する。REQ-098-006 と REQ-053-025〜027 の保護条件が残存することを確認する
    pass_criteria: |
      拡張7件の呼出条件が正しく1箇所を参照すること。guard 拒否時の迂回禁止・代替書込み規則の維持。拒否後の回復手順の一致。検出器判定と文書の拒否・許可対象の代表例一致。配布後環境で共通文書が実際に読めること。通常工程の常時手順が縮小しても障害時の回復手順に到達できること
    on_failure: |
      fix-and-reverify。回復手順の不一致は共通規則（worktree 運用指針の迂回禁止）へ統一する方向で修正する。検出器実効範囲と文面の不一致は文面を実効範囲に一致させる
  - id: TS-003
    target_item: AG-003
    verification: |
      B3-1 実装完了後、65規則（docs/designs/integrity/rules/IR-*.md）の機械検査／文章のみ分類を機械的に抽出し、分類が残っている規則が0件であることを記録する。機械検査規則について実装・試験パスの実在と checker 出力識別子との一致を全件機械確認する。代表 checker の出力に IR ID が含まれることを実行で確認する。agentdev-gh ローカル版 rules yaml が実行時に消費されていること（または同期条件で明示された例外であること）を確認する。rule-ownership.md の手動対応表が縮小され、代替管理表が新設されていないことを確認する
    pass_criteria: |
      出力→規則文書の機械対応が成立すること。65規則の分類の未確定0件の記録。機械検査規則の実装・試験パスと出力識別子の全件一致。G-007 の解消（機械可読定義と実行時強制箇所の分離解消）。手動対応表の縮小または廃止と代替管理表不設置
    on_failure: |
      fix-and-reverify。分類の残存規則は個別に判定して分類を確定する。パス不一致は文書または checker 出力を修正する
  - id: TS-004
    target_item: AG-004
    verification: |
      B3-2 実装完了後、配布除外の正本が1箇所に定まり scripts/install.ps1・scripts/consumer/archive/install.ps1・scripts/self/release/package-release-archive.ps1 が参照・導出していることを確認する。checkout 消費・自己同期・書庫作成・書庫導入の各入口で配布対象集合と repo-local 除外の一致を確認する。検査側の監査期待値が正本と独立に定義されていることを確認する
    pass_criteria: |
      各入口の除外集合が単一導出で一致すること。自己同期の意図的差異が維持されること。監査期待値の独立性が設計上明示されていること
    on_failure: |
      fix-and-reverify。入口間の不一致は正本への参照化を修正する。独立検査の期待値を正本導出に寄せてしまった場合は独立定義へ戻す
  - id: TS-005
    target_item: AG-005
    verification: |
      B3-3 実装完了後、data/skill-projection-manifest.yaml が src/common/skills/ の配置から機械導出されることを確認する。検出用の一覧について、スキル追加・削除の代表的な変更（検査環境で模擬）で一覧が自動追随し手動更新を要しないことを確認する。初回導出結果と現行一覧の差分が説明つきで処理されていることを確認する
    pass_criteria: |
      代表変更で一覧が自動追随すること。初回差分の説明つき処理。checker が配置と一覧の差分を厳格検出すること
    on_failure: |
      fix-and-reverify。導出の取りこぼしは導出規則を修正する
  - id: TS-006
    target_item: AG-006
    verification: |
      B3-4 実装完了後、部分置換関係の全件確定結果（DEC-041/051 および全件確定で固定した対象群）を記録し、各旧条項から現行有効条項への相互参照を設置する。旧 Decision の条項から置換後の現行条項へ到達できることを参照追跡（リンク辿りの機械確認）で確認する
    pass_criteria: |
      対象全件について相互参照で到達できること。全件確定の結果が固定され記録されていること
    on_failure: |
      fix-and-reverify。到達不能な経路は相互参照を追加する
  - id: TS-007
    target_item: AG-007
    verification: |
      B3-5a 実装完了後、編集意味論の解析・再構成部が共通部として1箇所で管理され、各ガードが固有の拒否条件のみを保持することを確認する。共通部の試験が1箇所で管理されていること、各ガードの拒否条件の試験が現行のまま残っていることを確認する。解析不能・検査不能を許可へ変えない保証が双方で維持されていることを試験で確認する
    pass_criteria: |
      共通部試験の1箇所管理。各ガード拒否条件試験の現行維持。検査不能を許可に変えない保証の双方維持
    on_failure: |
      fix-and-reverify。共通化で拒否条件が弱まった場合は拒否条件を各ガードへ戻す
  - id: TS-008
    target_item: AG-008
    verification: |
      B3-5b 実装完了後、Workflow Skill 構造検査の正本が1箇所であることを確認する。削除した検査と意図的に残す検査の名簿と残す根拠の記録を確認する。統合後に二重保守がなくなった対象を確認する
    pass_criteria: |
      構造検査正本の1箇所化。名簿による区別と根拠記録。大規模検査器と専用検査器の責務境界の確定
    on_failure: |
      fix-and-reverify。削除対象の誤りは該当検査を復帰し名簿を更新する
  - id: TS-009
    target_item: AG-009
    verification: |
      B3-5c 実装完了後、agentdev-gh の操作一覧と共通入力検査の正本が1箇所であることを確認する。操作の模擬追加（検査用のダミー操作定義）で正本1箇所の更新だけで全利用側（contracts・public-schema・各 specs）へ反映されることを確認する。独立外部契約検査（危険操作不追加・操作種別・互換性）が現行のまま維持されていることを確認する
    pass_criteria: |
      操作一覧・入力検査の正本1箇所。模擬追加での全利用側反映。外部契約検査の維持
    on_failure: |
      fix-and-reverify。反映漏れは利用側の参照化を修正する
  - id: TS-010
    target_item: AG-010
    verification: |
      B3-5d 実装完了後、install.ps1 と self-sync.ps1 の共有判定が単一の共有定義から参照されていることを確認する（同名15関数の重複解消）。両入口の試験で配置方式の差異（ジャンクション・投影・配布除外）が現行どおり機能することを証明する。公開入口2本と管理外資産保護の維持を確認する
    pass_criteria: |
      共有判定の単一化。配置方式差異の両入口試験合格。公開入口2本・管理外資産保護の維持
    on_failure: |
      fix-and-reverify。入口間の判定差は共有定義へ統一する
  - id: TS-011
    target_item: AG-011
    verification: |
      B3-5e 実装完了後、agentdev-gh・agentdev-jev・agentdev-third-party の3系統それぞれについて、公開契約が両ホストで同一に保たれていることを現行主要接続試験の水準で確認する。共通契約の検証とホスト固有の登録・権限・実行文脈・失敗処理の検証が区別して実施されていることを確認する。共通エンジンの試験と接続試験の目的の区別が文書化されていること、重複していた管理箇所が削減されていることを確認する
    pass_criteria: |
      3系統それぞれで①公開契約の両ホスト同一（現行試験水準維持）②共通/ホスト固有検証の区別実施 ③目的区別の文書化 ④重複管理箇所の削減。実ホスト実測は要求しない
    on_failure: |
      fix-and-reverify。接続試験の水準低下は各ホスト試験を復元する
  - id: TS-012
    target_item: AG-012
    verification: |
      B3-6 実装完了後、sidecar の機械導出可能な対応が導出化され、導出と手動付与の境界が Design（v4-traceability-model）に明記されていることを確認する。代表する変更（ファイル新設・改名を検査環境で模擬）で、導入前に手動更新していた sidecar 行が不要になることと、引き続き手動が必要な行の種類の記録を確認する。導出結果と手動宣言の重複・矛盾の決定的検出を確認する
    pass_criteria: |
      導出化による手動保守の縮小。境界の契約明記。代表変更での自動追随と手動必要行の記録。T-003 原則の維持
    on_failure: |
      fix-and-reverify。導出の誤検出は導出規則を修正する
  - id: TS-013
    target_item: AG-013
    verification: |
      C-ε 全作業項目の完了時に、計画書§4 の完遂判定を順に確認する。B2/B3 の各統合について移行前後の対比証明（意図的出力変更を含む変更は合意変更仕様との一致と変更対象外の互換性）を記録する。簡素化効果として、従来複数箇所更新が必要だった代表的変更（B2-1: 完了報告規則の変更、B2-2: 文章品質規則の変更、B3-1: 規則追加、B3-6: ファイル改名等）が統合後に単一正本の更新と自動反映で成立することを確認する
    pass_criteria: |
      全作業項目が実施または見送りとして記録済み。移行前後対比の成立。簡素化効果の記録（新たな手動同期による重複の再導入なし。依存数削減は必須でない）
    on_failure: |
      fix-and-reverify。対比証明の不備は証明方法を補って再実施する
  - id: TS-014
    target_item: AG-013
    verification: |
      C-ε の実装完了時に、基線（C-α1 固定・基線報告55）に対して試験全体を実行し、新規不合格0・既知不合格の悪化なしを確認する。意図的に解消した不合格は解消理由とともに記録する
    pass_criteria: |
      新規不合格0件。既知不合格の悪化なし（意図的解消は許容）
    on_failure: |
      fix-and-reverify。新規不合格は実装を修正して再検証する。基線側起因の場合は原因を記録する
  - id: TS-015
    target_item: AG-014
    verification: |
      各実装作業の前に git pull --ff-only による同期を行った記録と、作業対象の変更が本 Case のスコープ（docs/・scripts/・src/ の対象ファイルと本 Case の PR ブランチ）に限定されていることを git 操作記録・diff 範囲で確認する
    pass_criteria: |
      他統括の worktree・分岐・Issue・PR・.agentdev/close-acceptance/・本線未追跡ファイルへの変更なし。既存 PR への追加コミットは append-only。force-push なし
    on_failure: |
      fix-and-reverify。誤って触れた場合は対象外資産を元に戻し、影響を記録する
  - id: TS-016
    target_item: AG-015
    verification: |
      本 Case の全変更について、対象外領域（C-δ case-close 残務・C-ω・checker 分離 mode 別案件・D-002・verify-logs 整理・#3989・C-β 完了時の利用者判断4件）への変更が含まれていないことを、変更ファイル一覧と diff のレビューで確認する
    pass_criteria: |
      対象外領域への変更が0件であること。traceability policy.yaml の optional 要件行（1,644件）が未変更であること
    on_failure: |
      fix-and-reverify。対象外変更が混入した場合は当該変更を取り除いて再確認する
  - id: TS-017
    target_item: AG-013
    verification: |
      C-ε の実装完了時に、配布整合検査（trusted-distribution-gate）を実行する
    pass_criteria: |
      配布整合検査の最終合格
    on_failure: |
      fix-and-reverify。配布対象・除外の不整合は正本と各入口の参照化を修正する
realization_actions:
  - id: RA-001
    concern: B2-1 共通報告・Decision 規則の集約実装
    responsibility: 工程駆動11ファイルと対象公開 Command の反復規則本文を、単一正本（既存 Capability Skill の公開契約面または既存共通参照文書）へ集約し、各ファイルを対象範囲・呼出条件・名レベル参照へ置換する
    ownership_hints:
      - "src/common/commands/agentdev/phase-tasks-create.md, phase-tasks-update.md, phase-artifacts-update.md, phase-review.md, phase-transition.md"
      - "src/common/skills/agentdev-workflow-phase-*/SKILL.md"
      - "src/common/skills/agentdev-phase-theme-collaboration/SKILL.md"
      - "src/common/commands/agentdev/case-auto.md（内部工程制御重複）, inspect-docs.md, inspect-skills.md, intake-promote.md, learning-promote.md, inspect-promote.md"
      - "src/common/skills/agentdev-workflow-case-open/references/handoff.md, root-case-and-definition-package.md"
      - "集約先候補: agentdev-workflow-lifecycle または agentdev-workflow-templates の公開契約面（Case 設計で確定）"
    intent: 反復実体（Issue #3831・#3832 由来の同一文言）を正本1箇所へ集約し、規則変更の単一更新を可能にする。REQ-110 TS-011・TS-012 の改訂（ACT-REQ-001/002）と合わせて要件と実装の一致を保つ
    verification_refs: [TS-001]
    source_items: [AG-001]
  - id: RA-002
    concern: B2-2 文章品質規則の集約と障害対応知識の条件付き参照化
    responsibility: 7工程拡張の references に反復した yomiyasu・guard 規則本文を正1箇所へ集約し、docs/knowledge/ を条件付き参照へ整理し、guard 拒否後の回復手順を worktree 運用指針の迂回禁止へ統一する。書込み規律の文面を検出器の実効範囲へ一致させる
    ownership_hints:
      - "src/common/skills/agentdev-workflow-{case-auto,case-open,case-ready,case-revise,case-run,case-close,workflow-issue}/references/*"
      - "docs/knowledge/（PowerShell 文字化け・Bun 実行形態差・標準出力消失・Git Bash パス変換・長時間処理起動・Worktree 環境差）"
      - "src/common/skills/agentdev-git-worktree/references/worktree-operations.md（迂回禁止の共通規則）"
      - "src/opencode/plugins/agentdev-textlint-guard/（書込み規律の文面）"
    intent: 7拡張の反復（case-auto 拡張は約5.7KB）を解消し、第5報告 C-001 の実行時指示矛盾（guard 拒否後の迂回案内）を解消する。意味・数値・否定条件の保護と書込み前検査は削らない
    verification_refs: [TS-002]
    source_items: [AG-002]
  - id: RA-003
    concern: B3-1 checker 出力の IR ID 包含と規則分類・パス記載・対応表縮小の実装
    responsibility: checker 群（check_integrity・専用検査器・lint 系）の出力へ IR ID を包含させ、65規則の分類と機械検査規則の実装・試験パス記載形式を確立し、rule-ownership 手動対応表と req-impact-map の手動同期を機械検証・AUTOGEN 導出へ移行する。agentdev-gh ローカル版 rules yaml を実行時消費へ切り替える
    ownership_hints:
      - "scripts/src/check_integrity.ts ほか各 checker・lint スクリプト"
      - "docs/designs/integrity/rules/IR-*.md（65件、detection_method・frontmatter スキーマ拡張）"
      - "docs/designs/integrity/rule-ownership.md, docs/designs/responsibilities/req-impact-map.md"
      - "scripts/src/generate_indexes.ts（AUTOGEN 導出の実績資産）"
      - "src/common/skills/agentdev-gh-tool/（local rules yaml と runner-local.ts）"
    intent: 規則から実装への対応の唯一の案内が手動対応表である現状を、checker 出力識別子と IR 文書の機械検査可能記載へ置き換え、規則追加時の手動同期を解消する（CR-003 の見通しを実装で成立させる）
    verification_refs: [TS-003]
    source_items: [AG-003]
  - id: RA-004
    concern: B3-2 配布除外規則の正本1箇所化
    responsibility: 配布除外定義を1箇所の正本へまとめ、install・release archive 生成・導入の各入口を参照・導出へ置き換える。検査側の監査期待値は独立定義として明示的に区別する
    ownership_hints:
      - "scripts/install.ps1, scripts/consumer/archive/install.ps1, scripts/self/release/package-release-archive.ps1"
      - "scripts/self-sync.ps1（例外入口として維持）"
      - "scripts/src/trusted-distribution-gate/manifest.ts（RUNTIME_PREFIXES・BOOTSTRAP_PATHS・配置写像の独立監査期待値）"
    intent: 3経路の手動同期を単一導出へ解消する。独立検査の期待値を正本導出に寄せないことで誤った正規集合の追認を防ぐ
    verification_refs: [TS-004]
    source_items: [AG-004]
  - id: RA-005
    concern: B3-3 検出用スキル一覧の機械導出化
    responsibility: data/skill-projection-manifest.yaml を src/common/skills/ 配置から機械導出される検出ビューへ再定義し、導出処理と差分厳格検査を実装する
    ownership_hints:
      - "data/skill-projection-manifest.yaml"
      - "scripts/src/generate_indexes.ts（導出処理の拡張箇所）"
      - "docs/designs/integrity/checker-execution-contracts.md（data yaml 宣言的データ運用）"
    intent: スキル追加・削除・改名時の同一 PR 手動更新要求を自動追随へ置き換える。宣言的データ運用原則（yaml は検出用ビュー）に従う
    verification_refs: [TS-005]
    source_items: [AG-005]
  - id: RA-006
    concern: B3-4 Decision 部分置換関係の相互参照実装
    responsibility: 部分置換関係を全件確定（DEC-041/051 + 候補群 DEC-028/036/044/045 等の調査確定）し、各旧条項から現行有効条項への相互参照を Decision 文書へ設置する
    ownership_hints:
      - "docs/decisions/DEC-041.md, DEC-051.md, DEC-028.md, DEC-036.md, DEC-044.md, DEC-045.md ほか全件確定対象"
      - "docs/README.md（Decision 表の注記）"
      - "docs/designs/foundations/decision-lifecycle.md（関係モデル）"
    intent: 部分置換された旧決定を現役規範として誤採用するリスクを相互参照到達で解消する
    verification_refs: [TS-006]
    source_items: [AG-006]
  - id: RA-007
    concern: B3-5a ガード間編集意味論の共通部切り出し
    responsibility: textlint guard の reconstruct.ts と配布境界 guard の parser・reconstruction から編集意味論の解析・再構成部を共通 lib へ切り出し、各ガードは拒否条件のみを保持する
    ownership_hints:
      - "src/opencode/plugins/agentdev-textlint-guard/lib/reconstruct.ts"
      - "src/common/guards/distribution-boundary/distribution-boundary-guard-parser.ts, distribution-boundary-reconstruction.ts"
      - "共通 lib の配置先（src/common/guards/ 共通部または同等）は Case 設計で確定"
    intent: 同一の編集操作解析の二重実装を解消する。解析不能・検査不能を許可へ変えない保証は双方で維持する
    verification_refs: [TS-007]
    source_items: [AG-007]
  - id: RA-008
    concern: B3-5b Workflow Skill 構造検査の正本化
    responsibility: check_workflow_preventive.ts と lint_skills.ts の同一検査重複を解消し、構造検査の正本を1箇所へ寄せる。削除対象と意図的に残す検査の名簿と根拠を作成する
    ownership_hints:
      - "scripts/src/check_workflow_preventive.ts（WORKFLOW_TRIGGER_ITEM 関連）"
      - "scripts/src/lint_skills.ts（モジュール読込時 main() 実行の事情を含む）"
      - "scripts/src/check_integrity.ts（約12,066行・大規模検査器）, check_design_frontmatter.ts, check_skill_rename_symmetry.ts"
      - "docs/designs/integrity/validator-split-criteria.md"
    intent: 同一 Workflow Skill 検査の独立保持を解消し、判定段階が異なる検査は名簿で区別して残す
    verification_refs: [TS-008]
    source_items: [AG-008]
  - id: RA-009
    concern: B3-5c agentdev-gh 操作一覧・入力検査の一元化
    responsibility: contracts.ts・public-schema.ts・contracts.test.ts・specs-pr/release/issue.ts に分散した操作一覧と定型入力検査を単一正本へ一元化する。ローカル版 rules yaml を実行器が実行時に消費する機械可読定義へ運用変更する
    ownership_hints:
      - "src/common/skills/agentdev-gh-tool/src/contracts.ts, public-schema.ts"
      - "src/common/skills/agentdev-gh-tool/tests/contracts.test.ts, specs-pr.ts, specs-release.ts, specs-issue.ts"
      - "agentdev-gh local rules/{frontmatter,headings,labels,status}.yaml と runner-local.ts"
      - "docs/designs/responsibilities/custom-tool-contracts.md"
    intent: 操作追加時の複数箇所更新を正本1箇所へ解消する。独立外部契約検査（危険操作不追加・操作種別・互換性）は維持する
    verification_refs: [TS-009]
    source_items: [AG-009]
  - id: RA-010
    concern: B3-5d install/self-sync 共有判定の単一化
    responsibility: install.ps1 と self-sync.ps1 の同名重複15関数を含む共有判定を単一の共有定義モジュール（common.ps1 先例に従う）へまとめ、両入口を参照化する
    ownership_hints:
      - "scripts/install.ps1（26関数）, scripts/self-sync.ps1（21関数）"
      - "scripts/consumer/common.ps1（共有定義モジュールの先例）"
      - "docs/designs/local/runtime-package-boundary.md"
    intent: 同じ規則に対して両入口が同じ結果を返すことを1箇所で管理し、Issue #3605 型の判定差を解消する
    verification_refs: [TS-010]
    source_items: [AG-010]
  - id: RA-011
    concern: B3-5e ホスト間（OpenCode・Senpi）接続重複の整理
    responsibility: agentdev-gh・agentdev-jev・agentdev-third-party の3系統について共通処理（Tool engine 変換・入力検査・契約解釈）とホスト固有処理（登録・権限・実行文脈・失敗処理）を区別し、同等試験の共通判定部分を共通側へ移設する
    ownership_hints:
      - "OpenCode/Senpi 各 agentdev-gh-tool/tests/four-combination.test.ts（各4件）・missing-capability.test.ts（各2件）"
      - "agentdev-jev・agentdev-third-party の各ホスト接続資産"
      - "docs/designs/foundations/multi-host-canonical-model.md"
    intent: 同等試験の独立保持と配線の多重化を解消する。実ホスト実測は要求しない（前提条件1）
    verification_refs: [TS-011]
    source_items: [AG-011]
  - id: RA-012
    concern: B3-6 traceability sidecar 対応宣言の導出化
    responsibility: sidecar の対応宣言のうち機械導出可能な対応（実装・試験ファイル対応等）の導出処理を実装し、導出と手動付与の境界を v4-traceability-model Design に明記する。導出結果と手動宣言の重複・矛盾の決定的検出を実装する
    ownership_hints:
      - "docs/designs/traceability/ sidecar 76ファイルと生成・検証スクリプト"
      - "docs/designs/traceability/policy.yaml（optional 要件行の大量列挙は D-002 として対象外）"
      - "docs/designs/foundations/v4-traceability-model.md"
    intent: 同じ変更で複数 sidecar の手動更新を要求する現状を、導出化によってなくなった分だけ縮小する。T-003 原則は維持する
    verification_refs: [TS-012]
    source_items: [AG-012]
assembly_evidence:
  # ACT-REQ-001
  - target_file: docs/requirements/REQ-110.md
    target_content_sha256: 7b8e410b5f406c64933a862d60f979b7a48ae27f105a6fc26553ce9b2ca903f5
    check_scope:
      heading: "## 受け入れ条件対応"
      start_line: 58
      end_line: 78
    execution_conditions:
      operation: replace
      edit_sha256: 1d49f7efca536679d608c92d0b5214a317e33468a05dbe2b05f1dda1ee2aaffa
      expected_old_count: 1
    checker:
      name: assemble-draft-section
      version: "0.2.0"
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: target section only
    checks_summary:
      pre: {count: 3, all_ok: true}
      post: {count: 3, all_ok: true}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-11-12T13:56:16.498Z"
  # ACT-REQ-002
  - target_file: docs/requirements/REQ-110.md
    target_content_sha256: 7b8e410b5f406c64933a862d60f979b7a48ae27f105a6fc26553ce9b2ca903f5
    check_scope:
      heading: "## 受け入れ条件対応"
      start_line: 58
      end_line: 78
    execution_conditions:
      operation: replace
      edit_sha256: c648eb73191e1b0b16984f4d4cf29ed458ff142168fe2e646d7202ba843ae8d9
      expected_old_count: 1
    checker:
      name: assemble-draft-section
      version: "0.2.0"
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: target section only
    checks_summary:
      pre: {count: 3, all_ok: true}
      post: {count: 3, all_ok: true}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-11-12T13:56:16.499Z"
  # ACT-REQ-003
  - target_file: docs/requirements/REQ-047.md
    target_content_sha256: b013eff0b2e92a930d6a7f92d021c6ecacaa98149602bb15d79e83fd1cb3a5f5
    check_scope:
      heading: "## 要件"
      start_line: 17
      end_line: 31
    execution_conditions:
      operation: append
      edit_sha256: 843c4d1a9a626d513bf0b0ffabdbf6cd44156c2d190a24bfaa499d80997a7ff2
      expected_old_count: null
    checker:
      name: assemble-draft-section
      version: "0.2.0"
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: target section only
    checks_summary:
      pre: {count: 2, all_ok: true}
      post: {count: 2, all_ok: true}
    diff_compact: {changed_lines_count: 6, added: 6, removed: 0}
    executed_at: "2026-11-12T13:56:16.499Z"
  # ACT-REQ-004
  - target_file: docs/requirements/REQ-012.md
    target_content_sha256: 396eb1409e97b3c985b6630fda24ed43d39de8d09a2380839520de6d7231d31a
    check_scope:
      heading: "## 要件"
      start_line: 19
      end_line: 58
    execution_conditions:
      operation: append
      edit_sha256: 07f6b1597aa79bbc86b29b0c42bb09e920da171e280ca02e0b12aa6c14de0754
      expected_old_count: null
    checker:
      name: assemble-draft-section
      version: "0.2.0"
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: target section only
    checks_summary:
      pre: {count: 2, all_ok: true}
      post: {count: 2, all_ok: true}
    diff_compact: {changed_lines_count: 5, added: 5, removed: 0}
    executed_at: "2026-11-12T13:56:16.500Z"
  # ACT-DESIGN-001
  - target_file: docs/designs/workflows/workflow-skill-model.md
    target_content_sha256: fd39492419eea42e89db116ea6682b87e0aad968a6ec9dd4d8d2285a5ca9c612
    check_scope:
      heading: "## artifact-contracts.md からの委譲"
      start_line: 242
      end_line: 246
    execution_conditions:
      operation: append
      edit_sha256: 86e1c90ec8ec6bf71c3831f4ce097239150eee645a7264c74b100750b4dddfda
      expected_old_count: null
    checker:
      name: assemble-draft-section
      version: "0.2.0"
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: target section only
    checks_summary:
      pre: {count: 2, all_ok: true}
      post: {count: 2, all_ok: true}
    diff_compact: {changed_lines_count: 8, added: 8, removed: 0}
    executed_at: "2026-11-12T13:56:16.500Z"
  # ACT-DESIGN-002
  - target_file: docs/designs/foundations/project-extensions.md
    target_content_sha256: 9362defc4aa2b017c110b8a324eb475e738bc7ffb7f3bb21cfe01de75a89cd74
    check_scope:
      heading: "## yomiyasu 推敲の工程必須化"
      start_line: 241
      end_line: 252
    execution_conditions:
      operation: append
      edit_sha256: 8b469ccf4fe31a3654a1dcb643a4eb7606a80c2ca07b665d34962ccdc12cf1a8
      expected_old_count: null
    checker:
      name: assemble-draft-section
      version: "0.2.0"
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: target section only
    checks_summary:
      pre: {count: 2, all_ok: true}
      post: {count: 2, all_ok: true}
    diff_compact: {changed_lines_count: 8, added: 8, removed: 0}
    executed_at: "2026-11-12T13:56:16.504Z"
  # ACT-DESIGN-003
  - target_file: docs/designs/integrity/integrity-rule-catalog.md
    target_content_sha256: e015a15e89de7256766e36ce91fbe94e75f9e4b5a16881070834b9e7ede2286b
    check_scope:
      heading: "### IR 属性モデル（DEC-013 適用、retired REQ-028-009/010 から移管）"
      start_line: 38
      end_line: 53
    execution_conditions:
      operation: append
      edit_sha256: 5d6d1f7294593e5cf776d401ea16b33ebf1ad398f7fcb372605d02ab8e3d0c5a
      expected_old_count: null
    checker:
      name: assemble-draft-section
      version: "0.2.0"
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: target section only
    checks_summary:
      pre: {count: 2, all_ok: true}
      post: {count: 2, all_ok: true}
    diff_compact: {changed_lines_count: 7, added: 7, removed: 0}
    executed_at: "2026-11-12T13:56:16.504Z"
  # ACT-DESIGN-004
  - target_file: docs/designs/integrity/checker-execution-contracts.md
    target_content_sha256: 56ddcbc3ad7e92868a11e881fe4a2250b703cb748d278192f7b005ea9e524aec
    check_scope:
      heading: "## checker 共通実行契約"
      start_line: 31
      end_line: 38
    execution_conditions:
      operation: append
      edit_sha256: b16a0dbec09b63cf04325ee1ead26a21b742121dac12084d1d1b140de99afd8e
      expected_old_count: null
    checker:
      name: assemble-draft-section
      version: "0.2.0"
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: target section only
    checks_summary:
      pre: {count: 2, all_ok: true}
      post: {count: 2, all_ok: true}
    diff_compact: {changed_lines_count: 2, added: 2, removed: 0}
    executed_at: "2026-11-12T13:56:16.505Z"
  # ACT-DESIGN-005
  - target_file: docs/designs/integrity/checker-execution-contracts.md
    target_content_sha256: 56ddcbc3ad7e92868a11e881fe4a2250b703cb748d278192f7b005ea9e524aec
    check_scope:
      heading: "## data yaml 宣言的データ運用"
      start_line: 92
      end_line: 118
    execution_conditions:
      operation: append
      edit_sha256: 3d05e0b214ed541e4d3149e401b0984c2bca708a65f8c3a1afa9d00929649ac9
      expected_old_count: null
    checker:
      name: assemble-draft-section
      version: "0.2.0"
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: target section only
    checks_summary:
      pre: {count: 2, all_ok: true}
      post: {count: 2, all_ok: true}
    diff_compact: {changed_lines_count: 2, added: 2, removed: 0}
    executed_at: "2026-11-12T13:56:16.505Z"
  # ACT-DESIGN-006
  - target_file: docs/designs/integrity/rule-ownership.md
    target_content_sha256: 1925b2a28d53a3e81af726f8466f3f47726f7c8bc8a2100a0da9e5608a34b0cc
    check_scope:
      heading: "## 対象規則の所有権一方向化マトリクス（REQ-047）"
      start_line: 79
      end_line: 105
    execution_conditions:
      operation: append
      edit_sha256: 93edb0848abe9a34c6850173c0a60cea9dea4b2cd224e77ea60f824e809f7b43
      expected_old_count: null
    checker:
      name: assemble-draft-section
      version: "0.2.0"
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: target section only
    checks_summary:
      pre: {count: 2, all_ok: true}
      post: {count: 2, all_ok: true}
    diff_compact: {changed_lines_count: 7, added: 7, removed: 0}
    executed_at: "2026-11-12T13:56:16.506Z"
  # ACT-DESIGN-007
  - target_file: docs/designs/local/runtime-package-boundary.md
    target_content_sha256: cc65e0be9221c5d73c64535219441579c12994bdbc4885e3c64c06067fe3b9d4
    check_scope:
      heading: "### repo-local Plugin の配布・投影契約"
      start_line: 309
      end_line: 322
    execution_conditions:
      operation: append
      edit_sha256: c723fd2467df9fa6369d64dd6629aba81aa2ac1e5264390010c15764bd42b31f
      expected_old_count: null
    checker:
      name: assemble-draft-section
      version: "0.2.0"
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: target section only
    checks_summary:
      pre: {count: 2, all_ok: true}
      post: {count: 2, all_ok: true}
    diff_compact: {changed_lines_count: 4, added: 4, removed: 0}
    executed_at: "2026-11-12T13:56:16.506Z"
  # ACT-DESIGN-008
  - target_file: docs/designs/local/runtime-package-boundary.md
    target_content_sha256: cc65e0be9221c5d73c64535219441579c12994bdbc4885e3c64c06067fe3b9d4
    check_scope:
      heading: "## 導入方式ポリシー（Installation Method Policy）"
      start_line: 195
      end_line: 230
    execution_conditions:
      operation: append
      edit_sha256: 4e4bee650a211b249eb1a3bff7009361dcb67479ca24ba2200ac68df7b1cc2ea
      expected_old_count: null
    checker:
      name: assemble-draft-section
      version: "0.2.0"
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: target section only
    checks_summary:
      pre: {count: 2, all_ok: true}
      post: {count: 2, all_ok: true}
    diff_compact: {changed_lines_count: 3, added: 3, removed: 0}
    executed_at: "2026-11-12T13:56:16.507Z"
  # ACT-DESIGN-009
  - target_file: docs/designs/foundations/decision-lifecycle.md
    target_content_sha256: 6c6fcf6f884614e8be891a9f6547b02519684287fc552130c099173a2842d3ac
    check_scope:
      heading: "## Decision 関係モデル"
      start_line: 32
      end_line: 90
    execution_conditions:
      operation: append
      edit_sha256: 097b595dd57f057e74aaec5c70ccff54a4751078de4384a8e105e2af8952f6d1
      expected_old_count: null
    checker:
      name: assemble-draft-section
      version: "0.2.0"
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: target section only
    checks_summary:
      pre: {count: 2, all_ok: true}
      post: {count: 2, all_ok: true}
    diff_compact: {changed_lines_count: 5, added: 5, removed: 0}
    executed_at: "2026-11-12T13:56:16.508Z"
  # ACT-DESIGN-010
  - target_file: docs/designs/integrity/distribution-boundary.md
    target_content_sha256: 1d2a0ab1988d7a65fda859b07932c6c8073a854f3a54fb90e8acc333eec5ec68
    check_scope:
      heading: "## 共有 detector と adapter の契約"
      start_line: 109
      end_line: 114
    execution_conditions:
      operation: append
      edit_sha256: c757edae8e213c1bc5309c4611214b6f3cc5e4ce89bc1756b9dbf03a5f112f26
      expected_old_count: null
    checker:
      name: assemble-draft-section
      version: "0.2.0"
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: target section only
    checks_summary:
      pre: {count: 2, all_ok: true}
      post: {count: 2, all_ok: true}
    diff_compact: {changed_lines_count: 3, added: 3, removed: 0}
    executed_at: "2026-11-12T13:56:16.508Z"
  # ACT-DESIGN-011
  - target_file: docs/designs/integrity/validator-split-criteria.md
    target_content_sha256: 2071389e063d8aac586180bbdc0060b98d8394d96d2cafe2d88f34e407dc55d0
    check_scope:
      heading: "## validator の責務境界"
      start_line: 17
      end_line: 22
    execution_conditions:
      operation: append
      edit_sha256: 769db3b6e48848ea3929d6474ba6c9a3d3ee7efff6dc04d11988871d0ca4e451
      expected_old_count: null
    checker:
      name: assemble-draft-section
      version: "0.2.0"
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: target section only
    checks_summary:
      pre: {count: 2, all_ok: true}
      post: {count: 2, all_ok: true}
    diff_compact: {changed_lines_count: 3, added: 3, removed: 0}
    executed_at: "2026-11-12T13:56:16.508Z"
  # ACT-DESIGN-012
  - target_file: docs/designs/responsibilities/custom-tool-contracts.md
    target_content_sha256: efb9038b4dd54b612987d5d78374bdfeb5b4f51f53f6d8797d6a40ce1636338e
    check_scope:
      heading: "## 対象操作の境界（初期セット）"
      start_line: 40
      end_line: 110
    execution_conditions:
      operation: append
      edit_sha256: 52da1862d7c61af4e6cbb34469056f5c8bed457ee4b7ac007c0232fac520b629
      expected_old_count: null
    checker:
      name: assemble-draft-section
      version: "0.2.0"
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: target section only
    checks_summary:
      pre: {count: 2, all_ok: true}
      post: {count: 2, all_ok: true}
    diff_compact: {changed_lines_count: 3, added: 3, removed: 0}
    executed_at: "2026-11-12T13:56:16.508Z"
  # ACT-DESIGN-013
  - target_file: docs/designs/foundations/multi-host-canonical-model.md
    target_content_sha256: 11aa1e3116cb69b5b5f40fe1ee2a6b89f0857f5cba6ffaec348a2e1993800fa7
    check_scope:
      heading: "## バックエンド×ホスト接続構成"
      start_line: 36
      end_line: 41
    execution_conditions:
      operation: append
      edit_sha256: 6107b72fc81459ee7b13b4aa1857c33255f9ab14edd17db857f57ea1226b3c33
      expected_old_count: null
    checker:
      name: assemble-draft-section
      version: "0.2.0"
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: target section only
    checks_summary:
      pre: {count: 2, all_ok: true}
      post: {count: 2, all_ok: true}
    diff_compact: {changed_lines_count: 3, added: 3, removed: 0}
    executed_at: "2026-11-12T13:56:16.508Z"
  # ACT-DESIGN-014
  - target_file: docs/designs/foundations/v4-traceability-model.md
    target_content_sha256: 82a413e07f0854761328e3e77058b012843d01e958abb94da8331fc4e0b2cd6d
    check_scope:
      heading: "## 永続情報と導出可能情報の分離"
      start_line: 65
      end_line: 81
    execution_conditions:
      operation: append
      edit_sha256: 29aa7357b1a2bfa01947438993485b524994e5e128959ed05f531d083783d0be
      expected_old_count: null
    checker:
      name: assemble-draft-section
      version: "0.2.0"
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: target section only
    checks_summary:
      pre: {count: 2, all_ok: true}
      post: {count: 2, all_ok: true}
    diff_compact: {changed_lines_count: 3, added: 3, removed: 0}
    executed_at: "2026-11-12T13:56:16.509Z"
case_open_hints:
  epic_needed: true
  decomposition: |
    scale large。11関心（B2-1・B2-2・B3-1〜B3-6）を関心別 Issue へ分解する。REQ 改訂と Design 契約14節は各関心 Issue へ紐付ける（B2-1: OU-001+OU-004、B2-2: OU-005、B3-1: OU-002+OU-006〜OU-008、B3-2: OU-009 §配布・投影契約、B3-3: OU-007 の data yaml 節、B3-4: OU-010、B3-5a: OU-011、B3-5b: OU-012、B3-5c: OU-013、B3-5d: OU-009 §導入方式ポリシー、B3-5e: OU-014、B3-6: OU-003+OU-015）。同一 Design ファイルへ複数節を追加する組み合わせ（OU-007×B3-1/B3-3、OU-009×B3-2/B3-5d）は同一 Issue にまとめてもよい。B2系（文書集約）とB3系（検査・配布・契約）は並行化可能、B3-5群（a〜e）は相互に独立である
  wave_hints:
    - "B3-1 は checker 出力形式（IR ID 包含）と65規則分類を最初に確定する（B3-2〜B3-6 の検査資産から参照され得るため）"
    - "B2-1 は REQ-110 改訂（OU-001）と共通参照文書の契約確定（OU-004）を先頭に配置する"
    - "B3-2 と B3-5d は runtime-package-boundary・install/self-sync の実装を共有するため同一 Wave を推奨する"
```

# summary

## 対象

ADF全体簡素化計画（第53報告・2026-11-10 利用者承認）の C-ε「規則の集約と正本の一元化」。B2-1（工程駆動11ファイルの共通報告・Decision 規則の集約と REQ-110 要件改訂）、B2-2（7工程拡張の文章品質規則の集約と guard 拒否後迂回矛盾の解消）、B3-1（checker 出力の IR ID 包含・65規則分類・対応表の機械検証への移行）、B3-2〜B3-6（配布除外・スキル一覧導出・Decision 部分置換・ガード編集意味論・構造検査・操作一覧・install/self-sync・ホスト間・sidecar 導出化）。

## Design 修正

Design 8ファイル14節へ集約契約を追加する（append）。REQ-110 の受け入れ条件対応2行を正本参照形式へ改訂し（update）、REQ-047 へ3行・REQ-012 へ2行を追記する（append）。新規 Decision は作成しない。

## 保持条件

名レベル参照契約（REQ-002-017・REQ-027-001）、REQ-110-037/039 の管理機構不追加（CR-001 で両立形式を確定）、yomiyasu の意味・数値・否定条件の保護と書込み前検査（REQ-098-006・REQ-053-025〜027）、T-003 原則（対応宣言の存在を受け入れ証明としない）、独立外部契約検査、公開入口2本と管理外資産保護、self-sync の意図的差異、監査期待値の独立性。

## 検証方針

C-α1 固定基線に対する新規不合格0・既知不合格の悪化なし。移行前後対比証明と簡素化効果の記録。11工程の静的参照経路の機械確認と参照形態別代表実行経路検証。配布整合検査の最終合格。並行5案件の資産への非接触（TS-015/TS-016）。

## 証拠源

実施計画書（53-implementation-plan.md §2 B2・B3群・§4 完遂判定・§5 リスク）、進捗報告54、基線報告55、req-input（hermes-vault/project-list/req-input-adf-simplification-c-epsilon-rule-consolidation.md）、各対処の一次根拠（第5/7/10/16/20/21/23/27/28/30〜33/35/37/39/49報告の該当 finding）、組立検査証拠（assembly_evidence 18件・assemble-draft-section 0.2.0）。

## 重要変更の事前通知

本 draft は既存正規成果物への重要変更として、REQ-110 受け入れ条件対応の TS-011・TS-012 両行の改訂（検証義務の所有を「11ファイルの手順契約」から「単一の正本（工程駆動系の共通参照文書）」へ変更。要件行の意味は報告内容の確保・正本到達性として維持）、REQ-047 への3行・REQ-012 への2行の追記、Design 8ファイルへの集約契約追加を含む。変更理由（反復規則の正本集約による単一更新化）、内容、影響（11ファイル・7拡張の参照形式への置換を含む実装は case-auto の別指示で実施）、確定事項と未確認事項（なし。B3-1 着手条件の見通し評価は CR-003 のとおり示せると確定）を、本 draft の保存に先立つ実行出力として利用者へ通知した。通知は承認ではなく、新たな価値判断は未解決質問として保留する（本 draft 時点で未解決質問なし）。
