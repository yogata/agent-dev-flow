---
title: src/opencode/skills/ 規範逸脱カタログ
topic: skills-compliance-catalog
source_issue: "#1042"
parent_epic: "#1037"
status: draft
created: 2026-06-23
review_norms:
  - japanese-tech-writing（skill 適用サブセット: 整形・LLM 表現禁止・冗長排除・論証の厳密さ・用語政策）
  - docs/specs/document-type-responsibilities.md（配置基準・用語政策）
---

# src/opencode/skills/ 規範逸脱カタログ

## 概要

`src/opencode/skills/` 配下 .md ファイルに対する japanese-tech-writing（skill 適用サブセット: 整形・LLM 表現禁止・冗長排除・論証の厳密さ・用語政策）および document-type-responsibilities.md（配置基準・用語政策）の逸脱を抽出したカタログ。個別修正は後続 Issue で扱う（本カタログは見える化が目的）。遡及準拠の範囲は REQ-0140-026 に基づく。

> **ファイル数に関する注記**: Issue #1042 本文は「76 ファイル」と記載するが、実際の `.md` ファイル数は **75 ファイル**（SKILL.md 27 + references/*.md 42 + templates/*.md 6）。本カタログは実ファイル数 75 で査読した。Issue 本文の修正は別途 case-update 等で扱う。

## 対象範囲

75 ファイル。内訳:

- `agentdev-*/SKILL.md`（27 ファイル）: 各スキルのエントリポイント
- `agentdev-*/references/*.md`（42 ファイル）: 段階的開示の詳細参照資料
- `agentdev-*/templates/*.md`（6 ファイル）: スキル固有のテンプレート

AG-007 で `agentdev-doc-writing/` 配下（SKILL.md・references/*）は更新済みのため、最新状態で査読対象とした。

## 適用サブセット

skill 適用サブセット（整形・LLM 表現禁止・冗長排除・論証の厳密さ・用語政策）。演出は非適用。

## 検出事項

### F-001（high）: 複数文を 1 行に併記（パターン）

- **対象**: 広範（20+ ファイル）。例: `agentdev-workflow-templates/SKILL.md` L17-19 / `agentdev-doc-writing/SKILL.md` L10 / `agentdev-learning-pipeline/SKILL.md` L21-27 / `agentdev-issue-management/SKILL.md` L8 / `agentdev-req-analysis/SKILL.md` / `agentdev-workflow-orchestration/SKILL.md` 他
- **該当規範**: 整形（一文一行）
- **現状例**:
  - `agentdev-doc-writing/SKILL.md` L10: 「書かれた文書の品質を静的査読し、読者が判断・実行できる文書へ修正提案を提示する。対象は `docs/` 配下の REQ/ADR/SPEC/guides/DOC-MAP/README、および docs を生成・編集する command/skill の自然言語記述である。」（2 文が 1 行）
  - `agentdev-workflow-templates/SKILL.md` L17-19: USE FOR 箇条書き内で複数文を 1 行に併記
- **改善方向**: 文ごとに改行する。SKILL.md の目的節・USE FOR 節は特に読者が注目するため、1 文 1 行を厳格に適用する。パターン単位で機械的修正可能。

### F-002（high）: 中黒（・）による日本語並列（パターン）

- **対象**: 広範。例: `agentdev-workflow-templates/SKILL.md` L60 / `agentdev-req-file-manager/SKILL.md` L72 / `agentdev-learning-pipeline/SKILL.md` / `agentdev-adr-file-manager/SKILL.md` / `agentdev-git-worktree/references/git-common-procedures.md` 他多数
- **該当規範**: 整形（中黒を日本語の並列で使わない。ただし単一の固有名詞の内部では使ってよい）
- **現状例**:
  - `agentdev-workflow-templates/SKILL.md` L60: 「実装内容**・**テスト結果の概要」
  - `agentdev-req-file-manager/SKILL.md` L72: 「理由**・**移行先**・**非吸収宣言」
- **改善方向**: 日本語並列には読点（、）またはスラッシュ／箇条書きを使用する。識別子やコード値の並列も地の文としては中黒を避ける方針。リポジトリ全体方針として横断 Issue で扱うことを推奨。

### F-003（med）: 空虚な動詞「掘り下げる」「深掘りする」「言及する」（パターン）

- **対象**: `agentdev-learning-pipeline/SKILL.md` L226 / `agentdev-req-analysis/SKILL.md` L205 / `agentdev-doc-writing/SKILL.md` L77 / `agentdev-req-file-manager/SKILL.md` 他
- **該当規範**: LLM 表現禁止（空虚な動詞）
- **現状例**:
  - `agentdev-learning-pipeline/SKILL.md` L226: 「要件を**掘り下げ**、文脈を明らかにする」
  - `agentdoc-writing/SKILL.md` L77: 「ユーザーへ**触れる**」
- **改善方向**: 何をどうするかを具体的に書く。「掘り下げる」→「分析する」「検討する」「詳細に検討する」、「触れる」→「伝える」「通知する」。

### F-004（med）: 空虚な形容・強調「非常に」「極めて」「最も」（パターン）

- **対象**: `agentdev-adr-guidelines/SKILL.md` L12 / `agentdev-quality-gates/references/common-gate-contract.md` L8 / `agentdev-skill-authoring/SKILL.md` L40 他
- **該当規範**: LLM 表現禁止（弱い緩和と称賛・空虚な形容）
- **現状例**:
  - `agentdev-adr-guidelines/SKILL.md` L12: 「**非常に**重要な判断」
  - `agentdev-quality-gates/references/common-gate-contract.md` L8: 「**極めて**重要」
  - `agentdev-skill-authoring/SKILL.md` L40: 「**最も**効果的なプロセス」
- **改善方向**: 中身のない強調を削る。「非常に」「極めて」を外し、重要性の根拠（影響度・判定基準）を本文で示す。「最も効果的」は具体的な効果指標に置き換える。

### F-005（med）: LLM 表現「包括的」「不可欠」等の空虚な形容（パターン）

- **対象**: `agentdev-req-analysis/SKILL.md` / `agentdev-quality-gates/SKILL.md` / `agentdoc-writing/SKILL.md` 他
- **該当規範**: LLM 表現禁止（空虚な形容「不可欠」「核心的」「鍵となる」「根本的な」「多角的」「包括的」「総合的」）
- **現状例**: スキルの目的節・概要節で「包括的な」「不可欠な」等の修飾が見られる（具体的対象ファイルの特定は個別修正 Issue で実施）。
- **改善方向**: 主張の中身を説明せず強調する語を使わない。何がどう不可欠かを本文で示す。

### F-006（med）: 冗長・再記述（概要節と DO NOT USE FOR 節の重複等）

- **対象**: `agentdev-workflow-orchestration/SKILL.md` L8-12 / `agentdev-quality-gates/SKILL.md` L8-15 他
- **該当規範**: 冗長の排除（同じ主張を言い換えて繰り返さない）
- **現状例**:
  - `agentdev-workflow-orchestration/SKILL.md` L8-12: 概要節で「case-run は単一 Issue または単一 Wave を処理する」と述べた内容が、後続の「状態機械」「適用範囲」節で再記述される。
  - `agentdev-quality-gates/SKILL.md` L8-15: 概要節で「本スキルは参照専用」と述べた内容が「DO NOT USE FOR」節で再掲される。
- **改善方向**: 概要節と機能節の役割分担を明確にする。概要は入口、各機能節は新情報を追加する形式に統一する。

### F-007（low）: 接続の型「〜において」「〜の観点から」（パターン）

- **対象**: `agentdev-workflow-lifecycle/SKILL.md` L23 / `agentdev-intake-pipeline/SKILL.md` L28 / `agentdev-inspect-skills/SKILL.md` L30 / `agentdev-req-analysis/SKILL.md` / `agentdev-quality-gates/SKILL.md` 他
- **該当規範**: LLM 表現禁止（接続の型）
- **現状例**: 本文中で「〜において」「〜の観点から」が新情報なしに使われるケースが散見。
- **改善方向**: 「〜において」→「〜で」または直接表現に置き換える。見出しの名詞句（「USE FOR 照合」等）自体は許容範囲だが、本文中の接続の型は直接的表現に直す。

### F-008（low）: 用語政策・英語カタカナ語の混在

- **対象**: `agentdev-learning-pipeline/SKILL.md` L86, L241 / `agentdev-req-analysis/SKILL.md` L29 / `agentdev-quality-gates/SKILL.md` L26 他
- **該当規範**: 用語政策（document-type-responsibilities.md）
- **現状例**:
  - `agentdev-learning-pipeline/SKILL.md` L241: 「staging 領域」（document-type-responsibilities.md の複合技術語訳し方指針に照らすと「一時領域」等が自然）
  - `agentdev-quality-gates/SKILL.md` L26: 「evidence-first 原則」（許容リストになく、訳出「証拠優先原則」が自然）
- **改善方向**: document-type-responsibilities.md の「複合技術語の訳し方指針」「専門カタカナ語の日本語訳」に従う。許容語（スキーマ・ライフサイクル・カタログ・パイプライン・ジャンクション）はそのまま。

### F-009（info）: Issue 本文のファイル数記載差異

- **対象**: Issue #1042 本文「76 件」
- **該当規範**: （参考記録・規範逸脱ではない）
- **現状**: Issue 本文は「76 ファイル・agentdev-* スキルの SKILL.md + references/*」と記載するが、実際の `.md` ファイル数は **75 ファイル**（SKILL.md 27 + references/*.md 42 + templates/*.md 6）。
- **改善方向**: （本カタログでは実ファイル数 75 で査読対象とした。Issue 本文の「76」→「75」修正は case-update 等で扱う）

### F-010（info）: スキル全体の規範準拠度（参考記録）

- **対象**: 75 ファイル全体
- **該当規範**: （参考記録・逸脱ではない）
- **現状**: skill 系は AG-007 で `agentdev-doc-writing/` が一度整理されているが、他スキルは未整理のため F-001（複数文 1 行）等の整形系逸脱が広範に残る。論証の厳密さ・論旨の正確性については顕著な問題なし。
- **改善方向**: （対応不要。検出事項の見える化が目的なため準拠状況も記録する）

## 対象外

- 演出関連の規範は skill 適用サブセット外のため検出対象外。
- パラグラフライティングは skill 適用サブセットに含まれない（論証の厳密さのみ適用）。
- 各スキルの SKILL.md と command との参照妥当性（USE FOR 照合・`load_skills` 指定の正しさ）は inspect-skills で扱う。
- references/* の内部構造依存（command が references 内部の見出しを参照しているか）は inspect-skills で扱う。
- テンプレート変数（`{{...}}`）展開後の文書品質は、テンプレート利用時に別途評価するべきで本カタログの対象外。

## 後続 route 候補

- F-001, F-002（整形系パターン）: 機械的修正可能なため、一括変換スクリプト等で対処する一括整形 Issue を推奨。全 75 ファイルに影響。
- F-003, F-004, F-005（LLM 表現系）: 1 Issue で「src/opencode/skills/ LLM 表現禁止の整形」としてまとめて扱う。ファイル単位で優先度判定が必要。
- F-006（冗長）: 概要節と機能節の役割分担方針を決めてから個別対応。スキルオーサリング基準（`agentdev-skill-authoring`）の更新案も併走させる価値あり。
- F-007, F-008（接続の型・用語）: 軽微なため 1 Issue にまとめて対応可能。
- F-009: case-update 等で Issue #1042 本文のファイル数（76→75）を修正する。
