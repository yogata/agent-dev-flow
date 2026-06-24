# QG-4: Final Acceptance Gate

case-close で PR マージ前に、最終受け入れ状態を確認する Gate。
本ファイルは QG-4 の判定基準、検査観点を定義する。
共通契約は [common-gate-contract.md](common-gate-contract.md) を参照。

## 配置

| コマンド | 配置ステップ | 対象成果物 |
|---------|-------------|-----------|
| case-close | Step 2（前提確認、達成判定、test strategy 処理完了確認）、Step 3（docs 検証）、Step 3-1（close 時局所確認） | PR/ CI 結果/ Issue 完了条件チェックボックス/ Issue テスト戦略項目/ PR Findings/ docs |

## 検査観点

### 1. 完了条件チェックボックス全達成

Issue 本文の `完了条件` セクションの全チェックボックスが `[x]`（達成）になっているか。

- **fail**: 未達チェックボックス（`- [ ]`）が残る。構造化エラーで停止（case-close G08）。
- **pass**: 全チェックボックスが `[x]`。

#### 達成判定

unchecked 項目を達成判定する。
証拠ソース（コミット、PR、CI 結果等）に基づき、`agentdev-workflow-orchestration` のプロトコルに従い達成可否を判定する。

#### 未達項目の取り扱い

- 達成不可項目 → case-run への差し戻し（case-close G08）。
- 今回の完了条件に含まれる未対応事項を intake に逃がして完了扱いにしない（case-close G16）。
- スコープ外項目は `> ℹ️ 別途確認: {項目名}` 形式に変換（case-run Step 7 の責務）。

### 2. CI 通過確認

PR の CI が全て通過しているか。

- **fail**: CI 失敗。case-run に差し戻し（case-close G07）。
- **partial**: CI 実行中（pending）。CI 完了を待ってから再試行。
- **pass**: CI 全通過。

### 3. docs 整合性（機能追加固有）

機能追加の場合、以下が満たされているか。

- REQ 作成、インデックス記載
- SPEC 更新
- ADR 作成（必要な場合）
- 関連ドキュメント整合性確認
- DOC-MAP 整合性確認

- **warn**: 不足項目がある。警告表示してユーザー判断を仰ぐ（case-close G09）。
- **pass**: 全て確認済み、または機能追加以外で docs 影響なし。

### 4. 文書分類ポリシー適合

最終ドキュメント状態が `docs/specs/document-model.md` の Document Classification Policy に適合しているか。

- **warn**: 分類ポリシーとの不適合候補がある。警告表示してユーザー判断を仰ぐ。
- **pass**: 分類ポリシーに適合。

### 5. close 時 SPEC/ commands/ skills 更新漏れ（局所確認）

今回の変更に伴う更新漏れの局所確認（case-close Step 3-1）。

- SPEC 本文と実装の最終矛盾
- command 定義の更新漏れ
- skill 責務境界の変更漏れ

- **warn**: 更新漏れ候補がある。警告表示してユーザー判断を仰ぐ。
- **pass**: 更新漏れなし。

> **局所予防の範囲**: この確認は close 時の局所的な漏れ検出であり、`/agentdev/inspect-docs` の全体意味レビューの代替ではない。

### 6. test strategy 処理完了

Issue 本文のテスト戦略セクションに含まれる全 test strategy 項目（verification / pass_criteria / on_failure の3要素構造）が処理済みであることを確認する。各項目は「合格」（pass_criteria を満たす）または PR 本文の `## Findings / Capture候補` セクションへの Findings 記録（record-in-findings）のいずれかに分類されていること。

- **fail**: 未処理の test strategy 項目が残る。構造化エラーで停止（case-close G08）。未処理項目が残る場合は完了扱いとしない（REQ-0131-026）。
- **pass**: 全項目が合格または Findings 記録済み。
- **N/A**: Issue 本文にテスト戦略セクションが存在しない場合（旧形式 Issue 等）。本観点は skip する。

> **前提**: test strategy 項目の検証、不合格時処置（fix-and-reverify / record-in-findings）、全項目処理までの反復は case-run の実行担当サブエージェント（Sisyphus-Junior、`/ulw-loop`）が実施する（REQ-0130-030）。QG-4 はその処理結果（PR 本文の Findings 記録を含む）を最終確認する。

## pass/ fail 基準

- **pass**: 上記 1, 2, 6 を満たし（3, 4, 5 は warn 以下）、マージ可能。
- **fail**: 観点 1（未達チェックボックス）、観点 2（CI 失敗）、または観点 6（test strategy 未処理項目）。構造化エラーで停止。
- **partial**: CI pending 等、判定に必要な証拠が未取得。証拠取得後に再判定。

QG-4 は最終受け入れの二値性が強く、`pass`/ `fail` を基本とする。
`partial` は CI 保留等の例外的状況のみ。

## 完了条件チェックボックス評価の具体手順

case-close Step 2 での完了条件チェックボックス評価:

1. Issue 本文の `完了条件` セクションを読み取る
2. unchecked 項目（`- [ ]`）を抽出
3. 各 unchecked 項目を達成判定（証拠ソース: コミット、PR、CI 結果）
4. 達成判定した項目を `[x]` に更新（Issue 本文更新手続き、agentdev-gh-cli）
5. **事後確認**: 更新後に Issue 本文を再読込し、全 `- [ ]` が `[x]` に反映されたことを確認。未反映の場合は再更新（最大 2 回）
6. 未達項目が残る場合 → 構造化エラーで停止（G08）

### 責務帰属

完了条件チェックボックスの評価、更新は **case-close の責務**（Step 2）である。
QG-4 は判定基準を提供し、case-close が実際のチェックボックス更新を実行する。

> **注意**: 旧設計では case-run がチェックボックス更新を担う箇所があったが、完了条件チェックボックスの最終評価、更新は case-close QG-4 に集約する。case-run Step 7 のチェックボックス更新は実装中の進捗反映（work plan チェックボックス）に限定する。

## 委譲接続点

QG-4 の検査をサブエージェントに委譲する場合:

- サブエージェントは達成判定候補、証拠候補、未達候補のみを返す。
- 親エージェントが pass/fail を確定し、チェックボックス更新、マージ判断を行う。

## 責務境界

- QG-4 は**判定基準の提供と判定結果の提示**に限定する。
- チェックボックス更新、PR マージ、Issue クローズは case-close コマンドの責務。
- QG-4 fail 時の自動修正は行わない。ユーザー判断または case-run 差し戻し。

## See Also

- [common-gate-contract.md](common-gate-contract.md)
- [qg-3-implementation-deviation.md](qg-3-implementation-deviation.md) — 前工程の実装乖離検出（QG-4 は QG-3 pass を前提とする）
- **agentdev-workflow-orchestration**: 達成判定プロトコル、証拠ソース
- **agentdev-issue-management**: Issue 本文更新、前後内容比較

