# gh CLI 退避 body の LF 正規化を機械抽出の前置とする

## 背景

case-close STEP-2 の機械抽出（`close_mechanical_steps.ts` の `extractCompletionCheckboxes`）が、gh CLI（`gh issue view --json body --jq .body`）で退避した Issue body ファイルから checkbox を 1 件も抽出しなかった（total 0）。退避ファイルには checkbox 行が 8 件実在した（Case 3497・PR 3499、Windows 環境）。抽出結果 0 件でも step が fail にならないため、実データとの突合が検知の要だった。

## 問題

gh の `--jq` 出力は GitHub 保存本文の `\r\n`（CRLF）をそのまま含む。抽出関数の行マッチ regex は行末 `\r` を消費できず checkbox 行が 1 件も一致しない。LF と CRLF の差は step の pass/fail に現れず total 0 としてのみ現れる。機械工程手順に入力形式の前提（LF 正規化前置）が明示されていない。

## 望ましい変更

case-close 機械工程手順へ「gh CLI で退避した body は行指向抽出の前に LF 正規化（`\r\n` → `\n`）する」ことを前置とて明記する。`close_mechanical_steps.ts` の抽出入力契約に注記する（抽出 total 0 かつ正規化後に checkbox パターンが存在する場合の warn 報告を候補とする）。

## 対象範囲

### 対象

- `src/common/skills/agentdev-workflow-case-close/references/`（機械工程手順を含む reference）
- `scripts/src/close_mechanical_steps.ts`（抽出入力契約注記）

### 対象外

- extractCompletionCheckboxes の regex 実装変更（入力形式の前置が対象。関数変更は必要最小限の注記・warn のみ候補）
- gh CLI 側の出力仕様

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | src/common/skills/agentdev-workflow-case-close/references/ 機械工程手順該当 reference | 退避 body の LF 正規化前置の明記 |
| repo script | scripts/src/close_mechanical_steps.ts | 抽出入力契約への LF 前提注記（warn 報告は候補） |

## 既存対策確認

- **確認結果**: 既存対策あり（部分）
- **該当ファイル**: close_mechanical_steps.ts の抽出関数（LF 入力では正しく動作）、機械工程手順
- **ギャップ分類**: fix gap
- **ギャップ詳細**: gh 出力の CRLF 保持という入力前提と LF 正規化の前置が手順・入力契約に明示されていない。total 0 が fail にならないため静粛障害になり得る

## 制約

- script 本体の動作変更（正規化の内蔵等）は本成果物の確定対象外（入力契約注記と手順前置が主体。実装方式は req-define・実装側の判断）
- Windows 環境以外でも gh 出力の CRLF 保持は発生し得るため環境限定の規定にしない

## 受け入れ条件

- [ ] 機械工程手順に退避 body の LF 正規化前置が明記される
- [ ] 抽出入力契約に LF 前提の注記が入る

## 元learning item / 根拠

- **要約**: 完了条件 checkbox の機械抽出は CRLF 退避 body で 0 件になる。LF 正規化の前置で回避できる（1件）
- **根拠**: Case 3497（完了記録コメント 6013794731、対応記録コメント 6013834126）、PR 3499（total 0 に対し grep で 8 件実在、正規化後に 8/8 抽出）
- **再発条件**: Windows 環境で gh CLI の body 出力をそのままファイル退避し、行指向抽出へ入力する場合
- **横展開可能性**: gh CLI 取得本文を入力にする決定的処理全般（行指向 regex・パーサへの入力）

## 推奨Issue分類

- **分類**: docs
- **推奨ラベル**: documentation
- **関連Issue**: なし
