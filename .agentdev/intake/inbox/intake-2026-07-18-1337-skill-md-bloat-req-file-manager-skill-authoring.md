# Intake Item: SKILL.md が500行閾値超過（agentdev-req-file-manager, agentdev-skill-authoring）

## 発生源

- 発生 phase: /repo/docs-check 実行（2026-07-18 04:35）
- capture 分類: intake（具体的作業候補 = SKILL.md の references/ への切り出し）

## 問題

`lint_skills.ts` が SKILL.md bloat WARNING を2件検出した。SKILL.md は500行閾値を超える場合、知識の局所集中を示す兆候として WARNING になる（progressive disclosure 観点）。

検出対象:

- `src/opencode/skills/agentdev-req-file-manager/SKILL.md`: 513行（閾値 +13）
- `src/opencode/skills/agentdev-skill-authoring/SKILL.md`: 523行（閾値 +23）

原因分類: 確認済（両スキルとも運用知識の集約が進み、references/ 配下への切り出し候補が SKILL.md 本体に残留している）。

## 推奨修正対象

両スキルについて、SKILL.md 本体から詳細手順・具体例・長文の判定基準を `references/*.md` へ切り出す。SKILL.md 本体は frontmatter・USE FOR / DO NOT USE FOR・検査カテゴリ一覧・責務範囲・See Also に絞り、500行以下に戻す。

切り出し候補の例:

- agentdev-req-file-manager: 番号採番ルール詳細、CREATE/APPEND/UPDATE 判定フロー詳細、frontmatter 規約の長文例
- agentdev-skill-authoring: 5軸評価基準の詳細、4プロトコルの長文手順、品質ゲート運用例

完了条件は両 SKILL.md が500行以下になり、`lint_skills.ts` の SKILL.md bloat WARNING が0件になること。

## 関連

- 発見元レポート: `lint_skills.ts` 実行結果（references/ 構造検査 WARNING 2件）
- スキル構造基準: `agentdev-skill-authoring` SKILL.md（progressive disclosure、500行閾値の根拠）
- 要件: REQ-0113（Skill References SPEC分離基準）
