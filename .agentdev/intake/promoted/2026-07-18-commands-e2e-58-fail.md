# commands_e2e.test.ts 58件 fail（廃止コマンド参照 / README エンコーディング）

## 観測内容
- PR #1529 の事前由来の失敗。`commands_e2e.test.ts` が58件 fail
- 主な原因: 存在しないコマンド（`req-restructure-review` 等）の README listing 要求、README エンコーディング問題によるドリフト

## 影響
- 58件のテスト失敗。main でも同様の失敗が発生
- QG-4 での確認記録として扱われているが、本来は解消すべき

## 課題
- 廃止コマンド（`req-restructure-review` 等）への参照をテスト期待値・README から除去する
- README エンコーディング問題を是正し、ドリフトを防ぐ

## 既存要件との関連
- 事前由来の問題（本件単体では該当要件なし）

## 対応方針の方向性
- 廃止コマンドの一覧を作成し、README listing とテスト期待値の整合性を確認
- README エンコーディング（BOM なし UTF-8 等）を統一
- inspect 系コマンドで同種のドリフトを finding 化する仕組みの導入を検討

## 出典
- 元 intake item: intake-2026-07-16-0905-commands-e2e-58-fail.md
