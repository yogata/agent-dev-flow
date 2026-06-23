# 文書品質機械的置換ルールの skill references 明文化

## 観測

Wave 2 の4 OU（中黒 #1078・em-dash #1076・LLM表現 #1079・一文一行 #1080）で機械的テキスト置換を実施した。各 PR の Findings で、機械判定ルールの明文化が今後の類似作業の再現性を向上させると指摘されている。

## 内容

以下の機械判定ルールを `agentdev-doc-writing` skill references に明文化する候補:

1. **中黒許容範囲判定** (PR #1088): 「SPEC 明示例 + 時系列対比ペア（X時・Y時）+ code block + YAML title」の組合せで機械判定可能
2. **em-dash 置換判定** (PR #1089): ` — ` パターン検出で大部分をカバー。テーブルセル N/A プレースホルダ（`| — |`）は `| - |` への置換が自然
3. **LLM 表現機械判定** (PR #1090): 「において→で」「非常に→削除」等の表層形式で大部分をカバー。文脈判断が必要な「最も」「重要な」等はサンプリング査読で対応
4. **一文一行機械判定** (PR #1091): 複数 `。` を含む prose line の改行分割で大部分をカバー。括弧（`（）`）内の `。` を除くことで文境界を正確に判定可能

## 出典

- PR #1088 (Issue #1078 OU-001 中黒): Findings / Capture候補
- PR #1089 (Issue #1076 OU-002 em-dash): Findings / Capture候補
- PR #1090 (Issue #1079 OU-003 LLM表現): Findings / Capture候補
- PR #1091 (Issue #1080 OU-004 一文一行): Findings / Capture候補
- Epic #1075 (REQ-0140-026 文書品質準拠の包括的修正)

## 想定作業

`src/opencode/skills/agentdev-doc-writing/references/` に機械判定ルール参照ファイルを新規作成、または既存の `llm-expression-patterns.md` を拡張して中黒・em-dash・一文一行の機械判定ルールを集約する。

## 優先度

中。既存の SPEC（document-type-responsibilities.md 用語政策節）に人間向けの判定基準はあるが、機械適用向けのアルゴリズム的記述がない。今後の inspect-docs 自動検出や CI での機械的検証に有効。
