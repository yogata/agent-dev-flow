# agentdev-traceability の corpus が .ps1 を走査しない

## 観測

agentdev-traceability の corpus（正規成果物コーパス走査）は `.ps1` を走査対象に含まないため、`scripts/*.ps1` に直接記述した ADF-COVERS 宣言は check に反映されない。実装行の宣言を Design 側へ置く運用（runtime-package-boundary.md の注記）は既存だが、新規配布種別・新規スクリプト追加時に見落としやすい。

## 今回扱わない理由

 corpus 対象の拡張は traceability スキルの仕様変更を伴う。PR 2434（OU-003）は配布種別の実装が対象であり、traceability corpus 仕様の変更は含まれない。

## 影響

PowerShell スクリプトへ宣言を置いた要件行は missing-implementation として報告され続け、宣言配置の正規運用（Design 側配置）と検査結果が乖離して見える。

## レビューで決めること

- 配布種別追加時の宣言配置チェックを inspect 系（inspect-docs / inspect-skills）の観点として追加するか
- corpus の .ps1 対象拡張を実施するか、Design 側配置運用の周知で済ませるか

## 根拠

- PR 2434 本文「Findings / Capture候補」intake 1件目
- src/opencode/skills/agentdev-traceability/scripts/lib/corpus.ts（走査対象定義）
