# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## Windows worktree 環境で lint_skills.ts を実行するためのジャンクション一時作成パターン

- **問題事象**: Windows + ジャンクション環境の git worktree（`.worktrees/{N}`）で `lint_skills.ts` を実行すると、メインリポジトリで `sync-self-opencode.ps1` / `install-consumer-opencode.ps1` が作成する `.opencode/skills/{name}` へのジャンクションリンクが worktree 側に伝播しておらず、配布スキル（`japanese-tech-writing` 等）が検査対象に出力されず WARNING が正しく評価できない。今回の事例では PR #1551 の TS-001（AG-001 lint WARNING 0件確認）で発生。AGENTS.md の case-run 制約事項「準備フェーズの既知の制約（Windows + ジャンクション環境）」に該当。
- **発生局面**: 実装（case-run driver 実行フェーズ、worktree 内での lint 検証）
- **検知方法**: 手動確認。`lint_skills.ts` を worktree 内で実行した際、`japanese-tech-writing` SKILL.md についての結果行が出力されず、frontmatter description の trigger 記述欠落 WARNING が表示されないことで気付いた。
- **根本原因**: git worktree 作成時にメインリポジトリのジャンクションリンク（`.opencode/skills/{name}` → `src/opencode/skills/{name}`）は伝播しない。`.opencode/` 配下のジャンクション構造は git 管理対象外（`.gitignore`）のため worktree 側に再現されない。
- **自律対応内容**: 同期スクリプト（`sync-self-opencode.ps1` 等）には依存せず、検証目的で `New-Item -ItemType Junction -Path .opencode/skills/japanese-tech-writing -Target ../../src/opencode/skills/japanese-tech-writing` で手動作成して `lint_skills.ts` を実行。検証完了後にジャンクションを削除。ジャンクションは `.gitignore` 対象のため `git status` に現れず commit 対象外となり、作業ツリーの汚染なし。
- **ユーザー確認有無**: なし（エージェント自律で実施。AGENTS.md の case-run 制約事項は既知の前提）
- **ADR/REQ/spec影響**: なし。本件は case-run skill の既知制約（`references/self-healing-and-errors.md` 該当セクション）の具体的事例であり、新規 ADR/REQ/spec 影響はない。ジャンクション再作成手順は case-run skill 既存手順に準拠。
- **横展開観点**: Windows + ジャンクション環境で `.opencode/skills/` 配下を走査するツール（`lint_skills.ts`, `check_extensions.ts` 等）を worktree 内で実行する際、必要なスキル名のジャンクションだけを一時作成して検証後に削除するパターンが適用可能。全スキル再作成ではなく検証対象のみ作成する最小限アプローチで済む。Linux/macOS 環境では発生しない。
- **再発条件**: (1) Windows 環境、(2) git worktree を使用、(3) `.opencode/skills/` 配下を走査する検査ツールを worktree 内で実行、(4) メインリポジトリで `sync-self-opencode.ps1` 実行後に worktree を作成、の全てが揃った場合。
- **予防策候補**: (a) case-run driver 引き継ぎプロンプトに「lint_skills.ts 等の `.opencode/skills/` 走査ツール実行前に必要なジャンクションを一時作成し、検証後に削除」の手順を明記する（現在は case-run skill AGENTS.md の制約事項記載にとどまる）。(b) 同期スクリプトに worktree 単位のジャンクション再作成オプションを追加する。
- **想定反映先**: case-run skill `references/subagent-protocol.md` の「driver 起動プロンプトテンプレート（Windows + ジャンクション環境）」セクション、または case-run skill の「準備フェーズの既知の制約」セクションに lint 検証時の一時ジャンクション作成パターンを具体例として追記。
- **関連**: PR #1551, Issue #1550, AGENTS.md case-run「準備フェーズの既知の制約（Windows + ジャンクション環境）」, case-run skill `references/self-healing-and-errors.md`
- **タグ**: `#windows` `#junction` `#worktree` `#lint-skills` `#case-run` `#workaround`

## 要件追加が既存基準の明文化で実変換を伴わない no-op パターン

- **問題事象**: TS-002（配布物 Markdown BOM なし UTF-8 統一）を含む Issue で、配布物が既に BOM なし UTF-8 へ準拠済みであるにもかかわらず、新規要件（REQ-0108-271）の追加が発生した。要件追加は将来のドリフト防止が主目的で、実変換は不要であった。しかし pass_criteria の表現からは「実変換を伴う合格」と「no-op confirmed の合格」の区別が読み取れず、レビュー時にスコープ過大評価やテスト不足誤認の恐れがあった。
- **発生局面**: レビュー・クローズ（case-run 終了後、case-close での完了条件照合時）
- **検知方法**: 手動確認。配布物 Markdown の BOM 有無をバイト先頭確認で走査した結果、変換対象ファイル 0件であった。worktree HEAD が `origin/main`（`b0a00fe1`）到達時点でエンコーディング変更不要であり、全配布物が既に BOM なし UTF-8 へ準拠済みと判明。
- **根本原因**: pass_criteria が状態（BOM なし UTF-8 であること）を規定するのみで、遷移（変換を実施したか、既存準拠か）を区別しない。そのため「fail 0件」の合格が、変換起因か元から不合格でなかったか、pass_criteria 文面からは判別できない。AG-002 のスコープ判断が PR 本文 Findings での明示に依存していた。
- **自律対応内容**: 本 Issue の case-run で PR 本文の TS-002 結果欄に「no-op confirmed」と明記し、変換ファイルリストが空であることをテスト戦略欄と突合して評価者が誤認しないよう措置。新規要件（REQ-0108-271）は将来のドリフト防止目的であることを Findings に併記。
- **ユーザー確認有無**: なし（エージェント自律で PR 本文に明記）
- **ADR/REQ/spec影響**: なし（本件は pass_criteria の運用上の読み取り方の知見であり、REQ/SPEC 文面の改訂を要しない）。REQ-0108-271 自体は将来のドリフト防止要件として有効。
- **横展開観点**: pass_criteria が「状態」を規定するテスト戦略（エンコーディング、リンタ0件、フォーマット準拠等）で、要件追加が既存基準の明文化に過ぎないケース全般に適用可能。case-run は PR 本文の該当 TS 結果欄に「no-op confirmed」「conversion applied」等の遷移区分を明示することで、case-close の QG-4 評価および将来の inspect 系ドリフト検出の material として機能する。
- **再発条件**: (1) 既存基準に合致済みの状態を規定する pass_criteria、(2) 将来のドリフト防止を主目的とする新規要件追加、(3) case-run が no-op であることを PR 本文に明示しない、の全てが揃った場合。
- **予防策候補**: (a) case-run テンプレート（pr_desc.md）の Test Strategy 結果欄に「状態合格」か「変換実施」かの区分を小タグ等で明記する項を設ける。(b) QG-4 評価時に「状態合格で変換 0件」のケースを明示的に許容する観点を qg-4-final-acceptance.md に追記する。
- **想定反映先**: workflow-templates skill `templates/pr_desc.md`（Test Strategy 結果欄）、quality-gates skill `references/qg-4-final-acceptance.md`（test strategy 処理完了の検査観点）
- **関連**: PR #1553, Issue #1552, AG-002, TS-002, REQ-0108-271（commit `d9480642`）
- **タグ**: `#no-op` `#pass-criteria` `#test-strategy` `#case-run` `#case-close` `#qg-4`

## worktree ジャンクション未伝播環境での README 参照 fallback 実装パターン

- **問題事象**: Windows + ジャンクション環境の git worktree（`.worktrees/{N}`）で `commands_e2e.test.ts` を実行すると、`SKILLS_DIR` / `TEMPLATES_DIR` が projection（`.opencode/`）を前提としていたため、worktree 内に `.opencode/commands/agentdev/README.md` が存在せずテストが fail した。メインリポジトリで `sync-self-opencode.ps1` / `install-consumer-opencode.ps1` が作成する `.opencode/commands/agentdev/` 等のジャンクションが worktree 側に伝播しないため。
- **発生局面**: 実装（case-run driver 実行フェーズ、worktree 内での e2e テスト実行）
- **検知方法**: CI / ローカルテスト実行。`commands_e2e.test.ts` が README listing を projection パスから読み取れず、58件 fail の一部として報告。
- **根本原因**: git worktree 作成時にメインリポジトリのジャンクションリンク（`.opencode/commands/agentdev/` → `src/opencode/commands/agentdev/` 等）は伝播しない。`.opencode/` 配下のジャンクション構造は git 管理対象外（`.gitignore`）のため worktree 側に再現されない。テストコードが projection パスのみを前提としていたことが直接原因。
- **自律対応内容**: `commands_e2e.test.ts` の `SKILLS_DIR` / `TEMPLATES_DIR` 解決部に source（`src/opencode/`）への fallback パス解決を追加。projection が存在しない場合は source を参照する挙動とし、worktree 内でもテストが実行可能になった。同期スクリプトには依存せず、テストコード側で両パスを許容する設計。
- **ユーザー確認有無**: なし（エージェント自律で実装。AGENTS.md の case-run 制約事項「準備フェーズの既知の制約（Windows + ジャンクション環境）」の具体的事例）
- **ADR/REQ/spec影響**: なし。本件はテストコードの環境差吸収の実装パターン拡充であり、新規 ADR/REQ/spec 影響はない。ジャンクション未伝播自体は case-run skill の既知制約。
- **横展開観点**: Windows + ジャンクション環境で projection（`.opencode/`）配下を走査する検査ツール・テストコード全般に適用可能。projection → source の段階的パス解決（fallback）を実装しておくと、worktree 内でもジャンクション再作成なしに検証可能。`lint_skills.ts`, `check_extensions.ts`, `check_changed_docs.ts` 等の既存ツールも同様の fallback 検討余地あり。
- **再発条件**: (1) Windows 環境、(2) git worktree を使用、(3) テストコード・検査ツールが projection（`.opencode/`）パスのみを前提、(4) メインリポジトリで `sync-self-opencode.ps1` 実行後に worktree を作成、の全てが揃った場合。
- **予防策候補**: (a) projection / source のパス解決ヘルパを共通化し、新規テスト・検査ツールが暗黙に利用する仕組み。(b) case-run driver 引き継ぎプロンプトに「projection パスを参照するテストは source fallback 実装を確認」の項を追加する。
- **想定反映先**: repo-agentdev-integrity skill（`commands_e2e.test.ts` 等のテストコード規約）、case-run skill `references/subagent-protocol.md` の「driver 起動プロンプトテンプレート（Windows + ジャンクション環境）」セクション
- **関連**: PR #1553, Issue #1552, AG-001（EXPECTED_COMMANDS vs README listing 照合）, AGENTS.md case-run「準備フェーズの既知の制約（Windows + ジャンクション環境）」
- **タグ**: `#windows` `#junction` `#worktree` `#e2e-test` `#fallback` `#case-run`
