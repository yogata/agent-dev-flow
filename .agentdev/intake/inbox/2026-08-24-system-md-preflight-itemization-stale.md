# system.md の preflight 項目数記述の陳腐化（case-open preflight 第6項目追加）

## 観測

Issue 2418（PR #2424）で case-open の preflight を5項目から6項目へ拡張（第6項目「対象要件行に検証対応要否が未分類の行が残っていないこと」追加、REQ-021-024）した結果、`docs/designs/commands/case-open.md`「構成生成事前検証（preflight）」の検証項目列挙（5項目）と `docs/designs/foundations/system.md` の「preflight 5項目」記述が事実記述として陳腐化した（PR #2424 本文「Findings / Capture候補」1件目）。

## 今回扱わない理由

Design 契約本文（system.md）の変更は Issue 2418 の変更対象成果物外であるため、実装 PR（case-run）では変更しない方針が取られた。design-save 相当の追記案件として次工程以降で処理する。

## 影響

なし（機能挙動への影響なし。docs/designs/commands/case-open.md の preflight 節自体は PR #2424 で第6項目追記済み。残存は system.md 側の項目数記述と旧5項目列挙の参照整合のみ）。

## レビューで決めること

- system.md 該当記述の第6項目追記（design-save 相当の Design 更新）をいつ反映するか
- docs/designs/commands/case-open.md 側に残存する旧記述の有無（マージ後 main での再確認）

## 根拠

- PR #2424 本文「Findings / Capture候補」1件目（発見元: case-run 実装）
- Issue 2418 本文「提案内容」（preflight 第6項目追加、REQ-021-024）
