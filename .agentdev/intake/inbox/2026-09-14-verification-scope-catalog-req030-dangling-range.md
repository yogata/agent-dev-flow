# verification-scope-catalog の REQ-030 範囲参照が dangling（REQ-030 縮小後）

## 概要

verification-scope-catalog.md L153 の `REQ-030-001..REQ-030-021` 範囲参照が REQ-030 縮小（REQ-030-012〜021 廃止）後に dangling となる。検証対応要否カタログの参照更新が必要。

## 内容

- verification-scope-catalog.md L153 の範囲参照 `REQ-030-001..REQ-030-021` を REQ-030-001〜011 へ縮小する
- OU-006（#2811）の専属割当「検証カタログの REQ-030 旧行参照の確認・修正」で解消予定。PR #2816（OU-003）では修正せず記録のみ

## 根拠

- 観測元: case 2805 OU-003（DEL-2808-1、PR #2816）本文 Findings（intake 候補）、case-close（2026-09-14）で回収
- 元テキスト: PR #2816 本文 Findings/Capture候補「`verification-scope-catalog.md` L153 の `REQ-030-001..REQ-030-021` 範囲参照が REQ-030 縮小後に dangling（REQ-030-012〜021 廃止）。OU-006（#2811）の専属割当『検証カタログの REQ-030 旧行参照の確認・修正』で解消予定。本 PR では修正せず記録」
- 処分経緯: case-close STEP-6 Capture 回収で intake inbox へ保存
