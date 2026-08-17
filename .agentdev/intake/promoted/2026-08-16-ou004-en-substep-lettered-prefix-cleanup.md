# command-file-format 規約「代替フロー内サブステップ表現（EN. lettered prefix）」節の整理

## 観測内容

command-file-format 規約「代替フロー内サブステップ表現」（`**EN.**` lettered prefix）節は `### Step N` 手順列挙を前提とした規定であり、層3転換（前出出力検証表）への移行後も /repo/* の従来形式維持のために残置されている。公開 /agentdev/* コマンドでは当該形式が使われなくなったため、規約節と実態が乖離しつつある。

## 影響

- 使用されなくなった形式の規約節が残存し、規約全体の解釈負荷が増える

## 課題

EN. 形式が不要になった時点での整理（節の削除または /repo/* 限定への明記）を検討する。

## 既存要件・成果物との関連

- SPEC: command-file-format「代替フロー内サブステップ表現」節
- 関連: 2026-08-16-ou004-repo-local-workflow-table-checker.md（/repo/* 移行との連動）

## 出典

- 発生日: 2026-08-16
- 発生源: PR #2188 (Issue #2183 / OU-004, Epic #2178 Wave 3) SPEC確定候補 セクション 1
- 元 item: intake-2026-08-16-ou004-en-substep-lettered-prefix-cleanup.md
