---
name: agentdev-workflow-lifecycle
description: Development workflow phase definitions, SSoT transitions, work_type classification, scale assessment, command mappings, and docs structure for the agentdev command pipeline. USE FOR: determining workflow phases, work_type classification and scale assessment, resolving command dependencies, understanding docs/ directory layout. DO NOT USE FOR: specific command execution logic, requirement analysis, compliance checking.
---

# AgentDevFlow ライフサイクルスキル

agentdev系コマンドのフェーズ定義、SSoT遷移、work_type 判定基準、コマンド関連を提供する。

## 対象コマンド

全 agentdev コマンドの一覧、入出力リファレンスは command README（`commands/agentdev/README.md`）を参照。
本 skill は全 agentdev コマンドからフェーズ定義、work_type 判定基準の参照元として使用される。

## STEP model 連携（workflow STEP 契約・STEP resume point と会話記憶非依存）

本スキルは Workflow Skill として宣言的定義（ライフサイクル判定、work_type 判定、scale 判定、SSoT 遷移、上位への引き継ぎ判定）を提供する。
本スキル自身は workflow STEP を所有せず、各 command の Workflow Skill が所有する STEP から参照される（`<workflows/workflow-skill-model>` Design）。

### 宣言的定義と Input Resolution

本スキルが提供する宣言的定義は、各 STEP の Input Resolution において永続状態の優先順位の最上位（SSoT 再構成）に位置する。
優先順位の詳細は `<foundations/v4-durable-state-and-recovery>` Design 参照。

| 宣言的定義 | SSoT 配置 | 利用 STEP |
|---|---|---|
| work_type 判定基準 | 本スキル + `<workflows/v4-standard-lifecycle>` Design「work_type / scale / Epic / Wave の v4 意味モデル」節 | case-open / case-run `prepare` STEP |
| scale 判定基準 | 本スキル | req-define / case-open `prepare` STEP |
| SSoT 遷移定義 | 本スキル | 全 workflow の STEP transition |
| 上位への引き継ぎ判定 | 本スキル（`references/upstream-handoff.md`） | 全 workflow の `prepare` STEP |
| 工程間構造化文脈引き継ぎ | 本スキル（`references/structured-stage-handoff.md`） | 全 workflow の STEP transition、完了報告 |
| 参照先解決ポリシー（source / projection 目的判別） | 本スキル（`references/reference-resolution.md`） | 全 workflow の canonical_references 生成・消費、配布物参照の読み取り先解決 |

STEP reference 8 要素、STEP 識別子、永続状態復元契約は `<foundations/v4-durable-state-and-recovery>` Design に従う。
compaction 後の current STEP 復元、ToDo 使用、compaction 検出の実処理は harness 固有（AGENTS.md、harness reference）。

## work_type とコマンド経路

work_type は工程分岐の参照軸である。
全 work_type が GitHub Issue と PR を経由する標準経路をとる。
Issue/PR をスキップする直接完了経路は存在しない。

workflow_route（direct_case 等）は work_type 固定分類ではなく、Definition 構成（artifact_actions の有無等）から導出される値である。
`direct_case` は Definition 保存工程を別入口で実行しないことを指し、Issue/PR を経由しないことを指さない。
導出表の正は `<foundations/design-principles>` Design「実行経路の導出（Definition 構成一次）」節であり、`<workflows/v4-standard-lifecycle>` Design「work_type / scale / Epic / Wave の v4 意味モデル」節に整合する。

### 経路一覧

実行経路の一次表現は Definition 構成（artifact_actions の有無等）である。work_type と scale は Definition 構成決定の入力情報であり、経路を直接決定しない。

| Definition 構成（artifact_actions の有無等） | 導出結果ラベル（workflow_route） | 実行経路（内部 lifecycle 段階） | 典型的な work_type / scale |
|---|---|---|---|
| REQ 保存なし・設計PRなし（Issue 本文で要件管理） | direct_case | req-define → case-open → case-run → case-close | bugfix、maintenance、docs_chore 等 |
| REQ 保存あり・設計PRあり・Epic 構成なし | req_backed_case | req-define → case-open → case-ready → case-run → case-close | feature standard 等・Epic 構成なしの REQ 保存構成 |
| REQ 保存あり・Epic 構成あり | epic_case | req-define → case-open → case-ready → case-run → case-close（OU/ 子Issue 構成） | feature large・大規模 bugfix・maintenance 等 |

req-define は公開コマンド（`/agentdev/req-define`）である。case-* は内部 lifecycle 段階であり、起動入口は標準実行コマンド `/agentdev/case-auto` である。
一覧は command README 参照。

`artifact_actions` の Definition action は req_draft から case-ready に渡して動的適用する。
該当 entry がない場合も case-ready で Definition readiness を確定する。
Epic 構成の OU/ 子Issue 構成は `agentdev-workflow-orchestration` 参照。

### docs_chore 経路の要素

docs_chore は bugfix, maintenance と同一経路をとる。
本節は docs_chore に特有の要素を明記する。

- 入力: ユーザー要件、修正対象ドキュメント
- SSoT 遷移: req_draft → Issue 本文 → PR 本文 → マージ済み PR + クローズ済み Issue
- 承認: req-define の要件合意、case-close の完了前検証
- 完了証拠: マージ済み PR + クローズ済み Issue
- 停止条件: `agentdev_handoff: true` 検出時、req-define 合意要件からの逸脱、リポジトリ外操作の必要性

docs_chore は REQ, Decision, Design を生成しないことが多いが、Case 実行では case-open, case-ready, case-run, case-close を経由する。
docs 更新責務は全 work_type 共通である。

## スケール判定基準

scale（standard/ large）判定基準である。scale は全 work_type にわたって standard、large を設定できる。大規模 bugfix 等も scale/Epic 構成の対象になり得る（v4-standard-lifecycle Design）。
req-define Step 8 が参照する。

### standard

- 要件の複雑さが単一REQ、少数要件行に収まる
- 実装スコープシグナル（下記）の閾値を超えない

### large

以下のいずれかに該当する場合は large に昇格する:

1. **要件の複雑さ**: 複数REQにまたがる、または単一REQでも多数の要件行追加、修正を伴う
2. **実装スコープシグナル**: ドラフト内に以下のシグナルが存在する場合、要件の複雑さに関わらず large に昇格する:
 - 影響ファイル数が10ファイル超
 - 個別変更件数が30件超
 - シグナル対象: 修正候補リスト、検出事項カタログ、影響ファイル一覧等の実装詳細セクション

## 共通報告・Decision・自律確定規約（反復規則の単一正本）

本節は、工程駆動系の操作（テーマ形成・テーマ更新・成果物反映・独立レビュー・工程遷移・テーマ正本管理）と promote 系コマンド（intake-promote・learning-promote・inspect-promote）、inspect 系コマンド（inspect-docs・inspect-skills）に反復していた共通規則の本文の正本である。
各 command 定義・Workflow Skill・Capability Skill は対象範囲と呼出条件を保持し、本節への名レベル参照により規則本文を消費する。規則本文を各ファイルへ複製しない。本節の配置変更は公開契約の変更として扱う。

### 完了報告の必須要素

工程駆動系の操作の完了報告は、次を必須要素として含める。操作の性質に応じて値が変わり、保存を行わない操作では保存しない旨を、機械検証を実行していない場合はその旨を、完了報告に含める:

- 保存した成果物・記録の保存先の一覧
- 実行した機械検証とその結果
- 操作の返却時点で裏で継続している処理の有無

採用内容の範囲が未決事項と重なる場合はその旨を、検討方向の差し替えを受領する場合は旧方向が持っていた前提の行き先（継承または破棄）を、完了報告に含める。
機械検査の合格は意味品質の保証ではなく、必要条件であって十分条件ではない。
完了報告への必須要素は、既存の部分反映・失敗時報告・再投入の規律、受領・採用根拠の既存規律、および各操作の本来の責務を変更しない。

### decision 成果物の役割と正本の優先度への参照

decision 成果物は、工程をまたぐ意思決定・未解決課題の管理・方式選択を記録する成果物である。
受領・テーマ・未決を扱う工程系コマンドおよびワークフロースキルは、decision の操作を行うとき、次の参照経路を辿って decision の役割と正本の優先度を確認する:

- 正本の優先度（source-of-truth priority）は `inspect-docs` コマンド定義「不変条件」節を参照する
- decision の記録内容の規定は document-model Design「責務マトリックス」節を参照する

参照先の定義本文を、参照を追記する各所へ複製しない。「Decision を直接更新しない」規律と Decision の既存状態規則を変更せず、source-of-truth priority の順序自体を変更しない。

### promote 系操作の自律確定と HITL 境界

promote 系コマンド（intake-promote・learning-promote・inspect-promote）の判断が正規契約からの導出または委譲された裁量の範囲で確定できる対象はユーザー承認なしで確定する（自律確定）。人間に留保された判断が必要な対象のみを HITL 対象とする。
同一実行内に自律確定可能な対象と人間に留保された判断が必要な対象が混在する場合、未決項目に依存しない対象を先行確定する（部分自律確定）。
自律確定はユーザー承認の擬制ではなく、保留・未処理の対象を自動削除しない安全境界は維持する。
自律確定可否の詳細判定（確定権限3分類〔正規契約からの導出・委譲された裁量・人間に留保された判断〕の判定表、人間判断への引き上げ条件）は v4-responsibility-boundaries Design（extension 経由で解決）「ADF判断アーキテクチャ詳細基準」節が集約所有し、本節と各 command 定義・Workflow Skill は判定表を複製しない。

### inspect-* コマンド選択 routing

変更ファイル種別に基づき、実行する inspect-* コマンドを選ぶ。inspect-docs と inspect-skills は配布物（`.opencode/commands/agentdev/`、`.opencode/skills/agentdev-*/`）の検出対象が一部重複する（inspect-docs の配布物整合性検査、inspect-skills の配布物構文健全性・責務整合診断）。変更範囲に応じて振り分けることで重複検出を防ぐ。

| 変更ファイル種別 | 実行コマンド |
|------|------|
| docs の requirements・decisions 配下の文書 | inspect-docs |
| docs の designs 配下の Design（command Design・skill Design 配下を除く） | inspect-docs |
| docs の guides 配下の文書、README.md | inspect-docs |
| `.opencode/commands/**/*.md`、`.opencode/skills/**/*.md` | inspect-skills |
| `.opencode/commands/**/*.md`、`.opencode/skills/**/*.md`（実行時プロジェクション） | inspect-skills |
| docs の designs 配下の command Design・skill Design 配下 | inspect-skills |
| 上記両方（docs と command/skill にまたがる変更） | inspect-docs を先に実行し、続けて inspect-skills を実行 |

振り分けは実行コマンド選択の目安であり、各コマンドの検出対象（既定のスキャン範囲）は変更しない。
配布物のみの変更時は inspect-skills を優先する。

## 文章品質・書込み規約（反復規則の単一正本）

本節は、case 系 workflow 拡張（agentdev-workflow-case-auto、case-open、case-ready、case-revise、case-run、case-close、workflow-issue の project extension rules）に反復していた文章品質規則（yomiyasu 推敲と書込み guard の説明）の本文の正本である。
各 workflow 拡張と工程側 references は対象範囲と呼出条件のみを保持し、本節への名レベル参照により規則本文を消費する。規則本文を各ファイルへ複製しない。本節の配置変更は公開契約の変更として扱う。

### yomiyasu 推敲の適用規律

docs/** の日本語文章を変更する場合、編集前に yomiyasu を読み込み、内容変更が揃った後に変更文章と周辺文脈を推敲し、同梱 lint を実行して指摘を確認してから提出する。各 edit ごと・既存文書全体の一括推敲は不要。

lint の実行経路: `.opencode/skills/yomiyasu/scripts/yomiyasu_lint.py` を、環境で利用可能な Python コマンド（python3 に固定しない）で実行する。標準入力・パイプ・リダイレクト経由の本文渡しは使わず、検査専用本文ファイルを非永続領域（リポジトリ外の一時ディレクトリ等）に新規作成して lint のファイル引数実行を行い、検査後に当該ファイルを削除する。パイプ・リダイレクト経由の本文渡しが Windows 環境の文字コード再符号化により本文を破損し得る事象の詳細と標準回避手段は、docs/knowledge/windows-powershell-bulk-io-corruption.md を参照する（必要なときだけ参照する条件付き参照）。

GitHub 文章（Issue/PR タイトル・本文、説明・レビュー・完了コメント。委譲先能力スキル〔agentdev-issue-management、agentdev-workflow-templates、agentdev-epic-tracker、agentdev-quality-gates、agentdev-case-run-execution-adapter〕経由の書込みを含む）は agentdev_gh へ渡す前に推敲する。本文は lint・指摘確認後、タイトルは本文向け文長・箇条書き比率を合否条件にしない。書込み後 VERIFY は維持する。

更新は変更文章と周辺文脈を対象とし、他者の文章・引用・ログを無断でリライトしない。ラベル・状態・チェックボックスのみの変更は再推敲不要。

推敲は要件の必須性、条件、責任主体、数値、否定条件を保持し、識別子、リンク、コード、引用、固定テンプレート、表構造、AUTOGEN 部分を保護する。既存の用語辞書と文書契約を優先し、曖昧な主体を推測で補わない。箇条書きの削減と否定対比の肯定化を機械的に適用しない。

適用済みは推敲・lint・指摘確認までを指す（修正不要の確認を含む）。警告ゼロ・スコア閾値・--strict を要求せず、lint の通常終了コード 0 を指摘なし・推敲済みの証明として扱わない。正当な用語への指摘は理由を記録して保持できる。修正試行は最大 2 回。

yomiyasu 未導入・lint 実行失敗の場合は対象文章の提出・投稿・マージを停止する。適用確認は最後の文章変更後に行い、親セッションの読込事実のみで委譲先の適用を省略しない。

記録は既存 PR 検証欄等へ対象・実施結果・保持した指摘理由を最小限残し、記録のためだけの再帰的コメント投稿や追加永続管理を作らない。

### 書込み guard の拒否対象・許可対象と拒否後の回復

書込み規律を強制する guard の検出対象（実効範囲）は次のとおりであり、文書が規定する拒否対象・許可対象はこの実効範囲と一致する。

| guard | 拒否対象 | 許可対象 |
|---|---|---|
| textlint 書込み前 guard（pre-write plugin） | docs/** を対象とする書込みのうち、拒否対象（hard）違反を含む内容のディスク反映。プロジェクトルート外パスへの書込み（いずれも fail-closed） | プロジェクトルート内の標準対象外ファイルへの書込み |
| 配布依存境界 guard | src/common/commands/agentdev/** と src/common/skills/agentdev-*/** への書込みのうち、producer 側 concrete ID（要件・Decision・ADR 系 ID と未分類の大文字-数字系 ID）、docs の要件・Decision・ADR 系パス、producer リポジトリの blob/raw URL、producer 側トレーサビリティ metadata の直書き（いずれも fail-closed。検査不能も拒否） | リポジトリ top-level の traceability/ 配下 sidecar への対応宣言登録。OS の一時ディレクトリ等の配布対象外パスへの書込み |
| GitHub 書込み guard | agentdev_gh Custom Tool を迂回する生 gh WRITE コマンド（issue・pr・label・release 等の WRITE 系サブコマンドと gh api の書込みメソッド）の bash 経由実行（fail-closed） | gh の読み取り系コマンドと、agentdev_gh Custom Tool 経由の書込み |

guard による書込みブロックは fail-closed として維持し、guard の解除・迂回を行わない。
拒否後の回復は、許可された配置先への変更による: プロジェクトルート外への書込みが拒否された場合は、作成先をプロジェクトルート内の実行時作業領域（worktree 実行時は worktree root 配下。退避ファイルの分類規律に従う）へ変更する。別の書込み手段で同じプロジェクトルート外の配置先へ書き込む選択肢（別 API 経路での迂回書込み）は案内しない。配布物本文への直書きが拒否された場合は、対応関係を traceability sidecar へ登録する（書込み手段の代替ではなく配置先の変更）。
worktree 操作文脈での標準手段への切替と退避配置の分類規律は、`agentdev-git-worktree` スキル「書込み guard 運用指針」節を参照する（必要なときだけ参照する条件付き参照）。

### 障害対応知識の条件付き参照

例外回復・検証の障害知識は本文へ複製せず、次の条件が発生したときだけ参照先を読む。通常工程の常時手順は縮小してよいが、次の参照経路を通じて障害時の回復手順へ到達できることを維持する:

- shell inline・heredoc に起因するコンテンツ伝達破損（3機構）の別個の検知方法と判別、切替手段: docs/knowledge/windows-git-bash-inline-content-corruption.md
- bun test の実行形態逸脱（3分割正規形からの逸脱）の検知条件と判別観点: docs/knowledge/bun-test-execution-form-drift-signals.md
- checker CLI の stdout 証跡が Windows + bun で失われる問題の安定実行経路: docs/knowledge/checker-cli-stdout-loss-on-windows-bun.md
- 長時間機械工程の timeout 切断耐性と証跡の stdout/stderr 分離退避: docs/knowledge/long-running-mechanical-step-background-execution.md
- worktree 環境差 fail の由来分離手順と依存前提の実行形態知見: docs/knowledge/worktree-environment-fail-classification.md
- PowerShell 経由の UTF-8 破壊（一括読み書き・パイプ・リダイレクト）の標準回避手段: docs/knowledge/windows-powershell-bulk-io-corruption.md

## See Also

- **agentdev-issue-management**: Issue作成、更新、リンク、確認の安全手順（操作用Skill）
- **agentdev-intake-pipeline**: intake抽出、promote review/分類/整形/振り分け基準
- **agentdev-backlog-integration**: backlog-review統合、分割判定、矛盾検出、RU生成
- **agentdev-req-structure-diagnostics**: inspect-docs/ REQ構造診断基準
- **agentdev-workflow-routing**: レビューNG時の対応フロー、次コマンド推論
- **agentdev-workflow-orchestration**: case-run状態機械、自律修正ループ
