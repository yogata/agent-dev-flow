# SKILL.md品質ガバナンス基準の強化

## 背景

agentdev-no-ai-slop-writing SKILL.mdが542行で500行閾値を超過。また21技能のうち17技能がUSE FOR / DO NOT USE FORを専用セクションとして持たず、frontmatter descriptionに埋め込んでいる。integrity-checkで検出されているが、品質基準の明文化が不十分で解消に至っていない。

## 問題

スキルファイルの品質基準（行数上限、references/抽出トリガー、USE FOR / DO NOT USE FOR表記規約）が明確でなく、SKILL.mdの肥大化や表記不統一が放置される。

## 望ましい変更

skill-authoring skillの品質基準に、(1) 行数超過時のreferences/抽出ルール明文化、(2) USE FOR / DO NOT USE FORの表記規約（description内 vs 専用セクションのどちらを正とするか）を追加する。

## 対象範囲

### 対象

- `.opencode/skills/agentdev-skill-authoring/SKILL.md` — 品質基準
- `.opencode/skills/agentdev-skill-authoring/references/` — 詳細基準（既存ファイル）

### 対象外

- 各SKILL.mdの直接修正（別Issueで対応）
- integrity-checkのルール追加

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | `.opencode/skills/agentdev-skill-authoring/SKILL.md` | 品質基準に行数上限・フォーマット規約を追加 |
| skill | `.opencode/skills/agentdev-skill-authoring/references/` | references/抽出トリガー・表記規約の詳細化 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: `.opencode/skills/agentdev-skill-authoring/SKILL.md`
- **ギャップ分類**: guardrail insufficiency
- **ギャップ詳細**: skill-authoringに≤500行baselineは存在するが、(1) 超過時のreferences/抽出トリガーが明文化されていない、(2) USE FOR / DO NOT USE FORのdescription埋め込み vs 専用セクションのどちらを正とするかの規約がない

## 制約

- 既存の4技能（workflow-lifecycle, workflow-routing, workflow-templates, repo-agentdev-integrity）が専用セクションを持っているため、これと整合させる
- 一斉に17技能を修正するのではなく、品質基準の追加に留める
- integrity-checkで既に検出済みのため、検出ルールの追加は不要

## 受け入れ条件

- [ ] skill-authoringの品質基準に行数超過時のreferences/抽出ルールが追加されている
- [ ] USE FOR / DO NOT USE FORの表記規約（description内 vs 専用セクション）が明文化されている
- [ ] 既存の4技能の専用セクション形式と整合している

## 元learning item / 根拠

- **要約**: SKILL.mdの行数肥大化とUSE FOR / DO NOT USE FOR表記不統一が放置
- **根拠**: (1) agentdev-no-ai-slop-writing SKILL.md が542行で500行閾値超過。references/ディレクトリは存在するが抽出されていない。(2) 21技能中17技能がdescription埋め込み、4技能のみ専用セクション。表記規約が不在
- **再発条件**: スキル内容を継続的に追加・拡充する運用で、lint基準がない場合
- **横展開可能性**: 全スキルに適用される問題。スキル拡充で継続発生

## 推奨Issue分類

- **分類**: enhancement
- **推奨ラベル**: enhancement
- **関連Issue**: integrity-check F-002, F-003
