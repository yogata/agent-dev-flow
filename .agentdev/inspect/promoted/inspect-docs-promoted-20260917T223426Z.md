# inspect-docs promoted 20260917T223426Z

> 本ファイルは inspect-promote（2026-09-18 実施、/agentdev/backlog-auto stage 2 inspect 系統経由、--auto なし）の分類確定により promote となった検出事項を保存する。対論型レビュー（adversarial-review、2系統独立 stream、challenge → counter-challenge → convergence → convergence audit）を実施し、QG-4-1・IDX-1 は promote の自律確定（HITL 不要）、REQ57-1 は defer として分離した。REQ57-1 は元 finding ファイル（inbox 側）の defer 残置分として残置。reject 0件。
>
> - QG-4-1: 証拠は一次文書実読みで完全一致（quality-gates.md:174-181 の旧カタログ・未分類記述、DEC-030 決定4/L32 の廃止明記、traceability-model.md:48-49、policy.yaml 実在、配布スキル qg-4-final-acceptance.md:356/358 は現行化済み＝Design と配布スキルの非対称が事実）。判定表8要件適合、正規情報源一意
> - IDX-1: 欠落は実在（docs/README.md 詳細表は REQ-082 まで51行、REQ-083/087 実ファイル実在、AUTOGEN 表53件整合）。同一事象の intake item（2026-09-17-req-detail-table-missing-new-req-rows.md）は intake-promote 2026-09-18 で同時に採用済み。**統合は backlog-review の責務**（intake promoted との二重管理ではなく統合前提）

## 検出事項リスト（promote 分）

### QG-4-1: quality-gates Design に廃止済みの検証対応要否カタログ・未分類モデルが残存

- **category**: 横断契約矛盾（Design DRIFT、REQ/Decision/Design 間の責務・契約不整合）
- **target**: `docs/designs/quality/quality-gates.md:174-181`
- **evidence**:
  - `quality-gates.md:176`: 「QG-4 の traceability check は Design ヘッダの ADF-COVERS 宣言と検証対応要否カタログという単一 PR の差分に閉じない横断 durable state を判定対象とする」
  - `quality-gates.md:179`: 「未分類（unclassified）行」および「検証対応要否カタログ登録 commit」の時系列を前提としている
  - `quality-gates.md:180`: 「検証対応要否カタログ不在時は全要件行を検証対応必須として扱う安全側既定は維持する」
  - 上位の `docs/decisions/DEC-030.md:25` は「検証対応要否カタログと未分類状態、およびその工程ゲートを廃止する」と決定し、`traceability/policy.yaml` を正規ポリシーとした。`DEC-030:32` は旧カタログの廃止と `traceability/policy.yaml` への移行を明記する。
  - `docs/designs/foundations/traceability-model.md:48-49` も「未分類」という中間状態は存在せず、旧カタログは廃止済みと明記する。配布スキル `src/opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md:356` は既に `traceability/policy.yaml` を参照しており、Design と配布スキルの記述が非対称である。
- **severity**: high
- **confidence**: high
- **source_of_truth**: 承認済み `DEC-030`（2026-09-17）および現行 `traceability-model.md` を正とする。`quality-gates.md` は下位の Design 記述として矛盾する。
- **recommended_route**: `UPDATE`。`quality-gates.md` の traceability check 節を `traceability/policy.yaml`、未指定=required、check の fail-closed 契約へ現行化する。意味判断を伴わない文書現行化として backlog-review で処置する。
- **ng_classification**: 今回修正対象
- **notes**: DEC-030 の Definition PR/Case #2936 に伴う更新で対象 Design も変更されているが、本節に旧モデルの残置がある。L180 の安全側既定（ポリシー不在時は required）は現行モデル（traceability-model.md:43 に同義規定）でも成立するため、**概念名と工程ゲートのみを置換すべき**（adversarial-review で確認済み: 安全側既定の廃止は不要）。req-define 再壁打ち案は不要。

### IDX-1: docs/README.md の現行 REQ 詳細一覧表に REQ-083・REQ-087 が欠落

- **category**: 第一参照導線・REQ 参照ID整合性（README 索引の実体整合）
- **target**: `docs/README.md:8-14,16-68`
- **evidence**:
  - `docs/README.md:9` は「現行 REQ: 53件」と表示するが、同ファイルの詳細表は REQ-082 で終わり、表の行数は51件である。
  - 実ファイルは現行53件であり、`docs/requirements/REQ-083.md`（2026-09-17 作成）と `docs/requirements/REQ-087.md`（2026-09-16 作成）を含む。
  - `docs/requirements/README.md:65-67` の AUTOGEN 表には REQ-082、REQ-083、REQ-087 が存在し、現行53件の第一参照先として整合している。従って欠落は `docs/README.md` の hand-curated 詳細表に限定される。
  - 同一事象の intake item（`.agentdev/intake/promoted/2026-09-17-req-detail-table-missing-new-req-rows.md`、2026-09-18 採用済み）が存在する。
- **severity**: medium
- **confidence**: high
- **source_of_truth**: 現行 REQ 実ファイルおよび AUTOGEN 管理下の `docs/requirements/README.md` を正とする。`docs/README.md` の手動詳細表が下位の案内層として不足する。
- **recommended_route**: `UPDATE`。`docs/README.md` の REQ 詳細表へ REQ-083・REQ-087 を追記する。**同一事象 intake item との統合必須（統合は backlog-review 責務）**。
- **ng_classification**: pre-existing
- **notes**: 事象は Case #2917 の実装時点から既知で、既存 intake に根拠と処置選択肢がある。ただし現在も欠落状態が継続している。AUTOGEN 移行か手動チェックかの運用決定は intake item 側「レビューで決めること」に明示済みで backlog-review 以降の判断。req-define 再壁打ち案は不要。新規 REQ CREATE 後の hand-curated 表鮮度を docs-check で検出する route 候補でもある。

## docs-check route 候補（promote 分に紐づくもの）

1. `docs/README.md` の REQ 詳細表について、現行 `docs/requirements/REQ-*.md` の実体一覧（タイトル含む）との ID・件数突合を追加する。今回の IDX-1 を決定的に検出できる。
2. accepted Decision が廃止した旧概念（検証対応要否カタログ、未分類状態等）の活性 Design への残留を語彙・参照検査する。今回の QG-4-1 の候補抽出に使用できる（最終的な履歴文脈・説明目的の除外は意味診断で行う）。

## 出典

- 元 finding: `.agentdev/inspect/inbox/inspect-docs-finding-20260917T223426Z.md`（2026-09-18 診断。REQ57-1 の defer 残置分として同ファイルに残置）
- 審議記録: inspect-promote 2026-09-18 実施分（adversarial-review 2系統 stream、unresolved 0件、親引き継ぎ事項は各 notes に反映済み）
