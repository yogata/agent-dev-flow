# trusted-distribution-gate

配布依存境界の検査入口と Stage A trust-root gate の配置・起動・失敗時の扱いを、既存文書からの抽出で集約する。本 README は既存の規約の参照点であり、新たな規約を創出しない。構成要件の所有は既存の要件・Design 文書の記述どおりである。

## 配置

| 対象 | 配置場所 |
|---|---|
| Stage A trust-root gate 本体（canonical detector・launcher・検査群） | 本ディレクトリ（`trusted-distribution-gate/`） |
| trust-root gate の PowerShell ランチャー | `scripts/self/release/trusted-distribution-gate.ps1` |
| 配布依存境界 checker（事前書き込み gate・最終 gate の実行 CLI） | `check_distribution_boundary.ts`（同一 scripts ディレクトリ） |
| 配布依存境界の契約（意味境界・検出パイプライン・projection・gate 契約・安定実装契約） | 配布依存境界 Design（[distribution-boundary.md](../../../../../docs/designs/integrity/distribution-boundary.md)） |

## 起動

### 配布依存境界 checker

```
bun run check_distribution_boundary.ts [--profile P] [--json]
  [--save-baseline <path> | --delta <path>] [--exemptions <path>] [repoRoot]
```

- `--profile` の値域は `source` | `link` | `archive` | `archive-installed`（projection 値への写像は checker CLI 冒頭の契約コメントと配布依存境界 Design「projection の分離」節を出典とする）。旧 `installed` | `release` は既存起動の互換別名として受容する（出典: [check_distribution_boundary_cli.ts](../check_distribution_boundary_cli.ts) 冒頭契約コメント）
- `--archive` は release zip のパスを受け取る。`profile=release`（現行値域の `archive-installed` 別名）では必須であり、欠落時は入力契約違反として拒否する（出典: check_distribution_boundary_cli.ts のオプション検証）
- 事前書き込み gate・最終 gate の実行は `check_distribution_boundary --profile source 等` の形で行い、事前 gate を通過しても最終 gate を省略しない（出典: 配布依存境界 Design「事前書き込み gate と最終 gate の契約」節）

### Stage A trust-root gate

`scripts/self/release/trusted-distribution-gate.ps1` から起動する。PowerShell ランチャーが配列形式の引数で TypeScript CLI（`cli.ts`）を呼び出し、shell 展開なし・一時スクリプトファイルなしで検査を実行する。パラメータの意味（`-BaseOid`、`-CandidateOid`、`-RepoRoot`、`-OutputDir`、`-RepositoryIdentity`、`-DefaultBranch`、`-BootstrapMode`/`-SeedMode`、`-BootstrapReport`）は当該スクリプト冒頭のパラメータ文書を出典とする。検査対象は不変な candidate Git OID であり、candidate コードを実行しない（出典: [trusted-distribution-gate.ps1](../../../../../scripts/self/release/trusted-distribution-gate.ps1) 冒頭文書）。

## 失敗時の扱い

### 配布依存境界 checker の終了コード

`exit 0` は合格、`exit 1` は違反検出、`exit 2` は検査エラー（検査不能）である。検査エラーを合格として扱わない（出典: [check_distribution_boundary_cli.ts](../check_distribution_boundary_cli.ts) 冒頭契約コメント「exit codes: 0 ok, 1 violation, 2 error」）。

### Stage A trust-root gate の終了コード

終了コードは `scripts/self/release/trusted-distribution-gate.ps1` 冒頭の終了コード文書を出典とする:

| 終了コード | 意味 |
|---|---|
| 0 | 合格・archive 公開済み |
| 1 | trust-root 保護パス違反（final モードで追加を含む。seed/bootstrap モードでは改変・削除のみ） |
| 2 | manifest 必須エントリ欠落 |
| 3 | digest 不一致・既存最終 archive との衝突 |
| 4 | producer 内部参照検出（final モードのみ致命的） |
| 5 | path 安全性違反（symlink・gitlink・不明 mode・traversal・unsafe archive path） |
| 6 | text artifact の UTF-8 不正・NUL バイト |
| 7 | 未分類エントリ・adapter 失敗（final モードのみ致命的） |
| 8 | 入力契約違反（不正 OID・repository identity 欠落） |
| 9 | 未分類例外（fail-closed） |

### 検査不能時の fail-closed 扱い

- Stage A trust-root gate は異常を検出した場合、非ゼロ終了コードで停止し、archive を一切書き出さない。既存の最終 archive は上書き・削除しない（出典: `launcher.ts` 冒頭の fail-closed 契約コメント）
- PowerShell ランチャーは `$ErrorActionPreference='Stop'` 下でも文書化された終了コードを保持するため、guard 節は `Write-Error` でなく標準エラー出力 + `exit <code>` を用いる（出典: [trusted-distribution-gate.ps1](../../../../../scripts/self/release/trusted-distribution-gate.ps1) 冒頭文書）
- 配布依存境界 checker は検査不能（検査エラー）を `exit 2` で区別し、合格として扱わない。archive は公開前に検査し、違反が残存する場合は最終 archive と成功経路を残さない（出典: 配布依存境界 Design「archive 公開前検査」節）

## See Also

- 配布依存境界 Design（[distribution-boundary.md](../../../../../docs/designs/integrity/distribution-boundary.md)）: 意味境界・検出パイプライン・事前/最終 gate 契約・安定実装契約の正
- [check_distribution_boundary_cli.ts](../check_distribution_boundary_cli.ts): checker CLI 契約（引数・終了コード）の出典
- [trusted-distribution-gate.ps1](../../../../../scripts/self/release/trusted-distribution-gate.ps1): ランチャーのパラメータ・終了コード文書の出典
