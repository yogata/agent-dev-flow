---
title: 検証対応要否カタログ（トレーサビリティモデル references）
status: accepted
created: 2026-08-21
updated: 2026-09-17
---

<!-- ADF-COVERS(implementation): REQ-057-006 -->

# 検証対応要否カタログ

トレーサビリティモデル（[traceability-model.md](../traceability-model.md)）「対応関係の完全性規則」が所有する、検証対応の要否区分カタログ。

## 棚卸し方針と実施記録

検証対応要否カタログに未登録で、検証対応宣言も存在しない要件行（未分類行）は、本節の方針に従い棚卸しする。

- 判定基準: traceability-model.md「対応関係の完全性規則」の目安（恒続的な成果物（構造、データ、整合性、検査器、テスト）として検証可能な対象を持つか）に従い、行を検証する恒続的な検証手段を特定できる行は検証対応宣言の配置先とする。特定できない行（監査工程などの一回限りの実行契約、実行時の品質ゲートやレビューで検証する構造規範）は本カタログへ任意行として登録する
- 棚卸し単位: 未分類行は REQ 単位（同一 REQ 内の系統的関心のまとまり）で確定し、単位ごとに分類先（カタログ登録または検証対応宣言）を決める。行単位の個別判断は、単位内の行の性質が明確に異なる場合のみ行う
- 実施記録: Issue #2510（OU-003 宣言・カタログ整備）で実施した。case-open 分類ゲート時点で未分類 66件であった行は、Wave 1 の宣言配置・カタログ登録（REQ-057・REQ-001-067/068 のカタログ登録、REQ-010-068 検査クラスの検証対応）で 25件が解消し、残存 41件を本棚卸しで分類確定した。分類結果は REQ-002-045、REQ-010-064..REQ-010-067、REQ-010-069、REQ-010-070、REQ-032-022、REQ-045-001..REQ-045-009、REQ-046-001..REQ-046-003、REQ-046-006..REQ-046-010、REQ-047-001..REQ-047-008、REQ-048-007..REQ-048-014 の 41件であり、すべて任意行として本カタログへ登録した（docs-check の各検出機能は REQ-010-068 の検査クラス契約と同一系統であり、docs-check 検査と回帰テストで検証する任意行として扱う）
- 実施記録: Issue #2867（verification-scope-catalog 未分類行の検証対応任意行一括登録、保留 10 Case 解消）で実施した。case-run 実行時の traceability check 実測で未分類 72件を列挙し、棚卸し単位（REQ 単位）で分類確定した。分類結果は REQ-001-004..REQ-001-005、REQ-001-016、REQ-001-018..REQ-001-019、REQ-001-046、REQ-001-048..REQ-001-049、REQ-001-061、REQ-001-063..REQ-001-064、REQ-004-007..REQ-004-009、REQ-004-023..REQ-004-030、REQ-010-077、REQ-017-018、REQ-021-026..REQ-021-027、REQ-031-029..REQ-031-030、REQ-036-027、REQ-047-010、REQ-050-015、REQ-057-026..REQ-057-029、REQ-058-001..REQ-058-012、REQ-082-001..REQ-082-025 の 72件である。本棚卸し Case は検証対応宣言の付与対象外（実現 Case 側の責務）のため、恒続的な検証手段を特定できる行（REQ-010-077 の docs-check 検査クラス系、REQ-047-010 の checker 回帰テスト系、REQ-050-015 と REQ-058 の同期機構動作テスト系）は検証対応宣言の配置先候補として本記録に提案し、提案を確定できない行を含む全 72件を安全側の任意行として本カタログへ登録した。本登録により保留 10 Case（#2822 / #2823 / #2824 / #2825 / #2831 / #2832 / #2833 / #2846 / #2856 / #2858）の対象行集合（REQ-010-077、REQ-021-026..REQ-021-027、REQ-031-029..REQ-031-030、REQ-036-027、REQ-047-010、REQ-057-026..REQ-057-029、REQ-058-001..REQ-058-012、REQ-082-001..REQ-082-025）の分類が完了し、case-ready ready 遷移ゲート（REQ-021-024）の保留要因（未分類行残存）が解消する
- 実施記録: Issue #2870（バッチ投入時の共有成果物横断依存検査ゲート追加）の case-ready 検証対応要否分類ゲートで実施した。canonical Definition 確定（main 直 push commit 17afaf86）による新規行 REQ-030-012..REQ-030-014、REQ-061-029..REQ-061-031 の 6件を棚卸し単位（REQ 単位）で分類確定した。REQ-030-012..REQ-030-014 は case-open STEP-5 冪等確認の実行時振る舞い（警告提示、検出源限定、Epic 経路委譲境界）であり既存 REQ-030-001..REQ-030-011 のカタログ登録と同一系統、REQ-061-029..REQ-061-031 は case-ready 検証対応要否ゲートの実行時振る舞い（同一パス重複・共有領域未登録行重複需要の検出、警告と HITL 3 選択肢、警告の ready 遷移非影響）である。恒続的な検証手段（共有領域未登録行の fixture 回帰テスト、TS-002 / TS-003、RA-002 の bun test 基盤）は実現 Case 側の整備候補として検証対応宣言の配置先であり、整備までの間は安全側の任意行として本カタログへ登録した

- 実施記録: Issue #2883（RU-0022 正規成果物内 REQ 行引用の実本文整合、docs_chore）の case-close STEP-3 Design 状態評価で実施した。PR 本文の Design確定候補として記録された新規行 REQ-053-040 を棚卸し単位（REQ 単位）で分類確定した。REQ-053-040 は正規成果物本文内の引用品質という実行時の文書品質規範行であり、本 Case の実行契約では恒久 checker を作らない（TS-001/TS-002 が一回的検証）ため、安全側の任意行として本カタログへ登録した。本登録により traceability check の missing-verification（unclassified）は解消する

- 実施記録: Issue #2902（RU-0024 bun test 正規形の環境前提の実行契約明記、docs_chore）の case-ready 検証対応要否ゲートで実施した。canonical Definition 確定（Definition PR #2905、squash merge commit 0ee29675）による新規行 REQ-060-006 を棚卸し単位（REQ 単位）で分類確定した。REQ-060-006 は既存 REQ-060-001..REQ-060-005 と同一系統の bun test 実行契約の明記要求・実行時振る舞い行であり、恒続的な検証手段を特定しないため、安全側の任意行として本カタログへ登録した（REQ-060 節の範囲を 001..005 から 001..006 へ拡張）

- 実施記録: Issue #2914（RU-0031 adversarial-review 発動契約非該当時の判定理由記録様式の整備、maintenance）の case-ready 検証対応要否ゲートで実施した。canonical Definition 確定（Definition PR #2916、squash merge commit 03c14734）による新規行 REQ-014-016 を棚卸し単位（REQ 単位）で分類確定した。REQ-014-016 は既存 REQ-014-001..REQ-014-015 と同一系統の adversarial-review caller 統合の実行時契約（非発動時の判定理由記録と代替自己反証の様式・義務）であり、恒続的な検証手段を特定しないため、安全側の任意行として本カタログへ登録した（REQ-014 節の範囲を 001..015 から 001..016 へ拡張）

- 実施記録: Issue #2893（RU-0030 ADF-COVERS 除去可否判定の coverage 突合に役割フィルタと除去後検査を必須化、maintenance）の case-close 検証対応要否段階ゲートで実施した。canonical Definition 確定（Definition PR #2894、squash merge commit 21dfdd9c）による新規行 REQ-057-030 を棚卸し単位（REQ 単位）で分類確定した。REQ-057-030 は既存 REQ-057-026..REQ-057-029 と同一系統の ADF-COVERS 除去可否判定 coverage 突合の運用詳細（workflow・traceability 手順への投影）行であり、恒続的な検証手段を特定しない（本 Case のテスト戦略 TS-001〜TS-003 が実ファイル確認と cleanup シナリオの一回的検証）ため、安全側の任意行として本カタログへ登録した（REQ-057 節の範囲を 026..029 から 026..030 へ拡張）。本登録により traceability check の missing-verification（unclassified）は解消する

- 実施記録: Issue #2903（RU-0025 case-ready SKILL.md の移設残骸参照修復と ng-baseline ReferencePath legacy エントリ除去、maintenance）の case-close 検証対応要否段階ゲートで実施した。canonical Definition 確定（Definition PR #2910、squash merge commit 03c58bf4）による新規行 REQ-057-033 を棚卸し単位（REQ 単位）で分類確定した。REQ-057-033 は一回限りの参照残骸修復と baseline エントリ除去の実行詳細行であり、恒続的な検証手段は IR-062 reference-path-existence 自体（REQ-053-023 系の既存検査、本 Case の修正後表現は ok 収集を確認済み）が担うため、安全側の任意行として本カタログへ登録した。本登録により traceability check の missing-verification（unclassified）は解消する

- 実施記録: Issue #2904（RU-0026 check_distribution_boundary_cli.ts の誤起動防止、maintenance）の case-ready 検証対応要否最終ゲートの差し戻し経路（REQ-061-033、Definition Amendment PR 経由・REQ-030-015）で実施した。canonical Definition 確定（Definition PR #2907、squash merge commit 8ce3c113）による新規行 REQ-057-035 を棚卸し単位（REQ 単位）で分類確定した。REQ-057-035 は検査 checker の CLI 用分割スクリプトの直接起動時検査実行（runCli の top-level 起動による無出力・exit 0 の無検証成功の排除）と exit code 契約（0 ok / 1 violation / 2 error）維持の実行時規範行であり、恒続的な検証手段を特定しない（本 Case のテスト戦略 TS-001/TS-002 が直接起動と正規起動の突合と docs-check・関連 integrity 検査の一回的検証）ため、安全側の任意行として本カタログへ登録した。本登録により traceability check の missing-verification（unclassified）は解消する

- 実施記録: Issue #2906（RU-0028 Design accepted 昇格時の対応記録標準形式、maintenance）の case-ready 検証対応要否ゲートで実施した。case-ready STEP-6（canonical 再取得時の traceability check）で新規行 REQ-057-036 の未分類を検出し、REQ-061-033 の差し戻し経路に従い case-open が REQ-030-015 のとおり本カタログ追随を Definition Amendment PR に包含して登録した。canonical Definition 確定（Definition PR #2911、squash merge commit 6285ca2b）による新規行 REQ-057-036 を棚卸し単位（REQ 単位）で分類確定した。REQ-057-036 は既存 REQ-057-023..REQ-057-030 と同一系統の Design 昇格時の対応記録標準形式の運用規範行であり、恒続的な検証手段を特定しない（本 Case のテスト戦略 TS-001〜TS-003 が保存契約の読み取り確認と記録チャネル比較の一回的検証）ため、安全側の任意行として本カタログへ登録した（REQ-057 節へ単独行として追加。031/032/034/035 は他 Case 割当中のため既存 026..030 との範囲統合は行わない）。本登録により traceability check の missing-verification（unclassified）は解消する

## 形式

- 1行1エントリとする
- エントリは `REQ-{NNNN}-{MMM}`（単一要件行）または `REQ-{NNNN}-{MMM}..REQ-{NNNN}-{MMM}`（同一REQファイル内の範囲）で記述する
- エントリに登録された要件行は検証対応任意行（エージェントの実行時振る舞いを規定する要件行）である
- エントリには任意で説明文を後置できる（check は説明文を解釈しない）
- 説明文に対応宣言のマーカー文字列を含めてはならない（Markdown ファイルは宣言コーパスの走査対象のため誤検出する）
- 未登録の要件行は検証対応必須行として扱う（安全側既定）

## 任意行エントリ

Issue #2362 の移行作業（棚卸し (a')）で全現行要件行を判定した結果である。判定基準は traceability-model.md「対応関係の完全性規則」の目安（恒続的な成果物として検証可能な対象を持つか）に従い、検証対応の宣言対象とならなかった行を実行時の品質ゲートやレビューで検証する性質の行として登録した。REQ-049 のエントリは Issue #2420 の対応関係補完で追加し、Issue #2439 の REQ-049 全面再構成（要件行 001〜019 への置換）に合わせて再構成した。REQ-053 と REQ-010-071 のエントリは RU-0001（文章品質横断是正と再発防止）の要件化に合わせて追加した。REQ-053-014..REQ-053-022 のエントリは同一 RU の OU-001（文章品質完了検証契約）に伴い case-open の検証対応要否分類ゲートで追加した。REQ-054 から REQ-056、REQ-002-046、REQ-039-006 のエントリは REQ-054/055/056 の新設（変更誘発境界リスク分析要件化）に合わせて case-open の検証対応要否分類ゲートで追加した。REQ-056 エントリの範囲拡張（REQ-056-001..REQ-056-011）と REQ-001-066 のエントリはプロジェクト知識層（REQ-056 のプロジェクト知識一般への一般化）に合わせて case-open の検証対応要否分類ゲートで追加した。REQ-057 と REQ-001-067/068 のエントリは REQ-057 新設（docs corpus 整合・現行化バッチ要件化）に合わせて case-open の検証対応要否分類ゲートで追加した。REQ-011-025..REQ-011-030 のエントリは agentdev_gh 操作契約改修（REQ-011-022..024 行更新・025..030 行追記）に合わせて case-open の検証対応要否分類ゲートで追加した。REQ-057-024 のエントリは IR-055 baseline 鮮度維持行（REQ-057-024 行追記）に合わせて case-open の検証対応要否分類ゲートで追加した。REQ-045 から REQ-048、REQ-010-064..REQ-010-067、REQ-010-069、REQ-010-070、REQ-002-045、REQ-032-022 のエントリは Issue #2510（OU-003 宣言・カタログ整備）の棚卸しで追加した。REQ-053-024..REQ-053-038 と REQ-010-075 のエントリは textlint 文章表層品質共通実行基盤の導入（REQ-053-024..038、REQ-010-075 行追記）に合わせて case-open の検証対応要否分類ゲートで追加した。REQ-031-025..REQ-031-027、REQ-032-023、REQ-010-076、REQ-030-022、REQ-035-012 のエントリは移管 handoff RU 3件の要件化（worktree 検査起動契約・Wave 重複前置検出・語彙正規化）に合わせて case-open の検証対応要否分類ゲートで追加した。REQ-030-023..REQ-030-025、REQ-032-024..REQ-032-026、REQ-036-025、REQ-036-026、REQ-059-001..REQ-059-004 のエントリは Design 状態評価（case-close・inspect-docs）と Decision 状態評価（case-open・関連宣言管理）の要件化（REQ-030/REQ-032/REQ-036 行追記・REQ-059 新設）に合わせて case-open の検証対応要否分類ゲートで追加した。REQ-038-006 のエントリ（範囲拡張）は learning-promote の deferred.md 2フェーズ読み込み要件化（REQ-038-006 行追記）に合わせて case-open の検証対応要否分類ゲートで追加した。REQ-057-025 のエントリは knowledge README 一覧の実態整合行（REQ-057-025 行追記）に合わせて case-open の検証対応要否分類ゲートで追加した。REQ-007-010、REQ-031-028、REQ-032-027、REQ-060-001..REQ-060-005 のエントリは verify-only closure 実行証跡（RU-0002）、bun test 実行形態統一（RU-0003）、NG baseline 未整備環境の対照実行（RU-0004）の要件化（REQ-031/032 行追記・REQ-060 新設・REQ-007-010 行追記）に合わせて case-open の検証対応要否分類ゲートで追加した。REQ-005-029..REQ-005-031 と REQ-006-112..REQ-006-114 のエントリは Epic #2805（公開ワークフローの状態遷移中心再構成）OU-001（#2806、PR #2812）の case-close トレーサビリティ段階ゲート停止の解消（RU-0002 の要件化、ユーザー承認 2026-09-14）に伴い追加した。REQ-030-012..REQ-030-014 と REQ-061-029..REQ-061-031 のエントリはバッチ投入時の横断依存検査ゲート要件化（REQ-030/REQ-061 行追記、main 直 push commit 17afaf86）に合わせて case-ready の検証対応要否分類ゲートで追加した。

### REQ-001（文書体系）

- REQ-001-004..REQ-001-005: 判断記録文書の主題境界（技術判断に限定し作業手段を主題にしない）と案内文書の記述限定。文書整備時の品質ゲートとレビューで検証
- REQ-001-007: 状態早見文書の必備項目。文書整備時の品質ゲートで検証する
- REQ-001-016: 現行本文の取消線・見え消し排除と、制約・例外・境界の現行文記述。doc-writing 査読とレビューで検証
- REQ-001-018..REQ-001-019: 肯定文中心の記述原則と既存否定文記述の肯定文書き換え。doc-writing 査読とレビューで検証
- REQ-001-022..REQ-001-024: 判断記録の状態遷移・作成条件・保存前検証の実行時手続き
- REQ-001-033..REQ-001-035: 状態保持領域の git 管理対象性、作業用ドラフトの位置づけ、課題管理の一元化。運用規則
- REQ-001-042: 正規所有者経由の決定的処理の実行経路
- REQ-001-043: 引き継ぎ分類根拠の必須項目。実行時の記録品質
- REQ-001-044: 要件健全性指標の定量化提案。計算器は実在しないため運用時の判断
- REQ-001-046: 要件文書標準構成（目的・要件・適用範囲の三区分）と補助節非含有。REQ 構造診断とレビューで検証
- REQ-001-048..REQ-001-049: 要件行の四妥当性基準と、詳細実装の段階・手順番号直接参照の禁止。req-define 実行時の判断とレビューで検証
- REQ-001-053..REQ-001-054: 作業種別の4値分類と実行経路の派生。req-define 実行時の分類
- REQ-001-061: Decision と REQ の管理特性分離（重複排除と粒度管理の非混同）。REQ 構造診断とレビューで検証
- REQ-001-063..REQ-001-064: Decision の SPLIT/MERGE 意味的健全性評価と、REQ の重複・分割モデルからの健全性評価分離。REQ 構造診断とレビューで検証
- REQ-001-066: プロジェクト知識文書の正規所有・docs/knowledge/ 配置・必須内容5項目の原則行。docs-check 系の知識文書機械検査（REQ-056-010）、REQ 構造診断とレビューで検証
- REQ-001-067..REQ-001-068: 要件行の設計詳細分離基準と安定契約内容の要約記述許容。REQ 構造診断と doc-writing 査読・レビューで検証

### REQ-002（配布成果物の責務境界）

- REQ-002-006: script 種別の責務規定（決定的でテスト可能な実行ロジックの提供）
- REQ-002-012: ドメイン状態ディレクトリの git 管理対象性
- REQ-002-016: ガードレールスクリプトの配置規則
- REQ-002-020: repo-local 専用 skill の src 昇格対象外
- REQ-002-035: 判断と機構の責務分界の原則
- REQ-002-036: ローカル一時実行状態の保持境界
- REQ-002-037..REQ-002-041: 実行定義層の正規所有モデル（9層）、標準継承と差分記述、正本の一意性、決定的処理の配置基準、全 Command/Workflow Skill 組の重複解消の構造規範。docs-check とレビューで検証
- REQ-002-042..REQ-002-044: third-party Skill の第三区分定義、宣言に基づく取得機構経由配置と Git 管理境界、宣言済み+参照点集約の参照規律。機構の取得テスト・失敗系テスト（Case Issue のテスト戦略）、IR-058 の宣言済み判定とレビューで検証する実行時規範
- REQ-002-045: repo-local Plugin/Hook の正本配置、consumer 配布対象外、自己ホスト投影許容の構造規範。docs-check の配布境界検査とレビューで検証
- REQ-002-046: ADF core の技術固有知識非保持と REQ-056 との正本相互参照の原則規範。docs-check とレビューで検証

### REQ-003（委譲時の判断・承認・副作用境界）

- REQ-003-001..REQ-003-019: 委譲時の権限境界、返却契約、コンフリクト解消、HITL 境界、タイムスタンプ所有の実行時振る舞い
- REQ-003-021..REQ-003-056: promote 系 HITL 限定、対論型レビューの審議プロトコル（Reviewer/Reviewee の相互反証、finding lifecycle、収束条件）の実行時振る舞い

### REQ-004（要求の形成と合意）

- REQ-004-001..REQ-004-002: req-define の入力受付と既存 REQ 照合の実行時手続き
- REQ-004-004..REQ-004-006: CREATE/APPEND/UPDATE 判定の実行時判断
- REQ-004-007..REQ-004-009: 現行 REQ の記述対象境界（現在満たすべき状態への限定、作業手段の対象外化）。req-define 実行時の判断とレビューで検証
- REQ-004-010..REQ-004-012: 反映作業のみの要件行の検出と保存停止の実行時手続き
- REQ-004-014..REQ-004-022: 複数 RU 入力の統合分割判断、scale 記録、実装フェーズ分離の実行時振る舞い
- REQ-004-023..REQ-004-030: 要件行候補の実装指示排除、検証可能要件への限定、推奨・任意相当の除外、再説明排除の実行時判断。req-define 実行時の分類とレビューで検証
- REQ-004-034..REQ-004-040: 壁打ち対話の進行（分析フレーム、全体構造提示、両面分析）の実行時振る舞い
- REQ-004-042..REQ-004-053: Decision 採番・auto_gate・非機能受け入れ条件確認の実行時手続き

### REQ-005（ワークフロープロトコルと工程接続）

- REQ-005-001..REQ-005-009: 3マクロフェーズ構成、SSoT 遷移、work_type/scale 分類の実行時規則
- REQ-005-011..REQ-005-012: 追加工程と workflow-lifecycle の宣言的提供範囲
- REQ-005-015..REQ-005-028: 成果物間引き継ぎ、agentdev_handoff、STEP モデル、状態遷移の実行時振る舞い
- REQ-005-029..REQ-005-031: 公開ワークフローの例外経路（req-define 再合意を起点とする case-revise → case-ready）、backend 固有表現への非依存、汎用 Issue 操作の公開コマンド新設禁止の実行時規則

### REQ-006（Case実行オーケストレーション）

- REQ-006-108: case-auto の capture 成果物再分類禁止の実行時振る舞い
- REQ-006-112..REQ-006-114: Case 7状態モデルと終端状態（closed/cancelled）、case-run の実装開始条件（ready からのみ、blocked 起因ごとの状態値の増やし禁止）、resume_command の保持条件（blocked のみ保持・通常状態遷移時にクリア）の実行時規則

### REQ-007（完了報告と成果物品質ゲート）

- REQ-007-001: 再実行結果0件の合格証跡扱い。QG 実行時の判断
- REQ-007-004: 検証可能な証拡の記録品質。レビューで検証
- REQ-007-006..REQ-007-009: fail 要因分類、baseline commit 基準、検証環境証跡、baseline 再生成の運用規則
- REQ-007-010: baseline 未整備環境での対照実行（同一 detector・同一引数の baseline commit / 変更 HEAD 再実行、同一 signature 確認、新規違反 delta 0 実証）による合格判定。gate/checker 実行時の振る舞い

### REQ-008（一時成果物ライフサイクル）

- REQ-008-001..REQ-008-049: draft/RU/req_draft 構造点、配置、ライフサイクル、artifact_actions、operation_units の実行時管理
- REQ-008-051..REQ-008-058: session 由来 RU の frontmatter、採番、RU 本文8セクション、operation enum の実行時管理

### REQ-009（配布基盤と導入モデル）

- REQ-009-001..REQ-009-008: 導入器の3モード、リポジトリ種別、link mode の実行時動作
- REQ-009-010..REQ-009-011: consumer の plugin 配置規則
- REQ-009-013..REQ-009-017: .gitignore 推奨、ローカル版導入の実行時手続き
- REQ-009-021..REQ-009-044: link によるリポジトリ管理外配置、変換 script、unlink/relink、ローカルCase ファイル、GitHub 同期対象外、対話・ウィザード・ヘルプ・上級者オプションの実行時動作
- REQ-009-046..REQ-009-049: 導入系 script の provisioning 非実施、チェックアウト不在時の手順、ZIP 展開の取扱い、更新運用
- REQ-009-050: 導入・同期手段の third-party Skill 取得非関与と network access 禁止維持の境界規範。機構呼出コード不在確認・実行ログ観察（Case Issue のテスト戦略）とレビューで検証

### REQ-010（自己監査コマンド）

- REQ-010-004: docs-check と inspect 系の意味境界の非重複。意味判断のためレビューで検証
- REQ-010-010: 新規検証へのテスト必須の管理規則
- REQ-010-062: テストと配布 checker の規則同一性の維持規則
- REQ-010-064..REQ-010-067: docs-check の意味識別子、未解決プレースホルダー、廃止語、旧パス・削除済み実体の各検出要求。docs-check 検査と回帰テスト（Case Issue のテスト戦略）で検証
- REQ-010-069..REQ-010-070: docs-check の REQ 識別子存在性検査と、再検出対象の再発防止検査クラス追加契約。docs-check 検査と回帰テスト（REQ-010-068、Case Issue のテスト戦略）で検証
- REQ-010-071: 配布物の決定的破損検査クラスの追加要求。検査クラスの実装と回帰テスト（REQ-010-068、Case Issue のテスト戦略）で検証
- REQ-010-072..REQ-010-074: 関連REQ表の retired REQ 実パス検査、docs/designs 相対リンク実在検査、既知 delta 区分維持の各追加点。docs-check 検証とテスト（REQ-010-068、Case Issue のテスト戦略）で検証
- REQ-010-075: 本体の保存・完了・品質検査から共通 textlint 実行基盤を呼び出す統合要求、docs-check 非依存の導入先最終検査、既存整合性検査維持。共通基盤の最終検査回帰テスト（REQ-010-068、Case Issue のテスト戦略）と docs-check 検査で検証
- REQ-010-076: 変更ファイル限定検査の files_checked 空時検査見逃し扱い。docs-check 検査と回帰テスト（REQ-010-068、Case Issue のテスト戦略）で検証
- REQ-010-077: targeted docs guard の workflow プロファイル対象範囲の網羅性・代替検査指定の明記・files_checked 空（TARGET-EMPTY）の恒常運用禁止。docs-check 検査と回帰テスト（REQ-010-068、Case Issue のテスト戦略）で検証

### REQ-011（I/O境界と外部連携手段）

- REQ-011-001: gh-cli の境界確立宣言
- REQ-011-003..REQ-011-007: I/O 手続きと検証 (VERIFY) の実行時振る舞い、ローカル版読替
- REQ-011-009..REQ-011-013: backend 差し替え可能性、外部実行委譲、環境依存性緩和の設計原則と実行時手続き
- REQ-011-015..REQ-011-019: 委譲形式の維持、新規 command の前提、外部実行境界と harness 実行機構・状態機構の所有区分宣言
- REQ-011-020..REQ-011-021: Tool の非担当範囲（本文生成等の意味判断）、Hook による迂回防止適用の実行時振る舞い
- REQ-011-022..REQ-011-024: 追跡Issue操作の Tool 操作契約提供、追加・変更操作の Tool 内 VERIFY 完了後成功返却と読み取り操作の応答自己整合、GitHub 版とローカル版の同一上位操作契約提供の実行時振る舞いと契約宣言
- REQ-011-025..REQ-011-032: Issue 更新の追跡軸保持、再オープンの追跡状態遷移機械適用、一覧完全性（黙示切断禁止）、操作単位の入力契約（副作用発生前拒否）、失敗分類の区別、pr_read body と pr_update 部分更新、pr_create の draft 入力不在（契約外フィールド拒否）、pr_read の isDraft 写像（GitHub版は実状態、Local版は false 固定）の実行時振る舞い。Tool 実装の回帰テスト（Case Issue のテスト戦略）で検証

### REQ-014（adversarial-review caller integration 共通契約）

- REQ-014-001..REQ-014-016: 原則適用・skip 可能、副作用禁止、再 review 条件、停止条件、正規所有者マトリックス、発動契約非該当時の判定理由記録と代替自己反証の実行時契約

### REQ-015（adversarial-review caller integration 7呼出元+case-auto）

- REQ-015-001..REQ-015-012: 7呼出元の review 挿入境界、採用否決、blocked 遷移、case-auto 停止伝播の実行時振る舞い

### REQ-017（Issue Execution Contract）

- REQ-017-001..REQ-017-016: execution contract の Issue 埋め込み、品質統制の適用、blocked 遷移、runtime-only 判定の保持の実行時振る舞い
- REQ-017-018: Issue 監査値の計測基準（基準 commit または時点）の記録と第三者による鮮度検証可能性。Case Issue のテスト戦略とレビューで検証
- REQ-017-019: 委譲 prompt 生成側の structured_context の Issue 本文 SSoT 抽出制約と Issue 番号×対象成果物パス突合。委譲契約 Design・配布物 references との整合確認とレビューで検証
- REQ-017-020: 委譲 prompt 生成側の正典導出補助情報の機械突合可能形式記述と、実行側の正典優先と親への不一致報告。委譲契約 Design との整合確認とレビューで検証

### REQ-021（トレーサビリティのワークフロー統合）

- REQ-021-026..REQ-021-027: design-save 工程での既存宣言ブロック更新要否確認と、QG-4 traceability check の worktree/main root 時系列を踏まえた完了阻止判断。case-run・case-close 実行時の振る舞い

### REQ-027（Capability Skill・Soft guard・代表ケース検証）

- REQ-027-001: Capability Skill の抽出基準。設計判断のためレビューで検証
- REQ-027-003: 代表ケースでの妥当性検証。検証実行の記録運用

### REQ-029（配布依存境界）

- REQ-029-009: third-party 依存の宣言に基づく取得後解決による runtime 依存境界充足の規範。宣言+取得機構の動作テスト（Case Issue のテスト戦略）とレビューで検証する実行時規範

### REQ-030（case-open 実行契約）

- REQ-030-001..REQ-030-015: Root Case 確立と対象 REQ 番号埋め込み、Definition PR 作成、Definition Package 生成と Root Case 関連付け、合意済み入力の反映、冪等再実行、deviation capture、STEP-5 冪等確認での横断依存検査（draft の artifact_actions と未クローズ Case 群の機械的比較、同一パス重複時の警告提示、検出源の限定、Epic 経路の Wave 重複前置検出への委譲境界）、REQ 行追加時の verification-scope-catalog 追随確認の実行時振る舞い

### REQ-031（case-run 実行契約）

- REQ-031-001..REQ-031-010: 再開可能フェーズ、worktree での PR 作成、execution contract 遵守、QG-3 狭域適用、サブエージェント委譲、staleness check の実行時振る舞い
- REQ-031-013: intake/learning ドメイン状態の読み取り専用
- REQ-031-015..REQ-031-024: Epic Wave 実行、タイムスタンプ記録、本質的指摘事項の再検証ループ、worktree base 参照の実行時振る舞い
- REQ-031-025..REQ-031-027: worktree 上の docs 整合性検査の起動契約、変更ファイル検出モードの制限、fan-out 前重複前置検出の実行時振る舞い
- REQ-031-028: verify-only closure における3検査+integrity suite の実行と SSoT コメント（Issue コメント）への実行証跡記録。case-run 実行時の振る舞い
- REQ-031-029..REQ-031-030: 委譲結果受領時の4状態 result・commit hash・PR URL の3点必須検査と、background 委譲起動消失時の durable state による実行帰属確認・同期再委譲。case-run 実行時の振る舞い

### REQ-032（case-close 実行契約）

- REQ-032-001..REQ-032-003: 完了チェック項目の達成判定、最終確認、結果の分離報告の実行時振る舞い
- REQ-032-006..REQ-032-019: ユーザー確認禁止、ローカルコミット検出、危険な削除の停止、squash merge、mergeable 待機、ブランチ安全性事前検出、test strategy 完了確認、Epic Wave クローズの実行時振る舞い
- REQ-032-021: Epic クローズ前の全子 Issue 状態取得
- REQ-032-022: Epic Wave クローズ時の Wave スコープ一時成果物残留確認と残留時の完了阻止。case-close 実行時の振る舞い
- REQ-032-023: 検査実行結果の files_checked 空・root 誤解決の検査見逃し扱い。case-close 実行時の振る舞い
- REQ-032-024..REQ-032-026: case-close の Design 状態評価棚卸し制（棚卸し列挙、全件評価と見送り記録の既存チャネル保存、再実行時の冪等）の実行時振る舞い。Case Issue のテスト戦略とレビューで検証
- REQ-032-027: verify-only closure の QG-4 達成判定における SSoT コメント（Issue コメント）参照と、SSoT コメント不在時の完了抑止。case-close 実行時の振る舞い

### REQ-034（case-auto 実行契約）

- REQ-034-001..REQ-034-006: 追加ワークフロー位置づけ、入力解決、工程分岐、repo 内対象限定の実行時振る舞い
- REQ-034-010..REQ-034-036: operation_unit 管理、execution_unit 直列実行、停止理由分類、4状態集約、orchestration stage モデルの実行時振る舞い

### REQ-035（Epic と Wave 実行モデル）

- REQ-035-001..REQ-035-011: 単一書き手、親子整合、skip 状態、execution_unit 構成、並列実行、コンフリクト解消モデルの実行時振る舞い
- REQ-035-012: Wave 構成時の変更対象ファイル重複前置検出モデルと回復契約・判定軸の維持条件。case-open/case-run 実行時の振る舞い

### REQ-036（検出と診断コマンド群）

- REQ-036-001: 検出語彙の統一。整備時の規範遵守
- REQ-036-003..REQ-036-024: diagnostics 資産の二次利用許容、inbox 出力、REQ 体系診断、機械検査の委譲、skill 集約、修正路の提示、HITL 確定、処分、severity 維持、文脈規則移管、観点の所有場所の実行時振る舞い
- REQ-036-025..REQ-036-026: inspect-docs の Design・Decision 状態乖離 DRIFT 診断（判定基準、read-only 契約、観点分離）の実行時振る舞い。Case Issue のテスト戦略とレビューで検証
- REQ-036-027: inspect-skills の診断参照の正規性と、main 既知 NG・warning の根源解消または正規管理（ng-baseline・exemptions）と判断根拠記録。Case Issue のテスト戦略とレビューで検証

### REQ-037（取り込みパイプライン）

- REQ-037-001..REQ-037-007: 課題の蓄積、明示内容のみ生成、確定境界、inbox 配置、単一ワークフロー、成果物分離、独立ルートの実行時振る舞い
- REQ-037-009: capture 境界の定義内容

### REQ-038（学習パイプライン）

- REQ-038-001..REQ-038-006: 知見蓄積、最終確認、単一ワークフロー、learning 固有の評価、deferred.md 2フェーズ読込（突合スコープのプールサイズ非依存と全面読みフォールバック契約）の実行時振る舞い

### REQ-039（バックログ統合）

- REQ-039-001..REQ-039-005: 採用済み成果物の分析、統合、矛盾検出、RU 生成、昇格再評価の実行時振る舞い
- REQ-039-006: backlog 自体の処置の確定（RU 化、docs/knowledge/ への知識文書保存、重複・陳腐化した知識の削除、保留等）の実行時振る舞い

### REQ-041（backlog-auto 実行契約）

- REQ-041-003: オーケストレータの工程間接続のみ所有の実行時規則
- REQ-041-005..REQ-041-009: 直列実行、隔離の直列化、各工程境界の維持、独立継続の実行時振る舞い
- REQ-041-015: 中断・再実行の再開点利用

### REQ-044（標準API委譲の状態制約）

- REQ-044-004: 新規依存のパッケージ境界従属性の管理規則

### REQ-045（現行成果物体系の整合性網羅監査）

- REQ-045-001..REQ-045-009: 一回限りの網羅監査の対象範囲、監査観点、判定区分、証拠項目、問題クラス集約、旧表現と歴史的参照の区別、blocked 処理、未監査項目の取り扱い、結果保存形式の監査実行時手続き。監査レポート（docs/reports/）と横断正規化のレビューで検証

### REQ-046（横断正規化後の不変条件）

- REQ-046-001..REQ-046-003: 旧 ADR 表記の不在、歴史的 ADR 識別子の保持、未解決の DEC/REQ 表記不在の正規化後不変条件。docs-check の broken-ref・廃止語・未解決プレースホルダー検査（IR-055 baseline を含む）とレビューで検証
- REQ-046-006..REQ-046-010: 新 command 記述様式への統一、撤去済み機能参照の不在、旧パス・旧名称・旧 extension 種別の修正、一意に導けない事項の blocked 処理、修正単位の記録要件。docs-check 検査とレビューで検証

### REQ-047（規則所有権の一方向化）

- REQ-047-001..REQ-047-008: 対象規則ごとの正規所有者一意化、派生定義の位置付け、検査定義と checker の独立所有解消、陳腐化検出、外部挙動の維持、相反する正規定義の不在、生成機構の新設制約、追加判断への引き渡し条件の構造規範。docs-check とレビューで検証
- REQ-047-010: checker の検定義 yaml 読込の警告ノイズ抑制（定義実在・妥当時）と yaml 欠損時 fail-closed 維持。checker 実装の回帰テスト（Case Issue のテスト戦略）で検証

### REQ-048（ADF 実行観測と統制縮小評価）

- REQ-048-006..REQ-048-015: 実行評価の評価軸（Outcome、Efficiency、Quality、Autonomy、Control / Coordination の区別）、指標算出（wall-clock、token、同一 path 再読込、子セッション間の同一 path 再読込、source / projection 重複参照）、incremental value 比較、自律性評価、処理区分対応付け、機構分類（Safety invariant、Quality control、Efficiency support、Structure / Convenience）、実験契約（Baseline、Hypothesis、単一の主要構造変更、Guardrail、Observation、Decision）、縮小判断（KEEP、NARROW、MERGE、DOWNGRADE、DELETE）、structured handoff 等の観測対象化と非固定宣言、Legacy Baseline 保持の評価・分析時の振る舞い

旧→新行対応表（REQ-048 全面再構築、旧21行→新16行。Epic #2596「scope-affecting impact candidate」セクションで確定した対応の転記。新001〜016 は旧001〜016 と同番号別意味になるため、過去成果物の旧行 ID 引用との衝突を本表で解消する。新001〜005・016 は検証対応必須行（記録・形式契約）のため本カタログへ登録せず、Design implementation 宣言と契約テスト・Report 系 verification 宣言が検証配置先である）:

| 旧行 ID | 新行 ID |
|---|---|
| `REQ-048-001..REQ-048-006` | REQ-048-001..REQ-048-005、REQ-048-016（最小相関契約へ縮小維持） |
| `REQ-048-007..REQ-048-011` | REQ-048-014、REQ-048-007（structured handoff は観測対象化） |
| `REQ-048-012..REQ-048-014` | REQ-048-007、REQ-048-014（一般責務は workflow-contracts Design が保持し効率評価対象へ） |
| `REQ-048-015..REQ-048-018` | REQ-048-008（incremental value 比較へ抽象化） |
| `REQ-048-019` | REQ-048-012、REQ-048-013、DEC-027（縮小評価契約へ置換） |
| `REQ-048-020` | REQ-048-004、対象外（harness 変更非依存へ吸収） |
| `REQ-048-021` | REQ-048-015（Legacy Baseline へ分離、Baseline V2 は対象セクションで定義） |

### REQ-049（追跡Issue管理機構）

- REQ-049-001..REQ-049-005: 管理単位の永続性、role による機械判定、6状態の区別、実行許可と実行票への非変質、要件化経路（req-define 経由）と別 Case Issue 生成の実行時振る舞い
- REQ-049-014: 解決済みの結論保持、クローズ条件、反映先成果物更新の委譲の実行時振る舞い
- REQ-049-018: 移行情報が現在有効な論点のみを含む性質の規定。移行起票の実施は case 側の事項
- REQ-049-019: 追跡Issueを docs/ 配下の文書種別ではなく管理単位・永続状態として扱う規定。文書体系整備時の配置判断

### REQ-051（ガードレール識別体系と機械検査の再編）

- REQ-051-001..REQ-051-008: Gxx 連番制度の廃止、既存ガードレールの正規所有先移管、意味識別子の役割と付与条件、ローカル境界の ID 不要化、docs-check 検査の置換、旧制度残存防止の宣言と移行の実行時振る舞い

### REQ-052（Custom Tool・Plugin/Hook の種別契約と配布境界）

- REQ-052-001..REQ-052-010: 操作契約と実装詳細の分離、迂回防止、副作用操作の検証義務、fail-closed、補助能力の継続可否、配布境界、scripts 公開入口維持、権限所有者不変、詳細の Design 所有の種別契約宣言。実行時振る舞いとレビューで検証
- REQ-052-011: Custom Tool が外部ソースからの取得操作を構造化された副作用操作として提供できる旨の許容規範。third-party 取得操作の実装・操作契約レビュー（Case Issue のテスト戦略）で検証

### REQ-053（配布物の文章品質契約）

- REQ-053-001..REQ-053-007: 規範関係の明示、メタ指示の禁止、文の完結性、自然な日本語、規範宣言の使用制限、名詞連結の是正、条件節連結の制限の記述品質要求。doc-writing 査読とレビューで検証
- REQ-053-008..REQ-053-010: Markdown 構造破損、制御文字・不正な Unicode 文字・意図しない異言語文字、既知形式の参照残骸の不在要求。決定的破損検査クラスとその回帰テスト（REQ-010-068、Case Issue のテスト戦略）で検証
- REQ-053-011: 文章品質基準の作成時・査読時・診断時の 3 経路適用の実行時振る舞い。代表ケース検証で検証
- REQ-053-012: 決定的検査の存在と配布物全体への実行可能性の存在要求。決定的破損検査クラスの実装と回帰テスト（REQ-010-068、Case Issue のテスト戦略）で検証
- REQ-053-013: 既存配布物の適合、意味保持、変更禁止領域の是正実行要件。是正差分の査読（Case Issue のテスト戦略）で検証
- REQ-053-014..REQ-053-022: 文章品質是正の完了判定、完了証拠、既知不備センチネルの実行時契約。case-run のテスト戦略（最終 HEAD 全文再査読、ファイル単位検証、センチネル検査）とレビューで検証
- REQ-053-024..REQ-053-038: textlint 共通基盤導入の契約行（標準規則の常時有効性、書込み前全文検査と拒否、fail-closed、結果情報、対象加算、設定解決と反映、二入口同一性、迂回検出、導入経路、版固定、意味品質の既存所有、旧所有者退役、規則校正、zero-error）。textlint Plugin と最終検査の unit test・回帰テスト（REQ-010-068、Case Issue のテスト戦略）とレビューで検証
- REQ-053-039: 歴史記録（廃止済み要件と監査・実行記録）の検査対象外・是正対象外と、対象解決の機構固定既定除外・加算優先の契約行。textlint Plugin の対象解決 unit test（除外パターン・加算優先・二入口同一性、REQ-010-068、Case Issue のテスト戦略）と gate.ts --json の解決対象構成確認で検証
- REQ-053-040: 正規成果物内の REQ 行引用の実本文整合（出所不明引用の排除、実本文に即した修正または根拠付け替え）の文書品質規範行。Case Issue のテスト戦略（REQ-053-014/015/016 に従う最終 HEAD 全文再読取と grep）とレビューで検証

### REQ-054（変更誘発境界リスク分析）

- REQ-054-001..REQ-054-003: 5観点境界からのリスク導出、リスク導出規則の参照と不在時挙動、case-specific risk の検証契約への投影の実行時振る舞い。QG-1 投影完全性検査、REQ 構造診断とレビューで検証

### REQ-055（production-equivalent verification の定義）

- REQ-055-001..REQ-055-002: production-equivalent verification の定義確立と REQ-007 との時点分担（複製禁止）の文書規範。doc-writing 査読、REQ 構造診断とレビューで検証

### REQ-056（Project Knowledge の所有と workflow 利用）

- REQ-056-001..REQ-056-011: プロジェクト知識の所有・配置・利用・昇華経路の原則行、知識操作の利用者承認と対象外境界（intake、TIM、Project Extension）の禁止面、機械検査の範囲と意味検査非対象の限界の実行時振る舞い。docs-check 系の知識文書機械検査（REQ-056-010/011、本 Case で checker 実装により恒久検証手段を整備）、REQ 構造診断、横断確認とレビューで検証

### REQ-050（scripts 公開入口境界）

- REQ-050-007: scripts/ 直下の公開入口名に opencode を含めない命名規約。命名と配布物記述のレビューで検証
- REQ-050-012: trust root / protected path が新しい信頼対象パスを保護する方針。配布境界 gate とセキュリティ観点のレビューで検証
- REQ-050-015: 両公開入口 apply モードによる check 検出乖離（orphan を含む）の解消と、apply 後の同一条件 check 再実行による正常収束（同期完了条件）。機構の動作テスト・失敗系テスト（Case Issue のテスト戦略）とレビューで検証

### REQ-057（docs corpus 整合・現行化バッチ）

- REQ-057-001..REQ-057-022: docs corpus の参照・表記・カタログ・テスト基盤・ガイダンスの現行化目標と維持基準。恒久的な新機械検証を新設せず、既存検査（docs-check、IR-055 baseline、traceability check、integrity suite、IR-044）が新規違反を生まない制約と、Case Issue のテスト戦略・工程判断・レビューで検証
- REQ-057-023: ADF-COVERS 実装対応宣言の未付与行は正規配置先カタログ（artifact-responsibilities）に従い段階的に付与され、triage で retire を選択した要求行は宣言対象外であること。traceability check の検証対応計上で検証（検証対応任意行）
- REQ-057-024: IR-055 既知 delta の baseline 鮮度維持と、配布物 Markdown 変更時のマージ前置確認（baseline 再生成または該当表現の解消）の運用規則。integrity suite（IR-055 delta 由来の fail なし）と Case Issue のテスト戦略（baseline 再生成・前置確認運用の検証）で検証。恒久検証手段（検証対応宣言）の配置は該当 Case の対応関係補完で判断する
- REQ-057-025: docs/knowledge/README.md の知識文書一覧（列挙・件数表記）と docs/knowledge/ 配下の実態整合。Case Issue のテスト戦略（README 列挙と実態の機械的突合）とレビューで検証。恒久検証手段（docs-check の README 列挙整合検査）の整備は本 Case の恒久対策候補として別 Case で判断する
- REQ-057-026..REQ-057-030: 配布物本文の現行契約整合（陳腐化した運用記述の排除）、traceability check fail の実測対象選定による段階解消、宣言集約済み除去の coverage 前置確認、IR-055 baseline 残置検出の段階解消運用、ADF-COVERS 除去可否判定 coverage 突合の運用詳細（implementation 役割と docs/ パスのフィルタ必須、除去後の traceability check による後置検査）。docs-check 検査・traceability check・integrity suite（REQ-010-068、Case Issue のテスト戦略）とレビューで検証
- REQ-057-031..REQ-057-032: IR-067 baseline 由来の旧行番号引用の一回限りの付け替え是正と、消化後の本文全走査 strict 適用継続を規定する実行詳細行。恒続的な検証は IR-067 の既存検査（REQ-010-069/068）と Case Issue のテスト戦略・レビューで検証
- REQ-057-033: 配布 skill 本体の移設残骸参照の実在する参照先への解決と、解消後の IR-062 baseline-known 検出の ReferencePath bucket（provenance: legacy）からの除去運用。一回限りの baseline 整合・参照修復の実行詳細であり、恒続的な検証は IR-062 reference-path-existence 自体（既存検査）とレビューで検証
- REQ-057-034: ADF-COVERS implementation 宣言の段階付与残務を規定する実行時品質規範行。恒続的な検証手段を追加せず、case-ready / case-close の品質ゲートと一回的な traceability・coverage 確認で検証する任意行として扱う
- REQ-057-035: 検査 checker の CLI 用分割スクリプトの直接起動時検査実行（runCli の top-level 起動、無出力・exit 0 の無検証成功の排除）と exit code 契約（0 ok / 1 violation / 2 error）の維持、checker 共通実行契約の CLI 分割スクリプト エントリポイント契約と正規起動経路の注意の保持。一回限りの CLI エントリポイント修復と共通契約の注意追記の実行詳細であり、恒続的な検証は checker 共通実行契約（既存 Design）の明示内容と Case Issue のテスト戦略（直接起動と正規起動の突合）で検証
- REQ-057-036: Design status を draft から accepted へ昇格した場合の昇格根拠記録標準形式（Design 本体の見出し名「対応記録」、4必須項目、見送り記録との排他）の運用規範行。一回限りの Definition 保存と、case-close Design 状態評価での記録運用が適用経路であり、恒続的な検証手段を特定しないため任意行（Case Issue のテスト戦略〔TS-001〜TS-003 の保存契約読取確認とチャネル比較〕とレビューで検証）

### REQ-058（ADF 管理投影物の廃止時クリーンアップ契約）

- REQ-058-001..REQ-058-012: 管理対象投影物の同期状態分類（追加・修復・削除）、check・dry-run・apply モードの収束契約、管理対象外成果物の非破壊境界、適用完全性・冪等性・失敗報告、両公開入口への同一適用と archive installer 対象外。機構の動作テスト・失敗系テスト（Case Issue のテスト戦略）とレビューで検証

### REQ-059（Decision と REQ の関連宣言管理）

- REQ-059-001..REQ-059-004: Decision frontmatter 関連REQ宣言（related_reqs）、Decision 索引関連REQ表の自動生成と整合検査、未宣言検出（IR-061 系 finding 拡張）、Definition 保存（case-ready / case-revise）での初期保存の実行時振る舞い。Case Issue のテスト戦略とレビューで検証

### REQ-060（bun test 実行形態の統一）

- REQ-060-001..REQ-060-006: bun test 実行形態の統一（repo root 起 cwd・`./` 付きパス指定、ファイル単体指定も `./` 付き）、逸脱時の検知条件併記、QG-4 フル suite 正規形（agentdev-quality-gates 所有）への所有権非侵食、docs/knowledge/ 知識文書化と相互参照、配布 references からの参照追加、環境 precondition（package 境界ごとの依存解決状態と worktree plugins 分割環境差）の明記。checker/bun test 実行時の振る舞いとレビューで検証

### REQ-061（case-ready 実行契約）

- REQ-061-029..REQ-061-033: case-ready 検証対応要否ゲートでの横断依存検査（canonical Definition と未クローズ Case 群の同一パス重複・共有領域未登録行重複需要の検出、未分類行残存警告との同時提示と HITL 3 選択肢、警告の ready 遷移非影響、Epic 経路の Wave 内重複前置検出への委譲）、merge 前 Draft 状態確認（pr_read の isDraft、GitHub Draft PR 検出時の pr_merge 未実行・blocked 停止、復旧操作なし）、canonical Definition 再取得時の traceability check と unclassified 検出時の case-open 差し戻し経路の実行時振る舞い。REQ-061-001..REQ-061-028 は検証対応宣言済みのため本カタログへ登録しない。恒続的な検証手段（検出条件 (b) の fixture 回帰テスト、TS-002 / TS-003、RA-002 の bun test 基盤）は実現 Case 側の整備候補として検証対応宣言の配置先であり、整備までの間は安全側の任意行として本カタログへ登録した

### REQ-082（対論型レビュー審議契約）

- REQ-082-001..REQ-082-025: 対論型レビューの審議本体契約（3論理役割、往復反証、自律審議とユーザー付議境界、合意候補再検証、副作用権限非代行、動的レビュー戦略、finding 管理、2 stream 独立性、収束判定、本質的争点、収束後再検証、根本原因整理、指摘解消と実装修正の分離）の実行時振る舞い。adversarial-review の審議実行とレビューで検証

### REQ-083（Definition PR の状態契約）

- REQ-083-001..REQ-083-006: Definition PR / Definition Amendment PR の状態契約（通常 Pull Request 原則と外部由来 GitHub Draft PR の観測・blocked 停止扱い、definition/issue-{N}・definition-amend/issue-{N} ブランチ命名の Design 正規所有、「Definition PR」用語統一と履歴成果物の旧表現保護、agentdev_gh 正規操作のみによる作成から merge 完結、write guard・pr_merge fail-closed・partial merge 禁止の維持、状態契約以外の対象外宣言）の実行時振る舞い。REQ / Design / workflow reference の契約照合と Case Issue のテスト戦略（TS-001〜014）で検証

### REQ-087（採番例外の記録と REQ 番号ギャップ検査）

- REQ-087-001: 採番例外規定（ユーザー裁定による番号指定・REQ 本文への裁定記録・欠番非消費・決定的スクリプト既定経路）の numbering-policy「新規採番」への存在と REQ-082 前例との整合。numbering-policy 本文の記述整合確認とレビューで検証（REQ-087-002/003 の検査体系は ADF-COVERS 宣言対象）
