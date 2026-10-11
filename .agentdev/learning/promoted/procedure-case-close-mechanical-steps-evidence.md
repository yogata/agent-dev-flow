# case-close-mechanical-steps-evidence

## 背景

case-close STEP-2/3 の pre-merge 機械工程（close_mechanical_steps.ts）の報告 JSON を機械受理基準（件数突合の記録が必須受理由件）の証跡として使う運用で、証跡保持の構造的欠落が 2 Case 連続（Case #3532・#3536 の学びに続き、Case #3603 で実害再発）で観測された:

1. full-integrity-suite step の報告には各 bun test 分割の stdout（`bun test v1.3.6` の 2 行のみ）と終了コードしか残らず、件数サマリー（`Ran N tests across M files`）と fail 詳細が報告から消失した。bun test v1.3.6 はテスト結果・件数サマリーを stderr へ出力するため、integrityResults が `{ exitCode, stdout }` のみを保持する構造では stderr 側の証跡が捕捉されない
2. 件数突合系 gate の報告は gate stdout を上限なし（実効上限は runner maxBuffer 64MB）で報告 JSON へ保持しており、gate 出力が巨大化した場合の証跡退避・読み戻し耐性に懸念がある

Case #3603 では、stdout 証跡欠落を正当理由として 3 cwd 分割を stdout・stderr 分離退避付き（`>stdout.log 2>stderr.log`）で script 外再実行し、件数突合（3910 tests across 187 files、fail 0）を記録してから機械受理判定を実施した（merge 直前 HEAD での再実測でも同形式で退避）。Case #3536 では件数突合系 gate を個別実行+退避で証跡を確保した。

## 問題

case-close 機械工程の script 呼び出し契約（case-close Design 機械工程節）は、(1) bun test 等 stderr 出力ランナーをラップする gate の報告が stdout のみ保持する構造に対する証跡保持要件、(2) 報告 JSON への gate stdout 保持のサイズ上限または要約保持契約、が未規定である。このため機械受理基準（件数突合）の証跡が報告 JSON 単体では成立せず、実行ごとに script 外再実行+手動退避が要求される。

## 望ましい変更

- bun test を含む検証実行では、起動時に stdout・stderr 分離退避を常時付与し、件数突合は stderr 退避ファイルを根拠にする運用を機械工程手順に規定する
- close_mechanical_steps.ts の integrityResults に stderr 保持を追加する（または報告 JSON への件数サマリー抽出）拡張は後続是正候補として req-define の判断に委ねる
- 証跡サイズ上限または要約保持（先頭 N 行と件数サマリ）の契約化、上限超過時の退避ファイル参照誘導も後続是正候補とする

## 対象範囲

### 対象

- case-close 機械工程の script 呼び出し契約（証跡保持要件）
- `src/common/skills/agentdev-workflow-case-close/scripts/src/close_mechanical_steps.ts` の報告 JSON 契約（後続是正候補として）

### 対象外

- accept_definition_checks、prepare_definition_pr 等の他機械工程 script の同型課題（横展開観点として記録するが本件対象外）
- 機械受理基準自体（件数突合が必須受理由件であること）の変更
- bun test の出力先（stderr）の変更

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| Design | `docs/designs/commands/case-close.md`（機械工程節） | gate 証跡保持要件（stderr 分離退避・件数サマリー根拠）の補足 |
| 配布skill（実装） | `src/common/skills/agentdev-workflow-case-close/scripts/src/close_mechanical_steps.ts` | integrityResults の stderr 保持（後続是正候補・REQ/Design 変更判断を含む） |
| 配布skill reference | `src/common/skills/agentdev-workflow-templates` 検証差分記録規約 | stderr 退避ファイルを件数突合の根拠にする記録様式 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: `src/common/skills/agentdev-workflow-case-close/scripts/src/close_mechanical_steps.ts`（実測確認。grep: integrityResults は `{ exitCode, stdout }` 保持・stderr 保持は textlint の stderrTail（L538）のみ。bun test 分割 gate は stderr を捨てる）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 報告 JSON の gate 証跡保持に stderr を含まないため、stderr 出力ランナー（bun test）の件数サマリー・fail 詳細が報告から消失する。証跡サイズ上限・要約保持の契約も未定義。Case #3603 では機械受理基準の証跡を script 外再実行+分離退避で補った

## 制約

- script 本体修正（stderr 保持追加）は REQ/Design 変更判断を伴うため、本成果物では手順・契約側の規定を主とし、実装拡張は後続是正候補として位置づける
- maxBuffer 64MB の実効上限内で現行動作しており、緊急性はない。大規模 corpus への checker 拡張時に再発し得る
- stdout・stderr 分離退避は既存実績（`.agentdev/tmp/` 配下、cleanup-and-capture.md L89 の退避ファイル掃除と整合）

## 受け入れ条件

- [ ] case-close 機械工程の実行手順に、bun test 等の stderr 出力ランナーを含む検証の stdout・stderr 分離退避常時付与が規定されている
- [ ] 件数突合の根拠を stderr 退避ファイルに限定する記録規律が規定されている
- [ ] 後続是正候補（integrityResults の stderr 保持、報告 JSON のサイズ上限・要約保持契約）が req-define で判断可能な形で記録されている

## 元learning item / 根拠

- **要約**: close_mechanical_steps.ts の integrity suite step は stdout のみ保持するため bun test の件数サマリー（stderr）が報告から消失し、件数突合系 gate の証跡は script 外での分離退避で確保する。報告 JSON の gate stdout 保持は上限なし（実効上限 maxBuffer 64MB）で証跡サイズ契約が未定義（エントリ: 「close_mechanical_steps.ts の integrity suite step は stdout のみ保持するため bun test の件数サマリー（stderr）は script 外で分離退避する」「close_mechanical_steps の件数突合系 gate 報告が gate stdout を上限なしで報告 JSON へ保持する」の 2 エントリ統合）
- **根拠**: Case #3603（PR #3609、merge commit 1861cac9）で stdout 証跡欠落を検知（報告 JSON の full-integrity-suite stdout が 2 行のみ）し、3 cwd 分割を分離退避付きで script 外再実行して件数突合（3910 tests across 187 files、fail 0）を記録。前 Case 群（#3532・#3536）でも同構造の証跡欠落を個別実行+退避で補う運用を確立済み。機械受理基準の証跡成立が実行ごとに手動補完に依存する状態が継続している
- **再発条件**: bun test 等 stderr 出力ランナーを close_mechanical_steps.ts の integrityGates 等で実行し、報告 JSON だけを証跡として受理した場合。gate 出力が数 MB を超える変更（大規模 corpus への checker 拡張等）で機械工程を実行した場合
- **横展開可能性**: spawnSync 経由で bun test / checker を起動して報告 JSON を組み立てる工程全般（case-close 機械工程、case-run 前置検査、prepare_definition_pr、accept_definition_checks）

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: enhancement
- **関連Issue**: #3550（前回 learning 起点の Case）、#3603
