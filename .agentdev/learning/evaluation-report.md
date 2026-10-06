# 評価レポート

## メタデータ
- **実行日時**: 2026-10-07 00:30
- **対象エントリ数**: 30件（inbox: 30件, deferred: 152件〔インデックススキャン + 照合候補4件本文確認。adversarial-review で実測訂正: 当初申告 190件は grep `^## ` 見出し数と不一致だった〕）
- **問題クラス数**: 8（未分類 16 単独を含む。C6/C7 は deferred 側エントリを含む混合クラス）

## 実行概要

- 正規化: inbox 30エントリは全て新13フィールド形式（見出し日付なし形式だが旧5フィールドではないためパース補完のみ）。見出し日付なしは schema が定める「## YYYY-MM-DD: タイトル」形式からの逸脱（capture 側起因）であり、promote では解析時補完のみ行い元ファイル不変
- Jev 先行評価: 6件実施（problem-classification〔帰属境界4〕、axis-scoring×3〔C1-C4、C5-C7、U9/U10/U25/U30〕、disposal-determination〔境界4単位〕、sublimation-possibility〔promote 候補11〕）
- Jev 観測: 20261006T152331Z-8603 / 20261006T152510Z-4c11 / 20261006T152606Z-891f / 20261006T152753Z-4d26 / 20261006T152829Z-c203（書込成功）。problem-classification の初回評価は観測永続化のみ digest 形式誤りで失敗（評価自体は成功、fail-open 継続、observationId なし）
- 判定単位: 23（クラス7 + 単独16）+ duplicate 統合1（エントリ16 → deferred 既存エントリへ再発観測追記）= 総24処分単位（promote 11 + deferred 12 + duplicate 1）
- 処分判定基準: 8軸合計は参考値であり、質的基準との複合で判定した。(a) 実害未観測の設計観測、実装済み・既存文書カバー済み、並行 intake/RU 経路との重複管理 → deferred 優先。(b) 既存対策の fix gap 保有で予防策が正規反映先への明示補足に帰着する → promote。同点 24/40 での分裂（C3/U25/U3 promote 対 U21/U22/U1 deferred）はこの質的基準による（U21 実害未観測、U22 実装済み解消でヘルパー化のみ将来課題、U1 intake 並行）

## 問題クラス一覧

### 問題クラス C1: トレーサビリティ inline×sidecar 宣言の集合不一致

- **根本原因**: 同一論理関係（artifact×role）に inline ADF-COVERS 宣言と sidecar が並存する場合、traceability check は両情報源の REQ 集合完全一致を要求する。片側のみへの REQ 行追加で duplicate-inconsistencies が fail する
- **再発条件**: inline 宣言存在 artifact へ sidecar 経由（または逆）で対応宣言を追加する変更。REQ 行追加を伴う Case で発生し得る
- **予防策**: 宣言追加前に同一 artifact×role の反対側情報源の存在確認、両側へ同一集合で反映する手順の前置

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | 機械導出（クラス内エントリ数） |
| 影響度 | 3/5 | check が即時検出し追記で解消、手戻り中程度 |
| 横展開性 | 3/5 | inline×sidecar 二重宣言は本プロジェクト固有構造だが宣言追加は頻出 |
| 反映先明確度 | 4/5 | agentdev-traceability references/sidecar-and-policy.md・case-open STEP-3 手順が特定済み |
| 自動化適性 | 3/5 | 検出は check 自動化済み、予防（両側反映）は手順 |
| プロジェクト固有知識再利用性 | 3/5 | 宣言二重管理の構造知識として再利用価値中〜高 |
| 再発可能性 | 4/5 | REQ 行追加を伴う全 Case で機会があり未明示のため再発しやすい |
| 費用対効果 | 4/5 | 手順への一文追記で低コスト |
| **加重合計** | **26/40** | |

- **推奨処分案**: promote — 区分5（既存対策の更新）
- **処分理由**: 検出は自動化済みだが予防手順に前置確認がない（fix gap）。採用済み成果物として反映先候補・既存事実を req-define へ引き渡す

#### エントリ一覧
- トレーサビリティ対応宣言の inline・sidecar 二重宣言は集合完全一致契約で即検出されることの経験知 [inbox]（Issue 3460、case-run）
- design 宣言追加は sidecar 存在時 inline と同一集合を保つ（duplicate-inconsistencies 解消） [inbox]（Case 3501、case-open）


### 問題クラス C2: IR-072 frontmatter updated 再実測の対象・タイミング漏れ

- **根本原因**: 可変メタデータ再実測（frontmatter updated を変更日へ進行）の適用対象が REQ ファイルのみ、または検証実行後に派生物を含む commit を追加して content change 後の再実測を欠く
- **再発条件**: Design への append/update を含む Definition 変更、検証後に索引再生成等の派生 commit を追加する Definition PR
- **予防策**: 変更する全 frontmatter 持ち文書（REQ/Design/Decision）への再実測適用、最終 commit HEAD での再実測

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | 機械導出（クラス内エントリ数） |
| 影響度 | 3/5 | 修正 commit 追加・受入側手戻りが中程度 |
| 横展開性 | 4/5 | frontmatter 鮮度管理は汎用課題、IR-072 は本プロジェクトの checker |
| 反映先明確度 | 4/5 | case-open STEP-3 手順 1.5(3)・case-ready 受入検査が特定済み |
| 自動化適性 | 4/5 | IR-072 検出自動化済み、frontmatter 再実測も機械化可能 |
| プロジェクト固有知識再利用性 | 3/5 | IR-072 運用知識（Design 側対象・検証後 commit 陳腐化）は固有価値中 |
| 再発可能性 | 4/5 | Definition 変更を伴う全 Case で発生機会がある |
| 費用対効果 | 4/5 | 文言補足・再実測手順明記で低コスト |
| **加重合計** | **28/40** | |

- **推奨処分案**: promote — 区分5（既存対策の更新）
- **処分理由**: IR-072 check と deferred の 2026-09-16 知識（REQ/Design 同時更新）が存在するが、Design 側への適用漏れ・検証後 commit 後の再実測規律が手順に明示されない（fix gap・application miss）
- **備考**: エントリ17（対象漏れ: 手順 1.5(3) への Design・Decision 明示）とエントリ20（タイミング漏れ: 手順 2.5 順序補足 + case-ready 受入側での branch HEAD 再実測必須化）は予防策の適用面が異なるが、いずれも「可変メタデータ再実測規律の明示欠落」という同一根本原因に帰着し、反映先も同一グループ（case-open/case-ready 手順群）への補足であるため同一クラスとした。U30 は委譲要件テンプレートという別反映先グループ（委譲側の検査包含）のため別単独。採用済み成果物では対象漏れ・タイミング漏れの両面をカバーして生成する

#### エントリ一覧
- Definition 変更時の Design frontmatter updated 進行漏れが IR-072 で機械検出される [inbox]（Case 3494）
- case-open の検証後 commit（索引最新化）で req-health-metrics の計測日が content change し IR-072 freshness NG が受入検査で新規発生 [inbox]（Case 3494）


### 問題クラス C3: worktree junction 部分伝播による checker・gate 実行環境差

- **根本原因**: worktree は .opencode junction 伝播が不完全で、checker・テストの走査対象集合・実行可能 script 集合が main root と異なる
- **再発条件**: worktree root で .opencode 配下を走査する checker・テスト実行、worktree 投影外 skill の scripts 実行（case-run/case-close の常態）
- **予防策**: checker 実行記録への走査 root・junction 伝播状態の環境ラベル必須化、件数乖離時の main root 対照実行分類、gate パスは src/common 同等パス + --root 指定の分離

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | 機械導出（クラス内エントリ数） |
| 影響度 | 2/5 | 検証ノイズ・gate 実行失敗、対照実行コストで回復可能 |
| 横展開性 | 3/5 | worktree 運用は本プロジェクト中心だが git worktree 利用プロジェクト一般でも発生し得る |
| 反映先明確度 | 4/5 | checker 実行契約 Design・case-close/case-open references が特定済み |
| 自動化適性 | 3/5 | 環境ラベル付与は手順、件数突合は半自動化可能 |
| プロジェクト固有知識再利用性 | 3/5 | 既存 junction 系知識群への追加情報としての価値 |
| 再発可能性 | 4/5 | worktree 実行は常態で頻発 |
| 費用対効果 | 3/5 | 対照実行コストあり、環境ラベル記録は低コスト |
| **加重合計** | **24/40** | |

- **推奨処分案**: promote — 区分5（既存対策の更新）
- **処分理由**: 既存 deferred の junction 系知識群・link profile 実行条件規約が存在するが、環境ラベル必須化・対照実行分類・gate パス規律が checker 実行契約に規定されない（fix gap）。採用済み成果物で既存知識群との統合情報も引き渡す

#### エントリ一覧
- worktree 側 .opencode の部分伝播で checker 実行件数が main root と乖離する（main root 対照実行で環境差と分類） [inbox]（Case 3494）
- prepare_definition_pr 入力 JSON の品質ゲートコマンドは worktree 実行時 src/common 同等パスを指定する [inbox]（Case 3500）


### 問題クラス C4: workflow-extension acceptance_gates の merge 前確認欠落

- **根本原因**: case-ready STEP-1 の Definition PR 受入検査手順に project-extensions の acceptance_gates（docs/** 日本語文章変更への yomiyasu 適用記録確認、不足時 merge 前差し戻し）の前置確認が明示されない。workflow-extension の読込位置が検証ゲート（STEP-6）にのみ紐づき merge 判定より後
- **再発条件**: docs/** の日本語文章変更を含む Definition PR を case-ready が merge する全 Case（2回連続発生で再発実証済み）
- **予防策**: case-ready STEP-1 受入検査への acceptance_gates 突合の前置明示、case-open 側 PR 作成時の適用記録付与

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | 機械導出（クラス内エントリ数） |
| 影響度 | 3/5 | merge 巻き戻し禁止下の事後補完回復コスト、手順違反状態での merge 成立 |
| 横展開性 | 3/5 | extension 機構は本プロジェクト固有だが受入ゲート前置のパターンは汎用 |
| 反映先明確度 | 4/5 | references/definition-acceptance.md・definition-pr-and-idempotency.md が特定済み |
| 自動化適性 | 3/5 | ゲート確認は手順（将来 checker 化余地） |
| プロジェクト固有知識再利用性 | 3/5 | 受入検査と拡張読込の位置関係の知識 |
| 再発可能性 | 4/5 | 2回連続発生・手順明示まで再発構造が不変 |
| 費用対効果 | 4/5 | 手順文言の追記で低コスト |
| **加重合計** | **26/40** | |

- **推奨処分案**: promote — 区分5（既存対策の更新）
- **処分理由**: acceptance_gates 機構は存在するが受入手順の前置確認が不明示（application miss・fix gap）

#### エントリ一覧
- Definition PR 受入ゲート（yomiyasu 適用記録）の突合が merge 後になった [inbox]（Issue 3484）
- Definition PR merge 時の workflow-extension acceptance_gates（yomiyasu 記録確認）を merge 前に実施せず記録不在のまま merge した [inbox]（Case 3494）


### 問題クラス C5: 検証 fail の実行形態依存と由来分類

- **根本原因**: テスト・型検査の成否や変更前後対照結果がコード内容ではなく実行形態（並行負荷、単一/分割実行、tsconfig・target）に依存し、fail を由来分類せずに合格判定すると誤判定する
- **再発条件**: 並行セッションでのフル suite 実行、正規形外の実行形態でのテスト実行、実行形態を明記しない typecheck 変更前後対照
- **予防策**: fail 由来分類証跡手順（単独再実行・baseline 対照・正規形再実測）、正規形遵守の前置、typecheck 検証記録への実行コマンド明記

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 3/5 | 機械導出（クラス内エントリ数） |
| 影響度 | 3/5 | QG-4 誤 fail による判定ノイズ・再実行コスト（誤合格リスクは由来分類で防止） |
| 横展開性 | 4/5 | 実行形態依存はテスト運用全般で発生し得る |
| 反映先明確度 | 4/5 | QG-4 fail 由来分類節・checker 実行契約 Design の bun test 実行形態契約が特定済み |
| 自動化適性 | 4/5 | timeout オプション・正規形スクリプトは自動化可能 |
| プロジェクト固有知識再利用性 | 3/5 | bun test 運用・由来分類パターンの固有価値 |
| 再発可能性 | 4/5 | 並行実行・正規形外実行は今後も発生 |
| 費用対効果 | 4/5 | 証跡手順は既存・文言補足で低コスト |
| **加重合計** | **29/40** | |

- **推奨処分案**: promote — 区分5（既存対策の更新）
- **処分理由**: QG-4 fail 由来分類手順・正規形契約は存在するが、tsc 対照の実行形態一致規約・typecheck 実行コマンド証跡明記・timeout 対策の設計が断片的（fix gap）
- **備考**: エントリ13（tsc 対照）は Jev problem-classification の帰属境界評価で C5 統合と確定（実行形態アーティファクトによる検証汚染という共通根本原因）。エントリ14（textlint 一時 dictionary 競合）は原因確定が未実施（正規形 3 分割実行では非再現の運用分類により C5 帰属）であり、採用済み成果物では未確定である旨を引き継ぐ

#### エントリ一覧
- 並行実行時の bun test フル suite で corpus 系テストが回転的に timeout fail する事象とその由来分類 [inbox]（Issue 3454）
- tsc のヒストグラム対照は同一実行形態（tsconfig・target）で行わないと新規エラー判定が誤る [inbox]（Issue 3484）
- worktree の repo 全体 bun test 単一実行で textlint 一時 dictionary 競合疑いの fail が出る（正規形 3 分割実行では非再現） [inbox]（Issue 3485）


### 問題クラス C6: session由来RU frontmatter 契約と実測記録の差異

- **根本原因**: session 由来 RU（backlog-review を経由しない direct 生成）は frontmatter 品質の検証経路を持たず、契約固定値（generation_stage 規定値・generation_actor）と実測記録の差異が後工程へ持ち越される
- **再発条件**: supervisor が session 内で RU を直接生成する場合
- **予防策**: session 由来 RU 生成手順への frontmatter 必須フィールド検証の明文化、差異記録の扱い（承認の読み替えでなく記録で解決）の明文化

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | 機械導出（クラス内エントリ数） |
| 影響度 | 2/5 | 後工程での引き継ぎ確認コスト（運用で回復、契約破壊なし） |
| 横展開性 | 2/5 | session由来RU は本プロジェクト固有の経路 |
| 反映先明確度 | 3/5 | 契約文言の追記先（agentdev-backlog-integration・artifact-contracts.md）は特定済みだが、制約・受け入れ条件は未整備（情報断片的と評価） |
| 自動化適性 | 4/5 | frontmatter 検証ゲートは自動化可能 |
| プロジェクト固有知識再利用性 | 2/5 | 差異の扱いの知識は場面限定 |
| 再発可能性 | 3/5 | supervisor 直接生成は通常経路（backlog-review）以外の稀な運用。ただし既に2 RU（RU-0154・RU-0160）で発生しており、3回目発生時に promote 再評価とする |
| 費用対効果 | 3/5 | 明文化は低コストだが効果も限定的 |
| **加重合計** | **21/40** | |

- **推奨処分案**: deferred — 区分6
- **処分理由**: 場面が限定され出現頻度も低い。living pool で維持し再評価する

#### エントリ一覧
- session由来RU の generation_actor 契約固定値と実測記録の差異は承認の読み替えでなく記録で解決する [inbox]（RU-0160、Issue 3484）
- session 由来 RU の frontmatter が REQ-008-051 必須フィールド規律から逸脱する [deferred]（RU-0154、移動日 2026-09-27）


### 問題クラス C7: Windows MAX_PATH 起因の削除失敗と回復手順

- **根本原因**: Windows MAX_PATH（260文字）制限で深いパス（node_modules・textlint vendor 辞書）の削除が OS API 経由で失敗する。環境設定（LongPathsEnabled）で挙動が変わる
- **再発条件**: Windows 環境で bun install・build:engine 済み worktree を削除する場合、LongPathsEnabled 設定差のある環境でのパス長制限起因の手順検証
- **予防策**: worktree 削除手順への回復手順（node fs.rmSync → worktree prune → branch 削除）補足、検証時の環境ラベル付記

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | 機械導出（クラス内エントリ数） |
| 影響度 | 2/5 | worktree 残存・回復作業コスト（回復手順確立済み） |
| 横展開性 | 2/5 | Windows 環境固有 |
| 反映先明確度 | 4/5 | agentdev-git-worktree skill・worktree-operations.md が特定済み |
| 自動化適性 | 3/5 | 回復手順はスクリプト化可能 |
| プロジェクト固有知識再利用性 | 2/5 | Windows 運用知識として価値は中程度 |
| 再発可能性 | 4/5 | 依存生成済み worktree 削除は毎 Case クローズで発生し得る |
| 費用対効果 | 4/5 | 手順補足は低コストで効果確実 |
| **加重合計** | **23/40** | |

- **推奨処分案**: promote — 区分5（既存対策の更新）
- **処分理由**: worktree-operations.md の robocopy 手順・AGENTS.md の node fs API 規律が存在するが、依存生成済み worktree の remove 失敗時回復（fs.rmSync → prune）が手順にない（fix gap）。配布 skill（agentdev-git-worktree）への反映候補

#### エントリ一覧
- Windows で依存生成済み worktree の git worktree remove が Filename too long で失敗する（node fs.rmSync での回復手順） [inbox]（Case 3486）
- LongPathsEnabled 有効環境では Filename too long 部分失敗が再現しない（robocopy 手順の検証構成） [deferred]（移動日 2026-10-05）


## 未分類（単独エントリ）

### Jev 評価済み（採用済み成果物生成対象）

### 問題クラス U9: artifact_actions の update content が target_area 節の現行内容を全含しない場合、節置換は合意外の既存内容を削除する

- **根本原因**: req-define が update 操作の content を節の部分差分として生成し、操作種別（update=節置換）との組合せで削除リスクが暗黙化。draft の合意で target_area 置換の削除含意が明示されていない
- **再発条件**: req-define が update 操作の content を部分差分として生成し、後続工程が target_area 置換を機械的に実行する場合
- **予防策**: req-define の artifact_actions 生成契約へ「content は target_area 節の現行内容を全含する、または削除対象行を明示する」追加、case-ready 適用前検証（手順 1.5）への節内容差分突合の明文化

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 機械導出（クラス内エントリ数） |
| 影響度 | 3/5 | 合意外の既存ドキュメント内容の黙示的削除リスクが本質だが、本事例は適用前検出で回避済みで発生時の被害・手戻りは小（rubric「発生時の被害、手戻りの大きさ」に準拠して修正） |
| 横展開性 | 3/5 | artifact_actions 契約は本プロジェクト固有だが部分差分→置換のリスクパターンは汎用 |
| 反映先明確度 | 4/5 | artifact-contracts.md・case-open Design が特定済み |
| 自動化適性 | 4/5 | content 全含の検証（diff 突合）は自動化可能 |
| プロジェクト固有知識再利用性 | 3/5 | draft スキーマ運用の固有知識 |
| 再発可能性 | 4/5 | req-define の update 操作生成は毎 Case で発生し得る |
| 費用対効果 | 4/5 | 契約文言追加・手順明記で低コスト |
| **加重合計** | **26/40** | |

- **推奨処分案**: promote — 区分5（既存対策の更新）
- **処分理由**: case-open の適用前検証（target_area 実取得・read 突合）が今回機能したが、生成契約側の規律と適用前検証手順の明示がない（fix gap）

#### エントリ一覧
- artifact_actions の update content が target_area 節の現行内容を全含しない場合、節置換は合意外の既存内容を削除する [inbox]（RU-0161、Issue 3486）


### 問題クラス U10: Definition PR の品質検査記録が coverage 対象外の既存行の missing-design を検出できず case-ready STEP-2 で表面化する

- **根本原因**: PR 側の coverage --req 実行対象が新規行に限定され、UPDATE 対象の既存行（design 対応 0 件が merge 前から存在）が check 対象に含まれない。UPDATE は行を check 対象へ新規に引き込む行為で、潜在欠落が Definition Package 構成の欠漏として表面化する
- **再発条件**: 既存 REQ 行を UPDATE 対象に含む Definition の case-open 生成・case-ready 受入
- **予防策**: case-open の Definition Package 生成時に UPDATE 対象行を coverage/check の機械実行対象へ含める、design 対応 0 件の既存行を UPDATE 対象にする場合は design 宣言追加を同一 Package へ含める

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 機械導出（クラス内エントリ数） |
| 影響度 | 4/5 | case-ready STEP-2 差し戻し（工程手戻り大、Epic 停止） |
| 横展開性 | 3/5 | traceability coverage 対象設計は本プロジェクト固有だが検査対象集合の設計パターンは汎用 |
| 反映先明確度 | 4/5 | case-open Design・definition-acceptance.md が特定済み |
| 自動化適性 | 4/5 | coverage 対象行集合の拡張は自動化可能 |
| プロジェクト固有知識再利用性 | 3/5 | UPDATE と検査対象の関係の固有知識 |
| 再発可能性 | 4/5 | 既存行 UPDATE を伴う Definition は発生し得る |
| 費用対効果 | 4/5 | 生成手順の対象行集合明記で低コスト |
| **加重合計** | **27/40** | |

- **推奨処分案**: promote — 区分5（既存対策の更新）
- **処分理由**: case-ready STEP-2 の missing-design ゲートは機能したが、case-open 生成時の機械実行対象規定がない（fix gap）

#### エントリ一覧
- Definition PR の品質検査記録が coverage 対象外の既存行の missing-design を検出できず case-ready STEP-2 で表面化する [inbox]（Issue 3486）


### 問題クラス U25: 完了条件チェックボックスの機械抽出は CRLF 退避 body で 0 件になる（LF 正規化が前置）

- **根本原因**: gh CLI の --jq 出力は GitHub 保存本文の CRLF をそのまま含み、行マッチ regex が行末 CR を消費できず checkbox 行が一致しない。total 0 でも step が fail にならないため silent failure になる
- **再発条件**: Windows 環境で gh CLI の body 出力をファイル退避し行指向抽出へ入力する場合（gh 出力自体が CRLF を持ち得る）
- **予防策**: 行指向抽出前の LF 正規化前置、または total 0 時の warn 報告

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 機械導出（クラス内エントリ数） |
| 影響度 | 3/5 | 抽出 0 件による完了条件評価不能（突合で検出済み、silent failure の危険） |
| 横展開性 | 3/5 | Windows + gh CLI に限定されるが行指向 CRLF 入力の問題は他処理にも通じる |
| 反映先明確度 | 4/5 | case-close 機械工程手順・close_mechanical_steps.ts 入力契約が特定済み |
| 自動化適性 | 4/5 | LF 正規化前置は一行追加で自動化容易 |
| プロジェクト固有知識再利用性 | 2/5 | gh CLI CRLF 特性の固有知識 |
| 再発可能性 | 3/5 | Windows での body 退避は常態の運用 |
| 費用対効果 | 4/5 | 正規化一行で低コスト |
| **加重合計** | **24/40** | |

- **推奨処分案**: promote — 区分5（既存対策の更新）
- **処分理由**: 抽出入力契約に LF 正規化の前提記載・total 0 時の warn がない（fix gap）

#### エントリ一覧
- 完了条件チェックボックスの機械抽出は CRLF 退避 body で 0 件になる（LF 正規化が前置） [inbox]（Case 3497）


### 問題クラス U30: docs 内容変更を伴う委譲には check_integrity 単独実行を MUST DO に含めるべき

- **根本原因**: docs 内容変更を伴う委譲の MUST DO 工程に check_integrity 単独実行が含まれず、frontmatter updated 進行漏れ等の検出が委譲要件外に置かれる。検出担当が委譲要件外だと機械検査の実行漏れは下流工程まで遅延し merge 後 fix コストを生む
- **再発条件**: docs 内容変更（REQ/Design 本体・frontmatter を含む）を伴う委譲で check_integrity 実行を委譲要件に含めない場合
- **予防策**: docs 内容変更を伴う委譲の MUST DO に check_integrity 単独実行（既知 warning 以外の NG 0 確認）を含める

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 機械導出（クラス内エントリ数） |
| 影響度 | 4/5 | case-close blocked + merge 後 fix PR（工程遅延大） |
| 横展開性 | 3/5 | 委譲要件テンプレートは本プロジェクト固有だが検査の委譲前置パターンは汎用 |
| 反映先明確度 | 4/5 | 委譲要件テンプレート・case-run 委譲要件確認事項が特定済み |
| 自動化適性 | 4/5 | テンプレートへの検査コマンド包含は自動化可能 |
| プロジェクト固有知識再利用性 | 3/5 | 委譲と検出担当の関係の固有知識 |
| 再発可能性 | 4/5 | docs 変更委譲は毎 Case で発生し得る |
| 費用対効果 | 4/5 | テンプレート文言追加で低コスト |
| **加重合計** | **27/40** | |

- **推奨処分案**: promote — 区分5（既存対策の更新）
- **処分理由**: check_integrity と case-close のマージ後検査は存在するが、委譲要件側の前置がない（fix gap）
- **備考**: Jev problem-classification の帰属境界評価で C2 とは別単独クラスと確定（予防策が委譲要件の検査包含で C2 の再実測適用範囲と異なる）

#### エントリ一覧
- docs 内容変更を伴う委譲には check_integrity 単独実行を MUST DO に含めるべき [inbox]（Case 3500、PR 3505/3506）


### 問題クラス U3: REQ 行改番時の旧参照追随スイープが related_req と本文括弧書きの2層で漏れる

- **根本原因**: 行 ID 改番の追随スイープが related_req フィールド（AUTOGEN 起点）と README 索引に偏り、ルール文書 description 本文中の行 ID 括弧書き言及と related_req の意味論（どの行で採用された checker か）まで確認していない。旧番号が別行として生存する場合は存在性検査が無効
- **再発条件**: REQ 行の改番・行 ID リネーム・行統合を伴う Definition 変更の適用時
- **予防策**: (a) related_req フィールド、(b) ルール文書・Design 本文中の行 ID の prose 言及（括弧書き含む）、(c) 旧番号で生存し続ける行との意味論的参照先判別、の3点をスイープ対象にする。prose 言及は作成時点の git 履歴で旧番号が何を指していたか確認してから判定する

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 機械導出（クラス内エントリ数） |
| 影響度 | 3/5 | GAP-3 残存で case-close 完了条件再評価時の追加修正 commit（中程度） |
| 横展開性 | 3/5 | REQ 行改番は REQ 管理を行うプロジェクト全般で発生し得る |
| 反映先明確度 | 4/5 | 行採番規律（numbering-and-validation.md）が特定済み |
| 自動化適性 | 3/5 | prose 言及と related_req の整合 checker 拡張は将来課題（現在は手順） |
| プロジェクト固有知識再利用性 | 4/5 | 改番時スイープの判断基準を含む知識（機械検出不能） |
| 再発可能性 | 3/5 | 改番を伴う Case は高頻度ではないが発生時に機械検出不能 |
| 費用対効果 | 3/5 | スイープ対象の明記で低コスト |
| **加重合計** | **24/40** | |

- **推奨処分案**: promote — 区分5（既存対策の更新）
- **処分理由**: AG-005 完了条件「改名行を指す旧参照残存 0 件」と存在性検査が存在するが、prose 言及・意味論的判別がスイープ対象に明記されない（fix gap）

#### エントリ一覧
- REQ 行改番時の旧参照追随スイープが related_req と本文括弧書きの2層で漏れる事象とその検出契機 [inbox]（Issue 3459）


### LLM 直接評価（deferred 移動対象）

- 段階委任の並行重複実行を検知し、正規実行を特定して是正する手順 [inbox]（U1） — 区分6 deferred。8軸合計 25/40（影響4〔実害発生: 子 Issue 10件重複作成・Epic 本文上書き・ready→open 後退、回復済み。rubric「発生時の被害、手戻りの大きさ」に準拠して修正〕/横展3/明確4/自動3/再利用4/再発3/費用3）。intake item 2026-10-05-case-auto-double-dispatch-race.md が要件化経路に並行存在し、learning 側の昇華は重複管理になるため living pool で是正手順の経験知を保持
- GitHub Issue 本文を決定的エンジンへ手書き転写する経路の転写誤字リスクと書き込み前照合の効用 [inbox]（U5） — 区分6 deferred。20/40（影響2/横展2/明確4/自動2/再利用3/再発3/費用3）。単発・検出で回復済み
- main root での修正版テスト直接実行と非干渉契約の緊張 [inbox]（U6） — 区分6 deferred。21/40（影響2/横展3/明確4/自動2/再利用3/再発3/費用3）。実施形態の明記候補は checker 実行契約 Design だが単発
- extension rule の一時ファイル指示が workspace 外書込み guard と競合する [inbox]（U7） — 区分6 deferred。20/40（影響2/横展2/明確4/自動2/再利用3/再発3/費用3）。intake item extension-rule-tempfile-guidance-guard-conflict が並行存在
- 単独実行契約を持つ確認テストにフル実行前提のアサーションを入れると選択実行で失敗する [inbox]（U12） — 区分6 deferred。21/40（影響2/横展3/明確4/自動2/再利用3/再発3/費用3）。Jev problem-classification で C5 とは別単独と確定（テスト設計の問題）
- agentdev_gh の API rate limit（HTTP 403）は読取の gh CLI 切替で継続できるが切替記録が必要 [inbox]（U18） — 区分6 deferred。19/40（影響2/横展2/明確4/自動2/再利用2/再発3/費用3）。既存切替手順の適用事例で補遺価値
- spawnSync 既定 maxBuffer 1MB による大容量 stdout kill で script 報告が取りこぼされる [inbox]（U21） — 区分6 deferred。24/40（影響2〔予測ベース〕/横展3/明確4/自動4/再利用3/再発3/費用4）。実害未観測の設計観測
- git worktree list の区切り子と path.resolve の解釈差異で worktree 判定が偽陰性になる [inbox]（U22） — 区分6 deferred。24/40（影響2〔実装済み解消〕/横展3/明確4/自動4/再利用3/再発3/費用4）。共通ヘルパー化は将来課題
- check_integrity 既存 warning がゲート exit code に写像され判定ノイズになる設計観測 [inbox]（U23） — 区分6 deferred。21/40（影響2/横展2/明確4/自動3/再利用3/再発3/費用3）。baseline-aware 降格規約の設計候補
- 機械置換に伴う副次的な日本語整形は全体 regex でなく置換位置限定のマーカー方式で実装する [inbox]（U28） — 区分6 deferred。21/40（影響2/横展3/明確4/自動2/再利用3/再発3/費用3）。適用済み・規約化は委譲要件確認事項の候補
- Windows 既存 UTF-8/LF ファイルへの一括機械変更は write 規律で破損なしに完結した [inbox]（U29） — 区分6 deferred。22/40（影響2/横展3/明確4/自動2/再利用4/再発3/費用3）。既存 knowledge 文書 windows-powershell-bulk-io-corruption.md が本体をカバー、実績追記は軽微で次回同種実績蓄積時にまとめて判断

### duplicate 統合

- agentdev_gh の全操作が gh exit 66（stderr 空）で失敗し、OpenCode ホスト側の対処が再開条件になる [inbox] — duplicate（deferred 既存エントリ「agentdev_gh がハーネスプロセス内で gh exited with 66（無出力）で全系操作失敗」への4回目再発観測として追記統合）。Jev problem-classification で既存 deferred エントリへの追記統合と確定（前回 2026-09-27 の duplicate 統合の前例踏襲）。本エントリの予防策案（起動時疎通確認・failure detail への再開手順追記）は既存エントリの予防策候補と本質的重複し、新規の予防策・反映先を持たないため昇華新規性なしと判定
- **再評価記録**: 当該 deferred エントリの再評価条件「同種 gh spawn 故障の再発時」が今回の4回目再発で発火したため昇華要否を再検討した。本 inbox エントリ単独では新規性なし（上記）のため duplicate 統合を維持するが、4回再発かつ予防策（起動時疎通確認・再開手順の明示）が未実装のまま推移しているため、deferred 追記に「次回 learning-promote で当該 deferred エントリ自体の知識文書化（docs/knowledge 候補: agentdev_gh 障害の再開手順・疎通確認）を再評価する」旨を記録する。（当初本セクションに記載した「ホスト再起動による plugin 再初期化が実効した点」は inbox エントリの記録に存在しない叙述だったため、adversarial-review の指摘で削除した。inbox エントリは再起動を再開条件として提唱するのみで、実施・実効の記録はない）

## promote 時prune結果

- **対象エントリ数**: 30件（inbox 30件、deferred 152件は対象外）
- **prune実施**: 18件 — staged 17件（promote 11単位分の inbox エントリ。証拠は promoted/ 成果物11件の「元learning item / 根拠」セクションに保存済み）+ duplicate 1件（エントリ16。deferred.md 既存エントリ「agentdev_gh がハーネスプロセス内で gh exited with 66（無出力）で全系操作失敗」へ4回目再発観測を追記統合後に除去）
- **prune候補**: なし（rejected 判定 0 件のため）
- **prune却下**: なし
- **deferred 移動**: 12単位（C6、U1、U5、U6、U7、U12、U18、U21、U22、U23、U28、U29）を deferred.md へ移動（移動日 2026-10-07、処分判定フィールド付き）。deferred.md 見出し数 152 → 164

## 全体傾向

- **高頻出・高影響**: C5（29/40、3エントリ）と C2（28/40）が最高水準。検証 fail の実行形態依存と frontmatter 鮮度は Definition 変更を伴う全 Case で再発構造を持つ
- **横展開性が高い**: C2（4/5）・C5（4/5）。メタデータ鮮度管理とテスト実行形態管理は運用全般に通じる
- **自動化適性が高い**: C2・C5・U9・U10・U25・U30（4/5）。検証手順・契約検査の機械化余地が大きく、既存 check 資産（IR-072・traceability check・check_integrity）の適用範囲拡張で実現できるものが中心
- **観察所見**: 今回の inbox 30件は Case #3457〜#3501 の連続稼働（case-open/ready/run/close の反復）由来が中心。Definition 変更・traceability 宣言・検証実行形態・受入ゲートの4テーマが構造的再発を持つ。agentdev_gh 障害（gh exit 66）は4回目の再発で、既存 deferred エントリが中核知識として機能し重複統合で知識の分散を防止できた。処分区分は全 promote 単位が区分5（既存対策の更新）となり、既存 check・手順資産の適用漏れ・不備是正が今回の学びの主要パターン
- **Jev 先行評価の状況**: 6評価実施、うち5評価の観測書込成功。problem-classification 初回のみ観測永続化が digest 形式誤りで warning（評価自体は成功・fail-open 継続）

## Decision候補除外記録

- **対象item**: 全23判定単位（C1〜C7、U1/U3/U5/U6/U7/U9/U10/U12/U18/U21/U22/U23/U25/U28/U29/U30）+ duplicate 統合1
- **除外理由**: 技術判断不在（全単位共通）。手順・Design・規律・委譲要件の整備・適用漏れ是正が中心で、アーキテクチャ上の決定・技術選定・設計判断を含まない
- **根拠事実**: 各単位の予防策は既存契約・手順への文言補足・対象範囲明記・検査の前置であり、代替案間の技術的トレードオフを含まない
- **代替反映先候補**: 単位別の「反映先候補」（agentdev-traceability references、case-open/ready/close references、checker 実行契約 Design、行採番規律、artifact-contracts.md、委譲要件テンプレート、agentdev-git-worktree skill、case-close 機械工程手順等）。実現先の最終選択は req-define の変更影響分析が行う

## adversarial-review 反映記録

- **実施**: 2026-10-07（STEP-4、Jev adversarial-review-trigger 評価 true〔observation 20261006T153052Z-88b8〕により default-on 発動）。独立2 stream（判定整合性系・契約適合系）で初期 challenge → 統合 → counter-challenge → convergence → convergence audit 完了
- **採用した主な finding と反映**: deferred 件数実測訂正（190→152）、判定単位の算数・識別子表記修正（23+1=24、U1 ラベル付与）、影響度軸の rubric 準拠修正（U9 4→3〔27→26〕、U1 3→4〔24→25〕）、C6 反映先明確度 4→3（22→21）と再発可能性理由の補強、C2/C5 備考へのクラス統合基準の説明追記（U30/U12 分割との整合、エントリ14 原因未確定の明記）、duplicate セクションのソース不在叙述削除と再評価記録追記、処分判定基準の明示（実行概要）、表層修正3件（簡体字・依頼/依存・不要スペース）
- **限定合意（処分不変・STEP-6 MUST へ繰込み）**: promote 時prune結果欄の STEP-6 記載を必須手順化、採用済み成果物生成時の必須事項（反映先候補はフルパス記載、制約・受け入れ条件・推奨Issue分類の生成、元learning item セクションへの inbox エントリ相当の保存）、deferred 移動時に処分理由・軸合計を引き継ぐ
- **撤回・棄却した finding**: なし（全 finding が修正反映または限定合意で処理済み。処分構造〔promote 11 / deferred 12 / duplicate 1〕は全 finding の前後で不変）
- **再 review 発動判定**: 反映は記録精度・根拠明示化に限定され処分構造が不変のため、再発動条件（意味内容変更による新たな本質的争点）を満たさないと判定した
