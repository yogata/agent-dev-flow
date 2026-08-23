---
name: agentdev-workflow-issue
description: "issue command の workflow 実装本体。自然言語の指示と会話文脈から操作種別を判定し、課題管理 Capability Skill（agentdev-issue-tracking）へ委譲して課題ファイルの操作を実行する対話型 workflow を所有する（対話操作完結型、STEP model 対象外）。USE FOR: issue 実行時の workflow 実行（入力受領・操作種別判定・対象課題特定・課題化判定・Capability Skill 委譲・永続化・完了報告）。DO NOT USE FOR: 課題ファイル形式と11操作の実行手順そのもの（agentdev-issue-tracking の責務）、GitHub Issue の操作（agentdev-issue-management の責務）、Decision/REQ/Design 等の正規成果物の更新実行、単独起動（対応する /agentdev/* コマンド経由で利用すること）。"
---

# issue workflow スキル

issue command の workflow 実装本体。
ユーザーの自然言語の指示と現在の会話文脈から必要な課題管理操作を判断し、課題管理 Capability Skill へ委譲して実行する対話型 workflow を所有する。

issue command は公開 interface（入出力契約・ガードレール）と本スキルへの dispatch のみを持ち、本スキルが workflow 実装本体を提供する（DEC-{N}、REQ-{NNN}-{NNN}）。

## 原本（SSoT）

本スキルの原本仕様は issue command Design である。
Design を正規原本とし、SKILL.md は実行入口および skill 固有の補完情報を保持する。
重複または不一致がある場合は Design を正とする。
Workflow Skill 固有契約（Command / Workflow Skill / Capability Skill 責務、依存方向、配置契約）は `<workflows/workflow-skill-model>` Design が正規所有する。
extension（`.agentdev/extensions/skills/agentdev-workflow-issue.yaml`）は標準 SKILL.md を前提とし、SKILL.md と重複しない補完情報のみを提供する。

## skill extension 参照方針

本スキルは以下の方針に従う（`agentdev-skill-authoring` 準拠）。

1. **前提とする固定知識の範囲**: docs/ ディレクトリ構成（requirements/decisions/specs）と issue command の公開契約のみを前提とする。Design ディレクトリの内部構成は仮定しない
2. **extension の読込契約**: 呼び出し元 command から渡された解決済み文脈を優先し、不足分のみ skill extension を読む。reference ごとの extension は作らない
3. **Design 内部パスの固定知識化の禁止**: extension に列挙されていない Design 内部パスを固定知識として参照しない
4. **extension 未配置時の挙動**: skill extension が存在しない場合は標準動作で続行し、推測で docs を読みに行かない

## 入力

- issue command から渡されるユーザーの自然言語による指示
- 現在の会話コンテキスト（対話中の未解決事項、対象課題、状態）

## 出力

- 課題ファイル（`docs/issue-list/` 配下の作成・更新。書き込み操作時）
- 検索・参照結果、操作結果の報告

## 副作用

- `docs/issue-list/` 配下の課題ファイルの作成・編集
- `docs/issue-list/` 配下の変更の scoped commit / push（本 workflow 単独実行時）
- 当該 Workflow Skill は worktree root 配下以外を編集しない（issue command の worktree 隔離に従う）

## workflow model（対話操作完結型、STEP model 対象外）

本スキルは対話操作完結型の workflow であり、STEP model の対象外である。
resume point / export / import を持たない。
各操作が1完結単位であり、課題ファイル自体が durable state であるため、中断時は同一指示から再実行して課題ファイルの現在状態を再構成できる。
工程ラベルは順序ラベルであり resume point ではない。

| STEP | 名称 | 内容 |
|---|---|---|
| STEP-1 | 入力の受領・操作種別判定 | 自然言語の指示と会話文脈から操作種別を判定する（下記「操作種別の判定」） |
| STEP-2 | 対象課題の特定・前提確認 | 検索・参照はここで結果を応答する。状態遷移操作は対象課題と現在状態、操作前提を確認する |
| STEP-3 | 課題化判定 | 新規起票系の操作で実施する（下記「課題化判定」） |
| STEP-4 | 操作の実行 | 課題管理 Capability Skill（`agentdev-issue-tracking`）の操作手順に従って実行する |
| STEP-5 | 永続化・完了報告 | `docs/issue-list/` 配下の変更を scoped commit で永続化し、完了報告する |

## 操作種別の判定

サブコマンドや引数をユーザーに要求しない。指示、会話文脈、対象課題、状態から操作種別を判断する。

| 操作種別 | 判定の手掛かり |
|---|---|
| 新規起票 | 課題として残す、登録する等の指示。対話中の未解決事項を残置する指示 |
| 検索・参照 | 未解決課題の確認、一覧、特定テーマ・関連成果物の課題の問い合わせ |
| 更新 | 課題内容、選択肢、判断材料等の追記・修正の指示 |
| 検討経過の追加 | 検討が進んだ、判断材料が揃った等の経過報告 |
| 保留 | 判断を先送りする、様子を見る等の指示 |
| 再評価 | 保留課題の再検討、再評価条件の成立の報告 |
| 解決 | 結論が出た、対応不要とする等の指示 |
| 反映確認 | 解決済み課題の反映状況の確認、反映の実施の指示 |
| クローズ | 課題を閉じる指示（反映確認の完了が前提） |
| 再オープン | クローズ済み課題の再検討の指示 |

判定に迷いがある場合はユーザーに意図を確認してから実行する（推測で操作しない）。
検知（課題化候補の認識）は独立した操作種別ではなく、課題化判定（STEP-3）として新規起票時に機能する。

## 課題化判定

新規起票系の操作では、起票の前に次を順に実行する。

1. **候補判定**: 現在の作業で解決できず、かつ将来の設計、実装、検証、合意等に影響する未解決事項かを判定する。すべての疑問、TODO、一時エラーを課題化しない
2. **事前解決の試行**: 正規成果物の確認等によってその場で解決可能な疑問は、課題化前に解決を試みる
3. **既存課題検索**: 重複起票を防ぐため、課題管理 Capability Skill の検索手段（関連成果物、状態による絞り込み）で既存課題を検索する。同一論点の既存課題がある場合は重複起票せず、既存課題への統合・参照を提案する

正規成果物または現在の会話で結論が確定している事項は、その結果を課題へ反映できる。ユーザー合意が必要な設計判断を本 workflow で勝手に確定しない。

## 主要 Capability Skill 連携

本スキルは次の Capability Skill を名レベルで参照する（REQ-{NNN}-{NNN}）。

- `agentdev-issue-tracking`: 課題管理の操作能力（検知、新規起票、検索・参照、更新、検討経過の追加、保留、再評価、解決、反映確認、クローズ、再オープン）、課題ファイル形式、決定的スクリプト（一覧、検索、形式検証）
- `agentdev-project-extensions`: project extension 読込（5セクション、fail-open）

## Workflow Extension 読込

本スキルは workflow extension（`.agentdev/extensions/skills/agentdev-workflow-issue.yaml`、`kind: workflow-extension`）を読み込む場合がある。
必要に応じて internal workflow extension（`.agentdev/extensions/skills/agentdev-workflow-issue/internal.yaml`、`kind: internal-workflow-extension`）を追加で読む。
いずれも Workflow Skill のみが読み、issue command は直接読まない。
標準動作に追加・拡張される（上書きではない）。
存在しない場合は標準動作で続行する。

## 共通制約

- **編集スコープ**: `docs/issue-list/` 配下の課題ファイルのみ（command 側ガードレール G01）。状態によって課題ファイルを移動、複製、分割しない
- **GitHub Issue 非対象**: GitHub Issue/PR の操作を行わない（G02。`agentdev-issue-management` との対象体系の分離）
- **正規成果物の直接更新禁止**: 解決結果の反映は当該成果物を所有する ADF 能力へ委譲する（G03）。反映先は解決時点で課題ファイルの「反映先」に記録する（起票時に決め打ちしない）
- **承認・判断境界の維持**: ユーザー合意が必要な設計判断を代理確定しない（G04）。既存の承認、判断境界を迂回しない
- **git 永続化**: 本 workflow 単独実行時は `docs/issue-list/` 配下の変更を scoped commit で永続化する（commit message は Conventional Commits 形式）。変更なし時は commit/push せず完了報告で「変更なし」と報告する。他 workflow の実行中に課題管理能力を利用した場合は、当該 workflow の成果物コミットに含める
- **完了報告**: 書き込み操作時の完了報告は template（`.opencode/commands/agentdev/templates/issue/standard.md`）に従う

## See Also

- **`<workflows/workflow-skill-model>` Design**: Workflow Skill 固有契約の正規所有者
- **issue command**: 本スキルの呼出元（公開 interface・ガードレール・dispatch を所有）
- **agentdev-issue-tracking**: 課題管理 Capability Skill（操作能力と課題ファイル形式の正）
