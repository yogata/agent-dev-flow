# 工程間構造化文脈引き継ぎ（structured-stage-handoff）

AgentDevFlow の工程間（req-define → req-save → design-save → case-open → case-run → case-close、および上流工程（backlog-review 等）から req-define への接続）で引き継ぐ構造化文脈の、配布物側の直列化形式と生成・消費契約。
原本仕様は `<workflows/workflow-contracts>` Design「工程間構造化文脈引き継ぎ契約」である（Design を正とし、本参照は配布物への適用形を定める）。

## 目的

- 後工程が、前工程で確定した事項を初期文脈として利用し、同じ情報をゼロから探索、再構築する重複を原則として排除する。
- 引き継ぎを構造化しても、独立検証、鮮度確認、矛盾検出、正規成果物との整合確認を目的とする再確認は維持する。
- 引き継ぎ情報を新しい正規情報源としない（既存の SSoT 再構成を最上位とする durable state 優先順位を変更しない）。

## 直列化形式（10意味）

工程間の引き継ぎは、委譲時の構造化文脈と同一の意味集合を扱う。
委譲時の直列化形式（委譲時最小契約の入力内への直列化）の所有者は `agentdev-case-run-execution-adapter` スキルの委譲プロンプト雛形であり、本形式と意味対応を保つ。

工程間の引き継ぎでは、次のキーをトップレベルに持つ構造化ブロックを用いる。

```yaml
structured_context:
  purpose: {当該工程の目的（実行契約の要約）}
  workflow_phase: {現在の ADF 工程（req-define / req-save / design-save / case-open / case-run / case-close 等）}
  execution_unit: {現在の実行単位（Issue 番号、Wave、OU 等の識別子）}
  resolved_context:
    - {前工程で確定した事項の要約。正規情報源の参照先を付ける}
  open_items:
    - {未確定事項。判断主体・判断条件が必要な場合に付ける}
  canonical_references:
    - {当該作業で使用すべき解決済み参照先。正規原本（source）、実行時投影（projection）、双方確認の別を含む。判別は参照先解決ポリシー（references/reference-resolution.md）に従う}
  stop_conditions:
    - {停止条件。実行契約上の停止条件、既確定文書への変更要件等}
  expected_output: {期待する実行結果（成果物と受理基準の要約）}
  handoff_artifacts:
    - {後続工程へ渡すべき成果（要件doc、Issue 本文、PR 本文、保存済み正規成果物等）}
  plan_change: {計画変更を識別するための情報（前提の変化、決定事項の追加・撤回、スコープ変更）。変化なしの場合は「なし」を明示}
```

各キーは意味の最小集合であり、キーの追加は意味対応を壊さない範囲に限る。
キーの集合は `<workflows/workflow-contracts>` Design「工程間構造化文脈引き継ぎ契約」が宣言する現行ベースラインであり、
キーの削除、名称変更は Design の field 集合宣言の更新と同一 changeset で実施する変更管理対象とする
（Design が宣言する実験契約の同時変更規約に従う）。

## 生成契約（前工程の責務）

- 前工程は完了報告または次工程への委譲起動時に、構造化文脈を次工程へ渡す。
- case-auto 等の orchestrator による工程委譲では、委譲 prompt の入力内に構造化文脈を直列化する（委譲時の形式に従う）。
- 手動で次のコマンドを起動する運用では、構造化文脈は独立した受け渡し媒体を新設せず、既存の durable state（要件doc、Issue 本文、PR 本文等の正規成果物）から次工程が再構成する。
- 各フィールドの値は要約と正規参照先で構成し、全文履歴や巨大な計画本文の複製を含めない。
- canonical_references の各項目は、配布物参照において目的判別（正規原本確認、実行時投影確認、双方整合確認）を含める。判別と直列化の表記は本スキルの参照先解決ポリシー（`references/reference-resolution.md`）に従う。

## 消費契約（後工程の責務）

- 後工程は引き継がれた確定済み事項（resolved_context）を初期文脈として利用し、同じ情報をゼロから探索、再構築することを原則としない。
- 独立検証、鮮度確認、矛盾検出、正規成果物との整合確認を目的とする再確認は維持する。初期文脈の利用はこれらの再確認の実施を省略する根拠にしない。
- 未確定事項（open_items）は前工程の判断待ち状態の引継ぎとして扱い、後工程が独断で確定しない。
- 当該作業で使用すべき解決済み参照先（canonical_references）は、探索の起点として利用する。正規原本（source）と実行時投影（projection）の別の判定は、本スキルの参照先解決ポリシー（`references/reference-resolution.md`）に従う。
- 構造化文脈と durable state（正規成果物）が矛盾する場合は、正規成果物を正とし、矛盾を検出事項として報告する。

## 制約

- 引き継ぎ情報を、REQ、Decision、Design、GitHub Issue、PR 等に代わる新たな正規情報源としない。
- 引き継ぎ内容は永続的な正規成果物から再構成可能であること。会話記憶に依存する再開を許可しない。
- 引き継ぎに全文履歴または巨大な計画本文の毎回複製を含めない。
- 構造化文脈の保存、検証のために新しい成果物種別、実行履歴 DB を新設しない。
- 本参照は工程間の引き継ぎ形式の所有者であり、委譲時（実行担当サブエージェントへの委譲）の直列化形式を重複して定義しない。

## 参照

- `<workflows/workflow-contracts>` Design「工程間構造化文脈引き継ぎ契約」（原本仕様）
- `<workflows/delegation-contracts>` Design「構造化文脈引き継ぎ（委譲時）の直列化契約」（委譲時の原本仕様）
- `agentdev-case-run-execution-adapter` スキルの委譲プロンプト雛形（委譲時の直列化形式、意味対応先）
- 参照先解決ポリシー（`references/reference-resolution.md`。canonical_references の source / projection 目的判別）
- 前工程からの引き継ぎ 共通方針（agentdev_handoff、consumer リポジトリの引き継ぎ停止）
