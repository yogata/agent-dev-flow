# 評価レポート

## メタデータ

- **実行日時**: 2026-10-27（backlog-auto stage 2 learning 系統。run 開始 2026-10-27T04:08+09:00 頃）
- **基準 revision**: 3a508c7ada2ba07fb53d0e668ab35e304508b208（main HEAD・run 実行時）
- **対象エントリ数**: inbox 41 件、deferred 257 件（見出し 261 行のうち 4 行は様式・説明見出し。実行前実測）
- **問題クラス数**: 36（inbox 順 P1〜P36。deferred pool 同根先行エントリを統合するクラス: P1=3〔L4476 含む〕、P5=3〔L4515 含む〕、P6=5、P7=5、P8=6、P9=4、P10=2、P12=2、P13=2、P15=2、P16=2、P17=2、P18=4、P19=3、P20=2、P21=1、P23=1、P36=1。他は単独構成）
- **Jev**: 分類 1 評価（20261026T193203Z-17fd・41 問全問暫定帰属と一致・confidence 0.98）・処分区分 1 評価（20261026T193521Z-845d・36 問全問暫定と一致・confidence 0.85）・昇華可能性 1 評価（20261026T193712Z-b175・P6・P19 で分岐）・8軸評価 1 評価（20261026T193925Z-5f5a・promote 暫定 4 クラス 28 問・confidence 0.64）・review 発動条件 1 評価（20261026T194141Z-0df7・発動 true）・review 反映後再判定 1 評価（20261026T200139Z-a7ea・変更 5 クラス）。invalid_input 失敗: 8軸評価初回 3 件（scale の top-level 配置・observationMetadata 欠落・instructions 欠落。入力検証失敗で観測は生成されず、正しい入力で再送して成立）・observation_write 失敗 4 件（score 形式の finalResult value の解釈ずれ〔scale index vs 水準番号〕で invalid_input 反復。**観測書込み失敗のため 8軸評価の finalResult は観測へ未追記** — fail-open 契約により本 Workflow の success は維持し warning として明示。evaluator 結果・確率分布は観測へ永続化済み・最終判断は本レポート本文に記録）
- **Jev score value 解釈の記録**: evaluator の score value は scale index（0 起）で返却・保存される実装挙動（分布の argmax 水準 = value + 1・前回 run 2026-10-20 の記録と同一）。observation_write の検証は「最終 value を水準番号、evaluator value を index として +1 変換し比較」と「素比較」が併存する応答となり整合する入力形式を確定できなかった。本レポート本文のスコアは水準番号どおり（index + 1）で記録
- **旧 report**: 2026-10-20 実行分（Case #3782/#3793/#3803 系 20 件対象）のため本レポートで上書き置換
- **前回 run との差分**: 前回 run（2026-10-20）以降に capture された 41 エントリ（2026-10-20〜10-27・Case #3816〜#3862 系）。deferred.md は前回 run 以降不変（SHA-256 29148b94 前後一致実測）

## 判定基準

処分はスコアのみで決めず、既存恒久対策の現状、実害、情報の自足性、昇華可能性、既存プールとの関係を併せて評価した。十分な恒久対策により既に網羅されているものだけ duplicate とし、deferred pool に似た記録があるだけでは duplicate にしない。promote（既存対策の更新）は既存恒久手順の具体的 gap を実測（grep・ファイル読取・コード読取）で確認できた場合に限った。Decision 候補は禁止条件ゲート（agentdev-decision-guidelines 除外基準）で全単位除外した。

## STEP-1 読込・正規化

- inbox 41 エントリ（737 行）を読込・正規化（全件 13 フィールド形式相当・旧フォーマット正規化の適用なし）
- deferred インデックススキャン: 見出し 261 行（実エントリ 257 件）。同根・近縁候補の本文読込 27 箇所（L2347〔P8 同根〕、L2893/L3450〔P7 同根〕、L3054〔P14 近縁〕、L3324〔P10 同根〕、L3472/L3829〔P19 同根〕、L3640〔P16 同根〕、L3598/L3660〔P16 近縁〕、L2660/L3156〔P15・P17 近縁〕、L2064〔P17 同根〕、L2508/L3493/L3871〔P18 同根〕、L2528/L2626/L3934/L3366〔P6 同根〕、L2303/L4361〔P25 近縁〕、L4476〔P1 同根〕、L4515〔P5 同根〕、L4207/L1736〔P20 同根・近縁〕、L3408/L2215/L4144/L4342/L4908〔P2 近縁〕、L4697/L4823/L4874/L4743〔P9 同根〕、L4891〔P12 同クラス〕、L4721〔P13 同クラス〕、L5048/L5067/L5086/L5105〔前回移動分 4 件〕、L1560/L3387/L4102〔P36 近縁〕、L3955〔P27 近縁〕、L3577〔P33 近縁〕、L716〔P35 近縁〕、L2468〔P29 近縁〕、L1917/L4967/L5008〔P11/P32/P31 近縁〕、L4536〔P28 近縁〕、L2430〔P30 近縁〕）。全面読みフォールバック対象エントリなし

## 問題クラス一覧と処分判定

軸順: 発生件数 / 影響度 / 横展開性 / 反映先明確度 / 自動化適性 / 再利用性 / 再発可能性 / 費用対効果。加重合計は満点 40。発生件数軸は deterministic 境界により機械導出。

### P1: 機械工程・checker のパス引数は実行 cwd で解決される（E34, E39）

- **根本原因**: 相対パス解決基点が gate spec cwd / checker 起動 cwd であり repo root ではない
- **再発条件**: gate 実行 cwd と検査入力の置き場所が異なる状態で --input 等を相対パスで渡した場合。scripts 配下から checker を相対 --root 指定で実行した場合
- **予防策**: 絶対パス標準規定の gate spec パス引数全般への一般化 + 実行記録への解決先明記
- **8軸評価**: 27/40（発生3〔Jev 機械導出〕・影響2・横4・反映4・自動3・再利用3・再発4・費用4。Jev 評価 20261026T193925Z-5f5a: 横展開性〔evaluator index 4 = 実質 5〕と再利用性〔同 5〕で高め・最終判断は 4/3 で確定）
- **推奨処分案**: **promote（既存対策の更新）**。実測 gap: checker-execution-contracts.md の絶対パス規定は L198-201「worktree を検査対象とする checker の --root」のみ（絶対パス規定の全文 grep で 1 件のみ実測）であり、accept_definition_checks.ts L158-169 の gate cwd 基準解決（--input は非空検査のみ）と main root 対象 checker を被覆しない。3 回出現（deferred L4476〔2026-10-13〕+ E34〔2026-10-25〕+ E39〔2026-10-27 前後〕）。adversarial-review Stream A が PROMOTE_OK 判定（gap 実在・出現 3 回実測確認）
- **既存対策照合**: 対策あり（部分的）・ギャップ: guardrail insufficiency（規定の一般化不在）
- **エントリ一覧**: E34（機械工程 gate spec --input 相対パス ENOENT・Case #3850）、E39（traceability check --root 相対指定で unknown-req-refs 多量検出・Case #3841）

### P3: applySection のセクション置換で直前空行が消え見出しが前文に接続（E11）

- **根本原因**: record-comments.ts applySection の連結が before 末尾空行を保持しない（L320 末尾改行全除去 + L322 単一 `\n` 連結〔置換〕・L325-326〔追記〕）
- **再発条件**: applySection で既存セクションを置換・body 末尾へ追記した場合
- **予防策**: 連結前の before 末尾空行 1 行保証への修正 + 回帰テスト追加
- **8軸評価**: 25/40（発生1〔機械導出〕・影響2・横3・反映4・自動4・再利用3・再発4・費用4。Jev 評価 20261026T193925Z-5f5a 参照）
- **推奨処分案**: **promote（既存対策の更新）**。実測 gap: record-comments.ts L320-326 の空行非保証をコード読取で確認（現行 HEAD 不変）。テスト L412-508 は包含のみ検証で空行構造未検証。applySection は SKILL.md L120・delegation-and-result.md L116 の本番経路。Issue 本文崩壊系の既知対策（REQ-0132/0149）は本文全体 LF/見出し検証であり置換時空行崩壊は対象外。adversarial-review Stream A が PROMOTE_OK 判定（欠陥コード実測・テスト空白行未検証・本番経路使用を確認）
- **既存対策照合**: 対策なし（個別後処理による回避のみ）・ギャップ: fix gap
- **エントリ一覧**: E11（Root Case #3820・glued headings 機械チェックで検出・空行補完後処理で回避）

### rejected（1 クラス）

- **P2（E1）case-close scripts typecheck の pre-existing エラー 2 件: rejected（学習価値なし・別対策で対応済み）。** TS6133 原因の unused import（base 9b6e39329 L41）は HEAD で commit 842c55464（PR #3864・2026-10-27 00:01 merge・HEAD 祖先実測）で除去済み。TS2769 は HEAD で再現せず・base 機構（narrow cast）は HEAD L1154 で ConditionPopulation 拡張済み（adversarial-review Stream A が tsc 実測 + git log -S 実測で確認）。8軸 23/40（発生1・影響3・横3・反映4・自動4・再利用3・再発3・費用2）。残る横展開観点（他 scripts package の typecheck gate が exit 2 を暗黙許容していないかの棚卸し）は軽微な運用観点として本レポートに記録し prune。アーカイブ証跡（.agentdev/integrity/reports/ts004-*.stderr.txt）は非永続領域で消滅確認

### duplicate（17 クラス）

| クラス | エントリ | 処分根拠（実測） | 8軸 |
|---|---|---|---|
| P4 | E30 | definition-pr-and-idempotency.md L40 が「節見出しだけが存在して本文段落が欠落している場合…は不成立とする」を明示（2026-10-14 追加・事象 2026-10-24 より先行）。E30 は契約違反（適用側が見出し単位で実施・19/19 pass 誤申告）であり case-ready STEP-1 が設計どおり merge 抑止。adversarial-review Stream A 反証を受理し promote から duplicate へ変更（Jev 再判定 r-p4 は rejected 傾向 0.84 だが、定義上「既存恒久契約で被覆」の duplicate が正確・semantic_disagreement で記録）。機械化（行数検証）は intake 分離候補 | 26/40 |
| P5 | E25, E32 | L4515 同根（統合追記済み）+ harness-delegation.md L285-293 + distribution-concrete-id-placement.md + distribution-boundary.md 記述規則 + checker 事後検知 | 24/40 |
| P6 | E10, E15 | checker 実行契約 Design「link profile 実効実行要件」L192-221 + worktree-environment-fail-classification.md L21 + REQ-018 + L3934 等同根。エントリ自身が「既存契約どおりの運用/実証」と申告 | 23/40 |
| P7 | E16, E41 | worktree-operations.md L458-470（MAX_PATH 部分削除残存フォールバック）+ L472-488（Filename too long robocopy）+ L3450 同根（統合追記済み） | 22/40 |
| P8 | E40 | issue-operation-recovery.md L28（2 段分離試験）・L51-64（劣化サイクル・縮退運用・bash gh 読取例外）+ L2347 同根（統合追記済み・5 回目まで記録）。6 回目相当の再発は host プロセス環境障害であり恒久手順が検出・分離・縮退・再開を所有。残 gap は 2026-10-16 promoted で昇華済み | 20/40 |
| P10 | E26 | checker-execution-contracts.md L252-262（cwd 統一）+ qg-4 L365 + L3324 同根 | 21/40 |
| P11 | E28 | qg-4 L279-331「bun test フル suite 正規形（実行形態契約）」（L316 トリビア実行禁止・L310 和集合網羅件数突合）+ bun-test-execution-form-drift-signals.md。統合追記先なし・本レポートに根拠保存 | 22/40 |
| P12 | E29 | qg-4 L334（N/M 件数突合 + 環境ラベル）+ L4891 同クラス（node_modules 含み数え上げ〔過大〕vs junction 非追従〔過少〕の別変異・adversarial-review 指摘で「同根」から「同クラス」へ訂正） | 21/40 |
| P13 | E31 | worktree-environment-fail-classification.md L13-17（由来分離 3 手手段）+ qg-4 L334-338 + L4721 同クラス（IR-055 baseline 既存欠陥の由来分類）。adversarial-review 指摘で統合追記先を L4874（P9 同根・誤引用）から L4721 へ訂正 | 21/40 |
| P15 | E14 | definition-pr-and-idempotency.md L60-61（計測日収束 2 段検出・派生物の事後突合と明示パス指定補正 commit。L61 が req-health-metrics.md を名指し）+ 前回 C13（2026-10-20 duplicate 判定）と同一事象の再 capture。統合追記先なし（前回 C13 prune 済み）・本レポートに根拠保存 | 22/40 |
| P16 | E21 | L3640 同根（squash author date → IR-072 NG → frontmatter のみ是正 commit の機械的是正経路）+ 恒久根拠 patterns.md L37 + IR-072 機械ゲート（adversarial-review 指摘で恒久根拠を追加引用） | 23/40 |
| P17 | E23 | L2064 同根 + IR-072 機械ゲート（L2064 の「機械ゲート不在」根本原因は陳腐化済み） | 22/40 |
| P18 | E4, E24 | sidecar-and-policy.md L51（複数情報源分散禁止）+ L82（sidecar/inline いずれか一方のみ・inline 優先）+ L134-141（集合一致適用前確認）+ L2508/L3871 同根 | 23/40 |
| P20 | E33 | custom-tool-contracts.md L42/L47（pr_create 入力契約・契約外フィールドは副作用前拒否〔REQ-011-028/031〕）+ L4207 同型 | 21/40 |
| P21 | E2 | qg-4 L363-364（bun test サマリは stderr・stderr 側退避ファイルが突合根拠・stdout 単独退避では失われる）を verbatim 実測。エントリ自身「既存規約の実運用確認」と申告。統合追記先なし・本レポートに根拠保存 | 20/40 |
| P23 | E19 | qg-4 L326（退避ファイル名の stdout/stderr 対応判別可能な採番。E19 予防策の既存恒久規定）+ L370-377（保存済み証跡からの解析・再実行禁止・正当理由 6 種）。E19 自身「既存契約の適用」と申告。adversarial-review Stream B 提案を受理し deferred から duplicate へ変更（Jev 再判定 r-p23 duplicate 0.98 一致）。統合追記先なし・本レポートに根拠保存 | 20/40 |
| P36 | E38 | worktree-operations.md L163「Git Bash の rmdir は junction を空でないディレクトリとして扱い削除を拒否する」+ L155-162（正規手段は node fs.rmdirSync・junction エントリのみ削除）を verbatim 実測。E38 の現象と対策クラスは恒久手順で被覆。adversarial-review Stream B 提案を受理し deferred から duplicate へ変更（Jev 再判定 r-p36 duplicate 0.97 一致）。統合追記先なし・本レポートに根拠保存 | 20/40 |

### deferred（16 クラス・living pool 維持）

| クラス | エントリ | 維持根拠 | 8軸 |
|---|---|---|---|
| P9 | E17 | timeout flake 4 エントリ構成目の再発（L4697 統合追記）。前回 B7 審議の deferred 維持判断（fail は可視・既存手順で解消・残余〔並行起動規律の明記候補〕保持）は adversarial-review Stream B の duplicate 提案（windows-bun-test-spawn-timeout-classification.md 被覆）に対し新証拠で覆らず維持（同一 finding 再起票禁止・知識文書被覆は前回審議で確認済み） | 24/40 |
| P14 | E18 | 出現 1 件・直接実行クロス確認で対応済み・L3054（maxBuffer kill）は別機構の近縁・docs/knowledge に exit null 経路の被覆なし | 21/40 |
| P19 | E27 | definitionEdits remove 系第 3 出現（L3472 統合追記・create 2 + remove 1 の 3 出現で一般化パターン確立）。adversarial-review Stream A 反証を受理し promote 反転を取り消し: definition-pr-and-idempotency.md L39 が回避構成を標準手順文書化し「create 操作は追加しない」と明示決定・append-only primitive は 61a2c94ed（2026-10-18）で厳格化・再評価トリガー未発火（追跡 Issue 0 件実測）・Jev 昇華可能性 u-p19 は 0.5 割れ | 26/40 |
| P22 | E6 | 出現 1 件・決定的部品直接消費で対応済み・script 拡張は契約変更を伴い別途判断・L4624 は別局面の近縁 | 22/40 |
| P24 | E3 | 出現 1 件・distribution-boundary.md L85/L107 の解釈で大部分被覆・「様式例示の非数字形式」の具体規定なし・L4515 とは根本原因が異なる別局面（Jev 0.66 deferred / 0.32 promote） | 22/40 |
| P25 | E5 | 出現 1 件・撤去後再実行で解消・gate-not-passed として既存契約どおり・P6 とは伝播方向が逆向きの別現象（Jev 分類 0.98 で区別） | 21/40 |
| P26 | E7 | 出現 1 件・REQ 側修正不要の軽微な番号ズレ・運用知見 | 19/40 |
| P27 | E8 | PR #3819 で修正済み・重複キー事前検出は intake 候補として別経路処理中・「sidecar 追記は同一キー統合」の運用知見を保持・L3955 は別機構の近縁 | 22/40 |
| P28 | E9 | 既存契約（case-open STEP-3 手順 1.5）が設計どおり機能した適用実績記録・契約変更不要・L4536 は別現象の近縁 | 20/40 |
| P29 | E12 | 出現 1 件・保守的適用で解消・draft 生成検査の強化候補を保持・L2468 は別局面の近縁 | 21/40 |
| P30 | E13 | 出現 1 件・typecheck + bun test で代替済み（観測能力同等以上）・L2430/L4908 は別機構（timeout 限界 vs API 非対応）の近縁 | 18/40 |
| P31 | E20 | 出現 1 件・実害なしの検査手段知見・deferred 同根なし | 19/40 |
| P32 | E22 | 出現 1 件・読取方針確定で実害なし・検査系出力 schema 拡張候補を保持・L4967 は別現象の近縁 | 16/40 |
| P33 | E35 | 契約の fail-closed 動作が設計どおり機能した確認実績・契約変更なし・運用知見を保持・deferred 同根なし | 20/40 |
| P34 | E36 | 出現 1 件・修正は PR #3861 で恒常的テストに組み込み済み（恒久対応は実装で完結）・残るは知識文書接続追記のみ・docs/knowledge に ParseFile/ParseInput 記載 0 件実測（adversarial-review Stream B も promote 候補注記だが 1 回出現で deferred 維持） | 22/40 |
| P35 | E37 | 出現 1 件・修正済み（PR #3861）・.NET 子プロセス取り込みは install.ps1 系に限定・docs/knowledge に RedirectStandard 記載 0 件実測 | 21/40 |

### 未分類

- なし。41 件すべて P1〜P36 へ帰属。Jev 分類評価（20261026T193203Z-17fd）は全問暫定帰属と一致（confidence 0.98）。13 フィールド形式相当で正規化の適用なし

## Decision 候補除外記録

- **対象 item**: P1〜P36 全単位
- **除外理由**: 技術判断不在 / 運用ルール / command 仕様
- **根拠事実**: 全単位が運用・検証・手順・記録様式・環境障害対応の知見であり、アーキテクチャ上の決定、技術選定、設計判断の新規確定を含まない
- **代替反映先候補**: REQ/Design/配布 skill references/guide/knowledge（promote 2 件の反映先候補は採用済み成果物参照）

## STEP-4 adversarial-review

- 発動判定: **発動**（Jev boolean true・観測 20261026T194141Z-0df7・confidence 0.95。inbox 41 件で skip 条件〔空・1 件のみで重複確実〕非該当、evaluation-report 反映済み。親判断の最終確定結果が発動条件を満たしたため後続評価を生成）
- review 構成: 独立 challenge stream 2 本（explore サブエージェント・相互の finding を非公開で並行実行）。Stream A = promote 暫定系（P1/P2/P3/P4/P19〔当時 P5 番号〕）の処分判断の反証。Stream B = duplicate/deferred 系（31 クラス）の反証と分類境界検証。所要: Stream A 11m30s・Stream B 7m19s
- orchestrator（Reviewee）反証・受理結果:
  - **A1（受理・P2）**: promote 前提が stale — TS6133 原因 import は HEAD で 842c55464（PR #3864・2026-10-27 merge・祖先実測）で除去・TS2769 非再現・archive 証跡消滅。→ **rejected へ変更**
  - **A2（受理・P4）**: promote 理由が既存契約と矛盾 — L40「節見出しだけが存在して本文段落が欠落している場合…不成立」文言実在実測（2026-10-14 追加・事象より先行）。E30 は適用違反であり契約 gap なし。→ **duplicate へ変更**
  - **A3（受理・P19）**: deferred→promote 反転不当 — L39「DefinitionEdit への create 操作は追加しない」明示決定・61a2c94ed（2026-10-18）で primitive 厳格化・再評価トリガー未発火（追跡 Issue 0 件実測）。→ **deferred 戻し（L3472 統合）**
  - **A4（受理・P23）**: qg-4 L326（退避ファイル名 stdout/stderr 対応採番）・L370-377（証跡解析分離）の恒久規定を verbatim 実測。→ **duplicate へ変更**
  - **A5（受理・P36）**: worktree-operations.md L162-163（bash rmdir junction 拒否・fs.rmdirSync 正規手段）を verbatim 実測。→ **duplicate へ変更**
  - **A6（受理・P13）**: 統合追記先 L4874 は P9 同根（timeout flake）であり P13（IR-055 環境依存判別）とは別現象 — 引用誤り。→ **統合追記先を L4721 へ訂正**
  - **A7（受理・P16）**: duplicate 根拠が deferred のみでは不十分 — 恒久根拠 patterns.md L37 + IR-072 を追加引用
  - **A8（受理・P12）**: L4891 は同クラスだが機構別変異（過大計上 vs 過少計上）— 「同根」から「同クラス」へ訂正
  - **A9（受理しない・P9）**: Stream B の duplicate 提案（windows-bun-test-spawn-timeout-classification.md L11-21・適用条件 L38-43 被覆）に対し、前回 B7 審議（2026-10-20）で知識文書被覆は確認済みであり、残余（並行起動時の品質統制定義への timeout 系考慮明記）の保持判断に新証拠なし。同一 finding 再起票禁止契約に基づき deferred 維持（判断記録は L4697 統合追記に含む）。**unresolved ではない**（明示的反証と判断記録あり）
  - P1・P3: Stream A が PROMOTE_OK 判定（P1: 唯一の絶対パス規定が L198-201 --root のみ・gate spec --input 未被覆・3 回出現実測。P3: L320/L322 空行崩壊コード実測・テスト空白行未検証・本番経路使用確認）
- 反映後の再判定: STEP-2 戻り → 処分区分再判定（Jev 20261026T200139Z-a7ea・5 クラス。r-p2 rejected 0.87 一致・r-p4 rejected 0.84 と duplicate 最終判断が分岐〔semantic_disagreement・定義上 duplicate が正確〕・r-p19 deferred 0.46 一致・r-p23/r-p36 duplicate 0.98/0.97 一致）。昇華可能性の最終: P1/P3 true・P19 false（実測反証で変更）
- 戻しループ離脱: accepted finding の反映は実測済み根拠の機械的反映であり新たに未検証の争点を導入しないため、再 review は発動せず後続の意味評価と観測記録も生成せずに停止条件を満たしてループを離脱した（REQ-090-025 準拠）
- unresolved: なし

## STEP-5 自律確定記録

- 自律確定: 36 単位すべて自律確定（ユーザー承認なし）。promote 2 単位（P1・P3）は既存恒久手順の具体的 gap を実測（契約文書 grep・コード読取・adversarial-review 両 stream 検証・orchestrator 再実測）で確認した既存対策の更新であり、正規契約と実測からの導出で一意に確定。duplicate 17 単位は恒久手順・恒久規律・知識文書・機械検査による被覆を実測で確認（うち 4 単位は adversarial-review findings を実測再検証して受理した変更分）。deferred 16 単位は出現 1 件・回避構成確立済み・恒久被覆未確認等の判定基準該当を実測で確認。rejected 1 単位（P2）は別対策（PR #3864）で十分対応済みを実測で確認
- HITL 不要の理由（人間判断への引き上げ条件との照合）: (1) ユーザー固有の目的・価値観・優先順位の新規確定を要する事項なし。(2) 正規情報源間の未解決規範矛盾なし（STEP-4 で P2 stale・P4 契約矛盾・P19 反転不当が実測で解決済み）。(3) 対論型レビューの本質的争点は相互反証と実測検証ですべて解決済み（P9 対案は明示的反証と判断記録で解決・unresolved なし）。(4) 要件・仕様の対象範囲、外部契約、受け入れ条件、恒久規範の新規決定なし〔promote 2 単位は backlog-review/req-define 向けの提案ステージに限り、実現先の確定・恒久規範の確定は行わない〕。(5) 既存の明示的な安全境界が要求する操作の承認なし〔inbox クリアは正規の deferred 移動原子的操作プロシージャであり、prune は本 run 移動分の promote 時 prune で STEP-5 の判定確定と同時に承認済み。「inbox.md 全体強制クリア・大量エントリ一括削除」には該当しない。既存 pool への追加 prune は実施しない保守方針〕
- 判定の変更指示: なし（本 run は HITL 質問を発生させず STEP-6 へ進む）
- 破壊的変更: なし（既存 pool 257 件への追加 prune は実施しない。deferred 移動は原子的操作プロシージャの機械実行規律〔メモリ完結・全検証・一括書込〕に従い、統合追記 13 箇所・新規移動 14 件・inbox クリアを検証付きで実施。既存エントリの書換えは行っていない）

## STEP-6 実行記録

- **promoted 2 件**（existing-measure-update-checker-path-argument-absolute-standard.md〔P1・E34+E39〕・existing-measure-update-applysection-blank-line-preservation.md〔P3・E11〕）を新規生成（UTF-8 BOM なし・LF）
- **deferred 移動（原子的操作・メモリ完結＋全検証＋一括書込）**: 統合追記 13 箇所（L2064〔E23〕・L2347〔E40〕・L2508〔E4+E24〕・L3324〔E26〕・L3450〔E16+E41〕・L3472〔E27〕・L3640〔E21〕・L3934〔E10+E15〕・L4207〔E33〕・L4515〔E25+E32〕・L4697〔E17〕・L4721〔E31〕・L4891〔E29〕）+ 新規移動 14 件（E18・E6・E3・E5・E7・E8・E9・E12・E13・E20・E22・E35・E36・E37・移動日 2026-10-27）+ inbox クリアを実施し読戻し検証済み（deferred 見出し 275 行〔261+14〕・統合追記マーカー 13・移動日 2026-10-27 ×14・inbox ヘッダーのみ・見出し 0 件）
- **prune（promote 時）**: 26 件（promote 3〔E34/E39/E11・採用済み成果物の「元learning item / 根拠」セクションへ証拠保存〕+ duplicate 17 統合分〔E17・E25・E32・E10・E15・E16・E41・E40・E26・E29・E31・E21・E23・E4・E24・E33・E27。統合追記先へ証拠保存〕+ duplicate 6 単独〔E30・E28・E14・E2・E19・E38・本レポートに根拠保存〕）+ rejected 1（E1・本レポートに根拠保存）。inbox から除去（deferred へは追記せず）
- **実行証跡**: 既存対策の実測 — checker-execution-contracts.md L192-262（P1・P6・P10 被覆確認）・definition-pr-and-idempotency.md L40/L60-61（P4・P15）・qg-4-final-acceptance.md L279-331/L334/L363-364/L370-377（P11・P12・P21・P23）・worktree-operations.md L155-163/L441-488（P36・P7）・issue-operation-recovery.md L28/L51-64（P8）・sidecar-and-policy.md L51/L82/L134（P18）・custom-tool-contracts.md L42/L47（P20）・patterns.md L37（P16/P17）・windows-powershell-bulk-io-corruption.md（P34: ParseFile 記載 0 件）・docs/knowledge grep ParseFile/RedirectStandard 0 件（P34/P35）・record-comments.ts L300-327（P3 欠陥実測）・prepare_definition_pr.ts L303-320・definition-pr-and-idempotency.md L39（P19）・PR #3864 祖先確認（P2）・deferred 同根 27 箇所本文読込
- **git 永続化**: lock protocol（.agentdev/tmp/git-lock）で実行（pull/add/commit/push・対象 .agentdev/learning/ のみ）。commit hash は完了報告参照
- **一時ファイル**: tmp-inserts.md・tmp-app.md は適用検証後に削除

## 全体傾向

- **昇華価値の中心**: P1（27/40・絶対パス標準の一般化 gap・3 回出現・PROMOTE_OK）、P3（25/40・applySection 空行保証欠如・コード実測・PROMOTE_OK）。いずれも恒久規定の具体的 gap をコード・契約実測で確認した既存対策の更新
- **adversarial-review の効用**: promote 暫定 4 単位のうち 2 単位（P2 stale・P4 契約矛盾）と反転 1 単位（P19）を実測で是正、P19 の不当反転（Jev 0.5 割れ・L39 明示決定の見落とし）を未然に防止。deferred 系から 2 単位（P23・P36）の恒久被覆過小評価を発見し duplicate へ是正。引用誤り（P13→L4874）と根拠弱さ（P16 恒久根拠欠落・P12 同根表記）を訂正。一方、P9 の duplicate 対案は前回審議判断の維持として明示的に却下（同一 finding 再起票禁止の適用判断）
- **恒久被覆による重複**: bun test 実行形態・証跡系（P10/P11/P12/P13/P21/P23/P9）は qg-4-final-acceptance.md と checker 実行契約 Design の正規形契約群に集中的に被覆。IR-072 系（P15/P16/P17）は patterns.md L37 + 機械ゲート + definition-pr-and-idempotency.md に被覆。worktree・junction 環境系（P6/P7/P36）は checker 実行契約 + worktree-operations.md に被覆
- **保持型**: 出現 1 件の検証経路・環境障害知見（P14/P22/P24〜P35）は deferred で保持。PR #3861 由来の Windows エンコーディング系 2 件（P34/P35）は実装で恒久対応済みのため知識文書接続のみが残余
- **廃棄**: P2（E1）のみ rejected（PR #3864 で修正済み）
- **全体的な観察所見**: 本 batch は Case #3816〜#3862 系（2026-10-20〜10-27）の実行由来が中心。promote 2 単位は「恒久規定の範囲拡張」「script 欠陥修正」型であり、既存恒久手順の文面 gap とコード欠陥をコード・契約実測で裏付けている。inbox 申告と恒久契約の乖離確認の重要性が再確認された（P2 の stale 申告〔PR #3864 merge 前の capture〕・P4 の契約矛盾〔見出し単位適用の誤申告〕は inbox 申告のまま採用すると既存手順と衝突した）。本 run の Jev observation_write 失敗（8軸 finalResult 未追記・4 回 invalid_input）は fail-open 契約どおり warning として報告する
