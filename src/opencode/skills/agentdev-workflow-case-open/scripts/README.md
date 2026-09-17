# `agentdev-workflow-case-open` scripts（横断依存検査エンジン）

Case 投入時の横断依存検査の決定的エンジン。case-open（STEP-5 冪等確認）と case-ready（トレーサビリティ完全性ゲート）の両 workflow skill が共有する単一実装であり、両スキル間で比較手続きを重複実装しない。

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

## 実行方法

```bash
# 型チェック（skill の scripts ディレクトリを cwd として起動）
cd .opencode/skills/agentdev-workflow-case-open/scripts && bun run typecheck

# 検査実行（repo root を cwd として起動）
bun .opencode/skills/agentdev-workflow-case-open/scripts/src/inspect_cross_dependencies.ts --input <input.json> --root <repo-root>
```

worktree で投影が利用できない場合は worktree 構造的制約の fallback 手順に従い、ソース側の同等パスから実行する。

ユニットテスト（実 REQ 行ID を含む fixture を必要とするため producer 側の非配布領域へ配置）は producer 側リポジトリの検証スイートが担う。
