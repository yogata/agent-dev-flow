# intake: 認証検証模擬は認証必須操作（push 等）で行う必要

## 内容

public リポジトリへの ls-remote は無効 credential でも匿名読取が成功し認証検証にならない。認証を検証する模擬は認証必須操作（push 等）で行う必要がある。恒常的な検証手順化までは不要と判断し intake 候補として記録。

対応候補: 認証失敗検出の検証手順を文書化する場合（docs/knowledge/git-noninteractive-auth.md 等）に「模擬は push 等の認証必須操作で実施する」注記を追加する。恒常的手順化までは不要の申告を尊重し、評価時に要否判断する。

## 根拠

- 観測元: PR #3418（Issue #3414・DEL-3414-1）本文 Findings / Capture候補 intake セクション
- 元テキスト: 「認証失敗模擬の初回試行で、public リポジトリへの ls-remote は無効 credential でも匿名読取が成功し認証検証にならないことを確認した。認証を検証する模擬は認証必須操作（push 等）で行う必要がある。恒常的な検証手順化までは不要と判断し intake 候補として記録」
- captured_at_commit: 469af6c5f54a3f68d225913ab470d6609eff8234
