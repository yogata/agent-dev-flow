# harness-delegation-docs-literal-reference-prohibition

## 背景

worktree 配布物 Markdown の編集委譲（case-open STEP-4・case-run 委譲）において、新規追記行に「docs/designs/…」の literal パスで参照先を記述したところ、check_integrity の IR-055（runtime-unresolved-reference）が新規 delta として検出し、抽象表現への修正と再実行が発生した。同一現象は 2 回発生（deferred L4243・2026-10-13 と本件）しており、L4243 は処分判定を持たないまま保留されていた。

## 問題

harness-delegation.md 委譲指示規律節（L285-293）は concrete ID（REQ 行 ID・Decision ID・CR 番号等）の直書き禁止と sidecar 登録を規定するが、docs/ 配下パスの literal 参照禁止（IR-055 heuristic 系の検出対象）の規律を持たない（adversarial-review A 系実測: IR-055 0 件・「docs/ 配下」は L143 の入力説明のみ）。知識文書 distribution-concrete-id-placement.md は concrete ID と repo-* 用語・マーカー形状の 3 系統を扱い docs/ パス系は未被覆（L34 で docs 配下は対象外明記）。concrete ID 直書き（C11）とは検出系が別であり、既存規律では被覆されない事前防止の空白がある。

## 望ましい変更

harness-delegation.md 委譲指示規律節へ、次の趣旨の追記候補を提案する: 配布物（SKILL.md、references、command 本文）への追記・転記では、docs/designs/・docs/requirements/ 等の docs 配下パスを literal 参照として書かず、「Design 文書に配置された ADF-COVERS 宣言」「該当 Design」等の既存本体と同一の抽象化参照へ統一する。yomiyasu 拡張 rule の指摘候補への追加は情報候補として併記する。文言の確定は req-define の変更影響分析に委ねる。

## 対象範囲

### 対象

- src/common/skills/agentdev-case-run-execution-adapter/references/harness-delegation.md（委譲指示規律節への規律追記）

### 対象外

- IR-055 checker・check_integrity の検査内容変更（事後検知の恒久手段は現行のまま）
- concrete ID 直書き規律（C11・既存 L285-293）の変更
- 配布物本体の既存文面の是正（本件は規律追加のみ）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill references | src/common/skills/agentdev-case-run-execution-adapter/references/harness-delegation.md | 委譲指示規律節への docs 配下パス literal 参照禁止・抽象化参照統一の追記 |
| extension（情報候補） | .agentdev/extensions/skills/ 配下 yomiyasu 拡張 rule | docs/ パス literal 参照の指摘候補（追加は任意判断） |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: check_integrity（IR-055 runtime-unresolved-reference・heuristic 系。baseline delta として検出）、docs/designs/integrity/rules/IR-055-runtime-unresolved-reference.md（検出規則）
- **ギャップ分類**: guardrail insufficiency
- **ギャップ詳細**: 委譲段階の事前防止規律（docs/ 配下パスの literal 参照禁止・抽象化参照統一）の不在。検知は checker の事後で機能するが、2 回の実発生で修正コスト（作成後の修正）が繰り返し発生している

## 制約

- 既存の委譲指示規律節（concrete ID 直書き禁止）の構造に追記する形とし、既存規律を書き換えないこと
- 追加規律は「既存 SKILL.md 本体の参照表現（抽象表現）に合わせる」運用指針として、既存配布物の全面的な文面是正を要求しないこと

## 受け入れ条件

- [ ] harness-delegation.md 委譲指示規律節に、docs 配下パスの literal 参照禁止と抽象化参照統一の規律が追記されていること
- [ ] 追記が concrete ID 規律（L285-293）と矛盾せず、検出カテゴリの違い（concrete-id と IR-055 heuristic）を混同しない記述であること

## 元learning item / 根拠

- **要約**: 配布物編集委譲への docs/ パス literal 参照禁止規律の追記（IR-055 事前防止）
- **根拠**: 2 回の実発生（L4243・本件）と fix gap の実測（harness-delegation.md に IR-055/literal 参照規律 0 件）。checker の事後検知は設計どおり機能済み。同根先行 L4243 は本件へ統合（prune・証拠は本節と evaluation-report.md に保存）
- **再発条件**: 配布物 Markdown への新規行追加で参照先を literal パスで記述した場合
- **横展開可能性**: 配布物 Markdown を触る委譲（case-open STEP-4・case-run 委譲）全般

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: docs
- **関連Issue**: なし
