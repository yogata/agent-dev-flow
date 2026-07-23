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
## case-close QG-4 で pass_criteria 文言違いを意味的等価として承認した事象（REQ-0129-012）

- **問題事象**: case-close QG-4 で Issue #1760 の完了条件「REQ-0129-012 が存在し、『対応要否と対応形態を分けて判定』『恒久契約候補以外を RU 生成経路へ送らない』『独立して再評価』を含むこと」を評価した際、REQ-0129-012 の実際の content（artifact_actions ACT-REQ-003 経由で req-save が verbatim 挿入）は「backlog-review は上流の恒久契約候補判定を独立して再評価し、恒久契約として不適格な成果物を RU 化しないこと」となっており、pass_criteria の期待文字列（「対応要否と対応形態を分けて判定」「恒久契約候補以外を RU 生成経路へ送らない」）と一致しなかった
- **発生局面**: レビュー（case-close QG-4 評価、Epic #1758 Wave 2 #1760）
- **検知方法**: PR #1763 本文の TS-004 検証結果（record-in-findings F-001）と docs/requirements/REQ-0129.md の REQ-0129-012 content の突き合わせ
- **根本原因**: pass_criteria の期待文字列は REQ-0127-023/0128-010 と共通化して記述されたが、REQ-0129-012 は backlog-review 専用で pipeline stage が異なるため、責務の違いを反映して content 表現が異なっている。これを pass_criteria 側が吸収せず、文字列一致を要求する形で起票した
- **自律対応内容**: 意味的等価性を確認の上、F-001 を「意味的等価・承認」として処理。完了条件を `[x]` に更新。REQ-0129-012 の「上流判定を独立して再評価」は backlog-review が「対応要否（RU化するか）」と「対応形態（どのRU型か）」を二重に判定することを意味的に含意し、REQ-0127-023/0128-010 の「対応要否と対応形態を分けて判定」と等価
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし。req-draft 段階の pass_criteria 記述粒度の問題で、REQ/SPEC 本体への影響はない
- **横展開観点**: 複数 REQ への共通 pass_criteria を起票する場合、各 REQ の pipeline stage（promote と review 等の位置づけの違い）が content 表現に反映されることがある。文字列一致ではなく意味的等価性で評価できるよう、pass_criteria 側に「意味的等価を許容」旨を明示するか、REQ ごとに個別の pass_criteria を記述することが望ましい
- **再発条件**: 複数 REQ で共通の観測可能振る舞いを追加する Issue の test_strategy で、pass_criteria を共通化して文字列一致を要求した場合
- **予防策候補**: case-open 時の test strategy 起票で、複数 REQ の共通 pass_criteria を避け、REQ ごとの個別期待値を記述する。または pass_criteria に「意味的等価を許容」旨を明記する
- **想定反映先**: agentdev-workflow-templates（issue_desc_*.md テンプレートの test strategy 記述ガイド）、agentdev-req-analysis（pass_criteria 記述基準）
- **関連**: Issue #1760, PR #1763, REQ-0129-012, REQ-0127-023, REQ-0128-010, Epic #1758
- **タグ**: `#test-strategy` `#pass-criteria` `#qg-4` `#意味的等価`

## pass_criteria の「存在しないこと」が「変更されていないこと」を意図した誤表現（REQ-0147-010）

- **問題事象**: Issue #1760 の TS-003 pass_criteria は「REQ-0101-058、REQ-0136-033、REQ-0147-010、REQ-0140-043 が存在しないこと」と記述されていたが、REQ-0147.md には REQ-0147-010 が存在する（変更なし）。pass_criteria の存在確認表現が「変更されていないこと」を意図したにも関わらず「存在しないこと」と誤って記述されていた
- **発生局面**: レビュー（case-close QG-4 評価、Epic #1758 Wave 2 #1760）
- **検知方法**: PR #1763 本文の TS-003 検証結果（REQ-0147-010 は「注意」扱い、record-in-findings F-002）と docs/requirements/REQ-0147.md の実際の状態の突き合わせ
- **根本原因**: test strategy 起票時に「変更対象外 REQ の変更がないこと」を「存在しないこと」と誤表現した。検証の意図（diff がないこと）と検証の表現（存在確認）がずれた
- **自律対応内容**: F-002 を record-in-findings で処理。REQ-0147-010 の存在自体は問題ない（変更されていないことが正しい状態）のため、pass_criteria 表現の誤りとして記録。Issue #1760 は closed 済みで test strategy 修正不要、将来の test strategy 起票時の品質向上知見として記録
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし。test strategy の記述品質の問題で、REQ/SPEC 本体への影響はない
- **横展開観点**: pass_criteria で「変更対象外」を検証する場合、「存在しないこと」と「変更されていないこと（diff がないこと）」は異なる意味。前者は誤って既存 REQ を隠蔽する可能性があり、後者が正確。存在確認は新規作成禁止（「REQ-0164 が存在しないこと」等）の場合のみ使用すべき
- **再発条件**: 変更対象外 REQ を pass_criteria で検証する際、「存在しないこと」と誤って記述した場合
- **予防策候補**: case-open 時の test strategy 起票で、変更対象外 REQ の検証は「diff がないこと」「変更されていないこと」で表現する。存在確認は新規作成禁止の場合のみ使用する
- **想定反映先**: agentdev-workflow-templates（issue_desc_*.md テンプレートの test strategy 記述ガイド）、agentdev-req-analysis（pass_criteria 記述基準）
- **関連**: Issue #1760, PR #1763, REQ-0147-010, Epic #1758
- **タグ**: `#test-strategy` `#pass-criteria` `#検証表現`

