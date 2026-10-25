# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## close scripts package の typecheck が base commit で pre-existing エラー2件を抱え exit 2 で終了し typecheck gate が機能していない

- **問題事象**: agentdev-workflow-case-close scripts package の `bun run typecheck` が base（9b6e39329）で既に 2件の pre-existing エラー（`FinalAcceptanceResult` unused〔TS6133〕、`extractionSucceeded` overload 不一致〔TS2769〕）を抱え、exit 2 で終了する。恒久的に typecheck gate がこの package で機能していない状態が継続している
- **発生局面**: case-run 検証（DEL-3852-1、PR #3858 本文検証差分 typecheck〔case-close〕行）
- **検知方法**: case-run typecheck 実行の終了コード 2 と base との同一起源確認（base ではテスト行番号 L1105、変更後 L1159 で同一エラー）
- **根本原因**: 未使用 import の残存と `deriveAcceptancePopulation` 期待値の型不整合が先行して混入したまま未修正
- **自律対応内容**: 本変更では退行を追加していないことを base 同一起源確認と証跡で記録。恒久対応（未使用 import 除去と型整合）は未実施
- **ユーザー確認の有無**: なし
- **REQ/Decision/Design影響**: なし（base 既存問題。新規の契約変更なし）
- **横展開観点**: 他 scripts package の typecheck gate も exit 2 を暗黙許容していないかの棚卸しが有効
- **再発条件**: pre-existing エラーを baseline 化せず放置した package で typecheck gate を要求する場合
- **予防策候補**: 恒久対応（未使用 import の除去と `deriveAcceptancePopulation` 期待値の型整合）を別途実施する
- **想定反映先**: learning-promote による評価・昇華
- **関連**: PR #3858 本文検証差分 typecheck（case-close）行・退避先 `.agentdev/integrity/reports/ts004-typecheck-agentdev-workflow-case-close.stderr.txt`
- **タグ**: #typecheck #pre-existing #case-close-scripts

---

## bun test の結果サマリ（pass/fail 件数行）は stderr へ出力され、stdout のみの退避および execSync stdio pipe では欠落する

- **問題事象**: bun test の「Ran N tests across M files」等の結果サマリは stdout ではなく stderr へ出力される。stdout のみの証跡退避ではサマリが欠落する。さらに `child_process.execSync`（stdio pipe）ではサマリが欠落し、bash pipe 経由なら取得できる
- **発生局面**: case-run 検証（DEL-3852-1 PR #3858、DEL-3855-1 PR #3859 の bun test 証跡退避）
- **検知方法**: 退避ファイルの読み戻しで pass/fail 件数行の不在を確認
- **根本原因**: bun test は件数サマリを stderr へ書くランナーであり、退避経路（stdout 単独・execSync 単独）が stderr を捕捉しない
- **自律対応内容**: stdout・stderr の分離退避を常時付与し、検証証跡の退避実装では bash pipe + node writeFileSync を使用（pass/fail 件数が記録される経路）
- **ユーザー確認の有無**: なし
- **REQ/Decision/Design影響**: なし（既存の「stdout・stderr 分離退避の常時付与」規約の実運用確認）
- **横展開観点**: bun test を検証ランナーに使う全 Case の証跡退避に同一前提が成立
- **再発条件**: bun test の証跡を stdout 単独または execSync 単独で退避した場合
- **予防策候補**: 件数突合の受理根拠を stderr 退避ファイルに置く既存規約（機械工程の gate 証跡保持要件）を踏襲する
- **想定反映先**: learning-promote による評価・昇華
- **関連**: PR #3858・PR #3859 本文検証差分セクション（bun test 行の stdout/stderr 退避先記録）
- **タグ**: #bun-test #証跡退避 #stderr

---

## 配布 script 本文（コメント含む）の様式例示で「数字3桁 + NNN」形式が concrete-id 検出に掛かる

- **問題事象**: 配布 script 本文の様式例示に `REQ-010-NNN` のような「実在 REQ 番号と一致する数字部 + NNN」形式を書くと、配布依存境界 checker の concrete-id 検出に掛かる
- **発生局面**: case-run 検証（DEL-3854-1、PR #3857 の配布依存境界 checker 初回実行）
- **検知方法**: checker 初回実行で concrete-id 1件を検出（数字部が実在 REQ 番号と一致）
- **根本原因**: 検出器は数字3桁部の実在性で判定するため、実在番号を含む例示が誤検出対象になる
- **自律対応内容**: 様式例示を `REQ-0NN-NNN` 等の非数字形式へ修正し再実行で failures 0 を確認
- **ユーザー確認の有無**: なし
- **REQ/Decision/Design影響**: なし（既存の排除規定どおりの修正）
- **横展開観点**: 既存3 script が `REQ-{NNNN}-{NNN}` 形式のみを使用していたのはこの制約の実績と解釈できる。配布物本文の例示は非数字形式へ統一する
- **再発条件**: 配布物本文へ実在番号を含む様式例示を書き込んだ場合
- **予防策候補**: 配布物本文の様式例示は `REQ-0NN-NNN`・`REQ-{NNNN}-{NNN}` 等の非数字形式へ統一する
- **想定反映先**: learning-promote による評価・昇華
- **関連**: PR #3857 本文検証差分 checker 実行記録行（修正済み 2件）
- **タグ**: #配布依存境界 #concrete-id #様式例示

---

## traceability check の duplicate-inconsistencies は 1つの repo-local 検証テストを宣言できる sidecar を 1 component に限る

- **問題事象**: 同一 artifact パス × role（verification）の対応宣言を複数 component sidecar から行うと、traceability check の duplicate-inconsistencies が矛盾判定になる
- **発生局面**: case-run 検証（DEL-3855-1 PR #3859 の traceability check 初回実行、DEL-3854-1 PR #3857 の初回実行も同種）
- **検知方法**: traceability check 初回実行の duplicate-inconsistencies 検出（#3859 で 1件、#3857 で 2件）
- **根本原因**: REQ 行の集合が宣言先 sidecar ごとに異なると同一論理関係を一意に解決できないため、機械検査が矛盾として扱う
- **自律対応内容**: 宣言を1 component sidecar へ一元化（複数 REQ 行を単一 REQ 行追加で解消する形式）して再検証し合格。変更成果物が複数 component に跨る場合、同一論理関係（artifact パス × role）は所属 component の既存 sidecar へ統合する運用を確認
- **ユーザー確認の有無**: なし
- **REQ/Decision/Design影響**: なし（check の既存判定規則どおりの運用）
- **横展開観点**: repo-local pin テスト等の横断的に利用される検証資産の verification 宣言全般に同一規則が成立
- **再発条件**: 同一検証資産への verification 宣言を複数 sidecar から行った場合
- **予防策候補**: 帰属 sidecar を1 component に決めてから verification 宣言を書く（重複宣言の事前回避）
- **想定反映先**: learning-promote による評価・昇華
- **関連**: PR #3857・PR #3859 本文検証差分 traceability check 行
- **タグ**: #traceability #sidecar #duplicate-inconsistencies

---

## 検証用の node_modules junction が配布依存境界 checker の adapter-failure（read-failure）を起こす

- **問題事象**: 検証環境で作った node_modules junction が残存したまま配布依存境界 checker を実行すると、adapter-failure（read-failure）が発生する
- **発生局面**: case-run 検証（DEL-3855-1、PR #3859 の checker 初回実行）
- **検知方法**: checker 初回実行の adapter-failure 1件検出（実装違反ではなく検証環境起因と分類）
- **根本原因**: checker の走査が junction 経由の read 失敗に達する構造（worktree の構造的制約と同系）
- **自律対応内容**: junction 撤去後に再実行し failures 0 を確認（検証後の撤去が final gate の前提）
- **ユーザー確認の有無**: なし
- **REQ/Decision/Design影響**: なし（検査エラーは gate-not-passed として扱う既存契約どおり）
- **横展開観点**: checker 実行前の環境整備（junction 撤去・実体 node_modules のみ残す）を final gate の前提とする運用が安定
- **再発条件**: node_modules junction を残したまま checker を実行した場合
- **予防策候補**: checker 実行前に junction を撤去するか、実体 node_modules のみ残して実行する
- **想定反映先**: learning-promote による評価・昇華
- **関連**: PR #3859 本文検証差分 checker 実行記録行（無効分類 1件）
- **タグ**: #配布依存境界 #junction #checker

---

## Epic Wave ルートの pre-merge 機械検証で close_mechanical_steps pre-merge 必須入力と Epic ルート規定の範囲がずれ、residue check を決定的部品直接消費で実行した

- **問題事象**: close_mechanical_steps.ts の phase=pre-merge 入力は STEP-3 系の必須品質ゲート（generate_indexes、traceability-check、full-integrity-suite、textlint-final-check）を validateInput で要求するが、Epic Wave クローズルート（epic-wave-close.md）は E4-1 配布依存境界 最終 gate と residue check を規定するのみで STEP-3 系ゲートを経由しない。pre-merge 必須の contract-state-residue-check（REQ-032-042）を Epic Wave ルートで実行する正規の単独経路が入力契約上にない
- **発生局面**: case-close Epic Wave 1 クローズ pre-merge（DEL-3850-CLOSE-W1）
- **検知方法**: close_mechanical_steps.ts の validateInput 契約と epic-wave-close.md E4 規定の突合
- **根本原因**: close_mechanical_steps の pre-merge 入力契約が単一 Issue ルート（STEP-2〜4）の検証束ねを前提に設計され、Epic Wave ルート用の軽量実行モードを持たない
- **自律対応内容**: contract-state-residue-check を決定的部品 evaluateContractStateResidue の直接消費（一時 script、実行後削除）で実行し、判定の意味は契約と同一のまま REQ-032-042 の pre-merge 必須検証を両立させた（証跡 .agentdev/tmp/contract-state-residue-check.json）
- **ユーザー確認の有無**: なし（決定的部品の直接消費であり、検査の省略・迂回なし）
- **REQ/Decision/Design影響**: なし（REQ-032-042 の検証実行を満たす。判定部品と判定入力は契約どおり）
- **横展開観点**: Epic Wave クローズ全般で同一のずれが成立し得る（residue check の省略誘導リスク）
- **再発条件**: Epic Wave クローズルートで close_mechanical_steps pre-merge の完全入力を組まずに residue check を省略した場合
- **予防策候補**: close_mechanical_steps に residue-check 単独実行モード（Epic Wave ルート向け軽量 phase）を提供する
- **想定反映先**: learning-promote による評価・昇華
- **関連**: src/common/skills/agentdev-workflow-case-close/scripts/src/close_mechanical_steps.ts（validateInput、evaluateContractStateResidue）・`<workflows/epic-wave-close>` reference（E4-1、E4-2）
- **タグ**: #case-close #epic-wave #residue-check #機械工程

---

## Issue 完了条件の TS 番号参照が REQ 本文の正規検証戦略採番とズレる場合がある

- **問題事象**: Issue 完了条件に付された検証戦略番号（TS-004/TS-005）が、REQ 本文の正規検証戦略採番（REQ-110 は TS-013/TS-014）と一致しない場合がある。QG-4 判定時に Issue 側番号を REQ 正規採番と誤認するリスク
- **発生局面**: case-close QG-4 完了条件評価（DEL-3850-CLOSE-W1、Issue #3855）
- **検知方法**: REQ-110.md 本文の検証戦略テーブル（TS-013/TS-014、検証義務の所有構造）との突合
- **根本原因**: Issue 起票時点で REQ 検証戦略の正規採番を参照せず、起票時の暫定番号がそのまま残る
- **自律対応内容**: REQ 行の正規検証戦略（検証義務は手順契約、対応関係は sidecar verification 宣言が所有）を根拠正規契約として照合し、合格条件の意味命題（発見可能性、実体化内容一致、非破壊）の機械立証を確認して判定
- **ユーザー確認の有無**: なし
- **REQ/Decision/Design影響**: なし（REQ 行が正であり、本件は Issue 本文の軽微な番号ズレ。REQ 側の修正は不要と判断）
- **横展開観点**: Epic/Child Issue 起票時の TS 番号引用全般に同一のずれが成立し得る
- **再発条件**: REQ 検証戦略の正規採番を確認せずに Issue 完了条件へ TS 番号を引用した場合
- **予防策候補**: Issue 起票時の TS 番号引用は REQ 本文の正規検証戦略採番確認を前置する
- **想定反映先**: learning-promote による評価・昇華
- **関連**: docs/requirements/REQ-110.md（TS-013/TS-014）・Issue #3855 本文完了条件（TS-004/TS-005 表記）・完了記録コメント（判定根拠）
- **タグ**: #qg4 #検証戦略 #req行 #issue起票

---

## 2026-10-20: Bun.YAML 重複パスキーの last-wins shadow により sidecar 追記が無効化される

- **問題事象**: traceability/agentdev-workflow-req-define.yaml の implementation ロール配下に同一パスキーの重複ブロックが2組存在し（6f414e5ff 時点からの構造的負債）、Bun.YAML の last-wins 解釈で先行ブロックが実効無効化されていた。DEL-3816-1 が shadow される側（先行）ブロックへ REQ-004-064/065 宣言を追記したため、追記が実効読み取りされず、PR 本文の検証差分申告「対象20行の欠落が全件解消」と case-close QG-4 の missing 検出（REQ-004-064/065 missing-implementation）が乖離した
- **発生局面**: case-close STEP-2 QG-4 のトレーサビリティ 3 完全性ゲート（canonical main 上の check で missing 検出）
- **検知方法**: case-close QG-4 独立再検査（--req 対象20行 check）が PR 本文の申告と乖離する missing を検出。停止記録（issuecomment-6279710115）で原因の機械実測（bun v1.3.6 での parse 実測）を実施
- **根本原因**: sidecar への追記が「同一キーの既存ブロックへの統合」ではなく「重複キーを新設する追記」となり、YAML の last-wins 解釈で先行ブロック全体が shadow された。検出系は shadow 後の実効集合を見るため追記が黙って捨てられ、申告と実測が乖離するまで気付けない
- **自律対応内容**: PR #3819 で重複2キーを統合解消（union を単一ブロックへ保存・71エントリ集合一致を機械検証）。canonical main 上で対象20行 check exit 0 を再実測して解消を確認
- **ユーザー確認の有無**: なし（case-close 停止記録の差し戻し指示に基づく機械的修正）
- **REQ/Decision/Design影響**: なし（本件は sidecar 更新手順の運用知見。重複パスキー事前検出の構造的予防は intake 候補として回収済み）
- **横展開観点**: 全70 sidecar を node 線形走査で再確認済み（本ファイルのみ重複）。他の YAML 宣言的データ（policy.yaml・extension yaml 等）への追記・更新でも同一リスクが成立し得る
- **再発条件**: sidecar 等の YAML 宣言的データへ「既存キーのブロックと同一キー」の追記を行った場合
- **予防策候補**: sidecar 追記・更新は「同一キーの既存ブロックへの統合」を正規手順とする。重複キー検出の導入（check の malformed-declarations 拡張等）は intake 候補として回収済み
- **想定反映先**: learning-promote による評価・昇華
- **関連**: Issue #3816・PR #3818・PR #3819・停止記録 issuecomment-6279710115・対応記録コメント（本 Case）
- **タグ**: #traceability #yaml #sidecar

---

## 並行 merge により draft 合意の REQ 行採番が消費され case-open 適用前検証で差し戻しが発生

- **問題事象**: req-draft-heading-scan-code-fence（2026-10-20T00:20 合意）の case-open 実行時、REQ-004-064/065 が並行 merge acf86dd5a（PR #3817、2026-10-20T06:54）で追加済みであり、draft の REQ-004-064〜066 が採番衝突した。docs/designs/commands/req-define.md も同 merge で frontmatter updated と ADF-COVERS 宣言行が変わり target_content_sha256 が陳腐化した
- **発生局面**: 実装（case-open STEP-3 の artifact_actions 適用前検証。Root Case #3820）
- **検知方法**: STEP-3 手順 1.5 の採番衝突検査（REQ-004.md 既存行 ID 突合）と assembly_evidence の target_content_sha256 と現行 HEAD の突合
- **根本原因**: req-define 合意時点の採番対象行が、case-auto 起動までの間に別 Case（一式 20261019T231959JST）の Definition merge で消費される非同期競合。draft は保存後も採番し直しを持たない
- **自律対応内容**: 適用を中止し非公式補完（番号振り直し・部分適用）を行わず、req-define への差し戻しと blocked 報告を実施。draft・関連 jev 観測3件は先行 commit c6258ce08 で永続化済み
- **ユーザー確認有無**: なし（case-open スキル契約 STEP-3 手順 1.5 の fail-closed 差し戻しの機械的適用）
- **Decision/REQ/spec影響**: なし（既存契約どおりの動作。契約変更不要。適用前検証が並行 merge を確実に検出した）
- **横展開観点**: REQ 行追加を含む全 draft の case-open 適用で同一競合が成立し得る。採番衝突検査と sha256 突合の有効性を実証した
- **再発条件**: draft 合意時点から case-open 適用時点の間に、同一 REQ ファイルへの REQ 行追加を含む Definition merge が入る場合
- **予防策候補**: 契約側の追加は不要（手順 1.5 が検出済み）。運用上は case-open 実行開始の早期化が陳腐化窓を縮める
- **想定反映先**: learning-promote による評価・昇華
- **関連**: .agentdev/drafts/req-draft-heading-scan-code-fence.md・Root Case #3820・merge acf86dd5a（PR #3817）
- **タグ**: #case-open #採番衝突 #並行merge #fail-closed

---

## worktree の .opencode junction 供給が切れると配布依存境界 link profile が zero-targets fail-closed する

- **問題事象**: worktree では main 側で junction 供給される .opencode/skills/agentdev-*・commands/agentdev・tools・plugins が不在となり、配布依存境界 link profile が zero-targets で fail-closed する（checker の警告文もこの確認を促す）。検出が構造的であり、実装問題と誤認しやすい
- **発生局面**: case-run STEP-S5-1 配布依存境界 最終 gate（Root Case #3820、worktree .worktrees/3820-fix）
- **検知方法**: link profile checker の zero-targets 事前警告と初回実行の fail-closed
- **根本原因**: worktree へは git 管理外実体（junction・node_modules）が伝播しない構造的制約
- **自律対応内容**: worktree 内 src/** 向け junction を再作成してから link profile を再実行し、ok・failures 0・scanned 485 を確認（証跡 .agentdev/tmp/dist-gate-final-link.json 初回分）
- **ユーザー確認有無**: なし（未追跡の環境整備であり、管理対象ファイルへの変更なし）
- **REQ/Decision/Design影響**: なし（checker 実行契約 Design の既存 fallback 契約どおりの運用）
- **横展開観点**: worktree 実行の link profile・checker 依存検査全般に同一前提が成立。junction 再作成→再実行の手順が安定する
- **再発条件**: worktree 内で .opencode/** junction を前提とする checker を junction 再作成なしに実行した場合
- **予防策候補**: worktree 作成手順への junction 再作成前置の明示（検証時のみ。削除は worktree remove 前に junction エントリのみ）
- **想定反映先**: learning-promote による評価・昇華
- **関連**: 実装PR #3822 本文 検証差分（case-run link profile 行）・Root Case #3820
- **タグ**: #worktree #junction #配布依存境界 #link-profile

---

## record-comments.ts applySection のセクション置換で直前空行が消え見出しが前文に接続する

- **問題事象**: case-close STEP-5-2 の本文結果セクション更新で applySection（agentdev-workflow-case-run scripts/record-comments.ts）を用いたところ、置換対象セクションの直前に空行があっても `before` 末尾の `\n+` が剥ぎ取られ、`## 進行状況`・`## 結果` の見出しが前文行へ直接接続した（GitHub 描画は成立するが Markdown 構造が崩れる）
- **発生局面**: case-close STEP-5-2 本文更新（Root Case #3820、commit 1968b0ac 済み Case の Issue 本文更新）
- **検知方法**: issue_update 前の適用後本文の目視確認（glued headings の機械チェックを追加して検出）
- **根本原因**: applySection の `${before}\n${sectionMarkdown}` 連結が `before` の末尾空行を保持しない
- **自律対応内容**: 適用後に `\n## 見出し` へ空行を補完する後処理を実施してから GitHub 書込み
- **ユーザー確認有無**: なし（書込み前の整形後処理）
- **REQ/Decision/Design影響**: なし（出力の整形問題であり、セクション構築・適用の契約は不変）
- **横展開観点**: Epic 本文更新（applyEpicChildStatusUpdates は行内置換で影響なし）を除き、applySection 経由の Issue 本文更新全般に成立し得る
- **再発条件**: applySection で既存セクションを置換した場合（新規追加時は base 末尾に空行が付くため不成立）
- **予防策候補**: applySection の連結前に before 末尾へ空行 1 行を保証する修正（record-comments.ts 側）
- **想定反映先**: learning-promote による評価・昇華
- **関連**: agentdev-workflow-case-run/scripts/record-comments.ts applySection・Root Case #3820 対応記録コメント
- **タグ**: #record-comments #applySection #issue-update

---

## req-draft の全セクション content フィールドが変更なし行で現行本文と漂う差異を含み行レベル適用との突合を阻害し得る

- **問題事象**: case-open STEP-3/STEP-4 で draft（req-draft-release-publish-and-ru-numbering）の ACT-DESIGN-001 content（対象セクション全文形式）を現行本文と突合したところ、変更対象外の行（GitHub版/Local版等価性の pr_merge 行）で現行本文の「…使用しない。:48 の宣言に対応）」に対し content 側は「:48 の宣言に対応」を欠くレンダリングになっており、全文置換すると既存記述が黙示的に削除される形状だった。同一 draft の assembly_evidence（15 実行・各 changed_lines_count 1〜2）は行レベル適用の実績と一致する
- **発生局面**: case-open STEP-3 artifact_actions 適用前検証（content 完全性検証）／Case #3823
- **検知方法**: artifact_actions 適用前検証（STEP-3 手順1.5(4)）で content と対象セクション現行全文の差分照合
- **根本原因**: req-define の draft 生成で、全セクション形式の content フィールドは変更行以外を現行本文から転記するため、変更なし行の文言が現行本文や assembly_evidence の実適用範囲から漂って転記され得る
- **自律対応内容**: 全文置換を行わず、assembly_evidence の行レベル実行と draft content の変更行のみを DefinitionEdit（oldText 完全一致）に分解して適用し、変更なし行は現行本文を保持した（適用後 verbatim 包含突合 32 項目すべて成立）
- **ユーザー確認有無**: なし（既存記述の非削除を保証する保守的適用）
- **Decision/REQ/spec影響**: なし（合意内容・契約文言の変更なし。適用方法の工学的判断）
- **横展開観点**: 全セクション content 形式の draft/RU を case-open / case-revise / case-ready で適用するすべての Case で成立し得る
- **再発条件**: draft の artifact_actions content がセクション全文形式で、かつ変更行以外の文言が現行本文と字句的に漂っている場合
- **予防策候補**: req-define draft 生成時に content を変更行の行レベル差分で表現するか、content 全文と現行セクションの機械 diff（変更行集合と assembly_evidence の一致検査）を draft 保存前検査へ追加する
- **想定反映先**: learning-promote による評価・昇華（req-define draft-generation の検査強化候補）
- **関連**: .agentdev/drafts/req-draft-release-publish-and-ru-numbering.md（ACT-DESIGN-001・assembly_evidence）、Root Case #3823、設計PR #3824
- **タグ**: #draft-content #artifact-actions #case-open

---

## deno LSP diagnostics が bun 前提テストファイルの bun 固有 API を誤検知し単一ファイル diagnostics が不採用になる

- **問題事象**: skills 配下の bun 前提テストファイル（`import.meta.dir` 等）に対し deno LSP diagnostics が誤検知し、3 秒タイムアウトも再現するため、単一ファイル diagnostics を検証証拠に使えない
- **発生局面**: case-run（DEL-3823-2）LSP diagnostics 実行／Root Case #3823
- **検知方法**: LSP diagnostics 実行で誤検知（bun 固有 API の未解決参照）とタイムアウトの再現を確認
- **根本原因**: deno LSP は bun 固有 API を解決できない。当該ファイルは skills 配下に tsconfig 不在で tsc 対象外のため LSP 側の補正も入らない
- **自律対応内容**: 単一ファイル diagnostics を不採用とし、typecheck（tsc --noEmit、package tsconfig で tests/*.ts を include）+ bun test 実行（split2 779 pass）で代替検証。差分がコメント 1 行のみのファイルは実行検証で十分と判断
- **ユーザー確認有無**: なし（検証手段の代替。観測能力は同等以上: typecheck は当該 API を含む型解決、bun test は実行時検証）
- **REQ/Decision/Design影響**: なし（検証運用の知見。契約変更なし）
- **横展開観点**: bun 前提のテストファイルを deno LSP で診断するすべての検証で成立し得る
- **再発条件**: bun 固有 API を参照するファイルを deno LSP で単一ファイル diagnostics する場合
- **予防策候補**: bun 前提ファイルの diagnostics は package tsconfig 経由の tsc --noEmit + bun test を正規代替とする運用を検証手順に明記する（learning-promote で評価）
- **想定反映先**: learning-promote による評価・昇華
- **関連**: PR #3825 本文「Findings / Capture候補」2 件目、src/common/skills/agentdev-workflow-backlog-auto/tests/end-to-end-contract.test.ts
- **タグ**: #lsp #deno-lsp #bun #verification

---

## generate_indexes 派生物自身の frontmatter updated 追随が case-open 計測日収束手順の明示対象外で補正 commit が増加した

- **問題事象**: REQ 行追加を伴う Definition Package の prepare_definition_pr 実行で、check_integrity の req-updated-freshness（IR-072）が generate_indexes 派生物 req-health-metrics.md 自身の frontmatter updated 未追随を検出し、計測日収束のための補正 commit が 3 回の script 呼び出しに増えた
- **発生局面**: case-open STEP-4（Definition PR 作成の機械工程）／Root Case #3829
- **検知方法**: prepare_definition_pr script 内の check_integrity gate が exit 1（NG 2件 → 補正後 1件）で検知
- **根本原因**: reference の計測日収束手順（2段検出）は (a) req-metrics 計測日 AUTOGEN 更新と (b) req-updated-freshness による frontmatter updated 追随を REQ・Design 側の追随として記述するが、generate_indexes 派生物（req-health-metrics.md）自身の frontmatter updated は AUTOGEN 再生成対象外であり、派生物の内容変更が発生した場合の frontmatter 追随が手順上明示されていなかった
- **自律対応内容**: 派生物 req-health-metrics.md の frontmatter updated（2026-10-20 → 2026-10-21）を DefinitionEdit で追随させ、明示パス指定補正 commit（52de5c241e）で収束させ、check_integrity pass を確認した
- **ユーザー確認有無**: なし（既存 integrity rule IR-072 の機械検査に従った追随）
- **Decision/REQ/spec影響**: なし（契約変更なし。機械検査の検出に従った追随作業）
- **横展開観点**: REQ 行追加を伴う Definition Package を生成するすべての Case で、generate_indexes が派生物の内容を変更した場合に派生物自身の frontmatter updated 追随が残作業として生じ得る
- **再発条件**: REQ 行追加等で generate_indexes 派生物（req-health-metrics.md 等）の内容が変化し、派生物の frontmatter updated が最終内容変更日より旧い場合
- **予防策候補**: case-open STEP-4 reference「計測日収束」節に、generate_indexes 派生物自身の frontmatter updated 追随（IR-072）を補正 commit 対象として明記する（learning-promote で評価）
- **想定反映先**: learning-promote による評価・昇華（case-open reference の手順強化候補）
- **関連**: docs/designs/quality/req-health-metrics.md、.worktrees/3829-definition、設計PR #3830、Root Case #3829
- **タグ**: #case-open #generate_indexes #frontmatter #計測日収束

---

## worktree 環境の配布依存境界 link profile は zero-targets fail-closed となり junction 構成 root での読み取り専用実行が正

- **問題事象**: worktree 環境では `.opencode` 側の junction 投影が構成されず、配布依存境界 link profile は zero-targets fail-closed（検査不能=不合格）になる。link profile の実行は junction 構成 root（host main root）での読み取り専用実行が正しい環境分離である
- **発生局面**: case-run STEP-S5 品質統制8（配布依存境界 checker 実行）／Root Case #3829、Issue #3831
- **検知方法**: worktree 内で link profile を実行すると zero-targets:link failure（fail-closed、EXIT=1、scanned_files 0）を観測
- **根本原因**: worktree には `.opencode/skills/agentdev-*` の junction が伝播せず、link projection 走査対象が 0 件になる構造的制約
- **自律対応内容**: worktree 内 link 実行を無効実行（検査対象外）として扱い、host main root（junction 構成 root）での読み取り専用実行を正規経路として採用した。checker 実行記録表に fail-closed 実測（3行目）と main root 合格根拠（2行目）を併記した
- **ユーザー確認の有無**: なし（checker 実行契約 Design「link profile 実効実行要件」節の既存契約に従った環境分離）
- **REQ/Decision/spec影響**: なし（既存契約どおりの動作の実証）
- **横展開観点**: junction 系 skill scripts・plugins 系 gate を用いる検査はすべて同一の構造的制約を持つ（main root 実体 + --root 指定の汎用手順）。worktree 内で source / link 両 profile 実行を品質統制に組み込む場合はこの環境差を事前に織り込む必要がある
- **再発条件**: worktree 内で link profile（`.opencode/**` の link projection 走査）を実行した場合
- **予防策候補**: 品質統制定義時に link profile の実行環境を junction 構成 root へ明示指定する。worktree 実行時は無効分類として記録し、zero-targets を clean 扱いや暗黙の検査省略にしない
- **想定反映先**: learning-promote による評価・昇華
- **関連**: PR #3833 本文「Findings / Capture候補」learning 1 件、checker 実行記録表、checker 実行契約 Design「link profile 実効実行要件」節
- **タグ**: #worktree #junction #link-profile #配布依存境界 #環境分離

---

## Windows 環境の git worktree remove がメタデータ削除済み・物理ディレクトリ残存の半失敗状態を返すことがある

- **問題事象**: `git worktree remove`（--force なし）が Windows 環境で exit 255 を返し、`git worktree list` からは登録消滅している一方で物理ディレクトリ（`.worktrees/3831-feature`）が残存する半失敗状態になった
- **発生局面**: case-close STEP-6-1 worktree 削除（Issue #3831、post-merge 機械工程 script の cleanup-worktree-branch step）
- **検知方法**: post-merge script 報告 JSON の worktreeRemoveExitCode 255 と cleanup-worktree-branch step の warn（needs-judgment）
- **根本原因**: worktree remove 処理の途中でメタデータ削除とディレクトリ削除の間に失敗（ファイルロック等の Windows 特有要因と推定。根本は未特定）
- **自律対応内容**: `git worktree list` と物理ディレクトリの実在確認で半失敗を特定し、`git worktree prune` 後に残骸ディレクトリを明示削除（EXIT=0）して worktree と branch のクリーンアップ完了を確認した
- **ユーザー確認の有無**: なし
- **REQ/Decision/spec影響**: なし（cleanup 結果の実体確認は既存の完了検証規律どおり）
- **横展開観点**: worktree cleanup の自動化経路では、remove の非ゼロ終了を直ちに失敗と断定せず、worktree list・物理ディレクトリの実在確認で実体状態を判定する必要がある。branch 削除（-d）は同一実行で成功しており、worktree と branch の状態を別々に確認する
- **再発条件**: Windows 環境で worktree 内のファイルがロックされたまま worktree remove が実行された場合
- **予防策候補**: cleanup 自動化に remove 失敗時の worktree list + 物理残骸確認と残骸削除の再試行経路を補う（learning-promote で評価）
- **想定反映先**: learning-promote による評価・昇華
- **関連**: close_mechanical_steps.ts post-merge 報告 JSON、`.worktrees/3831-feature`、Issue #3831
- **タグ**: #worktree #cleanup #windows #case-close

---

## bun test の並行分割起動がテストレベル timeout の flake を誘発し得る（case-run 品質統制6の 3 分割実行運用）

- **問題事象**: bun test 3 分割を並行起動した際、5 秒のテストレベル timeout を持つテスト（check_changed_docs.test.ts の fixture git 操作を含むテスト等）が CPU 競合で timeout fail した（初回 2940 pass / 1 fail → 単独再実行で 2941 pass / 0 fail）
- **発生局面**: case-run STEP-S5 品質統制6（full integrity suite 3 分割実行）／Root Case #3829、Issue #3832
- **検知方法**: split1 初回実行のテストタイムアウト 1 件（bun test のタイムアウト表示と fail 行）を観測し、単独再実行（fix-and-reverify）で解消
- **根本原因**: 3 分割の並行起動による CPU 競合で、固定 timeout を持つテストの実行時間が timeout 値を超過した（環境要因。テスト自体の欠陥ではない）
- **自律対応内容**: split1 を単独再実行し、2941 pass / 0 fail・終了コード 0 を確認してから検証を続行した。case-close の close_mechanical_steps.ts による 3 分割実行は分割ごとの逐次起動であるため、この flake は起きた構造上発生しない
- **ユーザー確認の有無**: なし（flake 分類と再実行解消は既存の検証差分記録規律どおり）
- **REQ/Decision/spec影響**: なし（正規形どおりの逐次起動では影響しない運用上の知見）
- **横展開観点**: 並行起動する場合は timeout 系テスト（fixture git 操作・外部プロセス起動を含むテスト）の存在を考慮し、再実行での確認を前提にする。品質統制の実行運用を並行化する場合は flake 分類の記録経路を同一 PR 内に用意する
- **再発条件**: bun test 3 分割を並行起動し、かつ固定 timeout テストが CPU 競合下で timeout 値を超過した場合
- **予防策候補**: 3 分割実行は正規形どおり分割ごとに逐次起動する。並行起動する場合は timeout 系テストの存在確認と再実行前提の運用を品質統制定義に明記する（learning-promote で評価）
- **想定反映先**: learning-promote による評価・昇華
- **関連**: PR #3834 本文「Findings / Capture候補」learning 1 件、Issue #3832 対応記録コメント検証差分 #3
- **タグ**: #bun-test #並行実行 #timeout-flake #case-run #品質統制

---

## node spawnSync（shell: true）で大量 stdout の checker をラップすると exit が null で返却される

- **問題事象**: node `child_process.spawnSync`（`shell: true`）で stdout 約 811KB の textlint gate 実行をラップした際、プロセス自体は完了するが `exit` が `null` で返却される例を観測した。同等コマンドの直接実行は EXIT=0 を確認済み
- **発生局面**: case-run STEP-S5 textlint gate の証跡退避自動化（Root Case #3835、PR #3837 本文「Findings / Capture候補」learning 候補の回収）
- **検知方法**: ラッパー経由の終了コードと同等コマンド直接実行の終了コードの比較（exit null と EXIT=0 の乖離）
- **根本原因**: 大量 stdout を出力する子プロセスの spawnSync（shell: true 経由）の終了コード取得が、標準出力の扱い（maxBuffer・シェル経由の終了伝播）に依存して信頼できない
- **自律対応内容**: 証拠としては直接実行の終了コードを採用。case-close STEP-3 では textlint gate を直接実行（spawnSync に shell: false の配列引数）し、終了コード 0 を機械工程 script 経由で再取得して整合を確認
- **ユーザー確認の有無**: なし（証跡採用判断は検証差分記録規律どおり）
- **REQ/Decision/spec影響**: なし（checker 実行契約 Design の stdout 証跡退避形式は現行契約のまま。実装経路の選択知見）
- **横展開観点**: 大量 stdout を出力する checker（textlint、full suite 等）の証跡退避を spawnSync で自動化する場合、終了コードをラッパー経由で信用せず直接実行での確認、または maxBuffer / 標準出力の扱いの検証を前置する
- **再発条件**: spawnSync（shell: true）で大量 stdout の checker をラップして終了コードを取得した場合
- **予防策候補**: checker 実行の自動化ラッパーは shell: false の配列引数で起動し、大量 stdout の場合は終了コードの直接実行でのクロス確認を運用に組み込む
- **想定反映先**: learning-promote による評価・昇華
- **関連**: PR #3837 本文「Findings / Capture候補」learning、Issue #3835
- **タグ**: #spawnSync #textlint #証跡退避 #case-run

---

## close_mechanical_steps.ts の integrityGates 必須入力と full suite 再実行禁止の両立は保存済み証跡の読み戻し検証コマンドを gate として接続する

- **問題事象**: case-close STEP-3 の機械工程 script（close_mechanical_steps.ts）は入力検証で integrityGates（full-integrity-suite）の省略を拒否する一方、bun test 実行形態契約の「同一情報の取得だけを目的とした full suite 再実行をしない」と、3 cwd 分割の直接実行（分離退避・件数突合）が STEP-3 の正規形として並存する。script 経路の integrityGates に分割コマンドをそのまま渡すと suite 再実行（約10分）が発生する
- **発生局面**: case-close STEP-2/STEP-3 機械工程の pre-merge 呼び出し（Root Case #3835、merge 直前 HEAD 4360754c6）
- **検知方法**: 入力契約（REQUIRED_GATES_PRE_MERGE・evaluateIntegrityMachineAcceptance）と STEP-3 再実行禁止規定の突合
- **根本原因**: 2つの契約の射程差（script は gate の exitCode 実体を必要とするが、証跡はすでに保存済み）
- **自律対応内容**: 3 分割を直接実行（stdout/stderr 分離退避・timeout 600 秒明示・件数突合）した上で、integrityGates には保存済み証跡の読み戻し検証コマンド（bun -e で 4 退避ログの fail 件数 0・件数サマリー存在を検証、exit 0/1）を「full-integrity-suite-evidence-replay」として接続し、IntegrityMachineAcceptanceRecord の suiteRunRecords・環境ラベル・runner 版・baseline 記録を実体として渡した。報告 JSON で machineAcceptance accepted と warnings 0 を取得
- **ユーザー確認の有無**: なし（既存契約の適用実践であり、契約変更なし）
- **REQ/Decision/spec影響**: なし（checker 実行契約 Design「保存済み検証証跡からの解析と再実行条件」の適用。新たな品質ゲート・証跡基盤は不設置）
- **横展開観点**: 機械工程 script が gate 実行体を要求する場合でも、gate には「実行コマンド」ではなく「証跡の読み戻し検証コマンド」を渡せる。再実行禁止と機械受理判定の両立パターンとして traceability・textlint 等、証跡保存済みの gate 全般に適用可能
- **再発条件**: 保存済み証跡を持つ検証を、gate 実行体を必須とする機械工程 script に接続する場合
- **予防策候補**: 証跡退避ファイル名の採番規則を stdout/stderr 対応が判別できる形に統一しておく（evidence-replay コマンドの検証対象として機械参照可能にする）
- **想定反映先**: learning-promote による評価・昇華
- **関連**: close_mechanical_steps.ts 報告 JSON（.worktrees/3835-chore、削除済み退避を含む）、Issue #3835
- **タグ**: #case-close #機械工程 #証跡 #bun-test

---

## merge 直後の main worktree が未 pull の場合、merge 後重複行実検査は git show origin/main: でツリー内容を直接読む

- **問題事象**: STEP-4-6 の merge 後重複行実検査の対象は「merge 後 main HEAD 上」だが、main worktree の working tree は STEP-6-3 の `git pull --ff-only` 前では旧 main のままであり、worktree のファイルを grep すると旧状態を検査してしまう（実際、policy.yaml の REQ-094-013 が 0 件に見える誤観測が発生）
- **発生局面**: case-close STEP-4-6 merge 後重複行実検査（Root Case #3835、squash merge 2f7e1a14c 直後）
- **検知方法**: grep カウント 0 と PR 変更内容の矛盾（policy 登録行が merge HEAD に存在するはず）の突合
- **根本原因**: 検査対象（git ツリー）と検査手段（worktree の作業ディレクトリ）の状態ずれ。main worktree の pull は STEP-6-3 の正規手順であり前倒ししない
- **自律対応内容**: `git show origin/main:<path>` と `git ls-tree origin/main` で merge HEAD のツリー内容を直接読み取り、REQ-094-013 テーブル行・宣言・policy 登録・sidecar・report の重複混入なしを確認（squash commit の single parent も確認）
- **ユーザー確認の有無**: なし（読取系の検査対象解決のみ）
- **REQ/Decision/spec影響**: なし（STEP-6-3 の正規手順を変更しない対応）
- **横展開観点**: merge 直後に実施する main HEAD 基準の検査（重複行実検査、merge 内容確認等）は、main worktree の pull 前後に関係なく `git show origin/main:` / `git ls-tree` でツリー内容を読む方が状態ずれに強い
- **再発条件**: main worktree が merge 前 HEAD に留まったまま（pull 前）、merge 後 main HEAD の内容検査を worktree ファイルに対して実行した場合
- **予防策候補**: STEP-4-6 の検査手順に「main worktree 未 pull 時は git show origin/main: で merge HEAD ツリーを検査する」の前置を明記する（learning-promote で評価）
- **想定反映先**: learning-promote による評価・昇華
- **関連**: Issue #3835、merge commit 2f7e1a14cb56b7a910c721ea101088109a468169
- **タグ**: #case-close #merge検査 #git-show #重複行実検査

---

## GitHub squash merge の author date 置換により IR-072（frontmatter updated）が case-run 時の整合から drift する

- **問題事象**: case-run 時に frontmatter updated を最終内容変更 commit 日へ同期済みでも、squash merge が commit の author date を merge 実行日時へ置換するため、main HEAD 上では全変更ファイルの「最終内容変更 commit 日」が merge 日になる。case-run と merge が日付を跨ぐ場合（深夜 0 時超えを含む）、updated が旧日のままのファイルで IR-072（req-updated-freshness）が new unmanaged NG として顕在化する。Case #3839 では merge 直前 HEAD 実測で 1 件、merge 後 main HEAD でさらに 4 件が新規検出された（case-run 時は commit の author date が深夜 0 時超えで 2026-10-22 にずれ、実行担当の updated 同期の前提が変わった二重機構）
- **発生局面**: case-close STEP-4 PR マージ直後の check_integrity 実測（Root Case #3839）
- **検知方法**: merge 直前 HEAD の check_integrity で IR-072 new unmanaged NG 1 件、merge 後 main HEAD での再実行でさらに 4 件（変更が最初の commit〔2026-10-21〕のみで入ったファイル群）
- **根本原因**: IR-072 の基準値（last content-change commit の author date）が squash merge の author date 置換（AUTOGEN 鮮度 gate の「計測日 drift 発生機構」3 種と同系の機構）で変化する。case-run 側の updated 同期は merge 前の commit 日付を前提とするため、merge 日との差分で構造的に drift が残る
- **自律対応内容**: STEP-3-1 対象範囲内の metadata 修正として 6 ファイルの updated を merge 日へ進行（commit d2c5c6d7、conventional commits + (Refs #3839) 形式で main 直接 push）、check_integrity 再実行で NG 0 を確認
- **ユーザー確認の有無**: なし（frontmatter metadata 1 行 × 6 ファイルの決定的修正、内容不変）
- **REQ/Decision/Design影響**: なし（patterns.md の updated 進行規約の機械的適用）
- **横展開観点**: docs 内容変更を含む PR の squash merge では IR-072 drift が構造的に発生し得る。merge 後 main HEAD での check_integrity 確認（IR-072 群）を case-close の前置に含める運用が drift の取りこぼしを防ぐ
- **再発条件**: case-run の最終 commit 日と case-close の merge 実行日が異なる docs 変更 PR の squash merge
- **予防策候補**: case-close STEP-4/STEP-5 で merge 後 main HEAD の check_integrity（IR-072 系）を確認し、drift 検出時は metadata 修正 1 commit で整合させる手順の明文化（learning-promote で評価）
- **想定反映先**: learning-promote による評価・昇華
- **関連**: Issue #3839・PR #3840・merge commit a0eaefba2・修正 commit d2c5c6d74・対応記録コメント検証差分（case-close check_integrity 行）
- **タグ**: #case-close #squash-merge #IR-072 #frontmatter-updated

---

## 作業一覧型 docs 是正では「該当箇所」列の意味（原文引用か要点ラベルか）を明示しないと行単位の機械突合が不正確になる

- **問題事象**: 作業一覧 CSV（959 行）の「該当箇所」列は原文の逐語引用ではなく指摘型の要点ラベルであり、行番号起点の行本文が作業対象となる。列の意味を明示せずに機械突合すると、該当箇所列と実文の不一致が大量の誤差異として検出される
- **発生局面**: case-run 着手前差分確認（Root Case #3839、worklist 959 行の全行機械照合）
- **検知方法**: worklist 全行のファイル存在と行番号内容の機械照合（該当箇所列と行本文の乖離を確認）
- **根本原因**: 作業一覧生成側（検査系）と作業一覧消費側（是正系）で「該当箇所」列の意味契約が未定義
- **自律対応内容**: 該当箇所列を指摘型の要点ラベルとして扱い、行番号起点の行本文を作業対象として処理。着手前差分確認の記録に本方針を明記
- **ユーザー確認の有無**: なし（読取方針の確定のみ）
- **REQ/Decision/Design影響**: なし
- **横展開観点**: 検査系が生成する行一覧 CSV を入力とする全ての横断是正 Case で同一の突合精度問題が成立し得る
- **再発条件**: 「該当箇所=原文引用」か「要点ラベル」かが明示されない作業一覧を機械突合した場合
- **予防策候補**: 次回の同種作業一覧では列意味の明示フィールドを設ける（検査系の出力 schema 拡張候補。learning-promote で評価）
- **想定反映先**: learning-promote による評価・昇華
- **関連**: PR #3840 完了報告コメント（Capture候補 learning 記載分）・Issue #3839
- **タグ**: #docs是正 #作業一覧 #機械突合 #schema

---

## frontmatter updated（IR-072）の進行は docs 内容変更 PR での必発の整備事項であり PR 手順への記載候補がある

- **問題事象**: docs 内容変更 PR では内容変更ファイルの frontmatter updated を最終内容変更 commit 日へ進行する整備（IR-072）が必発だが、case-run 手順・PR テンプレートに整備漏れ防止の明示がなく、case-run 実行中に check_integrity 検出 → 修正 → 再実行の反復が発生した（Case #3839 では 43 ファイル）
- **発生局面**: case-run 実装・検証（Root Case #3839、check_integrity の IR-072 検出過程）
- **検知方法**: check_integrity の req-updated-freshness 検出（43 件）→ updated 進行 → 再実行で残 4 件（author date 整合分）を解消
- **根本原因**: 内容変更と updated 進行の手順結合が実行側の注意事項として暗黙化されている
- **自律対応内容**: 検出 → 修正 → 再実行で解消（metadata のみの変更として処理）
- **ユーザー確認の有無**: なし
- **REQ/Decision/Design影響**: なし（patterns.md・IR-072 の既存規約どおりの運用）
- **横展開観点**: docs 内容変更を含む全 PR で成立する定型整備
- **再発条件**: docs 内容変更 PR で updated 進行を忘れた場合
- **予防策候補**: 内容変更と同時に updated を進める手順の PR テンプレート（case-run / docs 変更系）への記載を検討する価値（PR #3840 完了報告コメントの Capture候補 learning 記載分。learning-promote で評価）
- **想定反映先**: learning-promote による評価・昇華
- **関連**: PR #3840 完了報告コメント（Capture候補 learning 記載分）・Issue #3839・IR-072
- **タグ**: #docs是正 #IR-072 #PR手順 #テンプレート

## case-auto sidecar に design セクションが無い component の design 宣言先は Design 文書本体の inline 宣言

- **問題事象**: case-open 機械工程（prepare_definition_pr）で新規 REQ 行 REQ-034-048 の design 宣言を traceability/agentdev-workflow-case-auto.yaml の input-resolution-and-orchestration.md 配下へ追加したが、当該 sidecar の role セクションは implementation と verification のみで design セクションが存在せず、追加した宣言は implementation 宣言として解釈され missing-design が解消されなかった
- **発生局面**: case-open STEP-4 機械工程の DefinitionEdit 組立（Root Case #3841、traceability check 初回実行で fail 検出）
- **検知方法**: traceability check（--req 対象行）の missing-design findings（REQ-034-048）と coverage --req の実測帰着（REQ-034-048 が implementation に帰着、design 0件）
- **根本原因**: 宣言先を「先行行 REQ-034-046/047 が sidecar に列挙されている」という表面観察から決め、artifact 種別ごとの管理経路（workflow skill ファイル側は sidecar、Design 文書側は inline 宣言、同一論理関係が両情報源に存在する場合は集合一致）を確認せずに sidecar の該当 artifact 配下へ追加した
- **自律対応内容**: 補正 commit d5a18c5c で sidecar implementation セクションから REQ-034-048 を撤去し、docs/designs/commands/case-auto.md の inline design 宣言へ再配置。併せて case-open.md inline 宣言と sidecar design セクションの集合一致（REQ-030-031 追加漏れによる duplicate-inconsistencies）を解消
- **ユーザー確認の有無**: なし（機械検査の fail 検出と補正 commit で完結）
- **REQ/Decision/Design影響**: なし（宣言は正しい位置へ再配置済み）
- **横展開観点**: design/implementation/verification の宣言追加を行う全 Case（case-open / case-run / case-revise）で、sidecar の role セクション有無を確認せず先行行の列挙位置へ追加する誤りが成立し得る
- **再発条件**: 対象 component の sidecar に design セクションが存在しない状態で、先行行が implementation セクションに列挙されているのを根拠に design 宣言を同位置へ追加した場合
- **予防策候補**: design 宣言追加前に対象 sidecar の role セクション実在を確認し、design セクション不在なら Design 文書本体 inline 宣言へ宣言先を切替する手順を learning-promote で評価
- **想定反映先**: learning-promote による評価・昇華
- **関連**: PR #3842 検証差分と Findings セクション、Issue #3841
- **タグ**: #traceability #design宣言 #sidecar #case-open機械工程

---
## 配布物本文への concrete REQ-ID 直書きは配布依存境界 最終 gate で新規違反になる

- **問題事象**: 実装 PR が配布物（workflow skill 契約文書・機械工程 script の comment/docstring）に concrete REQ-ID（REQ-032-042 等）を 17 箇所直書きし、case-close 正規形の配布依存_boundary 最終 gate（check_distribution_boundary.ts --profile source）で concrete-id 違反 17 件・exit 1 を検出。case-run 側は別形式 CLI（check_distribution_boundary_cli.ts <worktree>）で violations 0 と申告しており申告と正規形実測が乖離した
- **発生局面**: case-close STEP-3 配布依存境界 最終 gate（Root Case #3841、PR #3843）
- **検知方法**: case-close 正規形 gate の自検証 + main root 対照実行（failures 0）による delta 判定
- **根本原因**: 出典情報の正規保持先が traceability/ 配下 sidecar である規約（distribution-boundary.md「配布物本文の記述規則」）を理解せず、REQ 行と契約文書の対応を示すために本文へ REQ-ID を書いた。既存配布物の直書きは 0 件（placeholder 表記のみ）という慣行を確認しなかった
- **自律対応内容**: 是正 commit 2ac7e59ed で一般化表現へ置換（テキストのみ・挙動不変、pin/describe assertion も整合更新）。case-close は再開条件に正規形 gate failures 0 / delta 0 を要求して差し戻し
- **ユーザー確認の有無**: なし（fail-closed gate の停止と case-run 差し戻しで完結）
- **REQ/Decision/Design影響**: なし（是正は配布物本文の表現のみ）
- **横展開観点**: REQ-ID を伴う実現面記述は配布物本文ではなく sidecar へ宣言する規律が、配布物を編集する全工程（case-open/case-run/case-revise）で適用対象。検証に使う checker CLI 形式が case-run と case-close で分岐している点も注意（正規形は reference 指定のコマンド）
- **再発条件**: 配布物本文に REQ 行への対応を明示したい動機で concrete ID を書いた場合
- **予防策候補**: 配布物編集時の concrete-id 事前自查（正規形 gate の実行）を case-run STEP-S5 の実行形態に明記する価値（learning-promote で評価）
- **想定反映先**: learning-promote による評価・昇華
- **関連**: Issue #3841・PR #3843（是正 commit 2ac7e59ed）・停止記録 comment 6325035485・docs/designs/integrity/distribution-boundary.md（表現是正区分）
- **タグ**: #配布依存境界 #concrete-id #case-close gate #是正

## bun test の cwd 依存で tests/ 配下テストが scripts/ cwd 実行で失敗する

- **問題事象**: traceability_relied_diff 等10件、issue_tracking_list 関連4件のテストは repo root を cwd とした正規形では pass するが、scripts/ ディレクトリを cwd とした実行で失敗する。機械工程 script から部分実行を意図した際に cwd 選択を誤ると非決定的な fail に見える
- **発生局面**: case-run 検証・case-close QG-4 checker 実測（Root Case #3841、PR #3843 検証差分記録）
- **検知方法**: 実行 cwd を変えた bun test の結果比較（正規形 repo root cwd では不発生）
- **根本原因**: テスト内の相対パス解決が repo root cwd を前提とし、cwd 変更で期待パスが崩れる。bun test 実行形態契約（3 cwd 分割実行）は正規形を規定しているが、部分実行時の cwd 選択誤りは検出に素通りする
- **自律対応内容**: 正規形（repo root cwd）での実行を採用し、cwd 依存の挙動として PR 本文 Findings に記録
- **ユーザー確認の有無**: なし
- **REQ/Decision/Design影響**: なし（既存 bun test 実行形態契約どおりの運用）
- **横展開観点**: 機械工程から bun test を部分実行する経路（gate 指定・再実行・個別調査）で成立し得る
- **再発条件**: repo root 以外の cwd で bun test を実行し、その結果を合格証拠として扱った場合
- **予防策候補**: bun test 実行時の cwd を実行記録に必ず付記する（件数突合の根拠と同じ位置）。cwd 依存テストの解消（process.cwd 依存の除去）は学習 promote で要否評価
- **想定反映先**: learning-promote による評価・昇華
- **関連**: PR #3843 本文 Findings・Issue #3841
- **タグ**: #buntest #cwd依存 #実行形態契約 #非決定的

---

## prepare_definition_pr の definitionEdits が行削除・ファイル削除編集を表現できず REQ 行廃止 Case は前段手動適用で機械工程を構成する

- **問題事象**: case-open STEP-4 の機械工程 script（prepare_definition_pr.ts）で、REQ 行の完全削除を伴う docs-chore Case（Root Case #3845、PR #3846）の Definition 編集（REQ-094.md 表行・ADF-COVERS 宣言行の削除、policy.yaml 登録 4 行削除、2 ファイル削除）が DefinitionEdit の行構造事前確認（newText 行数は oldText 行数以上）に抵触し、definitionEdits 入力で表現できなかった
- **発生局面**: case-open STEP-4 機械工程（Root Case #3845、PR #3846）
- **検知方法**: definition-pr-and-idempotency.md の入力契約（行の追加のみ許す事前確認）と prepare_definition_pr.ts validateEditLineStructure の実装照合。script 呼び出し前の入力 JSON 組立段階で契約不整合を確認した
- **根本原因**: DefinitionEdit 契約は行追加型編集のみを機械適用対象とし、行削除・ファイル削除を表現する remove 系操作を持たない（learning deferred の既存エントリ「definitionEdits は既存ファイル置換のみ」〔2026-10-08・2026-10-11 移動〕の系統的制約）
- **自律対応内容**: agentdev-git-worktree 標準手順（type=definition）による worktree 前置作成の後、行削除・ファイル削除編集を node fs（UTF-8 明示）で前段手動適用し、definitionEdits = [] で script を冪等再利用呼び出し（worktree 既存・branch 一致確認経路）に通して generate_indexes → stage → commit → check_integrity → traceability check を機械実行した。前段適用には完全一致・一意の事前確認を組み込み、適用後に 3 パス残留検索 0 件で削除完了を検証した
- **ユーザー確認の有無**: なし
- **REQ/Decision/Design影響**: なし（既存回避構成〔learning deferred で処分済みの前置作成 + 冪等整合確認〕の適用。script 契約の拡張判断は別途 learning-promote で扱う）
- **横展開観点**: REQ 行廃止・移管・ファイル削除を含む docs-chore 系 Definition 変更の case-open 全般。definitionEdits で表現できない編集形態は同構成（前置作成 + 前段適用 + 冪等再利用）に統合できる
- **再発条件**: 行削除（表行削除・宣言行削除・登録行削除）またはファイル削除を含む artifact_action を prepare_definition_pr.ts へ definitionEdits 主体で渡す場合
- **予防策候補**: remove 系編集の入力表現追加、または reference（definition-pr-and-idempotency.md）への廃止 Case の前段手動適用手順明文化
- **想定反映先**: learning-promote による評価・昇華（既存同主題 deferred エントリとの統合再評価）
- **関連**: Root Case #3845・PR #3846・src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts・.agentdev/learning/deferred.md（同主題 deferred エントリ）
- **タグ**: #prepare_definition_pr #DefinitionEdit #行削除 #case-openSTEP4 #docs-chore

---

## learning: bun test フル suite を一発実行（対象指定なし）すると 3 cwd 分割正規形と網羅集合が異なる

- **問題クラス**: workflow deviation（検証実行形態の逸脱の検知・修正）
- **発生局面**: case-close STEP-3 full integrity suite（Root Case #3845、verify-only closure・HEAD d0c257337）
- **検知方法**: case-run の SSoT 検証（bun test 一発実行・1980 pass / 119 files）と QG-4 正規形（3 cwd 分割・`./` prefix 付き明示指定必須・「単一のカレントディレクトリトリビアな実行で代替しない」）の突合で、分割実行合計（4449 pass / 208 files）が一発実行より大幅に多いことを確認
- **根本原因**: bun test 一発実行（cwd: repo root・対象指定なし）のデフォルト走査は、明示指定分割が拾う一部領域（.opencode/skills の repo-* scripts 配下等）を実行対象に含めない
- **自律対応内容**: case-close として正規形（3 cwd 分割・stdout/stderr 分離退避付き）を再実行し、4449 pass / 0 fail / 208 files（対象領域の物理 test ファイル数 116 + 48 + 23 + 21 = 208 と完全突合）で確認した。fail 0 で case-run 実績との矛盾はなし
- **ユーザー確認の有無**: なし
- **REQ/Decision/Design影響**: なし（正規形は agentdev-quality-gates references qg-4-final-acceptance.md「bun test フル suite 正規形（実行形態契約）」の3 cwd 分割として既に確立済み。case-run 側の実行を正規形へ揃えるかは learning-promote で扱う）
- **横展開観点**: bun test を検証に使う全工程（case-run STEP-S5、case-close STEP-3、QG-4 checker 実測）。SSoT コメント等の検証記録を再利用する際、件数突合の対象集合（N/M）が実行形態で変わる点に注意
- **再発条件**: bun test を対象指定なしで実行し、その結果を full integrity suite 合格の証拠として記録・再利用する場合
- **予防策候補**: case-run 側検証の正規形（3 cwd 分割）への統一、または SSoT 検証記録に実行形態（対象指定の有無）の明記を必須化
- **想定反映先**: learning-promote による評価・昇華（case-run / case-close の検証実行形態契約の参照明確化）
- **関連**: Root Case #3845・SSoT コメント 6332228740（検証 10）・agentdev-quality-gates references qg-4-final-acceptance.md
- **タグ**: #bun-test #full-integrity-suite #3cwd分割 #case-closeSTEP3 #件数突合

---

## learning: bun test の件数突合で Windows junction 経由の対象は find が数えられない

- **問題クラス**: 検証証跡の解釈（件数突合の基準実体の選択）
- **発生局面**: case-close STEP-3 full integrity suite の件数突合（Root Case #3845）
- **検知方法**: 分割③（`bun test ./.opencode/plugins/ ./scripts/`）の実行 44 files に対し、find による物理 test ファイル数が .opencode/plugins 0 + scripts 21 = 21 で不一致を検知
- **根本原因**: MSYS find は Windows junction（reparse point）を辿らないため、.opencode/plugins 配下の junction（src/opencode/plugins への鏡像）配下の test ファイルを 0 件として数える。bun は junction を辿って実行する
- **自律対応内容**: junction 解決後の正本パス（src/opencode/plugins）で数え直し 23 files を確認。21 + 23 = 44 で実行 44 files と完全突合できた。件数突合の基準実体は bun の「Ran N tests across M files」の M 値とし、物理突合が必要な場合は junction を解決して数える
- **ユーザー確認の有無**: なし
- **REQ/Decision/Design影響**: なし（link profile の worktree 無効実行性・junction 伝播状態の環境ラベル記録は既存契約どおり維持）
- **横展開観点**: bun test / checker の検査対象数を物理列挙で突合する場合全般。junction・symlink を含む対象領域の列挙は follow しないツールだと過少計上する
- **再発条件**: .opencode/plugins 等の junction 領域を含む対象の test ファイル数を find（follow なし）で数えて突合する場合
- **予防策候補**: 件数突合手順に junction 解決後の正本パスでの数え直し（または bun 実行 M 値基準）の明記
- **想定反映先**: learning-promote による評価・昇華（checker 実行契約・件数突合手順の補足）
- **関連**: Root Case #3845・.opencode/plugins の junction（src/opencode/plugins 鏡像）・qg-4-final-acceptance.md 件数突合条項
- **タグ**: #bun-test #件数突合 #junction #Windows #case-closeSTEP3

---

## learning: target_area append 適用で節本文が欠落したまま節見出しだけが保存され verbatim 包含突合が見出し単位では欠落を検出できない

- **問題クラス**: workflow deviation（Definition 保存の適用漏れと突合精度の不足）
- **発生局面**: case-ready STEP-1 忠実性確認（Root Case #3847、設計PR #3848、worktree HEAD 13cfb2d7・2026-10-24 計測。draft は .agentdev/drafts/req-draft-important-change-prenotification-and-result-explanation.md）
- **検知方法**: case-ready 忠実性確認の draft content → worktree ファイルへの逐語包含突合（REQ 11 行 + 適用範囲 2 行 = 13 件 pass、Design 節全文 6 件 fail）。Design 節の節見出し後の本文行数確認で 6 ファイルすべて nonEmptyLinesInBody=0（本文 0 行）を機械確認
- **根本原因**: case-open 側の artifact_actions（ACT-DESIGN-001〜006、operation: append、target_area「重要変更の通知と結果説明」）適用で節本文の挿入が行われず、節見出し・ADF-COVERS(design) 宣言行・frontmatter updated のみが commit eec6797c5 で追加された。PR 本文は「verbatim 包含突合 19/19 pass」と申告しており、突合の対象選定が節見出し単位では本文欠落を検出できなかった（case-open 側手順・script のどの段で本文挿入が失敗したかは未特定。本学びは case-ready 側からの実観測記録）
- **自律対応内容**: case-ready STEP-1 忠実性確認で必須受け入れ義務の「欠落」を検出し、merge 抑止（検出を warning 化して merge を継続する経路は存在しない契約）。設計PR・draft・RU を保持して ready 遷移せず停止。復帰経路として Definition 側修正（case-open）後の case-ready 再実行（既存 PR 再利用）を要求
- **ユーザー確認の有無**: なし（case-ready スキル契約「必須受け入れ義務の照合と merge 抑止」の機械的適用）
- **REQ/Decision/Design影響**: なし（契約どおりの動作。合意済み REQ 11 行・適用範囲 2 行・design 宣言は正しく保存済みであり、欠落は Design 6 節本文のみ）
- **横展開観点**: target_area 指定の artifact_actions append 適用と「verbatim 包含突合」申告を含む全 Definition Package 生成 Case（case-open / case-revise）で同一構造が成立し得る。突合は節見出しではなく節本文（heading 後の本文行集合）を対象にすべき
- **再発条件**: target_area append 適用で本文挿入が失敗した場合、かつ適用後の突合が節見出しの包含のみを検査した場合
- **予防策候補**: verbatim 包含突合の対象を節本文全体へ拡張（節見出し後の非空行集合の包含検査）。artifact_actions 適用後の行数検証（diff の changed_lines_count と合意 content 行数の一致検査）を draft 保存前・適用後検査へ追加
- **想定反映先**: learning-promote による評価・昇華（case-open 適用後検証の強化候補）
- **関連**: Root Case #3847・設計PR #3848・commit eec6797c5・.agentdev/drafts/req-draft-important-change-prenotification-and-result-explanation.md（ACT-DESIGN-001〜006）
- **タグ**: #case-ready #忠実性確認 #merge抑止 #case-open #verbatim突合 #target_area

---

## learning: worktree 環境の integrity suite のみで fail する検証は main root 同一 tree 再実行と検査対象構成要素比較で環境依存と判別できる

- **問題事象**: worktree（.worktrees/3847-feature、HEAD c3c74e3d3、2026-10-24 計測、bun test 3分割正規形・timeout 600秒指定）で full integrity suite 分割①（`bun test ./.opencode/skills/repo-agentdev-integrity/scripts/`）が 2949 pass / 1 fail（IR-055 runtime-unresolved-reference delta、check_integrity.test.ts:3184）となり、当該変更（src/common/skills/**・traceability/**・pin テスト）起因か環境起因かの判別が必要になった
- **発生局面**: 実装（case-run 実装検証・Root Case #3847。case-close STEP-3 の QG-4 checker 実測で由来分類を引き継ぎ確認）
- **検知方法**: bun test 分割①の fail 1 件の検出。fail テスト名（IR-055 delta）と当該変更対象パスの突合
- **根本原因**: worktree の `.opencode/` 投影は junction 未伝播のため IR-055 検査対象（配布物投影の runtime reference 解決）が成立せず、baseline との delta 検査が不成立になる環境事象。既知欠陥でも当該変更起因でもない
- **自律対応内容**: ①main root（worktree base と同一 tree 01a60604b）で同一 suite（check_integrity.test.ts）を実行し 194 pass / 0 fail を確認、②当該変更の対象パスが fail テストの検査対象構成要素に含まれないことを比較して環境依存と判別。検証弱化にあたる置換は行わず、main root 実行 0 fail を補完証拠として PR 本文検証差分へ記録した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（fail 由来分類の既存規約〔既知欠陥・環境依存・当該変更起因の3分類と evidence 記録〕の適用実績）
- **横展開観点**: worktree で full integrity suite 等を実行する全工程（case-run STEP-S5、case-close STEP-3、QG-4 checker 実測）。fail 出力の由来分類では、main root 同一 tree 再実行と fail テストの検査対象構成要素比較の2点をセットで確認する
- **再発条件**: junction 未伝播の worktree で配布物投影依存テスト（IR-055 等）を含む suite を実行し、fail の由来分類が必要になる場合
- **予防策候補**: 由来判別の再実行条件（main root 同一 suite 0 fail かつ fail テストの検査対象構成要素に当該変更対象パスが含まれないこと）を検証記録の標準様式へ明記
- **想定反映先**: learning-promote による評価・昇華（case-close QG-4 checker 実測・fail 由来分類手順の参照明確化）
- **関連**: Root Case #3847・PR #3849 検証差分セクション「IR-055 delta fail の由来判別」行・docs/designs/integrity/rules 配下 IR-055
- **タグ**: #bun-test #full-integrity-suite #IR-055 #環境依存 #由来分類 #worktree #case-closeSTEP3

---

## learning: 配布物本文への concrete ID 直書きは配布依存境界 checker（source profile）が作成時に有効検知する

- **問題事象**: Design 節本文の REQ ID（REQ-106、REQ-111-008）を引用して phase-artifacts-update SKILL.md（配布物本文）へ書き込んだ実装（Root Case #3847、HEAD c3c74e3d3、2026-10-24 計測）に対し、配布依存境界 checker source profile が concrete-id 違反 2 件を検出した
- **発生局面**: 実装（case-run 実装中の配布物本文編集）
- **検知方法**: `check_distribution_boundary_cli.ts --profile source --json .`（cwd: worktree root、exit=0 へ復帰済み）の違反検出
- **根本原因**: 配布物本文へ正規成果物の concrete ID を直書きすると配布依存境界（配布物が正規成果物 ID へ依存する構造）違反になるが、Design 節を引用する際の自然な書き方が ID 直書きに流れやすい
- **自律対応内容**: REQ ID 直書きを除去した表現へ書き直して再検証合格（source profile、base ベースライン〔scanned 484・violations 0〕と同一の合格状態を確認）。検知機構が作動した実例として作成時予防（委譲 prompt の記述規約引き渡し）と事後検知の両面が機能したことを記録
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（配布依存境界 Design の既存契約どおりの検知）
- **横展開観点**: 配布物本文（src/common/**）へ Design 節や REQ を引用して書き込む全実装。引用時は ID を除去した表現へ書き直す
- **再発条件**: Design 節本文の REQ ID を配布物本文へそのまま転記する場合
- **予防策候補**: 委譲 prompt への記述規約引き渡し（ID 直書き禁止と除去表現の例示）を継続し、違反検出時は表現修正して再検証する運用を明記
- **想定反映先**: learning-promote による評価・昇華（配布依存境界の記述規約に関する参照明確化）
- **関連**: Root Case #3847・PR #3849 検証差分セクション「配布依存境界 checker source profile（最終 gate）」行・src/common/guards/distribution-boundary/
- **タグ**: #配布依存境界 #concrete-id #checker検知 #配布物本文 #case-run

---

## learning: pr_create の入力契約は labels を受け付けず issue_create との契約差異は fail-closed invalid-input で検出できる

- **問題事象**: 設計PR作成時に issue_create と同じ操作引数の組み立てで pr_create へ labels フィールドを渡したところ、invalid-input（unknown-field [labels]）で拒否された（2026-10-25、Root Case #3850 設計PR作成）
- **発生局面**: 定義PR作成（case-open STEP-4 の agentdev_gh pr_create 呼び出し）
- **検知方法**: agentdev_gh の fail-closed 入力検証による invalid-input 応答（kind: invalid-input、detail: unknown-field [labels]: field 'labels' is not part of the pr_create input contract）
- **根本原因**: issue_create（labels は Tool 契約上の必須フィールド）と pr_create（labels は契約外）で、同一 Custom Tool 内の操作ごとに入力契約が異なることを呼び出し側で確認せずに引数を横流しした
- **自律対応内容**: labels を外した入力へ組み替えて再試行し、pr_create を成功させた（PR #3851）。Tool の契約検査が fail-closed に作動したため、誤入力が GitHub 側へ到達しないことを確認した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（Custom Tool 操作契約の既存 fail-closed 動作の確認実績）
- **横展開観点**: agentdev_gh の操作ごとの入力契約を個別に確認する全呼び出し（issue_create、pr_create、comment_create 等）。issue 作成直後の PR 作成で引数の流用が起きやすい
- **再発条件**: issue_create の入力を基に pr_create の入力を組み立てる場合
- **予防策候補**: 操作切替時に Tool 契約の入力フィールド一覧を確認してから入力を組み立てる。PR へのラベル付与が契約外である場合の付与手段は Issue 側へ集約する
- **想定反映先**: learning-promote による評価・昇華（case-open STEP-4 / case-run の PR 作成手順における操作契約確認の参照明確化）
- **関連**: Root Case #3850・設計PR #3851・Custom Tool agentdev_gh pr_create 操作契約（docs/designs/responsibilities/custom-tool-contracts.md）
- **タグ**: #agentdev_gh #pr_create #入力契約 #fail-closed #case-openSTEP4

---

## learning: 機械工程 script の gate spec パス引数は実行 cwd で解決されるため worktree 対象検査の --input は相対パスでは通らない

- **問題事象**: accept_definition_checks.ts（acceptance-checks phase）の overlapGate spec で、検査入力 JSON を main root 基準の相対パス（.agentdev/integrity/reports/...）で渡したところ、gate 実行 cwd が worktree（.worktrees/3850-definition）のため ENOENT で overlap-cross-check が fail した（2026-10-25、Root Case #3850 受入検査。報告 JSON の detail に stderr 原証跡が保存され、入力不備の検出は fail-closed に作動）
- **発生局面**: 設計PR受入検査の機械工程（case-ready STEP-1 の acceptance-checks script 呼び出し）
- **検知方法**: script の報告 JSON overlap-cross-check step detail の stderr（error: cannot read input file ... ENOENT）。終了コード 1
- **根本原因**: spawnSync の cwd が gate spec の cwd（worktree root）で解決されるため、--input 等のパス引数の相対解決基準は gate の cwd であり repo root ではない。呼び出し側が検査入力 JSON を main root 基準の相対パスで渡した
- **自律対応内容**: overlapGate の --input を絶対パスへ修正した入力 JSON で再実行し、4 gate 全 pass（check_integrity pass、overlap warnings=0・detection_unavailable=0、AUTOGEN 再生成差分なし、traceability check missing-design 0 件）を確認
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（gate spec の既知 flag 契約どおりの動作。--input は非空検査のみで解決基準は呼出側責任）
- **横展開観点**: accept_definition_checks.ts、prepare_definition_pr.ts、close_mechanical_steps.ts、inspect_cross_dependencies.ts 等の全機械工程 script で gate spec を構成する呼び出し。gate cwd と input 置き場所（.agentdev/integrity/reports/ は main root 基準）の組み合わせで発生し得る
- **再発条件**: gate 実行 cwd（worktree root 等）と検査入力 JSON の置き場所（main root 基準）が異なる状態で、--input を相対パスで渡す場合
- **予防策候補**: gate spec のパス引数は絶対パスで構成する（または gate cwd からの相対解決を意図したパスに統一する）。報告 JSON の stderr 原証跡による fail-closed 検出を維持する
- **想定反映先**: learning-promote による評価・昇華（機械工程 script 呼び出し手順におけるパス引数構成の参照明確化）
- **関連**: Root Case #3850・src/common/skills/agentdev-workflow-case-ready/scripts/src/accept_definition_checks.ts・scripts/README.md「検査入力 JSON の置き場所指針」
- **タグ**: #機械工程 #acceptance-checks #パス引数 #fail-closed #case-readySTEP1

---

## learning: jev evaluate の observationMetadata.references は sha256 digest 必須であり digest を用意しないなら references を省略する

- **問題事象**: Standard / Epic 確定判断の agentdev_jev evaluate で observationMetadata.references に req_draft のパスのみを指定し sha256 digest を指定しなかったため、観測書込みが warning（input reference digest must be a sha256 hex digest）で失敗し、成功観測の JSON が保存されず最終判断の observation_write も不可になった（2026-10-25、Root Case #3850 STEP-5）。references を省略した後続2件の評価（Wave 構成判断・スコープ重複判定）は観測書込みに成功
- **発生局面**: 実行構造確定の Jev 先行評価（case-ready STEP-5）
- **検知方法**: evaluate 応答の observation.warning（invalid_input: input reference digest must be a sha256 hex digest (64 lowercase hex chars)）。観測 JSON 未保存と observationId 未返却
- **根本原因**: references は label/path/digest の3要素が必須（digest は sha256 hex 64文字）。digest を事前計算していない状態で references を付けた。省略は許容される field であることを確認せずに path だけを渡した
- **自律対応内容**: 再評価・擬似再生成は行わず（観測書込み失敗時は本 STEP の success を維持する契約どおり）、該当判断の最終判断内容と観測未反映を Epic Issue 本文（Root Case #3850 実行構成章）へ記録して完了報告へ warning を明示。後続の2件の評価は references を省略した構成で観測書込みに成功（20261025T085642Z-c4bf、20261025T085659Z-9b75）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（Custom Tool agentdev_jev 操作契約の既存 fail-closed 動作の確認実績）
- **横展開観点**: 6系統 Workflow（case-ready、req-define、learning-promote、intake-promote、inspect-promote、backlog-review）の jev evaluate 呼び出し全般。reconstructable input を参照で保持する構成では digest が必須
- **再発条件**: observationMetadata.references に path を指定しつつ sha256 digest を計算せずに evaluate を呼ぶ場合
- **予防策候補**: references を渡す場合は事前に sha256 digest を計算して3要素を揃える。digest を用意しない判断の場合は references を明示的に省略する（入力は state への閉じ込めで自足させる）
- **想定反映先**: learning-promote による評価・昇華（jev 評価入力構成における references 構成の参照明確化）
- **関連**: Root Case #3850・Custom Tool agentdev_jev evaluate 操作契約（docs/designs/responsibilities/custom-tool-contracts.md「Jev 先行評価」節）・.agentdev/jev-observations/
- **タグ**: #agentdev_jev #観測永続化 #references #fail-closed #case-readySTEP5
