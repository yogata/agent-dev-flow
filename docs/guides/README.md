# AgentDevFlow ガイド

利用者向けの参照用読み物（案内層）。
基準は各 REQ/Decision/Design ファイルであり、ガイドは基準への導線を提供する。
基準文書と矛盾する記述がある場合は基準を優先する。

> **案内層**: ガイドは人間向けの案内、探索支援を目的とする（REQ-001、DEC-001 charter 原則）。
> REQ/Decision/Design の内容は基準文書を参照する。

## 読む順の案内

初めて利用する場合は「はじめて」を上から読み、導入を検討する時点で「導入」を参照する。
日常の運用や問題の調査では「運用、診断」から目的に合うガイドを選ぶ。
成果物、文書体系、用語の定義を調べる場合は「リファレンス」を参照する。

## はじめて

初めて AgentDevFlow を使う読者向け。最初の1冊はクイックスタート。

| ガイド | 内容 |
|--------|------|
| [クイックスタート](quickstart.md) | 要件定義からマージまでの標準フロー |
| [コマンド選択](command-selection.md) | 現在の状態から次のコマンドを選ぶ入口表 |
| [要件定義 → Case実行フロー](req-case-flow.md) | req-define から case-close までの流れ |

## 導入

目的、責務境界、導入方式を確認する読者向け。

| ガイド | 内容 |
|--------|------|
| [憲章](charter.md) | 目的、責務境界、hard governance の限定、新規統制追加原則 |
| [Consumer Project 導入](consumer-project-setup.md) | AgentDevFlow の適用プロジェクト導入手順 |

## 運用、診断

日常の運用やパイプラインの利用、診断を行う読者向け。

| ガイド | 内容 |
|--------|------|
| [Intake / Learning / Backlog フロー](intake-learning-backlog-flow.md) | 作業候補、学びの収集から RU 生成まで（追跡Issue の別系統を含む） |
| [診断、メンテナンス](diagnostics-and-maintenance.md) | docs-check / inspect 系コマンド |
| [トラブルシューティング](troubleshooting.md) | よくある問題と対処法 |

## リファレンス

成果物、文書体系、用語の定義を確認する読者向け。

| ガイド | 内容 |
|--------|------|
| [成果物、状態モデル](artifacts-and-state.md) | 成果物の種別、配置、ライフサイクル（状態モデル制約、`.agentdev/` の位置づけの正） |
| [プロジェクトドキュメントと Design](project-docs-and-specs.md) | REQ / Decision / Design の関係と文書体系の読み方 |
| [用語集](glossary.md) | AgentDevFlow の用語定義 |
