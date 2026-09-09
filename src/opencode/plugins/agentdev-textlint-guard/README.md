# agentdev-textlint-guard（Plugin / Hook + 共通実行基盤 + 最終検査入口）

文章表層品質の共通 textlint 実行基盤と、2つの入口（pre-write Plugin、単独実行可能な最終検査）を提供する ADF 汎用 Plugin package。

- pre-write Plugin: OpenCode の `tool.execute.before` フックで `write` / `edit` / `apply_patch` の完成予定全文をメモリ上で再構成し、拒否対象の違反を含む内容をディスクへ反映させない（書込み後に戻す方式ではない）。複数ファイル操作は1件でも違反があれば全体を拒否する
- 最終検査（final gate）: `gate.ts` を単独実行し、標準対象と追加対象の全件を実ファイル全文で検査する。shell、外部 editor、生成処理による変更も検出する。docs-check に依存しない

## 仕組み（共通基盤）

Plugin と最終検査は同一の共通基盤（`lib/`）を呼び出す。プロジェクト解決、設定読込み、対象解決、規則構成、文章検査、結果整形がここにあり、同一全文・同一パス・同一設定・同一規則に対して両入口は同一の判定を返す。

| モジュール | 責務 |
|---|---|
| `lib/project.ts` | プロジェクト解決（`input.worktree` 第一候補、`input.directory`、`input.project.worktree` の代替候補。Plugin の配置場所をプロジェクトルートに使わない） |
| `lib/config.ts` | 設定読込みと検証（固定パス `.agentdev/config/plugins/agentdev-textlint-guard.yaml`、`version: 1` + `additional_targets` 文字列配列のみ。設定なしは標準対象だけの正常状態。hook ごとに mtime で変更検知し再起動なしに反映） |
| `lib/targets.ts` | 対象解決（標準対象 `docs/**` 配下の `.md` + 追加対象の加算。ルート外参照は拒否） |
| `lib/rules.ts` | 規則構成（プリセットのフラット化、規則ごとの severity、prh 既定辞書の接続） |
| `lib/engine-bundle.ts` | 配布前解決済み依存（vendored engine bundle）の読込み |
| `lib/inspect.ts` | 文章検査（両入口の共通判定点） |
| `lib/results.ts` | 結果整形（対象パス、行・列、rule ID、該当箇所、replacement / guidance、拒否と助言の区別） |
| `lib/reconstruct.ts` | 完成予定全文の再構成（write / edit / apply_patch の現行 OpenCode 入力形式に固定） |

## fail-closed（検査不能は拒否）

プロジェクトルートを解決できない、設定を解釈できない（対象外ファイルへの操作も含めて拒否）、tool 入力不正、再構成不能、必要ファイルの読込失敗、検査異常終了、ルート外パス — いずれも該当 tool 呼び出しを拒否する。最終検査では検査不能は不合格になる。

設定エラーの文言には原因と設定パスを含め、外部 editor 等による設定修復を案内する。設定ファイル自身の修復だけを許可する例外は設けない。

## 規則構成と severity

標準構成は `textlint-rule-preset-ja-technical-writing`、`@textlint-ja/textlint-rule-preset-ai-writing`、`textlint-rule-prh`（規則の版は `package.json` + `bun.lock` で固定）。

拒否対象（hard）は誤検出確認済みの決定的規則に限定する（意思決定記録の限定例外）。初期構成の hard は文字品質違反クラス（半角カナ、制御文字、NFD、ゼロ幅スペース）と prh（既定辞書は空のため初期強制語なし）のみ。文長・文体・弱い表現等のヒューリスティックな規則は助言対象（severity warning）とし、検査不合格の根拠にしない。規則ごとの導入証拠（7条件）は該当 Case の PR 本文が追跡先である。規則の option と severity の実測校正は別工程（corpus 校正段階）が所有する。

## 設定

対象プロジェクトの `.agentdev/config/plugins/agentdev-textlint-guard.yaml`:

```yaml
version: 1
additional_targets:
  - notes/**/*.md
```

追加対象はルート相対 glob として標準対象へ加算する（標準対象を無効化できない）。設定なしは標準対象だけの正常状態。

## 依存と配布（オフライン導入）

依存は配布前に解決した成果物として供給する。`vendor/textlint-engine.bundle.json` は `bun run build:engine`（`build/build-engine.ts`）が生成する、kernel・Markdown plugin・採用規則を単一 ESM に束ねた base64 エンベロープである。導入系スクリプト（install / self-sync / archive / release）はネットワーク取得を行わず、本 bundle が clone、ソース ZIP、archive、release archive、self-sync の全経路で追加操作なしに動作する（node_modules は不要）。

## 最終検査の実行

```bash
bun run .opencode/plugins/agentdev-textlint-guard/gate.ts --root <project-root>   # 導入先
bun run src/opencode/plugins/agentdev-textlint-guard/gate.ts --root .             # 本体
```

終了コード: `0` = 合格（拒否対象違反ゼロ）、`1` = 不合格（違反ありまたは検査不能）、`2` = 引数エラー。`--json` で構造化結果。

## テスト実行

```bash
bun test        # cwd: src/opencode/plugins/agentdev-textlint-guard
```

## 実行権限の所有者

本 Plugin は実行前の拒否・強制の実行機構であり、副作用の実行権限の所有者を変更しない。本 package は consumer 配布対象（Plugin / Hook 配布種別）であり、repo-local 除外リストへ登録しない。
