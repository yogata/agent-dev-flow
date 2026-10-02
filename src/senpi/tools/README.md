# src/senpi/tools/（Senpi 向け Tool 接続）

Custom Tool（`agentdev_gh`、`agentdev_jev`、`agentdev_third_party`）の Senpi（OmO Native v5）向け Tool 登録単位と変換を配置する領域である。操作契約・fail-closed ゲート・VERIFY（読み戻し照合）は共通 Tool engine（`src/common/tools/agentdev-{gh,jev,third-party}/`）が所有し、本領域は Tool 登録単位、引数（host 非依存公開スキーマの参照）、結果の直列化、実行 context の変換のみを担う。ホスト接続領域の配置契約はマルチホスト正本モデル Design（`docs/designs/foundations/multi-host-canonical-model.md`）を正とする。

## 配置内容

| パス | 内容 |
|---|---|
| `tool-registration.ts` | Senpi 向け Tool 登録単位の共通境界型（`SenpiToolContext`、`SenpiToolResult`、`SenpiToolDefinition`） |
| `agentdev-gh-tool/` | `agentdev_gh` の Senpi 登録単位。バックエンド選択（GitHub 実装、または Senpi 向け投影パスの Local 実装）と runner の単一構築 |
| `agentdev-jev-tool/` | `agentdev_jev` の Senpi 登録単位。provider の動的解決は Tool engine が担う |
| `agentdev-third-party-tool/` | `agentdev_third_party` の Senpi 登録単位。取得先（skillsRoot）を Senpi 向けに解決する |

## Tool 登録単位と変換

各 `registration.ts` は `SenpiToolDefinition`（name、description、args、execute）を返す。

- 引数の変換: `args.request` は host 非依存の公開スキーマ（`src/common/tools/agentdev-{gh,jev,third-party}/public-schema.ts`）を参照する。ホスト別にスキーマを複製しない
- 実行 context の変換: `SenpiToolContext.worktree`（実行ディレクトリ基点）から各 Tool engine が必要とする path・設定を解決する。OpenCode 向け接続が worktree を引き渡すのと同一の context 契約である
- 結果の変換: engine の構造化結果（成功/構造化失敗）を `SenpiToolResult`（title、output、metadata）へ直列化する。出力は JSON 文字列であり、engine の失敗分類を保持する

## バックエンド選択（単一選択）

`agentdev_gh` の Senpi 接続は、同じ Tool 名で GitHub バックエンドとローカルIssueバックエンドを同時有効化しない。既定は GitHub 実装（`runner-cli.ts`）であり、Senpi 向け投影パス（`.senpi/tools/agentdev-gh/runner-local.ts`）に Local 実装が存在する場合のみ、単一の runner として Local 実装へ差し替える。runner は初回構築時に単一バックエンドへ収束し、以後キャッシュを再利用する（テストで固定）。

## 拘束条件

- 本領域の `.ts` は `src/common/`（共通正本）と `node:` 組込みモジュールのみを参照し、他ホスト接続領域（`src/opencode/`）を参照しない（横断構造テストで固定）
- Tool engine 契約の変更を本領域で行わない。本領域は配線と変換のみを編集対象とする
- Senpi harness の extension 機構への物理登録（投影・ローダーシム相当の生成）は installer 投影と Wave 3 統合検証の対象であり、本領域は repo 内で検証可能な登録単位と変換を提供する

## テスト実行

```bash
bun test ./src/senpi/tools/   # cwd: repo root
```
