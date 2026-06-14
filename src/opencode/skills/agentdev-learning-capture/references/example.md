# Example Workflow

**シナリオ1**: CI で lint エラーが発生し、テンプレート逸脱を修正した
**シナリオ2**: git worktree 削除時に Permission denied リトライが必要だった

---

## シナリオ1: CI失敗 + テンプレート逸脱

### Step 1: 学びの検知

- CIパイプラインでlintエラーが発生
- 原因はコミットメッセージがConventional Commits規約に違反していた
- エージェントが自動修正し、CI再実行で通過
- テンプレート逸脱としても記録すべき

### Step 2: 学びの抽出（13フィールド形式）

```markdown
## CI lint失敗: コミットメッセージのConventional Commits規約違反

- **問題事象**: PR作成後のCI実行で、commitlintによるコミットメッセージ検証が失敗した
- **発生局面**: CI
- **検知方法**: CI パイプラインの commitlint ステップでの失敗
- **根本原因**: エージェントが生成したコミットメッセージが `type(scope): description` 形式に準拠していなかった
- **自律対応内容**: `git commit --amend` でメッセージを規約準拠形式に修正し、CI再実行で通過を確認
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: コミットメッセージ生成時は常に agentdev-conventional-commits スキルを参照すべき。他のコマンドでもコミット生成箇所があるため同様のリスクあり
- **再発条件**: `agentdev-conventional-commits` スキルをロードせずにコミットメッセージを生成する場合
- **予防策候補**: case-run や case-close のコミット生成ステップに agentdev-conventional-commits スキルのロードを必須化する
- **想定反映先**: `agentdev-conventional-commits` スキル、`case-run` コマンド
- **関連**: `.opencode/skills/agentdev-conventional-commits/SKILL.md`, `.opencode/commands/agentdev/case-run.md`
- **タグ**: `#ci` `#コミットメッセージ` `#テンプレート逸脱`
```

### Step 3: ユーザー通知

> 以下の学びを `.agentdev/learning/inbox.md` に追加しました：
>
> ## CI lint失敗: コミットメッセージのConventional Commits規約違反
>
> - **問題事象**: ...
> （全13フィールド表示）

### Step 4: 学びの追加

エージェントが直接 `.agentdev/learning/inbox.md` に13フィールド形式で追記する（ユーザー承認不要）。

---

## シナリオ2: gh/git ワークアラウンド

### Step 1: 学びの検知

- `git worktree remove` で権限エラー（Permission denied）が発生
- Windows環境ではファイルハンドル解放待ちのリトライが必要
- エージェントが短い待機を挟んでリトライし成功（force フラグは使用しない）

### Step 2: 学びの抽出（13フィールド形式）

```markdown
## Windows環境でのgit worktree削除時のPermission deniedリトライ

- **問題事象**: `git worktree remove` 実行時にファイルロックエラー（Permission denied）が発生した
- **発生局面**: 実装（case-closeのブランチ削除ステップ）
- **検知方法**: git コマンドの終了コードとエラーメッセージ
- **根本原因**: Windowsのファイルシステムロックにより、worktreeディレクトリが完全に解放される前に削除を試行した
- **自律対応内容**: 短い待機を挟んでリトライ（最大3回）。force フラグ（`-f`）は使用せず、ファイルハンドル解放後に通常削除で成功を確認
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: Windows環境でのファイルシステム操作で同様のハンドル解放待ちリトライパターンが適用可能
- **再発条件**: Windows環境で worktree を削除する場合
- **予防策候補**: worktree 削除プロシージャに Permission denied 時の待機リトライ（最大3回）を組み込む。junction 環境では junction 削除フォールバック手順を適用
- **想定反映先**: worktree 削除プロシージャ
- **関連**: worktree-operations プロシージャ, Issue #{issue_number}
- **タグ**: `#git` `#windows` `#ワークアラウンド`
```

### Step 3: ユーザー通知

> 以下の学びを `.agentdev/learning/inbox.md` に追加しました：
>
> ## Windows環境でのgit worktree削除時のPermission deniedリトライ
>
> - **問題事象**: ...
> （全13フィールド表示）

---

## シナリオ3: ユーザー確認あり + ADR/REQ/spec影響

### Step 1: 学びの検知

- 実装中に仕様の矛盾を発見
- ユーザーに確認した結果、REQファイルの更新が必要と判明
- ADRにも影響の可能性

### Step 2: 学びの抽出（13フィールド形式）

```markdown
## 実装中の仕様矛盾発見によるREQ更新の必要

- **問題事象**: Issue #{issue_number} の実装中、{REQ-ID} と specs/design-principles.md で定義されているエラー処理方針が矛盾していることを発見した
- **発生局面**: 実装
- **検知方法**: agentdev-spec-compliance スキルによる実装前チェック
- **根本原因**: {REQ-ID} 作成時に design-principles.md の既存方針との整合性確認が漏れていた
- **自律対応内容**: 矛盾点を整理し、ユーザーに確認して{REQ-ID} の該当セクションを修正
- **ユーザー確認有無**: あり
- **ADR/REQ/spec影響**: {REQ-ID} 該当セクションの更新が必要。retired {ADR-ID}（現在は SPEC で規定済みの内容）の内容についても検討すべき
- **横展開観点**: REQ作成時は常に既存specs/ADRとの整合性確認を必須とすべき
- **再発条件**: 新規REQ作成時に既存ドキュメントとの整合性チェックをスキップする場合
- **予防策候補**: req-save の実行ステップに specs/ADR 整合性チェックを追加する
- **想定反映先**: `req-save` コマンド、`agentdev-req-analysis` スキル
- **関連**: `docs/requirements/{REQ-ID}.md`, `docs/specs/design-principles.md`, Issue #{issue_number}
- **タグ**: `#仕様矛盾` `#REQ更新` `#ADR影響`
```

### Step 3: ユーザー通知

> 実装中に仕様矛盾を発見し、学びを `.agentdev/learning/inbox.md` に追加しました：
>
> （全13フィールド表示）

---

## Full Pipeline Example (Complete 3-Layer Flow)

### Layer 1: Capture Phase (学びの記録)

エージェントが13フィールド形式で `.agentdev/learning/inbox.md` に直接追記：

```markdown
## CI lint失敗: コミットメッセージのConventional Commits規約違反

- **問題事象**: ...
- **発生局面**: CI
（全13フィールド）

## Windows環境でのgit worktree削除時のPermission deniedリトライ

- **問題事象**: ...
- **発生局面**: 実装
（全13フィールド）

## 実装中の仕様矛盾発見によるREQ更新の必要

- **問題事象**: ...
- **発生局面**: 実装
（全13フィールド）
```

### Layer 2: Analysis Phase (セマンティック分析と整理)

```
/agentdev/learning-promote
```

→ 実行内容（内部分析フェーズ）:
  - inbox.md + archive/active.md のエントリを問題クラス分類（根本原因+再発条件+予防策が同じ単位）
  - 8軸評価スコアを算出し evaluation-report.md を生成
  - （任意）archive/active.md の古い単発レアケースを prune
  - ユーザー承認後、inbox.md の全エントリを archive/active.md（生きている learning プール）に移動
  - inbox.md をクリア

### Layer 3: Promotion Phase (昇華判定とスタブ生成)

→ 実行内容（昇華判定フェーズ、引き続き learning-promote 内）:
  - evaluation-report.md の問題クラスを主入力として分析
  - 各クラスタを11処分区分 + duplicate で判定
  - 既存 command/skill/template/docs に同種対策が存在するか照合
  - ユーザー承認後、staging領域にスタブファイルを生成（7つの必須フィールド）
  - staged/rejected/duplicate エントリを archive/active.md から promote 時 prune
