# 語彙レジストリ実体 IR-050/051 対象リストの「種別: 公開 command」列挙を v4 公開入口モデルへ追随させる

## 内容

語彙レジストリ実体（.opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md）の IR-050/051 対象 command リストに「種別: 公開 command」列挙が残り、v4 公開入口モデル（UX 2入口収斂。case-open / case-run / case-close は内部 lifecycle 段階）と矛盾する記述になっている。

- 検出器（check_executor_notation.ts）は実体 MD を直接消費しないため機能影響はない
- 本 Wave（RA-004）の PR #3543 では語彙面の追随を行ったが、IR-050/051 対象リストのモデル追随は対象範囲外として残した（case-run の Findings 記録どおり）

## 影響

語彙レジストリの対象リストが v4 公開入口モデルと矛盾したままになり、旧語彙検出の運用データ（data/obsolete-vocabulary-map.yaml）の整合を崩し得る。新規に追加された語彙の「公開 command / 内部 lifecycle 段階」分類の基準が曖昧になる。

## 提案

Wave 3 横断検証（Issue 3538）で語彙レジストリ実体の IR-050/051 対象 command リストを v4 公開入口モデルへ追随させ、列挙項目の種別分類を現行モデル（公開入口 / 内部 lifecycle 段階 / 廃止）で再確定する。design-save 工程の廃止判定（関連 intake: 2026-10-07-case-3536-design-save-disposal-req-103-016.md）と一体で実施するのが低コスト。

## 根拠

Epic #3530 Wave 2-4（Issue 3536）の PR 本文 Findings 節（case-run 記録）。case-close STEP-6-4 で PR 本文 Findings から回収。

https://github.com/yogata/agent-dev-flow/pull/3543
