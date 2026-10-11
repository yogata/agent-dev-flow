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

## 冪等検索の search トークンに topic_slug を単独使用すると本文に投影されない構成の Root Case を検出できない

- **問題事象**: case-open 工程の冪等検出で issue_list の search に topic_slug（case-open-skill-v5-vocabulary）を単独使用した。Root Case のタイトルと本文は topic_slug を含まない構成（issue-title-policy が topic_slug をタイトルから除く情報に指定、本文投影範囲にも topic_slug を含めない運用）であるため、当該トークンでは既存同主題 Root Case が存在しても検出できない構造になっていた
- **発生局面**: 実装（case-open STEP-2 直前の既存 Root Case 冪等検出、GitHub Issue 検索）
- **検知方法**: STEP-5 の冪等再確認で本文語彙（設計根拠対応）による再検索に切替した際、topic_slug トークンが Root Case 本文の実在語彙と接続していないことに気付いた（手動確認）
- **根本原因**: search トークン選択指針（冪等キー語、REQ 番号、topic_slug 等の例示）において、例示語が対象 Issue 本文に投影されない語である場合の無効性に注意が向いていなかった。検索トークンの有効性は本文実在語彙との照合で確認する必要がある
- **自律対応内容**: STEP-5 の冪等再確認で本文に実在する選択性ある語（設計根拠対応）にトークンを切替し、既存 Root Case が自 Case（#3625）のみであることを検出確認した。重複生成なしを確認
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: issue_list の冪等検索では、search トークンが対象 Issue 本文の実在語彙であることを起票済み本文との照合で確認してから使う。タイトル・本文から除外される情報（topic_slug、投入識別子等）をトークンの単独根拠にしない
- **再発条件**: Root Case 本文へ topic_slug を投影しない構成の Case で、冪等検索トークンに topic_slug を単独使用したとき
- **予防策候補**: 冪等検索の search トークンは REQ 番号・主題語等の本文実在語彙から選ぶ運用ルール。SKILL 側 search トークン選択指針の topic_slug 例示への注記（本文投影される語に限る旨）の必要性は learning-promote での昇華判断に委ねる
- **想定反映先**: agentdev-issue-management（issue-operation-safety.md の search トークン選択性指針）または agentdev-workflow-case-open SKILL 本文の冪等分岐節
- **関連**: Root Case #3625、src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md、docs/designs/workflows/issue-title-policy.md
- **タグ**: `#gh-workaround` `#idempotency`
