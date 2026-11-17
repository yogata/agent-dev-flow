# 学び deferred pool（生きている learning プール）
未処理・保留中・再評価対象の learning item を保持する多状態の生きている learning プール（SHALL）。deferred（11廃棄判定カテゴリの1つ）のエントリだけでなく、未処理・保留中・再評価対象のエントリも保持する（AG-005）。
learning-capture によって inbox.md に追記されたエントリが、learning-promote の処分判定や prune によって動的に変化する。
終端保管ではなく、次回 `/agentdev/learning-promote` 実行時に再評価の対象となる。処分済みの learning item は prune 対象となる。昇格対象の根拠は staging スタブに残す。

## エントリフォーマット（13項目 + 移動日）

```markdown

## YYYY-MM-DD: タイトル

- **問題事象**: 何が起きたか
- **発生局面**: いつ/どこで発生したか。例: 実装、CI、レビュー、デプロイ
- **検知方法**: どう検知したか。例: CI失敗、lint警告、レビュー指摘、手動確認
- **根本原因**: なぜ起きたか
- **自律対応内容**: エージェントがどう修正・回避・対応したか
- **ユーザー確認有無**: ユーザー確認が関与したか。あり/なし
- **ADR/REQ/spec影響**: ADR/REQ/specへの影響可能性。なし、または具体的な影響先
- **横展開観点**: 同種の状況への適用方法
- **再発条件**: どのような条件で再発するか
- **予防策候補**: 将来の予防方法
- **想定反映先**: 反映先。例: コマンド/スキル/テンプレート/docs
- **関連**: 関連ファイルパス、Issue番号等
- **タグ**: `#タグ1` `#タグ2`
- **移動日**: YYYY-MM-DD（learning-promote 実行日）

---
```

## 旧フォーマット互換

過去のエントリ（5項目形式: 事象/原因/対策/関連/タグ）は learning-promote 実行時に正規化される。

正規化マッピング:
- 状況/事象 → 問題事象
- 原因 → 根本原因
- 解決策/対策/教訓 → 自律対応内容（解決策・対策）/ 予防策候補（教訓）

## Prune ポリシー

deferred.md は append-only ではなく、以下のタイミングでエントリが削除される:
- **promote 内部分析フェーズ時 prune**（MAY）: 長期間再発していない単発レアケース。ただし判断基準・技術知識・プロジェクト固有知識を含む learning item は削除不可
- **promote 時 prune**（SHALL）: staged / rejected / duplicate の learning item。deferred/未処理/再評価対象の learning item は削除不可（REQ-003-006/REQ-003-007）

**注意**: learning-refine は廃止済み（v2:REQ-0105-051、v3.0.0 移行で v2 REQ は物理削除済み。AG-010 の v2: 表記で参照維持）。refine 機能は learning-promote に統合されている。

---
