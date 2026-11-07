# worktree での .agentdev/tmp 前提テスト（req-id-roundtrip ENOENT）

## 観測内容

`req-id-roundtrip.test.ts` が `mkdtempSync(join(process.cwd(), ".agentdev/tmp/..."))` を前提とし、worktree（.agentdev 未整備）で ENOENT になる。worktree での full suite 実行時に環境依存 fail として毎回顕在化する。merge 直前 HEAD 9680a8eb1 と baseline afd9e0607（detached worktree）の双方で同一 error を再現（pre-existing 分類・環境依存）。`.agentdev/tmp/` はメインリポジトリ側では gitignore 管理対象の実行時領域であり worktree へ未伝播。

観測元: PR #3904 本文 `## Findings / Capture候補`（### intake 第2項）、Issue #3902（case-close 対応記録コメント 6617043300）。

## 影響

worktree での full suite 実行が毎回環境依存 fail で妨げられ、worktree での検証の信頼性と効率を損なう。

## 課題

整備方針の検討候補: (1) worktree への tmp dir 事前作成（worktree 整備側での対応）、(2) テスト側の自動作成（テスト堅牢化側での対応）。方針の選択は backlog-review 以降の判断に委ねる。

## 既存要件との関連

- REQ-018（worktree 構造的制約とテスト fallback）の関連系統。REQ-018-008 は worktree root 相対の `.agentdev/tmp/` を証跡退避先として規定するが、その存在保証の責務を定める REQ 行は既存にない。
- 対論型レビュー（intake-promote STEP-2）で、現在の main HEAD においてテストに `.agentdev/tmp` の事前作成処理が存在しないことを実在確認済み（mkdirSync の import はあるが `.agentdev/tmp` 自体の作成は行っていない）。
