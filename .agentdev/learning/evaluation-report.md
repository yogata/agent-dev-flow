# 評価レポート

## メタデータ
- **実行日時**: 2026/9/18 7:48:02
- **対象エントリ数**: 30件（inbox: 30件, deferred: 121件（候補突合対象））
- **問題クラス数**: 7 + 未分類15（計30エントリ）

## 問題クラス一覧

### 問題クラス1: worktree の外部依存パッケージ未伝播による bun test 環境依存 fail

- **根本原因**: git worktree は gitignore 対象の node_modules を継承しない。bun のモジュール解決は実行 cwd の node_modules を辿るため、依存前置なしの worktree では外部パッケージ（zod 等）が解決できない。
- **再発条件**: node_modules をリポジトリに持たず外部パッケージに依存するテストを、依存前置なしの worktree で実行した場合（新規 worktree で bun test 正規形を実行する全 case）。
- **予防策**: worktree 検証手順へ依存解決2手法（一回限り検証なら main 側 node_modules への junction 前置、繰り返し実行する worktree なら package 単位 bun install --frozen-lockfile）の選択基準を明記する。

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | inbox 2件（PR #2892、PR #2934） |
| 影響度 | 3/5 | 検証 stop するが junction / install で回避可能 |
| 横展開性 | 4/5 | worktree で bun test を実行する全 case |
| 反映先明確度 | 4/5 | agentdev-git-worktree references / agentdev-quality-gates QG-4 references と具体的 |
| 自動化適性 | 3/5 | worktree 作成時の依存整備は半自動化可能 |
| プロジェクト固有知識再利用性 | 4/5 | 本リポジトリの worktree 構造的制約に固有 |
| 再発可能性 | 5/5 | 新規 worktree で毎回潜在 |
| 費用対効果 | 4/5 | 手順追記のみで高頻度障害を削減 |
| **加重合計** | **29/40** | |

- **推奨処分案**: countermeasure-update（既存対策の更新）。agentdev-git-worktree「worktree 構造的制約」に依存解決2手法の選択基準が未整備（fix gap）。先行適用例 #2928（junction）、#2934（bun install）の両方が存在し選択基準の明文化のみが残る。

#### エントリ一覧
- 2026-09-16: node_modules 未伝播の worktree で bun test の zod 依存テストが fail する（junction 前置で回避）[inbox]
- 2026-09-17: worktree の bun test integrity suite で依存パッケージ未伝播 fail が発生し、2つの依存解決手法の選択基準が未明示 [inbox]

### 問題クラス2: Draft Definition PR の draft 解除経路不在（Tool カタログ・責務空白）

- **根本原因**: agentdev_gh 操作カタログが PR の draft→ready 遷移（pr_ready 等）を未カバーであり、case-open（Draft PR 作成）と case-ready（merge 責務）の間に draft 解除責務の割当が存在しない。
- **再発条件**: case-open が Draft Definition PR を作成し、draft 解除の正規手段が整備されない限り毎回発生（write-guard により raw CLI 迂回は契約違反で blocked 停止が正挙動）。
- **予防策**: (a) case-open での非 Draft PR 作成、(b) case-open または case-ready への draft 解除責務の定義、(c) agentdev_gh へ draft 解除操作の追加（write-guard 許可リスト同期含む）、のいずれかの整備。

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 3/5 | 同一事案の3側面（Case #2895） |
| 影響度 | 4/5 | stage blocked 停止・ユーザー手動介入必須 |
| 横展開性 | 3/5 | Draft PR を作成・merge する全 workflow 分割 |
| 反映先明確度 | 4/5 | 対応策3択と対象（Tool カタログ、workflow 定義）が具体的 |
| 自動化適性 | 4/5 | Tool カタログ追加で機械解消 |
| プロジェクト固有知識再利用性 | 4/5 | agentdev_gh・write-guard 構成に固有 |
| 再発可能性 | 4/5 | 整備されるまで構造的に再発 |
| 費用対効果 | 4/5 | Tool 操作追加は小規模で停止を解消 |
| **加重合計** | **30/40** | |

- **推奨処分案**: req-candidate（恒久契約候補（REQ））。Tool 操作契約（REQ-006/REQ-052 系）と Definition PR lifecycle（definition-readiness Design）の両面に影響する責務空白の解消要求。解決手段の選択は req-define の変更影響分析に委ねる。

#### エントリ一覧
- 2026-09-16: Draft Definition PR の draft 解除担当が case-open と case-ready の間で未定義のまま blocked 停止した [inbox]
- 2026-09-16: Custom Tool agentdev_gh に Draft PR の draft 解除操作が存在しない [inbox]
- 2026-09-16: agentdev-gh-write-guard 下では Tool カバレッジ外の GitHub side-effect に正規手段がなく raw CLI 迂回は契約違反になる [inbox]

### 問題クラス3: ハーネス guard によるプロジェクト外・一時領域書込みブロックと運用指針の不整合

- **根本原因**: project root 外パスへの書込みを fail-closed で拒否する guard 群（agentdev-textlint-guard、distribution-boundary-guard、配布依頼境界 pre-write gate）と、正規の作業経路（一時 worktree、AGENTS.md 推奨一時ディレクトリ）の間に運用指針の不整合がある。guard は設計どおり動作しているが、正規回避手段（node writeFileSync 明示 utf8、worktree 内配置、一時ファイル不要化）が文書化されていない。
- **再発条件**: write/edit ツールで project root 外（os.tmpdir 系一時ディレクトリ、project root 外 worktree）へ書込む場合に毎回発生。
- **予防策**: (1) AGENTS.md 一時ディレクトリ推奨への「write ツール不可、node writeFileSync 経由」注記、(2) worktree 配置先と worktree 内編集の標準手段の明記、(3) docs/knowledge 知識文書としての回避策集約。

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 3/5 | inbox 2件 + deferred 2件（L1004、L1889。guard 主体違いの同種事象） |
| 影響度 | 2/5 | 回避容易（node 経由・worktree 内配置）で軽微 |
| 横展開性 | 4/5 | 一時書込みを伴う全工程（横断依存検査、検証スクリプト） |
| 反映先明確度 | 4/5 | AGENTS.md、agentdev-git-worktree、docs/knowledge と具体的 |
| 自動化適性 | 3/5 | guard 設定の見直しは可能だが現行 fail-closed は意図設計 |
| プロジェクト固有知識再利用性 | 4/5 | Windows・ハーネス構成に固有の落とし穴 |
| 再発可能性 | 5/5 | 推奨パスを使い続ける限り毎回 |
| 費用対効果 | 3/5 | 文書化は低コスト、guard 変更は要設計判断 |
| **加重合計** | **28/40** | |

- **推奨処分案**: project-knowledge（区分4）。docs/knowledge/ の知識文書候補（Windows 系知識文書との隣接）。AGENTS.md 推奨記述と guard 契約の不整合解消を含む。deferred の distribution-boundary-guard 系2件（L1004、L1889）と統合して評価する価値がある。

#### エントリ一覧
- 2026-09-17: textlint guard が project root 外の temp worktree への edit/write を fail-closed ブロックする [inbox]
- 2026-09-17: write ツールによるプロジェクト外一時パスへの書込みが agentdev-textlint-guard に fail-closed ブロックされる（AGENTS.md 推奨一時ディレクトリとの不整合） [inbox]
- （関連 deferred: ハーネス Write ツールのリポジトリ外 temp 書き込みが distribution-boundary-guard でブロック / 配布ソース面パス列挙を含む補助ファイルの Write は配布依存境界 pre-write gate に fail-closed ブロック）

### 問題クラス4: agentdev_gh 本文更新操作の全文置換モデルと安全手順の不在

- **根本原因**: issue_update は渡した body 全文による全面置換である。元本文取得 → 最小差分変換 → 全文書き戻し → 再読込での全文前後比較、という安全手順が workflow・委譲プロンプトに明文化されておらず、要約版 body や全面再構成でセクション欠落・失敗を生む。
- **再発条件**: 元本文を再構築せず要約・部分版 body を渡す更新、部分更新指定なしで長文本文の更新を子 agent に委譲した場合。
- **予防策**: (1) Issue/PR 本文更新手順（元本文取得 → 最小差分 → 全文書戻し → 再読込全文比較）の規約化、(2) delegation prompt へ部分更新指定（precise old/new 行指定）と trackingState 等の Tool 管理フィールドは親適用の明記、(3) VERIFY での state 突合追加（deferred L2269 統合）。

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 3/5 | inbox 2件 + deferred 1件（L2269。state 変化の関連事象） |
| 影響度 | 4/5 | Issue 本文のセクション欠落・状態破壊（監査証跡の欠落） |
| 横展開性 | 4/5 | Issue/PR 本文を更新する全 workflow（issue、case-close、case-revise、epic-tracker） |
| 反映先明確度 | 5/5 | 手順が自足的に整備済み（元本文保持・最小差分・全文書戻し・再読込前後比較） |
| 自動化適性 | 3/5 | 手順規約化が主体 |
| プロジェクト固有知識再利用性 | 4/5 | agentdev_gh 操作モデルに固有 |
| 再発可能性 | 4/5 | 手順明文化まで委譲・更新のたびに潜在 |
| 費用対効果 | 4/5 | 手順追記のみで重大事故を予防 |
| **加重合計** | **31/40** | |

- **推奨処分案**: countermeasure-update（区分5）。agentdev-issue-management「Issue 更新時の前後内容比較」は既存だが、全文置換の操作モデルと最小差分手順・再読込全文比較の記述が不足（fix gap）。エントリ自身が「promote 側で重複統合を要する」と指摘。

#### エントリ一覧
- 2026-09-17: 子 agent による長文 Issue 本文更新は部分更新指定か親回復で行う（trackingState 適用は親または正規機構） [inbox]
- 2026-09-17: case-close の Issue 本文更新で要約版 body を書き込み元セクションを欠落させ、再読込の事後確認で検知し復元した [inbox]
- （関連 deferred: body 更新のみの issue_update 後に Issue state が closed へ変化した）

### 問題クラス5: ADF-COVERS 宣言付与の責務・確認工程の不在

- **根本原因**: ADF-COVERS(implementation) 宣言付与は case-run トレーサビリティ契約上の実行担当の標準責務であるが、(1) 委譲プロンプトの抑制文言が宣言をためらわせる形で書かれ、(2) case-open / case-ready の Definition 品質検査に artifact_actions 宣言成果物の ADF-COVERS 宣言存在確認が組込まれていない。新規 REQ CREATE と REQ 行 APPEND で宣言対象の範囲が異なる点も未整備。
- **再発条件**: 対応宣言を明示的義務として書かない case-run 委譲プロンプト、宣言付与チェックなしの Definition PR merge。
- **予防策**: (1) case-run delegation 指針へ「実際に実装する REQ 行への宣言付与は標準責務（inventing 抑制は実際に実装しない行を宣言しない限定）」の正の明記、(2) case-open / case-ready の Definition 品質検査へ宣言存在確認の組込み。

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 3/5 | inbox 2件 + deferred 1件（L1771。req-save 系の同一課題） |
| 影響度 | 4/5 | traceability check 差し戻し（DEL follow-up）と補完コスト |
| 横展開性 | 3/5 | REQ 実装を伴う全 case・新規 REQ CREATE を含む Definition PR |
| 反映先明確度 | 4/5 | delegation 指針・品質検査の検証対象と具体的 |
| 自動化適性 | 3/5 | 品質検査への組込みは半自動 |
| プロジェクト固有知識再利用性 | 4/5 | ADF のトレーサビリティ契約に固有 |
| 再発可能性 | 5/5 | 委譲プロンプトに書かれない限り毎回 |
| 費用対効果 | 4/5 | 指針追記と検査項目追加で差し戻し削減 |
| **加重合計** | **30/40** | |

- **推奨処分案**: req-candidate（恒久契約候補（REQ））。Definition 品質検査（case-open / case-ready の実行契約、REQ-030/REQ-061 系）への検証対象追加という要件変更の要因。deferred L1771（宣言網羅性 deferred 2026-09-01 との統合再評価待ち）を吸収する形で昇華する。

#### エントリ一覧
- 2026-09-17: ADF-COVERS(implementation) 宣言付与は case-run 実行担当の標準責務（親の過度な抑制指示が差し戻しを生む） [inbox]
- 2026-09-17: 新規 REQ CREATE を含む Definition PR で ADF-COVERS(implementation) 宣言付与責務が未定義のまま merge され case-run の traceability check で補完した [inbox]
- （関連 deferred: req-saveでREQ行を是正した場合のADF-COVERS implementation宣言確認）

### 問題クラス6: AUTOGEN ブロックの陳腐化（日付依存・再生成運用の欠如）

- **根本原因**: AUTOGEN ブロック（req-health-metrics 計測例等）が生成時の日付刻印を持ち、内容不変でも日付境界や REQ 行変動で突合不一致（IR-061、index-generation-consistency）になる構造であり、再生成の標準工程と生成器の据え置き仕様が未整備。付帯: SKILL.md description の 600 字上限超過（agentdev-workflow-case-ready 743 chars、case-revise 663 chars）は本文更新 Case での同時短縮運用がなく恒常 NG として残存。
- **再発条件**: 計測日跨ぎの check_integrity 実行、REQ 行数変動を伴う Case の case-close、generate_indexes 再生成を伴わない運用、description 制約に触れる SKILL.md 本文更新。
- **予防策**: (a) 生成内容不変時の計測日据え置き仕様、または case-close docs 検証での AUTOGEN 再生成標準工程化、(b) date rollover 起因の差分報告差別化、(c) description 一括短縮の別 Case 化。

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 3/5 | inbox 2件 + deferred 2件（L1436、L1140） |
| 影響度 | 3/5 | case-close 差戻し・check_integrity NG の恒常再発 |
| 横展開性 | 3/5 | AUTOGEN ブロックと docs 正典文言期待テスト全般 |
| 反映先明確度 | 4/5 | 生成器仕様・case-close/case-run 手順・integrity 運用と具体的 |
| 自動化適性 | 4/5 | 再生成の標準工程化・生成器仕様変更は自動化可能 |
| プロジェクト固有知識再利用性 | 3/5 | 本リポジトリの AUTOGEN 構成に固有 |
| 再発可能性 | 5/5 | 日付跨ぎで誰の変更でもなく発火 |
| 費用対効果 | 4/5 | 生成器・手順の整備で恒常 NG を解消 |
| **加重合計** | **29/40** | |

- **推奨処分案**: design-candidate（恒久契約候補（Design））。index-auto-generation Design・autogen-freshness-gate Design・case-close docs 検証手順の更新候補。deferred L1436（date rollover 報告差別化）・L1140（case-run 前置 gate 案、living pool 最優先再評価候補）を統合して昇華する。

#### エントリ一覧
- 2026-09-17: req-health-metrics.md の AUTOGEN 計測日鮮度 NG は日付依存で再発する（内容不変でも日付だけで NG 化） [inbox]
- 2026-09-18: lint-skills description 長 NG 2件と check_integrity AUTOGEN 滞留は main で恒常再現する pre-existing として棚卸し記録した [inbox]
- （関連 deferred: AUTOGEN 鮮度 gate の計測日ブロックは日付境界で誰の変更でもなく発火する / Phase 0 起因の AUTOGEN 陳腐化は case-close の dry-run ゲートで差戻しになる）

### 問題クラス7: bun test フルスイート fail の由来分類証跡運用

- **根本原因**: 大規模スイート実行時の環境起因 fail（並列負荷タイムアウト、junction 伝播環境差）の由来分類に、証跡取得（単独再実行 + フル再実行、baseline 再現確認、環境ラベル）と main root / worktree 環境差の明示手順が QG-4 references に未整備。
- **再発条件**: フルスイート実行の負荷環境が重なった場合、main root と worktree の環境差がある実行・merge 後検証。
- **予防策**: QG-4 references へ (1) 再実行証跡による由来分類手順、(2) main root 実行時の環境ラベル・環境差明示、(3) baseline 再現確認（detached checkout・読取専用 filter 実行）手順の追記。

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | inbox 2件（Case #2898、#2904） |
| 影響度 | 3/5 | 機械受理基準充足のための証跡取得コスト |
| 横展開性 | 3/5 | bun test 正規形を実行する全 case・merge 後検証 |
| 反映先明確度 | 4/5 | agentdev-quality-gates qg-4-final-acceptance.md の環境ラベル・fail 由来分類節 |
| 自動化適性 | 3/5 | 証跡退避・分類記録の様式化 |
| プロジェクト固有知識再利用性 | 4/5 | QG-4 正規形・junction 構成に固有 |
| 再発可能性 | 4/5 | フルスイート実行の負荷・環境差が重なる場合 |
| 費用対効果 | 3/5 | 手順追記で判定コスト削減 |
| **加重合計** | **26/40** | |

- **推奨処分案**: countermeasure-update（区分5）。QG-4 機械受理基準の fail 由来分類は既存契約だが、環境差（main root vs worktree）の明示と baseline 再現確認手順が不在（fix gap / application miss）。deferred L2204（直前実績比較の制約）と関連。

#### エントリ一覧
- 2026-09-17: bun test フルスイート初回実行のタイムアウト系 flaky は単独再実行とフル再実行の証跡で由来分類する [inbox]
- 2026-09-17: main root での integrity suite 実行は junction 環境特有 fail を生み、merge 判定は worktree 実行と baseline 再現確認の組み合わせで由来分類する運用が必要 [inbox]

## 未分類（15エントリ）の処分方針

| エントリ | 処分 | 根拠 |
|---|---|---|
| 2026-09-17: agentdev_gh issue_list が大規模リポジトリで safety page limit に到達 | countermeasure-update（promote） | 2900+ Issue 規模で冪等検出が Tool 経由で完結しない。REQ-011 の読取系 gh CLI fallback は既存契約だが、issue-management 検索安全手順への「大規模リポジトリは state=open 絞り込み gh CLI 第一手段」追記がギャップ（fix gap）。影響大・再発確実 |
| 2026-09-17: case-close 全 corpus check で main 側解消行が新規 missing に誤解釈 | deferred | 出現1件。worktree vs main 差分行の分岐後 main 解消確認手順の候補。並行セッションで main が進む case-close でのみ再発 |
| 2026-09-16: os.tmpdir() 横断走査が並列残渣を誤検出 | deferred | 出現1件。mkdtempSync 隔離は PR #2885 で適用済み・解消確認済み |
| 2026-09-16: TEMP 残存 trust-archive-verify 残渣の観察 | deferred | 情報断片（記録のみ）。checker 本体の残渣管理は別候補 |
| 2026-09-16: docs_chore REQ 行 APPEND で missing-verification が必ず残る | deferred | 出現1件。verification-scope-catalog は policy.yaml 移行済みで反映先が現行契約と異なるため、移行後の実態ベースで再評価要 |
| 2026-09-16: REQ/Design 内容変更時 frontmatter updated 必須セット | deferred | 出現1件。targeted docs guard への鮮度検査追加は別 Case 検討候補 |
| 2026-09-16: REQ 行本文と Design/カタログの粒度差は正典 verbatim 原則で意図的 | deferred | 出現1件。判断基準の知見（現行維持記録）。inspect 系観点整備の低優先候補 |
| 2026-09-16: 同種突合規定群への追記時は優先順位の非明示が残り得る | deferred | 出現1件。追跡Issue 化運用の判断材料 |
| 2026-09-17: Design accepted 昇格時の対応記録は同一 PR で保存 | deferred | 既存 Design lifecycle 契約・QG-4 どおりの運用確認記録。追加の恒久契約不要 |
| 2026-09-18: BASELINE_CATEGORIES に producer-metadata 欠落 | deferred | baseline 仕様は Wave 2-3 の所有範囲。設計判断待ち（記録のみ、顕在化なし） |
| 2026-09-18: fixture に実在しない REQ ID は corpus 検査で不合格 | deferred | 出現1件。テスト fixture 規約候補。実在 ID への修正で解消済み |
| 2026-09-18: Definition 変更で既存テスト期待文言が陳腐化 | deferred | 出現1件。REQ-019 影響範囲検出 gate の適用範囲確認候補 |
| 2026-09-18: 同一 Wave 並列 Issue 間の fixture・API 依存 | deferred | 出現1件。PR 本文明記の暫定運用で対応済み。case-open 構成検証への観点追加は設計判断要 |
| 2026-09-18: 検証対応要否カタログの欠番行 28 件 | deferred | 出現1件。policy.yaml 移行時の安全側除外で棚卸し完了。登録物追随チェックの docs-check 観点候補 |
| 2026-09-18: verification 同一論理関係は inline 既存宣言への集約を優先 | countermeasure-update（promote） | 出現1件だが、duplicate-inconsistencies 発火による差し戻しを回避する明確な判断規則（inline 既存があれば inline 追記、sidecar のみなら sidecar）であり、agentdev-traceability 運用知識への低コスト追記で再発性が高い |

## promote 時prune結果

- **対象エントリ数**: 30件
- **prune実施**: あり（promote 9件分の staged エントリ、deferred 移動後に inbox 由来分を prune。deferred 既存の関連4件（L1004、L1436、L1140、L1771）は統合先クラスの根拠として評価に反映済みだが、今回の移動対象外のため living pool 残存とする。次回 promote で統合除去を再評価）
- **prune候補**: 15件（問題クラス1〜7の inbox 15エントリ中、promote 採用済み成果物の元エントリ。証拠は各成果物の「元learning item / 根拠」セクションへ保存）
- **prune却下**: 0件

## 全体傾向

- 高頻出・高影響の問題クラス: 問題クラス4（本文更新、31/40）、問題クラス2・5（30/40）。agentdev_gh 操作モデルとトレーサビリティ宣言運用に集中。
- 横展開性が高い問題クラス: 問題クラス3（guard と一時領域、4/5）、問題クラス1・4（worktree・本文更新、4/5）。
- 自動化適性が高い問題クラス: 問題クラス6（AUTOGEN 再生成、4/5）、問題クラス2（Tool カタログ追加、4/5）。
- 全体的な観察所見: 2026-09-16〜09-18 の case-run/case-close 密集期間の学びが中心。agentdev_gh 操作カタログの網羅性（draft 解除、大規模リポジトリ検索）と手順の明文化不足（本文更新、宣言付与、依存解決、由来分類）が主要テーマ。guard・worktree 系は既存知見（deferred）との統合価値がある。

## Decision候補除外記録

- **対象item**: 全問題クラス（1〜7）および未分類 promote 2件
- **除外理由**: 運用ルール（全項目該当）。いずれも作業手順・規約・Tool カタログ・検証手順の整備が主体であり、アーキテクチャ上の設計判断・技術選定を新規に記録する内容を含まない。
- **根拠事実**: 各クラスの予防策は既存契約（skill references、Design、Tool 操作契約）への追記・組込みで完結する。選択肢の評価（例: 問題クラス2の3択）は req-define の変更影響分析の責務。
- **代替反映先候補**: 問題クラス1/4/7・未分類2件 → 配布skill references（agentdev-git-worktree、agentdev-issue-management、agentdev-quality-gates、agentdev-traceability）。問題クラス2/5 → REQ-006/REQ-052/REQ-030/REQ-061 系・definition-readiness Design。問題クラス3 → AGENTS.md・docs/knowledge/。問題クラス6 → index-auto-generation Design・autogen-freshness-gate Design・case-close references。

## 判定サマリ

- **promote**: 9件（問題クラス1〜7の7クラスタ + 未分類2件）
- **deferred**: 13件（未分類13エントリ）
- **rejected**: 0件
- **duplicate**: 0件（deferred 既存4件は問題クラス3/5/6の統合根拠として評価に反映。inbox エントリが既存成果物で過不足なくカバー済みとは判定されないため duplicate 不成立）

## 自律確定記録（STEP-5）

- **自律確定項目**: 全9 promote 判定、全13 deferred 判定
- **主要根拠**: (1) 7クラスタは出現2件以上かつ根本原因 + 再発条件 + 予防策の一致で問題クラス分類基準を充足、(2) 8軸評価スコア 26〜31/40 と promote しない根拠（情報断片・出現1件・適用済み解消・設計判断待ち）との区別が明確、(3) 未分類2件の promote は既存契約への追記ギャップ（fix gap）と高再発性で一意、(4) 実現先の選択は反映先候補として req-define に委ねており新規の対象範囲決定を含まない
- **HITL 不要理由**: 横断契約Design「promote系判断確定とHITL境界」判定表の自律確定可能要件1〜8を充足（要件7は adversarial-review 実施後に確定）。HITL移送条件1〜8のいずれにも該当しない。単純な形式的最終確認を理由とするHITL移送は禁止される

## adversarial-review 結果（STEP-4、2026-09-18 実施）

対論型レビュー（2系統独立論理 stream: A=分類・突合系 / B=評価・判定表適用系、challenge → counter-challenge → convergence → convergence audit の4段階）を実施した。

### 結論

- **処分判定（promote 9 / deferred 13 / rejected 0 / duplicate 0）は維持**。accepted findings はすべて記録精度・統合根拠網羅性の是正であり、処分区分を反転させない。
- **unresolved 残存なし**。自律確定可能要件7（対論型レビュー後の未解決本質的争点なし）を充足し、STEP-5 の自律確定根拠が確定した。

### accepted findings（本レポートへの反映内容）

| id | 重大度 | 内容と反映 |
|---|---|---|
| A-1 | MINOR | メタデータ「deferred: 121件」は誤カウント。エントリ実数は **117件**（`## ` 見出し総数121のうち4つはフォーマット説明見出し〔L6/L10/L30/L39〕） |
| A-2 | MODERATE | 問題クラス3 の統合根拠に deferred **L1364**（配布依存境界 guard が src 参照を含む一時検証ドライバの TEMP 書出しも block する事象）が欠落していた。guard による一時領域書込みブロックの同種事象として統合評価対象に含める（発生件数は実質5件、発生件数スコア 3/5→4/5 の可能性、加重合計 28→29。処分区分 project-knowledge は不変）→ 成果物「project-knowledge-external-write-guard-rules.md」の既存対策確認・根拠に反映 |
| A-5 | MINOR-MODERATE | 問題クラス6 の「付帯」記録（SKILL.md description 600字上限超過）は AUTOGEN 陳腐化と根本原因が異なり、問題クラス分類基準から逸脱する。分離した場合は未分類 promote 判定対象になり得る（fix gap + 高再発性）。処分判定は不変だが、成果物側に description 長を独立の改善要求候補として明示的に記録する |
| B-2 | MODERATE | 問題クラス7 の「環境差の明示と baseline 再現確認手順が不在」という主張は不正確。qg-4-final-acceptance.md に環境ラベル節（L286-289、実行環境=main root/worktree を含む3要素）・fail 由来分類節（L295-298）・pre-existing fail の baseline 再現確認記録基準（L322）は既存。不在なのは「detached checkout・読取専用 filter 実行」という具体手順の明文化のみ → 成果物のギャップ詳細を「既存節への具体手順追記」に精緻化 |
| B-3 | MINOR | 問題クラス4 の「再読込全文比較の記述が不足」という主張は不正確。issue-operation-safety.md L80-89 に元本文スナップショット・再読込前後比較（セクション欠落確認含む）は既存。不足は「issue_update が全文置換である操作モデルの明示」「最小差分行編集手順の新規記述」「delegation prompt への部分更新指定組込み」→ 成果物のギャップ詳細を精緻化 |
| B-4 | — | 自律確定可能要件1〜6・8は証拠レベルで充足、要件7は本審議の unresolved なしにより充足。HITL移送条件1〜8いずれも非該当 |

### rejected findings（審議で棄却）

- A-3（duplicate 判定関連）: deferred は恒久契約ではなく再発継続の証拠。duplicate 不成立のまま妥当
- A-4（クラス2 の3側面集約）: 分類基準は抽象レベルで共通、write-guard 挙動は再発条件に組み込まれ透過的。集約は妥当
- A-6（未分類13の deferred と promote 2の一意性）: 個別根拠が記載済みで境界事例も条件付き再発性の記録で整合
- B-1（8軸加重合計の計算誤り疑い）: 7クラス全検算の結果 29/30/28/31/30/29/26 はすべて正しい（A-2 の L1364 加算を除く）
