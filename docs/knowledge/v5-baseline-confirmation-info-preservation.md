---
title: v5 基準点確認と未処理情報の棚卸し・保全を実行する手順と実測結果
created: 2026-10-10
updated: 2026-10-10
---

# v5 基準点確認と未処理情報の棚卸し・保全を実行する手順と実測結果

## 知識内容

v5.0.0 を再出発点とする基準点確認と、移行前の未処理情報（Intake・Learning・Backlog と周辺の改善記録・参照・処理状態）の棚卸し・保全区分を実行するための手順と、v5.0.1 期間の実測結果である。手順の正規所有は v4-migration-and-release Design「v4 → v5 移行手順と検証」節（未処理情報の意味インベントリ・確認項目・継続条件）であり、本知識はその手順を本リポジトリで実行可能な形に具体化した判断材料である。

### 基準点確認の手順（TS-001 相当）

再出発点 tag の一意性と履歴不変を、次の4確認で判定する。既に PASS 記録が存在する場合は再実行せず、記録の存続と現時点の不変性を確認する（復帰済み証拠の確認による重複実行回避）。

1. tag 参照コミットの一意取得: `git rev-parse v5.0.0^{commit}` が基準コミット（025b25474fd6143da6627c5e80c4b17f09a4e11c）を返すこと
2. 現行系統との祖先関係: `git merge-base --is-ancestor v5.0.0 main` と `git merge-base --is-ancestor v5.0.0 origin/main` が双方成功すること。tag が現行履歴の祖先であることは、履歴書換・tag 移動が発生していないことの確認になる
3. 復帰要否の判定: main が tag と一致しない場合でも、tag が祖先であり開発が tag 以降へ進行している場合は復帰操作（reset・force push 等）は不要である。復帰操作を実行していないこと自体を証拠として記録する
4. 外部履歴（Issue・PR・tag・リリース）の改変有無: tag の再作成・移動・削除を行わず、GitHub 側の外部履歴を操作しない

実測（2026-10-10、worktree cd68ec8d / branch case-3586）: 1〜2 は PASS。main・origin/main は case-open 以降の先行 commit（cd68ec8d）へ進行しているが、v5.0.0 は両系統の祖先であり復帰操作は不要。case-open 時点（2026-10-10T14:40 JST）の PASS 記録は Epic #3585 本文に存続する。

### 先行原文照合の手順（TS-002 相当）

移行対象の受け入れ条件原文が Git 履歴から一意に取得でき、条件数が合致することを確認する。

1. `git show <commit>:<path>` で6ファイル原文を取得する（対象 commit: 21d5708301c3b6989025acb534987a3fb427d1da、`.agentdev/backlog/adf-v5-ru-revised-01-core-process-model.md` 〜 同-06-v5-migration-compatibility.md）
2. 条件行の計数: `- **AC` で始まる行をファイルごとに数え、合計が 48 件（6+6+9+8+10+9）であることを確認する
3. 照合対象が現行ツリーから削除済みでも、Git 履歴からの取得は有効である（case-ready 成功後の正規消費による削除を欠落と誤判定しない）

実測（2026-10-10）: 6ファイル取得・合計 48 条件を確認。case-open 時点の逐語一致（差分 0 行）の PASS 記録は Epic #3585 本文に存続する。

### 未処理情報の棚卸し手順と保全区分基準（TS-013 相当）

棚卸し対象の配置と lifecycle の正は `.agentdev/README.md` 状態表である。3系列（intake・learning・backlog）に加え、未処理改善記録として inspect/inbox、参照・処理状態の記録として blocked・drafts を含めて確認する。

各項目の確認は3点とする（REQ-109-007）: 内容（本文の実在）、処理状態（未処理・保留等の状態値と consumer の特定）、必要な参照関係（根拠・関連参照の実在）。

保全区分基準:

- 保存対象: 未処理・保留・再評価対象の情報。正規 consumer（intake-promote・learning-promote・inspect-promote・backlog-review）へ継続するもの。deferred pool の deferred・未処理・再評価対象エントリは prune 禁止（REQ-003-006/007）
- 廃止対象: 処分確定済み（rejected・duplicate・staged 等、promote 時 prune 条件を満たす）情報。廃止の実施は promote 系正規経路でのみ行い、棚卸し側は分類の提案に留める
- 空確認: 正規 lifecycle（消費後に削除）で空になった配置は「欠落」ではなく「正規消費済み」として記録する。git 履歴で消費経路を裏付ける

欠落・参照不整合・処理状態不明を検出した場合は、対象と理由を棚卸し結果へ記録し、破棄済み・処理済みとして黙認しない（REQ-109-008）。検出 0 件の場合も、調査を実施したことと判定根拠を記録する。

### 実測結果（2026-10-10、worktree cd68ec8d / branch case-3586 時点）

| 配置 | 実在 | 処理状態 | 保全区分 | 根拠・後続継続 |
|---|---|---|---|---|
| `.agentdev/intake/inbox/` | 5件（2026-10-08 case-3549 配布境界 baseline 旧パス DEC-003 エントリ resolved1、2026-10-09 case-3560 並列 Wave 実差分交差確認、同 case-3560 prepare_definition_pr create 対応、同 case-3565 case-open SKILL 旧語彙、2026-10-10 case-3585 write-guard と lint 用一時ファイル） | 未処理 raw item（consumer: intake-promote） | 保存対象 | 本文と根拠参照（Issue/PR 番号）を実在のまま保持。分類確定後の削除は intake-promote の正規経路のみ |
| `.agentdev/intake/promoted/` | 空（.gitkeep のみ） | 正規消費済み（promote → backlog-review の lifecycle） | 空確認（欠落なし） | git 履歴に promote と消費の往復実績（eef19d68・50606d6d 等） |
| `.agentdev/learning/inbox.md` | 21エントリ（`##` 見出し実測。2026-10-08〜10 の case-3548〜3585 由来） | 未整理（consumer: learning-promote） | 保存対象 | 全エントリが13フィールド形式で処理状態・関連参照を保持 |
| `.agentdev/learning/deferred.md` | 182エントリ（`##` 見出し 186件 − 構造ヘッダー4件） | 分類済み living pool（deferred・未処理・再評価対象。REQ-003-006/007 により prune 禁止） | 保存対象 | 処分判定付きエントリも状態値を保持し、次回 learning-promote で再評価される |
| `.agentdev/learning/evaluation-report.md` | 実在（2026-10-08 backlog-auto stage 2 learning 系統 run の報告） | 境界 artifact（毎回上書き） | 保存対象（現行版） | 直近 run の記録。上書き lifecycle 自体が正 |
| `.agentdev/learning/promoted/` | 空（.gitkeep のみ） | 正規消費済み（2026-10-08 run の promote 9単位は backlog-review 経路へ） | 空確認（欠落なし） | git 履歴に promote（f549e506 等）と消費実績 |
| `.agentdev/backlog/req-units/` | 空（.gitkeep のみ） | 正規消費済み（先行RU案6件は case-ready Form Zero で消費。commit 21d57083 で追加、93e35440 で削除） | 空確認（欠落なし） | RU 原文は commit 21d57083 から取得可能（TS-002 の取得経路） |
| `.agentdev/inspect/inbox/` | 11件（2026-09-01〜2026-10-08 の inspect-docs finding。git 管理対象） | 未分類（consumer: inspect-promote。defer 時は inbox 残置） | 保存対象 | REQ-109-007 の3系列外だが未処理改善記録として棚卸し対象。v5.0.0 tag（2026-10-09）以前からの残置を含む。廃止は inspect-promote の正規経路のみ |
| `.agentdev/blocked/` | 2件（case-auto-20261008-3548-3549-3550-3552.md、issue-3494-DEL-3494-1.md） | 過去 blocked 事象の SSoT 記録（永続・git 管理対象） | 保存対象（記録資産） | 処理対象ではなく記録。削除条件は設定しない |
| `.agentdev/drafts/` | 不在 | 正規消費済み（case-ready 成功後に削除。REQ-008-010） | 欠落なし（正規 lifecycle） | commit 93e35440 で消費済み |
| `.agentdev/tmp/` | 非永続領域（git 管理対象外） | 実行時証跡の退避先 | 棚卸し対象外 | 永続 domain state ではない。残渣の扱いは temp-file-debug-residue-cleanup-criteria.md の基準に従う |

廃止対象: 0件（本棚卸し時点で廃止区分に該当する未処理情報は存在しなかった）。
欠落・参照不整合・処理状態不明: 0件（空配置は全て git 履歴で正規消費を裏付け済み。全保存対象に内容・処理状態・参照関係を確認）。

### 後続継続の状態

後続処理の正規入口（intake-promote・learning-promote・inspect-promote・backlog-review の command 定義と workflow skill）は `src/common/` 配下に実在し、保存対象の未処理情報は配置・処理状態を維持したまま各経路へ継続できる。Wave-2 以降の移行実装（v4-migration-and-release Design「v4 → v5 移行手順と検証」節の手順1〜4）は、本棚卸し結果を意味インベントリの未処理改善情報区分の初期入力として使用できる。棚卸しの再実行時は本結果を対照基準とし、差分を新たな棚卸し結果として記録する。

## 適用条件

- v5 移行プログラムの基準点確認・情報保全工程（Wave-1 相当）を実行または再確認する場合
- Wave-2 以降で未処理情報を処理する工程が、保全区分と処理状態の現時点値を参照する場合
- 棚卸し・基準点確認を再実行する場合（本結果を対照基準とし、既存 PASS 記録の存続確認を再実行の前置とする）

## 適用対象

- REQ-109-007（未処理 Intake・Learning・Backlog の内容・処理状態・参照関係の確認と後続継続）の実現面
- REQ-109-008（欠落・参照不整合・処理状態不明の特定と黙認禁止）の実現面
- 親Epic 完了条件の TS-001・TS-002・TS-013 に対応する実行手順面（検証方法の再実行可能性の保持）

## 根拠

- Issue #3586（実行契約）、Epic #3585（実行構成表・完了条件・TS-001/TS-002 実行済み PASS の記録）
- REQ-109-007/008、DEC-056（意味保存移行・未処理改善情報の継続・baseline tag を対照基準とする検証）
- docs/designs/foundations/v4-migration-and-release.md「v4 → v5 移行手順と検証」節・「未処理 Intake・Learning・Backlog 情報の移行と継続」節（手順の正規所有）
- .agentdev/README.md 状態表（配置と lifecycle の正）
- 実測コマンド: `git rev-parse` / `git merge-base --is-ancestor` / `git show` / ファイル列挙・見出し走査（2026-10-10 実施。証跡は Issue #3586 の PR 本文検証差分セクションを参照）

## 関連知識

- [qg4-baseline-detached-worktree-reproduction.md](qg4-baseline-detached-worktree-reproduction.md)（baseline object 参照不能時の原因調査と由来分類）
- [worktree-environment-fail-classification.md](worktree-environment-fail-classification.md)（検査実行の環境ラベルと由来分離の規律）
- [temp-file-debug-residue-cleanup-criteria.md](temp-file-debug-residue-cleanup-criteria.md)（非永続領域の残渣扱いと provenance。`.agentdev/tmp/` を棚卸し対象外とする根拠）
