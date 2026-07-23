# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## PowerShell regex MatchEvaluator 内の -replace 演算子で全件置換されず Node.js で回避した事象

- **問題事象**: case-close(#epic) の QG-4 評価で Issue #1759 の完了条件チェックボックス（`## 完了条件` セクション内7個の `- [ ]`）を `- [x]` に更新する際、PowerShell の `[regex]::Replace` に ScriptBlock（MatchEvaluator）を渡し内部で `-replace '- \[ \]', '- [x]'` を呼んだところ、7個中1個しか置換されなかった。MatchEvaluator は `1`（最大1マッチ）指定で1セクションのみ処理し、その内部の `-replace` はセクション内全件を置換するはずが、結果的に1件のみ減少（before=7 → after=6）となった。
- **発生局面**: 実装（case-close QG-4 評価・Issue 本文更新、Windows PowerShell 7 環境）
- **検知方法**: agentdev-gh-cli の再読込 VERIFY（REQ-0131-033）で完了条件セクションの unchecked=6 が残っていることを Node.js で読み取って検出。VERIFY 手続きが機能した事例。
- **根本原因**: PowerShell の [regex]::Replace の MatchEvaluator（ScriptBlock）内で `-replace` 演算子を使用した際、.NET Regex.Replace と PowerShell -replace の相互作用により全件置換が期待通り動作しなかった。正確なメカニズムは未特定だが、ScriptBlock のスコープ、-replace の置換文字列解釈、または MatchEvaluator 呼び出し回数のいずれかが関与した可能性がある。
- **自律対応内容**: Node.js（child_process.execSync で gh CLI を呼び出し、String.split/join でセクション内全件置換）に切り替えて解決。6個残りの `- [ ]` を全て `- [x]` に置換（section unchecked 6 -> 0）。再読込 VERIFY で checked=7 を確認。
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし。agentdev-gh-cli の references/standard-procedures.md で本文置換に Node.js または .NET String.Replace が既に推奨されている可能性があるが、本 case-close では確認を省略した。要確認は learning-promote または intake-capture に委ねる。
- **横展開観点**: Windows 環境で gh CLI の本文置換（Issue/PR 本文の一部更新）を PowerShell regex で処理する際、MatchEvaluator 内の -replace は信頼性が低い。本文全体の単純置換には Node.js（String.split/join）または PowerShell の String.Replace（.NET メソッド、regex 非使用）を使うべき。
- **再発条件**: PowerShell で gh CLI から取得した本文を [regex]::Replace + ScriptBlock 内 -replace で処理し、セクション内の複数件を置換しようとする際。
- **予防策候補**: agentdev-gh-cli の standard-procedures.md で本文置換に Node.js または [System.IO.File]::WriteAllText + String.Replace（regex 非使用）を推奨する記述を強化。PowerShell regex MatchEvaluator 内での -replace 使用を注意喚起。
- **想定反映先**: src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md（Windows WRITE 手続き）
- **関連**: Issue #1759, PR #1762, Epic #1758, REQ-0131-033（再読込 VERIFY）
- **タグ**: `#windows` `#powershell` `#gh-cli` `#regex` `#verify`
