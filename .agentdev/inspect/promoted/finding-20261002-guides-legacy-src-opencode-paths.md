# guides 3ファイルの旧 src/opencode/ 原本記述が DEC-049 と矛盾

- **分類**: inspect finding promote（F-01・severity high・confidence high）
- **由来**: inspect-docs finding 20261002T154006Z（backlog-auto stage 1）

## 観測（evidence・実測確認済み）

- `docs/guides/artifacts-and-state.md:24-25`「Command 配置先 `src/opencode/commands/agentdev/`、Skill `src/opencode/skills/agentdev-*`」
- `docs/guides/artifacts-and-state.md:63-76` ディレクトリ構造で「`src/opencode/` # 原本（正規の定義ファイル）」（:68）
- `docs/guides/troubleshooting.md:13`「原本は `src/opencode/commands/agentdev/`」
- `docs/guides/glossary.md:83-84,87` 同型の原本パス記述
- 実測: `src/opencode/commands/` は存在しない（正本は `src/common/commands/agentdev/`・`src/common/skills/agentdev-*`）

## 影響課題

読者を実在しないパスへ誘導する導線破断。承認済み Decision（DEC-049・2026-10-02 accepted・REQ-099）への下位文書矛盾。

## 対応候補

guides 3ファイルの原本パス記述を DEC-049 新構成（`src/common/` 正本・ホスト別接続領域）へ更新。`src/common/README.md`・`multi-host-operations.md`（新設・新構成整合済み）を参照形式の模範とする。

## 既存要件関連

DEC-049・REQ-099・accepted Design `multi-host-canonical-model.md`

## 統合注記（backlog-review での統合判定候補）

- intake promoted `2026-10-02-3318-wave1-remainder-installer-projection-and-archive-gates`（installer・archive 投影系）と同一主題〔旧 src/opencode 前提残存〕。対象ファイル違い（あちらは consumer-project-setup.md 明示）のため統合または依存整理を backlog-review で判定。
