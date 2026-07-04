---
name: agentdev-inspect-skills
description: Diagnoses Command to Skill reference validity, Skill structure, and execution subject classification without changing files. USE FOR: diagnosing Command→Skill reference validity, evaluating skill granularity, reviewing skill structure, detecting execution subject misclassification (command/harness/subagent referred to as skill), detecting SPEC operation contract table vs agentdev-gh-cli/references/contracts.md field inconsistency, detecting YAML-invalid backtick quoting in SKILL.md frontmatter `name:` field. DO NOT USE FOR: modifying files, creating issues, executing fixes.
---

# Inspect Skills

Command→Skill 参照妥当性、Skill 粒度、Skill 構造、実行主体分類を検査対象（Command/Skill 定義ファイル）を直接修正せずに診断する。
修正は実行せず、検出事項、分類、根拠、推奨 route を提示する。

## skill extension 参照方針

本スキルは以下の方針に従う（ADR-0135）。

1. **前提とする固定知識の範囲**: docs/ ディレクトリ構成（requirements/adr/specs）と DOC-MAP.md のみを前提とし、`docs/specs/**` 内部構成（`foundations`, `responsibilities` 等）は仮定しない
2. **extension の読込契約**: 呼び出し元コマンドから渡された解決済み文脈を優先し、不足分のみ skill extension（`.agentdev/extensions/skills/agentdev-inspect-skills.yaml`）を読む。skill extension はスキル単位で1ファイルに集約し、reference ごとの extension は作らない
3. **`docs/specs/**` 内部パスの固定知識化の禁止**: extension に列挙されていない `docs/specs/**` 内部パスを固定知識として参照しない。スキル本文・references に具体的な project docs 内部パス（`docs/specs/{foundations,responsibilities,quality,integrity,local,authoring,commands,skills,workflows}/**`）を直接記述しない
4. **extension 未配置時の挙動**: skill extension が存在しない場合は標準動作で続行し、推測で docs を読みに行かない

## 検査対象を直接修正しない制約

- ファイル変更（canonical docs、REQ/ADR/SPEC、Command/Skill/Template/Script）、Issue 作成、PR 作成、RU 保存、branch/ worktree 操作を行わない。許可される副作用は `.agentdev/inspect/inbox/inspect-skills-finding-{topic}.md` の生成、および `.agentdev/inspect/` 配下の git 永続化（commit/ push）のみ
- 診断結果はセッション内テキストで提示する
- 修正案は route として提示し、実装、保存、自動整形は行わない

## 検出事項のエクスポート

診断結果を `inspect-promote` に引き継ぐ必要がある場合、`.agentdev/inspect/inbox/inspect-skills-finding-{topic}.md` に検出事項を書き出すことができる。
この検出事項は inspect lifecycle（`.agentdev/inspect/` inbox/promoted/archive）の対象であり、`inspect-promote` への参照専用中間成果物である。

検出事項には以下を含める:
- 概要（Summary）
- 対象範囲（Scope）
- 検出事項（Findings: id, target, classification, evidence, recommended_route, confidence, unresolved_questions）
- 初期是正方針（Initial Remediation Direction）
- 対象外（Out of Scope）
- 推奨 intake/ learning route

## 診断観点

| 観点 | 確認内容 |
|------|----------|
| USE FOR 照合 | Command の用途が参照 Skill の `USE FOR` に含まれるか |
| DO NOT USE FOR 回避 | Command の用途が参照 Skill の `DO NOT USE FOR` に衝突していないか |
| Skill 全体参照妥当性 | Command が Skill 全体の再利用可能な判断基準を参照しているか |
| references/* 段階的開示妥当性 | 詳細手順、長い表、具体例が必要時参照に分離されているか |
| Skill 分割候補 | 複数の独立責務が単一 Skill に混在していないか |
| Command 固有手順の Skill 流入 | 特定 Command の Step 番号、Phase、局所手順が Skill に入っていないか |
| 出力本文の Command/Skill 混入 | 固定文言や出力テンプレートが Command/ Skill 本文に混在していないか |
| 決定的検査の Script 化可否 | 同じ入力で同じ結果になる検査が script に分離可能か |
| 操作安全手順の配置 | git、gh、worktree などの安全手順が適切な operation Skill に置かれているか |
| canonical Skill name 使用 | Skill 参照が正式な `agentdev-*` 名で記述されているか |
| Skill 内部構造依存 | Command が Skill 内の見出し、Step、protocol 名に依存していないか |
| 配布物 frontmatter 構文健全性 | 配布物（`src/opencode/commands/agentdev/`、`src/opencode/skills/agentdev-*/`）の Markdown frontmatter が重複、破損していないか（docs-spec-rebuild-integrity SPEC 構文健全性検査パターン準拠） |
| 配布物見出し構文健全性 | 配布物の H1/H2 等の主要見出しが同一文書内で意図せず重複していないか（同上） |
| 配布物 Markdown 構文破損 | 配布物に正規表現破損、未対応フェンス、不正インラインコード等の Markdown 構文破損がないか（同上） |
| 配布物壊れた括弧、参照残骸 | 配布物に ID 除去で残った壊れた括弧（例: `（OU-XXX/）`、`（）`、`（/）`）、壊れた参照表現、主語/目的語欠落文がないか（同上文意保持検査パターン準拠） |
| command-skill 責務説明矛盾 | 同一 Command の責務説明が Command 本体と関連 Skill 間で矛盾していないか（同上責務整合検査パターン準拠） |
| 実行主体分類の誤認 | 文書内で言及される実行主体（command / skill / subagent / harness）の分類が正確か。誤認（command を skill と呼ぶ、harness を skill と呼ぶ、subagent を skill と呼ぶ、`load_skills` に command 名を指定）を検出する（REQ-0125-010）。判定基準の詳細は [execution-subject-misclassification.md](references/execution-subject-misclassification.md) |
| gh 直接記述の委譲漏れ | 配布物（`src/opencode/commands/agentdev/*.md`、`src/opencode/skills/agentdev-*/**/*.md`）で `gh (issue|pr) (create|edit|view|comment|merge|close|list|status)` の直接記述を検出する（REQ-0149）。command/skill は GitHub I/O を `agentdev-gh-cli` 手続きへ委譲し、gh コマンド直接実行を保持しない。ただし `agentdev-gh-cli/references/standard-procedures.md`（REQ-0149-003 許容ファイル）は除外する。スキャン対象、除外対象の詳細は agentdev-gh-cli SPEC「gh 直接記述の検出スコープ」参照 |
| SPEC 操作契約テーブル ↔ agentdev-gh-cli/references/contracts.md フィールド一致性 | SPEC 側に記載された操作契約テーブル（`## 操作契約` セクション）のフィールド集合と、対応する `agentdev-gh-cli/references/contracts.md` のフィールド集合が過不足なく一致することを検出する（REQ-0125-011 / AG-003）。手続き集合、手続き名、入力、出力の一致を確認し、不一致を検出事項として報告する。判定基準の詳細、対象 SPEC 範囲、フィールド対応規則は [spec-operation-contract-consistency.md](references/spec-operation-contract-consistency.md) 参照（REQ-0125-004 準拠）。単一情報源化（生成スクリプト、ビルドステップ）は導入せず、検出のみとする（CR-001） |
| SKILL.md frontmatter `name:` バッククォート検出 | 配布物（`src/opencode/skills/agentdev-*/SKILL.md`）の frontmatter `name:` 行がバッククォートで囲まれている場合、YAML スカラー値として不正のため strict 違反候補として検出する（REQ-0125-003 準拠、PR #1334 事例）。frontmatter は構造データであり Markdown インラインコード表記の対象外（backticks-identifier-threshold SPEC「適用対象外」準拠）。検出基準の詳細、IR-007（skill-name-dir-match）との協調は [skill-frontmatter-name-backtick.md](references/skill-frontmatter-name-backtick.md) 参照 |

## NG 分類

配布物整合性検査（docs-spec-rebuild-integrity SPEC 準拠）で検出した事項には以下の NG 分類を付ける。各分類の定義、後続対象は同 SPEC の NG 分類表に従う:

| 分類 | 意味 |
|------|------|
| false positive | 検査ルールの誤検知 |
| pre-existing | 今回の変更以前から存在する既知の問題 |
| 今回修正対象 | 今回の変更で導入、残存した問題 |

## 診断分類

| ラベル | 意味 |
|--------|------|
| full-skill-needed | Command から Skill 全体への参照が妥当 |
| reference-disclosure-needed | Skill 本文から references/* への抽出が必要 |
| split-skill-candidate | Skill 分割を検討すべき責務混在がある |
| command-local-responsibility | Command 固有手順として Command 側に置くべき |
| template-local-responsibility | 固定文言、出力構造として template 側に置くべき |
| script-candidate | 決定的検査として script 化を検討すべき |
| operation-skill-reference | git、gh、worktree など operation Skill 参照が妥当 |
| wrong-skill-reference | 参照先 Skill が用途に合っていない |
| do-not-use-for-conflict | 参照用途が参照 Skill の除外条件に衝突している |
| canonical-name-violation | canonical Skill name ではない参照がある |
| skill-internal-reference-leak | Command が Skill 内部構造に依存している |
| execution-subject-misclassification | 実行主体（command / skill / subagent / harness）の分類が誤っている（command を skill と呼ぶ、`load_skills` に command 名を指定、harness を skill と呼ぶ、subagent を skill と呼ぶ等） |
| gh-direct-invocation-leak | command/skill が `agentdev-gh-cli` へ委譲すべき gh 直接記述（`gh (issue|pr) (create|edit|view|comment|merge|close|list|status)`）を保持している（REQ-0149）。許容ファイル `agentdev-gh-cli/references/standard-procedures.md` は除外 |
| spec-operation-contract-consistency | SPEC 操作契約テーブルと agentdev-gh-cli/references/contracts.md の手続き集合、手続き名、入力、出力が過不足なく一致していない（REQ-0125-011 / AG-003）。判定基準の詳細は [spec-operation-contract-consistency.md](references/spec-operation-contract-consistency.md) 参照 |
| skill-frontmatter-name-backtick | SKILL.md frontmatter `name:` 行がバッククォートで囲まれており、YAML スカラー値として不正（REQ-0125-003 準拠、PR #1334 事例）。バッククォート付き name はディレクトリ名と不一致となるため IR-007（skill-name-dir-match）違反と併発する可能性が高い。判定基準の詳細は [skill-frontmatter-name-backtick.md](references/skill-frontmatter-name-backtick.md) 参照 |

## 判定ルール

1. Command は公開 API、入力、出力、guardrail、高レベル導線を保持する
2. Skill は複数 Command で再利用できる判断基準、分類、プロトコルを保持する
3. Template は固定文言、出力構造、プレースホルダーを保持する
4. Script は決定的でテスト可能な検査や変換を保持する
5. references/* は Skill 本文を軽くするための必要時参照に限定する
6. Command から Skill を参照する場合は Skill 名までに留め、内部見出しや Step 名を参照しない
7. `USE FOR` に合致し、`DO NOT USE FOR` に衝突しない参照のみ妥当とする

## 初期確認候補

初期レビューでは次の既知候補を優先的に確認する。
候補は確定した検出事項ではなく、実ファイル読込後に判定する。

| 対象 | 参照先 | 初期分類候補 |
|------|--------|--------------|
| case-open | `agentdev-workflow-lifecycle` | full-skill-needed |
| intake-from-github | `agentdev-intake-pipeline` | full-skill-needed |
| intake-promote | `agentdev-intake-pipeline` | full-skill-needed |
| req-define | `agentdev-req-file-manager` | reference-disclosure-needed |
| `agentdev-gh-cli` | `agentdev-gh-cli` | reference-disclosure-needed |
| case-run | `agentdev-workflow-orchestration` | full-skill-needed |
| learning-promote | `agentdev-learning-pipeline` | full-skill-needed |

## 出力形式

各検出事項は次の形で報告する。

```markdown
- Finding: [短い説明]
- Target: [Command または Skill]
- Classification: [診断分類ラベル]
- Evidence: [根拠となる参照・本文要約]
- Recommended route: [command / skill / references / template / script / operation skill]
```

## See Also

- **agentdev-skill-authoring**: スキルオーサリングの品質基準
- **agentdev-command-authoring**: コマンド定義の規約
- **agentdev-doc-writing**: 実行主体分類の査読観点（doc-writing は意味的査読、inspect-skills は診断観点。原本は document-type-responsibilities SPEC「実行主体分類の査読基準」）
- **integrity-rule-catalog SPEC**: 機械判定可能な境界違反ルール（IR-050、IR-051、REQ-0108-261 準拠）

