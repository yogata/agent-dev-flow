# Design 昇格根拠の記録場所（Design 本体「対応記録」）に標準セクション形式が存在しない

## 内容

REQ-032-025 の評価契約（Design status の棚卸し評価）は評価結果の記録先として「対応記録コメントおよび Design ファイル本体」を想定するが、docs/designs/ 配下の Design ファイルに昇格根拠を記録する標準セクション形式（見出し名・記載様式）が存在しない。RU-0015（Case #2848、PR #2849）の実行時、ACT-DESIGN-001〜003 が記載先として案内する「Design 本体の該当箇所（対応記録）」が実態として不在のため、case-open が暫定形式（`## 対応記録` セクションを新設し日付・評価契約・対応 Case/PR・REQ との整合確認結果を 1 行で記載）を作成した。

## 提案

Design テンプレート（docs/designs/commands/_template.md 等）または design-file-manager の保存契約において、Design status 昇格時の根拠記録セクションの形式（見出し名・必須記載項目: 昇格日・評価契約根拠・対応 Case/PR/REQ・見送り記録との排他）を標準化する。既存 Design への遡及適用は不要（RU-0015 で作成した 3 件の暫定形式を当面の慣行とする）か、採用時に判断する。

## 根拠

- 観測元: case-open Batch 3 実行（Case #2848 RU-0015 の Definition Package 生成・Design 編集時）
- 観測時 commit: 3bfb4ca01268e69989351e098e181ba90ba76ddd（main）、definition/issue-2848 作業ブランチ（7b30c093）
- 根拠 1: docs/designs/ 配下で `## 対応記録` 見出しを使用する Design は 0 件（RU-0015 実行前時点）
- 根拠 2: RU-0015 draft の ACT-DESIGN-001〜003 は記載先を「Design 本体の該当箇所（対応記録）」と案内するが、対応する標準形式・既存実装が存在しない
- 根拠 3: 他の昇格済み Design は昇格根拠を Design 本体に構造化記録していない（docs/designs/README.md status 列のみで追跡）

## 分類

- 分類: intake（具体的修正対象あり: Design テンプレート・design-file-manager 保存契約）
- 変更種別: docs（Design 記録形式の標準化。REQ-001（文書体系）・REQ-032-025 系）
- 優先度: 低（暫定形式で機能は担保されており、次回の Design 昇格案件の前に整理すればよい）
