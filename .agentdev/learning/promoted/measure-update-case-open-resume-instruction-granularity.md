# case-open 冪等再実行の再開点照合をファイル単位から instruction 粒度へ引き上げる

## 背景

case-open 委譲が Root Case 作成・docs 編集（22 files 変更 + 新規 1）まで完了した後に Session error: Aborted で中断した。冪等再実行時に永続状態（Root Case Issue・worktree 差分・draft）から再開点を再構成して残工程を完走したが、draft artifact_actions（ACT 15）と実差分の全項目突合で編集漏れ 2 件を検出した（capture-boundaries.md の v4 接続節・検出事項プロトコル帰属宣言追記が未実施〔See Also 張替えのみ実施済み〕、新規 Loop Design の AG-011 先送り記録段落の欠落）。

## 問題

中断時点の編集完了度は「差分ファイルの存在」のようなファイル単位の近似で判断されやすいが、同一ファイル内の複数 instruction（例: See Also 張替えは済み・節追記は未実施）は部分的に完了し得る。復帰時の照合をファイル単位で行うと instruction 粒度の漏れを見逃し、Definition PR に編集漏れが混入する。DEC-011（STEP resume point と会話記憶非依存）の再開プロトコルは「永続状態の存在確認」までを定めており、正本（draft の artifact_actions instruction）と実差分の要件単位突合を手順として明示していない。

## 望ましい変更

case-open の冪等再実行（STEP-1 引き継ぎ判定）の再開手順に、編集完了度照合の単位として instruction 粒度照合を明示する:

1. draft artifact_actions の各 instruction（追記べき節・宣言・参照張替えの別）と実差分を、ファイル単位でなく instruction 要件単位で突合する
2. Issue 本文の必要節（正本）についても同様に節単位で照合する
3. 照合結果を編集完了の判定根拠として残工程の特定に使う

## 対象範囲

### 対象

- agentdev-workflow-case-open の冪等再実行・引き継ぎ手順（references/definition-pr-and-idempotency.md の冪等再実行節、references/handoff.md）

### 対象外

- DEC-011 の resume point 契約そのもの（原則は不変。実行手順の強化のみ）
- req-define・case-ready 等の他 workflow の再開手順（本件事象は case-open で観測。横展開は req-define の判断）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補である。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill | src/opencode/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md | 冪等再実行節の再開点再構成手順に「draft artifact_actions の instruction 粒度照合」を明示（照合単位をファイル単位から instruction 単位へ引き上げ） |
| 配布skill | src/opencode/skills/agentdev-workflow-case-open/references/handoff.md | 引き継ぎ時の編集完了度確認に instruction 粒度照合を追記する候補 |
| Design | docs/designs/workflows/v4-durable-state-and-recovery.md | 再開プロトコルの照合粒度に関する注記候補（手順詳細は skill 側） |

## 既存対策確認

- **確認結果**: あり
- **該当ファイル**: src/opencode/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md、references/handoff.md、docs/decisions/DEC-011.md
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 冪等再実行の再開点再構成は定義済みだが（case-open skill 全体を grep 検証し instruction・粒度・Aborted の手順記述なしを確認）、編集完了度の照合単位（instruction 粒度）が未定義。ファイル単位の近似照合を続けると同一ファイル内の部分完了を見逃す

## 制約

- DEC-011 の会話記憶非依存原則は不変（永続状態からの再構成をinstruction 粒度で精緻化するのみ）
- 照合の正本は draft artifact_actions と Issue 本文（正規の永続状態）であり、会話コンテキストに依存しない
- 中断の種別（Aborted・インフラ障害等）を問わず適用する

## 受け入れ条件

- [ ] case-open 冪等再実行手順に instruction 粒度照合が明示されていること
- [ ] 同一ファイル内の部分完了（張替え済み・節追記未実施等）を検出できる照合手順であること
- [ ] 照合に用いる正本（draft artifact_actions・Issue 本文必要節）が明示されていること

## 元learning item / 根拠

- **要約**: Aborted 中断復帰時にファイル単位の差分確認で編集完了と判断すると、同一ファイル内の instruction 粒度の漏れ（節追記・宣言・段落の欠落）を見逃す。draft artifact_actions instruction と実差分の要件単位突合で漏れ 2 件を検出した
- **根拠**: Case #3022（2026-09-20）。22 files 変更 + 新規 1 の編集後に Aborted 中断 → 冪等再実行で instruction 粒度突合により漏れ 2 件検出 → node writeFileSync で補完、commit 99777c7a → 検証（check_integrity・traceability・bun test 3 分割・ADF-COVERS エントリ比較）→ Definition PR #3023 → Root Case 本文への PR 番号埋め戻しまで完走
- **再発条件**: 長時間委譲が GitHub 書込み・worktree 編集の途中で中断し、再実行時に差分ファイルの存在確認のみで編集完了と判断した場合
- **横展開可能性**: 編集途中の中断はどの instruction 境界でも起こり得る。case-run 等の編集を伴う他 workflow でも同種の照合粒度問題が発生し得る

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: workflow, reliability
- **関連Issue**: Case #3022、Definition PR #3023、commit 99777c7a
