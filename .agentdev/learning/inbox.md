# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## 2026-10-03 case-open（OU-002・Case #3333）yomiyasu 適用順序違反

- 問題クラス: workflow deviation（工程順序違反）
- 発生工程: case-open（case-auto 配下の並行委譲実行。Root Case #3333・Definition PR #3343）
- 内容: case-open の project extension（`.agentdev/extensions/skills/agentdev-workflow-case-open.yaml` の yomiyasu-application-before-write ルール・REQ-098）は docs 編集前と agentdev_gh 書込み前の yomiyasu 読込・lint 確認を要求するが、委譲実行者は workflow SKILL.md の制御平面（6 STEP）のみを根拠に進行し、Design 編集と Issue/PR 投稿後に extension ルールを発見した。遡及適用（3 対象へ lint 実行・保持理由を PR 検証欄へ記録）で回復したが、書込み前適用の契約に反した
- 学び: workflow 委譲実行時は制御平面（SKILL.md/references）に加え、project extension（`.agentdev/extensions/skills/<workflow>.yaml`）を STEP-1 の入力解決時に読み込むべき。SKILL.md の Capability Skill 連携節に `agentdev-project-extensions` が列挙されていても、docs 編集・GitHub 書込みといった具体的な適用契機は extension 側 rules にしか書かれておらず、extension 未読込のまま進むと fail-open 性質上、適用漏れが silently 継続する
- 提案: case-open の STEP reference（root-case-and-definition-package.md の STEP-2 前の手順等）へ「STEP-1 で project extension を読み込み rules の適用契機を確認する」明示の追加候補（intake 候補としても成立）
- 発見元: Case #3333（backlog-pool-20261003・OU-002）実行時の自工程観測

## 2026-10-03: REQ-032 frontmatter updated 乖離は case-open 実測時点で既に解消済みだった（RU 実測時点との時間差陳腐化）

- **問題事象**: draft AG-005（RU-20261003-05・base 95d32719 実測）は REQ-032.md frontmatter updated（2026-09-29）≠ 最終内容変更コミット日（2026-10-01）の乖離を想定したが、case-open 実測では 7f163676（#3310）で updated 修正済みで一致しており、ACT-REQ-005 は実変更なし判定になった
- **発生局面**: case-open STEP-4 実変更判定（Case #3336・OU-005）
- **検知方法**: ACT-REQ-005 の合意文言「実コミット日を実測して設定」に従い git log 実測（最終内容変更コミット 76e43819・frontmatter 修正コミット 7f163676 の diff 実測）
- **根本原因**: RU の base 実測時点と case-open 実測時点の間に他 Case の merge が入り、frontmatter 是正が先行適用されていた
- **自律対応内容**: 実測一致を確認して REQ-032.md を変更対象から除外（実変更なし判定を Root Case #3336・PR #3346 本文に記録）
- **ユーザー確認の有無**: なし（合意文言の適用で決定的に判定可能）
- **Decision/REQ/spec影響**: なし（draft 合意の文言が実測適用を前提としていたため契約内の判定）
- **横展開観点**: draft の ARTifact 実測前提（特に frontmatter 日付・baseline 状態等の可変メタデータ）は case-open で再実測して初めて実変更判定すべき。RU 実測時点の前提を鵜呑みにせず再実測する規律は case-open Design の canonical Definition 比較に既に存在するが、可変メタデータ系 ACT では特に効く
- **再発条件**: RU 生成から case-open の間に他 Case が同一ファイルの meta 情報を merge した場合
- **予防策候補**: case-open 冪等確認時の canonical 再実測を可変メタデータ系 ACT に対して明示化する（現行規約で既に担保済みのため、観点の明示のみ）
- **想定反映先**: なし（規約上の想定内動作。再発時に規約改訂を再検討）
- **関連**: Case #3336・PR #3346・draft req-draft-backlog-pool-20261003（AG-005・ACT-REQ-005）
- **タグ**: #stale-assumption #frontmatter #case-open

---

## 2026-10-03: REQ-003-055 phantom NG は参照文言の履歴参照化だけでは解消されず NG baseline 登録が必要

- **問題事象**: REQ-003.md:56 を履歴参照形式へ是正後の worktree HEAD 実測でも check_integrity の phantom 系 NG 3件（REQ-003-055・REQ-003.md:56・v4-responsibility-boundaries.md:44/:67）が残存。REQ-082.md:12 の REQ-003-030 は baseline-known（preserved-history-or-out-of-scope・INFO 降格）で処理されるのに対し、REQ-003-055 は NG baseline 未登録のため NG 計上される
- **発生局面**: case-open STEP-4 の PR 作成前 checker 実測（Case #3336・OU-005・PR #3346）
- **検知方法**: check_integrity --root <worktree> --classification のレポート（IR-067 referenced-req-row-existence）
- **根本原因**: checker は「REQ-003-055」トークンを REQ 行参照として機械的に検出し、文言の履歴参照明示（「当時の行番号帯であり…廃止」）では検出を抑制できない。REQ-003-030 は既に NG baseline 登録済みだが REQ-003-055 分が未登録
- **自律対応内容**: 文言是正（ACT-REQ-003/004）は draft 合意どおり適用し、NG 残存を PR 本文の検査証跡と残課題に記録。case-run 段階の TS-005（on_failure: fix-and-reverify）で provenance 付き NG baseline 登録（または checker の履歴参照判定対応）へ対処する前提を明示
- **ユーザー確認の有無**: なし（artifact_actions に baseline 登録 ACT が含まれない draft 合意の範囲内処理）
- **Decision/REQ/spec影響**: TS-005 pass_criteria（phantom 系 NG 0件）の達成には NG baseline provenance 登録が必須という依存が判明。REQ-010-079（baseline provenance 契約・OU-008）との接続候補
- **横展開観点**: 廃止済み REQ 行への参照残存の是正では「文言の履歴参照化」と「NG baseline 登録」がセットで初めて phantom NG が解消される。ghost 行参照の是正 ACT を作る際は baseline 対応を同時に確認すべき
- **再発条件**: 廃止済み REQ 行 ID を本文に含む文言を是正し、baseline 登録を伴わずに checker を通す場合
- **予防策候補**: artifact_actions の参照是正系 ACT の template に「NG baseline 要否の実測確認」を案内するか、TS 定義側で baseline 登録を検証手順に含める
- **想定反映先**: learning-promote での評価・必要なら docs/knowledge への知見保存または traceability/REQ-010 系文書の追補
- **関連**: Case #3336・PR #3346・REQ-010-069/079・Issue #3293 Wave 1 finding（phantom citation 起点）
- **タグ**: #phantom-citation #ng-baseline #check-integrity #ir-067

---

## 2026-10-03: 並行 case-open 委譲で project extension rules（yomiyasu 適用前提）の読込が STEP-5 まで後ろ倒しになり GitHub 文章投稿後の遡及 lint になった

- **問題事象**: case-open 委譲実行（OU-006・Case #3335）で document-model.md の Definition 変更・Root Case 本文・Definition PR 本文を agentdev_gh へ渡す前に、project extension（.agentdev/extensions/skills/agentdev-workflow-case-open.yaml）の rule「yomiyasu-application-before-write」（編集前読込・投稿前推敲・lint）を読み込んでいなかった。STEP-5 時点で extension 読込（fail-open）を行い、投稿済み本文の遡及 lint になった。指摘は WARN のみ（key-value 構造行・識別子列挙・テンプレート規定記法 ✅/❌ 由来）で、修正不要の確認を含む適用で完結
- **発生局面**: case-open（Root Case 本文・Definition 変更・PR 本文の作成と投稿）
- **検知方法**: STEP-5 冪等確認前の project-extensions 読込で rules セクションを確認した際、対象文章が既に投稿済みであることに気づいた
- **根本原因**: extensions 読込を worktree 作成・本文組み立て・issue_create/pr_create の後に配置した。extension rules は書込み前プロシージャの前置要素であるが、委譲実行の手順上明示的な前置ステップがなかった
- **自律対応内容**: 投稿後に Issue #3335・PR #3348 本文と宣言行の遡及 lint を実行し、指摘の性格（key-value 構造行・識別子列挙・テンプレート規定記法）を分類して保持判断を記録（修正試行不要の確認を含む適用）。PR #3348 本文へ適用記録を追記
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（rule の適用結果は達成。適用タイミングの過程偏差のみで成果物品質への影響なし）
- **横展開観点**: 並行 case-open・case-run の委譲実行では、worktree 作成や本文組み立ての前に extensions 読込を実施する。rules（when 条件付き skill 適用）は STEP-2 の本文候補生成・STEP-4 の PR 本文生成の前置要素
- **再発条件**: extensions 読込を後段 STEP に置いた委譲実行で、書込み対象文章を先に生成・投稿する場合
- **予防策候補**: workflow skill（case-open 等）の STEP reference に「STEP-2 前に project-extensions 読込を前置する」手順を明示する。または委譲 prompt 生成側で extensions 読込を前置指示に含める
- **想定反映先**: src/common/skills/agentdev-workflow-case-open/references/root-case-and-definition-package.md（STEP-2 前置手順）、agentdev-project-extensions の読込タイミング規約
- **関連**: Root Case #3335・Definition PR #3348・.agentdev/extensions/skills/agentdev-workflow-case-open.yaml
- **タグ**: #extension-timing #yomiyasu #workflow-deviation #case-open

---
## 2026-10-03: REQ 行変更 Definition PR の索引再生成は REQ commit 後に実行する（計測日導出の関係）

- **問題事象**: REQ-099-020 行追加（docs/requirements/REQ-099.md・frontmatter updated 進行）の Definition 変更で、REQ commit 前に generate_indexes.ts を実行して req-health-metrics.md を再生成すると、req-metrics-measurement-example の計測日が REQ 群の commit 前日付（2026-10-02）のまま確定する。REQ commit 後の check_integrity で req-updated-freshness（IR-072・updated 2026-10-03 vs 最終内容変更 commit 2026-10-02）と index-generation-consistency（IR-061/SC-002・計測日不一致）が NG として残る
- **発生局面**: case-open STEP-4 検査期待値確定（Case #3334・OU-004・PR #3351）
- **検知方法**: check_integrity の req-updated-freshness と index-generation-consistency の NG、check_autogen_freshness の [CONTENT_CHANGE]（block_id=req-metrics-measurement-example）
- **根本原因**: generate_indexes の req-metrics 計測日（deriveReqMetricsMeasureDate）は REQ 群の最終 content-change commit（git log %cI）から導出される設計（IR-061 日次再検出の構造的解消）。REQ 行変更を commit する前に派生物を再生成すると、計算基準の commit がまだ存在せず派生物が古い計測日のまま確定する
- **自律対応内容**: REQ 変更 commit（d8df3022）後に generate_indexes.ts を再実行して req-health-metrics.md の計測日を再生成し、同一 PR へ追加 commit（294b3fc4）で含めた。再実行後は check_autogen_freshness 検出鮮度違反 0 件・REQ-099 関連 NG 0 件
- **横展開観点**: case-open references（definition-pr-and-idempotency.md 手順 2.5）の「索引再生成後に checker の結果を取得」は REQ commit 後の再生成を含意するが、commit 前後の実行順序は明文化されていない。REQ 行変更を伴う Definition PR では常に本手順順序が効く
- **予防策候補**: 手順 2.5 へ「REQ 行変更を commit した後に索引再生成を実行し、再生成された派生物を同一 PR へ含める」の明示追補候補（intake 候補としても成立）
- **関連**: Case #3334・PR #3351・draft req-draft-backlog-pool-20261003（AG-004・ACT-REQ-002）
- **タグ**: #index-regeneration #measurement-date #case-open

---

## 2026-10-03: draft target_design パスが実在パスと不一致（ドメイン誤記）でも合意済み宣言として流れ、case-open 実測で発見・実在パスへ解決した

- **問題事象**: draft AG-015（OU-014）の target_design は `docs/designs/responsibilities/checker-execution-contracts.md` を指定するが、実在パスは `docs/designs/integrity/checker-execution-contracts.md`（docs/designs/README.md integrity 表の正規 Design）。responsibilities 配下に同 slug のファイルは存在しない。パス誤記のまま req-define の合意済み artifact_actions（ACT-DESIGN-009）に含まれていた
- **発生局面**: case-open STEP-2/3 対象ファイル実測（Root Case #3355・Definition Package 生成時）
- **検知方法**: 対象ファイルの read（File not found）と docs/designs/README.md Design インデックス integrity 表の slug 実測
- **根本原因**: draft 構成側（req-define の artifact_actions 構成）で target_design パスを実在検証せずに合意へ含めた。ドメイン配置の記憶依存（responsibilities と integrity の混同）
- **自律対応内容**: 実在パス（integrity 配下）へ解決して ACT-DESIGN-009 を適用し、所在補正を Root Case #3355 本文と Definition PR #3359 本文へ記録
- **ユーザー確認の有無**: なし（実在パスが一意に解決でき、合意内容〔Design slug checker-execution-contracts・operation append・節内容〕は不変のため）
- **Decision/REQ/spec影響**: なし（適用先パスの補正のみ）
- **横展開観点**: artifact_actions の target 系パス（target_req・target_design）は、合意済み宣言として扱う前に実在検証（実ファイル存在確認・Design インデックス表 slug 突合）を前置すべき。case-open 側は対象ファイル読取の実測で検知できるが、合意時点で防げる検証は上流（req-define）が担うのが早い
- **再発条件**: draft 構成者がドメイン配置を記憶ベースで指定し、実在検証を経ずに合意へ含める場合
- **予防策候補**: req-define の artifact_actions 構成時に target_design パス実在確認ステップを追加する候補（learning-promote での評価・backlog-review 側への反映判断）
- **想定反映先**: learning-promote 評価、req-define / backlog-review の target 検証追加判断
- **関連**: Root Case #3355・Definition PR #3359・draft req-draft-backlog-pool-20261003（AG-015・ACT-DESIGN-009・OU-014）
- **タグ**: #draft-path-mismatch #target-design #case-open

---

## 2026-10-03: bash パイプ経由 checker 実行の echo "exit=$?" はパイプ最終コマンドの終了コードを返す

- **問題事象**: case-open STEP-4 の PR 作成前 checker 実測（Case #3337・OU-007）で `bun check_autogen_freshness.ts 2>&1 | tail -10; echo "exit=$?"` を実行し、checker が exit=1（鮮度違反 1 件）を返したにもかかわらず `exit=0` を観測して合格と解釈しかけた
- **発生局面**: case-open STEP-4 検査期待値の branch HEAD 実測（Case #3337・OU-007・PR #3358）
- **検知方法**: 再実行（パイプなし・出力ファイル退避後に tail）で exit=1 を確認し、初回読みの誤りを検知
- **根本原因**: `cmd | tail; echo $?` の `$?` はパイプの最終コマンド（tail）の終了コードであり checker 自体の終了コードではない
- **自律対応内容**: 終了コードの取得をパイプなし実行（標準出力をファイル退避後に tail 参照）へ切替し、checker 終了コードを正しく取得して再判定した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（checker 終了コード契約は現行どおり。観測方法の誤り）
- **横展開観点**: checker の終了コード契約（check 系は fail ありで 2・実行エラーで 1・合格 0）を bash パイプ経由の `echo $?` で観測する手順は全 checker 共通で誤観測を生む。references の checker 実測手順はパイプなし実行または PIPESTATUS を前提とすべき
- **再発条件**: bash パイプ経由で checker を実行し `echo $?` で終了コードを確認する場合
- **予防策候補**: checker 実測手順を含む reference（case-open references/definition-pr-and-idempotency.md 等）に「終了コードはパイプなし実行または PIPESTATUS で取得する」注記の追補候補（intake 候補としても成立）
- **想定反映先**: learning-promote での評価・必要なら references の checker 実測手順追補
- **関連**: Case #3337・PR #3358
- **タグ**: #bash-pipeline #exit-code #checker-observation #case-open

---

---

## 2026-10-03: project extension 未読込 deviation の再発（OU-011/OU-012・2例目）

- 問題クラス: workflow deviation（extension 読込漏れ）
- 発生工程: case-open（case-auto 配下の並行委譲実行。Root Case #3340/#3352・Definition PR #3349/#3361）
- 内容: OU-002（Case #3333）と同一パターンが並行委譲の別実行者でも再発。SKILL.md 制御平面（6 STEP）と references のみを読み、STEP-1 で project extension（.agentdev/extensions/skills/agentdev-workflow-case-open.yaml）を読込まず docs 編集と Issue/PR 投稿を実施した。PR 検証欄への yomiyasu 遡及適用記録（対象・実施結果・保持指摘理由の最小限記録）で回復した
- 学び: 同型 deviation が 2 つの独立した委譲実行で再現しており、extension 未読込が並行委譲の構造的リスクであることを実証した。learning-promote の再発性評価に活用できる
- 発見元: Case #3340・#3352（backlog-pool-20261003・OU-011/OU-012）実行時の自工程観測

## 2026-10-03: yomiyasu lint の表行は構造保護で char_count 0 になる（セル抽出が必要）

- 問題クラス: implementation error（検査対象の取りこぼし）
- 発生工程: case-open STEP-6 yomiyasu 遡及適用（Case #3352・REQ-093-004 行検査）
- 内容: REQ 行（Markdown 表行）を lint に渡すと char_count 0 で PASS 判定になる。lint の Markdown 構造保護前処理が表行を文字数計算対象外とするため、表行単体の検査は常に空判定になる
- 学び: REQ 行等の表行を検査する場合は表セル本文を抽出して検査する。PASS 判定を「検査済み」と解釈すると、未検査のまま適用済み扱いになる
- 発見元: Case #3352 実行時の自工程観測

## 2026-10-03: bash pipe 経由の dollar-question は最後のコマンド（tail 等）の終了コードを見る

- 問題クラス: implementation error（検証証跡の誤測）
- 発生工程: case-open STEP-4 branch HEAD 実測（Case #3340・check_integrity 実行）
- 内容: cmd --json を tail へ pipe した形で実行し、表示された EXIT=0 を誤読しかけた。実態は tail の終了コードであり checker 自体は exit 1（NG 4 件）。pipe なしの実行に切替して正しい終了コード EXIT=1 を確認し、証跡を訂正した
- 学び: checker 終了コードを検証証跡に記録する場合は pipe を経由させず、リダイレクトで実行して終了コードを取得する。証跡の exit code は検証対象コマンドと同一プロセスから取得する
- 発見元: Case #3340 実行時の自工程観測
