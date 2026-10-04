# git push の credential helper（GCM）対話待ちハングの contingency

## 背景

case-open STEP-4 の head branch push（git push -u origin definition/issue-3391）が credential helper 起動（GCM）後にプロンプトなしでハングし、90〜300 秒の timeout で 3 回失敗した（remote 照会・gh CLI 操作は正常）。恒久設定は git-noninteractive-auth.md のとおり gh 橋が整備済みだが、GCM が既定 helper に設定された構成が併存する環境でハングが生じ得る（Case #3391・Definition PR #3392）。

## 問題

credential.helper=manager（GCM）がヘッドレス環境で対話 UI 待ちになり、GIT_TERMINAL_PROMPT=0・GCM_INTERACTIVE=never を渡しても待ちが解除されない。既存知識文書（docs/knowledge/git-noninteractive-auth.md）に push 限定の回避手順（credential.helper 上書き）が未記載である。

## 望ましい変更

docs/knowledge/git-noninteractive-auth.md へ contingency を追記する: push が credential helper 起動後の timeout で失敗する場合、`git -c credential.helper= -c "credential.helper=!gh auth git-credential" push ...` のコマンド単位上書きで gh CLI の keyring トークンを使用する（実行前に `gh auth status` で認証済みを確認。push 出力で refspec と upstream 設定を確認）。恒久設定の変更は個々の Case では行わない。

## 対象範囲

### 対象

- docs/knowledge/git-noninteractive-auth.md（2026-10-05 実測: gh 橋・GCM 併存の記載あり、「ハング」時の push 限定回避は未記載）

### 対象外

- gitconfig の恒久変更・GCM へのトークン登録（環境設定は個々の Case 対象外）
- agentdev_gh（GitHub I/O 正規経路）の変更

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| knowledge | docs/knowledge/git-noninteractive-auth.md | push 限定 credential.helper 上書きの contingency 追記 |

## 既存対策確認

- **確認結果**: 既存対策あり（部分）
- **該当ファイル**: docs/knowledge/git-noninteractive-auth.md（gh 橋の恒久設定手順・GCM 併存の記載）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 対話待ちハング発生時の push 限定回避（コマンド単位上書き）が未記載

## 制約

- credential 値を解析証拠・ログへ出力しない（既存文書の規律維持）
- GitHub I/O 正規経路（agentdev_gh）の迂回ではない（git push は bash 実行の前段手順）

## 受け入れ条件

- [ ] ハング事象の判断基準（timeout・GIT_TRACE での停止位置）と回避手順が記載される
- [ ] gh auth status での事前確認と push 出力での refspec 確認が手順に含まれる

## 元learning item / 根拠

- **要約**: git push の GCM 対話待ちハングと push 限定 credential.helper 上書きによる解消（1件）
- **根拠**: Case #3391・Definition PR #3392（3 回 timeout 失敗 → 上書きで push 成功・refspec 確認済み）
- **再発条件**: GCM 有効・トークンが GCM 側に未保存・UI 表示不能なヘッドレス環境で git push する場合
- **横展開可能性**: 全 git push 経路（case-run・case-close・learning-capture・intake-pipeline）

## 推奨Issue分類

- **分類**: docs
- **推奨ラベル**: documentation, windows
- **関連Issue**: なし
