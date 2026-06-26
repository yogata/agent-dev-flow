# runtime-package-boundary SPEC の scripts/ 配布取り扱い不足

## 発生源

- Epic: #1149
- PR: #1154 (Issue #1151)
- 発生日: 2026-06-25

## 観測内容

PR #1154 で `src/opencode/skills/agentdev-req-file-manager/scripts/` 配下に決定的 TypeScript スクリプト群が新設された。これにより agent-dev-flow リポジトリに JS エコシステムの成果物（`package.json`, `tsconfig.json`, `bun.lock`, `node_modules/`, `tests/*.test.ts`）が初めて導入された。

`docs/specs/runtime-package-boundary.md` は consumer プロジェクトへの配布境界を定義するが、`scripts/` 配下、`node_modules/`、`bun.lock` の配布対象・配布方法に言及がない。grep で `scripts`, `node_modules`, `bun`, `package.json`, `tsconfig` すべて 0 件。

## 影響

- consumer プロジェクト（AgentDevFlow 導入先）が `scripts/` 配下を配布物として受け取るか不明確
- `bun.lock` の配布可否が未定義（再現性のある実行環境保証とのトレードオフ）
- `node_modules/` は runtime 生成物だが配布境界 SPEC で明示的に除外指定がない
- 今後 `scripts/` 配下を持つ skill が増加する可能性

## 課題

- `scripts/` 配下（`package.json`, `tsconfig.json`, `bun.lock`, `src/`, `tests/`, `lib/`）を配布対象に含めるか
- `node_modules/` の配布除外を SPEC に明記するか（runtime 生成物位置づけ）
- consumer プロジェクトでの `bun install` 実行を前提とするか、コンパイル済み配布等の別方式を採用するか
- `docs/specs/skills/agentdev-req-file-manager.md` に scripts/ の I/O 契約を SPEC として確定するか（SKILL.md 記載との二重管理になるか）

## 既存要件との関連

- `docs/specs/runtime-package-boundary.md`（配布境界 SPEC）
- `design-principles.md` 第5節「Scriptは決定的処理を担う」原則

## 対応方針候補

- 個別 SPEC 更新課題として、配布境界設計の判断事項（bun.lock 配布可否、node_modules 除外明記、実行方式）を確定する
