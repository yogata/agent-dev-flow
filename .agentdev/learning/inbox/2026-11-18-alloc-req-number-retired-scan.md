---
id: learn-20261118-alloc-req-number-retired-scan
created_at: 2026-11-18
source: case-run deviation capture (Root Case #4150)
status: inbox
---
# 採番スクリプトが retired/ を走査せず既存廃止 REQ と重複する番号を割当て得る

- 問題事象: alloc-req-number.ts が REQ 番号採番時に docs/requirements/ 直下のみを走査し、retired/ 配下の廃止 REQ ファイルを考慮せずに REQ-121 を割当てた。retired/REQ-121.md が実在するため、スクリプト結果に従うと廃止識別子の再利用（numbering-policy の禁止行為）になっていた
- 発生局面: case-open STEP-3 の採番衝突検査（Definition Package 組立時の REQ 採番、Case #4150）
- 検知方法: docs/requirements/README.md の廃止済み REQ 表の確認中に REQ-121（retired）の実在を発見
- 根本原因: スクリプトの listMarkdownFiles が非再帰走査であり、numbering-policy「新規採番: 現行ファイル群（retired/ を含む）の最大番号に 1 を加えた値」の規則を未実装
- 自律対応内容: numbering-policy の規則文を正として REQ-122 を採番し、PR #4152 検証欄へ経緯を記録した（スクリプト自体は本 Case では修正していない）
- ユーザー確認有無: なし（policy 規則文の機械的適用）
- Decision/REQ/spec 影響: REQ-010-070（採番スクリプトと欠番レジストリの単一情報源）、docs/designs/foundations/numbering-policy.md
- 横展開観点: alloc-decision-number.ts と alloc-composite-id.ts の同型走査も retired/ を考慮していない疑いがある
- 再発条件: retired/ 配下に現行最大番号帯の廃止 REQ が存在する状態で新規採番する場合
- 予防策候補: 採番スクリプトの retired/ 走査追加、または numbering-policy 既知の欠番レジストリへの廃止識別子反映の恒久化
- 想定反映先: agentdev-req-file-manager の採番スクリプト修正 Case
- 関連: Case #4150、PR #4152 検証欄
- タグ: 採番、検証スクリプト、回避系
