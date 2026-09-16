# Design 昇格根拠の記録セクション（対応記録）に標準形式が存在しない

## 観測内容

REQ-032-025 の評価契約（Design status の棚卸し評価）は評価結果の記録先として「対応記録コメントおよび Design ファイル本体」を想定するが、docs/designs/ 配下の Design ファイルに昇格根拠を記録する標準セクション形式（見出し名・記載様式）が存在しない。RU-0015（Case #2848、PR #2849）の実行時、ACT-DESIGN-001〜003 が案内する「Design 本体の該当箇所（対応記録）」が実態として不在のため、case-open が暫定形式（`## 対応記録` セクションを新設し日付・評価契約・対応 Case/PR・REQ との整合確認結果を 1 行で記載）を作成した。

2026-09-16 時点の再実査: 暫定 `対応記録` 記述は 4 Design（docs/designs/commands/case-ready.md、case-revise.md、case-close.md、docs/designs/skills/agentdev-doc-diagnostics.md）に拡散しており、design-file-manager（SKILL.md・references）に対応記録セクションの規定は存在しない。無標準の慣行が継続採用される状態が進行している。

## 影響

- Design 昇格案件ごとに形式が揺れ、docs/designs/README.md status 列のみで追跡する既存運用との二重管理・記載漏れの温床となる

## 課題（対応候補と判断材料）

- Design テンプレート（docs/designs/commands/_template.md 等）または design-file-manager の保存契約において、Design status 昇格時の根拠記録セクションの形式（見出し名・必須記載項目: 昇格日・評価契約根拠・対応 Case/PR/REQ・見送り記録との排他）を標準化する
- 既存 Design への遡及適用の要否（RU-0015 暫定形式を当面の慣行とするか）は採用時に判断する

## 既存要件との関連

- REQ-032-025（Design status の棚卸し評価）: 記録先を要求する評価契約
- REQ-001（文書体系）: セクション形式標準化の上位要件
- design-file-manager Capability Skill: 保存契約の所有候補

## 根拠

- 観測元: case-open Batch 3 実行（Case #2848 RU-0015 の Definition Package 生成・Design 編集時）
- 観測時 commit: 3bfb4ca01268e69989351e098e181ba90ba76ddd（main）、definition/issue-2848 作業ブランチ（7b30c093）
- 2026-09-16 再検証: 標準形式なし・暫定形式が 4 Design に拡散・design-file-manager に規定なし
- 処分経緯: intake-promote（2026-09-16）で採用を確定（自律確定: 標準形式の不在が実査で確認済み。優先度低）
