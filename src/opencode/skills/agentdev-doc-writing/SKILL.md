---
name: agentdev-doc-writing
description: ADR/REQ/SPEC横断の文書品質査読ゲート（文書種別責務・要件性・文意品質・粒度・AI-slop検出・配布物 ID 汚染検出・実行主体分類）。USE FOR: docs配下のREQ/ADR/SPEC/guides/DOC-MAP/READMEの査読、docsを生成・編集するcommand/skillの自然言語記述の査読、AI-slop（主語なし・結論なし・抽象語・長大行等）の検出と書き換え提案、read-only/advisor/architecture-affecting系表現の分解、英文混じり表現の検出、配布物（src/opencode/commands/・skills/）への内部 ID（REQ/ADR/SPEC-ID/IR）残留の検出、実行主体（command/skill/subagent/harness）の誤認検出。DO NOT USE FOR: コード実装、テスト実行、REQ/ADR番号付与、APPEND/UPDATE/CREATE判定、ADR必要性判定、command手順設計、Issue/PR CRUD、要件分析（req-analysis担当）、ADR要否動的判断（adr-guidelines担当）、ファイル保存・commit・push。
---

# 文書品質ゲート（doc-writing）

## 目的

書かれた文書の品質を静的査読し、読者が判断・実行できる文書へ修正提案を提示する。対象は `docs/` 配下の REQ/ADR/SPEC/guides/DOC-MAP/README、および docs を生成・編集する command/skill の自然言語記述である。QG-1〜QG-4 の主ゲート体系を置き換えず、文書種別責務・要件性・文意品質・粒度の補助査読として位置づける。

本スキルは**静的査読**を担う。実行時の動的判断（要件分析・ADR要否判定）は agentdev-req-analysis・agentdev-adr-guidelines が担う。

## 原本

原本は [docs/specs/writing-style.md](../../../../../docs/specs/writing-style.md) である。本スキルはその実行入口であり、`references/*` は運用ビュー（圧縮ビュー・チェックリスト・出力形式）である。内容が重複する場合、原本を優先する。

## 対象/ 対象外

**対象:**

- `docs/**`（REQ, ADR, SPEC, guides, DOC-MAP, README）
- docs を生成・編集する command/ skill の自然言語記述（req-define, req-save, spec-save, case-run, case-close, case-auto, inspect-docs, docs-check が扱う docs 成果物とその記述）
- Issue 本文, PR 本文, 完了報告, 設計説明, intake/learning 中間成果物

**対象外:**

- コード実装, テスト実行
- REQ/ADR 番号付与, APPEND/UPDATE/CREATE 判定（req-file-manager/ adr-file-manager 担当）
- ADR 必要性判定（adr-guidelines 担当）
- command 手順設計, Issue/PR CRUD
- 要件分析（req-analysis 担当）
- カジュアルな文章/ 広告/ 詩

## 査読観点

| 観点 | 内容 | 参照 |
|---|---|---|
| 文書種別責務 | REQ/ADR/SPEC/guide/README の配置が妥当か | [document-boundaries.md](references/document-boundaries.md) |
| 要件行の品質 | 主語・対象・状態・検証可能性・独立性・肯定文主文 | [req-line-quality.md](references/req-line-quality.md) |
| ADR 本文の品質 | 意思決定文書として成立しているか | [adr-writing-quality.md](references/adr-writing-quality.md) |
| SPEC 本文の品質 | 詳細仕様の置き場として成立しているか | [spec-writing-quality.md](references/spec-writing-quality.md) |
| AI-slop 検出 | 10基準・5出力原則・11ルール | [ai-slop-detection.md](references/ai-slop-detection.md) |
| 実行主体分類 | 文書内で言及される実行主体（command / skill / subagent / harness）の分類が正確か。誤認（command を skill と呼ぶ、harness を skill と呼ぶ、subagent を skill と呼ぶ）を検出する | [execution-subject-classification.md](references/execution-subject-classification.md) |
| 検出→書き換え | 英語混じり表現・抽象語の具体的書き換え | [rewrite-patterns.md](references/rewrite-patterns.md) |
| 査読出力 | 残す/分割/移送/削除候補の分類・修正文案 | [review-output.md](references/review-output.md) |

## Trigger conditions

- docs/** の REQ・ADR・SPEC・guides・DOC-MAP・README を作成・編集・レビューする場合
- docs を生成・編集する command/ skill の本文・description・参照記述を執筆・編集する場合
- ユーザーが「AIっぽい」「薄い」「抽象的」「意味不明」「ビジネス文書として直せ」と指示した場合
- Issue/PR 本文・完了報告・設計説明を執筆またはレビューする場合
- `read-only`・`advisor`・`architecture-affecting` 等の英語混じり表現が docs に残留していないか確認する場合
- 配布物（`src/opencode/commands/`・`src/opencode/skills/`）に AgentDevFlow 内部 ID（`REQ-XXXX`/`ADR-XXXX`/`SPEC-{KIND}-{NNN}`/`IR-XX` 等）が残留していないか確認する場合
- SPEC / command / skill において実行主体（command / skill / subagent / harness）が誤認されていないか確認する場合（例: `/ulw-loop` を skill と記述、`load_skills` に command 名を指定、harness を skill と呼ぶ）

## 制約

- **ファイル保存・commit・push を行わない。** 本スキルは査読提案を返すのみであり、ファイルの永続化・git 操作は親コマンドが行う。
- **未合意事項を確定しない。** 問題箇所を分類し、修正文案または移送先候補として提示する。最終判断は親コマンド・ユーザーが行う。

## 参照先

- 原本: [docs/specs/writing-style.md](../../../../../docs/specs/writing-style.md)
- 運用ビュー: [references/](references/) 配下の8ファイル（上記査読観点表のリンク参照）

### See Also

- agentdev-req-analysis — 要件分析・動的判断（doc-writing と責務重複しない）
- agentdev-adr-guidelines — ADR要否判定・動的判断（doc-writing と責務重複しない）
- agentdev-req-file-manager — REQファイル管理（番号採番・CREATE/APPEND/UPDATE）
- agentdev-adr-file-manager — ADRファイル管理（番号採番・ライフサイクル）
- agentdev-skill-authoring — スキル構造・配置判断
- agentdev-workflow-templates — ワークフローテンプレート


