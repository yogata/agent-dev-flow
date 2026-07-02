# docs/specs/local/local-generation.md に旧語彙が残存

## 観測内容

PR #1344 の TS-003 検証で対象12ファイル外の `docs/specs/local/local-generation.md` にも旧語彙（変換プロンプト等）が7件存在することを確認した。行82、147、149、151、165、167、221 に該当表現。一部は節見出しとして構造化されている。Issue #1341 完了後も未解決であることを再確認した。

## 影響

- 実動作への影響なし
- SPEC として現行語彙へ未是正

## 課題

- 既存 intake `2026-06-27-local-generation-word-fix.md` との統合判定（重複エントリの整理）
- 旧語彙のうち「変換プロンプト廃止経緯」節見出しは SPEC 構造上の意図的保持か、現行語彙へ再構成すべきか
- 「link mode 移行に伴う廃止経緯」への節タイトル変更を含むか

## 既存要件との関連

- REQ-0141 系: link mode 移行関連文書
- ADR-0131: link mode 語彙への移行
- 本 item は `2026-06-27-local-generation-word-fix.md` と同じファイルの同一問題を指す（近接重複、統合推奨）
- link mode / 変換プロンプト legacy vocabulary 残存クラスターに属し、backlog-review での統合を推奨

## 観測元

- PR #1344
- Issue #1341
- 既存 intake: `2026-06-27-local-generation-word-fix.md`（PR #1195 / Issue #1193）
