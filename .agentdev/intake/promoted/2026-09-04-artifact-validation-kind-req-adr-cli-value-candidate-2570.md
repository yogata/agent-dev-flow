# artifact-validation の kind CLI 契約整合

## 観測内容
実装側 `check-frontmatter-consistency.ts` は `req`、`adr`、`decision` を扱う一方、SKILL.md の契約表は `kind(req|adr)` と記載している。

## 影響
利用者が実装で受け付ける `decision` 値を契約上利用できず、旧称と正規名称の扱いを誤認する。

## 課題
実装側の後方互換（`adr` 維持）を前提に、SKILL.md と scripts/README.md の kind 値、説明、検証範囲を実装と整合させる。

## 既存要件・正規成果物との関連
PR #2593、Issue #2570、`agentdev-artifact-validation/scripts/src/check-frontmatter-consistency.ts`、DEC-009。
