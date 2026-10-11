# accept-definition-checks-overlap-summary-display

## 背景

case-ready STEP-1 の受入検査機械工程（accept_definition_checks script）で、overlap-cross-check の summary が「detection_unavailable=true」と表示した。同一入力でのエンジン（inspect_cross_dependencies.ts）直接実行では detection_unavailable は空配列で、検出不能は発生していなかった（Issue #3550 で実測）。ゲート判定は exitCode のみで影響しない表示欠陥だが、summary の detection_unavailable 表示は「検出不能が発生した」という検査の質に関する情報であるため、表示が常に true になると報告の信頼性を損ない、報告 JSON を意味レビューする全 case-ready / case-revise 実行でエンジン報告の直接確認による裏付け取りが常態化する。

## 問題

`src/common/skills/agentdev-workflow-case-ready/scripts/src/accept_definition_checks.ts` の summary 組み立て（runAcceptDefinitionChecks の overlapSummary）が `parsed.detection_unavailable != null` 判定であり、空配列も存在扱いして true 表示になる。正しい判定は「配列が存在し 1 件以上の要素を持つ」ことである（`Array.isArray(v) && v.length > 0`）。

## 望ましい変更

- summary 組み立てを `Array.isArray(v) && v.length > 0` 判定へ修正する
- 対応する unit test（scripts/tests/accept_definition_checks.test.ts）へ空配列ケース（detection_unavailable が空配列のとき summary が true と表示しない）を追加する

## 対象範囲

### 対象

- `src/common/skills/agentdev-workflow-case-ready/scripts/src/accept_definition_checks.ts` の overlapSummary 組み立て箇所
- `src/common/skills/agentdev-workflow-case-ready/scripts/tests/accept_definition_checks.test.ts`（空配列ケースの追加）

### 対象外

- inspect_cross_dependencies.ts（エンジン側。detection_unavailable の意味論は正）
- ゲート判定（exitCode による判定）の変更
- 報告 JSON のスキーマ変更

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill script | `src/common/skills/agentdev-workflow-case-ready/scripts/src/accept_definition_checks.ts` | overlapSummary の detection_unavailable 判定修正（!= null → Array.isArray && length > 0） |
| 配布skill tests | `src/common/skills/agentdev-workflow-case-ready/scripts/tests/accept_definition_checks.test.ts` | 空配列ケースの unit test 追加 |

## 既存対策確認

- **確認結果**: 既存対策なし（script 本体の修正は未実施。検知・運用回避のみ実施済み）
- **該当ファイル**: `src/common/skills/agentdev-workflow-case-ready/scripts/src/accept_definition_checks.ts`（エントリ作成時点で script 本体は修正していない。エンジン報告 JSON の直接読取で検出不能 0 件を実測確認して運用回避）
- **ギャップ分類**: fix gap（表示欠陥の実装バグ）
- **ギャップ詳細**: summary の表示判定が型存在（!= null）と内容存在（length > 0）を区別していない。detection_unavailable は空配列が正常値として流れるため常時 true 表示になる

## 制約

- ゲート判定（exitCode）には影響しないため、修正は表示のみ。既存報告 JSON の消費者（意味レビュー）への影響は「true 表示が消える」方向で後方互換
- unit test 追加時に既存テストの期待値へ影響がないか確認する（detection_unavailable 非空ケースの期待値は変化しない）

## 受け入れ条件

- [ ] overlapSummary の detection_unavailable 判定が `Array.isArray(v) && v.length > 0` になっている
- [ ] 空配列ケースの unit test が追加され、summary が detection_unavailable=true と表示しないことを検証している
- [ ] 既存 unit test（非空ケース・不存在ケース）が pass を維持する

## 元learning item / 根拠

- **要約**: accept_definition_checks の overlap summary が空の detection_unavailable を true と表示した（エントリ: 「accept_definition_checks の overlap summary が空の detection_unavailable を true と表示した」）
- **根拠**: Issue #3550 の case-ready STEP-1 で、script 報告 JSON の summary と同一入力でのエンジン直接実行による報告 JSON の突合で表示欠陥を特定（根本原因: `parsed.detection_unavailable != null` 判定で空配列も存在扱い）。script 本体は修正せず学びへ記録した。横展開観点として、script 報告 JSON を意味レビューする全 case-ready / case-revise 実行で summary 表示の裏付け取りが必要になる常態
- **再発条件**: detection_unavailable が空配列のまま script 経由の summary を読む場合（常時）
- **横展開可能性**: spawnSync でエンジン報告をラップして summary を組み立てる機械工程 script 全般

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: bug
- **関連Issue**: #3550
