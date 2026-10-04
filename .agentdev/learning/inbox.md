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
- 再観測: Case #3391 Wave 1（PR #3405）でも同 3 fail / 1 error（textlint_guard_project_config 2件・issue_tracking_list 1件、src/opencode-local 不在由来）を worktree・main root の両方で再現し pre-existing と由来分類。opencode-local 領域が存在しない環境でのテスト skip または fallback の要否の検討候補を追記（発見元: PR #3405 Findings / learning）

## 2026-10-03: git push が credential helper（GCM）の対話待ちでハングする（push 限定で credential.helper を gh auth git-credential へ上書きして解消）

- **問題事象**: case-open STEP-4 の head branch push（git push -u origin definition/issue-3391）が credential helper 起動（git credential-helper-selector get → GCM）後にプロンプトなしでハングし、90〜300 秒の timeout で 3 回失敗した。remote 照会（git ls-remote）と gh CLI 操作（agentdev_gh の issue/pr 操作）は正常に動作していた
- **発生局面**: 実装（case-open STEP-4 head branch push。Case #3391・Definition PR #3392）
- **検知方法**: bash 実行の timeout 超過。GIT_TRACE=1 GIT_TRACE_PACKET=1 の観察で credential helper 起動後に出力が停止することを確認
- **根本原因**: credential.helper=manager（Git Credential Manager）がヘッドレス環境で対話 UI 待ちになり、GIT_TERMINAL_PROMPT=0・GCM_INTERACTIVE=never を環境変数で渡しても GCM 自体の待ちが解除されない
- **自律対応内容**: push コマンド単位で `git -c credential.helper= -c "credential.helper=!gh auth git-credential" push ...` と上書きし、gh CLI の keyring トークン（gh auth status で github.com 認証済みを事前確認）で push に成功。push 出力で refspec（definition/issue-3391 -> definition/issue-3391）と upstream 設定を確認済み。恒久設定への変更は行っていない
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（definition-pr-and-idempotency の push 前段手順契約〔push 出力で refspec 確認〕は充足。GitHub I/O 正規経路（agentdev_gh）の迂回ではない。git push は bash 実行 Harness 依存の前段手順）
- **横展開観点**: head branch push・capture 成果物の git 永続化 push 等の全 git push 経路（case-run・case-close・learning-capture・intake-pipeline）で同様のハングが生じ得る。gh auth git-credential への上書きは push 限定の回避手段であり、実行前に gh auth status で認証済みアカウントを確認する
- **再発条件**: credential.helper=manager（GCM）が有効で、トークンが GCM 側に保存されていない・UI 表示不能なヘッドレス環境で git push する場合
- **予防策候補**: ヘッドレス環境の workflow では push 失敗（timeout）時の再試行手順に credential.helper を gh auth git-credential へ上書きする方法を含める。恒久対応は環境設定（GCM へのトークン登録または credential.helper 変更）であり個々の Case では行わない
- **想定反映先**: docs/knowledge/ 配下の Windows 環境 git 関連知識。必要なら agentdev-workflow-case-open reference「PR 作成前の head branch push」への contingency 追記
- **関連**: Case #3391・Definition PR #3392、gh auth status、definition-pr-and-idempotency.md「PR 作成前の head branch push」
- **タグ**: `#windows` `#git` `#credential` `#gh-cli` `#push-hang`

## 2026-10-03: worktree 環境で skills_structure.test.ts の See Also 参照検査が projection 不全で 4 件 fail する（main では pass）

- **問題事象**: worktree 内で skills_structure.test.ts を実行すると、参照先スキル（agentdev-req-file-manager、agentdev-decision-file-manager）の projection が worktree に存在しないため See Also 参照検査が 4 件 fail する。main repo では同種 fail なし（同実行で 1 fail のみ、本変更と無関係な third-party 既存問題）
- **発生局面**: case-run bun test 関連回帰（Case #3391 Wave 1・PR #3401・worktree root cwd）
- **検知方法**: bun test の fail 出力と main root 再実行との比較
- **根本原因**: REQ-018 系の worktree テスト fallback は templates 配置には存在するが See Also 参照検査には存在せず、worktree の projection 欠損を検出側が吸収していない
- **自律対応内容**: 環境差の誤検出として検証差分に記録し、main root での同種 fail なしを確認して完了扱いの根拠とした
- **ユーザー確認の有無**: なし
- **REQ/Decision/Design影響**: なし（既存 fallback 契約の適用範囲の認識差）
- **横展開観点**: worktree で See Also 参照検査を含む構造検査を実行する全工程（case-run 検証・case-close 再検証）で環境差 fail が回帰判定を難読化し得る
- **再発条件**: worktree root cwd で See Also 参照検査を含む構造検査を実行し、参照先スキルの projection が worktree に存在しない場合
- **予防策候補**: See Also 参照検査への worktree fallback 追加（REQ-018 系と同様）または worktree 実行時の無効分類記録契約（link profile の扱いと同型）
- **想定反映先**: repo-agentdev-integrity の skills_structure.test.ts、または checker 実行契約の worktree 実行時扱い
- **関連**: Case #3391・PR #3401 検証差分（無効列の worktree 実行時 fail 4 件）
- **タグ**: `#worktree` `#skills-structure` `#see-also` `#environment-diff`

## 2026-10-03: MSYS bash 経由の cmd //c mklink /J は引数が渡らず対話プロンプトで終了する（junction 作成は node fs.symlinkSync が確実）

- **問題事象**: worktree 内での node_modules junction 作成に MSYS bash から `cmd //c mklink /J` を実行すると引数が渡らず対話プロンプトで終了する。`MSYS2_ARG_CONV_EXCL='*' cmd /c 'mklink /J ...'` の形式では動作する。node の fs.symlinkSync（type: junction、絶対パス target）で実行するのが確実
- **発生局面**: check_templates 実走行検証のための worktree junction 作成（Case #3391 Wave 1・PR #3401 と PR #3403 の両方で観測）
- **検知方法**: mklink 実行後に対話プロンプト待ちで終了し junction が作成されないことの確認
- **根本原因**: MSYS bash のパス変換と引数変換が cmd /c mklink の引数解釈と干渉する（ARG_CONV_EXCL 未指定時）
- **自律対応内容**: node fs.symlinkSync（type: junction）または MSYS2_ARG_CONV_EXCL='*' 付き cmd 実行へ切替して解消
- **ユーザー確認の有無**: なし
- **REQ/Decision/Design影響**: なし
- **横展開観点**: worktree 検査で node_modules junction を作る全工程（check_templates 実走行・bun test 実行準備）で同様の失敗が生じ得る
- **再発条件**: MSYS bash 経由で cmd /c mklink を実行する場合
- **予防策候補**: worktree 運用指針の junction 作成手順へ node fs.symlinkSync を標準として明記
- **想定反映先**: agentdev-git-worktree references worktree-operations.md（検査用 junction 作成手順があれば）
- **関連**: Case #3391・PR #3401 Findings / learning、PR #3403 Findings / capture 候補
- **タグ**: `#windows` `#msys` `#junction` `#bun-test`

## 2026-10-03: worktree 内の bun test が repoRoot 計算で main repo root の SKILL.md を読み、worktree 側編集の検証漏れが生じ得る

- **問題事象**: worktree 内の bun test で既存 process-conformance.test.ts の repoRoot 計算（import.meta.dir から8階層上）は worktree 実行時に main repo root を解決し、main 側の SKILL.md を読み取って green になる。worktree 内テストが古い main 内容で合格し、worktree 側編集の検証漏れにつながり得る
- **発生局面**: case-run 回帰テスト作成（scripts/tests 配下の repoRoot 解決診断。Case #3391 Wave 1・PR #3404）
- **検知方法**: worktree 実行時の repoRoot 解決先の診断
- **根本原因**: repoRoot 計算が import.meta.dir からの固定階層上昇で main root に到達する設計のため、worktree 分離を前提としていない
- **自律対応内容**: worktree 構造系テスト fallback 契約（REQ-018 系）の意図と一致する設計か、期待値参照先の誤りかの確認候補として learning 化
- **ユーザー確認の有無**: なし
- **REQ/Decision/Design影響**: なし（既存契約の解釈確認候補）
- **横展開観点**: import.meta.dir 基準の repoRoot 解決を持つテスト全般が worktree で main 内容を読み得る
- **再発条件**: worktree 内で repoRoot を固定階層上昇で解決するテストを実行する場合
- **予防策候補**: repoRoot 解決の worktree 対応（worktree root を優先する解決規律）または期待値参照先の明示化
- **想定反映先**: scripts/tests 配下の repoRoot 解決実装、REQ-018 系 worktree fallback 契約の確認
- **関連**: Case #3391・PR #3404 Findings / learning
- **タグ**: `#worktree` `#bun-test` `#repoot-resolve` `#false-green`

## 2026-10-03: worktree 内で repo-agentdev-integrity scripts が node_modules 同梱により直接実行可能（main root に依存生成物がなくても動く）

- **問題事象**: `.opencode/skills/repo-agentdev-integrity/scripts/` には node_modules が同梱され、main repo root に node_modules・package.json が存在しない環境でも worktree root から `bun .opencode/skills/repo-agentdev-integrity/scripts/check_content_corruption.ts` 等が直接実行できる
- **発生局面**: case-run 検証環境構築（Case #3391 Wave 1・PR #3400）
- **検知方法**: worktree root からの checker 直接実行の成功
- **根本原因**: 検査スクリプト配置先に依存実体が同梱されている構成（依存生成を要しない実行形態）
- **自律対応内容**: worktree 内検証の実行形態として本構成を活用し、PR 本文へ実行形態の知見を記録
- **ユーザー確認の有無**: なし
- **REQ/Decision/Design影響**: なし
- **横展開観点**: worktree 内検証の実行形態の標準化候補（main root の依存生成状態に依存しない検証経路）
- **再発条件**: なし（有用な構成知見。問題ではなく実行形態の知見として記録）
- **予防策候補**: なし（worktree 検証手順の標準として採用候補）
- **想定反映先**: checker 実行契約の worktree 実行手順、worktree 検証の標準手順
- **関連**: Case #3391・PR #3400 Findings / learning
- **タグ**: `#worktree` `#checker` `#bun` `#node_modules`

## 2026-10-03: traceability sidecar の同一 artifact × role 重複は duplicate-inconsistencies として検出され component 側への単一情報源統合が必要

- **問題事象**: 同一 artifact × role の対応宣言を複数 component 側 sidecar が持つと traceability check の duplicate-inconsistencies が検出される。component 側（正規所有 component の sidecar）へ寄せて単一情報源に統合する必要がある
- **発生局面**: case-run traceability check 修正（Case #3391 Wave 1・PR #3400。conflict-resolution-and-reporting.md の REQ-094 系宣言が agentdev-workflow-case-auto.yaml と japanese-prose-correction.yaml で重複）
- **検知方法**: traceability check の duplicate-inconsistencies findings
- **根本原因**: sidecar 追加時に既存 sidecar の同一 artifact 宣言を確認しない運用
- **自律対応内容**: REQ-094 系既存宣言を単一情報源（component 側）へ統合し再検証で合格
- **ユーザー確認の有無**: なし
- **REQ/Decision/Design影響**: なし（sidecar 運用規律の明確化）
- **横展開観点**: sidecar を追加・編集する全工程（REQ 新設・実装対応登録）で同様の重複が生じ得る
- **再発条件**: 複数 component にまたがる artifact の対応宣言を sidecar に追加する場合
- **予防策候補**: sidecar 追加時の事前確認観点（同一 artifact × role の既存宣言検索）を手順へ明記
- **想定反映先**: agentdev-traceability の sidecar 作成手順、または PR テンプレートの必須品質統制
- **関連**: Case #3391・PR #3400 Findings / learning・検証差分（修正済み 1 件）
- **タグ**: `#traceability` `#sidecar` `#duplicate` `#single-source`

## 2026-10-03: bun x tsc は package 配下の cwd で実行する必要がある（worktree root からだと tsconfig が解決されず help を表示する。bun test とは逆の cwd 規律）

- **問題事象**: `bun x tsc --noEmit` を worktree root から実行すると tsconfig が解決されず help を表示する。bun test は worktree root（./ 付き相対パス指定）から実行する規律と逆であり、bun 系スクリプトの実行 cwd を混同しやすい
- **発生局面**: case-run typecheck（Case #3391 Wave 1・PR #3402。scripts package 配下）
- **検知方法**: tsc 実行結果が help 表示になることの確認
- **根本原因**: tsc は cwd 直下の tsconfig を解決するため、package 配下への cwd 移動が必要（bun test のディレクトリ指定方式と異なる）
- **自律対応内容**: package 配下の cwd で再実行して解消。cwd 規律の混同しやすさを learning 化
- **ユーザー確認の有無**: なし
- **REQ/Decision/Design影響**: なし
- **横展開観点**: scripts package を持つスキル領域（agentdev-issue-management、agentdev-workflow-case-auto 等）での typecheck 実行手順に共通
- **再発条件**: worktree root から bun x tsc を実行する場合
- **予防策候補**: テスト実行形態知識（bun test は ./ 付き相対パス・tsc は package 配下 cwd）の補記
- **想定反映先**: checker 実行契約の typecheck 実行手順、QG 実行手順の cwd 規律注記
- **関連**: Case #3391・PR #3402 Findings / learning
- **タグ**: `#bun` `#tsc` `#cwd` `#typecheck`

## 2026-10-03: textlint guard 系の vendor 未生成 worktree では bun test の pre-existing fail 39 件が回帰判定を難読化する

- **問題事象**: `bun install && bun run build:engine` を実行しない worktree では bun test 全回帰に pre-existing fail 39 件（textlint guard 系の vendor 未生成起因が主体）が継続発生し、当該変更起因の fail の切り分けが難読化される
- **発生局面**: case-run bun test 全回帰（Case #3391 Wave 1・PR #3403。stash による変更前 baseline 42 fail と同系統で本変更起因の新規 fail なしを確認）
- **検知方法**: bun test 全回帰の fail 出力と baseline 実測（stash 前後比較）の照合
- **根本原因**: worktree は plugin package 配下の依存成果物（vendor/）を生成しない構成のため、textlint guard 依存テストが fail する（README の依存生成手順は main root での実行を案内し worktree 手順は未整備）
- **自律対応内容**: baseline 実測で本変更起因 0 件を確認して回帰判定。test 環境整備を capture 候補として記録
- **ユーザー確認の有無**: なし
- **REQ/Decision/Design影響**: なし
- **横展開観点**: worktree で bun test 全回帰を実行する全工程（case-run 検証・case-close QG-4）で fail 切り分けコストが恒常的に発生
- **再発条件**: textlint guard の依存成果物未生成の worktree で bun test 全回帰を実行する場合
- **予防策候補**: worktree 用の依存生成手順の整備（bun install && bun run build:engine の worktree 実行ガイド）または vendor 未生成時の skip/fallback 判定の明示
- **想定反映先**: README「開発者セットアップ」の worktree 手順追記、QG 実行手順の環境ラベル注記
- **関連**: Case #3391・PR #3403 Findings、PR #3405 品質メトリクス（main HEAD で同一再現の既存環境差）
- **タグ**: `#worktree` `#textlint` `#vendor` `#bun-test` `#baseline`

## 2026-10-03: case-run 側で配布依存境界 checker の記録が PR 検証差分に欠落した子 Issue が case-close E4-1 で初検出され blocked になった

- **問題事象**: Case #3391 Wave 1 の #3397（PR #3402）で、PR 本文の検証差分に check_distribution_boundary の記録が存在せず、case-close E4-1 最終 gate（--profile source）で concrete-id 4 件 / concrete-path 2 件を初検出した。E4-1 違反により当該子 Issue は Wave 1 マージ対象外（blocked）となり、Wave 2 前提（Wave 1 全完了）が不充足になった
- **発生局面**: case-close(#epic) Epic #3391 Wave 1 境界クローズ（E4-1 配布依存境界 最終 gate）
- **検知方法**: E4-1 gate の PR HEAD 実行（非ゼロ exit・failures 6 件。main baseline 0 hits で本変更起因と確定）
- **根本原因**: 配布物（SKILL.md・scripts/lib・references）への concrete ID 混入を case-run STEP-S5 事前 gate で検出・記録していない（checker 実行自体が行われたか記録から判断不能）
- **自律対応内容**: E4-1 契約どおり PR #3402 をマージ対象外とし、PR 本文 `### distribution-boundary` へ検出内容を記録、Issue #3397 へ差し戻し報告コメント、Epic ステータス追跡テーブルへ blocked 記録
- **ユーザー確認の有無**: なし（E4-1 契約の機械的適用）
- **REQ/Decision/Design影響**: なし（配布依存境界 Design の最終 gate 基底どおりの動作）
- **横展開観点**: case-run STEP-S5 の事前 gate が省略・漏れでも最終 gate で停止する二重構造は機能した。ただし case-run 段での検出があれば Wave 境界での blocked と Wave 2 前提崩れ（case-run 差し戻しの追加ラウンド）を避けられた
- **再発条件**: case-run 側で配布物に concrete ID を含む実装を行い、check_distribution_boundary を実行・記録せずに PR を作成する場合
- **予防策候補**: case-run STEP-S5 の checker 実行記録を PR 本文品質メトリクス表の必須行とする（記録欠落自体を検査する形）。または PR テンプレートの品質メトリクス表へ配布依存境界行を必須追加
- **想定反映先**: case-run command STEP-S5 手順、PR テンプレート（agentdev-workflow-templates）
- **関連**: Case #3391・PR #3402（### distribution-boundary 記録）・Issue #3397 差し戻し報告コメント
- **タグ**: `#distribution-boundary` `#gate` `#case-run-records` `#wave-boundary`

## 2026-10-03: Epic の事前記録マージ順序を守った場合の Wave 1 rebase コンフリクトはすべて sidecar・本文追記の相互非競合和集合で解消できた

- **問題事象**: Epic #3391 Wave 1 の 5 PR マージで 3 件の CONFLICTING が発生したが、すべて traceability sidecar または SKILL.md 共通制約への別箇所追記の衝突であり、両側追記を保持する和集合解消（実装内容変更なし）で Level 1 rebase を完結できた
- **発生局面**: case-close(#epic) Wave 1 マージ（#3394・#3398・#3396 の rebase。Epic 競合リスク情報の記録順序 case-close 重複 #3394→#3396・case-auto 重複 #3395→#3398→#3396 は守られた）
- **検知方法**: 各マージ直前の pr_mergeable 再確認（UNKNOWN ポーリング後の CONFLICTING 遷移）
- **根本原因**: 重複許容（同一 SKILL.md の節単位追記）を Wave 構成で採用したため、先にマージした側の行追記と後続側の同一行編集がコンテキスト競合する。Epic の「後続側が rebase で整合させる」契約どおり後続側 rebase で解消
- **自律対応内容**: 3 件とも rebase コンフリクトを両保持で解消（traceability/agentdev-workflow-templates.yaml、traceability/agentdev-workflow-case-auto.yaml、case-close SKILL.md 共通制約 2 bullet）。merge 後 main HEAD で配布依存境界 gate 再実行（ok、0 hits）を確認
- **ユーザー確認の有無**: なし（Level 1 機械的解消の範囲内）
- **REQ/Decision/Design影響**: なし
- **横展開観点**: 重複許容の Wave 構成では sidecar・本文追記の同型コンフリクトが Wave 境界で定型的に発生し得る。和集合解消が機械的に可能な形（独立 bullet・独立エントリの追記）に実装を収めることが Level 1 完結の条件
- **再発条件**: 同一 SKILL.md の同一リスト・同一 sidecar セクションへ複数子 Issue が追記する Wave 構成の場合
- **予防策候補**: 重複許容時の実装ガイド（追記位置を独立 bullet に保つ、sidecar へは component 別 sidecar に分離）を Epic 構成の競合リスク情報へ追記
- **想定反映先**: case-ready の Wave 構成（競合リスク情報の処置記述）、agentdev-workflow-case-auto のコンフリクト解消 Level 1 手順
- **関連**: Case #3391・PR #3404/#3405/#3403 のコンフリクト解消記録コメント
- **タグ**: `#epic-wave` `#rebase` `#level1` `#sidecar` `#merge-order`

## 2026-10-03: E4-1 配布依存境界 gate 違反の解消は配布物本文の名称参照化と sidecar 集約で完結した（case-run 差し戻し → 再マージ）

- **問題事象**: E4-1 gate 違反（concrete-id 4 件 / concrete-path 2 件）で blocked だった #3397（PR #3402）の解消。違反 6 件を配布物本文（SKILL.md、scripts/lib/reconcile.ts、references/issue-operation-safety.md）から除去し名称参照（Case Issue 工程記録モデルの REQ 文書、Custom Tool 操作契約 Design、Epic Issue ステータス追跡テーブル更新節の単一書き手制約）へ変更、対応関係は traceability/agentdev-issue-management.yaml（REQ-101-011 / REQ-101-013 宣言は変更なしで維持）へ集約
- **発生局面**: case-run 差し戻し対応（fix commit cc3bb90f）→ case-close(#epic) Wave 1 追加クローズ（Case #3391・PR #3402 再マージ 42d57d1e）
- **検知方法**: E4-1 gate 再実行（check_distribution_boundary.ts --profile source、PR HEAD cc3bb90f。ok: true、scanned 367、concrete_id 0 / concrete_path 0 / fixed_url 0 / producer_metadata 0、failures 0）
- **根本原因**: 配布 skill 本文に正本文書の concrete ID / concrete path を記述した（対応関係の正は traceability sidecar。本文が持つべきは名称参照のみ）
- **自律対応内容**: gate 違反 6 件解消 → PR HEAD 更新 → E4-1 再実行合格 → squash merge → QG-4 判定（4 達成 / 2 未達維持・#3399 割当て）で completed クローズ → Epic ステータス追跡テーブル blocked→completed 更新。テスト回帰（fixture 失敗注入 11 pass、skills_structure 465 pass）・typecheck・traceability check の期待値更新は不要だった（本文参照形式の変更がコード・テスト・sidecar に波及しない構成）
- **ユーザー確認の有無**: なし（機械的 gate・QG 判定の範囲内）
- **REQ/Decision/Design影響**: なし（配布依存境界 Design の解消パターンどおりの動作）
- **横展開観点**: 違反の解消パターン「本文から concrete ID / path を除去、参照性質の記述は名称参照のみ、対応関係は sidecar へ集約」で標準化可能。blocked 解消は Wave 1 追加クローズ（単一子 Issue の再マージと Epic テーブル 1 行更新）として Epic 全体の Wave 反復を乱さず完結できた。検出側の学びは既出エントリ（case-run 側で checker 記録欠落が E4-1 初検出 → blocked）を参照
- **再発条件**: 配布物本文に新規参照を追記する実装を行う場合（解消側の予防対象）
- **予防策候補**: 配布物本文への参照追記時は名称参照とし、ID / path レベルの対応は sidecar に書く規律を PR 作成時の確認観点へ
- **想定反映先**: agentdev-issue-management の規定（SKILL.md・issue-operation-safety.md に規律追記済み）、配布依存境界 Design の解消パターン例示
- **関連**: Case #3391・PR #3402（### distribution-boundary 解消記録）・Issue #3397 QG-4 判定コメント（https://github.com/yogata/agent-dev-flow/issues/3397#issuecomment-5968851030）
- **タグ**: `#distribution-boundary` `#gate` `#blocked-recovery` `#name-reference` `#sidecar`

## 2026-10-03: worktree 再作成（差し戻し後）では gitignore 対象の node_modules が復元されず bun x tsc が依存解決失敗になる（bun install 事前実行が必要）

- **問題事象**: 差し戻し対応で worktree を再作成したところ、gitignore 対象の node_modules が復元されず bun x tsc が依存解決失敗になった。worktree 再作成後の再検証では bun install の事前実行が必要
- **発生局面**: case-run 差し戻し対応後の再検証（Case #3391・PR #3402・.worktrees/3397-feature 再作成）
- **検知方法**: bun x tsc 実行時の依存解決失敗
- **根本原因**: node_modules は gitignore 対象のため worktree 間・再作成間で引き継がれない（scripts package 配下の依存が空のまま検証を実行すると失敗する）
- **自律対応内容**: bun install を事前実行して依存を復元してから再検証し合格
- **ユーザー確認の有無**: なし
- **REQ/Decision/Design影響**: なし
- **横展開観点**: worktree 再作成を伴う全再検証（blocked 差し戻し対応、再マージ前の gate 再実行、QG 再検証）で同様の依存欠落が生じ得る。bun test 実行形態契約と同じ前置きの位置
- **再発条件**: gitignore で node_modules を除外する構成で worktree を削除・再作成して検証を実行する場合
- **予防策候補**: worktree 再作成後の検証手順の前置きとして bun install を明記（bun test 実行形態知識への補記候補。PR #3402 Findings / learning と同型）
- **想定反映先**: case-close references/docs-and-design-promotion.md の bun test 実行形態契約周辺、bun 系スクリプト実行手順の cwd・依存前提注記
- **関連**: Case #3391・PR #3402 Findings / learning、既出の bun x tsc cwd 規律エントリ（package 配下 cwd）
- **タグ**: `#worktree` `#node_modules` `#bun-install` `#rerun`

## 2026-10-03: 同一概念を複数モジュールで別識別子実装すると静的破棄が silently 起きる（識別子の型共有か語彙一致機械検査を併設）

- **問題事象**: applyReflectEntry が語彙外行を含むブロックを applied=true で返し、既存エントリを削除した本文を適用していた。複数モジュール（record-comments.ts / records-report.ts / epic-reflect.ts）が同一概念（記録契機）を別識別子（start/handoff/halt と start/handover/stop 系）で実装していたことが原因
- **発生局面**: case-run（Case #3391・Wave 2 #3399・TS-006 横断検証の F-1 検出）
- **検知方法**: epic-reflect CLI を fixture 駆動した実経路確認でエントリ破棄を再現、rg による語彙横断照合で3経路分岐を特定
- **根本原因**: 識別子がモジュールごとに独立定義され、語彙差異が実行時まで検出されない。epic-reflect 側は語彙外値を parse 失敗として静かに破棄した
- **自律対応内容**: 語彙を record-comments.ts RECORD_KINDS 側へ統一（実体の多い側へ寄せ、テンプレート実体ファイル名と直結）、epic-reflect.ts / records-report.ts / SKILL.md / coordination.md を追従、CLI へ語彙検証・applyReflectEntry へ語彙外行検出時の applied=false 防御を追加、「記録契機語彙の3経路一致」回帰テストを新設
- **ユーザー確認の有無**: なし（Issue 対象範囲内の修正）
- **REQ/Decision/Design影響**: REQ-101-005 の Design 委譲事項として issue-lifecycle-records Design へ識別子・写像規則の確定値を追記（確定の履行）
- **横展開観点**: 識別子を複数モジュールで共有する場合は型による共有（同一モジュールからの export）または語彙一致の機械検査を併設するのが有効。別実装したまま放置すると applied=true の静的破棄が silently 継続する
- **再発条件**: 同一概念の識別子を複数モジュールで独立定義し、語彙差異を検出する機械検査がない場合
- **予防策候補**: 識別子定義の単一モジュール集約（export 共有）または語彙一致テストの必須化
- **想定反映先**: learning-promote での評価。REQ-101 系・共通識別子を扱う workflow skill 実装手順への横展開候補
- **関連**: Case #3391・PR #3406（F-1 修正記録、記録契機語彙の3経路一致テスト）・issuecomment-5969313754
- **タグ**: `#identifier-consistency` `#silent-data-loss` `#regression-test` `#multi-module`

## 2026-10-03: 列位置前提の正規表現置換はテーブル形式追加時に既存列を破壊する（ヘッダー列名で判別する）

- **問題事象**: tracking-table.ts の replaceChildStatus が旧4列形式（ステータス列=最終列）を前提とした正規表現で新4列形式（# / Issue / ステータス / 内容）の内容列まで置換対象に含め、内容列を破壊した
- **発生局面**: case-run（Case #3391・Wave 2 #3399・TS-006 横断検証の F-2 検出）
- **検知方法**: epic-reflect CLI fixture 駆動で新4列形式の内容列破壊を再現
- **根本原因**: 列位置（最終列がステータス）を暗黙前提とした正規表現。新形式は列数が同じ4列のため列数では判別できず、ヘッダー列名（ステータス列位置）での判別が必要
- **自律対応内容**: テーブルヘッダーからステータス列位置を特定する実装へ変更し、内容列を保持。closing の内容列保持の回帰テストを追加
- **ユーザー確認の有無**: なし（Issue 対象範囲内の修正）
- **REQ/Decision/Design影響**: なし
- **横展開観点**: 列位置前提の正規表現置換は、テーブル形式の追加・変更時に既存列を破壊する類型の不備である。形式が複数存在するデータの列操作はヘッダー列名を情報源にする
- **再発条件**: テーブル形式の複数世代が共存するデータへ列位置前提の置換を実行する場合
- **予防策候補**: 列特定はヘッダー列名起点で行い、複数形式世代の共存を前提とした回帰テストを併設
- **想定反映先**: learning-promote での評価。Epic 追跡テーブル等の構造化データ操作スクリプト実装手順への横展開候補
- **関連**: Case #3391・PR #3406（F-2 修正記録）・agentdev-epic-tracker tracking-table.ts
- **タグ**: `#regex-replacement` `#table-format` `#column-position` `#regression-test`

## 2026-10-04: bash heredoc 経由のスクリプト書込みはバックスラッシュが転送層で消費される（バックスラッシュなし実装で回避）

- **問題事象**: case-open STEP-4 の artifact_actions 一括適用のため、Write ツールで workspace 外 temp へ JS スクリプトを書込もうとすると書込み guard（fail-closed）で block され、bash heredoc（quoted 'EOF'）で temp へ書込んだところ、JS 正規表現リテラルのバックスラッシュ（`\d`、`\\`、`\s`）が転送層で消費され SyntaxError が 2 回発生した。quoted heredoc でもバックスラッシュは保護されない
- **発生局面**: case-open STEP-4 artifact_actions 適用スクリプト作成（Root Case #3407・Definition PR #3408）
- **検知方法**: node 実行時の SyntaxError（Invalid regular expression / Unmatched ')'）で破損位置が特定された
- **根本原因**: harness の bash コマンド転送層が heredoc 内容のバックスラッシュをエスケープ解釈して除去する。shell エスケープではなく転送層の処理のため quoted heredoc でも防げない
- **自律対応内容**: 正規表現とエスケープシーケンスを一切使わない純文字列処理実装（String.fromCharCode(13)、文字クラス内バックスラッシュなし正規表現、行配列走査による見出し発見）へ書き直し、dry-run 検証後に適用して 75 actions 全件成功
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（worktree 操作の書込み guard 指針は維持。temp 書込みは pre-approved dir への bash 標準手段）
- **横展開観点**: heredoc でスクリプト・設定ファイルを書込む全工程（検査スクリプト・一時ツール作成）で同様の破損が生じ得る。バックスラッシュを含む内容は heredoc に書かない
- **再発条件**: bash heredoc 経由でバックスラッシュを含むファイル内容を書込む場合
- **予防策候補**: heredoc 書込み対象はバックスラッシュフリー実装にする。または base64 等の中間エンコード経由で転送する
- **想定反映先**: learning-promote での評価。worktree-operations.md「shell inline・heredoc に起因するコンテンツ破損の回避」への追補候補
- **関連**: Root Case #3407・Definition PR #3408、docs/knowledge/windows-git-bash-inline-content-corruption.md（同系知識）
- **タグ**: `#heredoc` `#backslash` `#script-write` `#content-corruption`

## 2026-10-04: check_integrity は既存 REQ 作成 commit の `sha^:path` 参照で git fatal を stderr へ出すが JSON 出力は有効（stderr 分離取得が必要）

- **問題事象**: case-open STEP-4 の commit 後 checker 実測で `bun check_integrity.ts --json 2>&1` を実行すると、REQ-088/094/095 の作成 commit（a098b0f1 等）に対する `fatal: path ... exists on disk, but not in '<sha>^'` が stderr に複数行出力され、stdout JSON と結合して JSON パースが失敗した。2>&1 をやめて分離取得すると同 fatal が出続けても checker は exit 1 で有効な JSON を返し、NG 計上（summary）は正常に読めた
- **発生局面**: case-open STEP-4 検査期待値の commit 後実測（Root Case #3407・Definition PR #3408）
- **検知方法**: JSON パースエラー（Unexpected token 't'、fatal メッセージが先頭に混入）
- **根本原因**: checker 内部の REQ 履歴 diff 取得が REQ 新規作成 commit の親（`sha^`）を参照し、git が fatal を stderr へ出す。checker 自体は続行して JSON を stdout へ出力する。`2>&1` による結合が原因
- **自律対応内容**: stderr を別ファイルへ退避する分離取得へ切替し、fatal は環境条件の出力として記録しつつ JSON 実測値を正常取得した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（checker 終了コード・JSON 契約は現行どおり。観測方法の誤り）
- **横展開観点**: check_integrity の実測を JSON で取得する全工程（case-open/case-run/case-close・IR-055 実測）で同様の stdout 汚染が生じ得る。REQ 新規作成直後の repo では特に発生しやすい
- **再発条件**: REQ 作成 commit の親参照が fatal になる状態で `2>&1` により checker 出力を結合取得する場合
- **予防策候補**: checker JSON 実測手順は stderr 分離取得（標準出力をファイル退避・stderr は別ファイルまたは /dev/null）を標準とする注記の追補候補（intake 候補としても成立）
- **想定反映先**: learning-promote での評価。case-open references/definition-pr-and-idempotency.md の checker 実測手順注記候補
- **関連**: Root Case #3407・Definition PR #3408、check_integrity.ts（REQ freshness 系検査）
- **タグ**: `#check-integrity` `#stderr` `#json-parsing` `#checker-observation`

## 2026-10-04: .agentdev 配下の git 管理対象 domain state が untracked のまま工程間で残留し、Form Zero（git rm + 明示パス commit）が成立しない

- **問題事象**: case-ready STEP-7 の draft 削除時に `.agentdev/drafts/req-draft-issue-contract-simplification.md` が untracked（REQ-061-040 は `git rm` + 明示パス commit 同一ステップを正規形とする）であり、git rm を適用できず物理削除のみとなった。同じく `.agentdev/jev-observations/` 62 ファイルも untracked 残留（REQ-090-006 は観測を git 管理対象の domain state と定義）。`.gitignore` は両者を除外していない（管理対象であることの裏取り済み）
- **発生局面**: case-ready STEP-7 draft / RU 削除（Root Case #3407・PR #3408）
- **検知方法**: `git check-ignore`（exit 1 = 管理対象）と `git status --short` の `??` 表示の突合
- **根本原因**: domain state を保存する工程（req-define の draft 保存、各 workflow の Jev evaluate による観測永続化）が保存時に git 永続化まで完了せず、untracked のまま次工程へ引き継いでいる
- **自律対応内容**: draft は git 管理外のため物理削除（rm）で完了（git 永続化対象 0 件を検証記録へ記録）。deviation 自体を本 entry として learning capture（明示パス commit）
- **ユーザー確認有無**: なし（実観測事実の記録。保存側工程の規律変更はしない）
- **Decision/REQ/spec影響**: なし（REQ-090-006・REQ-061-040 の現行契約は維持。運用の永続化漏れの記録）
- **横展開観点**: draft・jev-observations・promoted 等の保存 workflow 全般で同様の untracked 残留が生じ得る。blocked/failed 中断時は draft 保持が正なので、残留自体が即違反ではないが、成功時の削除契約が git rm を前提とする点で永続化と削除の対が崩れる
- **再発条件**: 保存系 workflow が git commit を伴わずに domain state を保存した状態で、後続工程の Form Zero 削除・同期確認が実行される場合
- **予防策候補**: 保存系 workflow への「保存と同時の明示パス commit」規律追加、または次工程入口での untracked domain state 検出（learning-promote / intake-promote 等の STEP での `git status --short` 確認）の追加候補
- **想定反映先**: learning-promote での評価。req-define・case-open references の保存手順、agentdev_jev 観測永続化の手順注記候補
- **関連**: Root Case #3407・PR #3408、.agentdev/README.md 状態表（drafts・jev-observations は git 管理対象）、REQ-061-040・REQ-090-006
- **タグ**: `#untracked` `#form-zero` `#git-persistence` `#domain-state`

---

## 2026-10-04: 破壊的な構造様式変更では src テスト green のみならず integrity suite・scripts/self の pin 型テスト群が必ず追随漏れを生む

- **問題事象**: bun test 分割①初回実行時、旧契約を検査するテストの期待値が 44 件 fail した。検査基盤（integrity suite・scripts/self）では「3点セット（baseline・除外定義・検査文言）」に加えて「配布物文言 pin 型テスト（配布物の規律文言を expect するテスト群）」が旧契約の正を pin しており、破壊的な構造様式変更では pin 型テスト群が追随漏れを生む
- **発生局面**: case-run 分割①③ 実行（Root Case #3407・PR #3409）
- **検知方法**: bun test 分割①の fail 由来分類（3点対照〔単独再実行・分岐点 main root 再現・baseline 差し替え不要〕）
- **根本原因**: structure-migration-followup-checklist.md の 3点セット指針が pin 型テスト群を明示対象に含めていなかった
- **自律対応内容**: 旧契約期待値テスト 42 件を新契約へ同一変更で更新し 0 件を確認（PR #3409 本文の検証差分に記録）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（検査基盤の期待値更新は同一変更の範囲内）
- **横展開観点**: 構造様式変更の Case では、src テスト green のみで追随完了を判定せず、integrity suite・scripts/self の pin 型テスト群の追随を bun test 3 分割の全 green（当該変更起因 fail 0 件）で判定する。3点セット指針の pin 型テスト群への拡張が learning-promote の評価候補
- **再発条件**: 配布物の規律文言・章構造・状態値等を expect する pin 型テストが存在する状態で、当該文言・構造を破壊的に変更する Case を実行する場合
- **予防策候補**: structure-migration-followup-checklist.md への「pin 型テスト群の期待値更新」追補候補（intake 候補としても成立）
- **想定反映先**: learning-promote での評価。docs/knowledge/structure-migration-followup-checklist.md の指針拡張候補
- **関連**: Root Case #3407・PR #3409（bun test 分割①初回 44 fail → 修正後 0・当該変更起因）・structure-migration-followup-checklist.md
- **タグ**: `#pin-tests` `#structure-migration` `#integrity-suite` `#3-point-set`

## 2026-10-04: 配布依存境界 最終 gate の concrete-id 検出は Design の REQ 行 ID の配布物直書きを正確に検出し、節名参照への置換で feedback loop が完結する

- **問題事象**: なし（機能した検出の記録）。配布依存境界 最終 gate の concrete-id 検出が「Design の REQ 行 ID（REQ-NNN-NNN 形式）を配布物本文へ直書きした」箇所を正確に検出した（初回 3 件）
- **発生局面**: case-run 配布依存境界 最終 gate 実行（Root Case #3407・PR #3409）
- **検知方法**: check_distribution_boundary.ts --profile source の concrete_id_hits
- **根本原因**: （検出が正だった事例）配布物本文への REQ 行 ID 直書きは配布依存境界違反であり、節名参照（「〜REQ 条項」表記）への置換で解消すべき
- **自律対応内容**: concrete ID 除去・節名参照置換で 3 件を解消し、違反 0 件を確認（commit 471fc59d）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（detector の検出契約は現行どおり。検出→修正の feedback loop が機能した事例の記録）
- **横展開観点**: 配布物本文を書く工程（workflow skill の本文更新等）では REQ 行 ID の直書きを避け節名参照を使う。detector がこの規律を機械的に担保していることを確認できた
- **再発条件**: 配布対象 skill/command の本文に REQ 行 ID を引用する場合
- **予防策候補**: 配布物本文の執筆規約として「節名参照」を明示する注記候補（learning-promote 評価候補）
- **想定反映先**: learning-promote での評価
- **関連**: Root Case #3407・PR #3409・commit 471fc59d、check_distribution_boundary.ts（IR-059）
- **タグ**: `#distribution-boundary` `#concrete-id` `#feedback-loop` `#ir-059`

## 2026-10-04: main root での bun test は path 深さ依存テストの fail を観測する（worktree では green・main root では fail する逆転を含む）

- **問題事象**: merge 後 main root での bun test 正規形再実行で、worktree 実行時には観測されなかった fail 2 種が出た。(1) process-conformance.test.ts（PR #3332 由来）が import.meta.dir から 8 段遡りの repoRoot 計算で main root（8 段）では ENOENT・.worktrees/<slug>（9 段）でのみ正しく解決し worktree では green。(2) skills_structure.test.ts の「projection-only placements」テストが main root の project-local skill 存在（explainer 等 5 件）で fail し、junction 未伝播の worktree では fail-open で pass
- **発生局面**: case-close STEP-5 の merge 後 main root bun test 正規形（Root Case #3407・PR #3409）
- **検知方法**: bun test 3 分割の worktree 実行（①2650・②244・③591）と main root 実行（①2661・②237・③591）の N/M 件数差と fail 内訳の照合。テスト未変更（git diff 9dcf2665..a6870104 空）と projection-only 集合不変による baseline 同一条件の決定的判定
- **根本原因**: baseline 既存テストの repoRoot 計算（import.meta.dir 固定段数）と走査前提（junction 実在環境）が .worktrees/<slug> 構造に依存し、main root の実行環境差として現れる
- **自律対応内容**: 4 fail を base 既知・main root 環境依存として由来分類し検証証拠コメント（Issue #3407 comment 5974678572）へ evidence 化。当該変更起因 0 件の判定は維持
- **ユーザー確認有無**: なし（分類の機械的確定は diff 空 + 環境同一で成立）
- **Decision/REQ/spec影響**: なし（bun test 実行形態契約は維持。baseline 既知欠陥の記録）
- **横展開観点**: QG-4 の bun test 実測を worktree だけでなく merge 後 main root でも実行すると、worktree 構造に依存したテストの fail が観測される。main root 実測を case-close の標準とする現行契約は、この種の base 既知欠陥を機械的に可視化する。fail 由来分類（base 既知・環境依存・当該変更起因）の evidence 化が効く
- **再発条件**: .worktrees/<slug> 深さを前提にした repoRoot 計算や projection 走査前提のテストが存在する状態で、main root で bun test 正規形を実行する場合
- **予防策候補**: repoRoot 計算の訂正（process-conformance の段数・skills_structure の project-local skill 許容リスト）は後続 Case の対応対象候補（intake 候補としても成立）
- **想定反映先**: learning-promote での評価。後続 Case での baseline 既知欠陥修正の根拠
- **関連**: Root Case #3407・PR #3409・merge commit a6870104、process-conformance.test.ts・skills_structure.test.ts（PR #3332 由来）・検証証拠コメント（Issue #3407 comment 5974678572）
- **タグ**: `#bun-test` `#path-depth` `#main-root` `#worktree-divergence` `#base-known`

## 2026-10-04: worktree 内で依存生成を伴う checker 実行時は Git Bash $(pwd) の POSIX パスと bun --root の組合せに注意し、対象 0 件の合格を検査不能と区別する

- **問題事象**: worktree 内で依存生成（bun install + bun run build:engine）を伴う checker（agentdev-textlint-guard gate.ts 等）を実行する場合、Git Bash の `$(pwd)` は POSIX 形式パス（`/c/...`）を返すため bun スクリプトの `--root` には Windows 形式の絶対パスを明示する必要がある。POSIX パスを渡すと対象解決が空振りして「0 inspected で PASS」になる
- **発生局面**: case-run QA review 文章表層品質 最終検査（textlint gate）の worktree 実行（Root Case #3410・PR #3417・Issue #3412）
- **検知方法**: PR #3417 本文検証差分の textlint gate 行（PASS 561ファイル検査・hard violations 0）と Findings / Capture候補の intake 記録
- **根本原因**: Git Bash 環境の `$(pwd)` と bun スクリプト（Windows 形式 path 解決）の間のパス形式ミスマッチ。対象解決 0 件が成功扱いになる fail-open の穴
- **自律対応内容**: 本 learning 記録。checker 実行は実体対象が検査されたことを確認してから合格扱いとする運用を維持
- **ユーザー確認有無**: なし（PR 本文記録の回収）
- **Decision/REQ/spec影響**: なし（現行運用規律の確認と記録）
- **横展開観点**: bun 系 checker の `--root` 受け渡しでは Windows 形式絶対パスを明示する。検査対象 0 件の合格を「検査不能」と区別しないと fail-open の穴になる（intake 候補としても分離記録済み）
- **再発条件**: worktree 内で依存生成を伴う checker を Git Bash から `$(pwd)` 展開のパスで起動する場合
- **予防策候補**: checker 実行手順の `--root` 指定に Windows 形式絶対パス明示を追記する候補
- **想定反映先**: learning-promote での評価。agentdev-textlint-guard 実行手順の追補候補
- **関連**: Root Case #3410・PR #3417・Issue #3412（TS-002 実行時並列性検証の worktree 実行）
- **タグ**: `#git-bash` `#posix-path` `#bun` `#fail-open` `#textlint-gate`

## 2026-10-04: integrity suite の pre-existing fail 3件+error 1件は src/opencode-local/ 削除にテスト側期待が追随していない陳腐化

- **問題事象**: integrity suite（bun test 分割①）の既知 pre-existing fail 3件 + error 1件（textlint_guard_project_config.test.ts 2件・issue_tracking_list.test.ts 1件）は `src/opencode-local/` 削除（commit eecb5b03）にテスト側期待が追随していない陳腐化である。textlint_guard_project_config.test.ts の期待対象 `src/opencode-local/README.md` は削除済みで HEAD に不在、issue_tracking_list.test.ts は `src/opencode-local/agentdev-gh/runner-local.ts` の module 不在で error
- **発生局面**: case-run bun test full suite・分割①の fail 由来分類（baseline 再現確認付き・Root Case #3410・PR #3419・Issue #3413）
- **検知方法**: baseline 5d94dd7c の detached worktree で同一テスト再実行し、fail 3件 + error 1件の全件が baseline で再現することを確認（stash 不使用・検証後 worktree 削除済み）
- **根本原因**: `src/opencode-local/` 削除（eecb5b03）時にテスト側の期待値・import が追随更新されていない
- **自律対応内容**: 本筋 Case の対象範囲外のため修正せず、pre-existing 分類の根拠を baseline 再現確認で確定して PR 本文に記録。修正（テスト側の追随更新）は別途提案
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（未登録既知欠陥の合格根拠使用なし・由来分類の evidence 化のみ）
- **横展開観点**: ディレクトリ削除を伴う変更では integrity suite・scripts/self の pin 型テスト群の追随を bun test 3 分割で確認する。テスト側期待の陳腐化は baseline 再現確認で由来分類できる
- **再発条件**: テストが実在を期待するパスを削除する変更を実行する場合
- **予防策候補**: テスト側の追随更新を後続 Case で実施する（textlint_guard_project_config.test.ts・issue_tracking_list.test.ts）
- **想定反映先**: learning-promote での評価。後続 Case の baseline 既知欠陥修正の根拠
- **関連**: Root Case #3410・PR #3419・Issue #3413・commit eecb5b03（src/opencode-local/ 削除）・baseline 5d94dd7c
- **タグ**: `#integrity-suite` `#pre-existing-fail` `#stale-test` `#baseline-reproduction`

## 2026-10-04: worktree での bun test 分割③は plugins junction 未伝播により plugins 分割が未実施となる。環境差を実行記録へ明示記録する運用を継続する

- **問題事象**: worktree での bun test 分割③（repo ルート系 guard テスト）は plugins junction 未伝播により plugins 分割が未実施となる。未実行対象を実行済みとして扱わず `./scripts/` のみ実施として記録
- **発生局面**: case-run bun test full suite・分割③（Root Case #3410・PR #3419・Issue #3413）
- **検知方法**: worktree の `.opencode/skills/` junction 未伝播（plugins dir 不在確認済み）と PR 本文への明示記録
- **根本原因**: worktree 構造上の junction 未伝播（既知の環境差。checker 実行契約「link profile の worktree 実行時の扱い」と同種）
- **自律対応内容**: PR 本文へ環境差（junction 未伝播・plugins 分割未実施）を明示記録。既存契約のとおり環境差を実行記録から判別可能に扱った
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（bun test 実行形態契約の環境ラベル記録は現行どおり）
- **横展開観点**: worktree 実行で構造的に検証不能な対象は未実施であることを明示記録し、実行済みと扱わない運用が継続する点を learning として記録
- **再発条件**: worktree 内で plugins 領域を走査対象に含むテスト・検査を実行する場合
- **予防策候補**: 特になし（現行の明示記録運用の継続）
- **想定反映先**: learning-promote での評価
- **関連**: Root Case #3410・PR #3419・Issue #3413・checker 実行契約「link profile の worktree 実行時の扱い」
- **タグ**: `#worktree` `#junction` `#bun-test` `#environment-label` `#explicit-recording`

## 2026-10-04: coverage --req の複数行カンマ列挙では reqId ごとの design 宣言欠落が帰着で判別できず、missing-design 欠落の発見は check --req 併用が正

- **問題事象**: 意味変更行の design 対応事前確認（coverage --req）で6行をカンマ列挙したところ、relations 全件（design 5件を含む）が帰着して「design 対応欠落行なし」と誤判定できた。実際は REQ-006-112 の design 宣言（ADF-COVERS(design)）が main の時点から欠落しており、check --req（missing-design ゲート）で初めて REQ-006-112 単独の欠落として検出された
- **発生局面**: case-open STEP-3 design 対応事前確認 → STEP-4 missing-design 0 件ゲート（Root Case #3420・Definition PR #3421・commit 0f2579a0）
- **検知方法**: check --req が REQ-006-112 の missing-design fail を報告（coverage はカンマ列挙の reqId 集合に紐づく関係全件のみを返し reqId ごとの design 有無を区別しなかった）
- **根本原因**: coverage の事前確認を「複数行カンマ列挙での一括帰着確認」で済ませた。coverage は advisory・関係全件列挙であり、欠落行の特定は check の missing-design findings が正
- **自律対応内容**: 宣言追随として v4-lifecycle-state-machine へ ADF-COVERS(design): REQ-006-112 を追加し missing-design 0 件へ解消。加えて coverage を reqId 単位（6回の単独実行）で再実行し全行の design 対応を実測帰着確認した
- **ユーザー確認有無**: なし（REQ-030 契約内の宣言追随で解消・PR 本文へ既知債務の由来と解消を記録）
- **Decision/REQ/spec影響**: なし（宣言追加のみ・本文変更なし）
- **横展開観点**: coverage は「design 対応の実測帰着」用途で reqId 単位実行し、欠落行の発見は check --req の missing-design findings を正とする。カンマ列挙の帰着だけで欠落行なしと判断しない
- **再発条件**: 複数の意味変更行を coverage --req のカンマ列挙で一括確認し、帰着した relations の件数だけで欠落判定する場合
- **予防策候補**: design 対応事前確認手順に「check --req の併用（欠落行特定）と coverage は reqId 単位で実測帰着」を明記する候補
- **想定反映先**: learning-promote での評価。case-open STEP-3 意味変更行 design 対応事前確認手順の追補候補
- **関連**: Root Case #3420・PR #3421・traceability check/coverage 実測（0f2579a0）
- **タグ**: `#coverage-req` `#missing-design` `#traceability` `#declaration-follow-up` `#case-open`

## 2026-10-04: traceability check --root に MSYS 形式パス（/c/...）を渡すと解決失敗し宣言走査が空になる。Windows は C:/... 形式必須

- **問題事象**: bun で traceability check を実行する際、--root に bash の $(pwd)（MSYS 形式 `/c/...`）を渡すと root 解決が失敗し、宣言走査が空になって全 missing-* が誤 fail する。Windows 環境では --root にフォワードスラッシュ Windows パス（`C:/Users/...`）を渡す必要がある（main root で同コマンドが pass する対比から特定）
- **発生局面**: case-close STEP-2 traceability check --req 独立再検査（Root Case #3420・PR #3422・merge 直前 HEAD 3eb5f152）
- **検知方法**: --root を MSYS 形式で渡した実行が全 missing-* fail、同一コマンドを C:/ 形式に変えて実行すると 9/9 pass した対比
- **根本原因**: Windows プログラム側のパス解決は MSYS 形式を実在しない root として扱い、fail-closed 契約により検査対象が見かけ上全件欠落する。agentdev-traceability SKILL.md「実行方法」節に既定済みの前提
- **自律対応内容**: C:/ 形式の絶対パス（forward slash 記法）で --root を指定し直して 9/9 pass を取得。本学びを inbox.md へ記録
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（SKILL.md 既定前提の運用適合）
- **横展開観点**: --root を受け取る checker（check_changed_docs.ts --root、check_autogen_freshness.ts --root、check_distribution_boundary.ts の repoRoot 引数等）でも同一の Windows パス形式規律が適用される
- **再発条件**: Windows の bash から checker を起動し、--root にシェルの pwd 展開値（/c/...）をそのまま渡す場合
- **予防策候補**: checker 起動手順で --root を絶対パス直書き（C:/ 形式）に統一する候補
- **想定反映先**: learning-promote での評価。checker 実行契約 Windows パス規律の追補候補
- **関連**: Root Case #3420・PR #3422・agentdev-traceability SKILL.md「実行方法」節
- **タグ**: `#traceability` `#windows-path` `#msys` `#fail-closed` `#checker-execution`

## 2026-10-04: bun test 3 cwd 分割の分割②は src/common/tools/ のテストを含まない。tools 配下テストは単独実行形態での補完実行が必要

- **問題事象**: bun test 3 cwd 分割正規形の分割②（`./src/common/skills/`）は src/common/tools/ 配下のテスト（runner-local 等 43 tests/2 files）を含まない。tools 配下テストは分割①〜③の和集合に入らず、単独実行形態契約（repo root 起・./ 付きパス指定）での補完実行が必要
- **発生局面**: case-run bun test full suite（Root Case #3420・PR #3422・DEL-3420-1）
- **検知方法**: 分割②の実行対象一覧に tools 配下テストが含まれないことを確認
- **根本原因**: 3 cwd 分割の対象ディレクトリ集合（integrity scripts・src/common/skills・plugins + scripts）に src/common/tools が含まれない配置構造
- **自律対応内容**: `bun test ./src/common/tools/` を単独実行形態契約で補完実行し、0 fail を確認して記録。case-close のマージ後 main root 再実測でも同じ補完を再現（313 tests/15 files 0 fail）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（bun test 実行形態契約の単独実行補完運用の継続）
- **横展開観点**: フル suite の網羅確認は「3 分割 + 未収録配置の個別実行」の和集合で行う。件数突合で網羅性を検証する際は tools 等の未収録配置の有無を確認する
- **再発条件**: 3 cwd 分割だけで和集合の網羅を暗黙前提にして、未収録配置のテストを実行対象から漏らす場合
- **予防策候補**: 分割実行の網羅確認手順に未収録配置（tools 等）の列挙確認を追加する候補
- **想定反映先**: learning-promote での評価。bun test 正規形（REQ-060 系）の網羅確認追補候補
- **関連**: Root Case #3420・PR #3422・qg-4-final-acceptance.md「3 cwd 分割実行」節
- **タグ**: `#bun-test` `#full-suite` `#coverage-gap` `#tools-tests` `#execution-contract`

## 2026-10-04: worktree 深度前提の repoRoot 計算を持つテストは main root 実行で ENOENT で fail する。process-conformance.test.ts を既知欠陥として分離

- **問題事象**: case-run 分割②では worktree（repo root から 2 階層深い `.worktrees/3420-case`）の 8 階層 `..` の repoRoot 計算が偶然 repo root に到達して pass するが、マージ後 main root で同一テスト（process-conformance.test.ts）を実行すると repoRoot が 2 階層上（C:/Users/ogatay）に解決され、SKILL.md の readFileSync が ENOENT で fail する。同ファイルの 7 tests がロード error で未実行となり、分割② の件数が worktree 242 から main root 235 に減る
- **発生局面**: case-close STEP-2 マージ後 main root での bun test フル suite 再実測（Root Case #3420・PR #3422・squash commit a15f55df）
- **検知方法**: 分割② status=1・fail 行の ENOENT パス（C:\\Users\\ogatay\\src\\...）と件数突合（242 → 235・差 7 = 同ファイル未実行分）から特定
- **根本原因**: テストコードが worktree 構造（ディレクトリ深度）に結合した repoRoot 計算（`join(import.meta.dir, "..", ×8)`）を持つ。worktree でのみ正しく機能する構造依存の実装
- **自律対応内容**: baseline a544dae0 で同一テストを単独再実行して同一 fail を再現確認し（pre-existing・環境依存と由来分類）、当該変更起因 0 件として QG-4 判定から分離。intake 分離記録はせず本 learning と対応記録コメントの検証差分に記録
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（既知欠陥の分離記録。修正は本 Case 対象外）
- **横展開観点**: import.meta.dir からの相対 `..` 階層数で repo root を求めるテストは worktree 深度に結合する。main root と worktree の両方で実行される検証では、git 依存（git rev-parse）か、階層数を固定しない探索で repo root を解決する必要がある
- **再発条件**: worktree 実行で作成・検証した相対階層数の repoRoot 計算を main root（または別深度の worktree）で実行する場合
- **予防策候補**: テスト内 repoRoot 解決は git 依存解決に統一する候補（src/common/skills/agentdev-workflow-case-run/scripts/tests/process-conformance.test.ts の repoRoot 計算修正候補）
- **想定反映先**: learning-promote での評価。integrity 基盤のテスト repoRoot 解決規約の追補候補
- **関連**: Root Case #3420・PR #3422・bun test 正規形「3 cwd 分割実行」節・baseline 再現確認（cc3420-baseline.json 証跡）
- **タグ**: `#bun-test` `#worktree-depth` `#repo-root-resolution` `#pre-existing` `#fail-origin-classification`

## 2026-10-04: case-open 委譲指示の cleanup 権限記述が現行契約と乖離していた。draft/RU 削除は case-ready 所有（REQ-030-007）

- **問題事象**: orchestration からの case-open 委譲 prompt に「On success: perform the workflow's own cleanup criteria for draft and source RU (case-open owns RU removal on success)」の指示が含まれたが、現行契約では case-open は draft / RU を削除しない（agentdev-workflow-case-open SKILL.md「行わない副作用」、capture-and-completion.md STEP-6-2、REQ-030-007。削除は case-ready が実行する）
- **発生局面**: case-open 委譲実行（Root Case #3424・Definition PR #3426・RU-20261004-07）
- **検知方法**: workflow skill 読込時に capture-and-completion.md の「draft / RU は削除しない」記述と委譲指示の直接突合
- **根本原因**: 委譲 prompt 生成側が case-open の cleanup 権限を旧設計または誤記として宣言しており、workflow 契約の正（case-ready 所有）を反映していない
- **自律対応内容**: workflow 契約を正として draft（.agentdev/drafts/req-draft-deletebranchonmerge-warning.md）と source RU（.agentdev/backlog/req-units/RU-20261004-07.md）を保持し、削除を実行しなかった。完了報告へ保持を記録
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（REQ-030-007 現行契約の遵守）
- **横展開観点**: 委譲 prompt の指示は workflow skill 契約と突合し、矛盾する指示は契約側を正として扱う。兄弟 Case の委譲にも同一文言が含まれる可能性がある
- **再発条件**: orchestration 側が workflow 契約と乖離した cleanup 権限を委譲 prompt に埋め込む場合
- **予防策候補**: case-open 委譲 prompt テンプレートから「case-open owns RU removal」相当の文言除去、workflow 契約の委譲指示面への投影確認候補
- **想定反映先**: learning-promote での評価。orchestration 委譲指示の契約整合確認候補
- **関連**: Root Case #3424・PR #3426・REQ-030-007・agentdev-workflow-case-open capture-and-completion.md
- **タグ**: `#case-open` `#ru-removal` `#contract-drift` `#delegation-instruction` `#case-ready`

## 2026-10-04: req-define ドラフトの新設行番号指定が現行 main の既存行と衝突していた。max+1 採番で割当て（REQ-001-070/REQ-010-070）

- **問題事象**: ドラフト req-draft-existing-req-guarantee-realignment.md の artifact_actions が新設行を REQ-001-069 / REQ-010-069 として指定したが、case-open 実行時点の canonical main で REQ-001-069 は既存行、REQ-010-069 も既存行であり、そのまま適用すると既存行の上書き・欠番整合破壊になる
- **発生局面**: case-open Definition PR 適用（Root Case #3425・Definition PR #3428・RU-20261004-06）
- **検知方法**: artifact_actions 適用前の対象 REQ ファイル実取得（REQ-001.md / REQ-010.md の要件表末尾行確認）
- **根本原因**: req-define 壁打ち時の行番号指定がドラフト作成時点の最新 main の採番状態を反映していない（max+1 前提の行番号が陳腐化）
- **自律対応内容**: 採番規則（最大番号+1）に従い REQ-001-070 / REQ-010-070 として割当て、行本文は合意内容をそのまま使用。ドラフト内部の相互参照（REQ-087 廃止本文・numbering-policy 欠番レジストリエントリ内の REQ-001-069/REQ-010-069 表記）も割当て番号へ同期。traceability/policy.yaml の REQ-010-070 先行登録と一致することを確認し PR 本文 決定事項 へ記録
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（REQ-087-002 相当の採番規則と numbering-policy の現行契約に従う機械的割当て）
- **横展開観点**: ドラフトの REQ 行 ID 指定は「内容の合意」であり「採番の確定」ではない。適用側は canonical main 実取得での採番衝突検査を前置すべき
- **再発条件**: ドラフト作成から case-open 実行までの間に同一 REQ ファイルへ行追加が入る場合（並行 Case でも発生し得る）
- **予防策候補**: case-open の artifact_actions 適用手順に新設行番号の採番衝突検査（対象 REQ ファイル末尾行との突合）追加候補
- **想定反映先**: learning-promote での評価。req-define / case-open 間の行番号引き継ぎ規律の追補候補
- **関連**: Root Case #3425・Definition PR #3428・RU-20261004-06・REQ-001-070・REQ-010-070・numbering-policy 欠番レジストリ
- **タグ**: `#req-numbering` `#draft-stale-numbering` `#max-plus-one` `#case-open` `#req-define`
