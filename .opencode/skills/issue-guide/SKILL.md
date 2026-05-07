---
name: issue-guide
description: 開発ワークフローの知識ベース。フェーズ定義、SSoT遷移、パターン判定基準、コマンド関連を提供。issue-*コマンドおよびissue-nextから参照される。
---

# Issue Guide スキル

issue-*系コマンドの統括ハブ。3マクロフェーズワークフローの全体像を提供する。

- **知識ベース**: フェーズ定義、SSoT遷移、パターン判定基準、コマンド関連
- **参照先**: issue-*コマンドおよびissue-nextから参照される
- **特性**: 宣言的定義のみを提供。手順・手続きは含まない
- **自明な質問の禁止**: エージェントが自律的に判断できることをユーザーに確認しない

---

## フェーズ体系

開発ワークフローを3つのマクロフェーズで定義する。

| マクロフェーズ       | 定義                                     | 対応マイクロフェーズ |
| -------------------- | ---------------------------------------- | -------------------- |
| ①バイブス壁打ち      | 要件定義・分析・Issue作成前の合意形成    | requirement + analyzed |
| ②構造的実行          | Issue作成後の実装・PR作成・進捗管理      | created + in_progress |
| ③レビュー完了        | PR作成後のレビュー・マージ・完了処理     | review + done |

### マイクロフェーズ一覧

| フェーズ      | 状態                   | マクロフェーズ     |
| ------------- | ---------------------- | ------------------ |
| `requirement` | 要件定義中             | ①バイブス壁打ち   |
| `analyzed`    | 分析完了・Issue未作成  | ①バイブス壁打ち   |
| `created`     | Issue作成済み・作業前  | ②構造的実行       |
| `in_progress` | 実装中                 | ②構造的実行       |
| `review`      | PR作成済み・レビュー中 | ③レビュー完了     |
| `done`        | 完了                   | ③レビュー完了     |

---

## SSoT遷移ルール

各マクロフェーズにおけるSingle Source of Truth（SSoT）を定義する。

| マクロフェーズ       | SSoT                           | 説明                                 |
| -------------------- | ------------------------------ | ------------------------------------ |
| ①バイブス壁打ち      | Issue本文                      | 壁打ちで合意形成された要件・分析     |
| ②構造的実行          | Issue本文 + Work Plan          | 要件doc + 実行計画                   |
| ③レビュー完了        | PR + レビュー結果              | コードレビュー結果とマージ状態       |

---

## フェーズ境界ルール

マクロフェーズ間の境界で満たすべき要件を定義する。

### ①→② 境界（バイブス壁打ち → 構造的実行）

①バイブス壁打ちフェーズ完了時、docs変更（REQファイル、READMEインデックス、ADR等）を**必ずコミット・プッシュ**すること。これにより②構造的実行フェーズのworktreeがdocs変更を継承する。

**義務化の理由**: Issue #32でdocs変更がコミットされず、worktreeに継承されなかった問題を再発防止するため。

**手順**:
1. docs変更の整合性検証（REQ番号の連続性、frontmatterの`id`とファイル名の一致）
2. `conventional-commits` に従ってコミットメッセージを生成
3. mainブランチにpush

---

## Anchored Development モデル

issue-*ワークフローはAnchored Developmentモデルに基づく。4つの相互接続アーティファクトで構成される。

| アーティファクト | 役割 | 格納先 |
| ---------------- | ---- | ------ |
| REQ（要件doc） | ユーザー視点の機能要件 | `docs/requirements/REQ-{NNNN}.md` |
| コード | 実装そのもの | ソースコード |
| テスト | 振る舞い仕様 | テストファイル |
| ADR | アーキテクチャ判断 | `docs/adr/ADR-*.md` |

これに加えて、システムの現在の姿を表す2つの「生きた仕様」を維持する。

| 仕様 | 役割 | 格納先 |
| ---- | ---- | ------ |
| system.md | システム全体の現在の仕様 | `docs/specs/system.md` |
| patterns.md | 実装パターン・規約 | `docs/specs/patterns.md` |

### ワークフロー

```
REQ → Issue → Work Plan（動的）→ TDD実装 → specs更新
```

- **Work Plan**: issue-work で生成・実行。Issue単位で動的に変化する。
- **specs更新**: issue-work で実装中に system.md/patterns.md を更新し、issue-close で更新内容を検証する。

### 参照フロー

各コマンドがどのアーティファクトをREAD/WRITEするかの明示的なマトリクス。

| コマンド | specs | ADR | REQ |
|----------|-------|-----|-----|
| `issue-req` | — | — | — |
| `issue-save-req` | — | WRITE | WRITE |
| `issue-create` | READ | READ | READ |
| `issue-work` | READ+WRITE | READ | READ |
| `issue-close` | — | — | READ |

#### データフロー図

```
issue-req(draft WRITE) → issue-save-req(REQ WRITE, ADR WRITE) → issue-create(specs READ, ADR READ) → issue-work(specs READ+WRITE, ADR READ) → TDD実装 → specs更新 → issue-close(VERIFY)
```

- **issue-req**: 要件docを壁打ちで構築し、パターンBの場合はドラフトを保存する（draft WRITE）
- **issue-create**: specs・ADRを読み込んでIssue本文に反映する（READ）
- **issue-work**: specs・ADRを読み込んで実装計画を立て、実装後にspecsを更新する（READ+WRITE）
- **issue-close**: REQを参照して完了確認・クリーンアップを行う（READ）

---

## コマンド関連マップ

各マクロフェーズで使用可能なコマンドを定義する。

| マクロフェーズ       | 使用可能なコマンド                                      | 役割                         |
| -------------------- | ------------------------------------------------------- | ---------------------------- |
| ①バイブス壁打ち      | `issue-req`, `issue-save-req`                        | 要件壁打ち・分析・docs保存     |
| ②構造的実行          | `issue-create`, `issue-work`, `issue-update`            | Issue作成・実装・進捗記録    |
| ③レビュー完了        | `issue-next`, `issue-close`                             | 次アクション推論・完了処理   |

### コマンド詳細

| コマンド              | 入力SSoT               | 出力SSoT                          | 完了後マクロフェーズ |
| --------------------- | ---------------------- | --------------------------------- | -------------------- |
| `issue-req`           | セッション会話         | 要件doc                           | ①バイブス壁打ち     |
| `issue-save-req`      | `.sisyphus/drafts/req-draft-*.md` | docs/requirements/REQ, docs/adr/ADR, docs index | ①バイブス壁打ち     |
| `issue-create`        | 要件doc, specs READ, ADR READ | GitHub Issue                      | ②構造的実行         |
| `issue-work`          | GitHub Issue, specs READ+WRITE, ADR READ | GitHub PR + worktree + ブランチ   | ③レビュー完了       |
| `issue-update`        | GitHub Issue           | GitHub Issue + REQファイル（APPEND/UPDATE対応） | 変更なし            |
| `issue-close`         | GitHub Issue + PR      | なし                              | ③レビュー完了       |
| `issue-next`          | 複数                   | 適切なコマンド実行                 | 依存                |

---

## ラベル体系

Issueラベルの定義と自動付与ルールを定義する。

### パターン判定

ラベルからパターン（A/B）を判定する。

- `bug`, `critical` → パターンA（小）: バグ修正・軽微変更、docs/更新なし
- `feature`, `enhancement` → パターンB（中）: 新機能追加、docs/更新あり

### ラベルマッピング

| 変更種別           | 付与ラベル                                                |
| ------------------ | --------------------------------------------------------- |
| バグ修正           | `bug`                                                     |
| バグ修正（緊急）   | `bug`, `critical`                                         |
| 機能追加           | `enhancement`, `feature`                                  |
| 機能追加（要検討） | `enhancement`, `feature`, `needs-discussion`              |

---

## 完了報告フォーマット

各コマンド完了時の報告フォーマットを定義する。

### issue-req 完了時

```
✅ 要件定義が完了しました（パターン{X}：{規模}）。
  {パターンBの場合: 壁打ちドラフトを .sisyphus/drafts/ に保存しました。}
  次のステップ: {パターンBの場合: /issue/issue-save-req / パターンAの場合: /issue/issue-create}
```

#### 壁打ち結論ハイライト

issue-req完了時は以下のハイライトを報告に続けて出力する。

```
📋 壁打ち結論ハイライト
  背景: {課題の1行サマリ}
  目標: {達成すべきゴール}
  要件数: {機能要件の数}
   主要な判断: {壁打ちで合意した技術判断}
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

### issue-work 完了時

```
✅ PRを作成しました: {PR_URL}
  Issue: #{N}（パターン{X}）
  現在の状態: レビュー待ち

  レビューが通ったら: /issue/issue-close
  レビューで差し戻されたら: フィードバックを反映して /issue/issue-work を再実行してください
```

### issue-update 完了時

```
✅ Issue #{N} を更新しました。
  次のステップ: /issue/issue-work {N}
```

または

```
✅ Issue #{N} にコメントを追加しました。
  次のステップ: /issue/issue-work {N}
```

または

```
✅ Issue #{N} のREQファイルを更新しました（{APPEND/UPDATE}: REQ-{NNNN}）。
  次のステップ: /issue/issue-work {N}
```

### issue-close 完了時

```
🎉 フロー完了しました。
  - Issue #{N} をクローズ
  - PR #{PR_N} をマージ
  - 関連リソースをクリーンアップ
  {パターンBの場合: - ドキュメント（REQ・specs）を更新済み}
```

---

## レビューNG時の対応フロー

レビュー結果がNGの場合、乖離の種類に応じて対応フローを切り替える。

### NG理由の定義と対応フロー

| NG理由 | 定義 | 対応フロー |
| ------ | ---- | ---------- |
| 仕様バグ | 要件定義と実装の間に論理的矛盾がある | `deviation-check` 結果確認 → `/issue/issue-update {N} --req --review-ng`（該当REQのUPDATE）→ `/issue/issue-work {N}` |
| 実装バグ | 要件定義は正しいが実装が仕様を満たさない | `deviation-check` 結果確認 → `/issue/issue-update {N} --comment --review-ng`（レビューNGテンプレート使用）→ `/issue/issue-work {N}` |
| スコープ外逸脱 | 実装が要件定義の範囲を超えている | `/issue/issue-update {N} --req --review-ng`（REQの該当セクションUPDATE）→ 不要な実装を削除 → `/issue/issue-work {N}` |

### `--review-ng` フラグ

`issue-update` に `--review-ng` を付与すると、レビューNG専用テンプレート（`issue_comment_review_ng.md`）を使用してコメントを投稿する。`deviation-check` の報告内容（影響度、対象、内容、推奨アクション、理由）をテンプレートに反映する。

---

## チェックボックス更新ルール

Issue本文のタスクリスト（チェックボックス）は以下のルールで更新する。

| タイミング | 更新内容 |
| ---------- | -------- |
| issue-work 完了時 | 完了したタスクのチェックボックスを入れる（`[ ]` → `[x]`） |
| レビューNG差し戻し時 | 差し戻されたタスクのチェックボックスを外す（`[x]` → `[ ]`） |
| issue-update（--req）時 | 要件変更に伴い不要になったタスクを削除、新規タスクを追加 |

---

## issue-next レビューNG時推論ルール

`issue-next` コマンドは、レビュー結果から適切な次アクションを推論する。

| 条件 | 推論結果 |
| ---- | -------- |
| レビュー結果に「仕様バグ」が含まれる | `/issue/issue-update {N} --req --review-ng` → `/issue/issue-work {N}` |
| レビュー結果に「実装バグ」が含まれる | `/issue/issue-update {N} --comment --review-ng` → `/issue/issue-work {N}` |
| レビュー結果に「スコープ外逸脱」が含まれる | `/issue/issue-update {N} --req --review-ng` → 不要実装削除 → `/issue/issue-work {N}` |
| レビュー結果がOK | `/issue/issue-close {N}` |

---

## docs/ 構造（5区分）

issue-*ワークフローで操作する docs/ の5区分構造。

| 区分 | パス | 役割 | 自動操作コマンド |
|------|------|------|----------------|
| guides/ | 開発ガイド（参照のみ） | setup.md, api-reference.md, testing-and-debugging.md | — |
| requirements/ | 要件管理 | README.md + REQ-{NNNN}.md | issue-save-req(CREATE), issue-create(READ), issue-update(UPDATE) |
| adr/ | ADR | README.md + ADR-{NNNN}.md | adr-guidelines(CREATE) |
| specs/ | システム仕様 | system.md, patterns.md | issue-work(READ+WRITE), issue-close(VERIFY) |
| tips/ | 学び | inbox.md + *.md | tips-add(UPDATE), tips-refactor(CREATE) |

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
| 完了報告 | 各issue-*コマンド | `issue-guide`の完了報告フォーマットに従った出力 |
| 実装サマリ | `/start-work`、`@plan` | 実装内容の要約・変更ファイル一覧 |
| 乖離検出レポート | `deviation-check` | 要件と実装の乖離内容・影響度・推奨アクション |
| review-work結果 | `review-work`スキル | レビュー判定・指摘事項 |
| 壁打ち結論ハイライト | `issue-req` | 背景・目標・要件数・主要な判断 |

### 非対象

以下はverbatim出力の対象外（親エージェントが適宜整形してよい）。

- ユーザーとの対話中の中間メッセージ（進捗報告・質問等）
- エラーメッセージ（ツール呼び出し失敗等の通知）
- 確認プロンプト（ユーザーへの選択肢提示等）

---

## スキル間依存関係

issue-guideはハブスキルとして、他の専門スキルが提供する知識を統合する。

| スキル名           | 提供する知識                                                   |
| ------------------ | -------------------------------------------------------------- |
| `req-analysis`     | 要件分析手法（機能/非機能要件の展開観点、壁打ちメソッドロジー）   |
| `deviation-check`  | 乖離検出（実装と要件の乖離基準、ループバック判定）              |

**注意**: issue-guideはハブとして他スキルを参照するが、他スキルからissue-guideを参照しない（一方向依存）。
