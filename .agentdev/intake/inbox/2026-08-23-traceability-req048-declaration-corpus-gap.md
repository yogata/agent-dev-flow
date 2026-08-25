# REQ-048 トレーサビリティ宣言カバレッジギャップ（PR 本文 ADF-COVERS はコーパス外）

## 観測

Epic 2399 Wave 2 完了後（PR 2406・2407 マージ後、main 36a66abd）の case-close 再評価で、agentdev-traceability check（行ID展開指定、`--root` リポジトリ root）が次の不合格を検出した。

- missing-implementation: REQ-048-012〜014（Area3）
- missing-verification: REQ-048-007〜014（Area2・Area3）

要件行ごとの内訳: 001〜006・021（Area1）は workflow-contracts.md と execution_ident_contract.test.ts、015〜018（Area4）は agentdev-workflow-templates.md と verification_diff_contract.test.ts、019〜021 は docs/reports/req-048-reanalysis-baseline.md で実装・検証対応とも成立している。007〜014 はファイルベースの対応宣言が存在しない。

根本原因の分析（3点）:

1. PR #2407 当初の発見は REQ レベルID（`--req REQ-048`）での実行だった。check CLI は REQ レベルIDを行IDへ展開しないため、findings は reqId 粒度のみとなり行内訳が非表示だった（usage 起因。正しくは行ID列挙指定か無指定）
2. Area3（012〜014）の実装・検証対応宣言は IR-055 対策として PR 2406 本文の ADF-COVERS 宣言へ集約されたが、PR 本文はコーパス走査（リポジトリファイル .md/.ts）の対象外であり、ファイルベース宣言が存在しない状態と等価になる
3. Area2（007〜011）は verification 宣言を担う成果物（契約テスト・docs 報告書等）が存在しない

構造的背景: 配布物（src/opencode/**）は ID 汚染検出（IR-055・配布依存境界）により REQ ID 記述が禁止されているため、配布物中心の要件行は docs 側（Design・報告書）または repo-local テストに宣言を置くしかない。

## 今回扱わない理由

対応宣言の登録（Design ファイルや docs 報告書への ADF-COVERS 追記）は design-save 系手続きの責務であり、case-close は不足する対応関係を自動追加しない（fail-open で継続。実装・検証の実体は PR 本文の ADF-COVERS 宣言と検証記録で確認済み）。

## 影響

- traceability check が REQ-048 に対して恒常的に未解決不合格になり、移行完了条件（check の未解決不合格 0 件）を満たせない
- 「PR 本文 ADF-COVERS 集約」（IR-055 対策）と「ファイルコーパス宣言」（トレーサビリティ完全性）が構造的に競合する

## レビューで決めること

- 配布物中心の要件行（Area3 系）の宣言配置先: Design ファイル（workflow-contracts.md の該当セクション等）へ implementation 宣言を追記するか、コーパスが Issue/PR 本文宣言を読む仕組みを作るか
- Area2（007〜011）の verification 宣言を担う成果物の要不要（契約テスト新設 or docs 報告書）
- check CLI の REQ レベルID指定時の扱い: 行IDへ展開する、警告する、拒否するのいずれかにするか

## 根拠

- PR 2407 本文「Findings/ Capture候補」（回収元: https://github.com/yogata/agent-dev-flow/pull/2407 ）
- case-close 再評価の記録: Issue 2402・Epic 2399 の対応記録コメント「検証差分」セクション（トレーサビリティ check 行）
