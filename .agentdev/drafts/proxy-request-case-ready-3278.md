# PROXY REQUEST PACKAGE — case-ready GitHub writes（Case #3278）

作成: 2026-10-01T05:40:03+09:00（case-ready resume セグメント）。gh exit 66 により agentdev_gh issue_create（Phase A）が1回失敗 → プロトコルどおり再試行ループなしで停止。
冪等前提は検証済み: open issue は #3278 のみ（失敗 attempt による部分作成なし）・PR #3279 MERGED（mergeCommit 2016c03dbd0a831b232c57a5fe3f80aa51eb479a 手動 READ で再確認）。

## 実行順序と依存（Phase A → B → C → D。必ずこの順）

### Phase A — Epic Issue 作成（1 操作）

- 操作: agentdev_gh `issue_create`
- title: `Epic: REQ-096 ADF判断アーキテクチャ再設計 — 実現面実行（RA-001〜005・Wave 1〜3）（Case #3278）`
- labels: `enhancement`, `feature`, `epic`
- body: **`C:\WINDOWS\TEMP\opencode\case-ready-3278\payloads\epic-body.md` の本文をそのまま送信**（@@MERGE_HASH@@・@@JEV_RECORD@@ はバインド済み。@@EPIC@@・@@C1@@〜@@C4@@ トークンは本 Phase では未バインドのまま送信してよい — Phase C の issue_update で完全版に置換される。冪等性のため部分作成の心配はない〔上記検証済み〕）
- 事後検証（read-back）: Issue が存在し title 一致・labels 一致・`## 分解` / `## 実行順序` / `## ステータス追跡` セクション存在。**戻り値の Issue 番号を @@EPIC@@ のバインド値とする**

### Phase B — Child Issue 作成（4 操作。Phase A の番号が必要）

共通: labels `enhancement`, `feature`。各 body 送信前に **`@@EPIC@@` を全て Phase A の Epic 番号（#N 形式）に置換**する。他トークンは child bodies に存在しない（検証済み）。

1. title: `Wave 1: RA-004 トレーサビリティ整合・v4 責務分類語彙移行・正典参照更新（Case #3278 OU-001）` — body: `child-ou001.md`
2. title: `Wave 2: RA-003 正典REQ行の語彙・参照横断更新 + README索引・AUTOGEN更新（Case #3278 OU-002）` — body: `child-ou002.md`
3. title: `Wave 2: RA-001+RA-005 Workflow Skill 判断規則の新モデル適用と Jev 参照整理（Case #3278 OU-003）` — body: `child-ou003.md`
4. title: `Wave 2: RA-002 配布command定義の HITL・自律確定表現更新（Case #3278 OU-004）` — body: `child-ou004.md`

- **戻り値の番号を作成順に @@C1@@・@@C2@@・@@C3@@・@@C4@@ へバインド**（OU-001→C1、OU-002→C2、OU-003→C3、OU-004→C4 の対応を保持）
- 事後検証: 各子 Issue 本文の先頭行が `Parent: #<Epic番号>` であること（agentdev-epic-tracker 親検出契約）。adf_execution_unit が `standard` であること

### Phase C — Epic Issue 本文更新（1 操作）

- 操作: agentdev_gh `issue_update`（number = Phase A の Epic 番号）
- title: Phase A と同一（変更なし）
- body: `epic-body.md` の **@@EPIC@@ → #<Epic番号>、@@C1@@〜@@C4@@ → Phase B の各番号（#N 形式）に全置換した完全版**
- 事後検証: 分解テーブル・実行順序テーブル・Wave 重複前置検出結果・補足情報内の全 Issue 参照が実番号（#N のみ）であり、@@ トークンが残存しないこと。ステータス追跡テーブルは pending 4 / running 0 / completed 0 / blocked 0 / failed 0 のまま変更しない（単一書き手は case-close）

### Phase D — Root Case #3278 更新（execution contract 確定 + ready 遷移。1 操作）

- 操作: agentdev_gh `issue_update`（number = 3278）
- title: 変更なし（既存 title を維持）
- labels: 変更なし（`enhancement`）
- body: **`C:\WINDOWS\TEMP\opencode\case-ready-3278\payloads\root-case-new-body.md` の本文**。@@EPIC@@ → #<Epic番号>、@@C1@@〜@@C4@@ → 各番号に全置換した完全版（他トークンは全てバインド済み — 事前バインド検証: 残トークンは @@EPIC@@ @@C1@@ @@C4@@ のみ）
- 事後検証（read-back・fail-closed）: ① `- 状態: ready` 行の存在、② `## Execution Contract` セクションの存在、③ `- adf_execution_unit: epic #<Epic番号>` 行、④ `- 次工程: \`case-run\`` 行、⑤ `merge 済み: #3279（2016c03dbd0a831b232c57a5fe3f80aa51eb479a）` の存在、⑥ 既存セクション（概要・対象 REQ・Definition Package・レビュー判断・補足情報）の欠落なし（置換はセクション単位で実施済みの本文を送るため本文比較で確認）

## バインディング値

| トークン | 値 | 状態 |
|---|---|---|
| @@MERGE_HASH@@ | `2016c03dbd0a831b232c57a5fe3f80aa51eb479a` | **バインド済み**（全 payload に適用済み） |
| @@DATE@@ | `2026-10-01` | **バインド済み** |
| @@MERGE_RECORD@@ / @@DEC_RECORD@@ / @@TRACE_RECORD@@ / @@JEV_RECORD@@ / @@XDEP_RECORD@@ | root-case-new-body.md に実測値でバインド済み | **バインド済み** |
| @@EPIC@@ | Phase A の戻り値 | proxy がバインド |
| @@C1@@〜@@C4@@ | Phase B の戻り値（作成順 = OU-001〜004 対応） | proxy がバインド |

## 前提条件（Phase 実行前の全体検証済み事項）

- PR #3279 MERGED・mergeCommit 2016c03dbd0a831b232c57a5fe3f80aa51eb479a（2026-10-01T05:29:07+09:00）
- main ローカル HEAD = 2016c03d → 以降 `fc443bca`（IR-055 cap 51→53）→ `af378585`（DEC-048 accepted + 索引再生成）。push 済み・同期確認済み
- check_integrity（DEC-048 accepted 後）: ok=794 / **ng=0** / warning=1（gh-direct-invocation 既存債務）・info=127
- traceability gate: REQ-096-001〜030 全30行 design 1件/行・missing-design pass・policy 有効
- 横断依存検査: population 1・条件(a)(b) 0件・detection_unavailable なし・gate_effect none
- Jev 逐次経路: 3判断すべて LLM 最終判断 = Jev 結果一致・observation_write 完了（c76f / 6e81 / 00c8）
- open issue = #3278 のみ（Phase A 冪等前提・失敗 attempt の残骸なし）

## Phase D 成功後の残りシーケンス（case-ready 側が実行）

1. STEP-7: draft 削除 `C:\Users\ogatay\work\agent-dev-flow\.agentdev\drafts\req-draft-adf-judgment-architecture-redesign.md`（untracked のため git rm 不要・plain delete）。RU なし。git 操作不要
2. main 同期確認: `git branch --show-current` = main・`git fetch` 後 HEAD = origin/main
3. 完了報告（case-ready 完了報告テンプレート）を親（case-auto）へ返却
4. draft 削除は Phase D の read-back 検証が **成功した場合のみ** 実行（blocked・失敗時は保持）
