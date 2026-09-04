---
name: agentdev-workflow-issue
description: "issue command の workflow 実装本体。自然言語の指示と会話文脈から追跡Issueの操作種別を判定し、Capability Skill（agentdev-issue-tracking）の操作知識に従い Custom Tool（agentdev_gh）経由で追跡Issueを操作する対話型 workflow を所有する（対話操作完結型、STEP model 対象外）。USE FOR: issue 実行時の workflow 実行（入力受領・操作種別判定・対象追跡Issue特定・課題化判定・Tool 操作実行・完了報告）。DO NOT USE FOR: 追跡Issueの論理スキーマ・操作知識（agentdev-issue-tracking の責務）、GitHub I/O の実行手続き（agentdev_gh の責務）、Case Issue の操作（case-open/case-run/case-close/case-update の責務）、Decision/REQ/Design 等の正規成果物の更新実行、単独起動（対応する /agentdev/* コマンド経由で利用すること）。"
---

# issue workflow スキル

issue command の workflow 実現本体である。
ユーザーの自然言語の指示と現在の会話文脈から必要な追跡Issue操作を判断し、Capability Skill の操作知識に従って Custom Tool `agentdev_gh` の操作契約経由で実行する対話型 workflow を所有する。

issue command は公開 interface（入出力契約・ガードレール）と本スキルへの dispatch のみを持ち、本スキルが workflow 実現本体を提供する。

## 入力

- issue command から渡されるユーザーの自然言語による指示
- 現在の会話コンテキスト（対話中の未解決事項、対象追跡Issue、状態）

## 出力

- 追跡Issueの作成・更新（Tool 操作契約経由。書き込み操作時）
- 検索・参照結果、操作結果の報告

## 副作用

- GitHub Issue（追跡Issue）への書き込み、またはローカル版環境でのローカルIssueへの書き込み。いずれも Tool 操作契約（`agentdev_gh`）経由のみ
- GitHub 版ではリポジトリ内のファイルを作成・変更せず、git 操作を行わない
- ローカル版でも本 workflow 自身は追加の git 操作を行わない（ローカルIssueの永続化は Tool が行う）

## workflow model（対話操作完結型、STEP model 対象外）

本スキルは対話操作完結型の workflow であり、STEP model の対象外である。
resume point / export / import を持たない。
各操作が1完結単位であり、追跡Issue自体が永続状態であるため、中断時は同一指示から再実行して追跡Issueの現在状態を再構成できる。
工程ラベルは順序ラベルであり resume point ではない。

| STEP | 名称 | 内容 |
|---|---|---|
| STEP-1 | 入力の受領・操作種別判定 | 自然言語の指示と会話文脈から操作種別を判定する（下記「操作種別の判定」） |
| STEP-2 | 対象追跡Issueの特定・前提確認 | 検索・参照はここで結果を応答する。状態遷移操作は対象追跡Issueと現在状態（`issue_read`）、操作前提を確認する |
| STEP-3 | 課題化判定 | 新規起票系の操作で実施する（下記「課題化判定」） |
| STEP-4 | 操作の実行 | Capability Skill（`agentdev-issue-tracking`）の状態遷移と Tool 操作の対応に従って `agentdev_gh` 操作を実行する |
| STEP-5 | 完了報告 | 操作結果を template に従って報告する |

## 操作種別の判定

サブコマンドや引数をユーザーに要求しない。指示、会話文脈、対象追跡Issue、状態から操作種別を判断する。

| 操作種別 | 判定の手掛かり | 主な Tool 操作 |
|---|---|---|
| 新規起票 | 課題として残す、登録する等の指示。対話中の未解決事項を残置する指示 | `issue_create` |
| 検索・参照 | 未解決の追跡Issueの確認、一覧、特定テーマの問い合わせ | `issue_list`、`issue_read` |
| 更新 | 追跡Issue内容、選択肢、判断材料等の追記・修正の指示 | `issue_update` |
| 検討経過の追加 | 検討が進んだ、判断材料が揃った等の経過報告 | `issue_comment`（body 付き） |
| 保留 | 判断を先送りする、様子を見る等の指示 | `issue_update`（trackingState） |
| 再評価 | 保留中の追跡Issueの再検討、再評価条件の成立の報告 | `issue_read`、`issue_update`、`issue_comment` |
| 実行準備完了 | 実行へ進めてよいという判断の報告 | `issue_update`（trackingState） |
| 解決 | 結論が出た、対応不要とする等の指示 | `issue_update`（trackingState、解決結論を本文へ） |
| 反映確認 | 解決済み追跡Issueの反映状況の確認、反映の実施の指示 | `issue_read`、成果物所有能力への委譲 |
| クローズ | 追跡Issueを閉じる指示（反映確認の完了が前提） | `issue_close` |
| 再オープン | クローズ済み追跡Issueの再検討の指示 | `issue_reopen` |

判定に迷いがある場合はユーザーに意図を確認してから実行する（推測で操作しない）。
検知（課題化候補の認識）は独立した操作種別ではなく、課題化判定（STEP-3）として新規起票時に機能する。

## 課題化判定

新規起票系の操作では、Capability Skill（`agentdev-issue-tracking`）の「起票時の判定」に従って次を順に実行する。

1. **候補判定**: 現在の作業で解決できず、かつ将来の設計、実装、検証、合意等に影響する未解決事項かを判定する。すべての疑問、一時的な覚え書き、一時エラーを課題化しない
2. **事前解決の試行**: 正規成果物の確認等によってその場で解決可能な疑問は、課題化前に解決を試みる
3. **既存追跡Issue検索**: `issue_list` で既存追跡Issueを検索し、重複起票を避ける。同一論点の既存追跡Issueがある場合は重複起票せず、既存追跡Issueへの統合・参照を提案する

正規成果物または現在の会話で結論が確定している事項は、その結果を追跡Issueへ反映できる。ユーザー合意が必要な設計判断を本 workflow で勝手に確定しない。

## 主要 Capability Skill 連携

本スキルは次の Capability Skill を名レベルで参照する。

- `agentdev-issue-tracking`: 追跡Issueの論理スキーマ（role、kind、状態遷移）、本文標準構造、起票時の判定、反映追跡と委譲の知識
- `agentdev-project-extensions`: project extension 読込（5セクション、fail-open）

## 共通制約

- **Tool 操作契約経由**: 追跡Issueの読み書きはすべて `agentdev_gh` 操作契約経由。ラベル名等の物理値を本 workflow で組み立てない（論理値のみを扱う）
- **GitHub 実装詳細の非要求**: ユーザーにサブコマンド、ラベル名、Issue Type、Field 名等の把握を要求しない
- **GitHub 版のファイル非作成**: GitHub 版でリポジトリ内に課題ファイルを作成・commit しない。ローカル版のローカルIssue保存先を直接読み書きしない
- **正規成果物の直接更新禁止**: 解決結果の反映は当該成果物を所有する ADF 能力へ委譲する。反映先は解決時点で追跡Issue本文の「反映先」に記録する（起票時に決め打ちしない）
- **承認・判断境界の維持**: ユーザー合意が必要な設計判断を代理確定しない。既存の承認、判断境界を迂回しない
- **実行への非変質**: 追跡Issueの存在を実行許可とせず、実行票へ変質させない。実行確定時は req-define 等の正規要件化・設計経路への引き継ぎを案内し、Case Issue の生成は case-open へ委ねる
- **完了報告**: 書き込み操作時の完了報告は template（`/agentdev/issue` の完了報告 template）に従う

## See Also

- **Workflow Skill Model Design**: Workflow Skill 固有契約の正規所有者
- **issue command**: 本スキルの呼出元（公開 interface・ガードレール・dispatch を所有）
- **agentdev-issue-tracking**: 課題管理 Capability Skill（論理スキーマと操作知識の正）
