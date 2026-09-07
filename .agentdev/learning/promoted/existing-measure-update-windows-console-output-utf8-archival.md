# Windows PowerShell 経由コンソール出力退避の UTF-8 破壊（知識文書項3の規定化と gh 出力退避面の追加）

## 背景

Windows 環境で外部コマンド（checker、gh CLI、git 等）の stdout を PowerShell のパイプ・リダイレクト・Out-File 経由で取得・退避すると、コンソールコードページ（cp932）再解釈により UTF-8 出力が破壊される。既存の知識文書 docs/knowledge/windows-powershell-bulk-io-corruption.md は本現象を項3（パイプ・リダイレクト経由の UTF-8 破壊）として記録済みだが、「反映先確認が未了のため本項は規定化に至らず living pool 再評価待ち」と明記していた。その後、新たな適用面での観測が加わり、項3の規定化（適用対象の確定）を再評価する条件が充足された。

## 問題

1. 知識文書項3は規定化されないまま「living pool 再評価待ち」の状態にあり、適用面の列挙（checker stdout 退避は適用対象に掲載済み、gh CLI 出力退避は未掲載）が確定していない。
2. gh CLI の出力退避（gh pr view --json 等）を PowerShell の Out-File で行うと UTF-8 本文が文字化けする（PR #2595 / Issue #2594 の case-close capture 回収で観測）。回避には node の execFileSync（encoding utf8）+ writeFileSync(utf8) による退避が有効だった。
3. 同系統の既観測: PowerShell リダイレクトによる検査結果 JSON の日本語 snippet 文字化け（PR #2440）、git show 出力のパイプ受信時の cp932 デコードで ASCII パターン取りこぼし（PR #2459、知識文書項4に記録済み）。checker stdout のパイプ経由 JSON パース破綻（PR #2582）は intake item 2026-09-04-checker-stdout-encoding-doc-candidate-2561 が checker-cli-stdout-loss-on-windows-bun.md 側の追記候補として追跡中である。

## 望ましい変更

知識文書 windows-powershell-bulk-io-corruption.md の項3を規定化する。具体的には:

- 項3の「living pool 再評価待ち」を解消し、パイプ・リダイレクト・Out-File 経由のコンソール出力退避が破壊対象であることを確定記述する
- 適用対象に「gh CLI 等の外部ツール出力の退避」面を追加する（checker stdout 退避は既掲載）
- 標準回避手段（node execFileSync/spawnSync の encoding utf8 明示 + writeFileSync utf8、[System.IO.File] の明示エンコーディング指定）をコンソール出力退避全般の標準手順として明記する

## 対象範囲

### 対象

- Windows 環境で外部コマンド stdout の取得・退避を行う検証・capture 手順（case-close capture 回収、checker 証跡退避、QG・docs-check 系の機械比較）
- docs/knowledge/windows-powershell-bulk-io-corruption.md（知識文書本体の更新）

### 対象外

- checker-cli-stdout-loss-on-windows-bun.md への近縁現象追記（intake item 2026-09-04-checker-stdout-encoding-doc-candidate-2561 が追跡。対象文書が異なるため本成果物では重複して提案しない）
- 既存 UTF-8 ファイルの一括読み書き破壊（知識文書項1・項2、AGENTS.md 規定済み）
- PowerShell 以外のシェル環境

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補である。

| 種別 | パス | 変更内容 |
|------|------|----------|
| knowledge | docs/knowledge/windows-powershell-bulk-io-corruption.md | 項3の規定化（適用対象への gh 出力退避面追加、コンソール出力退避全般の標準回避手段の確定） |
| knowledge | docs/knowledge/checker-cli-stdout-loss-on-windows-bun.md | （隣接候補）intake 2561 との統合可否は backlog-review で判断対象 |

## 既存対策確認

- **確認結果**: 既存対策あり（規定化未了）
- **該当ファイル**: docs/knowledge/windows-powershell-bulk-io-corruption.md 項3・項4、AGENTS.md 行動規範（PowerShell cmdlet 系標準手段の規定）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 知識文書は現象と標準回避手段を記録済みだが、項3が「規定化に至らず living pool 再評価待ち」の未確定状態。適用対象の列挙に gh CLI 出力退避面が含まれていない。再評価の触発証拠（第4観測）が本変更提案の時点で揃っている。

## 制約

- 知識文書は 1知識1ファイル・kebab-case slug・必須内容5項目（知識内容/適用条件/適用対象/根拠/関連知識）の契約に従う（docs/knowledge/README.md 規約）。
- 知識文書は独立文書種別であり ADF-COVERS 宣言を持たない。
- 本知見の技術固有部分は docs/knowledge/ が正規知識層として担い、配布成果物（ADF core）へは一般規則に昇華できる部分のみを反映する（Project Knowledge の所有契約に従う）。

## 受け入れ条件

- [ ] 知識文書項3から「living pool 再評価待ち」の保留記述が解消され、破壊対象となる経路（パイプ・リダイレクト・Out-File）が確定記述されていること
- [ ] 適用対象に gh CLI 等の外部ツール出力退避面が含まれること
- [ ] コンソール出力退避の標準手順（node 系 API の encoding utf8 明示）が知識内容に明記されていること

## 元learning item / 根拠

- **要約**: Windows の PowerShell 経由で外部コマンド stdout を退避すると cp932 再解釈により UTF-8 が破壊される。知識文書が記録済みだが項3は規定化待ちであり、gh 出力退避面での新観測により再評価条件が充足した。
- **根拠**: (1) PR #2595（Issue #2594）case-close STEP-6: PR 本文取得のための gh pr view --json body,mergeable を Out-File 退避したところ cp932 文字化け。node execFileSync（encoding utf8）+ writeFileSync(utf8) で回避。あわせて pr_read 応答の body 含有保証がないことによる読み取り系 gh fallback 自体は Tool 契約上の既存 contingency であり、deferred エントリ「agentdev_gh pr_read本文欠落時の読み取り系gh CLI fallback」（移動日 2026-09-03）のファミリー。(2) 知識文書項3の記録対象である PowerShell リダイレクト JSON 破壊（PR #2440）、項4の git show パイプ cp932（PR #2459）が同根拠。(3) checker stdout のパイプ JSON パース破綻（PR #2582）は近縁だが別文書（checker-cli-stdout-loss）の追記候補として intake 2561 が追跡。
- **再発条件**: Windows コンソールで外部コマンド（checker・gh・git 等）の UTF-8 出力を PowerShell のパイプ・リダイレクト・Out-File 経由で受け取り、テキスト処理やファイル退避に使う場合。
- **横展開可能性**: Windows 環境での検証・capture 手順全般（case-close capture 回収、checker 証跡退避、QG・docs-check 系の機械比較）に共通。

## 推奨Issue分類

- **分類**: docs_chore（知識文書の更新）
- **推奨ラベル**: documentation
- **関連Issue**: なし（PR #2595 は起因観測の実装 Case）
