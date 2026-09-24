# bun test の証跡で stdout・stderr 分離併退避の適用漏れを防ぐ

## 背景

stdout単独退避で27 bytesとなり件数突合不能。2026-09-20にも同種事象があり、2回発生。

## 問題

bun test はテスト結果サマリー（Ran N tests 等）を stderr へ出力する仕様に対し、証跡退避実装が stdout のみを前提とした

## 望ましい変更

stdout/stderr 分離併退避（正規形）、サンプルコマンドへの 2> 常時付与

## 対象範囲

### 対象

- qg-4-final-acceptance.md「証跡の stdout・stderr 分離併退避」節

### 対象外

- learning-promote による実現先の確定・直接反映

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| 候補 | qg-4-final-acceptance.md「証跡の stdout・stderr 分離併退避」節 | application miss + fix gap候補。実行手順のサンプルに stderr 退避を常時含める明示が不足。 |

## 既存対策確認

- **確認結果**: あり
- **該当ファイル**: qg-4-final-acceptance.md「証跡の stdout・stderr 分離併退避」節
- **ギャップ分類**: fix gap
- **ギャップ詳細**: application miss + fix gap候補。実行手順のサンプルに stderr 退避を常時含める明示が不足。

## 制約

実現先の最終選択は req-define の変更影響分析が行う。恒久契約候補は backlog-review → req-define 経由で確定する。

## 受け入れ条件

- [ ] 問題クラスの根拠と再発条件を保持する
- [ ] 推奨反映先候補を下流で再調査できる
- [ ] 元 learning item の証拠が本成果物内に保存されている

## 元learning item / 根拠

- **要約**: bun test の証跡で stdout・stderr 分離併退避の適用漏れを防ぐ
- **根拠**: stdout単独退避で27 bytesとなり件数突合不能。2026-09-20にも同種事象があり、2回発生。
- **再発条件**: evaluation-report の問題クラス4および原エントリを参照
- **横展開可能性**: bun test 証跡取得全般

### 原エントリ（証跡）

### Inbox 原文 1

## bun test の summary（Ran N tests / pass fail 件数）は stderr へ出力される（stdout 退避のみでは件数突合不能）

- **問題事象**: bun test の実行証跡を stdout リダイレクトのみで退避したところ、ファイル容量 27 bytes でほぼ空となり「Ran N tests across M files」の件数突合に必要な summary が得られなかった
- **発生局面**: 運用（case-close QG-4 観点10 フル suite 3-split 実行。main root、bun 直接実行）
- **検知方法**: 退避 stdout ファイルの件数突合 grep が空になり、summary が stderr 側に出力されていることを確認
- **根本原因**: bun test はテスト結果 summary を stderr へ書く。stdout のみの退避では fail 詳細・件数が失われる
- **自律対応内容**: stdout / stderr を分離併退避する正規形（QG-4 bun test 実行形態契約どおり）で再取得し、3 分割合計 3294 pass / 0 fail / 145 files の件数突合を完了
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（既存契約「証跡の stdout・stderr 分離併退避」の正当性を実機で再確認したのみ）
- **横展開観点**: QG-4 機械受理基準の件数突合・fail 由来分類は stderr 退避ファイルが前提。agentdev-quality-gates の bun test 正規形参照時に stdout 単独退避をしない
- **再発条件**: bun test の証跡を stdout リダイレクトのみで取得した場合
- **予防策候補**: bun test 実行手順のサンプルコマンドに 2> stderr.txt を常時含める
- **想定反映先**: agentdev-quality-gates/references/qg-4-final-acceptance.md「証跡の stdout・stderr 分離併退避」節（既定どおりであることの実証記録）
- **関連**: Case #3085、QG-4 観点10、bun test 3 cwd 分割実行
- **タグ**: `#bun-test` `#QG-4` `#証跡` `#stderr`

---

### Deferred 吸収元 1

## 2026-09-20: bun test の件数サマリーは stderr 出力（stdout capture だけでは証跡ファイルが空になる）

- **問題事象**: bun test の実行結果（`2558 pass` / `Ran 2558 tests across 105 files` 等のサマリー行）は stderr へ出力される。node の execFileSync（stdout のみ返却）で証跡ファイルへ保存すると本文が `bun test v1.3.6` のみになり、pass 件数の証跡が残らない（終了コード 0 で全 pass の事実のみ得られる）
- **工程位置**: case-open STEP-4 検証（Case #3011 Definition PR commit 7642962f 後の bun test 3 分割）
- **検知方法**: 保存した証跡ファイルの内容確認（サマリー行不在）
- **根本原因**: bun test がテスト進行・結果を stderr 経路で出力する仕様に対し、キャプチャ実装が stdout のみを前提としていた
- **対応内容**: spawnSync で stdout と stderr を連結して証跡保存する方式へ変更し、3 分割（2558/102/550）の件数証跡を取得
- **ユーザー確認の有無**: なし（証跡取得方式の修正のみ）
- **Decision/REQ/spec影響**: なし（REQ-060 の実行形態規定（repo root 起 cwd・`./` 付き）は不変。出力経路の話であり実行形態の話ではない）
- **展開観点**: bun test の件数を完了条件・PR 本文の検証記録に使う検証系は、stdout のみキャプチャする実装だと件数根拠を失う。checker CLI（stdout JSON）と test runner（stderr サマリー）で出力経路が異なる点の混同に注意
- **再発条件**: execFileSync 等の stdout のみ返却する API で bun test を実行し証跡保存する場合
- **予防策**: bun test の証跡保存は spawnSync + (stdout + stderr) 連結で実装する
- **配布反映先**: 検証運用（Case の case-open/case-run 検証記録）、learning-promote の評価対象
- **関連**: Case #3011、bun test、REQ-060
- **タグ**: #bun-test #stderr #証跡 #検証運用

- **移動日**: 2026-09-20
- **処分判定**: deferred（2026-09-20 評価。fail 証跡の標準経路は junit reporter。再評価条件: 証跡取得系知識文書の更新時・stdout キャプチャ証跡の再発時）

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: bug
- **関連Issue**: 原エントリおよび evaluation-report の記載に従う

## 評価スコア（evaluation-report 2026-09-24 抄録）

- **問題クラス**: 4
- **確定処分**: 既存対策の更新 (category 5)
- **加重合計**: 26/40

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | inbox 1件 + deferred 1件 |
| 影響度 | 2/5 | 正規形での再取得で解消 |
| 横展開性 | 3/5 | bun test 証跡取得全般 |
| 反映先明確度 | 5/5 | QG-4 の該当節を特定 |
| 自動化適性 | 3/5 | サンプルコマンド整備で機械的予防可能 |
| プロジェクト固有知識再利用性 | 3/5 |  |
| 再発可能性 | 4/5 | 契約があるにもかかわらず再発 |
| 費用対効果 | 4/5 | サンプル追記のみ |

### 判定基礎（evaluation-report verbatim）

### 問題クラス4: bun test のサマリーは stderr 出力（stdout 単独退避では件数突合不能）
- **根本原因**: bun test はテスト結果サマリー（Ran N tests 等）を stderr へ出力する仕様に対し、証跡退避実装が stdout のみを前提とした
- **再発条件**: stdout リダイレクト・stdout のみ返却する API で bun test の証跡を取得した場合
- **予防策**: stdout/stderr 分離併退避（正規形）、サンプルコマンドへの 2> 常時付与

#### 8軸評価スコア
| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | inbox 1件 + deferred 2026-09-20 同種1件 = 2回発生 |
| 影響度 | 2/5 | 正規形での再取得で解消 |
| 横展開性 | 3/5 | bun test 証跡取得全般 |
| 反映先明確度 | 5/5 | qg-4-final-acceptance.md「証跡の stdout・stderr 分離併退避」節 |
| 自動化適性 | 3/5 | サンプルコマンド整備で機械的予防可能 |
| プロジェクト固有知識再利用性 | 3/5 | |
| 再発可能性 | 4/5 | 既存契約があるにもかかわらず再発（application miss） |
| 費用対効果 | 4/5 | 参照のサンプル追記のみ |
| **加重合計** | **26/40** | |

- **推奨処分案**: 既存対策の更新（category 5）— 既存契約（分離併退避）は存在するが、stdout 単独退避の再発（Case #3085）により適用漏れが実証された。gap 分類: application miss（実装側が stdout 単独で退避）+ fix gap 候補（実行手順のサンプルコマンドに stderr 退避を常時含める旨の明示不足）。deferred 2026-09-20 エントリの再評価条件（stdout キャプチャ証跡の再発時）が成立
- **エントリ一覧**: bun test の summary は stderr へ出力される [inbox] / 2026-09-20 bun test の件数サマリーは stderr 出力 [deferred]

