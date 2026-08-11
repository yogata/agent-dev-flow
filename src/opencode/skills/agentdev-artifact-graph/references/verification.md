# verification feedback 機構

Artifact Graph と独立確認結果の差異を検出、分類、是正、回帰検証する機構（REQ-{NNNN}-{NNN}、REQ-{NNNN}-{NNN}、DEC-{N} decision 8, 11）。

## 原則

Graph は SSoT ではない。Graph 候補は常に正規成果物で確認する。差異は原因分類（canonical defect / graph defect）し、Graph 側を直接手編集せず原因側を修正して再生成する（REQ-{NNNN}-{NNN}）。

## 検出（detect）

`verify_graph.ts` は indexed_paths 配下の Markdown ファイルを独自の走査ロジックで走査し、Graph とは独立にリンクと参照を抽出する。Graph のパーサーとは異なる正規表現を使用し、共通モードの故障を避ける。

検出対象:
- Markdown リンクターゲットのファイルシステム実在確認
- Graph edges と独立走査リンクの対応関係

## 分類（classify）

| 分類 | 意味 | 是正対象 |
|---|---|---|
| `canonical_defect` | 正規成果物に問題がある（例: リンク切れ、存在しない参照） | 正規成果物を修正 |
| `graph_defect` | Graph の抽出に問題がある（例: リンクを見落とした） | Graph を再生成 |
| `matched` | Graph と独立確認が一致 | 対応不要 |

## 是正（correct）

1. 差異を分類する
2. `canonical_defect` の場合: 正規成果物を修正する（リンクを修正、参照を追加/削除）
3. `graph_defect` の場合: Graph を再生成する（`build_graph.ts` を再実行）
4. Graph を直接手編集しない

## 回帰検証（regression-verify）

是正後に再度 `verify_graph.ts` を実行し、差異が解消されたことを確認する。

```bash
# 1. 検出・分類
bun .opencode/skills/agentdev-artifact-graph/scripts/src/verify_graph.ts --root . --graph .agentdev/graph

# 2. 正規成果物を修正（Graph は触らない）

# 3. Graph 再生成
bun .opencode/skills/agentdev-artifact-graph/scripts/src/build_graph.ts --root . --output .agentdev/graph

# 4. 回帰検証
bun .opencode/skills/agentdev-artifact-graph/scripts/src/verify_graph.ts --root . --graph .agentdev/graph
```

## 出力 JSON 契約

```json
{
  "summary": {
    "checked_files": 5,
    "checked_links": 12,
    "graph_edges": 8,
    "differences": 1,
    "canonical_defects": 1,
    "graph_defects": 0,
    "matched": 11
  },
  "differences": [
    {
      "classification": "canonical_defect",
      "kind": "unresolved_link",
      "path": "docs/requirements/REQ-{NNNN}.md",
      "detail": "Markdown link target does not exist on filesystem: ../decisions/DEC-{N}.md (line 5)"
    }
  ]
}
```

## 制限事項

- 本実装はファイルシステムレベルの独立確認に留まる。意味レベルの検証は対象外。
- `inferred` 関係の検証は行わない（標準実装は `inferred` を生成しない）。
- Graph が空（REQ-{NNNN}-{NNN}）の場合、検証結果も空になる。
