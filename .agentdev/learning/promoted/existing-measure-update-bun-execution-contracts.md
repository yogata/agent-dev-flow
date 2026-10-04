# bun 系ツールの cwd・依存・実行経路の実行形態規律の集約

## 背景

bun 系ツールの実行形態ごとの cwd・依存前提・実行経路の差異が未集約で、実行失敗・依存解決失敗・実行範囲の誤解が4件で観測された。checker の ESM 互換性（node と bun の使い分け）も個別差がある。

## 問題

(1) `bun x tsc --noEmit` は worktree root からだと tsconfig が解決されず help を表示する（bun test〔worktree root・./ 付き相対パス〕と逆の cwd 規律）。(2) worktree 再作成では gitignore 対象の node_modules が復元されず bun x tsc が依存解決失敗する（bun install の前置が必要）。(3) bun test 3 cwd 分割の分割②は src/common/tools/ 配下テストを含まない（未収録配置の単独補完実行が必要）。(4) checker の ESM 互換性は checker 個別に異なる（check_changed_docs.ts は node 安定経路で require 残存の ReferenceError、traceability check.ts は Bun.YAML 依存で node 不可 → bun 経由）。

## 望ましい変更

checker 実行契約・bun test 実行形態契約へ次を集約する: (a) tsc は package 配下 cwd・bun test は worktree root ./ 付きパスの cwd 規律、(b) worktree 再作成後は bun install の前置、(c) フル suite 網羅確認は 3 分割 + 未収録配置（tools 等）の列挙確認、(d) checker 実行前の require 残存・Bun 依存の事前確認と node 非対応 checker の bun 経由切替。

## 対象範囲

### 対象

- docs/designs/integrity/checker-execution-contracts.md（安定実行経路・typecheck 実行手順）
- bun test 正規形（3 cwd 分割）の網羅確認手順（qg-4-final-acceptance.md「3 cwd 分割実行」節）
- worktree 検証手順（agentdev-git-worktree references）

### 対象外

- bun・tsc のバージョン変更
- テスト配置構造（tools 配下）の変更

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| Design | docs/designs/integrity/checker-execution-contracts.md | 安定実行経路への実機制約（require 残存・Bun.YAML 依存）明記・typecheck の cwd 規律 |
| 配布skill reference | src/common/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md | 3 cwd 分割の未収録配置確認・bun install 前置の注記 |

## 既存対策確認

- **確認結果**: 既存対策あり（部分）
- **該当ファイル**: checker-execution-contracts.md「安定実行経路」（node 標準/bun 例外の枠組み）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 枠組みは存在するが、checker 個別の実機制約（require 残存・Bun.YAML 依存の実測）、tsc の cwd 規律、worktree 再作成時の依存復元、未収録配置の網羅確認が未記載

## 制約

- checker の実行契約（終了コード・JSON 出力）は現行維持
- 全 checker の node 対応化は要求しない（bun 経由切替の運用で足りる）

## 受け入れ条件

- [ ] tsc と bun test の cwd 規律が明記される
- [ ] worktree 再作成後の bun install 前置が明記される
- [ ] 未収録配置の確認と checker ESM 互換性の事前確認が手順化される

## 元learning item / 根拠

- **要約**: bun 系実行形態規律の未集約（tsc cwd・node_modules 復元・tools 未収録・checker ESM 個別差の4件）
- **根拠**: Case #3391・PR #3402（tsc の help 表示・package 配下 cwd で解消）、Case #3391・PR #3402（worktree 再作成で依存解決失敗・bun install で復元）、Root Case #3420・PR #3422（分割②が tools を含まない・単独補完で 313 tests 0 fail）、Case #3340・PR #3377 と Case #3337（check_changed_docs の require 残存・traceability check の Bun.YAML 依存を bun 経由で合格）
- **再発条件**: worktree root から tsc を実行する場合、worktree 再作成後に依頼復元なしで検証する場合、3 分割で和集合を暗黙前提にする場合、安定経路を checker 適用前に確認しない場合
- **横展開可能性**: scripts package を持つ skill 領域・typecheck・フル suite 網羅確認全般

## 推奨Issue分類

- **分類**: docs
- **推奨ラベル**: documentation
- **関連Issue**: なし
