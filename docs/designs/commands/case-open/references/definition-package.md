---
title: Definition Package と冪等再実行・review_dispositions の消費・元追跡Issue参照形式・受け入れ義務保存の投影
status: accepted
created: "2026-11-19"
updated: "2026-11-19"
---

<!-- 親: docs/designs/commands/case-open.md から参照される詳細仕様（遅延読み込み）。 -->

# Definition Package と冪等再実行・review_dispositions の消費・元追跡Issue参照形式・受け入れ義務保存の投影

## Definition Package と冪等再実行（REQ-030-010）

- Definition Package の構成、設計PR / 設計修正PRの lifecycle、canonical Definition の判定、冪等キーは case-open / case-ready Design が正規所有する（v4）。
- case-open は再実行時、既存 Root Case および既存設計PRを冪等キーで検出し、再利用する。重複生成しない（REQ-030-010）。
- 不足分だけを処理する。Root Case が存在し設計PRが存在しない場合は PR 生成のみを実行し、Root Case が存在しない場合は Root Case 確立から実行する。両者とも存在する場合は新規生成を行わない。
- 設計PRは canonical Definition に実変更がある場合のみ作成する。canonical との差分が空の場合（bugfix / maintenance / docs_chore 等の実変更なし Case）は作成しない（REQ-030-002）。実変更判定が不能な場合は PR を作成せず停止し、判定不能の理由を報告する。

### 並行 case-open の作業隔離規律（REQ-030-017）

並行して case-open を実行する場合の作業隔離規律を Definition branch 作成・PR 作成の運用手順へ定める:

- **Case 専用 worktree の前置**: 並行 case-open を実行する場合、各 Case は専用 worktree（`.worktrees/{N}-definition`）で作業する。作成手順は agentdev-git-worktree 標準手順（type=definition）に従い、本 Design は作成手順を複製しない。作業隔離要件（作成元 origin/main HEAD・スタック構造禁止・1-writer 侵害検知・merge-base 起点差分検査）の所有は本 Design が維持する。共有 working tree での Definition 変更作業を行わない。
- **Definition branch の origin/main HEAD からの独立作成**: Definition branch は origin/main HEAD から独立して作成し、兄弟 Case の Definition commit を含むスタック構造を作らない。branch 命名（REQ-083）は既存規定のまま、本規律は branch 作成元と作業隔離を定める。
- **PR 作成前の自 Case 差分検査**: PR 作成前に merge-base と diff --stat により差分が自 Case 分のみであることを検査する。兄弟 Case の commit を含むスタック構造を検出した場合は、隔離 worktree での差分再構成（origin/main HEAD からの branch 再作成と明示パスによる変更の再適用）で救済してから PR を作成する。
- **明示パス指定ステージ**: ステージは明示パス指定で行い、スイープ操作（`git add -A` 等）は行わない。
- **1-writer 前提侵害の検知と早期断念**: `git status` により worktree 1-writer 前提の侵害（in-scope 外の書込み混入）を検知した場合は直ちに停止する（早期断念）。

### 検証スコープポリシー追随工程（REQ-030-015）

REQ 行追加を伴う Definition Package の生成時、検証スコープポリシー（`traceability/policy.yaml`）更新の追随要否を確認し、必要なポリシー更新を Definition に含める。ポリシー編集は設計PRの構成要素として扱い、直接適用しない。

### 横断依存検査（STEP-5、REQ-030-012〜014）

- STEP-5 冪等確認の実行時、draft の artifact_actions と未クローズ Case 群の変更対象成果物を機械的に比較し、2 以上の Case 間で同一パスが重複する場合、警告として投入者に提示する。共通契約は case-open / case-ready Design が正規所有する（v4）。
- 検出源は draft の artifact_actions と未クローズ Case 群の宣言に限定し、合意済み宣言以外の一般的な変更影響探索・依存関係探索を行わない（REQ-021-014、REQ-030-013）。
- Epic を構成する投入では同一投入内（Epic 配下 Wave 内）の変更対象ファイル重複検出を case-ready の前置検出（REQ-035-012）へ委譲し、二重検査としない。Epic をまたぐ Case 間の重複のみを検出対象とする（REQ-030-014）。
- 警告は Root Case の確立を自動阻止せず、警告の提示記録を完了報告へ含める。

### 意味変更行の design 対応事前確認

Definition Package の生成・転記（STEP-2 / STEP-3）は、対象要件行のうち既存行の意味変更を含む場合、
agentdev-traceability の coverage --req による当該行の design 対応有無の事前確認を実施する。
事前確認で design 対応が欠落する意味変更行を検出した場合は、当該行の design 対応を
artifact_actions（artifact: design）へ組込んだ上で合意を完了する。事前確認を省略した Case は
case-ready の lifecycle gate completeness（fail-closed）で停止し得る。プロジェクトの採用した
工程・成果物規約が要求する設計根拠対応の欠落ゲート（missing-design、REQ-021-024）への
予防手順として位置づける。

## review_dispositions の消費

case-open は draft の `review_dispositions` を読み取り、採用済みの内容が artifact_actions へ反映されていることを確認する。Root Case 本文への全件転記と「レビュー判断」セクションを生成しない。判断理由の記録が必要な採否（reject とその理由等）のみ、必要に応じて Issue コメントへ残す。

`review_dispositions` を持たない旧ドラフトを case-open は入力として拒否しない（DEC-003 準拠）。

## Case Issue 本文の元追跡Issue参照形式

追跡Issueから生成 Case への参照を関係追跡の正とし、Case Issue（Root Case を含む）の本文に元追跡Issueへの逆参照を記録しない（REQ-049-005「追跡Issueと生成された Case Issue の関係は後から追跡できること」の一方向実現）。

- **記載しない形式**: Case Issue 本文冒頭の `Tracking: #N` 行を記録しない。旧形式の当該行を新規 Issue で生成せず、旧形式を恒久的に読み続ける互換層を残さない
- **追跡Issue側との対応**: 追跡Issue側の本文標準構造（関連 Case Issue への参照セクション）のみに関係を保持する。論理スキーマの正は agentdev-issue-tracking Design が一元管理し、本節は Case Issue 側の非記載のみを定める
- **`親Epic: #N` との区別**: `親Epic: #N` は Epic Issue と子 Issue の階層関係を表す形式であり、元追跡Issue参照の用途には使用しない

## 受け入れ義務保存の投影（REQ-030-019〜021、RU-20261004-08）

Definition Package 生成・確定における受け入れ義務保存の実行時投影。

- Definition Package の生成時、合意済み入力（RU・要件doc）の必須受け入れ義務（目的、対象範囲、禁止、対象外、受け入れ条件、必須検証義務）について、投影後の成果物だけの自己整合確認ではなく、最新の合意済み入力との照合で忠実性と投影完全性を確認する。欠落・縮小・反転を検出した場合は Root Case の確定・実行へ進まない。
- 義務対応の確認は対応先の存在確認に留まらず、元の義務の意味、評価範囲、禁止事項の保持を確認する。対応先のない義務は非該当（not applicable）として扱わず、投影不完全として処置する。
- 必要情報と確認根拠を Definition Package へ保持した後は、当該成果物を下流の検証基準とする。
- Definition 確定後に投影不備が判明した場合は、消費済み入力で実行契約を非公式に補完せず、正規の訂正経路（req-define 再合意を経る case-revise 等）での修復へ差し戻す。
- 偽陽性回帰シナリオ「元の合意から正規契約への投影に欠落・反転があるが、投影後の契約と実装・検査が自己整合していることを理由に通過する」を、実経路に接続した決定的回帰試験で拒否する。
