# Intake Item: OU-001（Issue 2200）SPEC確定候補の見送り記録 — backlog-auto SPEC 本文への反映提案群

## 発生源

- PR: #2201 (MERGED 962dc688) / Issue: #2200 (case-close SPEC 確定フロー処理パターン (c) 見送り)
- 発生 phase: case-close SPEC 確定（STEP-3-2）
- capture 分類: intake（SPEC 変更候補）

## 問題

PR #2201 本文の「SPEC確定候補」のうち case-close で確定できなかったもの:

1. agentdev-workflow-backlog-auto SPEC（docs/specs/skills/agentdev-workflow-backlog-auto.md、今回 draft→accepted 昇格済み）「fan-in 判定」節への系統別結果状態読み替え表の明記候補。現行 SPEC は「対象なし終了」の正常扱いのみを定義し、learning-promote の inbox.md 不在時の子コマンドエラー報告を対象なし終了へ読み替える mapping は references/stage-execution.md の実装詳細として定義した。SPEC 側へ昇格するかは判断が割れるため後続へ委ねる。

2. 直列化キューの実行単位（子ワークフローが定義する永続化ポイント = commit 単位）の SPEC 明記候補。現行 SPEC の直列化契約は対象種別のみを列挙し、実行単位は reference 側の詳細としている。

## 推奨対応

両候補とも SPEC 本文変更を要するため spec-save 手続きの範囲。本記録を入力として後続の backlog-review / spec 更新 Issue で取捨選択する。なお対象 SPEC 自体は今回の実装・検証完了により accepted 昇格済み（case-close STEP-3-2 パターン (a)）であり、本記録は本文内容の改善候補のみを扱う。

## 関連

- Issue: #2200 (CLOSED), PR: #2201 (MERGED 962dc688)
- SPEC: docs/specs/skills/agentdev-workflow-backlog-auto.md (accepted), docs/specs/commands/backlog-auto.md (accepted)
- 参考: references/stage-execution.md（読み替え表・直列化キューの現行実装詳細）
