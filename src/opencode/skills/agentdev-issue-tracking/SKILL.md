---
name: agentdev-issue-tracking
description: 追跡Issue（課題、ToDo、アイデア、リスク等の未解決事項の育成管理単位）の論理スキーマ運用知識と操作能力を提供する課題管理 Capability Skill。起票、検索・参照、更新、検討経過の追加、保留、再評価、実行準備完了、解決、反映確認、クローズ、再オープンの操作知識を所有し、GitHub I/O は Custom Tool（agentdev_gh）の操作契約経由で行う。USE FOR: 追跡Issueの起票と状態遷移、重複回避のための既存追跡Issue検索、保留理由と再評価条件の整理、解決結論と反映先・反映状態の追跡、クローズ前提の反映確認、複数 workflow からの追跡Issue操作利用。DO NOT USE FOR: GitHub I/O の実行手続きそのもの（agentdev_gh 操作契約の責務）、物理ラベル等への写像の再実装（Tool 内実装の責務）、Case Issue（req/case パイプラインの実行票）の管理（case-open/case-run/case-close の責務）、Decision/REQ/Design 等の正規成果物の更新実行（各成果物を所有する能力の責務）、Intake / Learning の検出事項や学びの管理、RU の生成と統合。
---

# `agentdev-issue-tracking`

追跡Issue管理 Capability Skill。
要件定義、方式設計、実装、レビュー、検証、外部確認等で生じた未解決事項を、発生から検討、保留、解決、正規成果物への反映確認まで継続して追跡するための共通知識と操作能力を提供する。

## 責務と境界

- 追跡Issueは GitHub Issue を Case Issue（req/case パイプラインの実行票）と共有する管理単位であり、論理 role（tracking / case）により区別される。role、kind、状態と状態遷移、物理マッピング、本文標準構造の正は追跡Issue論理スキーマ一元管理 Design が所有し、本スキルはその運用記述を提供する
- 追跡Issueへの I/O は Custom Tool `agentdev_gh` の操作契約（issue_create、issue_read、issue_update、issue_comment、issue_close、issue_list、issue_reopen）経由でのみ行う。ラベル名等の物理値への写像は Tool 内実装が機械適用するため、本スキルおよび上位層は論理値（role、kind、状態）のみを扱う
- GitHub 版ではリポジトリ内に課題ファイルを作成し、commit しない。ローカル版は同一の操作契約でローカルIssueが読み書きされる（Tool が差し替わるため、本スキルは環境差を意識しない）
- Issue の存在自体を Agent の実行許可としない。追跡Issueを実行票へ直接変質させない。実行が確定した場合は req-define 等の正規要件化・設計経路へ引き継ぎ、Case Issue の生成は case-open が行う
- 解決結果の正規成果物への反映は、当該成果物を所有する能力へ委譲する。本スキルは結論、反映先、反映状態の追跡に徹する
- Intake / Learning（AI 駆動開発の改善循環）、RU（変更要求）、Decision（判断理由を保持すべき解決結果）は別系統であり、本スキルはそれらの管理を行わない

## 論理スキーマ（要約）

| 項目 | 値域、規約 |
|---|---|
| role | `tracking`（追跡Issue）/ `case`（Case Issue）。機械判定可能 |
| kind | `problem`（問題）、`idea`（アイデア）、`task`（作業）、`risk`（リスク） |
| 状態 | 起票、検討中、保留、実行準備完了、解決済み、クローズ済みの 6 状態 |
| 解決済み | 結論の確定を意味する。クローズ済みは必要な反映の完了または反映不要の確認完了を意味する |
| 検討経過 | Issue コメントを正規の時系列履歴とする。本文内へ独自の追記専用ログを二重保持しない |
| 本文 | 現在状態の理解のための要約・構造化情報を中心とする（標準構造は後述） |

## 本文標準構造

追跡Issue本文は次のセクションを標準構造として保持する。起票時に反映先・クローズ確認を含めない（反映先の決め打ち回避）。不要なセクションは省略できる。

- 件名（title）
- 背景
- 影響
- 関連成果物
- 選択肢
- 判断材料
- 不足情報
- 保留理由と再評価条件（保留状態のみ必須）
- 解決結論（解決済みのみ必須）
- 反映先と反映状態（解決後に記録）
- 関連 Case Issue への参照（実行確定時に記録）

## 状態遷移と Tool 操作の対応

| 操作 | Tool 操作契約 | 状態遷移 |
|---|---|---|
| 起票 | `issue_create`（role: tracking、kind 指定） | （新規）→ 起票 |
| 更新 | `issue_update`（title、body、labels） | 状態不変 |
| 検討経過の追加 | `issue_comment`（body 付き） | 状態不変 |
| 検討中への遷移 | `issue_update`（trackingState 指定） | 起票/保留/実行準備完了 → 検討中 |
| 保留 | `issue_update`（trackingState 指定） | → 保留（保留理由と再評価条件を本文へ整備） |
| 実行準備完了 | `issue_update`（trackingState 指定） | → 実行準備完了 |
| 解決 | `issue_update`（trackingState 指定） | → 解決済み（解決結論を本文へ記録） |
| クローズ | `issue_close`（reason: completed / not_planned） | 解決済み等 → クローズ済み |
| 再オープン | `issue_reopen` | クローズ済み → 検討中 |
| 検索・参照 | `issue_list`（role、kind、状態等の絞り込み）、`issue_read`、`issue_comment`（body 省略で読取） | — |

クローズの reason は、反映完了によるクローズで `completed`、対応不要の確認完了を経由したクローズで `not_planned` を使う。

## 保留・再評価・反映の意味論

- 保留状態は「なぜ現在判断できないか」（保留理由）と「何が成立すれば再評価するか」（再評価条件）を本文で識別して保持する
- 再評価後は、結論の確定（解決）、理由と不足情報を更新した保留継続、対応不要という結論での解決、のいずれかとして処理する
- 解決結果を正規成果物へ反映する必要がある場合は、反映先と反映状態を本文へ記録し、反映先の成果物更新を当該成果物を所有する能力へ委譲する
- クローズは必要な反映の完了または反映不要の確認を条件とする。反映未完了のままクローズしない

## 起票時の判定（重複回避と事前解決）

新規起票系の操作では、起票の前に次を順に実行する。

1. **候補判定**: 現在の作業で解決できず、かつ将来の設計、実装、検証、合意等に影響する未解決事項かを判定する。すべての疑問、TODO、一時エラーを課題化しない
2. **事前解決の試行**: 正規成果物の確認等によってその場で解決可能な疑問は、課題化前に解決を試みる
3. **既存追跡Issue検索**: `issue_list`（role: tracking、kind、状態による絞り込み）で既存追跡Issueを検索し、重複起票を避ける。同一論点の既存追跡Issueがある場合は重複起票せず、既存追跡Issueへの統合・参照を提案する

正規成果物または現在の会話で結論が確定している事項は、その結果を追跡Issueへ反映できる。ユーザー合意が必要な設計判断を課題管理側だけで確定しない。

## 他 workflow からの利用

本スキルは共有能力であり、人間向け公開入口（`/agentdev/issue` command）の明示実行を利用の必須条件としない。

- 要件定義、設計、レビュー、実装、検証等の各 workflow、各 skill は、未解決事項を認識した場合に本スキルの知識を直接利用し、Tool 操作契約経由で追跡Issueの操作を行える
- 保留中の追跡Issueは `issue_list`（状態絞り込み）で到達できる。関連する作業、設計、レビュー、分析を行う際に再評価条件の成立を確認する
- 本スキルの利用にあたり新規の承認点を追加しない。既存の承認、判断境界（ユーザー合意が必要な設計判断を本スキルが勝手に確定しない等）は維持する

## 禁止事項

- 追跡Issueの操作に、サブコマンド、ラベル名、Issue Type、Field 名等の GitHub 実装詳細の把握をユーザーに要求しないこと
- 物理ラベルへの写像（role、kind、状態とラベルの対応）を本スキルや上位層で再実装しないこと（Tool 操作契約の論理値を使うこと）
- GitHub 版でリポジトリ内に課題ファイルを作成し、commit しないこと
- ローカル版のローカルIssueの保存先を直接読み書きしないこと（Tool 操作契約経由のみ）
- 追跡Issueを Case Issue（実行票）へ直接変質させないこと。実行は req-define 等の正規経路へ引き継ぐこと
- Decision、REQ、Design 等の正規成果物を直接更新しないこと（当該成果物を所有する能力への委譲が前提）
- 追跡Issue起票時に反映先を決め打ちしないこと
- 解決済みの追跡Issueを反映完了または反映不要の確認なしにクローズしないこと
- Issue 本文内へ検討経過の追記専用ログを二重保持しないこと（コメントを正規の時系列履歴とすること）

## See Also

- **agentdev-workflow-issue**: `/agentdev/issue` の workflow 実装本体（本スキルの知識を利用する対話操作完結型 workflow）
- **agentdev-issue-management**: GitHub Issue 操作の安全性手続き（VERIFY、リンク確認）
- **agentdev-decision-file-manager**: 解決結果を Decision へ反映する際の委譲先
- **agentdev-req-file-manager**: 解決結果を REQ へ反映する際の委譲先
- **agentdev-design-file-manager**: 解決結果を Design へ反映する際の委譲先
