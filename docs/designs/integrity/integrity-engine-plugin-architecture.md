---
title: 検証エンジン プラグインアーキテクチャ Design
status: draft
created: 2026-11-18
---

<!-- ADF-COVERS(design): REQ-122-001, REQ-122-002, REQ-122-003, REQ-122-005, REQ-122-006, REQ-122-007, REQ-122-011（検証エンジンのプラグイン型アーキテクチャ・ルール構成・保持検査能力の実行契約。REQ-116 型の covers 宣言） -->

# 検証エンジン プラグインアーキテクチャ Design

repo-agentdev-integrity 検証エンジンのプラグイン型アーキテクチャ、共有コンテキストキャッシュ、差分実行、
自動起票、カタログ自動生成の契約を所有する（検証体制中核化 Decision の実行契約）。

## モジュール構成（src/ 正本）

正本は src/ 配下（既存 src/ 構造に準拠）とし、.opencode/ 側を投影として管理する（repo-local・配布対象外は
維持。IR-016/IR-068 の投影マニフェストに copy 投影として登録）。

- scripts/cli.ts: エントリーポイント（--changed / --emit-intake / --rule <id> / --json）
- scripts/generate_indexes.ts: 残存ルールから integrity-rule-catalog.md と各種 README を生成
- scripts/check_autogen_freshness.ts: インデックス鮮度検査
- engine/types.ts: IntegrityRule、IntegrityContext、RuleViolation の型定義
- engine/context.ts: 単一走査・AST/YAML/リンクキャッシュ構築エンジン
- engine/runner.ts: glob フィルタリング・並列実行オーケストレータ
- engine/reporter.ts: 標準出力フォーマットと --emit-intake 自動起票
- rules/index.ts: 全ルールのレジストリ
- rules/ir-001.ts 〜: 1ルール1ファイル（24+IR-075 モジュール）
- lib/: 共通ユーティリティ（minimal-yaml、glob_walk 等）
- trusted-distribution-gate/: 配布境界検証モジュール群
- data/: distribution-targets.yaml、skill-projection-manifest.yaml

## IntegrityRule インターフェース

RuleViolation は ruleId、severity（error/warning）、filePath、line（任意）、message、remediationHint（任意）を
持つ。IntegrityRule は id、slug、title、description、relatedReqs、targetGlobs（差分実行のトリガーパス）、
globalScan（全体整合が必要な相互参照系は true）、severity、check(ctx) を持つ。

## 共有コンテキストキャッシュ

buildContext 実行時に対象ディレクトリ（docs/、src/、.opencode/、.agentdev/、traceability/）配下の
Markdown/YAML を1度だけ走査し、Map<string, ParsedFile> に格納する。ParsedFile は path（リポジトリルート
相対）、rawContent、lines、frontmatter（YAML パース済み）、markdownLinks（抽出済み相対リンク配列）、
reqReferences（抽出済み REQ/DEC 参照配列）を保持する。個別ルール内での fs.readFileSync・glob 直接呼出を
禁止し、ctx.files または ctx.getFilesByGlob(pattern) 経由で取得する。

## 差分実行・自動起票ランナー

cli.ts --changed は git diff --cached --name-only（ステージング空の場合は git diff --name-only HEAD）から
変更ファイル一覧を取得し、各ルールの targetGlobs と照合し、マッチするルール（と globalScan: true の最小限の
相互参照ルール）のみを並列実行する。変更ファイルが対象外のみの場合は即座に Exit Code 0 で終了する。
cli.ts --emit-intake は severity: warning の RuleViolation を
.agentdev/intake/inbox/YYYY-MM-DD-auto-<rule-id-lower>.md として自動生成し、同一 rule-id の自動起票
ファイルが既に存在する場合は新規作成せずスキップする（冪等性）。

## カタログ自動生成（単一ソース）

generate_indexes.ts は rules/index.ts に登録された全 IntegrityRule オブジェクトのメタデータ（id、title、
description、relatedReqs、severity）から docs/designs/integrity/integrity-rule-catalog.md を自動生成する。
ドキュメントと実装の二重管理を廃止し、レジストリが単一ソースとなる。

## 保持する検査能力

旧構造から以下の検査能力を新構造へ移行して保持する: sidecar malformed-declarations 重複キー検出
（REQ-117-006）、未追跡かつ gitignore 管理対象外ファイル検出（REQ-010-084）、既知混入形の異言語文字混入
検出（REQ-010-083）、残存24ルールの全検出内容、IR-075（ir-file-size、対象・250行総行数判定・references/
除外・行数とバイト数の両方を出力するエラーメッセージ）。

## テスト構成

scripts/rules/rules.test.ts が残存ルールの正常系・異常系をインメモリ IntegrityContext モックで検証する。
trusted-distribution-gate の境界テストは boundary-pipeline.test.ts・boundary-gate.test.ts に統合する。

## 対象外

Git Hook スクリプトの実行契約（local-verification-gates Design）、intake-triage コマンド
（commands/intake-triage Design）、配布境界の意味モデル（distribution-boundary Design）。
