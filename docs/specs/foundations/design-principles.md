---
status: accepted
updated: 2026-06-28
---

# 設計原則

> **SPEC と ADR の境界（REQ-0101-043/044/050）**: 本 SPEC は現行仕様として機能する分類表、導出表（work_type / scale / workflow_route 等）、適用基準を扱う。
> 判断理由、歴史的経緯、設計意図、トレードオフ説明の正本は以下の ADR 群を参照すること（新規 ADR は作成しない、既存 ADR で覆えない内容は本 SPEC の範囲外として報告）。
> - ADR-0103（文書種別責務境界、記述対象境界）
> - ADR-0102（実行時配布物と執筆時関心の分離）
> - ADR-0104（Skill references SPEC 分離基準）
> - ADR-0101（AgentDevFlow プラグイン名前空間の統一）
> **artifact-contracts.md との責任分界**: `../responsibilities/artifact-contracts.md` が Command/Skill/Template/Script の詳細契約（入出力、依存方向）を扱うのに対し、本 SPEC は上位原則と分類規則に限定する。詳細契約の参照先は artifact-contracts.md を優先する。

本プロジェクトの設計判断の根拠を集約した前方視の指針。
どう考えるかを記述し、実装の背景にある意図を明らかにする。

---

## 1. work_type 分類の存在理由

Issue の種別に応じて異なるワークフローを適用する。
work_type と scale の組み合わせで workflow_route を導出する（REQ-0104）。

**bugfix** は既存機能の不具合修正であり、要件定義書（REQ）の作成を不要とする。
バグ修正は観察可能な事実（再現手順、期待動作、実際動作）に基づいて完結するため、壁打ちによる要件形成が不要である。
ただし影響を受ける docs（REQ/ADR/SPEC/guide）の更新は完了条件に含まれる（REQ-0104-034）。
最小限の経路（req-define → case-open → case-run → case-close）で処理する。

**feature** は新しい振る舞いをシステムに導入するため、WHAT（要件）と HOW（実装）の分離が必要である。
壁打ちフェーズでの要件形成、REQ/ADR ファイルの保存、specs 更新など、複数の確認ポイントを経由する経路（req-define → req-save → spec-save（SPEC 候補がある場合）→ case-open → case-run → case-close）を辿る。

**maintenance** はリファクタリング、保守作業向けの軽量経路である。
**docs_chore** はドキュメント、雑務向けの軽量経路である。

### work_type / scale / workflow_route 導出ルール

| work_type | scale | workflow_route | 経路 |
|---|---|---|---|
| bugfix | - | direct_case | req-define → case-open → case-run → case-close |
| feature | standard | req_backed_case | req-define → req-save → spec-save（SPEC 候補がある場合）→ case-open → case-run → case-close |
| feature | large | epic_case | req-define → req-save → spec-save（SPEC 候補がある場合）→ case-open（Epic）→ case-run（Wave）→ case-close |
| maintenance | - | direct_case | req-define → case-open → case-run → case-close |
| docs_chore | - | direct_case | req-define → case-open → case-run → case-close |

---

## 2. 要件と仕様の分離理由

本プロジェクトでは要件（Requirements: WHAT）と仕様（Specifications: HOW）を明確に分離して管理する。

**要件（REQ）** はユーザーの関心を記述する。
システムに対して何が期待されるか、どの条件を満たすべきかを規定する。
要件は領域別の総体として管理し、実装の変化に依存しない安定的な参照点を提供する。

**仕様（docs/specs/）** は実装の現在の姿を記述する。
システムの構造（system.md）、アーティファクト規約（patterns.md）、品質基準（quality-specs.md）、設計方針（design-principles.md）で構成する。
仕様は実装とともに変化する「生きた文書」である。

分離の判断理由、歴史的経緯は ADR-0103（文書種別責務境界）を参照。

### ADR 判断漏れ（false negative）基準

ADR 対象となる判断を REQ/SPEC/guide のみとして扱う判断漏れ（false negative）を防ぐため、以下のリスク指標に該当する内容は ADR 必要性を再評価すること（推奨、REQ-0112-058）。

- REQ/SPEC 境界の曖昧な内容: WHAT と HOW の分離だけでは判断理由が保存されず、後続変更で根拠が失われる可能性がある
- 複数モジュールにまたがる判断: command / skill / script / docs など複数の責務境界に影響し、局所仕様だけではトレードオフを説明できない
- 長期間有効な技術選定: 一時的な仕様ではなく、将来の実装、運用判断を拘束する選定である

予防策として、req-define / req-save は ADR 不要と判断した場合でも除外基準と根拠事実を記録すること。
上記リスク指標のいずれかに該当する場合、`agentdev-adr-guidelines` の閾値と除外基準を再適用し、ADR 不要の理由が技術判断不在、仕様変更のみ等に明確に該当することを確認すること。

---

## 3. バイブコーディングベースの設計判断

本プロジェクトは AI との対話による開発（バイブコーディング）を前提として設計されている。

**実装先行の原則**: 多くの場合、実装が先に存在し、要件は事後的に記録される。
壁打ちフェーズで合意形成を行い、構造的実行フェーズで構造的に実行し、完了時に要件を更新する。

**SSoT の段階的遷移**: 唯一の情報源（SSoT）はフェーズごとに遷移する。
壁打ちフェーズでは壁打ちの成果物、構造的実行フェーズでは Issue 本文と Work Plan、レビュー完了フェーズでは PR とレビュー結果が SSoT となる。

**エージェント責務の分離**: Prometheus（対話系、Plan 策定）と Sisyphus（実行系、ファイル操作）の 2 エージェント体制は、壁打ちフェーズと実行フェーズの認知負荷を分離する。

---

## 4. ツール選定の根拠

本プロジェクトのツールアーキテクチャは OpenCode の Commands/Skills 体系に基づく。

**Commands**: ユーザーが起動する操作のエントリポイント。
frontmatter でエージェント指定、スキル参照を宣言し、本文に手順を記述する薄いディスパッチャーとする。

**Skills**: 再利用可能な知識ベース。
宣言的定義（フェーズ体系、判定基準、命名規則等）を提供し、手続き的ロジックは含まない。
複数コマンドから参照可能な唯一の情報源として機能する。

Command / Skill の責任分界の判断理由、詳細契約は ADR-0107（コマンド・スキル・テンプレート・スクリプト責任分界の正式定義）、`../responsibilities/artifact-contracts.md` を参照。

**gh CLI 安全性**: Windows PowerShell 環境では、WRITE 操作は `--body-file` 経由、READ 操作は一時ファイル経由で Read tool を使用する安全手順を強制する（`agentdev-gh-cli` skill、ADR-0130）。

**git worktree**: Issue 番号ベースの命名規則（`.worktrees/{N}-{type}`）で複数 Issue の同時進行を管理する（`agentdev-git-worktree` skill）。

---

## 5. Command / Skill / Template / Script の責任分界

アーティファクトの責務を 4 種に明確に分ける。

- **Command**: 公開 API と高レベル実行骨格。Input / Output / Guardrails / Steps を定義し、詳細な判断は Skill へ、決定的処理は Script へ委譲する。
- **Skill**: 再利用可能な判断基準と大きな状態機械。宣言的定義（判定基準、フォーマット、ポリシー、状態遷移）を提供し、Command から一方向に参照される。
- **Template**: 出力構造とプレースホルダー。変数置換で使用し、ロジックは含まない。
- **Script**: 決定的でテスト可能な処理。validation、transformation、generation、formatting 等の決定的処理に限定する。

**決定的処理の Script 委譲原則**: Command は決定的処理（採番、整合性確認、エントリ存在確認、変更範囲検証、target_area 見出し検索等）を LLM 推論で実行せず、Script へ委譲する（REQ-0136-029）。

各アーティファクトの詳細契約（入出力、依存方向、サイズ制約、スキル粒度、スキル参照妥当性、サブエージェント委譲、テンプレート配置）、統率スキル（Orchestration skill）作成判断基準は `../responsibilities/artifact-contracts.md` を参照。
責任分界、統率スキル作成基準の判断理由はそれぞれ ADR-0107（コマンド・スキル・テンプレート・スクリプト責任分界の正式定義）、ADR-0108（オーケストレーションスキル作成基準の導入）を参照。

---

## 6. 実行時、執筆関心分離（Runtime / Authoring）

AgentDevFlow の配布物は実行時（runtime: 個別プロジェクトで実行可能）と執筆（authoring: agent-dev-flow リポジトリ開発用）に明確に分離する（ADR-0102）。

**実行時配布物**は自己完結し、agent-dev-flow リポジトリの dev メタデータに依存しないことを保証する:
- Command frontmatter は `description` と `agent` のみ（REQ-0103-015, ADR-0102）
- Skill `references/` は実行時配布物のみを含める（ADR-0104）
- `docs/specs/` は agent-dev-flow リポジトリ専用のリポジトリ内部設計文書であり、実行時配布物の依存先ではない（ADR-0103, ADR-0104）

**執筆専用物**は agent-dev-flow リポジトリ内でのみ参照される:

- command-authoring / skill-authoring ガイド
- docs-check の検査ルール定義

分離の判断理由、歴史的経緯は ADR-0102（実行時 / 編集時 関心分離）を参照。
