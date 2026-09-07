# 評価レポート

## メタデータ
- **実行日時**: 2026-09-07 10:34
- **対象エントリ数**: 26件（inbox: 26件、deferred既存: 108件）
- **問題クラス数**: 5（3要素一致クラスタ。C1〜C3、C5、および AG-005 クラスタ。残り21件は単独エントリとして評価）

## 問題クラス一覧

8軸表記: 発生件数/影響度/横展開性/反映先明確度/自動化適性/固有知識再利用性/再発可能性/費用対効果。
発生件数は inbox エントリと deferred 同一ファミリーの合計で計上する。

| # | クラス/エントリ | 構成エントリ | 8軸 | 加重合計 | 推奨処分 | 主要根拠・既存対策確認 |
|---|---|---|---|---|---|---|
| C1 | worktree 検証の依存整備前提不全（node_modules 未伝播・分散配置） | E5,E7,E19（inbox 3件）+ deferred 同一ファミリー4件（PR #2413/#2432/#2440/#2443） | 4/3/4/4/4/4/5/4 | **32/40** | **promote（既存対策の更新）** | worktree-operations.md L130 と qg-4-final-acceptance.md L244 が依存前置を規定するが対象は agentdev-project-extensions/scripts 1 ディレクトリのみ。E19 は repo-agentdev-integrity/scripts 側も前提、E5 は tsc 型解決（@types/bun）、E7 は per-skill node_modules と junction 代替を提示。fix gap（対象ディレクトリ集合・型解決前提の不全）。7観測で環境依存 fail の既知 fail 判定妨害が反復 |
| C2 | PowerShell 経由コンソール出力退避の cp932/UTF-8 破壊 | E13（gh 出力 Out-File 退避）+ deferred 2件（リダイレクト JSON 破壊・git show パイプ cp932）+ 知識文書 windows-powershell-bulk-io-corruption.md 項3・項4 | 3/3/4/4/3/4/5/4 | **30/40** | **promote（既存対策の更新）** | 知識文書項3は「規定化に至らず living pool 再評価待ち」と明記。E13 は gh 出力退避という新適用面での第4観測（クラス2・クラス12・intake 2561 の checker stdout 面を除く）。規定化の再評価条件が充足された。標準回避手段（node execFileSync/spawnSync utf8 + writeFileSync）は文書内に既述 |
| C3 | bun test 実行形態正規形からの逸脱による偽 fail・収集ゼロ | E10,E12 | 3/3/3/4/3/4/4/4 | 28/40 | **defer** | QG-4 正規形（qg-4-final-acceptance.md「bun test フル suite 正規形」: 3 cwd 分割・./ prefix・cwd=リポジトリルート・明示指定）が実行形態を完全規定しており、両エントリとも正規形遵守で解消。残余は Windows worktree 固有の偽 fail 予防注記（dotfile 配下は ./ prefix のみマッチ、逸脱は ENOENT 偽 fail）という手順注記程度。前周期較正（28=defer）と整合 |
| C4 | AG-005 references 300行閾値は既存 references 行数追加で発火 | E26 + deferred 1件（PR #2397、移動日 2026-09-01） | 3/2/3/4/4/3/4/4 | 27/40 | **defer** | lint_skills.ts AG-005 が自動検出し手戻りは1往復で最小。prior deferred は mechanical-replacement-rules.md への事前確認段階反映候補。検出器が機能しており影響度2、恒久契約化の価値不足。living pool で2観測を保持 |
| C5 | pwsh 連結・終了コード意味論による失敗誤読 | E1（`;` 連結の失敗非依存実行）+ deferred 1件（$LASTEXITCODE パイプ最終コード） | 3/3/3/3/3/3/4/3 | 25/40 | **defer** | 予防策は `&&` 連結・終了コード直接参照という shell 運用徹底。汎用 shell 知識で、repo 固有の恒久契約昇華先が不明。2観測だが手段が異なる（連結 vs 終了コード）ため予防策は同族・根本原因は近縁として pool 保持 |

### 単独エントリ（inbox 21件のうち C1〜C5 所属 8件を除く 18件 + duplicate 4件）

| # | エントリ（日付: 要約） | 8軸 | 加重合計 | 推奨処分 | 主要根拠・既存対策確認 |
|---|---|---|---|---|---|
| E2 | 09-04: exemption 波及なし・sibling checker 再実行欠落 | 1/3/3/4/3/4/3/3 | 24/40 | **defer** | fix-and-reverify 契約の検証範囲が「当該 gate の detector 再実行」のみ。orchestration skill の検証範囲定義という契約ギャップ候補だが1観測。REQ 候補として再評価価値を pool 記録 |
| E3 | 09-04: Date.parse 繰り越し解釈 | 1/2/5/2/3/2/3/3 | 21/40 | **defer** | 汎用 JS 仕様知識。プロジェクト固有知識でなく docs/knowledge 向けではない。programming 系は third-party skill 領域 |
| E4 | 09-04: bun checker stdout の PowerShell パイプ cp932 再解釈 | 1/3/4/4/3/4/4/3 | 26/40 | **duplicate** | intake item 2026-09-04-checker-stdout-encoding-doc-candidate-2561 が同一観測の知識文書追記候補（checker-cli-stdout-loss-on-windows-bun.md への近縁現象追記）として tracker 存在。learning 側に未追跡の増分なし |
| E6 | 09-04: CommonJS checker は ESM import 経由で実行不能 | 1/3/4/4/3/4/4/3 | 26/40 | **duplicate** | intake item 2026-09-04-checker-esm-compat-candidate-2573 が checker 群 ESM 互換化の取り込み判断候補として tracker 存在（checker 機能単位の観測内容を完全包含）。安定実行経路契約は例外経路で運用継続を既定 |
| E8 | 09-04: ng-baseline additions manifest の bucket key 完全一致 | 1/2/3/4/4/4/3/3 | 24/40 | **defer** | SPEC どおりの動作で手順知見。近縁 deferred「bucket key evidence は語彙置換で陳腐化」（機構は別）。manifest の機械生成手順は baseline 運用契約の手順補足候補 |
| E9 | 09-04: traceability corpus のテストフィクスチャ誤検出（第2観測） | 2/2/3/3/3/3/5/3 | 24/40 | **duplicate** | intake item 2026-09-04-traceability-malformed-fixture-2558 が同一根拠の初回 capture tracker。エントリ自身が duplicate 統合（learning-promote で処分）を明記 |
| E11 | 09-04: 配布ソース面パス列挙補助ファイルの pre-write gate ブロック | 3/2/3/4/2/4/4/3 | 25/40 | **defer** | guard は REQ-029/DEC-014 の設計どおり fail-closed。deferred に同一クラス2件（TEMP 書出しブロック、一時検証ドライバ）があり回避策（worktree 内配置・配列直接読込）を pool 統合 |
| E14 | 09-05: targeted docs guard の --root + --files 併用代替手順 | 1/2/3/4/2/4/3/3 | 22/40 | **defer** | junction 未伝播環境の代替実行手順。intake item link-profile-main-root-execution-contract-2632 は check_distribution_boundary link profile 側の契約明記候補で、本エントリ（check_changed_docs の代替経路）とは checker が異なる |
| E15 | 09-05: 契約テスト2本は main repo untracked 実体 | 1/2/3/3/2/4/3/3 | 21/40 | **defer** | 既知構成（REQ-018 系）。OU-003（#2600）での契約テスト更新時に実行環境確認が流量済み。untracked 実体の tracker 化は別判断 |
| E16 | 09-05: bun run process.exit() CLI の stdout flush 破棄 | 1/3/4/4/3/4/4/4 | 27/40 | **duplicate** | checker-execution-contracts.md「安定実行経路」節（L139-143）と docs/knowledge/checker-cli-stdout-loss-on-windows-bun.md が同一現象を規定済み（標準経路+例外経路+exit code 基準判定）。契約確定後の再観測であり未追跡の増分なし |
| E17 | 09-05: IR-067 の plain REQ-NNN-NNN 歴史参照誤検出は code span で回避 | 1/2/3/4/3/4/3/4 | 24/40 | **defer** | 正規免除経路（IR ルール詳細の様式例示）の活用実例。歴史参照の code span 記録規約の明文化候補。1観測 |
| E18 | 09-05: 旧行 ID 参照 Report 更新は最終 Wave 完了条件へ | 1/3/2/4/2/3/3/3 | 21/40 | **defer** | REQ 再構築系 Epic の Wave 設計指針。個別インスタンスは OU-006（#2603）で解消済み。設計指針化は1観測では弱い |
| E20 | 09-05: bun test レポートは stderr、stdout 単独退避はゼロ | 1/3/3/4/4/4/4/4 | 27/40 | **defer** | checker 実行契約「stdout 証跡退避形式」の補完（stdout/stderr 併存退避+空検査）。E16（flush 破棄）とは根拠機構が別（reporter 流れ先）。1観測。C2 成果物の退避手標準化と併せて再評価候補 |
| E21 | 09-05: Baseline V2 測定サンプル不足・断定回避 | 1/2/2/3/2/3/3/3 | 19/40 | **defer** | 測定運用の記録。OU-008 以降の Wave 実行で観測サンプル自然増加、同一手順での再測定が前提計画 |
| E22 | 09-05: pr_create invalid-input の失敗詳細は委譲の一時情報として喪失 | 1/2/3/3/3/3/3/3 | 21/40 | **defer** | capture 境界（PR 本文入力源）の構造的知見。失敗応答 detail 記録のリトライ前提手順化は orchestration/case-run 候補。1観測 |
| E23 | 09-05: 未定義 flag 付き checker 呼出は positional 誤解釈で fail-closed | 1/2/3/4/3/4/4/3 | 24/40 | **defer** | checker CLI 契約の取り違え知見。未知 flag の fail-fast 化は checker 側改善候補。usage 確認手順は運用徹底 |
| E24 | 09-05: req-define 時点の行番号実測漏れは grep 再突合で Report を正とする | 1/2/3/4/3/3/3/4 | 23/40 | **defer** | 検証手順の運用知見。OU-002〜003 の検証手順（Report §7 を正とする運用）は適用済み |
| E25 | 09-05: フル suite のみ fail する flaky は基底 commit 再現比較で pre-existing 分離 | 1/3/3/4/3/4/3/3 | 24/40 | **defer** | AG-010 既知 fail 分離運用の2段階判定（単体再現→基底 commit 再現比較）の強化知見。当該テストのベースライン管理候補は intake inbox に回収済み（E25 エントリ記載） |

## 全体傾向

- 高頻出・高影響: worktree 環境の依存整備（C1、7観測）が最大クラス。環境依存 fail が既知 fail 判定を妨げる運用コストが反復している。
- 横展開性が高い: Windows PowerShell 経由の stdout 取り扱い（C2）、bun 実行形態（C3/E16/E20）。
- 自動化適性が高い: 依存前置（bun install 対象集合）、証跡退避の stdout/stderr 併存、AG-005 事前確認（行数計測）。
- 26件中4件（E4/E6/E9/E16）は intake tracker または既存契約・知識文書が観測内容を包含する duplicate。capture 二重経路（intake/learning）の収束は backlog-review 側で完了する。
- 前周期（2026-09-03）の較正（29以上+fix gap=promote、28以下=defer）を踏襲し、C1（32）と C2（30）を promote、C3（28）を defer とした。

## Decision候補除外記録

- 全26エントリとも Decision 候補から除外する。
- 除外理由: 「技術判断不在」（運用手順・検証環境整備・tool 操作知見であり、アーキテクチャ上の決定、技術選定、設計判断を含まない）。
- 根拠事実: 各エントリの予防策は手順追記・依存整備・文書更新であり、不可逆な技術的トレードオフを伴わない。
- 代替反映先候補: C1/C2 は採用済み成果物（既存対策の更新）→ backlog-review → req-define。其余は docs/knowledge/、配布 skill references、Design 運用注記などの情報候補として pool 保持。

## STEP-4 review 実行記録（adversarial-review）

- **発動条件判定**: 発動（default-on）。inbox 26件で skip 条件（1件のみ+重複確実、または空）非該当。判定対象は evaluation-report（正規化・分類・8軸・廃棄判定・既存対策照合）に反映済み。
- **レビュー戦略**: Stream A（既存対策照合の妥当性: 処分区分と実ファイル事実の突合）と Stream B（分類・8軸・判定較正: クラスタリング整合、スコア較正、HITL 境界）の2系統の独立 stream で初期 challenge を実施後、統合して counter-challenge・convergence・convergence audit を実行した。
- **主な accepted findings**:
  1. (B1 部分合意) E13 は pr_read fallback（deferred 既存ファミリー）と Out-File 文字化け（C2）の二面を持ち、C2 成果物は pr_read 半分を既存事実として明記する → 成果物の「既存対策確認」に反映。
  2. (A1 限定) C2 の反映先は windows-powershell-bulk-io-corruption.md（項3 規定化）であり、intake 2561 の checker-cli-stdout-loss.md 追記とは対象文書が別であることを成果物に明記し、backlog-review での統合可能性を通知する → 成果物の「関連」に反映。
- **撤回・棄却した findings**: 「E16 は知識文書更新候補として promote べし」（→ 安定実行経路契約が標準・例外両経路を規定済みで再観測の増分なし、duplicate 維持）、「C3 は2観測で promote べし」（→ 正規形が実行形態を完全規定、残余は注記、較正と整合、defer 維持）、「E26 は authoring 規約化候補」（→ AG-005 検出器が自動検出し手戻り1往復、影響度2、defer 維持）。
- **unresolved な本質的争点**: なし。全 finding が完了または限定合意。処分・スコアへの変更なし（accepted findings は成果物記載内容の補強のみで、evaluation-report の意味内容を変えないため再 review 発動条件非該当、ループ離脱）。

## 自律確定記録（STEP-5）

- 全26エントリ（5クラス+単独21件の全体）を自律確定した。内訳: promote 5件（C1: E5/E7/E19、C2: E13）→ 成果物2件、duplicate 4件（E4/E6/E9/E16）、defer 17件（C3: E10/E12、C4: E26、C5: E1、E2/E3/E8/E11/E14/E15/E17/E18/E20/E21/E22/E23/E24/E25）、reject 0件、HITL 対象 0件。
- **HITL 不要理由（横断契約Design「promote系判断確定とHITL境界」詳細判定表との照合）**:
  - 自律確定可能要件: (1) 適用既存契約・判断根拠を特定済み（worktree-operations.md L130、qg-4-final-acceptance.md L244、windows-powershell-bulk-io-corruption.md 項3、checker-execution-contracts.md「安定実行経路」、intake tracker 3件）。(2) 選択肢間に本質的競合なし（promote/defer の線引きは前周期較正と fix gap の有無という取得可能根拠で一意）。(3) ユーザー固有の価値判断・優先順位を要しない。(4) 反映先は候補情報であり対象範囲の新規決定を行わない（確定は req-define）。(5) 正規情報源間に未解決矛盾なし（知識文書項3の「規定化待ち」は矛盾ではなく本 promote が解消する対象）。(6) 判断に必要な情報の欠落なし。(7) review 実施済みで unresolved なし。(8) 既存の安全境界（deferred・未処理の自動削除禁止）を迂回しない（prune は staged/duplicate のみ）。
  - HITL 移送条件（8条件）のいずれにも該当しない: 複数妥当選択肢の残存なし、ユーザー価値判断不要、対象範囲新規決定なし、正規情報源矛盾なし、証拠不足なし、レビュー未解決争点なし、必須検証の利用不能なし、明示承認を要求する契約なし（REQ-038-002 の自律確定枠内）。
- 破壊的変更なし: inbox.md クリアは全エントリに処分が確定した標準 lifecycle 操作であり、全体強制クリア・一括削除に該当しない。prune は STEP-5 確定と同時に承認済みとみなす。

## prune・移動記録

- inbox 26件全件を deferred.md へ移動（移動日: 2026-09-07、処分判定付き）後、staged 5件（E5/E7/E19/E13 は成果物2件の「元learning item/根拠」に証拠保存済み）と duplicate 4件（E4/E6/E9/E16、tracker は intake inbox 3件と既存契約・知識文書）を prune する。defer 17件は deferred.md に残置する。
- 既存 deferred 108件の追加 prune は行わない（前周期確定の deferred 处分を尊重し、C1/C2 のファミリー4+2件はクラス証拠として成果物に引用した上で living pool に残置）。既存 deferred の追加 prune 候補は 0件。
