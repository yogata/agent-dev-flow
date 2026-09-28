# intake: Issue 本文の AUTOGEN 派生物パス表記「docs/knowledge/req-health-metrics.md」の実配置不一致の補正

- 観測日: 2026-09-28
- 観測元: case-close #3201（OU-003・source_ru: RU-0004、PR #3207 merge 済み・merge commit 1fd42e08）の Capture 回収（PR 本文「Findings / Capture候補」intake）
- 種別: パス表記揺れ補正要求（軽微・完了条件・検証への影響なし）

## 要求内容

Issue #3201 本文（対象範囲・Execution Contract・変更対象成果物）で AUTOGEN 派生物のパスを「docs/knowledge/req-health-metrics.md」と表記しているが、実配置は「docs/designs/quality/req-health-metrics.md」であり不一致。対象ファイル自体は同一であり、実行・検証への影響はない。

## 提案する補正

- Issue #3201 はクローズ済みのため Issue 本文の修正は行わない。
- 将来、同種の AUTOGEN 派生物（req-health-metrics）のパスを記述する際は実配置パス `docs/designs/quality/req-health-metrics.md` を用いる。
- `docs/knowledge/req-health-metrics.md` 表記が他の現行成果物に残存していないかの棚卸し候補（配置移動由来の陳腐表記の洗い出し）。

## 根拠

- PR #3207（squash merge commit 1fd42e08d4c77762820fcb563efbc5a75bc4aac3）の「Findings / Capture候補」に intake として記録済み。
- 実配置確認: merge commit 1fd42e08 の実変更ファイルは `docs/designs/quality/req-health-metrics.md`（計測日更新 1 行）で、`docs/knowledge/req-health-metrics.md` というパスは本 commit に存在しない。
- 本表記揺れは case-close の前提手続きのため Issue 本文修正は本 Case の対象外（PR 本文に明記）。
