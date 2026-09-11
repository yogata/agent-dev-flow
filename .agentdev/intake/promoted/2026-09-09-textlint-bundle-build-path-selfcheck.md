# vendored engine bundle 再生成時のビルド環境依存パス無害化自己検査

## 観測内容

- 発生源: PR 2730（Issue 2725 / Epic 2723 W2）の Findings を回収
- capture 元: case-close Epic Wave 2（Epic 2723、delegation case-auto Wave2-close）
- captured_at: 2026-09-09

vendored engine bundle（`src/opencode/plugins/agentdev-textlint-guard/vendor/textlint-engine.bundle.json`）の再生成では、kuromojin 既定 dicPath 用の `require.resolve` 由来の絶対パスがビルド環境依存で bundle 内に焼き付く。実行時は plugin runtime の `KUROMOJIN_DIC_PATH` 固定経路で使用されないため無害である。

追加観察（case-close Wave 2 再検証）: 焼き付きパスが指すビルド時 worktree の削除後に `bun test` が環境依存 fail する挙動を観測（main と同一現象、KUROMOJIN_DIC_PATH 固定経路では不発生）。

## 影響・課題

- runtime 動作への実害はない一方、bundle 再生成後の環境で `bun test` が fail し得る（ビルド時 worktree パスが消えている場合）
- 焼き付きパスの検出手段がなく、再現時に調査コストが発生する

## 後続判断に残る選択肢

- build スクリプトに焼き付きパス検出・除去または無害化の自己検査を追加する
- 現行のまま受け入れとする（実害なし、再現時は bundle 再生成で解消）

## 既存要件・契約との関連

- REQ-053（文書と配布物の文章品質契約）
- docs/designs/quality/textlint-quality-runtime.md（textlint 品質基盤）
