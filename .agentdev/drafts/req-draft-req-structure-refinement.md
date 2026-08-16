---
draft_type: req_draft
topic_slug: req-structure-refinement
status: saved
created_at: 2026-08-16T12:12:34+09:00
source_rus:
  - RU-0017
---

# draft-data

```yaml
# work_type: 要件の分類（bugfix / feature / maintenance / docs_chore）
# workflow_route の派生値は保存せず、work_type + scale から各コマンドが導出する
work_type: feature

# scale: feature のみ standard / large。それ以外は未設定でよい
scale: large

# summary: 当該 draft が何を合意したかの1段落要約。人間可読補助（処理の正ではない）
summary: >
  RU-0017（REQ 体系構造協議）の要件化。REQ-010（要件行57、SPLIT シグナル3）を
  command family 単位の5 REQ へ分割する。REQ-010 は docs-check 単体（15行）へ縮小 UPDATE し、
  検出と診断コマンド群（inspect 系、22行）、取り込みパイプライン（intake、10行）、
  学習パイプライン（learning、5行）、バックログ統合（backlog-review、5行）の4 REQ を新規 CREATE する。
  達成済みの Artifact Graph 系個別改善 REQ である REQ-013、REQ-022、REQ-023、REQ-024 の4件を
  docs/requirements/retired/ へ RETIRE する（migrated、後継明示）。
  REQ-012〜024 への全参照（REQ-010-NNN 形式396箇所、旧013〜058 帯が主対象）を
  マッピング表に基づき再配線する。系契約（機械検出と意味診断の分離、inbox から promoted への
  引き渡し、HITL 承認原則）は傘 REQ を新設せず、既存正規所有者
  （REQ-008、workflow-contracts SPEC、backlog-artifact-lifecycle SPEC、capture-boundaries SPEC）が保持し、
  分割先各 REQ は境界行と関連情報の第一参照導線でのみ保持する。

# auto_gate: case-auto 自走可否の判定材料
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

# agreed_items: 合意された個別項目。artifact_actions.source_items から ID 参照される
agreed_items:
  - id: AG-001
    content: |
      REQ-010 を docs-check 単体 REQ へ縮小 UPDATE する。タイトルを「自己監査コマンド（docs-check）」へ変更し、
      目的文と適用範囲を docs-check の検査責務に縮小する。要件表は REQ-010-001〜012、059、060、062 の15行を
      元の行 ID のまま保持する（欠番 013〜058、061 を許容する。現行 REQ-010 の 053〜057 欠番と同型の運用であり、
      未再配線参照が dangling として検出される安全な失敗モードを優先する）。
      保持行の本文は変更しない。REQ-010 は RETIRE せず存続させ、docs-check 系への既存参照
      （REQ-010-001〜012、059、060、062 への参照）を不変とする。
  - id: AG-002
    content: |
      検出と診断コマンド群（inspect 系）を新規 REQ として CREATE する。旧 REQ-010-013〜017（命名・用語基盤5行）、
      018〜023（inspect-docs 6行）、024〜028（inspect-skills 5行）、029〜033（inspect-promote 5行）、
      058（severity・gate_level 軸維持1行）の計22行を新 REQ の 001〜022 として移動する。
      行本文は旧本文を維持し ID のみ新採番とする。目的文に DEC-006（inspect 3-command 構成への正規化）の
      正規化単位である旨を明記し、inspect-docs、inspect-skills、inspect-promote の3 command を単一関心として扱う
      根拠を将来の SPLIT 再診断に対して固定する。機械検出と意味診断の分離については REQ-010（docs-check 側）との
      双方の境界行で保持する。severity・gate_level 軸の維持行（旧058）と REQ-010-006（severity 分類）は
      相互に関連情報で参照し、軸の追加・削除判断が両 REQ にまたがることを可視化する。
  - id: AG-003
    content: |
      取り込みパイプライン（intake）を新規 REQ として CREATE する。旧 REQ-010-034〜040（pipeline 7行）、
      050〜052（intake と learning の capture 責務境界3行）の計10行を新 REQ の 001〜010 として移動する。
      行本文は旧本文を維持する。capture 境界の詳細は capture-boundaries SPEC が正規所有するため、
      関連情報に第一参照導線を置く。
  - id: AG-004
    content: |
      学習パイプライン（learning）を新規 REQ として CREATE する。旧 REQ-010-041〜044（4行）、
      061（反映先評価と分類1行）の計5行を新 REQ の 001〜005 として移動する。行本文は旧本文を維持する。
      capture 境界（旧050〜052、intake 側が所有）への導線を関連情報に置く。
  - id: AG-005
    content: |
      バックログ統合（backlog-review）を新規 REQ として CREATE する。旧 REQ-010-045〜049 の5行を
      新 REQ の 001〜005 として移動する。行本文は旧本文を維持する。
      採用済み成果物から RU へのライフサイクルは REQ-008 および backlog-artifact-lifecycle SPEC が
      正規所有するため、関連情報に第一参照導線を置く。
  - id: AG-006
    content: |
      達成済みの4 REQ を docs/requirements/retired/ へ RETIRE する。いずれも frontmatter の status は
      正規化語彙から migrated を選定し、本文冒頭の履歴注記に後継と達成根拠を明示する。要件表本文は履歴として
      変更せず保持する。frontmatter は retired 必須字段へ正規化する（REQ-024 の work_type: feature 残存等は整理する）。
      - REQ-013（DOC-MAP 依存除去）: 後継は REQ-012（Artifact Graph 標準化）および
        docs/specs/integrity/references/docmap-reference-audit.md（残存参照の個別生死判定記録）。
        達成根拠は docs/DOC-MAP.md 除去済み（PR #1953/#1958）と同監査記録の論理ユニット44件分類完了。
        integrity スクリプト残存参照の除去は監査記録が追跡する後続 Issue が担う。
      - REQ-022（augmentation 配置先正規化）: 後継は docs/specs/skills/agentdev-artifact-graph.md
        「augmentation 配置先」節。達成根拠は同事節の正規配置・選定根拠・project-extensions との使い分け表の明示済み。
      - REQ-023（問い合わせ結果の関係情報拡張）: 後継は同事 SPEC「問い合わせ結果の出力形式」節および
        scripts/lib/query.ts の type/source/target 出力実装（後方互換維持、query.test.ts あり）。
      - REQ-024（未解決参照 warning の分類と抽出規則改善）: 後継は同事 SPEC「check_graph.ts 抽出規則と warning 分類」節
        および lib/checker.ts の severity 別 warnings/info 分類実装（checker.test.ts あり）。
      REQ-020（解析品質と検証）は代表質問回帰検証の実入力 fixture（REQ-020-003〜005）が未整備のため RETIRE しない。
      REQ-012、REQ-021 も現行維持とする。
  - id: AG-007
    content: |
      全参照再配線。docs/** 全域の REQ-010-NNN 形式参照（計測時点396箇所）を次のマッピング表へ基づき置換する。
      マッピングの別名（inspect 系、intake、learning、backlog-review）は req-save の採番結果（operation_units の
      result への書き戻し）で確定する。src/** は対象外とする（配布物の内部 ID 非依存設計により参照0件を確認済み）。
      実行単位の振り分け: 分割由来の再配線（下記マッピング表の適用）は REQ-010 縮小 UPDATE と同一実行単位で実施する。
      RETIRE 由来の整理（retired 4 REQ への現行参照の履歴文脈注記化または除去）は RETIRE 操作と同一実行単位で実施する。

      マッピング表（旧 REQ-010 行 -> 移動先。行本文は不変）:
      | 旧 REQ-010 行 | 移動先 |
      |---|---|
      | 001〜012 | REQ-010 に維持（不変） |
      | 013〜017 | inspect 系 REQ 001〜005 |
      | 018〜023 | inspect 系 REQ 006〜011 |
      | 024〜028 | inspect 系 REQ 012〜016 |
      | 029〜033 | inspect 系 REQ 017〜021 |
      | 034〜040 | intake REQ 001〜007 |
      | 041〜044 | learning REQ 001〜004 |
      | 045〜049 | backlog-review REQ 001〜005 |
      | 050〜052 | intake REQ 008〜010 |
      | 058 | inspect 系 REQ 022 |
      | 059、060、062 | REQ-010 に維持（不変） |
      | 061 | learning REQ 005 |

      置換規則:
      1. 行単位参照（REQ-010-013 等）はマッピング表の別名を採番結果の REQ-ID に解決して置換する。
      2. レンジ表記（REQ-010-013〜017 等）は一度に行へ展開し、置換後に同一移動先なら新レンジへ再構成する。
         移動先がまたがる場合は列挙表記へ書き換える。全範囲レンジ（REQ-010-001〜062 等）は新体系の
         REQ 列挙とレンジの組合せへ書き換える。
      3. REQ-010 のタイトル併記参照（「REQ-010（自己監査と診断・是正候補抽出）」等）は新タイトルへ更新する。
      4. dangling 参照 REQ-010-254 は inspect 系 REQ 008（旧 020 行、機械検査の docs-check 委譲）へ、
         REQ-010-284 は inspect 系 REQ 009（旧 021 行、診断観点の内容）へ再配線する。
      5. docs/specs/integrity/audits/、baselines/ 配下の日付付き監査記録内の参照は履歴文脈注記付き維持を優先し、
         check_integrity の retired 系・broken-ref 系 check が ng または warning を出す場合のみ最小限の置換を行う。
      6. REQ-012 の関連情報にある REQ-013 参照は履歴注記（後継 REQ-012 自身と retired/ 移行の明示）へ置換する。
      7. REQ-013、REQ-022、REQ-023、REQ-024（およびその行 ID）への現行ファイル中の参照は、
         履歴文脈注記（後継 REQ または SPEC 節の明示）へ置換または除去する。
      8. AUTOGEN ブロック（docs/README.md、docs/requirements/README.md、req-health-metrics.md 計測例等）は
         generate_indexes により各実行単位の完了時に再生成する。
      合格基準は test_strategy（TS-007）が定める検証通過である。
  - id: AG-008
    content: |
      系契約の所在を明示する。機械検出と意味診断の分離は REQ-010（docs-check 側、REQ-010-003）と
      inspect 系 REQ（委譲側、旧 020 行）の境界行が保持する。inbox から promoted への引き渡しと HITL 承認原則は
      REQ-008（一時成果物ライフサイクル）と backlog-artifact-lifecycle SPEC、workflow-contracts SPEC が正規所有し、
      本再構成では変更しない。検出事項の自動要件化を行わない原則は inspect 系、intake、learning、backlog-review の
      各 REQ が移動した各行（HITL 承認、ユーザー承認を要求する行）に内包して保持する。
      傘 REQ（パイプライン統括 REQ）は新設しない。分割先4 REQ および REQ-010 の関連情報に
      REQ-008 への第一参照導線を置く。

# artifact_actions: REQ/Decision/SPEC への保存対象を1つの配列に統合
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-010.md
    source_items: [AG-001, AG-008]
    content: |
      ---
      id: REQ-010
      title: "自己監査コマンド（docs-check）"
      created: "2026-07-25"
      updated: "2026-08-16"
      ---

      ## 目的

      本体リポジトリ専用の自己監査 command である docs-check の検査責務を所有する。検査は機械的パターンマッチングで判定可能な範囲に限定し、意味判断、文脈解釈、推論を要する診断は検出と診断コマンド群（inspect 系）が担当する分離境界を維持する。
      一時成果物の配置、ライフサイクル、構造化契約は REQ-008 が所有する。REQ と SPEC の健全性指標と分割予兆の定量定義は REQ-001 が所有し、IR 体系の実効性監査と存在条件厳格化は REQ-028 が所有し、本 REQ は指標と基準を用いた検査の実行を所有する。

      ## 要件

      | ID | 要件 |
      |---|---|
      | REQ-010-001 | docs-check は本体リポジトリ専用の自己監査 command とし、AgentDevFlow の配布対象から除外すること |
      | REQ-010-002 | docs-check は検査対象を直接修正せず、検出事項を報告として出力すること |
      | REQ-010-003 | docs-check の検査は機械的パターンマッチングで判定可能な範囲に限定し、意味判断、文脈解釈、推論を要する検査は inspect 系 command が担当すること |
      | REQ-010-004 | docs-check、inspect-docs、inspect-skills、inspect-promote の責務境界は重複しないこと |
      | REQ-010-005 | docs-check の検査層は全件検査、変更関連検査、影響範囲検査の3層であること |
      | REQ-010-006 | docs-check の検出事項は severity 分類（strict、heuristic、observation）で分類すること |
      | REQ-010-007 | docs-check は基準既知の検出事項と新規検出事項を区別できること |
      | REQ-010-008 | docs-check は整合性検証基盤自身の artifact 変更時に、基盤自身の整合性を検証すること |
      | REQ-010-009 | docs-check の checker 個別ルール、検出シグナル、誤検出抑制方式の詳細は SPEC、skill、script、tests のいずれかが所有すること |
      | REQ-010-010 | docs-check の新規検査には対応する回帰テストが存在すること |
      | REQ-010-011 | docs-check は索引、README、規則カタログ、文書地図の件数と一覧表が実ファイル配置と整合することを検証すること |
      | REQ-010-012 | 保存工程と完了工程での変更ファイル限定検査は、検出基盤の規則に違反する変更を検出した場合に工程を停止すること |
      | REQ-010-059 | docs-check または CI は AUTOGEN ブロック（spec-health-metrics.md 等）の鮮度を検出し、rename、status 変更時の再生成必要性を判定すること。SC-002（定期再生成）と整合すること |
      | REQ-010-060 | self-hosting における AgentDevFlow 所有の保存・完了・release 経路は、配布境界検査の合格前に永続成果物を確定せず正常完了を報告せず、検査不能時は未合格として停止すること |
      | REQ-010-062 | テストは配布 checker と同種の整合性検証規則を独自実装せず、配布 checker が所有する規則から期待値を導出すること。構造変更時にテスト側のみが陳腐化する二重管理を行わないこと |

      ## 適用範囲

      - **対象**:
        - docs-check 自己監査 command の検査責務と配布境界、機械検出と意味診断の分離境界（docs-check 側）、検査層と severity 分類、検出事項の報告と基準既知と新規の区別、整合性検証基盤自身の整合性検証、checker 詳細の委譲、回帰テスト、索引と README と規則カタログと文書地図の整合性検証、保存工程と完了工程の変更ファイル限定検査、AUTOGEN 鮮度検出、self-hosting 配布境界検査、テストの checker 規則再実装禁止
      - **対象外**:
        - 一時成果物（draft、RU、取り込み項目、学習エントリ、検出事項）の配置、ライフサイクル、構造化契約、draft type registry（REQ-008）
        - REQ と SPEC の健全性指標と分割予兆の定量定義（REQ-001）
        - IR 体系の実効性監査と存在条件厳格化（REQ-028）
        - 検出と診断コマンド群（inspect 系）、取り込みパイプライン（intake）、学習パイプライン（learning）、バックログ統合（backlog-review）の各責務（各分割先 REQ）
        - 要件定義プロセスの実行契約（REQ-004）、完了報告と成果物品質ゲート（REQ-007）
        - checker 個別ルール、検出シグナル定義、enum 値一覧、ルート表、誤検出抑制アルゴリズム、検出ロジック、スクリプト内部実装、個別検出事項の修正実行

      ## 関連情報

      **関連 REQ**: REQ-001（健全性指標の定量定義）、REQ-008（一時成果物ライフサイクル、パイプライン契約の正規所有者）、REQ-028（IR 体系監査）、検出と診断コマンド群（inspect 系）を所有する REQ（機械検出と意味診断の分離相手、severity・gate_level 軸の相互管理）
      **関連 Decision**: DEC-006（inspect 3-command 構成への正規化）、DEC-013（IR 登録モデルの簡素化）
  - id: ACT-REQ-002
    artifact: req
    operation: create
    target: new:inspect-commands
    source_items: [AG-002, AG-007, AG-008]
    content: |
      ---
      id: REQ-{NNNN}
      title: "検出と診断コマンド群（inspect 系）"
      created: "2026-08-16"
      updated: "2026-08-16"
      ---

      ## 目的

      検出コマンド群（inspect-docs、inspect-skills、inspect-promote）と検出ドメインの命名・用語基盤を所有し、docs と配布物の意味診断、検出事項の分類・昇格の実行責務を担う。3 command は DEC-006（inspect 3-command 構成への正規化）が定める単一の正規化単位であり、本 REQ の関心単位とする。
      機械的検査は docs-check（REQ-010）が担当し、本系 command は対象を直接修正せず機械的検出と意味診断を分離して候補報告に徹する。検出事項の分類と採用済み成果物への昇格はユーザーの明示的な承認に基づき、自動的な要件化を行わない。
      検出事項の inbox、採用済み成果物の配置とライフサイクルは REQ-008 が、パイプライン全体の共通契約は workflow-contracts SPEC が、採用済み成果物の RU 化は backlog-review を所有する REQ が所有する。

      ## 要件

      | ID | 要件 |
      |---|---|
      | REQ-{NNNN}-001 | 検出コマンド群は inspect 命名で一貫し、command 名、ディレクトリ、skill、source_type、検出事項用語、ファイル名接頭辞が全域で統一されること |
      | REQ-{NNNN}-002 | 公開 inspect command 集合は {inspect-docs, inspect-skills, inspect-promote} の3件とし、inspect-extensions を独立公開 command として廃止すること。extension 検査の決定的検査（8項目）を IR-056 / docs-check、意味診断（2項目）を inspect-skills、finding 処分を inspect-promote へ移管すること |
      | REQ-{NNNN}-003 | diagnostics 命名は検出 command 名には使用せず、診断ロジックを一次所有する skill 名に限定して許容すること |
      | REQ-{NNNN}-004 | 検出コマンド群は検出事項を inspect ドメイン状態の inbox へ出力し、reject された事項は即時削除すること |
      | REQ-{NNNN}-005 | 検出事項の文言は inspect finding に統一し、検出事項ファイル名は command ごとの接頭辞に従うこと |
      | REQ-{NNNN}-006 | inspect-docs は REQ 体系の意味診断を担当し、操作スコープを読み取りと診断結果の出力に限定すること |
      | REQ-{NNNN}-007 | inspect-docs の診断観点は SPLIT、MERGE、MOVE、DUPLICATE、RETIRE、DRIFT であること |
      | REQ-{NNNN}-008 | inspect-docs は機械的検査を docs-check に委譲し、重複して保持しないこと |
      | REQ-{NNNN}-009 | inspect-docs の診断観点は REQ と SPEC の境界違反、粒度、SPEC 詳細混入、誤分類、重複所有、廃止 REQ や SPEC 由来の記述残置を含むこと |
      | REQ-{NNNN}-010 | inspect-docs の出力は最小限の診断結果、問題候補、推奨アクション、必要な場合の要件定義入力案に限定すること |
      | REQ-{NNNN}-011 | inspect-docs は診断カテゴリ、証拠構造、出力契約、文書種別別診断へのルーティングを diagnostics 系 skill へ委譲すること |
      | REQ-{NNNN}-012 | inspect-skills は command と skill の参照妥当性と skill 構造を、検査対象を直接修正せずに診断すること |
      | REQ-{NNNN}-013 | inspect-skills の診断観点は Command から Skill への参照、Skill frontmatter、本文構造、references 利用、template と script の参照、粒度、段階的開示、責務境界、実行主体分類の誤認、SPEC 操作契約テーブルの整合を含むこと |
      | REQ-{NNNN}-014 | inspect-skills の詳細観点と判定基準は skill に集約し、command 定義は薄い入口とすること |
      | REQ-{NNNN}-015 | inspect-skills の許可される副作用は検出事項ファイルの生成と inspect ドメイン状態配下の永続化のみとすること |
      | REQ-{NNNN}-016 | inspect-skills は検出事項に対する推奨経路の提示のみを行い、修正を実行しないこと |
      | REQ-{NNNN}-017 | inspect-promote は inspect 検出事項を promote、defer、reject に分類すること |
      | REQ-{NNNN}-018 | inspect-promote は採用済み成果物をユーザーの明示的な承認を得た後に生成すること |
      | REQ-{NNNN}-019 | inspect-promote は promote を promoted へ保存して inbox を削除し、reject を削除し、defer を inbox へ残置すること |
      | REQ-{NNNN}-020 | 明確な不整合の検出事項は intake を経ずに採用済み成果物として要件化対象とすること |
      | REQ-{NNNN}-021 | inspect-promote は明示的なオプトインにより、機械的に特定可能で移行先が一意に定まる高確信度検出事項を自動的に採用済み成果物へ昇格できること |
      | REQ-{NNNN}-022 | 既存 severity、gate_level を維持し、削除または同義化しないこと。baseline_status は REQ-028-010 へ移管 |

      ## 適用範囲

      - **対象**:
        - 検出コマンド群の命名統一、ドメイン状態、検出事項用語とファイル名接頭辞、diagnostics 命名の許容境界
        - inspect-extensions の公開 command 廃止と extension 検査の3層責務分離（決定的検査を IR-056 / docs-check、意味診断を inspect-skills、finding 処分を inspect-promote へ移管）
        - inspect-docs の REQ 体系意味診断、診断観点、機械検査の委譲、出力範囲、diagnostics 系 skill へのルーティング
        - inspect-skills の command と skill 参照妥当性診断、診断観点、skill 集約、副作用範囲、推奨経路提示
        - inspect-promote の分類、HITL 承認、promote と reject と defer の処理、明確な不整合の直接要件化、高確信度検出事項の自動昇格
        - severity・gate_level 軸の維持（baseline_status は REQ-028-010 へ移管済み）
      - **対象外**:
        - docs-check の検査責務と配布境界（REQ-010）
        - 一時成果物の配置、ライフサイクル、構造化契約（REQ-008）
        - REQ と SPEC の健全性指標と分割予兆の定量定義（REQ-001）
        - IR 体系の実効性監査と存在条件厳格化（REQ-028）
        - 取り込みパイプライン（intake）、学習パイプライン（learning）、バックログ統合（backlog-review）の各責務（各分割先 REQ）
        - 個別検出事項の修正実行

      ## 関連情報

      **関連 REQ**: REQ-008（一時成果物ライフサイクル）、REQ-010（docs-check、機械検出と意味診断の分離相手、severity・gate_level 軸の相互管理）、REQ-028（IR 体系監査）
      **関連 Decision**: DEC-006（inspect 3-command 構成への正規化）
  - id: ACT-REQ-003
    artifact: req
    operation: create
    target: new:intake-pipeline
    source_items: [AG-003, AG-007, AG-008]
    content: |
      ---
      id: REQ-{NNNN}
      title: "取り込みパイプライン（intake）"
      created: "2026-08-16"
      updated: "2026-08-16"
      ---

      ## 目的

      ユーザー入力とクローズ済み Issue や PR からの作業候補の蓄積と採用判定を所有し、恒久契約候補のみを要件化経路へ送る取り込みパイプラインの実行責務を担う。採用判定はユーザー承認を経て確定し、自動的な要件化を行わない。
      intake 項目と採用済み成果物の配置先とライフサイクルは REQ-008 が、パイプライン全体の共通契約は workflow-contracts SPEC が、採用済み成果物の RU 化は backlog-review を所有する REQ が、intake と learning の capture 境界の詳細は capture-boundaries SPEC が所有する。

      ## 要件

      | ID | 要件 |
      |---|---|
      | REQ-{NNNN}-001 | intake pipeline はユーザー入力とクローズ済み Issue や PR からの作業候補を蓄積すること |
      | REQ-{NNNN}-002 | intake-capture はユーザー入力から明示できる内容のみを intake 項目として整理すること |
      | REQ-{NNNN}-003 | intake-promote は採用判定とユーザー承認を経て promoted へ配置するか削除すること |
      | REQ-{NNNN}-004 | intake pipeline の成果物配置先は inbox または promoted に限定すること |
      | REQ-{NNNN}-005 | intake-promote は恒久契約候補のみを要件化経路へ送ること |
      | REQ-{NNNN}-006 | 同一観測から intake と learning の両方が発生する場合は別々の成果物に分離すること |
      | REQ-{NNNN}-007 | REQ 再構成の intake は通常の intake 経路と区別し、独立した扱いを維持すること |
      | REQ-{NNNN}-008 | システムは intake と learning の capture 責務境界を一次参照として定義すること |
      | REQ-{NNNN}-009 | capture 境界定義は判断質問、代表例、非対象例を含むこと |
      | REQ-{NNNN}-010 | 実行コマンド群の capture 振る舞いは構成コマンドの責務境界に従って統一すること |

      ## 適用範囲

      - **対象**: intake pipeline（蓄積、整理、採用判定、HITL 確定、配置先限定、恒久契約候補経路、REQ 再構成 intake の独立経路）、intake と learning の capture 責務境界、capture 境界定義の内容、capture 振る舞いの統一
      - **対象外**: 一時成果物の配置、ライフサイクル、構造化契約（REQ-008）、学習パイプライン（learning を所有する REQ）、バックログ統合（backlog-review を所有する REQ）、docs-check と検出コマンド群（REQ-010、inspect 系を所有する REQ）、capture 境界の詳細運用規則（capture-boundaries SPEC）

      ## 関連情報

      **関連 REQ**: REQ-008（一時成果物ライフサイクル）、学習パイプライン（learning を所有する REQ、capture 境界の相手）
      **関連 SPEC**: capture-boundaries SPEC（intake と learning の capture 境界の正規所有者）
  - id: ACT-REQ-004
    artifact: req
    operation: create
    target: new:learning-pipeline
    source_items: [AG-004, AG-007, AG-008]
    content: |
      ---
      id: REQ-{NNNN}
      title: "学習パイプライン（learning）"
      created: "2026-08-16"
      updated: "2026-08-16"
      ---

      ## 目的

      再発防止、抽象化、反映価値のある知見の蓄積と多軸評価を所有し、恒久契約候補のみを要件化経路へ送る学習パイプラインの実行責務を担う。最終確定はユーザーの判断を挟む確定ステップを経て、自動的な要件化を行わない。
      学習エントリと採用済み成果物の配置先とライフサイクルは REQ-008 が、パイプライン全体の共通契約は workflow-contracts SPEC が、採用済み成果物の RU 化は backlog-review を所有する REQ が、intake と learning の capture 境界の詳細は capture-boundaries SPEC が所有する。

      ## 要件

      | ID | 要件 |
      |---|---|
      | REQ-{NNNN}-001 | learning pipeline は再発防止、抽象化、反映価値のある知見を蓄積すること |
      | REQ-{NNNN}-002 | learning-promote は多軸評価とユーザー承認を経て採用済み成果物を生成すること |
      | REQ-{NNNN}-003 | learning-promote の最終確定はユーザーの判断を挟む確定ステップを経ること |
      | REQ-{NNNN}-004 | learning-promote は恒久契約候補のみを要件化経路へ送ること |
      | REQ-{NNNN}-005 | learning pipeline は学びを保存するだけでなく、再発防止のために反映先（既存 REQ / Decision / SPEC への反映、Skill の改善、決定論的な検査・ガードレールへの移管、既存処理手順の改善、通常の Issue による修正、重複・陳腐化した知識の削除、現時点では反映不能なものの保留）を評価して分類すること。learning-promote がこれらを直接変更せず、learning-promote → backlog-review → RU → req-define の承認・要件化経路を維持し、構造改善先の分類結果を後続工程へ渡すこと |

      ## 適用範囲

      - **対象**: learning pipeline（知見蓄積、多軸評価、HITL 確定、恒久契約候補経路、反映先の評価と分類、要件化経路の維持）
      - **対象外**: 一時成果物の配置、ライフサイクル、構造化契約（REQ-008）、取り込みパイプライン（intake を所有する REQ）、バックログ統合（backlog-review を所有する REQ）、capture 境界の詳細運用規則（capture-boundaries SPEC）

      ## 関連情報

      **関連 REQ**: REQ-008（一時成果物ライフサイクル）、取り込みパイプライン（intake を所有する REQ、capture 境界の相手）
      **関連 SPEC**: capture-boundaries SPEC（intake と learning の capture 境界の正規所有者）
  - id: ACT-REQ-005
    artifact: req
    operation: create
    target: new:backlog-review
    source_items: [AG-005, AG-007, AG-008]
    content: |
      ---
      id: REQ-{NNNN}
      title: "バックログ統合（backlog-review）"
      created: "2026-08-16"
      updated: "2026-08-16"
      ---

      ## 目的

      採用済み成果物（intake、learning、inspect）の分析、統合、矛盾検出と RU（要件ユニット）生成を所有する。RU 生成はユーザー承認を経て確定し、自動的な要件化を行わない。
      RU と採用済み成果物の配置先とライフサイクルは REQ-008 が、パイプライン全体の共通契約は workflow-contracts SPEC が、アーティファクトライフサイクルの詳細は backlog-artifact-lifecycle SPEC が所有する。

      ## 要件

      | ID | 要件 |
      |---|---|
      | REQ-{NNNN}-001 | backlog-review は採用済み成果物を分析、統合し、ユーザー承認を経て RU（要件ユニット）を生成すること |
      | REQ-{NNNN}-002 | backlog-review が生成する RU は採用済み成果物の単純コピーではなく、要件化に向けた構造化内容とすること |
      | REQ-{NNNN}-003 | backlog-review は採用済み成果物間の矛盾を検出し、解決をユーザーに委ねること |
      | REQ-{NNNN}-004 | backlog-review は RU 化に成功した採用済み成果物を promoted から削除し、失敗した成果物と矛盾成果物は残置すること |
      | REQ-{NNNN}-005 | backlog-review は恒久契約候補判定を独立して再評価し、不適格な成果物を RU 化しないこと |

      ## 適用範囲

      - **対象**: backlog-review（分析、統合、矛盾検出、RU 生成、構造化内容、promoted 削除条件、恒久契約候補再評価）
      - **対象外**: 一時成果物の配置、ライフサイクル、構造化契約（REQ-008）、取り込みパイプライン、学習パイプライン、検出コマンド群（各分割先 REQ）、RU の要件化（req-define、REQ-004）

      ## 関連情報

      **関連 REQ**: REQ-008（一時成果物ライフサイクル、RU と採用済み成果物のライフサイクルの正規所有者）
      **関連 SPEC**: backlog-artifact-lifecycle SPEC（RU / 採用済み成果物 / draft ライフサイクルの正規所有者）
  - id: ACT-REQ-006
    artifact: req
    operation: update
    target: docs/requirements/REQ-013.md
    source_items: [AG-006]
    content: |
      RETIRE 操作: 対象ファイルを docs/requirements/retired/REQ-013.md へ移動する。
      frontmatter の status は正規化語彙から migrated を選定し、retired 必須字段へ正規化する。
      本文冒頭に履歴注記として後継と達成根拠を明示する:
      - 後継: REQ-012（Artifact Graph 標準化）、docs/specs/integrity/references/docmap-reference-audit.md（残存参照の個別生死判定記録）
      - 達成根拠: docs/DOC-MAP.md 除去済み（PR #1953/#1958）。integrity スクリプト群の残存参照は論理ユニット44件の個別生死判定で分類済みで、除去は監査記録が追跡する後続 Issue が担う
      要件表本文は履歴として変更せず保持する。
  - id: ACT-REQ-007
    artifact: req
    operation: update
    target: docs/requirements/REQ-022.md
    source_items: [AG-006]
    content: |
      RETIRE 操作: 対象ファイルを docs/requirements/retired/REQ-022.md へ移動する。
      frontmatter の status は正規化語彙から migrated を選定し、retired 必須字段へ正規化する。
      本文冒頭に履歴注記として後継と達成根拠を明示する:
      - 後継: docs/specs/skills/agentdev-artifact-graph.md「augmentation 配置先」節（専用配置 .agentdev/artifact-graph.yaml の正規配置、選定根拠、project-extensions 機構との使い分け表が正規所有）
      - 達成根拠: 同 SPEC 節への明示済み（REQ-022-001、REQ-022-002 の内容が SPEC により正規所有されている状態）
      要件表本文は履歴として変更せず保持する。段階3 Issue #1951（Self-hosting 移行）での再評価予定は後継 SPEC 節の「今後の評価」が引き継ぐ。
  - id: ACT-REQ-008
    artifact: req
    operation: update
    target: docs/requirements/REQ-023.md
    source_items: [AG-006]
    content: |
      RETIRE 操作: 対象ファイルを docs/requirements/retired/REQ-023.md へ移動する。
      frontmatter の status は正規化語彙から migrated を選定し、retired 必須字段へ正規化する。
      本文冒頭に履歴注記として後継と達成根拠を明示する:
      - 後継: docs/specs/skills/agentdev-artifact-graph.md「問い合わせ結果の出力形式」節、scripts/lib/query.ts
      - 達成根拠: query.ts が各関係の type、source、target を既存フィールドと後方互換を維持して出力する実装済み（query.test.ts あり）
      要件表本文は履歴として変更せず保持する。
  - id: ACT-REQ-009
    artifact: req
    operation: update
    target: docs/requirements/REQ-024.md
    source_items: [AG-006]
    content: |
      RETIRE 操作: 対象ファイルを docs/requirements/retired/REQ-024.md へ移動する。
      frontmatter の status は正規化語彙から migrated を選定し、retired 必須字段へ正規化する（work_type: feature の残存は整理する）。
      本文冒頭に履歴注記として後継と達成根拠を明示する:
      - 後継: docs/specs/skills/agentdev-artifact-graph.md「check_graph.ts 抽出規則と warning 分類」節、scripts/lib/checker.ts
      - 達成根拠: checker.ts が severity 別の warnings と info の分類を実装済みで、構造検査の合格状態（エラー0件）を checker.test.ts が検証している
      要件表本文は履歴として変更せず保持する。
  - id: ACT-REQ-010
    artifact: req
    operation: update
    target: docs/requirements/REQ-012.md
    source_items: [AG-007]
    content: |
      関連情報のクリーンアップ: 関連 REQ 列の REQ-013 参照を履歴注記へ置換する
      （「REQ-013（旧: DOC-MAP 依存除去、docs/requirements/retired/ へ移行、後継は本 REQ）」の形式）。
      それ以外の本文変更は行わない。

# conflict_resolutions: 壁打ちで解消された衝突の記録
conflict_resolutions:
  - id: CR-001
    conflict: F-13 は「診断系横断責務を1 REQ に束ねる設計判断の可能性」を指摘し、REQ-010 目的文の系全体契約（分離、引き渡し、HITL）が分割の障害になり得る
    resolution: 分割を採用（SPLIT シグナル3、req-health-metrics の SPLIT 推奨帯）。ただし REQ-010 は RETIRE せず docs-check 単体へ縮小 UPDATE とし、docs-check 系への既存参照（REQ-010-001〜012、059、060、062）を不変にすることで参照安定性を確保した。系契約は AG-008 の配分で保持する
  - id: CR-002
    conflict: F-14 は同一関心（Artifact Graph）の7 REQ 細分化を MERGE 候補とした
    resolution: 実態調査の結果、MERGE ではなく「達成済み個別改善 REQ の残置」と判定し、REQ-013、REQ-022、REQ-023、REQ-024 の4件を RETIRE、REQ-012、REQ-020、REQ-021 の3件を現行維持とした。RU-0017 の「破壊的な統合は前提としない」方針に準拠する。REQ-020 は代表質問回帰検証 fixture（REQ-020-003〜005）が未整備のため達成未完了と判定した
  - id: CR-003
    conflict: 系契約の置き場所について、傘 REQ 新設案、REQ-001 集約案、新規統括 REQ 案が候補となった
    resolution: 傘 REQ 不設置・既存正規所有者活用を採用。inbox から promoted への引き渡しと HITL は REQ-008 と backlog-artifact-lifecycle SPEC が二重に正規所有しており、REQ level で再定義すると二重記述になるため。REQ-001 は既に +1 シグナル（64行）で関心も不一致、要件行なし傘 REQ は計測不能警告に抵触するため不採用
  - id: CR-004
    conflict: REQ-010 保持行の行番号方針（元番号維持 vs 全行再採番）
    resolution: 元番号維持を採用（001〜012、059、060、062、欠番 013〜058、061）。全行再採番は旧 013〜058 への未再配線参照が新 013〜015 に誤解決する静かな破壊の恐れがあるため不採用。元番号維持なら未再配線参照は dangling として検出される安全な失敗モードになる。現行 REQ-010 の 053〜057 欠番と同型の運用であり機械検査も通過する
  - id: CR-005
    conflict: 監査記録・baseline 内の旧 ID 参照（81件）の扱い（全置換 vs 維持）
    resolution: 履歴文脈注記付き維持を優先し、check_integrity の retired 系・broken-ref 系 check が ng または warning を出す場合のみ最小限の置換を行う。全置換は日付付き監査記録の証拠性を損なうため不採用（経路A review F2-4 の反映）

# operation_units: 複数RU入力時の統合/分離結果。単一REQ操作の場合も1件の OU として出力
operation_units:
  - ou_id: OU-001
    source_ru: RU-0017
    target_req: REQ-036
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved: true
      issue: 2157
      epic: 2156
      req: REQ-036
      files: [docs/requirements/REQ-036.md]
      artifact_action: ACT-REQ-002
      target_alias: new:inspect-commands
      mapping_alias: inspect 系 REQ = REQ-036
      note: 旧 REQ-010-013〜017,018〜023,024〜028,029〜033,058 を REQ-036-001〜022 へ移動
  - ou_id: OU-002
    source_ru: RU-0017
    target_req: REQ-037
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved: true
      issue: 2158
      epic: 2156
      req: REQ-037
      files: [docs/requirements/REQ-037.md]
      artifact_action: ACT-REQ-003
      target_alias: new:intake-pipeline
      mapping_alias: intake REQ = REQ-037
      note: 旧 REQ-010-034〜040,050〜052 を REQ-037-001〜010 へ移動
  - ou_id: OU-003
    source_ru: RU-0017
    target_req: REQ-038
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved: true
      issue: 2159
      epic: 2156
      req: REQ-038
      files: [docs/requirements/REQ-038.md]
      artifact_action: ACT-REQ-004
      target_alias: new:learning-pipeline
      mapping_alias: learning REQ = REQ-038
      note: 旧 REQ-010-041〜044,061 を REQ-038-001〜005 へ移動
  - ou_id: OU-004
    source_ru: RU-0017
    target_req: REQ-039
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved: true
      issue: 2160
      epic: 2156
      req: REQ-039
      files: [docs/requirements/REQ-039.md]
      artifact_action: ACT-REQ-005
      target_alias: new:backlog-review
      mapping_alias: backlog-review REQ = REQ-039
      note: 旧 REQ-010-045〜049 を REQ-039-001〜005 へ移動
  - ou_id: OU-005
    source_ru: RU-0017
    target_req: REQ-010
    operation: update
    scale: large
    depends_on: [OU-001, OU-002, OU-003, OU-004]
    recommended_order: 2
    issue_policy: single
    result:
      saved: true
      issue: 2161
      epic: 2156
      req: REQ-010
      files: [docs/requirements/REQ-010.md]
      artifact_action: ACT-REQ-001
      note: docs-check 単体へ縮小（15行: 001〜012,059,060,062、行 ID は元番号維持）。AG-007 の分割由来参照再配線は case-run 実装工程の対象
  - ou_id: OU-006
    source_ru: RU-0017
    target_req: REQ-013
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    result:
      saved: true
      issue: 2163
      epic: 2162
      req: REQ-013
      files: [docs/requirements/retired/REQ-013.md]
      artifact_action: ACT-REQ-006
      note: RETIRE（status: migrated、履歴注記付き、本文は履歴として保持）
  - ou_id: OU-007
    source_ru: RU-0017
    target_req: REQ-022
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    result:
      saved: true
      issue: 2164
      epic: 2162
      req: REQ-022
      files: [docs/requirements/retired/REQ-022.md]
      artifact_action: ACT-REQ-007
      note: RETIRE（status: migrated、履歴注記付き、本文は履歴として保持）
  - ou_id: OU-008
    source_ru: RU-0017
    target_req: REQ-023
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    result:
      saved: true
      issue: 2165
      epic: 2162
      req: REQ-023
      files: [docs/requirements/retired/REQ-023.md]
      artifact_action: ACT-REQ-008
      note: RETIRE（status: migrated、履歴注記付き、本文は履歴として保持）
  - ou_id: OU-009
    source_ru: RU-0017
    target_req: REQ-024
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    result:
      saved: true
      issue: 2166
      epic: 2162
      req: REQ-024
      files: [docs/requirements/retired/REQ-024.md]
      artifact_action: ACT-REQ-009
      note: RETIRE（status: migrated、frontmatter 正規化で work_type: feature は除去、本文は履歴として保持）
  - ou_id: OU-010
    source_ru: RU-0017
    target_req: REQ-012
    operation: update
    scale: standard
    depends_on: [OU-006]
    recommended_order: 4
    issue_policy: single
    result:
      saved: true
      issue: 2167
      epic: 2162
      req: REQ-012
      files: [docs/requirements/REQ-012.md]
      artifact_action: ACT-REQ-010
      note: 関連情報の REQ-013 参照を履歴注記へ置換。それ以外の本文変更なし

# test_strategy: 各合意項目（AG-*）の検証方法。各項目は3要素（verification / pass_criteria / on_failure）を必須とする
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      req-save 実行後、docs/requirements/REQ-010.md を読み、要件テーブル行を集計する。
      タイトルと目的文が docs-check 単体へ縮小されていることを確認する。/repo/docs-check を実行する。
    pass_criteria: |
      要件行数が15行（REQ-010-001〜012、059、060、062）であり、保持行の本文が旧本文と一致する。
      タイトルが「自己監査コマンド（docs-check）」、目的文に inspect 系・REQ-008・REQ-001・REQ-028 の
      委譲境界が明記されている。docs-check が当該ファイルに関して pass する。
    on_failure: |
      fix-and-reverify。保存内容を修正して再保存する（req-save の idempotent 再実行）。
      draft のマッピング表と実ファイルの乖離が原因のため、draft 側ではなく適用結果側を修正する。
  - id: TS-002
    target_item: AG-002
    verification: |
      新規作成された inspect 系 REQ ファイルの要件テーブル22行を旧 REQ-010-013〜017、018〜023、024〜028、
      029〜033、058 の各行本文と突合する。目的文の DEC-006 正規化単位の明記と関連情報の相互参照を確認する。
    pass_criteria: |
      22行すべての本文が旧本文と一致（ID は新採番）。行順が AG-002 の対応どおり。
      目的文に DEC-006 の3-command 正規化単位である旨、関連情報に REQ-010（severity・gate_level 軸の相互管理）と
      REQ-008 への参照が存在する。
    on_failure: |
      fix-and-reverify。該当行を旧本文へ修正して再検証する。
  - id: TS-003
    target_item: AG-003
    verification: |
      新規作成された intake REQ の要件テーブル10行を旧 REQ-010-034〜040、050〜052 の各行本文と突合する。
      関連情報の capture-boundaries SPEC 導線を確認する。
    pass_criteria: |
      10行すべての本文が旧本文と一致（ID は新採番）。関連情報に capture-boundaries SPEC と REQ-008 への参照が存在する。
    on_failure: |
      fix-and-reverify。該当行を旧本文へ修正して再検証する。
  - id: TS-004
    target_item: AG-004
    verification: |
      新規作成された learning REQ の要件テーブル5行を旧 REQ-010-041〜044、061 の各行本文と突合する。
    pass_criteria: |
      5行すべての本文が旧本文と一致（ID は新採番）。関連情報に capture-boundaries SPEC と REQ-008 への参照が存在する。
    on_failure: |
      fix-and-reverify。該当行を旧本文へ修正して再検証する。
  - id: TS-005
    target_item: AG-005
    verification: |
      新規作成された backlog-review REQ の要件テーブル5行を旧 REQ-010-045〜049 の各行本文と突合する。
    pass_criteria: |
      5行すべての本文が旧本文と一致（ID は新採番）。関連情報に REQ-008 と backlog-artifact-lifecycle SPEC
      への参照が存在する。
    on_failure: |
      fix-and-reverify。該当行を旧本文へ修正して再検証する。
  - id: TS-006
    target_item: AG-006
    verification: |
      docs/requirements/retired/ 配下に REQ-013.md、REQ-022.md、REQ-023.md、REQ-024.md が存在し、
      旧パス（docs/requirements/ 直下）に同名ファイルが存在しないことを確認する。
      check_integrity の retired 系 check（retired-frontmatter-filename、retired-required-fields、
      active-retired-duplication、req-retired-index）の結果を確認する。
    pass_criteria: |
      4ファイルとも retired/ に存在し、frontmatter status が正規化語彙（migrated）で後継明示の履歴注記がある。
      README の AUTOGEN retired 表に4行が登録される。retired 系 check に ng が0件。
    on_failure: |
      fix-and-reverify。retired 必須字段または注記を修正して check_integrity を再実行する。
  - id: TS-007
    target_item: AG-007
    verification: |
      grep により docs/** 全域の REQ-010-013〜058 および REQ-010-061 への参照残存を検出する。
      bun で check_integrity.ts --json を実行し、/repo/docs-check を実行する。
      AUTOGEN ブロック（docs/README.md、docs/requirements/README.md、req-health-metrics.md 計測例）の
      鮮度を確認する。
    pass_criteria: |
      旧位置（REQ-010 の 013〜058、061 行）への参照残存が0件（監査記録の履歴文脈注記付き維持分を除き、
      それらは check_integrity の警告対象外）。REQ-013、REQ-022、REQ-023、REQ-024 への現行参照に
      retired 系の ng または警告が0件。check_integrity と docs-check が共に pass（または既知 baseline と
      同等）。AUTOGEN の再生成が完了している。
    on_failure: |
      fix-and-reverify。置換漏れをマッピング表へ照合して修正し、再実行する。
  - id: TS-008
    target_item: AG-008
    verification: |
      REQ-010 と新規4 REQ の関連情報セクションに第一参照導線（REQ-008、workflow-contracts SPEC、
      DEC-006、capture-boundaries SPEC、backlog-artifact-lifecycle SPEC の該当組）が存在することを確認する。
    pass_criteria: |
      全5 REQ（REQ-010、inspect 系、intake、learning、backlog-review）の関連情報に REQ-008 参照がある。
      inspect 系に DEC-006 参照、intake と learning に capture-boundaries SPEC 参照、
      backlog-review に backlog-artifact-lifecycle SPEC 参照がある。
    on_failure: |
      fix-and-reverify。関連情報の導線を補って再検証する。

# review_dispositions: 採否判断（covered / rejected 等）の記録。optional soft-contract
review_dispositions:
  - id: RD-001
    source_ru: RU-0017
    source_item: F-13
    disposition: covered
    reason_code: adopted_with_modification
    reason: |
      REQ-010 の SPLIT 候補指摘は A案5分割（command family 単位）として採用した。
      修正点として、REQ-010 は RETIRE せず docs-check 単体へ縮小 UPDATE とし、保持行は元番号維持とした
      （参照安定性と安全な失敗モードの確保）。診断系横断責務を1 REQ に束ねる設計判断の可能性については、
      系契約は既存正規所有者（REQ-008、workflow-contracts、backlog-artifact-lifecycle）が保持するため
      1 REQ 束ねの必然性は消失したと判断した。
    evidence:
      path: .agentdev/backlog/req-units/RU-0017.md
      section: Sources
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0017
    source_item: F-14
    disposition: covered
    reason_code: resolved_differently
    reason: |
      Artifact Graph 系7 REQ の MERGE 候補指摘について、実態調査の結果 MERGE ではなく個別評価で解決した。
      REQ-013（DOC-MAP 依存除去、達成済み）、REQ-022（augmentation 配置先、SPEC が正規所有）、
      REQ-023（query 出力拡張、実装済み）、REQ-024（warning 分類、実装済み）の4件を RETIRE し、
      REQ-012（標準化中核、活性）、REQ-020（代表質問 fixture 未整備で達成未完了）、
      REQ-021（ワークフロー統合、現行利用中）の3件を維持する。破壊的な統合は行っていない。
    evidence:
      path: .agentdev/backlog/req-units/RU-0017.md
      section: Sources
      checked_at_commit: null
    related_removed_items: []

# case_open_hints: case-open 構成生成への参考情報（Issue 階層は case-open が決定する）
case_open_hints:
  epic_needed: true
  decomposition: |
    推奨 execution_unit 構成（2単位）:
    - EU-1（分割 + 全参照再配線）: OU-001〜005（4 REQ 新規 CREATE、REQ-010 縮小 UPDATE）と
      AG-007 の分割由来再配線（マッピング表適用、レンジ展開、タイトル併記更新、dangling 254/284 再配線、
      AUTOGEN 再生成）は参照整合のため単一 execution unit として原子適用すること。
      新規 REQ のみを先行マージした中間状態は DUPLICATE 検証（重複所有）で失敗するため分割不可。
      コミット分割は可（マージ時点で整合すればよい）。
    - EU-2（RETIRE + クリーンアップ）: OU-006〜010（4 REQ RETIRE、REQ-012 関連情報クリーンアップ）と
      AG-007 の RETIRE 由来整理（retired 4 REQ への現行参照の履歴注記化または除去、AUTOGEN 再生成）。
    依存: EU-1 と EU-2 に必須依存はないが、同一 SPEC ファイルの編集重なりによるコンフリクト回避のため
    順次実行を推奨する。最終 Issue 構成は case-open が決定する。
  wave_hints:
    - "Wave 1: EU-1（OU-001〜005 + 分割由来参照再配線）"
    - "Wave 2: EU-2（OU-006〜010 + RETIRE 由来参照整理）"
```

# summary

RU-0017（REQ 体系構造協議）の要件化結果。REQ-010 の5分割（A案、command family 単位）、Artifact Graph 系4 REQ の RETIRE、全参照再配線（396箇所、マッピング表添付）を合意した。

Decision 判断: 不要と判断した。分割単位は req-health-metrics の関心分類（複数 command family 混在シグナル）と DEC-006 の正規化単位という既存規範の適用であり、RETIRE は req-structure-diagnostics の標準観点に従う.lifecycle 操作である。新規のアーキテクチャコミットメントを含まないため agentdev-decision-guidelines の閾値に達しない（作業手段 Decision 拒否ゲート該当）。

経路A adversarial-review を実施し、9件の finding を採用反映（AUTOGEN 両実行単位への完了条件追加、レンジ表記置換規則、severity 軸の相互参照、retired frontmatter 正規化、DEC-006 単位の目的文明記、capture-boundaries 導線、監査記録の注記付き維持優先、タイトル併記更新、execution_unit 原子性制約）、2件を撤回した。
