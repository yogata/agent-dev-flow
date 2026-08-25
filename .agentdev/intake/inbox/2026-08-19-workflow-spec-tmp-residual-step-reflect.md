# case-run・case-close・case-auto 各 SPEC の tmp 残存確認 STEP 記述への反映要否

## 観測

case-run（STEP-S6/W5）、case-close（STEP-6-6 新設・STEP-6-7 繰り下げ）、case-auto（STEP-8）の workflow skill 本文へ tmp/ 残存確認が追加された。各コマンド・workflow の SPEC（docs/specs/）側の終了条件・STEP 記述には同内容が反映されていない。STEP-6-6/6-7 繰り下げを含む反映要否は case-close Step 3 の判断対象とされた。

## 今回扱わない理由

Issue 2247（OU-0028）の変更対象成果物は workflow skills・gh-cli references・.gitignore。docs/specs 側の SPEC 本文更新は対象外。

## 影響

SPEC の STEP 記述と workflow skill 本文の間で終了条件の記述整合が取れていない状態が続く。

## レビューで決めること

- case-run / case-close / case-auto 各 SPEC の終了条件・STEP 記述へ tmp 残存確認（STEP-6-6/6-7 繰り下げを含む）を反映するか

## 根拠

- PR 2283 本文「SPEC確定候補」2件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2283）
- gh-cli SPEC 側は詳細参照が Section 2・Section 3 の両方を既に指しており必須ではない判断（同 PR SPEC確定候補 1件目）
