---
title: 実行識別情報セクション（PR テンプレート形式）
---

<!-- 親: agentdev-workflow-templates SKILL.md「実行識別情報セクション」節から参照される詳細仕様（遅延読み込み）。 -->

# 実行識別情報セクション（PR テンプレート形式）

PR 本文テンプレートに、ADF 実行の識別情報を構造化して記録する「実行識別情報」セクションを定義する。
Issue 本文には本セクションを設けない（実行単位・委譲単位・Case・GitHub Issue・PR・ADF 成果物は Issue 番号、親Epic 参照、実行構成表、Refs 行等の canonical 成果物関係から相関でき、本文へ一覧化しない）。
記録先割当と意味集合は durable-state-and-recovery Design「ADF 実行識別情報の記録契約」節が正規所有し、本スキルはテンプレートセクション形式を提供する。

## 対象テンプレートと記録内容

| テンプレート | 記録する識別情報 |
|---|---|
| `templates/case-revise/amendment-pr.md` | 対象 Case、実行単位 |
| `pr_desc.md` | 対象 Case、実行単位、委譲単位識別子 |

## セクション仕様

- セクション見出しは「実行識別情報」とし、`<!-- 【必須】 -->` マーカー付きの必須セクションとする
- セクション本文は `adf_` 接頭辞付きの key-value 行（`- adf_{key}: {value}`）で構成する
- 機械的解析は本セクション内の key-value 行を正とし、自由文中に偶然出現する ID に依存しない
- 実行単位の識別は execution_unit 構成の既存定義に接続し、flow 種別（standard / epic）を記録する。対象 Issue 番号は Issue 番号、Parent 行、Refs 行等の canonical 成果物関係から導出し、重複記録しない
- 委譲単位識別子は `DEL-{N}-{seq}` 形式（N = Issue 番号、seq = 同一 Issue への委譲連番）とし、ADF が発行する識別子を正規手段とする
- harness 側識別子（OpenCode session ID 等）は任意キー `adf_harness_ref` に限定し、取得可能な場合の付加情報としてのみ記録する。必須契約としない
- 識別情報の一部が取得不能な場合は「N/A」と記録し、workflow を停止しない
- 値の記録は識別子中心で行う（Issue 番号、PR 番号、commit SHA、REQ/Decision/Design の識別子等）

## key 一覧

| key | 対象 | 意味 |
|---|---|---|
| `adf_case` | Issue / PR | 対象 Case の Issue 番号（#N）。Standard flow では本 Issue、Epic flow では親 Epic Issue、PR では関連Issue の番号 |
| `adf_execution_unit` | Issue / PR | 実行単位の flow 種別（standard / epic）。対象 Issue 番号は canonical 成果物関係（Issue 番号、Parent 行、Refs 行）から導出する |
| `adf_delegation` | PR | 委譲単位識別子（DEL-{N}-{seq}）。委譲 prompt から転記 |
| `adf_harness_ref` | Issue / PR | 任意。harness 側識別子。取得可能な場合のみ |

## 配置規則と適用範囲

- PR テンプレートでは「概要」セクションの直後に配置する
- 本セクションは新規作成の PR にのみ適用し、既存 PR への遡及適用は行わない
