# runtime-package-boundary Design の更新候補（link mode 接続表・ローダーシム・.gitignore）

## 観測

PR 2435 の実装により、runtime-package-boundary.md（accepted）の link mode 記述と実装の乖離が確定した:

- link mode 接続表の更新: `-LocalMode` の差し替え先が `skills/agentdev-gh-cli` から `tools/agentdev-gh`（→ `src/opencode-local/agentdev-gh-cli/`）へ変更。link mode 自動検出も tools リンク先ベースへ更新
- ローダーシム生成: install.ps1 / self-sync.ps1 / consumer archive install が junction に加えて `<package>.ts` 1行再エクスポートのローダーシムを生成・検証・自己修復
- 推奨 .gitignore へ `.opencode/plugins/agentdev-*.ts`（ローダーシム）を追加

## 今回扱わない理由

accepted Design への内容更新は design-save 工程の管轄。case-close の編集範囲（status 昇格のみ）の外側。

## 影響

Design の接続表が旧差し替え先（skills/agentdev-gh-cli）を案内し続ける。ローカル版導入手順の正規記述が src 側実装にのみ存在する。

## レビューで決めること

- 接続表・シム機構・.gitignore 推奨の記載構成
- item「2026-08-25-design-confirm-custom-tool-contracts.md」（登録配線の契約側）との記載配分

## 根拠

- PR 2435 本文「Design確定候補」item 2、「配布・検査基盤」節
- Issue 2431 対応記録コメント（case-close、Design確定の節）
