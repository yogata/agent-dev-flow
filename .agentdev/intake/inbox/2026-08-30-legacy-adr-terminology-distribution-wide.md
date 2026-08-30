# 旧 ADR 体系用語（ADR、adr-file-manager、REQ-ADR-SPEC 等）が配布物に横断残留

## 観測

配布 command・skill 70 ファイルの文章品質是正（REQ-053-013 履行、PR #2484）で、「ADR」「adr-file-manager」「adr-guidelines」「REQ-ADR-SPEC」「specs 更新」等の DEC-009 の ADR→Decision 移行前の旧体系用語が配布物に横断残留していることが確認された。

- 検出箇所: agentdev-doc-writing、agentdev-architecture-advisory、case-open command、case-run command 等（frontmatter description を含む）

横断用語統一は frontmatter description も巻き込むため、本件（description の統一は REQ-053 対象外）では実施していない。

## 影響

- 旧体系用語が後続利用者に Decision 体系と混同されるリスクが継続
- 用語統一を後回しにするほど検出箇所が増える

## レビューで決めること

- 旧 ADR 用語の Decision 体系用語への横断統一を別 Case として実施するか
- frontmatter description の統一を含むか（REQ-053 の対象範囲見直しを伴うか）を確認する

## 根拠

- PR #2484 本文「Findings / Capture候補」intake（回収元: https://github.com/yogata/agent-dev-flow/pull/2484 ）
