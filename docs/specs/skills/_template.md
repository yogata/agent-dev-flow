---
title: skill SPEC テンプレート
status: accepted
created: 2026-06-21
updated: 2026-06-21
---

# skill SPEC テンプレート

> 全ての `agentdev-*` 配布スキルは、`docs/specs/skills/<skill-name>.md` に専用 SPEC を持つ（AG-006）。本ファイルは新規 skill SPEC を作成する際の最小構成テンプレートである。`repo-agentdev-integrity` は repo-local、配布対象外のため対象外。

## 最小構成

skill SPEC は以下の 7 セクションを最小構成とする（AG-007, AG-008）。

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

## 参照する references
- references/*.md の各ファイルと役割

## 現在の動作
- 主要ルール・制約・契約を要約

## 対象外
- DO NOT USE FOR・ガードレールに明示された禁止事項

## 検証観点
- スキルが提供する判定基準・検査カテゴリ
```

## 記述ルール

- 現在動作の正として振る舞う。SKILL.md 本文と references/ 内容を要約して記載する。
- REQ/ADR/SPEC ID を含むことを許可する（AG-009 は配布物 commands/skills に限定。docs/ 以下の SPEC は対象外）。
- skill SPEC は当該 skill のみの動作を記載する。複数 skill にまたがる共通契約は `docs/specs/workflows/` に置く（AG-008）。
- 実行時スキル（src/opencode/skills/<name>/SKILL.md）は本 SPEC に依存しない（ADR-0104）。SPEC は docs 内部設計文書である。
- 既存 SPEC への追記時は frontmatter `status` を変更しない（ADR-0123 Decision #1）。新規作成時は `status: draft` を付与する。

## See Also

- [commands/_template.md](../commands/_template.md)（command SPEC テンプレート）
- [workflows/](../workflows/)（横断ワークフロー契約）
- ADR-0123（SPEC lifecycle（draft/accepted））
- REQ-0136（REQ/SPEC 責務分離）
