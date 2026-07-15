# Intake Item: baseline 11件の件数定義と具体リスト化 (SPEC 追記候補)

## 発生源

- PR: #1525 (Issue #1516 / OU-001, Epic #1515 Wave 1)
- 発生 phase: case-run SPEC 確定候補分析
- capture 分類: intake (具体的修正対象 = SPEC 本文)

## 問題

SPEC harness-separation-model.md「baseline 既知違反」サブセクション (L81-84) に baseline 11件の具体リストが未記載。「src/opencode/ 配下の既知違反 (baseline 11件)」と件数のみ記載され、厳密な TS-001/002 判定ができない状態。

件数定義 (ファイル単位 vs マッチ単位) も SPEC に未明記。現在の grep 結果 (識別子 58 matches / 18 files、docs 内部パス 122 matches / 39 files) がすべて baseline 扱いか否かの厳密判定が不可。

## 推奨修正対象

docs/specs/foundations/harness-separation-model.md「baseline 既知違反」サブセクションへ:

1. baseline 11件の件数定義 (ファイル単位かマッチ単位か) を明記
2. baseline 11件の具体リスト (ファイルパス・行番号・違反内容) を追記
3. これにより TS-001/002 の機械化判定 (baseline 除き 0件) が可能になる

## 関連

- SPEC: docs/specs/foundations/harness-separation-model.md
- Issue: #1516 (CLOSED)
- PR: #1525 (SPEC確定候補セクション)
- REQ: REQ-0162-007/008
