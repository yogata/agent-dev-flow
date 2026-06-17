# Requirements Index

## Active Requirements

現在の要件判断では、以下27件（REQ-0111, REQ-0115, REQ-0116, REQ-0117, REQ-0118, REQ-0120, REQ-0121, REQ-0122 は retired）を第一参照先とする。旧REQ 50件はすべて retired であり、履歴参照に限定する。

| REQ ID | タイトル | 関心対象 |
|---|---|---|
| [REQ-0101](REQ-0101.md) | 文書・REQ管理基準 | REQ/retired REQ/ADR/SPEC/DOC-MAP/guides の基準境界、ADR記述対象境界（意思決定のみ・作業手段除外・既存ADR重複確認） |
| [REQ-0102](REQ-0102.md) | 要件定義・保存 | req-define / req-save / Requirement Source / 分類ゲート |
| [REQ-0103](REQ-0103.md) | Artifact責任分界 | command / skill / template / script の責務境界、namespace、frontmatter 規約、runtime-only 配布制約、repo-local namespace・配布対象外制約、Skill 粒度・参照妥当性 |
| [REQ-0104](REQ-0104.md) | Workflow / Command Protocol | ワークフロー、work_type + scale 分類、workflow_route、SSoT、case-open/run/close基本契約、case-open共通終了の全フロー共通化、upstream handoff protocol |
| [REQ-0105](REQ-0105.md) | RU lifecycle / Requirement Unit 管理 | RU lifecycle（生成・削除タイミング・一時成果物位置づけ）、session-sourced RU、RU frontmatter メタデータ、promoted/ の RU 化対象統一 |
| [REQ-0106](REQ-0106.md) | Case実行オーケストレーション / Epic・Wave | Epic/Wave 並列実行、親Issue SSoT・子Issue実行状態整合、Wave rebase・コンフリクト時停止、委譲プロンプト事後検証、子Issue ⏭スキップ終了状態 |
| [REQ-0107](REQ-0107.md) | Reporting / Writing Quality | 完了報告、GitHub本文品質、リンク、AI-slop抑止 |
| [REQ-0108](REQ-0108.md) | docs-check / Validation / Tests | 整合性検査、finding分類・route、レポート出力、ガードレール、体系的テスト、frontmatter 規約検査、artifact collection registry、source/projection scan分離、baseline管理、rule catalog、REQ impact map、3層gate、meta-integrity、repo-local自己監査・配布対象外、ADR主題妥当性検出 |
| [REQ-0109](REQ-0109.md) | inspect-docs / REQ体系整合性 | retired archive、移行表、REQ再構成intake、REQ再構成レビューコマンド、100番台採番 |
| [REQ-0110](REQ-0110.md) | Git worktree cleanup 信頼性 | git-worktree、リトライ、cleanup、prune フォールバック、tracked files 復元、Windows + junction フォールバック |
| [REQ-0112](REQ-0112.md) | ADRライフサイクル・文書体系基盤・runtime独立性 | ADR status正規化、RU-ID排除、work_type固定、Pattern退場、6状態否定、integrity検査追加、ADR全面改定例外・01XX baseline・retired移動 |
| [REQ-0113](REQ-0113.md) | Skill References SPEC分離 | skill / skill references 内 SPEC 相当記述の分離基準、移管先 SPEC 選択、runtime 自己完束制約 |
| [REQ-0114](REQ-0114.md) | /agentdev/case-auto 最大自走モード | case-auto orchestration、入力解決、work_type分岐、自走対象/対象外、停止条件、Epic flowクリーンアップ検証ゲート、Standard flow複数draft一括処理 |
| [REQ-0119](REQ-0119.md) | コマンド・スキル・サブエージェント責務分界 | command 薄型化 / skill 詳細移管 / sub-agent 委譲境界 / Step 整数化 / verbatim 条件付き / delegation_type SPEC降格 / ADR-0112 accepted化 |
| [REQ-0123](REQ-0123.md) | workflow-lifecycle 宣言的定義責務とコマンド固有手順のスキル分担 | workflow-lifecycle 責務限定実装 / 4新規スキル移管 / Skill粒度基準 / DO NOT USE FOR整合 |
| [REQ-0124](REQ-0124.md) | AgentDevFlow inspect-* 検出コマンド群と inspect lifecycle | inspect-docs/skills/promote 命名統一、diagnostics→inspect 全面改名完了状態、draft type 単一化、inspect domain state、inspect 命名恒久制約 |
| [REQ-0125](REQ-0125.md) | inspect-skills / Command/Skill参照妥当性検出 | Command→Skill参照妥当性、Skill構造、read-only診断、finding出力、推奨route提示 |
| [REQ-0126](REQ-0126.md) | inspect-promote / 検出finding分類・昇格 | inspect finding分類（promote/defer/reject）、HITL承認、promoted artifact生成 |
| [REQ-0127](REQ-0127.md) | Intake command群 (capture / from-github / promote) | intake-capture / intake-from-github / intake-promote、`.agentdev/intake/` domain state、accepted/ 不使用、intake/learning capture 責務境界、REQ再構成intake ルーティング分離 |
| [REQ-0128](REQ-0128.md) | Learning-promote | learning-promote、`.agentdev/learning/` domain state、8-axis 評価、HITL 確定、promote/defer/reject/duplicate 判定 |
| [REQ-0129](REQ-0129.md) | Backlog-review | backlog-review、RU 直接生成、promoted artifact 読込・統合・矛盾検出、depends_on（RU-ID限定・循環依存検証）、REQ再構成intake ルーティング分離 |
| [REQ-0130](REQ-0130.md) | case-run / 実装パイプライン | case-run、作業用 worktree 実装、PR 作成、QG-3（PR作成直前ゲート）、本筋外 Finding PR本文記録、capture 責務境界（inbox 非変更・PR本文経由引き継ぎ） |
| [REQ-0131](REQ-0131.md) | case-close / 完了処理 | case-close、完了ゲート、PR merge（squash・リトライ・フォールバック）、Issue close、capture 回収（PR本文→domain state）、branch/worktree cleanup、ローカル変更検出時の安全停止、force-with-lease制約 |
| [REQ-0132](REQ-0132.md) | case-open / Issue作成 | case-open、Issue本文生成（REQ番号埋め込み）、Standard/Epic flow ルーティング、RU削除責務（Issue作成+VERIFY成功後）、capture 非関与 |
| [REQ-0133](REQ-0133.md) | case-update / Issue更新 | case-update、Issue本文更新（テンプレート構造維持）、コメント追加、REQ ファイル更新（直接commit+push）、レビューNG対応、フェーズ維持 |
| [REQ-0134](REQ-0134.md) | 配布基盤: source/projection・sync・repo type・consumer install | source/projection layout、sync/migration script、repo type、consumer install |
| [REQ-0135](REQ-0135.md) | Drafts配置・Draft Type Registry | `.agentdev/drafts/` 配置ルール、draft type registry、`.sisyphus/` 除外 |

## Retired Requirements

旧REQは削除せず、[retired/](retired/) に移動した。retired REQ は履歴・根拠の参照用であり、現行要件判断に使わない。

| 範囲 | 状態 | 備考 |
|---|---|---|
| 旧REQ 50件 | retired | 2026-05-30 の再構成で active set から除外 |
| REQ-0111 | retired | REQ-0119-025 により retired（2026-06-14）。条項は他REQへの吸収なしで廃止 |
| REQ-0122 | retired | RFC2119 完全廃止の目的達成（PR #743）により retired（2026-06-15）。条項は他REQへの吸収なしで廃止 |
| REQ-0116 | migrated→retired | 文書分類ポリシー定義の恒久内容を REQ-0101 に吸収（REQ-0101-057/058）。OU-04 再編成で retired（2026-06-16）。`retired/REQ-0116.md` 参照 |
| REQ-0118 | migrated→retired | Subagent edit safety 制約を REQ-0119 に吸収（REQ-0119-027）。OU-04 再編成で retired（2026-06-16）。`retired/REQ-0118.md` 参照 |
| REQ-0120 | migrated→retired | Runtime Command 非必須参照除去を REQ-0103 に吸収（REQ-0103-152）。OU-04 再編成で retired（2026-06-16）。`retired/REQ-0120.md` 参照 |
| REQ-0121 | migrated→retired | Runtime Command 規範語を REQ-0103（REQ-0103-152）、Integrity 検査を REQ-0108（REQ-0108-242/243）に吸収。OU-04 再編成で retired（2026-06-16）。`retired/REQ-0121.md` 参照 |
| REQ-0115 | migrated→retired | docs-* command suite の恒久要件を REQ-0108（docs-check 検査責務）、REQ-0109（inspect-docs）、REQ-0124（inspect 命名恒久制約）へ移行。タイトルが移行主題であり REQ-0124-021 に抵触。OU-05 再編成で retired（2026-06-16）。`retired/REQ-0115.md` 参照 |
| REQ-0117 | migrated→retired | Git worktree junction cleanup フォールバック手順を REQ-0110 に統合（REQ-0110-008）。OU-06 再編成で retired（2026-06-16）。`retired/REQ-0117.md` 参照 |

## Migration Table

[mapping-table.md](mapping-table.md) は旧REQごとの移行判定を保持する。

| 判定 | 意味 |
|---|---|
| migrated | 新active REQへ要件内容を移行した |
| retired-no-successor | 最新方針では不要なため新active REQへ移行しない |
| historical-only | 当時の判断・経緯として残すが現行要件ではない |

## 基準構造

- active REQ: `docs/requirements/REQ-{NNNN}.md`
- retired REQ: `docs/requirements/retired/REQ-{NNNN}.md`
- retired REQ のIDは再利用しない
- 文書間に矛盾がある場合は active REQ を優先する
- `.sisyphus/` は現行REQ体系の管理対象に含めない
