# repo-agentdev-integrity SKILL.md の検査カテゴリ 6 件が gap detector map に不在

## 観測

`repo-agentdev-integrity/SKILL.md:71-76` が定義する 6 つの検査カテゴリが、`check_integrity.ts:5273-5294` の `categoryToCheckPattern` Map に存在しない。

### 不在カテゴリ

1. Capture boundary
2. 語彙ポリシー
3. Cross-REQ vocab
4. Mapping table history
5. REQ verification basis
6. Skill-internal section ref

### 検証結果

- SKILL.md 側: 6 カテゴリすべて実在（L71-76）
- detector map 側: 上記 6 件いずれも不在。"Mapping table"（履歴なし）は map にあるが、"Mapping table history"（REQ-0108-240）は別物で不在
- map にエントリがないため、実装の有無にかかわらず gap として報告される
- REQ-0108-161 が要求するメタ検査の完全性を損なう

## 影響

gap detector のメタ検査が不完全。SKILL.md で宣言された検査カテゴリに対する実装有無の追跡ができない。

## 課題

以下のいずれかで対応:
- (A) `categoryToCheckPattern` Map に 6 エントリを追加し、対応する検査関数の有無を確認
- (B) SKILL.md 側のカテゴリ表記を既存 map エントリに整合させる
- 各カテゴリが REQ-0105/0108-236/239/240/0115-044/0108-244 に裏付けられた実要件であるため、(B) でカテゴリを減らす方針は不適切

## 既存要件との関連

- **REQ-0108-160**: SKILL.md = authoritative source
- **REQ-0108-161**: 差分を integrity-rule-gap として検出
- **REQ-0108-236/239/240**: 各カテゴリの要件裏付け
- **REQ-0115-044**: Skill-internal section ref の要件

## 対応方針の方向性

- **route**: req-define
- **category**: integrity-rule-gap
- (A) Map 拡充が主軸。各カテゴリに対応する検査関数が未実装の場合は実装も必要

## 元 item 参照

- `.agentdev/intake/inbox/2026-06-14-skill-category-gap-detector-unmapped.md`
