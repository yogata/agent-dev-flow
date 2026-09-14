# 評価レポート

## メタデータ

- **実行日時**: 2026-09-15 06:56
- **対象エントリ数**: 21件（inbox: 21件、deferred: 候補読込 直近20件 + タグ一致群）
- **問題クラス数**: 4（未分類 7件含む）
- **実行前同期**: git pull --ff-only 実施済み（orchestrator による STEP-0、Already up to date）

## STEP-1 記録（入力読込・正規化）

- inbox.md: 21エントリを読込。大部分は軽量形式（観測元/内容 [+関連/タグ]）、E-07・E-21 は13項目完全形式。正規化は解析時のみ適用（内容→問題事象、観測元→発生局面/関連に読替、欠落フィールドは空扱い・推測補完なし）。元ファイル不変。
- deferred.md: `^## ` 見出し全件とタグ行のインデックススキャン（grep on read、分離インデックス不作成）。候補選択（過剰包含フィルタ）: タグ1件一致 / 見出しトークン一致 / 直近20エントリ。候補本文読込: worktree・bun-test 依存系（pool 1412 他）、traceability・ADF-COVERS 系（pool 1750/1762/1771/1783）、concrete-id 系（pool 1700/1792）。
- 全面読みフォールバック: 判定曖昧エントリ（E-02/E-05/E-09/E-11/E-12/E-13/E-17）は見出し全件レビュー + 該当群本文読込で突合。duplicate 判定は deferred pool ではなく正規成果物（docs/knowledge/、配布 skill references）との照合で確定したため、deferred.md 全面本文読みは不要と判断した。

## 問題クラス一覧

### 問題クラス1: Windows + bun での checker CLI stdout 損失・破損に対する安定実行経路の例外補完

- **根本原因**: Windows + bun 環境で checker CLI を bun 直実行した際、process.exit による stdout flush 前終了、または CLI 経由 `--json` 出力の末尾破損が発生し、機械可読証跡が失われる・破損する。既存知識は「モジュール import 経路を標準、CLI 経由は flush 保証終了を例外」と定めるが、Bun.YAML 依存 checker は node import 経路を使えず、例外経路の具体手が未整備。
- **再発条件**: Bun.YAML 依存 checker、または CLI 経由で `--json` 出力を取得する checker を Windows + bun で実行する場合。
- **予防策**: Bun.write(Bun.stdout) による flush 保証ラッパー（一時ファイル → flush → 実行後削除）を例外経路手順として知識文書へ明記する。JSON 途中破損時は human readable 出力 + node 単独実行への切替を記録する。

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | E-08、E-14 の2件 |
| 影響度 | 3/5 | 検証証跡の消失・検証再実行コスト。対処すれば case-close 停止には至らない |
| 横展開性 | 4/5 | Windows + bun（当リポジトリ標準環境）の checker CLI 実行全般 |
| 反映先明確度 | 5/5 | 対象知識文書・追記内容がエントリ本文で自足的に特定済み（E-08 が「既存知識文書に明記されていない」と未記載箇所を明示） |
| 自動化適性 | 3/5 | ラッパー手順は半機械化。実行経路の選択判断は残る |
| プロジェクト固有知識再利用性 | 5/5 | 環境固有の実行経路知識。checker 実行契約と直結 |
| 再発可能性 | 5/5 | Bun.YAML 依存 checker・CLI 実行は今後の検証で標準的に発生する経路 |
| 費用対効果 | 4/5 | 既存知識文書への追記は低コスト。証跡喪失の再実行コスト削減効果は大 |
| **加重合計** | **31/40** | |

- **推奨処分案**: 処分区分5「既存対策の更新」。docs/knowledge/checker-cli-stdout-loss-on-windows-bun.md の例外経路追記（fix gap）、checker 実行契約 Design「安定実行経路」の補完候補。採用済み成果物 `promoted/update-checker-stdout-flush-workarounds.md` として staged。

#### エントリ一覧

- 2026-09-14 case 2805 Wave 1 / case 2812（PR #2812）: Bun.YAML 依存 checker の stdout flush 保証ラッパー [inbox]
- 2026-09-14 case 2805 OU-004（PR #2817）: check_integrity の --json 出力は bun CLI 経由・Windows で末尾破損することがある [inbox]

### 問題クラス2: traceability 完了判定の横断 durable state 前提（宣言ブロック確認・main 側カタログ新鮮性）

- **根本原因**: case-close QG-4 の traceability 完了判定は、Design ヘッダの ADF-COVERS(implementation) 宣言と検証対応要否カタログという横断 durable state に依存する。design-save で Design 本体へ要件反映した際の既存宣言ブロック確認を欠くと missing-implementation fail になり、また `--root` を PR HEAD worktree に向けた check は分岐後に main へ commit されたカタログ登録を参照できず unclassified 誤判定となる。
- **再発条件**: design-save で Design 本体へ要件反映するケース、および ブランチ分岐後に main 側でカタログ登録・宣言更新が commit された後に QG-4 traceability check を実行するケース。
- **予防策**: design-save 工程で当該 Design ヘッダの既存宣言ブロック更新を確認対象に含める。worktree root 起点で unclassified 判定が出た場合は main 側 root で再実行し、カタログ登録 commit の時系列（ブランチ分岐の前後）を確認してから完了阻止を判断する。

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | E-05、E-09 の2件 |
| 影響度 | 4/5 | case-close QG-4 でのマージ停止（完了阻止）に直結 |
| 横展開性 | 3/5 | QG-4 traceability 実行・design-save で Design 反映するケース全般 |
| 反映先明確度 | 4/5 | 対処手順が具体的（宣言ブロック確認、main 側再実行 + 時系列確認）。反映先候補は複数（quality-gates / case-close / design-file-manager） |
| 自動化適性 | 3/5 | main 側再実行・時系列確認は手順化可能。判定自体は半自動 |
| プロジェクト固有知識再利用性 | 4/5 | 検証対応要否カタログ・worktree 構造に依存する固有知見 |
| 再発可能性 | 4/5 | mid-Epic 運用では分岐後 main 更新が日常的に発生 |
| 費用対効果 | 4/5 | 手順注記レベルの更新でマージ停止の手戻りを防止 |
| **加重合計** | **28/40** | |

- **推奨処分案**: 処分区分5「既存対策の更新」。worktree-operations.md は checker skip・読取専用実行を扱うがカタログ新鮮性・宣言確認は未カバー（fix gap / application miss）。採用済み成果物 `promoted/update-traceability-cross-state-qg4.md` として staged。

#### エントリ一覧

- 2026-09-14 case 2800（PR #2804）: 検証対応任意行の要件でも implementation 宣言欠落は QG-4 で差し戻しになる [inbox]
- 2026-09-14 case 2805 Wave 1 / case 2812（PR #2812）: PR HEAD worktree root でのトレーサビリティ check は main 側カタログ更新を反映しない [inbox]

### 問題クラス3: 検証 fail 由来分類の前提確認（対照 baseline の健全性・横断検査の専属性）

- **根本原因**: 検証 fail の由来分類において、対照実行の前提（main root baseline が mid-Epic の stale 状態でないか）と検査対象の専属性（integrity suite が別 OU 専属成果物を横断検査する構成）を確認せず fail を本変更起因と扱うと、誤った差し戻し・完了阻止が発生する。
- **再発条件**: Epic 進行中に main root 対照実行を行う場合、および配布物削除 Case で別 OU 専属の `.agentdev/extensions/**` 等を横断検査する integrity suite を実行する場合。
- **予防策**: 由来分類時に検証前提を確認する。(a) 対照実行の baseline（main root）は mid-Epic で stale（manifest 未反映・stale junction）になり得るため絶対視せず、環境起因疑いの fail には PR HEAD での pass 結果を根拠として併記する。(b) 横断検査 fail は本変更起因ではなく後続 OU 専属の計画的依存として分類する（Epic Wave の専属割当を確認）。

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | E-15、E-16 の2件 |
| 影響度 | 3/5 | 誤差し戻し・完了阻止の誤判断リスク。実害は判定のやり直し |
| 横展開性 | 4/5 | 検証 fail 由来分類を行う場面全般（QG-4、対照実行） |
| 反映先明確度 | 4/5 | 既存知識文書（対照実行節）への追記内容が具体化済み |
| 自動化適性 | 2/5 | 判断知識（前提確認・根拠併記）。機械化は困難 |
| プロジェクト固有知識再利用性 | 4/5 | mid-Epic 運用・OU 専属割当という固有構造に依存する知見 |
| 再発可能性 | 4/5 | Epic 並行運用・削除系 Case は反復的に発生 |
| 費用対効果 | 4/5 | 既存知識への前提確認追記は低コスト |
| **加重合計** | **27/40** | |

- **推奨処分案**: 処分区分5「既存対策の更新」。docs/knowledge/windows-bun-test-spawn-timeout-classification.md（対照実行節）の前提確認拡張（fix gap）。採用済み成果物 `promoted/update-fail-origin-classification-preconditions.md` として staged。

#### エントリ一覧

- 2026-09-14 case 2805 OU-004（PR #2817）: main root 対照実行は mid-Epic の stale 状態で環境特有 fail を出す。由来分類には PR HEAD での pass 確認を併記する [inbox]
- 2026-09-14 case 2805 OU-005（PR #2818）: 配布物削除 Case では integrity suite の fail 由来分類に extensions 横断検査を織り込む [inbox]

### 問題クラス4: 委譲結果受領の契約完了検査缺失（4-state result・commit・PR の最終ゲート）

- **根本原因**: 実行担当サブエージェントへの委譲において、(a) background task 起動が起動直後に消失しても通知されず、(b) 委譲先が実装・検証の要約のみを返し契約上必要な commit・PR 作成と4状態結果を返さないことがあり、受領側が契約完了検査（4-state result・commit hash・PR URL の3点）を行わないと未達のまま後続工程へ進めない・誤って進むリスクが生じる。
- **再発条件**: run_in_background=true の委譲起動、および委譲先の応答が要約で終わり result 契約を返さない場合。受領側で3点検査を行わない場合。
- **予防策**: 委譲結果の最終ゲートとして commit hash・PR URL・4-state result の3点を必須検査し、不足時は要約で終了せず再開する guard を設ける。background 委譲の消失を検知したら durable state（worktree git status・PR・Issue コメント）で帰属確認し、未試行なら同期実行で再委譲する回復手順を明文化する。

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | E-06、E-18 の2件 |
| 影響度 | 4/5 | Case の実行・完了が停滞（再開セッションでの手動回復が必要になった実績） |
| 横展開性 | 3/5 | サブエージェント委譲を実行する case-run / case-auto 全般 |
| 反映先明確度 | 4/5 | 3点検査 guard・回復手順が具体的。反映先候補は adapter skill / case-run / 委譲契約 Design |
| 自動化適性 | 3/5 | 3点検査は機械的チェックとして組み込み可能 |
| プロジェクト固有知識再利用性 | 3/5 | result 4状態契約・adapter protocol という固有構造に依存 |
| 再発可能性 | 4/5 | harness background 機構の異常・委譲先の契約不履行は制御外で再発し得る |
| 費用対効果 | 4/5 | 受領側検査の追加で停滞・手動回復コストを削減 |
| **加重合計** | **27/40** | |

- **推奨処分案**: 処分区分5「既存対策の更新」。adapter skill・result 4状態契約は存在するが受領側完了検査 guard・消失時回復手順は未整備（guardrail insufficiency）。採用済み成果物 `promoted/update-delegation-result-contract-guard.md` として staged。

#### エントリ一覧

- 2026-09-14 case 2796/2799/2800: background task 起動の連続消失と同期実行への切替 [inbox]
- 2026-09-15 case 2805 OU-006（PR #2819）: 初回委譲応答が4状態契約を完了せずに要約で終了した [inbox]

### 未分類（単独エントリ → deferred living pool）

| entry | 主題 | 暫定処置と根拠 |
|---|---|---|
| E-01 | worktree で full check_integrity を実行する際の repo-local Plugin 投影前提（junction + loader shim 一時構成） | deferred（出現1件。worktree-operations.md は scripts node_modules junction を扱うが `.opencode/plugins` 投影の一時構成手順は未整備。再発時に具体化して再評価） |
| E-03 | bun test フル suite の直前実績比較の制約（main 側書込み回避で base 比較未実施になり得る） | deferred（出現1件。読取専用 detached worktree 実行等の代替手段は候補止まり） |
| E-04 | repo-agentdev-integrity 検査スクリプトの実行ランナーは bun（CommonJS require() のため node import 経路不可） | deferred（出現1件。checker 実行契約の適用範囲の事実記録。REQ 化に至る具体性不足） |
| E-07 | サブエージェント bash の Windows パス結合不具合による repo root 迷子ファイル作成 | deferred（出現1件。予防策候補（正区切りパス明示・commit 前 git status 確認）は有効だが単発では昇華の具体性不足。委譲プロンプト規約への反映は再発時に再評価） |
| E-19 | worktree 内並行書き込みの検知と明示パス・ステージ確認の対処 | deferred（出現1件。adapter protocol 側の早期断念基準明文化は候補止まり） |
| E-20 | squash merge 済み分支の再利用は fast-forward 不能になる | deferred（出現1件。分支削除運用・fast-forward 可否確認は候補止まり） |
| E-21 | body 更新のみの issue_update 後に Issue state が closed へ変化した（根本原因未特定） | deferred（出現1件・原因未特定。issue-management の VERIFY へ state 突合追加は再発時に再評価する再評価対象） |

## duplicate 判定（既存対策でカバー済み）

| entry | 主題 | カバーする既存成果物（確認済み） |
|---|---|---|
| E-02 | Design 節文言の配布物転記時の concrete-id 違反（一般形翻訳） | docs/knowledge/distribution-concrete-id-placement.md（2026-09-13 作成。本文は概念名参照・具体 ID は ADF-COVERS 宣言位置へ集約、ID ファミリー制限を規定。E-02 の「一般形（IR-{NNN}）へ翻訳」は同知識の適用） |
| E-10 | Integrity suite・textlint final gate の Windows 環境依存失敗と timeout | docs/knowledge/windows-bun-test-spawn-timeout-classification.md（spawn timeout 由来分類・timeout 拡張単独再実行・main HEAD 対照実行・環境由来記録要件を規定。IR-055/NG21 の 5 秒 timeout JSON EOF を明示カバー。zod 依存解決は QG-4 依存パッケージ前置がカバー） |
| E-11 | 配布物 prose 内 REQ 行引用は ADF-COVERS 宣言行へ集約する | docs/knowledge/distribution-concrete-id-placement.md（規定1・2が同一内容。prose の braced 形式（REQ-{NNN}）表現も概念名参照の機械的表現として同知識の範囲） |
| E-12 | worktree での bun test 実行に必要な node_modules 事前整備 | .opencode/skills/agentdev-git-worktree/references/worktree-operations.md「bun test 実行の環境前提」（node_modules 未伝播・依存整備前置・junction 代替（作成→検証→削除）・worktree 内 bun install を規定）+ QG-4 依存パッケージ前置 |
| E-13 | worktree の bun test 依存整備は .opencode/skills 側 bun install で完結する | .opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md L245-252（`bun install --cwd src/opencode/skills/agentdev-project-extensions/scripts` + `bun install --cwd .opencode/skills/repo-agentdev-integrity/scripts` の2ディレクトリ前置を正規形として明記。E-13 の内容と完全一致） |
| E-17 | junction 未伝播環境の link profile は main root 読取専用 runner で代替測定する | worktree-operations.md「bun test 実行の環境前提」（メインリポジトリからの読取専用実行によるエビデンス採取・環境ラベル・fail 全件の由来分類を規定。traceability CLI の repoRoot 位置引数は agentdev-traceability SKILL の argv 契約に記載） |
| pool 1412 | worktree 環境の bun test 依存解決不能は bun install --cwd で worktree ローカル解消できる（2026-09-01 移動） | qg-4-final-acceptance.md L245-252 の依存パッケージ前置 + worktree-operations.md の bun install/junction 代替が同内容を配布物として正規文書化済み |

## 禁止条件フィルタリングゲート（Decision 候補除外記録）

| 対象 | 除外理由 | 根拠事実 | 代替反映先候補 |
|---|---|---|---|
| 全問題クラス（PC-1〜PC-4） | 運用ルール / 技術判断不在 | いずれも検証実行経路・手順・受領検査の運用改善であり、アーキテクチャ上の決定・技術選定・設計判断を含まない | docs/knowledge/ 知識文書、agentdev-quality-gates、agentdev-case-run-execution-adapter、checker 実行契約 Design |

## 全体傾向

- 高頻出・高影響: Windows + bun 検証環境に起因する問題クラスが今回の 21 エントリ中 12 エントリ（PC-1、E-10、E-12〜E-17、E-04）を占める。Epic #2805（Windows 環境の検証基盤是正）の実行に伴う観測の集中による。
- 横展開性が高い: PC-1（checker 実行全般）、PC-3（fail 由来分類全般）。
- 自動化適性が高い: PC-4（3点検査 guard は機械的チェック）、PC-2（main 側再実行手順）。
- 観察所見: Epic #2805 の各 OU で得た検証環境知見の大半（E-10、E-12、E-13、E-17）は当該 Case 自体が QG-4 正規形・worktree-operations.md・知識文書へ反映済みであり、learning としては duplicate として処理される。反映済み知識の二重蓄積は capture 境界上やむを得ないが、promoted 成果物と配布物の乖離は生んでいない。

## STEP-4 adversarial-review 記録

- **発動条件判定**: 発動。inbox エントリ 21件（skip 条件「1件のみかつ重複確実」非該当、inbox 空でない）、evaluation-report.md に STEP-2/3 結果反映済み。不可逆処理（deferred 移動・prune・commit/push）は未実行であることを確認。
- **実行形態**: agentdev-adversarial-review の審議プロトコル（Orchestrator / Reviewer / Reviewee の3論理役割、初期 challenge 2系統の独立 stream、対称的相互反証、合意候補再検証）を本 workflow 実行体内の論理役割による inline 審議として実行（書き込み禁止型 semantic_review。審議自体はファイル・Issue・PR への副作用なし。論理役割は物理エージェント構成を固定しない）。
- **レビュー戦略**: 対象=問題クラス分類・8軸評価・処分判定・既存対策照合。疑う点=(i) 既存配布物・知識との重複見逃し（冗長昇華）、(ii) 未カバー知見の誤った duplicate 判定（知見喪失）、(iii) 問題クラスのテーマクラスタリング化（異種根本原因の混入）、(iv) 単発エントリの過大評価、(v) prune 対象の誤拡大。
- **Stream-α（分類・評価の内在妥当性）findings**:
  - F-α1【受理・反映】: 当初案の「fail 由来分類」クラス（E-10/E-15/E-16）は3系統の根本原因（Windows 環境依存 / baseline stale / 横断検査依存）をテーマクラスタリングする恐れ。STEP-3 照合で E-10 は既存知識（windows-bun-test-spawn-timeout-classification.md）がカバー（duplicate）、E-15/E-16 は「検証前提の確認不足による誤分類」で同一予防策ファミリ（前提確認 + 根拠併記）と確定し、クラスを PC-3（E-15/E-16）に再構成した。反証（Reviewee）: E-15 と E-16 は前提の種類が異なる→再反証: いずれも「由来分類時に検証前提（baseline 健全性・検査対象の専属性）を確認し根拠を併記する」同一手順の適用局面差であり、予防策は同一。維持。
  - F-α2【棄却】: E-19/E-20 を worktree 運用クラスとして統合すべきとの疑い→根本原因（1-writer 前提違反の検知 vs 分支履歴の物理制約）が異なり、分類基準（根本原因 + 再発条件 + 予防策が同じ単位）違反。未分類維持。
  - F-α3【棄却】: 8軸スコアの水増し疑い（PC-1 の再発可能性 5・固有知識 5）→ Windows + bun は当リポジトリ標準検証環境であり checker 実行のたびに適用される知識。スコア妥当。
  - F-α4【棄却】: promote 4件は過剰との疑い→各クラス2件以上・ギャップを実ファイル確認で実証・backlog-review に利用者承認がある。過剰でない。
- **Stream-β（既存対策照合の完全性）findings**:
  - F-β1【受理・確認】: E-12/E-13/E-17 の duplicate 判定根拠（worktree-operations.md「bun test 実行の環境前提」節、qg-4-final-acceptance.md の依存パッケージ前置節、traceability SKILL の argv 契約表）を再確認。カバー十分。
  - F-β2【受理・保守的運用】: deferred pool の concrete-id 系既存エントリ（pool 1700: unclassified-entry 分類仕様の観察、pool 1792: 不在 ID 参照残骸の置換実例）を今回 duplicate prune すべきか→現行知識文書で「十分に」カバーとは言い切れない（1700 は checker 分類仕様の観察記録）。prune せず保留維持。
  - F-β3【受理】: pool 1412 の duplicate 判定は qg-4-final-acceptance.md の2ディレクトリ前置明記により完全カバー。prune 合理。
  - F-β4【受理・確認】: PC-4 のギャップ主張（受領側3点検査 guard・background 消失回復手順の未整備）を adapter SKILL 本文確認で再検証（result 4状態・PR URL 受領は既存、commit hash 検査・消失時回復手順の記載なし）。ギャップ実在。
- **Convergence**: 受理 findings は全て判定表へ反映済みまたは確認済み。未解決の本質的争点なし。
- **Convergence audit**: 受理 findings の根拠を正規成果物（knowledge 2件、qg-4-final-acceptance.md、worktree-operations.md、adapter SKILL、traceability SKILL）の該当箇所と再突合し、分類・処分・prune 対象（新規 staged 8 / duplicate 6 / pool duplicate 1 / deferred 維持 7 + pool 既存分）が確定したことを再検証。新規争点なし。
- **ループ離脱**: 停止条件4点（新 finding なし、全 finding 処理済み、HITL/blocker なし、対象の意味内容変化なし）を満たし離脱。STEP-5 へ。

## STEP-5 自律確定記録

自律確定可否は workflow-contracts Design「promote系判断確定とHITL境界」の判定表に従って判定した。

| 対象 | 判定結果 | 主要根拠 | HITL 不要理由 |
|---|---|---|---|
| PC-1（E-08, E-14） | promote（staged。update-checker-stdout-flush-workarounds.md） | 31/40。fix gap 実証（E-08 が未記載箇所を明示、知識文書の例外経路節に具体手なし） | 適用契約（知識文書・checker 実行契約）と判断根拠を特定済み。実現先選定は req-define / backlog-review（利用者承認あり）に委ねられており新規対象範囲の決定を含まない。競合する選択肢なし・情報欠落なし |
| PC-2（E-05, E-09） | promote（staged。update-traceability-cross-state-qg4.md） | 28/40。worktree-operations.md はカタログ新鮮性・宣言確認を未カバー（fix gap / application miss） | 同上。対処手順が一意に文書化可能 |
| PC-3（E-15, E-16） | promote（staged。update-fail-origin-classification-preconditions.md） | 27/40。既存知識の対照実行節に前提確認（baseline 健全性・専属性）の記載なし（fix gap） | 同上 |
| PC-4（E-06, E-18） | promote（staged。update-delegation-result-contract-guard.md） | 27/40。adapter SKILL に受領側3点検査 guard・消失回復手順の記載なし（guardrail insufficiency） | 同上 |
| E-02, E-10, E-11, E-12, E-13, E-17 | duplicate（prune） | カバーする既存成果物を本実行で直接読込確認（duplicate 判定表参照） | 既存対策との重複がファイル確認で一意に確定。ユーザーの価値判断・新規範囲決定を含まない |
| pool 1412 | duplicate（prune） | qg-4-final-acceptance.md が同一手順を正規形として明記 | 同上 |
| E-01, E-03, E-04, E-07, E-19, E-20, E-21 | deferred（living pool 維持） | 全て出現1件・昇華の具体性不足。既存安全境界（deferred/未処理の自動削除禁止）に従い維持 | 保留維持は可逆処理であり安全境界の迂回なし |

- **HITL移送条件該当検討**: 複数の本質的に競合する選択肢なし / ユーザー固有の価値判断不要 / 対象範囲の新規決定なし（promote は候補 staging のみ、実現先は req-define が確定）/ 正規情報源間の矛盾なし / 証拠・情報不足なし / レビュー未解決争点なし / 必須検証の利用不能なし / 明示承認を要求する契約なし（破壊的変更に該当せず: inbox クリアは deferred 原子的移動後の正規操作、prune は判定確定と同時承認の設計）。
- **結論**: 全項目自律確定。ユーザー判断必要項目なし → HITL を発生させず STEP-6 へ進む。

## promote 時 prune 結果

- **対象エントリ数**: deferred.md 既存エントリ + inbox 移動 21エントリ
- **prune 実施**: あり
- **prune 候補**: 15件（新規移動分 staged 8件 + 新規移動分 duplicate 6件 + pool 既存 duplicate 1件（pool 1412））。staged 分の証拠は各採用済み成果物「元learning item / 根拠」セクションへ保存
- **prune 却下**: 0件（deferred / 未処理 / 再評価対象は全件保持。pool 1700/1792 は F-β2 により保留維持）

## git 永続化

- **対象**: `.agentdev/learning/` 配下のみ（inbox.md、deferred.md、evaluation-report.md、promoted/ 4件）。明示パス指定・`git commit -- <paths>` 形式
- **commit message**: `chore(agentdev): promote learning findings`（commit hash・push 成否は完了報告に記載）
- **prune 実績**: 追記 21件 → 検証済み → inbox クリア → prune 15件（staged 8 + duplicate 6 + pool 1412）→ 新規 deferred 残存 7件（deferred.md 見出し 113 → 119）
