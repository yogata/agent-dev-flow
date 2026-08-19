---
title: "テスト影響範囲検出 gate"
status: draft
created: "2026-08-09"
updated: "2026-08-09"
---

# テスト影響範囲検出 gate

リファクタリング PR で SPEC 変更に連動する周辺テストが陳腐化する事象（WP-1..WP-5 で周辺テスト70件が陳腐化した事例）の再発防止として、テスト影響範囲を機械的に検出する gate の契約を定義する。
REQ-019 が WHAT（検出できること、検出対象・契機・処置の明示）を要件化し、本 SPEC は HOW の契約（検出対象・検出契機・不合格時の処置・検出ロジックの境界）を定義する。
判定ロジックの実装詳細は checker 実装（`check_test_impact.ts`）へ委譲する。

## 検出対象

- 変更 SPEC ファイル（`docs/designs/**/*.md`、`docs/requirements/REQ-*.md`、`docs/decisions/DEC-*.md`）。PR diff（`git diff --name-only <base-ref>...HEAD`）から抽出する
- 上記 SPEC を参照するテストファイル（`**/*.test.ts`）。参照の検出は次のいずれかの契機で成立する:
  - SPEC 相対パス（例: `docs/designs/integrity/test-impact-detection-gate.md`）の文字列参照
  - SPEC basename（例: `test-impact-detection-gate.md`）の文字列参照
  - REQ ID（例: `REQ-019`）、Decision ID（例: `DEC-001`）の文字列参照（当該 ID を frontmatter に持つ REQ/Decision が変更対象に含まれる場合）
- 検出対象外: node_modules/、`.worktrees/`、`.agentdev-plugin/`、`docs/requirements/retired/`、`docs/decisions/retired/`

## 検出契機

PR（worktree 环境、case-run 等）で SPEC 変更を含む場合に gate を実行する。
検出契機は「SPEC 変更ファイルの参照を持つテストが、当該 PR で未変更」を満たすかで判定する。

| 状況 | 判定 |
|------|------|
| SPEC 変更あり、参照テストが同一 PR で変更済み | OK（追従完了とみなす） |
| SPEC 変更あり、参照テストが同一 PR で未変更 | warning（陳腐化候補） |
| SPEC 変更なし | 該当なし（gate の対象外、空レポート） |

## 不合格時の処置

- 検出結果（陳腐化候補テスト一覧）をレポート（JSON または text）で出力する
- 自動修復は行わない。対象テストの更新は開発者（case-close 前の確認、または follow-up Issue）が行う
- exit code は検出件数によらず `0`（OK）とする。検出は warning 扱いであり、CI を即時失敗させない（REQ-019-002 の「不合格時の処置」は報告を完備することを要件とする）。
- PR 本文の `## Findings / Capture候補` セクションに `### test-impact` 小見出しで検出結果を記録する（実行担当サブエージェント責務）

## チェッカー実装契約

実装スクリプト: `.opencode/skills/repo-agentdev-integrity/scripts/check_test_impact.ts`

CLI 引数:

| 引数 | 必須 | 値 | 説明 |
|------|------|-----|------|
| `--base-ref <ref>` | -- | git ref（既定: `origin/main`） | worktree 環境（マージ前、case-run 等）で git diff により変更 SPEC ファイルを検出する |
| `--files <paths...>` | -- | ファイルパス（space 区切り推奨、comma 区切りも受入） | main 環境（マージ後、case-close 等）で PR 変更ファイルを直接指定する。`--base-ref` と排他 |
| `--test-glob <pattern>` | -- | glob pattern（既定: `**/*.test.ts`） | テストファイルの検出 pattern。既定は bun:test を想定 |
| `--json` | -- | flag | JSON 出力を有効化（CI 統合向け） |
| `--root <path>` | -- | ファイルパス | リポジトリルートを明示指定（worktree/CI 対応、`cli_utils.ts` `findRepoRoot` 準拠） |
| `--help` | -- | flag | ヘルプ表示 |

`--files` と `--base-ref` は排他。
両方未指定の場合はエラー（exit 2）。

report JSON スキーマ（`TestImpactReport`）:

```typescript
interface TestImpactFinding {
  spec_path: string;        // 変更 SPEC 相対パス
  spec_lifecycle: "added" | "deleted" | "renamed" | "modified" | "unknown";
  test_path: string;        // 陳腐化候補テスト相対パス
  reference_kind: "full-path" | "basename" | "req-id" | "adr-id";
  reference_snippet: string; // 参照箇所の行内容（エビデンス）
  reference_line: number;   // 1-based 行番号
}

interface TestImpactReport {
  base_ref: string | null;
  files_declared: string[];      // --files 指定時の入力
  spec_changes: string[];        // 検出された SPEC 変更ファイル一覧
  tests_scanned: number;         // 走査テストファイル数
  stale_candidates: TestImpactFinding[]; // 陳腐化候補
  warnings: string[];
}
```

exit code: `0`（正常終了、検出件数によらず）、`1`（使用しない、将来の strict mode 用予約）、`2`（入力不正・実行エラー）。

## 設計意図と制約

- **silent pass 回避**: SPEC 変更があり、かつ参照テストが 0 件検出された場合は warnings で報告する（参照抽出の設定漏れ、test-glob の誤り等の確認を促す）
- **false positive 許容**: 本 gate は false positive（過検出）を許容し false negative（見逃し）を減らす方針（`repo-agentdev-integrity` SKILL.md「方針」節に準拠）。検出結果は warning 扱いであり開発者の確認を促す
- **scope の限定**: SPEC 変更に連動する周辺テストの陳腐化検出に限定し、テスト実行基盤（test runner 選定、test 実行順序）、影響範囲スキャンの実装詳細アルゴリズム（依存関係グラフ構築等）は対象外（REQ-019 適用範囲）
- **コード変更 → テスト影響** は本 gate の対象外。本 gate は SPEC 変更 → テスト陳腐化検出に限定する（REQ-019-001「SPEC 変更に連動する周辺テストの陳腐化を検出」に基づく）

## 関連

- REQ-019（テスト影響範囲検出 gate 要件、REQ-019-001/002）
- `/repo/docs-check`（repo-local、配布対象外）。本 gate は PR diff を入力とするため case-run / case-close / CI の PR 系 workflow から呼び出す。`/repo/docs-check`（全件自己監査）には PR diff 文脈が無く、本 gate の呼び出し対象外とする
- `autogen-freshness-gate.md`（同 PR で新設の姉妹 gate、同等の契約構造を持つ）
- `targeted-docs-guard-implementation.md`（docs 限定検査の既存実装、本 gate はテスト領域の対称実装）
