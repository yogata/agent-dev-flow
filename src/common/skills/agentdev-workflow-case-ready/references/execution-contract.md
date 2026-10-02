# execution contract 確定（STEP-4）

canonical Definition 確定後の execution contract 確定と Root Case 本文への投影の実行時詳細である。
execution contract の境界定義の正規所有は Issue Execution Contract REQ、投影契約の正規所有は Root Case 実行契約 REQ である。

## 確定要素

canonical Definition 確定後に、次の要素を execution contract として Root Case 本文へ確定する:

- 対象範囲
- 変更対象成果物
- 関連 REQ / Decision / Design
- 完了条件（成果状態。実行手段と検証手段は test strategy に分離する）
- test strategy（verification / pass_criteria / on_failure の3要素）
- 必須 artifact-specific quality control
- scope-affecting impact candidate
- ユーザー明示 review 発動契約
- work_type / scale / Issue structure

## 投影の制約

- 機能要件、非機能要件、制約、対象外、受け入れ条件は新規作成せず、合意済み Definition（req_draft と canonical Definition）を execution contract の各要素へ投影する
- work_type / scale / Issue structure の判定基準と固有ルールは `agentdev-workflow-lifecycle` を参照する
- 完了条件は成果状態を記録し、Skill 呼出自体を完了状態として扱わない（利用者要求である場合を除く）

## test strategy への反映

- 変更予定成果物の種別から必須品質統制を導出できる場合、その適用要否を case-run に委ねず test strategy へ反映する
- document、Skill、Command の各変更に対し、それぞれ文書品質査読能力、Skill 品質査読能力、Command 品質能力に相当する必須検証を事前確定する。同一成果物が複数能力を必要とする場合は全て展開する
- 関連 Decision の拘束条件を確定前に特定し、必要な制約を完了条件または test strategy へ反映する
- 予定変更内容から事前判定可能な追加検証条件（関数削除時の全利用箇所検査等）を test strategy へ展開する

## 変更影響候補の反映

- 確定前に変更影響候補を探索し、scope、完了条件、test strategy に影響する候補を反映する
- 影響候補が対象範囲の拡大を要求する場合は STEP-1 の HITL 停止条件に従う

## realization_actions の投影

- req_draft の realization_actions（実現面の変更方針）を Issue / Epic の execution contract へ投影する
- case-ready 成功後は case-run が Issue 本文だけで変更責務、変更意図、検証方針を取得できるようにする
- realization_actions は新しい execution contract として再確定せず、合意済み内容をそのまま投影する

## review 発動契約の永続化

- ユーザー明示指定による adversarial-review 発動契約を Issue 本文へ永続化する
- 発動契約の指定がない場合はその旨を記録する。case-run 側が一時会話コンテキストのみを根拠に新規発動契約を追加しない前提を、ここで確定する

## runtime-only 判断の除外

- runtime-only 判断（worktree 状態、staleness、実 diff、実装結果、test 実行結果）を事前確定しようとせず、case-run の安全検査として維持する

## 適用範囲と互換運用

- 本 STEP で確定する execution contract は新規 Issue および新契約へ更新済み Issue から適用し、未更新の既存 Issue には遡及適用しない
- 新契約項目欠落のみを理由に既存 Issue を一律 blocked に扱わない
- 新規 Issue および新契約へ更新済み Issue の識別は schema version 導入によらず、Issue 本文の新契約必須セクション存在有無（presence-based 判定）による
- Definition 変更反映（case-revise → case-ready）後は新 execution contract を適用する

## case-run への引き渡し前提

- case-ready 成功後、case-run は req_draft を参照して不足契約を補完せず、Issue / Epic を SSoT として処理できる状態へ引き渡す
- 不足契約の補完は本 STEP で完了させる。不足が解消できない場合は停止理由を報告する

## Root Case 本文の更新

- execution contract の反映は Issue 本文の該当セクション置換で行い、Markdown 行構造（LF、セクション間空行、インデント）を保持する
- 本文はファイル経由で扱い、Custom Tool `agentdev_gh` の操作引数として渡す
- 更新前後の内容を比較し、意図しないセクション欠落を検出した場合は更新を取りやめて停止する
