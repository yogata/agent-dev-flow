---
title: 実行時パッケージ境界
status: accepted
created: 2026-08-20
updated: 2026-11-21
---
<!-- ADF-COVERS(implementation): REQ-002-007, REQ-002-008, REQ-002-011, REQ-002-019, REQ-002-020, REQ-002-027 -->
<!-- ADF-COVERS(implementation): REQ-113-001, REQ-113-002（tsconfig 参照共有と typecheck 組込みの実装対応） -->
<!-- ADF-COVERS(implementation): REQ-009-002, REQ-009-003, REQ-009-006, REQ-009-007, REQ-009-008, REQ-009-009, REQ-009-010, REQ-009-011, REQ-009-012, REQ-009-013, REQ-009-014, REQ-009-015, REQ-009-016, REQ-009-017, REQ-009-018, REQ-009-019, REQ-009-020, REQ-009-021, REQ-009-022, REQ-009-023, REQ-009-024, REQ-009-025, REQ-009-035, REQ-009-036, REQ-009-037, REQ-009-038, REQ-009-039, REQ-009-046, REQ-009-047, REQ-009-048, REQ-009-049 -->
<!-- ADF-COVERS(implementation): REQ-044-004 -->
<!-- ADF-COVERS(implementation): REQ-011-006 -->
<!-- ADF-COVERS(implementation): REQ-050-001, REQ-050-002, REQ-050-003, REQ-050-004, REQ-050-005, REQ-050-006, REQ-050-007, REQ-050-008, REQ-050-010, REQ-050-013 -->
<!-- ADF-COVERS(implementation): REQ-052-007（scripts/consumer/archive/install.ps1、scripts/install.ps1 の宣言を docs 正規配置先へ移管） -->
<!-- ADF-COVERS(implementation): REQ-029-012, REQ-029-013（textlint guard 依存実体の版固定情報解決と 3rd-party 依存の通知） -->
<!-- ADF-COVERS(implementation): REQ-112-001, REQ-112-002, REQ-112-003（local ツール package の tsconfig 参照共有と typecheck 検査契約節が implementation 実体） -->
<!-- ADF-COVERS(design): REQ-029-012, REQ-029-013（本体リポジトリ sync 節と 3rd-party 依存の通知小節が design 実体） -->
<!-- 注: install/self-sync 各 ps1（scripts/）は走査対象拡張子外のため、導入器実装行の宣言は本 Design（正規仕様所有者）へ配置。実装実体は scripts/install.ps1、scripts/self-sync.ps1（内部処理は scripts/consumer/、scripts/self/ 配下） -->
<!-- ADF-COVERS(design): REQ-002-047 -->
<!-- ADF-COVERS(design): REQ-050-009 -->
<!-- ADF-COVERS(design): REQ-091-001, REQ-091-002, REQ-091-003, REQ-091-004, REQ-091-005 -->
<!-- ADF-COVERS(design): REQ-050-002, REQ-050-003, REQ-050-005, REQ-050-015, REQ-058-001, REQ-058-004, REQ-058-005, REQ-058-006, REQ-058-008, REQ-058-012（ジャンクション状態の判定と自己修復節が両公開入口・両ホスト・全モードの正本一致検査の design 実体） -->
<!-- ADF-COVERS(design): REQ-112-001, REQ-112-002, REQ-112-003（local ツール package の tsconfig 参照共有と typecheck 検査契約節が design 実体） -->
<!-- ADF-COVERS(design): REQ-113-001, REQ-113-002（local ツール package の tsconfig 参照共有と typecheck 検査契約節が design 実体） -->
<!-- ADF-COVERS(design): REQ-050-014（scripts 公開入口と内部配置節の旧公開入口3本現役導線禁止条項が design 実体） -->

<!-- ADF-COVERS(implementation): REQ-123-003（REQ-123-003 のスリム化編集の実装実体。ハブ化と重複排除・移管済み必須仕様の削除。REQ-123.md 冒頭 inline ADF-COVERS(design) 宣言と REQ-116 型 covers 宣言構成） -->
# 実行時パッケージ境界

> **Scope**: 本 Design は agent-dev-flow リポジトリのリポジトリ内部設計文書である（REQ-001）。実行時パッケージの物理構造・同梱許可/禁止パス規則・インストール境界契約を定義する。配布依存境界の検証モデル・projection 分離・gate 契約は `../integrity/distribution-boundary.md` 正規所有（REQ-029、DEC-014）。

## 4 種のリポジトリ種別（Repo Type）

> plugin/npm/package 配布形態は現在未対応（REQ-009-009 参照）。REQ-009-006 は5種として将来対応の `plugin-future` を含めて定義し、本表は現行実装済みの4種のみを扱う。

| Type ID | `.opencode/` の意味 |
|---------|---------------------|
| `self-hosting` | 実行時配置先（ジャンクション → `src/common/`〔共通原本。plugin は `src/opencode/plugins/`〕）。本体開発リポジトリ |
| `consumer-with-agentdev` | プロジェクトローカルカスタマイズ入口 + AgentDevFlow 実行時位置。導入製品リポジトリ |
| `consumer-local` | プロジェクトローカルカスタマイズ専用。非 AgentDevFlow OpenCode プロジェクト |
| `consumer-generated` | link mode による AgentDevFlow 実行時位置（Custom Tool `agentdev_gh` の実行ディレクトリのみ Local 実装へ接続）。ローカル版導入リポジトリ |

種別判定: `src/common/` と `src/opencode/` が存在し `.opencode/` がジャンクションなら `self-hosting`、`.opencode/commands/agentdev/` または `.opencode/skills/agentdev-*/` が存在（link 含む）なら `consumer-with-agentdev`、`.opencode/tools/agentdev-gh/` が `src/common/tools/agentdev-gh/local/` への link として解決されるなら `consumer-generated`、`.opencode/` が存在し `agentdev` 名前空間を含まないなら `consumer-local`、いずれでもなければ N/A。

## リポジトリ種別別 `.opencode/` 意味と配布パッケージ構造

### 本体リポジトリ（self-hosting）

```
.opencode/                       → real directory (not junction)
  commands/agentdev/             → junction → src/common/commands/agentdev/
  skills/agentdev-*/             → junction → src/common/skills/agentdev-*/ (per skill)
  tools/agentdev-*/              → junction → src/common/tools/agentdev-*/ (per tool)
  plugins/agentdev-*/            → junction → src/opencode/plugins/agentdev-*/ (per plugin)
src/common/                      → 共通原本（commands、skills、tools engine、guards）
src/opencode/                    → OpenCode 接続領域（plugin/hook 原本、ホスト固有接続）
```

- 原本編集は `src/common/` と `src/opencode/` で実施。`scripts/self-sync.ps1` が各対象を個別ジャンクションとして管理（`agentdev-*` グロブで動的列挙）。`.opencode/.gitignore` は実ファイルで手動管理
- **scripts/ 配下の配布境界（skills/agentdev-*/scripts/ 配下）**: 配布対象は `*.ts`、`lib/*.ts`、`tests/*.test.ts`、`package.json`、`tsconfig.json`、`bun.lock`、`.gitignore`、`README.md`。除外は `node_modules/`（consumer 側で再生成）。テスト一時フィクスチャの生成先は `os.tmpdir()` とし、tests/ 配下へ残さない
- **vendored bundle 再生成**: vendored engine bundle（`vendor/textlint-engine.bundle.json`、`vendor/kuromoji-dict/`）は git 管理対象外とし `bun install && bun run build:engine` で再生成する（REQ-029-012）。導入系スクリプトは vendor 欠落（部分生成を含む）を検知した場合に fail-closed で停止し手順を案内する（DEC-016）。build の焼き付き絶対パス検出・無害化の挙動は plugin 本体の実装仕様が所有する
- **3rd-party 依存の通知**: third-party 依存とライセンス種別は THIRD-PARTY-NOTICES.md（repo root）が宣言する（REQ-029-013）。様式・対象範囲・更新契機は当該文書を正とし、release archive は同梱する

### Consumer 種別（導入済み・ローカル・ローカル版 link mode）

| 種別 | `.opencode/` 構成 | 備考 |
|------|------------------|------|
| `consumer-with-agentdev` | `commands/agentdev/`、`skills/agentdev-*/` は symlink/junction、`{local}` 配下は直接管理 | symlink/junction 推奨（copy 非推奨）。`.agentdev/` が存在 |
| `consumer-local` | `commands/{local}/`、`skills/{local}-*/` のみ | `agentdev` 以外の名前空間（REQ-009-008）。検出時は docs-check（IR-016）が NG 報告 |
| `consumer-generated` | `commands/agentdev/`、`skills/agentdev-*/` は `src/common/` 配下へ link、`tools/agentdev-gh/` のみ `src/common/tools/agentdev-gh/local/` へ link | Plugin ローダーシム（`.opencode/plugins/agentdev-*.ts`）は投影成果物として生成し apply が欠落・誤解決を検知して再生成。`.opencode/commands/`、`.opencode/skills/`、ひな形は git 管理対象外（REQ-009-008、REQ-009-016）。`.agentdev/issues/` はローカルIssue（REQ-009-026） |

## プロジェクトローカル命名規則（Project-Local Naming Rules）

| 名前 | 種別 | 使用可能リポジトリ種別 |
|------|------|-------------------|
| `agentdev` | コマンド名前空間 | `self-hosting`, `consumer-with-agentdev`, `consumer-generated` |
| `agentdev-*` | スキルプレフィックス | 同上 |
| `.agentdev/` | ドメイン状態ディレクトリ | 同上 |

命名規約: 予約名以外を使用し（REQ-009-008）、skill 名は kebab-case（REQ-002-011）、プロジェクト名をプレフィックスに含めることを推奨し、独自 skill は `.opencode/skills/{project}-*/` に配置する。

## 導入方式ポリシー（Installation Method Policy）

provisioning（チェックアウトの取得）は利用者の責務であり、git clone とソース ZIP 展開の2形態を正規の provisioning 形態とする（REQ-009-010、REQ-009-046、DEC-016）。install スクリプトはチェックアウト済み `.agentdev-plugin/` を前提に junction 設定のみを行い、provisioning と network access を行わない。ZIP 展開 provisioning は手動 copy インストールに該当せず、install 手段は link mode に限定される。

| 方式 | 状態 | 推奨度 |
|--------|--------|--------|
| Symlink / ジャンクション（Windows `mklink /J` 管理者権限不要・ディレクトリのみ / `mklink /D` 開発者モードまたは管理者権限 / Unix `ln -s`） | 対応済み | **推奨**（更新自動反映、原本単一管理） |
| Copy | 対応済み | 非推奨（乖離リスク。docs-check〔IR-016〕が乖離を検出） |
| Git submodule / Plugin / npm / package | 検討可能 / 未対応 | 実験的 / REQ-009-009 参照 |
| Release archive projection | 別投影 | REQ-009-045、copy インストールの延長ではない |

## リポジトリ種別別同期スクリプト範囲（Sync Script Scope）

同期・導入系公開入口の適用範囲（REQ-009-003、REQ-050-001）。self-hosting 向け `scripts/self-sync.ps1` と consumer 向け `scripts/install.ps1` が対象を分担する。

| リポジトリ種別 | 同期対象 |
|-----------|----------|
| `self-hosting` | `scripts/self-sync.ps1` による選択的ジャンクション（opencode 実行時ファイル〔sessions, config 等〕以外） |
| `consumer-with-agentdev` | `scripts/install.ps1` による AgentDevFlow 提供ファイルのみ（プロジェクトローカルカスタマイズは同期の影響を受けない） |
| `consumer-local` | なし（適用対象外） |
| `consumer-generated` | なし（適用対象外。link 設定により接続される） |

両入口は apply（同期実行）、check（乖離検出・終了コード判定）、dry-run（変更予測）の3モードを提供する（REQ-050-002〜005）。旧状態確認専用スクリプトの検査能力は `scripts/install.ps1 -Mode check` が包含する（REQ-050-004。検査項目一覧は install-script-usability Design「install.ps1 -Mode check の検査カタログ」参照）。

**stale 管理投影物の削除境界**: 原本から除外・削除された ADF 管理対象投影物の削除は ADF 管理境界の内部で完結する（REQ-058）。削除対象は原本から削除された管理対象物と明示的に除外されたものに限定し、`repo-local` prefix や利用者独自の `.opencode/` 配下成果物は近似だけでは削除せず、管理物と判定できない成果物は非破壊に扱う（REQ-058-004〜008）。

## scripts 公開入口と内部配置

- 公開入口2本: consumer 向け `scripts/install.ps1`、self-hosting 向け `scripts/self-sync.ps1`。公開入口名は利用者が固定参照する安定契約（REQ-050-001）
- 内部配置: consumer 専用内部処理は `scripts/consumer/`、self-hosting 固有の配布・検証処理は `scripts/self/release/`、保守処理は `scripts/self/maintenance/` 配下。release 生成、信頼境界検証、保守処理、単体実行しない内部共通処理を scripts/ 直下に配置しない
- 旧公開入口3本を現役導線として残さず、旧公開入口名を利用者へ実行させる記述を現行文書群へ残さない（REQ-050-014 が所有）
- supervisor-bridge の原本は `scripts/self/supervisor-bridge/` 配下（Supervisor 環境向け credential 供給ブリッジ。ocenv と opencode bridge shim を含む。手順と失敗署名は docs/guides/ と docs/knowledge/supervisor-bridge-credential-supply.md が所有）。release archive には構造的に含まれない（配布範囲外・自己開発環境限定）。REQ-050-009 の内部配置列挙は本配置を含む
- archive 専用 installer の原本は `scripts/consumer/archive/install.ps1` として分離保持する。release archive 内では `scripts/install.ps1` の名で配置し、両版は異なる installation projection として同一実装へ強制統合しない（REQ-050-010）

## Tools / Plugins の配布・投影

Custom Tool（原本: src/common/tools/〔Tool engine〕）と Plugin / Hook（原本: src/opencode/plugins/〔OpenCode 接続領域〕）を正規配布種別として扱い（REQ-052）、原本と実行時投影は Command / Skill と同一の source・projection 原則に従う（配備形態の正は DEC-049）。公開入口は2本に固定し、Tool / Plugin の追加で新たな公開入口を作らない（REQ-050-001、REQ-052-008）。

repo-local Plugin（REQ-002-045）の契約:
- 原本配置原則は `src/opencode/plugins/<agentdev-name>/` 配下。consumer 配布系全経路（`scripts/install.ps1`、archive installer、`scripts/self/release/package-release-archive.ps1`）は repo-local 配布除外を実装し、3ファイルの列挙条件を同期する義務を持つ
- `scripts/self-sync.ps1` は repo-local Plugin を除外しない（自己ホスト投影を維持）。自己ホスト投影は canonical チェックアウト内部の source → projection 構成であり配布ではないため、配布除外機構の適用対象外である。除外機構は明示的除外リスト等とし、REQ-002-011 の repo-* prefix 方式は plugin に採用しない。textlint 検査基盤の保存済みファイル単位結果（実行時データ）は配布対象外とし投影・同期の対象に含めない（Plugin 本体の実装仕様が所有。DEC-065）
- 配布除外規則の正本を1箇所に定め、各入口は当該正本の参照・導出で除外集合を決定し、同一の除外集合に単一導出で一致することを検証する。検査側の監査期待値の独立性と検出パイプラインは `../integrity/distribution-boundary.md` が正規所有する（REQ-029、DEC-014）

## 誤実行防止の環境判定方式

両公開入口は実行対象環境を機械的に判定し、誤った環境では変更前に停止して適切な公開入口を案内する（REQ-050-006）。

| 入口 | 誤実行検出条件 | 判定材料 |
|------|--------------|---------|
| `scripts/install.ps1` | 実行対象が AgentDevFlow 本体リポジトリ | 実行ディレクトリ直下に `src/opencode/` が存在すること（consumer ではチェックアウトは `.agentdev-plugin/` 配下） |
| `scripts/self-sync.ps1` | 実行対象が本体リポジトリでない | `$PSScriptRoot` の親に `src/opencode` が存在しないこと |

誤った環境と判定した場合、全モードで管理対象ファイルを変更せずに停止し、実行すべき公開入口を案内する（案内形式は install-script-usability Design「cwd 安全化」に従う）。REQ-009-041（cwd 安全化）は実行ディレクトリの想定外検知を、本判定はリポジトリ種別の誤り検知を担う別判定である。

## link mode 接続手順技術詳細

| リンク元（`.opencode/` 配下） | 通常版 | `-LocalMode` 指定時 |
|-------------------------------|----------|------|
| `commands/agentdev/` | `src/common/commands/agentdev/`（REQ-009 decision #2） | 同一 |
| `skills/agentdev-*/` | `src/common/skills/agentdev-*/`（同上） | 同一 |
| `tools/agentdev-gh/` | `src/common/tools/agentdev-gh/` | `src/common/tools/agentdev-gh/local/`（Local 実装。REQ-009 decision #3, REQ-011-006） |

- Local 実装の原本は `src/common/tools/agentdev-gh/local/` でありローカル版は共通原本を変更しない（REQ-009-015/016）。ローカル版は通常版と同じ操作契約を提供し、Issue と PR の読取り・更新・作成済み状態・取り込み結果をローカルIssue（`.agentdev/issues/issue-{NNNN}.md`）の記録へ読み替える（REQ-009-026〜032）。上位の command と skill は Tool 操作契約を参照し、ローカル版専用の別名 skill や分岐を持たない。ローカルIssueのスキーマ原本は [ローカルIssue共通スキーマ](local-case-file.md) とし、ローカル I/O パッケージは原本を再定義せず `case-schema/` を含める。汎用バックエンド抽象化、`src/opencode-local/skills/`、ローカル版 command・template は作成しない
- `scripts/install.ps1` は `-Mode`（dry-run / check / apply）に `-LocalMode` スイッチを併用でき、`-Mode` は `-LocalMode` の有無にかかわらず従来どおり動作する。別スクリプト（`install-local.ps1` 等）は新設せず、エントリポイントを単一に維持する
- **チェックアウト検証（usable checkout 判定）**: install スクリプトはチェックアウト配置先（既定 `.agentdev-plugin/`）配下に `src/common/` が存在することで検証し、`.git` を必須としない（REQ-009-047、REQ-009-048）。検出不能時はエラー停止し clone コマンド例と取得手順を案内する。provisioning を代行実行しない。版報告は `.git` が存在する場合のみ（ZIP 展開は unknown）。version manifest は導入せず ZIP 展開環境はサポート対象外
- **link target 確認方式**: link は意図した link target かを確認し（REQ-009 decision #6, REQ-009-010）、意図した target 以外へ解決される場合は設定を停止する。link 設定は導入先リポジトリでだけ実行し、更新時は既存 link を解除して同じ target へ再接続し、差分生成や変換処理は行わない。導入済み環境の更新は利用者の責務であり（REQ-009-049）git clone 環境では git pull 後に install を再実行する。apply は冪等であり再実行で junction 構成を変化させない

### ジャンクション状態の判定と自己修復

両公開入口は、各ジャンクション対象について、ジャンクションの有無と解決先の一致を同じ正本解決条件で確認する（REQ-050-002/003、REQ-058-012）。本節の判定と挙動は両公開入口・両ホスト（OpenCode・Senpi）・全モード（apply / check / dry-run）に適用する。

| 状態 | 判定基準 | apply | check | dry-run |
|------|----------|-------|-------|---------|
| 正常（correct target） | ジャンクションが存在し、解決先が現行正本解決（LocalMode を含む）と一致 | 維持（再作成しない） | OK 報告 | 変更なし報告 |
| wrong target（管理物） | 解決先が現行正本と不一致（旧正本・消失済み正本を含む）。Test-ManagedProjectionJunction / Test-ManagedSenpiJunction が管理対象投影物と判定 | 削除して現行正本へ再作成（自己修復） | NG（乖離）報告 | 除去・再作成の予測表示（REQ-058-004） |
| wrong target（管理物と確認できない） | 解決先が正本候補外など管理対象投影物と判定できない | 自動置換しない。リンクと実体を保持し衝突を報告して非正常終了 | NG 報告（対象を特定） | 保持を報告 |
| ジャンクション以外のパス | パスが存在するがジャンクションでない | エラー停止 | エラー報告 | エラー報告 |

- 正本解決は既存の `Get-TargetSourcePath`（install・self-sync それぞれの実装）を使い、意図した src 配下は LocalMode の有無で切り替わる。修復の可否判定には既存の `Test-ManagedProjectionJunction`・`Test-ManagedSenpiJunction` を再用する。旧正本を向くリンクも管理対象投影物として修復可能に含め（REQ-099-012）、正本候補外を向くリンクは管理物と確認できないため自動置換しない。修復はジャンクション自体の削除・再作成に限定し、旧正本側の実体を移動・削除せず、依存生成・通信を行わない
- dry-run は予測表示のみ行い、check・dry-run はリンク先文字列・リンク先実体・配置先のファイルを変更しない（REQ-050-005）。修復予定がある通常の dry-run の終了コードは 0 を維持し、check の乖離は終了コード 1 とする。apply は check と同じ正本解決条件の乖離を解消し、適用後に同一条件の check 再実行で乖離が残存しないことを収束とする（REQ-050-015、REQ-058-006）。衝突・修復失敗の apply を正常終了にしない。自己修復は LocalMode と通常版 install の両方に適用され、種別切り替え後の旧接続先ジャンクション残存は apply 再実行で正しい接続先へ復元される。管理対象外リンク・実ディレクトリ・repo-local 資産の保護は「stale 管理投影物の削除境界」の契約を維持する

## 配布物依存スキルの src 昇格（REQ-002-001/002、v2:ADR-0134）

`.opencode/skills/` 配下は既定で git 管理対象外である。配布物が依存するスキルは `src/common/skills/` へ昇格し、配布物の自己完結性（self-contained）を維持する（v2:ADR-0134）。

### 昇格基準

| 区分 | 配置 | git 管理 | 配布 | 根拠 |
|------|------|----------|------|------|
| 配布物依存スキル | `src/common/skills/<name>/` | `src/` 配下で通常トラック | `agentdev-*` グロブ対象外の場合は install script で個別 junction 対象に追加 | v2:ADR-0134 / REQ-002-001 |
| repo-local 専用スキル | `.opencode/skills/repo-*/` | `.gitignore` `repo-*` ホワイトリストでトラック | 配布対象外（REQ-001） | REQ-001 / REQ-002-002 |
| third-party Skill | `.opencode/skills/<name>/`（取得機構経由配置） | git 管理対象外 | 配布対象外。配布成果物から参照する場合は宣言と参照点集約（REQ-002-044）に従う | REQ-002-044 |

昇格判定は「配布物が当該スキルを参照するか否か」で機械的に行い、IR-058 が `git ls-files` 突合とテキスト参照走査で検出する。昇格手順: (1) 配布物から参照を確認、(2) `git mv` で `src/common/skills/<name>/` へ移動、(3) 個別 `.gitignore` トラック行を削除、(4) グロブ対象外の場合は両入口の junction 対象関数に個別追加、(5) consumer 向け推奨 `.gitignore` へ追加、(6) docs-check で IR-016 と IR-058 の NG 0 件を確認。

### 現行の境界

| スキル | 区分 | 備考 |
|--------|------|------|
| `agentdev-*` 配下全件 | 配布物依存 | `src/common/skills/` 配下、`agentdev-*` グロブで自動 junction |
| `repo-agentdev-integrity` | repo-local 専用 | `/repo/docs-check` 実行スキル。REQ-001 の `repo-*` carve-out 対象。cli.ts の正本は `src/common/skills/repo-agentdev-integrity/` 配下、`.opencode/skills/` 側は copy 投影として git 管理（DEC-065 決定3、REQ-002-020 の限定例外。IR-016 copy 投影整合、IR-068 copy_projections 登録突合で検査）。checker を呼び出す command は DEC-006 により repo-local command（`docs-check` 等）へ正規化済み |

## v4 adapter 境界への接続

本 Design のリポジトリ種別、.opencode/ の意味、link mode、Tools / Plugins の配布・投影は Harness/Backend adapter 境界の下で維持される。配備形態の原本は DEC-049、配置契約と投影モデルの詳細はマルチホスト原本モデル Design（foundations/multi-host-canonical-model.md）が所有する。ローカル版 Custom Tool の原本は共通原本側の Tool engine 領域にあり、src/opencode/ への型・schema 参照を持たない（REQ-009-015/016）。

## local ツール package の tsconfig 参照共有と typecheck 検査契約

ルート package（`src/common/tools/<name>/`）と Local 実装 package（`.../local/`）の `tsconfig.json` を二重管理しない。Local 側はルート側へ `extends` で参照し、差分は `include` 等の Local 固有設定へ限定する。Local ツール package の `typecheck` script（`tsc --noEmit`）を本体リポジトリの品質検査経路へ組み込む（組込みは Local package 内の誤 import 修正完了後、検査 pass を前提）。この契約は Local 版の配布対象除外（REQ-009-016）を変更せず、本体リポジトリ内の検査実行の追加である。

## 関連項目（See Also）

- [Consumer Project Setup Guide](../../guides/consumer-project-setup.md)（Consumer 向け導入手順）
- [Artifact Contracts](../responsibilities/artifact-contracts.md)（Command/Skill/Template/Script の責務境界）
- [ローカルIssue共通スキーマ](local-case-file.md)（`consumer-generated` 種別のローカルIssueスキーマ）
- [配布依存境界](../integrity/distribution-boundary.md)（配布依存境界の検証モデル・gate 契約・監査期待値の独立性）
- [整合性ルールカタログ](../integrity/integrity-rule-catalog.md)（IR-058 distribution-untracked-skill-reference）
- REQ-009-006~065、REQ-009（リポジトリ種別 / `.opencode/` 意味 / 命名 / 導入 / 同期範囲 / link mode の要件定義）
