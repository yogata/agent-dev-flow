# 評価レポート

## メタデータ
- **実行日時**: 2026-09-01 21:05
- **対象エントリ数**: 57件（inbox: 57件, deferred: living pool 既存分に 43件追記・prune 14件）
- **問題クラス数**: 12（クラス12は review 反映で追加、クラス11は over-merge として解体。未分類 35件を含む）

## 問題クラス一覧

### クラス1: req-save における AUTOGEN 索引の同 commit 再生成漏れ 【promote 候補・最優先】
- **根本原因**: REQ 行 append を伴う req-save 実行時に AUTOGEN 対象索引の再生成を同 commit で行う契約が手順側に明確でない
- **再発条件**: REQ 行 append の req-save で AUTOGEN 再生成を省略
- **予防策**: req-save 手順への再生成前置明記または鮮度検査自動実行
- **構成エントリ**: L8（PR #2390 / commit 340e7304）、L330（PR #2423 / commit 301cdc90・再発明示）

#### 8軸評価スコア
| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | 2件（うち1件は同根再発の明示記録） |
| 影響度 | 3/5 | main の鮮度ずれが下流検証まで残留、2回発生 |
| 横展開性 | 3/5 | AUTOGEN 対象索引全般に適用可、ADF 固有機構 |
| 反映先明確度 | 5/5 | req-save Workflow Skill + checker-execution-contracts.md をエントリ自体が特定 |
| 自動化適性 | 4/5 | req-save 完了時鮮度検査の自動実行は機械化可能 |
| プロジェクト固有知識再利用性 | 4/5 | AUTOGEN 契約と工程連動の固有運用知見 |
| 再発可能性 | 5/5 | 2回実績＋工程未組込み＝ほぼ確実 |
| 費用対効果 | 4/5 | 手順明記1箇所で下流手戻り2回を防止 |
| **加重合計** | **30/40** | |

- **推奨処分案**: promote（既存Xへ反映型: req-save Workflow Skill 手順への AUTOGEN 再生成前置明記）
- **既存対策確認**: src/opencode/skills/agentdev-workflow-req-save/ 配下に AUTOGEN/generate_indexes/鮮度の記載ゼロ（grep 実証）。checker-execution-contracts.md に再生成前置規定なし。index-auto-generation.md に工程連動の前置規定なし。**ギャップ分類: 対策不存在**（AG-009(a)＝OU-008、Issue #2386 領域として計画は存在するが未実装）
- **promote 時の成果物アウトライン**: タイトル「req-save 実行時の AUTOGEN 対象索引再生成前置の明文化」。反映先: src/opencode/skills/agentdev-workflow-req-save/（該当 STEP へ前置明記）、docs/designs/integrity/checker-execution-contracts.md（AG-009(a) 領域との整合注記）。制約: AG-009(a) の進行と重複しない範囲で手順側のみ修正。受け入れ条件: [ ] req-save 手順に再生成前置が明記 [ ] REQ 行 append を伴う req-save 実行時に鮮度検査 exit 0 を確認 [ ] AG-009(a) と重複・矛盾なし。推奨Issue分類: maintenance

### クラス2: Windows PowerShell による既存 UTF-8/LF ファイルの書き換え破壊（cp932・CRLF） 【promote 候補】
- **根本原因**: PowerShell 標準 cmdlet の既定エンコーディング/改行（cp932・CRLF）がリポジトリ標準（UTF-8 BOM なし・LF）と不一致であり、一括読み書き経路でそれを看過
- **再発条件**: pwsh の Get-Content/Set-Content 経由で既存 UTF-8/LF ファイルを書き換え
- **予防策**: PowerShell 一括読み書きを避け edit ツール・node readFileSync/writeFileSync・[System.IO.File] 明示エンコーディングを標準とする
- **構成エントリ**: L411（PR 2434 / Issue 2430）、L666（PR 2458・再確認明示）。同一系統の deferred L1231–1247（2026-08-18、PowerShell 一括読み書き空ファイル破壊）あり

#### 8軸評価スコア
| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | 2件＋同一系統 deferred 1件 |
| 影響度 | 4/5 | 全面文字化け・行末全面変化。復旧に全面再書き込み要 |
| 横展開性 | 4/5 | Windows＋PowerShell＋UTF-8/LF repo の組合せ全般 |
| 反映先明確度 | 5/5 | AGENTS.md ガイドレール（エントリ自体が指名） |
| 自動化適性 | 3/5 | 規約徹底型、機械検査は困難 |
| プロジェクト固有知識再利用性 | 5/5 | AGENTS.md 実証済み事象の延長 |
| 再発可能性 | 4/5 | 「再確認」と明示 |
| 費用対効果 | 4/5 | AGENTS.md 文言追加のみ |
| **加重合計** | **31/40** | |

- **推奨処分案**: promote（AGENTS.md ガイドレールへの PowerShell 版一般化文言追加）
- **既存対策確認**: AGENTS.md 現行文言は「edit ツール優先・Write ツール全面上書きは新規ファイル限定・Write ツール cp932 化け実証済み」まで。**Get-Content/Set-Content（CRLF 書き出し・cp932 解釈）への言及なし**（現行文確認済み）。deferred L1231–1247 が同系知見を保持。**ギャップ分類: 部分カバー（Write ツール系のみ、PowerShell cmdlet 系が欠落）**
- **promote 時の成果物アウトライン**: タイトル「AGENTS.md 文字化け/改行破壊ガイドレールの PowerShell 標準 cmdlet 系への一般化」。反映先: AGENTS.md（行動規範へ1項目追加）、src/opencode/skills/agentdev-workflow-case-run/ 委譲手順（追記可否は別判断）。受け入れ条件: [ ] PowerShell cmdlet 系の破壊リスクと標準手段を AGENTS.md に明記 [ ] 既存 Write ツール規定と矛盾なし。推奨Issue分類: docs_chore

### クラス3: 配布物への実行手順・例示記載様式（fenced code block ＋ プレースホルダ ＋ ID 引用排除） 【promote 候補】
- **根本原因**: IR-055 は inline code span 内のパス参照を検出し fenced block 内は非検出、concrete ID は配布境界違反、新規ファイルは baseline info 降格対象外で fail になるという検出器の性質を記載時に考慮しない
- **再発条件**: 配布 skill・配布物に inline code span で src/opencode/ 直参照や concrete ID を記載
- **予防策**: 「fenced ＋ プレースホルダ ＋ ID 引用排除（要件根拠は PR 本文 ADF-COVERS 宣言へ集約）」様式の徹底を authoring ガイダンスへ明記
- **構成エントリ**: L24（PR #2391 / Issue #2381）、L184（PR 2406 / Issue 2402・統合を自己明記）

#### 8軸評価スコア
| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | 2件（統合を自己明記） |
| 影響度 | 3/5 | IR-055 delta 違反 5〜13件、1往復手戻り |
| 横展開性 | 3/5 | 配布 skill/command 編集全般 |
| 反映先明確度 | 5/5 | agentdev-skill-authoring・agentdev-doc-writing（実在確認済み） |
| 自動化適性 | 3/5 | 検出は IR-055 が既存、事前防止は様式徹底 |
| プロジェクト固有知識再利用性 | 5/5 | IR-055・baseline の検出器性質という固有技術知識 |
| 再発可能性 | 4/5 | 配布物編集は日常的、ガイダンス未明記 |
| 費用対効果 | 4/5 | ガイダンス追記のみ |
| **加重合計** | **29/40** | |

- **推奨処分案**: promote（クラス4 と統合可）
- **既存対策確認**: src/opencode/skills/agentdev-skill-authoring/ に IR-055・fenced・配布パス参照様式の記載なし（grep 実証、design-principles.md L204 のプレースホルダー1件のみ）。**ギャップ分類: 検出器既存・執筆側ガイダンス不存在**

### クラス4: ADF-COVERS 対応宣言の正規配置（docs 配下 Design） 【promote 候補（クラス3 と統合可）】
- **根本原因**: 配布物本文は docs 正規成果物へ解決できない具象 REQ/DEC ID を持てず、宣言不在検出（traceability）と ID 汚染非増加（配布境界 gate）の適用面の違いを同時考慮しない
- **再発条件**: 配布物本文に具象 ID・ADF-COVERS 宣言を直書き
- **予防策**: 対応宣言の正規配置先（docs 配下 Design）の規律を skill-authoring ガイダンスへ明文化
- **構成エントリ**: L314、L746（「既存学びと同系の配置規律の第2事例」と自己明記）

#### 8軸評価スコア
| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | 2件 |
| 影響度 | 3/5 | IR-055 回帰26違反・gate 違反、宣言移設手戻り |
| 横展開性 | 3/5 | 配布物＋docs の両面 |
| 反映先明確度 | 5/5 | skill-authoring・agentdev-traceability（自己記載・実在確認済み） |
| 自動化適性 | 4/5 | 配置規律は構造で検証可能 |
| プロジェクト固有知識再利用性 | 5/5 | TIM・IR-055・配布境界交差領域の配置規律 |
| 再発可能性 | 4/5 | REQ 保存・実装のたび |
| 費用対効果 | 4/5 | ガイダンス追記のみ |
| **加重合計** | **30/40** | |

- **推奨処分案**: promote（クラス3 と同一反映先・同一性質のため単一成果物への統合を推奨）
- **既存対策確認**: agentdev-skill-authoring に配置ガイダンスなし（grep 実証）。docs 配下の前例（docs/designs/skills/agentdev-traceability.md 等）あり。**ギャップ分類: 前例あり・執筆ガイダンス不存在（部分カバー）**
- **統合成果物アウトライン（クラス3＋4）**: タイトル「配布物執筆時の ID 衛生・記載様式ガイダンスの明文化（fenced ＋ プレースホルダ ＋ 宣言配置）」。反映先: src/opencode/skills/agentdev-skill-authoring/（記載様式節追加）、src/opencode/skills/agentdev-doc-writing/（査読観点追記は任意）。受け入れ条件: [ ] 様式3点（fenced・プレースホルダ・宣言の docs 配置）をガイダンスに明記 [ ] 既存配布 skill の記載と矛盾なし [ ] 該当節追加後に lint_skills / integrity suite が fail 0。推奨Issue分類: docs_chore

### クラス5: 委譲異常終了（インフラ障害）からの再開手順 【defer 推奨】
- **根本原因**: インフラ障害による委譲異常終了＋自己参照識別子の確定タイミング・検査コマンド対象範囲・検証進捗の正規記録が手順化されていない
- **再発条件**: 委譲が result 未返却で中断し durable state に記録が残らない
- **予防策**: durable state（コミットメッセージ・Issue コメント）への記録指針・作成後埋め戻し手順の規約化
- **構成エントリ**: L152、L168（「同一波形の第2事例」と自己明記）
- **8軸評価**: 発生件数 2/5、影響度 4/5、横展開性 4/5、反映先明確度 5/5、自動化適性 3/5、固有知識 4/5、再発可能性 3/5、費用対効果 4/5 → **29/40（境界）**（review Stream B 算術訂正: 軸値合計は 29）
- **推奨処分案**: deferred。エントリ自体が「作成後埋め戻し手順を case-open STEP-5 と adapter PR 作成に明文化済み（PR 2405 で適用済み）」「REQ-048-005・DEC-011 の運用実例」と自己記載し、**予防策の大部分は適用済み**。残余は L168 の「検証進捗の正規記録指針」の手順化のみ
- **既存対策確認**: エントリ自己記載による適用済み確認（PR 2405）。**ギャップ分類: 対策適用済み・知見は実証記録（部分差分小）**

### クラス6: worktree 依存復元（node_modules 未伝播・bun install 前置） 【defer 推奨】
- **根本原因**: node_modules は git 非追跡かつ多層分散配置のため worktree に未伝播
- **再発条件**: worktree で依存を必要とするテスト・検証スクリプトを実行
- **予防策**: bun install 前置（分散対象の個別実行）を環境復元手順に明文化
- **構成エントリ**: L249、L378、L522、L586（分散 node_modules の個別 install）
- **8軸評価**: 発生件数 3/5、影響度 3/5、横展開性 2/5、反映先明確度 4/5、自動化適性 3/5、固有知識 4/5、再発可能性 4/5、費用対効果 3/5 → **26/40**
- **推奨処分案**: deferred。既存対策が実装済みで4件の知見は適用実例。差分は L586 の「分散 node_modules の個別 install 対象一覧」のみ
- **既存対策確認**: worktree-operations.md L162 に bun install 前置明記。qg-4-final-acceptance.md L205–208 に依存パッケージ前置（bun install --cwd）明記。**ギャップ分類: 大部分カバー・分散依存の全対象列挙のみ未明記（部分カバー）**

### クラス7: worktree junction 未伝播下の検査実行回避 【duplicate 候補】
- **根本原因**: junction は git 非追跡のため worktree に伝播しない構造的制約（REQ-018）
- **再発条件**: junction 未伝播 worktree で junction 依存 checker・配布スキルを実行
- **予防策**: repo-local 直実行と main root からの `--root` 読取専用の使い分け＋fallback・環境ラベル手順
- **構成エントリ**: L216、L506
- **8軸評価**: 発生件数 2/5、影響度 3/5、横展開性 2/5、反映先明確度 4/5、自動化適性 3/5、固有知識 4/5、再発可能性 3/5、費用対効果 3/5 → **24/40**
- **推奨処分案**: duplicate（covering: src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md L132–171 が junction 未伝播・isInsideWorktree skip・src fallback・メインリポジトリ読取専用実行・環境ラベルまで規定。agentdev-git-worktree-test-fallback Design が fallback 契約を所有）**ギャップ分類: カバー（適用実例の重複）**

### クラス8: 配布物系ファイル（原本・テスト・archive 同梱）への具象 ID 非記載 【defer 推奨】
- **根本原因**: concrete-id 規約の適用範囲（archive 同梱・テスト・原本）を事前把握しない
- **再発条件**: 配布物系ファイルに具象 ID や対応宣言を記載して commit
- **予防策**: ID を含まない表現・プレースホルダ表記ルールの明文化
- **構成エントリ**: L282、L682
- **8軸評価**: 発生件数 2/5、影響度 3/5、横展開性 3/5、反映先明確度 4/5、自動化適性 4/5、固有知識 4/5、再発可能性 3/5、費用対効果 3/5 → **26/40**
- **推奨処分案**: deferred。機械検出（archive 公開前検査・concrete-id gate）が既存で失敗後に修正可能、残余は執筆側運用注記のみ。クラス3/4 統合成果物に1行含める形も可
- **既存対策確認**: distribution-boundary.md L92–109 に archive 公開前検査節実在。プレースホルダ表記ルールの運用注記は未記載（grep 実証）。**ギャップ分類: 検出既存・執筆注記部分欠落（部分カバー）**

### クラス9: 実装確認なしの文書化・設計（argv 突合・loader 実装確認） 【defer 推奨】
- **根本原因**: リファレンス・慣例から推測で記載・設計し、実装（argv 解析・loader glob）を確認しない
- **再発条件**: 実装の解析・経路を確認せずに文書化・配布設計
- **予防策**: 実装との突合・確認を必須手順とする
- **構成エントリ**: L56、L442
- **8軸評価**: 発生件数 2/5、影響度 3/5、横展開性 4/5、反映先明確度 4/5、自動化適性 2/5、固有知識 3/5、再発可能性 4/5、費用対効果 3/5 → **25/40**
- **推奨処分案**: deferred。一般手順心得レベル。L442 はエントリ自身が「intake item（2026-08-25-design-confirm-custom-tool-contracts.md）経由」と別管理を明記
- **既存対策確認**: skill-authoring に argv 突合の記載なし（grep 実証）。L442 側は custom-tool-contracts Design への反映経路が別途走行中。**ギャップ分類: 部分反映進行中**

### クラス10: 訳語表の正規参照点整備（未登録語の先行登録） 【defer 推奨】
- **根本原因**: 訳語表（document-type-responsibilities.md）が docs と配布物を統制する正規参照点として未整備で個別文脈判断に依存
- **再発条件**: 訳語表未登録の技術用語が存在する状態で走査・訳語化を実施
- **予防策**: 訳語候補の先行登録（根拠＋推奨訳明記）を訳語化の前置条件とする
- **構成エントリ**: L778、L858
- **8軸評価**: 発生件数 2/5、影響度 2/5、横展開性 3/5、反映先明確度 5/5、自動化適性 2/5、固有知識 4/5、再発可能性 4/5、費用対効果 3/5 → **25/40**
- **推奨処分案**: deferred。両エントリとも「訳語表追補は別途提案」と自己記載。表への追補は継続的な内容運用であり、単発昇華より backlog-review 経由の別提案が適する
- **既存対策確認**: document-type-responsibilities.md L249–284 に訳語表・複合技術語の訳し方指針実在（確認済み）。技術用語の個別登録は未整備。**ギャップ分類: 指針既存・登録範囲未整備（部分カバー）**

### クラス11: 配布物執筆時の表記正規化の未確定（ID 除去表記・強調記法 checker 限界） 【解体・defer（単独化）】
- **根本原因**: 許容表記・検出ロジックが未確定/限界ありで個別文脈判断に依存
- **再発条件**: 正規表記未確定のまま配布物を作成・改修し決定的検査のみで検査
- **予防策**: 正規表記の確定と checker 検出ルール追加
- **構成エントリ**: L810、L826
- **review 判定（accepted finding）**: 2件は三つ組が選言的（L810=許容表記未確定、L826=checker 偶数判定の限界）で over-merge。クラスとして解散し、両エントリは単独 defer（下表 #28・#29）として管理する
- **既存対策確認**: content-corruption-checker.md が検査クラス契約の正規所有（実在確認済み）。該当パターンの検出ルール未実装。**ギャップ分類: 契約既存・検出ルール未実装**

### クラス12: PowerShell パイプ/リダイレクト経由の UTF-8 出力破壊（review 追加） 【defer 推奨】
- **根本原因**: PowerShell のパイプ受信・リダイレクト書込の既定符号化が UTF-8 を安定して保持しない
- **再発条件**: pwsh でネイティブコマンドの UTF-8 出力（JSON・git show 等）をパイプ/リダイレクトで受けて文字列処理する
- **予防策**: spawnSync + UTF-8 明示書き出し（node/bun スクリプト）または git diff を正とする方式へ統一
- **構成エントリ**: L538、L698（review Stream B で欠落発見・本報告へ追加）
- **8軸評価**: 発生件数 2/5、影響度 3/5、横展開性 3/5、反映先明確度 3/5、自動化適性 3/5、固有知識 4/5、再発可能性 3/5、費用対効果 3/5 → **24/40相当（28/40 の分析値から反映先確認を残し暫定）**
- **推奨処分案**: deferred。反映先（checker-execution-contracts.md の実行形式・case-close/case-run 検証手順）の実在確認が未了のため次回 living pool 再評価対象。クラス2 成果物（AGENTS.md 一般化）に PowerShell I/O 規約として含める拡張候補

### 未分類（単独 33件）

| # | タイトル＋行 | 処分推奨＋理由 | 既存対策確認（検証済みのみ記載） |
|---|---|---|---|
| 1 | gh api での Issue コメント編集には REST numeric id が必要（L40） | defer: 出現1件、gh-cli 手続き知見。次回発着時に standard-procedures へ統合可 | src/opencode/skills/agentdev-gh-cli/references/ に numeric id / REST PATCH 注記なし（grep 実証）→ ギャップ小・反映先実在 |
| 2 | NG baseline の bucket key evidence は語彙置換で陳腐化する（L72） | defer: 出現1件、baseline 運用手順への反映候補。エントリが「PR #2395 で把握・記録済み」 | integrity-contracts.md 実在確認（designs/README 一覧）。baseline 節の内容は未検証 |
| 3 | PR 本文の close キーワードはマージ時に Issue を自動クローズする（L88） | **promote 候補（単独・高優先）**: 未修正ギャップが現存。8軸相当: 発生1・影響4・横展開3・反映5・自動化4・固有4・再発4・費用4 ≈ **29/40** | **pr_desc.md L120 に `Closes #$ISSUE_NUMBER` が現存するのを grep で実証**（未修正）。修正候補: テンプレートを `Refs: #N` へ変更＋case-close マージ前の PR 本文 close キーワード検査。反映先: .opencode/skills/agentdev-workflow-templates/templates/pr_desc.md（実在確認済み）・agentdev-workflow-case-close（pr-merge-and-conflict.md 実在確認済み） |
| 4 | lint_skills の See Also 参照検査は junction 投影の状態で結果が変わる（L104） | duplicate 候補: エントリ自身「IR-068 skill-projection-manifest により投影乖離は恒常検出化済み」と記載 | covering: docs/designs/integrity/rules/（IR-068）＋worktree-operations.md L132–171 |
| 5 | AG-005「references 300行超は目次必須」は節追記で発火する（L120） | defer: 出現1件、lint が検出するため被害小 | mechanical-replacement-rules.md に「目次」節あり（L11 確認）・事前確認手順の明記なし |
| 6 | 機械置換スクリプト移植時の引数意味差異（L136） | defer: 出現1件。エントリ自身「3段階手順（RU-0009 正式化）の有効性を実証する事例」＝既存防御が機能した実録 | mechanical-replacement-rules.md L247–258 に3段階手順実在（確認済み） |
| 7 | Windows 環境の一時検証コードは repo 内 tmp 領域に配置する（L200） | duplicate 候補: deferred「ハーネス Write ツールのリポジトリ外 temp 書き込みが distribution-boundary-guard でブロックされる」（deferred.md L1111–1127）と同一知見 | covering: deferred.md 同一エントリ（review 訂正: gh-cli 標準手続きの .agentdev/tmp 配置規定は不所存のため covering から除外） |
| 8 | PR 本文の traceability 検証差分の担当行帰属は Epic マッピングと突合する（L232） | defer: 出現1件、実態は intake item 化＋対応記録コメント済み（エントリ記載） | agentdev-workflow-case-close の再検査手順への反映候補・差分小 |
| 9 | 配布依存境界 guard は src 参照を含む一時検証ドライバの TEMP 書出しも block する（L266） | defer: エントリ自身「Design の gate 仕様に従う挙動」＝設計どおり。回避（inline 実行）知見のみ | distribution-boundary.md 事前書き込み gate 契約実在（L18 確認） |
| 10 | worktree で agentdev-traceability を scripts cwd 起動する場合は --root に明示指定する（L298） | **promote 境界（親判断）**: 出現1件だが反映先特定・修正が README 注記1節と低コスト確実。25/40 程度で defer 目安だが、false fail（exit 2）の再発防止効果が直接 | src/opencode/skills/agentdev-traceability/scripts/README.md に `--root .` 実行例のみあり、worktree 環境での明示指定注記なし（grep 実証）→ 明確ギャップ |
| 11 | 委譲メタデータの baseline 数値は参考値であり完了判定は再検索の実測で行う（L346） | defer: 出現1件、委譲メタデータ作成手順への反映候補 | agentdev-workflow-case-run 手順、該当規定なし |
| 12 | 短い識別子の横断検索パターンは既存識別子の部分一致で偽陽性になる（L362） | defer: 出現1件、verification 記載指針レベル | IR-057 関連の運用知見（rules/ 実在確認済み） |
| 13 | 残存掃除の初期 grep サーベイは件数上限なしで全体を出す（L395） | defer: 出現1件。deferred の類似事例（PR #1122 再 grep 残存・em-dash 文脈判定）との蓄積傾向あり | deferred.md 該当2件（L353・L521）と同主題圏 |
| 14 | AUTOGEN 鮮度 gate の計測日ブロックは日付境界で発火する（L427） | defer: 出現1件、gate 判定の運用知見。「gate 側緩和は別途検討」自己記載 | autogen-freshness-gate.md 実在（designs/README 一覧、draft status）→ 緩和提案の受け皿あり |
| 15 | issue_comment の VERIFY は代理検証であり閉じた Issue へのコメント追加は検証不完になりうる（L458） | defer: 出現1件、契約変更は後続 Case へ委譲済み（エントリ記載） | custom-tool-contracts.md 実在（designs/README 一覧確認）・読み戻し項目の追記候補 |
| 16 | pwsh のパイプラインでは $LASTEXITCODE が最終コマンドの終了コードになる（L474） | defer: 出現1件。クラス2/クラス4 と同一の「Windows PowerShell I/O 規約」に統合する場合の構成要素（統合案の親判断材料） | AGENTS.md に該当記載なし（現行文確認済み）、checker-execution-contracts.md に実行形式規定なし（grep 実証） |
| 17 | integrity suite のテスト数は junction 実在有無で変動する（L490） | duplicate 候補: 環境ラベル記録要件が同一知見を規定済み | covering: qg-4-final-acceptance.md L220–235（環境ラベル3要素、確認済み） |
| 18 | agentdev_gh issue_update は契約外フィールドを無視して部分更新として成功する（L554） | defer: 出現1件、Tool は契約どおり動作。リクエスト組立て側様式知見 | custom-tool-contracts.md 実在（確認済み）、呼出側様式の反映候補 |
| 19 | agentdev_gh pr_mergeable は mergeable 再計算競合で verification-incomplete になり得る（L570） | defer: 出現1件。ポーリング手順は既存、差分は「verification-incomplete 時の扱い明文化」のみ | covering（部分）: pr-merge-and-conflict.md STEP-4-2 に UNKNOWN ポーリング手順実在（L39–48 確認済み） |
| 20 | git commit の -- pathspec はオプションより後に置き -m は -- より前に置く（L602） | defer: 出現1件、git 構文一般知見・即時検出で被害小 | worktree-operations.md に並列実行安全ステージング手順の節あり（実在確認済み） |
| 21 | traceability scripts の scan 対象は .md と .ts のみで .agentdev/ は除外（L618） | defer: 出現1件。クラス4（宣言配置）の知見の範囲情報として統合可 | docs/designs/skills/agentdev-traceability.md 実在（designs/README 確認） |
| 22 | OpenCode plugin の引数なし tool は args 省略で定義可能（L634） | defer: 問題なし（改善知見）。「REQ-052 対応 Design の実装様式節更新候補」自己記載 | docs/designs/local/runtime-package-boundary.md 実在（designs/README 確認） |
| 23 | bun install を実行する配下ディレクトリには配下 .gitignore が必要（L650） | defer: 出現1件、即時修正済み。gitignore 構成の運用知見 | worktree-operations.md に新規ディレクトリ手順の節あり（確認済み） |
| 24 | 宣言データの確定値を case-open の実行契約へ明記しないと blocked になる（L714） | defer（review 訂正: duplicate→defer）: 個別事象（source URL）は解消済みだが、一般化予防策「case-open 実行契約への宣言データ確定値明記の項目化」は未カバー | case-open SKILL・REQ-030 に宣言データ確定の規定なし（review 検証）。skills.yaml 登録・REQ-002-042〜044 は個別事象の解消のみ |
| 25 | worktree での実フェッチ検証は endpoint 注入と bun -e ファイルレス実行で可能（L730） | defer: 問題なし（検証手法の知見） | third-party-sync 関連（skills.yaml・検証経路確認済み） |
| 26 | コマンド定義ファイル追加時は COMMAND_COUNT と public_commands を同時更新する（L762） | defer（review 訂正: duplicate→defer）: covering が intake inbox item（エフェメラル・promote 後に消失）で living pool として不適切。期待値動的化の判断が確定するまで保持 | intake item 2026-08-30-integrity-suite-command-count-stale-expectations.md（別管理走行中、review 検証で現存確認） |
| 27 | repo-local 正本の src 配下移動は agentdev-* 命名である限り detector 列挙に捕まる（L794） | defer: 根本模型ずれは intake item（2026-08-30-distribution-boundary-checker-repo-local-model-mismatch）で別管理、checker 修正（tests/ 除外）済み（809292c5） | distribution-boundary.md archive/gate 契約実在（確認済み） |
| 28 | ID 除去ポリシー適用時の表記残骸が不統一で決定的検査対象外（L810） | defer: クラス11 と同主題。許容表記の確定は別途提案（自己記載） | content-corruption-checker.md 実在（designs/README 確認） |
| 29 | 段落をまたぐ強調記法破損は偶数判定では検出されない（L826） | defer: クラス11 と同主題。checker 拡張は別途提案（自己記載） | 同上 |
| 30 | SKILL.md 見出し語の日本語化は参照先用語の横断確認を前置条件にすべき（L842） | defer: references 対象外の合意範囲、参照語彙追随は intake で管理（自己記載） | agentdev-doc-writing 査読観点への反映候補 |
| 31 | 配布依存境界 checker の unclassified-entry 分類は実在 IR 参照を新規違反と区別しない（L874） | defer: baseline 登録運用で許容中、分類改善は別途提案（自己記載） | distribution-boundary.md 分類・baseline 契約実在（確認済み） |
| 32 | worktree 指定の check_integrity 実行は worktree 内 reports/ へ出力する（L890） | defer: 出現1件、.agentdev/README.md が reports/ 非永続・git 対象外を既定化済み。残余は検証手順への後始末明記のみ | covering（部分）: .agentdev/README.md 状態表（確認済み） |
| 33 | トレーサビリティ対応宣言の網羅性は定量化して記録すると判断材料になる（L906） | defer: 改善要否は intake / backlog-review 経由（自己記載）。現状記録（missing 70/42件）は検証差分に記録済み | docs/designs/skills/agentdev-traceability.md 実在（designs/README 確認） |
| 34 | PowerShell のリダイレクトは UTF-8 JSON を破壊する（L538） | defer: クラス12（review 追加）。反映先の実在確認未了のため次回再評価 | checker-execution-contracts.md 実行形式節（内容未検証） |
| 35 | PowerShell で git show の出力をパイプ受信すると cp932 デコードで取りこぼす（L698） | defer: クラス12（review 追加）。同上。git diff 正本方式への統一は case-close/case-run 検証手順の反映候補 | 同上 |

（注: 未分類 35件（#1〜#35）。うち L858 はクラス10 に含むため実単独 34件＋クラス10 統合 1件。全 57件の所属: クラスタ 24件（クラス11解体後の11クラスタ）＋単独 33件の実エントリ（#28/#29 はクラス11重複計上を解消し単独計上）。review 後の最終内訳: promote 9件 / duplicate 5件 / defer 43件。）

## promote 時prune結果

- **対象エントリ数**: 57件
- **prune実施**: あり（STEP-5 判定確定と同時に承認済みとして実行）
- **prune候補**: 14件実施（staged/promote 9件 + duplicate 5件。証拠は promoted 成果物の「元learning item / 根拠」セクションに保存済み）
- **prune却下**: 0件
- **deferred 移動**: 43件追記（移動日 2026-09-01 付き。原子的操作: 追記 → heading count 検証（+43 検証済み） → inbox.md クリア）

### prune 候補分析（deferred.md）
**prune 候補: 0件**（全6条件の同時達成は存在せず）。3ヶ月超経過エントリ（移動日 ≤ 2026-06-01）は5件のみで、いずれも「影響度≤2」未達または保護対象（判断基準・技術知識・プロジェクト固有知識を含む）のため prune 不可:
- baseline分類の乖離と解決（2026-06-06, L52）: 影響度中・再発条件具体的・固有分類基準知識
- スクリプトエンコーディング破損が HEAD にコミット（2026-06-06, L72）: 影響度大・pre-commit 検証の技術知識
- Squash merge conflict W1→W2 統合パターン（2026-06-07, L92）: 影響度中・具体的・多層防御の統合パターン知識
- Epic Orchestrator の Wave間変更漏れパターン（2026-06-07, L112）: 影響度中・具体的・Wave 設計の固有知識
- runtime template path の暗黙参照（2026-06-07, L132）: 影響度中・具体的・REQ-0108 検出実装済み

なお deferred L1291（Phase 0 AUTOGEN 差戻し、2026-08-18）は「次回 living pool 再評価の最優先候補」と自己記載しており、クラス1 と同根のため prune ではなく**昇華評価の推奨対象**。

## 全体傾向
- **発見経路の機械化が完了している**: 検知方法のほぼ全件が機械検出または機械出力の突合。「機械検出 → learning 記録 → 手順反映」のパイプラインは機能しているが、手順側（執筆ガイダンス・工程手順）への反映が追いついていないギャップが promote 候補クラスタ（クラス1/3/4）の共通構造
- **再発実証が昇華優先度を直接決める**: 再発明示はクラス1（AUTOGEN 2回目）とクラス2（cp932 再確認）のみで、両クラスタがスコア上位2位（30・31/40）
- **Windows / worktree 環境知見が最大ボリューム**: 約15件。worktree 系は構造対応がほぼ完了し残りは適用実例（duplicate/defer が妥当）。PowerShell 系は AGENTS.md の Write ツール規定までしか一般化されておらず、クラス2 が最も費用対効果の高い未完対策
- **配布物 ID 衛生は「検出器完備・執筆ガイダンス未整備」**: 約8件。promote はガイダンス1節の明文化に集約可能（クラス3+4 統合成果物）
- **REQ-053 文章品質系が直近に集中**: 「checker 拡張・訳語表追補は別提案」自己申告が多数 → defer＋別提案経路の追跡が正しい扱い
- **follow-up チャネルの分散に注意**: intake item 等への「別管理」記載が多数（#26、#27、#30 等）。promote/defer 判定時に当該 intake item の現状照合を推奨

## ADR候補除外記録

全エントリが「ADR/REQ/spec影響: なし」を自己申告しており、ADR 候補に到達する item は本バッチに存在しない。ゲート適用の記録として主な適用結果:

| 対象（クラスタ/エントリ） | 除外理由 | 根拠事実 | 代替反映先候補 |
|---|---|---|---|
| クラス1（AUTOGEN 再生成漏れ） | 運用ルール | 工程手順への前置明記が予防策。gate 仕様（REQ-010-059）は不変 | req-save Workflow Skill 手順、checker-execution-contracts.md（AG-009(a) 既存領域） |
| クラス2（PowerShell 書き換え破壊）・#16（$LASTEXITCODE） | 運用ルール | 編集手段・検証実行形式の作業手順規約 | AGENTS.md、委譲手順 |
| クラス3/4（配布物記載様式・宣言配置） | 仕様変更のみ／執筆様式 | 既存 IR-055・配布境界・TIM 規定の運用知見で新規技術判断なし | agentdev-skill-authoring、agentdev-doc-writing |
| クラス5（委譲再開手順） | 運用ルール／command仕様 | case-run 再開手順・埋め戻し規約の整備 | case-run 再開経過手順、case-open STEP-5、adapter |
| #3（PR テンプレート記法） | 仕様変更のみ | テンプレート記法変更（`Closes`→`Refs:`）で技術的トレードオフ判断なし | pr_desc.md テンプレート、case-close マージ前検査 |
| #14（date rollover 報告区別） | 運用ルール | gate 判定の報告運用 | autogen-freshness-gate Design（draft 実在） |
| クラス10/11・#28〜#29（訳語表・表記基線・checker 拡張） | 仕様変更のみ／非技術的合意 | 表現・表記の正規化判断 | document-type-responsibilities.md 訳語表、content-corruption-checker Design、backlog-review 経由別提案 |

## 経路D review 発動条件判定記録（STEP-4）

- **発動判定**: 発動（default-on）。evaluation-report.md 反映済み、skip 条件非該当（inbox 57件＞1件）
- **review 呼出**: 2系統の独立 stream（Stream A: 既存対策照合の検証 / Stream B: 分類・判定較正の検証）で初期 challenge 実施（兄弟 stream の finding 非共有）→ counter-challenge（Reviewee 反証）→ convergence → convergence audit 完了
- **accepted finding（反映済み）**: (1) #24 duplicate→defer（covering が一般化予防策を欠く）、(2) L538/L698 欠落の追加（クラス12新設）、(3) L810/L826 の重複計上解消（クラス11解体）、(4) クラス5 算術訂正 28→29、(5) #7 の covering 記述訂正（gh-cli tmp 配置規定不所存）、(6) #26 duplicate 疑義→defer（covering がエフェメラル）
- **反映方法**: 本報告の該当箇所へ直接反映（意味内容の変更は処分内訳の修正に留まり、promote 9件の判定は不変）。新たな本質的争点は生じないため再 review は発動せずループ離脱（再 review 停止条件4点充足）
- **未確認（問題なしと検証済み）**: クラス1〜10 の covering・ギャップ分類、#3/#10/#19/#27 の根拠、prune 候補 0件判定

## 自律確定記録（STEP-5）

- **判定結果**: 全問題クラス・単独エントリの57件を自律確定（ユーザー判断必要項目なし → HITL を発生させず確定）
- **promote 9件の主要根拠**: クラス1（req-save 手順に AUTOGEN 再生成記載ゼロの grep 実証・2回再発実績）、クラス2（AGENTS.md に PowerShell cmdlet 系規定なしの現行文確認・再確認明示）、クラス3+4（skill-authoring に配置・記載様式ガイダンスなしの grep 実証）、#3（pr_desc.md L120 `Closes` 現存の grep 実証）
- **HITL 不要理由**: 適用すべき既存契約と判断根拠を特定済み（grep/実ファイル検証済み）、選択肢間の本質的競合なし（反映先は既存ファイルへの追記・1節明文化）、ユーザー固有の価値判断・対象範囲の新規決定を要しない（反映先と変更内容はエントリ自体が特定）、正規情報源間に未解決の矛盾なし、対論型レビュー実施済みで未解決争点なし
- **破壊的変更の判定**: inbox.md クリアは deferred 移動（全エントリの追記を検証済みでから実施・削除を伴わない標準フロー）であり破壊的変更に該当しない。prune 14件は STEP-5 確定と同時に承認済みとみなす契約の適用（staged 証拠は promoted 成果物へ保存済み）
