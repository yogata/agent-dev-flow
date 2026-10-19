# qg4-bun-test-exit0-race-file-level-split

## 背景

case-close QG-4 正規形の機械ゲート実行時、bun test（bun 1.3.6）のフル実行で、最後に読み込まれたテストファイル内の fail 1 件が残っていてもプロセス終了コードが 0 になる観測（2918 tests 中 1 fail で exit 0）があった。終了コードで機械受理する QG-4 ゲートがこの race をすり抜けるため、fail 検出対象ファイルを独立 gate（file-level split: split-1a 汎用 + split-1b 対象ファイル単独）へ分離し、対象ファイルの fail が単独 gate の終了コードへ確実に反映される構成で 3 PR の QG-4 を実行した実績がある。

## 問題

qg-4-final-acceptance.md に file-level split・bun 終了コード race への規定が存在しない（adversarial-review A 系実測: 「file-level」0 件・「--timeout」0 件。L445 の 3 cwd 分割実行と L451 の「非ゼロ終了・timeout 打ち切り・切断した実行結果を pass 証拠として扱わない」規定のみ）。既存の終了コード規定は「fail でもゼロ終了を返す race」を防げず、file-level split 標準化の不在は、同一条件の実行構成を各 Case が場当たり的に選択する状態を残す。bun バージョン更新時の race 再検証規定も不在。

## 望ましい変更

qg-4-final-acceptance.md「3 cwd 分割実行」節の実行形態規律へ、次の2点の追記候補を提案する: (1) fail 検出対象ファイルを独立 gate（file-level split）へ分離する標準化（E6 の split-1a 汎用 + split-1b 対象ファイル単独の実績構成を雛形として参照可能）、(2) bun バージョン更新時の終了コード race 再検証の規定。既存の「終了コードの記録」規定（L451-452・版記録を含む）との整合を保ち、追記位置と文言の確定は req-define の変更影響分析に委ねる。

## 対象範囲

### 対象

- src/common/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md（3 cwd 分割実行節の実行形態規律への追記）

### 対象外

- 3 cwd 分割実行の正規形自体の変更（L445 の分割単位・cwd 規律は維持）
- bun バージョン更新手順・依存管理の変更
- windows-bun-test-spawn-timeout-classification.md の timeout 値規定（C7 deferred の管理対象。本件は終了コード race であり timeout 系と根因が別・adversarial-review B17 で分離確認）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill references | src/common/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md | file-level split の標準化規定＋bun 版更新時の race 再検証規定（3 cwd 分割実行節の実行形態規律） |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: qg-4-final-acceptance.md（L445 3 cwd 分割実行・L451 終了コード記録・L452 版記録）、docs/knowledge/bun-test-execution-form-drift-signals.md（cwd/パス逸脱の判別。ただし終了コード race は未被覆）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: file-level split・bun race への規定不在。既存の終了コード規定は非ゼロ終了のみを対象とし、「fail でもゼロ終了を返す」race は対象外

## 制約

- 3 cwd 分割実行の正規形（root workspace projects 単位）を置き換えるものではなく、fail 検出対象ファイルの独立 gate 追加の標準化であること
- file-level split は fail 検出対象が明確な場合（特定ファイルの fail 確認が完了条件に含まれる場合）に適用する形であり、全実行への一律適用を要求しない設計判断の余地を req-define が判断する
- bun の race は版依存であり、規定は版更新時の再検証を伴う形とすること

## 受け入れ条件

- [ ] qg-4-final-acceptance.md に file-level split（fail 検出対象ファイルの独立 gate 化）の標準規定が追記されていること
- [ ] bun バージョン更新時に終了コード race の再検証を行う規定が含まれること
- [ ] 既存の「終了コードの記録」「非ゼロ終了を pass 証拠としない」規定と矛盾しないこと

## 元learning item / 根拠

- **要約**: QG-4 実行構成への file-level split 標準化（bun test 終了コード race のすり抜け防止）
- **根拠**: fail 1 件が exit 0 でゲートをすり抜ける観測 1 回。file-level split 規定の不在を実測で確認。E6 の split-1a/1b 構成は 3 PR の QG-4 で実績あり
- **再発条件**: bun 1.3.6 で bun test の最終ファイルに fail が集中する場合（race 修正まで恒常再現・split 未標準化のため）
- **横展開可能性**: 終了コードで機械受理するゲート全般（ランナー既知の race を前提に fail 検出対象を独立 gate 化する観点）

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: enhancement
- **関連Issue**: なし
