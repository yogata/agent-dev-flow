# promoted: REQ-112 テンプレート残骸コメント除去（RQ18・scope 限定採用）

- source: `.agentdev/inspect/inbox/inspect-docs-finding-20261017T102200Z.md`（RQ18。2026-10-17 inspect-promote で promote・当該ファイルから削除）
- 分類: 自律確定（Jev 先行評価 20261017T103421Z-8bf9 は defer 0.72 → 最終判断 promote〔differenceReason: semantic_disagreement〕。adversarial-review 2 stream〔分類妥当性・証拠適合〕が scope 限定と DS33 前例を根拠に支持、convergence audit 完了・unresolved なし）
- 採用根拠（HITL 不要と判断した理由）: 対象コメントは corpus 全域で REQ-112 のみに残存する機械的一意な表層欠陥であり（grep 実測）、修正方向（HTML コメント3箇所の除去）が一意でリスクゼロ。機械的に一意な表層欠陥の promote 前例（20261016 DS33 番号重複是正）と同一の処分原理。曖昧な側面は対象外として本成果物に明示したため判断余地は残らない

## 対象（category / target）

- **category**: 文書分類一貫性（テンプレート種別残骸）
- **target**: `docs/requirements/REQ-112.md:11,16,25`（`<!-- 【必須】 -->` 3箇所）
- **severity**: low / **confidence**: high（本採用 scope については機械的一意）
- **source_of_truth**: corpus 慣行（現行 72 REQ 中 70 件が「目的/要件/適用範囲」標準構成。横断 grep で【必須】残骸は REQ-112 のみ）
- **ng_classification**: pre-existing

## 採用内容（採用済み・RU 化対象）

REQ-112.md の 3箇所の `<!-- 【必須】 -->` テンプレート案内コメント（:11 目的節、:16 要件節、:25 適用範囲節の直下）を除去する。本文の文意は変更しない。

受け入れ条件方向（backlog-review の RU 化材料）:
- REQ-112.md から `<!-- 【必須】 -->` の出現が 0 件になること（corpus 全域 grep でも 0 件であること）
- 上記以外の REQ-112 本文（行・節構成・文言）は変更しないこと

## 対象外（本採用の scope 外。付随観察として backlog-review の分割・後続判断に委ねる）

- **4列要件表（:18-22、要件ID|要件|受け入れ条件|検証）**: corpus 標準は 2列。ただし REQ-112 は方針決定記録型の特殊 REQ であり REQ-112-003 が「対象外を明記する」哲学を要件化しているため、意図的選択の可能性があり採否未確定
- **ぶら下がり段落（:30、節見出しのない段落）**: 「機構再設計を伴うため v5 検討事項として記録する」と自己限定した意図的記録の可能性があり採否未確定
- テンプレート残骸コメント検出の docs-check ルール候補（RQ18 由来）は、採用済み成果物の受け入れ条件の拡張候補として本成果物に付随記載する（独立 route としない。`docs-check ルール／検査データ追加候補は独立 route とせず、採用済み成果物の要件化方向または受け入れ条件に含める` 不変条件に従う）

## 後続 route

backlog-review（RU 化 → req-define/case 経由の修正実装）
