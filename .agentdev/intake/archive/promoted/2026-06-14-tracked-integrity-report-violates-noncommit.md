# 2026-06-10 integrity report が git 追跡対象となっている（非 commit 違反）

## 観測

`.agentdev/integrity/reports/2026-06-10-integrity-report.md` が `git ls-files` で追跡済みとして現れる。`.gitignore` に `.agentdev/integrity/` ルールは存在するが、当該ファイルはルール追加前に commit されたため ignore されておらず、結果として validator が自身の過去レポートをスキャンし、~29 件の retired ADR/REQ 参照 warning（false positive）を生成している。

### 検証結果

- `git check-ignore .agentdev/integrity/reports/2026-06-10-integrity-report.md` → exit=1（ignore 対象外・追跡中）
- `git ls-files` → 当該ファイルが listing される
- 新規生成レポート（2026-06-13）は ignore 済み・追跡対象外（期待通り）

## 影響

REQ-0108-229（integrity report は非永続・非 commit）への違反。また false positive の大量発生により docs-check のシグナルノイズ比が低下する。

## 推奨対応

`git rm --cached .agentdev/integrity/reports/2026-06-10-integrity-report.md` を実行し追跡解除する。あわせて validator 側で `.agentdev/integrity/reports/` 配下を retired-reference 等の検査対象から除外することも検討する。

## 分類

- finding category: document-drift
- route: intake
- 原因: 確認済

## 根拠

- 根拠: REQ-0108-229（integrity report は commit 対象外）
- 副次影響: 約 29 件の false positive warning（同一根因）
