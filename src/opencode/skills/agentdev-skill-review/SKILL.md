---
name: agentdev-skill-review
description: Diagnoses Command to Skill reference validity and Skill structure without changing files. USE FOR: diagnosing Command→Skill reference validity, evaluating skill granularity, reviewing skill structure. DO NOT USE FOR: modifying files, creating issues, executing fixes.
---

# Skill Review

Command→Skill 参照妥当性、Skill 粒度、Skill 構造を read-only で診断する。修正は実行せず、finding、分類、根拠、推奨 route を提示する。

## Read-Only 制約

- ファイル変更、Issue 作成、PR 作成、RU 保存、commit、push を行わない
- 診断結果はセッション内テキストで提示する
- 修正案は route として提示し、実装・保存・自動整形は行わない

## 診断観点

| 観点 | 確認内容 |
|------|----------|
| USE FOR 照合 | Command の用途が参照 Skill の `USE FOR` に含まれるか |
| DO NOT USE FOR 回避 | Command の用途が参照 Skill の `DO NOT USE FOR` に衝突していないか |
| Skill 全体参照妥当性 | Command が Skill 全体の再利用可能な判断基準を参照しているか |
| references/* 段階的開示妥当性 | 詳細手順・長い表・具体例が必要時参照に分離されているか |
| Skill 分割候補 | 複数の独立責務が単一 Skill に混在していないか |
| Command 固有手順の Skill 流入 | 特定 Command の Step 番号、Phase、局所手順が Skill に入っていないか |
| 出力本文の Command/Skill 混入 | 固定文言や出力テンプレートが Command / Skill 本文に混在していないか |
| 決定的検査の Script 化可否 | 同じ入力で同じ結果になる検査が script に分離可能か |
| 操作安全手順の配置 | git、gh、worktree などの安全手順が適切な operation Skill に置かれているか |
| canonical Skill name 使用 | Skill 参照が正式な `agentdev-*` 名で記述されているか |
| Skill 内部構造依存 | Command が Skill 内の見出し、Step、protocol 名に依存していないか |

## 診断分類

| ラベル | 意味 |
|--------|------|
| full-skill-needed | Command から Skill 全体への参照が妥当 |
| reference-disclosure-needed | Skill 本文から references/* への抽出が必要 |
| split-skill-candidate | Skill 分割を検討すべき責務混在がある |
| command-local-responsibility | Command 固有手順として Command 側に置くべき |
| template-local-responsibility | 固定文言・出力構造として template 側に置くべき |
| script-candidate | 決定的検査として script 化を検討すべき |
| operation-skill-reference | git、gh、worktree など operation Skill 参照が妥当 |
| wrong-skill-reference | 参照先 Skill が用途に合っていない |
| do-not-use-for-conflict | 参照用途が参照 Skill の除外条件に衝突している |
| canonical-name-violation | canonical Skill name ではない参照がある |
| skill-internal-reference-leak | Command が Skill 内部構造に依存している |

## 判定ルール

1. Command は公開 API、入力、出力、guardrail、高レベル導線を保持する
2. Skill は複数 Command で再利用できる判断基準、分類、プロトコルを保持する
3. Template は固定文言、出力構造、プレースホルダーを保持する
4. Script は決定的でテスト可能な検査や変換を保持する
5. references/* は Skill 本文を軽くするための必要時参照に限定する
6. Command から Skill を参照する場合は Skill 名までに留め、内部見出しや Step 名を参照しない
7. `USE FOR` に合致し、`DO NOT USE FOR` に衝突しない参照のみ妥当とする

## Seed Cases

初期レビューでは次の既知候補を優先的に確認する。候補は確定 finding ではなく、実ファイル読込後に判定する。

| 対象 | 参照先 | 初期分類候補 |
|------|--------|--------------|
| case-open | agentdev-workflow-lifecycle | full-skill-needed |
| intake-from-github | agentdev-intake-pipeline | full-skill-needed |
| intake-promote | agentdev-intake-pipeline | full-skill-needed |
| req-define | agentdev-req-file-manager | reference-disclosure-needed |
| agentdev-gh-cli | agentdev-gh-cli | reference-disclosure-needed |
| case-run | agentdev-workflow-orchestration | full-skill-needed |
| learning-promote | agentdev-learning-pipeline | full-skill-needed |

## 出力形式

各 finding は次の形で報告する。

```markdown
- Finding: [短い説明]
- Target: [Command または Skill]
- Classification: [診断分類ラベル]
- Evidence: [根拠となる参照・本文要約]
- Recommended route: [command / skill / references / template / script / operation skill]
```

## See Also

- **agentdev-skill-authoring**: Skill authoring quality criteria
- **agentdev-command-authoring**: Command definition conventions
