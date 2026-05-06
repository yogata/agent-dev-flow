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

## Anchored Development モデル

issue-*ワークフローはAnchored Developmentモデルに基づく。4つの相互接続アーティファクトで構成される。

| アーティファクト | 役割 | 格納先 |
| ---------------- | ---- | ------ |
| REQ（要件doc） | ユーザー視点の機能要件 | `docs/requirements/REQ-NNNN.md` |
| コード | 実装そのもの | ソースコード |
| テスト | 振る舞い仕様 | テストファイル |
| ADR | アーキテクチャ判断 | `docs/adr/NNN-*.md` |

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
- **specs更新**: issue-close で実装完了後に system.md/patterns.md を更新。

---

## コマンド関連マップ

各マクロフェーズで使用可能なコマンドを定義する。

| マクロフェーズ       | 使用可能なコマンド                                      | 役割                         |
| -------------------- | ------------------------------------------------------- | ---------------------------- |
| ①バイブス壁打ち      | `issue-req`                                             | 要件壁打ち・分析             |
| ②構造的実行          | `issue-create`, `issue-work`, `issue-update`            | Issue作成・実装・進捗記録    |
| ③レビュー完了        | `issue-next`, `issue-close`                             | 次アクション推論・完了処理   |

### コマンド詳細

| コマンド              | 入力SSoT               | 出力SSoT                          | 完了後マクロフェーズ |
| --------------------- | ---------------------- | --------------------------------- | -------------------- |
| `issue-req`           | セッション会話         | 要件doc                           | ①バイブス壁打ち     |
| `issue-create`        | 要件doc                | GitHub Issue                      | ②構造的実行         |
| `issue-work`          | GitHub Issue           | GitHub PR + worktree + ブランチ   | ③レビュー完了       |
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
✅ パターン{X}（{規模}）と判定しました。
  Issue状態: {フェーズ}
  REQファイル: {CREATE/APPEND/UPDATE}: REQ-{NNNN}
  次のステップ: /issue/issue-create
```

### issue-create 完了時

```
✅ Issue #{N} を作成しました（パターン{X}）。
  {パターンBの場合: docs/requirements/REQ-{NNNN}.md を作成しました。}
  次のステップ: /issue/issue-work {N}
```

### issue-work 完了時

```
✅ PRを作成しました: {PR_URL}
  Issue: #{N}（パターン{X}）
  現在の状態: review（レビュー待ち）

  レビュー結果:
  - OK → /issue/issue-close {N}
  - NG（仕様バグ）→ deviation-check確認 → /issue/issue-update {N} --req --review-ng → /issue/issue-work {N}
  - NG（実装バグ）→ deviation-check確認 → /issue/issue-update {N} --comment --review-ng → /issue/issue-work {N}
  - NG（スコープ外逸脱）→ /issue/issue-update {N} --req --review-ng → 不要実装削除 → /issue/issue-work {N}
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
  - クローズ: Issue #{N}
  - マージ: PR #{PR_N}
  - 削除: worktree `.worktrees/{N}-{type}`, ブランチ `{type}/issue-{N}`
  - Planファイルアーカイブ完了
  {パターンBの場合: - docs/requirements/REQ-{NNNN}.md 作成済み, docs/specs/ 更新済み}
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
| requirements/ | 要件管理 | README.md + REQ-NNNN.md | issue-req(CREATE), issue-create(READ), issue-update(UPDATE) |
| adr/ | ADR | README.md + NNN-*.md | adr-guidelines(CREATE) |
| specs/ | システム仕様 | system.md, patterns.md | issue-close(UPDATE) |
| tips/ | 学び | inbox.md + *.md | tips-add(UPDATE), tips-refactor(CREATE) |

---

## スキル間依存関係

issue-guideはハブスキルとして、他の専門スキルが提供する知識を統合する。

| スキル名           | 提供する知識                                                   |
| ------------------ | -------------------------------------------------------------- |
| `req-analysis`     | 要件分析手法（機能/非機能要件の展開観点、壁打ちメソッドロジー）   |
| `deviation-check`  | 乖離検出（実装と要件の乖離基準、ループバック判定）              |

**注意**: issue-guideはハブとして他スキルを参照するが、他スキルからissue-guideを参照しない（一方向依存）。
