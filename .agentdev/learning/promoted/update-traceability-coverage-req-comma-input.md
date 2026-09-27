# agentdev-traceability coverage CLI の --req 複数行カンマ指定契約と README 文言の整合修正

## 背景

agentdev-traceability coverage.ts の --req に複数要件行をカンマ連結で渡すと、README 文言（「要件行IDの個別カンマ指定のみを受理」）が示す動作と異なり、静かに空結果（emptyResult: true・終了コード 0）が返る事象が Case #3171 と Case #3183 の2観測で同様に発生した。いずれも単体実行への切替で解消し検証結果への影響はなかったが、README を信頼した呼出側は空結果を「該当なし」と誤読するリスクが残る。

## 問題

- coverage.ts 実装が --req 値をカンマ split せず、入力文字列全体（カンマ連結複数行文字列）を単一 reqId として扱う。README 文言の「個別カンマ指定のみを受理」と実装が不一致
- emptyResult は「該当なしの証明」と「入力形式不一致」を区別せず、終了コード 0 で静かに返る
- coverage / impact / check の 3 CLI が共通 argv 解析（cli_utils.ts）を共有するため、coverage 以外も同じ挙動になり得る

## 望ましい変更

- 実装へのカンマ split 追加、または README 文言の実装実態（単一 reqId のみ受理）への修正。どちらかを coverage 3 CLI で統一する
- 複数行指定の初回は単体実行で結果を cross-check する運用手順の明文化

## 対象範囲

### 対象

- agentdev-traceability scripts（coverage.ts・impact・check が共有する cli_utils.ts の argv 解析）
- src/opencode/skills/agentdev-traceability/scripts/README.md（--req 入力契約の文言）
- agentdev-traceability SKILL.md 実行前提節
- case-open / case-ready の design 対応事前確認手順（単体実行を既定とする記述）

### 対象外

- coverage / impact / check の検出ロジック自体の変更（入力解析と文書整合が対象）
- --req 以外のオプション契約

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill scripts | src/opencode/skills/agentdev-traceability/scripts/lib/cli_utils.ts | --req のカンマ split 追加または形式エラー返却候補 |
| 配布skill scripts | src/opencode/skills/agentdev-traceability/scripts/README.md | --req 入力契約文言の実装実態への修正候補 |
| 配布skill | src/opencode/skills/agentdev-traceability/SKILL.md | 実行前提節の --req 複数行指定の扱い明記候補 |
| 配布skill reference | case-open / case-ready の design 対応事前確認手順 | 単体実行を既定とする記述候補 |

## 既存対策確認

- **確認結果**: あり（fix gap）
- **該当ファイル**: なし（deferred に一般規範「手順文書への CLI オプション記載は実装の argv 解析と突合する」〔#cli-contract〕が存在し、本件はその doc README 側への適用漏れ）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: README 文言と実装の不一致が未修正。結果 JSON へ受理した reqId パース結果の明示もない。該当 deferred エントリなし（一般規範の近縁あり）

## 制約

- 空結果は「該当なしの証明」と「入力形式不一致」を区別しないため、どちらか一方の修正（split 追加 or 文言修正）で止めず、coverage / impact / check の 3 CLI で統一することが前提
- 複数行指定の結果を検証に用いる場合、単体実行での cross-check が現行の実効手段である

## 受け入れ条件

- [ ] --req の複数行カンマ指定に対する動作（split 受理または形式エラー）が coverage / impact / check の 3 CLI で統一されること
- [ ] scripts README の文言と実装が一致すること
- [ ] 複数行指定初回の単体実行 cross-check 手順が運用記述に反映されること

## 元 learning item / 根拠

- **要約**: coverage CLI の --req 複数行カンマ指定が README 契約どおりに動作せず、静かな空結果を返す入力契約不一致
- **根拠**: 2観測。
  - inbox「agentdev-traceability coverage.ts の --req 複数行カンマ指定は実測で emptyResult を返し、単体（1行）実行の繰返しが実効手段になる」（Case #3171）: `--req REQ-090-014,REQ-090-015`（2行）と 3行指定のいずれも relations 空・emptyResult。単体指定では design 1件・implementation 2件を正しく返す
  - inbox「agentdev-traceability coverage.ts --req へ要件行IDカンマ連結を渡すと空結果が静かに返る — 単一行指定での再実行が必要」（Case #3183・PR #3184）: `--req REQ-090-001,REQ-090-002,REQ-090-011` が relations 空・counts 全 0・終了コード 0。単一行指定 3回で design role 対応の実在を確認
- **再発条件**: scripts README のカンマ指定文言を信頼して coverage / impact / check を複数行指定で呼出し、空結果を該当なしと誤読する場合
- **横展開可能性**: coverage / impact / check の 3 CLI に共通（cli_utils.ts 共有）。「手順文書への CLI オプション記載は実装の argv 解析と突合する」一般規範の適用事例として他 CLI 契約文書にも展開可能

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: bug, documentation
- **関連Issue**: なし
