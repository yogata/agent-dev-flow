---
title: ADF v4 durable state と再構成・恢復（配置表・権威移行・部分失敗調整）
status: accepted
created: 2026-09-19
updated: 2026-09-22
---
<!-- ADF-COVERS(design): REQ-090-006, REQ-090-008 -->
<!-- ADF-COVERS(implementation): REQ-001-034, REQ-001-043, REQ-008-001, REQ-008-002, REQ-008-004, REQ-008-005, REQ-008-006, REQ-008-007, REQ-008-009, REQ-008-012, REQ-008-014 -->
<!-- ADF-COVERS(implementation): REQ-002-036, REQ-005-002, REQ-005-003, REQ-005-004, REQ-005-024, REQ-048-001, REQ-048-002, REQ-048-003, REQ-048-004, REQ-048-005 -->

# ADF v4 durable state と再構成・恢復（配置表・権威移行・部分失敗調整）

位置づけ: 本 Design は ADF v4 モデルの定義である。本 Design の規定が v3 accepted Design と衝突する場合、当該 v3 Design の処遇実行段階（v3-v4-crosswalk のreferences/crosswalk-inventory.md 実行段階列）までは v3 を正とする。当該段階での置換実行をもって権威は本 Design へ移行する。既存 Design 群の本モデルへの準拠更新（置換・廃止を含む）は後続 Sequence で段階的に実施する。

## 5 分類と配置表

durable state 関連の情報を次の 5 分類に配置する。各論理状態の権威を 1 つとし、他は導出投影とする（DEC-038）。

| 分類 | 内容 | 権威の置き場所 | 寿命（8 種対応） |
|---|---|---|---|
| GitHub 正規状態 | Case/子Issue 状態、PR state、Definition 確定状態 | Issue/PR の権威記録先（本文状態節・state・ラベル写像） | Change/Case lifetime |
| repo 内正規状態 | docs/ 正規成果物（REQ/Decision/Design）、.agentdev/ の Git 管理ドメイン状態（drafts、intake/learning inbox、検出事項、.agentdev/jev-observations/） | 各正規成果物ファイル | Requirement/Architecture/Project lifetime |
| ローカル実行環境状態 | worktree・checkout・git index・導入状態（junction、依存 install）、起動時対象集合 | ローカル実行環境（保存しない。正規状態から再構成） | Runtime lifetime |
| 証跡 | 検証 SSoT コメント、対応記録、PR 本文、監査記録 | Issue comment・PR 本文等の不変記録 | Change/Case lifetime（記録として） |
| 導出可能情報 | 現在 stage、workflow route、Wave 状態、Epic 集約、進捗表、索引類 | 保存しない（正規状態から再構成） | （保存しない） |

8 情報寿命（ADF lifetime、Project lifetime、Architecture lifetime、Requirement lifetime、Change/Case lifetime、Runtime lifetime、reusable Knowledge、未評価 Observation）と各分類の対応は本表の寿命列が基準とする。docs/knowledge/ の知識は repo 内正規状態（reusable Knowledge）に配置する。未評価 Observation（learning/intake の未評価エントリ）は repo 内正規状態（.agentdev/ ドメイン状態）として保存し、評価結果は昇格ガード（DEC-033）に従って振り分けられる。
`.agentdev/jev-observations/` は Jev 先行評価の観測記録の配置先である（REQ-090-006）。分類は repo 内正規状態（git 管理対象、REQ-002-012 準拠）、保存形式は JSON（1 semantic evaluation = 1 observation。JSONL は正本としない）、寿命は未評価 Observation（評価・置換判断の進行に応じた整理方針は評価 Issue で定める）である。再開契約: 観測記録は再開ポイントの構成要素とせず、Workflow 再開時に Jev を再呼出しする（再呼出しは別 observation として記録される）。
REQ-001-034「状態保持領域内の作業用ドラフトは正規のドメイン状態ではなく、コマンド間引き渡し用の中間成果物であること」は Case 状態機械上の正規状態（durable state enum）を指し、本表の「repo 内正規状態（drafts 含む）」は durable state 配置分類（保存権威の置き場所）を指すため、両者は権威クラスを異にして調和する（v3 backlog-artifact-lifecycle Design 配置系 11 識別子の承継・分配の正は第9段 Root Case #3022）。

## 状態と証跡の分離

- 状態（権威）: 完了条件チェックボックス、Issue/PR state、Design/Decision status 等。現行値として更新される
- 証跡（記録）: 検証 SSoT コメント（再実行コマンド列と結果）、対応記録コメント、PR 本文の Findings 等。追記され、現行値として更新されない
- 完了判定は「状態 = チェックボックス、証跡 = SSoT コメント」の分離で運用する（v3 verify-only closure 実績の条文化）

## 導出可能情報の判定基準

導出可能情報は「決定的手順で許容可能なコストで再現できること」を満たすものとする。判定要素は (a) 決定性（同じ入力から同じ結果が得られる）、(b) 再現コスト（機械的再実行で許容時間内に得られる）、(c) 環境固定性（環境に依存しない）。いずれかを欠くもの（高コスト再実行、環境依存、非決定的な検証出力）は証跡として保存する。

## 再構成優先順位の一般化

中断再開の入力解決は SSoT 再構成 > identifier 保持 > 最小 scalar > runtime artifact の優先順位に従う（input-resolution-and-durable-state Design の v3 契約を全実行単位（Case、Wave、委譲、STEP）へ一般化。v3 側の処遇・実行段階の正本は foundations/v3-v4-crosswalk.md の references/crosswalk-inventory.md が所有する）。

- cursor 的状態（現在 stage、workflow route）を正規状態として保存しない。最も早い未収束 stage として再構成する
- 起動時対象集合等の実行中の一時保持は、中断再開に必要な期間に限定してローカルに保持してよい（正規状態ではない）
- Tool 操作単位の障害回復は、Custom Tool の失敗分類（fail-closed 読戻し検証、verification-incomplete）と冪等再試行原則に従う

## 権威移行点

同一の論理状態の権威はライフサイクル段階で移行する。移行点を明示し、移行後の旧権威は投影または削除される。

| 論理状態 | 権威の移行 |
|---|---|
| Definition 内容 | draft ファイル（合意済み要件doc） -> Definition PR -> merge 後の v4-dev branch |
| Case 実行状態 | case-ready 完了後は Root Case Issue と Epic Issue が権威（draft は削除） |
| 検証結果 | 実行時はローカル実行、確定時は SSoT コメント（証跡）として記録 |

## 部分失敗の調整

ADF は複数 store にわたる原子トランザクションを前提としない。部分失敗（例: commit 成功・Issue 更新失敗、Issue 作成成功・ラベル付与失敗）時は、クラス別権威順（GitHub 正規状態 > repo 内正規状態 > ローカル実行環境状態）でどの書き込みが成立しているかを確認し、未成立分を冪等経路で再実行する。安全に自動解消できない場合は停止する。意味的な自動マージを行わない。

repo 外の一時証跡退避先（OS 一時ディレクトリ等）はローカル実行環境状態に分類し、正規状態・証跡として扱わない。恒久的な証跡は Issue comment または PR 本文へ記録する。

## v3 関連 Design の処遇

input-resolution-and-durable-state、step-reference-contract 等、v3 関連 Design の処遇・実行段階・被覆関係の正本は foundations/v3-v4-crosswalk.md の references/crosswalk-inventory.md が所有する。

## フェーズ境界と SSoT 遷移

マクロフェーズ境界を跨ぐ情報は次フェーズが参照する成果物へ永続化する（REQ-005-002/003/004 被覆）。durable state は権威記録先へ遷移する。エラー回復はデータ損失を伴わず、部分失敗は権威順調整で処理する。

## ADF 実行識別情報の記録契約

workflow-contracts Design から迁移した契約（REQ-048-001〜005 被覆）。実行単位・委譲単位・Case・GitHub Issue・PR・ADF 成果物を最小限の識別子で相関可能とする。機械検出可能識別子（Issue 番号、PR 番号、adf_case、DEL-{N}-{n} 形式の SSoT コメントヘッダ等）を優先する。harness 生履歴は読取専用の補助情報とし、harness 内部識別子を正規状態としない。既存情報から導出できる対応付け情報を優先し、新しい必須 field の追加判断は DEC-001 決定4 に従う。adf_* field 系の縮小は導出可能性監査に基づく。
