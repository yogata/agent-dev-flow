---
source_type: chat
generated_by: session
generated_at: 2026-06-25T23:40:21+09:00
status: draft
sources:
  - type: chat
    path: session:2026-06-25-case-auto-case-run-delegation-boundary
---

# RU-20260625-01 case-auto と case-run の実行方式記述責務の分離

## 背景

case-auto には、case-run を `ulw-loop` / `ultrawork` 相当で実行担当サブエージェントへ委譲する旨の具体記述が存在する。

一方で、case-run は実装実行の入口であり、単一 Issue または Epic Wave の子Issueを実行担当サブエージェントへ委譲し、その result を処理する責務を持つ。実行担当サブエージェント、adapter、委譲 prompt、外部実行バックエンドの具体は case-run 側の責務である。

case-auto は、req-save / spec-save / case-open / case-run / case-close を順に起動する上位オーケストレーターであり、各工程の内部実行方式を直接定義しない。

## 問題

case-auto に `ulw-loop`、`ultrawork`、実行担当サブエージェント名、adapter skill、委譲 prompt などの case-run 内部実行方式が記述されると、以下の問題が発生する。

1. case-auto が case-run の内部実行方式に依存する
2. case-run 側の実行方式変更時に case-auto も追従修正が必要になる
3. case-auto と case-run の責務境界が曖昧になる
4. 同一内容が複数コマンドに重複し、記述不整合の原因になる
5. case-auto の「工程オーケストレーションに専念する」設計と矛盾する

## Source Summary

チャット内で以下を合意した。

- `ulw-loop` / `ultrawork` の具体宣言は case-auto ではなく case-run 側に置く
- case-auto は case-run の内部実行方式を記述しない
- case-auto は case-run task に Issue 番号または Epic Issue 番号を渡し、result を受け取るところまでを責務とする
- case-run は自身のコマンド定義に従い、単一 Issue または現在 Wave の ready 子Issue を実行する
- case-auto に残す記述は「case-run コマンド定義に従う」「現在 Wave の ready 子Issue を最大5件並列実行する」程度に留める
- `Sisyphus-Junior`、`ulw-loop`、adapter skill、`/ulw-loop Implement Issue #N` などの具体名は case-run 側へ集約する

## 統合理由

本RUは、case-auto と case-run の責務境界を明確化するために統合する。

case-auto は工程間制御、入力引き渡し、停止判定、結果集約を扱う。case-run は実装実行の委譲、worktree、実行担当サブエージェント result の処理を扱う。

実行方式の具体名を case-auto から除去することで、case-run の内部実装変更が case-auto に波及しない構造にできる。

## 要件化の方向

case-auto の記述から、case-run 内部の実行バックエンド、実行担当サブエージェント名、adapter skill、委譲 prompt の具体宣言を削除する。

case-auto は case-run を task として起動し、case-run の authoritative command definition に従わせる記述へ変更する。

Epic Wave 実行に関する case-auto 側の記述も、case-run が現在 Wave の ready 子Issue を最大5件並列実行して result を返す、という外部契約に限定する。

case-run 側には、実行担当サブエージェント、adapter protocol、委譲 prompt、`ulw-loop` 利用の具体を保持する。

## 主対象REQまたは変更対象候補

主対象REQ候補:

- REQ-0114
- REQ-0130

変更対象候補:

- `src/opencode/commands/agentdev/case-auto.md`
- `src/opencode/commands/agentdev/case-run.md`

ただし、主要な修正対象は `case-auto.md` とする。`case-run.md` は既存記述を維持する想定であり、必要な場合のみ整合確認の対象とする。

## 対象外

以下は対象外とする。

- case-run の実行方式そのものの変更
- `Sisyphus-Junior` の廃止または変更
- `ulw-loop` / `ultrawork` の採否変更
- adapter skill の仕様変更
- task() 委譲モデルの変更
- Epic Wave モデルの変更
- 並列上限値の変更
- case-close、case-open、req-save、spec-save の責務変更
- 実装手順の詳細化
- コード差分案の作成

## 受け入れ条件

1. `case-auto.md` に、case-run 内部実行方式としての `ulw-loop` / `ultrawork` の具体宣言が残っていない
2. `case-auto.md` に、case-run 内部実行方式としての実行担当サブエージェント名、adapter skill、委譲 prompt の具体宣言が残っていない
3. `case-auto.md` は、case-run task に Issue 番号または Epic Issue 番号を渡すことを記述している
4. `case-auto.md` は、case-run の result として `completed(pr)` / `blocked` / `failed` を受け取り、次工程または停止判定へ進むことを記述している
5. Epic Wave 実行について、case-auto 側の記述は「case-run が現在 Wave の ready 子Issue を最大5件並列実行する」という外部契約に限定されている
6. case-run 側には、実行担当サブエージェント、adapter protocol、委譲 prompt、`ulw-loop` 利用の具体記述が保持されている
7. case-auto と case-run の間で、同一の内部実行方式説明が重複していない
8. case-auto は工程オーケストレーション、case-run は実装実行委譲という責務境界が読み取れる
