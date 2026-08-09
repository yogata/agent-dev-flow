# SKILL.md 英語見出し `## references/` と日本語見出しの混在

## 観測内容

【adversarial-review 検証済み】9個の SKILL.md が英語見出し `## references/` または `## references` を使用している。
一方で他の SKILL.md は `## 参考文献` などの日本語見出しを採用しており、見出し言語が混在状態にある。

検証済み該当ファイル（9件）:
- agentdev-backlog-integration
- agentdev-doc-diagnostics
- agentdev-intake-pipeline
- agentdev-issue-management
- agentdev-req-file-manager
- agentdev-req-structure-diagnostics
- agentdev-skill-authoring
- agentdev-spec-file-manager
- agentdev-workflow-routing

なお inbox 原文は document-model.md のセクション見出しを英語訳で参照する一部スキル（agentdev-req-analysis、agentdev-req-file-manager、agentdev-quality-gates 等）と、document-model.md の日本語見出し（例: `## 文書分類ポリシー` L303、`### SPEC 分離基準` L76）の不一致を観測事象として記録していた。
混在は L580「## 恒久基準と非規範情報の整理」追加前から存在する既存の不一致であり、Epic #1845 由来ではない。

## 影響

機能的影響はない。各スキルは SPEC レベルで参照しており、セクション見出しの直接 grep に依存しない。
ただし見出し言語の混在は `## references/` をディレクトリ識別子と読むか日本語見出し `## 参考文献` と統一するかの方針不定を生み、grep 等での直接検索を困難にする。
優先度は低。直ちに対応を要求しない参考記録。

## 課題

見出し言語の統一方針を確定する。
選択肢は下記のいずれか。
- `references/` をディレクトリ識別子として英字許容する方針を明示し、document-type-responsibilities 用語政策へ反映
- `## 参考文献` へ全面統一する

判断は inspect-promote で採用可否を含めて行う。

## 既存要件との関連

- 対象 SPEC: `docs/specs/foundations/document-model.md`（L76、L303、L580）
- AGENTS.md「基本言語は日本語」
- `docs/specs/responsibilities/document-type-responsibilities.md`（用語政策）
- Issue: #1847（CLOSED）
- Epic: #1845（CLOSED）
- PR: #1848（Findings / Capture候補 F-3）

## 出典

- inbox 元ファイル: `intake-2026-07-27-skills-vs-spec-heading-naming-inconsistency.md`
- 発生日: 2026-07-27
- PR: #1848（Issue #1847 / OU-001, Epic #1845 Wave 1）
