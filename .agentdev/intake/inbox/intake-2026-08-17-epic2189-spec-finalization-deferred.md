# Intake Item: Epic 2189 Wave 1 SPEC確定候補の見送り記録 — AG SPEC・カタログ SPEC への反映提案群

## 発生源

- PR: #2198 / #2195 / #2197 / #2199 / #2196 (Epic #2189 Wave 1、case-close SPEC 確定フロー処理パターン (c) 見送り)
- 発生 phase: case-close SPEC 確定（STEP-3-2、Epic Wave E4）
- capture 分類: intake（SPEC 変更候補）

## 問題

各 PR 本文の「SPEC確定候補」のうち case-close で確定・昇格できなかったもの: (PR #2198) manifest.json スキーマ 2.0.0（graph_config_digest/relation_semantics/node_type_roles、generator_version の literal→比較対象化）の AG SPEC「決定論性と鮮度」節反映。query_graph.ts サブコマンド拡張（related/impact/dependency/implementation/index、--limit/--depth、候補・理由・経路・summary 出力）の「問い合わせ結果の出力形式」節反映。lib モジュール分割の構成記載。(PR #2195) 標準5関係型への意味割当て照合要求（カタログ確定時）。標準候補数上限初期値（30/50、深さ2〜3、関係集中閾値20）は暫定。標準コア語彙に実現系列関係型が存在せず implementation が常に空結果になる問題（実現系語彙追加の判断を求む）。augmentation スキーマ4拡張点（semantics/role/query_settings/relation_constraints）の AG SPEC「augmentation モデル」節への正式反映。(PR #2197) AG SPEC「ワークフロー利用」割当表への backlog-review 行追加提案（REQ-021-001 は3ワークフローに同一プロファイル群を要件化するが割当表に未網羅）。spec-save 行の語彙対応明確化。コマンド SPEC 6ファイルの旧見出し参照更新。(PR #2199) 標準上限値決定手順（recommended_standard_limit 算出・増幅実測値との突合）の SPEC 明文化。(PR #2196) AG SPEC「グラフモデル」節の標準コア relation_types 記述をカタログ移行先（defined_in 廃止等）へ更新。augmentation YAML 側 field 設計の確定。影響方向値名・参加区分キー（forward/backward/bidirectional/none）の採用。

## 推奨対応

SPEC 変更は spec-save 手続きの範囲のため、本記録を入力として後続の spec 更新 Issue / backlog-review で取捨選択する。AG SPEC と TIM カタログ SPEC は今回 draft 維持（G21: 実装による SPEC 内容検証が未完了。カタログ・実装間乖離、diagnostics 未実装、AG SPEC 未反映事項が残存）。

## 関連

- Epic: #2189 (OPEN)
- PR: #2198 (merged f4ac8d70), #2195 (OPEN/CONFLICTING), #2197 (merged 1f415d05), #2199 (merged da999aef), #2196 (merged f4240016)
- SPEC: docs/specs/skills/agentdev-artifact-graph.md (draft維持), docs/specs/foundations/traceability-model.md (draft維持)
