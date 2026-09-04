---
name: agentdev-inspect-skills
description: Diagnoses Command to Skill reference validity, Skill structure, execution subject classification, and semantic integrity across Command/Skill definitions without changing files. USE FOR: reference validity diagnosis, skill granularity and structure review, execution subject misclassification detection, semantic duplication/contradiction/contract-missing detection, stale references in distributions. DO NOT USE FOR: modifying files, creating issues, executing fixes.
---

# Inspect Skills

Command→Skill 参照妥当性、Skill 粒度、Skill 構造、実行主体分類を検査対象とし、Command/Skill 定義ファイルを直接修正せずに診断する。
修正は実行せず、検出事項、分類、根拠、推奨経路を提示する。

## 検査対象を直接修正しない制約

- ファイル変更（canonical docs、REQ/ADR/Design、Command/Skill/Template/Script）、Issue 作成、PR 作成、RU 保存、branch/ worktree 操作を行わない。許可される副作用は `.agentdev/inspect/inbox/inspect-skills-finding-{topic}.md` の生成、および `.agentdev/inspect/` 配下の git 永続化（commit/ push）のみ
- 診断結果はセッション内テキストで提示する
- 修正案は経路として提示し、実装、保存、自動整形は行わない

## 検出事項のエクスポート

診断結果を `inspect-promote` に引き継ぐ必要がある場合、`.agentdev/inspect/inbox/inspect-skills-finding-{topic}.md` に検出事項を書き出すことができる。
この検出事項は inspect ライフサイクル（`.agentdev/inspect/` inbox/promoted）の対象であり、`inspect-promote` への参照専用中間成果物である。

検出事項には以下を含める:
- 概要（Summary）
- 対象範囲（Scope）
- 検出事項（Findings: id, target, classification, evidence, recommended_route, confidence, unresolved_questions）
- 初期是正方針（Initial Remediation Direction）
- 対象外（Out of Scope）
- 推奨 intake/ learning route

## cleanup モデルへの適用経路

document-model Design（extension 経由）「恒久基準と非規範情報の整理」は、非規範情報を整理する cleanup モデル（6処置: KEEP、MERGE、REFERENCE、MOVE、RETIRE、INFERENCE）を所有し、処置の実行を inspect-docs / inspect-skills / 専用の cleanup 作業へ割り当てる。
本スキルは配布物（Command/Skill 定義）の診断において、この適用経路に組み込まれる。
配布物に cleanup モデルの対象カテゴリ（規範または非規範の地位が未宣言の references、移行証跡、リリース証跡等）に該当する記述を検出した場合は、6処置の候補を検出事項の推奨 route に併記して提示する。
処置に伴うファイル変更は行わない（検査対象を直接修正しない制約に従う）。
cleanup モデルと処置契約の SSoT は document-model Design であり、本スキルは再定義しない。

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
| 配布物 frontmatter 構文健全性 | 配布物（`.opencode/commands/agentdev/`、`.opencode/skills/agentdev-*/`）の Markdown frontmatter が重複、破損していないか（docs-spec-rebuild-integrity Design 構文健全性検査パターン準拠） |
| 配布物見出し構文健全性 | 配布物の H1/H2 等の主要見出しが同一文書内で意図せず重複していないか（同上） |
| 配布物 Markdown 構文破損 | 配布物に正規表現破損、未対応フェンス、不正インラインコード等の Markdown 構文破損がないか（同上） |
| 配布物壊れた括弧、参照残骸 | 配布物に ID 除去で残った壊れた括弧（例: `（OU-XXX/）`、`（）`、`（/）`）、壊れた参照表現、主語/目的語欠落文がないか（同上文意保持検査パターン準拠） |
| command-skill 責務説明矛盾 | 同一 Command の責務説明が Command 本体と関連 Skill 間で矛盾していないか（同上責務整合検査パターン準拠） |
| 実行主体分類の誤認 | 文書内で言及される実行主体（command / skill / subagent / harness）の分類が正確か。誤認（command を skill と呼ぶ、harness を skill と呼ぶ、subagent を skill と呼ぶ、`load_skills` に command 名を指定）を検出する（REQ）。判定基準の詳細は [execution-subject-misclassification.md](references/execution-subject-misclassification.md) |
| gh 直接記述の委譲漏れ | 配布物（`.opencode/commands/agentdev/*.md`、`.opencode/skills/agentdev-*/**/*.md`）で `gh (issue|pr) (create|edit|view|comment|merge|close|list|status)` の直接記述を検出する（REQ）。command/skill は GitHub I/O を Custom Tool `agentdev_gh` の操作へ委譲する（gh WRITE 直接実行の保持は禁止。読み取り系は Design custom-tool-contracts「迂回防止」の許容範囲に従う）。スキャン対象、除外対象の詳細は `IR-{NNN}` の定義参照 |
| Custom Tool 操作契約整合 | Design `custom-tool-contracts.md` の対象操作（初期セット10操作）と `src/opencode/tools/agentdev-gh/contracts.ts` の操作カタログが過不足なく一致することを検出する（REQ / AG-{NNN}）。操作集合、操作名、入力、出力の一致を確認し、不一致を検出事項として報告する。判定基準の詳細、対象 Design 範囲、フィールド対応規則は [spec-operation-contract-consistency.md](references/spec-operation-contract-consistency.md) 参照（REQ 準拠）。単一情報源化（生成スクリプト、ビルドステップ）は導入せず、検出のみとする（CR-{NNN}） |
| SKILL.md frontmatter `name:` バッククォート検出 | 配布物（`.opencode/skills/agentdev-*/SKILL.md`）の frontmatter `name:` 行がバッククォートで囲まれている場合、YAML スカラー値として不正のため strict 違反候補として検出する（REQ 準拠、PR #1334 事例）。frontmatter は構造データであり Markdown インラインコード表記の対象外（backticks-identifier-threshold Design「適用対象外」準拠）。検出基準の詳細、`IR-{NNN}`（skill-name-dir-match）との協調は [skill-frontmatter-name-backtick.md](references/skill-frontmatter-name-backtick.md) 参照 |
| 廃止 REQ/Design 由来の記述残置 | 配布物（`.opencode/commands/agentdev/`、`.opencode/skills/agentdev-*/**`）に retired REQ/Design ID（`docs/requirements/retired/`、`docs/designs/retired/` 等）をソースとした記述が残置していないか。retired REQ/Design ID をキーとした横断検索で検出する。活性 REQ/Design（現行セット）への言及は対象外とする |
| 意味的重複 | 同一の契約、手順、判定基準が複数の配布物で再定義されているかを検出する。同一契約再定義抑止の原則に照らして検出する。artifact-responsibilities Design が定める重複許容基準に合致し正の情報源が明示された場合は対象外。判定基準の詳細、検出手順、報告例は [semantic-diagnostic-perspectives.md](references/semantic-diagnostic-perspectives.md) 参照 |
| 意味的矛盾 | Command と Skill 間で工程、状態、責務、停止条件の意味が矛盾していないかを検出する。正規な定義元の原則および同一契約再定義抑止の原則に照らして検出する。判定基準の詳細、検出手順、報告例は [semantic-diagnostic-perspectives.md](references/semantic-diagnostic-perspectives.md) 参照 |
| 正規な定義元からの逸脱 | 各責務が artifact-responsibilities Design のマッピングに照らして正規な定義元（配布 Command / Skill / references / script / harness 側文書 / REQ-ADR-SPEC のいずれか）に置かれているかを検出する。正規な定義元の原則に照らして検出する。責務越境（Command に Skill 要素、Skill に Command 固有手順、Template/Script の責務越境等）を含む。判定基準の詳細、検出手順、報告例は [semantic-diagnostic-perspectives.md](references/semantic-diagnostic-perspectives.md) 参照 |
| セマンティクス欠落 | 疎結合化、抽象化、縮約により、意味、条件、成果物契約（入力、前提、停止条件、適用境界、出力等）が欠落していないかを検出する。同一契約再定義抑止の原則に照らして検出する。判定基準の詳細、検出手順、報告例は [semantic-diagnostic-perspectives.md](references/semantic-diagnostic-perspectives.md) 参照 |
| 文章品質（診断時） | 配布物（`.opencode/commands/agentdev/*.md`、`.opencode/skills/agentdev-*/**/*.md`）に文章品質違反（メタ指示残留、未完結文、不自然な英語混在、規範宣言の濫用、名詞連結、一文への条件過剰連結）がないかを検出する（配布物の文章品質契約 REQ）。判定基準は doc-writing 査読観点と同一基準。検出対象の定義は Design agentdev-inspect-skills「文章品質観点（診断時）」参照 |
| 決定的破損（診断時） | 配布物に決定的破損（Markdown 構造破損、制御文字混入、不正な Unicode 文字、意図しない異言語文字、既知形式の参照残骸）がないかを検出する（配布物の文章品質契約 REQ）。Markdown 構造破損の内訳（見出し階層不整合、未閉鎖コードブロック、壊れたリンク、壊れたコードスパン、強調記法の破損）を検出対象とする。検出対象の定義は Design agentdev-inspect-skills「文章品質観点（診断時）」参照。配布物構文健全性系の既存観点と重複する項目は文章品質契約由来の検出対象として併せて適用する（既存観点の変更ではない） |

## NG 分類

配布物整合性検査（docs-spec-rebuild-integrity Design 準拠）で検出した事項には以下の NG 分類を付ける。各分類の定義、後続対象は同 Design の NG 分類表に従う:

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
| gh-direct-invocation-leak | command/skill が Custom Tool `agentdev_gh` 経由であるべき箇所に gh 直接記述（`gh (issue|pr) (create|edit|view|comment|merge|close|list|status)`）を保持している（REQ） |
| spec-operation-contract-consistency | Design custom-tool-contracts.md と Tool の contracts.ts の操作集合、操作名、入力、出力が過不足なく一致していない（REQ / AG-{NNN}）。判定基準の詳細は [spec-operation-contract-consistency.md](references/spec-operation-contract-consistency.md) 参照 |
| skill-frontmatter-name-backtick | SKILL.md frontmatter `name:` 行がバッククォートで囲まれており、YAML スカラー値として不正（REQ 準拠、PR #1334 事例）。バッククォート付き name はディレクトリ名と不一致となるため `IR-{NNN}`（skill-name-dir-match）違反と併発する可能性が高い。判定基準の詳細は [skill-frontmatter-name-backtick.md](references/skill-frontmatter-name-backtick.md) 参照 |
| semantic-duplication | 同一の契約、手順、判定基準が複数の配布物で再定義されている（同一契約再定義抑止の原則違反）。artifact-responsibilities Design の重複許容基準に合致し正の情報源が明示された場合は対象外。判定基準の詳細は [semantic-diagnostic-perspectives.md](references/semantic-diagnostic-perspectives.md) 参照 |
| semantic-contradiction | Command と Skill 間で工程、状態、責務、停止条件の意味が矛盾している（正規な定義元の原則、同一契約再定義抑止の原則の違反）。判定基準の詳細は [semantic-diagnostic-perspectives.md](references/semantic-diagnostic-perspectives.md) 参照 |
| canonical-definition-deviation | 各責務が正規な定義元（配布 Command / Skill / references / script / harness 側文書 / REQ-ADR-SPEC）に置かれておらず、責務越境が発生している（正規な定義元の原則違反）。判定基準の詳細は [semantic-diagnostic-perspectives.md](references/semantic-diagnostic-perspectives.md) 参照 |
| semantic-contract-missing | 疎結合化、抽象化、縮約により、意味・条件・成果物契約（入力、前提、停止条件、適用境界、出力等）が欠落している（同一契約再定義抑止の原則違反）。判定基準の詳細は [semantic-diagnostic-perspectives.md](references/semantic-diagnostic-perspectives.md) 参照 |

## 判定ルール

1. Command は公開 API、入力、出力、ガードレール、高レベル導線を保持する
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
| case-run | `agentdev-workflow-orchestration` | full-skill-needed |
| learning-promote | `agentdev-learning-pipeline` | full-skill-needed |

## 出力形式

検出事項の報告形式は次の3要素（診断レポート: セッション内テキスト、検出事項リスト: 対象・観点・分類・根拠・推奨経路、検出事項ファイル: `.agentdev/inspect/inbox/inspect-skills-finding-{topic}.md`）に適合させる。
セッション内テキストによる診断レポートは本セクション形式で提示し、検出事項ファイルへのエクスポートは「検出事項のエクスポート」セクションに従う。

各検出事項は次の形で報告する（「検出事項リスト」形式: 対象・観点・分類・根拠・推奨経路）。

```markdown
- Finding: [短い説明]
- Target: [Command または Skill]
- Perspective: [診断観点名（例: 意味的重複、実行主体分類の誤認、Skill frontmatter 整合 等）]
- Classification: [診断分類ラベル]
- Evidence: [根拠となる参照・本文要約]
- Recommended route: [command / skill / references / template / script / operation skill]
```

## See Also

- **agentdev-skill-authoring**: スキルオーサリングの品質基準
- **agentdev-command-authoring**: コマンド定義の規約
- **agentdev-doc-writing**: 実行主体分類の査読観点（doc-writing は意味的査読、inspect-skills は診断観点。原本は document-type-responsibilities Design「実行主体分類の査読基準」）
- **integrity-rule-catalog Design**: 機械判定可能な境界違反ルール（IR-{NNN}、IR-{NNN}、REQ 準拠）
