---
title: `agentdev-req-file-manager` Design
status: accepted
created: 2026-06-21
updated: 2026-11-02
---
<!-- ADF-COVERS(implementation): REQ-001-050, REQ-001-051, REQ-004-004, REQ-004-005, REQ-004-006 -->
<!-- ADF-COVERS(implementation): REQ-059-004 -->

# `agentdev-req-file-manager` Design

## 目的

REQ ファイルの作成、追記、更新を管理する知識ベースとして採番ルール、ファイル操作モード、判定基準、バリデーションルールを提供する。

## 適用対象

- req-define（要件定義時、照合方法論、分類ゲートルール）
- Definition 保存内部責務（REQ 保存時、採番、CREATE/APPEND/UPDATE 操作、インデックス、ハブ更新、語彙、責務、runtime 境界矛盾防止、Catalog entry 確認）
- case-open（Issue 作成時の REQ 参照）
- case-run（実行時の REQ 参照）
- Definition 保存内部責務（case-ready / case-revise、要件更新時）

## 提供する判断、操作

- REQ 番号採番（最大番号 +1、欠番再利用禁止）
- CREATE / APPEND / UPDATE 操作モード選択
- 既存 REQ 照合方法論（CREATE/APPEND/UPDATE 判定、`glob docs/requirements/REQ-*.md` での実ファイル列挙と文書記載レンジ照合）
- 分類ゲートルール（状態要件 vs 反映作業、反映作業のみの要件行混入検出）
- RU パス保存禁止ルール
- ドラフト検証（artifact_actions、operation_units、topic_slug 必須フィールド）
- REQ ファイル整合性検査（docs/requirements/ 配下、README インデックス、docs/README ハブ、frontmatter id 一致）

### 所有先判断の基準（RU-0255）

照合・操作分類の判断基準は、要求の持続的な目的・関心と既存REQの目的・所有範囲との対応を第一基準とする。操作分類の5軸評価（対象コンポーネント、対象スコープ、目的の連続性、要件行追加可能性、独立目的の有無）は、目的の連続性と独立目的の有無を主軸として解釈し、対象コンポーネントと対象スコープの一致は補助材料とする。作業種別（不具合修正、一時作業等）、実装部品の一致、個別投入か一括投入かという入力の体裁だけを理由に、独立した目的を持つ要求を既存REQへ統合する運用は行わない。既存の要件行の規定だけで要求が成立する場合は変更不要（REQ操作なし）として重複する要件行を追加せず、所有先を一意に決定できない内容は保留として候補と不足を報告する。正規情報の取得に失敗した場合は該当なしとして扱わず、判断を保留して失敗の内容と不足を報告する（fail-closed）。

## 参照する references

- `templates/doc_requirement.md`（REQ テンプレート）

## 現在の動作

- REQ-{NNN} 形式でゼロ埋め採番（最小幅の表示。受理検査に桁数上限を設けない。SKILL の4桁記述は表示の代表例であり受理上限ではない）
- 要件行は「変更後に満たすべき振る舞い、制約、状態」のみ記述
- 実装指示は要件行に含めない
- bugfix では REQ ファイルを作成しない
- 旧 REQ 群（v2:REQ-0001〜0050）は2026-07-20に物理削除済みであり、履歴資料は tag `v2.11.0` で参照する。現行判断の根拠としない

### 保存後の再取得・整合確認と中断後の再実行（RU-0255）

保存内部責務は、REQ・Decision・Design の各保存操作の成功後、保存結果を正規ファイルから再取得し、採用内容、既存の有効内容、識別子、必要な参照関係、索引、状態規則を照合する。既存の書込み時引用識別子実在検証、インデックス・ハブ更新、局所矛盾防止、リモート同期と hash 検証の各手順をこの照合の構成要素として位置付ける。保存操作の成功報告だけを保存の完了根拠としない。

中断・部分失敗後の再実行では、書込み前、一部書込み後、保存後・検証前の各段階を区別し、実際の正規状態（ファイル実在、要件行・識別子の採番状態、インデックス登録状態、frontmatter）から成立済み・未成立・保留を再構成して未成立部分のみを継続する。成立済み変更の重複適用、採用済み内容の消失、誤った採番、未検証の完了扱いを生じない。

## 対象外

- 要件分析手法、要件行の品質観点（`agentdev-req-analysis` 担当）
- Decision ファイル作成、更新（`agentdev-decision-file-manager` 担当）
- 要件収集

## 検証観点

- frontmatter 必須フィールドの充足
- ID とファイル名の一致
- 日付フォーマットの正当性
- 反映作業のみの要件行が混入していないか
- REQ 番号の連番、一意性（空き番号再利用禁止）

## 実装詳細

### REQ-ID 形式契約の一律性

`alloc-composite-id.ts` が提供する複合ID（要件行ID）の抽出・認識関数は、REQ 番号の桁数上限を持たない（DEC-062）。受理検査は形式妥当性のみ（`REQ-` 接頭辞、ハイフン区切り、数値セグメント、各セグメント最小1桁）を検査し、実在性は IR-067・参照実在検査が扱う。
現行 REQ 群は3桁帯、retired の旧 REQ 群（v2:REQ-0001〜0050）は4桁帯である。

関数間で正規表現の桁数契約を不一致させてはならない。
`extractAllCompositeIds`、`extractCompositeIdNumbers`、`extractReqNumber`、`reqNumberFromFilename` は同一の桁数非依存の認識契約を用い、任意桁数の REQ 番号を同一に扱う。
一部の関数だけ桁数を固定する変更を加えてはならない。

採番結果（`formatCompositeId`）の正規化出力は pad3/pad4 の最小幅表示とする。
表示は切詰めを行わず、表示規則を受理上限として機能させない（DEC-062）。

採番検証テスト（`scripts/tests/alloc-composite-id.test.ts`）は、3桁 REQ 群（REQ-001, REQ-003, REQ-006, REQ-008, REQ-010）と4桁 REQ 群（REQ-0011）が混在する入力で `extractAllCompositeIds` と `extractCompositeIdNumbers` が正しく max を返すことを検証する。
桁数混在による max 計算の歪みを検出するため、混在入力を必須とする。

## See Also

- [agentdev-req-analysis.md](agentdev-req-analysis.md)
- [agentdev-decision-file-manager.md](agentdev-decision-file-manager.md)
- REQ-001（文書、REQ 管理基準）
- REQ-004（要件定義、保存）

## v4 責務分類

ADF v4 の責務分類（正典: DEC-048、foundations/v4-responsibility-boundaries Design「v4 責務分類語彙の後継」節）における本 Design の 3 区分（意味判断担当〔閉じた意味評価・開いた推論を所有〕/ 決定的処理委譲先 / 知識提供）。語彙の原本は foundations/v4-responsibility-boundaries Design「v4 責務分類語彙の後継」節であり、本節はその確定値を記録する。

- **意味判断担当**: 0 件
- **決定的処理委譲先**: ID 採番 → scripts/src/alloc-req-number.ts・alloc-composite-id.ts
- **知識提供**: CREATE/APPEND/UPDATE 判断・既存 REQ 照合
