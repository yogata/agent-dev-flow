# textlint prh 辞書へ「Definition PR」→「設計PR」の用語統一を登録し、6件の既存違反を解消する

## 観測内容

Wave-3（#3659、PR #3667）の textlint final gate（agentdev-textlint-guard、605ファイル）で、既存の prh 用語統一違反 6件が gate 全体を FAIL させていることが確認された。違反は「Definition PR」→「設計PR」の用語統一（prh 辞書ルール）で、以下の6箇所に存在する:

- docs/designs/foundations/references/v4-v5-crosswalk.md（L79、L86）
- docs/designs/workflows/v4-standard-lifecycle.md（L34）
- docs/designs/workflows/v51-phase-transition-and-coexistence-model.md（L40）
- src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md（L50、L80）

基準 commit ed0dc04d 時点から存在する既存違反であり、Epic #3653 の Wave 実行では対象外として修正していない。main 現在（commit 3f457e6f）でも gate は hard 6件で FAIL 継続である。

### 発生時のスコープ判断

違反箇所は docs/designs/ 配下の正規成果物と配布 reference であり、Epic #3653 の Wave 実行対象範囲外である。用語統一の方針（辞書登録か本文修正か）の判断を含む別 Case での処置が適切である。

## 影響

textlint final gate が全体で常に FAIL となり、gate を経由する最終検査が既存違反の継続報告を毎回生成する。新規違反と既存違反の区別が実行ごとに手動判断となり、真の新規違反の見落としリスクが続く。

## 課題（backlog-review で決めること）

- prh 辞書（.agentdev/config/plugins/agentdev-textlint-guard-prh.yml）への用語登録追加か、6箇所の本文直接修正かの方針
- src/common/skills/agentdev-workflow-case-open/references/ 配下の修正の場合、Definition PR 作成を伴う Case として実行するか、docs_chore として扱うか

## 関連（既存要件・正規成果物・証跡）

- 関連: agentdev-textlint-guard plugin、prh 辞書 .agentdev/config/plugins/agentdev-textlint-guard-prh.yml
- 関連正規成果物: docs/designs/foundations/references/v4-v5-crosswalk.md、docs/designs/workflows/v4-standard-lifecycle.md、docs/designs/workflows/v51-phase-transition-and-coexistence-model.md、src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md

## 根拠

- 観測元: PR #3667（Wave-3 #3659、Findings/Capture候補の既出記録、2026-10-13 case-close 再実行で再確認）
- 証拠: textlint gate 実行（--root 本体リポジトリ、605ファイル、hard 6件、変更3ファイルは hard 0）
