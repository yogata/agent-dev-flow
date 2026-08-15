# inspect promoted artifact 20260815T082159Z

- **source**: `.agentdev/inspect/inbox/inspect-docs-finding-20260815T082159Z.md`（inspect-docs 診断）
- **source_type**: inspect
- **disposition 経緯**: inspect-promote 暫定分類 → adversarial-review 経路B（2系統独立 stream + counter-challenge + convergence audit）→ HITL 確定（promote 13 / defer 3 / reject 3）
- **本成果物の性質**: promote 採用済み、backlog-review の RU 化対象。審議で検出された引用誤り（対象 REQ・行番号）は本成果物で訂正済み。元 finding ファイルの記載と差異がある場合は本成果物を正とすること

## 統合単位 1: REQ SPEC分離基準違反群（F-04〜F-12、9検出事項）

同一の修正形状（REQ 要件行の SPEC 分離基準違反 → WHAT に抽象化し HOW を SPEC へ移送、または安定契約例外として REQ 残置を明確化）を持つ群。req-define で REQ 単位のまとまった協議を推奨（元 finding の推奨アクションに準拠）。

### F-04+F-05（統合）: REQ-001 の Decision 変更分類 enum 残留

- **target（訂正済み）**: docs/requirements/REQ-001.md:73-74（REQ-001-057/058）
- **evidence**: REQ-001-057「直接更新可能な非意味修正は6件（誤字/文字化け修正、壊れたリンク/誤ったファイルパス修正、タイトル本文不一致修正、意味を変えない表記統一、移行時ラベル除去、補助情報修正）とすること」、REQ-001-058「後継 Decision を必要とする意味変更は6件（決定内容の追加/削除、適用範囲変更、必須条件/制約変更、正規所有者変更、採用方式変更、外部観測可能結果変更）とすること」
- **confidence**: medium（審議で引き下げ）
- **notes（審議結果）**: REQ-001.md:82 に case-run #1813 による REQ-001-056..060 acceptance criteria 検証済み・SPEC 整合確認済みの verified コメントがあり、意図的に調整されたガバナンス enum の可能性。ただし REQ-001-062 が「具体的なフィールド名、enum、serialization 形式は SPEC の責務とする」と自ら宣言しており、Decision 関係の enum 責務原則との整合協議が必要。移送先候補: document-model SPEC / decision-lifecycle SPEC
- **ng_classification**: pre-existing

### F-06: REQ-002 の Extension 種別定義残留

- **target**: docs/requirements/REQ-002.md:40（REQ-002-030）
- **evidence**: 「Project Extensions は workflow/capability responsibility 中心の単位で配置すること。Workflow Extension / internal Workflow Extension / Capability Skill Extension の3種を定義すること。」
- **confidence**: medium（安定契約例外候補）
- **notes**: 種別分類は外部接続契約に近い。DEC-012 が種別再編の Decision を所有。REQ は「3種」の列挙ではなく種別基準の存在要求に留める案を協議
- **ng_classification**: pre-existing

### F-07: REQ-005 の command 分類 enum 残留

- **target**: docs/requirements/REQ-005.md:26（REQ-005-010）
- **evidence**: 「全公開 command は主フロー、最大自走入口、補助フロー、検出フロー、repo-local 検査のいずれかに分類すること」
- **confidence**: medium（安定契約例外候補）
- **notes**: 5分類は公開 command 群の体系（安定契約候補）。workflow-contracts SPEC との分担協議。同種の内部パラメータ記述 REQ-005-006（workflow_route 派生値、:22）も協議範囲に含め得る
- **ng_classification**: pre-existing

### F-08: REQ-012 の node 種別定義残留

- **target**: docs/requirements/REQ-012.md:18（REQ-012-003）
- **evidence**: 「標準 node_types デフォルトは requirement, decision, specification の3種とし、command, skill, integrity_rule, extension, source_file は augmentation が追加すること」
- **confidence**: high
- **notes**: デフォルト3種+拡張5種の列挙が要件行の主文意。移送先: agentdev-artifact-graph SPEC
- **ng_classification**: pre-existing

### F-09（帰属訂正）: ローカルCaseファイルの enum・field 定義残留

- **target（訂正済み）**: docs/requirements/REQ-009.md:47-50（REQ-009-027〜030）※元 finding は REQ-030 と誤帰属
- **evidence**: REQ-009-027 YAML frontmatter 必須 field 列挙、REQ-009-028 status 6値 enum（「詳細遷移表は SPEC」）、REQ-009-029 labels、REQ-009-030 必須セクション指定
- **confidence**: medium（安定契約例外候補）
- **notes**: 各行が「詳細は SPEC」と例外自覚を明記。ドメイン状態の外部契約に近く、local-case-file SPEC との分担再編を協議
- **ng_classification**: pre-existing

### F-10（帰属訂正）: 実行パラメータ・種別定義の残留

- **target（訂正済み）**: docs/requirements/REQ-034.md:45,48（REQ-034-027/030 同時起動数固定値・再実行回数上限）+ docs/requirements/REQ-009.md:26（REQ-009-006 5種リポジトリ種別）
- **evidence**: REQ-034-027「同時起動数は固定値とし実行安全境界として遵守すること（数値は SPEC）」、REQ-034-030「再実行回数上限は SPEC」、REQ-009-006「5種のリポジトリ種別（self-hosting、consumer-with-agentdev、consumer-local、consumer-generated、plugin-future）を定義すること」
- **confidence**: medium（安定契約例外候補）
- **notes**: 安全境界の大枠は安定契約例外候補。REQ-009-006 は REQ-029 配布依存境界との重複感も協議点
- **ng_classification**: pre-existing

### F-11（帰属訂正）: agentdev_handoff boolean 規定の残留

- **target（訂正済み）**: docs/requirements/REQ-005.md:35-36（REQ-005-019/020）※元 finding は REQ-011 と誤帰属
- **evidence**: REQ-005-019「agentdev_handoff: true は AgentDevFlow 本体向けの引き継ぎ標識とし、通常 RU または要件doc の必須 frontmatter ではないこと」、REQ-005-020「通常 RU に agentdev_handoff を記載せず、agentdev_handoff: false も記載しないこと」
- **confidence**: medium
- **notes**: 特定 field 名の規定は SPEC 分離基準違反だが frontmatter 外部契約に近い。F-07 と同 REQ のため統合協議可
- **ng_classification**: pre-existing

### F-12（帰属訂正）: 停止条件の入力形式詳細残留

- **target（訂正済み）**: docs/requirements/REQ-015.md:30（REQ-015-012）※元 finding は REQ-016 と誤帰属
- **evidence**: 「case-auto は下位 command から user-decision-required + decision_context を受領して自走を停止し、ユーザーへ報告、resume point から再開すること」
- **confidence**: medium（安定契約例外候補）
- **notes**: 停止条件の大枠は安定契約例外候補
- **ng_classification**: pre-existing

## 個別採用: F-01（配布物の存在しない command 参照）

- **target**: src/opencode/commands/agentdev/intake-capture.md:53
- **evidence**: 「再発防止知見のみの観測は `/agentdev/learning-capture` に委ねる」— learning-capture は skill であり command は存在しない（実在16 command と照合済み）。root README の「`learning-capture`（スキル）」表記が正規表記
- **confidence**: high（機械的確定）
- **recommended fix**: 「`agentdev-learning-capture`（スキル）に委ねる」等への表記修正。IR-051 は逆方向（command を skill 表記）の検出であり本パターンは既存ルールで未被覆
- **ng_classification**: pre-existing

## 個別採用: F-02（現行 REQ 件数記述の陳腐化）

- **target**: docs/specs/foundations/patterns.md:68
- **evidence**: 「**新基準 REQ 群**（REQ-001〜0133、25 件、…）を現行仕様の主参照とする。」— 現行は REQ-001〜035 の35件（docs/requirements/README.md・docs/README.md AUTOGEN と不整合）。:69 が「一覧、範囲は README を正とし複製しない」と自称しつつ :68 で件数を複製している方針違反も併存
- **confidence**: high（AUTOGEN との機械的照合）
- **notes（審議結果）**: 既存機械検査ルール IR-042（hardcoded-req-count、対象 SPEC/guides/AGENTS.md）・IR-018（REQ 範囲表記鮮度）の検出範囲と正確に重複する。ルールが存在しても drift が残存している事実は full-audit gate の実行ギャップを示唆するため、修正要件には「なぜ IR-042/018 が火を吹かなかったか（実行頻度・対象漏れ）」の確認を含めること（G05: docs-check 候補は要件化方向に折込み）
- **ng_classification**: pre-existing

## 個別採用: F-13（REQ-010 複数ドメイン混在・SPLIT 候補）

- **target**: docs/requirements/REQ-010.md
- **evidence**: 目的において自己監査 command・配布対象検出コマンド群・取り込みと学習の各 pipeline・backlog 統合・検出と診断を単一 REQ が所有（複数 command family・lifecycle 段階の混在、シグナル2以上）
- **confidence**: medium（要ヒューマンレビュー）
- **notes**: 診断系横断責務を1 REQ に束ねる設計判断の可能性もあり、req-define で分割単位を協議
- **ng_classification**: pre-existing

## 個別採用: F-14（REQ-012〜024 Artifact Graph 系 REQ 群の粒度・MERGE/RETIRE 候補）

- **target**: docs/requirements/REQ-012, 013, 020, 021, 022, 023, 024
- **evidence**: 同一関心（Artifact Graph）が7ファイルに細分化。REQ-013（DOC-MAP 依存除去）は目的達成後の残置 REQ として RETIRE 観点の評価候補
- **confidence**: low（意図的分割の設計判断の可能性、要ヒューマンレビュー）
- **notes**: req-define で統合・RETIRE 単位を協議。破壊的な統合は前提としない
- **ng_classification**: pre-existing

## 参考: 審議経緯と却下・保留

- **reject 3件**: F-03（未処理 artifact 状態報告 — 不整合ではなく intake/learning パイプライン入力。intake inbox 43件・learning inbox 410行の重複確認推奨は本成果物と完了報告に継承）、F-18/F-19（spec-as-replacement — REQ-001-061..064・REQ-017 委任行の実在を確認し誤検知と確定）
- **defer 3件**: F-15〜F-17（workflow-skill-model / step-reference-contract / input-resolution-and-durable-state の draft status — created 2026-08-10・updated 当日で IR-054（30日閾値）はクリア、進行中 Epic（ACT-SPEC-001..003 由来）の case-close 昇格待ちの正当な状態。Epic クローズ後も draft なら再検出対象）。inbox 残置
