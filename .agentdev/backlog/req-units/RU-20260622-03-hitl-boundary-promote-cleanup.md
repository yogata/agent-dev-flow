---
source_type: chat
generated_by: session
generated_at: 2026-06-22T18:25:58+09:00
status: draft
sources:
  - type: chat
    path: session:2026-06-22-hitl-boundary-promote-cleanup
---

# promote系コマンドの過剰確認削減とHITL境界明確化

## 背景

`learning-promote` 実行時、`archive/active.md` の `staged / duplicate / rejected` エントリを prune する前に追加確認が求められた。

この確認は現行仕様どおりだが、前段で判定・処分が承認済みである場合、同じ意思決定を後処理段階で再確認している。これにより、promote 系コマンドの自走性が低下し、ユーザー確認が実質的に二重化している。

同様の観点で `learning-promote`、`intake-promote`、`backlog-review`、関連スキルを確認した結果、判断確定後の保存・移動・prune・削除に対して追加確認を求め得る記述が存在する。

## 問題

`learning-promote` では、判定・処分承認後の `staged / duplicate / rejected` prune が、再度ユーザー確認を必要とする手順になっている。

`intake-promote` では、分類承認後の保存・移動・commit/push まで再確認が必要に読める記述があり、分類判断と後処理の境界が曖昧である。

`backlog-review` では、統合・分割判定承認後、矛盾がない通常ケースでも追加承認が必要に読める手順があり、矛盾検出時の判断確認と通常処理が分離されていない。

このため、HITL が「判断の確定」ではなく「確定済み判断の後処理」にまで広がっている。

## Source Summary

チャット内で以下を合意した。

- `learning-promote` の `staged / duplicate / rejected` prune は、判定・処分承認済みであれば自動実行でよい。
- `staged` は採用済み成果物へ根拠保存済みであることを条件に prune する。
- `duplicate / rejected` は判定理由が成果物または評価記録に残ることを条件に prune する。
- `deferred / 未処理` は prune しない。
- 古い単発レアケースの prune は別物であり、削除リスクがあるため明示承認を維持する。
- `intake-promote` は、分類承認後の保存・移動・commit/push を自動実行できるよう、承認必須範囲を分類確定までに限定する。
- `backlog-review` は、矛盾検出時のみ追加判断を求め、矛盾なしの通常ケースでは承認済み判定に基づいて RU 生成以降へ進める。
- 破壊的変更、未コミット変更、矛盾解消、要件・仕様・スコープ変更は確認を維持する。

## 統合理由

対象はいずれも promote / review 系コマンドにおける HITL 境界の問題である。

個別には `learning-promote` の prune 確認、`intake-promote` の保存・移動確認、`backlog-review` の矛盾確認に分かれるが、根本問題は同じである。

判断確定と後処理の境界を統一しない場合、各コマンドで確認粒度がばらつき、最大自走方針と承認制御の両方が不安定になる。

## 要件化の方向

promote / review 系コマンドは、HITL を「判断の確定」に限定する。

判断確定後の保存・移動・prune・削除・commit/push は、対象範囲、保存先、除外条件、証跡保存条件が明確である場合、自動実行する。

ただし、破壊的変更、未コミット変更の扱い、矛盾解消、要件・仕様・スコープ変更、古い単発レアケースの削除は、判断未確定または損失リスクがあるため、明示承認を維持する。

## 主対象REQまたは変更対象候補

主対象REQは未特定。

変更対象候補:

- `learning-promote` コマンド定義
- `intake-promote` コマンド定義
- `backlog-review` コマンド定義
- learning pipeline 関連スキル
- intake promote 関連スキル
- backlog review 関連スキル
- HITL / 自走 / promote 後処理の境界を定義する既存 REQ または SPEC

## 対象外

以下は対象外とする。

- コマンド実装の具体的な修正手順
- 既存コード差分案
- Issue / PR 作成
- `case-close` の docs / SPEC 確認削減
- `case-run` の worktree cleanup 確認削減
- `inspect-promote --auto` の挙動変更
- `learning-capture` の自律保存挙動変更
- 古い単発レアケース prune の自動化
- deferred / 未処理 item の自動削除

## 受け入れ条件

- `learning-promote` は、判定・処分承認後、`staged / rejected / duplicate` を追加確認なしで prune できる。
- `learning-promote` は、`staged` の根拠が採用済み成果物へ保存済みでない場合、当該 item を prune しない。
- `learning-promote` は、`duplicate / rejected` の判定理由が記録されていない場合、当該 item を prune しない。
- `learning-promote` は、`deferred / 未処理` を prune しない。
- `learning-promote` は、古い単発レアケース prune について明示承認を維持する。
- `intake-promote` は、分類承認後の promoted 保存、archive 移動、commit/push を追加確認なしで実行できる。
- `intake-promote` は、分類未確定または分類修正中の場合、保存・移動・commit/push へ進まない。
- `backlog-review` は、矛盾なしの場合、統合・分割判定承認を RU 生成承認として扱う。
- `backlog-review` は、矛盾検出時のみ追加判断を求める。
- `backlog-review` は、RU 生成成功済み成果物の削除を追加確認なしで実行できる。
- promote / review 系の関連コマンド・スキルで、HITL の対象が「判断確定」と「後処理」に分けて記述される。
- 破壊的変更、未コミット変更、矛盾解消、要件・仕様・スコープ変更については確認を維持する。
