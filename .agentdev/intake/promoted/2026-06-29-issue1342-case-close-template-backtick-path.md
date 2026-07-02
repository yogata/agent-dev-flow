# case-close.md:208 の backtick 囲みパスが ReferencePath NG を残存させる

## 観測内容

`src/opencode/commands/agentdev/case-close.md` line 208 が `.opencode/commands/agentdev/templates/case-close/\`agentdev-push-failed\`.md` のように backtick でパスを囲んでおり、docs-check の reference-path-existence ルールが当該パスを解決できず NG 1件を残している。PR #1347 は AG-002（agentdev-inspect-skills SKILL.md の参照パス修正）のみをスコープとし、本 backtick パスは本 Issue 対象外とした。

## 影響

- docs-check の reference-path-existence ルールが backtick 囲みパスを解決できず NG 1件を残存させる

## 課題

- case-close.md:208 の backtick 囲みパスを docs-check が解決可能な形式へ修正すべきか
- テンプレートファイル名 `agentdev-push-failed.md` に backtick が含まれる実体ファイルなのか、markdown 記法の装飾意図なのか
- 同種の backtick 囲みパスが他の command 定義に存在するか（横展開確認）

## 既存要件との関連

- AG-002（inspect-skills SKILL.md の参照パス修正）: PR #1347 で完了
- AG-001（case-close.md duty キーワード）: Issue #1342 で完了

## 観測元

- PR #1347
- Issue #1342
