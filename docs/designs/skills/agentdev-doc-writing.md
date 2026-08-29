---
title: `agentdev-doc-writing` Design
status: accepted
created: 2026-06-21
updated: 2026-08-30
---
<!-- ADF-COVERS(verification): REQ-001-004, REQ-001-005, REQ-001-016, REQ-001-018, REQ-001-019, REQ-001-046, REQ-001-048, REQ-001-049, REQ-001-061, REQ-001-063, REQ-001-064, REQ-004-007, REQ-004-008, REQ-004-009, REQ-004-023, REQ-004-024, REQ-004-025, REQ-004-026, REQ-004-027, REQ-004-028, REQ-004-029, REQ-004-030 -->

# `agentdev-doc-writing` Design

## 目的

docs 配下の REQ/Decision/Design/guides/README および関連する command/skill の自然言語記述の品質を静的査読し、読者が判断、実行できる文書へ修正提案を提示する。
QG-1〜QG-4 の主ゲート体系を置き換えず、文書種別責務、要件性、文意品質、粒度の補助査読として位置づける（v2:REQ-0140）。

## 適用対象

- `docs/**`（REQ, ADR, Design, guides, README）の作成、編集、レビュー時
- docs を生成、編集する command / skill の自然言語記述（本文、description、参照記述）の執筆、編集時
- ユーザーが「AIっぽい」「薄い」「抽象的」「意味不明」「ビジネス文書として直せ」と指示した場合
- Issue/PR 本文、完了報告、設計説明の執筆またはレビュー時
- `read-only`、`advisor`、`architecture-affecting` 等の英語混じり表現が docs に残留していないか確認する場合

## 提供する判断、操作

- 文書種別責務、要件性、文意品質、粒度の補助査読
- `japanese-tech-writing` 規範（LLM っぽい表現の禁止、空虚な形容、空虚な動詞等）への適合査読
- 英語混じり表現、抽象語の具体的書き換え
- 査読出力の分類（残す/分割/移送/削除候補）と修正文案提示

## 参照する references

- `references/document-boundaries.md`（文書種別責務）
- `references/req-line-quality.md`（要件行の品質）
- `references/decision-writing-quality.md`（Decision 本文の品質）
- `references/spec-writing-quality.md`（Design 本文の品質）
- `references/rewrite-patterns.md`（検出→書き換え）
- `references/review-output.md`（査読出力形式）
- `references/execution-subject-classification.md`（実行主体分類（command / skill / subagent / harness）の査読）

配置基準、用語政策の原本は `docs/designs/responsibilities/document-type-responsibilities.md`、執筆規範の SSoT は `japanese-tech-writing` スキル（AGENTS.md 経由）。
`agentdev-doc-writing` は third-party Skill（文章規範）への正規参照点であり、依存 Skill は skills.yaml 宣言+取得機構経由で利用者環境に配置される（REQ-002-044）。
内容が重複する場合は原本を優先（v2:REQ-0140-023）。

## 現在の動作

- 静的査読のみを担当。実行時の動的判断（要件分析、Decision 要否判定）は `agentdev-req-analysis`、`agentdev-decision-guidelines` が担う（v2:REQ-0140-024）
- ファイル保存、commit、push は行わない。査読提案を返すのみ（v2:REQ-0140-022）
- 未合意事項を確定しない。問題箇所を分類し修正文案または移送先候補として提示する（v2:REQ-0140-021）

## 対象外

- コード実装、テスト実行
- REQ/Decision 番号付与、APPEND/UPDATE/CREATE 判定（`agentdev-req-file-manager` / `agentdev-decision-file-manager` 担当）
- Decision 必要性判定（`agentdev-decision-guidelines` 担当）
- command 手順設計、Issue/PR CRUD
- 要件分析（`agentdev-req-analysis` 担当）
- カジュアルな文章、広告、詩

## 検証観点

- 文書種別責務が妥当か（REQ/Decision/Design/guide/README の配置）
- 要件行が主語、対象、状態、検証可能性、独立性、肯定文主文を満たすか
- Decision 本文が意思決定文書として成立しているか
- Design 本文が詳細仕様の置き場として成立しているか
- `japanese-tech-writing` 規範（LLM っぽい表現の禁止、空虚な形容、空虚な動詞等）への適合

### 文章品質観点（査読時）

配布物の査読時に次の文章品質観点を適用する。規範原本は japanese-tech-writing スキル、契約は配布物の文章品質契約 REQ（REQ-053）である。

- メタ指示残留の検出
- 未完結文の検出（主述のねじれ、文の途中終了を含む）
- 不自然な英語混在の検出（英字許容リストに基づかない英単語）
- 「〜を正とする」「〜が正」濫用の検出（規範原本への参照を伴わない、または関係が一義的に判断できない規範宣言）
- 明らかな誤字の検出（機械判定不能な人間判断項目は査読で扱う）
- 名詞連結の検出（読点・助詞で切れ目が示されない過長な名詞列）
- 一文への条件過剰連結の検出（1 文 3 以上の条件節）
- Markdown 構造破損の検出（見出し階層不整合、未閉鎖コードブロック、壊れたリンク、壊れたコードスパン、強調記法の破損）
- 制御文字混入の検出
- 文単位の修正候補の提示（検出した違反に対し、文単位の修正候補を提示する）

## See Also

- [agentdev-req-analysis.md](agentdev-req-analysis.md)（要件分析（動的判断））
- [agentdev-decision-guidelines.md](agentdev-decision-guidelines.md)（Decision 要否判定（動的判断））
- [document-type-responsibilities.md](../responsibilities/document-type-responsibilities.md)（配置基準、用語政策 原本 Design）
- v2:REQ-0140（文書品質ゲート）

