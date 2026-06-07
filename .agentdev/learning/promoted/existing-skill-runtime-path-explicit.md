# command定義のruntime path明示規約の追加

## 背景

case-close、case-auto等のcommand定義でテンプレート参照先をskill名のみで記述し、runtime path（`.opencode/...`）が不明確だったため、command-local templates側に誤探索するバグが発生。またintegrity-checkのパス解決がcross-skill参照でfalse positiveを出す問題も発生している。

## 問題

command定義内のテンプレート参照が暗黙的（skill名のみ）で、runtime pathが明示されていない。ADR-0013/0018でruntime/authoring分離は規定されているが、command定義でのパス記述粒度が不足している。

## 望ましい変更

command-authoring skillの品質基準に、テンプレート参照時のruntime path明記を必須とする規約を追加する。

## 対象範囲

### 対象

- `.opencode/skills/agentdev-command-authoring/SKILL.md` — 品質基準
- `.opencode/skills/agentdev-command-authoring/references/command-authoring-standards.md` — 詳細基準

### 対象外

- 各command定義の直接修正（別Issueで対応）
- integrity-checkのパス解決ロジック変更

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | `.opencode/skills/agentdev-command-authoring/SKILL.md` | テンプレート参照時のruntime path明記を品質基準に追加 |
| skill | `.opencode/skills/agentdev-command-authoring/references/command-authoring-standards.md` | runtime path記述規約の詳細化 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: `.opencode/commands/agentdev/case-auto.md`（G11/G12）、`.opencode/commands/agentdev/case-close.md`（runtime path明記）
- **ギャップ分類**: guardrail insufficiency
- **ギャップ詳細**: case-auto/case-closeに個別のguardrail（G11/G12）としてruntime path指定は存在するが、command-authoringの品質基準として一般化されていない。新規command作成時に同じミスが再発する可能性がある

## 制約

- runtime pathは`.opencode/`配下のパスを指す（`src/opencode/`はauthoring path）
- 既存のADR-0013/0018のruntime/authoring分離規約と整合させる
- 全commandの一斉修正ではなく、品質基準の追加に留める

## 受け入れ条件

- [ ] command-authoringの品質基準にruntime path明記規約が追加されている
- [ ] command-authoring-standards.mdに具体例（OK/NG）が記載されている
- [ ] case-auto G11/G12、case-close runtime path明記と整合している

## 元learning item / 根拠

- **要約**: command定義のテンプレート参照が暗黙的で、runtime path不明確によりバグ発生
- **根拠**: case-closeがテンプレート参照先をskill名のみで記述しcommand-local templates側に誤探索。case-autoがsrc/opencode/...をruntime pathに読み替え。integrity-checkのcross-skill参照でfalse positive 8件発生
- **再発条件**: command定義がテンプレート参照をskill名のみで記述し、runtime pathを明示しない場合
- **横展開可能性**: 全command/skill定義に適用される。新規command作成時に特に高リスク

## 推奨Issue分類

- **分類**: enhancement
- **推奨ラベル**: enhancement
- **関連Issue**: Issue #625, PR #626
