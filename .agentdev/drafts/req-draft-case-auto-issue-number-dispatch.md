---
draft_type: req-draft
topic-slug: case-auto-issue-number-dispatch
status: saved
created: "2026-06-18"
---

# case-auto Issue番号/URL 入力による case-run 移行

## draft-meta

- work_type: feature
- req-operation: APPEND
- target-req: REQ-0114
- adr-required: false
- adr-judgment: ADR不要。既存の orchestration architecture（ADR-0114: case-auto orchestration / driver委譲モデル）を維持しつつ、case-auto の入力タイプと分岐先を拡張する。アーキテクチャ決定ではなくコマンドの振る舞い要件。Step 5-1 ADR禁止ゲート: REQ相当（振る舞い要件）。Step 5-3 作業手段ADR拒否ゲート: 該当なし（削除・廃止・移行を主題としない）。Step 5-0 既存ADR重複確認: ADR-0114 は orchestration model が主題であり、入力タイプ拡張と重複しない。
- topic-slug: case-auto-issue-number-dispatch
- scale: standard
- status: saved

## 目的

`/agentdev/case-auto` は現在、要件doc（明示パス / draft自動検出 / セッション内要件doc）のみを入力として受け付け、req-save または case-open から case-close まで自走する。

Issue が既に作成済みの状況において、case-auto を用いて case-run → case-close まで自走したいユースケースが存在する。現状では case-run を個別に実行するしかなく、case-close までの継続が手動となる。

case-auto が数値引数（Issue番号）または Issue URL を受け取った場合、当該 Issue は既に存在する（req-save / case-open 相当処理済み）とみなし、case-run 相当処理 → case-close 相当処理の順で自走する入口を追加する。これにより、Issue 作成済みの状況でも case-auto の最大自走モードを活用できる。

## 要件

REQ-0114 へ以下の要件行を APPEND する。現状の最終ID は REQ-0114-067。

| ID | 要件 |
|---|---|
| REQ-0114-068 | `case-auto` は数値引数または GitHub Issue URL を入力として受け取ること。数値引数は GitHub Issue 番号として解釈すること |
| REQ-0114-069 | 数値引数または Issue URL が入力された場合、既存の入力解決（REQ-0114-002 の明示パス / draft検出 / セッション内要件doc）より優先して処理すること |
| REQ-0114-070 | 数値引数または Issue URL が入力された場合、req-save 相当処理および case-open 相当処理をスキップし、case-run 相当処理 → case-close 相当処理の順で実行すること |
| REQ-0114-071 | 数値引数または Issue URL 入力時、case-run 相当処理に入力された Issue 番号/URL をそのまま渡すこと。draft-meta の読み取り（REQ-0114-010）および work_type に基づく工程分岐（REQ-0114-008 / 009）を適用しないこと |
| REQ-0114-072 | case-run 相当処理の完了後、case-close 相当処理へ進むこと。停止条件（REQ-0114-016）の検出時は既存の停止・報告手順に従うこと |

## 適用範囲

REQ-0114 の適用範囲に以下を追加する。

- **対象**（既存対象に追加）:
  - case-auto の入力タイプ: 数値引数（Issue番号）・Issue URL
  - Issue番号/URL 入力時の工程分岐（case-run 相当 → case-close 相当）
  - 入力解決の優先順位拡張（Issue番号/URL が最優先）
- **対象外**（既存対象外に追加）:
  - case-run / case-close の責務変更（既存コマンド定義をそのまま呼び出す）
  - Issue 番号/URL の妥当性検証ロジック（case-run の既存ガードレール G05/G06 に委譲）
  - 複数 Issue 番号の同時指定

## Requirement Source

- ユーザー指示: 「case-autoに数字を渡したとき、issue番号としてみなして、case-run移行を実施すること。」
- 壁打ち合意（2026-06-18 セッション）:
  - 実行範囲: case-run → case-close まで継続（最大自走モードの性質を維持）
  - 入力形式: 数値 + GitHub Issue URL 両方（case-run の入力仕様と一貫）
  - REQ操作: REQ-0114（case-auto 最大自走モード）への APPEND

## 関連ドキュメント更新候補

| 対象ファイル | 更新内容 | 分類 |
|---|---|---|
| `docs/requirements/REQ-0114.md` | 要件表に REQ-0114-068〜072 を APPEND、適用範囲に入力タイプ追加・工程分岐追加を追記 | 変更後仕様 |
| `src/opencode/commands/agentdev/case-auto.md` | Input セクション・Step 1（入力解決）・Step 3（工程分岐）に Issue番号/URL 入力と case-run移行モードを追加 | 反映作業 |
| `src/opencode/commands/agentdev/README.md` | case-auto の Primary Input 欄に「Issue番号/URL」を追加 | 反映作業 |
| `docs/guides/command-selection.md` | case-auto の入力説明に Issue番号/URL を追加（既存記載がある場合） | 反映作業 |

## operation_units

```yaml
operation_units:
  - ou_id: OU-01
    source_ru: null
    target_req: REQ-0114
    operation: APPEND
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_req_docs:
        - REQ-0114
      operation_mapping:
        OU-01:
          operation: APPEND
          target_req: REQ-0114
          saved_doc: docs/requirements/REQ-0114.md
          appended_ids:
            - REQ-0114-068
            - REQ-0114-069
            - REQ-0114-070
            - REQ-0114-071
            - REQ-0114-072
          scope_updated: true
      source_ru_mapping: {}
      case_open_input:
        target_req: REQ-0114
        work_type: feature
        scale: standard
        issue_policy: single
```

## execution_groups

```yaml
execution_groups:
  - id: EG-01
    type: standard
    purpose: case-auto Issue番号/URL 入力による case-run移行モード追加
    included_ou:
      - OU-01
    rationale: 単一REQ（REQ-0114）への APPEND。依存関係なし。1 Issue で完結する。
```
