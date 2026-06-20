# case-run worktree・ハーネス手順の強化

## 背景

case-auto / case-run の並列 Wave 実行モデル導入後、worktree 作成・ハーネス起動・タイムアウト事後処理に起因する運用トラブルが短期間に4件相次いだ（Issue #900/#947/#953/#955）。いずれも「既存スキル・コマンドに手順が存在するが、特定の条件（Windows 環境・並列実行・タイムアウト）での適用手順が不明確」という共通パターン。個別に手直しするのではなく、関連する4件をまとめて手順化することで、今後の case-auto / case-run 実行時の安定性を包括的に向上させる。

## 問題

以下の4つの運用トラブルがそれぞれ独立した根本原因で発生しているが、いずれも case-run の worktree・ハーネス領域に属する：

1. **Windows+junction 環境の worktree で `.opencode/` が空になる**（Issue #900 RU-3）
   - junction 未伝播 + `.gitignore` で `.opencode/agentdev-*` が追跡対象外のため、worktree 内の `.opencode/commands/agentdev/`・`.opencode/skills/agentdev-*/` が空ディレクトリになる
   - 同期スクリプトに頼ると worktree 内で source-projection 系整合性検査が失敗する
   - driver subagent がこの制約を知らずに検証を実行して失敗する

2. **並列 Wave 実行で worktree が古い commit 基準になる**（Issue #947 / PR #950）
   - Wave 2 の worktree が Wave 1 の PR merge 前の commit を基準に作成された
   - Wave 1 merge 後に main が更新されたため、PR #950 が DIRTY/CONFLICTING になった
   - worktree を削除し origin/main から再作成して force-push で解消する手戻りが発生

3. **`bunx oh-my-opencode run` が Windows でモジュール解決エラー**（Issue #955）
   - `Cannot find module '...oh-my-openagent\bin\oh-my-opencode.js'` エラー
   - bunx がバイナリ解決でグローバルインストールディレクトリの bin パスを期待するが、Windows 版 oh-my-openagent のパッケージ構造（oh-my-openagent-windows-x64 等）と不一致
   - npx では正常動作するが、references にフォールバック経路が未記載のため case-run が停止する

4. **oh-my-opencode ハーネスが最終検証フェーズでタイムアウト**（Issue #955）
   - 実装自体は完了（48ファイル変更）していたが、最終検証フェーズ（grep残留確認）の途中で30分タイムアウト
   - ハーネスが作成した変更はコミット前にタイムアウトしたため手動コミット・PR作成が必要になった
   - ハーネスが「セルフホスティング」2件を見落とし、手動修正も発生
   - タイムアウト＝failed として処理する記述はあるが、実装完了・検証未完了として扱う事後処理手順が不在

## 望ましい変更

各問題に対し、既存スキル・コマンド・references の該当箇所に条件特化の手順を追記する。新規スキル・コマンドの作成は行わない。

## 対象範囲

### 対象

- `src/opencode/skills/agentdev-workflow-orchestration/SKILL.md`（Windows+junction 制約セクション・driver subagent 引き継ぎルール）
- `src/opencode/skills/agentdev-workflow-orchestration/references/subagent-protocol.md`（driver 引き継ぎプロンプトテンプレート）
- `src/opencode/skills/agentdev-git-worktree/SKILL.md`（worktree 作成時の前提検証）
- `src/opencode/skills/agentdev-git-worktree/references/*.md`（必要に応じて）
- `src/opencode/commands/agentdev/case-run.md`（Step 4: worktree 作成、Step 5: ハーネス起動）
- `src/opencode/skills/agentdev-case-run-execution-adapter/SKILL.md`（タイムアウト事後処理）
- `src/opencode/skills/agentdev-case-run-execution-adapter/references/oh-my-openagent.md`（npx フォールバック・タイムアウト事後処理）

### 対象外

- `check_integrity.ts` 等、integrity スクリプト本体の改修（別件。学びエントリ3 で deferred 扱い）
- oh-my-openagent 側（外部パッケージ）の改修
- 新規スキル・コマンドの作成

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | `src/opencode/skills/agentdev-workflow-orchestration/SKILL.md` | 既存22-27行「準備フェーズの既知の制約（Windows + ジャンクション環境）」セクションに、driver subagent 引き継ぎプロンプトへの制約明記を MUST として追記 |
| skill | `src/opencode/skills/agentdev-workflow-orchestration/references/subagent-protocol.md` | driver subagent 起動プロンプトの CONTEXT セクションに「worktree 内 `.opencode/` は空・source/projection は手動両辺編集・同期スクリプト非依存」を必須項目として追記 |
| skill | `src/opencode/skills/agentdev-git-worktree/SKILL.md` | worktree 作成手順に「`git fetch origin` を必ず実行し、最新の origin/main から worktree を作成すること」「並列 Wave 実行時は前 Wave merge 後の origin/main 更新を前提とすること」を追記 |
| command | `src/opencode/commands/agentdev/case-run.md` | Step 4（worktree 作成）に `git fetch origin` の明示を追記。Step 5（ハーネス起動）に「oh-my-openagent 存在確認は行わず bunx で直接起動」「bunx がモジュール解決エラーで失敗した場合は npx にフォールバック」を追記 |
| skill | `src/opencode/skills/agentdev-case-run-execution-adapter/SKILL.md` | タイムアウト事後処理セクションを新設し、「タイムアウト＝即 failed ではなく、実装完了・検証未完了として扱う」「worktree の git status で未コミット変更を確認」「残留箇所の grep と手動修正」を規定 |
| skill | `src/opencode/skills/agentdev-case-run-execution-adapter/references/oh-my-openagent.md` | 起動スクリプト例（12行・115-131行）に `npx oh-my-opencode run` フォールバック経路を追記。タイムアウト・中断セクション（72-80行）に事後処理手順（worktree git status・残留 grep・手動修正）を追記 |

## 既存対策確認

- **確認結果**: 部分（4エントリとも partial / no）
- **該当ファイル**:
  - `agentdev-workflow-orchestration/SKILL.md:22-27`（Windows+junction 制約の記載あり。ただし driver 引き継ぎルールは不在）
  - `agentdev-git-worktree/SKILL.md`（命名規則・禁止事項のみ。git fetch の明示不在）
  - `case-run.md:56`（Step 4 で `origin/main` ベース記載あり。git fetch は不在）
  - `case-run.md:75-76`（Step 5 で AGENTS.md 信頼方針記載あり。npx フォールバックは不在）
  - `agentdev-case-run-execution-adapter/references/oh-my-openagent.md:12, 115-131`（bunx のみ。npx フォールバック不在）
  - `agentdev-case-run-execution-adapter/references/oh-my-openagent.md:72-80`（タイムアウト=failed 記載あり。事後処理手順不在）
- **ギャップ分類**:
  - #4 Windows+junction: **application miss**（制約記載あるが driver 引き継ぎルール不在）
  - #8 worktree 古い commit: **fix gap**（git fetch origin の明示不在）
  - #10 bunx モジュール解決: **fix gap**（npx フォールバック経路の完全不在）
  - #11 ハーネス タイムアウト: **guardrail insufficiency**（事後処理手順の不在）
- **ギャップ詳細**: 4エントリすべてに共存する既存スキルの記載粒度不足。制約の存在は記載されているが、特定条件（Windows・並列実行・タイムアウト）での適用手順が明示されていない

## 制約

- AGENTS.md「編集ガードレール」に従い、コマンドは薄く保ち、再利用可能な判断はスキルに置くこと
- REQ-0101-068「REQ には振る舞いを書く、Step 番号は command reference へ」に従い、case-run.md には手順の意図のみ記載し、詳細は git-worktree SKILL / adapter SKILL を参照させる
- `agentdev-workflow-orchestration` の既存22-27行記述を置き換えず、driver 引き継ぎルールを追加する形式とする
- Windows+junction 制約自体は既記載のため、重複記述を避け「driver 引き継ぎ時の取り扱い」に焦点を当てる
- source（`src/opencode/`）と projection（`.opencode/`）の両辺を編集すること（AGENTS.md のワークフロー順守）

## 受け入れ条件

- [ ] `agentdev-workflow-orchestration/SKILL.md` に driver subagent 引き継ぎプロンプトへの Windows+junction 制約明記が MUST である旨が追記されている
- [ ] `agentdev-workflow-orchestration/references/subagent-protocol.md` の driver 起動プロンプトテンプレートに「worktree 内 `.opencode/` は空・source/projection は手動両辺編集・同期スクリプト非依存」が必須項目として含まれている
- [ ] `agentdev-git-worktree/SKILL.md` の worktree 作成手順に `git fetch origin` の実行と並列 Wave 実行時の origin/main 鮮度確認が明示されている
- [ ] `case-run.md` Step 4 に `git fetch origin` が明示されている
- [ ] `case-run.md` Step 5 に bunx 失敗時の npx フォールバックが明示されている
- [ ] `agentdev-case-run-execution-adapter/references/oh-my-openagent.md` の起動スクリプト例に npx フォールバック経路が含まれている
- [ ] `agentdev-case-run-execution-adapter/SKILL.md` または references にタイムアウト事後処理手順（worktree git status・残留 grep・手動修正）が記載されている
- [ ] source（`src/opencode/`）と projection（`.opencode/`）の両辺が編集されている
- [ ] `agentdev-inspect-skills` で参照整合性エラーが検出されない

## 元learning item / 根拠

- **要約**: case-auto / case-run の並列 Wave 実行で、Windows 環境・origin/main 鮮度・bunx バイナリ解決・ハーネスタイムアウトに起因する4件の運用トラブル。いずれも既存スキル・コマンドに制約記載はあるが、特定条件での適用手順が不明確だったことが原因
- **根拠**:
  - **#4 (2026-06-18, Issue #900 RU-3)**: worktree 内 `.opencode/` が空になり source-projection 系整合性検査が失敗。workflow-orchestration SKILL に制約記載あるが driver 引き継ぎルール不在
  - **#8 (2026-06-20, Issue #947 / PR #950)**: Wave 2 worktree が Wave 1 merge 前基準で PR conflict。case-run Step 4 に `origin/main` ベース記載あるが git fetch 不在
  - **#10 (2026-06-20, Issue #955)**: bunx でモジュール解決エラー。npx では正常動作するが references にフォールバック経路不在
  - **#11 (2026-06-20, Issue #955)**: ハーネス最終検証フェーズで30分タイムアウト。実装完了していたが手動コミットが必要になり、セルフホスティング2件の見落としも発生。タイムアウト事後処理手順不在
- **再発条件**:
  - Windows+junction 環境で worktree を作成し driver subagent に引き継ぐ全ケース（#4）
  - 並列 Wave 実行で前 Wave merge 後に次 Wave の worktree を作成する全ケース（#8）
  - Windows で bunx 経由で oh-my-opencode を起動する全ケース（#10）
  - 大規模実装をハーネスに任せて最終検証が長引く全ケース（#11）
- **横展開可能性**: いずれも AgentDevFlow 固有だが、case-auto / case-run 利用者全員に影響。Windows 環境では特に高確率で再発

## 推奨Issue分類

- **分類**: enhancement（既存スキル・コマンドの手順追加）
- **推奨ラベル**: enhancement, documentation, agentdev
- **関連Issue**: Issue #900, #947, #950, #953, #955
