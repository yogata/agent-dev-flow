# IR-050/IR-051 の語彙レジストリ参照・閾値確定・3層検出構造 SPEC 整理（見送り）

## 観測

OU-002 Wave 2 (#1020 / PR #1024) で `integrity-rule-catalog.md` に IR-050（load_skills command 誤指定検出）・IR-051（実行主体の skill 表記誤認検出）を追加した。これらの detection_method は以下を前提とするが、本 Wave では確定まで至らず次工程以降に委譲された。

1. **語彙レジストリ存在前提**: IR-050/IR-051 の detection_method は `.opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md` を参照する。同レジストリに command 名・harness 名・subagent 名のエントリが存在することを Wave 3 以降で確認する必要がある（PR #1024 Findings）。
2. **閾値未確定**: IR-051 detection_method で言及した「一定文字距離内（同一段落・同行・隣接リスト項目等）」の具体的閾値（文字数・行数）は未確定。本 PR では判定アルゴリズムの方向性のみを記載（PR #1024 SPEC確定候補）。
3. **3層検出構造の責務分担**: 機械的検出（IR-050/IR-051）・意味的診断（inspect-skills REQ-0125-010）・査読時観点（doc-writing REQ-0140-027）の3層検出構造全体の責務分担を SPEC レベルで整理する価値がある。候補 SPEC は `docs/specs/integrity-contracts.md` または `docs/specs/writing-style.md`（PR #1024 SPEC確定候補）。

## 影響

- IR-050/IR-051 を `/repo/docs-check` 実装系で実際に適用するには語彙レジストリの存在確認と閾値確定が必須。現状では「ルールは定義済み・適用は次工程」の状態。
- 3層構造の責務分担が SPEC に明示されない場合、Wave 3 横断検出で「どの層がどの違反を検出すべきか」の判定が曖昧になるリスク。

## レビューで決めること

- Wave 3 (#1021) の横断検出実施前に、語彙レジストリの存在確認・エントリ補充を先行するか。
- IR-051 の閾値を `/repo/docs-check` 実装 Issue（別途起票想定）で確定し、IR-051 本体に反映するか。
- 3層検出構造の責務分担を `docs/specs/integrity-contracts.md` または `docs/specs/writing-style.md` に SPEC レベルで整理する Issue を起票するか。Wave 3 の入力とするか。

## 根拠

- PR #1024 Findings / Capture候補: https://github.com/yogata/agent-dev-flow/pull/1024
- PR #1024 SPEC確定候補: IR-050/IR-051 閾値確定・3層検出構造 SPEC 整理（case-close Step 3-2 (c) 見送り）
- 対象: `docs/specs/integrity-rule-catalog.md` IR-050・IR-051
- 関連 SPEC: `docs/specs/integrity-contracts.md`・`docs/specs/writing-style.md`・`docs/specs/skills/agentdev-inspect-skills.md`
- 後続 Wave: OU-002 Wave 3 #1021（横断検出・修正）
