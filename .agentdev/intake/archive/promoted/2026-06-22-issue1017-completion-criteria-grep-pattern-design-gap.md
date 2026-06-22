# 完了条件の grep パターンが正規化済み SPEC の説明文を捕捉する設計ギャップ

## 観測

PR #1022 (Issue #1017) の完了条件「`load_skills=["ulw-loop"]` 0 件」「`ulw-loop.{0,10}(スキル|skill)` 0 件」を検証した結果、`docs/specs/` 配下で以下の説明文がヒットした。これらはすべて対象外ファイル（既に正規化済み SPEC・ガイダンス）内の否定文脈・anti-pattern 例示であり、実害はないが、完了条件の字面判定では「未達」と判定される設計上のギャップ。

- `docs/specs/commands/case-run.md` L23: 「旧仕様の `load_skills=["ulw-loop"]` は誤りであり、上記委譲契約に置換する。」（明示的な否定参照）
- `docs/specs/commands/case-run.md` L21: 「`/ulw-loop` は skill ではなく、委譲 prompt 内で実行される command である。」（"skill ではない" の否定）
- `docs/specs/writing-style.md` L43: 「command を skill と呼ぶ（例: `/ulw-loop` を skill と記述、`load_skills` に command 名を指定）」（anti-pattern 例示）

## 影響

- 今後同種の「誤用語の除去」完了条件を設定する場合、正規化済み SPEC 内の否定例・ガイダンス文が完了判定を阻害する。QG-4 で「字面は未達だが実質達成」との warn 判定が必要になり、判定の客観性が揺らぐ。
- 完了条件を「grep で 0 件」と機械的に書く運用が蔓延すると、ガイダンス文の表現自由度を不当に制約する（「〜は誤り」と書けなくなる）。

## レビューで決めること

- 完了条件の grep パターンを「実害のある使用箇所のみ捕捉」に精密化する運用ルールを文書化するか。候補:
  - (a) パターンに否定文脈除外条件を付与（例: 行頭が `-` `>` `|` 等のリスト/引用/テーブル行を除外、または直前に「誤り」「ではない」「例:」等の否定語彙がある行を除外）。
  - (b) 完了条件の文言を「`src/opencode/` 配下で 0 件（`docs/specs/` は説明文脈を許容）」のように対象スコープで段階化。
  - (c) 「`src/opencode/` 配下 0 件」のみを必須条件とし、`docs/specs/` は個別 review で判断。
- 本ギャップを `agentdev-req-structure-diagnostics` または `agentdev-quality-gates` の references に「完了条件 grep パターン設計時の注意」として明文化するか。
- 既存の他 Issue 完了条件にも同パターンの字面問題がないか横断検査するか（OU-002 Epic のスコープ候補）。

## 根拠

- PR #1022: https://github.com/yogata/agent-dev-flow/pull/1022（Findings / Capture候補 F-3 / QG-3 verdict: warn）
- Issue #1017: https://github.com/yogata/agent-dev-flow/issues/1017（完了条件 8, 9 の字面 vs 実質ギャップ）
- 対象パターン抽出元:
  - `docs/specs/commands/case-run.md` L21, L23
  - `docs/specs/writing-style.md` L43
- 関連 gate: QG-4 (Final Acceptance Gate)
- 後続 Epic: OU-002（文書責務境界の抜本修正）の候補対象
