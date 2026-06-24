# 残存 ADR-0126 generation-mode 語彙（#1114 スコープ外）

## 発生源

- Issue: #1114
- PR: #1124 (merged, squash)
- 発生日: 2026-06-24

## 観測

#1114 は Issue 指定の 3 箇所（DOC-MAP L53 / glossary L91 / consumer-project-setup L70-117）を ADR-0131 link mode 語彙へ整形したが、Issue 指定行範囲外に ADR-0126 generation-mode 時代の旧語彙が残存する。スコープ規律のため #1124 では未修正。

### 残存箇所

- `docs/guides/glossary.md`:
  - L82: 節冒頭の ADR 参照が `ADR-0126`（superseded）。
  - L86「ローカル版 OpenCode」定義が「変換プロンプト経由で生成」と記述。
  - L89 `consumer-generated` 定義が `generated_by` + 実ディレクトリ判定（SPEC runtime-package-boundary.md 現行定義＝agentdev-gh-cli link 判定と矛盾）。
  - L90 `generated_by 識別子` が現行有効と記述（REQ-0141-011 は link mode では主制御ではない）。
  - L92 `生成時ソース（generation-time source）` 用語が L91 更新後の `link 先原本領域` と隣接矛盾。
- `docs/guides/consumer-project-setup.md`:
  - L15: consumer-generated 行の `.opencode/` 説明が「生成された実ディレクトリ・generated_by 保持」。
  - L123: 予約名表の `generated_by` 行。
  - L129: 禁止事項の `generated_by` 上書き記述。
  - L180: スクリプト適用範囲表が「`src/opencode-local/transform/generate.md` 変換プロンプトに従って生成する」と記述（transform/ は廃止候補）。
- `docs/DOC-MAP.md`:
  - L128-129: SPEC 行の local-generation.md / local-transform.md 説明が「生成フロー・generated_by 識別子・ジャンクション検出安全ゲート」等の旧記述のまま。

## 今回扱わない理由

#1114 は Issue 本文が指定した 3 箇所（DOC-MAP L53 / glossary L91 / consumer-project-setup L70-117）に厳密に限定。スコープ外の残存箇所は別 Issue で一括処理する前提。

## 影響

- `/repo/docs-check` および inspect-docs が ADR-0131 矛合として継続検出する可能性がある。
- consumer 導入ガイドの読者が link mode と generation mode の混在記述に混乱する。

## レビューで決めること

- 残存 3 ファイル（glossary.md / consumer-project-setup.md / DOC-MAP.md）の一括 ADR-0131 化を単一 Issue で処理するか
- `transform/` 廃止候補ディレクトリの取り扱い（削除 / 廃止明記 / 別用途へ再利用）を先に確定するか

## 根拠

PR #1124 本文「Findings / Capture候補」セクション。Issue #1114 指定行範囲外の残存 generation-mode 語彙を網羅的に列挙。
