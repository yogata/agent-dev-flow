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

## 現在像への導線

第4世代（v4）の現在像を定義する基準は次の正規文書である。
ガイドは基準への導線を提供し、基準本文を複製しない。

- 憲章と責務境界: [憲章](charter.md)（基準は [DEC-001](../decisions/DEC-001.md)）
- 三層責務と標準運用モデル: [REQ-088](../requirements/REQ-088.md)、[ADF v4 Operating Model](../designs/foundations/v4-operating-model.md)、[DEC-031](../decisions/DEC-031.md)
- Project Contract の論理ビューと再構成方法: [REQ-088](../requirements/REQ-088.md)、[ADF v4 Operating Model](../designs/foundations/v4-operating-model.md)「Project Contract の論理ビュー」節、[プロジェクトドキュメントと Design](project-docs-and-specs.md)
- 標準入口と標準実行: [クイックスタート](quickstart.md)、[要件定義 → Case実行フロー](req-case-flow.md)。req-define と backlog-auto が要求入口、case-auto が標準実行
- 判断方法と確定権限の分離、人間判断境界: [REQ-096](../requirements/REQ-096.md)、[DEC-048](../decisions/DEC-048.md)
- REQ / Decision / Design / Knowledge / Report / Guide の文書責務: [REQ-001](../requirements/REQ-001.md)、[プロジェクトドキュメントと Design](project-docs-and-specs.md)

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
| [Supervisor 環境向け opencode credential 供給ブリッジ導入](supervisor-credential-bridge.md) | Supervisor 環境での ocenv と opencode bridge shim の導入、検証、失敗署名の対処 |

## リファレンス

成果物、文書体系、用語の定義を確認する読者向け。

| ガイド | 内容 |
|--------|------|
| [成果物、状態モデル](artifacts-and-state.md) | 成果物の種別、配置、ライフサイクル（状態モデル制約、`.agentdev/` の位置づけの正） |
| [プロジェクトドキュメントと Design](project-docs-and-specs.md) | REQ / Decision / Design の関係と文書体系の読み方 |
| [用語集](glossary.md) | AgentDevFlow の用語定義 |
