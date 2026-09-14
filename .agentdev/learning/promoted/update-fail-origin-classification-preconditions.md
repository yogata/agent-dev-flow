# 検証 fail 由来分類の前提確認（対照 baseline の健全性・横断検査の専属性）

## 背景

検証 fail を「環境起因 / 変更起因 / 既存（pre-existing）」に分類する運用は既存知識（Windows + bun test の spawn timeout 由来分類と対照実行手順）として整備済みである。しかし case 2805 OU-004（PR #2817）と OU-005（PR #2818）で、分類の前提（対照 baseline の健全性・検査対象の専属性）を確認しないと既存手順でも誤分類が残ることが観測された。

## 問題

1. **対照 baseline の健全性**: main root 対照実行は mid-Epic の main root 環境が次子 Issue の manifest 未反映・stale junction 状態にあることがあり、worktree（PR HEAD）より多い fail を出す。対照実行で再現したからといって「環境起因」とは限らず、逆に「main 環境固有で PR HEAD では pass」の無効分類が生じる。Epic 進行中の main root を baseline として絶対視すると誤差し戻しの根拠を誤る。
2. **横断検査の専属性**: 既存 integrity suite は `.agentdev/extensions/**` 等、別 OU 専属の成果物を横断検査する。配布物削除 Case で旧参照が残る横断検査 fail は本変更起因ではなく後続 OU 専属の計画的依存として由来分類する必要があるが、専属割当確認を前置する手順が未整備。

## 望ましい変更

既存知識文書（spawn timeout 由来分類・対照実行節）へ、由来分類の前提確認として次を追記する。

- 対照実行の baseline（main root）は mid-Epic で stale になり得るため絶対視しない。対照実行で再現した fail については、PR HEAD（worktree）での同一テスト結果を併記し、「main 環境固有で PR HEAD では pass」の環境起因（無効分類）と「baseline で再現する pre-existing」を区別する。
- 検査対象が別 OU 専属成果物を横断検査する構成（配布物削除 Case 等）では、fail の由来分類前に Epic Wave の専属割当を確認し、後続 OU 専属の計画的依存として分類する。

## 対象範囲

### 対象

- docs/knowledge/windows-bun-test-spawn-timeout-classification.md（対照実行節の前提確認拡張）
- QG-4 での fail 由来分類の記録様式（根拠併記）

### 対象外

- timeout 拡張・単独再実行の基本手順（既存記載の変更しない）
- integrity suite の横断検査対象の変更（検査対象から extensions を除外する等）
- main root 環境の stale 解消運用そのもの（manifest 反映・junction 更新の手順）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| knowledge | docs/knowledge/windows-bun-test-spawn-timeout-classification.md | 対照実行節へ baseline 健全性の前提確認（mid-Epic stale・PR HEAD pass 併記）と横断検査の専属割当確認・計画的依存分類を追記 |
| 配布skill | .opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md | fail 由来分類記録における根拠併記（対照実行条件に加え PR HEAD 結果）の情報候補 |

## 既存対策確認

- **確認結果**: 既存対策あり（fix gap）
- **該当ファイル**: docs/knowledge/windows-bun-test-spawn-timeout-classification.md
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 既存知識は「timeout 拡張単独再実行」「main HEAD 対照実行で再現する場合は環境起因」を規定するが、(a) 対照 baseline 自体が mid-Epic で stale になり得る前提・PR HEAD pass 併記による無効分類の区別、(b) 別 OU 専属成果物の横断検査 fail を計画的依存として分類する前提確認が未記載。

## 制約

- 知識文書は5項目構成（知識内容 / 適用条件 / 適用対象 / 根拠 / 関連知識）と frontmatter 規約を維持する。
- docs/knowledge/ への直接保存は backlog-review の利用者承認後に行う。
- 「timeout 延長だけで fail を無条件に環境由来と扱わない」等の既存の安全側規定を緩めない（前提確認は追加条件であり、由来分類の免除ではない）。

## 受け入れ条件

- [ ] 対照実行を用いる由来分類で、baseline（main root）の状態（mid-Epic・stale 可能性）の確認と PR HEAD での同一テスト結果の併記が手順化される
- [ ] 配布物削除 Case 等、横断検査を含む suite の fail 由来分類で専属割当の確認と計画的依存分類が手順化される
- [ ] 追記後も既存の安全側規定（無条件の環境由来扱い禁止）が維持される

## 元learning item / 根拠

- **要約**: 検証 fail の由来分類は、対照 baseline の健全性（mid-Epic の stale）と横断検査の専属性（別 OU 専属成果物）という前提確認を経て初めて正確になる。
- **根拠**:
  - case 2805 OU-004（PR #2817、DEL-2809-1）: main root での分割①対照実行が worktree（PR HEAD）より 4 件多い fail を出した（IR-055 runtime-unresolved-reference delta 系 2件・NG21 N16/N17 2件）。原因は mid-Epic の main root が次子 Issue の manifest 未反映 / stale junction 状態のこと。同一テストは PR HEAD worktree では pass。「baseline（main）で再現する pre-existing」と「main 環境固有で PR HEAD では pass の環境起因（無効分類）」の区別と PR HEAD pass の根拠併記が有効。
  - case 2805 OU-005（PR #2818、DEL-2810-1）: integrity suite が `.agentdev/extensions/**`（OU-006 専属）を横断検査し、旧参照残存で本変更側 suite が失敗。専属領域は修正せず Finding として記録し、横断検査 fail は後続 OU 専属の計画的依存として由来分類した。
- **再発条件**: Epic 進行中に main root 対照実行を行う場合、配布物削除 Case で別 OU 専属成果物を横断検査する suite を実行する場合。
- **横展開可能性**: 検証 fail 由来分類を行う場面全般（高。QG-4・対照実行・並行 Wave 運用）。

## 推奨Issue分類

- **分類**: chore
- **推奨ラベル**: documentation
- **関連Issue**: なし（観測元: PR #2817、PR #2818、Issue #2809、Issue #2810、Epic #2805）
