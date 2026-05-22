# Plan: Issue #318 — Epic テンプレート + case-open 更新

## 概要

Epic Issue テンプレートに `## 実行順序` セクション（Wave テーブル）を追加し、case-open の Epic flow を更新する。

## 変更対象

### 変更1: `issue_desc_epic.md` テンプレート

- `## 分解（Decomposition）` と `## ステータス追跡` の間に `## 実行順序` セクションを追加
- `<!-- 【必須】 -->` マーカー付き
- Waveテーブル4列形式（Wave / Issue / 実行方法 / 前提）
- 既存セクションは一切変更しない

### 変更2: `case-open.md` コマンド

- Step 5 (Epic flow): Wave テーブル生成を追加
- Step 8 (Epic flow): Epic更新時にWaveテーブルも更新（TBD→実番号）
- Step 14 (Epic flow): 完了報告を `/agentdev/case-run {epic_N}` に変更
- Standard flow は一切変更しない

## 参照

- REQ-0020-001〜006
- ADR-0006
