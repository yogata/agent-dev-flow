# skill 文書整備残（merge 失敗パターン・SPEC rule・Intake 形式重複）

複数の Issue/PR で skill 文書の整備残が intake 候補として記録されているが、未回収のまま残っている。

**merge 失敗パターン**: `self-healing-and-errors.md`（skill配下）に merge 失敗パターンの記載がない。case-close Step 4 の squash merge リトライ・rebase workflow fallback が追加されたが、自己修復ガイドへの反映が漏れている。

**SPEC workflow status rule**: workflow status 追加禁止ルールが SPEC に未記載。guides には記載済みだが、SPEC（workflow-contracts.md, document-model.md）への状態モデル制約追記が親 agent の Step 10 で対応される予定だった。

**Intake Item 形式重複**: intake-capture と intake-from-github の Intake Item 形式が重複している。共通フォーマットを skill reference に切り出すことで更なる入口化が可能だが、該当 Issue のスコープ外とされていた。

## 根拠

- Issue #574: 運用改善: gh-cli・case-close・worktree信頼性向上（learning 4件）
  - 残課題「`self-healing-and-errors.md`（skill配下）に merge 失敗パターンの記載なし → 後続 intake 回収候補」
- PR #554: refactor(cmd): intake/learning command 入口化・状態モデル制約明記
  - 完了条件「workflow status 追加禁止ルールが SPEC に記載されている」が未チェック（guides 記載済み、SPEC 更新は親 agent 担当）
  - Findings「intake-capture と intake-from-github の Intake Item 形式が重複。共通フォーマットを skill reference に切り出すことで更なる入口化が可能だが、本Issueのスコープ外」
