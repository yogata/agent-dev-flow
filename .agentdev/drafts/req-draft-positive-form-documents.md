---
draft_type: req_draft
topic: positive-form-documents
status: saved
created_at: 2026-06-17
---

## draft-meta

- work_type: feature
- req-operation: APPEND
- target-req: REQ-0101
- adr-required: false
- adr-judgment: ADR不要。肯定文記述原則は文書品質基準の拡張であり（REQ-0101-040〜063 と同系列）、アーキテクチャ意思決定ではない。REQ-0101 の関心対象（REQ/ADR/SPEC/guides の基準境界）に含まれる。
- topic-slug: positive-form-documents
- scale: standard
- status: saved

## 目的

REQ/ADR/SPEC の主たる文意は肯定文で記述し、否定文は肯定文で表現された主たる文意に対する境界条件・例外・補足に限定する。これにより、要件・判断・仕様が「満たすべき状態」として読手に直接伝わり、否定形の羅列による解釈負荷・翻訳負荷を低減する。

## 要件

| ID | 要件 |
|---|---|
| REQ-0101-064 | REQ/ADR/SPEC の各要件行・Decision 本文・SPEC Rule は、主たる文意を肯定文で記述すること。主たる文意とは、当該記述が単独で表現する「満たすべき状態・振る舞い・制約」を指す |
| REQ-0101-065 | 否定文（「〜しない」「〜を禁止する」「〜を含めない」「〜てはならない」等）は、肯定文で記述された主たる文意に対する境界条件・例外・補足として併記する場合に限り使用すること。主たる文意を否定文のみで定義することを避けること |
| REQ-0101-066 | 既存の REQ/ADR/SPEC 記述で主たる文意が否定文のみで構成されているものは、対応する肯定文へ書き換えること。書き換え後も境界条件として否定表現を併記することは妨げない |

## 適用範囲

- **対象**: REQ/ADR/SPEC の要件行・Decision・Rule の主たる文意の記述形式、肯定文と否定文の使い分け基準、境界条件としての否定文の許容範囲、既存否定文要件の肯定文への書き換え方針、未定義・非採用パラメータを否定する記述の排除、Guide 内の REQ/ADR/SPEC 相当の規範文の肯定形化（P2・低優先）
- **対象外**: 個別ファイルの具体的な書き換え実施（case / Issue / 受け入れ条件で扱う）、Guide の navigation 記述全般（案内・導線・手順は navigation 層のため肯定形化対象外、ただし REQ/ADR/SPEC 相当の規範文は対象）、mapping-table.md の履歴判定表（履歴文書のため許容度高）、integrity rule catalog の検出ルール記述のうち検出対象文字列（検出対象の逸脱を記述する性質上、否定文が適切。ただし rule description は肯定形へ寄せる）、コードコメント・コミットメッセージ・Issue/PR 本文の記述形式

## Requirement Source

- ユーザー指示（2026-06-17 セッション）: 「REQファイルは明確な要件だけを定義すべきである。否定による要件ではなく、肯定による要件とすべきである。これは要件だけではなく、ADRやSPECによる記述も同様である」
- ユーザー確認結果（2026-06-17 セッション）: docs/ 配下70ファイル（REQ 25・ADR 14・SPEC 15・Guide/Index 16）の追加精査。P0/P1/P2 優先度付き修正判定マトリクス・直接修正すべき中核箇所・REQ-0103-136 修正文案・REQ-0107-044 衝突指摘・Guide scope P2 追加・ADR Decision修正指摘・SPEC追加調査発見を提供

## 否定文要件 調査結果（Findings Catalog）

### 分類基準

| 分類 | 意味 | 対応 |
|---|---|---|
| **CLEAR-VIOLATION** | 主たる文意が否定文のみで構成されている。要件の主題が「〜しない」である | 肯定文へ書き換え |
| **MIXED** | 肯定文の主たる文意 + 同等の強度で併記された否定禁止。1文に肯定・否定が混在 | 肯定文を主とし、否定を境界条件へ格下げ |
| **ACCEPTABLE-BOUNDARY** | 主たる文意は肯定文。否定文は境界条件・例外・補足として使用 | 修正不要 |

### サマリー統計

| 文書種別 | 対象ファイル数 | 修正対象（P0/P1） | 境界条件（許容） | 備考 |
|---|---|---|---|---|
| REQ (0101〜0107) | 7 | 約65件 | 約21件 | REQ-0103 が最多（約30件 P0） |
| REQ (0108〜0133) | 18 | 約110件 | 約40件 | REQ-0108・0112・0114・0124 に集中 |
| ADR (0101〜0114) | 14 | 11ファイル（Decision 本文） | 3ファイル（Consequences・代替案） | 「修正不要」から「Decision肯定化（P1）」へ更新。全14ファイル中11ファイルにDecision修正あり |
| SPEC (15ファイル) | 15 | 13ファイル | 2ファイル | system.md・workflow-contracts.md・artifact-contracts.md がP0/P1、残り10ファイルも追加調査で否定文候補発見 |
| Guide/Index (16ファイル) | 16 | 4ファイル（高規範密度・P2） | 12ファイル | artifacts-and-state・project-docs-and-specs・req-case-flow・intake-learning-backlog-flow が主対象 |
| **合計** | **70** | **約185件+11ADR+13SPEC+4Guide** | **約123件+3ADR+2SPEC+12Guide** | — |

### REQ findings（0101〜0107）

#### REQ-0101.md（11件）

| REQ-ID | 分類 | 否定表現 | 現状（抜粋） | 修正方向 |
|---|---|---|---|---|
| REQ-0101-002 | CLEAR-VIOLATION | 使用しないこと | retired REQ は…に配置し、現行要件判断に使用しないこと | 「履歴参照のみに限定すること」へ |
| REQ-0101-003 | CLEAR-VIOLATION | 再利用しないこと | REQ ID は…再利用しないこと | 「一意性を保持すること」へ |
| REQ-0101-009 | CLEAR-VIOLATION | 代替しないこと | SPEC は…REQ/ADR の判断内容を代替しないこと | 「REQ/ADR を補完すること」へ |
| REQ-0101-010 | CLEAR-VIOLATION | 代替しないこと | DOC-MAP.md は…内容を代替しないこと | 「導線を提供すること」へ |
| REQ-0101-015 | CLEAR-VIOLATION | 含めないこと | .sisyphus/ 配下の成果物は…含めないこと | 「管理対象から除外すること」へ（「除外する」も境界表現だが主語が明確） |
| REQ-0101-018 | CLEAR-VIOLATION | 使用しないこと | 比喩的上下関係を構造名として使用しないこと | 「機能的責務・操作種別・分類体系に基づく構造名を使用すること」へ |
| REQ-0101-020 | MIXED | 含めないこと | root README は…限定し、重複する概念説明やフロー説明を含めないこと | 「概念説明やフロー説明は guide や command README へ委譲すること」へ |
| REQ-0101-021 | CLEAR-VIOLATION | 含まれないこと | 現行要件のように読める旧 REQ 参照…は含まれないこと | 「現行 active REQ 参照・現行 command producer・canonical path 参照のみを含むこと」へ |
| REQ-0101-044 | CLEAR-VIOLATION | 存在しないこと | accepted ADRに…ADRが存在しないこと | 「accepted ADR は『あるべき状態』を意思決定として記述すること（REQ-0101-043 と統合的）」へ |
| REQ-0101-058 | MIXED | 維持しないこと | 独立した分類ポリシーREQを維持しないこと | 「分類ポリシーREQの維持有無を明示的に判断すること」へ |
| REQ-0101-059 | CLEAR-VIOLATION | 保持しないこと | 廃止済み機能・旧構造・検討経緯を現行仕様本文として保持しないこと | 「廃止済み機能・旧構造・検討経緯は履歴管理箇所に配置すること」へ |

#### REQ-0102.md（8件）

| REQ-ID | 分類 | 否定表現 | 現状（抜粋） | 修正方向 |
|---|---|---|---|---|
| REQ-0102-007 | CLEAR-VIOLATION | 扱わないこと | 作業手段を要件行として扱わないこと | 「要件行は変更後に満たすべき振る舞い・制約・状態として記述すること」へ |
| REQ-0102-025 | CLEAR-VIOLATION | 必須としない | 規範語の使用を必須としない | 「規範語の使用を任意とすること」へ |
| REQ-0102-028 | CLEAR-VIOLATION | 除外し | 任意 相当の内容は…除外し | 「許容仕様・設計余地・将来候補として適切な文書に配置すること」へ |
| REQ-0102-029 | CLEAR-VIOLATION | 含まれないこと | 再説明は…要件行に含まれないこと | 「要件行から除外すること」へ（主語明確化） |
| REQ-0102-030 | CLEAR-VIOLATION | 含まれないこと | 言い換えに過ぎない文は…含まれないこと | 同上 |
| REQ-0102-031 | ACCEPTABLE-BOUNDARY | 含まれないこと | 関係説明が判定境界を増やさない場合…含まれないこと | 境界条件として許容（「増やす場合のみ残すこと」への反転も可） |
| REQ-0102-039 | ACCEPTABLE-BOUNDARY | 処理しないこと | 他 OU は処理しないこと | 境界条件として許容。「指定 OU のみを処理対象とすること」へ簡素化も可 |
| REQ-0102-044 | CLEAR-VIOLATION | 編集しない | req-save 自身は docs/specs/ 配下を直接編集しない | 「docs/specs/ 配下の編集はユーザーに促すこと」へ |

#### REQ-0103.md（43件・最多）

主な CLEAR-VIOLATION（抜粋・全件は附録参照）:

| REQ-ID | 分類 | 否定表現 | 現状（抜粋） | 修正方向 |
|---|---|---|---|---|
| REQ-0103-004 | CLEAR-VIOLATION | 所有しないこと | skill は…一次情報として所有しないこと | 「skill は再利用可能な判断基準・共通知識・宣言的ルールを定義すること」へ |
| REQ-0103-005 | CLEAR-VIOLATION | 使用不可とする | 短縮形式は…使用不可とする | 「repo-root-relative 形式を使用すること」へ |
| REQ-0103-021 | MIXED | 保持しないこと | …限定し、詳細な判断表…を直接保持しないこと | 「詳細判断表等は skill reference または script に配置すること」へ |
| REQ-0103-026 | MIXED | 保持しないこと | deprecated command は…保持しないこと | 「詳細処理は後継 command またはスキルに委ねること」へ |
| REQ-0103-056 | ACCEPTABLE-BOUNDARY | 使用してはならない | project-local customizationで…使用してはならない | 境界条件として許容。「別名前を使用すること」へも可 |
| REQ-0103-064 | MIXED | 非推奨とする、含めない | copy-based は非推奨…現在の要件には含めない | 「symlink-based を推奨すること。plugin/npm/package化は将来 option とすること」へ |
| REQ-0103-066 | CLEAR-VIOLATION | 含めないこと | consumer project への配布対象には含めないこと | 「配布対象から除外すること」へ |
| REQ-0103-067 | CLEAR-VIOLATION | 含めないこと | 同上 | 同上 |
| REQ-0103-068 | CLEAR-VIOLATION | 配置しないこと、対象外とすること | repo-local command は…src/opencode/ に配置しないこと | 「repo-local command は .opencode/commands/repo/ に直接配置すること」へ |
| REQ-0103-069 | CLEAR-VIOLATION | 配置しないこと、対象外とすること | 同上（skill 版） | 同上 |
| REQ-0103-070 | CLEAR-VIOLATION | 配置しないこと | 静的 registry を配置しないこと | 「配置対象は reports/baseline/intake/learning/backlog/drafts 等の動的生成物に限定すること」へ |
| REQ-0103-071 | CLEAR-VIOLATION | 含めないこと | 管理対象に含めないこと | 「管理対象から除外すること」へ |
| REQ-0103-072 | ACCEPTABLE-BOUNDARY | clone してはならない | .agentdev/ に clone してはならない | 境界条件として許容 |
| REQ-0103-073 | CLEAR-VIOLATION | 使用しないこと | agent-dev-flow repo 自身では .agentdev-plugin/ を使用しないこと | 「agent-dev-flow repo 自身では .agentdev/ を domain state として使用すること」へ |
| REQ-0103-075 | CLEAR-VIOLATION | 存在せず | root 直下 sync-opencode.ps1 は存在せず | 「scripts/ 配下に配置すること」へ |
| REQ-0103-077 | CLEAR-VIOLATION | しないこと | .agentdev/ を gitignore 対象にしないこと | 「.agentdev/ を git 管理対象とすること」へ |
| REQ-0103-079 | CLEAR-VIOLATION | 含めないこと | REQ-ID・ADR-ID の固定参照を含めないこと | 「consumer project で解決可能な参照のみを含むこと」へ |
| REQ-0103-080 | CLEAR-VIOLATION | 含めないこと | src/opencode/ パス参照を含めないこと | 「runtime 配布物で解決可能な .opencode/ 相対パスを使用すること」へ |
| REQ-0103-081 | CLEAR-VIOLATION | 含めないこと | repo-local command/skill の名称を含めないこと | 「consumer project で解決可能な参照のみを含むこと」へ |
| REQ-0103-090 | CLEAR-VIOLATION | 指定しない | 他 skill の内部 reference path を直接指定しない | 「skill 名と責務名までを記述し、references 読込判断は対象 skill に委ねること」へ |
| REQ-0103-093 | CLEAR-VIOLATION | 参照しないこと | 他 skill 内部の protocol 名…を参照しないこと | 「skill 名レベルの参照にとどめ、内部構造名への依存を回避すること」へ |
| REQ-0103-095 | CLEAR-VIOLATION | 参照しないこと | （093の拡張）参照しないこと | 同上 |
| REQ-0103-096 | CLEAR-VIOLATION | 禁止し、しないこと | 自然言語ラベルだけの参照を禁止し…しないこと | 「参照先が必要な場合は skill 名・SKILL.md・実在 path を明記すること」へ |
| REQ-0103-098 | CLEAR-VIOLATION | 使用しないこと | See Also を…使用しないこと | 「See Also は補助導線に限定し、実行判断の根拠は本文に明記すること」へ |
| REQ-0103-099 | CLEAR-VIOLATION | 代替しないこと、置かず | See Also の関連一覧で代替しないこと…置かず | 「委譲条件は本文に明記し、禁止条件は DO NOT USE FOR に配置すること」へ |
| REQ-0103-102 | CLEAR-VIOLATION | 参照しないこと | skill も…参照しないこと | 同上（099のskill拡張） |
| REQ-0103-105 | CLEAR-VIOLATION | 化せず | Command 固有の…は Skill 化せず | 「Command / Template / 操作用 Skill / Script に配置すること」へ |
| REQ-0103-107 | ACCEPTABLE-BOUNDARY | 行わないこと | それ以外の…を行わないこと | 境界条件として許容（read-only + 許可される side effect の明示） |
| REQ-0103-131 | ACCEPTABLE-BOUNDARY | ないこと | 読んで整合性判定する必要はないこと | 境界条件として許容 |
| REQ-0103-132 | MIXED | 含めないこと | 標準 draft type は1種のみ…含めないこと | 「標準 draft type は req_draft の1種のみとすること」へ（後半の否定は削除） |
| REQ-0103-136 | CLEAR-VIOLATION | 必須化しないこと | producer・consumer・next を必須化しないこと（ユーザー事例） | 「producer・consumer・next は registry 側でのみ定義すること」へ |
| REQ-0103-138 | CLEAR-VIOLATION | 混入させないこと | 未確認事項を要件本文に混入させないこと | 「未確認事項は要件本文から除外すること」へ |
| REQ-0103-139 | CLEAR-VIOLATION | 行わないこと | canonical docs 変更…を行わないこと | 「許可される side effect は…生成のみとすること」へ |
| REQ-0103-144 | CLEAR-VIOLATION | 定義しないこと | 実体コマンドとして定義しないこと | 「予約拡張点として維持すること」へ |
| REQ-0103-145 | CLEAR-VIOLATION | 含めないこと | docs-review / skill-review を含めないこと | 「コマンド体系から docs-review / skill-review を削除済みとすること」へ |
| REQ-0103-151 | CLEAR-VIOLATION | 使用しないこと | review を…使用しないこと | 「inspect を inspect domain state 名として使用すること」へ |

※ REQ-0103-032, 034, 036, 037, 038, 039, 040, 041, 042, 045, 046, 047, 048, 049, 051, 052, 053, 054, 055, 057, 058, 059, 060, 061, 062, 063, 065, 074, 076, 078, 082-089, 091, 092, 094, 097, 100-104, 106, 108-111, 112-115, 120-125, 128-130, 133-135, 137, 140-143, 146-150, 152-153 は肯定文要件または境界条件として許容。

#### REQ-0104.md（14件）

| REQ-ID | 分類 | 否定表現 | 現状（抜粋） | 修正方向 |
|---|---|---|---|---|
| REQ-0104-004 | ACCEPTABLE-BOUNDARY | しない | workflow_route を保存・永続化しない | 境界条件として許容。「派生値として扱うこと」へも可 |
| REQ-0104-009 | ACCEPTABLE-BOUNDARY | 格納しない | workflow_route/branch_type/labels/pattern は格納しない | 境界条件として許容 |
| REQ-0104-013 | CLEAR-VIOLATION | 扱わないこと | .sisyphus/ を…必須成果物として扱わないこと | 「.sisyphus/ を runtime workspace として扱うこと」へ |
| REQ-0104-016 | CLEAR-VIOLATION | 保存しないこと | draft-meta に…保存しないこと | 「draft-meta には派生値・dev メタデータを保存対象外とすること」へ |
| REQ-0104-018 | CLEAR-VIOLATION | しないこと | 配布物を直接改修対象にしないこと | 「配布物を upstream handoff 対象として扱うこと」へ |
| REQ-0104-021 | CLEAR-VIOLATION | 使用しないこと | handoff_target/apply_in_current_project を正式 marker として使用しないこと | 「agentdev_handoff: true を upstream handoff 用 marker として使用すること」へ |
| REQ-0104-022 | CLEAR-VIOLATION | 定義せず | 通常要件docとして定義せず | 「upstream handoff 用 RU 入力として整理すること」へ |
| REQ-0104-025 | CLEAR-VIOLATION | 作成せず | Issue を作成せず停止すること | 「停止して agent-dev-flow repository への手動取り込み対象として報告すること」へ |
| REQ-0104-026 | CLEAR-VIOLATION | 開始せず | 実装を開始せず停止すること | 同上 |
| REQ-0104-027 | CLEAR-VIOLATION | 持たないこと | command 側に長文の重複実装を持たないこと | 「共通方針を references に集約すること」へ |
| REQ-0104-033 | CLEAR-VIOLATION | しないこと | wave単位だけの子Issue構成にはしないこと | 「子Issue構成は OU 単位で作成すること」へ |
| REQ-0104-040 | CLEAR-VIOLATION | 作成しないこと | 独自推論で Epic Issue を作成しないこと | 「execution_groups の提案に基づき Epic Issue を作成すること」へ |
| REQ-0104-041 | CLEAR-VIOLATION | 作成しないこと | 複数 OU であることだけを理由に…作成しないこと | 「execution_groups の検証を経て Epic Issue を作成すること」へ |
| REQ-0104-043 | ACCEPTABLE-BOUNDARY | 記載せず、記載しないこと | 通常 RU には…記載せず…も記載しないこと | 境界条件として許容。「upstream handoff 用 RU のみに記録する optional frontmatter とすること」へも可 |

#### REQ-0105.md（3件）

| REQ-ID | 分類 | 否定表現 | 現状（抜粋） | 修正方向 |
|---|---|---|---|---|
| REQ-0105-014 | CLEAR-VIOLATION | 記録しないこと | RU パスを docs 永続文書に記録しないこと | 「Requirement Source セクションに RU 内容を要約して記録すること」へ |
| REQ-0105-022 | CLEAR-VIOLATION | 化しないこと | 未合意・未整理の内容は session-sourced RU 化しないこと | 「session-sourced RU は整理済み内容に限定すること」へ |
| REQ-0105-045 | CLEAR-VIOLATION | 使用しないこと | docs 永続文書の根拠参照としては使用しないこと | 「docs 永続文書の根拠参照から除外すること」へ |

#### REQ-0106.md（0件）

CLEAR-VIOLATION なし。全要件行が肯定文で記述されている。

#### REQ-0107.md（7件）

| REQ-ID | 分類 | 否定表現 | 現状（抜粋） | 修正方向 |
|---|---|---|---|---|
| REQ-0107-005 | CLEAR-VIOLATION | 避けること | 直接本文指定を避けること | 「--body-file 等のファイル指定を使用すること」へ |
| REQ-0107-009 | CLEAR-VIOLATION | 避けること | 空疎な表現…を避けること | 「自然言語成果物は具体性・検証可能性を満たすこと」へ |
| REQ-0107-013 | CLEAR-VIOLATION | 保持せず | 直接保持せず…参照すること | 「variant ファイルを参照すること」へ |
| REQ-0107-018 | MIXED | 前提にしてはならない、適用しない | 合成を前提にしてはならない…適用しない | 「完了報告variant は最終出力全文を保持すること」へ |
| REQ-0107-019 | CLEAR-VIOLATION | 保持してはならない | 直接保持してはならない | 「variant ファイル経由で参照すること」へ |
| REQ-0107-034 | CLEAR-VIOLATION | 使用してはならない | 通常完了variantを使用してはならない | 「失敗系variant を使用すること」へ |
| REQ-0107-041 | CLEAR-VIOLATION | 保持せず | 完了報告本文を保持せず | 「推論した更新種別に対応する variant ファイルパスと選択条件のみを保持すること」へ |

### REQ findings（0108〜0133）

#### REQ-0108.md（docs-check / Validation / Tests）— 約50件

主な CLEAR-VIOLATION:

| REQ-ID | 否定表現 | 現状（抜粋） | 修正方向 |
|---|---|---|---|
| REQ-0108-007 | しないこと | docs-check は基準文書を直接自動更新しないこと | 「docs-check は read-only とし、基準文書の更新は intake item 経由で行うこと」へ |
| REQ-0108-008 | しないこと | learning item を直接作成しないこと | 「learning 候補として報告のみを行うこと」へ |
| REQ-0108-123 | 禁止すること | workflow status 記述の検出を禁止すること | 「workflow status の記述を検出すること」へ（検出対象の肯定定義） |
| REQ-0108-124 | 禁止検査すること | 追加フィールドが存在することを禁止検査すること | 「許可フィールド（description, agent）のみを許容する検査を行うこと」へ |
| REQ-0108-142 | 禁止する | 「既知の false positive」として無視する運用は禁止する | 「false positive 対応は finding の修正または除外ルールの追加によって行うこと」へ |
| REQ-0108-228 | しないこと | semantic dedup機構を実装しないこと | 「重複排除はエージェントの判断によること」へ |

ACCEPTABLE-BOUNDARY（境界条件として許容）: REQ-0108-013（存在しないファイルの検出）, REQ-0108-015（ID重複検出）, REQ-0108-025, REQ-0108-034, REQ-0108-041, REQ-0108-043, REQ-0108-045, REQ-0108-058, REQ-0108-071, REQ-0108-072, REQ-0108-074, REQ-0108-076, REQ-0108-077, REQ-0108-078, REQ-0108-079, REQ-0108-085, REQ-0108-088, REQ-0108-103, REQ-0108-106, REQ-0108-114, REQ-0108-116, REQ-0108-117, REQ-0108-119, REQ-0108-120, REQ-0108-131, REQ-0108-138, REQ-0108-139, REQ-0108-155, REQ-0108-159, REQ-0108-160, REQ-0108-173, REQ-0108-198, REQ-0108-199, REQ-0108-200, REQ-0108-206, REQ-0108-216, REQ-0108-219, REQ-0108-222, REQ-0108-223, REQ-0108-224, REQ-0108-225, REQ-0108-226, REQ-0108-227, REQ-0108-229, REQ-0108-233, REQ-0108-235, REQ-0108-236, REQ-0108-238, REQ-0108-243, REQ-0108-244, REQ-0108-245, REQ-0108-247, REQ-0108-248, REQ-0108-253, REQ-0108-254 — これらは「検出対象・対象外・read-only 境界」の記述であり、検査仕様の性質上否定文が適切。

#### REQ-0109.md（inspect-docs）— 約8件

| REQ-ID | 分類 | 否定表現 | 現状（抜粋） | 修正方向 |
|---|---|---|---|---|
| REQ-0109-008 | ACCEPTABLE-BOUNDARY | 要求せず | 分割・統合・移動・廃止を要求せず | 境界条件として許容 |
| REQ-0109-013 | CLEAR-VIOLATION | 行わないこと | ファイル変更、Issue作成…を行わないこと | 「診断専用とし、finding 出力のみを行うこと」へ |
| REQ-0109-018 | CLEAR-VIOLATION | 出力しないこと | 移行先一覧…を出力しないこと | 「再構成判断に影響する根拠のみを出力すること」へ |
| REQ-0109-020 | CLEAR-VIOLATION | 行わないこと | accept/reject…を行わないこと | 「分類・昇格は後続コマンド（intake-promote/backlog-review）に委ねること」へ |
| REQ-0109-032 | ACCEPTABLE-BOUNDARY | せず | リンク切れ一覧化を主目的にせず | 境界条件として許容 |
| REQ-0109-033 | ACCEPTABLE-BOUNDARY | 行わないこと | 処理・accept/reject/promote/RU生成は行わないこと | 境界条件として許容（read-only 定義） |

#### REQ-0110.md（Git worktree cleanup）— 1件

| REQ-ID | 分類 | 否定表現 | 現状 | 修正方向 |
|---|---|---|---|---|
| REQ-0110-007 | CLEAR-VIOLATION | 削除してはならないこと | tracked file を削除してはならないこと | 「tracked file を保護し、untracked-only を cleanup 対象とすること」へ |

#### REQ-0112.md（ADR ライフサイクル・文書体系）— 約30件

主な CLEAR-VIOLATION:

| REQ-ID | 否定表現 | 現状（抜粋） | 修正方向 |
|---|---|---|---|
| REQ-0112-001 | 使用しないこと | 旧形式を使用しないこと | 「status + superseded_by 形式を使用すること」へ |
| REQ-0112-002 | 含まないこと | セクションを含まないこと | 「セクション構成を N 件に限定すること」へ |
| REQ-0112-005 | しないこと | 新規判断の追加は行わないこと | 「ADR 差分の最終確認ゲートとして機能すること」へ |
| REQ-0112-006 | 引用しないこと | proposed/superseded/deprecated を引用しないこと | 「accepted status の ADR のみを現行根拠として使用すること」へ |
| REQ-0112-007 | 引用しないこと | RU-ID を根拠参照として引用しないこと | 「docs 永続文書の根拠参照は RU-ID を除外すること」へ |
| REQ-0112-008 | 記録しないこと、保存しない | RU パスを記録しないこと | 「RU パスを docs 永続文書から除外すること」へ |
| REQ-0112-010 | 使用しないこと | ru-sources を使用しないこと | 「ru-sources に代わる永続根拠管理方式を使用すること」へ |
| REQ-0112-012 | 持たない | 他の work_type は scale を持たない | 「scale は feature のみが持つこと」へ |
| REQ-0112-013 | 保存せず | workflow_route を保存せず | 「workflow_route は派生値として都度導出すること」へ |
| REQ-0112-015 | 存在せず | Pattern分類は存在せず | 「work_type + scale + workflow_route の3層分類を使用すること」へ |
| REQ-0112-016 | 依存しないこと | SPEC に固定依存せず | 「runtime command は自己完結すること」へ |
| REQ-0112-017 | 維持しないこと | 200行を超える状態を維持しないこと | 「200行以内を維持すること」へ |
| REQ-0112-019 | 禁止すること | dev メタデータの混入を禁止すること | 「frontmatter は description/agent のみを許容すること」へ |
| REQ-0112-020 | 禁止すること | dev メタデータの frontmatter 記述を禁止すること | 同上 |
| REQ-0112-022 | 持たない | 規範的権限を持たない | 「ガイドは人間向け navigation 層とすること」へ |
| REQ-0112-023 | 持たない | 状態遷移モデルを持たない | 「マイクロフェーズは説明用ラベルとすること」へ |
| REQ-0112-027 | しないこと | workflow status を追加しないこと | 「workflow status は Issue/PR で管理すること」へ |
| REQ-0112-028 | しないこと | intake promoted に route/status を追加しないこと | 「route/status は Issue/PR で管理すること」へ |
| REQ-0112-029 | しないこと | Issue/PR の状態を docs に複製しないこと | 「状態管理は Issue/PR に一元化すること」へ |
| REQ-0112-030 | しないこと | command-map を状態遷移エンジン化しないこと | 「command-map は静的参照表として維持すること」へ |
| REQ-0112-031 | 含まない | 技術判断を含まない | 「ADR-0103 責務境界に適合すること」へ |
| REQ-0112-033 | されないこと | 現行根拠として使用されないこと | 「deprecated ADR は履歴参照のみとすること」へ |
| REQ-0112-045 | ならないこと | accepted ADR の決定内容を意味変更してはならないこと | 「accepted ADR の決定内容は安定して維持すること」へ |
| REQ-0112-051 | 存在せず | 廃止ADRを一次参照源としている箇所は存在せず | 「後継 ADR を参照していること」へ |
| REQ-0112-053 | 引用せず | 非accepted ADR を引用せず | 「常に最新の accepted ADR を一次参照源とすること」へ |
| REQ-0112-059 | しないこと | "on approval" 等を使用しないこと | 「REQ-0108-225 に整合する承認フロー表現を使用すること」へ |

ACCEPTABLE-BOUNDARY: REQ-0112-004（原則として作成しない）, REQ-0112-034（再編集対象外）, REQ-0112-035（矛盾しないこと）, REQ-0112-046（矛盾せず）, REQ-0112-048（引用せず、履歴参照は明示）, REQ-0112-054（除外し、記録すること）

#### REQ-0113.md（Skill References SPEC分離）— 3件

| REQ-ID | 分類 | 否定表現 | 現状 | 修正方向 |
|---|---|---|---|---|
| REQ-0113-002 | CLEAR-VIOLATION | 参照されてはならない | SPEC 記述は…参照されてはならない | 「runtime command/skill は自己完結した依存関係を維持すること」へ |
| REQ-0113-006 | CLEAR-VIOLATION | 保持されないこと | reference ファイルは保持されないこと | 「runtime 配布物は自己完結すること」へ |
| REQ-0113-007 | CLEAR-VIOLATION | 含まず | SPEC への参照を含まず自己完結していること | 「自己完結していること」へ（「含まず」削除） |
| REQ-0113-009 | CLEAR-VIOLATION | 依存しない | 他 skill の references 内部構造に直接依存しない | 「skill 名レベルの参照にとどめること」へ |

#### REQ-0114.md（case-auto）— 約25件

主な CLEAR-VIOLATION（case-auto の責務制限に集中）:

| REQ-ID | 否定表現 | 現状（抜粋） | 修正方向 |
|---|---|---|---|
| REQ-0114-003 | ない場合 | ファイルが存在しない場合 | 「ファイル存在確認を行い、不在時は停止すること」へ（境界は許容） |
| REQ-0114-007 | しないこと | 既存コマンドの手順を再実装しないこと | 「既存コマンドを呼び出すこと」へ |
| REQ-0114-018 | しないこと | 既存コマンドの責務を変更しないこと | 「既存コマンドの責務を維持すること」へ |
| REQ-0114-025 | しないこと | 完了扱いにしないこと | 「停止してエラーを報告すること」へ |
| REQ-0114-026 | しないこと | 削除しないこと | 「RU パターン外ファイルは残置すること」へ |
| REQ-0114-028 | しないこと | 完了扱いにせず停止すること | 同上 |
| REQ-0114-031 | しないこと | 混合した単一成果物にしないこと | 「learning と intake を別々の成果物として扱うこと」へ |
| REQ-0114-033 | しないこと | 完了扱いにしないこと | 「失敗内容を報告して停止すること」へ |
| REQ-0114-036 | ないこと | 独自のIssue階層判定を持たないこと | 「REQ-0104 の OU/execution_groups 規則に従うこと」へ |
| REQ-0114-037 | ないこと | 選別・再判断を行わないこと | 「保存結果をそのまま引き継ぐこと」へ |
| REQ-0114-040 | ないこと | 再確認しないこと | 「合意済み方針に従って処理を進めること」へ |
| REQ-0114-045 | ならない | Wave スケジューリングを実装してはならない | 「Wave スケジューリングは case-run に委ねること」へ |
| REQ-0114-047 | ならない | case-close を試みてはならない | 「正常完了した子Issue のみ case-close 処理を行うこと」へ |
| REQ-0114-048 | ならない | 全体完了を報告してはならない | 「全子Issue処理完了後のみ全体完了とすること」へ |
| REQ-0114-050 | ない | 一括 capture は行わない | 「per-child で独立実行すること」へ |
| REQ-0114-051 | ないこと | 抽出・変換・解釈を行わないこと | 「OU queue の管理・制御のみを担うこと」へ |
| REQ-0114-052 | ないこと | 切り出しは行わない | 「draft path と OU ID のみを渡すこと」へ |
| REQ-0114-054 | ないこと | 再評価しないこと | 「draft を SSoT として扱い、再評価を回避すること」へ |
| REQ-0114-055 | ないこと | Epic Issue 化しないこと | 「依存関係は queue dependency として扱うこと」へ |
| REQ-0114-057 | ないこと | Epic Issue 化の判定に関与しないこと | 「case-open の判定結果に従うこと」へ |
| REQ-0114-058 | ないこと | 独自の OU 状態管理を持たないこと | 「draft を OU 情報の SSoT として扱うこと」へ |
| REQ-0114-066 | ない場合 | ファイルが存在しない場合 | 境界条件として許容 |

ACCEPTABLE-BOUNDARY: REQ-0114-012（自走対象外の列挙）, REQ-0114-013（migration 実行・IaC apply は対象外）, REQ-0114-035（矛盾しないこと）

#### REQ-0119.md（コマンド・スキル・サブエージェント責務分界）— 6件

| REQ-ID | 分類 | 否定表現 | 現状 | 修正方向 |
|---|---|---|---|---|
| REQ-0119-001 | CLEAR-VIOLATION | しないこと | 詳細手順を保持しないこと | 「公開 API・入力・出力・Step 見出し・委譲接続点に限定すること」へ |
| REQ-0119-005 | CLEAR-VIOLATION | 存在しないこと | 小数 Step は存在しないこと | 「トップレベル Step は整数のみとすること」へ |
| REQ-0119-006 | CLEAR-VIOLATION | 使用しないこと | 英字サブステップは使用しないこと | 「サブステップは N-M 形式を使用すること」へ |
| REQ-0119-007 | CLEAR-VIOLATION | 含まないこと | 小数 Step を含まないこと | REQ-0119-005 に統合（肯定文） |
| REQ-0119-008 | CLEAR-VIOLATION | 化せず | サブエージェント化せず | 「親 Step 内に含めること」へ |
| REQ-0119-011 | CLEAR-VIOLATION | 行わないこと | 保存・Issue/PR更新・commit・push・ユーザー確認を行わないこと | 「サブエージェントは判断の入力のみを提供すること」へ |
| REQ-0119-014 | CLEAR-VIOLATION | せず | 保存せず | 「capture 候補として親エージェントへ返すこと」へ |
| REQ-0119-025 | CLEAR-VIOLATION | 存在せず | 条項は現行要件として存在せず | 「retired であること」へ（retired 宣言は肯定文） |

#### REQ-0123.md（workflow-lifecycle 宣言的純化）— 約6件

| REQ-ID | 分類 | 否定表現 | 現状 | 修正方向 |
|---|---|---|---|---|
| REQ-0123-001 | CLEAR-VIOLATION | 払わないこと | case-open 固有の…は扱わないこと | 「GitHub Issue 操作の安全手順に限定すること」へ |
| REQ-0123-012 | CLEAR-VIOLATION | 対象外であること | 配置対象外であること | 「lifecycle 判定の一部として扱うこと」へ |
| REQ-0123-013 | CLEAR-VIOLATION | 存在しないこと | 5つのファイルは存在しないこと | 「5つのファイルを削除済みとすること」へ |
| REQ-0123-014 | CLEAR-VIOLATION | 指定しないこと | reference file path を直接指定しないこと | 「参照は skill 名までとすること」へ |
| REQ-0123-015 | CLEAR-VIOLATION | ないこと | 分割候補として扱わないこと | 「4スキルは各々単一責務境界を持つこと」へ |
| REQ-0123-017 | CLEAR-VIOLATION | 依存しないこと | SPEC に固定依存しないこと | 「runtime command/skill は自己完結すること」へ |
| REQ-0123-019 | CLEAR-VIOLATION | しないこと | 実行判断の根拠として使用しないこと | 「See Also は補助導線に限定すること」へ |

#### REQ-0124.md（inspect-* 検出コマンド群・命名恒久制約）— 約15件

この REQ は「旧名称（diagnostics/docs-review/skill-review）が存在しないこと」を宣言する性質上、否定文が集中。全件 CLEAR-VIOLATION 扱いだが、命名統一の完了状態宣言としては肯定文（「inspect-* を使用すること」）への書き換えが可能。

| REQ-ID | 否定表現 | 現状（抜粋） | 修正方向 |
|---|---|---|---|
| REQ-0124-001 | 含まないこと | docs-review等を含まないこと | 「inspect-docs/skills/promote を使用すること」へ |
| REQ-0124-003 | 存在しないこと | templates/docs-review/ は存在しないこと | 「完了テンプレートは新名称を使用すること」へ |
| REQ-0124-004 | しないこと | 旧パスを使用しないこと | 「.agentdev/inspect/inbox/ を出力先とすること」へ |
| REQ-0124-005 | 含まないこと | skill_review_finding を含まないこと | 「標準 draft type は req_draft の1種のみとすること」へ |
| REQ-0124-007 | 存在しないこと | REQ-0103-106は存在しないこと | 「REQ-0103-142/145 で superseded 済みであること」へ |
| REQ-0124-008 | 存在せず | 継承 clause は存在せず | 「独立したコマンドとして定義されること」へ |
| REQ-0124-011 | 存在しないこと | diagnostics-*.md は存在しないこと | 「コマンドファイル名は inspect-*.md であること」へ |
| REQ-0124-012 | 存在しないこと | .agentdev/diagnostics/ は存在しないこと | 「ドメインディレクトリは .agentdev/inspect/ であること」へ |
| REQ-0124-013 | 存在しないこと | diagnostics finding 文言は存在しないこと | 「finding の文言は inspect finding に統一されていること」へ |
| REQ-0124-014 | 存在しないこと | source_type: diagnostics は存在しないこと | 「source_type: inspect を定義すること」へ |
| REQ-0124-015 | 存在しないこと | diagnostics-*-finding-* は存在しないこと | 「finding file 名規則は inspect-*-finding-* であること」へ |
| REQ-0124-016 | 存在しないこと | agentdev-diagnostics-skills は存在しないこと | 「スキルディレクトリは agentdev-inspect-skills であること」へ |
| REQ-0124-018 | しないこと | inspect に改名しないこと | 「別コマンド・別スキルとして維持すること」へ（スコープ境界） |

#### REQ-0125.md（inspect-skills）— 約3件

| REQ-ID | 分類 | 否定表現 | 現状 | 修正方向 |
|---|---|---|---|---|
| REQ-0125-002 | CLEAR-VIOLATION | 行わない | 診断は修正を行わず | 「診断は read-only とし、推奨 route の提示と finding file 生成に限定すること」へ |
| REQ-0125-005 | CLEAR-VIOLATION | しないこと | Skill 分割の実行を行わないこと | 「Skill 分割候補の提示に限定すること」へ |
| REQ-0125-006 | CLEAR-VIOLATION | しないこと | Command 修正の実行を行わないこと | 同上 |

#### REQ-0126.md（inspect-promote）— 約3件

| REQ-ID | 分類 | 否定表現 | 現状 | 修正方向 |
|---|---|---|---|---|
| REQ-0126-003 | CLEAR-VIOLATION | しないこと | promoted artifact を生成しないこと | 「ユーザーの明示的承認後に promoted artifact を生成すること」へ |
| REQ-0126-007 | CLEAR-VIOLATION | せず | 独立 route とせず | 「promoted artifact の要件化方向または受け入れ条件に含めること」へ |

ACCEPTABLE-BOUNDARY: REQ-0126-002（分類基準の定義、否定表現は境界条件）

#### REQ-0127.md（Intake command群）— 約4件

主な CLEAR-VIOLATION: intake/learning capture の境界定義に否定文。「inbox を直接変更しない」「accept/reject を行わない」等。肯定文（「inbox は読み取り専用とする」「分類は intake-promote に委ねる」等）へ書き換え可能。

#### REQ-0128.md（Learning-promote）— 1件

| REQ-ID | 分類 | 否定表現 | 現状 | 修正方向 |
|---|---|---|---|---|
| REQ-0128-006 | CLEAR-VIOLATION | ならない | AI 単独で promote/prune の最終確定を行ってはならない | 「HITL 確定ステップを経て確定すること」へ |

#### REQ-0129.md（Backlog-review）— 約4件

| REQ-ID | 分類 | 否定表現 | 現状 | 修正方向 |
|---|---|---|---|---|
| REQ-0129-003 | CLEAR-VIOLATION | しないこと | 通常の短期Issue化候補として処理しないこと | 「REQ再構成intake は専用ルートで処理すること」へ |
| REQ-0129-008 | ACCEPTABLE-BOUNDARY | 扱わないこと | promoted artifact path を依存先として扱わないこと | 境界条件として許容 |
| REQ-0129-011 | CLEAR-VIOLATION | 処理せず | 当該RUを処理せず | 「当該RUを保留し理由を提示すること」へ |

#### REQ-0130.md（case-run）— 約3件

| REQ-ID | 分類 | 否定表現 | 現状 | 修正方向 |
|---|---|---|---|---|
| REQ-0130-008 | CLEAR-VIOLATION | ならないこと | inbox を直接変更してはならないこと | 「inbox は読み取り専用とすること」へ |
| REQ-0130-009 | CLEAR-VIOLATION | 禁止する | 中間ファイル経由の引き継ぎは禁止する | 「capture 情報の引き継ぎは PR 本文のみを経由すること」へ |

#### REQ-0131.md（case-close）— 約6件

| REQ-ID | 分類 | 否定表現 | 現状 | 修正方向 |
|---|---|---|---|---|
| REQ-0131-006 | CLEAR-VIOLATION | しないこと | 危険な自動削除を行わないこと | 「削除失敗時は警告して停止すること」へ |
| REQ-0131-007 | CLEAR-VIOLATION | ならないこと | 自動で git checkout -- により変更をリセットしてはならないこと | 「ローカル変更を保持したまま停止すること」へ |
| REQ-0131-012 | ACCEPTABLE-BOUNDARY | しないこと | ロジック自体は変更しないこと | 境界条件として許容 |
| REQ-0131-015 | CLEAR-VIOLATION | 禁止し | --force を禁止し | 「--force-with-lease のみを許可すること」へ |
| REQ-0131-018 | CLEAR-VIOLATION | しないこと | case-run の一時会話コンテキストを使用しないこと | 「capture 情報の入力源は PR 本文のみとすること」へ |
| REQ-0131-019 | CLEAR-VIOLATION | ならないこと | 学びの有無を問うてはならないこと | 「学びの検知はエージェント自律とすること」へ |

#### REQ-0132.md（case-open）— 2件

| REQ-ID | 分類 | 否定表現 | 現状 | 修正方向 |
|---|---|---|---|---|
| REQ-0132-005 | CLEAR-VIOLATION | せず | 完了扱いにせず | 「停止して対象ファイル・HEAD・origin/main を表示すること」へ |
| REQ-0132-006 | CLEAR-VIOLATION | しないこと | intake/learning capture を行わないこと | 「capture は case-close 責務とすること」へ |

#### REQ-0133.md（case-update）— 約4件

| REQ-ID | 分類 | 否定表現 | 現状 | 修正方向 |
|---|---|---|---|---|
| REQ-0133-002 | CLEAR-VIOLATION | しないこと | フェーズを変更しないこと | 「現在のフェーズを維持すること」へ |
| REQ-0133-004 | CLEAR-VIOLATION | 欠落しないこと | 【必須】セクションが欠落しないこと | 「【必須】セクションを維持すること」へ |
| REQ-0133-006 | CLEAR-VIOLATION | 禁止する | gh issue list 等の取得を禁止する | 「番号はユーザー入力またはセッション内会話から取得すること」へ |
| REQ-0133-007 | CLEAR-VIOLATION | ないこと | req-save への委譲を行わないこと | 「直接 commit + push を行うこと」へ |

### ADR findings（0101〜0114）— Decision本文の肯定化（P1）

ADR の Decision は概ね肯定文で記述されているが、複数の ADR で Decision 内に否定文が主文として残っている箇所がある。ADR-0103 が定める「削除・廃止・移行そのものを主題にしない」原則に沿って、Decision を採用判断の肯定記述へ寄せる。

| ADR-ID | 修正箇所 | 否定表現 | 修正方向 |
|---|---|---|---|
| ADR-0101 | 決定6・影響 | 残さず、不可 | canonical namespace 構成の肯定記述へ |
| ADR-0102 | 決定 | 廃止フィールド削除、限定 | frontmatter 許可 field の肯定定義へ |
| ADR-0103 | 決定 | 主題にしない、含めない、混入しない | 文書種別ごとの記述対象を肯定形へ（REQ-0101-043〜045 の基盤） |
| ADR-0104 | 決定 | 直接参照しない、除外 | runtime 自己完結・runtime 参照先を肯定形へ |
| ADR-0105 | 決定 | 廃止しない | `.opencode/` は runtime projection である肯定記述へ |
| ADR-0108 | 決定 | 原則とはしない、行わない | orchestration skill 作成基準を肯定形へ |
| ADR-0110 | 決定 | views 廃止、不採用が主文 | DOC-MAP 採用判断を中心に再構成 |
| ADR-0111 | 決定（superseded） | 標準構造とはしない、採用しないケース | 採用条件中心へ（superseded だが非retired） |
| ADR-0112 | 決定 | 同義ではない、必要としない、行わない、外す | 委譲契約4要素と親責務の肯定記述中心へ |
| ADR-0113 | 決定（deprecated） | 診断名・削除・対象外 | 現行根拠外の履歴補足として整理（deprecated だが非retired） |
| ADR-0114 | 決定 | 更新しない、管理対象外、再実装せず | case-close 責務・opaque external artifact・QG継承を肯定形へ |

**許容箇所（修正不要）**: ADR-0106（Consequences「no longer receive」は影響記述として許容）、ADR-0107（代替案の否定は採否理由として許容）、ADR-0109（影響欄の「変更しない」は軽微）、ADR-0101〜0114 の Status View / Related REQ / Decision Map（分類表・関係表として否定文は許容）、ADR README の「対応REQなし」（補足として許容）。

**ADR修正方針**: ADR Decision 本文の否定表現を肯定形へ書き換える。ただし ADR-0106/0107/0109 は軽微または修正不要。superseded/deprecated ADR（ADR-0111/0113）は現行根拠ではないが、非retired であるため履歴補足の範囲で整理する。

### SPEC findings — 12件 CLEAR-VIOLATION + 24件超 ACCEPTABLE-BOUNDARY

#### system.md（4件 CLEAR-VIOLATION）

| セクション | 否定表現 | 現状（抜粋） | 修正方向 |
|---|---|---|---|
| 禁止事項 | 禁止する | 汎用 TypeScript 検証プロジェクトの配置を禁止する | 「許可される配置: skill 同梱スクリプトは <skill>/scripts/、横断的検査スクリプトは repo-agentdev-integrity/scripts/」へ |
| learning パイプライン | 直接反映禁止 | learning-promote…直接反映禁止 | 「promoted artifact は backlog-review 経由で RU 化すること」へ |
| スクリプト配置方針 | 禁止 | .opencode/src/ 等の配置…禁止 | 「配置ルール: <skill>/scripts/ または repo-agentdev-integrity/scripts/」へ |
| テスト・Package Manifest 配布方針 | 禁止する | 分散配置を禁止する | 「runtime に必要な manifest のみ配布する」へ |

#### document-model.md（1件 CLEAR-VIOLATION + 5件 ACCEPTABLE-BOUNDARY）

| セクション | 分類 | 否定表現 | 現状 | 修正方向 |
|---|---|---|---|---|
| workflow status 管理 | CLEAR-VIOLATION | 記述してはならない、含めない | workflow status を記述してはならない | 「workflow status は Issue ラベル・GitHub Project で管理すること」へ（見出しも「禁止」→「管理」へ） |
| 責務境界原則（置かないもの） | ACCEPTABLE-BOUNDARY | 置かないもの | 「置くもの」リスト後の境界明示 | 修正不要 |
| 他5件 | ACCEPTABLE-BOUNDARY | 含めない、対象外 | 境界条件 | 修正不要 |

#### workflow-contracts.md（4件 CLEAR-VIOLATION + 5件超 ACCEPTABLE-BOUNDARY）

| セクション | 分類 | 否定表現 | 現状 | 修正方向 |
|---|---|---|---|---|
| マイクロフェーズ注意 | CLEAR-VIOLATION | 禁止されている | 記述することは禁止されている | 「実際の状態管理は Issue ラベル・GitHub Project で行うこと」へ |
| workflow status 管理 | CLEAR-VIOLATION | 記述してはならない | 記述してはならない | 「workflow status は workflow-contracts.md で定義すること」へ（見出し修正含む） |
| Wave解析プロトコル | CLEAR-VIOLATION | 実行してはならない | 前提Waveより前に後続Waveを実行してはならない | 「前提Wave完了後に後続Waveを実行すること」へ |
| Backlog Draft Protocol | CLEAR-VIOLATION | promote対象外 | backlog-reviewへのpromote対象外 | 「req-define の明示入力として使用すること」へ |
| Finding の位置づけ | CLEAR-VIOLATION | ではなく | REQ ファイルへの保存操作ではなく | 「要件体系の再構成候補を保持する中間アーティファクトであること」へ |
| Promoted Artifact | ACCEPTABLE-BOUNDARY | 行わない | サブディレクトリへのルーティングは行わない | 境界条件（フラット構造の肯定定義後）として許容 |
| Finding 種別 | ACCEPTABLE-BOUNDARY | — | 種別表の記述 | 修正不要 |

#### artifact-contracts.md（3件 CLEAR-VIOLATION + 1件 ACCEPTABLE-BOUNDARY）

| セクション | 分類 | 否定表現 | 現状 | 修正方向 |
|---|---|---|---|---|
| Skill Structure Contract | CLEAR-VIOLATION | obsolete 扱い、含めない | reference/（単数形）は obsolete 扱い | 「references/（複数形）が canonical であること」へ |
| 汎用締め文 | CLEAR-VIOLATION | 禁止する | 汎用締め文を禁止する | 「完了報告には明示的な完了宣言を含めること」へ（見出しも「禁止」→「取り扱い」へ） |
| 完了報告後の追加出力 | CLEAR-VIOLATION | 出力してはならない | 追加のテキストを出力してはならない | 「完了報告がコマンドの最終出力であること」へ（見出し修正含む） |
| 置かないものリスト | ACCEPTABLE-BOUNDARY | 置かないもの | Command/Skill のスコープ境界明示 | 修正不要 |

#### integrity-rule-catalog.md（13件・全件 ACCEPTABLE-BOUNDARY）

integrity rule catalog は「検出対象（NG となる状態）」をカタログ化する性質上、否定文が適切。各ルールは「X が存在すること」「X への参照が残存していないこと」形式で、検出仕様として妥当。修正不要。

#### その他 SPEC — 追加調査発見（8ファイル）

初回走査で「候補なし」と判定されたファイルのうち、追加精査で否定文候補が発見されたファイル:

| ファイル | 主な否定表現 | 分類 | 修正方向 |
|---|---|---|---|
| docs/specs/patterns.md | 含めない、持たない | CLEAR-VIOLATION（frontmatter許可field・REQ行） | 「許可 field は…」「記述対象は…」の肯定形へ |
| docs/specs/design-principles.md | REQ作成不要、ロジックを持たせず、含まない、原則とはしない、置かないもの | MIXED | 肯定記述中心へ再構成。「置かないもの」は境界表として許容 |
| docs/specs/quality-specs.md | QGの責務ではなく、廃止した、200行超禁止 | CLEAR-VIOLATION | 品質責務を肯定形へ。「200行以内」へ |
| docs/specs/quality-gates.md | repo-internal、runtime非依存、自動修正禁止 | MIXED | Gate 責務を「検出・分類・提示」の肯定形へ。禁止は境界条件へ |
| docs/specs/integrity-contracts.md | 完了はブロックしない、破壊的変更禁止、Forbidden列 | ACCEPTABLE-BOUNDARY | 境界表（Allowed Changes Profile）として許容。ただし許可範囲中心へ寄せる |
| docs/specs/runtime-package-boundary.md | prescribeしない、含まない、使用しない、非推奨、未対応、同期影響を受けない | MIXED | repo type ごとの許可構成を肯定形へ。「非推奨」は代替案の肯定記述へ |
| docs/specs/artifact-responsibilities.md | 禁止される責務 | ACCEPTABLE-BOUNDARY | 親/サブエージェント責務表の境界列として許容。「保持する責務」「返却する成果」中心へ |
| docs/specs/rule-ownership.md | 禁止、ではない、含まない | ACCEPTABLE-BOUNDARY | rule domain 名は残せる。補足は肯定形へ |

#### 候補なし SPEC（2ファイル）

req-impact-map.md（「No Direct Impact」は分類見出しとして許容）、README.md（修正不要に近い）。

### Guide / Index findings（P2・低優先）

Guide は navigation 層（REQ-0101-014, 027）であり、肯定文原則の適用優先度は低い。ただし、Guide 内に REQ/ADR/SPEC 相当の規範文が含まれる場合、それらは修正対象（P2）。

| ファイル | 規範密度 | 主な否定表現 | 修正方向 |
|---|---|---|---|
| docs/guides/artifacts-and-state.md | 高 | 使用しない、代替しない、記述しない、状態管理モデルではない、追加しない | REQ/SPEC 参照へ薄める |
| docs/guides/project-docs-and-specs.md | 高 | 代替することはない、使用しない、意味変更してはならない、逆参照は不可、規範的権限を持たず | REQ/SPEC 参照へ薄める |
| docs/guides/req-case-flow.md | 高 | 扱わない、更新しない、置き換えるものではない、自走対象外・停止条件 | SPEC/REQ 参照へ |
| docs/guides/intake-learning-backlog-flow.md | 高 | 持たない、保存しない、削除せず、状態モデルを持たない、記録しない | SPEC/REQ 参照へ |
| docs/guides/consumer-project-setup.md | 中 | 使用しない、禁止事項、配布されない、非推奨、含めない | Reserved Names は肯定形へ。導入手順の一部は許容 |
| docs/guides/glossary.md | 中 | 使用しない、非推奨・廃止済み、状態管理モデルではない | 用語定義としては許容。旧称説明は履歴注記へ |
| docs/README.md | 低 | retired 説明が長い | 索引として許容。「履歴参照に限定」は境界補足へ |
| docs/requirements/README.md | 低 | 現行判断に使わない、含めない | 索引補足として許容だが肯定形へ寄せる余地あり |
| docs/guides/README.md | 低 | 規範的権限を持たない、代替しない、重複して記述しない | Guide 位置づけとして許容だが肯定形化余地あり |
| その他 Guide（quickstart, command-selection, diagnostics-and-maintenance, troubleshooting） | 低 | 運用案内レベルの否定表現 | 運用案内として許容。低優先 |

**修正方針**: 規範密度が高い4 Guide（artifacts-and-state, project-docs-and-specs, req-case-flow, intake-learning-backlog-flow）は、REQ/SPEC への参照へ薄める対象。その他は低優先・運用案内として許容。mapping-table.md は履歴判定表のため許容度高（現行要件ではない）。

## 直接修正すべき中核箇所（P0）

| ファイル | 箇所 | 判定 |
|---|---|---|
| docs/requirements/REQ-0103.md | REQ-0103-131, REQ-0103-136 | P0。producer/consumer/next 否定。肯定形の draft registry 契約へ修正 |
| docs/specs/artifact-contracts.md | Draft Artifact Contract | P0。REQ-0103 と同型。registry 定義と draft frontmatter を肯定形へ修正 |
| docs/requirements/REQ-0101.md | 文書責務・ADR主題境界・retired参照境界 | P0。文書全体の肯定文原則を追加する主対象（REQ-0101-064〜066 のホスト） |
| docs/requirements/REQ-0102.md | 要件行品質 | P0。REQ行の肯定形ルールを追加する主対象 |
| docs/requirements/REQ-0107.md | REQ-0107-044 | P0。禁止・停止条件・完了不可条件を自然文で保持する方針が今回方針と衝突。境界条件表現へ修正 |
| docs/requirements/REQ-0108.md | docs-check rule | P0。否定主文検出・未定義パラメータ否定検出・旧構造否定主文検出を docs-check 検出観点へ追加 |
| docs/specs/document-model.md | Responsibility Matrix / Content Boundary Rules | P1。既存の「記述しないもの」列は境界表として許容。主文は「記述するもの」中心へ再構成 |
| docs/specs/integrity-rule-catalog.md | IR-032 / IR-033 等 | P1。検出ルール本文（rule description）は肯定形へ。検出対象文字列は残す |

### REQ-0103-136 修正文案（具体例）

現行:
```md
| REQ-0103-136 | draft file の frontmatter に producer・consumer・next を必須化しないこと。これらは draft_type から導出可能であり、registry との不整合を避けるため registry 側でのみ定義すること |
```

修正案:
```md
| REQ-0103-136 | draft file の frontmatter は draft_type・topic・status・created_at を基本フィールドとし、draft type registry が draft_type ごとの producer・allowed consumers・lifecycle を定義すること。各 command は入力 draft の draft_type と registry 上の allowed consumers を照合して受理可否を判定すること |
```

`docs/specs/artifact-contracts.md` の Draft Artifact Contract も同様に修正する。現行の「producer/allowed consumers は個別 draft file の frontmatter ではなく registry 側でのみ定義する」「producer・consumer・next を必須化しない」「frontmatter から読んで整合性判定する必要はない」を、registry が定義する内容・command が照合する内容の肯定記述へ書き換える。

### docs-check 検出観点の追加（P0・関連要件）

本原則の運用を担保するため、docs-check（REQ-0108）に以下の検出観点を追加することを関連ドキュメント更新候補とする:
- 否定主文検出: REQ/ADR/SPEC の要件行・Decision本文・Rule の主たる文意が否定文のみで構成されている場合の warning 検出
- 未定義パラメータ否定検出: 文脈に存在しないパラメータを否定する記述の warning 検出
- 旧構造否定主文検出: 旧名称・旧構造の不存在宣言が主文となっている場合の warning 検出

これらは REQ-0108 への APPEND または integrity-rule-catalog.md への IR 追加として実施する。

## 修正観点

### 優先度付き修正判定マトリクス

| 優先度 | 観点 | 修正判定 |
|---|---|---|
| **P0** | 未定義・非採用パラメータの否定 | 必須修正。文脈に存在しない要件・未採用パラメータを否定する記述（例: 「producer/consumer/next を必須化しない」）は、対応する肯定形契約へ書き換える |
| **P0** | 主文否定 | 必須修正。REQ/ADR/SPEC の本文主意は肯定形にする |
| **P0** | REQ要件行の否定要件 | 必須修正。REQ は「満たすべき状態・振る舞い・制約」を書く。REQ-0102 自体もこの原則を持つ（REQ-0102-007 等） |
| **P1** | ADR決定本文の否定 | 修正対象。ADR は採用判断を肯定形で書く。削除・廃止・移行そのものを主題にしない原則は既に ADR-0103 にある |
| **P1** | SPEC仕様本文の否定 | 修正対象。SPEC は現在仕様・契約を肯定形で書く |
| **P1** | read-only / 対象外 / 禁止 | 境界条件としては許容。ただし主文は「許可される入力・出力・副作用」にする |
| **P2** | 代替案・採否理由・履歴補足の否定 | 原則許容。ただし現行基準と読める表現は修正 |
| **P2** | Guide の否定 | Guide は navigation 層なので低優先。ただし REQ/ADR/SPEC 相当の規範文は削る。Guide は基準を代替しない文書である（REQ-0101-014, 027） |

### 観点1: 未定義・非採用パラメータの否定（P0・最重要）

文脈に存在しない要件や未採用のパラメータを否定する記述は、読手に「何を使うべきか」を伝えない。対応する肯定形契約へ書き換える。

**典型例**（ユーザー提示）:
- 現行: 「draft file の frontmatter に producer・consumer・next を必須化しないこと」
- 修正: 「draft file の frontmatter は draft_type・topic・status・created_at を基本フィールドとし、draft type registry が draft_type ごとの producer・allowed consumers・lifecycle を定義すること」

未定義パラメータの否定は「何をしないか」しか伝えず、「何をするか」が不明確。肯定形契約（registry 定義・基本フィールド定義）により、読手は正しい使い方を直接把握できる。

### 観点2: 主たる文意の肯定文化（P0）

要件行・Decision・Rule の主たる文意（単独で「満たすべき状態」を表現する部分）を肯定文で記述する。否定文のみで主題を定義している場合、対応する肯定文を特定して書き換える。

**書き換えパターン**:
- 「X をしないこと」→「Y をすること」（Y は X の肯定対偶・代替動作）
- 「X を含めないこと」→「Y のみを含むこと」または「X を対象外とすること」（主語明確化）
- 「X を使用してはならない」→「Y を使用すること」
- 「X は存在しないこと」→「Y を使用すること」または「X を削除済みとすること」

### 観点3: 境界条件としての否定文の適正利用（P1）

肯定文で記述された主たる文意に対する境界条件・例外・補足として、否定文を使用することは許容する。ただし、否定文が主たる文意と同等の強度で併記されている場合（MIXED）、否定文を従属的な境界条件へ格下げする。

**許容例**:
- 「docs-check は read-only とし、基準文書を直接更新しない（境界条件）」
- 「runtime command は自己完結し、docs/specs/ に固定依存しない（境界条件）」
- 「promoted artifact は backlog-review 経由で RU 化し、直接反映しない（境界条件）」

### 観点4: REQ-0107-044 との整合（P0・既存方針衝突の解消）

REQ-0107-044 は「禁止・停止条件・完了不可条件は、規範語ではなく自然文で保持する」と定める。この方針は否定表現（「禁止」「停止する」「完了扱いにしない」）の使用を許容するものであり、本原則（REQ-0101-064〜066）と衝突する。

**解消方針**: REQ-0107-044 を以下のように境界条件表現へ修正する:
- 禁止・停止条件・完了不可条件は、肯定文で記述された主たる文意に対する境界条件として自然文で保持する
- 主たる文意を否定文のみで定義することは避ける（REQ-0101-064 準拠）

これにより、「規範語ではなく自然文」という REQ-0107-044 の意図（RFC2119 廃止）を維持しつつ、肯定文原則との整合を図る。

### 観点5: 検出仕様・read-only 定義の特別扱い（P1）

integrity rule catalog（docs/specs/integrity-rule-catalog.md）や docs-check 検出対象（REQ-0108）等、検出仕様を記述する性質の文書では、「NG となる状態」を否定文で記述することが検出仕様として適切。ただし、rule description（ルールの説明文）は肯定形へ寄せる。検出対象文字列（パターンマッチ対象）は否定文のまま保持する。

### 観点6: 命名統一完了宣言の肯定文化（P1）

REQ-0124（inspect-* 命名統一）等、旧名称の不存在を宣言する要件は、新名称の使用を肯定文で宣言する形式へ書き換える。「diagnostics-* は存在しないこと」→「inspect-* を使用すること」。

### 観点7: 責務制限の肯定文での表現（P1）

case-auto（REQ-0114）・サブエージェント（REQ-0119）等の責務制限は、「〜を行わないこと」の羅列ではなく、「〜のみを担うこと」「〜に委ねること」等の肯定文で表現する。複数の「〜しないこと」が連続する場合、1つの肯定文（「責務は X に限定する」）へ集約する。

### 観点8: Guide 内規範文の肯定形化（P2・低優先）

Guide は navigation 層（REQ-0101-014, 027）であり、肯定文原則の適用優先度は低い。ただし、Guide 内に REQ/ADR/SPEC 相当の規範文（「〜を使用しない」「〜を代替しない」等）が含まれる場合、それらは REQ/ADR/SPEC への参照へ薄めるか、肯定形へ寄せる。特に `docs/guides/artifacts-and-state.md`、`docs/guides/project-docs-and-specs.md`、`docs/guides/req-case-flow.md`、`docs/guides/intake-learning-backlog-flow.md` は規範密度が高く、SPEC/REQ 参照へ寄せる対象。

## 関連ドキュメント更新候補

以下のファイルに対し、肯定文原則（REQ-0101-064〜066）の適用による書き換えを実施する。各ファイルの修正箇所は上記 Findings Catalog の CLEAR-VIOLATION 行を参照。

### REQ ファイル（要書き換え・優先度順）

| ファイル | CLEAR-VIOLATION数 | 修正優先度 | 備考 |
|---|---|---|---|
| docs/requirements/REQ-0103.md | 約30 | 高 | 最多。配布境界・Skill参照境界・draft registry 関連 |
| docs/requirements/REQ-0112.md | 約20 | 高 | ADR lifecycle・文書体系基盤 |
| docs/requirements/REQ-0114.md | 約20 | 高 | case-auto 責務制限 |
| docs/requirements/REQ-0108.md | 約6 | 高 | docs-check 中核制約（検出仕様を除く） |
| docs/requirements/REQ-0124.md | 約13 | 高 | inspect 命名統一（肯定文への書き換えが容易） |
| docs/requirements/REQ-0101.md | 約8 | 高 | 本原則のホストREQ自体にも否定文（REQ-0101-064〜066 適用） |
| docs/requirements/REQ-0104.md | 約10 | 中 | workflow protocol・upstream handoff |
| docs/requirements/REQ-0119.md | 約7 | 中 | command/skill/sub-agent 責務分界 |
| docs/requirements/REQ-0102.md | 約6 | 中 | 要件定義・保存 |
| docs/requirements/REQ-0123.md | 約6 | 中 | workflow-lifecycle 宣言的純化 |
| docs/requirements/REQ-0107.md | 約6 | 中 | reporting/writing quality |
| docs/requirements/REQ-0131.md | 約5 | 中 | case-close 安全制約 |
| docs/requirements/REQ-0133.md | 約4 | 低 | case-update |
| docs/requirements/REQ-0105.md | 3 | 低 | RU lifecycle |
| docs/requirements/REQ-0109.md | 3 | 低 | inspect-docs |
| docs/requirements/REQ-0113.md | 4 | 低 | Skill References SPEC分離 |
| docs/requirements/REQ-0125.md | 3 | 低 | inspect-skills |
| docs/requirements/REQ-0126.md | 2 | 低 | inspect-promote |
| docs/requirements/REQ-0129.md | 2 | 低 | backlog-review |
| docs/requirements/REQ-0130.md | 2 | 低 | case-run |
| docs/requirements/REQ-0132.md | 2 | 低 | case-open |
| docs/requirements/REQ-0127.md | 約4 | 低 | intake command群 |
| docs/requirements/REQ-0128.md | 1 | 低 | learning-promote |
| docs/requirements/REQ-0110.md | 1 | 低 | git worktree cleanup |

### SPEC ファイル（要書き換え）

| ファイル | CLEAR-VIOLATION | 修正内容 |
|---|---|---|
| docs/specs/system.md | 4 | 禁止事項セクション→許可配置ルールへ、直接反映禁止→backlog-review経由の肯定記述へ、スクリプト配置・テスト配布の肯定形化 |
| docs/specs/workflow-contracts.md | 4 | workflow status 見出し修正、Wave実行順序の肯定記述、Finding定義の肯定記述、Backlog Draft Protocol の肯定形 |
| docs/specs/artifact-contracts.md | 3+ | Skill Structure Contract、汎用締め文、追加出力の各セクション見出し・本文修正。**Draft Artifact Contract は P0**（REQ-0103-136 と同期） |
| docs/specs/document-model.md | 1 | workflow status セクション見出し・本文修正。「記述するもの」中心へ再構成 |
| docs/specs/patterns.md | — | frontmatter 許可 field・REQ行の肯定形化 |
| docs/specs/design-principles.md | — | 肯定記述中心へ再構成 |
| docs/specs/quality-specs.md | — | 品質責務を肯定形へ。「200行以内」へ |
| docs/specs/quality-gates.md | — | Gate 責務を「検出・分類・提示」の肯定形へ |
| docs/specs/integrity-rule-catalog.md | — | rule description を肯定形へ（検出対象文字列は残す）。否定主文検出 IR 追加候補 |
| docs/specs/runtime-package-boundary.md | — | repo type ごとの許可構成を肯定形へ |
| docs/specs/integrity-contracts.md | — | Allowed Changes Profile の許可範囲中心へ |
| docs/specs/artifact-responsibilities.md | — | 「保持する責務」「返却する成果」中心へ |
| docs/specs/rule-ownership.md | — | 補足を肯定形へ |

### ADR ファイル（Decision 本文の肯定化・P1）

| ファイル | 修正内容 |
|---|---|
| docs/adr/ADR-0103.md | 決定中の「主題にしない」「含めない」「混入しない」を文書種別記述対象の肯定形へ |
| docs/adr/ADR-0102.md | frontmatter 許可 field を肯定定義へ |
| docs/adr/ADR-0104.md | runtime 自己完結・runtime 参照先を肯定形へ |
| docs/adr/ADR-0105.md | 「.opencode/ は runtime projection」の肯定記述へ |
| docs/adr/ADR-0108.md | orchestration skill 作成基準を肯定形へ |
| docs/adr/ADR-0110.md | DOC-MAP 採用判断を中心へ再構成 |
| docs/adr/ADR-0112.md | 委譲契約4要素と親責務の肯定記述中心へ |
| docs/adr/ADR-0114.md | case-close 責務・opaque external artifact・QG継承を肯定形へ |
| docs/adr/ADR-0101.md | canonical namespace 構成の肯定記述へ（軽微） |
| docs/adr/ADR-0111.md | 採用条件中心へ（superseded・軽微） |
| docs/adr/ADR-0113.md | 履歴補足として整理（deprecated・軽微） |
| docs/adr/ADR-0106.md, 0107.md, 0109.md | 修正不要（Consequences・代替案・影響欄の否定は許容） |

### Guide ファイル（P2・低優先）

規範密度が高い4 Guide（artifacts-and-state.md, project-docs-and-specs.md, req-case-flow.md, intake-learning-backlog-flow.md）は REQ/SPEC 参照へ薄める。その他は低優先・運用案内として許容。

### docs-check 検出観点追加（P0・関連要件）

REQ-0108 への APPEND または integrity-rule-catalog.md への IR 追加として、否定主文検出・未定義パラメータ否定検出・旧構造否定主文検出を追加する。

## operation_units

```yaml
operation_units:
  - ou_id: OU-1
    source_ru: session-directive
    target_req: REQ-0101
    operation: APPEND
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    description: "肯定文記述原則（REQ-0101-064〜066）を REQ-0101 に APPEND する"
    result:
      saved_docs: ["docs/requirements/REQ-0101.md"]
      ou_operation: "APPEND REQ-0101-064, REQ-0101-065, REQ-0101-066"
      target_req: "REQ-0101"
      case_open_input: "REQ-0101 (REQ-0101-064〜066 added)"
  - ou_id: OU-2
    source_ru: session-directive
    target_req: REQ-0101
    operation: UPDATE
    scale: standard
    depends_on: [OU-1]
    recommended_order: 2
    issue_policy: single
    description: "REQ-0101 自身の否定文要件（REQ-0101-002,003,009,010,015,018,021,044,059 等）を肯定文へ書き換える"
    result: {}
  - ou_id: OU-3
    source_ru: session-directive
    target_req: REQ-0103
    operation: UPDATE
    scale: standard
    depends_on: [OU-1]
    recommended_order: 3
    issue_policy: single
    description: "REQ-0103 の約30件の否定文要件を肯定文へ書き換える（配布境界・Skill参照境界・draft registry 関連）"
    result: {}
  - ou_id: OU-4
    source_ru: session-directive
    target_req: REQ-0112
    operation: UPDATE
    scale: standard
    depends_on: [OU-1]
    recommended_order: 4
    issue_policy: single
    description: "REQ-0112 の約20件の否定文要件を肯定文へ書き換える（ADR lifecycle・文書体系基盤）"
    result: {}
  - ou_id: OU-5
    source_ru: session-directive
    target_req: REQ-0114
    operation: UPDATE
    scale: standard
    depends_on: [OU-1]
    recommended_order: 5
    issue_policy: single
    description: "REQ-0114 の約20件の否定文要件を肯定文へ書き換える（case-auto 責務制限）"
    result: {}
  - ou_id: OU-6
    source_ru: session-directive
    target_req: REQ-0108
    operation: UPDATE
    scale: standard
    depends_on: [OU-1]
    recommended_order: 6
    issue_policy: single
    description: "REQ-0108 の約6件の CLEAR-VIOLATION 要件を肯定文へ書き換える（検出仕様の ACCEPTABLE-BOUNDARY は除く）"
    result: {}
  - ou_id: OU-7
    source_ru: session-directive
    target_req: REQ-0124
    operation: UPDATE
    scale: standard
    depends_on: [OU-1]
    recommended_order: 7
    issue_policy: single
    description: "REQ-0124 の約13件の否定文要件を肯定文へ書き換える（命名統一完了宣言の肯定文化）"
    result: {}
  - ou_id: OU-8
    source_ru: session-directive
    target_req: multi-req
    operation: UPDATE
    scale: standard
    depends_on: [OU-1]
    recommended_order: 8
    issue_policy: per-file
    description: "REQ-0102, 0104, 0105, 0107, 0109, 0110, 0113, 0119, 0123, 0125, 0126, 0127, 0128, 0129, 0130, 0131, 0132, 0133 の各 CLEAR-VIOLATION 要件を肯定文へ書き換える"
    result: {}
  - ou_id: OU-9
    source_ru: session-directive
    target_req: SPEC
    operation: UPDATE
    scale: standard
    depends_on: [OU-1]
    recommended_order: 9
    issue_policy: per-file
    description: "SPEC ファイル（system.md, workflow-contracts.md, artifact-contracts.md, document-model.md, patterns.md, design-principles.md, quality-specs.md, quality-gates.md, integrity-rule-catalog.md, runtime-package-boundary.md, integrity-contracts.md, artifact-responsibilities.md, rule-ownership.md）の否定主文を肯定文へ書き換える。artifact-contracts.md Draft Artifact Contract は P0"
    result: {}
  - ou_id: OU-10
    source_ru: session-directive
    target_req: ADR
    operation: UPDATE
    scale: standard
    depends_on: [OU-1]
    recommended_order: 10
    issue_policy: per-file
    description: "ADR ファイル（ADR-0101〜0105, 0108, 0110, 0112, 0114）の Decision 本文の否定表現を肯定形へ書き換える。ADR-0106/0107/0109 は修正不要。ADR-0111/0113 は履歴補足範囲で整理"
    result: {}
  - ou_id: OU-11
    source_ru: session-directive
    target_req: Guide
    operation: UPDATE
    scale: standard
    depends_on: [OU-1]
    recommended_order: 11
    issue_policy: per-file
    description: "規範密度が高い4 Guide（artifacts-and-state.md, project-docs-and-specs.md, req-case-flow.md, intake-learning-backlog-flow.md）の REQ/ADR/SPEC 相当の規範文を REQ/SPEC 参照へ薄める。その他 Guide は低優先"
    result: {}
  - ou_id: OU-12
    source_ru: session-directive
    target_req: REQ-0108
    operation: APPEND
    scale: standard
    depends_on: [OU-1]
    recommended_order: 12
    issue_policy: single
    description: "docs-check に否定主文検出・未定義パラメータ否定検出・旧構造否定主文検出の検出観点を APPEND する（REQ-0108 または integrity-rule-catalog.md の IR 追加）"
    result: {}
```

## execution_groups

```yaml
execution_groups:
  - id: EG-1
    type: standard
    purpose: "肯定文記述原則の確立と REQ-0101 への APPEND"
    included_ou: [OU-1]
    rationale: "原則確立が全書き換え作業の前提。単独 Issue で実施"
  - id: EG-2
    type: standard
    purpose: "P0中核箇所の修正（REQ-0103-136 / artifact-contracts.md Draft Artifact Contract / REQ-0107-044 衝突解消）"
    included_ou: [OU-3]
    rationale: "未定義パラメータ否定の是正と既存方針衝突の解消が最優先"
  - id: EG-3
    type: standard
    purpose: "REQ ファイル群の否定文要件の肯定文書き換え（高優先度 REQ）"
    included_ou: [OU-2, OU-4, OU-5, OU-6, OU-7]
    rationale: "REQ-0101（ホスト自身）、REQ-0112、REQ-0114、REQ-0108、REQ-0124 の5ファイル。各ファイルを個別 Issue として処理"
  - id: EG-4
    type: standard
    purpose: "REQ ファイル群の否定文要件の肯定文書き換え（中低優先度 REQ）"
    included_ou: [OU-8]
    rationale: "残り18 REQ ファイル。ファイル単位で Issue を分割"
  - id: EG-5
    type: standard
    purpose: "SPEC ファイルの否定主文の肯定文書き換え"
    included_ou: [OU-9]
    rationale: "13 SPEC ファイル。ファイル単位で Issue を分割"
  - id: EG-6
    type: standard
    purpose: "ADR Decision 本文の肯定化"
    included_ou: [OU-10]
    rationale: "9 ADR ファイル。ファイル単位で Issue を分割"
  - id: EG-7
    type: standard
    purpose: "Guide 規範文の肯定形化（P2・低優先）と docs-check 検出観点追加"
    included_ou: [OU-11, OU-12]
    rationale: "Guide は低優先。docs-check 検出観点追加は原則運用の担保"
```
