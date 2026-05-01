# Decision Log 技術判断記録

## 概要

ADR閾値未満の技術判断のトレーサビリティ管理。単一モジュール内の実装選択、一時的な回避策、可逆な決定を対象とし、要件→決定→実装の完全な追跡チェーンを提供する。

## 決定エントリの構造

個別の技術判断は `decisions/DEC-XXX-slug.md` 形式のファイルに記録します。

### YAML Frontmatter

```yaml
---
id: DEC-NNN-slug           # 一意なID（例: DEC-001-auth-strategy）
status: proposed           # proposed | accepted | implemented | superseded
date: 2024-01-15           # ISO 8601形式
requirements:
  - doc-requirement#non-functional-security  # 要件docのセクション参照
issues:
  - 123                    # 関連Issue番号の配列
supersedes:                # 省略可。置き換え元DEC ID
  - DEC-001
implemented_by:            # 実装後に追加。PR番号
  - 456
---
```

### Markdown Body Sections

- **Context**: なぜこの決定が必要か（背景・課題・前提条件）
- **Decision**: 決定内容（具体的な技術選択・方針・実装アプローチ）
- **Rationale**: 理由（なぜこの選択か、代替案と比較した場合のメリット）
- **Consequences**: 影響範囲（メリット・デメリット・制約・依存関係）

## インデックス管理

`decisions/index.md` は全決定エントリの目次として機能します。

### 役割

- 全決定エントリの一覧表示
- Status別のグループ化
- supersedes 関係の可視化
- 要件追跡のエントリーポイント

### 更新タイミング

- 決定エントリの新規作成時
- 決定エントリの status 変更時
- supersedes 関係の更新時

### フォーマット

```markdown
# Decision Log Index

## Accepted

| ID | Title | Status | Date |
|----|-------|--------|------|
| [DEC-001](decisions/DEC-001-auth-strategy.md) | 認証戦略の選定 | accepted | 2024-01-15 |

## Implemented

| ID | Title | Status | Date | Implemented By |
|----|-------|--------|------|----------------|
| [DEC-001](decisions/DEC-001-auth-strategy.md) | 認証戦略の選定 | implemented | 2024-01-15 | PR #456 |
```

## ライフサイクル

決定エントリの状態遷移は以下の通りです。

### 状態定義

1. **proposed**
   - 壁打ちフェーズで提案中
   - ①バイブス壁打ちフェーズで作成
   - チーム内でのレビュー待ち

2. **accepted**
   - Issue作成時に承認
   - 要件確定・Issue作成時に status を変更
   - 実装のゴールとして確定

3. **implemented**
   - PR merge後に実装済み
   - PRマージ・完了処理時に status を変更
   - `implemented_by` フィールドにPR番号を追加

4. **superseded**
   - 新決定で無効化
   - 新DEC作成時に旧DECを更新
   - `supersedes` 連鎖で履歴を維持

### 状態遷移図

```
proposed → accepted → implemented
                         ↓
                    superseded (by new DEC)
```

## ADR境界

ADRが必要な判断とDecision Logで十分な判断の境界を明確にします。

### ADRが必要なケース

アーキテクチャ全体に影響、複数システムに跨る決定、長期間（6ヶ月以上）有効な決定、取り返しがつかない変更が含まれる場合。

**判定基準:**
- システム全体の構造に影響を与えるか？
- 技術スタックの選択（言語、フレームワーク、ミドルウェア）に関わるか？
- データモデル、認証・認可、セキュリティ設計に影響するか？
- 将来の開発や運用に長期的な影響を与えるか？
- 逆転が困難か（コストが高い）？

### Decision Logで十分なケース

単一モジュール内の実装選択、一時的な回避策、明らかに可逆な決定。

**例:**
- 特定コンポーネントのライブラリ選択
- 一時的なバグ回避策
- 明らかに可逆な設定変更
- 既存アーキテクチャ内での実装詳細

### 境界判定

境界が曖昧な場合は `adr-guidelines` スキルを参照し、ADR作成の必要性を評価してください。

## 要件との紐付け

`requirements` フィールドによる要件追跡チェーンを確立します。

### 追跡チェーン

```
要件ドキュメント → 決定エントリ → 実装（PR） → マージ（Issue close）
    ↓                 ↓              ↓              ↓
  doc-...       DEC-XXX       implemented_by  issues
```

### 順方向: 要件 → 決定

- `requirements` フィールドに要件docのセクション参照を記載
- 複数の要件に関連する場合は配列形式で記載
- 形式: `doc-requirement#non-functional-security`

### 逆方向: 決定 → 実装

- `implemented_by` フィールドにPR番号を記載
- `issues` フィールドに関連Issue番号を記載
- Issue作成時に決定エントリをリンク

## supersedes連鎖

決定が覆った場合の管理ルールを定義します。

### 基本ルール

1. **旧DECの更新**
   - `status` を `superseded` に変更
   - なぜ置き換えられたかを Consequences に追記

2. **新DECの作成**
   - `supersedes` フィールドに旧DEC IDを記載
   - Context でなぜ置き換える必要が生じたかを説明

3. **連鎖の可視化**
   - index.md で supersedes 関係を表示
   - 必要に応じて置き換え履歴を追跡

### 例

**旧DEC-001:**
```yaml
id: DEC-001-auth-strategy
status: superseded
supersedes: []
```

**新DEC-002:**
```yaml
id: DEC-002-auth-strategy-v2
status: accepted
supersedes:
  - DEC-001
```

**index.md:**
```markdown
| ID | Title | Status | Supersedes |
|----|-------|--------|------------|
| DEC-002 | 認証戦略v2 | accepted | DEC-001 |
| DEC-001 | 認証戦略 | superseded | - |
```
