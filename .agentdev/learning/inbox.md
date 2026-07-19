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

## extension が未サポート形式の brief 授権で意味マッピング処理するパターン

- **問題事象**: lightweight draft（Form C）形式の要件 doc を入力とした req-save / case-open で、req-save extension が Form C を明示サポートしていないため、要件マッピング（要件行 → REQ/ADR 紐付け）が extension の標準処理経路では処理できない事象が発生。今回の事例（Issue #1556、bugfix/small/Form C）では、extension 経路の自動処理に頼らずユーザーから明示的な brief 授権を受け、要件 doc の意味を読んで REQ-0158 へ REQ-0158-001 を APPEND する形でマッピングを完遂した。
- **発生局面**: 要件定義・保存（req-define → req-save、lightweight draft 入力時）
- **検知方法**: 手動確認。req-save extension の対象形式リストに Form C が含まれないことを踏まえ、本ケースでは brief 授権で直接処理する方針を選択。extension 経路を強制せず、意味マッピングを優先して完遂。
- **根本原因**: req-save extension の入力形式サポートが standard / lightweight（Form A/B）を前提としており、Form C（最 lightweight）が明示サポート対象外。Form C は要件 doc の構造が緩いため、extension のパターンマッチ処理が安定しないことが理由と推定される。一方で、要件の意味内容自体はマッピング可能なケースがあり、形式未サポートと意味未マッピングは同義ではない。
- **自律対応内容**: extension の Form C 未サポートを検知した後、ユーザーからの brief 授権（本ケースでは Form C 入力で REQ-0158 へ APPEND する意図の明示）を受けて、extension 経路を迂回し意味ベースで REQ-0158-001 を新設。req-save の成果物（REQ ファイル更新、`docs/requirements/README.md` のエントリ確認）は extension 経路と同等の品質を担保。Windows worktree lint 検証時のジャンクション手動作成パターン（既存 learning）と同等の「extension が未カバーする形式を brief 授権で補完」アプローチ。
- **ユーザー確認有無**: あり（brief 授権をユーザーから受領。Form C 入力時の REQ 追記方針を事前合意）
- **ADR/REQ/spec影響**: あり（要評価）。req-save extension の入力形式サポートを Form C まで拡張するか、または brief 授権経路を SPEC/extension で明文化するかの判断候補。REQ-0103（Artifact 責任分界）、REQ-0105（Intake / Learning / Backlog lifecycle）周辺、req-save SPEC、`agentdev-req-file-manager` skill 規約が関連。
- **横展開観点**: extension が標準サポート対象外の形式・経路（Form C 入力、adjacency marker 不在、RU 由来でない session-sourced 入力等）であっても、ユーザーの brief 授権があれば意味マッピング経路で完遂できる。extension 未サポートを即座にエラー停止せず、brief 授権経路へ分岐する判定を req-save / spec-save / case-open 共通で持つ価値がある。ただし brief 授権の判定基準・記録形式が未整備のため、整備が必要。
- **再発条件**: (1) lightweight draft（Form C）入力、(2) req-save / spec-save / case-open extension が Form C を明示サポートしない、(3) ユーザーの brief 授権が得られる、の全てが揃った場合。
- **予防策候補**: (a) req-save extension の入力形式サポートを Form C まで拡張し、自動処理経路を整備する。(b) brief 授権経路を SPEC/extension で明文化し、Form C 入力時の標準フォールバックとして位置付ける。(c) brief 授権を PR Findings 等の証跡に残す運用を case-open / req-save のガイドに明記し、後続の inspect 系ドリフト検出の material とする。
- **想定反映先**: req-save SPEC、`agentdev-req-file-manager` skill 規約、または workflow-lifecycle skill の work_type / draft_type 判定基準（Form C 入力時の extension 経路 vs brief 授権経路の分岐規則）
- **関連**: PR #1557, Issue #1556, draft_type=lightweight (Form C), REQ-0158-001 APPEND（commit `64745a36`）
- **タグ**: `#form-c` `#lightweight-draft` `#brief-authorization` `#extension-fallback` `#req-save` `#meaning-mapping`

## TS-004 subagent 委譲プロトコル適用効果の実証を record-in-findings で処理した判断基準

- **問題事象**: Issue #1566 テスト戦略 TS-004「#1538 と同等の case-open 委譲を `category=unspecified-high` + MUST NOT DO 強化プロンプトで実施し、スコープ逸脱なく case-open 本来責務に到達することを確認する」は、本 Issue の実装修復 OU-002/003/004（ドキュメント整備）単体では検証できない。case-close QG-4 評価時に合格・不合格の二値判定が下せない test strategy 項目。
- **発生局面**: case-close（QG-4 最終受け入れ）
- **検知方法**: Issue #1566 テスト戦略 TS-004 pass_criteria と本 PR 変更範囲（OU-002/003/004 のドキュメント整備のみ）の対比。PR #1539 で既に `category=unspecified-high` + MUST NOT DO 強化により #1538 スコープ逸脱が解消済みであることも確認。
- **根本原因**: TS-004 は「適用効果の運用観測」を合格基準に置いており、プロトコルを文書化する実装修復単体では完結しない。一方で REQ-0163 は #1538 由来事象（PR #1539）の解消知見を要件化したものであり、構造的に TS-004 pass_criteria（スコープ逸脱なし）を担保する。
- **自律対応内容**: record-in-findings 扱いで PR 本文の Findings/Capture候補 セクションに経緯と判断基準を記録し、次回 case-open 委譲時に個別 case で観測する運用知見として後続へ委譲。本 PR で別 case を起動して実証するのはスコープ膨張と判断し見送り。
- **ユーザー確認有無**: なし（エージェントが PR 本文に明記）
- **ADR/REQ/spec影響**: REQ-0163（本 Issue の要件基準）。REQ-0131-026（test strategy on_failure/pass_criteria に対する record-in-findings 運用）。次回 case-open 委譲時の観測結果次第で REQ-0163-001/002/003 の精査余地が生じうる。
- **横展開観点**: 「適用効果を観測する test strategy」全般に適用可能。実装修復 PR 単体では観測できず運用観測に委ねる TS 項目は、(a) 構造的担保（要件化）の確認、(b) 運用観測の判断基準明示、を両方 PR 本文 Findings に記録することで case-close QG-4 評価資料とする。
- **再発条件**: (1) test strategy が「適用効果の運用観測」を pass_criteria に含み、(2) 実装修復 PR がプロトコル文書化等の構造的担保のみを提供し観測を含まない場合。
- **予防策候補**: case-open でテスト戦略を記載する際、「適用効果観測」型の TS は on_failure に「次回適用時に観測」と明示し、本 PR で完結しないことを case-open 時点で構造化する。QG-4 で record-in-findings 判断基準を共通化する。
- **想定反映先**: quality-gates skill `references/qg-4-final-acceptance.md`（record-in-findings 判断基準）、workflow-templates skill `templates/issue_desc_feature.md`（test strategy on_failure 記載ガイド）
- **関連**: PR #1568, Issue #1566, TS-004, REQ-0163, Issue #1538（由来事象）, PR #1539（解消 PR）, REQ-0131-026
- **タグ**: `#test-strategy` `#record-in-findings` `#subagent-protocol` `#qg-4` `#case-close` `#req-0163`
