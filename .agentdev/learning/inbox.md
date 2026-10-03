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

## 2026-10-03: issue_list の labels フィルタは role・バッチ識別に使えない（case ラベル付与の不揃い）

- 問題クラス: workflow deviation（検出手段の信頼性）
- 発生工程: case-open STEP-5 冪等確認・横断依存検査の未クローズ Case 群取得（Case #3364・OU-003）
- 内容: 未クローズ Case 群を labels=["case"] で取得したところ、role=case のオープン Case 18件のうち「case」ラベル付きは #3333・#3337 の2件のみ返却され16件が欠落した。物理ラベル付与が兄弟 Case 間で不揃いであり、labels フィルタの空配列に近い応答を Case 存在の絞り込み根拠にすると重複生成や検出漏れを招く。search なしの unfiltered 一覧（state: open）で全件を取得して回復した
- 学び: issue_list の labels は論理値（role 等）の物理写像の結果であり、role・投入バッチの識別には state と unfiltered 一覧＋タイトル解析を使う。「空配列の成功応答は不存在の証拠としない」原則（REQ-092 系・AG-016）は search トークンだけでなく labels フィルタにも適用される
- 発見元: Case #3364（backlog-pool-20261003・OU-003）実行時の自工程観測

## 2026-10-03: 対応関係の既存 inline 宣言がある Design への sidecar 登録は duplicate-inconsistencies を招く

- 問題クラス: implementation error（対応関係の登録先誤り・検出後に判断変更で回避）
- 発生工程: case-run RA-005（Case #3336・REQ-061-021 design 対応登録）
- 内容: REQ-061-021 の design 対応を traceability sidecar（traceability/agentdev-workflow-case-ready.yaml）へ design セクション新設で登録したところ、case-ready.md の既存 inline 宣言 15件と ID 集合不一致で duplicate-inconsistencies fail。inline 宣言への追加に登録判断を変更して sidecar 登録を取り消し、traceability check 全 pass で解消
- 学び: 同一論理関係（artifact パス × role）を複数情報源が保持する場合、情報源ごとの要件行 ID 集合一致が契約（duplicate-inconsistencies 検出基準）のため、既存 inline 宣言がある Design への対応関係追加は inline 宣言へ追加する。既存宣言の sidecar 集約（移管）は本 Case 対象範囲の拡大となるため不採用
- 発見元: Case #3336（backlog-pool-20261003・OU-005）実行時の自工程観測

## 2026-10-03: checker 実行経路の ESM 互換性は checker 個別に異なる（node 非対応 checker は bun 経由で実行）

- 問題クラス: workflow deviation（実行経路の個別差・事前確認要）
- 発生工程: case-run TS-012 検証（Case #3340・OU-011）の check_changed_docs.ts 実行
- 内容: 安定実行経路（`node --experimental-strip-types` のモジュール import 経由）で check_changed_docs.ts を実行したところ `ReferenceError: require is not defined`（require 残存のため node 非対応）。check_distribution_boundary.ts は同経路で動作する（checker 実行契約「ESM 互換性要件」対応済み）。bun 経由で実行し直して合格を確認
- 学び: 安定実行経路を checker 実行前に適用する際は、当該 checker の require 残存有無を事前確認する。node 非対応 checker は bun 経由へ切替して実行する。同種の実測として traceability check.ts（Bun.YAML 依存）も node では `Bun is not defined` で YAML 解析失敗（Case #3337 case-close 実測・bun 経由で合格）
- 発見元: PR #3377 Findings/learning（Case #3340）＋ case-close 実行時の自工程観測（Case #3337）

## 2026-10-03: IR-055 warning 総数 ratchet の計数対象の構成は checker 実測対照でしか確定できない

- 問題クラス: workflow deviation（検査指標の構成理解の難しさ）
- 発生工程: case-run RA-009 IR-055 warning 総数 ratchet 解消（Case #3338・OU-008）
- 内容: warning total（demote 前・exemptions 適用後の総数）57 > cap 53 の解消において、内訳（baseline-known 40件・exemption 対象 10件・true positive 2件・skill-use-for-boundary 4件・gh-direct-invocation 1件）は checker 実行の実測対照（base と変更後の同条件比較）でしか確定できなかった。baseline-known 40件は demote 対象として実測確認まで実施
- 学び: ratchet 計数対象の構成理解は integrity-contracts.md 側の明文化が望ましい（checker-execution-contracts.md の本 PR 追記で実行面は補完済み）。ratchet 系指標の対応では内訳明細の実測対照を最初に取得する
- 発見元: PR #3378 Findings/learning（Case #3338・backlog-pool-20261003・OU-008）

## 2026-10-03: third-party 取得機構経由の配置は IR-068 登録と exemptions 登録の 2 段構成が必要

- 問題クラス: implementation error（検出器の観測対象の複層性）
- 発生工程: case-run RA-009 SkillProjection 不整合解消（Case #3338・OU-008）
- 内容: third-party 取得機構経由で配置された git 管理外 real-dir（explainer/explainer-book/first-reader/yomiyasu）は checker 上 stale junction として検出される。IR-068 の third_party_skills 登録（INSPECTION-TOLERATED）と skill-use-for-boundary の exemptions 登録（provenance 付き）を併用する 2 段構成で解消した
- 学び: third-party 配置の投影整合は 1 つの登録では完結しない。投影整合検査（IR-068 manifest 登録）と使用境界検査（skill-use-for-boundary exemptions）の双方に登録が必要である旨を実測で確認
- 発見元: PR #3378 Findings/learning（Case #3338・backlog-pool-20261003・OU-008）

## 2026-10-03: LongPathsEnabled 有効環境では Filename too long 部分失敗が再現しない（robocopy 手順の検証構成）

- 問題クラス: workflow deviation（環境差による再現不能・代替検証構成）
- 発生工程: case-run RA-016 TS-018 robocopy /MIR 手順の再現検証（Case #3363・OU-017）
- 内容: LongPathsEnabled 有効環境（HKLM SYSTEM CurrentControlSet Control FileSystem LongPathsEnabled = 0x1）では `rmdir /s /q` が深いネスト（445 文字パス）でも成功し、Filename too long 部分失敗が再現しない。robocopy /MIR 手順の再現検証は深いネスト作成後 robocopy を直接実行する構成で実測値（rc 2・残存 0 件・rmdir rc 0）を取得した
- 学び: Windows パス長制限起因の手順検証は環境設定（LongPathsEnabled）で挙動が変わる。再現検証は「手順の対象となる失敗状態を作ってから手順を実行する」構成で実測し、環境ラベルを実測根拠へ付記する
- 発見元: PR #3379 Findings/learning（Case #3363・backlog-pool-20261003・OU-017）

## 2026-10-03: git worktree remove の Filename too long 部分失敗は robocopy /MIR 手順で解消できる（実用実績）

- 問題クラス: workflow deviation（削除部分失敗・運用文書手順の実用化）
- 発生工程: case-close STEP-6-1 worktree 削除（Case #3355・.worktrees/3355-maintenance・node_modules 深いネスト）
- 内容: `git worktree remove` が「Filename too long」で部分失敗（705 ファイル・144 ディレクトリ残存・worktree 登録は除去済み）。REQ-018-009 の robocopy /MIR フォールバック手順（空ディレクトリ→残存ディレクトリの方向明示・rc 0-7 成功・残存 0 件検証後に rmdir・prune）を実行して rc 2 で全削除・rmdir 成功・prune 完了
- 学び: worktree-operations.md の robocopy 手順は実務で機能する（手順整備 Case #3363 の同日実用実績）。node_modules 配下の深いネストを含む worktree 削除では最初から remove 失敗を想定し、失敗時に robocopy 手順へ即座に切り替える
- 発見元: Case #3355 case-close 実行時の自工程観測

## 2026-10-03: branch が複数コミット構成だと git cherry による squash merge 判定が非等価になる（内容含み判定に切替）

- 問題クラス: workflow deviation（squash merge 済み判定手段の前提差）
- 発生工程: case-close STEP-6-1 branch -D 前の squash merge 済み確認（Case #3355・branch 2 コミット構成）
- 内容: `git cherry origin/main <branch>` が 2 件とも `+`（patch 非等価）を返した。branch が 2 コミット構成の場合、squash merge 後の合算コミットと個別コミットの patch-id は一致しない。変更ファイル範囲の限定（e642dfcf..branch の diff 対象が本 Case ファイルのみ）と、本 Case 変更ファイルの branch HEAD 内容 = origin/main HEAD 内容（`git diff origin/main <branch> -- <files>` が空）で内容含みを判定してから `-D` 削除した
- 学び: squash merge 済み判定は git cherry の patch-id 等価に依存せず、単一コミット構成でのみ一次判定に使う。複数コミット構成では「branch 変更範囲の限定確認 + 変更ファイルの内容一致（diff 空）」で判定する
- 発見元: Case #3355 case-close 実行時の自工程観測

## 2026-10-03: traceability duplicate-inconsistencies は同一 artifact パス × role の sidecar 間配置重複を REQ ID 相違でも検出する

- 問題クラス: implementation error（sidecar 対応関係の配置重複）
- 発生工程: case-run RA-019 sidecar 再編（Case #3360・OU-016・backlog-pool-20261003）
- 内容: check の duplicate-inconsistencies は「同一 artifact パス × role」単位で複数 sidecar 間の配置重複を検出し、対応する要件行 ID が相違していても fail になる（Case #3360 実測: case-auto.md × implementation が agentdev-workflow-case-auto.yaml と japanese-prose-correction.yaml の双方に存在し、REQ ID 相違にもかかわらず検出された。agentdev-workflow-case-auto.yaml 側の case-auto.md エントリ撤去により同実装内で解消）
- 学び: sidecar 間での対応関係の移動・分離は、同一パス × role の単一情報源性を保って行う必要がある。REQ-012-058 の事前突合手順（パス×role 単位）はこの実測性格と一致する
- 発見元: PR #3382 Findings/learning（Case #3360・backlog-pool-20261003・OU-016）

## 2026-10-03: 合意入力時点の pre-existing fail は case-run 実行時点で解消済みの可能性がある（現行 HEAD での再実測を期待値修正の前提にする）

- 問題クラス: workflow deviation（合意済み入力の陳腐化・期待値修正対象の不存在）
- 発生工程: case-run RA-011（Case #3342・OU-013・backlog-pool-20261003）
- 内容: Root Case #3342 合意入力（AG-014）時点で観測された textlint guard テスト 2 件の pre-existing fail は、現行 main HEAD（e642dfcf）の依存生成済み環境で 130 pass / 0 fail を実測し存在しない（worktree・main root 実体の両方で実測）。期待値修正の実施対象なし。解消を担った並行 Case の merge は本実測からは特定していない
- 学び: 合意入力に記録された pre-existing fail は、実行時点の現行 HEAD で依存生成済み環境を再実測してから期待値修正の要否を判断する。解消済みの場合は Findings へ「実施対象なし」を記録し、修正を実行しない
- 発見元: PR #3383 Findings/learning（Case #3342・backlog-pool-20261003・OU-013）

## 2026-10-03: spawnSync 型 timeout 境界の環境変動が suite fail 由来分類を複雑化させる

- 問題クラス: 環境依存（timeout 境界の変動・既知問題の影響範囲確認）
- 発生工程: case-run RA-011 full integrity suite 実測（Case #3342・OU-013・backlog-pool-20261003）
- 内容: IR-055×2・NG21 N16×1 が単独 suite 内でも 15000ms timeout で fail（15047〜15266ms 実測）。RA-012（#3355）の timeout 引上げ修正対象として既に管理されているが、timeout 境界の環境変動が suite の fail 由来分類を複雑化させる
- 学び: spawnSync 型回帰テストの timeout 設定を変更する Case は、check_integrity.test.ts 内 timeout 値（15000ms）も影響範囲に含まれているかの確認を推奨（RA-012・#3355 の影響範囲確認事項）
- 発見元: PR #3383 Findings/learning（Case #3342・backlog-pool-20261003・OU-013）

## 2026-10-03: yomiyasu lint 実行経路は Windows 環境で extension rule の標準入力規定と破損回避指針が緊張する（ファイル引数＋検査後削除で代替実施）

- **問題事象**: case-open STEP-4 の REQ-098 推敲 lint で、project extension rule「yomiyasu-application-before-write」（`.agentdev/extensions/skills/agentdev-workflow-case-open.yaml`）は「同梱 lint を標準入力により実行し、検査専用の本文ファイルを新規保存しない」を規定する。一方、Windows + bash 環境では日本語本文を標準入力（heredoc・inline）へ渡すと escape 解釈・heredoc 打ち切りによるコンテンツ破損の既知リスクがあり、guard 指針（worktree-operations.md「shell inline・heredoc に起因するコンテンツ破損の回避」）はファイルベース伝達を標準手段としており、両規定が緊張する
- **発生局面**: case-open（Root Case 本文・Definition PR 本文の推敲 lint。Case #3388・Definition PR #3389）
- **検知方法**: case-open STEP-4 実行中、extension rules 読込時に標準入力実行規定と guard 指針の矛盾に気づいた（手動確認）
- **根本原因**: extension rule が POSIX 標準入力前提で記述され、Windows 環境の shell inline 破損回避指針との整合が未定義である
- **自律対応内容**: 破損リスクのある標準入力実行を避け、guard 安全な経路（Write ツールによる検査専用本文ファイルの新規作成〔.agentdev/integrity/reports/ 配下・非永続領域〕＋ lint のファイル引数実行＋検査後削除）で Root Case 本文と PR 本文の lint を実行した。指摘は保持条件該当（excess_list・unnatural_halfwidth_space）のみで修正試行 0 回。入力ファイルは検査後に削除し残留なしを確認済み
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（REQ-098 の推敲・lint 確認義務は充足。extension rule 自体の改訂は未実施）
- **横展開観点**: Windows 環境で yomiyasu lint を実行する他工程（case-run の PR 本文・case-close の対応記録等）も同一の緊張に直面し得る
- **再発条件**: Windows + bash 環境で extension rule の標準入力実行規定に従い、heredoc 等で日本語本文を標準入力へ渡そうとした場合
- **予防策候補**: extension rule へ Windows 環境の代替経路（ファイルベース伝達＋検査後削除・非永続領域）を明記する。または worktree 指針の標準手段（(a) 一時スクリプトファイル経由）から extension rule を参照させ、破損回避指針を優先する整合を定める
- **想定反映先**: `.agentdev/extensions/skills/agentdev-workflow-case-open.yaml`（rules）。該当 rule を持つ workflow extension 群の横断確認
- **関連**: Case #3388・Definition PR #3389、agentdev-git-worktree reference「shell inline・heredoc に起因するコンテンツ破損の回避」、`docs/knowledge/windows-git-bash-inline-content-corruption.md`
- **タグ**: `#windows` `#encoding` `#lint実行経路` `#extension-rules`

## 2026-10-03: worktree で bun test 分割1 実行時の src/opencode-local 未伝播起因 fail は main root での同結果実行で由来分類できる

- 問題クラス: 環境依存（worktree の junction 未伝播・fail 由来分類手順）
- 発生工程: case-run bun test 分割1（Case #3388・PR #3390・worktree root cwd）
- 内容: worktree で `bun test ./.opencode/skills/repo-agentdev-integrity/scripts/` を実行すると、src/opencode-local/（ローカル版導入時の環境生成物・junction）が未伝播のため textlint_guard_project_config.test.ts の 2 fail と issue_tracking_list.test.ts の 1 error が再現する
- 学び: main root で同一テストを実行して同結果を確認することで環境依存と由来分類できる（本 Case で実施済み。再発時の由来分類手順として参照可能）
- 発見元: PR #3390 Findings / learning（Case #3388）
