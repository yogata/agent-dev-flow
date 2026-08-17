# OU-001（Issue 2200）SPEC確定候補の見送り記録 — backlog-auto SPEC 本文への反映提案群

## 観測内容

PR #2201 本文の「SPEC確定候補」のうち case-close で確定できなかったもの:

1. agentdev-workflow-backlog-auto SPEC（docs/specs/skills/agentdev-workflow-backlog-auto.md、draft→accepted 昇格済み）「fan-in 判定」節への系統別結果状態読み替え表の明記候補。現行 SPEC は「対象なし終了」の正常扱いのみを定義し、learning-promote の inbox.md 不在時の子コマンドエラー報告を対象なし終了へ読み替える mapping は references/stage-execution.md の実装詳細として定義した。SPEC 側へ昇格するかは判断が割れるため後続へ委ねる。

2. 直列化キューの実行単位（子ワークフローが定義する永続化ポイント = commit 単位）の SPEC 明記候補。現行 SPEC の直列化契約は対象種別のみを列挙し、実行単位は reference 側の詳細としている。

## 影響

- SPEC 本文が実装詳細（読み替え表・実行単位）を参照するのみであり、正典側の記述粒度が未確定のまま

## 課題

両候補とも SPEC 本文変更を要するため spec-save 手続きの範囲。本記録を入力として後続の backlog-review / spec 更新 Issue で取捨選択する。なお対象 SPEC 自体は実装・検証完了により accepted 昇格済み（case-close STEP-3-2 パターン (a)）であり、本記録は本文内容の改善候補のみを扱う。

## 既存要件・成果物との関連

- SPEC: docs/specs/skills/agentdev-workflow-backlog-auto.md (accepted)、docs/specs/commands/backlog-auto.md (accepted)
- 参考: references/stage-execution.md（読み替え表・直列化キューの現行実装詳細）

## 出典

- 発生日: 2026-08-17
- 発生源: PR #2201 (MERGED 962dc688) / Issue: #2200 (case-close SPEC 確定フロー処理パターン (c) 見送り)
- 元 item: intake-2026-08-17-ou001-spec-cand-backlog-auto-finalization-deferred.md
