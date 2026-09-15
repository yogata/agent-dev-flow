# traceability check unclassified 72 行の段階解消（既存 36 行のカタログ棚卸し漏れ）

## 内容

case-ready STEP-6 の検証ゲートで agentdev-traceability `check.ts`（--root .）を実行したところ、全 973 現行要件行のうち 72 行が `verificationClassification: unclassified`（検証対応必須 / 検証対応任意のいずれにも分類されていない状態）と判定された。うち 36 行は case-open がカタログ登録ゲートを実行しなかったことが直接原因の新規行（学び側で capture 済み）だが、残り 36 行は今回の Case と無関係な**既存行の棚卸し漏れ**である。

既存 unclassified 36 行の内訳:

- REQ-001-004 / 005 / 016 / 018 / 019 / 046 / 048 / 049 / 061 / 063 / 064（11 行。文書体系の基準行）
- REQ-004-007 / 008 / 009 / 023 / 024 / 025 / 026 / 027 / 028 / 029 / 030（11 行。要求の形成と合意の基準行）
- REQ-017-018（1 行。Issue Execution Contract）
- REQ-050-015（1 行。scripts 公開入口境界）
- REQ-058-001..012（12 行。カタログ自体に REQ-058 節が存在しない）

verification-scope-catalog.md は「棚卸し方針と実施記録」で全現行要件行の判定履歴を保持しているが、上記行・節は棚卸し対象から漏れているか、REQ 追加・行追加時の追随が完了していない。REQ-058（ADF 管理投影物の廃止時クリーンアップ契約、12 行）は REQ 全体のカタログ節が欠落している。traceability check はカタログ未登録行を検証対応必須として安全側に扱うため、これらの行は恒久的な covers 宣言を要求する状態になっており、REQ-057-027（段階解消運用）の対象選定時に毎回 fail 計上候補として残存する。

## 提案

REQ-057-027 の段階解消運用（実測 check 実行結果に基づく対象選定）に従い、verification-scope-catalog.md への既存 36 行の棚卸しを実施する。各 REQ の行性質（恒続的検証対象の有無）を判定し、実行時振る舞い行は任意行エントリとしてカタログに追加する（REQ-001/004/017/050 の範囲表現拡張または行列挙追加、REQ-058 節の新設）。実装対応宣言（ADF-COVERS）の付与が適切な行はカタログ登録ではなく宣言付与で解消する。作業は docs 変更（カタログ編集）を伴うため、要件化（RU 化）または Case 単位の Definition 変更として実行する。

## 根拠

- 観測元: case-ready 実行（Case #2821〜#2858 Batch 1〜4 の STEP-6 検証ゲート、2026-09-15）
- 検出手段: `bun .opencode/skills/agentdev-traceability/scripts/src/check.ts --root .` の `verificationClassification` 出力（unclassified 72 行 = 今回新規 36 行 + 既存 36 行）
- 根拠 1: check 出力の unclassified リストに REQ-001 x11・REQ-004 x11・REQ-017-018・REQ-050-015・REQ-058-001..012 が含まれる（今回の Case 対象行外の既存行）
- 根拠 2: docs/designs/foundations/references/verification-scope-catalog.md の「任意行エントリ」節には REQ-058 節が存在せず、REQ-057 節の後に REQ-059 節が続く
- 根拠 3: カタログ未登録行は traceability check の安全側既定（検証対応必須扱い）により missing-verification 計上対象となり、REQ-057-027 の段階解消運用の反復対象として残存する

## 分類

- 分類: intake（具体的修正対象あり: docs/designs/foundations/references/verification-scope-catalog.md の任意行エントリ棚卸し）
- 変更種別: docs（カタログ棚卸しと範囲表現追随。REQ-057-027 の段階解消運用に接続）
- 優先度: 中（traceability check の反復 fail 計上候補として残存し、検証対応要否分類の完全性を損なう。既存 36 行は今回の Case 実行の障害ではないが、次回以降の REQ 行追加 Case で同等の ready 停止を誘発し得る）
