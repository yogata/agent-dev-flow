Parent: #3280

## 実行識別情報

- adf_case: #3278（Root Case）／ Epic #3280 Wave 2-2
- adf_execution_unit: standard
- adf_delegation: DEL-3283-1
- adf_harness_ref: N/A
- 対象 Issue: #3283

## 概要

RA-001「12ワークフローと品質ゲートの判断規則ブロックの新モデル適用」と RA-005「Workflow Skill の Jev 適用判断記述の参照整理」を実装した。

### RA-001（判断方法3分類・確定権限3分類・原因別処理への書換）

- promote 系（intake-promote、learning-promote、inspect-promote）の自律確定語彙を「一意性ベース」から「正規契約からの導出または委譲された裁量の範囲で確定できるか」（REQ-096-018 相当）へ書換。判定基準参照を横断契約 Design「HITL 判断確定原則」節（人間判断への引き上げ条件）へ整合
- case-ready: Decision 受理評価を「正規契約からの導出 / 人間判断への引き上げ条件該当時のみユーザー判断」へ書換。Definition 受入 3検査（忠実性・整合性・品質）に判断方法・確定権限の帰属を明示
- case-close: QG-4 完了判定に REQ-096-017 相当の帰属明示（既存完了条件・証拠からの導出として自律確定）。docs 検証・extensions 検査・配布依存境界検査の違反時処置を原因別処理（証拠再取得・正規所有工程への差し戻し・引き上げ条件該当時のみユーザー判断）へ書換
- case-auto: 停止理由分類（上位合意矛盾・新規ユーザー判断事項）と bounded parent decision resolution の 4分類表に確定権限（正規契約からの導出／委譲された裁量）と人間判断への引き上げ条件（REQ-096-005 相当）を明示
- quality-gates: fail/partial の後続アクションを原因別処理へ書換（不合格という理由だけでの人間判断送りを除去）。「自動修正禁止」を「修正の所有境界」（Gate は判定・原因分類を所有、修正は正規所有工程）へ再定義。SKILL.md 責務境界に判断方法・確定権限の帰属を明示
- backlog-review: 矛盾検出を正規情報源間の未解決規範矛盾（人間判断へ移行）として明示。統合・分割判定に REQ-096-020 相当の確定権限区分（委譲された裁量 vs 人間判断）を明示

### RA-005（Jev 適用判断節の参照整理）

- 6系統 Workflow Skill（req-define、case-ready、intake-promote、learning-promote、inspect-promote、backlog-review）の Jev 適用判断節に残存していた閉じた意味評価の適格条件（旧閉包条件）の直接列挙（12箇所）を、REQ-096 + `<foundations/v4-responsibility-boundaries>` Design「閉じた意味評価の閉包条件」節の正典参照へ整理
- 全件監査節の「適格条件」参照も「閉包条件（REQ-096）」へ統一。観測契約本文（custom-tool-contracts Design）は変更していない

### トレーサビリティ

- skills 変更の対応宣言を traceability/ 配下 sidecar 9件へ登録（REQ-096 の実現面対応。配布物本文への concrete ID 直書きは配布依存境界 checker に従い REQ-{NNNN} プレースホルダ形式で維持）

### adversarial-review 非発動記録

- 発動契約: Issue 本文「adversarial-review 発動契約（任意）: 該当なし（ユーザー明示指定なし）」に従い非発動とした
- 代替自己反証（却下案・緩和策・unresolved なしの確認）: (1) 却下案「promote 系の自律確定語彙を REQ-096-018 相当へ変更せず REQ 更新（#3282 側）のみに留める」— skills 側の局所判断規則が旧モデル語彙を正規契約として維持し続けるため REQ-096-023 相当（新旧モデルの同時正規化残存除去）に反するため却下。(2) 緩和策「quality-gates の warn→ユーザー判断を残す」— warn 処置は原因分類前提の委譲判断であり、不合格→人間判断の直結規則ではないため現行の原因別処理書換で十分。(3) unresolved な本質的争点・ユーザー判断事項の残存なし（blocked 判断事項なし）

## 検証差分

| 実行工程 | 検証種別 | 検証結果 | finding 差分 |
|---|---|---|---|
| case-run | TS-001（判断方法3分類の帰属判別。自スコープスライス） | pass — promote 系 6系統は Jev 判断単位表、case-ready は definition-acceptance 3検査の帰属明示 + decision-acceptance、case-close は QG-4 判定帰属明示、case-auto は bounded parent decision resolution 4分類の確定権限明示、quality-gates は SKILL.md 責務境界の帰属明示、case-run は機械受理基準（既存）、case-revise は意味判断非所有（既存）、case-open は投影責務（既存） | 新規 0 / 修正済み 0 |
| case-run | TS-002（確定権限3分類判定表突合。自スコープスライス） | pass — case-ready Decision 受理（導出/人間判断）、Definition 受入 3検査（導出）、case-close QG-4（導出）、case-auto 4分類（導出/裁量/人間判断）、promote 系自律確定（導出/裁量）、backlog-review 統合・分割（裁量/人間判断）、quality-gates 判定（導出） | 新規 0 / 修正済み 0 |
| case-run | TS-003 スライス（状態のみを理由とする人間判断要求規則の残存検出） | pass — 検出箇所は REQ-096 禁じ手の明示と決定的カテゴリ名称のみ。人間判断要求規則 0件 | 新規 0 / 修正済み 0 |
| case-run | TS-004 スライス（引き上げ条件正典参照整合・旧 REQ-003-055 委任参照 0件） | pass — 参照は REQ-096 + v4-responsibility-boundaries Design「人間判断への引き上げ条件」節に整合 | 新規 0 / 修正済み 0 |
| case-run | TS-007（Jev 適用判断節の閉包条件 REQ-096 参照化・評価器固有形式からの独立） | pass — 6系統 12箇所の閉包条件参照が REQ-096 + Design 正典節へ整理済み。閉包条件への確信度・確率形式の混入 0件 | 新規 0 / 修正済み 0 |
| case-run | TS-008（Jev 恒久原則言及の検出） | pass — 恒久的な最終確定原則としての Jev 言及 0件。6系統 Jev 節は Stage 1 観測契約の位置づけを維持 | 新規 0 / 修正済み 0 |
| case-run | TS-011（品質ゲートの所有範囲） | pass — 判定・原因分類に限定。不合格→人間判断の直結規則 0件（common-gate-contract、qg-1、qg-3、qg-4、SKILL.md を修正） | 新規 0 / 修正済み 0 |
| case-run | TS-012 スライス（case-run 裁量範囲と対象範囲変更の区分） | pass — case-run SKILL.md の blocked 正規再開経路（既存 Issue scope 内=自律処理、scope/完了条件/REQ/Decision/Design 変更=blocked）を確認。case-run 本体変更なし | 新規 0 / 修正済み 0 |
| case-run | TS-013/TS-015 スライス（case-auto 非中央判断者性・工程制御の裁量適用） | pass — stop-and-decision-resolution.md の「中央集約 review engine とはならない」+ 4分類の確定権限明示 | 新規 0 / 修正済み 0 |
| case-run | TS-016/TS-018 スライス（promote 系自律確定判定基準の確定権限ベース化） | pass — 3 skills の SKILL.md/references を REQ-096-018 相当語彙へ書換 | 新規 0 / 修正済み 0 |
| case-run | TS-017 スライス（case-close 自律確定） | pass — QG-4 判定の導出ベース自律確定を明示 | 新規 0 / 修正済み 0 |
| case-run | TS-019 スライス（REQ-014/015 整合。adversarial-review は最終確定権限を取得しない） | pass — adversarial-review-integration 参照は read-only 境界・委譲契約接続参照を維持。本 Issue での変更なし | 新規 0 / 修正済み 0 |
| case-run | TS-020 スライス（backlog-review 統合・分割の確定権限） | pass — STEP-3 Purpose に委譲された裁量 vs 人間判断の区分を明示 | 新規 0 / 修正済み 0 |
| case-run | TS-021 スライス（(a) REQ-003-055/056 残存、(c)「一意に確定」語彙、(d) 旧閉包条件直接列挙） | pass — (a)(c)(d) いずれも自スコープ 0件（(c) は 6系統の閉包条件列挙 12箇所と promote 系語彙を書換後に 0件を機械検証） | 新規 0 / 修正済み 0 |
| case-run | トレーサビリティ check（agentdev-traceability check --req REQ-096-001〜030、REQ-090-024） | pass 一部 — REQ-090-024: 9/9 pass。REQ-096: malformed-declarations / unknown-roles / unknown-req-refs / invalid-artifact-paths / missing-design / policy-invalid / duplicate-inconsistencies pass（missing-design 増分 0 維持）。missing-implementation は本 Issue 対象範囲外の 8行（REQ-096-010/014/021/025/027/028/029/030。case-run/case-revise/case-open 本体変更なし・REQ 更新（#3282）・T2 境界・横断原則）が Wave 1 からの先行状態として残存 | 新規 0 / 既出（先行状態）8 |
| case-run | textlint 最終 gate（agentdev-textlint-guard gate.ts） | pass — 544ファイル検査、hard violations 0件（変更 26ファイルの hard 0 を確認） | 新規 0 / 修正済み 0 |
| case-run | UTF-8 健全性（BOM なし・CR なし・U+FFFD なし。変更 35ファイル） | pass | 新規 0 / 修正済み 0 |
| case-run | targeted docs guard（check_changed_docs.ts --workflow case-run --files） | pass（not-applicable）— case-run workflow profile の appliesTo は docs/**、traceability/ 等で src/opencode/skills/** は対象外（TARGET-EMPTY は正当な対象外判定） | 新規 0 / 修正済み 0 |
| case-run | 配布依存境界 checker（source profile。最終 gate） | pass — 初回実行で concrete-id 49件（追記した REQ-096 concrete ID）を検出し REQ-{NNNN} プレースホルダ形式へ修正、再実行で 0件。link profile は worktree に link 領域（.opencode/skills 配布投影）が未配置のため zero-targets:link（検査対象 0件・環境由来。source profile が実効検査） | 新規 49 / 修正済み 49 / 無効 0 |
| case-run | integrity suite（bun test ./.opencode/skills/repo-agentdev-integrity/scripts/） | pass — 2639 pass / 0 fail。決定的破損検査（check_content_corruption.ts）の counts 全 0 を確認 | 新規 0 / 修正済み 0 |
| case-run | 保護対象確認（.agentdev/jev-observations/**、.local/**） | pass — 混入・削除・変更なし（git status で対象外を確認） | 新規 0 / 修正済み 0 |

## Findings / Capture候補

- REQ-096-001〜030 の missing-verification が全行残存（先行状態）。恒常的な検証手段は draft test_strategy（Case #3278 側 durable state）であり、正規成果物としての verification 対応宣言は存在しない。Wave 3（AC別記録・全スコープ残存検索）と case-close QG-4 での解消が前提。skills 実現面 PR のスコープでは解消しない（対象範囲拡大を伴うため）
- 配布依存境界 checker の link profile は worktree（junction 非展開環境）で zero-targets:link となる。worktree 実行時の source profile 代替運用が正当であることを checker 出力契約側で明示すると、後続 Case の検証差分解釈が安定する候補

## Design確定候補

- なし（判断帰属の明示は REQ-096 + v4-responsibility-boundaries Design の既定判定表・判別基準の適用であり、新たな Design レベル詳細の確定は発生しない）

## 補足

- 変更対象集合は Wave 2 の他子 Issue（#3282 = docs/**、#3284 = src/opencode/commands/**）と互いに素
- 観測契約本文（custom-tool-contracts Design）、.agentdev/jev-observations/**、.local/** は未変更
- 完了条件チェックボックスの更新は case-close 責務のため本 PR では実施しない
