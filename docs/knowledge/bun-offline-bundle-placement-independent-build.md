---
title: Bun offline bundle の配置場所独立性（資産同梱・相対解決・生成条件）
created: 2026-09-11
updated: 2026-09-11
---

# Bun offline bundle の配置場所独立性（資産同梱・相対解決・生成条件）

## 知識内容

Windows + Bun で配布用単一 ESM bundle を生成する場合、ビルド環境への依存を排除して配置場所独立性を確保する。確認済みの条件は次のとおりである。

1. `Bun.build` は `require.resolve` をビルド時の絶対パスへ展開する。ビルド元 worktree を削除すると runtime 解決不能となるため、既定解決がビルド場所を参照する依存は公式の上書き経路（プラグイン runtime 固定経路等）で配布物相対へ固定する。ビルド時の絶対パスを runtime の必須解決経路に残さない。
2. 辞書等の runtime データ資産は実ファイルとして bundle とともに同梱する。bundle 単体実行で、clone 先や worktree が異なっても同じ解決結果になること、ビルド元ディレクトリ削除後も standalone 実行できることを検証する。
3. bundle 生成時は `target: node` を固定し、生成後に `// @bun` バナーを除去する。target 指定なし・バナー残存の bundle は consumer 側で UTF-8 parse error になり得るため、配布同梱前に consumer 実行系で起動確認を行う。
4. bundle は node_modules やビルド環境の Bun 固有構文に依存させない。

## 適用条件

- Windows + Bun で配布用単一 ESM bundle（offline bundle）を生成・同梱する場合。
- `require.resolve` 依存を含むコードを bundle 化する場合。
- bundle を consumer プロジェクトへ配布し、ビルド元と異なる環境で実行する場合。

## 適用対象

- `src/opencode/plugins/agentdev-textlint-guard/vendor/` 配下の vendored engine bundle 再生成・配布。
- Bun.build を用いる配布物生成スクリプト全般。
- offline bundle の standalone 実行検証手順。

## 根拠

- PR #2730（Issue #2725 / Epic 2723 W2）: `require.resolve` のビルド時絶対パス展開とビルド元 worktree 削除後の解決不能を確認。
- PR #2729（Issue #2724）: target 指定なし・`// @bun` バナー残存の bundle で consumer 側 UTF-8 parse error を確認。
- offline bundle 検証（#4 の require.resolve 展開観測と資産同梱・相対解決の standalone 検証）。

## 関連知識

- [外部依存メジャーバージョン互換性の事前確認](external-dependency-major-version-compatibility.md)（bundle 化に伴う依存の互換性確認）。
- [checker CLI の stdout 証跡が Windows + bun で失われる問題と安定実行経路](checker-cli-stdout-loss-on-windows-bun.md)（Windows + bun 環境での実行・検証の安定経路）。
