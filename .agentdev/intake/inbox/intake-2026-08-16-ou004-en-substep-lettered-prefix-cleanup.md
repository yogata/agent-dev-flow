# Intake Item: command-file-format 規約「代替フロー内サブステップ表現（EN. lettered prefix）」節の整理

## 発生源

- PR: #2188 (Issue #2183 / OU-004, Epic #2178 Wave 3)
- 発生 phase: case-close Capture 回収（SPEC確定候補）
- capture 分類: intake（SPEC確定候補、backlog 化）

## 問題

command-file-format 規約「代替フロー内サブステップ表現」（`**EN.**` lettered prefix）節は `### Step N` 手順列挙を前提とした規定であり、層3転換（前出出力検証表）への移行後も /repo/* の従来形式維持のために残置されている。公開 /agentdev/* コマンドでは当該形式が使われなくなったため、規約節と実態が乖離しつつある。

## 推奨対応

EN. 形式が不要になった時点での整理（節の削除または /repo/* 限定への明記）を検討する。SPEC 本文の確定は backlog 化後に扱う。

## 関連

- Issue: #2183 (CLOSED), Epic: #2178 (CLOSED)
- PR: #2188 (SPEC確定候補 セクション 1)
