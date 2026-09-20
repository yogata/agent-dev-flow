# docs-chore OU の対象範囲定義に「削除起因の実行時設定参照の追随」を明示する

## 背景

4 Design 物理削除（Case #2979 OU-003）の帰結で .agentdev/extensions/skills/ 7 ファイル 9 paths が dangling（checkExtensions strict failure 9 件）となった。extensions 参照追随は Root Case の 3 OU いずれの対象範囲にも明示割当がなく、削除を実施した OU-003 が帰結を吸収した（commit 0dc505b8）。同種の事例として learning-promote.md 参照張替え（commands scope と skills scope の隙間・E6-2）が Epic #2984 コメント 5739535761 / 5739649814 に記録済みで、本件は同問題クラスの 2 事例目である。

## 問題

docs-chore OU（Design・REQ・SPEC 系の整備・削除を担う実行単位）の対象範囲定義が「削除起因の実行時設定参照の追随」を含まず、OU 間の隙間になる。物理削除された成果物を .agentdev/extensions/** 等の実行時設定が参照している場合、追随責務がどの OU にも割当てられず、削除を実施した OU が計画外の帰結を吸収する（または dangling を残して fan-in で検出されるまで放置される）。

## 望ましい変更

物理削除を含む docs-chore OU の対象範囲定義に「削除起因の実行時設定参照の追随」を明示的に含める運用を、OU 構成（execution_unit 構成）の知識・手順へ反映する:

1. 削除対象の参照先を extensions / templates 等の実行時設定まで含めて事前確認する
2. 削除を伴う OU の対象範囲には参照追随（旧→新参照マッピングへの従い）を明示割当する
3. OU 分割時の隙間検出観点として「変更成果物が他 OU・実行時設定から参照されるか」の確認を含める

## 対象範囲

### 対象

- execution_unit（OU）構成手順・委譲プロンプトの対象範囲定義（case-open / case-run の OU 構成・adapter）
- 物理削除を伴う docs-chore 系 Case の OU 設計

### 対象外

- checkExtensions 検査の実装（fan-in での検出側は既存・正常動作）
- 特定 Case（#2979・#2984）の個別対応（完了済み）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補である。

| 種別 | パス | 変更内容 |
|------|------|----------|
| Design | docs/designs/workflows/references/execution-unit-construction.md（execution_unit 構成アルゴリズム参照） | OU 対象範囲定義に削除起因の実行時設定参照追随の割当規則を追記する候補 |
| 配布skill | src/opencode/skills/agentdev-case-run-execution-adapter/（OU 対象範囲・委譲手順） | 削除を伴う OU の委譲プロンプトに参照追随の明示割当を含める運用の追記候補 |
| 配布skill | src/opencode/skills/agentdev-workflow-case-open/（execution contract 生成・OU 構成） | 削除対象の参照先事前確認（extensions・templates 含む）を OU 構成手順へ追記する候補 |

## 既存対策確認

- **確認結果**: なし
- **該当ファイル**: なし（OU 対象範囲定義に削除起因の参照追随を含める規則は未整備。E6-2 は Epic コメントの記録止まり）
- **ギャップ分類**: なし（既存対策不在。新規の運用規則化）
- **ギャップ詳細**: 2 事例（E6-2: commands/skills scope の隙間、Case #2979: OU 割当外の extensions 参照追随）で同一クラスの隙間が発生。いずれも事後吸収で完了したが、OU 設計時の予防規則が存在しない

## 制約

- checkExtensions 等 fan-in 検査での検出（事後）は維持する。本変更は OU 設計時の予防（事前）を追加するもの
- 参照張替えの正本（旧→新参照マッピング表）は各 Case の Design 変更内容が所有する
- OU 対象範囲の変更は execution_unit 構成アルゴリズムの契約に従う（req-define での影響分析を経る）

## 受け入れ条件

- [ ] 削除を伴う docs-chore OU の対象範囲に実行時設定参照の追随が明示割当される運用が文書化されていること
- [ ] 削除対象の参照先事前確認（extensions / templates 等を含む）が OU 構成手順に含まれること
- [ ] E6-2 と Case #2979 の 2 事例が根拠として参照可能であること

## 元learning item / 根拠

- **要約**: 物理削除を伴う docs-chore OU の対象範囲定義が削除起因の実行時設定参照追随を含まないため OU 間の隙間になる。参照先の事前確認と追随の明示割当で予防する
- **根拠**: Case #2979 OU-003（2026-09-19）: 4 Design 物理削除の帰結で .agentdev/extensions/skills/ 7 ファイル 9 paths が dangling（checkExtensions strict failure 9 件・fan-in 検査で検出）。OU-003 が旧→新参照マッピング表に従い extensions context.paths を v4 後継へ張替え（commit 0dc505b8）。E6-2（Epic #2984 コメント 5739535761 / 5739649814）: learning-promote.md 参照張替えが commands scope と skills scope の隙間となった同種事例
- **再発条件**: 物理削除を含む docs-chore OU で、削除対象に依存する実行時設定の参照が存在する場合。OU 分割時に参照される成果物の変更が複数 OU・scope にまたがる場合
- **横展開可能性**: 削除・rename を伴う横断変更全般。実行時設定（extensions・templates）が docs 成果物を参照する構成のプロジェクトで発生し得る

## 推奨Issue分類

- **分類**: fix
- **推奷ラベル**: workflow, epic
- **関連Issue**: Case #2979、PR #2986（commit 0dc505b8）、Epic #2984（E6-2 記録）
