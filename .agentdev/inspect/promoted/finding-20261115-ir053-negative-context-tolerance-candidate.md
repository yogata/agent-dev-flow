# inspect-promote promoted 2026-11-15（IR-053 warning の否定文誤検知確定と検出器改善候補 1件）

- 採用実行: backlog-auto stage 2 inspect 系統（inspect-promote、--auto なし）。ソース: `.agentdev/inspect/inbox/inspect-docs-finding-20261115T103843Z.md`（対象版 main HEAD `cf7ac3729`、stage 1 診断基点 aa5123e54 からの delta window は空で docs 配下の変更なし）
- 分類: 自律確定（HITL 対象なし・破壊的変更なし）。根拠: D-1 は docs-check（IR-053）warning の文脈確認により否定文記述の誤検知であることが確定し（confidence high・現物確認済み）、false positive の確定は finding 契約（agentdev-doc-diagnostics finding-output-contract.md）上 inspect-promote の分類責務である。docs-check ルール／検査データ追加候補は独立 route とせず採用済み成果物の受け入れ条件に含める契約（inspect-promote STEP-8 不変条件）に従い、route 候補 RT-3 を受け入れ条件として包含した。検出器改善の具体方式（否定形記述の構造的許容 vs area-based 除外宣言）は未決の実装判断として本成果物に記載する（FD-16 前例型〔2026-11-07 promote〕）。Jev 先行評価（観測 20261115T105719Z-9776、d1-disposition promote 0.45・defer 0.32 の近接対抗）は DS18 前例（20261015、promote 0.46/defer 0.42 → Stream A 検証の結果 promote 維持）と同型であり、false positive 確定（採否・inspect-promote 責務）と改善方式の未決（実装判断）の分離により promote 維持と判断した
- 前提の現物確認（2026-11-15 inspect-promote 実行時）: `src/common/skills/agentdev-workflow-case-close/scripts/README.md:7` の該当箇所は「0 の場合は mergeable-polling を N/A pass（prNotApplicable）とし `gh pr view` を発行しない」の否定文説明のままで変化なし
- ng-baseline / exemptions への仮登録を行わない理由: 検出側推奨どおり、誤検知の恒久解消は検出器改善（文脈許容条件の構造的追加）であり、例外登録は正の検出器仕様を迂回するため。本成果物の RU 化・実装までの間、warning は docs-check 側で継続検出されることを許容する
- 受け入れ条件（route 候補 RT-3 を含む）: IR-053 検出器に否定文文脈許容条件を追加する際は、(1)「発行しない」「〜しない」等の否定形記述の構造的許容の設計、(2) area-based 除外宣言方式（REQ-010-066 準拠の語彙引用・記録領域管理）との整合検討、(3) IR-053 の正規検出条件と既知許容（検出器仕様）との照合、の3点を検討対象とする。ng-baseline / exemptions への仮登録は不採用

## D-1（原状保存）

- id: D-1
- category: 配布物整合性（docs-check warning の文脈確認、検出器文脈許容候補）
- target: `src/common/skills/agentdev-workflow-case-close/scripts/README.md:7`
- evidence: docs-check（check_integrity）が CanonicalConflict warning「Direct gh CLI invocation 'gh pr view' detected — route via the agentdev_gh Custom Tool (IR-053, v2:REQ-0152-001)」を報告。該当行はスクリプト仕様書の入力仕様記述であり、該当箇所は「0 の場合は mergeable-polling を N/A pass（prNotApplicable）とし **`gh pr view` を発行しない**」という**否定文の説明**である。実行コードでも迂回手順の記述でもない。本 warning は permanent exemptions（exemptions.json、7件 demote 対象外）にも baseline（NG baseline 1件+approved additions 24件）にも未登録で、新規検出として warning に留められている
- severity: low
- confidence: high（文脈は明確に否定文記述であり、迂回指示ではない。ただし検出器仕様（IR-053 の正規検出条件と既知許容）の詳細は未照合のため「検出器の許容条件追加」の妥当性は次段判断）
- source_of_truth: IR-053（直接 gh CLI 迂回検出）の検出意図（実行迂りの検出）を正とし、README 説明文の否定文記述を false positive 候補と判定
- recommended_route: docs-check 検査データ候補（STEP-3-2: 検出器の否定文文脈許容条件〔「発行しない」「〜しない」等の否定形記述の構造的許容、または area-based 除外宣言〕の検討。ng-baseline / exemptions への仮登録ではなく検出器改善を推奨）
- ng_classification: false positive 候補（検査ルールの誤検知。検査ルールの修正対象。確定は inspect-promote の分類で行うため「候補」と表記）
