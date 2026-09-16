# Draft Definition PR の merge 完結経路の整備（agentdev_gh の draft 解除操作不在と draft フラグ不統一）

## 背景

case-ready STEP-1 の Definition PR 受入で、Draft Definition PR 10件（#2826〜2830・#2851〜2859）が draft 状態のまま作成されており、pr_merge が「gh: Pull Request is still a draft (HTTP 405)」で失敗した。agentdev_gh Custom Tool に draft 解除（ready 化）操作が存在せず、pr_update 契約は draft フィールドを unknown-field として拒否、gh CLI 直操作は write-guard でブロックされるため、merge 前提を満たせず HITL 停止した。

## 問題

- agentdev_gh の操作カタログに draft 解除（pr_ready 相当）操作が存在せず、draft 状態の PR を正規経路で merge 完結できない
- case-open の Definition PR 作成手順に draft フラグの規定がなく、作成時の draft / 非 draft が実行ごとに不統一になる（発生時は Batch 1/4 が draft、Batch 2/3 が非 draft）
- draft PR を検出した場合の case-ready 側の経路（HITL 停止以外）が規定されていない

## 望ましい変更

次の予防策のいずれか（または組み合わせ）により、case-open の PR 作成から case-ready の merge 完結までを正規経路で閉じる。実現方法の選択は req-define の変更影響分析に委ねる:

1. case-open が Definition PR を draft: false で統一作成する（PR 作成仕様の確定）
2. agentdev_gh の操作カタログへ draft 解除（pr_ready 相当）操作を追加する（Custom Tool 契約の拡張）
3. case-ready STEP-1 の reference に draft PR 検出時の経路（検出・報告・対処）を明記する

## 対象範囲

### 対象

- agentdev_gh Custom Tool の操作契約（custom-tool-contracts Design、REQ-011 系）
- case-open の Definition PR 作成手順（definition-pr-and-idempotency reference）
- case-ready STEP-1 の Definition PR 受入手順（definition-acceptance reference）

### 対象外

- pr_merge の fail-closed 挙動・write-guard による raw gh WRITE ブロック（設計どおりの防衛動作）
- Draft Definition PR / Definition Amendment PR の lifecycle モデル自体の変更

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補である。

| 種別 | パス | 変更内容 |
|------|------|----------|
| Design | docs/designs/responsibilities/custom-tool-contracts.md（操作カタログ） | pr_ready（draft 解除）操作追加の候補 |
| 配布skill | case-open の Definition PR 作成 reference | draft フラグの統一規定（作成時の draft: false 明示等） |
| 配布skill | case-ready の definition-acceptance reference | draft PR 検出時の経路明記 |

## 既存対策確認

- **確認結果**: 既存対策なし
- **該当ファイル**: なし（agentdev_gh 操作一覧に draft 解除操作なし、pr_update は draft フィールドを拒否、case-open に draft フラグ規定なし — 2026-09-16 実行時に Tool 操作契約・配布物を確認）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: Custom Tool 操作カタログの機能欠落と case-open の PR 作成仕様不在。agentdev_gh 操作カタログに存在しない GitHub 副作用が必要になった場合、write-guard により gh CLI 直操作は実行不可であり、Custom Tool 契約の拡張を前提に計画する必要がある

## 制約

- 運用時の partial merge は不可: REQ-057.md 要件テーブルへの行追加連鎖（先行 merge が後続 PR の rebase 採番順序を崩壊させる）のリスクがあり、発生時は全件保持での HITL 停止が正しい挙動であった
- write-guard 境界（raw gh WRITE のブロック）は維持する。回避を目的とした運用回避策は取らない

## 受け入れ条件

- [ ] case-open が作成する Definition PR の draft フラグが仕様として確定し、実行ごとの不統一が発生しないこと
- [ ] draft 状態の PR を検出した場合の case-ready の経路（対処または停止条件つき報告）が reference に明記されていること
- [ ] agentdev_gh のみで case-open の PR 作成から case-ready の merge 完結までを正規経路で閉じられること（操作追加または draft 非作成により）

## 元learning item / 根拠

- **要約**: Draft Definition PR 10件（#2826〜2830・#2851〜2859）が draft 状態で作成され、agentdev_gh に ready 化操作が存在しないため pr_merge が HTTP 405 で失敗、merge 前提を満たせず HITL 停止した。partial merge は REQ-057 要件テーブルの採番順序崩壊リスクから断念し、write-guard 境界を遵守して全件保持で報告した。
- **根拠**: 根本原因は (a) case-open の Definition PR 作成時の draft フラグ不統一、(b) agentdev_gh の GitHub I/O 境界の操作カタログに draft 解除操作が設計として含まれていない、の複合。pr_update による draft 解除試行は invalid-input（unknown-field [draft]）で拒否、gh pr ready の直接実行も agentdev-gh-write-guard が raw gh WRITE をブロック。
- **再発条件**: case-open が draft PR を作成し、かつ case-ready が agentdev_gh のみで merge を完結しようとする場合に毎回発生
- **横展開可能性**: agentdev_gh 操作カタログに存在しない GitHub 副作用が必要になった全局面。Custom Tool 契約の拡張を前提に計画する必要がある
- **prune 証拠**: inbox.md 2026-09-16 実行分「Draft Definition PR の draft 状態で case-ready の merge が完結不能（agentdev_gh に ready 化操作不在）」エントリ（削除前の完全本文は git 履歴の inbox.md @ 795bfb19 を正とする）

## 推奨Issue分類

- **分類**: feature
- **推奨ラベル**: enhancement, workflow
- **関連Issue**: Case #2821〜#2825・#2850〜#2858、PR #2826〜#2830・#2851〜#2859
