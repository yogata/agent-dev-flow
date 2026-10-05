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
| `lib/rules.ts` | 規則構成（プリセットのフラット化、規則ごとの severity、prh 標準辞書とプロジェクト辞書の追加合成） |
| `lib/engine-bundle.ts` | 依存成果物（導入時に再生成した engine bundle と kuromoji 辞書）の読込み。vendor 欠落の検知時に依存生成手順の案内を含むエラーを返す |
| `lib/inspect.ts` | 文章検査（両入口の共通判定点） |
| `lib/results.ts` | 結果整形（対象パス、行・列、rule ID、該当箇所、replacement / guidance、拒否と助言の区別） |
| `lib/reconstruct.ts` | 完成予定全文の再構成（write / edit / apply_patch の現行 OpenCode 入力形式に固定） |
| `lib/terminology.ts` | プロジェクト固有用語の接続点（慣行パスの prh 辞書発見、標準構成への追加合成） |

## fail-closed（検査不能は拒否）

プロジェクトルートを解決できない、設定を解釈できない（対象外ファイルへの操作も含めて拒否）、tool 入力不正、再構成不能、必要ファイルの読込失敗、検査異常終了、ルート外パス — いずれも該当 tool 呼び出しを拒否する。最終検査では検査不能は不合格になる。

設定エラーの文言には原因と設定パスを含め、外部 editor 等による設定修復を案内する。設定ファイル自身の修復だけを許可する例外は設けない。

## 規則構成と severity

標準構成は `textlint-rule-preset-ja-technical-writing`、`@textlint-ja/textlint-rule-preset-ai-writing`、`textlint-rule-prh`（規則の版は `package.json` + `bun.lock` で固定）。

拒否対象（hard）は誤検出確認済みの決定的規則に限定する（意思決定記録の限定例外）。初期構成の hard は文字品質違反クラス（半角カナ、制御文字、NFD、ゼロ幅スペース）と prh（標準辞書 `rules/default-prh.yml` は既存の禁止表現区分から移管した完全一致検出語を登録）のみ。文長・文体・弱い表現等のヒューリスティックな規則は助言対象（severity warning）とし、検査不合格の根拠にしない。規則ごとの導入証拠（7条件）は該当 Case の PR 本文が追跡先である。規則の option と severity の実測校正は別工程（corpus 校正段階）が所有する。

## 設定

対象プロジェクトの `.agentdev/config/plugins/agentdev-textlint-guard.yaml`:

```yaml
version: 1
additional_targets:
  - notes/**/*.md
```

追加対象はルート相対 glob として標準対象へ加算する（標準対象を無効化できない）。設定なしは標準対象だけの正常状態。

プロジェクト固有用語は prh 形式の辞書として隣接慣行パス `.agentdev/config/plugins/agentdev-textlint-guard-prh.yml` から接続する。辞書は標準規則構成へ追加合成され、標準規則や標準対象を無効化しない。辞書の妥当性は prh 規則自身が検証し、読込み不能・型不正は検査不能として全書込み操作を拒否する（fail-closed）。

## 依存と配布（版固定情報配布・導入時解決）

依存は版固定情報（`package.json` と `bun.lock`）のみを配布し、導入時に利用者が依存成果物を生成する（`vendor/textlint-engine.bundle.json` と `vendor/kuromoji-dict/` は git 管理対象外・配布物非同梱）。依存の生成手順は plugin package 配下（導入形態ごとの実行場所は「導入時の依存生成手順」を参照）で次の順に実行する。

```bash
bun install && bun run build:engine
```

`bun run build:engine`（`build/build-engine.ts`）が kernel・Markdown plugin・採用規則を単一 ESM に束ねた base64 エンベロープ（`vendor/textlint-engine.bundle.json`）と kuromoji 辞書（`vendor/kuromoji-dict/`）を生成する。導入系スクリプト（install / self-sync / archive / release）はネットワーク取得を行わず、vendor 成果物（engine bundle と kuromoji 辞書の両方。部分生成状態を含む）の欠落を検知した場合に fail-closed で停止し上記手順を案内する。依存生成の完了後は空キャッシュ・ネットワーク遮断下でも追加操作なしに動作する（node_modules は不要）。third-party 成果物とライセンス種別はリポジトリルートの `THIRD-PARTY-NOTICES.md` が宣言する。

## 導入時の依存生成手順

| 導入形態 | 実行場所 |
|---|---|
| checkout 版 consumer 導入（`install.ps1`、`self-sync.ps1`） | `.agentdev-plugin/src/opencode/plugins/agentdev-textlint-guard/`（checkout 配下の plugin package） |
| release archive 導入（archive 版 `install.ps1`） | 導入先に配置された `.opencode/plugins/agentdev-textlint-guard/` |
| 本体リポジトリ（self-hosting） | `src/opencode/plugins/agentdev-textlint-guard/` |

## 最終検査の実行（用途別入口）

```bash
bun run .opencode/plugins/agentdev-textlint-guard/gate.ts --root <project-root>   # 導入先
bun run src/opencode/plugins/agentdev-textlint-guard/gate.ts --root .             # 本体
```

用途は正規契約から決定的に選択される。`--purpose` で工程側の契約上の用途を指定する（既定は通常最終検査）。LLM が毎回の検査範囲・目的・再利用可否を選択せず、結果の受理と進行判定は plugin 側の共通関数（`lib/runs.ts` の `resolveInspectionPurpose` / `acceptForProgress`）が一元実装する。

| 用途 | 意味 | 保存済み結果の再利用 |
|---|---|---|
| `final`（既定） | 通常最終検査。case-run / docs-check 等の docs 変更時検査 | 対象全件の列挙・全文取得と現在入力との照合を毎回行った上で、同一性が機械検証できた対象だけ規則実行を省略 |
| `independent` | 必須独立検査。QG-4 独立再検査等、正規契約上の独立要求が存在する実行 | 利用しない（対象全件の規則を実行する） |
| `display` | 結果表示。直近の実行結果を読み戻す | 検査を起動しない（進行判定には使えない） |

書込み前検査（pre-write）は plugin hook 内部で固定であり、CLI 用途には含まれない。

終了コード: `0` = 合格（拒否対象違反ゼロ、完了、開始終了時照合の一致）、`1` = 不合格（違反あり、検査不能、未完了〔照合の不一致を含む〕、または対象解決 0 件〔0 inspected。検査を実施していない無効実行を合格としない〕）、`2` = 引数エラー。`display` は検査を起動しないため常に `0`。`--json` で構造化結果（`run` フィールドに用途、対象範囲、対象状態、完了状態、合否、実規則実行数と再利用数を含む）。

## 保存済みファイル単位結果（実行時データ）

通常最終検査は正常に完了した合格・不合格の双方のファイル単位結果を `.agentdev/cache/agentdev-textlint-guard/` 配下に保存し、同一性が機械検証できた対象の規則実行を省略する。

- 同一性の構成要素: 本文（内容 SHA256）、パス、有効な規則と設定、実際のエンジンと依存成果物、標準・プロジェクト辞書、結果正規化の版。更新時刻とサイズのみで本文同一性を判定せず、条件を追跡できない場合は再利用せず実検査する
- 保存先はプロジェクト・worktree ごとに分離され、誤流用は同一性キーの不一致として検出される
- 異常終了・読込み失敗・タイムアウト・不完全出力は保存・再利用せず、保存結果の欠落・破損・保存失敗時は実検査へ戻る（実検査不能なら合格としない）
- 保存は再生成可能な内部データとして扱い、エントリ数上限を設ける。保存先は実行時データであり、配布・投影・同期の対象外である（`runtime-package-boundary.md`「repo-local Plugin の配布・投影契約」節）

## テスト実行

vendor 成果物（`vendor/textlint-engine.bundle.json`、`vendor/kuromoji-dict/`）が未生成の場合は、テスト実行の前置として plugin package 配下で `bun install && bun run build:engine` を実行する（`bun.lock` と `tests/engine-bundle.test.ts` の固定版リテラルで生成物の版を検証する）。

```bash
bun install && bun run build:engine   # 前置（vendor 成果物の生成）
bun test        # cwd: src/opencode/plugins/agentdev-textlint-guard
```

## 実行権限の所有者

本 Plugin は実行前の拒否・強制の実行機構であり、副作用の実行権限の所有者を変更しない。本 package は consumer 配布対象（Plugin / Hook 配布種別）であり、repo-local 除外リストへ登録しない。
