# 正規 lib の ADR helper（4桁固定）の歴史互換走査の要否が、ADR 受理形式の権威ある契約不在のまま未確定

## 観測事実

- Case #4005（PR #4017 本文 Findings/intake 候補・判断3実行記録）で記録。利用者判断 3（2026-11-12）により req-file-manager 側の未使用局所 ADR helper 2 関数（adrNumberFromFilename・extractAdrNumber）を廃止し整理完了したが、この判断は ADR 受理形式を新たに確定するものではない。
- ADR 採番契約（受理形式の権威ある規定）は指定正規文書（agentdev-req-file-manager Design・agentdev-decision-file-manager Design・REQ/DEC 関連 REQ・numbering-policy）から導出不能。現行リポジトリに ADR ファイルは 0 件（docs 配下・retired 配下とも実在しない）。
- 正規 lib（artifact-validation）側の ADR helper は 4 桁固定の歴史互換走査を持つ。ADR 受理形式の契約が確定するまで、走査要否は未確定のまま。

## 処置候補

- ADR 受理形式の権威ある契約の確定（req-define 経由の要件化候補）と、それに伴う正規 lib ADR helper の走査仕様の再評価を promote 判断で評価する。

## 関連

- Case #4005・PR #4017（判断3実行記録・B1-2 4工程の実施記録）・agentdev-artifact-validation scripts/lib/frontmatter.ts・TS-003
