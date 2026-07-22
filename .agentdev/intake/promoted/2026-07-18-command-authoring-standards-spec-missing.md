# docs/specs/authoring/command-authoring-standards.md 未存在（spec-save partial 引継ぎ）

## 観測内容

Issue #1560（AG-004, feature）は `docs/specs/authoring/command-authoring-standards.md` に boilerplate 許容指針を整理することを意図していた。しかし spec-save 実行時（ACT-SPEC-002）に対象 SPEC ファイルが未存在（ENOENT）のため、spec-save は partial 完了となり ACT-SPEC-002 を skip した。発生源は PR #1561（squash merge 896c79de）の case-close capture 回収（Step 10）。

現状 `docs/specs/authoring/` 配下には `command-file-format.md` のみ存在し、`command-authoring-standards.md` は存在しない。AG-004 は Issue #1560 において「Findings/intake item 化で達成（record-in-findings、5件目 OU-002 パターン）」として処理したため、boilerplate 許容指針の SPEC 整備は後続 case に引き継がれた。

## 影響

boilerplate 許容指針が SPEC 化されず、command authoring における重複許容・違反判定の基準が不明確なまま運用される。重要性は中。`agentdev-project-extensions` SKILL.md が PR #1561 で明記した判定マトリクス（公開契約宣言と詳細契約の分離、boilerplate 重複検出時の判定）と、SPEC 側の指針が対になっていない状態が継続する。

## 課題

boilerplate 許容指針を格納する SPEC ファイルが不在であり、command authoring の判断基準が SKILL.md の判定マトリクスにのみ依存している。公開契約宣言（4行上限）、許容・違反判定基準を SPEC として明文化する必要がある。

## 既存要件・仕様との関連

- REQ-0147-001（重複許容基準）: boilerplate 許容指針の上位要件。新 SPEC は本要件の適用指針を具体化する。
- REQ-0119-034（同一契約再定義抑止）: 重複許容と矛盾しない指針整理が必要。
- `docs/specs/responsibilities/artifact-responsibilities.md`: commit 07ca4769 で「重複許容基準（REQ-0147-001）適用例集」セクションを新設済み。新 SPEC との相互参照調整が発生する。
- `src/opencode/skills/agentdev-project-extensions/SKILL.md`: PR #1561 で明記した判定マトリクスが新 SPEC と整合するか確認が必要。

## 対応方針の方向性

- (a) 新規 SPEC 作成（推奨）: `docs/specs/authoring/command-authoring-standards.md` を新規作成し、boilerplate 許容指針（公開契約宣言 4行上限、許容・違反判定基準、`agentdev-project-extensions` SKILL.md の判定マトリクスと整合する指針）を整理する。`command-file-format.md`（フォーマット規約）と新 SPEC（boilerplate・authoring 指針）で責務分離できる。Issue #1560 の AG-004 が意図した対象 SPEC でもある。
- (b) 既存 SPEC 統合: `command-file-format.md` に boilerplate 許容指針セクションを統合する。同ファイルの現在のスコープ（コマンドファイルのフォーマット規約）との境界を調整のうえ追加する。
- (c) 別 SPEC 配下へ整理: `artifact-responsibilities.md` の適用例集セクションへ統合し、authoring 配下には独立 SPEC を作成しない。

(a) 採用時の影響範囲: `command-authoring-standards.md`（新規作成）、`artifact-responsibilities.md`（相互参照検討）、`agentdev-project-extensions/SKILL.md`（整合性確認）、`command-file-format.md`（境界確認・相互参照整備）。
