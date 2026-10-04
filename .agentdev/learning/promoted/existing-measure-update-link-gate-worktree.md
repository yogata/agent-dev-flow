# 配布依存境界 link profile gate の worktree 実行手順の整備

## 背景

`.opencode/**` junction 投影は git 非追跡のため worktree に伝播せず、link profile gate が zero-targets で fail-closed になる構造的制約が2件で観測された。一方で junction 投影を構成して worktree で link gate を実行する実務経路も確立された。

## 問題

(1) src/common 正本ツリーのみの producer worktree では link projection が存在せず link gate が常に zero-targets になる（final gates 要求時は検証差分へ無効分類で明示が必要）。(2) worktree での link gate 実行には temp 領域への junction 投影構成（bun の fs.symlinkSync(..., 'junction') で src/common の commands/skills/tools と src/opencode/plugins へ投影）が実務経路として有効（ok=true failures 0 を確認）。

## 望ましい変更

checker 実行契約の worktree fallback 節へ (a) junction 投影構成の前置手順（投影ルートを repoRoot として --profile link を実行）、(b) zero-targets の無効分類（構造的不在）の明示記録、(c) main root 再実行への切替条件を明記する。

## 対象範囲

### 対象

- docs/designs/integrity/checker-execution-contracts.md（L178-186 link profile 規定・L211 worktree fallback 節。2026-10-05 実測）
- case-run 委譲指示側（final gates 要求時の link gate 取扱い）

### 対象外

- junction 投影機構の変更・.opencode の git 管理化
- gate の検出仕様変更

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| Design | docs/designs/integrity/checker-execution-contracts.md | worktree fallback 節への junction 投影構成手続・zero-targets 無効分類の明示 |
| 配布skill reference | case-run 側 final gates 手順 | link gate の main root 再実行条件の明示 |

## 既存対策確認

- **確認結果**: 既存対策あり（部分）
- **該当ファイル**: checker-execution-contracts.md L178-186（worktree 内実行は junction 未伝播により無効実行になり得る・環境ラベル記録・REQ-018-004 環境差区分）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 環境ラベル規定はあるが、junction 投影構成による実効実行手順と zero-targets の無効分類明示が fallback 節に未整備

## 制約

- worktree 分離原則（読取専用・書き込みなし）を維持する
- zero-targets を clean 扱い・暗黙の検査省略にしない

## 受け入れ条件

- [ ] junction 投影構成の手順が fallback 節に記載される
- [ ] zero-targets の無効分類記録と main root 再実行条件が明記される

## 元learning item / 根拠

- **要約**: link profile gate の worktree 構造的 zero-targets と junction 投影構成の実務経路（2件）
- **根拠**: Case #3430・PR #3434（producer worktree で zero-targets・無効分類で明示）、Case #3423・PR #3435（junction 投影構成で --profile link ok=true failures 0）
- **再発条件**: worktree で link profile gate を実行する場合（src/common 配下変更を伴う全 case-run）
- **横展開可能性**: link gate を実行する case-run 委譲全般

## 推奨Issue分類

- **分類**: docs
- **推奨ラベル**: documentation
- **関連Issue**: なし
