---
title: クローズ手順の詳細（Epic Wave クローズ・チェックボックス最終評価・単一 Issue クローズ・最終検証）
status: accepted
created: "2026-11-19"
updated: "2026-11-19"
---

<!-- 親: docs/designs/commands/case-close.md から参照される詳細仕様（遅延読み込み）。 -->

# クローズ手順の詳細（Epic Wave クローズ・チェックボックス最終評価・単一 Issue クローズ・最終検証）

### Epic Wave クローズ（REQ-032-015〜022）

- Epic Issue 本文読込（実行構成表（`| Wave | Issue | 前提 | 状態 |`）を解析）
- 現在 Wave 特定（実行構成の未完了状態（pending / blocked / failed）の子 Issue が属する Wave のうち Wave 番号昇順で最も若い Wave。未完了がいない場合は次 Wave）
- PR作成済み子Issue 特定（現在 Wave 内の PR 作成済み子 Issue）
- 各子Issue のクローズ処理を準並列化する（REQ-032-015）
  - 並列実行: PR情報取得、PR変更ファイル取得、Issue本文読取、PR本文読取、完了条件チェック事前評価、capture候補抽出、Design確定候補確認、worktree/branch削除前チェック
  - 直列集約: squash merge、main pull&hash確認、Epic 実行構成の状態更新、.agentdev永続化commit&push、ローカル branch/worktree 最終削除
  - rebase による機械的コンフリクト解消は停止条件外（REQ-003-006 Level1）。解消不能時は case-auto へエスカレーション（REQ-031-004、REQ-003-002 Level2/3）
- Epic 実行構成の状態更新（per-Epic の単一書き手による排他制御（DEC-039、REQ-035-001））。状態列は4値のみ（`pending` → `completed` 等）。PR 番号・URL は状態列に付記せず、子 Issue の結果と PR 自体から取得する

### Epic Issue 完了条件チェックボックス最終評価・更新

Epic 実行構成の状態更新の後、最終 Wave 判定の前に実施する。
Epic Issue 本文の `## 完了条件` セクションを読み込み、全完了条件を QG-4 に従い評価・更新する（完了条件チェックボックス評価の case-close 専任責務（REQ-032-001）、Epic Wave 経路への明示適用、`POL-completion-checkbox-single-writer`）。達成済み判定は条件と証拠の照合による（REQ-032-001）。

#### 評価対象スコープ（QG-4 観点8）

- **中間 Wave**: 当該 Wave でマージされた PR の対象範囲に属する完了条件のみ `[ ]` → `[x]` とする（PR 対象範囲）。他 Wave の完了条件は `[ ]` のまま残す。
- **最終 Wave**: Epic Issue の全完了条件を評価する（全体評価スコープ）。実装完了している完了条件を `[ ]` → `[x]` に更新する。

#### 再読込 VERIFY

更新後に Epic Issue 本文を再読込し、対象完了条件の `- [ ]` が0件であることを確認する（最大2回）。

- 1回目の再読込で `- [ ]` が0件なら最終 Wave 判定へ進む。
- 1回目で `- [ ]` が残る場合は更新を再試行し、再度再読込（2回目）。
- 2回目でも `- [ ]` が残る場合は構造化エラーで停止する（後述「未達項目残存時の停止」）。

#### 未達項目残存時の停止

最終 Wave で実装完了していない完了条件（`- [ ]`）が残る場合、case-close は構造化エラーで停止する（未達項目残存時停止の Epic Wave 経路への明示適用）。
中間 Wave で他 Wave の完了条件が `[ ]` のまま残ることは停止条件ではない（対象外 Wave の完了条件は評価対象外のため）。

停止時の出力には以下を含める:
- 残存する未達完了条件の一覧
- 対応する子Issue の状態（completed / blocked / failed）
- 再開は Root Case 指定である旨（工程別の再開コマンドは提示しない）

- 最終 Wave 判定（全子Issue completed なら Epic クローズ）。それ以外は残 Wave 通知

### 単一 Issue クローズ（従来フロー、後方互換）

- 重複ファイルチェック（`git status --short` と PR 変更ファイル一覧取得（Custom Tool `agentdev_gh` の pr_changed_files）で重複検出）
- 前提確認（達成判定、完了ゲート（QG-4）に従い完了条件チェックボックスを最終評価、更新）。`[x]` 反映事後確認（再読込 VERIFY、最大2回）。未達項目残存時は構造化エラー停止
- docs/ 検証（機能追加固有検証（REQ作成、インデックス、spec更新、Decision）、関連ドキュメント整合性確認、README 索引整合性）
  - close 時 Design / commands / skills 更新漏れの局所確認
  - Design 確定フロー（v2:ADR-0123 Decision #4, REQ-001-015）（対象 REQ に基づく draft Design 棚卸し列挙と、PR 本文 `## Design確定候補` セクションの申告候補（補助入力）の統合による全件評価、確定判断（(a) 昇格 / (b) case-revise 再起動提案（case-ready の Design 保存内部責務で反映）/ (c) 見送り）。申告の有無に関わらず棚卸し列挙を実行する）
  - AUTOGEN block 索引再生成差分検出（project extension checks 経由）。docs/ 検証の後、generate_indexes.ts --dry-run を実行し AUTOGEN block の再生成差分を検出する。本検証は case-close の手順を直接編集せず、Workflow Skill extension（.agentdev/extensions/skills/agentdev-workflow-case-close.yaml）の checks セクション経由で導入する（project-extensions Design 準拠）。case-close は dry-run/差分検査で停止し、直接編集・commit しない。差分がある場合は case-run へ差戻し、再生成（実 commit）は case-run が行う。複数 PR 跨ぎでの AUTOGEN block 再生成漏れを防止する。Epic Wave クローズ経路では Epic Issue 完了条件チェックボックス最終評価の前段に同等の dry-run/diff による索引健全性検証を適用する（Epic Issue クローズ時の索引検証は case_open_hints 参照）
- PRマージ（squash merge（Custom Tool `agentdev_gh` の pr_merge、リトライ最大5回、フォールバック手順）、対応記録コメント追記）
  - squash merge 前の mergeable UNKNOWN ポーリング（REQ-031-017）（Custom Tool `agentdev_gh` の pr_mergeable で mergeable 状態を取得し、UNKNOWN の場合は最大60秒・10秒間隔でポーリング待機。上限超過時はマージ中止・構造化エラー停止。CONFLICTING 遷移時はコンフリクト解消 rebase パスへ分岐）
  - Squash merge 後のローカル先行 commit 検出、処理（REQ-003-005）（`git log origin/{branch}..HEAD --oneline` で検出、内容重複確認後に `git reset --hard origin/{branch}` で reset（`agentdev-git-worktree` の squash merge 後分岐ハンドリング手順参照））
  - コンフリクト解消 rebase パス（REQ-003-001/002、REQ-031-003/025）（squash merge 失敗時）。squash merge がコンフリクトで失敗した場合、`git rebase` による機械的解消を試みる。rebase が自動解決した場合は再マージ（PR マージへ戻る）。rebase 自体がコンフリクトを発生した場合は実装変更を行わず case-auto へエスカレーションし停止する（コンフリクト解消モデル Level 1、`docs/designs/commands/case-auto.md` コンフリクト解消モデル Level 2/3 参照）
- Post-merge 完了条件検証項目の反映確認（CI 通過等）
- Issueクローズ（Custom Tool `agentdev_gh` の issue_close、reason: completed）
- ローカルブランチ、worktree削除（`agentdev-git-worktree` 手順）。未コミット変更検出、共有作業ツリーでの `git checkout .` 禁止（1-writer 検知規律は REQ-030-017）
- 親Epic Issue更新（`agentdev-epic-tracker`、Epic 自動クローズ判定）
- 実行前同期（`git pull --ff-only`、hash 検証）
  - git main 同期リスク事前検出、代替同期手順選択（REQ-031-008）（`git pull --ff-only` 直前に worktree 状態（dirty tree）・並列実行による ref lock 競合・非 main ブランチ占有の3リスクを事前検出。検出時に安全な代替同期手順（直列化待機、`git fetch origin main:main` による非チェックアウト同期）を選択。`agentdev-git-worktree` の git main 同期リスク事前検出プロシージャ参照）
- 学びの検知、抽出（`agentdev-learning-capture`、ユーザーに学び有無を問わない（エージェント自律）、Capture 回収（PR 本文から intake/learning を分離））
- ドメイン状態永続化（`.agentdev/` 配下を commit/push（learning と intake を同一 commit））
- 完了報告（結果状態の分離報告（GitHub側、`.agentdev`、ローカルブランチ削除））

### 最終検証の実行（検証義務に基づく試験範囲選択）と tmp 残存確認

- 最終検証の試験範囲選択（QG-4 合格基準。REQ-032-047）: 当該 Case の変更内容、依存関係、リスク、受け入れ条件および正規契約から導出される検証義務から、必要な試験・検査の範囲を決定して実行する。変更ファイルに直接対応する試験に加え、影響を受ける関連機能および共通基盤の試験を評価対象に含める。試験範囲を安全に限定する根拠が不足する場合、および利用者または正規契約がリポジトリ全体の試験を明示要求する場合は、リポジトリ全体の試験を正規の方法で実行する。execution contract または test strategy で確定・合意済みの検証方法を選択の判断だけでは縮小しない（REQ-032-037 の降格禁止を維持）。試験範囲の選択根拠および除外根拠の記録は完了条件照合（REQ-032-031/033/034）の対象とし、試験範囲の判定は REQ-096 の判断アーキテクチャに従う
- リポジトリ全体の試験を実行する場合の bun test 実行形態: 3 cwd 分割正規形に従う（① integrity suite、② src 側 skill script テスト、③ repo ルート系 guard テストの3分割。各実行の cwd はリポジトリルートに統一、`./` prefix 付きの対象ディレクトリ明示指定、分割② 前の依存パッケージ前置、N/M 件数突合、固定値の期待値化なし、カレントディレクトリトリビアな実行の禁止）。実行形態契約の正は agentdev-quality-gates Design「full integrity suite 合格基準（QG-4）における bun test 実行形態契約」と同スキル references/qg-4-final-acceptance.md が所有する
- 配布物変更を含む case の3検査結果確認: case-close の最終 gate で配布物変更を含む case を検証する場合、配布依存境界・IR-055・traceability の3検査の実行結果（case-run での commit 前実行記録）を確認する。case-run で3検査が実行されていない配布物変更を検出した場合は、検査を実行して新規違反 0 件を確認してからマージに進む。検出違反の全件突合を省略せず、違反の無断削除・隠蔽を受け入れない（baseline による既知違反の区別は撤廃済み、REQ-010-074/079）
- tmp 残存確認: 単一 Issue ルートの正常終了を前提として、当該実行で `.agentdev/tmp/` に作成した一時ファイルが残存していないことをクリーンアップ工程で確認する。Epic Wave ルートでは、当該 Wave スコープの一時成果物（draft、RU、検出事項等の未消化ドメイン状態）の残留と `.agentdev/tmp/` 一時ファイルの残存がないことを確認し、残留時は当該 Wave を完了扱いにしない
- 一時資材の後片付けの評価: 完了判定工程は、当該 Case 実行に伴う一時資材の後片付けの成立を、実行担当が作業記録経路へ返した実施結果、確認根拠、未処理事項と提示された証拠に基づいて評価する。評価範囲は一時資材の共通取扱い契約（REQ-118）と実行契約に反映された条件から導出し（REQ-032-043）、実行したという申告だけを成立根拠にせず、確認可能な具体的な資材については提示された証拠が回収または引継ぎを実際に立証しているかを評価する。必須の後片付けが未完了・確認不能である場合、既知の残存、回収失敗、証拠不足、引継ぎ不成立を検出した場合は完了扱いとせず、検証の成功と後片付けの未達を区別して報告する（REQ-032-044）。ただし ADF が管理・観測していない任意の資材の不存在を機械的に完全証明することを終了の条件にしない。remote 上の対象の不存在判定は HTTP 404 単独で行わず、認証・可視性・対象 ID を確認しても判断できない場合は終了を拒否する（REQ-032-045）

#### 保存済み検証証跡の解析と再実行条件の適用

- 検証結果の件数、失敗明細、サマリーの表示変更は、保存済み証跡（退避ファイル、PR 本文検証差分セクション、SSoT コメント）から行う。同一情報の取得だけを目的とした full suite や checker の再実行をしない（REQ-007-014）
- 再実行の正当理由（変更後検証、環境変更、失敗由来分類、非決定的失敗の再現確認、必須独立検査、証跡欠落）と証跡の必須要素の正は agentdev-quality-gates Design「QG-4 検証証拠の再利用と再実行条件」が所有し、本 Design は再規定しない
- close の最終検証（正規契約から導出した検証義務に基づき選択された必要な試験・検査、配布物変更を含む case の3検査結果確認、QG-4 checker 実測）は origin/main 取り込み済み・マージ直前の branch HEAD で実行する既存契約を維持し、case-run の保存結果だけによる省略を行わない。省略を行わない対象は選択された必要検証範囲の実行義務であり、検証義務がリポジトリ全体の試験を要求する case ではリポジトリ全体の試験の実行義務である。verify-only closure の SSoT コメント参照判定も維持する
- textlint 共通基盤によるファイル単位結果の再利用（同一性条件付きの規則実行省略）は検査基盤内部の実行形態であり、close の最終検査の実行義務の省略を構成しない。close の最終検査は対象全件の列挙・全文取得と現在入力との照合を伴う検査基盤の実行を毎回行い、その内部で同一性が機械検証できた対象の規則実行省略が許容される

#### traceability の門の対象 REQ 行 0 件案件の正規経路と前提の検証順序（REQ-030-032）

traceability の門の、対象 REQ 行が0件の案件の正規の経路と、前提の検証の順序を Design へ反映する。

- 対象 REQ 行が0件の案件の case-close 機械工程における正規の経路は、全体の実行と main の baseline との対照による悪化 0 件の機械証明とする（2026-11-16 の Case #4113 で手で書いた wrapper と同等の役割を正規の実装として提供し、手で書く wrapper を不要にする）。既知の欠落は main の baseline と識別子の集合で完全一致するかぎり不合格の原因にしない。新規の違反を検出する力は維持する（正例・反例の双方で確認する）
- 機械工程の各 phase で、案件の構成と入力の前提の検証を実行する検証の起動より先に実行し、前提が満たされない失敗が早い段階で確定する順序にする。実行する検査の総数は減らさない（検査の省略ではなく、失敗を検出する順序の是正）

#### verify-only closure の QG-4 達成判定（SSoT コメント参照）

verify-only closure（PR も carrier commit も存在しない Issue 完了）の QG-4 達成判定では、
case-run が記録した SSoT コメント（Issue コメント）を実行コマンド列・検証結果の
判定根拠として参照する。PR が存在しないため PR 本文の検証差分セクションは存在せず、
SSoT コメントが検証証跡の恒久記録の正となる。

- 参照手順: SSoT コメントから (1) 3検査（配布依存境界・IR-055・traceability）の実行記録と
  新規違反 0 件確認、(2) 実行した検証の N/M 件数突合と直前実績比較（検証義務がリポジトリ全体の試験を
  要求する場合は integrity suite 全件）、(3) 実行コマンド列の
  再実行可能性（実行 cwd・実行形態の記載）、(4) 実行する検証と実行しない検証の範囲およびその根拠の記載を確認する
- 完了抑止: SSoT コメントが存在しない verify-only closure、または SSoT コメントに
  検証結果の記載が欠落している場合は QG-4 不合格として完了扱いにしない
- capture 回収の N/A: verify-only closure では PR 本文が存在しないため
  capture 回収（REQ-032-005 の PR 本文入力源）は N/A とする。SSoT コメントを
  capture 入力源として扱わない（SSoT コメントは検証証跡チャネルであり
  capture チャネルではない）
