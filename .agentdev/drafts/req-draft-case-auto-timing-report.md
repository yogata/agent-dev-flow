---
draft_type: req_draft
topic_slug: case-auto-timing-report
status: saved
created_at: 2026-06-21T00:00:00+09:00
---

# draft-data

```yaml
# work_type: 既存コマンドの完了報告への情報追加（保守改善）
work_type: maintenance

# summary: case-auto 完了報告へのタイミング情報追加
summary: |
  case-auto の完了報告（正常終了・停止時の双方）に、case-auto 実行全体の開始時刻・終了時刻・所要時間を追加する。
  計測範囲は case-auto Step 1（入力解決）開始時点から Step 8（完了報告生成）時点まで。
  所要時間は全体合計のみとし、工程別内訳（req-save / spec-save / case-open / case-run / case-close）は含めない。

# auto_gate: case-auto 自走可否
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

# agreed_items: 合意された個別項目
agreed_items:
  - id: AG-001
    content: |
      case-auto の完了報告に、case-auto 実行全体の開始時刻・終了時刻・所要時間を含める。
      計測範囲は case-auto Step 1（入力解決）の開始時点から Step 8（完了報告生成）の時点までとする。
      所要時間は終了時刻と開始時刻の差分（全体合計）とし、req-save / spec-save / case-open / case-run / case-close の各工程別内訳は含めない。
      停止条件（REQ-0114-016）による中断時の報告にも、開始時刻・停止時刻・経過時間を含める。

# artifact_actions: REQ/ADR/SPEC への保存対象
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-0114.md
    target_area: 要件テーブル（REQ-0114-082, REQ-0114-083 追加）
    source_items: [AG-001]
    content: |
      | REQ-0114-082 | case-auto は実行開始時刻（Step 1 入力解決の開始時点）および完了報告生成時刻（Step 8）を記録すること |
      | REQ-0114-083 | case-auto の完了報告に開始時刻・終了時刻・所要時間を含めること（停止条件による中断時の報告を含む） |
  - id: ACT-REQ-002
    artifact: req
    operation: append
    target: docs/requirements/REQ-0114.md
    target_area: 適用範囲・対象（完了報告タイミング情報の追記）
    source_items: [AG-001]
    content: |
      適用範囲「対象」リストの末尾（「Epic Issue 本文の単一書き手制約」の後）に以下を追加:
      - 完了報告のタイミング情報（開始時刻・終了時刻・所要時間）

# conflict_resolutions: 壁打ちで解消された衝突の記録
conflict_resolutions:
  - id: CR-001
    conflict: 所要時間の粒度を全体合計のみにするか、工程別内訳も含めるか
    resolution: |
      全体合計のみとする（ユーザー確認済み）。
      理由: 工程別内訳は各サブコマンドの開始・終了を個別記録する実装コストが高く、Epic flow や複数OU処理時の集計が複雑化するため。
      開始時刻・終了時刻は case-auto 実行全体の最初と最後を記録し、所要時間はその差分とする。

# operation_units: 単一REQ操作のため1件のOU
operation_units:
  - ou_id: OU-001
    target_req: REQ-0114
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_reqs:
        - REQ-0114
      operations:
        - target: docs/requirements/REQ-0114.md
          operation: append
          items: [REQ-0114-082, REQ-0114-083]

# case_open_hints: case-open 構成生成への参考情報
case_open_hints:
  epic_needed: false
```

# summary

case-auto の完了報告にタイミング情報（開始時刻・終了時刻・所要時間）を追加する要件。

## 合意内容の要点

- **対象**: case-auto の完了報告のみ（case-close 他コマンドの報告書式は変更しない）
- **計測範囲**: case-auto Step 1（入力解決）開始時点 → Step 8（完了報告生成）時点
- **粒度**: 全体合計のみ（工程別内訳なし）
- **停止時**: 停止条件検出時の報告にも開始時刻・停止時刻・経過時間を含める
- **work_type**: maintenance（既存コマンドの報告改善）
- **操作**: REQ-0114 への APPEND（要件行2行 + 適用範囲1行追加）

## SPLIT 予兆計測結果

REQ-0114 現状77行 → APPEND後79行。SPLIT シグナル合計1（行数+1、関心+0、アーティファクト+0、SPEC違反+0）→ APPEND 許可。

## 実装影響（参考・反映作業）

- `case-auto.md` Step 1: 実行開始時刻の記録処理を追加
- `case-auto.md` Step 8: 完了報告へのタイミング情報出力を追加
- 完了報告テンプレート: case-auto 固有のテンプレート新設、または case-close 報告への追記ロジック（実装時に決定）

時刻の表示形式（タイムゾーン・フォーマット）は実装詳細であり、要件行では規定しない。
