---
draft_type: req_draft
topic: inspect-git-persistence
status: draft
created_at: 2026-06-17T09:30:00+09:00
---

# inspect 系コマンドへの git 永続化フェーズ追加と git pull 方式の --ff-only 統一

## 目的

`.agentdev/` は README と AGENTS.md で git 管理対象と明記された domain state である。intake 系（`intake-capture`, `intake-promote`）と `learning-promote` は、成果物を `.agentdev/` 配下に出力した後に git pull → commit → push の「Git & Completion」フェーズを実装し、作業ツリーに未コミットファイルを残留させない運用となっている。

一方、inspect 系3コマンド（`inspect-docs`, `inspect-skills`, `inspect-promote`）は `.agentdev/inspect/` 配下に finding や promoted artifact を生成するが、git commit / push を一切行わない。特に `inspect-skills` は Guardrail G04 と `agentdev-inspect-skills` SKILL.md「Read-Only 制約」で「commit / push 禁止」を明示しており、read-only 診断の原則と `.agentdev/` の git 管理性が矛盾している。また `learning-promote` の git pull が `--rebase` であり、他の intake 系コマンドや共通 template `git-error-messages.md`（pull --ff-only 失敗形式）と不整合している。

本要件は、inspect 系コマンドの副作用を「成果物生成」から「成果物生成 + その git 永続化」へ拡張し、`.agentdev/` 配下の git 永続化の一貫性を回復することを目的とする。intake-capture が「保存専用」を謳いながら commit/push している前例と整合する。

## 要件

| ID | 要件 |
|---|---|
| REQ-0109-040 | `inspect-docs` は `.agentdev/inspect/` 配下の変更を git commit / push すること。変更なし時は commit/push せず完了報告で「変更なし」と報告すること |
| REQ-0109-041 | `inspect-docs` の git pull は `--ff-only` で実行すること |
| REQ-0109-042 | `inspect-docs` の commit 対象は `.agentdev/inspect/` 配下のみとし、他のパスを巻き込まないこと |
| REQ-0109-043 | `inspect-docs` の commit message は `chore(agentdev): capture inspect-docs finding` の形式であること |
| REQ-0125-009 | `inspect-skills` は `.agentdev/inspect/` 配下の変更を git commit / push すること。変更なし時は commit/push せず完了報告で「変更なし」と報告すること |
| REQ-0125-010 | `inspect-skills` の git pull は `--ff-only` で実行すること |
| REQ-0125-011 | `inspect-skills` の commit 対象は `.agentdev/inspect/` 配下のみとし、他のパスを巻き込まないこと |
| REQ-0125-012 | `inspect-skills` の commit message は `chore(agentdev): capture inspect-skills finding` の形式であること |
| REQ-0126-009 | `inspect-promote` は `.agentdev/inspect/` 配下の変更（promoted / archive/rejected への移動・inbox 削除を含む）を git commit / push すること。変更なし時は commit/push せず完了報告で「変更なし」と報告すること |
| REQ-0126-010 | `inspect-promote` の git pull は `--ff-only` で実行すること |
| REQ-0126-011 | `inspect-promote` の commit 対象は `.agentdev/inspect/` 配下のみとし、他のパスを巻き込まないこと |
| REQ-0126-012 | `inspect-promote` の commit message は `chore(agentdev): promote inspect findings` の形式であること |
| REQ-0103-107 (UPDATE) | `inspect-skills` は read-only 診断を基本とし、許可される side effect は `.agentdev/inspect/inbox/inspect-skills-finding-*.md` の生成および `.agentdev/inspect/` 配下の git 永続化（commit / push）のみとする。それ以外のファイル変更・Skill 分割の実行・Command 修正の実行・Issue/PR 作成・intake/learning/RU の保存・branch / worktree 操作を行わないこと |
| REQ-0103-139 (UPDATE) | inspect-skills の許可される side effect は `.agentdev/inspect/inbox/inspect-skills-finding-*.md` の生成および `.agentdev/inspect/` 配下の git 永続化（commit / push）のみとし、canonical docs 変更・REQ/ADR/SPEC 変更・Command/Skill/Template/Script 変更・RU 保存・Issue 作成・PR 作成・branch / worktree 操作を行わないこと |
| REQ-0125-007 (UPDATE) | 許可される side effect は `.agentdev/inspect/inbox/inspect-skills-finding-*.md` の生成および `.agentdev/inspect/` 配下の git 永続化（commit / push）のみであり、canonical docs 変更・REQ/ADR/SPEC 変更・Command/Skill/Template/Script 変更・Issue 作成・PR 作成・RU 保存・branch / worktree 操作を行わないこと |
| REQ-NEW-A | inspect-docs, inspect-skills, inspect-promote の push 失敗時は `templates/common/git-error-messages.md` の「Git Push エラー」形式で停止し、完了扱いにしないこと |
| REQ-NEW-B | inspect-docs, inspect-skills, inspect-promote の pull 失敗時は `templates/common/git-error-messages.md` の「Git 同期エラー（pull --ff-only 失敗）」形式で停止すること |
| REQ-NEW-C | read-only 診断の本質（canonical docs / REQ / ADR / SPEC / Command / Skill / Template / Script の変更禁止、Issue / PR 作成禁止、worktree / branch 操作禁止、自動修正禁止、intake / learning / RU 処理禁止）は、git 永続化フェーズ追加後も維持されること |
| REQ-NEW-D | 完了報告に git 永続化結果（変更有無・ファイル一覧・commit hash・push 成否）を含めること |
| REQ-NEW-E | `templates/inspect-skills/standard.md` と `templates/inspect-promote/standard.md` が存在し、共通必須フィールド（完了コマンド・対象・結果・検証結果・git 永続化・次のコマンド）を含むこと |
| REQ-NEW-F | `templates/inspect-docs/standard.md` の git 永続化欄が `commit: {hash}, push: {成功/失敗}` 形式であること（固定の「該当なし」ではないこと） |
| REQ-NEW-G | `learning-promote` の git pull は `--ff-only` であること（`--rebase` ではないこと） |
| REQ-NEW-H | `/repo/docs-check`（`check_integrity.ts` / `check_templates.ts` / `lint_skills.ts`）が inspect 系 template 新設・更新後に regression なく PASS すること |

> **REQ-ID 採番**: REQ-0109-040〜043, REQ-0125-009〜012, REQ-0126-009〜012 は既存最大行番号+1の予定。REQ-NEW-A〜H は req-save での配置先 REQ 確定後に正式採番する。候補配置先: REQ-NEW-A/B → REQ-0103（共通 git error 参照）または各 inspect REQ、REQ-NEW-C → REQ-0103（read-only 本質）、REQ-NEW-D/E/F → REQ-0107（完了報告フォーマット）または各 inspect REQ、REQ-NEW-G → REQ-0128 または REQ-0103-120 拡張、REQ-NEW-H → REQ-0108（docs-check）。

## 適用範囲

- **対象**:
  - `inspect-docs`, `inspect-skills`, `inspect-promote` コマンド（`src/opencode/commands/agentdev/`）
  - `agentdev-inspect-skills` スキル（`src/opencode/skills/`）
  - inspect 系完了テンプレート（`templates/inspect-docs/standard.md`, `templates/inspect-skills/standard.md`（新設）, `templates/inspect-promote/standard.md`（新設））
  - `learning-promote` コマンド Step 11 の git pull 方式（`--rebase` → `--ff-only`）
  - inspect 系副作用定義・read-only 制約を規定する REQ（`REQ-0103`, `REQ-0109`, `REQ-0125`, `REQ-0126`）
  - 完了報告フォーマットを規定する REQ（`REQ-0107`, `REQ-0103-046`）

- **対象外**:
  - `agentdev-inspect-pipeline` 等 pipeline スキルの新設
  - `intake-capture` / `intake-promote` / `learning-promote` の git セクションの構造リファクタリング（`learning-promote` の `--rebase → --ff-only` 変更のみ含む）
  - CI/CD（`.github/workflows/`）の導入
  - `check_integrity.ts` / `lint_skills.ts` / `check_templates.ts` への「git 操作を含むコマンド」新規検査ルールの追加
  - inspect 系コマンドの診断ロジック自体の変更
  - Issue 作成
  - PR 作成

## Requirement Source

- RU: `.agentdev/backlog/req-units/RU-20260617-09.md`（source_type: chat, session: 2026-06-17-inspect-git-persistence）
- チャットセッションで合意された是正方針: A案（全 inspect コマンドへ一律追加）、git pull は `--ff-only` で統一

## 関連ドキュメント更新候補

### REQ ファイル（req-save で操作）

| ファイル | 操作 | 対象行 | 変更内容 |
|----------|------|--------|----------|
| `docs/requirements/REQ-0103.md` | UPDATE | REQ-0103-107 | side-effect 定義を「finding 生成 + `.agentdev/inspect/` 配下の git 永続化」に再定義。「commit/push を行わない」を除去し「branch / worktree 操作を行わない」に置換 |
| `docs/requirements/REQ-0103.md` | UPDATE | REQ-0103-139 | 同上（REQ-0103-107 と重複定義の整理） |
| `docs/requirements/REQ-0103.md` | UPDATE（候補） | REQ-0103-120 | git error 共通 template 参照コマンド一覧に inspect 3コマンドを追加（intake-from-github / learning-promote / intake-capture → inspect-docs / inspect-skills / inspect-promote 追加） |
| `docs/requirements/REQ-0109.md` | APPEND | REQ-0109-040〜043 | inspect-docs git 永続化要件（commit/push / pull --ff-only / commit 対象 / commit message） |
| `docs/requirements/REQ-0125.md` | UPDATE | REQ-0125-007 | side-effect 定義を再定義（commit/push 禁止 → `.agentdev/inspect/` 配下の永続化のみ許可） |
| `docs/requirements/REQ-0125.md` | APPEND | REQ-0125-009〜012 | inspect-skills git 永続化要件 |
| `docs/requirements/REQ-0126.md` | APPEND | REQ-0126-009〜012 | inspect-promote git 永続化要件 |

### Command / Skill / Template ファイル（case-run で操作）

| ファイル | 操作 | 変更内容 |
|----------|------|----------|
| `src/opencode/commands/agentdev/inspect-docs.md` | UPDATE | Steps に「実行前同期（git pull --ff-only）」と「.agentdev/inspect/ 変更の commit と push」を追加。基本原則の副作用定義を「finding 生成 + その git 永続化」に拡張 |
| `src/opencode/commands/agentdev/inspect-skills.md` | UPDATE | 同構造の git セクション追加。G04 を「commit / push は .agentdev/inspect/ 配下の永続化のみ許可。branch / worktree 操作は禁止」に修正。基本原則の副作用定義を拡張 |
| `src/opencode/commands/agentdev/inspect-promote.md` | UPDATE | HITL 承認後のファイル操作後に git commit / push する構造を追加。commit message: `chore(agentdev): promote inspect findings`。`git add .agentdev/inspect/` で追加/変更/削除を一括 index 化 |
| `src/opencode/commands/agentdev/learning-promote.md` | UPDATE | Step 11 の `git pull --rebase` を `git pull --ff-only` に変更。Error Handling 表の「git pull --rebase 失敗」を「git pull --ff-only 失敗」に更新 |
| `src/opencode/skills/agentdev-inspect-skills/SKILL.md` | UPDATE | 「Read-Only 制約」セクションの「commit, push を行わない」を「`.agentdev/inspect/` 配下の永続化のみ許可」に整合修正。branch / worktree / Issue / PR 作成の禁止は維持 |
| `src/opencode/commands/agentdev/templates/inspect-docs/standard.md` | UPDATE | 行11 `git 永続化: 該当なし` を `git 永続化: commit: {hash}, push: {成功/失敗}` に変更 |
| `src/opencode/commands/agentdev/templates/inspect-skills/standard.md` | CREATE（新設） | intake-capture / learning-promote と同形式（結果・検証結果・git 永続化・次のコマンド セクション） |
| `src/opencode/commands/agentdev/templates/inspect-promote/standard.md` | CREATE（新設） | 同上 |

## ADR判断

**判定: ADR 不要**

**理由**:

1. **ADR禁止ゲート（REQ/SPEC相当判定）**: 本件は command 動作仕様（コマンドの入力・出力・振る舞いの定義）、workflow 定義（フェーズ追加）、運用ルール（git commit/push 手順）に該当する。`agentdev-adr-guidelines`「ADRを作成してはならない条件」の (2) command動作仕様、(3) workflow定義、(6) 運用ルール に該当する。

2. **技術的決定の不存在**: git永続化フェーズの追加は、intake-capture / intake-promote / learning-promote が既に実装している既存パターンの inspect 系への拡張である。新規技術スタック選定・アーキテクチャパターン変更・データモデル設計を含まない。

3. **read-only 原則の再定義**: inspect-skills の「read-only」原則を「副作用 = 成果物生成 + その git 永続化」へ再定義するが、これは特定コマンドの運用ルール変更であり、システム全体のアーキテクチャ構造・主要コンポーネント間の関係に影響しない。intake-capture の「保存専用」が commit/push を含む前例と整合する。

4. **作業手段ADR拒否ゲート**: 本件は削除・廃止・移行そのものを主題としない。既存パターンの拡張・一貫性回復である。

5. **既存ADR重複**: 本件の内容（command への git 永続化フェーズ追加）に該当する accepted ADR は存在しない。ADR-0113（docs-review → diagnostics-* 移行）は命名移行の履歴であり、git 永続化とは無関係。

## operation_units

```yaml
operation_units:
  - ou_id: OU-001
    source_ru: RU-20260617-09
    target_req: REQ-0103
    operation: UPDATE
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single-issue
    result:
      saved_req: REQ-0103
      lines_updated: [107, 120, 139]
      lines_appended: [154]
      description: >
      REQ-0103-107, 139 の inspect-skills side-effect 定義を
      「finding 生成のみ + commit/push 禁止」から
      「finding 生成 + .agentdev/inspect/ 配下の git 永続化」に再定義。
      REQ-0103-120 の git error template 参照コマンド一覧に inspect 3コマンドを追加（候補）。

  - ou_id: OU-002
    source_ru: RU-20260617-09
    target_req: REQ-0109
    operation: APPEND
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single-issue
    result:
      saved_req: REQ-0109
      lines_appended: [040, 041, 042, 043, 044, 045, 046]
      description: >
      inspect-docs の git 永続化要件（REQ-0109-040〜046）を追加。
      commit/push 義務、pull --ff-only、commit 対象 .agentdev/inspect/ のみ、commit message 形式。

  - ou_id: OU-003
    source_ru: RU-20260617-09
    target_req: REQ-0125
    operation: UPDATE
    scale: standard
    depends_on: [OU-001]
    recommended_order: 3
    issue_policy: single-issue
    result:
      saved_req: REQ-0125
      lines_updated: [007]
      lines_appended: [009, 010, 011, 012, 013, 014]
      description: >
      REQ-0125-007 の side-effect 定義を再定義（commit/push 禁止 → .agentdev/inspect/ 配下の永続化のみ許可）。
      REQ-0125-009〜012 として git 永続化要件を追加。
      OU-001 と整合させるため依存関係あり（REQ-0103-107/139 と REQ-0125-007 は重複定義の同期が必要）。

  - ou_id: OU-004
    source_ru: RU-20260617-09
    target_req: REQ-0126
    operation: APPEND
    scale: standard
    depends_on: []
    recommended_order: 4
    issue_policy: single-issue
    result:
      saved_req: REQ-0126
      lines_appended: [009, 010, 011, 012, 013, 014]
      description: >
      inspect-promote の git 永続化要件（REQ-0126-009〜014）を追加。
      promoted/archive/rejected 移動・inbox 削除を含む .agentdev/inspect/ 配下の変更の commit/push。

  - ou_id: OU-005
    source_ru: RU-20260617-09
    target_req: REQ-0107
    operation: APPEND
    scale: standard
    depends_on: []
    recommended_order: 5
    issue_policy: single-issue
    result:
      saved_req: REQ-0107
      lines_appended: [045]
      description: >
      REQ-NEW-D/E/F（完了報告 git 永続化結果、template 新設・更新要件）を配置。
      または各 inspect REQ に分散配置。req-save で最終配置先を確定。
```

## execution_groups

```yaml
execution_groups:
  - id: EG-001
    type: standard
    purpose: >
      inspect 系コマンドへの git 永続化フェーズ追加と learning-promote の --ff-only 統一に関する
      REQ 体系の整合的な更新。単一 req-save セッションで OU-001〜005 を一括実行し、
      単一 case-open → case-run で command/skill/template ファイルを一括実装する。
    included_ou: [OU-001, OU-002, OU-003, OU-004, OU-005]
    rationale: >
      全 OU が単一目的（.agentdev/ 配下の git 永続化の一貫性回復）に寄存する。
      REQ-0103 と REQ-0125 は重複定義の同期が必要なため同一セッションでの更新が必須。
      command/skill/template ファイルの変更は REQ 更新と密接に連動するため、
      同一 case での実装が自然。Epic 規模ではなく standard 規模。
```

## draft-meta

```yaml
draft-meta:
  work_type: feature
  req-operation:
    - target_req: REQ-0103
      operation: UPDATE
      lines: [107, 139, 120]
    - target_req: REQ-0109
      operation: APPEND
      new_lines: [040, 041, 042, 043]
    - target_req: REQ-0125
      operation: UPDATE+APPEND
      update_lines: [007]
      new_lines: [009, 010, 011, 012]
    - target_req: REQ-0126
      operation: APPEND
      new_lines: [009, 010, 011, 012]
    - target_req: REQ-0107
      operation: APPEND
      new_lines: [TBD]
  adr-required: false
  adr-rationale: >
    command 動作仕様・workflow 定義・運用ルールに該当（ADR作成禁止条件）。
    技術的決定を含まない。既存パターンの拡張。
  topic-slug: inspect-git-persistence
  scale: standard
  source_ru: RU-20260617-09
status: saved
  create-rationale: >
    CREATE 不要。全変更が既存REQ（REQ-0103, REQ-0109, REQ-0125, REQ-0126, REQ-0107）の
    UPDATE/APPENDで完結する。inspect 系コマンドの git 永続化は既存 command REQ の
    行動拡張であり、独立した新規要件ドメインではない。
  work_type-rationale: >
    RU は maintenance を想定したが、REQ ファイル修正が必要なため feature に確定。
    req-file-manager 規約「REQファイルの修正が必要な場合は feature 扱い」に従う。
    maintenance の場合 req-save がスキップされ REQ が更新されないため、feature が必須。
```

## QG-1 検証結果

| 検査観点 | 判定 | 備考 |
|----------|------|------|
| REQ/SPEC 分類 | pass | 全要件行は状態要件（振る舞い・制約・状態の宣言）。反映作業は関連ドキュメント更新候補へ分離済み |
| ADR ゲート | pass | ADR 不要（command 動作仕様・workflow 定義・運用ルール）。ADR禁止ゲート合格 |
| チェックボックス測可能性 | pass | 各要件行は検証可能（commit/push 実行有無、commit message 形式、pull 方式、template 存在有無等） |
| 必須セクション完全性 | pass | 目的・要件・適用範囲の3必須セクション存在。Requirement Source・関連ドキュメント更新候補・ADR判断・operation_units・execution_groups・draft-meta 含む |
| 分類ゲート（4-2） | pass | 反映作業（ファイル更新・新設）は要件行に含まず、関連ドキュメント更新候補へ移送済み |
| 文書分類妥当性（4-3） | pass | 全要件の対象文書種別は REQ。SPEC/ADR/guide への不正混入なし |
