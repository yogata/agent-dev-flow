# target_area マッチング規則

本資料は SKILL.md「ファイル操作モード」「Scripts（決定的処理）」セクションの補完であり、`operation: update` / `operation: spec-update` で `target_area` が指定された場合のセクション置換ロジックの詳細を記述する。

## 適用条件

- `operation: update` または `operation: spec-update`
- action の `target_area` フィールドが指定されている（見出しテキスト部分、`#` プレフィクス不含）

`target_area` 未指定の draft（旧形式）、または `operation` が `create`/`spec-create` の場合は従来の「追記」動作を維持し、本資料のマッチング規則は適用しない（後方互換）。

## マッチング規則

`search-target-area.ts` が対象 SPEC ファイル内の見出し行（`#` で始まる行）を走査し、`target_area` と照合する。

### 一致判定

| 判定 | 条件 |
|------|------|
| 完全一致 | 見出しテキストが `target_area` に完全一致 |
| 前方一致 | 見出しテキストが `target_area` で始まる |

見出し行以外（本文中の `target_area` という単語等）はマッチ対象外。

### セクション範囲特定

マッチした見出し行から、次の同レベル（または上位レベル）見出し行の直前までを「セクション」として特定する。

- 例: `### X` で検索した場合、次の `###` / `##` / `#` 見出し行の直前までを範囲とする
- 例: `## Y` で検索した場合、次の `##` / `#` 見出し行の直前までを範囲とする

特定したセクションを action の `content` で置換する。

## 複数マッチ時の挙動

`target_area` に一致する見出しが複数存在する場合、spec-save G09 に従い置換を拒否し warning を出力する。
`search-target-area.ts` は全マッチを返し、呼び出し元（spec-save）が `matches.length > 1` で warning 判断を行う。

## 未検出時の挙動

`target_area` に一致する見出しが存在しない場合、当該 action をスキップし follow-up として「target_area 未検出、operation を spec-create へ切り替えを推奨」を報告する（全体中止しない）。
`search-target-area.ts` は空配列を返し（エラーとはしない）、呼び出し元が `matches.length === 0` でスキップ判断を行う。

## search-target-area.ts の I/O

```
入力: argv[2]=target_area, argv[3..]=spec files
      または stdin JSON { target_area: string, files: string[] }
出力: { ok: true, matches: [{file, line, text}] }
エラー: 非ゼロ終了コード + stderr
```

`matches` が空でもエラーとはしない。複数マッチは呼び出し元で warning 判断の材料とするため全て返す。
