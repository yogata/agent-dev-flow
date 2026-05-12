---
name: issue-guide-reports
description: Defines completion report formats, checkbox update rules, and sub-agent verbatim output policies for issue-* commands. USE FOR: generating command completion reports, updating Issue checkboxes, formatting sub-agent output, or applying report templates. DO NOT USE FOR: workflow phase definitions, pattern classification, or architecture decisions.
---

# Issue Guide Reports スキル

issue-*系コマンドの完了報告フォーマット・チェックボックス更新ルール・サブエージェント出力ポリシーを提供する。

- **知識ベース**: 完了報告フォーマット、チェックボックス更新ルール、サブエージェント出力ポリシー
- **参照先**: issue-*コマンドおよびissue-nextから参照される
- **特性**: 宣言的定義のみを提供。手順・手続きは含まない
- **自明な質問の禁止**: エージェントが自律的に判断できることをユーザーに確認しない

---

## 完了報告フォーマット

各コマンド完了時の報告フォーマットを定義する。

### issue-req 完了時

```
✅ 要件定義が完了しました（パターン{X}：{規模}）。
  {パターンBの場合: 壁打ちドラフトを .sisyphus/drafts/ に保存しました。}
  次のステップ: {パターンBの場合: /issue/issue-save-req / パターンAの場合: /issue/issue-create}
```
- Pattern分岐の判定基準と固有ルールは `issue-guide-phases` → Pattern Registry を参照

#### 壁打ち結論ハイライト

issue-req完了時は以下のハイライトを報告に続けて出力する。

```
📋 壁打ち結論ハイライト
  背景: {課題の1行サマリ}
  目標: {達成すべきゴール}
  要件数: {機能要件の数}
   主要な判断: {壁打ちで合意した技術判断}
```

#### Epic規模判定時

issue-req完了時、Epic規模と判定された場合は以下の追加報告を出力する。

```
✅ 要件定義が完了しました（パターンB Epic：大規模機能追加）。
  壁打ちドラフトを .sisyphus/drafts/ に保存しました。
  規模判定: Epic（複数モジュール跨ぎ、分割推奨）
  次のステップ: /issue/issue-save-req
```

### issue-save-req 完了時

```
✅ 要件をdocs/に保存しました（REQ-{NNNN} を{CREATE/APPEND/UPDATE}）。
  {ADR作成がある場合: ADR-{NNNN} を作成しました。}
  次のステップ: /issue/issue-create
```

### issue-create 完了時

```
✅ Issue #{N} を作成しました（パターン{X}）。
  {パターンBの場合: REQ-{NNNN} をIssue本文に反映しました。}
  次のステップ: /issue/issue-work
```

#### Epic作成時

Epic Issueを作成した場合は以下の報告を出力する。

```
✅ Epic Issue #{epic_N} を作成しました（パターンB Epic）。
  REQ-{NNNN} をEpic本文に反映しました。
  子Issue: #{child1}, #{child2}, #{child3}（{count}件）
  次のステップ: /issue/issue-work {child1} {child2} {child3}
```

### issue-work 完了時

```
✅ PRを作成しました: {PR_URL}
  Issue: #{N}（パターン{X}）
  現在の状態: レビュー待ち

  レビューが通ったら: /issue/issue-close
```

### issue-update 完了時

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

### issue-close 完了時

```
🎉 フロー完了しました。
  - Issue #{N} をクローズ
  - PR #{PR_N} をマージ
  - 関連リソースをクリーンアップ
  {パターンBの場合: - ドキュメント（REQ・specs）を更新済み}
  {Epic自動クローズの場合: - Epic #{epic_N} を自動クローズ（全子Issue完了）}
  {Epicスキップの場合: - Epic #{epic_N}: N件未完了のためスキップ}
```

---

## チェックボックス更新ルール

Issue本文のタスクリスト（チェックボックス）は以下のルールで更新する。

| タイミング | 更新内容 |
| ---------- | -------- |
| issue-work 完了時 | 完了したタスクのチェックボックスを入れる（`[ ]` → `[x]`）。テスト戦略項目の達成判定を含む |
| issue-close 実行時 | PR検証結果に基づき、Issue本文の未チェック項目を評価・更新する。実動作証拠がある「手動確認」項目は `[x]` に更新 |
| レビューNG差し戻し時 | 差し戻されたタスクのチェックボックスを外す（`[x]` → `[ ]`） |
| issue-update（--req）時 | 要件変更に伴い不要になったタスクを削除、新規タスクを追加 |

---

## サブエージェント出力ポリシー

issue-*コマンドが利用するサブエージェント（`call_omo_agent`、バックグラウンドタスク、`/start-work`、`@plan`等）の最終出力は、親エージェントによる再フォーマット・要約・再構成なしにそのまま（verbatim）ユーザーに表示すること。

### 義務

- サブエージェントの最終出力をverbatimで出力する（再フォーマット禁止）
- Markdownテーブル・強調表示・リスト等のフォーマットを保持する

### verbatim出力の対象

サブエージェントが生成する以下の最終出力を対象とする。

| 出力種別 | 生成元 | 説明 |
|----------|--------|------|
| 完了報告 | 各issue-*コマンド | `issue-guide-reports`の完了報告フォーマットに従った出力 |
| 実装サマリ | `/start-work`、`@plan` | 実装内容の要約・変更ファイル一覧 |
| 乖離検出レポート | `spec-compliance` | 要件と実装の乖離内容・影響度・推奨アクション |
| review-work結果 | `review-work`スキル | レビュー判定・指摘事項 |
| 壁打ち結論ハイライト | `issue-req` | 背景・目標・要件数・主要な判断 |

### 非対象

以下はverbatim出力の対象外（親エージェントが適宜整形してよい）。

- ユーザーとの対話中の中間メッセージ（進捗報告・質問等）
- エラーメッセージ（ツール呼び出し失敗等の通知）
- 確認プロンプト（ユーザーへの選択肢提示等）

---

## テンプレート使用ガイド

issue-*コマンドで使用するテンプレートの適用タイミングと方法を定義する。

| テンプレート | 使用コマンド | 使用タイミング | 適用方法 |
|---|---|---|---|
| `pr_desc.md` | `issue-work` | Step 11（PR作成時） | テンプレートを読み込み、変数を置換してPR本文として生成 |
| `report_spec_compliance.md` | `issue-work` | Step 8-9（乖離検出・報告時） | テンプレートを読み込み、乖離内容を埋めて報告 |
| `issue_comment_feature_implementation.md` | `issue-close` | Step 4（PRマージ後コメント） | テンプレートを読み込み、実装記録を埋めてコメント投稿 |
| `issue_comment_bug_record.md` | `issue-close` | Step 4（PRマージ後コメント） | テンプレートを読み込み、バグ修正記録を埋めてコメント投稿 |
| `issue_desc_epic.md` | `issue-create` | Epic Issue作成時 | テンプレートを読み込み、Epic用本文を生成 |
| `issue_desc_child.md` | `issue-create` | 子Issue作成時 | テンプレートを読み込み、子Issue用本文を生成 |
| `issue_desc_backlog_epic.md` | `issue-backlog` | Step 8（Epic Issue作成時） | テンプレートを読み込み、バックログEpic用本文を生成 |
| `issue_desc_backlog_child.md` | `issue-backlog` | Step 9（子Issue作成時） | テンプレートを読み込み、バックログ子Issue用本文を生成 |

### 適用ルール

- テンプレートは Read tool で読み込み、変数部分を置換して使用する
- テンプレートの構造を維持する（セクションの削除・順序変更禁止）
- 変数に該当するデータがない場合、そのセクションに「該当なし」と記載する（セクションごと削除しない）
