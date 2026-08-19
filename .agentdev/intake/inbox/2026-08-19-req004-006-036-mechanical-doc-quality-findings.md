# REQ-004/006/036 の機械判定文書品質是正候補（一文一行・中黒並列・LLM 表現）

## 観測

agentdev-doc-writing の機械判定アルゴリズム（mechanical-replacement-rules.md）を `docs/requirements/REQ-004.md`・`REQ-006.md`・`REQ-036.md` へ適用した結果、履歴文脈注記の周辺部に是正候補を検出した（OU-0041 の TS-QC-001 判定時）。

1. 一文一行違反（prose 行に2文）: `REQ-006.md` L20（履歴文脈注記そのものが2文を1行で持つ）、`REQ-036.md` L10・L11（目的節、各2文）
2. 中黒並列: `REQ-006.md` L29「再分類・再保存」、L30「パス・分類・保存結果」、L36「保存結果参照・件数集計」。`REQ-036.md` L10「命名・用語基盤」「分類・昇格」、L40「文脈解釈・意味判断・設計妥当性判断」、L51・L62「severity・gate_level」（識別子並列）
3. LLM 表現機械判定: `REQ-004.md` L67（REQ-004-051）「において」→「で」
4. サンプリング査読観測（機械判定対象外）: `REQ-006.md` L10「における」、`REQ-004.md` L58（REQ-004-042）「について」

## 今回扱わない理由

Issue 2243（OU-0041）は移行注記の置換確認がスコープで、`docs/requirements/` の直接編集は対象外（要修正検出時は是正用要件doc 経由）。on_failure を record-in-findings で処理した。

## 影響

現行要件文書 3件に文書品質基準（japanese-tech-writing 機械判定）からの逸脱候補が残存する。

## レビューで決めること

- 是正用要件doc（docs_chore 系）として一括是正するか、機械判定の識別子並列（「severity・gate_level」等）を例外扱いするか
- REQ-006 L20 の履歴文脈注記の文分割が REQ-001-040（トレーサビリティ）と両立する形式か

## 根拠

- Issue 2243 完了判定記録コメント「Findings / Capture候補」（回収元: https://github.com/yogata/agent-dev-flow/issues/2243#issuecomment-5336194442 ）
