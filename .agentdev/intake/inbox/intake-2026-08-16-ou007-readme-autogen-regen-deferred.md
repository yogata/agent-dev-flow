# Intake Item: README 系 AUTOGEN ブロックの再生成見送り（#2167 帰属）

## 発生源

- PR: #2173 (Issue #2164 / OU-007, Epic #2162 Wave 1)
- 発生 phase: case-run 検証（TS-006-OU007）
- capture 分類: intake（AUTOGEN 再生成対象の記録）

## 問題

docs/README.md の件数カウントブロック（readme-req-summary-count）と docs/requirements/README.md の AUTOGEN ブロック（req-active-count、req-active-table、req-retired-table）の再生成は Issue #2167 担定。本 PR では requirements/README.md の AUTOGEN retired 表に REQ-022 行が登録済みであることの存在検証のみ実施した（行は登録済み）。

## 推奨対応

#2167（OU-010）での generate_indexes による一括再生成時に、REQ-022 の retired 表登録行と件数カウント（現行 35件・廃止済み 4件）が再生成後も保持されることを確認対象とする。

## 関連

- Issue: #2164 (CLOSED), Epic: #2162
- PR: #2173 (Findings / Capture候補 セクション intake 2件目)
- 再生成担当: #2167（OU-010）
