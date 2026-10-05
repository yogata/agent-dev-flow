# worktree で link profile checker が zero-targets となり link-mode 検査が未完了になる実行経路の統一候補

## 観測

Case #3485（PR #3490）の case-run で、worktree `.worktrees/3485-case/` から配布依存境界 checker `--profile link` を実行したところ、worktree に `.opencode/skills/` の link projection（junction）が伝播しないため `zero-targets:link`（scanned_files 0）で停止した。実行担当は迂回・junction 作成を行わず、未検証のまま PR 本文に記録した。case-close（STEP-3）で main root・読取専用による `--profile link` 再実行を行い、`ok=true`、failures 0、scanned 343（case-run 取りまとめコメントの補完実行と同一結果）で最終 gate 合格を確認済み。

## 今回扱わない理由

main root 実体 + 読取専用再実行への切替条件（投影構成不能・検査対象が空・結果の信頼性が確保できない場合）は checker 実行契約 Design「worktree 環境での checker 実行 fallback（junction 未伝播時の SoT 直参照）」節で既に契約化されており、本 Case は当該契約の適用で完結した。case-run STEP-S5 時点での link profile 実行経路の標準化（main root 指定の事前統一）や、worktree 実行時の事前ガイド組み込みは本 Case の対象範囲外。

## 影響

- case-run の実行担当が link profile を worktree で実行して zero-targets となり、未検証 finding が PR 本文へ記録され、case-close での補完実行が必須になる（工程間の往復コスト）
- zero-targets の実行を clean 扱いしない運用（無効分類）を毎回手動で判断している
- worktree で junction を自作してしまう誘因が残り、環境汚染リスクが継続する

## レビューで決めること

- case-run STEP-S5 の link profile 実行を main root 指定に事前統一するか（実行環境ラベルの判定を checker 起動手順の前置に組み込むか）
- worktree 実行時の zero-targets 検出を checker 側で事前ガイド（main root 切替の自動案内）へするか
- case-run / case-close 間の link profile 補完実行の結果引き継ぎ形式（実行環境ラベル付きコメント）を標準化するか

## 根拠

- PR #3490 本文「Findings / Capture候補」intake 候補（worktree link projection 未伝播、link-mode 検査未完了の記録）
- case-close 対応記録コメント（Issue #3485）検証差分節: main root・読取専用再実行で `ok=true` failures 0 scanned 343
