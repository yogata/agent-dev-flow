# docs/README.md Decision 索引の DEC-045 supersede_note 破損（〔|〕）

- **分類**: inspect finding promote（DC-01・severity medium・confidence high・Jev 分類 promote 意見一致）
- **由来**: inspect-docs finding 20261004T162140Z（backlog-auto stage 1）。inspect-promote 2026-10-05 自律確定

## 観測（evidence・実測確認済み）

- `docs/README.md:147` の DEC-045 行が「リモートブランチ削除の GitHub 自動削除への委譲と deleteBranchOnMerge 設定前提の必須化（superseded by DEC-050〔|〕）」とレンダリングされる。supersede_note が空の括弧+縦棒として破損（実読確認済み）
- 直近 DEC-043 行（`docs/README.md:145`）は note 全文を正常表示しており、DEC-045 のみ生成が失敗
- DEC-045 frontmatter は superseded_by: DEC-050 と部分置換 note（status: accepted 維持）を保持し SSoT は正しい
- `decisions/README.md` の DEC-045 行は注記なしで、両索引が不整合

## 影響課題

DEC-050 昇格（7844db56）由来の回帰。docs 入口の Decision 索引で DEC-045 の置換関係が読み取れない。

## 対応候補

docs-check route: Decision 索引 AUTOGEN 生成器の空 note レンダリング修正（`〔|〕` 出力防止）+ DEC-045 行の再生成。前回促進済み GR-01（supersede_note 索引鮮度）の修正は DEC-040/043 で実効確認済みであり、本件は新規発生分として独立対応。

## 既存要件関連

DEC-045 frontmatter（SSoT）を正とする索引整合。AUTOGEN 生成契約（index-auto-generation Design）。

## 統合注記（backlog-review での統合判定候補）

なし（単独対応）。
