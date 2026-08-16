# Intake Item: 「詳細は〜参照」定型 ≤1 の機械検査化に必要な例外規則の明文化

## 発生源

- PR: #2186 (Issue #2181 / OU-003, Epic #2178 Wave 2)
- 発生 phase: case-run 実装
- capture 分類: intake（SPEC確定候補、backlog 化）

## 問題

「詳細は〜参照」定型 ≤1 を機械検査化する場合、(a) project extensions boilerplate 行4 が各コマンドの枠 1 回を消費すること、(b) agentdev-project-extensions SKILL.md の定義・許容マトリクス内の定型言及 4 件は定義であり例外とすること、が明文化されていないと検査が確定的にならない。

## 推奨対応

agentdev-command-authoring SPEC「command authoring 基準（層1〜3適用）」節へ (a)(b) の例外規則を明文化する。SPEC 本文の確定は backlog 化する。

## 関連

- Issue: #2181 (CLOSED), Epic: #2178
- PR: #2186 (SPEC確定候補 セクション 1)