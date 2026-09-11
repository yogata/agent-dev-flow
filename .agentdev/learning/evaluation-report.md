# 評価レポート

## メタデータ
- **実行日時**: 2026-09-11
- **対象エントリ数**: 20件（inbox: 20件、deferred: 関連既存エントリを照合）
- **問題クラス数**: 9（A、B1、B2、C、D、E、F、G、単独）
- **実行範囲**: STEP-1〜STEP-4（adversarial-review反映）完了、STEP-5境界の判定候補まで。STEP-6/7の移動・prune・promoted生成・git操作は未実施。

## STEP-1 正規化・既存対策照合

旧形式9件は解析時のみ正規化し、拡張形式11件は13項目として読み込んだ。原文は変更していない。deferred.mdの同種エントリ、正規Design、配布実装を照合した。promoted/は`.gitkeep`のみ。

## 問題クラスと8軸評価

スコア順は「発生件数/影響度/横展開性/反映先明確度/自動化適性/プロジェクト固有知識再利用性/再発可能性/費用対効果」。各1〜5、合計40点。

| クラス | 対象 | 根本原因・再発条件・予防策 | スコア | 暫定処分 |
|---|---|---|---:|---|
| A | #2,#6,#18,#20 | worktreeで依存・gitignore対象・pluginsが未伝播。install/fallbackを前置 | 30 | #2/#20 defer、#6/#18 duplicate |
| B1 | #1 | Bunのdot-directory探索/位置フィルタ仕様。QG-4正規形を使用 | 24 | duplicate |
| B2 | #12 | Windows spawn timeout不足。timeout延長で単独再実行し由来分類 | 22 | promote |
| C | #8,#9,#13,#16,#17,#19 | 配布境界・宣言パーサと本文のID/パス/形状が衝突。集約・一般化・変更直後検査 | 32 | promote |
| D | #3,#4 | offline bundleの生成時設定・ビルド時絶対パス。target/バナー除去・資産同梱・相対解決 | 26 | promote |
| E | #10,#11 | preset既定値と技術文書corpusが不整合。実測してoptionを校正 | 27 | promote |
| F | #14,#15 | prh rulePaths絶対パスがhashに混入。正規化して再現性確保 | 26 | duplicate |
| G | #7 | node_modules固定除外と歴史記録再包含の優先関係。Designの優先関係を明示 | 20 | promote候補・HITL |
| 単独 | #5 | kernel severityではなく構成側hardRuleIdsで拒否対象を分類 | 27 | duplicate |

### 軸別スコア根拠

| クラス | 発生 | 影響 | 横展開 | 明確度 | 自動化 | 固有知識 | 再発 | 費用対効果 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| A | 4 | 3 | 4 | 4 | 4 | 4 | 3 | 4 |
| B1 | 2 | 2 | 3 | 4 | 4 | 3 | 2 | 4 |
| B2 | 1 | 2 | 3 | 4 | 3 | 3 | 3 | 3 |
| C | 5 | 3 | 4 | 4 | 4 | 4 | 4 | 4 |
| D | 2 | 4 | 3 | 3 | 3 | 4 | 3 | 4 |
| E | 2 | 3 | 4 | 4 | 3 | 4 | 3 | 4 |
| F | 2 | 2 | 3 | 5 | 5 | 3 | 1 | 5 |
| G | 1 | 2 | 2 | 5 | 2 | 3 | 2 | 3 |
| 単独 | 1 | 2 | 4 | 5 | 4 | 4 | 2 | 5 |

各軸の理由: Aはinbox4件+deferred同種3件、テスト失敗は中程度、worktreeへ横展開可能、QG-4/fallback/REQ-018で反映先明確、手順化容易。B1は既存QG-4とdeferred同種記録で解決済み。B2は単発だがWindows再発性とtimeout再実行手順が明確。Cはinbox6件+deferred同系2件で反復し、機械検査・手順化の効果が高い。Dはconsumer起動不能の影響が大きく、知識文書化が低コスト。Eは大量誤検出を削減し、実装はあるが校正手順が不足。FはDesign反映済みで再発性が低い。Gは単発で実装済みだが、DesignのL24〜L26に優先関係の解釈余地がある。単独はrules.tsに実装済みである。

## STEP-3 処分・既存対策・昇華可能性

- **A**: QG-4に依存前置・3 cwd・fallback契約がある。deferredの同種3件も確認。#6/#18はduplicate。#2はIR-055 baseline pathずれ、#20はplugins fallbackの適用範囲が単発のためdefer。
- **B1**: QG-4の`./` prefix/cwd統一とdeferredの2026-09-04/09-05同種記録で十分カバーされるためduplicate。
- **B2**: QG-4のfail由来分類・fallbackの単独再実行手順は既存。ただしWindowsの5秒spawn timeoutと`--timeout 120000`の具体的知識は未整理のためpromote候補。
- **C**: distribution-boundary、IR-055/IR-059で検出はあるが、ADF-COVERS集約、概念語化、テンプレートの親SKILL集約、変更直後3検査の運用知識が反復したため統合promote。
- **D**: 既存のoffline bundle生成手順を確認できず、再利用可能なproject knowledgeとしてpromote。
- **E**: `rules.ts`の校正optionは実装済みだが、corpus実測校正の運用をDesignへ整理する余地があるためpromote。
- **F**: `docs/designs/quality/textlint-quality-runtime.md`にrulePaths正規化が反映済み。#15は解決報告であり、#14とともにduplicate。
- **G**: `targets.ts`はnode_modulesを加算でも再包含しない。Design L24〜L25は両クラスを記述する一方、L26の加算優先との関係に解釈余地がある。promote（Design精緻化）とdefer/duplicateの複数選択肢が残るためHITL。
- **単独 #5**: `rules.ts`のhardRuleIdsおよび構成側severity上書きで既存実装が十分カバーするためduplicate。

## エントリ別暫定判定

1 duplicate、2 defer、3 promote、4 promote、5 duplicate、6 duplicate、7 promote候補（HITL）、8 promote、9 promote、10 promote、11 promote、12 promote、13 promote、14 duplicate、15 duplicate、16 promote、17 promote、18 duplicate、19 promote、20 defer。

## STEP-4 adversarial-review

- **実施**: 発動。20件でskip条件（空、または1件かつ重複確実）に該当しないためdefault-onで実施。
- **独立stream A**: 軸別スコア不足、Bの分類混同、C内部の細分化余地、#20/#12の照合不足、#1根拠不足を指摘。
- **独立stream B**: #7のDesign事実認定、STEP-5要件要約、メタデータ実行範囲の不整合を指摘。発動条件・件数・部分自律確定は妥当と確認。
- **反映**: 軸別表を追加、B1/B2へ分割、#7をL24〜L26の優先関係の解釈余地として修正、実行範囲を更新。#20/#12の既存対策照合を補完。
- **棄却**: #1 duplicate根拠不足は、deferredの2026-09-04/09-05同種記録とQG-4契約を再確認したため棄却。
- **収束監査**: 新規の本質的争点なし。#7のみ正規Designの解釈選択が残り、HITLへ移送する。unresolvedは#7に限定され、不可逆処理へ進んでいない。

## STEP-5 境界判定

自律確定可能要件（既存契約・根拠特定、選択肢競合なし、価値判断不要、新規範囲決定なし、正規情報源の未解決矛盾なし、情報欠落なし、review後の未解決争点なし、安全境界迂回なし）を適用する。#7はDesign L24〜L26と実装の優先関係についてpromote/ defer/duplicateの妥当な選択肢が残るためHITLとする。

### 自律確定候補
- **promote（11件）**: #3,#4,#8,#9,#10,#11,#12,#13,#16,#17,#19。主要根拠は反復実績または自足的な技術事実、予防策、既存契約との関係が明確なこと。ユーザー固有の価値判断や新規対象範囲決定を要しない。
- **defer（2件）**: #2,#20。単発の環境依存知見をliving poolで保持する基準に該当し、削除・反映を行わない安全な処置である。
- **duplicate（6件）**: #1,#5,#6,#14,#15,#18。既存Design、実装、deferredの同等知見で十分カバーされ、別処置の妥当な選択肢が残らない。

### ユーザー判断必要項目
- **#7**: 実装はnode_modulesを加算でも除外する。Design L24〜L25はnode_modulesと歴史記録を区別して記述するが、L26の「加算優先」との適用関係に解釈余地がある。選択肢: (A) promoteしてDesignにnode_modules固定除外・歴史記録再包含を明記、(B) deferして次回再評価、(C) duplicate相当として既存対策で完了扱い。

## 件数（STEP-5境界）
- promote: 11件 / defer: 2件 / reject: 0件 / duplicate: 6件 / HITL: 1件（#7） / 合計20件

## prune・Decision候補
- pruneは未実施。inbox/deferred/promotedは変更していない（本ファイルのみ更新）。
- Decision候補はなし。主な昇華候補は運用手順、技術事実、Design精緻化であり、技術選定・不可逆アーキテクチャ判断ではない。
