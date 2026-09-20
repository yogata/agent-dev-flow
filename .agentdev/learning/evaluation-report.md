# 評価レポート

## メタデータ
- **実行日時**: 2026-09-20（backlog-auto stage 2 learning 系統として実行）
- **対象エントリ数**: 23件（inbox: 23件、deferred: 130件〔既存対策照合・duplicate 突合の参照対象〕）
- **問題クラス数**: 3（未分類 17 件を含む）
- **v4 コンテキスト**: main = v4.0.0-rc.1（2026-09-20 cutover 済み）。v4 worktree（../agent-dev-flow-v4）は削除済み（`git worktree list` で main のみ）。全エントリを現行 v4 コードパス（実ファイル・実 reference・REQ・knowledge 文書）で有効性検証した。

## ユーザー承認済み処分方針（backlog-auto 実行前に明示承認）

- v4 で無効・意味なし → reject（prune）
- v4 で有効 → promote（採用済み成果物生成）
- 適用可能だが有効性不定・タイミング尚早 → defer（deferred.md へ移動・再評価条件つき）
- 自明な item は自律確定可。判断が割れる item のみ HITL（本実行は background のため結果報告へ列挙）

## 問題クラス一覧

### 問題クラス1: agentdev_gh issue_update の tracking Issue labels 明示渡しによる read-back 検証失敗

- **根本原因**: tracking role の Issue は tracking 軸の物理ラベル写像を Tool 内部で管理しており、labels の明示渡しが read-back 検証パスと干渉する（本文は GitHub 側で正しく反映される）
- **再発条件**: tracking role の Issue へ labels を明示渡して issue_update する場合（case role では発生せず）
- **予防策**: 本文のみの issue_update では labels 引数を省略する。検証失敗時は「独立 issue_read → 適用済みなら完了・未適用なら labels 省略で冪等再実行」の二段構え

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | クラス内 2 エントリ（Case #3036・#3038、通算 3 回） |
| 影響度 | 3/5 | 検証 fail-closed 応答と冗長再実行の手戻り。durable state 自体は保たれる |
| 横展開性 | 4/5 | tracking Issue の本文更新は全 workflow（case-close 段階一覧表更新等）で高頻度 |
| 反映先明確度 | 5/5 | 予防策（labels 省略）と復帰手順（独立 read-back 分岐）が自足的に整備済み |
| 自動化適性 | 3/5 | Tool 側修正も可能だが、呼出側規約化が即効（手順追記） |
| プロジェクト固有知識再利用性 | 4/5 | agentdev_gh 操作契約に固有 |
| 再発可能性 | 5/5 | 予防策未昇華のまま同一操作形式で再発済み（エントリ自身が早期昇華候補と明記） |
| 費用対効果 | 5/5 | labels 引数の省略のみで予防完結 |
| **加重合計** | **31/40** | |

- **推奨処分案**: 5 既存対策の更新（promote）。agentdev-issue-tracking SKILL.md の操作表は更新操作に labels を引数として列挙するのみで、本文のみ更新時の labels 省略規則と検証失敗時の復帰手順を持たない（fix gap）

#### エントリ一覧
- 2026-09-20: agentdev_gh issue_update の labels 明示渡しは tracking Issue で read-back 検証を失敗させうる（Case #3036） [inbox]
- 2026-09-20: agentdev_gh issue_update labels 明示渡しの read-back 検証失敗は tracking Issue で再発する（Case #3038） [inbox]

→ 採用済み成果物: `promoted/measure-update-agentdev-gh-tracking-labels-omit.md`

### 問題クラス2: 書込み guard の project root 固定による外部パス（v4 worktree・OS 一時ディレクトリ）block

- **根本原因**: ファイル操作ツール（write/edit）の project root 判定が harness セッション起動 worktree に固定され、repo 外パス（TEMP 等）と git worktree 分離パスの双方が project 外として fail-closed block される
- **再発条件**: main worktree 起動セッションから repo 外一時パスまたは worktree 分離パスへ file tool で書込む場合
- **予防策**: 一時スクリプト・作業用 JSON は project root 内 gitignore 領域（.agentdev/integrity/reports 等）へ配置。大規模編集は node writeFileSync（UTF-8 明示）、node -e + PowerShell 単一引用符ヒアドキュメント、byte-exact 抽出 + 出現数 assert を第一候補にする

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 4/5 | クラス内 4 エントリ（Case #2958・#2967・#2997・#3011） |
| 影響度 | 3/5 | 標準手段切替で完結（guard は正常動作）。大規模編集では手段選択の効率差が大きい |
| 横展開性 | 3/5 | 外部 worktree・TEMP 操作時のみ発火。project 内通常作業では非発火 |
| 反映先明確度 | 4/5 | 標準手段と補助技法（reports/ 配置・ヒアドキュメント・assert 付き置換）が具体的 |
| 自動化適性 | 2/5 | guard 仕様は不変。運用指針（worktree-operations guard 節）への追記止まり |
| プロジェクト固有知識再利用性 | 4/5 | Windows + 本 harness 固有の運用知識 |
| 再発可能性 | 3/5 | v4 worktree 運用は cutover で終了。rc.N 運用・RC fixes で外部 worktree を再用する場合に再有効化 |
| 費用対効果 | 3/5 | 指針追記は妥当だが現時点では需要が不確定 |
| **加重合計** | **26/40** | |

- **推奨処分案**: 6 deferred。運用回避策の骨格（ブロック操作と標準手段）は worktree-operations.md「書込み guard 運用指針」節と AGENTS.md が既に所有し、残る delta（TEMP/外部 worktree からの大規模編集技法）の反映需要は rc.N 運用の発生に依存する。再評価条件: rc.N 運用・RC fixes で外部 worktree・TEMP 経由の大規模編集を再開する場合

#### エントリ一覧
- 2026-09-18: v4 worktree での file tool 書込みが textlint guard の project root 固定により fail-closed ブロックされる（Case #2958） [inbox]
- 2026-09-19: 証跡退避先・一時作業先の OS 一時ディレクトリも textlint guard の project root 外判定で fail-closed ブロックされる（Case #2967） [inbox]
- 2026-09-19: 共有 v4 worktree への write/edit ツール書込みが guard fail-closed ブロック（Case #2997） [inbox]
- 2026-09-20: write tool の guard は承認済み temp dir 含む project root 外を fail-closed block する（node -e + PS ヒアドキュメントで大規模編集を実行）（Case #3011） [inbox]

### 問題クラス3: 旧語の字面引用が grep 0 件基準の機械検査と衝突する

- **根本原因**: 是正注記・「後継」注記・対応表のいずれも、禁止対象・移行対象の旧語の字面を本文へ残すため、「旧名 0 件」を要求する grep 0 件基準の検査と構造的に衝突する
- **再発条件**: 旧表現禁止・用語統一・Design 削除（RETIRE/supersede）の張替えを伴う変更で、旧語の字面を注記・対応表に残した場合
- **予防策**: 旧語は本文に字面で書かない（描写形で書く、または正本〔crosswalk・処遇記録〕へ集約し本文は正本参照のみ）

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | inbox 1 件 + deferred 1 件（同一問題クラスとして成熟） |
| 影響度 | 3/5 | 検査 fail と修正往復。意味破壊リスクは低い |
| 横展開性 | 4/5 | 用語統一・再編・是正注記を執筆する全局面 |
| 反映先明確度 | 4/5 | 描写形・正本集約の予防策が明確 |
| 自動化適性 | 2/5 | 執筆規約の知識化が本命（検査側の除外設計は別議論） |
| プロジェクト固有知識再利用性 | 4/5 | grep 0 件基準の完了条件を多用する本 repo 固有 |
| 再発可能性 | 4/5 | v4 移行再編で 2 実績。今後の RETIRE/supersede 再編でも発生し得る |
| 費用対効果 | 4/5 | 知識文書化は低コスト |
| **加重合計** | **27/40** | |

- **推奨処分案**: 4 project knowledge（promote）。docs/knowledge/ への知識文書候補。deferred 側の従来エントリ（2026-08-15「旧表現を禁止する是正注記で旧表現の字面を引用すると grep 0 件基準の機械検査と衝突する」）は本クラスへ統合され、本 promote の根拠として採用済み成果物に証拠保存した上で deferred.md から削除した

#### エントリ一覧
- 2026-09-19: 削除 Design 参照の「後継」注記が旧名 grep 0 件検査（TS-004 型）と衝突する（Case #2979） [inbox]
- 2026-08-15: 旧表現を禁止する是正注記で旧表現の字面を引用すると grep 0 件基準の機械検査と衝突する [deferred・統合削除]

→ 採用済み成果物: `promoted/knowledge-grep-zero-criteria-legacy-term-quotation.md`

## 未分類（単独エントリ）の処分判定

| # | エントリ（日付: タイトル） | 判定 | 理由コード・根拠 |
|---|---|---|---|
| 1 | 09-18: REQ 行追加時の Design 宣言追随確認漏れ（REQ-021-026 遵守漏れ） | **promote**（cat 5） | case-open skill 全体に宣言追随・check.ts 機械ゲートの手順なし（grep 検証済み）。REQ-021-026 の確認義務は存在するが Definition PR 作成手順から呼び出されていない（fix gap）。case-ready 差戻し直結の高影響 |
| 2 | 09-18: 配布 skill 文言追記が機械検査 3 系統に同時衝突する | **promote**（cat 5） | docs/knowledge/distribution-concrete-id-placement.md は concrete-id 系統のみカバー。repo-* 用語・宣言マーカー形状の 2 系統と「3 系統が独立に走る」知見は未カバー（fix gap） |
| 3 | 09-18: bun run による .ts 直接実行は package.json なし環境で Module not found | **defer** | checker 実行契約 Design は bun run を規定し標準経路は node import。repo root の package.json 不在は現行でも成立する環境差だが、単発かつ契約との整合確認を要する（再評価条件: checker 契約の bun 経路更新時・bun 経路障害再発時） |
| 4 | 09-18: PR タイトル事前変更は 1-commit PR の squash タイトルを制御できない | **promote**（cat 5） | case-close STEP-4-3 は PR タイトル事前変更のみ規定。1-commit PR で squash タイトルが commit message 由来になる環境の auto-close 回避は branch HEAD commit message 確認の前置が必要（guardrail insufficiency） |
| 7 | 09-19: REQ 行追加を伴う TS「missing-implementation 不変」期待は新規 positioning 行で常に乖離する | **promote**（cat 5） | agentdev-req-analysis の test-strategy-numeric-threshold-guide.md は絶対値閾値の到達可能性中心で、REQ 行追加 Case の増減理由型（baseline+新規行数−宣言解消）の記述様式を持たない（fix gap）。REQ 行追加を伴う全 Case で必ず再発 |
| 9 | 09-19: check_integrity spawn 系テストの固定 timeout は環境性能差で flaky 化する | **defer** | windows-bun-test-spawn-timeout-classification.md（2026-09-15 更新）が由来分類・単独再実行手順を所有し、2026-09-12 inbox 由来の同一クラス事例を既に集約。残る delta（テスト作成時の猶予値設定規則）は単発で、恒久方針は未解決 intake 候補として entry 自身が言及（再評価条件: spawn 系テスト新規作成時・timeout 方針の intake 処分確定時） |
| 10 | 09-19: release テスト fixture の文言完全一致期待は Design 吸収節の粒度差で破損する | **defer** | scripts/self/release は v4 で存続し有効だが、Design 削除・吸収を伴う Case でのみ発火する状況依存の単発知見（再評価条件: Design 削除・吸収を伴う Case の起票時） |
| 11 | 09-19: 削除帰結の実行時設定（.agentdev/extensions 等）の参照追随はどの OU にも明示割当がない | **promote**（cat 5） | E6-2（Epic #2984 コメント記録）と本件で 2 事例。OU 対象範囲定義に「削除起因の実行時設定参照の追随」を含める運用は未整備（fix gap） |
| 12 | 09-19: 張替えリンクの相対パス誤りが check_integrity 新增 NG として検出 | **defer** | 単発・check_integrity（designs-relative-link-existence + broken-file-link）が機械検出済み。予防策（張替えリストへの実パス明記）は有効だが需要は ref remap 作業再発時（再評価条件: 参照張替えを伴う Case の起票時） |
| 13 | 09-19: pwsh パイプ経由の bun script JSON 出力解析での文字化け | **reject**（duplicate） | windows-powershell-bulk-io-corruption.md 項3「PowerShell のパイプ・リダイレクト・Out-File 経由の stdout 受け取り cp932 再解釈」と checker-cli-stdout-loss-on-windows-bun.md（PR #2582 由来）が同一問題クラスを既に規定。標準手順（node spawnSync encoding utf8 / ファイル経由）も既存 |
| 15 | 09-19: check_distribution_boundary への契約外 --base-ref/--head-ref 指定は repoRoot 誤解釈で fail-closed になる | **reject**（duplicate） | deferred.md 既存エントリ「2026-09-05: check_distribution_boundary.ts は --base-ref を持たず、未定義 flag 付き呼び出しは positional arg へ落ちる」が同一 checker・同一根本原因・同一予防策（usage からの複写）を保持。deferred 側を正本として維持 |
| 16 | 09-19: bun test のディレクトリ filter は `./` なしの深い .opencode パスでサイレント 0 件一致になる | **reject**（duplicate） | REQ-060-002 が「no test files matched による 0 件実行」を検知条件として要件化済み。docs/knowledge/bun-test-execution-form-drift-signals.md が `.opencode/...` 例での 0 件実行・「Ran N tests」件数確認まで規定済み |
| 17 | 09-19: agentdev_gh issue_create の長文本文は作成直後の read-back で構造検証する | **reject**（cat 7 対応済み） | agentdev-issue-management issue-operation-safety.md の VERIFY 手順（書き込み元テキストと読み戻しテキストの照合、(b) Markdown 構造検証、(c) 必須セクション見出し検証）が読み戻し構造検証を既定済み。残余 delta（key-value 行確認の明示）は観察所見として記録するに留まり単独成果物化不要 |
| 18 | 09-20: bun test の件数サマリーは stderr 出力 | **defer** | 単発。fail 証跡の標準経路は junit reporter（bun-test-junit-reporter-evidence.md）であり、stdout キャプチャ証跡は副次的（再評価条件: 証跡取得系知識文書の更新时机・stdout キャプチャ証跡の再発時） |
| 20 | 09-20: squash merge commit の committer date が deriveMeasureDateFromLastCommit の期待値を反転させ AUTOGEN drift を生む | **promote**（cat 5） | check_autogen_freshness.ts・generate_indexes.ts は v4 で稼働中。AUTOGEN drift クラスは 3 事例目（date rollover・Phase 0 起因に続き、GitHub squash merge の committer date 置換は未文書の第3機構）。autogen-freshness-gate Design・index-auto-generation Design に計測日導出基準の明示と merge 後再生成運用の追記候補（fix gap） |
| 21 | 09-20: Aborted 中断復帰時の編集漏れ照合は instruction 粒度で行う必要がある | **promote**（cat 5） | case-open skill 全体に instruction 粒度照合・Aborted 復帰の手順記述なし（grep 検証済み）。DEC-011 resume の実効強化で、ファイル単位照合の既定を instruction 単位へ引き上げる手順化候補（fix gap） |
| 22 | 09-20: issue_update labels 明示渡し read-back 検証失敗（#3036） | **promote**（cat 5） | 問題クラス1 として処分（上記） |
| 23 | 09-20: labels 明示渡しの read-back 検証失敗は tracking Issue で再発（#3038） | **promote**（cat 5） | 問題クラス1 として処分。エントリは根拠として成果物に証拠保存 |

## 処分集計

- **promote（採用済み成果物生成）**: 9 件（エントリベースでは 10 件。クラス1 の 2 エントリを 1 成果物に集約）
  - cat 5 既存対策の更新: 8 件
  - cat 4 project knowledge: 1 件
- **defer（deferred.md 移動・再評価条件つき）**: 9 件
- **reject（prune）**: 4 件（duplicate 3 件、既存対策済み cat 7 1 件）

## promote 時 prune 結果

- **対象エントリ数**: 23 件（inbox 全エントリ）+ deferred 1 件（問題クラス3 統合）
- **prune 実施**: あり
- **prune 候補**: 14 件（staged 10 件〔問題クラス1 の 2 件を含む〕+ rejected/duplicate 4 件）+ deferred 統合削除 1 件
  - staged 10 件は 9 採用済み成果物の「元learning item / 根拠」セクションへ証拠保存後に除去
  - rejected/duplicate 4 件の理由は本レポートの未分類判定表に記録（duplicate は deferred・knowledge・REQ の正本を明示）
- **prune 却下**: 0 件
- **deferred.md 残置**: 9 件（defer 判定分の追記）+ 既存 129 件（問題クラス3 統合削除 1 件を除く）

## 自律確定記録（STEP-5）

- **確定根拠**: 全 23 エントリについて (a) 現行 v4 コードパスでの実ファイル検証（worktree-operations guard 節、ps-corruption 項3、REQ-060-002、knowledge 文書 3 件、case-open/case-close reference、issue-tracking/issue-management、checker 実行契約、req-analysis ガイド、scripts/self/release、check_autogen_freshness 等）、(b) deferred.md 既存エントリ・既存知識との突合を実施し、処分を一意に確定した
- **HITL 不要理由**: ユーザー承認済み処分方針（v4 無効→reject / v4 有効→promote / 不定・尚早→defer）への写像が各エントリで一意に定まり、判定が割れる項目が存在しなかった。破壊的操作（prune 14+1 件）は同方針の事前承認の範囲内
- **HITL 必須（確定保留）item**: 0 件

## adversarial-review（STEP-4）記録

- **発動条件判定**: 発動（default-on。skip 条件〔単一エントリで既存対策重複確実、または inbox 空〕非該当）
- **審議形式**: in-context 審議（Orchestrator / Reviewer / Reviewee の 3 論理役割）。対象 = 本レポートの評価・判定案
- **受理 finding**: 3 件（すべて本レポート・成果物へ反映済み）
  - F-1: promote #1（宣言追随）は、REQ-021-026 の確認義務が既存である点を明示し「新規要件化ではなく case-open 手順からの参照強化」を変更内容とするよう修正（成果物へ反映）
  - F-2: reject #17 の残余ギャップ（key-value 行構造確認の明示）を消失させないため本レポート観察所見として記録
  - F-3: defer #3 の再評価条件に「checker 実行契約 Design の bun run 規定と repo root package.json 不在の整合確認」を含めるよう修正
- **却下 finding**: 2 件（promote 9 件の過剰懸念 → 各成果物が検証済み fix gap を持ち反映先候補が一意であることをもって却下。#16/#17 reject の緩和要求 → 正本の要件・手順が同一事象を規定済みであることをもって却下）
- **停止条件**: 新規の本質的争点なし・unresolved なし。ループ離脱し STEP-5 へ進行

## 全体傾向

- 高頻出・高影響: 問題クラス1（agentdev_gh labels、31/40）が最高スコア。予防策コストが最小で再発可能性が最大
- 横展開性が高い: grep 0 件基準と旧語字面の衝突（27/40）、配布物 3 系統衝突。いずれも執筆・検査の横断局面で再発する
- v4 cutover の影響: v4 worktree 運用由来 4 エントリ（問題クラス2）は発生前提が終了し defer。cutover 後も稼働する検証基盤（check_integrity、traceability、AUTOGEN gate、distribution boundary、scripts/self/release）由来の学びは v4 有効として promote
- 観察所見: (1) issue-management VERIFY への key-value 行（adf_case 等の実行識別情報行）構造確認の明示は将来の小幅追記候補（reject #17 の残余）。(2) checker 実行契約の bun run 規定と repo root package.json 不在の整合は要確認（defer #3 の再評価条件）。(3) 本バッチの学びの大半（23 エントリ中 19）が case-open〜case-close の検証・PR・Issue 操作の運用改善に集中しており、恒久契約（REQ/Design）への昇華より手順・知識への反映が主体

## Decision 候補除外記録

- **対象item**: 全 23 エントリ（promote 9 件を含む）
- **除外理由**: 技術判断不在（全項目が運用手順・検証手順・執筆規約の改善であり、アーキテクチャ上の決定・技術選定を含まない）。「command仕様」「運用ルール」にも該当
- **根拠事実**: 各エントリの予防策が手順追記・規約明示・知識文書化であり、トレードオフの伴う設計判断を含まない
- **代替反映先候補**: 配布 skill reference（case-open / case-close / issue-tracking / req-analysis）、docs/knowledge/、docs/designs/integrity/（autogen-freshness-gate・index-auto-generation）

## Deferred プールの再評価スコープに関する注記

本実行の deferred.md 再評価は、今回の inbox 23 エントリとの交差（duplicate 突合・既存対策照合・問題クラス統合）に限定した。交差したのは問題クラス3（統合削除 1 件）・#15 duplicate 正本（残置）・AUTOGEN drift ファミリー（残置・関連事実として成果物に参照）等である。非交差の既存 deferred エントリ（約 128 件）は living pool に残置する。v3 由来エントリの一括 v4 有効性判定（reject 化）は、個別評価なしの一括削除が安全境界（deferred・未処理項目の自動削除禁止）を迂回するリスクがあるため、本実行では実施せず、次回以降の専別実行課題とする。
