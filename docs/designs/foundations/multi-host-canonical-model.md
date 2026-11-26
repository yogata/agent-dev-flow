---
title: マルチホスト原本モデル（共通原本とホスト別接続の分離）
status: accepted
created: 2026-10-02
updated: 2026-11-26
---
<!-- ADF-COVERS(design): REQ-099-001, REQ-099-002, REQ-099-003, REQ-099-004, REQ-099-005, REQ-099-006, REQ-099-007, REQ-099-008, REQ-099-009, REQ-099-010, REQ-099-011, REQ-099-012, REQ-099-013, REQ-099-014, REQ-099-015, REQ-099-016, REQ-099-017, REQ-099-018, REQ-099-019, REQ-099-020, REQ-099-021, REQ-099-022, REQ-099-023, REQ-099-024, REQ-099-025, REQ-099-026, REQ-099-027, REQ-099-028, REQ-099-029, REQ-099-030, REQ-099-031, REQ-099-032, REQ-099-033, REQ-099-034, REQ-099-035, REQ-099-036, REQ-099-037, REQ-099-038, REQ-099-039, REQ-099-040, REQ-099-041, REQ-099-042, REQ-099-043 -->
<!-- ADF-COVERS(design): REQ-002-007, REQ-002-008, REQ-002-009, REQ-002-019, REQ-002-043, REQ-002-045, REQ-002-047（REQ-002-047 の配備形態面。配布依存境界の検査モデル面は runtime-package-boundary.md が維持） -->
<!-- ADF-COVERS(design): REQ-009-015, REQ-009-016, REQ-009-019, REQ-009-020, REQ-009-036, REQ-009-040, REQ-009-042（link 元原本・installer 配置対象選択面。実行手順詳細は runtime-package-boundary.md・install-script-usability.md が維持） -->
<!-- ADF-COVERS(design): REQ-018-001（構造系テスト fallback の fallback 先を共通原本へ更新する面） -->

# マルチホスト原本モデル（共通原本とホスト別接続の分離）

## 目的

ADF 共通原本（src/common/）とホスト別接続領域（src/opencode/、src/senpi/、src/codex/、src/antigravity/）の配置契約、投影モデル、バックエンド×ホスト接続構成、guard 編集解釈の分離を定義する。REQ-099（マルチホスト併存）の実現構造を所有し、意思決定の原本は「ADF 共通原本とホスト接続領域の分離」Decision が所有する。

## 共通原本領域の配置契約（src/common/）

- 共通の Workflow Skill、Capability Skill、Command の業務契約・本文、template、共有可能な Tool engine（agentdev_gh の GitHub 実装と Local 実現、agentdev_third_party の engine 部）、guard の共通判定を配置する。
- 共通原本は host 非依存とし、配布物の harness 非依存性（harness 分離モデル Design）に従う。ホスト名、起動 API、実行制御パラメータを本文に固定しない。
- ホスト別コピーの業務手順を独立編集する構造を持たない。両ホストの公開入口は同じ業務契約を参照する。

## ホスト接続領域の配置契約（src/opencode/、src/senpi/、src/codex/、src/antigravity/）

- 公開入口（Command の薄い接続）、Tool 登録、plugin/hook または extension、引数・結果・実行 context の変換を配置する。
- ホスト固有の起動 API、category／agent 選定、通知・継続・取消の扱い、品質実行入口は、限定された実行設定・reference に集約する。
- OpenCode 用 plugin/hook の原本は src/opencode/plugins/ 配下（REQ-002-045）。他ホスト用は当該ホスト接続領域に同等の位置づけで配置する。

### Codex・Antigravity の配布接続

- Codex・Antigravity のホスト接続領域は文書管理、コマンド、スキルの公開接続を所有する。ホスト非依存の業務・安全・品質の原本は src/common/ に保ち、両ホストの業務正本を複製しない。
- Senpi と同様にスキル名を入口とし、呼出し対応表で業務名と引数を共通コマンド契約に写す。対応スキルに重複していない入力契約、編集範囲等も入口で適用する。
- 配布実行面の .opencode/ 参照を用途・適用ホスト別に記録する。ホスト固有の参照は接続に閉じ、共通実行に必要な参照は共通原本または選択ホストの接続先へ解決する。既存 OpenCode 専用参照は必要な範囲に限って維持する。
- 既存能力と要求される契約の対応をホスト別に記録する。ADF から取り込んだ機能は対応根拠を明示し、ホストに同等機能がある場合は不足と判断した理由を添える。

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

## guard 編集解釈の分離

- guard の共通判定は共通原本側が所有し、ホスト接続側は当該ホストの編集操作（write/edit/patch 等）の意味論を解釈して共通判定へ接続する。入力キーの機械的な変更だけで編集意味論を同一と扱わない。
- 拒否時に副作用を発生させず、正常操作を正しく許可し、検査不能を成功扱いしない（fail-closed）。配布用と ADF 自己ホスト用の適用範囲を維持する。

## 存在チェックと能力検証の分離（横断原則）

対象の選択（存在チェック）と対象の能力確認（期待する機能・契約の充足）を別のチェックとして構成する。
能力検証に不合格の場合は暗黙のフォールバックをせず、明示的な失敗として停止する（fail-closed）。
エラーメッセージには復旧手順を含める。選択ロジック（runner・実行経路の差し替え等）を検証するテストには
「対象が存在しない」「存在するが能力不足」の両ケースを含める（Case #3316 PR #3332 実績。
guard 分離節（存在チェックと整合性検証の分離）と同型の横断原則）。

## Command 対応表

- 両ホストで業務名（req-define、case-auto 等）と引数の意味を維持する。表記が異なる場合は対応表を提供し、展開テストで同じ Workflow Skill への到達を確認する。

## 新ホスト対応の検証

- 新ホストの配布原本・投影を既存の配布境界検査と標準整合性チェックの対象とし、公開入口は既存の業務名・引数・全ガードを維持していることを照合する。導入先で選択したエージェントの集合ごとに、配置と依存の検査が働くことを確認する。
- 適用先向け案内に、ホスト別の導入選択、エージェント別の起動方法、文書管理、スキル名による入口と引数、入口条件、終了時品質ゲートを利用者が確認する手順と期待結果を記載する。各ホストで Release を含む全公開ワークフローと必要な内部工程を完走できることをホスト単位で判定し、実際に使用した GitHub 実行経路と実機検証の実施者と結果を記録する。Antigravity は実行担当による実機検証を行わず、利用者が確認する。公開資料、静的検証、利用者による動作確認の証拠を区別する。
- 検証範囲は、導入先リポジトリの選択と、「Codex・Antigravity の GitHub 接続と保証範囲」が定める新ホストの保証・非移設の境界に従う。

## 関連

- REQ-099（マルチホスト併存）: 成果定義の正規所有者
- Decision「ADF 共通原本とホスト接続領域の分離」（DEC-049）: 意思決定の原本
- harness-separation-model.md: harness 分離原則、配布物の harness 非依存性
- runtime-package-boundary.md、install-script-usability.md: link mode・installer 実行詳細
- distribution-boundary.md: 配布依存境界の検査モデル
