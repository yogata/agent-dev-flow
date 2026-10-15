# REQ追加時の手動件数記述と派生物同期

## 背景

REQ-112 の追加時、`generate_indexes` は `docs/README.md` の AUTOGEN 件数を70へ更新したが、手動管理区間の「現行要件は69件である。」は更新されなかった。その結果、`check_integrity` の `req-range-staleness` が exit 1 となり、`req-health-metrics.md` を含む補正 commit も必要になった。

## 問題

REQ追加を伴う Definition 変更で、手動管理区間の件数記述と REQ 行数由来の派生物が初回の変更・検証範囲から漏れ、既存 integrity gate が不整合を検出する。

## 望ましい変更

REQ追加時の Definition 編集範囲と派生物の stage-path contingency を既存手順で扱えるようにする。具体的な実現方法は req-define の変更影響分析で決定する。

## 対象範囲

### 対象

- REQ追加を伴う Definition 変更での手動件数記述の追随
- REQ行数由来の派生物が事前に stage paths へ含められない場合の扱い

### 対象外

- integrity gate の緩和・迂回
- AUTOGEN の手動編集や REQ 件数の推測

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill / script | `agentdev-workflow-case-open/references/definition-pr-and-idempotency.md`、`prepare_definition_pr` | 手動管理区間と派生物 contingency の確認手順候補 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: `docs/README.md`、`generate_indexes`、`check_integrity`、case-open `definition-pr-and-idempotency.md`
- **ギャップ分類**: application miss
- **ギャップ詳細**: AUTOGEN 外の手動件数記述は generator の更新対象ではなく、REQ追加時の編集範囲に含める手順が不足していた。REQ 行数派生物の事前包含不能時にも補正が必要となる。

## 制約

既存の整合性 gate を維持し、件数不一致を成功扱いにしない。対象文書・派生物の実際の更新範囲は下流の変更影響分析で確定する。

## 受け入れ条件

- [ ] REQ追加時に手動管理区間の件数記述を照合する手順が明確である。
- [ ] 派生物が stage paths に事前包含できない場合の検出・補正・証跡が明確である。
- [ ] integrity gate の不一致検出を維持する。

## 元learning item / 根拠

- **要約**: REQ追加で手動件数記述が追随せず、integrity gate が失敗した。
- **根拠**: inbox の E3、PR #3690、Issue #3681、commit `e43bb977`。
- **再発条件**: REQ行追加を伴う Definition 変更で `docs/README.md` の手動件数区間が変更対象から漏れる場合。
- **横展開可能性**: active REQ 件数を記録する Definition 変更全般。

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: bug
- **関連Issue**: #3681
