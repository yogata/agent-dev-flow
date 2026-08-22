---
name: agentdev-traceability
description: Provides requirement-artifact traceability (coverage, impact, check) by scanning ADF-COVERS declarations. USE FOR: artifacts covering a requirement, reverse lookup of covered requirements, change re-confirmation candidates via artifact-requirement-artifact hops, declaration integrity checks (malformed declarations, unknown roles or requirement references, verification-scope catalog checks, missing implementation or verification, unavailable evidence). DO NOT USE FOR: document exploration, path search, diagnostics, dependency exploration, index management, semantic coverage inference.
---

# agentdev-traceability

AgentDevFlow 標準配布スキル。
要件と成果物の明示的な対応関係（covers）について、coverage、impact、check の3能力を提供する。
正規成果物を直接走査して対応関係をその場で解決し、派生 Graph を前提としない。

## 原本（SSoT）

本スキルの原本仕様は `agentdev-traceability` Design である。
Design を正規原本とし、SKILL.md は実行入口および skill 固有の補完情報を保持する。
重複または不一致がある場合は Design を正とする。

## 対応宣言の表記

対応宣言は対応する成果物自身が保持し、中央台帳を新設しない。

- 宣言形式: `ADF-COVERS(<role>): <REQ-ID>{, <REQ-ID>}*`（role は design / implementation / verification、REQ-ID は `REQ-{NNNN}-{MMM}` 形式の要件行ID）
- 宣言は各ファイル種別のコメント記法（Markdown は HTML コメント、TypeScript は `//` 等）の内部に1行で記述する
- 1ファイルに複数の宣言行を含められる。解析結果は和集合とする
- 解析は行単位のパターン照合で行い、意味推定を行わない

## Scripts（決定的処理）

`scripts/` 配下の決定的スクリプトが3能力を機械的に実行する。
実装は TypeScript + bun。
解析コア（`lib/`）と CLI（`src/`）を分離しており、外部契約を変えずにキャッシュまたは索引を追加できる構造とする。
ユニットテスト（宣言解析に架空の concrete 要件行ID を使うため配布物に含めない）は producer 側リポジトリの検証スイート（`traceability_*.test.ts`）が担う。

### I/O 契約（共通）

| 項目 | 規約 |
|---|---|
| 入力 | argv（`--root`, `--req`, `--artifact`） |
| 出力 | stdout に JSON |
| エラー | 非ゼロ終了コード + stderr にエラーメッセージ（check は検査 fail ありで終了コード 2） |
| 走査 | `--root` 配下の正規成果物を直接走査（拡張子 `.md` / `.ts`。`.git`、`.agentdev`、`.agentdev-plugin`、`.worktrees`、`node_modules` を除外） |

### 公開操作契約（スクリプト一覧）

| スクリプト | 能力 | 引数 | 出力 JSON の要点 |
|---|---|---|---|
| `src/coverage.ts` | coverage | `--root` + `--req` または `--artifact` | 要件起点: 役割付き対応関係の全件（`relations`, `counts`, `truncated: false`）/ 成果物起点: 当該成果物の対応要件（`relations`, `emptyResult`） |
| `src/impact.ts` | impact | `--root` + `--req` または `--artifact` | 要件起点: 再確認候補 / 成果物起点: `viaRequirements` + `recheckCandidates`。空結果は `emptyResult: true` と `note`（影響なしの証明ではない旨）で明示 |
| `src/check.ts` | check | `--root`（任意: `--req` で完全性検査対象限定、`--artifact` で根拠検査追加） | 7種検査の `checks`（項目ごと pass / fail と findings）と `summary` |

check の7種検査: `malformed-declarations`（形式・構文違反）、`unknown-roles`（未知の成果物役割）、`unknown-req-refs`（存在しない要件への参照）、`invalid-catalog-refs`（検証対応要否カタログの無効なエントリ・参照）、`missing-implementation`（実装対応の欠落）、`missing-verification`（検証対応の欠落。検証対応必須行のみ計上）、`evidence-unavailable`（根拠箇所を取得できない状態）。
Design 対応（design 役割）0件のみを理由に異常としない。
検証対応の要否区分は検証対応要否カタログ（自己ホストリポジトリ内の `verification-scope-catalog.md` の `## 任意行エントリ` 節、要件行ID の列挙または同一REQファイル内の範囲表現）が所有する。check はカタログを既定パスから自動的に読み込み、カタログが存在しない場合（consumer 環境を含む）は全要件行を検証対応必須として扱う（安全側既定）。

### 実行方法

```bash
# coverage: 要件起点
bun .opencode/skills/agentdev-traceability/scripts/src/coverage.ts --root . --req REQ-{NNNN}-{MMM}

# coverage: 成果物起点（逆引き）
bun .opencode/skills/agentdev-traceability/scripts/src/coverage.ts --root . --artifact docs/designs/<path/to/artifact>.md

# impact: 要件起点
bun .opencode/skills/agentdev-traceability/scripts/src/impact.ts --root . --req REQ-{NNNN}-{MMM}

# impact: 成果物起点（成果物 ↔ 要件 ↔ 成果物の再確認候補）
bun .opencode/skills/agentdev-traceability/scripts/src/impact.ts --root . --artifact src/<path/to/artifact>.ts

# check: コーパス全体
bun .opencode/skills/agentdev-traceability/scripts/src/check.ts --root .

# check: 完全性検査の対象要件を限定
bun .opencode/skills/agentdev-traceability/scripts/src/check.ts --root . --req REQ-{NNNN}-{MMM},REQ-{NNNN}-{MMM}
```

スクリプト構成の詳細は [scripts/README.md](scripts/README.md) 参照。

## 運用規約

- coverage は明示された対応関係を全件返す。候補数上限、ランキング、探索深度による切り捨てを行わない
- impact の探索範囲は成果物 ↔ 要件 ↔ 成果物（固定2ホップ）であり、任意深度のグラフ探索を行わない。空結果を「影響なし」の証明として扱わない
- 現行要件の判定は `docs/requirements/REQ-{NNNN}.md` 直下の要件テーブル行（`REQ-{NNNN}-{MMM}`）を標準とする。`retired/` サブディレクトリは廃止扱い
- 完全性の基準は、実装対応は全現行要件行で1件以上、検証対応は検証対応必須行（検証対応要否カタログの未登録行）で1件以上（Design 対応は任意）。未登録の要件行は検証対応必須として扱う（安全側既定）

## 対象外

- 一般文書探索、任意経路探索、構造診断、依存関係探索
- 派生索引（`.agentdev/graph/` 等）の生成・鮮度管理
- OpenFastTrace、Eclipse Capra、専用グラフDBの実行依存
- 対応関係の意味推定（LLM による自動確定を含む）

## See Also

- **Design**: `agentdev-traceability` Design（本スキルの原本仕様）
- **トレーサビリティ要件**: producer 側リポジトリの要件インデックスを参照
- **最小トレーサビリティモデル採用の意思決定**: producer 側リポジトリの Decision インデックスを参照
