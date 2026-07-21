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

## call_omo_agent schema 制約による委譲起動不可とインライン逐次実行時の adapter protocol 遵守

- **問題事象**: oh-my-openagent ハーネスの `call_omo_agent` ツール schema は `subagent_type` に explore/ librarian 型のみを許可し、adapter skill（`agentdev-case-run-execution-adapter`）が定義する実行担当サブエージェント型（custom agent 型）を起動できない。Epic Wave 並列委譲（最大5件）も機能しない。PR #1576（Issue #1573 Phase 2）で顕在化。
- **発生局面**: case-run（実行担当サブエージェントへの委譲起動を試みるフェーズ）
- **検知方法**: 現ハーネスの `call_omo_agent` tool description に "Only explore and librarian are allowed" "Other built-in agents, custom agents, and task categories are intentionally not supported by this tool" と明記されていることを確認。本 PR 実行経路自体が制約下でのインライン逐次実行の実証。
- **根本原因**: adapter skill は前提として「実行担当サブエージェント型を起動できるハーネス」を想定していたが、oh-my-openagent ハーネスでは tool schema が明示的に custom agent 型を拒否する。adapter skill L131-148 の事後フォールバックパス（委譲起動失敗時）で運用は完結するが、事前 probe（ハーネス能力検出）と委譲可否判断、委譲不可時の Inability 冒頭明示が adapter skill に未明文化だった。
- **自律対応内容**: Phase 1 で REQ-0149-012 を APPEND して事前 probe、委譲可否判断、Inability 冒頭明示、インライン逐次実行時の adapter protocol 遵守、Epic Wave 並列委譲不可時の運用明文化を要件化。Phase 2 で adapter SKILL.md に「ハーネス制約適応（call_omo_agent schema 制約時）」セクション、`capture-boundaries.md` に「委譲可否 probe と Inability 記録」セクションを新設。本 PR 実行時も制約により委譲起動不可、Sisyphus-Junior が親 context 内で adapter protocol に従いインライン逐次実行で実装した。
- **ユーザー確認有無**: なし（エージェント自律で実証、PR 本文 Findings に明記）
- **ADR/REQ/spec影響**: REQ-0149-012（本件で要件化）。ADR-0130（`agentdev-gh-cli` を差し替え可能な I/O 境界として確立、参考）。親学習 RU-0017（harness-delegation-constraint.md）。
- **横展開観点**: 別ハーネス（OpenCode 標準、Codex 等）への移行時にも、当該ハーネスが custom agent 型を許可するかを事前 probe する必要がある。adapter skill はハーネス非依存の protocol とハーネス依存の起動実装を分離して保持する設計が本件で有効性を実証された。
- **再発条件**: (1) adapter skill が想定する custom agent 型をハーネスが許可しない場合、(2) `call_omo_agent` 相当の委譲起動 API の schema が限定列挙型で型を固定している場合。
- **予防策候補**: adapter skill がハーネス導入時に `references/<harness>.md` へ能力 probe 手順を必須記載する運用。case-run は委譲起動前に probe を実施し result に Inability を含める。
- **想定反映先**: `agentdev-case-run-execution-adapter` SKILL.md「ハーネス制約適応」節（本 PR で新設済み）、`agentdev-workflow-orchestration/references/capture-boundaries.md`「委譲可否 probe と Inability 記録」節（本 PR で新設済み）
- **関連**: PR #1576, Issue #1573, REQ-0149-012, RU-0017, ADR-0130, PR #1068（L-004）, PR #1103（L-010）
- **タグ**: `#harness-constraint` `#adapter-skill` `#inline-execution` `#delegation` `#req-0149-012`

## bg task 異常終了からの回復パターン（commit 作成済み・PR 作成前 task 破棄）

- **問題事象**: case-run が worktree で commit を作成した後、PR 作成を待たずに bg task が異常終了（task 破棄）した。PR が未作成のまま case-auto 親ループへ制御が戻り、Phase 2 成果物が GitHub 上で行き場を失う状況が発生した。PR #1578（Issue #1575 Phase 2）で顕在化。
- **発生局面**: case-run（実装フェーズ完了後、提出フェーズの PR 作成直前/最中に task が破棄）
- **検知方法**: case-auto 親ループが case-run 子 task の終了ステータスを確認し、実装 commit が worktree に存在するのに PR が未作成であることを検出。
- **根本原因**: case-run 子 task は worktree に commit を作成した段階で進行中だが、ハーネスの bg task 機能は親ループへ制御を戻す際に子 task を破棄できる。子 task のライフサイクルと成果物（commit）のライフサイクルが分離されておらず、PR 作成完了前に task が破棄されると成果物が行き場を失う。
- **自律対応内容**: case-auto 親ループが子 task 破棄を検知後、(a) worktree の commit を確認、(b) origin/main を fetch して rebase（必要時）、(c) feature ブランチへ push、(d) PR 作成を代行することで回復。本 PR #1578 はこの回復パスで作成された。
- **ユーザー確認有無**: なし（エージェント自律で回復、PR 本文 Findings に明記）
- **ADR/REQ/spec影響**: なし。本件は case-auto の回復ループ知見であり、新規 ADR/REQ/spec 影響はない。case-auto の自律継続動作の延長。
- **横展開観点**: case-auto が case-run を子 task として起動する全ケースで適用可能。子 task の中断/破棄を検知した場合、(a) worktree の commit 有無確認、(b) commit が存在する場合は rebase + push + PR 作成を親が代行するパターンが有効。Epic Wave 並列委譲でも同様の子 task 破棄回復パスとして機能する可能性がある。
- **再発条件**: (1) case-run 子 task が commit を作成した後、PR 作成前にハーネスが task を破棄した場合、(2) case-auto 親ループが子 task の中断を検知できる場合。
- **予防策候補**: (a) case-auto 親ループに「子 task 中断検知 → worktree commit 確認 → PR 作成代行」の標準回復パスを組み込む。(b) case-run 子 task は commit 作成直後に PR 作成までを一単位として実行する（task の中途終了確率を下げるための粒度調整）。
- **想定反映先**: case-auto command SPEC（子 task 中断回復パス）、workflow-orchestration skill（子 task ライフサイクルと成果物ライフサイクル分離）
- **関連**: PR #1578, Issue #1575, case-auto, case-run
- **タグ**: `#case-auto` `#case-run` `#bg-task` `#recovery` `#pr-creation`

## bg task 異常終了からの回復パターン（未コミット変更あり・作業中 task 破棄）

- **問題事象**: case-run が req-save.md, spec-save.md 編集中（未コミット）に bg task が異常終了（task 破棄）。case-run は spec-save.md 編集途中で停止し、worktree に未コミット変更のみが残り、commit も PR も未作成の状態になった。PR #1579（Issue #1577 Phase 2）で顕在化。
- **発生局面**: case-run（実装フェーズの作業中、ファイル編集が完了する前に task が破棄）
- **検知方法**: case-auto 親ループが case-run 子 task の終了ステータスを確認し、worktree に未コミット変更が存在するのに commit も PR も未作成であることを検出。
- **根本原因**: case-run 子 task は編集途中でもハーネスの bg task 機能が親ループへ制御を戻す際に task を破棄できる。子 task のライフサイクルと作業中の変更（working tree）のライフサイクルが分離されておらず、commit 前に task が破棄されると working tree に変更が残留する。既知の PR #1578 回復パターン（commit 済み・PR 未作成）の一段手前の状態。
- **自律対応内容**: case-auto 親ループが子 task 破棄を検知後、(a) worktree の git status で未コミット変更を確認、(b) 変更内容が case-run の意図通り（req-save.md, spec-save.md の concrete パス参照除去）であることを確認、(c) 親が commit 作成を代行、(d) origin/main を fetch して rebase、(e) feature ブランチへ push、(f) PR 作成を代行することで回復。本 PR #1579 はこの回復パスで作成された。
- **ユーザー確認有無**: なし（エージェント自律で回復、PR 本文 Findings に明記）
- **ADR/REQ/spec影響**: なし。本件は case-auto の回復ループ知見（PR #1578 パターンの拡張）であり、新規 ADR/REQ/spec 影響はない。case-auto の自律継続動作の延長。
- **横展開観点**: case-auto が case-run を子 task として起動する全ケースで適用可能。子 task の中断/破棄を検知した場合、(a) worktree の git status で未コミット変更有無確認、(b) 変更内容が case-run の作業意図と整合するか確認、(c) commit → rebase → push → PR 作成を親が代行するパターンが有効。PR #1578（commit 済み・PR 未作成）と #1579（未コミット変更）で2パターンの回復を確認。Epic Wave 並列委譲でも同様の子 task 破棄回復パスとして機能する可能性がある。
- **再発条件**: (1) case-run 子 task がファイル編集中（commit 前）にハーネスが task を破棄した場合、(2) worktree に未コミット変更が残留、(3) case-auto 親ループが子 task の中断と未コミット変更を検知できる場合。
- **予防策候補**: (a) case-auto 親ループに「子 task 中断検知 → worktree git status 確認 → 未コミット変更あり場合は内容確認 → commit → rebase → push → PR 作成代行」の標準回復パスを組み込む。(b) case-run 子 task は細粒度で commit を作成する（編集途中でも意味単位で commit することで、task 破棄時の回復範囲を限定）。
- **想定反映先**: case-auto command SPEC（子 task 中断回復パス拡張: commit 済みケースと未コミットケースの2パターン）、workflow-orchestration skill（子 task ライフサイクルと working tree ライフサイクル分離）
- **関連**: PR #1579, Issue #1577, PR #1578（先行する commit 済み・PR 未作成ケース）, Issue #1575, case-auto, case-run
- **タグ**: `#case-auto` `#case-run` `#bg-task` `#recovery` `#uncommitted-changes` `#pr-creation`

## ADR frontmatter の relates-to / supersedes を本文と Decision Map で表現する運用

- **問題事象**: ADR-0138 を新規作成する Issue #1582 の完了条件に「relates-to=ADR-0136,ADR-0137,ADR-0129,ADR-0132、supersedes=none であること」と frontmatter 項目として扱う前提で記載されていた。しかし本リポジトリの ADR frontmatter は `id/title/status/created/updated` のみで構成され（ADR-0135/0136/0137/0138 で一貫）、`relates-to` / `supersedes` は本文「関連する決定」セクションと ADR-README の Decision Map テーブルで表現する形式が採用されている。Issue 完了条件の記述と実体の表現形式が一致しておらず、QG-4 評価時に形式の齟齬を解釈する手間が発生した。
- **発生局面**: レビュー・クローズ（case-close の QG-4 完了条件評価）
- **検知方法**: 手動確認。PR #1589 の QG-3 staleness check で ADR-0138 frontmatter に `relates-to` / `supersedes` が無いことを確認し、Decision Map と本文「関連する決定」セクションで表現されていることを照合。
- **根本原因**: case-open が Issue 完了条件を起票する際、ADR frontmatter の形式を `id/title/status/created/updated/relates-to/supersedes` の7項目と想定して記載した。リポジトリの実運用では relates-to / supersedes を frontmatter ではなく本文 + Decision Map で表現する方針が暗黙に採用されているが、これが SPEC/ガイドレベルで明文化されていないため、case-open の自動生成条件文に齟齬が混入した。
- **自律対応内容**: PR #1589 本文の Findings セクションに「ADR frontmatter は id/title/status/created/updated のみ。relates-to/supersedes は本文と Decision Map で表現する形式」と明記し、Issue 完了条件を実体の表現形式で達成していることを記録した。Issue 本文の完了条件は frontmatter 項目としての記載のままで、case-close で実体照合により pass 判定。
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: あり。document-type-responsibilities SPEC または ADR 運用ガイドで「ADR frontmatter の必須項目は id/title/status/created/updated。relates-to/supersedes は本文 + Decision Map で表現する」ことが明文化されていない。ADR 形式 SPEC への追記候補。
- **横展開観点**: REQ/ADR を対象とする case-open の自動完了条件生成で、対象文書の実運用形式（frontmatter vs 本文 vs 別ファイル）を前提とする記述を置く際、実形式との整合を確認せず一般的テンプレートで記載すると同種の齟齬が再発する。SPEC や README の形式定義を参照してから完了条件を書く、または「実運用形式に従い表現されていること」の抽象度で記載することが望ましい。
- **再発条件**: (1) ADR を新規作成または更新する Issue を case-open が起票する、(2) 完了条件に frontmatter 項目として relates-to/supersedes を指定する、(3) リポジトリの実運用が frontmatter 項目ではなく本文 + Decision Map 表現を採用している、の全てが揃った場合。
- **予防策候補**: (a) ADR 形式 SPEC または agentdev-adr-file-manager skill に「ADR frontmatter 構成要素（id/title/status/created/updated の5項目）と relates-to/supersedes の表現場所（本文 + Decision Map）」を明文化する。(b) case-open テンプレートで ADR を対象とする完了条件を「指定メタデータが frontmatter または本文の適切な位置に表現されていること」の抽象度で記載する。
- **想定反映先**: ADR 運用形式 SPEC（document-type-responsibilities 配下）、agentdev-adr-file-manager skill、case-open テンプレート（ADR 対応の完了条件記述抽象度）
- **関連**: PR #1589, Issue #1582, Epic #1581, ADR-0138, ADR-0136（限定注記）, ADR-README Decision Map
- **タグ**: `#adr` `#frontmatter` `#case-open` `#completion-criteria` `#qg-4` `#form-policy`

## call_omo_agent が explore/librarian 型のみ許可されるハーネス制約と adapter protocol の運用

- **問題事象**: Issue #1588（harness-separation-model.md SPEC update）の検証・PR 作成フェーズで、oh-my-openagent ハーネスの `call_omo_agent` が explore/librarian 型サブエージェントのみ許可し、case-run 実行担当サブエージェントを直接起動できない制約に直面。adapter protocol に従い case-run 実行コンテキストをインライン逐次実行に切り替えて検証・PR 作成を実施した。この制約は adapter protocol で規定される想定パスであるが、ハーネス固有の制約が adapter protocol 経由で発火する具体的事例として記録する。
- **発生局面**: 実装・検証（case-run 実行フェーズ、インライン逐次実行での SPEC 検証・PR 作成）
- **検知方法**: 実行時エラー。`call_omo_agent` で case-run 実行担当サブエージェント起動を試行した際、ハーネスが explore/librarian 型のみ許可する制約により起動を拒否され、adapter protocol の delegation-unavailable パスへ分岐。
- **根本原因**: oh-my-openagent ハーネスの `call_omo_agent` API はセキュリティ/責務境界の観点から explore/librarian 型のみ許可する設計。case-run 実行担当サブエージェントは別途規定される起動 API（`task()` 等の標準 OpenCode API、`references/<harness>.md` 参照）を経由する必要がある。adapter protocol はこの差異を抽象化するが、ハーネス側 API の制約が具体化された形での発火事例。
- **自律対応内容**: adapter protocol の delegation-unavailable パスに従い、case-run 実行コンテキストをインライン逐次実行へ切り替え、SPEC 検証・PR 作成を case-close 側の責務範囲で完結。委譲起動不能を PR 本文 Findings に記録。
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし。adapter protocol で規定される delegation-unavailable パスの正常発火事例であり、新規 ADR/REQ/spec 影響はない。harness-separation-model.md SPEC で規定される「実行担当サブエージェント起動 API は harness 側」という責務分離の実例。
- **横展開観点**: oh-my-openagent 以外のハーネスでも、サブエージェント起動 API の型制限や権限スコープ制限により `call_omo_agent` 等の API が explore/librarian 型のみ許可するケースがある。adapter protocol 経由で case-run を委譲する設計はこの差異を吸収する前提であり、委譲先が限定される場合はインライン逐次実行へのフォールバックが標準パスとして機能する。
- **再発条件**: (1) oh-my-openagent ハーネスまたは同等の API 制限を持つハーネスで case-run を起動する、(2) `call_omo_agent` 等の限定 API で case-run 実行担当サブエージェントを起動しようとする、(3) adapter protocol が委譲失敗を検知し delegation-unavailable パスへ分岐する、の全てが揃った場合。
- **予防策候補**: (a) case-run command SPEC の「インライン逐次実行」セクションに、`call_omo_agent` 型制限への遭遇を想定する旨を明記し、adapter protocol delegation-unavailable パスとの接続を整理する。(b) `references/<harness>.md` で各ハーネスのサブエージェント起動 API 一覧と型制限を明示する。
- **想定反映先**: case-run command SPEC（インライン逐次実行セクション）、adapter protocol skill、`references/<harness>.md`
- **関連**: PR #1594, Issue #1588, Epic #1581, harness-separation-model.md, adapter protocol, agentdev-case-run-execution-adapter skill
- **タグ**: `#harness` `#oh-my-openagent` `#call-omo-agent` `#adapter-protocol` `#delegation-unavailable` `#case-run` `#inline-execution`
## 2026-07-19: 監査フェーズを one-time ライフサイクルとして独立させると未決事項確定不可制約を守りやすい

- **問題事象**: AgentDevFlow 統合再編計画のように「現状の監査」と「再編処置の確定」が混在する計画では、監査台帳なしに処置割当（KEEP/MERGE/REFERENCE/DERIVE/GENERATE/RETIRE）を確定しようとすると「未決事項確定不可」制約に抵触する恐れがあった。実際に Issue #1596 では全体を単一 Epic ドラフトにする案（CR-001）がこの制約抵触リスクとして検出された。
- **発生局面**: 要件定義（req-define でのフェーズ分割判断）
- **検知方法**: 計画文書の分析と CR-001 検討を通じた意味確認。Oracle Q4 検証で「監査→再編」の二相性と one-time 分類が必然と確認。
- **根本原因**: 大規模変更計画で「分析フェーズ」と「処置確定フェーズ」を分離せず一括確定しようとする設計は、前提情報（台帳）不足のまま判断を強いる構造的問題を抱える。
- **自律対応内容**: 第1ドラフトを監査フェーズ（one-time ライフサイクル）のみに限定し、再編フェーズは別セッションで生成するよう分離。計画 Section 1 の4硬制約（特に未決事項確定不可）を守る構成とした。
- **ユーザー確認有無**: あり（ユーザー合意「決定1: 監査フェーズを独立」として探求的req-defineで合意）
- **ADR/REQ/spec影響**: なし。本知見は既存 backlog-artifact-lifecycle SPEC の one-time 分類を活用した運用知見であり、新規 ADR/REQ/spec 変更不要。SC-003（監査台帳ライフサイクル SPEC 候補）として再編フェーズで SPEC 化の候補。
- **横展開観点**: 大規模変更計画全般で「前提分析フェーズ」と「処置確定フェーズ」の分離パターンが有効。フェーズごとに別 Issue/Case とし、one-time 成果物（台帳・照合表）を橋渡しに使う構成は他プロジェクトの大規模リファクタでも適用可能。
- **再発条件**: (1) 大規模変更計画を立ち上げる、(2) 現状分析と処置確定が未分離、(3) 監査台帳等の前提情報がない、(4) 計画文書で「未決事項確定不可」制約を掲げる、の全てが揃った場合。
- **予防策候補**: (a) req-define スキルの探求的フェーズで「分析→処置確定」の二相性を常に検査する観点を追加する。(b) one-time ライフサイクルと standard ライフサイクルの使い分け基準を backlog-artifact-lifecycle SPEC に例示付きで追記する。
- **想定反映先**: agentdev-req-analysis skill（探求的req-define のフェーズ分割観点）、docs/specs/workflows/backlog-artifact-lifecycle.md（one-time 適用例の追記候補）
- **関連**: PR #1597, Issue #1596, CR-001, CR-002, backlog-artifact-lifecycle SPEC, intake item intake-2026-07-19-spec-candidate-audit-ledger-lifecycle.md
- **タグ**: #req-define #one-time #phase-separation #large-scale-change #governance #exploratory

## 2026-07-19: 索引類の件数表明は実ファイルから GENERATE 可能で人手更新漏れを根絶できる

- **問題事象**: 監査フェーズ AG-005 で検出された ADR README のキャプションずれ（実測 accepted 25件 vs キャプション「24件」、F-001）や accepted リストの ADR-0137 欠落（F-002）のように、README 群の件数・一覧表記は人手更新に依存しており追加時の更新漏れが散発する。REQ-0157 未使用番号（F-003）、IR-045 欠番（F-004）、トピック別ビューの ADR-0137 欠落（F-005）も同じ類の問題。
- **発生局面**: 実装・保守（ADR/REQ 追加時の README 整合性維持）
- **検知方法**: 監査フェーズ AG-001 の実ファイル列挙と AG-005 の索引類照合で検出。glob パターンと Get-ChildItem -Recurse の交差検証で抽出。
- **根本原因**: 索引類（docs/requirements/README.md, docs/adr/README.md, mapping-table.md 等）が人手更新を前提としており、要件/ADR/IR 追加時の整合性維持が個人の注意力に依存している。既存 IR-042 (hardcoded-req-count) 等で検出はできるが、自動生成までは至っていない。
- **自律対応内容**: 本監査フェーズでは検出と台帳記録までで保留（4硬制約「新規REQ/ADR原則追加不可」「公開command動作不改」遵守）。AG-006 候補 #2/#3 として README 自動生成パイプラインを提案し、SC-002（索引類自動生成 SPEC 候補）として case-close で記録。
- **ユーザー確認有無**: なし（監査結果の記録と候補提示はエージェント自律で実施）
- **ADR/REQ/spec影響**: なし（本 Issue は artifact_actions 空で SPEC 変更なし）。SC-002 を intake に記録し、再編フェーズ以降の req-define / spec-save で判断する。
- **横展開観点**: 索引類・一覧表・件数キャプションを人手で維持する運用全般に適用可能。実ファイルを single source of truth とし、派生物（README の件数・リスト等）を自動生成するパターンは、README 以外にも DOC-MAP.md、影响対応表、ステータス別ビュー等で有効。
- **再発条件**: (1) 索引類が人手更新、(2) 要素追加時の整合性チェックなし、(3) 自動生成パイプライン未導入、の全てが揃った場合。
- **予防策候補**: (a) 索引類自動生成 SPEC を新設し（SC-002）、対象ファイルと生成規則を契約化する。(b) pre-commit hook または CI で実ファイル件数と README 記載を突合し、差分を fail とする検査を追加する。(c) README の件数・リスト部分を自動生成マーカーで囲い、人手編集を禁止する。
- **想定反映先**: docs/specs/integrity/（新規 SPEC 候補、SC-002 参照）、docs/specs/foundations/integrity-rules.md または IR カタログ（IR-042 等の拡充）
- **関連**: PR #1597, Issue #1596, F-001/F-002/F-005, AG-006 候補 #2/#3, SC-002, IR-042, intake item intake-2026-07-19-spec-candidate-index-auto-generation.md, intake item intake-2026-07-19-audit-ledger-governance-index-inconsistencies.md
- **タグ**: #index #automation #readme #single-source-of-truth #integrity #ir-042 #generate

---

## Issue 本文崩壊（LF 圧縮・見出し消失）の修復手法と予防線

- **問題事象**: Issue #1533 の本文が LF=0（事実上1行化）に圧縮され、Markdown の見出し構造（`## ...`）が崩壊。GitHub Web UI で見出しが見出しとしてレンダリングされず、本文全体が平文化して読めなくなっていた。前工程の draft（commit `51fff8b2`）は LF=246 で正常、テンプレート原本も正常であり、#1525〜#1535 の11件中 #1533 だけが異常だった。
- **発生局面**: 完了処理（case-close Step 2 QG-4 評価の前置として AG-007 修復を実施）
- **検知方法**: `gh api ... --jq .body` で取得した本文の LF 数計測で LF=0 を検出。`-1` を含む `headings` 計測で「見出し行頭の `##` が 0 件」を確認。
- **根本原因**: case-open の本文作成経路が、テンプレート読込後の本文をファイル経由で扱わず、PowerShell 文字列変数で持ち回し、`gh` CLI へ渡す前に LF 圧縮・空行正規化が走っていた。LF 欠損は Markdown 構造破壊（見出しの見出しとしての認識消失）の直接原因。
- **自律対応内容**: REQ-0125.md（UTF-8 LF 保存済みの原本）を主ソースとして意味内容を抽出し、`issue_desc_feature.md` テンプレート構造で本文を再構成。`.tmp/issue1533-body.md` を Write tool（Node.js による UTF-8 BOM なし LF 書き出し）で作成し、`gh issue edit 1533 --body-file <path>` で投稿。修復後 LF=204、見出し16個すべて直前空行またはファイル先頭、行中 `##` 0件、日本語文字化けなし。
- **ユーザー確認有無**: なし（AG-007 は Issue #1537 の完了条件に含まれ、エージェント自律で修復を実施）
- **ADR/REQ/spec影響**: あり。本件は既に REQ-0132-024/025/026（case-open ファイル経由本文保持）および REQ-0149-010（VERIFY の LF 数一致・見出し空行・行頭検証）として実装済み（PR #1539）。本学びは修復手法の記録であり、新規 REQ ではない。
- **横展開観点**: GitHub Issue に限らず、Markdown 構造を持つ任意の成果物（PR 本文、完了報告コメント、Case ファイル（ローカル版））で LF 圧縮・見出し消失の同種事故が発生し得る。本文作成時は常に `[System.IO.File]::WriteAllText` UTF8Encoding($false) によるファイル経由を固定し、読み戻し時に LF 数・見出し空行・行頭検証を行う VERIFY を併用する。修復が必要な場合は UTF-8 LF の原本ソース（REQ ファイル、draft commit 等）を主ソースとし、テンプレート構造で再構成する。
- **再発条件**: (1) PowerShell パイプライン経由で本文を取り回す、(2) `--body` 直接指定する、(3) VERIFY で LF 数と見出し構造を検査しない、のいずれかが発生した場合。
- **予防策候補**: (a) REQ-0132-024/025/026 実装（既実施）により構造的に防止。(b) 修復が必要になった場合、標準手順として「原本ソースの特定 → テンプレート構造で再構成 → `[System.IO.File]::WriteAllText` UTF8Encoding($false) でファイル作成 → `gh ... --body-file` で投稿 → Node.js `execSync` で LF 数・見出し数を読み戻し検証」を常に踏む。
- **想定反映先**: `agentdev-gh-cli/references/standard-procedures.md`（本文修復手順の記載）、`agentdev-issue-management/references/issue-operation-safety.md`（修復時の前後スナップショット比較）。両者とも REQ-0132/0149 実装で既カバーされており、本学びは具体的事例の補強。
- **関連**: PR #1600, Issue #1537（AG-007）, Issue #1533（修復対象）, RU-20260718-01（起点 RU）, REQ-0132-024/025/026, REQ-0149-010, PR #1539（実装 PR）
- **タグ**: `#case-close` `#issue-body-restore` `#lf-corruption` `#markdown-structure` `#verify` `#ag-007` `#powershell-encoding` `#req-0132-024` `#req-0149-010`

## gh CLI 出力の PowerShell パイプライン経由読み取りによる UTF-8 損傷と Node.js execSync 回避

- **問題事象**: PowerShell から `gh api ... --jq .body`（または `gh issue view ... -q .body`）をパイプライン経由で取得すると、PowerShell が UTF-8 バイト列を cp932（Shift-JIS）として再解釈し、日本語文字化けと LF 数の不正確な計測を同時に生じる。本件事例では LF 数を正しく計測できず、見出し数の検査も信頼できない状態になった。本来 LF=204 の本文が PowerShell 経由では異なる値で観測される。
- **発生局面**: 完了処理（case-close Step 2 QG-4 評価時の本文読み戻し、AG-007 修復後の検証）
- **検知方法**: 同一 PR 作業中に PowerShell パイプライン経由と Node.js `execSync` 経由で LF 数を並列計測し、値が一致しないことで検出。
- **根本原因**: PowerShell はネイティブコマンド（gh CLI）の UTF-8 出力をパイプライン経由でエンコーディング変換する。Windows PowerShell 5.x では Shift-JIS に変換、pwsh 7 でもネイティブコマンド出力の取り回しで日本語が破損する場合がある。文字化けと同時に改行バイト列も影響を受け、LF 数計測が不正確になる。
- **自律対応内容**: 全ての gh CLI 出力読み取りを Node.js `child_process.execSync` に切替。`execSync` は PowerShell パイプラインをバイパスして gh CLI の生の UTF-8 出力を直接取得するため、エンコーディング変換による文字化けが発生しない。検証用スクリプトは `node -e` で単発計測するか、`.js` スクリプトファイル（`$env:TEMP/agentdev/` 配下）へ退避して実行する（クォート階層競合回避）。
- **ユーザー確認有無**: なし（エージェント自律で検証経路を Node.js に統一）
- **ADR/REQ/spec影響**: なし。本件は `agentdev-gh-cli/references/standard-procedures.md` Section 3「安全な読み取り手順」に既規定の内容の具体的事例。新規 REQ/ADR/SPEC 影響なし。
- **横展開観点**: gh CLI 出力に限らず、PowerShell からネイティブコマンド（git, bun, gh, gh api 等）の出力を取得する際、UTF-8 を含む場合は常に Node.js `execSync` 経由を原則とする。特に日本語文字列、改行コード、バイト長を厳密に扱う検証（VERIFY、targeted docs guard、extensions integrity 等）では PowerShell パイプライン経由を避ける。Linux/macOS 環境では発生しない（既定で UTF-8 コンソール）。
- **再発条件**: (1) Windows 環境、(2) PowerShell からネイティブコマンドの UTF-8 出力をパイプライン経由で取得、(3) その結果を文字列操作・正規表現マッチ・JSON parse に直接渡す、の全てが揃った場合。
- **予防策候補**: (a) README/AGENTS.md の PowerShell 利用ガイドラインに「ネイティブコマンド UTF-8 出力読み取りは Node.js `execSync` を使用」というルールを明示する（現状は standard-procedures.md に記載だが、より上位のガイドラインにも言及を広げる）。(b) jq 式にシングルクォート・角括弧・パイプを含む場合は `node -e` を禁止し `.js` スクリプトファイルへ退避するルール（既規定）の周知徹底。
- **想定反映先**: `agentdev-gh-cli/references/standard-procedures.md` Section 3（既規定・具体的事例の補強）、AGENTS.md「PowerShell 利用ガイドライン」（もし該当セクションがあれば。なければハーネス選定セクション配下に簡潔に追記）。
- **関連**: PR #1600, Issue #1537, AGENTS.md「ハーネス選定」セクション, `agentdev-gh-cli/references/standard-procedures.md` Section 3「安全な読み取り手順」
- **タグ**: `#powershell` `#encoding` `#utf8` `#cp932` `#node-execsync` `#verify` `#gh-cli` `#case-close` `#windows`

## 2026-07-20: req-save/spec-save 統合委譲で生成された SPEC 本文への中国語文字混入

- **問題事象**: req-save/spec-save 統合委譲（commit cb8e5891）で新設された SC-001 SPEC（`docs/specs/foundations/numbering-policy.md`）の L10 に中国語文字「单」（U+5355）が混入していた。AGENTS.md「基本言語は日本語。あらゆる場面で中国語の使用を禁止する」への違反。PR #1613（Issue #1603、Epic #1601 Wave 1）の case-run で検出され、「単」（U+5358）へ修正済み。
- **発生局面**: 要件保存・SPEC 保存（req-save/spec-save 統合委譲による SPEC 新設時）
- **検知方法**: case-run 実装中の SPEC 本文 review で発見。機械的検出ではなく作業者の目視。
- **根本原因**: 統合委譲で SPEC 本文を一括生成した際、原稿（要件ドラフトまたは前段テキスト）に混入した中国語文字をそのまま引き継いだ。req-save/spec-save フローに日本語以外の CJK 文字を検出する自動検査工程が存在せず、レビュー段階で拾えなかった可能性が高い。AGENTS.md の中国語禁止ルールは人手による遵守に依存している。
- **自律対応内容**: 本 PR #1613 で「单」→「単」へ修正。他の SPEC ファイル（SC-002, SC-003、既存 SPEC UPDATE 分）には同様の混入なしことを確認済み。
- **ユーザー確認有無**: なし（エージェント自律で PR 本文 Findings に記録し修正）
- **ADR/REQ/spec影響**: なし。本件は SPEC 本文の表記修正であり、新規 REQ/ADR/SPEC 影響なし。AGENTS.md 既存ルールの運用改善候補。
- **横展開観点**: req-save/spec-save 統合委譲に限らず、AgentDevFlow 配布物（commands/, skills/, docs/）を新規生成・編集する全局面で、CJK 同形異字（「单」と「単」、「学」と「學」等）、簡体字・繁体字の混入リスクがある。文字コード検査（U+4E00〜U+9FFF のうち日本語外字を検出する正規表現等）を VERIFY に組み込む候補。
- **再発条件**: (1) req-save/spec-save 統合委譲または同等の一括生成フロー、(2) 原稿に中国語文字が含まれる、(3) 自動的な CJK 文字検査が存在しない、の全てが揃った場合。
- **予防策候補**: (a) agentdev-gh-cli VERIFY 観点「Markdown 構造」に「日本語外 CJK 文字検出」を追加する（中国語簡体字・繁体字を検出する正規表現パターンを用意）。(b) inspect-docs または inspect-skills に「日中同形異字」検出カテゴリを新設する。(c) req-save/spec-save フローの post-condition に「日本語外 CJK 文字 0件」を加える。
- **想定反映先**: `agentdev-gh-cli/references/verify.md`（VERIFY 観点拡張）、`docs/specs/integrity/integrity-rule-catalog.md`（IR 追加候補）、inspect-docs または inspect-skills の検出カテゴリ
- **関連**: PR #1613, Issue #1603, Epic #1601 Wave 1, commit cb8e5891（統合委譲本体）, AGENTS.md「基本言語は日本語」
- **タグ**: `#japanese` `#chinese-character` `#cjk` `#verify` `#spec-save` `#req-save` `#integrated-delegation` `#ag-001`

---

## 2026-07-20: 要件行は進捗値ではなく仕様としてベースライン値を記述すべき（#1606）

- **問題事象**: REQ-0162-010 が「影響範囲 NG 218件・WARNING 10件」と記述しているが、現状は intake-2026-07-19 で NG 216件・WARNING 10件に減少（PR #1579 で req-save.md/spec-save.md 処理済み）。ベースライン（起票時 218件）と現状進捗値（216件）の使い分けが REQ-0162-010/-011 で混在しており、case-close QG-4 評価時に「進捗値の更新漏れか、意図的なベースライン記述か」を判別する手間が発生した。
- **発生局面**: レビュー・クローズ（case-close の QG-4 完了条件照合時）
- **検知方法**: PR #1617 Findings セクションに「ベースライン値 vs 進捗値の使い分けは適切」と明記されていたことで判別可能だった。しかし REQ-0162-010/-011 本文だけでは意図が読めず、Findings に依存する構造。
- **根本原因**: 要件行に数量を記述する際「ベースライン値（仕様として固定）」と「進捗値（現状報告）」の運用区別が SPEC/ガイドレベルで未明文化。両者が混在すると、数量が変動した場合に「要件行を更新すべきか」「更新不要（ベースライン）か」が判断できない。
- **自律対応内容**: case-close では REQ-0162-010 をベースライン値のままとし、216件への更新を実施しなかった。PR #1617 Findings で「要件行は進捗値ではなく仕様としてベースラインを記述すべき」と明文化済み。進捗値は intake item（intake-2026-07-19-concrete-id-path-remaining-216-ng-10-warn.md）が別途追跡する二重管理構造とした。
- **ユーザー確認有無**: なし（エージェント自律で判断、PR Findings に記録済み）
- **ADR/REQ/spec影響**: なし（運用規約の明文化候補）。REQ-0162-010/-011 文面は現状維持。要件行数量記述ガイドラインの整備候補。
- **横展開観点**: 数量ベースラインを要件行に含む全ケース（影響範囲、検出件数、ファイル数等）で、「ベースライン（仕様）」と「進捗値（運用報告）」を区別する記述ガイドラインが有効。進捗値は intake/learning 等の別 artifact で追跡し、要件行は仕様としてベースラインを保持する二重管理構造を標準化する。
- **再発条件**: (1) 要件行に数量を記述、(2) 数量が運用進捗で変動、(3) ベースラインと進捗値の運用区別が SPEC/ガイドで未明文化、の全てが揃った場合。
- **予防策候補**: (a) REQ/SPEC 記述ガイドに「要件行の数量は起票時ベースラインを記述し、運用進捗値は intake/learning 等の別 artifact で追跡する」運用を明文化する。(b) 数量の後に `(baseline YYYY-MM-DD)` 等の日付明示でベースライン値であることを形式化する。
- **想定反映先**: document-type-responsibilities SPEC（要件行記述ガイド）、または workflow-templates skill `templates/req_*.md`（数量記述ガイドライン）
- **関連**: PR #1617, Issue #1606, Epic #1601 Wave 2, REQ-0162-010/-011, intake-2026-07-19-concrete-id-path-remaining-216-ng-10-warn.md
- **タグ**: `#requirements` `#baseline-value` `#progress-value` `#quantity-description` `#case-close` `#qg-4` `#req-0162`

## 2026-07-20: 再構成検証型 Issue で「決定」更新後に「結果・影響」節が取り残される内部矛盾パターン（#1607）

- **問題事象**: ADR-0114/0125/0127/0128 再構成（commit cb8e5891）で「決定」本文の更新は実施されたが、「結果・影響」「保持責務リスト」等の派生節が旧い前提のまま取り残される内部矛盾2件を検出。ADR-0114.md line 66「ドライバー結果の3状態契約により」は §2 で4状態契約へ拡張したのに結果節が3状態のまま。ADR-0127.md §3「case-run 並行委譲制御」は §1 で case-run を構成工程委譲対象外に変更したのに保持責務リストが旧表現のまま。
- **発生局面**: 実装・検証（case-run 検証フェーズ、Wave 2 #1607 PR #1616）
- **検知方法**: case-run 検証フェーズで ADR 内のセクション間整合性を精読し発見。§1 vs §3、決定節 vs 結果節の突き合わせで機械的に検出可能。
- **根本原因**: ADR 再構成を「決定本文」中心で実施した際、派生節（結果・影響、保持責務、関連項目等）の追随更新が漏れた。req-save/spec-save 統合委譲（cb8e5891）はバッチ処理で主要節を更新したが、派生節の網羅性確認プロセスが無かった。
- **自律対応内容**: PR #1616 で2件の内部矛盾を補完修正。ADR-0114.md line 66 を「3状態」→「4状態（blocked / failed / delegation-unavailable）」へ更新、ADR-0127.md §3 を「並行委譲制御」→「インライン実行制御」へ更新。Q4 壁打ち合意に合致。
- **ユーザー確認有無**: なし（エージェント自律で検出・修正、PR 本文に記録）
- **ADR/REQ/spec影響**: なし。本件は ADR 再構成の運用知見であり、新規 ADR/REQ/spec 影響なし。
- **横展開観点**: 文書再構成を「決定節」中心で実施する全ケース（ADR, REQ, SPEC の大規模 UPDATE）で、派生節（結果・影響、保持責務、関連項目、Decision Map、Consequences 等）の追随確認を検証フェーズで実施する観点が有効。再構成 PR には「派生節整合性確認」チェックリストを含める運用。
- **再発条件**: (1) 文書の主要節を再構成、(2) 派生節（結果・影響等）が旧前提を保持、(3) 派生節の網羅性確認プロセスが存在しない、の全てが揃った場合。
- **予防策候補**: (a) case-run 検証テンプレートに「再構成を伴う ADR/REQ/SPEC は §単位の整合性（決定 vs 結果・影響、§1 vs §3 等）を確認する観点」を追加する。(b) inspect-docs に「文書内セクション間整合性（同一概念の表記揺れ、旧前提の取り残し）」検出カテゴリを新設する。
- **想定反映先**: case-run skill 検証テンプレート、workflow-templates skill `templates/pr_desc.md`（再構成 PR の検証項目）、inspect-docs 検出カテゴリ候補
- **関連**: PR #1616, Issue #1607, Epic #1601 Wave 2, ADR-0114（3状態→4状態）, ADR-0127（並行委譲→インライン実行）, commit cb8e5891（統合委譲本体）, Q4 壁打ち合意（2026-07-19）
- **タグ**: `#adr` `#restructure` `#internal-contradiction` `#section-consistency` `#case-run` `#verification` `#ag-005`

## 2026-07-20: 物理統合時の参照更新網羅性チェックパターン（#1608）

- **問題事象**: `docs/specs/foundations/workflow-contracts.md`（旧版縮小互換索引）を完全削除し `docs/specs/workflows/workflow-contracts.md` へ物理統合する際、active 文書10件（docs/README.md, DOC-MAP.md, specs/local/local-generation.md, specs/README.md, ADR-0127.md, REQ-0112/0119/0126/0137）に残存する旧パス参照の網羅的更新が必要だった。grep で `obsolete-path-map.yaml`（IR-057 exemption 対象）のみ残ることを確認し、stub/redirect/互換索引の残置なしを検証した。
- **発生局面**: 実装・検証（case-run 実装フェーズ、Wave 2 #1608 PR #1619）
- **検知方法**: リポジトリ全体 git grep で旧パス文字列を検索し、active 文書から完全除去されたことを確認。`obsolete-path-map.yaml` は IR-057 検査の exemption リストとして意図的に残置する設計のため除外。
- **根本原因**: 物理統合（ファイル削除・移動）では参照元の網羅的更新が必須だが、手動 grep では見落としリスクがある。本 case では `obsolete-path-map.yaml` に旧パス→新パス対応を追記し、IR-057 が旧パス参照を検出できる二重安全装置を設定。
- **自律対応内容**: PR #1619 で10件の active 文書の旧パス参照を新パスへ更新、`obsolete-path-map.yaml` に新エントリ追加、stub/redirect/互換索引を残さず完全削除。acceptance 検証表で5項目（旧パス削除、新パス存在、active 文書参照残存ゼロ、obsolete map 記録、stub なし）を全て ✅ で確認。
- **ユーザー確認有無**: なし（エージェント自律で実施、PR 本文に詳細記録）
- **ADR/REQ/spec影響**: なし。本件は物理統合時の運用知見であり、新規 ADR/REQ/spec 影響なし。`obsolete-path-map.yaml` の運用が有効性を実証。
- **横展開観点**: SPEC/ADR/REQ の物理統合、ファイル移動、リネーム全般で適用可能。(a) 旧パスを網羅的に grep、(b) active 文書の参照を新パスへ更新、(c) `obsolete-path-map.yaml` への対応記録、(d) stub/redirect/互換索引を残さない、の4ステップを標準パターンとする。
- **再発条件**: (1) SPEC/ADR/REQ の物理統合・移動を実施、(2) 参照元の網羅的更新が必要、(3) stub/redirect 残置の判断が必要、の全てが揃った場合。
- **予防策候補**: (a) workflow-templates skill に「物理統合・ファイル移動時の標準4ステップ（grep、active 更新、obsolete map 記録、stub 残置なし）」テンプレートを追加する。(b) inspect-docs に「物理統合・移動後の参照残存検出（`obsolete-path-map.yaml` 連動）」検出カテゴリを強化する。
- **想定反映先**: workflow-templates skill `templates/*.md`（物理統合テンプレート）、inspect-docs 検出カテゴリ（`obsolete-path-map.yaml` 連動）、`docs/specs/integrity/obsolete-path-map.yaml`（運用実例の補強）
- **関連**: PR #1619, Issue #1608, Epic #1601 Wave 2, IR-057（obsolete path 参照検出）, `docs/specs/integrity/obsolete-path-map.yaml`, ACT-SPEC-004（U-007 物理統合）, commit cb8e5891
- **タグ**: `#physical-integration` `#reference-update` `#obsolete-path-map` `#ir-057` `#case-run` `#verification` `#ag-002`

## 2026-07-20: 監査→実装 PR→監査台帳書き戻しの紐付けを明示的にする運用（#1609）

- **問題事象**: 第1フェーズ監査（監査台帳 `.agentdev/drafts/audit-ledger-governance-system-audit.md`）で検出された F-001/002/005（U-003/004/005）は PR #1599（commit 28a00f86）で ADR README の件数是正と ADR-0137 追加を実施した際に副次的に解消されていた。しかし監査台帳と実装 PR の紐付けが明示的でなかったため、本 Issue #1609 で書き戻し（監査台帳 U-003/004/005 欄へ「解消状況」行追加）を実施するまで、解消状況が監査台帳上で未確定状態だった。
- **発生局面**: 完了処理（case-close Wave 2 #1609、監査台帳書き戻し）
- **検知方法**: case-run 検証フェーズで監査台帳の U-003/004/005 欄に解消状況記録がなく、PR #1599 で既に解消済みであることを再検証で確認。監査台帳と実装 PR のリンクが不在だった。
- **根本原因**: 監査フェーズ（Phase1）と再編実施フェーズ（Phase2）が分離されており、Phase2 の実装 PR（#1599 等）が Phase1 監査台帳のどの未決事項を解消したかを示す標準的なリンク形式が無かった。Phase2 各 PR の close 時に監査台帳へ書き戻すプロセスが暗黙裡に期待されていたが、case-close で明示的に実施するまで放置された。
- **自律対応内容**: PR #1618 で監査台帳 U-003/004/005 欄へ「【解消済 PR #1599, #1609 検証】」注記を追加、照合サマリ表の docs/adr/README.md 関連3行を「整合」へ更新、未決事項一覧の該当行へ注記追加（8 insertions 5 deletions）。Wave 2 close の標準プロセスとして実施。
- **ユーザー確認有無**: なし（エージェント自律で実施、PR 本文に記録）
- **ADR/REQ/spec影響**: なし。本件は監査台帳運用の知見であり、新規 ADR/REQ/spec 影響なし。SC-003（`docs/specs/local/audit-ledger-lifecycle.md`）が監査台帳ライフサイクル SPEC として accepted のため、運用実例の補強。
- **横展開観点**: 監査台帳を前提情報とする大規模変更計画全般で適用可能。実装 PR の close 時に監査台帳の該当未決事項欄へ「解消状況（書き戻し）」行を追加するプロセスを標準化する。Wave 単位の case-close で一括書き戻しを実施する運用が有効（本 Wave 2 #1609 で実証）。
- **再発条件**: (1) 監査フェーズ（Phase1）と再編実施フェーズ（Phase2）が分離、(2) Phase2 実装 PR と Phase1 監査台帳のリンク形式が未定義、(3) case-close で監査台帳書き戻しを実施しない、の全てが揃った場合。
- **予防策候補**: (a) SC-003（`docs/specs/local/audit-ledger-lifecycle.md`）に「Phase2 実装 PR close 時の監査台帳書き戻し標準形式」を追記する。(b) case-close skill に「監査台帳が存在する場合、書き戻しを必須手順とする」チェックリスト項目を追加する。
- **想定反映先**: `docs/specs/local/audit-ledger-lifecycle.md`（SC-003、書き戻し形式の標準化）、case-close skill（監査台帳存在時の書き戻しチェックリスト）、workflow-templates skill（監査→実装 PR→書き戻しテンプレート）
- **関連**: PR #1618, Issue #1609, Epic #1601 Wave 2, PR #1599（commit 28a00f86、副次解消 PR）, 監査台帳 `.agentdev/drafts/audit-ledger-governance-system-audit.md`（U-003/004/005）, SC-003（`docs/specs/local/audit-ledger-lifecycle.md`）, F-001/002/005
- **タグ**: `#audit-ledger` `#writeback` `#phase-separation` `#case-close` `#sc-003` `#link-tracking` `#governance`

---

## 2026-07-20: AG-001 制約内で公開 SKILL.md の文書構成を是正する REFERENCE 強化パターン（#1610）

- **問題事象**: doc-writing SKILL.md の査読観点 table が `references/` 配下10ファイルのうち `mechanical-replacement-rules.md`, `japanese-replacement-dictionary.md` の2ファイルへの参照を欠いていた。また doc-map SKILL.md に intro 段落と重複する redundant な `### 目的` subsection が存在した。これらは AG-006' 候補6/7 Wave 1 が指摘する SKILL.md 重複問題の一部だが、動作（発火条件、判定ロジック等）に影響しない文書構成の不備であり、AG-001「公開 skill 動作不改」制約内で修正可能かの判断が必要だった。
- **発生局面**: 実装・検証（case-run 実装フェーズ、Wave 3 #1610 PR #1621）
- **検知方法**: Phase1 監査台帳 AG-006' M節 item 8（候補6/7 Wave 1）の指示と、`src/opencode/skills/agentdev-doc-writing/SKILL.md` の査読観点 table と `references/` 配下実ファイルの突合で検出。doc-map については冒頭 `# DOC-MAP 読み方ガイド` 直下の `### 目的` が intro 段落と意味重複するかの精読で検出。
- **根本原因**: SKILL.md の参照漏れ・redundant subsection は拡張時の accumulate 結果。動作不改範囲での是正判断基準が SPEC に明示されず、「動作箇所（description frontmatter, Trigger conditions, 制約事項, コマンド実行, フラグ判定, 判定ロジック等）に触れない変更」と「文書構成（查読観点 table の参照追加、原本 section の対応表、リード文への構造変更、count 表記訂正）」の区別を case-run 側で都度判断していた。
- **自律対応内容**: PR #1621 で3変更を適用。(a) doc-writing 査読観点 table へ2参照を追加、(b) doc-writing「原本」section に「運用ビュー↔原本」対応表を新設（原本節は `japanese-tech-writing`、document-type-responsibilities SPEC と明示）、(c) doc-map redundant `### 目的` subsection を intro 段落へ統合、参照可能 section の count 表記を 7→10 ファイルへ訂正。`git diff` で動作箇所への変更なしを確認。
- **ユーザー確認有無**: なし（エージェント自律で実施、PR 本文に AG-001 制約遵守確認セクションを明記）
- **ADR/REQ/spec影響**: なし。AG-001 制約内の運用知見であり、新規 ADR/REQ/spec 影響なし。SC-002 DERIVE/GENERATE 機構（フェーズ3対象）で SKILL.md 参照整合性を自動維持する候補が補強される。
- **横展開観点**: 公開 SKILL.md の動作不改範囲での文書構成是正（参照追加、redundant subsection 統合、count 表記訂正、原本への対応表新設等）は Wave 1 パターンとして標準化可能。動作箇所（発火・判定・実行）と文書構成箇所（参照・構造・表記）を `git diff` で区別して確認する観点が、他の agentdev-* SKILL.md でも適用可能。
- **再発条件**: (1) 公開 SKILL.md に `references/` 配下ファイルへの参照漏れ、redundant subsection、count 表記不正のいずれかが存在、(2) AG-001「公開 skill 動作不改」制約下で修正可否の判断が必要、(3) 動作箇所と文書構成箇所の区別基準が SPEC に未明文化、の全てが揃った場合。
- **予防策候補**: (a) document-type-responsibilities SPEC（または後続SPEC）に「SKILL.md 重複読の優先度基準と段階的スケジュール」節で Wave 1 対象ファイル一覧（doc-writing, doc-map 等）を明示する。(b) case-run skill 検証テンプレートに「SKILL.md 変更時は動作箇所（Trigger/制約/ロジック）と文書構成箇所（参照/構造/表記）を git diff で区別確認」の観点を追加する。
- **想定反映先**: `docs/specs/responsibilities/document-type-responsibilities.md`（SKILL.md 重複読章）、case-run skill 検証テンプレート、workflow-templates skill `templates/pr_desc.md`（AG-001 制約確認セクション）
- **関連**: PR #1621, Issue #1610, Epic #1601 Wave 3, AG-006' 候補6（doc-writing REFERENCE 強化）・候補7 Wave 1（SKILL.md 手作業重複除去）, CR-003 フェーズ2/3 振り分け基準
- **タグ**: `#ag-001` `#skill-md` `#reference` `#redundant-subsection` `#wave-1` `#case-run` `#verification` `#ag-008`

## 2026-07-20: 中間成果物ライフサイクル完遂を 2 commit 構成で証明するパターン（#1611）

- **問題事象**: Phase1 監査台帳（`.agentdev/drafts/audit-ledger-governance-system-audit.md`）は SC-003 が定める5ステップライフサイクル（Step 1 生成→Step 2 参照→Step 3 参照専用化→Step 4 次フェーズ転記→Step 5 廃棄・削除）に従う中間成果物だが、Step 3〜5（最終書き戻し→フェーズ3転記→監査台帳削除）を1 commit で実施すると「いつ書き戻し、いつ転記し、いつ削除したか」のトレーサビリティが失われる恐れがあった。
- **発生局面**: 完了処理（case-run 実装フェーズ、Wave 3 #1611 PR #1620）
- **検知方法**: SC-003 SPEC の Step 3/4/5 要件と、PR 設計時の commit 構成検討。1 commit 構成では Step 3 書き戻し（監査台帳 U-001〜U-015 に解決結果を記録）と Step 5 廃棄（同ファイル削除）が同一 commit になり、Step 4 転記（フェーズ3用入力新規作成）も同 commit に混入するため、ライフサイクル各ステップの証跡が不明瞭になることを踏まえ、2 commit 構成を採用。
- **根本原因**: 中間成果物ライフサイクルの最終ステップ群は同一ファイルへの操作（書き戻し→削除）を含むため、機械的に1 commit で処理しがち。しかし SPEC が定めるライフサイクル各ステップは独立した意味を持つ（Step 3 参照専用化、Step 4 次フェーズ転記、Step 5 廃棄・削除）ため、ステップごとの証跡が求められる場合がある。
- **自律対応内容**: PR #1620 を2 commit 構成とした。commit 1/2（86e2a301）で Step 3 最終書き戻し（監査台帳 U-001〜U-015 に解決結果を記録）、commit 2/2（68a73bdf）で Step 4 フェーズ3転記（`req-draft-governance-reorganization-phase3.md` 新規作成）+ Step 5 監査台帳 `git rm` を実施。commit 2/2 メッセージに各ステップの SC-003 準拠根拠（Step 4 AC-1〜AC-2-3, Step 5 SC-003 Step 5）を明記し、ライフサイクル完遂の証跡を確保。
- **ユーザー確認有無**: なし（エージェント自律で実施、PR 本文 TS-006 検証結果セクションに各ステップの PASS 判定根拠を明記）
- **ADR/REQ/spec影響**: なし。SC-003 SPEC「既知の適用例」表に Phase 2 完了時の廃棄・削除実績データの追加候補（capture候補）。
- **横展開観点**: 中間成果物ライフサイクル SPEC（SC-003, REQ-0105 等）が定める複数ステップの完了を証明する必要がある PR 全般で、各ステップを1 commit ずつ（または意味単位で分割）に分ける構成が有効。特に「ファイル削除」を伴う最終ステップは、その前段の「書き戻し」「転記」と分離することで、ライフサイクル完遂の証跡を時系列順に復元できる。
- **再発条件**: (1) 中間成果物が SPEC 定義のライフサイクルを持つ、(2) ライフサイクル最終ステップがファイル削除を伴う、(3) 書き戻し・転記・削除を1 commit に圧縮すると各ステップ証跡が失われる、の全てが揃った場合。
- **予防策候補**: (a) SC-003 SPEC「既知の適用例」表に「Phase 2 完了時の廃棄・削除実績（2 commit 構成）」を追加し、標準パターンとして明示する。(b) case-run skill に「中間成果物ライフサイクル最終ステップを含む PR は、Step 3/4/5 を2 commit 以上に分割し、各 commit メッセージに SC-003 準拠根拠を明記」の観点を追加する。
- **想定反映先**: `docs/specs/local/audit-ledger-lifecycle.md`（SC-003、既知の適用例表）、case-run skill 検証テンプレート
- **関連**: PR #1620, Issue #1611, Epic #1601 Wave 3, SC-003（`docs/specs/local/audit-ledger-lifecycle.md`）, commit 86e2a301, commit 68a73bdf, AG-009, CR-004
- **タグ**: `#intermediate-artifact` `#lifecycle` `#sc-003` `#2-commit-structure` `#traceability` `#case-run` `#phase-2`

## 2026-07-20: 次フェーズ用入力の自足性を6要素構成で確保する転記パターン（#1611）

- **問題事象**: Phase2 から Phase3 への引き継ぎは Phase1 監査台帳（`.agentdev/drafts/audit-ledger-governance-system-audit.md`）を削除する前提で実施されるため、削除後に Phase3 側が単独で作業を完結できる自足性が求められる。Phase2 処理済みの候補、未処理（フェーズ3対象）候補、各候補の正規所有者 SPEC、自動化後の想定状態等を含めないと、Phase3 req-define 起動時に都度 Phase2 Issue/PR を参照し直す必要が生じる。
- **発生局面**: 完了処理（case-run 実装フェーズ、Wave 3 #1611 PR #1620）
- **検知方法**: Phase2 全 Wave 完了前提で、Phase3 用入力 `.agentdev/drafts/req-draft-governance-reorganization-phase3.md` を新規作成する際、TS-006 (b)「フェーズ3用入力が自足していること（背景/対象候補/正規所有者/自動化後の状態/対象外/受け入れ条件を含む）」を満たす必要があることを確認。
- **根本原因**: フェーズ間入力は次フェーズ単独での完結を前提とするが、要素構成の標準形式が SPEC に明示されていなかった。Phase1 から Phase2 への引き継ぎ（監査台帳）は「候補羅列」形式だったが、Phase2 から Phase3（実装フェーズ）への引き継ぎは「正規所有者・自動化後状態・受け入れ条件」まで含む必要があり、要素構成が異なる。
- **自律対応内容**: PR #1620 commit 2/2 で `.agentdev/drafts/req-draft-governance-reorganization-phase3.md` を frontmatter（`work_type: maintenance`, `scale: large`, `phase: 3`, `parent_epic: "1601"`）付きで新規作成。本文に6要素（背景／対象候補／正規所有者／自動化後の状態／対象外／受け入れ条件）を全て含め、Phase3 単独完結を担保。対象候補は候補1〜5、候補7 Wave 2/3、候補8、U-012 を網羅。各候補に正規所有者 SPEC と実ファイル frontmatter を明記し、受け入れ条件 AC-1〜AC-6 を定義。
- **ユーザー確認有無**: なし（エージェント自律で実施、PR 本文 TS-006 (b)(c) で PASS 判定）
- **ADR/REQ/spec影響**: なし。SC-003 SPEC「次フェーズ用入力」節での配置基準実例候補（capture候補）。
- **横展開観点**: 大規模変更計画でフェーズを分割する全ケースで、フェーズ間入力を「6要素構成（背景/対象候補/正規所有者/自動化後の状態/対象外/受け入れ条件）」で記述するパターンが有効。特に「対象外」セクションに前フェーズ処理済み内容を明示することで、次フェーズでの作業重複を防げる。配置基準（`.agentdev/drafts/req-draft-*.md` パターン、frontmatter の `phase` / `parent_epic` 属性）も標準化候補。
- **再発条件**: (1) 大規模変更計画をフェーズ分割、(2) 前フェーズ中間成果物を削除する前提、(3) 次フェーズ用入力の要素構成標準が未定義、の全てが揃った場合。
- **予防策候補**: (a) SC-003 SPEC「次フェーズ用入力」節に6要素構成と frontmatter 形式（`phase`, `parent_epic` 等）を明示する。(b) req-save/spec-save フローに「次フェーズ用入力テンプレート」を用意し、6要素が埋まっているかを post-condition 検査する。
- **想定反映先**: `docs/specs/local/audit-ledger-lifecycle.md`（SC-003「次フェーズ用入力」節）、workflow-templates skill（次フェーズ用入力テンプレート候補）
- **関連**: PR #1620, Issue #1611, Epic #1601 Wave 3, フェーズ3用入力 `.agentdev/drafts/req-draft-governance-reorganization-phase3.md`, TS-006 (b)(c), AG-009, CR-004, CR-003
- **タグ**: `#phase-handoff` `#self-contained` `#sc-003` `#cr-004` `#phase-3` `#case-run` `#req-draft`

---

## IR-* frontmatter の Related REQ/SPEC フィールド不在と本文 prose 抽出代替パターン

- **問題事象**: IR-061 の frontmatter は新形式（id/title/domain 等）だが elated_req / elated_spec フィールドを持たない。関連情報は本文「## 関連」セクションに prose 形式で記載される。そのため rule-ownership appendix の IR-061 行は Related REQ/SPEC が - となる。Wave 1 では Phase E での対応候補として記録するにとどめ、この Issue スコープ外とする。
- **発生局面**: 実装（Wave 1: catalog + rule-ownership GENERATE 化、IR-* 依存）
- **検知方法**: 実装中に IR-061 frontmatter を読み込み、elated_req / elated_spec フィールド不在を確認。IR-060/062 には同フィールドが存在することと対比し、IR-061 の frontmatter 形式不整合を検知。
- **根本原因**: IR-061 は Phase C（生成スクリプト実装）で新規作成された IR であり、IR-* frontmatter の標準形式（id/title/domain/related_req/related_spec）への移行が不完全であった。関連情報は本文 prose で記載する暫定形式が採用された。
- **自律対応内容**: Wave 1 では本 Issue スコープ外として記録のみ。rule-ownership appendix の IR-061 行は Related REQ/SPEC を - とし、Phase E での対応候補として PR 本文 Findings に明記。appendix 自体は Wave 1 スコープで完成させた。
- **ユーザー確認有無**: なし（エージェント自律でスコープ外判断、PR 本文 Findings に明記）
- **ADR/REQ/spec影響**: なし（本件は IR-061 の frontmatter 形式不整合であり、既存 IR-* 形式への整合化は Phase E 以降のスコープ）。
- **横展開観点**: IR-* frontmatter 形式統一に向けた知見。新規 IR 作成時は標準形式（id/title/domain/related_req/related_spec）を必須とし、本文 prose は補足用途とすることで、機械的処理（rule-ownership appendix 生成等）の信頼性向上。
- **再発条件**: (1) 新規 IR 作成、(2) IR-* frontmatter 標準形式不遵守、(3) 機械的処理（appendix 生成等）で関連情報参照、の全てが揃った場合。
- **予防策候補**: (a) 新規 IR 作成時、frontmatter に elated_req / elated_spec フィールドを必須化する。(b) Phase E で IR-061 frontmatter への同フィールド追加、または本文 prose からの抽出拡張を実装。
- **想定反映先**: IR-061 frontmatter、Phase E での IR-* 形式整合化、rule-ownership appendix 生成ロジック
- **関連**: PR #1628, Issue #1623, IR-061, Wave 1, Phase E
- **タグ**: #ir-format #frontmatter #related-req-spec #phase-e #wave-1 #rule-ownership

---

## 索引類自動生成における frontmatter 由来情報と人手編集情報の分離パターン（Wave 2 実証）

- **問題事象**: Wave 2（PR #1629）で ADR README、REQ README、DOC-MAP の AUTOGEN 化を実施した際、各ファイルの全てのセクションが frontmatter から機械生成できるわけではないことが判明。具体的には以下の4事象: (1) 廃止済み履歴ビュー（adr-retired-table）: retired ADR frontmatter に後継 ADR を示すフィールドが存在せず、3列生成（ADR番号/タイトル/retired時ステータス）にとどまり、引き継ぎ先情報は Decision Map 参照で運用。(2) REQ README の関心対象列: SC-002 SPEC が生成元を frontmatter id+title と指定しているため、2列生成（REQ ID/タイトル）にとどまり、関心対象列は各 REQ ファイル本文参照に委任。(3) Topic View / Decision Map / Related REQ 表: トピックタグ等の frontmatter に存在しないメタデータは生成不可。人手編集領域として残置（SC-002 SPEC「混合領域」許容）。(4) DOC-MAP 詳細 REQ 表: hand-curated 概要列の価値を保持するため AUTOGEN 対象外とし、別途 docmap-inventory block で件数機械検証を新設。
- **発生局面**: 実装（case-run Wave 2 #1624 PR #1629、generate_indexes.ts 生成関数拡張時）
- **検知方法**: 実装検証。generate_indexes.ts へ ADR/REQ README、DOC-MAP の生成関数を追加する際、各ファイルの対象セクションが frontmatter から導出可能かを確認。
- **根本原因**: README/DOC-MAP 群は元々人手で編集される前提で構築されており、全ての情報が frontmatter（機械処理可能）に集約されているわけではない。frontmatter 由来情報（id/title/status/count 等）と人手編集情報（概要・関心対象・Decision Map・トピック 等）が混在する「混合領域」が標準的な状態。
- **自律対応内容**: PR #1629 で以下の対応を実施。(a) frontmatter から導出可能な情報（id/title/status/count）は AUTOGEN block で機械生成。(b) frontmatter に存在しない情報（引き継ぎ先・関心対象・Topic View 等）は人手編集領域として残置、または別 block で補完（docmap-inventory）。(c) 詳細 REQ 表の hand-curated 概要列は AUTOGEN 対象外とし、件数機械検証を別 block で新設。(d) SC-002 SPEC「混合領域」許容を根拠として採用。
- **ユーザー確認有無**: なし（エージェント自律で設計判断、PR 本文 Findings に明記）
- **ADR/REQ/spec影響**: あり（要評価）。SC-002 SPEC（`docs/specs/integrity/index-auto-generation.md`）に「混合領域」許容と frontmatter 由来情報と人手編集情報の分離基準が明文化されているか確認要。明文化不足の場合は SPEC UPDATE 候補（Wave 5 Phase E または別 Issue）。
- **横展開観点**: 索引類（README、DOC-MAP、mapping-table 等）の AUTOGEN 化全般で適用可能。frontmatter 由来情報と人手編集情報を明確に分離し、前者は AUTOGEN block、後者は人手編集領域または別 block で補完する設計パターン。Wave 3（metrics GENERATE 化）でも同様の判断が必要な可能性。Wave 4（SKILL.md DERIVE 機構）でも、SKILL.md の機械生成可能部分と人手編集部分の分離に適用可能。
- **再発条件**: (1) 索引類の AUTOGEN 化を実施、(2) 対象ファイルに frontmatter 由来でない情報（概要・関心対象・Decision Map 等）が混在、(3) 全ての情報を AUTOGEN 化しようとする、の全てが揃った場合。
- **予防策候補**: (a) SC-002 SPEC に「frontmatter 由来情報と人手編集情報の分離基準」と「混合領域」許容を明文化する。(b) generate_indexes.ts の拡張時に、対象セクションが frontmatter から導出可能かをチェックリスト化する。(c) 人手編集情報を保持するセクションには「本セクションは人手編集領域です」の注記を追加する。
- **想定反映先**: `docs/specs/integrity/index-auto-generation.md`（SC-002 SPEC、混合領域の明文化）、`docs/specs/integrity/rules/IR-061-index-generation-consistency.md`（検査対象の明確化）、Wave 3（metrics GENERATE 化）設計、Wave 4（SKILL.md DERIVE 機構）設計
- **関連**: PR #1629, Issue #1624, Epic #1622 Wave 2, SC-002 SPEC, AG-008/009/013, Wave 1（catalog/rule-ownership GENERATE 化、PR #1628）
- **タグ**: #wave2 #autogen #frontmatter #hand-curated #mixed-region #sc-002 #generate-indexes #adr-readme #req-readme #doc-map

---

## 配布物 SKILL.md の DERIVE 宣言に内部 ID を含めると IR-055 strict violation となる設計制約（Wave 4 実証）

- **問題事象**: Wave 4（PR #1631）で src/opencode/skills/agentdev-*/SKILL.md 25ファイルへ原本（SSoT）節を新設し、SPEC 参照と DERIVE 宣言を記述した際、初期実装で原本節に `REQ-0140-041/042` を含めたところ IR-055 strict violation（84件）が検出された。配布物（src/opencode/skills/）は consumer 環境（AgentDevFlow プラグイン利用先）へ配布されるため、consumer 側に存在しない内部 REQ-ID への未解決参照となり strict violation となる。
- **発生局面**: 実装（case-run Wave 4 #1627 PR #1631、SKILL.md 原本節新設時）
- **検知方法**: check_integrity.ts 実行で IR-055 strict violation 84件を検出。追加行に `REQ-[0-9]` パターンが含まれることを `git diff main` で確認。
- **根本原因**: IR-055 は配布物（src/opencode/{commands,skills}/）に AgentDevFlow 内部 ID（REQ-XXXX/ADR-XXXX/SPEC-{KIND}-{NNN}/IR-XX 等）が残留することを検出するルール。consumer 環境ではこれらの内部 ID は解決できないため、配布物仕様として禁止されている。SKILL.md の DERIVE 宣言は配布物の一部であり、内部 ID の直接言及は IR-055 違反となる。
- **自律対応内容**: PR #1631 で原本節から内部 REQ-ID を除去し、SPEC 参照リンク（`docs/specs/skills/agentdev-{name}.md`）と機能的記述（「本 SKILL.md は実行入口であり、SPEC を SSoT として DERIVE する」「extension は標準 SKILL.md を前提とし、重複しない補完情報のみを提供する」）のみで DERIVE 宣言を完結。再検証で IR-055 violation 0件を確認。
- **ユーザー確認有無**: なし（エージェント自律で設計判断、PR 本文 Findings に明記）
- **ADR/REQ/spec影響**: あり（要評価）。REQ-0108（配布物境界）の具体的事例。SC-002 SPEC または document-type-responsibilities SPEC に「SKILL.md DERIVE 宣言は SPEC 参照リンクと機能的記述のみで完結し、内部 ID の直接言及は避ける」設計指針の明文化候補。
- **横展開観点**: 配布物（src/opencode/{commands,skills}/）の自然言語記述で内部 ID を参照する全ケースに適用可能。DERIVE 機構、REFERENCE、See Also 等の参照リンクは SPEC または外部ドキュメントへの相対パスで表現し、内部 ID（REQ-/ADR-/SPEC-/IR-）の直接言及は避ける設計が適切。
- **再発条件**: (1) 配布物（src/opencode/skills/）の SKILL.md を編集、(2) DERIVE 宣言または参照記述に内部 ID（REQ-XXXX 等）を含める、(3) check_integrity.ts または CI で IR-055 を検査、の全てが揃った場合。
- **予防策候補**: (a) SC-002 SPEC または document-type-responsibilities SPEC に「SKILL.md DERIVE 宣言は SPEC 参照リンクと機能的記述のみで完結し、内部 ID の直接言及は避ける」設計指針を明文化する。(b) case-run skill の検証テンプレートに「配布物変更時は IR-055 strict violation 0件を必須確認」項を追加する。(c) SKILL.md テンプレート（agentdev-skill-authoring）に原本節の標準フォーマット（内部 ID を含めない）を定義する。
- **想定反映先**: `docs/specs/responsibilities/document-type-responsibilities.md`（SKILL.md DERIVE 機構の設計指針）、`docs/specs/integrity/index-auto-generation.md`（SC-002 SPEC、配布物と内部 ID の境界）、`src/opencode/skills/agentdev-skill-authoring/`（SKILL.md テンプレート）、case-run skill 検証テンプレート
- **関連**: PR #1631, Issue #1627, Epic #1622 Wave 4, REQ-0140-041/042, IR-055, SC-002 Phase D, AG-012, U-012
- **タグ**: #wave4 #skill-md #derive #ir-055 #strict-violation #internal-id #distribution-boundary #consumer-environment #sc-002 #phase-d

---

## worktree 委譲先での cd 操作誤りによるメインリポジトリ一時汚染と検出・是正パターン（Wave 5 実証）

- **問題事象**: Wave 5（PR #1632）で case-run 実行担当サブエージェント（deep category）へ worktree root（`.worktrees/1626-maintenance`）配下での作業を委譲した際、委譲先が検証ステップで cd 操作を誤り、一時的にメインリポジトリ（`C:/Users/ogatay/work/agent-dev-flow`）の作業ツリーへ変更を迷い込ませた。委譲先は即座に異常を検知し、(a) パッチ抽出、(b) worktree 再適用、(c) メインリポジトリ `git checkout --` で原状復帰する手順で是正。最終状態でメインリポジトリに本 PR 由来の変更は一切残らなかったが、worktree 隔離原則の一時的破綻事例として記録する。
- **発生局面**: 実装・検証（case-run Wave 5 #1626 PR #1632、委譲先での検証ステップ）
- **検知方法**: 委譲先の自律検知。cd 操作後に git status で対象ファイルパスが worktree root 配下でないことを確認し、即座に是正シーケンスへ移行。
- **根本原因**: 委譲先プロンプトで worktree root の絶対パスを明示していたが、検証ステップで bash コマンドを連続実行する際に `cd` を伴う操作（例: 別ディレクトリへの移動を伴うスクリプト実行）で worktree root を離れる余地があった。委譲先は worktree 隔離原則を理解していたが、操作の連続性の中で一時的な離脱が発生。
- **自律対応内容**: 委譲先が (a) 異常検知、(b) 変更内容のパッチ抽出、(c) worktree root への再適用、(d) メインリポジトリ `git checkout --` で原状復帰、(e) 最終 git status でクリーン状態を確認、の5ステップで是正。PR 本文 Findings に経緯を明示。case-auto 側でもマージ前に git status でメインリポジトリの状態を確認し、本 PR 由来の変更が残っていないことを検証済み。
- **ユーザー確認有無**: なし（エージェント自律で検出・是正、PR 本文 Findings に明記）
- **ADR/REQ/spec影響**: なし（本件は case-run 委譲時の worktree 運用リスクの運用知見であり、新規 ADR/REQ/spec 影響はない。adapter protocol で規定される worktree 隔離原則の一時的破綻と回復の具体的事例）。
- **横展開観点**: case-run 実行担当サブエージェントへ worktree root 配下での作業を委譲する全ケースに適用可能。(a) 委譲先プロンプトで worktree root の絶対パスを明示するだけでなく、検証ステップで `cd` を伴う操作を禁止する、または worktree root 配下でのみ実行するスクリプト形式を推奨する。(b) case-auto 親ループは case-run 委譲完了後にメインリポジトリの git status を確認し、本 PR 由来の変更がないことを検証する防壁を標準搭載する。(c) 委譲先は worktree 隔離原則を事前確認し、cd 操作の必要性がある場合は作業前に親へ申請する運用。
- **再発条件**: (1) case-run を委譲先へ worktree root 配下で実行させる、(2) 委譲先が検証ステップで `cd` を伴う操作を実行する、(3) worktree root の絶対パスを離れる余地がある、の全てが揃った場合。
- **予防策候補**: (a) 委譲先プロンプトの MUST DO に「worktree root 配下でのみ作業し、cd で worktree root を離れる操作は禁止。検証コマンドは worktree root を基準とした相対パスまたは絶対パスで実行」を明記。(b) adapter protocol skill または case-run skill に worktree 隔離原則違反時の検出・是正手順を標準化。(c) case-auto 親ループに「case-run 委譲完了後、メインリポジトリ git status でクリーン状態を確認する」標準ゲートを組み込む。
- **想定反映先**: `agentdev-case-run-execution-adapter` SKILL.md（worktree 隔離原則と検出・是正手順）、case-auto command SPEC（委譲完了後のメインリポジトリ状態確認ゲート）
- **関連**: PR #1632, Issue #1626, Epic #1622 Wave 5, adapter protocol, worktree 隔離原則
- **タグ**: #wave5 #worktree #isolation-violation #delegation #adapter-protocol #case-auto #case-run #recovery

---

## 複数PR跨ぎの索引 AUTOGEN 再生成忘れによる docs-check NG 発生

- **問題事象**: Epic #1711 Wave 2 で OU-002 (REQ-0158 retire) と OU-003 (REQ-0161 retire) が並列実行された際、OU-002 が REQ-0158 を retired/ へ移動したが索引ファイル（README、DOC-MAP）の AUTOGEN ブロック更新を OU-003 へ委譲し、OU-003 は REQ-0161 のみ処理して REQ-0158 の索引更新が漏れた。これにより case-close QG-4 で docs-check が NG（req-active-count, req-active-table, req-retired-table, docmap-inventory の不整合）を検出した。
- **発生局面**: case-close（QG-4 最終評価）
- **検知方法**: `bun run .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts` 実行で index-generation-consistency NG 7件検出
- **根本原因**: 複数PRが同じ索引ファイルを編集する際、各PRが独立して AUTOGEN ブロックを更新できず、一方が他方へ委譲する設計になった。委譲先のPRが委譲元の要件を完全に把握しておらず、更新漏れが発生した。また generate_indexes.ts に pre-existing bug（spec-health-metrics.md L26 AUTOGEN marker backtick 誤認）があり、自動再生成による安全網が機能していなかった。
- **自律対応内容**: case-close QG-4 で不整合を検出し、(1) generate_indexes.ts 停止原因の spec-health-metrics.md L26 を抽象化、(2) generate_indexes.ts で全 AUTOGEN ブロックを一括再生成、(3) docs/README.md の REQ-0158 active エントリ削除、(4) docs/requirements/README.md に廃止済み要件セクションヘッダー追加、(5) フォローアップ PR #1718 としてマージ
- **ユーザー確認有無**: なし（エージェント自律で QG-4 評価中に発見・修正）
- **ADR/REQ/spec影響**: なし（運用知見。SPEC変更不要）。intake item として generate_indexes.ts bug 改修を記録
- **横展開観点**: 複数PRが同じ索引ファイルを編集する場合、最後にマージされるPRが generate_indexes.ts を実行して全 AUTOGEN ブロックを一括再生成する運用を検討。または case-close でデフォルトで generate_indexes.ts を実行する手順の追加を検討
- **再発条件**: (1) 複数PRが同じ索引ファイルの AUTOGEN ブロックに依存する変更を行う、(2) 各PRが独立して索引更新を試みるか委譲する、(3) case-close で docs-check が実行されず不整合が検出されない
- **予防策候補**: (a) case-close Step 3 に generate_indexes.ts 実行ステップを追加し、マージ後に AUTOGEN ブロックを必ず再生成する。(b) check_integrity.ts の index-generation-consistency を case-close の必須ゲートとして組み込む。(c) 複数PRの索引ファイル編集衝突を case-open Wave 構成で事前検出し、単一PRに集約する
- **想定反映先**: case-close command SPEC（Step 3 または Step E5b）、check_integrity.ts 運用、case-open Wave 構成ロジック
- **関連**: PR #1716, PR #1717, PR #1718, Epic #1711, generate_indexes.ts, check_integrity.ts, index-generation-consistency IR-061
- **タグ**: #case-close #qg-4 #autogen #generate-indexes #index-consistency #multiple-pr #docs-check #epic-1711

---

## verification-only 空 PR の squash merge 許容性

- **問題事象**: Epic #1711 Wave 1 (OU-001 #1712) は完全性台帳作成のみで実装差分0件の verification-only PR となった。GitHub が空コミット単体の squash merge を許容するか不確実だったため、マージ可否の事前確認が必要だった。
- **発生局面**: case-close（PR マージ）
- **検知方法**: `gh pr view 1715 --json mergeable,mergeStateStatus` で MERGEABLE/CLEAN を確認後、`gh pr merge 1715 --squash` を実行
- **根本原因**: REQ-0158-002 で verification-only PR の PASS ロジックが要件化されているが、GitHub が空コミット単体の squash merge を許容するかの実証がなかった
- **自律対応内容**: GitHub が空コミット単体の squash merge を許容することを実証（PR #1715 merge commit 41cf19de）。REQ-0108-279 の「GitHub が空 PR の squash merge を許可し空 commit を生成することを前提とする」が実証済みとなった
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（実証結果。REQ-0108-279 の前提を強化する観測結果）
- **横展開観点**: 今後 verification-only PR を作成する case で、GitHub squash merge が許容されることが確定したため、空 PR の取り扱いで躊躇不要
- **再発条件**: verification-only PR（実装差分0件）を作成する case
- **予防策候補**: 特になし（実証済み）。case-run で verification-only PR を作成する際、mergeable 確認後に自信を持ってマージ可能
- **想定反映先**: REQ-0108-279 の実証根拠（参照用）、case-run execution adapter（verification-only PR 作成時の判断材料）
- **関連**: PR #1715, Issue #1712, REQ-0158-002, REQ-0108-279, Epic #1711
- **タグ**: #verification-only-pr #empty-commit #squash-merge #github #req-0108-279 #epic-1711

---
