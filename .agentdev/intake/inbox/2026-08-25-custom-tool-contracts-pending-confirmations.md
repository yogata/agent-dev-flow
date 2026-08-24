# custom-tool-contracts Design の後続確定事項（ツール名・Plugin 設定契約）

## 観測

PR 2434 の実装により custom-tool-contracts Design は draft から accepted へ昇格した（commit 18750fc3、Wave 2 境界クローズ）が、Design が所有する詳細のうち未確定の事項が残る: (1) ツール名 `agentdev_gh` は仮確定（index.ts・README に注記済み、Design「対象操作の境界（初期セット）」の後続更新で確定）、(2) Plugin 設定契約（環境変数名 `AGENTDEV_GH_WRITE_GUARD_CONFIG`、既定検査対象（bash のみ）、検出ルールの禁止範囲詳細（読み取り系許容の境界））は Design「迂回防止」節の所有事項として確定を要する。

## 今回扱わない理由

いずれも Design 内容の追加確定（APPEND）を伴い、case-close の Design 確定における docs 編集範囲（status 昇格）の外側。確定判断には運用要件の整理が必要。

## 影響

ツール名が仮確定のままのため、OU-004（Wave 3、GitHub I/O の Custom Tool 完全移管）での harness 登録配線確定時に再判断が発生する。Plugin 設定契約未確定の間、設定の外部化運用は暫定扱い。

## レビューで決めること

- ツール名・公開単位の確定（design-save 更新で実施するか、OU-004 実装時に確定するか）
- Plugin 設定契約（環境変数名・既定検査対象・読み取り系許容の境界）の Design「迂回防止」節への確定記載

## 根拠

- PR 2434 本文「Design確定候補」item 2、item 4
- docs/designs/responsibilities/custom-tool-contracts.md（accepted 昇格済み、2026-08-25）
