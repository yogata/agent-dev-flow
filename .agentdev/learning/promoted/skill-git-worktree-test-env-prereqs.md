# worktree テスト環境の依存解決前提と bun test 正規形

## 背景

git worktree は追跡ファイルのみ展開するため、node_modules（gitignore・非追跡）は新しい worktree に存在しない。この環境特性により、bun install 前置なしのテスト実行が大量 fail（zod 解決エラー）で開始し、untracked 成果物の残存がフルスイートの順序依存失敗を生み、junction 有無・node_modules 有無が pre-existing fail 構成や Ran N tests の件数を環境間で変動させてきた。また bun test のテスト発見は cwd 基準であり、隠しディレクトリ（.opencode/）・ネスト package.json 境界・`./` prefix の有無で拾い上げ対象が変わる。

## 問題

- worktree テスト実行手順に依存解決前置（bun install、投影構成の node_modules コピー）が明示されていない
- tsc --noEmit 検証は bun test と異なり scripts 単位の bun install では解決しない投影構成（.opencode ルート等）の node_modules を参照する
- bun test の実行形態（cwd、フィルタ形式）が標準化されておらず、拾い漏れ・件数変動が「コード差」と誤認される
- 環境依存の fail・件数変動が pre-existing baseline 表記と乖離し、帰属判断を難しくする

## 望ましい変更

- worktree テスト実行手順に「bun install 前置（scripts 単位）」「tsc 検証時は投影構成の node_modules コピー前置」を明示する
- bun test の正規形を固定する: `./` prefix 付きディレクトリ明示、full suite は3 cwd 分割実行（ルート、.opencode/plugins、repo-agentdev-integrity/scripts）
- 検証記録への環境ラベル（junction 有無・node_modules 有無・main/worktree）添付と、N/M 件数突合時の構成差説明付き許容を明記する
- フルスイート実行前の untracked 成果物確認（git status で scripts/node_modules 等の有無）を検証手順に組み込む

## 対象範囲

### 対象

- agentdev-git-worktree の worktree 運用・セットアップ手順
- case-run / case-close のテスト実行・検証手順
- agentdev-quality-gates の full integrity suite 運用（AG-035）

### 対象外

- runtime-package-boundary Design の scripts 単位 package.json 構成自体
- bun・Bun.spawnSync の仕様変更

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | src/opencode/skills/agentdev-git-worktree/SKILL.md + references（worktree 運用手順） | worktree テスト実行時の依存解決前提（bun install 前置・node_modules コピー・untracked 成果物確認）を明記 |
| skill | src/opencode/skills/agentdev-quality-gates/SKILL.md + references | full suite の正規形（3 cwd 分割・./ prefix 付き明示）と環境ラベル付き件数突合を明記 |
| skill | src/opencode/skills/agentdev-workflow-case-run/references（検証手順） | worktree 検証時の環境前提確認を明記 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: agentdev-git-worktree-test-fallback Design（draft、帰属確認二段階手順）、AG-035（bun test 実行形態契約、起動コマンド記録様式）
- **ギャップ分類**: fix gap / application miss
- **ギャップ詳細**: 帰属確認手順・記録様式は存在するが、(1) 依存解決前置の明示、(2) 3 cwd 分割の標準形、(3) 環境ラベル添付、(4) untracked 成果物確認が手順化されていない。docs-check 契約の「./ prefix 付き明示指定が必須」規定は存在するが full suite 運用側に展開されていない

## 制約

- node_modules はコミット対象外（.opencode/skills/repo-agentdev-integrity/scripts は gitignore 対象外のため明示除外）
- 件数突合の本質は「直前実績との急減検知」であり、環境差による増減は構成差の説明付きで許容する

## 受け入れ条件

- [ ] worktree テスト実行手順に依存解決前提（bun install・node_modules コピー・untracked 確認）が明記されている
- [ ] full suite の正規形（3 cwd 分割・./ prefix 付き）が品質ゲート運用に明記されている
- [ ] 検証記録への環境ラベル添付が明記されている

## 元learning item / 根拠

- **要約**: worktree 環境の依存解決前提と bun test 実行形態の標準化（評価スコア: B=31/40、C=28/40）
- **根拠**: PR 2261（node_modules 順序依存・構成差で件数4件ずれ）、PR 2262（サードパーティ README の TS-009 引っかかり）、PR 2265（pre-existing fail 構成の環境変動）、PR 2283/2284（cwd による拾い上げ差・3 cwd 分割の必要性）、PR 2355/2356（worktree node_modules 未解決で大量 fail、bun install で解消）、PR 2368（tsc の node_modules コピー前置、./ prefix なしで filters did not match）
- **再発条件**: worktree・fresh checkout で依存解決を前置しない実行、対象ディレクトリ非明示の bun test
- **横展開可能性**: worktree + bun 構成のプロジェクト限定（本リポジトリの中核運用知見）

## 推奨Issue分類

- **分類**: feature（検証手順の正式化）
- **推奨ラベル**: enhancement, testing
- **関連Issue**: Issue 2214（PR 2261）、Issue 2204（PR 2262）、Issue 2210（PR 2265）、Issue 2247/2248（PR 2283/2284）、Issue 2362（PR 2368）
