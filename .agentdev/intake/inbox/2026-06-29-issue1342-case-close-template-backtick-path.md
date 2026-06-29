# case-close.md:208 の backtick 囲みパスが ReferencePath NG を残存させる

## 観察

`src/opencode/commands/agentdev/case-close.md` line 208 が `.opencode/commands/agentdev/templates/case-close/\`agentdev-push-failed\`.md` のように backtick でパスを囲んでおり、docs-check の reference-path-existence ルールが当該パスを解決できず NG 1件を残している。

PR #1347 は AG-002（agentdev-inspect-skills SKILL.md の参照パス修正）のみをスコープとし、本 backtick パスは本 Issue 対象外とした。PR 本文 Findings に記録済み。

## 修正されなかった理由

本 Issue #1342 の完了条件は AG-001（case-close.md duty キーワード）と AG-002（inspect-skills SKILL.md 参照パス）のみ。case-close.md:208 の backtick パスは別問題であり、Issue スコープを広げると完了条件の意味が変わるリスクがあるため別途整理を推奨する。

## 課題

- case-close.md:208 の backtick 囲みパスを docs-check が解決可能な形式へ修正すべきか
- テンプレートファイル名 `agentdev-push-failed.md` に backtick が含まれる実体ファイルなのか、markdown 記法の装飾意図なのか
- 同種の backtick 囲みパスが他の command 定義に存在するか（横展開確認）

## 根拠

PR #1347 本文「## Findings / Capture候補」より引用:

> case-close.md:208 backtick パス（本 Issue 対象外）: ReferencePath NG 1件を残存する: `.opencode/commands/agentdev/templates/case-close/\`agentdev-push-failed\`.md`。backtick を含むパス文字列の解決失敗による。本 Issue スコープ外のため未対応。別 Issue での対応を推奨。

## 観測元

- PR #1347
- Issue #1342
