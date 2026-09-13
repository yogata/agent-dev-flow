# 配布物への concrete ID 記載は ADF-COVERS 宣言コメント位置に限る

## 背景

配布 skill（src/opencode/skills 配下の SKILL.md・references）の本文に REQ/DEC の具体 ID を記載すると、配布依存境界 gate の concrete-id 違反として検出される。consumer 環境で ID が解決不能になるための設計制約であり、case 2789 で STEP-1 Purpose への prose 記載が failure として検出された。同種の知見（DERIVE 宣言の内部 ID、STEP 表の具体番号ファミリー制限）が deferred に分散していた。

## 問題

- 配布物本文 prose への REQ/DEC 具体 ID 記載（例: `REQ-038-006`）は concrete-id 違反として gate が failure を出す
- 具体番号を書ける ID ファミリーは限定されており（STEP/QG）、REQ/DEC/Design の具体番号は本文に書けない
- 検出器は実装済みだが、記載様式の規約知識が統合されておらず、作成・更新時に繰り返し違反が発生する

## 望ましい変更

「配布 skill への REQ/DEC 参照は ADF-COVERS 対応宣言コメント（`<!-- ADF-COVERS(implementation): REQ-NNN-NNN -->` 等）の正規位置に限る」様式ルールを知識文書化する。本文では概念名参照を使い、具体 ID は宣言コメント位置に集約する。traceability 対応宣言（missing-implementation 解消）と concrete-id 違反回避の両立様式として既存前例（harness-delegation.md 様式）を参照させる。

## 対象範囲

- 対象: 配布 skill（SKILL.md・references）の作成・更新、traceability 対応宣言の付与
- 対象外: docs/ 配下の正規成果物（REQ/Decision/Design 本体）、非配布ファイル

## 反映先候補

| 種別 | パス | 変更内容 |
|---|---|---|
| knowledge | docs/knowledge/（新規知識文書） | 配布物への ID 記載位置制約（ADF-COVERS 宣言コメント正規位置、ID ファミリー制限を含む）の統合知識化 |
| Design | docs/designs/integrity/distribution-boundary.md | 運用節への記載様式ルール追記 |
| guide | skill authoring 関連ガイド | 配布 skill 作成時の注意として参照 |

## 既存対策確認

- 確認結果: 検出器は実装済み、規約知識は未統合
- 該当ファイル: check_distribution_boundary.ts（concrete-id 検査）、既存前例（harness-delegation.md の宣言コメント様式）
- ギャップ分類: load miss
- ギャップ詳細: 検出は自動化されているが、事前予防のための様式ルール知識が deferred に分散（DERIVE 宣言内部 ID、STEP/QG ファミリー制限、prose 記載禁止）しており統合文書化されていない。発生4件相当

## 制約

- ADF-COVERS 宣言の形式（role・参照形式）は traceability の正規契約に従う（本知識は記載位置の整理に留まる）
- ID ファミリー制限（STEP/QG は具体番号可）の詳細は配布依存境界 Design の正規規定に従う

## 受け入れ条件

- [ ] concrete ID の記載可能位置（宣言コメント正規位置）と禁止位置（本文 prose）が一文書に整理されている
- [ ] ID ファミリー別の可否（REQ/DEC/Design 不可、STEP/QG 可）が含まれている
- [ ] 既存前例（宣言コメント様式）への参照がある

## 元learning item / 根拠

- 要約: 配布物本文への具体 ID 記載が concrete-id 違反となる設計制約と、宣言コメント正規位置への集約様式
- 根拠: inbox 2026-09-13（analysis-and-review.md STEP-1 Purpose への REQ-038-006 prose 記載が gate failure、宣言コメント付与で解消）+ deferred 2026-07-22（DERIVE 宣言に内部 ID を含めると IR-055 strict violation）、deferred 2026-08-15（STEP 表で具体番号を書ける ID ファミリーは STEP/QG に限定）。発生4件相当
- 再発条件: 配布 skill 本文に REQ/DEC 具体 ID を prose として記載した場合
- 横展開可能性: 配布 skill reference の作成・更新全般、traceability 対応宣言付与場面

## 推奨Issue分類

- 分類: feature（規約知識の統合）
- 推奨ラベル: documentation, agentdev, distribution-boundary
- 関連Issue: なし（case 2789 の集約知見）
