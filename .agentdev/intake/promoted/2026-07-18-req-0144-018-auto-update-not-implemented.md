# REQ-0144-018 自動更新仕組み（docs/guides/*.md）が未実装

## 観測内容

PR #1549 Findings / AG-002（case-run → case-close 回収、回収日時: 2026-07-18、case-close Step 10 Capture 回収）で検出。元 Issue: #1548（chore(docs): ガイドの REQ 範囲表記を現行（REQ-0162/53件）に修正）。原因分類: 機能不全（REQ 要件未実装）。

REQ-0144-018 は2つの要素要件から構成される。本 item は後者（自動更新仕組み）の未実装を扱う。

1. 検出ロジック（"docs-check の req-range 検出ロジックは docs/guides/*.md と vocabulary-registry.md に記載の時点REQ番号を動的に参照し、実REQ最大番号と照合。時点REQ番号が実REQ最大番号より古い場合、安定NGとして検出"）
   - 状態: 実装済み・機能中（本 Issue #1548 修正前後に check_integrity.ts が 1件→0件 で検出機能を稼働確認）。本 item 対象外。
2. 自動更新仕組み（"新規REQ確定時（req-save 完了後）に、docs/guides/*.md と vocabulary-registry.md の REQ 範囲表記を自動更新する仕組みを提供する"）
   - 状態: 未実装（本 item 対象）。

未実装の根拠（PR #1549 Findings）:

- `src/opencode/commands/agentdev/req-save.md` Step 1〜12 に `docs/guides/*.md` の REQ 範囲表記を更新するステップは存在しない。
- 同ガイドレール G02（ファイル操作制約）は req-save の編集スコープを `docs/requirements/**`, `docs/adr/**`, `docs/README.md`, `.agentdev/drafts/**` のみに制限し、`docs/guides/**` を明示的に除外している。
- Step 5「インデックス、ハブ更新」が更新対象とするのは `docs/requirements/README.md`, `docs/README.md`, `docs/DOC-MAP.md` のみで、ガイドの範囲・件数表記は含まない。
- REQ-0162 追加時にガイドが追従しなかった事実（Issue #1548）が、自動更新仕組み不在を裏付ける。

## 影響

新規 REQ が確定するたびにガイドの範囲表記が陳腐化し、`check_integrity.ts` が恒常 NG を検出する。手動修正（Issue #1548 等）が必要になる。発生頻度は新規 REQ 採番ごと。機能不全（REQ-0144-018 要件の未実装部分）。work_type=feature に分類される見込み。

## 課題

req-save 完了後に `docs/guides/*.md`（と `vocabulary-registry.md`）の REQ 範囲・件数表記を自動更新する仕組みを設計・実装する。

## 既存要件・仕様との関連

- REQ-0144-018（自動更新仕組み部分）: 当該要素要件が未実装。
- IR-018-req-range-notation-freshness（検出ルール）: 検出側は実装済みだが、自動更新側が不在のため検出 NG が恒常化する。
- ガイドレール G02（ファイル操作制約）: req-save の編集スコープが `docs/guides/**` を除外しており、自動更新実装には G02 の拡張が必要。
- 関係: REQ-0144-018 の要求と req-save 実装・G02 制約との間に実装ギャップ（未実装）。

## 対応方針の方向性

req-save 完了後のガイド REQ 範囲・件数表記自動更新仕組みの設計・実装。検討すべき設計選択:

- (a) req-save 既存 Step の拡張（Step 5 または新 Step 追加）。ガイドレール G02 の編集スコープ拡張を伴う。
- (b) req-save とは別工程（post-req-save フック等）での実装。
- (c) `check_integrity.ts` に自動修正モード（`--fix` 等相当）を追加する案（検出ロジックとの統合）。

副作用検討事項:

- 自動更新対象が「REQ 最大番号・件数」のみか、廃止 REQ リストの更新も含むか（Issue #1548 では「REQ 最大番号・件数」のみ手動修正し、廃止 REQ リストは現状維持とした）。
- `vocabulary-registry.md` の範囲表記形式が `docs/guides/*.md` と一致するかの事前確認。
- ADR 範囲表記も将来的に陳腐化する可能性の評価。

関連 item: 「project-docs-guide-req-range-stale」はガイド陳腐化の症状側（修正）、本 item は予防策側（仕組み）。
