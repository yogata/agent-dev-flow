# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## 2026-09-21: alloc-req-number 採番スクリプトの README 相対パス例が現行実配置とズレて誤採番結果を返す

- **問題事象**: src/opencode/skills/agentdev-req-file-manager/scripts/README.md の実行例 `bun src/alloc-req-number.ts ../../../docs/requirements`（scripts dir を cwd とする前提）を実行すると、docs/requirements が解決できず空スキャンとなり `{ok: true, allocated: "REQ-001", max: 0}` を返す。README 記述どおりの実行で REQ-001 という誤採番結果を得る（正は REQ-089・max 88）
- **発生局面**: case-open STEP-4 Definition Package 生成時の REQ 番号採番（Case #3054）
- **検知方法**: 採番結果（REQ-001・max 0）が現行 corpus（REQ-088 まで存在）と明らかに不整合であるため、手順側の異常と即座に判別した
- **根本原因**: scripts/README.md の相対パス例が旧配置前提（3階層上相当）で、現行実配置（repo root/src/opencode/skills/agentdev-req-file-manager/scripts から repo root は 5階層上）とズレている。alloc-req-number.ts は dir 不在時も列挙 0 件として正常終了し、fail-closed にならない
- **自律対応内容**: SKILL.md「実行方法」セクションの repo root 起点実行（`bun src/opencode/skills/agentdev-req-file-manager/scripts/src/alloc-req-number.ts docs/requirements`）と絶対パス指定で迂回し、正採番 REQ-089 を取得
- **ユーザー確認の有無**: なし（自律対応）
- **Decision/REQ/spec影響**: なし（最終採番は決定的スクリプトで確定・REQ-089 は正常）
- **横展開観点**: 採番スクリプト系の README 実行例（alloc-decision-number 等）が同様の旧配置前提の可能性。skill scripts dir を cwd に起動する相対パス例を含む README 全般の棚卸し候補
- **再発条件**: scripts dir を cwd に README 記述どおりの相対パスで採番スクリプトを実行した場合
- **予防策候補**: scripts/README.md 実行例を現行配置に更新（repo root 起点例への統一または 5階層相対へ修正）。採番スクリプトが指定 dir 不在時に非ゼロ終了で fail-closed する変更（列挙 0 件を成功扱いにしない）
- **想定反映先**: src/opencode/skills/agentdev-req-file-manager/scripts/README.md（配布物追随・docs-chore 系 Case 候補）
- **関連**: Case #3054（J2 shadow 実験 case-open）・Definition PR #3055
- **タグ**: #採番スクリプト #README相対パス #fail-closed

---
