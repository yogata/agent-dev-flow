# 配布依存境界 gate の baseline 比較運用の明文化

## 背景

配布依存境界 gate の baseline 比較運用（退避物の形式・合否判定基準）が未文書化で、比較手段の誤りと判定基準の曖昧さが2件で観測された。

## 問題

(1) baseline 退避物（ok/failures/stats 形式のスナップショット）を delta 検査用 BaselineFile（entries 形式）を期待する `--delta` に渡すと cannot load baseline で拒否される（形式非互換。baseline 比較は gate レポート突合経路が現契約）。(2) gate の scanned_files 数は環境差（main 側 junction 投影の走査差等）で変動するため、scanned 差（380 vs 381）を単独で不合格根拠にすると誤判定し得る（failures 数一致〔0/0〕と rules 層 303 件一致を判定根拠にすべき）。

## 望ましい変更

checker 実行契約・配布依存境界 Design の運用注記に (a) baseline 退避物と BaselineFile の役割分離（退避=比較証跡、BaselineFile=delta 入力）と形式、(b) 合否判定基準（failures 一致 + 分類層件数の一致。scanned 差は不合格根拠にしない）を明記する。

## 対象範囲

### 対象

- docs/designs/integrity/checker-execution-contracts.md
- docs/designs/integrity/distribution-boundary.md（運用注記）

### 対象外

- gate・delta 検査の実装仕様変更（形式・コマンド体系は現行維持）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| Design | docs/designs/integrity/checker-execution-contracts.md | baseline 比較運用（形式・判定基準）の注記 |
| Design | docs/designs/integrity/distribution-boundary.md | baseline 退避物と BaselineFile の役割分離の注記 |

## 既存対策確認

- **確認結果**: 既存対策なし（運用注記なし）
- **該当ファイル**: なし
- **ギャップ分類**: fix gap
- **ギャップ詳細**: --delta の入力形式と退避物比較経路・判定基準が文書化されていない

## 制約

- gate の出力形式・delta 実装は変更しない

## 受け入れ条件

- [ ] baseline 退避物と BaselineFile の役割分離と形式が明記される
- [ ] 合否判定基準（failures 一致 + 分類層一致）が明記される

## 元learning item / 根拠

- **要約**: gate baseline 比較運用の未文書化（形式非互換 1件・判定基準 1件）
- **根拠**: Case #3424・PR #3437（cannot load baseline・gate レポート突合で比較）、Case #3429・PR #3436（scanned 380 vs 381 の走査差を不合格根拠にせず failures 0/0 と rules 層 303 一致で判定）
- **再発条件**: baseline 退避物を --delta に渡す場合、scanned 件数差のみで合否判定する場合
- **横展開可能性**: gate baseline 比較を実施する case-run/case-close 全般

## 推奨Issue分類

- **分類**: docs
- **推奨ラベル**: documentation
- **関連Issue**: なし
