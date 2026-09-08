---
id: intake-20260908-local-runner-readme-legacy-issue-comment-2693
title: src/opencode-local/agentdev-gh/README.md 等の #2688 作業範囲に残る旧 issue_comment 記述の更新候補
created: 2026-09-08
status: inbox
---

## 概要
- PR: #2693（Issue #2689・Epic #2686 Wave 2・OU-002 呼出元移行と issue_comment 廃止）
- 発見経路: case-run 移行インベントリ再構成（PR 本文 Findings / Capture候補 セクション由来）

## 内容
- `src/opencode-local/agentdev-gh/README.md` 等に、子 Issue #2688（Local 版等価実装）の作業範囲として残る旧 `issue_comment` 操作の記述がある（操作読み替え規則テーブルの `issue_comment` 行、ヘッダ契約説明の「温存中の issue_comment」等）。
- issue_comment 廃止後の現行カタログ（16操作）では、README の操作一覧と実装（runner-local.ts から issue_comment ハンドラ除去済み）にずれが生じている。
- #2688 の実装範囲（実装コード・スキーマ・テスト）ではなく説明文書面の更新であり、本 PR（#2693）では対象外とした。

## 対応候補
- src/opencode-local/agentdev-gh/README.md の操作読み替え規則テーブルとヘッダ説明を 16操作カタログへ整合させる（docs 更新。後続判断）。
