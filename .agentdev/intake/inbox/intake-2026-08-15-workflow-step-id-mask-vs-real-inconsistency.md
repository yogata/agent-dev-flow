# intake: 既存 Workflow Skill 間で STEP 識別子がマスク形式と実番号で不統一

## 発生日

2026-08-15

## 発生元

- Epic: #2099 (Command/Workflow/Capability architecture remediation)
- 取得元: PR 2114 Findings / Capture候補（OU-002 実装時の検証作業）

## 問題事象

case-open / case-auto の SKILL.md・references は STEP 識別子がマスク形式（`STEP-{N}`）で、case-close は実番号（STEP-1 等）と不統一である（Stage 0 の配布物 ID 衛生適用差）。Wave 2 で新設された5 Workflow Skill（req-define / req-save / spec-save / case-run / case-update）は実番号（STEP-N / STEP-S / STEP-W）を採用した。既存2 Skill（case-open / case-auto）の識別子統一は横断是正候補である。

## 影響

- Workflow Skill 間で STEP 参照の書式が混在し、横断参照・機械検査（STEP 識別子の抽出・照合）の前提が揃わない
- OU-005（16 Command SPEC 同期）で SPEC 側の参照様式を確定する際、現状の混在が同期対象の判断を複雑にする

## 発生局面

実装（Wave 2 Workflow Skill 新設時の様式選定と既存 Skill 比較）

## 検知方法

各 Workflow Skill の SKILL.md・references における STEP 識別子表記の grep 比較（PR 2114 検証作業）。

## 想定される対応方向

- case-open / case-auto の STEP 識別子を実番号へ統一する横断是正（または実番号を正式様式と定め SPEC に明記する方向での整理）
- OU-005（Command SPEC 同期）または OU-007（旧責務残存 cleanup）での対応候補。選定は backlog-review で判断する

## 関連

- Epic: #2099
- Issue: 2102（OU-002）, PR: 2114
- 対象: `src/opencode/skills/agentdev-workflow-{case-open,case-auto}/**`（マスク形式側）、Wave 2 新設5 Skill（実番号側）
- 関連 learning: PR 2112 Findings learning（配布物の ID ファミリーマスク制約。STEP は具体番号配布可能）

## 出典引用

PR 2114 本文 `## Findings / Capture候補` intake 節より:

> case-open / case-auto の SKILL.md・references は STEP 識別子がマスク形式（`STEP-{N}`）で、case-close は実番号（STEP-1 等）と不統一（Stage 0 の配布物 ID 衛生適用差）。新設5 skill は実番号（STEP-N / STEP-S / STEP-W）を採用。既存2 skill の識別子統一は横断是正候補。

## タグ

#intake #step-identifier #cross-cutting-normalization #workflow-skill-migration #epic-2099
