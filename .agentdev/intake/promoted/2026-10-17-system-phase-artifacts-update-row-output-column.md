# system.md 一覧表の phase-artifacts-update 行出力欄の文言ずれ

## 観測内容

- 出所: Case #3779（PR #3781）case-close Capture 回収（PR 本文 Findings）
- 種別: 正規成果物の整合修正候補
- 事実: `docs/designs/foundations/system.md` の一覧表中 phase-artifacts-update 行の出力欄が「受領記録の保存先」の無条件表記のまま残存している。同行の入力欄は「自然言語による反映指示と採用内容（外部検討の戻り入力または利用者が直接採用した内容）」と直接採用を含む記述に更新済み（Definition PR #3780）。phase-artifacts-update の出力契約（正本: `src/common/skills/agentdev-workflow-phase-artifacts-update/SKILL.md`、item 内の参照名 RA-001）は「外部戻り入力存在時は受領記録の保存先、直接採用時は採否記録の保存先を報告する」の条件付きであり、直接採用時は受領記録（received/）を作らない。よって一覧表の出力欄と出力契約で字面がずれる
- intake-promote 実行時の事実再確認（2026-10-17）: system.md 該当行の実文と正本 skill の出力契約（条件付き報告、直接採用時は受領記録不作成）を突合し、字面ずれを再確認済み

## 影響

- システム仕様（accepted Design）の一覧表が出力の正確な要約でなくなり、同一行内で入力欄（直接採用に言及）と出力欄（受領記録のみ）が不整合になる
- 直接採用経路では受領記録が存在しないにもかかわらず出力欄は受領記録の保存先のみを示すため、一覧表の読者に誤導し得る

## 課題

- 出力欄を、直接採用時の採否記録保存先を含む記述へ更新する判断（canonical Definition 側の更新判断）。修正方向の選択肢として、(a) system.md 一覧表側を出力契約の条件付き表記へ整合させる方法と、(b) 要約としての粒度を保った別表現（例: 「記録の保存先（受領記録または採否記録）」）への調整がある（選択は下流工程の判断材料）
- 同一種の文言ずれが一覧表の他の行（他 command の出力欄記述）に波及していないかの確認

## 既存要件との関連

- phase-artifacts-update は工程駆動コラボレーション（REQ-110、REQ-111 系）の4操作の一つであり、出力契約の正本は agentdev-workflow-phase-artifacts-update skill の公開操作契約
- system.md 一覧表はシステム仕様の構成定義・運用モデルの案内記述であり、正本との字面整合を保つ必要がある
