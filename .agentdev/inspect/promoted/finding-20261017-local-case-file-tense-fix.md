# promoted: local-case-file Design 実装済み作業指示の現行化（DS34）

- source: `.agentdev/inspect/inbox/inspect-docs-finding-20261017T102200Z.md`（DS34。2026-10-17 inspect-promote で promote・当該ファイルから削除）
- 分類: 自律確定（Jev 先行評価 20261017T103421Z-8bf9 も promote 0.99。adversarial-review 2 stream convergence 完了・unresolved なし）
- 採用根拠（HITL 不要と判断した理由）: 対象の作業指示は実装側への反映が実確認済み（`src/common/tools/agentdev-gh/local/case-schema/case-file.md:33` に `comment_seq` 定義実在、`case-schema/rules/` 配下の定義ファイル実在）であり、document-model 禁じ手（Design 本文に作業履歴・将来案を保持しない）違反が現物行で確定。修正方向（現状形の現行設計記述への書き換え）は一意。実装済み時制・指示形の是正の promote 前例（20261008 F-11+F-13 supersede-wave-tense-fixes）と同一の処分原理

## 対象（category / target）

- **category**: STEP-2-5 未来計画の混入（本文と実装状態の意味整合）
- **target**: `docs/designs/local/local-case-file.md:173-175`（「共通メタデータ表へ `comment_seq`…を追加する」「…の機械可読定義…を本拡張へ合わせて更新する」）および `:181`（case-schema 機械可読定義の更新方針の命令形記述）
- **severity**: low / **confidence**: high（本採用 scope については実装反映済みを機械確認）
- **source_of_truth**: `docs/designs/foundations/document-model.md:47`（Design の禁じ手: 作業履歴）、`:498`（将来案・作業履歴を Design に保持しない）、実装実体 case-file.md:33
- **ng_classification**: pre-existing

## 採用内容（採用済み・RU 化対象）

local-case-file.md の該当節を実装反映済みの現行設計の現状形記述へ書き換える。具体的には:

- :173-175「共通メタデータ表へ `comment_seq`…を追加する」「…の機械可読定義…を本拡張へ合わせて更新する」→「共通メタデータ表は `comment_seq`（数値、任意、コメント採番の最高水位標）を持つ」「`src/common/tools/agentdev-gh/local/case-schema/` の機械可読定義（case-file.md、headings.yaml 等）は本拡張に合わせて更新済みである」等の現状形へ
- :181「更新方針: …を拡張する。…検証する」→ rules/ 配下の定義ファイルが既存であることを前提とした現行形の記述へ

受け入れ条件方向（backlog-review の RU 化材料）:
- local-case-file.md:173-181 に未来形・命令形の作業指示（「〜を追加する」「〜を更新する」の未実施を含意する形）が残存しないこと
- 現行設計として記述される内容（comment_seq の存在、case-schema 機械可読定義の構成）が実装実体（case-file.md:33、case-schema/rules/ 配下）と一致すること

## 対象外

- 同節の記述内容そのもの（comment_seq の仕様、case-schema 定義の構成）は変更しない。表現の現行化のみを対象とする
- docs-check ルール候補（Design 本文の命令形作業指示検出）は本成果物の受け入れ条件の拡張候補として付随記載する（独立 route としない。`docs-check ルール／検査データ追加候補は独立 route とせず、採用済み成果物の要件化方向または受け入れ条件に含める` 不変条件に従う）

## 後続 route

backlog-review（RU 化 → req-define/case 経由の修正実装）
