# Self-Healing Loop・CI 対応 Loop・エラー回復

## Self-Healing Loop

ローカル検証サブステップとデプロイ検証サブステップで、検証失敗時に実装フェーズへループバックし自律的に修正を試みる。ローカル検証とデプロイ検証のカウントは独立管理。

### 共通ルール

| 項目 | 内容 |
|------|------|
| 最大試行回数 | 3回（11a/11c それぞれ独立） |
| 修正範囲 | 既存要件範囲内の実装・テスト・設定不備に限定 |
| 禁止事項 | 要件変更・仕様判断・スコープ変更を伴う修正 |

### 停止条件

以下のいずれかに該当する場合は即座に停止しユーザーに報告:

- **(a)** 要件・仕様・スコープの変更が必要
- **(b)** REQ・ADR・specsの変更判断が必要
- **(c)** 修正が既存仕様から逸脱する
- **(d)** 破壊的変更が必要
- **(e)** 外部サービス・CI環境・権限・Secretsの不足が原因
- **(f)** flakyテストと判別不能
- **(g)** 3回上限の超過

### テスト期待値の取り扱い

テストが間違っていると自律的に判断できる場合のみ修正対象。判別不能な場合は停止条件に該当。

### 3回超過時の報告内容

失敗項目一覧、エラーログ要約、各試行で実施した修正内容、原因候補、停止の判断理由。

## CI / Review 対応 Loop

### デプロイ検証ポーリング動作

| CI状態 | 対応 |
|--------|------|
| Pending / In-progress | 60秒間隔で再確認、最大10分間待機 |
| 全チェック success | デプロイ検証成功、完了ステップへ |
| ビルド失敗（failed） | 実装フェーズへループバックし自律修正 |
| Cancelled | Failure扱い（実装フェーズへループバック） |
| No CI configured（checks返却なし） | Warning付きでpass（完了ステップへ） |
| CIポーリング不可 | 現在の状態を報告して停止。ユーザーにCI結果の手動確認を促す |

### CI自律修正ルール

CI/CD失敗を検出した場合、実装フェーズへループバックし自律的に修正。修正後はローカル検証〜デプロイ検証を再実行。停止条件はSelf-Healing Loopと同一の7項目を適用。

## エラー回復マップ

### フェーズ別エラー対応

| エラー発生フェーズ | 再開ポイント | 復旧アクション |
|---|---|---|
| 準備フェーズ | 準備フェーズの先頭 | フェーズ判定から再判定 |
| 実装フェーズ | 実装フェーズの先頭 | planファイルが残っていれば未完了タスクから再開 |
| 提出フェーズ・ローカル検証 | 実装フェーズ | 自律修正ループ（最大3回） |
| 提出フェーズ・デプロイ検証 | 実装フェーズ | 自律修正ループ（最大3回） |
| 提出フェーズ | 提出フェーズ・乖離検出 | 乖離検出から再実行 |

### 多重Issueモード固有エラー

| エラー | 対応 |
|---|---|
| 多重Issue入力上限超過（> 5件） | 拒否してユーザーに通知 |
| 有効Issues = 0 | 中止してユーザーに通知 |
| 依存分析でエラー | ユーザーに手動指定を促す |
| サブエージェント失敗 | 該当Issueをスキップ、他は継続 |
| specs更新競合 | 昇順で処理、マージで解決 |
| 全Wave失敗 | 集約レポートで全件失敗を報告 |

### worktree 環境での `source-projection-sync` 失敗（Windows + junction 環境固有）

整合性検査（`check_integrity.ts`）を worktree（`.worktrees/{N}`）内で実行した際、`source-projection-sync`（IR-016）が失敗する既知のパターン。

| 項目 | 内容 |
|------|------|
| 発生条件 | worktree 内で整合性検査を実行し、`source-projection-sync` が「projection 側不存在」で失敗 |
| 原因 | メインリポジトリで作成された `.opencode/` 配下の junction link が worktree へ伝播していない。worktree は独立した作業ディレクトリであり、reparse point は複製されない |
| 対処 | junction を再作成してから整合性検査を再実行する。再作成手順は README の Install/Update 手順（self-hosting repo: `scripts/sync-self-opencode.ps1 -Mode apply`、consumer repo: `scripts/install-consumer-opencode.ps1 -Mode apply`）に準拠。本スキルで新規手順は定義しない |
| 環境 | Windows + junction 環境固有。Unix symlink 環境では発生しない |
| フォールバックの限界 | `resolvePathWithFallback`（REQ-0108-189）は runtime projection 不在時に `src/opencode/` 原本へ読み取りをフォールバックするが、source/projection 双方向の存在比較を要する `source-projection-sync` までは解決しない。broken junction 検出ゲート（REQ-0108-173）も同様に worktree 内の junction 状態に依存する |
| Self-Healing 対象外 | junction 再作成は環境固有の作業であり要件・仕様の修正ではないため、Self-Healing Loop の対象外。ユーザーへ状況と再作成手順への誘導を報告する |

## マージコンフリクト予防

Wave 並列実行時のマージコンフリクトを予防するガイダンス。

### 予防策

1. **非重複の確認**: 各 Wave の開始前に、その Wave 内の Issue のファイル変更範囲が重複していないことを確認する
2. **順次 Wave の設計**: 依存関係のある Issue は同じ Wave に配置せず、前の Wave の完了を待つ
3. **base branch の更新**: 各 Wave 開始時に base branch を pull して最新の状態にする
4. **コンフリクト検出時**: PR 作成時にコンフリクトが検出された場合、以下の対応を行う:
   - 前の Wave の PR がマージ済みであれば rebase して解決
   - 解決不能な場合は停止してユーザーに報告

### コンフリクト解消の制約

- 自動的な force push は禁止
- コンフリクト解消で要件や仕様の意図を変えてはならない
- 解消後はローカル検証を再実行する

## Merge Conflict 対応パターン

### Wave並列実行時のmerge conflict事前防止・事後対応

#### 1. Wave間でのファイル重複リスク評価

Wave並列実行を開始する前に、各Wave内のIssueが変更するファイルの重複を評価する:

**評価手順**:
1. 各Wave内のIssueの変更予定ファイルをリスト化（specs、コード、テスト等）
2. Wave間のファイル重複をチェック
3. 重複がある場合のリスクを判定

**リスク判定基準**:

| 重複状況 | リスクレベル | 対応 |
|----------|-------------|------|
| 同一ファイルの異なる行範囲 | 低 | Wave並列可（conflict発生可能性低） |
| 同一ファイルの同一行範囲 | 高 | Wave直列化（同一Waveに統合） |
| frontmatter共通の設定ファイル | 中 | Wave並列可だが、frontmatter競合リスクを通知 |
| 依存関係のあるファイル（例: モデルとテスト） | 中 | Wave並列可だが、整合性チェックを強化 |

#### 2. conflict発生時のWave再スケジューリング方針

PR作成時やmerge時にconflictが検出された場合:

**即時対応**:
1. 該当Waveの全Issueを停止
2. conflictの詳細を報告
3. ユーザーに解決方法を提示

**再スケジューリングパターン**:

| パターン | 条件 | 再スケジュール方針 |
|----------|------|-------------------|
| 前のWaveのPRがマージ済み | conflictの原因が前のWaveの変更 | 該当Issueをrebaseして再実行 |
| 同一Wave内のconflict | Wave内のIssue間で競合 | Waveを分割して直列化 |
| 他のWaveのPR未マージ | 他のWaveの変更と競合 | 先行するWaveの完了を待ってから再実行 |
| 解決不能なconflict | 要件や仕様の意図が矛盾 | Wave実行を停止して要件調整 |

**報告フォーマット**:
```markdown
## Wave Conflict 検出エラー

**Wave番号**: {wave_number}
**影響Issue**: {affected_issues}
**conflictファイル**: {conflicted_files}
**conflict原因**: {conflict_cause}
**再スケジュール方針**: {reschedule_plan}
**ユーザーアクション**: {user_action}
```

#### 3. self-healing対象外としての明示

Merge conflictはSelf-Healing Loopの対象外とする:

**対象外の理由**:
- conflict解決には要件・仕様の意図判断が必要
- 自動的なforce pushはリスクが高い
- 手動でのconflict解決が推奨される

**対応**:
- conflict検出時は即座に停止
- ユーザーに手動解決を依頼
- 解決後にSelf-Healing Loopを再開可能（ローカル検証から）

**停止条件への追加**:
conflict発生時は、Self-Healing Loopの停止条件に該当するため、即座に停止してユーザーに報告する。

## Wave 境界横断残存参照チェック

Wave 完了ごとに、非推奨コマンド名・旧名前空間参照・陳腐化パス参照が残存していないかを確認する手順。

### チェック対象

| カテゴリ | 例 | 検出方法 |
|----------|------|----------|
| 非推奨コマンド名（廃止済み） | `/issue/*`, `/tips/*`, `issue-*`, `tips-*` | grep（正規表現） |
| 旧名前空間参照（廃止済み） | `reference/`（正: `references/`）, 旧スキル名 | grep |
| 陳腐化パス参照 | 移動済みファイルへの旧パス | grep + ファイル存在確認 |

### 実行タイミング

1. **各 Wave 完了直後** — Wave 境界で実行し、次 Wave 開始前に残存参照を排除
2. **最終 Wave 完了後** — 全体の最終チェックとして実行
3. **トリガー条件**: 以下のいずれかに該当する場合に必須
   - 名前空間変更（namespace change）を含む
   - コマンドの廃止（deprecation）を含む
   - 大規模なリネーム（ファイル名・ディレクトリ名の変更）を含む

### grep スコープ

- **対象範囲**: worktree 全体（`docs/` に限定しない）
- **除外**: `.git/`, `node_modules/`, ランタイムワークスペース配下

### チェック手順

1. Wave 内の変更内容から、非推奨名称・旧パスのリストを抽出
2. worktree 全体を対象に grep で残存参照を検索
3. 検出された残存参照を修正
4. 修正後、再度 grep で残存がないことを確認
5. 結果を集約して Wave 完了報告に含める

### 報告フォーマット

```markdown
## Wave 境界横断残存参照チェック結果

**Wave番号**: {wave_number}
**チェック対象**: {deprecated_names}
**検出件数**: {count}件
**対応**: {fixed_count}件修正, {remaining_count}件残存（理由: {reason}）
```
