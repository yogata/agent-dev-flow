# custom-tool-contracts Design の内容確定候補（agentdev_gh ツール詳細）

## 観測

PR 2435（Issue 2431、OU-004）の実装により、custom-tool-contracts.md（accepted、Wave 2 で 18750fc3 昇格）が所有すべき事項が確定した。Design 本文は「ツール名・公開単位・ファイル構成は本 Design の後続更新で確定する」と预留けしており、後続更新の素材が揃った:

- ツール名 `agentdev_gh`
- 登録配線: Plugin `agentdev-gh-tool` + depth-1 ローダーシム（OpenCode のプラグイン自動読み込みが `.opencode/plugins/` 直下ファイルのみのため、install.ps1 / self-sync.ps1 / consumer archive install が生成・検証・自己修復）
- 出力 URL の識別子規則: GitHub 実装は https URL、Local 実装は絶対パス識別子
- args スキーマ形式: zod 非依存の JSON Schema 構造（OpenCode registry の legacy 経路で登録、入力検証は Tool 本体の操作契約が厳密実施）

## 今回扱わない理由

accepted Design への内容追記は design-save 工程の管轄。case-close の Design 確定は draft の status 昇格のみを編集範囲とするため、本件は昇格対象ではなく design-save ルートで扱う。

## 影響

Design が確定値を持つまで、ツール名・登録配線・args 形式の正規記述が src 側実装（plugin.ts、runner-cli.ts、README）にのみ存在する。

## レビューで決めること

- Design 記載の粒度（契約として正規所有する範囲と、実装詳細参照にとどめる範囲）
- ローダーシム機構の記載先（本 Design か runtime-package-boundary.md か。item「2026-08-25-design-confirm-runtime-package-boundary.md」との配分）

## 根拠

- PR 2435 本文「Design確定候補」item 1
- Issue 2431 対応記録コメント（case-close、Design確定の節）
