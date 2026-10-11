# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## agentdev_gh issue_create で role: case に対し kind を渡すと input contract 違反で拒否される

- **問題事象**: case-open 工程で Root Case を agentdev_gh issue_create により起票した際、role: "case" と kind: "task" を同時に渡すと input contract 違反（invalid-input、detail: kind requires role 'tracking'）で拒否され、作成が1回失敗した
- **発生局面**: 実装（case-open STEP-2 の Root Case 起票、GitHub Issue 作成）
- **検知方法**: agentdev_gh の即時応答（ok: false、failure.kind: invalid-input、retryable: true）
- **根本原因**: kind フィールドは追跡Issue（role: tracking）専用の論理属性であり、Case Issue（role: case）の入力契約では受け付けない。追跡Issue 論理スキーマの role と kind の適用条件を誤って Case 起票へ重畳適用した
- **自律対応内容**: kind フィールドを除去し、role: "case" と labels（検索・整理用 work_type ラベル）のみで再呼出しして作成に成功した。Tool は fail-fast で応答し、VERIFY は 2回目の呼出しで通過した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: Tracking / Case / Epic / 子 Issue の起票でも role に応じたフィールド適用条件を確認してから呼出す。issue_create の kind は role: tracking のときのみ有効
- **再発条件**: Root Case や追跡Issue 起票で issue_create の入力に role と kind を無条件に両方設定したとき
- **予防策候補**: role が case / tracking のどちらかを先に確定し、kind は tracking のときのみ設定する呼出し前チェック。Custom Tool 操作契約 Design の issue_create 入力契約（role/kind 適用条件）の確認
- **想定反映先**: agentdev-issue-tracking（追跡Issue 論理スキーマの role/kind 適用条件の明示）または Custom Tool 操作契約 Design の issue_create 入力契約の注記
- **関連**: .agentdev/extensions/skills/agentdev-workflow-case-open.yaml、Root Case #3623、src/common/skills/agentdev-workflow-case-open/references/root-case-and-definition-package.md
- **タグ**: `#gh-workaround` `#custom-tool`
