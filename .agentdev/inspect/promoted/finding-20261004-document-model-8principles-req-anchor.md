# 文書分類モデル8原則（bd6d1fa4）の REQ アンカー不在

- **分類**: inspect finding promote（DS-02・severity medium・confidence medium・**HITL 承認済み〔2026-10-05、ユーザー事前承認〕**）
- **由来**: inspect-docs finding 20261004T162140Z（backlog-auto stage 1）。inspect-promote 2026-10-05 HITL 確定（Jev 分類は defer 意見・semantic_disagreement により HITL へ引き上げ、ユーザーが promote を承認）
- **承認範囲の限定**: 本承認は候補の昇格（promote）のみに適用される。恒久契約の帰属（REQ-001 系へ要件化するか、Design のまま正規所有とするか）の本体判断は req-define 壁打ちが所有し、本成果物はそれを前提とする

## 観測（evidence・実測確認済み）

- commit bd6d1fa4 の追記規範文は REQ 行アンカーを持たない。例: document-model.md「Designへ独立した新要求を追加しない（手段の独自要件化の禁止）」「弱い要求をKnowledgeへ退避させる記述を、分離先として選択してはならない」
- commit 本文は「REQ操作なし（CR-002）」と明記しており、意図的な REQ 非操作判断が存在
- 416b5ee5 による配布 skill 参照 3 ファイルへのミラーを含め追記文間の相互矛盾は検出されず（document-model.md 基盤とも整合）
- 対象: document-model.md（記述単位判定の原則・具体名を含む公開契約のREQ適格と手段分離の補強・二つの6処置の工程差の明示）、document-type-responsibilities.md（分類判断ツリー最終到達項目の限定・SKILL原本節フォーマット）、v4-operating-model.md（ADF共通保証と本体Project契約の層帰属）、commands/req-define.md（記述単位・寿命の判定項目追加）

## 影響課題

恒久契約性の高い規範が REQ に帰属せず Design のみに存在する状態が継続する。矛盾ではないが、正規所有の所在が文書体系原則（REQ-001）上の判断課題として未確定のまま残る。

## 対応候補

intake route: 恒久契約を REQ-001 系へ要件化するか req-define で再壁打ち（記述単位・層帰属・Knowledge 非規範限定の要件化）。CR-002 の意図的 REQ 非操作判断の維持・変更も壁打ちで判断する。

## 既存要件関連

REQ-001（文書体系）。矛盾ではなく帰属の判断問題。

## 統合注記（backlog-review での統合判定候補）

なし（単独対応。ミラー 3 ファイル〔diagnostic-categories.md、save-procedure.md、requirement-development.md〕の整合確認済み）。
