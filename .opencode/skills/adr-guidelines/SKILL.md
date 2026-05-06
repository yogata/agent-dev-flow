---
name: adr-guidelines
description: Evaluates whether architectural decisions require an ADR. Use when proposing architecture changes, selecting tech stacks, or making hard-to-reverse technical decisions.
---

# ADR評価ガイドライン

## 評価基準（いずれかに該当すればADR作成推奨）

1. **アーキテクチャ上の重要性**: システム全体の構造・主要コンポーネント間の関係に影響
2. **長期的影響**: 将来の開発や運用に長期的に影響を与える
3. **逆転の困難さ**: 後で変更するコストが非常に高い・困難

## 保存先・命名規則

- 保存先: `docs/adr/NNN-{slug}.md`
- 命名: `NNN` は3桁ゼロ埋め連番（既存ADRの最大番号 + 1）
- ステータス: Accepted / Proposed / Deprecated / Superseded

## 出力形式

- ADR作成推奨: `[アーキテクチャ的な重要性や判断理由]`
- ADR不要: `[不要と判断した理由]`
