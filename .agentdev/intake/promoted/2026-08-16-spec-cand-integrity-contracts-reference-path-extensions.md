# integrity-contracts SPEC への reference-path-existence 拡張の正規反映（SPEC確定候補）

## 観測内容

integrity-contracts.md「reference-path-existence 検出における backtick 囲みパスの扱い（REQ-010-020）」節は、PR #2152 で checkScriptTemplateReferencePaths に追加した拡張（ネストサブディレクトリ参照検出、skill references/*.md 走査、reference ファイルの文脈解決、CJK 句読点隣接の誤延長防止）を本文に反映していない。PR #2152 は AUTOGEN 登録機構（rules/IR-062 + generate_indexes.ts）のみ編集し、同節本文は docs/specs 直接編集の制約により手を付けていない。

## 影響

- 実装が先行し SPEC 文面が旧状態のため、検出契約の正典（SPEC）と実装の間に記述乖離が存在する

## 課題

spec-save 経由で同節へ拡張内容（4点）を正規反映する。実装側は PR #2152 で main 入り済み（merge commit 4bf264b7）。

## 既存要件・成果物との関連

- SPEC: integrity-contracts.md「reference-path-existence 検出における backtick 囲みパスの扱い（REQ-010-020）」節
- 実装: check_integrity.ts checkScriptTemplateReferencePaths（PR #2152、main 入り済み）

## 出典

- 発生日: 2026-08-16
- 発生源: PR #2152 (Issue #2141 / OU-007, Epic #2134 Wave 2) SPEC確定候補 セクション 1
- 元 item: intake-2026-08-16-spec-cand-integrity-contracts-reference-path-extensions.md
