# 用語集

AgentDevFlow で使う用語の定義。

## コマンド

| 用語 | 読み方 | 定義 |
|------|--------|------|
| req-define | レキ、ディファイン | AI と対話して要件を整理するコマンド |
| req-save | レキ、セーブ | 要件doc を REQ/Decision ファイルとして保存するコマンド（REQ/Decision 対象 artifact_actions がある場合） |
| design-save | デザイン、セーブ | 要件doc の Design 保存対象を Design ファイルとして docs/designs/ に保存、確定するコマンド（Design 対象 artifact_actions がある場合） |
| case-open | ケース、オープン | 要件から GitHub Issue を作成するコマンド |
| case-run | ケース、ラン | Issue に基づいて実装し、PR を作成するコマンド |
| case-close | ケース、クローズ | PR をマージし、Issue をクローズするコマンド |
| case-update | ケース、アップデート | Issue の本文更新、コメント追加を行うコマンド |
| intake-capture | インテイク、キャプチャ | 手動で気づき、課題を inbox に記録するコマンド |
| intake-from-github | インテイク、フロム、ギットハブ | クローズ済み Case Issue/PR から改善候補を抽出するコマンド（role: tracking の追跡Issueは抽出対象外） |
| intake-promote | インテイク、プロモート | inbox の項目をレビュー、採用、却下、保留判定し、採用済み成果物に整形するコマンド |
| learning-promote | ラーニング、プロモート | Learning エントリを分析、分類、昇華判定し、採用済み成果物を生成するコマンド |
| backlog-review | バックログ、レビュー | 採用済み成果物を分析、統合し、ユーザー承認後に RU を生成するコマンド |
| backlog-auto | バックログ、オート | backlog 整理サイクル（検出→昇格→統合）を1回で実行するコマンド |
| docs-check | ドックス、チェック | ドキュメント、スキル、コマンドの整合性を検証するコマンド。配布対象外コマンド `/repo/docs-check` に配置し、`/agentdev/*` コマンド体系とは区別する（DEC-001、REQ-010） |
| issue | イシュー | 自然言語の指示から追跡Issueの起票、検索・参照、更新、コメント追加、保留、再評価、実行準備完了、解決、反映確認、クローズ、再オープンを行うコマンド（`/agentdev/issue`）。読み書きは Tool 操作契約経由 |
| inspect-docs | インスペクト、ドックス | docs 全体の意味整合性を検出し、検出事項（finding）を出力するコマンド |
| inspect-skills | インスペクト、スキルズ | Command/Skill 参照妥当性を検出し、検出事項（finding）を出力するコマンド |
| inspect-promote | インスペクト、プロモート | 検出事項（finding）を分類（promote/defer/reject）し、採用済み成果物を生成するコマンド |
| case-auto | ケース、オート | 最大自走モード。req-save → design-save（Design候補がある場合）→ case-open → case-run → case-close を順次実行するコマンド |

## 成果物

| 用語 | 定義 |
|------|------|
| REQ | 要件定義の永続基準。`docs/requirements/REQ-{NNN}.md` に配置 |
| ADR | 取り返しのつかない技術判断の記録。現行基準は `docs/decisions/DEC-{NNN}.md` として管理する。後継関係は `docs/decisions/README.md` の Decision Map を参照 |
| Design | 実装者が参照する現在設計。`docs/designs/**/*.md` に配置（commands/skills/workflows の3層と基盤6ドメイン） |
| Report | 監査・評価・観測の事実記録。`docs/reports/**/*.md` に配置 |
| README | ドキュメント入口、各ディレクトリの索引。`docs/README.md` 等 |
| guides | 利用者向けの参照用読み物。`docs/guides/*.md` に配置 |
| RU（Requirement Unit） | Intake/Learning の採用済み成果物を統合した構造化成果物。`.agentdev/backlog/req-units/RU-*.md` に配置 |
| 採用済み成果物（promoted artifact） | backlog-review の入力となる整形済み成果物。Intake/Learning それぞれの `promoted/` に配置 |
| 追跡Issue（tracking Issue） | 課題、ToDo、アイデア、リスク等の未解決事項の育成管理単位。GitHub Issue を共通管理単位とし、role: tracking として機械判定される。docs/ 配下の文書種別ではなく管理単位・永続状態として扱う（REQ-049）。操作は Tool 操作契約経由 |
| Case Issue（case Issue） | req/case パイプラインの実行票。role: case として機械判定される |
| セッション由来 RU | チャット内で合意形成済みの内容を直接保存した RU |
| evaluation-report | learning-promote 内部で生成される分析レポート。同コマンドの昇華判定フェーズの入力として使用される |
| ローカルIssue（Local Issue） | GitHub Issue/PR を使わない個人利用環境（ローカル版 OpenCode）で Issue/PR 相当の永続情報を保持するファイル。`.agentdev/issues/issue-{NNNN}.md` に配置し、role（tracking/case）ごとの条件付きスキーマを持つ（REQ-009-026）。詳細なスキーマは Design `local-case-file.md`（ローカルIssue共通スキーマ）参照 |

## パイプライン

| 用語 | 定義 |
|------|------|
| Intake パイプライン | 具体的な作業候補を収集、レビュー、採用判断するパイプライン |
| Learning パイプライン | 再発防止の知見を蓄積、分類、昇華するパイプライン |
| Backlog パイプライン | Intake/Learning の採用済み成果物を RU に統合するパイプライン |
| req/case パイプライン | 要件定義から実装、完了までを管理するパイプライン |

## 分類、状態

| 用語 | 定義 |
|------|------|
| work_type | Issue の作業分類（bugfix / feature / maintenance / docs_chore）。参考情報であり、工程分岐（req-save / design-save の要否）は req_draft の `artifact_actions` 存在で判定する |
| 実装分類（Implementation Pattern） | コマンド内部構造の分類軸（wall-session=対話セッション型 / file-pipeline=ファイル変換パイプライン型 / manager-orchestrator=状態機械統制型 / capture-only=データ収集型 / read-only-diagnostic=検査対象を直接修正しない診断型）。work_type とは別概念（workflow-contracts.md） |
| SSoT（Single Source of Truth / 唯一の情報源） | 各フェーズでの信頼できる唯一の情報源 |
| HITL（Human-in-the-loop / 人の判断を挟む） | ユーザーの確認を挟む判断ポイント |
| マクロフェーズ | 壁打ち、構造的実行、レビュー完了の3段階 |
| マイクロフェーズ | requirement / analyzed / created / in_progress / review / done の6状態（説明用ラベルであり、状態管理モデルではない） |
| 検出事項（Finding） | docs-check や case-run で検出された乖離、発見事項 |

## Epic 関連

| 用語 | 定義 |
|------|------|
| Epic | 大規模 Issue を複数の子 Issue に分割した親 Issue |
| Wave | Epic 統率者（Orchestrator）が子 Issue を並列実行する単位 |
| Epic 自動クローズ | 全子 Issue 完了時に親 Epic を自動的にクローズする仕組み |
| ステータス追跡テーブル | Epic 本文内の子 Issue 進捗管理表（未着手/進行中/完了/対処不要/スキップ）。⏭スキップは前提条件未達等で Epic 統率者が設定する終了状態 |

## ツール、スキル

| 用語 | 定義 |
|------|------|
| Command | 実行手順の一次参照。原本は `src/opencode/commands/agentdev/`、配置先は `.opencode/commands/agentdev/` に配置 |
| Skill | 判定基準、共通知識、宣言的ルールの一次参照。原本は `src/opencode/skills/agentdev-*`、配置先は `.opencode/skills/agentdev-*` に配置 |
| Template | Issue/PR 本文の出力構造。Skill 配下 `templates/` に配置 |
| Script | ガードレール、検査、補助処理の実行可能ロジック。Skill 配下 `scripts/` に配置 |
| 原本（source） | `src/opencode/` 配下の正規の定義ファイル。AgentDevFlow 本体の command/skill/template はここに配置される |
| 配置先（projection） | `.opencode/` 配下の実行時の配布先。AgentDevFlow 本体リポジトリではジャンクション/symlink による投影先、適用プロジェクトではインストールスクリプトによる配置先 |

## ローカル版 OpenCode

GitHub Issue/PR を使わない個人利用環境向けの AgentDevFlow 利用形態（REQ-009）に関連する用語。

| 用語 | 定義 |
|------|------|
| ローカル版 OpenCode | GitHub Issue/PR を使わない個人利用環境向けの AgentDevFlow 利用形態。link mode により GitHub 版 AgentDevFlow の原本を `.opencode/` 配下へ接続して利用する |
| 仕様管理リポジトリ | AgentDevFlow 本体リポジトリ（agent-dev-flow）。ローカル版 link 先の原本を保持する |
| 導入先リポジトリ | ローカル版 OpenCode を導入する利用側リポジトリ。`consumer-generated` リポジトリ種別に対応 |
| consumer-generated | ローカル版 OpenCode を導入するリポジトリ種別。`.opencode/tools/agentdev-gh/`（Custom Tool `agentdev_gh` の実行ディレクトリ）が `src/opencode-local/agentdev-gh-cli/`（Local 実装）への link として解決されることで判定される（Design `runtime-package-boundary.md`） |
| `src/opencode-local/` | ローカル版 link 先原本領域。AgentDevFlow 本体リポジトリに配置され、`README.md` と `agentdev-gh-cli/` のみを保持する。IR-047 でディレクトリ構成を検証 |
| link mode | ローカル版導入方式。`.opencode/` 配下を src 配下へ接続し、原本をそのまま利用する。`agentdev-gh-cli` だけを `src/opencode-local/agentdev-gh-cli/` から差し替える |
| link target 確認 | ローカル版 link 設定前に `.opencode/` 配下の各 path が意図した link target へ解決されることを確認する安全機構。意図した target 以外へ解決される場合は link 設定を停止する |
| Local backend | ローカル版 OpenCode のバックエンド区分。GitHub backend（GitHub Issue/PR を使う通常運用）との差分として Design `workflow-contracts.md` で定義される。SSoT は GitHub Issue/PR ではなくローカルIssue（`.agentdev/issues/issue-{NNNN}.md`）となる |
