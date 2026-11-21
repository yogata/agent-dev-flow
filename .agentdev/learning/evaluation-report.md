# 評価レポート

## メタデータ
- **実行日時**: 2026-11-21 17:50（JST）
- **対象エントリ数**: 10件（inbox: 10件, deferred: 0件）
- **問題クラス数**: 7（単独クラスタ 5 件を含む）
- **判断材料の事実確認（利用者提供コンテキストの実体確認）**: HEAD b46ab1938「.opencode 側 repo-integrity の Phase 1/2 残存を解消し試験を src 側単一正本へ整理」をコミット実体から確認。.opencode 配下テスト78ファイル全廃・宣言コーパス走査を src 側へ変更済み。worktree・junction・projection 関連エントリの既存対策照合へ反映
- **既存対策照合の実測根拠**:
  - `src/common/skills/agentdev-git-worktree/references/worktree-operations.md`: worktree 内 junction 未伝播の明示（L103・L118-124・L180・L194-199）、node_modules 依存整備（junction 作成 / bun install の使い分け判断基準・L143-178）、textlint vendor 再生成前置（L114・L170）、main root 実体からの読取専用代替実行と環境ラベル記録（L202-233）
  - `docs/knowledge/worktree-environment-fail-classification.md`: 依存前提の実行形態別判断表、依存生成済み/未生成の判別前置、link gate zero-targets 等の「未実施」明示記録（L21-36）
  - `docs/knowledge/structure-migration-followup-checklist.md`: パス構造移設の3点セット同時変更・横断旧パス検索（参照文意整合は対象外）
  - `docs/knowledge/grep-zero-criteria-legacy-term-quotation.md`: grep 0 件基準と旧語の字面引用衝突の執筆規約（REQ 本体定義行の解釈基準は未記載）
  - `docs/knowledge/checker-fixture-import-share-adversarial-test-pattern.md`: 自己完結 checker の決定的実装共有パターン（複製+対決テスト。producer import 方式とは別観点）
  - stage 1 診断 finding（`.agentdev/inspect/inbox/inspect-docs-finding-20261121T083802Z.md` L492）: REQ-001-054/055・REQ-037-006 参照候補は本診断 findings と重複なし（対象面が異なる）→ 該当参照の意味整合検証は未実施
  - `docs/designs/integrity/rules/IR-044-req-spec-boundary-violation-detection.md`: 実在確認済み
  - `docs/requirements/REQ-123.md` REQ-123-003: 合格条件「runtime-package-boundary.md が15KB前後」の自然言語表現が現行も未改訂（実行は 16,914B で完了済み）

## 問題クラス一覧

### 問題クラス1: worktree への git 管理外実体（junction・node_modules・vendor）の伝播欠如と検証実行前の環境整備

- **根本原因**: git worktree は git 管理対象ファイルのみを checkout するため、junction・node_modules・vendor 等 git 管理外実体が worktree に自動復元されない。投影構造（src 正本 → .opencode 投影）と依存実体はいずれも git 非追跡
- **再発条件**: worktree 内で、git 管理外実体を前提とする検証・ゲート・試験（pre-push/pre-commit ゲート・skill scripts node_modules・link profile 掃査）を初回実行する場合
- **予防策**: worktree 作成手順への依存整備前置の組み込み、gateAvailability 前置確認、link 系の main root 実体代替実行と環境ラベル記録

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 3/5 | 同一根本原因の別側面観測 3件（pre-push ゲート・pre-commit vendor・link profile） |
| 影響度 | 2/5 | ゲート fail-closed 停止と checker 記録不能。成果物変更なし・環境準備のみで解消 |
| 横展開性 | 3/5 | worktree 依存実行を持つプロジェクトで発生し得るが、ADF 配布一般規則ではなく環境準備の問題 |
| 反映先明確度 | 3/5 | 既存手順・knowledge が整備済みで、恒久契約として追加反映すべき内容の輪郭が薄い |
| 自動化適性 | 3/5 | gateAvailability 前置確認は既に実装済み。残りは手順の事前参照の運用 |
| プロジェクト固有知識再利用性 | 3/5 | worktree-operations.md と worktree-environment-fail-classification.md にほぼ集約済み |
| 再発可能性 | 2/5 | 正規手順の事前参照と b46ab1938 の src 側単一正本化（.opencode 試験投影廃止）で抑制 |
| 費用対効果 | 2/5 | 既存対策で大部分カバー。追加投資の効果小 |
| **加重合計** | **21/40** | |

- **推奨処分案**: **duplicate** — 3件とも既存対策が明示的にカバー済み（実測: worktree-operations.md の junction 未伝播・依存整備・vendor 再生成・main root 代替実行の各節、knowledge worktree-environment-fail-classification.md の判別前置と「link gate zero-targets は未実施明示記録」、README「開発者セットアップ」）。今回の観測は既存手順の事前参照漏れ（application miss）であり、恒久契約更新を要しない。なおエントリ6 の「.opencode/skills agentdev-* junction 52件復元」実践は、現行正規手順（worktree-operations.md L194-199: worktree 内 .opencode 実在構成の前置確認と main root 実体側起動への切替が正規）から逸脱したその場の対応であり、b46ab1938（.opencode 試験投影廃止・src 側単一正本化）の構造整理により復元アプローチ自体が陳腐化方向にある（review accepted finding A-1 の根拠補強）。現行正規手順の前置確認・切替経路が duplicate 判定の主根拠
- **既存対策照合**: 既存対策あり。ギャップ分類: application miss（手順・知識は存在したが case-run 実行時に前置で参照されなかった）＋ b46ab1938 による構造解消済み部分あり

#### エントリ一覧
- 2026-11-21: worktree-prepush-skill-junction-restoration [inbox]
- 2026-11-21: worktree-pre-commit-projection-gate [inbox]
- 2026-11-21: worktree-link-projection-zero-targets [inbox]

### 問題クラス2: Windows Node.js Dirent 種別判定の junction 実装差（Dirent.isSymbolicLink() が false を返す）

- **根本原因**: Windows の junction は readdir の Dirent 種別判定で symlink として報告されない実装差があり、Dirent.isSymbolicLink() の戻り値はプラットフォーム・Node 版数依存
- **再発条件**: Windows 環境で Node.js の readdir Dirent 種別により junction を判定・列挙する実装を書く場合
- **予防策**: junction 判定は Get-Item LinkType または fs.lstatSync ベースに統一する規約化、期待件数突合（0 件を異常扱いする fail-fast）

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 1件（実質観測1回） |
| 影響度 | 2/5 | 復元スクリプトの誤検知ゼロ判定（静かな失敗）。pre-push 失敗後に訂正・成果物変更なし。実害の範囲は環境復元手戻りのみだが、復元対象 0 件の誤判定が復元スキップにつながる静かな失敗の潜在リスクは横展開性・再発可能性で評価済み（review accepted finding A-3 の理由注記） |
| 横展開性 | 4/5 | Windows + Node.js のファイル走査・リンク検出全般に適用可能な汎用実装差知見 |
| 反映先明確度 | 4/5 | 判定方法の規約化対象（走査系 checker・スクリプト・junction 手順節）が明確 |
| 自動化適性 | 4/5 | 判定方法統一と fail-fast の実装は容易 |
| プロジェクト固有知識再利用性 | 5/5 | Windows 環境固有の技術的落とし穴として高価値（既存 knowledge 群の Windows 系と同格） |
| 再発可能性 | 3/5 | Dirent ベース列挙を書く機会は限定的だが、junction 自体は b46ab1938 後も実在し走査系 checker・スクリプトは実在 |
| 費用対効果 | 3/5 | 規約・知識化は低コスト、静かな失敗（誤検知ゼロ判定）の防止効果は中 |
| **加重合計** | **26/40** | |

- **推奨処分案**: **promote（project knowledge 候補）** — 判定方法の実装差は「現在のシステム事実」として固定すべき技術知見であり、既存対策（worktree-operations.md の junction 作成・削除手順）には Dirent 誤判定の警告・判定方法規約が存在しない（実測: grep Dirent/isSymbolicLink/LinkType で該当なし）。静かな失敗を起こす実装差の知識化は docs/knowledge/ 候補
- **既存対策照合**: 既存対策なし（該当領域）。ギャップ分類: fix gap（junction 判定方法の規約・誤判定警告が既存手順・knowledge に欠落）

#### エントリ一覧
- 2026-11-21: windows-junction-detection-dirent-false [inbox]

### 問題クラス3: 構造移管時の参照・文意の意味検証を移管工程に含めなかった（未検証確認候補の残留）

- **根本原因**: 旧 document-model.md → document-type-responsibilities（dtr）への移管（構造移動）の工程に、REQ 参照の文意一致・関連付け整合の検証を含めず、参照を機械的に引き継いだ
- **再発条件**: 構造移動時に参照を機械的に引き継ぐ場合（参照文意の意味検査は機械検査困難）
- **予防策**: inspect-docs 意味診断での確認（または移管工程への文意検証追加）

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | 同型 2件（REQ-037-006 関連付け整合・REQ-001-054/055 文意不一致） |
| 影響度 | 2/5 | 誤参照の可能性の未検証であり実害は未発生 |
| 横展開性 | 3/5 | 構造移管を伴うプロジェクトで発生し得る |
| 反映先明確度 | 4/5 | 確認対象（dtr の該当節・REQ 行）が明確 |
| 自動化適性 | 2/5 | 参照文意の一致は意味判断で機械検査困難（診断は LLM 意味判断依存） |
| プロジェクト固有知識再利用性 | 2/5 | 個別参照の確認であり、一般化知見は structure-migration-followup-checklist.md（パス追随・文意は対象外）との統合時に初めて得られる |
| 再発可能性 | 2/5 | 今回の移管は完了済み。同規模移管の頻度は低い |
| 費用対効果 | 2/5 | 確認コストに対する実害防止効果が小さい |
| **加重合計** | **19/40** | |

- **推奨処分案**: **deferred** — 情報は「検証されていない可能性の提示」であり検証未完了。検証は inspect-docs 意味診断の実行時責務であり、stage 1（2026-11-21・71件）は REQ-037-006 / REQ-001-054/055 の参照文意を検出対象に含めていない（finding L492「対象面が異なる」実測）。影響が軽微で昇華の緊急性がなく、検証結果確定後の一般化知見（移管工程への文意検証組み込み）への昇華は次回再評価時に判断する。living pool で維持する
- **既存対策照合**: 既存対策なし（文意整合の診断観点なし）。ギャップ分類: guardrail insufficiency（診断観点に移管元→移管先の参照文意整合観点がない。ただし実害未確認）

#### エントリ一覧
- 2026-11-21: req037-006-ref-integrity-check [inbox]
- 2026-11-21: req001-054-055-ref-intent-mismatch [inbox]

### 問題クラス4: テスト側の解析ロジック再実装は契約変更に追随できず producer 正規解析へ一本化すべき

- **根本原因**: テストが producer の解析を別実装（正規表現ローカル再実装）で再検証すると、2つの実装が乖離したときにどちらが正かを判定する手段がなくなる。テストの検知対象は「契約の破壊」であり「パーサの再実装」ではない
- **再発条件**: テストが producer の解析・判定ロジックを正規表現・独自実装で再現して pin 検証する場合（試験統合・新規テスト作成時）
- **予防策**: テスト側での解析ロジック再実装を禁止し producer 正規解析関数を import する規約、試験統合時にローカル再実装の有無を統合判定観点に含める

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 1件（tim_declarations_contract.test.ts の1事例） |
| 影響度 | 3/5 | 契約変更時にテストが沈黙・誤検知し得る構造リスク（検証の信頼性に影響） |
| 横展開性 | 4/5 | producer・consumer 契約構造を持つ解析全般に適用可能な一般原則 |
| 反映先明確度 | 4/5 | 規約化対象（テスト設計観点・試験統合判定観点）が明確 |
| 自動化適性 | 3/5 | 規約化・試験統合時の判定観点への組み込みが可能 |
| プロジェクト固有知識再利用性 | 4/5 | テスト設計の判断知識として再利用価値が高い |
| 再発可能性 | 3/5 | 試験統合・新規テスト作成時に同種の再実装を起こし得る |
| 費用対効果 | 3/5 | 規約・知識化コストは低く、リスク低減効果は中 |
| **加重合計** | **25/40** | |

- **推奨処分案**: **promote（project knowledge 候補）** — 実害は自律対応済み（PR #4174・tim 圧縮で一本化完了、b46ab1938 で試験も src 側統合済み）だが、一般原則（「テストの検知対象は契約の破壊であり解析ロジックの複製はリスク」）は knowledge 化されていない。既存 checker-fixture-import-share-adversarial-test-pattern.md は「複製+対決テストで担保」の別観点（自己完結 checker の fixture 進行テスト構成）であり、本件（src 側テストでの producer import 方式）と適用条件が異なる。両者の使い分けを含む知見として knowledge 候補
- **既存対策照合**: 既存対策あり（近接）。ギャップ分類: fix gap（producer import 方式の規約・観点が既存知識に欠落。複製許容パターンのみ存在）

#### エントリ一覧
- 2026-11-21: test-local-parser-reimplementation-frozen-risk [inbox]

### 問題クラス5: 検索型合格条件の字面一致と意味意図の乖離（REQ 本体定義行の正当クラス解釈）

- **根本原因**: 「参照残存 0 件」型の検索合格条件は dangling 参照の不在を意味意図とするが、検索パターンは字面一致のため撤去命令そのものを記述する REQ 定義行（撤去対象モジュール名の列挙行）にも一致する。REQ は実行担当が編集不可のため合格条件が機械的に達成不能になる
- **再発条件**: REQ 行の完了条件に「参照残存 0 件」型の検索合格条件があり、当該 REQ 本体自身が撤去対象名を列挙する場合（解体系 REQ 実行時）
- **予防策**: 要件doc の検索合格条件に「REQ 本体定義行・網羅範囲外領域を除外」の解釈注記を事前含める、実行担当の Findings 根拠記録必須化と case-close 確認の明文化

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 1件（REQ-123-001 TS-001.2） |
| 影響度 | 2/5 | 解釈判断と Findings 根拠記録で運用回避・REQ 変更なし・手戻りなし |
| 横展開性 | 3/5 | 解体系 REQ・検索型合格条件を持つプロジェクトで発生し得る |
| 反映先明確度 | 4/5 | 既存知識（grep-zero-criteria）への追記・req-define ガイダンスの反映先が明確 |
| 自動化適性 | 3/5 | 解釈注記の要件doc 追加は可能、検査側の字面一致除外は困難 |
| プロジェクト固有知識再利用性 | 4/5 | 解体系 REQ 実行時の解釈基準として再利用価値あり |
| 再発可能性 | 3/5 | 「参照残存 0 件」型検索合格条件は今後の解体系 REQ でも使われ得る |
| 費用対効果 | 3/5 | 解釈注記追加は低コスト・合格判定ブレの防止効果は中 |
| **加重合計** | **23/40** | |

- **推奨処分案**: **promote（既存対策の更新カテゴリ）** — 同系問題の既存知識（docs/knowledge/grep-zero-criteria-legacy-term-quotation.md）が存在するが「執筆規約で予防」（旧語の字面引用回避）の観点のみで、REQ 本体が編集不可かつ列挙が本質必要な場合は回避できない別側面。REQ 本体定義行の正当クラス解釈基準と Findings 根拠記録運用の追記が既存知識・req-define ガイダンスへ必要（ギャップ明確）
- **既存対策照合**: 既存対策あり（近接・一部）。ギャップ分類: fix gap（REQ 本体定義行の正当クラス除外の解釈基準が既存知識・ガイダンスに欠落）

#### エントリ一覧
- 2026-11-21: ref-residual-search-excludes-req-definition-line [inbox]

### 問題クラス6: 合意済み REQ 行の IR-044 シグナル語がコミット・push ゲートで物理ブロックされ設計PR commit が完結しない

- **根本原因**: req-define と case-open はいずれも docs 整合性検査を実行せず（case-open Design「検査ツール: なし」）、IR-044 finding_route=req-define の検出は REQ-122-008/009（DEC-066・2026-11-18 以降）の warning 扱い物理ブロックによりコミット・push ゲートで初めて表面化する。既存 corpus は「第1〜第4フェーズ」表記で数字前置のためパターン不一致で通過している
- **再発条件**: req-define の draft（artifact_actions の REQ create/update content）が要件テーブル行に Phase/Step/手順 番号シグナル語（/\bPhase\s*\d+\b|フェーズ\s*\d+|\bStep\s*\d+\b|ステップ\s*\d+|手順\s*\d+/）を含む場合。draft 合意を通過した後の物理ブロックは構造的必然であり、前例（learn-20261119-definition-pr-preshcheck-rejects-merged-line・case 4162 同型構図）を含め2回目
- **予防策**: (a) req-define draft 組立時の IR-044 シグナル語事前走査と表記ガイダンス適用、(b) IR-044 warning の exemption/前例整備の利用者判断、(c) ゲート側 warning 扱い変更。(b)(c) は IR-044 ルール・REQ-122-008/009 の変更を伴うため req-define での利用者判断を要する

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 本 inbox では1件。ただし前例（2026-11-19・case 4162 同型）を含め同型2回目 |
| 影響度 | 4/5 | 設計PR commit が完結せず case-open が停止、Root Case 進行が物理ブロック。表記修正は req-define 再合意を要する手戻り大 |
| 横展開性 | 3/5 | IR シグナル語ゲート構造は本プロジェクト固有だが、「draft 産出と検査ゲートの乖離」構図は一般化可能 |
| 反映先明確度 | 4/5 | req-define draft 組立検査・IR-044 ルール Design・case-open 停止理由分類と反映先が明確 |
| 自動化適性 | 4/5 | IR-044 シグナル語走査は決定論的に実装可能 |
| プロジェクト固有知識再利用性 | 4/5 | req-define → case-open 機械工程連携の固有の落とし穴として価値あり |
| 再発可能性 | 5/5 | req-define が draft 産出時に検査しない限り、シグナル語を含む合意済み draft は必ずゲートでブロックされる構造的必然 |
| 費用対効果 | 4/5 | draft 組立時の事前走査追加は低コスト・物理ブロック回避の効果大 |
| **加重合計** | **29/40** | |

- **推奨処分案**: **promote（恒久契約候補（REQ）系）** — req-define（draft 産出時検査）は REQ-004/REQ-030 系の実行契約に対する機能追加要因であり、物理ブロック・手戻り大・再発構造必然（同型前例あり）で昇華価値が明確。予防策 (b)(c) は IR-044 ルール・REQ-122-008/009 の変更判断を伴うが、learning-promote は実現先を確定せず反映先候補として req-define 変更影響分析へ引き渡す（実現方向の確定〔(a) 単独か (a)+(b)/(c) か〕は req-define 側の利用者判断）
- **既存対策照合**: 既存対策あり（不備）。ギャップ分類: guardrail insufficiency（draft 合意時点でのシグナル語事前チェックが不在。検出が最後の物理ブロックでしか行われない構造欠陥）

#### エントリ一覧
- 2026-11-21: ir044-phase-wording-blocks-definition-commit [inbox]

### 問題クラス7: サイズ目標の自然言語表現（「15KB前後」）が契約へ入り合格圏の解釈が実行者側の読みに委ねられる

- **根本原因**: REQ 合格条件のサイズ目標が自然言語表現のまま契約へ入り、境界の解釈が実行者側の読みに委ねられた
- **再発条件**: REQ の合格条件に「〜前後」等の自然言語目標値を定義する場合
- **予防策**: 後続 REQ の定義時に明示的な合格範囲数値（例: 15,360〜17,360）への定義を提案

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 1件 |
| 影響度 | 1/5 | 継続指示の読みで運用回避・最終合格（16,914B）・手戻りなし |
| 横展開性 | 4/5 | 合格条件の数値明示は req-define 執筆品質として一般化可能 |
| 反映先明確度 | 3/5 | REQ-123-003 は実行完了済み（解体系 REQ）で行自体の改訂は手戻り。req-define ガイダンスが候補だが具体反映箇所は不明確。エントリ自体「後続 REQ の定義時に提案」 |
| 自動化適性 | 2/5 | 数値範囲の定義は執筆判断で機械化困難 |
| プロジェクト固有知識再利用性 | 3/5 | REQ 執筆の判断知識として価値はあるが薄い |
| 再発可能性 | 2/5 | 自然言語目標値は今後の REQ でも使われ得るが頻度は低い |
| 費用対効果 | 2/5 | 追加定義コストに対する効果小 |
| **加重合計** | **17/40** | |

- **推奨処分案**: **deferred** — 出現1件・影響軽微・運用回避済み・実行完了 REQ への手戻り改訂に価値なし。エントリ自体「後続 REQ の定義時に提案」（ユーザー確認要否: なし・定義改善の提案として記録）。反映先の明確化（req-define 執筆ガイダンス化か後続 REQ 契約の数値定義か）を含めて次回実行時に再評価する。living pool で維持
- **既存対策照合**: REQ-123-003 現行も「15KB前後」未改訂（実測）。req-define 執筆ガイダンスへのギャップは軽微。ギャップ分類: fix gap（軽微）

#### エントリ一覧
- 2026-11-21: runtime-package-boundary-size-threshold-definition [inbox]

### 未分類
- なし（全10エントリを問題クラス1〜7へ分類済み）

## 全体傾向
- **高頻出・高影響の問題クラス**: 問題クラス6（IR-044 物理ブロック・29/40・前例含め同型2回目）。機械ゲート強化（REQ-122-008/009）の副作用が上流工程（req-define draft 産出）に未波及のまま表面化する構図
- **横展開性が高い問題クラス**: 問題クラス2（Windows Dirent 実装差）・問題クラス4（テスト側解析再実装の禁止）。いずれも一般原則性が高く knowledge 化の価値あり
- **自動化適性が高い問題クラス**: 問題クラス6（シグナル語走査は決定論的実装可能）・問題クラス2（判定方法統一と fail-fast）
- **全体的な観察所見**: 本回の10件は Epic #4167（REQ-123 構造スリム化）の Wave 1〜4 実行中の capture 分が主体。worktree 環境整備系（問題クラス1・3件）は既存手順・knowledge が整備済みであり「手順の事前参照」運用の観察が必要。問題クラス6 のような「上流検査不在 → 最後の物理ゲートでブロック」構図は同型前例を含め2回発生しており、昇華優先度が最も高い

## Decision候補除外記録
- **対象item**: 問題クラス2（windows-junction-detection-dirent-false）
- **除外理由**: 技術判断不在 — アーキテクチャ上の決定・技術選定を含まず、Windows 環境の実装差という技術事実の記録と判定方法の規約であり、恒久知識（docs/knowledge/）への保存が適切
- **根拠事実**: 判定方法（Get-Item LinkType / fs.lstatSync）の統一は既存実装パターンの明示であり、新旧の技術トレードオフ決定を含まない
- **代替反映先候補**: docs/knowledge/ 知識文書、worktree-operations.md junction 手順節の補記

- **対象item**: 問題クラス4（test-local-parser-reimplementation-frozen-risk）
- **除外理由**: 技術判断不在（恒久契約レベルでは） — テスト設計の一般原則の知識化であり、 REQ/Decision の新規決定を含まない
- **根拠事実**: 実害は PR #4174 で解消済み。残る価値は知識・規約面
- **代替反映先候補**: docs/knowledge/ 知識文書（checker-fixture-import-share-adversarial-test-pattern.md との関係整理）

- **対象item**: 問題クラス5（ref-residual-search-excludes-req-definition-line）
- **除外理由**: 運用ルール — 検索合格条件の解釈基準・Findings 根拠記録の運用明文化であり、技術選定判断を含まない
- **根拠事実**: 対応は既存知識の追記と要件doc ガイダンスで足りる
- **代替反映先候補**: docs/knowledge/grep-zero-criteria-legacy-term-quotation.md 追記、req-define ガイダンス

- **対象item**: 問題クラス6（ir044-phase-wording-blocks-definition-commit）
- **除外理由**: 本ゲート適用対象外とせず REQ 候補として出力 — 予防策 (a)（draft 組立時事前走査）は req-define 実行契約への機能追加要因（REQ 候補）。なお (b)(c)（IR-044 exemption・ゲート warning 扱い変更）には DEC-066/REQ-122-008/009 の検証統制変更という技術判断が含まれ得るが、その確定は req-define 側の変更影響分析・利用者判断であり learning-promote の Decision 候補分類では先取りしない
- **根拠事実**: learning-promote は実現先を確定しない（採用済み成果物スキーマの反映先候補条項）
- **代替反映先候補**: REQ-030/REQ-004 系（req-define draft 産出検査）、IR-044 ルール Design（exemption 条件）、case-open Design（停止理由分類）

## promote 時prune結果

- **対象エントリ数**: 10件（promote 4 / deferred 3 / duplicate 3 / reject 0）
- **prune実施**: あり（2026-11-21・判定確定〔自律確定〕と同時に承認済みとして実施）
- **prune候補**: 7件（promote〔staged〕4件 + duplicate 3件。staged 4件は採用済み成果物の「元learning item / 根拠」セクションへ証拠保存済み・スクリプト検証済み）
- **prune却下**: 0件（deferred 3件は living pool 維持のため prune 非対象・deferred/ へ移動済み。再評価条件を追記済み〔adversarial-review accepted finding B-3〕）
- **実施記録**: inbox 10ファイル削除。deferred 3件は原子的移動（メモリ完結 → 全検証〔status 遷移・moved_at・再評価条件・見出し保持・文字化け・promoted 証拠節・prune ソース存在〕→ 一括原子書込 → 再読込照合 → inbox 削除）で実施し、書込検証成功後に inbox から削除。frontmatter に status: deferred・moved_at: 2026-11-21 を付与

## review（adversarial-review）記録

- **発動条件判定**: 発動（default-on）。evaluation-report.md に STEP-2/3 結果反映済み、skip 条件非該当（inbox エントリ 10件・1件のみで重複確実の skip 条件に合致しない、inbox 空でない）。不可逆処理（deferred 移動・prune・commit/push）未実行を確認済み
- **review 対象**: evaluation-report.md のみ（正規化結果、問題クラス分類、8軸評価スコア、廃棄判定、既存対策照合結果）
- **審議構成**: 2系統の独立 challenge stream（Stream A: 判定根拠の完全性・既存対策照合の正確性を疑う／Stream B: 処分区分の適用・昇華経路の整合・安全境界を疑う）→ counter-challenge → convergence → convergence audit
- **accepted findings と反映結果**:
  - **A-1**（問題クラス1・duplicate 根拠補強）: エントリ6 の junction 復元アプローチは現行正規手順（前置確認＋main root 実体側起動切替）から逸脱したその場の対応であり、b46ab1938 により陳腐化方向。duplicate 判定の主根拠を「現行正規手順の前置確認・切替経路」へ補強 → 反映済み（問題クラス1 推奨処分案）
  - **A-2**（問題クラス2・反映先候補の精度）: 元エントリの「想定反映先: learning-pipeline」は Windows junction 判定と無関係（分類基準の所有者であり技術知見の受け皿ではない）→ promoted 成果物の反映先候補から除外し、worktree-operations.md 補記と docs/knowledge/ 知識文書の2面のみに修正 → STEP-6 で反映
  - **A-3**（問題クラス2・影響度理由の注記）: 復元対象 0 件誤判定が復元スキップにつながる静かな失敗の潜在リスクを理由欄へ注記。スコア値は「実害は環境復元手戻りのみ」の観点で 2/5 維持 → 反映済み（問題クラス2 8軸評価表）
  - **B-1**（問題クラス6・promoted 本文の記載調整）: 予防策 (a)(b)(c) の並列列挙は req-define への先取り印象を与え得るため、「(a) は最小の新規機能追加要因（REQ 候補の主体）、(b)(c) は IR-044 ルール・REQ-122-008/009（DEC-066）の既存統制変更判断を伴う（確定は req-define 側の利用者判断）」を区別記載 → STEP-6 で反映
  - **B-3**（問題クラス3・deferred 移動時の再評価条件）: deferred 滞留が診断観点追加（参照文意整合の guardrail insufficiency 解消）を先送りし続けるリスクに対し、deferred エントリへ再評価条件「次回 inspect-docs 実行時の意味診断観点への REQ 参照文意整合観点の要否判断」を明記 → STEP-6 で反映
- **counter-challenge で判定維持された項目**: B-2（エントリ6 の「ユーザー確認あり」は Case 実行時の停止判断であり処分確定と別局面・処分確定自体は人間に留保された判断でない）、B-4（duplicate 3件の prune は処分区分表の正当な運用・観察価値は運用側課題として全体傾向に記録済み）
- **不成立（非本質）項目**: B-5（問題クラス7 の反映先明確化は判断確定していない記載であり learning-promote の先取りにあたらない）
- **unresolved**: なし。convergence audit で accepted findings の反映は処分分類・スコア値を変更しない記載精度の精緻化のみであり、新たな本質的争点なし。停止条件（新 finding なし・全 finding 処理済み・意味内容変化なし・HITL/blocker 移行なし）を満たし STEP-5 へ進む。再 review 不要

## 自律確定・HITL 記録

- **自律確定**: 全問題クラス（7クラスタ・10エントリ）を自律確定（ユーザー承認なし）。判定結果: promote 4（問題クラス2・4・5・6）、deferred 3（問題クラス3〔2エントリ〕・7〔1エントリ〕）、duplicate 3（問題クラス1〔3エントリ〕）、reject 0
- **主要根拠**: 処分判定は処分区分表の判定基準・8軸評価・既存対策照合（実測根拠: worktree-operations.md の該当節・knowledge 文書群・stage 1 finding・REQ-123.md・IR-044 実在確認・b46ab1938 コミット実体）から正規契約の判定基準へ一意に導出可能（REQ-096 確定権限3分類の「正規契約からの導出」）
- **HITL 不要理由**: 人間判断への引き上げ条件1〜5（新規価値確定・未解決規範矛盾・review 未解決争点・対象範囲/外部契約/受け入れ条件の新規決定・安全境界操作承認）のいずれにも該当しない。promoted は恒久契約候補であり REQ 化の確定（対象範囲・外部契約の確定を含む）は後続工程（backlog-review → req-define）で行われる。破壊的変更なし（inbox 削除は判定確定に伴う正規 prune・移動）。問題クラス6 の予防策 (b)(c) に含まれる「IR-044 / ゲート扱いの変更」は learning-promote の確定対象ではなく req-define 側の利用者判断に引き渡すため、本 STEP の HITL を発生させない
