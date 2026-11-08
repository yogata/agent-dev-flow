# bun test suite の pre-existing fail（close_mechanical_steps.test.ts pin 2件・traceability_relied_diff.test.ts T6・scripts 統合テスト timeout 11件）の baseline 処置

## 観測事実

- Case #3968（PR #3974 本文 Findings/intake 候補）で、設計PR #3965 merge 済みの baseline（776805a25）時点で既に存在する bun test suite fail を記録した。
- DEL-3968-2（merge 後 HEAD 3abaa09c5）で origin/main（f2c87098b）実測再現を確認: traceability_relied_diff.test.ts T6 1件〔relied-diff 系・本件無関係〕・scripts 統合テスト timeout 11件〔install/projection 系・2.2秒〜31秒 timeout・worktree 環境固有〕。pin 2件のうち「作成先確認接続」系は #3966 分の main 側テスト除去取り込みにより本 branch 上で消滅（suite2 0 fail）。
- case-close（merge 直前 HEAD d4d5df72・baseline 0baf5df4c）で再実測: 同一 12 fail（split1 1件・split2 0件・split3 11件〔plugins junction 未伝播で scripts 分のみ〕）。baseline detached worktree で同一 fail を再現（pre-existing 判定・本 branch 起因 0 件）。

## 処置候補

- 残存する pin 2件（「実物側網羅列挙が Design 正本に存在」「終了判定記録の様式の契約行がライフサイクル Design に存在」）・traceability_relied_diff.test.ts T6 は撤去系実現単位（RU-0270・RA-002〔#3970〕/RA-006〔#3971〕の「Design『撤去する機構のためのテストは削除し、維持機構のテストは維持する』に従う改編」）で処理される見込み。
- scripts 統合テスト timeout 11件は worktree 環境固有の timeout（baseline 同一結果）。実行環境差の是正または実行形態調整の要否を promote 判断で評価する。

## 関連

- Case #3968・PR #3974 本文 Findings/intake 候補・Epic #3964・RU-0270
- REQ-032（完了判定工程）・検証に伴う一時資材の取扱いと後片付け責任 Design
