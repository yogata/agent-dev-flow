# inspect promoted 20260925T120034Z

> 本ファイルは inspect-promote（2026-09-25 実施、--auto なし）の promote 採用済み成果物である。元 finding: `.agentdev/inspect/inbox/inspect-docs-finding-20260925T120034Z.md`（defer 残置分として残置）。
>
> 分類確定: promote 7件（F-01 / F-02 / F-03 / F-11 / F-12 / F-18 / F-20。いずれもユーザー承認〔HITL〕）/ defer 継続 18件（同 finding の残り全件。F-05・F-07 はユーザー指示による defer、その他はユーザー承認範囲外のため承認を新設せず defer）/ reject 0件。

### F-01: REQ-082 が retired REQ-016 を現行所有者として参照【high】

- disposition: promote（2026-09-25 ユーザー承認〔HITL〕により採用確定。元 evidence は原状で保持。--auto なし）
- id: F-01
- category: DRIFT（retired 参照・参照ID整合性）
- target: docs/requirements/REQ-082.md
- evidence: 15 行目「caller 統合契約（…）は REQ-014/015/016 が所有し」、50 行目 対象外節「（… REQ-014/015/016）が所有」。retired/REQ-016.md:38-41 は 2026-09-20 に RETIRE（履歴注記「恒常契約は REQ-015 の既存契約が所有する」）。REQ-082 の updated は 2026-09-15 のまま廃止後未更新。シグナル 3（retired 参照 2 箇所 / 廃止後未更新 / REQ-036 のような「retired」明記慣行との不整合）
- severity: high（retired 文書が現行判断の根拠として引用されている。REQ-001-012/013 抵触）
- confidence: high
- source_of_truth: 現行 REQ-082 と retired/REQ-016 の履歴注記を正として判定
- recommended_route: intake（REQ-082 の所有者表記修正の要件化）
- ng_classification: pre-existing
- notes: REQ-015 本体が caller 統合の恒常契約を実際に所有しているかは REQ-016 移行先注記からの推定（REQ-015 本文は未深読み）

### F-02: 配布物に REQ-083 具体参照残留（IR-055 delta・strict）【high】

- disposition: promote（2026-09-25 ユーザー承認〔HITL〕により採用確定。元 evidence は原状で保持。--auto なし）
- id: F-02
- category: 配布物 ID 汚染
- target: src/opencode/skills/agentdev-workflow-case-open/references/root-case-and-definition-package.md:49
- evidence: check_integrity.ts IR-055 delta 検出「New strict violation: REQ-NNNN reference 'REQ-083' detected」。PR #3136（12b92f3a fix(skills): remove concrete REQ IDs from distribution references）で配布 references から具体 REQ ID を除去した変更の残存 1 件
- severity: high（配布物汚染に近い影響、機械的確定）
- confidence: high
- source_of_truth: IR-055 ルール（配布物は REQ-NNNN 参照を含まない）
- recommended_route: intake（機能的記述への置換の要件化）
- ng_classification: 今回修正対象（PR #3136 の除去漏れ）
- notes: なし

### F-03: IR-044 の「REQ-036-005 準拠」引用が現行 REQ-036-005 と意味不一致【high】

- disposition: promote（2026-09-25 ユーザー承認〔HITL〕により採用確定。元 evidence は原状で保持。--auto なし）
- id: F-03
- category: DRIFT（横断契約矛盾: Design が現行 REQ と矛盾）
- target: docs/designs/integrity/rules/IR-044-req-spec-boundary-violation-detection.md ↔ docs/requirements/REQ-036.md
- evidence: IR-044 の 72 行目「…真陽性保護対象から除外する（REQ-036-005）」、79 行目付「…保護対象から除外する（REQ-036-005 準拠）」。現行 REQ-036.md:24 の REQ-036-005 は「検出事項の文言は inspect finding に統一し、検出事項ファイル名は command ごとの接頭辞に従うこと」であり保護除外記録義務を含まない。REQ-036 は 2026-09-25 13:29 更新（コミット 39aa07f3、#3140）
- severity: high（下位文書である Design ルールが上位の現行 REQ 行と矛盾）
- confidence: medium
- source_of_truth: 現行 REQ-036-005 を正として判定（source-of-truth priority）
- recommended_route: intake（IR-044 側の引用再アンカーまたは Design 自己根拠化の要件化）
- ng_classification: 今回修正対象（直近の REQ-036 更新由来の未同期の可能性が高い。git 履歴上の行付け替え確認は未実施）
- notes: F-04/F-06（IR-044 の作業履歴残留）と同一ファイルのため一括修正を推奨

### F-11: 「次の新規 REQ は REQ-092」の記述が陳腐化（3 ファイル）

- disposition: promote（2026-09-25 ユーザー承認〔HITL〕により採用確定。元 evidence は原状で保持。--auto なし）
- id: F-11
- category: DRIFT（記述と実態の乖離）
- target: docs/designs/foundations/numbering-policy.md:65、docs/README.md:15、docs/requirements/README.md:100
- evidence: 3 ファイルが「REQ-089…再利用しない（次の新規 REQ は REQ-092）」と記述。REQ-092 は 2026-09-24 に作成済み（REQ-092.md:4）で、現時点の次番号は REQ-093。AUTOGEN 管轄外の手書き段落の更新忘れと推定
- severity: medium
- confidence: medium
- source_of_truth: REQ 実ファイルの採番実態
- recommended_route: intake（3 ファイルの記述更新）
- ng_classification: pre-existing
- notes: 意図的に採番時点の記述を固定している可能性は排除できない

### F-12: knowledge README の列挙欠落・件数不一致

- disposition: promote（2026-09-25 ユーザー承認〔HITL〕により採用確定。元 evidence は原状で保持。--auto なし）
- id: F-12
- category: 索引整合
- target: docs/knowledge/README.md
- evidence: README 22-36 行目「13件」+ 13 ファイル列挙に対し、実ファイルは 14 件。powershell-console-stdout-crlf-bash-pipe.md（frontmatter created: 2026-09-24、REQ-056-010 由来）が列挙外。check_knowledge_docs.ts も同一不整合を検出
- severity: medium
- confidence: high
- source_of_truth: docs/knowledge/ の実ファイル一覧
- recommended_route: intake（README 列挙・件数の更新）
- ng_classification: pre-existing（2026-09-24 の知識文書追加に追随していない）
- notes: なし

### F-18: retired/REQ-016.md・retired/REQ-057.md の frontmatter status 欠落

- disposition: promote（2026-09-25 ユーザー承認〔HITL〕により採用確定。元 evidence は原状で保持。--auto なし）
- id: F-18
- category: 世代境界（retired メタデータ慣行不一致）
- target: docs/requirements/retired/REQ-016.md、docs/requirements/retired/REQ-057.md
- evidence: 両ファイルの frontmatter に status なし（他の retired 12 ファイルは `status: migrated`/`retired` を持つ）。一方で REQ-016.md:38・REQ-057.md:59 の履歴注記は「RETIRE、status: migrated、2026-09-20」と宣言しファイル内で自己矛盾
- severity: low
- confidence: medium（REQ-001-010 の必須メタデータは識別子・表題・作成日・更新日のみで status は必須ではないため慣行不一致）
- source_of_truth: 他 retired ファイルの慣例と各ファイル内履歴注記
- recommended_route: intake（status: migrated 追加）
- ng_classification: pre-existing
- notes: なし

### F-20: decisions/README トピック別ビューの superseded 注記不整合

- disposition: promote（2026-09-25 ユーザー承認〔HITL〕により採用確定。元 evidence は原状で保持。--auto なし）
- id: F-20
- category: README 索引（表記一貫性）
- target: docs/decisions/README.md:139,143
- evidence: 141 行目 DEC-005・147 行目 DEC-017 には「superseded by …」注記があるが、139 行目 DEC-002・143 行目 DEC-007 には同種注記がない（同一「配布基盤・ソースモデル」節内の表記ゆれ）
- severity: low
- confidence: medium（表記不整合自体は確実、重要度は低）
- source_of_truth: 同 README 内の注記慣行
- recommended_route: intake（注記の統一）
- ng_classification: pre-existing
- notes: トピック別ビューが AUTOGEN 管理か手書きか未確認
