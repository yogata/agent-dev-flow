# Issue #1239 と PR #1240 のスコープ完全重複（Epic 分解時の横断重複検知不足）

## 発生源

- Epic: #1231 (Wave 2 close)
- PR: #1247 (子Issue #1239, IR-025〜051 regression_test 表記統一)
- 重複先: PR #1240 → #1246 (Issue #1240, doc-structural-cleanup, AG-005)
- 発生日: 2026-06-27

## 内容

Epic #1231 の子 Issue #1239（OU-001-8: IR-025〜051 regression_test 表記統一）の作業対象は、別 Issue #1240（doc-structural-cleanup、AG-005）の PR #1240 で既に処理済みだった。本 Issue #1239 は PR #1247 で空コミットとして実作業をスキップし、PR #1240 のマージ（merge commit 0b6e6428 → PR #1246）により完了条件を満たす構成とした。

Wave 2 完了条件 AG-005 は PR #1240/#1246 へ委譲され、PR #1247 Findings に「DEFERRED」「既処理」と記録して case-run が対応。ただし Epic #1231 の分解時（case-open）に #1240 と #1239 のスコープ重複を検知できておらず、結果として1子 Issue 分のリソース（case-open/case-run/case-close）が空コミット PR に消費された。

## 推奨対応先

- case-open の Epic 分解フローで、既存 OPEN/CLOSED Issue とのスコープ重複（特に AG-* 粒度の一致）を横断検知する手順の検討
- doc-structural-cleanup のような横断是正 Issue とディレクトリ分割 Epic の相互作用パターンを SPEC（`docs/specs/commands/case-open.md` 分解ロジック）へ明文化

## 現在の追跡状態

- PR #1247 Findings セクションに「既処理」として記録済み
- Epic #1231 は完了（Wave 2 close）、本 intake は将来の分解ロジック改善へ委譲
