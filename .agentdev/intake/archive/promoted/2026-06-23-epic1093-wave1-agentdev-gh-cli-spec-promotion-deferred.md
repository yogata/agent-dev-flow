# agentdev-gh-cli SPEC draft→accepted 昇格判断（見送り記録）

## 発生源

- Epic: #1093 (Wave 1)
- Issue: #1094 (REQ-0149)
- PR: #1098 (merged, squash f5454154)
- 発生日: 2026-06-23
- 処理: case-close Step 3-2 SPEC確定フロー (c) 見送り

## 内容

PR #1098 の実装が `docs/specs/skills/agentdev-gh-cli.md`（SPEC）の内容を検証した（agentdev-gh-cli を I/O hub + 操作契約 + references 分離で実装、12ファイル委譲、9手続き提供、ADR-0130 の6決定事項反映）。同 SPEC は現状 `status: draft`。case-close Step 3-2 の SPEC 昇格タイミング両条件（draft であること／実装が SPEC 内容を検証済み）を満たす。

ただし Wave 2 (#1095 ローカル版 agentdev-gh-cli) が当該 SPEC に直接依存して実装されるため、SPEC 昇格が Wave 2 実装と競合しないか慎重評価が必要。case-close Step 3-2 は本来ユーザー承認を要する判断であるため、本 case-close では見送り、次工程（Wave 2 case-close または別途 req-save）で判断する。

## 推奨対応先

- Wave 2 (#1095) case-close 時に再度 SPEC確定候補として評価
- または `/agentdev/req-save` で REQ-0149-002 へ「PR 作成」手続きを追記する際に併せて SPEC status 昇格を判断
- 昇格時は SPEC frontmatter `status: draft → accepted`、`updated` 日付を更新

## 現在の追跡状態

- agentdev-gh-cli SPEC status: draft（維持）
- #1094 Issue 本文: REQ-0149-005「references 分離」完了条件 [x] 達成、SPEC 改訂自体は完了
- 後続 Wave での SPEC確定判断待ち
