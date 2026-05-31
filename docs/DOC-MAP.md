# DOC-MAP

> DOC-MAP は文書探索・参照経路の入口であり、要件の基準ではない。基準は active REQ、ADR、SPEC の各ファイルである。

## 基準境界

| 文書種別 | 基準 | 役割 |
|---|---|---|
| active REQ | `requirements/REQ-{NNNN}.md` | 現行要件の永続基準 |
| retired REQ | `requirements/retired/REQ-{NNNN}.md` | 履歴参照。現行要件判断には使わない |
| ADR | `adr/ADR-{NNNN}.md` | アーキテクチャ決定記録 |
| SPEC | `specs/*.md` | 現在仕様 |
| DOC-MAP | このファイル | 文書探索入口 |

## Active REQ

| REQ | タイトル | 概要 |
|---|---|---|
| [REQ-0101](requirements/REQ-0101.md) | 文書・REQ管理基準 | REQ/retired REQ/ADR/SPEC/DOC-MAP/guides の基準境界 |
| [REQ-0102](requirements/REQ-0102.md) | 要件定義・保存 | req-define / req-save / Requirement Source / 分類ゲート |
| [REQ-0103](requirements/REQ-0103.md) | Artifact責任分界 | command / skill / template / script / namespace / implementation pattern 分類 |
| [REQ-0104](requirements/REQ-0104.md) | Workflow / Command Protocol | ワークフロー、Pattern、SSoT、case-open/run/close |
| [REQ-0105](requirements/REQ-0105.md) | Intake / Learning / Backlog | intake、learning、backlog-review、backlog-save、RU lifecycle、session-sourced RU |
| [REQ-0106](requirements/REQ-0106.md) | Case実行・完了 | case-run、case-close、Epic/Wave、完了ゲート |
| [REQ-0107](requirements/REQ-0107.md) | Reporting / Writing Quality | 完了報告、GitHub本文品質、リンク、AI-slop抑止 |
| [REQ-0108](requirements/REQ-0108.md) | Integrity / Validation / Tests | 整合性検査、finding分類・route、レポート出力、ガードレール、体系的テスト、implementation pattern 検査 |
| [REQ-0109](requirements/REQ-0109.md) | REQ再構成運用 | retired archive、移行表、REQ再構成intake |
| [REQ-0110](requirements/REQ-0110.md) | Git worktree 削除リトライ | git-worktree、リトライ、信頼性 |
| [REQ-0111](requirements/REQ-0111.md) | Command authoring 後方互換性維持原則 | command-authoring、後方互換性、設計原則 |

## Retired REQ

旧REQ 50件は [requirements/retired/](requirements/retired/) に移動した。旧REQから新active REQへの移行有無は [mapping-table.md](requirements/mapping-table.md) を参照する。

## Specifications

| SPEC | 内容 |
|---|---|
| [system.md](specs/system.md) | コマンドシステムの構成 |
| [patterns.md](specs/patterns.md) | 実装パターンと文書フォーマット |
| [design-principles.md](specs/design-principles.md) | 設計原則 |
| [quality-specs.md](specs/quality-specs.md) | 品質基準・検証ルール |

## ADR

| Index | 内容 |
|---|---|
| [ADR Index](adr/README.md) | ADR一覧、Status View、Topic View |

## Guides

| Guide | 内容 |
|---|---|
| [ワークフロー概要](guides/workflow-overview.md) | コマンドパイプライン・フェーズ体系・Pattern分類 |
| [成果物モデル](guides/artifact-model.md) | 文書種別・コマンド・スキル・成果物ライフサイクル |
| [ドメイン状態ライフサイクル](guides/domain-state-lifecycle.md) | Learning・Intake・RU・Case・Integrity の状態遷移 |
