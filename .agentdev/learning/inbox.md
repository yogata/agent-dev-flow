# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## 2026-09-09 bun test は repo root から dot-directory 配下の test を位置フィルタで発見できない

- **発生源**: PR #2717（Issue #2708 / OU-009）テスト結果
- **クラス**: ツール制約（反復的誤実行の予防）

`bun test` を repo root で実行した場合、位置フィルタ指定でも `.opencode/` 等 dot-directory 配下の test file が発見対象にならない。`.opencode/skills/repo-agentdev-integrity/scripts/` の test suite を実行する場合は scripts dir を cwd として起動する必要がある（case-run 3 cwd 分割実行の契約と整合）。

## 2026-09-09 worktree への node_modules 非伝播で integrity suite が環境起因 fail する

- **発生源**: PR #2718（Issue #2706 / OU-007）、PR #2717（Issue #2708 / OU-009）テスト結果
- **クラス**: 環境前提（worktree 構造的制約）

git worktree には root の node_modules が伝播しないため、worktree で integrity suite を実行すると `Cannot find package 'zod'`（extension_state.ts import）等の import 失敗が発生する。加えて junction 未伝播の worktree では IR-055 delta-from-baseline テストが baseline パス変換のずれで未編集ファイルを「新規違反」として検出し fail する（変更ゼロの baseline commit で再現確認済み、main root では不発生）。bun install の安易な実行は tsconfig 系ファイル書き戻しリスク（AGENTS.md 警告規定）を伴うため、worktree でフル suite を実行する際はこの既知の環境依存を前提に結果を解釈する。

## 2026-09-09 Windows/Bun のオフライン配布 bundle は target:node 生成と // @bun バナー除去を固定する

- **発生源**: PR #2729（Issue #2724 / Epic #2723 W1）テスト結果
- **クラス**: 環境前提（配布 bundle 生成条件）

Windows/Bun 環境で配布用の単一 ESM bundle を作る場合、`target: node` で生成し、`// @bun` バナーを除去しないと consumer 側で UTF-8 parse error になる。今後のオフライン bundle 作成時は生成条件（target 指定とバナー除去）を固定し、配布同梱前に consumer 実行系での起動を検証する。

## 2026-09-09 Bun.build は require.resolve をビルド時絶対パスへ展開する

- **発生源**: PR #2730（Issue #2725 / Epic #2723 W2）テスト結果
- **クラス**: 環境前提（配布 bundle 生成条件）

Bun.build は `require.resolve("...")` をビルド時の絶対パス文字列へ展開する。runtime で node_modules を前提としない offline bundle では、(1) 実行時に必要なデータ資産（辞書等）は実ファイルで同梱し、(2) 既定解決がビルド場所を参照するライブラリは公式の上書き経路（環境変数等）で配布物相対へ固定する、という構成が配置場所独立の要件を満たす。ビルド場所の worktree が削除された後は焼き付きパスが解決不能になるため、test や standalone 実行で現れる環境依存 failure は bundle 生成時点のビルド場所依存として解釈する。

## 2026-09-09 textlint kernel は plain object report の severity を構成側で正規化する

- **発生源**: PR #2730（Issue #2725 / Epic #2723 W2）テスト結果
- **クラス**: ライブラリ仕様（検査結果の分類）

textlint kernel では、規則が `report(node, plainObject)`（RuleError 非介在）で severity を省略すると規則構成の `options.severity` に関係なく error 固定になる。拒否対象と助言対象の区別を設定側で所有する場合は、kernel 報告 severity ではなく構成側の拒否対象集合（hardRuleIds 等の限定列挙）で分類する。

## 2026-09-09 worktree の独立 bun プロジェクトは各 package で個別 bun install が必要

- **発生源**: PR #2745（Issue #2735 / Epic #2734 W1）、PR #2749 / PR #2750（Issue #2737 / #2738 / Epic #2734 W3/W4）テスト結果
- **クラス**: 環境前提（worktree 構造的制約）

worktree で integrity suite を実行する場合、textlint plugin 配下に加えて `src/opencode/skills/agentdev-project-extensions/scripts/` など独立 bun プロジェクト（package.json + bun.lock 構成）でも個別に bun install が必要（node_modules 未伝播の構造的制約）。未実施のまま suite を実行すると zod 解決失敗（`Cannot find package 'zod'`）が現れる。W3/W4 でも同様に `.opencode/skills/repo-agentdev-integrity/scripts` と `agentdev-project-extensions/scripts` の両方で bun install が必要であることを再確認済み。bun install 実行後の `git status` はクリーンを維持する（bun.lock 変更なし）。REQ-018（worktree 構造的制約とテスト fallback）関連の補足知見。

## 2026-09-09 対象解決の既定除外は node_modules と歴史記録で加算優先の意味論が異なる

- **発生源**: PR #2745（Issue #2735 / Epic #2734 W1）テスト結果
- **クラス**: ライブラリ仕様（対象解決の意味論）

`**/node_modules/**` を加算設定（additional_targets）で上書き可能にすると glob の `**` 展開が依存配置へ入り込み、TS-004 の node_modules 非含有と矛盾する。TS-004（node_modules 非含有）と TS-005（docs/reports 再包含）の同時成立から「node_modules は加算でも対象外、歴史記録サブツリーは加算優先の再包含対象」の2クラス意味論が一意に確定した。

## 2026-09-09 配布ソースのコメントへの REQ/Design ID 参照は ADF-COVERS 宣言へ集約する

- **発生源**: PR #2745（Issue #2735 / Epic #2734 W1）case-close E4-1 gate 違反
- **クラス**: 規約運用（配布物への concrete-id 混入防止）

実装コメントへの REQ/Design ID 参照は配布物では ADF-COVERS 宣言行以外に書けない（distribution-boundary の concrete-id 検出対象）。契約参照は ADF-COVERS 宣言へ集約し、本文コメントは Design セクション名や「設計契約」等の一般化表現を使うのが配布安全な書き方。

## 2026-09-09 配布手順本文への REQ 行手順化は concrete ID を書かず Design 節名参照へ集約する

- **発生源**: PR #2748（Issue #2743 / Epic #2740 W2）case-run 配布依存境界 gate（初回 concrete_id_hits=12）。PR #2761（Issue #2756 / Epic #2755 W1）でも IR-055 と配布依存境界の両方から検出・修正を再経験（同種知見のため本 entry に発生源追記で集約、新規 entry 不登録）
- **クラス**: 規約運用（配布物への concrete-id 混入防止）

配布物本文へ REQ/DEC の concrete ID（REQ-{NNNN}-{NNN} 形式等）を記載すると配布依存境界 gate が検出する。配布手順へ REQ 行を手順化する際は、本文では concrete ID を書かず Design 節名参照と内容記述へ集約し、正規の ID 参照はファイル先頭の ADF-COVERS 宣言行（IR-059 免除）へ置くのが正規パターン（PR #2748 で 11件を置換して実証済み）。TS-004/TS-005 のような REQ 行 ID を引く検証記述は docs 配下または一時証跡に限定する。
## 2026-09-09 max-kanji-continuous-len 既定 max 6 は技術 corpus で実質誤検出機構になり corpus 実測による option 校正が必要

- **問題事象**: textlint 是正キャンペーン Wave 2 の規則校正実測で、textlint-rule-max-kanji-continuous-len のプリセット既定 max 6 では指摘 1,856 件の大半（約 98%）が「現行成果物体系」「限定的親判断解決」等の正規複合名詞への構造的誤検出であり、実在する読みにくい長連続（11 字以上 37 件相当）を捉えていなかった
- **発生局面**: 実装（Epic 2734 Wave 2 規則校正）
- **検知方法**: gate.ts --json による corpus 全文実測と漢字連続長分布の測定（7〜10 字 1,919 件 / 11 字以上 37 件相当）
- **根本原因**: プリセット既定値（max 6）は汎用 corpus を想定した閾値であり、専門用語・複合名詞の多い技術文書 corpus の実態と合っていない
- **自律対応内容**: 実測分布に基づき option を max 10 へ校正（lib/rules.ts の CALIBRATED_RULE_OPTIONS）。指摘 1,856 件を 33 件へ削減し、残存 33 件（11 字以上の実在する長連続）は助言対象として維持。誤検出を拒否対象へ昇格させず DEC-001 決定4 の 7 条件契約を維持した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（DEC-028 の「実測と誤検出確認で option と severity を設定」の運用に従う実装）
- **横展開観点**: lint 系プリセット規則の既定値は、採用 corpus の実測で妥当性を確認してから使う運用へ横展開できる
- **再発条件**: 新規プリセット規則を corpus 実測なしで既定値のまま採用した場合
- **予防策候補**: 導入工程に corpus 実測による option 校正ステップを組み込む
- **想定反映先**: textlint 品質基盤の運用知見（learning-promote で反映先を判断）
- **関連**: src/opencode/plugins/agentdev-textlint-guard/lib/rules.ts、PR 2747、docs/reports/req-053-textlint-wave2-calibration.md
- **タグ**: `#textlint` `#corpus校正` `#誤検出`
## 2026-09-09 preset-ai-writing の corpus 慣行表記との衝突は規則無効化ではなく disableXxx 系 option の対象調整で解消する

- **問題事象**: preset-ai-writing の no-ai-list-formatting（1,825 件）と no-ai-emphasis-patterns（22 件）の指摘が、本 corpus で確立済みの慣行表記（「- **用語**: 説明」の定義リスト、「**重要**」等の注意喚起太字）への検出であり、規則の無効化も大量是正も過剰対応だった
- **発生局面**: 実装（Epic 2734 Wave 2 規則校正）
- **検知方法**: gate.ts --json の規則別実測と excerpt 内容の誤検出確認
- **根本原因**: プリセット規則は corpus 固有の慣行表記を知らず、機構が提供する disableXxx 系 option（無効化ではなく検出対象の調整）を使わず既定適用すると慣行表記と衝突する
- **自律対応内容**: disableBoldListItems: true（絵文字リスト検出は維持）と disableInfoPatterns: true（絵文字+太字検出は維持）を option 校正として確定。対象調整により指摘 1,825 件を 28 件、22 件を 0 件へ削減し、AI 由来の機械的体裁の検出機能は維持した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: preset-ai-writing を採用する他のプロジェクトでも、corpus 慣行表記との衝突は同系 option の対象調整で解消できる
- **再発条件**: corpus の慣行表記（定義リスト・注意喚起太字等）を調査せずに preset-ai-writing を既定 option のまま適用した場合
- **予防策候補**: プリセット採用時に corpus の慣行表記を確認し、disableXxx 系 option で対象調整する（無効化しない）
- **想定反映先**: textlint 品質基盤の運用知見（learning-promote で反映先を判断）
- **関連**: src/opencode/plugins/agentdev-textlint-guard/lib/rules.ts、PR 2747、docs/reports/req-053-textlint-wave2-calibration.md
- **タグ**: `#textlint` `#preset-ai-writing` `#corpus校正`

## 2026-09-10 Windows の integrity suite フル実行では 5 秒 spawn timeout 由来の環境 fail が出現し、単独再実行と timeout 延長で由来分類する

- **問題事象**: textlint 是正キャンペーン Wave 3/4 の integrity suite フル実行で、IR-055 baseline-known 閾値テストと NG21 N17 テストが `timed out after 5000ms` で fail した（check_integrity.ts のサブプロセス実行が Windows 環境で 5 秒を超える）。フル実行の回数によって出現が変動する
- **発生局面**: 検証（Epic 2734 Wave 3/4 境界 case-close の QG-4 bun test フル suite）
- **検知方法**: bun test の fail 出力への `this test timed out after 5000ms` 明示と実行時間（5 秒前後）・JSON Parse error: Unexpected EOF（kill されたサブプロセスの stdout 途切れ）の確認
- **根本原因**: テストが check_integrity スクリプト全体をサブプロセスで実行する設計に対し、bun test 既定の 5 秒 timeout が Windows の spawn コストで不足する
- **自律対応内容**: 修正せず、`--timeout 120000` を付けた単独再実行で 2 件とも pass を確認し環境由来と分類した。fail 由来分類は QG-4 記録へ記載
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: サブプロセス spawn を伴うテストのフル suite fail は、タイムアウト延長の単独再実行で由来分類してから修正判断する（Wave2 から継続の既知パターン）
- **再発条件**: Windows 環境でフル suite を並行実行・高負荷時に実行した場合
- **予防策候補**: サブプロセス実行テストへの timeout 延長設定、またはフル suite 実行手順への単独再実行由来分類の明記
- **想定反映先**: integrity suite 実行手順の運用知見（learning-promote で反映先を判断）
- **関連**: .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.test.ts、PR 2749、PR 2750
- **タグ**: `#integrity-suite` `#spawn-timeout` `#Windows`

## 2026-09-10 実行記録本文に ADF-COVERS マーカー形状の言及を書くと traceability check が malformed-declaration を検出する

- **問題事象**: docs/reports/ の実行記録本文へ ADF-COVERS(implementation) マーカー形状を「言及」として書くと、traceability check が宣言形式として解釈し malformed-declaration を検出した
- **発生局面**: 実装（Epic 2734 Wave 4 実行記録作成時の traceability 検証）
- **検知方法**: traceability check の初回実行での malformed-declaration 検出
- **根本原因**: マーカー形状は文字列一致で検出されるため、本文中の言及と実際の宣言が区別されない
- **自律対応内容**: レポート本文では「実装対応宣言（implementation ロール）」等の形状を含まない表現へ置換し、宣言は frontmatter の covers に集約した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: 機械検出されるマーカー・ID 形状を本文で説明する際は、形状を含まない言い換えを使う
- **再発条件**: 検証記録・ガイド文書で ADF-COVERS 形状を例示した場合
- **予防策候補**: ADF-COVERS 形状の言及は frontmatter 宣言または docs 配下の説明文書に限定する
- **想定反映先**: トレーサビリティ運用知見（learning-promote で反映先を判断）
- **関連**: PR 2750、docs/reports/req-053-textlint-wave4-src-correction.md
- **タグ**: `#traceability` `#ADF-COVERS` `#実行記録`

## 2026-09-10 規則構成ハッシュの再計算手順は prh options.rulePaths の絶対パスで環境依存になる

- **問題事象**: Wave 2 規則構成ハッシュの再計算手順テキスト（req-053-textlint-wave2-calibration.md 第 4.1 節）のまま実行したところ、再現結果が Wave 2 記録値と一致しなかった
- **発生局面**: 実装（Epic 2734 Wave 4 検証）
- **検知方法**: 手順どおりの再計算結果と Wave 2 記録値の突合
- **根本原因**: prh 規則 options.rulePaths が engine 起動環境の plugin dir 絶対パスを含み、canonical JSON(options) に環境依存値が混在する（原因候補として記録）
- **自律対応内容**: 修正せず Wave 5（TS-001 突合）への引き継ぎ事項として実行記録へ記録。Wave 5 は突合前に Wave 2 の計算実装で手順の実装詳細（環境依存値の正規化要否）を確認する
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: 関連 Design確定候補（計算手順の環境非依存化）は Wave3/4 境界 case-close で「Wave5 close まで見送り」判断済み。Wave5 で Design 更新検討
- **横展開観点**: ハッシュ計算に環境パスが混入する構成要素は、正規化規則を明記しないと再現性が失われる
- **再発条件**: 異なる clone 先パスでハッシュ再計算を実行した場合
- **予防策候補**: canonical JSON 対象から環境依存パスを除外または相対化する正規化規則の Design 明記
- **想定反映先**: textlint 品質基盤 Design（docs/designs/quality/textlint-quality-runtime.md）の規則校正と移行検証節（Wave5 で検討）
- **関連**: docs/reports/req-053-textlint-wave2-calibration.md、docs/reports/req-053-textlint-wave4-src-correction.md、PR 2750
- **タグ**: `#textlint` `#規則構成ハッシュ` `#再現性`

## 2026-09-10 prh rulePaths 正規化手順が確定し環境非依存ハッシュで突合可能になった（上記エントリの解決）

- **問題事象**: 上記「規則構成ハッシュの再計算手順は prh options.rulePaths の絶対パスで環境依存になる」の根本原因が Wave 5 で確定し、正規化手順が確立した
- **発生局面**: 検証（Epic 2734 Wave 5 最終検証、TS-001 突合）
- **検知方法**: worktree 実位置と Wave2 計算時相当仮想位置の両方で生 hash を再計算し、同一規則構成から配置位置だけで hash が変動することを実証（実行記録 req-053-textlint-wave5-final-verification.md 第 2.1 節）
- **根本原因**: composeRuleDescriptors が実行環境の plugin dir 絶対パスを prh options.rulePaths に混在させるため、canonical JSON(options) を生のまま hash 化すると clone 配置位置依存の値になる（Wave4 の「原因候補」から確定）
- **自律対応内容**: rulePaths を plugin dir 相対（標準辞書）/ プロジェクトルート相対（用語辞書）へ正規化し / 区切り・辞書順ソートを施す手順を確定（同記録第 2.2 節）。正規化後 hash は両構成で同一値となり環境非依存を確認。textlint 品質基盤 Design「規則校正と移行検証」節へ正規手順として追記（Wave5 close、PR 2751 後の capture commit）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: Design 追記適用（REQ-053-037 の規則固定突合手順の規範化）。Wave2 記録第 4.1 節は歴史記録のため未修正
- **横展開観点**: ハッシュ計算に環境パスが混入する構成要素は、正規化規則を明記しないと再現性が失われる
- **再発条件**: 異なる clone 先パスでハッシュ再計算を実行した場合
- **予防策候補**: canonical JSON 対象から環境依存パスを除外または相対化する正規化規則の Design 明記（実施済み）
- **想定反映先**: textlint 品質基盤 Design（反映済み）
- **関連**: docs/reports/req-053-textlint-wave5-final-verification.md、docs/designs/quality/textlint-quality-runtime.md、PR 2751
- **タグ**: `#textlint` `#規則構成ハッシュ` `#再現性` `#解決`

## 2026-09-10 配布テンプレート本文には ADF-COVERS 宣言を付与できず対応宣言は親 SKILL.md 側へ集約する

- **問題事象**: pr_desc.md へ ADF-COVERS 宣言を付与したところ、配布物内部 ID 契約テスト（execution_ident_contract / verification_diff_contract）が「配布物内部 ID（REQ-XXXX 数字つき）を含まない」契約違反 2 件を検出した
- **発生局面**: 実装（Epic 2752 Wave 1、PR 2760 のテンプレート変更時 integrity suite）
- **検知方法**: integrity suite 分割① の fail 検出
- **根本原因**: 配布テンプレートの構造様式契約テストが配布物内部 ID の混入を禁止しており、テンプレート本文への対応宣言（数字つき REQ ID）付与と衝突する
- **自律対応内容**: pr_desc.md 側の宣言を削除し、対応宣言を親 SKILL.md 側へ集約して再検証合格
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: テンプレート変更を伴う実装 PR では対応宣言の配置先を事前に SKILL.md 側へ寄せる
- **再発条件**: templates/*.md 本体に ADF-COVERS 宣言（数字つき REQ ID）を付与した場合
- **予防策候補**: 配布テンプレート本文への対応宣言付与は禁止し、親 SKILL.md へ集約する運用を明文化
- **想定反映先**: workflow-templates の運用知見（learning-promote で反映先を判断）
- **関連**: PR 2760、src/opencode/skills/agentdev-workflow-templates/templates/pr_desc.md
- **タグ**: `#配布物` `#ADF-COVERS` `#テンプレート`

## 2026-09-10 配布物側 reference への新規行には本体内部 ID 参照・docs/designs/ パス参照・括弧付き宣言表記を書けない

- **問題事象**: docs-and-design-promotion.md の新規行に docs/designs/ パス参照と棚卸し列挙手順の括弧付き宣言表記を書いたところ、IR-055 delta guard（docs/designs/ 参照 4 行）と配布依存境界 concrete-id で fail した
- **発生局面**: 実装（Epic 2752 Wave 1、PR 2760）
- **検知方法**: IR-055 delta guard と配布依存境界 gate の初回実行
- **根本原因**: 配布物側 reference の本体内部 ID 参照・docs/designs/ パス参照・括弧付き宣言表記は、配布境界契約（concrete-id / runtime-unresolved-reference）と宣言パーサの文字列一致に抵触する
- **自律対応内容**: 「Design 一覧表」「正規 Design 文書」等の一般名詞化と「ADF-COVERS 宣言（implementation 役割）」表記へ変更して再検証合格
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: 保存済み Design を配布物へ実装反映する際は、Design 原本のパス・ID 参照を配布物側では一般名詞化する変換が必要
- **再発条件**: 配布物側 reference に docs/designs/ パス、REQ-NNNN-NNN、DEC-NNN、IR-NNN、括弧付き宣言表記を書いた場合
- **予防策候補**: 配布物への実装反映直後にチェック系（配布依存境界・IR-055・traceability check）を実行する
- **想定反映先**: 配布物実装反映の運用知見（learning-promote で反映先を判断）
- **関連**: PR 2760、src/opencode/skills/agentdev-workflow-case-close/references/docs-and-design-promotion.md
- **タグ**: `#配布物` `#IR-055` `#配布依存境界`

## 2026-09-10 worktree checkout 直後の integrity suite 実行は zod 依存未導入で error になり bun install 前置が必須工程

- **問題事象**: worktree checkout 直後の integrity suite 実行で、agentdev-project-extensions/scripts の zod 依存が未導入により check_extensions.test.ts 等が error になった
- **発生局面**: 検証（Epic 2752 Wave 1、PR 2760 の worktree での bun test 実行）
- **検知方法**: bun test の error 出力
- **根本原因**: worktree はメインリポジトリの node_modules を共有せず、依存パッケージの前置（bun install）が未実施のまま suite を実行した
- **自律対応内容**: bun install を前置して再実行し解消
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: bun test 実行形態契約の「依存パッケージ前置」は worktree 環境でも必須工程である
- **再発条件**: worktree checkout 直後に bun install せず bun test を実行した場合
- **予防策候補**: worktree 検証手順の前置ステップとして bun install を明記
- **想定反映先**: worktree 検証手順・QG-4 bun test 実行形態契約の運用知見（learning-promote で反映先を判断）
- **関連**: PR 2760、.worktrees/2753-feature
- **タグ**: `#worktree` `#bun-test` `#依存前置`

## 2026-09-10 配布物への実装反映ではチェック系 3 点を変更直後に実行すると新規違反をコミット前に確実に検出できる

- **問題事象**: 配布物への実装反映直後の初回機械検査で、本変更行に IR-055 heuristic 2 件、配布依存境界 concrete-id/unclassified-entry 8 件、トレーサビリティ宣言パーサ malformed 3 件の計 13 件の新規違反が検出された
- **発生局面**: 実装（Epic 2752 Wave 1、PR 2759）
- **検知方法**: 変更直後の機械検査（check_distribution_boundary / check_integrity / traceability check）の実行
- **根本原因**: 配布物への実装反映では ID 参照・パス参照・宣言表記が機械契約と衝突しやすい構造になっている
- **自律対応内容**: 初回検出 13 件をすべて fix-and-reverify で解消（ID 参照の概念語化、括弧付き宣言表記の括弧なし化）し、base 水準の既出 6 件のみを残して完了
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: チェック系 3 点を変更直後に実行すると新規違反をコミット前に確実に検出できる
- **再発条件**: 配布物変更をコミット・マージ後に検査した場合（発見が遅延する）
- **予防策候補**: 配布物変更の手順に「変更直後のチェック系 3 点実行」を組み込む
- **想定反映先**: 配布物実装反映の運用知見（learning-promote で反映先を判断）
- **関連**: PR 2759、src/opencode/skills/agentdev-doc-diagnostics/references/diagnostic-categories.md
- **タグ**: `#配布物` `#機械検査` `#fix-and-reverify`
