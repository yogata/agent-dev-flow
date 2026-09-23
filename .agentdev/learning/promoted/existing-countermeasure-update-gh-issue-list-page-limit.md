# existing-countermeasure-update: agentdev_gh issue_list の search 絞り込み必須手順と labels 論理値/物理ラベル区別の運用文書整備

## 背景

Case #3077 case-open（Definition PR #3078）の STEP-5 冪等再実行確認後の Root Case ラベル慣行確認で、Custom Tool `agentdev_gh` の issue_list を `role: case`、`state: closed`、`labels: ["case"]`、`search` なしで実行した。closed Case 群の累積 population が大規模なため安全ページ上限（10 ページ × 100 件）に到達して operation-failed となり、さらに labels に物理ラベル名 `"case"` を指定した組み合わせでは 0 件で絞り込みにならなかった。冪等検出は search（"RU-0131"、"REQ-034" 等の冪等キー語）+ state: open での絞り込みに切り替え、ラベル慣行確認は Tool の contingency（gh CLI 手動実行 `gh issue list --search --json labels`）で解消した（capture 記録: git commit c6ef2503）。

## 問題

`agentdev_gh` issue_list の安全な使用手順について、運用側の文書が不在である。

1. **絞り込み規律の不在**: custom-tool-contracts.md L53「issue_list と comment_list は Tool 内部で必要なページをすべて取得し、完全一覧として返す。上位層は GitHub API のページングを指定しない」契約に対し、closed 等の広範 filter での全件列挙が安全ページ上限に到達するため、search（topic_slug・冪等キー語・REQ 番号等）の併用を必須とする規律が文書化されていない。closed Case 群は累積で増え続けるため、search 無し実行は構造的に毎回上限到達する
2. **labels 引数の意味の運用文書不在**: labels 引数は tracking 論理値（role/kind/trackingState）の物理マッピング入力であり、Case Issue に付く物理ラベル（enhancement・bug 等）とは名前空間が異なる。agentdev-issue-tracking Design L41 の物理写像表（role = agentdev-tracking〔追跡Issueのみ付与。ラベルなしは role: case と機械判定〕、kind = agentdev-kind/{...}、状態 = agentdev-tracking-status/{...}）は既存だが、「issue_list の labels 引数に Case 物理ラベル名（"case"、"enhancement" 等）を渡しても Case は絞れない（0 件帰着または無効）」という操作面の注意が運用文書に明記されていない

## 望ましい変更

1. agentdev-issue-management の issue 操作安全手順に、issue_list の closed 検索には必ず search（冪等キー語・REQ 番号・topic_slug 等）を併用する規律を明記する。ページ上限到達（operation-failed）時は contingency（gh CLI 手動読取）で補完する手順もあわせて明記する
2. labels 引数が tracking 論理値（role/kind/trackingState）の物理マッピング入力専用であり、Case 物理ラベル（enhancement・bug 等）と混同しない旨を agentdev-issue-management または agentdev-issue-tracking Design に明記する

## 対象範囲

### 対象

- `src/opencode/skills/agentdev-issue-management/`（references の issue 操作安全手順への issue_list 規律追記）
- `docs/designs/skills/agentdev-issue-tracking.md`（labels 論理値と Case 物理ラベルの対応の運用面明記）

### 対象外

- Custom Tool `agentdev_gh` の実装・操作契約自体の変更（エントリで「Tool 操作契約の変更は対象外。運用側の絞り込み規律」と明記済み。契約面の変更要否は req-define が判断するにしても本学びの要求範囲外）
- gh CLI contingency 手順自体の新規整備（Tool 契約の contingency として既存）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | src/opencode/skills/agentdev-issue-management/references/issue-operation-safety.md | issue_list の search 併用必須規律（closed 等の広範 filter 時）、operation-failed 時の contingency 補完手順、labels 引数の tracking 論理値専用の注意を追記 |
| Design | docs/designs/skills/agentdev-issue-tracking.md | labels 引数（tracking 論理値の物理マッピング入力）と Case 物理ラベル（enhancement 等）の名前空間差の運用面明記（L41 物理写像表の補足） |

## 既存対策確認

- **確認結果**: あり（部分的。契約・物理写像表は既存、運用面の規律文書が不在）
- **該当ファイル**: docs/designs/responsibilities/custom-tool-contracts.md L53（完全一覧契約。運用規律は含まない）、docs/designs/skills/agentdev-issue-tracking.md L41（物理写像表。role = agentdev-tracking は追跡Issueのみ付与〔Case Issue には付かない〕は読み取れるが、issue_list 操作面の注意は不在）、src/opencode/skills/agentdev-issue-management/SKILL.md L29・references/issue-operation-safety.md（labels 記載は issue_create/update の引数規則のみ。issue_list 絞り込み規律は不在。本評価実行で grep 機械確認）
- **ギャップ分類**: fix gap（運用文書不在）
- **ギャップ詳細**: 既存契約・写像表からは理論上導出可能だが、操作面の注意（labels 引数の解釈、上限到達リスク）が運用文書に明記されておらず、Case #3077 で実際に誤用が発生した

## 制約

- 発生事例は contingency（gh issue list --search --json labels）で解消済み。本件は再発予防（運用文書整備）の反映である
- issue_list を closed 含む広範 population で実行するのは case-open 冪等検出・case-ready 横断依存検査・issue 操作ワークフロー等で、各 workflow 手順への反映要否は req-define が判断する
- Tool 操作契約（完全一覧・安全ページ上限の挙動）自体は fail-closed として正しく機能しており、変更しない

## 受け入れ条件

- [ ] issue_list の closed 等の広範 filter 実行には必ず search を併用する規律が運用文書に明記されている
- [ ] labels 引数が tracking 論理値（role/kind/trackingState）の物理マッピング入力専用であり、Case 物理ラベル（enhancement・bug 等）と混同しない旨が明記されている
- [ ] 安全ページ上限到達（operation-failed）時の contingency（gh CLI 手動読取）補完手順が参照可能になっている

## 元learning item / 根拠

- **要約**: agentdev_gh issue_list は closed 全件検索で安全ページ上限に到達するため search 絞り込みが必須（labels 指定は物理ラベル不一致で 0 件になる）
- **根拠**: Case #3077 case-open 実測（git commit c6ef2503 で capture 記録実在）。operation-failed detail（safety page limit 到達メッセージ）と labels 指定時の 0 件帰着を観察 → search + state: open の絞り込みと gh CLI contingency で解消。custom-tool-contracts.md L53・agentdev-issue-management・agentdev-issue-tracking Design L41 の既存内容と運用文書不在を本評価実行で機械確認
- **再発条件**: issue_list に search を付けず state: closed 等の広範 filter で実行した場合、または Case 物理ラベル名を labels に渡した場合
- **横展開可能性**: agentdev_gh issue_list を closed 含む広範 population で実行する全 workflow（case-open 冪等検出、case-ready 横断依存検査、issue 操作）

## 推奨Issue分類

- **分類**: docs
- **推奨ラベル**: enhancement
- **関連Issue**: Case #3077（Definition PR #3078）
