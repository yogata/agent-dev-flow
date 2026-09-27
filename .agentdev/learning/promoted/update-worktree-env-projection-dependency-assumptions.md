# worktree 検証環境の projection 伝播前提と依存整備前提（bun test 無言欠落・typecheck 依存前置）の実行契約補記

## 背景

Case #3183 の case-run 検証で、worktree 環境の実行前提差に起因する2系統の問題が同時観測された。(1) worktree の `.opencode` projection が commands / skills のみ伝播し plugins / tools が不在のため、bun test 3分割正規形の分割③（plugins 部分指定）がエラーにせず無言で欠落した（projection 系）。(2) worktree root に package.json が存在せず node_modules も未伝播のため、`bun install` を worktree root で実行しても tools / plugins 配下パッケージの devDependencies が導入されず、`tsc --noEmit` の型解決が失敗した（依存整備系）。本成果物は review 推奨に従い projection 系／依存整備系を分節化して保持する。

## 問題

### projection 系

- worktree の `.opencode` projection は commands / skills のみ junction 伝播し、plugins / tools は不在（junction 未伝播の環境差）
- bun test は指定パスが実在しない場合にエラーにせず、残りの対象のみ実行する（無言欠落）。分割③の plugins 部分が「検証済み」と誤認されるリスクが検証完全性に直結する

### 依存整備系

- worktree root に package.json が存在せず、`bun install` は worktree root を workspace root として解決する対象を持たない（no changes で終了）。node_modules は gitignore 対象のため worktree へ未伝播
- 依存は package ディレクトリ単位（tools/agentdev-jev、adapter-cloudflare、plugins/agentdev-jev-tool 等）で導入が必要であり、前置なしの `tsc --noEmit` は型解決エラーになる

## 望ましい変更

### projection 系

- worktree での bun test 3分割正規形実行契約に、projection 伝播前提（commands / skills のみ）と補完手順（main root からの読取専用実行または src 配下直指定）を明記する
- 実施範囲を環境ラベル（junction 伝播状態）へ明記する運用を整備する

### 依存整備系

- worktree の typecheck 手順に「package 単位 bun install の前置」を明記する
- bun test 実行の環境前提と同一の選択基準へ typecheck の依存整備を追記する

## 対象範囲

### 対象

- agentdev-quality-gates qg-4-final-acceptance.md（bun test 正規形の worktree 実行注記・QG-4 観点10 の環境差明示要件の運用）
- agentdev-git-worktree worktree-operations.md（実行環境前提・bun install 前置）
- 実装委譲の QA 手順（typecheck 前置）

### 対象外

- worktree projection 機構自体の変更（junction 伝播対象の拡張等は対象外）
- bun test の実在しないパスに対するエラー挙動の変更（外部ツール仕様）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | .opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md | bun test 正規形の worktree 実行注記（projection 伝播前提・補完手順・環境ラベル） |
| 配布skill reference | src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md | 実行環境前提節への projection 伝播前提と「package 単位 bun install の前置」追記 |
| 配布skill reference | 実装委譲の QA 手順（case-run execution adapter 関連） | typecheck 前置の依存整備手順候補 |

## 既存対策確認

- **確認結果**: あり（guardrail insufficiency）
- **該当ファイル**: src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md（bun test 実行環境前提の記述あり）、.opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md
- **ギャップ分類**: guardrail insufficiency
- **ギャップ詳細**: worktree-operations.md に bun test 実行環境前提の記述があるが、projection 伝播前提（plugins / tools 不在・bun test 無言欠落）と typecheck 前置（package 単位 bun install）は未明文化。近縁 deferred 複数（checker worktree 内実行実証・配下 .gitignore 必要・bun run の Module not found）はあるが該当 deferred エントリなし

## 制約

- node_modules は gitignore 対象のため worktree へ伝播しない（構造的制約）。依存前置は package 単位 bun install または main 側 node_modules への junction で対応
- bun test の無言欠落は外部ツール仕様のため、検証側は「件数突合と環境ラベルの双方から実施範囲を判別可能に記録する」運用で吸収する
- projection 補完（src 配下直指定・main root 読取専用実行）は手順依存であり自動化の範囲が限定的

## 受け入れ条件

- [ ] worktree の bun test 実行契約に projection 伝播前提（commands / skills のみ・plugins / tools 不在）と補完手順が明記されること
- [ ] worktree の typecheck 手順に「package 単位 bun install の前置」が明記されること
- [ ] 実施範囲の環境ラベル（junction 伝播状態・依存パッケージ状態）記録が運用に組み込まれること

## 元 learning item / 根拠

- **要約**: worktree 検証環境の実行前提差（projection 未伝播・依存未整備）による検証無言欠落と型解決失敗
- **根拠**: 2観測（Case #3183 で同時観測）。
  - inbox「Windows + bun 環境で worktree の .opencode projection が commands / skills のみ伝播し plugins / tools が不在のため、bun test 3分割正規形の分割③ plugins 部分が読むツリーを持たない」（PR #3185 検証差分）: 分割③実行で plugins 系テストが一切現れず（「Ran N tests across M files」から欠落判別）。`bun test ./src/opencode/plugins/ ./src/opencode/tools/` の補完実行（599 pass）で代替し環境ラベルへ明記
  - inbox「worktree root には package.json が存在せず bun install を worktree root で実行しても tools / plugins 配下パッケージの devDependencies は導入されない — typecheck 前に package 単位の bun install が必要」（PR #3185 検証差分）: bun install no changes と tsc 型解決エラーの矛盾を検知。`bun install --cwd <package>`（3パッケージ）で整備し typecheck 合格
- **再発条件**: junction 未伝播の worktree で bun test 3分割正規形・tsc --noEmit を依存整備・補完なしで実行する場合
- **横展開可能性**: worktree で bun test / tsc を実行する全 Case（case-run 検証・case-close QG-4）と他 worktree 利用環境に適用可能

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: documentation, bug
- **関連Issue**: なし
