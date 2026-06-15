# Draft: req-define 全 work_type での draft 保存

## 目的

req-define が全 work_type で draft ファイルを作成し、maintenance や bugfix の要件内容もファイルとして永続化する。これにより case-auto や case-open が任意の work_type の OU を入力として検出・処理できるようになり、req-define → case-auto パイプラインが work_type によって断絶しない。

## 要件

| ID | 要件 |
|---|---|
| REQ-0102-NEW-1 | req-define は全 work_type（feature / bugfix / maintenance / docs_chore）で `.agentdev/drafts/req-draft-{topic-slug}.md` を作成すること |
| REQ-0102-NEW-2 | draft-meta の work_type が後続コマンドの消費パターンを決定すること（feature: req-save が消費、bugfix/maintenance/docs_chore: req-save をスキップして case-open が消費） |
| REQ-0102-NEW-3 | bugfix / maintenance / docs_chore の draft も case-open および case-auto の入力として検出・処理されること |
| REQ-0102-NEW-4 | draft 削除タイミングが全 work_type で共通であること（case-open の Issue 作成 + VERIFY 成功後） |
| REQ-0102-NEW-5 | .agentdev/README.md の drafts lifecycle が全 work_type の Producer（req-define）と Consumer（req-save / case-open）を反映していること |

## 適用範囲

- **対象**:
  - REQ-0102（要件定義・保存）: draft 保存対象の全 work_type 拡張
  - `src/opencode/commands/agentdev/req-define.md` Step 9: 「ドラフト保存不要」の撤廃
  - `.agentdev/README.md`: drafts/req-draft-*.md の Producer/Consumer 更新
- **対象外**:
  - case-auto の逐次OU処理改善（→ OU-2）
  - req-save の work_type 分岐変更（req-save は引き続き feature のみ処理）
  - case-open の入力処理変更（case-open は引き続き全 work_type の draft を処理）

## Requirement Source

- RU-20260615-06（req-define 全 work_type での draft 保存）

## 関連ドキュメント更新候補

| 対象 | 分類 | 根拠 |
|---|---|---|
| REQ-0102 | 直接更新 | draft 保存対象要件の拡張 |
| `src/opencode/commands/agentdev/req-define.md` | 直接更新 | Step 9 の「ドラフト保存不要」撤廃 |
| `.agentdev/README.md` | 直接更新 | drafts lifecycle の Producer/Consumer 更新 |

## draft-meta

```yaml
work_type: feature
req-operation: UPDATE
target-req:
  - REQ-0102
adr-required: false
topic-slug: draft-all-worktypes
scale: standard
status: draft
source-ru: RU-20260615-06
```

## ADR判断

ADR禁止ゲート: command 動作仕様の定義・運用ルールの変更に該当。ADR不要。REQ更新候補。

## operation_units

### OU-1: req-define draft all worktypes
- source_ru: RU-20260615-06
- target_req: REQ-0102
- operation: UPDATE
- work_type: feature
- scale: standard
- depends_on: []
- recommended_order: 1
- issue_policy: single
- result:

### OU-2: case-auto Standard flow multi-OU
- source_ru: RU-20260615-07
- target_req: REQ-0114
- operation: UPDATE
- work_type: feature
- scale: standard
- depends_on: [OU-1]
- recommended_order: 2
- issue_policy: single
- result:

## execution_groups

### EG-1: case-auto batch processing improvements
- id: EG-1
- type: wave
- purpose: req-define → case-auto パイプラインの全 work_type 対応と複数OU一括処理の実現
- included_ou: [OU-1, OU-2]
- rationale: OU-1（draft全work_type保存）がOU-2（case-auto逐次処理）の前提。OU-1完了後にOU-2を実行する。
