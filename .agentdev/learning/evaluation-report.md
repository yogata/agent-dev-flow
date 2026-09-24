# 評価レポート

## メタデータ
- **実行日時**: 2026-09-24 (JST, learning-promote STEP-1〜STEP-5〔自律確定まで〕完了版)
- **実行コンテキスト**: /agentdev/backlog-auto stage-2 learning サブシステム。STEP-6（promoted 生成・deferred 移動・prune・git 操作）と HITL 提示は親 orchestration が実行するため本実行では実施しない
- **対象エントリ数**: 17件（inbox: 17件, deferred: 133見出し走査・候補本文読込 約30エントリ）
- **問題クラス数**: 16（複数エントリクラスタ3 + 単独クラスタ13。観察系2件を含む）
- **source revision**: 68e75cef
- **入力 digest**: inbox.md sha256=44bbe7222943b166eedbb5dee813f619f9a6eaa13967189213313ac3101703bf / deferred.md sha256=31605e181fe2a227f31a472675e30402537460566397784706e0affead4eab92
- **STEP-5 確定内訳**: 自律確定 16件（promote 8問題クラス9エントリ / duplicate 5 / deferred 3）、HITL 移送 0件

## STEP-1 読込記録

- inbox.md 17エントリを全読込・正規化済み（全エントリ新13フィールドフォーマット。旧5フィールドからの変換は不要であった）
- deferred.md は2フェーズ読込: 第1フェーズで grep により「## 」見出し133行とタグ行127行をインデックス化（分離インデックスファイルは作成しない）。第2フェーズで候補選択（タグ一致・見出しトークン一致・常時直近20エントリ）により候補本文を読込。候補0件のエントリは存在せず（直近20常時候補）、全面読みフォールバックは不要であった
- 読込した候補本文（主なもの）: baseline分類の乖離(L49), L-010 ハーネス制約委譲(L221) と同根の L-004 の存在, wave5 worktree 隔離違反(L661〜683), PowerShell gh encoding(L767), IR-055 placeholder(L941), bun install gitignore(L1349), check_integrity レポート後始末(L1541), traceability 宣言網羅性(L1565), ADF-COVERS 宣言配置(L1585), agentdev_gh pr_create invalid-input(L1826), ng-baseline 削除(L1907), case 2796/2797/2799/2805 系(L2005〜L2052), worktree 並行書き込み(L2056), agentdev-gh issue_update state 変化(L2080), pr 検出(L2101), case 2908 traceability 誤解釈(L2143), os.tmpdir 誤検出(L2162), docs_chore unclassified(L2200), frontmatter updated(L2219), BASELINE_CATEGORIES(L2295), fixture REQ ID(L2314), Definition 変更テスト陳腐化(L2333), Wave 並列依存(L2352), カタログ欠番(L2371), bun run Module not found(L2389), textlint guard TEMP(L2410), spawn timeout(L2431), fixture 吸収節(L2452), 張替えリンク(L2473), bun test stderr(L2489), write guard(L2510)

## 問題クラス一覧

### 問題クラス1: agentdev_gh issue_list の全件走査（フィルタ未絞込）
- **根本原因**: issue_list は filter に一致する Issue をページング全走査するため、state/search を絞らずに呼び出すと大規模リポジトリで安全ページ上限に到達する（呼出側の使い方）
- **再発条件**: Issue 数が大きいリポジトリで issue_list を state なし・広義 search で呼び出した場合
- **予防策**: 呼出側義務として絞り込みクエリ（state/search/labels）を必須化、上限到達時は contingency 参照

#### 8軸評価スコア
| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | inbox 1件のみ |
| 影響度 | 2/5 | 再試行で解消、検出自体は継続可能 |
| 横展開性 | 4/5 | 大規模リポジトリの全 agentdev_gh 呼出に共通 |
| 反映先明確度 | 5/5 | REQ-092（2026-09-24 作成）が呼出側規律を要件化済み |
| 自動化適性 | 3/5 | 呼出規律の運用化が必要 |
| プロジェクト固有知識再利用性 | 3/5 | |
| 再発可能性 | 2/5 | REQ-092 運用化で低減見込み |
| 費用対効果 | 4/5 | 規律文書の整備のみ |
| **加重合計** | **24/40** | |

- **推奨処分案**: duplicate — REQ-092-001（広範 filter に search 併用必須）・REQ-092-003（上限到達時 contingency 参照）が本エントリの学習内容を恒久契約としてすでに包含する。E1 の予防策候補（workflow reference への明記）は REQ-092 適用範囲の運用文書（issue-operation-safety.md）整備事項であり、本 entry からの新規昇華は不要
- **エントリ一覧**: agentdev_gh issue_list の全件走査で safety page limit に到達 [inbox]

### 問題クラス2: PowerShell コンソール標準出力の CRLF が bash 行指向処理を破壊
- **根本原因**: [Console]::WriteLine の CRLF 出力が LF 前提の bash パイプ（base64 -d 等）と不整合。末尾行のみ成功するため検出が遅延する
- **再発条件**: PowerShell 標準出力を bash 側の行指向ツールへパイプする全処理
- **予防策**: [Console]::OpenStandardOutput() + LF 付きバイト直書きを標準手段化

#### 8軸評価スコア
| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | inbox 1件 |
| 影響度 | 2/5 | 14変数中13エントリのデコード失敗だが fix-and-reverify で解消 |
| 横展開性 | 4/5 | Windows + PowerShell + bash 連携の全局面 |
| 反映先明確度 | 5/5 | windows-powershell-bulk-io-corruption.md（隣接系統）と本 Case 知識文書に反映経路が明確 |
| 自動化適性 | 3/5 | 手順知識として標準化可能 |
| プロジェクト固有知識再利用性 | 4/5 | Windows 環境運用の中核的落とし穴 |
| 再発可能性 | 3/5 | PowerShell→bash パイプは頻出 |
| 費用対効果 | 4/5 | 知識追記のみで予防可能 |
| **加重合計** | **26/40** | |

- **推奨処分案**: project knowledge（category 4）— 既存知識文書 windows-powershell-bulk-io-corruption.md は「一括読み書きによるファイル破壊（cp932・Set-Content CRLF）」を対象とし、コンソール stdout パイプ経路の CRLF 問題（WriteLine → OpenStandardOutput LF バイト直書き）は未カバー。当該文書はファイル I/O 系にスコープを限定した文書であり手順の不備ではなく、本件は別面（stdout パイプ）の新規隣接知見であるため category 4（新規知識化）とし、category 5（既存文書の不備）としない。反映先の具体選択は req-define が確定する
- **既存対策照合**: windows-powershell-bulk-io-corruption.md（ファイルI/O系のみ・本件経路は未 coverage）/ supervisor-bridge-credential-supply.md（base64 ASCII stdout の回避実例あり、WriteLine CRLF の一般化記載なし）
- **エントリ一覧**: PowerShell WriteLine の CRLF 出力が bash パイプ受信の行指向処理を破壊する [inbox]

### 問題クラス3: worktree での checker 系検査の junction 未伝播環境由来 NG の由来分類
- **根本原因**: .opencode/plugins 等の junction が worktree に未伝播の構造的制約により、projection 系検査が worktree では不足状態を正しく報告する（誤検出ではなく環境差の正検出）
- **再発条件**: worktree cwd で check_integrity（source profile）等の projection 系検査を実行した場合
- **予防策**: main root 再実行との突合による由来分類、環境ラベル記録、worktree 内結果と main 実体結果の分離記録

#### 8軸評価スコア
| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | inbox 1件 + deferred 同種先行1件（case 2797 投影前提） |
| 影響度 | 2/5 | 突合で解消、検証差分への記録で完結 |
| 横展開性 | 3/5 | worktree 運用全般 |
| 反映先明確度 | 4/5 | checker-execution-contracts「worktree 環境での checker 実行 fallback」・qg-4 環境ラベル・worktree-operations skip 挙動 |
| 自動化適性 | 2/5 | 突合は手続 |
| プロジェクト固有知識再利用性 | 3/5 | |
| 再発可能性 | 4/5 | worktree 運用が常態 |
| 費用対効果 | 2/5 | 既存契約で処理済み、追加投資の余地が小 |
| **加重合計** | **22/40** | |

- **推奨処分案**: duplicate — 既存配布契約（checker-execution-contracts.md「worktree 環境での checker 実行 fallback（junction 未伝播時の SoT 直参照）」、qg-4-final-acceptance.md 環境ラベル・fail 由来分類、worktree-operations.md「junction 依存 checker の skip 挙動」「main root 実体 + --root 指定」）が同等の手順知識をすでに所有し、本件もその契約どおりの適用で解消済み
- **エントリ一覧**: worktree で check_integrity（source profile）の ng は junction 未伝播の環境依存として由来分類する [inbox] / case 2797 worktree で full check_integrity を実行する際の repo-local Plugin 投影前提 [deferred]

### 問題クラス4: bun test のサマリーは stderr 出力（stdout 単独退避では件数突合不能）
- **根本原因**: bun test はテスト結果サマリー（Ran N tests 等）を stderr へ出力する仕様に対し、証跡退避実装が stdout のみを前提とした
- **再発条件**: stdout リダイレクト・stdout のみ返却する API で bun test の証跡を取得した場合
- **予防策**: stdout/stderr 分離併退避（正規形）、サンプルコマンドへの 2> 常時付与

#### 8軸評価スコア
| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | inbox 1件 + deferred 2026-09-20 同種1件 = 2回発生 |
| 影響度 | 2/5 | 正規形での再取得で解消 |
| 横展開性 | 3/5 | bun test 証跡取得全般 |
| 反映先明確度 | 5/5 | qg-4-final-acceptance.md「証跡の stdout・stderr 分離併退避」節 |
| 自動化適性 | 3/5 | サンプルコマンド整備で機械的予防可能 |
| プロジェクト固有知識再利用性 | 3/5 | |
| 再発可能性 | 4/5 | 既存契約があるにもかかわらず再発（application miss） |
| 費用対効果 | 4/5 | 参照のサンプル追記のみ |
| **加重合計** | **26/40** | |

- **推奨処分案**: 既存対策の更新（category 5）— 既存契約（分離併退避）は存在するが、stdout 単独退避の再発（Case #3085）により適用漏れが実証された。gap 分類: application miss（実装側が stdout 単独で退避）+ fix gap 候補（実行手順のサンプルコマンドに stderr 退避を常時含める旨の明示不足）。deferred 2026-09-20 エントリの再評価条件（stdout キャプチャ証跡の再発時）が成立
- **エントリ一覧**: bun test の summary は stderr へ出力される [inbox] / 2026-09-20 bun test の件数サマリーは stderr 出力 [deferred]

### 問題クラス5: checker script の CJS/ESM 実行経路（node strip-types 不通・bun 実行）
- **根本原因**: scripts 側 package.json type: module とスクリプト内 CJS require 混在により node --experimental-strip-types 経路が require is not defined で不通
- **再発条件**: type: module 配下の require 混在スクリプトを node 経路で起動した場合
- **予防策**: require の ESM import 移行 or CLI 例外経路（bun）での実行に限定

#### 8軸評価スコア
| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | inbox 1件 + deferred case 2799 同種1件 |
| 影響度 | 2/5 | bun run 経路へ迂回して完結 |
| 横展開性 | 3/5 | repo-agentdev-integrity scripts 全般 |
| 反映先明確度 | 4/5 | checker-execution-contracts.md「安定実行経路」「ESM 互換性要件」（本実行で実在を検証済み） |
| 自動化適性 | 3/5 | |
| プロジェクト固有知識再利用性 | 3/5 | |
| 再発可能性 | 2/5 | ESM 互換性要件（import 必須・CLI 例外経路限定）の運用化で低減 |
| 費用対効果 | 3/5 | |
| **加重合計** | **22/40** | |

- **推奨処分案**: duplicate — checker-execution-contracts.md「安定実行経路」（node import 標準・bun は flush 保証付き例外経路）と「ESM 互換性要件」（require 依存は互換化 or CLI 例外経路限定・新規 checker は import 必須）が本学習の契約面を包含。deferred case 2799 エントリが check_changed_docs.ts の require() 依存と bun 実行の事実を記録済み。E11 はその再確認であり新たな gap を生じていない
- **エントリ一覧**: check_changed_docs.ts の node --experimental-strip-types 経路が CJS/ESM 混在で不通 [inbox] / 2026-09-14 case 2799 検査スクリプトの実行ランナーは bun [deferred]

### 問題クラス6: worktree の旧 durable state（baseline・解消行）追随不足による疑似 fail の由来分類
- **根本原因**: 並行 sibling の main merge により baseline 系 durable state（IR-055 baseline・REQ 解消行等）が更新されても、分岐時点の旧 state のままの worktree で suite を実行すると delta guard・traceability check が「新規違反」と誤分類する
- **再発条件**: 並行マージ後に旧 baseline / 旧解消状態の worktree で delta guard や全 corpus check を実行した場合
- **予防策**: 由来分類3点（単独再実行 → baseline/分岐点の main root 再現確認 → baseline 差し替え同一テスト再実行〔検証後復元〕）、merge-base と時系列確認

#### 8軸評価スコア
| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | inbox 1件 + deferred case 2908 同種1件 |
| 影響度 | 3/5 | QG-4 完了判定の誤差し戻しリスク（今回は3点証拠で機械確定し回避） |
| 横展開性 | 3/5 | baseline 系 durable state を持つ全検査 |
| 反映先明確度 | 4/5 | qg-4「fail 由来分類」「traceability check の横断 durable state 前提手順」 |
| 自動化適性 | 2/5 | 手続的由来分類 |
| プロジェクト固有知識再利用性 | 4/5 | QG-4 運用の中核的崩し手知識 |
| 再発可能性 | 4/5 | 並行 case-close / sibling merge が常態 |
| 費用対効果 | 3/5 | 手順追記で済む |
| **加重合計** | **25/40** | |

- **推奨処分案**: 既存対策の更新（category 5）— 既存の qg-4 fail 由来分類（単独再実行・baseline 再現確認〔detached worktree〕）は存在するが、「baseline 系 durable state の並行追随差」を明示した fail パターンと、baseline 差し替え同一テスト再実行（検証後復元）による決定的対照証拠の手順は未記載（fix gap）。gap 分類: fix gap（baseline 系追随差の明示と対照実行手順の追記候補）
- **エントリ一覧**: worktree での bun test 3-split 実行は並行マージによる IR-055 baseline 更新の未追随で delta guard 疑似 fail を出す [inbox] / 2026-09-17 実装 PR 分岐後に先行 merge された main 側解消行が誤解釈され得る [deferred]

### 問題クラス7: Windows junction 操作の処理系差分（作成のパス解決・削除コマンド）
- **根本原因**: worktree 依存整備の junction 操作は実行処理系（cmd mklink / node fs.symlinkSync / Git Bash rmdir / PowerShell Remove-Item / node fs.rmdirSync）によりパス解決基準と削除挙動が異なり、手順例（cmd /c mklink /J の cwd 相対指定・Remove-Item）が node / bash 経由の実行に転記できない
- **再発条件**: 依存整備の junction 作成・削除を手順例と異なる処理系（node・非対話 bash）で実行した場合
- **予防策**: node 経由の fs.symlinkSync は dest ディレクトリ基準解決のため絶対パス指定、junction 削除は node fs.rmdirSync を標準手段化（Remove-Item は NonInteractive で確認プロンプトが出る場合がある）

#### 8軸評価スコア
| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | inbox 2件（Case #3080・#3084） |
| 影響度 | 3/5 | 誤リンクによる TIM テスト7件 fail、削除不能による後始末滞留 |
| 横展開性 | 3/5 | worktree 依存整備の全 Case |
| 反映先明確度 | 5/5 | worktree-operations.md「bun test 実行の環境前提」の junction 作成・削除例（行番号特定済み） |
| 自動化適性 | 3/5 | 正規コマンドの固定で機械化可能 |
| プロジェクト固有知識再利用性 | 4/5 | Windows worktree 運用の常設知識 |
| 再発可能性 | 3/5 | node / bash 経由実行は頻出 |
| 費用対効果 | 4/5 | 例示補足のみ |
| **加重合計** | **27/40** | |

- **推奨処分案**: 既存対策の更新（category 5）— worktree-operations.md の junction 例は cmd mklink /J（cwd 相対 target）と Remove-Item -LiteralPath で記載され、(a) node fs.symlinkSync 相対 target は dest ディレクトリ基準で解決されること、(b) Git Bash rmdir は「Not a directory」で拒否、Remove-Item は NonInteractive で確認プロンプトが出る場合があること、(c) node fs.rmdirSync が確実な削除手段であること、が未記載（fix gap）。gap 分類: fix gap（処理系別の注意と node 正規手段の追記候補）。Jev は category 4 を示唆したが、当該節は worktree 依存整備の正規手順そのものであり、その手順が node / bash 実行で不成立になる記述欠落は既存手順の不備（category 5）と判定
- **エントリ一覧**: worktree での bun test 依存整備は junction 2 ディレクトリで足りる（削除は node fs.rmdirSync が確実） [inbox] / Windows node fs.symlinkSync の相対 target は dest ディレクトリ基準で解決される [inbox]

### 問題クラス8: 並行委譲間の worktree / git 作業境界の侵害
- **根本原因**: 複数の並行 case-open / 委譲が同一 worktree・checkout 状態を共有し、worktree の 1-writer 前提が崩れて branch 混入・並行書込み・cd 誤りによる main 汚染が発生する
- **再発条件**: 複数委譲が同時に同一 worktree / checkout で branch 切替・編集・commit を行う場合
- **予防策**: Case 専用 worktree での branch 作成、PR 作成前の merge-base と diff --stat 検査、明示パスステージ、git status 検知、早期断念基準

#### 8軸評価スコア
| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 3/5 | inbox 1件 + deferred 同種2件（wave5 隔離違反・case 2805 並行書込み） |
| 影響度 | 4/5 | 別 Case commit の PR 混入・PR 作り直し |
| 横展開性 | 4/5 | 全並行委譲（case-open / case-run / capture） |
| 反映先明確度 | 4/5 | case-open branch/worktree 運用手順・adapter protocol・case-auto 委譲境界 |
| 自動化適性 | 3/5 | merge-base / diff --stat / git status 検査は機械化可能 |
| プロジェクト固有知識再利用性 | 4/5 | |
| 再発可能性 | 3/5 | 並行投入は backlog-auto stage 構造上常态化し得る |
| 費用対効果 | 4/5 | 検査前置の追加のみ |
| **加重合計** | **29/40** | |

- **推奨処分案**: 既存対策の更新（category 5）— worktree 隔離原則（adapter protocol・case-open「worktree root 配下以外を編集しない」）は存在するが、(a) 並行 case-open 間で Case 専用 worktree を強制する前置、(b) PR 作成前の merge-base / diff --stat による混入検査、(c) worktree 1-writer 前提の早期断念基準、は明文化されていない（fix gap）。3系統の同種発生で適用漏れが構造化された。Jev は category 4 を示唆したが、隔離原則と運用手順が既存であり追加すべきは前置検査・早期断念基準の記述（既存対策への追記）であるため category 5 と判定
- **エントリ一覧**: 並行 Case の共有 worktree で branch 混入を検知したら隔離 worktree で差分を再構成する [inbox] / wave5 cd 操作誤りによるメインリポジトリ一時汚染 [deferred] / case 2805 worktree 内並行書き込みの検知と明示パス・ステージ確認 [deferred]

### 問題クラス9: harness 制約下の実行担当接合（能力検出とプロセス内直接実装）
- **根本原因**: 実行担当サブエージェント型の起動手段が制限されたハーネスでは adapter 委譲契約の実行担当接合がそのまま起動できず、起動手段の能力検出に基づく接合形態の選択とその記録が必要になる
- **再発条件**: 起動手段が制限された harness で case-run の委譲を実行する場合
- **予防策**: 能力検出結果に基づく接合判定（プロセス内直接実装 + result 4状態・3点ゲート契約の self-apply）とその記録の経路を harness 固有委譲ノートへ明記

#### 8軸評価スコア
| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 3/5 | inbox 1件 + deferred 同種2件（L-004・L-010。L-010 は L-004 と同根の知見と自己記載） |
| 影響度 | 2/5 | 契約どおり self-apply で完遂、委譲不能停止は回避 |
| 横展開性 | 2/5 | harness 固有 |
| 反映先明確度 | 4/5 | case-run-execution-adapter SKILL L213〜218 が「委譲起動手段・能力検出・インライン代替の有無は references/harness-delegation.md に配置」と指定 |
| 自動化適性 | 3/5 | 事前 probe の手続化可能 |
| プロジェクト固有知識再利用性 | 3/5 | |
| 再発可能性 | 3/5 | harness 制約は継続 |
| 費用対効果 | 3/5 | ノート追記のみ |
| **加重合計** | **23/40** | |

- **推奨処分案**: 既存対策の更新（category 5）— harness-delegation.md「委譲起動失敗、異常終了時事後処理」は委譲起動後の事後処理のみを扱い、起動不能の事前判定から接合形態決定（プロセス内直接実装 + 契約 self-apply）とその記録までの経路が未記載（fix gap）。deferred L-004/L-010 の再評価条件（事前 probe 強化）が3回目の発生で成立。Jev は deferred (0.53) を示唆したが、出現3系統かつ配置先が配布契約で指定済みである点を根拠に category 5 と判定。注記: インライン代替の有無を harness 責務とする配布契約（adapter SKILL L215〜216）との整合を保ち、配布 SKILL の委譲契約自体は変更しない
- **エントリ一覧**: harness 制約下の case-run 委譲では実行担当接合を委譲実行者のプロセス内直接実装として履行 [inbox] / L-010 ハーネス制約で task() 委譲不可時に同一エージェント統合実行 [deferred] / L-004（L-010 と同根） [deferred]

### 問題クラス10: 閉じた choice 判断の候補集合の正解クラス欠落（Jev 候補完備性）
- **根本原因**: STEP-3 既存REQ照合判断の choice 候補集合が「REQ操作なし」系の正解クラスを含まず（requirement-development.md STEP-3 質問形式表「choice（CREATE・APPEND・UPDATE）」— 本実行で L181 を検証し候補欠落を確認済み）、閉じた構成では分布が候補欠落を通知しないため最近似候補へ高確率で張り付く
- **再発条件**: 閉じた choice 判断の候補集合に正解クラス（特に「操作なし・対象外・影響なし」系 NULL 候補）が含まれないまま質問を構成した場合
- **予防策**: choice 質問構成時の候補完備性チェック（正解クラス網羅・NULL 候補の含む/含まない明示判断）、候補欠落由来の是正は判断構成側の欠陥として分類する運用ルール

#### 8軸評価スコア
| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | inbox 1件（ただし同一観測バッチ内に同一構造の corrected 7判断を含む単一観測バッチ） |
| 影響度 | 4/5 | 7判断が Jev の誤選択 + LLM 是正で成立、評価の質が候補構成の偶発に左右される |
| 横展開性 | 5/5 | agentdev_jev evaluate で choice を構成する6系統 workflow 全般 |
| 反映先明確度 | 5/5 | requirement-development.md STEP-3 質問形式表（L181）を特定・検証済み |
| 自動化適性 | 4/5 | 候補完備性チェックは構成規則として機械的適用可能 |
| プロジェクト固有知識再利用性 | 4/5 | Jev 運用（REQ-090・DEC-027 観測ループ）の中核規則 |
| 再発可能性 | 4/5 | choice 構成は判断のたびに発生 |
| 費用対効果 | 4/5 | 形式表の候補追加と構成規則の明記のみ |
| **加重合計** | **31/40** | |

- **推奨処分案**: 恒久契約候補（REQ）（category 1）— Jev 質問構成契約（STEP-3 質問形式表・Jev 構成規約）の変更を要する要件変更要因。無条件の自動REQ化ではなく候補として promoted/ へ出力し、backlog-review → req-define 経路で確定する。Decision 候補ではなく REQ・配布 workflow reference 更新が代替反映先（「Decision候補除外記録」参照）
- **エントリ一覧**: 閉じた choice 判断の候補集合は正解クラスを尽くさないと意味評価器が最近似候補へ高確率で張り付く [inbox]

### 問題クラス11: worktree bun test 3-split の分割③ plugins 経路の環境差
- **根本原因**: .opencode/plugins の junction が worktree に伝播しない構造的制約により、分割③の対象が実行対象から欠落する
- **再発条件**: worktree 上で 3 cwd 分割実行の分割③を実行した場合
- **予防策**: plugins 経路は main root から実行し環境ラベル（実行環境・実施範囲）で記録、未実施を未実行対象として扱う

#### 8軸評価スコア
| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | inbox 1件 |
| 影響度 | 2/5 | 実施範囲の判別記録で完結 |
| 横展開性 | 3/5 | worktree bun test 全般 |
| 反映先明確度 | 5/5 | qg-4-final-acceptance.md「worktree での分割③ 対象欠落の環境差」 |
| 自動化適性 | 3/5 | |
| プロジェクト固有知識再利用性 | 3/5 | |
| 再発可能性 | 2/5 | 契約に運用注記済み |
| 費用対効果 | 3/5 | |
| **加重合計** | **22/40** | |

- **推奨処分案**: duplicate — qg-4-final-acceptance.md 分割③環境差節（件数突合と環境ラベルによる実施範囲判別・未実施を未実行対象として扱う・代替手順は実在確認した手順のみ）が同等内容をすでに所有し、E3 自身も「QG-4 契約と整合・正規形を変更しない」と記録している
- **エントリ一覧**: worktree で bun test フル suite 正規形（3 cwd 分割）は .opencode/plugins 未伝播のため分割実行への代替が必要 [inbox]

### 問題クラス12: bash 経由 checker --root への backslash パス破損
- **根本原因**: bash は backslash を escape 文字として解釈するため、引用符なし Windows 形式パスは引数段階で破損し、checker は空コーパス走査で fail-closed 契約どおり missing を返す（チェッカー異常ではない見かけ上の全件 missing）
- **再発条件**: bash から Windows 形式（backslash）パスを引用符なしで checker のパス引数へ渡した場合
- **予防策**: checker 実行コマンド例のパス表記を forward slash 形式に統一、durable state 解消済み行の誤判定崩し手（記録値との突合）と併用

#### 8軸評価スコア
| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | inbox 1件 |
| 影響度 | 3/5 | QG-4 独立再検査の見かけ上全件 missing（完了ゲート誤判定リスク） |
| 横展開性 | 3/5 | Windows bash 環境の checker 実行全般 |
| 反映先明確度 | 5/5 | worktree-operations.md「main root 実体 + --root 指定による読取系 checker 実行手順」節（例は forward slash・表記注意の明記なしを検証済み） |
| 自動化適性 | 2/5 | 表記統一の運用 |
| プロジェクト固有知識再利用性 | 4/5 | |
| 再発可能性 | 3/5 | backslash パスの自然な記述ミスは頻出 |
| 費用対効果 | 4/5 | 例示補足のみ |
| **加重合計** | **25/40** | |

- **推奨処分案**: 既存対策の更新（category 5）— worktree-operations.md 当該節は例示が forward slash 形式だが「backslash パスは escape 解釈で破損し全件 missing を返す」旨の注意記載が欠落（fix gap）。出現1件だが、完了ゲート（QG-4 独立再検査）の信頼性に直結する既存手順の記述欠落であり反映先と修正内容が一意に確定できる
- **エントリ一覧**: bash から checker の --root に backslash パスを渡すと escape 解釈で破損し traceability check が見かけ上 missing を返す [inbox]

### 問題クラス13: traceability sidecar と inline ADF-COVERS の二重宣言
- **根本原因**: 同一対応関係が複数情報源に分散すると check が表現形式を区別せず突合するため duplicate-inconsistencies として検出される
- **再発条件**: 同一 artifact に sidecar と inline の両方で同一 role の対応関係を宣言した場合
- **予防策**: 同一 artifact × 同一 role は単一情報源のみ（role が異なれば併存可）

#### 8軸評価スコア
| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | inbox 1件 |
| 影響度 | 2/5 | 集約修正で解消 |
| 横展開性 | 3/5 | 宣言作成工程全般 |
| 反映先明確度 | 5/5 | agentdev-traceability SKILL.md「二重宣言の整備方向の優先」（本実行で該当規則を実在確認済み） |
| 自動化適性 | 3/5 | check が検出済み |
| プロジェクト固有知識再利用性 | 3/5 | |
| 再発可能性 | 2/5 | 優先規則（inline 優先・単一情報源解消）明文化済み |
| 費用対効果 | 4/5 | |
| **加重合計** | **23/40** | |

- **推奨処分案**: duplicate — agentdev-traceability SKILL.md が duplicate-inconsistencies による検出、単一情報源への解消方向（inline 優先保持）、role が異なる同一 artifact 併存可、をすでに規定しており本学習の帰結と完全一致
- **エントリ一覧**: traceability sidecar と inline ADF-COVERS の同一 artifact × 同一 role 二重宣言 [inbox]

### 単独・観察系クラスタ（未分類扱い）
- **AGENTDEV_GH_REPO 未設定かつ harness プロセス内 gh 解決破損での全操作 fail-closed** [inbox] — deferred。出現1件。解決導線（consumer-project-setup.md「AGENTDEV_GH_REPO の起動環境設定」節・plugin README）は既存で完全、残りは case-auto 投入前疎通確認の任意強化（候補止まり）。living pool で再評価（再評価条件: case-auto 前提確認の整備時・再発時）
- **worktree 内 checker 直接実行は junction 伝播なしで完結した（観察）** [inbox] — deferred。予防知見・再発条件なし。既存 fallback 契約（checker-execution-contracts「worktree 環境での checker 実行 fallback」）の妥当性実証記録として維持
- **IR-055 baseline entry は file×pattern 単位で count 集約される（観察）** [inbox] — deferred。baseline schema の仕様知見。entries 数と検出件数の双方突合を記録様式へ必須化する候補は軽微かつ単発のため保留（再評価条件: baseline 運用手順の記録様式更新時）

## promote 時 prune 結果

- **対象エントリ数**: 0件（本実行は STEP-6 を実施しないため prune 未実施。親 orchestration の STEP-6 が本レポートの判定確定に基づき実行する）
- **prune実施**: なし
- **備考**: prune 対象（staged / rejected / duplicate）の実ファイル処理は STEP-6 責務。duplicate 判定5件（問題クラス1・3・5・11・13）が prune 候補に相当

## 全体傾向

- **高頻出・高影響の問題クラス**: worktree / Windows 環境差に起因する検査・実行系の知見が17件中12件を占める。並行委譲の作業境界侵害（問題クラス8）が3系統で最頻出
- **横展開性が高い問題クラス**: Jev 候補完備性（問題クラス10、6系統 workflow へ適用可能）、並行委譲作業境界（問題クラス8）
- **自動化適性が高い問題クラス**: Jev 候補完備性チェック（構成規則化）、並行委譲の merge-base / diff --stat 検査
- **全体観察所見**: 「既存契約は存在するが運用での適用が追いつかない」型（問題クラス4・6・8）と「手順例の記述が処理系差分をカバーしていない」型（問題クラス2・7・12）の2系統に収斂。duplicate 判定5件はすべて既存契約・REQ による包含であり、配布契約面の整備水準は妥当。単独観察2件は実証記録として living pool で維持

## Decision候補除外記録

- **対象item**: 問題クラス10（Jev 候補完備性）/ 問題クラス9（harness 委譲接合）/ 問題クラス8（並行委譲作業境界）/ 問題クラス4・7・12（運用手順系）
- **除外理由**: command仕様・運用ルール（問題クラス10は質問形式表の候補集合変更=workflow 仕様変更、問題クラス9は harness 実行制御の運用ルール、問題クラス8は作業手順・検査追加の運用ルール、問題クラス4・7・12は実行手順の表記・標準手段整備）。いずれもアーキテクチャ上の決定、技術選定、技術的トレードオフ判断を含まない
- **根拠事実**: 変更対象が質問形式表・reference 手順・環境ラベル運用であり、代替技術経路の選定判断を伴わない
- **代替反映先候補**: 問題クラス10 → REQ（Jev 質問構成契約）+ 配布 workflow reference / 問題クラス9 → harness-delegation.md（harness 固有ノート）/ 問題クラス8 → case-open・adapter protocol 系 reference / 問題クラス4・7・12 → qg-4-final-acceptance.md・worktree-operations.md

## promote 確定分サマリ（STEP-6 親実行用）

- knowledge-powershell-console-stdout-crlf-bash-pipe.md（問題クラス2 / 元エントリ: PowerShell WriteLine CRLF）
- existing-countermeasure-update-bun-test-evidence-stderr-capture.md（問題クラス4 / 元エントリ: bun test stderr ×2系統）
- existing-countermeasure-update-worktree-stale-durable-state-fail-classification.md（問題クラス6 / 元エントリ: IR-055 baseline 未追随 + deferred case 2908）
- existing-countermeasure-update-junction-os-command-differences.md（問題クラス7 / 元エントリ: junction 依存整備 + symlinkSync）
- existing-countermeasure-update-parallel-delegation-worktree-boundary.md（問題クラス8 / 元エントリ: 共有 worktree branch 混入 + deferred 2件）
- existing-countermeasure-update-harness-delegation-capability-probe.md（問題クラス9 / 元エントリ: harness 制約委譲接合 + deferred L-004/L-010）
- req-jev-choice-candidate-completeness.md（問題クラス10 / 元エントリ: Jev choice 候補完備性）
- existing-countermeasure-update-worktree-operations-backslash-path-note.md（問題クラス12 / 元エントリ: bash backslash パス破損）

## STEP-4 review 記録（adversarial-review）

- **発動根拠**: default-on（Jev 発動条件判定も true・confidence 0.94）。inbox 17件のため skip 条件（1件のみで新規性なし / inbox 空）に非該当。evaluation-report.md に STEP-2・STEP-3 結果反映済み。不可逆処理（deferred 移動・prune・commit/push・promoted 生成）は未実行であることを確認済み
- **審議構成**: Orchestrator / Reviewer（2系統独立 stream）/ Reviewee の3論理役割。Stream A = duplicate 判定と既存契約包含の反証、Stream B = promote 判定の自己促進バイアスと処分基準の反証。初期 challenge 完了後に finding を統合し counter-challenge → convergence audit の順で実施
- **accepted findings と反映結果**:
  1. [Stream A・accepted] K1 duplicate は REQ-092 由来だが運用文書 issue-operation-safety.md は本時点で未整備 → 「STEP-4 review 反映による既存対策照合補記」節へ注記を追記（duplicate 判定の根拠を REQ の包含に限定して明記）
  2. [Stream B・accepted] K9 で Jev が deferred (0.53) を提示 → Reviewee 反証（deferred L-004/L-010 を含む3系統発生・配置先が adapter SKILL L215〜216 で指定済み・L-010 の再評価条件〔事前 probe 強化〕が未消化のまま2回再発）により promote 維持。発生件数スコアを 2→3 修正（加重合計 22→23/40）
  3. [Stream B・accepted] K13（promote・出現1件）と AGENTDEV_GH_REPO（defer・出現1件）の処分基準の整合性を Reviewer が指摘 → 判定基準を明文化（「STEP-5 自律確定記録」の基準 (a)(b)(c)）し再適用、両判定は基準どおりと確認
  4. [Stream B・accepted] K7・K8 で Jev が category 4 を示唆 → 「既存手順そのものの記述欠落は category 5、スコープ外の別面の新規知見は category 4」という区別規則を各クラスの推奨処分案へ明記（K2 は category 4 維持の根拠を補記）
  5. [Stream A・accepted] K5 の「require() 混在の現状は ESM 互換性要件の CLI 例外経路として許容されるか」の問いに対し、契約文（互換化 or CLI 例外経路限定）と deferred 2025 の事実記録により反証不成立と記録
- **rejected findings**: なし（全 finding を受入または反証成立として処理）
- **evaluation-report 戻しループ**: accepted finding は根拠・注記・スコアの微修正であり処分区分の意味内容を変更しないため STEP-2 → STEP-3 の再実行は不要と判断（再 review 発動条件に非該当。新規本質的争点なし・全 finding 処理済み・unresolved 0件・意味内容変化なしの停止条件4点を満たしループ離脱）
- **convergence audit**: 合意候補（全16クラスタの処分区分と根拠）と成立根拠を Reviewer/Reviewee が再検証。新たな本質的争点は発見されなかった
- **unresolved**: 0件（HITL / blocker 候補なし）

## STEP-4 review 反映による既存対策照合補記

- 問題クラス1: REQ-092 は恒久契約として呼出側規律を包含するが、運用文書 issue-operation-safety.md は本時点で未整備。REQ-092 の実装（運用文書整備）は REQ-092 の昇華経路（req-define → case-auto）の責務であり、本 duplicate 判定は REQ の包含を根拠とする（運用文書の出来を根拠としない）
- 問題クラス2: windows-powershell-bulk-io-corruption.md は「一括読み書きによる UTF-8 ファイル破壊」にスコープを限定した文書であり、stdout パイプ面をカバーしないことは文書の不備ではなく別面の知見である（category 4 判定の根拠）

## Jev 先行評価記録

- **実施方法**: 閉じた判断5種（問題クラス分類 / 8軸評価 / 廃棄判定 / 昇華可能性評価 / adversarial-review 発動条件判定）ごとに agentdev_jev evaluate を実行し、Jev 結果と confidence を情報として LLM が最終判断を確定
- **接続情報**: provider=vercel-ai-gateway / requestedModel=typesafe-ai/jev / resolvedModel=typesafe-ai/jev
- **判断単位ごとの結果と llmTreatment**:
  1. 問題クラス分類: Jev は4組すべて「同一問題クラス」（cls-junction 0.57・cls-stale-state 0.82・cls-parallel-boundary 0.77・cls-stdevidence 0.65）→ LLM 最終判断と同一、**unchanged**（confidence 0.7025）
  2. 8軸評価: Jev の水準は発生件数軸でエントリ数基準と不整合（1件クラスタに水準3-4を示唆）等 → 軸定義の点数表に従い LLM が水準を修正、**corrected**（confidence 0.5838）
  3. 廃棄判定: Jev は K7=cat4・K8=cat4・K9=deferred を示唆 → K7/K8 は既存手順の fix gap として cat5、K9 は3系統発生を根拠に cat5 へ修正（K2=cat4・K4=cat5・K6=cat5・K10=cat1・K12=cat5・E6=deferred は Jev と同一）、**corrected**（confidence 0.7711）
  4. 昇華可能性評価: Jev は K9=false を示唆 → 同上の根拠で true に修正（K4=true・K12=true は同一）、**corrected**（confidence 0.5933）
  5. adversarial-review 発動条件判定: Jev true (0.94) → 発動と判断、**unchanged**
- **観測**: 1実行1JSON で .agentdev/jev-observations/ に保存（observation_write は本レポート書込後に実施）

## STEP-5 自律確定記録

REQ-003-055/056・learning-promote Design「自律確定の判定位置とHITLフォールバック」に従い、全16問題クラスの処置を取得可能な根拠から一意に確定できるかを判定した。

- **適用した判定基準**（STEP-4 対論で明文化・合意）: (a) 反映先と修正内容が実在文書の特定節まで確定し、(b) 処分区分が根拠（出現回数・既存対策照合・fix gap の具体性）から一意に導け、(c) ユーザーの価値判断・優先順位を要しない場合に自律確定。出現1件でも「既存手順の記述欠落が完了ゲート等の機械判定の信頼性を損ない反映先が確定する」場合は promote、「正規対処が既に完備し残りが任意強化の提案」場合は deferred
- **HITL 移送条件の照合**（REQ-003-055）: ユーザー固有の目的・価値観・優先順位を要する事項=なし / 正規情報源間の未解決矛盾=なし / 判断に必要な情報不足=なし / 対論型レビューで未解決の本質的争点=0件（STEP-4 記録）/ 要件・仕様の対象範囲の新規決定=なし（全て candidate として req-define へ引き渡し）/ 既存の明示的な安全境界を要求する操作=なし（削除・移動なし）

| 問題クラス | 判定結果 | 主要根拠 | HITL 不要理由 |
|---|---|---|---|
| K1 issue_list 全件走査 | duplicate | REQ-092-001/003 が呼出側規律と contingency を要件化 | 既存 REQ の包含範囲は条文突合で機械的に確認可能 |
| K2 PowerShell stdout CRLF | promote（category 4） | 既存知識文書がファイルI/O系のみで本経路を未カバー、回避策は実証済み | 知識化の要否は coverage 突合で決まり、価値判断を含まない |
| K3 worktree checker 環境由来 NG | duplicate | checker-execution-contracts / qg-4 / worktree-operations が同等手順を所有し本件も契約どおり処理済み | 契約包含の確認は条文突合で完結 |
| K4 bun test stderr 証跡 | promote（category 5） | 既存契約あり・再発（application miss）・修正内容はサンプル追記 | application miss の実証（2回発生）で処分が一意 |
| K5 checker CJS/ESM 経路 | duplicate | ESM 互換性要件が契約面を包含、deferred case 2799 が事実記録済み | 同上 |
| K6 旧 durable state 疑似 fail | promote（category 5） | qg-4 に baseline 系追随差の明示と対照実行手順が未記載、2系統発生 | fix gap の位置と内容が特定済み |
| K7 junction 処理系差分 | promote（category 5） | worktree-operations.md 例が node / bash 経由で転記不能、2件発生で実証 | 同上 |
| K8 並行委譲作業境界 | promote（category 5） | 3系統の同種発生、前置検査の明文化が未整備 | 出現回数と gap で一意 |
| K9 harness 委譲接合 | promote（category 5） | harness-delegation.md に起動不能時の接合判定・記録経路が未記載、deferred L-004/L-010 の再評価条件成立（3系統） | 配置先が契約で指定済み・Jev の deferred 示唆は STEP-4 で反証済み |
| K10 Jev 候補完備性 | promote（category 1） | STEP-3 質問形式表の候補欠落を実ファイル検証、7判断の是正依存を実証 | 候補として昇華経路へ渡すのみで REQ 化判断は下流 |
| K11 分割③ plugins | duplicate | qg-4 分割③環境差節が同等内容を所有 | 条文突合で完結 |
| K12 backslash パス破損 | promote（category 5） | 該当節に表記注意が欠落、完了ゲート誤判定に直結 | fix gap の具体性で一意 |
| K13 二重宣言 | duplicate | traceability SKILL.md 優先規則が検出・解消方向を規定済み | 同上 |
| AGENTDEV_GH_REPO（E6） | deferred | 出現1件・正規対処（guide+launcher 設定）完備・残余は任意強化 | 判定基準 (a)〜(c) を適用すれば一意 |
| checker 完結実証（E8） | deferred | 観察・再発条件なし・既存契約の実証記録 | 同上 |
| IR-055 count 集約（E9） | deferred | 観察・記録様式候補は軽微かつ単発 | 同上 |

- **確定内訳**: 自律確定 16件（promote 8問題クラス / duplicate 5問題クラス / deferred 3エントリ）・HITL 移送 0件
- **破壊的変更**: なし（本実行は不可逆処理を実行しない）

## STEP-5 判定結果集計

- **promote**: 9エントリ（8問題クラス）
- **duplicate**: 5エントリ（問題クラス1・3・5・11・13。STEP-6 prune 候補）
- **deferred**: 3エントリ（E6・E8・E9。living pool 維持）
- **rejected**: 0件
