# アーキテクチャ助言サブエージェント委譲（harness 具象ノート）

req-define がアーキテクチャ助言サブエージェントへアーキテクチャレビューを委譲する際の起動方法、相談プロトコル具体を集約する harness 具象ノート。
配布 SKILL.md は相談プロトコル知識（入力テンプレート、4 ラベル構造、分類権限）を提供し、起動方法の具体は本ファイルおよび AGENTS.md、references/<harness>.md に配置する。

## 起動方法

アーキテクチャ助言サブエージェントの起動手段、実行制御パラメータは AGENTS.md および references/<harness>.md 参照。
配布物は起動手段を固定せず、各 harness が AGENTS.md で選定した起動方式に従う。

## 委譲時最小契約

アーキテクチャ助言サブエージェントへの委譲は delegation-contracts SPEC（extension 経由）の委譲時最小契約（inputs, side_effect_boundary, output_contract, capture_handoff）に従う。

- **inputs**: SKILL.md「アーキテクチャ助言サブエージェント相談の標準入力テンプレート」の5要素
- **side_effect_boundary**: アーキテクチャ助言サブエージェントはファイル編集を行わない（読み取り、助言のみ）
- **output_contract**: 4 ラベル構造（確定事項/推定事項/ユーザー確認事項/ブロッカー）の soft-contract
- **capture_handoff**: 助言結果は親エージェントが分類してドラフトへ反映する（アーキテクチャ助言サブエージェントは直接反映しない）

## 相談プロトコル具象

- 親エージェント（req-define）が標準入力テンプレートを組み立て、欠落要素を確認してから委譲する
- アーキテクチャ助言サブエージェントは推奨方針、設計リスク、ADR 要否判断、衝突解消方針、根拠ファイル、確信度を助言内容として含め、各助言に 4 ラベルを付ける
- ラベル分類の最終権限は親エージェントが保持する（soft-contract）
- 既存文書またはユーザー合意で裏付けられていない内容を要件本文へ確定事項として混入させない

## 利用不可時の取り扱い

アーキテクチャ助言サブエージェントが利用できない状態で助言確認が必要な条件（SKILL.md「実行条件」参照）に該当する場合、req-define はブロッカーとして報告し、静かにスキップしない。

## See Also

- `agentdev-architecture-advisory` SKILL.md（相談プロトコル知識）
- AGENTS.md（harness 選定、起動手段）
- delegation-contracts SPEC（委譲時最小契約）
