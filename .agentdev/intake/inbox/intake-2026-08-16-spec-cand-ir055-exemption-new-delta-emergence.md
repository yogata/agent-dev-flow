# Intake Item: IR-055 プレースホルダ行免除が新規 delta を顕在化させる挙動の文面化

## 発生源

- PR: #2185 (Issue #2180 / OU-002, Epic #2178 Wave 2)
- 発生 phase: case-run 実装
- capture 分類: intake（SPEC確定候補、backlog 化）

## 問題

IR-055 の isIr055ExemptLine は {NNNN} 等プレースホルダを含む行全体を走査免除する。description 圧縮でプレースホルダが消えた際、従来免除されていた docs/specs/ 等の heuristic 参照が新規 delta として顕在化し得る（PR #2185 では agentdev-workflow-spec-save で実際に発生し、description からパス表記を除去して解消した）。

## 推奨対応

本挙動（プレースホルダ除去に伴う exemption 外れと新規 delta 顕在化）を整合性ルールカタログまたは checker 実行契約の文面へ明記する。SPEC 本文の確定は backlog 化する。

## 関連

- Issue: #2180 (CLOSED), Epic: #2178
- PR: #2185 (SPEC確定候補 セクション 2)