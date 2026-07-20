# 用語集

AgentDevFlow で使う用語の定義。

## コマンド

| 用語 | 読み方 | 定義 |
|------|--------|------|
| req-define | レキ、ディファイン | AI と対話して要件を整理するコマンド |
| req-save | レキ、セーブ | 要件doc を REQ/ADR ファイルとして保存するコマンド（機能追加のみ） |
| case-open | ケース、オープン | 要件から GitHub Issue を作成するコマンド |
| case-run | ケース、ラン | Issue に基づいて実装し、PR を作成するコマンド |
| case-close | ケース、クローズ | PR をマージし、Issue をクローズするコマンド |
| case-update | ケース、アップデート | Issue の本文更新、コメント追加を行うコマンド |
| intake-capture | インテイク、キャプチャ | 手動で気づき、課題を inbox に記録するコマンド |
| intake-from-github | インテイク、フロム、ギットハブ | クローズ済み Issue/PR から改善候補を抽出するコマンド |
| intake-promote | インテイク、プロモート | inbox の項目をレビュー、採用、却下、保留判定し、採用済み成果物に整形するコマンド |
| learning-promote | ラーニング、プロモート | Learning エントリを分析、分類、昇華判定し、採用済み成果物を生成するコマンド |
| backlog-review | バックログ、レビュー | 採用済み成果物を分析、統合し、ユーザー承認後に RU を生成するコマンド |
| docs-check | ドックス、チェック | ドキュメント、スキル、コマンドの整合性を検証するコマンド（旧称: integrity-check）。配布対象外コマンド `/repo/docs-check` に配置し、`/agentdev/*` コマンド体系とは区別する（ADR-0106, REQ-0108-156） |
| inspect-docs | インスペクト、ドックス | docs 全体の意味整合性を検出し、検出事項（finding）を出力するコマンド（旧称: req-restructure-review, docs-review, diagnostics-docs） |
| case-auto | ケース、オート | 最大自走モード。req-save → spec-save（SPEC候補がある場合）→ case-open → case-run → case-close を順次実行するコマンド |

## 成果物

| 用語 | 定義 |
|------|------|
| REQ | 要件定義の永続基準。`docs/requirements/REQ-{NNNN}.md` に配置 |
| ADR | 取り返しのつかない技術判断の記録。現行基準は `docs/adr/ADR-01XX.md`（現行の番号帯）。再編前の ADR-00XX 番号帯は物理削除済み（REQ-0112-047, 048）。後継関係は `docs/adr/README.md` の Decision Map を参照 |
| SPEC | 実装者が参照する現在仕様。`docs/specs/**/*.md` に配置（commands/skills/workflows の3層と基盤6ドメイン） |
| DOC-MAP | 文書探索、参照経路の入口。`docs/DOC-MAP.md` に配置 |
| guides | 利用者向けの参照用読み物。`docs/guides/*.md` に配置 |
| RU（Requirement Unit） | Intake/Learning の採用済み成果物を統合した構造化成果物。`.agentdev/backlog/req-units/RU-*.md` に配置 |
| 採用済み成果物（promoted artifact） | backlog-review の入力となる整形済み成果物。Intake/Learning それぞれの `promoted/` に配置 |
| セッション由来 RU | チャット内で合意形成済みの内容を直接保存した RU |
| evaluation-report | learning-promote 内部で生成される分析レポート。同コマンドの昇華判定フェーズの入力として使用される |
| ローカル Case ファイル（Local Case File） | GitHub Issue/PR を使わない個人利用環境（ローカル版 OpenCode）で Issue/PR 相当の永続情報を保持するファイル。`.agentdev/cases/case-{NNNN}.md` に配置（REQ-0141-016）。詳細なスキーマは SPEC `local-case-file.md` 参照 |

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
| work_type | Issue の作業分類（bugfix / feature / maintenance / docs_chore）。経路と docs 更新範囲を決定する。旧称 Pattern（A/B/C/D）は非推奨、廃止済み |
| 実装分類（Implementation Pattern） | コマンド内部構造の分類軸（wall-session=対話セッション型 / file-pipeline=ファイル変換パイプライン型 / manager-orchestrator=状態機械統制型 / capture-only=データ収集型 / read-only-diagnostic=検査対象を直接修正しない診断型）。旧称 Pattern（A/B/C/D）= work_type とは別概念（REQ-0103-016, workflow-contracts.md） |
| SSoT（Single Source of Truth / 唯一の情報源） | 各フェーズでの信頼できる唯一の情報源 |
| HITL（Human-in-the-loop / 人の判断を挟む） | ユーザーの確認を挟む判断ポイント |
| マクロフェーズ | 壁打ち、構造的実行、レビュー完了の3段階 |
| マイクロフェーズ | requirement / analyzed / created / in_progress / review / done の6状態（説明用ラベルであり、状態管理モデルではない。REQ-0112-023） |
| 検出事項（Finding） | docs-check や case-run で検出された乖離、発見事項 |

## Epic 関連

| 用語 | 定義 |
|------|------|
| Epic | 大規模 Issue を複数の子 Issue に分割した親 Issue |
| Wave | Epic 統率者（Orchestrator）が子 Issue を並列実行する単位 |
| Epic 自動クローズ | 全子 Issue 完了時に親 Epic を自動的にクローズする仕組み |
| ステータス追跡テーブル | Epic 本文内の子 Issue 進捗管理表（未着手/進行中/完了/対処不要/スキップ）。⏭スキップは前提条件未達等で Epic 統率者が設定する終了状態（REQ-0106-030） |

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

GitHub Issue/PR を使わない個人利用環境向けの AgentDevFlow 利用形態（REQ-0141, ADR-0131）に関連する用語。

| 用語 | 定義 |
|------|------|
| ローカル版 OpenCode | GitHub Issue/PR を使わない個人利用環境向けの AgentDevFlow 利用形態（REQ-0141-001）。link mode により GitHub 版 AgentDevFlow の原本を `.opencode/` 配下へ接続して利用する（ADR-0131） |
| 仕様管理リポジトリ | AgentDevFlow 本体リポジトリ（agent-dev-flow）。ローカル版 link 先の原本を保持する（REQ-0141-002） |
| 導入先リポジトリ | ローカル版 OpenCode を導入する利用側リポジトリ。`consumer-generated` リポジトリ種別に対応（REQ-0141-002） |
| consumer-generated | ローカル版 OpenCode を導入するリポジトリ種別。`.opencode/skills/agentdev-gh-cli/` が `src/opencode-local/agentdev-gh-cli/` への link として解決されることで判定される（SPEC `runtime-package-boundary.md`, ADR-0131） |
| `generated_by` 識別子 | ADR-0126 時代のローカル版生成物に付与された識別情報。値は `local-opencode-transform`。link mode への移行後は付与されず、上書き保護も廃止された（ADR-0131 decision #5）。IR-046/048 は link mode 移行前の生成物が混在する環境向けの整合性検証語彙として残る |
| `src/opencode-local/` | ローカル版 link 先原本領域。AgentDevFlow 本体リポジトリに配置され、`README.md` と `agentdev-gh-cli/` のみを保持する（REQ-0141-004, 005）。IR-047 でディレクトリ構成を検証 |
| link mode | ローカル版導入方式。`.opencode/` 配下を src 配下へ接続し、原本をそのまま利用する。`agentdev-gh-cli` だけを `src/opencode-local/agentdev-gh-cli/` から差し替える（ADR-0131, REQ-0141-007） |
| link target 確認 | ローカル版 link 設定前に `.opencode/` 配下の各 path が意図した link target へ解決されることを確認する安全機構（REQ-0141-010, ADR-0131 decision #6）。意図した target 以外へ解決される場合は link 設定を停止する |
| Local backend | ローカル版 OpenCode のバックエンド区分。GitHub backend（GitHub Issue/PR を使う通常運用）との差分として SPEC `workflow-contracts.md` で定義される。SSoT は GitHub Issue/PR ではなくローカル Case ファイル（`.agentdev/cases/case-{NNNN}.md`）となる |
