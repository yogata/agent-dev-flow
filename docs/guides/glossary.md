# 用語集

AgentDevFlow で使う用語の定義。

## コマンド

| 用語 | 読み方 | 定義 |
|------|--------|------|
| req-define | レキ・ディファイン | AI と対話して要件を整理するコマンド |
| req-save | レキ・セーブ | 要件doc を REQ/ADR ファイルとして保存するコマンド（機能追加のみ） |
| case-open | ケース・オープン | 要件から GitHub Issue を作成するコマンド |
| case-run | ケース・ラン | Issue に基づいて実装し、PR を作成するコマンド |
| case-close | ケース・クローズ | PR をマージし、Issue をクローズするコマンド |
| case-update | ケース・アップデート | Issue の本文更新・コメント追加を行うコマンド |
| intake-capture | インテイク・キャプチャ | 手動で気づき・課題を inbox に記録するコマンド |
| intake-from-github | インテイク・フロム・ギットハブ | クローズ済み Issue/PR から改善候補を抽出するコマンド |
| intake-promote | インテイク・プロモート | inbox の item をレビュー・採用・却下・保留判定し、promoted artifact に整形するコマンド |
| learning-promote | ラーニング・プロモート | learning entry を分析・分類・昇華判定し、Requirement Source stub を生成するコマンド |
| backlog-review | バックログ・レビュー | promoted artifact を分析・統合し、ユーザー承認後に RU を生成するコマンド |
| docs-check | ドックス・チェック | ドキュメント・スキル・コマンドの整合性を検証するコマンド（旧称: integrity-check） |
| docs-review | ドックス・レビュー | docs 全体の意味整合レビューと REQ 体系の健全性を診断するコマンド（旧称: req-restructure-review） |

## 成果物

| 用語 | 定義 |
|------|------|
| REQ | 要件定義の永続基準。`docs/requirements/REQ-{NNNN}.md` に配置 |
| ADR | 取り返しのつかない技術判断の記録。現行 baseline は `docs/adr/ADR-01XX.md`（current collection）、再編前は `docs/adr/retired/ADR-00XX.md`（retired collection）。retired ADR は現行根拠として使用しない（REQ-0112-047, 048） |
| SPEC | 実装者が参照する現在仕様。`docs/specs/*.md` に配置 |
| DOC-MAP | 文書探索・参照経路の入口。`docs/DOC-MAP.md` に配置 |
| guides | 利用者向けの参照用読み物。`docs/guides/*.md` に配置 |
| RU（Requirement Unit） | intake/learning の promoted artifact を統合した構造化成果物。`.agentdev/backlog/req-units/RU-*.md` に配置 |
| promoted artifact | backlog-review の入力となる整形済み成果物。intake/learning それぞれの `promoted/` に配置 |
| session-sourced RU | チャット内で合意形成済みの内容を直接保存した RU |
| evaluation-report | learning-promote 内部で生成される分析レポート。同コマンドの昇華判定フェーズの入力として使用される |

## パイプライン

| 用語 | 定義 |
|------|------|
| Intake パイプライン | 具体的な作業候補を収集・レビュー・促進するパイプライン |
| Learning パイプライン | 再発防止の知見を蓄積・分類・昇華するパイプライン |
| Backlog パイプライン | intake/learning の promoted artifact を RU に統合するパイプライン |
| req/case パイプライン | 要件定義から実装・完了までを管理するパイプライン |

## 分類・状態

| 用語 | 定義 |
|------|------|
| work_type | Issue の作業分類（bugfix / feature / maintenance / docs_chore）。経路と docs 更新範囲を決定する。旧称 Pattern（A/B/C/D）は非推奨 |
| SSoT（Single Source of Truth） | 各フェーズでの信頼できる唯一の情報源 |
| HITL（Human-in-the-loop） | ユーザーの確認を挟む判断ポイント |
| マクロフェーズ | 壁打ち・構造的実行・レビュー完了の3段階 |
| マイクロフェーズ | requirement / analyzed / created / in_progress / review / done の6状態（説明用ラベルであり、状態管理モデルではない。REQ-0112-023） |
| Finding | docs-check や case-run で検出された乖離・発見事項 |

## Epic 関連

| 用語 | 定義 |
|------|------|
| Epic | 大規模 Issue を複数の子 Issue に分割した親 Issue |
| Wave | Epic Orchestrator が子 Issue を並列実行する単位 |
| Epic 自動クローズ | 全子 Issue 完了時に親 Epic を自動的にクローズする仕組み |
| ステータス追跡テーブル | Epic 本文内の子 Issue 進捗管理表（未着手/進行中/完了/対処不要/スキップ）。⏭スキップ は前提条件未達等で Orchestrator が設定する終了状態（REQ-0106-030） |

## ツール・スキル

| 用語 | 定義 |
|------|------|
| Command | 実行手順の一次参照。source は `src/opencode/commands/agentdev/`、runtime projection は `.opencode/commands/agentdev/` に配置 |
| Skill | 判定基準・共通知識・宣言的ルールの一次参照。source は `src/opencode/skills/agentdev-*`、runtime projection は `.opencode/skills/agentdev-*` に配置 |
| Template | Issue/PR 本文の出力構造。Skill 配下 `templates/` に配置 |
| Script | ガードレール・検査・補助処理の実行可能ロジック。Skill 配下 `scripts/` に配置 |
| 原本（source） | `src/opencode/` 配下の canonical な定義ファイル。AgentDevFlow 本体の command/skill/template はここに配置される |
| 配置先（projection） | `.opencode/` 配下の runtime 配布先。self-hosting repo では junction/symlink による投影先、consumer では install script による配置先 |
