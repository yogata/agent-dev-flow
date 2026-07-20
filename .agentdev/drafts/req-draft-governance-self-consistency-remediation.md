---
draft_type: req_draft
topic_slug: governance-self-consistency-remediation
status: saved
created_at: '2026-07-20T20:42:28+09:00'
---

# draft-data

```yaml
work_type: maintenance
scale: large
spec_artifact_actions_consumed: true
summary: 統合再編後に残るREQ・ADR・SPEC・command・checker・索引の自己不整合を、既存正規所有者の更新と一回限りの横断是正で解消する。新規REQ・ADR・SPECは作成しない。
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []
agreed_items:
- id: AG-001
  content: 廃止REQは物理削除を第一選択とし、履歴参照用途に限定してretired配下への移動も選択できる。REQ-0101-002を基準とし、REQ-0109-002を同一方針へ整合させる。
- id: AG-002
  content: 現行REQは目的・要件・適用範囲の3セクションだけを持ち、変更履歴、分割履歴、Issue/PR/RU由来、Source RU、関連情報等の補助節を保持しない。移行関係だけをmapping-table.mdが所有し、その他の履歴はgit・Issue・PRへ委ねる。frontmatter
    updatedは日付だけを保持する。
- id: AG-003
  content: SPECライフサイクルはdraft・accepted・supersededの3状態とする。状態の意味と検査対象はdocument-model.md、frontmatter形式はpatterns.md、採用判断と理由はADR-0123、集約表示はdocs/specs/README.mdがそれぞれ所有する。
- id: AG-004
  content: superseded_byを持つSPECは現行契約参照およびdocs-check・inspect-docsの通常検査対象から除外する。check_changed_docs.ts、spec-save command/SPEC、関連テストを3状態契約へ整合させる。
- id: AG-005
  content: req-saveはwork_typeやOU件数で処理可否を固定分岐せず、REQ/ADR対象artifact_actionsの有無と種別で処理する。OU ID指定時だけ指定範囲へ限定し、未指定時は全REQ/ADR対象artifact_actionsを処理する。
- id: AG-006
  content: SPECを正規原本、SKILL.mdを実行入口および補完情報保持文書、extensionをプロジェクト固有補完とする。DERIVE表現と段階的作業計画を現行REQ・accepted SPECから除去し、REFERENCE関係と補完関係を分離する。
- id: AG-007
  content: 索引自動生成SPECは現在自動生成・現在人手管理・現在混合の領域だけを記述する。Decision Map、トピック別ビュー、関連REQ表は現在人手管理とし、未実装の自動生成を現在契約として宣言しない。ADR関連REQ表へADR-0137とREQ-0114の関係を追加する。
- id: AG-008
  content: SPEC行数はfrontmatter、HTMLコメント、AUTOGENブロックを除外して計測する。spec-health-metrics.mdを計測定義の正本とし、index-auto-generation.mdおよび生成実装と一致させる。
- id: AG-009
  content: Project Extensionsは、REQ-0160の安定外部契約、project-extensions.mdのschema・配置・読込・標準診断、integrity-rule-catalog.mdのスキーマと索引、個別IR文書の検知詳細、repo-local
    skillの本体固有実行へ分離する。IR-059を検知パターン・exemption・severityの正本とする。
- id: AG-010
  content: REQ-0152とREQ-0153は現在契約だけを記述し、新設・新規登録・PR事例等の作業履歴を除去する。実在しないmechanical-replacement-rules.mdへの参照は残さず、新規SPECも作成しない。
- id: AG-011
  content: 本ドラフトでは新規REQ・新規ADR・新規SPECを作成しない。既存所有者へ吸収できない独立契約が検出された場合は実行を停止し、別のreq-define入力として報告する。
- id: AG-012
  content: 一回限りの横断純化、command/script/test修正、索引再生成はimplementation_scopeに確定済み作業として記録する。artifact_actionsはREQ・ADR・SPECの現在契約を変更する保存対象だけを保持する。
artifact_actions:
- id: ACT-REQ-001
  artifact: req
  operation: update
  target: docs/requirements/REQ-0101.md
  target_area: REQ-0101-076
  edit_mode: replace_requirement_row
  source_items:
  - AG-003
  content: '| REQ-0101-076 | SPECライフサイクルは `draft`、`accepted`、`superseded` の3状態を持ち、`superseded` はfrontmatter `superseded_by`で後継SPECを示すこと。`active`
    はstatus値ではなく `draft` と `accepted` をまとめる概念としてのみ使用すること |'
- id: ACT-REQ-002
  artifact: req
  operation: update
  target: docs/requirements/REQ-0102.md
  target_area: REQ-0102-039〜041,046〜047,070
  edit_mode: replace_requirement_rows
  source_items:
  - AG-005
  content: '| REQ-0102-039 | `req-save` はOU ID指定時に、指定OUに属するREQ/ADR対象`artifact_actions`だけを処理すること |

    | REQ-0102-040 | `req-save` はOU ID未指定時に、draft全体のREQ/ADR対象`artifact_actions`を処理すること |

    | REQ-0102-041 | `req-save` はOUが複数存在することだけを理由に停止せず、REQ/ADR対象`artifact_actions`が存在しない場合はno-opとして完了すること |

    | REQ-0102-046 | 後続コマンドの実行可否は`work_type`固定分岐ではなく、`artifact_actions`の有無と`artifact`種別で決定すること |

    | REQ-0102-047 | 全work_typeのdraftは、`artifact_actions`の種別に応じて`req-save`、`spec-save`、`case-open`、`case-auto`の入力として扱われること
    |

    | REQ-0102-070 | `req-define` はdraft保存後に`auto_gate`を確認し、`auto_ready: false`または`unresolved_questions`、`unresolved_conflicts`、`out_of_repo_operations`、`stop_reasons`のいずれかが残る場合、壁打ちを継続して解消すること
    |'
- id: ACT-REQ-003
  artifact: req
  operation: update
  target: docs/requirements/REQ-0109.md
  target_area: REQ-0109-002
  edit_mode: replace_requirement_row
  source_items:
  - AG-001
  content: '| REQ-0109-002 | 現行判断から外れた旧REQは物理削除を第一選択とし、履歴参照用途に限定して `docs/requirements/retired/REQ-{NNNN}.md` へ移動する選択肢も持つこと。retired配下のREQは現行要件判断に使用しないこと
    |'
- id: ACT-REQ-004
  artifact: req
  operation: update
  target: docs/requirements/REQ-0136.md
  target_area: REQ-0136-010,012,014
  edit_mode: replace_requirement_rows
  source_items:
  - AG-003
  - AG-004
  - AG-005
  content: '| REQ-0136-010 | `req-define` はSPEC保存対象をdraft-dataの`artifact_actions`へ分離し、各actionに既存SPECパスまたは構造化`target_spec`、operation、target_area、保存本文を保持すること
    |

    | REQ-0136-012 | `/agentdev/spec-save` はdraft-dataのSPEC対象`artifact_actions`をSPECへ保存し、SPECライフサイクルの `draft`、`accepted`、`superseded`
    契約と整合すること |

    | REQ-0136-014 | `case-auto` は `req-save`、`spec-save`、`case-open`、`case-run`、`case-close` の順で実行し、各保存コマンドの実行可否を対象`artifact_actions`の有無で判断すること
    |'
- id: ACT-REQ-005
  artifact: req
  operation: update
  target: docs/requirements/REQ-0140.md
  target_area: REQ-0140-026,032,041,042
  edit_mode: replace_requirement_rows
  source_items:
  - AG-006
  content: '| REQ-0140-026 | `docs/**`（廃止REQを除く）、`AGENTS.md`、`src/opencode/{commands,skills}`の自然言語記述は、文書種別責務と日本語執筆規範に準拠すること。YAML
    frontmatter、fenced code block、URL、ファイルパス等の構造データは機械的なbackticks付与対象外とすること |

    | REQ-0140-032 | `agentdev-doc-writing` はSKILL.mdの概要節と機能節の重複を恒常的な査読対象とし、重複度合いと文書影響度に基づいて査読対象を分類すること。分類基準の詳細は`document-type-responsibilities.md`に配置すること
    |

    | REQ-0140-041 | 各SKILL.mdは対応するSPECを正規原本として参照し、自身は実行入口と補完情報保持文書として機能すること |

    | REQ-0140-042 | SPECとSKILL.mdはREFERENCE関係、extensionとSKILL.mdは補完関係として区別し、extensionは標準SKILL.mdを上書きせずプロジェクト固有情報だけを追加すること
    |'
- id: ACT-REQ-006
  artifact: req
  operation: update
  target: docs/requirements/REQ-0152.md
  target_area: '## 目的'
  edit_mode: replace_from_heading_to_eof
  source_items:
  - AG-010
  content: '## 目的


    gh CLI直接呼出しの機械検出ルール（IR-053）により、command/skill定義への委譲漏れをdocs-checkで検出する。inspect-skillsの意味的診断と協調し、command/skill追加時の検出漏れを抑制する。


    ## 要件


    | ID | 要件 |

    |---|---|

    | REQ-0152-001 | `docs-check`はcommand/skill定義中のgh CLI直接呼出しをIR-053に基づいて機械検出すること |

    | REQ-0152-002 | IR-053の検出範囲と除外対象は、inspect-skillsの意味的診断および`agentdev-gh-cli`への委譲境界と整合すること |

    | REQ-0152-003 | `case-close`のPR状態取得処理は`agentdev-gh-cli`への委譲を使用し、gh CLIを直接呼び出さないこと |


    ## 適用範囲


    - **対象**: command/skill定義中のgh CLI直接呼出し検出、IR-053、`check_integrity.ts`、検査対象command/skill原本

    - **対象外**: inspect-skills診断観点の変更、`agentdev-gh-cli`許容ファイルの追加・削除、意味判断を要する委譲適否判定'
- id: ACT-REQ-007
  artifact: req
  operation: update
  target: docs/requirements/REQ-0153.md
  target_area: '## 目的'
  edit_mode: replace_from_heading_to_eof
  source_items:
  - AG-010
  content: '## 目的


    機械的テキスト置換または複数ディレクトリを横断する是正では、置換漏れと回帰を完了宣言前に検出できる証拠を保持する。


    ## 要件


    | ID | 要件 |

    |---|---|

    | REQ-0153-001 | `case-run`は機械的テキスト置換または複数ディレクトリを横断する是正について、意味論的に妥当な対象範囲で再検索結果が0件であることを完了証拠とすること。構造データを誤って置換対象に含めて得た0件は完了証拠として扱わないこと
    |

    | REQ-0153-002 | `case-run`は再検索結果と対象範囲の妥当性をPR本文へ記録すること |


    ## 適用範囲


    - **対象**: 機械的テキスト置換、複数ディレクトリ横断是正、QG-3/QG-4の完了証拠、PR本文への証拠記録

    - **対象外**: 個別置換パターン一覧、置換辞書、QG-3/QG-4の内部判定表、主ゲート体系の変更'
- id: ACT-REQ-008
  artifact: req
  operation: update
  target: docs/requirements/REQ-0154.md
  target_area: '## 目的'
  edit_mode: replace_from_heading_to_eof
  source_items:
  - AG-003
  - AG-004
  content: '## 目的


    SPECの `draft`、`accepted`、`superseded` の状態を単一の追跡情報源から視認可能にし、draft放置とstatus不整合を機械的に検出する。


    ## 要件


    | ID | 要件 |

    |---|---|

    | REQ-0154-001 | SPECの `draft`、`accepted`、`superseded` の状態が単一の追跡情報源から視認可能であり、複数索引でstatusを重複管理しないこと |

    | REQ-0154-002 | draft状態のSPECが放置されることをdocs-checkで機械検出できること。検出閾値と判定詳細は個別IR文書が所有すること |

    | REQ-0154-003 | `docs/specs/README.md`は基盤SPECを含む全SPECのstatusを追跡し、`superseded`を含む3状態を表示すること |

    | REQ-0154-004 | 新規SPEC追加、status変更、superseded宣言時に`docs/specs/README.md`を実ファイルと整合させ、登録漏れまたはstatus不一致をdocs-checkで検出すること
    |


    ## 適用範囲


    - **対象**: SPEC status追跡、draft放置検出、superseded表示、索引整合

    - **対象外**: 個別SPECのstatus判断、status遷移の内部アルゴリズム、検出閾値の具体値'
- id: ACT-REQ-009
  artifact: req
  operation: update
  target: docs/requirements/REQ-0160.md
  target_area: '# Project Extensions 機構と配布物参照境界'
  edit_mode: replace_body_preserve_frontmatter
  source_items:
  - AG-009
  content: '## 目的


    Project Extensionsは、標準command/skillをプロジェクト非依存に保ったまま、プロジェクト固有の文脈、規約、検査、受け入れゲート、禁止事項を追加する設定層である。本REQは機構の安定外部契約と配布物参照境界を定める。


    ## 要件


    | ID | 要件 |

    |---|---|

    | REQ-0160-001 | Project Extensionsは `.agentdev/extensions/commands/<command>.yaml` と `.agentdev/extensions/skills/<skill>.yaml`
    に配置され、`context`、`rules`、`checks`、`acceptance_gates`、`must_not` を持つ宣言データ層であること |

    | REQ-0160-002 | command/skillは自身に対応するextensionだけを読み、extensionが存在しない場合または破損している場合も標準動作を維持すること |

    | REQ-0160-003 | extensionは標準command/skillを上書きせず、プロジェクト固有情報だけを追加すること |

    | REQ-0160-004 | `rules`と`checks`はproject-local skillへ委譲でき、AgentDevFlow標準は委譲記法と読込境界を提供すること |

    | REQ-0160-005 | 配布command/skill本文はプロジェクト固有のADR/REQ/SPEC具体ID、具体パス、固定URLに依存せず、traceabilityはextensionで補完すること |

    | REQ-0160-006 | `agentdev-project-extensions`はextension探索、構造読込、不在・破損時処理、追加関係の解釈を提供すること |

    | REQ-0160-007 | `/agentdev/inspect-extensions`はextension一覧、schema、配置、ID、参照path、委譲先skill、旧機構残存、上書き意図を診断すること |

    | REQ-0160-008 | Project Extensionsのschema・配置・読込・標準診断は`project-extensions.md`、整合性ルールのスキーマと索引は`integrity-rule-catalog.md`、個別検知パターン・exemption・severityは個別IR文書が所有すること
    |

    | REQ-0160-009 | agent-dev-flow本体固有の持続的検査はrepo-local skillが所有し、AgentDevFlow標準機構の必須構成としないこと |


    ## 適用範囲


    - **対象**: Project Extensionsの配置、読込、追加関係、project-local skill委譲、標準skill/command、配布物参照境界、正規所有者分離

    - **対象外**: 個別IR番号、正規表現、exemption条件、severity、repo-local検査実装、導入先固有のextension内容'
- id: ACT-ADR-001
  artifact: adr
  operation: update
  target: docs/adr/ADR-0123.md
  target_area: '## 背景'
  edit_mode: replace_from_heading_to_eof
  source_items:
  - AG-003
  - AG-004
  - AG-011
  content: '## 背景


    REQとSPECの責務分離を実行可能にするには、SPEC保存をREQ保存から分離し、未確定・確定・後継移行済みの状態を区別する必要がある。


    ## 決定


    1. SPECは `draft`、`accepted`、`superseded` の3状態を持つ。

    2. SPEC状態の意味、検査対象、遷移契機は`document-model.md`、frontmatter形式は`patterns.md`が所有する。

    3. `/agentdev/spec-save`をSPEC保存の独立入口とし、REQ/ADR保存を担う`req-save`と責務を分離する。

    4. `req-define`はSPEC保存対象をdraft-dataの`artifact_actions`へ分離し、`spec-save`はSPEC対象actionを処理する。

    5. `case-close`は実装とSPECの整合確認後に `draft` から `accepted` への昇格を扱う。

    6. 後継SPECへ移行したSPECは元位置を保持し、`superseded_by`で後継を示す。


    ## 理由


    - REQは満たすべき状態、SPECは現在仕様を所有するため、保存入口も分離する必要がある。

    - `draft`と`accepted`だけでは後継SPECへの移行済み状態を表現できない。

    - 状態定義とfrontmatter形式をSPECへ置くことで、ADRを決定と理由に限定できる。


    ## 結果


    - ワークフローは `req-define`、`req-save`、`spec-save`、`case-open`、`case-run`、`case-close` の順に接続される。

    - SPEC対象actionがない場合、`spec-save`はno-opとして完了できる。

    - `superseded` SPECは現行契約参照と通常内容検査の対象外となる。

    - 既存のSPEC責務境界と実行時非依存性は維持される。


    ## 代替案


    - `req-save`へSPEC保存を統合する案は、REQ保存とSPEC保存の責務を混在させるため採用しない。

    - SPECをdraft内に残してcase-runで反映する案は、保存経路を標準化できないため採用しない。'
- id: ACT-SPEC-001
  artifact: spec
  operation: update
  target: docs/specs/foundations/document-model.md
  target_area: '### SPEC ライフサイクル（ADR-0123）'
  source_items:
  - AG-003
  - AG-004
  content: '### SPEC ライフサイクル（ADR-0123）


    SPECはfrontmatter `status`で成熟度と現行性を管理する。状態は `draft`、`accepted`、`superseded` の3つである。frontmatter形式は`patterns.md`が所有する。


    | status | 意味 | 通常内容検査 | 遷移契機 |

    |---|---|---|---|

    | `draft` | spec-saveで保存された未確定状態 | 境界違反等の確定SPEC向け検査対象外 | 新規SPEC保存時 |

    | `accepted` | 実装との整合確認を通過した現在仕様 | 通常の整合性検査対象 | case-closeで確定時 |

    | `superseded` | 後継SPECへ移行済みの状態 | docs-check・inspect-docsの通常内容検査対象外 | 後継SPECを確定し`superseded_by`を設定時 |


    - statusがない既存SPECは後方互換のため`accepted`相当として扱う。

    - `superseded`は元位置を維持し、`superseded_by`で後継SPECを示す。

    - `superseded_by`の存在を通常検査対象外判定に使用する。

    - `draft`から`accepted`への昇格はcase-close、後継移行時の`superseded`設定はspec-saveまたはcase-closeの確定処理が扱う。'
- id: ACT-SPEC-002
  artifact: spec
  operation: update
  target: docs/specs/foundations/document-model.md
  target_area: '## 設定規則'
  source_items:
  - AG-003
  content: '## 設定規則


    | 規則 | 内容 |

    |---|---|

    | REQ ID | 4桁ゼロ埋めの安定ID。現行・廃止を問わず再利用しない |

    | ADR ID | 4桁ゼロ埋め。状態はfrontmatterで管理する |

    | SPEC配置 | `docs/specs/**/*.md` |

    | SPEC status | `draft`、`accepted`、`superseded`。status欠落は`accepted`相当。`superseded`は`superseded_by`を必須とする |

    | Guides配置 | `docs/guides/*.md` |

    | 廃止REQ | 物理削除を第一選択とし、履歴参照用途に限定してretired配下への移動も選択できる |

    | 廃止ADR | 物理削除を第一選択とし、履歴参照用途に限定してretired配下への移動も選択できる |'
- id: ACT-SPEC-003
  artifact: spec
  operation: update
  target: docs/specs/foundations/document-model.md
  target_area: '### ライフサイクル規則 <!-- REQ-0101 -->'
  source_items:
  - AG-003
  content: '### ライフサイクル規則 <!-- REQ-0101 -->


    | 文書種別 | 状態遷移 | 備考 |

    |---|---|---|

    | REQ | created → active → superseded / partially superseded | APPEND/UPDATEで拡張し、旧REQから現行REQへの移行関係はmapping-tableで追跡する
    |

    | ADR | proposed → accepted → superseded / deprecated | acceptedだけを現行判断の根拠とする |

    | SPEC | draft → accepted → superseded | 後継SPECへの移行表示は`superseded_by`で保持する |

    | Guide | active → outdated → removed | 規範的権限を持たない |

    | Report | published → archived | 事実記録として扱う |

    | DOC-MAP | always active | 探索索引として更新だけを行う |'
- id: ACT-SPEC-004
  artifact: spec
  operation: update
  target: docs/specs/foundations/patterns.md
  target_area: '## REQ frontmatter 規約'
  source_items:
  - AG-002
  - AG-003
  content: '## REQ frontmatter 規約


    REQ文書のfrontmatterは以下のフィールドを持つ。


    ```yaml

    ---

    id: REQ-{NNNN}

    title: {領域タイトル}

    created: {YYYY-MM-DD}

    updated: {YYYY-MM-DD}

    ---

    ```


    - 許可フィールドは`id`、`title`、`created`、`updated`だけとする。

    - `id`は`REQ-{NNNN}`、要件行IDは`REQ-{NNNN}-{MMM}`形式とする。


    ### REQ セクション構成


    ```markdown

    ## 目的


    {この領域の要件が存在する理由}


    ## 要件


    | ID | 要件 |

    |---|---|

    | REQ-{NNNN}-001 | {検証可能な要件} |


    ## 適用範囲


    - **対象**: ...

    - **対象外**: ...

    ```


    REQファイルは`## 目的`、`## 要件`、`## 適用範囲`の3セクションだけを持つ。`## 関連情報`、`## Requirement Source`、`## Update Notes`、`## 関連ドキュメント更新候補`、変更履歴節は持たない。


    ### SPEC frontmatter 形式


    SPEC frontmatterは`title`、`status`、`created`、`updated`を基本とする。`status`は`draft`、`accepted`、`superseded`のいずれかとする。`superseded`では後継SPECのリポジトリ相対パスを`superseded_by`へ記録する。status欠落は後方互換のため`accepted`相当として扱う。'
- id: ACT-SPEC-005
  artifact: spec
  operation: update
  target: docs/specs/responsibilities/document-type-responsibilities.md
  target_area: '### SKILL.md 原本節フォーマット（DERIVE 機構）'
  source_items:
  - AG-006
  content: '### SKILL.md 原本節フォーマット（REFERENCE関係）


    SKILL.mdは対応するSPECへの参照、SKILL.md自身の実行入口としての責務、extensionとの補完関係を示す。


    1. 対応するSPECへの参照リンクを持つ。

    2. SPECを正規原本、SKILL.mdを実行入口と補完情報保持文書とするREFERENCE関係を宣言する。

    3. extensionは標準SKILL.mdを上書きせず、プロジェクト固有情報だけを追加することを宣言する。


    SKILL.mdはSPEC内容を再記述せず、実行時に必要な入口、トリガー、参照資料、補完情報だけを保持する。'
- id: ACT-SPEC-006
  artifact: spec
  operation: update
  target: docs/specs/responsibilities/document-type-responsibilities.md
  target_area: '### U-012 解消パターン（extension と SKILL.md の関係）'
  source_items:
  - AG-006
  content: '### U-012 解消パターン（extensionとSKILL.mdの関係）


    - **正規原本**: 対応するSPEC

    - **実行入口**: 標準SKILL.md

    - **プロジェクト固有補完**: extension


    同じ内容をSPEC、SKILL.md、extensionへ重複記載しない。SKILL.mdはSPECを参照し、extensionは標準SKILL.mdの固定知識外にあるプロジェクト固有情報だけを提供する。'
- id: ACT-SPEC-007
  artifact: spec
  operation: update
  target: docs/specs/responsibilities/document-type-responsibilities.md
  target_area: '## SKILL.md 重複查読の優先度基準と段階的スケジュール'
  source_items:
  - AG-006
  content: '## SKILL.md概要節と機能節の役割分担


    SKILL.mdの概要節は入口として役割と利用条件を簡潔に示し、機能節は具体的な対象、対象外、判断基準、参照先を追加する。概要節と機能節の重複は`agentdev-doc-writing`の恒常的な査読対象とする。


    査読対象の分類は重複度合いと文書影響度に基づく。固定件数、実施順序、段階的スケジュール、個別ファイル一覧は本SPECに保持しない。'
- id: ACT-SPEC-008
  artifact: spec
  operation: update
  target: docs/specs/integrity/index-auto-generation.md
  target_area: '## 適用範囲'
  source_items:
  - AG-007
  content: '## 適用範囲


    - **現在自動生成される領域**: 実装済みAUTOGENブロックで生成される件数、一覧、status別ビュー、IR索引、関連マッピング、メトリクス例

    - **現在人手管理される領域**: ADRトピック別ビュー、Decision Map、ADR関連REQ表、REQ移行判定

    - **現在混合管理される領域**: 自動生成列と人手管理列が同一表に共存し、生成実装が対象列だけを更新する領域

    - **対象外**: REQ、ADR、SPEC本文そのもの、および未実装の将来自動生成計画'
- id: ACT-SPEC-009
  artifact: spec
  operation: update
  target: docs/specs/integrity/index-auto-generation.md
  target_area: '## 自動生成の対象領域と生成元'
  source_items:
  - AG-007
  content: '## 自動生成の対象領域と生成元


    | 索引類 | 現在の管理 | 生成元 |

    |---|---|---|

    | `docs/requirements/README.md`のREQ一覧・件数 | 自動生成 | REQ frontmatter |

    | `docs/adr/README.md`の基盤一覧・status別一覧・件数 | 自動生成 | ADR frontmatter |

    | `docs/adr/README.md`のトピック別ビュー・Decision Map・関連REQ表 | 人手管理 | ADR本文と人手判断 |

    | `docs/specs/README.md`のSPEC一覧・status列 | 現行実装に従う混合管理 | SPEC frontmatterと人手管理列 |

    | `docs/DOC-MAP.md`のインベントリ | 自動生成 | 実ファイル一覧 |

    | `docs/requirements/mapping-table.md`の移行判定 | 人手管理 | 旧REQから現行REQへの移行判断 |

    | integrity rule catalogとrule ownershipのAUTOGENブロック | 自動生成 | 個別IR文書 |

    | REQ/SPECメトリクス計測例 | 自動生成 | 対象文書の計測結果 |


    管理区分を変更する場合は、本SPEC、生成実装、検査実装を同時に整合させる。'
- id: ACT-SPEC-010
  artifact: spec
  operation: update
  target: docs/specs/integrity/index-auto-generation.md
  target_area: '### ステータス別ビュー、トピック別ビュー'
  source_items:
  - AG-007
  content: '### ステータス別ビュー、トピック別ビュー


    ステータス別ビューはADR frontmatterから自動生成する。トピック別ビュー、Decision Map、関連REQ表は現在人手管理とし、実装されていない生成処理を現在契約として扱わない。'
- id: ACT-SPEC-011
  artifact: spec
  operation: update
  target: docs/specs/quality/spec-health-metrics.md
  target_area: '## 測定対象と計測方法'
  source_items:
  - AG-008
  content: '## 測定対象と計測方法


    | メトリクス | 定義 | 計測方法 |

    |---|---|---|

    | SPEC行数 | SPECファイルの人手管理本文行数 | frontmatter、HTMLコメント、AUTOGENブロック全体を除外して計測する |

    | status放置期間 | draft状態のSPECが最終更新から経過した日数 | frontmatter `updated`から算出する |

    | ドメイン分類適合 | SPECが文書モデルの配置規則へ適合するか | ファイルパスとドメイン定義を照合する |


    AUTOGENブロックは`<!-- AUTOGEN:BEGIN:id=... -->`から対応する`<!-- AUTOGEN:END -->`までを除外する。本節をSPEC行数計測定義の正本とする。'
- id: ACT-SPEC-012
  artifact: spec
  operation: update
  target: docs/specs/foundations/project-extensions.md
  target_area: '## 配布物参照境界の検知パターン'
  source_items:
  - AG-009
  content: '## 配布物参照境界の責務分担


    本SPECはProject Extensionsのschema、配置、読込、標準診断、責務境界を所有する。配布command/skill本文の具体ID、具体パス、固定URLに対する検知パターン、exemption、severity、false-positive条件はIR-059個別文書が所有する。


    配布物参照境界の検出結果はgeneric表記への是正とextensionによるtraceability補完へ接続する。'
- id: ACT-SPEC-013
  artifact: spec
  operation: update
  target: docs/specs/integrity/rules/IR-056-project-extensions-integrity.md
  target_area: '# IR-056: project-extensions-integrity'
  source_items:
  - AG-009
  content: '# IR-056: project-extensions-integrity


    Project Extensionsのschema、配置、ID、参照path、委譲先skill、上書き意図、旧機構残存を検査する。本IR文書を検知詳細、exemption、severity、false-positive条件の正本とする。


    | Field | Value |

    |---|---|

    | rule_id | IR-056 |

    | description | `.agentdev/extensions/{commands,skills}/*.yaml`の構造、配置、ID、path、委譲先skill、上書き意図、旧機構残存を検査する |

    | severity | strict |

    | category | broken-reference |

    | detection_method | `check_extensions.ts`によるschema検証、配置・ID整合、path実在、委譲先skill存在、旧機構残存、上書き意図の検査 |

    | affected_artifacts | `.agentdev/extensions/commands/*.yaml`, `.agentdev/extensions/skills/*.yaml` |

    | related_req | REQ-0160 |

    | related_spec | `foundations/project-extensions.md`, `integrity-rule-catalog.md` |

    | gate_level | full-audit, delta-guard, impact-guard |

    | false_positive_risk | テンプレート例、検査対象宣言、repo-local領域をexemptionで抑制する |

    | regression_test | `check_extensions.test.ts`で各検査項目の正常・異常・exemption fixtureを検証する |

    | finding_route | intake |

    | triage_action | severityとgate契約に従ってfailまたはwarningとして処理する |

    | last_verified | 検証実行日を記録する |


    ## 検査項目


    1. extensionファイルの一覧化

    2. frontmatterと5セクションのschema適合

    3. kindと配置の整合

    4. IDと対象command/skillの対応

    5. `context.paths`の実在

    6. `rules.skill`と`checks.skill`の委譲先skill存在

    7. 旧`.agentdev/doc-inputs/**`の残存

    8. 標準command/skillの上書き意図


    ## exemption


    - テンプレートプレースホルダー

    - 検査対象を説明するpath宣言

    - repo-local検査実装


    ## IR-059との関係


    IR-056はProject Extensions構造を検査し、IR-059は配布物本文の具体参照を検査する。両者は独立した検出対象である。'
- id: ACT-SPEC-014
  artifact: spec
  operation: update
  target: docs/specs/integrity/rules/IR-059-distribution-reference-boundary.md
  target_area: '# IR-059: distribution-reference-boundary'
  source_items:
  - AG-009
  content: '# IR-059: distribution-reference-boundary


    配布command/skill本文に含まれるプロジェクト固有の具体ID、具体パス、固定URLを検出する。本IR文書を検知パターン、exemption、severity、false-positive条件の正本とする。


    | Field | Value |

    |---|---|

    | rule_id | IR-059 |

    | description | 配布command/skill本文の具体ID、具体パス、固定URLを検出する |

    | severity | strict |

    | category | canonical-conflict |

    | detection_method | 具体ID、具体パス、固定URLのパターン検出とテンプレートプレースホルダーexemption判定 |

    | affected_artifacts | `src/opencode/commands/**`, `src/opencode/skills/**` |

    | related_req | REQ-0160 |

    | related_spec | `foundations/project-extensions.md`, `integrity-rule-catalog.md` |

    | gate_level | full-audit |

    | false_positive_risk | テンプレート例、検査対象宣言、索引参照をexemptionで抑制する |

    | regression_test | 具体ID、具体パス、固定URL、各exemptionの正常・異常fixtureを検証する |

    | finding_route | intake |

    | triage_action | generic表記へ是正し、traceabilityをextensionで補完する |


    ## 検知対象


    - 具体ID: `ADR-NNNN`、`REQ-NNNN`、`REQ-NNNN-NNN`

    - 具体パス: `docs/adr/`、`docs/requirements/`、`docs/specs/`配下の具体ファイル

    - 固定URL: 特定owner/repositoryを含むGitHub blob、raw URL


    ## exemption


    - `{NNNN}`、`<NNNN>`、`<existing-spec>`、`<domain>`、`<command>`、`<spec>`、`<rule>`等のテンプレートプレースホルダー

    - 検査対象を説明するためのパターン定義と検査対象path宣言

    - 索引として許可されたREADME参照


    ## IR-056との関係


    IR-056はProject Extensions構造と配置を検査し、IR-059は配布物本文の具体参照を検査する。両者は独立した検出対象である。'
- id: ACT-SPEC-015
  artifact: spec
  operation: update
  target: docs/specs/commands/spec-save.md
  target_area: '## SPEC ライフサイクル'
  source_items:
  - AG-003
  - AG-004
  content: '## SPEC ライフサイクル


    `spec-save`は新規SPECへ`status: draft`を付与し、既存SPEC更新時はstatusを維持する。SPEC statusは`draft`、`accepted`、`superseded`である。


    - `draft`から`accepted`への昇格はcase-closeが扱う。

    - 後継SPECへの移行を確定する場合、元SPECへ`status: superseded`と`superseded_by`を設定する。

    - `superseded_by`を持つSPECは通常内容検査対象から除外する。

    - status欠落は後方互換のため`accepted`相当として扱う。'
- id: ACT-SPEC-016
  artifact: spec
  operation: update
  target: docs/specs/commands/req-save.md
  target_area: '## 現在の動作'
  source_items:
  - AG-005
  content: "## 現在の動作\n\n- Step 1: draft-dataの`artifact_actions`にREQ/ADR対象actionがあるか確認し、存在しない場合はno-opとして完了する。\n- Step 2: draftを読み、必須フィールドと入力hashを記録する。\n\
    - Step 3: draft構造、文書分類、許可範囲を検証する。\n  - OU ID指定時は指定OUに属するREQ/ADR対象actionだけを処理する。\n  - OU ID未指定時はdraft全体のREQ/ADR対象actionを処理する。\n\
    \  - OUが複数存在することだけを理由に停止しない。\n- Step 4: REQ/ADR actionを保存し、要件表、ID、frontmatter、採番結果を検証する。\n- Step 5: README、DOC-MAP、mapping-tableへの影響を確認し、派生文書を整合させる。\n\
    - Step 6: ADR actionを保存する。\n- Step 7: changed-docs検査を実行する。\n- Step 8: DOC-MAP影響を確認する。\n- Step 9: 許可パスとリモート同期を検証する。\n-\
    \ Step 10: draftの保存状態とOU resultを更新する。\n- Step 11: commit、pushする。\n- Step 12: 保存結果と次工程を報告する。"
- id: ACT-SPEC-017
  artifact: spec
  operation: update
  target: docs/specs/commands/spec-save.md
  target_area: '## targeted docs guard (REQ-0158-003)'
  source_items:
  - AG-004
  content: '## targeted docs guard (REQ-0158-003)


    SPEC保存工程では、変更されたSPECと連動する`docs/specs/README.md`、`docs/DOC-MAP.md`を`check_changed_docs.ts --workflow spec-save`で検査する。


    検査は以下を含む。


    - SPEC frontmatter必須項目

    - status値`draft`、`accepted`、`superseded`の妥当性

    - `superseded`時の`superseded_by`必須性

    - `superseded_by`保持SPECの通常内容検査対象外判定

    - SPEC READMEのstatus同期

    - SPECドメイン分類、リンク、DOC-MAP更新要否

    - command/skill/integrity SPECと対応原本・catalog・rule file・scriptの整合


    strict failureが存在する場合は修正して再実行する。'
implementation_scope:
- id: IMP-001
  source_items:
  - AG-002
  paths:
  - docs/requirements/REQ-*.md
  change: 全現行REQを横断し、`## 関連情報`、`## 変更履歴`、`## Update Notes`、`## Requirement Source`、`## 関連ドキュメント更新候補`、Source RU、Issue/PR/RU由来、SPLIT作業履歴を除去する。現在契約に必要な正式ID参照は維持する。
  verification: 禁止節・履歴パターンを横断検索し0件を確認する。
- id: IMP-002
  source_items:
  - AG-002
  paths:
  - docs/requirements/mapping-table.md
  change: '`## Active Set`を除去し、旧REQから現行REQへの移行判定・移行先・非移行理由だけを保持する。'
  verification: Active Setが存在せず、移行表が維持されることを確認する。
- id: IMP-003
  source_items:
  - AG-004
  paths:
  - src/opencode/commands/agentdev/spec-save.md
  - .opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts
  - .opencode/skills/repo-agentdev-integrity/scripts/**/*spec*test*.ts
  change: SPEC status妥当性をdraft・accepted・supersededへ拡張し、superseded_by保持SPECを通常内容検査対象外にする。command原本と配置先の同期を行う。
  verification: 3状態fixture、superseded_by除外fixture、status不正fixtureを実行する。
- id: IMP-004
  source_items:
  - AG-005
  paths:
  - src/opencode/commands/agentdev/req-save.md
  - docs/specs/commands/req-save.md
  - src/opencode/skills/agentdev-req-file-manager/scripts/**
  - 関連テスト
  change: OU ID未指定時にdraft全体のREQ/ADR対象artifact_actionsを処理し、OU複数件だけを理由に停止しない契約へ揃える。
  verification: OU 0件、1件、複数件、OU ID指定の回帰テストを実行する。
- id: IMP-005
  source_items:
  - AG-006
  paths:
  - src/opencode/skills/agentdev-*/SKILL.md
  - docs/specs/responsibilities/document-type-responsibilities.md
  change: DERIVE表現、固定ファイル件数、段階的スケジュールを除去し、SPEC正規原本・SKILL実行入口・extension補完の関係へ統一する。
  verification: '`DERIVE`、`段階的スケジュール`、固定件数の残存を検索し0件を確認する。'
- id: IMP-006
  source_items:
  - AG-007
  paths:
  - docs/adr/README.md
  change: 人手管理の関連REQ表へADR-0137とREQ-0114の関係を追加し、Decision Mapを人手管理として維持する。
  verification: accepted ADR全件の関連REQ表網羅性とADR-0137行を確認する。
- id: IMP-007
  source_items:
  - AG-003
  - AG-004
  - AG-007
  - AG-008
  paths:
  - docs/specs/README.md
  - docs/DOC-MAP.md
  - docs/README.md
  - docs/requirements/README.md
  - docs/specs/quality/spec-health-metrics.md
  change: 正規文書更新後に索引生成を実行し、3状態表示、件数、一覧、DOC-MAP導線、メトリクス例を再生成する。生成領域を手編集しない。
  verification: generate_indexes.tsを連続2回実行し、2回目差分0件を確認する。
- id: IMP-008
  source_items:
  - AG-009
  paths:
  - .opencode/skills/repo-agentdev-integrity/scripts/check_extensions.ts
  - .opencode/skills/repo-agentdev-integrity/scripts/check_extensions.test.ts
  change: IR-056とIR-059の所有境界に合わせ、Project Extensions構造検査と配布物具体参照検査を独立して検証する。
  verification: IR-056とIR-059の正常・異常・exemption fixtureを実行する。
- id: IMP-009
  source_items:
  - AG-010
  paths:
  - docs/requirements/REQ-0152.md
  - docs/requirements/REQ-0153.md
  change: 存在しないmechanical-replacement-rules.md参照、新設・新規登録、PR事例を除去し、リンク切れを残さない。
  verification: 対象2REQで変更操作語、Issue/PR番号、存在しないSPEC参照が0件であることを確認する。
- id: IMP-010
  source_items:
  - AG-011
  - AG-012
  paths:
  - repository-wide
  change: 新規REQ・ADR・SPECを作成せず、既存正規所有者の更新、実装整合、派生文書再生成だけを行う。
  verification: '`git diff --name-status --diff-filter=A`でREQ/ADR/SPEC新規ファイル0件を確認する。'
- id: IMP-011
  source_items:
  - AG-002
  - AG-003
  paths:
  - docs/specs/foundations/patterns.md
  change: 冒頭の「authoringドメインへの移管候補」「実移管の判断はcase-runで行う」という未決・将来表現を除去し、現在の所有関係だけを記述する。
  verification: case-run先送り、移管候補、将来予定の表現が0件であることを確認する。
conflict_resolutions:
- id: CR-001
  conflict: mapping-table.mdまたはfrontmatter updatedを一般的な履歴移送先として扱う案
  resolution: mapping-table.mdは旧REQから現行REQへの移行関係だけを所有し、updatedは日付だけを保持する。その他の履歴は移送せずgit・Issue・PRへ委ねる。
- id: CR-002
  conflict: ADR-0123をSPECライフサイクル現在仕様の正本とする案
  resolution: ADR-0123は3状態を採用する決定と理由だけを所有する。現在仕様はdocument-model.mdとpatterns.mdが分担する。既存決定の拡張としてADR-0123をUPDATEし、新規ADRは作成しない。
- id: CR-003
  conflict: Decision Mapを現在AUTOGENまたは混合領域とする案
  resolution: 現行generate_indexes.tsに生成処理がないため、Decision Mapは現在人手管理領域と確定する。
- id: CR-004
  conflict: 実在しないmechanical-replacement-rules.mdへREQ-0153の具体例を移送する案
  resolution: 当該参照と事例をREQから除去し、新規SPECは作成しない。必要性が別途確認された場合のみ別req-defineで扱う。
- id: CR-005
  conflict: 'docs/specs/README.md、DOC-MAP、ADR README、mapping-tableをartifact: specで直接編集する案'
  resolution: 索引・派生文書はimplementation_scopeの連動更新として扱い、artifact_actionsには正規REQ・ADR・SPECだけを置く。
- id: CR-006
  conflict: 既知のcommand・checker・test変更を検証失敗時のcase-run判断へ先送りする案
  resolution: req-save/spec-save command原本、対応SPEC、check_changed_docs.ts、関連テストをimplementation_scopeへ確定済み対象として記録する。
- id: CR-007
  conflict: 現行REQ全件の補助節削除を個別artifact_actionとして大量列挙する案
  resolution: 意味変更を伴わない横断純化はREQ-0101-060/070/071/073の実現作業としてimplementation_scopeへ分離する。意味変更を伴うREQだけをartifact_actionsに残す。
operation_units:
- ou_id: OU-001
  target_req: REQ-0101
  operation: update
  scale: standard
  depends_on: []
  recommended_order: 1
  issue_policy: single
  result: {}
- ou_id: OU-002
  target_req: REQ-0102
  operation: update
  scale: standard
  depends_on: []
  recommended_order: 2
  issue_policy: single
  result: {}
- ou_id: OU-003
  target_req: REQ-0109
  operation: update
  scale: standard
  depends_on: []
  recommended_order: 3
  issue_policy: single
  result: {}
- ou_id: OU-004
  target_req: REQ-0136
  operation: update
  scale: standard
  depends_on:
  - OU-001
  - OU-002
  recommended_order: 4
  issue_policy: single
  result: {}
- ou_id: OU-005
  target_req: REQ-0140
  operation: update
  scale: standard
  depends_on: []
  recommended_order: 5
  issue_policy: single
  result: {}
- ou_id: OU-006
  target_req: REQ-0152
  operation: update
  scale: standard
  depends_on: []
  recommended_order: 6
  issue_policy: single
  result: {}
- ou_id: OU-007
  target_req: REQ-0153
  operation: update
  scale: standard
  depends_on: []
  recommended_order: 7
  issue_policy: single
  result: {}
- ou_id: OU-008
  target_req: REQ-0154
  operation: update
  scale: standard
  depends_on:
  - OU-001
  recommended_order: 8
  issue_policy: single
  result: {}
- ou_id: OU-009
  target_req: REQ-0160
  operation: update
  scale: standard
  depends_on: []
  recommended_order: 9
  issue_policy: single
  result: {}
- ou_id: OU-010
  target_adr: ADR-0123
  operation: update
  scale: standard
  depends_on:
  - OU-001
  recommended_order: 10
  issue_policy: single
  result: {}
- ou_id: OU-011
  target_spec: docs/specs/foundations/document-model.md
  operation: spec-update
  scale: standard
  depends_on:
  - OU-001
  - OU-010
  recommended_order: 11
  issue_policy: single
  result: {}
- ou_id: OU-012
  target_spec: docs/specs/foundations/patterns.md
  operation: spec-update
  scale: standard
  depends_on:
  - OU-001
  recommended_order: 12
  issue_policy: single
  result: {}
- ou_id: OU-013
  target_spec: docs/specs/responsibilities/document-type-responsibilities.md
  operation: spec-update
  scale: standard
  depends_on:
  - OU-005
  recommended_order: 13
  issue_policy: single
  result: {}
- ou_id: OU-014
  target_spec: docs/specs/integrity/index-auto-generation.md
  operation: spec-update
  scale: standard
  depends_on: []
  recommended_order: 14
  issue_policy: single
  result: {}
- ou_id: OU-015
  target_spec: docs/specs/quality/spec-health-metrics.md
  operation: spec-update
  scale: standard
  depends_on:
  - OU-014
  recommended_order: 15
  issue_policy: single
  result: {}
- ou_id: OU-016
  target_spec: docs/specs/foundations/project-extensions.md
  operation: spec-update
  scale: standard
  depends_on:
  - OU-009
  recommended_order: 16
  issue_policy: single
  result: {}
- ou_id: OU-017
  target_spec: docs/specs/integrity/rules/IR-056-project-extensions-integrity.md
  operation: spec-update
  scale: standard
  depends_on:
  - OU-016
  recommended_order: 17
  issue_policy: single
  result: {}
- ou_id: OU-018
  target_spec: docs/specs/integrity/rules/IR-059-distribution-reference-boundary.md
  operation: spec-update
  scale: standard
  depends_on:
  - OU-016
  recommended_order: 18
  issue_policy: single
  result: {}
- ou_id: OU-019
  target_spec: docs/specs/commands/spec-save.md
  operation: spec-update
  scale: standard
  depends_on:
  - OU-011
  recommended_order: 19
  issue_policy: single
  result: {}
- ou_id: OU-020
  target_spec: docs/specs/commands/req-save.md
  operation: spec-update
  scale: standard
  depends_on:
  - OU-002
  recommended_order: 20
  issue_policy: single
  result: {}
test_strategy:
- id: TS-001
  target_item: AG-001
  verification: REQ-0101-002とREQ-0109-002を照合する。
  pass_criteria: 物理削除第一、retired移動は履歴参照選択肢、削除禁止なしで一致する。
  on_failure: 'action: fix-and-reverify

    reason: 本ドラフト内のREQ-0109更新で解消可能なため。'
- id: TS-002
  target_item: AG-002
  verification: 全現行REQで禁止補助節と履歴パターンを検索する。
  pass_criteria: 禁止補助節、Source RU、Issue/PR/RU由来、作業履歴が0件である。
  on_failure: 'action: fix-and-reverify

    reason: 検出ファイルを純化し、同じ検索を再実行する。'
- id: TS-003
  target_item: AG-003
  verification: REQ、ADR、document-model、patterns、SPEC README、DOC-MAP、spec-saveでstatus列挙を照合する。
  pass_criteria: 全てdraft・accepted・supersededで一致し、2状態またはactive status表現が残らない。
  on_failure: 'action: fix-and-reverify

    reason: 状態定義の不一致は本変更範囲内で解消する。'
- id: TS-004
  target_item: AG-004
  verification: check_changed_docsの3状態・superseded_by fixtureを実行する。
  pass_criteria: superseded_by保持SPECに通常内容検査warningがなく、不正statusはfailする。
  on_failure: 'action: fix-and-reverify

    reason: checkerまたはfixtureを修正して再実行する。'
- id: TS-005
  target_item: AG-005
  verification: req-saveのOU 0件・1件・複数件・ID指定テストを実行する。
  pass_criteria: OU未指定は全REQ/ADR action処理、ID指定は指定範囲だけ処理、対象なしはno-opとなる。
  on_failure: 'action: fix-and-reverify

    reason: command/SPEC/testを同一契約へ揃える。'
- id: TS-006
  target_item: AG-006
  verification: REQ-0140、document-type-responsibilities、SKILL.mdを横断検索する。
  pass_criteria: DERIVE、段階的スケジュール、固定件数が0件で、SPEC原本・SKILL入口・extension補完が一意である。
  on_failure: 'action: fix-and-reverify

    reason: 所有関係表現を修正して再検索する。'
- id: TS-007
  target_item: AG-007
  verification: index-auto-generationとgenerate_indexes.tsの実装ブロックを照合し、ADR READMEを確認する。
  pass_criteria: Decision Map等は人手管理、実装済み領域だけが自動生成、ADR-0137行が存在する。
  on_failure: 'action: fix-and-reverify

    reason: SPECまたは人手管理表を現在実装へ合わせる。'
- id: TS-008
  target_item: AG-008
  verification: spec-health-metricsと生成実装の行数計測を照合する。
  pass_criteria: frontmatter、HTMLコメント、AUTOGENブロック除外が一致する。
  on_failure: 'action: fix-and-reverify

    reason: 計測定義または実装を修正して再計測する。'
- id: TS-009
  target_item: AG-009
  verification: REQ-0160、project-extensions、catalog、IR-056、IR-059を照合する。
  pass_criteria: 具体検知詳細は個別IRだけが所有し、REQとProject Extensions SPECに重複しない。
  on_failure: 'action: fix-and-reverify

    reason: 重複所有を除去しIR fixtureを再実行する。'
- id: TS-010
  target_item: AG-010
  verification: REQ-0152とREQ-0153で新設・新規登録・Issue/PR番号・存在しないSPEC参照を検索する。
  pass_criteria: 対象パターンが0件で、現在契約だけが残る。
  on_failure: 'action: fix-and-reverify

    reason: 対象2REQの本文を再純化する。'
- id: TS-011
  target_item: AG-011
  verification: git差分の追加ファイルを確認する。
  pass_criteria: REQ、ADR、SPECの新規ファイルが0件である。
  on_failure: 'action: record-in-findings

    reason: 新規基準文書が必要な場合は本実行を停止し、別req-defineへ分離する。'
- id: TS-012
  target_item: AG-012
  verification: 全artifact_actions、implementation_scope、OU、source_items、target_areaを構造検査し、docs-checkと索引生成を実行する。
  pass_criteria: 未処理actionなし、docs-check failures/warnings 0件、生成2回目差分0件である。
  on_failure: 'action: fix-and-reverify

    reason: 本ドラフトの受け入れ条件を満たすまで該当変更を修正する。'
case_open_hints:
  epic_needed: true
  decomposition:
  - SPEC lifecycle・保存コマンド・検査実装の3状態整合
  - REQ体系とreq_draft消費契約の整合
  - SKILL REFERENCE関係と文書責務の整合
  - Project ExtensionsとIR所有境界の整合
  - 索引契約・メトリクス・派生文書の整合
  - 現行REQ全件の横断純化と最終検証
  wave_hints:
  - wave: 1
    items:
    - REQ/ADR/SPECの正規所有者更新
  - wave: 2
    items:
    - command/script/test実装の整合
    - 現行REQ横断純化
  - wave: 3
    items:
    - 索引再生成
    - docs-check
    - べき等性確認
    - 全体再検査
```

# summary

統合再編後の基準体系に残る自己不整合を、既存のREQ・ADR・SPECの正規所有者更新と、確定済みの実装・横断純化・索引再生成によって解消する。`auto_gate.auto_ready`は`true`であり、未解決質問、未解決衝突、リポジトリ外操作、停止理由はない。新規REQ・新規ADR・新規SPECは作成しない。
