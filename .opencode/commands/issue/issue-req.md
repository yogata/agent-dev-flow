---
description: 要件を整理・定義する（機能追加・バグ修正共通）
load_skills:
  - req-analysis
  - decision-log
  - adr-guidelines
  - issue-guide
---

# 要件定義

機能追加またはバグ修正の要件を整理・定義します。①バイブス壁打ちフェーズで使用。

## Input

- ユーザーの自然言語による機能追加/バグ修正の説明
- GitHub Issue URL（既存Issueの場合）
- エラーログ（バグ修正の場合）

## Output

- Issue本文（要件doc埋め込み、チェックボックス付き受け入れ基準）
- `decisions/DEC-XXX-*.md`（壁打ちで決定した技術判断、発生した場合のみ）

## Steps

1. ユーザーとの壁打ち対話を開始 → `req-analysis` の壁打ちメソドロジーに従って深掘り
2. 機能要件/非機能要件を展開 → `req-analysis` の分析観点に従って網羅
3. 技術判断が発生した場合 → `decision-log` に従って決定エントリを作成（ADR閾値以上なら `adr-guidelines` にブリッジ）
4. Issue本文を要件doc形式で生成 → テンプレート: `templates/doc_requirement.md`
5. 完了報告 → `issue-guide` の完了報告フォーマットに従って出力

## Guardrails

- バイブスフェーズのみ（実装コード禁止）
- チェックボックスは測定可能で一意であること → `req-analysis` のチェックボックス品質基準
- ADR閾値以上の判断は `adr-guidelines` へ
- 出力先: `$1` 引数で指定（デフォルトなし）
