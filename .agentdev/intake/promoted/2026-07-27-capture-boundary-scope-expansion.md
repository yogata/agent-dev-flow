# Capture boundary の工程横断拡張

## 観測内容

現在の capture pipeline は case-run phase の PR Findings を主な入力とする。
req-save、spec-save、case-open、case-close の完了報告に含まれる deviation は case-auto のコンテキストで消費され、intake または learning pipeline へ流入しない。
採番スクリプト不備、target_area fallback、GitHub CLI の cp932 回避策という高優先の 3 件が、複数 draft で再発しながら capture されなかった。

## 影響

各工程で検出した問題と workaround が再利用されず、同じ調査と対処が繰り返される。

## 課題

工程ごとに capture 候補を報告する方式と、case-auto の完了時に全工程を集約する方式のどちらを採るかが未決定である。
intake と learning の責務境界も分けて定義する必要がある。

## 既存要件、仕様との関連

- `docs/specs/skills/agentdev-workflow-orchestration.md`
- `docs/specs/skills/agentdev-case-run-execution-adapter.md`
- 影響 command: case-auto、req-save、spec-save、case-open、case-close

## 対応方向

req-define で capture の実行主体と保存先判定を定め、capture 境界 SPEC へ反映する。
想定は maintenance、standard scale である。

## 発生源

case-auto Step 8 完了後の振り返り。
