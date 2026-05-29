# case実行信頼性向上（チェックボックス確認・pull前チェック・docs整合性grep）

## 背景

case-run/case-close の実行プロセスで、外部副作用を伴う操作（GitHub API呼び出し、git pull）の信頼性不足と、実装とドキュメントの整合性確認の自動化が不十分なため、3件の品質問題が発生した。

## 問題

以下の3つの品質問題が case-run/case-close の実行信頼性に関連して発生:

1. **チェックボックス更新未実行**（未分類1, 25/40）: case-run Step 7 で `gh issue edit` が実際には実行されず、todo のみ completed にマークされた
2. **git pull失敗・ローカル変更残存**（未分類2, 24/40）: case-close Step 8b で `git pull --ff-only` がローカル変更と競合して失敗。事前チェックなし
3. **docs/specs/system.md旧仕様の矛盾**（未分類6, 27/40）: case-close で検出されたが、case-run 段階での予防仕組みがない

## 望ましい変更

1. **case-run Step 7**: チェックボックス更新時、`gh issue edit --body-file` の実行結果を確認してから completed にマークする。todo マークと API 呼び出しを同一ツール呼び出しブロック内で実行
2. **case-close Step 8b**: `git pull --ff-only` 実行前に `git status --porcelain` でローカル変更を確認し、変更がある場合は `git checkout --` で該当ファイルをリセットしてから pull を実行
3. **case-run Step 6**: 実装完了後、変更対象のキーワードを `docs/specs/` で grep し、矛盾する記述がないか自動確認するステップを追加

## 対象範囲

### 対象

- `.opencode/commands/agentdev/case-run.md` Step 7（完了報告・チェックボックス更新）
- `.opencode/commands/agentdev/case-close.md` Step 8b（実行前同期・git pull）
- `.opencode/commands/agentdev/case-run.md` Step 6（実装完了後の検証）

### 対象外

- case-open（Issue作成は対象外）
- learning-refine/learning-promote（学習パイプラインは対象外）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| command | `.opencode/commands/agentdev/case-run.md` | Step 7 にAPI呼び出し結果確認の必須化を追加 |
| command | `.opencode/commands/agentdev/case-close.md` | Step 8b にpull前のローカル変更確認・リセットを追加 |
| command | `.opencode/commands/agentdev/case-run.md` | Step 6 にdocs/specs/キーワードgrep自動確認を追加 |

## 既存対策確認

- **確認結果**: 既存対策あり（fix gap）
- **該当ファイル**: `.opencode/commands/agentdev/case-run.md`, `.opencode/commands/agentdev/case-close.md`
- **ギャップ分類**: fix gap
- **ギャップ詳細**:
  - case-run Step 7: 完了判定あり、API呼び出し結果確認の必須化なし
  - case-close Step 8b: pull失敗検知・ユーザーガイドあり、ローカル変更事前チェックなし
  - case-close: 関連ドキュメント整合性検証あり、case-run段階でのキーワードgrep自動化なし

## 制約

- チェックボックス更新: 既存の完了報告フォーマットを維持
- pull前チェック: ユーザー確認なしにローカル変更をリセット可能（PR削除ファイルのみ対象）
- docs grep: 実装キーワードの自動抽出は PR diff から行う

## 受け入れ条件

- [ ] case-run Step 7 で `gh issue edit` の実行結果確認が必須化されている
- [ ] case-close Step 8b に pull 前の `git status --porcelain` 確認が追加されている
- [ ] case-run に docs/specs/ のキーワードgrep自動確認ステップが追加されている
- [ ] 既存の完了報告・エラー処理フォーマットが維持されている

## 元learning item / 根拠

- **要約**: case実行プロセスの外部副作用操作とdocs整合性確認の信頼性不足
- **根拠**: チェックボックス未更新（Issue #787）、pull失敗（PR #788）、docs矛盾（Issue #815, REQ-0030）の3事象
- **再発条件**: 複数Step連続完了マーク時・PR削除ファイルのローカル変更残存時・新機能追加時
- **横展開可能性**: 外部副作用を伴うStep全般と新機能追加時に汎用的に発生し得る

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: enhancement, reliability
- **関連Issue**: Issue #787, PR #788, Issue #815, REQ-0030
