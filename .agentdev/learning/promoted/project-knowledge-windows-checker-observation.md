# Windows Git Bash 経由 checker 観測の規律（終了コード・出力分離・パス形式）

## 背景

Windows Git Bash 経由で checker・検証コマンドを実行・観測する際、パイプ経由の終了コード参照・stdout/stderr 結合・MSYS 形式パス渡しが観測を壊す事象が6件で観測された。checker 契約自体は正常で、観測方法の誤りである。

## 問題

(1) `cmd | tail; echo $?` の `$?` はパイプ最終コマンド（tail）の終了コードを返し、checker の exit 1 を exit 0 と誤読する。(2) `2>&1` による結合で stderr の git fatal（REQ 作成 commit の `sha^:path` 参照・履歴再作成ファイル起因）が JSON 先頭に混入しパース失敗する。(3) `$(pwd)` 展開の MSYS 形式パス（`/c/...`）を `--root` や bun の `--root` へ渡すと対象解決が空振りし、traceability check は全 missing-* 誤 fail、textlint gate は「0 inspected の PASS」という fail-open の穴になる。

## 望ましい変更

Windows 環境での checker 観測規律を知識文書として整備する: (a) 終了コードはパイプなし実行または PIPESTATUS で取得、(b) stdout/stderr は分離取得（stdout をファイル退避、stderr は別ファイル）、(c) `--root` 系引数は Windows 形式絶対パス（`C:/...` forward slash 記法）を直書き、(d) 検査対象 0 件の合格を検査不能と区別する。

## 対象範囲

### 対象

- docs/knowledge/（新規知識文書。Windows checker 観測規律）
- checker 実行契約（docs/designs/integrity/checker-execution-contracts.md）・各 workflow reference の checker 実測手順への注記候補

### 対象外

- checker・gate 本体の実装変更（終了コード契約・JSON 出力は現行どおり）
- MSYS/Git Bash 環境自体の設定変更

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| knowledge | docs/knowledge/windows-checker-observation-discipline.md（新規候補） | 終了コード・出力分離・パス形式・0件合格区別の観測規律 |
| Design | docs/designs/integrity/checker-execution-contracts.md | checker 実測手順の観測規律注記 |
| 配布skill reference | src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md 等 | checker 実測手順への注記（req-define が対象を選択） |

## 既存対策確認

- **確認結果**: 既存対策なし（観測規律の集約なし）
- **該当ファイル**: docs/designs/integrity/checker-execution-contracts.md（終了コード契約の記述はあるが観測方法の規律なし。2026-10-05 grep 実測: stderr 分離・MSYS パス規律の記述なし）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: checker 契約は正常でも観測経路の誤りで誤合格・誤 fail が生じ得る。前回 promote の U12（MSYS パス静かな空走査）を含む拡張系統として知識文書化が未実施

## 制約

- 知識文書は docs/knowledge/ 知識文書契約に従い、backlog-review の利用者承認後に直接保存される
- checker の終了コード契約（fail あり 2・実行エラー 1・合格 0）は現行維持

## 受け入れ条件

- [ ] パイプなし実行・PIPESTATUS・stderr 分離・Windows 形式パス指定の各規律が手順として記述されている
- [ ] 検査対象 0 件の合格を検査不能と区別する判断基準が記述されている

## 元learning item / 根拠

- **要約**: bash 経由 checker 観測の形式誤り（パイプ $? 2件・stderr 結合 2件・MSYS パス 2件）
- **根拠**: Case #3337（exit=1 を exit=0 と誤観測しかけ・パイプなし再実行で是正）、Case #3340（同型・証跡訂正）、Root Case #3407（`2>&1` で fatal が JSON に混入・分離取得で解消）、Case #3420（traceability check --root の MSYS 形式で全 missing-* 誤 fail・C:/ 形式で 9/9 pass）、Root Case #3410（Git Bash $(pwd) + bun --root で 0 inspected PASS の fail-open）、Case #3431（freshness checker の再作成履歴 fatal）
- **再発条件**: bash パイプ経由の `echo $?`、`2>&1` 結合、`$(pwd)` 展開の MSYS パスを --root へ渡す実行
- **横展開可能性**: 全 checker 観測・Windows Git Bash 環境で汎用

## 推奨Issue分類

- **分類**: docs
- **推奨ラベル**: documentation
- **関連Issue**: なし
