---
id: learn-20261121-windows-junction-detection-dirent-false
created_at: 2026-11-21
source: case-run capture (PR #4176・Wave-4 #4172・Root Case #4167)
status: inbox
---

# Windows 環境の Node.js Dirent.isSymbolicLink() は junction を false と返すため junction 判定に使えない

- 問題事象: Node.js `readdirSync(path, { withFileTypes: true })` の `Dirent.isSymbolicLink()` が Windows junction を false と返す環境がある（本実行環境: Node v26.12.1 で再現）。junction の存在確認・復元スクリプトを Dirent ベースで書くと実在する junction を 0 件と誤判定する（誤検知ゼロ判定）
- 発生局面: case-run（PR #4176・Wave-4 #4172）の worktree 環境手順（junction 復元スクリプトの実装時）。最初の復元スクリプトが 0 件と誤判定し、pre-push Step 1 の発覚後に訂正した
- 検知方法: pre-push Step 1（鮮度チェック）の失敗実観測と、PowerShell `Get-Item` の `LinkType -eq 'Junction'` による再判定での件数不一致
- 根本原因: Windows の junction は readdir の Dirent 種別判定では symlink として報告されない実装差があり、Dirent.isSymbolicLink() の戻り値はプラットフォーム・Node 版数依存である
- 自律対応内容: junction 判定を PowerShell `Get-Item` の `LinkType -eq 'Junction'`（または `fs.lstatSync` ベースの別判定）へ変更して復元対象 55 件を正しく検出・復元し、成果物変更なし・git status クリーンを維持したまま解消した
- ユーザー確認有無: なし（監督承認済みの環境復元・成果物変更なし）
- 横展開観点: worktree の junction 復元・投影検査・ファイル走査系 checker が Windows 環境で junction を対象にする全経路に共通。Dirent ベースの列挙で「対象 0 件」を正常系として扱う実装は Windows で静かに失敗する
- 再発条件: Windows 環境で Node.js の readdir Dirent 種別により junction を判定・列挙する場合
- 予防策候補: (a) junction 判定は `Get-Item` の `LinkType` または `fs.lstatSync` ベースに統一する規約化、(b) 復元スクリプトへの期待件数突合（0 件を異常扱いする fail-fast）の追加
- 想定反映先: agentdev-git-worktree（worktree 環境手順の junction 復元）、repo-agentdev-integrity（ファイル走査系 checker の Windows 判定）、learning-pipeline（問題クラス分類の Windows 固有系）
- 関連: Case #4172、PR #4176（Findings/Capture候補に記録済み・本 entry は case-close Capture 回収分）。関連知見: 2026-11-21-worktree-prepush-skill-junction-restoration.md（junction 復元の必要性そのもの）
- タグ: Windows、junction、Node.js、Dirent、誤判定ゼロ、worktree、環境手順
