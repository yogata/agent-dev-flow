---
id: REQ-0103
title: "Artifact責任分界（Draft Artifact Contract 拡張）"
created: "2026-06-14"
updated: "2026-06-14"
---

## 目的

.agentdev/drafts/ 配下の中間成果物（draft file）について、draft type registry・frontmatter 制約・標準 draft type・command 間受け渡し契約を確立し、draft file の種別識別不能・誤消費・producer/consumer 不整合を防止する。

REQ-0103-126-128 により配置先と .sisyphus/ 排除は既に定義済みである。本要件は、配置先の決定後に残る「どのような draft が・どのような制約で・どの command 間で受け渡されるか」を定義する。

## 要件

| ID | 要件 |
|---|---|
| REQ-0103-129 | .agentdev/drafts/ は、draft type registry に登録された draft type の中間成果物のみを配置する場所とすること |
| REQ-0103-130 | draft type registry は各 draft type について、draft_type・file pattern・producer・allowed consumers・位置づけ・lifecycle/removal condition（必要な場合）を定義すること |
| REQ-0103-131 | 各 command は、入力 draft の draft_type が自 command の allowed input に該当するかを確認すること。producer/consumer/next を個別 file frontmatter から読んで整合性判定する必要はないこと |
| REQ-0103-132 | 標準 draft type は req_draft と skill_review_finding の2種とすること。requirements-review-finding を標準 draft type に含めないこと |
| REQ-0103-133 | req_draft は req-define が生成し、req-save と case-open が消費する、保存前の要件ドラフトとする（file pattern: .agentdev/drafts/req-draft-{topic}.md） |
| REQ-0103-134 | skill_review_finding は skill-review が生成し、req-define が消費する、Skill/Command 診断結果の要件化入力とする（file pattern: .agentdev/drafts/skill-review-finding-{topic}.md） |
| REQ-0103-135 | .agentdev/drafts/ 配下の draft file は、frontmatter に draft_type・topic・status・created_at の4フィールドを基本として持つこと |
| REQ-0103-136 | draft file の frontmatter に producer・consumer・next を必須化しないこと。これらは draft_type から導出可能であり、registry との不整合を避けるため registry 側でのみ定義すること |
| REQ-0103-137 | skill_review_finding draft は RU ではなく、診断結果・分類・根拠・推奨 route・未確認事項を含む req-define への read-only 中間成果物とすること |
| REQ-0103-138 | req-define は skill_review_finding を明示入力として受け付け、未確認事項や採否未確定事項を要件本文に混入させないこと |
| REQ-0103-139 | skill-review の許可される side effect は .agentdev/drafts/skill-review-finding-*.md の生成のみとし、canonical docs 変更・REQ/ADR/SPEC 変更・Command/Skill/Template/Script 変更・RU 保存・Issue 作成・PR 作成・commit・push を行わないこと（REQ-0103-107 を本要件に伴い更新する） |

### UPDATE 対象（既存要件行の修正）

| ID | 変更内容 |
|---|---|
| REQ-0103-107 | UPDATE: read-only 制約を維持しつつ、許可される side effect として .agentdev/drafts/skill-review-finding-*.md の生成を追加する。ファイル変更のうち draft 生成のみを例外とし、それ以外のファイル変更・Skill 分割の実行・Command 修正の実行・Issue/PR 作成・intake/learning/RU の保存・commit/push は引き続き禁止する |

## 適用範囲

- **対象**: draft type registry の定義内容・標準 draft type の初期定義（req_draft, skill_review_finding）・draft file frontmatter 最小制約・producer/consumer/next の registry 集約・command 側の draft_type 検証・skill_review_finding draft の内容要件・skill-review の side effect 境界（draft 生成例外）・req-define の skill_review_finding 入力取扱・requirements-review-finding の標準外扱い
- **対象外**: skill-review が実修正を行うこと、skill-review が RU を直接作成・保存すること、skill-review が Issue/PR を作成すること、skill-review が canonical docs/REQ/SPEC/Command/Skill を変更すること、.sisyphus/drafts/ の復活、finding 内容の無条件での要件採用、producer/consumer/next の frontmatter 必須化、requirements-review-finding の標準 draft type 採用、「req-save → req-define の review finding は採用しない」という否定要件の新規要件化、raw session log や会話 URL の source 記録、docs-check による draft type 検証の実装（別要件）

## Requirement Source

- .agentdev/backlog/req-units/RU-20260614-01.md: .agentdev/drafts/ の用途・frontmatter・draft type registry の確立

## 関連ドキュメント更新候補

> 以下は「反映作業」であり、要件行とは独立した実装タスクである。分類ゲート（REQ-0102-007, req-file-manager 分類ゲートルール）に従い、要件行とは区別して扱う。

### SPEC 更新

| 対象 | 変更内容 |
|------|----------|
| docs/specs/artifact-contracts.md | "Draft Artifact Contract" セクション新設。draft type registry 表・frontmatter 制約・標準 draft type 定義・command 側検証ルールを記載 |

### Command 更新

| 対象 | 変更内容 |
|------|----------|
| src/opencode/commands/agentdev/skill-review.md | skill-review-finding draft 生成能力の追加。side effect 境界の明記 |
| src/opencode/commands/agentdev/req-define.md | skill_review_finding を明示入力として受け付ける旨の追加。未確認事項混入禁止の明記 |

### Skill 更新

| 対象 | 変更内容 |
|------|----------|
| src/opencode/skills/agentdev-skill-review/SKILL.md | finding draft export の定義・side effect 境界の明記 |

### 標準外 draft 記述の削除対象

> REQ-0103-132 により requirements-review-finding を標準 draft type に含めない。既存の標準外記述を以下から削除する。ただし「req-save → req-define review finding は採用しない」という否定要件は新規作成しない。

| 対象 | 削除内容 |
|------|----------|
| src/opencode/commands/agentdev/req-save.md | requirements-review-finding を標準 draft type として扱う記述の整理 |
| src/opencode/commands/agentdev/req-define.md | requirements-review-finding の標準ユースケース記述の削除 |
| src/opencode/skills/agentdev-req-file-manager/SKILL.md | "Finding と REQ の関係" セクションの requirements-review-finding 標準扱いの整理 |
| src/opencode/skills/agentdev-req-file-manager/references/req-save-procedure.md | requirements-review-finding 標準扱いの整理 |
| docs/specs/workflow-contracts.md | requirements-review-finding の標準ユースケース記述の整理 |
| src/opencode/commands/agentdev/templates/req-save/split-detected.md | split 検出時の出力における requirements-review-finding 扱いの整理 |

## operation_units

`yaml
operation_units:
  - ou_id: OU-1
    source_ru: RU-20260614-01
    target_req: REQ-0103
    operation: UPDATE+APPEND
    scale: quick
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: ""
    note: "既に実施済み。REQ-0103-070 UPDATE（drafts 配置対象追加）、REQ-0103-126-128 APPEND（配置先統一・.sisyphus/ 排除）として REQ-0103 に反映済み。"

  - `1"REQ-0103-129,130,131 appended to REQ-0103"`
    note: "draft type registry 定義。REQ-0103-129, 130, 131 を REQ-0103 に APPEND。docs/specs/artifact-contracts.md に Draft Artifact Contract セクションの registry 部分を新設。"

  - `1"REQ-0103-135,136 appended to REQ-0103"`
    note: "draft frontmatter contract 定義。REQ-0103-135, 136 を REQ-0103 に APPEND。docs/specs/artifact-contracts.md の frontmatter 制約部分を追記。"

  - `1"REQ-0103-132,133,134,137,139 appended; REQ-0103-107 updated"`
    note: "標準 draft type 初期定義 + skill-review finding draft export。REQ-0103-132, 133, 134, 137, 139 を APPEND。REQ-0103-107 を UPDATE（draft 生成例外追加）。artifact-contracts.md に標準 type 表を追記。skill-review command/skill に finding export を追加。"

  - `1"REQ-0103-138 appended to REQ-0103"`
    note: "req-define 入力 contract 更新。REQ-0103-138 を REQ-0103 に APPEND。req-define command に skill_review_finding 入力と未確定事項混入禁止を追記。"

  - `1"Standard draft type excludes requirements-review-finding"`
    note: "標準外 draft 記述の削除。req-save, req-define, req-file-manager, workflow-contracts, split-detected template から requirements-review-finding 標準扱いの記述を整理・削除。否定要件は新規作成しない。"
`

## execution_groups

`yaml
execution_groups:
  - id: EG-1
    type: feature
    purpose: "Draft artifact contract の確立（registry・frontmatter・標準 type 定義・skill-review finding export・req-define 入力・標準外記述削除）"
    included_ou: [OU-2, OU-3, OU-4, OU-5, OU-6]
    rationale: "全 OU が同一関心領域（draft artifact contract）に属し、単一 REQ-0103 への APPEND/UPDATE で完結する。OU-1 は既に実施済み。残り5 OU は依存関係に基づき3 Waveで実行可能。標準規模の feature として1 Issue で扱う。"
`

## draft-meta

`yaml
work_type: feature
req-operation: APPEND+UPDATE
target-req: REQ-0103
adr-required: false
topic-slug: draft-artifact-contract
scale: standard
status: saved
`

### ADR判断根拠

ADR不要。本件は「artifact contract変更（frontmatter 規約・draft type registry）」「命名規約・directory 規約」に該当し、ADR作成禁止条件（#4 命名規約・directory 規約、#5 artifact contract変更）に合致する。技術的決定（技術スタック選定・アーキテクチャパターン・データモデル等）を含まず、仕様・契約定義の範囲に収まる。

### work_type 判定根拠

feature。新規の draft type（skill_review_finding）と skill-review の finding export 能力を追加するため。既存修正のみならず新規契約定義と新規能力を含む。

### Scale 判定根拠

standard。5 操作単位（OU-1 既実施を除く）、複数ファイル（REQ/SPEC/command/skill/template）にわたるが、全て artifact contract ドメイン内で完結し、アーキテクチャ判断不要。3 Wave で実行可能。
