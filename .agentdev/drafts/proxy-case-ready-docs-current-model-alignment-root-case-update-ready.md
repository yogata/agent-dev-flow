# proxy-case-ready payload: Root Case #3293 更新（STEP-6: ready 遷移）

適用手順（resume 実行者）: 本 payload は STEP-4 用 payload 適用後、かつ Epic Issue / 8 Child Issue の作成完了後に適用する。`gh issue view 3293 --json body` で現行本文を取得し、次の3操作を適用して本文全体を `agentdev_gh` issue_update で更新する。Markdown 行構造（LF、セクション間空行、インデント）を保持すること。

1. 置換（「実行識別情報」セクション内の key-value 行）:
   - 現行: `- adf_execution_unit: N/A（実行構成未確定。case-ready が execution contract 確定後に確定する）`
   - 置換後: `- adf_execution_unit: epic（Epic Issue #EPIC_SELF）`
   - `#EPIC_SELF` は作成された Epic Issue の番号へ置換すること
2. 置換（「Case 状態と次工程」セクションの全文を次の verbatim と置換する）:
3. 挿入（次の「## 実行構造」セクション全文を「## Execution Contract」セクションの直後、「## Case 状態と次工程」セクションの直前に挿入する。子 Issue 番号は作成結果で置換すること）:
4. 他のセクション（概要・対象 REQ・Definition Package・Execution Contract・レビュー判断・補足情報）は変更しない。

置換する「Case 状態と次工程」セクション（verbatim）:

```markdown
## Case 状態と次工程
<!-- 【必須】 -->

- 状態: ready（実装開始許可。case-ready 検証ゲート合格。次工程 case-run のみが実装を実行できる）
- Definition PR: merge 済み: PR #3294（92edf6ae）
- 次工程: `case-run`
```

挿入する「実行構造」セクション（verbatim。`#EPIC_SELF` と `#CHILD_OU-000N` を作成結果の番号へ置換すること）:

```markdown
## 実行構造
<!-- 実行構造: case-ready STEP-5・STEP-6 で確定。Epic Issue が Wave / 依存構造の実行時 SSoT である -->

- Issue structure: Epic（構成検証合格: Epic サイズ 8/上限 10、必須依存 DAG 循環なし、全 OU の Wave 割当完了 8/8）
- Epic Issue: #EPIC_SELF（Wave 構成・分解テーブル・ステータス追跡・構成推論の根拠〔3軸判断・Jev 評価観測 20261001T075638Z-e211 / 20261001T075727Z-df20〕を管理する実行時 SSoT）
- Child Issue（execution SSoT・各 Issue 単独自足の execution contract）:
  - OU-0001 → #CHILD_OU-0001（case-auto 実行時投影の判断境界現行化・AG-001・RA-002 case-auto 系）
  - OU-0002 → #CHILD_OU-0002（case-ready 実行時投影の判断境界現行化・AG-001・RA-002 case-ready 系）
  - OU-0003 → #CHILD_OU-0003（Design 保存契約現行化の実現面同期・AG-002・RA-001）
  - OU-0004 → #CHILD_OU-0004（docs/designs/** 現在形純化スイープ・AG-003・RA-005）
  - OU-0005 → #CHILD_OU-0005（移行文書の現在責務分離の実現面フォロー・AG-004）
  - OU-0006 → #CHILD_OU-0006（入口文書の現在像統合・AG-005・RA-004）
  - OU-0007 → #CHILD_OU-0007（規範重複の限定的縮約・AG-006・RA-006 縮約）
  - OU-0008 → #CHILD_OU-0008（実装投影・検証の最終同期と最終横断検証・AG-007・RA-003）
- Wave 構成: Wave 1 = OU-0001・OU-0002・OU-0003（並列）、Wave 2 = OU-0004（←OU-0003）、Wave 3 = OU-0005（←OU-0004）、Wave 4 = OU-0006（←OU-0001/0002/0005）、Wave 5 = OU-0007（←OU-0003/0006）、Wave 6 = OU-0008（←OU-0007）
- Wave 重複前置検出の記録: Wave 1 内の system.md 重複（OU-0001/OU-0002）は重複許容（主要編集は Definition PR #3294 で単一実施済み。衝突解消担当は後着 merge 側・マージ順序は case-auto orchestration の Wave 1 fan-in 順序）。Wave 1 の case-ready.md（OU-0002）と Wave 2 の case-ready.md（OU-0004）は異なる Wave であり同一 Wave 内重複ではない。OU-0006・OU-0007 は target_design を持たず REQ-061-019 の比較対象は検出不能として報告（Epic Issue 本文へ記録済み）
- 横断依存検査: 未クローズ Case 群は自 Case #3293 のみ（gh issue list --state open で機械確認。重複需要の検出源なし）。検出なし
```
