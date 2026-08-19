# epic-wave-model SPEC の旧 REQ-006 行 ID 参照残存（要件分割前の識別子）

## 観測

`docs/specs/workflows/epic-wave-model.md` に 2026-08-14 の要件分割前の REQ-006 行 ID 参照が多数残存する（L49 REQ-006-004、L56 REQ-006-019/020、L59 REQ-006-012、L75 REQ-006-030、L140/145/159/169/170/177/226〜234/246〜248/261/265/268/274 等）。現行 REQ-006 の要件行は 105〜111 のみ。

## 今回扱わない理由

Issue 2243（OU-0041）の対象は要件文書 4文書（REQ-004/017/036/006）の注記形式確認であり、SPEC 側文書は対象外。REQ-001-040 の段階的更新の未達部分候補として記録した。

## 影響

REQ-001-014（再編工程固有識別子の排除）と REQ-001-040（移行期のトレーサビリティ）の両立判断が SPEC 側で未適用の状態です。旧行 ID を現行正式 ID（case-open/case-run/case-close/case-update/case-auto 各実行契約 REQ・Epic/Wave 実行モデル REQ の行 ID）へ解決するか、履歴文脈注記形式へ置換するかが未確定。

## レビューで決めること

- 参照解決の方式（現行正式 ID への振り直し・履歴文脈注記化のいずれを正とするか）
- 対象範囲の一括是正（docs_chore 系要件doc）とするか

## 根拠

- Issue 2243 完了判定記録コメント「Findings / Capture候補」（回収元: https://github.com/yogata/agent-dev-flow/issues/2243#issuecomment-5336194442 ）
