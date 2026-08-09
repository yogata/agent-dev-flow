# worktree 独立 working tree の構造的制約の明文化

## 背景

worktree-per-WP モデル（case-auto が各 WP ごとに独立 worktree を作成）を含む worktree 分割運用で、gitignore 対象ファイルの受け渡し不可（#4）と junction 依存 checker の skip（#5）が顕在化した。両者とも worktree が独立した working tree を持ち、親 worktree の untracked/gitignore/junction を引き継がないという構造的制約に起因する。

## 問題

- worktree-per-WP モデルで gitignore 対象ディレクトリ（`.omo/` 等）配下のファイルを後続 WP へ受け渡す場合、各 worktree は独立 working tree を持つため local-only の gitignore 対象ファイルは後続 WP の worktree から参照できず、`git add -f` で強制追加する必要が生じる（#4）
- Integrity Checker の `source-projection-sync` チェックは git worktree 環境で junction が再作成されないため「Skipped inside git worktree」となり、原本リポジトリの `src/opencode/` と配布先の接続整合性を検証できない（#5）

## 望ましい変更

worktree 環境の構造的制約を agentdev-git-worktree skill references へ明示し、運用上の判断基準を文書化する。

1. gitignore 対象ファイルの受け渡し判断基準（`!<path>` 例外追加、完了条件への反映明示、配置先変更のいずれかを選択する基準）（#4 由来）
2. junction 依存 checker の worktree skip 制約と、統合検証・最終検査はメインリポジトリで実施する運用の明示（#5 由来）

## 対象範囲

### 対象

- agentdev-git-worktree skill references（worktree 環境の構造的制約）
- repo-agentdev-integrity SPEC / check_integrity.ts（skip 時の警告レベル調整候補）
- 移行計画・運用ガイド（worktree-per-WP モデル固有の受け渡し判断基準）

### 対象外

- worktree-per-WP モデル自体の廃止・変更
- `.gitignore` のプロジェクト固有運用そのものの変更（プロジェクト固有事項）
- junction 再作成の実装（実装コスト要、別途検討）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | `src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md` | worktree 独立 working tree の構造的制約（gitignore 引き継ぎ不可、junction skip）と判断基準を明示。既存の isInsideWorktree 記述を補完 |
| spec | `docs/specs/local/repo-agentdev-integrity.md`（存在する場合）または check_integrity.ts 関連 SPEC | junction 依存 checker の worktree skip 制約と、メインリポジトリでの統合検証を明示 |
| spec | `docs/specs/skills/agentdev-workflow-lifecycle.md`（worktree-per-issue モデル注意点） | 大規模リファクタ・worktree 分割時の統合検証手順を補強 |

## 既存対策確認

- **確認結果**: 既存対策あり（部分）
- **該当ファイル**: `src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md` L83-94（junction 再作成不可と isInsideWorktree 判定の記述）
- **ギャップ分類**: fix gap（gitignore 引き継ぎ不可は未カバー）+ guardrail insufficiency（junction skip の運用対応が部分のみ）
- **ギャップ詳細**: worktree-operations.md は junction 再作成不可と isInsideWorktree 判定を記述するが、(a) gitignore 対象ファイルの受け渡し判断基準、(b) checker skip 時の警告レベル調整、(c) 統合検証はメインリポジトリで実施する運用、は未カバー

## 制約

- worktree-per-WP / worktree-per-issue 等の既存 worktree 分割モデルを維持すること
- `.gitignore` 運用はプロジェクト固有の判断要素があり、一律ルールを強制せず判断基準の提示にとどめること
- junction 再作成の実装（worktree でも再作成を試みる option）は実装コストを要するため本件では必須とせず候補扱いとすること

## 受け入れ条件

- [ ] worktree 独立 working tree の構造的制約（gitignore 引き継ぎ不可、junction skip）が skill references へ明示されていること
- [ ] gitignore 対象ファイル受け渡しの判断基準（3 選択肢）が提示されていること
- [ ] 統合検証・最終検査はメインリポジトリで実施する運用が明示されていること
- [ ] 既存の isInsideWorktree 記述と矛盾しないこと

## 元learning item / 根拠

- **要約**: worktree が独立 working tree を持つことに起因する gitignore 引き継ぎ不可と junction 依存 checker skip
- **根拠**:
  - #4: WP-0 case-run で `.omo/` が gitignore 対象のため `git add` で追跡できず `git add -f` で強制追加する必要を確認（PR #1932）。worktree は独立 working tree を持ち gitignore 対象は commit 経由でしか受け渡せない
  - #5: WP-0 case-run で `check_integrity.ts --json` の `source-projection-sync` が worktree 環境で「Skipped inside git worktree」となることを確認（PR #1932）。worktree では junction が再作成されないため
- **再発条件**: worktree-per-WP / worktree-per-issue モデルで gitignore 対象ディレクトリ配下のファイルを複数 worktree 間で共有する場合。または git worktree 環境で junction 依存 checker を実行する場合
- **横展開可能性**: worktree 分割モデル全般で発生し得る。git worktree を使う他プロジェクトでも発生する汎用的制約

## 推奨Issue分類

- **分類**: feature（skill/SPEC 補強）
- **推奨ラベル**: documentation, enhancement
- **関連Issue**: Epic #1924、Issue #1925（WP-0）、PR #1932、`.gitignore` L11、`.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts`
