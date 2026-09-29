# main 側帰着 Jev 観測 untracked ファイルの安全解消（hash 同一性証明 → 削除 → pull 復元）

## 背景

Case #3239（PR #3241、case-close STEP-6-3、観測 2件）で、worktree コンテキストの Jev 観測が main 側 `.agentdev/jev-observations/` に書かれる契約のため、PR で commit された観測 JSON と同一パスの untracked ファイルが main root に残留し、`git pull --ff-only` の重複ファイルチェック（case-close STEP-6-3-1）に掛かる事象が観測された。

## 問題

Custom Tool `agentdev_jev` の書込先 root 内部解決契約（worktree 実行でも main 側に帰着）と、case-run が同一パスを worktree 側で commit したことの組み合わせで、main root に同一パスの untracked ファイルが残留する。既存手順（STEP-6-3-1）は重複検出時に構造化エラーで停止しユーザー対応を促すところまで記載しており、安全に解消して同期を続行する手順が未記載である。

## 望ましい変更

重複検出時の対処手順として、hash 同一性証明を削除の前提条件とする手順化を STEP-6-3-1 に追記する: (1) `git cat-file` で origin/main の commit 版 blob を取得し sha256 比較でバイト同一を証明、(2) untracked 側を削除、(3) `git pull --ff-only` で同一内容を復元、(4) 復元後 hash 再確認。同一性が証明できない場合は構造化エラー停止を維持する。

## 対象範囲

### 対象

- `src/opencode/skills/agentdev-workflow-case-close/references/cleanup-and-capture.md` STEP-6-3-1（重複ファイルチェックの対処手順の追記）

### 対象外

- `agentdev_jev` の書込先契約変更（Custom Tool 契約は変更しない）
- 観測 JSON 自体の git 管理運用変更（現行契約維持）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補である。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | src/opencode/skills/agentdev-workflow-case-close/references/cleanup-and-capture.md | STEP-6-3-1 重複ファイルチェックへ、hash 同一性証明（cat-file blob sha256 比較）を前提とした untracked 側削除 → pull 復元 → hash 再確認の安全解消手順を追記 |

## 既存対策確認

- **確認結果**: あり
- **該当ファイル**: src/opencode/skills/agentdev-workflow-case-close/references/cleanup-and-capture.md:105（STEP-6-3-1 重複ファイルチェック）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 既存手順は `git status --porcelain` による重複検出と構造化エラー停止（ユーザー対応促し）まで。main 側 untracked ファイルの安全解消手順（hash 同一性証明 → 削除 → pull 復元 → 再確認）は未記載

## 制約

- 同一性が証明できない場合は構造化エラー停止を維持する（強制削除・回避をしない）
- git 管理対象の domain state が worktree と main 側で二重生成される場面の一般手順として適用できる範囲に留める

## 受け入れ条件

- [ ] hash 同一性証明を前提条件とする削除・復元手順が STEP-6-3-1 に追記されている
- [ ] 同一性が証明できない場合の構造化エラー停止維持が明記されている
- [ ] Case #3239 の実測（PR #3241、観測 2件の解消）が根拠として記録されている

## 元learning item / 根拠

- **要約**: main 側に帰着した Jev 観測 untracked ファイルは hash 同一性証明後に削除して pull で復元する。同一性が証明できない場合は構造化エラー停止を維持する
- **根拠**: worktree コンテキストの Jev 観測が main 側 `.agentdev/jev-observations/` に書かれる契約のため、PR で commit された観測 JSON と同一パスの untracked ファイルが main root に残留し `git pull --ff-only` の重複ファイルチェック（STEP-6-3-1）に掛かった（Case #3239 / PR #3241、case-close STEP-6-3、観測 2件）。`git cat-file` で origin/main の commit 版 blob を取得し sha256 比較でバイト同一を証明してから untracked 側を削除、pull で同一内容を復元し hash 再確認で解消
- **再発条件**: worktree 実行の Workflow が main 側に git 管理対象ファイルを生成し、同一パスを PR 側で commit した場合
- **横展開可能性**: git 管理対象 domain state の worktree/main 二重生成場面の安全解消全般

## 推奨Issue分類

- **分類**: chore
- **推奨ラベル**: documentation
- **関連Issue**: なし（Case #3239、PR #3241、.agentdev/jev-observations/ 由来）
