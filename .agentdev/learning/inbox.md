# 学び・教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類・整理して永続的なドキュメントに移動する。

---

## 2026-06-18: case-open cleanup で git add -A を使用すると意図しないファイル削除が混入するリスク

**状況**: case-open の後段処理（draft/RU削除）で `git add -A` を使用したところ、過去のcase-auto実行で作業ディレクトリから物理削除されていた他のtracked draftファイルの削除も同時にstagingしてしまった。対象外のdraft 2件が誤削除され、復元commitが必要になった。

**学び**: cleanup処理で `git add -A` を使う前に `git status` で意図しない変更・削除がないか必ず確認すること。または、削除対象ファイルのパスを明示的に `git rm` / `git add` で指定し、`git add -A` を避けること。

**再発防止**: case-open/case-close のcleanup stepでは、削除対象ファイルを明示的に指定して staging する。

