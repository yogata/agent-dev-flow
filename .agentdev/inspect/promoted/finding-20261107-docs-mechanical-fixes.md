# inspect-promote promoted 2026-11-07（docs 機械的是正候補 3件）

- 採用実行: backlog-auto stage 2 inspect 系統（inspect-promote、--auto なし）。ソース: `.agentdev/inspect/inbox/inspect-docs-finding-20261107T070520Z.md`（対象版 main HEAD `7528a03ea`、delta window 2026-10-26〜2026-11-07 の診断）
- 分類: 全件自律確定（HITL 対象なし・破壊的変更なし）。根拠: いずれも明確な不整合で正規情報源特定済みであり、STEP-3 分類基準「明確な不整合 → promote」の正規契約からの決定的導出である。FD-01 は IR-072 triage_action が修正方向を決定的に規定、FD-02 は designs/README.md「新規 Design 追加時の index 登録手順」が登録内容様式まで規定、FD-16 は check_distribution_boundary 機械 failure 1件（baseline 未管理）の現行違反であり修正方向の2択は IDX-04 前例（2026-10-27 promote）に倣い未決の実装判断として本成果物に記載する。本成果物は採用記録であり docs 側の直接修正を含まない（修正は backlog-review 経由の RU 化後）
- 前提の現物確認（2026-11-07 inspect-promote 実行時）: FD-01 対象5ファイルの frontmatter updated（case-auto `2026-10-24`・case-run `2026-10-24`・req-define `2026-11-02`・v51 `2026-11-04`・verification-resource-lifecycle `2026-11-06`）と実質内容変更 commit（17f61810d 2026-11-04・877a25d80 2026-11-05・5ff18764e 2026-11-07 等）の乖離は stage 1 診断が commit diff で立証／FD-02 は docs/designs/README.md に verification-resource-lifecycle 表記 0件・同 README「新規 Design 追加時の index 登録手順」（:28）実在確認／FD-16 は identity.ts:4 の REQ-111-023 コメント言及実在確認・check_distribution_boundary 機械 failure 1件（baseline 未管理）は stage 1 機械検査が立証

## FD-01（原状保存）

- id: FD-01
- category: DRIFT（Design frontmatter 鮮度・IR-072）
- target: `docs/designs/commands/case-auto.md:5`、`docs/designs/commands/case-run.md:5`、`docs/designs/commands/req-define.md:5`、`docs/designs/workflows/v51-phase-transition-and-coexistence-model.md:5`、`docs/designs/workflows/verification-resource-lifecycle.md:5`
- evidence: check_integrity.ts（IR-072）の新規 unmanaged NG 5件。commit diff で5件とも frontmatter のみでない実質内容変更を確認: (a)(b) case-auto/case-run は 17f61810d（2026-11-04）が「採用規約の解決の実行経路接続（REQ-104）」節を実質追加、(c) req-define は同 commit が同題の節を実質追加、(d) v51 は 877a25d80（2026-11-05）が「実行接続の実装所在（反映確認）」段落を実質追加、(e) verification-resource-lifecycle は 5ff18764e（2026-11-07）が2 bullet を実質改訂。frontmatter updated はいずれも旧（2026-10-24 / 2026-10-24 / 2026-11-02 / 2026-11-04 / 2026-11-06）
- severity: medium
- confidence: high
- source_of_truth: `docs/designs/integrity/rules/IR-072-req-updated-freshness.md`（Design ファイルも同一基準検査と明文化）
- recommended_route: docs-check（updated を最終内容変更 commit 日〔author date〕へ機械的進行。metadata のみの変更で意味変更なし）
- ng_classification: 今回修正対象
- notes: commit 6ed481996（2026-11-05）が同種是正を他4ファイル（case-close・req-health-metrics・custom-tool-contracts・v4-delegation-contracts）へ適用済みで、本5ファイルが追随漏れ。REQ-117-011 計測日収束 step の trigger 条件の検討材料（観察記録 O5 と関連）

## FD-02（原状保存）

- id: FD-02
- category: README 索引診断（Design status 追跡情報源の網羅性）
- target: `docs/designs/README.md`（横断 Design 一覧表・該当行不存在）/ `docs/designs/workflows/verification-resource-lifecycle.md`（未登録実体）
- evidence: grep で designs/README.md に verification-resource-lifecycle 表記は0件。同表の該当領域は v51-phase-transition で終わり、window 内新規作成（2026-11-05、c4780cd28）の本 Design が未登録。README 自身の規定「新規 Design の保存完了直後に該当一覧表へ行を登録する。登録漏れを docs-check で検出する」「本ファイルが Design status を視認する単一の追跡情報源」に反し、`status: draft`（当該ファイル :3）が status 追跡から漏れる。親の機械検証（リンク切れ0件）は行欠落を捉えない（逆方向の不整合）
- severity: medium
- confidence: high
- source_of_truth: docs/designs/README.md「Design status 追跡情報源」「新規 Design 追加時の index 登録手順」
- recommended_route: intake（横断 Design 一覧へ行追加。FD-04 の昇格判断と同一 wave で実施推奨）
- ng_classification: 今回修正対象
- notes: docs-check の未登録 Design 検出が本パターン（workflows/ 直下・表行欠落）を捉えなかった経緯は docs-check 検出ルール強化候補（STEP-3-2 route 候補に記載）

## FD-16（原状保存）

- id: FD-16
- category: 配布物整合性（配布参照境界・ID 汚染）
- target: `src/common/skills/agentdev-workflow-phase-transition/scripts/lib/identity.ts:4`
- evidence: check_distribution_boundary.ts の機械 failure 1件（baseline 未管理）: コメント行「* read-side check target (REQ-111-023): this module never writes it.」が `REQ-111` 具体IDを含む。同 skill は skill-projection-manifest の projection 対象（consumer から視認可能）。REQ-111-023 は実在行（docs/requirements/REQ-111.md:38・遷移後の現在工程の特定・再開の照合義務）でコメント文意自体は健全。配布物は AgentDevFlow 利用者が読む成果物であり内部 ID は記述しない原則（req-structure-review 配布物 ID 汚染検出）に触れる
- severity: medium
- confidence: high（機械的一意判定）
- source_of_truth: check_distribution_boundary.ts（機械検査 owner）・distribution-targets.yaml、REQ-111-023
- recommended_route: intake（コメントを機能的記述〔「遷移記録復元前の identity 照合の検査対象」等〕へ置換、または IR-059 系 baseline への登録判断。実装 Case での修正が軽微）
- ng_classification: 今回修正対象候補（commit dac7852b3、2026-11-04、delta window 内の新規導入）

## 未決の実装判断事項（RU 化時に判断）

- FD-16: 修正方向（コメントを機能的記述〔「遷移記録復元前の identity 照合の検査対象」等〕への置換、または IR-059 系 baseline への登録）は本成果物では確定しない（修正方向は未決のまま後続検討へ。IDX-04 前例〔2026-10-27 promote、機械 failure 立証済みなら修正方向の2択を promoted 成果物側に記載〕に倣う）。置換を採る場合は REQ-111-023 への照合義務参照の文意保持を確認し、baseline 登録を採る場合は distribution-boundary 検査契約側の登録手順に従うこと
- FD-01: updated 進行の基準日付は各ファイルの最終内容変更 commit の author date とする（IR-072 detection_method どおり。frontmatter のみの変更 commit は内容変更から除外）。REQ-117-011 計測日収束 step の trigger 条件検討への材料提供（観察記録 O5）は本件修正の範囲外として別途扱う
- FD-02: 行登録の status 列値は `draft`（現行 frontmatter どおり）。FD-04（draft Design への現行権威指定・昇格判断）の昇格判断と同一 wave で実施推奨は検出側の推奨であり、行登録自体は昇格判断に依存しない

## 処理記録

- 2026-11-07 実施（backlog-auto stage 2 inspect 系統、--auto なし）: promote 3件（FD-01・FD-02・FD-16）を本成果物へ原状保存し、ソース finding ファイルから削除。Jev 先行評価（観測 20261107T072209Z-3811、FD-01 promote 1.0・FD-02 promote 0.95・FD-16 promote 1.0）と LLM 最終判断一致。STEP-5 adversarial-review は条件付き化発動条件（手動分類対象が存在し本質的争点が残る）を満たさないため生成せず（観測なし=契約どおり）。 HITL 対象なし（promote 3件とも HITL 引き上げ条件〔v4-responsibility-boundaries「人間判断への引き上げ条件」節〕の1〜5に非該当。既存規約の機械適用であり新規規範の確定を含まない）
