# PR 2195 Level 2 統合により TIM カタログ乖離の主要部分解消 — 残差は語彙集約と implementation 参加範囲に集約

## 観測内容

case-auto Level 2 による統合再実行（88212b83）で、2026-08-17-epic2189-tim-catalog-impl-divergence.md 記載の主要乖離が解消した。影響方向の値名はカタログ基準（forward/backward/bidirectional/none）へ統一（実装の reverse→backward、both→bidirectional）、supersedes/extends/defined_in/contains/references への割当てもカタログ基準へ統合、augmentation relation_types[].semantics スキーマは #2190 カタログ形式へ一本化した。diagnostics プロファイル実装（2026-08-17-epic2189-diagnostics-profile-unimplemented.md 記載の未実装）も PR #2195 マージにより解消。

case-close SPEC 確定再判定（2026-08-17）の結果、docs/specs/foundations/traceability-model.md と docs/specs/skills/agentdev-artifact-graph.md はともに draft 維持とした。残る未解決は次の2点に集約される:

1. 語彙集約の残差: カタログ「既存5関係型の移行先」が定める defined_in → depends_on 集約等の語彙移行が実装へ未反映（現行5関係型名 references/supersedes/defined_in/contains/extends を維持）。標準コア語彙に実現系列関係型が存在しないため implementation プロファイルは augmentation で実現系語彙を追加しない限り常に空結果になる
2. implementation プロファイルの参加範囲: カタログ参加区分表では specifies/verifies/validates も参加だが、現行実装は realize/satisfy/implement のみ参加

## 影響

- TIM カタログ SPEC と AG SPEC が draft のまま確定できず、語彙体系の単一真実が未確定である

## 課題

語彙移行の実施判断（カタログ移行先へ実装を寄せるか、実測に基づきカタログを修正するか）を後続の統合是正 Issue で行う。語彙移行の確定後に候補数上限の最終決定（2026-08-17-epic2189-candidate-limit-standard-value.md）と AG SPEC「augmentation モデル」節等への反映（2026-08-17-epic2189-spec-finalization-deferred.md）を同時に評価するのが自然。

## 既存要件・成果物との関連

- SPEC: docs/specs/foundations/traceability-model.md (draft維持)、docs/specs/skills/agentdev-artifact-graph.md (draft維持)
- 前段: 2026-08-17-epic2189-tim-catalog-impl-divergence.md、2026-08-17-epic2189-spec-finalization-deferred.md
- 出典 Issue/PR: #2191 (CLOSED), Epic #2189 (CLOSED)、PR #2195 (merged 201594d9、Level 2 統合 88212b83)

## 出典

- 発生日: 2026-08-17
- 発生源: case-close SPEC 確定再判定（STEP-3-2 処理パターン (c) 見送りの進展記録）
- 元 item: intake-2026-08-17-epic2189-level2-integration-residual.md
