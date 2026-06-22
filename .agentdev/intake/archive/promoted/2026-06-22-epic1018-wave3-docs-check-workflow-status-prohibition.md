# workflow-status-prohibition: 6状態否定表現の残存

## 経緯

OU-002 Wave 3 (#1021 / PR #1025) の横断検出過程で、`/repo/docs-check` の事前存在 NG findings に `workflow-status-prohibition` カテゴリの違反が含まれていた。本 Wave の constraint により未修正。PR #1025 Findings に列挙されたが、case-close での intake 化が漏れていたため、事後収集する。

## 影響

- REQ-0112 で廃止された 6 状態否定表現（ workflows/statuses で "not X" 形式の状態を発明しないという制約）に違反する記述が現行文書に残存している可能性がある。
- ワークフロー状態モデルの一意性が損なわれる。
- `/repo/docs-check` が継続して NG を報告し続ける。

## レビューで決めること

- `workflow-status-prohibition` 違反の該当ファイル・箇所を特定し、肯定文での状態記述に書き直すか。
- 機械判定ルールの検出パターンと exemption 条件を見直す必要があるか。

## 根拠

- PR #1025 Findings: https://github.com/yogata/agent-dev-flow/pull/1025
- 違反基準: REQ-0112（6状態否定表現の禁止）
- 来源: OU-002 Wave 3 横断検出の事前存在 NG（本パイプライン由来ではない）
- 関連 Epic: OU-002 #1018 Wave 3
