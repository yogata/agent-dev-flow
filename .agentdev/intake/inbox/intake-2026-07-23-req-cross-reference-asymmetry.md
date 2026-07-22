# REQ 相互参照片方向欠落: 横断チェック候補

## 由来
- PR #1745 (squash merge: ba81ecd6), Issue #1738, Epic #1736 Wave 1
- PR 本文 Findings/docs-integrity セクション記載
- PR #1745 で REQ-0155 側へ REQ-0156 相互参照を補完

## 現状

REQ-0155 の関連 REQ セクションに REQ-0156 が欠けていた（片方向参照）。REQ-0156 側の関連 REQ には REQ-0155 が既に含まれていた。

- 修正前: REQ-0155 → (REQ-0156 記載なし)、REQ-0156 → REQ-0155
- 修正後: REQ-0155 → REQ-0156、REQ-0156 → REQ-0155（双方向）

相互参照の片方向欠落は他の REQ ペアでも発生する可能性があり、横断チェック候補。

## 候補内容

REQ ファイル群の関連 REQ セクションの対称性を検証する仕組みを導入:

### 選択肢 A: inspect-docs での手動確認
- 既存の inspect-docs パターンに「REQ 相互参照対称性」を追加
- メリット: 既存 pipeline 活用
- デメリット: 手動実行依存、自動検出なし

### 選択肢 B: check_changed_docs.ts へのルール追加
- REQ 変更時に相互参照対称性を自動チェック
- メリット: PR 単位で自動検出
- デメリット: 実装コスト、誤検知リスク

### 選択肢 C: 現状維持
- 個別 PR 単位で都度修正
- メリット: コスト最小
- デメリット: 漏れ発生リスク

## 想定反映先
- `.opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts`（ルール実装時）
- または inspect-docs 手動確認

## 優先度
low（文書品質、機能影響なし）

## 関連
- Epic #1736 Wave 1: Issue #1738, PR #1745
- REQ-0155, REQ-0156
