# REQ-049 の ADF-COVERS 宣言 corpus 欠落（001〜004 の実装対応、検証対応必須行の多く）

## 観測

Epic #2408 Wave 1 の case-close 独立再検査（agentdev-traceability check --req REQ-049、PR #2412 HEAD ef427342）で、missing-implementation 5行（REQ-049-001〜004、030）、missing-verification 23行が残存。PR #2412 による改善（005〜014 に implementation、008/009/010/012/013/026/029 に verification）は確認済み。PR 本文は残存行を「#2410、#2411 担当行 001〜004、019〜022、030」と記載するが、Epic 本文の REQ 行 → 子Issue マッピング（#2409: 001〜018・025〜029）では 001〜004 は #2409 の完了条件行であり、帰属が不一致している。検証対応要否カタログ（docs/designs/foundations/references/verification-scope-catalog.md）に REQ-049 行の登録がないため、未登録行は全て検証対応必須扱いになっている。repo 全体でも REQ-010/032/045/046/047/048 に同種の未解決 findings が残存しており、Epic #2399（REQ-048）では corpus gap が intake item として別管理された前例がある。

## 今回扱わない理由

対応宣言の追加（Design の ADF-COVERS 行更新、検証対応要否カタログへの REQ-049 行登録）は design-save / traceability-model の責務であり、case-close は対応関係を自動追加しない（トレーサビリティ能力の利用契約）。実装の実体は QG-4 評価で担保済みのため Wave 1 のマージは阻断していない。

## 影響

REQ-049 の check 未解決不合格が残存し、Epic 完了時点（Wave 3 クローズ）でも 0 件にならない。001〜004 は後続 Wave（#2410: 019〜024、#2411: 030）の対象行ではないため、放置すれば Epic 完了後も解消されない。

## レビューで決めること

- REQ-049-001〜004 の実装対応宣言をどの成果物が持つか（skill Design の ADF-COVERS 行への追加、docs/issue-list/README.md への宣言追加、またはREQ-049 の機構全体を案内する別成果物）
- REQ-049 行の検証対応要否カタログ登録（検証対応任意行とする行の選定。TS-004/TS-006〜TS-012/TS-QC-01/02 で検証済みの行と宣言の対応づけ）
- Wave 3（#2411 通し確認 TS-001〜TS-013）での宣言補完を完了条件に含めるか

## 根拠

- PR #2412 本文「品質メトリクス」traceability check 行、case-close 対応記録コメント（Issue #2409、検証差分 case-close 行）
- Epic #2408 本文「補足情報」REQ 行 → 子Issue マッピング
- .agentdev/intake/inbox/ における REQ-048 corpus gap の先行 precedent（Epic #2399、PR #2406 学び記録より）
