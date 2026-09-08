# src/opencode-local/agentdev-gh/README.md の16操作カタログへの整合更新

## 観測内容

`src/opencode-local/agentdev-gh/README.md` に旧 `issue_comment` 操作の記述が残存している（操作読み替え規則テーブルの `issue_comment` 行、ヘッダ契約説明の「温存中の issue_comment」等）。issue_comment は PR #2693 で操作カタログ・契約型・公開スキーマから廃止され、runner-local.ts からもハンドラが除去済みである。README の操作一覧と実装の間にずれが生じている。これは #2688（Local 版等価実装）の実装範囲外とされた説明文書面の更新である。

## 影響

- Local 版利用者が README の操作読み替え規則を信頼して issue_comment を呼び出すと、廃止済み操作として invalid-input になる
- ヘッダ契約説明が「温存中」と移行前の状態を示し続ける

## 変更候補

- README.md の操作読み替え規則テーブル・ヘッダ契約説明を16操作カタログ（comment_create / comment_list / comment_update / comment_delete を含む）へ整合させる
- あわせて README 内の pr_read 記述が #2688 完了後の現行実装（論理 PR 本文3セクション直列化）と一致することを確認する

## 既存要件・成果物との関連

- `docs/designs/local/local-case-file.md`（Local 物理表現の正規所有 Design）
- `docs/designs/responsibilities/custom-tool-contracts.md`（16操作カタログ）
- 同日実施の inspect-docs 検出事項 F-03（opencode-local README 陳腐化）と同根。backlog-review での統合対象

## 出所

- 元 intake item: `2026-09-08-local-runner-readme-legacy-issue-comment-2693.md`（PR #2693 Findings/Capture候補由来、Issue #2689・Epic #2686 Wave 2）
