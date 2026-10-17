# Case 直下の子 Issue（Epic なし・OU 単位 Issue 並列）のタイトル書式の未定義

## 観測内容

- 出所: Case #3758（backlog-auto e2e run 20261016T142343JST）case-ready 実行構造確定
- 種別: 書式規則の育成候補
- 事実: `docs/designs/workflows/issue-title-policy.md` の役割別書式判定表は「実行構造確定前の Root Case / Standard Case」「Epic として確定した管理 Issue（Root Case）」「Epic 配下の子 Issue」「追跡Issue（role: tracking）」の4役割のみを所有し、Epic を構成しない Case 直下の子 Issue（利用者判断 Q5 で確定した OU 単位 Issue 並列構成）の書式を所有しない。同 Design には「Root Case と別 Epic の統合は本 Design の対象外」という明示対象外宣言の前例が存在するが、Case 直下子 Issue についての書式規定も対象外宣言も存在しない。本実行では主題のみのタイトル + 本文 Parent 行で運用した（親番号表示の例外は `[Epic #N]` のみ）
- intake-promote 実行時の事実再確認（2026-10-17）: 役割別書式判定表の行構成と対象外宣言の不在を正本 Design に対して再確認済み。書式未定義の指摘は事実と一致する

## 影響

- Case 直下子 Issue を起票する経路（OU 単位 Issue 並列構成の case-ready 実行構造）でタイトル書式が単一参照点から導出できず、実行ごとの判断（主題のみ + 本文 Parent 行等）に委ねられる
- Issue タイトル書式の単一参照点（issue-title-policy.md）としての網羅性が欠け、書式運用が実行間でゆれ得る

## 課題

- 役割別書式への Case 直下子 Issue の書式追加、または非対象の明示のいずれかを決定する必要がある（設計判断は下流工程で実施する。両方の解決経路を含む育成候補として扱う）
- 適用面の確認: GitHub・ローカル版（agentdev_gh local）の両起票経路、およびローカル版 case file の title フィールドへの及び方
- 対象外と判断する場合でも、既存の「Root Case と別 Epic の統合は本 Design の対象外」と同様の明示対象外宣言を同 Design に追加する形で網羅性を担保できる

## 既存要件との関連

- REQ-100（ADF が起票する Issue タイトルの記述規則）の design 対応が `docs/designs/workflows/issue-title-policy.md`
- 同 Design の主題原則、Wave 投影、タイトルから除く情報、ローカル版親番号の規定との整合判断が下流で必要
