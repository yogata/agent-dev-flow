# inspect-docs promoted 20260903T105357Z（promote 採用分）

> 本ファイルは inspect-promote（2026-09-03 実施、/agentdev/backlog-auto 経由）の分類確定後、promote となった検出事項を保存する（2件）。
> 採用元 finding ファイル（`inspect-docs-finding-20260903T105357Z.md`）は本 promoted 保存後に inbox から削除済み。
> defer 残置分（旧 20260822 F-05、旧 20260901 F-08〜F-12/F-27/F-34/F-36 の計9件）は各ファイルを inbox に残置。reject 0件。
> 判定根拠の詳細・証跡は各 finding の記載および adversarial-review 記録（2系統独立 stream、収束・convergence audit 完了）を参照。
> backlog-review との統合マーカーを各 finding に記載（intake promoted との二重修正の回避）。

## promote 一覧

### F-01: docs/README.md の現行 REQ 件数・一覧が正規インデックスと乖離（high/high）

- **対象**: docs/README.md 要件節の本文（「現行要件は48件である」）および REQ 一覧表（REQ-057 までで REQ-058 を欠く）
- **根拠**: docs/README.md の AUTOGEN ブロックは「現行 REQ: 49件」を示す一方、手動本文・一覧表は 48件・REQ-057 までで滞留。現行 REQ 実ファイルは49件（REQ-058 存在、2026-09-03 作成）で、docs/requirements/README.md の AUTOGEN 一覧は49件・REQ-058 を含む。正規 REQ インデックスと docs 入口の手動記述の乖離を 2026-09-03 現行確認済み
- **受け入れ条件**: docs/README.md の本文件数と REQ 一覧表を docs/requirements/README.md の AUTOGEN および実ファイルと一致させる（49件・REQ-058 追加）。AUTOGEN 化するかどうかの判断は req-define での設計判断に委ねる
- **統合マーカー**: REQ-057（docs corpus 整合・現行化バッチ）系統の docs README 現行化対象。docs-check route 候補（README の hardcoded count と一覧の実体照合）を併記

### F-02: 過去版 REQ の裸 4 桁根拠参照が v2: 表記規約に不整合（medium/high）

- **対象**: docs/designs/commands/design-save.md:165（REQ-0136-029）、docs/designs/integrity/integrity-contracts.md:512（REQ-0145-014）
- **根拠**: docs/requirements/README.md「過去版との関係」（L88-91）は過去版 REQ を `v2:REQ-01XX` 表記で区別する規約を定める。上記2件は根拠参照として裸の 4 桁 REQ 番号を用い、版区別を失わせる（2026-09-03 現行確認済み）。横断検出の同様候補（REQ-0108-262、REQ-0129-012、REQ-0147-010、REQ-0164 等）は履歴説明・検出パターン説明・検証例の文脈が多く、本 finding では根拠参照2件のみを確定対象とする
- **受け入れ条件**: 根拠参照2件を `v2:REQ-...` 形式へ再同定して修正する。履歴説明・検証例の表記候補は文脈確認後に必要な場合のみ統一する（本 promoted での範囲の新規決定は行わない）
- **統合マーカー**: 「表記・参照・用語の現行化」系統（旧参照系と一体作業候補）。docs-check route 候補（Report と検出パターン定義を除外した裸 `REQ-01XX` 参照検査）を併記
