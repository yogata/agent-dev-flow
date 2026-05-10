---
name: obsidian-vault-review
description: Supports periodic Obsidian Vault reviews (daily, weekly, monthly, quarterly, yearly) with Dataview queries. USE FOR: performing vault reviews, analyzing note statistics, or organizing periodic reflections. DO NOT USE FOR: creating individual notes, modifying note content, general vault configuration, or one-time setup tasks.
---

# Obsidian Vault定期レビュー

## Overview

このスキルはObsidian Vaultの定期レビュープロセスを支援します。日次・週次・月次・四半期・年次の各レビューにおいて、目的、範囲、手順を明確にし、Dataviewクエリを使用した効率的な分析と整理を可能にします。定期レビューの対象:
- 日次レビュー（Inboxの整理、今日の成果確認）
- 週次レビュー（週間の振り返り、来週の計画）
- 月次レビュー（月間の成果、プロジェクト進捗）
- 四半期レビュー（四半期目標の達成状況）
- 年次レビュー（年間の振り返り、次年の計画）

## Quick Reference

| レビュー種別 | 頻度 | 主な目的 | 参照ファイル |
|----------|------|----------|----------|
| 日次レビュー | 毎日 | Inbox整理、今日の成果 | `references/daily-review.md` |
| 週次レビュー | 毎週 | 週間振り返り、来週計画 | `references/weekly-review.md` |
| 月次レビュー | 毎月 | 月間成果、プロジェクト進捗 | `references/monthly-review.md` |
| 四半期レビュー | 3ヶ月毎 | 四半期目標達成状況 | `references/quarterly-review.md` |
| 年次レビュー | 1年毎 | 年間振り返り、次年計画 | `references/yearly-review.md` |

## Review Types

### Daily Review
Quick inbox triage and daily accomplishments. Move notes from `00_inbox` to appropriate folders, tag unprocessed items, and record key achievements. Target: 5-10 minutes.

### Weekly Review
Reflect on the past week's progress and plan the next. Review project status, process remaining inbox items, and update weekly objectives. Target: 20-30 minutes.

### Monthly Review
Assess monthly achievements and project milestones. Review goal progress, identify stalled projects, and re-prioritize tasks. Target: 30-60 minutes.

### Quarterly Review
Evaluate quarterly objective completion and adjust long-term goals. Analyze trends across months, identify systemic patterns, and set next quarter's OKRs. Target: 1-2 hours.

### Yearly Review
Comprehensive annual reflection and next-year planning. Review all quarters, archive completed projects, and define annual themes and objectives. Target: 2-4 hours.

## Implementation

各レビュー種別の具体的なDataviewクエリとチェックリストは、対応する参照ファイルに記載されています:

- 日次: [references/daily-review.md](references/daily-review.md)
- 週次: [references/weekly-review.md](references/weekly-review.md)
- 月次: [references/monthly-review.md](references/monthly-review.md)
- 四半期: [references/quarterly-review.md](references/quarterly-review.md)
- 年次: [references/yearly-review.md](references/yearly-review.md)

レビュー実施時は、上記の対応する参照ファイルを読み込み、手順に従ってください。
