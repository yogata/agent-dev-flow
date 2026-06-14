---
description: docs全体の意味整合性をレビューし、是正の推奨アクションを提示する
agent: sisyphus
---

# docs-review

docs全体（REQ/ADR/SPEC/guides/DOC-MAP）の意味整合性をレビューし、是正の推奨アクションを提示する read-only 診断コマンド。従来の req-restructure-review を統合し、REQ structure review に加えて SPEC・ADR・guides・DOC-MAP の意味レビューを含む。

## 基本原則: 診断専用（Read-Only）

**診断のみを実行し、一切の副作用を伴わない。**

- ✅ 診断結果の提示（finding、根拠、source-of-truth判定、推奨route、req-define入力案）
- ✅ ユーザーへの対話的な結果説明
- ❌ ファイルの変更・作成・削除
- ❌ GitHub Issue/PR の作成・更新
- ❌ worktree/ブランチの作成
- ❌ intake/learning/RU の処理

## Input

- なし（コマンド実行時に全対象 artifact を自動スキャン）

## Output

- 診断結果（セッション内テキスト出力のみ、ファイル出力なし）
  - finding リスト（観点、対象、根拠、source-of-truth判定、推奨route）
  - 推奨アクション
  - req-define入力案（必要な場合のみ）

## Steps

### 1. スキャン対象の収集

以下の artifact を収集する:

| カテゴリ | 対象パス | 収集方法 |
|----------|----------|----------|
| active REQ ファイル | `docs/requirements/REQ-*.md` | `glob` |
| retired REQ ファイル | `docs/requirements/retired/REQ-*.md` | `glob` |
| mapping-table | `docs/requirements/mapping-table.md` | `Read` |
| ADR ファイル | `docs/adr/ADR-*.md` | `glob` |
| SPEC ファイル | `docs/specs/*.md` | `glob` |
| guides ファイル | `docs/guides/*.md` | `glob` |
| DOC-MAP | `docs/DOC-MAP.md` | `Read` |
| README | `README.md` | `Read` |
| requirements README | `docs/requirements/README.md` | `Read` |
| .opencode 設定 | `.opencode/commands/**/*.md`, `.opencode/skills/*/SKILL.md` | `glob` |
| intake inbox | `.agentdev/intake/inbox/` | `glob` |
| learning inbox | `.agentdev/learning/inbox.md` | `Read` |

各ファイルの内容を `Read` tool で読み込む。ファイルが存在しないカテゴリは空として扱い、警告を出力する。

### 2. REQ参照ID整合性確認

診断ロジックは `agentdev-req-structure-diagnostics` を参照

### 3. 第一参照導線確認

診断ロジックは `agentdev-req-structure-diagnostics` を参照

### 4. active/retired/世代境界確認

診断ロジックは `agentdev-req-structure-diagnostics` を参照

### 5. SPEC意味レビュー

REQ / ADR / guides の代替、新規要件・将来計画・ADR判断根拠・guide相当説明の混在、runtime command/skillの実行時依存先としての扱いを確認する:
- SPEC が REQ に含まれるべき要件を定義していないか
- SPEC が ADR 判断根拠を代替していないか
- SPEC が guide の navigation 情報を代替していないか
- 新規要件・将来計画が SPEC に混在していないか

### 6. ADR意味レビュー

ADR の status に基づく権限境界を確認する:
- accepted ADR のみを現在判断の根拠として扱っているか
- proposed/deprecated/superseded ADR を履歴または候補として扱っているか
- 非 accepted ADR を現行要件の根拠として引用していないか

### 7. guides意味レビュー

 guides が navigation layer の範囲を超えていないか確認する:
- 強制条件に相当する規範を持っていないか
- guides が REQ/SPEC の基準を代替していないか
- 規範的内容は REQ または SPEC に委譲すべきか
- 履歴混入（historical content mixed into current sections）を検出した場合、該当セクションの route を追加して修正を誘導する（REQ-0115-041）

### 8. DOC-MAP意味レビュー

DOC-MAP が索引の範囲を超えていないか確認する:
- 索引を超えて基準内容を代替していないか
- 基準の実体は REQ/ADR/SPEC にあり、DOC-MAP は探索導線に徹しているか
- summary/index 文書の内容過多（summary 本体が 100 行を超える等）を検出した場合、該当セクションの route を追加して分割を誘導する（REQ-0115-042）
- 各エントリは 1 行（リンク + 1 行説明）に制限することが推奨される（REQ-0115-043）

### 9. REQ structure review（6観点）

診断ロジック・検出シグナル・シグナル閾値は `agentdev-req-structure-diagnostics` を参照

観点: SPLIT / MERGE / MOVE / DUPLICATE / RETIRE / DRIFT

### 10. 文書分類一貫性検査

全ドキュメントが `docs/specs/document-model.md` の Document Classification Policy（REQ/ADR/SPEC/Guide/Report/DOC-MAP）に正しく分類されているか検査する:
- 各ドキュメントの宣言分類が classification policy に適合しているか
- ドキュメント内容が宣言分類に一致しているか
- ドキュメント間の相互参照が分類階層を尊重しているか

read-only 診断ステップであり、ファイルの変更は行わない。

### 11. docs-check route判定

意味的疑いのうち機械的検査に落とせるものを docs-check rule/fixture 候補として提示する:
- 反復的に発生する finding パターンを特定
- 機械的検査可能なルールとして表現できるか評価
- 候補として提示（実装はしない）

### 12. 未処理artifact確認

診断ロジックは `agentdev-req-structure-diagnostics` を参照

### 13. 診断結果の出力

source-of-truth priority:
1. active REQ
2. accepted ADR
3. SPEC
4. DOC-MAP / guides

出力構成:
- finding（観点、対象、根拠、source-of-truth判定、推奨route）
- 推奨route先: `/agentdev/req-define`、RU化、case-update、docs-check rule追加、learning/backlog
- req-define入力案（必要な場合のみ）

問題候補出力スキーマは `agentdev-req-structure-diagnostics` を参照

### 14. 完了報告

完了報告 → 完了報告templateに従って出力。template: .opencode/commands/agentdev/templates/docs-review/standard.md

## Guardrails

### Read-Only 制約
- G01: ファイルを変更・作成・削除しない。診断結果はセッション内テキスト出力のみ
- G02: GitHub Issue/PR を作成・更新しない
- G03: worktree/ブランチを作成しない

### 出力制約
- G04: intake item の処理・learning refine/promote・RU 生成を行わない
- G05: 出力は finding + 根拠 + source-of-truth判定 + 推奨route + req-define入力案に限定する

### 判定制約
- G06: source-of-truth priority（active REQ > accepted ADR > SPEC > DOC-MAP/guides）に従って矛盾を判定する

## Error Handling

| エラー | 対処 |
|--------|------|
| スキャン対象ディレクトリが存在しない | 該当カテゴリを空として扱い、警告を出力 |
| ファイル読込失敗 | 該当ファイルをスキップし、警告を出力 |
| mapping-table が存在しない | Step 4 をスキップし、警告を出力 |
| DOC-MAP が存在しない | Step 3, 8 をスキップし、警告を出力 |
| .agentdev/ 配下が存在しない | Step 12 をスキップし、「未処理artifact確認: 対象なし」と報告 |
