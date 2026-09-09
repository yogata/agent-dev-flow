# intake: vendored engine bundle 再生成時のビルド環境依存パス無害化自己検査

- **発生源**: PR #2730（Issue #2725 / Epic #2723 W2）の Findings を回収
- **capture 元**: case-close Epic Wave 2（Epic #2723、delegation case-auto Wave2-close）
- **captured_at**: 2026-09-09

## 内容

vendored engine bundle（`src/opencode/plugins/agentdev-textlint-guard/vendor/textlint-engine.bundle.json`）の再生成では、kuromojin 既定 dicPath 用の `require.resolve` 由来の絶対パスがビルド環境依存で bundle 内に残る（実行時は `KUROMOJIN_DIC_PATH` 固定により使用されないため無害）。build スクリプトで当該パスを検出・除去または無害化する自己検査の追加を検討するとよい。

## 補足

- case-close Wave 2 の再検証では、焼き付きパスが指すビルド時 worktree の削除後に `bun test` が環境依存 fail する挙動を観測した（main と同一の現象、plugin runtime の KUROMOJIN_DIC_PATH 固定経路では不発生）
- 自己検査の要否（build 時検出 vs 受け入れ）は intake-promote の review で判定すること
