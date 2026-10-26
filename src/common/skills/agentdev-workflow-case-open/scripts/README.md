# `agentdev-workflow-case-open` scripts（横断依存検査エンジン・定義PR準備機械工程）

本ディレクトリは case-open の機械工程 script 群（`scripts/src/prepare_definition_pr.ts`〔定義PR準備〕と `scripts/src/inspect_cross_dependencies.ts`〔横断依存検査エンジン〕）の script 契約を定める。横断依存検査エンジンは case-open（STEP-5 冪等確認）と case-ready（トレーサビリティ完全性ゲート）の両 workflow skill が共有する単一実装である。

## 構成

```
scripts/
├── package.json
├── tsconfig.json
├── lib/
│   ├── cross_dependency_types.ts   # 入力・報告の型とパス正規化
│   ├── cross_dependency_engine.ts  # 検出条件 (a)(b) の比較ロジック（純粋関数）
│   └── shared_area_registration.ts # 共有領域実ファイルの登録状態の機械的読取
└── src/
    └── inspect_cross_dependencies.ts # CLI 入口
```

## I/O 契約

- 入力: `--input`（検査入力 JSON ファイル）、`--root`（共有領域ファイル相対パスの解決基準ディレクトリ。省略時 cwd）
- 出力: stdout に報告 JSON
- 終了コード: 検査成立時 0（警告の有無にかかわらず。警告はエラーではなくゲート遷移判定に影響しない）、引数・入力の形式エラー時 1
- 決定性: 同一入力から同一の JSON を返す（冪等再実行時の警告再提示の一貫性）

## 検出条件

- (a) 2 以上の未クローズ Case の変更対象成果物の同一パス重複
- (b) 2 以上の Case の対象要件行が同一共有領域への未登録行を含む重複需要（共有領域実ファイルの現行登録状態の機械的読取を含む）

## 検査入力 JSON

検出源の収集（未クローズ Case 群の宣言、共有領域定義）は呼出側の workflow skill 手順が行う。本エンジンは合意済み宣言の機械的比較に限定し、入力された宣言以外の読み取りや一般的な変更影響探索を行わない。検出源の取得失敗は `source_failures` として入力に渡し、報告の `detection_unavailable` に出力する（比較の黙示省略をしない）。

共有領域の定義（`shared_areas`）はプロジェクト側で解決した値を渡す。本エンジンは特定プロジェクトの具体パスを参照しない。共有領域の読取方式（`kind`）は次の 3 種:

| kind | 登録状態の読取 |
|---|---|
| `req-row-list` | 箇条書きエントリ行（`- REQ-NNN-MMM..REQ-NNN-MMM: 説明` 形式。範囲は同一 REQ 内で展開） |
| `adf-covers-declarations` | 対応宣言行（対応宣言マーカー＋(role): ID リスト、role は decision / design / implementation / verification の4役割）の ID。sidecar 対応関係ファイル（role キー配下の要件行 ID 列挙）も同一の論理対応関係として受理する |
| `req-row-mentions` | ファイル本文に現れる要件行IDすべて |

### 検査入力 JSON の置き場所指針

検査入力 JSON は検査実行のための一時ファイルとして扱い、次の方針で置き場所を定める。

| 方針 | 内容 |
|---|---|
| workspace 外 temp 禁止 | OS の一時ディレクトリ等、workspace の外へ置かない（workspace 外書込み guard のブロック対象となるため） |
| project root 内限定 | project root 内（リポジトリ配下）の実行時作業領域へ置く |
| commit 対象外 | 検査入力は commit に含めない。git 管理対象の追跡ファイルとして置かない |
| 検査後削除 | 検査完了後に入力ファイルを削除する（一時ファイルの残留を残さない） |

置き場所の具体候補は `.agentdev/integrity/reports/` である。project root 内の実行時作業領域（git 管理対象外・.gitignore 除外領域）であり、上記4方針（workspace 外 temp 禁止、project root 内限定、commit 対象外、検査後削除）を満たす。検査入力 JSON は commit に含まれず、検査完了後に入力ファイルを削除する（削除の実施を検証記録へ残す）。

書込み手段は worktree 操作の書込み guard 運用指針（`agentdev-git-worktree` reference「書込み guard 運用指針」）の標準手段（node の `fs.writeFileSync` 等のエンコーディング明示）に従う。workspace 外への書込みが guard によりブロックされた場合は、ブロックの解除・別 API 経路への迂回を行わず、置き場所を project root 内へ変更して切替する（fail-closed 維持）。

## 検証専用経路（導入時整合検査の機械工程前提検証）

機械工程 script の実行時前提を副作用なしで検証する入口を次のとおり定める。

### prepare_definition_pr.ts（--validate-input フラグ）

- 呼出し: `bun scripts/src/prepare_definition_pr.ts --input <input.json> --validate-input`
- 実行内容: 入力 JSON の契約検証（validateInput）、既知 gate 引数契約の事前検査（preValidateGateSpec 相当）、ゲート実行体の存在確認（exists 確認）のみ
- 副作用: なし。worktree 作成・ゲート実行・git/gh 操作・管理対象ファイルの変更を行わない（check モードの非破壊契約）
- 出力: 合格時は stdout へ報告 JSON（ok: true、gateAvailability を含む）を出力して終了コード 0。不合格（入力検証失敗・引数契約違反・ゲート実行体不在）は stderr へ error: 行を出力して終了コード 1（fail-closed）
- 検査入力は配布先の実際の consumer 条件（実在する repoRoot と branch、実在するゲート実行体を指す品質ゲート実行仕様、有効な REQ 行 ID）を表現する fixture で構成する。空 JSON の受理拒否や bun の起動だけを前提成立の証拠としない

### inspect_cross_dependencies.ts（通常実行が検証専用経路）

本 CLI は読取と純粋比較のみで副作用を持たない（gate_effect: none）。検証専用経路は当該 CLI の通常実行そのものであり、別入口を設けない。検証専用の実行前提確認は、実 consumer 条件を表現した検査入力 JSON（非空の unclosed_cases〔population_count 1〕と解決可能な shared_areas を含む構成）で実行し、報告 JSON の応答解析（ok、scan.population_count、condition_a.count、condition_b[].file_results[].read_ok、detection_unavailable）で行う。対象集合が空の入力や shared_areas が空の入力の受理だけを前提成立の証拠としない。

## 実行方法

```bash
# 型チェック（skill の scripts ディレクトリを cwd として起動）
cd .opencode/skills/agentdev-workflow-case-open/scripts && bun run typecheck

# 検査実行（repo root を cwd として起動）
bun .opencode/skills/agentdev-workflow-case-open/scripts/src/inspect_cross_dependencies.ts --input <input.json> --root <repo-root>
```

worktree で投影が利用できない場合は worktree 構造的制約の fallback 手順に従い、ソース側の同等パスから実行する。

ユニットテスト（実 REQ 行ID を含む fixture を必要とするため producer 側の非配布領域へ配置）は producer 側リポジトリの検証スイートが担う。
