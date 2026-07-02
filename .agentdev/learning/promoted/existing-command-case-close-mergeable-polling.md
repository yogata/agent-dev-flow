# case-close Step 4 への GitHub mergeable UNKNOWN ポーリング待機手順追加

## 背景

case-close Epic Wave クローズで複数PRを順次 squash merge する際、各PRマージ直後に後続PRの GitHub mergeable が UNKNOWN になり、再計算に 10〜20秒を要する。UNKNOWN 状態でマージ試行すると失敗する。現在 case-close Step 4 は「最大5回リトライ」だが、mergeable UNKNOWN 専用のポーリング待機手順がない。

## 問題

GitHub は PR マージ後にバックグラウンドで mergeable を再計算する仕様で、計算時間はリポジトリの活性度や差分サイズに依存する。連続 squash merge（特に同一ファイルを変更するPRが連続する場合）では、後続PRの mergeable が UNKNOWN となりマージ試行が失敗する。case-close Step 4 の「5秒待機×5回リトライ」は mergeable 再計算の待機を前提としておらず、リトライを浪費する。

## 望ましい変更

case-close Step 4（PRマージ）に、squash merge 試行前に mergeable 状態をポーリング確認する手順を追加する。

1. **mergeable ポーリング**: `gh pr view <N> --json mergeable,mergeStateStatus` で mergeable を確認。UNKNOWN の間は Start-Sleep で待機（最大60秒、10秒間隔）。
2. **MERGEABLE/CLEAN 確認後マージ試行**: mergeable が MERGEABLE かつ mergeStateStatus が CLEAN になってから squash merge を実行。
3. **既存リトライとの統合**: mergeable ポーリングを既存の「最大5回リトライ」の前置手順とする。ポーリングで MERGEABLE になってもマージが失敗する場合は既存リトライへ。

## 対象範囲

### 対象

- `src/opencode/commands/agentdev/case-close.md` Step 4（PRマージ）
- `docs/specs/commands/case-close.md`（Step 4 の squash merge 手順）

### 対象外

- case-auto の自動マージロジック（別 SPEC、必要なら別途検討）
- 単一 Issue クローズ（マージ1回のため mergeable UNKNOWN リスク低）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| command | `src/opencode/commands/agentdev/case-close.md` | Step 4 に mergeable UNKNOWN ポーリング待機（最大60秒、10秒間隔）を前置手順として追加 |
| spec | `docs/specs/commands/case-close.md` | Step 4 の squash merge 手順に mergeable ポーリング要件を記載 |

## 既存対策確認

- **確認結果**: 既存対策あり（部分カバー）
- **該当ファイル**: `src/opencode/commands/agentdev/case-close.md` Step 4（Squash merge失敗時の自動リトライ 最大5回）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 既存リトライはあるが mergeable UNKNOWN 専用のポーリング待機がない。UNKNOWN 状態でのマージ試行失敗をリトライで吸収しており、ポーリング前置でリトライ浪費を防止できる。

## 制約

- gh CLI のコンソールエンコーディング初期化（agentdev-gh-cli standard-procedures Section 2 Step 0）を前提とする。
- ポーリングの最大待機時間（60秒）は GitHub 再計算の実績（10〜20秒）に余裕を持たせた値とする。

## 受け入れ条件

- [ ] case-close Step 4 に mergeable UNKNOWN 時のポーリング待機手順が追加されている
- [ ] ポーリングは gh pr view --json mergeable,mergeStateStatus を使用し、UNKNOWN の間は待機する
- [ ] MERGEABLE/CLEAN 確認後にマージ試行する手順が明記されている
- [ ] 既存の「最大5回リトライ」との統合位置が明確である

## 元learning item / 根拠

- **要約**: case-close Epic Wave クローズで連続 squash merge 時に GitHub mergeable が UNKNOWN になりマージ失敗。ポーリング待機で回避した事例。
- **根拠**: GitHub が PR マージ後にバックグラウンドで mergeable を再計算する仕様。Epic #1288 Wave 1 クローズ（PR #1295-#1300）で gh pr view でポーリング確認、UNKNOWN の間は Start-Sleep 10〜20秒で待機してからマージ試行する運用で回避。
- **再発条件**: GitHub で連続 squash merge を実行する全ケース。特に同一ファイルを変更するPRが連続する場合。
- **横展開可能性**: case-auto の自動マージ処理、CI 対応ループ等の自動マージ処理全般で高い。

## 推奨Issue分類

- **分類**: enhancement
- **推奨ラベル**: enhancement
- **関連Issue**: Epic #1288 Wave 1 クローズ（PR #1295-#1300）
