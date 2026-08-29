# agentdev-third-party（Custom Tool）

third-party Skill の取得を担う構造化された副作用操作の Custom Tool。外部取得操作の種別契約と取得機構の正は Decision `docs/decisions/` 配下の third-party Skill 取得機構 Decision、Custom Tool 種別契約は Design `docs/designs/responsibilities/custom-tool-contracts.md` を参照。

## 操作契約

操作は Design `docs/designs/responsibilities/custom-tool-contracts.md` の「third-party Skill 取得」操作契約に従う。

| 要素 | 内容 | 実装 |
|---|---|---|
| 入力 | 対象 Skill 名（省略時は全件）、dry-run 指定 | `contracts.ts`（TpRequest） |
| 出力 | 取得結果報告（対象一覧、取得成否、配置パス、管理外衝突の検出状況） | `contracts.ts`（AcquireReport） |
| 保証 | 取得結果の検証（読み戻し）後に成功を返す。取得開始前に存在した正常な配置を取得失敗時に破壊しない。機構管理外の既存配置を無断で上書きしない | `acquisition.ts`（staging → backup → 配置 → verifyPlacement） |
| 失敗 | 失敗を成功扱いとしない。部分取得状態を開始前状態へ解消し、失敗要因を報告する | `engine.ts`（fail-closed ゲート）+ 失敗時の対象別明細（report） |

## 取得プロファイル

正は Design `docs/designs/local/third-party-skill-management.md`。

- 単一 SKILL.md URL 型: `.opencode/skills/<name>/SKILL.md` へ正規化
- GitHub Skill ディレクトリ型: Skill ディレクトリ配下を再帰取得し相対構造を保持。Skill ディレクトリ外のファイルは取得しない

source URL 形式判定（blob / raw / tree 変種の扱い）、取得トランスポート（git 依存なしの HTTPS 取得、ZIP 展開チェックアウトの git-less 環境で動作）、管理対象 Skill の判別方法（provenance マーカーによる決定論的判定）は実装時に確定した（PR の `## Design確定候補` 参照）。

## 対象操作

`acquire`（side-effect、fail-closed）。`dryRun: true` で実行せず計画（対象一覧、配置先、管理外衝突検出）を返す。

## 非破壊と上書き保護

- staging 取得 → staging 検証（読み戻し一致）→ 既存管理対象配置の backup → 配置 → 読み戻し VERIFY → backup 削除。いずれかの段階が失敗した場合、開始前状態へ復元する
- 機構管理外の既存配置（provenance マーカー `.agentdev-third-party.json` を欠く同名配置）は上書きせず拒否する（`refused-unmanaged`、skip 成功ではない）
- 宣言の name に `agentdev-` / `repo-` 予約接頭辞が使われた場合は取得しない

## 登録構造と実装

- `index.ts` が Tool 名・公開契約・実行ゲートを単一の登録単位へ接続する
- `declaration.ts` が宣言ファイル（`src/third-party/skills.yaml`、配布成果物種別ではない宣言ファイル）を読む。解釈不能な宣言は取得を実行しない（fail-closed）
- `source-url.ts` が source URL 形式判定を、`transport.ts` が取得トランスポート境界（GitHub 実装）を所有する。テストは baseUrl を差し替えたローカル mock（`tests/mock-source.ts`）を使用する
- 登録 Plugin（`src/opencode/plugins/agentdev-third-party-tool/`）が custom tool `agentdev_third_party` を OpenCode の実行時へ登録する

## テスト実行

```bash
bun install && bun test   # cwd: src/opencode/tools/agentdev-third-party
```
