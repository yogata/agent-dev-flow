# バッチ委譲の引き継ぎ補助サマリと正典（draft artifact_actions）の突合要求の明文化

## 観測内容

case-open バッチ実行（Batch 4: RU-0016〜0020）の委譲 context に含まれる「Draft operations summary」（対象ファイル・対象 REQ の要約）が、権威ある draft-data の artifact_actions と一致しない事例を観測した。RU-0016 のサマリは更新対象として「REQ-004」を挙げ「REQ-059」を欠いていた（実際の ACT-REQ-001〜009 は REQ-059 を含む 8 ファイルが対象。REQ-004 は対象外）。実行側は draft 全文読取（workflow 契約で義務化済み）で正しく処理したが、サマリの誤記は一度 Root Case 本文の対象 REQ セクションへ混入し、issue_update の埋め戻し時に修正する必要が生じた。

delegation-contracts.md の structured_context の SSoT 抽出制約（REQ-017-019）は委譲 prompt への抽出元を制約するが、正典から導出可能な補助情報（対象一覧等のサマリ）と正典（draft の artifact_actions 等）の機械突合・不一致時の正典優先を要求する規定は存在しない（2026-09-16 時点で再確認。同 Design は Issue 番号・成果物パスの突合のみを保有）。

## 影響

- 委譲 context の補助サマリ誤記が Root Case 本文等へ混入し得る（実行側の draft 全文読取義務により実害は限定的だが、GitHub 上への一時的誤記載が発生した実績あり）

## 課題（対応候補と判断材料）

- delegation-contracts.md「structured_context の SSoT 抽出制約」節（または case-open workflow の入力解決）へ、正典から導出可能な補助情報を含める場合は正典と機械突合可能な形式で記述し、実行側は不一致検出時に正典を優先することを明文化する

## 既存要件との関連

- REQ-017-019（structured_context の SSoT 抽出制約）: 明文化対象の既存契約
- delegation-contracts Design: 修正対象の正典

## 根拠

- 観測元: case-open Batch 4 実行（Case #2850 RU-0016 の Root Case 本文生成時）
- 観測時 commit: 936eeaa2e31c0ab05c419724b71b59b77e0cac48（main）、definition/issue-2850 作業ブランチ（0b6f2c70）
- 処分経緯: intake-promote（2026-09-16）で採用を確定（自律確定: 契約ギャップが現行 Design 実査で確認済み。優先度低）
