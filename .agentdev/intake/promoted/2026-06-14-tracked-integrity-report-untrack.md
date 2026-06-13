# git 追跡中の integrity report が非 commit 要件に違反（cascade の根因）

## 観測

`.agentdev/integrity/reports/2026-06-10-integrity-report.md` が `.gitignore` ルール追加前に commit 済みで、git 追跡対象に残っている。

### 検証結果

- `git ls-files .agentdev/integrity/reports/` → `2026-06-10-integrity-report.md` が listing される（追跡中）
- `git check-ignore` → exit=1（ignore 対象外）
- `.gitignore:11` に `.agentdev/integrity/` ルールは存在するが、既追跡ファイルには無効
- 新規 2026-06-13 レポートは正しく ignore 適用済み

## 影響

- **REQ-0108-229 違反**: integrity report は非永続成果物であり git commit / push 対象外
- validator が自らの過去レポートをスキャンし、約 29 件の false positive を生成（retired-adr-req-cited-as-current item の大部分の源因）
- item 13（retired citations）の cascade 根因。本件解消により item 13 の残件が大幅縮小する見込み

## 課題

`git rm --cached` で追跡を解除する。即時修正可能かつ確実。

## 既存要件との関連

- **REQ-0108-229**: integrity report は非永続・git commit / push 対象外
- **REQ-0108-211/213**: repo-local artifact / integrity reports を検査対象から除外

## 対応方針の方向性

- **route**: req-define（または直接 maintenance 修正）
- **category**: maintenance
- **優先度**: 高（即時修正可能・cascade の根因・item 13 の前提）
- 修正: `git rm --cached .agentdev/integrity/reports/2026-06-10-integrity-report.md`
- 併せて validator 側の除外強化（REQ-0108-211/213）も検討すべき

## 元 item 参照

- `.agentdev/intake/inbox/2026-06-14-tracked-integrity-report-violates-noncommit.md`
