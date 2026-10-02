# agentdev-guard-connection（Senpi guard 接続）

Senpi ホスト接続領域の guard 接続である。ホスト接続側は当該ホストの編集操作（write/edit/patch 等の対応編集）の意味論を本解釈レイヤで正準化し、guard の共通判定（`src/common/guards/`）へ接続する（マルチホスト正本モデル Design「guard 編集解釈の分離」節、共通正本とホスト接続領域の分離の決定）。

## 接続構造

| モジュール | 責務 |
|---|---|
| `lib/edit-interpretation.ts` | Senpi 編集操作の入力を編集意味論種別（full-replace / partial-replace / patch-apply）と意味論パラメータとして解釈し、共通判定が消費する中間表現へ正準化する。tool 名と編集意味論の対応は本解釈レイヤが単一所有する |
| `lib/command-write-interpreter.ts` | Senpi 生の書込み経路（コマンド実行系）の引数からコマンド文字列という意味論パラメータを解釈する |
| `lib/guard-connection.ts` | 解釈結果を共通判定（distribution-boundary 純関数評価器群・gh WRITE 迂回検出器）へ渡し、verdict を返す。強制適用（block なら `GuardBlockError` を throw）も提供する |

接続先の共通判定:

- `src/common/guards/distribution-boundary/`（純関数評価器群・GuardEnv・パス分類・再構成）
- `src/common/guards/gh-write/gh-command-detector.ts`（生 gh WRITE 迂回検出器）

本接続は OpenCode 接続領域（`src/opencode/plugins/`）を参照しない。両ホストは共通判定へ独立に接続する。

## 編集意味論の解釈集約の構造的保証

- 編集意味論は tool 名が決定する意味論種別が要求する意味論パラメータのみを消費する。入力キーの機械的な変更だけで別の編集意味論を同一と扱わない（例: write の `content` は partial-replace の意味論パラメータとして消費されない。partial-replace のパラメータだけを write に渡すと full-replace が要求する `content` が欠落するため検査不能になる）
- `path` / `filePath` は同一の対象パスパラメータの表記差であり、対象パスパラメータの解釈として正準化する（意味論の同一視ではない）
- 対応する編集意味論の解釈不能（不明 tool 名、必須パラメータの欠落・型不正）は検査不能として返し、呼出側は fail-closed で拒否する

## fail-closed

| 状態 | 挙動 |
|---|---|
| 編集解釈の検査不能 | block（副作用なし） |
| 共通判定の検査エラー（読取失敗、ルート外、不正 patch） | block。検査不能を成功扱いしない |
| 共通判定の違反検出 | block（副作用前の停止） |
| 共通判定・検出器の異常終了 | block |
| 生の書込み経路でコマンド文字列が検証不能 | block |

本接続は fs 書込みを含まない（副作用を持たない）。block 判定時のディスク副作用はゼロである。

## 適用範囲

配布用と ADF 自己ホスト用の guard 適用範囲は共通判定側が所有する detector 設定（`GuardEnv`、`DEFAULT_REPOSITORY_IDENTITY`）をそのまま消費し、本接続で緩和しない。

## テスト実行

```bash
bun test        # cwd: src/senpi/plugins/agentdev-guard-connection
```

テストスライス: TS-007（guard 編集操作）。write/edit/patch の対応編集と生の書込み経路のそれぞれで、拒否時の副作用 0 件、正常操作の誤拒否 0 件、検査不能の成功扱い 0 件を固定する。

## 実配備（Wave 3 の接続確定事項）

- Senpi ホストの plugin/hook 配線（`tool.execute.before` 相当のフックから本接続の enforce 関数を消費する形状）は Wave 3 の全組合せ試験（Epic #3316 の #3324）で確定する。本 package は配線に必要な接続契約（interpret / evaluate / enforce）を提供する
- textlint 品質判定（`src/opencode/plugins/agentdev-textlint-guard/` の共通基盤）は plugin package 内部に配置された検査基盤であり、共通正本（`src/common/guards/`）へ分離されていない。Senpi からの品質判定接続は検査基盤の共通正本化を前提とし、本 package の担当範囲外である（PR 本文の Design 確定候補を参照）
