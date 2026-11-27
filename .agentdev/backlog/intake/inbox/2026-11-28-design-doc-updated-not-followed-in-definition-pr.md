---
id: 2026-11-28-design-doc-updated-not-followed-in-definition-pr
created_at: 2026-11-28T08:56:00+09:00
source: case-close (yogata/reENC の Root Case #93 の残る事柄の登録。利用者の判断 2026-11-28: 質問3 案C)
status: unreviewed
---

# 設計PR が既存の Design 文書を変えても frontmatter の `updated` が揃わず、case-ready の受入で止まる

- **課題**: case-open は、要件の PR の中で既存の Design 文書を書き換えることがある。このとき frontmatter の `updated` は自動では揃わない。case-ready の検査は、変更した docs ファイルの `updated` が、最後に変更した commit の author date と一致することを求める。そのため設計PR の受入が、この 1 点だけの不合格で止まる。実行する側は「許可された修正以外は書き込まない」規則に従い、何も書き込まずに blocked で停止する。監督が同じ PR へ修正 commit を足すまで先に進まない。
- **期待する処分**: 次のどれかに決める。(a) case-open が Design 文書を変更したときは、`updated` も最後に変更した commit の author date に合わせる。(b) `updated` を合わせる補正を、`check_integrity` の報告が無くても動く条件にする。(c) 止まったときに監督が許せる修正 (同じ PR への `updated` の 1 行の修正 commit) を、停止の記録に案内する。
- **出典**: yogata/reENC の Root Case #93 (Issue #93) と設計PR #94。観測は 2026-11-27。配布物は 5.2.6。
- **実証根拠**: (1) 設計PR #94 は `docs/designs/` 配下の既存の Design 文書 1 件の 2 行を変えた。frontmatter は `updated: 2026-11-11` のままだった。文書を最後に変更した commit の author date は 2026-11-27 である。(2) case-ready の前回の実行 (DEL-93-case-ready-1) は STEP-1 でこの 1 点だけを不合格として検出し、書き込む前に停止した (Issue #93 のコメント。監督の判断の記録)。(3) PR #94 本文の 57 行目によれば、reENC の case-open は generate_indexes と check_integrity を実行するスクリプトが無いため、gate-availability を exit 1 として、代わりの正規の手順へ切り替えた。59 行目によれば、代わりに実行した `check-frontmatter-consistency.ts` の対象は `docs/requirements` だけだった。(4) 本リポジトリの `src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts` の 696 行目は、`runMeasurementDateConvergence` に check_integrity の出力を渡す。490 行目の正規表現は、その出力の `req-updated-freshness` の NG 行だけを捉える。(5) 監督が同じ PR へ `updated` を 2026-11-27 に合わせる修正 commit 1 件を追加し、受入と統合を再開した (PR #94 本文 26 行目)。
