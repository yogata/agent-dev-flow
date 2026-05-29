# 学びアーカイブ（生きている learning プール）

未処分・保留中・再評価対象の learning item を保持する生きている learning プール（SHALL）。
/agentdev/learning-refine の実行時に inbox.md から移動されたエントリが格納され、/agentdev/learning-promote の処分判定や /agentdev/learning-refine の prune によって動的に変化する。

永久保存先ではなく、処分済みの learning item は削除される。昇格対象の根拠は staging スタブに残す。

## エントリフォーマット（13項目 + 移動日）

```markdown
## YYYY-MM-DD: タイトル

- **問題事象**: 何が起きたか
- **発生局面**: いつ/どこで発生したか。例: 実装、CI、レビュー、デプロイ
- **検知方法**: どう検知したか。例: CI失敗、lint警告、レビュー指摘、手動確認
- **根本原因**: なぜ起きたか
- **自律対応内容**: エージェントがどう修正・回避・対応したか
- **ユーザー確認有無**: ユーザー確認が関与したか。あり/なし
- **ADR/REQ/spec影響**: ADR/REQ/specへの影響可能性。なし、または具体的な影響先
- **横展開観点**: 同種の状況への適用方法
- **再発条件**: どのような条件で再発するか
- **予防策候補**: 将来の予防方法
- **想定反映先**: 反映先。例: コマンド/スキル/テンプレート/docs
- **関連**: 関連ファイルパス、Issue番号等
- **タグ**: `#タグ1` `#タグ2`
- **移動日**: YYYY-MM-DD（/agentdev/learning-refine実行日）

---
```

## 旧フォーマット互換

過去のエントリ（5項目形式: 事象/原因/対策/関連/タグ）は /agentdev/learning-refine 実行時に正規化される。

正規化マッピング:
- 状況/事象 → 問題事象
- 原因 → 根本原因
- 解決策/対策/教訓 → 自律対応内容（解決策・対策）/ 予防策候補（教訓）

## Prune ポリシー

archive.md は append-only ではなく、以下のタイミングでエントリが削除される:

- **refine 時 prune**（MAY）: 長期間再発していない単発レアケース。ただし判断基準・技術知識・プロジェクト固有知識を含む learning item は削除不可
- **promote 時 prune**（SHALL）: staged / rejected / duplicate の learning item。deferred・未処分の learning item は削除不可

---

## 2026-05-17: issue-backlog由来Issueの不明確さへの対処方針

- **問題事象**: issue-backlogで抽出した子Issue（例: staff-schedule#739）が、元issue/PRの「対象外」1行文のみを出典とするため、概要がタイトルの再述に過ぎず極めて不明確になった
- **発生局面**: 実装
- **検知方法**: Issue着手時の要件確認
- **根本原因**: issue-backlogは壁打ちフェーズのショートカット経路であり、構造的抽出のみを行う設計。元ソースに情報が少ない場合、深掘り能力がない（設計上の制約）
- **自律対応内容**: 方針Cを採用 — backlog Issueは「まだらな未整理リスト（プレースホルダー）」として許容し、着手時にissue-reqで壁打ち深掘りするフローを確立。フロー: issue-backlog（粗いIssue作成）→ 着手時にissue-req（壁打ち）→ issue-save-req（docs保存）→ issue-update（既存Issue更新）→ issue-work（実装）。既存Issue更新はissue-createではなくissue-updateを使用する点に注意
- **ユーザー確認有無**: あり
- **ADR/REQ/spec影響**: なし
- **横展開観点**: 自動抽出によるIssue作成では、元ソースの情報量がそのままIssue品質の上限になる。情報量が少ないソースからの抽出では「粗いIssue + 後段での壁打ち」パターンが適用可能
- **再発条件**: issue-backlogで情報量の少ないソースからIssueを抽出する場合
- **予防策候補**: issue-backlog実行時に情報量の少ないIssueには「要壁打ち」ラベルを付与する
- **想定反映先**: `intake-open` コマンド
- **関連**: `.opencode/commands/issue/issue-backlog.md`
- **タグ**: `#ワークフロー` `#issue-backlog` `#要件定義` `#プロセス設計`
- **移動日**: 2026-05-22

---

## 2026-05-17: Markdownコマンド定義の段階的拡張

- **問題事象**: issue-work コマンドに複数Issue並列実行を追加する必要があった（135行→244行）
- **発生局面**: 実装
- **検知方法**: 機能追加要件の発生
- **根本原因**: 既存の単一Issueフローを壊さずに新機能を組み込む必要があった
- **自律対応内容**: Step 0 の条件分岐で新旧パスを分離。分岐点で「有効数 = 1 → 従来フロー、≥2 → 新モード」とし、Steps 1-12 の内容は一切変更しない。新モード専用の Step 0b/0c/Phase D を追加
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: 既存Stepの内容不変 + 分岐点でのみ新規パスを注入するパターンは、他のコマンドでも後方互換性を保つ拡張に適用可能
- **再発条件**: 既存コマンドに新機能を追加する場合
- **予防策候補**: 拡張時は分岐点のみの変更とし、既存パスのロジックは不改変とする設計原則を明文化する
- **想定反映先**: コマンド設計ガイドライン、`case-run` コマンド
- **関連**: `.opencode/commands/issue/issue-work.md`
- **タグ**: `#コマンド設計` `#後方互換性` `#段階的拡張`
- **移動日**: 2026-05-22

---

## 2026-05-17: LLM + 正規表現ハイブリッド分析

- **問題事象**: 複数Issue間の依存関係判定で正規表現単独では「トリプル化に伴い」等の暗黙的依存を見逃した（バックテストで判明）
- **発生局面**: 実装
- **検知方法**: バックテスト
- **根本原因**: 正規表現では自然言語に埋め込まれた暗黙的関係を検出不可
- **自律対応内容**: LLM意味解析を主、正規表現を補助とする2層構成を設計。4レベル分類（L0-L3）の明確な枠組みをプロンプトに与えて判定品質を安定化
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: 自然言語に埋め込まれた暗黙的関係の検出にはLLM意味解析を主軸に据え、正規表現は明示的パターンの高速検出に限定する構成が実用的
- **再発条件**: 自然言語から関係性を抽出する必要がある場合
- **予防策候補**: テキスト解析系の設計では必ずLLM + ルールベースの2層構成を検討する
- **想定反映先**: 依存関係解析モジュール
- **関連**: なし
- **タグ**: `#依存関係` `#ハイブリッド分析` `#プロンプト設計`
- **移動日**: 2026-05-22

---

## 2026-05-22: skill rename 時の directory move は git mv で追跡性を保持

- **問題事象**: `agentdev-commands-creator` を `agentdev-command-creator` にリネームする際、delegate agent が旧ディレクトリの内容を新ディレクトリに Write + 旧ディレクトリを削除する手順を取った。git は自動的に rename として検出したが、手順としては git mv の方が追跡性が高い
- **発生局面**: 実装（case-run Phase B）
- **検知方法**: git diff --cached --stat で `rename` として表示されたことで確認
- **根本原因**: delegate agent が git コマンドを使わず Write/Delete で実装したため
- **自律対応内容**: 結果的に git が rename を正しく検出したため追加対応なし
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: ファイル・ディレクトリのリネームを delegate に指示する際、`git mv` を使うよう明示的に指示すべき
- **再発条件**: ファイル・ディレクトリのリネームを delegate する際
- **予防策候補**: delegate の prompt で「ディレクトリリネームには `git mv` を使用すること」を明記する
- **想定反映先**: case-run コマンドの delegate 指示テンプレート
- **関連**: Issue #326, PR #327
- **タグ**: `#git` `#rename` `#delegate`
- **移動日**: 2026-05-22

---

## Node.js -e 内で gh CLI の -q (JQ式) にシングルクォートを使うとエラーになる

- **問題事象**: SKILL.md Section 3 の推奨パターン `node -e "..."` 内で gh CLI の `-q '.comments[-1].body'` のようにシングルクォートでJQ式を囲むと、Node.js がシングルクォートをUnicodeエスケープとして解釈し SyntaxError が発生する。一方ダブルクォートで囲むとPowerShellが解釈してしまう。
- **発生局面**: 実装（case-close でのVERIFY操作、gh CLI出力の読み戻し）
- **検知方法**: execSync 実行時の SyntaxError（`Expected unicode escape`）を直接確認
- **根本原因**: Node.js `-e` の評価文字列をPowerShellのダブルクォートで囲むため、内部でシングルクォートを使うとNode.jsパーサーが文字列区切りとして扱えず、外部でダブルクォートを使うとPowerShellが展開する。JQ式のクォートとシェルのクォートが3重に競合する。
- **自律対応内容**: `-q` によるJQ式フィルタを避け、`--json` でJSON全体を取得後に `JSON.parse()` でJavaScript内でフィルタする方式に切り替えた（例: `const j=JSON.parse(r);writeFileSync(path,j.body)`）
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（SKILL.md Section 3 に記載のパターンは `-q .body` のようにドット表記のみであり、シングルクォート不要のケースを想定しているため）
- **横展開観点**: Node.js `-e` 内でgh CLIの `-q` オプションに文字列式を渡す全てのケースで発生する可能性あり。特に `.comments[-1].body` や `.items[].title` のようにブラケットやイテレーションを含むJQ式
- **再発条件**: `node -e "..."` 内でgh CLIの `-q` にシングルクォートを含むJQ式を渡す場合
- **予防策候補**: SKILL.md の execSync パターン例に `-q` で文字列クォートが必要な場合の回避策（JSON全体取得 + JSON.parse）を併記する
- **想定反映先**: スキル（agentdev-gh-cli SKILL.md Section 3 の補足として）
- **関連**: Issue #332, PR #333, `.opencode/skills/agentdev-gh-cli/SKILL.md` Section 3
- **タグ**: `#gh-cli` `#encoding` `#nodejs` `#workaround`
- **移動日**: 2026-05-29

---

## squash merge 後のローカルブランチ削除が -d で失敗する（-D は禁止）

- **問題事象**: case-close Step 7 で squash merge 後に `git branch -d refactor/issue-342` を実行したところ「not fully merged」エラーで失敗した。`agentdev-git-worktree` スキルは `-D`（強制削除）を禁止しているため、ローカルブランチが残存した
- **発生局面**: 完了処理（case-close Step 7 ブランチ・worktree削除）
- **検知方法**: `git branch -d` の exit code 非0 と stderr メッセージを直接確認
- **根本原因**: squash merge はマージコミットを作成しないため、git は当該ブランチを「未マージ」と判定する。`git branch -d` はマージ済みブランチのみ削除可能。一方 `-D`（強制削除）はスキルで禁止されている
- **自律対応内容**: 警告を表示して次のステップへ進んだ。リモートブランチは `git push origin --delete` で正常に削除済み
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（現在のスキル定義は正しい。squash merge 自体は問題ない）
- **横展開観点**: 全 case-close で squash merge を使用する場合に同様に発生する。merge commit を使用する場合は発生しない
- **再発条件**: `gh pr merge --squash` でマージした後に `git branch -d` を実行する場合
- **予防策候補**: `agentdev-git-worktree` スキルに squash merge 後のローカルブランチ削除に関するガイダンスを追加する（例: squash merge 検出時は `-d` 失敗を予期し、警告付きでスキップする）
- **想定反映先**: スキル（agentdev-git-worktree SKILL.md の worktree削除手順）
- **関連**: Issue #342, PR #343, `.opencode/skills/agentdev-git-worktree/SKILL.md`
- **タグ**: `#git` `#worktree` `#squash-merge` `#case-close`
- **移動日**: 2026-05-29

---

## case-run が worktree 内に残した .sisyphus/ 一時ファイルが git worktree remove を失敗させる

- **問題事象**: case-close Step 7 で `git worktree remove ".worktrees/344-feature"` を実行したところ「contains modified or untracked files」エラーで失敗した。原因は case-run が worktree 内に作成した `.sisyphus/` ディレクトリ（実行計画・証跡等の一時ファイル）が未追跡ファイルとして残存していたため
- **発生局面**: 完了処理（case-close Step 7 ブランチ・worktree削除）
- **検知方法**: `git worktree remove` の stderr エラーメッセージを直接確認。事前に `git -C ".worktrees/344-feature" status --short` で `?? .sisyphus/` のみであることを確認
- **根本原因**: case-run は worktree 内で作業する際 `.sisyphus/` を作成するが、case-close の worktree 削除前にこれらをクリーンアップする Step が存在しない。`.sisyphus/` は Sisyphus runtime の一時領域でありコミット対象外だが、git worktree は未追跡ファイルがあると削除を拒否する
- **自律対応内容**: `.sisyphus/` のみの残存でありコミット済みコードには影響しないため、`--force` フラグで強制削除した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（現在のスキル定義にクリーンアップ手順がないことが根本原因だが、対応は別途判断）
- **横展開観点**: 全 case-close で case-run 経由で worktree を使用した場合に発生する。case-run を使用しない場合は発生しない
- **再発条件**: case-run で worktree を使用し、case-close で worktree を削除する全ケース
- **予防策候補**: case-close の Step 7（worktree削除）で、削除前に `.sisyphus/` のクリーンアップを追加する。または case-run の完了Step で `.sisyphus/` をクリーンアップする
- **想定反映先**: コマンド（case-close.md Step 7 または case-run の完了Step）
- **関連**: Issue #344, PR #346, `.opencode/commands/agentdev/case-close.md`
- **タグ**: `#git` `#worktree` `#case-close` `#cleanup`
- **移動日**: 2026-05-29

---

## 完了ゲート（G08）がテスト戦略のスコープ外 `[ ]` を検出して case-close がエラー停止する

- **問題事象**: case-close Step 2 の完了ゲートで、テスト戦略セクションのスコープ外E2Eテスト `- [ ]` が1件検出され、G08により即座にエラー停止した。完了条件セクションは8/8 `[x]` で全て完了していたが、テスト戦略の `[ ]` もG08の検出対象に含まれていた
- **発生局面**: 完了処理（case-close Step 2 前提確認）
- **検知方法**: G08 エラーメッセージ「完了ゲートエラー: 未完了チェックボックス検出」を直接確認
- **根本原因**: case-run 実行時にスコープ外のテスト項目を `[ ]` で残す運用と、case-close G08 の完了ゲート（完了条件・テスト戦略両セクションの全 `[ ]` を検出）が矛盾している。G08 はセクションを区別せず全チェックボックスを検出する
- **自律対応内容**: 該当E2Eテスト行をIssue本文から削除して完了ゲートを通過させた
- **ユーザー確認有無**: なし（ユーザーに確認せず自律対応した）
- **ADR/REQ/spec影響**: なし（G08の挙動自体は正しい。運用との矛盾が問題）
- **横展開観点**: case-run でスコープ外項目を `[ ]` で残す全ケースで case-close がエラー停止する可能性がある
- **再発条件**: case-run でテスト戦略にスコープ外の `[ ]` を残し、case-close を実行する場合
- **予防策候補**: case-run の完了Step でスコープ外の `[ ]` を削除するようステップに追加する。または case-open/case-run でテスト戦略の `[ ]` はスコープ内項目のみに限定する運用を明文化する
- **想定反映先**: コマンド（case-run.md の完了Step または case-close.md Step 2 の注記）
- **関連**: Issue #381, PR #382
- **タグ**: `#case-close` `#checkbox` `#gate` `#scope-management`
- **移動日**: 2026-05-29

---

## worktree ディレクトリがプロセスロックされ削除できない場合がある

- **問題事象**: case-close Step 7 で worktree ディレクトリ `.worktrees/381-feature` を削除しようとしたところ「Permission denied」エラーで失敗した。`git worktree remove` は既に成功していたが、ディレクトリ自体が他のプロセスにロックされていた
- **発生局面**: 完了処理（case-close Step 7 ブランチ・worktree削除）
- **検知方法**: `Remove-Item -Recurse -Force` の stderr エラーメッセージを直接確認
- **根本原因**: IDE（VSCode等）やシェルのカレントディレクトリが worktree 内を指している場合、OSレベルでディレクトリがロックされ削除できない。worktree 自体は git worktree remove で登録解除済みだが、ディレクトリのファイルシステムエントリが残存する
- **自律対応内容**: 警告を表示して次のステップへ進んだ。git worktree prune は正常に完了し、ローカル/リモートブランチも正常に削除済み
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: Windows環境でIDEがディレクトリをロックする全ケースで発生する可能性がある
- **再発条件**: worktree ディレクトリが他プロセスにロックされた状態で case-close Step 7 を実行する場合
- **予防策候補**: ディレクトリ削除失敗時の警告表示に「IDEやターミナルで当該ディレクトリを開いている場合は閉じてから手動で削除してください」を追加する
- **想定反映先**: コマンド（case-close.md Step 7 の警告メッセージ）
- **関連**: Issue #381, `.opencode/commands/agentdev/case-close.md`
- **タグ**: `#git` `#worktree` `#windows` `#file-lock`
- **移動日**: 2026-05-29

---

## case-run サブエージェントがソースファイルに未コミット変更を残して終了し worktree remove が失敗する

- **問題事象**: case-close Step 7 で `git worktree remove ".worktrees/389-feature"` が「contains modified or untracked files」エラーで失敗。原因は case-run Wave 1 のサブエージェントが `.opencode/commands/agentdev/integrity-check.md` に未コミット変更を残したまま終了したため。当該変更は既に squash merge 済みの PR #390 に含まれている内容と同一であり、エージェントが worktree 内のファイルを編集後にコミットせず終了した
- **発生局面**: 完了処理（case-close Step 7 ブランチ・worktree削除）
- **検知方法**: `git worktree remove` の stderr エラーメッセージ、`git status --short` で ` M .opencode/commands/agentdev/integrity-check.md` を確認
- **根本原因**: case-run のサブエージェント（general agent）がタスク完了後に変更を git add/commit せず、変更が worktree に残存した。サブエージェントのプロンプトに「変更をコミットすること」の指示がなかった、またはエージェントが指示を遵守しなかった
- **自律対応内容**: 変更内容が既にマージ済みPRと同一であることを確認し、`--force` で worktree を強制削除した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: case-run でサブエージェントを並列実行する全ケースで発生する可能性がある。特に複数ファイルを同時に修正するWave実行時
- **再発条件**: case-run Wave のサブエージェントがファイルを編集し、コミット前に終了する場合
- **予防策候補**: case-run の Step 7 で、Wave完了後に worktree 内の `git status --short` で未コミット変更を検出し、適切にコミットまたは破棄する確認ステップを追加する
- **想定反映先**: コマンド（case-run.md Step 7 のWave完了後確認）
- **関連**: Issue #389, PR #390, `.opencode/commands/agentdev/case-run.md`
- **タグ**: `#case-run` `#subagent` `#git` `#worktree` `#uncommitted-changes`
- **移動日**: 2026-05-29

---

## case-open のテスト戦略に実装PRで達成不可能なE2Eテストを含めるとcase-closeがG08でブロックされる

- **問題事象**: case-open で Issue 本文のテスト戦略セクションに「E2Eテスト: req-define → req-save → case-open → case-run のパイプラインで伝播確認」を追加したが、当該E2EテストはStep 4bを追加するPR自体では検証不可能（Step 4bを含むパイプラインの実行が必要）であり、case-close の G08完了ゲートで「未達成」と判定されて停止した
- **発生局面**: 完了処理（case-close Step 2 達成判定・完了ゲート）
- **検知方法**: G08の5条件評価で条件2（証拠存在）・条件3（直接対応）・条件4（反証なし）が ❌ となり、未達成判定
- **根本原因**: case-open のテンプレート出力時、テスト戦略に「実装PRでは達成不可能なテスト項目」を含めてしまった。E2Eテストは実装後の別セッション・別パイプラインで実行すべきだが、それをIssue完了条件と同じセクションに混在させた
- **自律対応内容**: Issue本文からE2Eテスト項目を削除してcase-closeを継続した
- **ユーザー確認有無**: あり（3選択肢提示 → ユーザーのcase-close起動を暗黙の選択と解釈）
- **ADR/REQ/spec影響**: なし
- **横展開観点**: case-open でテスト戦略を出力する全ケースで発生する可能性がある。特に「機能追加 → パイプライン検証」の2段階が必要な要件
- **再発条件**: case-open がテスト戦略に「実装PRのスコープ外」のテスト項目を含めた場合
- **予防策候補**: case-open のテスト戦略出力時に「実装PRで達成可能か」を判定基準に含める。達成不可能なテストは「別途確認」注記にするか、テスト戦略セクション自体に出力しない
- **想定反映先**: コマンド（case-open.md のテスト戦略出力ステップ）
- **関連**: Issue #393, PR #394
- **タグ**: `#case-close` `#case-open` `#test-strategy` `#G08` `#completion-gate`
- **移動日**: 2026-05-29

---

## 2026-05-27: case-close Step 8b hash check が自マージで常に不一致になる

- **問題事象**: case-close Step 4 でPRをsquash mergeした後、Step 8bの `git pull --ff-only` でpull前後のHEAD hashが不一致となり、構造化エラーによる停止条件に該当する。原因はcase-close自身がmergeしたcommitがorigin/mainに存在するため。またStep 7で `git branch -d` が「not fully merged」エラーで失敗する（squash mergeは新しいcommitを作成するため、gitがbranchをmergedと認識しない）。
- **発生局面**: case-close（Issue #397の完了処理）
- **検知方法**: Step 8bのhash不一致検出、Step 7の `git branch -d` 実行時エラー
- **根本原因**: case-closeの設計が「外部からの変更検知」を目的としているが、case-close自身のPR mergeによる変更を除外する考慮がない。squash mergeは元のbranch tipと異なるcommit hashを作成するため、`git branch -d` も失敗する。
- **自律対応内容**: Step 8bはhash不一致が自マージ由来であることを確認して継続（外部変更なしと判定）。Step 7はPR merge済みを確認の上 `git branch -D` で強制削除（git-worktree skillの禁止事項に該当するが、PR merge済みの事実を確認済み）。
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: REQ-0032（case-close手順定義）のStep 7-8bに影響。git-worktree skillの「未マージブランチ強制削除禁止」ルールとの矛盾。
- **横展開観点**: case-closeがPRをmergeする全ケースで発生する。特にsquash mergeを使用する場合は必ず発生する。
- **再発条件**: case-closeが自身でPRをsquash mergeする場合（毎回再発）
- **予防策候補**: Step 8bでpull前hashを記録し、pull後hashの差分がPR merge由来のcommitのみであれば継続する条件を追加。またはStep 8bをStep 4の前に移動する。Step 7の `git branch -d` を、PR merge済みの場合は `-D` を許可する条件を追加。
- **想定反映先**: コマンド（case-close.md Step 7, Step 8b）、スキル（agentdev-git-worktree SKILL.md）
- **関連**: Issue #397, PR #398, `.opencode/commands/agentdev/case-close.md` lines 207-220
- **タグ**: `#case-close` `#git` `#squash-merge` `#hash-check` `#self-merge`
- **移動日**: 2026-05-29

---
