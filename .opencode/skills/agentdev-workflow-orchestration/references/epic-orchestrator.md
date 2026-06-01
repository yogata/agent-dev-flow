# Epic Orchestrator モード

Epic Issue を入力とした場合の Orchestrator 実行モード。Epic 本文の Wave テーブルを実行順序 SSoT として読み取り、子 Issue を subagent に渡して実行する（REQ-0106, ADR-0006）。

## Epic検出ルール

| 条件 | 結果 |
|------|------|
| Issue に `epic` ラベルが付与されている | Epic Orchestrator モード |
| Issue 本文に `## 実行順序` セクションがあり、`Wave` 列を持つ Markdown テーブルが存在する | Epic Orchestrator モード |
| 上記いずれにも該当しない | 既存の単一 Issue または多重 Issue モード |

## Wave解析プロトコル

1. Epic Issue 本文の `## 実行順序` セクションを特定
2. Wave テーブルを抽出: 列構成 `Wave / Issue / 実行方法 / 前提`
3. Wave 番号でグルーピングし、各 Wave に属する子 Issue を抽出
4. バリデーション:
   - 前提列に記載された Wave より前に後続 Wave の Issue を実行してはならない（REQ-0106）
   - Epic Wave分割上限: 1 Wave内の同時実行子Issue上限は5件（REQ-0106）。超過時はWaveを分割
   - 依存関係分析で安全側の直列化が必要と判断した場合はWaveをさらに分割してよい

## Epic Orchestrator 実行フロー

1. **Epic 本文読み取り**: `gh issue view {epic_N}` で Epic Issue 本文を取得
2. **Wave テーブル解析**: Wave解析プロトコルに従い子 Issue を抽出
3. **Wave 順次実行**（Wave 番号昇順）:
   a. **Epic ステータス一括更新**: 該当 Wave 内の全子 Issue の Epic ステータスを `☐ 未着手` → `🔄 進行中` に一括更新（親エージェント責務、`agentdev-epic-tracker` 準拠）
   b. **subagent 起動**: 各子 Issue についてサブエージェント実行プロトコルに従い subagent を起動
   c. **Wave 完了待機**: `background_output` で同一 Wave 内の全 subagent 完了を待機
   d. **結果集約**: 子 Issue ごとに成功/失敗を判定
   e. **Wave完了後ステータス一括更新**: 成功した子 Issue は `🔄 進行中` → `✅ 完了` に更新。失敗した子 Issue は `🔄 進行中` を維持。親エージェントが単一 API 呼び出しで一括実行
   f. **Wave間 rebase**: 次の Wave 開始前に `git rebase origin/main` を各子 Issue の worktree ブランチに対して実行。rebase 衝突時は中止してユーザーに報告（自動解決禁止）
   g. **後続 Wave 制御**: 失敗影響を評価し後続 Wave の実行可否を判定
4. **全 Wave 完了後**: specs 更新（親エージェントのみ、直列実行）→ Epic Orchestrator 集約完了報告

## メインセッション責務（Orchestrator責務限定）

Epic Orchestrator モードのメインセッションは以下に限定し、子 Issue 個別の実装詳細を抱え込まない:
1. Epic 本文の読み取り 2. Wave 順序の解釈 3. 子 Issue の subagent 起動 4. Wave 完了待機 5. 子 Issue の成功・失敗集約 6. Epic ステータス更新 7. specs 更新直列処理 8. 集約完了報告

## Wave失敗時後続制御

| 条件 | アクション |
|------|-----------|
| 兄弟 Issue が失敗 | 同一 Wave 内の他 Issue は継続 |
| 後続 Wave が失敗 Issue に依存しない | 後続 Wave を継続 |
| 後続 Wave が失敗 Issue に依存する | 該当 Wave をスキップ |
| 依存有無が判定不能 | 安全側: 該当 Wave をスキップ |
| 全 Issue が失敗 | 後続 Wave を実行せず集約失敗報告で停止 |

## 再開ポイント（Epic Orchestrator再実行時）

- Wave 1 から全 Wave を再評価する
- 各子 Issue は既存 case-run のべき等性に従いスキップ・再開・新規実行
- Epic 本文のステータス追跡テーブルは補助情報。主判定は各子 Issue の実成果物に基づく

## Epic Orchestrator集約完了報告フォーマット

共通必須フィールドに準拠し、`結果` フィールド内に Wave / Issue / 状態 / PR / 備考 のテーブルを配置する。

**成功時**:
```
✅ case-run 完了（Epic Orchestrator）
完了コマンド: /agentdev/case-run
対象: Epic #{epic_N}
結果: [Wave/Issue/状態テーブル] 成功: {N}件 / 失敗: {N}件 / スキップ: {N}件
検証結果: ✅ OK
git 永続化: 該当なし（specs更新は別Step）
次のコマンド: レビュー通過後: /agentdev/case-close
```

**部分失敗時** は先頭を `⚠️`、**全件失敗時** は `❌` に変更。いずれも6-field構造を維持。

## Epic Orchestrator固有エラー

| エラー | 対応 |
|--------|------|
| Wave テーブル不存在 | 通常の単一 Issue モードにフォールバック |
| 子 Issue 番号無効 | 該当 Issue をスキップ、警告表示 |
| 1 Wave 内子 Issue > 5件 | Wave を自動分割 |
| 全 Wave 全 Issue 失敗 | 集約失敗報告で停止 |
| Epic 本文読み取り失敗 | エラー報告して停止 |
