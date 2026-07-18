# verification-only PR（実装差分なし）の squash merge と case-close files_checked 空の取り扱い明文化

## 背景

Epic #1515 Wave 2 の PR #1527（Issue #1521 / OU-006）は verification-only でファイル変更0件。GitHub は空 PR の squash merge を許容し空 commit を生成するが、case-close Step 3-1 targeted docs guard で files_checked が空になる際の正当性確認手順（REQ Phase 3）が command SPEC に未明文化だった。verification-only case-run（実装差分なし、検証のみ）の成果物である空 PR の取り扱い（merge 可否、files_checked 空の確認手順、false-clean 3層防御との相互作用）が文書化されていなかった。

## 問題

1. verification-only case-run の成果物である空 PR の取り扱い（squash merge 可否、空 commit 許容）が command SPEC に未明文化。
2. case-close Step 3-1 targeted docs guard で files_checked が空になる際の正当性確認手順（REQ Phase 3 item 1-4）が、verification-only PR のケースに特化して明記されていない。
3. false-clean 3層防御（REQ-0158、本 Epic OU-005 で実装）との相互作用が文書化されていない。

## 望ましい変更

case-run SPEC に verification-only PR の取り扱い（空 commit 許容、case-close への引継ぎ）を明文化する。case-close Step 3-1 に verification-only PR の確認手順を明記する。false-clean 3層防御（REQ-0158）との相互作用も REQ-0158 SPEC または関連 SPEC に文書化する。

## 対象範囲

### 対象

- `docs/specs/commands/case-run.md`（verification-only セクション新設）
- `docs/specs/commands/case-close.md`（Step 3-1 に verification-only PR 確認手順）
- `docs/requirements/REQ-0158.md`（false-clean 3層防御と verification-only の相互作用）

### 対象外

- check_changed_docs.ts の files_checked 空時の verification-only フラグ考慮（別成果物 `check-changed-docs-files-delimiter.md` または別 Issue で扱う）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| spec | docs/specs/commands/case-run.md | verification-only PR の取り扱い（空 commit 許容、case-close 引継ぎ）セクション新設 |
| spec | docs/specs/commands/case-close.md | Step 3-1 に verification-only PR の files_checked 空確認手順を明記 |
| req | docs/requirements/REQ-0158.md | false-clean 3層防御と verification-only PR の相互作用を追記 |

## 既存対策確認

- **確認結果**: なし（SPEC に未明文化）
- **該当ファイル**: なし（docs/specs/commands/case-run.md、case-close.md に verification-only セクションなし）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: verification-only case-run の取り扱いが command SPEC 全体で未明文化。case-close Step 3-1 の REQ Phase 3 item 1-4 は files_checked 空の一般手順だが、verification-only PR の境界ケースに特化した記述がない。

## 制約

- GitHub が空 PR の squash merge を許容すること（commit 2b34f8b0 生成で実証）を前提とする。
- false-clean 3層防御（REQ-0158）との相互作用は、REQ-0158 SPEC または関連 SPEC に整理する。重複定義は避ける。
- verification-only PR は「実装差分なし、検証のみ」を明確に定義し、部分実装 PR と区別する。

## 受け入れ条件

- [ ] docs/specs/commands/case-run.md に verification-only PR の取り扱い（空 commit 許容、case-close 引継ぎ）が明文化されている
- [ ] docs/specs/commands/case-close.md Step 3-1 に verification-only PR の files_checked 空確認手順が明記されている
- [ ] docs/requirements/REQ-0158.md（または関連 SPEC）に false-clean 3層防御と verification-only の相互作用が文書化されている

## 元learning item / 根拠

- **要約**: verification-only case-run で生成される空 PR の取り扱い（squash merge、files_checked 空）が command SPEC に未明文化で、case-close QG-4 判定時に都度確認が必要。
- **根拠**: inbox#3 (Epic #1515 Wave 2, PR #1527, Issue #1521/OU-006): verification-only PR でファイル変更0件、squash merge 受入済み（commit 2b34f8b0）、Step 3-1 REQ item 1-4 で files_checked 空の理由を特定し正当判断、QG-4 PASS
- **再発条件**: case-run が verification-only（実装差分なし）で PR を作成し、case-close が targeted docs guard を実行する場合
- **横展開可能性**: REQ/SPEC の受け入れ基準が既存 repo 状態で満たされている場合（req-save/spec-save 完了済みで case-run が検証のみ）に発生し得る

## 推奨Issue分類

- **分類**: feature（command SPEC の境界ケース明文化）
- **推奨ラベル**: enhancement, documentation
- **関連Issue**: Issue #1521, PR #1527, Epic #1515 Wave 2, REQ-0158 false-clean 3層防御（本 Epic OU-005）
