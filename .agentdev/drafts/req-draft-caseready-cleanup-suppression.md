---
draft_type: req_draft
topic_slug: caseready-cleanup-suppression
status: draft
created_at: "2026-11-03T03:19+09:00"
source_rus: []
---

# 要件doc draft: case-ready cleanup 機械工程の失敗時抑止（機械前置確認の追加）

RU-0255 実装検証（GitHub 版変更駆動・隔離 repo yogata/adf-ru0255-github-verify 課題 #3 / PR #4）で検出された、case-ready の cleanup 機械工程（draft/RU 削除）が先行受入検査の失敗を機械的に参照せず実行できた事象に対し、破壊的操作（削除）への機械前置確認を追加する要件定義。

## 入力と区別

- 確定事実（証拠付き）: 事象タイムライン（file mtime + git log + 証跡 .agentdev/integrity/reports/case-ready-acceptance-checks.out）、wrapper 実装全文読取、版同一性（隔離 repo pin ≡ main repo src/common）、正規契約群（case-ready Design・SKILL.md・references・REQ-061・REQ-007・DEC-022）の読取、再検証（ru0255-caseready-rerun/evidence: exit 1・52 NG・後続ゲート抑止）と対照（ru0255-contrast/evidence: 3 revision・8 NG signature 一致・delta 0。合格証明ではない）、経路追跡（下記「経路追跡結果」。2026-11-03 実測）
- 利用者の判断（第1次指示として確定）: 失敗無視の呼出し特定、既存検証義務・安全境界の維持、最小限修正、台帳・承認・新汎用ゲート不設置、対照証拠の合格証明扱い禁止
- 監督者の照合・訂正指示（第2次。利用者発言ではなく、利用者判断・利用者合意として記録しない）: ready 不適切確定が残る点を踏まえた現行経路の追跡と責務の恣意的対象外の禁止、実変更なし経路の前提・検査結果・保存操作の実確認と架空の必須報告による通常経路破壊の防止、呼出側供給案の評価と既存機構内接続との比較による実効ある最小案の選定、phase 値差異と prNumber なし経路を踏まえた一致条件の明記、draft-data スキーマの現行契約・実パーサ準拠、組立検査証拠の実出力限定、必要な独立レビューの実施、保存時 commit（明示パス・今回分のみ）の実施
- 境界外（本 draft では扱わない）: ready 遷移・merge への新規機構追加（AG-003 の経路追跡根拠による。模型契約 REQ-061-028 等 + 監督者訂正経路は維持）、case-close の同種構造（報告のみ）、隔離 repo の baseline 登録・gitignore・commit 処置（IR-073/REQ-010-084 の人間判断留保）、RU-0254/0256〜0260、訂正 Case draft（req-draft-correction-3887-verification.md）の編集

## 経路追跡結果（2026-11-03、現行契約の実測）

- 設計PRあり経路: STEP-1 受入検査（wrapper acceptance-checks phase: integrity gates・overlap・AUTOGEN 差分・traceability check）→ merge（agentdev_gh pr_merge）→ STEP-2 canonical 再取得 → STEP-3〜5 → STEP-6 検証ゲート → ready 遷移（Root Case 本文「Case 状態と次工程」更新。agentdev_gh issue_update・模型経由）→ STEP-7 cleanup（wrapper canonical-and-cleanup phase）
- 実変更なし経路: STEP-1 設計PRなし分岐（definition-acceptance.md「設計PRなし分岐」。空の設計PRを作る経路は存在しない）で acceptance-checks phase は実行されず、STEP-2 以降は設計PRあり経路と同一。cleanup に先行する合否を返す必須機械検査は当該経路に存在しない
- ready 遷移・merge は Custom Tool agentdev_gh の GitHub I/O 境界にあり、wrapper を介さない。両操作への機械前置確認の接続点は現行機構内に存在せず、接続には agentdev_gh への状態知識付与（新規汎用機構）が必要となる。merge 前実施規定（STEP-1・acceptance_gates 前置確認・merge 直前 frontmatter 再実測）と ready 遷移条件（STEP-6 実行準備条件）は模型契約
- wrapper 入力契約は prNumber を全 phase で必須とする（accept_definition_checks.ts 入力検証）が、実変更なし経路の prNumber の意味は契約上未定義のまま requirements に到達している。本要件の経路識別入力（設計PR番号 / 設計PRなし識別）で解消する
- 事象（2026-11-02 隔離 repo）は (1) merge が受入検査に先行 (2) acceptance-checks 失敗（exit 1・42 NG）の黙過 (3) ready 記録 (4) cleanup 実行・draft 削除 commit 5287fd1 の連鎖。本要件は (4) の破壊的操作を機械抑止し、(1)(2)(3) は模型契約と監督者訂正経路が維持する（AG-003）
- 呼出側供給案の評価: cleanup 入力に呼出側が報告パス・報告 JSON を供給する案は、(a) 呼出側が報告を渡さない（本件事象と同一の失敗形状）場合を防げず、(b) 古い報告パスの再利用も防げない。採用案（script 自身の固定パス保存 + cleanup の自己読取り + 内容照合）は呼出側の判断を経由しないため (a) を構造的に排除し、設計PR番号照合・再実行上書きで (b) を排除する。script 保存を「自動的に安全」とは仮定せず、cleanup 側で内容（phase・exitCategory・設計PR番号）を照合する。acceptance-checks phase は内部 worktree で検査するため、報告の保存先は cleanup と同一の機械工程入力 repoRoot 基準の契約固定パスに固定する（内部 worktree に保存しない）。全文偽造の排除と経路識別の虚偽申告（設計PRあり Case での設計PRなし申告による報告確認の回避。script は GitHub I/O を持たないため検証できない）の排除は残留リスクとして契約に明記する（gate 再実行・署名付き記録・GitHub I/O 付き検証機構の新設は新台帳・新機構に当たるため行わない）

- 独立レビュー（2026-11-03 実施、read-only）の検出反映: traceability-check の deferred obligations（missing-implementation / missing-verification）は新規要件行を含む設計PRの正規経路で報告の終了区分を needs-judgment にする（REQ-061-023。検証対応の完全性は受入条件に含めない。definition-traceability-gate.ts が deferred 時 status: warn を返し、assembleReport が needs-judgment に組む）。cleanup 前置確認は failure と deferred 以外の警告を拒否し、deferred 由来の needs-judgment は許可することでこの正規経路を維持する。同一設計PRの古い success 報告の再利用（acceptance-checks 再実行を経ない cleanup）も残留リスクとして契約へ明記した

### 第3次調査の追実測（2026-11-03、設計確定前の事実記録）

- 隔離 repo の merge 形状実測: 設計PR #4 の merge は merge commit（7907b16。parents = main 側 32f1a40 + 設計 branch tip 066ff9f「case-open による Definition 保存」）。一方、事象時の acceptance-checks 報告の targetRevision 32298c0 は merge 後の canonical 再取得統合 commit であり設計 branch tip ではない（順序逸脱の実形状）。すなわち「報告 targetRevision == 設計PR merge commit の第二 parent」の照合は、正順（受入検査→merge）かつ merge-commit 方法（設計PRの実測慣習: 本 repo #3888・#3851、隔離 repo #4 の3例）で成立し、(i) 本事象のような merge 後検査・順序逸脱形状、 検査後に設計 branch へ追加された commit を含む merge（同一PR古い成功報告の再利用）を検出できる見込みである（本照合機構は未実装・未検証であり、公開入口での実証は未実施）。squash/rebase merge では第二 parent が不在のため当該照合は不能であり、fail-closed 拒否（acceptance 再実行要求）とするかは再評価項目3の比較で確定する
- 次段階前置 gate の接続点実測: case-run STEP-S3「前置 gate 群」（precondition / staleness / targeted docs / 配布依存境界 事前 gate / AUTOGEN 索引再生成）が実在し、QG-3 前置 staleness check（ファイルパス現行存在確認・検査結果件数再計測）等の決定的検査を含む（references/single.md STEP-S3-3・S3-5・S3-6）。案B（次段階での進行抑止）の接続点として構造的に存在する。追加検査の要否・形態（script 実装か手順規定か）は再評価項目1・3の比較で確定する

### 独立監査第一報の受理と追加調査（2026-11-03、設計確定前の事実記録）

監査対象は本 draft の最新版（4a2aeabc4 時点）。監査第一報の指摘は監督者経由で受理したものであり、本節は一次情報での追認・追加調査の記録である。

- **監査確認事項のコード追認（accept_definition_checks.ts main）**: 入力ファイル読取失敗・JSON 不正（L861-871）・validateInput 不合格（L872・L904-906）は報告を出力せず終了 1 で終わる。報告の出力は正常経路のみ（L900-902）。現行実装に固定パス保存は存在しない（保存は本 draft の設計追加要素）
- **懸念 (1) 再実行が報告保存前に終わる場合の旧成功報告残存**: 完了時のみ保存する設計では、同一PRの再実行が入力不正・異常終了で報告保存前に終わると旧成功報告が残り、cleanup が受理し得る（「再実行せず旧報告を使う」経路とは別形状。設計の上書き前提が成立しないケース）。対策候補（採否は再評価で確定）: (a) acceptance-checks phase 開始時（引数解析直後・入力検証前）に当該PRの既存報告を無効化（削除または running marker 化。再実行の開始だけで旧報告を失効させ fail-closed を維持。入力誤りの再実行も旧報告を失効させる運用コストあり） 報告に実行識別子（実行時刻・入力 digest）を記録し cleanup 側で照合（保存前異常そのものの検出は不可。鮮度評価の補強にとどまる） 残留リスクとして明記し対象版一致（第二 parent 照合構想）で軽減
- **懸念 (2) 検証方針の追加候補**: 現 TS-001 に phase 不一致・保存前異常の分岐がない。追加候補: (h) phase 不一致（acceptance-checks 以外の phase 値を持つ報告。例: cleanup 自身の報告）→ 終了 1 (i) 再実行が報告保存前に終了した後の旧成功報告存在状態での cleanup（対策 (a) 採用時は無効化済みで終了 1、非採用時は対象版一致構成との組合せ評価）
- **懸念 (3) merge 方法と Local 版の一次情報**: (i) 設計PR merge 方法は case-ready Design・references で契約化されていない（pr_merge の method は呼出側指定。実測慣習は merge commit 3例: 本 repo #3888・#3851、隔離 repo #4。squash は case-close 系・IR-072 等の別用途で実績） ローカル版は PR 系操作を role: case ローカルIssueへ読み替え（docs/designs/local/local-case-file.md「PR 系操作の対象解決」）、merge の実行主体は workflow 側のローカル Git 操作であり Tool は取り込み記録（commitHash 実在 VERIFY。docs/designs/responsibilities/custom-tool-contracts.md pr_merge 入力契約。case-close の「ローカル版 PR マージ（取り込み）の手順」が同構造の実績）→ ローカル版では merge 方法を workflow が直接制御可能 GitHub 版で設計PRを squash/rebase merge した実測は不在。評価方向: 第二 parent 照合を唯一手段とせず、 設計PR merge 方法の契約化（GitHub 版 method=merge・ローカル版 --no-ff 等で両経路で parent2 を安定確保。正規経路を狭める契約変更のため影響評価が必要） 方法非依存の鮮度・順序判定（報告への入力 digest 記録、ローカル版「## マージ結果」記録・GitHub 版 pr_read による model 側照合など機械境界をまたぐ組合せ。機械強制の強度は下がる）を比較する。squash/rebase・ローカル版正規経路の一律拒否は採用しない
- **懸念 (4) 構想と実証の区別**: 追実測節の第二 parent 照合は構想であり未実装・未検証（文言を「見込み」に修正済み）。TS-002〜005 は公開入口での検証予定で未実施。本 draft に「実証済み」とする記述はないことを確認し、今後の追記でも構想と実測を区別して記載する
- **懸念 (5) QG 文字列「未定」の機械検出**: 決定的マーカー検査（TBD / TODO / 未定 / 後続工程で確定 / case-run で確定。引用・禁止事例は除外）は agentdev-quality-gates references qg-1-definition-integrity.md の規定であり、src/common・.opencode/skills 配下の script 実装は存在しない（実装検索 0 件。機械検出は決定的文字列検査として実装可能だが、現状は模型手順）。本 draft の agreed_items / artifact_actions content は 5 マーカーとの字面衝突を避けるため AG-004 の「未定義」を「定義されていない」へ修正した（「未定義」は marker「未定」の部分一致となり、将来の機械検証器で偽陽性になり得るため）
- **候補必要性の再検討（比較軸の追加）**: 事象の一次原因が実行主体による記録済み failure の黙過と非同一環境対照による正当化（監督側指示の適用誤りを含む）であることに照らし、 既存契約・実行手順の修正（模型契約の明確化・実行手順の修正・監督者照合手続きの整備。新機構なし） 本 draft の新機構（cleanup 前置確認等）を、事象再発防止・検出可能性・正当経路への影響・維持費用の4軸で比較する。確定は監査継続報告・別途独立調査の結果との突合後に行う

### 独立監査第二報の受理と処遇確定（2026-11-03）

監査第二報（監督者経由）の指摘を一次資料と照合し、処遇を確定した。

- **既存契約の実読照合**: definition-acceptance.md（L13-16 設計PRなし分岐、L38-50 acceptance_gates 前置確認〔merge 判定の前・検出時 merge 抑止〕、受入検査の機械工程と検査証拠保存〔非ゼロ終了の integrity gate は後続ゲートを実行しない〕）、REQ-061-025（failed 時 draft/RU 保持）、REQ-061-027（冪等再実行）、REQ-061-028（品質検査失敗時 ready 不許可）、REQ-061-049（検査証跡を一回の実行から保存）を実読し、**統合前の検査義務・検査失敗後の ready 不許可・削除禁止はいずれも既存契約に存在する**ことを確認した（監査の読みどおり）
- **事象の分解**: (1) 統合（merge）が検査前に先行した点は既存契約の merge 前置義務違反、 失敗後の異なる環境での比較を合格に使用した点は REQ-007-010 の対照実行条件違反（証拠評価の誤りという別事象）、(3) 失敗後の ready 記録・cleanup 実行は REQ-061-028/025 違反。いずれも運用側の契約違反であり、既存契約の欠落ではない
- **必要性の再検討結論**: cleanup 機械工程に機械前置確認が存在しないことは事実だが、当該義務は既存契約（模型契約）に存在し、本事象は運用違反と証拠評価誤りで説明できる。新機構（cleanup 前置確認・報告固定パス保存・merge 方法契約化を含む）の必要性と効果は一次資料からは実証できない（第一報懸念〔報告保存前異常・merge 方法依存〕が未解決のままでもある）。訂正記録（隔離課題 #3 の訂正）のみで将来の再発防止を証明したとも言えない。よって**本 draft の新機構は採用に進めない**
- **処遇（現行契約に基づく）**: 本 draft は `.agentdev/drafts/` に保持し、case-auto へ接続しない（draft の削除は case-ready 成功時のみの現行契約であり、不進行 draft の削除・移動の手続は現行契約に存在しないため保持が正しい扱い）。監督者は検査失敗を合格とせず隔離課題 #3 を復旧・再検証の対象に戻す（権限留保の操作であり、本 workflow 側では行わない）。merge 方法の契約化は採用せず、統合方式の異なる正常な GitHub・Local 経路を維持する
- **未完の検証（記録）**: (i) 本 draft の TS-001〜005 は全て未実装・未実行（不採用により実施しない） 元 RU-0255 の GitHub 版変更駆動経路の実経路検証は未完（隔離課題 #3 が復旧・再検証対象。baseline 未整備〔IR-073/REQ-010-084 の人間判断留保〕の解消を含む） 再発防止の実証は既存契約の実行・証拠評価・監督者照合の運用に依存し、本 draft では証明しない

## 第3次監督者照合・訂正指示による再評価項目（第二報受理により閉鎖・2026-11-03）

当該指示は監督者の照合・訂正指示であり、利用者発言ではない。次の項目を再評価中であり、本 draft の該当記述（AG-002 の残留リスク文、AG-003、ACT-REQ-061-001 / ACT-DESIGN-001 の該当文、TS-001 の検証分岐・TS-002 の合格基準）は現時点の案であって確定ではない。

1. 保護対象の範囲: 本事象の保護対象の実例は受入検査失敗後の ready 状態への移行を含む。cleanup 拒否のみでは不正な ready 記録と merge が残存し、元目的（失敗後の進行防止）に届かない可能性の再評価
2. 回避経路の扱い: 設計PRあり Case を設計PRなしと入力する経路識別の虚偽申告、同一設計PRの古い成功報告の再利用を、単に残留リスクとして受け入れる扱いの再評価。局所 git 検証（main 履歴の設計PR merge commit〔"Merge pull request #N from …/definition/issue-{Case}"。実測: #3888・#3851〕の検出、merge commit の第二 parent と報告 targetRevision の一致、definition 系 branch・worktree の残存検出）で排除可能な範囲の評価を含む
3. ready/merge 抑止の選択肢比較: agentdev_gh（GitHub 版・ローカル版の両 Tool）への状態知識付与だけを唯一の選択肢と決めつけない。 次段階の機械前置確認（case-run 前置 gate）による進行抑止、 既存の case-ready 処理を通じた外部操作の発行自体の制御、 受入検査と続く操作の同一実行単位化（script による merge 実行。既存契約〔GitHub I/O 書込みの agentdev_gh 限定・script の gh 操作禁止〕との抵触評価を含む）を、現在の実装・権限・Local/GitHub 両経路で具体的に成立するか比較する
4. 元要件の強制水準: REQ-061-025 の文言（「成功後に削除。blocked、failed、中断した場合は保持」）が機械的強制まで要求していない可能性、および本事象の検査失敗が監督側指示の適用誤り（非同一環境手動対照による正当化・未検証の合格化）である可能性の検討。必要な変更を先取りしない
5. 報告の保存前異常と旧成功報告残存への対策採否・検証範囲（独立監査第一報 懸念1・2。対策候補 (a)(b)(c) と TS-001 追加分岐 (h)(i) の評価。「独立監査第一報の受理と追加調査」節参照）
6. 設計PR merge 方法の契約化と鮮度・順序判定の方法非依存化（同 懸念3。第二 parent 照合構想の位置づけ、GitHub/Local 両経路の正規利用を失わない判定手段の比較）

再評価は独立監査第二報の受理と「独立監査第二報の受理と処遇確定」節の処遇確定により閉鎖した（項目1〜6はいずれも新機構不採用の帰結として閉じる。項目6の merge 方法契約化は不採用）。評価基準として記録した「形式的な再確認や一律追加検査ではなく、異常時に実際の ready・merge・削除の発行が必要に応じて抑止され、正当な経路が成立することを検証可能にすること」は、将来の再検討時の基準として本 draft に残す。

## 重要変更の事前通知の実施記録

- 第1次（2026-11-03T03:19+09:00）: ドラフト保存（write 実行）に先立つセッション出力として、REQ-061 への新行追加と case-ready Design の script 呼び出し契約節更新の事前通知（変更理由・変更内容・影響・確定事項と未確認事項の区別）を実施した
- 第2次（2026-11-03T03:40+09:00 以降、本次訂正）: 当該訂正は監督者の照合・訂正指示によるものであり、利用者による内容確定ではない。変更内容（経路別前置確認・実変更なし経路の非破壊・script 固定パス保存と一致条件・スキーマ准拠）は監督者指示の受理・反映として扱った

## 事象証拠（本文記録）

- 事象タイムライン: 隔離 repo（C:/Users/ogatay/work/adf-ru0255-github-verify）の file mtime・git log・証跡 .agentdev/integrity/reports/case-ready-acceptance-checks.out（2026-11-02T18:20:13+09:00 実行、exit 1・42 NG・exitCategory failure・targetRevision 32298c0）
- 呼出し特定: 実行主体が記録済み failure を無視し ready 記録（18:26:57）→ cleanup 呼出（18:27:11）→ draft 削除 commit 5287fd1 に至った経路の読取（issue3-body-before/after.md を含む）
- 機構欠落の実装根拠: accept_definition_checks.ts（916 行）全文読取。canonical-and-cleanup phase が acceptance-checks 結果を一切参照しない入力契約であることの確認
- 版同一性: 隔離 repo .agentdev-plugin pin と main repo src/common の wrapper・SKILL.md・references/definition-acceptance.md の diff 完全一致
- 再検証: C:/Users/ogatay/work/ru0255-caseready-rerun/evidence/（同一機械入口で exit 1・52 NG・後続ゲート抑止を記録）
- 対照（合格証明ではない）: C:/Users/ogatay/work/ru0255-contrast/evidence/README.md（3 revision・8 NG signature 完全一致・delta 0。限界明記済み）
- 正規契約: docs/designs/commands/case-ready.md「機械工程の script 呼び出し契約（RU-0162）」節・「受入検査入力と実行証拠の接続」節、agentdev-workflow-case-ready SKILL.md・references（definition-acceptance.md・readiness-and-cleanup.md）、docs/requirements/REQ-061.md（025・028・040・049-053）、docs/requirements/REQ-007.md（010・015）、DEC-022（決定3・決定6）、元 RU-0255（git 2cf279980 から復元読取）
- 組立検査: ACT-DESIGN-001 の変更後セクション全文は assemble-draft-section.ts（version 0.2.0）で docs/designs/commands/case-ready.md から組立検査した（非破壊・written: false。証拠は draft-data の assembly_evidence）

# draft-data

```yaml
work_type: bugfix
scale: standard
summary: >-
  case-ready の cleanup 機械工程（canonical-and-cleanup による draft/RU 削除）への経路別機械前置確認。
  設計PRあり経路では先行受入検査（acceptance-checks phase）の報告を script 自身が契約固定パスから
  読み取って合否を機械確認し（phase・合否構造〔fail 不在と deferred 由来 needs-judgment の区別〕・
  設計PR番号の一致）、確認不成立時は削除も削除 commit も
  実行せず fail-closed で終了する。実変更なし経路では acceptance-checks 報告を要求せず経路識別を
  必須とすることで通常経路を壊さない。RU-0255 検証で検出された「acceptance-checks 失敗（exit 1・42 NG）
  後に cleanup が成功実行され draft が削除された」事象の製品機構側欠落（REQ-061-025 の「成功後に削除」が
  模型遵守のみに依存）を閉じる。ready 遷移・merge への新規機構は追加しない（AG-003 の経路追跡根拠）。
auto_gate:
  auto_ready: false
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons:
    - 独立監査第二報・監督者指示により新機構の必要性・効果が未実証のため case-auto 不接続・見送り（draft は保持。不採用の最終確定・隔離課題 #3 の復旧・再検証・baseline 処置〔IR-073/REQ-010-084〕は監督者・人間判断の留保事項）
agreed_items:
  - id: AG-001
    content: >-
      cleanup 機械工程（canonical-and-cleanup による draft/RU 削除）への経路別機械前置確認。
      設計PRあり経路では先行受入検査（acceptance-checks phase）の報告を削除実行前に機械確認
      （合否条件は AG-002。fail 不在と deferred 由来 needs-judgment の区別を含む）し、
      確認不成立時は削除も削除 commit も実行せず終了 1（fail-closed）。実変更なし経路では
      acceptance-checks 報告を要求せず（当該経路に受入検査 phase が存在しない。経路追跡結果参照）、
      経路識別（設計PRなし）を入力に必須とする。経路識別の欠落した入力は先行報告を要求する
      fail-closed として扱う。RU-0255 検証事象の製品機構側欠落（REQ-061-025 の「成功後に削除」が
      模型遵守のみに依存し、破壊的機械工程に受入検査結果の機械前置確認が存在しない）を閉じる。
  - id: AG-002
    content: >-
      報告の保存・読取り・一致条件。acceptance-checks phase は報告 JSON を stdout に加えて
      script 自身が機械工程入力 repoRoot 基準の契約固定パス（.agentdev/integrity/reports/ 配下、
      設計PR番号を含む命名規則。内部 worktree には保存しない）へ保存し、
      cleanup は当該固定パスから自ら読み取る（呼出側の保存・引数による供給に依存しない）。一致条件は
      次のとおり。(1) 報告が契約固定パスから読み取れること (2) 報告の phase が acceptance-checks であること
      （cleanup 自身の phase 値 canonical-and-cleanup とは異なる値との一致で判定する）(3) 報告の steps に
      status: fail が存在せず終了区分が failure でないこと。終了区分が needs-judgment の場合は、警告の由来が
      traceability-check step の deferred obligations（missing-implementation / missing-verification。
      REQ-061-023 のとおり検証対応の完全性は受入条件に含めない）のみであることを確認して許可し、
      autogen-regeneration-diff 等の他の警告を含む場合は許可しない（新規要件行を含む設計PRが
      needs-judgment で完了する正規経路を壊さないため）(4) 報告の設計PR番号（報告 JSON の構造化フィールド）
      が cleanup 入力の設計PR番号と一致すること。
      branch は先行 phase（設計 branch）と cleanup（main）で作業 branch が異なり、対象版 targetRevision は
      merge を挟むため、いずれも一致条件に使わず設計PR同一性で結合する。同一設計PRの acceptance-checks
      再実行は報告を上書きし、失敗報告による上書きも cleanup 拒否につながる。古い報告・別対象の報告は
      設計PR番号の不一致で排除する。報告ファイルの全文偽造、経路識別の虚偽申告（設計PRが存在する
      Case での設計PRなし申告による報告確認の回避。script は GitHub I/O を持たないため検証できない）、
      および同一設計PRの古い success 報告の再利用（acceptance-checks を再実行せず cleanup が過去の
      成功報告を参照する経路。対象版 targetRevision を一致条件に使えない帰結）までは
      排除せず、これらの残留リスクを契約に明記する（排除のための gate 再実行・署名付き記録・GitHub I/O
      付き検証機構の新設は行わない）。報告が失われている冪等再実行時は
      cleanup を単独で再実行せず acceptance-checks phase を再実行してから cleanup を実行する。
  - id: AG-003
    content: >-
      ready 遷移・merge 順序の扱い（経路追跡に基づく判断）。現行経路の実測では、ready 遷移は Root Case 本文の
      「Case 状態と次工程」更新（agentdev_gh issue_update）、merge は agentdev_gh pr_merge であり、両操作は
      wrapper を介さない GitHub I/O 境界にあり、機械前置確認の接続点は現行機構内に存在しない。機械強制には
      agentdev_gh Custom Tool への状態知識付与（新規汎用機構）が必要で、利用者が禁止した新台帳・形式的承認・
      新汎用ゲートに該当する。よって merge 前実施規定（STEP-1・acceptance_gates 前置確認・merge 直前
      frontmatter 再実測）と ready 遷移条件（STEP-6 実行準備条件、REQ-061-028）は模型契約として維持し、
      監督者訂正経路（隔離課題 #3 の訂正実績）を正規の訂正手段とする。cleanup 前置確認により、誤った ready
      記録が残っていても破壊的操作（削除）が機械拒否され、draft/RU 残存という検出可能な不整合として監督者
      訂正の着手点が保持される。
  - id: AG-004
    content: >-
      境界と通常経路の保護。実変更なし経路には acceptance-checks が存在しないため報告を要求しない。現行
      wrapper 入力は prNumber を全 phase で必須とするが実変更なし経路の prNumber の意味は契約上定義されておらず、
      経路識別入力（設計PR番号 / 設計PRなし識別）によって解消する。既存の acceptance-checks phase 内
      fail-closed・後続ゲート抑止・Form Zero・明示パス指定 commit・REQ-061-053 skippedPaths 報告を変更しない。
      新たな汎用ゲート・台帳・承認機構を作らない。case-close（close_mechanical_steps.ts）の同種構造は対象外と
      し報告のみ。対照証拠（ru0255-contrast）を失敗 gate の遡及的合格証明として扱わない。RU-0254/0256〜0260・
      訂正 Case draft（req-draft-correction-3887-verification.md）とは混在させない。経路識別の虚偽申告（設計PRあり Case での設計PRなし申告）は模型契約違反として
      監督者訂正経路で扱い、script 側の検証対象としない（GitHub I/O 境界の維持）。
  - id: AG-005
    content: >-
      検証義務の維持。実行不能な必須経路は未検証とし別経路の成功で代替しない（元 RU-0255 の検証種別区別）。
      失敗時抑止・正常時許可・実変更なし経路・修正後再検証は公開入口からの実経路で証明する。検証環境は
      REQ-116 の管理者準備手順で整備する（baseline 登録等の人間判断留保事項〔IR-073/REQ-010-084〕の処置を含む）。
artifact_actions:
  - id: ACT-REQ-061-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-061.md
    source_items: [AG-001, AG-002]
    content: |-
      新要件行（付与番号は保存時の採番規則に従う）: case-ready の cleanup 機械工程（draft・RU 削除を伴う canonical-and-cleanup）は、draft・RU の削除（git rm）と削除 commit の実行前に、経路識別（設計PR番号。実変更なし経路は設計PRなしであることの識別）に基づく機械前置確認を行う。設計PRあり経路では、先行受入検査（acceptance-checks phase）が機械工程入力 repoRoot 基準の契約固定パス（内部 worktree には保存しない）へ保存した報告を script 自身が読み取り、報告の phase が acceptance-checks であること（cleanup 自身の phase 値 canonical-and-cleanup とは異なる値との一致で判定）、報告の steps に status: fail が存在せず終了区分が failure でないこと（終了区分が needs-judgment の場合は、警告の由来が traceability-check step の deferred obligations〔missing-implementation / missing-verification。REQ-061-023 のとおり検証対応の完全性は受入条件に含めない〕のみであることを確認して許可し、autogen-regeneration-diff 等の他の警告を含む場合は許可しない。新規要件行を含む設計PRが needs-judgment で完了する正規経路を壊さないため）、報告の設計PR番号（報告 JSON の構造化フィールド）が cleanup 入力と一致することを確認してから削除を実行する。branch と対象版（targetRevision）は先行 phase と cleanup で作業 branch が異なり merge を挟むため一致条件に使わず、設計PR同一性で結合する。確認不能・非 success・番号不一致の場合は削除も削除 commit も実行せず失敗として終了する（fail-closed、終了 1）。実変更なし経路では acceptance-checks 報告を要求せず、経路識別（設計PRなし）を必須とする。経路識別の欠落した cleanup 入力は acceptance-checks 報告を要求する fail-closed として扱う。acceptance-checks phase は報告 JSON を stdout に加えて契約固定パスへ保存し、同一設計PRの再実行は当該パスを上書きする（失敗報告による上書きを含む）。報告が失われている冪等再実行時は cleanup を単独で再実行せず acceptance-checks を再実行してから cleanup を実行する。ready 遷移・merge 順序の規定は模型契約として維持し、本行は削除という破壊的操作に対する機械抑止の追加にとどめる。報告ファイルの全文偽造、経路識別の虚偽申告（設計PRが存在する Case での設計PRなし申告）、および同一設計PRの古い success 報告の再利用（acceptance-checks を再実行せず cleanup が過去の成功報告を参照する経路）の排除は本行の範囲外とし、そのための gate 再実行・署名付き記録・GitHub I/O 付き検証機構の新設は行わない（虚偽申告は模型契約違反として監督者訂正経路で扱う）。
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: commands
      slug: case-ready
    target_area: 機械工程の script 呼び出し契約（RU-0162）
    source_items: [AG-001, AG-002, AG-003]
    content: |-
      ## 機械工程の script 呼び出し契約（RU-0162）

      case-ready の機械工程（設計PRの忠実性・整合性・品質検査の実行、overlap 突合、AUTOGEN 対象 block の再生成差分検出、traceability check、merge 後の canonical 再取得、draft/RU 削除の git rm と明示パス指定 commit）は、工程別 script 1 回の呼び出しに束ねる。GitHub I/O（pr_read、pr_merge、Issue 本文更新）は Custom Tool agentdev_gh の境界を維持する。REQ/Decision/Design の保存実体（Capability Skill 委譲による保存手続き）は本 script の対象外とし、保存責務の委譲構造を変更しない。

      - 入力 JSON / 報告 JSON / 終了コードの契約、品質ゲートの script 内実行（省略禁止）、inspect_cross_dependencies.ts と同じ作り（共通基盤不作成）、意味判断のモデル担当は、case-open Design「機械工程の script 呼び出し契約（RU-0162）」節と同一の規律に従う
      - canonical 再取得の fetch・ff-only merge が失敗した場合は、ローカル main と origin/main の分岐の有無（ahead/behind の件数とコミット一覧）を検出し、報告 JSON の該当 step detail へ反映する。script は分岐を自動解消せず、解消は agentdev-git-worktree の「Squash merge 後分岐ハンドリング手順」（git-common-procedures.md）に従う（REQ-061-052）。同手順の処理分岐（完全重複・部分重複・独立変更）と case-close STEP-4-3 からの既存参照を変更しない
      - 報告 JSON には検査結果、再生成差分、警告、提案する Issue/PR 本文を含め、モデルは報告 JSON の意味レビューと agentdev_gh による I/O 実行のみを担う
      - workflow skill 参照文面は script 呼び出しと報告 JSON 解釈へ置き換えて短縮する
      - 報告 JSON は stdout への出力に加え、script 自身が機械工程入力 repoRoot 基準の契約固定パス（`.agentdev/integrity/reports/` 配下、設計PR番号を含む命名規則）へ保存する（acceptance-checks phase が内部で利用する worktree には保存しない。cleanup と同一の repoRoot 基準で読み取れるようにする）。報告 JSON は機械工程入力の経路識別（設計PR番号）を構造化フィールドとして含める。同一設計PRの再実行は当該パスを上書きする。呼出側による報告の保存・引数での供給を前提としない
      - canonical-and-cleanup phase（draft/RU 削除）は、`git rm` と削除 commit の実行前に、先行する受入検査の結果を機械確認する（cleanup 前置確認）:
        - 機械工程入力は経路識別（設計PR番号。実変更なし経路は設計PRなしであることの識別）を持つ。設計PR番号がある場合は先行報告の機械確認を、設計PRなし識別の場合は acceptance-checks 報告を要求せず通常の削除手順を実行する。経路識別が欠落した入力は先行報告を要求する fail-closed として扱う
        - 設計PRあり経路の機械確認条件は次のとおり。確認はすべて削除処理の前に実施し、不成立の場合は削除も削除 commit も実行せず終了コード 1 で失敗する: (1) 報告が script 保存による契約固定パスから読み取れること (2) 報告の phase が acceptance-checks であること（cleanup 自身の phase 値 canonical-and-cleanup とは異なる値との一致で判定する）(3) 報告の steps に status: fail が存在せず、報告の終了区分が failure でないこと。終了区分が needs-judgment の場合は、警告の由来が traceability-check step の deferred obligations（missing-implementation / missing-verification。REQ-061-023 のとおり検証対応の完全性は受入条件に含めない）のみであることを確認して許可し、autogen-regeneration-diff 等の他の警告を含む場合は許可しない (4) 報告の設計PR番号が cleanup 入力の設計PR番号と一致すること（branch は先行 phase と cleanup で作業 branch が異なるため一致条件に使わない。対象版 targetRevision も merge を挟むため一致条件に使わず、設計PR同一性で結合する）
        - 古い報告・別対象の報告は、設計PR番号の不一致と同一設計PRの再実行上書き（失敗報告による上書きを含む）で排除する。報告ファイルの全文偽造、経路識別の虚偽申告（設計PRが存在する Case での設計PRなし申告による報告確認の回避。script は GitHub I/O を持たないため検証できない）、および同一設計PRの古い success 報告の再利用（acceptance-checks を再実行せずに cleanup が過去の成功報告を参照する経路。対象版を一致条件に使えない帰結）までは排除しない。これらの残留リスクを前提として本前置確認を位置づけ、排除のための gate 再実行・署名付き記録・GitHub I/O 付き検証機構の新設は行わない
        - 報告が失われている冪等再実行時は cleanup を単独で再実行せず、acceptance-checks phase を再実行してから cleanup を実行する
      - ready 遷移と merge の順序規定（受入検査は merge 前、ready 遷移は検証ゲート合格後）は模型契約として維持する。cleanup 前置確認は draft/RU 削除という破壊的操作の機械抑止であり、ready 遷移・merge への新たな機構（Custom Tool への状態知識付与等）を追加しない
conflict_resolutions:
  - id: CR-001
    conflict: cleanup 前置確認の接続方式。呼出側が cleanup 入力として報告パス・報告 JSON を供給する案と、script 自身が契約固定パスへ報告を保存し cleanup が自己読取りする案
    resolution: >-
      script 固定パス保存・自己読取り案を採用する。呼出側供給案は、呼出側が報告を渡さない事象と同一の
      失敗形状（本件事象の再発）を防げず、古い報告パスの再利用も防げないため。採用案は呼出側の判断を
      経由しないため渡し忘れを構造的に排除し、内容照合（phase・合否構造〔fail 不在と deferred 由来
      needs-judgment の区別〕・設計PR番号）と同一設計PRの再実行上書きで古い・別対象の報告を排除する。
      全文偽造・同一設計PRの古い success 報告再利用の排除は残留リスクとし、gate 再実行・署名付き
      記録の新設（新台帳に当たる）は行わない。
operation_units:
  - ou_id: OU-001
    target_req: REQ-061
    target_design: docs/designs/commands/case-ready.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
result: {}
test_strategy:
  - id: TS-001
    target_item: AG-002
    verification: |-
      部品試験（unit test）。accept_definition_checks.ts の新入力契約と cleanup 前置確認の全分岐を検証する:
      (a) 報告終了区分 success・全一致 → 削除実行・終了 0 (b) 報告なし・読取不能 → 終了 1・git 状態不変 (c) 終了区分 failure または steps に status: fail を含む → 終了 1 (c2) 終了区分 needs-judgment・警告が traceability deferred（missing-implementation / missing-verification）のみ → 削除許可・終了 0（正規経路） (c3) 終了区分 needs-judgment・autogen-regeneration-diff 等の他の警告を含む → 終了 1 (d) 設計PR番号不一致（別対象・古い報告）→ 終了 1 (e) 経路識別なし → 終了 1 (f) 経路識別あり（設計PRなし）→ 報告なしで通常削除手続実行 (g) 同一設計PR再実行の失敗報告上書き → 終了 1。--validate-input が新入力（経路識別・固定パス報告・報告の構造化設計PR番号フィールド）を検証することも確認する。
    pass_criteria: |-
      全分岐が期待どおり（削除・commit の実行は全一致時のみ。他は終了 1 かつ removalPaths の git 状態不変）。既存 acceptance-checks phase の fail-closed・後続ゲート抑止・Form Zero・skippedPaths 報告に回帰なし。
    on_failure: |-
      fix-and-reverify。中核の安全機構のため実装を修正して再検証する。合格するまで TS-002 以降の実経路検証に進まない。
  - id: TS-002
    target_item: AG-001
    verification: |-
      実経路・失敗時抑止。REQ-116 管理者準備の隔離 repo（受入 gate が構造的に失敗する環境。ru0255-caseready-rerun と同等形状）で、公開入口から case-auto を実行し cleanup 到達時の挙動を観察する。
    pass_criteria: |-
      cleanup が先行報告の非 success を検出して削除を拒否し終了 1。draft・RU は保持され、削除 commit が作成されない。拒否理由（報告読取結果）の証跡が保存される。誤った ready 記録が残っている場合は draft/RU 残存による不整合が観察され、検出可能である。
    on_failure: |-
      fix-and-reverify。抑止不備は実装を戻し原因特定のうえ再修正する。失敗環境の整備手順自体の欠落（baseline 等）は REQ-116/IR-073 の人間判断経路で解決し、本件合格判定に代用しない。
  - id: TS-003
    target_item: AG-001
    verification: |-
      実経路・正常時許可（設計PRあり）。gate が合格する環境（必要な baseline・証跡整備を含む）で公開入口から case-auto を実行する。新規要件行を含み missing-verification deferred が残る正規経路（報告の終了区分 needs-judgment。REQ-061-023）での完了も含む。
    pass_criteria: |-
      cleanup が報告の合否構造（success、および deferred 由来の needs-judgment）を確認して削除を実行し、case-ready が正常完了する。削除 commit が作成され、draft/RU が削除される。deferred 由来の needs-judgment で cleanup が誤ブロックされない。
    on_failure: |-
      fix-and-reverify。正常系の回帰のため実装を戻し最小限の再修正を行う。
  - id: TS-004
    target_item: AG-004
    verification: |-
      実変更なし経路の実経路（通常経路非破壊の証明）。設計PRが存在しない Case（実変更なし bugfix 等）を公開入口から case-auto で実行する。
    pass_criteria: |-
      経路識別（設計PRなし）により acceptance-checks 報告なしのまま cleanup が通常どおり実行され、draft/RU 削除と case-ready 完了が成立する。架空の必須報告による停止・失敗が発生しない。
    on_failure: |-
      fix-and-reverify。実変更なし経路の通常稼働を壊すため実装を戻し再修正する。
  - id: TS-005
    target_item: AG-005
    verification: |-
      修正後再検証。RU-0255 事象と同一形状（acceptance-checks 失敗後に cleanup 相当操作を試行）に加え、再実行（acceptance 再実行の失敗報告上書き後の cleanup）と別対象（別設計PRの成功報告を用いた cleanup）のシナリオを実行する。
    pass_criteria: |-
      同一形状で削除が抑止される。失敗報告上書き後の cleanup が拒否される。別設計PRの報告が番号不一致で拒否される。各拒否の証跡が TS-002 と同等に保存される。
    on_failure: |-
      fix-and-reverify。抑止漏れの経路を特定して修正し、TS-001 から再実行する。
realization_actions:
  - id: RA-001
    concern: cleanup 前置確認と報告の script 固定パス保存の実装
    responsibility: case-ready 機械工程 script の実装責務
    ownership_hints:
      - src/common/skills/agentdev-workflow-case-ready/scripts/src/accept_definition_checks.ts
    intent: >-
      acceptance-checks phase の契約固定パス保存（設計PR番号を含む命名）、cleanup 入力への経路識別追加、
      削除前の機械確認（報告読取・phase・合否構造〔fail 不在と deferred 由来 needs-judgment の区別〕・設計PR番号照合）、不成立時の fail-closed 分岐
      （git rm・commit 不実行・終了 1）、--validate-input の検証範囲拡張。既存の fail-closed・後続抑止・
      Form Zero・分岐検出接続を変更しない。
    verification_refs: [TS-001, TS-002, TS-003, TS-004, TS-005]
    source_items: [AG-001, AG-002]
  - id: RA-002
    concern: script 契約文の更新
    responsibility: case-ready 機械工程 script の契約文書責務
    ownership_hints:
      - src/common/skills/agentdev-workflow-case-ready/scripts/README.md
    intent: >-
      I/O 契約への新入力（経路識別）と報告の契約固定パス保存・cleanup 前置確認・fail-closed 挙動の冪等再実行
      扱いの追記。
    verification_refs: [TS-001]
    source_items: [AG-002]
  - id: RA-003
    concern: workflow skill 手順・Design 参照の整合
    responsibility: case-ready Workflow Skill の手順記述責務
    ownership_hints:
      - src/common/skills/agentdev-workflow-case-ready/references/readiness-and-cleanup.md
      - src/common/skills/agentdev-workflow-case-ready/references/definition-acceptance.md
      - src/common/skills/agentdev-workflow-case-ready/SKILL.md
    intent: >-
      readiness-and-cleanup.md STEP-7 の前置確認へ「先行報告の機械確認結果の読取り」を追加し、
      definition-acceptance.md acceptance-checks 節へ script による契約固定パス保存を明記し、SKILL.md
      共通制約の機械工程記述と整合させる。模型の責務分担（報告 JSON の意味レビュー・agentdev_gh I/O）は
      変更しない。
    verification_refs: [TS-002, TS-004]
    source_items: [AG-001, AG-003]
  - id: RA-004
    concern: 部品試験の追加と既存試験の維持
    responsibility: case-ready 機械工程 script の試験責務
    ownership_hints:
      - src/common/skills/agentdev-workflow-case-ready/scripts/tests/accept_definition_checks.test.ts
      - src/common/skills/agentdev-workflow-case-ready/scripts/tests/accept-validate-input.test.ts
    intent: >-
      TS-001 の分岐群を unit test として追加し、既存 acceptance-checks phase の fail-closed・後続抑止試験と
      --validate-input 試験を維持する。
    verification_refs: [TS-001]
    source_items: [AG-002]
review_dispositions: []
assembly_evidence:
  - target_file: docs/designs/commands/case-ready.md
    target_content_sha256: ad4ee010fe2a9f733419dfbfdfea1648fb3e4035b092b38fb4b707f067260050
    check_scope:
      heading: "## 機械工程の script 呼び出し契約（RU-0162）"
      start_line: 87
      end_line: 95
    execution_conditions:
      operation: append
      edit_sha256: aa4f9e18e7ceaca1deec88af0735815c7134b92dcef0825c92f96ed8fd2e5927
      expected_old_count: null
    checker:
      name: assemble-draft-section
      version: 0.2.0
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: target section only
    checks_summary:
      pre:
        count: 2
        all_ok: true
      post:
        count: 2
        all_ok: true
    diff_compact:
      changed_lines_count: 8
      added: 8
      removed: 0
    executed_at: "2026-11-02T18:57:45.658Z"
case_open_hints:
  epic_needed: false
  wave_hints: []
```

## 保存後の扱い

本 draft の保存時永続化として、保存した draft ファイルのみを対象とする明示パス指定の commit を実施する（スイープ操作なし。監督者第2次訂正指示による）。独立監査第二報・監督者指示により、本 draft の新機構は採用に進まず、case-auto へ接続しない。draft は `.agentdev/drafts/` に保持する（draft の削除は case-ready 成功時のみという現行契約のため。不進行 draft の削除・移動の手続は現行契約に存在しない）。不採用の最終確定、隔離課題 #3 の復旧・再検証、baseline 未整備の処置（IR-073/REQ-010-084）は監督者・人間判断の留保事項であり、本 workflow では行わない。将来の再発または監督者判断による再検討の場合は、本文の評価基準と監査第一報・第二報の調査記録を出発点とする。
