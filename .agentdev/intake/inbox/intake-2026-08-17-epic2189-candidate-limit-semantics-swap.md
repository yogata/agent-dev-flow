# Intake Item: candidate_limit サブスイートの暫定関係意味表 — TIM カタログ定義への置換契機

## 発生源

- PR: #2199 (Issue #2193 / OU-0004, Epic #2189 Wave 1)
- 発生 phase: case-run 検証（Findings / Capture候補）
- capture 分類: intake（要件運用候補）

## 問題

candidate_limit サブスイートの暫定関係意味表（semantics.ts）は TIM 語彙カタログ実体（PR #2196）整備後に置換が必要。カタログ整備と高位問い合わせ実装本体（PR #2195、コンフリクト解消待ち）のマージ後に本回帰を再実行し、期待出力の差異を文書化する運用契機を README に明記済み。

## 推奨対応

PR #2195 のコンフリクト解消（case-auto Level 2/3）とカタログ・実装間乖離解消後に、semantics.ts をカタログ定義へ置換して回帰を再実行する。差異文書は AG SPEC「高位問い合わせプロファイル」節への標準上限値決定手順明文化（intake-2026-08-17-epic2189-spec-finalization-deferred.md）と併せて処理する。

## 関連

- Issue: #2193 (CLOSED), Epic: #2189
- PR: #2199 (merged da999aef), #2195 (OPEN/CONFLICTING), #2196 (merged f4240016)
