# docs-check の SPEC 突合除外と AUTOGEN 計測対象の audits/baselines 扱い差

## 観測

docs-check（Targeted Docs Guard）の SPEC 突合は audits/・baselines/ を配置ディレクトリで除外している（check_changed_docs.ts SPEC_HISTORY_DIR_RE）一方、generate_indexes.ts collectSpecMetrics は docs/specs/ 配下の全 .md をファイル単位で計測し、audits/・baselines/ の Report ファイルも AUTOGEN 計測表（spec-health-metrics）の計測行として計上する。

この対象差は PR #2276（Issue #2230）で specs/README.md 登録規定に「計測行として計上される」「計測行であることは SPEC としての位置づけを与えない」と文書化されたが、計測側の対象変更は行っていない。

## 今回扱わない理由

Issue #2230 の対象外宣言により spec-health-metrics.md の計測対象変更は整合確認のみ（変更なし）。Report を計測対象から除外する要件は現時点で存在しない。

## 影響

将来「spec-health-metrics の計測対象から Report を除外する」要件が生じた場合、docs-check 側の除外（配置ディレクトリベース）と計測側の包含（docs/specs 全 .md）の相手側を同時に確認しないと再び規定と実挙動の乖離が生じる。また SPEC 件数の集計で Report を含める/除くの定義が利用場面ごとに揺れる可能性がある。

## レビューで決めること

- Report の AUTOGEN 計上行の扱い（現状の計上継続でよいか、除外する場合は check_changed_docs と対象を合わせるか）
- 「SPEC 件数」の定義を計測・集約場面で統一する規定の要否

## 根拠

- PR 2276 本文「Findings・Capture候補」1件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2276）
