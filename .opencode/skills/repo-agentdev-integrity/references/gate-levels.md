# Integrity Check Gate Levels

integrity-check の検出結果を3水準に分類し、それぞれの意味と対応方針を定義する。

## 水準定義

| 水準 | finding_level | 意味 | 対応方針 |
|------|--------------|------|----------|
| **strict** | `strict` | 機械検証可能な不整合。即時修正が必要 | NG として扱い、exit code 1 で終了 |
| **heuristic** | `heuristic` | 意味判断を含むが明確な根拠を持つ推奨修正 | Warning として扱い、exit code 0 で終了 |
| **observation** | `observation` | 参考情報。標準レポートの主 finding や NG カウントに含めない | Info として扱い、exit code 0 で終了 |

## strict（即時修正）

機械的・再現可能な検査。存在・参照・frontmatter・index・registry・path の不整合。

### 対象カテゴリ

| チェックカテゴリ | 検出内容 | 根拠 REQ |
|-----------------|---------|---------|
| `frontmatter-filename` | REQ/SKILL frontmatter id ≠ filename | REQ-0108 |
| `required-fields` | REQ 必須 frontmatter 欠落 | REQ-0108 |
| `readme-index-sync` | REQ/ADR README と実体の不一致 | REQ-0108-003 |
| `broken-file-link` | リンク先ファイルが存在しない | REQ-0108-013 |
| `broken-req-ref` | REQ-NNNN 参照先が存在しない | REQ-0108-013 |
| `broken-adr-ref` | ADR-NNNN 参照先が存在しない | REQ-0108-013 |
| `active-retired-duplication` | active/retired 間 ID 重複 | REQ-0108-015 |
| `retired-in-active-index` | retired REQ が active index に混入 | REQ-0108-015 |
| `legacy-namespace` | 旧コマンド名・旧パスの残存 | REQ-0108-016 |
| `bare-slash-scoped` | bare slash form の使用 | REQ-0108-076 |
| `implementation-pattern` | 禁止 frontmatter フィールド | REQ-0108-095~097 |
| `obsolete-reference-dir` | `reference/` の残存 | REQ-0108-039 |
| `reference-path-existence` | 参照パスが存在しない | REQ-0108-115 |
| `retired-frontmatter` | retired REQ frontmatter 不備 | REQ-0108-080~082 |
| `mapping-table-*` | mapping-table 整合性 | REQ-0108-083~088 |
| `variant-path-existence` | variant パスが存在しない | REQ-0108-089 |
| `variant-registry-registered` | command が registry に未登録 | REQ-0108-090 |
| `adr-status-normalization` | 旧 ADR status 形式 | REQ-0108-121 |
| `ruid-ground-reference` | docs 内の RU-ID 参照 | REQ-0108-122 |
| `workflow-status-prohibition` | REQ/SPEC 内の workflow status | REQ-0108-123 |
| `pattern-residual` | Pattern A/B/C/D 残存 | REQ-0108-111 |
| `req-backlog-residual` | req-backlog 言及の残存 | REQ-0108-112 |
| `abolished-skill-reference` | 廃止済み skill への参照 | REQ-0108-126 |
| `req-range-staleness` | REQ 範囲表記の陳腐化 | INC-0027 |
| `broken-junction` | broken junction / symlink の検出 | REQ-0108-173 |
| `skill-category-gap` | SKILL.md カテゴリとスクリプト実装の不一致 | REQ-0108-171 |
| `template-path-integrity` | コマンドの template 参照先不存在 | REQ-0108-165 |
| `capture-boundaries-existence` | capture-boundaries.md 不在 | REQ-0105-075 |
| `pr-template-capture-section` | PR template セクション名不備・旧名称残存 | REQ-0105-077 |
| `command-capture-duty` | コマンド capture 責務記述欠落 | REQ-0105-078~082 |

## heuristic（推奨修正）

意味判断を含むが明確な根拠を持つ検査。意味的レビューが必要な場合は `/agentdev/docs-review` へ route する。

### Finding route

| finding レベル | 代表例 | route 先 |
|---------------|--------|---------|
| heuristic | retired REQ 現行参照、語彙レジストリ違反 | → `/agentdev/docs-review`（意味レビュー） |
| observation | ADR 技術判断不在、文書種別不一致 | → `/agentdev/docs-review`（意味レビュー） |

### 対象カテゴリ

| チェックカテゴリ | 検出内容 | 根拠 REQ |
|-----------------|---------|---------|
| `retired-req-as-current` | retired REQ の現行要件参照 | REQ-0108-004 |
| `retired-req-primary-ref` | retired REQ の一次参照 | REQ-0108-015 |
| `docmap-requirements` | DOC-MAP の要件代替疑い | REQ-0108-014 |
| `guide-req-table` | guide 内の要件表 | REQ-0108-014 |
| `cmd-deprecated-in-inventory` | 廃止コマンドが README に残存 | REQ-0108-099 |
| `accepted-adr-only-citation` | 非 accepted ADR の引用 | REQ-0108-125 |
| `post-completion-output` | 完了後の出力指示 | REQ-0108 |
| `old-terminology` | 旧用語の使用 | REQ-0108 |
| `vocabulary-compliance` | 語彙レジストリ違反 | 本ドキュメント |

## observation（参考情報）

参考情報であり、対応は任意。

### 対象カテゴリ

| チェックカテゴリ | 検出内容 | 根拠 |
|-----------------|---------|------|
| `skill-prefix` | agentdev- 以外のスキル名 | 命名規則 |
| `spec-readme-index` | SPEC README との同期 | 索引整合性 |
| `req-retired-index` | retired 導線の存在確認 | 索引整合性 |
| `expanded-readme-sync` | root README / system.md の記載漏れ | REQ-0108-078 |
| `skill-use-for-boundary` | USE FOR / DO NOT USE FOR の有無 | REQ-0108-093 |

## False Positive 扱い

### 定義

False positive（偽陽性）は、integrity-check が NG/Warning として報告した finding が、実際には正当な記述である場合を指す。

### 既知の false positive パターン

| パターン | 対象 | 原因 | 扱い |
|----------|------|------|------|
| `workflow-status-prohibition` の禁止文検出 | `patterns.md:53` | 「status フィールドは持たない」という禁止文自体が status + フィールド名を含む | 検出パターンの negative context 追加で対応（INC-0021） |
| `retired-req-as-current` の ADR 履歴参照 | ADR-0003, ADR-0009 等 | accepted ADR が廃止経緯として retired REQ を引用 | mapping-table 同様の除外コンテキスト追加を検討（INC-0016） |
| `legacy-namespace` の self-describing list | vocabulary-registry.md | 検出語彙リスト自体が旧語彙を列挙 | vocabulary-registry.md を exempt に設定（REQ-0108-174） |
| `bare-slash-scoped` の template path | completion-reports path | variant path 内のコマンド名に `/cmd-name` が含まれる | path exemption で除外済み |
| `workflow-status-prohibition` の自己参照 | REQ-0108-123 | 検出ルール自体が 6 マイクロフェーズ名を含む | 自己参照免除条項で対応済み（INC-0020） |
| inline code block 内の旧語彙 | 全スキル/command ファイル | バッククォート内の言及は参照であり使用ではない | inline code strip で除外（REQ-0108-174） |

### False positive 対応フロー

1. **検出**: integrity-check の finding を確認
2. **分類**: finding が false positive か true positive かを判定
3. **false positive の場合**:
   - (a) 検出パターンの除外ルールを追加（negative context、exempt path、exempt file）
   - (b) 除外ルールの追加には regression test を含める（REQ-0108-055, 106）
   - (c) 除外ルールだけでは対応できない場合は、該当文の記述を修正（禁止文の言い換え等）
4. **true positive の場合**: 該当箇所を修正

### 不可対応

- finding を「既知の false positive」として無視する運用は認めない
- 全ての finding は修正または除外ルールの追加で対応すること
