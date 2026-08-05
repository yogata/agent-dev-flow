---
name: agentdev-deep-review
description: "敵対的審議型レビュー（Deep Review）の実行入口。対象案、批判、合意管理の3論理的役割で構成される審議を通じて本質的争点を抽出し、批判と反論の往復で合意を形成する。USE FOR: 要件案、設計案、規格案、計画案の本質的合意形成、批判と反論による審議、未解決争点のユーザー質問化。DO NOT USE FOR: QG-1〜QG-4 の代替、通常のコードレビュー、テスト、機械的検査、inspect-docs/inspect-skills 診断、実装実行、ファイル保存、commit、push、Issue・PR更新、ユーザー承認代行、強制的統制ゲート。"
---

# 敵対的審議型レビュー（Deep Review）

本スキルは、対象案、批判側、および合意管理を行う親エージェントの3論理的役割で構成される審議を通じて、本質的争点を抽出し、合意を形成する助言プロトコルの実行入口である。
審議結果は判断材料であり、ユーザー承認、実装実行、強制的統制判定のいずれにもならない。

- **参照元**: ユーザーまたは呼び出し元コマンドの明示的選択
- **特性**: 審議プロトコルの振る舞い契約を実行入口として提供する。実装実行、ファイル編集、外部状態変更は本スキルの対象外

## 原本（SSoT）

本スキルの原本仕様は `agentdev-deep-review` SPEC である。
SPEC を正規原本とし、SKILL.md は実行入口および skill 固有の補完情報を保持する。重複または不一致がある場合は SPEC を正とする。
extension（`.agentdev/extensions/skills/`）は標準 SKILL.md を前提とし、SKILL.md と重複しない補完情報のみを提供する。

## 発動契約

ユーザーまたは呼び出し元が明示的に選択する任意のレビュー手段である。
すべての要件定義や計画作成で自動発動する強制工程ではなく、QG を代替する品質ゲートではなく、ユーザー承認を代行する承認ゲートではなく、実装開始または変更反映を停止する統制ゲートではない。
発動契約の詳細は SPEC「発動契約」を正とする。

## 審議上の論理的役割

審議は、対象案側、批判側、および親エージェント（合意管理）で構成する。
審議上の状態（争点の提起、反論、再検討、合意、撤回、限定、修正、ユーザー質問への移行、回答後再開、完了）の遷移、批判と反論の往復、争点状態管理の詳細は [references/deep-review-protocol.md](references/deep-review-protocol.md) に置く。
審議状態の物理的保存形式、スキーマ、最大ラウンド数、並列数、タイムアウトは SPEC 所有対象外とし、配布スキル実装へ委譲する。

## 副作用境界と責務分界

本スキルはファイル保存、commit、push、Issue・PR更新、その他の外部状態変更を行わない。
QG-1〜QG-4 を代替せず、通常のコードレビュー、テスト、機械的検査を代替せず、inspect-docs/inspect-skills の診断を代替しない。
すべての要件作成工程、計画作成工程への強制適用を行わない。
詳細は SPEC「副作用境界」「QG、通常レビュー、診断との責務分界」を正とする。

## 詳細プロトコル参照

批判と反論の往復、争点状態、本質的争点判定、自律審議継続、ユーザー質問への移行、回答後の再開、完了条件、出力契約の詳細手続きは [references/deep-review-protocol.md](references/deep-review-protocol.md) 参照。

## 非対象

本スキルは以下を扱わない:

| 非対象 | 責務主体 |
|--------|----------|
| QG-1〜QG-4 品質ゲート | 各工程のコマンド、`agentdev-quality-gates` |
| 通常のコードレビュー、テスト、機械的検査 | 実装担当、CI |
| inspect-docs/inspect-skills 診断 | `agentdev-doc-diagnostics`、`agentdev-inspect-skills` |
| 実装実行、ファイル編集、commit、push、Issue・PR更新 | case-run、各コマンド |
| ユーザー承認の代行 | ユーザー |

## See Also

- **agentdev-architecture-advisory**: アーキテクチャ助言の整理（req-define 事前確認）
- **agentdev-quality-gates**: QG-1〜QG-4 品質ゲート基準
- **agentdev-doc-diagnostics**: 証拠付き finding の診断
- **agentdev-skill-authoring**: スキル設計とレビュー規約
- **references/deep-review-protocol.md**: 審議プロトコルの詳細手続き
