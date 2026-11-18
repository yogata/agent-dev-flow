# intake: observation.test.ts の観測不在環境（ディレクトリ存在 + *.json 0 件）への skip 対応

- **発見元**: Epic #4138 Wave-2 case-close 機械工程（bun test 3 cwd 分割正規形再起動・freshness 順序 Case #4084 相当）。Epic #4138 記録コメント 6966053814（既知欠陥登録・changed 分類の機械受理）
- **内容**: src/common/tools/agentdev-jev/tests/observation.test.ts:549（REQ-090-030・既存観測 sourceRevision シミュレーション）は「観測ディレクトリ不在なら skip（REQ-018・worktree 空洞化）」に対応するが「ディレクトリ存在 + *.json 0 件（本 Case AG-001 の指定最終状態・.gitkeep のみ）」では fail する。`.agentdev/jev-observations/` を .gitkeep のみにした環境で `bun test ./src/` が 2042 pass / 1 fail となる（単独再実行実測 60.6 秒・再現性あり・main HEAD 743af97d6・2026-11-18）
- **分類**: intake 候補（テストの例外状態対応・skip 条件拡張等の修正候補）
- **影響**: 観測不在環境（本 Case の指定最終状態・将来の処分後環境）で bun test ./src/ が恒常的に 1 fail となる。機械工程では changed 分類・既知欠陥登録（Epic 記録コメント 6966053814）で受理済み
- **再評価条件**: jev-observations の状態とテスト前提の整合を見直す変更 Case（テスト修正・REQ-090 運用整理）の実行時
- **関連**: Issue #4138（記録コメント 6966053814）・Epic #4126・REQ-090-030・REQ-018・src/common/tools/agentdev-jev/tests/observation.test.ts
