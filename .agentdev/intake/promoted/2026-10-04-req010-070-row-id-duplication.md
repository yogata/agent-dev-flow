# 採用済み成果物: REQ-010-070 行 ID 重複の解消候補（廃止 REQ-087/092/093 横断追随の残件）

## 観測内容

Epic #3425 Wave 2（Case #3431・PR #3438）で REQ-092/093/087 を retired/ へ物理削除した後の Wave-3（#3432）「廃止REQ行を参照する他文書・テスト・checker の参照更新」スコープの残存参照一覧として観測された item のうち、intake-promote 時点で残存するもの。

元観測の主体（廃止 REQ-087/092/093 の活性成果物内参照の付け替え）は Wave-3 横断追随で完了済み。

**残存**: `docs/requirements/REQ-010.md` L43/L44 で `REQ-010-070` が重複（L43 = ギャップ検査行〔#3428 追記〕、L44 = 旧・新規検査クラス追加行）。機械検査の実在性判定には影響しないが採番管理上の ID 重複。

## 影響

REQ-010 本体内の行 ID 重複により、行 ID 単位の参照・追跡の一意性が失われている。traceability check の検査結果には影響なし。

## 課題

REQ-010 本体編集による ID 重複解消（いずれかの行への新規行 ID 採番）の対応候補。REQ-010 本体編集は Wave-3 以降の修正候補とされていた残件。

## 既存要件との関連

- REQ-010-070（両行の内容: 欠番レジストリ参照合格化・過去監査再走査による検査クラス追加）
- REQ 採番規約（numbering-policy・alloc-req-number.ts）

## 出処・根拠

- 元 inbox item: `.agentdev/intake/inbox/2026-10-04-retired-req087-092-093-wave3-remaining-refs-cleanup.md`（分類採用により削除済み）
- 観測元: PR #3438（Case #3431・Epic #3425 Wave 2）本文 Findings / Capture候補 intake セクション + case-close E6-2 廃止キーワード全文検索の追加分
- 備考（元 item）: 欠番レジストリ・retired/*.md 自身・requirements/README.md retired テーブルの参照は廃止契約上の by-design であり更新対象外
- captured_at_commit: 94a9f43ae139040da401c8f904a7edf2ac0f71f2
- 現行源検証（intake-promote・ad6e8341・読取のみ）: 廃止 REQ-087/092/093 の活性成果物内参照は現行 0件（Wave-3 横断追随の完了を確認）。REQ-010.md L43/L44 の REQ-010-070 重複のみ現行も残存
