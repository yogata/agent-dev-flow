# v3 -> v4 処遇一覧（crosswalk inventory）

位置づけ: 本ファイルは v3-v4-crosswalk Design の references であり、現行 v3 成果物の
v4 処遇の完全一覧（正本）を所有する。列 schema と運用規則は親 Design を参照。

## REQ（現行 53）

| 対象 | 意味処遇 | 帰属 | 実行段階 | 確定状態 | 備考 |
|---|---|---|---|---|---|
| REQ-001 | redefine | ― | 3 | executed | 最小 UPDATE（行 ID 全て不変・行数不増）。第3段实行（Case #2973、merge a098b0f1） |
| REQ-002 | redefine | semantic Skill | 8 | executed | 三層・実装帰属確定後に再編。第8段実行 2026-09-20（Case #3011、Definition merge 21434202、実装 merge eac6a5e9/b1207a0f/733eb40d/b0738869、fan-in fix 1befae99）。redefine（目的節接続・要件行文言不変） |
| REQ-003 | redefine | Adapter | 8 | executed | authority 格子（DEC-039）への一般化。第8段実行 2026-09-20（Case #3011、Definition merge 21434202、実装 merge eac6a5e9/b1207a0f/733eb40d/b0738869、fan-in fix 1befae99）。redefine（目的節接続・要件行文言不変） |
| REQ-004 | redefine | ― | 4 | executed | req-define 入口の v4 入力意味。第4段实行 2026-09-19（Case #2979、merge 79dd12e6/3801398d/96202fdb/2e74d2c8/1e462085） |
| REQ-005 | redefine | ― | 4 | executed | 内部 lifecycle 状態遷移への回収。第4段实行 2026-09-19（Case #2979、merge 79dd12e6/3801398d/96202fdb/2e74d2c8/1e462085） |
| REQ-006 | redefine | ― | 4 | executed | 自走オーケストレーションの v4 再編。第4段实行 2026-09-19（Case #2979、merge 79dd12e6/3801398d/96202fdb/2e74d2c8/1e462085） |
| REQ-007 | redefine | ― | 6 | executed | Quality/Verification/Evidence/Gate 分解。第6段実行 2026-09-19（Case #2997、Definition merge 7d717d8b、実装 merge 95f9655516592b82c710fac55ae6352d981dbcd1・ffccea6a9c35cb32f82428c4a63ffa8389a0993b） |
| REQ-008 | redefine | ― | 4 | executed | 一時成果物ライフサイクルの v4 整理。第4段实行 2026-09-19（Case #2979、merge 79dd12e6/3801398d/96202fdb/2e74d2c8/1e462085） |
| REQ-009 | redefine | ― | 12 | planned | 配布基盤・導入の migration implementation |
| REQ-010 | redefine | deterministic code/tool | 6 | executed | 検証基盤の Gate モデル接続。第6段実行 2026-09-19（Case #2997、Definition merge 7d717d8b、実装 merge 95f9655516592b82c710fac55ae6352d981dbcd1・ffccea6a9c35cb32f82428c4a63ffa8389a0993b） |
| REQ-011 | redefine | Adapter | 11 | planned | I/O 境界の adapter 再編 |
| REQ-012 | redefine | ― | 7 | executed | Change/Evidence 再中心化（DEC-037）。第7段実行 2026-09-19（Case #3004、Definition merge fa1b5ac9、実装 merge 236e6cf4・40098b27）。redefine（目的節接続・要件行文言不変） |
| REQ-014 | keep | ― | ― | planned | adversarial-review は v4 でも保持 |
| REQ-015 | keep | ― | ― | planned | 同上 |
| REQ-016 | keep | ― | ― | planned | 同上 |
| REQ-017 | redefine | ― | 4 | executed | Issue Execution Contract の v4 整理。第4段实行 2026-09-19（Case #2979、merge 79dd12e6/3801398d/96202fdb/2e74d2c8/1e462085） |
| REQ-018 | keep | ― | ― | planned | worktree 構造制約は維持 |
| REQ-019 | keep | ― | ― | planned | テスト影響範囲 gate は維持 |
| REQ-021 | redefine | ― | 7 | executed | トレーサビリティのワークフロー統合 v4 版。第7段実行 2026-09-19（Case #3004、Definition merge fa1b5ac9、実装 merge 236e6cf4・40098b27）。redefine（目的節接続・要件行文言不変） |
| REQ-027 | redefine | semantic Skill | 8 | executed | Capability Skill 再分類。第8段実行 2026-09-20（Case #3011、Definition merge 21434202、実装 merge eac6a5e9/b1207a0f/733eb40d/b0738869、fan-in fix 1befae99）。redefine（目的節接続・要件行文言不変） |
| REQ-029 | keep | ― | ― | planned | 配布依存境界は移行期間維持 |
| REQ-030 | redefine | ― | 4 | executed | case-open 内部状態への回収。第4段实行 2026-09-19（Case #2979、merge 79dd12e6/3801398d/96202fdb/2e74d2c8/1e462085） |
| REQ-031 | redefine | ― | 4 | executed | case-run 内部状態への回収。第4段实行 2026-09-19（Case #2979、merge 79dd12e6/3801398d/96202fdb/2e74d2c8/1e462085） |
| REQ-032 | redefine | ― | 4 | executed | case-close 内部状態への回収。第4段实行 2026-09-19（Case #2979、merge 79dd12e6/3801398d/96202fdb/2e74d2c8/1e462085） |
| REQ-034 | redefine | ― | 4 | executed | case-auto の v4 再編。第4段实行 2026-09-19（Case #2979、merge 79dd12e6/3801398d/96202fdb/2e74d2c8/1e462085） |
| REQ-035 | redefine | ― | 5 | executed | Epic/Wave 語彙の再定義。第5段实行 2026-09-19（Case #2988、Definition merge b86354a9、実装 merge 0f8b1e10/abf77201/70bf897d、fan-in fix 57664e33） |
| REQ-036 | keep | ― | ― | planned | inspect 系診断は維持 |
| REQ-037 | redefine | ― | 9 | executed | Intake の継続コラボレーションループ化。第9段実行 2026-09-20（Case #3022、Definition merge 1ca97324、実装 merge a74cd237/8ced4e4d、learning 6c439a00）。redefine（目的節接続・要件行文言不変） |
| REQ-038 | redefine | ― | 9 | executed | Learning のループ化・7 系統振分。第9段実行 2026-09-20（Case #3022、Definition merge 1ca97324、実装 merge a74cd237/8ced4e4d、learning 6c439a00）。redefine（目的節接続・要件行文言不変） |
| REQ-039 | redefine | ― | 9 | executed | Backlog のループ化。第9段実行 2026-09-20（Case #3022、Definition merge 1ca97324、実装 merge a74cd237/8ced4e4d、learning 6c439a00）。redefine（目的節接続・L13/L34 権威ポインタ張替え） |
| REQ-041 | redefine | ― | 9 | executed | backlog-auto のループ化。第9段実行 2026-09-20（Case #3022、Definition merge 1ca97324、実装 merge a74cd237/8ced4e4d、learning 6c439a00）。redefine（目的節接続・要件行文言不変）。no-op redefine 判断記録（第4段で要求入口化済みのため本段の目的節接続は実質変更なし・判断記録は Case #3022 本文） |
| REQ-044 | keep | ― | ― | planned | 標準API委譲の原則は維持 |
| REQ-045 | keep | ― | ― | planned | 網羅監査は第13段で実行 |
| REQ-046 | keep | ― | 13 | planned | 移行不変条件。第13段で retire 予約（v4 移行完了後に廃止判定） |
| REQ-047 | redefine | deterministic code/tool | 8 | executed | 規則所有権の semantic/deterministic 再編。第8段実行 2026-09-20（Case #3011、Definition merge 21434202、実装 merge eac6a5e9/b1207a0f/733eb40d/b0738869、fan-in fix 1befae99）。redefine（目的節接続・要件行文言不変） |
| REQ-048 | keep | ― | ― | planned | 観測評価ループは維持 |
| REQ-049 | keep | ― | ― | planned | 追跡Issue管理は維持 |
| REQ-050 | keep | ― | ― | planned | scripts 公開入口は維持 |
| REQ-051 | redefine | deterministic code/tool | 8 | executed | ガードレール識別体系の再編。第8段実行 2026-09-20（Case #3011、Definition merge 21434202、実装 merge eac6a5e9/b1207a0f/733eb40d/b0738869、fan-in fix 1befae99）。redefine（目的節接続・要件行文言不変） |
| REQ-052 | redefine | Adapter | 11 | planned | Custom Tool・Plugin 種別契約の adapter 再編 |
| REQ-053 | keep | ― | ― | planned | 文章品質契約は維持 |
| REQ-054 | keep | ― | ― | planned | 変更誘発境界リスク分析は維持 |
| REQ-055 | redefine | ― | 6 | executed | Verification/Evidence モデル接続。第6段実行 2026-09-19（Case #2997、Definition merge 7d717d8b、実装 merge 95f9655516592b82c710fac55ae6352d981dbcd1・ffccea6a9c35cb32f82428c4a63ffa8389a0993b） |
| REQ-056 | keep | ― | ― | planned | Project Knowledge は維持 |
| REQ-057 | keep | ― | ― | planned | docs corpus 整合は維持 |
| REQ-058 | keep | ― | ― | planned | 廃止時クリーンアップは維持 |
| REQ-059 | keep | ― | ― | planned | Decision/REQ 関連宣言管理は維持 |
| REQ-060 | keep | ― | ― | planned | bun test 実行形態は維持 |
| REQ-061 | redefine | ― | 4 | executed | case-ready 内部状態への回収。第4段实行 2026-09-19（Case #2979、merge 79dd12e6/3801398d/96202fdb/2e74d2c8/1e462085） |
| REQ-062 | redefine | ― | 4 | executed | case-revise 内部状態への回収。第4段实行 2026-09-19（Case #2979、merge 79dd12e6/3801398d/96202fdb/2e74d2c8/1e462085） |
| REQ-082 | keep | ― | ― | planned | 審議契約は維持 |
| REQ-083 | keep | ― | ― | planned | Definition PR 状態契約は維持 |
| REQ-087 | keep | ― | ― | planned | 採番例外記録は維持 |
| REQ-088 | create | ― | 3 | executed | 第3段新設（v4 基盤要件）。第3段实行（Case #2973、merge a098b0f1） |
| retired 12 件（REQ-013、020、022〜026、028、033、040、042、043） | keep | ― | ― | executed | retired 維持・識別子再利用禁止 |

## Decision（v3 側: DEC-001〜030、DEC-018 欠番。DEC-031〜039 は v4 側のため対象外）

| 対象 | 意味処遇 | 帰属 | 実行段階 | 確定状態 | 備考 |
|---|---|---|---|---|---|
| DEC-001 | keep | ― | ― | planned | 憲章。第13段 full validation で再確認 |
| DEC-002 | supersede | Adapter | 11 | planned | 配布・ソース分離の v4 再定義（adapter 境界） |
| DEC-003 | keep | ― | ― | planned | req_draft ソフトコントラクトは維持 |
| DEC-004 | keep | ― | ― | planned | I/O 境界原則は維持 |
| DEC-005 | keep | ― | ― | executed | superseded by DEC-006（履歴維持） |
| DEC-006 | keep | ― | ― | planned | inspect 3-command 構成は維持 |
| DEC-007 | keep | ― | ― | executed | superseded by DEC-017（履歴維持） |
| DEC-008 | keep | ― | ― | planned | bounded parent decision resolution は維持 |
| DEC-009 | keep | ― | ― | planned | Decision モデル移行は維持 |
| DEC-010 | redefine | semantic Skill | 8 | executed | 責務 3 層分化の v4 Skill 再編での再定義。第8段実行 2026-09-20（Case #3011、Definition merge 21434202、実装 merge eac6a5e9/b1207a0f/733eb40d/b0738869、fan-in fix 1befae99）。redefine（正本参照更新） |
| DEC-011 | keep | ― | ― | planned | STEP resume point は維持 |
| DEC-012 | redefine | Project Extension | 10 | planned | Extension の v4 semantic extension point 化 |
| DEC-013 | keep | ― | ― | planned | IR 登録モデル簡素化は維持 |
| DEC-014 | keep | ― | ― | planned | 配布依存境界は維持 |
| DEC-015 | supersede | ― | 8 | executed | 後継: DEC-036/038/039（責務分界の三層+権威モデルへの分解）。第8段実行 2026-09-20（Case #3011、Definition merge 21434202、実装 merge eac6a5e9/b1207a0f/733eb40d/b0738869、fan-in fix 1befae99）。supersede（frontmatter のみ・本文不変・17 識別子は v4-delegation-contracts が承継） |
| DEC-016 | keep | ― | ― | planned | 副作用ゼロ原則は維持 |
| DEC-017 | supersede | ― | 7 | executed | 後継: DEC-037（Change/Evidence 再中心化）。第7段実行 2026-09-19（Case #3004、Definition merge fa1b5ac9、実装 merge 236e6cf4・40098b27）。supersede（frontmatter のみ・本文不変・承継 ADF-COVERS 41 識別子 v4-traceability-model へ） |
| DEC-019 | keep | ― | ― | planned | 標準API委譲は維持 |
| DEC-020 | keep | ― | ― | planned | Issue 共通管理単位は維持 |
| DEC-021 | keep | ― | ― | planned | scripts 公開入口は維持 |
| DEC-022 | keep | ― | ― | planned | 実行定義層は維持 |
| DEC-023 | keep | ― | ― | planned | third-party Skill 管理は維持 |
| DEC-024 | keep | ― | ― | planned | 変更誘発境界リスク分析は維持 |
| DEC-025 | keep | ― | ― | planned | プロジェクト知識層は維持 |
| DEC-026 | keep | ― | ― | planned | realization_actions は維持 |
| DEC-027 | keep | ― | ― | planned | 観測ベース統制縮小は維持 |
| DEC-028 | keep | ― | ― | planned | 文章表層品質基盤は維持 |
| DEC-029 | supersede | ― | 4 | executed | 後継: DEC-033 + v4-standard-lifecycle（UX 2入口・内部 lifecycle）。第4段实行 2026-09-19（Case #2979、merge 79dd12e6/3801398d/96202fdb/2e74d2c8/1e462085） |
| DEC-030 | supersede | ― | 7 | executed | 後継: DEC-037（producer/consumer 境界の v4 再中心化）。第7段実行 2026-09-19（Case #3004、Definition merge fa1b5ac9、実装 merge 236e6cf4・40098b27）。supersede（frontmatter のみ・本文不変・承継 ADF-COVERS 41 識別子 v4-traceability-model へ） |

## Design（v3 側 accepted）

| 対象 | 意味処遇 | 帰属 | 実行段階 | 確定状態 | 備考 |
|---|---|---|---|---|---|
| designs/commands/*.md（19 件） | redefine | ― | 4 | executed | 公開 UX 2入口収斂・内部 lifecycle 回収に伴う再編。第4段实行 2026-09-19（Case #2979、merge 79dd12e6/3801398d/96202fdb/2e74d2c8/1e462085） |
| designs/skills/*.md（34 件、_template 含む） | redefine | semantic Skill | 8 | executed | semantic/deterministic 再分類（DEC-036）。第8段実行 2026-09-20（Case #3011、Definition merge 21434202、実装 merge eac6a5e9/b1207a0f/733eb40d/b0738869、fan-in fix 1befae99）。redefine（v4 責務分類節の追記型・本文再執筆なし） |
| workflows/workflow-contracts.md | supersede | ― | 4 | executed | v4-lifecycle-state-machine へ吸収（result 契約の 1 権威+導出投影への再編を含む）。第4段实行 2026-09-19（Case #2979、merge 79dd12e6/3801398d/96202fdb/2e74d2c8/1e462085） |（第4段 case-open 実行時点: Definition PR で後継吸収と宣言承継を実行。物理削除は docs-chore OU-003、executed 化は case-close）
| workflows/workflow-skill-model.md | redefine | semantic Skill | 8 | executed | 責務 3 層分化・1:N 分割・配置契約の v4 Skill 再編での再定義（DEC-010 実装詳細）。第8段実行 2026-09-20（Case #3011、Definition merge 21434202、実装 merge eac6a5e9/b1207a0f/733eb40d/b0738869、fan-in fix 1befae99）。redesign（DEC-036 接続・4 型表是正） |
| workflows/input-resolution-and-durable-state.md | supersede | ― | 4 | executed | v4-durable-state-and-recovery が一般化契約を承継。第4段实行 2026-09-19（Case #2979、merge 79dd12e6/3801398d/96202fdb/2e74d2c8/1e462085） |（第4段 case-open 実行時点: Definition PR で後継吸収と宣言承継を実行。物理削除は docs-chore OU-003、executed 化は case-close）
| workflows/step-reference-contract.md | supersede | ― | 4 | executed | 再開単位階層（STEP/処理単位/Case）の v4 再構成。第4段实行 2026-09-19（Case #2979、merge 79dd12e6/3801398d/96202fdb/2e74d2c8/1e462085） |（第4段 case-open 実行時点: Definition PR で後継吸収と宣言承継を実行。物理削除は docs-chore OU-003、executed 化は case-close）
| workflows/epic-wave-model.md | supersede | ― | 5 | executed | 階層合成+直列化単位への再編。語彙意味の再定義は第5段。第5段实行 2026-09-19（Case #2988、Definition merge b86354a9、実装 merge 0f8b1e10/abf77201/70bf897d、fan-in fix 57664e33） |
| workflows/definition-readiness.md | supersede | ― | 4 | executed | Definition lifecycle 部分ビューと冪等経路への整理。第4段实行 2026-09-19（Case #2979、merge 79dd12e6/3801398d/96202fdb/2e74d2c8/1e462085） |（第4段 case-open 実行時点: Definition PR で後継吸収と宣言承継を実行。物理削除は docs-chore OU-003、executed 化は case-close）
| workflows/backlog-artifact-lifecycle.md | supersede | ― | 9 | executed | RU/draft 部分ビューとして継続ループへ整理。第9段実行 2026-09-20（Case #3022、Definition merge 1ca97324、実装 merge a74cd237/8ced4e4d、learning 6c439a00）。supersede（物理削除・49 sole 承継〔v4LSM 4/v4DSR 11/Loop 4/backlog-review 3/req-define 27〕+ 11 二重被覆・8 被覆外節帰属表は Case #3022 本文） |
| workflows/delegation-contracts.md | supersede | ― | 8 | executed | 委譲単位の再開・result の v4 接続。第8段実行 2026-09-20（Case #3011、Definition merge 21434202、実装 merge eac6a5e9/b1207a0f/733eb40d/b0738869、fan-in fix 1befae99）。supersede（物理削除・集約後継 workflows/v4-delegation-contracts.md） |
| workflows/capture-boundaries.md | redefine | ― | 9 | executed | Intake/Learning 境界の v4 整理。第9段実行 2026-09-20（Case #3022、Definition merge 1ca97324、実装 merge a74cd237/8ced4e4d、learning 6c439a00）。redefine（in-place・v4 接続節 + 検出事項プロトコル帰属宣言） |
| workflows/references/execution-unit-construction.md | supersede | ― | 5 | executed | execution_unit 構成の v4 再編（Wave モデル改訂に追随）。第5段实行 2026-09-19（Case #2988、Definition merge b86354a9、実装 merge 0f8b1e10/abf77201/70bf897d、fan-in fix 57664e33）・in-place v4 再編として実行 |
| foundations/numbering-policy.md | keep | ― | ― | planned | 採番規則は v4 でも維持 |
| foundations/system.md | redefine | ― | 4 | executed | コマンドシステム構成の v4 再編。第4段实行 2026-09-19（Case #2979、merge 79dd12e6/3801398d/96202fdb/2e74d2c8/1e462085） |
| foundations/document-model.md | redefine | ― | 3 | executed | 本段: モデル定義 Design 昇格条件と移行期間優先規則の最小 UPDATE。第3段实行（Case #2973、merge a098b0f1） |
| foundations/decision-lifecycle.md | redefine | ― | 4 | executed | 本段は権威移行注記のみ。Decision status 部分ビュー整理は第4段。第4段实行 2026-09-19（Case #2979、merge 79dd12e6/3801398d/96202fdb/2e74d2c8/1e462085） |
| foundations/patterns.md | keep | ― | ― | planned | 共通フォーマット規約は維持 |
| foundations/design-principles.md | keep | ― | ― | executed | 設計原則は維持（第5段: work_type×scale→workflow_route 導出表を v4 直交性へ準拠改訂〔一次表現 Definition 構成・direct_case は導出結果ラベル〕、keep 処遇維持・内容更新）。第5段实行 2026-09-19（Case #2988、Definition merge b86354a9、実装 merge 0f8b1e10/abf77201/70bf897d、fan-in fix 57664e33） |
| foundations/project-extensions.md | redefine | Project Extension | 10 | planned | semantic extension point 化 |
| foundations/harness-separation-model.md | redefine | Adapter | 11 | planned | adapter 境界の再編 |
| foundations/traceability-model.md | supersede | ― | 7 | executed | v4-traceability-model が承継（DEC-037）。第7段実行 2026-09-19（Case #3004、Definition merge fa1b5ac9、実装 merge 236e6cf4・40098b27）。supersede（物理削除・吸収節は v4-traceability-model） |
| foundations/references/concrete-abstraction.md | keep | ― | ― | planned | 具体抽象化参照は維持 |
| responsibilities/document-type-responsibilities.md | redefine | ― | 4 | executed | v4 中核文書モデルの執筆規約反映。第4段实行 2026-09-19（Case #2979、merge 79dd12e6/3801398d/96202fdb/2e74d2c8/1e462085） |
| responsibilities/artifact-responsibilities.md | redefine | semantic Skill | 8 | executed | 成果物責任表の v4 再編。第8段実行 2026-09-20（Case #3011、Definition merge 21434202、実装 merge eac6a5e9/b1207a0f/733eb40d/b0738869、fan-in fix 1befae99）。redefine（in-place） |
| responsibilities/artifact-contracts.md | redefine | semantic Skill | 8 | executed | アーティファクト契約の v4 再編。第8段実行 2026-09-20（Case #3011、Definition merge 21434202、実装 merge eac6a5e9/b1207a0f/733eb40d/b0738869、fan-in fix 1befae99）。redefine（in-place） |
| responsibilities/req-impact-map.md | keep | ― | ― | planned | REQ 影響マップは維持 |
| responsibilities/responsibility-boundary-purification.md | redefine | Adapter | 11 | planned | 責務境界浄化の adapter 再編 |
| responsibilities/artifact-quality-control-routing.md | redefine | ― | 6 | executed | Gate モデル接続。第6段実行 2026-09-19（Case #2997、Definition merge 7d717d8b、実装 merge 95f9655516592b82c710fac55ae6352d981dbcd1・ffccea6a9c35cb32f82428c4a63ffa8389a0993b） |
| responsibilities/custom-tool-contracts.md | redefine | Adapter | 11 | planned | Custom Tool 操作契約・迂回防止の adapter 再編（REQ-052 対応 Design） |
| quality/quality-specs.md | redefine | ― | 6 | executed | Quality 5 概念への再編。第6段実行 2026-09-19（Case #2997、Definition merge 7d717d8b、実装 merge 95f9655516592b82c710fac55ae6352d981dbcd1・ffccea6a9c35cb32f82428c4a63ffa8389a0993b） |
| quality/quality-gates.md | supersede | ― | 6 | executed | v4-quality-gate-model が承継（DEC-035）。第6段実行 2026-09-19（Case #2997、Definition merge 7d717d8b、実装 merge 95f9655516592b82c710fac55ae6352d981dbcd1・ffccea6a9c35cb32f82428c4a63ffa8389a0993b） |
| quality/req-health-metrics.md | keep | ― | ― | planned | REQ 健全性メトリクスは維持 |
| quality/design-health-metrics.md | keep | ― | ― | planned | Design 健全性メトリクスは維持 |
| quality/textlint-quality-runtime.md | keep | ― | ― | planned | textlint 基盤は維持 |
| integrity/*.md（14 件）+ integrity/rules/IR-NNN 群 | keep | deterministic code/tool | ― | planned | 検証基盤は v4 でも維持。個別再編が必要になった時点で個別行へ展開 |
| local/*.md（4 件） | redefine | Adapter | 11 | planned | backend 抽象・物理写像への整理 |
| authoring/command-file-format.md | redefine | ― | 8 | executed | コマンド執筆規約の v4 再編。第8段実行 2026-09-20（Case #3011、Definition merge 21434202、実装 merge eac6a5e9/b1207a0f/733eb40d/b0738869、fan-in fix 1befae99）。redefine（in-place） |
| authoring/vocabulary-registry.md | redefine | ― | 5 | executed | 語彙直交性の再定義への接続。第5段实行 2026-09-19（Case #2988、Definition merge b86354a9、実装 merge 0f8b1e10/abf77201/70bf897d、fan-in fix 57664e33） |

## その他（概念・実装資産）

| 対象 | 意味処遇 | 帰属 | 実行段階 | 確定状態 | 備考 |
|---|---|---|---|---|---|
| scripts/**（決定的ツール・検証スイート） | redefine | deterministic code/tool | 8 | executed | semantic/deterministic 再分類。第8段実行 2026-09-20（Case #3011、Definition merge 21434202、実装 merge eac6a5e9/b1207a0f/733eb40d/b0738869、fan-in fix 1befae99）。redefine（所有権宣言の再編・物理移動なし） |
| traceability/**（sidecar・policy 機構） | redefine | ― | 7 | executed | Change/Evidence 再中心化。第7段実行 2026-09-19（Case #3004、Definition merge fa1b5ac9、実装 merge 236e6cf4・40098b27）。redefine（機構搬送範囲表で v4 側に定義・実データ 21 sidecar + policy.yaml 不変） |
| Command/Skill/Custom Tool/Plugin（概念） | redefine | ― | 8 | executed | 実装責務境界の再分類。第8段実行 2026-09-20（Case #3011、Definition merge 21434202、実装 merge eac6a5e9/b1207a0f/733eb40d/b0738869、fan-in fix 1befae99） |
| .agentdev/ 状態領域（概念） | redefine | Project Model | 9 | executed | durable state 5 分類への整理。第9段実行 2026-09-20（Case #3022、Definition merge 1ca97324、実装 merge a74cd237/8ced4e4d、learning 6c439a00）。redefine（Loop Design の .agentdev 整合表で実体化） |
| Intake/Learning/Backlog（概念） | redefine | ― | 9 | executed | 継続コラボレーションループ。第9段実行 2026-09-20（Case #3022、Definition merge 1ca97324、実装 merge a74cd237/8ced4e4d、learning 6c439a00）。redefine（v4-collaboration-loop Design で実体化） |
| work_type/scale/workflow_route（概念） | redefine | ― | 5 | executed | 語彙直交性への再定義。第5段实行 2026-09-19（Case #2988、Definition merge b86354a9、実装 merge 0f8b1e10/abf77201/70bf897d、fan-in fix 57664e33） |
| Epic/Wave（概念） | redefine | ― | 5 | executed | 階層合成・実行スケジューリング。第5段实行 2026-09-19（Case #2988、Definition merge b86354a9、実装 merge 0f8b1e10/abf77201/70bf897d、fan-in fix 57664e33） |
| QG-1〜QG-4（概念） | redefine | Standard Operating Model | 6 | executed | Quality 5 概念分解・Gate 再導出。第6段実行 2026-09-19（Case #2997、Definition merge 7d717d8b、実装 merge 95f9655516592b82c710fac55ae6352d981dbcd1・ffccea6a9c35cb32f82428c4a63ffa8389a0993b）。QG-1〜QG-4 の SSoT 所在は quality/v4-quality-gate-model Design（再導出結果表・個別処遇対応表） |
| 配布物・プロジェクション（概念） | redefine | ― | 12 | planned | migration implementation |
