# 版別差分仕様

本ファイルは、旧構成から配布版の正規構造（references/target-structure.md）への移行差分を定義する。
適用する差分は、install.ps1 -Mode check の検知結果と .agentdev/ 配下の実在配置の観測から決定する。版ラベルではなく観測事実で差分を選択するため、配布版の版番号（src/common/VERSION の値）に依存しない。

## 差分: 統合構成への移行

適用条件: 次のいずれかを観測した場合。

- `.agentdev/blocked/` の存在
- `.agentdev/phase/` の存在
- `.agentdev/intake/`、`.agentdev/learning/`、`.agentdev/inspect/`、`.agentdev/backlog-auto/` のいずれかの存在

### 対応表

| 旧配置 | 新配置 | 取扱い |
|---|---|---|
| `.agentdev/blocked/` | （廃止） | 保留中の事項は追跡Issueとして登録するか、バックログ入力として扱う。ディレクトリ自体はユーザー確認後に削除する |
| `.agentdev/phase/README.md` | `.agentdev/project/README.md` | 移動 |
| `.agentdev/phase/identity.yaml` | `.agentdev/project/identity.yaml` | 移動。キー `undertaking` は `project` へ改名する（`target_version`・`current_phase` は維持） |
| `.agentdev/phase/pending.md` | `.agentdev/project/issue-log.md` | 移動・改名 |
| `.agentdev/phase/themes.md` | `.agentdev/project/themes.md` | 移動 |
| `.agentdev/phase/received/` | `.agentdev/project/received/` | 移動 |
| `.agentdev/phase/transitions/` | `.agentdev/project/phase-gates/` | 移動・改名 |
| `.agentdev/phase/revisions/` | `.agentdev/project/change-log/` | 移動・改名 |
| `.agentdev/phase/adoptions/` | `.agentdev/project/decision-log/` | 移動・改名 |
| `.agentdev/intake/inbox/` | `.agentdev/backlog/intake/inbox/` | 移動 |
| `.agentdev/intake/promoted/` | `.agentdev/backlog/intake/promoted/` | 移動 |
| `.agentdev/learning/inbox/` | `.agentdev/backlog/learning/inbox/` | 移動 |
| `.agentdev/learning/deferred/` | `.agentdev/backlog/learning/deferred/` | 移動 |
| `.agentdev/learning/promoted/` | `.agentdev/backlog/learning/promoted/` | 移動 |
| `.agentdev/learning/evaluation-report.md` | `.agentdev/backlog/learning/evaluation-report.md` | 移動 |
| `.agentdev/inspect/inbox/` | `.agentdev/backlog/inspect/inbox/` | 移動 |
| `.agentdev/inspect/promoted/` | `.agentdev/backlog/inspect/promoted/` | 移動 |
| `.agentdev/backlog-auto/end-to-end/<一式識別子>/set-state.json`（evidence 配下に検証証跡） | `.agentdev/backlog/runs/<一式識別子>/set-state.json` | 移動（evidence/ を含む）。全体完了・リリース完了済みの一式は、継続保存の要否をユーザーと確認し、不要確認後に削除する |
| 上記の移動・改名の後に空になる旧ディレクトリ | （廃止） | 旧痕跡としてユーザー確認後に削除する |
| `.agentdev/install-state.json` | （新設） | 移行後の install.ps1 apply 完了時に記録される（移行操作では作成しない） |

### 移行で更新されない文書

対応表の移動・改名と identity.yaml のキー改名以外に、文書の内容は更新しない。次の文書は移行後も旧配置・旧名称の記述を保持するため、ユーザーの更新が必要な範囲として結果報告で案内する。

| 文書 | 移行後に残る記述 | 現行の名称 |
|---|---|---|
| `.agentdev/README.md` の状態表とディレクトリ構成 | 旧配置 `intake/`、`learning/`、`inspect/`、`phase/`、`backlog-auto/`、`blocked/` | 対応表の新配置（`blocked/` は廃止） |
| `.agentdev/project/README.md` の見出し | `phase/` | `project/` |
| 同「identity.yaml の様式」 | キー `undertaking` | `project` |
| 同「保存モデル」・各様式の節・別セッション再開 | `pending.md`、`adoptions/`、`revisions/`、`transitions/` | `issue-log.md`、`decision-log/`、`change-log/`、`phase-gates/` |
| `.agentdev/project/themes.md` の様式と更新規律の参照先 | `phase/README.md` | `project/README.md` |
| `.agentdev/project/issue-log.md` の様式と更新規律の参照先 | `phase/README.md` | `project/README.md` |

`.agentdev/project/README.md` の現行様式の正本は `agentdev-phase-theme-collaboration` の `templates/project-readme.md` である。

### 引き継ぎの規律

- 移動する情報は内容・処理状態を維持する。ファイルの中身を解釈変換しない
- 廃止対象の内容は移行せず、継続先（追跡Issue・バックログ入力）の扱いをユーザーと確認する
- 対応表にない旧配置は移行せず、観測結果を報告する
