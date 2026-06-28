# DOC-MAP への SPEC status 追跡機構追加

## 観測

PR #1123（agentdev-gh-cli SPEC 昇格検証 + 内容補正）で agentdev-gh-cli SPEC の status を accepted 化したが、DOC-MAP に status 列が存在しないため反映箇所がない。全 SPEC 構造変更を伴うため本 Issue 対象外とした。

## 今回扱わなかった理由

DOC-MAP へ status 列を新設すると全 SPEC 構造変更に及ぶため、個別 SPEC の昇格とは独立した検討が必要と判断された。

## 根拠

PR #1123 完了条件:

> - [ ] DOC-MAP に SPEC status 追跡機構が必要な場合、別 Issue で全 SPEC 構造変更を検討（本 Issue 対象外）。現在は DOC-MAP に status 列が存在しないため、個別 SPEC のみ accepted 化しても DOC-MAP 側に反映箇所がない。
