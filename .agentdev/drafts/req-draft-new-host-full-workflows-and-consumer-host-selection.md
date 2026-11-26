---
draft_type: req_draft
topic_slug: new-host-full-workflows-and-consumer-host-selection
status: draft
created_at: "2026-11-26T10:30:51Z"
source_rus: [RU-0307, RU-0308]
---

# draft-data

```yaml
work_type: feature
scale: large
summary: >-
  Codex と Antigravity を含む4エージェントから、利用先リポジトリに AgentDevFlow を配置する対象を任意に選べるようにする。
  選択の記録、再導入、切替、選択に応じた依存検査を、チェックアウト版とリリース ZIP 版の両方で定義する。
  Codex と Antigravity の GitHub 操作を各ホストの GitHub プラグイン経由で共通の agentdev_gh 操作契約に接続し、
  Release を含む全ワークフローの完走、プラグイン利用不可時の停止と再開、利用者の明示判断による gh 経路への切替を定義する。
  OpenCode・Senpi の既存の GitHub 経路、ローカルIssueモード、Custom Tool の操作契約は維持する。
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: >-
      RU-0308 対象1・AC-1。利用先リポジトリに AgentDevFlow を配置する対象を、Codex、Antigravity、OpenCode、Senpi の4エージェントから選べる。
      各エージェントの単独と空でない全組み合わせを、チェックアウト版とリリース ZIP 版のそれぞれで指定できる。
      全てを外した空の選択は導入の選択肢に含めない。
  - id: AG-002
    content: >-
      RU-0308 合意済みの方針1。新規導入では配置先のエージェントを明示して選ぶ。
      対話ウィザードで選択を求め、非対話の CLI で省略した場合は指定方法を案内する。更新で省略した場合は前回の選択を維持する。更新でどちらかの引数だけを指定した場合は、省略した側のエージェント群は前回の選択を維持し、指定した側のエージェント群だけを置き換える。新規導入でどちらかの引数だけを指定した場合は、もう片方の引数の指定方法を案内する。
  - id: AG-003
    content: >-
      RU-0308 対象1・AC-3、設計候補2。成功した適用で選択を導入先の .agentdev/install-state.json に記録し、更新時の判定根拠とする。
      Codex と Antigravity の選択は個別に記録する。記録のある導入では省略時に選択を再現し、同じ選択の再実行で配置に差を出さない。
      選択の集合は check、dry-run、apply で共有し、check と dry-run は記録を変更しない。
  - id: AG-004
    content: >-
      RU-0308 対象1・AC-3、設計候補1。エージェント切替の dry-run が示した管理対象の変更を apply が反映し、その後の check が合格する。
      切替は所有を確認できる AgentDevFlow の資産だけを変更し、原本、利用者の設定とスキル、残すエージェントの資産を保持する。
      チェックアウト版で除去するのは管理リンクと installer が生成した補助ファイル、ZIP 版では所有を確認できる配布コピーに限る。
  - id: AG-005
    content: >-
      RU-0308 対象1・AC-5、設計候補2。選択の記録がない既存導入では、所有を確認できる .opencode/、.senpi/ の配置と既存の記録から選択を補助的に判定し、確定できる選択は保持する。
      .agents/skills/ の存在だけでは Codex と Antigravity のどちらを選んだか確定できないため、曖昧な場合は明示選択を案内する。
      記録に選択がある場合は記録を正本とし、配置からの推定で選択を置き換えない。記録が読めないまたは値が不正な場合は選択を推定せず、明示選択を求めて停止する。所有を確認できない資産との衝突では当該資産を保持し、処理結果に衝突を示し、apply を正常終了させず、選択の記録を更新しない。
  - id: AG-006
    content: >-
      RU-0308 合意済みの方針2・AC-4。Codex と Antigravity は .agents/skills/ を共有できる。
      片方だけを選択した場合に、同じリポジトリを開いたもう片方からも共有スキルが見えることを許容する。
      Codex と Antigravity の選択は個別に記録し、共有スキルはどちらかが選択されている間は維持する。
      両方を選択から外し別のエージェントに切り替えたときは、所有が確認できる共有配置だけを除去する。
  - id: AG-007
    content: >-
      RU-0308 対象1・AC-2。選んだエージェントの配置に必要な資産と依存を検査する。
      OpenCode を選ばない導入は、OpenCode 用 textlint の依存実体や OpenCode 用 third-party Skill の配置を要求しない。
      OpenCode を選択した場合は既存の必要な検査が働く。配置検査と各エージェントでの実行確認は区別する。
  - id: AG-008
    content: >-
      RU-0308 対象1・AC-6、依存関係4。リリース ZIP は選択したエージェントの配布対象と Senpi の接続モジュールを含み、
      ZIP 展開元を除いた導入先で配布対象スキルと Senpi 接続モジュールが読み込める。
      公開前検証は選択に応じた欠落、余分な配置、内容不一致を個別に検出する。
      配布検査では各エージェントに必要な資産に加えて、収録禁止資産と検出すべき欠落も確認する。
      原本、収録、設置後の検査をエージェント別に拡張し、公開前に信頼済みの導入処理で ZIP の実ファイルを照合する。
      候補 ZIP のスクリプトを実行せずに検証する既存の境界を維持する。
      Codex・Antigravity を選択した導入では、command 本文、Skill 探索の共通 lib、agentdev_gh の engine と gh 用 runner、ホスト接続領域の adapter も、展開元と OpenCode の配置先に依存せず導入先で読み込める。
  - id: AG-009
    content: >-
      RU-0308 合意済みの方針3・AC-6。単独導入後に実際のエージェントで業務を実行して確認するのは利用者が担当する。
      導入側は配置と読み込みを検証し、利用者が各エージェントで業務を開始できるようエージェント別の起動方法を導入手順に示す。
  - id: AG-010
    content: >-
      RU-0308 対象外。エージェント本体や CLI のインストール、ホーム全域への配置、本体リポジトリの scripts/self-sync.ps1 における対応エージェントの拡張を含めない。
      Codex・Antigravity で導入後に Issue、PR、Release を含む全ワークフローを完走させるための実行接続は RU-0307 が扱い、
      RU-0308 は導入先のエージェントが対象スキルを読み込めるところまでを扱う。
  - id: AG-011
    content: >-
      RU-0307 対象1、要件化の方向1。Codex と Antigravity のそれぞれで、両ホストの GitHub プラグインを既定の GitHub 接続とし、共通の agentdev_gh 操作契約に接続する。
      ワークフローは共通の操作契約を使い、ホスト側の接続がプラグインの呼出しと応答の変換を担当する。共通契約に従って操作前の承認と書込み後の読み戻しを行う。
      agentdev_gh を参照する配布スキルを新ホストでの動作保証から除外せず、agentdev_gh の MCP サーバー化と ADF 独自の MCP 接続は行わない。
  - id: AG-012
    content: >-
      RU-0307 AC-1。Codex と Antigravity の各ホストで、Release を含む全公開ワークフローと、実行担当サブエージェントへの委譲や終了時の品質ゲートなど必要な内部工程を完走できる。
      対応はホスト単位で判定し、プラグインに必要な操作が欠ける場合は承認済みの gh 経路で完走できればよいとする。
      各ホストで実際に使用した GitHub 実行経路と実機検証の実施者と結果を記録する。Antigravity の実機検証は実行担当が行わず、利用者が確認する（REQ-099-024）。
      OpenCode・Senpi の GitHub 実行経路と既存ローカルIssueモードの回帰試験が通る。
      完走に使う資産は導入先に配置されたものに限り、OpenCode の併用を前提としない。終了時の品質ゲートのうち OpenCode 用 plugin に依存する検査は、RU-0308 の受け入れ条件2により OpenCode を選ばない導入では対象外とし、結果にその旨を記録する。
  - id: AG-013
    content: >-
      RU-0307 AC-2。Codex と Antigravity の各ホストで、Release の草稿作成、読み戻し、利用者の明示承認後の公開、公開結果の読み戻しを確認できる。
  - id: AG-014
    content: >-
      RU-0307 対象2・AC-3、要件化の方向2。プラグインが無効または必要な操作を提供しない場合、GitHub 操作を停止して利用者の判断を求める。
      一時的な場合は現在の設定を保持してプラグインの復旧を待つ。停止中は GitHub 操作も実行経路の設定変更も発生させず、復旧後に再開する。
  - id: AG-015
    content: >-
      RU-0307 対象2・AC-4、依存関係。恒久的な場合は、利用者の明示判断を受けて scripts/ の専用の切替スクリプトで GitHub プラグイン経由から gh CLI 経由へ切り替える。
      専用スクリプトで設定した gh 経路は再起動後も使う。切替の承認と個別の GitHub 操作の承認は独立させる。経路の設定は導入先リポジトリにホスト別に保存し、記録のないホストはプラグイン経路として扱う。経路の設定が読めないまたは値が不正な場合はプラグイン経路へ戻さず、GitHub 操作の前に停止する。
      gh 経路では対象リポジトリへの認証と必要な権限を操作前に確認し、既存の共通 engine と gh 用 runner を再利用する。
      ホストごとの GitHub 操作手順を Markdown へ再実装せず、新たなバックエンド抽象層を導入しない。
  - id: AG-016
    content: >-
      RU-0307 AC-4、要件化の方向3。書込み結果が不明な操作をまたいで再開する場合は、再開前に GitHub の状態を照合し、Issue、PR、コメント等の重複作成を防ぐ。
      照合の結果、操作対象が一意に確定できる場合はその対象で処理を継続し、操作が行われていないと確定できる場合は実行する。複数の候補が見つかる場合や照合できない場合は書き込まず停止して利用者の判断を求める。
  - id: AG-017
    content: >-
      RU-0307 要件化の方向1、アンカー REQ-011-001、003、005、008、024 に由来する。GitHub I/O の唯一の境界は GitHub I/O を担う agentdev_gh の操作契約集合とする。
      Custom Tool を登録できるホストでは Custom Tool が操作契約を提供し、登録できないホストではホスト接続領域の adapter が同じ操作契約をホストの GitHub 接続へつなぐ。
      adapter には Tool と同じ VERIFY ならびに失敗時の意味を等しく適用する。上位 command や skill は操作契約のみを参照し、ホスト別の I/O 手続きを Markdown へ再実装しない。
  - id: AG-018
    content: >-
      RU-0307 対象2とアンカー REQ-009 に由来し、公開入口集合を所有する REQ-050 に反映する。
      GitHub 実行経路の切替向けの専用スクリプトを scripts/ 直下の公開入口（scripts/switch-github-route.ps1）として加え、scripts/ 直下の公開入口を4本とする。
      切替スクリプトは consumer 向けとし、AgentDevFlow 本体リポジトリでは変更前に停止して適切な公開入口を案内する。
      チェックアウト版とリリース ZIP 版のそれぞれの導入先で利用でき、切替える経路の設定は導入先リポジトリに保存する。
  - id: AG-019
    content: >-
      RU-0307 対象外。OpenCode・Senpi の現行の gh CLI 経路と、既存ローカル Issue モードへの変更を含めない。4ホストの任意インストールは RU-0308 が扱う。
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-099.md
    target_area: 要件
    source_items: [AG-011, AG-012, AG-013, AG-014, AG-015, AG-016]
    application_note: 既存要件表の末尾へ連続行として追記する。見出しに対する汎用 Markdown 追記のプレビューに入る空行は、要件表には挿入しない。
    content: |
      | REQ-099-030 | Codex と Antigravity の各ホストで、Release を含む全公開ワークフローと、実行担当サブエージェントへの委譲や終了時の品質ゲートなど必要な内部工程を完走できること。対応はホスト単位で判定し、実際に使用した GitHub 実行経路と実機検証の実施者と結果を記録すること。OpenCode・Senpi の GitHub 実行経路と既存ローカルIssueモードの回帰試験に合格すること |
      | REQ-099-031 | Codex と Antigravity の各ホストで、Release の草稿作成、読み戻し、利用者の明示承認後の公開、公開結果の読み戻しを確認できること |
      | REQ-099-032 | Codex と Antigravity で GitHub プラグインが無効または必要な操作を提供しない場合、GitHub 操作を利用者の判断まで停止すること。一時的に利用できない間は GitHub 操作も実行経路の設定変更も行わず、プラグインの復旧後に再開すること。経路の切替の承認と個別の GitHub 操作の承認は別々に求めること |
      | REQ-099-033 | Codex と Antigravity で利用者が恒久的な切替を承認した場合、専用の切替スクリプトで設定した gh 経路で GitHub 操作を継続し、再起動後も同じ経路を使うこと。経路の設定のないホストはプラグイン経路として扱い、設定が読めないまたは値が不正な場合はプラグイン経路へ戻さず GitHub 操作の前に停止すること。プラグインに必要な操作が欠ける場合も、利用者が承認した gh 経路で完走できること |
      | REQ-099-034 | Codex と Antigravity で結果が不明な操作をまたいで再開する場合、再開前に GitHub の状態を照合し、操作対象が一意に確定できた場合はその対象で処理を継続し、行われていないと確定できた場合は実行し、複数の候補が見つかる場合や照合できない場合は書き込まず停止して利用者の判断を求めることで、Issue、PR、コメント等の重複作成を防ぐこと |
      | REQ-099-035 | Codex と Antigravity の GitHub 接続と gh 経路の切替は、共通の agentdev_gh 操作契約と gh 用の実行経路を再利用すること。ホストの GitHub プラグインの呼出しと応答の変換はホスト接続領域が担い、操作前の承認と書込み後の読み戻しを維持すること。ホストごとの GitHub 操作手順を Markdown へ再実装せず、新たなバックエンド抽象層を導入しないこと |
  - id: ACT-REQ-002
    artifact: req
    operation: append
    target: docs/requirements/REQ-099.md
    target_area: 要件
    source_items: [AG-001, AG-003, AG-004, AG-005, AG-006, AG-007, AG-008, AG-009]
    application_note: 既存要件表の末尾へ連続行として追記する。見出しに対する汎用 Markdown 追記のプレビューに入る空行は、要件表には挿入しない。エージェント本体や CLI のインストール、ホーム全域への配置、本体リポジトリの scripts/self-sync.ps1 の対応エージェント拡張は含めない（RU-0308 対象外）。
    content: |
      | REQ-099-036 | 導入先リポジトリには、OpenCode、Senpi、Codex、Antigravity の各単独と空でない全組み合わせを選んで導入できること。全てを外した空の選択は導入の選択肢に含めないこと |
      | REQ-099-037 | 選択したエージェントの集合は成功した適用の後に導入先へ記録し、更新で省略された場合は記録を再現すること。同じ選択の再実行で配置に差が出ないこと |
      | REQ-099-038 | エージェントの切替は管理対象の配置だけを変更すること。切替の dry-run が示した内容を apply が反映し、その後の check に合格すること。原本と利用者の設定、スキル、残したエージェントの資産を保持すること |
      | REQ-099-039 | Codex と Antigravity が共有する配置は、どちらかが選択に残る限り保持すること。両方を外して別のエージェントへ切り替えた場合は、所有を確認できる共有配置だけを除去すること |
      | REQ-099-040 | 選択の記録のない既存導入では、所有を確認できる配置から判定し、確定できない場合は明示選択を案内すること。記録に選択がある場合は記録を正本とし、配置からの推定で選択を置き換えないこと。記録が読めないまたは値が不正な場合は推定で上書きせず明示選択を求めて停止すること。所有を確認できない資産との衝突では当該資産を保持し、処理結果に衝突を示し、apply を正常終了させず、選択の記録を更新しないこと |
      | REQ-099-041 | OpenCode を選択しない導入は、OpenCode 用 textlint の依存実体や OpenCode 用 third-party Skill の配置を要求しないこと。OpenCode を選択した場合は既存の必要な検査が働くこと。配置検査と各エージェントでの実行確認は区別すること |
      | REQ-099-042 | リリース ZIP は選択したエージェントの配布対象と Senpi の接続モジュールを含み、展開元を除いた導入先で読み込めること。Codex と Antigravity の配布対象には、command 本文、Skill 探索の共通 lib、agentdev_gh の engine と gh 用 runner、ホスト接続領域の adapter を含め、展開元と OpenCode の配置先に依存せず読み込めること。公開前検証で欠落、余分な配置、内容不一致を個別に検出すること |
      | REQ-099-043 | 単独導入後に実際のエージェントで業務を確認するのは利用者が担当すること。導入側は配置と読み込みを検証し、エージェント別の起動方法を導入手順に示すこと |
  - id: ACT-REQ-003
    artifact: req
    operation: update
    target: docs/requirements/REQ-099.md
    target_area: 要件
    source_items: [AG-001, AG-002, AG-003]
    content: |
      | REQ-099-010 | installer の単一公開入口と check／dry-run／apply の3モードを維持し、OpenCodeのみ、Senpiのみ、両方への既存の配置選択を含め、OpenCode、Senpi、Codex、Antigravity の各単独と空でない全組み合わせを選択できること。導入先では Codex と Antigravity を利用者がリポジトリごとに選択できること。新ホストのホーム全域への導入、および本体リポジトリへの導入は対象外とする。配置対象選択の詳細（新規導入・既存導入更新の選択肢と既定、選択の記録と切替、self-sync の投影整合）は multi-host-canonical-model.md と runtime-package-boundary.md が所有する |
  - id: ACT-REQ-004
    artifact: req
    operation: update
    target: docs/requirements/REQ-099.md
    target_area: 要件
    source_items: [AG-001, AG-008]
    content: |
      | REQ-099-020 | installer・release archive 生成系（package-release-archive、consumer archive install、同梱 README、archive レイアウト規定、trusted-distribution-gate）は共通原本構成（src/common/ とホスト接続領域）を前提として動作すること。収録・配置・検査は、導入先で選択された OpenCode、Senpi、Codex、Antigravity の空でない組み合わせに応じて、同じ選択の意味で行うこと。旧 src/opencode 単一前提の収集定義・境界検査・投影対象を残さないこと |
  - id: ACT-REQ-005
    artifact: req
    operation: update
    target: docs/requirements/REQ-099.md
    target_area: 要件
    source_items: [AG-011, AG-012]
    application_note: 2行をそれぞれ既存の行と置き換える。REQ-099-023 は GitHub プラグインを共通の操作契約に接続する内容へ更新し、REQ-099-025 は案Aの呼称を除き、OpenCode を選択しない導入での終了時の品質ゲートの対象外を明記する内容へ更新する。
    content: |
      | REQ-099-023 | 新ホストでは既定で各ホストの GitHub プラグインを、共通の agentdev_gh 操作契約に接続して使うこと。agentdev_gh を参照する配布スキルは新ホストでも同じ操作契約を使うこと。ADF 独自の MCP 接続および agentdev_gh の MCP サーバー化は行わないこと |
      | REQ-099-025 | 新ホストでは書込み前の文章検査 hook を導入せず、worktree 終了時に既存の文章品質ゲートを利用できること。OpenCode を選択しない導入では、終了時の品質ゲートのうち OpenCode 用の plugin に依存する検査を対象外とし、結果にその旨を記録すること |
  - id: ACT-REQ-006
    artifact: req
    operation: update
    target: docs/requirements/REQ-009.md
    target_area: 要件
    source_items: [AG-018]
    content: |
      | REQ-009-002 | 同一リポジトリ内の同期と導入先へのインストールは別手段として分離すること。scripts/ 直下の公開入口の境界（現行は REQ-050-001 の4本構成、モード、誤実行防止）は REQ-050 が所有する |
  - id: ACT-REQ-007
    artifact: req
    operation: update
    target: docs/requirements/REQ-009.md
    target_area: 要件
    source_items: [AG-002, AG-003]
    content: |
      | REQ-009-040 | 同期、インストール手段は引数なしで起動した場合、対話ウィザードにより実行モードを問うこと（install は環境も問う）。install は既存の配置対象選択（OpenCode のみ、Senpi のみ、両方）と明示指定を維持し、Codex と Antigravity についても導入先リポジトリ単位で利用者が選択・明示指定できること。新規導入では対話ウィザードで配置するエージェントを選択させ、非対話で起動して選択が省略された場合は指定方法を案内し、更新で省略された場合は前回の選択を維持すること。更新でどちらかの引数だけを指定した場合は省略した側の前回の選択を維持して指定した側だけを置き換え、新規導入でどちらかの引数だけを指定した場合はもう片方の引数の指定方法を案内すること。新ホストをホーム全域および本体リポジトリへ導入しないこと |
  - id: ACT-REQ-008
    artifact: req
    operation: append
    target: docs/requirements/REQ-009.md
    target_area: 要件
    source_items: [AG-015, AG-018]
    application_note: 既存要件表の末尾へ連続行として追記する。見出しに対する汎用 Markdown 追記のプレビューに入る空行は、要件表には挿入しない。
    content: |
      | REQ-009-055 | GitHub 実行経路の切替用スクリプトは、チェックアウト版とリリース ZIP 版のそれぞれの導入先で利用できること。切替える経路の設定は導入先リポジトリに保存すること |
  - id: ACT-REQ-009
    artifact: req
    operation: update
    target: docs/requirements/REQ-050.md
    target_area: 要件
    source_items: [AG-018]
    content: |
      | REQ-050-001 | scripts/ 直下の通常利用者向け公開入口は、consumer 向けの scripts/install.ps1、self-hosting 向けの scripts/self-sync.ps1、開発環境セットアップ向けの scripts/setup-hooks.ts、GitHub 実行経路の切替向けの scripts/switch-github-route.ps1 の4本に限定すること |
  - id: ACT-REQ-010
    artifact: req
    operation: append
    target: docs/requirements/REQ-050.md
    target_area: 要件
    source_items: [AG-018]
    application_note: 既存要件表の末尾へ連続行として追記する。見出しに対する汎用 Markdown 追記のプレビューに入る空行は、要件表には挿入しない。
    content: |
      | REQ-050-017 | GitHub 実行経路の切替向けの公開入口（scripts/switch-github-route.ps1）は consumer 向けとすること。AgentDevFlow 本体リポジトリでは変更前に停止し、適切な公開入口を案内すること |
  - id: ACT-REQ-011
    artifact: req
    operation: update
    target: docs/requirements/REQ-050.md
    target_area: 適用範囲
    source_items: [AG-018]
    application_note: 対象の先頭項目にある公開入口の本数だけを更新する。
    content: |
      - **対象**: scripts/ 直下の公開入口境界と4本の公開入口（モード構成、能力継承、非破壊保証、誤実行防止、命名方針）、旧入口の廃止と互換ラッパー不設置、内部配置の境界（要約レベル）、archive 内公開名と installation projection の区別、配布 manifest・trust root / protected path の追従、実行依存集合の配布完全性、現役参照の更新
  - id: ACT-REQ-012
    artifact: req
    operation: update
    target: docs/requirements/REQ-011.md
    target_area: 要件
    source_items: [AG-017]
    application_note: 3行をそれぞれ既存の行と置き換える。Custom Tool を登録できないホストで同じ操作契約をつなぐ実装を、I/O 境界に加える。
    content: |
      | REQ-011-001 | GitHub I/O の唯一の境界は GitHub I/O を担う agentdev_gh の操作契約集合とすること。Custom Tool を登録できるホストでは Custom Tool が操作契約を提供し、登録できないホストではホスト接続領域の adapter が同じ操作契約をホストの GitHub 接続へつなぐこと。旧 agentdev-gh-cli スキルが所有していた I/O 手続きは Tool へ完全移管し、スキルを I/O 正規経路として残さないこと |
      | REQ-011-005 | 境界は操作契約（入力、出力、保証、失敗時の意味）の集合とし、実装は Tool、および Custom Tool を登録できないホストでは同じ操作契約をつなぐホスト接続領域の adapter が担うこと。adapter には Tool と同じ VERIFY と失敗時の意味を等しく適用すること |
      | REQ-011-008 | 上位 command/skill は常に GitHub I/O を担う agentdev_gh の操作契約のみを参照し、ホスト別の I/O 手続きを Markdown へ再実装しない。 |
  - id: ACT-REQ-013
    artifact: req
    operation: update
    target: docs/requirements/REQ-009.md
    target_area: 要件
    source_items: [AG-008]
    application_note: 既存の行と置き換える。Codex・Antigravity を選択した導入で公開実行時成果物が読み込む実行資産を、導入先インストールの対象に加える。
    content: |
      | REQ-009-012 | 導入先インストールの対象は公開実行時成果物（配布 command、配布 skill）と、Codex・Antigravity を選択した導入でそれらが読み込む実行資産（Skill 探索の共通 lib、agentdev_gh の engine と gh 用 runner、ホスト接続領域の adapter）に限定すること |

  - id: ACT-REQ-014
    artifact: req
    operation: update
    target: docs/requirements/REQ-002.md
    target_area: 要件
    source_items: [AG-008, AG-017]
    application_note: 既存の行と置き換える。Codex・Antigravity のホスト接続領域を、ホスト別接続成果物の原本の配置先に加える。
    content: |
      | REQ-002-007 | 配布成果物のうち host 非依存の共通原本は src/common/ 配下に配置し、ホスト別接続成果物の原本は src/opencode/、src/senpi/、src/codex/、src/antigravity/ 配下に配置すること。.opencode/ 等のホスト実行時配置先は投影先とすること |

  - id: ACT-REQ-015
    artifact: req
    operation: update
    target: docs/requirements/REQ-002.md
    target_area: 要件
    source_items: [AG-008, AG-017]
    application_note: 既存の行と置き換える。製品ソースのホスト別接続領域に src/codex/、src/antigravity/ を加える。
    content: |
      | REQ-002-047 | リポジトリの成果物を、開発管理成果物、製品ソース、配布成果物に区分して管理すること。開発管理成果物は docs、.agentdev、producer 専用の scripts・テスト等の AgentDevFlow 自身の開発管理のための成果物とすること。製品ソースは host 非依存の共通原本（src/common/）とホスト別接続領域（src/opencode/、src/senpi/、src/codex/、src/antigravity/）からなる、consumer へ配布する機能の正規ソースとすること。配布成果物は製品ソースから組成される consumer distribution closure とすること。区分ごとの配置と原本の詳細は Design が所有すること |

  - id: ACT-REQ-016
    artifact: req
    operation: update
    target: docs/requirements/REQ-011.md
    target_area: 適用範囲
    source_items: [AG-017]
    application_note: 「対象」の先頭の段落をこの文と置き換える。
    content: |
      GitHub I/O を担う agentdev_gh の操作契約集合と、それを提供する Custom Tool またはホスト接続領域の adapter を適用対象とする。

  - id: ACT-REQ-017
    artifact: req
    operation: update
    target: docs/requirements/REQ-052.md
    target_area: 要件
    source_items: [AG-017]
    application_note: 既存の行と置き換える。Custom Tool を登録できないホストの接続を、GitHub Issue/PR 操作の正規経路に加える。
    content: |
      | REQ-052-012 | GitHub Issue/PR操作の正規経路は、Custom Toolを登録できるホストではCustom Tool agentdev_ghとし、登録できないホストではホスト接続領域のadapterが同じ操作契約を提供すること。Plugin設定契約、loader shim、runner-local細目、.gitignore推奨、delegation-contracts経路をDesignに保持すること |

  - id: ACT-DEC-001
    artifact: decision
    operation: create
    target: new:consumer-repo-4-agent-selection
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007, AG-008, AG-009, AG-010]
    content: |
      ---
      related_reqs: [REQ-099, REQ-009]
      relations:
        - type: supersedes
          target: DEC-049
          reason: 決定(3) の配置選択肢の範囲と、新規導入・更新時の選択の既定を部分置換する（決定(3) の配置選択肢の範囲は DEC-069 が既に部分置換している）。決定(3) の installer の単一公開入口と実行モード、ならびに決定(1)(2)(4)(5) は維持する。決定(3) が引用する scripts 公開入口の本数は DEC-021 の後継 Decision が定める。
        - type: relates-to
          target: DEC-069
          reason: 導入先リポジトリ単位の配置選択と、ホーム全域・本体リポジトリへ導入しない境界を維持する。
        - type: relates-to
          target: DEC-016
          reason: 導入系スクリプトの副作用ゼロ原則を維持する。
      ---

      # 利用先リポジトリの4エージェント配置対象選択

      ## 背景

      配置対象は OpenCode と Senpi から選び、Codex・Antigravity を別の選択として扱い、新規導入では両ホストへの配置を推奨してきた（DEC-049 決定(3)、DEC-069 第1項）。この仕組みでは Codex や Antigravity だけを選べず、OpenCode を選ばない導入でも OpenCode 用の依存を要求する。利用者は、4エージェントから任意の組み合わせを選び、選択を引き継ぎ、あとから切り替えられることを求めた。

      ## 決定

      - 導入先リポジトリには、OpenCode、Senpi、Codex、Antigravity の各単独と空でない全組み合わせを選んで導入できる。全てを外した空の選択は導入の選択肢に含めない。ホーム全域および本体リポジトリは導入先にしない。エージェント本体や CLI のインストールは導入に含めない。
      - 選択の単位は4エージェントとし、Codex と Antigravity は配置上だけ同じ共有配置を参照する。利用者に見える選択を1項目にまとめない。
      - 新規導入では対話ウィザードで配置するエージェントを選択させる。非対話で起動して選択が省略された場合は指定方法を案内し、更新で省略された場合は前回の選択を維持する。更新でどちらかの引数だけを指定した場合は省略された側の前回の選択を維持し、指定された側だけを置き換える。新規導入でどちらかの引数だけを指定した場合はもう片方の引数の指定方法を案内する。
      - 成功した適用で選択を導入先に記録し、省略時に再現する。選択の記録がない既存の導入では所有を確認できる配置から判定し、確定できない場合は明示選択を案内する。記録に選択がある場合は記録を正本とし、配置からの推定で選択を置き換えない。記録が読めないまたは値が不正な場合は選択を推定せず、明示選択を求めて停止する。
      - 切替は管理対象の配置だけを変更する。Codex と Antigravity が共有する配置は、どちらかが選択に残る限り保持する。利用者の設定とスキルを保護し、所有を確認できない資産との衝突は当該資産を保持して処理結果に示し、apply を正常終了させず、選択の記録を更新しない。
      - エージェント別の依存は選択に連動させる。OpenCode を選択しない導入は OpenCode 用の依存を要求しない。リリース ZIP は選択したエージェントの配布対象を含み、公開前検証は選択ごとに行う。

      ## 結果、影響

      OpenCode のみ、Senpi のみ、両方の既存の選択と、installer の check／dry-run／apply、既存導入の選択維持は保たれる。単独のエージェントで導入した後の業務の動作確認は利用者が担当し、導入側は配置と読み込みを検証してエージェント別の起動方法を示す。導入の完了条件は、導入先のエージェントが対象スキルを読み込めるところまでとする。
  - id: ACT-DEC-002
    artifact: decision
    operation: create
    target: new:new-host-github-connection-and-route-switch
    source_items: [AG-011, AG-012, AG-014, AG-015, AG-016, AG-017, AG-018, AG-019]
    content: |
      ---
      related_reqs: [REQ-099, REQ-011, REQ-009, REQ-050]
      relations:
        - type: supersedes
          target: DEC-069
          reason: 第2項のうち案Aの GitHub プラグインへの操作案内、ADF の Issue/PR 作成の OpenCode 引き渡し、新ホストでの17スキルの動作保証の除外、既存ホスト同等のバックエンド接続の除外のうち GitHub バックエンドに限る部分を部分置換する。第2項の agentdev_gh の MCP 化と独自 MCP 化を行わないこと、第1項は維持する。第3項のうち worktree 終了時の既存の品質ゲートの利用は、OpenCode 用 plugin に依存する検査を OpenCode を選択した導入だけを対象とする条件を加えて部分置換する。plugin に依存しない終了時の必須検査は OpenCode を選択していない導入でも実施し、その失敗を成功として扱わない。第3項の其余の非移設対象は維持する。
        - type: supersedes
          target: DEC-021
          reason: 決定1 の公開入口集合に GitHub 実行経路の切替向けの1本を加えて部分置換する。追加は決定2 の手続きによる。決定2 と決定3 は維持する。
        - type: supersedes
          target: DEC-022
          reason: 決定4 の GitHub/Git I/O の Custom Tool への完全移管と、決定8 の構造化された副作用操作の Custom Tool 接続について、Custom Tool を登録できないホストではホスト接続領域の adapter が同じ操作契約をホストの GitHub 接続へつなぐ例外を加えて部分置換する。操作契約を Design が所有すること、VERIFY と環境依存の実装詳細を Tool と adapter の内側で完了させること、ローカル版の差し替え、Plugin / Hook の位置づけ、ならびに決定1〜3・5〜7 は維持する。決定9 の公開入口の本数は DEC-021 の後継 Decision が定める。
        - type: relates-to
          target: DEC-066
          reason: 決定3 が拡張した公開入口集合（3本）に1本を加える。ローカル Git Hook 検証ゲートの内容は維持する。
        - type: relates-to
          target: DEC-049
          reason: 決定(3) の installer の単一公開入口と実行モード、決定(4) の操作契約の接続境界（GhRunner 型）とバックエンド抽象層を導入しないことを維持する。決定(3) が引用する scripts 公開入口の本数は DEC-021 の後継 Decision が定める。
        - type: relates-to
          target: DEC-004
          reason: GitHub I/O を単一の差し替え可能な境界に集約する原則を維持し、gh 経路とプラグイン経路は同じ操作契約の差し替えとして実現する。
        - type: relates-to
          target: DEC-016
          reason: 導入系スクリプトの副作用ゼロ原則を維持する。切替スクリプトを導入系スクリプトには含めず、利用者の明示判断なしに経路の設定を変更しない。
      ---

      # 新ホストの GitHub 接続と gh 経路切替

      ## 背景

      Codex・Antigravity の GitHub 操作は各ホストの GitHub プラグインへの操作案内に置き換え、Issue/PR 作成は OpenCode に引き渡してきた（DEC-069 第2項）。この方式では新ホストだけで ADF のワークフローを完走できず、Release の作成と承認後の公開も OpenCode に依存する。利用者は、新ホストで GitHub 操作を完走し、プラグインが使えなくなったときに gh 経路へ切り替えられることを求めた。

      ## 決定

      - Codex・Antigravity の GitHub 操作は、既定で各ホストの GitHub プラグインを共通の agentdev_gh 操作契約に接続して行う。Custom Tool を登録できないホストでは、ホスト接続領域の adapter が同じ操作契約をホストの GitHub 接続へつなぎ、Tool と同じ VERIFY ならびに失敗時の意味を適用する。agentdev_gh を参照する配布スキルを新ホストの動作保証から除外しない。
      - プラグインが無効または必要な操作を提供しない場合、GitHub 操作を利用者の判断まで停止する。一時的な場合は設定を保持して復旧を待つ。恒久的な場合は、利用者の明示判断によって scripts/ の専用の切替スクリプトで gh 経路へ切り替える。切替の承認と個別操作の承認は独立とする。プラグイン経路と gh 経路のいずれでも、結果不明な操作をまたぐ再開の前に GitHub の状態を照合し、操作対象が一意に確定できた場合はその対象で処理を継続し、行われていないと確定できた場合は実行し、複数の候補が見つかる場合や照合できない場合は書き込まず停止して利用者の判断を求める。
      - 切替スクリプトを scripts/ 直下の公開入口として加え、公開入口を4本とする。切替える経路の設定は導入先リポジトリに保存し、再起動後も使う。記録のないホストはプラグイン経路として扱い、設定が読めないまたは値が不正な場合は経路を推定せず GitHub 操作の前に停止する。
      - gh 経路は既存の共通 engine と gh 用 runner を再利用する。agentdev_gh の MCP サーバー化、ADF 独自の MCP 接続、新たなバックエンド抽象層、GitHub 互換ローカルサーバ、ホストごとの GitHub 操作手順の Markdown による再実装は導入しない。
      - 案Aが定めた既存能力の優先、gh 書込み禁止 guard、配布領域 guard、agentdev_third_party、textlint の書込み前 hook の非移設、worktree 終了時の既存の品質ゲートの利用は維持する。OpenCode 用 plugin に依存する検査は OpenCode を選択した導入だけで終了時の品質ゲートの対象とし、OpenCode を選択していない導入では対象外として結果にその旨を記録する。対象外は OpenCode 用 plugin に依存する検査だけに限り、plugin に依存しない終了時の必須検査は OpenCode を選択していない導入でも実施し、その失敗を成功として扱わない。

      ## 結果、影響

      OpenCode・Senpi の GitHub 経路とローカルIssueモード、Custom Tool の操作契約、既存ホストの guard は変更しない。Antigravity の仕様検討は引き続き公開情報に基づき、実機での動作確認は利用者が行う。新ホストの全ワークフローの対応はホスト単位で判定し、実際に使用した GitHub 実行経路と実機検証の実施者と結果をガイドに記録する。scripts 公開入口が4本になるため、配布 manifest と配布境界検査が追従する。
  - id: ACT-DEC-003
    artifact: decision
    operation: update
    target: docs/decisions/DEC-049.md
    target_area: frontmatter
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006]
    content: |
      supersede_note: 新設 Decision「利用先リポジトリの4エージェント配置対象選択」（ACT-DEC-001 の正式採番 ID を参照）により、決定(3) の配置選択肢の範囲と、新規導入・更新時の選択の既定を部分置換する（決定(3) の配置選択肢の範囲は DEC-069 が既に部分置換している）。決定(3) の installer の単一公開入口と実行モード、ならびに決定(1)(2)(4)(5) は維持する。決定(3) が引用する scripts 公開入口の本数は DEC-021 の後継 Decision が定める。
    application_note: 採番済みの正式 ID を使って注記を保存する。既存本文、既存 relations と status accepted を維持し、superseded_by は追加しない。
  - id: ACT-DEC-004
    artifact: decision
    operation: update
    target: docs/decisions/DEC-069.md
    target_area: frontmatter
    source_items: [AG-011, AG-014, AG-015, AG-016, AG-017]
    content: |
      supersede_note: 新設 Decision「新ホストの GitHub 接続と gh 経路切替」（ACT-DEC-002 の正式採番 ID を参照）により、第2項のうち案Aの GitHub プラグインへの操作案内、ADF の Issue/PR 作成の OpenCode 引き渡し、新ホストでの17スキルの動作保証の除外、既存ホスト同等のバックエンド接続の除外のうち GitHub バックエンドに限る部分を部分置換する。第2項の agentdev_gh の MCP 化と独自 MCP 化を行わないこと、第1項は維持する。第3項のうち worktree 終了時の既存の品質ゲートの利用は、OpenCode 用 plugin に依存する検査を OpenCode を選択した導入だけを対象とする条件を加えて部分置換する。plugin に依存しない終了時の必須検査は OpenCode を選択していない導入でも実施し、その失敗を成功として扱わない。第3項の其余の非移設対象は維持する。
    application_note: 採番済みの正式 ID を使って注記を保存する。既存本文、既存 relations と status accepted を維持し、superseded_by は追加しない。
  - id: ACT-DEC-005
    artifact: decision
    operation: update
    target: docs/decisions/DEC-021.md
    target_area: frontmatter
    source_items: [AG-018]
    content: |
      supersede_note: 新設 Decision「新ホストの GitHub 接続と gh 経路切替」（ACT-DEC-002 の正式採番 ID を参照）により、決定1 の公開入口集合に GitHub 実行経路の切替向けの1本を加えて部分置換する。追加は決定2 の手続きによる。決定2 と決定3 は維持する。
    application_note: 採番済みの正式 ID を使って注記を保存する。既存 relations と status accepted を維持し、superseded_by は追加しない。本文冒頭の部分置換記録は ACT-DEC-007 で更新する。
  - id: ACT-DEC-006
    artifact: decision
    operation: update
    target: docs/decisions/DEC-022.md
    target_area: frontmatter
    source_items: [AG-011, AG-015, AG-017]
    content: |
      supersede_note: 新設 Decision「新ホストの GitHub 接続と gh 経路切替」（ACT-DEC-002 の正式採番 ID を参照）により、決定4 の GitHub/Git I/O の Custom Tool への完全移管と、決定8 の構造化された副作用操作の Custom Tool 接続について、Custom Tool を登録できないホストではホスト接続領域の adapter が同じ操作契約をホストの GitHub 接続へつなぐ例外を加えて部分置換する。操作契約を Design が所有すること、VERIFY と環境依存の実装詳細を Tool と adapter の内側で完了させること、ローカル版の差し替え、Plugin / Hook の位置づけ、ならびに決定1〜3・5〜7 は維持する。決定9 の公開入口の本数は DEC-021 の後継 Decision が定める。
    application_note: 採番済みの正式 ID を使って注記を保存する。既存本文、既存 related_reqs と status accepted を維持し、superseded_by は追加しない。
  - id: ACT-DEC-007
    artifact: decision
    operation: update
    target: docs/decisions/DEC-021.md
    target_area: 本文冒頭の部分置換記録
    source_items: [AG-018]
    application_note: 採番済みの正式 ID を使って本文冒頭の「部分置換記録:」で始まる段落をこの文と置き換える。判断の内容は変えず、部分置換を受けた Decision と現行の公開入口集合の補助情報だけを更新する。frontmatter の supersede_note は ACT-DEC-005 で保存する。
    content: |
      部分置換記録: 決定1の公開入口2本固定は、ローカル Git Hook 検証ゲートの導入（DEC-066・scripts/setup-hooks.ts 新設）と、GitHub 実行経路の切替向け入口の追加（ACT-DEC-002 の正式採番 ID を参照・scripts/switch-github-route.ps1 新設）により部分置換された。現行の公開入口集合の正は REQ-050-001（install.ps1・self-sync.ps1・setup-hooks.ts・switch-github-route.ps1 の4本）である。決定2（公開入口名の安定契約・追加は後継 Decision を要する）と決定3（公開入口としない内部処理区分）は維持する。
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/foundations/multi-host-canonical-model.md
    target_design: {operation: update, domain: foundations, slug: multi-host-canonical-model}
    target_area: "投影モデルと installer 対象選択"
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007, AG-008, AG-012]
    application_note: "installer の項目を4エージェントから選ぶ配置対象の説明へ更新し、直後に選択の入力、記録、既存導入の判定、切替、共有配置、依存、Codex・Antigravity の実行資産の配置の7項目を加える。投影の形態とホスト別の管理範囲、CLI 未導入時の扱いは変更しない。保存時に Design ヘッダの ADF-COVERS(design) 宣言へ新規行の REQ-099-030 から REQ-099-043 を加える。"
    content: |
      ## 投影モデルと installer 対象選択

      投影の形態は junction 投影（`src/common/skills/agentdev-*` → `.opencode/skills/agentdev-*`）と copy 投影（repo-local 正本の実ファイルコピー）の2系統がある。copy 投影は repo-local・配布対象外の正本（repo-agentdev-integrity 等、`repo-*` carve-out 対象）に適用し、正本と投影の両方を git 管理する。copy 投影の整合は IR-016（ファイル集合・内容一致）と IR-068（skill-projection-manifest.yaml の copy_projections 登録突合）が検査する（DEC-065 決定3、REQ-002-020 の限定例外）。

      - installer（scripts/install.ps1、scripts/self-sync.ps1）は単一公開入口と check/dry-run/apply を維持する。導入先リポジトリへ導入する場合は、配置対象を OpenCode、Senpi、Codex、Antigravity の4エージェントから選び、各エージェントの単独と空でない全組み合わせを指定できる。全てを外した空の選択は導入の選択肢に含めない。OpenCode のみ、Senpi のみ、両方の既存選択と明示指定による変更は同じ意味で保つ。Codex・Antigravity は、利用者が選んだ導入先リポジトリに選択したホストのみ投影する。ホーム全域への投影と本体への新ホスト投影は行わない。新ホスト間および既存ホストとの管理境界を分離する。
      - 選択の入力と解決は scripts/install.ps1 が担う。OpenCode と Senpi は `-Hosts`（`none`、`opencode`、`senpi`、`both`）、Codex と Antigravity は `-AgentHosts`（`none`、`codex`、`antigravity`、`both`）で受け付け、両者を1つの選択集合へ解決する。`-Hosts none` は OpenCode・Senpi を選ばない指定であり、Codex・Antigravity だけを選ぶ指定を可能にする。両方とも `none` の空の選択は導入前に拒否する。新規導入では対話ウィザードで4エージェントを個別に問う。非対話で起動して選択が省略された場合は指定方法を案内し、更新で省略された場合は記録された選択を維持する。更新でどちらかの引数だけを指定した場合は、省略された引数のエージェント群は記録された選択を維持し、指定された引数のエージェント群だけを置き換える。新規導入でどちらかの引数だけを指定した場合は、もう片方の引数の指定方法を案内する。本体リポジトリの scripts/self-sync.ps1 の配置対象は変更しない。
      - 選択の集合は成功した適用の後に導入先の .agentdev/install-state.json へ記録し、check、dry-run、apply で共有する。記録は4エージェントの選択集合1つ（空でない `selectedAgents`）を正本とし、Codex と Antigravity の選択を個別に含む。check と dry-run は記録を変更しない。同じ選択の再実行で配置に差を出さない。リリース ZIP 版では、配置した管理対象コピーのパスと内容の要約も同じ記録に含め、所有の確認に使う。記録が読めないまたは値が不正な場合は選択を推定せず、明示選択を求めて停止する。
      - 選択の記録がない既存導入では、所有を確認できる .opencode/、.senpi/ の配置と、既存の記録に残っている Codex・Antigravity の選択（`agentHosts`）から選択を補助的に判定し、確定できる選択は保持する。.agents/skills/ の存在だけでは Codex と Antigravity のどちらを選んだか確定できないため、曖昧な場合は明示選択を案内する。記録に選択がある場合は記録を正本とし、配置からの推定で選択を置き換えない。
      - エージェントの切替は管理対象の配置だけを変更する。切替の dry-run が示した内容を apply が反映し、その後の check に合格する。原本、利用者の設定とスキル、残すエージェントの資産を保持する。チェックアウト版で除去するのは管理リンクと installer が生成した補助ファイル、リリース ZIP 版では、導入の記録にありかつ記録した内容の要約と一致する配布コピーに限る。記録にない配布コピー、記録から変わっている配布コピー、所有を確認できない資産は保持して処理結果に衝突を示し、apply を正常終了させず、選択の記録を更新しない。
      - Codex と Antigravity は .agents/skills/ を共有できる。片方だけを選択した場合に、同じリポジトリを開いたもう片方からも共有スキルが見えることを許容する。共有スキルはどちらかが選択されている間は維持し、両方を選択から外して別のエージェントに切り替えたときは所有が確認できる共有配置だけを除去する。
      - 選んだエージェントの配置に必要な資産と依存を検査する。OpenCode を選ばない導入は、OpenCode 用 textlint の依存実体や OpenCode 用 third-party Skill の配置を要求しない。OpenCode を選択した場合は既存の必要な検査が働く。配置検査と各エージェントでの実行確認は区別する。
      - Codex・Antigravity を選択した導入では、command 本文、Skill 探索の共通 lib、agentdev_gh の engine と gh 用 runner、ホスト接続領域の adapter も、導入先リポジトリの .agents/agentdev/（AgentDevFlow が所有する配置先。共有スキルの配置先 .agents/skills/ とは別の領域）配下へ原本の src/ と同じ相対構造（common/ と codex/・antigravity/ を兄弟とする構成）で配置する。ホスト接続領域のモジュールはこの配下で相対 import を解決し、展開元のリポジトリと OpenCode の配置先に依存しない。Skill 探索の adapter は command 本文の root を展開元リポジトリの src/common/commands/agentdev に固定せず、導入先の .agents/agentdev/common/commands/agentdev から解決する。チェックアウト版では管理リンク、リリース ZIP 版では実ファイルで配置する。
      - 共通原本への投影は同一 ADF 版に整合させる。ホスト別の管理範囲を分離し、片方の更新・除去は他方を壊さない。repo-local 資産（third-party Skill 配置、.agentdev/extensions/**）とユーザー設定（AGENTS.md の harness 選定記述等）を書込み対象から保護する。再実行は冪等とし、不要な登録を増やさない。
      - CLI 未導入でも配置可能とし、配置検査と実行環境の診断を区別する。OmO 版は診断・互換確認にのみ使用する。
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target: docs/designs/foundations/multi-host-canonical-model.md
    target_design: {operation: update, domain: foundations, slug: multi-host-canonical-model}
    target_area: "バックエンド×ホスト接続構成"
    source_items: [AG-011, AG-012, AG-014, AG-015, AG-016, AG-017]
    application_note: "接続境界の項目の直後に、Custom Tool を登録できないホストの adapter の項目を加える。接続境界の項目にある操作契約の格納先と件数の記載は、現行の operation-catalog.ts の20操作へ更新する。節末の H3 見出しを案Aの呼称から GitHub 接続の内容へ改名し、配下の3項目を共通の操作契約への接続、停止と切替、gh 経路の内容へ更新する。非移設の機構と worktree 終了時の品質ゲートは項目を分けて維持する。終了時の品質ゲートの項目には、対象外が OpenCode 用 plugin に依存する検査だけに限ることと、plugin に依存しない必須検査は OpenCode を選択していない導入でも実施し、その失敗を成功として扱わないことを書く。OpenCode・Senpi 向けの接続と試験の項目は変更しない。"
    content: |
      ## バックエンド×ホスト接続構成

      - 接続境界（seam）は Custom Tool 操作契約（GhRunner 型、operation-catalog.ts の20操作）に限定する。GitHub 実装と Local 実現の差し替えモデル（DEC-004、REQ-009-015/020）を両ホストへ適用し、新たなバックエンド抽象層と GitHub 互換ローカルサーバを導入しない（REQ-009-035）。
      - Custom Tool を登録できないホストでは、ホスト接続領域の adapter が、engine が消費する既存の runner 契約（gh CLI の GitHub 実装と Local 実装が同じ境界で差し替わる契約）を各ホストの GitHub プラグインで実装してつなぐ。第2の backend 抽象層は追加しない。ワークフローは共通の操作契約のみを参照し、adapter には Tool と同じ VERIFY ならびに失敗時の意味を等しく適用する。agentdev_gh を参照する配布スキルを新ホストの動作保証から除外しない（REQ-099-023、REQ-011-001、REQ-011-005、REQ-011-008）。
      - ローカルIssueの採番・状態写像・読み書きは共通の操作契約と検証 engine に接続し、ホスト別重複を実装しない。
      - 選択したバックエンドに接続し、同じ Tool 名で両バックエンドを同時有効化しない（REQ-009-037 の同居対象外と、Custom Tool の Local 実現への差し替えは同居に非ずの既存解釈を維持）。

      - agentdev-gh、agentdev-third-party の2系統のホスト間接続について、共通処理（Tool engine への変換、入力検査、契約解釈）とホスト固有処理（OpenCode・Senpi 各自の登録、権限、実行文脈、失敗処理）を区別する（B3-5e）。共通処理は共通原本領域が所有し、ホスト固有処理は各ホスト接続領域が所有する
      - 同等試験の共通判定部分は共通側へ移設し、接続差の試験は各ホストが保持する。公開契約が両ホストで同一に保たれること（現行の主要接続試験の水準を下げないこと）、共通契約の検証とホスト固有の検証の区別、共通エンジンの試験と接続試験の目的の区別の文書化、重複していた管理箇所の削減を確認する。実ホストでの実測は要求しない（実施計画の前提条件1）
      - 試験の目的区別（共通エンジン試験と接続試験）: 共通エンジンの試験（`src/common/` 配下。Tool 操作契約・fail-closed ゲート・VERIFY・バックエンド実装、および両ホストの登録 surface 経由で同一となる共通判定〔読み戻し検証、物理ラベル写像、終了経路、能力欠落の fail-closed。移設先は `src/common/tools/agentdev-gh/tests/four-combination-shared.ts`、`src/common/tools/agentdev-gh/tests/missing-capability-shared.ts`〕）と接続試験（`src/opencode/`・`src/senpi/` 配下。登録 surface の構築、実行 context 形の変換、ホスト向け投影パスの解決）を区別する。共通判定の本体は共通側 helper へ一元化し、各ホスト試験は接続差の検証のみを保持する
      - 両ホストのツール説明（description）は共通正本の定数（`AGENTDEV_GH_TOOL_DESCRIPTION`、`AGENTDEV_THIRD_PARTY_TOOL_DESCRIPTION`）を単一参照とし、公開スキーマ（各 `REQUEST_PROPERTY_SCHEMA`）と併せて各ホストの契約テストが正本同一参照を固定する（J-001 型のツール説明・試験条件の二重保守による更新漏れの再発防止構造）

      ### Codex・Antigravity の GitHub 接続と保証範囲

      - OpenCode・Senpi 向けの Tool 契約、バックエンド構成、既存 guard と検証水準を維持する。新ホストの GitHub 操作は、既存の Tool 契約と共通 engine を再利用して共通の agentdev_gh 操作契約に接続する。既定ではホスト接続領域の adapter が、engine が消費する既存の runner 契約を各ホストの GitHub プラグインで実装してつなぐ。利用者の明示判断で切り替えた gh 経由では、既存の gh 用 runner を使う。
      - 新ホストでは既定で各ホストの GitHub プラグインを共通の操作契約に接続して使う。プラグインが無効または必要な操作を提供しない場合は GitHub 操作を利用者の判断まで停止する。一時的な場合は現在の設定を保持して復旧を待ち、復旧後に再開する。停止中は GitHub 操作も実行経路の設定変更も行わない。恒久的な場合は利用者の明示判断を受けて scripts/switch-github-route.ps1 で gh CLI 経由へ切り替える。切替の承認と個別の GitHub 操作の承認は独立とし、専用スクリプトで設定した gh 経路は再起動後も使う。
      - gh 経路では対象リポジトリへの認証と必要な権限を操作前に確認する。プラグイン経路と gh 経路のいずれでも、結果が不明な操作をまたいで再開する場合は再開前に GitHub の状態を照合し、Issue、PR、コメント等の重複作成を防ぐ。照合で操作対象が一意に確定できた場合はその対象で処理を継続し、行われていないと確定できた場合は実行し、複数の候補が見つかる場合や照合できない場合は書き込まず停止して利用者の判断を求める。ホストごとの GitHub 操作手順を Markdown へ再実装せず、新たなバックエンド抽象層、GitHub 互換ローカルサーバ、agentdev_gh の MCP サーバー化、ADF 独自の MCP 接続を導入しない。
      - 新ホストへ textlint の書込み前 hook、gh 書込み禁止 guard、ADF の配布領域 guard、agentdev_third_party を移さない。worktree を閉じるときに、OpenCode を選択した導入では既存の src/opencode/plugins/agentdev-textlint-guard/gate.ts を対象 worktree に対して使う。OpenCode を選択していない導入でも、OpenCode 用 plugin に依存する検査だけを終了時の品質ゲートの対象外とし、結果にその旨を記録する。plugin に依存しない終了時の必須検査は実施し、失敗を成功として扱わない。ワークフローの開始と GitHub 操作の接続は、OpenCode の併用と展開元を前提としない。未確認の能力は実証済みとせず、Antigravity の仕様検討は公開情報に限定する。
  - id: ACT-DESIGN-003
    artifact: design
    operation: update
    target: docs/designs/foundations/multi-host-canonical-model.md
    target_design: {operation: update, domain: foundations, slug: multi-host-canonical-model}
    target_area: "新ホスト対応の検証"
    source_items: [AG-009, AG-012, AG-013]
    application_note: "検証の項目に、選択したエージェントの集合ごとの検査、エージェント別の起動方法、ホスト単位の完走の判定と実施記録を加え、保証範囲の参照先を改名後の H3 節へ更新する。"
    content: |
      ## 新ホスト対応の検証

      - 新ホストの配布原本・投影を既存の配布境界検査と標準整合性チェックの対象とし、公開入口は既存の業務名・引数・全ガードを維持していることを照合する。導入先で選択したエージェントの集合ごとに、配置と依存の検査が働くことを確認する。
      - 適用先向け案内に、ホスト別の導入選択、エージェント別の起動方法、文書管理、スキル名による入口と引数、入口条件、終了時品質ゲートを利用者が確認する手順と期待結果を記載する。各ホストで Release を含む全公開ワークフローと必要な内部工程を完走できることをホスト単位で判定し、実際に使用した GitHub 実行経路と実機検証の実施者と結果を記録する。Antigravity は実行担当による実機検証を行わず、利用者が確認する。公開資料、静的検証、利用者による動作確認の証拠を区別する。
      - 検証範囲は、導入先リポジトリの選択と、「Codex・Antigravity の GitHub 接続と保証範囲」が定める新ホストの保証・非移設の境界に従う。
  - id: ACT-DESIGN-004
    artifact: design
    operation: update
    target: docs/designs/local/install-script-usability.md
    target_design: {operation: update, domain: local, slug: install-script-usability}
    target_area: "対話ウィザード"
    source_items: [AG-001, AG-002, AG-003, AG-005]
    application_note: "節冒頭の説明にある問う対象を4エージェントへ広げ、新規導入と更新で選択を省略した場合の挙動を更新する。Q1、Q2 のウィザード構成と各 H3 節は変更しない。"
    content: |
      ## 対話ウィザード

      install.ps1 は引数なし起動時、対話ウィザードにより実行モード（check/dry-run/apply）と環境（通常版/ローカル版）に加え、配置対象エージェント（OpenCode、Senpi、Codex、Antigravity）を問う。4エージェントは個別に選び、全てを外した空の選択は受け付けない。配置対象エージェントの選択はマルチホスト原本モデル Design（foundations/multi-host-canonical-model.md）の投影モデルに従い、新規導入では選択を省略せずに求め、非対話で起動して選択が省略された場合は指定方法を案内し、既存導入の更新では記録された選択を維持して明示指定により変更する。ヘルプには dry-run/check/apply の3モードの違い、-LocalMode の判断基準に加え、配置対象エージェント選択の判断基準を明示する（REQ-009-040/042、REQ-099-010）。CLI 未導入でも配置は可能とし、配置検査と実行環境の診断を区別する（REQ-099-011）。

      ### scripts/install.ps1

      引数なし起動時（-Mode 未指定）に以下のウィザードを起動する。Q1 目的は dry-run/check/apply
      の違いを併記する。ウィザード文言はチェックアウト済み前提の案内とし、「clone して実行」系の
      表現を使用しない。

      - Q1 目的:
        - 1) 新規インストール → apply
        - 2) 更新・再同期 → apply
        - 3) 状態確認（検証のみ）→ check
        - 4) 変更予測（変更しない）→ dry-run
      - Q2 環境:
        - 1) GitHub 版（通常）→ $LocalMode = $false
        - 2) ローカル版（GitHub Issue/PR を使わずローカルファイルで運用）→ $LocalMode = $true

      状態確認（Q1 の 3）は旧状態確認専用スクリプト（check-consumer-opencode.ps1）から
      `-Mode check` へ統合された導線である（REQ-009-040、REQ-050-004）。統合後も検査能力の
      欠落はない（「install.ps1 -Mode check の検査カタログ」参照）。

      ### チェックアウト未検出時のエラーメッセージ

      チェックアウト検証は usable checkout 判定で行う（REQ-009-047、REQ-009-048。runtime-package-boundary.md から移管〔REQ-123-003〕）。install スクリプト（-Mode apply / check / dry-run）は、チェックアウト配置先（既定 `.agentdev-plugin/`）配下に共通原本 `src/common/` が存在することで検証し、`.git` の存在を必須としない。版（commit/branch）報告は `.git` が存在する場合のみ行い、ZIP 展開チェックアウトの版は unknown。version manifest は導入せず、ZIP 展開環境はサポート対象外とする。provisioning を代行実行しない。

      チェックアウト配置先に src/opencode/ が存在しない場合、install スクリプトはエラー停止し、
      clone コマンド例とソース ZIP 取得手順を案内表示する（REQ-009-047）。
      案内には次を含める。

      - clone コマンド例（git clone によるチェックアウト配置）
      - ソース ZIP の取得手順（GitHub ソースアーカイブの取得と展開）
      - ZIP 展開時のディレクトリ配置に関する注意: 展開で生じる agent-dev-flow-<ref>/ の一段ネストを
        避け、.agentdev-plugin/src/opencode/ となる配置を指示する
      - scripts/ は .agentdev-plugin/ と同一チェックアウトからコピーする案内（スクリプトと
        チェックアウトの版不一致の防止）

      ### scripts/self-sync.ps1

      引数なし起動時に以下のウィザードを起動する。

      - Q1 目的:
        - 1) 同期実行 → apply
        - 2) 乖離確認 → check
        - 3) 変更予測 → dry-run

      ### 導入先での Codex・Antigravity の選択

      OpenCode のみ、Senpi のみ、両方の選択と既定は既存ホスト用に維持する。導入先の対話選択と明示指定では Codex・Antigravity も選択対象とし、選択したリポジトリ内だけに投影する。ホーム全域と本体リポジトリは新ホストの導入先にしない。配置検査と各ホストの動作確認は区別する。
  - id: ACT-DESIGN-005
    artifact: design
    operation: update
    target: docs/designs/local/install-script-usability.md
    target_design: {operation: update, domain: local, slug: install-script-usability}
    target_area: "導入先での Codex・Antigravity の選択"
    source_items: [AG-001, AG-002, AG-003, AG-005]
    application_note: "既存ホスト用に維持する対象を明示指定へ明確化し、Codex と Antigravity を個別に選べることを加える。導入先をリポジトリ内に限る境界は変更しない。"
    content: |
      ### 導入先での Codex・Antigravity の選択

      OpenCode のみ、Senpi のみ、両方の選択と明示指定は既存ホスト用に維持する。導入先の対話選択と明示指定では Codex・Antigravity も選択対象とし、Codex と Antigravity は個別に選べる。選択したリポジトリ内だけに投影する。ホーム全域と本体リポジトリは新ホストの導入先にしない。配置検査と各ホストの動作確認は区別する。
  - id: ACT-DESIGN-006
    artifact: design
    operation: update
    target: docs/designs/local/runtime-package-boundary.md
    target_design: {operation: update, domain: local, slug: runtime-package-boundary}
    target_area: "scripts 公開入口と内部配置"
    source_items: [AG-015, AG-018]
    application_note: "公開入口の本数を REQ-050-001 の4本へ更新し、切替スクリプトの位置づけを項目として加える。内部配置の規則は変更しない。保存時に Design ヘッダの ADF-COVERS(design) 宣言へ REQ-009-055 と REQ-050-017 を加え、REQ-009-002 の注記の「REQ-050-001 3本構成」を4本構成へ更新する。"
    content: |
      ## scripts 公開入口と内部配置

      - 公開入口4本: consumer 向け `scripts/install.ps1`、self-hosting 向け `scripts/self-sync.ps1`、開発環境セットアップ向け `scripts/setup-hooks.ts`、GitHub 実行経路の切替向け `scripts/switch-github-route.ps1`。入口名は安定契約（REQ-050-001）
      - GitHub 実行経路の切替向け `scripts/switch-github-route.ps1` は consumer 向けとし、導入先リポジトリで GitHub プラグイン経由と gh CLI 経由を切り替える。AgentDevFlow 本体リポジトリでは変更前に停止して適切な公開入口を案内する（REQ-050-017）。切替える経路の設定は導入先リポジトリの `.agentdev/config/github-route.json` に保存し、Codex と Antigravity のそれぞれに `plugin` または `gh` を記録する。切替スクリプトは切替対象のホストを引数で受け付ける。記録のないホストは `plugin` として扱い、記録が読めないまたは値が不正な場合は経路を推定せず GitHub 操作の前に停止する。利用者の明示判断なしに設定を変更しない（REQ-009-055）
      - 内部配置: consumer 専用処理は `scripts/consumer/`、配布・検証処理は `scripts/self/release/`、保守処理は `scripts/self/maintenance/`。release 生成・信頼境界検証・保守処理・単体実行しない内部共通処理を scripts/ 直下に配置しない
      - 旧公開入口3本を現役導線として残さず旧入口名を利用者へ実行させる記述を現行文書群へ残さない（REQ-050-014 が所有）
      - supervisor-bridge の原本は `scripts/self/supervisor-bridge/` 配下（credential 供給ブリッジ。手順と失敗署名は docs/guides/ と docs/knowledge/ が所有）。release archive には含まれない（配布範囲外・自己開発環境限定）。REQ-050-009 の内部配置列挙に本配置を含む
      - archive 専用 installer の原本は `scripts/consumer/archive/install.ps1` として分離保持。release archive 内では `scripts/install.ps1` の名で配置し、両版は異なる installation projection として同一実装へ強制統合しない（REQ-050-010）
      - 誤実行防止の環境判定は install-script-usability「誤実行防止（リポジトリ種別判定）の案内メッセージ」正規所有（REQ-050-006・移管 REQ-123-003）
  - id: ACT-DESIGN-007
    artifact: design
    operation: update
    target: docs/designs/local/runtime-package-boundary.md
    target_design: {operation: update, domain: local, slug: runtime-package-boundary}
    target_area: "Tools / Plugins の配布・投影"
    source_items: [AG-018]
    application_note: "公開入口の本数を REQ-050-001 の4本へ揃える。Tool / Plugin の追加で公開入口を増やさない規則は維持する。"
    content: |
      ## Tools / Plugins の配布・投影

      Custom Tool（原本: src/common/tools/）と Plugin / Hook（原本: src/opencode/plugins/）を正規配布種別として扱い（REQ-052）、原本と実行時投影は Command / Skill と同一の source・projection 原則に従う（配備形態の正は DEC-049）。公開入口は REQ-050-001 の4本とし、Tool / Plugin の追加で新たな公開入口を作らない（REQ-050-001、REQ-052-008）。

      repo-local Plugin（REQ-002-045）の配布除外と自己ホスト投影の契約は `../integrity/distribution-boundary.md`「repo-local Plugin の配布除外と自己ホスト投影」節が正規所有する（移管 REQ-123-003）。
  - id: ACT-DESIGN-008
    artifact: design
    operation: update
    target: docs/designs/local/runtime-package-boundary.md
    target_design: {operation: update, domain: local, slug: runtime-package-boundary}
    target_area: "link mode 接続手順技術詳細"
    source_items: [AG-001, AG-002, AG-003, AG-007]
    application_note: "-LocalMode の項目に OpenCode の配置を必要とする契約を明示し、配置対象エージェントの選択の引数を項目として加える。link の確認と更新運用は変更しない。"
    content: |
      ## link mode 接続手順技術詳細

      `commands/agentdev/`・`skills/agentdev-*/` は通常版・LocalMode とも `src/common/` 配下へ接続（REQ-009 decision #2）。`tools/agentdev-gh/` は通常版 `src/common/tools/agentdev-gh/`、`-LocalMode` 時 `src/common/tools/agentdev-gh/local/`（Local 実装）へ接続（REQ-009 decision #3, REQ-011-006）。

      - Local 実装の原本は `src/common/tools/agentdev-gh/local/` でローカル版は共通原本を変更しない（REQ-009-015/016）。ローカル版は通常版と同じ操作契約で、Issue と PR の読取り・更新・作成済み状態・取り込み結果をローカルIssue（`.agentdev/issues/issue-{NNNN}.md`）の記録へ読み替える（REQ-009-026〜032）。上位 command と skill は Tool 操作契約を参照しローカル版専用の別名 skill や分岐を持たない。ローカルIssueスキーマ原本は [ローカルIssue共通スキーマ](local-case-file.md) で、パッケージは原本を再定義せず `case-schema/` を含める。汎用バックエンド抽象化・`src/opencode-local/`・ローカル版 command・template は作成しない
      - `scripts/install.ps1` は `-Mode`（dry-run / check / apply）に `-LocalMode` スイッチを併用でき、`-Mode` は `-LocalMode` の有無に従属せず従来どおり動作する。`-LocalMode` は OpenCode の配置を必要とする既存の契約を維持し、OpenCode を選択していない導入では指定できない。別スクリプトは新設せずエントリポイントを単一に維持する
      - 配置対象エージェントの選択は `-Hosts`（OpenCode、Senpi）と `-AgentHosts`（Codex、Antigravity）で受け付け、両者を1つの選択集合へ解決する。既存の値と意味を維持し、`-Hosts` に OpenCode・Senpi を選ばない `none` を加えて Codex・Antigravity だけを選ぶ指定を可能にする。全てを外した指定は導入前に拒否する。省略時の挙動、選択の記録、切替の規則は multi-host-canonical-model Design「投影モデルと installer 対象選択」節が所有する
      - **link target 確認と更新運用**: link は意図した target かを確認し（REQ-009 decision #6, REQ-009-010）意図した target 以外へ解決される場合は設定を停止する。link 設定は導入先リポジトリでだけ実行し、更新時は既存 link を解除して同じ target へ再接続し差分生成や変換処理は行わない。更新は利用者の責務であり（REQ-009-049）git pull 後に install を再実行。apply は冪等で再実行で junction 構成を変化させない。チェックアウト検証は install-script-usability「チェックアウト未検出時のエラーメッセージ」参照

      ### ジャンクション状態の判定と自己修復

      ジャンクション対象の状態分類（正常 / wrong target〔管理物・確認不能〕/ ジャンクション以外）、モード別挙動（apply の自己修復・check 報告・dry-run 予測表示）、正本解決条件（`Get-TargetSourcePath`）、修復可否判定（`Test-ManagedProjectionJunction`・`Test-ManagedSenpiJunction`）、収束条件の契約は [install-script-usability.md](install-script-usability.md)「ジャンクション状態の判定と自己修復」節が正規所有する（移管 REQ-123-003。REQ-050-002/003/005/015、REQ-058-001/004/005/006/008/012）。
  - id: ACT-DESIGN-009
    artifact: design
    operation: append
    target: docs/designs/integrity/distribution-boundary.md
    target_design: {operation: update, domain: integrity, slug: distribution-boundary}
    target_area: "archive 公開前検査"
    placement: tail
    source_items: [AG-008]
    application_note: "選択に応じた検査を既存節の末尾へ追記する。公開前検査を必須とすることと、違反が残存する場合の扱いは変更しない。"
    content: |
      検査は導入先で選択したエージェントの集合ごとに、欠落、余分な配置、内容不一致を個別に検出する。原本、収録、設置後の検査をエージェント別に拡張し、候補 archive のスクリプトを実行せずに検証する既存の境界を維持する（REQ-099-042）。
  - id: ACT-DESIGN-010
    artifact: design
    operation: update
    target: docs/designs/integrity/integrity-contracts.md
    target_design: {operation: update, domain: integrity, slug: integrity-contracts}
    target_area: "installed profile"
    source_items: [AG-007, AG-008]
    application_note: "比較対象を選択したエージェントの配置先へ広げ、選択されていないエージェントの配備物の欠落を NG にしないことと、選択されていないエージェントの配置先に残った管理資産を余分な配置として報告することを明示する。比較対象は導入先の選択の記録に従わせる。報告カテゴリと junction の扱いは変更しない。"
    content: |
      ### installed profile

      原本（`src/common/` と各ホスト接続領域）と、導入先で選択したエージェントの配置先（`.opencode/`、`.senpi/`、`.agents/skills/`、`.agents/agentdev/`）を比較し、配置漏れを検出する。比較対象は導入先の .agentdev/install-state.json の選択の記録（`selectedAgents`）に従わせる。選択したエージェントごとに `projection_missing`、`projection_extra`、`content_mismatch` を報告する。選択されていないエージェントの配備物の欠落は NG にしないが、選択されていないエージェントの配置先に ADF の管理資産（`agentdev-*`、`.agents/agentdev/`）が残っている場合は `projection_extra` として報告する。利用者の資産は余分な管理資産に含めない。

      - 選択したエージェントの配置先ごとに原本と配置先を対応づける。`cmdDir` は OpenCode を選択した場合に `.opencode/commands/agentdev` へ、Codex・Antigravity を選択した場合に `.agents/agentdev/common/commands/agentdev` へ直接解決し、原本 fallback を無効化する。選択していない配置先の command ディレクトリは要求しない。
      - 次を NG として報告する: `projection_missing`（原本に有て配置先に無い）、`projection_extra`（配置先に有て原本に無い、`repo-*` repo-local skill は除く）、`content_mismatch`（原本と配置先で内容が異なる）、`broken_junction`（配置先の junction/symlink が解決不能）、`missing_required_dir`（原本必須ディレクトリ欠落）
      - 配置先が存在しない場合は NG とし、原本 fallback だけで成功扱いにしない
      - Windows junction は `realpath` で実体を比較する（健康な junction で `content_mismatch` が発火しないようにする）
  - id: ACT-DESIGN-011
    artifact: design
    operation: update
    target: docs/designs/integrity/integrity-contracts.md
    target_design: {operation: update, domain: integrity, slug: integrity-contracts}
    target_area: "release profile"
    source_items: [AG-008]
    application_note: "手順2 に選択の指定を加え、install 後の欠落の判定を選択した配置先へ限定する。host 側 checker の使い方と処理順序は変更しない。"
    content: |
      ### release profile

      host 側 checker を起点とし、archive を展開→install→installed profile を `--root` 付きで実行する。
      archive は配布物の自己完結を保証するが、checker（`repo-agentdev-integrity`）は archive に同梱せず host 側のものを使う（archive 自己完結と検査実行の分離、v2:REQ-0145-014）。

      処理順序:

      1. `--archive` で指定された ZIP を一時ディレクトリ `<temp>` へ展開する
      2. `<temp>/<root>/scripts/install.ps1 -Source <temp>/<root>/src -Target <temp>/<root>/.opencode -Mode copy -Hosts <選択> -AgentHosts <選択>` を実行する（archive 版 installer。原本は `scripts/consumer/archive/install.ps1` で、archive 内では投影名 `scripts/install.ps1` として配置される）。空でない全15通りの選択をそれぞれ指定して実行し、選択したエージェントの配置先ごとに実ファイルを配置する
      3. host 側 checker を `--profile installed --root <temp>/<root> --json` で起動し、installed profile を実行する
      4. archive は docs/ を含まないため、exit code は `InstalledProfile` カテゴリ（projection_missing/extra/content_mismatch/broken_junction/missing_required_dir）の結果のみで判定する。全文結果は report へ転送する
      5. 成功・失敗の双方で `<temp>` を削除する（cleanup 失敗は warning、exit code は変えない）

      ZIP 自体に junction が保存されていなくても install 後に配置できれば通過する。
      install 後も、選択したエージェントの配置先が欠落する場合は NG とする。選択されていないエージェントの配備物の欠落は NG にしない。
      公開前検証では、配置対象エージェントの選択を指定して archive の展開、install、installed profile を実行し、選択に応じた欠落、余分な配置、内容不一致が個別に検出されることを確認する。
  - id: ACT-DESIGN-012
    artifact: design
    operation: update
    target: docs/designs/integrity/integrity-contracts.md
    target_design: {operation: update, domain: integrity, slug: integrity-contracts}
    target_area: "archive 生成・導入コマンド（§7.5.1, §7.5.2）"
    source_items: [AG-003, AG-004, AG-008, AG-018]
    application_note: "収録対象に Senpi の接続モジュールと切替スクリプトを加え、収録済みの Codex・Antigravity のホスト接続領域を記載に揃え、README の原本位置を現状に合わせる。導入コマンドの配置先を選択したエージェントの配置先へ広げ、Codex・Antigravity の実行資産の配置先と所有を確認できる配布コピーの更新を加え、チェックアウト版と同じ選択入力と選択の記録を加える。exit code と junction を作らない規則は変更しない。"
    content: |
      ### archive 生成・導入コマンド（§7.5.1, §7.5.2）

      archive 生成: `scripts/self/release/package-release-archive.ps1`（原本 `src/common/` と各ホスト接続領域（`src/opencode/`、`src/senpi/`、`src/codex/`、`src/antigravity/`）配下を junction 解決済み実ファイルとして ZIP へ格納）。
      出力は `dist/agentdev-release-<commit-short>.zip`。
      archive 内レイアウトは `agentdev-release-<sha>/` ルートの下に `src/common/commands/agentdev/**`、`src/common/skills/agentdev-*/**`、`src/common/tools/agentdev-*/**`（Custom Tool 配布種別）、`src/opencode/plugins/agentdev-*/**`（Plugin / Hook 配布種別）、`src/senpi/**`（Senpi 接続モジュール）、`src/codex/**`、`src/antigravity/**`（Codex・Antigravity ホスト接続領域）、`scripts/install.ps1`（archive 版。原本 `scripts/consumer/archive/install.ps1` を投影名 `scripts/install.ps1` として格納）、`scripts/switch-github-route.ps1`、`README-INSTALL.md`（原本はリポジトリルートの同名ファイル）を格納する。third-party Skill の本体は release archive へ含めず、利用者環境では宣言（skills.yaml）と取得機構経由で配置する（REQ-002-043、third-party-skill-management Design）。

      | 実行結果 | exit code |
      |---|---|
      | 成功（`dist/*.zip` 生成、archive パスを標準出力へ1行出力） | 0 |
      | 原本欠落・必須ファイル不在 | 2 |
      | 既存 dist 上書き検出（`-Force` 無し） | 3 |

      archive 展開・install: archive 版 `scripts/install.ps1 -Source <src> -Target <.opencode> -Mode copy -Hosts <選択> -AgentHosts <選択>` が、指定された配置対象エージェントの選択に従って実ファイルを配置する。選択の指定と省略時の解決はチェックアウト版と同じ規則を使い、`-Hosts` と `-AgentHosts` を1つの選択集合へ解決する。`-Target` は配置先リポジトリの基準点であり、Senpi は Target の兄弟の `.senpi/` 配下、Codex・Antigravity は同じく兄弟の `.agents/skills/agentdev-*/` 配下へスキルを配置する。Codex・Antigravity を選択した場合は、command 本文、Skill 探索の共通 lib、agentdev_gh の engine と gh 用 runner、ホスト接続領域の adapter を、同じく兄弟の `.agents/agentdev/` 配下へ原本の `src/` と同じ相対構造で配置する。OpenCode を選択した場合は `.opencode/commands/agentdev/`、`.opencode/skills/agentdev-*/`、`.opencode/tools/agentdev-*/`、`.opencode/plugins/agentdev-*/` 配下へ配置し、選択されていないエージェントの配置先には配置しない（原本は `scripts/consumer/archive/install.ps1`）。配置の成功後に、選択と配置した管理対象コピーのパスと内容の要約を Target の兄弟の `.agentdev/install-state.json` へ記録する。更新では、導入の記録にありかつ記録した内容の要約と一致する配布コピーだけを更新と除去の対象とし、それ以外の不一致では上書きせず停止する。third-party Skill の配置は本 install の対象外であり、third-party 取得機構（skills.yaml 宣言に基づく取得）が `.opencode/skills/<name>/` へ配置する（REQ-002-043）。
      junction は作成しない。

      | 実行結果 | exit code |
      |---|---|
      | 成功（全配置完了、内容一致） | 0 |
      | 配置先既存ファイルとの不一致（上書きせず停止） | 4 |
      | 必須ディレクトリ作成失敗、または Source 不在 | 5 |
  - id: ACT-DESIGN-013
    artifact: design
    operation: append
    target: docs/designs/responsibilities/custom-tool-contracts.md
    target_design: {operation: update, domain: responsibilities, slug: custom-tool-contracts}
    target_area: "v4 adapter 経由の harness 接続"
    placement: tail
    source_items: [AG-011, AG-014, AG-015, AG-017]
    application_note: "v4 の Harness/Backend adapter 境界の節へ、Custom Tool を登録できないホストの GitHub 接続を H3 節として末尾へ追記する。既存節は変更しない。"
    content: |
      ### Codex・Antigravity の GitHub 接続

      - Custom Tool を登録できない Codex・Antigravity では、ホスト接続領域の adapter が本 Design の操作契約を各ホストの GitHub プラグインへ接続する。adapter には Tool と同じ VERIFY ならびに失敗時の意味を等しく適用し、操作前の承認と書込み後の読み戻しを維持する。
      - プラグインが無効または必要な操作を提供しない場合は、操作せず失敗を返して利用者の判断まで停止する。adapter が暗黙に gh CLI へ切り替えない。gh 経路への切替は scripts/switch-github-route.ps1 による利用者の明示判断だけで行う。
      - adapter を新たな抽象層にせず、操作契約の正は本 Design、種別契約の正は REQ-052、境界定義の正は responsibility-boundaries とする。agentdev_gh の MCP サーバー化と ADF 独自の MCP 接続は行わない。
  - id: ACT-DESIGN-014
    artifact: design
    operation: update
    target: docs/designs/integrity/integrity-contracts.md
    target_design: {operation: update, domain: integrity, slug: integrity-contracts}
    target_area: "source profile"
    source_items: [AG-008]
    application_note: "原本の検査対象を各ホスト接続領域へ広げる。NG の条件と対象外の検査は変更しない。"
    content: |
      ### source profile

      原本（`src/common/` と各ホスト接続領域（`src/opencode/`、`src/senpi/`、`src/codex/`、`src/antigravity/`）、docs、repo-local checker/tests）を直接検査する。各ホスト接続領域は選択対象となるエージェントの原本であり、欠落している場合は NG にする。

      - `.opencode/commands/agentdev/`、`.opencode/skills/agentdev-*` が存在しないことを NG にしない（worktree 等）
      - 原本ディレクトリや必須ファイルが欠落している場合は NG
      - source/projection 一致検査、IR-058（distribution-untracked-skill）、broken-junction、junction-scan-coverage は対象外。report へ `ProfileScope` info として明示する
      - runtime 参照検査は原本を直接対象とし、配置先からの fallback によって欠落を隠さない（`resolvePathWithFallback` は source profile 既定の挙動を保つ）
  - id: ACT-DESIGN-015
    artifact: design
    operation: update
    target: docs/designs/integrity/distribution-boundary.md
    target_design: {operation: update, domain: integrity, slug: distribution-boundary}
    target_area: "repo-local Plugin の配布除外と自己ホスト投影（runtime-package-boundary.md から移管〔REQ-123-003〕）"
    source_items: [AG-018]
    application_note: "runtime-package-boundary.md が維持する公開入口の規則を、REQ-050-001 の4本へ揃える。配布除外の規則は変更しない。"
    content: |
      ## repo-local Plugin の配布除外と自己ホスト投影（runtime-package-boundary.md から移管〔REQ-123-003〕）

      本節は runtime-package-boundary.md「Tools / Plugins の配布・投影」の repo-local Plugin 契約（REQ-002-045）を引き継ぐ。runtime-package-boundary.md は Custom Tool・Plugin / Hook を正規配布種別として扱う種別宣言（REQ-052）と公開入口を REQ-050-001 の定める4本に限定する規則（REQ-050-001、REQ-052-008）を維持する。

      - 原本配置原則は `src/opencode/plugins/<agentdev-name>/` 配下。consumer 配布系全経路（install、archive installer、package-release-archive）は repo-local 配布除外を実装し、3ファイルの列挙条件を同期する義務を持つ。除外機構は明示的除外リスト等とし、REQ-002-011 の repo-* prefix 方式は plugin に採用しない
      - `scripts/self-sync.ps1` は repo-local Plugin を除外しない（自己ホスト投影を維持）。自己ホスト投影は canonical チェックアウト内部の source → projection 構成であり配布ではないため、配布除外機構の適用対象外である。textlint 検査基盤の保存済み結果（実行時データ）は配布対象外（Plugin 本体実装仕様が所有。DEC-065）
      - 配布除外規則の正本を1箇所に定め、各入口は正本の参照・導出で除外集合を決定し同一の除外集合に単一導出で一致することを検証する。検査側の監査期待値の独立性と検出パイプラインは本 Design「配布テキスト成果物の対象モデル」（監査期待の独立性予約 I-004）正規所有（REQ-029、DEC-014）
  - id: ACT-DESIGN-016
    artifact: design
    operation: update
    target: docs/designs/foundations/multi-host-canonical-model.md
    target_design: {operation: update, domain: foundations, slug: multi-host-canonical-model}
    target_area: "目的"
    source_items: [AG-008, AG-017]
    application_note: "「目的」に示すホスト別接続領域の列挙へ src/codex/、src/antigravity/ を加える。保存時に「ホスト接続領域の配置契約」の節の見出しの括弧内へも同じ2領域を加える。"
    content: |
      ## 目的

      ADF 共通原本（src/common/）とホスト別接続領域（src/opencode/、src/senpi/、src/codex/、src/antigravity/）の配置契約、投影モデル、バックエンド×ホスト接続構成、guard 編集解釈の分離を定義する。REQ-099（マルチホスト併存）の実現構造を所有し、意思決定の原本は「ADF 共通原本とホスト接続領域の分離」Decision が所有する。

conflict_resolutions:
  - id: CR-001
    conflict: >-
      RU-0308 の設計候補「全解除と原本の保護」は、全解除を明示的な空の選択として導入の選択肢に含める案を検討した。導入対象が1つも残まず、現行の引数検証が空の選択を拒否することと衝突する。
    resolution: >-
      空の選択は導入の選択肢に含めず、導入前に拒否する（AG-001）。原本と利用者の設定、スキルの保護と、チェックアウト版と ZIP 版での除去対象の限定、選択の記録は採用する（AG-003、AG-004、AG-005）。
  - id: CR-002
    conflict: >-
      RU-0308 の設計候補「Codex・Antigravity の選択単位」は、ウィザードで Codex と Antigravity を1項目にまとめ、利用者に見える選択を3項目にする案を検討した。Codex と Antigravity を個別に選んで記録することと衝突する。
    resolution: >-
      選択の単位は4エージェントとし、Codex と Antigravity は個別に選んで記録する（AG-001、AG-003、AG-006）。Codex と Antigravity が配置上だけ同じ共有配置を参照する点は採用し、共有配置の保持と除去は別の規則で定める（ACT-REQ-002 の REQ-099-039）。
  - id: CR-003
    conflict: >-
      現行の scripts/install.ps1 は -Hosts の省略時に OpenCode と Senpi の両方を既定で適用し、新規導入では両ホストへの配置を推奨する。RU-0308 の合意済みの方針1は新規導入で選択を求め、非対話で省略された場合は指定方法を案内する。
    resolution: >-
      新規導入では省略時に既定を適用せず指定方法を案内し、更新では記録された選択を維持する（AG-002）。明示指定の値と意味は維持する。
  - id: CR-004
    conflict: >-
      案A（DEC-069 第2項）は Codex・Antigravity の GitHub 操作を各ホストの GitHub プラグインへの操作案内に置き換え、ADF の Issue/PR 作成を OpenCode に引き渡す。RU-0307 は新ホストだけで GitHub 操作を含む全ワークフローを完走できることを求める。
    resolution: >-
      GitHub バックエンドに限り案Aを置き換える。新ホストの GitHub 操作はホスト接続領域の adapter が共通の agentdev_gh 操作契約を各ホストの GitHub プラグインへつなぐ（AG-011、AG-017）。案Aのうち textlint の書込み前 hook、gh 書込み禁止 guard、配布領域 guard、agentdev_third_party を移さないことを維持する。worktree 終了時の品質ゲートは、OpenCode 用 plugin に依存する検査を OpenCode を選択した導入だけを対象とする条件を加え、plugin に依存しない必須検査は OpenCode を選択していない導入でも実施して、その失敗を成功として扱わない。後継 Decision（ACT-DEC-002）が DEC-069 第2項と第3項を部分置換する。
  - id: CR-005
    conflict: >-
      REQ-099-023、REQ-011-001、REQ-011-005、REQ-011-008、REQ-052-012 と DEC-022 決定4・8 は、GitHub I/O を Custom Tool の操作契約集合へ集約する。REQ-011 の適用範囲も GitHub I/O を Custom Tool（agentdev_gh）に集約する。Codex・Antigravity は Custom Tool を登録できず、新ホストだけで GitHub 操作を完走することと衝突する。
    resolution: >-
      GitHub I/O の境界を GitHub I/O を担う agentdev_gh の操作契約集合へ一般化する。Custom Tool を登録できるホストでは Custom Tool が、登録できないホストではホスト接続領域の adapter が同じ操作契約を提供する（AG-017）。agentdev_gh の MCP サーバー化、ADF 独自の MCP 接続、ホスト別の I/O 手続きの Markdown による再実装は行わない。REQ-099-023、REQ-011 の3行と適用範囲、REQ-052-012 を更新し、DEC-022 決定4・8 を後継 Decision が部分置換する（ACT-REQ-005、ACT-REQ-012、ACT-REQ-016、ACT-REQ-017、ACT-DEC-006）。REQ-052-016、REQ-052-017 は Custom Tool agentdev_gh の障害時の回復手続きの規定であるため変更しない。
  - id: CR-006
    conflict: >-
      REQ-050-001 は scripts/ 直下の公開入口を3本に限定し、DEC-021 決定1 と Design の公開入口の記載は追加の公開入口を認めない。RU-0307 は GitHub 実行経路の切替向けの専用スクリプトを scripts/ 直下の公開入口として加える。
    resolution: >-
      REQ-050-001 を4本へ更新し、DEC-021 決定1 を後継 Decision が部分置換する（ACT-REQ-009、ACT-DEC-002、ACT-DEC-005）。Tool / Plugin の追加で公開入口を増やさない REQ-052-008 は変更せず、Design の公開入口の記載を4本へ揃える（ACT-DESIGN-006、ACT-DESIGN-007）。
  - id: CR-007
    conflict: >-
      DEC-016 は導入系スクリプトに副作用ゼロ原則を適用する。切替スクリプトは利用者の明示判断によって GitHub 実行経路の設定を変更するため、導入系スクリプトに含めると導入の操作と切り替えの操作が混同される。
    resolution: >-
      切替スクリプトを導入系スクリプトには含めず、利用者の明示判断なしに経路の設定を変更しない（AG-015、ACT-DEC-002）。導入系スクリプトの原則は変更しない。
  - id: CR-008
    conflict: >-
      RU-0307 は OpenCode・Senpi の現行の gh CLI 経路と既存ローカル Issue モードへの変更を対象外とする。Codex・Antigravity で GitHub 操作を完走するための接続の追加は、既存の経路とモードの維持との境界を明確にする必要がある。
    resolution: >-
      新ホストの対応はホスト単位で判定し、接続の追加は GitHub 操作に限る（AG-012、AG-019）。OpenCode・Senpi の gh CLI 経路とローカルIssueモードは変更しない。
  - id: CR-009
    conflict: >-
      REQ-099-024 は Antigravity の実機検証を実行担当が行わず利用者が確認することを定める。RU-0307 AC-1 は各ホストで実際に使用した GitHub 実行経路と実機検証の実施者と結果を記録することを求める。
    resolution: >-
      実施者と結果を区別して記録する。Antigravity は利用者の確認として記録し、実行担当は代行しない。未確認の能力は実証済みとしない（AG-012）。
  - id: CR-010
    conflict: >-
      AG-007 は OpenCode を選ばない導入が OpenCode 用の依存を要求しないことを定める。現行の -LocalMode は OpenCode の配置を必要とする。
    resolution: >-
      -LocalMode は OpenCode の配置を必要とする契約を維持し、OpenCode を選択していない導入では指定できない。依存の要求は OpenCode の選択に連動させる（ACT-DESIGN-008）。
  - id: CR-011
    conflict: >-
      既存 Design と worktree-operations.md が定める worktree を閉じるときの最終検査は、OpenCode 用の agentdev-textlint-guard に依存する。RU-0308 の受け入れ条件2は、OpenCode を選ばない導入が OpenCode 用 textlint の依存実体の配置を要求しないことを定める。
    resolution: >-
      終了時の品質ゲートは OpenCode 用 plugin に依存する検査だけを OpenCode の選択に連動させる。OpenCode を選択した導入では既存の最終検査を使い、OpenCode を選ばない導入でも OpenCode 用 plugin に依存する検査だけを対象外として結果にその旨を記録し、plugin に依存しない必須検査は実施する。失敗を成功として扱わない規則は変えない。この条件を DEC-069 第3項の部分置換として後継 Decision に明記する（AG-012、ACT-REQ-005、ACT-DEC-002、ACT-DEC-004、ACT-DESIGN-002）。
  - id: CR-012
    conflict: >-
      現行の Codex・Antigravity の投影はスキルだけを .agents/skills/ へ配置し、command 本文と共通資産は展開元の src/ から解決する。REQ-009-012 は導入先インストールの対象を公開実行時成果物に限定し、REQ-002-007、REQ-002-047 はホスト別接続領域を src/opencode/、src/senpi/ に限って列挙する。RU-0307 の受け入れ条件1は新ホストだけでワークフローを完走できることを求め、RU-0308 の受け入れ条件6は展開元を除いた導入先で読み込めることを求める。
    resolution: >-
      Codex・Antigravity を選択した導入では、command 本文、Skill 探索の共通 lib、agentdev_gh の engine と gh 用 runner、ホスト接続領域の adapter を、導入先の .agents/agentdev/ 配下へ原本の src/ と同じ相対構造で配置する。Skill 探索の adapter は command 本文の root を展開元リポジトリの src/common/commands/agentdev に固定せず、導入先の .agents/agentdev/common/commands/agentdev から解決する。導入先インストールの対象にこれらの実行資産を加え、ホスト別接続領域に src/codex/、src/antigravity/ を加える（AG-008、AG-012、AG-017、ACT-REQ-002、ACT-REQ-013、ACT-REQ-014、ACT-REQ-015、ACT-DESIGN-001、ACT-DESIGN-012、ACT-DESIGN-016）。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0308
    target_req: REQ-099
    target_design: docs/designs/foundations/multi-host-canonical-model.md
    operation: update
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: epic
  - ou_id: OU-002
    source_ru: RU-0307
    target_req: REQ-099
    target_design: docs/designs/foundations/multi-host-canonical-model.md
    operation: update
    scale: large
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: epic

result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: >-
      AC-1（RU-0308）。チェックアウト版とリリース ZIP 版のそれぞれを隔離した導入先へ、OpenCode、Senpi、Codex、Antigravity の単独と組み合わせの15通りを、両版とも -Hosts と -AgentHosts で指定して導入する。Codex・Antigravity を含む選択では .agents/agentdev/ 配下の配置も確認する。全てを外した指定も試す。
    pass_criteria: >-
      指定したエージェントの配置先だけに管理対象の配置が生じ、各選択について期待する管理対象パスの集合と実際の集合が一致する。Codex・Antigravity のみの選択で .opencode/ と .senpi/ に管理対象の配置が生じない。全てを外した指定は導入前に拒否される。
    on_failure: >-
      fix-and-reverify。導入スクリプトの選択の解決を修正して同じ組み合わせを再実行する。
  - id: TS-002
    target_item: AG-002
    verification: >-
      AC-3（RU-0308）。新規導入、非対話で選択を省略した起動、既存導入の更新で選択を省略した起動、更新で -Hosts だけを指定した起動、更新で -AgentHosts だけを指定した起動、新規導入で -Hosts だけを指定した非対話の起動、新規導入で -AgentHosts だけを指定した非対話の起動の7通りを実行する。
    pass_criteria: >-
      新規導入ではウィザードが4エージェントを個別に問う。非対話の省略では指定方法が案内され、更新の省略では記録された選択が再現される。片側だけを指定した更新では省略した側の記録された選択が維持され、指定した側だけが置き換わる。新規導入で片側だけを指定した場合はもう片方の指定方法が案内される。
    on_failure: >-
      fix-and-reverify。ウィザードと省略時の扱いを修正して7通りを再実行する。
  - id: TS-003
    target_item: AG-003
    verification: >-
      AC-3（RU-0308）。適用の前後で導入先の .agentdev/install-state.json を比較し、check、dry-run、apply で同じ選択の集合が参照されることを確認する。check と dry-run の実行前後でも記録を比較する。同じ選択で再実行する。
    pass_criteria: >-
      成功した適用の後に選択が4エージェントの選択集合1つ（selectedAgents）として記録され、Codex と Antigravity は個別に含まれる。3モードで同じ選択が参照され、check と dry-run の実行前後で記録が変わらず、再実行で配置に差が出ない。
    on_failure: >-
      fix-and-reverify。記録と参照を修正して前後の記録と再実行結果を再確認する。
  - id: TS-004
    target_item: AG-004
    verification: >-
      AC-3（RU-0308）。エージェントを切り替える dry-run、apply、check をこの順で実行し、適用前後の配置と原本、利用者の設定とスキル、残すエージェントの資産を突き合わせる。リリース ZIP 版では、利用者が管理対象の配布コピーを変更した状態と、導入の記録にない資産が配置先にある状態でも更新する。チェックアウト版では、管理対象のパスに所有を確認できないジャンクションがある状態でも更新する。
    pass_criteria: >-
      dry-run が示した管理対象の変更だけが apply で反映され、check に合格する。原本、利用者の設定とスキル、残すエージェントの資産に差がない。リリース ZIP 版では、導入の記録にありかつ記録した内容の要約と一致する配布コピーだけが更新と除去の対象になる。記録から変わっている配布コピーと記録にない資産は保持されて衝突として報告され、apply は正常終了せず選択の記録は更新されない。チェックアウト版でも、管理対象のパスに所有を確認できないジャンクションがある状態で適用すると、当該ジャンクションは保持され、他の管理対象の配置は適用され、apply は正常終了せず選択の記録は更新されない。
    on_failure: >-
      fix-and-reverify。切替の対象を修正して dry-run、apply、check を再実行する。
  - id: TS-005
    target_item: AG-005
    verification: >-
      AC-5（RU-0308）。選択の記録がない既存導入として、.opencode/ と .senpi/ の配置がある状態、.agents/skills/ だけがある状態、Codex・Antigravity の選択だけが記録された状態を用意する。記録が読めない状態と、記録の値が不正な状態も用意する。所有を確認できない資産が配置先にある場合も加えて導入する。
    pass_criteria: >-
      所有を確認できる配置と既存の記録から判定できた選択は保持される。Codex と Antigravity のどちらか確定できない場合は明示選択が案内される。記録に選択がある場合は記録が正本となり、配置からの推定で選択は置き換えられない。記録が読めない場合と記録の値が不正な場合は選択を推定せず、明示選択を求めて停止する。所有を確認できない資産との衝突では当該資産が保持され、処理結果に衝突が示され、apply は正常終了せず選択の記録は更新されない。
    on_failure: >-
      fix-and-reverify。判定と衝突時の扱いを修正して同じ状態を再実行する。
  - id: TS-006
    target_item: AG-006
    verification: >-
      AC-4（RU-0308）。Codex と Antigravity の両方を選択した導入から、片方だけを選択に残して切り替える場合と、両方を外して別のエージェントへ切り替える場合を実行する。
    pass_criteria: >-
      片方を外した場合は選択の記録だけが変わり、.agents/skills/ の共有スキルが残る。両方を外した場合は所有を確認できる共有配置だけが除去される。
    on_failure: >-
      fix-and-reverify。共有配置の保持と除去の条件を修正して同じ切替を再実行する。
  - id: TS-007
    target_item: AG-007
    verification: >-
      AC-2（RU-0308）。OpenCode を選ばない導入と OpenCode を選択した導入を実行し、依存の要求と検査の実行を確認する。OpenCode を選択していない導入で -LocalMode を指定する。OpenCode を選択した導入で textlint の依存実体を欠く状態でも実行する。
    pass_criteria: >-
      OpenCode を選ばない導入は OpenCode 用 textlint の依存実体や OpenCode 用 third-party Skill の配置を要求しない。OpenCode を選択した導入では既存の検査が働き、依存実体の欠落が検出されて導入が停止する。OpenCode 未選択で -LocalMode を指定すると導入前に拒否される。
    on_failure: >-
      fix-and-reverify。依存の要求と引数の検証を修正して同じ導入を再実行する。
  - id: TS-008
    target_item: AG-008
    verification: >-
      AC-6（RU-0308）。リリース ZIP の収録一覧を選択したエージェントの配布対象と Senpi の接続モジュールの原本と突き合わせる。展開元を除いた導入先で配布対象スキルと Senpi 接続モジュールを読み込む。Codex・Antigravity を含む選択では、.agents/agentdev/ 配下の command 本文、Skill 探索の共通 lib、agentdev_gh の engine と gh 用 runner、ホスト接続領域の adapter を、展開元と .opencode/ を除いた状態で読み込む。公開前検証を空でない全15通りの選択で実行し、選択に応じた欠落、余分な配置、内容不一致を発生させる。選択していないエージェントの配置先に管理資産を置いた状態と、収録ファイル数を2倍にした候補も用意する。収録禁止資産を含む候補と、エージェント別の必要な資産を欠く候補を用意する。
    pass_criteria: >-
      収録一覧に過不足がない。導入先で読み込める。公開前検証が欠落、余分な配置、内容不一致を個別に検出し、収録禁止資産と必要な資産の欠落を検出する。選択していないエージェントの配置先に残った管理資産を余分な配置として検出する。同じファイルについて重複した報告をしない。収録ファイル数を2倍にした候補の検証時間は2倍を大きく超えない。公開前に信頼済みの導入処理で ZIP の実ファイルを照合し、候補 ZIP のスクリプトを実行しない。
    on_failure: >-
      fix-and-reverify。収録と検証を修正して公開前検証を再実行する。
  - id: TS-009
    target_item: AG-009
    verification: >-
      AC-6（RU-0308）。導入手順にエージェント別の起動方法があることを確認し、導入側の検証が配置と読み込みに限ることを確認する。
    pass_criteria: >-
      導入手順に各エージェントの起動方法が記載されている。導入側の検証は配置と読み込みの確認であり、利用者が行う業務の確認と区別されている。
    on_failure: >-
      fix-and-reverify。導入手順を修正して記載内容を再確認する。
  - id: TS-010
    target_item: AG-010
    verification: >-
      変更差分がエージェント本体や CLI のインストール、ホーム全域への配置、本体リポジトリの scripts/self-sync.ps1 の対応エージェントの拡張を含まないことを確認する。
    pass_criteria: >-
      変更差分に RU-0308 の対象外の項目が含まれない。導入の完了条件が、導入先のエージェントが対象スキルを読み込めるところまでである。
    on_failure: >-
      fix-and-reverify。対象外の変更を差分から除いて再確認する。対象外の作業が必要になった場合は Findings に out-of-scope として記録する。
  - id: TS-011
    target_item: AG-011
    verification: >-
      AC-1（RU-0307）。agentdev_gh の操作契約（operation-catalog.ts の操作カタログが定義する全操作）を Codex と Antigravity のそれぞれで呼び出し、操作前の承認と書込み後の読み戻しが行われることを確認する。読み戻しだけが失敗する状態も試す。agentdev_gh を参照する配布スキルを新ホストで読み込む。
    pass_criteria: >-
      全操作が両ホストで共通の操作契約で動き、承認と読み戻しが維持される。読み戻しが欠けた操作は検証不完として成功扱いにならない。失敗は adapter の欠陥とプラグインの能力不足に分けて記録される。agentdev_gh を参照する配布スキルが動作保証から除外されない。agentdev_gh の MCP サーバー化と ADF 独自の MCP 接続がない。
    on_failure: >-
      fix-and-reverify。adapter の欠陥は接続を修正して同じ操作を再実行する。プラグインの能力不足は TS-014 の停止と TS-015 の切替の対象とし、adapter が別の経路へ暗黙に切り替えない。
  - id: TS-012
    target_item: AG-012
    verification: >-
      AC-1（RU-0307）。Codex と Antigravity の各ホストで、Release を含む全公開ワークフロー（req-define、backlog-auto、case-auto、phase 系の5操作）と必要な内部工程（case-open、case-ready、case-run、case-close、実行担当サブエージェントへの委譲、worktree 終了時の品質ゲート、Release の草稿作成と公開）を通しで実行する。OpenCode を選ばない導入でも実行する。OpenCode・Senpi の GitHub 実行経路と既存ローカルIssueモードの回帰試験を実行する。
    pass_criteria: >-
      各工程に完走、未完走、未実施を記録し、すべて完走の場合だけ合格とする。実際に使用した GitHub 実行経路と実機検証の実施者と結果がガイドに記録される。Antigravity は利用者の確認として記録され、実行担当が代行しない。未確認の工程は未実施として合格に含めない。OpenCode を選ばない導入では、OpenCode 用 plugin に依存する検査だけを対象外として結果に記録し、plugin に依存しない終了時の必須検査は実施する。必須検査に失敗がある場合は成功として扱わない。回帰試験に合格する。
    on_failure: >-
      fix-and-reverify。完走できない工程の接続を修正して再実行する。Antigravity の実機確認を利用者が行っていない場合は確認待ちとして記録し、実証済みとしない。
  - id: TS-013
    target_item: AG-013
    verification: >-
      AC-2（RU-0307）。Codex と Antigravity の各ホストで、Release の草稿作成、読み戻し、利用者の明示承認後の公開、公開結果の読み戻しを通しで実行する。
    pass_criteria: >-
      草稿の読み戻し、明示承認、公開、公開結果の読み戻しが各ホストで確認できる。承認なしで公開されない。
    on_failure: >-
      fix-and-reverify。Release 操作の接続を修正して同じ手順を再実行する。
  - id: TS-014
    target_item: AG-014
    verification: >-
      AC-3（RU-0307）。Codex と Antigravity で GitHub プラグインを無効にし、必要な操作を欠く状態で GitHub 操作を試みる。読み戻しだけが提供されなくなる状態も試す。プラグインを復旧させて再開する。
    pass_criteria: >-
      GitHub 操作が利用者の判断まで停止する。読み戻しが欠けた操作は検証不完として失敗する。停止中に GitHub 操作も実行経路の設定変更も発生しない。復旧後に再開できる。
    on_failure: >-
      fix-and-reverify。停止と再開の扱いを修正して同じ状態で再実行する。
  - id: TS-015
    target_item: AG-015
    verification: >-
      AC-4（RU-0307）。Codex と Antigravity で恒久的な切替の承認なしに scripts/switch-github-route.ps1 を実行する。承認後に Codex だけを切替対象として実行し、エージェントを再起動して GitHub 操作を行う。gh 経路で認証と権限が不足する状態と、経路の設定が読めない状態と、経路の設定の値が不正な状態も試す。
    pass_criteria: >-
      承認なしでは経路が変わらない。承認後は gh 経路で GitHub 操作が継続され、再起動後も同じ経路を使う。切替対象に指定していないホストはプラグイン経路のままである。経路の設定が読めない場合や経路の設定の値が不正な場合は GitHub 操作の前に停止する。切替の承認と個別の GitHub 操作の承認が別々に求められる。認証と権限を操作前に確認する。
    on_failure: >-
      fix-and-reverify。切替スクリプトと gh 経路の確認を修正して同じ手順を再実行する。
  - id: TS-016
    target_item: AG-016
    verification: >-
      AC-4（RU-0307）。Issue、PR、コメント等の書込みで結果が不明になる状態を作り、プラグイン経路と gh 経路のそれぞれで再開する。照合で対象が一意に確定する場合、操作が行われていないと確定できる場合、複数の候補が見つかる場合、照合が失敗する場合を試す。
    pass_criteria: >-
      再開前に GitHub の状態が照合され、Issue、PR、コメント等の重複作成が発生しない。照合は再開する操作1件につき1回行われる。一意に確定できた場合はその対象で処理を継続し、行われていないと確定できた場合は実行し、複数の候補が見つかる場合と照合できない場合は書き込まず停止して利用者の判断を求める。
    on_failure: >-
      fix-and-reverify。再開時の照合を修正して同じ状態で再実行する。
  - id: TS-017
    target_item: AG-017
    verification: >-
      AC-1（RU-0307）。GitHub I/O を行う command、skill、ホスト接続領域が参照する対象を調査し、agentdev_gh の操作契約のみを参照することを確認する。ホスト別の I/O 手続きを Markdown へ再実装した配布物がないことを確認する。
    pass_criteria: >-
      GitHub I/O が agentdev_gh の操作契約のみを参照する。ホスト別の I/O 手続きを Markdown で再実装した配布物がない。
    on_failure: >-
      fix-and-reverify。参照を操作契約へ戻して調査を再実行する。
  - id: TS-018
    target_item: AG-018
    verification: >-
      AC-4（RU-0307）。scripts/ 直下の公開入口が4本であることを確認する。チェックアウト版とリリース ZIP 版のそれぞれの導入先で scripts/switch-github-route.ps1 を実行する。AgentDevFlow 本体リポジトリで実行する。
    pass_criteria: >-
      公開入口は4本で、切替スクリプトが両版の導入先で利用できる。本体リポジトリでは変更前に停止して適切な公開入口が案内される。切替えた経路の設定が導入先リポジトリに保存される。
    on_failure: >-
      fix-and-reverify。公開入口と切替スクリプトの配置を修正して再実行する。
  - id: TS-019
    target_item: AG-019
    verification: >-
      変更差分が OpenCode・Senpi の現行の gh CLI 経路と既存ローカル Issue モードへの変更を含まないことを確認する。OpenCode・Senpi の GitHub 実行経路とローカルIssueモードの回帰試験を実行する。
    pass_criteria: >-
      変更差分に対象外の変更が含まれない。回帰試験に合格する。
    on_failure: >-
      fix-and-reverify。対象外の変更を差分から除いて回帰試験を再実行する。対象外の作業が必要になった場合は Findings に out-of-scope として記録する。

realization_actions:
  - id: RA-001
    concern: 配置対象エージェントの選択、選択の記録、切替、共有配置の寿命
    responsibility: >-
      scripts/install.ps1 とウィザードが選択を受け付け、.agentdev/install-state.json へ選択を記録し、切替と共有配置の保持と除去を適用する。
    ownership_hints: ["scripts/install.ps1", "scripts/consumer/install-sync-common.ps1", ".agentdev/README.md"]
    intent: >-
      -Hosts に OpenCode・Senpi を選ばない none を加え、-Hosts と -AgentHosts を1つの選択集合へ解決して、全てを外した指定を導入前に拒否する。新規導入では4エージェントを個別に問う。非対話の省略では指定方法を案内し、更新の省略では記録された選択を再現する。選択は .agentdev/install-state.json の selectedAgents にまとめて記録し、check と dry-run は記録を変更しない。選択の記録がない既存導入は所有を確認できる配置と既存の記録から判定し、確定できない場合は明示選択を案内する。記録に選択がある場合は記録を正本とし、配置からの推定で選択を置き換えない。記録が読めないまたは値が不正な場合は選択を推定せず明示選択を求めて停止する。更新で片側だけを指定した場合は省略した側の記録された選択を維持し、指定した側だけを置き換える。新規導入で片側だけを指定した場合はもう片方の指定方法を案内する。リリース ZIP 版では配置した管理対象コピーのパスと内容の要約を記録し、導入の記録と一致する配布コピーだけを更新と除去の対象にする。所有を確認できない資産との衝突では当該資産を保持して処理結果に衝突を示し、apply を正常終了させず、選択の記録を更新しない。
    verification_refs: [TS-001, TS-002, TS-003, TS-004, TS-005, TS-006]
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006]
  - id: RA-002
    concern: OpenCode 未選択の導入での依存の要求と導入手順の案内
    responsibility: >-
      導入スクリプトが OpenCode 用の依存の要求を OpenCode の選択に連動させ、導入先の README がエージェント別の起動方法を案内する。
    ownership_hints: [".agentdev/README.md"]
    intent: >-
      OpenCode を選ばない導入では OpenCode 用 textlint の依存実体と OpenCode 用 third-party Skill の配置を要求しない。OpenCode を選択した導入では既存の検査を維持する。導入手順に各エージェントの起動方法を記載し、導入の完了条件は導入先のエージェントが対象スキルを読み込めるところまでとする。エージェント本体や CLI のインストールとホーム全域への配置は行わない。
    verification_refs: [TS-007, TS-009, TS-010]
    source_items: [AG-007, AG-009, AG-010]
  - id: RA-003
    concern: エージェント別の収録、設置、設置後の検査
    responsibility: >-
      リリース ZIP の収録と archive 版 installer による配置、導入後の検証が、選択したエージェントの集合ごとに欠落、余分な配置、内容不一致を検出する。archive 版 installer はチェックアウト版と同じ選択入力を受け付け、Codex・Antigravity の実行資産を .agents/agentdev/ 配下へ配置し、導入の記録と一致する配布コピーだけを更新する。チェックアウト版と archive 版の Codex・Antigravity の Skill 探索は、command 本文と共通 lib の root をこの配置先から解決する。
    ownership_hints: ["scripts/install.ps1", "src/common/skills/repo-agentdev-integrity/trusted-distribution-gate/", "scripts/self/release/package-release-archive.ps1", "scripts/consumer/archive/install.ps1", "src/codex/skill-discovery/codex-skill-discovery.ts", "src/antigravity/skill-discovery/antigravity-skill-discovery.ts", "src/common/skills/agentdev-skill-resolution/"]
    intent: >-
      原本、収録、設置後の検査をエージェント別に拡張し、空でない全15通りの選択を検査対象にする。Codex・Antigravity を選択した導入では、command 本文、Skill 探索の共通 lib、agentdev_gh の engine と gh 用 runner、ホスト接続領域の adapter を .agents/agentdev/ 配下へ原本の src/ と同じ相対構造で配置し、展開元と .opencode/ に依存せず読み込めるようにする。Skill 探索の adapter は command 本文の root を展開元リポジトリの src/common/commands/agentdev に固定せず、導入先の .agents/agentdev/common/commands/agentdev から解決する。リリース ZIP 版の更新では、導入の記録にありかつ記録した内容の要約と一致する配布コピーだけを更新と除去の対象にする。候補 archive のスクリプトを実行せずに検証する既存の境界を維持する。
    verification_refs: [TS-004, TS-008]
    source_items: [AG-004, AG-008]
  - id: RA-004
    concern: 導入先で GitHub 実行経路を切り替える公開入口と設定の保存
    responsibility: >-
      scripts/switch-github-route.ps1 が GitHub プラグイン経由と gh CLI 経由の切替を利用者の明示判断で受け付け、切替えた経路の設定を導入先リポジトリの .agentdev/config/github-route.json に保存する。導入手順が、プラグイン利用不能時の停止と恒久的な切替を案内する。
    ownership_hints: ["scripts/switch-github-route.ps1", ".agentdev/config/", "README-INSTALL.md"]
    intent: >-
      切替スクリプトを導入系スクリプトには含めない。AgentDevFlow 本体リポジトリでは変更前に停止して適切な公開入口を案内する。GitHub 操作が停止している間は、恒久的な切替の利用者の明示承認を受けないまま経路を切り替えない。一時的な利用不能時は現在の設定を保持して停止し、臨時の切り替えは行わない。利用者の明示判断なしに経路の設定を変更しない。切替えた経路の設定は再起動後も使われる。経路の設定が読めないまたは値が不正な場合は GitHub 操作の前に停止する。
    verification_refs: [TS-015, TS-018]
    source_items: [AG-015, AG-018]
  - id: RA-005
    concern: 新ホストの GitHub 操作の接続と停止、再開、Release 操作、I/O の参照先
    responsibility: >-
      Codex と Antigravity のホスト接続領域の adapter が agentdev_gh の操作契約を各ホストの GitHub プラグインへ接続する。停止と再開の制御と Release 操作の承認と読み戻しを同じ契約で提供する。
    ownership_hints: ["src/senpi/tools/", "src/codex/", "src/antigravity/", "src/common/tools/agentdev-gh/", "src/common/skills/agentdev-host-github-guidance/", "src/common/README.md"]
    intent: >-
      操作契約の正は agentdev_gh とし、Custom Tool を登録できるホストでは Custom Tool が、登録できないホストでは adapter が同じ操作契約を提供する。adapter に Tool と同じ VERIFY ならびに失敗時の意味を等しく適用し、操作前の承認と書込み後の読み戻しを維持する。プラグインが無効または必要な操作を提供しない場合は操作せず失敗を返して利用者の判断まで停止する。adapter が暗黙に gh CLI へ切り替えない。プラグイン経路と gh 経路のいずれでも、結果不明な操作をまたぐ再開の前に GitHub の状態を照合し、操作対象が一意に確定できた場合はその対象で処理を継続し、行われていないと確定できた場合は実行し、複数の候補が見つかる場合や照合できない場合は書き込まず停止して利用者の判断を求める。agentdev_gh の MCP サーバー化と ADF 独自の MCP 接続、ホスト別の I/O 手続きの Markdown による再実装は行わない。agentdev-host-github-guidance は案Aの案内スキルとしての役割を見直し、新ホスト向けに案内が残る場合は adapter への接続を案内する内容へ更新する。src/common/README.md のホスト別接続領域の記載を4ホスト分へ更新する。OpenCode を選ばない導入でも、終了時の品質ゲートのうち OpenCode 用 plugin に依存する検査だけを対象外とし、結果にその旨を記録する。plugin に依存しない終了時の必須検査は実施し、その失敗を成功として扱わない。
    verification_refs: [TS-011, TS-012, TS-013, TS-014, TS-016, TS-017, TS-019]
    source_items: [AG-011, AG-012, AG-013, AG-014, AG-016, AG-017, AG-019]
  - id: RA-006
    concern: 公開入口の本数と配置先の整合
    responsibility: >-
      scripts/ 直下の公開入口を4本とし、Tool や Plugin の追加で公開入口を増やさない規則を維持する。導入コマンドと検証プロファイルが選択したエージェントの配置先を扱う。
    ownership_hints: ["scripts/switch-github-route.ps1", ".agentdev/config/", "docs/guides/multi-host-operations.md", "traceability/installer-host-projection.yaml"]
    intent: >-
      切替スクリプトを GitHub 実行経路の切替向けの公開入口として scripts/ 直下へ置く。導入先の .opencode/、.senpi/、.agents/skills/、.agents/agentdev/ を選択に従って配置先として扱う。
    verification_refs: [TS-018]
    source_items: [AG-018]

source_summary:
  observation_baseline: eb5ca105f2e9c2714a74efb5c0d8e8cc105b697a
  adoption_basis: >-
    両 RU の対象、合意済みの方針、受け入れ条件は省略せず AG-001〜AG-019 へ対応付けた。採用しなかった案と既存の正規成果物との衝突は CR-001〜CR-012 と RD-001〜RD-002 に記録した。
    agentdev_handoff は本体リポジトリでは通常入力として扱う（REQ-005-022）。両 RU とも採番済みの必須依存 RU はない。RU は参照専用とし、変更していない。
  rus:
    - source_ru: .agentdev/backlog/req-units/RU-0308.md
      source_session: "session:01a21163-bc95-7720-8fac-cc97f0e30ef1"
      agreement_confirmed_at: "2026-11-25T07:01:02.3072680Z"
      acceptance_criteria: [AC-1, AC-2, AC-3, AC-4, AC-5, AC-6]
    - source_ru: .agentdev/backlog/req-units/RU-0307.md
      source_session: "session:01a2115d-2fd6-7820-a038-21e552914ca4"
      agreement_confirmed_at: "2026-11-25T06:46:37Z"
      acceptance_criteria: [AC-1, AC-2, AC-3, AC-4]

important_change_notice:
  status: notified
  change_type: 機能追加
  reason: >-
    Codex と Antigravity だけを選んで導入できるようにし、新ホストだけで GitHub 操作を含む全ワークフローを完走できるようにするため。現行は OpenCode と Senpi を既定で選び、新ホストの GitHub 操作は OpenCode への引き渡しに頼る。
  summary: >-
    OpenCode、Senpi、Codex、Antigravity の4エージェントの空でない任意の組み合わせを導入先で選べるようにする。新規導入で選択を省略した場合は既定を適用せず指定方法を案内する。Codex と Antigravity の GitHub 操作を各ホストの GitHub プラグイン経由で共通の agentdev_gh 操作契約に接続し、GitHub I/O の境界を Custom Tool から agentdev_gh の操作契約集合へ一般化する。GitHub 実行経路を切り替えるための公開入口を scripts/ 直下に1本追加する。
  replaced_decision_items:
    - decision: DEC-069
      item: 第2項（案A。Codex・Antigravity の GitHub 操作を各ホストの GitHub プラグインへの操作案内に置き換え、ADF の Issue/PR 作成を OpenCode に引き渡す）と、第3項のうち worktree 終了時の品質ゲートの利用（OpenCode 用 plugin に依存する検査を OpenCode を選択した導入だけを対象とする条件を加える。plugin に依存しない必須検査は OpenCode を選択していない導入でも実施し、失敗を成功として扱わない）
      replaced_by: ACT-DEC-002
    - decision: DEC-021
      item: 決定1（scripts/ 直下の公開入口を3本に限定）
      replaced_by: ACT-DEC-002
    - decision: DEC-022
      item: 決定4・8（GitHub I/O を Custom Tool の操作契約集合へ集約）
      replaced_by: ACT-DEC-002
    - decision: DEC-049
      item: 決定(3)（配置対象は OpenCode と Senpi から選び、新規導入では両ホストへの配置を推奨）
      replaced_by: ACT-DEC-001
  retained_items:
    - 既存の -Hosts（OpenCode・Senpi）と -AgentHosts（Codex・Antigravity）の明示指定の値と意味
    - OpenCode・Senpi の gh CLI 経由の GitHub 実行経路
    - 既存ローカルIssueモード
    - Custom Tool 操作契約（Custom Tool を登録できるホストの接続）
    - -LocalMode が OpenCode の配置を必要とする契約
    - scripts/self-sync.ps1 の配置対象
    - 導入系スクリプトに切替スクリプトを含めないこと
    - 案Aの非移設定（gh 書込み禁止 guard、配布領域 guard、agentdev_third_party、textlint の書込み前 hook）と、plugin に依存しない worktree 終了時の必須検査
  expected_impact: >-
    導入系スクリプトとウィザード、archive 版 installer の選択入力、リリース ZIP の収録と公開前検証、Codex と Antigravity のホスト接続領域、配布 manifest と配布境界検査が変わる。-Hosts に OpenCode・Senpi を選ばない none が加わる。選択の記録は .agentdev/install-state.json の selectedAgents にまとめられ、GitHub 実行経路の設定は .agentdev/config/github-route.json にホスト別に保存される。既存の導入は記録された選択と所有を確認できる配置から引き継がれ、OpenCode・Senpi の導入では明示指定の意味が変わらない。Codex・Antigravity を選択した導入では、command 本文、共通 engine、ホスト接続領域の adapter が導入先の .agents/agentdev/ に配置される。OpenCode を選ばない導入でも、終了時の品質ゲートのうち OpenCode 用 plugin に依存する検査だけは対象外となり、plugin に依存しない必須検査は実施される。リリース ZIP 版では、導入の記録と内容が一致する配布コピーだけを更新の対象とする。所有を確認できない資産との衝突では当該資産を保持して処理結果に衝突を示し、apply は正常終了せず、選択の記録も更新しない。既存の要件のうち、REQ-009-012（導入先インストールの対象）、REQ-002-007 と REQ-002-047（ホスト別接続領域の列挙）、REQ-011 の適用範囲、REQ-052-012（GitHub Issue/PR 操作の正規経路）を更新する。既存の Design は6文書の節が更新され、ヘッダの ADF-COVERS(design) 宣言に新規の要件行が加わる。
  unconfirmed_items:
    - Codex と Antigravity の GitHub プラグインが提供する操作と、そこへの呼出経路の実機での成立
    - Antigravity の実機確認（利用者が行う。REQ-099-024）
    - 公開入口の追加に伴う配布 manifest と配布境界検査の追従
    - Codex・Antigravity の実行資産を .agents/agentdev/ に配置した導入でのホストでの読込みと、Senpi 接続モジュールが展開元を除いた導入先で相対 import を解決する構成
  note: >-
    通知と承認は区別する。この通知は変更の事前通知であり、Decision の受理と Design の確定は case-ready が利用者の判断で行う。

review_dispositions:
  - id: RD-001
    source_ru: RU-0308
    source_item: RU-0308.設計候補-全解除と原本の保護
    disposition: partially_covered
    reason_code: conflicts_with_existing_contract
    reason: >-
      RU-0308 の設計候補「全解除と原本の保護」のうち、原本と利用者の設定、スキルの保護、チェックアウト版と ZIP 版での除去対象の限定、選択の記録は AG-003〜AG-005 として採用した。全解除を明示的な空の選択として扱う部分は採用しない。導入対象が1つも残らず、RU-0308 の受け入れ条件1が空でない全15通りを対象とし、片方だけを外す場合と両方を外して別のエージェントへ切り替える場合は受け入れ条件4が定めるためである。この処置は事前通知への利用者の明示回答で確定した。
    evidence:
      path: scripts/install.ps1
      section: param ブロックの -Hosts と -AgentHosts の ValidateSet
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0308
    source_item: RU-0308.設計候補-Codex・Antigravityの選択単位
    disposition: partially_covered
    reason_code: conflicts_with_agreed_acceptance_criteria
    reason: >-
      RU-0308 の設計候補「Codex・Antigravity の選択単位」のうち、4エージェントの選択を維持し Codex と Antigravity を配置上だけ同じ共有配置として扱う部分は AG-006 として採用した。ウィザードで1項目にまとめる部分は採用しない。RU-0308 の受け入れ条件4は片方だけを選択から外すと記録上の選択だけが変わることを求めており、1項目では個別の選択と記録ができなくなるためである。
    evidence:
      path: .agentdev/backlog/req-units/RU-0308.md
      section: 決定的受け入れ条件
      checked_at_commit: null
    related_removed_items: []

assembly_evidence:
  - act_id: ACT-REQ-001
    target_file: "docs/requirements/REQ-099.md"
    target_content_sha256: "d71c4108e07fc75f9bce56dafbed653d4c305c28f9ca339561c146304321462b"
    check_scope: {"heading":"## 要件","start_line":14,"end_line":47}
    execution_conditions: {"operation":"append","edit_sha256":"c0b4491fc8a5cc7fe09ad04e10b4332baf063132f65cb16c2d9c4bd5d0742f9a","expected_old_count":null}
    checker:
      name: "assemble-draft-section"
      version: "0.2.0"
      settings:
        heading_match: "exact-after-normalization"
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: "target section only"
    checks_summary: {"pre":{"count":2,"all_ok":true},"post":{"count":2,"all_ok":true}}
    diff_compact: {"changed_lines_count":7,"added":7,"removed":0}
    executed_at: "2026-11-26T10:30:51Z"
  - act_id: ACT-REQ-002
    target_file: "docs/requirements/REQ-099.md"
    target_content_sha256: "d71c4108e07fc75f9bce56dafbed653d4c305c28f9ca339561c146304321462b"
    check_scope: {"heading":"## 要件","start_line":14,"end_line":47}
    execution_conditions: {"operation":"append","edit_sha256":"e744914edc1729f90a0e62616f0ced7015a86760e3e4168623e2fa1ae702ee5d","expected_old_count":null}
    checker:
      name: "assemble-draft-section"
      version: "0.2.0"
      settings:
        heading_match: "exact-after-normalization"
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: "target section only"
    checks_summary: {"pre":{"count":2,"all_ok":true},"post":{"count":2,"all_ok":true}}
    diff_compact: {"changed_lines_count":9,"added":9,"removed":0}
    executed_at: "2026-11-26T10:30:51Z"
  - act_id: ACT-REQ-003
    target_file: "docs/requirements/REQ-099.md"
    target_content_sha256: "d71c4108e07fc75f9bce56dafbed653d4c305c28f9ca339561c146304321462b"
    check_scope: {"heading":"## 要件","start_line":14,"end_line":47}
    execution_conditions: {"operation":"replace","edit_sha256":"1429ae1c585c32a4473966565fb726e8ebd780ad3df923a67df6e48b49b20bbe","expected_old_count":1}
    checker:
      name: "assemble-draft-section"
      version: "0.2.0"
      settings:
        heading_match: "exact-after-normalization"
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: "target section only"
    checks_summary: {"pre":{"count":3,"all_ok":true},"post":{"count":3,"all_ok":true}}
    diff_compact: {"changed_lines_count":1,"added":1,"removed":1}
    executed_at: "2026-11-26T10:30:51Z"
  - act_id: ACT-REQ-004
    target_file: "docs/requirements/REQ-099.md"
    target_content_sha256: "d71c4108e07fc75f9bce56dafbed653d4c305c28f9ca339561c146304321462b"
    check_scope: {"heading":"## 要件","start_line":14,"end_line":47}
    execution_conditions: {"operation":"replace","edit_sha256":"ef17308cc3d3b6a9ad263a49fd19c0d38fbade547b39733a2466e82e63074c7f","expected_old_count":1}
    checker:
      name: "assemble-draft-section"
      version: "0.2.0"
      settings:
        heading_match: "exact-after-normalization"
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: "target section only"
    checks_summary: {"pre":{"count":3,"all_ok":true},"post":{"count":3,"all_ok":true}}
    diff_compact: {"changed_lines_count":1,"added":1,"removed":1}
    executed_at: "2026-11-26T10:30:51Z"
  - act_id: ACT-REQ-005
    target_file: "docs/requirements/REQ-099.md"
    target_content_sha256: "d71c4108e07fc75f9bce56dafbed653d4c305c28f9ca339561c146304321462b"
    check_scope: {"heading":"## 要件","start_line":14,"end_line":47}
    execution_conditions: {"operation":"replace","edit_sha256":"18e0da8189d26b55eabdb4655d60a70f79a12b3a52addd3fd31274156e77c423","expected_old_count":1}
    checker:
      name: "assemble-draft-section"
      version: "0.2.0"
      settings:
        heading_match: "exact-after-normalization"
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: "target section only"
    checks_summary: {"pre":{"count":3,"all_ok":true},"post":{"count":3,"all_ok":true}}
    diff_compact: {"changed_lines_count":3,"added":3,"removed":3}
    executed_at: "2026-11-26T10:30:51Z"
  - act_id: ACT-REQ-006
    target_file: "docs/requirements/REQ-009.md"
    target_content_sha256: "3babb1edf8d053127fcec995068c56fb70fa8d8eaf9d0ae4e83d935b8664b21b"
    check_scope: {"heading":"## 要件","start_line":18,"end_line":76}
    execution_conditions: {"operation":"replace","edit_sha256":"b07f77363984544ea95ceaae6d0a829860e1ff032302cf8ebcfbfa0629c27700","expected_old_count":1}
    checker:
      name: "assemble-draft-section"
      version: "0.2.0"
      settings:
        heading_match: "exact-after-normalization"
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: "target section only"
    checks_summary: {"pre":{"count":3,"all_ok":true},"post":{"count":3,"all_ok":true}}
    diff_compact: {"changed_lines_count":1,"added":1,"removed":1}
    executed_at: "2026-11-26T10:30:51Z"
  - act_id: ACT-REQ-007
    target_file: "docs/requirements/REQ-009.md"
    target_content_sha256: "3babb1edf8d053127fcec995068c56fb70fa8d8eaf9d0ae4e83d935b8664b21b"
    check_scope: {"heading":"## 要件","start_line":18,"end_line":76}
    execution_conditions: {"operation":"replace","edit_sha256":"ab9cc8a81a4023db3924385b69be8a094673f4831dcc603cd1ed6969de4c549b","expected_old_count":1}
    checker:
      name: "assemble-draft-section"
      version: "0.2.0"
      settings:
        heading_match: "exact-after-normalization"
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: "target section only"
    checks_summary: {"pre":{"count":3,"all_ok":true},"post":{"count":3,"all_ok":true}}
    diff_compact: {"changed_lines_count":1,"added":1,"removed":1}
    executed_at: "2026-11-26T10:30:51Z"
  - act_id: ACT-REQ-008
    target_file: "docs/requirements/REQ-009.md"
    target_content_sha256: "3babb1edf8d053127fcec995068c56fb70fa8d8eaf9d0ae4e83d935b8664b21b"
    check_scope: {"heading":"## 要件","start_line":18,"end_line":76}
    execution_conditions: {"operation":"append","edit_sha256":"83e456e7244c6d5215c9dde8d13ffc355b9fc3cda0049cb52be9d4cbbbe16586","expected_old_count":null}
    checker:
      name: "assemble-draft-section"
      version: "0.2.0"
      settings:
        heading_match: "exact-after-normalization"
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: "target section only"
    checks_summary: {"pre":{"count":2,"all_ok":true},"post":{"count":2,"all_ok":true}}
    diff_compact: {"changed_lines_count":2,"added":2,"removed":0}
    executed_at: "2026-11-26T10:30:51Z"
  - act_id: ACT-REQ-009
    target_file: "docs/requirements/REQ-050.md"
    target_content_sha256: "bca3b524ac7e642a130d6ac02a32f89977abae05cf5b6ff947cb01ff641c6a62"
    check_scope: {"heading":"## 要件","start_line":17,"end_line":37}
    execution_conditions: {"operation":"replace","edit_sha256":"c8ecc30a927ba417108e32231ee23bb4daa92ae0b7b1acc1714cd3e6aac2a0ad","expected_old_count":1}
    checker:
      name: "assemble-draft-section"
      version: "0.2.0"
      settings:
        heading_match: "exact-after-normalization"
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: "target section only"
    checks_summary: {"pre":{"count":3,"all_ok":true},"post":{"count":3,"all_ok":true}}
    diff_compact: {"changed_lines_count":1,"added":1,"removed":1}
    executed_at: "2026-11-26T10:30:51Z"
  - act_id: ACT-REQ-010
    target_file: "docs/requirements/REQ-050.md"
    target_content_sha256: "bca3b524ac7e642a130d6ac02a32f89977abae05cf5b6ff947cb01ff641c6a62"
    check_scope: {"heading":"## 要件","start_line":17,"end_line":37}
    execution_conditions: {"operation":"append","edit_sha256":"745aa909f4ac7e8c931d15872111ea7342b9018c4bda4ba3c54b21979b2874f5","expected_old_count":null}
    checker:
      name: "assemble-draft-section"
      version: "0.2.0"
      settings:
        heading_match: "exact-after-normalization"
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: "target section only"
    checks_summary: {"pre":{"count":2,"all_ok":true},"post":{"count":2,"all_ok":true}}
    diff_compact: {"changed_lines_count":2,"added":2,"removed":0}
    executed_at: "2026-11-26T10:30:51Z"
  - act_id: ACT-REQ-011
    target_file: "docs/requirements/REQ-050.md"
    target_content_sha256: "bca3b524ac7e642a130d6ac02a32f89977abae05cf5b6ff947cb01ff641c6a62"
    check_scope: {"heading":"## 適用範囲","start_line":38,"end_line":42}
    execution_conditions: {"operation":"replace","edit_sha256":"bca062db7667d98e7e3ff5ea20311d5a074b9aa0480751c13204d213cde41f6c","expected_old_count":1}
    checker:
      name: "assemble-draft-section"
      version: "0.2.0"
      settings:
        heading_match: "exact-after-normalization"
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: "target section only"
    checks_summary: {"pre":{"count":3,"all_ok":true},"post":{"count":3,"all_ok":true}}
    diff_compact: {"changed_lines_count":1,"added":1,"removed":1}
    executed_at: "2026-11-26T10:30:51Z"
  - act_id: ACT-REQ-012
    target_file: "docs/requirements/REQ-011.md"
    target_content_sha256: "d732c118145fba4add5b404b528218fec67bc1b3f1a17c6836d196f3f09c62a8"
    check_scope: {"heading":"## 要件","start_line":22,"end_line":60}
    execution_conditions: {"operation":"replace","edit_sha256":"be5c5fe775daabc277cdb3c8a68eb25342362c994cf1c66457bf8e6650333e83","expected_old_count":1}
    checker:
      name: "assemble-draft-section"
      version: "0.2.0"
      settings:
        heading_match: "exact-after-normalization"
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: "target section only"
    checks_summary: {"pre":{"count":3,"all_ok":true},"post":{"count":3,"all_ok":true}}
    diff_compact: {"changed_lines_count":7,"added":7,"removed":7}
    executed_at: "2026-11-26T10:30:51Z"
  - act_id: ACT-REQ-013
    target_file: "docs/requirements/REQ-009.md"
    target_content_sha256: "3babb1edf8d053127fcec995068c56fb70fa8d8eaf9d0ae4e83d935b8664b21b"
    check_scope: {"heading":"## 要件","start_line":18,"end_line":76}
    execution_conditions: {"operation":"replace","edit_sha256":"20de1687fe7b8d598790f0ad0061efa28b2a73bf716e1b92aa01612cf81a3f1f","expected_old_count":1}
    checker:
      name: "assemble-draft-section"
      version: "0.2.0"
      settings:
        heading_match: "exact-after-normalization"
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: "target section only"
    checks_summary: {"pre":{"count":3,"all_ok":true},"post":{"count":3,"all_ok":true}}
    diff_compact: {"changed_lines_count":1,"added":1,"removed":1}
    executed_at: "2026-11-26T10:30:51Z"
  - act_id: ACT-REQ-014
    target_file: "docs/requirements/REQ-002.md"
    target_content_sha256: "2a124f00bb47ef4b8a86e109ce90073135aaa7f64bc31446df57e4a8c395c28a"
    check_scope: {"heading":"## 要件","start_line":16,"end_line":59}
    execution_conditions: {"operation":"replace","edit_sha256":"52c26f20fc9098d949c95e2e3f8aab642c4e403c8f2fbb7357eb344e61c2e9da","expected_old_count":1}
    checker:
      name: "assemble-draft-section"
      version: "0.2.0"
      settings:
        heading_match: "exact-after-normalization"
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: "target section only"
    checks_summary: {"pre":{"count":3,"all_ok":true},"post":{"count":3,"all_ok":true}}
    diff_compact: {"changed_lines_count":1,"added":1,"removed":1}
    executed_at: "2026-11-26T10:30:51Z"
  - act_id: ACT-REQ-015
    target_file: "docs/requirements/REQ-002.md"
    target_content_sha256: "2a124f00bb47ef4b8a86e109ce90073135aaa7f64bc31446df57e4a8c395c28a"
    check_scope: {"heading":"## 要件","start_line":16,"end_line":59}
    execution_conditions: {"operation":"replace","edit_sha256":"d5c23b0bb790873117e70fe39b43d3959e739570ed48607cfe6195862ce90305","expected_old_count":1}
    checker:
      name: "assemble-draft-section"
      version: "0.2.0"
      settings:
        heading_match: "exact-after-normalization"
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: "target section only"
    checks_summary: {"pre":{"count":3,"all_ok":true},"post":{"count":3,"all_ok":true}}
    diff_compact: {"changed_lines_count":1,"added":1,"removed":1}
    executed_at: "2026-11-26T10:30:51Z"
  - act_id: ACT-REQ-016
    target_file: "docs/requirements/REQ-011.md"
    target_content_sha256: "d732c118145fba4add5b404b528218fec67bc1b3f1a17c6836d196f3f09c62a8"
    check_scope: {"heading":"## 適用範囲","start_line":61,"end_line":91}
    execution_conditions: {"operation":"replace","edit_sha256":"c4630c6077cf19f1df76f5aa2ae8a5020aec184a28b7257eaad55e6e3726e28c","expected_old_count":1}
    checker:
      name: "assemble-draft-section"
      version: "0.2.0"
      settings:
        heading_match: "exact-after-normalization"
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: "target section only"
    checks_summary: {"pre":{"count":3,"all_ok":true},"post":{"count":3,"all_ok":true}}
    diff_compact: {"changed_lines_count":1,"added":1,"removed":1}
    executed_at: "2026-11-26T10:30:51Z"
  - act_id: ACT-REQ-017
    target_file: "docs/requirements/REQ-052.md"
    target_content_sha256: "2d51948b8a2288eaade112466c2343bb9d58c1a3654f612a1546553286fad293"
    check_scope: {"heading":"## 要件","start_line":17,"end_line":39}
    execution_conditions: {"operation":"replace","edit_sha256":"3f390e64c3bf23c42e7a28bd6672c14e2adff2a06b57548b0c546c9f73db3621","expected_old_count":1}
    checker:
      name: "assemble-draft-section"
      version: "0.2.0"
      settings:
        heading_match: "exact-after-normalization"
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: "target section only"
    checks_summary: {"pre":{"count":3,"all_ok":true},"post":{"count":3,"all_ok":true}}
    diff_compact: {"changed_lines_count":1,"added":1,"removed":1}
    executed_at: "2026-11-26T10:30:51Z"
  - act_id: ACT-DESIGN-001
    target_file: "docs/designs/foundations/multi-host-canonical-model.md"
    target_content_sha256: "853bbd91bba5cdc53c4bd542acb076903beb4bb7fee77352412cbc02c762fddb"
    check_scope: {"heading":"## 投影モデルと installer 対象選択","start_line":37,"end_line":44}
    execution_conditions: {"operation":"replace","edit_sha256":"c70b4b60e178b711630382d84edc5f2241a1186f5d9e878ca9d1b08ad7299f72","expected_old_count":1}
    checker:
      name: "assemble-draft-section"
      version: "0.2.0"
      settings:
        heading_match: "exact-after-normalization"
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: "target section only"
    checks_summary: {"pre":{"count":3,"all_ok":true},"post":{"count":3,"all_ok":true}}
    diff_compact: {"changed_lines_count":8,"added":8,"removed":1}
    executed_at: "2026-11-26T10:30:51Z"
  - act_id: ACT-DESIGN-002
    target_file: "docs/designs/foundations/multi-host-canonical-model.md"
    target_content_sha256: "853bbd91bba5cdc53c4bd542acb076903beb4bb7fee77352412cbc02c762fddb"
    check_scope: {"heading":"## バックエンド×ホスト接続構成","start_line":45,"end_line":61}
    execution_conditions: {"operation":"replace","edit_sha256":"203c1413fd68353ea2e12530aaff8790fa61e8fda1626dea8e96c1c136da909b","expected_old_count":1}
    checker:
      name: "assemble-draft-section"
      version: "0.2.0"
      settings:
        heading_match: "exact-after-normalization"
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: "target section only"
    checks_summary: {"pre":{"count":3,"all_ok":true},"post":{"count":3,"all_ok":true}}
    diff_compact: {"changed_lines_count":16,"added":16,"removed":14}
    executed_at: "2026-11-26T10:30:51Z"
  - act_id: ACT-DESIGN-003
    target_file: "docs/designs/foundations/multi-host-canonical-model.md"
    target_content_sha256: "853bbd91bba5cdc53c4bd542acb076903beb4bb7fee77352412cbc02c762fddb"
    check_scope: {"heading":"## 新ホスト対応の検証","start_line":79,"end_line":84}
    execution_conditions: {"operation":"replace","edit_sha256":"747fb8af36398b1fe2a6f429a4a7b01562555128cdc6b39ec82e513aaa0aeb66","expected_old_count":1}
    checker:
      name: "assemble-draft-section"
      version: "0.2.0"
      settings:
        heading_match: "exact-after-normalization"
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: "target section only"
    checks_summary: {"pre":{"count":3,"all_ok":true},"post":{"count":3,"all_ok":true}}
    diff_compact: {"changed_lines_count":3,"added":3,"removed":3}
    executed_at: "2026-11-26T10:30:51Z"
  - act_id: ACT-DESIGN-004
    target_file: "docs/designs/local/install-script-usability.md"
    target_content_sha256: "042c6c7b5e10d59db3a6003f6b25cd69b02c9658b1be4acfdc4e29f4f777e3e1"
    check_scope: {"heading":"## 対話ウィザード","start_line":19,"end_line":69}
    execution_conditions: {"operation":"replace","edit_sha256":"378dffb186f58f1779dd4c099099bbed4c7e712b0d464691236e43d0fac48c92","expected_old_count":1}
    checker:
      name: "assemble-draft-section"
      version: "0.2.0"
      settings:
        heading_match: "exact-after-normalization"
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: "target section only"
    checks_summary: {"pre":{"count":3,"all_ok":true},"post":{"count":3,"all_ok":true}}
    diff_compact: {"changed_lines_count":1,"added":1,"removed":1}
    executed_at: "2026-11-26T10:30:51Z"
  - act_id: ACT-DESIGN-005
    target_file: "docs/designs/local/install-script-usability.md"
    target_content_sha256: "042c6c7b5e10d59db3a6003f6b25cd69b02c9658b1be4acfdc4e29f4f777e3e1"
    check_scope: {"heading":"### 導入先での Codex・Antigravity の選択","start_line":66,"end_line":69}
    execution_conditions: {"operation":"replace","edit_sha256":"0f768d6c2586841713a143046f792cc990f997a521a7b48bd1714041ef31c7b8","expected_old_count":1}
    checker:
      name: "assemble-draft-section"
      version: "0.2.0"
      settings:
        heading_match: "exact-after-normalization"
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: "target section only"
    checks_summary: {"pre":{"count":3,"all_ok":true},"post":{"count":3,"all_ok":true}}
    diff_compact: {"changed_lines_count":1,"added":1,"removed":1}
    executed_at: "2026-11-26T10:30:51Z"
  - act_id: ACT-DESIGN-006
    target_file: "docs/designs/local/runtime-package-boundary.md"
    target_content_sha256: "ed8464eda03e1e0cacb52d4f04373bd318701b1bcf722b5cbe8c01b8633ee0e5"
    check_scope: {"heading":"## scripts 公開入口と内部配置","start_line":104,"end_line":112}
    execution_conditions: {"operation":"replace","edit_sha256":"6ec90b8bbb35f5c0b9feee56012e99a85827137faee20cb8be455d7dd2bbec78","expected_old_count":1}
    checker:
      name: "assemble-draft-section"
      version: "0.2.0"
      settings:
        heading_match: "exact-after-normalization"
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: "target section only"
    checks_summary: {"pre":{"count":3,"all_ok":true},"post":{"count":3,"all_ok":true}}
    diff_compact: {"changed_lines_count":2,"added":2,"removed":1}
    executed_at: "2026-11-26T10:30:51Z"
  - act_id: ACT-DESIGN-007
    target_file: "docs/designs/local/runtime-package-boundary.md"
    target_content_sha256: "ed8464eda03e1e0cacb52d4f04373bd318701b1bcf722b5cbe8c01b8633ee0e5"
    check_scope: {"heading":"## Tools / Plugins の配布・投影","start_line":113,"end_line":118}
    execution_conditions: {"operation":"replace","edit_sha256":"1083a5e9cdf0110c534e670ff8775e7e4a92beb4080428554bbcb45e2630b655","expected_old_count":1}
    checker:
      name: "assemble-draft-section"
      version: "0.2.0"
      settings:
        heading_match: "exact-after-normalization"
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: "target section only"
    checks_summary: {"pre":{"count":3,"all_ok":true},"post":{"count":3,"all_ok":true}}
    diff_compact: {"changed_lines_count":1,"added":1,"removed":1}
    executed_at: "2026-11-26T10:30:51Z"
  - act_id: ACT-DESIGN-008
    target_file: "docs/designs/local/runtime-package-boundary.md"
    target_content_sha256: "ed8464eda03e1e0cacb52d4f04373bd318701b1bcf722b5cbe8c01b8633ee0e5"
    check_scope: {"heading":"## link mode 接続手順技術詳細","start_line":119,"end_line":130}
    execution_conditions: {"operation":"replace","edit_sha256":"9712c771e9f6c53365b788899dc18f85242cbd80402b5726e0d15f4b309435f9","expected_old_count":1}
    checker:
      name: "assemble-draft-section"
      version: "0.2.0"
      settings:
        heading_match: "exact-after-normalization"
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: "target section only"
    checks_summary: {"pre":{"count":3,"all_ok":true},"post":{"count":3,"all_ok":true}}
    diff_compact: {"changed_lines_count":2,"added":2,"removed":1}
    executed_at: "2026-11-26T10:30:51Z"
  - act_id: ACT-DESIGN-009
    target_file: "docs/designs/integrity/distribution-boundary.md"
    target_content_sha256: "e3081899e20995bf677d6f5ef6a86544d0616e0b704bee4ddb067229c787b6d0"
    check_scope: {"heading":"## archive 公開前検査","start_line":151,"end_line":155}
    execution_conditions: {"operation":"append","edit_sha256":"4361bc0ccf6aa03d93aa2e244e28e392974fa59cf44d3d9423611df886023787","expected_old_count":null}
    checker:
      name: "assemble-draft-section"
      version: "0.2.0"
      settings:
        heading_match: "exact-after-normalization"
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: "target section only"
    checks_summary: {"pre":{"count":2,"all_ok":true},"post":{"count":2,"all_ok":true}}
    diff_compact: {"changed_lines_count":2,"added":2,"removed":0}
    executed_at: "2026-11-26T10:30:51Z"
  - act_id: ACT-DESIGN-010
    target_file: "docs/designs/integrity/integrity-contracts.md"
    target_content_sha256: "6a0a24d8ab879e12f3897e120309af34ebaaa7db9123959fe3a91cf282105606"
    check_scope: {"heading":"### installed profile","start_line":444,"end_line":452}
    execution_conditions: {"operation":"replace","edit_sha256":"d2bb46274ce1e2798e8e2ee97e235996442370447650efbd581af3353fb1f848","expected_old_count":1}
    checker:
      name: "assemble-draft-section"
      version: "0.2.0"
      settings:
        heading_match: "exact-after-normalization"
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: "target section only"
    checks_summary: {"pre":{"count":3,"all_ok":true},"post":{"count":3,"all_ok":true}}
    diff_compact: {"changed_lines_count":3,"added":3,"removed":3}
    executed_at: "2026-11-26T10:30:51Z"
  - act_id: ACT-DESIGN-011
    target_file: "docs/designs/integrity/integrity-contracts.md"
    target_content_sha256: "6a0a24d8ab879e12f3897e120309af34ebaaa7db9123959fe3a91cf282105606"
    check_scope: {"heading":"### release profile","start_line":453,"end_line":468}
    execution_conditions: {"operation":"replace","edit_sha256":"6b44f5c57532d058f9d85240b55d3ffb20534016dc0b4ac03fc75a6558f830ca","expected_old_count":1}
    checker:
      name: "assemble-draft-section"
      version: "0.2.0"
      settings:
        heading_match: "exact-after-normalization"
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: "target section only"
    checks_summary: {"pre":{"count":3,"all_ok":true},"post":{"count":3,"all_ok":true}}
    diff_compact: {"changed_lines_count":8,"added":8,"removed":7}
    executed_at: "2026-11-26T10:30:51Z"
  - act_id: ACT-DESIGN-012
    target_file: "docs/designs/integrity/integrity-contracts.md"
    target_content_sha256: "6a0a24d8ab879e12f3897e120309af34ebaaa7db9123959fe3a91cf282105606"
    check_scope: {"heading":"### archive 生成・導入コマンド（§7.5.1, §7.5.2）","start_line":469,"end_line":489}
    execution_conditions: {"operation":"replace","edit_sha256":"d9e44c3ac6773b58aa3dee1ad5be63101d858ca2e600bd4c6c27a71d79608302","expected_old_count":1}
    checker:
      name: "assemble-draft-section"
      version: "0.2.0"
      settings:
        heading_match: "exact-after-normalization"
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: "target section only"
    checks_summary: {"pre":{"count":3,"all_ok":true},"post":{"count":3,"all_ok":true}}
    diff_compact: {"changed_lines_count":11,"added":11,"removed":11}
    executed_at: "2026-11-26T10:30:51Z"
  - act_id: ACT-DESIGN-013
    target_file: "docs/designs/responsibilities/custom-tool-contracts.md"
    target_content_sha256: "4a2aa5e7672f80e5bda81f1d417ba12c439f7b2a2841f163b5ef2b23ed90b8f7"
    check_scope: {"heading":"## v4 adapter 経由の harness 接続","start_line":122,"end_line":129}
    execution_conditions: {"operation":"append","edit_sha256":"7107f86098d6007466c654cbee995cb4464be27bcdd44f9eff98ed69952522e0","expected_old_count":null}
    checker:
      name: "assemble-draft-section"
      version: "0.2.0"
      settings:
        heading_match: "exact-after-normalization"
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: "target section only"
    checks_summary: {"pre":{"count":2,"all_ok":true},"post":{"count":2,"all_ok":true}}
    diff_compact: {"changed_lines_count":6,"added":6,"removed":0}
    executed_at: "2026-11-26T10:30:51Z"
  - act_id: ACT-DESIGN-014
    target_file: "docs/designs/integrity/integrity-contracts.md"
    target_content_sha256: "6a0a24d8ab879e12f3897e120309af34ebaaa7db9123959fe3a91cf282105606"
    check_scope: {"heading":"### source profile","start_line":435,"end_line":443}
    execution_conditions: {"operation":"replace","edit_sha256":"608a175c50c0a5d272380fca2cab35cbafbfd07648c7c578d4a960c3ba1d6da7","expected_old_count":1}
    checker:
      name: "assemble-draft-section"
      version: "0.2.0"
      settings:
        heading_match: "exact-after-normalization"
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: "target section only"
    checks_summary: {"pre":{"count":3,"all_ok":true},"post":{"count":3,"all_ok":true}}
    diff_compact: {"changed_lines_count":1,"added":1,"removed":1}
    executed_at: "2026-11-26T10:30:51Z"
  - act_id: ACT-DESIGN-015
    target_file: "docs/designs/integrity/distribution-boundary.md"
    target_content_sha256: "e3081899e20995bf677d6f5ef6a86544d0616e0b704bee4ddb067229c787b6d0"
    check_scope: {"heading":"## repo-local Plugin の配布除外と自己ホスト投影（runtime-package-boundary.md から移管〔REQ-123-003〕）","start_line":194,"end_line":201}
    execution_conditions: {"operation":"replace","edit_sha256":"7b5c17640814e7974d203764dc0d84a5122fc7af0551be084412c075cbcfa8c2","expected_old_count":1}
    checker:
      name: "assemble-draft-section"
      version: "0.2.0"
      settings:
        heading_match: "exact-after-normalization"
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: "target section only"
    checks_summary: {"pre":{"count":3,"all_ok":true},"post":{"count":3,"all_ok":true}}
    diff_compact: {"changed_lines_count":1,"added":1,"removed":1}
    executed_at: "2026-11-26T10:30:51Z"
  - act_id: ACT-DESIGN-016
    target_file: "docs/designs/foundations/multi-host-canonical-model.md"
    target_content_sha256: "853bbd91bba5cdc53c4bd542acb076903beb4bb7fee77352412cbc02c762fddb"
    check_scope: {"heading":"## 目的","start_line":14,"end_line":17}
    execution_conditions: {"operation":"replace","edit_sha256":"59892cabd9b635b4a5a5ce6a02c155e8023d409e4594b93a4edcc635eaea03ed","expected_old_count":1}
    checker:
      name: "assemble-draft-section"
      version: "0.2.0"
      settings:
        heading_match: "exact-after-normalization"
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: "target section only"
    checks_summary: {"pre":{"count":3,"all_ok":true},"post":{"count":3,"all_ok":true}}
    diff_compact: {"changed_lines_count":1,"added":1,"removed":1}
    executed_at: "2026-11-26T10:30:51Z"

case_open_hints:
  epic_needed: true
  decomposition: >-
    OU-001 は RU-0308 由来の導入先の選択、選択の記録、切替、収録と検査の契約、OU-002 は RU-0307 由来の新ホストの GitHub 接続と gh 経路の切替の契約。
    OU-002 の新ホストの導入は OU-001 の配置先の選択に依存する。定義は REQ 6件、Decision 2件の新規と4件への注記（DEC-021 は本文冒頭の部分置換記録の更新を含む）、Design 6文書の更新から成る。最終の Issue 階層は後続工程が決める。
  wave_hints: []

draft-meta:
  spec-candidates: []
  ru_handling:
    decision: separate
    reason: >-
      両 RU は対象 REQ と正規所有者を同じくするが、理由が異なる。RU-0308 は導入先の選択、選択の記録、切替、収録と検査の契約を、RU-0307 は新ホストの GitHub 接続と gh 経路の切替の契約を持ち、受け入れ条件と対象外がそれぞれ独立している。定義保存操作を 2 つに分け、OU-002 は OU-001 の配置先の選択に依存する。
    units: [OU-001, OU-002]
  split-forecast:
    target: "REQ-099"
    metrics:
      requirement_lines: 43
      concern_classifications: 2
      artifact_types: 3
      spec_separation_violations: 0
    signals:
      requirement_lines: 0
      concern_classifications: 1
      artifact_types: 1
      spec_separation: 0
    total: 2
    recommended_action: "SPLIT 検討"
    thresholds_ref: "req-structure-review SPLIT 定量閾値"
  split_continuation:
    status: append_confirmed
    note: >-
      SPLIT の要否を事前通知で利用者へ提示し、利用者が REQ-099 を分割せずにこの draft を REQ-099 への追記で保存することを明示した。採用根拠はこの明示回答である。
      継続する理由は、両 RU が REQ-099 を正規所有者に指定していること、要件行数が 51 未満であること、新規行が既存の主題を広げることである。

acceptance_trace:
  "RU-0308-AC-1": {actions: [ACT-REQ-002, ACT-REQ-003, ACT-REQ-007, ACT-DEC-001, ACT-DEC-003, ACT-DESIGN-001, ACT-DESIGN-004, ACT-DESIGN-005, ACT-DESIGN-008, ACT-DESIGN-012], tests: [TS-001, TS-002, TS-010]}
  "RU-0308-AC-2": {actions: [ACT-REQ-002, ACT-REQ-004, ACT-DESIGN-001, ACT-DESIGN-002, ACT-DESIGN-010], tests: [TS-007, TS-012]}
  "RU-0308-AC-3": {actions: [ACT-REQ-002, ACT-REQ-007, ACT-DEC-001, ACT-DESIGN-001, ACT-DESIGN-004, ACT-DESIGN-005, ACT-DESIGN-008, ACT-DESIGN-012], tests: [TS-002, TS-003, TS-004]}
  "RU-0308-AC-4": {actions: [ACT-REQ-002, ACT-DEC-001, ACT-DESIGN-001, ACT-DESIGN-012], tests: [TS-006]}
  "RU-0308-AC-5": {actions: [ACT-REQ-002, ACT-DEC-001, ACT-DESIGN-001, ACT-DESIGN-012], tests: [TS-005]}
  "RU-0308-AC-6": {actions: [ACT-REQ-002, ACT-REQ-004, ACT-REQ-013, ACT-REQ-014, ACT-REQ-015, ACT-DESIGN-003, ACT-DESIGN-009, ACT-DESIGN-010, ACT-DESIGN-001, ACT-DESIGN-011, ACT-DESIGN-012, ACT-DESIGN-014, ACT-DESIGN-016], tests: [TS-008, TS-009]}
  "RU-0307-AC-1": {actions: [ACT-REQ-001, ACT-REQ-005, ACT-REQ-012, ACT-REQ-013, ACT-REQ-014, ACT-REQ-015, ACT-REQ-016, ACT-REQ-017, ACT-DEC-002, ACT-DEC-006, ACT-DESIGN-001, ACT-DESIGN-002, ACT-DESIGN-003, ACT-DESIGN-013, ACT-DESIGN-016], tests: [TS-008, TS-011, TS-012, TS-017, TS-019]}
  "RU-0307-AC-2": {actions: [ACT-REQ-001, ACT-DEC-002, ACT-DESIGN-003], tests: [TS-013]}
  "RU-0307-AC-3": {actions: [ACT-REQ-001, ACT-DEC-002, ACT-DESIGN-002], tests: [TS-014]}
  "RU-0307-AC-4": {actions: [ACT-REQ-001, ACT-REQ-006, ACT-REQ-008, ACT-REQ-009, ACT-REQ-010, ACT-REQ-011, ACT-DEC-002, ACT-DEC-004, ACT-DEC-005, ACT-DEC-006, ACT-DEC-007, ACT-DESIGN-002, ACT-DESIGN-006, ACT-DESIGN-007, ACT-DESIGN-012, ACT-DESIGN-015], tests: [TS-015, TS-016, TS-018]}

boundary_risks:
  dependency: {risk: OpenCode を選ばない導入で OpenCode 用の依存を要求して導入が停止する。Codex・Antigravity の実行資産が展開元や OpenCode の配置先に依存し、単独の導入先でワークフローを開始できない。Senpi の接続モジュールが展開元の共通資産に依存し、リリース ZIP の導入先で読み込めない, tests: [TS-007, TS-008]}
  client_server: {risk: ホストの GitHub プラグインの提供操作が異なり、同じ操作契約でも停止する工程が生じる。読み戻しが欠けた操作が成功扱いになる。結果が不明な GitHub 操作をまたいで再開した場合に Issue、PR、コメント等が重複作成される。GitHub 実行経路の設定が失われるか別のホストへ誤って適用される, tests: [TS-011, TS-012, TS-013, TS-014, TS-015, TS-016, TS-017]}
  execution: {risk: Codex と Antigravity が共有する .agents/skills/ を片方だけを外したときに除去し、他方の導入を壊す。記録のない既存導入で選択を推定で確定させる。所有が不明な配布コピーや利用者が変更した配布コピーを更新と除去の対象にする, tests: [TS-004, TS-005, TS-006]}
  build_runtime: {risk: 収録対象と投影の検査範囲がずれて、選択したエージェントの配備物の欠落や選択していないエージェントの配置先への余分な配置が検出されない。公開入口の追加に伴い、配布 manifest と配布境界検査が旧構成のまま残る。検証の処理量と報告件数が収録規模に対して比例を超えて増え、同じファイルが重複して報告される, tests: [TS-003, TS-008, TS-018]}
  environment_propagation: {risk: 導入先の選択が check、dry-run、apply や検証プロファイルへ伝播せず、省略時や片側だけを指定した場合に選択が変わる。選択の記録を selectedAgents へまとめたことで、既存の記録だけの導入が選択を失う。OpenCode・Senpi の現行の gh CLI 経路とローカルIssueモードに回帰が生じる, tests: [TS-001, TS-002, TS-009, TS-010, TS-012, TS-019]}

definition_evidence:
  existing_design_coverage: {REQ-099-010: ACT-DESIGN-001, REQ-099-020: ACT-DESIGN-012, REQ-099-023: ACT-DESIGN-002, REQ-009-002: ACT-DESIGN-006, REQ-009-040: ACT-DESIGN-004, REQ-050-001: ACT-DESIGN-006, REQ-011-001: ACT-DESIGN-013, REQ-011-005: ACT-DESIGN-013, REQ-011-008: ACT-DESIGN-013, REQ-009-012: ACT-DESIGN-001, REQ-002-007: ACT-DESIGN-002, REQ-002-047: ACT-DESIGN-002, REQ-052-012: ACT-DESIGN-013}
  existing_design_coverage_check: >-
    coverage.ts で更新対象の既存要件行13行を調査した。Design の ADF-COVERS(design) の宣言による design 対応があったのは REQ-099-010、REQ-099-020、REQ-099-023、REQ-009-002、REQ-009-040、REQ-002-007、REQ-002-047、REQ-052-012 の8行。
    REQ-050-001、REQ-011-001、REQ-011-005、REQ-011-008、REQ-009-012 は design 対応がなく、Design の更新に含めて対応づけた。
  decision_judgment_basis: >-
    配置対象の選択体系と既定は DEC-049 決定(3) と DEC-069 第1項が、公開入口の集合は DEC-021 決定1 が、GitHub I/O の境界は DEC-022 決定4・8 が、新ホストの GitHub 操作と worktree 終了時の品質ゲートは DEC-069 第2項・第3項が定めている。
    RU-0308 と RU-0307 はこれらの判断を変更するため、後継 Decision を2件新設し、既存の4件へ部分置換の注記を加える。部分置換の範囲は DEC-049 決定(3)、DEC-069 第2項と第3項のうち worktree 終了時の品質ゲートの利用、DEC-021 決定1、DEC-022 決定4・8 である。DEC-069 第3項は OpenCode 用 plugin に依存する検査を OpenCode を選択した導入だけを対象とする条件を加える置換で、plugin に依存しない終了時の必須検査は OpenCode を選択していない導入でも実施し、その失敗を成功として扱わない。導入系スクリプトの副作用ゼロ原則（DEC-016）は維持し、切替スクリプトを導入系スクリプトに含めない。
  design_action_basis: >-
    選択、記録、切替、共有配置、依存の規則は multi-host-canonical-model Design「投影モデルと installer 対象選択」節が所有する。
    GitHub 接続は同 Design「バックエンド×ホスト接続構成」節と custom-tool-contracts Design、公開入口と導入コマンドは runtime-package-boundary Design と integrity-contracts Design、導入ウィザードは install-script-usability Design、収録と公開前検査は distribution-boundary Design と integrity-contracts Design が所有する。
    16操作はすべて既存節の更新か既存節への追記であり、新規 Design は作らない。
  design_coverage_declaration: >-
    design 対応は全要件行で1件以上必須であり、新規行を policy の optional へ登録しない。新規行の design 対応は、REQ-099-030 から REQ-099-043 を multi-host-canonical-model Design が、REQ-009-055 と REQ-050-017 を runtime-package-boundary Design が成立させる。Design 保存時に各 Design ヘッダの ADF-COVERS(design) 宣言へこれらの行を加え、runtime-package-boundary の REQ-009-002 の注記に残る「REQ-050-001 3本構成」を4本構成へ更新する（ACT-DESIGN-001、ACT-DESIGN-006 の application_note）。あわせて multi-host-canonical-model の「目的」とホスト接続領域の節の見出しに示す領域の列挙へ src/codex/、src/antigravity/ を加える（ACT-DESIGN-016）。
  split_forecast_check: >-
    REQ-099 は既存29行へ14行を加えて43行となり、要件行数は閾値の51未満である。関心分類数2と成果物種別数3が閾値以上で、合計シグナルは2（SPLIT 検討）。
  implementation_facts: >-
    scripts/install.ps1 の -Hosts は opencode、senpi、both の3択、-AgentHosts は none、codex、antigravity、both の4択で、.agentdev/install-state.json には agentHosts だけが選択として記録される。
    Codex と Antigravity の選択は明示指定、記録、既存の管理配置の順で解決される。scripts/consumer/archive/install.ps1 の引数は Source、Target、Mode、AgentHosts だけで、OpenCode・Senpi の選択は .agentdev/install-state.json に記録されない。src/codex/skill-discovery/codex-skill-discovery.ts は command 本文を展開元リポジトリの src/common/commands/agentdev から解決する。ホスト接続領域のモジュールは src/ 配下の共通原本とホスト接続領域が兄弟である構造に依存する相対 import を持つ。src/codex/ と src/antigravity/ の直下には README.md、document-management.md、skill-discovery があり、GitHub 接続の adapter は確認していない。
  nonfunctional_acceptance: >-
    適用対象は、リリース ZIP の収録一覧と設置後の配置の照合、導入の記録と配布コピーの内容の照合による所有の確認、再開前の GitHub の状態の照合である。これらは配布アーカイブの展開結果と外部の GitHub の応答を入力として解釈する処理に該当する。
    処理量の上限は、収録と配置の照合では走査量が配布対象ファイル数と収録ファイル数の和に比例することと内容比較を対象1ファイルにつき1回までとすることであり、GitHub の状態の照合では再開する操作1件につき1回行うことである。
    出力の上限は、衝突、欠落、余分な配置、内容不一致を合わせて配置先ファイルごとに1件までであり、GitHub の状態の照合の結果は操作1件につき1件までである。
    失敗挙動はいずれも fail-closed である。導入の記録と配布コピーの照合で候補が複数見つかった場合や照合できない場合は、当該配布コピーを書き込まず停止する。所有を確認できない資産との衝突では、チェックアウト版は当該資産を保持して他の管理対象の配置を続けたのちに正常終了しない結果を返し、リリース ZIP 版は一致しない配布コピーを上書きせずその不一致で停止する。いずれも成功した適用として扱わず、選択の記録を更新しない。
    TS-008 に処理量と出力の上限を、TS-004 と TS-005 に所有の確認の失敗挙動を、TS-016 に照合の回数と失敗挙動を直列化した。
  runtime_limit: この draft の検証は要件・文書・静的調査に限る。Codex・Antigravity や GitHub プラグインの実行結果は得ていない。
  adversarial_review: >-
    独立した2系統（整合性の観点と完全性の観点）で draft を再検討した。整合性の観点からは要修正10件と取り下げ3件が示され、要修正は ACT-REQ、ACT-DEC、ACT-DESIGN、test strategy、realization_actions、acceptance_trace へ反映した。
    完全性の観点からは11件が示され、片側だけを指定した場合の扱い、照合後の継続規則、リリース ZIP 版の管理対象コピーの所有の確認、Codex・Antigravity の実行資産の配置先、OpenCode を選ばない導入での終了時の品質ゲート、5観点の境界、非機能の受け入れ条件として反映した。このうち片側だけを指定した場合の扱いと OpenCode を選ばない導入での終了時の品質ゲートは、既存の受け入れ条件から導ける判断として定め、事前通知で利用者に示して覆せるものとした。差分は独立した読み取り専用の審査で再検証し、8件の要修正を AG、既存 REQ 行、Decision の部分置換の範囲、Design の規定、realization_actions、test strategy、非機能の受け入れ条件へ反映した。反映後の draft を独立した読み取り専用の審査で閉鎖確認し、残った5件の指摘と5件の新規の不整合を AG、既存 REQ 行、Decision の部分置換の範囲と本文冒頭の部分置換記録、Design の保存時の宣言と「目的」、conflict_resolutions、realization_actions、acceptance_trace へ反映した。その再確認では10件すべてが閉鎖され、新たに ACT-DESIGN-002 が置き換える節に残っていた操作カタログの格納先と件数の旧記載が1件見つかったため、現行の operation-catalog.ts の20操作へ修正した。
    追加の利用者判断2件は、事前通知への利用者の明示回答で確定した。REQ-099 は分割せず追記で保存し、全解除は空の選択として扱わない。事前通知に示した派生判断への上書きはなかった。Antigravity の実機確認の結果はこの時点で受領しておらず、完走確認の完了前に利用者から受け取る。
```

# summary

Codex、Antigravity、OpenCode、Senpi から、導入先リポジトリに AgentDevFlow を配置する対象を選べるようにする。選択は導入先に記録され、更新で省略した場合は前回の選択が再現される。

Codex と Antigravity では各ホストの GitHub プラグインを共通の操作契約に接続し、Release を含む全ワークフローを完走できるようにする。プラグインが使えない場合は GitHub 操作を利用者の判断まで停止し、利用者の明示判断で gh 経路へ切り替える。

OpenCode を選ばない導入でも、選択したホストでのワークフローの開始から GitHub 操作までに必要な資産は導入先に配置される。

OpenCode・Senpi の既存の GitHub 経路とローカルIssueモードは維持する。

