# issue_close freshness 順序契約の STEP-5 手順明記

## 背景

case-close STEP-5 で完了記録コメント投稿・本文結果セクション更新後に issue_close を実行すると、終了判定記録（close-acceptance）の targetRevision と対象 Issue の updated_at の完全一致検査（過去の合格結果の再利用拒否）により fail-closed 拒否される事象が 3 Case（#3966・#3989・#4054）で反復した。Tool 側の freshness ゲートは設計どおり機能しており、工程側の実行順序が記録の鮮度を維持できていない

## 問題

cleanup-and-capture.md STEP-5 の手順（L40-44: 完了記録コメント投稿 → 本文結果セクション更新 → 対応記録コメント投稿 → 受入評価結果の確認 → Issue クローズ）に、本文更新後の revision 進行に対処する「fresh revision での機械工程冪等再実行（記録再生成）→ issue_close（間に書込みを挟まない）」の手順が不在。L43 の「受入評価結果の確認」は報告 JSON の結果確認であり、記録再生成の再実行手順ではない

## 望ましい変更

cleanup-and-capture.md STEP-5 に「Issue 書込み（コメント投稿・本文更新）をすべて完了した後に、fresh revision（再 issue_read）で機械工程を冪等再実行して終了判定記録を再生成し、直後に issue_close を実行する（間に Issue 書込みを挟まない）」の順序を明記する

## 対象範囲

### 対象

- case-close references cleanup-and-capture.md STEP-5（順序の明記）

### 対象外

- agentdev_gh issue_close の freshness 契約・targetRevision 検査の変更（設計どおりの動作）
- 終了判定記録の targetRevision 凍結等の代替様式（過去 accepted 記録再利用防止とのトレードオフ判断は req-define）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | src/common/skills/agentdev-workflow-case-close/references/cleanup-and-capture.md STEP-5 | 完了記録反映後の機械工程冪等再実行（fresh revision）と issue_close の順序明記 |

## 既存対策確認

- **確認結果**: 対策なし
- **該当ファイル**: src/common/skills/agentdev-workflow-case-close/references/cleanup-and-capture.md（STEP-5 L40-44・fresh revision 再実行の文言不在を実測確認）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: STEP-5 手順に本文更新後の revision 進行への対処（fresh revision での機械工程冪等再実行）が不在。3 Case で同一の fail-closed 拒否と冪等再実行の反復

## 制約

- issue_close の freshness 契約（REQ-118 系・close-acceptance の targetRevision 一致検査）は変更しない
- 冪等再実行は機械工程の resume-idempotent 性に依存する（報告 JSON と git 状態から適用済み工程を確認して残 gate のみ再実行）

## 受け入れ条件

- [ ] cleanup-and-capture.md STEP-5 に「Issue 書込み完了 → fresh revision で機械工程冪等再実行 → issue_close（間に書込みを挟まない）」の順序が明記されていること
- [ ] 後続 close 実行で issue_close の freshness 拒否が構造的に発生しないこと（1 Case 以上での確認）

## 元learning item / 根拠

- **要約**: STEP-5 の記録反映順序（コメント → 本文更新 → issue_close）が終了判定記録の targetRevision 陳腐化を必ず生む（3 Case 反復）
- **根拠**: cleanup-and-capture.md L40-44 のファイル読取実測で fresh revision 再実行の文言不在（L43 は報告 JSON の結果確認のみ）・agentdev_gh issue_close の fail-closed 拒否応答（targetRevision 不一致）を 3 Case で観測
- **再発条件**: 判定確定後に Issue 更新（コメント・本文）を挟む全 close
- **横展開可能性**: Issue 書込みを伴う全終了処理で「最後の Issue 書込み → 最新 revision 取得 → 記録生成 → 終了操作」の順序固定が適用可能

## 推奨Issue分類

- **分類**: chore
- **推奨ラベル**: documentation, chore
- **関連Issue**: なし
