# workflow-skill-model SPEC の順序ラベル文言が command-file-format・checker と不整合（STEP-N ラベル統一解釈の確定記録を含む）

## 観測

docs/specs/workflows/workflow-skill-model.md 34行「thin Command の workflow 節の順序ラベルは `### Step N` 形式に統一する」が、次の2点と不整合している。

- command-file-format.md（accepted）の手順セクション形式: `### Step N` 見出しの逐次列挙を廃止し前出出力検証表で記述する規定（「順序ラベル様式」節: 工程一覧表ラベルは STEP-N または同等の連番形式、旧 Step N 形式参照は是正対象）
- check_command_format.ts の公開 Command `### Step` 見出し検出（`### Step N` 見出しは違反）

PR 2281 の実装解釈では、Issue 文言「公開順序要約を ### Step N 形式へ揃える」を「正規連番様式 STEP-N ラベルへの統一（表形式維持）」と解釈して適用した（AG-022 様式確定に基づく）。正規形は「`## workflow` セクション + 前出出力検証表（STEP-N ラベル）」である。

## 今回扱わない理由

workflow-skill-model.md は draft SPEC であり、当該文言の修正は SPEC 本文編集を伴うため case-close の capture 責務（回収・保存）の対象外。PR 2281 の実装は command-file-format.md（accepted）側の解釈に適合しており、昇格判定において「今回の実装が SPEC 内容を検証済み」とは判定できない（矛盾する文言のため）。

## 影響

draft SPEC の当該行が正規形と逆の指示を与え続ける。読者が `### Step N` 見出し化を正と誤読すると checker 違反を生む。

## レビューで決めること

- workflow-skill-model.md 34行の文言を「前出出力検証表（STEP-N ラベル）」正規形へ修正するか
- 修正を単独 spec-save / case で行うか、system.md 残存等の他の様式是正と統合するか

## 根拠

- PR 2281 本文「SPEC確定候補」1件目・2件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2281）
- docs/specs/authoring/command-file-format.md「順序ラベル様式」節（PR 2264、OU-0022 で様式確定済み）
