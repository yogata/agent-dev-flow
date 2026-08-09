# Phase 0 commit スコープ設計運用の明文化

## 背景

Phase 0 commit は case-auto 等で要件定義ドラフト確定と SPEC/REQ ファイル実体変更を一括適用する手段として運用されている。Phase 0 commit を発行する複数ケースで、孫 Issue 間の SPEC スコープ交差（#1）と、ドメイン state 更新と成果物変更の同一コミット混在（#2）が顕在化した。両者とも Phase 0 commit のスコープ設計が不明示なことに起因する横断的な手戻り・追跡 PR の空コミット化を生んだ。

## 問題

- Phase 0 commit で複数 SPEC を一括適用した上で Wave 分割された子 Issue が同一 SPEC ファイルの異なるセクションを検証対象とする場合、孫 Issue 間の SPEC スコープ交差が発生し、テスト戦略 on_failure で SPEC 整合性修正を完結できない（#1）
- Phase 0 commit で REQ/SPEC の実体変更と管理メタデータ（`.agentdev/drafts/`）を同一コミットへ含めると、各 Issue の追跡 PR が空コミットにならざるを得ず、レビュー可能性が下がる（#2）

## 望ましい変更

Phase 0 commit のスコープ設計運用ルールを文書化し、以下を明示する。

1. テスト戦略 on_failure へ「要件定義で SPEC の記載を修正して再検証」を明示的に許容する運用ルール（#1 由来）
2. Phase 0 commit の 2 分割運用（第1コミット: `.agentdev/drafts/` の status 更新のみ、第2コミット: docs/ 配下の成果物変更）（#2 由来）

## 対象範囲

### 対象

- Phase 0 commit のスコープ設計・運用手順を規定する SPEC/guide
- case-run テスト戦略 on_failure 記述の運用解釈
- Issue/PR 説明テンプレートの test strategy on_failure 記述

### 対象外

- Phase 0 commit という仕組み自体の廃止・変更（仕組みは維持し運用を明文化する）
- REQ/SPEC 本文の直接的な内容変更（本件は運用知見であり、個別 REQ/SPEC の改廃を直接伴わない）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| spec | `docs/specs/commands/case-auto.md`（Phase 0 commit 運用節） | Phase 0 commit のスコープ設計運用ルール（2 分割、on_failure SPEC 修正許容）を明文化 |
| spec | `docs/specs/commands/case-run.md`（test strategy on_failure 節） | on_failure へ「要件定義で SPEC の記載を修正して再検証」を明示的に許容する旨を記載 |
| spec | `docs/specs/skills/agentdev-workflow-templates.md` | テスト戦略 on_failure の運用解釈をテンプレート参照先へ明示 |
| template | `src/opencode/skills/agentdev-workflow-templates/templates/issue_desc_*.md` | test strategy on_failure 記述へ SPEC 修正許容の注記を追加 |
| guide | `docs/guides/` 配下の Phase 0 解説文書（存在する場合） | Phase 0 commit スコープ設計の解説を補強 |

## 既存対策確認

- **確認結果**: 既存対策あり（部分）
- **該当ファイル**: `docs/specs/commands/case-auto.md` L120（Phase 0 と OU 完了の分離について言及）
- **ギャップ分類**: guardrail insufficiency
- **ギャップ詳細**: case-auto SPEC は Phase 0 と OU 完了の分離報告について言及するが、Phase 0 commit のスコープ設計（ドメイン state 更新と成果物変更のコミット分割、on_failure での SPEC 修正許容）は明示されていない。case-run SPEC の test strategy on_failure 記述も SPEC 修正許容を明示しない。

## 制約

- Phase 0 commit は case-auto 等の既存ワークフローで使われる仕組みであり、廃止せず運用ルールの追加にとどめること
- テスト戦略 on_failure の SPEC 修正許容は、孫 Issue 内で SPEC 整合性修正を完結できる運用を認めるものであり、SPEC 本文の無断改廃を許すものではない（要件定義を経ること）
- 既存の Phase 0 commit 運用実績（コミット履歴）との整合を崩さないこと

## 受け入れ条件

- [ ] Phase 0 commit のスコープ設計運用ルール（2 分割、on_failure SPEC 修正許容）が SPEC/guide へ明文化されていること
- [ ] test strategy on_failure へ SPEC 修正許容が明示され、テンプレートへ注記が反映されていること
- [ ] 既存の Phase 0 commit 運用と矛盾しないこと

## 元learning item / 根拠

- **要約**: Phase 0 commit のスコープ設計不明示に起因する孫 Issue 間スコープ交差と追跡 PR の空コミット化
- **根拠**:
  - #1: Phase 0 commit で適用した SPEC 変更と Wave 1 子 Issue のテスト戦略 TS-001 が同一ファイルで重複スコープを持ち、on_failure へ SPEC 修正許容が明示されず横断的手戻りが生じた（PR #1898）。重複スコープ残作業は Wave 2 #1873 へ委譲
  - #2: Phase 0 commit `0176a0ac` で REQ 変更と `.agentdev/drafts/` 更新が同一コミットに混在し、OU-002 (#1890) の追跡 PR #1900 が空コミット (`a5a2c24`) になった
- **再発条件**: Phase 0 commit で複数 SPEC を一括適用し、Wave 分割された子 Issue が同一 SPEC の異なるセクションを検証対象とする場合。または Phase 0 で REQ/SPEC 実体変更と管理メタデータを同一コミットへ含める場合
- **横展開可能性**: Phase 0 commit を発行する全ケースで発生し得る。AgentDevFlow 固有の概念だが同フレームワーク内では汎用

## 推奨Issue分類

- **分類**: feature（運用手順の文書化・SPEC 補強）
- **推奨ラベル**: documentation, enhancement
- **関連Issue**: Epic #1871、Issue #1872、#1873 (OU-002)、PR #1898、#1900、Phase 0 commit `0176a0ac`
