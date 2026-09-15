# バッチ委譲の引き継ぎ補助サマリと正典（draft artifact_actions）の突合要求が存在しない

## 内容

case-open バッチ実行（Batch 4: RU-0016〜0020）の委譲 context に含まれる「Draft operations summary」（対象ファイル・対象 REQ の要約）が、権威ある draft-data の artifact_actions と一致しない事例を観測した。RU-0016 のサマリは更新対象として「REQ-004」を挙げ「REQ-059」を欠いていた（実際の ACT-REQ-001〜009 は REQ-044 を含み REQ-059 を含む 8ファイルが対象。REQ-004 は対象外）。実行側は draft 全文読取（workflow 契約で義務化済み）で draft-data を正として処理したが、サマリの誤記は一度 Root Case 本文の対象 REQ セクションへ混入し、issue_update の埋め戻し時に修正する必要が生じた。

delegation-contracts.md の structured_context の SSoT 抽出制約（REQ-017-019）は「委譲 prompt に含める structured_context の作業内容・purpose は委譲先 Issue 本文の概要または正規 REQ から抽出する」ことを定めるが、バッチ委譲の引き継ぎ補助情報（対象一覧・優先バッチ状態等のサマリ）が正典（draft の artifact_actions 等）と突合されるべきという要求は明文化されていない。

## 提案

delegation-contracts.md「structured_context の SSoT 抽出制約」節（または case-open workflow の入力解決）へ、委譲 prompt に正典から導出可能な補助情報（対象ファイル列挙・対象要件一覧等）を含める場合は正典（draft-data、artifact_actions）と機械突合可能な形式で記述し、実行側は補助サマリと正典の不一致を検出した場合に正典を優先して処理することを明文化する。

## 根拠

- 観測元: case-open Batch 4 実行（Case #2850 RU-0016 の Root Case 本文生成時）
- 観測時 commit: 936eeaa2e31c0ab05c419724b71b59b77e0cac48（main）、definition/issue-2850 作業ブランチ（0b6f2c70）
- 根拠 1: 委譲 context の RU-0016 サマリは「UPDATE ×9 REQ files (REQ-004/006/010/031/044/048/057×2/060)」と記載し REQ-059 を含まず REQ-004 を含むが、draft（req-draft-ru-0016）の ACT-REQ-001〜009 は REQ-044/048/057×2/031/060/006/059/010 の 9 アクション（8ファイル）を対象とする
- 根拠 2: 誤記は Root Case #2850 の初回作成本文の対象 REQ セクションに混入し、PR #2851 作成後の issue_update（adf_case 埋め戻し）で REQ-044 へ修正した（GitHub 上に一時的に誤記載が存在した）
- 根拠 3: REQ-017-019 は structured_context の抽出元を制約するが、補助サマリの正典突合・不一致時の優先順（正典優先）を要求する規定は docs/designs/workflows/delegation-contracts.md に存在しない

## 分類

- 分類: intake（具体的修正対象あり: docs/designs/workflows/delegation-contracts.md「structured_context の SSoT 抽出制約」節）
- 変更種別: docs（委譲契約の補強。REQ-017-019 系）
- 優先度: 低（実行側の draft 全文読取義務により実害は限定的。次回バッチ委譲契約更新の際に対応すればよい）
