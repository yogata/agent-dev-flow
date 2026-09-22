# measure-update-distribution-artifact-declaration-application-miss

## 背景

Case #3056（REQ-090 Jev 先行評価 Stage 1）の case-run 実装で、6系統 Workflow reference と新規 .ts / README へ具体 REQ 番号（REQ-090-004 等）と ADF-COVERS 宣言を直接記載したところ、配布依存境界 source profile（check_distribution_boundary.ts --profile source）で 69 failures が検出された。配布物から concrete-id と ADF-COVERS 宣言を除去し、sidecar（traceability/agentdev-jev.yaml 等 7件）へ対応宣言を登録し直して failures 0 に解消（PR #3058 merge 済み）。

## 問題

配布物の対応宣言の作成先規約は既存である（case-run SKILL の STEP-S2 手順に「consumer distribution closure に含まれる配布対象成果物（command、skill、template、runtime script 等）の対応関係は、repository top-level の traceability/ 配下の sidecar へ作成・更新する。producer 側の開発管理成果物は inline ADF-COVERS 宣言または sidecar」と明記）。しかし実装担当への委譲 context に「新規配布物を作成する際は concrete-id と ADF-COVERS を本文へ書かず sidecar へ登録する」予防観点が引き渡されず、規約の適用漏れ（application miss）として 69 failures を生じた。検知機構（配布依存境界 checker）は機能したため merge 阻止・データ破壊はなかったが、修正手戻りが発生した。

## 望ましい変更

- case-run 実行系（委譲 context 構成・実行担当の確認観点）に「新規配布物（tools/plugins/skills 配下）へは concrete-id と ADF-COVERS 宣言を本文へ書かず、traceability sidecar へ対応宣言を登録する」予防観点を引き渡す手順・観点の明示を追加する。
- 配布依存境界 checker による検知（事後）と作成時の予防観点（事前）の両面運用を文書化する。

## 対象範囲

### 対象

- case-run 実行系の委譲 context・確認観点（agentdev-workflow-case-run の STEP-S2 関連手順、agentdev-case-run-execution-adapter の委譲手順）
- 配布依存境界の運用文書（docs/designs/integrity/distribution-boundary.md 関連運用節。候補）

### 対象外

- 配布依存境界 checker の実装変更（検知機構は機能済みで変更不要）
- 配布依存境界 Design（DEC-014・REQ-029）の規約自体の変更
- traceability sidecar の schema 変更

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | agentdev-workflow-case-run の委譲 context 構成手順・確認観点（SKILL.md / references） | 新規配布物作成時の予防観点（concrete-id 禁止・sidecar 登録）を委譲 context へ引き渡す手順の追記 |
| 配布skill reference | agentdev-case-run-execution-adapter | 委譲時の確認観点への予防観点追加（候補） |
| 配布依存境界運用 | docs/designs/integrity/distribution-boundary.md 関連運用節 | 作成時確認観点の運用明記（候補） |

## 既存対策確認

- **確認結果**: 既存対策あり（作成先規約・検知機構とも既存。委譲 context への予防観点の引き渡しが未整備）
- **該当ファイル**: .opencode/skills/agentdev-workflow-case-run/SKILL.md L120（配布対象成果物の対応関係は traceability/ 配下 sidecar へ作成・更新する規約）、check_distribution_boundary.ts --profile source（検知機構。69 failures 検出で機能）、docs/designs/integrity/distribution-boundary.md（DEC-014・REQ-029 正典）
- **ギャップ分類**: application miss（adversarial-review F-B4 の追加証拠により fix gap から修正）
- **ギャップ詳細**: 作成先規約は case-run SKILL に既存だが、実装担当の委譲 context に作成時の予防観点が引き渡されず適用漏れが発生した。検知は事後（checker）のみで、作成時点で違反を防ぐ観点の明示が委譲手順に存在しない

## 制約

- case-open / case-run が実現先を選ぶ分類は行わない（learning-promote は反映先候補の記録にとどめる）
- REQ 化は本成果物を backlog-review が RU 化し req-define が変更方針を確定する昇華経路でのみ行う
- 検知機構（checker --profile source）は既存のまま維持し、予防観点の追加が検知機構の代替にならない

## 受け入れ条件

- [ ] case-run 実行系（委譲 context / 確認観点）に「新規配布物へ concrete-id と ADF-COVERS を書かず sidecar へ対応宣言を登録する」予防観点が引き渡される
- [ ] case-run SKILL L120 の作成先規約と本予防観点の関係が文書上明確になっている
- [ ] 配布依存境界 checker（--profile source）による事後検知と作成時予防観点の両面運用が文書化されている

## 元learning item / 根拠

- **要約**: 配布物への concrete-id・producer metadata 混入（作成先規約は既存、委譲 context への予防観点引き渡しが未整備の application miss）
- **根拠**: case-run SKILL.md L120 の規約存在を機械確認済み。検知機構機能済み・解消済み（PR #3058）だが作成時の適用徹底が未整備。8軸評価 27/40
- **再発条件**: 新規配布物の作成時に concrete-id または ADF-COVERS 宣言を本文へ直接記述した場合
- **横展開可能性**: tools/plugins/skills 配下の新規配布物を作成する全 Case で再発し得る

元 inbox エントリ全文（staged prune の証拠保存。出典: `.agentdev/learning/inbox.md` 2026-09-22 記載）:

```markdown
## 2026-09-22: 配布物への concrete-id・producer metadata の混入を配布依存境界検査が検出

- **問題事象**: Case #3056（REQ-090 Jev 先行評価 Stage 1）の case-run 実装で、6系統 Workflow reference と新規 .ts / README へ具体 REQ 番号（REQ-090-004 等）と ADF-COVERS 宣言を直接記載したところ、配布依存境界 source profile で 69 failures を検出した。
- **発生局面**: case-run（DEL-3056-1）。Jev 先行評価 Tool 新設と6系統 Workflow reference 追記時。
- **検知方法**: check_distribution_boundary.ts --profile source（case-run STEP-S5 と case-close 最終 gate）。
- **根本原因**: 配布物は `REQ-{NNNN}` プレースホルダ形式が慣行であり、対応宣言は traceability sidecar（`traceability/*.yaml`）に置くのが正。inline declaration は producer 側成果物（docs 配下・producer 専用スクリプト）限定。
- **自律対応内容**: 配布物から concrete-id と ADF-COVERS 宣言を除去し、sidecar（traceability/agentdev-jev.yaml 等 7 件）へ対応宣言を登録し直し、failures 0 に解消（PR #3058 merge 済み）。
- **ユーザー確認の有無**: なし（case-run 内で自律修正・検証差分に記録）。
- **Decision/REQ/spec影響**: なし（既存の配布依存境界 Design〔DEC-014・REQ-029〕と traceability sidecar 正規配置の再適用）。
- **横展開観点**: tools / plugins / skills 配下の新規配布物を作成する全 Case で再発し得る。
- **再発条件**: 新規配布物の作成時に concrete-id または ADF-COVERS 宣言を本文へ直接記述した場合。
- **予防策候補**: 「新規配布物（tools/plugins/skills 配下）へは concrete-id と ADF-COVERS を書かず、sidecar へ対応宣言を登録する」を実装系 Skill 実行時・case-run の確認観点として明示する。
- **想定反映先**: 配布依存境界 Design の運用ガイド、または case-run 実行系の確認観点（REQ 化は learning-promote で判断）。
- **関連**: Case #3056、PR #3058、traceability/agentdev-jev.yaml、配布依存境界（DEC-014・REQ-029）。
- **タグ**: #distribution-boundary #concrete-id #traceability-sidecar
```

## 推奨Issue分類

- **分類**: docs
- **推奨ラベル**: documentation
- **関連Issue**: Case #3056（PR #3058 が解消 PR）
