---
description: 要件を整理・定義する（機能追加・バグ修正共通）
agent: prometheus
load_skills:
  - req-analysis
  - adr-guidelines
  - issue-guide-phases
  - issue-guide-reports
---

# 要件定義

機能追加またはバグ修正の要件を整理・定義します。①バイブス壁打ちフェーズで使用。

## Input

- ユーザーの自然言語による機能追加/バグ修正の説明
- GitHub Issue URL（既存Issueの場合）
- エラーログ（バグ修正の場合）

## Output

- `.sisyphus/drafts/req-draft-{topic-slug}.md`（パターンBの場合のみ）
- セッション内要件doc（パターンAの場合）

## Steps

1. ユーザーとの壁打ち対話を開始 → `req-analysis` の壁打ちメソッドロジーに従って深掘り
2. 機能要件/非機能要件を展開 → `req-analysis` の分析観点に従って網羅
3. ADR閾値以上の技術判断が発生した場合 → `adr-guidelines` に従ってADR判断を記録（ADRファイルの作成は issue-save-req で実行）
4. 要件doc形式で生成 → テンプレート: `.opencode/commands/issue/templates/doc_requirement.md` を Read tool で読み込み、内容を構造化
5. パターン判定とドラフト保存:
    - **パターンB（機能追加）**: `.sisyphus/drafts/req-draft-{topic-slug}.md` にドラフトを保存。ドラフトは doc_requirement.md テンプレート構造に以下のメタデータセクションを追加:
      ```markdown
      ## draft-meta（issue-save-req 用）

      - **pattern**: B
      - **req-operation**: CREATE | APPEND | UPDATE
      - **target-req**: REQ-{NNNN}（APPEND/UPDATE の場合）
      - **adr-required**: true | false
      - **adr-decisions**: [{title, context, decision, status}]（adr-required が true の場合）
      - **topic-slug**: {ファイル名に使用するスラッグ}
      ```
    - **パターンA（バグ修正・軽微変更）**: ドラフト保存不要。セッション内で要件docを完結させる
6. 承認ゲート: 生成した要件doc（パターンB: ドラフト内容、パターンA: セッション内要件doc）をユーザーに提示し、承認を求める
    - **承認**: 次のステップへ進む
    - **差し戻し**: 壁打ちを継続（Step 1に戻る）
7. 完了報告 → `issue-guide-reports` の完了報告フォーマットに従って出力（壁打ち結論ハイライトの表示を必ず含めること）:
    - パターンB: `次のステップ: /issue/issue-save-req`
    - パターンA: `次のステップ: /issue/issue-create`

## Guardrails

- バイブスフェーズのみ（実装コード禁止）
- **ファイル編集スコープ**: `.sisyphus/drafts/**` のみ作成・編集を許可
- **docs/ 配下のファイルは一切参照・書き込みしない**
- **git コマンドは実行しない**
- チェックボックスは測定可能で一意であること → `req-analysis` のチェックボックス品質基準
- ADR閾値以上の判断は `adr-guidelines` へ（判断の記録のみ、ファイル作成は不可）
- サブエージェントの最終出力はverbatimで出力する（再フォーマット禁止）
- Pattern分岐の判定基準と固有ルールは `issue-guide-phases` → Pattern Registry を参照
