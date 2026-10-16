# E2E 実測観測証跡（最終版）— DEL-3725-3 / backlog-auto 一気通貫 20261015T180807JST

- 実行: 2026-10-15T18:08:07+09:00 〜 2026-10-16T09:0x JST。エントリ機序（正直記録）: branch 実装 PR #3727 @45c2b767 の command 定義・Workflow Skill を権威として起動、子ワークフローは main 現行実装、merge は QG-4 後まで未実施のまま完走。
- 成果: RU14 一式 → 要件doc 1 → case-auto 1（Root #3729・Epic #3731/#3732・子14）→ 完遂突合 → **v5.1.1** @17cce65b（タグ push 実測）。

## stage 別結果

| stage | 結果 | 主要証跡 |
|---|---|---|
| 1 inspect-docs | 15 findings | finding-20261015T093252Z.md |
| 2 昇格3系統 | 3系統並行（活動区間重なり）・HITL 5件（prune/削除/DS25/RQ15/commit承認） | ed8b2b8f/b2c10192/6704dcea |
| 3 backlog-review | 16成果物→14RU（α/γ統合・S2分割・DS25保留）・HITL RU承認 | 062eb874 |
| set-state | 基準点 v5.1.0@3d8718cc・開始コミット 062eb874・義務46項 | set-state.json |
| 4 req-define | 単一実行・壁打ち4判断（HITL）・adversarial-review・auto_ready | draft（aa845f4e で永続化後 Form Zero） |
| 5 case-auto | case-open #3729/PR#3730（障害→serve再起動→STEP-2再開〔TS-004実施中中断〕）→ case-ready 2Epic+14子 8b90d240 → case-run 並列（5枠・14>5・横断補充〔TS-003実測〕）→ case-close 11PR merge・verify-only受入3・QG-4全[x]・Capture 17cce65b | 0026aefc〜ee66005e |
| 6 全体完了突合 | **完遂**（対応表14/14・義務→子完了条件→QG-4・Epic横断最終検証 green・RU/draft削除後もset-stateから突合） | set-state stage6 |
| 7 リリース | **v5.1.1**（patch+1のみ・衝突0・混入0〔16コミット全数検査〕・TS-007: タグ作成→制御中断〔ローカル存在/リモート不在実測〕→再開push→リモート一致→タグ不変） | タグ v5.1.1・release-notes-draft |

## TS 項目最終状態（本実測分）

- **TS-001 単一起動一気通貫**: 成立 — 起動1回・工程開始のみの目的の手動コマンド入力なし（全停止はHITL判断・障害・QG境界）。次工程開始の手動入力が存在しないことを全 stage 記録で確認。
- **TS-002 RU一式完全引継ぎ**: 成立 — merge/split対応保持（set-state対応表14/14）・無関係取込みなし・義務46項の突合正として機能。
- **TS-003 一式全体並列実行**: 成立 — 実一式14子 > 共有上限5 の実構成で、5枠同時稼働・横断補充・固定batchなし（wave記録: 第1波5→回復込み第2波5→第3波3→第4波）。複数case-auto呼出しへの分断なし（単一case-auto内で完結）。
- **TS-004 一式中断再開**: 成立 — (1)RU生成後: 承認往復・quota割込み×2を経てdurable stateから再開・重複なし (2)要件定義後: 壁打ち往復でdraftから再開 (3)実施中: case-open STEP-2 障害（gh exit 66）→ serve再起動→STEP-2から再開・完了工程未再実行 (4)#3741 worker abort→dirty worktreeから回復 (5)Issue生成後: case-ready確定→case-run開始の往復。同一一式・進捗復元・二重生成なしを各点で実測。
- **TS-005 全体完了判定**: 成立 — 突合は義務スナップショット+対応表が正（RU/draft削除後も成立）・Issue数一致のみで完遂せず（義務→証拠の対応確認を実施）。
- **TS-006 実行前後の版管理**: 成立 — 開始時 v5.1.0 確定（正式SemVerのみ・到達可能最大版・rc/baseline除外実測）・実行中新規タグ0・完遂後 patch+1 のみ（v5.1.1）・対象コミット一致・事前タグ/二重採番/minor振り分けなし。
- **TS-007 正式リリース成立と再開**: 成立（通常+制御中断）— タグ作成→中断（ローカル/リモート状態読戻し記録）→再開push→リモート実測→タグ不変・第二番号なし。公開途中失敗ケースは本runで非発生（制御中断で再開経路を実測）。
- **TS-008 対象なし・初期状態・公開不能**: 部分成立 — 対象なし終了=正常の扱いを3系統で実測。RU 0件/初期状態は実一式の性質上非到達（不成立経路の正当な非実施として記録）。公開不能は非発生（serve障害は起票経路の障害でリリース公開経路と区別記録）。
- **TS-009 全適用形態検証**: ADF本体=本実測で成立。GitHub接続型/ローカルIssue型=RA-005 fixtures（未実施→executorフィードバックで処理または未検証記録）。
- **TS-010 set-state 運搬体**: 成立 — 作成・対応表更新（RU→要件doc→OU→実行単位14/14）・進捗更新・判断変更記録・単一書き手・RU/draft削除後の突合正として機能・cleanup gate対象外配置を通期で実測。

## HITL 境界実測（全て停止して質問・自動回答なし・計16回）

stage2: 5件 / stage3: RU承認+commit承認 / stage5: #3744循環判断 / stage7: リリース条件・公開権限確認 ＋ #3744・リリースは選択式確認で明示回答を受領。

## 環境障害記録（正直記録）

- agentdev_gh gh exit 66（serve環境固有）×2回発生 → bash/bun直gh正常の切り分け → serve再起動で回復（supervisor実施）→ case-open STEP-2から再開。learning inbox に知見capture済み（64edab79）。
- quota割込み×2（backlog-review委譲）→ durable state確認→副作用なし→再実行で完走。
