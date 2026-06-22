# legacy-normative-marker: workflow-orchestration SKILL.md に (MUST) 表記が残存

## 経緯

OU-002 Wave 3 (#1021 / PR #1025) の横断検出過程で、`/repo/docs-check` の事前存在 NG findings に `legacy-normative-marker` カテゴリの違反が含まれていた。具体的には `src/opencode/skills/agentdev-workflow-orchestration/SKILL.md` L29 に「（MUST）」という RFC2119 由来の規範マーカーが残存している。本 Wave の constraint により未修正。PR #1025 Findings に列挙されたが、case-close での intake 化が漏れていたため、事後収集する。

## 影響

- REQ-0122 で RFC2119 完全廃止が決定済み（PR #743 で達成）だが、一部の skill ファイルに規範マーカー「（MUST）」「（SHOULD）」等が残存している可能性がある。
- 規範表現の権威源泉が REQ/ADR ではなく skill 本文に分散する。
- `/repo/docs-check` が継続して NG を報告し続ける。

## レビューで決めること

- `legacy-normative-marker` 違反の全箇所を特定し、REQ/ADR への参照または自然な日本語に書き直すか。
- 機械判定ルールの検出パターン（MUST/SHOULD/MAY 等の RFC2119 キーワード）を見直すか。

## 根拠

- PR #1025 Findings: https://github.com/yogata/agent-dev-flow/pull/1025
- 違反基準: REQ-0122 廃止（RFC2119 完全廃止）、REQ-0101-061（英語語句の自然な日本語化）
- 対象: `src/opencode/skills/agentdev-workflow-orchestration/SKILL.md` L29「（MUST）」他に類似箇所がある可能性
- 来源: OU-002 Wave 3 横断検出の事前存在 NG（本パイプライン由来ではない）
- 関連 Epic: OU-002 #1018 Wave 3
