## 観測内容
PR #1123（agentdev-gh-cli SPEC 昇格検証 + 内容補正）で agentdev-gh-cli SPEC の status を accepted 化したが、DOC-MAP に status 列が存在しないため反映箇所がない。全 SPEC 構造変更を伴うため本 Issue 対象外とした。

PR #1123 完了条件:
> - [ ] DOC-MAP に SPEC status 追跡機構が必要な場合、別 Issue で全 SPEC 構造変更を検討（本 Issue 対象外）。現在は DOC-MAP に status 列が存在しないため、個別 SPEC のみ accepted 化しても DOC-MAP 側に反映箇所がない。

DOC-MAP へ status 列を新設すると全 SPEC 構造変更に及ぶため、個別 SPEC の昇格とは独立した検討が必要と判断された。

## 影響
SPEC status 追跡機構がないため、DOC-MAP と実態の乖離が生じている。個別 SPEC を accepted 化しても DOC-MAP 側に反映箇所がない状態。

## 課題
- DOC-MAP に status 追跡機構を追加すること（status 列の新設を伴う全 SPEC 構造変更）
- 個別 SPEC の昇格と DOC-MAP 更新の協調方法を検討すること

## 既存要件との関連
- PR #1123（agentdev-gh-cli SPEC 昇格検証 + 内容補正）
