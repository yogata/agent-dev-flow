# 学び・教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類・整理して永続的なドキュメントに移動する。

---

## Epic Orchestrator の Wave間変更漏れパターン

- **問題事象**: Epic Orchestrator による Wave 1（3子Issue並列）→ Wave 2（2子Issue並列）の実行後、最終コミット（dc32df0）で廃止コマンド名（intake-review, learning-refine, accepted/）の残存参照が残っていることを検知し、追加コミットで修正した
- **発生局面**: 実装
- **検知方法**: エージェントによる自律確認（最終コミット前の横断検索で残存参照を発見）
- **根本原因**: Wave 1 で各子Issueが独立して変更を行う際、他の子Issueの変更内容を踏まえた横断的な残存参照確認がWave間の境界で実行されなかった。各子Issueは自身のスコープ内の変更に集中し、全体の整合性確認がWave 2終了後まで遅延した
- **自律対応内容**: 最終コミット（dc32df0）で README.md、SKILL.md、workflow-lifecycle 等 6ファイルの残存参照を一括修正。内容は intake-review → intake-promote、learning-refine → learning-promote、accepted/ → inbox/ の置換
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（本質的には実行時の品質管理の話であり、ADR/REQ/specの定義には影響しない）
- **横展開観点**: 複数Wave構成のEpicで、後続Waveが先行Waveの変更を前提とする場合、各Wave終了時にスコープ横断的な残存参照検索を実行することで最終的な修正コミットを減らせる
- **再発条件**: 複数子Issueが同じファイル群を変更し、各子Issueが独立したスコープで参照更新を行う場合
- **予防策候補**: Wave完了時に「廃止対象キーワードの全文検索」を定型チェックとして組み込む。コマンド廃止系の変更では、廃止名をチェックリスト化してWave境界で検証する
- **想定反映先**: case-run の Wave完了時チェック手順、または workflow-orchestration スキルのWave境界検証ステップ
- **関連**: Issue #618, #619, PR #624, commit dc32df0
- **タグ**: `#epic-orchestrator` `#wave` `#残存参照` `#横断検証`

---

## runtime template path の暗黙参照が誤用を招くパターン

- **問題事象**: case-close が Issueコメントテンプレートの参照先を skill 名だけで記述し、runtime path が不明確だったため、command-local templates 側に誤探索するバグが発生。また case-auto が委譲先コマンド定義を読み込む際、`src/opencode/...` を runtime path に読み替えていた
- **発生局面**: 実行（case-auto / case-close）
- **検知方法**: コードレビュー（ユーザー指摘）
- **根本原因**: command定義内のテンプレート参照が skill 名のみの暗黙参照であり、runtime path が明示されていなかった。ADR-0013/0018でruntime/authoring分離は規定されていたが、command定義でのパス記述粒度が不足していた
- **自律対応内容**: case-close Step 4にruntime path（`.opencode/skills/agentdev-workflow-templates/templates/issue_comment_*.md`）を明示。case-autoにG11/G12 guardrail追加。artifact-contracts.mdにテンプレート種別別参照先テーブルを新設。REQ-0108に誤参照検出ルール（169-170）をAPPEND
- **ユーザー確認有無**: あり（Issue #625起票者が指摘）
- **ADR/REQ/spec影響**: artifact-contracts.md SPEC更新、REQ-0108 APPEND
- **横展開観点**: 他のcommand定義でもテンプレート参照が暗黙的になっていないか確認が必要
- **再発条件**: command定義がテンプレート参照をskill名のみで記述し、runtime pathを明示しない場合
- **予防策候補**: command定義のテンプレート参照は必ずruntime path（`.opencode/...`）を明示する。integrity-check（REQ-0108-169/170）でruntime path誤参照を検出
- **想定反映先**: agentdev-command-authoring の品質基準
- **関連**: Issue #625, PR #626
- **タグ**: `#runtime-path` `#template-resolution` `#command-definition` `#暗黙参照`

---
