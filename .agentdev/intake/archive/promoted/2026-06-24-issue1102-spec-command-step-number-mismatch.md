# SPEC と command の Step 番号ずれ（req-define.md）

## 発生源

- Issue: #1102
- PR: #1103 (merged, squash 88599d6c)
- 発生日: 2026-06-24

## 内容

`docs/specs/commands/req-define.md`（SPEC）と `src/opencode/commands/agentdev/req-define.md`（command 定義）で Step 番号が 1 ずれている。

- SPEC: 「Step 4: 要件展開（4-1〜4-5）」
- command: 「Step 5: 要件展開（5-1〜5-5）」

原因は SPEC が Step 0「セッションコンテキスト検知」を独立番号扱いするため。PR #1103 では内容で「SPEC Step 4-1 = command Step 5-1（変更影響候補抽出）」「SPEC Step 4-4 = command Step 5-4（ADR要否確認ゲート）」と特定して整合を取った。番号ずれ自体は既存の表記慣行であり本 PR では修正していない。

影響範囲: Issue #1102 の完了条件・テスト戦略の記述は SPEC 準拠（Step 4-1, 4-4）で記載されており、PR #1103 実装は command 準拠（Step 5-1, 5-4）で行われた。双方が Step 番号を明記する場面で都度変換が必要になる。

## 推奨対応先

別 Issue で SPEC/command の Step 番号を統一することを検討。選択肢:

- (a) SPEC の Step 0 を「Step 0」のまま残し、Step 1〜 から採番し直して command と一致させる（SPEC 側で +1 シフト）
- (b) command 側で Step 0 扱いを廃止し SPEC と一致させる
- (c) SPEC と command 双方で「Step 0: セッションコンテキスト検知」を明示的に採番対象とし統一

いずれも req-define.md のみならず他 command/SPEC ペアにも同種のずれがないか横展開確認が必要。

## 現在の追跡状態

- PR #1103 Findings に記録済み（番号ずれ自体は修正せず、内容で整合担保）
- 完了条件 #1102: Step 4-1, 4-4 の記述で SPEC 準拠表記を使用、実装は Step 5-1, 5-4 で対応
- 別 Issue 化: 未実施（本 intake が作業候補の起点）
