# pre-existing unmanaged NG 21件の構成記録（Wave 3 時点、main 由来）

## 観測

Wave 3 境界クローズ（Epic 2427、PR 2435 マージ後）時点で、main 由来の pre-existing な unmanaged NG が 21件存在する。PR 2435 では新規 delta 0 に抑えた。構成:

- consumer-project-setup の broken-file-link
- DEC-022 の accepted-adr-only-citation 6件
- agentdev-artifact-validation の draft 放置
- issue-tracking 系 TODO 3件
- req-health-metrics の index 行数不一致
- skill-projection-manifest の src-only 2件（agentdev-issue-tracking / agentdev-workflow-issue が manifest 未登録）
- その他

## 今回扱わない理由

いずれも main から引き継いだ既知状態であり、Wave 3 の実装対象外。個別の解消は対応 Case（または inspect-promote 経由）で行う。

## 影響

unmanaged NG は baseline 管理外として報告され続ける。新規.delta との区別なく扱うと Wave 検証の解釈を妨げるため、構成の記録が参照値になる。

## レビューで決めること

- 21件の個別対応要否と優先順位
- baseline 取り込み（managed 化）に回すものの選定

## 根拠

- PR 2435 本文「Findings / Capture候補 > intake」item 3
- 先行記録: intake item 2026-08-24-unmanaged-ng-20-preexisting-origin-main.md、2026-08-25-preexisting-ng-13-origin-main-wave2.md
