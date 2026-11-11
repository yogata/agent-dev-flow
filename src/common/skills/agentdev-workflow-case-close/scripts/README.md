# `agentdev-workflow-case-close` scripts（クローズ機械工程）

case-close の機械工程 script（`scripts/src/close_mechanical_steps.ts`）の script 契約。

## I/O 契約

- 入力: `--input`（機械工程入力 JSON ファイル。phase〔pre-merge / post-merge〕、worktreeRoot、repoRoot、branch、prNumber（PR を伴わない完了構成〔verify-only closure・docs_chore 特例等〕では PR 不在を 0 で表現する。0 の場合は mergeable-polling を N/A pass〔prNotApplicable〕とし `gh pr view` を発行しない。負値・非整数は入力検証で拒否する）、pre-mergeで必須のissueNumber（終了判定記録の対象 Issue 番号）とissueUpdatedAt（GitHub Issue `updated_at` / Local Issue frontmatter `updated_at` を対象Issueから独立取得した値）、品質ゲート実行仕様、契約状態記録検査入力、受入評価入力（acceptanceSubjectKind・acceptanceVerdicts・acceptanceCrossObligations・acceptanceEmptyBasis）、post-mergeでの終了判定記録回収指定〔reclamation.closeAcceptanceRecord〕等）、`--validate-input`（検証専用経路。後述）
- 出力: stdout に報告 JSON
- 終了コード: 通常実行は成功 0、要判断 2、失敗 1。`--validate-input` は合格 0 / 不合格 1

## 検証専用経路（--validate-input）

副作用なしで機械工程 script の実行時前提を検証する入口（導入時整合検査〔check モード〕の機械工程前提検証）。

- 呼出し: `bun scripts/src/close_mechanical_steps.ts --input <input.json> --validate-input`
- 実行内容: 入力 JSON の契約検証（validateInput）、既知 gate 引数契約の事前検査（preValidateGateSpec 相当）、ゲート実行体の存在確認（exists 確認）のみ
- 副作用: なし。worktree 作成・ゲート実行・git/gh 操作・管理対象ファイルの変更を行わない（check モードの非破壊契約）
- 出力: 合格時は stdout へ報告 JSON（ok: true、gateAvailability を含む）を出力して終了コード 0。不合格（入力検証失敗・引数契約違反・ゲート実行体不在）は stderr へ error: 行を出力して終了コード 1（fail-closed）
- 検査入力は配布先の実際の consumer 条件（実在する phase と worktreeRoot/repoRoot、実在するゲート実行体を指す gate 仕様、契約状態記録検査入力）を表現する fixture で構成する。空 JSON の受理拒否や bun の起動だけを前提成立の証拠としない

## 検査入力 JSON の置き場所指針

検査入力 JSON は検査実行のための一時ファイルとして扱う。

| 方針 | 内容 |
|---|---|
| workspace 外 temp 禁止 | OS の一時ディレクトリ等、workspace の外へ置かない |
| project root 内限定 | project root 内（リポジトリ配下）の実行時作業領域へ置く |
| commit 対象外 | 検査入力は commit に含めない。git 管理対象の追跡ファイルとして置かない |
| 検査後削除 | 検査完了後に入力ファイルを削除する |

置き場所の具体候補は `.agentdev/integrity/reports/` である（project root 内の git 管理対象外領域）。

## 実行方法

```bash
# 型チェック（skill の scripts ディレクトリを cwd として起動）
cd .opencode/skills/agentdev-workflow-case-close/scripts && bun run typecheck

# 通常実行（repo root を cwd として起動）
bun .opencode/skills/agentdev-workflow-case-close/scripts/src/close_mechanical_steps.ts --input <input.json>

# 検証専用経路
bun .opencode/skills/agentdev-workflow-case-close/scripts/src/close_mechanical_steps.ts --input <input.json> --validate-input
```

worktree で投影が利用できない場合は worktree 構造的制約の fallback 手順に従い、ソース側の同等パスから実行する。

## 共有 lib の利用（supported lib interface）

機械工程は、ゲート実行体の解決と可用性検査、引数検査、--validate-input 相当の入力検査実行などの反復可能な機械処理を、正規所有の共有 lib へ集約して利用します。正規所有者は `agentdev-artifact-validation` です。正本は同 skill の `scripts/lib/gate-execution.ts` です。本 skill の機械工程入口は、本 skill 配下の `scripts/lib/gate-execution.ts` 経由でのみ共有 lib を利用する。同 shim は再エクスポートのみを行い、supported lib interface の正の参照経路です。共有 lib の内部パスを入口が直接参照することはありません。工程固有のゲート選択・順序・実行条件・結果解釈は、本 skill の入口 script が所有し続けます。正規の記述は case-close Design「機械工程の script 呼び出し契約」節です。

ユニットテストは producer 側リポジトリの検証スイートが担う。
