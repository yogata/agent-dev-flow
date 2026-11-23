---
title: マルチホスト原本モデル（共通原本とホスト別接続の分離）
status: accepted
created: 2026-10-02
updated: 2026-11-24
---
<!-- ADF-COVERS(design): REQ-099-001, REQ-099-002, REQ-099-003, REQ-099-004, REQ-099-005, REQ-099-006, REQ-099-007, REQ-099-008, REQ-099-009, REQ-099-010, REQ-099-011, REQ-099-012, REQ-099-013, REQ-099-014, REQ-099-015, REQ-099-016, REQ-099-017, REQ-099-018, REQ-099-019, REQ-099-020, REQ-099-021, REQ-099-022, REQ-099-023, REQ-099-024, REQ-099-025, REQ-099-026, REQ-099-027, REQ-099-028, REQ-099-029 -->
<!-- ADF-COVERS(design): REQ-002-007, REQ-002-008, REQ-002-009, REQ-002-019, REQ-002-043, REQ-002-045, REQ-002-047（REQ-002-047 の配備形態面。配布依存境界の検査モデル面は runtime-package-boundary.md が維持） -->
<!-- ADF-COVERS(design): REQ-009-015, REQ-009-016, REQ-009-019, REQ-009-020, REQ-009-036, REQ-009-040, REQ-009-042（link 元原本・installer 配置対象選択面。実行手順詳細は runtime-package-boundary.md・install-script-usability.md が維持） -->
<!-- ADF-COVERS(design): REQ-018-001（構造系テスト fallback の fallback 先を共通原本へ更新する面） -->

# マルチホスト原本モデル（共通原本とホスト別接続の分離）

## 目的

ADF 共通原本（src/common/）とホスト別接続領域（src/opencode/、src/senpi/）の配置契約、投影モデル、バックエンド×ホスト接続構成、guard 編集解釈の分離を定義する。REQ-099（マルチホスト併存）の実現構造を所有し、意思決定の原本は「ADF 共通原本とホスト接続領域の分離」Decision が所有する。

## 共通原本領域の配置契約（src/common/）

- 共通の Workflow Skill、Capability Skill、Command の業務契約・本文、template、共有可能な Tool engine（agentdev_gh の GitHub 実装と Local 実現、agentdev_third_party の engine 部）、guard の共通判定を配置する。
- 共通原本は host 非依存とし、配布物の harness 非依存性（harness 分離モデル Design）に従う。ホスト名、起動 API、実行制御パラメータを本文に固定しない。
- ホスト別コピーの業務手順を独立編集する構造を持たない。両ホストの公開入口は同じ業務契約を参照する。

## ホスト接続領域の配置契約（src/opencode/、src/senpi/）

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

- installer（scripts/install.ps1、scripts/self-sync.ps1）は単一公開入口と check/dry-run/apply を維持する。OpenCode のみ、Senpi のみ、両方の既存選択と、新規導入時の両方推奨、既存導入の選択維持と明示指定による変更を保つ。Codex・Antigravity は、利用者が選んだ導入先リポジトリに選択したホストのみ投影する。ホーム全域への投影と本体への新ホスト投影は行わない。新ホスト間および既存ホストとの管理境界を分離する。
- 共通原本への投影は同一 ADF 版に整合させる。ホスト別の管理範囲を分離し、片方の更新・除去は他方を壊さない。repo-local 資産（third-party Skill 配置、.agentdev/extensions/**）とユーザー設定（AGENTS.md の harness 選定記述等）を書込み対象から保護する。再実行は冪等とし、不要な登録を増やさない。
- CLI 未導入でも配置可能とし、配置検査と実行環境の診断を区別する。OmO 版は診断・互換確認にのみ使用する。

## バックエンド×ホスト接続構成

- 接続境界（seam）は Custom Tool 操作契約（GhRunner 型、contracts.ts の16操作）に限定する。GitHub 実装と Local 実現の差し替えモデル（DEC-004、REQ-009-015/020）を両ホストへ適用し、新たなバックエンド抽象層と GitHub 互換ローカルサーバを導入しない（REQ-009-035）。
- ローカルIssueの採番・状態写像・読み書きは共通の操作契約と検証 engine に接続し、ホスト別重複を実装しない。
- 選択したバックエンドに接続し、同じ Tool 名で両バックエンドを同時有効化しない（REQ-009-037 の同居対象外と、Custom Tool の Local 実現への差し替えは同居に非ずの既存解釈を維持）。

- agentdev-gh、agentdev-third-party の2系統のホスト間接続について、共通処理（Tool engine への変換、入力検査、契約解釈）とホスト固有処理（OpenCode・Senpi 各自の登録、権限、実行文脈、失敗処理）を区別する（B3-5e）。共通処理は共通原本領域が所有し、ホスト固有処理は各ホスト接続領域が所有する
- 同等試験の共通判定部分は共通側へ移設し、接続差の試験は各ホストが保持する。公開契約が両ホストで同一に保たれること（現行の主要接続試験の水準を下げないこと）、共通契約の検証とホスト固有の検証の区別、共通エンジンの試験と接続試験の目的の区別の文書化、重複していた管理箇所の削減を確認する。実ホストでの実測は要求しない（実施計画の前提条件1）
- 試験の目的区別（共通エンジン試験と接続試験）: 共通エンジンの試験（`src/common/` 配下。Tool 操作契約・fail-closed ゲート・VERIFY・バックエンド実装、および両ホストの登録 surface 経由で同一となる共通判定〔読み戻し検証、物理ラベル写像、終了経路、能力欠落の fail-closed。移設先は `src/common/tools/agentdev-gh/tests/four-combination-shared.ts`、`src/common/tools/agentdev-gh/tests/missing-capability-shared.ts`〕）と接続試験（`src/opencode/`・`src/senpi/` 配下。登録 surface の構築、実行 context 形の変換、ホスト向け投影パスの解決）を区別する。共通判定の本体は共通側 helper へ一元化し、各ホスト試験は接続差の検証のみを保持する
- 両ホストのツール説明（description）は共通正本の定数（`AGENTDEV_GH_TOOL_DESCRIPTION`、`AGENTDEV_THIRD_PARTY_TOOL_DESCRIPTION`）を単一参照とし、公開スキーマ（各 `REQUEST_PROPERTY_SCHEMA`）と併せて各ホストの契約テストが正本同一参照を固定する（J-001 型のツール説明・試験条件の二重保守による更新漏れの再発防止構造）

### Codex・Antigravity の案Aと適用範囲

- OpenCode・Senpi 向けの Tool 契約、バックエンド構成、既存 guard と検証水準を維持する。新ホストに同じ接続・動作保証を与えない。
- 案Aは、agentdev_gh を参照する配布17スキル（repo-local の repo-agentdev-integrity を除く）に対し、本文中の操作を各ホストの既存 GitHub プラグイン操作で代える説明を1スキルに集約する。17スキルの動作は保証せず、ADF の Issue/PR 作成は OpenCode に引き渡す。説明は ADF の操作契約を置き換える実装ではない。agentdev_gh の MCP サーバー化と独自 MCP 化を行わない。未確認の能力は実証済みとせず、Antigravity の仕様検討は公開情報に限定する。
- 新ホストへ textlint の書込み前 hook、gh 書込み禁止 guard、ADF の配布領域 guard、agentdev_third_party を移さない。案Aでは worktree を閉じるときに既存の src/opencode/plugins/agentdev-textlint-guard/gate.ts を対象 worktree に対して使う。失敗を成功として扱わない。この導線と Issue/PR 作成経路は、全機能に対する OpenCode 併用前提にはしない。

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

- 新ホストの配布原本・投影を既存の配布境界検査と標準整合性チェックの対象とし、公開入口は既存の業務名・引数・全ガードを維持していることを照合する。
- 適用先向け案内に、ホスト別の導入選択、文書管理、スキル名による入口と引数、入口条件、案Aの案内と終了時品質ゲートを利用者が確認する手順と期待結果を記載する。Antigravity は実行担当による実機検証を行わず、利用者が確認する。公開資料、静的検証、利用者による動作確認の証拠を区別する。
- 検証範囲は、導入先リポジトリの選択と、案Aで定める新ホストの保証・非移設の境界に従う。

## 関連

- REQ-099（マルチホスト併存）: 成果定義の正規所有者
- Decision「ADF 共通原本とホスト接続領域の分離」（DEC-049）: 意思決定の原本
- harness-separation-model.md: harness 分離原則、配布物の harness 非依存性
- runtime-package-boundary.md、install-script-usability.md: link mode・installer 実行詳細
- distribution-boundary.md: 配布依存境界の検査モデル
