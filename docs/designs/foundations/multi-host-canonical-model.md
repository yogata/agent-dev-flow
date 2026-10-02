---
title: マルチホスト正本モデル（共通正本とホスト別接続の分離）
status: accepted
created: 2026-10-02
updated: 2026-10-02
---
<!-- ADF-COVERS(design): REQ-099-001, REQ-099-002, REQ-099-003, REQ-099-004, REQ-099-005, REQ-099-006, REQ-099-007, REQ-099-008, REQ-099-009, REQ-099-010, REQ-099-011, REQ-099-012, REQ-099-013, REQ-099-014, REQ-099-015, REQ-099-016, REQ-099-017, REQ-099-018, REQ-099-019, REQ-099-020 -->
<!-- ADF-COVERS(design): REQ-002-007, REQ-002-008, REQ-002-009, REQ-002-019, REQ-002-043, REQ-002-045, REQ-002-047（REQ-002-047 の配備形態面。配布依存境界の検査モデル面は runtime-package-boundary.md が維持） -->
<!-- ADF-COVERS(design): REQ-009-015, REQ-009-016, REQ-009-019, REQ-009-020, REQ-009-036, REQ-009-040, REQ-009-042（link 元正本・installer 配置対象選択面。実行手順詳細は runtime-package-boundary.md・install-script-usability.md が維持） -->
<!-- ADF-COVERS(design): REQ-018-001（構造系テスト fallback の fallback 先を共通正本へ更新する面） -->
<!-- ADF-COVERS(design): REQ-045-001（監査対象パスの新構成対応面） -->

# マルチホスト正本モデル（共通正本とホスト別接続の分離）

## 目的

ADF 共通正本（src/common/）とホスト別接続領域（src/opencode/、src/senpi/）の配置契約、投影モデル、バックエンド×ホスト接続構成、guard 編集解釈の分離を定義する。REQ-099（マルチホスト併存）の実現構造を所有し、意思決定の正本は「ADF 共通正本とホスト接続領域の分離」Decision が所有する。

## 共通正本領域の配置契約（src/common/）

- 共通の Workflow Skill、Capability Skill、Command の業務契約・本文、template、共有可能な Tool engine（agentdev_gh の GitHub 実装と Local 実現、agentdev_jev、agentdev_third_party の engine 部）、guard の共通判定を配置する。
- 共通正本は host 非依存とし、配布物の harness 非依存性（harness 分離モデル Design）に従う。ホスト名、起動 API、実行制御パラメータを本文に固定しない。
- ホスト別コピーの業務手順を独立編集する構造を持たない。両ホストの公開入口は同じ業務契約を参照する。

## ホスト接続領域の配置契約（src/opencode/、src/senpi/）

- 公開入口（Command の薄い接続）、Tool 登録、plugin/hook または extension、引数・結果・実行 context の変換を配置する。
- ホスト固有の起動 API、category／agent 選定、通知・継続・取消の扱い、品質実行入口は、限定された実行設定・reference に集約する。
- OpenCode 用 plugin/hook の正本は src/opencode/plugins/ 配下（REQ-002-045）。他ホスト用は当該ホスト接続領域に同等の位置づけで配置する。

## 投影モデルと installer 対象選択

- installer（scripts/install.ps1、scripts/self-sync.ps1）は単一公開入口と check/dry-run/apply を維持し、配置対象ホスト（OpenCode のみ、Senpi のみ、両方）を選択可能とする。新規導入は両方を推奨し、既存導入の更新は現在の配置対象を維持し、明示指定により変更する。
- 共通正本への投影は同一 ADF 版に整合させる。ホスト別の管理範囲を分離し、片方の更新・除去は他方を壊さない。repo-local 資産（third-party Skill 配置、.agentdev/extensions/**）とユーザー設定（AGENTS.md の harness 選定記述等）を書込み対象から保護する。再実行は冪等とし、不要な登録を増やさない。
- CLI 未導入でも配置可能とし、配置検査と実行環境の診断を区別する。OmO 版は診断・互換確認にのみ使用する。

## バックエンド×ホスト接続構成

- 接続境界（seam）は Custom Tool 操作契約（GhRunner 型、contracts.ts の16操作）に限定する。GitHub 実装と Local 実現の差し替えモデル（DEC-004、REQ-009-015/020）を両ホストへ適用し、新たなバックエンド抽象層と GitHub 互換ローカルサーバを導入しない（REQ-009-035）。
- ローカルIssueの採番・状態写像・読み書きは共通の操作契約と検証 engine に接続し、ホスト別重複を実装しない。
- 選択したバックエンドに接続し、同じ Tool 名で両バックエンドを同時有効化しない（REQ-009-037 の同居対象外と、Custom Tool の Local 実現への差し替えは同居に非ずの既存解釈を維持）。

## guard 編集解釈の分離

- guard の共通判定は共通正本側が所有し、ホスト接続側は当該ホストの編集操作（write/edit/patch 等）の意味論を解釈して共通判定へ接続する。入力キーの機械的な変更だけで編集意味論を同一と扱わない。
- 拒否時に副作用を発生させず、正常操作を正しく許可し、検査不能を成功扱いしない（fail-closed）。配布用と ADF 自己ホスト用の適用範囲を維持する。

## Command 対応表

- 両ホストで業務名（req-define、case-auto 等）と引数の意味を維持する。表記が異なる場合は対応表を提供し、展開テストで同じ Workflow Skill への到達を確認する。

## 関連

- REQ-099（マルチホスト併存）: 成果定義の正規所有者
- Decision「ADF 共通正本とホスト接続領域の分離」（DEC-049）: 意思決定の正本
- harness-separation-model.md: harness 分離原則、配布物の harness 非依存性
- runtime-package-boundary.md、install-script-usability.md: link mode・installer 実行詳細
- distribution-boundary.md: 配布依存境界の検査モデル
