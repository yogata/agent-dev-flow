---
description: 要件を整理・定義する（機能追加・バグ修正共通）
agent: sisyphus
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
- `docs/requirements/REQ-{NNNN}-{slug}.md`（パターンBの場合のみ）

## Steps

1. ユーザーとの壁打ち対話を開始 → `req-analysis` の壁打ちメソッドロジーに従って深掘り
2. 機能要件/非機能要件を展開 → `req-analysis` の分析観点に従って網羅
3. ADR閾値以上の技術判断が発生した場合 → `adr-guidelines` に従ってADRを作成
4. Issue本文を要件doc形式で生成 → テンプレート: `.opencode/commands/issue/templates/doc_requirement.md` を Read tool で読み込む
5. パターンに応じたREQファイル処理:
   - **パターンB（機能追加）**: `req-file-manager` スキルの判定ロジックでREQファイル保存モードを決定:
     - **新規要件 → CREATE**: テンプレート適用、最大REQ番号+1で採番、`docs/requirements/REQ-{NNNN}-{slug}.md` に保存、`README.md` インデックス更新
     - **既存要件への追加 → APPEND**: 既存REQファイルに追記、frontmatter updated更新
     - **既存要件の修正 → UPDATE**: 既存REQファイルの該当セクション更新、frontmatter updated更新
   - **パターンA（バグ修正・軽微変更）**: REQファイルを作成せず、Issue本文のみで要件を管理する
6. docs変更の整合性検証（パターンBの場合）→ REQ番号の連続性確認、frontmatterの`id`とファイル名の一致を確認
7. 承認ゲート: REQ内容（パターンB）またはIssue本文（パターンA）をユーザーに提示し、承認を求める
   - **承認**: 次のステップへ進む
   - **差し戻し**: 壁打ちを継続（Step 1に戻る）
8. 変更範囲検証（パターンBの場合）: `git diff --name-only` で変更ファイル一覧を取得し、`docs/` 以外の変更が含まれていれば即座に取り消し（`git checkout -- <file>`）、ユーザーに警告を表示
9. docs変更をコミット・プッシュ（パターンBの場合）→ `conventional-commits` に従ってコミットメッセージを生成し、mainブランチにpush
10. 完了報告 → `issue-guide` の完了報告フォーマットに従って出力（壁打ち結論ハイライトの表示を必ず含めること）

## Guardrails

- バイブスフェーズのみ（実装コード禁止）
- **ファイル編集スコープ**: 以下のパスのみ作成・編集を許可:
  - `docs/requirements/**`（REQファイル）
  - `docs/adr/**`（ADR）
  - `docs/README.md`（ドキュメントハブ）
- **上記以外のファイル作成・編集は禁止**（ソースコード、コマンドファイル、スキルファイル、設定ファイル等すべて）
- チェックボックスは測定可能で一意であること → `req-analysis` のチェックボックス品質基準
- ADR閾値以上の判断は `adr-guidelines` へ
- REQ番号は連番・一意であること（空き番号の再利用禁止）
- サブエージェントの最終出力はverbatimで出力する（再フォーマット禁止）
