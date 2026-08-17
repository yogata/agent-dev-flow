# candidate_limit サブスイートの暫定関係意味表 — TIM カタログ定義への置換契機

## 観測内容

candidate_limit サブスイートの暫定関係意味表（semantics.ts）は TIM 語彙カタログ実体（PR #2196）整備後に置換が必要。カタログ整備と高位問い合わせ実装本体（PR #2195、コンフリクト解消待ち当時）のマージ後に本回帰を再実行し、期待出力の差異を文書化する運用契機を README に明記済み。

## 影響

- 暫定意味表に基づく回帰結果がカタログ確定後の期待出力と乖離する可能性を内在する

## 課題

カタログ・実装間乖離解消後に、semantics.ts をカタログ定義へ置換して回帰を再実行する。差異文書は AG SPEC「高位問い合わせプロファイル」節への標準上限値決定手順明文化（2026-08-17-epic2189-spec-finalization-deferred.md）と併せて処理する。

## 既存要件・成果物との関連

- 対象: candidate_limit サブスイート（semantics.ts）
- 前提: TIM 語彙カタログ（PR #2196、merged f4240016）、PR #2195（Level 2 統合でマージ済み — 2026-08-17-epic2189-level2-integration-residual.md）
- 関連: 2026-08-17-epic2189-candidate-limit-standard-value.md（標準上限値確定、統合候補）
- 出典: Issue #2193 (CLOSED), Epic #2189、PR #2199 (merged da999aef)

## 出典

- 発生日: 2026-08-17
- 発生源: PR #2199 case-run 検証（Findings / Capture候補）
- 元 item: intake-2026-08-17-epic2189-candidate-limit-semantics-swap.md
