# bun test 正規形の bun install がリポジトリルート package.json 不在で実行不能

## 内容

bun test 3 分割正規形の依存解決前置としての bun install が、リポジトリルートに package.json が存在しないためルート実行で失敗する（Case #2846 F-002、Case #2856 で再確認）。worktree 作成直後や新規 clone 環境で node_modules が無い場合、`bun install --cwd <scripts 配下>`（package.json + bun.lock のある場所ごと）を前置する必要がある。ルート package.json の不在は bun install を単純実行できない不整合であり、正規形手順に明記されていない。

## 提案

bun test 実行形態契約（QG-4 reference 等）に依存解決前置手順（scripts 配下ごとの bun install、ルート package.json 不在前提）を明記する。またはリポジトリルートへ最小 package.json を追加する構成変更を検討する（配布境界への影響評価が前提）。

## 根拠

- 観測元: PR #2879 本文 Findings F-002（Case #2846）、PR #2880 本文（Case #2856）再確認
- 観測時 commit: PR #2879 / #2880 head
- 関連学び: inbox.md「worktree で bun test 実行時、ルート package.json が存在せず...」（bun install --cwd 前置の個別対応記録）

## 分類

- 分類: intake（正規形手順の明記 or 構成変更の検討）
- 変更種別: docs または config（実行契約の補足が軽微、構成変更は影響評価必要）
- 優先度: 中（新規環境での bun test 初動失敗の頻出要因）
