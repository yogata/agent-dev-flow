# Intake Item: runtime-package-boundary SPEC L306 inspect-extensions 残存参照

## 発生源

- PR: #1839, #1837, #1838 (Issues #1834 / #1835 / #1836, Epic #1833 Wave 1)
- 発生 phase: case-close Epic Wave クローズ時の stale reference 確認
- capture 分類: intake（具体的修正対象、積み残し作業候補）

## 問題

ADR-006 により inspect-extensions command は独立公開 command として廃止され、配布 command 実体は #1835 で削除、command SPEC は #1836 で superseded、foundation SPEC と skill SPEC は #1834 で ADR-006 / 後継3層（docs-check / inspect-skills / inspect-promote）へ更新された。しかし docs/specs/local/runtime-package-boundary.md L306 の記述は eq-save, spec-save, case-close, inspect-extensions が epo-agentdev-integrity/scripts/*.ts を呼び出すと列挙しており、inspect-extensions が既に削除された command であることを反映していない。

同 SPEC は local SPEC であり、Epic #1833（inspect command 構成正規化、foundation SPEC / 配布 command / 配布 SPEC / SPEC index が主スコープ）の対象範囲外。3 PR のいずれも触れなかったため stale 参照が残存する。

## 推奨修正対象

docs/specs/local/runtime-package-boundary.md L306 付近の comma list。

- 修正候補: inspect-extensions を comma list から削除し、eq-save, spec-save, case-close の3件へ縮約。必要に応じて adjacent する「consumer 環境で実行時欠落する別課題」記述も inspect-extensions 廃止後の現状へ調整。

## 推奨対応

別 req-define / case-open で local SPEC の minor update を起票する。docs_chore work_type、standard scale を想定。Epic #1833 由来の派生作業として RU-0028 の付録扱い、または独立 RU（local SPEC 周辺の整理）として扱うかは backlog-review で判断する。

## 関連

- references: docs/specs/local/runtime-package-boundary.md (L306 repo-agentdev-integrity 行)
- 起点 ADR: docs/adr/ADR-006.md (inspect 3-command 正規化、inspect-extensions 廃止確定)
- Issue: #1834, #1835, #1836 (CLOSED/COMPLETED)
- Epic: #1833 (CLOSED/COMPLETED)
- PRs: #1839 (Findings stale-reference セクション), #1837 (Findings project-extensions.md L65/102/119 は PR #1839 で解決済、runtime-package-boundary.md L306 は未対応), #1838