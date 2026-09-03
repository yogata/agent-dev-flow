# 実例ワークフロー

本ファイルは `agentdev-learning-capture` SKILL.md の補助資料であり、捕捉対象カテゴリと具体例、学び抽出〜通知の手順実例、 Tips、 pipeline 全体像を扱う。
SKILL.md 本文では実観測原則、 trigger、禁止事項、 split rule のみを提示し、具体手順と記入例は本ファイルを参照する。

## 目次

- [主な捕捉対象](#主な捕捉対象)
- [シナリオ1: CI失敗 + テンプレート逸脱](#シナリオ1-ci失敗--テンプレート逸脱)
- [シナリオ2: gh/gitワークアラウンド](#シナリオ2-ghgitワークアラウンド)
- [学び抽出から通知までの手順](#学び抽出から通知までの手順)
- [Tips](#tips)
- [pipeline 全体像（capture → promote）](#pipeline-全体像capture--promote)

## 主な捕捉対象

以下の事象を主な捕捉対象とする（これらに限定されない）:

| カテゴリ | 説明 | 例 |
|---|---|---|
| **CI失敗の根本原因** | CI/CDパイプラインでの失敗とその原因 | lint設定不備、テスト環境差異、依存関係エラー |
| **テンプレート逸脱の修正** | テンプレート、仕様からの逸脱を検知、修正した事例 | Issue本文フォーマットのずれ、コミットメッセージ規約違反 |
| **gh/gitワークアラウンド** | gh CLIやgit操作で標準手順外の対処が必要だった事例 | worktree削除時のforce指定、PR作成時のドラフトフラグ |
| **リオープン原因** | Issue/PRの再オープンを招いた原因 | レビューNG時の対応漏れ、マージ後のデグレ |
| **実装エラーによるcase-update** | 実装中のエラーが原因でIssue更新が必要になった事例 | 仕様変更の発生、スコープ変更の必要 |
| **自律回避、自律修正** | エージェントが自ら問題を回避、修正した事例 | 依存関係の事前検知、設定ミスの自動修正 |

ユーザー確認を伴う問題が発生した場合、エージェントは ADR/REQ/spec への影響可能性を記録する（フィールド7参照）。

---

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
- **予防策候補**: worktree 削除プロシージャに Permission denied 時の待機リトライ（最大3回）を組み込む。ジャンクション環境ではジャンクション削除フォールバック手順を適用
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
- **検知方法**: QG-3 乖離検出（`agentdev-quality-gates` スキル）によるチェック
- **根本原因**: {REQ-ID} 作成時に design-principles.md の既存方針との整合性確認が漏れていた
- **自律対応内容**: 矛盾点を整理し、ユーザーに確認して{REQ-ID} の該当セクションを修正
- **ユーザー確認有無**: あり
- **ADR/REQ/spec影響**: {REQ-ID} 該当セクションの更新が必要。retired {ADR-ID}（現在は Design で規定済みの内容）の内容についても検討すべき
- **横展開観点**: REQ作成時は常に既存specs/ADRとの整合性確認を必須とすべき
- **再発条件**: 新規REQ作成時に既存ドキュメントとの整合性チェックをスキップする場合
- **予防策候補**: req-save の実行ステップに specs/ADR 整合性チェックを追加する
- **想定反映先**: `req-save` コマンド、`agentdev-req-analysis` スキル
- **関連**: `docs/requirements/{REQ-ID}.md`, design-principles Design, Issue #{issue_number}
- **タグ**: `#仕様矛盾` `#REQ更新` `#ADR影響`
```

### Step 3: ユーザー通知

> 実装中に仕様矛盾を発見し、学びを `.agentdev/learning/inbox.md` に追加しました：
>
> （全13フィールド表示）

---

## 全パイプライン実例（3層フロー全体）

### Layer 1: Capture フェーズ（学びの記録）

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

### Layer 2: Analysis フェーズ（意味的分類と整理）

```
/agentdev/learning-promote
```

→ 実行内容（内部分析フェーズ）:
 - inbox.md + deferred.md のエントリを問題クラス分類（根本原因+再発条件+予防策が同じ単位）
 - 8軸評価スコアを算出し evaluation-report.md を生成
 - （任意）deferred.md の古い単発レアケースを prune
 - ユーザー承認後、inbox.md の全エントリを deferred.md（生きている learning プール）に移動
 - inbox.md をクリア

### Layer 3: Promotion フェーズ（昇華判定とスタブ生成）

→ 実行内容（昇華判定フェーズ、引き続き learning-promote 内）:
  - evaluation-report.md の問題クラスを主入力として分析
  - 各クラスタを7処分区分 + duplicate で判定
  - 既存の恒久契約、知識、配布物に同種対策が存在するか照合
  - ユーザー承認後、staging領域にスタブファイルを生成（7つの必須フィールド）
  - staged/rejected/duplicate エントリを deferred.md から promote 時 prune

## 学び抽出から通知までの手順

### Step 1: 学びの検知（エージェント主体）

問題解決後、**エージェントが**以下を自問し、自ら学びの有無を判断する:

1. **エージェントが自律的に検知、回避、修正した問題はなかったか？**
2. **CI失敗、テンプレート逸脱、ワークアラウンド等が発生しなかったか？**
3. **ユーザー確認を伴う問題が発生し、ADR/REQ/spec影響はないか？**
4. **将来同じ問題に遭遇したら、どうすれば防げるか？**
5. **他の開発者にも共有すべき知見か？**

学びがないと判断した場合は、ユーザーに何も問わず次へ進む。

### Step 2: 学びの抽出（エージェント主体）

学びがあると**エージェントが判断**した場合、**エージェントが**基準テンプレート（`references/capture-entry-template.md`）に従って13フィールド形式でエントリを生成する。
全13フィールドを必ず含めること。
エージェントは推論でフォーマットを組み立てず、基準テンプレートから取得すること。

### Step 3: 学びの通知

**エージェントが**抽出した学びを `.agentdev/learning/inbox.md` に追記した後、追記内容をユーザーに通知する。承認や却下は求めない:

> 以下の学びを `.agentdev/learning/inbox.md` に追加しました：
>
> [13フィールド形式の学びエントリを表示]

学びの追加は通知前に実行される。
ユーザー承認を待たずに直接追記する。

### Step 5: 閾値チェック

inbox.mdのエントリ数（`## ` で始まる行）をカウントする。15件以上の場合、以下を提案する:

> inbox.mdが{N}件になっています。
> `/agentdev/learning-promote` で分析することを推奨します。

## Tips

1. **実観測ベース**（実際に検知、回避、修正した問題のみを抽出する。推測のみのエントリは保存しない。品質判断は下流に任せる）
2. **タイミングを逃さない**（問題解決直後に記録するのが最も効果的）
3. **13フィールドを完備**（全フィールドを埋めることで下流の分析精度が向上する）
4. **ADR/REQ/spec影響を見逃さない**（ユーザー確認「あり」の場合は特に注意深く評価）
5. **ユーザーへの通知は行うが承認は求めない**（学びの内容は通知するが、承認や却下は求めない）
6. **inbox.mdが溜まったら**（15件以上で `/agentdev/learning-promote` を提案）

