---
title: review_dispositions の producer 契約とフィールドスキーマ
status: accepted
created: "2026-11-19"
updated: "2026-11-19"
---

<!-- 親: docs/designs/commands/req-define.md から参照される詳細仕様（遅延読み込み）。 -->

# review_dispositions の producer 契約とフィールドスキーマ

## review_dispositions の producer 契約

req-define は `review_dispositions` の producer である。
要件doc生成で壁打ち過程の採否判断を `draft-data` の `review_dispositions` へ出力する。

### 出力義務

req-define は以下の入力項目について disposition を記録する:

| 記録対象 | 内容 |
|---|---|
| 採用しなかった入力 | RU、inbox item、セッション会話から採用を見送った項目 |
| 既存要件で充足済みの入力 | 既存 REQ、既存 Design、同意済み artifact_actions で既に満たされている項目（disposition: `covered`） |
| 一部のみ採用した入力 | 項目の一部を採用し、残部を採用しなかったもの（disposition: `partially_covered`） |

`review_dispositions` は optional な soft-contract であり（DEC-003）、欠落時に後続工程が draft を拒否しない。
covered 項目だけで構成される Issue や PR を作成しない方針を維持する。

### 未決事項の取扱い

未決事項（未解決質問、未解決衝突、repo 外操作要否等）は disposition で代替せず、`auto_gate` の `unresolved_questions`、`unresolved_conflicts`、`out_of_repo_operations`、`stop_reasons` へ記録する。
disposition は確定した採否判断のみを保持する。

### 根拠不足時の取扱い

disposition の `evidence` に根拠（path、section）を設定できない場合、または根拠が曖昧な場合は `auto_gate.auto_ready: false` とし、`stop_reasons` へ根拠不足の旨を記録する。
根拠不足のまま draft を完成させてはならない。

`evidence.checked_at_commit` は req-define 生成時 `null` とする（req-define は git 操作を実行しない）。
default branch 最新化後の evidence 再確認は consumer（case-open）の責務である。

## draft-data review_dispositions フィールドスキーマ

要件定義で `review_dispositions` を出力する場合のシリアライズ形式を定義する。
スキーマの正規所有先は [artifact-contracts.md](../responsibilities/artifact-contracts.md)「review_dispositions 構造」節である。
本節は req-define 固有の出力形式を規定する。

### review_dispositions 項目構造

各 disposition エントリは以下の field を持つ:

| field | 型 | 必須 | 説明 |
|------|------|------|------|
| id | string | 必須 | `RD-NNN` 形式（NNN は連番） |
| source_ru | string | optional | 単一の元 RU-ID（RU 入力でない場合は省略可） |
| source_item | string | 必須 | 単一の元項目識別子（RU 内の要件行 ID 等。複数指定不可） |
| disposition | enum | 必須 | `covered` / `partially_covered` / `rejected` / `not_applicable`。必要に応じて `superseded` / `stale_target` を追加 |
| reason_code | string | 必須 | 判断理由のコード |
| reason | string | 必須 | 人間可読の判断理由本文 |
| evidence | object | 必須 | 根拠。`path`、`section`、`checked_at_commit` を持つ。`checked_at_commit` は生成時 `null`（req-define は git 操作を実行しない） |
| related_removed_items | list | optional | 本判断により除外された関連項目の識別子リスト |

1 disposition エントリ = 単一 `source_ru` + 単一 `source_item` の組み合わせとする（重複禁止）。

### YAML 表現形式

```yaml
review_dispositions:
  - id: RD-001
    source_ru: RU-NNN
    source_item: RU-NNN.req-001
    disposition: covered
    reason_code: already_satisfied
    reason: |
      REQ-002 が既に当該要件を保持しているため採用を省略した。
    evidence:
      path: docs/requirements/REQ-002.md
      section: REQ-002-045
      checked_at_commit: null  # req-define 生成時は null。case-open が確認 commit SHA を記録する
    related_removed_items: []
  - id: RD-002
    source_ru: RU-NNN
    source_item: RU-NNN.req-002
    disposition: rejected
    reason_code: out_of_scope
    reason: |
      本 draft の対象範囲外のため採用しない。
    evidence:
      path: null
      section: null
      checked_at_commit: null
    related_removed_items: []
```

### checked_at_commit 運用

`evidence.checked_at_commit` は req-define 生成時 `null` とする（req-define は git 操作を実行しない）。
case-open が default branch 最新化後に evidence の path/section を再確認し、確認時の commit SHA を当該フィールドへ記録する。
根拠失効時は `covered` のまま起票せず `stale_target` または再評価対象として停止する。

### 後方互換性

`review_dispositions` は optional な soft-contract である。
本フィールドを持たない旧ドラフトを Definition 保存内部責務（case-ready / case-revise）、case-open は入力として拒否しない（DEC-003 準拠）。
