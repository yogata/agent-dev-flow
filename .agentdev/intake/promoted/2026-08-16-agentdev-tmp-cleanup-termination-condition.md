# .agentdev/tmp/ 一時ファイルのワークフロー終了条件における残存確認の欠落

## 観測内容

ケース完了後も `.agentdev/tmp/`（untracked、gitignore 未定義）にワークフロー実行由来の一時ファイルが残存する。2026-08-16 時点で19ファイル（8/15-16 の完了済みケース #2135-2143 / #2146 / #2176 / #2178 由来）を確認。内訳:

| 由来 | ファイル種別 | 作成主体 |
|---|---|---|
| Wave 準備 | `wave1/issue-*.md`、`wave3/issue-*.md`（Issue 本文 snapshot） | case-run / case-auto（fan-out 準備） |
| case-close 実行 | `cc2176-*.json`（state json）、`pr2146-close-comment.md` | case-close |
| gh CLI READ 経路 | `gh-read-*.md`（今回残存なし、規定上は発生し得る） | 各ワークフロー共通 |

実態調査（src/opencode 全 grep、該当1ファイル）:

- `.agentdev/tmp/` の利用規定は `agentdev-gh-cli/references/standard-procedures.md` のみが所有。gh/git 日本語 I/O の正規配置先として定義される
- WRITE ユニットには cleanup 規定が存在（VERIFY PASS 後に `gh-temp-*` / `title-patch-*` / `commit-msg-*` / `commit-verify-*` を削除。FAIL 時は原因調査のため残置）。case-open の日本語 title 2段階作成（title-patch JSON）はこの規定で覆われ、今回の残存に case-open 由来はなし
- cleanup 規定が存在しない経路: (1) gh CLI READ 経路の一時ファイル（`gh-read-*`）(2) orchestration 由来のファイル（Issue 本文 snapshot、case-close state json、コメント草稿）— いずれもワークフロー終了条件での言及なし
- case-run（STEP-S6 / STEP-W5）、case-close（完了判定・E6）、case-auto（STEP-8 完了報告）のいずれの終了条件にも tmp/ 残存確認がない
- 付随ギャップ: 手順例は `.agentdev/tmp/` ディレクトリの事前存在を仮定し mkdir を含まない

## 影響

- 完了済みケース由来の一時ファイルが untracked のまま蓄積し、リポジトリ作業環境の健全性を損なう

## 課題

1. 各ワークフロー skill の終了条件・完了報告 STEP へ「当該実行で `.agentdev/tmp/` に作成したファイルが残存していないこと」の確認を追加（対象: case-run STEP-S6/STEP-W5、case-close 完了判定、case-auto STEP-8、其他 tmp/ に書くコマンド）
2. gh-cli standard-procedures.md の READ 経路（gh-read-*）にも WRITE ユニットと同様の cleanup 規定を追加
3. 手順例へ mkdir 再帰作成を追加（`New-Item -ItemType Directory -Force` / Node.js `mkdirSync(recursive:true)`）
4. `.gitignore` へ `.agentdev/tmp/` 追加の検討（明示パス staging 運用との整合確認を条件とする）

## 既存要件・成果物との関連

- 規定箇所: src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md（cleanup 規定は WRITE ユニットのみ）
- 由来: Epic #2178 (CLOSED / COMPLETED)、case-auto 全 Wave 完了後の残存
- 残存ファイルは 2026-08-16 に全削除済み（ユーザー判断: 使い終わったタイミングで削除すべき）

## 出典

- 発生日: 2026-08-16
- 発生源: ユーザー指摘（case-auto Epic #2178 完了後の残存確認）
- 元 item: intake-2026-08-16-agentdev-tmp-cleanup-termination-condition.md
