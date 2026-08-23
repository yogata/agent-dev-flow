# targeted docs guard の workflow profile 対象に docs/issue-list/ が含まれない

## 観測

PR #2412（Issue #2409、Epic #2408 Wave 1）の case-run 検証で、`check_changed_docs.ts --workflow case-run --base-ref main` の `files_checked` が空になった。`docs/issue-list/README.md`（課題ファイル形式の定義・運用規則、現行文書）が workflow profile の対象パターンに含まれないため。case-close での `--files` 指定実行では 13 ファイルすべてが検査対象となり failures/warnings なし。課題ファイル自体（ISL-*.md）は履歴系文書として検査対象外（REQ-049-014）で整合するが、README の対象除外は意図した設計かは本 Issue では判断していない。

## 今回扱わない理由

guard の workflow profile パターン追加は integrity 検査体系の変更であり、case-close の capture 責務は回収・保存のみ（capture 境界: PR 本文のみを入力源とする）。

## 影響

`docs/issue-list/README.md` の変更が case-run の targeted docs guard で検査されない期間が続く。連動ファイル検査も経由しないため、README と形式定義の乖離が機械検査で捉えられない。

## レビューで決めること

- `docs/issue-list/README.md` を targeted docs guard（case-run/case-close 両 workflow）の対象パターンへ追加するか
- 追加する場合、課題ファイル（ISL-*.md）は履歴系文書として対象外のままにするか（REQ-049-014 と整合）

## 根拠

- PR #2412 本文「Findings/ Capture候補」intake 1件（回収元: https://github.com/yogata/agent-dev-flow/pull/2412 ）
