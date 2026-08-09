---
updated: 2026-08-10
status: accepted
---

# アーティファクト契約

本 SPEC は agent-dev-flow リポジトリのみに適用される。

## 目的

Command / Skill / Template / Script の入出力契約と依存方向を定義し、アーティファクト間の責務境界を明確にする（REQ-002）。

## アーティファクト種別

| 種別 | 配置先 | 責務 | 入力 | 出力 |
|---|---|---|---|---|
| Command | `src/opencode/commands/agentdev/`（実行時: `.opencode/commands/agentdev/`） | ユーザー向け入口、入出力、ガードレール、高レベル Steps | ユーザー起動、GitHub Issue | PR、Issue 更新、完了報告 |
| Skill | `src/opencode/skills/`（実行時: `.opencode/skills/`） | 再利用可能な判断基準、ドメイン知識 | Command からの参照 | 判断結果の参照提供 |
| Template | `src/opencode/skills/*/templates/` または `src/opencode/commands/agentdev/templates/`（実行時: `.opencode/` 経由） | 出力構造とプレースホルダー | 変数バインド | Issue/PR 本文、コメント |
| Script | `src/opencode/skills/*/scripts/`（実行時: `.opencode/` 経由） | 決定的でテスト可能な実行ロジック | コマンドライン引数 | 標準出力（JSON/Markdown） |
| リポジトリローカル Command | `.opencode/commands/repo/`（原本なし） | 本体リポジトリ専用入口（REQ-001） | ユーザー起動 | レポート、成果物 |
| リポジトリローカル Skill | `.opencode/skills/repo-*/`（原本なし） | 本体リポジトリ専用判断基準（REQ-001） | Command からの参照 | 判断結果の参照提供 |

## 依存方向

依存方向は Command → Skill の一方向とする。
Skill は Command を参照しない。

```
Command ──→ Skill ──→ Reference (references/)
   │             │
   │             └──→ Script (scripts/)
   │                    └──→ Template (templates/)
   │
   ├──→ Command-local Template (templates/{command}/)
   │
   └──→ Template（直接参照の場合あり）
```

- Command は Skill を参照して判断基準を得る。
- Skill は Reference（`references/`）に詳細を分離する。
- Script は Skill 配下に配置し、Command から間接的に利用される。
- Template は Skill 配下に配置し、Command または Skill から利用される。
- Command は独自の完了報告テンプレートを command-local templates に配置できる。

## コマンドフロントマター契約

command frontmatter 契約を description 単一へ同期する（ACT-SPEC-001 と整合）。配布物自己完結と内部ID/内部パス排除の境界宣言を REQ-001-031/032、REQ-002-021..029 と整合させ、「不一致時は本体SPECを正とする」実行時契約を廃止し開発時 checker が SPEC と配布物の適合を保証する構造へ変更する旨を明記する。詳細 normative は移行計画 §5.2, §6.2。

## スキル構造契約

```
<skill-name>/
  SKILL.md              # 入口カード（目的・使用条件・禁止条件・参照先）
  references/           # 詳細参照ファイル（実行時配布物のみ）
  scripts/              # 決定的処理スクリプト
  templates/            # 出力構造テンプレート
```

- `SKILL.md` は段階的開示（progressive disclosure）の入口。200 行超で分割を検討。
- `references/`（複数形）を正規ディレクトリ名として使用する。
- `references/` は実行時配布物のみを含める。執筆専用資料は含めない（REQ-002-045）。

## スキル粒度契約

Skill は以下の条件を全て満たす単位とする（REQ-002-100）。

| 条件 | 説明 |
|------|------|
| 同一関心 | 解決対象の問題領域が同一 |
| 同一責任境界 | 担う責任の範囲が同一 |
| 同一判断モデル | 判断の仕組み、基準が同一 |
| 矛盾しない `USE FOR` / `DO NOT USE FOR` | 全ての `USE FOR` が同一判断モデルに属し、`DO NOT USE FOR` と矛盾しない |

- 複数の `USE FOR` があっても、同一判断モデル、同一責任境界に属する場合は同一 Skill として扱う（REQ-002-101）。
- 複数の `USE FOR` が異なる判断モデル、入力、出力、責任境界を持つ場合は、`DO NOT USE FOR` が同じであっても Skill 分割候補とする（REQ-002-102）。
- 異なる判断モデル、入力、出力、責任境界を持つ内容は Skill 分割候補として扱うこと。

### SKILL.md サイズと内容基準（REQ-002-037）

- 200行を超える SKILL.md は責務集中、不要な手順、例、作業履歴の混入について確認すること
- 200行を超えることだけを不合格理由にしないこと。責務上の根拠があれば維持を認める
- SKILL.md に移動済み Step、統合済み Step、将来候補、作業履歴を示す節を残さないこと
- 詳細な判定表、スキーマ、例、失敗時手順は必要な場合に限り当該 skill 自身の reference へ配置すること（REQ-002-036）

## スキル参照妥当性契約

`references/*` は同一 Skill 内の段階的開示であり、小さい Skill ではない（REQ-002-103）。

- `references/*` は SKILL.md の入口カードから必要に応じて読み込まれる詳細参照ファイル。
- `references/*` ごとに独自の `USE FOR` / `DO NOT USE FOR` が必要になる場合は Skill 分割候補とする（REQ-002-104）。
- `references/*` に抽出するのは実行時配布物のみ（REQ-002-045）。

Command 固有の実行順序、Issue 作成、保存、更新、削除、完了報告は Skill 化せず、以下に配置する（REQ-002-105）。

| 配置先 | 対象 |
|--------|------|
| Command | 実行順序、高レベル Steps、ガードレール |
| Template | 出力本文構造（Issue/PR description、コメント） |
| Script | 決定的でテスト可能な検査、処理 |
| 操作用 Skill | GitHub 操作等の横断的操作の安全手順 |

## Script 所有権と委譲契約

各 script の正規所有者を文書種別ごとに定義する（REQ-002-159、REQ-001-029）。同一 script または共有 lib を複数 skill へ複製せず、正規所有者を一つに定める。

| script 種別 | 正規所有者 skill | 対象 |
|---|---|---|
| REQ 番号採番、要件行 ID 採番、REQ 固有検証 | `agentdev-req-file-manager` | REQ 操作に固有の決定的処理 |
| Decision 番号採番、Decision 固有検証 | `agentdev-decision-file-manager` | Decision 操作に固有の決定的処理 |
| SPEC 固有処理（target_area 見出し検索、SPEC 固有整合性確認） | `agentdev-spec-file-manager` | SPEC 操作に固有の決定的処理 |
| 文書種別横断の共通検証（frontmatter 整合性、エントリ存在確認、変更範囲検証）と共有 lib | `agentdev-artifact-validation` | 複数文書種別で共有する決定的検証と共有ライブラリ、対応 test |

**委譲規則**:

- 兄弟 skill と command は所有者 skill の内部 script パスを直接 import またはパス参照しない
- 利用側は所有者 skill の公開操作契約（操作名、入力、JSON 結果契約、エラー契約）へ委譲する
- 所有者 skill の SPEC または reference のみが内部 script の物理パスと I/O 詳細を保持する
- 同一 script または共有 lib を複製しない（REQ-002-006「Script は決定的: テスト可能、再現可能」の延長）
- 新規 script 追加時は所有者候補を文書種別で判定し、既存所有者との重複を確認する

本契約は Command → Skill → Script の依存方向を維持し、新規 Decision を作成せず v2:ADR-0107（Command/Skill/Template/Script 責任分界）の適用条件の精緻化として扱う（REQ-003-033 準拠）。

## 分類根拠伝播契約

learning/intake → RU → req-define → spec-save の各工程間で引き継ぐ分類根拠フィールドを定義する（REQ-001-033、REQ-001）。SPEC ファイルが主論理区分・正規所有対象を宣言する形式（frontmatter フィールド名、冒頭宣言節フォーマット）の正規所有者は `../foundations/document-model.md`「SPEC 宣言形式」とし、本節は工程間伝播フィールドの schema と req-define から spec-save へのシリアライズ位置を正規所有する。両者は `spec_logical_division`、`canonical_owner` のフィールド名を共有し、工程間で同一の名前を用いる。req-define は SPEC action の `artifact_actions` と `operation_units` へ分類根拠を出力し、spec-save はこれを読み取って CREATE/UPDATE 各操作で SPEC frontmatter または冒頭宣言節へ宣言を付与する。

### 伝播フィールド一覧

| フィールド | 型 | 内容 | soft-contract 扱い |
|---|---|---|---|
| change_nature | enum | 変更の性質: `new_user_requirement`、`external_contract_change`、`variation_addition`、`edge_case`、`parameter_adjustment`、`nonconformance_fix`、`internal_restructuring`、`document_correction` のいずれか | 欠落時は `unknown` で警告 |
| req_impact | enum | REQ影響の有無: `yes`、`no`、`unknown` | 欠落時は `unknown` で警告 |
| target_stakeholder | string | 変更が影響するステークホルダー（利用者、運用者、開発者、外部システム等） | 欠落時は `unknown` で警告 |
| user_visible_change | enum | 利用者から見える変更の有無: `yes`、`no`、`unknown` | 欠落時は `unknown` で警告 |
| spec_logical_division | enum | SPEC論理区分: `behavior`、`catalog`、`cross_cutting_contract`、`parameter`、`implementation_detail`、`unknown` のいずれか | 欠落時は `unknown` で警告 |
| canonical_owner | string | 正規所有対象（対象 command、skill、workflow、品質ルール、整合性ルール等の関心キー） | 欠落時は `unknown` で警告 |
| destination_selection_reason | string | 追記先を選択した理由 | 欠落時は `unknown` で警告 |
| observed_evidence | string | 根拠となる観測事実（CI 失敗、誤検出、エッジケース発見等） | 欠落時は `unknown` で警告 |

### soft-contract 運用（DEC-003 準拠）

- 分類根拠は soft-contract（DEC-003）として追加情報扱いとする
- 厳格なスキーマ検証、JSON Schema、バリデータを導入しない
- 欠落時は `unknown` 既定値で警告を出し、処理を継続する（後方互換）
- 既存の採用済み成果物、RU、req_draft を欠落により拒否しない
- 具体的なシリアライズ形式は各工程の成果物形式（RU frontmatter、draft-data YAML、SPEC frontmatter 等）に従う

### 各工程での扱い

| 工程 | 入力 | 出力 |
|---|---|---|
| learning-promote | 学びから change_nature、observed_evidence を推定 | 採用済み成果物（promoted artifact）に分類根拠を添付 |
| intake-promote | inbox item から change_nature、observed_evidence を推定 | 採用済み成果物に分類根拠を添付 |
| backlog-review | 採用済み成果物から読取、`tentative_classification` と併せて RU frontmatter へ記録 | RU frontmatter に `tentative_classification` と分類根拠を記録 |
| req-define | RU の分類根拠を暫定入力とし、最終分類を自身で確定。SPEC action（`artifact: spec`）の各 entry へ `spec_logical_division` と `canonical_owner` を最終分類確定値として出力する | draft-data の `artifact_actions`（各 SPEC action）と `operation_units` へ最終分類根拠を反映 |
| spec-save | draft-data の `artifact_actions`（各 SPEC action）から分類根拠を読取、配置一貫性検証の入力とする。CREATE 操作では新規 SPEC frontmatter または冒頭宣言節へ `spec_logical_division` と `canonical_owner` を宣言として書き込む。UPDATE 操作では変更対象 SPEC に宣言がなく分類値が `unknown` 以外に確定している場合に宣言を補完する。分類値が `unknown` または欠落の場合は警告して処理を継続する（宣言欠落を理由に保存拒否しない、DEC-003 soft-contract） | 配置一貫性検証結果を commit message、完了報告に反映。宣言付与結果を SPEC ファイルへ反映 |

### REQ 拡張可否判定ルール

change_nature が `new_user_requirement` または `external_contract_change` の場合のみ、REQ の作成または拡張を候補とする（REQ-001-033）。それ以外の change_nature は、既存 REQ が要求を既に保持している限り REQ を拡張せず、SPEC 等への配置を検討する。

## サイズ制約

| 種別 | 推奨上限 | 実運用上限 | 例外状態 |
|---|---|---|---|
| Command | 100 行 | 150 行 | 200 行超 |
| SKILL.md | 200 行 | - | docs-check で報告 |
| Steps 数 | 5〜12 個 | - ||

## サブエージェント委譲契約

サブエージェント委譲は、Command の詳細手順を増やさず、探索、検査、分類、候補抽出を独立した文脈へ分離するために使用する。
親エージェントは最終判断と副作用を保持し、サブエージェントは判断材料だけを返す（v2:ADR-0112, REQ-003）。

### 委譲時最小契約

委譲定義は以下の 4 要素を中心に記述する。

| 要素 | 説明 |
|---|---|
| `inputs` | 委譲先に渡す限定された入力範囲。対象ファイル、Issue/PR、ログ、参照基準、除外対象を含む |
| `side_effect_boundary`（副作用境界） | 委譲先の副作用境界。許可操作は `read_files`（ファイル読み取り）/ `inspect_content`（内容検査）/ `return_evidence`（根拠返却）等に限定し、保存、Issue/PR 更新、commit、push、ユーザー確認は禁止。包括値 `read_only` は使用しない（v2:REQ-0140-011） |
| `output_contract`（出力契約） | 返却形式。`pass` / `warn` / `fail` / `partial` を基本とし、要約、根拠、成果物パス、親判断事項、副作用なしの明示を含む |
| `capture_handoff`（キャプチャ引き継ぎ） | intake / learning 候補を保存せず、capture 候補として親エージェントへ返す形式 |

成果物本文（Issue 本文、PR 本文、commit message、保存対象ファイル本文、テンプレート成果物）はそのまま（verbatim）返す。
判定結果、調査過程、中間ログ、読解メモは要約、成果物パス、根拠、親判断事項、capture 候補へ圧縮して返す。

### delegation_type 参考分類

`delegation_type`（委譲種別）は必須の envelope ではない。
必要な場合のみ、委譲の意図を短く示す参考ラベルとして使用する。

| delegation_type | 用途 | 副作用 |
|---|---|---|
| `gate_check`（ゲート検査） | 完了判定、ガードレール充足確認、保存前/close 前検査 | 禁止 |
| `semantic_review`（意味レビュー） | 文書、差分、REQ/Decision/SPEC の意味レビュー | 禁止 |
| `log_analysis`（ログ解析） | テストログ、CI ログ、review 結果解析 | 禁止 |
| `classification`（分類） | アーティファクト / 検出事項 / intake / learning の分類 | 禁止 |
| `extraction`（抽出） | 候補、論点、未回収事項の抽出 | 禁止 |
| `draft_generation`（草案生成） | Issue 本文、PR 本文、レポート案などの草案生成 | 禁止 |
| `controlled_case_execution`（統御下ケース実行） | case-run Epic / 複数 Issue 実行 | case-run のみ条件付きで許可 |

Command 本文では分類ラベルより、実際の `inputs`、`side_effect_boundary`、`output_contract`、`capture_handoff` を優先する。

## テンプレート配置契約

Template の配置先は以下の 2 種類を定義する（REQ-002-046）。

### Skill-local templates

- **配置先**: `.opencode/skills/{skill-name}/templates/`
- **用途**: Skill 内部で利用するテンプレート（Git worktree 操作、整合性検査等）
- **参照元**: 当該 Skill または Command から Skill 経由で利用

### Command-local templates

- **配置先**: `.opencode/commands/agentdev/templates/{command}/{variant}.md`
- **用途**: コマンド完了報告テンプレート等、コマンドに固有の出力構造
- **参照元**: 当該 Command が直接参照
- **命名規則**: `{command}` はコマンド名（`case-close`, `case-run` 等）、`{variant}` は種別名（`standard`, `epic` 等）

### テンプレート種別別参照先

| テンプレート種別 | 参照先（実行時パス） | 参照元 |
|---|---|---|
| Issue 説明文 | `.opencode/skills/agentdev-workflow-templates/templates/issue_desc_*.md` | case-open |
| Issue コメント | `.opencode/skills/agentdev-workflow-templates/templates/issue_comment_*.md` | case-close, case-update |
| PR 説明文 | `.opencode/skills/agentdev-workflow-templates/templates/pr_desc.md` | case-run |
| 完了報告 | `.opencode/commands/agentdev/templates/{command}/{variant}.md` | 各コマンド |

- 実行時コマンドは上記実行時パス（`.opencode/...`）からテンプレートを参照すること
- `src/opencode/...` は原本配置、install-sync 入力、執筆コンテキストに限定し、実行時の参照先として使用しない

## 完了報告契約

全 agentdev コマンドの完了報告に適用する共通契約を定義する（v2:REQ-0107-012, v2:REQ-0107-013）。

### 共通必須フィールド

各完了報告テンプレートは以下の 6 フィールドをすべて含むこと。

| # | フィールド | 説明 |
|---|-----------|------|
| 1 | 完了コマンド | 実行したコマンドのフルパス（例: `/agentdev/case-close`） |
| 2 | 対象 | 操作対象の識別子（Issue 番号、PR 番号、ファイルパス等） |
| 3 | 結果 | ユーザー視点、ドメイン視点の成果（Issue 作成、PR 作成、REQ/Decision 保存等）。commit hash、push 成否、HEAD 同期確認等の git 操作結果は含めない |
| 4 | 検証結果 | `✅ OK` / `⚠️ 注意` / `❌ NG` のいずれか |
| 5 | git 永続化 | git 操作結果のみ。記載形式: `該当なし` / `変更なし（commit/push スキップ）` / `✅ OK（commit {hash}, push 済み）` 等 |
| 6 | 次のコマンド | 後続コマンドのフルパス、または「なし」（終端コマンドの場合） |

### 責務境界

- **`結果` フィールド**: ドメイン成果（Issue 作成、PR 作成、RU 生成等）に限定。git 操作結果は含めない。
- **`git 永続化` フィールド**: git 操作結果（commit、push、HEAD 同期等）に限定。ドメイン成果は含めない。
- **重複禁止**: `結果` 欄と `git 永続化` 欄で同一事実を重複記載してはならない。

### 出力順序ルール

完了報告ステップで以下の順序を守ること。

1. **TodoWrite 更新（先）**: TodoWrite の「完了報告」項目を `completed` に更新する
2. **完了報告テキスト（後）**: 完了報告フォーマットに従ったテキストを出力する
3. **中間出力の禁止**: TodoWrite 更新と完了報告テキストの間に、他の中間出力を挟まない

### 汎用締め文の取り扱い

完了報告には `次のコマンド` フィールドまたは終端として明示的な完了宣言を含める。
明示的な完了宣言があるため、以下の汎用締め文に頼る必要はない。

- 「次にやるべきことがあれば指示してください」
- 「他にご要望があればお知らせください」
- 「何かあればお気軽にどうぞ」
- その他、ユーザーへの次回アクション委譲を促す汎用的な文言

各コマンドの完了報告には `次のコマンド` フィールドまたは終端として明示的な完了宣言が含まれるため、汎用締め文は不要である。

### 完了報告の最終性

完了報告がコマンドの最終出力である。
完了報告テキストを出力した後は、追加のテキスト、説明、サマリーを出力しない。

### Capture結果 小節（共通意味契約）

`結果` フィールド内に任意の `Capture結果` 小節を定義する（新規トップレベルフィールドは追加しない）。
`Capture結果` 小節の共通意味契約を本 SPEC で定義する。

- 保存した capture 成果物のパス（`intake/inbox/*.md` または `learning/inbox.md` への相対パス）
- 分類（intake/learning）
- 保存結果（成功/失敗、失敗時は理由）

具体的な `Capture結果` 小節の表示構造は各 command-local Template が正規所有する。

## 適用範囲宣言

`docs/specs/` は agent-dev-flow リポジトリ専用のリポジトリ内部設計文書である（REQ-001）。
他プロジェクトへの適用を意図しない。
実行時コマンドは SPEC ファイルに依存しない（REQ-001）。

## リポジトリローカルアーティファクト（REQ-001）

配布対象外コマンド/スキルは AgentDevFlow の配布対象外である:
- `.opencode/commands/repo/`（AgentDevFlow 本体リポジトリ専用コマンド）。`src/opencode/` に原本を持たず、sync-opencode.ps1 のジャンクション管理対象外
- `.opencode/skills/repo-*/`（AgentDevFlow 本体リポジトリ専用スキル）。同上
- `repo-*` プレフィックスは AgentDevFlow 配布コマンド体系（`agentdev-*`）とは独立に管理される

## ドラフトアーティファクト契約（REQ-002-129〜139）

`.agentdev/drafts/` 配下の中間成果物（draft file）の契約を定義する。
draft file は原本アーティファクト（REQ/Decision/SPEC/RU）ではなく、コマンド間で受け渡す中間成果物である（REQ-002-126-128）。

### ドラフト種別レジストリ（Draft Type Registry）

各 draft type（ドラフト種別）はレジストリ側で生成元（producer）、許可消費元（allowed consumers）、ライフサイクルを定義する（REQ-002-130, REQ-002-136）。
個別 draft file の frontmatter にはこれらを記述せず、レジストリを唯一の定義源とする。

| draft_type | file pattern | producer | allowed consumers | 位置づけ | lifecycle |
|---|---|---|---|---|---|
| `req_draft` | `.agentdev/drafts/req-draft-{topic}.md` | `req-define` | `req-save`, `spec-save`, `case-open` | 保存前の要件ドラフト | case-open の Issue 作成 + VERIFY 成功後に削除 |

標準 draft type は `req_draft` の 1 種のみとする（REQ-002-132）。
`requirements-review-finding` および旧 `skill_review_finding` は標準 draft type に含めない。
Skill/Command 参照妥当性の検出結果は inspect lifecycle（`.agentdev/inspect/inbox/`、REQ-002-140-151）へ出力する。

### ドラフトファイルフロントマター

`.agentdev/drafts/` 配下の draft file は、以下の frontmatter を基本とする（REQ-002-135）:

```yaml
---
draft_type: req_draft
topic: example-topic
status: draft  # draft_type=req_draft の初期状態（SPEC status とは無関係）
created_at: 2026-06-14T19:36:47+09:00
---
```

frontmatter の基本フィールドは `draft_type`、`topic`、`status`、`created_at` とし、producer、allowed consumers、lifecycle は registry 側で `draft_type` ごとに定義する（REQ-002-135, REQ-002-136）。

### Command 側 draft_type 検証

各コマンドは、入力 draft の `draft_type` とレジストリ上の許可消費元（allowed consumers）を照合して受理可否を判定する（REQ-002-131, REQ-002-136）。

| command | 受け付ける draft_type |
|---|---|
| `req-save` | `req_draft` |
| `spec-save` | `req_draft` |
| `case-open` | `req_draft` |

### inspect-skills 副作用境界

`inspect-skills` は検査対象（Command/Skill 定義ファイル）を直接修正しない診断コマンドとする。
許可される副作用は `.agentdev/inspect/inbox/inspect-skills-finding-*.md` の生成、および `.agentdev/inspect/` 配下の git 永続化（commit / push）のみとし、それ以外の原本文書変更、REQ/Decision/SPEC 変更、Command/Skill/Template/Script 変更、RU 保存、Issue 作成、PR 作成、許可範囲外の commit/push を行わない（inspect lifecycle、REQ-002-140-151、REQ-010-007）。
最終判断（promote / defer / reject）は `inspect-promote` が行う。
検出事項（inspect finding）は `inspect-promote` による promote/defer/reject ライフサイクルの対象となる。

### req_draft consumer 4 集合

req_draft（`.agentdev/drafts/req-draft-{topic}.md`）の consumer 境界を次の 4 集合で確定する（REQ-008、REQ-006-083）。
draft type registry の allowed consumers 列、REQ-008、REQ-006-083、document-model の req_draft 説明、各 command 実体から抽出した 4 集合がすべて一致すること。

| 集合 | 要素 | 役割 |
|---|---|---|
| producer | `{req-define}` | req_draft を生成する唯一の command |
| direct consumer | `{req-save, spec-save, case-open}` | req_draft を主入力として消費し、REQ/Decision/SPEC/Issue を生成する command 群 |
| orchestration pre-reader | `{case-auto}` | case-open 前だけ req_draft を読み、後続工程の orchestration 入力とする command |
| invalid post-case reader | `{case-auto, case-run, case-close}` | case-open 成功後に req_draft を参照してはならない command 群 |

#### case-open 成功後の SSoT 遷移

- case-open 成功後は Issue と Epic を SSoT とし、req_draft は削除されてよい一時成果物となる
- case-auto は case-open 成功後の停止、再開、完了処理を Issue と Epic だけで成立させる
- case-run、case-close は case-open 成功後に req_draft を参照しない
- draft type registry の allowed consumers 列は `{req-save, spec-save, case-open}` とする（従来の `{req-save, case-open}` から spec-save を追加）

## req_draft 出力構造

`req_draft`（`.agentdev/drafts/req-draft-{topic}.md`）は req-define が生成する一時的な構造化ハンドオフ成果物であり、req-save / spec-save / case-open / case-auto / case-run / case-close が消費する。

- req_draft は API 契約ではなく、生成元（producer）側の標準（緩やかな契約: soft contract）である。LLM 推論経由で消費され、機械的パースを前提としない（DEC-003）
- スキーマバージョン、JSON Schema、バリデータは導入しない
- 後続工程の権威ある情報源は `draft-data` YAML block であり、人間可読 Markdown セクションではない
- 標準データモデル fields: `auto_gate`, `agreed_items`, `artifact_actions`, `conflict_resolutions`, `operation_units`, `review_dispositions`, `case_open_hints`
- `summary` 等の人間可読セクションは補助的であり、後続工程の権威ある情報源ではない

### artifact_actions 詳細構造

- 1 action = 1 artifact × 1 editing concern とする（REQ-ID 単位でも、箇条書き 1 行単位でもない）
- 同一関心の複数 agreed items は、単一 action に複数段落の `content` としてまとめる

各 action の field 構成:

| field | 説明 |
|---|---|
| `id` | `ACT-REQ-NNN` / `ACT-DEC-NNN` / `ACT-SPEC-NNN` |
| `artifact` | `req` / `decision` / `spec` |
| `operation` | REQ/Decision: `create` / `append` / `update`、SPEC: `create` / `update`（公式 enum）。各 SPEC は非正規 alias（`spec-create`, `spec-update`, `spec-append`）を受け付ける（REQ-008-058）。alias から公式 enum への映射、alias 固有の契約（target_area 形式、placement、anchor、未検出時挙動等）は各 SPEC が定める |
| `target` | file path または `new:{slug}` |
| `target_area` | optional: section / area 指定 |
| `source_items` | 対応する agreed_item ID の list |
| `content` | 保存対象の full text |

### review_dispositions 構造

`review_dispositions` は req-define が壁打ち過程で記録した採否判断（covered、rejected 等）を後続工程へ引き継ぐ optional な soft-contract である（DEC-003）。

- **所有先**: 本節（`artifact-contracts.md`「req_draft 出力構造」節）が `review_dispositions` の schema を正規所有する
- **producer**: req-define（`docs/specs/commands/req-define.md`、`src/opencode/commands/agentdev/req-define.md`、`src/opencode/commands/agentdev/templates/req-define/req-draft.md`）
- **consumer**: case-open（`docs/specs/commands/case-open.md`、`src/opencode/commands/agentdev/case-open.md`）
- **Issue 本文永続化先**: workflow-templates（`docs/specs/skills/agentdev-workflow-templates.md`、`src/opencode/skills/agentdev-workflow-templates/SKILL.md`、Issue 本文テンプレート群）が Issue 本文の「レビュー判断」セクション構造を正規所有する

#### 各エントリの field 構成

| field | 型 | 内容 |
|---|---|---|
| `id` | string | `RD-NNN` 形式の識別子（NNN は連番） |
| `source_ru` | string | 単一の元 RU-ID（RU 入力でない場合は省略可） |
| `source_item` | string | 単一の元 item 識別子（RU 内の要件行 ID 等。複数指定不可） |
| `disposition` | enum | `covered` / `partially_covered` / `rejected` / `not_applicable`。必要に応じて `superseded` / `stale_target` を追加 |
| `reason_code` | string | 判断理由のコード（例: `already_satisfied`、`out_of_scope`、`superseded_by`） |
| `reason` | string | 人間可読の判断理由本文 |
| `evidence` | object | 根拠。`path`（ファイルパス）、`section`（セクション見出し等）、`checked_at_commit`（確認 commit SHA）を持つ。`checked_at_commit` は req-define 生成時 `null`（G08 git 禁止）。case-open が default branch 最新化後に再確認し、確認 commit SHA を記録する |
| `related_removed_items` | list | 本判断により除外された関連項目の識別子リスト（該当なし時は空リスト） |

1 disposition エントリ = 単一 `source_ru` + 単一 `source_item` の組み合わせとする（重複禁止）。

#### disposition 値の定義

| disposition | 意味 |
|---|---|
| `covered` | 入力項目は既存要件、既存 SPEC、または同意済み artifact_actions で既に充足されている |
| `partially_covered` | 入力項目の一部のみ採用し、残部は採用しない |
| `rejected` | 入力項目を採用しない（スコープ外、重複、方針不一致等） |
| `not_applicable` | 入力項目が本 draft の対象外である |
| `superseded` | 入力項目がより新しい判断へ置き換えられた（必要に応じて追加） |
| `stale_target` | 根拠の参照先が失効し、covered のまま起票できない（必要に応じて追加） |

#### optional soft-contract 運用（DEC-003 準拠）

- `review_dispositions` は optional な soft-contract であり、欠落時に既存 req_draft、RU、promoted artifact を拒否しない（後方互換）
- 厳格なスキーマ検証、JSON Schema、バリデータを導入しない
- covered 項目だけで構成される Issue や PR を作成しない方針を維持する。実行対象（`artifact_actions`、`operation_units`）を持たない disposition のみの draft から空 Issue を作成しない
- 記録済みの判断を consumer がユーザーへ再確認しない

### frontmatter 構造

req_draft の frontmatter は最小限のメタデータのみとする。
後続工程の主入力は `# draft-data` fenced YAML block である。

- 最小 frontmatter fields: `draft_type`, `topic_slug`, `status`, `created_at`、optional で `source_rus`
- frontmatter は lightweight metadata のみ。後続工程の主入力は `# draft-data` fenced YAML であり、frontmatter ではない

## artifact_actions operation

`artifact_actions` の `operation` フィールドは REQ/Decision 操作と SPEC 操作で扱う値が異なる。REQ/Decision 操作（`create` / `append` / `update`）は従来通り維持する。本節は SPEC 操作の公式 enum、非正規 alias、consumer 側の後方互換、および `spec-append` operation の契約を正規所有する。各 action の field 構成は「req_draft 出力構造」節の「artifact_actions 詳細構造」を参照。

### SPEC operation enum と非正規 alias

- SPEC operation の公式 enum は `create` / `update` の2値とする（REQ-008-058）
- 各 SPEC（req-define / spec-save）は非正規 alias として `spec-create` / `spec-update` / `spec-append` を受け付ける
- alias から公式 enum への映射: `spec-create` → `create`、`spec-update` → `update`、`spec-append` → `update`（既存 SPEC ファイルへ新規セクションを追加する操作）
- consumer（spec-save）は `create` / `update` / `spec-create` / `spec-update` / `spec-append` の全てを受理する（後方互換）

### spec-append operation

`spec-append` は既存 SPEC ファイルへ新規セクションを追加する操作であり、公式 enum の `update` へ alias として映射される（REQ-008-058）。

#### 意味

既存 SPEC ファイルへ `target_area` と `placement` で指示した位置へ新規セクションを追加する。

#### 入力フィールド

| field | 必須性 | 形式 |
|---|---|---|
| `target` | 必須 | 既存 SPEC ファイルパス |
| `target_area` | 必須 | 追加対象の見出し行全体（Markdown 見出し行形式。例: `### IR-044`）。見出しプレフィックス（`##`、`###` 等）の有無は正規化により吸収する |
| `content` | 必須 | 追加する新規セクション本文（見出し行から始まる） |
| `placement` | 任意（省略時 `tail`） | `tail` / `after_anchor` / `before_anchor` のいずれか |
| `anchor` | `placement` が `tail` 以外は必須 | 挿入位置の基準となる見出し行（`target_area` と同一形式） |

`placement` 別の追加位置は次の通り。

| placement | 追加位置 |
|---|---|
| `tail`（既定） | `target_area` セクションの末尾（次の同レベルまたは上位レベル見出し行の直前） |
| `after_anchor` | `anchor` 見出し行の直後 |
| `before_anchor` | `anchor` 見出し行の直前 |

#### 挙動

- **同名見出し時**: `target_area` と完全一致する見出しが既存 SPEC ファイルに存在する場合、追加をスキップし follow-up 報告を行う（重複追加防止、全体中止しない）
- **anchor 未検出時**: `placement` が `tail` 以外で `anchor` 見出し行が存在しない場合、当該 action をスキップし follow-up 報告を行う（全体中止しない）
- follow-up 報告は「operation を `spec-create` へ切り替えを推奨」を含む

#### 合格基準

- 追加後の SPEC ファイルに `target_area` と完全一致する見出しが1つだけ存在すること
- frontmatter `updated` を更新していること
- `status` は変更しないこと（G06）

配置契約の実行詳細（`placement` 別挿入位置の算出、anchor マッチング規則）は `specs/commands/spec-save.md`「spec-append 操作時のセクション追加ロジック」が正規所有する。

## RU アーティファクト契約（session由来RU）

session由来RU（`source_type: chat`、`generated_by: session`）の生成、承認、保存、永続化の追跡可能な二段階手続きを定義する。本節は REQ-008 に基づき session 経路に不足する契約を追加し、既存の `source_type: chat` と7値の `tentative_classification` を維持する。

### 生成主体と生成時点

- 生成主体: `req-define` 親エージェント（`generation_actor: req-define-parent`）
- 生成時点: チャット内合意成立後、req-define 開始前（`generation_stage: pre-req-define`）
- `agreement_confirmed_at` と `generated_at` は ISO 8601 形式とし、`generated_at >= agreement_confirmed_at` を満たすこと
- 保存完了前に req-define を開始しないこと

### 二段階承認

- 第1承認: 論理キー（`logical_key`）で特定したRU案の内容のみを対象とする。採番、保存、commit、push を行わない
- 第2承認: 採番、保存、commit、push を許可する。第1承認のみではファイル作成、commit、push を行わない
- 第1承認記録は対象RUの `logical_key` を列挙する

### 保存先と永続ID

- 保存先: `.agentdev/backlog/req-units/`
- 永続ID: 保存時に既存最大番号+1で割り当て（RU-NNNN 形式）
- 保存後の `depends_on` は RU-ID で記録する

### session 論理URI

- `sources[].type: chat` の場合だけ、`sources[].path` へ `session:...` を解決しない論理URIとして許可する
- `type: chat` 以外の source で `session:...` を使用しない
- `session:...` をファイル取得、URL取得、外部セッション取得の解決処理へ渡さない

### frontmatter 必須フィールド

session由来RU の frontmatter は次を必須とする。

| field | 値 |
|---|---|
| `source_type` | `chat` |
| `generated_by` | `session` |
| `generation_actor` | `req-define-parent` |
| `agreement_confirmed_at` | ISO 8601 形式の合意成立時刻 |
| `generation_stage` | `pre-req-define` |
| `generated_at` | ISO 8601 形式の生成時刻（`>= agreement_confirmed_at`） |
| `logical_key` | RU を一意に特定する論理キー |
| `tentative_classification` | 既存7値のいずれか（欠落時は生成停止） |
| `agentdev_handoff` | 配布物改善の場合 `true` |
| `depends_on` | 依存先 RU-ID のリスト（保存後） |
| `sources` | `type: chat`、`path: session:...` 形式 |
| `status` | `draft` |

### RU 本文必須8セクション

各RU本文は次の8セクションを必須とする。session 論理URI の解決なしに後工程が RU 内容を判断できる自足性を保つこと。

1. 目的
2. 対象
3. 対象外
4. 正規所有者とアンカー
5. 依存関係
6. 要件化の方向
7. 決定的受け入れ条件
8. Source Summary

### req-define による最終分類の扱い

`tentative_classification` は暫定値であり、req-define による最終分類を先取りしない。
req-define は `tentative_classification` を入力とし、document-model SPEC の文書7分類モデルへ照らして最終分類を確定する。
