# Draft: case-auto Standard flow での次 OU 自動進行

## 目的

case-auto が Standard flow の case-close 完了後に operation_units から次の OU を取得し、自動的に次 OU の処理を開始する。これにより複数 OU を含む draft を case-auto で一括処理でき、「最大自走」が work_type やフロー種別によらず機能する。

## 要件

| ID | 要件 |
|---|---|
| REQ-0114-NEW-1 | case-auto は `.agentdev/drafts/req-draft-*.md` が2件以上存在する場合、候補一覧を表示して停止するのではなく、全draftを処理対象として検出すること（REQ-0114-004の変更） |
| REQ-0114-NEW-2 | case-auto は検出した全draftの operation_units を読み取り、recommended_order と depends_on に基づいて全OUの処理順序を決定すること |
| REQ-0114-NEW-3 | case-auto は Standard flow の case-close 完了後に次 OU の draft を取得し、当該 OU の work_type に応じた工程分岐で自動的に処理を開始すること（feature: req-save → case-open → …、bugfix/maintenance/docs_chore: case-open → …） |
| REQ-0114-NEW-4 | 次 OU の draft ファイルが存在しない場合、停止し完了済み OU・未実行 OU・再開コマンドを報告すること |
| REQ-0114-NEW-5 | 全 OU の処理が完了した場合のみ全体完了報告を出力すること |
| REQ-0114-NEW-6 | 逐次OU処理中に停止条件（Step 7）を検出した場合、完了済み OU・進行中 OU・未実行 OU・再開可能な次コマンドを報告すること |

## 適用範囲

- **対象**:
  - REQ-0114（case-auto 最大自走モード）: 複数draft一括処理 + Standard flow での逐次OU処理要件の追加
  - `src/opencode/commands/agentdev/case-auto.md` Step 1: 複数draft検出時の停止→全件処理への変更
  - `src/opencode/commands/agentdev/case-auto.md` Step 4〜8: Standard flow 完了後の次 OU 進行ループの追加
- **対象外**:
  - req-define の draft 保存対象拡張（→ OU-1）
  - Epic flow の処理変更（Epic flow は既に逐次処理をサポート）
  - case-open / case-run / case-close の責務変更

## Requirement Source

- RU-20260615-07（case-auto Standard flow での次 OU 自動進行 + 複数draft一括処理）

## 関連ドキュメント更新候補

| 対象 | 分類 | 根拠 |
|---|---|---|
| REQ-0114 | 直接更新 | Standard flow 逐次OU処理要件の追加 |
| `src/opencode/commands/agentdev/case-auto.md` | 直接更新 | Step 4〜8 の次OU進行ループ追加 |

## draft-meta

```yaml
work_type: feature
req-operation: UPDATE
target-req:
  - REQ-0114
adr-required: false
topic-slug: case-auto-standard-multi-ou
scale: standard
status: draft
source-ru: RU-20260615-07
```

## ADR判断

ADR禁止ゲート: workflow定義の明確化・command動作仕様の追加に該当。ADR不要。REQ更新候補。

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
