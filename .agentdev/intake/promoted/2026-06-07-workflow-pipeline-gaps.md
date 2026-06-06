---
discovered_at: 2026-06-07
source: intake-promote inbox scan（19件一括処理）
tags: [intake, workflow-state, pipeline-gap, template-resolution]
---

# Workflow 状態・引き継ぎギャップ（状態欠損・コマンド統合検証・テンプレート解決・upstream handoff）

## 内容

case-auto/case-close/learning-promote の工程間状態引き継ぎ、promote コマンド統合の検証残、テンプレート参照解決、upstream handoff workflow に未完了項目が残存。

### 1. case-auto 工程間状態引き継ぎ不足 (from #3)

case-auto が case-open/case-close 相当処理を実行する際、工程間の状態引き継ぎが不足。3つの処理が漏れている。

未実施:
- case-open 相当処理での RU 削除
- case-close 相当処理での learning capture
- case-close 相当処理での Post-run intake capture
- workflow-contracts.md の case-auto intake 欄が `—` のまま（実際の処理と矛盾）
- REQ-0114.md に REQ-0114-023〜035 の 13 要件行が APPEND されていない可能性

**根拠**: Issue #593

### 2. Promote Command Unification 検証未完了 (from #11)

intake-review / learning-refine 廃止・promote 統合（ADR-0022）の実装後、全サブIssue の完了条件が未チェックのままクローズ。

未確認項目:
- intake-review / learning-refine の完全削除と残留確認
- intake-promote の inbox 直読み・採用/却下/保留判定・HITL 確定ステップ
- learning-promote の内部フェーズ（normalize → classify → 8-axis eval → report → HITL → 判定）
- SPEC（workflow-contracts, system, integrity-contracts）からの旧コマンド参照除去
- ADR-0010 / ガイド / DOC-MAP / README の更新
- ADR-0022 のステータスを proposed → accepted に更新（未実施）

**根拠**: Issue #618~#623

### 3. case-auto/case-close テンプレート参照解決不備 (from #17)

テンプレート参照の runtime path 修正の完了条件6項目・テスト戦略1項目が未チェックのままクローズ。

未確認項目:
- case-close.md Step 4 の Issueコメントテンプレート runtime path 明示
- case-auto.md への runtime path ルール追加（`.opencode/...` 使用、`src/opencode/...` 読み替え禁止）
- artifact-contracts.md のテンプレート種別別参照先と runtime/source path 使い分けの明文化
- commands / skills の実行時 Read / Glob 手順に `src/opencode/...` 固定参照が残らないこと
- 同種の誤探索を検出できる検証条件の定義
- case-close 実行時のテンプレート参照が正しい runtime path に解決されることの回帰テスト

**根拠**: Issue #625

### 4. Upstream handoff workflow 完了条件11項目未チェック (from #18)

upstream handoff workflow protocol（REQ-0104-017~027）の実装で完了条件8項目・テスト戦略3項目全未チェックでクローズ。

未確認項目:
- `upstream-handoff.md` の `agentdev-workflow-lifecycle` skill references/ 追加
- SKILL.md への upstream handoff 用途記載
- req-define / backlog-review / backlog-save / case-open / case-run への handoff 停止条件追加
- command 側の長文重複排除確認
- 各 command への handoff 停止条件記述の内容確認
- `upstream-handoff.md` の共通方針と各 command の停止条件の REQ 適合確認
- 全 command ファイルの grep による重複確認

**根拠**: Issue #612
