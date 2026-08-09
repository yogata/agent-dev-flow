# 外部依存のメジャーバージョン互換性管理

## 背景

AgentDevFlow の TypeScript スクリプト群と標準配布スキルで、外部依存ライブラリのメジャーバージョンアップに伴う非互換が顕在化した。no-excuse 検査器の TypeScript 世代要求と検査対象パッケージの解決世代の不一致（#8）と、zod v3→v4 の `.refine` API 非互換（#10）である。両者とも外部依存の世代・API 互換性を事前確認する手順が未確立なことに起因する。

## 問題

- no-excuse 検査器が TypeScript 7 の `typescript/unstable/*` を要求した一方、Artifact Graph の新規スクリプトはリポジトリ標準設定で TypeScript 5.9 を解決したため、検査器を起動できず代替検証（型検査・LSP 診断・禁止構文走査）へ退化した（#8）
- agentdev-artifact-graph 標準配布スキルの model.ts で zod v3 で許容されていた `.refine(fn, messageFn)` 形式（第2引数へ関数を渡す）が zod v4 ではエラーになり、第2引数へ関数を渡さない形式へ書き換える必要が生じた（#10）

## 望ましい変更

外部依存ライブラリのメジャーバージョン互換性を事前確認・スキャンする手順を検証ガイド・実装ガイドへ確立する。共通予防策フレーム: (a) 依存ライブラリの世代・API 互換性の事前確認、(b) メジャーアップデート時の非互換 API 一括スキャン、(c) 検査器の対象パッケージ依存非依存な実行環境への分離。

### #8（TypeScript 世代不一致）個別対応

- 検査器を対象パッケージの TypeScript 世代に依存しない実行環境へ分離する
- 起動不能時の代替検証項目（型検査・LSP 診断・禁止構文走査）を手順として定義する

### #10（zod v3→v4 非互換）個別対応

- zod schema を新規実装する際、対象 zod バージョンの `.refine` 第2引数型を先に確認する手順
- zod v3→v4 移行では `.refine` 以外にも非互換 API（`.passthrough`、`.partial` 等）を一括スキャンする手順

## 対象範囲

### 対象

- no-excuse 検査器の実行手順・TypeScript スクリプト検証ガイド（#8）
- zod を利用する標準配布スキルの実装ガイド・zod schema 移行手順（#10）

### 対象外

- TypeScript / zod のバージョンそのものの固定・変更（各パッケージの依存関係判断）
- no-excuse 検査器の廃止（運用互換性の知見であり、検査器自体の変更を直接伴わない）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| guide | no-excuse 検査器の実行手順（存在する SPEC/guide） | 起動不能時の代替検証項目と、TypeScript 世代依存を分離する実行環境を明示（#8） |
| guide | TypeScript スクリプトの検証ガイド（docs/guides/ または programming skill） | 共存する TypeScript 世代の一致確認手順を追加（#8） |
| guide | zod を利用する標準配布スキルの実装ガイド | zod バージョンと `.refine` API 互換性の事前確認手順を追加（#10） |
| guide | zod schema 移行手順（docs/guides/ または関連 skill references） | zod v3→v4 移行時の非互換 API（`.refine`/`.passthrough`/`.partial` 等）一括スキャン手順を追加（#10） |

## 既存対策確認

- **確認結果**: 既存対策なし（該当検証ガイド未確立）
- **該当ファイル**: なし
- **ギャップ分類**: fix gap
- **ギャップ詳細**: no-excuse 検査器の起動不能時代替検証手順、TypeScript 世代依存分離、zod バージョン互換性事前確認・非互換 API スキャン手順がいずれも未確立。programming skill に型安全・モダンスタックの記述はあるが依存ライブラリ世代互換性管理は未カバー

## 制約

- 外部依存ライブラリ（TypeScript / zod）のバージョンは各パッケージの依存関係判断であり、本件では手順化のみを行いバージョン固定を強制しないこと
- zod v3→v4 の非互換 API 一覧は zod の公式移行ガイドを正とし、本件ではスキャン手順の提示にとどめること
- 既存の型検査・LSP 診断手順と重複しないよう、依存互換性という観点で整理すること

## 受け入れ条件

- [ ] no-excuse 検査器起動不能時の代替検証項目が手順化されていること（#8）
- [ ] TypeScript 世代依存を分離する実行環境の方針が明示されていること（#8）
- [ ] zod schema 新規実装時の `.refine` 第2引数型事前確認手順が明示されていること（#10）
- [ ] zod v3→v4 移行時の非互換 API 一括スキャン手順が明示されていること（#10）

## 元learning item / 根拠

- **要約**: 外部依存（TypeScript / zod）のメジャーバージョンアップに伴う非互換と、事前確認手順の未確立
- **根拠**:
  - #8: PR #1945 実装検証で no-excuse 検査器が TypeScript 7 を要求、検査対象が TypeScript 5.9 を解決し起動不能。型検査・LSP 診断・禁止構文走査で代替検証した（PR #1945、`.opencode/skills/repo-agentdev-artifact-graph/scripts/package.json`）
  - #10: PR #1955 実装者が model.ts の zod schema 定義で zod v4 の型エラーへ遭遇。`.refine(fn, messageFn)` の第2引数関数形式が zod v4 で排除され、文字列/静的オブジェクト形式へ書き換えて対応（Epic #1948、Issue #1949、PR #1955、`src/opencode/skills/agentdev-artifact-graph/scripts/lib/model.ts`）
- **再発条件**: 外部依存ライブラリのメジャーアップデートを追従、または世代のずれた環境でスクリプト・検査器を実行する場合。具体的には (a) 検査対象が TypeScript 6 以前を解決し共有検査器が TypeScript 7 を要求する場合、(b) zod v3 由来コードを zod v4 環境へ移植する場合
- **横展開可能性**: 独立 package.json とロックファイルを持つ TypeScript スクリプト群、zod を schema 定義に用いる標準配布スキル全般で発生し得る。汎用的

## 推奨Issue分類

- **分類**: feature（検証ガイド・実装ガイドの確立）
- **推奨ラベル**: documentation, enhancement, tooling
- **関連Issue**: Issue #1942、PR #1945（#8）、Epic #1948、Issue #1949、PR #1955（#10）、`.opencode/skills/repo-agentdev-artifact-graph/scripts/package.json`、`src/opencode/skills/agentdev-artifact-graph/scripts/lib/model.ts`
