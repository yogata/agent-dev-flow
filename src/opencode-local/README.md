# ローカル版 OpenCode 固有原本領域

> **非正規文書**: 本ディレクトリは AgentDevFlow 本体リポジトリの `docs/`（リポジトリ内部設計文書）ではなく、ローカル版 OpenCode の link 元となるローカル版固有原本を保持する領域である（ADR-0131）。要件は `docs/requirements/REQ-0141.md`、仕様は `docs/specs/local/*.md` を正とする。

## 目的

GitHub Issue / PR を使わない個人利用環境（ローカル版 OpenCode）向けに、ローカル版固有原本（agentdev-gh-cli）を保持し、link mode での導入手順を記載する（REQ-0141-003, 004, 031, ADR-0131）。
ローカル版の command / skill / ひな形は配置しない。
link mode では `src/opencode/` の原本をそのまま接続するため、ローカル版専用の生成物は不要である（ADR-0131 decision #1, #3）。

## リポジトリ構成（前提）

ローカル版 link mode 導入は以下の 2 リポジトリ構成を前提とする（REQ-0141-002, 006）。

| リポジトリ | 役割 | 主な対象パス |
|---|---|---|
| 仕様管理リポジトリ（AgentDevFlow 本体） | link 元の原本を保持 | `src/opencode/`, `src/opencode-local/agentdev-gh-cli/` |
| 導入先リポジトリ | ローカル版を導入する利用側リポジトリ。`.opencode/` に link を張る | `.opencode/commands/`, `.opencode/skills/`, `.agentdev/cases/` |

ローカル版導入の実体は AgentDevFlow 本体リポジトリでは行わない（REQ-0141-006）。

## ディレクトリ構成

```text
src/opencode-local/
├── README.md              ← 本ファイル（ローカル版 link 設定手順）
├── agentdev-gh-cli/       ← ローカル版 agentdev-gh-cli の原本（case-schema を吸収）
│   ├── SKILL.md           ← ローカル版 agentdev-gh-cli のルーティング入口
│   ├── references/        ← 操作契約・Case ファイル対応手続き・VERIFY 観点
│   └── case-schema/       ← Case ファイルの操作用定義（正本は docs/specs/local/local-case-file.md）
│       ├── case-file.md   ← スキーマ定義（YAML 前書き・status enum・labels・headings・採番）
│       └── rules/
│           ├── frontmatter.yaml   ← YAML 前書きスキーマの機械可読定義
│           ├── status.yaml        ← status enum と状態遷移表の機械可読定義
│           ├── labels.yaml        ← labels 値域の機械可読定義
│           └── headings.yaml      ← 見出し一覧の機械可読定義
```

link mode への移行に伴い、`transform/` と `generation-flow.md` は現行構成から除去済みである（AG-002, ADR-0131 decision #4, REQ-0141-028）。
link mode では原本がそのまま接続されるため、旧変換資産による意味変換は不要である。

### 作成しないディレクトリ（REQ-0141-005）

以下は作成しない。
`requirements/` と `specs/` は `docs/` 配下の同名ディレクトリと概念衝突するため不採用である。

- `src/opencode-local/_conv/`
- `src/opencode-local/commands/`
- `src/opencode-local/skills/`
- `src/opencode-local/requirements/`
- `src/opencode-local/specs/`

## link 設定手順

ローカル版 link mode 導入の全体フローを定義する（REQ-0141-007, 032, ADR-0131 decision #1, #2, #3）。
決定的な変換ロジックを実装した変換スクリプトは使用しない（REQ-0141-032）。

### 前提

- 導入先リポジトリが AgentDevFlow 本体リポジトリでないこと（REQ-0141-006）
- 仕様管理リポジトリ（AgentDevFlow 本体）の `src/opencode/` と `src/opencode-local/agentdev-gh-cli/` にアクセスできること
- 導入先リポジトリに `.opencode/` ディレクトリが存在すること（または作成可能であること）
- GitHub 版とローカル版を同じ `.opencode/` に同居させないこと（REQ-0141-015）

### 手順

1. **実行環境の特定**: 導入先リポジトリが AgentDevFlow 本体リポジトリでないことを確認する

2. **link target の確認**: 後述の「link target 確認」を実施し、意図した link target がすべて揃っていることを確認する

3. **通常版 link の設定**: `.opencode/commands/agentdev/` と `.opencode/skills/agentdev-*/`（agentdev-gh-cli を除く）を `src/opencode/` 配下へ接続する（ADR-0131 decision #2）

4. **agentdev-gh-cli の差し替え**: `.opencode/skills/agentdev-gh-cli/` だけを `src/opencode-local/agentdev-gh-cli/` へ接続する（ADR-0131 decision #3）

5. **link 設定の検証**: 各 link が意図した target へ解決されることを確認する

link mode では原本がそのまま接続されるため、旧変換資産の実行やひな形の意味変換は不要である（ADR-0131 decision #4）。

### link target 確認

link 設定前に `.opencode/` 配下の各 path が意図した link target へ解決されることを確認する（REQ-0141-010, AG-012, ADR-0131 decision #6）。
ジャンクションやシンボリックリンク環境での誤接続を防止するためである。

| 対象 | 期待される link target |
|---|---|
| `.opencode/commands/agentdev/` | `src/opencode/commands/agentdev/` |
| `.opencode/skills/agentdev-*`（agentdev-gh-cli 以外） | `src/opencode/skills/agentdev-*/` |
| `.opencode/skills/agentdev-gh-cli/` | `src/opencode-local/agentdev-gh-cli/` |

link target 確認は決定的な検査として実施する（ADR-0107, ADR-0131 decision #6）。
AI エージェントの解釈に依存せず、ファイルシステムの実パス解決により機械的に判定する。

意図した link target 以外へ解決される場合、link 設定を開始せずに停止する。
ユーザーへ link 構成の修正を促すメッセージを出す。
link mode 全体を一律停止するのではなく、link target が意図したものであれば許可する（AG-012）。

## 更新運用（unlink / relink）

ローカル版の高頻度更新は想定しない。
更新時は `.opencode/commands/agentdev/` と `.opencode/skills/agentdev-*/` を unlink してから relink する（REQ-0141-033, ADR-0131 decision #4）。
差分更新は想定しない。

全削除による一括再構築は行わない。
link の張り直しで済むため、`generated_by` 識別子による保護機構は廃止した（ADR-0131 decision #5）。
link による接続であるため、上書き問題が発生しない。

### 更新手順

1. 導入先リポジトリの `.opencode/commands/agentdev/` の link を unlink（削除）する
2. 導入先リポジトリの `.opencode/skills/agentdev-*/` の link を unlink（削除）する
3. 「link 設定手順」に従い、再度 link 設定を実行する（relink）

## ガードレール

ローカル版 link mode 導入が遵守するガードレール（REQ-0141-014, AG-009, AG-010, ADR-0131）。

- `src/opencode/` を変更しないこと（REQ-0141-014）
- `src/opencode-local/` を変更しないこと
- link 設定の結果を `src/opencode-local/` 配下へ出力しないこと
- AgentDevFlow 本体リポジトリでローカル版 link 設定を実行しないこと（REQ-0141-006）
- link target が意図した target 以外へ解決される場合は link 設定を停止すること（REQ-0141-010, AG-012）
- `.opencode/commands/agentdev/` と `.opencode/skills/agentdev-*/`（agentdev-gh-cli 以外）を `src/opencode/` 配下へ接続すること（ADR-0131 decision #2）
- `.opencode/skills/agentdev-gh-cli/` だけを `src/opencode-local/agentdev-gh-cli/` へ接続すること（ADR-0131 decision #3）
- `runtime-overrides/` を設けないこと
- バックエンド抽象化を導入しないこと（REQ-0141-027）
- GitHub 互換ローカルサーバを前提にしないこと（REQ-0141-027）
- GitHub Issue 作成、PR 作成、PR 取り込み、Issue クローズおよび `gh issue` / `gh pr` をローカル版の必須操作にしないこと（REQ-0141-026）

## リポジトリ管理対象

- **管理対象外**: link により接続された `.opencode/commands/agentdev/` と `.opencode/skills/agentdev-*/`（agentdev-gh-cli を含む）。導入先リポジトリの `.gitignore` で除外することを推奨する（REQ-0141-008, ADR-0131 decision #1）
- **管理対象**: `.agentdev/cases/` 配下の Case ファイル（REQ-0141-016）

## 関連項目

- [Case ファイルスキーマ定義](agentdev-gh-cli/case-schema/case-file.md)：ローカル Case ファイルの構造
- [ローカル版 agentdev-gh-cli ルーティング入口](agentdev-gh-cli/SKILL.md)：ローカル版 agentdev-gh-cli の手続き一覧
- `docs/requirements/REQ-0141.md`：ローカル版 OpenCode 導入方式とローカル Case ファイル運用の要件定義（正本）
- `docs/specs/local/local-generation.md`：link mode 接続フロー、link target 確認、更新運用の正本 SPEC
- `docs/specs/local/local-case-file.md`：Case ファイルスキーマの正本 SPEC
- `docs/specs/local/runtime-package-boundary.md`：`consumer_generated` リポジトリ種別、`.opencode/` 構成
- `docs/adr/ADR-0131.md`：ローカル版導入方式を link mode へ統一し生成方式を廃止（ADR-0126 を supersede）
- `docs/adr/ADR-0126.md`：ローカル版 OpenCode 生成基盤（superseded by ADR-0131、歴史参照）
