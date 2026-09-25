# 既存対策の更新: 子 task 観測証跡の永続チャネル記録手順（委譲契約への明示）

## 背景

TS-006 統合検証（durable state からの再開と staggered background 並列再委譲の overlap 実測確認・Case #3123、PR #3138）において、対象別・stage 別観測証跡（REQ-034-045）を子 task 側が PR 本文等へ引用可能な形で親が受領する経路が現状ないことが確認された。
実例として、driver の blocked 報告が一時 session 出力のみとなり SSoT コメント不能となった。
record-in-findings 契約どおり PR 本文 Findings へ記録し（運用環境依存のため契約側の不備を示さない）、case-close の Capture 回収で learning inbox へ取り込んだ。

## 問題

親子間の観測証跡引き継ぎが background_output 等の一時 session 通信に依存しており、子が証跡を永続チャネル（PR 本文・Issue コメント・durable state ファイル）へ書込む手段が委譲契約に存在しない。
観測証跡を要求する検証を子 task に委譲する場合、証跡が一時 session 出力のみで完結すると後工程での引用・監査が不能になる。

## 望ましい変更

case-run 委譲契約（adapter / orchestration 系 reference）に観測証跡の永続チャネル記録手順を追加する。

- 検証契約と同時に、証跡の永続チャネル経由の受領経路（例: PR 本文の指定セクション〔record-in-findings 形式〕・Issue コメント・durable state ファイル）を用意する。
- 永続チャネル記録の明示的な記録形式を手順として定める。

## 対象範囲

### 対象

- case-run 委譲契約の reference（agentdev-case-run-execution-adapter の harness-delegation.md 等の観測証跡記録手順）
- 観測証跡を要求する検証の委譲手順

### 対象外

- record-in-findings 契約自体の変更（実績ある記録形式であり、契約側の不備を示すものではない）
- background_output 等の一時 session 通信機構の変更
- REQ-034-045 自体の変更

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | src/opencode/skills/agentdev-case-run-execution-adapter/references/harness-delegation.md（実在・inbox 参照確認済み） | 観測証跡の永続チャネル記録手順（record-in-findings 形式の明示的な記録）の追記 |
| Design | docs/designs/workflows/v4-delegation-contracts.md | 委譲時の観測証跡引き継ぎ経路の記載要否判断 |

## 既存対策確認

- **確認結果**: 既存対策あり（record-in-findings 契約・case-close Capture 回収）
- **該当ファイル**: src/opencode/skills/agentdev-case-run-execution-adapter/references/harness-delegation.md（PR 本文 Findings への記録形式）
- **ギャップ分類**: application miss
- **ギャップ詳細**: 永続チャネル記録の手段（record-in-findings）は存在するが、観測証跡を要求する委譲の契約時にその経路を同時に用意する手順が委譲契約に明示されておらず、証跡が一時 session 出力のみで完結した実例がある。

## 制約

- 子 task から Issue コメント / PR 本文への書込みは正規経路（agentdev_gh）の契約に従う。
- 証跡の永続チャネル記録は検証契約と同時に用意し、検証後に事後的に経路を探さない運用とする。

## 受け入れ条件

- [ ] 観測証跡を要求する委譲の契約手順に永続チャネル記録経路（record-in-findings 等の明示的な記録形式）の用意が明記されている
- [ ] 証跡が一時 session 出力のみで完結しないための確認観点が手順に存在する

## 元learning item / 根拠

- **要約**: 子 task 側の観測証跡を親が永続チャネル経由で受領する経路を委譲契約に明示する（REQ-034-045 型検証の証跡引き継ぎ）。
- **根拠**: Case #3123（PR #3138）の TS-006 統合検証。driver blocked 報告が一時 session 出力のみとなった実例と、record-in-findings 契約による PR 本文 Findings セクション記録の実績。case-close の Capture 回収で本エントリを回収済み。
- **再発条件**: 観測証跡を必要とする検証（REQ-034-045 型）を子 task で実施し、証跡が一時 session 出力のみで完結する場合。
- **横展開可能性**: 観測証跡を伴う委譲検証全般（並列再委譲、統合検証等）に共通する手順ギャップ。

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: documentation（手順追記）
- **関連Issue**: Case #3123（PR #3138）
