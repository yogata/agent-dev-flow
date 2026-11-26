# 意思決定記録（Decision）

意思決定記録（Decision）のインデックス。
現行 Decision は `DEC-NNN`（3桁ゼロ埋め）のIDを使用し、過去版の ADR は tag `v2.11.0` と `v2:ADR-*` 表記で区別する（AG-010）。

## 現行 Decision

基本原則、管理方式、リリース条件は DEC-001 を基準とする。
個別 REQ/Design は憲章の原則へ照らして位置づく。
DEC-018 は欠番であり、対応する Decision ファイルは存在しない。
DEC-064 は欠番であり、対応する Decision ファイルは存在しない。実験前提に基づく既存統制変更原則の採用に関する判断であったが、現行の判断実体は DEC-067（仮説に基づく既存統制変更原則）が部分置換・継承しており、ファイルはスリム化整理で削除された。削除後の参照解決は Git 履歴で行う。

<!-- AUTOGEN:BEGIN:id=decision-baseline-count -->
現行の承認済み Decision は47件、提案中の Decision は2件である。
<!-- AUTOGEN:END -->

<!-- AUTOGEN:BEGIN:id=decision-baseline-table -->
| Decision番号 | タイトル | ステータス | 作成日 |
|---------|---------|-----------|--------|
| DEC-001 | AgentDevFlow 憲章 | accepted | 2026-07-24 |
| DEC-003 | req_draft ソフトコントラクト原則 | accepted | 2026-07-25 |
| DEC-004 | 差し替え可能な I/O 境界 | accepted | 2026-07-25 |
| DEC-006 | inspect 3-command 構成への正規化 | accepted | 2026-07-27 |
| DEC-008 | case-auto の限定的親判断解決（bounded parent decision resolution） | accepted | 2026-08-09 |
| DEC-009 | ADR から Decision への正規成果物モデル移行 | accepted | 2026-08-10 |
| DEC-010 | Command / Workflow Skill / Capability Skill 責務3層分化と1:N分割原則 | accepted | 2026-08-10 |
| DEC-011 | STEP resume point と会話記憶非依存 | accepted | 2026-08-10 |
| DEC-012 | Extension を file-kind から workflow/capability responsibility へ再編 | accepted | 2026-08-10 |
| DEC-013 | IR 登録モデルの簡素化 — 現存 IR を実行可能な恒久統制に限定 | accepted | 2026-08-11 |
| DEC-014 | 配布依存境界の多層 enforcement | accepted | 2026-08-11 |
| DEC-016 | 導入系スクリプトの副作用ゼロ原則 | accepted | 2026-08-15 |
| DEC-019 | 一般処理の標準API委譲とADF固有意味論の所有境界 | accepted | 2026-08-20 |
| DEC-020 | GitHub Issue 共通管理単位の採用 | accepted | 2026-08-23 |
| DEC-021 | scripts 公開入口の2本固定と安定契約 | accepted | 2026-08-23 |
| DEC-022 | 実行定義層の正規所有モデルと機械強制への移行 | accepted | 2026-08-24 |
| DEC-023 | third-party Skill の分離管理と取得機構の導入 | accepted | 2026-08-30 |
| DEC-024 | 変更誘発境界リスク分析の導入と検証契約への投影 | accepted | 2026-08-31 |
| DEC-025 | プロジェクト知識を Capability Skill から分離し、独立した正規知識層として管理する | accepted | 2026-09-01 |
| DEC-026 | 実現面変更方針の構造化ハンドオフ（realization_actions） | accepted | 2026-09-03 |
| DEC-032 | ADF 責務の三層モデルと Project Contract の論理ビュー・情報寿命モデル | accepted | 2026-09-18 |
| DEC-035 | v4 Quality / Verification / Evidence / Gate モデルへの分解 | accepted | 2026-09-18 |
| DEC-036 | 意味 Skill と決定的実装の責務分離および Harness/Backend adapter 境界 | accepted | 2026-09-18 |
| DEC-037 | Traceability の Change / Evidence 中心への再中心化 | accepted | 2026-09-18 |
| DEC-038 | ADF v4 durable state 配置と再構成の契約（状態権威・証跡分離・非原子調整原則） | accepted | 2026-09-19 |
| DEC-039 | ADF v4 authority・副作用統制と冪等・並行性モデル | accepted | 2026-09-19 |
| DEC-041 | Wave 構成純度と実行並列上限の単一所有 | accepted | 2026-09-23 |
| DEC-042 | case-auto 最大並列維持と同期逐次フォールバック禁止 | accepted | 2026-09-24 |
| DEC-047 | textlint 依存実体の版固定情報解決への転換 | accepted | 2026-09-29 |
| DEC-048 | ADF判断アーキテクチャ: 判断方法・確定権限・人間判断境界の統一モデル | accepted | 2026-10-01 |
| DEC-049 | ADF 共通原本とホスト接続領域の分離によるマルチホスト配布モデル | accepted | 2026-10-02 |
| DEC-050 | マージ済みリモートブランチの削除と操作安全性 | accepted | 2026-10-04 |
| DEC-051 | case-auto stage 3 のスロット型キューへの移行（Wave 収束前提の撤廃） | accepted | 2026-10-06 |
| DEC-053 | ADF v5 工程・成果物モデル（共通責務・参照モデル工程・成果物の意味と正式確定） | accepted | 2026-10-09 |
| DEC-054 | ADF v5 追跡・品質検証モデル（隣接工程間対応・構造/意味分離・差分影響評価） | accepted | 2026-10-09 |
| DEC-055 | ADF v5 有限実行と責務再編（工程独立実行・Issue 必要時利用・Wave の意味的依存グループ化） | accepted | 2026-10-09 |
| DEC-056 | ADF v5 移行と互換性の境界（後方互換非必須・意味保存移行・未処理改善情報の継続） | accepted | 2026-10-09 |
| DEC-057 | 工程駆動コラボレーションモデル（検討テーマ・外部検討・段階形成）の採用 | accepted | 2026-10-12 |
| DEC-058 | 工程遷移と双経路併存モデルの採用（REQ-005-001/010/011 改訂を含む） | accepted | 2026-10-12 |
| DEC-061 | 改善サイクルのパッチリリースと公開承認 | accepted | 2026-10-20 |
| DEC-062 | 要件ID桁数の受理上限撤廃と表示ゼロ埋め・受理検証の分離 | accepted | 2026-10-26 |
| DEC-063 | 分割③ CI 日次定期実行（cron schedule）の撤去 | accepted | 2026-11-16 |
| DEC-065 | 整合性検証体制の中核化（IR 24+IR-075 体系・プラグイン型検証エンジン・src 正本化） | accepted | 2026-11-18 |
| DEC-066 | ローカル Git Hook による決定論的検証ゲート（CI 非依存） | accepted | 2026-11-18 |
| DEC-067 | 仮説に基づく既存統制変更原則 | accepted | 2026-11-19 |
| DEC-068 | 適用先の構成移行の責務分離 | accepted | 2026-11-23 |
| DEC-069 | Codex・Antigravity の限定配布とホスト既存能力の優先 | accepted | 2026-11-24 |
| DEC-070 | 利用先リポジトリの4エージェント配置対象選択 | proposed | 2026-11-26 |
| DEC-071 | 新ホストの GitHub 接続と gh 経路切替 | proposed | 2026-11-26 |
<!-- AUTOGEN:END -->

- [利用者向け要約（charter.md）](../guides/charter.md)

> この README は分類ビューであり、Decision 本文のSSoTではない（AG-014）。
> 基準は各 Decision ファイルである（REQ-001）。

## ステータス別ビュー

### 承認済み（accepted）

<!-- AUTOGEN:BEGIN:id=decision-status-accepted -->
- [DEC-001](DEC-001.md)（AgentDevFlow 憲章）
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
- [DEC-016](DEC-016.md)（導入系スクリプトの副作用ゼロ原則）
- [DEC-019](DEC-019.md)（一般処理の標準API委譲とADF固有意味論の所有境界）
- [DEC-020](DEC-020.md)（GitHub Issue 共通管理単位の採用）
- [DEC-021](DEC-021.md)（scripts 公開入口の2本固定と安定契約）
- [DEC-022](DEC-022.md)（実行定義層の正規所有モデルと機械強制への移行）
- [DEC-023](DEC-023.md)（third-party Skill の分離管理と取得機構の導入）
- [DEC-024](DEC-024.md)（変更誘発境界リスク分析の導入と検証契約への投影）
- [DEC-025](DEC-025.md)（プロジェクト知識を Capability Skill から分離し、独立した正規知識層として管理する）
- [DEC-026](DEC-026.md)（実現面変更方針の構造化ハンドオフ（realization_actions））
- [DEC-032](DEC-032.md)（ADF 責務の三層モデルと Project Contract の論理ビュー・情報寿命モデル）
- [DEC-035](DEC-035.md)（v4 Quality / Verification / Evidence / Gate モデルへの分解）
- [DEC-036](DEC-036.md)（意味 Skill と決定的実装の責務分離および Harness/Backend adapter 境界）
- [DEC-037](DEC-037.md)（Traceability の Change / Evidence 中心への再中心化）
- [DEC-038](DEC-038.md)（ADF v4 durable state 配置と再構成の契約（状態権威・証跡分離・非原子調整原則））
- [DEC-039](DEC-039.md)（ADF v4 authority・副作用統制と冪等・並行性モデル）
- [DEC-041](DEC-041.md)（Wave 構成純度と実行並列上限の単一所有）
- [DEC-042](DEC-042.md)（case-auto 最大並列維持と同期逐次フォールバック禁止）
- [DEC-047](DEC-047.md)（textlint 依存実体の版固定情報解決への転換）
- [DEC-048](DEC-048.md)（ADF判断アーキテクチャ: 判断方法・確定権限・人間判断境界の統一モデル）
- [DEC-049](DEC-049.md)（ADF 共通原本とホスト接続領域の分離によるマルチホスト配布モデル）
- [DEC-050](DEC-050.md)（マージ済みリモートブランチの削除と操作安全性）
- [DEC-051](DEC-051.md)（case-auto stage 3 のスロット型キューへの移行（Wave 収束前提の撤廃））
- [DEC-053](DEC-053.md)（ADF v5 工程・成果物モデル（共通責務・参照モデル工程・成果物の意味と正式確定））
- [DEC-054](DEC-054.md)（ADF v5 追跡・品質検証モデル（隣接工程間対応・構造/意味分離・差分影響評価））
- [DEC-055](DEC-055.md)（ADF v5 有限実行と責務再編（工程独立実行・Issue 必要時利用・Wave の意味的依存グループ化））
- [DEC-056](DEC-056.md)（ADF v5 移行と互換性の境界（後方互換非必須・意味保存移行・未処理改善情報の継続））
- [DEC-057](DEC-057.md)（工程駆動コラボレーションモデル（検討テーマ・外部検討・段階形成）の採用）
- [DEC-058](DEC-058.md)（工程遷移と双経路併存モデルの採用（REQ-005-001/010/011 改訂を含む））
- [DEC-061](DEC-061.md)（改善サイクルのパッチリリースと公開承認）
- [DEC-062](DEC-062.md)（要件ID桁数の受理上限撤廃と表示ゼロ埋め・受理検証の分離）
- [DEC-063](DEC-063.md)（分割③ CI 日次定期実行（cron schedule）の撤去）
- [DEC-065](DEC-065.md)（整合性検証体制の中核化（IR 24+IR-075 体系・プラグイン型検証エンジン・src 正本化））
- [DEC-066](DEC-066.md)（ローカル Git Hook による決定論的検証ゲート（CI 非依存））
- [DEC-067](DEC-067.md)（仮説に基づく既存統制変更原則）
- [DEC-068](DEC-068.md)（適用先の構成移行の責務分離）
- [DEC-069](DEC-069.md)（Codex・Antigravity の限定配布とホスト既存能力の優先）
<!-- AUTOGEN:END -->

### 提案中（proposed）

<!-- AUTOGEN:BEGIN:id=decision-status-proposed -->
- [DEC-070](DEC-070.md)（利用先リポジトリの4エージェント配置対象選択）
- [DEC-071](DEC-071.md)（新ホストの GitHub 接続と gh 経路切替）
<!-- AUTOGEN:END -->

### 置き換え済み（superseded）

<!-- AUTOGEN:BEGIN:id=decision-status-superseded -->
<!-- AUTOGEN:END -->

### 非推奨（deprecated）

<!-- AUTOGEN:BEGIN:id=decision-status-deprecated -->
<!-- AUTOGEN:END -->

## トピック別ビュー

> トピック別ビューは主要 Decision の選択掲載（話題ごとの導線）であり、全 Decision を網羅する一覧ではない。全 Decision の網羅一覧の正は、DEC 番号順の自動生成表（decision-baseline-table、decision-status 系 AUTOGEN ブロック）である。トピックへの掲載・非掲載はこの方針に従って判断する。

### 憲章・基本原則

- [DEC-001](DEC-001.md)（AgentDevFlow 憲章、hard governance の限定、新規統制追加原則）
- [DEC-009](DEC-009.md)（ADR から Decision への正規成果物モデル移行）
- [DEC-010](DEC-010.md)（Command / Workflow Skill / Capability Skill 責務3層分化と1:N分割原則）
- [DEC-032](DEC-032.md)（ADF 責務の三層モデルと Project Contract の論理ビュー・情報寿命モデル）

### 配布基盤・ソースモデル

- [DEC-004](DEC-004.md)（差し替え可能な I/O 境界）
- [DEC-006](DEC-006.md)（inspect 3-command 構成への正規化、extension 検査の3層責務分離）
- [DEC-012](DEC-012.md)（Extension を file-kind から workflow/capability responsibility へ再編）
- [DEC-014](DEC-014.md)（配布依存境界の多層 enforcement、IR-059 範囲と enforcement 経路の変更）
- [DEC-016](DEC-016.md)（導入系スクリプトの副作用ゼロ原則、provisioning 責務の利用者移転）
- [DEC-021](DEC-021.md)（scripts 公開入口の2本固定と安定契約、公開入口の構造境界と入口名の安定性）
- [DEC-023](DEC-023.md)（third-party Skill の分離管理と取得機構の導入、第三区分所有境界と参照点集約）
- [DEC-036](DEC-036.md)（意味判断・決定的実装・実行基盤の責務境界）
- [DEC-047](DEC-047.md)（textlint の共通実行基盤と依存の版固定）

### ワークフロー・委譲契約

- [DEC-003](DEC-003.md)（req_draft ソフトコントラクト原則）
- [DEC-008](DEC-008.md)（case-auto の限定的親判断解決、bounded parent decision resolution）
- [DEC-011](DEC-011.md)（STEP resume point と会話記憶非依存）
- [DEC-019](DEC-019.md)（一般処理の標準API委譲とADF固有意味論の所有境界、YAML 構文解析・再帰ファイル探索・CLI 引数解析の標準 API 委譲）
- [DEC-020](DEC-020.md)（GitHub Issue 共通管理単位の採用、追跡Issueと Case Issue の役割分離と論理スキーマ一元管理）
- [DEC-024](DEC-024.md)（変更誘発境界リスク分析の導入と検証契約への投影、case-specific risk を品質プロセスの第一級入力とする原則）
- [DEC-035](DEC-035.md)（v4 Quality / Verification / Evidence / Gate モデルへの分解、検査と証跡の品質境界）
- [DEC-038](DEC-038.md)（永続状態の配置と再構成）
- [DEC-039](DEC-039.md)（副作用の権限、冪等性、並行性）
- [DEC-041](DEC-041.md)（Wave 構成純度と実行並列上限の単一所有）
- [DEC-042](DEC-042.md)（case-auto 最大並列維持と同期逐次フォールバック禁止）
- [DEC-050](DEC-050.md)（マージ済みリモートブランチの削除と操作安全性）
- [DEC-053](DEC-053.md)（工程・成果物モデル）
- [DEC-055](DEC-055.md)（公開経路、内部工程、有限実行）
- [DEC-056](DEC-056.md)（移行時の意味保存と検証）
- [DEC-061](DEC-061.md)（パッチリリースと公開承認）

### 整合性・IR 体系

- [DEC-013](DEC-013.md)（IR 登録モデルの簡素化、tombstone 廃止 + lifecycle/enforcement/baseline_status 除去）
- [DEC-037](DEC-037.md)（変更・証拠・影響範囲の対応付け）
- [DEC-067](DEC-067.md)（仮説に基づく既存統制変更原則）

Decision Map（現行 Decision と過去版 ADR の履歴上の関連）。

| Decision | 関係 | 対象 | 説明 |
|-----|------|------|------|
| DEC-003 | relates-to | v2:ADR-0124 | req_draft ソフトコントラクトに関する過去版の決定 |
| DEC-004 | relates-to | v2:ADR-0130 | 差し替え可能な I/O 境界に関する過去版の決定 |
| DEC-006 | relates-to | v2:ADR-0135 | Project Extensions Architecture に関する過去版の決定（inspect-extensions 廃止後の責務移管先） |
| DEC-008 | relates-to | DEC-001 | case-auto 自走境界（決定4）の適用範囲内で bounded parent decision resolution を確定 |
| DEC-008 | relates-to | v2:ADR-0112, v2:ADR-0138 | case-auto 判断委譲に関する過去版合意履歴 |
| DEC-009 | relates-to | v2:ADR-* | ADR から Decision への正規成果物モデル移行。過去版参照は v2:ADR-* のまま維持（AG-010） |
| DEC-012 | relates-to | DEC-006 | 本 Decision 本文が宣言する関連（file-kind から workflow/capability responsibility への再編における前提）であり、frontmatter 上の関係宣言が欠けていた既存不整合の解消 |
| DEC-012 | relates-to | DEC-036 | Project Extensions を標準プロセス置換ではなく semantic extension point とする決定(3) をもって本 Decision の再編方針が v4 で拡張されたことを示す関連 |
| DEC-013 | relates-to | DEC-001 | 新規統制追加原則（決定4）との整合。本 Decision は lifecycle/enforcement の削除と新規存在条件の導入を伴う |
| DEC-013 | relates-to | DEC-006 | 意味検査移管（RU-IR-007）は DEC-006 の適用範囲拡張ではなく REQ-010-003/004、REQ-036-006〜016 の一般原則の適用 |
| DEC-013 | relates-to | DEC-009 | 旧 IR 状態モデル行群の RETIRE（詳細は DEC-013 本文・再配置記録参照）は DEC-009 CR-001（ADR→Decision 移行の ID 変更例外）の適用外、欠番維持 |
| DEC-014 | relates-to | DEC-001 決定4 | 配布依存境界の多層 enforcement に対する新規統制追加原則の7条件立証 |
| DEC-014 | relates-to | DEC-006 | DEC-006 の inspect 3-command 正規化と IR-056 の Project Extensions 検査分離を維持しつつ、IR-059 の範囲と経路を変更する後続決定。DEC-006 全体を置換しない |
| DEC-014 | relates-to | DEC-013 | IR 存在条件モデルに従い、IR-059 の範囲変更を本 Decision で確定 |
| DEC-051 | supersedes | DEC-041 | case-auto stage 3 のスロット型キュー移行による決定5（Wave 収束前提）の置換（決定1〜4は維持） |
| DEC-062 | relates-to | DEC-001, DEC-009 | 現行 corpus の ID 形式記述（意味的不変）を参照する受理上限撤廃の新規決定。既存 ID・参照の改番は行わない |
| DEC-068 | relates-to | DEC-016 | 導入系スクリプトのプロビジョニングとネットワークアクセスを行わない決定を維持し、構成移行との責務を分ける |
| DEC-068 | relates-to | DEC-056 | 意味保存と検証の原則と整合する、将来の構成変更に対する移行手段の選択を定める |

## 関連 REQ

<!-- AUTOGEN:BEGIN:id=decision-related-req-table -->
| Decision | 関連REQ | 説明 |
|-----|---------|------|
| DEC-001 | [REQ-001](../requirements/REQ-001.md), [REQ-002](../requirements/REQ-002.md), [REQ-003](../requirements/REQ-003.md), [REQ-004](../requirements/REQ-004.md), [REQ-005](../requirements/REQ-005.md), [REQ-006](../requirements/REQ-006.md), [REQ-007](../requirements/REQ-007.md), [REQ-008](../requirements/REQ-008.md), [REQ-009](../requirements/REQ-009.md), [REQ-010](../requirements/REQ-010.md), [REQ-011](../requirements/REQ-011.md) | AgentDevFlow 憲章の全体原則（hard governance 8点、新規統制追加7条件、リリース条件） |
| DEC-003 | [REQ-004](../requirements/REQ-004.md), [REQ-008](../requirements/REQ-008.md) | req_draft soft-contract 原則（LLM推論消費、厳格schemaなし） |
| DEC-004 | [REQ-011](../requirements/REQ-011.md), [REQ-009](../requirements/REQ-009.md) | 差し替え可能な I/O 境界（境界成果物は DEC-022 決定4により Custom Tool、Local backend） |
| DEC-006 | [REQ-010](../requirements/REQ-010.md), [REQ-002](../requirements/REQ-002.md) | inspect 3-command 構成への正規化（inspect-extensions 廃止、extension 検査の3層責務分離） |
| DEC-008 | [REQ-006](../requirements/REQ-006.md), [REQ-014](../requirements/REQ-014.md), [REQ-003](../requirements/REQ-003.md) | case-auto の限定的親判断解決（bounded parent decision resolution、REQ-034-032〜034、REQ-014-009/010、REQ-003-008/009/010 と整合） |
| DEC-009 | [REQ-001](../requirements/REQ-001.md) | ADR から Decision への正規成果物モデル移行（AG-001〜017、REQ-001-056〜064） |
| DEC-010 | [REQ-002](../requirements/REQ-002.md), [REQ-027](../requirements/REQ-027.md) | Command / Workflow Skill / Capability Skill 責務3層分化と1:N分割原則（AG-003、AG-007、REQ-002-001〜004 意味変更） |
| DEC-011 | [REQ-005](../requirements/REQ-005.md) | STEP resume point と会話記憶非依存（AG-004、AG-005、REQ-005-024 追記） |
| DEC-012 | [REQ-002](../requirements/REQ-002.md) | Extension を file-kind から workflow/capability responsibility へ再編（AG-008、REQ-002-030/031 意味変更） |
| DEC-013 | [REQ-010](../requirements/REQ-010.md) | IR 登録モデルの簡素化（AG-008 tombstone 廃止、AG-009 lifecycle/enforcement/baseline_status 簡素化、旧 IR 状態モデル行群（`REQ-010-053..057` 相当）RETIRE、REQ-036-022 UPDATE）。歴史的根拠の retired REQ-028 は本文に保持し、その後継の決定は本 DEC-013 |
| DEC-014 | [REQ-029](../requirements/REQ-029.md), [REQ-002](../requirements/REQ-002.md), [REQ-010](../requirements/REQ-010.md), [REQ-009](../requirements/REQ-009.md) | 配布依存境界の多層 enforcement（REQ-029 新設、REQ-002 縮約、REQ-010-060 最終保証 gate、REQ-009-045 release artifact 境界、IR-059 範囲と source/save/complete/release 経路変更） |
| DEC-016 | [REQ-009](../requirements/REQ-009.md) | 導入系スクリプトの副作用ゼロ原則（provisioning 責務の利用者移転、REQ-009-010 UPDATE、REQ-009-046〜049 APPEND と整合） |
| DEC-019 | [REQ-044](../requirements/REQ-044.md) | 一般処理の標準API委譲とADF固有意味論の所有境界（REQ-044 CREATE と整合。Design 4 件への実装契約追記・更新を伴う） |
| DEC-020 | [REQ-049](../requirements/REQ-049.md), [REQ-001](../requirements/REQ-001.md), [REQ-009](../requirements/REQ-009.md), [REQ-011](../requirements/REQ-011.md) | GitHub Issue 共通管理単位の採用（REQ-049 全面再構成、REQ-001/REQ-009/REQ-011 UPDATE と整合。Design への契約更新を伴う） |
| DEC-021 | [REQ-050](../requirements/REQ-050.md) | scripts 公開入口の2本固定と安定契約（REQ-050 CREATE、REQ-009-002/044 UPDATE、DEC-016 参照修正と整合） |
| DEC-022 | [REQ-002](../requirements/REQ-002.md), [REQ-051](../requirements/REQ-051.md), [REQ-052](../requirements/REQ-052.md), [REQ-011](../requirements/REQ-011.md), [REQ-010](../requirements/REQ-010.md), [REQ-047](../requirements/REQ-047.md), [REQ-029](../requirements/REQ-029.md) | retired REQ-045/046 は当時の影響要件として Decision 本文に履歴保持し、現行の関連要件には含めない |
| DEC-023 | [REQ-002](../requirements/REQ-002.md), [REQ-009](../requirements/REQ-009.md), [REQ-029](../requirements/REQ-029.md), [REQ-052](../requirements/REQ-052.md) | third-party Skill の分離管理と取得機構の導入（REQ-002-019 UPDATE、REQ-002-042〜044 APPEND、REQ-009-050 APPEND、REQ-029-009 APPEND、REQ-052-011 APPEND と整合） |
| DEC-024 | [REQ-054](../requirements/REQ-054.md), [REQ-055](../requirements/REQ-055.md), [REQ-056](../requirements/REQ-056.md) | 変更誘発境界リスク分析の導入と検証契約への投影（REQ-054/055/056 CREATE、REQ-002-046 APPEND、REQ-039-006 APPEND と整合） |
| DEC-025 | [REQ-056](../requirements/REQ-056.md) | - |
| DEC-026 | [REQ-008](../requirements/REQ-008.md), [REQ-004](../requirements/REQ-004.md), [REQ-017](../requirements/REQ-017.md), [REQ-038](../requirements/REQ-038.md), [REQ-039](../requirements/REQ-039.md) | - |
| DEC-032 | [REQ-088](../requirements/REQ-088.md), [REQ-001](../requirements/REQ-001.md) | - |
| DEC-035 | [REQ-007](../requirements/REQ-007.md), [REQ-055](../requirements/REQ-055.md) | - |
| DEC-036 | [REQ-002](../requirements/REQ-002.md), [REQ-044](../requirements/REQ-044.md), [REQ-052](../requirements/REQ-052.md) | - |
| DEC-037 | [REQ-012](../requirements/REQ-012.md), [REQ-021](../requirements/REQ-021.md) | - |
| DEC-038 | [REQ-017](../requirements/REQ-017.md), [REQ-061](../requirements/REQ-061.md) | - |
| DEC-039 | [REQ-003](../requirements/REQ-003.md), [REQ-034](../requirements/REQ-034.md) | - |
| DEC-041 | [REQ-031](../requirements/REQ-031.md), [REQ-034](../requirements/REQ-034.md), [REQ-035](../requirements/REQ-035.md), [REQ-061](../requirements/REQ-061.md) | - |
| DEC-042 | [REQ-031](../requirements/REQ-031.md), [REQ-034](../requirements/REQ-034.md) | case-auto 最大並列維持と同期逐次フォールバック禁止（REQ-034-025/028 意味変更・REQ-034-044/045 APPEND、REQ-031-030 UPDATE と整合） |
| DEC-047 | [REQ-029](../requirements/REQ-029.md), [REQ-053](../requirements/REQ-053.md), [REQ-010](../requirements/REQ-010.md), [REQ-036](../requirements/REQ-036.md) | - |
| DEC-048 | [REQ-096](../requirements/REQ-096.md) | - |
| DEC-049 | [REQ-099](../requirements/REQ-099.md) | - |
| DEC-050 | [REQ-030](../requirements/REQ-030.md), [REQ-009](../requirements/REQ-009.md), [REQ-032](../requirements/REQ-032.md) | - |
| DEC-051 | [REQ-034](../requirements/REQ-034.md), [REQ-035](../requirements/REQ-035.md) | - |
| DEC-053 | [REQ-104](../requirements/REQ-104.md), [REQ-105](../requirements/REQ-105.md), [REQ-012](../requirements/REQ-012.md), [REQ-021](../requirements/REQ-021.md), [REQ-061](../requirements/REQ-061.md), [REQ-088](../requirements/REQ-088.md) | - |
| DEC-054 | [REQ-106](../requirements/REQ-106.md), [REQ-107](../requirements/REQ-107.md), [REQ-012](../requirements/REQ-012.md), [REQ-021](../requirements/REQ-021.md) | - |
| DEC-055 | [REQ-108](../requirements/REQ-108.md), [REQ-005](../requirements/REQ-005.md), [REQ-006](../requirements/REQ-006.md) | - |
| DEC-056 | [REQ-109](../requirements/REQ-109.md), [REQ-009](../requirements/REQ-009.md) | - |
| DEC-057 | [REQ-110](../requirements/REQ-110.md), [REQ-104](../requirements/REQ-104.md) | - |
| DEC-058 | [REQ-111](../requirements/REQ-111.md), [REQ-005](../requirements/REQ-005.md) | - |
| DEC-061 | [REQ-114](../requirements/REQ-114.md) | - |
| DEC-062 | [REQ-004](../requirements/REQ-004.md), [REQ-009](../requirements/REQ-009.md), [REQ-012](../requirements/REQ-012.md), [REQ-051](../requirements/REQ-051.md) | - |
| DEC-063 | - | - |
| DEC-065 | - | - |
| DEC-066 | - | - |
| DEC-067 | [REQ-048](../requirements/REQ-048.md), [REQ-109](../requirements/REQ-109.md) | - |
| DEC-068 | [REQ-126](../requirements/REQ-126.md) | - |
| DEC-069 | [REQ-099](../requirements/REQ-099.md), [REQ-009](../requirements/REQ-009.md) | - |
| DEC-070 | [REQ-099](../requirements/REQ-099.md), [REQ-009](../requirements/REQ-009.md) | - |
| DEC-071 | [REQ-099](../requirements/REQ-099.md), [REQ-011](../requirements/REQ-011.md), [REQ-009](../requirements/REQ-009.md), [REQ-050](../requirements/REQ-050.md) | - |
<!-- AUTOGEN:END -->

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
