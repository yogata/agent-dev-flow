---
title: skill Design テンプレート
status: accepted
created: 2026-06-21
updated: 2026-07-24
---

# skill Design テンプレート

> 全ての `agentdev-*` 配布スキルは、`docs/designs/skills/<skill-name>.md` に専用 Design を持つ。
> 本ファイルは新規 skill Design を作成する際の最小構成テンプレートである。
> `repo-agentdev-integrity` は repo-local、配布対象外のため対象外。

## 最小構成

skill Design は以下の 7 セクションを最小構成とする。

```markdown
---
title: <skill-name> Design
status: draft | accepted
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

# <skill-name> Design

## 目的
スキルの役割を1〜2文で記述する。

## 適用対象
USE FOR / DO NOT USE FOR を記述。

## 提供する判断、操作
再利用可能な判断基準・検査観点・操作手順を列挙。
所有 script と公開検証契約（agentdev-artifact-validation 経由等）を明記。

## 参照する references
- references/*.md の各ファイルと役割

## 現在の動作
- 主要ルール・制約・契約を要約
- 不変条件、入力、出力、副作用、reference 選択条件を中心に記述

## 対象外
- DO NOT USE FOR・ガードレールに明示された禁止事項

## 検証観点
- スキルが提供する判定基準・検査カテゴリ
```

## 記述ルール

- 現在動作の正として振る舞う。SKILL.md 本文と references/ 内容を要約して記載する。
- REQ/Decision/Design ID を含むことを許可する（配布物 commands/skills への ID 除去要件は docs/ 以下の Design には適用しない）。
- skill Design は当該 skill のみの動作を記載する。複数 skill にまたがる共通契約は `docs/designs/workflows/` に置く。
- 実行時スキル（src/opencode/skills/<name>/SKILL.md）は本 Design に依存しない（REQ-001）。Design は docs 内部設計文書である。
- 既存 Design への追記時は frontmatter `status` を変更しない（v2:ADR-0123 Decision #1）。新規作成時は `status: draft` を付与する。

## skill Design の記述中心

skill Design は提供する判断、USE FOR、DO NOT USE FOR、入力、出力、副作用、不変条件、reference 選択条件、所有 script、検証条件を中心に記述する。
操作手順、例、作業履歴の列挙を必須としない。

- 200行を超える SKILL.md は責務集中、不要な手順、例、作業履歴の混入について確認する（REQ-002-037）
- 200行を超えることだけを不合格理由にしない。責務上の根拠があれば維持を認める
- 異なる判断モデル、入力、出力、責任境界を持つ内容は skill 分割候補として扱う
- 所有 script は公開検証契約（agentdev-artifact-validation 経由等）として宣言し、内部パスは references/ に限定する

## See Also

- [commands/_template.md](../commands/_template.md)（command Design テンプレート）
- [workflows/](../workflows/)（横断ワークフロー契約）
- v2:ADR-0123（Design lifecycle（draft/accepted））
- REQ-001（REQ/Design 責務分離）

## v4 責務分類

ADF v4 の責務分類（正典: DEC-036、foundations/v4-responsibility-boundaries Design）における各 skill Design の 3 区分（semantic 担当 / deterministic 委譲先 / 知識提供）。分類の正本は Root Case #3011 の分類語彙表であり、各 Design の「v4 責務分類」節はその確定値を記録する。新規 skill Design は次の様式で本節を記述する。

- **semantic 担当**: semantic 6 項目の該当項目（0 件可）
- **deterministic 委譲先**: deterministic 11 項目の該当処理と委譲先 script・Custom Tool の実名（委譲先未整備は「債務」と明記し、実在しない script 名を記載しない）
- **知識提供**: 判定基準・手続き・様式・選定規則など、一次情報として提供する知識

テンプレート自身の区分は次のとおり。

- **semantic 担当**: 0 件（雛形）
- **deterministic 委譲先**: なし
- **知識提供**: テンプレート様式
