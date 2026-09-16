# 評価レポート

## メタデータ

- **実行日時**: 2026-09-16 09:55
- **対象エントリ数**: 11件（inbox: 11件、deferred: インデックススキャン + 候補本文読込）
- **問題クラス数**: 2（未分類 7件含む）
- **実行形態**: backlog-auto stage 2（learning lane）の同期・直列実行。HITL 境界で一時停止後、親オーケストレータ経由のシリアライズ HITL でユーザー承認（全分類承認、境界ケース U-1/U-2 は promote 確定、prune 9件・commit/push を含む破壊的変更を明示承認）を受領し、永続化継続が STEP-5 確定〜STEP-7 まで完了

## STEP-1 記録（入力読込・正規化）

- inbox.md: 11エントリを読込。全エントリが13項目完全形式（見出しに `YYYY-MM-DD:` 接頭なしのため、解析上は「関連」フィールドの Case/PR 番号から批次を特定。正規化は解析時のみ適用、元ファイル不変）。
- deferred.md: `^## ` 見出し全件とタグ行のインデックススキャン（grep on read、分離インデックス不作成）。候補選択（過剰包含フィルタ）: タグ1件一致 / 見出しトークン一致 / 直近20エントリ。候補本文読込: worktree・checker 実行系（2026-09-05 の targeted docs guard 代替実行・契約テスト untracked 実体、2026-09-01 の bun install/gitignore）、traceability・coverage 系（宣言網羅性系）、adversarial-review 系。
- 全面読みフォールバック: coverage 役割区別系・worktree checker 実行系は pool 末端（2026-09-15 移動分）まで見出し全件レビューで突合し、同一根本原因の pool 既存エントリ有無を確認した。

## 問題クラス一覧

### 問題クラス1: ADF-COVERS coverage 突合の役割区別欠落による implementation 集約の誤認

- **根本原因**: ADF-COVERS 宣言は role（design / implementation / verification）を持つが、REQ 行単位で宣言集合を突合する際に役割フィルタの適用を省略すると、docs 配下の verification・design 役割宣言が implementation 集約済みと同一視され、配布物宣言の除去可否（cleanup）を誤判定する。
- **再発条件**: 配布物 ADF-COVERS 宣言の除去・移動・集約判定で、役割を区別せず REQ ID の存在のみで突合する場合。
- **予防策**: coverage 突合に役割フィルタ＋docs/ パスフィルタを必須化する。除去実行後は traceability check で role 別 coverage の不変（新規 missing 0）を確認する。

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | 2エントリ（同一事象の case-run / case-close 両面からの観測。注記: 捕獲は2件だが事象は Case #2824 / PR #2874 の1件に集中） |
| 影響度 | 4/5 | 除去誤実行時は coverage 対応関係の喪失・missing-implementation 新規発生に直結 |
| 横展開性 | 4/5 | 宣言 cleanup・集約を扱う全 workflow（case-run / case-close / inspect 系）と traceability check の解釈 |
| 反映先明確度 | 4/5 | REQ-057-028 が判定基準の中核を既存所有（本実行でファイル確認）。欠けている運用詳細（役割フィルタ＋後置検査）と反映先候補がエントリ本文で特定済み |
| 自動化適性 | 4/5 | coverage CLI の役割付き出力（--req / --artifact）で機械的に突合可能 |
| プロジェクト固有知識再利用性 | 4/5 | ADF-COVERS 宣言形式・3役割モデルという固有構造に依存する判断知識 |
| 再発可能性 | 4/5 | 配布物 cleanup・宣言集約は REQ-057-028 運用で反復的に発生する工程 |
| 費用対効果 | 4/5 | 突合手順への注記レベルで誤除去による対応関係喪失を防止 |
| **加重合計** | **30/40** | |

- **推奨処分案**: 処分区分5「既存対策の更新」。REQ-057-028（判定基準）は存在するが、役割フィルタ＋docs/ パスフィルタの必須化と除去後 role 別 coverage 確認という運用詳細が case-run / case-close の cleanup 手順・traceability 利用時に明記されていない（fix gap / application miss。本実行で traceability SKILL・case-close reference の確認済み）。採用済み成果物 `promoted/update-adf-covers-role-aware-coverage-audit.md` として staged 予定。

#### エントリ一覧

- coverage 突合では役割（implementation / verification / design）を区別せず集合を結合すると誤認が生じる [inbox]
- coverage 突合で役割を区別しないと verification・design 役割の docs 宣言を implementation 集約と誤認する [inbox]

### 問題クラス2: adversarial-review 発動契約非該当時の判定理由記録様式の欠如（silent skip 回避）

- **根本原因**: 発動契約（default-on、skip policy、adapter の発動条件判定）は存在するが、条件非該当でスキップする際に判定理由を記録する様式・義務が規定されていない。case-close の対応記録コメントテンプレートに adversarial-review の判定欄がなく、adapter reference も非発動時の記録を要求しないため、記録する／しないが実行者依存になる。
- **再発条件**: 発動契約を持つ検査（adversarial-review）を条件非該当でスキップする case（bugfix / maintenance 系で高頻度）、および委譲 prompt の default-on 指示と Issue 本文の発動契約「該当なし」が不一致になる委譲。
- **予防策**: 対応記録テンプレートへ adversarial-review の判定欄（発動/非発動+理由）を追加する。委譲 prompt に「発動条件は Issue 本文契約を正とする」を明記し、非発動時の判定理由記録（PR 本文 / 対応記録）を必須化する。

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | 2エントリ（case-run 委譲面と case-close 対応記録面の別観測） |
| 影響度 | 3/5 | 検証証跡の不完全さ。silent skip は QG-4 等の独立性検査で「未実施」と区別不能になる |
| 横展開性 | 4/5 | 条件分岐する検査（発動契約持ち gate）とサブエージェント委譲全般 |
| 反映先明確度 | 4/5 | 欠落箇所（対応記録テンプレートの判定欄、adapter reference の非発動記録義務）を本実行でファイル確認済み。反映先候補（workflow-templates / adapter / case-run）が特定済み |
| 自動化適性 | 3/5 | 様式の規定は可能だが記載の徹底は半機械。判定欄の機械検証は設計次第 |
| プロジェクト固有知識再利用性 | 3/5 | 発動契約・委譲プロトコルという固有構造に依存 |
| 再発可能性 | 5/5 | bugfix / maintenance 系 case では発動契約非該当が常態（毎回発生し得る） |
| 費用対効果 | 4/5 | テンプレート様式と reference 追記は低コストで証跡完備に寄与 |
| **加重合計** | **28/40** | |

- **推奨処分案**: 処分区分5「既存対策の更新」。adapter reference「発動条件判定」節と Issue テンプレート「adversarial-review 発動契約（任意）」節は存在するが、非発動時の記録様式・義務が規定されていない（guardrail insufficiency。本実行で adapter reference・issue_comment_bug_record.md の確認済み）。採用済み成果物 `promoted/update-adversarial-review-non-trigger-recording.md` として staged 予定。

#### エントリ一覧

- adversarial-review 発動契約非該当の case も判定理由を対応記録に残す（silent skip 回避） [inbox]
- adversarial-review の発動条件非該当時は silent skip せず判定理由を記録し、代替として自己反証を実施する [inbox]

### 未分類（単独エントリ）

| # | 主題 | 加重合計 | 暫定処置と根拠 |
|---|---|---|---|
| U-1 | Draft Definition PR の draft 状態で case-ready の merge が完結不能（agentdev_gh に ready 化操作不在） | 28/40 | promote（処分区分1/3 恒久契約候補）。根拠: (a) agentdev_gh 操作カタログに pr_ready 相当が不在、pr_update は draft フィールドを unknown-field 拒否（Tool 操作契約を本実行で確認）、(b) case-open の Definition PR 作成に draft フラグの規定なし（grep 確認。Batch 間で不統一の原因）、(c) 発現は draft PR 10件の merge 阻止・HITL 停止。単独 capture だが発現10件・機能欠落は二値的な構造ギャップであり「出現回数が少ない」deferred 判定根拠に該当しない。予防策3案（draft: false 統一 / pr_ready 追加 / case-ready の draft 検出経路明記）の選択は req-define の変更影響分析に委ねる（採用済み成果物は選択を先取りしない）。staged 予定: `promoted/add-draft-definition-pr-merge-completion.md` |
| U-2 | case-open が検証対応要否分類ゲートを実行せず、case-ready STEP-6 が新規 REQ 行の unclassified で停止 | 30/40 | promote（処分区分1/5 恒久契約候補・既存対策の更新）。根拠: (a) 当該事象の 36 行は Issue #2867 で一括登録済み（カタログ実施記録を本実行で確認。事象自体は解消）、(b) ただし残余ギャップは現行も open — case-open SKILL は未分類行を許容し最終ゲートを case-ready に置く設計（ファイル確認）で、REQ 行追加を伴う Definition 生成時に verification-scope-catalog 追随を必須とする工程規定は存在しない。#2870 で追加された横断依存検査ゲートは同一パス重複・共有領域未登録行の重複需要検出であり「カタログ更新の不在」そのものは検出しない、(c) 発現は ready 保留 10 Case。次回バッチで同一停止が反復し得る構造ギャップ。staged 予定: `promoted/update-verification-catalog-follow-on-req-row-addition.md` |
| U-3 | case-run が PR 作成後に完了報告を残さず中断すると case-close が PR を検出できない（422 + refs/pull 照合で回収） | 24/40 | deferred（出現1件・再発条件が「PR 作成後・Issue 記録前の中断」に限定されレア）。回収手順（refs/pull/*/head 照合、422 の既存 PR シグナル解釈）は本エントリに自足的に記録されており living pool で参照可能。case-close の PR 検出フォールバック明記（現行は「検出不可時はユーザーに指定を求めて停止」のみ）は再発時に具体化 |
| U-4 | case-open が Definition 変更を main へ直接 push し Draft Definition PR を作成不能にした | 23/40 | deferred（出現1件・運用回避済み。main 反映内容は draft-data の正規投影と diff 検証済みで実害は受入経路の逸脱のみ）。case-open reference に push コマンドの明記なし（grep 確認）は事実だが、refspec 事前検査の規定化は再発時に具体化 |
| U-5 | worktree で bun test 実行時、scripts 配下の package.json ごとに bun install の前置が必要 | — | duplicate（下表参照） |
| U-6 | 配布物（.md）へのスクリプト呼出パスと要件行参照は最初から投影先形式・意味参照で書く | — | duplicate（下表参照） |
| U-7 | worktree 内 checker 実行は git 管理実体と非管理配置で経路が異なる | — | duplicate（下表参照） |

## duplicate 判定（既存対策でカバー済み）

| # | 主題 | カバーする既存成果物（本実行で確認済み） |
|---|---|---|
| U-5 | worktree での bun test 依存整備は scripts 配下（bun.lock 付き package.json）単位の bun install 前置が必要 | .opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md「依存パッケージ前置」節（対象ディレクトリ集合の両方で bun install を要求、`bun install --cwd src/opencode/skills/agentdev-project-extensions/scripts` 等の具体的コマンド、junction 代替、整備後の再実行手順、環境ラベルまで規定。エントリ自身が「QG-4 reference の依存パッケージ前置契約と整合」と申告） |
| U-6 | 配布物本文の要件行参照は意味参照で書き、具体 REQ ID は ADF-COVERS 宣言行に限定する／スクリプト呼出パスは投影先形式で書く | docs/knowledge/distribution-concrete-id-placement.md（規定1・2: 本文は概念名参照、具体 ID は宣言コメント位置へ集約。前回評価の E-02/E-11 と同一知識）+ IR-055 RuntimeReference / 配布依存境界 concrete-id gate（投影先形式でない参照の機械検出。エントリ自身が gate で検出・0 違反化済みと申告） |
| U-7 | 非管理配置 checker は main root から --root 明示で実行する（git 管理実体は junction 伝播で worktree 内から直接可） | .opencode/skills/agentdev-git-worktree/references/worktree-operations.md「メインリポジトリからの読取専用実行」（L157 節）+ agentdev-traceability SKILL の argv 契約表（coverage/check は `--root` + `--req` / `--artifact`）+ case-close reference「worktree root 起点の unclassified 判定時の再実行」（main 側 root での check 再実行を規定）。前回評価の E-17 と同一知識（main root 起動 + --root 明示） |

## 禁止条件フィルタリングゲート（Decision 候補除外記録）

| 対象 | 除外理由 | 根拠事実 | 代替反映先候補 |
|---|---|---|---|
| 全問題クラス・全未分類 promote 候補（PC-1 / PC-2 / U-1 / U-2） | 運用ルール / command 仕様 / 技術判断不在 | いずれも workflow 手順・記録様式・Tool 操作カタログ・工程規定の整備であり、アーキテクチャ上の決定・技術選定・設計判断の記録を本質としない（U-1 の Tool 操作追加は既存 Custom Tool 契約の機能拡張候補であり新規技術選定ではない） | REQ-057（運用詳細）、workflow-templates、agentdev-case-run-execution-adapter、custom-tool-contracts Design、case-open / case-ready workflow 仕様 |

## 全体傾向

- 高影響: U-1 / U-2 はバッチ処理（Case #2821〜#2870、PR #2826〜#2877）の実行時に HITL 停止・ready 保留を生んだ構造ギャップ群。20 Case 一括処理という運用形態が、工程間の共有成果物（agentdev_gh 操作カタログ、verification-scope-catalog）の追随欠落を一斉に顕在化させた。
- 横展開性が高い: PC-1（宣言 cleanup 全般）、PC-2（条件分岐検査・委譲全般）。
- 観察所見: 11エントリ中3エントリ（U-5〜U-7）は既存の配布 skill reference・知識文書・機械検査でカバー済み（duplicate）。バッチ実行の learning capture が既存対策と重複する割合は前回評価（21件中7件）と同水準。

## STEP-4 adversarial-review 記録

- **発動条件判定**: 発動。inbox エントリ 11件（skip 条件「1件のみかつ重複確実」非該当、inbox 空でない）、evaluation-report.md に STEP-2/3 結果反映済み。不可逆処理（deferred 移動・prune・commit/push）は未実行であることを確認。
- **実行形態**: agentdev-adversarial-review の審議プロトコル（Orchestrator / Reviewer / Reviewee の3論理役割、初期 challenge 2系統の独立 stream、対称的相互反証、合意候補再検証）を本 workflow 実行体内の論理役割による inline 審議として実行（書き込み禁止型 semantic_review。審議自体はファイル・Issue・PR への副作用なし。論理役割は物理エージェント構成を固定しない）。
- **レビュー戦略**: 対象 = 問題クラス分類・8軸評価・処分判定・既存対策照合。疑う点 = (i) 冗長昇華（duplicate 見逃し）、(ii) 誤った duplicate 判定による知見喪失、(iii) 異種根本原因のテーマクラスタリング化、(iv) 単発エントリ（単独 capture）の過大評価・前回評価の運用先例（promote は2エントリ以上クラストのみ、未分類は全件 deferred）からの逸脱、(v) prune 対象の誤拡大。
- **Stream-α（分類・評価の内在妥当性）findings**:
  - F-α1【受理・反映】: PC-1 の2エントリ（#8/#10）は同一事象（Case #2824 / PR #2874）の case-run / case-close 両面からの捕獲であり、「発生件数 2」は事象数ではなく捕獲数である。→ 8軸の発生件数判定理由に注記を反映。クラス形成（根本原因 + 再発条件 + 予防策の同一性）は満たすため分類は維持。promote の根拠は発生件数ではなくギャップの実証（REQ-057-028 の運用詳細不在）にあるため処分は不変。
  - F-α2【棄却】: U-1（draft PR）の promote は単発 capture であり前回評価の運用先例（未分類全件 deferred）から逸脱しているとの疑い→前回の deferred 事由は「具体性不足・原因未特定・候補止まり」であり「出現1件」単独ではなかった。U-1 は機能欠落（pr_ready 不在・draft 規定なし）が二値的に実証され（Tool 契約・case-open ファイルを本実行で確認）、発現は draft PR 10件の merge 阻止。処分区分1「機能追加の要因となる知見」に合致し、昇華の余地・具体性ともに十分。promote 維持。
  - F-α3【受理・反映】: U-2（カタログ追随）は事象が Issue #2867 で解消済み・#2870 で部分強化済みであり、残余ギャップの実在を再実証する必要がある→case-open SKILL（未分類許容・最終ゲートは case-ready）とカタログ実施記録（#2867/#2870 の事後登録）を本実行で再確認し、(a) REQ 行追加時のカタログ追随を必須とする工程規定の不在、(b) #2870 ゲートが「同一パス重複・未登録行重複需要」のみ検出し「カタログ更新の不在」を検出しない、を確定。残余ギャップは open。promote 維持（採用済み成果物の対象範囲は残余ギャップに限定し、解消済み事象の再論じをしない旨を反映）。
  - F-α4【棄却】: PC-2 の2エントリ（#9/#11）は case-run / case-close という別局面の観測でありテーマクラスタリングとの疑い→根本原因（非発動時の記録様式・義務の規定なし）・再発条件（発動契約持ち検査の条件非該当 skip）・予防策（判定欄・記録義務の規定化）が同一。適用面の差（PR 本文 vs 対応記録コメント）は同一契約欠落の別表現面。分類基準を満たす。維持。
- **Stream-β（既存対策照合の完全性・duplicate 安全性）findings**:
  - F-β1【受理・確認】: duplicate 3件（U-5/U-6/U-7）のカバー根拠（qg-4-final-acceptance.md 依存パッケージ前置節、docs/knowledge/distribution-concrete-id-placement.md 規定1・2 + IR-055、worktree-operations.md 読取専用実行 + traceability argv 契約 + case-close reference main 側 root 再実行）を本実行で直接読込確認。カバー十分。
  - F-β2【受理・保守的運用】: U-7 の「git 管理実体 / 非管理配置の事前確認ステップ」という細部は worktree-operations.md に明記されないが、実行経路の知識本体（main root 起動 + --root 明示）は既存成果物がカバーし、前回評価の E-17（同一知識）も duplicate 判定の先例。duplicate 維持。細部は本レポートの記録に残る。
  - F-β3【受理・確認】: deferred 判定の U-3/U-4 について、誤った duplicate でも過剰 promote でもないことを確認（U-3: refs/pull フォールバックは case-close 全域で未記載【grep 確認】だが出現1件・再発レア → deferred が適切。U-4: push 手順の未記載【grep 確認】は事実だが出現1件・実害軽微 → deferred が適切）。
  - F-β4【受理・確認】: promote 候補4件（PC-1 / PC-2 / U-1 / U-2）のギャップ主張を正規成果物・Tool 操作契約の実確認で再検証（REQ-057-028 の存在と運用詳細の不在、adapter reference・対応記録テンプレートの非発動記録義務不在、agentdev_gh 操作一覧の pr_ready 不在、case-open の draft 規定不在とカタログ追随規定不在）。ギャップ実在。
- **Convergence**: 受理 findings は全て判定表・注記へ反映済み。未解決の本質的争点なし。
- **Convergence audit**: 受理 findings の根拠を正規成果物（REQ-057.md、verification-scope-catalog.md、case-open / case-ready / case-close / traceability / adapter / workflow-templates の各配布物、qg-4-final-acceptance.md、worktree-operations.md、distribution-concrete-id-placement.md、agentdev_gh 操作契約）の該当箇所と再突合し、分類（2クラスト + 未分類7）、処分（promote 4 / deferred 2 / duplicate 3）、prune 予定が確定したことを再検証。新規争点なし。
- **ループ離脱**: 停止条件4点（新 finding なし、全 finding 処理済み、HITL/blocker 移行なし、対象の意味内容変化は F-α1/F-α3 の注記反映のみで判定表の意味内容は不変）を満たし離脱。STEP-5 境界へ。

## STEP-5 判定確定記録

自律確定可否は workflow-contracts Design「promote系判断確定とHITL境界」の判定表（自律確定可能要件8項 / HITL移送条件8項）に従って判定した。境界ケース U-1・U-2（単独 capture エントリの promote）は親オーケストレータ経由のシリアライズ HITL でユーザー確認のうえ promote を確定した（オプション (a)、暫定分類どおり）。全 11 エントリの分類と prune 9件・commit/push を含む永続化はユーザーの明示承認済みである。

| 対象 | 判定結果 | 主要根拠 | HITL 不要と判断した理由 |
|---|---|---|---|
| PC-1（coverage 役割区別） | promote（staged 予定: update-adf-covers-role-aware-coverage-audit.md） | 30/40。REQ-057-028 既存・運用詳細不在（fix gap / application miss）を実ファイル確認で実証 | 適用契約（REQ-057-028、traceability cleanup 手順）と判断根拠を特定済み。実現先選定は req-define / backlog-review（利用者承認あり）に委ねられており新規対象範囲の決定を含まない。競合する選択肢なし・情報欠落なし |
| PC-2（非発動時記録様式） | promote（staged 予定: update-adversarial-review-non-trigger-recording.md） | 28/40。対応記録テンプレートに判定欄なし・adapter reference に非発動記録義務なし（guardrail insufficiency） | 同上 |
| U-1（draft PR / agentdev_gh pr_ready 不在） | promote（staged 予定: add-draft-definition-pr-merge-completion.md） | 28/40。Tool 操作カタログの機能欠落と case-open draft 規定不在を Tool 契約・ファイル確認で実証。発現10件 | 同上。予防策3案の選択は採用済み成果物に先取りしない |
| U-2（REQ 行追加時のカタログ追随） | promote（staged 予定: update-verification-catalog-follow-on-req-row-addition.md） | 30/40。残余工程規定の不在を case-open SKILL・カタログ実施記録で実証。発現は ready 保留10 Case | 同上。解消済み事象（#2867）は対象範囲から除外 |
| U-3（PR 検出フォールバック） | deferred（living pool 維持） | 24/40。出現1件・再発条件レア（PR 作成後・記録前の中断） | 保留維持は可逆処理であり安全境界（deferred / 未処理の自動削除禁止）の迂回なし |
| U-4（push refspec 誤指定） | deferred（living pool 維持） | 23/40。出現1件・運用回避済み | 同上 |
| U-5 / U-6 / U-7 | duplicate（prune 対応予定） | カバーする既存成果物を本実行で直接読込確認（duplicate 判定表参照） | 既存対策との重複がファイル確認で一意に確定。ユーザーの価値判断・新規範囲決定を含まない |

- **HITL移送条件該当検討**: 複数の本質的に競合する選択肢なし（U-1/U-2 の promote-vs-defer は機能欠落・工程規定不在の実証と発現規模により解消済み。判定根拠は本表と F-α2/F-α3 に記録）/ ユーザー固有の価値判断不要 / 対象範囲の新規決定なし（promote は候補 staging のみ、実現先は req-define が確定）/ 正規情報源間の矛盾なし / 証拠・情報不足なし / レビュー未解決争点なし / 必須検証の利用不能なし / 明示承認を要求する契約なし（破壊的変更に該当せず: inbox クリアは deferred 原子的移動後の正規操作、prune は判定確定と同時承認の設計）。
- **確定結論**: 全項目確定（U-1/U-2 は HITL で promote をユーザー確認、他は自律確定判定をユーザー承認）。判定確定と同時に prune も承認済みとみなし STEP-6 を実行した。

## promote 時 prune 結果

- **対象エントリ数**: inbox.md 移動 11エントリ + deferred.md 既存 119エントリ
- **prune実施**: あり
- **prune候補**: 9件（新規移動分 staged 6エントリ（PC-1 ×2、PC-2 ×2、U-1、U-2）+ 新規移動分 duplicate 3エントリ（U-5〜U-7））。staged 分の証拠は各採用済み成果物「元learning item / 根拠」セクションの prune 証拠行に保存（削除前の完全本文は git 履歴の inbox.md @ 795bfb19 が正）
- **prune却下**: 0件（deferred 判定の U-3/U-4 は living pool に残存。deferred.md 見出し 119 → 121）

## git 永続化

- **対象**: `.agentdev/learning/` 配下のみ（inbox.md、deferred.md、evaluation-report.md、promoted/ 4件）。明示パス指定、`git commit -m ... -- <paths>`（--only pathspec 形式）
- **commit message**: `chore(agentdev): promote learning findings`（commit hash・push 成否は完了報告に記載）
- **実行前同期**: `git pull --ff-only` 実施済み（Already up to date）
