---
source_type: chat
generated_by: session
generated_at: 2026-06-06T17:17:34+09:00
status: draft
sources:
  - type: chat
    path: session:2026-06-06-integrity-check-meta-integrity
---

# RU: /repo/integrity-check の自己整合性検査完成

## 背景

`/repo/integrity-check` の実施において、検査カテゴリの一部省略、finding の分類・route 欠落、完了報告テンプレート未使用、存在しない除外理由による報告が発生した。

真因分析の結果、単なる実行ミスではなく、`/repo/integrity-check` 自身の command / skill / script / template / report schema 間に未完成・不整合があることが確認された。

## 問題

`/repo/integrity-check` は他artifactの整合性を検査する役割を持つが、現状では integrity-check 自身の整合性を十分に検査できていない。

具体的には以下が問題である。

- command 内の検査カテゴリ記述と `repo-agentdev-integrity/SKILL.md` の検査カテゴリ定義が一致していない
- `SKILL.md` の検査カテゴリ全件実行が機械的に保証されていない
- finding schema において、artifact分類とfinding分類が混線している
- `ng` / `warning` finding で `finding_category` と `route` が必須化されていない
- `/repo/integrity-check` が古い `/agentdev/integrity-check` 系 completion template を参照している
- template path 不存在、namespace不一致、対象説明不一致を検出できていない
- Step 2 report から Step 3 intake判断へ進むための routing summary が不足している
- integrity関連artifact自身の drift を検出する meta-integrity guard が未完成である
- source scan / projection scan の混同を検出しきれていない

## Source Summary

このRUは、チャット内で合意した `/repo/integrity-check` の真因分析と是正方針を source とする。

対象は `/repo/integrity-check` の自己整合性である。

主な対象artifactは以下とする。

- `.opencode/commands/repo/integrity-check.md`
- `.opencode/skills/repo-agentdev-integrity/SKILL.md`
- `.opencode/skills/repo-agentdev-integrity/scripts/**`
- `/repo/integrity-check` 用 completion template
- integrity report formatter / schema
- regression fixtures / tests
- REQ-0108

## 統合理由

今回の問題は、個別のテンプレート不備、カテゴリ不備、schema不備として分割すると再発する。

本質は `/repo/integrity-check` 自身の command / skill / script / template / schema 契約が一体として未完成であることなので、1つの要件単位として統合して扱う。

## 要件化の方向

REQ-0108 を UPDATE/APPEND し、`/repo/integrity-check` の自己整合性検査を完成させる。

要件化では以下を定義する。

- `repo-agentdev-integrity/SKILL.md` を検査カテゴリの authoritative source とする
- command本文にSKILL.mdと重複する詳細カテゴリ一覧を持たせない
- SKILL.mdカテゴリとscript実装カテゴリの差分を `integrity-rule-gap` として検出する
- finding schema を `artifact_type` / `check` / `finding_category` / `route` に分離する
- `ng` / `warning` finding では `finding_category` と `route` を必須にする
- `/repo/integrity-check` 用 completion template を repo-local 所有にする
- `/agentdev/integrity-check` 表記・参照が `/repo/integrity-check` に混入した場合は検出する
- template path 不存在、namespace不一致、対象説明不一致を `integrity-rule-gap` として検出する
- report末尾に routing summary を出力する
- integrity関連artifact自身を meta-integrity guard の対象にする
- source scan / projection scan の混同を検出する
- 今回の再発ケースを regression test に含める

## 主対象REQまたは変更対象候補

主対象REQ:

- REQ-0108

変更対象候補:

- `.opencode/commands/repo/integrity-check.md`
- `.opencode/skills/repo-agentdev-integrity/SKILL.md`
- `.opencode/skills/repo-agentdev-integrity/scripts/**`
- `/repo/integrity-check` 用 completion template
- integrity report formatter / schema
- regression fixtures / tests

ADR追加:

- 不要
- 既存の integrity / source-projection / meta-integrity 方針の具体化として扱う

## 対象外

以下は今回の対象外とする。

- 検出された個別findingの修正
- intake item の自動作成
- learning item の直接作成
- consumer project 向け機能化
- `/agentdev/integrity-check` の復活
- ユーザー未承認の永続化
- 未合意事項のRU化

## 受け入れ条件

- `/repo/integrity-check` のcommand本文に、SKILL.mdと重複する詳細カテゴリ一覧が残っていない
- SKILL.mdの検査カテゴリすべてが、script実装または明示的な未実装findingとして扱われる
- `ng` / `warning` finding は `finding_category` と `route` を必ず持つ
- `/repo/integrity-check` の完了報告templateは repo-local path を参照する
- `/repo/integrity-check` 関連artifactに `/agentdev/integrity-check` 表記・参照が混入した場合に検出される
- template path 不存在、namespace不一致、対象説明不一致が `integrity-rule-gap` として検出される
- report末尾に routing summary が出力される
- integrity関連artifact自身が meta-integrity guard の対象になる
- source scan / projection scan の混同が finding として出力される
- integrity report formatter に文字化けが残っていない
- 今回の再発ケースが regression test に含まれる
