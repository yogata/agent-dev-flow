# epic-wave-model Design の REQ-030-012 / REQ-030-018 参照が dangling（REQ-030 縮小後）

## 概要

docs/designs/workflows/epic-wave-model.md L273 / L280 の `REQ-030-012` / `REQ-030-018` 参照が、REQ-030 縮小（REQ-030-012〜021 廃止）により dangling となる。

## 内容

- epic-wave-model.md L273 / L280 の廃止 REQ 行参照を縮小後の REQ-030-001〜011 対応へ修正する
- case-ready 構成系 Design のため PR #2816（OU-003、case-open 専属割当）では修正せず記録。OU-004 / OU-006 経由での整合を推奨

## 根拠

- 観測元: case 2805 OU-003（DEL-2808-1、PR #2816）本文 Findings（intake 候補）、case-close（2026-09-14）で回収
- 元テキスト: PR #2816 本文 Findings/Capture候補「`docs/designs/workflows/epic-wave-model.md` L273 / L280 の `REQ-030-012` / `REQ-030-018` 参照が dangling（縮小により行廃止）。case-ready 構成系 Design のため本 Issue の専属外。OU-004 / OU-006 経由での整合を推奨」
- 処分経緯: case-close STEP-6 Capture 回収で intake inbox へ保存
