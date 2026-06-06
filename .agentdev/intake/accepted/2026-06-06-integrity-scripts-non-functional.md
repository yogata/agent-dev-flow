# 整合性スクリプト非機能（integrity-rule-gap）

## 観測
integrity-check 実行時に、3本の整合性スクリプトがすべて実行不能であることを検出:

| スクリプト | サイズ | 状態 |
|-----------|--------|------|
| `check_integrity.ts` | 126 KB (1行) | 単一行化・パース不能 |
| `check_templates.ts` | 13 KB (1行) | 単一行化・文字化け（日本語） |
| `lint_skills.ts` | 8.7 KB (1行) | 単一行化・パース不能 |

- `bun` / `npx tsx` とも `Unexpected end of file` または文字化けエラーで失敗
- HEAD にそのままコミットされている（ローカル diff なし）
- 最終変更コミット: `e32b935 feat: separate integrity-check into /repo/* namespace (#611)`

## 今回扱わない理由
integrity-check の読み取り専用制約により、検出のみを実施。

## 影響
- `/repo/integrity-check` コマンドの自動検査がすべて実行不能
- スクリプト復元または再実装が必要
- 復元元: git history の `e32b935` 以前のコミットに正常版が存在する可能性

## レビューで決めること
- `e32b935` 以前のコミットから正常版を復元するか、スクラッチで再実装するか
- エンコーディング破損の原因（ビルドパイプライン、commit 時の変換等）を調査するか
- 再発防止策（pre-commit hook、CI check）を導入するか

## 根拠
- integrity-check カテゴリ: Integrity script 非機能
- 分類: `integrity-rule-gap`
- ルート: `intake+learning`
- 検出元: `.agentdev/integrity/reports/2026-06-06-integrity-report.md`