# worktree 環境の運用落とし穴標準化（junction・git mv・pull block）

## 背景

AgentDevFlow は worktree を用いた並列・隔離作業を前提とするが、worktree 環境特有の運用落とし穴が複数回にわたり再発している。2026-06-22〜2026-06-24 の PR #1036, #1099, #1128 で、(1) junction 非伝播による整合性検査の偽陽性、(2) junction 断絶による標準版スキル参照の失敗、(3) git mv の実行形式による成否差異、(4) 共有 main worktree で case-close Step 9 が並列セッションの未コミット変更でブロックされる、の4問題が顕在化した。いずれも `agentdev-git-worktree` に運用ガイドとして明文化されておらず、個別対応都度の判断コストが発生している。

## 問題

worktree 環境で以下4問題が再発するたびに、実装担当者が個別に原因調査と対応を行う非効率が生じている。

1. **junction 非伝播による偽陽性**: worktree 内で `.opencode/skills/` の junction が再作成されないため、junction 依存の整合性検査（source-projection-sync 等）が偽陽性を出す。L-003 では偽陽性27件が発生した。
2. **標準版スキル参照の断絶**: junction が切れた環境で `.opencode/` 経由の参照が失敗し、`src/opencode/` の直接参照が必要になる判断が都度発生する。
3. **git mv の実行形式差異**: Windows + worktree 環境で `git -C <worktree> mv <src> <dst>` が `fatal: renaming ... failed` で失敗し、`workdir` 指定 + 平置き `git mv` が成功する挙動差の理由が未記載。
4. **case-close Step 9 の pull ブロック**: 共有 main worktree で Step 1-1（重複ファイルチェック）が開始時点のスナップショット検査のため、Step 9 実行までの間に並列セッションが加えた未コミット変更を検知できず、pull --ff-only が拒否される。

## 望ましい変更

`agentdev-git-worktree` の references に worktree 環境固有の運用ガイドラインを標準化し、`case-close` の Step 9 手順を強化する。

1. **worktree 標準運用ガイドの追加**: worktree 環境では SoT パス（`src/opencode/`）を直接参照する運用、`isInsideWorktree` ヘルパー（`.git` が file かで判定）の junction 依存検査への適用を標準運用として明記。
2. **`isInsideWorktree` 適用範囲拡張候補の明示**: checkSourceProjectionConsistency 以外の junction 依存検査（`.opencode/commands/agentdev/` 系等）への適用拡張候補を評価対象として明記。
3. **git mv workdir フォールバック手順の追記**: ディレクトリ移動を伴う git mv では workdir 指定を優先し、`git -C` 失敗時のフォールバックとして workdir + 平置き `git mv` を試す手順を追記。
4. **case-close Step 9 の Step 1-1 再実行**: pull --ff-only 実行直前に重複ファイルチェック（Step 1-1 相当）を再実行し、並列セッション由来の未コミット変更を検知する。pull 失敗時の並列セッション安全なフォールバック手順（非所有パスへのスイープ操作回避）を標準化。

## 対象範囲

### 対象

- `src/opencode/skills/agentdev-git-worktree/references/git-common-procedures.md`（pull 手順・重複チェック・フォールバック）
- `src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md`（worktree 標準運用ガイド）
- `src/opencode/commands/agentdev/case-close.md` Step 9（実行前同期の強化）

### 対象外

- `isInsideWorktree` ヘルパー自体の実装（check_integrity.ts 内、L-003 で実装済み）
- post-merge ステップ（9-11）の worktree 隔離設計変更（別途アーキテクチャ検討が必要、本成果物では「検討候補」として記録のみ）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | `src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md` | worktree 標準運用ガイド（src/opencode/ 直接参照・isInsideWorktree 適用）の新規セクション追加 |
| skill | `src/opencode/skills/agentdev-git-worktree/references/git-common-procedures.md` | git mv workdir フォールバック手順の追記、pull 失敗時フォールバックの並列セッション安全化 |
| command | `src/opencode/commands/agentdev/case-close.md` | Step 9 に Step 1-1 再実行手順の追加 |

## 既存対策確認

- **確認結果**: あり（部分的）
- **該当ファイル**: `src/opencode/skills/agentdev-git-worktree/references/git-common-procedures.md` Section 1（pull --ff-only）、Section 3（重複ファイルチェック L166-167, L205）、worktree-operations.md
- **ギャップ分類**: fix gap + guardrail insufficiency
- **ギャップ詳細**: pull 手順と重複チェックは既存だが、(a) Step 1-1 の Step 9 直前再実行が未規定、(b) git mv workdir フォールバック手順の未記載、(c) worktree 標準運用ガイド（src/opencode/ 直接参照・isInsideWorktree 適用範囲）の未明文化。`isInsideWorktree` ヘルパーは checkSourceProjectionConsistency に適用済みだが運用指針としての標準化が不十分。

## 制約

- `isInsideWorktree` ヘルパーの適用範囲拡張は「評価候補」とし、全 junction 依存検査への一括適用は個別検証を前提とする（偽陰性リスク）。
- case-close Step 9 の Step 1-1 再実行は、マージ後の最新状態での重複チェックを意図し、非所有パスへのスイープ操作（`git checkout`/`git stash`/`git reset --hard` 等）は回避する（並列実行安全ステージングプロシージャ準拠）。
- post-merge ステップ（9-11）の worktree 隔離は破壊的設計変更のため本成果物の対象外とし、別途検討候補として記録する。

## 受け入れ条件

- [ ] `worktree-operations.md` に worktree 標準運用ガイド（src/opencode/ 直接参照・isInsideWorktree 適用）セクションが追加されている
- [ ] `git-common-procedures.md` に git mv workdir フォールバック手順が追記されている
- [ ] `case-close.md` Step 9 に Step 1-1 再実行手順が追加されている
- [ ] `isInsideWorktree` 適用範囲拡張候補が明記されている
- [ ] 追記内容が既存の並列実行安全ステージングプロシージャと整合している

## 元learning item / 根拠

- **要約**: worktree 環境固有の運用落とし穴（junction 非伝播・git mv 実行形式差異・pull block）が4件再発。`agentdev-git-worktree` へのガードレール標準化が優先度高。
- **根拠**:
  - **L-003**（PR #1036, #1032/REQ-0145）: worktree で junction 未伝播により source-projection-sync が偽陽性27件。`isInsideWorktree` ヘルパー適用で解消。他の junction 依存検査への適用拡張を評価すべき。
  - **L-008**（PR #1099, #1095/REQ-0150）: junction 切断環境で `.opencode/` 経由参照が失敗。`src/opencode/skills/` 直接参照で対応。L-003 と同根因だが実装時の参照パス問題として再発。
  - **L-009**（PR #1099, #1095/REQ-0150）: `git -C <worktree> mv` が失敗、`workdir` 指定 + 平置き `git mv` が成功。Windows + worktree で実行形式により成否が分かれる。
  - **L-013**（PR #1128, #1127）: case-close Step 9 の pull --ff-only が並列セッションの未コミット変更でブロック。Step 1-1 は開始時点スナップショットのため検知不可。破壊的操作せず停止。
- **再発条件**: worktree 使用継続・並列セッション運用継続でほぼ確実に再発。
- **横展開可能性**: worktree 環境で junction 依存処理・git mv・pull を実行する全場面。consumer repo 配布先でも同様。

## 推奨Issue分類

- **分類**: enhancement
- **推奨ラベル**: enhancement, documentation
- **関連Issue**: なし（新規）
