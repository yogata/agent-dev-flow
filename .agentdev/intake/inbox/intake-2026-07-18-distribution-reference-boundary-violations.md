# Intake Item: 配布物参照境界違反（具体 REQ/ADR ID・具体パス参照）

## 発生源

- docs-check 実行日時: 2026-07-18
- 検査スクリプト: check_integrity.ts (RuntimeReference / IR-055) + check_distribution_boundary.ts
- 検査ルート: intake
- 原因分類: 確認済（IR-055 段階導入中・baseline-known 分は INFO 扱い、delta 分は新規違反）

## 問題

配布 command/skill 本文（`src/opencode/commands/agentdev/**/*.md`、`src/opencode/skills/agentdev-*/**/*.md`）に、consumer 環境で未解決となる具体参照が含まれる。検出内容は以下3種。

1. **具体 ID 参照**: `REQ-NNNN`、`REQ-NNNN-NNN`、`ADR-NNNN` 形式の ID が配布物本文中に埋め込まれている。consumer 環境では `docs/requirements/`、`docs/adr/` が存在しないため未解決となる。
2. **具体パス参照**: `src/opencode/`、`docs/specs/`、`docs/guides/` 等、repo-local な絶対パス参照が配布物に含まれる。
3. **固定 URL 参照**: 今回は検出なし（0件）。

検出規模（両スクリプト合算・重複排除後）:

| 検査 | 検出数 | 主な内容 |
|------|--------|----------|
| check_integrity.ts RuntimeReference NG (IR-055 delta) | 218件 | 新規 strict 違反（baseline 差分） |
| check_integrity.ts RuntimeReference Warning | 10件 | heuristic 違反（docs/specs/, docs/guides/ 参照） |
| check_distribution_boundary.ts failures | 79件 | 同一問題を厳格に全件報告（concrete-id 78 + concrete-path 1） |

ファイル別違反件数（check_distribution_boundary.ts の79件ベース・意味重複あり）:

| ファイル | 件数 |
|----------|------|
| `src/opencode/commands/agentdev/case-auto.md` | 38 |
| `src/opencode/skills/agentdev-inspect-skills/SKILL.md` | 21 |
| `src/opencode/commands/agentdev/case-run.md` | 4 |
| `src/opencode/skills/agentdev-inspect-skills/references/semantic-diagnostic-perspectives.md` | 4 |
| `src/opencode/commands/agentdev/case-open.md` | 3 |
| `src/opencode/commands/agentdev/case-close.md` | 2 |
| `src/opencode/skills/agentdev-doc-writing/references/japanese-replacement-dictionary.md` | 2 |
| `src/opencode/commands/agentdev/req-save.md` | 1 |
| `src/opencode/commands/agentdev/spec-save.md` | 1 |
| `src/opencode/skills/agentdev-case-run-execution-adapter/SKILL.md` | 1 |
| `src/opencode/skills/agentdev-gh-cli/references/verify.md` | 1 |
| `src/opencode/skills/agentdev-workflow-templates/SKILL.md` | 1 |

注意: IR-055 baseline に既登録の既知違反は INFO に格下げされている（約11件+265件の多く）。本 item は新規 delta として報告された分と、check_distribution_boundary.ts が厳格に報告した全件を対象とする。

## 推奨修正対象

是正方針は以下2軸で検討する。ファイル単位で横断是正するのが現実的（両方同時に直す）。

1. **具体 ID 参照の除去**: 配布物本文中の REQ-NNNN/ADR-NNNN を、機能名・文書種別への抽象参照へ置換、または削除。ただし文脈上 ID が必要な場合は `docs/specs/` で完結する表現へ再構成。
2. **具体パス参照の汎化**: `src/opencode/`、`docs/specs/`、`docs/guides/` 等、repo-local 絶対パスを汎用表記（例: 「当該 skill の SKILL.md」「ガイド」）へ置換。

IR-055 baseline 運用との整合:

- 既知違反（baseline-known）は段階導入方針（REQ-0108-263/264）に従い INFO 扱い済み。本 item は新規 delta 分の是正を促す。
- もし「新規 delta」の大部分が実態は既知違反の再検出（baseline 更新漏れ）の場合は、baseline 再生成（`--update-ir055-baseline`）で吸収することも選択肢。内容精査の上、(a) 実新規違反として是正、(b) baseline 更新漏れとして再更新、を判断する。

昇格先候補: intake-promote で採否判断。複数ファイルにまたがるため RU 化時に作業単位を分割する可能性（ファイル群単位）。

## 関連

- 検出元レポート: `.agentdev/integrity/reports/2026-07-18-integrity-report-2.md`（RuntimeReference セクション）+ check_distribution_boundary.ts stdout（非永続）
- 対象ファイル群: 上記ファイル別違反件数表参照
- 関連 REQ/ADR:
  - REQ-0108-263/264（IR-055 段階導入）
  - IR-055（runtime-unresolved-reference）
  - 配布物参照境界（project extensions 機構）
- baseline 更新ユーティリティ: `bun run .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts --update-ir055-baseline`
