# 適用プロジェクトへの導入モデル

AgentDevFlow を適用プロジェクトに導入する際のモデルを定義する（REQ-0103-061~065, REQ-0103-072~077）。

## リポジトリ種別（Repo Type）

AgentDevFlow は5種のリポジトリ種別を定義する（詳細は SPEC [実行時パッケージ境界](../specs/runtime-package-boundary.md)）。本ガイドでは導入観点から各々を説明する。

| 種別 | 説明 | `.opencode/` の意味 | 例 |
|------|------|---------------------|-----|
| **本体リポジトリ**（self-hosting） | AgentDevFlow 本体開発リポジトリ。原本と配置先が同一リポジトリに存在 | `.opencode/` = 実行時の配置先（ジャンクション → `src/opencode/`） | agent-dev-flow |
| **consumer-with-agentdev** | AgentDevFlow を導入する製品リポジトリ。AgentDevFlow 提供 skill/command を利用 | `.opencode/` = プロジェクト独自設定の入口 + AgentDevFlow 提供 command/skill の実行時の位置 | 各種製品開発リポジトリ |
| **consumer-local** | AgentDevFlow を利用しない OpenCode プロジェクト。独自 command/skill のみ | `.opencode/` = プロジェクト独自設定専用。`agentdev` 名前空間は使用しない | 実験的リポジトリ |
| **consumer-generated** | ローカル版 OpenCode を導入する利用側リポジトリ。GitHub Issue/PR を使わない個人利用環境向け | `.opencode/` = 生成された AgentDevFlow 実行時の位置（実ディレクトリ、非ジャンクション）。`generated_by: local-opencode-transform` 識別子を保持 | 個人利用環境のローカルリポジトリ |
| **plugin-future** | 将来の plugin/npm/package 配布形態（現在は未対応） | `.opencode/` = plugin が管理する実行時の位置 | （将来） |

## `.opencode/` の意味の違い

### 本体リポジトリ（AgentDevFlow 本体）

```
.opencode/           → ジャンクション → src/opencode/ (実行時の配置先)
src/opencode/
  commands/agentdev/  → 原本（公開コマンド定義13件、README除外）
  skills/agentdev-*/  → 原本（agentdev スキル20件）
scripts/
  sync-self-opencode.ps1  → AgentDevFlow 本体リポジトリ用同期スクリプト
```

- 原本の編集は `src/opencode/` で行う
- `.opencode/` は ジャンクション/symlink による実行時の配置先
- `scripts/sync-self-opencode.ps1` で原本↔配置先の同期を管理する

### 適用プロジェクト（consumer-with-agentdev）

```
.agentdev-plugin/                → agent-dev-flow の git clone 先（適用プロジェクト専用）
  src/opencode/                  → 原本
.opencode/
  commands/agentdev/              → ジャンクション → .agentdev-plugin/src/opencode/commands/agentdev/
  commands/{local}/               → プロジェクト独自コマンド（実ディレクトリ）
  skills/agentdev-*/              → ジャンクション → .agentdev-plugin/src/opencode/skills/agentdev-*/
  skills/{local}-*/               → プロジェクト独自スキル（実ディレクトリ）
scripts/
  install-consumer-opencode.ps1   → 適用プロジェクト用インストールスクリプト
  check-consumer-opencode.ps1     → 適用プロジェクト用状態確認スクリプト
```

- `.agentdev-plugin/` に agent-dev-flow を clone する（`.agentdev/` ではない）
- `.agentdev/` は AgentDevFlow のドメイン状態用（Intake, Learning, Backlog 等）として予約
- `.opencode/` は AgentDevFlow 提供 command/skill とプロジェクト独自設定の混在場所
- AgentDevFlow 提供ファイルは ジャンクション（更新時に clone を pull すれば自動反映）
- プロジェクト独自ファイルは直接管理する

### 非 AgentDevFlow プロジェクト（consumer-local）

```
.opencode/
  commands/{local}/   → プロジェクト独自コマンドのみ
  skills/{local}-*/   → プロジェクト独自スキルのみ
```

- AgentDevFlow の名前空間を使用しない
- 自由に `.opencode/` を管理する

### ローカル版 OpenCode 導入（consumer-generated）

GitHub Issue/PR を使わない個人利用環境向けのリポジトリ種別。AgentDevFlow 本体リポジトリの `src/opencode/` と `src/opencode-local/` を入力とし、AI エージェントが変換プロンプト（`src/opencode-local/transform/generate.md`）に従って `.opencode/commands/agentdev/` と `.opencode/skills/agentdev-*/` に直接生成する（REQ-0141, ADR-0126）。詳細な生成フロー、安全ゲートは SPEC [ローカル版 OpenCode 生成](../specs/local-generation.md) を参照。

```
.agentdev-plugin/                → agent-dev-flow の git clone 先（生成時入力の取得元）
  src/opencode/                  → GitHub 版 AgentDevFlow の原本（生成入力その1）
  src/opencode-local/            → ローカル版生成時ソース領域（生成入力その2）
    README.md                    → ローカル版生成の実行手順
    case-schema/                 → ローカル Case ファイルスキーマ定義
    transform/                   → 変換用プロンプト・レビュー用プロンプト・変換仕様
    generation-flow.md           → 生成フロー定義
.opencode/
  commands/agentdev/             → 生成されたローカル版コマンド（実ディレクトリ・非ジャンクション）
  skills/agentdev-*/             → 生成されたローカル版スキル（実ディレクトリ・非ジャンクション）
.agentdev/
  cases/                         → ローカル Case ファイル（Issue / PR 相当の永続情報）
```

- **生成物の識別子**: 生成された `.opencode/commands/agentdev/**/*.md`、`.opencode/skills/agentdev-*/**/*.md` は `generated_by: local-opencode-transform` 識別子を持つ（REQ-0141-011）
- **上書き安全性**: 同名ファイル上書きは `generated_by` 識別子が一致する場合のみ許可される（REQ-0141-012, 013）
- **ジャンクション検出安全ゲート**: 生成前に `.opencode/` の実パスを確認し、`.opencode/` が `src/opencode/` 配下へ解決される場合は生成を停止する（REQ-0141-010）
- **リポジトリ管理対象外**: 生成された `.opencode/commands/`, `.opencode/skills/`, `.opencode/` 配下ひな形、変換スクリプトはリポジトリ管理対象外（REQ-0141-008, 009）
- **リポジトリ管理対象**: `.agentdev/cases/` 配下のローカル Case ファイルは Issue/PR 相当の永続情報としてリポジトリ管理対象（REQ-0141-016）
- **更新方式**: 差分更新を想定しない。`.opencode/commands/agentdev/` と `.opencode/skills/agentdev-*/` を全削除して作り直す（REQ-0141-033）
- **判定基準**: `.opencode/commands/agentdev/` が実ディレクトリ（非ジャンクション）で `generated_by: local-opencode-transform` を含む場合に consumer-generated と判定される（SPEC runtime-package-boundary.md）

#### ローカル版セットアップ手順

1. agent-dev-flow リポジトリを `.agentdev-plugin/` に clone する
2. OpenCode 等 AI エージェントで `src/opencode-local/README.md` の実行手順に従う
3. AI エージェントが `src/opencode-local/transform/generate.md`（変換用プロンプト）を入力またはファイル参照して実行する
4. `.opencode/commands/agentdev/` と `.opencode/skills/agentdev-*/` に生成物が配置されることを確認する
5. `generated_by: local-opencode-transform` 識別子が付与されていることを確認する
6. `.agentdev/cases/` ディレクトトリが存在することを確認する（ローカル Case ファイル用）
7. `.gitignore` に生成物（`.opencode/commands/agentdev/`, `.opencode/skills/agentdev-*/`）を追加する

#### ローカル版の更新手順

```powershell
# agent-dev-flow の最新を取得
cd .agentdev-plugin && git pull && cd ..

# ローカル版の全削除と再生成（差分更新は非対応）
# 1. .opencode/commands/agentdev/ と .opencode/skills/agentdev-*/ を削除
# 2. 変換プロンプトを再実行（src/opencode-local/README.md の手順に従う）
```

> 詳細な実行手順、制約、安全ゲートは `src/opencode-local/README.md`（生成時ソース領域の実行エントリポイント）と SPEC [ローカル版 OpenCode 生成](../specs/local-generation.md)、[ローカル Case ファイル](../specs/local-case-file.md)、[ローカル版 OpenCode 変換プロンプト](../specs/local-transform.md) を参照。

## 予約名（Reserved Names）

| 名前 | 種別 | 使用可能なリポジトリ種別 |
|------|------|---------------------|
| `agentdev` | コマンド名前空間 | `self-hosting`, `consumer-with-agentdev`, `consumer-generated` |
| `agentdev-*` | スキルプレフィックス | `self-hosting`, `consumer-with-agentdev`, `consumer-generated` |
| `.agentdev/` | ドメイン状態ディレクトリ | `self-hosting`, `consumer-with-agentdev`, `consumer-generated` |
| `.agentdev-plugin/` | 適用プロジェクトの clone 先 | `consumer-with-agentdev`, `consumer-generated` |
| `generated_by: local-opencode-transform` | 生成物識別子 | `consumer-generated` のみ付与（REQ-0141-011） |

**禁止事項**:
- consumer-local での `agentdev` 名前空間の使用（REQ-0103-056）
- consumer-with-agentdev での AgentDevFlow 提供ファイルの直接編集（上書きされる可能性）
- `.agentdev-plugin/` を `.agentdev/` として使用すること（ドメイン状態と競合）
- consumer-generated での `generated_by` 識別子を持たないファイル、異なる識別子を持つファイルの上書き（REQ-0141-012, 013）
- consumer-generated での `.opencode/` が `src/opencode/` 配下へ解決される環境での生成実行（REQ-0141-010）

`agentdev-integrity`（旧 integrity skill）は AgentDevFlow 配布対象外となった（ADR-0106）。docs-check は `repo-agentdev-integrity`（配布対象外スキル）として AgentDevFlow 本体リポジトリでのみ実行される。適用プロジェクトには配布されない。

## インストール方式の方針

| 方式 | 対応 | 推奨 | 備考 |
|--------|------|------|------|
| ジャンクション + clone（`.agentdev-plugin/`） | ✅ | **推奨** | 更新が自動反映、原本が単一 |
| 直接コピー | ⚠️ | 非推奨 | 手動更新が必要、乖離のリスク |
| Git サブモジュール | ⚠️ | 検討可能 | 複雑性が増す |
| プラグイン/npm/package | ❌ | 将来対応 | REQ-0103-064 で将来の選択肢扱い |

### ジャンクションと clone によるインストール（推奨）

agent-dev-flow を `.agentdev-plugin/` に clone し、ジャンクションで実行時の配置先を作成する。

```powershell
# 1. インストール（clone + ジャンクション作成を一括実行）
./scripts/install-consumer-opencode.ps1 -Mode apply

# 2. 状態確認
./scripts/check-consumer-opencode.ps1

# 3. ドライラン（変更確認）
./scripts/install-consumer-opencode.ps1 -Mode dry-run
```

### 更新手順

```powershell
# agent-dev-flow の最新を取得
cd .agentdev-plugin && git pull && cd ..

# ジャンクションを再同期（新しい skill/command が追加された場合）
./scripts/install-consumer-opencode.ps1 -Mode apply
```

### 直接コピーによるインストール（非推奨）

- 初回は手動コピーで動作するが、AgentDevFlow 更新時に再コピーが必要
- docs-check で乖離を検出可能（IR-016）

## スクリプトの適用範囲

| スクリプト | 対象リポジトリ種別 | 役割 |
|--------|---------------|------|
| `scripts/sync-self-opencode.ps1` | `self-hosting` | `src/opencode/` ↔ `.opencode/` の同期 |
| `scripts/install-consumer-opencode.ps1` | `consumer-with-agentdev` | `.agentdev-plugin/` clone + ジャンクション作成 |
| `scripts/check-consumer-opencode.ps1` | `consumer-with-agentdev` | インストール状態の検証 |
| （決定的変換スクリプトなし） | `consumer-generated` | 決定的な変換ロジックを実装したスクリプトは使用しない（REQ-0141-032）。AI エージェントが `src/opencode-local/transform/generate.md` 変換プロンプトに従って生成する |

### 本体リポジトリ（self-hosting）での同期

```powershell
./scripts/sync-self-opencode.ps1 -Mode apply   # src/opencode/ → .opencode/ 同期
./scripts/sync-self-opencode.ps1 -Mode check   # 乖離の検出
./scripts/sync-self-opencode.ps1 -Mode dry-run # 変更予測
```

### 適用プロジェクト（consumer-with-agentdev）でのインストール/確認

```powershell
./scripts/install-consumer-opencode.ps1 -Mode apply   # clone + ジャンクション作成
./scripts/install-consumer-opencode.ps1 -Mode check   # 乖離の検出
./scripts/install-consumer-opencode.ps1 -Mode dry-run # 変更予測
./scripts/check-consumer-opencode.ps1                  # 状態確認（check のみ）
```

## プロジェクト独自の命名ルール

適用プロジェクトで独自 command/skill を追加する場合:

| ルール | 説明 |
|------|------|
| 名前空間の衝突回避 | `agentdev` および `agentdev-*` は使用不可 |
| kebab-case | skill 名は小文字、数字、ハイフンのみ（REQ-0103-011） |
| 意味に基づく命名 | プロジェクト名やドメイン名をプレフィックスに含めることを推奨 |
| 独自ディレクトリ | 独自 skill は `.opencode/skills/{project}-*/` に配置 |

例: プロジェクト `myapp` の場合:
- command: `.opencode/commands/myapp/`
- skill: `.opencode/skills/myapp-deployment/`

## 推奨 .gitignore 設定（適用プロジェクトリポジトリ）

適用プロジェクトリポジトリで推奨される `.gitignore` 設定:

```gitignore
# AgentDevFlow の clone 先
.agentdev-plugin/

# OpenCode の実行時作業領域
.sisyphus/

# AgentDevFlow がジャンクション管理するディレクトリ（インストールスクリプトが自動作成）
.opencode/commands/agentdev/
.opencode/skills/agentdev-*/
```

**注意**: `.agentdev/` は gitignore に**含めない**こと。`.agentdev/` は AgentDevFlow のドメイン状態（Intake, Learning, Backlog 等）を保持し、git 管理対象である。

## 移行ガイド

### 新規適用プロジェクトの導入手順

1. 適用プロジェクトリポジトリに `scripts/` ディレクトリをコピー（または agent-dev-flow から取得）
2. `./scripts/install-consumer-opencode.ps1 -Mode apply` を実行
3. `./scripts/check-consumer-opencode.ps1` で動作確認
4. `.agentdev/` ディレクトリが存在することを確認（Intake/Learning 用）
5. `.gitignore` に推奨エントリを追加

### 既存プロジェクトへの導入手順

1. 既存の `.opencode/` 内容を確認
2. `agentdev` 名前空間との衝突がないことを確認
3. `./scripts/install-consumer-opencode.ps1 -Mode apply` でインストール
4. `./scripts/check-consumer-opencode.ps1` で整合性確認
5. `.gitignore` を更新
