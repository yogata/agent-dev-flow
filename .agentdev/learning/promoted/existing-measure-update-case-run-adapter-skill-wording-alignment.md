# existing-measure-update-case-run-adapter-skill-wording-alignment

## 背景

Case #3928（Epic #3928 verification-resource-lifecycle 実現）の Wave-6（Issue #3946・PR #3947 close）において、検証用一時資材の作成先境界の Design 変更（case-dedicated-area basis 廃止・案件番号非根拠化・プロジェクト内正規一時領域への統一）が実施された。この実装境界の変更が、同一境界を参照する配布 SKILL 契約行（case-run 実行担当サブエージェント委譲先の agentdev-case-run-execution-adapter SKILL.md）へ追随されておらず、旧文言のまま残存した。委譲先の実行担当が SKILL 契約行の作成先文言に従って作成先を決定した場合、Design 正本の現行基準（作成ヘルパーの機械検査）と乖離した作成先を選択する事故の起点になり得る。

## 問題

実装境界（作成先の機械拒否基準）を変更した Case が、同一境界を参照する配布 SKILL 契約行の文言整合を対象変更ファイル一覧に含めておらず、SKILL.md の作成先文言が修正前境界のまま残存している。

- 現行 SKILL.md（src/common/skills/agentdev-case-run-execution-adapter/SKILL.md・検証用一時資材の作成報告節・L94）: 「作成先確認の制約（作成ヘルパーの機械検査に接続）により、**パス形の作成先は環境指定TEMPまたは案件専用領域（案件識別子をパス要素に含むrepo外ディレクトリ）に限られる**」（2026-11-07 grep 実測・修正前文言現存）
- Design 正本（docs/designs/workflows/verification-resource-lifecycle.md・受入未達節 L50①・作成入口の作成先拒否の接続確認節 L51）: 「作成先は**環境指定TEMPまたはプロジェクト内正規一時領域（repo root の .agentdev/tmp/）**のみ許可し…**パス要素に案件番号が含まれることは許可根拠にしない**」（2026-11-07 grep 実測・修正後文言）

両者の不整合により、委譲内での作成先決定時に SKILL 文言（旧境界・case-dedicated-area 相当）に従うと、作成ヘルパーの機械検査（新基準）で作成先違反として機械拒否される。実害は未発現（該当文言を根拠にした作成先決定の事故は観測されていない）だが、作成入口の確認報告が旧文言に従う事故の起点になり得る状態が残存している。

## 望ましい変更

agentdev-case-run-execution-adapter SKILL.md の検証用一時資材の作成報告節（L94）の作成先文言を、Design 正本（verification-resource-lifecycle.md）の修正後境界へ追随させる。

- 「パス形の作成先は環境指定TEMPまたは案件専用領域（案件識別子をパス要素に含むrepo外ディレクトリ）に限られる」→「パス形の作成先は環境指定TEMPまたはプロジェクト内正規一時領域（repo root の .agentdev/tmp/・REQ-018-008(b) 契約）に限られ、パス要素に案件番号が含まれることは許可根拠にしない」相当の文言へ統一
- 同節の「案件スコープの専用領域へ作成し」の表現も、台帳登録経路（verification-resource-lifecycle.md 台帳（生成記録）節）との整合で現行化を検討（Design L43 の配置節文言と SKILL 側の整合は req-define 変更影響分析で判断する）

## 対象範囲

### 対象

- src/common/skills/agentdev-case-run-execution-adapter/SKILL.md（検証用一時資材の作成報告節・L94 の作成先文言）
- （文言整合の検討時）同 SKILL.md 内の関連表現（案件スコープの専用領域・案件識別子等の旧境界由来語）

### 対象外

- verification-resource-lifecycle.md（Design 正本・PR #3947 で文言整合済み・本件の正本であり変更不要）
- verification-resources-ledger.ts 等の実装（修正後境界で実装済み・merge 済み）
- 他配布 skill の同系文言（本 SKILL.md の文言のみが旧文言現存を実測確認済み・横断棚卸しは req-define 変更影響分析で判断する）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill | src/common/skills/agentdev-case-run-execution-adapter/SKILL.md | L94 の作成先文言を修正後境界へ追随（旧文言の置換） |

## 既存対策確認

- **確認結果**: 対策あり（部分的）
- **該当ファイル**: docs/designs/workflows/verification-resource-lifecycle.md（修正後境界の Design 正本・PR #3947 で文言整合済み）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 同一境界を参照する配布 SKILL 契約行（case-run-execution-adapter SKILL.md L94）の文言追随漏れ。実装境界変更を伴う Case（Wave-6 #3946）で SKILL.md が対象変更ファイル一覧外だったため未修正のまま残存（PR #3947 本文 Findings に不整合を記録・SKILL.md が対象外のため未修正のまま終了）。実測: SKILL.md 全文中、作成先境界文言は L94 のみで別節での追随修正なし（2026-11-07 grep 実測）

## 制約

- Design 正本（verification-resource-lifecycle.md）が正であり、SKILL 側を正本に合わせる方向で是正する（PR #3947 で実装・Design 側は merge 済み）
- 作成先境界の現行正規文言は「プロジェクト内正規一時領域（repo root の .agentdev/tmp/・REQ-018-008(b) 契約）」であり、worktree root 相対の .agentdev/tmp/ は本判定では invalid になる（REQ-018-008(b) 文言と実装 mainRepoRoot 基準の解釈差は別 learning 項目（deferred Q34）として追跡中）
- 文言修正は SKILL 契約行の変更であり、委譲先実行担当の作成先決定に直接影響するため、台帳登録経路（verification-resource-lifecycle.md 台帳（生成記録）節・作成入口の作成先拒否）との接続文言を含めて整合させる

## 受け入れ条件

- [ ] agentdev-case-run-execution-adapter SKILL.md の作成先文言が、verification-resource-lifecycle.md の修正後境界（環境指定TEMPまたはプロジェクト内正規一時領域〔repo root の .agentdev/tmp/〕・案件番号非根拠）と整合していること
- [ ] 修正後の SKILL.md において、旧文言（案件専用領域・案件識別子をパス要素に含む repo 外ディレクトリ）が grep で 0 件になること
- [ ] SKILL 契約行と作成ヘルパー（verification-resources-ledger.ts evaluateCreationDestination）の機械検査基準の文言整合を、検証差分に記録すること

## 元learning item / 根拠

- **要約**: 実装境界の変更（case-dedicated-area basis 廃止）に伴う配布 SKILL 契約行の作成先文言追随漏れの是正（既存対策 Design 正本との文言整合）
- **根拠**: Case #3928 Wave-6 #3946 close（PR #3947）の Findings で不整合を記録・SKILL.md が対象変更ファイル一覧外のため未修正のまま。learning-promote（2026-11-07）で SKILL.md L94 旧文言現存（grep 実測）・Design 正本 L50①/L51 修正後文言実在（grep 実測）・SKILL 内追随修正なし・並行ライン修正なし（intake-promote commit 121521f9d は SKILL.md 未変更・git show 実測）・intake items による所有なし（promoted 4 件実測）を確認し、STEP-4 adversarial-review Stream A で PROMOTE_OK 判定（gap 現存・stale なし・二重処置なし・8軸妥当圏内）を取得
- **再発条件**: 実装境界の変更を伴う Case で、同一境界を参照する SKILL 契約行が対象変更ファイル一覧に含まれない場合
- **横展開可能性**: 実装境界の変更（basis 値の置換・判定根拠の削除）を伴う Case では、同一境界を参照する SKILL 契約行の文言追随漏れが他の skill・reference でも起こり得る（文言整合の対象一覧化・Findings 記録の徹底を防ぐ観点）

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: docs, wording-alignment
- **関連Issue**: Case #3928・Wave-6 #3946・PR #3947（本件不整合の記録元）
