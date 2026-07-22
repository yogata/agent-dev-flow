# 配布物参照境界違反（具体 REQ/ADR ID・具体パス参照）

## 観測内容

配布 command/skill 本文（`src/opencode/commands/agentdev/**/*.md`、`src/opencode/skills/agentdev-*/**/*.md`）に、consumer 環境で未解決となる具体参照が含まれる。発生源は docs-check（2026-07-18）の check_integrity.ts（RuntimeReference / IR-055）および check_distribution_boundary.ts。検出内容は以下3種。

1. 具体 ID 参照: `REQ-NNNN`、`REQ-NNNN-NNN`、`ADR-NNNN` 形式の ID が配布物本文中に埋め込まれている。consumer 環境では `docs/requirements/`、`docs/adr/` が存在しないため未解決となる。
2. 具体パス参照: `src/opencode/`、`docs/specs/`、`docs/guides/` 等、repo-local な絶対パス参照が配布物に含まれる。
3. 固定 URL 参照: 今回は検出なし（0件）。

検出規模（両スクリプト合算・重複排除後）: check_integrity.ts RuntimeReference NG（IR-055 delta）218件、Warning 10件。check_distribution_boundary.ts failures 79件（concrete-id 78 + concrete-path 1）。ファイル別では `case-auto.md`（38件）、`agentdev-inspect-skills/SKILL.md`（21件）、`case-run.md`（4件）、`agentdev-inspect-skills/references/semantic-diagnostic-perspectives.md`（4件）、`case-open.md`（3件）、`case-close.md`（2件）に集中する。

IR-055 baseline に既登録の既知違反は段階導入方針（REQ-0108-263/264）に従い INFO に格下げ済み。本 item は新規 delta 分と、check_distribution_boundary.ts が厳格に報告した全件を対象とする。

## 影響

consumer 環境で参照が未解決となり、配布物の信頼性・保守性が低下する。重要性は中。発生頻度は、配布物本文に具体 ID・具体パスが埋め込まれる度に発生する。新規 delta 218件のうち実新規違反と baseline 更新漏れの再検出が混在する可能性があり、是正対象の確定に精査を要する。

## 課題

配布物本文に repo-local な具体参照（REQ/ADR ID、`src/opencode/` 等の絶対パス）が残存し、consumer 環境で解決できない。配布物参照境界（project extensions 機構）が守られていない。

## 既存要件・仕様との関連

- REQ-0108-263/264（IR-055 段階導入）: 既知違反（baseline-known）は INFO 扱いとする方針。本 item は新規 delta 分の是正を促す。
- IR-055（runtime-unresolved-reference）: 本件の検査ルール本体。
- 配布物参照境界（project extensions 機構）: 具体参照を配布物に含めない境界規則。

## 対応方針の方向性

ファイル単位で横断是正するのが現実的。

- 具体 ID 参照の除去: 配布物本文中の `REQ-NNNN`/`ADR-NNNN` を、機能名・文書種別への抽象参照へ置換、または削除。文脈上 ID が必要な場合は `docs/specs/` で完結する表現へ再構成する。
- 具体パス参照の汎化: `src/opencode/`、`docs/specs/`、`docs/guides/` 等、repo-local 絶対パスを汎用表記（例: 「当該 skill の SKILL.md」「ガイド」）へ置換する。

baseline 運用との整合: 新規 delta の大部分が baseline 更新漏れの再検出の場合は、baseline 再生成（`--update-ir055-baseline`）で吸収する選択肢もある。内容精査の上、(a) 実新規違反として是正、(b) baseline 更新漏れとして再更新、を判断する。複数ファイルにまたがるため RU 化時に作業単位を分割する可能性がある。
