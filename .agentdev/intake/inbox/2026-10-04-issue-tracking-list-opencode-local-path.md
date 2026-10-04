# intake: issue_tracking_list.test.ts の src/opencode-local 参照パス更新候補

## 内容

integrity suite 分割①の issue_tracking_list.test.ts が `../../../../../src/opencode-local/agentdev-gh/runner-local.ts`（現行ツリーの正規配置は `src/common/tools/agentdev-gh/local/runner-local.ts`）を参照している。worktree 環境では参照先不在のため error となり（baseline でも同 error 再現済みの既知欠陥として分離記録済み）、main root 環境では src/opencode-local がローカル配置として実在するために誤って解決成功する。検査基盤の参照パスの正規配置への更新候補。

## 根拠

- 観測元: PR #3422（Case #3420・DEL-3420-1）本文 Findings / Capture候補 セクション
- 元テキスト: 「integrity suite 分割①の issue_tracking_list.test.ts が src/opencode-local/agentdev-gh/runner-local.ts（現行ツリーに不在・baseline でも不在）を参照し error。検査基盤の参照パス更新候補（baseline 再現済みの既知欠陥として分離記録済み）。」
- case-close 追加観測（2026-10-04・マージ後 main root a15f55df）: main root では当該 error が非発生。src/opencode-local が git 非追跡のローカル配置として存在するため参照が解決され、環境差で結果が反転する。パス更新は環境差を解消する恒久処置候補
- captured_at_commit: a15f55df
