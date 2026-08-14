# intake: 「（REQ-001, REQ-001）」引用重複が対象範囲外の5 SPEC ファイルに同一パターンで残存

## 発生日

2026-08-15

## 発生元

- Epic: #2099 (Command/Workflow/Capability architecture remediation)
- 取得元: case-run 実行（Stage 2、Issue 2101 / PR 2111）における grep 検査で発見。PR 2111 本文「## Findings / Capture候補」より case-close が回収

## 問題事象

「（REQ-001, REQ-001）」の引用重複が、OU-001（Issue 2101）の対象範囲外の次の5ファイルに同一パターンで残存している。

- docs/specs/skills/agentdev-spec-file-manager.md:13
- docs/specs/skills/agentdev-doc-diagnostics.md:13
- docs/specs/skills/agentdev-artifact-validation.md:13
- docs/specs/quality/quality-gates.md:11
- docs/specs/foundations/document-model.md:35

PR 2111 では command-file-format.md の同一パターンを「（REQ-001）」へ解消した（根拠: REQ-001-031）が、上記5ファイルは Issue 2101 の対象範囲外のため未修正。case-close の全体再 grep（merge 後 staging 35601de8 でも同一5件）で残存を確認済み。

## 影響

- 読み手に REQ-001 の二重引用と誤解させる文書品質問題（低 severity）。機能・検査への影響なし

## 発生局面

実装（case-run、OU-001 検証時の grep 検査）

## 検知方法

全リポジトリ grep: 「（REQ-001, REQ-001）」（全角括弧・全角カンマ）

## 想定される対応方向

- 5ファイル一括で「（REQ-001）」へ解消する横断是正（command-file-format.md と同一パターン、REQ-001-031 準拠）
- 採否・優先度は backlog-review で判断する

## 関連

- Epic: #2099
- Issue: 2101（OU-001）, PR: 2111
- 修正済み対称例: docs/specs/authoring/command-file-format.md（PR 2111）

## 出典引用

PR 2111 本文「## Findings / Capture候補」より:

> 「（REQ-001, REQ-001）」の引用重複が本 Issue 対象範囲外の5ファイル（docs/specs/skills/agentdev-spec-file-manager.md、docs/specs/skills/agentdev-doc-diagnostics.md、docs/specs/skills/agentdev-artifact-validation.md、docs/specs/quality/quality-gates.md、docs/specs/foundations/document-model.md）にも同一パターンで残存している。対象範囲外のため本 PR では修正せず、横断是正の intake 候補として記録する。

## タグ

#intake #req-001 #quote-duplication #cross-file-remediation #epic-2099
