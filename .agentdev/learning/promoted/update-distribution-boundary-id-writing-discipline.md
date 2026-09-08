# 配布依存境界 gate・全文検証の検出規則と適用範囲の執筆時織り込み

## 背景

配布依存境界 gate（check_distribution_boundary.ts）の ID 検出規則と、操作廃止系 Case の全文検索インベントリ設計を、配布物執筆・インベントリ設計の時点で織り込まず、case-close 最終 gate で新規違反・参照取りこぼしとして発見する事象が 6 観測されている。PR #2675・#2691 はマージ中止・blocked 再作業に至った。

## 問題

- 配布対象ファイル（src/opencode/**）の本文に digits 付き具体 ID（REQ-XXXX-XXX、TS-XXX 等）を記載例として書くと、GENERIC_ID_PATTERN 非合致として concrete-id / unclassified-entry 違反になる
- release archive に同梱されるファイルにも具体 ID 制約が適用され、ADF-COVERS 宣言の host 専用ファイル配置原則と衝突する
- 新規配布物原本・付随テスト内の ID 表記（テスト戦略識別子を含む）も検出対象になる
- 操作廃止系 Case の全文検索インベントリを src/ と docs/ のみで定義すると、リポジトリ固有実体（.opencode/skills/repo-* 配下の checker・テスト）に旧操作参照が残存し得る

## 望ましい変更

- 配布対象ファイルへの記載例・サンプルは最初からプレースホルダ形式（REQ-{NNNN}-{NNN}、TS-{NNN} 等、digits を持たないトークン）で執筆する
- 具体 ID の実例が不可欠な場合は、PR 作成前に check_distribution_boundary.ts --profile source を前置実行する
- 操作廃止系 Case のテスト戦略（TS）で全文検索対象を定義する際、repo-local 実体（.opencode/skills/repo-* 等）を検査対象に含めるかを明示的に判断する

## 対象範囲

### 対象

- 配布物（command / SKILL.md / Tool / Plugin / template）への記載例執筆場面
- 操作廃止・カタログ変更を伴う Case の全文検索インベントリ設計
- release archive 同梱ファイルの執筆

### 対象外

- 配布依存境界 checker の検出規則変更（規則自体の改修は別件）
- host 専用ファイル（docs/ 配下等）での具体 ID 利用

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補である。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill | .opencode/skills/agentdev-skill-authoring（記載例ガイドライン節） | プレースホルダ形式執筆の徹底と前置 gate 実行の注記 |
| Design | docs/designs/responsibilities/custom-tool-contracts.md（TS-003 検索範囲関連節） | 操作廃止系全文検索の対象範囲規定（repo-local 実体の明示判断） |
| Design | docs/designs/integrity/ 配布依存境界関連（archive 公開前検査節） | archive 同梱ファイルの ID 制約・宣言配置原則の運用注記 |
| knowledge | docs/knowledge/（新規候補） | 配布物執筆の ID 規律知識文書化の候補 |

## 既存対策確認

- **確認結果**: 既存対策あり（整備不備）
- **該当ファイル**: 配布依存境界 Design（検出規則・baseline 運用）、agentdev-skill-authoring（既存の記載規約）
- **ギャップ分類**: application miss / guardrail insufficiency
- **ギャップ詳細**: 検出規則自体は存在し機能しているが、執筆時点での予防規律（プレースホルダ形式の徹底・前置実行）が skill-authoring ガイドに集約されていない。全文検索範囲の設計判断基準が規定されていない

## 制約

- 検出器の ID 分類規則（プレースホルダ形式は digits を持たず許容）を変更しない前提の運用規律である
- 配布物はプロジェクト非依存が要件であり、具体 ID 記載の緩和は行わない

## 受け入れ条件

- [ ] 配布対象ファイルへの記載例はプレースホルダ形式とする規律が執筆ガイドに明記される
- [ ] 具体 ID 実例が必要な場合の前置 gate 実行が手順化される
- [ ] 操作廃止系 TS の全文検索対象に repo-local 実体を含めるかの明示判断が規定される

## 元learning item / 根拠

- **要約**: 配布境界 ID 検出規則・全文検証範囲の執筆時織り込み不足による case-close blocked 再作業 6 観測
- **根拠**: PR #2675（SKILL.md 記載例 concrete ID）、PR #2691（runner-cli.ts・specs-pr.ts コメント内具体 ID）、PR #2693（インベントリ漏れ自覚）ほか deferred 3件（OU-0004・archive・concrete-id 検出）
- **再発条件**: 配布物へ具体 ID 例を記載する場合・廃止系インベントリを src/ と docs/ のみで定義する場合
- **横展開可能性**: 配布物へ例・言及を書く全場面・廃止系 Case 全般

## 推奨Issue分類

- **分類**: docs_chore（執筆規律・検証手順への注記集約）
- **推奨ラベル**: documentation
- **関連Issue**: なし
