# 変更前 grep 検索結果（WP-0 §4.1-4）

- 取得日時: 2026-08-06（worktree feature/issue-1925, baseline origin/main = 8f6558de）
- 取得環境: Windows PowerShell（Select-String / Get-Content 再帰スキャン）
- 用途: WP-1（`agent:` 必須契約の正常化）、WP-2（内部参照除去）の対象範囲特定証拠

## 1. 配布command の `agent:` 必須記述

検索: `Select-String -Path src\opencode\commands\agentdev\*.md -Pattern '^agent:' -SimpleMatch`

結果: **0件**

配布command の frontmatter に `agent:` 記述は存在しない。現在の frontmatter は `description` のみ（一部 README.md を除く）。

## 2. checker/test 内の `agent` 必須判定

検索: `Select-String -Path .opencode\skills\repo-agentdev-integrity\scripts\*.ts -Pattern 'agent' | Where mandatory|required|must|agent:|frontmatter`

`agent` 必須判定を担う実装箇所（WP-1 で `description` のみへ緩和する対象）:

| file | line | content |
|---|---|---|
| check_integrity.ts | 757 | `const required = ["description", "agent"];` |
| check_integrity.ts | 3230 | `const ALLOWED_FRONTMATTER_FIELDS = new Set(["description", "agent"]);` |
| check_integrity.ts | 3268 | `// v2:REQ-0108-098: agent must be known` |

これら 3 箇所が `agent` を必須/許容フィールドとして扱っており、配布command が `agent:` を持たないため 16件の `command-inventory` NG（"Missing frontmatter fields: agent"）を発生させている。WP-1 で `description` のみへ正規化する。

test 側（`check_integrity.test.ts` 等）には `agent:` を含む fixture が多数存在するが、これらは checker 挙動の回帰テスト用であり、WP-1 で checker が `agent` 必須を解除した際に併せて更新する。

## 3. `src/opencode/**` 内の内部 ID / パス参照

検索対象: `src/opencode/` 配下の 187 ファイル（*.md, *.ts）
検索パターン: `(REQ-[0-9]|ADR-[0-9]|IR-[0-9]|RU-[0-9]|docs/specs/|docs/adr/)`

### パターン別件数

| pattern | 件数 |
|---|---:|
| REQ-ID（REQ-NNNN） | 127 |
| docs/specs/ | 98 |
| docs/adr/ | 40 |
| IR-ID（IR-NNN） | 31 |
| RU-ID（RU-NNNN） | 24 |
| ADR-ID（ADR-NNNN） | 9 |
| **合計** | **329** |

### ファイル別件数（上位25件、WP-2 対象候補）

| file | 件数 |
|---|---:|
| src/opencode/commands/agentdev/spec-save.md | 21 |
| src/opencode/skills/agentdev-req-file-manager/scripts/tests/alloc-composite-id.test.ts | 19 |
| src/opencode/skills/agentdev-req-analysis/references/pass-criteria-writing-guide.md | 15 |
| src/opencode/skills/agentdev-adr-file-manager/SKILL.md | 12 |
| src/opencode/skills/agentdev-artifact-validation/scripts/tests/check-frontmatter-consistency.test.ts | 11 |
| src/opencode/commands/agentdev/req-define.md | 11 |
| src/opencode/commands/agentdev/backlog-review.md | 10 |
| src/opencode/commands/agentdev/case-auto.md | 10 |
| src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md | 10 |
| src/opencode/commands/agentdev/req-save.md | 10 |
| src/opencode/skills/agentdev-artifact-validation/scripts/tests/check-entry-existence.test.ts | 10 |
| src/opencode/skills/agentdev-case-run-execution-adapter/SKILL.md | 8 |
| src/opencode/skills/agentdev-learning-pipeline/SKILL.md | 7 |
| src/opencode/skills/agentdev-artifact-validation/scripts/tests/check-change-impact.test.ts | 7 |
| src/opencode/commands/agentdev/case-open.md | 7 |
| src/opencode/skills/agentdev-doc-map/SKILL.md | 6 |
| src/opencode/skills/agentdev-inspect-skills/SKILL.md | 6 |
| src/opencode/skills/agentdev-spec-file-manager/SKILL.md | 5 |
| src/opencode/skills/agentdev-inspect-skills/references/execution-subject-misclassification.md | 5 |
| src/opencode/skills/agentdev-doc-writing/references/japanese-replacement-dictionary.md | 5 |
| src/opencode/commands/agentdev/case-run.md | 5 |
| src/opencode/commands/agentdev/inspect-docs.md | 5 |
| src/opencode/skills/agentdev-inspect-skills/references/skill-frontmatter-name-backtick.md | 5 |
| src/opencode/skills/agentdev-req-analysis/references/investigation-scope-refinement.md | 4 |
| src/opencode/commands/agentdev/inspect-skills.md | 4 |

備考: test 系ファイル（`*.test.ts`）の参照は checker 自身の回帰テスト用であり、WP-2 では配布 command/SKILL/reference の参照除去が主対象。test 側は checker 改修に追従させる。

## 4. superseded ADR の現行根拠参照

検索対象: `docs/adr/*.md` および `docs/adr/README.md`
検索パターン: `supersed|superced|status.*supersed`

### ADR status 一覧

| ADR | status |
|---|---|
| ADR-001 | accepted |
| ADR-002 | accepted |
| ADR-003 | accepted |
| ADR-004 | accepted |
| ADR-005 | **superseded**（superseded_by: ADR-006） |
| ADR-006 | accepted（supersedes: ADR-005） |

### superseded 関係

- ADR-005（Project Extensions Architecture）は ADR-006 により superseded。
- ADR-006 が ADR-005 に取って代わる現行根拠（inspect-extensions 廃止、extension 3層意味構造への統合）。
- この supersede 関係は整合している（循環参照や宙に浮いた superseded ADR なし）。

### 備考

- v2 系 superseded/deprecated ADR（v2:ADR-0111, v2:ADR-0113, v2:ADR-0126）は v2.11.0 以前に整理済み（README.md L135 注記）。tag v2.11.0 参照。
- WP-1 では ADR status 表記の正常化（old-status-vocabulary, accepted-adr-only-citation 等）を扱うが、supersede 構造自体は維持する。
