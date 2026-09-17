# AUTOGEN ブロックの陳腐化構造の解消（日付刻印仕様・再生成標準工程の整備）

## 背景

AUTOGEN ブロック（req-health-metrics.md の計測例等）が生成時の日付刻印を持ち、内容不変でも日付境界や REQ 行変動で突合不一致（IR-061、index-generation-consistency）になる構造が再発し続けている。REQ 行 APPEND を含む docs_chore Case では generate_indexes 再生成が運用化されておらず docs-check gate が main で恒常 fail する状態も観測されている（intake item 2026-09-17-req-row-append-autogen-metrics-block-stale と同一事象の別観測）。

## 問題

- 日付刻印により、誰の変更でもなく日付跨ぎで check_integrity が NG になる（内容不変でも再発、Case #2898 で計測日 2026-09-16 のままのブロックが NG、ベース commit でも同一再現）
- Phase 0 起因の AUTOGEN 陳腐化が case-close の dry-run ゲートで差戻しになる（deferred L1140、living pool 最優先再評価候補）
- REQ 行 APPEND を含む Definition PR が AUTOGEN 再生成を行わない運用と、docs-check gate が AUTOGEN 鮮度を検査する実装の間の解釈非対称（REQ-057-018 の「AUTOGEN 対象索引」定義の明示不足）
- 再生成の標準工程（いつ誰が generate_indexes.ts を実行するか）が未整備

## 望ましい変更

次のいずれか（req-define が選択）:

- (a) 生成内容不変時の計測日据え置き仕様（generate_indexes.ts の生成器仕様変更）
- (b) case-close docs 検証での AUTOGEN 再生成の標準工程化
- (c) date rollover 起因の差分報告の差別化（deferred L1436 統合）
- (d) REQ-057-018 の「AUTOGEN 対象索引」定義の明示（行数集計ブロック込みか否か）

## 対象範囲

### 対象

- generate_indexes.ts の生成仕様（日付刻印の扱い）
- case-close の docs 検証手順（AUTOGEN 再生成の標準工程）
- integrity 規約（IR-061 運用）と REQ-057-018 の定義解釈

### 対象外

- AUTOGEN 以外の docs 索引・メトリクス設計
- check_integrity の検査体系自体

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補である。

| 種別 | パス | 変更内容 |
|------|------|----------|
| Design | index-auto-generation 関連 Design | 日付刻印の据え置き仕様または再生成タイミングの設計 |
| Design | autogen-freshness-gate 関連 Design | 鮮度 gate の計測日ブロックの扱い（date rollover 差別化、deferred L1436 統合） |
| 配布skill | src/opencode/skills/agentdev-workflow-case-close/ docs 検証手順 | AUTOGEN 再生成の標準工程化 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: generate_indexes.ts（既存生成契約）、integrity 規約（IR-061）、deferred L1436（date rollover 報告差別化）、deferred L1140（case-run 前置 gate 案・living pool 最優先再評価候補）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 生成器は存在するが、内容不変時の日付扱い仕様と再生成の標準工程（担当・タイミング）が未整備。REQ-057-018 の対象索引定義が行数集計ブロックを含むか非明示

## 制約

- AUTOGEN ブロックの突合機構（index-generation-consistency）自体は維持する
- 生成器仕様変更は既存生成契約との後方互換性を確認する

## 受け入れ条件

- [ ] 内容不変の日付跨ぎで check_integrity が NG にならない、または差別化報告される
- [ ] REQ 行変動を伴う Case で AUTOGEN 再生成の担当工程が定義されている
- [ ] main の docs-check gate が AUTOGEN 滞留で恒常 fail しない

## 元learning item / 根拠

- **要約**: AUTOGEN ブロックの日付刻印構造と再生成運用欠如による突合 NG の恒常再発
- **根拠**: Case #2898（計測日鮮度 NG、ベース commit でも同一再現、generate_indexes 再生成 commit 8ac79899 で解消）、Case #2936（lint-skills delta NG と check_integrity AUTOGEN 滞留が main @ c421a4b4 で恒常再現する pre-existing として棚卸し記録）+ deferred L1436/L1140 の統合昇華
- **再発条件**: 計測日跨ぎの check_integrity 実行、REQ 行数変動を伴う Case の case-close、generate_indexes 再生成を伴わない運用
- **横展開可能性**: AUTOGEN ブロックと docs 正典文言期待テスト全般

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: bug
- **関連Issue**: Case #2898, Case #2936

## 付帯: SKILL.md description 600字上限超過の独立改善要求（adversarial-review A-5）

本成果物の問題クラスとは根本原因が異なるため、独立した改善要求候補として記録する: agentdev-workflow-case-ready の description 743 chars、agentdev-workflow-case-revise の 663 chars が 600 字上限を超過し lint-skills NG が恒常再現している（main @ c421a4b4 対象、aggregate budget warning 付き）。対策候補は description 一括短縮の別 Case 化（agentdev-skill-authoring の description 規約に従う）。これは本成果物の AUTOGEN 対策とは独立に対応判定されるべきものである。
