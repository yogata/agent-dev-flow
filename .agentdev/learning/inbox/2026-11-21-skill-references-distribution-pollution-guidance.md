---
id: 2026-11-21-skill-references-distribution-pollution-guidance
created_at: 2026-11-22T03:45:00+09:00
source: case-run #4186 の IR-055/IR-059 解消作業（PR #4191・Findings/Learning 候補の回収）
status: unreviewed
---

skill references（src/common/**）への追記では、REQ 行 ID・DEC 番号・docs/designs concrete パス・IR ID のいずれも配布物汚染検出（IR-055/IR-059）の対象となる。実装時に slug 名前参照（例: req-spec-boundary-violation-detection 検証ルール）へ置換する前提を、配布領域編集の実行担当ガイダンスへ追記する候補。

観点: 配布領域（src/common/skills/**/references 等）を編集する委譲の prompt・ガイダンスに「トレーサビリティ識別子の直書き禁止と slug 参照置換」を事前提示するかの整理候補。
