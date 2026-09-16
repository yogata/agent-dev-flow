# bun test 正規形の依存解決前置（ルート package.json 不在による bun install 不能）

## 観測内容

bun test 3 分割正規形の依存解決前置としての bun install が、リポジトリルートに package.json が存在しないためルート実行で失敗する（Case #2846 F-002、Case #2856 で再確認）。worktree 作成直後や新規 clone 環境で node_modules が無い場合、`bun install --cwd <scripts 配下>`（package.json + bun.lock のある場所ごと）を前置する必要がある。ルート package.json の不在は bun install を単純実行できない不整合であり、正規形手順に明記されていない。

2026-09-16 時点の再実査: リポジトリルートに package.json は存在しない（不整合は継続）。

## 影響

- 新規環境・worktree での bun test 初動失敗の頻出要因（依存解決前置が暗黙知になっている）

## 課題（対応候補と判断材料）

- bun test 実行形態契約（QG-4 reference 等）へ依存解決前置手順（scripts 配下ごとの bun install、ルート package.json 不在前提）を明記する
- またはリポジトリルートへ最小 package.json を追加する構成変更を検討する（配布境界への影響評価が前提）
- **統合候補**: 同一ドメイン（bun test 正規形の環境前提）の intake item「worktree で bun test plugins 分割が junction 未伝播により不在」（2026-09-16）と単一 RU への統合を backlog-review で検討すること

## 既存要件との関連

- REQ-060 系（bun test 実行形態統一、RU-0003 由来）・QG-4 reference: 明記対象の実行契約
- 配布境界（distribution-boundary Design）: ルート package.json 追加案の影響評価対象

## 根拠

- 観測元: PR #2879 本文 Findings F-002（Case #2846）、PR #2880 本文（Case #2856）再確認
- 観測時 commit: PR #2879 / #2880 head
- 関連: 学び側 inbox.md の worktree bun install 対応記録（`bun install --cwd` 前置）
- 2026-09-16 再検証: ルート package.json 不在を確認
- 処分経緯: intake-promote（2026-09-16）で採用を確定（自律確定: 不整合が実査で確認済み。手順明記 vs 構成変更の分岐は後続工程で解決）
