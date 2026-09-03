# gh-cli ローカル版 references のパス表記と実体パスの不一致（確認記録）

## 観測内容

Issue #2382 対象範囲 (c) のパス表記 `src/opencode/skills/agentdev-gh-cli/references/local-*.md` は、実体のローカル版 references ディレクトリ `src/opencode-local/agentdev-gh-cli/references/` を指す（`src/opencode/skills/agentdev-gh-cli/references/` に local-*.md は存在しない）。Issue 本文の対象範囲表記と実体配置のずれが確認された（実装は実体パス側へ正しく適用済み）。

実装・検証は完了しており、修正を要するのは Issue 本文の記載（既にクローズ済み）と、将来の Issue 対象範囲表記の様式のみ。

## 影響

将来のローカル版 references を対象とする Issue・RU で、パス表記から実体を誤認する可能性。

## 課題（レビューで決めること）

- 対象範囲表記の正規形（src/opencode-local 配下であることを明示する様式）を workflow-templates の Issue テンプレート側に持つか、case-open の対象範囲生成でパス実在性を確認するか

## 既存要件・契約との関連

- workflow-templates（Issue テンプレートの対象範囲記載様式）、case-open の対象範囲生成、src/opencode-local ローカル版配置（runtime-package-boundary Design の link mode / ローカル版モデル）。

## 根拠

- PR #2393 本文「Findings / Capture候補」（回収元: https://github.com/yogata/agent-dev-flow/pull/2393 ）
