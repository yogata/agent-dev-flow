# /repo/docs-check 完了報告テンプレートに旧様式の「失敗Step」名残が残存

## 観測

`.opencode/commands/repo/templates/docs-check/standard.md` の「失敗Step（{Step名}）」が旧様式（`### Step N` 主手順）の名残として残存する。/repo/docs-check.md は PR #2274（Issue #2229）で前出出力検証表形式（STEP-1〜STEP-5 ラベル）へ移行済みで、template 側のラベル体系と噛み合わない。

## 今回扱わない理由

template は Issue #2229 の変更対象成果物外。工程ラベル（{Step名}）を埋めれば報告機能は維持されるため、PR 本文 Findings に記録のみ行われた。

## 影響

次回 /repo/docs-check 実行時の完了報告様式が本文の STEP-N ラベルと template の「Step名」表記で不一致になる。軽微だが様式統一の観点で残置すべきでない。

## レビューで決めること

- template の「失敗Step（{Step名}）」を STEP-N ラベル体系へ追従させる修正の要否と実施タイミング（command-file-format SPEC 陳腐化是正〔別 intake item〕と同時に扱うか）

## 根拠

- PR 2274 本文「Findings / Capture候補」5件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2274）
