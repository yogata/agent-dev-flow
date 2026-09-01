---
draft_type: req_draft
topic_slug: backlog-integration-202609
status: saved
created_at: 2026-09-02T04:30:00+09:00
source_rus: [RU-0001, RU-0002, RU-0003, RU-0004, RU-0005, RU-0006, RU-0007, RU-0008, RU-0009, RU-0010, RU-0011, RU-0012, RU-0013, RU-0014, RU-0015, RU-0016]
---

<!-- req-define 壁打ち 2026-09-02 / 入力: @req-units（16 RU、agentdev_handoff: true） -->

# draft-data

```yaml
work_type: maintenance

summary: >
  backlog-auto（inspect-docs 36件・learning 57件・intake 120件）と backlog-review の成果物
  （RU-0001〜RU-0016、agentdev_handoff: true）を REQ-057 新設へ集約する maintenance バッチ。
  docs corpus の参照・表記・用語・カタログの現行化、Skill 確定済み内容の Design 同期、
  配布境界 baseline 運用の整備、integrity suite・テスト基盤の期待値整合、guides/README/配布物の
  是正、learning 由来のガイダンス反映、draft Design 2件の昇格判断を行う。
  壁打ちで Q1〜Q9 の判断（採番方針・期待値動的化・QG-4 B拡張・宣言 Design 追記・DEC 修正モード
  ・README 全除去・明文化先分散・case-close 検査見送り・typecheck 対象外維持）をユーザー承認済み。
  Decision 新規作成なし（全判断が作業手段・配置・表記モードの選択）。配布物・テスト修正は
  case-run の実装作業として OU に記録し、REQ/Decision/Design 保存対象は artifact_actions へ分離。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      REQ 参照整合の corpus 棚卸し（RU-0001）。F-01〜F-07 の dangling 行参照・DRIFT と
      intake 15件（旧番号参照・旧 Step N 番号・broken link・用語旧表記・表記違反）を現行化する。
      F-01 採番方針（ユーザー承認）: 参照側修正を原則とし、参照先内容が現行 corpus のどの行にも
      所有されない場合のみ REQ-001 へ新規行を採番する（追加は最大2〜3行に抑制）。F-02 の 48ファイル
      書換は移管先 REQ-034-031〜034 への内容照合のうえ実施する。F-04 は「公開コマンド5分類」の
      現行所有行を機械的 grep で特定して参照更新する（REQ-001-053〜055 は所有しないことが確定済み）。
      F-06 は REQ-002-035（実在・内容一致確認済み）へ付け替え。機械置換は mechanical-replacement-rules
      の3段階手順に従い、禁止注記で旧表現の字面を引用しない。
      受け入れ条件: 対象パターンの全局 grep が zero hit であること。docs-check・IR-055 baseline・
      IR-044 が新規違反を生まないこと。F-04 の所有行特定が記録されていること。
  - id: AG-002
    content: |
      Skill 側で確定済みの運用内容の Design 同期（RU-0002・8件）。bun test 正規形 3 cwd 分割
      （docs-and-design-promotion.md L80-87・agentdev-quality-gates.md L72-82）、QG-4 機械受理基準、
      tmp 残存確認（case-run/case-close）、case-run gate 意味論（S3-6/S5-1）、em-dash 導入時ゲート方針、
      AUTOGEN retired 参照行領域免除の方針、check_integrity typecheck 対象外範囲の明記
      （対象拡張は本バッチ対象外・ユーザー承認済み）を Design へ反映する。
      checker 実装が必要な em-dash・AUTOGEN 免除は Design 方針明記のみで実装は別 Case。
      受け入れ条件: 8件の内容が対応 Design に反映されていること。Skill と Design の記述が乖離しないこと。
  - id: AG-003
    content: |
      宣言・カタログ整備（RU-0003・12件）。REQ-032-022 宣言を case-close 関連 Design へ、
      REQ-011-020/021 宣言を custom-tool-contracts.md へ、REQ-052 宣言を Design 側へ配置。
      REQ-048-012〜014 宣言の配置先は workflow-contracts.md への追記（ユーザー承認・Q4 A案）。
      verification-scope-catalog へ REQ-050 セクション追加。corpus.ts DEFAULT_SCAN_EXTENSIONS の
      拡張子方針（.ps1 等の扱い）を除外明示または追加として Design に確定。DEC-022.md L63 の
      REQ-046-004 幻参照は AG-001 の採番方針に従い是正。traceability missing-implementation の
      棚卸し方針と catalog 未登録 66件の棚卸し単位を本バッチで確定・実施する
      （traceability CLI 仕様変更は対象外）。
      受け入れ条件: 宣言・catalog 未登録が解消されていること。traceability check の恒常 fail
      （当該分）が解消していること。
  - id: AG-004
    content: |
      配布境界・baseline 運用の整備（RU-0004・9件+F-18）。concrete ID 残存10件の cleanup
      （プレースホルダ・Design 参照表記化）により release archive を exit 0 化。ir-055/ir-059
      baseline の整備（既知残存の記録・隠蔽なし）。SKILL.md L89 の DEC-023 参照は (proposed) 注記
      付与（ユーザー承認・Q5 A案・skills.yaml:3 を含む）。checker の repo-local モデル・outside-root
      over-block・jtw 特例残存15ファイルの一般化方針を Design 反映。gh-tool tests の
      tmp-plugin-local-* 5件を削除し生成を抑止。japanese-tech-writing を third-party-sync で
      実取得する（network 実行は third-party-sync コマンド経由）。checker 仕様の大規模変更は対象外。
      受け入れ条件: release archive が exit 0。baseline 方式が確定・適用済み。tmp 残渣ゼロ。
      japanese-tech-writing がメイン環境に配置されていること。
  - id: AG-005
    content: |
      gh-cli/CustomTool の Design 同期（RU-0005・7件）。custom-tool-contracts.md 迂回防止節への
      Plugin 設定契約（環境変数名等）とツール名 agentdev_gh の追記、runtime-package-boundary.md への
      ローダーシム・.gitignore 推奨反映、local-case-file.md への runner-local 固有細目反映、
      delegation-contracts.md への agentdev_gh/driver 経路追記、agentdev-gh-cli.md の記述現行化、
      docs/README.md L130・guides の gh CLI 手続き扱いの整合。ghcli Design の再編/削除は見送り
      （CR-003・記述現行化のみ）。agentdev_gh Tool 本体の実装変更と REQ-011 の REQ 行変更は対象外。
      stable contract は REF-001-008/009 手順遵守（意味変更なし）。
      受け入れ条件: gh CLI 手続きの正規所有が確定し README・guides と整合していること。
      Design 検索で agentdev_gh の契約が見つかること。
  - id: AG-006
    content: |
      integrity・テスト基盤契約の整備（RU-0006・8件+F-16）。integrity suite の EXPECTED_COMMANDS
      18件固定を動的化（public_commands 列挙から導出）し最小件数下限の検証を併設する
      （ユーザー承認・Q2 A案。漏れ検出の意味を損なわない）。worktree 環境 bun test 9件 fail の
      主要因（期待値固定）解消と残存 fail の分類記録。req-file-manager TS2345（L55,36）修正。
      4テンプレートへの Tracking 行追加。backlog-review Design へ REQ-039-006 宣言追加と
      docs/knowledge 副作用（git 対象）の明記。artifact-contracts.md L216 の REQ-002-046 誤参照是正。
      req-impact-map の手動双方向管理の明文化（F-16: req-impact-map.md L12 を正本とし
      rule-ownership.md・designs/README 備考を参照導線化）。checker 実装の大規模変更は対象外。
      受け入れ条件: 当該恒常 fail が解消。Design・テンプレート修正適用。
      req-impact-map 配置の未確定事項が正本1箇所に集約されていること。
  - id: AG-007
    content: |
      品質・検証ギャップの解消（RU-0007・8件+F-13。depends_on: AG-002/AG-006）。
      archive-builder staging テストの時間依存揺らぎと tempdir 並行衝突の解消（テストの意図＝
      検出力を維持した設計修正）。checkExtensions の worktree junction failure の fallback 方針確定。
      配布物対応宣言（ADF-COVERS）の配置規則を rule-ownership.md へ明文化。
      QG-4 正規形は既存セクション拡張（B拡張・ユーザー承認・Q3 A案）で tools/plugins 対応を追記。
      REQ-004:67・REQ-006:27-32・REQ-036:10,41 の文書品質是正。req-health-metrics AUTOGEN 計測例を
      generate_indexes.ts で再生成（F-13 と一体・本バッチ最後に一括実施）。
      git-worktree-test-fallback の title 先頭識別子不一致修正。checker 仕様変更は対象外。
      受け入れ条件: flaky・衝突・title 不一致解消。配置規則の明文化。AUTOGEN 計測例の再生成完了。
  - id: AG-008
    content: |
      運用規約の明文化先確定と反映（RU-0008・5件+F-29）。workflow-templates SKILL.md L221-223 の
      空見出し残骸削除（正規は L206）。明文化先（ユーザー承認・Q7 A案）: route 識別子検出基準と
      定性 REQ-ID 表記規約 → document-type-responsibilities.md（用語政策・訳語表隣接）、
      stale-junction 自己修復知見 → agentdev-git-worktree-test-fallback Design、
      adversarial-review 挿入境界見出し表記規約 → agentdev-adversarial-review Design 挿入境界節、
      knowledge 見出し機械判定形式 → patterns.md（Knowledge frontmatter 規約節）。
      定性 REQ-ID 規約が配布物 inline の REQ-ID 表記を肯定する場合の RU-0014（ID 衛生ガイダンス）
      との整合確認を実施する。patterns.md への追記は AG-009 の F-15 記載除去後に実施する。
      checker 実装の新規追加は対象外。
      受け入れ条件: 空見出し残骸が削除されていること。5規約の明文化先が確定し反映されていること。
  - id: AG-009
    content: |
      Design 混入除去・proposed DEC 権威引用是正（RU-0010・F-14/15/17/19/20/21）。
      workflow-skill-model.md L211-225 の将来計画セクションを除去（候補リストは backlog/RU 管理）。
      patterns.md L12 と designs/README.md L181 の移管候補記載を除去（移管実施判断は case-run
      作業記録へ）。command-file-format.md L62 の判断宣告を現行状態記述へ置換（DEC-022 引用除去含む）。
      F-19〜F-21 の proposed DEC（019/020/021/022/025）権威引用は現行 REQ への参照置換で是正
      （ユーザー承認・Q5 A案。F-18 のみ RU-0004 側で注記付与）。proposed DEC 承認時の更新
      チェックリストとして当該箇所一覧を保持する（保持先は RU-0010 由来成果物の記録）。F-19（plugins
      agentdev-gh-tool/README.md:3）と docs/designs/README.md の L181/L198 箇所は case-run 作業として
      OU-010 で実施する。F-21 の agentdev-issue-tracking.md:13 は ACT-DESIGN-025 で処理する。
      F-20 の command-file-format.md:62 は F-17 側で
      処理済みのため対象外。
      受け入れ条件: 未確定事項・将来計画セクションの除去。判断宣告の現行状態記述化。
      proposed DEC 権威引用が確定モードで是正されていること。
  - id: AG-010
    content: |
      guides・配布物の整合是正（RU-0011・11件）。F-22 diagnostics-and-maintenance.md の範囲超過
      （規範的宣言除去・正本 patterns.md L58 参照化）。F-23 req-case-flow.md の stale Step 11-1/11-3
      を現行 STEP モデル表記へ更新＋停止条件10項目の参照化。F-24 ルート README.md L78-156 の
      導入手順を全部除去し consumer-project-setup.md 参照リンクへ置換（ユーザー承認・Q6 A案）。
      F-25 README-INSTALL.md の不所存パス参照除去。F-26 docs/README.md の Design 2行追加
      （third-party-skill-management・content-corruption-checker）。F-28 upstream-handoff.md の
      隣接重複見出し整理。F-30〜F-32 不存在参照・不存在スキル名の削除・訂正
      （requirements-review-finding-protocol.md 参照削除、agentdev-tracking → agentdev-issue-tracking）。
      F-33 elevation → evaluation 誤字訂正。F-35 単独 contracts.md 参照の明確化。
      受け入れ条件: 11件の残存箇所が是正されていること。不存在参照が全局 zero hit であること。
  - id: AG-011
    content: |
      draft Design 2件の昇格判断実行（RU-0012・旧残置 F-16/F-17・ユーザー承認済み promote）。
      docs/designs/workflows/step-reference-contract.md と input-resolution-and-durable-state.md
      （status: draft 継続・updated 2026-08-15）について、検証対応評価（QG-4 含む）を含む昇格判断を
      正規経路（本 REQ の Case → case-close 工程）で実行・記録する。直接編集ではなく昇格判断の
      正規経路による。IR-054 の30日到達（2026-09-14 頃）前に処理する。
      受け入れ条件: 2件の昇格判断（検証対応評価含む）が正式工程で実施・記録されていること。
  - id: AG-012
    content: |
      req-save の AUTOGEN 索引再生成前置の明文化（RU-0013・learning）。REQ 行 append を伴う
      req-save 実行時の手順へ「AUTOGEN 対象索引（docs/requirements/README.md、req-health-metrics.md
      計測例等）の同 commit 再生成」を前置明記する（src/opencode/skills/agentdev-workflow-req-save/
      SKILL.md の該当 STEP）。      checker-execution-contracts.md に工程連動再生成前置と AG-009(a)
      （Issue #2386 由来の既存対応計画 ID。本 draft の agreed_items AG-009 とは別物）領域との整合注記を追加。
      gate 仕様（REQ-010-059）は不変・AG-009(a) 本体実装は対象外。
      checker-execution-contracts.md は AG-002 と共通反映先のため編集セクションの非重複を維持。
      受け入れ条件: 手順に再生成前置が明記されていること。REQ 行 append 後の鮮度検査 exit 0。
      AG-009(a) 領域との重複・矛盾がないこと。
  - id: AG-013
    content: |
      配布物執筆時の ID 衛生・記載様式ガイダンス（RU-0014・learning 4件統合）。
      agentdev-skill-authoring/SKILL.md の Guardrails/Steps へ (1) 配布物への実行手順・例示は
      fenced code block とプレースホルダ表記で書き concrete ID（REQ/DEC/AG 等の具象参照）の
      inline 記載を排除すること、(2) 対応宣言（ADF-COVERS implementation/verification）の正規配置先は
      docs 配下の正規成果物（skill Design・command Design）であることを追記。
      docs/designs/skills/agentdev-doc-writing.md への記載様式査読観点追記（候補）。
      RU-0008 の定性 REQ-ID 規約との整合確認（AG-008 の受け入れ条件に含む）。
      IR-055・配布依存境界・TIM の既存規定と矛盾しない。checker 変更なし。
      受け入れ条件: 記載様式と対応宣言配置先がガイダンスに明記されていること。
  - id: AG-014
    content: |
      PR close キーワードの template 反映（RU-0015・learning）。pr_desc.md L120 の
      `Closes #$ISSUE_NUMBER` を `Refs: #$ISSUE_NUMBER` へ変更し、マージ時の Issue 自動クローズを
      抑止する（case-close 工程の明示クローズ契約と整合）。case-close 側のマージ前 close キーワード
      検査追加は本バッチ対象外（ユーザー承認・Q8 A案・次回以降に持ち越し）。
      GitHub 側自動クローズ機構の設定変更と Issue テンプレート類は対象外。
      受け入れ条件: pr_desc.md のキーワードが Refs: 形式に変更されていること。
  - id: AG-015
    content: |
      AGENTS.md への PowerShell 一括 I/O 破壊リスク規定追加（RU-0016・learning・副処置）。
      行動規範へ1項目追加: PowerShell 標準 cmdlet（Get-Content / Set-Content）経由の既存
      UTF-8/LF ファイル一括読み書きは避け、edit ツール・node readFileSync/writeFileSync・
      [System.IO.File] 明示エンコーディングを標準とする。既存 Write ツール系規定の一般化として
      追記（repo 標準 UTF-8 BOM なし・LF と整合）。主処置として
      docs/knowledge/windows-powershell-bulk-io-corruption.md が同バッチで保存済み。
      case-run 委譲手順への追記は対象外（Q9 関連の別判断）。
      受け入れ条件: 規定が AGENTS.md に追加されていること。既存規定と矛盾しないこと。
  - id: AG-016
    content: |
      integrity-contracts と REQ-002-043 の緊張解消（RU-0009・1件・分類訂正: カタログDesign）。
      docs/designs/integrity/integrity-contracts.md L528/536 の archive 内
      skills/japanese-tech-writing/** 格納記述を、現行 third-party 管理方針（skills.yaml 宣言・
      取得機構）と整合する形へ現行化する。REQ-002-043（知識非保持原則）は不変。
      REQ 側を正とする source-of-truth priority に従い記述側のみ修正。third-party-sync 機構自体は
      対象外。
      受け入れ条件: archive レイアウト記述が REQ-002-043 と字面・趣旨の両面で緊張しないこと。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: create
    target: new:docs-corpus-integration-202609
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007, AG-008, AG-009, AG-010, AG-011, AG-012, AG-013, AG-014, AG-015, AG-016]
    content: |
      REQ-057「docs corpus 整合・現行化バッチ」を REQ-056 の次の番号で作成する。
      frontmatter（id: REQ-057、title: docs corpus 整合・現行化バッチ、created/updated は保存日）を持ち、
      構成は patterns.md の REQ セクション構成（目的/スコープ/要件テーブル/制約）に従う。
      目的: backlog 整理サイクル（inspect-docs・learning/intake/inspect 昇格）で確定した docs corpus の
      参照・表記・カタログ・テスト基盤・ガイダンスの不整合を、既存検査（IR-055・docs-check・
      traceability・integrity suite・IR-044）が新規違反を生まない形で現行状態へ復元し、
      今後の文書変更が検査と整合して維持される基準を所有する。
      スコープ対象: docs/**、src/opencode/**（配布物・テスト・テンプレート）、AGENTS.md、
      .agentdev 配布境界 baseline。
      スコープ対象外: checker・Tool の仕様変更（大規模）、traceability CLI 仕様変更、
      GitHub 自動クローズ機構の設定、REQ-010-059 gate 仕様、AG-009(a)（Issue #2386 由来の既存対応計画 ID・
      本 draft の agreed_items AG-009 とは別物）本体実装。
      要件テーブル（関心分類: 参照整合 / 表記用語 / Design同期宣言カタログ / 配布境界 baseline /
      テスト基盤品質 / guides運用規約 / learning反映 / 昇格判断）:
      | REQ-057-001 | docs corpus の dangling 行参照・旧番号参照は現行所有行に整合し、参照先内容が現行 corpus のどの行にも所有されない場合のみ REQ-001 へ新規行が採番されている（新規行は上限2〜3行） |
      | REQ-057-002 | docs corpus に broken link・不存在参照・不存在スキル名・誤字・曖昧参照が残存しない |
      | REQ-057-003 | docs corpus の用語・表記は訳語表・現行規約に整合している |
      | REQ-057-004 | workflow Skill 側で確定済みの運用内容（bun test 正規形、QG-4 機械受理、tmp 残存確認、gate 意味論、em-dash ゲート方針、AUTOGEN 免除方針、typecheck 対象外範囲）は Design 正規所有者と乖離しない |
      | REQ-057-005 | ADF-COVERS 宣言は docs 配下の正規成果物に配置されている |
      | REQ-057-006 | verification-scope-catalog と traceability corpus の登録状態・拡張子方針が現行実態に整合し、catalog 未登録の棚卸し方針が確定している |
      | REQ-057-007 | req-impact-map の配置の正本は req-impact-map.md であり、他文書は参照導線として整合している |
      | REQ-057-008 | integrity-contracts の archive レイアウト記述は REQ-002-043（知識非保持原則）と third-party 管理方針（skills.yaml 宣言・取得機構）に整合している |
      | REQ-057-009 | 配布依存境界の baseline（ir-055/ir-059）は既知残存の記録として整備され、新規違反を隠蔽しない。配布物の concrete ID と proposed Decision 引用は cleanup され、DEC-023 は (proposed) 注記付きである |
      | REQ-057-010 | checker 方針（repo-local モデル、outside-root over-block、特例一般化、tmp 残渣抑止）が Design に保持されている |
      | REQ-057-011 | integrity suite のコマンド数期待値は実コマンド数と整合して維持され、固定期待値による恒常 fail が発生しない（期待値の導出手段は integrity suite Design の責務） |
      | REQ-057-012 | QG-4 正規形は tools/plugins を含む完全形である。テストの flaky・並行衝突・title 不一致・既存型エラーは解消され、テンプレートは Tracking 行を保持する |
      | REQ-057-013 | REQ 文書の表記・文意は文書品質基準に整合している |
      | REQ-057-014 | 運用規約は正規所有 Design に明文化されている（route 識別子検出基準・定性 REQ-ID 表記 → document-type-responsibilities.md、stale-junction 自己修復 → agentdev-git-worktree-test-fallback Design、adversarial-review 見出し表記 → agentdev-adversarial-review Design、knowledge 見出し機械判定形式 → patterns.md）。テンプレートは構文的な残骸（空見出し）を保持しない |
      | REQ-057-015 | Design は未確定事項・将来計画・判断宣告を保持しない。proposed Decision を権威引用しない |
      | REQ-057-016 | guides は規範的権限を持たず、stale 表記を保持しない。ルート README は索引と参照リンクで足りる |
      | REQ-057-017 | draft Design の昇格判断は検証対応評価（QG-4 含む）を含む正規工程で実行・記録される |
      | REQ-057-018 | REQ 行 append を伴う req-save 実行手順は AUTOGEN 対象索引の同 commit 再生成を前置として保持する。checker-execution-contracts は工程連動再生成前置と AG-009(a)（既存対応計画 ID）領域との整合注記を持つ |
      | REQ-057-019 | 配布物への実行手順・例示は fenced code block とプレースホルダ表記で書かれ、concrete ID の inline 記載を排除される。対応宣言（ADF-COVERS）の正規配置先は docs 配下の正規成果物である |
      | REQ-057-020 | PR テンプレートの close キーワードは工程側明示クローズと整合する Refs: 形式である |
      | REQ-057-021 | PowerShell 標準 cmdlet 経由の既存 UTF-8/LF ファイル一括読み書きは行われず、edit ツール・node readFileSync/writeFileSync・[System.IO.File] 明示エンコーディングが標準である（docs/knowledge/windows-powershell-bulk-io-corruption.md と一体） |
      | REQ-057-022 | gh CLI 手続きの正規所有と Custom Tool（agentdev_gh）の Plugin 設定契約・ローダーシム・.gitignore 推奨・runner-local 細目・delegation-contracts 経路が Design に保持されている |
      制約: 本 REQ の修正は既存検査（IR-055 baseline delta・docs-check・traceability・integrity suite・
      IR-044）で新規違反を生まないこと。stable contract（REF-001-008/009）の意味変更は行わない。
      mechanical-replacement-rules の3段階手順に従い、禁止注記で旧表現の字面を引用しない。

  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: docs/requirements/REQ-001.md
    target_area: 要件テーブル（参照先内容が現行行に所有されない場合の新規行追加のみ）
    source_items: [AG-001]
    content: |
      F-01 対応（ユーザー承認・Q1 A案）。REQ-001-067/068/069/079 を参照する document-model.md:90,114、
      req-health-metrics.md:165,171,173、IR-044（frontmatter related_req L18 を含む全参照箇所）、
      rule-ownership.md、integrity-contracts.md、req-define.md:532、responsibilities/*、
      backlog-artifact-lifecycle.md の参照を、参照先内容の現行所有行へ付け替える。所有行が存在しない
      内容（Design 分離基準の要求水準・安定契約例外等）のみ、REQ-001 の要件テーブルへ新規行を追加する
      （上限2〜3行・連番は既存最大行の次）。
      追加した行には document-model.md の対応見出しの HTML コメントマーカー慣行（<!-- REQ-001-0NN -->）
      を整合させる。62行の肥大化シグナル境界を考慮し、追加は最小限に抑制する。

  - id: ACT-REQ-003
    artifact: req
    operation: update
    target: docs/requirements/REQ-006.md
    target_area: 移管注記（L20-21）
    source_items: [AG-001, AG-007]
    content: |
      F-02 対応後の注記現行化: REQ-006-110→REQ-034-031、REQ-006-112/113/114→REQ-034-032/033/034 への
      48ファイル参照書換完了に合わせ、L20-21 の移管注記を現行の移管先情報と整合させる。
      あわせて REQ-006:27-32 の文書品質是正（AG-007）を本 action で実施する。

  - id: ACT-REQ-004
    artifact: req
    operation: update
    target: docs/requirements/REQ-004.md
    target_area: 該当行（L67 付近）
    source_items: [AG-007]
    content: |
      REQ-004:67 の文書品質是正（AG-007）。意味変更を伴わない表記・文意の是正。

  - id: ACT-REQ-005
    artifact: req
    operation: update
    target: docs/requirements/REQ-036.md
    target_area: 該当行（L10, L41）
    source_items: [AG-007]
    content: |
      REQ-036:10,41 の文書品質是正（AG-007）。意味変更を伴わない表記・文意の是正。

  - id: ACT-REQ-006
    artifact: req
    operation: update
    target: docs/requirements/REQ-012.md
    target_area: 関連 Decision 参照行（L56）
    source_items: [AG-009]
    content: |
      F-21 対応: L56 の DEC-019（proposed）権威引用を現行 REQ への参照置換または参照削除で是正する
      （ユーザー承認・Q5 A案）。REQ-012 の要求水準は現行 REQ 行が所有するため意味変更なし。

  - id: ACT-REQ-007
    artifact: req
    operation: update
    target: docs/requirements/REQ-021.md
    target_area: 関連 Decision 参照行（L43）
    source_items: [AG-009]
    content: |
      F-21 対応: L43 の DEC-019（proposed）権威引用を現行 REQ への参照置換または参照削除で是正する。
      REQ-021 の要求水準は現行 REQ 行が所有するため意味変更なし。

  - id: ACT-REQ-008
    artifact: req
    operation: update
    target: docs/requirements/REQ-027.md
    target_area: 該当参照行（L37）
    source_items: [AG-001]
    content: |
      F-05 対応: L37 の REQ-002-022/163 参照を MOVE 先 REQ-029-001..008 へ更新する
      （integrity-rule-catalog.md L75 の移管記録に基づく）。DEC-011 は accepted のため
      非意味修正手順の適用対象。

  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: workflows
      slug: workflow-contracts
    target_area: コマンド分類
    source_items: [AG-001, AG-003]
    content: |
      F-04 対応: L35「公開コマンド5分類（REQ-005-048）」の参照を、機械的 grep で特定した
      公開コマンド5分類の現行所有行へ更新する（REQ-001-053〜055 は所有しないことが確定済み）。
      REQ-048-012〜014 の implementation 宣言を本 Design へ追加配置する（ユーザー承認・Q4 A案）。
      F-06 依存の workflow-contracts.md 内 REQ-001-029/036/037 参照箇所も AG-001 方針で現行化する。

  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: workflows
      slug: workflow-skill-model
    target_area: 新規 Capability Skill 抽出候補（将来対応）（セクション除去）
    source_items: [AG-009]
    content: |
      F-14 対応: L211-225「新規 Capability Skill 抽出候補（将来対応）」セクション（候補7項目）を
      Design から除去する。候補リストは backlog/RU 管理対象として扱う（document-model L40/L448 違反解消）。
      あわせて L23 の DEC-022（proposed）権威引用を現行 REQ 参照へ置換（F-20）。

  - id: ACT-DESIGN-003
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: foundations
      slug: patterns
    target_area: Knowledge frontmatter 規約
    source_items: [AG-008, AG-009]
    content: |
      F-15 対応: L12 の「執筆規約寄り内容は authoring/ への移管候補」記載を除去する
      （移管実施判断は case-run 作業記録へ。document-model L59 違反解消）。
      knowledge 見出し一致の機械判定形式を Knowledge frontmatter 規約節へ明記する
      （ユーザー承認・Q7 A案。AG-009 の記載除去後に実施）。
      docs/designs/README.md L181 の同系移管候補記載も除去する（README 側は case-run 作業）。

  - id: ACT-DESIGN-004
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: authoring
      slug: command-file-format
    target_area: ガードレール識別体系
    source_items: [AG-009]
    content: |
      F-17 対応: L62「ガードレール番号 Gxx の連番制度（…）は廃止する（DEC-022、REQ-051）」の
      判断宣告を現行状態記述（連番制度は廃止済み・現行は意味識別子による）へ置換する
      （DEC-022 引用除去を含む）。F-20 の同箇所委譲分も本 action で解消。

  - id: ACT-DESIGN-005
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: foundations
      slug: document-model
    target_area: 責務マトリックス以降の該当セクション群（L47・L90・L114・L313-314・L517 の複数箇所）
    source_items: [AG-001, AG-009]
    content: |
      F-07 対応: L313-314 の REQ-001-044/045 参照を現行所有行（REQ-001-056 等・内容照合のうえ）へ訂正する。
      F-06 対応: L47 の REQ-001-029/036/037 参照を REQ-002-035（実在・内容一致確認済み）へ付け替え。
      F-01 対応: L90（REQ-001-068 注記）・L114（安定契約の例外 <!-- REQ-001-069 --> マーカー）は
      AG-001 採番方針と ACT-REQ-002 の新規行採番結果に整合させる。
      F-21 対応: L517 の DEC-020（proposed）権威引用を現行 REQ 参照へ置換。

  - id: ACT-DESIGN-006
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: responsibilities
      slug: artifact-contracts
    target_area: アーティファクト種別
    source_items: [AG-006, AG-009]
    content: |
      AG-006 対応: L216 の REQ-002-046 誤参照を正しい現行行へ是正する。
      F-20 対応: L31,34 の DEC-022（proposed）権威引用を現行 REQ 参照へ置換。
      F-06 依存の同ファイル内 REQ-001-029 系参照も現行化する。

  - id: ACT-DESIGN-007
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: responsibilities
      slug: custom-tool-contracts
    target_area: 迂回防止
    source_items: [AG-005, AG-003, AG-009]
    content: |
      AG-005 対応: 迂回防止節へ Plugin 設定契約（環境変数名等）を追加し、ツール名（agentdev_gh 等）の
      確定事項を Design へ反映する。REQ-011-020/021 の implementation 宣言を本 Design へ配置（AG-003）。
      F-20 対応: L12 の DEC-022（proposed）権威引用を現行 REQ 参照へ置換。REQ-052 宣言の配置（AG-003）。

  - id: ACT-DESIGN-008
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: local
      slug: runtime-package-boundary
    target_area: link mode 接続手順技術詳細
    source_items: [AG-004, AG-005, AG-009]
    content: |
      AG-005 対応: ローダーシム（<package>.ts 1行再エクスポート）生成・検証・自己修復と
      bun install 実行ディレクトリへの .gitignore（node_modules/）推奨を反映する。
      AG-004 対応: repo-local モデルと detector 列挙の整合方針を反映する。
      F-20/F-21 対応: L239（DEC-022）・L225（DEC-021）の proposed DEC 権威引用を現行 REQ 参照へ置換。

  - id: ACT-DESIGN-009
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: local
      slug: local-case-file
    target_area: 共通メタデータ以降の実行環境関連セクション（L177 引用是正を含む）
    source_items: [AG-005, AG-009]
    content: |
      AG-005 対応: REQ-011-006 の runner-local 固有細目（local 版実行の前提・差分）を追記する
      （配置セクションは design-save 実行時に本内容と既存構成から決定する）。
      F-21 対応: L177 の DEC-020（proposed）権威引用を現行 REQ 参照へ置換。

  - id: ACT-DESIGN-010
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: workflows
      slug: delegation-contracts
    target_area: 委譲種別（delegation_type 参考分類）
    source_items: [AG-005]
    content: |
      AG-005 対応: agentdev_gh/driver 経路（委譲時の Custom Tool 利用経路）を追記する。

  - id: ACT-DESIGN-011
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: skills
      slug: agentdev-quality-gates
    target_area: full integrity suite 合格基準（QG-4）における bun test 実行形態契約
    source_items: [AG-002, AG-006, AG-007]
    content: |
      AG-002 対応: L72-82 の bun test 実行形態を現行 3 cwd 分割正規形へ現行化し、QG-4 機械受理基準を
      反映する。AG-006 対応: 期待値動的化（public_commands 列挙導出+最小件数下限）の方針を記載する。
      AG-007 対応: QG-4 正規形の tools/plugins 拡張（B拡張・既存セクション追記）を反映する。

  - id: ACT-DESIGN-012
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: commands
      slug: case-close
    target_area: 現在の動作
    source_items: [AG-002, AG-006]
    content: |
      AG-002 対応: L80-87 の bun test 契約節を単一 suite 形態から現行 3 cwd 分割正規形へ現行化する。
      tmp 残存確認（case-close SKILL L70-71 相当）を Design 側へ反映する。
      （RU-0002 記載の docs/designs/skills/agentdev-workflow-case-close.md は実在しないため、
      Workflow Skill の Design 所有に従い本 command Design へ割当変更・CR-002。）

  - id: ACT-DESIGN-013
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: commands
      slug: case-run
    target_area: 実行担当サブエージェント委譲フェーズ
    source_items: [AG-002]
    content: |
      AG-002 対応: case-run gate 意味論（S3-6/S5-1）の Design 反映漏れを解消し、tmp 残存確認
      （case-run SKILL L70,80 相当）を Design 側へ反映する。
      （RU-0002 記載の docs/designs/skills/agentdev-workflow-case-run.md は実在しないため、
      本 command Design へ割当変更・CR-002。）

  - id: ACT-DESIGN-014
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: integrity
      slug: checker-execution-contracts
    target_area: 検出対象除外規定
    source_items: [AG-002, AG-012, AG-003]
    content: |
      AG-002 対応: em-dash 導入時ゲートの方針・AUTOGEN retired 参照行領域免除の方針・
      check_integrity typecheck 対象外範囲の明記（対象拡張は対象外）を追加する。
      AG-012 対応: REQ 行 append に伴う工程連動 AUTOGEN 再生成前置と AG-009(a)（既存対応計画 ID・
      本 draft の AG-009 とは別物）領域との整合注記を追加する
      （AG-002 分と編集セクション非重複で配置）。
      AG-003 対応: traceability corpus 拡張子方針（.ps1 等の扱い: 除外明示または追加）を確定する。

  - id: ACT-DESIGN-015
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: integrity
      slug: rule-ownership
    target_area: req-impact-map.md との関係
    source_items: [AG-006, AG-007]
    content: |
      AG-006 対応（F-16）: req-impact-map.md L12 を正本とする方針を反映し、本ファイル L22-23 の
      「配置移動は未確定事項」記載を正本への参照導線へ変更する。
      AG-007 対応: 配布物対応宣言（ADF-COVERS）の配置規則を本ファイルへ明文化する。

  - id: ACT-DESIGN-016
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: responsibilities
      slug: req-impact-map
    target_area: 同期更新が必要なケース
    source_items: [AG-006]
    content: |
      AG-006 対応（F-16）: L12 を配置の正本記述として確定する（手動双方向管理の明文化を含む）。

  - id: ACT-DESIGN-017
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: integrity
      slug: integrity-contracts
    target_area: 許可変更プロファイル（Allowed Changes Profiles）
    source_items: [AG-016, AG-001]
    content: |
      AG-016 対応: L528/536 の archive 内 skills/japanese-tech-writing/** 格納記述を
      現行 third-party 管理方針（skills.yaml 宣言・取得機構）と整合する形へ現行化する
      （REQ-002-043 は不変・記述側のみ修正）。F-01 依存の本ファイル内 REQ-001-067/068/069/079 参照箇所も
      AG-001 方針で現行化する。

  - id: ACT-DESIGN-018
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: foundations
      slug: references/verification-scope-catalog
    target_area: REQ 系セクション末尾（REQ-050 セクション追加・anchor は最終 REQ セクション見出し）
    source_items: [AG-003, AG-009]
    content: |
      AG-003 対応: REQ-050 セクションを検証対応要否カタログへ追加する。
      F-21 対応: L23 の DEC-025（proposed）権威引用を現行 REQ 参照へ置換。

  - id: ACT-DESIGN-019
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: quality
      slug: req-health-metrics
    target_area: 現行 REQ の計測例（参照値）
    source_items: [AG-007, AG-001]
    content: |
      AG-007 対応（F-13 と一体）: AUTOGEN 計測例テーブル（L91-140）を generate_indexes.ts で再生成し
      REQ-056 等追加分を反映する（本バッチの REQ 修正完了後に最終一括実施）。
      F-01/F-03 依存: L12・L75・L156・L165-173 の旧番号参照を現行所有行へ更新する。

  - id: ACT-DESIGN-020
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: foundations
      slug: design-principles
    target_area: Command / Skill / Template / Script の責任分界
    source_items: [AG-001]
    content: |
      F-06 対応: L121 の REQ-001-029 参照を REQ-002-035（実在・内容一致確認済み）へ付け替え。
      F-05 対応: L164 の REQ-002-022/163 参照を REQ-029-001..008 へ更新。

  - id: ACT-DESIGN-021
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: integrity
      slug: rules/IR-044-req-spec-boundary-violation-detection
    target_area: 本文・frontmatter related_req を含む全参照箇所（L18・L22・L70-77・L129-132）
    source_items: [AG-001]
    content: |
      F-01/F-03 依存: 判定本体が依存する REQ-001-067/068/069/079 参照（本文 L22・L70-77・L129-132 と
      frontmatter related_req L18 を含む）と REQ-004 旧番号（L77）参照を
      AG-001 採番方針・ACT-REQ-002 の採番結果に整合させて現行化する。

  - id: ACT-DESIGN-022
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: integrity
      slug: rules/IR-063-common-policy-identifier-invariant
    target_area: 本文（L44 の参照箇所）
    source_items: [AG-009]
    content: |
      F-20 対応: L44 の DEC-022（proposed）権威引用を現行 REQ 参照へ置換する。

  - id: ACT-DESIGN-023
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: skills
      slug: agentdev-gh-cli
    target_area: 本文（gh CLI 手続きの正規所有記述）
    source_items: [AG-005]
    content: |
      AG-005 対応: agentdev-gh-cli.md の記述を現行実態（gh CLI 手続きの Design 扱い・Custom Tool 経由）
      へ現行化する。再編/統合/削除は見送り（CR-003・記述現行化のみ）。
      docs/README.md L130・guides の整合更新は case-run 作業として実施する。

  - id: ACT-DESIGN-024
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: workflows
      slug: backlog-artifact-lifecycle
    target_area: 検出事項プロトコル
    source_items: [AG-001]
    content: |
      F-01 依存: 本ファイル内の REQ-001-067/068/069/079 参照箇所を AG-001 採番方針・
      ACT-REQ-002 の採番結果に整合させて現行化する。

  - id: ACT-DESIGN-025
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: skills
      slug: agentdev-issue-tracking
    target_area: 本文（L13 の関連 Decision 参照箇所）
    source_items: [AG-009]
    content: |
      F-21 対応: L13 の DEC-020（proposed）権威引用を現行 REQ 参照へ置換する
      （REQ-049 参照は現行のため維持）。

conflict_resolutions:
  - id: CR-001
    conflict: 9件の判断要求（F-01 採番方針、期待値対応、QG-4 拡張方式、REQ-048 宣言配置先、proposed DEC 修正モード、README 削除範囲、明文化先、case-close 検査追加、typecheck 対象拡張）
    resolution: |
      壁打ち（2026-09-02）でユーザーが全件 A案を承認: (1) 参照側修正原則+行不在時の最小限の新規採番
      （上限2〜3行）、
      (2) 期待値動的化+最小件数下限、(3) QG-4 B拡張、(4) workflow-contracts.md 宣言追記、
      (5) F-18 注記付与+他は現行 REQ 置換、(6) README 手順全除去、(7) 明文化先分散（Q7 A案どおり）、
      (8) case-close 検査追加は対象外、(9) typecheck 対象外維持。
  - id: CR-002
    conflict: RU-0002 の Design 反映先として docs/designs/skills/agentdev-workflow-case-run.md・agentdev-workflow-case-close.md が指定されていたが、両ファイルは実在しない（Workflow Skill は同名 Design を持たない運用・check_skill_rename_symmetry が許容）
    resolution: 実所有者である docs/designs/commands/case-run.md・docs/designs/commands/case-close.md（command Design）へ反映先を割当変更した（ACT-DESIGN-012/013）。
  - id: CR-003
    conflict: RU-0005 が ghcli Design の扱い（再編/統合/削除）の決定を要求
    resolution: 再編・削除は見送り、記述現行化のみとする（最小対応・stable contract 手順遵守・docs README L130 と guides の整合更新は case-run 作業）。
  - id: CR-004
    conflict: RU 記載の rule-ownership.md パス表記ゆれ（responsibilities/ と integrity/ の混在）
    resolution: 実パスは docs/designs/integrity/rule-ownership.md（実在確認済み）として処理する。
  - id: CR-005
    conflict: REQ-057 の SPLIT シグナル（行数 0・関心分類数 +1・アーティファクト種別数 +1 = 合計 2 → req-health-metrics の「SPLIT 検討」レベル）
    resolution: |
      シグナル合計 2 を認識したうえで本構成（REQ-057 単一集約）を維持する。根拠: (a) sweep 型統合 REQ
      の前例（REQ-053）が同一構造を許容、(b) 行数シグナル非発火（22行 < 51）、(c) 統合管理により
      16 RU の整合を1 REQ で追跡できる、(d) 壁打ちでユーザーが REQ-057 集約構成案を承認済み
      （SPLIT 要否の提示と承認に相当）。req-save 時の SPLIT 診断で改めて指摘された場合は再評価する。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0001
    target_req: REQ-057
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-002
    source_ru: RU-0002
    target_req: REQ-057
    target_design: docs/designs/skills/agentdev-quality-gates.md ほか（ACT-DESIGN-011〜014）
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}
  - ou_id: OU-003
    source_ru: RU-0003
    target_req: REQ-057
    target_design: docs/designs/workflows/workflow-contracts.md ほか（ACT-DESIGN-001/007/014/018）
    operation: append
    scale: standard
    depends_on: [OU-001]
    recommended_order: 3
    issue_policy: single
    result: {}
  - ou_id: OU-004
    source_ru: RU-0004
    target_req: REQ-057
    target_design: docs/designs/local/runtime-package-boundary.md ほか（ACT-DESIGN-008）
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 4
    issue_policy: single
    result: {}
  - ou_id: OU-005
    source_ru: RU-0005
    target_req: REQ-057
    target_design: docs/designs/responsibilities/custom-tool-contracts.md ほか（ACT-DESIGN-007/008/009/010/023）
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 5
    issue_policy: single
    result: {}
  - ou_id: OU-006
    source_ru: RU-0006
    target_req: REQ-057
    target_design: docs/designs/responsibilities/artifact-contracts.md ほか（ACT-DESIGN-006/015/016）
    operation: append
    scale: standard
    depends_on: [OU-001]
    recommended_order: 6
    issue_policy: single
    result: {}
  - ou_id: OU-007
    source_ru: RU-0007
    target_req: REQ-057
    target_design: docs/designs/integrity/rule-ownership.md ほか（ACT-DESIGN-011/015/019）
    operation: append
    scale: standard
    depends_on: [OU-002, OU-006]
    recommended_order: 12
    issue_policy: single
    result: {}
  - ou_id: OU-008
    source_ru: RU-0008
    target_req: REQ-057
    target_design: docs/designs/foundations/patterns.md ほか（ACT-DESIGN-003）
    operation: append
    scale: standard
    depends_on: [OU-001, OU-009]
    recommended_order: 13
    issue_policy: single
    result: {}
  - ou_id: OU-009
    source_ru: RU-0009
    target_req: REQ-057
    target_design: docs/designs/integrity/integrity-contracts.md（ACT-DESIGN-017）
    operation: append
    scale: standard
    depends_on: [OU-001]
    recommended_order: 7
    issue_policy: single
    result: {}
  - ou_id: OU-010
    source_ru: RU-0010
    target_req: REQ-057
    target_design: docs/designs/workflows/workflow-skill-model.md ほか（ACT-DESIGN-002/003/004/005/006/007/008/009/018/022）
    operation: append
    scale: standard
    depends_on: [OU-001]
    recommended_order: 8
    issue_policy: single
    result: {}
  - ou_id: OU-011
    source_ru: RU-0011
    target_req: REQ-057
    target_design: なし（guides・README・配布物は case-run 作業）
    operation: append
    scale: standard
    depends_on: [OU-001]
    recommended_order: 9
    issue_policy: single
    result: {}
  - ou_id: OU-012
    source_ru: RU-0012
    target_req: REQ-057
    target_design: docs/designs/workflows/step-reference-contract.md・input-resolution-and-durable-state.md（昇格判断対象）
    operation: append
    scale: standard
    depends_on: [OU-001]
    recommended_order: 14
    issue_policy: single
    result: {}
  - ou_id: OU-013
    source_ru: RU-0013
    target_req: REQ-057
    target_design: docs/designs/integrity/checker-execution-contracts.md（ACT-DESIGN-014）
    operation: append
    scale: standard
    depends_on: [OU-002]
    recommended_order: 15
    issue_policy: single
    result: {}
  - ou_id: OU-014
    source_ru: RU-0014
    target_req: REQ-057
    target_design: なし（skill ガイダンス追記は case-run 作業）
    operation: append
    scale: standard
    depends_on: [OU-008]
    recommended_order: 16
    issue_policy: single
    result: {}
  - ou_id: OU-015
    source_ru: RU-0015
    target_req: REQ-057
    target_design: なし（template 変更は case-run 作業）
    operation: append
    scale: standard
    depends_on: [OU-001]
    recommended_order: 10
    issue_policy: single
    result: {}
  - ou_id: OU-016
    source_ru: RU-0016
    target_req: REQ-057
    target_design: なし（AGENTS.md 追記は case-run 作業）
    operation: append
    scale: standard
    depends_on: [OU-001]
    recommended_order: 11
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      対象パターン（REQ-006-110/112/113/114、REQ-004-056〜088、REQ-005-034/041/042/048/049、
      REQ-002-022/163、REQ-001-029/036/037、REQ-001-044/045 の旧参照、旧 Step N 番号、docs/specs/ 参照、
      Control Plane、agentdev-tracking、elevation）で docs/** と src/opencode/** を grep し zero hit を確認。
      docs-check と IR-055 baseline delta を実行し新規違反 0 を確認。
    pass_criteria: |
      全パターン zero hit。docs-check pass。IR-055 baseline delta 0。
      F-04 の「公開コマンド5分類」現行所有行の特定記録が残っていること。
    on_failure: |
      fix-and-reverify — 取りこぼし箇所を特定して置換後に再検証する（検査が機械的で修正経路が一意のため）。
  - id: TS-002
    target_item: AG-002
    verification: |
      更新後の Design（case-close.md・case-run.md・agentdev-quality-gates.md・
      checker-execution-contracts.md）と対応 Skill 本文（3 cwd 正規形・QG-4 機械受理・tmp 残存確認・
      S3-6/S5-1）を突合し、記述の乖離がないことを確認する。
    pass_criteria: |
      8項目すべてが Design 側に反映され、Skill と Design の記述が一致していること。
    on_failure: |
      fix-and-reverify — 乖離箇所を Design 側へ反映して再確認する（Skill 側を正とする反映の方針のため）。
  - id: TS-003
    target_item: AG-003
    verification: |
      agentdev-traceability check を実行し、REQ-032-022・REQ-011-020/021・REQ-048-012〜014・REQ-052 の
      missing-implementation 解消を確認。verification-scope-catalog の REQ-050 セクション存在を grep 確認。
    pass_criteria: |
      当該宣言分の traceability check が pass（missing 解消）。REQ-050 セクションが存在する。
      REQ-046-004 幻参照が解消されている。
    on_failure: |
      fix-and-reverify — 未配置宣言を特定して配置後に再実行する（配置先規律は確定済みのため）。
  - id: TS-004
    target_item: AG-004
    verification: |
      release archive 生成コマンドを実行し exit code を確認。ir-055/ir-059 baseline の適用状態を
      配布境界 gate（--profile source）で確認。git ls-files で tmp-plugin-local-* の zero hit を確認。
      .opencode/skills/japanese-tech-writing の存在を確認。
    pass_criteria: |
      release archive exit 0。baseline 11 = final 11（新規増分なし）。tmp 残渣 zero hit。
      japanese-tech-writing が配置されている。
    on_failure: |
      fix-and-reverify — 残存箇所を cleanup して再実行する（cleanup 経路は一意のため）。
  - id: TS-005
    target_item: AG-005
    verification: |
      docs/designs 配下を agentdev_gh・ローダーシム・.gitignore・runner-local で grep し、
      custom-tool-contracts.md・runtime-package-boundary.md・local-case-file.md・
      delegation-contracts.md に記載があることを確認。docs/README.md L130 と guides の記述整合を確認。
    pass_criteria: |
      4 Design すべてに該当記載があり、README・guides と矛盾しない。
    on_failure: |
      fix-and-reverify — 未反映 Design を特定して追記後に再確認する。
  - id: TS-006
    target_item: AG-006
    verification: |
      bun test（3 cwd 正規形）で integrity suite を実行し、EXPECTED_COMMANDS 関連の恒常 fail 解消と
      全体 fail 0 を確認。動的化の動作確認（ダミーコマンド追加時に期待値が追従することの単体確認）。
      TS2345 の解消を tsc --noEmit で確認。
    pass_criteria: |
      integrity suite fail 0。動的化により期待値が実コマンド数に追従し、最小件数下限検証が機能する。
      tsc exit 0。
    on_failure: |
      fix-and-reverify — 期待値導出ロジックまたは型エラーを修正して再実行する。
  - id: TS-007
    target_item: AG-007
    verification: |
      archive-builder 関連テストを N 回（10回程度）反復実行して flaky 解消を確認。
      checkExtensions を worktree で実行して fallback 動作を確認。
      git-worktree-test-fallback の title 不一致解消をテスト実行で確認。
      rule-ownership.md の配置規則追記と req-health-metrics AUTOGEN 再生成後の鮮度 gate exit 0 を確認。
    pass_criteria: |
      反復実行で flaky 0。fallback 動作確認。title 一致。配置規則が明文化済み。鮮度 gate exit 0。
    on_failure: |
      fix-and-reverify — テスト設計を修正して再実行する（検出力維持の方針のため）。
  - id: TS-008
    target_item: AG-008
    verification: |
      workflow-templates SKILL.md L221-223 の空見出し削除を grep で確認。
      明文化先 5件（document-type-responsibilities.md×2、agentdev-git-worktree-test-fallback Design、
      agentdev-adversarial-review Design、patterns.md）に各規約の追記があることを grep で確認。
    pass_criteria: |
      空見出し zero hit。5規約の明文化先に追記が存在する。定性 REQ-ID 規約と AG-013 の整合確認記録がある。
    on_failure: |
      fix-and-reverify — 未反映の明文化先を特定して追記する。
  - id: TS-009
    target_item: AG-009
    verification: |
      workflow-skill-model.md・patterns.md・designs/README.md から将来計画・未確定事項セクション/記載の
      除去を grep で確認。command-file-format.md L62 が現行状態記述になっていることを目視確認。
      proposed DEC（019/020/021/022/025）の権威引用箇所が置換済みであることを grep で確認
      （F-18 の DEC-023 は (proposed) 注記付きであることを確認）。
    pass_criteria: |
      除去対象 zero hit。判断宣告が現行状態記述に置換済み。proposed DEC 権威引用の残存 0
      （F-18 の注記付き引用を除く）。
    on_failure: |
      fix-and-reverify — 残存引用箇所を確定モードで是正して再検証する。
  - id: TS-010
    target_item: AG-010
    verification: |
      F-22〜F-35 の各残存箇所（11件・表記は AG-010 content どおり）を grep し zero hit を確認。
      README.md の導入手順除去と consumer-project-setup.md 参照リンク追加を確認。
      docs/README.md の Design 2行追加を確認。
    pass_criteria: |
      11件すべて zero hit。README 手順が除去され参照リンクが存在する。
    on_failure: |
      fix-and-reverify — 残存箇所を是正して再検証する。
  - id: TS-011
    target_item: AG-011
    verification: |
      2件の draft Design について昇格判断の実行記録（case-close 工程の判断記録・status 変更または
      監視継続の正当化記録）を確認する。
    pass_criteria: |
      昇格判断（検証対応評価含む）が正式工程で記録されている。
    on_failure: |
      fix-and-reverify — 昇格判断の実施記録が欠落する場合、正規工程での判断実施をやり直す
      （昇格判断の実施自体が完了条件のため record-in-findings は不適切）。
      なお判断材料不足で監視継続を選択した場合、その選択記録自体が「昇格判断の実施・記録」として
      合格とみなす。
  - id: TS-012
    target_item: AG-012
    verification: |
      agentdev-workflow-req-save/SKILL.md の該当 STEP に AUTOGEN 再生成前置の記載があることを確認。
      REQ 行 append を伴う req-save 相当操作後に鮮度検査（check_autogen_freshness 相当）が exit 0 に
      なることを確認。checker-execution-contracts.md の AG-009(a) 整合注記を確認。
    pass_criteria: |
      手順に前置明記あり。鮮度検査 exit 0。AG-009(a) 領域との重複・矛盾なし。
    on_failure: |
      fix-and-reverify — 手順記載または注記を修正して再確認する。
  - id: TS-013
    target_item: AG-013
    verification: |
      agentdev-skill-authoring/SKILL.md に記載様式（fenced+プレースホルダ+ID引用排除）と
      対応宣言の docs 配下配置先の記載があることを grep で確認。
      RU-0008 定性 REQ-ID 規約との整合確認記録を確認。
    pass_criteria: |
      2項目がガイダンスに明記されている。整合確認が記録されている。
    on_failure: |
      fix-and-reverify — ガイダンス記載を修正して再確認する。
  - id: TS-014
    target_item: AG-014
    verification: |
      pr_desc.md L120 のキーワードが Refs: 形式であることを grep で確認。
    pass_criteria: |
      close キーワードの Closes 形式が zero hit で、Refs: 形式が存在する。
    on_failure: |
      fix-and-reverify — テンプレートを修正して再確認する。
  - id: TS-015
    target_item: AG-015
    verification: |
      AGENTS.md 行動規範に PowerShell cmdlet 系の破壊リスクと標準手段の規定が追加されていることを
      目視+grep で確認。docs/knowledge/windows-powershell-bulk-io-corruption.md（保存済み）との
      一体性を確認。
    pass_criteria: |
      規定が存在し、既存 Write ツール規定と矛盾しない。
    on_failure: |
      fix-and-reverify — 規定文を修正して再確認する。
  - id: TS-016
    target_item: AG-016
    verification: |
      integrity-contracts.md L528/536 の現行化後の記述を確認し、REQ-002-043 との字面・趣旨の
      緊張が解消していることを確認する。
    pass_criteria: |
      archive レイアウト記述が skills.yaml 宣言・取得機構の方針と整合している。
    on_failure: |
      fix-and-reverify — 記述を修正して再確認する。

review_dispositions:
  - id: RD-001
    source_ru: RU-0001
    source_item: intake 15件 + inspect F-01〜F-07
    disposition: covered
    reason_code: ru_fully_covered
    reason: AG-001・ACT-REQ-002/003/008・ACT-DESIGN-001/005/017/019/020/021/024 として全量を covered。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0002
    source_item: intake 8件
    disposition: covered
    reason_code: ru_fully_covered
    reason: AG-002・ACT-DESIGN-011〜014 として covered（反映先の実在パスへ CR-002 で割当変更）。
    evidence:
      path: .agentdev/backlog/req-units/RU-0002.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_ru: RU-0003
    source_item: intake 12件
    disposition: covered
    reason_code: ru_fully_covered
    reason: AG-003・ACT-DESIGN-001/007/014/018 として covered（Q4 A案で workflow-contracts.md 追記）。
    evidence:
      path: .agentdev/backlog/req-units/RU-0003.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-004
    source_ru: RU-0004
    source_item: intake 9件 + inspect F-18
    disposition: covered
    reason_code: ru_fully_covered
    reason: AG-004・ACT-DESIGN-008 として covered（F-18 は注記付与モードで Q5 A案確定）。
    evidence:
      path: .agentdev/backlog/req-units/RU-0004.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-005
    source_ru: RU-0005
    source_item: intake 7件
    disposition: covered
    reason_code: ru_fully_covered
    reason: AG-005・ACT-DESIGN-007/008/009/010/023 として covered（ghcli 再編は CR-003 で見送り）。
    evidence:
      path: .agentdev/backlog/req-units/RU-0005.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-006
    source_ru: RU-0006
    source_item: intake 8件 + inspect F-16
    disposition: covered
    reason_code: ru_fully_covered
    reason: AG-006・ACT-DESIGN-006/015/016・ACT-REQ 該当分として covered（Q2 A案で期待値動的化）。
    evidence:
      path: .agentdev/backlog/req-units/RU-0006.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-007
    source_ru: RU-0007
    source_item: intake 8件 + inspect F-13
    disposition: covered
    reason_code: ru_fully_covered
    reason: AG-007・ACT-DESIGN-011/015/019・ACT-REQ-004/003/005 として covered（Q3 A案で B拡張）。
    evidence:
      path: .agentdev/backlog/req-units/RU-0007.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-008
    source_ru: RU-0008
    source_item: intake 5件 + F-29 + 定性REQ-ID item
    disposition: covered
    reason_code: ru_fully_covered
    reason: AG-008・ACT-DESIGN-003 として covered（Q7 A案で明文化先分散）。
    evidence:
      path: .agentdev/backlog/req-units/RU-0008.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-009
    source_ru: RU-0009
    source_item: intake 1件
    disposition: covered
    reason_code: ru_fully_covered
    reason: AG-016・ACT-DESIGN-017 として covered（カタログDesign 分類訂正を draft-data に反映）。
    evidence:
      path: .agentdev/backlog/req-units/RU-0009.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-010
    source_ru: RU-0010
    source_item: inspect F-14/15/17/19/20/21
    disposition: covered
    reason_code: ru_fully_covered
    reason: AG-009・ACT-DESIGN-002〜009/018/022/025・ACT-REQ-006/007 として covered（Q5 A案で修正モード確定。F-19・docs/designs/README L181/L198 は case-run 作業として OU-010 に明示、F-21 の agentdev-issue-tracking.md:13 は ACT-DESIGN-025 で処理）。
    evidence:
      path: .agentdev/backlog/req-units/RU-0010.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-011
    source_ru: RU-0011
    source_item: inspect 11件
    disposition: covered
    reason_code: ru_fully_covered
    reason: AG-010 として covered（F-24 は Q6 A案で全除去確定。配布物修正は case-run 作業に記録）。
    evidence:
      path: .agentdev/backlog/req-units/RU-0011.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-012
    source_ru: RU-0012
    source_item: inspect 旧残置 F-16/F-17
    disposition: covered
    reason_code: ru_fully_covered
    reason: AG-011・OU-012 として covered（昇格判断の正規経路要求として要件化）。
    evidence:
      path: .agentdev/backlog/req-units/RU-0012.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-013
    source_ru: RU-0013
    source_item: learning promoted 1件
    disposition: covered
    reason_code: ru_fully_covered
    reason: AG-012・ACT-DESIGN-014・OU-013 として covered（fail-open RU 化どおり）。
    evidence:
      path: .agentdev/backlog/req-units/RU-0013.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-014
    source_ru: RU-0014
    source_item: learning promoted 1件
    disposition: covered
    reason_code: ru_fully_covered
    reason: AG-013・OU-014 として covered（定性 REQ-ID 規約との整合確認を AG-008/AG-013 の受け入れ条件に織込み）。
    evidence:
      path: .agentdev/backlog/req-units/RU-0014.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-015
    source_ru: RU-0015
    source_item: learning promoted 1件
    disposition: covered
    reason_code: ru_fully_covered
    reason: AG-014・OU-015 として covered（case-close 検査追加は Q8 A案で対象外）。
    evidence:
      path: .agentdev/backlog/req-units/RU-0015.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-016
    source_ru: RU-0016
    source_item: learning promoted 1件（副処置）
    disposition: covered
    reason_code: ru_fully_covered
    reason: AG-015・OU-016 として covered（主処置の知識文書は同バッチで docs/knowledge/ に保存済み）。
    evidence:
      path: .agentdev/backlog/req-units/RU-0016.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: true
  decomposition: |
    16 OU（RU 単位）。全 OU が REQ-057 を共有するため、REQ-057 の REQ/Design 保存（req-save/design-save）
    を OU-001〜016 のうち最初の Wave で一括実施し、各 OU の Case は対応する実装修正を実行する構成を推奨。
    OU-007 は OU-002/OU-006 に依存（quality-gates・rule-ownership の順序化）。
    OU-008 は OU-009（patterns.md の F-15 記載除去後に明文化追記）と OU-001（採番方針）に依存。
    OU-014 は OU-008（定性 REQ-ID 規約との整合確認）に依存。OU-013 は OU-002（checker-execution-contracts
    の編集セクション非重複）に依存。
  wave_hints:
    - "Wave 1: OU-001, OU-002, OU-003, OU-004, OU-005, OU-006, OU-009, OU-010, OU-011, OU-015, OU-016（依存なしまたは OU-001 のみ）"
    - "Wave 2: OU-007（←OU-002/006）, OU-008（←OU-001/009）, OU-012, OU-013（←OU-002）, OU-014（←OU-008）"
```

# summary

backlog-auto 2026-09-01 の全成果（RU-0001〜RU-0016）を REQ-057 新設へ集約した maintenance バッチの要件定義。
壁打ち Q1〜Q9（採番方針・期待値動的化・QG-4 B拡張・宣言 Design 追記・DEC 修正モード・README 全除去・
明文化先分散・case-close 検査見送り・typecheck 対象外）をユーザー承認済み。
Decision 新規なし。REQ-057 作成 + 既存 REQ 7件軽微更新 + Design 25件更新を artifact_actions に、
16 OU を operation_units に記録。実装詳細（配布物・テスト修正・明文化追記）は case-run 作業として
AG 受け入れ条件に含む。
work_type は maintenance だが artifact_actions に REQ/Design 対象を持つため、workflow-lifecycle の
入口表どおり req-save → design-save を実行してから case-open へ進む（artifact_actions の存在が
実行判定基準）。adversarial-review（2系統）の accepted findings 9件（IR-044 L18 包含、REQ 行の
恒久水準化、SPLIT シグナル合計2の認識、OU 順序整合、AG-009(a) 名前空間注記、F-19/F-20/F-21 割当
明示、採番上限表現統一、TS-011 on_failure 修正、REQ-057-011 の Design 分離）を反映済み。
