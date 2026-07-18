# SPEC 重複許容基準（REQ-0147-001）の適用事例追記: project extensions boilerplate

## 背景

15 の agentdev command で project extensions boilerplate（同一4行の extension 宣言）が重複定義されている。REQ-0119-034（同一契約再定義抑止）に形式的には違反するが、artifact-responsibilities.md SPEC の「SKILL ↔ command 同一ルール重複許容基準（REQ-0147-001）」に該当するかの判定が必要だった。SPEC 重複許容基準の適用事例が SPEC に未蓄積のため、今後同様の boilerplate 重複が発生した際に「許容か違反か」の判断基準が不明確。

## 問題

1. artifact-responsibilities.md SPEC の重複許容基準（REQ-0147-001）の適用事例が未蓄積。
2. boilerplate 重複時に「公開契約宣言（command 公開契約の宣言部分）」と「詳細契約（extension の context/rules/checks 等の中身）」の分離判断基準が標準化されていない。
3. inspect-skills で boilerplate 重複を検出した際の判定マトリクスが未整備。

## 望ましい変更

artifact-responsibilities.md SPEC に重複許容基準の適用事例（project extensions boilerplate）を追記する。boilerplate 重複時に「公開契約宣言」と「詳細契約」を分離するフローを標準化する。command-authoring-standards.md（※パスは extension 経由で確認）にも boilerplate 許容の指針を整理する。

## 対象範囲

### 対象

- `docs/specs/responsibilities/artifact-responsibilities.md`（REQ-0147-001 適用事例追記）
- `docs/specs/responsibilities/command-authoring-standards.md`（※パスは extension 経由で確認）（boilerplate 許容の指針）
- `.opencode/skills/agentdev-project-extensions/SKILL.md`（公開契約宣言と詳細契約の分離フロー）

### 対象外

- REQ-0119-034（同一契約再定義抑止）自体の見直し
- inspect-skills の検出ロジック改修（別 Issue で検討）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| spec | docs/specs/responsibilities/artifact-responsibilities.md | REQ-0147-001 の適用事例（project extensions boilerplate）を追記 |
| spec | docs/specs/responsibilities/command-authoring-standards.md | boilerplate 許容の指針（公開契約宣言 vs 詳細契約の分離）を整理 |
| skill | .opencode/skills/agentdev-project-extensions/SKILL.md | 公開契約宣言と詳細契約の分離フローを明記 |

## 既存対策確認

- **確認結果**: あり（部分的）
- **該当ファイル**: docs/specs/responsibilities/artifact-responsibilities.md（REQ-0147-001 重複許容基準）
- **ギャップ分類**: application miss
- **ギャップ詳細**: REQ-0147-001 の重複許容基準は存在するが、適用事例が SPEC に未蓄積のため、今後同様の boilerplate 重複発生時に都度判断が必要。PR #1534 では boilerplate 4行を「公開契約宣言」と「詳細契約」に分離し前者を許容・後者を skill 参照とする判断基準を適用したが、SPEC に事例として蓄積されていない。

## 制約

- REQ-0119-034（同一契約再定義抑止）と REQ-0147-001（重複許容基準）の両立関係を損なわない。
- 「公開契約宣言」の範囲（何行まで許容するか等）を明確化し、運用上の曖昧性を除去する。
- command-authoring-standards.md のパスは extension 経由で確認の上、対象とする（本成果物の段階では見込みパス）。

## 受け入れ条件

- [ ] artifact-responsibilities.md SPEC に REQ-0147-001 の適用事例（project extensions boilerplate）が追記されている
- [ ] 「公開契約宣言」と「詳細契約」の分離判断基準が標準化されている
- [ ] command-authoring-standards.md（※パスは extension 経由で確認）に boilerplate 許容の指針が整理されている
- [ ] agentdev-project-extensions SKILL.md に公開契約宣言と詳細契約の分離フローが明記されている

## 元learning item / 根拠

- **要約**: SPEC 重複許容基準（REQ-0147-001）の適用事例が SPEC に未蓄積。15 command の project extensions boilerplate 重複を許容する判断基準が毎度必要。
- **根拠**: inbox#6 (Issue #1532, PR #1534): 15 command の同一4行 boilerplate が REQ-0119-034 に形式違反だが REQ-0147-001 例外基準に該当。boilerplate 4行を「公開契約宣言」（許容）と「詳細契約」（skill 参照）に分離する判断基準を適用
- **再発条件**: 複数 command で同一の手順・宣言・boilerplate が重複し、SPEC 例外基準（SKILL ↔ command 同一ルール等）への該当性を判断する必要がある場合
- **横展開可能性**: 今後同様の「複数 command で同一の公開契約宣言」が発生した場合に毎回直面

## 推奨Issue分類

- **分類**: feature（SPEC への適用事例追記）
- **推奨ラベル**: enhancement, documentation
- **関連Issue**: Issue #1532, PR #1534, REQ-0119-034（例外規定）, REQ-0147-001（SPEC 重複許容基準）
