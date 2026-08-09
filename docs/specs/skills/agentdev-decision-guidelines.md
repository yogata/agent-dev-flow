---
title: `agentdev-decision-guidelines` SPEC
status: accepted
spec_logical_division: cross_cutting_contract
canonical_owner: agentdev-decision-guidelines
created: 2026-06-21
updated: 2026-07-27
---

# `agentdev-decision-guidelines` SPEC

## 目的

Decision 作成の必要性判定基準、作成ガイドライン、ライフサイクル定義を提供し、アーキテクチャ上重要であるかどうかを判定する。

## 適用対象

- アーキテクチャ変更の提案、技術スタック選定、取り返しがつかない技術的判断を行う際
- req-define Step 5（Decision 判断）、Step 5-0（既存 Decision 重複確認）、Step 5-1（Decision 禁止ゲート）、Step 5-3（作業手段 Decision 拒否ゲート）

## 提供する判断、操作

- Decision 作成推奨基準（アーキテクチャ上の重要性、長期的影響、逆転の困難さ）
- Decision 作成不可条件（仕様変更のみ、command 動作仕様、workflow 定義等）
- Decision ライフサイクル（proposed → accepted → deprecated / superseded）
- 作業手段 Decision 拒否ゲート（削除、廃止、移行、統合、再構築、完全削除そのものを主題にした Decision 候補は除外）

## 参照する references

- なし（SKILL.md 本文に集約）

## 現在の動作

- Architecturally Significant な決定に対してのみ Decision を作成
- accepted 後は不変、変更時は新規 Decision 作成
- 単なる廃止、削除、移行は新規 Decision ではなく `retire` / `supersede` で処理（REQ-001-044/045）
- 既存 Decision との意味的重複確認（REQ-001-051、重複時は UPDATE 推奨）

## 対象外

- Decision ファイルの作成、管理（`agentdev-decision-file-manager` 担当）
- 要件分析手法（`agentdev-req-analysis` 担当）
- 実装計画

## 検証観点

- Decision 作成推奨基準に該当するか
- Decision 作成不可条件に該当しないか
- 既存 Decision との重複がないか
- false negative を防止できているか

## accepted Decision の更新規則

accepted Decision を意味的に不変とし、明示承認済みの非意味修正と、後継 Decision を必要とする意味変更を分離する（REQ-001）。
Decision guidelines、Decision file manager、document-model の accepted Decision 更新規則を本契約へ統一する。

### 直接更新可能な非意味修正（6件）

明示承認後に直接更新できる非意味修正は次の6件とする。各変更は非意味修正分類へ一意に割り当てる。

1. 誤字または文字化けの修正
2. 壊れたリンクまたは誤ったファイルパスの修正
3. タイトルと本文の不一致修正
4. 意味を変えない表記統一
5. 決定内容でも制約でもない移行時ラベルの除去
6. 履歴注記、関連リンク、日付などの補助情報修正

### 後継 Decision を必要とする意味変更（6件）

後継 Decision を作成せずに直接編集できない意味変更は次の6件とする。各変更は意味変更分類へ一意に割り当てる。

1. 決定内容の追加または削除
2. 適用範囲の変更
3. 必須条件または制約の変更
4. 正規所有者の変更
5. 採用方式の変更
6. 外部から観測可能な結果の変更

### 直接更新の実行条件

- 直接更新前に明示承認記録が存在すること
- 非意味修正は Decision file manager のチェックリスト（後述）で確認する
- 意味変更を表記修正として扱わない
- Report へ規範要件または必達条件を移さない
- accepted Decision の過去版を無言で書き換えない

### DEC-001 の移行時識別子の扱い

- DEC-001 の WS-9 は非意味ラベルとして除去できる（決定内容を変更しない）
- 案B は決定内容を具体文で維持し、案番号だけを除去できる
- 10シナリオを抽象条件へ変更する場合は後継 Decision を作成する（直接編集しない）
- 10シナリオの定義は SPEC、実行結果は Release Report が所有する
- Release Report に規範表現が存在しない

## See Also

- [agentdev-decision-file-manager.md](agentdev-decision-file-manager.md)
- [agentdev-architecture-advisory.md](agentdev-architecture-advisory.md)
- [agentdev-req-analysis.md](agentdev-req-analysis.md)
- [commands/req-define.md](../commands/req-define.md)
- REQ-001（文書、REQ 管理基準）
- REQ-001（Decision ライフサイクル標準化）

