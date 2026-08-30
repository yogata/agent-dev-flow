---
name: agentdev-command-authoring
description: Provides quality criteria and best practices for authoring OpenCode command definitions, including frontmatter verification, line count thresholds, and step structure standards. USE FOR: creating or improving commands, reviewing command quality, deciding whether to extract orchestration skills, checking DoD compliance. DO NOT USE FOR: creating skills, writing templates, general coding tasks.
---

# コマンド作成ベストプラクティス（Command Authoring）

OpenCodeのCommand定義（`.opencode/commands/`）を書く際の実践ガイドである。
Command/ Skill/ Template/ Script の責任分界に基づき、Command を薄く保つ基準を提供する。

## Frontmatter 規約

command frontmatter の許可フィールドは `description` 単一。
実行エージェントの固定は harness 側設定へ移管し、command frontmatter には記述しない。

```yaml
---
description: コマンドの簡潔な説明
---
```

**禁止フィールド**（frontmatter への記述は error として検出される）:
- `agent`（harness 側設定へ移管）
- `pattern`（追加禁止フィールド）
- `workflow_route`（追加禁止フィールド）
- `branch_type`（追加禁止フィールド）
- `labels`（追加禁止フィールド）

これらの情報は command-map.md 等の参照用文書で管理し、frontmatter には混入させない。

## ガードレール記述と共通ポリシー識別子

ガードレール番号 Gxx の連番制度は廃止済みである（起点番号・欠番なし・重複なし・変換対照表の保持を要求しない）。

- Command 固有の利用者向け境界（横断参照・機械強制を必要としないもの）は ID を付与せず、「ガードレール」セクションの本文として記述する
- 複数箇所から参照、検査または強制される共通ポリシーのみが意味に基づく安定識別子（`POL-` 接頭辞 + kebab-case）を持つ。識別子の定義一覧は `references/common-policy-identifiers.md` が保持する
- 配布物から識別子を参照する際は識別子全体をコードスパンで記述する（未定義参照・重複定義・廃止済み Gxx 表記の残存は docs-check が検出する）

## 責任分界の原則

Commandは **公開APIと高レベル実行骨格** に徹する。
詳細な判定基準、状態機械、スキーマはSkillへ、決定的処理はScriptへ移す。

Commandに書くべき内容:
- Input/ Output/ Guardrails/ Steps
- ユーザー確認ポイント
- 成果物の読み書き対象
- Command固有の制約、前提

Commandに書くべきでない内容:
- 詳細な判定表、分類表 → Skillの`references/`へ
- 大きな状態機械、再開ポイントロジック → Orchestration skillへ
- 決定的な変換、検証、生成処理 → Scriptへ
- テンプレート選定ルールの詳細 → Skillへ

### Step 番号と詳細手順の配置

Command が持つ Step 番号は高レベル（整数 Step 1, 2, 3...）に限定する。
Step の細分番号（4-1, 4-2 等）、判定表、状態機械詳細は skill 本体または skill の `references/` へ配置すること。
Command Steps が深く階層化されている場合、それは skill への切り出し不足のシグナルである。

REQ 要件行には振る舞い、制約、状態のみを記述し、Step 番号参照やコマンド実装詳細を混入させないこと。
REQ 要件行が特定 Step 番号（例: 「Step 4-2 で分類する」）に依存している場合、command 実装の変更が REQ 解釈に影響する結合が生じるため、振る舞い単位の記述に書き換えること。

詳細ガイドは `agentdev-req-file-manager` の「REQ 要件行の記述基準」セクションを参照のこと。

### サブセクション化かリスト1行追記かの判断基準（REQ）

command 定義の内容を追加、更新する際、サブセクション化（独立した `###` セクションとして記述）するかリスト1行追記（既存の箇条書きに1行追加）するかを判断する基準である。

| 判断軸 | サブセクション化 | リスト1行追記 |
|---|---|---|
| **情報量** | 説明文が複数段落にわたる、詳細な手順、複雑な条件分岐を含む | 1文で完結する説明、シンプルな事実 |
| **独立性** | 他の項目から独立して読み取れる、単独で参照可能 | 既存項目との依存関係が強く、文脈が必要 |
| **将来拡張見込み** | 項目自体が将来的に詳細化、分割される可能性が高い | 将来的な拡張が想定されない、安定した内容 |

3軸のうち2つ以上が「サブセクション化」基準を満たす場合はサブセクション化を選択する。
境界ケースでは保守性、読みやすさを重視しサブセクション化を選ぶ。

## Definition of Done（DoD）

command/ skill 変更時の完了定義。以下の全項目を満たすこと:

- **Frontmatter**: description 単一。dev メタデータ禁止
- **行数**: 100行以内が目標。150行実運用上限。200行超は例外状態
- **Steps数**: 5〜12個
- **共通処理重複**: 共通処理は共通 skill/ script に集約
- **正規パス（Canonical path）**: `references/`（非 `reference/`）
- **完了報告の種別**: 本文直接保持なし。種別 path + 選択条件 + 置換変数のみ
- **Script-backed 可否**: 決定的検査、変換は script 化を検討

## 実行時パス（Runtime Path）規約

Command本文でパスを参照する際、実行時パス（runtime path）を使用する。
Source path は開発時のみ有効であり、個別プロジェクトでの実行時には存在しない。

| 用途 | 実行時パス（使用する） | Source path（使用しない） |
|------|-------------------------|--------------------------|
| Command | `.opencode/commands/agentdev/` | `src/opencode/commands/agentdev/` |
| Skill | `.opencode/skills/{skill-name}/` | `src/opencode/skills/{skill-name}/` |
| Template | `.opencode/skills/{skill-name}/templates/` | `src/opencode/skills/{skill-name}/templates/` |
| Reference | `.opencode/skills/{skill-name}/references/` | `src/opencode/skills/{skill-name}/references/` |

Commandの Steps/ Guardrails 内で template や reference のパスを記述する際は、必ず `.opencode/skills/...` で始めること。
`src/opencode/...` は実行時環境に投影されない。

## サブエージェント編集安全性（Subagent Edit Safety）

Subagent に編集を委譲する場合、および Issue #653/#655/#656 の再発防止として、以下を満たすこと:

- **Worktree 内制約**: Subagent は worktree root 外のファイルを編集してはならない。編集対象は worktree root からの相対パスで指定し、worktree 外へのパス遷移を防止しなければならない
- **パスプレフィクス確認**: 編集操作の前に、対象パスが worktree root からの相対パスであることを検証しなければならない。絶対パスや worktree 外パスを使用してはならない
- **ファイル存在確認**: 編集対象ファイルの存在を事前に確認しなければならない。存在しないファイルへの edit 操作を行ってはならない

Source path と実行時パス（runtime path）の混同を防止するため、`src/opencode/...`（source path）と `.opencode/...`（実行時パス）を明確に区別すること。
Command/ skill 定義内のパス参照は記述された通りに解釈し、source path を実行時参照先として使用してはならない。

## 文章品質観点（作成時）

command 作成時に次の観点で文章品質を検査し、違反を残さない。規範原本は japanese-tech-writing スキル、契約は配布物の文章品質契約である。

- メタ指示残留: 実行時に意味を持たない LLM 宛指示文を残さない
- 文の完結性: 主述が完結しない文を残さない
- 自然な日本語: 無根拠な英単語混在を行わない。英字は用語政策の許容リストに基づく用語に限る
- 規範関係明示: 「〜を正とする」「〜が正」は規範原本への参照を伴い、定義元・参照元・所有関係のいずれかを一義的に判断できる場合に限り使用する
- 名詞連結: 過長な名詞連結列を残さず、読み手の切れ目を示す
- 条件連結: 1 文に 3 以上の条件節を連結しない

## Review Checklist

Command作成、改定時に以下を確認する:

- [ ] Frontmatter が description 単一か（dev メタデータなし）
- [ ] 行数が150行以内か（超過する場合は分割検討）
- [ ] Stepsが5〜12個か
- [ ] 詳細な判定表、分類表がSkillに移されているか
- [ ] ロジックが宣言的（Skill参照）になっているか
- [ ] Script化すべき決定的処理がCommandに残っていないか
- [ ] パス参照が実行時パス（`.opencode/...`）を使用しているか（`src/opencode/...` は禁止）
- [ ] 文章品質観点（上記 6 観点）に違反がないか

→ 詳細な DoD 項目とチェックリストは `references/command-authoring-standards.md` を参照

## See Also

- **agentdev-skill-authoring**: Skill 品質基準
- **artifact-contracts Design**: Command/Skill/Template/Script 責務境界
- **references/command-authoring-standards.md**: 行数目安、Steps数目安、共通処理重複、正規パス、完了報告種別、後方互換性の詳細
- **references/common-policy-identifiers.md**: 共通ポリシー意味識別子（POL-）の定義一覧（registry）
