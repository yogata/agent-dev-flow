# 評価レポート

## メタデータ

- **実行日時**: 2026-11-15（backlog-auto stage 2 learning 系統・3ライン並行の learning-promote ライン）
- **基準 revision**: cf7ac3729（run 開始時 main HEAD・STEP-4 review 実施時点の HEAD は並行レーンの inspect-promote commit e2a30d283・learning 対象ファイルへの変更なし実測）
- **対象エントリ数**: inbox 97 件（見出し単位・1742 行実測）、deferred 295 件（見出し 299 行のうち 4 行は様式・説明見出し。実行前実測）、promoted/ 0 件（.gitkeep のみ・空実測）
- **問題クラス数**: 60（promote 13 クラス 37 エントリ・duplicate 7 クラス 7 エントリ・deferred 統合追記 6 クラス 12 エントリ・deferred 新規移動 4 統合クラス 41 エントリ〔Q-B 8・R-a 3・R-b 2 + 単発 28〕・rejected 0。37+7+12+41 = 97 で inbox 全件帰属と整合〔STEP-4 review 反映で突合・初版の 96≠97 不一致を解消〕）
- **Jev**: 処分区分 1 評価（20261115T110120Z-02ae・25 問・confidence 1・暫定と 22 問一致・3 問（PE/PF/PI）で evaluator が project knowledge 優勢〔0.92〜0.99〕と暫定 promote が分岐 → LLM 最終判断は promote 維持（既存恒久手順・knowledge・Design 節の gap を実測で確認済みであり docs/designs・配布 reference・既存 knowledge への補記で完結し、project knowledge の新規保存ではなく既存対策の更新に該当）→ semantic_disagreement で記録・observation_write 成功）・8軸評価 1 評価（20261115T110326Z-16c9・70 問〔10 クラス×7軸〕・confidence 1・evaluator value は scale index（0 起）で返却（前回 run 記録と同一）・分布 argmax 水準と最終判断（水準番号 = index+1）は PI-reflect の 1 問を除き一致・PI-reflect は evaluator value 2〔水準3〕に対し分布 argmax 4〔明確 0.51〕と不整合 → LLM 最終判断は水準 4 で semantic_disagreement 記録）・**observation_write の index 形式解決**: score 形式の finalResult は value を scale index（0 起）そのまま送信することで検証を通過（前回 run で両形式が失敗した既知問題の今回解決・初回の水準番号形式は invalid_input〔差異必須検査〕で失敗。observation への記録値は index・本レポートへの記録値は水準番号〔index+1〕で同一水準を指す）・昇華可能性 1 評価（20261115T110544Z-a505・10 問・全問 false〔恒久契約への昇華なし・0.84〜0.92〕・LLM 一致・observation_write 成功）・**review 反映による再評価**（STEP-2 戻しループ）: 処分区分 1 評価（20261115T112322Z-ae77・3 問・全問「5 既存対策の更新」で暫定一致・confidence 1・observation_write 成功）・8軸評価 1 評価（20261115T112406Z-fc8f・21 問〔3 クラス×7軸〕・confidence 0.99・PK-cost のみ evaluator value 3〔水準4〕に対し分布 argmax 5〔良い 0.51〕と不整合 → 最終判断は水準 5（判定根拠と分布 argmax に基づく）で semantic_disagreement 記録・他の 20 問は一致・observation_write 成功）・昇華可能性 1 評価（20261115T112434Z-9936・3 問・全問 false〔0.63〜0.74〕・LLM 一致・observation_write 成功）
- **旧 report**: 2026-11-07 実行分（Case #3928 系以降 67 件対象・promote 1〔P-a〕の promoted は backlog-review で消費済み〔promoted/ 空・状態表契約どおり〕）のため本レポートで上書き置換
- **前回 run との差分**: 前回 run（2026-11-07）以降に capture された 97 見出し（2026-11-07 〜 11-15・Case #3961〜#4069 系・WAVE2/OU 系を含む）。deferred.md は前回 run 終了時から +24 見出し（295 実エントリ実測）

## 判定基準

処分はスコアのみで決めず、既存恒久対策の現状、実害、情報の自足性、昇華可能性、既存プールとの関係を併せて評価した。十分な恒久対策により既に網羅されているものだけ duplicate とし、deferred pool に似た記録があるだけでは duplicate にしない（前回 run と同一基準）。promote（既存対策の更新）は既存恒久手順の具体的 gap を実測（grep・ファイル読取・コード読取）で確認できた場合に限った。**既存対策照合の対象は恒久契約（docs/designs・requirements・decisions）に限らず、配布 reference（src/common/skills/*/references/）、docs/knowledge/、scripts README・tests fixture を含む**（前回 run で明文化済みの基準を継承・STEP-4 review で fixture 標本の不整合を promote 対象に含める形で適用確認）。機構整理候補（script・REQ/Design 契約の実装変更判断を含むもの）は learning-promote が実現先を先取りしないため deferred 維持。Decision 候補は禁止条件ゲート（agentdev-decision-guidelines 除外基準）で全単位除外した。

## STEP-1 読込・正規化

- inbox 97 エントリ（1742 行）を読込・正規化。全エントリが新 13 フィールド形式（一部フィールド名の表記ゆれ「ユーザー確認有無」「Decision/REQ/spec影響」あり・解析時に正規名へ対応づけ。元ファイル不変・旧 5 フィールド形式の出現なし）。2026-11-08 付近と 2026-11-13 付近に連続 --- 区切りの重複 2 箇所を検出したがエントリ数への影響なし（空ブロック）
- deferred インデックススキャン: 見出し 299 行（実エントリ 295 件）を grep on read で取得。タグ統計（上位: #case-run 11・#verification 10・#case-close 8・#integrity 7・#bun 5）と候補本文読込 9 箇所（Q4 統合先 L4381/L4399〔bun install --frozen-lockfile 前提〕・Q6 統合先 L4626〔Windows /tmp リダイレクト ENOENT〕・対照救済既存エントリ L4603〔check_integrity gate 既存債務〕・bun 標準 API L5784/L5794・Q38 twin L5481/L5834・Q14 traceability L5498-5506・Q13 pin L5755-5761・Q48 ADF-COVERS L3896・Q2 配布物 REQ ID L4556）。全面読みフォールバック対象エントリなし

## 問題クラス一覧と処分判定

軸順: 発生件数 / 影響度 / 横展開性 / 反映先明確度 / 自動化適性 / 再利用性 / 再発可能性 / 費用対効果。加重合計は満点 40。発生件数軸は deterministic 境界により機械導出（1件=1・2件=2・3-4件=3・5-7件=4・8件以上=5）。スコア記録は水準番号（Jev observation には scale index〔0 起〕で記録・前回 run 記録規律と同一）。P-k〜P-m は STEP-4 review の accepted finding 反映で追加したクラス（再評価観測 20261115T112322Z-ae77・20261115T112406Z-fc8f・20261115T112434Z-9936）。

### P-a（promote・既存対策の更新）: worktree remove 前の依存整備物掃除前置の明記（4 エントリ・33/40）

- **根本原因**: Windows 環境で git worktree remove の物理削除段階が node_modules/vendor 等の深いパス・大量 gitignore 対象ファイル（MAX_PATH・ファイルロック）により失敗し、メタデータ解除は先行完了するため「登録解除済み + 残骸ディレクトリ残存」の半分状態が残る
- **再発条件**: 依存整備済み（node_modules・vendor 生成済みまたは vendor 伝播済み）worktree の remove 実行
- **予防策（提案段階・実現先確定は req-define）**: worktree-operations.md「1.5 remove 前退避ファイル掃除」節の対象に依存整備物（node_modules・vendor 等 gitignore 対象・明示パス指定）を含める前置明記
- **8軸評価**: 33/40（発生3〔機械導出・4件〕・影響3・横4・反映5・自動5・再利用4・再発4・費用5。Jev 20261115T110326Z-16c9: 全軸分布 argmax 水準と最終判断一致）
- **推奨処分案**: **promote（既存対策の更新）**。実測 gap: worktree-operations.md L395-401「1.5 remove 前退避ファイル掃除」節の対象は「.agentdev/tmp/ 配下の checker stdout / stderr 分離退避、検査入力 JSON 等の一時ファイル」であり依存整備物の文言は不在（grep 実測・2026-11-15）。**STEP-4 review 訂正（Stream A finding 受入）**: 初版に記載した「L441 フォールバック節は Filename too long 未被覆」は不正確であり訂正する — worktree-operations.md L458-470（MAX_PATH 起因の部分削除残存時のフォールバック）と L472-488（Filename too long 起因の robocopy /MIR フォールバック・LongPathsEnabled 確認前置・実測根拠付き）に回復手順が実在するため、半分状態検出時の掃除・照合手順は被覆済み。**本クラスの実質 gap は「1.5 節の掃除対象に依存整備物が含まれない」前置明記のみ**に限定される（回復手順面は既存で完結）。出現 4 件（#3967・#3969・#3970・#4049）・gap 分類: fix gap（掃除対象の依存整備物拡大の欠落）
- **既存対策照合**: 対策あり（大部分・回復手順は実在）・ギャップ: fix gap（1.5 節の掃除対象に依存整備物が含まれない前置の欠落）
- **エントリ一覧**: 2026-11-13 worktree remove Filename too long 残骸（Case #4049）・2026-11-08 bun install 実施済み worktree remove 部分失敗（Case #3967）・2026-11-08 textlint vendor 伝播済み worktree remove 部分失敗（Case #3969）・2026-11-08 git worktree remove 半分状態（Case #3970）

### P-b（promote・既存対策の更新）: close_mechanical_steps CLI runner deleteFile 欠落の手動回収手順標準化（4 エントリ・33/40）

- **根本原因**: close_mechanical_steps.ts CLI main() の runner 構築に deleteFile が未提供（removeFile は存在）で、reclamation 実行面（reclaimCloseAcceptanceRecord の I/O 注入）が構成できず恒常 fail-closed 報告になる
- **再発条件**: reclamation 指定の post-merge CLI 実行（全 case-close）
- **予防策（提案段階・実現先確定は req-define）**: scripts/README.md へ手動回収経路（実在確認 → 証跡退避 → 明示パス削除 → 不存在確認）の標準手順明記、および runner への deleteFile 注入追加（removeFile と同一の fs 実装で足りる）の候補保持
- **8軸評価**: 33/40（発生3〔機械導出・4件〕・影響3・横4・反映5・自動4・再利用4・再発5・費用5。Jev 同観測: 全軸一致）
- **推奨処分案**: **promote（既存対策の更新）**。実測 gap: close_mechanical_steps.ts L1847-1890 main() runner 構築をコード読取実測で deleteFile 不在確認（exists・run・readTextFile・writeTextFile・mkdirRecursive・removeFile・gitCommonDir・sleep の 8 メソッドのみ。L103 に runner 側 optional deleteFile 型・L544 に CloseAcceptanceRecordReclamationIo の必須 deleteFile・L1327-1330 に fail-closed エラー実装を確認・STEP-4 review で反証該当なし）。scripts/README.md に reclamation・回収手順の記載不在を grep 実測で確認（prNumber 0 の説明 L7 のみ）。出現 4 件（#3966・#3969・#4002・#4054）・gap 分類: fix gap（README 手動回収手順の不在）
- **既存対策照合**: 対策なし（README に手順不在）・ギャップ: fix gap（手動回収手順の標準明記不在）
- **エントリ一覧**: 2026-11-08 CLI deleteFile 欠落（Case #3966）・2026-11-08 post-merge reclamation 再観測（Case #3969）・2026-11-12 deleteFile 未提供再観測（Case #4002・Case #3989 系）・2026-11-15 CLI runner deleteFile（Case #4054）

### P-c（promote・既存対策の更新）: issue_close freshness 順序契約の STEP-5 手順明記（3 エントリ・32/40）

- **根本原因**: 終了判定記録 targetRevision と Issue updated_at の完全一致検査と STEP-5 記録反映順序（完了記録コメント投稿 → 本文更新 → issue_close）の組合せで、本文更新後に revision 進行で issue_close が fail-closed 拒否される
- **再発条件**: 判定確定後に Issue 更新（コメント・本文）を挟む全 close
- **予防策（提案段階・実現先確定は req-define）**: cleanup-and-capture.md STEP-5 へ「完了記録反映後の機械工程冪等再実行（fresh revision で記録再生成）→ issue_close（間に書込みを挟まない）」の順序明記
- **8軸評価**: 32/40（発生3〔機械導出・3件〕・影響3・横4・反映4・自動5・再利用4・再発4・費用5。Jev 同観測: 全軸一致）
- **推奨処分案**: **promote（既存対策の更新）**。実測 gap: cleanup-and-capture.md STEP-5 の手順（L40-44）をファイル読取実測し、fresh revision での機械工程再実行の文言が不在を確認（L43 の「受入評価結果の確認」は報告 JSON の結果確認であり再実行手順でない。Resume-Idempotency 節も OPEN/CLOSED 判定のみ・STEP-4 review で反証該当なし）。出現 3 件（#3966・#3989・#4054）・gap 分類: fix gap（STEP-5 手順の再実行前置不在）
- **既存対策照合**: 対策なし（手順内に再実行前置不在）・ギャップ: fix gap
- **エントリ一覧**: 2026-11-08 Issue 本文更新 targetRevision 無効化（Case #3966）・2026-11-12 完了記録反映で revision 進行（Case #3989）・2026-11-15 issue_close close-acceptance 完全一致（Case #4054）

### P-d（promote・既存対策の更新）: worktree typecheck の bun install --frozen-lockfile 前置明記と bun run PATH 解決補記（3 エントリ + 前回 deferred 2 件統合・33/40）

- **根本原因**: worktree の node_modules 未伝播で bun run --cwd の .bin 解決・tsc 型解決が失敗する。--frozen-lockfile 前置の文言が恒久手順に不在
- **再発条件**: worktree 新規作成または node_modules 未整備 package で bun run --cwd typecheck 実行
- **予防策（提案段階・実現先確定は req-define）**: worktree-operations.md「bun test 実行の環境前提」節への bun install --frozen-lockfile 前置明記、bun run --cwd の PATH 解決要件と node_modules/.bin/tsc 直接起動フォールバックの補記（--frozen-lockfile 規律の正規配置先が QG-4 側になる可能性を反映先候補として保持・STEP-4 review の指摘を記録）
- **8軸評価**: 33/40（発生4〔機械導出・統合後 5 件〕・影響3・横4・反映4・自動5・再利用4・再発4・費用5。Jev 同観測: 全軸一致）
- **推奨処分案**: **promote（既存対策の更新）**。実測 gap: worktree-operations.md L138-176 に bun install 前置・tsc 型解決前提（L145）・整備手段・選択基準が実在するが --frozen-lockfile 文言は不在（前回 2026-11-07 grep 実測 + 今回再確認 + STEP-4 review で QG-4 側を含む src/common/skills 配下の frozen-lockfile grep 0 件再確認）。bun run --cwd の .bin 解決要件と node_modules/.bin/tsc 直接起動フォールバックの補記は不在。deferred L4381-4399（前回統合追記済み・「次回 promote 判定の実測前置を完了済み」と記録）を統合先とし、今回で promote 判定成立。出現 5 件（統合後・Case #3928×2・#4005・#3970・#3971）・gap 分類: fix gap（--frozen-lockfile 規律明記の欠落）
- **既存対策照合**: 対策あり（大部分）・ギャップ: fix gap（--frozen-lockfile 明記・bun run PATH 解決補記）
- **エントリ一覧**: 2026-11-12 bun run --cwd tsc node_modules 解決失敗（Case #4005）・2026-11-08 worktree bun install 前置後 tsc 依存解決（Case #3970）・2026-11-08 リポジトリ内作業領域 tsc PATH 解決（Case #3971）+ 前回 deferred 統合分 2 件

### P-e（promote・既存対策の更新）: flake・並列負荷・依存生成順序由来分類の knowledge 補強（8 エントリ・34/40）

- **根本原因**: 並列負荷・タイミング系・spawn 系・キャッシュ競合・依存生成順序による非決定性 fail（flake）の由来分類規律が既存知識に不在（3分割同時並列の負荷 flake 11 件・plugins 分割 full-run flakiness・bun キャッシュ競合・vendor 生成前並列起動連鎖 fail・gate 未定義 exit 9 等）
- **再発条件**: 並列実行・負荷・キャッシュ共有・依存生成と並列起動の環境で bun test / gate 実行
- **予防策（提案段階・実現先確定は req-define）**: 既存知識 worktree-environment-fail-classification.md へ flake・負荷由来分類観点の追記
- **8軸評価**: 34/40（発生5〔機械導出・8件〕・影響3・横5・反映5・自動3・再利用4・再発4・費用5。Jev 同観測: 全軸一致）
- **推奨処分案**: **promote（既存対策の更新）**。実測 gap: docs/knowledge/worktree-environment-fail-classification.md の全文をファイル読取実測し「flake」「負荷」「並列実行」の記載が不在を grep 実測で確認（由来分離 3 手手段〔main root 対照・baseline 再現・同一条件実行〕は実在）。**STEP-4 review 反映（Stream A minor 受入）**: QG-4「fail 由来分類」節（qg-4-final-acceptance.md L394-431・4分類〔変更由来/pre-existing/実行形態由来/不明〕・単独/フル再実行証跡手順・baseline 追随差3点対照）と windows-bun-test-spawn-timeout-classification.md L21（フル suite 負荷が要因の fail は main HEAD 対照実行）が既存被覆として実在するため、本クラスの実質 gap は「flake（非決定性）という語彙と負荷由来という分類ラベルの不在」「並列実行・キャッシュ競合・依存生成順序の変異列挙」「独立再観測回数記録・依存生成完了後の直列実行規律」に限定され、追記はこの差分に対して行う。出現 8 件・gap 分類: fix gap（flake 語彙・変異列挙の収録欠落）。既存対策照合は「対策あり（大部分）」へ修正。Jev 処分区分評価で evaluator が project knowledge 優勢（0.99）を返したが、既存 knowledge 文書（既存対策）への補記で完結するため既存対策の更新を維持（semantic_disagreement 記録済み）
- **既存対策照合**: 対策あり（大部分・STEP-4 review 反映で修正）・ギャップ: fix gap（flake 語彙・負荷分類ラベル・変異列挙の収録欠落）
- **エントリ一覧**: 2026-11-07 worktree bundle 整備状態依存 execution-form fail（Case #3961）・2026-11-08 bun test 統合テスト系 worktree timeout（Case #3968）・2026-11-12 bun キャッシュ競合フレーク疑い（Case #4004）・2026-11-12 textlint gate exit 9 spawn（Case #4004）・2026-11-12 3分割同時並列 flake 11件（Case #4002）・2026-11-13 plugins 分割 full-run flakiness（Case #4026）・2026-11-13 fail クラス対照（Case #4026）・2026-11-15 vendor 生成前並列起動連鎖 fail（Case #4068）

### P-f（promote・既存対策の更新）: checker 実行ランタイム選択規律（vendored bundle → bun）の Design 補強（2 エントリ・30/40）

- **根本原因**: vendored bundle（blob: URL 動的 import）を含む checker ラッパを node --experimental-strip-types で実行すると既定 ESM loader が blob: import を fail-closed ブロックし検査不能になる。checker 依存 API と実行経路の対応規律が契約に不在
- **再発条件**: node 経路で vendored bundle 含有 checker を実行
- **予防策（提案段階・実現先確定は req-define）**: checker-execution-contracts.md「安定実行経路」節へ実行ランタイム選択規律（vendored bundle 含有 → bun・node は vendor 非依存 checker 向け）と checker 依存 API 別経路対応の追記
- **8軸評価**: 30/40（発生2〔機械導出・2件〕・影響3・横4・反映4・自動5・再利用4・再発3・費用5。Jev 同観測: 全軸一致）
- **推奨処分案**: **promote（既存対策の更新）**。実測 gap: checker-execution-contracts.md L183-229 をファイル読取実測し、L189-194 ESM 互換性要件に「vendored bundle の blob: URL は node loader でブロック」規律が不在・L229 に「Bun ランタイム API 依存 checker は bun 経由」は実在するが vendored bundle 規律は不在を grep 実測で確認（全文で blob:・vendored の文言 0 件・STEP-4 review で再確認）。出現 2 件（#3970・#3988）・gap 分類: fix gap（実行ランタイム選択規律の欠落）
- **既存対策照合**: 対策あり（部分的）・ギャップ: fix gap
- **エントリ一覧**: 2026-11-08 textlint ラッパ node blob: URL fail（Case #3970）・2026-11-10 checker 安定実行経路 bun 固有 API（Case #3988）

### P-g（promote・既存対策の更新）: contract-state-residue 入力構成規律（範囲導出除外明示・観測形確認前置）（3 エントリ・31/40）

- **根本原因**: pre-merge 機械工程の contract-state-residue-check 入力で、(a) 範囲導出に終了判定記録（close-acceptance）を含めると機械工程自己記録が未コミット検出され fail、(b) humanConfirmedPaths を省略形ディレクトリ接頭辞で指定すると untrackedListing のファイル形観測と一致せず fail
- **再発条件**: 機械工程入力の contractStatePaths に close-acceptance を含める・観測形確認なしで path 形式を仮定する
- **予防策（提案段階・実現先確定は req-define）**: case-close SKILL.md 契約状態記録検査節へ「終了判定記録は範囲導出から除外する明示」と「humanConfirmedPaths 指定前の untrackedListing 観測形（省略形 vs ファイル形）確認前置」を補記
- **8軸評価**: 31/40（発生3〔機械導出・3件〕・影響3・横4・反映4・自動5・再利用4・再発3・費用5。Jev 同観測: 全軸一致）
- **推奨処分案**: **promote（既存対策の更新）**。実測 gap: case-close SKILL.md L84-95 をファイル読取実測し、「範囲導出は意味判断としてモデルが担当」（L88）・「humanConfirmedPaths の path と確認根拠 basis の実体」（L91）は実在するが終了判定記録の範囲外明示と観測形一致要件が不在を確認（STEP-4 review で反証該当なし）。出現 3 件（#3969・#3968・#3964 Epic close）・gap 分類: fix gap（範囲導出の終了判定記録除外明示不在）
- **既存対策照合**: 対策あり（大部分）・ギャップ: fix gap
- **エントリ一覧**: 2026-11-08 contractStateCheck close-acceptance 含める誤り（Case #3969）・2026-11-08 契約状態記録パス終了判定記録除外（Case #3968）・2026-11-08 humanConfirmedPaths 観測形一致（Epic #3964）

### P-h（promote・既存対策の更新）: yomiyasu lint 一時ファイル配置指示と書込み guard 境界の整合（2 エントリ・32/40）

- **根本原因**: lifecycle「文章品質・書込み規約」節の yomiyasu lint 一時ファイル配置指示（リポジトリ外の一時ディレクトリ等）が同一文書内の textlint 書込み guard 実効範囲（project root 外 fail-closed）と矛盾し、指示に従うと guard 拒否が毎回発生
- **再発条件**: lifecycle lint 手順の指示どおりリポジトリ外へ一時ファイル作成する工程
- **予防策（提案段階・実現先確定は req-define）**: lifecycle SKILL.md L158 の配置指示を「project root 内の gitignore 対象領域（.agentdev/tmp/ 等）」へ統一（scripts/README.md の配置指針と整合）
- **8軸評価**: 32/40（発生2〔機械導出・2件〕・影響3・横4・反映4・自動5・再利用4・再発5・費用5。Jev 同観測: 全軸一致）
- **推奨処分案**: **promote（既存対策の更新）**。実測 gap: lifecycle SKILL.md L158（「検査専用本文ファイルを非永続領域（リポジトリ外の一時ディレクトリ等）に新規作成」）と L172-183（「プロジェクトルート外パスへの書込み（いずれも fail-closed）」・「拒否後の回復はプロジェクトルート内の実行時作業領域へ変更」）をファイル読取実測し、同一文書内の指示矛盾を確認（STEP-4 review で反証該当なし）。出現 2 件（#4054・#4069）・gap 分類: fix gap（配置指示文言の guard 境界不整合）
- **既存対策照合**: 対策あり（部分的・同文書内の回復規定）・ギャップ: fix gap（指示文言の統一欠落）
- **エントリ一覧**: 2026-11-15 yomiyasu lint 一時ファイル guard 衝突（Case #4054・case-open）・2026-11-15 yomiyasu lint 一時ファイル配置（Case #4069）

### P-i（promote・既存対策の更新）: Windows パス形式・計測規律の knowledge 補強（4 エントリ・32/40・STEP-4 review 反映で修正）

- **根本原因**: Windows 環境で bash・Windows バイナリ（git/bun/node）間のパス形式解釈差（cygpath 変換なし TEMP・bun install --cwd 相対パス・backslash 形 cwd での bun run モジュール解決失敗・リダイレクト/退避先の相対パスずれ）で見かけの失敗が発生
- **再発条件**: bash から Windows バイナリへパスを直接渡す実行
- **予防策（提案段階・実現先確定は req-define）**: 既存 knowledge windows-checker-msys-path-argument.md への統合追記または新規 knowledge 文書として cygpath -m・bun install --cwd 相対パス失敗時の絶対パスフォールバック・backslash 形 cwd・リダイレクト先絶対パスの変異を整理
- **8軸評価**: 32/40（発生3〔機械導出・STEP-4 review 反映で 4 件に修正・3-4件=3〕・影響3・横5・反映4・自動4・再利用4・再発4・費用5。Jev 同観測: PI-reflect のみ evaluator value 2〔水準3〕に対し分布 argmax 4〔明確 0.51〕と不整合 → 最終判断は水準 4 で semantic_disagreement 記録）
- **推奨処分案**: **promote（既存対策の更新）**。実測 gap: 既存 knowledge windows-checker-msys-path-argument.md（--root MSYS 破損と backslash 引数の escape 解釈を対象・全文確認実測）と checker-execution-contracts.md L196-198（絶対パス標準は実在）を確認し、今回の 4 変異（cygpath・bun install --cwd 相対・backslash cwd・退避リダイレクト絶対パス）が既存文書に不在を実測確認。**STEP-4 review 反映（Stream A major 受入）**: (1) 初版に含めた node -e エスケープ変異（Case #3971）は既存知識 windows-git-bash-inline-content-corruption.md 機構1（バックスラッシュを含む正規表現リテラルのシェル引数経由 node -e での変質・Case #3142/PR #3154）で明示被覆されているため本クラスから除外し dup-7（duplicate）へ再分類 (2) 初版エントリ一覧に含めた Case #3969（MSYS パス bun 起動再観測）は dup-1 に帰属済みのため本クラスから除外（二重帰属解消）。出現 4 件（#3967・#3972・#3988・#4054）・gap 分類: fix gap（パス形式変異の収録欠落）
- **既存対策照合**: 対策あり（部分的）・ギャップ: fix gap
- **エントリ一覧**: 2026-11-08 POSIX パス渡し cygpath（Case #3967）・2026-11-08 退避ファイル絶対パス指定（Case #3972）・2026-11-10 bun install --cwd 相対 ENOENT（Case #3988）・2026-11-15 bun run backslash cwd（Case #4054）

### P-j（promote・既存対策の更新）: case-open 円等検出の複数トークン・二段検証（1 エントリ・31/40）

- **根本原因**: case-open STEP-2 円等検出で draft topic_slug 単独の search トークンでヒット 0 件と判定し、既存 Root Case・設計 PR を重複作成した（GitHub search/issues は in:title tokenized match で topic_slug が既存 Root Case タイトル・本文に含まれない書式では空振りする）
- **再発条件**: draft topic_slug が既存 Root Case タイトル・本文に含まれない書式で起票されている場合の topic_slug 単独検索
- **予防策（提案段階・実現先確定は req-define）**: 円等検出は topic_slug + 主題語 + REQ 番号の複数トークン検索とし、ヒット 0 件時に主題語・REQ 番号で再検索する二段検証を STEP-2 手順へ追加（definition-pr-and-idempotency.md STEP-2 節・issue-operation-safety.md 選択性指針の反映先候補を保持）
- **8軸評価**: 31/40（発生1〔機械導出・1件〕・影響4・横4・反映4・自動5・再利用5・再発3・費用5。Jev 同観測: 全軸一致）
- **推奨処分案**: **promote（既存対策の更新）**。実測 gap: issue-operation-safety.md L63-65「search トークンの選択性指針」をファイル読取実測し、「state と role 併用して母集団を先に限定」は実在するがヒット 0 件時の主題語・REQ 番号再検索規律が不在を確認（重複 Root Case #3989・重複 PR #3990 の実害・tree 差分 0 件機械証明済み・STEP-4 review で definition-pr-and-idempotency.md L100-114 も含め反証該当なし）。出現 1 件だが gap 鮮明・実害大（Case #3988）・gap 分類: fix gap（二段検証規律の欠落）
- **既存対策照合**: 対策あり（部分的）・ギャップ: fix gap（ヒット 0 件時再検索規律の欠落）
- **エントリ一覧**: 2026-11-10 case-open 円等検出 topic_slug 単独（Case #3988/#3989/#3990/#3991）

### P-k（promote・既存対策の更新・STEP-4 review 反映で追加）: 機械受理基準標本 fixture の分割番号正規形整合（1 エントリ・25/40）

- **根本原因**: close_mechanical_steps.test.ts の機械受理基準標本（completeMachineAcceptanceRecord）の分割番号割当（①=src 側・②=integrity suite・③=plugins 系）が QG-4 正規形（①=integrity suite・②=src 側・③=plugins 系）と入れ替わっている。fixture は機械受理基準の記録実体の規範標本として機能するため、標本と正規形の不一致は標本を参照する工程で分割番号の誤解釈を生み得る
- **再発条件**: 標本 fixture を参照して分割番号を解釈する工程・fixture を流用する新規実装
- **予防策（提案段階・実現先確定は req-define）**: fixture 標本値を QG-4 正規形へ整合（fixture 変更とテスト期待値の同時更新）
- **8軸評価**: 25/40（発生1〔機械導出・1件〕・影響2・横3・反映4・自動4・再利用3・再発3・費用5。Jev 再評価 20261115T112406Z-fc8f: PK-cost のみ evaluator value 3〔水準4〕に対し分布 argmax 5〔良い 0.51〕と不整合 → 最終判断は水準 5 で semantic_disagreement 記録・他の 6 軸は一致）
- **推奨処分案**: **promote（既存対策の更新）**。実測 gap（STEP-4 review Stream B が実測で欠陥再現）: qg-4-final-acceptance.md L320-324・L328-331（①=integrity suite `bun test ./.opencode/skills/<integrity-detector-skill>/scripts/`・②=src 側 `bun test ./src/`・③=plugins 系）に対し、close_mechanical_steps.test.ts L445-470 の fixture は①=`bun test ./src/`（QG-4 の②の対象）・②=`bun test ./.opencode/skills/repo-agentdev-integrity/scripts/`（QG-4 の①の対象）・③は一致 — 分割①②の対象が入れ替わり。修正は fixture 標本値の正規形整合（fixture+テスト期待値の同時更新）で完結し恒久契約変更を含まない。出現 1 件だが gap 鮮明・機械受理標本の規範性に影響（Case #4054・OU-001 で発見・Capture 提案申告）・gap 分類: fix gap（標本 fixture の正規形不整合）
- **既存対策照合**: 対策なし（fixture と正規形文書の整合規律は不在）・ギャップ: fix gap
- **エントリ一覧**: 2026-11-15 close_mechanical_steps fixture 分割番号入れ替わり（Case #4054・OU-001）

### P-l（promote・既存対策の更新・STEP-4 review 反映で追加）: 並行実行環境の untracked 掃除所有者確認規律（1 エントリ・32/40）

- **根本原因**: 並行 case-auto run が共有 main 作業ディレクトリへ書き込む untracked ファイル（Jev 観測等）を自 run の一時物と誤判定して削除した。削除と所有者確認を同一 bash コマンドへ連結したため、確認結果を踏まえた中止判断が実行序列に入らなかった
- **再発条件**: 並行 case-auto run が稼働する環境で、main 作業ディレクトリの untracked ファイルを integrity NG 対応として掃除する場合
- **予防策（提案段階・実現先確定は req-define）**: worktree-operations.md の cleanup 系規律へ「untracked ファイル削除判定は『内容確認 → 中止判断 → 削除実行』を別 bash コマンドに分離」「並行環境では観測メタデータ（workflow・subject 等）で所有 run を照合する」を追加
- **8軸評価**: 32/40（発生1〔機械導出・1件〕・影響4・横4・反映4・自動5・再利用5・再発4・費用5。Jev 再評価 20261115T112406Z-fc8f: 全軸一致）
- **推奨処分案**: **promote（既存対策の更新）**。実測 gap（STEP-4 review Stream B が実測確認）: worktree-operations.md 全文 grep で「所有者確認」規律は不在（現行 cleanup 規律は「追跡済み削除禁止」「未追跡のみ対象」「.agentdev/tmp 列挙削除」「stash の他セッション配慮 L375」のみ・ファイル削除への所有者確認適用は不在）。並行 run の Jev 観測 3 件誤削除・復元不能の実害（Case #4005・inbox 原文で「所有者確認（観測メタデータ照合）の前置と、確認コマンドと削除コマンドの分離規律の明文化判断」を申告）。反映先は worktree-operations.md cleanup 系節への規律追記で完結し恒久契約変更を含まない。出現 1 件だが影響大・gap 鮮明・gap 分類: fix gap（所有者確認・コマンド分離規律の欠落）
- **既存対策照合**: 対策あり（部分的・stash の他セッション配慮のみ）・ギャップ: fix gap（untracked 削除の所有者確認・分離規律不在）
- **エントリ一覧**: 2026-11-11 untracked 誤削除・所有者確認分離（Case #4005）

### P-m（promote・既存対策の更新・STEP-4 review 反映で追加）: 共有領域後片付けの具体ファイル名個別指定規律（1 エントリ・30/40）

- **根本原因**: 共有領域（.agentdev/integrity/reports/ 等）の後片付けで wildcard パターン（日付+連番）一括削除を使用し、同時刻に他工程が生成した同名連番 scratch report も誤削除した
- **再発条件**: 連番・タイムスタンプ等の衝突し得るパターンで共有領域の生成物を wildcard 削除する全状況
- **予防策（提案段階・実現先確定は req-define）**: worktree-operations.md の cleanup 系規律へ「後片付けの削除は自分が作成した具体ファイル名を個別指定し wildcard を使用しない」を追加
- **8軸評価**: 30/40（発生1〔機械導出・1件〕・影響3・横4・反映4・自動5・再利用5・再発3・費用5。Jev 再評価 20261115T112406Z-fc8f: 全軸一致）
- **推奨処分案**: **promote（既存対策の更新）**。実測 gap（STEP-4 review Stream B が実測確認）: worktree-operations.md の現行 cleanup 規律（追跡済み削除禁止・未追跡のみ対象・git clean -fd・.agentdev/tmp 列挙削除）に「具体ファイル名個別指定・wildcard 不使用」規律は不在（grep 実測）。共有領域での他工程生成物誤削除の実害（Case #4026 Wave 2・PR #4040 で実害報告済み・対象は gitignore 対象 scratch で恒久影響なし）。inbox 原文で「実行時禁止事項として worktree-operations 系指針への追加候補」を申告。反映先は worktree-operations.md cleanup 系節への規律追記で完結し恒久契約変更を含まない。出現 1 件だが gap 鮮明・gap 分類: fix gap（個別指定規律の欠落）
- **既存対策照合**: 対策なし・ギャップ: fix gap（具体ファイル名個別指定規律不在）
- **エントリ一覧**: 2026-11-13 wildcard 誤削除（Case #4026・Wave 2）

### duplicate（7 クラス・7 エントリ）

| クラス | エントリ | 処分根拠（実測） | 8軸 |
|---|---|---|---|
| dup-1 | MSYS パス bun 起動 Module not found 再観測（#3969・2026-11-08） | 既存知識 windows-checker-msys-path-argument.md（--root MSYS 破損規律）に被覆（全文確認実測）。エントリ自身が「既存知識の適用例・再観測」と申告。STEP-4 review で P-i との二重帰属を解消（本クラスが正） | 15/40 |
| dup-2 | spawnSync 経由 bun run SIGTERM（#3968・2026-11-08） | checker-execution-contracts.md「安定実行経路」節（L183-187）と knowledge checker-cli-stdout-loss-on-windows-bun.md（bun run 経由 stdout 喪失規律）に被覆（実測）。**STEP-4 review 反映（minor 受入）**: SIGTERM（タイムアウト打ち切り時の証跡喪失）現象のより正確な被覆先として docs/knowledge/long-running-mechanical-step-background-execution.md（spawnSync メモリ捕捉・打ち切りで証跡喪失・Windows では打ち切りが子プロセスの即時 kill を伴わない）を処分根拠に追加 | 17/40 |
| dup-3 | bun test 実行形態逸脱 24→1 正規形再実行解消（#3970・2026-11-08） | REQ-060 実行形態契約（3 cwd 分割正規形）と QG-4 正規形規定で被覆。エントリ自身が「REQ-060 契約の逸脱検知の有効性実証」と申告 | 15/40 |
| dup-4 | verify-only closure 機構不成立 issue_close 拒否（#3972・2026-11-08） | prNumber 0 N/A 経路が機構是正 #3979/PR #3982 で実装済み（close_mechanical_steps.ts L243 mergeablePolling 型・L1421-1433 prNotApplicable N/A pass 経路・scripts/README.md L7 prNumber 0 受理をコード・README 読取実測で確認・STEP-4 review で再確認）・実行実績あり（#3972 再開完了） | 25/40 |
| dup-5 | cmd mklink /J quoting 破綻（#4026・2026-11-13） | worktree-operations.md L150-164 に fs.symlinkSync("junction") 手順・mklink cwd 基準解決注意（L161）が実在（実測・STEP-4 review で再確認） | 16/40 |
| dup-6 | AUTOGEN 再生成後 frontmatter 旧観測 edit 拒否（#4054・2026-11-15） | 既存規約「同一ファイルへの複数 edit の規律」節（AGENTS.md・worktree-operations.md L263-275）に実取得・oldString 再組立規律が実在（実測）。エントリ自身が「既存規約どおりの挙動の有効事例」と申告 | 15/40 |
| dup-7（STEP-4 review 反映で追加） | bash node -e エスケープ崩れ（#3971・2026-11-08） | 既存知識 windows-git-bash-inline-content-corruption.md 機構1（バックスラッシュを含む正規表現リテラルをシェル引数経由 node -e 等でインライン記述すると Git Bash のエスケープ解釈で変質・Case #3142/PR #3154）に明示被覆（STEP-4 review Stream A が実測確認）。P-i から再分類 | 17/40 |

### deferred（統合追記 7 クラス・既存エントリ・既存知識への追記で維持）

| クラス | エントリ | 維持根拠（統合追記先・gap 分類） | 8軸 |
|---|---|---|---|
| Q-A（6 件）warning 債務と checker 終了コード契約・補正値設計差・収束後継続分岐（applyNgBaseline warning 対象・accept_definition_checks 後続抑止・case-ready 対照救済手動切替・measurement-convergence commitDate vs author date・収束後も元終了コード抑止・IR-072 commit 前後） | 既存 deferred エントリ「prepare_definition_pr の check_integrity gate が base 起因の既存債務で fail した場合の対照救済と残ゲート消費の手順が reference にない」（L4603・2026-10-15 移動）へ統合追記。機構整理候補（checker 終了コード契約・script 対照救済自動突合・収束後再実行 step の REQ/Design/script 実装変更判断を含む）であり learning-promote は実現先を先取りしない。**STEP-4 review 反映（minor 受入）**: 統合先の核は対照救済クラスであり、計測/終了コード系変異（measurement-convergence・IR-072 commit 前後・収束後継続分岐）は「checker gate の fail 解釈・救済・継続手順の機構整理候補」という緩い束ねであることを明記（根因の同一性は対照救済系が強く計測系は弱い。同時点検対象としての統合を維持）。6 変異の反復実績を追記 | 30/40 |
〔Q-B は 8 変異を統合クラスとして deferred へ新規移動（下表）・統合追記先は恒久文書（既存 deferred エントリではない）のため移動形式〕

### deferred（新規移動・統合クラス 4）
| Q-C（1 件）配布物 concrete ID 直記 checker 検出（#3979・2026-11-08） | 既存 Q2 クラス（配布物 REQ ID 直記・L4556）へ統合追記（3 回目の同根再発・2026-10-20 統合追記に PR #3799 分実在実測） | 22/40 |
| Q-D（2 件）pin 期待文言（読点差 pin fail・pin 期待値事前 grep 不備）（#3967・#3968） | 既存 Q13 クラス（pin 期待文言滞留・L5755-5761）へ統合追記（正規化比較・pin 期待値候補語句 grep の規律追加候補） | 20/40 |
| Q-E（1 件）対象要件行なし Case の traceability --req スコープ導出（#3989・2026-11-12） | 既存 Q14 クラス（traceability スコープ別実行と corpus 診断乖離・L5498-5506）へ統合追記（対象行完備確認先行規律の適用・「対象要件行なし Case の主題要件行 --req スコープ構成」を追加） | 21/40 |
| Q-F（1 件）機械工程 bun 実行体自動駆動（bash ハーネス kill・import.meta.path・unref チェーン）（#4002・2026-11-12） | 既存 Q38 クラス（機械工程起動 twin・起動経路・L5481-5486/L5834-5842）へ統合追記（detached spawn + ファイルポーリング + unref 禁止規律を追加） | 28/40 |
| Q-G（1 件）ADF-COVERS 終端子欠落 parse 不可能（#4002・2026-11-12） | 既存 Q48 クラス（ADF-COVERS inline 宣言管理・L3896-3912）へ統合追記（終端子欠落の失敗モード注記・宣言構文検査追加判断を保持。Q48 は既に 2026-11-07 に 2 件の統合追記で「inline 宣言記述規律クラス」へ拡張済み・記述形式破損系失敗モードの系列連続として統合） | 26/40 |

### deferred（新規移動・統合クラスの続き・統合先は恒久文書への変異補強候補）

| クラス | エントリ | 維持根拠 | 8軸 |
|---|---|---|---|
| Q-B（8 件）worktree junction/投影伝播の変異群（verify-only closure junction 記録要件・分割③環境ラベル明記・投影伝播状態と試験数・投影重複走査・3分割 main root 読取専用代替・trusted-distribution-gate launcher worktree fail・yomiyasu lint worktree 参照・link profile zero-targets） | worktree-operations.md「bun test 実行の環境前提」節（L138-176 詳細実在）・checker 契約 worktree fallback 節（L233-242 実在）への変異補強候補として living pool 維持。恒久規律は実在し今回の変異（伝播済み側重複走査・環境ラベル明記欄・main root 実体ツール参照）は追記候補。8 エントリは個別に deferred へ移動しクラス帰属を処分判定で記録 | 26/40 |

| クラス | エントリ | 維持根拠 | 8軸 |
|---|---|---|---|
| R-a（3 件）bun test stderr 件数抽出・2 段階実行（bun test stderr 分離退避必須 #3967・verify-only closure 3 実行構成 #3972・pass 行非 TTY #4026） | bun test の fail 明細・件数が stderr 出力で機械工程報告 JSON に取れず、fail 由来分類には stderr 分離退避・事前観測・2 段階実行が必要。README への 2 段階実行手順明記候補・stderr 併せ持ち候補を保持（既存 deferred に同根クラス不在の新規移動） | 27/40 |
| R-b（2 件）Epic close 構成の機械工程 N/A 経路不在（Epic 表 blocked 終端行 closing 適用拒否・reset→closing 2 段階 #3964・Epic close post-merge cleanup 構造的 warn #3964） | Epic Issue または PR なし完了構成の機械工程 step が N/A 経路を持たず needs-judgment になる。Epic close 構成判定の cleanup N/A 化・正規手順の標準化（機構整理候補として保持。既存 deferred に同根クラス不在の新規移動） | 24/40 |

### 単発エントリ一覧（R-c・28 件）

| 見出し（日付・要約） | Case | 維持根拠 |
|---|---|---|
| 2026-11-13 textlint advice 逐語保存運用（hard 0件+保持理由記録） | #4049 | REQ-053 系の合格条件解釈の運用知見（出現 1 件） |
| 2026-11-13 agentdev_jev references.digest invalid_input | #4049 | 呼出側入力構成の注意喚起（Tool fail-closed 正常動作・出現 1 件） |
| 2026-11-13 agentdev_gh pr_create number 契約矛盾 | #4049 | 契約不一致の記録・要検証（拒否応答原文消失・出現 1 件） |
| 2026-11-12 detached worktree 相対パス ネスト | #4005 | worktree add 絶対パス指定の運用知見（出現 1 件） |
| 2026-11-07 検証用一時資材台帳登録欠落 22 件 | #3961 | 作成ヘルパー統合の運用浸透候補（REQ-032 系追加行候補） |
| 2026-11-07 PR 本文検証差分 fail 明細粒度 | #3961 | 証跡参照義務の明記候補（機械 1:1 突合が検出済み） |
| 2026-11-07 pre-existing fail 3 系統 + SKILL 旧文言 2 件 | #3961 | 後続要求候補の下地として保持 |
| 2026-11-08 prepare_definition_pr trigger 表記不一致 | #3964 | 修正済み・機械突合テスト追加候補 |
| 2026-11-08 配布依存境界 source profile 対象集合誤解 | #3967 | PR テンプレート注記候補（trigger 判定機械化候補） |
| 2026-11-10 前置永続化冪等不要化（並行レーン） | #3988 | 並行実行の domain state 操作規律候補 |
| 2026-11-11 check_changed_docs TARGET-EMPTY 誤用検出 | #3994 | 対象限定型 checker の事前確認運用候補 |
| 2026-11-11 generate_indexes 派生物 commit 混在 | #4004 | 派生物 commit 状態事前確認前置の候補 |
| 2026-11-11 並行 case-auto push 前確認 | #4004 | 作業隔離規律の補強候補（reference 補記候補） |
| 2026-11-11 heredoc 長文 node 渡し失敗 | #4004 | 検査専用ファイルの project root 内配置運用候補 |
| 2026-11-11 squash merge 後 branch 削除判定分解 | #4005 | worktree-operations 判定手順補強候補 |
| 2026-11-12 PSModulePath 部分修正の罠 | #4002 | env 値転写指示化の運用候補 |
| 2026-11-12 traceability sidecar 未更新完結 | #4002/#4008 | 委譲契約・ゲート強化の候補（工程構造問題） |
| 2026-11-12 conditionId 再導出 stale | #4002 | 本文確定後の識別子再導出順序規律候補 |
| 2026-11-13 IR-055 docs パス literal 移動検出 | #4026 | 配布物移動前置の一手順化候補 |
| 2026-11-13 generate_indexes skip 記録統一 | #4026 | AUTOGEN セクション追加時の不在扱い規約明記候補 |
| 2026-11-13 spawnSync 型テスト追随 | #4026 | 構造非依存アサーション移行候補 |
| 2026-11-13 stash cwd 誤適用 | #4026 | stash 規律（同一 worktree cwd 実行）の補強候補 |
| 2026-11-13 正本鮮度 J-001 逆方向 | #4026 | 正本鮮度担保の両方向整備候補 |
| 2026-11-13 trusted-distribution-gate pipeline unclassified | #4026 | intake item で是正対象を所有（learning 側は遅延知見） |
| 2026-11-15 agentdev_gh gh exit 66 環境障害 | #4052 | 起動環境ヘルスチェック候補（未解決環境問題） |
| 2026-11-15 pipe 後段終了コード | #4054 | 非 pipe 計測規律の checker 契約補記候補 |
| 2026-11-15 yomiyasu unnatural_halfwidth_space 衝突 | #4054 | 規則と正規スタイル整合の検討候補 |
| 2026-11-15 integrity レポート OK 明細不在 | #4054 | レポート様式改善候補 |

（STEP-4 review 反映で fixture 分割番号入れ替わり→P-k・untracked 誤削除所有者確認→P-l・wildcard 誤削除→P-m へ promote 化し R-c から除外・初版の 31 件から 28 件へ）

### rejected（0 クラス）

- 本 run の rejected なし（全 97 見出しが promote 13 / duplicate 7 / deferred 34 クラスのいずれかに帰属・エントリ集計 37+7+12+41 = 97 で整合〔STEP-4 review 反映で突合修正〕）

## promote 時 prune 結果

- **対象エントリ数**: 97 件（inbox 全件・STEP-6 実行済み・2026-11-15）
- **prune実施**: あり（STEP-6 完了・promote 37〔promoted/ 13 成果物の「元learning item/ 根拠」セクションに証拠保存後に除去〕+ duplicate 7 = 44 件を除去・統合追記 12 件は既存 deferred エントリへの統合追記後に除去・新規移動 41 件〔Q-B 8・R-a 3・R-b 2・R-c 28〕は deferred.md へ個別移動し移動日・処分判定を記録。原子操作はメモリ完結規律（検証 10 項目全成功後に一括書込・deferred 見出し 340〔299+41〕・統合追記 6 箇所・処分判定 41 件・BOM/CRLF なし・元見出し保全 299/299 を検証済み）
- **prune候補**: 44 件
- **prune却下**: 0 件

## 全体傾向

- **高頻出・高影響の問題クラス**: (1) Windows 環境の worktree cleanup・依存整備系（P-a・P-d・Q-B・P-l・P-m 合計 20 件）(2) bun test 実行・分類系（P-e・R-a・Q-D 合計 13 件）(3) case-close 機械工程系（P-b・P-c・P-g・P-k・R-b・Q-A 合計 16 件）。case-close 機械工程の CLI runner・順序契約・入力構成・標本の反復 fail が継続している
- **横展開性が高い問題クラス**: P-e（flake 分類・汎用）・P-i（Windows パス形式・汎用）・P-c（freshness 順序・全終了処理）・P-l（並行実行掃除・全並行環境）
- **自動化適性が高い問題クラス**: 文言追記系はすべて即自動化可（P-a〜P-m 全クラスで自動 3〜5）
- **全体的な観察所見**: 今回の 97 件は worktree・bun test・Windows 環境の運用知見が大半を占め、機構整理候補（Q-A・R-b）の反復が継続している。既存恒久手順の整備度が高い領域（worktree-operations.md bun test 環境前提節）での変異追記と、整備が薄い領域（close_mechanical_steps runner・flake 分類 knowledge・cleanup 所有者確認規律）の gap が並存

## Decision 候補除外記録

- **対象item**: P-a〜P-m・dup-1〜dup-7・Q 系統・R 系統全 60 クラス
- **除外理由**: 技術判断不在 / 運用ルール / command仕様
- **根拠事実**: 全単位が運用・検証・手順・記録様式・環境障害対応・文言整合・fixture 標本値の知見であり、アーキテクチャ上の決定、技術選定、設計判断の新規確定を含まない
- **代替反映先候補**: 配布 reference・docs/knowledge・scripts README・SKILL 文言・tests fixture（promote 13 クラスの反映先候補は採用済み成果物参照）

## STEP-4 adversarial-review

- 発動判定: **発動**（Jev boolean true〔0.93〕・観測 20261115T111214Z-fcd2・LLM 最終判断は発動で一致・inbox 97 件で skip 条件〔空・1 件のみで重複確実〕非該当〔deterministic 計数済み〕・evaluation-report 反映済み〔2026-11-15 生成・読み戻し検証済み〕・不可逆処理未実行を実測で確認〔inbox 97 件残存・promoted/ 空・deferred 未変更・git status で evaluation-report.md のみ変更〕）
- review 構成: 独立 challenge stream 2 本（explore サブエージェント・相互の finding を非公開で並行実行）。Stream A = promote 暫定系（P-a〜P-j）の処分判断の反証（7m05s・各参照ファイルの実測読取込み）。Stream B = duplicate/deferred/単発系（6 dup + 7 Q + 2 R-a/b + 31 R-c）の反証と分類境界検証（5m52s）
- orchestrator（Reviewee）反証・受理結果:
  - **A1（受理・major）**: P-a の「Filename too long 未被覆」実測記述が誤り — worktree-operations.md L458-470（MAX_PATH 起因 fs.rmSync フォールバック）と L472-488（Filename too long 起因 robocopy /MIR フォールバック・LongPathsEnabled 確認）が実在 → P-a の実測記述を訂正し gap を「1.5 節の依存整備物掃除前置」のみに限定（promote 維持）
  - **A2（受理・major）**: P-i の node -e エスケープ変異（#3971）は既存知識 windows-git-bash-inline-content-corruption.md 機構1で明示被覆（Case #3142/PR #3154 実在）→ node -e 変異を P-i から除外し dup-7 へ再分類・P-i を 4 エントリへ修正（発生件数軸 4→3・8軸 33→32 修正）・Case #3969 の P-i 二重帰属を解消（dup-1 が正）
  - **A3（受理・minor）**: P-e の既存被覆度記述精度 — QG-4「fail 由来分類」節（L394-431）と timeout 知識 L21 の負荷対照実行が既存被覆 → P-e の実質 gap を「flake 語彙・負荷分類ラベル・変異列挙」に限定し既存対策照合を「対策あり（大部分）」へ修正（promote 維持）
  - **B1（受理・major）**: R-c「fixture 分割番号入れ替わり」は実在欠陥（QG-4 L320-324 正規形 vs close_mechanical_steps.test.ts L445-470 の分割①②対象入れ替わりを reviewer が実測再現）→ **P-k として promote へ変更**（fixture+テスト期待値の同時更新で完結・恒久契約変更なし・機械受理標本の規範性に影響）
  - **B2（受理・major）**: R-c「untracked 誤削除・所有者確認分離」の gap 実在（worktree-operations.md 全文 grep で所有者確認規律不在・並行 run 観測 3 件誤削除の実害）→ **P-l として promote へ変更**
  - **B3（受理・major）**: R-c「wildcard 誤削除」の gap 実在（cleanup 規律に個別指定規律不在・共有領域で他工程生成物誤削除の実害報告済み）→ **P-m として promote へ変更**
  - **B4（受理・major）**: エントリ帰属数値の突合不一致（初版 34+6+56=96 ≠ 97）→ 全エントリ帰属を機械突合で再集計し 37+7+20+5+28 = 97 へ修正（P-k/P-l/P-m 追加・dup-7 追加・node -e/#3969 の帰属訂正を含む）
  - **B5（受理・minor）**: dup-2 の引用根拠に SIGTERM 現象の的確な被覆先（long-running-mechanical-step-background-execution.md）を追加
  - **B6（受理・minor）**: Q-A の統合先（対照救済クラス）への計測/終了コード系変異の束ね範囲を明記（緩い束ね・同時点検対象）
  - **B7（受理・minor）**: prune 節の「実施あり」表記を実行予定表記へ修正（STEP-6 完了後に最終値へ更新）
  - **反証該当なし（承認）**: P-b・P-c・P-d・P-f・P-g・P-h・P-j（Stream A）・dup-1/3/4/5/6・Q-C/Q-D/Q-E/Q-F/Q-G（Stream B）
- evaluation-report 戻しループ: review 反映で処分判定の意味内容が変更された（P-k/P-l/P-m の promote 化・P-i 帰属修正・P-a 記述訂正・件数修正）ため STEP-2 → STEP-3 → STEP-4 発動条件判定の順で再実行した。STEP-2 再実行: 変更 3 クラスの処分区分再評価（20261115T112322Z-ae77・全問 promote）・8軸再評価（20261115T112406Z-fc8f・PK-cost のみ差異）・昇華可能性再評価（20261115T112434Z-9936・全問 false）を実施し observation_write 完了。STEP-3 再実行: 廃棄判定更新（promote 13 クラス・duplicate 7 クラス・deferred 39 クラス）を本レポートへ反映。STEP-4 再発動条件判定: **再 review は発動しない**（新証拠・新前提は Stream A/B 実測由来で本反映に含め済み・処分の方向性〔promote 基準・duplicate 基準・deferred 維持基準〕は変更されておらず新たな本質的争点は生じていない・同一 finding の再起票要件を満たさない）。停止条件を満たしループを離脱し STEP-5 へ進む

## STEP-5 判定確定（自律確定記録）

- **自律確定対象**: 全 60 問題クラス（promote 13 クラス 37 エントリ・duplicate 7 クラス 7 エントリ・deferred 39 クラス 53 エントリ・rejected 0）
- **自律確定の根拠**: (a) promote 13 クラスは既存恒久手順の具体的 gap を grep・コード読取・ファイル読取の実測で確認済みであり（P-k/P-l/P-m は STEP-4 review の実測反証を含む）、処分区分 5（既存対策の更新）の正規契約からの導出に該当（前回 run P-a と同一経路・Jev 処分区分評価 20261115T110120Z-02ae + 20261115T112322Z-ae77 で 13 クラスすべてが既存対策の更新を支持）(b) duplicate 7 クラスは既存恒久契約・知識・配布物での被覆を grep・コード読取の実測で確認済み（Jev 評価で全問 duplicate または被覆根拠実測）(c) deferred 39 クラスは機構整理候補（実現先選択を伴う）・出現 1 件（gap 鮮明な P-j/P-l/P-m 級を除く）・統合追記先実在のいずれかであり living pool 維持が正規契約（保留プール維持・実現先先取り禁止）からの直接導出
- **HITL 不要理由**: 全クラスの処置が「取得可能な根拠（実測）で正規契約から導出できる」範囲に収まり、人間判断への引き上げ条件（REQ-096・v4-responsibility-boundaries Design「人間判断への引き上げ条件」節・1 ユーザー固有の目的・価値観・優先順位の新規確定 / 2 未解決規範矛盾 / 3 対論型レビューで未解決が維持された本質的争点の規範優先関係 / 4 要件・仕様の対象範囲・外部契約・受け入れ条件・恒久規範の新規決定 / 5 既存の明示的な安全境界が要求する操作の承認）に該当しない。promote の実現先確定は req-define 責務であり本 workflow が先取りしない。STEP-4 review の unresolved な本質的争点なし（A1〜A3・B1〜B7 すべて受理済み・反証該当なし項目を含め争点解消）。deferred・未処理項目の自動削除なし（prune は staged/duplicate のみ・STEP-5 確定と同時承認の契約どおり）。破壊的変更（inbox 全体強制クリア・大量エントリ一括削除に該当する独自の破壊的操作）には該当しない（inbox クリアは deferred 移動の原子的操作契約の正規手順・prune 44 件は個別エントリの処分判定に基づく正規手順で前回 run と同一）。前回 run（2026-11-07・67 件全件自律確定）と同一基準
- **昇華可能性**: 全 promote クラスで恒久契約（REQ/Decision/Design）への直接昇華はなし（Jev 20261115T110544Z-a505 全問 false + 20261115T112434Z-9936 全問 false・LLM 一致）。採用済み成果物は既存対策の更新（配布 reference・knowledge・README・SKILL 文言・tests fixture 補正）として req-define 変更影響分析へ情報候補を引き渡す
