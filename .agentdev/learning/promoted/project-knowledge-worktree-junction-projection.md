# worktree/junction 投影・依存不在前提の操作

## 背景

worktree には git 管理外の実体（`.opencode/skills/agentdev-*` junction 投影、node_modules、`.opencode/plugins`）が存在しない。実体の存在を前提とする操作（skill スクリプト実行、配布整合の二重編集、依存解決）が case 2766 / 2771 / 2787 等で繰り返し fail した。

## 問題

- worktree 内の `.opencode/skills/` は junction 未伝播のため `repo-agentdev-integrity` 以外の skill 実行が配置欠落で不可能
- 自己ホスト投影は junction・git 非追跡のため worktree では投影自体が不在。「src と .opencode の両方を編集する」運用は worktree で編集対象が半分欠け、main では同一実体の二重編集になる
- worktree では node_modules・plugins も未伝播で、integrity suite が依存解決失敗で fail する（分散 node_modules の個別 install が必要な場合もある）

## 望ましい変更

- worktree 内検証では SoT パス（`src/opencode/skills/`）起点の実行を標準手順とする
- 配布ソース面の変更は src/ のみを編集対象とし、.opencode 側は junction による同一実体であることを確認する（配布整合は src 編集のみで成立）
- worktree 検証時の依存整備（bun install またはメイン側 node_modules への junction、検証後 junction 削除）を前提とした手順の明文化

## 対象範囲

- 対象: worktree 上での skill スクリプト実行、配布整合検証、integrity suite 実行、plugins テスト
- 対象外: main リポジトリでの通常運用、install.ps1 による junction 作成機構自体の変更

## 反映先候補

| 種別 | パス | 変更内容 |
|---|---|---|
| reference | src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md | SoT 起点実行規約・配布整合（src/ のみ編集）の明文化（既存「bun test 実行の環境前提」節の拡張） |
| knowledge | docs/knowledge/（新規知識文書） | worktree 構造的制約（投影・依存不在）の統合知識文書化 |
| Design | docs/designs/skills/agentdev-git-worktree-test-fallback.md | worktree 構造的制約との整合確認 |

## 既存対策確認

- 確認結果: 部分的に既存（worktree-operations.md「bun test 実行の環境前提」が node_modules 未伝播・依存整備・junction 代替を規定済み）
- 該当ファイル: src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md
- ギャップ分類: fix gap
- ギャップ詳細: 依存整備手順は既存だが、(1) SoT パス起点の skill 実行規約、(2) 「src/ のみ編集で配布整合成立」の明文化、(3) plugins の source fallback が未統合。発生6件の集約知識化が必要

## 制約

- worktree-operations.md の既存構成（目次・節構造）を維持する
- junction 操作は junction エントリのみ削除し、参照先 main 側 node_modules を破壊しない

## 受け入れ条件

- [ ] SoT パス起点実行・src/ のみ編集・依存整備が worktree 運用知識に統合されている
- [ ] 既存「bun test 実行の環境前提」と重複なく整理されている
- [ ] worktree 構造的制約 Design と矛盾しない

## 元learning item / 根拠

- 要約: worktree に git 管理外実体（junction 投影・node_modules・plugins）が不在のため、実体前提の操作が反復 fail
- 根拠: inbox 2026-09-11（junction 未伝播で SoT 起点実行、自己ホスト投影は src/ のみ編集で配布整合成立）+ deferred 2026-09-01（node_modules 非伝播で事前 bun install、依存復元は bun install 単独では不完）、deferred 2026-09-09（node_modules 非伝播で integrity suite 環境起因 fail）、deferred 2026-09-10（.opencode/plugins gitignore 未伝播で source fallback）。計6件の発生
- 再発条件: worktree 内で投影・依存の存在を前提にした検査・編集・テスト実行
- 横展開可能性: worktree 隔離して検証する全 workflow（case-run / case-close）、src/opencode/skills 配下を変更する case 全般

## 推奨Issue分類

- 分類: feature（運用知識の整備）
- 推奨ラベル: documentation, agentdev, worktree
- 関連Issue: なし（case 2766/2771/2787 等 + PR 2717/2718/2763 の集約知見）
