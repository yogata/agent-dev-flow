# 同名の試験ファイルの2系統の残存（ADF簡素化調査 N-05。評価は未確定）

## 観測事実

- 同名の試験ファイルが2系統存在し、内容が一致しない（md5 差を確認）:
  - `.opencode/skills/repo-agentdev-integrity/scripts/tests/check_integrity.test.ts`（最終更新 2026-10-02・18,160B）と `scripts/check_integrity.test.ts`（2026-11-13・251,068B）
  - `scripts/self/release/package-release-archive.test.ts`（2026-10-03・6,134B）と `.opencode/skills/repo-agentdev-integrity/scripts/package-release-archive.test.ts`（2026-11-13・35,094B）
- `bun test` は再帰的に両方を収集し得る。基準コミット f7860194 にも2系統が存在し、差分期間に片側だけが更新された。

## 具体的な修正対象（判断は未確定。削除の断定ではない）

- 旧い側の試験が固有の検証義務を持つか、現行の試験が必要な範囲を代替できるか、bun test の収集の範囲で実際に両方が実行されているかを確認した上で、削除・維持を判断する。

## 関連

- 2026-10 の src/common 正本化移行（#3325/#3326）の残骸の可能性（推定）
