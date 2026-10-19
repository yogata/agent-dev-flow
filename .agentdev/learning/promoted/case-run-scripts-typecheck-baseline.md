# case-run-scripts-typecheck-baseline

## 背景

case-run 委譲内の実装品質検証（PR #3809・#3812 の新規 anchor 型テスト追加時）で、src/common/skills/agentdev-workflow-case-run/scripts/ 配下には tsconfig.json と package.json が存在せず、package 単位 typecheck（bun run typecheck）が適用されないことが確認された。新規 .ts の検証は bun test 実行（exit 0）と bun build --target=bun --no-bundle トランスパイルで実施した（bunx tsc は環境に typescript 未解決のため不可）。同構造の長期未検出問題が C20 関連（HOLD_AND_CONTINUE_TOKENS の宣言のみ未使用状態）で実証されており、この領域の型検査枠組み不在は構造的な適用漏れである（adversarial-review A3 実測: skills scripts 領域は 15 スキルで package 構成済み・case-run scripts は唯一の適用漏れ領域）。

## 問題

case-run scripts 配下には型検査基盤が存在せず（実測: record-comments.ts・tests のみ、tsconfig/package.json 不在）、新規 .ts を追加する委譲のたびに検証手段（bun test＋トランスパイル、または tsconfig 追加）の選択が定型化されていない。skills scripts 領域には既存の解決パターン（tsconfig.json + package.json の package 構成）が 15 スキル（case-ready・req-define・case-open・case-close・case-auto・issue-management・traceability・req-file-manager・design-file-manager・artifact-validation・artifact-semantics・adopted-conventions・phase-theme-collaboration・phase-transition・project-extensions の scripts 配下）で確立しており、REQ-112/113（local package tsconfig 統合・typecheck gate 組込み）は src/common/tools/agentdev-gh/ のみをスコープとし「他 local ツール package への横展開（判断材料は REQ-112 が記録）」を対象外としている。skills scripts 領域は REQ-112 の tools 領域パターンとは構造が異なる（単独 scripts 領域であり二重管理統合の課題を持たない）ため、REQ-112 方針の単純適用は実現の誤誘導になり得る。

## 望ましい変更

case-run scripts 配下への型検査基盤導入（同 skills scripts 既存パターンとの整合による tsconfig.json + package.json の追加、または検証手段の定型記載）の是非と方針を REQ として判断・記録するための判断材料。既存 15 スキルの package 構成パターン（adversarial-review A3 実測）を第一の参照先とし、REQ-112 は「tools 領域の二重管理統合方針であり scripts 単独領域と構造が異なる」旨を注記として含める。REQ-112-002（typecheck の品質検査経路組込み方針）の拡張適用を検討する場合は同 REQ の方針文書を判断根拠として参照できる。

## 対象範囲

### 対象

- src/common/skills/agentdev-workflow-case-run/scripts/（tsconfig.json・package.json 追加の検討対象領域）
- agentdev-quality-gates（型検査水準の記載対象の検討）

### 対象外

- REQ-112/113 自体の変更（スコープは agentdev-gh/ のみで維持。REQ-113 適用範囲の「他 local ツール package への横展開は REQ-112 が記録」の契約は維持）
- scripts 配下テストの実行形態変更（bun test 正規形・QG-4 3 cwd 分割は維持）
- 他 skills scripts 領域の再構成

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 新規 REQ（判断対象） | docs/requirements/（req-define で番号採番） | case-run scripts 配下の型検査基盤導入方針の決定 |
| 参照材料 | src/common/skills/agentdev-workflow-case-ready/scripts/tsconfig.json 等（15 スキル分の既存パターン） | 同型 package 構成の第一参照先 |
| REQ（参照先・注記対象） | docs/requirements/REQ-112.md | tools 領域方針としての参照方法（構造差の注記候補） |
| 配布skill references（候補） | src/common/skills/agentdev-quality-gates/ 配下 | 型検査水準の記載拡張の検討 |

## 既存対策確認

- **確認結果**: 対策なし
- **該当ファイル**: なし（case-run scripts 配下に tsconfig.json/package.json 不在・実測）
- **ギャップ分類**: 該当なし（新規整備の判断材料）
- **ギャップ詳細**: 既存対策が存在しないため「既存対策の更新」ではなく検証基盤整備という機能追加の要因＝REQ 候補として処分

## 制約

- bun test 正規形（QG-4 3 cwd 分割）との整合: package 構成追加により既存テスト実行経路・検査対象集合が変化しないことを確認する
- C20（HOLD_AND_CONTINUE_TOKENS 未使用）のような参照結線欠落の早期検出効果は typecheck 枠組み（noUnusedLocals 等）の設定内容に依存する
- 実装の実現先（tsconfig 追加か定型記載か）の選択は req-define の変更影響分析が確定する責務であり、learning-promote は先取りしない

## 受け入れ条件

- [ ] case-run scripts 配下の型検査基盤導入の是非が REQ として決定・記録されていること
- [ ] 導入採用時、tsconfig.json + package.json が同 skills scripts 既存パターンと整合する構成で追加されていること
- [ ] 導入採用時、既存の bun test 正規形（3 cwd 分割）の検査対象集合が変化しないことが確認されていること

## 元learning item / 根拠

- **要約**: case-run scripts 配下への型検査基盤導入（同 skills scripts 既存パターンの適用漏れ解消）の REQ 判断材料
- **根拠**: scripts 配下 tsconfig/package.json 不在（実測）・REQ-112/113 スコープの限定（実測）・skills scripts 15 スキルの既存パターン（adversarial-review A3 実測）。実害は代替検証（bun test＋トランスパイル）で補完済みだが、C20 の長期未検出の構造的一因
- **再発条件**: scripts 配下へ新規 .ts を追加する委譲の場合（繰り返し起こり得る）
- **横展開可能性**: repo root 直下の package 構成外 scripts 領域（scripts/self/release 等は未解決の同型課題）

## 推奨Issue分類

- **分類**: feature
- **推奨ラベル**: enhancement
- **関連Issue**: なし
