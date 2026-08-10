# `effectiveness/` — Workflow Effectiveness 検証インフラ (REQ-021-006)

AgentDevFlow の代表質問（workflow question）6 種について、**Artifact Graph による探索**
と **Graph を使わない独立探索（rg / glob / frontmatter scan 相当）** を比較する診断
harness。REQ-021-006 が定める 6 つの比較観点を計算し、diagnostic report を出力する。

> **本検証は診断目的であり、性能閾値による合否判定は行わない（REQ-021-006, TS-010）。**
> Parser/Graph regression は REQ-020 傘下の `tests/*.test.ts` が独立に判断可能であり、
> 本 harness は重複しない（CR-003）。

## 構成

```
effectiveness/
├── types.ts              — Query suite / result / 6 指標の型定義、category 一覧
├── queries.ts            — 代表 6 query と ground truth 定義（real artifact 参照）
├── independent_search.ts — rg / glob / frontmatter 相当の独立探索実装
├── harness.ts            — Graph + 独立探索を実行し 6 指標を計算する中心処理
├── run.ts                — CLI entry point（diagnostic report / JSON 出力）
└── README.md             — 本ファイル
```

## 必要入力

- **Graph**: `bun src/build_graph.ts --root . --output .agentdev/graph` で生成済みの
  Graph directory（`manifest.json`, `nodes.jsonl`, `edges.jsonl`, `provenance.jsonl`,
  `diagnostics.json` が揃っていること）。
- **repo root**: 計測対象リポジトリのルート。`docs/`, `src/opencode/`,
  `.agentdev/extensions/` が配置された状態を想定する。

## 実行方法

```bash
cd src/opencode/skills/agentdev-artifact-graph/scripts

# 初回のみ Graph を生成（既存 Graph があればスキップ可）
bun src/build_graph.ts --root ../../../../../.. --output ../../../../../../.agentdev/graph

# harness 実行（diagnostic report を stdout へ人間可読形式で出力）
bun effectiveness/run.ts --root ../../../../../.. --graph ../../../../../../.agentdev/graph

# JSON 形式で受け取りたい場合（CI / 後段集計）
bun effectiveness/run.ts --root ../../../../../.. --graph ../../../../../../.agentdev/graph --json
```

上記の `--root` / `--graph` はリポジトリルートからの相対パス。本 worktree から実行する
場合は、この README のある `scripts/` ディレクトリから 5 つ上がリポジトリルートになる。

## 6 つの query category（REQ-021-006 1:1 対応）

| id 接頭辞 | category | 質問の代表例 |
|---|---|---|
| Q1 | `req-change-impact` | REQ-012 を変更した場合、影響を受ける成果物は何か？ |
| Q2 | `same-canonical-owner` | canonical_owner が `agentdev-artifact-graph` である SPEC はどれか？ |
| Q3 | `related-command-skill-ir` | agentdev-artifact-graph SPEC に関連する command / skill / IR は何か？ |
| Q4 | `delegation-target-skill` | case-close command が実際に委譲する skill は何か？ |
| Q5 | `superseded-current-refs` | superseded な成果物を、現行の成果物がまだ参照しているか？ |
| Q6 | `post-change-dangling-relation` | 当該 SPEC を削除した場合、どの relation が dangling になるか？ |

各 query の `groundTruthRationale` は ground truth を選んだ根拠を明示し、追跡可能性を
確保する。各 query は real artifact（`docs/requirements/REQ-*.md`, `docs/decisions/DEC-*.md`,
`docs/specs/**`, `src/opencode/{commands,skills}/**`, `.agentdev/extensions/**`）のみを
参照し、mock/stub は使用しない。

## 6 つの比較観点

各 query について以下を計算する。

| metric | 定義 |
|---|---|
| recall | ground truth のうち各手法が発見した割合（Graph / 独立探索 それぞれ） |
| false candidate count | ground truth 以外の候補として返した数 |
| canonical source reach | 結果のうち canonical source（source_file 以外の artifact node）へ到達できる割合 |
| Graph-only miss | 独立探索が見つけたが Graph が見落とした候補 |
| Independent-only miss | Graph が見つけたが独立探索が見落とした候補 |
| search effort | 探索に要した操作量（Graph API 呼出回数 / 独立探索の走査ステップ数） |

recall / false candidate / canonical reach / search effort は Graph 側・独立探索側の
両方について計算し、report で並べて比較する。

## diagnostic 目的の明示

- harness は常に終了コード 0 を返す。metrics が閾値を外れても失敗扱いにしない。
- 出力 report の冒頭に「本検証は診断目的であり、性能閾値による合否判定は行わない」を明示する。
- Artifact Graph 自身の接続確認のみを workflow effectiveness の成立根拠としない（SPEC「効果検証」節）。
  本 harness は Graph 結果と独立探索結果の差を可視化し、Graph の追加価値を観察可能にする。

## Parser/Graph regression との境界（REQ-020）

Parser / augmentation / extraction / provenance の正確性検証は **REQ-020** 傘下の検証層
（`tests/*.test.ts` と REQ-020 関連 SPEC）が所有する。本 harness は以下を取り扱わない:

- Graph が正しく node / edge を抽出しているかの回帰検証
- augmentation 設定の妥当性検証
- provenance の網羅性検証

本 harness は「Graph が正常に生成されたという前提で、Graph 利用者が workflow 質問を
投げたときの探索効果を観察する」ことに限定する。

## 制限事項

- 独立探索の `grep` は正規表現エンジンに JavaScript `RegExp` を使用する。rg 等の外部
  CLI 依存を避けるため、harness は Bun の fs API のみで完結する設計とした。
- canonical source reach 指標は、Graph 側・独立探索側ともに「source_file 以外の artifact
  node へ正規化できた割合」を代用指標として使う。これは「canonical source へ到達可能か」
  を直接観測する手段が Graph API に存在しないための近似である。
- query suite は AgentDevFlow リポジトリの現時点の artifact 構成に依存する。成果物構成が
  大幅に変わった場合は `queries.ts` の ground truth の見直しが必要になる。

## 関連情報

- [REQ-021-006](../../../../../../../docs/requirements/REQ-021.md) — 本体要件
- [SPEC agentdev-artifact-graph「効果検証」節](../../../../../../../docs/specs/skills/agentdev-artifact-graph.md) — 検証方針
- [REQ-020](../../../../../../../docs/requirements/REQ-020.md) — Parser/Graph regression の対象外根拠
- 親 [README.md](../README.md) — scripts 全体構成
