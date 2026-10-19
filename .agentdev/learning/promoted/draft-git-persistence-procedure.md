# draft-git-persistence-procedure

## 背景

Epic #3803 例外経路の是正 Case #3814 受入時、case-ready STEP-7（canonical-and-cleanup phase・removalPaths に draft 指定）で、対象 draft（PR #3813 由来・case-revise 経路で req-define が再合意生成した Definition Amendment draft）が git tracked でないため cleanup script の冪等化前置きが git rm 対象から除外（skippedPaths 記録）し、removal commit 対象が空で commit が不成立した。draft は canonical Definition（merge 済み REQ-108-013）への投影済みを確認した上で物理削除したが、draft 原本の git 履歴は残らない構造だった。近縁前例として deferred L835（RU-0004 が git 未コミットのまま Form Zero で削除・evidence 欠落）があり、untracked 生成物の削除で履歴が欠落する構造は 2 例目。

## 問題

req-define draft-generation.md STEP-9（ドラフト保存）は保存の安全な書込み手段と読み戻しによる完結性検証のみを規定し、保存後の git 永続化（commit）手順の明記がない（adversarial-review A 系実測: STEP-9 L151/L270 に commit 0 件）。case-revise は draft を生成・更新せず入力として消費する（SKILL.md L19「draft は入力」・definition-revision.md L10「req_draft を再解釈・再設計せず投影」）ため、永続化責務は req-define 側にある。一方 case-ready cleanup（REQ-061-040 Form Zero）は draft の git rm＋commit を tracked 前提で機械実行するため、「保存時の git 永続化」と「cleanup 時の git rm」の対が崩れると cleanup の機械工程が安全に止まる（fail-closed として機能）が、永続化漏れの検知は cleanup 時点まで遅延する。

## 望ましい変更

req-define draft-generation.md STEP-9（ドラフト保存）へ、保存後の git 永続化（明示パス指定 commit）の手順明記を提案する。adversarial-review A4 受理に基づき、永続化責務は req-define STEP-9 に一元化し、case-revise 側へは「引き継ぐ draft が commit 済み（tracked）であることの受入確認」に限定した追記候補とする。あわせて case-ready cleanup script の untracked draft 検知時の報告文言明確化（skippedPaths 記録時に永続化漏れの可能性を明示）を候補として併記する。文言の確定は req-define の変更影響分析に委ねる。

## 対象範囲

### 対象

- src/common/skills/agentdev-workflow-req-define/references/draft-generation.md（STEP-9 ドラフト保存への git 永続化手順明記）
- src/common/skills/agentdev-workflow-case-revise/（引き継ぐ draft の tracked 確認の受入規律候補）
- agentdev-workflow-case-ready cleanup script（untracked draft 検知時の報告文言明確化候補）

### 対象外

- REQ-061-040（Form Zero の git rm＋commit 契約）の変更（tracked 前提の現行契約は維持）
- case-open / case-ready cleanup script の削除挙動変更（fail-closed 動作は維持）
- backlog-review の session 由来 RU 生成時の commit 手順（deferred L835 の管理対象・別工程）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill references | src/common/skills/agentdev-workflow-req-define/references/draft-generation.md | STEP-9 ドラフト保存への保存後 git 永続化（明示パス指定 commit）手順の明記 |
| 配布skill references | src/common/skills/agentdev-workflow-case-revise/（SKILL.md または references） | 引き継ぐ draft が commit 済み（tracked）であることの受入確認 |
| workflow scripts（候補） | agentdev-workflow-case-ready cleanup script | untracked draft 検知時の報告文言に永続化漏れの可能性を明示 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: REQ-061-040（case-ready の draft/RU 削除は git rm＋明示パス指定 commit と同一ステップで完結させる契約）、case-ready cleanup script（untracked draft を git rm 対象から除外する fail-closed 前置き・skippedPaths 記録）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: draft 生成工程（req-define STEP-9）の永続化手順明記不在。cleanup の fail-closed 検知は機能するが永続化漏れの検知は cleanup 時点まで遅延し、draft 原本の git 履歴が欠落する構造。`.agentdev/drafts/` は gitignore されていない（adversarial-review 実測: git check-ignore exit 1）ため commit 手順の明記は現行契約と矛盾しない

## 制約

- REQ-061-040 の tracked 前提契約は維持し、保存時の永続化で対を成立させる方向とすること
- case-revise は draft を編集しない（入力として消費）ため、case-revise への追記は生成責務の新設ではなく受入確認に限定すること（adversarial-review A4 受理）
- commit は明示パス指定（.agentdev/learning/ 配下と同様の並列実行安全ステージング手順準拠）とし、一括スコープ・スイープ操作を禁止する

## 受け入れ条件

- [ ] req-define draft-generation.md STEP-9 に、保存後の git 永続化（明示パス指定 commit）手順が明記されていること
- [ ] case-revise 側に、引き継ぐ draft が tracked であることの受入確認が（採用する場合）追記されていること
- [ ] cleanup script の untracked draft 検知時の報告に、永続化漏れの可能性が判別できる文言が（採用する場合）含まれていること

## 元learning item / 根拠

- **要約**: draft 生成時の git 永続化と cleanup の git rm の対の確立（untracked draft の履歴欠落防止）
- **要約の補足**: fix gap は実測（case-revise SKILL.md・references 3 件・req-define draft-generation.md で draft 永続化 commit 明記 0 件）で確認。L835 と同型の untracked 削除事例 2 例目であり構造性を支持（対象・工程が別のため発生件数には数えない）
- **再発条件**: req-define が draft を永続化 commit なしで次工程へ引き渡す場合（case-revise 経路では繰り返し起こり得る）
- **横展開可能性**: draft/RU lifecycle 管理全般（保存時の git 永続化と cleanup 時の git rm の対）

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: bug
- **関連Issue**: Issue #3803、Issue #3814、PR #3813
