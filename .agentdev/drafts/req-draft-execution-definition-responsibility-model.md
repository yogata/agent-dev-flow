---
draft_type: req_draft
topic_slug: execution-definition-responsibility-model
status: saved
created_at: 2026-08-24T21:10:00+09:00
source_rus: [RU-0001]
---

# draft-data

```yaml
work_type: feature

scale: large

summary: |
  RU-0001 に基づき、ADF 実行定義層の正規所有者を一意化する責務境界再編を要件化する。
  9 層正規所有モデル（Command / Workflow Skill / Capability Skill / Reference / Script /
  Custom Tool / Plugin・Hook / Template / REQ・Design）の確立、Command の thin 化
  （工程一覧・公開順序の要約の所有撤去）、型由来標準契約の継承と差分記述原則、
  決定的処理の Script / Custom Tool / Plugin・Hook / Template への移管、
  GitHub/Git I/O の Custom Tool 完全移管（agentdev-gh-cli スキルの I/O 正規経路としての
  役割廃止）、Gxx 連番制度の廃止と意味識別子体系への移行、強制機能の fail-closed、
  Tool/Plugin/Hook の配布境界を定める。全18組の公開 Command と専用 Workflow Skill を
  同一の新責務モデルで正規化する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      実行定義層の正規所有者を9層モデルとして確立する。各層の正規所有内容は次のとおり。
      Command: 利用者向け入口、入力契約、最終出力、利用者から見える重大な副作用・確認境界、Workflow Skill への委譲。
      Workflow Skill: 工程、分岐、状態遷移、再開、停止、Capability Skill の組合せ、副作用の実行順序。
      Capability Skill: 複数 workflow で再利用可能な意味規則、判断、分類、方針。
      Reference: 大きな説明、背景、例（新たな正規契約は所有しない）。
      Script: 決定的な解析、変換、検証、生成。
      Custom Tool: Git / GitHub 等に対する構造化された副作用操作。
      Plugin / Hook: モデルの遵守判断へ委ねてはならない実行前禁止・強制。
      Template: 固定的な成果物形状。
      REQ / Design: 規範および設計契約。
      Command は workflow の工程一覧、STEP、内部順序または「公開順序の要約」を正規所有しない。
      確認済みの全18組の公開 Command と専用 Workflow Skill を、同一の新責務モデルで評価・正規化し、
      局所的な数組だけの修正で新旧責務モデルを併存させない。
      Workflow Skill が所有する工程を Command が再掲せず、Command は Workflow Skill の内部 STEP・reference
      パス等へ依存せず、個別差分と正規所有者が判別可能であること。
  - id: AG-002
    content: |
      標準継承と差分記述の原則を確立する。成果物種別から継承可能な標準契約は、各 Command / Skill /
      Reference 等へ繰り返し記述しない。個別成果物は、その成果物固有の契約、標準からの差分、
      必要な例外、正規所有者への名レベル参照のみを記述する。
      同一規範を複数成果物が正規所有することを禁止する。
      独立利用上、正本の情報を再提示しないと利用者へ必要情報が届かない場合に限り、
      正規所有者が一意に特定できること、再提示側が正規契約を追加・変更しないこと、
      正本変更時に別の独立した仕様判断を必要としないこと、workflow 工程を Command に再構成する用途に
      使用しないこと、の4条件をすべて満たす非規範的な最小表現を許容する。
  - id: AG-003
    content: |
      決定的処理の配置基準を確立する。同じ入力に対して決定的に解析・変換・検証・生成できる処理は Script、
      Git / GitHub 等への構造化された外部副作用を持つ処理は Custom Tool、実行時に必ず拒否・強制すべき処理は
      Plugin / Hook、意味判断・分類・方針判断を必要とする処理は Skill、固定された成果物形状は Template の
      正規配置とする。Tool / Hook へ移管した場合も Command / Skill には必要な意味上の契約を残し、
      文字コード、シェル呼出方法、一時ファイル操作等の実装手順は Markdown に残さない。
      文字コード制御、採番、形式検証、定型変換等、機械的に決定可能な処理が意味判断として Skill に
      残されていないこと。
  - id: AG-004
    content: |
      GitHub/Git I/O を Custom Tool へ完全移管する。AI エージェントが gh の使い方を Markdown から
      学んで再現する方式（agentdev-gh-cli スキルが --body-file、UTF-8 BOM なし、PowerShell 対策、
      REST API PATCH 等の具体手順まで教える現行方式）を廃止し、GitHub Issue 作成等の操作を
      専用 Tool として直接呼び出す方式に変える。
      Tool は入力検証、文字コード・OS・シェル対策、安全な gh 呼出、必要な REST API 補完、読み戻し検証（VERIFY）
      までを内部実装として完結し、検証に成功した場合のみ成功を返す。
      操作契約（入力、出力、保証、失敗時の意味）は Design が外部契約として所有する。
      --body-file、BOM なし UTF-8、chcp、日本語 title inline 禁止、ASCII 仮タイトル、gh api PATCH、
      execSync / spawnSync、PowerShell 変数展開問題、一時ファイル生成・削除等の知識は配布物 Markdown から
      原則消滅し、Tool 内部の実装詳細となる。
      旧 agentdev-gh-cli スキルは I/O 正規経路としての役割を終え、その手続きは Tool へ完全移管する。
      ローカル版は同一の操作契約で Case ファイル読み書きを実装した Local 実装を提供し、実装差し替えの
      原則（DEC-004）を維持する。Workflow は GitHub 版と Local 版の差を知らず、Issue 相当の操作を呼ぶ。
      ツール名、ファイル構成、公開単位の詳細は Design が所有する。
  - id: AG-005
    content: |
      Tool / Plugin / Hook の配布境界を確立する。ADF で一般利用される汎用 Custom Tool、汎用 Plugin / Hook、
      ADF 共通の副作用安全境界・実行時強制は配布対象とし、agent-dev-flow 自己開発固有の整合性検査、
      ADF の原本・投影構造にのみ依存する検査、ADF 内部の文書体系・パス・REQ 等に依存する強制処理は
      repo-local とする。ADF の実行時配布モデルは、必要な Tools / Plugins を正規配布物として扱えること。
      Custom Tool の導入に伴い scripts/ 直下の公開入口を増やさない（REQ-050-001・009 維持）。
      Tool / Plugin の具体的なディレクトリ構造は Design が所有する。
  - id: AG-006
    content: |
      強制機能の失敗時動作を fail-closed として確立する。実行時禁止または副作用境界を強制する Tool / Hook は、
      設定を解釈できない、対象パス等を安全に解決できない、強制処理自体が異常終了した、必須検証が完了できない、
      のいずれかの場合に対象副作用を実行せず、成功扱いとしない。
      副作用操作を担う Tool は操作結果を検証してから成功を返す。
      一方、検索、診断、候補抽出等の補助能力については、その能力の契約で代替手段と継続可否を定義できる。
  - id: AG-007
    content: |
      ガードレール識別体系を再編する。既存の Gxx は再採番して維持せず、連番方式（G01 起点・欠番なし・重複なし・
      変換対照表）の制度および検査は廃止する。既存 Gxx は内容を分類し正規所有先へ移す。
      Command 固有の利用者向け境界で横断参照・機械強制を必要としないものは ID を付与せず Command 契約として保持する。
      複数箇所から参照、検査または強制される共通ポリシーのみ、内容を示す安定した意味識別子を持つ。
      決定的処理は Script 等へ、副作用手順は Custom Tool 等へ、実行時禁止は Plugin / Hook 等の強制対象へ、
      ファイル形状は Template / Design / 検査等の適切な正規所有者へ移す。
      意味識別子は既存 Gxx との一対一変換を目的としない。意味識別子の命名体系は Design が所有する。
      Gxx 連番制度を前提とする checker、baseline、Design、REQ、参照導線が移行完了後に現役の正規契約として
      残存しないこと。旧 Gxx または旧 Command 記述形式を維持するためだけの互換層・二重記述を追加しないこと。
      機械検査は Gxx 連番検査に代えて、意味識別子の未定義参照・重複定義、廃止済み Gxx 表記の残存を検出する
      新体系の整合性検査へ置換し、旧 Command / Workflow 重複構造への回帰を要求しないこと。
  - id: AG-008
    content: |
      正規経路と迂回防止を組み合わせる。Custom Tool は安全に GitHub / Git 操作する正規経路であり、
      Hook（tool.execute.before 等の実行前介入）は生 gh WRITE 等の正規経路迂回を検出・拒否する境界として
      使用できる。どこまで生 gh 等の直接実行を禁止するかの範囲は Design が所有する。
      Tool / Hook は実行機構であり、副作用の実行権限の所有者（REQ-003 の親エージェント判断境界）を変更しない。
  - id: AG-009
    content: |
      Command / Skill 横断で確認済みの責務競合を同一原則で解消する。Command 執筆規約を複数 Skill が異なる内容で
      所有している状態、Workflow Skill と Capability Skill が同じ状態機械・実行制御を所有している状態、
      意味診断 Skill が機械判定可能な構造検査まで所有している状態、同じ派生情報を複数の表で手動同期している状態、
      Capability Skill / Reference に実装手順が正規契約として残っている状態を解消対象とする。
      派生可能な索引・逆引き表等は、一方向生成できる場合に複数正本を持たない。
  - id: AG-010
    content: |
      対象外を維持する。OpenCode ハーネス本体の変更、Command 実行状態に依存した動的な書込み許可範囲の強制と
      その実証、既存 Gxx と意味識別子との一対一対応維持、旧形式への後方互換層、単なる行数削減を目的とした
      文章短縮、責務変更を伴わない無関係な記述整理、本RUで必要性が確定していない公開 Command の追加・削除・
      rename、本RUで必要性が確定していない既存 scripts 公開入口の変更、実装時の Wave 構成等の実装計画は
      対象外とする。動的書込み許可範囲の強制またはその実証が本変更の成立条件へ追加されていないこと。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-002.md
    source_items: [AG-001, AG-002, AG-003, AG-009]
    content: |
      【目的 置換】
      配布成果物（command、skill、template、script、custom tool、plugin/hook）の種別責務、原本と配置先、
      正規名前空間と repo-local 名前空間、ドメイン状態ディレクトリ、skill 命名と frontmatter と段階的開示、
      ガイドレール実行層の配置、配布物依存スキルの src 昇格、Project Extensions 機構と読込境界、
      subagent 委譲プロトコルの配布成果物側正規所有、安定外部契約の Design 委譲、実行定義層の正規所有モデル
      （9層）、標準継承と差分記述原則、決定的処理の配置基準を統括する。
      依存境界、自己完結性、harness 非依存、producer 内部参照禁止、runtime 依存解決は REQ-029 が所有する。
      委譲時の判断、承認、副作用発動の境界は REQ-003 が所有し、本 REQ は配布成果物側の正規所有者として接続点を参照する。
      本 REQ が所有する安定外部契約の詳細実装は Design を正規所有者とし、本 REQ は境界宣言へ縮約する。

      【REQ-002-001 置換】
      | REQ-002-001 | command は利用者向け入口、入力契約、最終出力、利用者から見える重大な副作用・確認境界、Workflow Skill への委譲を定義し、workflow の工程一覧、STEP、内部順序または公開順序の要約を正規所有しないこと。workflow 実装本体および高水準の実行構造は Workflow Skill の control plane が所有すること |

      【要件 追加】
      | REQ-002-037 | 実行定義層の正規所有モデルとして、Command、Workflow Skill、Capability Skill、Reference、Script、Custom Tool、Plugin/Hook、Template、REQ/Design の各層が正規所有する内容と所有しない内容が一意に判別できること。各層の正規所有内容の詳細は Design が正規所有者であること |
      | REQ-002-038 | 型から一意に継承可能な標準契約を個別の Command、Skill、Reference 等へ必須記述として再掲しないこと。個別成果物はその成果物固有の契約、標準からの差分、必要な例外、正規所有者への名レベル参照のみを記述すること |
      | REQ-002-039 | 同一の規範について複数成果物が正規所有者とならないこと。独立利用上不可欠な場合に限り、正規所有者が一意に特定でき、再提示側が正規契約を追加・変更せず、正本変更時に別の独立した仕様判断を必要とせず、workflow 工程を Command に再構成する用途に使用しない非規範的な最小表現を許容すること |
      | REQ-002-040 | 決定的処理の正規配置基準（決定的な解析・変換・検証・生成は Script、構造化された外部副作用は Custom Tool、実行時の拒否・強制は Plugin/Hook、意味判断は Skill、固定された成果物形状は Template）に従い、文字コード、シェル呼出方法、一時ファイル操作等の実装手順を配布成果物の Markdown に残存させないこと |
      | REQ-002-041 | 公開 Command と専用 Workflow Skill の全組について、同じ仕様変更を同じ理由で双方へ反映しなければならない workflow 契約の重複が残らないこと。Workflow Skill が所有する工程を Command が再掲せず、Command は Workflow Skill の内部 STEP、reference パス等へ依存しないこと |

      【適用範囲 対象へ追記】
      - 実行定義層の正規所有モデル（9層）、標準継承と差分記述原則、正本の一意性、決定的処理の配置基準、全 Command/Workflow Skill 組の重複解消

  - id: ACT-REQ-002
    artifact: req
    operation: create
    target: new:guardrail-identification-reform
    source_items: [AG-007]
    content: |
      ---
      id: REQ-051
      title: "ガードレール識別体系と機械検査の再編"
      created: "2026-08-24"
      updated: "2026-08-24"
      ---

      ## 目的

      ガードレール番号 Gxx の連番制度（G01 起点・欠番なし・重複なし・変換対照表保持）を廃止し、
      既存 Gxx をその性質ごとの正規所有先へ移管した上で、横断参照・検査・強制される共通ポリシーのみが
      意味に基づく安定識別子を持つ体系を確立する。Gxx 連番を前提とする checker、baseline、Design、REQ、
      参照導線を新しい責務体系へ移行し、旧制度の残存を検出する機械検査を所有する。

      ## 要件

      | ID | 要件 |
      |---|---|
      | REQ-051-001 | 公開 command に対する G01 起点・欠番なし・重複なしの連番要件および変更前番号から変更後所在への変換対照表の保持要件を、正規契約から廃止すること |
      | REQ-051-002 | 既存のガードレール記述を、Command 固有の利用者向け境界（ID 付与なしの Command 契約）、共通ポリシー（意味に基づく安定識別子）、決定的処理（Script 等）、副作用手順（Custom Tool 等）、実行時禁止（Plugin/Hook による強制）、ファイル形状（Template/Design/検査）へ分類し、正規所有先へ移管すること |
      | REQ-051-003 | 共通ポリシーの意味識別子は意味に基づく安定した識別子であり、位置依存の連番 nor 既存 Gxx との一対一変換を目的としないこと |
      | REQ-051-004 | Command 固有で横断参照・検査・機械強制を必要としない利用者向け境界について、識別子付与を必須にしないこと |
      | REQ-051-005 | docs-check は Gxx 連番検査に代えて、共通ポリシーの意味識別子の未定義参照、重複定義、および廃止済み Gxx 表記の残存を検出すること |
      | REQ-051-006 | Gxx 連番制度を前提とする checker、baseline、Design、REQ、参照導線が、新しい責務体系への移行完了後に現役の正規契約として残存しないこと |
      | REQ-051-007 | 旧 Gxx または旧 Command 記述形式を維持するためだけの互換層・二重記述を追加しないこと |
      | REQ-051-008 | 機械検査は新しい責務モデルと矛盾せず、旧 Command / Workflow 重複構造への回帰を要求しないこと |

      ## 適用範囲

      - **対象**: Gxx 連番制度の廃止、既存ガードレール記述の分類と正規所有先への移管、共通ポリシー意味識別子の役割と付与条件、ローカル境界の ID 不要化、docs-check 検査の新体系への置換、旧制度残存の防止
      - **対象外**: 意味識別子の具体的な命名体系と衝突回避規則（Design）、Tool / Plugin / Hook の種別契約と配布境界（REQ-052）、Command 実行状態に依存する動的な書込み許可範囲の強制、後方互換層の提供

  - id: ACT-REQ-003
    artifact: req
    operation: create
    target: new:tool-plugin-hook-boundary
    source_items: [AG-003, AG-004, AG-005, AG-006, AG-008]
    content: |
      ---
      id: REQ-052
      title: "Custom Tool・Plugin/Hook の種別契約と配布境界"
      created: "2026-08-24"
      updated: "2026-08-24"
      ---

      ## 目的

      Custom Tool と Plugin / Hook を配布種別として確立し、構造化された副作用操作と実行時強制の正規配置、
      操作契約と実装詳細の分離、強制機能の失敗時動作（fail-closed）、ADF 汎用機能と自己開発固有機能の
      配布境界を所有する。GitHub/Git I/O の Custom Tool 移管は REQ-011 が、種別の正規所有モデルの全体は
      REQ-002 が所有し、本 REQ は Tool / Plugin / Hook 種別の契約を所有する。

      ## 要件

      | ID | 要件 |
      |---|---|
      | REQ-052-001 | Custom Tool は Git、GitHub 等への構造化された副作用操作を、操作契約（入力、出力、保証、失敗時の意味）の下で提供する配布種別であり、文字コード制御、シェル呼出、一時ファイル操作、CLI オプション運用等の実装詳細を Tool 内部に隠蔽すること |
      | REQ-052-002 | Plugin / Hook はモデルの遵守判断に委ねてはならない実行前の拒否・強制を担う種別であり、Custom Tool 等の正規経路の迂回（生 gh WRITE 等の直接実行）の検出・拒否に使用できること |
      | REQ-052-003 | 副作用操作を担う Tool は操作の結果を検証してから成功を返し、保存または検証に失敗した場合に成功扱いとしないこと |
      | REQ-052-004 | 強制境界を担う Tool / Hook は、設定を解釈できない、対象パス等を安全に解決できない、強制処理自体が異常終了した、必須検証が完了できない、のいずれかの場合に対象副作用を実行せず成功扱いとしないこと |
      | REQ-052-005 | 検索、診断、候補抽出等の補助能力は、その能力の契約で代替手段の存在と継続可否を定義できること |
      | REQ-052-006 | ADF 汎用の Tool / Plugin / Hook は配布対象とし、agent-dev-flow 自己開発固有の整合性検査、ADF の原本・投影構造にのみ依存する検査、ADF 内部の文書体系・パス・REQ 等に依存する強制処理は repo-local とすること |
      | REQ-052-007 | ADF の実行時配布モデルは必要な Tools / Plugins を正規配布物として扱えること |
      | REQ-052-008 | Custom Tool の導入に伴い scripts/ 直下の公開入口を増やさないこと（REQ-050-001、REQ-050-009 維持） |
      | REQ-052-009 | Tool / Hook は実行機構であり、副作用の実行権限の所有者を変更しないこと（REQ-003 との整合） |
      | REQ-052-010 | ツール名、ファイル構成、ディレクトリ構造、公開単位、生コマンド禁止範囲の詳細は Design が所有すること |

      ## 適用範囲

      - **対象**: Custom Tool・Plugin/Hook の種別契約（操作契約、実装詳細の隠蔽、迂回防止）、副作用操作の検証義務、強制機能の fail-closed、補助能力の継続可否定義、配布境界（ADF 汎用と repo-local の区別）、配布モデルの拡張、scripts 公開入口の維持、権限所有者不変
      - **対象外**: ツール名・ファイル構成・ディレクトリ構造・禁止範囲の詳細（Design）、ガードレール識別体系（REQ-051）、GitHub I/O 境界の移管（REQ-011）、Command 実行状態に依存する動的な書込み許可範囲の強制

  - id: ACT-REQ-004
    artifact: req
    operation: update
    target: docs/requirements/REQ-011.md
    source_items: [AG-004, AG-006, AG-008]
    content: |
      【REQ-011-001 置換】
      | REQ-011-001 | GitHub I/O の唯一の境界は GitHub I/O を担う Custom Tool の操作契約集合とすること。旧 agentdev-gh-cli スキルが所有していた I/O 手続きは Tool へ完全移管し、スキルを I/O 正規経路として残さないこと |

      【REQ-011-002 置換】
      | REQ-011-002 | 配布物は gh コマンドの呼出手順（オプション、文字コード対策、一時ファイル運用等）を Markdown に記述して再現せず、Tool の操作を呼び出すこと |

      【REQ-011-003 置換】
      | REQ-011-003 | Tool は I/O 手続きと検証（VERIFY）を内部実装として完結し、操作の結果を検証してから成功を返すこと |

      【REQ-011-005 置換】
      | REQ-011-005 | 境界は操作契約（入力、出力、保証、失敗時の意味）の集合とし、実装は Tool が所有すること |

      【REQ-011-006 置換】
      | REQ-011-006 | ローカル版は同一の操作契約で Case ファイル読み書きを実装した Local 実装 Tool を提供し、GitHub 実装と差し替え可能であること |

      【REQ-011-013 置換】
      | REQ-011-013 | 配布物から環境依存（Windows、PowerShell、エンコーディング、一時ファイル、--body-file）を排除する。環境依存の対処は Tool 内部に隠蔽すること |

      【要件 追加】
      | REQ-011-020 | Tool は本文生成、完了判定、Epic 依存判定、capture 分類を担当しないこと（REQ-011-004 の Tool への適用） |
      | REQ-011-021 | Hook による正規経路の迂回防止（生 gh WRITE 等の直接実行の検出・拒否）を適用できること。禁止範囲の詳細は Design が所有すること |

      【目的 補正】
      目的節の「agentdev-gh-cli を GitHub I/O の唯一の境界として確立する」は「GitHub I/O を担う Custom Tool の操作契約集合を唯一の境界として確立する」へ読み替える。

  - id: ACT-REQ-005
    artifact: req
    operation: update
    target: docs/requirements/REQ-046.md
    source_items: [AG-007]
    content: |
      【REQ-046-004 削除（retire）】
      G01 から Gn までの連番要件は REQ-051-001 により廃止する。要件行を削除する。

      【REQ-046-005 削除（retire）】
      変換対照表の保持要件は後方互換性を要求しない方針（REQ-051-001、REQ-051-007）により廃止する。要件行を削除する。

      【REQ-046-006 置換】
      | REQ-046-006 | 公開 command の前提条件、出力契約、検証基準の表現が、workflow の工程一覧や公開順序の要約を Command に持たせない新 command 記述様式（Design が所有）に統一されており、旧 Step 規則および旧工程表形式規則が残存しないこと |

      【適用範囲 補正】
      対象の「ガードレール番号の連番と変換対照表」を「ガードレール識別体系の新体系への移行（REQ-051）」へ置換する。

  - id: ACT-REQ-006
    artifact: req
    operation: update
    target: docs/requirements/REQ-010.md
    source_items: [AG-007]
    content: |
      【REQ-010-064 置換】
      | REQ-010-064 | docs-check は公開 command 等の共通ポリシー識別子について、意味識別子の未定義参照、重複定義、および廃止済み Gxx 表記の残存在を検出すること |

      【適用範囲 該当行 置換】
      「公開 command のガードレール番号不変量検査（開始番号、欠番、重複、未定義参照）」を
      「共通ポリシー意味識別子の整合性検査（未定義参照、重複定義、廃止済み Gxx 表記の残存検出、REQ-051-005）」へ置換する。

  - id: ACT-REQ-007
    artifact: req
    operation: update
    target: docs/requirements/REQ-045.md
    source_items: [AG-007]
    content: |
      【REQ-045-002 該当句 置換】
      監査観点のうち「Gxx の書式・開始番号・欠番・重複・本文参照整合性」を
      「ガードレール識別体系の整合（共通ポリシー意味識別子の未定義参照・重複定義、旧 Gxx 連番制度の残存）」へ置換する。

  - id: ACT-REQ-008
    artifact: req
    operation: update
    target: docs/requirements/REQ-047.md
    source_items: [AG-007]
    content: |
      【REQ-047-001 該当句 置換】
      対象規則の列挙「command format、ガードレール番号、廃止語彙と旧パス、配布境界、同種の integrity 検査定義」の
      「ガードレール番号」を「ガードレール識別体系（共通ポリシー意味識別子）」へ置換する。

  - id: ACT-REQ-009
    artifact: req
    operation: update
    target: docs/requirements/REQ-029.md
    source_items: [AG-005]
    content: |
      【対象節 種別列挙 置換】
      「配布成果物（command、skill、template、script のテキスト成果物）」を
      「配布成果物（command、skill、template、script、custom tool、plugin/hook の配布種別。Tool/Plugin の
      実行時成果物を含む）」へ置換する。依存境界の意味モデル（producer 内部依存禁止、consumer 解決可能性）は
      Tool / Plugin にも同一に適用する。

  - id: ACT-DEC-001
    artifact: decision
    operation: create
    target: new:execution-definition-responsibility-model
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007, AG-008, AG-009]
    content: |
      # DEC-022: 実行定義層の正規所有モデルと機械強制への移行

      ## 背景

      公開 Command と専用 Workflow Skill の全18組に、同一仕様変更を双方へ反映する必要がある実質的な重複が
     存在した。これは Command が workflow 実装本体を所有しない方針と、workflow の公開順序・高水準実行構造を
      Command に記述させる方針が併存する、正規責務モデルの自己矛盾に起因する。
      また Git/GitHub 操作、文字コード制御、採番、形式検証等の決定的処理が Markdown 手順として残存し、
      型から継承可能な共通契約が各成果物へ再掲され、Gxx 連番体系に利用者境界・不変条件・形式要求・実装規則が
      混在していた。Gxx の欠番・非連番は採番不備ではなく、異なる責務を一つの記述体系へ集約している症候である。

      ## 決定

      1. 実行定義層の正規所有モデルを9層として確立する。Command（利用者向け入口、入力契約、最終出力、
         利用者から見える重大な副作用・確認境界、Workflow Skill への委譲）、Workflow Skill（工程、分岐、状態遷移、
         再開、停止、Capability Skill の組合せ、副作用の実行順序）、Capability Skill（再利用可能な意味規則、判断、
         分類、方針）、Reference（説明、背景、例。正規契約は非所有）、Script（決定的な解析、変換、検証、生成）、
         Custom Tool（Git / GitHub 等への構造化された副作用操作）、Plugin / Hook（実行前禁止・強制）、
         Template（固定的な成果物形状）、REQ / Design（規範および設計契約）。
         Command は workflow の工程一覧、STEP、内部順序、公開順序の要約を正規所有しない。全18組を同一モデルで正規化する。
      2. 型から継承可能な標準契約を個別成果物へ再掲せず、個別成果物は固有の契約、差分、例外、正規所有者への
         名レベル参照のみを記述する。同一規範の複数正規所有を禁止し、独立利用上不可欠な場合のみ4条件を満たす
         非規範的最小表現を許容する。
      3. 決定的処理は性質に応じた正規配置（Script / Custom Tool / Plugin・Hook / Skill / Template）へ移管し、
         実装手順を配布物 Markdown に残存させない。
      4. GitHub/Git I/O を Custom Tool へ完全移管する。agentdev-gh-cli スキルは I/O 正規経路としての役割を終える。
         操作契約は Design が所有し、VERIFY は Tool 内実装、環境依存の実装詳細は Tool 内部に隠蔽する。
         ローカル版は同一操作契約で実装を差し替える（DEC-004 の差替原則を維持し、境界成果物の種別を
         スキルから Custom Tool へ変更する）。
      5. Plugin / Hook は実行前の拒否・強制を担う強制軸であり（DEC-014 系）、正規経路の迂回防止に使用する。
         Tool / Hook は実行機構であり、副作用の実行権限の所有者（REQ-003）を変更しない。
      6. 強制境界を担う Tool / Hook は、安全性を確認できない場合（設定解釈不能、パス解決不能、強制処理の異常終了、
         必須検証未了）に対象副作用を実行せず成功扱いとしない（fail-closed）。副作用操作を担う Tool は検証成功のみ
         成功を返す。補助能力はその契約で代替手段と継続可否を定義できる。
      7. Gxx 連番制度（G01 起点・欠番なし・変換対照表）を廃止する。既存 Gxx は性質ごとの正規所有先へ移管し、
         横断参照・検査・強制される共通ポリシーのみ意味に基づく安定識別子を持つ。Command 固有の利用者向け境界には
         ID を付与しない。既存 Gxx との一対一変換は行わず、後方互換層を設けない。
      8. DEC-015 決定4（決定論的処理は既存 script 種別と Capability Skill 公開能力へ接続し、新たな層や成果物種別を
         導入しない）のうち構造化された副作用操作の接続先について、Custom Tool を新種別として導入するよう部分修正する。
         Plugin / Hook は決定論的処理の接続点ではなく実行前強制の軸として本 Decision が位置付ける。
         3層配布モデル（DEC-010）と実行機構層（Script、Custom Tool、Plugin/Hook）と正規文書層（REQ/Design）は
         軸が異なり、DEC-010 の3層分化・1:N 分割は維持される。
      9. 配布種別に custom tool、plugin/hook を加え、ADF 汎用機能を配布対象、自己開発固有の検査・強制を repo-local
         とする。scripts/ 直下の公開入口は従来どおり2本に固定する（DEC-021、REQ-050 維持）。

      ## 新規統制追加原則の7条件立証（DEC-001 決定4）

      1. 未来的な問題: 18/18 組の重複と Gxx 异種混在が実証済みであり、放置すれば正規契約と機械検査が旧構造を
         要求し続け重複が再発する。
      2. 統制追加後の世界: 正規所有者が一意で、差分記述が最小の実行定義層。強制は機械側へ移管。
      3. 導入費用: 18組の正規化、Tool 移管、検査置換。既存の一方向生成・Skill 配下 Script・実行前 Hook の
         実装パターンを再利用する。
      4. 保守費用: 標準継承により個別成果物の更新範囲が縮小し、決定的処理の保守は Script/Tool に集約される。
      5. 統制なしの世界: Command/Workflow Skill の二重管理とモデル遵守依存が継続し、Gxx 再編でも再発する。
      6. 削除・簡略化: Gxx 連番制度、REQ-046-004/005、REQ-010-064 の旧検査、変換対照表、agentdev-gh-cli の
         実装手順書（standard-procedures.md 等の大部分）、Command への工程表・公開順序の要約を削除する。
         ネットの統制数は増えない。
      7. 最初の3事例: 全18組への適用、agentdev-gh-cli の Tool 移管、Gxx 廃止と意味識別子検査への置換が
         最初の適用事例である。

      ## 結果、影響

      - REQ-002（種別モデル、thin command、継承原則、配置基準）、REQ-051（識別体系）、REQ-052（Tool/Plugin/Hook
        契約）、REQ-011（I/O 境界の Tool 移管）、REQ-046/010/045/047/029 の更新。
      - workflow-skill-model、artifact-contracts、command-file-format、runtime-package-boundary、
        integrity 系 Design、Custom Tool 操作契約 Design の更新・新設。
      - 18組の公開 Command / Workflow Skill の正規化、agentdev-gh-cli スキルの解消、checker の新体系追随。
      - 後方互換性を提供しない（旧 Gxx、旧 Command 記述形式）。

      ## 関連する決定

      - DEC-001: relates-to（決定4 の7条件立証を本 Decision が満たす。hard governance の追加は fail-closed 強制と
        意味識別子検査で、Gxx 制度の削除と相殺される）
      - DEC-004: relates-to（差替可能な I/O 境界の原則を維持したまま、境界成果物の種別をスキルから Custom Tool へ変更）
      - DEC-010: relates-to（3層分化・1:N 分割を維持したまま、Command 責務を追加制限し層モデルを拡張。supersede しない）
      - DEC-014: relates-to（Plugin / Hook による実行時強制は多層 enforcement の適用対象拡張）
      - DEC-015: relates-to（決定4 のうち構造化副作用の接続先を Custom Tool へ部分修正。決定1〜3、5〜7 は維持）
      - DEC-016: relates-to（導入系スクリプトの副作用ゼロ原則と同型の安全原理として fail-closed を位置付ける）
      - DEC-021: relates-to（scripts 公開入口2本固定を維持したまま Tool/Plugin を配布種別に加える）

  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/workflows/workflow-skill-model.md
    target_area: ## Command 責務
    source_items: [AG-001]
    content: |
      ## Command 責務

      Command は利用者向け入口、入力契約、最終出力、利用者から見える重大な副作用・確認境界、Workflow Skill への
      委譲のみを正規所有する。workflow の工程一覧、STEP、内部順序、公開順序の要約を正規所有しない
      （DEC-022、REQ-002-001）。

      - Command が記述するもの: 入口と引数、入力契約、最終出力、利用者から見える重大な副作用・確認境界、
        Workflow Skill への委譲宣言、Command 固有の利用者向け境界（ID 付与なし）
      - Command が記述しないもの: 工程表、STEP 一覧、公開順序の要約、Workflow Skill の内部構造
        （reference パス、STEP 識別子）、型由来の標準契約（継承により省略）、実装手順
      - Command は Workflow Skill 名レベルで委譲し、内部 STEP・reference パスへ依存しない（REQ-002-017 維持）

  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target: docs/designs/responsibilities/artifact-contracts.md
    target_area: ## アーティファクト種別
    source_items: [AG-001, AG-003, AG-005]
    content: |
      ## アーティファクト種別

      | 種別 | 配置先 | 責務 | 入力 | 出力 |
      |---|---|---|---|---|
      | Command | src/opencode/commands/agentdev/（実行時: .opencode/commands/agentdev/） | 利用者向け入口、入力契約、最終出力、利用者から見える重大な副作用・確認境界、Workflow Skill への委譲 | ユーザー起動、GitHub Issue | PR、Issue 更新、完了報告 |
      | Skill | src/opencode/skills/（実行時: .opencode/skills/） | 再利用可能な判断基準、ドメイン知識 | Command からの参照 | 判断結果の参照提供 |
      | Template | src/opencode/skills/*/templates/ または src/opencode/commands/agentdev/templates/（実行時: .opencode/ 経由） | 出力構造とプレースホルダー | 変数バインド | Issue/PR 本文、コメント |
      | Script | src/opencode/skills/*/scripts/（実行時: .opencode/ 経由） | 決定的でテスト可能な解析・変換・検証・生成ロジック | コマンドライン引数 | 標準出力（JSON/Markdown） |
      | Custom Tool | src/opencode/tools/（実行時: .opencode/tools/ 経由。詳細構造は Design が所有） | Git / GitHub 等への構造化された副作用操作。操作契約（入力、出力、保証、失敗時）を公開し、文字コード・シェル・一時ファイル等の実装詳細を隠蔽 | 構造化引数 | 構造化結果（検証成功のみ成功） |
      | Plugin / Hook | src/opencode/plugins/（実行時: .opencode/ 経由。詳細構造は Design が所有） | モデル遵守判断に委ねない実行前の拒否・強制、正規経路の迂回防止 | ツール実行イベント | 許可・拒否判定 |
      | リポジトリローカル Command | .opencode/commands/repo/（原本なし） | 本体リポジトリ専用入口（REQ-001） | ユーザー起動 | レポート、成果物 |
      | リポジトリローカル Skill | .opencode/skills/repo-*/（原本なし） | 本体リポジトリ専用判断基準（REQ-001） | Command からの参照 | 判断結果の参照提供 |

      種別ごとの正規所有内容と所有しない内容の一意判別、標準継承と差分記述原則、決定的処理の配置基準の詳細は
      DEC-022 および REQ-002-037〜040 が要求水準を所有し、本 Design が配置・構造の詳細を所有する。
      依存方向は Command → Skill → Reference / Script に加え、Command / Skill → Custom Tool（操作契約経由）、
      Plugin / Hook → ツール実行（迂回防止）を含む。REQ / Design は規範・設計契約の正規文書層であり、
      配布種別とは別軸である（DEC-022 決定8）。

  - id: ACT-DESIGN-003
    artifact: design
    operation: update
    target: docs/designs/authoring/command-file-format.md
    target_area: ## ガードレール番号
    source_items: [AG-007]
    content: |
      ## ガードレール識別体系

      ガードレール番号 Gxx の連番制度（G01 起点・欠番なし・重複なし・変換対照表）は廃止する（DEC-022、REQ-051）。

      - Command 固有の利用者向け境界（横断参照・機械強制を必要としないもの）は ID を付与せず、
        「ガードレール」セクションの本文として保持する
      - 複数箇所から参照、検査または強制される共通ポリシーのみ、意味に基づく安定識別子（意味識別子）を持つ。
        識別子の命名体系・衝突回避規則は本 Design が所有する
      - 既存 Gxx 記述は、利用者向け境界（ID なし）、共通ポリシー（意味識別子）、決定的処理（Script 等）、
        副作用手順（Custom Tool 等）、実行時禁止（Plugin/Hook）、ファイル形状（Template/Design/検査）へ
        分類して正規所有先へ移管する
      - 機械検査は Gxx 連番検査に代えて、意味識別子の未定義参照・重複定義、廃止済み Gxx 表記の残存を検出する
        （REQ-051-005、REQ-010-064）

  - id: ACT-DESIGN-004
    artifact: design
    operation: create
    target_design:
      operation: create
      domain: responsibilities
      slug: custom-tool-contracts
    source_items: [AG-004, AG-006, AG-008]
    content: |
      ---
      title: Custom Tool 操作契約
      status: draft
      created: 2026-08-24
      updated: 2026-08-24
      ---

      # Custom Tool 操作契約

      Git / GitHub 等への構造化された副作用操作を担う Custom Tool の操作契約と失敗時動作を所有する
      （REQ-052、DEC-022）。

      ## 操作契約の構成要素

      各操作は次の外部契約のみを公開する。実装詳細（gh オプション、--body-file、UTF-8 BOM なし、
      chcp、REST API PATCH、一時ファイル、PowerShell 対策等）は Tool 内部に隠蔽する。

      | 要素 | 内容 |
      |---|---|
      | 入力 | 操作名、構造化引数（title、body、labels 等）。環境依存の引数運用規則を含まない |
      | 出力 | 構造化結果（issue 番号、URL 等） |
      | 保証 | 操作の結果を検証（読み戻し等）してから成功を返す |
      | 失敗 | 保存または検証に失敗した場合に成功扱いとしない。エラー種別と再試験可否を返す |

      ## 対象操作の境界（初期セット）

      GitHub I/O: issue_create、issue_read、issue_update、issue_comment、issue_close、pr_create、pr_read、
      pr_merge、pr_changed_files、pr_mergeable。ツール名・公開単位・ファイル構成は本 Design の後続更新で確定する。

      ## ローカル版実装差し替え

      ローカル版は同一の操作契約で Case ファイル読み書きを実装した Local 実装を提供する（REQ-011-006、DEC-004）。
      Workflow は GitHub 版と Local 版の差を認識しない。

      ## 迂回防止

      Plugin / Hook（tool.execute.before 等）により、生 gh WRITE 等の正規経路迂回を検出・拒否できる。
      禁止範囲（読み取り系の許容等を含む）は本 Design が所有する。

  - id: ACT-DESIGN-005
    artifact: design
    operation: append
    target: docs/designs/local/runtime-package-boundary.md
    target_area: ## Tools / Plugins の配布・投影
    anchor: ## scripts 公開入口と内部配置
    placement: after_anchor
    source_items: [AG-005]
    content: |
      ## Tools / Plugins の配布・投影

      Custom Tool（src/opencode/tools/）と Plugin / Hook（src/opencode/plugins/）を正規配布種別として扱う
      （REQ-052、DEC-022）。原本と実行時投影は Command / Skill と同一の source・projection 原則（DEC-002）に従い、
      link mode の接続対象に含める。scripts/ 直下の公開入口は従来どおり2本に固定し、Tool / Plugin の追加によって
      新たな公開入口を作らない（REQ-050-001、REQ-052-008）。ディレクトリ構造の詳細は本 Design が所有する。

  - id: ACT-DESIGN-006
    artifact: design
    operation: append
    target: docs/designs/integrity/integrity-rule-catalog.md
    target_area: ## ガードレール識別体系検査（Gxx 検査の置換）
    anchor: ## docs-check 項目役割範囲（REQ-010-004）
    placement: after_anchor
    source_items: [AG-007]
    content: |
      ## ガードレール識別体系検査（Gxx 検査の置換）

      Gxx 連番検査（開始番号・欠番・重複・未定義参照）を廃止し、次の検査へ置換する（REQ-051-005、REQ-010-064）。

      - 共通ポリシー意味識別子の未定義参照検出（参照先が定義済みであること）
      - 共通ポリシー意味識別子の重複定義検出
      - 廃止済み Gxx 表記の残存検出（G[0-9]{2} パターンの現行契約残存）
      - Command / Workflow Skill 間の workflow 契約重複の回帰検出（工程表・公開順序の要約の Command 残存）

      個別ルールの IR 登録と baseline の置換は、本セクションを正規所有者として整理する。

conflict_resolutions:
  - id: CR-001
    conflict: DEC-015 決定4「決定論的処理は既存 script 種別と Capability Skill 公開能力へ接続し、新たな層や成果物種別を導入しない」と、Custom Tool / Plugin・Hook の新種別導入（RU-0001 要件化の方向3・4）の衝突
    resolution: 新 Decision（DEC-022）で relates-to による部分修正を明示宣言する。構造化副作用の接続先について Custom Tool を新種別として導入するよう決定4 を部分修正し、Plugin/Hook は決定論的処理の接続点ではなく実行前強制の軸（DEC-014 系）として位置付ける。DEC-014↔DEC-006、DEC-015→DEC-001 の部分修正の確立手続きに従う。アーキテクチャ助言（Oracle）の分類結果を親エージェントが採用
  - id: CR-002
    conflict: REQ-011-001「agentdev-gh-cli を GitHub I/O の唯一の境界として確立する」（スキル種別）と、GitHub I/O の Custom Tool 完全移管の衝突
    resolution: ユーザー合意（案B）により、唯一の I/O 境界を Custom Tool の操作契約集合へ移行する。agentdev-gh-cli スキルは I/O 正規経路としての役割を終え、手続きは Tool へ完全移管、操作契約は Design が所有、VERIFY は Tool 内実装とする。DEC-004 の差替原則（ローカル版同一契約差し替え）は維持する。REQ-011 の該当行を更新する
  - id: CR-003
    conflict: REQ-046-004/005（G01 起点・欠番なし連番と変換対照表保持）と、Gxx 連番制度廃止の衝突
    resolution: RU-0001 Source Summary の「後方互換性は要求しない」「G01 起点・欠番なし検査は廃止」合意により、REQ-046-004/005 を retire する。変換対照表は新旧対応維持を目的としないため保持しない
  - id: CR-004
    conflict: REQ-046-006（公開 command の工程表形式統一）と、thin Command（工程一覧・公開順序の要約の所有撤去）の衝突
    resolution: REQ-046-006 を「workflow の工程一覧や公開順序の要約を Command に持たせない新 command 記述様式（Design 所有）への統一」へ置換する。Command 記述様式の正規所有者は command-file-format Design のまま
  - id: CR-005
    conflict: REQ-050-001（scripts/ 直下公開入口2本固定）と、Tool / Plugin の新配布種別追加の関係
    resolution: Custom Tool は scripts/ 直下に公開入口を作らない（REQ-052-008 で明示）。Tool / Plugin は src/opencode/tools/・plugins/ を原本とする独立配布種別であり、REQ-050 の公開入口境界は維持される。RU-0001 対象外「既存 scripts 公開入口の変更」と整合

operation_units:
  - ou_id: OU-001
    source_ru: RU-0001
    target_req: REQ-002
    target_design: docs/designs/workflows/workflow-skill-model.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_req_docs: [REQ-002]
      applied_actions: [ACT-REQ-001]
      unclassified_rows: [REQ-002-037, REQ-002-038, REQ-002-039, REQ-002-040, REQ-002-041]
  - ou_id: OU-002
    source_ru: RU-0001
    target_req: REQ-051
    target_design: docs/designs/authoring/command-file-format.md
    operation: create
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    result:
      saved_req_docs: [REQ-051]
      applied_actions: [ACT-REQ-002]
      unclassified_rows: [REQ-051-001, REQ-051-002, REQ-051-003, REQ-051-004, REQ-051-005, REQ-051-006, REQ-051-007, REQ-051-008]
  - ou_id: OU-003
    source_ru: RU-0001
    target_req: REQ-052
    target_design: docs/designs/responsibilities/custom-tool-contracts.md
    operation: create
    scale: standard
    depends_on: [OU-001]
    recommended_order: 3
    issue_policy: single
    result:
      saved_req_docs: [REQ-052]
      applied_actions: [ACT-REQ-003]
      unclassified_rows: [REQ-052-001, REQ-052-002, REQ-052-003, REQ-052-004, REQ-052-005, REQ-052-006, REQ-052-007, REQ-052-008, REQ-052-009, REQ-052-010]
  - ou_id: OU-004
    source_ru: RU-0001
    target_req: REQ-011
    operation: update
    scale: standard
    depends_on: [OU-003]
    recommended_order: 4
    issue_policy: single
    result:
      saved_req_docs: [REQ-011]
      applied_actions: [ACT-REQ-004]
      unclassified_rows: [REQ-011-020, REQ-011-021]

req_save_results:
  saved_req_docs: [REQ-002, REQ-010, REQ-011, REQ-029, REQ-045, REQ-046, REQ-047, REQ-051, REQ-052]
  saved_decision_docs: [DEC-022]
  source_ru: RU-0001
  action_results:
    ACT-REQ-001: {status: applied, target: docs/requirements/REQ-002.md, operation: update}
    ACT-REQ-002: {status: applied, target: docs/requirements/REQ-051.md, operation: create}
    ACT-REQ-003: {status: applied, target: docs/requirements/REQ-052.md, operation: create}
    ACT-REQ-004: {status: applied, target: docs/requirements/REQ-011.md, operation: update}
    ACT-REQ-005: {status: applied, target: docs/requirements/REQ-046.md, operation: update, note: "REQ-046-004/005 retire 削除"}
    ACT-REQ-006: {status: applied, target: docs/requirements/REQ-010.md, operation: update}
    ACT-REQ-007: {status: applied, target: docs/requirements/REQ-045.md, operation: update}
    ACT-REQ-008: {status: applied, target: docs/requirements/REQ-047.md, operation: update}
    ACT-REQ-009: {status: applied, target: docs/requirements/REQ-029.md, operation: update}
    ACT-DEC-001: {status: applied, target: docs/decisions/DEC-022.md, operation: create}
  unclassified_rows:
    - REQ-002-037, REQ-002-038, REQ-002-039, REQ-002-040, REQ-002-041
    - REQ-051-001〜REQ-051-008
    - REQ-052-001〜REQ-052-010
    - REQ-011-020, REQ-011-021

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      正規 Design / REQ 間で9層の責務定義が矛盾なく記述されていること、全18組の公開 Command と専用 Workflow Skill
      を比較し Command が工程一覧・STEP・公開順序の要約・内部 reference パス依存を持たないことを確認する。
    pass_criteria: |
      18組すべてで Command への workflow 契約再掲が存在せず、各層の正規所有内容が Design 上で一意に判別できる。
    on_failure: |
      fix-and-reverify（正規化漏れは実装の修正対象となるため。18組の残存は本変更の核心目的であり
      部分適用で完了判定できない）
  - id: TS-002
    target_item: AG-002
    verification: |
      型由来の標準契約（拡張読込、単独実行禁止、原本の扱い等）が個別 Command / Skill へ必須記述として
      再掲されていないことを抽出・確認する。非規範的最小表現が存在する場合は4条件を満たすことを確認する。
    pass_criteria: |
      標準契約の必須再掲が新たに存在せず、個別成果物が差分中心の記述になっている。非規範的再提示は
      正規所有者を一意に特定でき、再提示側だけの変更で規範を変更できない。
    on_failure: |
      fix-and-reverify（再掲の残存は本変更の核心目的のため）
  - id: TS-003
    target_item: AG-003
    verification: |
      文字コード制御、採番、形式検証、定型変換等の機械的に決定可能な処理が意味判断として Skill に残存して
      いないこと、決定的処理が Script / Custom Tool / Plugin・Hook / Template の正規配置へ移管されていることを
      対象成果物で確認する。
    pass_criteria: |
      決定的処理の実装手順が配布物 Markdown から除去され、正規配置先に存在する。
    on_failure: |
      fix-and-reverify
  - id: TS-004
    target_item: AG-004
    verification: |
      GitHub I/O 操作が Custom Tool 経由で実行され、配布物 Markdown に gh オプション・文字コード対策・
      一時ファイル運用等の実装手順が残存しないことを確認する。Tool が検証成功のみ成功を返すこと、
      ローカル版が同一操作契約で動作することを確認する。
    pass_criteria: |
      旧 agentdev-gh-cli の実装手順書（standard-procedures.md 等）の内容が Tool 内部へ移管され、
      配布物から実装詳細が消失している。既存公開機能（Issue 作成、本文更新、PR merge 等）が
      Tool 経由で正常に動作する。
    on_failure: |
      fix-and-reverify（正常系機能の欠落は本変更の成立を妨げるため）
  - id: TS-005
    target_item: AG-005
    verification: |
      consumer 配布物から repo-local 固有機能（自己開発固有の検査・強制）が混入していないこと、
      ADF 汎用 Tool / Plugin が配布 manifest の対象に含まれることを確認する。
    pass_criteria: |
      配布物と repo-local の境界が種別・配置単位で分離され、汎用 Tool / Plugin が正規配布物として扱われている。
    on_failure: |
      fix-and-reverify
  - id: TS-006
    target_item: AG-006
    verification: |
      強制境界を担う Tool / Hook について、設定解釈不能・パス解決不能・強制処理異常終了・必須検証未了の
      各異常系を意図的に発生させ、対象副作用が実行されず成功扱いにならないことを確認する。
    pass_criteria: |
      全異常系ケースで副作用が実行されず、失敗として報告される。
    on_failure: |
      fix-and-reverify（fail-closed は安全境界の中核のため）
  - id: TS-007
    target_item: AG-007
    verification: |
      Gxx 連番を要求する正規契約・検査・baseline の残存有無を grep（G[0-9]{2} パターン）と検査実行で確認する。
      意味識別子の未定義参照・重複定義が新検査で検出できることを確認する。
    pass_criteria: |
      Gxx 連番制度を前提とする checker、baseline、Design、REQ、参照導線が現役正規契約として存在せず、
      新体系の整合性検査が動作する。
    on_failure: |
      fix-and-reverify
  - id: TS-008
    target_item: AG-008
    verification: |
      正規経路（Tool）の呼び出しが正常動作すること、生 gh WRITE 等の迂回が Hook で拒否されることを確認する。
      禁止範囲が Design に記述されていることを確認する。
    pass_criteria: |
      正規経路は動作し、定義された迂回は拒否される。Tool / Hook が副作用権限の所有者を変更していない。
    on_failure: |
      fix-and-reverify
  - id: TS-009
    target_item: AG-009
    verification: |
      Command 執筆規約の正規所有者が一意であること、状態機産・実行制御の二重所有、意味診断 Skill の構造検査
      混在、派生情報の手動二重管理が解消されていることを確認する。
    pass_criteria: |
      確認済みの責務競合各項目で正規所有者が一意に定まる。
    on_failure: |
      fix-and-reverify
  - id: TS-010
    target_item: AG-010
    verification: |
      draft の対象外宣言が維持されていること（動的書込み許可範囲の強制・実証が成立条件に含まれない、
      後方互換層が追加されていない）を確認する。
    pass_criteria: |
      対象外項目が実行内容に含まれておらず、互換層・二重記述が追加されていない。
    on_failure: |
      record-in-findings（対象外侵害は本 draft の範囲外のため findings 記録とする。ただし設計判断を
      要する場合は新規 RU として扱う）
review_dispositions:
  - id: RD-001
    source_ru: RU-0001
    source_item: AC-01
    disposition: covered
    reason_code: requirement_row_created
    reason: 9層正規所有モデルは REQ-002-037 および DEC-022 決定1・ACT-DESIGN-002 が所有する。
    evidence: {path: .agentdev/drafts/req-draft-execution-definition-responsibility-model.md, section: artifact_actions.ACT-REQ-001, checked_at_commit: null}
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0001
    source_item: AC-02
    disposition: covered
    reason_code: requirement_row_created
    reason: thin Command は REQ-002-001 置換と DEC-022 決定1、ACT-DESIGN-001 が所有する。
    evidence: {path: .agentdev/drafts/req-draft-execution-definition-responsibility-model.md, section: artifact_actions.ACT-REQ-001, checked_at_commit: null}
    related_removed_items: []
  - id: RD-003
    source_ru: RU-0001
    source_item: AC-03
    disposition: covered
    reason_code: requirement_row_created
    reason: 18組重複解消は REQ-002-041 と DEC-022 決定1、TS-001 が検証する。
    evidence: {path: .agentdev/drafts/req-draft-execution-definition-responsibility-model.md, section: artifact_actions.ACT-REQ-001, checked_at_commit: null}
    related_removed_items: []
  - id: RD-004
    source_ru: RU-0001
    source_item: AC-04
    disposition: covered
    reason_code: requirement_row_created
    reason: 標準継承は REQ-002-038 が所有する。
    evidence: {path: .agentdev/drafts/req-draft-execution-definition-responsibility-model.md, section: artifact_actions.ACT-REQ-001, checked_at_commit: null}
    related_removed_items: []
  - id: RD-005
    source_ru: RU-0001
    source_item: AC-05
    disposition: covered
    reason_code: requirement_row_created
    reason: 正本一意性は REQ-002-039（4条件付き非規範的最小表現を含む）が所有する。
    evidence: {path: .agentdev/drafts/req-draft-execution-definition-responsibility-model.md, section: artifact_actions.ACT-REQ-001, checked_at_commit: null}
    related_removed_items: []
  - id: RD-006
    source_ru: RU-0001
    source_item: AC-06
    disposition: covered
    reason_code: requirement_row_created
    reason: 決定的処理の分離は REQ-002-040（配置基準）が所有する。
    evidence: {path: .agentdev/drafts/req-draft-execution-definition-responsibility-model.md, section: artifact_actions.ACT-REQ-001, checked_at_commit: null}
    related_removed_items: []
  - id: RD-007
    source_ru: RU-0001
    source_item: AC-07
    disposition: covered
    reason_code: requirement_row_created
    reason: 副作用操作の分離は REQ-052-001 と REQ-011 の更新が所有する。
    evidence: {path: .agentdev/drafts/req-draft-execution-definition-responsibility-model.md, section: artifact_actions.ACT-REQ-003, checked_at_commit: null}
    related_removed_items: []
  - id: RD-008
    source_ru: RU-0001
    source_item: AC-08
    disposition: covered
    reason_code: requirement_row_created
    reason: 実行時強制は REQ-052-002 が所有する。
    evidence: {path: .agentdev/drafts/req-draft-execution-definition-responsibility-model.md, section: artifact_actions.ACT-REQ-003, checked_at_commit: null}
    related_removed_items: []
  - id: RD-009
    source_ru: RU-0001
    source_item: AC-09
    disposition: covered
    reason_code: requirement_row_created
    reason: 強制機能の異常系は REQ-052-004（fail-closed）が所有する。
    evidence: {path: .agentdev/drafts/req-draft-execution-definition-responsibility-model.md, section: artifact_actions.ACT-REQ-003, checked_at_commit: null}
    related_removed_items: []
  - id: RD-010
    source_ru: RU-0001
    source_item: AC-10
    disposition: covered
    reason_code: requirement_row_created
    reason: 配布境界は REQ-052-006/007 が所有する。
    evidence: {path: .agentdev/drafts/req-draft-execution-definition-responsibility-model.md, section: artifact_actions.ACT-REQ-003, checked_at_commit: null}
    related_removed_items: []
  - id: RD-011
    source_ru: RU-0001
    source_item: AC-11
    disposition: covered
    reason_code: requirement_row_created
    reason: Gxx 連番要件の廃止は REQ-051-001 および REQ-046-004/005 retire が所有する。
    evidence: {path: .agentdev/drafts/req-draft-execution-definition-responsibility-model.md, section: artifact_actions.ACT-REQ-002, checked_at_commit: null}
    related_removed_items: []
  - id: RD-012
    source_ru: RU-0001
    source_item: AC-12
    disposition: covered
    reason_code: requirement_row_created
    reason: 共通ポリシー識別は REQ-051-003 が所有する。
    evidence: {path: .agentdev/drafts/req-draft-execution-definition-responsibility-model.md, section: artifact_actions.ACT-REQ-002, checked_at_commit: null}
    related_removed_items: []
  - id: RD-013
    source_ru: RU-0001
    source_item: AC-13
    disposition: covered
    reason_code: requirement_row_created
    reason: ローカル境界の ID 不要化は REQ-051-004 が所有する。
    evidence: {path: .agentdev/drafts/req-draft-execution-definition-responsibility-model.md, section: artifact_actions.ACT-REQ-002, checked_at_commit: null}
    related_removed_items: []
  - id: RD-014
    source_ru: RU-0001
    source_item: AC-14
    disposition: covered
    reason_code: requirement_row_created
    reason: 旧制度の残存防止は REQ-051-006 が所有する。
    evidence: {path: .agentdev/drafts/req-draft-execution-definition-responsibility-model.md, section: artifact_actions.ACT-REQ-002, checked_at_commit: null}
    related_removed_items: []
  - id: RD-015
    source_ru: RU-0001
    source_item: AC-15
    disposition: covered
    reason_code: requirement_row_created
    reason: checker 整合は REQ-051-008 および REQ-010-064 置換が所有する。
    evidence: {path: .agentdev/drafts/req-draft-execution-definition-responsibility-model.md, section: artifact_actions.ACT-REQ-006, checked_at_commit: null}
    related_removed_items: []
  - id: RD-016
    source_ru: RU-0001
    source_item: AC-16
    disposition: covered
    reason_code: requirement_row_created
    reason: 責務競合の解消は AG-009（REQ-002-041、Design 更新群）が所有する。
    evidence: {path: .agentdev/drafts/req-draft-execution-definition-responsibility-model.md, section: agreed_items, checked_at_commit: null}
    related_removed_items: []
  - id: RD-017
    source_ru: RU-0001
    source_item: AC-17
    disposition: covered
    reason_code: scope_confirmed
    reason: 動的書込み許可範囲の強制・実証は AG-010 の対象外宣言により成立条件に含まれない。
    evidence: {path: .agentdev/drafts/req-draft-execution-definition-responsibility-model.md, section: agreed_items.AG-010, checked_at_commit: null}
    related_removed_items: []
  - id: RD-018
    source_ru: RU-0001
    source_item: AC-18
    disposition: covered
    reason_code: requirement_row_created
    reason: 後方互換性の不提供は REQ-051-007 が所有する。
    evidence: {path: .agentdev/drafts/req-draft-execution-definition-responsibility-model.md, section: artifact_actions.ACT-REQ-002, checked_at_commit: null}
    related_removed_items: []
  - id: RD-019
    source_ru: RU-0001
    source_item: AC-19
    disposition: covered
    reason_code: test_strategy_defined
    reason: 正常系回帰は TS-004（既存公開機能の Tool 経由動作確認）が検証する。
    evidence: {path: .agentdev/drafts/req-draft-execution-definition-responsibility-model.md, section: test_strategy.TS-004, checked_at_commit: null}
    related_removed_items: []
  - id: RD-020
    source_ru: RU-0001
    source_item: AC-20
    disposition: covered
    reason_code: requirement_row_created
    reason: 実行環境差の吸収は REQ-011-013 置換（Tool 内部隠蔽）と REQ-052-001 が所有する。
    evidence: {path: .agentdev/drafts/req-draft-execution-definition-responsibility-model.md, section: artifact_actions.ACT-REQ-004, checked_at_commit: null}
    related_removed_items: []

case_open_hints:
  epic_needed: true
  decomposition: |
    OU-001（REQ-002 update + DEC-022 create + workflow-skill-model / artifact-contracts 更新）を起点とし、
    OU-002（REQ-051 create + command-file-format / integrity 更新）、OU-003（REQ-052 create + Custom Tool 操作契約
    Design 新設 + runtime-package-boundary 更新）を並行可能、OU-004（REQ-011 update、Tool 移管実装）は
    OU-003 完了後。18組の Command / Workflow Skill 正規化と agentdev-gh-cli Tool 移管は実装規模が大きく、
    case-open での分解推奨。
  wave_hints:
    - Wave 1: OU-001（責務モデルの正規確立）
    - Wave 2: OU-002, OU-003（識別体系と Tool 契約の並行）
    - Wave 3: OU-004（I/O 移管実装）+ 18組正規化
```

# summary

RU-0001（session由来RU、実行定義層の責務境界再編）を要件化した。主な合意は draft-data の AG-001〜AG-010 のとおり。
壁打ちで確定した追加合意: (1) 実証Caseに該当しない（文書設計と既存実装パターンの再利用で採否確定可能）、
(2) GitHub/Git I/O は Custom Tool へ完全移管し agentdev-gh-cli スキルは I/O 正規経路としての役割を終える
（操作契約は Design、VERIFY は Tool 内実装、ローカル版は同一契約で実装差し替え）、
(3) DEC-015 決定4 との衝突は新 Decision による relates-to 部分修正で解消する。
REQ-051/REQ-052 の番号は現行最大番号（REQ-050）からの採番予定であり、req-save の採番処理が正とする。