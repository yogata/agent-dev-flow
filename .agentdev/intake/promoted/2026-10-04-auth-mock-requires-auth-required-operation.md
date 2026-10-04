# 採用済み成果物: 認証検証模擬は認証必須操作（push 等）で行う必要のある旨の知識文書注記

## 観測内容

public リポジトリへの ls-remote は無効 credential でも匿名読取が成功し認証検証にならない。認証を検証する模擬は認証必須操作（push 等）で行う必要がある。観測時点の申告では恒常的な検証手順化までは不要と判断されている。

## 影響

認証経路の確認手法を誤ると、認証不成立でも検証が「成功」に見える偽陰性が生じる。docs/knowledge/git-noninteractive-auth.md の現行本文には push での実測手順はあるが、「匿名読取は認証検証にならない」旨の注意喚起は未記載。

## 課題

認証失敗検出の検証手順を文書化する文脈で「模擬は push 等の認証必須操作で実施する」注記を docs/knowledge/git-noninteractive-auth.md へ追加する対応候補（恒常的手順化は観測時点の申告どおり不要とし、文書化要否は評価時に判断）。

## 既存要件との関連

- REQ-102-002 系（Git 操作の認証失敗検出と報告）
- docs/knowledge/git-noninteractive-auth.md（実行環境側の設定手順と実績記録）
- git-worktree Design「Git 操作の認証失敗検出と実行環境側認証規律との接続」節

## 出処・根拠

- 元 inbox item: `.agentdev/intake/inbox/2026-10-04-auth-mock-requires-auth-required-operation.md`（分類採用により削除済み）
- 観測元: PR #3418（Issue #3414・DEL-3414-1）本文 Findings / Capture候補 intake セクション
- captured_at_commit: 469af6c5f54a3f68d225913ab470d6609eff8234
- 現行源検証（intake-promote・ad6e8341・読取のみ）: git-noninteractive-auth.md に当該注意喚起が未記載であることを確認（L28 の push 実測手順は既存）
