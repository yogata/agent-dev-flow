# agentdev-issue-management 案内の参照切れ候補

## 観測内容
PR #2643（Issue #2638）の Capture で、case-open の案内先にある「識別子中心記載ガイドライン」本文を `agentdev-issue-management` 内で確認できない事象が記録された。

## 影響
利用者が参照先へ移動しても案内された規律を確認できず、Issue 本文の記載判断が不安定になる。

## 課題
参照先の実在を再確認し、不在なら実在する正規参照先へ案内を修正するか、正規所有が必要な本文を追加するかを判断する。診断経路との重複も確認する。

## 既存要件・正規成果物との関連
Issue #2638、PR #2643（2bbad7ee）、`agentdev-workflow-case-open/references/issue-body-and-execution-contract.md`。
