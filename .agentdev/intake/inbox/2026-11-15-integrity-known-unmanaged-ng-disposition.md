# integrity 既知未管理 2件（gh-direct-invocation IR-053・draft-spec-staleness IR-054）の実修復または baseline 登録の処置判断

## 観測事実

- check_integrity が Warning 2件を継続報告している。(a) gh-direct-invocation（IR-053 名義）: src/common/skills/agentdev-workflow-case-close/scripts/README.md に gh pr view の直接記述。(b) draft-spec-staleness（IR-054 名義）: docs/designs/foundations/references/v4-v5-crosswalk.md の経過日数判定（updated 2026-10-14）。
- DEL-4060-1（Issue #4060）が baseline commit 7c8931e32 との対照実行で同一 signature を確認し、base 起因の既知未管理であることを証跡化した。実修復または baseline 登録のいずれかに分類すべき現状未分類残存である（integrity-contracts.md「既知残存違反の統一選択基準」参照）。
- (a) は case-close scripts README の記述で、ローカル版 PR マージ手順の文脈における gh pr view 言及。Custom Tool agentdev_gh 境界の記述との整合確認が必要。(b) は draft 状態の Design 文書の鮮度で、draft 自体の処置（昇格・廃止）と合わせた判断になる。

## 具体的な修正対象

- (a) src/common/skills/agentdev-workflow-case-close/scripts/README.md の gh pr view 記述を、Custom Tool 境界の現行契約と整合する文言へ是正するか、検証経路として正当な読取系記述であることを baseline に登録する。
- (b) docs/designs/foundations/references/v4-v5-crosswalk.md の draft 処置（accepted 昇格・廃止・updated 進行）を決定し、IR-054 の検出対象から解消する。
- いずれも実修復と baseline 登録（provenance 付き）の選択判断を含む別作業単位として処置する。

## 関連

- Epic #4054・Issue #4060・PR #4066 本文 Findings（対照実行の記録）
- IR-053（gh-direct-invocation）・IR-054（draft-spec-staleness）・integrity-contracts.md「既知残存違反の統一選択基準」節
