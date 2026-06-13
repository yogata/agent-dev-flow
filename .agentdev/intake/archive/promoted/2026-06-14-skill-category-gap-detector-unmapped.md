# SKILL.md 検査カテゴリが gap detector で未マッピング

## 観測

`repo-agentdev-integrity` の `SKILL.md` が定義する検査カテゴリのうち 6 件が、gap detector の category→check マップに存在せず、検査漏れ検知の前提が揃っていない。

### 対象カテゴリ

- `Capture boundary`
- `語彙ポリシー`
- `Cross-REQ vocab`
- `Mapping table history`
- `REQ verification basis`
- `Skill-internal section ref`

- 件数: NG 6（`skill-category-gap`）

## 影響

SKILL.md に記載された検査が実装されているかを保証するメタ検査が一部効かなくなる。

## 推奨対応

gap detector の category→check マップへ該当カテゴリを追加する、または SKILL.md のカテゴリ表記を既存マップへ整合させる。

## 分類

- finding category: integrity-rule-gap
- route: req-define
- 原因: 確認済

## 根拠

- 検査: `skill-category-gap`（strict）
- 対象: `.opencode/skills/repo-agentdev-integrity/SKILL.md`
