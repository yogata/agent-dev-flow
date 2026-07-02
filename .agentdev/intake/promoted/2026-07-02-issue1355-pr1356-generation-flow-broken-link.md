# PR #1356 generation-flow.md 削除に伴う case-file.md の broken link（IR-057 baseline 項目）

## 観測内容

PR #1356 が ADR-0131 decision #4 廃止確定、REQ-0141-004 に基づき `src/opencode-local/generation-flow.md` を物理削除した。しかし同 PR は削除対象ファイルへの参照の全掃除を実施しておらず、`src/opencode-local/agentdev-gh-cli/case-schema/case-file.md:215-216` に broken link を2件残した。新規導入された IR-057（obsolete-spec-path-after-domain-split、status: accepted、baseline_status: new）が当該箇所を正しく検出する。

## 影響

- `case-file.md:215-216` のリンク先が存在しない（broken link）
- 廃止された link mode 由来の語彙が残存し、読者の誤解を招く可能性

## 課題

- `case-file.md:215-216` のリンクと語彙の除去、または `docs/specs/local/local-generation.md`（link mode 移行経緯の正本）へのリンク差し替え
- 既存 intake `2026-06-29-issue1341-opencode-local-legacy-vocab.md` が指摘する一般 legacy vocab 残存との統合判定
- IR-057 baseline 登録と delta guard 設定（`integrity-rule-catalog.md` の baseline 取得タイミング）

## 既存要件との関連

- ADR-0131: link mode 廃止確定（decision #4）
- REQ-0141-004: generation-flow.md 削除の要件根拠
- IR-057: obsolete-spec-path-after-domain-split ルール（baseline 0 + delta guard 設計、intake 経由段階解消を想定）
- 本 item は IR-057 baseline 設計上の段階解消第一候補
- link mode / 変換プロンプト legacy vocabulary 残存クラスターに属し、backlog-review での統合を推奨

## 観測元

- PR #1356 (Issue #1355 / REQ-0158 / case-auto Draft 2 OU-001)
- QG-4 評価時の `check_changed_docs.ts --workflow case-close --base-ref origin/main` 実行
