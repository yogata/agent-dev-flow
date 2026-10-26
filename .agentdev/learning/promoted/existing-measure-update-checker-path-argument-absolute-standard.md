# checker-path-argument-absolute-standard

## 背景

2026-10-25 に 2 件の連続した機械工程・checker 実行障害が発生した。accept_definition_checks.ts の overlapGate spec で検査入力 JSON を main root 基準の相対パス（.agentdev/integrity/reports/...）で渡したところ、gate 実行 cwd が worktree のため ENOENT で overlap-cross-check が fail（Root Case #3850）。また traceability check の --root に相対パスを渡すと checker 起動 cwd（scripts ディレクトリ）基準で解決され、実在要件行が unknown-req-refs として多量検出された（Case #3841）。同種の現象は 2026-10-13 にも deferred（--root . 相対指定で全 REQ 対応欠落誤判定）として記録済みで、本件は 3 回目の出現である。

## 問題

checker・機械工程 script のパス引数の相対解決基点は「実行 cwd」であり repo root ではない。既存の絶対パス標準規定（checker 実行契約 Design の worktree を検査対象とする checker の起動契約）は worktree 検査 checker の --root に限定されており、次の領域は恒久規定の一般化対象外になっている。

- 機械工程 script（accept_definition_checks.ts、prepare_definition_pr.ts、close_mechanical_steps.ts 等）の gate spec が受理するパス引数（--input 等）。spawnSync の cwd は gate spec の cwd（worktree root 等）で解決されるため、呼出側が main root 基準の相対パスで構成すると gate cwd 基準で解決され破綻する
- main root を検査対象とする checker（traceability check 等）の --root。scripts 配下から起動すると起動 cwd 基準で解決される

実測（2026-10-27 learning-promote）: docs/designs/integrity/checker-execution-contracts.md の「絶対パス」規定は L198-201（worktree 検査 checker の --root）のみであり、gate spec パス引数への一般化規定は不在。definition-pr-and-idempotency.md L47 のパス引数検査は「非空」のみ。accept_definition_checks.ts L158-169 はパス区切り・スクリプト拡張子をもつ要素を gate cwd 基準（path.resolve(spec.cwd, candidate)）で解決する。

## 望ましい変更

checker・機械工程 script のパス引数（--root、--input 等）は絶対パスで構成する、または gate spec の cwd からの相対解決を意図したパスであることを明示する、という標準を、worktree 検査 checker の --root に限定せず機械工程 gate spec のパス引数全般へ一般化する。あわせて、checker 実行記録（検証差分・証跡）には root 等のパス引数の解決先（実測絶対パス）を明記する規律を置く。実現形態（契約文追記か、機械工程 script README の手順規定か）は req-define の変更影響分析が確定する。

## 対象範囲

### 対象

- docs/designs/integrity/checker-execution-contracts.md（絶対パス標準規定の一般化候補）
- 機械工程 script の gate spec パス引数構成手順（accept_definition_checks.ts、prepare_definition_pr.ts、close_mechanical_steps.ts を参照する workflow skill references）

### 対象外

- script 実装の変更（gate spec の --input は非空検査のみで解決基準は呼出側責任という現行 flag 契約の変更）
- 既存 gate の失敗分類・fail-closed 挙動

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| Design | docs/designs/integrity/checker-execution-contracts.md | 「絶対パスを --root で指定」規定（L198-201）のパス引数全般への一般化、検査入力 JSON 等の相対解決基点の明示 |
| Design | docs/designs/integrity/targeted-docs-guard-implementation.md | 同系の --root 指定規律（L38 相当）への一般化追記候補 |
| 配布skill | src/common/skills/agentdev-workflow-case-ready/（acceptance-checks 手順）、agentdev-workflow-case-open / case-close の機械工程手順 | gate spec のパス引数は絶対パスで構成する前置規律 |

## 既存対策確認

- **確認結果**: 既存対策あり（部分的）
- **該当ファイル**: docs/designs/integrity/checker-execution-contracts.md（L198-201）
- **ギャップ分類**: guardrail insufficiency
- **ギャップ詳細**: 絶対パス標準は「worktree を検査対象とする checker の --root」に限定され、機械工程 gate spec のパス引数（--input 等）と main root 対象 checker への一般化が明示されていない。3 回の出現（deferred.md L4476〔2026-10-13 --root 相対〕、E34〔2026-10-25 --input 相対で ENOENT〕、E39〔2026-10-27 前後 --root 相対〕）で同一構造の適用漏れが実証済み

## 制約

- gate spec の --input は「非空検査のみ・解決基準は呼出側責任」という現行 flag 契約を変更しない（E34 の対応でも契約変更なしと判断されている）
- 報告 JSON の stderr 原証跡による fail-closed 検出は維持する
- 知識文書 windows-checker-msys-path-argument.md（MSYS 形式パス）・windows-checker-observation-discipline.md（--root 絶対パス規律）は既存であり、本件は gate spec パス引数への一般化のみを対象とする

## 受け入れ条件

- [ ] checker・機械工程 script のパス引数（--root、--input 等）の解決基点と絶対パス標準の適用範囲が恒久契約で明文化されている
- [ ] 検証記録・checker 実行記録にパス引数の解決先（実測絶対パス）の明記規律が定義されている
- [ ] 3 回の出現事例（deferred.md L4476、E34、E39）の再発条件が恒久規定で防止されていることを機械検査または手順検査で確認できる

## 元learning item / 根拠

- **要約**: 機械工程・checker のパス引数は実行 cwd で解決されるため相対パス指定は破綻する。絶対パス標準規定の一般化（3 回出現）
- **根拠**: E34（gate spec --input 相対パス ENOENT・Root Case #3850、報告 JSON の stderr 原証跡で fail-closed 検出・絶対パス修正で 4 gate 全 pass）、E39（traceability check --root 相対指定で unknown-req-refs 多量検出・絶対パスで解消）、deferred L4476（2026-10-13 --root . 相対指定で全 REQ 対応欠落誤判定）。checker-execution-contracts.md L198-201 が唯一の絶対パス規定であること、accept_definition_checks.ts L158-169 が gate cwd 基準解決であることを実測
- **再発条件**: gate 実行 cwd（worktree root 等）と検査入力の置き場所（main root 基準）が異なる状態で --input 等を相対パスで渡した場合。scripts 配下を cwd に checker を相対 --root 指定で実行した場合
- **横展開可能性**: --root 引数を持つ全 checker（check_autogen_freshness、generate_indexes、check_changed_docs、check_knowledge_docs 等）と機械工程 gate spec 構成全般に適用可能

## 推奨Issue分類

- **分類**: refactor
- **推奨ラベル**: documentation, guardrail
- **関連Issue**: なし
