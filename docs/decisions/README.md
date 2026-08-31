# 意思決定記録（Decision）

意思決定記録（Decision）のインデックス。
現行 Decision は `DEC-NNN`（3桁ゼロ埋め）のIDを使用し、過去版の ADR は tag `v2.11.0` と `v2:ADR-*` 表記で区別する（AG-010）。

## 現行 Decision

基本原則、管理方式、リリース条件は DEC-001 を基準とする。
個別 REQ/Design は憲章の原則へ照らして位置づく。

<!-- AUTOGEN:BEGIN:id=decision-baseline-count -->
現行の承認済み Decision は15件、提案中の Decision は7件である。
<!-- AUTOGEN:END -->

<!-- AUTOGEN:BEGIN:id=decision-baseline-table -->
| Decision番号 | タイトル | ステータス | 作成日 |
|---------|---------|-----------|--------|
| DEC-001 | AgentDevFlow 憲章 | accepted | 2026-07-24 |
| DEC-002 | OpenCode ソース・プロジェクション分離 | accepted | 2026-07-25 |
| DEC-003 | req_draft ソフトコントラクト原則 | accepted | 2026-07-25 |
| DEC-004 | 差し替え可能な I/O 境界 | accepted | 2026-07-25 |
| DEC-005 | Project Extensions Architecture | superseded | 2026-07-25 |
| DEC-006 | inspect 3-command 構成への正規化 | accepted | 2026-07-27 |
| DEC-007 | Artifact Graph 標準化と配布スキル昇格 | superseded | 2026-08-08 |
| DEC-008 | case-auto の限定的親判断解決（bounded parent decision resolution） | accepted | 2026-08-09 |
| DEC-009 | ADR から Decision への正規成果物モデル移行 | accepted | 2026-08-10 |
| DEC-010 | Command / Workflow Skill / Capability Skill 責務3層分化と1:N分割原則 | accepted | 2026-08-10 |
| DEC-011 | STEP resume point と会話記憶非依存 | accepted | 2026-08-10 |
| DEC-012 | Extension を file-kind から workflow/capability responsibility へ再編 | accepted | 2026-08-10 |
| DEC-013 | IR 登録モデルの簡素化 — 現存 IR を実行可能な恒久統制に限定 | accepted | 2026-08-11 |
| DEC-014 | 配布依存境界の多層 enforcement | accepted | 2026-08-11 |
| DEC-015 | ADF決定論的実行中核と実行基盤実行機構の責務分界 | accepted | 2026-08-15 |
| DEC-016 | 導入系スクリプトの副作用ゼロ原則 | accepted | 2026-08-15 |
| DEC-017 | 最小トレーサビリティモデルの採用と Artifact Graph の廃止 | accepted | 2026-08-17 |
| DEC-018 | 評価ブランチモデルとCase統合先の一般化 | proposed | 2026-08-19 |
| DEC-019 | 一般処理の標準API委譲とADF固有意味論の所有境界 | proposed | 2026-08-20 |
| DEC-020 | GitHub Issue 共通管理単位の採用 | proposed | 2026-08-23 |
| DEC-021 | scripts 公開入口の2本固定と安定契約 | proposed | 2026-08-23 |
| DEC-022 | 実行定義層の正規所有モデルと機械強制への移行 | proposed | 2026-08-24 |
| DEC-023 | third-party Skill の分離管理と取得機構の導入 | proposed | 2026-08-30 |
| DEC-024 | 変更誘発境界リスク分析の導入と検証契約への投影 | proposed | 2026-08-31 |
<!-- AUTOGEN:END -->

- [利用者向け要約（charter.md）](../guides/charter.md)

> この README は分類ビューであり、Decision 本文のSSoTではない（AG-014）。
> 基準は各 Decision ファイルである（REQ-001）。

## ステータス別ビュー

### 承認済み（accepted）

<!-- AUTOGEN:BEGIN:id=decision-status-accepted -->
- [DEC-001](DEC-001.md)（AgentDevFlow 憲章）
- [DEC-002](DEC-002.md)（OpenCode ソース・プロジェクション分離）
- [DEC-003](DEC-003.md)（req_draft ソフトコントラクト原則）
- [DEC-004](DEC-004.md)（差し替え可能な I/O 境界）
- [DEC-006](DEC-006.md)（inspect 3-command 構成への正規化）
- [DEC-008](DEC-008.md)（case-auto の限定的親判断解決（bounded parent decision resolution））
- [DEC-009](DEC-009.md)（ADR から Decision への正規成果物モデル移行）
- [DEC-010](DEC-010.md)（Command / Workflow Skill / Capability Skill 責務3層分化と1:N分割原則）
- [DEC-011](DEC-011.md)（STEP resume point と会話記憶非依存）
- [DEC-012](DEC-012.md)（Extension を file-kind から workflow/capability responsibility へ再編）
- [DEC-013](DEC-013.md)（IR 登録モデルの簡素化 — 現存 IR を実行可能な恒久統制に限定）
- [DEC-014](DEC-014.md)（配布依存境界の多層 enforcement）
- [DEC-015](DEC-015.md)（ADF決定論的実行中核と実行基盤実行機構の責務分界）
- [DEC-016](DEC-016.md)（導入系スクリプトの副作用ゼロ原則）
- [DEC-017](DEC-017.md)（最小トレーサビリティモデルの採用と Artifact Graph の廃止）
<!-- AUTOGEN:END -->

### 提案中（proposed）

<!-- AUTOGEN:BEGIN:id=decision-status-proposed -->
- [DEC-018](DEC-018.md)（評価ブランチモデルとCase統合先の一般化）
- [DEC-019](DEC-019.md)（一般処理の標準API委譲とADF固有意味論の所有境界）
- [DEC-020](DEC-020.md)（GitHub Issue 共通管理単位の採用）
- [DEC-021](DEC-021.md)（scripts 公開入口の2本固定と安定契約）
- [DEC-022](DEC-022.md)（実行定義層の正規所有モデルと機械強制への移行）
- [DEC-023](DEC-023.md)（third-party Skill の分離管理と取得機構の導入）
- [DEC-024](DEC-024.md)（変更誘発境界リスク分析の導入と検証契約への投影）
<!-- AUTOGEN:END -->

### 置き換え済み（superseded）

<!-- AUTOGEN:BEGIN:id=decision-status-superseded -->
- [DEC-005](DEC-005.md)（Project Extensions Architecture）
- [DEC-007](DEC-007.md)（Artifact Graph 標準化と配布スキル昇格）
<!-- AUTOGEN:END -->

### 非推奨（deprecated）

<!-- AUTOGEN:BEGIN:id=decision-status-deprecated -->
<!-- AUTOGEN:END -->

## トピック別ビュー

### 憲章・基本原則

- [DEC-001](DEC-001.md)（AgentDevFlow 憲章、hard governance の限定、新規統制追加原則）
- [DEC-009](DEC-009.md)（ADR から Decision への正規成果物モデル移行）
- [DEC-010](DEC-010.md)（Command / Workflow Skill / Capability Skill 責務3層分化と1:N分割原則）

### 配布基盤・ソースモデル

- [DEC-002](DEC-002.md)（OpenCode ソース・プロジェクション分離）
- [DEC-004](DEC-004.md)（差し替え可能な I/O 境界）
- [DEC-005](DEC-005.md)（Project Extensions Architecture、superseded by DEC-006）
- [DEC-006](DEC-006.md)（inspect 3-command 構成への正規化、extension 検査の3層責務分離）
- [DEC-007](DEC-007.md)（Artifact Graph 標準化と配布スキル昇格）
- [DEC-012](DEC-012.md)（Extension を file-kind から workflow/capability responsibility へ再編）
- [DEC-014](DEC-014.md)（配布依存境界の多層 enforcement、IR-059 範囲と enforcement 経路の変更）
- [DEC-016](DEC-016.md)（導入系スクリプトの副作用ゼロ原則、provisioning 責務の利用者移転）
- [DEC-017](DEC-017.md)（最小トレーサビリティモデルの採用と Artifact Graph の廃止、要件中心の最小 TIM と agentdev-traceability への置換）
- [DEC-021](DEC-021.md)（scripts 公開入口の2本固定と安定契約、公開入口の構造境界と入口名の安定性）
- [DEC-023](DEC-023.md)（third-party Skill の分離管理と取得機構の導入、第三区分所有境界と参照点集約）

### ワークフロー・委譲契約

- [DEC-003](DEC-003.md)（req_draft ソフトコントラクト原則）
- [DEC-008](DEC-008.md)（case-auto の限定的親判断解決、bounded parent decision resolution）
- [DEC-011](DEC-011.md)（STEP resume point と会話記憶非依存）
- [DEC-015](DEC-015.md)（ADF決定論的実行中核と実行基盤実行機構の責務分界、処理単位と状態機械の選択的適用）
- [DEC-018](DEC-018.md)（評価ブランチモデルとCase統合先の一般化、実証・評価ワークフローと統合先基準の統一）
- [DEC-019](DEC-019.md)（一般処理の標準API委譲とADF固有意味論の所有境界、YAML 構文解析・再帰ファイル探索・CLI 引数解析の標準 API 委譲）
- [DEC-020](DEC-020.md)（GitHub Issue 共通管理単位の採用、追跡Issueと Case Issue の役割分離と論理スキーマ一元管理）
- [DEC-024](DEC-024.md)（変更誘発境界リスク分析の導入と検証契約への投影、case-specific risk を品質プロセスの第一級入力とする原則）

### 整合性・IR 体系

- [DEC-013](DEC-013.md)（IR 登録モデルの簡素化、tombstone 廃止 + lifecycle/enforcement/baseline_status 除去）

Decision Map（現行 Decision と過去版 ADR の履歴上の関連）。

| Decision | 関係 | 対象 | 説明 |
|-----|------|------|------|
| DEC-002 | relates-to | v2:ADR-0105 | source/projection 分離に関する過去版の決定 |
| DEC-003 | relates-to | v2:ADR-0124 | req_draft ソフトコントラクトに関する過去版の決定 |
| DEC-004 | relates-to | v2:ADR-0130 | 差し替え可能な I/O 境界に関する過去版の決定 |
| DEC-005 | relates-to | v2:ADR-0135 | Project Extensions Architecture に関する過去版の決定 |
| DEC-006 | supersedes | DEC-005 | inspect-extensions 廃止と extension 検査の3層責務分離を確定し、DEC-005 を置換 |
| DEC-006 | relates-to | v2:ADR-0135 | Project Extensions Architecture に関する過去版の決定（inspect-extensions 廃止後の責務移管先） |
| DEC-007 | supersedes-spec | docs/designs/local/artifact-graph.md | 現行 Design「対象外」節を撤回し、標準配布スキルへ昇格。後継 Design は docs/designs/skills/agentdev-artifact-graph.md |
| DEC-007 | relates-to | DEC-002 | 配布物原本は src/opencode/ へ配置する原則に従う |
| DEC-008 | relates-to | DEC-001 | case-auto 自走境界（決定4）の適用範囲内で bounded parent decision resolution を確定 |
| DEC-008 | relates-to | v2:ADR-0112, v2:ADR-0138 | case-auto 判断委譲に関する過去版合意履歴 |
| DEC-009 | relates-to | v2:ADR-* | ADR から Decision への正規成果物モデル移行。過去版参照は v2:ADR-* のまま維持（AG-010） |
| DEC-013 | relates-to | DEC-001 | 新規統制追加原則（決定4）との整合。本 Decision は lifecycle/enforcement の削除と新規存在条件の導入を伴う |
| DEC-013 | relates-to | DEC-006 | 意味検査移管（RU-IR-007）は DEC-006 の適用範囲拡張ではなく REQ-010-003/004、REQ-036-006〜016 の一般原則の適用 |
| DEC-013 | relates-to | DEC-009 | REQ-010-053..057 RETIRE は DEC-009 CR-001（ADR→Decision 移行の ID 変更例外）の適用外、欠番維持 |
| DEC-014 | relates-to | DEC-001 決定4 | 配布依存境界の多層 enforcement に対する新規統制追加原則の7条件立証 |
| DEC-014 | relates-to | DEC-006 | DEC-006 の inspect 3-command 正規化と IR-056 の Project Extensions 検査分離を維持しつつ、IR-059 の範囲と経路を変更する後続決定。DEC-006 全体を置換しない |
| DEC-014 | relates-to | DEC-013 | IR 存在条件モデルに従い、IR-059 の範囲変更を本 Decision で確定 |
| DEC-015 | relates-to | DEC-001 | 決定2 の harness 委譲リストを参照し再列挙しない。決定1（ADF の中心責務）の精製と決定3（hard governance の限定）の適用として整理 |
| DEC-015 | relates-to | DEC-010 | Command / Workflow Skill / Capability Skill 責務3層分化を維持したまま決定論的処理を接続 |
| DEC-015 | relates-to | DEC-011 | STEP（workflow 層の再開単位）と処理単位（orchestration 層の再開単位）の階層関係を明確化 |
| DEC-016 | relates-to | DEC-002 | 導入系スクリプトの副作用ゼロ原則。原本/プロジェクション分離における移行・同期の責務分離の類推 |
| DEC-017 | supersedes | DEC-007 | 最小トレーサビリティモデルの採用により、Artifact Graph を標準探索モデルとする決定を置換する。標準配布スキルの地位は agentdev-traceability が引き継ぐ |
| DEC-017 | relates-to | DEC-009 | Decision 成果物型の TIM 上の位置づけ（ADF 拡張） |
| DEC-017 | relates-to | DEC-010 | 4層分離はトレーサビリティ機能内部の概念層であり、Command / Workflow Skill / Capability Skill の配布物3層モデルとは別軸である |
| DEC-018 | relates-to | DEC-008 | 実証の評価契約変更はユーザー明示指示のみとし case-auto は自律変更しない運用は bounded parent decision resolution 決定4の適用 |
| DEC-018 | relates-to | DEC-011 | 実証の中断・再開は評価ブランチ保持と Issue 永続情報からの復元により durable state 原則を適用 |
| DEC-018 | relates-to | DEC-015 | 実証ワークフローは状態機械の選択的適用対象の拡張であり新規ハード統制を追加しない |
| DEC-019 | relates-to | DEC-015 | ADF vs harness の責務分界とは軸が異なる（ADF 固有 vs 一般処理の標準 API 委譲）。責務分界の類推として参照する |

## 関連 REQ

| Decision | 関連REQ | 説明 |
|-----|---------|------|
| DEC-001 | [REQ-001](../requirements/REQ-001.md), [REQ-002](../requirements/REQ-002.md), [REQ-003](../requirements/REQ-003.md), [REQ-004](../requirements/REQ-004.md), [REQ-005](../requirements/REQ-005.md), [REQ-006](../requirements/REQ-006.md), [REQ-007](../requirements/REQ-007.md), [REQ-008](../requirements/REQ-008.md), [REQ-009](../requirements/REQ-009.md), [REQ-010](../requirements/REQ-010.md), [REQ-011](../requirements/REQ-011.md) | AgentDevFlow 憲章の全体原則（hard governance 8点、新規統制追加7条件、リリース条件） |
| DEC-002 | [REQ-002](../requirements/REQ-002.md), [REQ-009](../requirements/REQ-009.md) | 配布成果物のソース・プロジェクション分離 |
| DEC-003 | [REQ-004](../requirements/REQ-004.md), [REQ-008](../requirements/REQ-008.md) | req_draft soft-contract 原則（LLM推論消費、厳格schemaなし） |
| DEC-004 | [REQ-011](../requirements/REQ-011.md), [REQ-009](../requirements/REQ-009.md) | 差し替え可能な I/O 境界（agentdev-gh-cli、Local backend） |
| DEC-005 | [REQ-002](../requirements/REQ-002.md), [REQ-009](../requirements/REQ-009.md) | Project Extensions Architecture（.agentdev/extensions/** によるプロジェクト固有追加）。DEC-006 により superseded |
| DEC-006 | [REQ-010](../requirements/REQ-010.md), [REQ-002](../requirements/REQ-002.md) | inspect 3-command 構成への正規化（inspect-extensions 廃止、extension 検査の3層責務分離） |
| DEC-007 | [REQ-012](../requirements/REQ-012.md), [REQ-013](../requirements/retired/REQ-013.md)（retired、後継: REQ-012）, [REQ-002](../requirements/REQ-002.md), [REQ-009](../requirements/REQ-009.md) | Artifact Graph 標準化と配布スキル昇格（open extensibility、project/self-hosting augmentation、fail-open、決定論性） |
| DEC-008 | [REQ-006](../requirements/REQ-006.md), [REQ-014](../requirements/REQ-014.md), [REQ-003](../requirements/REQ-003.md) | case-auto の限定的親判断解決（bounded parent decision resolution、REQ-006-112〜114、REQ-014-009/010、REQ-003-008/009/010 と整合） |
| DEC-009 | [REQ-001](../requirements/REQ-001.md) | ADR から Decision への正規成果物モデル移行（AG-001〜017、REQ-001-056〜064） |
| DEC-010 | [REQ-002](../requirements/REQ-002.md), [REQ-027](../requirements/REQ-027.md) | Command / Workflow Skill / Capability Skill 責務3層分化と1:N分割原則（AG-003、AG-007、REQ-002-001〜004 意味変更） |
| DEC-011 | [REQ-005](../requirements/REQ-005.md) | STEP resume point と会話記憶非依存（AG-004、AG-005、REQ-005-024 追記） |
| DEC-012 | [REQ-002](../requirements/REQ-002.md) | Extension を file-kind から workflow/capability responsibility へ再編（AG-008、REQ-002-030/031 意味変更） |
| DEC-013 | [REQ-028](../requirements/REQ-028.md), [REQ-010](../requirements/REQ-010.md) | IR 登録モデルの簡素化（AG-008 tombstone 廃止、AG-009 lifecycle/enforcement/baseline_status 簡素化、REQ-010-053..057 RETIRE、REQ-036-022 UPDATE） |
| DEC-014 | [REQ-029](../requirements/REQ-029.md), [REQ-002](../requirements/REQ-002.md), [REQ-010](../requirements/REQ-010.md), [REQ-009](../requirements/REQ-009.md) | 配布依存境界の多層 enforcement（REQ-029 新設、REQ-002 縮約、REQ-010-060 最終保証 gate、REQ-009-045 release artifact 境界、IR-059 範囲と source/save/complete/release 経路変更） |
| DEC-015 | [REQ-002](../requirements/REQ-002.md), [REQ-005](../requirements/REQ-005.md), [REQ-011](../requirements/REQ-011.md), [REQ-034](../requirements/REQ-034.md), [REQ-035](../requirements/REQ-035.md), [REQ-038](../requirements/REQ-038.md) | ADF決定論的実行中核と実行基盤実行機構の責務分界（REQ-002-035/036、REQ-005-025〜028、REQ-011-019、REQ-034-035/036、REQ-035-011、REQ-038-005 と整合） |
| DEC-016 | [REQ-009](../requirements/REQ-009.md) | 導入系スクリプトの副作用ゼロ原則（provisioning 責務の利用者移転、REQ-009-010 UPDATE、REQ-009-046〜049 APPEND と整合） |
| DEC-017 | [REQ-012](../requirements/REQ-012.md), [REQ-021](../requirements/REQ-021.md), [REQ-020](../requirements/retired/REQ-020.md)（retired、後継: REQ-012）, [REQ-040](../requirements/retired/REQ-040.md)（retired、後継: REQ-012） | 最小トレーサビリティモデルの採用と Artifact Graph の廃止（REQ-012 UPDATE、REQ-021 UPDATE、REQ-020 RETIRE、REQ-040 RETIRE と整合） |
| DEC-018 | [REQ-042](../requirements/REQ-042.md), [REQ-043](../requirements/REQ-043.md), [REQ-004](../requirements/REQ-004.md), [REQ-005](../requirements/REQ-005.md), [REQ-017](../requirements/REQ-017.md), [REQ-030](../requirements/REQ-030.md), [REQ-031](../requirements/REQ-031.md), [REQ-032](../requirements/REQ-032.md), [REQ-034](../requirements/REQ-034.md), [REQ-035](../requirements/REQ-035.md) | 評価ブランチモデルとCase統合先の一般化（REQ-042/REQ-043 CREATE、REQ-004/005/017/030/031/032/034/035 UPDATE と整合） |
| DEC-019 | [REQ-044](../requirements/REQ-044.md) | 一般処理の標準API委譲とADF固有意味論の所有境界（REQ-044 CREATE と整合。Design 4 件への実装契約追記・更新を伴う） |
| DEC-020 | [REQ-049](../requirements/REQ-049.md), [REQ-001](../requirements/REQ-001.md), [REQ-009](../requirements/REQ-009.md), [REQ-011](../requirements/REQ-011.md) | GitHub Issue 共通管理単位の採用（REQ-049 全面再構成、REQ-001/REQ-009/REQ-011 UPDATE と整合。Design への契約更新を伴う） |
| DEC-021 | [REQ-050](../requirements/REQ-050.md) | scripts 公開入口の2本固定と安定契約（REQ-050 CREATE、REQ-009-002/044 UPDATE、DEC-016 参照修正と整合） |
| DEC-023 | [REQ-002](../requirements/REQ-002.md), [REQ-009](../requirements/REQ-009.md), [REQ-029](../requirements/REQ-029.md), [REQ-052](../requirements/REQ-052.md) | third-party Skill の分離管理と取得機構の導入（REQ-002-019 UPDATE、REQ-002-042〜044 APPEND、REQ-009-050 APPEND、REQ-029-009 APPEND、REQ-052-011 APPEND と整合） |
| DEC-024 | [REQ-054](../requirements/REQ-054.md), [REQ-055](../requirements/REQ-055.md), [REQ-056](../requirements/REQ-056.md) | 変更誘発境界リスク分析の導入と検証契約への投影（REQ-054/055/056 CREATE、REQ-002-046 APPEND、REQ-039-006 APPEND と整合） |

## 過去版の履歴基盤

次の v2:ADR-01XX 群は tag `v2.11.0` 時点のアーキテクチャ基盤である（AG-010）。
過去版は `v2:ADR-*` 表記で区別し、本文は tag を参照する。
`v2:DEC-*` は生成しない。
現行 Decision との関係は上記 Decision Map に示す。

### tag v2.11.0 基盤ビュー

| ADR番号 | タイトル | ステータス | 作成日 |
|---------|---------|-----------|--------|
| v2:ADR-0101 | AgentDevFlow プラグイン名前空間の統一 | accepted | 2026-06-08 |
| v2:ADR-0102 | 実行時 / 編集時 関心分離 | accepted | 2026-06-08 |
| v2:ADR-0103 | 文書種別責務境界 | accepted | 2026-06-08 |
| v2:ADR-0104 | 実行時独立性 | accepted | 2026-06-08 |
| v2:ADR-0105 | OpenCode ソース・プロジェクション分離 | accepted | 2026-06-08 |
| v2:ADR-0106 | リポジトリローカルツールのための /repo/* 名前空間 | accepted | 2026-06-08 |
| v2:ADR-0107 | コマンド・スキル・テンプレート・スクリプト責任分界の正式定義 | accepted | 2026-06-08 |
| v2:ADR-0108 | オーケストレーションスキル作成基準の導入 | accepted | 2026-06-08 |
| v2:ADR-0109 | Epic Issue 本文を実行順序 SSoT とする設計 | accepted | 2026-06-08 |
| v2:ADR-0110 | DOC-MAP 採用判断 | accepted | 2026-06-08 |
| v2:ADR-0112 | サブエージェント委譲の一般化と委譲時最小契約 | accepted | 2026-06-10 |
| v2:ADR-0114 | case-run 実行責務の外部実行バックエンド委譲 | accepted | 2026-06-16 |
| v2:ADR-0123 | Design ライフサイクルと design-save の導入 | accepted | 2026-06-18 |
| v2:ADR-0124 | req_draft ソフトコントラクト原則: LLM推論消費・厳格スキーマなし | accepted | 2026-06-19 |
| v2:ADR-0125 | case-auto Wave 内並列子Issue実行モデル | accepted | 2026-06-20 |
| v2:ADR-0127 | case-auto 構成工程の委譲によるスケーラビリティ確立 | accepted | 2026-06-21 |
| v2:ADR-0128 | case-run の実行モデル: 実行担当サブエージェント委譲 | accepted | 2026-06-21 |
| v2:ADR-0129 | 複数 execution_unit 並列実行モデル | accepted | 2026-06-23 |
| v2:ADR-0130 | `agentdev-gh-cli` を差し替え可能な I/O 境界として確立 | accepted | 2026-06-23 |
| v2:ADR-0131 | ローカル版導入方式を link mode へ統一し生成方式を廃止 | accepted | 2026-06-23 |
| v2:ADR-0132 | コンフリクト解消モデル（3レベルエスカレーションと責務割当） | accepted | 2026-06-24 |
| v2:ADR-0134 | 配布物依存スキルの src 昇格方針 | accepted | 2026-07-03 |
| v2:ADR-0135 | Project Extensions Architecture | accepted | 2026-07-04 |
| v2:ADR-0136 | 配布物の harness 実行制御分離 | accepted | 2026-07-12 |
| v2:ADR-0137 | case-auto における case-run インライン実行（多重委譲回避） | accepted | 2026-07-16 |
| v2:ADR-0138 | case-auto オーケストレーション制御の AgentDevFlow 側集約 | accepted | 2026-07-19 |
| v2:ADR-0139 | REQ/Design 意味分類と正規所有モデル | accepted | 2026-07-22 |

v2 の superseded / deprecated ADR（v2:ADR-0111、v2:ADR-0113、v2:ADR-0126）および v2.11.0 以前に物理削除された v2:ADR-0001〜0023 の詳細は tag v2.11.0 を参照のこと。

<!-- AUTOGEN:BEGIN:id=decision-retired-table -->
| Decision番号 | タイトル | retired時ステータス |
|---------|---------|-------------------|
<!-- AUTOGEN:END -->
