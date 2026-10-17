# 評価レポート

## メタデータ

- **実行日時**: 2026-10-17（backlog-auto stage 2 learning 系統。run 開始 2026-10-17T10:25:02+09:00）
- **基準 revision**: 8d6787d8（inbox.md E8 タイトル行記載の capture baseline。本 run は git 操作禁止〔親 orchestrator serialization 契約〕のため run 実行時 HEAD の一致検証は未実施。inbox エントリの baseline 記載は E1/E2 が 273c1510、E3〜E7 が 678b40ae、E8 が 8d6787d8 と混在するが、エントリ内容の正規化・分類に影響なし）
- **対象エントリ数**: inbox 8 件、deferred 250 件（見出し254行のうち4行は様式・説明見出し。実行前実測）
- **問題クラス数**: 8（すべて単独1エントリ構成。C1 は deferred pool 内に同クラス先行エントリ〔2026-10-13移動 L4320〕があり、意味クラスとしては2エントリ相当として発生件数を導出。C2 の junction 系先行3件と C3 の branch 再利用先行1件は根本原因が別のため同クラスに数えない〔adversarial-review 独立 stream が確認〕）
- **Jev**: 分類1評価（20261017T103237Z-33a5）・8軸6評価（20261017T103357Z-5b4d〔C1〕・20261017T103357Z-c54c〔C2〕・20261017T103511Z-fa64〔C3〕・20261017T103556Z-2644〔C4/C5〕・20261017T103705Z-5069〔C6/C7〕・20261017T103754Z-6aea〔C8〕）・処分区分1評価（20261017T103859Z-2b04）・昇華可能性1評価（20261017T104003Z-dbff）・review 発動条件1評価（20261017T104032Z-334d）・review 反映後の再判定1評価（20261017T105202Z-fb30）。finalResult は observation_write で追記済み。evaluator との差異は e1-反映先明確度〔evaluator 3 → 最終 4・名指し可能性を重視〕、e4-再利用性〔evaluator 2 → 最終 1・発火局面の稀さを重視〕、e6-費用対効果〔evaluator 4 → 最終 1・追加対策の新規投資価値を測る解釈〕に semantic_disagreement、e1-e4-e2 の軽微な水準差を記録。発生件数軸は deterministic 境界により機械導出（C1=2、他=1）
- **旧 report**: 2026-10-16 実行分（Case #3725 クローズ由来 8件対象）のため本レポートで上書き置換
- **extension**: `.agentdev/extensions/skills/agentdev-workflow-learning-promote.yaml` の読込は本 run では実施せず（前回 run で 5 セクションすべて空を実測済み。変更検知手段なしのため前回実測を引用。fail-open）
- **旧 resume note**: `.agentdev/learning/learning-promote-2026-10-15-resume.md` は 2026-10-15 run（Case #3725・41件）の中断時履歴であり、当該対象は 2026-10-16 run で完了済み。本 run の再開点再構成には永続状態（inbox/deferred/promoted/evaluation-report 実ファイル）のみを使用し、resume note は使用せず・削除もしなかった

## 判定基準

処分はスコアのみで決めらず、既存恒久対策の現状、実害、情報の自足性、昇華可能性、既存プールとの関係を併せて評価した。十分な恒久対策により既に網羅されているものだけ duplicate とし、deferred pool に似た記録があるだけでは duplicate にしない。promote（既存対策の更新）は既存恒久手順の具体的 gap を実測（grep・ファイル読取・全文読取）で確認できた場合に限った。Decision 候補は禁止条件ゲート（`agentdev-decision-guidelines` 除外基準）で全単位除外した。既知欠陥の記録で修正対象が明確な場合は learning としての対策価値の不在を学習価値の不在と解釈し rejected とした（恒久検出経路が既存の場合に限定）。

## 問題クラス一覧

軸順: 発生件数 / 影響度 / 横展開性 / 反映先明確度 / 自動化適性 / プロジェクト固有知識再利用性 / 再発可能性 / 費用対効果。加重合計は満点40（/40）。C番号は inbox 見出しの出現順（E1〜E8）に対応。

### C1: 実行ハーネスの実装委譲起動 API 不在時のインライン自己適用（self-apply）

- **根本原因**: 実行ハーネスの一般サブエージェント起動手段が研究系（explore/librarian）に限定され、実装委譲の起動経路が未提供
- **再発条件**: 同一ハーネス（実装委譲起動 API 不在）で case-auto を実行した場合
- **予防策**: harness-delegation reference の起動手段と実行ハーネス実態の突合、委譲起動前能力検出（既存恒久手順に規定済み）

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | E1 + deferred pool 同根先行エントリ（2026-10-13移動・L4320）の2エントリ構成。再発2回目 |
| 影響度 | 1/5 | self-apply で 9 Issue 実行を完遂。契約内処理で実害なし |
| 横展開性 | 3/5 | 同一 harness での case-auto 実行全般に当てはまるが harness 固有の条件付き |
| 反映先明確度 | 4/5 | REQ-031-033・harness-delegation.md・AGENTS.md と名指し可能。ただし恒久契約既存で追加反映の余地は小さい |
| 自動化適性 | 3/5 | 能力検出は恒久手順化済み。残余の突合観点は手動確認が主体 |
| 再利用性 | 2/5 | 契約適用実績の記録であり新規運用知識としての追加価値は小さい |
| 再発可能性 | 4/5 | 同一 harness では継続再発（2回観測実績）。契約内処理で完遂される |
| 費用対効果 | 1/5 | 恒久契約既存で追加対策の価値なし |
| **加重合計** | **20/40** | |

- **推奨処分案**: duplicate。恒久契約 REQ-031-033（能力検出→接合形態決定〔self-apply〕→記録の経路を正規規定。frontmatter updated 2026-10-08）と `agentdev-case-run-execution-adapter` references harness-delegation.md「委譲起動不能時の事前判定経路」（Case #3086 実証済みと明記）が本事象の経路を正規規定済み。同根先行記録が pool に保持中。inbox 申告の「REQ-031/034 乖離再評価候補」は現行契約実測読取で不成立（self-apply は正規経路として許容済み・REQ-034 側も起動手段は harness 責務で整合）。adversarial-review 独立 stream 2本が duplicate を支持
- **既存対策照合**: 対策あり・ギャップなし。残余の改善候補（AGENTS.md ハーネス選定への露出明記）は先行 deferred エントリ（L4320）の予防策として保持中
- **統合記録**: 先行エントリ（L4320）へ「統合追記（2026-10-17 learning-promote）」を適用し、再発2回目の事実と duplicate 受理根拠を記録
- **エントリ一覧**
  - case-auto 実装実行委譲の起動不能時のインライン自己適用実績 [inbox]

### C2: 配布依存境界 checker の実行 cwd 差によるスキャン集合変動

- **根本原因**: 実行 cwd（junction 伝播状態・スキャン対象解決）により検査対象集合が変動し得る経路の存在
- **再発条件**: worktree cwd での checker 実行が main root 実行と異なるスキャン集合に解決される場合
- **予防策**: checker 実行 cwd・scanned 数の gate 記録への必須記載

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 単独エントリ（link profile zero-targets 系3件は完全無効実行という別現象で同クラスに数えない） |
| 影響度 | 1/5 | checker が設計どおり検出し test-fix で即修正。実害なし |
| 横展開性 | 3/5 | 配布依存境界 checker を worktree で実行する gate 全般で起こり得る |
| 反映先明確度 | 4/5 | distribution-boundary Design・checker 実行記録と名指し可能 |
| 自動化適性 | 4/5 | cwd・scanned 数の記録は機械的 |
| 再利用性 | 2/5 | checker gate 運用者に限定される知識 |
| 再発可能性 | 3/5 | worktree cwd 実行は頻繁。検出は最終 gate が担保 |
| 費用対効果 | 1/5 | 実害なし・最終 gate が担保で追加対策の価値小 |
| **加重合計** | **19/40** | |

- **推奨処分案**: deferred。実害なし・最終 gate が設計どおり検出・test-fix 修正済み（PR #3775）。恒久 checker による網羅性は最終 gate で担保済みだが、実行 cwd・scanned 数の記録規定は未確認。docs/knowledge/ の配布依存境界系知識文書（3件実測: distribution-concrete-id-placement.md・distribution-boundary-diff-normalized-matching.md・baseline-substitution-vocabulary-crosscheck.md）には本観点の被覆なし。実行コンテキスト差の観点記録として living pool で保持。再評価条件: 同種事前 gate 検出漏れの再発時、checker 実行記録規律の整備機会発生時
- **既存対策照合**: 対策あり（恒久 checker 最終 gate）・ギャップ: 恒久被覆済みだが検出平面差の観点記録は未整備
- **エントリ一覧**
  - 配布依存境界 checker の実行コンテキスト差によるスキャン集合差異 [inbox]

### C3: case-open draft 永続化 commit 残存による canonical-and-cleanup の構造的分岐

- **根本原因**: case-open が draft 永続化 commit をローカル main に積んだまま設計PR（squash）を merge する正規経路のため、squash merge 後の origin/main とローカル main は構造的に分岐する。script の ff-only 経路はこの分岐を想定せず、既存の分岐ハンドリング手順は case-ready STEP-7 に配線されていない
- **再発条件**: ローカル main に未 push の commit がある状態で pr_merge（squash）を完了し、case-ready の canonical-and-cleanup を呼び出した場合
- **予防策**: 分岐検出時の既存手順（Squash merge 後分岐ハンドリング手順）への接続（script フォールバックまたは手順前置）

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 単独エントリ（squash merge 分支再利用の先行記録 L1952 は branch 再利用が原因で別クラス） |
| 影響度 | 4/5 | STEP-7 が exit 1 で停止。解消は手動 rebase（重複分析前置）に依存。script 単独では canonical 同期が完遂できない |
| 横展開性 | 4/5 | 同一 Case の draft 永続化 commit 残存を持つ全 case-ready 実行と case-revise 由来の再実行で再現 |
| 反映先明確度 | 5/5 | accept_definition_checks.ts・readiness-and-cleanup.md・git-common-procedures.md 手順と行単位で名指し可能 |
| 自動化適性 | 4/5 | 分岐検出と既存手順の接続は script 実装可能 |
| 再利用性 | 3/5 | case-ready STEP-7 運用知識として中程度 |
| 再発可能性 | 5/5 | case-open の draft 永続化 commit + squash merge の構造が正規経路のため構造的に常時発生 |
| 費用対効果 | 4/5 | フォールバック接続または手順前置の明記は中〜低コストで毎回の停止コストを除去 |
| **加重合計** | **30/40** | 8クラス中最高 |

- **推奨処分案**: promote（既存対策の更新）。実測で確認した具体的 gap: （1）accept_definition_checks.ts L553-571 は fetch/ff-only 失敗時に warning を push して終了するのみで分岐検出・フォールバック実装なし（case-ready skill 全体に rebase 言及ゼロ・テストも fail 停止契約を pin）、（2）既存恒久手順「Squash merge 後分岐ハンドリング手順」（git-common-procedures.md L521-586。完全重複 reset / 部分重複 soft reset 提案 / 独立変更ユーザー報告の処理分岐）は case-close STEP-4-3 にのみ配線され case-ready STEP-7 から未参照、（3）readiness-and-cleanup.md（STEP-7）に分岐時の参照規律なし、（4）handoff.md L32-36 で case-open が main 作業ディレクトリで draft 永続 commit を実行する構造を実測。inbox E3 の「手順 8」記述は誤記（正は「Squash merge 後分岐ハンドリング手順」節）で採用済み成果物で訂正記録。adversarial-review の反証を受理して反映先を精密化
- **既存対策照合**: 対策あり・ギャップ: fix gap（case-ready STEP-7 への未配線）
- **エントリ一覧**
  - case-ready canonical-and-cleanup の ff-only merge が squash merge 後の分岐で失敗 [inbox]

### C4: Release 作業前記録の粒度不足（body 不含の一覧取得）

- **根本原因**: 作業前記録の取得に body を含まない release_list（正規化一覧）を使った
- **再発条件**: release_list の正規化一覧（body なし）のみで既存 Release の作業前記録を取得した Release 補完・移行系の検証
- **予防策**: 作業前記録を release_read（body 含む）で対象タグごとに取得

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 単独エントリ |
| 影響度 | 1/5 | 検証は代替根拠で完了済み。遡及不能は記録粒度の制約のみ |
| 横展開性 | 2/5 | 観点自体は検証設計一般に適用可能だが発火局面〔Release 補完〕が稀 |
| 反映先明確度 | 5/5 | end-to-end-execution.md「Release 記録手順」を名指し可能 |
| 自動化適性 | 3/5 | release_read での記録取得は容易だが発火機会が稀 |
| 再利用性 | 1/5 | Release 補完運用に限定。再利用機会がほぼない |
| 再発可能性 | 2/5 | Release 補完の再実行は稀 |
| 費用対効果 | 1/5 | 発火機会の稀さから手順明記の価値は小さい |
| **加重合計** | **16/40** | |

- **推奨処分案**: deferred。実害なし・代替根拠で検証完了済み・出現1件・発火局面が稀。反映先（end-to-end-execution.md L269/L272）への明記候補は具体だが手順明記の実施価値は低い。living pool で保持。再評価条件: Release 補完・移行系検証の再実行時
- **既存対策照合**: 対策あり（読み戻し確認手順の release_read 許容）・ギャップ: 作業前記録の粒度指定不在
- **エントリ一覧**
  - 既存 Release の作業前記録が body を含まず遡及突合不能 [inbox]

### C5: plugin.ts 既存 typecheck 欠陥（RepoResolveDiagnostics 衝突）

- **根本原因**: 既存の import（L34）とローカル宣言（L78）の衝突。修正対象は別 Case（plugin.ts の名前衝突整理）
- **再発条件**: agentdev-gh-tool plugin package で tsc --noEmit を実行した場合（修正まで恒常再現）
- **予防策**: 学習としての対策なし（修正はコード修正。恒久検出経路は既存 typecheck gate）

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 単独エントリ |
| 影響度 | 1/5 | QG-4 判定は対象 package の typecheck 合格で成立、テストは 19 pass。検証基盤への影響は限定 |
| 横展開性 | 3/5 | 本 plugin 固有の欠陥だが「typecheck とテスト pass の乖離は対象外問題の検知点」の観点は typecheck 運用一般に適用可能 |
| 反映先明確度 | 2/5 | 行単位で具体だが learning の反映先ではなく修正 Case の対象特定に留まる |
| 自動化適性 | 1/5 | 修正自体はコード修正で learning の予防策（手順化）なし |
| 再利用性 | 1/5 | 本欠陥に固有で一般化知識は少ない |
| 再発可能性 | 4/5 | 修正まで恒常再現 |
| 費用対効果 | 1/5 | learning としての対策はなく修正待ち。既知欠陥の記録としての価値のみ |
| **加重合計** | **14/40** | |

- **推奨処分案**: rejected（学習価値なし）。既知欠陥の存在記録で修正対象が別 Case と明記済み。恒久検出経路（plugin package の typecheck: `tsc --noEmit`・tsconfig strict）が既存で欠陥を決定的に検出する。adversarial-review 独立 stream が衝突実在（plugin.ts L34 vs L78）と typecheck gate による恒久検出を確認し rejected を支持。learning pool の保持対象ではなく、修正は実装 Case の経路で追跡されるべき対象。prune 対象（本 report と実行記録に根拠を保存）
- **既存対策照合**: 対策あり（typecheck gate による恒久検出）・ギャップなし（検出済み。修正は別 Case 対象）
- **エントリ一覧**
  - plugin.ts 本体の typecheck 既存問題（RepoResolveDiagnostics 衝突） [inbox]

### C6: 草稿 Release の物理写像差（tags 参照不可・一覧反映伝播遅延）

- **根本原因**: GitHub API の物理写像差（草稿は一覧のみ取得可、一覧反映に伝播遅延）を verify 設計が想定していなかった（本 Case の実装で吸収済み）
- **再発条件**: 草稿 Release の作成直後に tags 参照または即時一覧照合で verify する実装（pin テストで構造的に防止済み）
- **予防策**: 一覧照合方式固定 + 伝播遅延吸収 poll pin（実装済み）

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 単独エントリ |
| 影響度 | 2/5 | verify fail 1回・pin 修正で解消済み |
| 横展開性 | 3/5 | 外部 API 物理写像差を含む操作契約一般の観点だが草稿 Release 固有の物理写像 |
| 反映先明確度 | 4/5 | custom-tool-contracts.md Release 操作節・specs-release.ts pin テストと名指し可能 |
| 自動化適性 | 5/5 | 予防策は既に契約テストとして実装・pin 化済み |
| 再利用性 | 3/5 | Custom Tool 契約の物理写像知見として中程度 |
| 再発可能性 | 2/5 | pin テストで物理写像差が固定済み。pin 変更時を除き防止 |
| 費用対効果 | 1/5 | 追加対策の実施価値なし（既に pin 化済み） |
| **加重合計** | **21/40** | |

- **推奨処分案**: duplicate。予防策（一覧照合方式固定・伝播遅延吸収 poll・重複即失敗）は specs-release.ts に実装・pin 化済み（L51/L59/L170-171 実測）で、pin テストも存在（runner-cli.test.ts L1597-1680、contracts.test.ts L173。adversarial-review 独立 stream が実在確認）。Design（custom-tool-contracts.md L43）の物理写像明示の不在は実装詳細隠蔽原則により契約 gap ではなく、inbox 申告どおり case-close STEP-3-2 で見送り記録済み〔対応記録コメント、GitHub 操作禁止のため本 run では確認不能と正直記録〕+ 再評価契機あり。追加対策の実施価値なし。adversarial-review 独立 stream が duplicate を支持
- **既存対策照合**: 対策あり・ギャップなし（pin テストによる恒久被覆を実測で確認）
- **エントリ一覧**
  - GitHub API の草稿 Release 参照制約と一覧反映の伝播遅延 [inbox]

### C7: DefinitionEdit 連結組立時の行構造事前検証不在

- **根本原因**: 文字列連結（prefix 文字列 + 追加行リストの join）で行リストを組み立てる際、oldText 末尾に行末改行が含まれない前提の見落とし + 連結結果の行構造を検証する事前確認の不在
- **再発条件**: 旧文の末尾に行末改行を含まない DefinitionEdit に対し、newText を連結で組み立て、行区切りを明示しない実装
- **予防策**: DefinitionEdit ごとに newText の行数（oldText 行数 + 追加行数）を機械検証する事前確認を組立手順へ追加

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 単独エントリ（近縁の入力組立欠陥 L4782〔重複による旧文不在 fail・commit 前停止で無害〕は根本原因が別で同クラスに数えない。ただし同一 STEP-4 入力組立の近縁欠陥として対策統合の材料） |
| 影響度 | 2/5 | 連結行の適用・commit という実害が1回発生（PR 作成前に修正）。traceability check の fail-closed で確実に検出される構造だが検知は commit 後 |
| 横展開性 | 4/5 | DefinitionEdit 系の入力 JSON を文字列連結で組み立てる実装全般に適用可能 |
| 反映先明確度 | 4/5 | definition-pr-and-idempotency.md 機械工程手順（L35 条項）を名指し可能 |
| 自動化適性 | 5/5 | newText 行数の機械検証は容易に実装可能 |
| 再利用性 | 3/5 | case-open 機械工程の運用知識として中程度 |
| 再発可能性 | 3/5 | 連結組立は繰り返し起こり得る。検知は commit 後のため悪い commit は発生し得る |
| 費用対効果 | 2/5 | 事前確認追加は低コストだが fail-closed 検出機構が事後担保済み |
| **加重合計** | **24/40** | |

- **推奨処分案**: promote（既存対策の更新）〔adversarial-review 反映で deferred から変更〕。初期評価の deferred は traceability check の fail-closed 事後担保を根拠としたが、独立 challenge stream（Stream B）の全文読取で（1）definition-pr-and-idempotency.md に newText 行構造・行数の組立て後検証規定が存在しない（L35 は完全一致一意指定のみ、L47 事前検証は gate spec 対象外）、（2）L40 verbatim 包含突合は各行の文字列が連結行に含まれれば成立する行構造破壊への構造的不感、（3）検知は commit 後の traceability check で悪い commit が既に発生する、の3点を確認。orchestrator が全文再読取で実証。実害1回（連結行の適用・commit・PR 前修正）と近縁欠陥第2例（L4782）を根拠に、機械工程手順への行構造検証規則追加を「既存対策の更新」として採用済み成果物へ引き渡す。反映先と近縁エントリの統合反映判断は req-define の情報候補
- **既存対策照合**: 対策あり（事後: verbatim 包含突合・traceability check fail-closed）・ギャップ: fix gap（組立時の事前検証規定不在・事後機構の行構造不感）
- **エントリ一覧**
  - DefinitionEdit の newText 組立での行区切り欠落を traceability check の fail-closed で検出 [inbox]

### C8: 入力様式案内と ENTRY_HEADING 契約前提の不一致

- **根本原因**: ENTRY_HEADING の契約がラベル付き見出し（id + ラベル）を前提とし、id なしラベルの見出しは契約外の入力である
- **再発条件**: 入力様式案内を経由せず、id なしラベル見出しで外部戻り入力を渡した場合
- **予防策**: 入力様式案内への形式明示（id + ラベル）の補足追加

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 単独エントリ |
| 影響度 | 1/5 | fail-closed 拒否で契約内処理・実害なし |
| 横展開性 | 2/5 | receive.ts と phase-theme-collaboration に固有。「入力様式案内が契約前提を暗に許容しない」観点の一般化は可能だが発火箇所は限定 |
| 反映先明確度 | 4/5 | agentdev-phase-theme-collaboration SKILL.md の入力様式記述を名指し可能 |
| 自動化適性 | 1/5 | 案内追記は文書修正のみで機械的検証の対象ではない |
| 再利用性 | 2/5 | phase-theme-collaboration 利用者に限定 |
| 再発可能性 | 3/5 | 案内未整備の間は起こり得るが fail-closed 拒否で軽微 |
| 費用対効果 | 2/5 | 補足追記は低コストだが fail-closed 契約内で実害がなく削減効果も小さい |
| **加重合計** | **16/40** | |

- **推奨処分案**: deferred。実害なし・fail-closed 契約内・出現1件・軽微。SKILL.md の入力様式記述には戻り入力受理と fail-closed の記述はあるが id + ラベル形式の明示は不在（実測）。案内形式明示の補足追記候補を living pool で保持。再評価条件: 同種入力様式誤りの再発時、SKILL.md 入力様式記述の改訂機会発生時
- **既存対策照合**: 対策なし（案内の形式明示不在）。反映先実在性確認: `.opencode/skills/agentdev-phase-theme-collaboration/SKILL.md` 実在を実測
- **エントリ一覧**
  - ENTRY_HEADING はラベル付き見出しを要求し、id なしラベルの見出しはエントリ抽出されない [inbox]

### 未分類

- なし。8件すべて問題クラス C1〜C8 へ帰属（各クラス1エントリ）。Jev 分類評価も全件同一帰属（observation 20261017T103237Z-33a5）。入力正規化: 8件すべて13フィールド形式相当で旧フォーマット正規化の適用はなし。元 inbox は解析時のみ読み、判定までは変更しなかった（STEP-6 の deferred 移動・クリアは判定確定後）

## promote 時 prune 結果（実績）

- **対象エントリ数**: inbox 8件（原子的操作で移動と prune を同時適用）
- **prune実施**: 5件（promote 2〔C3/C7。採用済み成果物の「元learning item / 根拠」セクションへ証拠保存済み〕+ duplicate 2〔C1/C6〕+ rejected 1〔C5〕）
- **prune却下（deferred 残置）**: 3件（C2/C4/C8。移動日 2026-10-17 と処分判定を付して living pool へ追加）
- **既存 pool への追加 prune**: 実施せず（任意運用のため保守的に残置。並列 run 下では保守方針を維持）
- **C1 統合記録**: deferred pool 同根先行エントリ（2026-10-13移動・L4320）へ「統合追記（2026-10-17 learning-promote）」を適用し、再発2回目の事実と duplicate 受理根拠を記録
- **検証結果**: inbox ヘッダーのみ（エントリ0件）、deferred 追記3件（移動日 2026-10-17 ×3）、C1 統合追記、pruned 5タイトル不在・retained 3タイトル各1件、promoted 2件生成、読戻し検証実施

## 全体傾向

- **昇華価値の中心**: C3（30/40・構造的再発・既存手順の未配線 gap）と C7（24/40・事後機構の行構造不感 gap）。いずれも既存恒久手順の具体的 gap を実測で確認した既存対策の更新
- **恒久被覆による重複**: C1（REQ-031-033 + harness-delegation 事前判定経路）、C6（specs-release.ts pin テスト）は恒久契約・pin テストによる完全被覆を実測で確認
- **保持型**: C2（実行 cwd 規律の観点）、C4（記録粒度の観点）、C8（案内形式明示の観点）は出現1件・実害なしの観点記録として deferred
- **廃棄**: C5（既知欠陥・恒久検出経路 typecheck gate 既存・修正対象明確）は学習価値なしで rejected
- **全体的な観察所見**: 本 batch は Case #3758/#3776/#3779 の e2e 実行由来が中心で、実害が対処済みの実践記録が多い。inbox 申告の REQ 乖離主張（C1）は現行契約の実測読取で不成立と判明し、学びの自己申告と恒久契約の乖離確認の重要性を示した。C3 の inbox「手順 8」記述は誤記（正は「Squash merge 後分岐ハンドリング手順」節）で、採用済み成果物側で訂正

## Decision 候補除外記録

- **対象 item**: C1〜C8 全単位
- **除外理由**: 技術判断不在 / command仕様 / 運用ルール
- **根拠事実**: 全単位が運用・検証・手順の知見であり、アーキテクチャ上の決定、技術選定、設計判断の新規確定を含まない。昇華可能性評価（observation 20261017T104003Z-dbff）も全8クラス false（恒久契約の新規確定を要さない）
- **代替反映先候補**: REQ/Design/配布skill references/guide/knowledge（各クラスの反映先候補は採用済み成果物の「反映先候補」参照）

## 実行証跡

- STEP-1: inbox 8エントリ（134行）を読込・正規化（全件13フィールド形式相当）。deferred インデックススキャン: 見出し254行（実エントリ250件）。同クラス先行候補の本文読込（L4320〔C1 同根〕、L2527/L2625/L3932〔C2 junction 系・別現象〕、L1952〔C3 branch 再利用・別原因〕、L4782〔C7 近縁・別原因〕、L3407/L3428/L4720〔既知欠陥系参照〕）。全面読みフォールバック対象エントリなし
- 既存対策の実測: REQ-031.md L51（REQ-031-033）、harness-delegation.md L334-344（事前判定経路）、accept_definition_checks.ts L553-571、git-common-procedures.md L253/L521-615、readiness-and-cleanup.md（Stream A 実測）、handoff.md L32-36（Stream A 実測）、end-to-end-execution.md L245-320、distribution-boundary.md L62、docs/knowledge/ grep（3文書・被覆なし）、plugin.ts L34/L40/L78、specs-release.ts L51/L59/L170-171、custom-tool-contracts.md L43、definition-pr-and-idempotency.md 全文（L1-104 実読取）、phase-theme-collaboration SKILL.md L58-62
- Jev 観測（本 run 生成・全 observation に finalResult を observation_write で追記済み）: 20261017T103237Z-33a5（分類8問）、20261017T103357Z-5b4d（C1 7軸）、20261017T103357Z-c54c（C2 7軸）、20261017T103511Z-fa64（C3 7軸）、20261017T103556Z-2644（C4/C5 14軸）、20261017T103705Z-5069（C6/C7 14軸）、20261017T103754Z-6aea（C8 7軸）、20261017T103859Z-2b04（処分区分8問）、20261017T104003Z-dbff（昇華可能性8問）、20261017T104032Z-334d（review 発動条件1問）、20261017T105202Z-fb30（review 反映後の再判定3問）
- 禁止条件フィルタリングゲート: 8単位すべて技術判断不在・command仕様・運用ルール該当で Decision 候補除外（deterministic 適用。review 反映後も再適用し不変）
- 環境記録: 本 run は並列3系統（learning-promote / intake-promote / inspect-promote）の git serialization 契約下で実行。git 操作は親 orchestrator が所有（本 run では実行せず）。`.agentdev/intake/`・`.agentdev/inspect/`・`.agentdev/backlog/` には未接触

## STEP-4 adversarial-review

- 発動判定: 発動（Jev boolean true、観測 20261017T104032Z-334d。inbox 8件で skip 条件〔空・1件のみで重複確実〕非該当、evaluation-report 反映済み。親判断の最終確定結果が発動条件を満たしたため後続評価を生成）
- review 構成: 独立 challenge stream 2本（explore サブエージェント。相互の finding を非公開で並行実行）。Stream A = C1/C3/C5/C6 の処分判断の反証。Stream B = 分類区別（CL-1〜3）と deferred 処分の反証（初回は timeout 失敗、範囲を絞った新規タスクとして再起動して成立。silent skip せず失敗を記録）
- orchestrator（Reviewee）相互反証: 決定的反証を orchestrator が自ら実測で再検証し、すべて実証した。（1）C3/C7: git-common-procedures.md L521-615 読取（「Squash merge 後分岐ハンドリング手順」の case-close STEP-4-3 専用配線を確認）+ definition-pr-and-idempotency.md 全文再読取（L35/L40/L47/L52-59 の行構造不感を確認）。（2）C2: docs/knowledge/ grep（配布依存境界系3文書に被覆なし）。（3）C1: 先行エントリ L4320 再読取（同根確認）
- accepted finding 反映（STEP-2 へ戻り STEP-3 を再実行。Jev 再判定 20261017T105202Z-fb30）:
  - C7: deferred → promote（行構造検証規定の不在・verbatim 包含突合の行構造不感・悪 commit 既遂の3点を根拠に変更。発生件数は L4782 が別根因のため1件維持・近縁記録のみ）
  - C3: promote 維持・根拠精密化（既存手順が case-close STEP-4-3 専用配線という gap の特定。inbox「手順 8」記述の誤記判明・採用済み成果物で訂正）
  - C1: duplicate 維持（両 stream が REQ-031-033 被覆・先行記録同根・再発2回目を確認。CL-3 の統合提案を受理し先行エントリへの統合追記を実施）
  - C5: rejected 維持（Stream A が衝突実在・typecheck gate 恒久検出を確認）
  - C6: duplicate 維持（Stream A が pin テスト実在を確認。Design 物理写像明示の不在は実装詳細隠蔽原則により契約 gap ではない）
  - C2/C4/C8: deferred 維持（Stream B が C2 の独立クラス〔部分スキャン集合差 vs 完全無効実行〕を確認）
  - 問題クラス分類: 全件維持（CL-1/CL-2 は区別の妥当性を支持、CL-3 は同クラス確認で帰属の反証ではない）
- 戻しループ: STEP-2（レポート更新）→ STEP-3（処分再実行。Jev 再判定 20261017T105202Z-fb30）→ STEP-4 発動条件判定（親条件不変）。再判定は accepted finding（orchestrator 実測済み）の機械的反映であり新たに未検証の争点を導入しないため停止条件を満たしてループを離脱した
- unresolved: なし（発見された本質的争点はすべて実測で解決）

## STEP-5 自律確定記録

- 自律確定: 8単位すべて自律確定（ユーザー承認なし）。promote 2単位（C3/C7）は既存恒久手順の具体的 gap を実測（grep・全文読取・独立 stream 検証・orchestrator 再実測）で確認できた既存対策の更新であり、正規契約と実測からの導出で一意に確定。duplicate 2単位（C1/C6）は恒久契約・pin テストによる完全被覆を実測で確認。deferred 3単位（C2/C4/C8）は処分区分6の判定基準（単発・断片的・出現回数少・恒久被覆未確認）への該当を実測で確認。rejected 1単位（C5）は学習価値なし（恒久検出経路 typecheck gate 既存・修正対象明確）を確認
- HITL 不要の理由（人間判断への引き上げ条件との照合）: （1）ユーザー固有の目的・価値観・優先順位の新規確定を要する事項なし。（2）正規情報源間の未解決規範矛盾なし。（3）対論型レビューの本質的争点は相互反証と実測検証ですべて解決済み。（4）要件・仕様の対象範囲、外部契約、受け入れ条件、恒久規範の新規決定なし〔promote は backlog-review/req-define 向けの提案ステージに限り、実現先の確定・恒久規範の確定は行わない〕。（5）既存の明示的な安全境界が要求する操作の承認なし〔inbox クリアは正規の deferred 移動原子的操作プロシージャであり、prune 5件は本 run 移動分の promote 時 prune で STEP-5 の判定確定と同時に承認済み。「inbox.md 全体強制クリア・大量エントリ一括削除」には該当しない〕
- 判定の変更指示: なし（本 run は HITL 質問を発生させず STEP-6 へ進む）
- 破壊的変更: なし（既存 pool 250件への追加 prune は実施しない。deferred 移動は原子的操作プロシージャに従い、edit ツールでの部分編集〔C1 統合追記・末尾3件追加〕と inbox クリアを検証付きで実施。textlint guard による2回の fail-closed ブロック〔oldString 誤字・workspace 外書込み〕を規律どおり実取得確認・標準手段切替で解消し、guard の解除・迂回は行っていない）
- STEP-6 実行記録: promoted 2件（case-ready-canonical-acquisition-divergence-fallback.md・definition-edit-newtext-line-structure-precheck.md）を新規生成（UTF-8 BOM なし）。deferred 移動（3件追加）+ C1 統合追記 + inbox クリアを実施し読戻し検証。evaluation-report.md は本レポートで上書き（edit ツールによる既存全文置換）
- git 永続化: 実行せず（並列 serialization 契約により親 orchestrator が commit/push を所有。保留パス一覧と提案 commit message を完了報告へ記載）
