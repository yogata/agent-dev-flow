# スキーマ変更時の SELECT 定義確認チェックリスト（実装パターン集追記）

> **注意**: このファイルはこのリポジトリ（staff-schedule）側の対応内容のみを記載している。コマンド側の対応内容は `existing-command-schema-change-checklist.md` を参照。

## 背景

PR #818（REQ-0030: is_active カラム追加）のマージ後、本番環境の `/schedule`、`/today`、`/shops` で Server Components エラーが発生した。`drizzle-schedule.repository.ts` の `STAFF_COLUMNS_FOR_SCHEDULE` に `is_active` が含まれておらず、`transformTodayData.ts` でフォールバックなしで参照していた。repository 層に複数の SELECT 定数が存在する中で一部のみの追加となった。

## 問題

新規カラム追加時、以下の確認が実装パターンとして文書化されていない:

1. **データ変換層のフォールバック確認**: 全変換関数でフォールバック値（`?? true` 等）を統一する必要がある
2. **確認手順のパターン化**: カラム追加時に SELECT 定数確認とフォールバック確認を漏れなく実施する手順が patterns.md にない

## 望ましい変更

1. **docs/specs/patterns.md**: カラム追加時の確認手順（SELECT 定数確認・変換関数フォールバック確認）をパターンとして追加

## 対象範囲

### 対象

- `docs/specs/patterns.md` の実装パターン集

### 対象外

- Drizzle ORM のスキーマ定義自体（ツールの責務）
- マイグレーションファイルの生成（別プロセス）
- コマンド側の改善（→ `existing-command-schema-change-checklist.md` を参照）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| spec | `docs/specs/patterns.md` | カラム追加時の確認手順パターンを追加 |

## 既存対策確認

- **確認結果**: 既存対策あり（fix gap）
- **該当ファイル**: `docs/specs/patterns.md`（SELECT関連記述あり）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: patterns.md に SELECT 関連の記述はあるがカラム追加時の確認手順はなし

## 制約

- 確認手順は汎用的（テーブル名ベースでどのテーブルにも適用可能）
- 既存のパターン集フォーマットに従う
- 本番環境への影響を防ぐため、PR マージ前の確認が必須

## 受け入れ条件

- [ ] docs/specs/patterns.md にカラム追加時の確認手順パターンが追加されている
- [ ] 確認対象に「全 SELECT 定数」「データ変換関数のフォールバック」が含まれている

## 元learning item / 根拠

- **要約**: 新規カラム追加時の repository 層 SELECT 定義確認漏れが本番障害を引き起こした
- **根拠**: PR #818 で `is_active` カラムを追加したが `STAFF_COLUMNS_FOR_SCHEDULE` への追加を見落とし、本番で Server Components エラーが発生（影響度 5/5）
- **再発条件**: 新規カラムを追加する際、repository 層の全 SELECT 定義への追加を確認せずマージした場合
- **横展開可能性**: 複数 SELECT 定数が存在するアーキテクチャで汎用的に発生し得る（横展開性 3/5）

## 推奨Issue分類

- **分類**: feature
- **推奨ラベル**: enhancement, docs
- **関連Issue**: Issue #815, PR #818, Issue #819, PR #820, REQ-0030

## 消費記録

- **Issue**: #839
- **PR**: #840
- **消費日**: 2026-05-29
- **処理**: case-close
