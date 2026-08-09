# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## Windows PowerShell で gh pr create --body-file が多重エンコード化け、gh api PATCH で修復した事象

- **問題事象**: Windows PowerShell 環境で gh pr create --body-file に UTF-8 BOM なしファイルを渡して PR を作成したところ、PR 本文が多重エンコード化け（UTF-8 バイト列を ASCII 数字文字列として展開した状態）になった。chcp 65001 + PYTHONIOENCODING=utf-8 のコンソールエンコーディング初期化を実施しても防止できなかった。
- **発生局面**: 実装（case-run インライン実行での PR 作成、PR #1976 経路D learning-promote）
- **検知方法**: PR 作成後に PR 本文を目視確認した際、日本語が数値列へ破損していることを発見
- **根本原因**: agentdev-gh-cli standard-procedures.md「コンソールエンコーディング初期化」（Section 2 Step 0 の3行）は gh CLI の stdout/引数渡し経路の一部を保護するが、gh pr create --body-file の本文読み込み経路において Windows 環境固有の多重エンコード変換を完全には防止できない。ファイル本文の decode 経路が Step 0 のコンソールコードページ切替えとは独立して cp932 影響を受ける場合がある。
- **自律対応内容**: gh pr create で一旦 PR を作成した後、Node.js で本文を UTF-8 JSON ファイルへ書き出し、gh api -X PATCH /repos/{owner}/{repo}/pulls/{N} --input <JSON> 経由で PR 本文を上書き修復した。
- **ユーザー確認有無**: なし（エージェント自律で検知・修復）
- **ADR/REQ/spec影響**: あり。agentdev-gh-cli SPEC / standard-procedures.md の WRITE 手続き（PR 作成）において、--body-file のみで本文化けが残るリスクと gh api PATCH による修復経路の標準化が必要。RU-0005 AG-001（--title inline 禁止、title 修正は REST API PATCH 標準手続き）と同種の経路分離問題だが本文側。
- **横展開観点**: Windows 環境で gh CLI の WRITE 操作（Issue 作成、Issue 本文更新、PR 作成、コメント追加）全般で、--body-file 指定でも本文 decode 経路の cp932 影響を完全排除できない可能性。Step 0 実施を前提としつつ、作成後の本文 VERIFY（読み戻し）で化け検出を必須化すべき。
- **再発条件**: Windows PowerShell/pwsh 環境で gh pr create --body-file（または gh issue create --body-file）を日本語本文付きで実行し、コンソールエンコーディング初期化後でも本文 decode 経路が cp932 影響を受ける条件。
- **予防策候補**: (1) WRITE 後 VERIFY で本文を読み戻し mojibake 検出を必須化、(2) 本文化け検出時は gh api -X PATCH --input <JSON>（Node.js UTF-8 書き出し）で修復する標準手順を standard-procedures.md へ追記、(3) title 修正 REST API PATCH 標準手続きと対になる本文修正手順の整備。
- **想定反映先**: .opencode/skills/agentdev-gh-cli/references/standard-procedures.md（WRITE 手続きセクション、VERIFY セクション）、verify.md（mojibake 検出観点）
- **関連**: PR #1976（経路D learning-promote）、PR #1973（Wave 1、本件発生時は観測されず本文正常を確認済み）、agentdev-gh-cli standard-procedures.md Section 2 Step 0、RU-0005 AG-001/AG-002
- **タグ**: `#windows` `#encoding` `#gh-cli` `#write-procedure` `#verify`

## skill rename 時の src/ と docs/specs/skills/ の対称性担保

- **問題事象**: agentdev-adr-* スキルの agentdev-decision-* への物理 rename（Wave 2 #2034）において、`src/opencode/skills/` 配下のディレクトリ rename と `docs/specs/skills/` 配下の SPEC ファイル rename（agentdev-adr-file-manager.md → agentdev-decision-file-manager.md 等）を対称に実行する必要があった。SPEC ファイル名とスキルディレクトリ名の対応関係を明示的に管理する仕組みが存在せず、rename 漏れを検出するチェックポイントが不明瞭だった。
- **発生局面**: 実装（Wave 2 #2034 skill rename、PR #2039）
- **検知方法**: Wave 3b #2036 の consumer・検証基盤移行、Wave 4 #2037 の E2E 検証・残骸検査での横断 grep により、参照不整合を検出
- **根本原因**: スキル rename を「ディレクトリ rename単体」として扱い、SPEC ファイル（docs/specs/skills/）との対称性、各 SPEC の frontmatter `id` フィールド、Artifact Graph の skill node と SPEC node の関係まで含めた全体を一括して管理する手順が事前に明文化されていなかった
- **自律対応内容**: Wave 3b で consumer 側参照を一括更新（109 files）、Wave 4 で E2E 検証と残骸検査を実施し参照不整合を解消。最終的に docs/specs/skills/ 配下の SPEC ファイル名も decision-* へ揃った
- **ユーザー確認有無**: なし（Epic 完了判定内で自律完結）
- **ADR/REQ/spec影響**: あり。REQ-002（配布成果物の責務境界）においてスキルディレクトリと対応 SPEC ファイルの命名対称性要件の明文化、または inspect-skills / artifact-validation への対称性チェック観点追加を検討すべき
- **横展開観点**: スキルに限らず command でも同様（src/opencode/commands/ と docs/specs/commands/ の対称性）。将来のスキル・command rename、namespace 変更時には「ディレクトリ rename + SPEC ファイル rename + frontmatter id + 全参照元更新」を4点セットで扱う手順の標準化が有効
- **再発条件**: スキルまたは command の物理 rename を伴う変更において、src/ 配下のみ更新し docs/specs/{skills,commands}/ 配下の SPEC ファイルとの対称性更新を漏らす場合
- **予防策候補**: (1) inspect-skills 診断に「src/opencode/skills/{name}/ と docs/specs/skills/{name}.md の存在対称性チェック」観点を追加、(2) agentdev-skill-authoring の rename 手順に SPEC ファイル同期ステップを明記、(3) Artifact Graph の skill node と SPEC node の対応テーブル自動生成
- **想定反映先**: `agentdev-skill-authoring` スキル、`agentdev-inspect-skills` スキル、REQ-002 配布成果物責務境界 SPEC
- **関連**: Epic #2032, #2034 (PR #2039, 4cab9fad), #2036 (PR #2041), #2037 (PR #2042), docs/specs/skills/agentdev-decision-file-manager.md, docs/specs/skills/agentdev-decision-guidelines.md
- **タグ**: `#skill-rename` `#spec-symmetry` `#inspect-skills` `#artifact-graph` `#migration`

## docs/adr/ 削除時の guides/ 配下参照更新スコープの初期漏れ

- **問題事象**: docs/adr/ 配下を DEC-001..008 移行後に削除した際（Wave 3a #2035）、参照更新スコープの初期設計で docs/guides/ 配下（artifacts-and-state.md, diagnostics-and-maintenance.md, glossary.md, project-docs-and-specs.md の4ファイル）からの docs/adr/ パス参照を見落とすリスクがあった。docs/guides/ は案内層（REQ-001）であり SPEC 層とは別物のため、SPEC 移行スコープに暗黙に含まれなかった。
- **発生局面**: 実装（Wave 3a #2035 ADR-001..008 → DEC-001..008 移行、docs/adr/ 削除、PR #2040）
- **検知方法**: Wave 3b #2036 consumer・検証基盤移行、Wave 4 #2037 E2E 検証時の残骸検査 grep により docs/adr/ 参照残存を確認。現在は docs/guides/ 配下で docs/adr/ 参照は0件、docs/decisions/ 参照4ファイルへ更新完了済み
- **根本原因**: 移行スコープを「SPEC と検証基盤」として設計した際、案内層（docs/guides/）を独立 consumer として明示的にスコープに入れていなかった。docs/guides/ はREQ-001 の案内層に属し SPEC 体系とは別階層のため、横断 grep の対象ディレクトリリストから漏れやすい
- **自律対応内容**: Wave 3b で consumer 一括更新、Wave 4 で残骸検査により docs/guides/ 配下の docs/adr/ → docs/decisions/ 参照更新を完了。最終的に broken link 0件を確認
- **ユーザー確認有無**: なし（Epic 完了判定内で自律完結）
- **ADR/REQ/spec影響**: あり。REQ-001（文書体系、案内層・基準境界）において、ディレクトリ削除・rename を伴う横断変更時の案内層（docs/guides/）スコープ明示要件、または agentdev-artifact-validation の change-impact チェック対象へ docs/guides/ を含める検討が必要
- **横展開観点**: ディレクトリ削除・大量 rename を伴う変更全般で、SPEC/REQ/ADR の基準層だけでなく案内層（guides）、README、AGENTS.md も独立 consumer としてスコープ管理すべき。将来の document-type 移行（例: SPEC → 別体系）でも同様
- **再発条件**: docs/ 配下のディレクトリ削除・rename を伴う変更において、案内層（docs/guides/）や README を参照更新スコープから漏らす場合
- **予防策候補**: (1) agentdev-artifact-validation check-change-impact の対象ディレクトリへ docs/guides/ を明示追加、(2) ディレクトリ削除前の broken link 一括検査プロセス標準化（grep -r "docs/{old_dir}/" docs/）、(3) case-open の Wave 分解時に案内層 consumer を明示スコープに含める基準の整備
- **想定反映先**: `agentdev-artifact-validation` スキル、REQ-001 文書体系 SPEC、`agentdev-workflow-lifecycle` スキル（Wave スコープ設計基準）
- **関連**: Epic #2032, #2035 (PR #2040, 9ea67084), #2036 (PR #2041), #2037 (PR #2042), docs/guides/artifacts-and-state.md, docs/guides/glossary.md, docs/guides/project-docs-and-specs.md, docs/guides/diagnostics-and-maintenance.md
- **タグ**: `#broken-link` `#guides-scope` `#案内層` `#change-impact` `#migration`

## 横断 grep パターン設計の改善余地: REQ/ADR ID 形式の多様性

- **問題事象**: ADR → Decision 移行で ADR-NNNN（4桁）から DEC-NNN（3桁）へ ID 形式が変化したが、横断 grep で移行対象を網羅検出する際のパターン設計に改善余地があった。IR-055 の検出ルールが `ADR-\d{4}` regex を前提としており、DEC-\d{3} 検出が未追加（残留リスク）。CR-005 の8分類（v2:歴史参照、単純参照、ID、テンプレート、コード内文字列等）は個別対応したが、分類パターン自体の事前設計と検証基盤（IR-* ルール）の整合更新が後追いになった。
- **発生局面**: 実装（Wave 3b #2036 consumer・検証基盤移行、Wave 4 #2037 E2E 検証）
- **検知方法**: Wave 4 の E2E 検証・残骸検査で IR-005, IR-036, IR-055 の detection semantics と新 Decision モデルの不整合を発見。DEC-\d{3} 検出ルール未追加を残留リスクとして記録
- **根本原因**: 大規模 rename の際、(a) 移行対象の grep パターンを事前に分類設計する手順、(b) 検出ルール（IR-*）自体の移行対象網羅を管理するチェックリスト、の2点が不明瞭だった。移行本体（docs 成果物）と移行を検証する基盤（IR ルール）の2層更新を一貫管理していなかった
- **自律対応内容**: CR-005 の8分類に従い個別対応し、docs/decisions/ への参照移行は完了。ただし IR-005/036/055 の検出ルール本文更新と DEC-\d{3} 検出追加は別 Issue で対応（残留リスクとして明示的に切り出し）
- **ユーザー確認有無**: なし（残留リスクは Epic 完了報告コメントに明示）
- **ADR/REQ/spec影響**: あり。検証基盤 SPEC（IR-005, IR-036, IR-055 を定義する SPEC）の detection semantics 精査と DEC-\d{3} パターン追加が必要。REQ-001 または integrity SPEC 層で「ID 形式変更時の検出ルール同期更新」要件の整備を検討すべき
- **横展開観点**: ID 形式変更（桁数、prefix）を伴う移行全般で、grep パターンの事前分類設計と検証基盤ルールの同期更新をセット管理すべき。将来の RU-NNNN 形式変更、SPEC-NN 形式変更でも同様
- **再発条件**: ID 形式（桁数・prefix）の変更を伴う横断移行において、移行対象 grep パターン設計と検証ルール（IR-*）の同期更新を後追いにする場合
- **予防策候補**: (1) case-open 時の Wave 分解で「検証基盤ルールの同期更新」を独立タスク化する基準の整備、(2) inspect-skills / docs-check に「ID 形式変更時の IR-* ルール網羅性チェック」観点追加、(3) grep パターン分類テンプレート（v2:歴史参照、単純参照、コード内文字列、テンプレート、検出ルール）の事前作成
- **想定反映先**: `agentdev-workflow-lifecycle` スキル（Wave スコープ設計基準）、`agentdev-doc-diagnostics` スキル（IR ルール網羅性）、integrity SPEC（IR-005/036/055 検出ルール）
- **関連**: Epic #2032, #2036 (PR #2041, fbb5fc2f), #2037 (PR #2042, a0143600), IR-005, IR-036, IR-055, CR-005（8分類）
- **タグ**: `#grep-pattern` `#detection-rules` `#id-format` `#検証基盤` `#migration`

## worktree パス慣例の明確化: .worktrees/（repo root） vs .agentdev/worktrees/

- **問題事象**: 複数 Wave を worktree ベースで並列・直列実行する過程で、worktree 配置パスの慣例が `.agentdev/worktrees/`（domain state ディレクトリ配下）と `.worktrees/`（repo root）の2候補で混同しやすい状況があった。実際には `.worktrees/{N}-{type}`（repo root）が正規（agentdev-git-worktree SKILL.md, DEC-001 charter 原則）だが、`.agentdev/` が domain state の正規配置先であるという認識から worktree も配下にあるべきとの誤認可能性があった。
- **発生局面**: 実装（Epic #2032 複数 Wave 実行時の worktree 作成・削除）
- **検知方法**: Epic 完了時の確認で、repo 内に `.agentdev/worktrees` の参照が0件であることを grep で検証。正規パス `.worktrees/` への言及は agentdev-git-worktree SKILL.md, docs/specs/integrity/test-impact-detection-gate.md 等で一貫していることを確認
- **根本原因**: `.agentdev/` が「AgentDevFlow の永続 domain state」として README・AGENTS.md で強く強調されるため、ランタイム成果物（worktree, tmp）も配下に配置すべきという誤認が生じうる。実際には worktree は harness 管理のランタイム artifact であり（DEC-001 charter 原則）、`.worktrees/`（repo root）が正。`.agentdev/tmp/` は gh CLI WRITE 手続きの workspace-local 一時領域（RU-0005 AG-003）として例外的に `.agentdev/` 配下にあるが、これは worktree とは別物
- **自律対応内容**: 実装上は誤認なく `.worktrees/` を使用。ただし慣例明確化のため、本学びにより `.worktrees/`（harness 管理 runtime）と `.agentdev/`（domain state）と `.agentdev/tmp/`（gh CLI WRITE workspace-local 一時領域）の3層の配置規則を整理
- **ユーザー確認有無**: なし（慣例確認、実装影響なし）
- **ADR/REQ/spec影響**: なし（現行仕様で `.worktrees/` が正規。本学びは慣例の再確認と誤認防止が目的）
- **横展開観点**: 今後 worktree 以外のランタイム artifact（ビルド成果物、キャッシュ等）の配置先を検討する際、`.agentdev/`（domain state）、`.worktrees/`（harness runtime）、`.agentdev/tmp/`（gh CLI workspace-local 一時）の3層分類を基準に配置を判断すべき
- **再発条件**: 複数の worktree を使用するワークフローで、新規参加エージェントまたは人間が `.agentdev/` を domain state として強く認識した結果、worktree も配下と誤認する場合
- **予防策候補**: (1) agentdev-git-worktree SKILL.md の worktree パス表記に「harness 管理 runtime artifact（DEC-001 charter）、.agentdev/ は domain state とは別階層」と注記、(2) .gitignore に `.worktrees/` を明示（既存の可能性あり、要確認）、(3) AGENTS.md またはガイドに3層配置規則（domain state / harness runtime / workspace-local tmp）の早見表を整備
- **想定反映先**: `agentdev-git-worktree` スキル、`agentdev-workflow-orchestration` スキル、docs/guides/artifacts-and-state.md
- **関連**: Epic #2032（複数 Wave worktree 実行）, src/opencode/skills/agentdev-git-worktree/SKILL.md（worktreeディレクトリ `.worktrees/{N}-{type}` 規定）, DEC-001 charter 原則（runtime workspace は harness 責務）, RU-0005 AG-003（`.agentdev/tmp/` workspace-local 一時領域）
- **タグ**: `#worktree` `#path-convention` `#harness-runtime` `#domain-state` `#charter`

## v2: 履歴参照保護の運用成功（AG-010、大規模 rename 移行事例）

- **問題事象**: ADR → Decision 移行は大規模 rename（766件の ADR 参照、Artifact Graph 776 nodes が対象）であり、Git history rewrite や文字列一括置換で v2:ADR-* 歴史参照を破壊するリスクがあった。AG-010（v2:ADR-* 履歴参照は維持、文字列一括置換禁止、AG-016）を運用基準として採用し、52件の v2:ADR-* 歴史参照を破壊なく維持して移行を完遂した。これは「v2: prefix による履歴参照保護」運用の成功事例である。
- **発生局面**: 実装（Wave 3a/3b/4 #2035, #2036, #2037、移行全行程）
- **検知方法**: Wave 4 #2037 E2E 検証・残骸検査で v2:ADR-* 歴史参照52件が維持されていることを確認。Artifact Graph で decision node 9件、adr node 0件、valid=true を確認。DEC-009 が AG-010 関連を明記し relates-to で v2:ADR-* を参照
- **根本原因**: （成功事例のため根本原因ではなく成功要因）成功要因は3点: (a) v2: prefix による履歴参照と現行参照の構文的分離が事前に確立されていた、(b) 文字列一括置換を禁止し8分類で個別対応する方針（AG-016, CR-005）を厳格運用、(c) Artifact Graph が node_type で移行前後を区別し破壊的変更を検知可能だった
- **自律対応内容**: Wave 3a/3b で v2:ADR-* 参照を一括置換対象から明示除外し、現行 ADR-NNNN 参照のみ DEC-NNN へ個別更新。Wave 4 で v2: 参照件数維持を E2E 検証項目に含め回帰確認
- **ユーザー確認有無**: なし（AG-010 は case-open 時に合意済みの運用基準）
- **ADR/REQ/spec影響**: あり（肯定的影響）。AG-010 運用成功事例として、REQ-001（識別子不変原則、056-064）と DEC-009 に v2: 履歴参照保護パターンの成功実績が記録された。将来の大規模 rename 移行（SPEC 体系変更、RU ID 形式変更等）で同パターンを再利用すべき
- **横展開観点**: v2: prefix による履歴参照保護パターンは ADR → Decision に限定されず、あらゆる ID 形式変更を伴う移行で適用可能。成功の3要因（構文的分離、個別対応方針、Graph による検知）をセットで将来移行に適用すべき
- **再発条件**: （成功事例のため再発ではなく再適用条件）ID 形式変更を伴う大規模 rename 移行で、(a) v2: prefix 等の履歴参照構文が事前確立、(b) 文字列一括置換禁止と個別分類対応の方針採用、(c) Artifact Graph 等の破壊検知基盤存在、の3条件が揃う場合
- **予防策候補**: （成功事例のため予防策ではなく再利用提案）(1) REQ-001 または guides に「大規模 rename 移行時の v2: 履歴参照保護パターン」を成功実績として明記、(2) 将来の ID 形式変更を伴う RU（SPEC 体系変更等）で AG-010 相当の運用基準を case-open の合意事項に標準組み込み、(3) inspect-docs / artifact-validation に「v2: 参照件数の移行前後比較」チェック観点を追加
- **想定反映先**: docs/guides/artifacts-and-state.md（v2: 履歴参照の運用解説）, REQ-001 文書体系 SPEC（識別子不変原則・056-064 補強）, `agentdev-workflow-lifecycle` スキル（大規模 rename 移行の Wave 設計基準）
- **関連**: Epic #2032, #2035 (PR #2040), #2036 (PR #2041), #2037 (PR #2042), DEC-009（AG-010 relates-to 明記）, AG-010, AG-016, CR-005（8分類）, REQ-001-056〜064
- **タグ**: `#v2-history` `#ag-010` `#rename-migration` `#成功事例` `#artifact-graph`
