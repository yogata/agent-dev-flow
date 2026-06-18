---
id: REQ-0102
title: "要件定義・保存（req-define 入力優先順位明確化）"
created: "2026-06-18"
updated: "2026-06-18"
---

## 目的

`req-define` を引数なしで単体実行した場合、入力解決の優先順位が不明確であり、セッション履歴・現在コンテキストの合意が十分にあるにもかかわらず RU 自動検出が先に処理されるリスクがある。本要件は、入力解決の優先順位（セッション履歴・現在コンテキスト → RU 自動検出 → 壁打ち対話）を明確化し、実行エージェントが正しい入力ソースから処理を開始することを担保する。

## 要件

| ID | 要件 |
|---|---|
| REQ-0102-001 (UPDATE) | `req-define` は当該セッション履歴・現在コンテキスト、明示入力ファイル、RU、ユーザーとの対話を受け入れること |
| REQ-0102-058 (APPEND) | `req-define` は引数なし単体実行時、RU 自動検出に進む前に当該セッション履歴・現在コンテキストを Requirement Source 候補として評価すること |
| REQ-0102-059 (APPEND) | 当該セッション履歴・現在コンテキストから有効な Requirement Source を構成できない場合に限り、RU 自動検出に進むこと |
| REQ-0102-060 (APPEND) | 当該セッション履歴・現在コンテキストが部分的に不足し補足質問で解消可能な場合、RU 自動検出に進まず壁打ち対話を継続すること |
| REQ-0102-061 (APPEND) | RU 自動検出で 2 件以上の RU が存在する場合、候補一覧を提示し自動選択しないこと |
| REQ-0102-062 (APPEND) | 当該セッション履歴・現在コンテキストおよび RU のいずれからも有効な入力を構成できない場合、壁打ち対話を開始すること |

## 適用範囲

- **対象**:
  - `req-define` コマンドの引数なし単体実行時の入力解決仕様
  - 対象 REQ: REQ-0102（UPDATE -001 + APPEND 058-062）
  - 対象コマンド: `src/opencode/commands/agentdev/req-define.md`（Step 0 / Step 1 の優先関係明確化）
  - 対象スキル: `src/opencode/skills/agentdev-req-analysis/SKILL.md`（評価基準の補強、必要に応じて）
- **対象外**:
  - `req-define` の実装コード変更
  - `req-save` / `case-open` / `case-auto` の入力解決仕様変更
  - `req-units` の保存形式・削除タイミング変更
  - Issue 作成・PR 作成

## SPEC候補

評価6項目（要件内容・work_type・scale・ADR要否・構造化状態・適用範囲）および Confirmed/Inferred/Unknown 分類基準は、既に `req-define.md` Step 0 および `agentdev-req-analysis/SKILL.md` に存在する。新規 SPEC ファイルは不要。コマンド参照レベルの詳細は `req-define.md` Step 0 / Step 1 に配置する。

## 実装詳細（参考）

以下は case-run での実装作業参考情報。要件行には含めない。

- `req-define.md` Step 0: セッションコンテキスト検知の結果に応じたルーティングを明確化
  - セッション自足 → Step 2 壁打ち継続（RU 自動検出へ進まない）
  - 部分不足 → Step 2 壁打ち継続（RU 自動検出へ進まない）
  - 完全不足 → Step 1 RU 自動検出へ進む
- `req-define.md` Step 1: 「引数なしの場合」の RU 自動検出を「セッションコンテキストから有効な Requirement Source を構成できなかった場合」に限定する旨を明記

## 関連情報

- **関連 REQ**: REQ-0102（更新対象）
- **関連 ADR**: なし
- **入力 RU**: RU-20260618-01

## Update Notes

| 日付 | 対象 | 変更内容 |
|------|------|----------|
| 2026-06-18 | REQ-0102 | req-define 入力優先順位明確化の要件ドラフト作成（RU-20260618-01 に基づく） |

## operation_units

### OU-01: REQ-0102 入力優先順位要件追加
- **ou_id**: OU-01
- **source_ru**: RU-20260618-01
- **target_req**: REQ-0102
- **operation**: update, append
- **scale**: standard
- **depends_on**: (none)
- **recommended_order**: 1
- **issue_policy**: single
- **result**:
    - saved_reqs: [REQ-0102]
    - ou_operation_map: { OU-01: { target: REQ-0102, operation: "update -001 + append 058-062" } }
    - source_ru_map: { RU-20260618-01: OU-01 }
    - case_open_input: REQ-0102 (APPEND/UPDATE completed, ready for Issue creation)

## execution_groups

### EG-01: 入力優先順位要件追加
- **id**: EG-01
- **type**: wave
- **purpose**: req-define 入力優先順位の REQ-0102 への追加
- **included_ou**: [OU-01]
- **rationale**: 単一 OU のため

## draft-meta

- **work_type**: feature
- **req-operation**: update + append
- **target-req**: REQ-0102
- **adr-required**: false
- **topic-slug**: req-define-input-priority
- **scale**: standard
- **status**: saved
