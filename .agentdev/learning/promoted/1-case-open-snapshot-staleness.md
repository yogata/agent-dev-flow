# case-open 完了条件展開前の最新状態再確認ステップ追加

## 背景

AgentDevFlow の case-open → case-run ライフサイクルにおいて、RU/inspect 由来の一括是正 Issue を起票する際、起票根拠となった rg/grep 結果（検出時点のスナップショット）と起票時点の main 最新状態とに時間差があり、その間に別 PR が同一ファイル群を修正することで Issue 本文の件数前提が陳腐化する事象が3件（一括是正介入PR陳腐化、順次Wave件数前提陳腐化、inspect-docs cross-case陳腐化）発生した。case-run Step 5-3 QG-3 staleness check（REQ-0130-031）は陳腐化を検出するが、case-open 側の予防手順が不在。

## 問題

case-open が完了条件・参考情報として件数・参照範囲のスナップショットを Issue 本文に埋め込む際、起票時点の main 最新状態を再確認せず、検出時点（RU/inspect 実行時）の件数をそのまま記載する。同日内複数PRマージや順次Wave構成で、別 PR が同一ファイル群を修正すると件数前提が陳腐化し、case-run で空コミットPR・QG-4調整コスト・Findings記録の手戻りを生む。

## 望ましい変更

case-open command に「完了条件を Issue 本文に展開する前」の最新状態再確認ステップを追加する。対象パスで rg/grep を再実行し、検出内容が現在も有効か確認する。同日内に複数 PR がマージされている場合は必須とする。件数を行動基準にせず「check_*.ts = 0件」を完了条件の主軸にする運用を明記。順次Wave構成では件数記載時に「Wave 1 マージ後に再計算される可能性」注記を添える。

## 対象範囲

### 対象

- `docs/specs/commands/case-open.md`（完了条件展開前の最新状態再確認ステップ）
- case-open command の Issue 本文生成ロジック（件数・参照範囲記載時の再確認）

### 対象外

- case-run Step 5-3 QG-3 staleness check（既存・REQ-0130-031 で機能中）
- case-update command（既存・Issue 本文更新機能あり）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| command | `docs/specs/commands/case-open.md` | 完了条件展開前のrg/grep再実行ステップ追加、件数を行動基準にしない運用明記、順次Wave件数注記ガイドライン |
| skill | `src/opencode/skills/agentdev-issue-management/SKILL.md`（候補） | Issue 起票時のスナップショット鮮度確認ガイドライン |

## 既存対策確認

- **確認結果**: 既存対策あり（ただし case-open 側に予防手順なし）
- **該当ファイル**: `docs/specs/commands/case-run.md` Step 5-3 QG-3 staleness check（REQ-0130-031）、`docs/specs/commands/case-update.md`
- **ギャップ分類**: fix gap（case-open 側の再確認手順なし）+ application miss（QG-3 は機能するが case-open で予防できていない）
- **ギャップ詳細**: case-open が完了条件を本文に展開する前の最新状態再確認ステップが存在しない。QG-3 は陳腐化を検出するが予防ではなく事後検出のため、空コミットPR等の手戻りコストが残る

## 制約

- 既存の case-open 手順との整合性（RU/inspect 入力から完了条件を機械生成する既存フローを壊さない）
- 順次Wave構成と単独Issue case の両方で機能する手順であること

## 受け入れ条件

- [ ] case-open command SPEC に「完了条件展開前の最新状態再確認ステップ」が追加されていること
- [ ] 同日内複数PRマージ時の再確認必須化が明記されていること
- [ ] 件数を行動基準にせず「check_*.ts = 0件」を主軸とする運用が明記されていること
- [ ] 順次Wave構成での件数注記ガイドラインが明記されていること

## 元learning item / 根拠

- **要約**: case-open が埋め込んだ件数スナップショットが並行PRマージ・順次Wave実装で陳腐化する問題クラス（3件）
- **根拠**: (1) 一括テキスト是正 Issue #1418 が PR #1412/#1415 で既解決済み、(2) 順次Wave Epic #1427 Wave 2 子Issue #1429 の件数前提（303件）が Wave 1 PR #1431/#1432 で317件に増加、(3) inspect-docs スナップショットが cross-case で先行 PR により陳腐化（Epic #1436 Issue #1437/#1438）。全て case-run QG-3 staleness check が検出したが、case-open 側で予防できていなかった
- **再発条件**: (1) RU/inspect がN件の一括是正を検出し、(2) 検出から case-open 起票までの間に別PRが同一ファイル群を修正し、(3) case-open が完了条件展開前に再確認しない場合。順次Wave構成でも同様
- **横展開可能性**: case-open→case-run 間の並行PR運用、順次Wave構成、cross-case全般で systemic

## 推奨Issue分類

- **分類**: feature
- **推奨ラベル**: enhancement, documentation
- **関連Issue**: Issue #1418（一括是正介入PR陳腐化）、Issue #1429（順次Wave件数前提陳腐化）、Epic #1436 Issue #1437/#1438（inspect-docs cross-case陳腐化）
