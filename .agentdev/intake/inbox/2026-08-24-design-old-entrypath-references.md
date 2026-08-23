# Design 旧公開入口・旧パスの現行手順参照残存（integrity-contracts・IR-068）

## 観測

case-run の TS-005 検索（PR #2416、Issue 2415、REQ-050 実装）で、`docs/designs/integrity/integrity-contracts.md`（当時 516・526・528・536 行目: `scripts/install-from-archive.ps1`、`scripts/package-release-archive.ps1` の旧パス記述）と `docs/designs/integrity/rules/IR-068-skill-projection-manifest.md`（当時 24 行目: `install-consumer-opencode.ps1 -Mode apply` を junction 再構築の局所運用タスクとして参照）に、旧入口・旧パスの現行手順参照が残存していることを検出した。Design は当該 PR の修正対象外（Design確定候補と同一内容）のため、Design 更新案件として次工程以降で処理する方針で記録された（PR #2416 本文「Findings / Capture候補」intake）。

## 今回扱わない理由

Design ファイルの更新は case-close の Design確定処理（STEP-3-2）の対象であり、実装 PR（case-run）の変更範囲には含めない。PR 本文の Design確定候補と同一内容であるため、capture としては回収記録を残し、処分は promote 時に判断する。

## 影響

なし（解消済み）。case-close の Design確定処理（main commit 97e9bdae、2026-08-23）で当該 4+1 箇所は新パス構成（`scripts/consumer/archive/install.ps1`、`scripts/self/release/package-release-archive.ps1`、archive 内投影名 `scripts/install.ps1`、`scripts/install.ps1 -Mode apply`）へ更新済み。frontmatter `updated` も 2026-08-23 へ更新済み。

## レビューで決めること

- 解消済みアイテムとしての処分確定（reject / archive）。再 grep による残存有無の最終確認（case-close 実施時点で現行手順参照なしを確認済み: PR HEAD 再 grep、対応記録コメント検証差分「旧入口現役参照 再 grep」行）

## 根拠

- PR #2416 本文「Findings / Capture候補」intake 1件目（発見元: TS-005 検索）
- main commit 97e9bdae（case-close Design確定反映、Design 3件）
- Issue 2415 対応記録コメント（case-close 検証差分: 旧入口現役参照 再 grep 行）
