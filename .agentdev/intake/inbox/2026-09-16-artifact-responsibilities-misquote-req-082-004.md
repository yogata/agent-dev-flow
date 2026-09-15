# artifact-responsibilities.md L38/L46 の誤引用（REQ-082-004 付け替え済み・引用本文が REQ 行に不在）

## 内容

docs/designs/responsibilities/artifact-responsibilities.md L38/L46 の REQ-003-033 参照（Case #2846 で REQ-082-004 へ付け替え済み）は、旧行本文「エージェント間で解決不能な争点のみをユーザーへ返し…」と引用本文「責務ごとに最も安定した最小の定義元を正規とする」が不一致の誤引用。引用本文は REQ 行に存在せず（同文は src/opencode/skills/agentdev-inspect-skills/references/semantic-diagnostic-perspectives.md L30 のみ）、REQ-082 分離前から存在した状態。

## 提案

適正な参照先の特定（引用本文の出所または REQ-082-004 の該当節）と本文修正。機械的対応表による付け替え（Case #2846）では dangling 解消のみを実施し、引用本文の修正は新規の意味判断のため対象外として記録済み。

## 根拠

- 観測元: PR #2879 本文 Findings F-001（Case #2846、git 履歴 1948023c で旧行本文確認）
- 観測時 commit: PR #2879 head
- 関連: docs/designs/responsibilities/artifact-responsibilities.md L38/L46、REQ-082-004

## 分類

- 分類: intake（具体的修正対象あり: 誤引用の参照先特定と本文修正）
- 変更種別: docs（Design 文書の引用修正）
- 優先度: 中（Design 文書内の誤引用は正規成果物の意味整合に影響）
