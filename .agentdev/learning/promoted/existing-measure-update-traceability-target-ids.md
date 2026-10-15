# traceability gateの入力で対象REQ集合を明示する

## 背景

Case #3725 の `prepare_definition_pr.ts` 入力に `traceabilityGate` は設定されていたが、gate 判定対象として使う `input.traceabilityReqIds` が未設定だった。空配列への暗黙正規化後、traceability-check は対象 REQ 行集合を得られず fail し、後続 gate も抑止された。

## 問題

gate 実行用 `--req` 指定と、判定対象行集合 `traceabilityReqIds` が別入力なのに、組立て側で片方のみを指定しても入力検証が検出しない。

## 望ましい変更

traceability gate を有効にする入力では、判定対象 REQ 集合を明示・検証し、gate 実行範囲と判定対象の不整合を実行前に検出する。具体的な入力契約変更は下流の変更影響分析で決定する。

## 対象範囲

### 対象

- `prepare_definition_pr` の traceability gate 入力組立て・検証
- `traceabilityGate` と `traceabilityReqIds` の対応

### 対象外

- 空または欠落した対象集合を成功扱いすること
- gate の fail-closed 性や対象範囲を無断で緩和すること

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| script / 配布skill | `agentdev-workflow-case-open/scripts` の `prepare_definition_pr` 入力検証、`references/definition-pr-and-idempotency.md` | 対応する対象集合の設定・検証手順候補 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: `prepare_definition_pr` の traceability gate 消費関数と入力検証
- **ギャップ分類**: fix gap
- **ギャップ詳細**: gate 実行用 REQ 引数と判定対象 REQ 集合は独立しているが、対象集合の未指定が空配列へ正規化され、入力不備として検出されなかった。

## 制約

fail-closed gate を維持する。実行範囲の指定を判定対象集合の指定と同一視せず、変更の実現先と契約は下流で確定する。

## 受け入れ条件

- [ ] traceability gate 有効時に対象 REQ 集合が存在し、有効であることを検証する。
- [ ] 欠落・空・不整合入力を gate 実行前に fail-closed で報告する。
- [ ] gate 対象と判定対象集合の関係が手順で明確である。

## 元learning item / 根拠

- **要約**: `traceabilityReqIds` 未設定により対象 REQ row scope の確認前に traceability-check が fail した。
- **根拠**: inbox の E40、Case #3725、PR #3726。
- **再発条件**: gate spec の `--req` と判定対象集合を別々に設定する入力型で、一方のみを設定する場合。
- **横展開可能性**: 複数の case workflow が共通 gate 入力を組み立てる場合。

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: bug
- **関連Issue**: #3725
