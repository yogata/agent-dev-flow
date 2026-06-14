---
draft_type: req_draft
topic: diagnostics-workflow-introduction
status: saved
created_at: 2026-06-14T23:15:00+09:00
---

## draft-meta

- work_type: feature
- req-operation: UPDATE
- target-req: REQ-0103, REQ-0105, REQ-0109, REQ-0115
- adr-required: YES
- adr-topic: diagnostics-workflow-introduction-and-review-command-deletion
- topic-slug: diagnostics-workflow-introduction
- scale: large

## 目的

AgentDevFlow の診断 workflow を `review` から `diagnostics` へ一級化し、診断 finding の RU 化経路を統合する。`docs-review` / `skill-review` の語は既存コマンド群（backlog-review 等）と衝突しやすく、finding の行き先が intake / req-define 入力 draft / docs-check rule に分断されている。diagnostics を一級概念として導入し、明確な不整合を diagnostics promoted artifact 経由で RU 化することで、診断→要件化の経路を一貫させる。

## 要件

| ID | 要件 |
|---|---|
| D-001 | `.agentdev/diagnostics/` を diagnostics domain state として定義すること |
| D-002 | `.agentdev/diagnostics/` は `inbox/`、`promoted/`、`archive/` を持つこと |
| D-003 | `.agentdev/diagnostics/inbox/` は診断で発見された未分類 diagnostic finding を格納すること |
| D-004 | `.agentdev/diagnostics/promoted/` は採用済み・RU 化対象の diagnostic artifact を格納すること |
| D-005 | `.agentdev/diagnostics/archive/rejected/` は reject された finding を格納すること |
| D-006 | `diagnostics-docs` を docs 系意味整合診断コマンドとして定義すること。現行 `/agentdev/docs-review` の診断観点を引き継ぐこと |
| D-007 | `diagnostics-skills` を command/skill 参照妥当性・skill 構造診断コマンドとして定義すること。現行 `/agentdev/skill-review` の診断観点を引き継ぐこと |
| D-008 | `diagnostics-promote` を diagnostic finding の分類・採用コマンドとして定義すること |
| D-009 | `diagnostics-commands` は予約拡張点とし、本次件では実体コマンドとして定義しないこと |
| D-010 | AgentDevFlow のコマンド体系に `docs-review` / `skill-review` を含めないこと（完全削除: ドキュメント記述 + 実体ファイル） |
| D-011 | `diagnostics-promote` の分類は promote / defer / reject を基本とすること |
| D-012 | promote された diagnostic artifact は `.agentdev/diagnostics/promoted/` に保存すること |
| D-013 | defer された finding は `.agentdev/diagnostics/inbox/` に残すこと |
| D-014 | reject された finding は `.agentdev/diagnostics/archive/rejected/` に移すこと |
| D-015 | `backlog-review` の入力対象に `.agentdev/diagnostics/promoted/*.md` を含めること |
| D-016 | `promoted/` の意味を intake / learning / diagnostics で「採用済み・RU 化対象」に統一すること |
| D-017 | RU frontmatter の `source_type` に `diagnostics` を含めること |
| D-018 | diagnostics promoted artifact を RU 化した場合、RU の `sources` に元 artifact path を記録すること |
| D-019 | docs-check rule / fixture 追加候補は独立 route とせず、RU の要件化方向または受け入れ条件に含めること |
| D-020 | 明確な不整合 finding は intake に回さず、diagnostics promoted artifact として RU 化対象とすること |
| D-021 | intake に送るのは、不整合かどうか、採否、範囲、優先度、正とする情報源が未確定の finding に限ること |
| D-022 | learning に送るのは、具体的修正対象を持たない再発防止知見・判断基準候補に限ること |
| D-023 | `review` を diagnostics domain state 名として使用しないこと |

## 適用範囲

- **対象**: `.agentdev/diagnostics/` domain state（inbox / promoted / archive）、diagnostics-docs / diagnostics-skills / diagnostics-promote コマンド定義、diagnostics-promote の promote / defer / reject lifecycle、diagnostics promoted artifact の RU 化経路、backlog-review 入力への diagnostics promoted 追加、RU source_type への diagnostics 追加、docs-review / skill-review の完全削除、明確な不整合 finding の intake 回避、docs-check rule / fixture 候補の RU 内包、promoted 概念の intake / learning / diagnostics 統一
- **対象外**: `diagnostics-commands` の詳細診断観点の確定、docs-check rule / fixture の具体的実装、個別 finding の RU 化、`docs-review` / `skill-review` の deprecated shim 化、diagnostics-promote の詳細フェーズ定義、Issue 作成、PR 作成、実装手順、コード差分案

## Requirement Source

- RU: `.agentdev/backlog/req-units/RU-20260614-01.md` (RU-20260614-01)
- Session: `session:2026-06-14-diagnostics-workflow`
- 壁打ちセッション: 2026-06-14 req-define 実行（分岐2 docs-review/skill-review 完全削除で確定）

## 関連ドキュメント更新候補

| 更新候補 | 種別 | 根拠 | 分類 |
|----------|------|------|------|
| REQ-0103 | REQ | diagnostics domain state 定義、diagnostics command 体系、docs-review/skill-review 完全削除（REQ-0103-106〜111, 122-125, 139 の更新/削除） | 変更後仕様 |
| REQ-0105 | REQ | backlog-review 入力に diagnostics promoted 追加（REQ-0105-031）、source_type 拡張 | 変更後仕様 |
| REQ-0109 | REQ | docs-review 前提要件（012〜020, 037）の diagnostics-docs 更新 | 変更後仕様 |
| REQ-0115 | REQ | docs-* suite → diagnostics workflow 再配置（007〜018, 025〜027, 033〜035, 041〜042 の更新） | 変更後仕様 |
| docs/specs/system.md | SPEC | diagnostics workflow 記述の追加、review 系記述の diagnostics 置換 | 反映作業 |
| docs/specs/artifact-contracts.md | SPEC | diagnostics promoted artifact contract の追加 | 反映作業 |
| docs/guides/diagnostics-and-maintenance.md | Guide | diagnostics workflow guide の更新 | 反映作業 |
| docs/guides/command-selection.md | Guide | コマンド選択表の更新（diagnostics-* 追加、docs-review/skill-review 削除） | 反映作業 |
| docs/guides/artifacts-and-state.md | Guide | `.agentdev/diagnostics/` の状態モデル追加 | 反映作業 |
| src/opencode/commands/agentdev/diagnostics-docs.md | Command | 新規コマンド定義 | 反映作業 |
| src/opencode/commands/agentdev/diagnostics-skills.md | Command | 新規コマンド定義 | 反映作業 |
| src/opencode/commands/agentdev/diagnostics-promote.md | Command | 新規コマンド定義 | 反映作業 |
| src/opencode/skills/agentdev-diagnostics-* | Skill | 新規スキル定義（診断観点・分類基準等） | 反映作業 |
| src/opencode/commands/agentdev/docs-review.md | Command | 完全削除 | 反映作業 |
| .agentdev/README.md | Domain state | diagnostics/ ディレクトリの状態表追加 | 反映作業 |
| README.md (root) | README | 入口表・クイックスタートの更新 | 反映作業 |
| docs/DOC-MAP.md | DOC-MAP | diagnostics 関連文書の追加 | 反映作業 |
| docs/requirements/README.md | Index | REQ 更新の反映 | 反映作業 |

## ADR判断

- **ADR 必要**: YES
- **ADR topic**: `diagnostics-workflow-introduction-and-review-command-deletion`
- **判断根拠**:
  1. アーキテクチャ変更: 新規 domain state（`.agentdev/diagnostics/`）、コマンド体系の改名（review → diagnostics）
  2. 複数システム影響: 4 REQ（REQ-0103, 0105, 0109, 0115）への UPDATE
  3. 長期間有効: diagnostics workflow は恒久追加、review → diagnostics の語彙変更は不可逆
  4. 取り返しがつかない: docs-review / skill-review の完全削除（deprecated shim なし）は不可逆
- **ADR 禁止ゲート（Step 5-1）**: 本件は REQ/SPEC 相当の要件定義を含むが、「review → diagnostics 移行」「完全削除 vs deprecated shim」の選択は ADR 相当の判断。ADR 候補として提示可能
- **代替案**:
  - (P) deprecated shim 採用 → 却下。REQ-0115-039 と競合し、shim 保守コストが発生
  - (Q) 完全削除 → 採用。REQ-0115-039 に合致
- **ADR file 作成**: req-save + agentdev-adr-file-manager が実行

## operation_units

```yaml
operation_units:
  - ou_id: OU-1
    source_ru: RU-20260614-01
    target_req: REQ-0103
    operation: UPDATE
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_req: REQ-0103
      new_lines: [REQ-0103-140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151]
      updated_lines: [REQ-0103-107, 108, 109, 122, 123, 139]
      adr: ADR-0113
    scope: |
      diagnostics domain state 定義（`.agentdev/diagnostics/` inbox/promoted/archive）、
      diagnostics command 体系定義（diagnostics-docs/skills/promote）、
      docs-review/skill-review 完全削除（REQ-0103-106〜111, 122-125, 139 を diagnostics-skills 等へ更新または削除）、
      finding routing 定義（D-019〜023）、naming 制約（D-023）

  - ou_id: OU-2
    source_ru: RU-20260614-01
    target_req: REQ-0105
    operation: UPDATE
    scale: standard
    depends_on: [OU-1]
    recommended_order: 2
    issue_policy: single
    result:
      saved_req: REQ-0105
      new_lines: [REQ-0105-091, 092, 093]
      updated_lines: [REQ-0105-031]
    scope: |
      backlog-review 入力に `.agentdev/diagnostics/promoted/*.md` 追加（REQ-0105-031 の更新）、
      RU frontmatter source_type に diagnostics 追加、
      promoted 概念の intake/learning/diagnostics 統一（D-016）

  - ou_id: OU-3
    source_ru: RU-20260614-01
    target_req: REQ-0109
    operation: UPDATE
    scale: standard
    depends_on: [OU-1]
    recommended_order: 2
    issue_policy: single
    result:
      saved_req: REQ-0109
      updated_lines: [REQ-0109-012, 013, 014, 015, 016, 017, 018, 019, 020, 037]
      rename: docs-review → diagnostics-docs
    scope: |
      docs-review 前提要件の diagnostics-docs 更新:
      REQ-0109-012（docs-review → diagnostics-docs）、
      REQ-0109-013〜020（read-only 性・対象範囲・出力・禁止操作の diagnostics-docs 更新）、
      REQ-0109-037（入力対象の更新）

  - ou_id: OU-4
    source_ru: RU-20260614-01
    target_req: REQ-0115
    operation: UPDATE
    scale: standard
    depends_on: [OU-1]
    recommended_order: 2
    issue_policy: single
    result:
      saved_req: REQ-0115
      updated_lines: [REQ-0115-007, 008, 009, 010, 011, 012, 013, 014, 015, 016, 017, 018, 025, 026, 027, 033, 034, 035, 041, 042]
      rename: docs-review → diagnostics-docs
    scope: |
      docs-* suite → diagnostics workflow 再配置:
      REQ-0115-007〜018（docs-review → diagnostics-docs）、
      REQ-0115-025〜027（finding route の diagnostics-docs 更新）、
      REQ-0115-033〜035（出力・route の更新）、
      REQ-0115-041〜042（docs-review 診断観点の diagnostics-docs 移行）、
      REQ-0115-017（docs-* suite 定義の diagnostics-* 拡張）
```

## execution_groups

```yaml
execution_groups:
  - id: EG-1
    type: epic-candidate
    purpose: diagnostics workflow 導入と review 系コマンド完全削除
    included_ou: [OU-1, OU-2, OU-3, OU-4]
    rationale: |
      全 OU が diagnostics workflow 導入の一部。
      OU-1（REQ-0103）が foundation: domain state・command 体系・docs-review/skill-review 削除を定義。
      OU-2/3/4（REQ-0105/0109/0115）が連動更新: backlog-review 入力・docs-review 運用要件・command suite。
      case-open では Epic + child Issue 分割候補として扱う。
```

## 壁打ちメモ

本セッションの壁打ち結果分類:

| 分類 | 内容 |
|------|------|
| Confirmed | 全 6 分岐（ユーザー明示確認）: 統合/分離=分離、diagnostics-commands=対象外、docs-review/skill-review=完全削除、REQ-0109更新=必要、Scale=large、RU-02=APPEND |
| Inferred | なし（全分岐ユーザー確認済み） |
| Unknown | なし |
| User Decision | docs-review/skill-review 扱い（P deprecated shim vs Q 完全削除）→ Q で確定 |
| Out of Scope | diagnostics-commands 詳細、orphan reference 調査、個別 finding RU 化 |
