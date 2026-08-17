# 「詳細は〜参照」定型 ≤1 の機械検査化に必要な例外規則の明文化

## 観測内容

「詳細は〜参照」定型 ≤1 を機械検査化する場合、(a) project extensions boilerplate 行4 が各コマンドの枠 1 回を消費すること、(b) agentdev-project-extensions SKILL.md の定義・許容マトリクス内の定型言及 4 件は定義であり例外とすること、が明文化されていないと検査が確定的にならない。

## 影響

- 機械検査化 without 例外規則は、boilerplate・定義言及を違反として誤検出する

## 課題

agentdev-command-authoring SPEC「command authoring 基準（層1〜3適用）」節へ (a)(b) の例外規則を明文化する。

## 既存要件・成果物との関連

- SPEC: agentdev-command-authoring「command authoring 基準（層1〜3適用）」節
- 実績: PR #2186（運用適用）

## 出典

- 発生日: 2026-08-16
- 発生源: PR #2186 (Issue #2181 / OU-003, Epic #2178 Wave 2) SPEC確定候補 セクション 1
- 元 item: intake-2026-08-16-spec-cand-detail-pointer-formula-machine-check.md
