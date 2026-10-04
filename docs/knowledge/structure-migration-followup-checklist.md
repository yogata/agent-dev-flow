---
title: 構造移設の追随漏れ防止（3点セット同時変更・横断旧パス検索・全層テスト実行）
created: 2026-10-03
updated: 2026-10-05
---

## 知識内容

src/opencode から src/common への構造移設・原本移設では、移設元パスの参照が多層（src テスト、scripts、検査基盤の baseline・除外定義・文言）に分散しており、単一層の更新では追随漏れが残る。src テストの green は追随完了の証拠にならない（PR #3326/#3327/#3332 の 3 件連続実証）。移設完了の判定は次の 3 点で行う。

1. **3点セット同時変更**: 検査基盤の走査先変更は (a) baseline 期待値、(b) 除外定義、(c) 検査文言・メッセージの 3 点を同時に変更する
2. **横断旧パス検索**: 移設完了判定は src 配下に加え scripts 配下（scripts/self 等）を含む横断検索で旧パス残存 0 件を確認する。検索語はパス区切りのバリエーション（`src/opencode`・`src\\opencode`・`opencode/skills` 等）を網羅する（TS-011 の教訓を含む。主要な区切り形式 2-3 種に限定して実行コストとバランスを取ってもよい）
3. **移設後の全層テスト実行**: src テストに加え scripts 配下テスト・fixture を含む全実行で追随を確認する

## 適用条件

- パス構造の移設・原本化を伴う変更（Epic Wave 構成を含む）
- 検査基盤（baseline・除外定義）の走査先を変更する場合

## 手順

1. 移設に伴い baseline・除外定義・検査文言を同一変更に含める
2. src + scripts 横断で旧パス検索（区切り形式バリエーション含む）を行い残存 0 件を確認する
3. src テスト・scripts 配下テスト・fixture の全層実行で追随を確認する

## 留意点

- src テスト green だけを追随完了の証拠にしない（scripts/self 配下の検査テストは src テストでは実行されない）
- 旧パス参照は backward slash・スラッシュ等の区切りバリエーションで存在し得る

## 出典

- Case #3316（PR #3326 Findings）: baseline・除外定義・文言の 3 点セット要変更
- Case #3316（PR #3327 Findings）: third-party-sync-contract.test.ts の旧原本参照 pre-existing fail
- Case #3316（PR #3332 Findings）: scripts/self 配下検査テストの旧構成前提残存

## 適用対象

- パス構造の移設・原本移設を伴う Case（Epic Wave 構成を含む）の完了判定と追随確認
- 検査基盤（baseline・除外定義・検査文言）の走査先を変更する変更単位の受け入れ判定
- src テスト・scripts 配下テスト・checker 実装の追随確認を伴う全 Case

## 根拠

- 出典 3 件（Case #3316・PR #3326/#3327/#3332）の連続実証: 単一層の更新では追随漏れが残り、src テストの green は追随完了の証拠にならない
- pin 型テスト群の期待値更新観点・bun test と typecheck の併用観点は要件化経路（req-define）での追加候補として記録されている（backlog-review 2026-10-05・RU-0014）

## 関連知識

- [bun-test-execution-form-drift-signals.md](bun-test-execution-form-drift-signals.md)（bun test 実行形態逸脱の検知。全層テスト実行の実行形態側）
- [windows-git-bash-inline-content-corruption.md](windows-git-bash-inline-content-corruption.md)（bash 経由でのスクリプト・文言伝達の破損回避）
