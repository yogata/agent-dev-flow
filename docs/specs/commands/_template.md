---
title: command SPEC テンプレート
status: accepted
created: 2026-06-21
updated: 2026-07-24
---

# command SPEC テンプレート

> 全ての `/agentdev/*` 公開コマンドは、`docs/specs/commands/<command-name>.md` に専用 SPEC を持つ。
> 本ファイルは新規 command SPEC を作成する際の最小構成テンプレートである。
> `/repo/docs-check` は repo-local、配布対象外のため対象外。

## 最小構成

command SPEC は以下の 8 セクションを最小構成とする。

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
- 公開目的、ガードレール、フェーズ制約を要約
- 必須順序（成果物、安全性、外部契約へ影響する順序のみ）を記述
- 利用 skill 名と委譲責務を記述

## 参照する横断 SPEC
- docs/specs/workflows/*.md の関連契約
- 依存する他の docs/specs/**/*.md

## 対象外
- DO NOT FOR・ガードレールに明示された禁止事項

## 検証観点
- QG-1〜QG-4 のいずれかを参照するか・ローカル検証項目
```

## 記述ルール

- 現在動作の正として振る舞う。将来仕様、計画は書かない。
- REQ/ADR/SPEC ID を含むことを許可する（配布物 commands/skills への ID 除去要件は docs/ 以下の SPEC には適用しない）。
- 横断 SPEC（`docs/specs/workflows/`）は共通契約のみを記載する。個別 command SPEC の動作は当該 command SPEC に書く。
- 実行時コマンドは本 SPEC に依存しない（ADR-0104）。SPEC は docs 内部設計文書である。
- 既存 SPEC への追記時は frontmatter `status` を変更しない（ADR-0123 Decision #1）。新規作成時は `status: draft` を付与する。

## command SPEC と command 定義の対応付け（REQ-0143-005）

command SPEC は command 定義ファイル（`src/opencode/commands/agentdev/*.md`）の Step 番号を複製せず、以下の軸で command 定義と対応付ける（REQ-0143-005）。

| 対応付け軸 | 記述内容 |
|---|---|
| 公開目的 | command が解決するユーザー関心 |
| 入力 | 入力成果物、引数、参照専用入力 |
| 成果物 | 出力成果物、状態遷移 |
| 許可される副作用 | ファイル作成、更新、外部 API 呼出 |
| 安全境界 | G02 等のファイル操作制約、責務範囲 |
| 承認境界 | ユーザー確認を要する判断 |
| 停止状態 | 異常時、未解決時、ユーザー判断待ちの状態 |
| 必須順序 | 成果物、安全性、外部契約へ影響する順序（順序を変えると成果物または安全性が変わるもののみ） |
| 利用 skill 責務 | command が利用する skill 名と委譲する責務 |

Step 番号を持たない command SPEC（読み取り専用、分類系）は対応付けの対象外とし、その旨を当該 SPEC に文書化する。詳細は `../authoring/command-file-format.md`「command SPEC と command 定義の対応付け（REQ-0143-005）」を参照。

## See Also

- [skills/_template.md](../skills/_template.md)（skill SPEC テンプレート）
- [workflows/](../workflows/)（横断ワークフロー契約）
- ADR-0123（SPEC lifecycle（draft/accepted））
- REQ-0136（REQ/SPEC 責務分離）
