---
title: 実行時パッケージ境界
status: accepted
created: 2026-08-20
updated: 2026-10-11
---
<!-- ADF-COVERS(implementation): REQ-002-007, REQ-002-008, REQ-002-011, REQ-002-019, REQ-002-020, REQ-002-027 -->
<!-- ADF-COVERS(implementation): REQ-009-002, REQ-009-003, REQ-009-006, REQ-009-007, REQ-009-008, REQ-009-009, REQ-009-010, REQ-009-011, REQ-009-012, REQ-009-013, REQ-009-014, REQ-009-015, REQ-009-016, REQ-009-017, REQ-009-018, REQ-009-019, REQ-009-020, REQ-009-021, REQ-009-022, REQ-009-023, REQ-009-024, REQ-009-025, REQ-009-035, REQ-009-036, REQ-009-037, REQ-009-038, REQ-009-039, REQ-009-046, REQ-009-047, REQ-009-048, REQ-009-049 -->
<!-- ADF-COVERS(implementation): REQ-044-004 -->
<!-- ADF-COVERS(implementation): REQ-011-006 -->
<!-- ADF-COVERS(implementation): REQ-050-001, REQ-050-002, REQ-050-003, REQ-050-004, REQ-050-005, REQ-050-006, REQ-050-007, REQ-050-008, REQ-050-010, REQ-050-013 -->
<!-- ADF-COVERS(implementation): REQ-052-007（scripts/consumer/archive/install.ps1、scripts/install.ps1 の宣言を docs 正規配置先へ移管） -->
<!-- ADF-COVERS(implementation): REQ-029-012, REQ-029-013（textlint guard 依存実体の版固定情報解決と 3rd-party 依存の通知） -->
<!-- ADF-COVERS(design): REQ-029-012, REQ-029-013（本体リポジトリ sync 節と 3rd-party 依存の通知小節が design 実体） -->
<!-- 注: install/self-sync 各 ps1（scripts/）は走査対象拡張子外のため、導入器実装行の宣言は本 Design（正規仕様所有者）へ配置。実装実体は scripts/install.ps1、scripts/self-sync.ps1（内部処理は scripts/consumer/、scripts/self/ 配下） -->
<!-- ADF-COVERS(design): REQ-002-047 -->
<!-- ADF-COVERS(design): REQ-050-009 -->
<!-- ADF-COVERS(design): REQ-091-001, REQ-091-002, REQ-091-003, REQ-091-004, REQ-091-005 -->
<!-- ADF-COVERS(design): REQ-053-044（repo-local Plugin の配布・投影契約節が保存済みファイル単位結果の配布・投影除外 design 実体） -->

# 実行時パッケージ境界

> **Scope**: 本 Design は agent-dev-flow リポジトリのリポジトリ内部設計文書である（REQ-001）。
> リポジトリ種別（repo type）間の実行時パッケージ境界モデルを本リポジトリの観点から記述し、consumer プロジェクトの振る舞いを規定しない。
> Consumer プロジェクトは独自の規約に従い、本 Design は agent-dev-flow リポジトリが実行時パッケージをどう構成、配布するかのみを定義する。

## 目的

AgentDevFlow の実行時パッケージ境界を定義し、本体リポジトリと consumer プロジェクトでの `.opencode/` 役割、命名、導入方式、同期範囲を明確化する（REQ-009-006~065, REQ-009）。

## 4 種のリポジトリ種別（Repo Type）

> plugin/npm/package 配布形態は現在未対応である（REQ-009-009 参照）。
> REQ-009-006 は5種のリポジトリ種別として将来対応の `plugin-future` を含めて定義する。
> 本 Design の4種表は現行実装済みの種別のみを扱い、`plugin-future` は将来対応の第5種として本表から除外する。
> REQ と本 Design の種別数の差は対応時期の違いによるものであり、矛盾ではない。
> `plugin-future` の実装時に本表へ行を追加する。

| Type ID | 名称 | 説明 | `.opencode/` の意味 | 典型例 |
|---------|------|------|---------------------|--------|
| `self-hosting` | AgentDevFlow 本体開発リポジトリ | 原本と配置先が同一リポジトリに存在 | 実行時配置先（ジャンクション → `src/common/`〔共通原本。plugin は `src/opencode/plugins/`〕） | `agent-dev-flow` |
| `consumer-with-agentdev` | AgentDevFlow 導入製品リポジトリ | AgentDevFlow 提供 skill/command を利用 | プロジェクトローカルカスタマイズ入口 + AgentDevFlow 実行時位置 | 各種製品開発リポジトリ |
| `consumer-local` | 非 AgentDevFlow OpenCode プロジェクト | 独自 command/skill のみ | プロジェクトローカルカスタマイズ専用 | 実験的リポジトリ |
| `consumer-generated` | ローカル版 OpenCode 導入リポジトリ | ローカル版 OpenCode を導入する利用側リポジトリ | link mode による AgentDevFlow 実行時位置（Custom Tool `agentdev_gh` の実行ディレクトリのみ `src/common/tools/agentdev-gh/local/` から接続） | 個人利用環境のローカルリポジトリ |

`consumer-generated` はローカル版 OpenCode を link mode で導入する利用側リポジトリである（REQ-009, REQ-009, REQ-009）。
`.opencode/commands/agentdev/` と `.opencode/skills/agentdev-*/` を共通原本 `src/common/` 配下へ接続し、Custom Tool `agentdev_gh` の実行ディレクトリ（`.opencode/tools/agentdev-gh/`）だけを `src/common/tools/agentdev-gh/local/`（Local 実装）へ接続する。
詳細は本 Design の「link mode 接続手順技術詳細」を参照。

### リポジトリ種別判定基準

| 条件 | リポジトリ種別 |
|------|-----------|
| `src/common/` と `src/opencode/` が存在し `.opencode/` がジャンクション | `self-hosting` |
| `.opencode/commands/agentdev/` または `.opencode/skills/agentdev-*/` が存在（ジャンクション、シンボリックリンク含む） | `consumer-with-agentdev` |
| `.opencode/tools/agentdev-gh/` が `src/common/tools/agentdev-gh/local/` への link として解決される | `consumer-generated` |
| `.opencode/` が存在し `agentdev` 名前空間を含まない | `consumer-local` |
| 上記いずれでもない | N/A（OpenCode 非使用リポジトリ） |

## リポジトリ種別別 `.opencode/` 意味

### 本体リポジトリ（self-hosting）

```
.opencode/                       → real directory (not junction)
  commands/agentdev/             → junction → src/common/commands/agentdev/
  skills/agentdev-*/             → junction → src/common/skills/agentdev-*/ (per skill)
  tools/agentdev-*/              → junction → src/common/tools/agentdev-*/ (per tool)
  plugins/agentdev-*/            → junction → src/opencode/plugins/agentdev-*/ (per plugin)
  .gitignore                     → real file (manually managed)
  (opencode runtime files)       → sessions, config, etc. managed by opencode itself
src/common/                      → 共通原本（commands、skills、tools engine、guards）
src/opencode/                    → OpenCode 接続領域（plugin/hook 原本、ホスト固有接続）
```

- 原本編集は `src/common/`（共通原本）と `src/opencode/`（OpenCode 接続領域〔plugin/hook 等〕）で実施
- `.opencode/` は実ディレクトリとして動作（全体ジャンクションではない）
- `scripts/self-sync.ps1` が `commands/agentdev/`、`skills/agentdev-*/`、`tools/agentdev-*/`、`plugins/agentdev-*/` を個別ジャンクションとして管理
- ジャンクション対象は `agentdev-*` グロブで動的列挙（ハードコードなし）
- `.gitignore` は実ファイルとして管理する（現行実装では自動コピーを行わない。consumer 向け推奨エントリは `scripts/install.ps1` が案内する）
- `.opencode/` 内の非管理ファイル（セッション、設定等）は opencode ランタイムが自由に配置可能

### 本体リポジトリ sync

**配布対象ディレクトリ**:
- `.opencode/commands/agentdev/` → junction → `src/common/commands/agentdev/`
- `.opencode/skills/agentdev-*/` → junction → `src/common/skills/agentdev-*/`
- `.opencode/tools/agentdev-*/` → junction → `src/common/tools/agentdev-*/`
- `.opencode/plugins/agentdev-*/` → junction → `src/opencode/plugins/agentdev-*/`

**scripts/ 配下の配布境界（skills/agentdev-*/scripts/ 配下）**:
配布対象: `*.ts`（TSソース）、`lib/*.ts`（共有ライブラリ）、`tests/*.test.ts`（テスト）、`package.json`、`tsconfig.json`、`bun.lock`、`.gitignore`、`README.md`
除外対象: `node_modules/`（.gitignore で除外済み、consumer 側で `bun install` により再生成）
tmp 残渣抑止: テスト一時フィクスチャ（`tmp-*` 等）の生成先は OS 一時ディレクトリ（`os.tmpdir()`）とし、配布パッケージの tests/ 配下へ生成残渣を残さない。テストのクリーンアップ（削除）は補助手段であり、リポジトリ内への一時生成をしない構造を正とする

scripts/ は skill junction の配下に位置し、skill の一部として配布される。
ジャンクション対象は `agentdev-*` グロブで動的列挙（ハードコードなし）。

- package rename（パッケージ名の変更）を行った場合は、bun install が bun.lock の root workspace name を自動同期しないため、bun.lock の name が新パッケージ名へ追従していることを確認する。bun install の実行面（依存前置）は worktree 運用参照（agentdev-git-worktree/references/worktree-operations.md）と相互参照する

**vendored bundle 再生成時の焼き付き絶対パス自己検査**:

vendored engine bundle（`vendor/textlint-engine.bundle.json`、`vendor/kuromoji-dict/`）は git 管理対象外（plugin package の `.gitignore` で除外）とし、ローカル環境および導入先で `bun install && bun run build:engine` により再生成する（REQ-029-012）。
再生成手順では、build スクリプトに含まれる焼き付き絶対パスの検出・無害化自己検査を実行する（検出対象、挙動、fail 条件は現行契約を維持）。
導入系スクリプト（install / self-sync / archive installer / release archive 生成）は vendor 成果物の欠落（engine bundle と kuromoji 辞書ファイル群の両方。部分生成状態〔bundle のみ存在し辞書が欠損〕を含む）を検知した場合に fail-closed で停止し、導入手順（`bun install && bun run build:engine`）を案内する。スクリプト自身は生成もネットワーク取得も行わない（DEC-016 維持）。

- 検出対象: kuromojin 既定 dicPath 用 `require.resolve` 由来の絶対パス等、ビルド環境由来の絶対パス（worktree パスを含む）
- 挙動: 機械的に無害化可能な場合は無害化してから出力し、無害化できない場合は build を fail させる（焼き付きパスの混入を検知できることが目的。ランタイムは `KUROMOJIN_DIC_PATH` 固定経路で使用されるため実害はないが、検出手段がないとビルド時 worktree 削除後の `bun test` が環境依存 fail し、原因特定コストが残る）
- 自己検査の運用知識は [Bun offline bundle の配置場所独立性（資産同梱・相対解決・生成条件）](../../knowledge/bun-offline-bundle-placement-independent-build.md) と相互参照する

**3rd-party 依存の通知**:

配布成果物が依存する third-party 製成果物とライセンス種別を宣言する THIRD-PARTY-NOTICES.md を repo root に保持する（REQ-029-013）。
様式は表形式（成果物名・版・ライセンス種別・配布形態〔版固定情報のみ/導入時解決〕・出所）とし、対象は textlint guard の直接依存5パッケージ + kuromoji + mecab-ipadic 辞書の計7成果物とする。推移的依存を含めない範囲設定の根拠（実体非再配布により直接依存と特別ライセンス成果物の宣言で足りる）を文書冒頭に記す。
版欄は時点記録とし、依存更新（bun.lock 変更）時に追従更新する。release archive は本通知文書を同梱する。

### Consumer（AgentDevFlow 導入済み）

```
.opencode/
  commands/agentdev/  → AgentDevFlow 提供コマンド (symlink or junction)
  commands/{local}/   → プロジェクトローカルコマンド
  skills/agentdev-*/  → AgentDevFlow 提供スキル (symlink or junction)
  skills/{local}-*/   → プロジェクトローカルスキル
```

- AgentDevFlow 提供ファイルは symlink/ジャンクション推奨、copy は非推奨
- プロジェクトローカルファイルは直接管理
- `.agentdev/` ドメイン状態ディレクトリが存在

### Consumer（ローカル）

```
.opencode/
  commands/{local}/   → プロジェクトローカルコマンドのみ
  skills/{local}-*/   → プロジェクトローカルスキルのみ
```

- プロジェクトローカル名前空間（`agentdev` 以外）を使用する（REQ-009-008）
- 自由に `.opencode/` を管理

### Consumer（ローカル版 link mode）

```
.opencode/
  commands/agentdev/      → link → src/common/commands/agentdev/
  skills/agentdev-*/      → link → src/common/skills/agentdev-*/
  tools/agentdev-gh/      → link → src/common/tools/agentdev-gh/local/（Local 実装）
.agentdev/
  issues/                 → ローカルIssue（Issue / PR 相当の永続情報）
```

- `.opencode/commands/agentdev/` と `.opencode/skills/agentdev-*/` を共通原本 `src/common/` 配下へ接続する（REQ-009 decision #2）
- Custom Tool `agentdev_gh` の実行ディレクトリ（`.opencode/tools/agentdev-gh/`）だけを `src/common/tools/agentdev-gh/local/` へ接続する（REQ-009 decision #3、REQ-011-006）
- link target が意図した target 以外へ解決される場合は link 設定を停止する（REQ-009-010, REQ-009 decision #6）
- `.opencode/commands/`, `.opencode/skills/`, `.opencode/` 配下ひな形は link により git 管理対象外（REQ-009-008, REQ-009 decision #1）

link mode 接続の技術詳細:

- Plugin のローダーシム（`.opencode/plugins/agentdev-*.ts`、`<package>.ts` の1行再エクスポート）は投影成果物として生成する。install の apply は shim の存在と実体パス解決を検査し、shim が欠落または意図しない解決となっている場合は再生成して自己修復する
- link 接続した Custom Tool 実行ディレクトリで `bun install` を実行する環境では、当該実行ディレクトリの `.gitignore` に `node_modules/` を指定することを推奨する（投影領域への依存生成物混入の防止）
- `.agentdev/issues/` 配下のローカルIssueは Issue/PR 相当の永続情報としてリポジトリ管理対象（REQ-009-016、REQ-009-026）

## プロジェクトローカル命名規則（Project-Local Naming Rules）

Consumer プロジェクトで独自 command/skill を追加する際の命名規約（REQ-009-008）。

### 予約名（Reserved Names）

| 名前 | 種別 | 使用可能リポジトリ種別 |
|------|------|-------------------|
| `agentdev` | コマンド名前空間 | `self-hosting`, `consumer-with-agentdev`, `consumer-generated` |
| `agentdev-*` | スキルプレフィックス | `self-hosting`, `consumer-with-agentdev`, `consumer-generated` |
| `.agentdev/` | ドメイン状態ディレクトリ | `self-hosting`, `consumer-with-agentdev`, `consumer-generated` |

### 命名規約

| 規則 | 説明 | 根拠 |
|------|------|------|
| 名前空間衝突回避 | `agentdev` / `agentdev-*` / `.agentdev/` 以外の名前を使用 | REQ-009-008 |
| kebab-case | skill 名は小文字、数字、ハイフンのみ | REQ-002-011 |
| 意味的命名 | プロジェクト名やドメイン名をプレフィックスに含めることを推奨 | 運用規約 |
| 独自ディレクトリ | 独自 skill は `.opencode/skills/{project}-*/` に配置 | 運用規約 |

### 衝突検出

`consumer-local` リポジトリで `agentdev` 名前空間が検出された場合、docs-check（IR-016）が NG として報告する。

## 導入方式ポリシー（Installation Method Policy）

通常の consumer 導入は symlink または junction ベースの link mode を推奨する（REQ-009-009）。
具体化された release archive は別個の配布および検証 projection であり、REQ-009-045 が別途正規所有する。
copy 型インストール（.opencode/ 配下へ配布成果物の実体を複製する方式）と npm/package 化は対象外を維持し、release archive を通常の copy インストールの延長として扱わない。

provisioning（agent-dev-flow チェックアウトの取得）は利用者の責務であり、利用者による git clone と利用者によるソース ZIP 展開の2形態を正規の provisioning 形態とする（REQ-009-010、REQ-009-046、DEC-016）。
install スクリプトはチェックアウト済みの `.agentdev-plugin/` を前提に junction 設定のみを行い、provisioning（clone、fetch、reset）と network access を行わない。

provisioning（チェックアウトの取得手段: clone / ZIP 展開）と install 手段（link mode による junction 接続）は別軸である。
ZIP 展開による provisioning は手動 copy インストールに該当せず、install 手段は引き続き link mode に限定される。
「source ZIP によるチェックアウト供給」と「release archive projection」は別個の概念であり、両者を混同する説明をしない。

配布依存境界の検出契約（link projection と archive projection の区別、projection ごとの検査、検査エラーの取扱い）は `integrity/distribution-boundary.md` が正規所有する（REQ-029、DEC-014）。

| 方式 | 状態 | 推奨度 | 備考 |
|--------|--------|--------|------|
| Symlink / ジャンクション | 対応済み | **推奨** | 更新自動反映、原本単一管理 |
| Copy | 対応済み | 非推奨 | 手動更新必要、乖離リスク |
| Git submodule | 検討可能 | 実験的 | 複雑性増加 |
| Plugin / npm / package | 未対応 | - | REQ-009-009 参照 |
| Release archive projection | 別投影 | 別投影 | REQ-009-045、copy インストールの延長ではない |

### Symlink / ジャンクションの制約

| Platform | 方法 | 制約 |
|----------|------|------|
| Windows | ジャンクション (`mklink /J`) | 管理者権限不要、ディレクトリのみ対応 |
| Windows | Symlink (`mklink /D`) | 開発者モードまたは管理者権限が必要 |
| Unix | Symlink (`ln -s`) | 権限不要 |

### Copy の乖離検出

Copy ベース導入では AgentDevFlow 更新時に乖離（drift）が発生する。
docs-check（IR-016）が乖離（divergence）を検出、報告する。

## リポジトリ種別別同期スクリプト範囲（Sync Script Scope）

同期・導入系公開入口の適用範囲（REQ-009-003、REQ-050-001）。
self-hosting 向けの `scripts/self-sync.ps1` と consumer 向けの `scripts/install.ps1` が対象を分担する。

| リポジトリ種別 | 同期対象 | 非対象 |
|-----------|----------|--------|
| `self-hosting` | `scripts/self-sync.ps1` による `commands/agentdev/`、`skills/agentdev-*/`、`tools/agentdev-*/`、`plugins/agentdev-*/` の選択的ジャンクション | opencode 実行時ファイル（sessions, config 等） |
| `consumer-with-agentdev` | `scripts/install.ps1` による AgentDevFlow 提供ファイルのみ | プロジェクトローカルカスタマイズ |
| `consumer-local` | なし（適用対象外） | 全体 |
| `consumer-generated` | なし（適用対象外）。link 設定により接続されるため同期スクリプト対象外 | 全体 |

> plugin/npm/package 配布形態は現在未対応である（REQ-009-009 参照）。

### 本体リポジトリでの同期モード

`scripts/self-sync.ps1` は apply、check、dry-run の3モードを提供する（REQ-050-003）。

| Mode | 動作 |
|------|------|
| `apply` | 原本（`src/common/`〔共通原本〕・`src/opencode/`〔plugin 原本〕） → `.opencode/` の同期実行 |
| `check` | 乖離検出（終了コードで判定）。同期対象を変更しない |
| `dry-run` | 変更予測（実行なし）。同期対象を変更しない |

### Consumer での同期

Consumer では `scripts/install.ps1` が AgentDevFlow 本体から提供されるファイルのみを同期対象とする（apply、check、dry-run。REQ-050-002、REQ-050-005）。
プロジェクトローカルカスタマイズは同期の影響を受けない。
旧状態確認専用スクリプト（check-consumer-opencode.ps1）の検査能力は `scripts/install.ps1 -Mode check` が包含する（REQ-050-004。検査項目の一覧は install-script-usability Design「install.ps1 -Mode check の検査カタログ」参照）。

### stale 管理投影物の削除境界

原本から除外・削除された ADF 管理対象投影物（stale 管理投影物）の削除は、ADF 管理境界の内部で完結する（REQ-058）。

- 削除対象は、ADF が管理する投影物として配置したもののうち、原本から削除されたもの、および配布・投影対象から明示的に除外されたことにより管理対象から外れたものとする
- `repo-local` prefix の成果物、利用者が独自に作成した `.opencode/` 配下の成果物、その他 ADF が管理していない成果物は、名前や配置場所が近似しているだけでは削除対象にしない
- ADF 管理物かどうかを確定できない成果物は自動削除せず、既存契約に従って非破壊的に扱う
- Plugin loader shim 等、ADF が生成・管理し原本側の対象消滅によって不要となる生成物の stale 削除は既存契約を維持し、上記の削除境界と矛盾させない。repo-local 配布除外と自己ホスト投影の非対称（「Tools / Plugins の配布・投影」参照）は本削除境界で変えない
- archive installer（junction 方式ではない）は本削除契約の直接対象外とし、同等の収束契約が必要かどうかの評価を本契約の実装対象に含めない

stale 管理投影物の確定は次の機械的基準で行う: (1) 原本相対でターゲットパスが一致すること、(2) LocalMode リダイレクト先を包含判定に含めること、(3) broken junction は reparse data の参照先で判定すること。管理物と判定できない junction は削除せず非破壊に [INFO] 報告する。

## scripts 公開入口と内部配置

scripts/ 直下の公開入口と内部配置の構成（REQ-050-001、REQ-050-009）。

- 公開入口2本: consumer 向け `scripts/install.ps1`、self-hosting 向け `scripts/self-sync.ps1`。公開入口名は利用者が固定参照する安定契約である（REQ-050-001）
- 内部配置: consumer 専用の内部処理は `scripts/consumer/` 配下、self-hosting 固有の配布・検証処理は `scripts/self/release/` 配下、保守処理は `scripts/self/maintenance/` 配下
- release 生成、信頼境界検証、self-hosting 保守処理、単体実行しない内部共通処理を scripts/ 直下に配置しない
- 具体的な内部ファイル分割は、公開契約と依存境界を変えない範囲で実装時に調整できる

### supervisor-bridge の配置と境界（REQ-091 design 被覆の本文）

scripts/self/supervisor-bridge/ は、Supervisor 環境（Hermes 等、spawn する子プロセスから
プロバイダー資格情報を削除する実行環境）向けの実行環境ブリッジ道具の原本配置である。
ocenv（Windows User スコープ環境変数を現在の環境へ merge してコマンドを実行するラッパ）と
opencode bridge shim（opencode コマンド解決を横取りして ocenv 経由で起動）を含む。
導入マニュアル（docs/guides/）と知識文書（docs/knowledge/supervisor-bridge-credential-supply.md）が
手順と失敗署名を所有する。release archive に supervisor-bridge/ は構造的に含まれない
（配布範囲外・自己開発環境限定）。REQ-050-009 の内部配置列挙は本配置を含む。
あわせて、REQ-044-004、REQ-050-007/008 の被覆宣言に対応する本文（能力比較の旧状態確認スクリプト
との歴史的関係、旧入口廃止と互換ラッパー不設置、公開入口名に opencode を含めない命名方針）が
本 Design 内の対応節で本文として存在することを確認する。

### archive 専用 installer 原本と release archive 投影

repository 上では archive 専用 installer の原本を通常 consumer installer と分離して保持する（`scripts/consumer/archive/install.ps1`）。
release archive 内では consumer が実行する公開入口として `scripts/install.ps1` の名で配置する。
通常 checkout 版の `scripts/install.ps1` と release archive 版の `scripts/install.ps1` は同一ファイルである必要はなく、異なる installation projection として扱い、それぞれの導入方式の契約を維持する。両版を同一実装へ強制統合しない（REQ-050-010）。

## Tools / Plugins の配布・投影

Custom Tool（原本: src/common/tools/〔Tool engine〕）と Plugin / Hook（原本: src/opencode/plugins/〔OpenCode 接続領域〕）を正規配布種別として扱う
（REQ-052）。原本と実行時投影は Command / Skill と同一の source・projection 原則に従い（配備形態の正は DEC-049）、
link mode の接続対象に含める。scripts/ 直下の公開入口は従来どおり2本に固定し、Tool / Plugin の追加によって
新たな公開入口を作らない（REQ-050-001、REQ-052-008）。ディレクトリ構造の詳細は本 Design が所有する。

### repo-local Plugin の配布・投影契約

repo-local Plugin（REQ-002-045）の配布・投影については次のとおりである。

- repo-local Plugin の原本配置原則は `src/opencode/plugins/<agentdev-name>/` 配下である。consumer 配布系全経路（`scripts/install.ps1`、`scripts/consumer/` 配下の archive installer、`scripts/self/release/package-release-archive.ps1`）は repo-local 配布除外を実装し、3ファイルの列挙条件を同期する義務を持つ。
- `scripts/self-sync.ps1` は repo-local Plugin を除外しない（自己ホスト投影を維持する）。理由は、consumer 配布と自己ホスト投影が非対称であるためである。repo-local Plugin は REQ-052-006 により consumer への配布対象外である一方、自己ホスト環境では Plugin を利用可能にする必要がある。自己ホスト投影は canonical チェックアウト内部の source → projection 構成（`.opencode/plugins/` への junction と depth-1 loader shim 生成）であり、consumer への配布ではないため、配布除外機構の適用対象外である。
- 除外機構の実現方式は明示的除外リスト等とする。REQ-002-011 の repo-* prefix 方式を plugin に採用しない（shim 名が repo-*.ts になり、stale shim 検出フィルタ等の波及修正が増えるため）。
- textlint 検査基盤の保存済みファイル単位結果（実行時データ）は配布対象外とし、投影・同期の対象にも含めない。保存先、容量上限、寿命は品質基盤 Design（textlint-quality-runtime.md「ファイル単位結果の再利用と同一性条件」節）が所有する。

配布境界 checker の repo-local モデル: 配布境界 checker は consumer 配布系と自己ホスト投影の非対称（上記のとおり）を repo-local モデルとして前提とする。detector の列挙条件（除外対象の検出箇所一覧）は repo-local Plugin の原本配置原則（`src/opencode/plugins/<agentdev-name>/`）と同期を維持し、列挙の乖離が観測された場合は個別特例の追加ではなく検査側の一般化で解消する方針とする。
- 将来 repo-local Plugin が複数化した時点で、マーカー方式（package.json マーカーフィールド等）への拡張条件を判断する。

outside-root 判定は、ワークスペース外の書き込みを原則ブロック（fail-closed）しつつ、事前承認済みディレクトリ（OS 標準 TEMP 等、実行環境が提供する一時領域）への書き込みを例外として許可する。例外はパス個別の特例列挙ではなく、承認済み一時領域カテゴリとして判定基準に組み込む（一般化: ru-batch-20260903 方針、本 Design が所有）。

### 自己ホスト投影対称性検査の機械検査契約

repo-local Plugin の自己ホスト投影対称性検査を機械検査契約として追加する。
- 検査対象: 原本（src/opencode/plugins/agentdev-textlint-guard/ 配下の投影対象構造）と自己ホスト投影（.opencode/plugins/ 配下）の対称性（投影欠落・余剰・shim 内容不一致）
- 検出扱い: 対称性破れは [DIVERGENCE] 相当の検出として docs-check 系検査結果に報告する
- 対称性の契約参照: 本 Design の投影契約、plugin README の配布宣言、self-sync.ps1 の動的列挙の 3 点
- 投影の再同期（self-sync.ps1 再実行）は環境操作であり、検出時の対応は環境操作として完了報告等に実行指示を含める運用とする（検査自体は repo 内で完結する）

## 誤実行防止の環境判定方式

両公開入口は実行対象環境を機械的に判定し、誤った環境では変更前に停止して適切な公開入口を案内する（REQ-050-006）。

判定材料と手順:

| 入口 | 誤実行検出条件 | 判定材料 |
|------|--------------|---------|
| `scripts/install.ps1` | 実行対象が AgentDevFlow 本体リポジトリである | 実行ディレクトリ直下に `src/opencode/` が存在すること（consumer ではチェックアウトは `.agentdev-plugin/` 配下にあり、実行ディレクトリ直下に `src/opencode/` は存在しない。リポジトリ種別判定基準の `self-hosting` 構成） |
| `scripts/self-sync.ps1` | 実行対象が本体リポジトリでない（consumer リポジトリ等） | `$PSScriptRoot` の親に `src/opencode` が存在しないこと（本体リポジトリの原本構成でない） |

- 変更前停止: 誤った環境と判定した場合、check、dry-run、apply の全モードで管理対象ファイルを変更せずに停止する
- 案内: 停止時に対象環境で実行すべき公開入口（本体リポジトリでは `scripts/self-sync.ps1`、consumer リポジトリでは `scripts/install.ps1`）を案内する。案内メッセージ形式は install-script-usability Design「cwd 安全化」の誤実行防止案内に従う
- REQ-009-041（cwd 安全化）との責務境界: REQ-009-041 は実行ディレクトリの想定外検知（Git リポジトリでない、原本領域、実行時領域、チェックアウト配置先）を担い、本判定はリポジトリ種別の誤り検知を担う。両者は直列に機能する別判定である

## link mode 接続手順技術詳細

`consumer-generated` リポジトリ種別における link mode 接続の技術詳細を明文化する（REQ-009 decision #2, #3, #6）。

### local mode のリンク構成

| リンク元（`.opencode/` 配下） | リンク先 | 備考 |
|-------------------------------|----------|------|
| `commands/agentdev/` | `src/common/commands/agentdev/` | 通常版と同一接続先（REQ-009 decision #2） |
| `skills/agentdev-*/` | `src/common/skills/agentdev-*/` | 通常版と同一接続先（REQ-009 decision #2） |
| `tools/agentdev-gh/` | `src/common/tools/agentdev-gh/local/` | local mode のみ差し替え接続先（Local 実装）。Custom Tool `agentdev_gh` の実行ディレクトリ（REQ-009 decision #3, REQ-011-006） |

agentdev-gh 以外は通常版と同一の共通原本 `src/common/` 配下へ接続し、Custom Tool `agentdev_gh` の実行ディレクトリ（`.opencode/tools/agentdev-gh/`）のみ `src/common/tools/agentdev-gh/local/`（Local 実装）へ接続することでローカル版環境を構成する。
Local 実装の原本は共通原本側（src/common/tools/agentdev-gh/local/）であり、ローカル版は共通原本を変更しない（REQ-009-015/016）。

### ローカル I/O パッケージ契約

`src/common/tools/agentdev-gh/local/` は Custom Tool `agentdev_gh` の Local 実装の唯一の原本である。

ローカル版は通常版と同じ操作契約を提供し、Issue と PR の読取り、更新、作成済み状態、取り込み結果をローカルIssue（`.agentdev/issues/issue-{NNNN}.md`）の対応する記録へ読み替える（REQ-009-026〜032）。

上位の command と skill は常に Tool 操作契約を参照し、ローカル版専用の別名 skill や分岐を持たない。

`case-schema/` はローカル I/O の操作用定義として当該パッケージに含める。

ローカルIssueのスキーマ原本は [ローカルIssue共通スキーマ](local-case-file.md) とし、ローカル I/O パッケージは原本を再定義しない。

ローカル版のための汎用バックエンド抽象化、`src/opencode-local/skills/`、ローカル版 command、ローカル版 template は作成しない。

### scripts/install.ps1 -LocalMode の入出力契約

`scripts/install.ps1` は `-Mode` パラメータ（dry-run / check / apply）に `-LocalMode` スイッチを併用でき、local mode のリンク設定を実行する。

| パラメータ | リンク構成 |
|-----------|-----------|
| `-LocalMode` 未指定（既定） | 通常版: 全 agentdev command/skill/tool を共通原本 `src/common/` 配下へ接続（plugin は `src/opencode/plugins/` 配下） |
| `-LocalMode` 指定時 | local mode: `tools/agentdev-gh/`（Custom Tool `agentdev_gh` の実行ディレクトリ）のみ `src/common/tools/agentdev-gh/local/` へ接続、それ以外は通常版に同じ |

`-Mode`（dry-run / check / apply）は `-LocalMode` の有無にかかわらず従来通り動作し、チェックアウト検証と junction 設定の各フェーズで適用される。
別スクリプト（`install-local.ps1` 等）は新設せず、エントリポイントを単一に維持する。
これは既存 `-Mode` パターンと整合し、チェックアウト検証と junction 設定のロジック重複を避けるための採用判断である。

### scripts/install.ps1 -Mode check の local mode リンク状態検出条件

`scripts/install.ps1 -Mode check` は `.opencode/tools/agentdev-gh/` が `src/common/tools/agentdev-gh/local/` への link として解決される場合、リポジトリ種別を `consumer-generated` として検出、報告する（リポジトリ種別判定基準表参照）。
通常版のリンク構成（`tools/agentdev-gh/` も共通原本 `src/common/` 配下へ接続）との違いを当該 link target で識別する。

### チェックアウト検証（usable checkout 判定）

`scripts/install.ps1`（-Mode apply / check / dry-run）は、agent-dev-flow チェックアウトの検証を git リポジトリ性必須判定ではなく usable checkout 判定で行う。
判定基準はチェックアウト配置先（既定 `.agentdev-plugin/`）配下に共通原本 `src/common/` が存在することであり、`.git` の存在を必須としない（REQ-009-047、REQ-009-048）。

チェックアウトが検出できない場合（チェックアウト配置先に `src/common/` が存在しない場合を含む）、エラー停止し、clone コマンド例とソースアーカイブ取得手順を案内表示する。
provisioning を代行実行しない。

`scripts/install.ps1 -Mode check` の版（commit/branch）報告は `.git` が存在する場合のみ行い、ZIP 展開チェックアウト（`.git` なし）の版は unknown とする。
「.agentdev-plugin/ が git リポジトリでない」は乖離（DIVERGENCE）ではなく情報報告として扱う。
version manifest ファイルは導入しない。
ZIP 展開環境はサポート対象外とし、不具合報告の受け付け対象から除外する運用とする。

### 更新運用

導入済み環境の更新は利用者の責務である（REQ-009-049）。
git clone 環境では git pull 後に install を再実行する。
ZIP 展開環境では ZIP 再取得・ディレクトリ差し替え後に install を再実行する。
install の apply は冪等であり、再実行で junction 構成を変化させない。
ZIP 更新時の install 再実行の要否は仕様として推奨・不推奨の形で定めず、利用者判断に委ねる。

### link target 確認方式

`.opencode/` 配下の実パス確認は、ジャンクション環境での一律停止（v2:ADR-0126 decision #3、廃止済み）から、意図した link target かどうかを確認する方式へ見直す（REQ-009 decision #6, REQ-009-010）。
link target が意図した target 以外へ解決される場合は link 設定を停止する。

#### ジャンクション状態の判定と自己修復

両公開入口（`scripts/install.ps1`・`scripts/self-sync.ps1`）は、各ジャンクション対象について、ジャンクションの有無と解決先の一致を同じ正本解決条件で確認する（REQ-050-002/003、REQ-058-012、PR #1120）。本節は install.ps1 の接続手順内に置かれているが、判定と挙動の規定は両公開入口・両ホスト（OpenCode・Senpi）・全モード（apply / check / dry-run）に適用する。各対象は以下のいずれかに分類される。

| 状態 | 判定基準 | apply モードの挙動 | check モードの挙動 | dry-run モードの挙動 |
|------|----------|-------------------|-------------------|---------------------|
| 正常（correct target） | ジャンクションが存在し、解決先が現行正本解決（LocalMode を含む）と一致 | 維持（再作成しない） | OK として報告 | 変更なしとして報告 |
| wrong target（管理物） | ジャンクションは存在するが解決先が現行正本と不一致（旧正本・消失済み正本を含む）。Test-ManagedProjectionJunction / Test-ManagedSenpiJunction が管理対象投影物と判定 | ジャンクションを削除して現行正本へ再作成（自己修復） | NG（乖離）として報告 | 除去・再作成の予測を表示（REQ-058-004） |
| wrong target（管理物と確認できない） | 解決先が正本候補外など、管理対象投影物と判定できない | 自動置換しない。リンクとリンク先実体を保持し、衝突を報告して非正常終了 | NG として報告（対象を特定） | 除去・再作成を予測しない（保持を報告） |
| ジャンクション以外のパス | パスが存在するがジャンクションでない | エラー停止 | エラーとして報告 | エラーとして報告 |

- 正本解決は既存の `Get-TargetSourcePath`（install・self-sync それぞれの実装）を使う。意図した src 配下は LocalMode の有無により切り替わる（install 通常版は共通原本 `src/common/` 配下・plugin は `src/opencode/plugins/` 配下、LocalMode 指定時は `agentdev-gh` のみ `src/common/tools/agentdev-gh/local/`。self-sync は OpenCode が `src/common/` または `src/opencode/`（plugins）、Senpi が Resolve-SenpiTargetRel 解決結果）
- 修復の可否判定には既存の `Test-ManagedProjectionJunction`・`Test-ManagedSenpiJunction` を再用する。これらは旧正本（`src/opencode/` 配下の旧配置）を向くリンクも管理対象投影物として修復可能に含め（REQ-099-012）、旧正本側に実体が残っていても現行正本への修復を省略しない。正本候補外を向くリンクは管理物と確認できないため自動置換しない
- 修復はジャンクション自体の削除・再作成に限定し、旧正本側の実体（ファイル・ディレクトリ）を移動・削除せず、依存生成・通信を行わない
- dry-run は apply が実行する追加・修復・削除を予測表示のみ行い（REQ-058-004）、check・dry-run はリンク先文字列・リンク先実体・配置先のファイルを変更しない（REQ-050-005）。修復予定がある通常の dry-run の終了コードは 0 を維持し、check の乖離は終了コード 1 とする
- apply は check と同じ正本解決条件の検出乖離を解消し、適用後に同一条件の check 再実行で乖離が残存しないことをもって収束とする（REQ-050-015、REQ-058-006）。衝突・修復失敗の apply を正常終了にしない
- 競合しない管理対象外リンク・実ディレクトリ・repo-local 資産の保護は「stale 管理投影物の削除境界」の既存契約を維持する。管理物と判定できない junction を削除せず非破壊に扱う規定と本節の修復時所有判定は同じ境界の適用面である

#### link mode の設定と更新

link 設定は導入先リポジトリでだけ実行し、AgentDevFlow 本体リポジトリでは実行しない。

設定前に各 link の実パスを確認し、意図した target 以外へ解決される場合は設定を停止する。

設定後は command、skill、Custom Tool（`agentdev-gh`）の各 link が期待する原本へ解決されることを確認する。

更新時は既存 link を解除してから同じ target へ再接続し、差分生成や変換処理は行わない。

設定結果は仕様管理リポジトリ、導入先リポジトリ、設定した link、target 確認結果、手動確認事項、結果を報告する。

#### 自己修復の適用範囲

wrong target 検出、再作成ロジックは LocalMode と通常版 install の両方に適用される。
リポジトリ種別の切り替え（通常版 ↔ LocalMode）後に旧接続先のジャンクションが残存していても、apply 再実行により正しい接続先へ復元される。
これにより通常版 install でも自己修復性が向上した。

## 配布物依存スキルの src 昇格（REQ-002-001/002、v2:ADR-0134）

`.opencode/skills/` 配下は既定で `.gitignore` により git 管理対象外である。
配布物（`src/common/commands/`, `src/common/skills/`）が `.opencode/skills/` 配下のスキルを参照する場合、新規 clone 環境でスキルが不在になり配布物の自己完結性（self-contained）が崩れる。
配布物が依存するスキルは共通原本 `src/common/skills/` へ昇格（配布物化）し、repo-local 専用スキルと明確に境界を分ける（v2:ADR-0134）。

### 昇格基準

| 区分 | 配置 | git 管理 | 配布 | 根拠 |
|------|------|----------|------|------|
| 配布物依存スキル | `src/common/skills/<name>/` | `src/` 配下で通常トラック | `agentdev-*` グロブ対象外の場合は install script で個別 junction 対象に追加 | v2:ADR-0134 / REQ-002-001 |
| repo-local 専用スキル | `.opencode/skills/repo-*/` | `.gitignore` `repo-*` ホワイトリストでトラック | 配布対象外（REQ-001） | REQ-001 / REQ-002-002 |

昇格判定は「配布物（`src/common/commands/`, `src/common/skills/`）が当該スキルを参照するか否か」で機械的に行う。
参照の有無は IR-058（後述）が `git ls-files` 突合とテキスト参照走査で検出する。

昇格基準表に第三区分の行を追加する:

- third-party Skill: 昇格対象外。.opencode/skills/<name>/ への取得機構経由配置が正規であり、src/common/skills/ へ昇格しない。配布成果物から参照する場合は宣言と参照点集約（REQ-002-044）に従う。

### 昇格手順

1. **参照確認**: 配布物（`src/common/commands/**/*.md`, `src/common/skills/**/*.md`）から当該スキル名が参照されていることを確認
2. **昇格**: `git mv .opencode/skills/<name>/ <files> src/common/skills/<name>/`
3. **`.gitignore` 整理**: 当該スキルが `repo-*` ホワイトリスト以外で個別にトラックされていた場合はその行を削除
4. **同期スクリプト更新**: `agentdev-*` グロブで自動 junction 対象外の場合、`scripts/self-sync.ps1` と `scripts/install.ps1` の `Get-ConsumerJunctionTargets` / `Get-SelectiveJunctionTargets` に個別追加
5. **README 推奨 .gitignore 更新**: consumer 向け推奨 `.gitignore` へ当該スキルを追加
6. **検査**: docs-check で IR-016（source-projection-sync）と IR-058（distribution-untracked-skill-reference）の NG が 0 件であることを確認

### 現行の境界（2026-07-03 時点）

| スキル | 区分 | 備考 |
|--------|------|------|
| `agentdev-*` 全 27 件 | 配布物依存 | `src/common/skills/` 配下、`agentdev-*` グロブで自動 junction |
| `repo-agentdev-integrity` | repo-local 専用 | `/repo/docs-check` 実行スキル。REQ-001 の `repo-*` 卡out 対象。検証スクリプトを呼び出す command は DEC-006 により3 command（`docs-check`, `inspect-skills`, `inspect-promote`）へ正規化済み。これらが `repo-agentdev-integrity/scripts/*.ts` を呼び出すが、当該参照は consumer 環境で実行時欠落する別課題（本 Design の対象外） |

## v4 adapter 境界への接続

本 Design が定義するリポジトリ種別、.opencode/ の意味、link mode、Tools / Plugins の配布・投影は、Harness/Backend adapter 境界（DEC-036）の下で維持される。link 元の原本は共通原本領域（src/common/）へ移行しており、src/opencode/ と src/senpi/ はホスト別接続領域として並列する。配備形態の原本は Decision「ADF 共通原本とホスト接続領域の分離」、配置契約と投影モデルの詳細はマルチホスト原本モデル Design（foundations/multi-host-canonical-model.md）が所有する。ローカル版 Custom Tool の原本は共通原本側の Tool engine 領域に整理され、OpenCode 領域（src/opencode/）への型・schema 参照を持たない（REQ-009-015/016）。

## 関連項目（See Also）

- [Consumer Project Setup Guide](../../guides/consumer-project-setup.md)（Consumer 向け導入手順）
- [Artifact Contracts](../responsibilities/artifact-contracts.md)（Command/Skill/Template/Script の責務境界）
- [ローカルIssue共通スキーマ](local-case-file.md)（`consumer-generated` リポジトリ種別のローカルIssueスキーマ）
- [整合性ルールカタログ](../integrity/integrity-rule-catalog.md)（IR-058 distribution-untracked-skill-reference）
- REQ-009-006~065（リポジトリ種別 / `.opencode/` 意味 / 命名 / 導入 / 同期範囲の要件定義）
- REQ-009（配布基盤: link mode 導入の宣言）
- REQ-009（ローカル版 OpenCode 導入方式とローカルIssue運用（`consumer-generated` リポジトリ種別））
- REQ-002（配布物依存スキルの src 昇格方針と未トラックスキル検出）
- REQ-009（ローカル版導入方式を link mode へ統一し生成方式を廃止。v2:ADR-0126 を supersede）
- v2:ADR-0134（配布物依存スキルの src 昇格方針）
