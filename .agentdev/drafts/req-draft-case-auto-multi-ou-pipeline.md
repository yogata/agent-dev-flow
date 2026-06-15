# Draft: req-define全work_type draft保存 + case-auto Standard flow複数OU逐次処理

## 目的

req-define が全 work_type で draft ファイルを作成し、maintenance や bugfix の要件内容もファイルとして永続化する。これにより case-auto や case-open が任意の work_type の OU を入力として検出・処理できるようになり、req-define → case-auto パイプラインが work_type によって断絶しない。

あわせて case-auto が複数draftの一括検出と Standard flow の case-close 完了後に operation_units から次の OU を取得し自動的に次 OU の処理を開始するようにする。これにより複数 OU を含む draft を case-auto で一括処理でき、「最大自走」が work_type やフロー種別によらず機能する。

## 要件

### REQ-0102（要件定義・保存）: req-define 全 work_type draft 保存

| ID | 要件 |
|---|---|
| REQ-0102-NEW-1 | req-define は全 work_type（feature / bugfix / maintenance / docs_chore）で `.agentdev/drafts/req-draft-{topic-slug}.md` を作成すること |
| REQ-0102-NEW-2 | draft-meta の work_type が後続コマンドの消費パターンを決定すること（feature: req-save が消費、bugfix/maintenance/docs_chore: req-save をスキップして case-open が消費） |
| REQ-0102-NEW-3 | bugfix / maintenance / docs_chore の draft も case-open および case-auto の入力として検出・処理されること |
| REQ-0102-NEW-4 | draft 削除タイミングが全 work_type で共通であること（case-open の Issue 作成 + VERIFY 成功後） |
| REQ-0102-NEW-5 | .agentdev/README.md の drafts lifecycle が全 work_type の Producer（req-define）と Consumer（req-save / case-open）を反映していること |

### REQ-0114（case-auto 最大自走モード）: Standard flow 複数OU逐次処理

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
  - REQ-0102（要件定義・保存）: draft 保存対象の全 work_type 拡張
  - REQ-0114（case-auto 最大自走モード）: 複数draft一括処理 + Standard flow での逐次OU処理要件の追加
  - `src/opencode/commands/agentdev/req-define.md` Step 9: 「ドラフト保存不要」の撤廃
  - `src/opencode/commands/agentdev/case-auto.md` Step 1: 複数draft検出時の停止→全件処理への変更
  - `src/opencode/commands/agentdev/case-auto.md` Step 4〜8: Standard flow 完了後の次 OU 進行ループの追加
  - `.agentdev/README.md`: drafts/req-draft-*.md の Producer/Consumer 更新
- **対象外**:
  - req-save の work_type 分岐変更（req-save は引き続き feature のみ処理）
  - case-open の入力処理変更（case-open は引き続き全 work_type の draft を処理）
  - Epic flow の処理変更（Epic flow は既に逐次処理をサポート）

## Requirement Source

- RU-20260615-06（req-define 全 work_type での draft 保存）
- RU-20260615-07（case-auto Standard flow での次 OU 自動進行 + 複数draft一括処理）

## 関連ドキュメント更新候補

| 対象 | 分類 | 根拠 |
|---|---|---|
| REQ-0102 | 直接更新 | draft 保存対象要件の拡張 |
| REQ-0114 | 直接更新 | Standard flow 逐次OU処理要件の追加 |
| `src/opencode/commands/agentdev/req-define.md` | 直接更新 | Step 9 の「ドラフト保存不要」撤廃 |
| `src/opencode/commands/agentdev/case-auto.md` | 直接更新 | Step 1 + Step 4〜8 の次OU進行ループ追加 |
| `.agentdev/README.md` | 直接更新 | drafts lifecycle の Producer/Consumer 更新 |

## draft-meta

```yaml
work_type: feature
req-operation: UPDATE
target-req:
  - REQ-0102
  - REQ-0114
adr-required: false
topic-slug: case-auto-multi-ou-pipeline
scale: standard
status: saved
source-ru:
  - RU-20260615-06
  - RU-20260615-07
```

## ADR判断

ADR禁止ゲート: req-define / case-auto の動作仕様の追加・変更に該当。ADR不要。REQ更新候補。

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
    saved_req: [REQ-0102]
    operations:
      - APPEND REQ-0102-045: req-define全work_type draft作成
      - APPEND REQ-0102-046: work_type消費パターン決定
      - APPEND REQ-0102-047: bugfix/maintenance/docs_chore draft検出
      - APPEND REQ-0102-048: draft削除タイミング共通化
    source_ru_mapping: { RU-20260615-06: APPEND REQ-0102-045-048 }
    related_doc_updates: [.agentdev/README.md drafts lifecycle]

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
    saved_req: [REQ-0114]
    operations:
      - UPDATE REQ-0114-004: 複数draft検出時の停止→全件処理
      - APPEND REQ-0114-064: 全draft OU処理順序決定
      - APPEND REQ-0114-065: Standard flow次OU自動進行
      - APPEND REQ-0114-066: 次OU不在時の停止・報告
      - APPEND REQ-0114-067: 全OU完了時の全体完了報告
    source_ru_mapping: { RU-20260615-07: [UPDATE REQ-0114-004, APPEND REQ-0114-064-067] }
    related_doc_updates: [src/opencode/commands/agentdev/case-auto.md Step 1+4-8]

## execution_groups

### EG-1: case-auto batch processing improvements
- id: EG-1
- type: wave
- purpose: req-define → case-auto パイプラインの全 work_type 対応と複数OU一括処理の実現
- included_ou: [OU-1, OU-2]
- rationale: OU-1（draft全work_type保存）がOU-2（case-auto逐次処理）の前提。OU-1完了後にOU-2を実行する。
