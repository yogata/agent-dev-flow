# 完了報告フォーマット

各コマンド完了時の報告フォーマットを定義する。

## 完了報告出力順序ルール

全issue-*コマンドの完了報告ステップにおいて、以下の順序を**必ず**守ること。

1. **TodoWrite更新（先）**: TodoWriteの「完了報告」項目を `completed` に更新する
2. **完了報告テキスト（後）**: 本スキルの完了報告フォーマットに従ったテキストを出力する
3. **中間出力の禁止**: TodoWrite更新と完了報告テキストの間に、他の中間出力（ログ・進捗報告・確認メッセージ等）を挟まない

**適用対象**: issue-req, issue-save-req, issue-create, issue-work, issue-close, issue-update, issue-backlog の全完了報告ステップ

**理由**: 完了報告テキストがユーザーに最後に表示されることで、最終結果の視認性が向上する

## issue-req 完了時

```
✅ 要件定義が完了しました（パターン{X}：{規模}）。
  {パターンBの場合: 壁打ちドラフトを .sisyphus/drafts/ に保存しました。}
  次のステップ: {パターンBの場合: /issue/issue-save-req / パターンAの場合: /issue/issue-create}
```
- Pattern分岐の判定基準と固有ルールは `issue-lifecycle` → Pattern Registry を参照

### 壁打ち結論ハイライト

issue-req完了時は以下のハイライトを報告に続けて出力する。

```
📋 壁打ち結論ハイライト
  背景: {課題の1行サマリ}
  目標: {達成すべきゴール}
  要件数: {機能要件の数}
   主要な判断: {壁打ちで合意した技術判断}
```

### Epic規模判定時

issue-req完了時、Epic規模と判定された場合は以下の追加報告を出力する。

```
✅ 要件定義が完了しました（パターンB Epic：大規模機能追加）。
  壁打ちドラフトを .sisyphus/drafts/ に保存しました。
  規模判定: Epic（複数モジュール跨ぎ、分割推奨）
  次のステップ: /issue/issue-save-req
```

## issue-save-req 完了時

```
✅ 要件をdocs/に保存しました（REQ-{NNNN} を{CREATE/APPEND/UPDATE}）。
  {ADR作成がある場合: ADR-{NNNN} を作成しました。}
  次のステップ: /issue/issue-create
```

## issue-create 完了時

```
✅ Issue #{N} を作成しました（パターン{X}）。
  {パターンBの場合: REQ-{NNNN} をIssue本文に反映しました。}
  次のステップ: /issue/issue-work {N}
```

### Epic作成時

Epic Issueを作成した場合は以下の報告を出力する。

```
✅ Epic Issue #{epic_N} を作成しました（パターンB Epic）。
  REQ-{NNNN} をEpic本文に反映しました。
  子Issue: #{child1}, #{child2}, #{child3}（{count}件）
  次のステップ: /issue/issue-work {child1} {child2} {child3}
```

## issue-work 完了時

```
✅ PRを作成しました: {PR_URL}
  Issue: #{N}（パターン{X}）
  現在の状態: レビュー待ち

  レビューが通ったら: /issue/issue-close
```

## issue-update 完了時

更新種別に応じた報告フォーマットを使用する。

**`--body` の場合**:
```
✅ Issue #{N} の本文を更新しました（--body）。
  次のステップ: /issue/issue-work {N}
```

**`--comment` の場合**:
```
✅ Issue #{N} にコメントを追加しました（--comment）。
  次のステップ: /issue/issue-work {N}
```

**`--req` の場合**:
```
✅ Issue #{N} のREQファイルを更新しました（--req: {APPEND/UPDATE} REQ-{NNNN}）。
  更新内容: {更新したセクション名のリスト}
  次のステップ: /issue/issue-work {N}
```

**`--review-ng` の場合**:
```
⚠️ Issue #{N} にレビューNG報告を投稿しました（--review-ng）。
  乖離タイプ: {spec-bug / impl-bug / scope-creep}
  影響REQ番号: {REQ番号のリスト}
  推奨アクション: {修正 / 承認 / 差し戻し}
  次のステップ: ユーザーの判断に基づき対応（修正 → /issue/issue-work {N} / 差し戻し → /issue/issue-req）
```

## issue-close 完了時

```
🎉 フロー完了しました。
  - Issue #{N} をクローズ
  - PR #{PR_N} をマージ
  - 関連リソースをクリーンアップ
  {パターンBの場合: - ドキュメント（REQ・specs）を更新済み}
  {Epic自動クローズの場合: - Epic #{epic_N} を自動クローズ（全子Issue完了）}
  {Epicスキップの場合: - Epic #{epic_N}: N件未完了のためスキップ}
```