# Skill reference ファイル群に固定 REQ/ADR 参照が残存

## 観測内容

配布対象 skill の reference ファイルに、固定 REQ/ADR 参照（REQ-0103-079 違反候補）が残存している。PR #802 でスコープ外として明示的に「intake候補（次回クリーンアップ対象）」と分類された。

残存対象（2026-06-17 grep 確認済み）:

1. `src/opencode/skills/agentdev-command-authoring/references/command-authoring-standards.md`
   - REQ-0119-005/006（Step 表記ルール記述箇所, line 75, 88）
   - REQ-0111-004（セマンティクス維持確認箇所, line 125）※ REQ-0111 は retired
   - ADR-0112 §4/§5/§6（委譲定義確認セクション, line 396-550）

2. `src/opencode/skills/agentdev-workflow-lifecycle/references/upstream-handoff.md`
   - REQ-0104-021（Upstream Handoff Metadata Convention 記述箇所, line 48）

## 課題

- reference ファイルが特定 REQ/ADR の要件行番号・セクション番号に結合しており、REQ/ADR の改廃時に reference 側の記述が陳腐化するリスク
- REQ-0111（retired）の要件番号を参照している箇所があり、retired REQ 参照として整合性を損なう
- reference ファイル内の REQ/ADR 引用が「ルールの出典明示」として許容されるか、固定参照として抽象化すべきかの判断が未確定

## 影響

- 中程度: 現状は動作影響なし。REQ/ADR 改廃時の陳腐化リスクと retired REQ 参照の整合性問題。

## 既存要件との関連

- REQ-0103-079: 配布物の REQ/ADR 固定参照禁止
- REQ-0103-090/099: 参照境界（command→skill の参照は skill 名レベルまで正規化）
- PR #802 は 13 reference ファイル中 7 ファイルの禁止参照を是正済み。上記 2 ファイルは対象外として残置。

## 対応方向の候補

- reference ファイル内の固定 REQ/ADR 参照をプレースホルダー（{REQ-ID} 等）または自然文に置換
- ADR-0112 の §番号参照をセクション名レベルへ抽象化
- ただし reference ファイルがルールの出典を明示すること自体の可否は backlog-review で判断

## 根拠

- 観測元: PR #802「fix(skill-refs): remove forbidden references from distributed skill files (#801)」Findings / Capture候補セクション
- intake item: `.agentdev/intake/archive/promoted/2026-06-17-skill-ref-fixed-req-adr-refs.md`
