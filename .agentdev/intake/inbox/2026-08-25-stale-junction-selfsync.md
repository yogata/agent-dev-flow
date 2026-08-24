# main 環境に残存する agentdev-gh-cli の dangling junction の除去候補

## 観測

Epic 2427 Wave 3 最終 case-close の検証差分確認で、link mode 導入済み main 作業環境の `.opencode/skills/agentdev-gh-cli` junction が、PR 2435 によるスキル削除後も残存している（dangling。接続先 `src\opencode\skills\agentdev-gh-cli` は削除済み）。junction 先が不在のため skill としては実体化せず、検証への実害はなし（integrity suite は fail 0）。

## 今回扱わない理由

`.opencode/` 配下の投影は install/self-sync 管理の成果物であり、case-close の編集対象外。install.ps1 / self-sync.ps1 の自己修復対象に削除済み配布物の junction 除去が含まれるかは配布基盤の設計判断。

## 影響

削除済みスキルの junction が環境に残り続ける。次回 install check での報告体裁、および junction 列挙系テストの計数（link mode 環境で projection 系テストが +11 個 parametrize される観測と同根）に影響する可能性がある。

## レビューで決めること

- install.ps1 / self-sync.ps1 の適用・自己修復フローへ「接続先不在 junction の除去」を組み込むか
- 組み込む場合、検証（check）での報告形式

## 根拠

- Issue 2431 対応記録コメント（case-close、検証差分の新規 finding）
- main 作業環境の `.opencode/skills/` 実体確認（2026-08-25、DEL-CLOSE-W3 実行中）
