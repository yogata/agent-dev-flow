---
description: docs全体の意味整合性を検出し、検出事項を .agentdev/inspect/inbox/ へ出力する
agent: sisyphus
---

# inspect-docs

docs全体（REQ/ADR/SPEC/guides/DOC-MAP）の意味整合性を診断し、検出事項を `.agentdev/inspect/inbox/` へ出力するコマンド。
検査対象を直接修正しない診断を行い、REQ structure review（SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT）に加えて SPEC、ADR、guides、DOC-MAP の意味診断を含む。

## 基本原則: 診断専用（検査対象を直接修正しない）

診断のみを実行する。
許可される副作用は `.agentdev/inspect/inbox/inspect-docs-finding-*.md` の生成、および `.agentdev/inspect/` 配下の git 永続化（commit/ push）のみ。

- 診断結果の提示（検出事項、根拠、source-of-truth判定、推奨route）
- `.agentdev/inspect/inbox/` への検出事項出力
- Issue/PR作成、worktree作成、intake/learning/RU処理の禁止

## 入力

- なし（コマンド実行時に全対象成果物を自動スキャン）

## 出力

- 診断結果（セッション内テキスト出力 + `.agentdev/inspect/inbox/` への検出事項ファイル）
 - 検出事項リスト（観点、対象、根拠、source-of-truth判定、推奨route）

## project doc-inputs

本コマンドは以下の6歩で docs を解決する（ADR-0133）。

1. `.agentdev/config.yaml` を読み込む
2. `.agentdev/doc-inputs/commands/inspect-docs.yaml` を読み込む
3. `must_read` に列挙された paths を読み込む
4. `conditional_read` の条件が該当する場合のみ、当該 paths を読み込む
5. doc-input に列挙されていない `docs/specs/**` 内部パスを固定知識として読みに行かない
6. doc-input が存在しない場合は `config.yaml` の `roots` と明示入力のみを使う

## 手順

### Step 1: スキャン対象の収集

`docs/requirements/`、`docs/adr/`、`docs/specs/`、`docs/guides/`、`docs/DOC-MAP.md`、`README.md`、`.opencode/` を収集
### Step 2: REQ参照ID整合性確認

`agentdev-req-structure-diagnostics` 参照
### Step 3: 第一参照導線確認

`agentdev-req-structure-diagnostics` 参照
### Step 4: 現行/廃止/世代境界確認

`agentdev-req-structure-diagnostics` 参照
### Step 5: SPEC意味診断

SPEC が REQ/ADR/guides の代替、将来計画の混入、実行時依存先としての不適切扱いを確認
### Step 6: ADR意味診断

承認済み ADR のみを現行判断の根拠として扱っているか確認
### Step 7: guides意味診断

guides が navigation layer の範囲を超えていないか確認。履歴混入を検出した場合 route を追加
### Step 8: DOC-MAP意味診断

DOC-MAP が索引の範囲を超えていないか確認。内容過多を検出した場合分割を誘導
### Step 9: REQ structure review（6観点）

SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT。`agentdev-req-structure-diagnostics` 参照
### Step 10: 文書分類一貫性検査

document-model SPEC（doc-input 経由）の classification policy への適合確認。REQ 要件行に schema field、enum 値一覧、route/category/status 判定表、file pattern、テンプレート種別、report format、内部アルゴリズム、作業履歴、実装パラメータ等の SPEC分離基準違反が残留していないかを `agentdev-req-structure-diagnostics` に従って自動検出する
### Step 11: 配布物整合性検査

配布物（`src/opencode/commands/agentdev/`、`src/opencode/skills/agentdev-*/`）について、docs-spec-rebuild-integrity SPEC（doc-input 経由）が定義する検査パターンに従い、構文健全性（frontmatter 重複、見出し重複、Markdown 構文破損）、文意保持（壊れた括弧、壊れた参照表現、主語/目的語欠落文）、責務整合（command 本体と SPEC 間の責務説明照合、case-open/run/close/auto の責務境界一致）を診断する。`agentdev-req-structure-diagnostics` 参照
### Step 12: docs-check route判定

意味的疑いのうち機械的検査に落とせるものを docs-check ルール／検査データ候補として提示
### Step 13: 未処理artifact確認

`agentdev-req-structure-diagnostics` 参照
### Step 14: 検出事項出力

検出事項を `.agentdev/inspect/inbox/inspect-docs-finding-{timestamp}.md` へ出力。
source-of-truth priority: 現行 REQ > 承認済み ADR > SPEC > DOC-MAP/guides。
NG 分類（false positive/ pre-existing/ 今回修正対象）は docs-spec-rebuild-integrity SPEC（doc-input 経由）の NG 分類表に従い、各検出事項に分類、理由、後続対象を付ける
### Step 15: 実行前同期（git pull --ff-only）

 - `git pull --ff-only` を実行
 - **失敗時**: 共通 template (`.opencode/commands/agentdev/templates/common/git-error-messages.md`) の該当形式で表示して停止する（自動解消しない）
### Step 16: .agentdev/inspect/ 変更の commit と push

 - `git diff --name-only` で `.agentdev/inspect/` 配下の変更を確認
 - **変更なし時**: commit/push せず完了報告で「変更なし」と報告
 - **変更あり時**:
 1. `git add` は `.agentdev/inspect/` のみ対象
 2. commit message: `chore(agentdev): capture inspect-docs finding`
 3. `git push` 実行
 4. **push 失敗時**: 共通 template (`.opencode/commands/agentdev/templates/common/git-error-messages.md`) の該当形式で表示して停止する（完了扱いにしない）
### Step 17: 完了報告

完了報告 template に従って出力

## ガードレール

- G01: ファイルを変更、作成、削除しない。ただし `.agentdev/inspect/inbox/inspect-docs-finding-*.md` の生成は例外として許可する
- G02: GitHub Issue/PR を作成、更新しない
- G03: worktree/ブランチを作成しない
- G04: intake/learning/RU の処理を行わない
- G05: source-of-truth priority（現行 REQ > 承認済み ADR > SPEC > DOC-MAP/guides）に従って矛盾を判定する

## エラー処理

| エラー | 対処 |
|--------|------|
| スキャン対象ディレクトリが存在しない | 該当カテゴリを空として扱い、警告を出力 |
| ファイル読込失敗 | 該当ファイルをスキップし、警告を出力 |
| DOC-MAP が存在しない | 該当 step をスキップし、警告を出力 |


