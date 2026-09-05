---
title: RU / 採用済み成果物 / draft ライフサイクル
status: accepted
created: 2026-06-21
updated: 2026-09-05
---
<!-- ADF-COVERS(implementation): REQ-001-034, REQ-001-043 -->
<!-- ADF-COVERS(implementation): REQ-008-001, REQ-008-002, REQ-008-003, REQ-008-004, REQ-008-005, REQ-008-006, REQ-008-007, REQ-008-008, REQ-008-009, REQ-008-010, REQ-008-011, REQ-008-012, REQ-008-013, REQ-008-014, REQ-008-015, REQ-008-016, REQ-008-017, REQ-008-018, REQ-008-019, REQ-008-020, REQ-008-021, REQ-008-022, REQ-008-023, REQ-008-024, REQ-008-025, REQ-008-026, REQ-008-027, REQ-008-028, REQ-008-029, REQ-008-030, REQ-008-031, REQ-008-032, REQ-008-033, REQ-008-034, REQ-008-035, REQ-008-036, REQ-008-037, REQ-008-038, REQ-008-039, REQ-008-040, REQ-008-041, REQ-008-042, REQ-008-043, REQ-008-044, REQ-008-045, REQ-008-046, REQ-008-047, REQ-008-048, REQ-008-049, REQ-008-050, REQ-008-051, REQ-008-052, REQ-008-053, REQ-008-054, REQ-008-055, REQ-008-056, REQ-008-057, REQ-008-058 -->

# RU / 採用済み成果物 / draft ライフサイクル

> 本 Design は intake / learning / inspect / backlog パイプラインにまたがるアーティファクトライフサイクル契約を定義する。
> 個別コマンドの動作は各 command Design を参照。

## 目的

採用済み成果物 → RU → REQ / Issue → RU 削除、という成果物ライフサイクルと、関連中間アーティファクト（draft、検出事項、backlog draft）のライフサイクルを定める。

## ライフサイクル概観

```
採用済み成果物 → RU → REQ / Issue → RU 削除
```

| 成果物 | 生成コマンド | 読取りコマンド | 削除トリガー |
|---|---|---|---|
| 採用済み成果物（intake） | `intake-promote` | `backlog-review` | RU 化成功時 |
| 採用済み成果物（learning） | `learning-promote` | `backlog-review` | RU 化成功時 |
| 採用済み成果物（inspect） | `inspect-promote` | `backlog-review` | RU 化成功時 |
| RU（Requirement Unit） | `backlog-review` | `req-define`, `req-save`, `case-open` | case-open の Issue作成 + VERIFY 成功時（REQ-008-012, REQ-008-015） |
| REQ ファイル | `req-save` | `case-open`, `case-run`, `case-close` | なし（永続） |
| 追跡Issue | `issue`（起票）、各 workflow | `issue`、`req-define`（実行確定時の要件化経路） | なし（永続） |
| Case Issue | `case-open` | `case-run`, `case-close` | なし（永続） |

## RU（Requirement Unit）

- 配置先: `.agentdev/backlog/req-units/RU-*.md`
- 粒度: N:1（複数 artifact → 1 RU 統合）および 1:N（1 artifact → 複数 RU 分割）を許可（REQ-008）
- 採用済み成果物 の単純コピー（パススルー）は禁止（REQ-008）
- 矛盾検出時: 矛盾する artifact を RU 化せずユーザーに確認。矛盾しない artifact は通常通り RU 化（partial success）
- `case-open` での Issue作成 + VERIFY 成功後に該当 RU を削除（REQ-008-012, REQ-008-015）。`req-save` は RU を削除せず、RU 削除を行う唯一のコマンドは `case-open` である

## 採用済み成果物（Promoted Artifact）

| パイプライン | 配置先 | 構造 |
|---|---|---|
| intake | `.agentdev/intake/promoted/` | フラット（`*.md`） |
| learning | `.agentdev/learning/promoted/` | フラット（`*.md`） |
| inspect（自動 promote 含む） | `.agentdev/intake/promoted/` または `.agentdev/inspect/promoted/` | フラット（`*.md`） |

- サブディレクトリへのルーティングは行わない（フラット構造）
- intake-promote は inbox から直接読み取り、内部でレビュー、HITL確認後に採用済み成果物を `promoted/` へ保存し、元 inbox item を削除する（`archive/promoted/` への移動は行わない）
- learning-promote は inbox.md + deferred.md から読み取り、内部で normalize/classify/eval、HITL確認後に採用済み成果物を生成
- inspect-promote は inbox（検出事項）から読み取り、分類（promote/defer/reject）、HITL承認後に採用済み成果物を生成。`--auto` は高確信度の検出事項を HITL 承認なしで自動投入する
- RU 生成に成功した採用済み成果物は `backlog-review` が削除（REQ-008）

## 追跡Issueからの要件化経路

追跡Issueで実行が確定した場合、正規の要件化・設計経路（req-define 経由）を通って Case Issue 化する（REQ-049-005）。
RU が採用済み成果物（intake / learning / inspect）からの要件化経路であるのに対し、追跡Issueは未解決事項の育成管理からの要件化経路であり、両者は別系統である。

```
追跡Issue（実行準備完了） → req-define（要件doc） → req-save / design-save → case-open（Case Issue 作成）
```

- 追跡Issueを実行票（Case Issue）へ直接変質させない。case-open は追跡Issueとは別の Case Issue を作成する
- 生成された Case Issue の本文には元追跡Issueへの参照形式（`Tracking: #N`）を記録する（形式の定義は case-open Design「Case Issue 本文の元追跡Issue参照形式」節が所有する）
- 追跡Issue側は本文標準構造の関連 Case Issue への参照セクションで生成された Case Issue を追跡する（論理スキーマの正は agentdev-issue-tracking Design）
- 追跡Issueは要件化経由後もクローズせず、解決結論と反映状態で追跡を継続する（クローズは必要な反映の完了または反映不要の確認を条件とする）

## バックログドラフトプロトコル（Backlog Draft Protocol）

`intake-from-github` と `backlog-review` 間のバックログdraftのライフサイクルとスキーマ。

### draft ライフサイクル

```
draft → approved → RU化 + 削除
```

### draft frontmatter

```yaml
---
period: "{since} 〜 {until}"
period-slug: "{period-slug}"
status: draft | approved | issued
created: "{YYYY-MM-DD}"
sources:
  - type: issue | pr
    number: {N}
    closed_at: "{YYYY-MM-DD}"
---
```

### コマンド間責務

| 責務 | コマンド |
|---|---|
| 抽出、分類、解消チェック | `intake-from-github` |
| ドラフト保存 | `intake-from-github` |
| 採用済み成果物生成 | `intake-promote` |
| RU 生成 | `backlog-review` |
| backlog-extractedコメント投稿 | `backlog-review` |

## 検出事項プロトコル（Finding Protocol）

### 検出事項の位置づけ

要件レビュー検出事項（requirements review finding）は要件体系の再構成候補を一時的に保持する中間アーティファクトである。

- 保存先: `.agentdev/drafts/requirements-review-finding-{topic-slug}.md`
- 次工程: req-define の明示入力ファイルとして渡される

### 検出事項 frontmatter

```yaml
---
finding_type: SPLIT | MOVE | RETIRE | DUPLICATE | OBSOLETE | DRIFT
source_req: REQ-{NNN} | null
source_command: req-save
topic_slug: {topic-slug}
created: "{YYYY-MM-DD}"
---
```

### 検出事項種別

| 種別 | 説明 | 検出タイミング |
|---|---|---|
| `SPLIT` | 要件が膨張、関心分離の基準に該当し分割が必要 | req-save SPLIT検出時 |
| `MOVE` | 要件が別REQに移動すべき | requirements review時 |
| `RETIRE` | 要件が不要になり廃止すべき | requirements review時 |
| `DUPLICATE` | 複数REQ間で要件が重複 | requirements review時 |
| `OBSOLETE` | 要件が既に古く現在のシステムに適合しない | requirements review時 |
| `DRIFT` | 要件と実装の間に乖離が生じている | requirements review時 |

## inspect-promote 自動 promote

`/agentdev/inspect-promote --auto` は、高確信度の検出事項（inspect finding）を HITL 承認を経ずに intake/backlog パイプラインへ流入させる（REQ-001-016, REQ-010-010）。
コマンドは判定表を重複保持しない。
詳細手順は `docs/designs/commands/inspect-promote.md` 参照。

### 自動 promote 対象カテゴリ

自動 promote は「機械的に特定可能で、移行先 Design が一意に定まり、意味判断を要しない」高確信度 finding に限定する。
`--auto` は明示 opt-in であり、省略時は手動分類フローのみ動作する。

| カテゴリ | 自動 promote 対象 | 自動 promote 対象外（手動分類へ） |
|---|---|---|
| Design分離基準違反（high-specificity） | 具体的証拠を伴う Step 番号、スキーマフィールド、enum 一覧、テストデータ詳細、作業履歴など、移行先が Design/コマンドリファレンス に一意に定まるもの | 安定契約例外（REQ-001-068）、否定文脈、判定表、内部パラメータなど意味解釈を要するもの |
| 構造的即時是正 | リンク切れ、旧名前空間（namespace）残存など、正解が一意で破壊的でない修復 | - |
| 命名、分類の意味判断 | - | SPLIT/MERGE/MOVE/RETIRE/DRIFT 判断、scope 決定、優先度付け（全件手動） |
| Decision 要否判断 | - | Decision閾値判定を含む finding（全件手動） |

自動 promote 対象外の finding は `--auto` 指定時でも手動分類フロー（HITL 承認）に回し、自動投入しない。

### 投入先、成果物形式

- 投入先: `.agentdev/intake/promoted/inspect-auto-{timestamp}-{slug}.md`（フラット構造）
- backlog-review は既存の intake 採用済み成果物と同様に読み込み、RU 化対象として処理する
- 自動投入された元 finding の inbox file は、手動 promote と同様に削除する

### 実行ログ

`--auto` 実行の都度、投入対象を `.agentdev/inspect/promoted/auto-promote-log.md`（append-only）に記録する。

```markdown
## {YYYY-MM-DD HH:MM} auto-promote run

- source finding: .agentdev/inspect/inbox/{file}
- category: {自動 promote 対象カテゴリ}
- destination: .agentdev/intake/promoted/inspect-auto-{timestamp}-{slug}.md
- evidence: {finding が提示した証拠の要約}
- exempt check: 安定契約例外/否定文脈でないことを確認した旨
```

ログは git 管理対象（`.agentdev/inspect/promoted/` 配下）。
各実行のトレーサビリティと誤検知検出の証跡とする。

### 誤検知 revoke 手順

自動 promote された finding が誤検知と判明した場合、以下の手順で revoke する。
revoke は人間の判断により行う。

1. 対象の投入先ファイル `.agentdev/intake/promoted/inspect-auto-*.md` を特定する（`auto-promote-log.md` のエントリから追跡）
2. 当該ファイルが backlog-review により未処理（RU 未生成）の場合: ファイルを削除し、元 finding を `.agentdev/inspect/inbox/` に戻す
3. 当該ファイルが backlog-review により既に RU 化済みの場合: 生成された RU を `.agentdev/backlog/req-units/` から削除し、要件化されていないことを確認する。要件化（REQ/Issue 化）が既に進行している場合はユーザーに停止を依頼する
4. `auto-promote-log.md` の該当エントリに `status: revoked` と revoke 理由を追記する
5. 同種の誤検知が再発しないよう、誤検知となった判定根拠を docs-check rule / IR の false positive 抑制へフィードバックする候補として記録する（intake 経由または PR 本文の Findings セクション）

### 分類確定状態の再構成規則（durable state からの復元）

inspect-promote は会話コンテキストに依存せず、durable state から検出事項ごとの分類確定状態を再構成する。
再構成規則は次のとおり。

| durable state の観測 | 分類確定状態 | 再開時の取扱い |
|---|---|---|
| `.agentdev/inspect/inbox/` に残存 | 未確定 | 暫定分類（STEP-3 相当）から再開する |
| `.agentdev/inspect/promoted/` に保存済み | promote 確定 | 再保存しない |
| auto-promote-log に記載済みかつ `.agentdev/intake/promoted/inspect-auto-*.md` が存在 | 自動 promote 確定 | 再投入しない |
| inbox から削除済み | reject 確定 | 復元しない |
| inbox 残置かつ処理実行済みの報告がある | defer 確定 | 再分類しない |

HITL 承認状態は処理実行（promote / reject / defer の実行 STEP）の完了状態から逆算して再構成する。
処理実行が済んでいない検出事項は承認未了と扱い、HITL 確定から再開する。
自然言語の前 STEP result のみに依存した再開を行わない。

## REQ ファイル整合性検査（横断）

req-save と case-close で共通利用される REQ ファイル整合性検査の契約。

### 検証項目

| チェック対象 | 検証内容 | 自動修正 |
|---|---|---|
| docs/requirements/ 配下のファイル | 全REQファイルが存在するか | 欠落ファイルは警告のみ |
| docs/requirements/README.md インデックス | 全REQファイルがテーブルに記載されているか | 未記載のREQをテーブルに追加 |
| docs/README.md ドキュメントハブ | 全REQファイルがリンクとして記載されているか | 未記載のREQをリンクとして追加 |
| REQ frontmatter id | ファイル名と一致するか | エラーとして報告（自動修正しない） |

### 実行タイミング

- `req-save` Step 7: 自動修正あり
- `case-close` Step 3: 検証のみ（自動修正は行わない）

## README 索引影響規則

REQ CREATE / APPEND / UPDATE 時に各 README（`docs/README.md`、`docs/requirements/README.md` 等）への索引影響を確認する（REQ-001）。

### 影響確認フロー

1. REQ操作実行時、対応する README 索引に該当エントリが存在するか確認
2. 影響がある場合は同一変更内で更新
3. 影響がない場合は更新不要
4. 更新が必要だが作業範囲を超える場合、REQ保存は中止せず後追い課題（follow-up）として明示

### 影響確認対象

| 操作 | 確認対象 |
|---|---|
| REQ追加時 | `docs/requirements/README.md`, `docs/README.md` |
| Decision追加時 | `docs/decisions/README.md`, `docs/README.md` |
| Design追加/分割/削除時 | `docs/designs/README.md` |

### 矛盾時の優先順位

README 索引と基準（REQ/Decision/Design）が矛盾する場合、基準を優先し README 索引を修正対象とする。

## REQ 再構成検出

REQ保存処理中にREQ体系上の歪みを検知した場合、REQ再構成intakeとして保存する（REQ-037）。

### 検知カテゴリ

| 観点 | 説明 |
|---|---|
| SPLIT | 単一REQの責務が肥大化、複数REQへの分割が適切 |
| MERGE | 複数REQが同じ興味対象を重複してカバー、統合が適切 |
| MOVE | REQの要件行やセクションが別REQにより適切に配置される |
| DUPLICATE | 異なるREQ間で要件内容が重複 |
| RETIRE | 対象REQが不要化、廃止が適切 |
| DRIFT | REQの記述が現在の実装や仕様から乖離 |

### 検知時の扱い

検知はSHOULD。
検知時は通常のREQ保存処理を妨げず、非同期に保存する。

## artifact_actions ベース工程分岐

case-auto / case-open / req-save / design-save の工程分岐は `work_type` の固定分岐ではなく、req_draft の `artifact_actions` 存在に基づく動的判定とする（v2:ADR-0123, REQ-001-014）。

- `req-save` は `artifact_actions` に `artifact: req` または `artifact: decision` の entry が含まれる場合に実行する（`work_type` に依存しない）
- `design-save` は `artifact_actions` に `artifact: design` の entry が含まれる場合に実行する（`work_type` に依存しない）
- `case-open` は `req-save` / `design-save` の後に常に実行する
- `case-auto` はパイプラインの各工程を `work_type` の固定分岐ではなく `artifact_actions` の存在から決定する
- `auto_gate` preflight: `case-auto` は `auto_gate.auto_ready` を確認し、false の場合または未解決 item が残る場合は停止する

## one-time 成果物ライフサイクル（監査台帳等）

> 本セクションは SC-003（`docs/designs/local/audit-ledger-lifecycle.md`）から移管された一般契約である。
> SC-003 は superseded 宣言済みであり、現行契約は本セクションを正とする。

one-time 成果物（監査台帳、照合表、一時分析ファイル等）は、特定監査フェーズの入力として実ファイル列挙、不整合検出、処置候補抽出を集約する中間アーティファクトであり、フェーズ横断の進捗管理台帳として恒久化しない。

一般契約は以下の4項目である。

1. **恒久化禁止**: one-time 成果物は恒久状態として扱わない。
フェーズ横断の進捗管理台帳ではなく、当該フェーズの解析結果を一時的に保持する中間アーティファクトとして位置づける。
2. **廃棄条件**: 後続入力が自足した時点で廃棄できる。
廃棄条件は (a) 次フェーズ用入力の自足性（次フェーズ対象の処置が次フェーズ用入力に過不足なく転記されていること）、(b) 移管漏れ確認（未決事項、不整合、処置候補のうち次フェーズ対象分について次フェーズ用入力への移管漏れがないこと）の両立。
3. **移管漏れ検査**: 廃棄前に移管漏れを検査する。
複数の基準（ID 網羅、内容照合）で確認し、移管漏れがないことを条件に廃棄する。
4. **git 履歴追跡**: 廃棄の事実は git 履歴で追跡できる（PR 本文への明記、git rm による削除、後続フェーズ用入力ファイルへの移行元参照記録）。

## See Also

- [workflow-contracts.md](workflow-contracts.md)（ワークフロー全体契約）
- [capture-boundaries.md](capture-boundaries.md)（キャプチャ境界）
- 各 command Design（`docs/designs/commands/`）
- `agentdev-backlog-integration` skill（採用済み成果物の統合、RU 生成）
- REQ-008（RU lifecycle）
- REQ-037（REQ 再構成 intake）
- REQ-008（構造化 req_draft 契約）
