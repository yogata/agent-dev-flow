# Intake Item: agentdev-gh-cli 手続き拡張 (PR 変更ファイル一覧 / mergeable 状態取得)

## 発生源

- PR: #1523 (Issue #1517 / OU-002, Epic #1515 Wave 1)
- 発生 phase: case-run 委譲表現化の副作用分析
- capture 分類: intake (具体的修正対象 = agentdev-gh-cli SKILL)

## 問題

case-close.md の委譲表現化 (OU-002) に伴い、「PR 変更ファイル一覧取得」「PR mergeable 状態取得」の 2 手続きが agentdev-gh-cli SKILL.md の手続き一覧 (Issue 作成/Issue 本文読込/Issue 本文更新/Issue コメント追加/PR 作成/PR 本文読込/PR merge/Issue close) に存在しないことが判明。

REQ-0152-003 は「PR 状態取得処理は agentdev-gh-cli への委譲表現を使用」を定めるが、委譲先手続きが SKILL で未定義。PR #1523 は case-close.md 側の直接呼出除去 (TS-005 pass) に留め、agentdev-gh-cli 側の手続き追加は未実施。

## 推奨修正対象

src/opencode/skills/agentdev-gh-cli/SKILL.md の手続き一覧へ以下を追加:

1. **PR 変更ファイル一覧取得**: `gh pr view {N} --json files` を安全な読み取り手続き (Node.js execSync) で実行
2. **PR mergeable 状態取得**: `gh pr view {N} --json mergeable,mergeStateStatus` を同様に実行
3. references/contracts.md へ操作契約 (引数・戻り値) を追記
4. references/standard-procedures.md へ具体実装を追記

## 関連

- Issue: #1517 (CLOSED)
- PR: #1523
- REQ: REQ-0152-003, REQ-0149
- SKILL: agentdev-gh-cli
