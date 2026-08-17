# IR-055 プレースホルダ行免除が新規 delta を顕在化させる挙動の文面化

## 観測内容

IR-055 の isIr055ExemptLine は {NNNN} 等プレースホルダを含む行全体を走査免除する。description 圧縮でプレースホルダが消えた際、従来免除されていた docs/specs/ 等の heuristic 参照が新規 delta として顕在化し得る（PR #2185 では agentdev-workflow-spec-save で実際に発生し、description からパス表記を除去して解消した）。

## 影響

- プレースホルダ除去という正当な編集が、checker 上の新規違反顕在化として現れるため、delta 分類時の由来判断を都度要求される

## 課題

本挙動（プレースホルダ除去に伴う exemption 外れと新規 delta 顕在化）を整合性ルールカタログまたは checker 実行契約の文面へ明記する。SPEC 本文の確定は spec-save 手続きの範囲。

## 既存要件・成果物との関連

- 対象: integrity-rule-catalog（IR-055）、checker 実行契約
- 実績: PR #2185（agentdev-workflow-spec-save で発生・解消）
- 関連: 2026-08-16-spec-cand-ir055-exemption-narrowing.md（exemption 狭域化検討、統合候補）

## 出典

- 発生日: 2026-08-16
- 発生源: PR #2185 (Issue #2180 / OU-002, Epic #2178 Wave 2) SPEC確定候補 セクション 2
- 元 item: intake-2026-08-16-spec-cand-ir055-exemption-new-delta-emergence.md
