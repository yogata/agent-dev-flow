# ADR-0126 generation-mode 残存語彙の一括 ADR-0131 化（bundle）

## 統合の根拠

2 つの intake item が同一原因（ADR-0126 superseded → ADR-0131 link model への移行未完）に起因する残存語彙を扱うため、単一成果物に統合する。
横断是正を一括管理し、`transform/` 廃止候補ディレクトリの取扱確定も一体化する。

- 元 item 1: `2026-06-24-issue1114-residual-adr0126-generation-mode-terms.md`（glossary / consumer-project-setup / DOC-MAP の残存語彙）
- 元 item 2: `2026-06-25-local-case-file-adr0126-superseded-citation.md`（local-case-file.md L242 の ADR-0126 引用）

## 観測内容

### 残存箇所 1（glossary / consumer-project-setup / DOC-MAP）

#1114 は Issue 指定の 3 箇所（DOC-MAP L53 / glossary L91 / consumer-project-setup L70-117）を ADR-0131 link mode 語彙へ整形したが、Issue 指定行範囲外に ADR-0126 generation-mode 時代の旧語彙が残存する。

- `docs/guides/glossary.md`:
  - L82: 節冒頭の ADR 参照が `ADR-0126`（superseded）
  - L86「ローカル版 OpenCode」定義が「変換プロンプト経由で生成」と記述
  - L89 `consumer-generated` 定義が `generated_by` + 実ディレクトリ判定（SPEC runtime-package-boundary.md 現行定義＝agentdev-gh-cli link 判定と矛盾）
  - L90 `generated_by 識別子` が現行有効と記述（REQ-0141-011 は link mode では主制御ではない）
  - L92 `生成時ソース（generation-time source）` 用語が L91 更新後の `link 先原本領域` と隣接矛盾
- `docs/guides/consumer-project-setup.md`:
  - L15: consumer-generated 行の `.opencode/` 説明が「生成された実ディレクトリ・generated_by 保持」
  - L123: 予約名表の `generated_by` 行
  - L129: 禁止事項の `generated_by` 上書き記述
  - L180: スクリプト適用範囲表が「`src/opencode-local/transform/generate.md` 変換プロンプトに従って生成する」と記述（transform/ は廃止候補）
- `docs/DOC-MAP.md`:
  - L128-129: SPEC 行の local-generation.md / local-transform.md 説明が「生成フロー・generated_by 識別子・ジャンクション検出安全ゲート」等の旧記述のまま

### 残存箇所 2（local-case-file.md）

`docs/specs/local-case-file.md` の「関連項目」セクション（L242）が `ADR-0126`（status: superseded, superseded_by: ADR-0131）を現行基準として引用している。

```
- ADR-0126（ローカル版 OpenCode 生成基盤の source model 拡張と生成安全性制約）
```

## 影響

- `/repo/docs-check` および inspect-docs が ADR-0131 矛合として継続検出する可能性がある
- consumer 導入ガイドの読者が link mode と generation mode の混在記述に混乱する
- ADR-0126 を現行基準として引用する箇所が残る

## 課題

残存 4 ファイル（glossary.md / consumer-project-setup.md / DOC-MAP.md / local-case-file.md）を ADR-0131 link mode 語彙へ一括整形する。

## 既存要件との関連

- Issue #1114、PR #1124（merged, squash）
- ADR-0126（status: superseded, superseded_by: ADR-0131）
- ADR-0131（link model、現行基準）
- 関連 REQ: REQ-0112（ADR ライフサイクル標準化）、REQ-0108-125（accepted 以外の ADR 引用検出）、REQ-0141-011（link mode での generated_by 位置付け）
- 対象 SPEC: `docs/specs/runtime-package-boundary.md`（現行定義の参照元）
- 根拠（local-case-file 側）: `/repo/docs-check` 実行（2026-06-25）。`.agentdev/integrity/reports/2026-06-24-integrity-report.md`

## 対応方針の方向性

- 残存 4 ファイルの一括 ADR-0131 化を単一 Issue で処理する
- `transform/` 廃止候補ディレクトリの取り扱い（削除 / 廃止明記 / 別用途へ再利用）を先に確定する
- local-case-file.md L242 の `ADR-0126` 引用を `ADR-0131`（link model）へ差し替えるか、両者を併記して supersession 関係を明記する
