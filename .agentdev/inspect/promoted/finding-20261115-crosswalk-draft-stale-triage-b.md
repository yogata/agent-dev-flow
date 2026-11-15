# inspect-promote promoted 2026-11-15（v4-v5-crosswalk.md draft 放置の IR-054 triage (b) 1件）

- 採用実行: backlog-auto stage 2 inspect 系統（inspect-promote、--auto なし）。ソース: `.agentdev/inspect/inbox/inspect-docs-finding-20261115T103843Z.md`（対象版 main HEAD `cf7ac3729`、stage 1 診断基点 aa5123e54 からの delta window は空で docs 配下の変更なし）
- 分類: 自律確定（HITL 対象なし・破壊的変更なし）。根拠: IR-054 の機械的シグナル（draft 放置 32日 > 閾値 30日）確定で、triage 選択肢 (a)昇格/(b)内容更新+updated最新化/(c)廃止 のうち (b) が IR-054 規則と REQ-108-012 からの決定的導出である（(a) は親 v5-adopted-conventions.md 自身も draft のためライフサイクル順序に不整合、(c) は REQ-108-012 が本 crosswalk 構造を現行義務として要求するため不適）。修正対象（frontmatter updated と内容更新）は一意で、内容更新の具体範囲は未決の実装判断として本成果物に記載する（IDX-04 前例型〔2026-10-27 promote〕）。Jev 先行評価（観測 20261115T105719Z-9776、s1-disposition promote 0.99）と LLM 最終判断一致。IDX-02（references 索引可視性、defer 継続中）と対象ファイルは同一だが論点は別であり混同しないこと（finding 自身の notes どおり）
- 前提の現物確認（2026-11-15 inspect-promote 実行時）: `docs/designs/foundations/references/v4-v5-crosswalk.md` の frontmatter status: draft・updated: 2026-10-14 を現物確認（基準日 2026-11-15 で 32日経過）。親 `docs/designs/foundations/v5-adopted-conventions.md` も status: draft（updated: 2026-11-04）
- 後続処理の相互参照: 本件の実施（crosswalk 改訂）は inbox 残置の R-1（REQ-035-006 旧 Wave 語彙現行化）と S-2（REQ-111-013 covers 宣言重複の集約判断）の再評価条件発火を伴う。RU 化・実装時に同 2 項を同時再評価対象として扱うこと（両項の defer 記録は inbox 側 20261115T103843Z.md に保持）
- 未決の実装判断（本成果物側に記載）: (1) 内容更新の範囲（親の 2026-11-04「解決手順」節更新〔:68-79 target_area 追記〕への子側波及を含めるか）、(2) updated 最新化の実施と living tracking（planned → confirmed → executed）としての長期休止期間の併存整理（IR-054 false_positive_risk「中」への対応）。いずれも case 経路（case-ready/case-revise）での Design 更新として判断する
- 併せて推奨: README.md:193 の親行備考への joint triage 記録（finding 側推奨どおり）

## S-1（原状保存）

- id: S-1
- category: Design DRIFT（draft Design 放置、IR-054 確認済み）
- target: `docs/designs/foundations/references/v4-v5-crosswalk.md:3,5`（frontmatter status: draft、updated: 2026-10-14）
- evidence: 基準日 2026-11-15 で経過 32日 > 閾値 30日。docs-check（check_integrity）が warning として検出済み（Draft Design stale: age=32d）。規則権威は docs/designs/integrity/rules/IR-054-draft-spec-abandonment-detection.md（:41 閾値 30日固定、:27 triage (a)昇格/(b)更新+updated最新化/(c)廃止）。親 `docs/designs/foundations/v5-adopted-conventions.md` 自身も draft（updated: 2026-11-04、11日で新鮮）であり、README.md:193 の親行備考が crosswalk 所有を言及。親は 2026-11-04 に「解決手順」節へ target_area 追記（:68-79）を更新したが子には波及していない
- severity: low（heuristic warning 相当。high や medium に相当する現行判断への直接影響は確認できず、triage 明確のため low と判定）
- confidence: high（機械的シグナル確定、frontmatter 実読確認済み）。triage 判断: (a) 昇格は親が draft のためライフサイクル順序に不整合、(c) 廃止は REQ-108-012（REQ-108.md:28「移行の棚卸し構造が優先順位を付けて処理すること」）が本 crosswalk 構造を現行義務として要求するため不適。よって **(b) 内容更新 + updated 最新化**を推奨。README.md:193 の親行備考への joint triage 記録を推奨。crosswalk は living tracking（planned → confirmed → executed）を担い v5 実行モデル確定までの長期休止が設計上あり得る点は IR-054 自身が false_positive_risk「中」を認める（規則 :24）ため、updated フィールドの実態乖離の可能性も付記
- source_of_truth: docs/designs/README.md:21-22（IR-054 は基盤 Design を含む全 Design 対象、references/ 子は親行備考で言及）+ IR-054 規則本文 + REQ-108-012
- recommended_route: inspect-promote → backlog-review（triage (b) の case 経路実行候補〔case-ready/case-revise での Design 更新〕）
- ng_classification: pre-existing
- notes: 既知 finding IDX-02（inspect-docs-finding-20261019T143944Z.md、references 配下の status 索引可視性、defer 継続）と**対象ファイルは同一だが論点は別**: IDX-02 は索引の状態表示契約、本件は放置そのもの。両者を混同しないこと
