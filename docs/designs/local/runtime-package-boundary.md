---
title: 実行時パッケージ境界
status: accepted
created: 2026-08-20
updated: 2026-09-03
---
<!-- ADF-COVERS(implementation): REQ-002-007, REQ-002-008, REQ-002-011, REQ-002-019, REQ-002-020, REQ-002-027 -->
<!-- ADF-COVERS(implementation): REQ-009-002, REQ-009-003, REQ-009-006, REQ-009-007, REQ-009-008, REQ-009-009, REQ-009-010, REQ-009-011, REQ-009-012, REQ-009-013, REQ-009-014, REQ-009-015, REQ-009-016, REQ-009-017, REQ-009-018, REQ-009-019, REQ-009-020, REQ-009-021, REQ-009-022, REQ-009-023, REQ-009-024, REQ-009-025, REQ-009-035, REQ-009-036, REQ-009-037, REQ-009-038, REQ-009-039, REQ-009-046, REQ-009-047, REQ-009-048, REQ-009-049 -->
<!-- ADF-COVERS(implementation): REQ-044-004 -->
<!-- ADF-COVERS(implementation): REQ-011-006 -->
<!-- ADF-COVERS(implementation): REQ-050-001, REQ-050-002, REQ-050-003, REQ-050-004, REQ-050-005, REQ-050-006, REQ-050-007, REQ-050-008, REQ-050-010, REQ-050-013 -->
<!-- ADF-COVERS(implementation): REQ-052-007（scripts/consumer/archive/install.ps1、scripts/install.ps1 の宣言を docs 正規配置先へ移管） -->
<!-- ADF-COVERS(implementation): REQ-057-009, REQ-057-010（配布物 concrete ID cleanup、ir-055/ir-059 baseline 整備、DEC-023 (proposed) 注記、tmp 残渣抑止） -->
<!-- 注: install/self-sync 各 ps1（scripts/）は走査対象拡張子外のため、導入器実装行の宣言は本 Design（正規仕様所有者）へ配置。実装実体は scripts/install.ps1、scripts/self-sync.ps1（内部処理は scripts/consumer/、scripts/self/ 配下） -->

# 実行時パッケージ境界

> **Scope**: 本 Design は agent-dev-flow リポジトリのリポジトリ内部設計文書である（REQ-001）。
> リポジトリ種別（repo type）間の実行時パッケージ境界モデルを本リポジトリの観点から記述し、consumer プロジェクトの振る舞いを規定しない。
> Consumer プロジェクトは独自の規約に従い、本 Design は agent-dev-flow リポジトリが実行時パッケージをどう構成、配布するかのみを定義する。

## 目的

AgentDevFlow の実行時パッケージ境界を定義し、本体リポジトリと consumer プロジェクトでの `.opencode/` 役割、命名、導入方式、同期範囲を明確化する（REQ-002-061~065, REQ-009）。

## 4 種のリポジトリ種別（Repo Type）

> plugin/npm/package 配布形態は現在未対応である（REQ-002-064 参照）。
> REQ-009-006 は5種のリポジトリ種別として将来対応の `plugin-future` を含めて定義する。
> 本 Design の4種表は現行実装済みの種別のみを扱い、`plugin-future` は将来対応の第5種として本表から除外する。
> REQ と本 Design の種別数の差は対応時期の違いによるものであり、矛盾ではない。
> `plugin-future` の実装時に本表へ行を追加する。

| Type ID | 名称 | 説明 | `.opencode/` の意味 | 典型例 |
|---------|------|------|---------------------|--------|
| `self-hosting` | AgentDevFlow 本体開発リポジトリ | 原本と配置先が同一リポジトリに存在 | 実行時配置先（ジャンクション → `src/opencode/`） | `agent-dev-flow` |
| `consumer-with-agentdev` | AgentDevFlow 導入製品リポジトリ | AgentDevFlow 提供 skill/command を利用 | プロジェクトローカルカスタマイズ入口 + AgentDevFlow 実行時位置 | 各種製品開発リポジトリ |
| `consumer-local` | 非 AgentDevFlow OpenCode プロジェクト | 独自 command/skill のみ | プロジェクトローカルカスタマイズ専用 | 実験的リポジトリ |
| `consumer-generated` | ローカル版 OpenCode 導入リポジトリ | ローカル版 OpenCode を導入する利用側リポジトリ | link mode による AgentDevFlow 実行時位置（Custom Tool `agentdev_gh` の実行ディレクトリのみ `src/opencode-local/` から接続） | 個人利用環境のローカルリポジトリ |

`consumer-generated` はローカル版 OpenCode を link mode で導入する利用側リポジトリである（REQ-009, REQ-009, REQ-009）。
`.opencode/commands/agentdev/` と `.opencode/skills/agentdev-*/` を `src/opencode/` 配下へ接続し、Custom Tool `agentdev_gh` の実行ディレクトリ（`.opencode/tools/agentdev-gh/`）だけを `src/opencode-local/agentdev-gh-cli/`（Local 実装）へ接続する。
詳細は本 Design の「link mode 接続手順技術詳細」を参照。

### リポジトリ種別判定基準

| 条件 | リポジトリ種別 |
|------|-----------|
| `src/opencode/` が存在し `.opencode/` がジャンクション | `self-hosting` |
| `.opencode/commands/agentdev/` または `.opencode/skills/agentdev-*/` が存在（ジャンクション、シンボリックリンク含む） | `consumer-with-agentdev` |
| `.opencode/tools/agentdev-gh/` が `src/opencode-local/agentdev-gh-cli/` への link として解決される | `consumer-generated` |
| `.opencode/` が存在し `agentdev` 名前空間を含まない | `consumer-local` |
| 上記いずれでもない | N/A（OpenCode 非使用リポジトリ） |

## リポジトリ種別別 `.opencode/` 意味

### 本体リポジトリ（self-hosting）

```
.opencode/                       → real directory (not junction)
  commands/agentdev/             → junction → src/opencode/commands/agentdev/
  skills/agentdev-*/             → junction → src/opencode/skills/agentdev-*/ (per skill)
  .gitignore                     → copy from src/opencode/.gitignore (real file)
  (opencode runtime files)       → sessions, config, etc. managed by opencode itself
src/opencode/
commands/agentdev/             → 原本
skills/agentdev-*/             → 原本
```

- 原本編集は `src/opencode/` で実施
- `.opencode/` は実ディレクトリとして動作（全体ジャンクションではない）
- `scripts/self-sync.ps1` が `commands/agentdev/` と `skills/agentdev-*/` を個別ジャンクションとして管理
- ジャンクション対象は `agentdev-*` グロブで動的列挙（ハードコードなし）
- `.gitignore` は `src/opencode/.gitignore` から実ファイルとしてコピー
- `.opencode/` 内の非管理ファイル（セッション、設定等）は opencode ランタイムが自由に配置可能

### 本体リポジトリ sync

**配布対象ディレクトリ**:
- `.opencode/commands/agentdev/` → junction → `src/opencode/commands/agentdev/`
- `.opencode/skills/agentdev-*/` → junction → `src/opencode/skills/agentdev-*/`

**scripts/ 配下の配布境界（skills/agentdev-*/scripts/ 配下）**:
配布対象: `*.ts`（TSソース）、`lib/*.ts`（共有ライブラリ）、`tests/*.test.ts`（テスト）、`package.json`、`tsconfig.json`、`bun.lock`、`.gitignore`、`README.md`
除外対象: `node_modules/`（.gitignore で除外済み、consumer 側で `bun install` により再生成）
tmp 残渣抑止: テスト一時フィクスチャ（`tmp-*` 等）の生成先は OS 一時ディレクトリ（`os.tmpdir()`）とし、配布パッケージの tests/ 配下へ生成残渣を残さない。テストのクリーンアップ（削除）は補助手段であり、リポジトリ内への一時生成をしない構造を正とする

scripts/ は skill junction の配下に位置し、skill の一部として配布される。
ジャンクション対象は `agentdev-*` グロブで動的列挙（ハードコードなし）。

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

- プロジェクトローカル名前空間（`agentdev` 以外）を使用する（REQ-002-056）
- 自由に `.opencode/` を管理

### Consumer（ローカル版 link mode）

```
.opencode/
  commands/agentdev/      → link → src/opencode/commands/agentdev/
  skills/agentdev-*/      → link → src/opencode/skills/agentdev-*/
  tools/agentdev-gh/      → link → src/opencode-local/agentdev-gh-cli/（Local 実装）
.agentdev/
  issues/                 → ローカルIssue（Issue / PR 相当の永続情報）
```

- `.opencode/commands/agentdev/` と `.opencode/skills/agentdev-*/` を `src/opencode/` 配下へ接続する（REQ-009 decision #2）
- Custom Tool `agentdev_gh` の実行ディレクトリ（`.opencode/tools/agentdev-gh/`）だけを `src/opencode-local/agentdev-gh-cli/` へ接続する（REQ-009 decision #3、REQ-011-006）
- link target が意図した target 以外へ解決される場合は link 設定を停止する（REQ-009-010, REQ-009 decision #6）
- `.opencode/commands/`, `.opencode/skills/`, `.opencode/` 配下ひな形は link により git 管理対象外（REQ-009-008, REQ-009 decision #1）

link mode 接続の技術詳細:

- Plugin のローダーシム（`.opencode/plugins/agentdev-*.ts`、`<package>.ts` の1行再エクスポート）は投影成果物として生成する。install の apply は shim の存在と実体パス解決を検査し、shim が欠落または意図しない解決となっている場合は再生成して自己修復する
- link 接続した Custom Tool 実行ディレクトリで `bun install` を実行する環境では、当該実行ディレクトリの `.gitignore` に `node_modules/` を指定することを推奨する（投影領域への依存生成物混入の防止）
- `.agentdev/issues/` 配下のローカルIssueは Issue/PR 相当の永続情報としてリポジトリ管理対象（REQ-009-016、REQ-009-026）

## プロジェクトローカル命名規則（Project-Local Naming Rules）

Consumer プロジェクトで独自 command/skill を追加する際の命名規約（REQ-002-063）。

### 予約名（Reserved Names）

| 名前 | 種別 | 使用可能リポジトリ種別 |
|------|------|-------------------|
| `agentdev` | コマンド名前空間 | `self-hosting`, `consumer-with-agentdev`, `consumer-generated` |
| `agentdev-*` | スキルプレフィックス | `self-hosting`, `consumer-with-agentdev`, `consumer-generated` |
| `.agentdev/` | ドメイン状態ディレクトリ | `self-hosting`, `consumer-with-agentdev`, `consumer-generated` |

### 命名規約

| 規則 | 説明 | 根拠 |
|------|------|------|
| 名前空間衝突回避 | `agentdev` / `agentdev-*` / `.agentdev/` 以外の名前を使用 | REQ-002-056 |
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
| Plugin / npm / package | 未対応 | - | REQ-002-064 参照 |
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
| `self-hosting` | `scripts/self-sync.ps1` による `commands/agentdev/` + `skills/agentdev-*/` の選択的ジャンクション + `.gitignore` コピー | opencode 実行時ファイル（sessions, config 等） |
| `consumer-with-agentdev` | `scripts/install.ps1` による AgentDevFlow 提供ファイルのみ | プロジェクトローカルカスタマイズ |
| `consumer-local` | なし（適用対象外） | 全体 |
| `consumer-generated` | なし（適用対象外）。link 設定により接続されるため同期スクリプト対象外 | 全体 |

> plugin/npm/package 配布形態は現在未対応である（REQ-009-009 参照）。

### 本体リポジトリでの同期モード

`scripts/self-sync.ps1` は apply、check、dry-run の3モードを提供する（REQ-050-003）。

| Mode | 動作 |
|------|------|
| `apply` | `src/opencode/` → `.opencode/` の同期実行 |
| `check` | 乖離検出（終了コードで判定）。同期対象を変更しない |
| `dry-run` | 変更予測（実行なし）。同期対象を変更しない |

### Consumer での同期

Consumer では `scripts/install.ps1` が AgentDevFlow 本体から提供されるファイルのみを同期対象とする（apply、check、dry-run。REQ-050-002、REQ-050-005）。
プロジェクトローカルカスタマイズは同期の影響を受けない。
旧状態確認専用スクリプト（check-consumer-opencode.ps1）の検査能力は `scripts/install.ps1 -Mode check` が包含する（REQ-050-004。検査項目の一覧は install-script-usability Design「install.ps1 -Mode check の検査カタログ」参照）。

### stale 管理投影物の削除境界

正本から除外・削除された ADF 管理対象投影物（stale 管理投影物）の削除は、ADF 管理境界の内部で完結する（REQ-058）。

- 削除対象は、ADF が管理する投影物として配置したもののうち、正本から削除されたもの、および配布・投影対象から明示的に除外されたことにより管理対象から外れたものとする
- `repo-local` prefix の成果物、利用者が独自に作成した `.opencode/` 配下の成果物、その他 ADF が管理していない成果物は、名前や配置場所が近似しているだけでは削除対象にしない
- ADF 管理物かどうかを確定できない成果物は自動削除せず、既存契約に従って非破壊的に扱う
- Plugin loader shim 等、ADF が生成・管理し正本側の対象消滅によって不要となる生成物の stale 削除は既存契約を維持し、上記の削除境界と矛盾させない。repo-local 配布除外と自己ホスト投影の非対称（「Tools / Plugins の配布・投影」参照）は本削除境界で変えない
- archive installer（junction 方式ではない）は本削除契約の直接対象外とし、同等の収束契約が必要かどうかの評価を本契約の実装対象に含めない

## scripts 公開入口と内部配置

scripts/ 直下の公開入口と内部配置の構成（REQ-050-001、REQ-050-009）。

- 公開入口2本: consumer 向け `scripts/install.ps1`、self-hosting 向け `scripts/self-sync.ps1`。公開入口名は利用者が固定参照する安定契約である（REQ-050-001）
- 内部配置: consumer 専用の内部処理は `scripts/consumer/` 配下、self-hosting 固有の配布・検証処理は `scripts/self/release/` 配下、保守処理は `scripts/self/maintenance/` 配下
- release 生成、信頼境界検証、self-hosting 保守処理、単体実行しない内部共通処理を scripts/ 直下に配置しない
- 具体的な内部ファイル分割は、公開契約と依存境界を変えない範囲で実装時に調整できる

### archive 専用 installer 原本と release archive 投影

repository 上では archive 専用 installer の原本を通常 consumer installer と分離して保持する（`scripts/consumer/archive/install.ps1`）。
release archive 内では consumer が実行する公開入口として `scripts/install.ps1` の名で配置する。
通常 checkout 版の `scripts/install.ps1` と release archive 版の `scripts/install.ps1` は同一ファイルである必要はなく、異なる installation projection として扱い、それぞれの導入方式の契約を維持する。両版を同一実装へ強制統合しない（REQ-050-010）。

## Tools / Plugins の配布・投影

Custom Tool（src/opencode/tools/）と Plugin / Hook（src/opencode/plugins/）を正規配布種別として扱う
（REQ-052）。原本と実行時投影は Command / Skill と同一の source・projection 原則（DEC-002）に従い、
link mode の接続対象に含める。scripts/ 直下の公開入口は従来どおり2本に固定し、Tool / Plugin の追加によって
新たな公開入口を作らない（REQ-050-001、REQ-052-008）。ディレクトリ構造の詳細は本 Design が所有する。

### repo-local Plugin の配布・投影契約

repo-local Plugin（REQ-002-045）の配布・投影については次のとおりである。

- repo-local Plugin の正本配置原則は `src/opencode/plugins/<agentdev-name>/` 配下である。consumer 配布系全経路（`scripts/install.ps1`、`scripts/consumer/` 配下の archive installer、`scripts/self/release/package-release-archive.ps1`）は repo-local 配布除外を実装し、3ファイルの列挙条件を同期する義務を持つ。
- `scripts/self-sync.ps1` は repo-local Plugin を除外しない（自己ホスト投影を維持する）。理由は、consumer 配布と自己ホスト投影が非対称であるためである。repo-local Plugin は REQ-052-006 により consumer への配布対象外である一方、自己ホスト環境では Plugin を利用可能にする必要がある。自己ホスト投影は canonical チェックアウト内部の source → projection 構成（`.opencode/plugins/` への junction と depth-1 loader shim 生成）であり、consumer への配布ではないため、配布除外機構の適用対象外である。
- 除外機構の実現方式は明示的除外リスト等とする。REQ-002-011 の repo-* prefix 方式を plugin に採用しない（shim 名が repo-*.ts になり、stale shim 検出フィルタ等の波及修正が増えるため）。

配布境界 checker の repo-local モデル: 配布境界 checker は consumer 配布系と自己ホスト投影の非対称（上記のとおり）を repo-local モデルとして前提とする。detector の列挙条件（除外対象の検出箇所一覧）は repo-local Plugin の正本配置原則（`src/opencode/plugins/<agentdev-name>/`）と同期を維持し、列挙の乖離が観測された場合は個別特例の追加ではなく検査側の一般化で解消する方針とする。
- 将来 repo-local Plugin が複数化した時点で、マーカー方式（package.json マーカーフィールド等）への拡張条件を判断する。

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

`consumer-generated` リポジトリ種別における link mode 接続の技術詳細を明文化する（REQ-009 decision #2, #3, #6, REQ-009, v2:REQ-0150）。

### local mode のリンク構成

| リンク元（`.opencode/` 配下） | リンク先 | 備考 |
|-------------------------------|----------|------|
| `commands/agentdev/` | `src/opencode/commands/agentdev/` | 通常版と同一接続先（REQ-009 decision #2） |
| `skills/agentdev-*/` | `src/opencode/skills/agentdev-*/` | 通常版と同一接続先（REQ-009 decision #2） |
| `tools/agentdev-gh/` | `src/opencode-local/agentdev-gh-cli/` | local mode のみ差し替え接続先。Custom Tool `agentdev_gh` の実行ディレクトリ（REQ-009 decision #3, REQ-011-006） |

agentdev-gh 以外は通常版と同一の `src/opencode/` 配下へ接続し、Custom Tool `agentdev_gh` の実行ディレクトリ（`.opencode/tools/agentdev-gh/`）のみ `src/opencode-local/agentdev-gh-cli/`（Local 実装）へ接続することでローカル版環境を構成する。
`src/opencode/` は GitHub 版専用原本であり、ローカル版はこれを変更しない（REQ-009 decision #7）。

### ローカル I/O パッケージ契約

`src/opencode-local/agentdev-gh-cli/` は Custom Tool `agentdev_gh` の Local 実装の唯一の原本である。

ローカル版は通常版と同じ操作契約を提供し、Issue と PR の読取り、更新、作成済み状態、取り込み結果をローカルIssue（`.agentdev/issues/issue-{NNNN}.md`）の対応する記録へ読み替える（REQ-009-026〜032）。

上位の command と skill は常に Tool 操作契約を参照し、ローカル版専用の別名 skill や分岐を持たない。

`case-schema/` はローカル I/O の操作用定義として当該パッケージに含める。

ローカルIssueのスキーマ正本は [ローカルIssue共通スキーマ](local-case-file.md) とし、ローカル I/O パッケージは正本を再定義しない。

ローカル版のための汎用バックエンド抽象化、`src/opencode-local/skills/`、ローカル版 command、ローカル版 template は作成しない。

### scripts/install.ps1 -LocalMode の入出力契約

`scripts/install.ps1` は `-Mode` パラメータ（dry-run / check / apply）に `-LocalMode` スイッチを併用でき、local mode のリンク設定を実行する。

| パラメータ | リンク構成 |
|-----------|-----------|
| `-LocalMode` 未指定（既定） | 通常版: 全 agentdev command/skill/tool を `src/opencode/` 配下へ接続 |
| `-LocalMode` 指定時 | local mode: `tools/agentdev-gh/`（Custom Tool `agentdev_gh` の実行ディレクトリ）のみ `src/opencode-local/agentdev-gh-cli/` へ接続、それ以外は `src/opencode/` 配下へ接続 |

`-Mode`（dry-run / check / apply）は `-LocalMode` の有無にかかわらず従来通り動作し、チェックアウト検証と junction 設定の各フェーズで適用される。
別スクリプト（`install-local.ps1` 等）は新設せず、エントリポイントを単一に維持する。
これは既存 `-Mode` パターンと整合し、チェックアウト検証と junction 設定のロジック重複を避けるための採用判断である。

### scripts/install.ps1 -Mode check の local mode リンク状態検出条件

`scripts/install.ps1 -Mode check` は `.opencode/tools/agentdev-gh/` が `src/opencode-local/agentdev-gh-cli/` への link として解決される場合、リポジトリ種別を `consumer-generated` として検出、報告する（リポジトリ種別判定基準表参照）。
通常版のリンク構成（`tools/agentdev-gh/` も `src/opencode/` 配下へ接続）との違いを当該 link target で識別する。

### チェックアウト検証（usable checkout 判定）

`scripts/install.ps1`（-Mode apply / check / dry-run）は、agent-dev-flow チェックアウトの検証を git リポジトリ性必須判定ではなく usable checkout 判定で行う。
判定基準はチェックアウト配置先（既定 `.agentdev-plugin/`）配下に `src/opencode/` が存在することであり、`.git` の存在を必須としない（REQ-009-047、REQ-009-048）。

チェックアウトが検出できない場合（チェックアウト配置先に `src/opencode/` が存在しない場合を含む）、エラー停止し、clone コマンド例とソースアーカイブ取得手順を案内表示する。
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

`scripts/install.ps1` は各ジャンクション対象について、ジャンクションの有無と解決先の一致を確認する（PR #1120）。
各対象は以下のいずれかに分類される。

| 状態 | 判定基準 | apply モードの挙動 | check / dry-run モードの挙動 |
|------|----------|-------------------|-----------------------------|
| 正常（correct target） | ジャンクションが存在し、解決先が意図した src 配下に一致 | 維持（再作成しない） | OK として報告 |
| wrong target | ジャンクションは存在するが、解決先が意図した src 配下と不一致、または解決先が存在しない | ジャンクションを削除して再作成（自己修復） | NG として報告 |
| ジャンクション以外のパス | パスが存在するがジャンクションでない | エラー停止 | エラーとして報告 |

意図した src 配下は LocalMode の有無により切り替わる。
通常版は `src/opencode/` 配下、LocalMode 指定時は `agentdev-gh-cli` のみ `src/opencode-local/agentdev-gh-cli/`、それ以外は `src/opencode/` 配下である（REQ-009 decision #2, #3）。

wrong target は「ジャンクション自体は存在するが、意図した接続先へ接続されていない、または接続先が解決不能」な状態である。
PR #1120 により、従来の「ジャンクションが存在すれば正常とみなす」判定から、`Resolve-Path` により実際の解決先と期待される src 配下を比較して意図した target か確認する判定へ拡張された。
apply モードでは wrong target のジャンクションを削除、再作成することで、利用者の介入なしに正しい接続先へ復元する。

#### link mode の設定と更新

link 設定は導入先リポジトリでだけ実行し、AgentDevFlow 本体リポジトリでは実行しない。

設定前に各 link の実パスを確認し、意図した target 以外へ解決される場合は設定を停止する。

設定後は command、skill、`agentdev-gh-cli` の各 link が期待する原本へ解決されることを確認する。

更新時は既存 link を解除してから同じ target へ再接続し、差分生成や変換処理は行わない。

設定結果は仕様管理リポジトリ、導入先リポジトリ、設定した link、target 確認結果、手動確認事項、結果を報告する。

#### 自己修復の適用範囲

wrong target 検出、再作成ロジックは LocalMode と通常版 install の両方に適用される。
リポジトリ種別の切り替え（通常版 ↔ LocalMode）後に旧接続先のジャンクションが残存していても、apply 再実行により正しい接続先へ復元される。
これにより通常版 install でも自己修復性が向上した。

## 配布物依存スキルの src 昇格（REQ-002-001/002、v2:ADR-0134）

`.opencode/skills/` 配下は既定で `.gitignore` により git 管理対象外である。
配布物（`src/opencode/commands/`, `src/opencode/skills/`）が `.opencode/skills/` 配下のスキルを参照する場合、新規 clone 環境でスキルが不在になり配布物の自己完結性（self-contained）が崩れる。
配布物が依存するスキルは `src/opencode/skills/` へ昇格（配布物化）し、repo-local 専用スキルと明確に境界を分ける（v2:ADR-0134）。

### 昇格基準

| 区分 | 配置 | git 管理 | 配布 | 根拠 |
|------|------|----------|------|------|
| 配布物依存スキル | `src/opencode/skills/<name>/` | `src/` 配下で通常トラック | `agentdev-*` グロブ対象外の場合は install script で個別 junction 対象に追加 | v2:ADR-0134 / REQ-002-001 |
| repo-local 専用スキル | `.opencode/skills/repo-*/` | `.gitignore` `repo-*` ホワイトリストでトラック | 配布対象外（REQ-001） | REQ-001 / REQ-002-002 |

昇格判定は「配布物（`src/opencode/commands/`, `src/opencode/skills/`）が当該スキルを参照するか否か」で機械的に行う。
参照の有無は IR-058（後述）が `git ls-files` 突合とテキスト参照走査で検出する。

昇格基準表に第三区分の行を追加する:

- third-party Skill: 昇格対象外。.opencode/skills/<name>/ への取得機構経由配置が正規であり、src/opencode/skills/ へ昇格しない。配布成果物から参照する場合は宣言と参照点集約（REQ-002-044）に従う。

### 昇格手順

1. **参照確認**: 配布物（`src/opencode/commands/**/*.md`, `src/opencode/skills/**/*.md`）から当該スキル名が参照されていることを確認
2. **昇格**: `git mv .opencode/skills/<name>/ <files> src/opencode/skills/<name>/`
3. **`.gitignore` 整理**: 当該スキルが `repo-*` ホワイトリスト以外で個別にトラックされていた場合はその行を削除
4. **同期スクリプト更新**: `agentdev-*` グロブで自動 junction 対象外の場合、`scripts/self-sync.ps1` と `scripts/install.ps1` の `Get-ConsumerJunctionTargets` / `Get-SelectiveJunctionTargets` に個別追加
5. **README 推奨 .gitignore 更新**: consumer 向け推奨 `.gitignore` へ当該スキルを追加
6. **検査**: docs-check で IR-016（source-projection-sync）と IR-058（distribution-untracked-skill-reference）の NG が 0 件であることを確認

### 現行の境界（2026-07-03 時点）

| スキル | 区分 | 備考 |
|--------|------|------|
| `agentdev-*` 全 27 件 | 配布物依存 | `src/opencode/skills/` 配下、`agentdev-*` グロブで自動 junction |
| `japanese-tech-writing` | 配布物依存 | `agentdev-doc-writing` が執筆規範 SSoT として参照（PR #1385 で昇格）。`agentdev-*` 非準拠のため install script で個別 junction 対象 |
| `repo-agentdev-integrity` | repo-local 専用 | `/repo/docs-check` 実行スキル。REQ-001 の `repo-*` 卡out 対象。検証スクリプトを呼び出す command は DEC-006 により3 command（`docs-check`, `inspect-skills`, `inspect-promote`）へ正規化済み。これらが `repo-agentdev-integrity/scripts/*.ts` を呼び出すが、当該参照は consumer 環境で実行時欠落する別課題（本 Design の対象外） |

## 関連項目（See Also）

- [Consumer Project Setup Guide](../../guides/consumer-project-setup.md)（Consumer 向け導入手順）
- [Artifact Contracts](../responsibilities/artifact-contracts.md)（Command/Skill/Template/Script の責務境界）
- [ローカルIssue共通スキーマ](local-case-file.md)（`consumer-generated` リポジトリ種別のローカルIssueスキーマ）
- [整合性ルールカタログ](../integrity/integrity-rule-catalog.md)（IR-058 distribution-untracked-skill-reference）
- REQ-002-061~065（リポジトリ種別 / `.opencode/` 意味 / 命名 / 導入 / 同期範囲の要件定義）
- REQ-009（配布基盤: link mode 導入の宣言）
- REQ-009（ローカル版 OpenCode 導入方式とローカルIssue運用（`consumer-generated` リポジトリ種別））
- REQ-002（配布物依存スキルの src 昇格方針と未トラックスキル検出）
- REQ-009（ローカル版導入方式を link mode へ統一し生成方式を廃止。v2:ADR-0126 を supersede）
- v2:ADR-0134（配布物依存スキルの src 昇格方針）
