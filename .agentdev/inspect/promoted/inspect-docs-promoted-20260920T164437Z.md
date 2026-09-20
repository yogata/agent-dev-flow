# inspect-docs promoted 20260920T164437Z

> inspect-promote（2026-09-21 実施、/agentdev/backlog-auto stage 2 inspect 系統経由、--auto なし・in-context 審議）の採用済み成果物。
> 新規検出事項 2件（F-1/F-2）を採用した。
> 対論型レビュー（in-context 審議: 対称的相互反証・戦略メタ反証・convergence audit）を実施し、全件自律確定（HITL 不要、unresolved 0件。判定根拠は各検出事項の検証記録参照）。
> 同時処分: DESIGN-3（0914・command-file-format.md 将来拡張余地記述）は reject（第16段 RC fixes による KEEP 解釈の明示確定により指摘の判断軸が解消・対応不要。却下理由は当該 commit message 参照）。F-10/F-12（0901）・F-04/F-05/GUIDE-6（0914）は defer 継続（inbox 残置・再評価条件に変化なし）。

## 検出事項リスト（promote 採用分）

### F-1: REQ-014 が廃止済み REQ-016 を現行所有者として記述（retired 残置・横断契約矛盾）

- **id**: REQ14-RETIRE-DRIFT-1
- **category**: 廃止 REQ/Design 由来記述残置（横断契約矛盾・DRIFT）
- **target**: `docs/requirements/REQ-014.md:12`（目的節）、同 `:49`（適用範囲・対象外リスト）
- **evidence**:
  - L12「各 command の呼出統合は REQ-015、横断整合は REQ-016 が所有する。」— 廃止注記なしの現在形所有記述
  - L49「横断整合確認（REQ-016）」— 廃止注記なしの対象外ルーティング記述
  - REQ-016 は 2026-09-20 RETIRE（PR #3047 6967bdc0、`docs/requirements/retired/REQ-016.md` 移管済み・履歴注記「RETIRE、status: migrated、2026-09-20」実在確認）。移管先 REQ-015.md:18「横断整合の恒常契約は本 REQ が所有する（横断整合の完了時点検証は廃止済み REQ-016 が記録、2026-09-20 RETIRE）」、REQ-015.md:46「横断整合確認（廃止済み REQ-016・完了時点検証として記録）」は正しく注記付き更新済み。REQ-014 の2行のみ移管追随から漏れた残置
- **severity**: high / **confidence**: high（retired ID の直接参照 + 現在形所有動詞の機械的抽出と REQ-015 更新文との突合で確定）
- **source_of_truth**: 現行 REQ-015（RETIRE 移管先）と retired REQ-016 の RETIRE 記録を正とし、REQ-014 の当該記述を検出事項とする
- **recommended_route**: `backlog-review`（UPDATE 系 RU 化 → req-define → case-auto）。REQ-016 RETIRE を実施した PR #3047 の変更窓内で導入された追随漏れであり、v4.0.1 修正候補
- **ng_classification**: 今回修正対象
- **検証記録（inspect-promote 2026-09-21）**: REQ-014.md L12/L49 の現行文面・REQ-015.md L18/L46 の注記付き更新文面・retired/REQ-016.md の RETIRE 履歴注記をそれぞれ実読で確認
- **修正内容（実施 Case 向け具体案）**:
  - REQ-014.md:12「各 command の呼出統合は REQ-015、横断整合は REQ-016 が所有する。」→「各 command の呼出統合は REQ-015、横断整合の恒常契約も REQ-015 が所有する（横断整合の完了時点検証は廃止済み REQ-016 が記録、2026-09-20 RETIRE）。」（REQ-015.md:18 と同型の注記形式へ更新）
  - REQ-014.md:49「横断整合確認（REQ-016）」→「横断整合の恒常契約（REQ-015。完了時点検証は廃止済み REQ-016 として記録）」（REQ-015.md:46 と同型へ更新）
  - 併せて REQ-014 frontmatter `updated` の更新日反映を実施 Case で判断すること
- **notes**: REQ-014 の行実在・参照整合自体は機械検査 OK（retired ファイルが実在するため broken 参照にならない）。意味層（現行所有帰属）のみの検出。REQ 修正は RU → backlog-review → req-define → case-auto の正規経路でのみ実施する（直接修正しない）
- **req-define入力案**: 「REQ-014 の横断整合に関する所有記述（L12・L49）を REQ-015（現行所有者）へ更新する。完了時点検証の履歴参照は『廃止済み REQ-016 が記録、2026-09-20 RETIRE』の注記形式とする」

### F-2: v4 廃止公開コマンドの旧パス表記 `/agentdev/case-*` が Design 群に残存（旧名称残存 DRIFT）

- **id**: CASE-PATH-NOTATION-1
- **category**: 横断契約矛盾（旧名称・旧概念の残存。DRIFT）
- **target**: `docs/designs/` 配下 13 行・14 表記（project-extensions.md:216 は 1 行に 2 表記を含むため）。file:line 全数リストは後述の修正内容を参照
- **evidence**:
  - 配布コマンド README「廃止コマンドの移行案内」は case-open/ready/revise/run/close を「v4 で公開コマンドから廃止され、alias は残さない。内部 lifecycle 段階として case-auto が駆動する」と規定（DEC-033 ADF v4 公開運用モデルに基づく）
  - `docs/designs/foundations/system.md` はコマンド表（L29-34）と Workflow Architecture Inventory 一覧表（L117-121）で「case-open（内部 lifecycle 段階、case-auto 駆動）」形式の正規表記を使用する一方、直後の詳細セクション見出し 5 件（L147/161/175/189/203 `### /agentdev/case-ready` 等）は旧公開コマンドパス表記のまま（同一ファイル内で表記不整合）
  - `docs/designs/README.md:86-90` command Design 一覧の責務列も `/agentdev/case-open` 等の旧パス表記
  - `docs/designs/responsibilities/artifact-contracts.md:415` は実在しない `src/opencode/commands/agentdev/case-open.md` を直接参照（src/opencode/commands/agentdev/ の実在突合: case-auto.md のみ存在し case-*.md は不存在。glob 確認済み）
- **severity**: medium / **confidence**: high（旧パス表記の機械的抽出 + src 実在突合 + 同一ファイル内の正規表記との不整合で確定。現行判断の根拠として使用されてはおらず命名・導線の局所的破綻のため high ではない）
- **source_of_truth**: 承認済み Decision（DEC-033・公開 UX 2入口収斂と内部 lifecycle）および配布コマンド README 廃止コマンドの移行案内、system.md L29-34/L117-121 の正規表記を正とし、Design 側の旧パス表記を検出事項とする
- **recommended_route**: `backlog-review`（docs_chore 系批量修正 RU 化）。F-1 とは独立系統（REQ 意味修正 vs Design 表記統一）として別 RU 化可能
- **ng_classification**: pre-existing（v4 cutover に由来。今回の変更窓では導入されていない）
- **検証記録（inspect-promote 2026-09-21）**: `/agentdev/case-(open|ready|revise|run|close)` の docs/designs 全走査で 13 行（14 表記）を検出・全行実在確認。docs/reports/ 配下の 6 ファイルにも同表記が存在するが歴史記録（監査レポート等の時点記録）であり修正対象外。src/opencode/skills/agentdev-workflow-case-open/SKILL.md の実在を確認（:415 修正の置換先候補）
- **修正内容（実施 Case 向け具体案・file:line 全数リスト）**:
  - `docs/designs/foundations/system.md:147` `### /agentdev/case-ready` → `### case-ready（内部 lifecycle 段階）` 形式へ
  - `docs/designs/foundations/system.md:161` `### /agentdev/case-revise` → `### case-revise（内部 lifecycle 例外経路段階）` 形式へ
  - `docs/designs/foundations/system.md:175` `### /agentdev/case-open` → `### case-open（内部 lifecycle 段階）` 形式へ
  - `docs/designs/foundations/system.md:189` `### /agentdev/case-run` → `### case-run（内部 lifecycle 段階）` 形式へ
  - `docs/designs/foundations/system.md:203` `### /agentdev/case-close` → `### case-close（内部 lifecycle 段階）` 形式へ
  - `docs/designs/README.md:86-90` command Design 一覧の責務列 5 行（`/agentdev/case-open`・`/agentdev/case-ready`（…）・`/agentdev/case-revise`（…）・`/agentdev/case-run`・`/agentdev/case-close`）→ `case-open（内部 lifecycle 段階、case-auto 駆動）` 等の正規表記へ（system.md L29-34 と同一形式）
  - `docs/designs/foundations/project-extensions.md:216` 「`/agentdev/case-run`・`/agentdev/case-close` の changed-path routing（consumer）」→ 内部 lifecycle 段階表記（case-run・case-close の changed-path routing）へ
  - `docs/designs/responsibilities/artifact-contracts.md:224` 完了コマンドのフルパス例 `/agentdev/case-close` → 実在する公開コマンドの例（`/agentdev/case-auto` 等）へ置換。完了報告 template の「完了コマンド」フィールドは公開コマンドのフルパスを想定しており、廃止コマンドを例示するのは不整合
  - `docs/designs/responsibilities/artifact-contracts.md:415` 「consumer: case-open（`docs/designs/commands/case-open.md`、`src/opencode/commands/agentdev/case-open.md`）」→ 実在しない src パス `src/opencode/commands/agentdev/case-open.md` を削除し、実在する workflow skill 参照（`src/opencode/skills/agentdev-workflow-case-open/SKILL.md`）へ置換
  - 見出し・表記の統一後の細部文面（backtick・注記の省略形）は実施 Case の裁量とし、正規表記の参照先（system.md L29-34・L117-121）と矛盾しないことのみを必須条件とする
- **notes**: artifact-contracts.md:415 のパス実在性は check_integrity broken-file-link baseline（NG 52 既知残存）と重複し得るが、本検出事項の主体は命名 DRIFT（廃止コマンドパスの現行使用）。:415 の修正は baseline 側の該当 broken link も解消する方向で作用する。docs/reports/ 配下の同表記は歴史記録のため修正対象外（REQ-016-009 の historical 記録扱いと同一）。Design セクションの本文記述自体（内部 lifecycle 段階としての説明）は正しく、見出し・表記のみの残置
- **req-define入力案**: 「`/agentdev/case-*` 旧パス表記（system.md 5 見出し・designs/README 5 行・project-extensions 1 行〔2 表記〕・artifact-contracts 2 箇所）を内部 lifecycle 段階の正規表記（system.md L29-34 形式）へ一括更新する。artifact-contracts.md:415 の実在しない src パスは実在する workflow skill パスへ置換する」

## 統合審査の指示（backlog-review 向け）

- **F-1（REQ-014 追随修正）**: REQ 本文の意味修正（所有帰属の更新）であり、単独 RU として扱うことを推奨する。修正対象は REQ-014.md L12/L49 の 2 箇所のみで、修飾は REQ-015 と同型の注記形式に従う
- **F-2（Design 表記統一）**: docs_chore の批量修正（13 行・14 表記 + src パス置換）であり、F-1 とは独立 RU として扱うことを推奨する（work_type・影響範囲が異なるため）。req-define入力案は F-2 の記載を参照
- 両 RU とも v4.0.0 リリース直後の v4.0.1 修正候補として棚入れ相当

## 出典

- 新規検出事項（F-1/F-2）: `.agentdev/inspect/inbox/inspect-docs-finding-20260920T164437Z.md`（2026-09-21 処分時に削除。git 履歴 commit `d6c3d55c` 参照）
- 同時処分の defer 継続・reject: `inspect-docs-finding-20260901T120043Z.md`（F-10/F-12 defer 継続）・`inspect-docs-finding-20260914T214425Z.md`（F-04/F-05/GUIDE-6 defer 継続・DESIGN-3 reject）の各ヘッダ注記・審議記録参照
- 診断実行: `/agentdev/inspect-docs`（backlog-auto stage 1）2026-09-21 @046fc2e7
- 後続: `/agentdev/backlog-review` による RU 生成
