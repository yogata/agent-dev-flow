# 機械置換の対象設計確認と参照・宣言の実在確認手順

## 背景

横断的な機械置換・是正で、対象設計の漏れが繰り返し問題を生んだ。PR 2275（一文一行機械是正、721行・155ファイル）では X-4 行分割が IR-055 の `{...}` 行 exempt 判定を移動させ baseline delta 警告を増やした。PR 2280 では置換ルール old 側の転写ミスが MISS 印字で検出可能なまま中断時に見逃され、resume 時の取り残し修正が必要になった。PR 2350 では変数名リネームに付随する正規表現リテラル内の旧パス文字列が機械置換対象から漏れ、check_test_impact.ts が docs/designs/ 変更を検出不能にする実装バグとなった。また SPEC バッチ保存（PR 2273）では参照先用語の実在確認なしに dangling な用語（「V4形式」）が SPEC 化され、件数ハードコード（PR 2276）は運用追加で即座に陳腐化した。data yaml の「Consumed by」宣言（PR 2377）は実装と乖離していた。

## 問題

- 機械置換の old 側文字列を grep 実在確認なしに組み立て、MISS 印字を中断時に確認する手順がない
- 識別子リネーム・行再構成を伴う機械置換で、正規表現リテラル内パス・行単位規則（IR-055 exempt）との相互作用が対象設計から漏れる
- SPEC・Design 保存時に参照先用語が参照先成果物に実在するかの確認手順がない
- 件数・実績値等の変動値を規定本文へ固定記載する記述設計の查読観点がない
- 宣言的データ yaml の新設時に消費者実装を同時確定せず、意図だけを宣言したヘッダーが陳腐化する

## 望ましい変更

- 機械置換手順へ「old 側の grep 実在確認」「MISS 印字の逐次確認（中断・resume 前段含む）」「リテラル内パス・パターン文字列の別系統 grep 確認」を組み込む
- 機械是正横断 PR の検証手順へ「IR-055 delta 増加時の行移動由来確認（新規違反 vs 行移動の切り分け）」を組み込む
- 保存手順（design-save/req-save 相当）へ「整合先・参照先用語の実在 grep 確認」を組み込む（authoring の固定トークン事前 grep 手順と同型）
- 文書品質查読観点へ「変動値（件数・実績値）の本文固定記載チェック」を追加する（変動値は AUTOGEN 計測表へ集約）
- data yaml 新設手順へ「実際に読む消費者の実装同時確定」「ヘッダーへの同期条件併記」を組み込む

## 対象範囲

### 対象

- case-run の機械置換実行・委譲時手順
- agentdev-doc-writing の機械置換規則・文書品質查読観点
- design-save / req-save の保存手順（旧 spec-save 由来知見の現行反映先）
- 宣言的データ yaml（data/*.yaml）の新設手順

### 対象外

- X-4（一文一行）規則・IR-055 ルール本体の変更
- generate_indexes.ts の AUTOGEN 計測仕様

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | src/opencode/skills/agentdev-doc-writing/SKILL.md + references（機械置換規則） | old 側 grep 実在確認・MISS 逐次確認・リテラル内パス別 grep を機械置換規則へ追加 |
| skill | src/opencode/skills/agentdev-doc-writing/SKILL.md + references（查読観点） | 変動値の本文固定記載チェックを查読観点へ追加 |
| skill | src/opencode/skills/agentdev-design-file-manager、agentdev-req-file-manager（保存手順） | 参照先用語の実在 grep 確認を保存前手順へ追加 |
| spec | docs/designs/integrity/checker-execution-contracts.md（宣言的データ運用） | data yaml 新設時の消費者実装同時確定と同期条件併記を明記 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: authoring の固定トークン事前 grep 手順（PR 2263、Issue 2226）、integrity-contracts「baseline entry 運用契約」（単一エントリ編集）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 固定トークンの事前 grep 手順は存在するが、機械置換全般（old 側・MISS・リテラル内パス）と参照先用語の実在確認へ一般化されていない。変動値の本文固定記載チェックは查読観点に存在しない。Consumed by 宣言の同期条件は PR 2377 で2件訂正済みだが新設手順への明示がない

## 制約

- baseline 反映は integrity-contracts の baseline entry 運用契約に従う（行移動由来の delta は単一エントリ編集、全件再生成しない）
- トークン境界保護（lookaround 付き）の設計は有効実績として維持する

## 受け入れ条件

- [ ] 機械置換手順に old 側 grep 実在確認・MISS 逐次確認・リテラル内パス別 grep が明記されている
- [ ] IR-055 delta 増加時の行移動由来確認手順が明記されている
- [ ] 保存手順に参照先用語の実在 grep 確認が明記されている
- [ ] 変動値の本文固定記載チェックが查読観点に明記されている
- [ ] data yaml 新設時の消費者実装同時確定・同期条件併記が明記されている

## 元learning item / 根拠

- **要約**: 機械置換の対象設計漏れ防止と参照・宣言の実在確認（評価スコア: E=28/40、G=28/40）
- **根拠**: PR 2275（X-4 分割が IR-055 exempt を移動、delta 警告増）、PR 2280（old 側転写ミス・MISS 印字見逃し）、PR 2350（リテラル内パス漏れで check_test_impact 検出不能）、PR 2273（dangling 参照先用語「V4形式」）、PR 2276（件数ハードコード陳腐化）、PR 2377（Consumed by 宣言乖離2件）
- **再発条件**: 実在確認なしの置換・保存、変動値の本文固定、消費者未確定の yaml 新設
- **横展開可能性**: 機械置換・文書体系運用全般（実在 grep・変動値分離は汎用）

## 推奨Issue分類

- **分類**: feature（手順・查読観点の正式化）
- **推奨ラベル**: enhancement, documentation
- **関連Issue**: Issue 2235（PR 2275）、Issue 2237（PR 2280）、Issue 2349（PR 2350）、Issue 2228（PR 2273）、Issue 2230（PR 2276）、Issue 2373（PR 2377）
