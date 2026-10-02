# Windows rename EPERM の診断手法と bounded retry 対策パターン

処分区分: 4 project knowledge

## 背景

Windows における原子的書込み（tmp ファイル → 既存ファイルへの renameSync 置換）が、bun test 並行実行でのみ非決定的に EPERM / EACCES を返し flaky テスト化した。直前の書込みハンドル解放や検査インデクサの一時保持が起因と推定される。PR #3325 で対照プローブ（新旧構成 20 ラウンド同頻度実証）により環境起因と実証し、PR #3329 で Promise.all 模倣による再現特定と bounded retry（指数バックオフ・最大約 150ms）による対処を完結した。

## 問題

- 単体実行では再現せず並行実行でのみ再現する flaky は「テストの欠陥」と誤分類されやすい
- 再現・実証・対処の一連の手順が知識として未整備である

## 望ましい変更

次の知見を知識文書化する（docs/knowledge/ への直接保存は backlog-review 承認後）:

1. **対照プローブ手法**: 疑いのある新旧構成を同頻度（例: 20 ラウンド）で対照実行し、発生頻度の同水性から環境起因を実証する
2. **並行模倣再現**: Promise.all で複数テスト相当の並行実行を模倣し、単体では再現しない競合を再現特定する
3. **bounded retry パターン**: rename ベース原子的書込みに指数バックオフ（最大約 150ms）の bounded retry を適用する（`src/common/tools/agentdev-gh/local/runner-local.ts` に実装済み）

## 対象範囲

### 対象

- Windows 環境での rename ベース原子的書込み実装（runner-local.ts 同型の新規実装を含む）
- flaky テストの診断手順

### 対象外

- runner-local.ts 自体の変更（PR #3329 で実施済み）
- Windows 以外の環境

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| knowledge | docs/knowledge/（新規知識文書候補） | 対照プローブ・並行模倣再現・bounded retry の診断・対策パターン |

## 既存対策確認

- **確認結果**: 既存対策なし（runner-local.ts の retry 実装は個別対処であり、手法の知識化なし）
- **該当ファイル**: なし
- **ギャップ分類**: なし
- **ギャップ詳細**: なし

## 制約

- bounded retry は上限付き（無限リトライ禁止）とし、retry 後も失敗する場合は本来のエラーとして扱う

## 受け入れ条件

- [ ] 診断手法（対照プローブ・並行模倣）と対策パターン（bounded retry）が知識文書化されている

## 元learning item / 根拠

- **要約**: Windows rename EPERM の並行実行時のみ再現する flaky の実証・再現・対処の一連
- **根拠**: (1) 2026-10-02 Case #3314（PR #3325 Findings）: runner-local.ts の原子的書込みが Windows で EPERM により時々失敗し TS-008/TS-015 分が flaky。対照プローブで環境起因と実証、(2) 2026-10-02 Case #3316（PR #3329 Findings）: Windows rename EPERM は bun test 並行実行でのみ再現（Promise.all 模倣で再現特定・bounded retry で対処、修正済み）
- **再発条件**: Windows 環境で rename ベースの原子的書込みを並行実行コンテキストで行う場合
- **横展開可能性**: Windows 環境の原子的書込み実装全般。OS 固有挙動のため汎用パターンとして再利用価値が高い

## 推奨Issue分類

- **分類**: chore（知識文書化）
- **推奨ラベル**: documentation, windows, flaky-test
- **関連Issue**: Case #3314（PR #3325）, Case #3316（PR #3329）
