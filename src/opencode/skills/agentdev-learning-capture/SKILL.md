---
name: agentdev-learning-capture
description: Agent-first extraction and capture of learnings from problems autonomously detected/avoided/corrected. Covers CI failures, template deviations, gh/git workarounds, reopen causes, and implementation errors. USE FOR: case-close post-processing, post-incident capture, workflow deviation detection. DO NOT USE FOR: general note-taking, documentation generation, ADR/REQ/spec creation.
---

# `agentdev-learning-capture`

会話中にエージェントが自律的に検知、回避、修正した問題から学びを抽出し、ユーザー承認なしで自律的に `.agentdev/learning/inbox.md` に蓄積するスキル。

## 原本（SSoT）

本スキルの原本仕様は `agentdev-learning-capture` SPEC である。
SPEC を正規原本とし、SKILL.md は実行入口および skill 固有の補完情報を保持する。
重複または不一致がある場合は SPEC を正とする。
extension（`.agentdev/extensions/skills/`）は標準 SKILL.md を前提とし、SKILL.md と重複しない補完情報のみを提供する。

## skill extension 参照方針

本スキルは以下の方針に従う（ADR）。

1. **前提とする固定知識の範囲**: docs/ ディレクトリ構成（requirements/adr/specs）のみを前提とし、`docs/specs/**` 内部構成（`foundations`, `responsibilities` 等）は仮定しない
2. **extension の読込契約**: 呼び出し元コマンドから渡された解決済み文脈を優先し、不足分のみ skill extension（`.agentdev/extensions/skills/agentdev-learning-capture.yaml`）を読む。skill extension はスキル単位で1ファイルに集約し、reference ごとの extension は作らない
3. **`docs/specs/**` 内部パスの固定知識化の禁止**: extension に列挙されていない `docs/specs/**` 内部パスを固定知識として参照しない。スキル本文・references に具体的な project docs 内部パス（`docs/specs/{foundations,responsibilities,quality,integrity,local,authoring,commands,skills,workflows}/**`）を直接記述しない
4. **extension 未配置時の挙動**: skill extension が存在しない場合は標準動作で続行し、推測で docs を読みに行かない

## 入力

- エージェントが実際に検知、回避、修正した問題の観測事実（セッションコンテキスト）

## 出力

- `.agentdev/learning/inbox.md` への13フィールド形式エントリ追記、ユーザーへの追記通知

## 副作用

- `.agentdev/learning/inbox.md` の作成（未存在時）、追記を行う
- **git永続化（commit/push）は呼出元コマンドの責務**。本スキル内で `git add`/ `git commit`/ `git push` を実行してはならない
- `deferred.md` は参照・作成しない（`/agentdev/learning-promote` のみが管理）

## 常に守る不変条件

- **エージェント主体**: エージェントが学びを検知、抽出し、ユーザー承認なしで自律的に inbox.md に蓄積する。蓄積後に内容を通知するが、承認や却下は求めない
- **実観測ベース**: エージェントが実際に観測した事象に基づいて学び候補を抽出する。推測のみのエントリは保存しない。品質評価は保留し下流（promote）に委ねる。重複は気にしない（統合は promote が行う）
- **13フィールド完備**: 基準テンプレート（`references/capture-entry-template.md`）に従い全13フィールドを必ず含める。推論でフォーマットを組み立てず、テンプレートから取得する
- **ADR/REQ/spec反映判断を行わない**: 影響の記録まで。実際のADR/REQ/spec更新、昇格判断は別スキルの責務
- **intake item を作成しない**: 学びの抽出過程で具体的な修正対象が残る場合は intake workflow（`/agentdev/intake-capture`）に委ねる

## いつトリガーするか

以下のタイミングでこのスキルを検討する:

- `/agentdev/case-close` の実行中
- バグを修正したとき
- 調査が完了し、原因が判明したとき
- CI/CDパイプラインが失敗したとき
- テンプレートや仕様からの逸脱を修正したとき
- gh/git操作でワークアラウンドが必要だったとき
- 実装エラーによりIssue更新が必要になったとき
- エラーの解決策を見つけたとき

主な捕捉対象（CI失敗、テンプレート逸脱、gh/gitワークアラウンド、リオープン原因、実装エラー、自律回避/修正）の具体例は `references/example.md` 参照。

## Prerequisites

学びの保存先: `.agentdev/learning/inbox.md`（最新の学び。常にここに追加）。
inbox.mdが存在しない場合、エージェントは当該ファイルを作成してから追記する。

## 禁止事項

- **ユーザーに学びの有無を問わない**（「学びはありましたか？」「何か学びはありますか？」等の問いかけは禁止。エージェントが自ら判断する）
- **ユーザーに学びの内容の入力を促さない**（「学びの内容を入力してください」「学びを教えてください」等の要求は禁止。エージェントが学びを生成して提示する）
- **ADR/REQ/spec反映判断を行わない**（影響の記録まで。実際のADR/REQ/spec更新は別スキルの責務）
- **昇格判断を行わない**（学びをスキルやコマンドに昇格すべきかの判断は `/agentdev/learning-promote` の責務）
- **複雑なロジックを使わない**（シンプルなテキスト追記のみ）
- **intake item を作成しない**（学びの抽出過程で具体的な修正対象が残る場合は、intake workflow（`/agentdev/intake-capture`）に委ねる。learning capture は intake item を作成しない）

## 観測の分割ルール（split rule）

単一の観測から learning 内容と intake 内容の両方が得られる場合、以下の split rule に従い別々の artifact に分離する:

| 内容の性質 | 向け先 | 理由 |
|---|---|---|
| 具体的な修正対象（積み残し作業候補、バグ、設定不備等） | intake item（`/agentdev/intake-capture`） | 具体的作業は intake workflow が管理 |
| 再発防止知見（予防策、判断基準、運用ルール等） | learning item（`inbox.md`） | 知見の蓄積、昇華は learning pipeline が管理 |
| 両方含まれる | 両方に分割してそれぞれ出力 | 1観測 = 最大1 learning item + 1 intake item |

learning は「改善提案そのもの」ではなく「改善提案へ昇華されうる再発防止知見」である。
単一の観測が同時に learning item と intake item の両方を生み出す場合、本スキルは learning item のみを生成し、intake item の生成は `/agentdev/intake-capture` に委ねる。
1つの観測から得られた知見を単一エントリに混在させてはならない（capture-boundaries.md の split rule に準拠）。

## reference選択表

通常経路で全 reference を無条件読込しない。
必要な条件に応じて読む reference を選択する。

| 条件 | 読む reference |
|---|---|
| 13フィールド形式の基準テンプレートの取得、各フィールドの記述レベルガイドラインが必要な場合 | [references/capture-entry-template.md](references/capture-entry-template.md) |
| 主な捕捉対象カテゴリの具体例、学び抽出から通知までの手順実例（シナリオ1/2）、Tips、pipeline 全体像（capture → promote）が必要な場合 | [references/example.md](references/example.md) |

## See Also

- **agentdev-learning-pipeline**: learning pipeline（capture → promote）の共通知識、schema、処分区分
