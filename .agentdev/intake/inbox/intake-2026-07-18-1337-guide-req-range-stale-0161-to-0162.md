# Intake Item: docs/guides/project-docs-and-specs.md の REQ 範囲記述が旧値（REQ-0161）で古い

## 発生源

- 発生 phase: /repo/docs-check 実行（2026-07-18 04:35）
- capture 分類: intake（具体的作業候補 = ガイド一行の数値更新）

## 問題

`check_integrity.ts` の Canonical 検査（req-range-staleness）が `docs/guides/project-docs-and-specs.md:26` の記述「REQ-0101 から REQ-0161 までの 52 件」を NG として検出した。実際の現行 REQ 最終番号は REQ-0162（53件）である（`docs/requirements/REQ-0162.md` が存在、`docs/README.md` は「REQ-0101 から REQ-0162 までの 53 件」と記載）。

該当箇所:

```
docs/guides/project-docs-and-specs.md:26
- 現行 REQ は REQ-0101 から REQ-0161 までの 52 件（REQ-0111, REQ-0115, REQ-0116, REQ-0117, REQ-0118, REQ-0120, REQ-0121, REQ-0122 は廃止、履歴参照のみ）
```

原因分類: 確認済（REQ-0162 追加時にガイドの同期更新が漏れた doc drift）。

## 推奨修正対象

`docs/guides/project-docs-and-specs.md:26` を以下のように更新する。

- 「REQ-0101 から REQ-0161 までの 52 件」→「REQ-0101 から REQ-0162 までの 53 件」

廃止 REQ の列挙（REQ-0111/0115/0116/0117/0118/0120/0121/0122）は現状維持。`docs/requirements/README.md` および `docs/README.md` と数値を一致させることを完了条件とする。

## 関連

- 発見元レポート: `.agentdev/integrity/reports/2026-07-18-integrity-report.md` Canonical セクション（非永続・commit対象外）
- 正の基準: `docs/README.md`（REQ-0162 / 53件）、`docs/requirements/README.md`
- 要件: REQ-0101（文書・REQ管理基準）
