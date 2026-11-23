---
title: `agentdev-workflow-migrate` Design
status: draft
created: 2026-11-23
updated: 2026-11-23
---

<!-- ADF-COVERS(design): REQ-126-001, REQ-126-002, REQ-126-005, REQ-126-006 -->

# `agentdev-workflow-migrate` Design

migrate command workflow スキル `agentdev-workflow-migrate` の Design。
構成移行の推論移行部分と決定論的事後検証への接続を所有する workflow 実装本体である。

## 確定事項

1. **責務分離の単一所有**: 構成移行は本スキルが単独所有する。install.ps1 は版の記録・比較・旧構造痕跡の検知・migrate 案内のみを持ち、移行処理・互換シムを持たない。通常コマンドも移行処理を持たない
2. **差分仕様の解決方式**: 適用する差分は references/version-deltas.md を正本とし、観測事実（install.ps1 -Check の検知結果と .agentdev/ 配下の実在配置）から選択する。差分の選択は版番号に依存しない（観測事実基準）。対応表にない旧構造は移行せず報告する（推測で対応表を作らない）
3. **正規構造の参照**: 移行先は references/target-structure.md を正本とする。個別プロジェクトの永続・非永続境界の記述は適用先の .agentdev/README.md が担い、両者の役割を混同しない
4. **引き継ぎの意味保存**: 移動する情報は内容・処理状態を維持する。ファイルの中身を解釈変換しない
5. **削除のユーザー確認**: 情報損失を伴う削除（blocked 廃止、完了済み一式の実行記録）はユーザー確認後に実行する。削除しない選択の場合は痕跡が残り、決定論的検証は不成立として扱う
6. **決定論的検証への接続**: 移行完了の判定は install.ps1 -Check の再実行による（版一致・旧痕跡不在・検証合格）。検証不成立を成功として報告しない
7. **対話操作完結型**: STEP model 対象外。resume point を持たず、中断後の同一要求再実行では .agentdev/ 配下の実在配置の再観測から現状を再構成する

## v4 責務分類

v4 の責務分類（正典: DEC-048、foundations/responsibility-boundaries Design「v4 責務分類語彙の後継」節）における本スキルの区分:

- **意味判断担当**: 差分仕様の解決、移行計画の提示、削除判断のユーザー確認
- **決定的処理委譲先**: install.ps1 -Check（決定論的事後検証の実行）
- **知識提供**: references/version-deltas.md（版別差分仕様）、references/target-structure.md（正規構造一覧）
