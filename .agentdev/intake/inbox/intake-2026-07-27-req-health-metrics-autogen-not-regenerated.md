# intake: req-health-metrics.md AUTOGEN ブロック REQ-006 要件数の再生成未実施

## 発生日

2026-07-27

## 発生元

- Epic: #1871 (Wave 1, Wave 2/3/4 残)
- Issue: #1872 (OU-001)
- PR: #1898 (REQ-006 capture 責務境界の各工程分散型変更)
- 取得元: PR 本文「Findings / Capture候補」セクション

## 問題事象

Phase 0 コミット `736bc3af` で `docs/specs/quality/req-health-metrics.md` の AUTOGEN ブロックにある REQ-006 要件数が 104 から 109 への再生成が未実施のまま残存している。

## 影響

- REQ-006 の要件数が実際（109）とメトリクス表記（104）で不整合を起こす。
- `check_integrity.ts` の IndexGenerationConsistency 検査で検出済みであるため、CI 上の警告または将来のエラー原因になる。

## 発生局面

実装（Phase 0 commit 適用後、Wave 1 case-close 時の PR 本文 capture 回収）

## 検知方法

PR #1898 の TS 検証過程で Phase 0 コミットの AUTOGEN 対象ファイルを確認し、再生成漏れを発見。

## 想定される対応方向

`bun run` 等で AUTOGEN 再生成スクリプトを実行し、REQ-006 要件数を 109 へ更新する。本 Issue スコープ外のため後続 Issue で処理する。

## 関連

- ファイル: `docs/specs/quality/req-health-metrics.md`
- Phase 0 commit: `736bc3af` (REQ-006-021 UPDATE + 105-109 NEW + 5 command/SPEC)
- 検査スクリプト: `check_integrity.ts` IndexGenerationConsistency

## 出典引用

PR #1898 本文「Findings / Capture候補」より引用:

> Phase 0 コミット `736bc3af` で AUTOGEN block の `docs/specs/quality/req-health-metrics.md` の REQ-006 要件数: 104→109 への再生成が未実施（事前存在、本 Issue スコープ外、`check_integrity.ts` の IndexGenerationConsistency で検知済み）

## タグ

#intake #autogen #req-health-metrics #index-consistency
