# PR #1356 generation-flow.md 削除に伴う case-file.md の broken link（IR-057 baseline 項目）

## 観察

case-close Issue #1355 / PR #1356 の QG-4 評価中に観察。PR #1356 が ADR-0131 decision #4 廃止確定、REQ-0141-004 に基づき `src/opencode-local/generation-flow.md` を物理削除した。しかし同 PR は削除対象ファイルへの参照の全掃除を実施しておらず、`src/opencode-local/agentdev-gh-cli/case-schema/case-file.md:215-216` に broken link を残した。

新規導入された IR-057（`obsolete-spec-path-after-domain-split`、`status: accepted`、`baseline_status: new`、`finding_route: intake`）が当該箇所を正しく検出する。ルールは baseline 0 + delta guard 設計であり、既知違反は intake 経由で段階解消する想定である。本 intake はその経路を辿る第一候補。

## 具体的検出箇所

`check_changed_docs.ts --workflow case-close --base-ref origin/main --json` の failures より:

- `src/opencode-local/agentdev-gh-cli/case-schema/case-file.md:215` — `[ローカル版 OpenCode 生成](../../../generation-flow.md)` — `生成フロー`、`generated_by` 語彙を含む。リンク先 `generation-flow.md` は PR #1356 で削除済みのため broken link
- `src/opencode-local/agentdev-gh-cli/case-schema/case-file.md:216` — `[ローカル版 OpenCode 変換プロンプト](../../../transform/spec.md)` — `transform/spec.md` 語彙を含む。リンク先 `transform/spec.md` は ADR-0131 廃止確定により存在しないため broken link

## 修正されなかった理由

Issue #1355 の AC-9 は「旧SPEC直下パス参照の解消」を完了条件とし、`generation-flow.md`、`transform/` 系の local 版旧生成方式語彙の完全解消は AC に含まれない。IR-057 ルール設計（baseline_status: new、finding_route: intake）が既知違反の段階解消を明示するため、本 PR のマージをブロックしない。

## 課題

- `case-file.md:215-216` のリンクと語彙の除去、または `docs/specs/local/local-generation.md`（link mode 移行経緯の正本）へのリンク差し替え
- 既存 intake `2026-06-29-issue1341-opencode-local-legacy-vocab.md` が指摘する一般 legacy vocab 残存（`README.md`、`agentdev-gh-cli/SKILL.md`、`references/retry.md` 等）との統合判定
- IR-057 baseline 登録と delta guard 設定（`integrity-rule-catalog.md` の baseline 取得タイミング）

## 想定対応 Issue

- OU-002（REQ-0141 UPDATE: ローカル版 OpenCode 導入方式）— generation-flow.md 削除に直接関連。最有力候補
- OU-003（REQ-0156 APPEND: docs/specs 基盤SPECドメイン別体系化）— ドメイン整備の副次対象候補

## 根拠

PR #1356 本文「### generation-flow.md 廃止」より:

> - `src/opencode-local/generation-flow.md` 物理削除（ADR-0131 decision #4 廃止確定、REQ-0141-004）
> - `src/opencode-local/README.md` のディレクトリ構成記載から transform/ と generation-flow.md を除去

IR-057 rule ファイル `triage_action` より:

> 新規検出時は baseline に追加し、delta guard で新規増加を fail 対象とする。本ルールは新規導入のため baseline 0 で開始し、full audit を即 fail gate 化する

## 観測元

- PR #1356 (Issue #1355 / REQ-0158 / case-auto Draft 2 OU-001)
- QG-4 評価時の `check_changed_docs.ts --workflow case-close --base-ref origin/main` 実行
- 観測日時: 2026-07-02 (case-close 実行中)
