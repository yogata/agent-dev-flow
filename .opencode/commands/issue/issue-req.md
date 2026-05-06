---
description: 要件を整理・定義する（機能追加・バグ修正共通）
load_skills:
  - req-analysis
  - adr-guidelines
  - issue-guide
  - req-file-manager
---

# 要件定義

機能追加またはバグ修正の要件を整理・定義します。①バイブス壁打ちフェーズで使用。

## Input

- ユーザーの自然言語による機能追加/バグ修正の説明
- GitHub Issue URL（既存Issueの場合）
- エラーログ（バグ修正の場合）

## Output

- Issue本文（要件doc埋め込み、チェックボックス付き受け入れ基準）
- `docs/requirements/REQ-{NNNN}.md`（要件定義の個別ファイル）

## Steps

1. ユーザーとの壁打ち対話を開始 → `req-analysis` の壁打ちメソッドロジーに従って深掘り
2. 機能要件/非機能要件を展開 → `req-analysis` の分析観点に従って網羅
3. ADR閾値以上の技術判断が発生した場合 → `adr-guidelines` に従ってADRを作成
4. Issue本文を要件doc形式で生成 → テンプレート: @.opencode/commands/issue/templates/doc_requirement.md
5. `req-file-manager` スキルの判定ロジックでREQファイル保存モードを決定:
   - **新規要件 → CREATE**: テンプレート適用、最大REQ番号+1で採番、`docs/requirements/REQ-{NNNN}.md` に保存、`README.md` インデックス更新
   - **既存要件への追加 → APPEND**: 既存REQファイルに追記、frontmatter updated更新
   - **既存要件の修正 → UPDATE**: 既存REQファイルの該当セクション更新、frontmatter updated更新
6. 完了報告 → `issue-guide` の完了報告フォーマットに従って出力

## Guardrails

- バイブスフェーズのみ（実装コード禁止）
- チェックボックスは測定可能で一意であること → `req-analysis` のチェックボックス品質基準
- ADR閾値以上の判断は `adr-guidelines` へ
- REQ番号は連番・一意であること（空き番号の再利用禁止）
