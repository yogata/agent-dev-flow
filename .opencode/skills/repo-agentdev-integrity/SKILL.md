---
name: repo-agentdev-integrity
description: Repo-local integrity validation for agent-dev-flow self-hosting artifacts. Plugin-based verification engine (cli.ts: --changed/--emit-intake/--rule/--workflow) for REQ/Decision/Design/skill/command consistency, index auto-generation, and the trusted distribution gate. USE FOR: running integrity checks, validating frontmatter and cross-references, differential verification of staged changes, changed-docs verification for workflows, auto-ticketing warnings, regenerating index AUTOGEN blocks. DO NOT USE FOR: semantic content evaluation, user approval, requirement analysis, ADR necessity judgment.
---

# repo-agentdev-integrity

agent-dev-flow リポジトリ（self-hosting repo）の artifact 整合性検査を集約する repo-local skill。AgentDevFlow の配布対象外であり、consumer project では利用しない。検証エンジンの正本は `src/common/skills/repo-agentdev-integrity/` 配下に配置し、`.opencode/skills/repo-agentdev-integrity/` は copy 投影として管理する（DEC-065 決定3、REQ-002-020 の限定例外）。

## 主要な用途

- agent-dev-flow repo artifact（REQ、Decision、Design、skill、command）の整合性検査（残存24 IR ルール、integrity-rule-catalog.md が正）
- 差分実行（`--changed`）: ステージング変更に対応するルールのみ実行し、対象外のみの変更は即時 Exit 0
- 明示対象 targeted docs guard（`--workflow <name>` + `--files` / `--base-ref`）: 保存工程（req-save / design-save）・case-run・case-close・docs-check の変更文書限定検査。files_checked・unchecked_reasons・更新要否フラグを報告する（対象契約は targeted-docs-guard-implementation Design）
- warning の自動起票（`--emit-intake`）: `.agentdev/intake/inbox/YYYY-MM-DD-auto-<rule-id-lower>.md` へ起票（同一 rule-id で冪等スキップ）
- 索引類の再生成（`generate_indexes.ts`）と AUTOGEN ブロック鮮度検査（`check_autogen_freshness.ts`）
- 配布依存境界の検査（IR-059、`--profile source` 相当の trusted-distribution-gate 実行）
- 検出結果の Markdown / JSON レポート生成

## 対象外

- ドキュメント内容の意味的妥当性判定（→ `agentdev-req-analysis`、`agentdev-decision-guidelines`）
- ユーザー承認が必要かどうかの判断（→ 各コマンドの skill）
- 要件分析・壁打ち（→ `agentdev-req-analysis`）
- Decision 要否判断（→ `agentdev-decision-guidelines`）
- `gh` 書き込み検証の orchestration（→ Custom Tool `agentdev_gh` は Tool 内部で読み戻し検証を完結）
- 実装の自動修正（検査対象を直接修正しない原則。許可出力はレポート・intake item のみ）
- Consumer project での整合性検査（本 skill は self-hosting repo のみ対象）

## 検証エンジン構成（src/ 正本）

| モジュール | 内容 |
|-----------|------|
| `scripts/cli.ts` | エントリーポイント（`--changed` / `--emit-intake` / `--rule <id>` / `--json` / `--workflow <name>` targeted docs guard） |
| `scripts/generate_indexes.ts` | 索引類自動生成（カタログは rules レジストリから単一ソース生成、DEC-065 決定3） |
| `scripts/check_autogen_freshness.ts` | AUTOGEN ブロック鮮度検査 |
| `engine/types.ts`・`engine/context.ts`・`engine/runner.ts`・`engine/reporter.ts` | IntegrityRule / IntegrityContext / 単一走査キャッシュ / 差分実行・自動起票 |
| `engine/targeted-gate.ts` | 明示対象 targeted docs guard（workflow profile・files_checked 算出・unchecked_reasons・更新要否フラグ） |
| `rules/index.ts` + `rules/ir-NNN.ts` | 残存24コアルールのレジストリと 1ルール1ファイル実装 |
| `lib/` | 共通ユーティリティ（minimal-yaml、glob_walk、cli_utils、builtin-checks 等） |
| `trusted-distribution-gate/` | 配布境界検証モジュール群（IR-059 検出本体・archive 検証・boundary pipeline/gate） |
| `data/` | `skill-projection-manifest.yaml`（IR-068 検出データ・copy 投影登録）、`distribution-targets.yaml`（配布境界 gate データ） |

ルールの検出仕様は `docs/designs/integrity/integrity-rule-catalog.md` と `rules/IR-NNN-*.md` が正である（本 SKILL.md は実行入口の説明に留まり、検出仕様の二重管理を行わない）。IR レジストリ外のエンジン内蔵検査（未追跡ファイル検出 REQ-010-084、既知混入形の異言語文字混入検出 REQ-010-083、sidecar 重複キー検出 REQ-117-006）も実行対象に含む。

## 実行規約

```
bun run src/common/skills/repo-agentdev-integrity/scripts/cli.ts            # 全量実行
bun run src/common/skills/repo-agentdev-integrity/scripts/cli.ts --changed  # 差分実行
bun run src/common/skills/repo-agentdev-integrity/scripts/cli.ts --rule IR-001
bun run src/common/skills/repo-agentdev-integrity/scripts/cli.ts --emit-intake --json
bun run src/common/skills/repo-agentdev-integrity/scripts/cli.ts --workflow case-run --files <変更ファイル...> --root <検査対象 root> --json
```

- exit code: 0（問題なし。対象外のみの差分実行を含む）、1（違反または warning）、2（実行エラー）
- レポート出力先: `.agentdev/integrity/reports/YYYY-MM-DD-integrity-report.md`（日付ベースで新規作成、過去レポート上書きなし）
- `--emit-intake` は severity: warning の違反を intake inbox へ自動起票する。同一 rule-id の自動起票ファイルが既に存在する場合は新規作成せずスキップする（冪等性）
- `--workflow`（targeted docs guard）モードは stdout のみへ TargetedDocsReport（JSON/text）を出力し、レポートファイル・intake 起票は行わない。`--files` と `--base-ref` のいずれかが必須（両方未指定・repo ルート外の入力・Git 列挙失敗は終了コード 2）。files_checked 空は検証モード問わず strict FAILURE（REQ-010-076）。engine の終了コード単独で workflow の受入を決定せず、空・不一致の fail-closed 判定は workflow 側が行う（モード使い分け・PowerShell 引数形式の運用は targeted-docs-guard-implementation Design「標準実行契約」節）

## 検出結果の取扱い

検出違反は baseline による承認一覧へ登録せず免除しない（REQ-010-082）。全件を報告し、対象側の直接修正で解消する。severity: warning の違反は `--emit-intake` による自動起票の対象である。

## スキルの責務範囲

本スキルは検査・レポート生成・自動起票の実行と schema 定義を提供する。intake item の triage（分類・振り分け）は intake パイプライン側の責務であり、本スキルは実行しない。

## worktree での実行

検証エンジンは `--root <path>` で検査対象リポジトリルートを明示指定できる。worktree を検査対象とする場合は、host 側配置（メインリポジトリまたは worktree 内の src 正本）を起点として起動し、検査対象 worktree の絶対パスを `--root` で明示指定する。配置先起点の誤リポジトリ検査は検査見逃しとして扱う。本検査は読み取り専用であり、検査対象への書込みを行わない（POL-worktree-isolation と整合）。

## See Also

- **agentdev-req-file-manager**: REQ 番号採番ルール、frontmatter 規約
- **agentdev-decision-file-manager**: Decision 構造定義
- **agentdev-workflow-templates**: ワークフローテンプレート定義
