# case-ready STEP-7 クリーンアップの前置確認（ステージ汚染・tracked 確認）を補足する

## 背景

Case #3530 Wave 1 の case-ready STEP-7 で、draft 削除パス誤り（RU 番号 padStart(3) 指定ミス）→ git rm 失敗 → 失敗を確認せず reset --hard → capture commit へ削除ステージが混入、という 3 連鎖ミスが発生し、draft 喪失を git 復元で回復した。

## 問題

readiness-and-cleanup.md に Form Zero 規定（L50-53）はあるが、git rm 失敗時のステージ汚染確認前置と reset --hard 前の tracked/untracked 状態確認が未記載（実測確認済み）。

## 望ましい変更

readiness-and-cleanup.md の STEP-7 手順へ、削除操作前の対象パス実在確認（padStart 等のパス生成ミス防止）、git rm 失敗時のステージ確認（git status --short で汚染確認してから再試行）、reset --hard 前の tracked/untracked 確認を前置確認として補足する。

## 対象範囲

### 対象
- src/common/skills/agentdev-workflow-case-ready/references/readiness-and-cleanup.md
- src/common/skills/agentdev-git-worktree/references/worktree-operations.md（横断の履歴操作前置）

### 対象外
- RU/draft のパス生成仕様そのもの

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | src/common/skills/agentdev-workflow-case-ready/references/readiness-and-cleanup.md | STEP-7 前置確認の補足 |
| 配布skill reference | src/common/skills/agentdev-git-worktree/references/worktree-operations.md | 履歴操作前置確認への横展開注記 |

## 既存対策確認

- **確認結果**: 既存対策あり（部分）
- **該当ファイル**: readiness-and-cleanup.md L50-53（Form Zero）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: git rm 失敗時のステージ汚染確認・reset --hard 前の状態確認が未記載

## 制約

- なし

## 受け入れ条件

- [ ] STEP-7 に削除対象パスの実在確認が前置される
- [ ] git rm 失敗時のステージ確認と reset --hard 前の確認が記載される

## 元learning item / 根拠

- **要約**: STEP-7 3 連鎖ミスの前置確認（draft 喪失・padStart 誤り・capture commit 混入、Case #3530 Wave 1）
- **根拠**: git 復元で回復した実害の事象経過
- **再発条件**: STEP-7 クリーンアップで削除・履歴操作を先行確認なしに実行する場合
- **横展開可能性**: git 運用の履歴操作前置確認一般

## 推奨Issue分類

- **分類**: docs
- **推奨ラベル**: documentation
- **関連Issue**: なし
