# inspect-promoted 20261121T083802Z

## 成果物情報

- 成果物種別: inspect promoted artifact（採用済み・RU 化対象。backlog-review workflow（backlog-auto stage 3）が消費する）
- 元 finding: `.agentdev/inspect/inbox/inspect-docs-finding-20261121T083802Z.md`（inspect-docs workflow・backlog-auto stage 1 生成）
- 処分実行: inspect-promote workflow（backlog-auto stage 2・inspect 系統）。`--auto` 未指定（通常実行）
- 確定方式: 全件自律確定（REQ-036-018。正規契約からの導出または委譲された裁量の範囲で確定。HITL 対象 0 件）
- 処分内訳（同一実行）: promote 59 件（本成果物）/ defer 12 件（inbox 残置）/ reject 0 件 / 自動 promote 0 件
- 採用内訳: REQ 18 / Design 32（基盤 20 + commands・skills・workflows 12）/ DOC 9
- finding 属性（id / category / target / evidence / severity / confidence / source_of_truth / recommended_route / ng_classification / notes）は元 finding から原文維持（REQ-036-022 の severity 維持を含む）
- evidence 抜き取り再確認: 9 件実施（8 件は主張どおり。DESIGN-23 は過大主張のため promote から defer へ修正）
- review: adversarial-review を暫定分類後・確定前に実施（default-on・論理役割 3 役構成・独立 challenge 2 stream）。accepted 変更 2 件（DESIGN-23 → defer、DESIGN-32 → promote＋条件注記）、unresolved 本質的争点なし

## 採用一覧と promote 根拠

| id | severity | promote 根拠（要約） |
|---|---|---|
| REQ-01 | high | REQ-036-002 の公開 inspect command 宣言と正規参照表の内部 workflow 化が矛盾（実ファイル・Design 裏付け済み・抜き取り検証済み） |
| REQ-02 | medium | REQ-041-016 の5コマンド単独実行記述と soft guard・公開廃止済みの現行構造が矛盾 |
| REQ-03 | medium | REQ-122-008/015 の pre-commit 実装義務と実態（scripts/git-hooks は pre-push のみ・AGENTS.md「pre-commit は置かない」）が矛盾（抜き取り検証済み） |
| REQ-04 | medium | REQ-122-013 の intake-triage 新設が実在しない（traceability/policy.yaml に統合削除記録。実在確認: 不存在） |
| REQ-05 | medium | REQ-119-004 が廃止済み IR-072（DEC-065）を現行の検証対象として参照（REQ-117-011 が廃止を明記） |
| REQ-06 | medium | REQ-120-001 の集約先パスが現行不存在（REQ-122-005 の src 正本化後の構造と不一致） |
| REQ-08 | medium | REQ-034-025 の参照先 REQ-002-004 が pending 戻しを所有せず、正規所有は REQ-035-004 |
| REQ-09 | low | REQ-116-005 が one-time 処置経路と旧 TS 番号体系を恒久 REQ に残存（AGENTS.md 最上位制約1・REQ-001-049 型違反。Case #3779 完遂後の歴史化条件を RU に記録） |
| REQ-10 | low | REQ-116-002 の RA-005 が同名異義と衝突し判断記録の正（docs/knowledge）への参照を欠く |
| REQ-11 | low | REQ-110 TS-012 が消費済み一時成果物 RU-0242 へ間接依存（REQ-103-020・REQ-008 違反） |
| REQ-12 | low | REQ-061 内の REQ-035 名前参照が ID 非併記で同一文書内の他参照様式と不整合（IR-067 網外） |
| REQ-13 | low | REQ-009-002 の「2本限定」と REQ-050-001 の3本（実ファイルも3本実測）が矛盾。DEC-021 後継不存在の緊張は RU に状態整理条件として記録（抜き取り検証済み） |
| REQ-14 | medium | REQ-004-066〜068 がパーサ内部仕様を規範化し REQ-004-065 の委譲と重複（REQ-001-002 違反。MOVE 判定は req-define の委譲裁量） |
| REQ-15 | medium | REQ-018-006/007 が fs API 仕様を規範化し REQ-018-002 の委譲先と重複（REQ-001-002 違反） |
| REQ-17 | low | REQ-038-006 が内部保存構造と読込アルゴリズムを規範化し REQ-008 対象外条項と重複（REQ-001-002 違反） |
| REQ-19 | low | REQ-030 の4行が STEP 番号を直接参照し REQ-001-049 に違反 |
| REQ-20 | low | REQ-032-011 の「上級オーケストレータ」が REQ-003-016/REQ-034 の case-auto と用語不一致（別称定義なし） |
| REQ-21 | low | REQ-012 の ADF-COVERS コメントが要件表を分断（正規配置は文書先頭。AGENTS.md・ルート README の正規配置例） |
| DESIGN-01 | high | 廃止済み command-file-format.md（DEC-065）への現行参照6箇所。同一文書群内の廃止宣言（rule-ownership.md:73・designs/README.md:237）と矛盾（抜き取り検証済み） |
| DESIGN-02 | high | accepted 3件（patterns.md・quality-specs.md・artifact-contracts.md）が不存在の移行計画 §5.x を規範参照として指す（抜き取り検証済み） |
| DESIGN-03 | medium | baseline 運用廃止（REQ-010-074/079）後の concrete-abstraction.md の baseline リスト・運用宣言の陳腐化 |
| DESIGN-04 | medium | integrity-engine-plugin-architecture.md が不存在の commands/intake-triage Design を参照（実在確認: 不存在・policy.yaml に削除記録） |
| DESIGN-05 | medium | rule-ownership.md が削除済み IR-047/048 を「現行 checker」と記述しカタログの削除記録と直接矛盾 |
| DESIGN-06 | medium | rule-ownership.md の実装パスが不存在ファイル（現行は cli.ts + engine/ + rules/ レジストリ） |
| DESIGN-07 | medium | 廃止済み vocabulary-registry.md（DEC-065）を現行の除外ターゲット・対照表の正として扱う7ドキュメント。修復ではなく現行化方向が DEC-065 順合（後継復元の要否は req-define 入口で判断） |
| DESIGN-08 | medium | 3 IR ファイルの baseline 管理記述の文書内矛盾（integrity-contracts.md の baseline 廃止と対比。兄弟 IR-055 は更新済み） |
| DESIGN-09 | medium | 安定実装契約・正本所在のパスが現行 src 正本構造（trusted-distribution-gate 配下）と逸脱 |
| DESIGN-10 | medium | harness-separation-model.md の完了済み移行（references 実在）を将来計画時制で記述 |
| DESIGN-12 | medium | artifact-responsibilities.md:92 の原本配置（src/opencode/ 原本）が DEC-049・multi-host-canonical-model の src/common 正本と矛盾（抜き取り検証済み） |
| DESIGN-13 | medium | artifact-contracts.md の旧パス（src/opencode/tools/ は 0件実測）と不存在スクリプト名（現行3本のみ） |
| DESIGN-14 | medium | integrity-contracts.md の不実行 command（intake-capture/intake-from-github）・廃止 ADR 語彙（DEC-009）・実行不能化した CLI 注記 |
| DESIGN-15 | medium | req-impact-map.md の「(IR-047/048 は存続)」がカタログの削除記録と矛盾・後継 IR-074 が現行不存在 |
| DESIGN-16 | low | rule-ownership.md:144 が現行カタログに不存在の節（grep 0件）を参照 |
| DESIGN-18 | low | 移管後の孤立フラグメント2件（断片削除で解消。参照先機構自体が削除済み） |
| DESIGN-19 | low | document-type-responsibilities.md の完了済み修正の未来記述（自文書 :380 の固定件数埋め込み禁止と矛盾）と存在済み後続対応の計画残骸 |
| DESIGN-20 | low | 幽霊所有者 textlint-quality-runtime（実在 0件。現行は agentdev-textlint-guard・DEC-047） |
| DESIGN-21 | low | numbering-policy.md の完了済み ADR 移行の現在時制記述と不存在スクリプト名（現行は alloc-decision-number.ts） |
| DESIGN-22 | low | durable-state-and-recovery.md「v3 関連 Design の処遇」の本文なし見出し残骸 |
| DESIGN-24 | medium | case-close.md:42 の case-auto.md 節参照が references/ 移管後で本体に不存在（実体は case-auto/references/parallel-orchestration.md:173） |
| DESIGN-25 | medium | scale 判定「feature のみ」が canonical（standard-lifecycle.md「scale: 特定 work_type に限定しない」）と SKILL 実装（全 work_type）に矛盾する Design 2件のみの系統的残骸 |
| DESIGN-26 | medium | workflow-lifecycle Design の references 列挙（1件）とマクロ/マイクロ対応記述が SKILL 本体の宣言（3ファイル実在）と不一致 |
| DESIGN-27 | low | case-run Design See Also の廃止構成（epic-wave workflow・6軸実行契約差異）記述（workflow-case-run SKILL が収斂を明記） |
| DESIGN-28 | medium | delegation-contracts.md の controlled_case_execution 記述が廃止済み case-run Epic/Wave 実行を参照（現行用途の再定義は既存契約の範囲で RU に記録） |
| DESIGN-29 | medium | 「既存5コマンド単独実行」系統5箇所（配布 command 本体・Design・SKILL）が正規参照表の内部 workflow 定義と soft guard に矛盾 |
| DESIGN-30 | medium | 廃止 capture 系 command（intake-capture/intake-from-github）の現行列挙6箇所（実リンク切れ2件・不存在 inspect-skills.md Design へのリンク1件を含む） |
| DESIGN-31 | medium | workflow-skill-model.md の command 数・分類実数（公開13+内部5・5 Command）が正規参照表（公開8・内部 workflow）と不一致 |
| DESIGN-32 | medium | accepted Design 内の将来計画混入5箇所のうち4箇所（(2)〜(5)）は document-model（Design 本文は将来案を含まない）への明確な違反。（1）の phase 系 Design 整備要否は req-define 入口の要否判断として条件注記付きで採用 |
| DESIGN-33 | low | 完遂済み歴史段階（第13段・v4.0.0 final）を指す債務記述3箇所（監査レポートで完遂裏付け） |
| DESIGN-34 | low | 廃止済み epic-wave workflow の STEP-W* 識別子残存（現行は STEP-S1〜S6） |
| DESIGN-35 | low | accepted Design 内の「（新規セクション）」編集ラベル5箇所 |
| DOC-01 | medium | docs/README.md 索引の5行欠落（正本 designs/README.md 登録済み・5件とも実在を確認。抜き取り検証済み） |
| DOC-02 | medium | 不存在 DEC-064 への懸垂参照2箇所（decisions/ 実在確認: 064 不存在・README AUTOGEN 表に行なし。Git ログ参照または REQ-010 行参照への付け替え） |
| DOC-03 | low | guides 層での REQ-111-013 併存契約の無リンク再述4箇所（guides 層の権限範囲超過・同期漏れリスク。リンク付与または縮約は委譲裁量） |
| DOC-05 | low | guides 層の日付付き履歴叙述（正規記録箇所は decisions/README.md:298。Minimal-by-Default 原則1） |
| DOC-06 | low | PR セクション名「Findings / Capture候補」とテンプレート実見出しの表記不一致（high confidence・テンプレート側統合を含む） |
| DOC-07 | low | guides の不存在入口名 intake-capture（正は会話経由の intake capture・agentdev-intake-pipeline） |
| DOC-08 | low | glossary の「inspect 系コマンド」分類が同ファイル内の内部 workflow 定義・command-selection と不整合 |
| DOC-09 | low | guides 層の「の正」表記（規範的権限を持たない層での権限語使用。基準側所有は DEC-001/DEC-038/REQ-008 系） |
| DOC-10 | low | docs/README.md の authoring 所有者記述が正本 designs/README.md（quality-specs + skill/command-authoring 各 Design）と乖離 |

## 採用検出事項（元 finding から原文維持）

以下は元 finding の該当ブロックを原文のまま採用したものである。DESIGN-32 の（1）（phase 系 Design 整備要否）は req-define 入口の要否判断を条件とする。

### REQ 層

**REQ-01 / REQ・Design DRIFT** target: docs/requirements/REQ-036.md:21（REQ-036-002）、:20、:36-39
evidence: REQ-036-002「公開 inspect command 集合は {inspect-docs, inspect-skills, inspect-promote} の3件とし」。正規参照表 `src/common/commands/agentdev/README.md:12` と inspect-docs Command Design `docs/designs/commands/inspect-docs.md:73`（「Phase B で公開コマンド定義は廃止され、backlog-auto stage 1 が駆動する内部 workflow」）により、inspect 系は公開コマンド廃止済みの内部 workflow。実ファイルにも inspect-*.md の command 定義は存在しない。
severity: high / confidence: high / source_of_truth: 正規参照表・inspect-docs Command Design（現行 REQ-036 が現行構造と矛盾）
recommended_route: /agentdev/req-define（REQ-036 の「公開 command」枠組みを内部 workflow モデルへ現行化）
ng_classification: pre-existing / notes: 公開コマンド廃止を所有した REQ/Decision（v5 再編系）の特定が次の判断材料。

**REQ-02 / REQ DRIFT** target: docs/requirements/REQ-041.md:39（REQ-041-016）、:52、:24-27
evidence: REQ-041-016「既存5コマンドを従来どおり単独実行でき」。5 子ワークフローは soft guard で単独起動が防止され（`agentdev-workflow-inspect-docs/SKILL.md:3` 等「DO NOT USE FOR: 単独起動」）、公開コマンド定義も廃止済み。
severity: medium / confidence: high / source_of_truth: 正規参照表・各 Workflow Skill soft guard
recommended_route: /agentdev/req-define（REQ-01 と同時現行化）
ng_classification: pre-existing

**REQ-03 / REQ DRIFT** target: docs/requirements/REQ-122.md:29（REQ-122-008）、:36（REQ-122-015）、:41
evidence: REQ-122-008「scripts/git-hooks/pre-commit を実装する」・REQ-122-015「pre-commit エラー0件」。実態は `scripts/git-hooks/` 配下に pre-push のみ（pre-commit は commit `aeec56f38` で完全廃止）。AGENTS.md「pre-commit は置かない」、Design `docs/designs/integrity/local-verification-gates.md:14-15`（「pre-commit と minimal-gate は廃止した」・covers REQ-122-015 と対象 REQ 行が矛盾）。
severity: medium / confidence: high / source_of_truth: AGENTS.md・local-verification-gates Design・scripts 実在（現行 REQ-122-008/015 が現行構造と矛盾。優先順位上 REQ が上位だが REQ-122 自体が完了済み作業パッケージの RETIRE 判定対象）
recommended_route: backlog-review（REQ-122 完了後の RETIRE 提案。行単位の現行化ではなく RETIRE で一括解消）
ng_classification: pre-existing / notes: REQ-122 は traceability/req-122-wave4-phase4.yaml により Wave 4 Phase 4 実行済み。

**REQ-04 / REQ DRIFT** target: docs/requirements/REQ-122.md:34（REQ-122-013）
evidence: REQ-122-013「intake-triage コマンドを新設する」。現行 `src/common/commands/agentdev/` に intake-triage.md は不存在。`traceability/policy.yaml:916-917` に「REQ-122-013 は Phase B（#4165）の intake-triage 統合削除で verification 成果物が消失した行の追加登録」の記録。Design 側の幽霊ポインタ（DESIGN-04）と同根。
severity: medium / confidence: high / source_of_truth: traceability/policy.yaml・commands 実在一覧
recommended_route: backlog-review（REQ-03 と同時、REQ-122 RETIRE で解消）
ng_classification: pre-existing

**REQ-05 / 廃止参照・REQ DRIFT** target: docs/requirements/REQ-119.md:23（REQ-119-004）
evidence: REQ-119-004 受け入れ条件「check_integrity（IR-072）の該当 NG が解消」。IR-072（req-updated-freshness）は DEC-065 により廃止済み（現行 rules/ 23ファイル中不存在、REQ-117-011 も「廃止済み」明記、patterns.md:37 も同様）。
severity: medium / confidence: high / source_of_truth: DEC-065・REQ-117-011・REQ-103-022（廃止済み旧語彙を現行規範として使用しない）
recommended_route: backlog-review（REQ-119 RETIRE 判定に含める）
ng_classification: pre-existing

**REQ-06 / REQ DRIFT** target: docs/requirements/REQ-120.md:18（REQ-120-001）
evidence: 集約先「`.opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/README.md`」は現行不存在のパス。実態は `src/common/skills/repo-agentdev-integrity/trusted-distribution-gate/README.md`（REQ-122-005 の src 正本化・commit `b46ab1938` 後の構造）。趣旨（集約・出典付き）は充足済みでパス表記のみ陳腐化。
severity: medium / confidence: high / source_of_truth: REQ-122-005・リポジトリ実在
recommended_route: backlog-review（REQ-120 RETIRE 判定に含める）
ng_classification: pre-existing

**REQ-08 / 参照整合** target: docs/requirements/REQ-034.md:41（REQ-034-025）
evidence: 「REQ-002-004 の pending 戻し対象は当該実行の後続 stage から除外して再開時に扱う」。REQ-002-004 は STEP ID / command 固定番号の区別のみで pending 戻しに触れない。pending 戻しの正規所有行は REQ-035-004（「継続条件が成立し…pending へ戻して再試行でき」）。
severity: medium / confidence: medium / source_of_truth: REQ-035-004・REQ-002-004 実文
recommended_route: /agentdev/req-define（参照先修正。REQ-001-056/057 の6分類で意味変更か表記修正かを判定）
ng_classification: pre-existing

**REQ-09 / REQ 構造** target: docs/requirements/REQ-116.md:23（REQ-116-005）、:29-30
evidence: one-time 処置経路（「Case #3779 完了条件2（TS-007）と Epic #3803 の TS-008・TS-010 の GitHub 版部分の検証を再開する」）が恒久 REQ に残存。作成時点の TS 番号体系と現行 REQ-110 の TS 体系（TS-001〜TS-014・2026-11-13 更新）の番号対応は保証されない。
severity: low / confidence: medium / source_of_truth: AGENTS.md 最上位制約1・現行 REQ-110 TS 体系
recommended_route: /agentdev/req-define（Case #3779 処置完遂後に歴史化）
ng_classification: pre-existing

**REQ-10 / 参照整合** target: docs/requirements/REQ-116.md:20（REQ-116-002）
evidence: 「RA-005 判断（代替の構造的等価性は同等以上と認めない）」。同名異義の RA-005 が `docs/designs/workflows/phase-transition-and-coexistence-model.md:120`（REQ-111 の realization action・全く別物）に存在し、判断記録の正は `docs/knowledge/gh-isolated-verification-repository.md:15` のみ（REQ-103-021 の正規所有者到達性の観点で衝突・迂回）。
severity: low / confidence: medium / source_of_truth: REQ-103-021・docs/knowledge 該当行
recommended_route: /agentdev/req-define（判断記録への直接参照付与）
ng_classification: pre-existing

**REQ-11 / 参照整合** target: docs/requirements/REQ-110.md:75（TS-012）
evidence: 恒久検証義務節が一時的 RU 識別子（「RU-0242 の対象と同一のファイル群」）へ間接依存。消費済み一時成果物への参照で対象特定が脆弱。
severity: low / confidence: high / source_of_truth: REQ-103-020・REQ-008
recommended_route: /agentdev/req-define（対象ファイル群の直接列挙または現行 Design への委譲表現へ）
ng_classification: pre-existing

**REQ-12 / 参照様式** target: docs/requirements/REQ-061.md:14、:77-78
evidence: 「Epic と Wave 実行モデル REQ」（＝REQ-035）への名前参照が ID 非併記。同一文書内の他参照（REQ-005・REQ-006・REQ-017）は ID 併記。機械検査（IR-067）は ID 形式参照のみ対象のため網外。
severity: low / confidence: high / source_of_truth: docs/requirements/README.md（REQ-035）
recommended_route: 診断修正候補（REQ 整理時に ID 併記へ統一）
ng_classification: pre-existing

**REQ-13 / REQ DRIFT** target: docs/requirements/REQ-009.md:23（REQ-009-002）
evidence: 「scripts/ 直下の公開入口の境界（2本限定、モード、誤実行防止）は REQ-050 が所有する」。所有者 REQ-050-001 は「install.ps1、self-sync.ps1、setup-hooks.ts の3本に限定」（実ファイルも3本実測・旧入口不存在）。加えて accepted DEC-021「2本固定」には後継 Decision が存在せず「公開入口の追加は後継 Decision を必要とする」契約と緊張。
severity: low / confidence: high / source_of_truth: REQ-050-001（現行 REQ 優先）
recommended_route: /agentdev/req-define（REQ-009-002 要約更新と DEC-021 の状態整理〔後継 Decision または注記〕をセットで）
ng_classification: pre-existing

**REQ-14 / 文書分類（MOVE 候補）** target: docs/requirements/REQ-004.md:82-84（REQ-004-066〜068）
evidence: パーサ内部アルゴリズム（コード囲み認識規則・バッククォート3つ・言語指定・~~~ 拡張禁止）を要件行が規範化。REQ-004-065 が「転記規約の正は req-define 組立手順（draft-generation.md）が保持する」と委譲済みで重複。
severity: medium / confidence: medium / source_of_truth: REQ-001-002（詳細実装対象外）・REQ-001-067（設計文書への分離）
recommended_route: /agentdev/req-define（document-type-responsibilities.md 配置基準で MOVE 判定後、REQ 行縮約）
ng_classification: pre-existing

**REQ-15 / 文書分類（MOVE 候補）** target: docs/requirements/REQ-018.md:23-24（REQ-018-006/007）
evidence: 処理系 API 仕様（node fs.symlinkSync の相対 target 挙動・fs.rmdirSync 正規手段・bash backslash escape）を要件行が規範化。REQ-018-002 が明文化先を agentdev-git-worktree skill references へ委譲済み。
severity: medium / confidence: medium / source_of_truth: REQ-001-002・REQ-018-002
recommended_route: /agentdev/req-define（MOVE 判定）
ng_classification: pre-existing

**REQ-17 / 文書分類（MOVE 候補）** target: docs/requirements/REQ-038.md:24（REQ-038-006）
evidence: 内部保存構造と読込アルゴリズム（deferred プールの命名規則・frontmatter スキーマ・2フェーズ読込・全面読みフォールバック）を要件行が規範化。REQ-008 対象外条項「frontmatter、フィールド名、値一覧の詳細スキーマ（Design）」と重複。REQ-122-004 との二重所有隣接（DUPLICATE 隣接）。
severity: low / confidence: medium / source_of_truth: REQ-008 対象外条項・REQ-001-002
recommended_route: /agentdev/req-define（MOVE 判定。REQ-122 RETIRE 時に併せて）
ng_classification: pre-existing

**REQ-19 / 文書分類** target: docs/requirements/REQ-030.md:31、:46、:48、:49（REQ-030-012/027/029/030）
evidence: REQ-001-049「要件行は詳細実装の段階番号、手順番号を直接参照せず」に対し STEP-4/5 番号直接参照が4行。REQ-030-030 は DefinitionEdit の newText 行構造検証という内部検証アルゴリズム規定。
severity: low / confidence: medium / source_of_truth: REQ-001-049
recommended_route: /agentdev/req-define（機能名・段階名参照への現行化候補）
ng_classification: pre-existing

**REQ-20 / 用語 DRIFT** target: docs/requirements/REQ-032.md:29（REQ-032-011）
evidence: エスカレーション先「上級オーケストレータ」が REQ-003-016・REQ-034-030 の「case-auto」と不一致。本文他箇所に別称定義なし。
severity: low / confidence: medium / source_of_truth: REQ-003-016・REQ-034（case-auto 契約）
recommended_route: 診断修正候補（用語現行化）
ng_classification: pre-existing

**REQ-21 / 構文構造** target: docs/requirements/REQ-012.md:32
evidence: `<!-- ADF-COVERS(implementation): REQ-012-026, REQ-012-042 -->` が要件表の行間（REQ-012-035 行と REQ-012-036 行の間）に挿入され Markdown テーブルを分断。同種宣言の正規配置（AGENTS.md・ルート README）は文書先頭。inline 宣言自体は正当（REQ-012-054）で配置のみ問題。
severity: low / confidence: high / source_of_truth: AGENTS.md 等の正規配置例
recommended_route: 診断修正候補（コメントを文書先頭へ移動）
ng_classification: pre-existing

### Design 層（基盤ドメイン）

**DESIGN-01 / 廃止参照残置（command-file-format 系・横断統合）** target: docs/designs/commands/_template.md:81、docs/designs/commands/req-define.md:113、docs/designs/skills/agentdev-command-authoring.md:71、docs/designs/integrity/rules/IR-063-common-policy-identifier-invariant.md:22,43,64、docs/designs/integrity/integrity-rule-catalog.md:210、docs/designs/integrity/rule-ownership.md:135
evidence: 6箇所が廃止済み `authoring/command-file-format.md`（DEC-065 により廃止・docs/designs/authoring/ は空）へ現行の正規所有・参照先として言及。rule-ownership.md:73 が「command-file-format Design は DEC-065 により廃止済み」と述べており同一文書群内で矛盾。_template.md は全 command Design の親。
severity: high / confidence: high / source_of_truth: docs/designs/README.md:237（執筆規約の現行所有者は quality-specs.md・skill-authoring/command-authoring Design）
recommended_route: /agentdev/req-define（または Design 修正 case 経路。6箇所を現行所有者へ付け替え）
ng_classification: pre-existing

**DESIGN-02 / 廃止参照残置（移行計画ポインタ・死んだ規範参照）** target: docs/designs/foundations/patterns.md:20（§5.2）、docs/designs/quality/quality-specs.md:42（§5.6）、docs/designs/responsibilities/artifact-contracts.md:66（§5.2, §6.2）
evidence: 3件の accepted Design が「移行計画 §5.x」を規範的詳細の参照先として指すが、docs 全体で移行計画文書は不存在（grep 実測: 自己参照3件のみ）。REQ-123-003 のスリム化で参照先が削除された形跡。
severity: high / confidence: high / source_of_truth: リポジトリ実在
recommended_route: /agentdev/req-define（または Design 修正 case 経路。規範詳細の現行所有者への付け替えまたは参照削除）
ng_classification: pre-existing

**DESIGN-03 / DRIFT（baseline 運用廃止後の陳腐化）** target: docs/designs/foundations/references/concrete-abstraction.md:50-52、:29-32
evidence: baseline リスト3エントリがすべて陳腐化（`src/opencode/skills/...` 旧パス・`gh pr view` 除去済み・`docs/designs/` 触記述 grep 0件・req-analysis references ディレクトリ不存在）。`:29-32` は baseline-delta「段階解消」運用を現在状態として宣言するが、baseline 運用自体が REQ-010-074/079（Epic #4126 Phase 4）で廃止済み（integrity-contracts.md:219-223・distribution-boundary.md:86-88）。Markdown リンクでないため機械検査を通過。
severity: medium / confidence: high / source_of_truth: integrity-contracts.md・distribution-boundary.md（baseline 廃止）
recommended_route: Design 修正経路（節の現行化または削除）
ng_classification: pre-existing

**DESIGN-04 / 幽霊参照（intake-triage）** target: docs/designs/integrity/integrity-engine-plugin-architecture.md:76
evidence: 「対象外: intake-triage コマンド（commands/intake-triage Design）」。commands/intake-triage Design も command 本体も不存在（REQ-122-013 の統合削除記録は traceability/policy.yaml:916-917）。REQ-04 と同根の Design 側残置。
severity: medium / confidence: high / source_of_truth: traceability/policy.yaml
recommended_route: Design 修正経路（REQ-04 の REQ RETIRE と同時に参照除去）
ng_classification: pre-existing

**DESIGN-05 / DRIFT（削除済み IR の現行記述）** target: docs/designs/integrity/rule-ownership.md:86,95
evidence: 「現行 checker〔IR-047/048〕は本 yaml を fail-closed 読込」「IR-047/048 検出」。IR-047/048 は REQ-122 Wave-1・DEC-065 により削除済み（integrity-rule-catalog.md:145「削除済み・現行レジストリ非登録」、req-impact-map.md:103-111 削除記録）とカタログが直接矛盾。
severity: medium / confidence: high / source_of_truth: integrity-rule-catalog.md・req-impact-map.md
recommended_route: Design 修正経路（DESIGN-06 と同時）
ng_classification: pre-existing

**DESIGN-06 / DRIFT（実装パス陳腐化）** target: docs/designs/integrity/rule-ownership.md:85-87
evidence: 実装カラムが存在しない checker ファイル `check_integrity.ts` / `check_integrity.test.ts` を挙げる。現行構造は cli.ts + engine/ + rules/ レジストリ（DEC-065 分割後・integrity-engine-plugin-architecture.md:20-28）。
severity: medium / confidence: high / source_of_truth: integrity-engine-plugin-architecture.md
recommended_route: Design 修正経路
ng_classification: pre-existing

**DESIGN-07 / 幽霊参照（vocabulary-registry・横断統合）** target: docs/designs/integrity/integrity-contracts.md:331、integrity-rule-catalog.md:130,148,267,305,364、index-auto-generation.md:224、rules/IR-055-runtime-unresolved-reference.md:19,24,61、rules/IR-058-distribution-untracked-skill-reference.md:24,56
evidence: 7ドキュメントが廃止済み `vocabulary-registry.md`（DEC-065 により廃止・リポジトリ全体で 0件）を現行の除外ターゲット・対照表・検証経路の正として扱う。カタログ L148「対照表運用は存続」が README「廃止」と直接矛盾。L364 は特定パス `.opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md` を挙げる（現行不存在）。
severity: medium / confidence: high（存在性） / source_of_truth: docs/designs/README.md:237・リポジトリ実在
recommended_route: /agentdev/req-define（後継レジストリ復元か 7箇所参照除去かの判断は req-define 入口。IR-055/058 の除外リストの現行化を含む）
ng_classification: pre-existing

**DESIGN-08 / DRIFT（baseline 管理文言の内部矛盾）** target: docs/designs/integrity/rules/IR-064-unresolved-placeholder.md:24,27 対 :48-50、IR-067-referenced-req-row-existence.md:24 対 :52-54、IR-068-skill-projection-manifest.md:27 対 :53-55
evidence: 3 IR ファイルがフィールド・バリューテーブルで baseline 管理を現行のように記述しつつ、同一文書内の別節で baseline 運用廃止を宣言（REQ-010-074/079）。兄弟 IR-055 のテーブルは正しく更新済み。
severity: medium / confidence: high / source_of_truth: integrity-contracts.md:219-223（baseline 廃止）
recommended_route: Design 修正経路（テーブル現行化）
ng_classification: pre-existing

**DESIGN-09 / DRIFT（安定実装契約パス逸脱）** target: docs/designs/integrity/distribution-boundary.md:162,164、validator-split-criteria.md:25
evidence: 安定実装契約・正本所在が `.opencode/skills/repo-agentdev-integrity/scripts/lib/distribution-boundary.ts`・`scripts/lib/workflow_trigger.ts` を挙げるが、現行正本は `src/common/skills/repo-agentdev-integrity/trusted-distribution-gate/distribution-boundary.ts`・`lib/workflow_trigger.ts`（scripts/ セグメントなし・.opencode 側は投影）。
severity: medium / confidence: high / source_of_truth: integrity-engine-plugin-architecture.md:15-31（現行 src/ 正本構造）・リポジトリ実在
recommended_route: Design 修正経路
ng_classification: pre-existing

**DESIGN-10 / 将来計画混入** target: docs/designs/foundations/harness-separation-model.md:102-103
evidence: 「`agentdev-architecture-advisory` は `references/architecture-review-delegation.md` を新設し同モデルへ移行する」。当該 references ファイルは現存し移行は完了済み。
severity: medium / confidence: high / source_of_truth: リポジトリ実在
recommended_route: Design 修正経路（現行時制への書き換え）
ng_classification: pre-existing

**DESIGN-12 / DRIFT（原本配置表記が DEC-049 矛盾）** target: docs/designs/responsibilities/artifact-responsibilities.md:92
evidence: 「原本は `src/opencode/` に置き、`.opencode/` は実行時配置先として原本を投影する」。DEC-049・multi-host-canonical-model.md:18-27・同ファイル L18-21 の Canonical Owner テーブル（`src/common/`）と矛盾。
severity: medium / confidence: high / source_of_truth: DEC-049・multi-host-canonical-model.md
recommended_route: Design 修正経路
ng_classification: pre-existing

**DESIGN-13 / DRIFT（旧パス・旧スクリプト名）** target: docs/designs/responsibilities/artifact-contracts.md:28-29、:287、:217
evidence: Custom Tool 原本を `src/opencode/tools/` とするが現行原本は `src/common/tools/`（runtime-package-boundary.md:114・`src/opencode/tools/` は 0件実測）。`sync-opencode.ps1`・「install-sync」は現行 scripts/（setup-hooks.ts・install.ps1・self-sync.ps1 の3本のみ）に不存在。
severity: medium / confidence: high / source_of_truth: DEC-049・runtime-package-boundary.md:114
recommended_route: Design 修正経路
ng_classification: pre-existing

**DESIGN-14 / 廃止語彙・不実行コマンド** target: docs/designs/integrity/integrity-contracts.md:154-155、:63,73,76,80、:426-428
evidence: (a) 許可変更プロファイル行に `intake-capture` / `intake-from-github`（実在しない command）。(b) カテゴリテーブルの ADR 語彙行（ADR status 遷移妥当性等・DEC-009 で ADR 語彙廃止・対応 IR なし）。index-auto-generation.md:24「ADRトopic別ビュー」も同型。(c) CLI コードブロック内に「（旧 check_integrity.ts は rules レジストリへ分割統合、DEC-065 決定3）」の注記が実際のスクリプトパスを置き換え実行不能化。
severity: medium / confidence: high / source_of_truth: DEC-009・integrity-engine-plugin-architecture.md
recommended_route: Design 修正経路
ng_classification: pre-existing

**DESIGN-15 / DRIFT（削除済み IR 括弧書き・幽霊後継 IR-074）** target: docs/designs/responsibilities/req-impact-map.md:139、:115,119
evidence: 「(IR-047/048 は存続)」がカタログ L145・同ファイル L103-111 の削除記録と矛盾。IR-023 の後継として IR-074（`checkIrRuleClassification`）を参照するが IR-074 は rules/ にもカタログにも不存在（req-impact-map のみが言及）。
severity: medium / confidence: high / source_of_truth: integrity-rule-catalog.md 現行インデックス
recommended_route: Design 修正経路
ng_classification: pre-existing

**DESIGN-16 / 参照整合** target: docs/designs/integrity/rule-ownership.md:144
evidence: 「詳細は integrity-rule-catalog.md「IR-019, IR-022, IR-026, IR-036: inspect-docs 移管」節」が現行カタログに不存在（grep 0件・全384行確認済み）。
severity: low / confidence: high / source_of_truth: 現行カタログ内容
recommended_route: Design 修正経路
ng_classification: pre-existing

**DESIGN-18 / 構造残骸** target: docs/designs/integrity/targeted-docs-guard-implementation.md:176-182、docs/designs/integrity/checker-execution-contracts.md:74
evidence: references/ へ移管後の孤立した箇条書きフラグメント（old/new/severity/scope エントリが前置きなしで残存・参照先 obsolete-path-map 機構自体が削除済み）と、ぶら下がり文断片（「IR-067 の docs/reports 免除と同一の位置づけであり」）。
severity: low / confidence: high / source_of_truth: 同文書内の移管記述
recommended_route: Design 修正経路（断片削除）
ng_classification: pre-existing

**DESIGN-19 / 計画残骸・固定件数違反** target: docs/designs/responsibilities/document-type-responsibilities.md:588-589、:523
evidence: 「英語見出し `## references/` を使用する9件を `## 参考文献` へ修正する」は完了済み（grep 0件）の未来記述で同ファイル:380 の固定件数埋め込み禁止と矛盾。「後続の ID 衛生ガイダンス対応は…」は既に存在（agentdev-skill-authoring.md:61「配布物執筆時の ID 衛生」）。
severity: low / confidence: high / source_of_truth: リポジトリ実在
recommended_route: Design 修正経路
ng_classification: pre-existing

**DESIGN-20 / 幽霊所有者** target: docs/designs/responsibilities/artifact-quality-control-routing.md:83
evidence: 「textlint-quality-runtime は文章表層検査の共通基盤を所有し」。実在 0件・現行の基盤は agentdev-textlint-guard（DEC-047 は旧名を過去手段として記録）。
severity: low / confidence: high / source_of_truth: document-type-responsibilities.md:32・DEC-047
recommended_route: Design 修正経路（現行名への付け替え）
ng_classification: pre-existing

**DESIGN-21 / 移行完了後の旧スクリプト名** target: docs/designs/foundations/numbering-policy.md:87-92
evidence: ADR 移行セクションが完了済み移行を現在時制で記述し、不存在スクリプト `alloc-adr-number.ts` / `alloc-dec-number.ts` を呼ぶ（現行は `alloc-decision-number.ts`）。
severity: low / confidence: high / source_of_truth: DEC-009・scripts 実在
recommended_route: Design 修正経路
ng_classification: pre-existing

**DESIGN-22 / 空セクション** target: docs/designs/foundations/durable-state-and-recovery.md:63-65
evidence: 「v3 関連 Design の処遇」見出しに本文なし（内容撤去後の見出し残骸）。
severity: low / confidence: high / source_of_truth: 同文書構造
recommended_route: Design 修正経路（見出し削除）
ng_classification: pre-existing

### Design 層（commands / skills / workflows）

**DESIGN-24 / 参照陳腐化（移管済み節）** target: docs/designs/commands/case-close.md:42
evidence: 「`docs/designs/commands/case-auto.md` コンフリクト解消モデル Level 2/3 参照」。当該節は case-auto.md 本体に不存在（実体は `case-auto/references/parallel-orchestration.md:173` へ移管済み）。
severity: medium / confidence: high / source_of_truth: case-auto references 実在
recommended_route: Design 修正経路
ng_classification: pre-existing

**DESIGN-25 / DRIFT（scale 判定「feature のみ」系統的残骸）** target: docs/designs/skills/agentdev-workflow-lifecycle.md:19,27,54、docs/designs/commands/req-define.md:103
evidence: 「スケール判定（feature のみ standard / large）」「Scale判断（featureのみ）」。正（standard-lifecycle.md:21,25「scale: 特定 work_type に限定しない」「大規模 bugfix 等も対象になり得る」）と実装（agentdev-workflow-lifecycle SKILL.md:80「scale は全 work_type にわたって」・workflow-req-define SKILL.md:49）は「全 work_type」。Design 2件のみ旧値。
severity: medium / confidence: high / source_of_truth: standard-lifecycle.md・SKILL 本体
recommended_route: Design 修正経路
ng_classification: pre-existing

**DESIGN-26 / DRIFT（workflow-lifecycle Design の references・提供内容欠落）** target: docs/designs/skills/agentdev-workflow-lifecycle.md:33-35、:25、:31
evidence: Design の references 列挙は `upstream-handoff.md` のみに対し SKILL 本体が `structured-stage-handoff.md`・`reference-resolution.md` を正規所有と宣言（3ファイル実在）。Design のマクロ/マイクロ フェーズ定義・ラベル体系の対応記述が SKILL 側に不検出。
severity: medium / confidence: medium / source_of_truth: SKILL 本体「STEP model 連携」表
recommended_route: Design 修正経路
ng_classification: pre-existing

**DESIGN-27 / DRIFT（case-run Design See Also の廃止構成記述）** target: docs/designs/commands/case-run.md:220
evidence: 「workflow 実装本体（single workflow、epic-wave workflow、6軸実行契約差異）」。epic-wave workflow と6契約軸は廃止・case-auto stage 3 移転済み（workflow-case-run SKILL.md:39-40 が「廃止により single workflow へ収斂」と明記）。Design 本体（:70）は収斂後の記述で一貫し See Also descriptor のみ旧構成。
severity: low / confidence: high / source_of_truth: workflow-case-run SKILL.md
recommended_route: Design 修正経路
ng_classification: pre-existing

**DESIGN-28 / DRIFT（delegation-contracts 委譲種別表の廃止構造）** target: docs/designs/workflows/delegation-contracts.md:110,149
evidence: `controlled_case_execution` ＝「case-run Epic / 複数Issue実行」「単一 Issue または Wave 内の準備、実行、提出」。case-run は Epic/Wave を処理対象とする実行契約を廃止（SKILL.md:13-14・case-run Design :51,:70）。
severity: medium / confidence: medium / source_of_truth: workflow-case-run SKILL.md・case-run Design
recommended_route: Design 修正経路（`controlled_case_execution` の現行用途の再定義を含む）
ng_classification: pre-existing

**DESIGN-29 / DRIFT（「既存5コマンド単独実行」系統）** target: docs/designs/commands/backlog-auto.md:19,92,100、src/common/commands/agentdev/backlog-auto.md:64、docs/designs/skills/agentdev-workflow-backlog-auto.md:139
evidence: 「既存5コマンドを従来どおり単独実行できる」（配布 command 本体）「既存5コマンド…は置換しない」「既存5コマンドの…単独実行契約の変更」（対象外記述）。正規参照表は5処理を「公開コマンドではなく backlog-auto が Workflow Skill として駆動する内部 workflow」と定義し、各 Workflow Skill soft guard は「単独起動」禁止を明示。同一 corpus 内で用語・契約が不整合。STEP-3 責務整合検査（command 本体と Design 間）でも指摘。
severity: medium / confidence: high / source_of_truth: src/common/commands/agentdev/README.md・各 Workflow Skill soft guard
recommended_route: /agentdev/req-define（REQ-01/REQ-02 と同時の現行化。配布物本体と Design・SKILL を跨ぐため REQ 起点が妥当）
ng_classification: pre-existing

**DESIGN-30 / 廃止参照残骸（capture 系・inspect-skills Design）** target: docs/designs/commands/intake-promote.md:155、docs/designs/skills/agentdev-workflow-backlog-auto.md:140、docs/designs/workflows/standard-lifecycle.md:49、workflow-skill-model.md:202,235、capture-boundaries.md:106、docs/designs/commands/inspect-promote.md:123
evidence: 6箇所が廃止済み intake-capture / intake-from-github を現行 command・Workflow Skill として列挙。intake-promote.md:155 は `intake-capture.md`・`intake-from-github.md` への実リンク切れ（当該 Design 不存在）、inspect-promote.md:123 は不存在 `inspect-skills.md` Design へのリンク。正は正規参照表「intake item の作成は会話経由で intake pipeline 能力（agentdev-intake-pipeline）が担う」。
severity: medium / confidence: high / source_of_truth: src/common/commands/agentdev/README.md
recommended_route: Design 修正経路（リンク切れ2件を含む6箇所の現行化）
ng_classification: pre-existing

**DESIGN-31 / DRIFT（soft guard 実数記述）** target: docs/designs/workflows/workflow-skill-model.md:234,235
evidence: 「全18 Workflow Skill…18 ＝ 公開 command 13 ＋ 内部 lifecycle 5」・「intake / learning / backlog 5 Command」。現行は公開 8 コマンド（case 系5＋5処理は内部）。
severity: medium / confidence: medium / source_of_truth: src/common/commands/agentdev/README.md
recommended_route: Design 修正経路
ng_classification: pre-existing

**DESIGN-32 / 将来計画混入（accepted Design 内の未解決計画記述）** target: docs/designs/workflows/phase-transition-and-coexistence-model.md:16、collaboration-loop.md:70、workflow-skill-model.md:211、lifecycle-state-machine.md:78-80、docs/designs/commands/issue-lifecycle-records.md:46
evidence: (1) phase-transition-and-coexistence-model.md「Capability Skill 等の具体的なスキル構成の分担と個別 command Design の整備は確定していない…後続設計に委ねる」（phase 系 Design 欠落の自己宣言と併存）。(2) collaboration-loop.md「将来段階で REQ-038 の行変更が別途必要」。(3) workflow-skill-model.md「将来の rename は別 Issue スコープとする」。(4) lifecycle-state-machine.md「v3 状態関連 Design の処遇（planned supersede 記録）」節に記録なし（見出し残骸）。(5) issue-lifecycle-records.md「様式サポートの実装は…後続実装要求」。
severity: medium / confidence: medium / source_of_truth: AGENTS.md 最上位制約1・document-model.md（Design 本文は将来案を含まない）
recommended_route: Design 修正経路（(1) は phase 系 Design 整備の要否判断を req-define へ。他は現行化または削除）
ng_classification: pre-existing

**DESIGN-33 / 債務記述の陳腐化** target: docs/designs/skills/agentdev-workflow-backlog-auto.md:153、docs/designs/integrity/rule-ownership.md:33、docs/designs/foundations/traceability-model.md:117
evidence: 「委譲先未整備の債務（第13段 full validation で再評価）」等の再評価契機参照が完遂済みの歴史段階（第13段実施・v4.0.0 final 成立済み・req-045-consistency-audit-20260921.md:14,68）を指す。同型3箇所。
severity: low / confidence: high / source_of_truth: docs/reports/integrity/audits/req-045-consistency-audit-20260921.md
recommended_route: Design 修正経路
ng_classification: pre-existing

**DESIGN-34 / 廃止 STEP 識別子** target: docs/designs/workflows/capture-boundaries.md:44
evidence: 「STEP-S4/STEP-W3 委譲先」。STEP-W* は廃止済み epic-wave workflow の識別子で、現行 case-run STEP は STEP-S1〜S6 のみ。
severity: low / confidence: high / source_of_truth: workflow-case-run SKILL.md
recommended_route: Design 修正経路
ng_classification: pre-existing

**DESIGN-35 / 編集ラベル残存** target: docs/designs/commands/case-run.md:119,137、intake-promote.md:99、learning-promote.md:114、inspect-promote.md:74
evidence: accepted Design 内の「（新規セクション）」編集ラベル残存（5箇所）。
severity: low / confidence: high / source_of_truth: 同文書構造
recommended_route: Design 修正経路
ng_classification: pre-existing

### Decision / guides / README 層

**DOC-01 / 索引乖離（docs/README.md Design 索引）** target: docs/README.md:175-185、:230-243
evidence: docs/README.md の横断 Design 索引（9件）と integrity 索引（12件）が正本 designs/README.md（横断 12行・integrity 14行）に対し5行欠落: workflows/phase-driven-collaboration-model.md、workflows/phase-transition-and-coexistence-model.md、workflows/verification-resource-lifecycle.md、integrity/integrity-engine-plugin-architecture.md、integrity/local-verification-gates.md（全て実在・正本登録済み）。「現在像への導線」節が v5.1 を現行案内しながら v5.1 Design 2件が索引に載らない入口としての不完全性。
severity: medium / confidence: high / source_of_truth: docs/designs/README.md（正本・docs/README.md:196 がこれを正と指定）
recommended_route: 診断修正候補（docs/README.md 索引補完。authoring 記述は DOC-06 と同時）
ng_classification: pre-existing

**DOC-02 / 懸垂参照（DEC-064）** target: docs/designs/responsibilities/req-impact-map.md:131、docs/designs/integrity/integrity-rule-catalog.md:135-136
evidence: 「物理削除した（DEC-064、REQ-010-003）」「削除根拠…（DEC-064）」。DEC-064.md は不存在（decisions/ は 061/062/063/065/066/067 のみ・README AUTOGEN 表にも行なし）。存在しない Decision ID が現行 Design に削除根拠として引用。
severity: medium / confidence: high / source_of_truth: decisions/ 実在一覧
recommended_route: Design 修正経路（Git ログ参照または REQ-010 行参照への付け替え。decisions/README.md 欠番散文（DOC-04）と合わせて整理）
ng_classification: pre-existing

**DOC-03 / guides 所有権表記（併存契約の無リンク再述）** target: README.md:19、docs/guides/command-selection.md:35、docs/guides/artifacts-and-state.md:147
evidence: REQ-111-013 所有の双経路併存契約（「後継経路の実現・採用まで現行の変更駆動経路が正であり…前置しない」）をリンクなしで「〜が正である」という所有語で再述（4箇所散在）。REQ-111-013 変更時の同期漏れリスク。
severity: low / confidence: medium / source_of_truth: REQ-111-013（glossary.md:94 が REQ-111-013 付きで定義）
recommended_route: 診断修正候補（REQ へのリンク付与または要約への縮約）
ng_classification: pre-existing

**DOC-05 / guides 履歴叙述** target: docs/guides/diagnostics-and-maintenance.md:49
evidence: 「v2:ADR-0001〜0023 の 23 ファイルは 2026-07-20 に物理削除済み。024〜099 は存在実績なし」。正規記録箇所（decisions/README.md:298）以外の guide 側日付付き履歴叙述はナビゲーション層の範囲を超える。
severity: low / confidence: medium / source_of_truth: decisions/README.md:298・Minimal-by-Default 原則1
recommended_route: 診断修正候補
ng_classification: pre-existing

**DOC-06 / 表記不一致（PR セクション名）** target: docs/guides/troubleshooting.md:67
evidence: 「Findings / Capture候補」（半角スペース付き）対テンプレート実見出し `pr_desc.md:96`「Findings/ Capture候補」。テンプレート内部の参照表記（L89/L111）も割れている。
severity: low / confidence: high / source_of_truth: pr_desc.md 見出し行
recommended_route: 診断修正候補（テンプレート側の表記統合を含む）
ng_classification: pre-existing

**DOC-07 / guides 不存在入口名** target: docs/guides/troubleshooting.md:70
evidence: 「手動でintake-captureに登録する」。`intake-capture` という単独起動入口は存在しない（会話経由の intake capture（agentdev-intake-pipeline スキル）が正）。コマンド名誤読リスク。
severity: low / confidence: high / source_of_truth: command-selection.md:17・intake-learning-backlog-flow.md:42
recommended_route: 診断修正候補
ng_classification: pre-existing

**DOC-08 / 用語分類不整合** target: docs/guides/glossary.md:71 対 :24-25
evidence: 「inspect 系コマンド（inspect-docs / inspect-skills / inspect-promote）」が同ファイル内の「内部 workflow」定義（L24-25）と command-selection.md:70 と不整合。inspect-skills は Capability Skill で inspect 系ワークフロー連鎖にも含まれない。
severity: low / confidence: high / source_of_truth: command-selection.md
recommended_route: 診断修正候補
ng_classification: pre-existing

**DOC-09 / guides「正」表記** target: docs/guides/README.md:70
evidence: 「成果物、状態モデル（状態モデル制約、.agentdev/ の位置づけの正）」。guides 層は規範的権限を持たない（同ファイル L4「基準は各 REQ/Decision/Design ファイルであり」）。基準側所有は DEC-001 / DEC-038 / REQ-008 系。
severity: low / confidence: medium / source_of_truth: guides 層の優先順位
recommended_route: 診断修正候補
ng_classification: pre-existing

**DOC-10 / authoring 所有者記述乖離** target: docs/README.md:254 対 docs/designs/README.md:237
evidence: docs/README.md「執筆規約は品質仕様が所有する」対 designs/README.md「quality-specs.md・agentdev-skill-authoring/agentdev-command-authoring の各 Design が所有する」。正本（designs/README.md）との乖離。両者に日付スナップショット散文があり陳腐化しやすい形式。
severity: low / confidence: high / source_of_truth: docs/designs/README.md
recommended_route: 診断修正候補（DOC-01 と同時）
ng_classification: pre-existing
