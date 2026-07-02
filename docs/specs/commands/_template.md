---
title: command SPEC テンプレート
status: accepted
created: 2026-06-21
updated: 2026-06-21
---

# command SPEC テンプレート

> 全ての `/agentdev/*` 公開コマンドは、`docs/specs/commands/<command-name>.md` に専用 SPEC を持つ（AG-005）。
> 本ファイルは新規 command SPEC を作成する際の最小構成テンプレートである。
> `/repo/docs-check` は repo-local、配布対象外のため対象外。

## 最小構成

command SPEC は以下の 8 セクションを最小構成とする（AG-007, AG-008）。

```markdown
---
title: <command-name> SPEC
status: draft | accepted
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

# <command-name> SPEC

## 目的
コマンドの役割を1〜2文で記述する。

## 入力
- 入力成果物・引数・参照専用入力を列挙

## 出力
- 出力成果物・状態遷移を列挙

## 副作用
- git 操作・外部 API 呼び出し・ファイル作成/削除等

## 現在の動作
- Step 群・ガードレール・フェーズ制約を要約

## 参照する横断 SPEC
- docs/specs/workflows/*.md の関連契約
- 依存する他の docs/specs/**/*.md

## 対象外
- DO NOT FOR・ガードレールに明示された禁止事項

## 検証観点
- QG-1〜QG-4 のいずれを参照するか・ローカル検証項目
```

## 記述ルール

- 現在動作の正として振る舞う。将来仕様、計画は書かない。
- REQ/ADR/SPEC ID を含むことを許可する（AG-009 は配布物 commands/skills に限定。docs/ 以下の SPEC は対象外）。
- 横断 SPEC（`docs/specs/workflows/`）は共通契約のみを記載する。個別 command SPEC の動作は当該 command SPEC に書く（AG-008）。
- 実行時コマンドは本 SPEC に依存しない（ADR-0104）。SPEC は docs 内部設計文書である。
- 既存 SPEC への追記時は frontmatter `status` を変更しない（ADR-0123 Decision #1）。新規作成時は `status: draft` を付与する。

## See Also

- [skills/_template.md](../skills/_template.md)（skill SPEC テンプレート）
- [workflows/](../workflows/)（横断ワークフロー契約）
- ADR-0123（SPEC lifecycle（draft/accepted））
- REQ-0136（REQ/SPEC 責務分離）
