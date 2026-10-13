# 他 Case merge 起因の IR-072 frontmatter updated 未進行（11件）を一括進行して是正する

## 観測

2026-10-14 時点の check_integrity（source profile）で、REQ/Design 変更後の frontmatter updated 未進行（IR-072 req-updated-freshness）が 11件のファイルで NG 検出: docs/requirements/REQ-030.md、docs/requirements/REQ-110.md、docs/requirements/REQ-112.md、docs/designs/commands/case-auto.md、docs/designs/commands/case-open.md、docs/designs/foundations/references/v4-v5-crosswalk.md、docs/designs/integrity/distribution-boundary.md、docs/designs/local/runtime-package-boundary.md、docs/designs/quality/req-health-metrics.md、docs/designs/skills/agentdev-workflow-templates.md、docs/designs/workflows/v4-standard-lifecycle.md。いずれも 2026-10-14 の他 Case merge（#3699、#3701 等を含む）で変更されたファイルであり、frontmatter updated が 2026-10-13 のまま残留している。

## 今回扱わない理由

Root Case #3675（docs 現行化バッチ）の対象は定義済みファイル群であり、上記は対象外ファイルのため本 Case では修正しない（対象外ファイル変更禁止）。本 Case 対象 7ファイルの IR-072 は NG 0件を merge 後 main で再実行確認済み。

## 影響

check_integrity（source profile）の exit 1 が継続し、他の Case の機械ゲートで既存債務分離（対照救済・実行差分証明）の手間が毎回生じる。REQ/Design の updated と実変更日が乖離したまま追跡性が低下する。

## レビューで決めること

- 一括進行（機械的是正 commit）の実施単位とタイミング（日次 batch にするか、検出時に都度進行するか）
- req-health-metrics.md は AUTOGEN 派生物を含むため generate_indexes 再生成を伴う手順の要否

## 根拠（任意）

- 観測元: Root Case #3675（case-run 検証・case-close 再実行、2026-10-14）
- 証拠: check_integrity（source profile）の IR-072 NG 11件（2026-10-14 実測。case-close 対応記録コメントの検証差分行参照）
- 代替識別子: PR #3698 本文「Findings/ Capture候補」intake 2件目「Root Case #3675 の検証差分この行」
