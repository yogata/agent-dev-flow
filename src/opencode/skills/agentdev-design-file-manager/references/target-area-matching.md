# target_area マッチング規則

本資料は SKILL.md「ファイル操作モード」「Scripts（決定的処理）」セクションの補完であり、`operation: update` で `target_area` が指定された場合のセクション置換ロジックの詳細、機械置換手順の適用と参照検査観点を記述する。

## 適用条件

- `operation: update`
- action の `target_area` フィールドが指定されている（見出しテキスト部分、`#` プレフィクス不含）

`target_area` 未指定の draft（旧形式）、または `operation` が `create` の場合は従来の「追記」動作を維持し、本資料のマッチング規則は適用しない（後方互換）。

## マッチング規則

`search-target-area.ts` が対象 Design ファイル内の見出し行（`#` で始まる行）を走査し、`target_area` と照合する。

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

`target_area` に一致する見出しが複数存在する場合、design-save G09 に従い置換を拒否し warning を出力する。
`search-target-area.ts` は全マッチを返し、呼び出し元（design-save）が `matches.length > 1` で warning 判断を行う。

## 未検出時の挙動

`target_area` に一致する見出しが存在しない場合、当該 action をスキップし follow-up として「target_area 未検出、operation を create へ切り替えを推奨」を報告する（全体中止しない）。
`search-target-area.ts` は空配列を返し（エラーとはしない）、呼び出し元が `matches.length === 0` でスキップ判断を行う。

## 機械置換手順の適用（3段階）と参照検査観点

target_area セクション置換は機械置換であり、`agentdev-doc-writing` スキルの references/mechanical-replacement-rules.md「機械置換手順の設計原則（3段階）」に従う。
本節は同原則の Design 操作への適用を定める。

### 3段階の適用

| 段階 | target_area 置換での実施内容 |
|---|---|
| 1. old 側 grep 実在確認 | `search-target-area.ts` のマッチ結果で対象 Design 内の target_area 見出しの実在を確認する。置換対象セクションの旧内容が想定どおり存在するか本文読込で確認する |
| 2. 置換実行 | 特定したセクション範囲を action の `content` で置換する |
| 3. 置換後 MISS 確認 | 旧見出しテキスト、旧内容の固有パターンを再検索し、0 件であることを確認する。見出しを変更しない置換では旧内容のパターンで確認する |

複数マッチ（design-save G09 で置換拒否）、未検出（スキップ + follow-up）は、段階1の実在確認で検出する。

### 参照検査観点

- **参照実在確認**: target_area の参照先見出しが Design 内に実在することを `search-target-area.ts` のマッチ結果で検証する。APPEND の anchor でも同一の実在確認を行う
- **変動値分離**: セクション特定の錨は見出しテキスト（行内容）であり、行番号ではない。`matches` の `line` は証跡表示であり、追記、削除で変動するため照合の錨に使わない

## search-target-area.ts の I/O

```
入力: argv[2]=target_area, argv[3..]=spec files
      または stdin JSON { target_area: string, files: string[] }
出力: { ok: true, matches: [{file, line, text}] }
エラー: 非ゼロ終了コード + stderr
```

`matches` が空でもエラーとはしない。
複数マッチは呼び出し元で warning 判断の材料とするため全て返す。
