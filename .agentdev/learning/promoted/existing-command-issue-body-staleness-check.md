# case-open Issue body スナップショット陳腐化の staleness check 導入

## 背景

case-open が Issue 完了条件・事前状態セクションに、ファイルパス参照や検査結果件数等の「変化しやすい外部状態のスナップショット」を埋め込んでいる。case-open → case-run の間に、参照先の外部実体（ファイル名/パス、check_integrity.ts 本体等）が並行 rename PR や検査ルール改修で変化すると、Issue 本文が陳腐化する。この陳腐化は case-run 実装時（QG-3）や case-close（QG-4）で事実乖離（spec-bug 分類）として検出され、実装修正・読替作業・Findings 記録の手戻りを生む。2件の事象（rename PR によるファイルパス陳腐化、check_integrity.ts 改修による件数スナップショット陳腐化）で同一根本原因が確認された。

## 問題

1. case-run は Issue 本文が参照するファイルパス・検査結果の現行整合性を、実装開始前に再検証する手順（staleness check）を持たない。陳腐化は QG-3/QG-4 で事後検出され、spec-bug として処理される。
2. case-open は件数等の変動しやすい実測値スナップショットを主情報として記録する。安定した識別子（ファイル相対パス、NG 識別子）を主情報とし、件数を補助値とする記録粒度の規定がない。

## 望ましい変更

- case-run の QG-3 前置検査として、Issue 本文が参照するファイルパスの存在確認（staleness check）を追加する。差異検出時は Findings に記録し、case-update で Issue 本文を現行名称へ更新してから case-run を再開する運用を明文化する。
- case-open の完了条件・事前状態記載ガイドラインを整備し、変動しやすい実測値（件数・行数）は補助値とし、安定した識別子（ファイル相対パス、NG 識別子リスト）を主情報とする。

## 対象範囲

### 対象

- case-run command（QG-3 前置 staleness check 手順）
- case-open command（完了条件・事前状態の記録粒度ガイドライン）
- `docs/specs/commands/case-run.md`（SPEC 該当箇所）
- `docs/specs/commands/case-open.md`（SPEC 該当箇所）

### 対象外

- case-update command 本体の改修（case-update は現行機能で Issue 本文更新が可能、staleness check 検出後の呼び出し先として利用）
- check_integrity.ts 本体の改修（検査結果の変動は本質ではなく、スナップショット記録方針の問題）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| command | case-run.md | QG-3 前置 staleness check 手順（Issue 本文参照ファイルパスの現行存在確認、差異時の Findings 記録＋case-update 連携）を追加 |
| command | case-open.md | 完了条件・事前状態記載ガイドライン（識別子中心、件数は補助値）を追加 |
| spec | docs/specs/commands/case-run.md | case-run SPEC の該当ステップに staleness check 要件を追記 |
| spec | docs/specs/commands/case-open.md | case-open SPEC の完了条件記載粒度を追記 |

## 既存対策確認

- **確認結果**: 既存対策あり（部分カバー）
- **該当ファイル**: case-run（前提確認フェーズ）、case-update command（Issue 本文更新機能）、agentdev-quality-gates skill（QG-3）
- **ギャップ分類**: fix gap + guardrail insufficiency
- **ギャップ詳細**: case-run の前提確認フェーズは存在するが、Issue 本文のファイルパス参照・検査結果スナップショットと現行 repo 状態の整合性を検証する明示的 staleness check がない。case-open の完了条件記載粒度（識別子中心 vs 件数スナップショット）の規定がない。

## 制約

- staleness check は case-run の実装作業を開始する前に実施し、QG-3 本体とは独立した前置検査とする。
- 差異検出時の Issue 本文更新は case-update の責務。case-run 単独で Issue 本文を書き換えない。
- 並行 rename PR が Wave 内で発生しにくい case-auto（Wave 境界でマージ）では Wave 間の陳腐化リスクは残るが、staleness check は有効。
- 既存の QG-3 deviation 分類（spec-bug 等）の運用を変更しない。staleness check は deviation 発生前の予防層。

## 受け入れ条件

- [ ] case-run に QG-3 前置の staleness check 手順が追加されていること（Issue 本文参照ファイルパスの存在確認）
- [ ] staleness check で差異を検出した場合の Findings 記録＋case-update 連携の手順が明文化されていること
- [ ] case-open の完了条件・事前状態記載に「識別子中心・件数は補助値」ガイドラインが追加されていること
- [ ] 既存の QG-3/QG-4 運用（deviation 分類）と整合すること

## 元learning item / 根拠

- **要約**: case-open が埋め込んだ外部状態スナップショット（ファイルパス、検査結果件数）が case-open→case-run 間の並行変更で陳腐化し、QG-3/QG-4 で事実乖離として検出される。
- **根拠**: (1) Issue #1371 が `check_read_contracts.ts`/`docs/specs/commands/inspect-read-contracts.md` を参照していたが、case-open→case-run 間に並行 PR #1362 がマージされ `check_doc_inputs.ts`/`inspect-doc-inputs.md` へ rename 済みとなり、case-run 実装時に現行名称へ読み替える必要が生じ QG-3 で has-deviation（spec-bug）として記録された。(2) Issue #1145 の事前状態「ok 294 / ng 4 / warning 10」が、case-open 後の check_integrity.ts 本体改修（IR-045 削除、IR-044 exemption 機械化等）で実測「ok 206 / ng 2 / warning 13」に変化し、列挙された 4 NG のうち 2 件が既解消として case-run で検出された。
- **再発条件**: case-open が外部状態スナップショットを Issue 本文に記録し、case-open→case-run 間に当該外部実体を変更する PR/commit がマージされた場合。
- **横展開可能性**: case-open→case-run 間に並行 PR がマージされる全運用（手動 case・Wave 間双方）で発生しうる。汎用的。

## 推奨Issue分類

- **分類**: feature
- **推奨ラベル**: enhancement, process-improvement
- **関連Issue**: Issue #1371（rename PR 陳腐化）、Issue #1145（integrity snapshot 陳腐化）
