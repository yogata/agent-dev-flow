---
title: skill SPEC テンプレート
status: accepted
created: 2026-06-21
updated: 2026-07-22
---

# skill SPEC テンプレート

> 全ての `agentdev-*` 配布スキルは、`docs/specs/skills/<skill-name>.md` に専用 SPEC を持つ。
> 本ファイルは新規 skill SPEC を作成する際の最小構成テンプレートである。
> `repo-agentdev-integrity` は repo-local、配布対象外のため対象外。

## 最小構成

skill SPEC は以下の 7 セクションを最小構成とする。

```markdown
---
title: <skill-name> SPEC
status: draft | accepted
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

# <skill-name> SPEC

## 目的
スキルの役割を1〜2文で記述する。

## 適用対象
USE FOR / DO NOT USE FOR を記述。

## 提供する判断・操作
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
- REQ/ADR/SPEC ID を含むことを許可する（配布物 commands/skills への ID 除去要件は docs/ 以下の SPEC には適用しない）。
- skill SPEC は当該 skill のみの動作を記載する。複数 skill にまたがる共通契約は `docs/specs/workflows/` に置く。
- 実行時スキル（src/opencode/skills/<name>/SKILL.md）は本 SPEC に依存しない（ADR-0104）。SPEC は docs 内部設計文書である。
- 既存 SPEC への追記時は frontmatter `status` を変更しない（ADR-0123 Decision #1）。新規作成時は `status: draft` を付与する。

## skill SPEC の記述中心（AG-002、AG-003、AG-012、RU-20260722-01）

skill SPEC は提供する判断、USE FOR、DO NOT USE FOR、入力、出力、副作用、不変条件、reference 選択条件、所有 script、検証条件を中心に記述する（AG-002）。操作手順、例、作業履歴の列挙を必須としない。

- 200行を超える SKILL.md は責務集中、不要な手順、例、作業履歴の混入について確認する（AG-012、REQ-0103-037）
- 200行を超えることだけを不合格理由にしない。責務上の根拠があれば維持を認める
- 異なる判断モデル、入力、出力、責任境界を持つ内容は skill 分割候補として扱う
- 所有 script は公開検証契約（agentdev-artifact-validation 経由等）として宣言し、内部パスは references/ に限定する（AG-003、AG-009、AG-019）

## See Also

- [commands/_template.md](../commands/_template.md)（command SPEC テンプレート）
- [workflows/](../workflows/)（横断ワークフロー契約）
- ADR-0123（SPEC lifecycle（draft/accepted））
- REQ-0136（REQ/SPEC 責務分離）
