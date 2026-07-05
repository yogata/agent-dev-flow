# src/opencode-local/ 配下の和文 em-dash 残存 16 件の查読是正

## 概要

Issue #1434（X-2 em-dash 本文横断是正）の case-close で回収した intake 候補。PR #1435 は配布物 `docs/**` および `src/opencode/skills/agentdev-*/**` を是正対象としたが、ローカル版専用配布物 `src/opencode-local/` はスコープ外として除外した。同配下に和文 em-dash（` — `）が 16 件残存しており、横断是正の完了を期に別途是正することを推奨する。

## 詳細

- PR #1435 の実装スコープは配布物（`docs/**` + `src/opencode/skills/agentdev-*/**`）に限定。`src/opencode-local/`（ローカル版専用、配布物ではない）は除外
- 残存 16 件の内訳: `src/opencode-local/README.md`（8件）、`src/opencode-local/case-file.md`（7件）、`src/opencode-local/retry.md`（1件）
- PR #1435 Findings / Capture候補 の intake セクション F-1 に記録済み
- 判定基準は `mechanical-replacement-rules.md` section 2（パターン A〜D）に準拠する前提

## 候補となる対応

優先度は低〜中（表記品質、機能的影響なし）。以下のいずれか:

1. **別 Issue で是正（推奨）**: `src/opencode-local/` 配下 16 件を対象とした docs_chore Issue を起票し、PR #1435 と同じ判定基準（`mechanical-replacement-rules.md` section 2）で查読是正を実施
2. **見送り**: ローカル版専用配布物は配布対象外のため、表記揺れを許容する

## 根拠

- 観測元: PR #1435 の case-close 実行（2026-07-05）
- 残存件数: 16 件 / 3 ファイル（`src/opencode-local/` 配下）
- 除外理由: ローカル版専用配布物（`src/opencode-local/`）は配布物ではないため Issue #1434 の実装スコープ外
- 関連: Issue #1434, PR #1435, RU-0022（intake 由来、PR #1122 follow-up）
- 関連 learning: `.agentdev/learning/inbox.md`「em-dash body 置換の文脈判定パターンと検出時の注意」
