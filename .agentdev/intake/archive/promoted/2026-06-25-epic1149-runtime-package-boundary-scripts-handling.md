# runtime-package-boundary SPEC の scripts/ 配布取り扱い不足

## 観測

PR #1154 (Issue #1151) で `src/opencode/skills/agentdev-req-file-manager/scripts/` 配下に決定的TypeScriptスクリプト群が新設された。これにより agent-dev-flow リポジトリに JS エコシステムの成果物（`package.json`, `tsconfig.json`, `bun.lock`, `node_modules/`, `tests/*.test.ts`）が初めて導入された。

`docs/specs/runtime-package-boundary.md` は consumer プロジェクトへの配布境界を定義するが、`scripts/` 配下、`node_modules/`、`bun.lock` の配布対象・配布方法（含めるか除外するか）に言及がない。grep で `scripts`, `node_modules`, `bun`, `package.json`, `tsconfig` すべて 0 件。

## 今回扱わない理由

Issue #1151 の完了条件は「スクリプト群作成 + SKILL.md scriptsセクション新設（ACT-SPEC-005）」であり、配布境界 SPEC の更新はスコープ外。PR #1154 の `## Findings / Capture候補` および `## SPEC確定候補` に「runtime-package-boundary に scripts/ 配下の取り扱い追記が必要か」として記録済み。本項は配布境界設計の判断事項（bun.lock を配布物に含めるか、node_modules は .gitignore 対象か等）を含むため、個別の SPEC 更新課題として整理すべき。

## 影響

- consumer プロジェクト（AgentDevFlow 導入先）が `scripts/` 配下を配布物として受け取るか不明確
- `bun.lock` の配布可否が未定義（再現性のある実行環境保証とのトレードオフ）
- `node_modules/` は runtime 生成物だが配布境界 SPEC で明示的に除外指定がない
- 今後 `scripts/` 配下を持つ skill が増加する可能性（design-principles.md 第5節「Scriptは決定的処理を担う」原則の実装拡大）

## レビューで決めること

- `scripts/` 配下（`package.json`, `tsconfig.json`, `bun.lock`, `src/`, `tests/`, `lib/`）を配布対象に含めるか
- `node_modules/` の配布除外を SPEC に明記するか（runtime 生成物位置づけ）
- consumer プロジェクトでの `bun install` 実行を前提とするか、それ以外の実行方式（コンパイル済み配布等）を採用するか
- `docs/specs/skills/agentdev-req-file-manager.md` に scripts/ の I/O 契約を SPEC として確定するか（SKILL.md 記載との二重工管理になるか）

## 根拠

- PR #1154 `## Findings / Capture候補`, `## SPEC確定候補` の記述
- `docs/specs/runtime-package-boundary.md` の該当キーワード不在（grep 検索 0 件）
- Epic #1149 Wave 1 クローズ時のキャプチャ回収（capture-boundaries split rule に基づく積み残し候補）
