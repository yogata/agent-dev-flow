# case-open-step4-prepare-definition-pr-followup-commits

## 背景

case-open STEP-4 の機械工程（prepare_definition_pr script）は、REQ 行編集・generate_indexes・stage・commit・check_integrity・traceability check を一連で実行する。REQ 行変更を伴う Definition 編集では、commit の時点関係に由来する「追加 commit でしか収束しない後続検出」が 2 系統観測された:

1. generate_indexes の req-metrics 計測日 AUTOGEN は計測対象ファイルの commit author date から導出されるため、commit 前配置実行では 1 日遅れの値になり得る（reference「計測日収束」節 L39 に既存）。さらに計測日収束 commit 自体が content 変更として commit date を進めるため、IR-072（req-updated-freshness）が frontmatter updated の追随を 2 段目の NG として要求する（Case #3603 実測）
2. generate_indexes の派生物（docs/README.md、docs/designs/quality/req-health-metrics.md の REQ 行数 AUTOGEN 等）の変化は script 実行後に確定するため、呼出側が入力 JSON を組み立てる時点では stagePaths 事前包含を確定できず、stagePaths 外に dirty 残存する（Case #3552 実測）

両者とも、同一 PR 内の追加 commit（明示パス指定）で収束可能であり、Case #3603 では計測日収束 commit → frontmatter updated 追随 commit → check_integrity 再実行（0 new unmanaged NG 確認）で収束を実証した。

## 問題

`src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md` L38-39 の「traceability check の gate 判定仕様と計測日収束」節は、計測日収束を「同一 PR 内で派生物を再生成・再 commit して収束させる」までを明示するが、(1) IR-072 による frontmatter updated 追随（2 段目検出）までを「計測日収束完了」と扱う規律、(2) 派生物の stagePaths 事前特定が構造的に不能であることへの changedFiles 事後突合+補正 commit 手順、が未規定である。このため実行者が「収束未完了」を script 不具合と誤診する余地、および派生物残存を Definition commit 漏れと誤認する余地が残る。

## 望ましい変更

definition-pr-and-idempotency.md の「traceability check の gate 判定仕様と計測日収束」節（または直後）に、次の 2 点を補足する:

- 計測日収束 commit 後に req-updated-freshness（IR-072）が frontmatter updated 追随を 2 段目として要求し得る。両方を同一 PR 内の追加 commit で収束させて初めて「計測日収束完了」と扱う
- generate_indexes 実行後の changedFiles 突合を標準手順とし、stagePaths 外の派生物（docs/README.md、req-health-metrics.md の REQ 行数 AUTOGEN 等）を検出した場合は明示パス commit で補正する。派生物候補の一覧を整備する

## 対象範囲

### 対象

- `src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md` の機械工程節（gate 判定仕様と計測日収束節、または派生物手順の節）

### 対象外

- prepare_definition_pr.ts 自体の入力契約拡張（definitionEdits への create 操作追加等は別件・前回 deferred 継続）
- check_integrity / IR-072 の検出側の変更
- 工程順序契約自体の変更（前回昇華済み。generate_indexes は commit 前配置のまま維持）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | `src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md` | 計測日収束 2 段構造の補足 + changedFiles 突合・補正 commit 手順の追記 |
| knowledge（候補） | docs/knowledge/ | 派生物候補一覧（docs/README.md・req-health-metrics.md 等）の整備先候補 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: `src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md` L38-39（実測確認。L39 に計測日収束の既存規定あり。grep 実測: 「計測日」「2 段」の 2 段構造記述は不在）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: (1) 計測日収束手順が「派生物を再生成・再 commit」までを明示し、IR-072 による frontmatter updated 追随までを明示していない。(2) 派生物の stagePaths 事前特定不能という構造的ギャップに対する changedFiles 事後突合手順が未規定

## 制約

- 前回昇華済みの工程順序契約（definition-pr-and-idempotency.md L29。check_integrity / traceability-check を commit 後へ移動）と矛盾しない。generate_indexes は commit 前配置のまま
- 計測日収束 commit・frontmatter updated 追随 commit は内容変更ではなく計測日・メタデータの収束であり、PR 本文にその旨を記録する運用を維持する
- IR-072 の判定は frontmatter updated と last content-change commit date の比較であり、追随 commit の要否は計測日 AUTOGEN 行が content 変更と判定されるかで変わる（Case #3603 では判定された）

## 受け入れ条件

- [ ] definition-pr-and-idempotency.md の計測日収束手順に、IR-072 frontmatter updated 追随までの 2 段構造が明記されている
- [ ] generate_indexes 実行後の changedFiles 突合と、stagePaths 外派生物の明示パス commit 補正手順が規定されている
- [ ] 補足は既存の工程順序契約（L29）と矛盾しない

## 元learning item / 根拠

- **要約**: prepare_definition_pr の計測日収束は 2 段検出（計測日 AUTOGEN + IR-072 frontmatter updated 追随）になり、frontmatter updated 追随まで同一 PR 内で完了する。また generate_indexes 派生物は stagePaths 事前特定不能のため changedFiles 突合+補正 commit が標準 contingency になる（エントリ: 「prepare_definition_pr の計測日収束は 2 段検出になり frontmatter updated 追随まで同一 PR 内で完了する」「prepare_definition_pr の generate_indexes 派生物が stagePaths 外で残り追加 commit で補正した」の 2 エントリ統合）
- **根拠**: Case #3603（PR #3607、commit 4c91e6bb・8e4dd22e・1fa6a312）で 2 段検出を実測し、計測日収束 commit → frontmatter updated 追随 commit → check_integrity 再実行（0 new unmanaged NG）で収束実証。Case #3552（PR #3555、commit 3727aafa・441bddbd）で派生物 stagePaths 外残存を追加 commit（明示パス）で補正実証。両者とも実害は追加 commit 1〜2 回で回復済みだが、reference 未規定のため毎回意味判断と誤診リスクが残る
- **再発条件**: (1) Definition commit に req-health-metrics.md の計測日 AUTOGEN 更新（content 変更と判定される）を含む場合。(2) REQ 行追加・Decision 変更を伴い generate_indexes が派生物を更新する Definition 編集
- **横展開可能性**: case-open / case-revise の REQ 行変更を伴う Definition 編集全般。generate_indexes を用いる他の機械工程でも同型の派生物事後追随が発生し得る

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: docs
- **関連Issue**: #3552、#3603（Root Case Issue #3585 に報告済み）
