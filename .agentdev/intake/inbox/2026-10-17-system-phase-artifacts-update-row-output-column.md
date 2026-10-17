# system.md 一覧表の phase-artifacts-update 行出力欄の文言ずれ

- 出所: Case #3779（PR #3781）case-close Capture 回収（PR 本文 Findings）
- 種別: 正規成果物の整合修正候補
- 事実: docs/designs/foundations/system.md 143行目の phase-artifacts-update 行の出力欄が「受領記録の保存先」のまま残存している。入力欄は直接採用を含む記述に更新済み（Definition PR #3780）。RA-001 の出力契約（外部戻り入力存在時のみ受領記録の保存先を報告し、直接採用時は採否記録の保存先を報告）と字面がずれる
- 提案: canonical Definition 側の更新判断（出力欄を、直接採用時の採否記録保存先を含む記述へ更新する）
- 対象: docs/designs/foundations/system.md
