# Intake Item: docs/specs/authoring/command-authoring-standards.md 未存在（spec-save partial 引継ぎ）

## 発生源

- PR: #1561 (Issue #1560 / AG-004, feature)
- 発生 phase: case-close capture 回収 (Step 10)
- capture 分類: intake (後続作業候補 = 別 Issue 検討推奨、5件目 OU-002 パターン)

## 問題

Issue #1560 の AG-004 は「docs/specs/authoring/command-authoring-standards.md に boilerplate 許容指針を整理する」を意图していた。しかし spec-save 実行時（ACT-SPEC-002）に対象 SPEC ファイル `docs/specs/authoring/command-authoring-standards.md` が未存在（ENOENT）のため、spec-save は partial 完了となり ACT-SPEC-002 を skip した。

現状の `docs/specs/authoring/` 配下には `command-file-format.md` のみ存在し、`command-authoring-standards.md` は存在しない。AG-004 は Issue #1560 において「Findings/intake item 化で達成（record-in-findings、5件目 OU-002 パターン）」として処理したため、boilerplate 許容指針の SPEC 整備は後続 case に引き継がれる。

## 推奨修正対象

別 Issue（後続 case）で以下のいずれかを採用（user 確認が必要）:

1. **(a) 新規 SPEC 作成**: `docs/specs/authoring/command-authoring-standards.md` を新規作成し、boilerplate 許容指針（公開契約宣言 4行上限、許容・違反判定基準、`agentdev-project-extensions` SKILL.md の判定マトリクスと整合する指針）を整理する
2. **(b) 既存 SPEC 統合**: 既存 `docs/specs/authoring/command-file-format.md` に boilerplate 許容指針セクションを統合する。command-file-format.md の現在のスコープ（コマンドファイルのフォーマット規約）との境界を調整のうえ追加
3. **(c) 別 SPEC 配下へ整理**: `docs/specs/responsibilities/artifact-responsibilities.md` の「重複許容基準（REQ-0147-001）適用例集」（commit 07ca4769 で新設済み）へ boilerplate 許容指針を統合し、authoring 配下には独立 SPEC を作成しない

推奨: (a)。boilerplate 許容指針は command authoring に密接に関係するため、`docs/specs/authoring/command-authoring-standards.md` として独立 SPEC を新設するのが最も自然。Issue #1560 の AG-004 が意図した対象 SPEC でもある。`command-file-format.md` はフォーマット規約、新 SPEC は boilerplate や authoring 指針と責務分離できる。

影響範囲（推奨 (a) 採用時）:
- `docs/specs/authoring/command-authoring-standards.md`（新規作成）
- `docs/specs/responsibilities/artifact-responsibilities.md`（適用例集セクションから新 SPEC を相互参照するか検討）
- `src/opencode/skills/agentdev-project-extensions/SKILL.md`（PR #1561 で明記した判定マトリクスが新 SPEC と整合するか確認）
- `docs/specs/authoring/command-file-format.md`（新 SPEC との境界確認、相互参照の整備）

昇格先候補: `docs/specs/authoring/` 配下の SPEC 拡張、または `agentdev-command-authoring` / `agentdev-skill-authoring` skill の参照先 SPEC 整備。

## 関連

- references: docs/specs/authoring/command-file-format.md（既存、統合候補 (b)）
- references: docs/specs/responsibilities/artifact-responsibilities.md（適用例集セクション、commit 07ca4769、AG-001/002/003 の spec-save 完了対象）
- references: src/opencode/skills/agentdev-project-extensions/SKILL.md（PR #1561 で明記した「公開契約宣言と詳細契約の分離」「boilerplate 重複検出時の判定マトリクス」）
- Issue: #1560 (CLOSED, AG-004 spec-save partial で Findings/intake item 化で達成)
- PR: #1561 (squash merge 896c79de068d0869338864c3d228c5627c217e93, Findings ### intake AG-004 引継ぎ)
- ADR/REQ: REQ-0147-001（重複許容基準）、REQ-0119-034（同一契約再定義抑止）
- 5件目 OU-002 パターン（PR #1554 Issue と同種: 実装修復不可能な AG は intake item 化で達成）
