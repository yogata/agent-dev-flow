# STEP-1 / STEP-2: スキャン対象収集・REQ 体系・文書種別別意味診断（scan-and-doc-diagnostics）

> 本 reference は `agentdev-workflow-inspect-docs` SKILL.md の制御平面（STEP 一覧）STEP-1、STEP-2 詳細である。
> read-only-diagnostic型のため resume point を持たない。

## 開始条件

- STEP-1: inspect-docs command の実行開始
- STEP-2: スキャン対象一覧の確定

## 結果

- REQ/Decision/Design/guides/README の意味診断結果（検出事項候補、根拠、source-of-truth 判定、推奨 route）

## 手順

### STEP-1-1: スキャン対象の収集

`docs/requirements/`、`docs/decisions/`、`docs/designs/`、`docs/guides/`、`README.md`、`.opencode/` を収集する。

### STEP-2-1: REQ 参照ID整合性確認

`agentdev-req-structure-diagnostics` 参照。

### STEP-2-2: 第一参照導線確認

`agentdev-req-structure-diagnostics` 参照。

### STEP-2-3: 現行/廃止/世代境界確認

`agentdev-req-structure-diagnostics` 参照。

### STEP-2-4: Design 意味診断

Design が REQ/Decision/guides の代替、将来計画の混入、実行時依存先としての不適切扱いを確認する。

### STEP-2-5: Decision 意味診断

承認済み Decision のみを現行判断の根拠として扱っているか確認する。

### STEP-2-6: guides 意味診断

guides が navigation layer の範囲を超えていないか確認する。
履歴混入を検出した場合 route を追加する。

### STEP-2-7: README 索引診断

README 索引が導線の範囲を超えていないか確認する。
内容過多を検出した場合分割を誘導する。

### STEP-2-8: REQ structure review（6観点）

SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT。
`agentdev-req-structure-diagnostics` 参照。

### STEP-2-9: 文書分類一貫性検査

document-model Design（extension 経由）の classification policy への適合確認。
REQ 要件行に schema field、enum 値一覧、route/category/status 判定表、file pattern、テンプレート種別、report format、内部アルゴリズム、作業履歴、実装パラメータ等の Design分離基準違反が残留していないかを `agentdev-req-structure-diagnostics` に従って自動検出する。

## エラー処理

| エラー | 対処 |
|--------|------|
| スキャン対象ディレクトリが存在しない | 該当カテゴリを空として扱い、警告を出力 |
| ファイル読込失敗 | 該当ファイルをスキップし、警告を出力 |

## 関連 STEP

- 前: なし（workflow 先頭）
- 次: STEP-3（distribution-check-and-output）

## 関連 Capability Skill

- `agentdev-req-structure-diagnostics`: STEP-2-1〜2-3、2-8、2-9 の判定ロジック
- `agentdev-doc-diagnostics`: 診断カテゴリ、証拠構造、文書種別別ルーティング
- `agentdev-project-extensions`: document-model Design の extension 経由解決

## 関連ガードレール（command 側で宣言、本 reference は詳細実装）

- ガードレール（ファイルを変更、作成、削除しない。ただし `.agentdev/inspect/inbox/inspect-docs-finding-*.md` の生成は例外として許可）
- 不変条件（source-of-truth priority（現行 REQ > 承認済み Decision > Design > guides）に従って矛盾を判定）
