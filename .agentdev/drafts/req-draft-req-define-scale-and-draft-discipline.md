<!--
draft-meta:
  work_type: feature
  scale: standard
  topic-slug: req-define-scale-and-draft-discipline
  adr-required: false
  adr-rationale: >
    コマンド動作仕様の拡張（req-define の Scale判定・draft構造規律）であり、
    技術的アーキテクチャ判断を含まない。ADR禁止ゲート「仕様変更のみ・運用ルール」に該当。
  status: saved
  created: 2026-06-17
  target-reqs: [REQ-0102]
-->

# req-define の Scale判定への実装スコープ考慮と draft 構造規律

## 目的

req-define が要件の複雑さのみで Scale を判定した結果、実装スコールが大きいにもかかわらず standard と判定され、case-auto / case-run で処理可能な範囲を超える問題を防止する。ドラフトに実装詳細が肥大化して混入することを防ぎ、要件定義部分の判読性と後続コマンドの処理可能性を確保する。

## 要件

| ID | 要件 |
|---|---|
| REQ-0102-056 | req-define は、ドラフト内の実装詳細セクション（修正候補リスト・findings catalog・影響ファイル一覧等）から実装スコープを推定し、要件の複雑さに関わらず実装スコープが大きい場合は scale: large に昇格すること。昇格の閾値は `agentdev-workflow-lifecycle` が定義すること |
| REQ-0102-057 | req-define は、ドラフトに実装詳細（個別ファイルの編集指示・修正候補リスト・findings catalog 等）が含まれる場合、当該内容を要件定義部分（要件行・acceptance criteria・適用範囲）とは分離されたセクションに配置し、要件定義部分の判読性を確保すること。実装詳細がドラフト全体の過半を占める場合は、実装詳細の要約をユーザーに提案すること |

## 適用範囲

- **対象**: req-define の Scale 判定プロセス（実装スコープシグナルの考慮）、ドラフトの構造規律（実装詳細と要件定義の分離）
- **対象外**: req-save / case-open / case-run の動作変更、scale: large 昇格後の分解計画の具体手順（既存 Step 8・10-4 が既に定義）、閾値の具体的な数値（`agentdev-workflow-lifecycle` の責務）

## Requirement Source

- セッション内議論（2026-06-17）: case-auto 実行で positive-form-documents draft（185件・70ファイル）が standard 規模のまま case-run に流入し、実装スコール超過で全面停止した事象の振り返り。改善案 A（実装スコープシグナルによる large 昇格）・B（実装詳細のdraft外切り出し）として合意

## operation_units

| ou_id | source_ru | target_req | operation | scale | depends_on | recommended_order | issue_policy | result |
|---|---|---|---|---|---|---|---|---|
| OU-1 | session-discussion | REQ-0102 | APPEND | standard | [] | 1 | separate | REQ-0102-056-057 appended |

## execution_groups

該当なし（単一 OU・standard 規模）

## 関連ドキュメント更新候補

| 対象 | 更新内容 | 根拠 |
|---|---|---|
| `src/opencode/commands/agentdev/req-define.md` | Step 8 に 8-1（実装スコープシグナル確認）追加、Step 9 に 9-1（実装詳細の分離）追加 | REQ-0102-056, 057 のコマンド步骤化 |
| `src/opencode/skills/agentdev-workflow-lifecycle/` | scale 判定基準に実装スコープシグナル（影響ファイル数・個別変更件数の閾値）を追加 | REQ-0102-056 が閾値の定義を当該 skill に委譲 |
