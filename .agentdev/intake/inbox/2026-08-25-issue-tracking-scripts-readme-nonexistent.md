# agentdev-issue-tracking scripts/README の不在確定（該当なし記録）

## 観測

Issue 2439（OU-08）の対象範囲に「agentdev-issue-tracking scripts/README」として挙げられていた対象は旧方式（scripts 配下 README）の参照であり、OU-06 で旧 scripts/references が削除済みのため実在しない。当該スキル配下は SKILL.md のみ。新規作成せず PR 2441 本文に該当なし記録として記録された。

## 今回扱わない理由

実在しない対象への新規作成は連動更新のスコープ外。スキル配下の README が必要になった時点で構成判断を実施すべき案件であり、完了済み Wave 2 で追加作成しない。

## 影響

なし（現行の agentdev-issue-tracking スキルは SKILL.md 単体で運用成立。scripts 配下 README を参照する既存記述も解消済み）。

## レビューで決めること

- agentdev-issue-tracking スキルに scripts README（運用手順書）を新設する必要の有無（既定は不要判断の維持）

## 根拠

- PR 2441 本文「Findings / Capture候補」intake 1件目
- Issue 2439 対象範囲・PR 2441 変更ファイル一覧（agentdev-issue-tracking 配下の変更なし）
