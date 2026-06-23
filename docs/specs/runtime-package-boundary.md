# 実行時パッケージ境界

> **Scope**: 本 SPEC は agent-dev-flow リポジトリのリポジトリ内部設計文書である（ADR-0103）。リポジトリ種別（repo type）間の実行時パッケージ境界モデルを本リポジトリの観点から記述し、consumer プロジェクトの振る舞いを規定しない。Consumer プロジェクトは独自の規約に従い、本 SPEC は agent-dev-flow リポジトリが実行時パッケージをどう構成・配布するかのみを定義する。

## 目的

AgentDevFlow の実行時パッケージ境界を定義し、本体リポジトリと consumer プロジェクトでの `.opencode/` 役割・命名・導入方式・同期範囲を明確化する（REQ-0103-061~065, REQ-0141）。

## 5 種のリポジトリ種別（Repo Type）

| Type ID | 名称 | 説明 | `.opencode/` の意味 | 典型例 |
|---------|------|------|---------------------|--------|
| `self-hosting` | AgentDevFlow 本体開発リポジトリ | 原本と配置先が同一リポジトリに存在 | 実行時配置先（ジャンクション → `src/opencode/`） | `agent-dev-flow` |
| `consumer-with-agentdev` | AgentDevFlow 導入製品リポジトリ | AgentDevFlow 提供 skill/command を利用 | プロジェクトローカルカスタマイズ入口 + AgentDevFlow 実行時位置 | 各種製品開発リポジトリ |
| `consumer-local` | 非 AgentDevFlow OpenCode プロジェクト | 独自 command/skill のみ | プロジェクトローカルカスタマイズ専用 | 実験的リポジトリ |
| `consumer-generated` | ローカル版 OpenCode 導入リポジトリ | ローカル版 OpenCode を導入する利用側リポジトリ | 生成された AgentDevFlow 実行時位置（非ジャンクション） | 個人利用環境のローカルリポジトリ |
| `plugin-future` | 将来の plugin/npm/package 配布形態 | 現在は未対応 | plugin が管理する実行時位置 | （将来） |

`consumer-generated` はローカル版 OpenCode 生成方式（REQ-0141, ADR-0126）により導入されるリポジトリ種別である。AgentDevFlow 本体リポジトリの `src/opencode/` と `src/opencode-local/` を入力とし、AI エージェントが変換して `.opencode/commands/` と `.opencode/skills/` に直接生成する。詳細は [ローカル版 OpenCode 生成](local-generation.md) を参照。

### リポジトリ種別判定基準

| 条件 | リポジトリ種別 |
|------|-----------|
| `src/opencode/` が存在し `.opencode/` がジャンクション | `self-hosting` |
| `.opencode/commands/agentdev/` または `.opencode/skills/agentdev-*/` が存在（ジャンクション・シンボリックリンク含む） | `consumer-with-agentdev` |
| `.opencode/commands/agentdev/` が実ディレクトリ（非ジャンクション）で `generated_by: local-opencode-transform` を含む | `consumer-generated` |
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
- `sync-opencode.ps1` が `commands/agentdev/` と `skills/agentdev-*/` を個別ジャンクションとして管理
- ジャンクション対象は `agentdev-*` グロブで動的列挙（ハードコードなし）
- `.gitignore` は `src/opencode/.gitignore` から実ファイルとしてコピー
- `.opencode/` 内の非管理ファイル（セッション、設定等）は opencode ランタイムが自由に配置可能

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

- プロジェクトローカル名前空間（`agentdev` 以外）を使用する（REQ-0103-056）
- 自由に `.opencode/` を管理

### Consumer（ローカル版生成）

```
.opencode/
  commands/agentdev/  → 生成されたローカル版コマンド（実ディレクトリ・非ジャンクション）
  skills/agentdev-*/  → 生成されたローカル版スキル（実ディレクトリ・非ジャンクション）
.agentdev/
  cases/              → ローカル Case ファイル（Issue / PR 相当の永続情報）
```

- 生成物は AgentDevFlow 本体リポジトリの `src/opencode/` と `src/opencode-local/` を入力とし、AI エージェントが変換して直接配置する（REQ-0141-007）
- 生成物には `generated_by: local-opencode-transform` 識別情報を持たせる（REQ-0141-011）
- `.opencode/` は `src/opencode/` 配下へ解決されてはならない（ジャンクション環境での生成停止、REQ-0141-010）
- 同名ファイル上書きは `generated_by` 識別子が一致する場合のみ許可される（REQ-0141-012, 013）
- 生成された `.opencode/commands/`, `.opencode/skills/`, `.opencode/` 配下ひな形はリポジトリ管理対象外（REQ-0141-008）
- `.agentdev/cases/` 配下のローカル Case ファイルはリポジトリ管理対象（REQ-0141-016）

### Plugin-future（将来）

現在は要件定義のみ。npm/package 配布時に `.opencode/` が plugin により管理される形態を想定。

## プロジェクトローカル命名規則（Project-Local Naming Rules）

Consumer プロジェクトで独自 command/skill を追加する際の命名規約（REQ-0103-063）。

### 予約名（Reserved Names）

| 名前 | 種別 | 使用可能リポジトリ種別 |
|------|------|-------------------|
| `agentdev` | コマンド名前空間 | `self-hosting`, `consumer-with-agentdev`, `consumer-generated` |
| `agentdev-*` | スキルプレフィックス | `self-hosting`, `consumer-with-agentdev`, `consumer-generated` |
| `.agentdev/` | ドメイン状態ディレクトリ | `self-hosting`, `consumer-with-agentdev`, `consumer-generated` |

### 命名規約

| 規則 | 説明 | 根拠 |
|------|------|------|
| 名前空間衝突回避 | `agentdev` / `agentdev-*` / `.agentdev/` 以外の名前を使用 | REQ-0103-056 |
| kebab-case | skill 名は小文字・数字・ハイフンのみ | REQ-0103-011 |
| 意味的命名 | プロジェクト名やドメイン名をプレフィックスに含めることを推奨 | 運用規約 |
| 独自ディレクトリ | 独自 skill は `.opencode/skills/{project}-*/` に配置 | 運用規約 |

### 衝突検出

`consumer-local` リポジトリで `agentdev` 名前空間が検出された場合、docs-check（IR-016）が NG として報告する。

## 導入方式ポリシー（Installation Method Policy）

| 方式 | 状態 | 推奨度 | 備考 |
|--------|--------|--------|------|
| Symlink / ジャンクション | 対応済み | **推奨** | 更新自動反映、原本単一管理 |
| Copy | 対応済み | 非推奨 | 手動更新必要、乖離リスク |
| Git submodule | 検討可能 | 実験的 | 複雑性増加 |
| Plugin / npm / package | 未対応 | 将来対応 | REQ-0103-064 |

### Symlink / ジャンクションの制約

| Platform | 方法 | 制約 |
|----------|------|------|
| Windows | ジャンクション (`mklink /J`) | 管理者権限不要、ディレクトリのみ対応 |
| Windows | Symlink (`mklink /D`) | 開発者モードまたは管理者権限が必要 |
| Unix | Symlink (`ln -s`) | 権限不要 |

### Copy の乖離検出

Copy ベース導入では AgentDevFlow 更新時に乖離（drift）が発生する。docs-check（IR-016）が乖離（divergence）を検出・報告する。

## リポジトリ種別別同期スクリプト範囲（Sync Script Scope）

`sync-opencode.ps1` の適用範囲（REQ-0103-065）。

| リポジトリ種別 | 同期対象 | 非対象 |
|-----------|----------|--------|
| `self-hosting` | `commands/agentdev/` + `skills/agentdev-*/` の選択的ジャンクション + `.gitignore` コピー | opencode 実行時ファイル（sessions, config 等） |
| `consumer-with-agentdev` | AgentDevFlow 提供ファイルのみ | プロジェクトローカルカスタマイズ |
| `consumer-local` | なし（適用対象外） | 全体 |
| `consumer-generated` | なし（適用対象外）。`src/opencode-local/` は生成時入力であり同期対象外 | 全体 |
| `plugin-future` | （将来定義） | - |

### 本体リポジトリでの同期モード

| Mode | 動作 |
|------|------|
| `apply` | `src/opencode/` → `.opencode/` の同期実行 |
| `check` | 乖離検出（終了コードで判定） |
| `dry-run` | 変更予測（実行なし） |

### Consumer での同期

Consumer では AgentDevFlow 本体から提供されるファイルのみを同期対象とする。プロジェクトローカルカスタマイズは同期の影響を受けない。

## 関連項目（See Also）

- [Consumer Project Setup Guide](../guides/consumer-project-setup.md)（Consumer 向け導入手順）
- [Artifact Contracts](artifact-contracts.md)（Command/Skill/Template/Script の責務境界）
- [ローカル版 OpenCode 生成](local-generation.md)（`consumer-generated` リポジトリ種別の生成フロー・安全ゲート）
- [ローカル Case ファイル](local-case-file.md)（`consumer-generated` リポジトリ種別の Case ファイルスキーマ）
- REQ-0103-061~065（リポジトリ種別 / `.opencode/` 意味 / 命名 / 導入 / 同期範囲の要件定義）
- REQ-0141（ローカル版 OpenCode 生成方式とローカル Case ファイル運用（`consumer-generated` リポジトリ種別））
- ADR-0126（ローカル版 OpenCode 生成基盤の source model 拡張と生成安全性制約）
