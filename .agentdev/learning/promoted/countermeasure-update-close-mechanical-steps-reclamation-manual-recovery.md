# close_mechanical_steps CLI runner deleteFile 欠落の手動回収手順標準化

## 背景

case-close の post-merge 機械工程で reclamation.closeAcceptanceRecord を指定した CLI 実行が、4 Case（#3966・#3969・#4002・#4054）で反復して「mechanical runner does not provide deleteFile; reclamation cannot execute (fail-closed)」で fail 報告となる。終了判定記録の回収が CLI 経路で完遂できず、毎回手動回収経路（exported 関数への fs ベース deleteFile 注入または手動削除）で対応している

## 問題

close_mechanical_steps.ts CLI main() の runner 構築（L1847-1890）は exists・run・readTextFile・writeTextFile・mkdirRecursive・removeFile・gitCommonDir・sleep の 8 メソッドのみを提供し、reclamation 実行面が要求する deleteFile（L103 の optional インターフェイス・L544 の CloseAcceptanceRecordReclamationIo 必須メソッド）を提供していない。L1327-1330 の fail-closed 検査で常時 fail 報告となる。scripts/README.md には reclamation の入力契約（prNumber 0 の説明・L7）はあるが、fail-closed 報告時の手動回収経路の標準手順が記載されていない

## 望ましい変更

scripts/README.md に「CLI runner は deleteFile を提供しないため reclamation 指定時は fail-closed 報告が正・手動回収経路（実在確認 → 証跡退避 → 明示パス削除 → 不存在確認）が現行正常系であること」の標準手順を明記する。あわせて main() runner への deleteFile 注入追加（removeFile と同一の fs 実装で足りる）を機構整理候補として保持する

## 対象範囲

### 対象

- case-close scripts README.md（手動回収手順の標準明記）
- close_mechanical_steps.ts main() runner への deleteFile 注入（機構整理候補として req-define 判断対象）

### 対象外

- reclaimCloseAcceptanceRecord 関数契約の変更（I/O 注入契約は不変）
- 終了判定記録の様式・受理契約の変更

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | src/common/skills/agentdev-workflow-case-close/scripts/README.md | 手動回収経路の標準手順（fail-closed 報告時の正常系として明記） |
| 配布skill scripts | src/common/skills/agentdev-workflow-case-close/scripts/src/close_mechanical_steps.ts（main() runner・L1847-1890） | deleteFile 注入の追加（removeFile と同一の fs 実装。機構整理候補） |

## 既存対策確認

- **確認結果**: 対策なし
- **該当ファイル**: src/common/skills/agentdev-workflow-case-close/scripts/README.md（reclamation 手順の記載不在を grep 実測で確認・prNumber 0 の説明 L7 のみ）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: CLI runner の deleteFile 未提供による恒常 fail-closed 報告と、その回復（手動回収）手順の標準明記が README に不在。4 Case で同一の fail-closed 報告と手動回収の反復

## 制約

- fail-closed 報告は契約どおりの正当動作であり、Tool・script の動作変更ではなく手順・実装の整備として扱う
- 回収対象は機械工程自身が書出した自己終了判定記録（.agentdev/close-acceptance/issue-{N}.json）に限定

## 受け入れ条件

- [ ] scripts/README.md に CLI 実行時の reclamation fail-closed 報告と手動回収経路の標準手順（実在確認 → 証跡退避 → 明示パス削除 → 不存在確認）が明記されていること
- [ ] （機構整理候補採用時）main() runner に deleteFile が注入され reclamation 指定の post-merge CLI 実行が fail-closed 報告なしで完遂すること

## 元learning item / 根拠

- **要約**: close_mechanical_steps CLI runner の deleteFile 未提供で post-merge reclamation が恒常 fail-closed 報告になる（4 Case 反復）
- **根拠**: close_mechanical_steps.ts L1847-1890（runner 構築）のコード読取実測で deleteFile 不在・L544（必須 I/O）・L1327-1330（fail-closed エラー）実在を確認。scripts/README.md に回収手順の記載不在（grep 実測・2026-11-15）
- **再発条件**: reclamation 指定の post-merge 機械工程 CLI 実行（全 case-close）
- **横展開可能性**: post-merge reclamation を CLI で実行する全 case-close で同型の fail が発生する。runner の I/O 注入設計に依存する機械工程全般に適用可能な知見

## 推奨Issue分類

- **分類**: chore
- **推奨ラベル**: documentation, chore
- **関連Issue**: なし
