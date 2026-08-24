# 共通ポリシー意味識別子 registry

ガードレール識別体系における共通ポリシー意味識別子（`POL-*`）の定義一覧。
正規の規約は `authoring/command-file-format` Design「ガードレール識別体系」が所有し、本参照は定義の実体を保持する。

## 識別子の様式と付与条件

- 識別子は `POL-` 接頭辞 + kebab-case（小文字英数字とハイフン）とする
- 識別子は意味に基づく安定した名前とし、位置依存の連番も旧 Gxx 番号との一対一変換も用いない
- 複数箇所から参照、検査または強制される共通ポリシーのみが識別子を持つ。Command 固有で横断参照を必要としない利用者向け境界には識別子を付与しない
- 定義は本 registry に `- **POL-xxx**: 説明` 形式で1回のみ記述する（重複定義は docs-check が検出する）
- 配布物（command、skill、template）から参照する際は `` `POL-xxx` `` のコードスパンで記述する（未定義参照は docs-check が検出する）

## 定義一覧

- **POL-gh-io-delegation**: GitHub Issue/PR の読み書きは Custom Tool `agentdev_gh` の操作契約へ委譲する。command/ skill 本文に gh コマンドの直接実行手順を記述せず、gh WRITE 直接実行は agentdev-gh-write-guard（Plugin/Hook）が拒否する。gh CLI 出力の読み取りも Tool の読み取り操作経由を正とする
- **POL-destructive-change-explicit-approval**: 破壊的変更（inbox 全体強制クリア、大量エントリ一括削除、矛盾解消、要件仕様スコープ変更等）は、通常の判定・分類の承認とは別系統の明示承認を要求する。自律確定や自動進行によってこの承認を迂回しない
- **POL-promoted-artifact-requires-approval**: ユーザーの明示的な承認なしに採用済み成果物（promoted artifact）を生成しない。詳細判定表（横断契約Design 参照）に従い自律確定条件が満たされたと根拠から一意に確定できる対象のみ、承認なしの生成を許容する
- **POL-completion-checkbox-single-writer**: Issue 完了条件チェックボックスの評価・更新は case-close QG-4 の専任責務である。case-run、実行担当サブエージェント、その他のコマンドは完了条件チェックボックスを更新しない
- **POL-worktree-isolation**: case 実行中のファイル編集は case-run から引き渡された worktree root（`.worktrees/{N}-{type}/`）配下に限定する。メインリポジトリや他 worktree のパスを編集しない
- **POL-epic-tracking-single-writer**: 親 Epic Issue 本文のステータス追跡テーブルの書き込みは case-close の単一書き手に限定する。case-run は読み取りのみ、case-auto は Wave 反復制御のみを行い、直接書き込まない

## See Also

- **agentdev-skill-authoring**: Skill 品質基準
- **command-file-format Design（authoring/）**: ガードレール識別体系の正規規約
