# worktree 内 checker 実行の退避ファイルは worktree remove 前に掃除する（作成先は .agentdev/tmp/ 統一）

## 背景
Case #3231（REQ-094 Wave 3）の case-close で worktree 内 checker を `2>` stderr 分離退避付きで
実行し、退避ファイル err-distb.log が untracked 残存して STEP-6-1 の `git worktree remove` が拒否
（削除後の再実行で解消、--force 不使用）。

## 問題
STEP-6-6 の tmp/ 残存確認は .agentdev/tmp/ 配下が対象で、worktree 内作業ディレクトリ直下に作成した
退避ファイルを網羅しない。退避ファイルの作成先規定と STEP-6-1 前の掃除手順が case-close reference
に未記載。

## 望ましい変更
(1) 退避ファイルは .agentdev/tmp/ 配下（worktree root 相対）へ置くことを標準化、
(2) STEP-6-1 の前に当該実行が作成した退避ファイルの列挙と削除を cleanup 手順へ明記する
（cleanup-and-capture.md STEP-6-1/STEP-6-6、docs-and-design-promotion.md の退避形式記述への接続）。

## 対象範囲
### 対象
- src/opencode/skills/agentdev-workflow-case-close/references/cleanup-and-capture.md
- src/opencode/skills/agentdev-workflow-case-close/references/docs-and-design-promotion.md
### 対象外
- stdout 証跡退避形式（spawnSync + writeFileSync UTF-8 明示）の規定本体

## 反映先候補
| 種別 | パス | 変更内容 |
|---|---|---|
| 配布skill reference | cleanup-and-capture.md | 退避ファイル作成先の .agentdev/tmp/ 統一と remove 前掃除の明記 |
| 配布skill reference | docs-and-design-promotion.md | 退避形式記述への作成先規定の接続 |

## 既存対策確認
- **確認結果**: あり
- **該当ファイル**: cleanup-and-capture.md STEP-6-6（.agentdev/tmp/ 残存確認）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: worktree 内退避ファイルが cleanup 対象外

## 制約
--force を使わない現行運用は維持する。

## 受け入れ条件
- [ ] 退避先規定と remove 前掃除手順が明記されている

## 元learning item / 根拠
- **要約**: worktree 内退避ファイルの残留が worktree remove を拒否する
- **根拠**: #3231（err-distb.log untracked 残存で remove 拒否→削除後に再実行で解消）
- **再発条件**: worktree 内で退避ファイルを作成する検証実行後 worktree remove を行う場合
- **横展開可能性**: worktree 内 checker・bun test の退避付き実行全般

## 推奨Issue分類
- **分類**: fix
- **推奨ラベル**: documentation
- **関連Issue**: Issue #3231
