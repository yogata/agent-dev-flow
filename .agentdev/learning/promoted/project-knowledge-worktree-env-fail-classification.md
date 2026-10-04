# worktree 環境差 fail の由来分離と依存前提の実行形態知見

## 背景

case-run/case-close の worktree 実行で、git 管理外の投影・生成物（.opencode/skills junction・plugins junction・node_modules・textlint vendor・src/opencode-local）が worktree に伝播しないため、bun test・checker 実行が環境差 fail・未実施となり、当該変更起因の fail 切り分け（由来分類）が検証運用の定常コストになっている。

## 問題

(1) 環境差 fail の由来分類（本変更起因か・既存か・環境依存か）が毎回の手作業になり、QG-4 判定が難読化する。(2) 依存生成を要する/要しないの実行形態判断が自明でなく、不要な整備コストや不要な fail が生じる。

## 望ましい変更

worktree 環境差 fail の由来分離手順と依存前提の実行形態知見を知識文書として整備する。内容: (a) 由来分類は main root 対照実行・baseline 再現（detached worktree）・同一条件実行（worktree HEAD = origin/main HEAD + git status 変更ゼロ）の3手段で evidence 化する、(b) 環境差の明示記録（未実施を実行済み扱いしない）、(c) 依存前提の実測知見（repo-agentdev-integrity scripts は node_modules 同梱で直接実行可、bun:test + fs/path のみのテストは依存整備不要、それ以外は bun install・vendor 生成が前置）、(d) skip/fallback 判定の明示。

## 対象範囲

### 対象

- docs/knowledge/（新規知識文書。worktree 環境差 fail の由来分離と依存前提）
- checker 実行契約（docs/designs/integrity/checker-execution-contracts.md）の worktree fallback 節（L97/L178-186/L211 実在）への相互参照

### 対象外

- worktree 機構・junction 伝播の仕様変更
- テスト・checker 側の fallback 実装の個別修正（PC-3・PC-5 系は別成果物）

## 反映先候補

learning-promote は実現先を確定しない。以下は情報候補である。

| 種別 | パス | 変更内容 |
|------|------|----------|
| knowledge | docs/knowledge/worktree-environment-fail-classification.md（新規候補） | 由来分離手順・依存前提・明示記録運用の知識文書 |
| Design | docs/designs/integrity/checker-execution-contracts.md | fallback 節への相互参照追記 |

## 既存対策確認

- **確認結果**: 既存対策あり（部分）
- **該当ファイル**: docs/designs/integrity/checker-execution-contracts.md（worktree 実行環境ラベル・fallback 節）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 契約に worktree 実行時の環境ラベル規定は実在するが、由来分離の具体的対照手順（main root 対照・baseline 再現・同一条件実行）と依存前提の実測知見は知識文書として未整備

## 制約

- 知識文書は docs/knowledge/ 知識文書契約（1知識1ファイル・kebab-case slug・必須内容5項目）に従う
- backlog-review の利用者承認後に docs/knowledge/ へ直接保存される（RU 化経路を通らない）

## 受け入れ条件

- [ ] 由来分類の3手段（main root 対照・baseline 再現・同一条件実行）が手順として記述されている
- [ ] 依存前提の実行形態別判断（同梱/生成要/不要）が記述されている
- [ ] checker 実行契約 fallback 節との相互参照が設定されている

## 元learning item / 根拠

- **要約**: worktree の git 管理外依存未伝播による環境差 fail 5件と実行形態知見2件
- **根拠**: src/opencode-local 未伝播 fail の main root 同結果実行による由来分類（Case #3388/#3391・PR #3405 で再観測）、skills_structure See Also 参照検査の projection 不全 4 fail（PR #3401）、textlint vendor 未生成 39 fail（PR #3403）、plugins junction 未伝播による分割③未実施の明示記録（PR #3419）、分割① pre-existing 4+1 の baseline 同一条件分類（Case #3433）、repo-agentdev-integrity scripts の node_modules 同梱直接実行（PR #3400）、bun:test + 標準モジュールのみの依存整備不要（PR #3451）
- **再発条件**: worktree 内で git 管理外領域に依存するテスト・checker を実行する場合（全 case-run/case-close で構造的）
- **横展開可能性**: worktree 並列検証運用を持つプロジェクト全般

## 推奨Issue分類

- **分類**: docs
- **推奨ラベル**: documentation
- **関連Issue**: なし
