---
name: agentdev-workflow-orchestration
description: case-run の状態機械・Wave scheduling・サブエージェント protocol・self-healing loop・CI 対応 loop・Epic Orchestrator モードの知識ベース。USE FOR: case-run の多重Issue依存関係分析、Wave構成、再開ポイント判定、自律修正ループ判定、集約完了報告、Epic検出・Wave解析・subagent起動・障害伝播。DO NOT USE FOR: 単一Issue の基本的な Step 実行手順（case-run コマンド定義を参照）、Pattern 判定（agentdev-workflow-lifecycle を参照）、乖離検出（agentdev-spec-compliance を参照）、完了報告フォーマット（agentdev-workflow-reporting を参照）
---

# case-run Orchestration Knowledge Base

case-run コマンドのオーケストレーション知識ベース。状態機械・依存関係分析・Wave scheduling・サブエージェント protocol・self-healing loop・CI loop・エラー回復・集約完了報告の判定基準と詳細構造を提供する。

## 状態機械

case-run は単一Issueモード、多重Issueモード、Epic Orchestratorモードの3つの実行モードを持つ。

### モード分岐

| 条件 | モード |
|------|--------|
| 有効Issue = 1件、かつ Epic Orchestrator 非検出 | 単一Issueパス（Steps 1-12 を順次実行） |
| 有効Issue = 1件、かつ Epic 検出（`epic` ラベル OR `## 実行順序` + Wave テーブル） | Epic Orchestrator モード（Wave順次実行） |
| 有効Issue ≥ 2件、かつ ≤ 5件 | 多重Issueモード（Step 0b→0c→Wave実行）。入力上限 = 5件/case-run呼出 |

### フェーズ構成

| フェーズ | Steps | 再開条件 |
|----------|-------|----------|
| 準備フェーズ | 1-5 | worktree+ブランチが存在しない |
| 実装フェーズ | 6-7 | work planが未完了 または チェックボックス未完了 |
| 提出フェーズ | 8-12 | PRが未作成 |

## Epic Orchestrator モード

Epic Issue を入力とした場合の Orchestrator 実行モード。Epic 本文の Wave テーブルを実行順序 SSoT として読み取り、子 Issue を subagent に渡して実行する（REQ-0106 ~ 018, ADR-0006）。

### Epic検出ルール

| 条件 | 結果 |
|------|------|
| Issue に `epic` ラベルが付与されている | Epic Orchestrator モード |
| Issue 本文に `## 実行順序` セクションがあり、`Wave` 列を持つ Markdown テーブルが存在する | Epic Orchestrator モード |
| 上記いずれにも該当しない | 既存の単一 Issue または多重 Issue モード（変更なし） |

### Wave解析プロトコル

1. Epic Issue 本文の `## 実行順序` セクションを特定
2. Wave テーブルを抽出: 列構成 `Wave / Issue / 実行方法 / 前提`
3. Wave 番号でグルーピングし、各 Wave に属する子 Issue を抽出
4. バリデーション:
   - 前提列に記載された Wave より前に後続 Wave の Issue を実行してはならない（REQ-0106）
    - Epic Wave分割上限: 1 Wave内の同時実行子Issue上限は5件（REQ-0106）。超過時はWaveを分割
    - 依存関係分析で安全側の直列化が必要と判断した場合はWaveをさらに分割してよい（REQ-0106）

### Epic Orchestrator 実行フロー

1. **Epic 本文読み取り**: `gh issue view {epic_N}` で Epic Issue 本文を取得
2. **Wave テーブル解析**: 上記「Wave解析プロトコル」に従い子 Issue を抽出
3. **Wave 順次実行**（Wave 番号昇順）:
   a. **Epic ステータス一括更新**: 該当 Wave 内の全子 Issue の Epic ステータスを `☐ 未着手` → `🔄 進行中` に一括更新（親エージェント責務、`agentdev-epic-tracker` 準拠）（REQ-0106）
   b. **subagent 起動**: 各子 Issue についてサブエージェント実行プロトコルに従い subagent を起動（REQ-0106）
   c. **Wave 完了待機**: `background_output` で同一 Wave 内の全 subagent 完了を待機
   d. **結果集約**: 子 Issue ごとに成功/失敗を判定
   e. **後続 Wave 制御**: 失敗影響を評価し後続 Wave の実行可否を判定（後述「Wave失敗時後続制御」）
4. **全 Wave 完了後**:
   - specs 更新（親エージェントのみ、直列実行）（REQ-0106）
   - Epic Orchestrator 集約完了報告を出力

### メインセッション責務（Orchestrator責務限定）

Epic Orchestrator モードのメインセッションは以下に限定し、子 Issue 個別の実装詳細を抱え込まない（REQ-0106）:

1. Epic 本文の読み取り
2. Wave 順序の解釈
3. 子 Issue の subagent 起動
4. Wave 完了待機
5. 子 Issue の成功・失敗集約
6. Epic ステータス更新
7. specs 更新が必要な場合の直列処理
8. 集約完了報告

### Wave失敗時後続制御

Wave 完了後、失敗した子 Issue と後続 Wave の関係を評価し後続制御を決定する（REQ-0106, 015, 016）:

| 条件 | アクション |
|------|-----------|
| 兄弟 Issue が失敗 | 同一 Wave 内の他 Issue は継続（ブロックしない）（REQ-0106） |
| 後続 Wave が失敗 Issue に依存しない | 後続 Wave を継続（REQ-0106-(1)） |
| 後続 Wave が失敗 Issue に依存する | 該当 Wave をスキップ（REQ-0106-(2)） |
| 依存有無が判定不能 | 安全側: 該当 Wave をスキップ（REQ-0106-(3)） |
| 全 Issue が失敗 | 後続 Wave を実行せず集約失敗報告で停止（REQ-0106） |

### 再開ポイント（Epic Orchestrator再実行時）

Epic Orchestrator 再実行時の再開ルール（REQ-0106, 018）:

- Wave 1 から全 Wave を再評価する（REQ-0106）
- 各子 Issue は既存 case-run のべき等性に従いスキップ・再開・新規実行:
  - worktree 存在 → 準備フェーズ完了
  - worktree 内コミット + チェックボックス全完了 → 実装フェーズ完了
  - PR 既存 → 提出フェーズ完了
- Epic 本文のステータス追跡テーブルは補助情報として参照してよいが、主判定は各子 Issue の実成果物（worktree・コミット・PR・Issue 状態）に基づく（REQ-0106）

### Epic Orchestrator集約完了報告フォーマット

共通必須フィールド（完了コマンド・対象・結果・検証結果・git 永続化・次のコマンド）に準拠し、`結果` フィールド内に Wave / Issue / 状態 / PR / 備考 のテーブルを配置する（REQ-0107）。

```
✅ case-run 完了（Epic Orchestrator）

完了コマンド: /agentdev/case-run
対象: Epic #{epic_N}
結果:
  | Wave | Issue | 状態 | PR | 備考 |
  |------|-------|------|----|----|
  | 1 | #{child1_N} | ✅ 完了 | #{pr1_N} | — |
  | 2 | #{child2_N} | ✅ 完了 | #{pr2_N} | — |

  成功: {success_count}件 / 失敗: {fail_count}件 / スキップ: {skip_count}件
検証結果: ✅ OK
git 永続化: 該当なし（specs更新は別Step）
次のコマンド: レビュー通過後: /agentdev/case-close
```

**部分失敗時** は先頭を `⚠️` に変更し、失敗・スキップのIssue行を反映。
**全件失敗時** は先頭を `❌` に変更し、`検証結果: ❌ NG` とする。

#### フォーマット共通ルール

- 6-field 構造（完了コマンド・対象・結果・検証結果・git 永続化・次のコマンド）を全ケースで維持する
- Wave / Issue / 状態 / PR / 備考 のテーブルは `結果` フィールド内に配置する（REQ-0107）
- 成功・部分成功・全件失敗のいずれでも同じフィールド構造を使用する

### Epic Orchestrator固有エラー

| エラー | 対応 |
|--------|------|
| Wave テーブル不存在 | 通常の単一 Issue モードにフォールバック |
| 子 Issue 番号無効 | 該当 Issue をスキップ、警告表示 |
| 1 Wave 内子 Issue > 5件 | Wave を自動分割 |
| 全 Wave 全 Issue 失敗 | 集約失敗報告で停止 |
| Epic 本文読み取り失敗 | エラー報告して停止 |

## 再開ポイント検出

実行再開時に既存成果物を確認し、どこから再開すべきかを判定する。

### 成果物チェック順序（単一Issueパス）

以下の順序で判定し、最初に該当したフェーズの次から再開:

1. **(a) worktree存在 + ブランチ切り替え済み** → 準備フェーズ完了
2. **(b) worktree内コミットあり + チェックボックス全完了** → 実装フェーズ完了
3. **(c) PR既存**（`gh pr list --head <branch>`）→ 提出フェーズ完了
4. **(d) 上記いずれも該当しない** → 準備フェーズから開始

### べき等性ルール

- 各フェーズは独立して再実行可能
- フェーズ境界が再開ポイントとなる
- 既存成果物は再利用（再作成しない）
- セッション途切れ時はStep 0のフェーズ判定が自動的に再開ポイントを特定

## 依存関係分析（多重Issueモード）

有効な各Issueの本文・タイトル・ラベルを読み込み、依存レベルを判定する。

### 依存レベル分類

| レベル | 名称 | 定義 | 実行方法 |
|--------|------|------|----------|
| L0 | 完全独立 | 共通ファイルなし、specs更新なし、他Issueへの参照なし | 並列実行 |
| L1 | Specs共有 | 複数のPattern Bが同じspecsセクションを更新する可能性あり | 並列実行（specs更新は直列） |
| L2 | ファイル衝突 | 変更予定ファイルに重複あり | Wave分離（同一Wave並列不可） |
| L3 | 明示的依存 | Issue本文に「#N に依存」「#N の後に実行」等の明示的記述あり | 順次実行 |

### 判定方法

LLM意味解析（Issue本文の関係性を読み取る）+ 正規表現補助（`#N` パターン検出）。

### 結果出力

依存関係テーブルを実行前に表示し、監査性を確保する:

```
| Issue | Pattern | Level | Depends On | Wave |
|-------|---------|-------|------------|------|
| #74   | A       | L0    | —          | 1    |
| #46   | A       | L0    | —          | 1    |
| #54   | B       | L3    | #50        | 2    |
```

**実行方針**: ユーザーの承認を待たずに自律実行を開始する。曖昧な依存判定がある場合はより直列寄りのWave構成を採用する。

## Wave スケジューリング

依存関係テーブルに基づきWaveを構成する。

### Wave構成ルール

| Wave | 対象Issue | 実行方法 |
|------|-----------|----------|
| Wave 1 | L0 + L1 Issues | 並列実行（L1はspecs更新を直列） |
| Wave 2+ | L2 Issues（1件ずつ別Waveに分離）+ L3 Issues（順次実行） | 直列 |
| Wave 3, 4... | 必要に応じて追加 | — |

### 実行順序

- 各Wave内のIssuesはサブエージェントで並列実行
- 各Wave間は直列（前Wave完了後に次Wave開始）

## サブエージェント実行プロトコル

### 起動仕様

親エージェントが以下の形式でサブエージェントを起動:

```
task(category="unspecified-high", load_skills=[], run_in_background=true, prompt="...")
```

### プロンプト構成

サブエージェントのプロンプトに以下を含める:

- Issue番号
- 実行指示: 「準備フェーズ (Steps 1-5) + 実装フェーズ (Steps 6-7) + 提出フェーズ (Steps 8-9, Steps 11a-11c) を実行し、実装・乖離検出・ローカル検証・PR作成・デプロイ検証まで完了せよ」
- worktreeパス（`.worktrees/{N}-{type}`）
- `workdir` パラメータでworktree絶対パスを指定
- specs更新（Step 10）は実行禁止の明示
- **Finding 記録指示**（REQ-0106）: 本筋外 Finding（intake 候補・learning 候補）を必ず PR 本文の `## Findings / Intake候補` セクションに記録すること。各項目に発見元・内容・分類（intake/learning）を含めること。`.agentdev/intake/inbox/` の直接変更は禁止。Finding がない場合は「該当なし」とすること

### 親エージェント責務

- **Wave開始前のEpicステータス一括更新**: 各Wave開始前に、該当Wave内の全子Issueの親Epicステータスを一括更新（`agentdev-epic-tracker` スキル参照）。サブエージェントによる同時更新の競合を回避するため親エージェントが一括処理
- **全サブエージェント完了待機**: `background_output` で待機
- **specs直列更新**: Step 10 のspecs更新は親エージェントのみ実行（サブエージェントはspecs更新禁止）
- **Findings / Intake候補件数の集約**（REQ-0106, SHOULD）: 全サブエージェント完了後、各子Issue PRの `## Findings / Intake候補` セクションから記録された Finding 件数を集約し、集約完了報告に含めること

### フォールバック

サブエージェントが使用できない場合、Sequential Wave（親エージェントがWave内でIssueを1件ずつ順次処理）に切り替え。

### 失敗Issue処理

失敗したIssueはスキップし、成功Issueのみ次フェーズへ進める。失敗Issueは兄弟Issueの実行をブロックしない。

## Self-Healing Loop

Step 11a（ローカル検証）と Step 11c（デプロイ検証）で、検証失敗時に実装フェーズ（Step 6）へループバックし自律的に修正を試みる。11a と 11c のカウントは独立管理。

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

### デプロイ検証（Step 11c）ポーリング動作

| CI状態 | 対応 |
|--------|------|
| Pending / In-progress | 60秒間隔で再確認、最大10分間待機 |
| 全チェック success | デプロイ検証成功、Step 12へ |
| ビルド失敗（failed） | 実装フェーズ（Step 6）へループバックし自律修正 |
| Cancelled | Failure扱い（実装フェーズへループバック） |
| No CI configured（checks返却なし） | Warning付きでpass（Step 12へ） |
| CIポーリング不可（実行環境制限・権限不足・ネットワーク不通等でCI状態取得APIが利用できない場合） | 現在の状態を報告して停止（ポーリングのハング・推測は禁止）。ユーザーにCI結果の手動確認を促す |

### CI自律修正ルール

CI/CD失敗を検出した場合、実装フェーズ（Step 6）へループバックし自律的に修正。修正後は11a〜11cを再実行。停止条件はSelf-Healing Loopと同一の7項目を適用。

## エラー回復マップ

### フェーズ別エラー対応

| エラー発生フェーズ | 再開ポイント | 復旧アクション |
|---|---|---|
| 準備フェーズ（Step 1-5） | 準備フェーズの先頭 | Step 0から再判定 |
| 実装フェーズ（Step 6-7） | 実装フェーズのStep 6 | planファイルが残っていれば未完了タスクから再開 |
| 提出フェーズ Step 11a ローカル検証失敗 | 実装フェーズのStep 6 | 自律修正ループ（最大3回）。既存要件範囲内の修正のみ。3回超過時は停止・ユーザー報告 |
| 提出フェーズ Step 11c デプロイ検証失敗 | 実装フェーズのStep 6 | 自律修正ループ（最大3回）。CI失敗原因に基づく修正後11a〜11c再実行。3回超過時は停止・ユーザー報告 |
| 提出フェーズ（Step 8-12） | 提出フェーズのStep 8 | 乖離検出から再実行 |

### 多重Issueモード固有エラー

| エラー | 対応 |
|---|---|
| 多重Issue入力上限超過（> 5件） | 拒否してユーザーに通知。※ Epic Wave分割上限（1 Wave内5件）とは独立した入力制限 |
| 有効Issues = 0 | 中止してユーザーに通知 |
| 依存分析でエラー | ユーザーに手動指定を促す |
| サブエージェント失敗 | 該当Issueをスキップ、他は継続 |
| specs更新競合 | 昇順で処理、マージで解決 |
| 全Wave失敗 | 集約レポートで全件失敗を報告 |

## Specs更新直列化（多重Issueモード）

### ルール

- **親エージェントのみ**が実行。サブエージェントはspecs更新を行わない
- Pattern BのIssueについて、1件ずつ順に `system.md` / `patterns.md` を更新
- 順序: Issue番号の昇順（小さい番号から先に更新）
- 同一セクションの競合がある場合はマージ（既存内容を保持しつつ新規内容を追加）

## 集約完了報告

### 多重Issueモード報告フォーマット

```
## 並列実行結果（N Issues）

| Issue | Pattern | 状態 | PR | 備考 |
|-------|---------|------|----|----|
| #74   | A       | ✅ 完了 | #123 | — |
| #46   | A       | ✅ 完了 | #124 | — |
| #54   | B       | ❌ 失敗 | — | 実装フェーズでエラー |
| #48   | B       | ✅ 完了 | #125 | specs更新済み |

**成功**: 3件 / **失敗**: 1件 / **スキップ**: 0件
```

### L2 マージ順序と共通ファイル方針

L2（ファイル衝突）を検知した場合:

- **マージ順序**: Issue番号の昇順をデフォルト。先にマージされるPRの変更をbaseとし、後続PRはその変更を取り込んでからマージ
- **共通ファイル方針**: サブエージェントのプロンプトに共通ファイルの変更方針を統一する指示を含め、マージ時の競合リスクを最小化

## 参照

- **case-run コマンド**: `.opencode/commands/agentdev/case-run.md`（実行手順）
- **agentdev-workflow-lifecycle**: Pattern判定基準・フェーズ定義
- **agentdev-workflow-reporting**: 単一Issue完了報告フォーマット
- **agentdev-spec-compliance**: 乖離検出
- **ADR-0002**: Orchestration skill作成基準
- **ADR-0006**: Epic Issue 本文を実行順序 SSoT とする設計
- **agentdev-epic-tracker**: Epic ステータス追跡プロトコル
