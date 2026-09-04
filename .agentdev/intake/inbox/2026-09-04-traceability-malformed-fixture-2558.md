---
id: intake-20260904-traceability-malformed-fixture-2558
title: traceability check の corpus 走査が fail-closed 回帰テストのフィクスチャ文字列を malformed 宣言として検出（OU-016 宣言付与の collateral）
created: 2026-09-04
status: inbox
---

## 情報源
- PR: #2578（Issue #2558 / 親 Epic #2556・ru-batch-20260903 Epic 2 Wave 2・OU-016 宣言付与 + IR-059 exemption）
- 検出工程: case-close 再実行（E4-1 gate 停止後の再開）の QG-4 独立再検査。case-run は exemption commit（82186d71）後に traceability check を再実行しておらず、本検出は case-close の独立再検証で初めて確認された

## 内容

traceability check（agentdev-traceability、`--req REQ-057-007,REQ-057-013,REQ-057-016,REQ-057-017,REQ-057-023` スコープ）をマージ後 main（ec959ab1）で実行すると、`malformed-declarations` が 1 件 fail になる:

- 対象: `.opencode/skills/repo-agentdev-integrity/scripts/lib/distribution-boundary.test.ts:1367`
- 該当文字列: `text: "<!-- ADF-COVERS(implementation): REQ-\\u0030\\u0031 -->",`（回帰テスト「evasion inside a declaration comment line stays blocked (fail-closed)」のフィクスチャ）
- 検出理由: traceability check の宣言 corpus 走査は scripts 配下 .ts を含み、既知ロール `implementation` + 宣言形式だが ID が `REQ-\u0030\u0031`（エスケープ済み digits）のため REQ-{NNNN}-{MMM} 形式不適合 → malformed-declaration 判定

本フィクスチャは配布境界 detector の fail-closed（宣言行内 evasion は検出継続）を固定するために意図的にエスケープ ID を含む実装であり、実宣言ではない。同一構図の先行例として tim_declarations_contract.test.ts の ROLE_PROBE コーパス走査問題があり、その対策は `ADF-COVERS(<role>)` プレースホルダー表記統一だったが、本件は「既知ロール + 不正 ID」を Fixture に必要とするため placeholder 統一では回避できない。

## 処分候補

- フィクスチャ側: 文字列連結等で corpus 走査に完全な宣言形式として可視化されない構築方式へ変更（テスト意味論は維持）
- checker 側: traceability check の corpus 走査にテストファイル除外または検査対象宣言（IR-059 exemption と同趣旨）の適用可否判断
- 影響: REQ-057-023 系の「malformed-declarations 0 件化」を機械判定する場合、本 1 件が常時 fail となる（#2558 完了条件 2 は対象成果物由来 malformed 0 件をもって達成判定済みと記録）

## 関連
- #2558 対応記録コメント（検証差分 新規・2026-09-04）
- #2556 Epic クローズコメント
- PR #2578 commit 82186d71（回帰テスト 8 件追加）
