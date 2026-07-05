# commit message の GitHub auto-close キーワード回避ガイドライン追加

## 背景

agentdev コミットメッセージ規約では、括弧内にコマンド名+issue番号（例: "(case-close #1403)"）を記載する慣習がある。しかし commit message 末尾の "(case-close #1403)" において、GitHub が "close" を auto-close キーワード（close/closes/closed + #issue）の部分文字列として認識し、直後の "#1403" を issue 参照として解釈した。結果、Epic #1403 が COMPLETED で自動クローズされ、残 Wave（#1406, #1407）が残っているにも関わらず OPEN を維持すべき Epic が意図せずクローズされた。"close"/"fix"/"resolve" を含むコマンド名（case-close 等）と issue 番号の組み合わせが systemic リスクとして存在する。

## 問題

1. agentdev-conventional-commits skill に GitHub auto-close キーワード（close/closes/closed/fix/fixes/fixed/resolve/resolves/resolved）の回避ガイドラインがない。
2. case-close Step 11 等、commit message を生成するステップが "#N" 使用のリスクを考慮していない。
3. "close" を含む複合語（case-close, disclose, closed-loop 等）と近接する "#N" の併存で、意図しない auto-close が発生する。

## 望ましい変更

- agentdev-conventional-commits skill のコミットメッセージ規約に「auto-close キーワードを含む複合語と #N の併存回避」ガイドラインを追加する。
- 具体的回避策: (a) コマンド名と issue 番号を分離し # 記号を避ける（例: "case-close for Epic 1403"）、(b) 括弧内のコマンド名+issue番号表記では複合語内の auto-close キーワード有無を確認する。
- case-close Step 11 の commit message 生成手順に、auto-close キーワード回避の留意点を明記する。

## 対象範囲

### 対象

- agentdev-conventional-commits skill（コミットメッセージ規約）
- case-close command Step 11（commit message 生成・push）
- auto-close キーワードを含むコマンド名で commit message に issue 番号を記載する全 command

### 対象外

- GitHub の auto-close 仕様自体（変更不可）
- commit message 以外の Issue/PR 本文（本文の close キーワードは別仕様）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | agentdev-conventional-commits/SKILL.md | コミットメッセージ規約に auto-close 回避ガイドライン（複合語内キーワード + #N 併存回避、# 省略推奨）を追加 |
| command | case-close.md | Step 11 commit message 生成に auto-close 回避の留意点を明記 |
| skill | agentdev-git-worktree | commit 手順参照先に auto-close 回避の参照を追加（該当する場合） |

## 既存対策確認

- **確認結果**: 既存対策あり（部分カバー）
- **該当ファイル**: agentdev-conventional-commits skill（commit message 規約）、case-close Step 11
- **ギャップ分類**: fix gap
- **ギャップ詳細**: conventional-commits skill は commit message の形式規約を持つが、GitHub auto-close キーワード（特に複合語内の部分文字列認識）の回避ガイドラインを持たない。case-close Step 11 は commit message を生成するが、#N 使用による auto-close リスクを考慮していない。

## 制約

- 既存の conventional-commits 規約（Conventional Commits 形式、日本語サマリ等）を変更しない。auto-close 回避は追加ガイドラインとして位置付ける。
- 全ての commit message で #N を禁止するのではなく、auto-close キーワードを含む複合語との近接併存のみを回避対象とする（通常の "fixes #123" 等の意図的クローズは維持）。
- pre-commit hook / commit lint による機械検出は将来拡張候補とし、本成果物の必須要件とはしない（規約追記を優先）。

## 受け入れ条件

- [ ] agentdev-conventional-commits skill に auto-close 回避ガイドラインが追加されていること
- [ ] ガイドラインが「複合語内の部分文字列認識リスク」と「# 省略による回避策」を明記していること
- [ ] case-close Step 11 に auto-close 回避の留意点が明記されていること
- [ ] 既存の意図的クローズ表記（"fixes #123" 等）の運用を破壊しないこと

## 元learning item / 根拠

- **要約**: commit message の "(case-close #N)" 等の括弧内コマンド名+issue番号表記で、GitHub が "close" を auto-close キーワードの部分文字列として認識し、意図せず Issue がクローズされる。
- **根拠**: case-close (Epic Wave クローズ) Step 11 で push した commit ecfd327a のメッセージ "chore(agentdev): capture Wave 1 PR #1409 findings to intake inbox (case-close #1403)" により、Epic #1403 が COMPLETED で自動クローズされた。本来 Wave 2 (#1406), Wave 3 (#1407) が残っているため OPEN を維持すべきだった。GitHub が "close #1403" を auto-close キーワードとして認識した。closedByPullRequestsReferences が空配列で PR 由来ではないことを確認し、commit message 由来と特定。gh issue reopen で復旧。
- **再発条件**: commit message に "close/closes/closed/fix/fixes/fixed/resolve/resolves/resolved" を部分文字列として含む複合語と、同一行または近接する issue 番号参照（#N）が同時に存在し、当該 commit が main へ push された場合。
- **横展開可能性**: GitHub + agentdev commit 規約（case-close 等の "close" 含むコマンド名）全般で発生しうる。GitHub auto-close 仕様は汎用的。

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: bug, process-improvement
- **関連Issue**: Epic #1403（不意クローズ事象）、commit ecfd327a
