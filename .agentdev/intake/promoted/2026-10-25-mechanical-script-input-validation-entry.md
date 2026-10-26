# 機械工程 script への入力検証専用入口（validateInput 分離入口）新設の拡張候補

## 観測内容

- 機械工程 script 側に「入力検証のみを実行する入口（validateInput 分離入口）」がなく、必須ゲート実行体の不在（`evaluateGateAvailability` は実行時ステップ）を consumer の check モードから直接検出できない現状がある
- `prepare_definition_pr.ts` の `dryRun: true` 入口はゲート実行体がすべて存在する場合 worktree 作成ステップへ到達する（dryRun ガード外のステップ）ため consumer の check からは呼べず、install.ps1 が producer workflow のゲート実行体対応を入力に再構成するのは producer 契約の重複実装になる

## 影響

- consumer の check は入口の不在検出ができず、ゲート実行体欠如の検出が producer workflow 実行時まで後ろ倒しになる。

## 課題

- 機械工程 script への入力検証専用入口の新設と scripts 契約（scripts/README.md 等）への dry-run 入口仕様の定義を 1 件の拡張として検討する
- Design「機械工程 script の実行時前提の導入時検証」節の所有関係（検証対象 script の範囲と dry-run 入口の仕様は配布 skill の script 契約が所有・130 行: script 契約に定めてから check の検証対象へ組み込む）に従う将来拡張
- REQ-009-053 の install.ps1 check 実装（PR #3861）は入口の新設を対象外とし既存入口の呼出しのみで実装済み

## 既存要件との関連

- REQ-009-053（install.ps1 check）、機械工程 script 契約（scripts/README.md）、check_integrity 検証対象

## 出典

- 観測元: PR #3861 本文「## Findings/ Capture候補」セクション intake 項（case-close E4-1 最終 gate 実行時の Wave 2 クローズ。Epic #3850）
- 関連設計判断: PR #3861 本文「## Design確定候補」セクション 1 項目目（check モードの機械工程前提検証の検出範囲分割。必須ゲート実行体の不在検出は機械工程 script 実行時の gate-availability step〔Wave 1 実装、fail-closed〕が担う設計）
