# 完了報告フォーマット

各コマンド完了時の報告フォーマットを定義する。

## 必須フォーマット宣言

全agentdevコマンドは完了報告時に**必ず**本ファイルの該当セクションのフォーマットを使用すること。独自フォーマットの使用は禁止する（SHALL）。各セクションのコードブロック内の変数（`{...}`）のみを実際の値に置換して出力すること。

## 完了報告出力順序ルール

全agentdevコマンドの完了報告ステップにおいて、以下の順序を**必ず**守ること。

1. **TodoWrite更新（先）**: TodoWriteの「完了報告」項目を `completed` に更新する
2. **完了報告テキスト（後）**: 本スキルの完了報告フォーマットに従ったテキストを出力する
3. **中間出力の禁止**: TodoWrite更新と完了報告テキストの間に、他の中間出力（ログ・進捗報告・確認メッセージ等）を挟まない

**適用対象**: req-define, req-save, case-open, case-run, case-close, case-update, intake-from-github, intake-open の全完了報告ステップ

**理由**: 完了報告テキストがユーザーに最後に表示されることで、最終結果の視認性が向上する

## req-define 完了時

```
✅ 要件定義が完了しました（{日本語名称}：{規模}）。
  {機能追加の場合: 壁打ちドラフトを .sisyphus/drafts/ に保存しました。}
  次のステップ: {機能追加の場合: /agentdev/req-save / バグ修正・軽微変更の場合: /agentdev/case-open}
```
- Pattern分岐の判定基準と固有ルールは `agentdev-workflow-lifecycle` → Pattern Registry を参照

### 壁打ち結論ハイライト

req-define完了時は以下のハイライトを報告に続けて出力する。

```
📋 壁打ち結論ハイライト
  背景: {課題の1行サマリ}
  目標: {達成すべきゴール}
  要件数: {機能要件の数}
   主要な判断: {壁打ちで合意した技術判断}
```

### Epic規模判定時

req-define完了時、Epic規模と判定された場合は以下の追加報告を出力する。

```
✅ 要件定義が完了しました（機能追加 Epic：大規模機能追加）。
  壁打ちドラフトを .sisyphus/drafts/ に保存しました。
  規模判定: Epic（複数モジュール跨ぎ、分割推奨）
  次のステップ: /agentdev/req-save
```

## req-save 完了時

```
✅ 要件をdocs/に保存しました（REQ-{NNNN} を{CREATE/APPEND/UPDATE}）。
  {ADR作成がある場合: ADR-{NNNN} を作成しました。}
  次のステップ: /agentdev/case-open
```

## case-open 完了時

```
✅ Issue #{N} を作成しました（{日本語名称}）。
  {機能追加の場合: REQ-{NNNN} をIssue本文に反映しました。}
  次のステップ: /agentdev/case-run {N}
```

### Epic作成時

Epic Issueを作成した場合は以下の報告を出力する。

```
✅ Epic Issue #{epic_N} を作成しました（機能追加 Epic）。
  REQ-{NNNN} をEpic本文に反映しました。
  子Issue: #{child1}, #{child2}, #{child3}（{count}件）
  次のステップ: /agentdev/case-run {child1} {child2} {child3}
```

## case-run 完了時

```
✅ case-run 完了
  PR: {PR_URL}
  現在の状態: レビュー待ち
  head: {branch_name}
  base: {base_branch}
  次のステップ: レビューが通ったら /agentdev/case-close
```

## case-update 完了時

更新種別に応じた報告フォーマットを使用する。

**`--body` の場合**:
```
✅ Issue #{N} の本文を更新しました（--body）。
  次のステップ: /agentdev/case-run {N}
```

**`--comment` の場合**:
```
✅ Issue #{N} にコメントを追加しました（--comment）。
  次のステップ: /agentdev/case-run {N}
```

**`--req` の場合**:
```
✅ Issue #{N} のREQファイルを更新しました（--req: {APPEND/UPDATE} REQ-{NNNN}）。
  更新内容: {更新したセクション名のリスト}
  次のステップ: /agentdev/case-run {N}
```

**`--review-ng` の場合**:
```
⚠️ Issue #{N} にレビューNG報告を投稿しました（--review-ng）。
  乖離タイプ: {spec-bug / impl-bug / scope-creep}
  影響REQ番号: {REQ番号のリスト}
  推奨アクション: {修正 / 承認 / 差し戻し}
  次のステップ: ユーザーの判断に基づき対応（修正 → /agentdev/case-run {N} / 差し戻し → /agentdev/req-define）
```

## case-close 完了時

```
✅ case-close 完了
  - Issue #{N} をクローズ
  - PR #{PR_N} をマージ
  - 関連リソースをクリーンアップ
  {機能追加の場合: - ドキュメント（REQ・specs）を更新済み}
  {Epic自動クローズの場合: - Epic #{epic_N} を自動クローズ（全子Issue完了）}
  {Epicスキップの場合: - Epic #{epic_N}: N件未完了のためスキップ}
```

## intake-from-github 完了時

```
✅ バックログ抽出が完了しました。
  対象期間: {since} 〜 {until}
  抽出件数: {N}件
  分類結果: {category_1}: {N1}件, {category_2}: {N2}件
  バックログ作成対象: {Y}件（解消済み除外: {X}件）
  ドラフト: .sisyphus/drafts/backlog-draft-{period-slug}.md
  ステータス: approved
  次のステップ: /agentdev/intake-open
```

**注意**: intake-from-githubはバックログ抽出コマンドであり、品質メトリクス収集・乖離検出レポートの自動生成は行わない。

## intake-open 完了時

```
✅ バックログIssue作成が完了しました。
  対象期間: {since} 〜 {until}
  Epic: #{epic_N}
  子Issue: #{child1}, #{child2}, ...（{count}件）
  ステータス追跡: ☐ 未着手 {count}件
  Draft状態: issued
  ⚠️ コメント投稿失敗: #{失敗1}, #{失敗2}, ...（失敗がない場合はこの行は表示しない）
  次のステップ: /agentdev/case-run {child1} {child2} ...
```

**注意**: intake-openはバックログからのIssue作成コマンドであり、品質メトリクス収集・乖離検出レポートの自動生成は行わない。