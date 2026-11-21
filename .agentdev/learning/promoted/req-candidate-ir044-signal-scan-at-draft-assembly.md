# req-define の draft 組立時に IR-044 シグナル語の事前走査を追加する候補

## 背景

case-open STEP-4 機械工程（prepare_definition_pr.ts・Root Case #4167）で、合意済み draft（req-draft-structural-slimming-refactor・ACT-REQ-001）を worktree 配置した後の明示パス commit が、pre-commit hook の cli.ts --changed で IR-044 warning 3件（REQ-123-003 行「Phase 1」・REQ-123-004 行「Phase 1〜4」・REQ-123-005 行「Phase 1〜4」）により終了コード 1 で物理ブロックされた。cli.ts 標準モードは warning も終了コード 1（--fail-level は --workflow モード専用）、pre-push の cli.ts 全量実行も同一条件でブロックするため、内容修正なしに設計PRを作れる機械的経路が存在しない。同型前例（learn-20261119-definition-pr-preshcheck-rejects-merged-line・case 4162 同型構図）を含め2回目であり、条件が揃えば再発は構造的必然である。

## 問題

req-define と case-open はいずれも docs 整合性検査を実行せず（case-open Design「case-open が使用する検査ツール: なし」）、IR-044 finding_route=req-define の検出は REQ-122-008/009（DEC-066・2026-11-18 以降）の warning 扱い物理ブロックによりコミット・push ゲートで初めて表面化する。合意済み REQ 行は REQ-001-049（REQ 行は機能名・フェーズ名で参照し番号を直接参照しない）との整合で「Phase N」等の番号表記を含むことがあるため、draft 合意を通過した後の物理ブロックは構造的に必ず発生し得る。表記修正は req-define 再合意を要するため手戻りが大きい（Root Case #4167 では fail-closed 停止・設計PR 未作成で終了した）。

## 望ましい変更

- req-define の draft 組立時に IR-044 シグナル語（/\bPhase\s*\d+\b|フェーズ\s*\d+|\bStep\s*\d+\b|ステップ\s*\d+|手順\s*\d+/ 等・IR-044 ルール定義に従う）の事前走査と表記ガイダンス適用を追加する（機能追加候補。REQ-004 / REQ-030 系の実行契約への反映要否は req-define 側で確定する）
- IR-044 ルール Design の exemption 条件・前例整備（Phase 番号が実行計画語彙として合意されている場合の扱い）と、ゲート側 warning 扱い変更はいずれも IR-044 ルール・REQ-122-008/009（DEC-066）の既存統制の変更判断を伴う。これらの確定は req-define 側の変更影響分析で利用者判断として行う（learning-promote は確定しない）
- case-open の停止理由分類への記録（IR-044 由来の物理ブロック）の明示

## 対象範囲

### 対象

- req-define の draft 産出・組立工程（シグナル語事前走査の追加候補）
- IR-044 ルール Design（exemption 条件の整備候補・利用者判断を伴う）
- case-open Design（停止理由分類の記録候補）

### 対象外

- 合意済み REQ 行（REQ-123-003〜005）の表記修正（req-define 再合意を要する・別判断）
- pre-commit / pre-push hook 実装自体の変更（利用者判断に委ねる候補）
- Root Case #4167 の worktree・branch・未 commit 配置物の後始末（当該 Case の再開手順で扱う）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。予防策の方向性として、(a) draft 組立時事前走査は最小の新規機能追加要因（REQ 候補の主体）、(b) IR-044 exemption・(c) ゲート warning 扱い変更は既存統制（DEC-066 / REQ-122-008/009）の変更判断を伴う。

| 種別 | パス | 変更内容 |
|------|------|----------|
| REQ | docs/requirements/REQ-030.md または REQ-004.md（req-define 実行契約面） | draft 組立時の IR-044 シグナル語事前走査と表記ガイダンス適用（機能追加要否の判断材料） |
| Design | docs/designs/integrity/rules/IR-044-req-spec-boundary-violation-detection.md | exemption 条件・前例整備（利用者判断を伴う候補の記録面） |
| 配布command | req-define（draft 組立検査面）・case-open（停止理由分類面） | 事前走査の実装面・停止理由分類の記録面（実現方法は req-define で確定） |

## 既存対策確認

- **確認結果**: あり（不備）
- **該当ファイル**: docs/designs/integrity/rules/IR-044-req-spec-boundary-violation-detection.md（triage: 段階名参照への置換・前例 REQ-006-099）、case-open Design「case-open が使用する検査ツール: なし」
- **ギャップ分類**: guardrail insufficiency
- **ギャップ詳細**: draft 合意時点でのシグナル語事前チェックが不在。検出が最後の物理ブロック（pre-commit / pre-push）でしか行われず、REQ-001-049 整合の Phase 番号表記がブロック対象になる構造欠陥。既存 corpus は「第1〜第4フェーズ」表記で数字前置のためパターン不一致で通過しており、遮断が構造的に不安定

## 制約

- 表記修正（段階名参照への置換）は req-define 再合意を要するため本成果物では実施しない
- IR-044 warning の exemption 導入・ゲート warning 扱い変更は DEC-066 / REQ-122-008/009 の検証統制変更であり、利用者判断なしに確定しない
- 既存の IR-044 ルール定義のシグナル語パターンを変更する場合は IR-044 ルール Design の正規更新手順に従う

## 受け入れ条件

- [ ] req-define draft 組立時の IR-044 シグナル語事前走査の要否が req-define 側で確定されている
- [ ] IR-044 exemption 条件の整備要否（Phase 番号が実行計画語彙として合意されている場合の扱い）が利用者判断として確定されている
- [ ] 同型再発時に req-define draft 組立時点で検出され、commit ゲートでの物理ブロックが発生しない

## 元learning item / 根拠

- **要約**: 合意済み REQ 行の IR-044 シグナル語による機械ゲート物理ブロック（同型前例含め2回目・構造的必然）
- **根拠**: case-open STEP-4 機械工程の fail-closed 停止（prepare_definition_pr 報告 JSON の stage-and-commit step stderr に IR-044 違反詳細と終了コード 1 を記録済み）。ユーザー確認あり（停止報告と処置選択肢の提示済み。該当行の表記修正は req-define 再合意を要するため利用者判断）
- **再発条件**: req-define の draft（artifact_actions の REQ create/update content）が要件テーブル行に IR-044 シグナル語を含む場合
- **横展開可能性**: 「draft 産出と検査ゲートの乖離」構図は検査ゲートを持つ全工程に適用可能

## 推奨Issue分類

- **分類**: feature
- **推奨ラベル**: enhancement
- **関連Issue**: Root Case #4167（完了済み・参照のみ）
