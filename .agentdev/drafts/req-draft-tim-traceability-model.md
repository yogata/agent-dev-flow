---
draft_type: req_draft
topic_slug: tim-traceability-model
status: saved
created_at: 2026-08-17T11:11:40+09:00
source_rus:
  - RU-0001
---

# draft-data

```yaml
# work_type: 要件の分類（bugfix / feature / maintenance / docs_chore）
work_type: feature

# scale: feature のみ standard / large
scale: large

# summary: 当該 draft が何を合意したかの1段落要約
summary: >-
  RU-0001（TIM準拠トレーサビリティモデル・派生索引・目的別探索の再構成）を、Artifact Graph の概念基盤を
  Traceability Information Model（TIM）へ置き換える要件として投影する。4層分離（TIM / Trace Index /
  Trace Query / ADF Integration）に従い、TIM・Trace Index 層は REQ-012 を UPDATE、Trace Query 層は
  新規 REQ（REQ-040）を CREATE、ADF Integration 層は REQ-021 を UPDATE、回帰検証接続は
  REQ-020 を軽微 UPDATE する。あわせて新規 Decision（tim-traceability-model、TIM 採用・標準語彙優先・
  派生索引位置付け・4層分離）と SPEC 3件（TIM 語彙カタログ新規、AG SPEC ワークフロー利用 UPDATE、
  AG SPEC 高位問い合わせプロファイル APPEND）を保存対象とする。

# auto_gate: case-auto 自走可否の判定材料
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

# agreed_items: 合意された個別項目
agreed_items:
  - id: AG-001
    content: |
      TIM（Traceability Information Model）を成果物間トレーサビリティの正規論理モデルとする。
      TIM は少なくとも成果物型、トレースリンク型、リンク元成果物型、リンク先成果物型、関係の意味、
      変更影響方向、必要な関係制約、根拠情報への関連付けを表現できること。
      グラフの物理保存形式は TIM そのものとみなさないこと。
      Artifact Graph は TIM に基づくトレーサビリティ情報を探索するための派生索引であり、
      正規情報源としないこと（正規情報は引き続き各正規成果物）。
  - id: AG-002
    content: |
      成果物型およびトレースリンク型は、SysML、OSLC、OpenFastTrace 等で確立された概念・語彙を
      優先して採用すること。分解、具体化、仕様化、制約、依存、実現、充足、実装、検証、
      妥当性確認、置換・改訂、一般参照に相当する意味を独自語彙として重複定義しないこと。
      既存語彙で ADF の意味を十分に表現できない場合のみ ADF 固有関係を追加すること。
      Decision は ADF 固有の成果物型として TIM へ追加すること。Decision と他成果物との関係は、
      既存の標準的な関係型で表現可能な場合その関係型を利用し、Decision という成果物型が
      ADF 固有であることを理由として Decision 専用の関係型を無条件に追加しないこと。
  - id: AG-003
    content: |
      Markdown リンク等から取得できる一般的な文書参照と、変更影響・依存・実現・充足・検証等の
      意味を持つトレースリンクを区別すること。単に参照関係が存在することだけを理由に、
      変更影響、依存、実現、充足、検証の各探索へ参加させないこと。
      一般参照は、関連成果物確認、所在確認、低位問い合わせ等では利用可能とすること。
  - id: AG-004
    content: |
      変更影響、依存、実現関係等の探索方向を、問い合わせごとの個別ハードコードだけで決定しないこと。
      TIM に定義された関係の意味から、目的別問い合わせの探索方向・参加可否を導出できること。
      変更影響について、リンク方向へ影響、逆方向へ影響、双方向へ影響、変更影響なしを
      関係ごとに区別できること。リンクの記述方向と変更影響方向を同一視しないこと。
  - id: AG-005
    content: |
      プロジェクト拡張によって新しい関係型を追加可能とすること。
      新しい関係型を高位問い合わせへ参加させる場合は、その関係型について必要な意味情報を明示すること。
      未知の関係型について、名前や LLM 推論等から意味を自動推定しないこと。
      意味定義が存在しない関係型は、低位問い合わせでは利用可能とし、
      高位問い合わせへ自動参加させないこと。
  - id: AG-006
    content: |
      README、INDEX、CATALOG 等の名称そのものではなく、成果物の役割として索引・集約成果物を
      識別可能とすること。索引・集約成果物は、索引構造の検査、索引漏れ・参照漏れの検査、
      所在確認、一般参照探索、明示的な索引構造問い合わせで利用可能とすること。
      索引・集約成果物であることだけを理由として、成果物またはその関係をグラフから削除しないこと。
      変更影響等から除外する主たる判断は、成果物名ではなくトレースリンクの意味に基づくこと。
  - id: AG-007
    content: |
      鮮度保証を必要とする問い合わせの実行前に、派生索引の鮮度を input_digest、
      graph_config_digest、generator_version、schema_version で判定すること。
      すべて一致する場合のみ既存索引を再利用すること。
      input_digest は派生索引生成対象となる正規入力の相対パスおよび内容、graph_config_digest は
      派生索引生成結果へ影響する適用後設定、generator_version は生成・解析結果の意味が変化する
      生成処理の版、schema_version は派生索引の物理構造の版とすること。
      派生索引生成結果へ影響しない問い合わせ時設定（discovery_roots、候補数上限、
      問い合わせ結果の表示設定）を、索引の再生成条件に含めないこと。
      正規入力ファイルの更新ごとに常時派生索引を再生成しないこと。鮮度保証を必要とする利用の
      直前に鮮度を確認し、不一致または索引不在の場合のみ再生成すること。
      生成不能の場合の動作は ADF Integration 層の障害時方針に従うこと。
  - id: AG-008
    content: |
      低位問い合わせとは別に、TIM の意味を利用した高位問い合わせとして related、impact、
      dependency、implementation、diagnostics を提供すること。各問い合わせは TIM の意味を
      利用する問い合わせプロファイルとして扱い、独立した関係モデルを持たないこと。
      related は起点成果物と明示的なトレースまたは一般参照を持つ関連成果物候補を取得すること、
      また related の結果を変更影響または依存関係として解釈しないこと。
      impact は起点成果物を変更した場合に影響を受ける可能性がある成果物候補を取得すること、
      探索方向は TIM に定義された関係の変更影響意味から導出すること、一般参照または変更影響なしと
      定義された関係を単にリンクが存在することだけを理由に探索経路として使用しないこと。
      dependency は起点成果物が成立、実現または実行されるために依存する成果物候補を取得すること、
      依存関係として定義されていない一般参照を依存関係として扱わないこと。
      implementation は要件、仕様、設計等を実現・実装する成果物候補を取得すること、TIM 上の
      実現・実装・充足系列の関係を利用する問い合わせプロファイルとして扱うこと、将来より一般的な
      coverage 問い合わせへ統合または上位化できる設計とすること。
      diagnostics は構造上の注目候補を通常の関連探索とは分離した診断問い合わせとして扱うこと、
      診断対象には必要に応じて孤立候補、未解決関係、廃止成果物への関係、関係制約違反、循環候補、
      複数経路、関係集中、根拠欠落を含めること、構造的特徴だけから異常を確定しないこと、
      関係型ごとに TIM で制約が定義されている場合はその制約に基づいて判定すること、
      ADF 固有の所有・統制構造等は ADF Integration 層の診断規則として扱うこと。
  - id: AG-009
    content: |
      各高位問い合わせは標準候補数上限を持てること。標準上限値はコードへ直書きせず、
      問い合わせ設定として管理すること。プロジェクト拡張は候補数上限を上書き可能とし、
      候補数上限の変更によって TIM 上の関係意味または探索意味を変更しないこと。
      標準候補数上限は代表ケースによる回帰検証結果に基づいて決定すること。正常な代表ケースの
      必須候補を欠落させず、AI へ渡す候補量を実用的な範囲に抑えること。
      索引成果物等による候補増幅を候補数上限だけで抑制しないこと。正常ケースと候補増幅ケースを
      上限値だけで分離できない場合は、関係意味または問い合わせ規則を見直すこと。
      問い合わせ結果が候補数上限を超えた場合、候補を黙って切り捨てないこと。問い合わせプロファイルに
      定義された決定論的な優先・除外規則を適用すること。それでも上限を超える場合は、
      候補過多であること、全候補数、返却候補数、適用した絞り込み規則、独立探索へ移行可能であることを
      返すこと。候補過多のみを理由として ADF ワークフロー全体を停止させないこと。
      高位問い合わせは候補ごとに候補成果物、候補となった理由、トレースリンク型、探索方向、
      到達経路を確認可能とすること。詳細な根拠箇所は根拠問い合わせの責務とし、
      高位問い合わせへ根拠詳細を重複保持しないこと。
      候補が存在しない場合、正常な空結果として扱うこと。空結果を派生索引障害として扱わないこと。
  - id: AG-010
    content: |
      成果物発見処理は、通常実行時に適用後設定から discovery_roots を自動解決すること。
      明示的な実行時上書きが指定された場合のみ、その実行に限って変更できること。
      通常の利用側ワークフローは探索範囲を重複して保持しないこと。
  - id: AG-011
    content: |
      ADF 固有ワークフローは、TIM、派生索引、問い合わせ内部規則を独自に再定義しないこと。
      ADF 側は必要な問い合わせ目的を指定し、返された候補を利用して判断すること。
      初期の利用方針は、req-define が related、impact、必要に応じて dependency、spec-save が related、
      case-open が impact、dependency、case-run が implementation、case-close が必要に応じて整合性確認、
      adversarial-review が diagnostics と論点に応じた他問い合わせ、inspect-docs 等が diagnostics を
      主な問い合わせとすること。この割り当ては ADF の責務分担を表すものであり、
      TIM そのものへ組み込まないこと。
      通常の case-run はトレーサビリティ問い合わせを利用して、新規の依存関係、実行構成、Wave 構成、
      実行順序を設計しないこと。依存関係および実行構成の決定責務は、既存の ADF 責務分担に従い
      上流工程に維持すること。case-run は既に決定された実装対象と正規成果物の実現関係確認を
      主用途とすること。
  - id: AG-012
    content: |
      トレーサビリティ問い合わせ結果を最終判断として扱わないこと。必要な判断では、正規成果物本文、
      rg 等の文字列探索、ファイル探索、その他の独立した正規情報確認手段の少なくともいずれかで
      確認可能とすること。派生索引の不在、生成失敗、空結果、候補過多だけを理由として
      「関係なし」「影響なし」と判断しないこと。
      派生索引が存在しない、破損している、生成できない、問い合わせできない場合でも、
      ADF 標準ワークフローは代替探索が可能な限り継続すること。トレーサビリティ基盤の障害だけを
      理由として ADF ワークフローを恒常的に停止させないこと。正規成果物そのものの異常と
      派生索引側の異常を区別すること。
      既存の低位問い合わせとして、隣接関係、ノード間経路、根拠・出典に相当する能力を維持すること。
      既存の neighbors、path、provenance の公開動作は、必要な互換性評価を行わずに
      全面変更しないこと。

# artifact_actions: REQ/Decision/SPEC への保存対象（単一配列）
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-012.md
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007]
    content: |
      【目的 改訂】
      REQ-013（旧: DOC-MAP 依存除去、docs/requirements/retired/ へ移行、後継は本 REQ）により廃止された
      旧文書探索経路インデックスに代わる標準探索モデルとして、Traceability Information Model（TIM）を
      成果物間トレーサビリティの正規論理モデルとして採用する。成果物型・トレースリンク型・関係の意味は
      SysML、OSLC、OpenFastTrace 等で確立された標準語彙を優先して採用し、Artifact Graph は TIM に基づく
      トレーサビリティ情報から生成される再生成可能な派生索引として位置付ける。標準コアと augmentation を
      分離し、open extensibility によって self-hosting 固有知識を標準契約から除外する。

      【要件表 既存行の更新】
      | REQ-012-003 | 標準スキルのデフォルト成果物型は永続文書種別に対応する最小集合とし、それ以外の成果物型は augmentation が追加すること。デフォルト種別および追加可能な種別の一覧、標準語彙との対応は TIM 語彙カタログ SPEC（docs/specs/foundations/traceability-model.md）が正規所有すること |
      | REQ-012-004 | 成果物型、トレースリンク型は closed-enum ではなく augmentation から追加可能な open extension point として実装すること。高位問い合わせへ参加させる拡張関係型は、関係の意味および変更影響方向等の必要な意味情報を明示すること |
      | REQ-012-013 | 同一入力（input_digest、graph_config_digest、generator_version、schema_version が同一）から生成した派生索引ファイル群がバイト単位で同一であること。鮮度判定も同4要素で行い、すべて一致する場合のみ既存索引を再利用すること |

      【要件表 新規行の追加】
      | REQ-012-018 | TIM を成果物間トレーサビリティの正規論理モデルとすること。TIM は少なくとも成果物型、トレースリンク型、リンク元成果物型、リンク先成果物型、関係の意味、変更影響方向、必要な関係制約、根拠情報への関連付けを表現できること。グラフの物理保存形式は TIM そのものとみなさないこと |
      | REQ-012-019 | 成果物型およびトレースリンク型は、SysML、OSLC、OpenFastTrace 等で確立された概念・語彙を優先して採用すること。分解、具体化、仕様化、制約、依存、実現、充足、実装、検証、妥当性確認、置換・改訂、一般参照に相当する意味を独自語彙として重複定義しないこと。既存語彙で ADF の意味を十分に表現できない場合のみ ADF 固有関係を追加すること |
      | REQ-012-020 | Decision を ADF 固有の成果物型として TIM へ追加すること。Decision と他成果物との関係は、既存の標準的な関係型で表現可能な場合その関係型を利用すること。Decision という成果物型が ADF 固有であることを理由として Decision 専用の関係型を無条件に追加しないこと |
      | REQ-012-021 | 一般的な文書参照と、変更影響・依存・実現・充足・検証等の意味を持つトレースリンクを区別すること。単に参照関係が存在することだけを理由に、変更影響、依存、実現、充足、検証の各探索へ参加させないこと。一般参照は、関連成果物確認、所在確認、低位問い合わせ等では利用可能とすること |
      | REQ-012-022 | 変更影響、依存、実現関係等の探索方向を、問い合わせごとの個別ハードコードだけで決定しないこと。TIM に定義された関係の意味から、目的別問い合わせの探索方向・参加可否を導出できること。変更影響について、リンク方向へ影響、逆方向へ影響、双方向へ影響、変更影響なしを関係ごとに区別でき、リンクの記述方向と変更影響方向を同一視しないこと |
      | REQ-012-023 | プロジェクト拡張によって新しい関係型を追加可能とすること。新しい関係型を高位問い合わせへ参加させる場合は、その関係型について必要な意味情報を明示すること。未知の関係型について、名前や LLM 推論等から意味を自動推定しないこと。意味定義が存在しない関係型は、低位問い合わせでは利用可能とし、高位問い合わせへ自動参加しないこと |
      | REQ-012-024 | README、INDEX、CATALOG 等の名称そのものではなく、成果物の役割として索引・集約成果物を識別可能とすること。索引・集約成果物は、索引構造の検査、索引漏れ・参照漏れの検査、所在確認、一般参照探索、明示的な索引構造問い合わせで利用可能とし、索引・集約成果物であることだけを理由として成果物またはその関係をグラフから削除しないこと。変更影響等から除外する主たる判断は、成果物名ではなくトレースリンクの意味に基づくこと |
      | REQ-012-025 | 正規入力ファイルの更新ごとに常時派生索引を再生成しないこと。鮮度保証を必要とする利用の直前に鮮度を確認し、不一致または索引不在の場合のみ再生成すること。生成不能の場合の動作は ADF Integration 層の障害時方針に従うこと。派生索引生成結果へ影響しない問い合わせ時設定（discovery_roots、候補数上限、問い合わせ結果の表示設定）を索引の再生成条件に含めないこと |

      【適用範囲 更新】
      対象に TIM 導入、標準語彙対応、一般参照と意味的トレースリンクの分離、関係意味定義、索引・集約成果物の役割識別、鮮度保証、利用時再生成を追加する。
      対象外に高位問い合わせ（REQ-040）、ADF ワークフロー統合の詳細割り当て（REQ-021）、候補数上限決定回帰の選定基準詳細（REQ-020）を明記する。

      【関連情報 更新】
      関連 REQ に REQ-021、REQ-020、REQ-040 を追記する。関連 Decision に新規 tim-traceability-model を追記する（DEC-007 は維持）。
  - id: ACT-REQ-002
    artifact: req
    operation: create
    target: REQ-040
    source_items: [AG-008, AG-009, AG-010, AG-012]
    content: |
      【タイトル】トレーサビリティ高位問い合わせ（Trace Query）

      【目的】
      TIM に定義された関係の意味を利用した目的別の高位問い合わせ（related、impact、dependency、
      implementation、diagnostics）を提供する。各問い合わせは TIM の意味を利用する問い合わせ
      プロファイルであり、独立した関係モデルを持たない。TIM および派生索引（Trace Index）の要件は
      REQ-012 が所管し、本 REQ は Trace Query 層を所管する。既存の低位問い合わせ
      （neighbors、path、provenance）の公開動作は、必要な互換性評価を行わずに全面変更しない。

      【要件表】
      | ID | 要件 |
      |---|---|
      | 001 | 低位問い合わせとは別に、TIM の意味を利用した高位問い合わせとして related、impact、dependency、implementation、diagnostics を提供すること。各問い合わせは問い合わせプロファイルとして扱い、独立した関係モデルを持たないこと |
      | 002 | related は、起点成果物と明示的なトレースまたは一般参照を持つ関連成果物候補を取得すること。related の結果を、変更影響または依存関係として解釈しないこと |
      | 003 | impact は、起点成果物を変更した場合に影響を受ける可能性がある成果物候補を取得すること。探索方向は TIM に定義された関係の変更影響意味から導出すること。一般参照または変更影響なしと定義された関係を、単にリンクが存在することだけを理由に探索経路として使用しないこと |
      | 004 | dependency は、起点成果物が成立、実現または実行されるために依存する成果物候補を取得すること。依存関係として定義されていない一般参照を依存関係として扱わないこと |
      | 005 | implementation は、要件、仕様、設計等を実現・実装する成果物候補を取得すること。TIM 上の実現・実装・充足系列の関係を利用する問い合わせプロファイルとして扱うこと。将来、より一般的な coverage 問い合わせへ統合または上位化できる設計とすること |
      | 006 | diagnostics は、構造上の注目候補を通常の関連探索とは分離した診断問い合わせとして扱うこと。診断対象には必要に応じて孤立候補、未解決関係、廃止成果物への関係、関係制約違反、循環候補、複数経路、関係集中、根拠欠落を含めること。構造的特徴だけから異常を確定しないこと。関係型ごとに TIM で制約が定義されている場合は、その制約に基づいて判定すること。ADF 固有の所有・統制構造等は ADF Integration 層の診断規則として扱うこと |
      | 007 | 各高位問い合わせは標準候補数上限を持てること。標準上限値はコードへ直書きせず、問い合わせ設定として管理すること。プロジェクト拡張は候補数上限を上書き可能とし、候補数上限の変更によって TIM 上の関係意味または探索意味を変更しないこと |
      | 008 | 標準候補数上限は代表ケースによる回帰検証結果に基づいて決定すること。正常な代表ケースの必須候補を欠落させず、AI へ渡す候補量を実用的な範囲に抑えること。索引成果物等による候補増幅を候補数上限だけで抑制しないこと。正常ケースと候補増幅ケースを上限値だけで分離できない場合は、関係意味または問い合わせ規則を見直すこと |
      | 009 | 問い合わせ結果が候補数上限を超えた場合、候補を黙って切り捨てないこと。問い合わせプロファイルに定義された決定論的な優先・除外規則を適用すること。それでも上限を超える場合は、候補過多であること、全候補数、返却候補数、適用した絞り込み規則、独立探索へ移行可能であることを返すこと。候補過多のみを理由として ADF ワークフロー全体を停止させないこと |
      | 010 | 高位問い合わせは候補ごとに候補成果物、候補となった理由、トレースリンク型、探索方向、到達経路を確認可能とすること。詳細な根拠箇所は根拠問い合わせの責務とし、高位問い合わせへ根拠詳細を重複保持しないこと。候補が存在しない場合、正常な空結果として扱うこと。空結果を派生索引障害として扱わないこと |
      | 011 | 成果物発見処理は、通常実行時に適用後設定から discovery_roots を自動解決すること。明示的な実行時上書きが指定された場合のみ、その実行に限って変更できること。通常の利用側ワークフローは探索範囲を重複して保持しないこと |
      | 012 | 既存の低位問い合わせとして、隣接関係、ノード間経路、根拠・出典に相当する能力を維持すること。既存の neighbors、path、provenance の公開動作は、必要な互換性評価を行わずに全面変更しないこと |

      【適用範囲】
      対象: 高位問い合わせ5種、問い合わせプロファイル、候補数上限と候補過多時動作、問い合わせ結果形式、discovery_roots 自動解決、低位問い合わせの維持
      対象外: TIM の定義と標準語彙対応（REQ-012）、ADF ワークフローへの割り当て（REQ-021）、代表質問・代表ケース回帰の選定基準詳細（REQ-020）、Artifact Graph または派生索引の正規情報源化、LLM によるトレースリンク意味の自動確定、未知関係型の名前からの自動分類、意味的類似度によるトレースリンク自動生成

      【関連情報】
      関連 REQ: REQ-012（TIM・Trace Index）、REQ-020（解析品質と回帰検証）、REQ-021（ADF ワークフロー統合）
      関連 Decision: DEC-007（Artifact Graph 標準化と配布スキル昇格）、DEC-017
  - id: ACT-REQ-003
    artifact: req
    operation: update
    target: docs/requirements/REQ-021.md
    source_items: [AG-011, AG-012]
    content: |
      【目的 改訂】
      AgentDevFlow における成果物間の探索、影響分析、構造診断、レビュー証拠探索、変更後検証の各用途で、
      TIM に基づくトレーサビリティ派生索引の高位問い合わせ（related、impact、dependency、
      implementation、diagnostics）を共通探索基盤として実効利用する。派生索引は候補提供者であり、
      決定的検査、意味診断、最終判断は既存の正規所有者に残す。派生索引は SSoT または
      意味判断エンジンにはしない。

      【要件表 既存行の更新（プロファイル語彙への寄せと「関連 ADR」→「関連 Decision」修正を含む）】
      | REQ-021-001 | req-define, spec-save, backlog-review が related、impact、必要に応じて dependency の問い合わせプロファイルを、既存 REQ、関連 Decision、関連 SPEC、canonical owner、影響候補の探索に利用できること。spec-save は対応 REQ、同一 canonical owner の SPEC、関連 command、skill、integrity rule を、backlog-review は統合、分割、depends_on の補助 evidence を探索できること。Graph 単独で CREATE, APPEND, UPDATE, SPLIT, MERGE, 意味的重複, canonical owner, SPEC 正規配置先, target_area を確定しないこと |
      | REQ-021-002 | case-open が Issue 対象範囲、完了条件、test strategy の確定前に impact と dependency の問い合わせプロファイルにより変更影響候補を評価し、候補を in scope, verification only, out of scope に分類すること。必須品質能力の導出は artifact-quality-control-routing SPEC の artifact type から品質能力キーへの変換に従い、Graph の関係から必須 skill を直接決定しないこと |
      | REQ-021-003 | inspect-docs, inspect-skills が diagnostics 問い合わせを構造診断候補の探索に利用できること。候補には unresolved reference, superseded artifact への現行参照, dangling relation, provenance 欠落, orphan candidate, structural duplicate candidate, command と skill 関係, 予期しない delegation を含むこと。Graph は候補提供者であり、決定的検査は docs-check, IR-056 が所有すること。inspect-docs, inspect-skills は Graph 構造候補を未検証 evidence として意味診断の入力に利用し、構造診断と意味診断を区別すること |
      | REQ-021-004 | agentdev-adversarial-review が diagnostics および論点に応じた他の問い合わせを、レビュー対象候補および evidence の探索に利用し、複数規範的成果物から到達する対象、複数経路、cycle、relation 集中ノード、isolated node、複数 owner または governing relation を持つ候補を探索できること。Graph から得た情報を未検証 evidence として対論または正規成果物確認を経ずに finding を確定しないこと |
      | REQ-021-005 | case-close が派生索引を変更後の生成・鮮度、整合性、unresolved relation, dangling relation, provenance defect, 独立確認結果との差異の検証に利用し、Graph defect と canonical defect を区別すること。索引生成または問い合わせ失敗のみを理由に case-close を失敗させず fail-open すること。正規成果物側の実不整合が確認された場合は既存の品質ゲート、受け入れ条件に従って fail とすること |

      【要件表 新規行の追加】
      | REQ-021-007 | 通常の case-run はトレーサビリティ問い合わせを利用して、新規の依存関係、実行構成、Wave 構成、実行順序を設計しないこと。依存関係および実行構成の決定責務は、既存の ADF 責務分担に従い上流工程に維持すること。case-run は既に決定された実装対象と正規成果物の実現関係確認（implementation）を主用途とすること |
      | REQ-021-008 | ADF 固有ワークフローは、TIM、派生索引、問い合わせ内部規則を独自に再定義しないこと。ADF 側は必要な問い合わせ目的を指定し、返された候補を利用して判断すること。ワークフローと問い合わせの割り当ては agentdev-artifact-graph SPEC（ワークフロー利用）が正規所有し、この割り当ては ADF の責務分担を表すものであり TIM そのものへ組み込まないこと |
      | REQ-021-009 | トレーサビリティ問い合わせ結果を最終判断として扱わないこと。必要な判断では、正規成果物本文、rg 等の文字列探索、ファイル探索、その他の独立した正規情報確認手段の少なくともいずれかで確認可能とすること。派生索引の不在、生成失敗、空結果、候補過多だけを理由として「関係なし」「影響なし」と判断しないこと |
      | REQ-021-010 | 派生索引が存在しない、破損している、生成できない、問い合わせできない場合でも、ADF 標準ワークフローは代替探索が可能な限り継続すること。トレーサビリティ基盤の障害だけを理由として ADF ワークフローを恒常的に停止させないこと。正規成果物そのものの異常と派生索引側の異常を区別すること |

      【関連情報 更新】
      関連 REQ に REQ-040 を追記する。関連 Decision に新規 tim-traceability-model を追記する。
  - id: ACT-REQ-004
    artifact: req
    operation: update
    target: docs/requirements/REQ-020.md
    source_items: [AG-009]
    content: |
      【要件表 新規行の追加】
      | REQ-020-006 | 高位問い合わせの標準候補数上限は、代表ケースによる回帰検証結果に基づいて決定すること。当該回帰検証は代表質問回帰検証（REQ-020-003）の体系に接続して運用し、README 等を経由した既知の候補増幅を再現する回帰試験を含めること |

      【関連情報 更新】
      関連 REQ に REQ-040 を追記する。
  - id: ACT-DEC-001
    artifact: decision
    operation: create
    target: DEC-017
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-011]
    content: |
      【タイトル】TIM 準拠トレーサビリティモデルの採用と4層分離

      【背景】
      現行 Artifact Graph は成果物間の明示関係を抽出する派生索引として独自のノード型・関係型・
      探索規則を持つ。再評価の結果、扱う問題の大部分はシステム開発におけるトレーサビリティ管理として
      SysML、OSLC、OpenFastTrace 等で既に体系化されている。独自概念・独自語彙・独自探索規則を
      極力減らし、標準化された概念・語彙を優先して採用する。また現行利用で、索引・集約成果物経由の
      候補増幅、関係意味と一般参照の混在、探索規則の個別実装、古い派生索引の利用、候補数制御不能、
      ワークフロー固有規則と汎用機能の混在が確認されている。

      【決定】
      1. Traceability Information Model（TIM）を成果物間トレーサビリティの正規論理モデルとして採用する。
         Artifact Graph 固有のノード型・関係型定義を上位モデルとせず、Artifact Graph は TIM に基づく
         派生索引として位置付ける。グラフの物理保存形式は TIM そのものとみなさない。
      2. 成果物型・トレースリンク型は、SysML、OSLC、OpenFastTrace 等で確立された概念・語彙を
         優先して採用する。既存語彙で ADF の意味を十分に表現できない場合のみ ADF 固有関係を追加する。
      3. Decision を ADF 固有の拡張成果物型として TIM へ追加する。Decision 専用の関係型を
         無条件に追加しない。
      4. 意味的トレースリンクと一般参照を分離し、変更影響・依存・実現等の探索方向・参加可否を
         TIM に定義された関係の意味から導出する。リンクの記述方向と変更影響方向を同一視しない。
      5. トレーサビリティ機能を TIM、Trace Index、Trace Query、ADF Integration の4層へ分離する。
         ADF Integration 層は TIM・派生索引・問い合わせ内部規則を独自に再定義せず、
         問い合わせ目的の指定と返却候補による判断を責務とする。

      【影響】
      - 現行 node_types / relation_types の語彙は、TIM 語彙カタログ SPEC
        （docs/specs/foundations/traceability-model.md）が正規所有する標準語彙対応へ移行する
      - 鮮度判定は input_digest、graph_config_digest、generator_version、schema_version の
        4要素へ再構成される
      - neighbors、path、provenance の公開動作は、必要な互換性評価を行わずに全面変更しない
      - REQ-012 は TIM・Trace Index 層の要件へ更新され、Trace Query 層は新規 REQ、
        ADF Integration 層は REQ-021 が所管する

      【関係】
      - relates-to DEC-007: グラフモデルの概念基盤部分（標準コア語彙を上位モデルとする前提）を
        本 Decision が置換する。配布スキル昇格、augmentation 分離、fail-open、決定論性、
        verification feedback は維持する
      - relates-to DEC-009: Decision 成果物型の TIM 上の位置づけ（ADF 拡張）
      - relates-to DEC-010: 4層分離はトレーサビリティ機能内部の概念層であり、
        Command / Workflow Skill / Capability Skill の配布物3層モデルとは別軸である
  - id: ACT-SPEC-001
    artifact: spec
    operation: create
    target: docs/specs/foundations/traceability-model.md
    target_spec:
      operation: create
      domain: foundations
      slug: traceability-model
    spec_logical_division: カタログSPEC
    canonical_owner: agentdev-artifact-graph
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006]
    content: |
      【タイトル】Traceability Information Model（TIM）語彙カタログ

      【目的】
      TIM の成果物型、トレースリンク型、関係の意味、関係制約のカタログを正規所有する。
      agentdev-artifact-graph の派生索引生成と高位問い合わせは本カタログを正とする。
      REQ-012 が要件契約を、本 SPEC が語彙・意味定義の実体を所管する。

      【セクション構成】
      - TIM が表現する要素の定義: 成果物型、トレースリンク型、リンク元成果物型、リンク先成果物型、
        関係の意味、変更影響方向、必要な関係制約、根拠情報への関連付け
      - 標準成果物型カタログ: SysML、OSLC、OpenFastTrace 等との対応表。ADF 固有の拡張として
        Decision 成果物型の追加位置づけ。プロジェクト拡張による成果物型追加様式
      - 標準トレースリンク型カタログ: 分解、具体化、仕様化、制約、依存、実現、充足、実装、検証、
        妥当性確認、置換・改訂、一般参照の各意味スロットに対する採用語彙と出典標準の対応、
        既存5関係型（references, supersedes, defined_in, contains, extends）の移行先
      - 変更影響方向の定義: リンク方向へ影響、逆方向へ影響、双方向へ影響、変更影響なしの4値、
        リンク記述方向と変更影響方向の非同一視、各トレースリンク型への割り当て
      - 関係制約: リンク元・リンク先成果物型の組合せ制約、TIM で定義された制約に基づく
        diagnostics 判定の扱い
      - 拡張関係型の意味定義様式: 高位問い合わせ参加に必要な意味情報の必須項目、
        名前や LLM 推論による意味の自動推定禁止、意味未定義関係型の低位問い合わせ限定利用
      - 索引・集約成果物の役割識別: 名称ではなく役割による識別、利用可能用途
        （索引構造検査、索引漏れ・参照漏れ検査、所在確認、一般参照探索、明示的索引構造問い合わせ）、
        グラフからの削除禁止、変更影響除外判断のトレースリンク意味基準
      - 語彙採用基準: SysML、OSLC、OpenFastTrace 間で完全に同一の語彙が存在しない場合、
        意味の一致度と ADF の利用目的を基準に採用語彙を決定する
  - id: ACT-SPEC-002
    artifact: spec
    operation: update
    target: docs/specs/skills/agentdev-artifact-graph.md
    target_area: "## ワークフロー利用"
    spec_logical_division: 挙動SPEC
    canonical_owner: agentdev-artifact-graph
    source_items: [AG-011]
    content: |
      【ワークフロー利用セクションの更新】
      ワークフローと問い合わせプロファイルの割り当て表へ更新する。

      | ワークフロー | 主な問い合わせ |
      |---|---|
      | req-define | related、impact、必要に応じて dependency |
      | spec-save | related |
      | case-open | impact、dependency |
      | case-run | implementation（既に決定された実装対象と正規成果物の実現関係確認。新規の依存関係、実行構成、Wave 構成、実行順序の設計は行わない） |
      | case-close | 必要に応じて整合性確認 |
      | adversarial-review | diagnostics、論点に応じた他問い合わせ |
      | inspect-docs 等 | diagnostics |

      この割り当ては ADF の責務分担を表すものであり、TIM そのものへ組み込まない。
      ADF 固有ワークフローは TIM、派生索引、問い合わせ内部規則を独自に再定義せず、
      問い合わせ目的を指定し返された候補を利用して判断する。
      問い合わせ結果を最終判断として扱わず、正規成果物本文、rg 等の文字列探索、ファイル探索等の
      独立確認手段を必要な判断で利用する。派生索引の不在、生成失敗、空結果、候補過多だけを
      理由として「関係なし」「影響なし」と判断しない。
  - id: ACT-SPEC-003
    artifact: spec
    operation: spec-append
    target: docs/specs/skills/agentdev-artifact-graph.md
    target_area: "## 高位問い合わせプロファイル"
    spec_logical_division: 挙動SPEC
    canonical_owner: agentdev-artifact-graph
    source_items: [AG-008, AG-009]
    content: |
      【高位問い合わせプロファイルセクションの追加（spec-append、配置位置は「問い合わせ結果の出力形式」節の直後）】

      高位問い合わせ related、impact、dependency、implementation、diagnostics を
      問い合わせプロファイルとして定義する。各プロファイルは TIM の意味を利用し、
      独立した関係モデルを持たない。

      - related: 起点成果物と明示的なトレースまたは一般参照を持つ関連成果物候補の取得。
        結果を変更影響または依存関係として解釈しない
      - impact: 起点成果物を変更した場合に影響を受ける可能性がある成果物候補の取得。
        探索方向は TIM に定義された関係の変更影響意味から導出する。一般参照または変更影響なしと
        定義された関係を、単にリンクが存在することだけを理由に探索経路として使用しない
      - dependency: 起点成果物が成立、実現または実行されるために依存する成果物候補の取得。
        依存関係として定義されていない一般参照を依存関係として扱わない
      - implementation: 要件、仕様、設計等を実現・実装する成果物候補の取得。
        実現・実装・充足系列の関係を利用する。将来 coverage 問い合わせへ統合・上位化できる設計
      - diagnostics: 構造上の注目候補（孤立候補、未解決関係、廃止成果物への関係、関係制約違反、
        循環候補、複数経路、関係集中、根拠欠落）の診断。構造的特徴だけから異常を確定しない。
        ADF 固有の所有・統制構造等は ADF Integration 層の診断規則として扱う

      共通規則:
      - 候補数上限は問い合わせ設定として管理し、コードへ直書きしない。プロジェクト拡張は
        上限を上書き可能とする。標準上限値の決定は代表ケースによる回帰検証結果に基づく
      - 上限超過時は決定論的な優先・除外規則を適用し、それでも超える場合は候補過多であること、
        全候補数、返却候補数、適用した絞り込み規則、独立探索へ移行可能であることを返す。
        候補過多のみを理由として ADF ワークフロー全体を停止させない
      - 問い合わせ結果は候補ごとに候補成果物、候補となった理由、トレースリンク型、探索方向、
        到達経路を確認可能とする。詳細な根拠箇所は根拠問い合わせ（provenance）の責務とし、
        高位問い合わせへ根拠詳細を重複保持しない
      - 候補が存在しない場合、正常な空結果として扱う

# conflict_resolutions: 壁打ちで解消された衝突の記録
conflict_resolutions:
  - id: CR-001
    conflict: 既存REQへの投影方針（案A: REQ-012/021 UPDATE + 層分割 vs 案B: RETIRE and CREATE vs 案C: 単一REQ化）
    resolution: >-
      案Aを採用。AG SPEC「検証観点」が REQ-012 サブID を8件直接参照、retired/REQ-013 の後継記載、
      DEC-007 関連REQ表等の参照断絶コスト、および RU-IDX-002（既存公開動作の互換性維持）の精神に
      合致するため。RU 全28要件を単一REQ化すると要件行数が肥大化閾値（51行超）へ到達するため案Cは不採用。
      ユーザー合意済み（推奨案に合意）。
  - id: CR-002
    conflict: SPEC 分離範囲（TIM 語彙カタログ、ワークフロー割り当て表、問い合わせプロファイル詳細の3候補を SPEC 分離するか）
    resolution: >-
      3候補すべて SPEC 分離を採用（ユーザー合意済み）。TIM 語彙カタログはスキル SPEC に置くと
      モデルがスキルに従属し RU-TIM-001（Artifact Graph 固有定義を上位モデルとしない）と逆転するため
      specs/foundations/traceability-model.md として新規作成する。割り当て表・プロファイル詳細は
      agentdev-artifact-graph SPEC へ更新・追加する。REQ 側は契約レベルの要件行を保持する。
  - id: CR-003
    conflict: graph_config_digest と既存鮮度フィールド（indexed_paths, excluded_paths）の関係が RU から確定不能（集約か置換か）
    resolution: >-
      要件文は RU-IDX-004 の定義通りの4要素鮮度判定のみを規定し、既存 manifest フィールド構成の
      維持・集約の別を要件本文で前提としない。物理構成の確定は SPEC・実装工程に委ねる。
      （アーキテクチャ助言 U-1、助言レポート I-3 に基づく）
  - id: CR-004
    conflict: RU の回帰検証（候補数上限決定・候補増幅）と REQ-020 代表質問回帰（10件）の関係
    resolution: >-
      候補数上限決定の代表ケース回帰は REQ-020 の代表質問回帰体系に接続して運用する。
      REQ-020 側は「候補数上限決定根拠の回帰検証」への接続行（REQ-020-006）の追加に留め、
      10件選定基準の再定義は行わない。（アーキテクチャ助言 U-4 に対する処置）

# operation_units: 統合/分離結果
operation_units:
  - ou_id: OU-0001
    source_ru: RU-0001
    target_req: REQ-012
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      status: applied
      saved_docs: [docs/requirements/REQ-012.md]
      action_ids: [ACT-REQ-001]
  - ou_id: OU-0002
    source_ru: RU-0001
    target_req: REQ-040
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result:
      status: applied
      saved_docs: [docs/requirements/REQ-040.md]
      action_ids: [ACT-REQ-002]
      allocated_id: REQ-040
  - ou_id: OU-0003
    source_ru: RU-0001
    target_req: REQ-021
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    result:
      status: applied
      saved_docs: [docs/requirements/REQ-021.md]
      action_ids: [ACT-REQ-003]
  - ou_id: OU-0004
    source_ru: RU-0001
    target_req: REQ-020
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 4
    issue_policy: single
    result:
      status: applied
      saved_docs: [docs/requirements/REQ-020.md]
      action_ids: [ACT-REQ-004]
  - ou_id: OU-0005
    source_ru: RU-0001
    target_spec:
      operation: create
      domain: foundations
      slug: traceability-model
    operation: spec-create
    scale: standard
    depends_on: []
    recommended_order: 5
    issue_policy: single
    result: {}

# test_strategy: 各合意項目の検証方法（3要素必須）
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      REQ-012 更新後の要件表が TIM 表現要素（成果物型、トレースリンク型、リンク元・リンク先、
      関係の意味、変更影響方向、関係制約、根拠関連付け）と「物理保存形式は TIM とみなさない」を
      含むこと、および traceability-model SPEC が同要素の定義を持つことを確認する。
    pass_criteria: |
      8表現要素すべてが REQ-012 要件行または TIM 語彙カタログ SPEC に存在すること。
      Artifact Graph が派生索引と位置付けられ、正規情報源とされていないこと。
    on_failure: |
      fix-and-reverify。REQ-012 または SPEC の定義を修正して再確認する。
  - id: TS-002
    target_item: AG-002
    verification: |
      TIM 語彙カタログ SPEC の対応表で、主要な成果物型・トレースリンク型について既存標準との対応
      または ADF 固有である理由を確認する。既存 node_types、relation_types
      （references, supersedes, defined_in, contains, extends）の移行先が対応表に存在すること、
      意味が重複する ADF 独自語彙が残っていないことを確認する。Decision が ADF 拡張成果物型として
      定義され、Decision 専用関係型が無条件追加されていないことを確認する。
    pass_criteria: |
      主要語彙の対応または固有理由が確認でき、重複定義が0件であること（AC-02、AC-03 相当）。
    on_failure: |
      fix-and-reverify。語彙カタログを修正して再確認する。
  - id: TS-003
    target_item: AG-003
    verification: |
      代表ケース（README 等の索引・集約成果物を含む docs 一式）で、一般参照のみを持つ成果物が
      impact、dependency、implementation の探索経路へ参加しないことを確認する。
      一方で related では一般参照候補が取得できること、明示的な索引構造問い合わせが
      利用可能であることを確認する。
    pass_criteria: |
      一般参照が関係意味を持たない状態で高位探索へ参加しないこと、索引構造の明示的問い合わせが
      利用可能であること（AC-04、AC-07 相当）。
    on_failure: |
      fix-and-reverify。リンク型の意味定義または探索規則を修正して再確認する。
  - id: TS-004
    target_item: AG-004
    verification: |
      順方向影響、逆方向影響、双方向影響、影響なしの各関係型について、TIM 定義の変更影響方向に
      従って impact 探索が動作することを個別に検証する。拡張関係型について、意味定義済みは
      高位問い合わせへ参加し、意味未定義は参加しないこと、未知関係型が存在しても
      低位問い合わせが破綻しないことを確認する。
    pass_criteria: |
      影響方向4値が個別に検証でき、意味定義済み拡張関係の参加・未定義の不参加・低位の継続動作が
      確認できること（AC-05、AC-06 相当）。
    on_failure: |
      fix-and-reverify。TIM の影響方向定義または問い合わせプロファイルを修正して再確認する。
  - id: TS-005
    target_item: AG-007
    verification: |
      正規入力変更、索引生成設定変更、generator_version 変更、schema_version 変更を個別に与え、
      鮮度判定と再生成を検証する。discovery_roots、候補数上限、結果表示設定のみの変更では
      再生成されないことを確認する。派生索引不在・破損（読み込み不能・スキーマ非互換）時に
      生成を試み、生成不能なら代替探索へ移行可能な状態を返すことを確認する。
    pass_criteria: |
      4変更種を個別検出し必要時に再生成すること、問い合わせ時設定変更で再生成しないこと、
      不在・破損時の挙動が仕様通りであること（AC-08〜AC-11 相当）。
    on_failure: |
      fix-and-reverify。鮮度判定または再生成処理を修正して再検証する。
  - id: TS-006
    target_item: AG-008
    verification: |
      related、impact、dependency、implementation、diagnostics がそれぞれ定義された意味に従って
      動作することを、各プロファイルの代表ケースで検証する。候補0件の場合が正常な空結果として
      扱われることを確認する。
    pass_criteria: |
      5プロファイルの意味準拠動作と空結果の正常扱いが確認できること（AC-12、AC-13 相当）。
    on_failure: |
      fix-and-reverify。プロファイル定義または実装を修正して再検証する。
  - id: TS-007
    target_item: AG-009
    verification: |
      候補数上限の境界試験（上限直前、上限一致、上限超過）を行い、上限適用と過多時の返却5項目
      （候補過多であること、全候補数、返却候補数、適用規則、独立探索移行可）を確認する。
      問い合わせ結果から候補、関係型、探索方向、到達経路、理由が確認できること、根拠詳細が
      根拠問い合わせ側にのみ存在することを確認する。
    pass_criteria: |
      黙切的切り捨てがなく、過多時情報と独立探索移行可が返ること、結果5要素と根拠分離が
      確認できること（AC-14〜AC-17 相当）。
    on_failure: |
      fix-and-reverify。優先・除外規則または結果形式を修正して再検証する。
  - id: TS-008
    target_item: AG-011
    verification: |
      ADF 各ワークフローの定義文書が探索方向、関係意味、TIM 定義を独自に保持していないことを
      確認する。通常の case-run がトレーサビリティ問い合わせによって新規の依存関係、Wave 構成、
      実行順序を決定しないことを確認する。
    pass_criteria: |
      ADF 側の独自定義が0件で、case-run の責務が実現関係確認に限定されていること
      （AC-19、AC-20 相当）。
    on_failure: |
      fix-and-reverify。当該ワークフロー文書を修正して再確認する。
  - id: TS-009
    target_item: AG-012
    verification: |
      派生索引不在、破損、生成失敗、問い合わせ失敗、候補過多の各状況で代替探索へ移行可能である
      ことを確認する。neighbors、path、provenance の既存公開動作が互換性評価を経ずに
      変更されていないことを確認する。
    pass_criteria: |
      5障害状況すべてで代替探索移行が可能であること、既存低位問い合わせの公開動作が
      維持されていること（AC-21、RU-IDX-002 相当）。
    on_failure: |
      fix-and-reverify。障害時処理または互換性回帰を修正して再検証する。
  - id: TS-010
    target_item: AG-009
    verification: |
      代表ケースについて、必須候補の見逃し、誤候補、候補総数、一般参照経由の候補増幅、
      索引・集約成果物経由の候補増幅、探索方向、変更影響なし関係の誤通過、拡張関係の参加可否、
      派生索引側だけの見逃し、独立探索側だけの見逃しを比較確認する。
      README 等を経由した既知の候補増幅を再現する回帰試験を含める。
    pass_criteria: |
      代表ケースの必須候補欠落なし、既知候補増幅の再現を含む回帰試験が通過すること
      （AC-22 相当）。
    on_failure: |
      実装不備が承認済み範囲内で解決可能な場合は fix-and-reverify。
      要件変更、対象範囲拡大、追加の意味定義、標準語彙選択、外部依存解消が必要な場合は
      反復を停止し必要な判断事項を報告する（record-in-findings）。

# review_dispositions: 採否判断の記録
review_dispositions:
  - id: RD-001
    source_ru: RU-0001
    source_item: ru-0001-requirements
    disposition: covered
    reason_code: mapped_to_agreed_item
    reason: |
      RU-0001 の要件28項目（RU-TIM-001〜006、RU-IDX-001〜006、RU-QRY-001〜011、RU-ADF-001〜005）は
      すべて AG-001〜AG-012 へ反映し、案A（REQ-012 UPDATE、REQ-040 CREATE、
      REQ-021 UPDATE、REQ-020 軽微 UPDATE）へ投影済み。受け入れ条件 AC-01〜AC-22 は
      test_strategy（TS-001〜TS-010）へ対応付け済み。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 要件
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0001
    source_item: ru-0001-working-assumptions
    disposition: not_applicable
    reason_code: out_of_scope
    reason: |
      作業仮定6件（物理形式の再利用可能性、jsonl 全面廃止不要、既存問い合わせ実装の拡張可能性、
      generator_version の版管理方式、低位問い合わせへの不必要な破壊的変更禁止、
      標準語彙間不一致時の採用基準）は要件ではなく、要件本文へ確定事項として混入しない。
      うち語彙採用基準は TIM 語彙カタログ SPEC の選定基準として反映する。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 作業仮定
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_ru: RU-0001
    source_item: ru-0001-out-of-scope
    disposition: not_applicable
    reason_code: out_of_scope
    reason: |
      RU-0001 の対象外宣言（派生索引の正規情報源化、LLM による意味自動確定、未知関係型の
      自動分類、索引成果物そのものの削除、保存時常時再生成、ADF 固有責務の TIM 組込み、
      case-run による再設計、外部ツール全面置換、ReqIF 交換、意味的類似度による自動リンク生成）は
      各 REQ の対象外欄へ継承する。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 対象外
      checked_at_commit: null
    related_removed_items: []

# case_open_hints: case-open 構成生成への参考情報（Issue 階層は case-open が決定する）
case_open_hints:
  epic_needed: true
  decomposition: >-
    4層分離に対応する4 REQ 操作（OU-0001 REQ-012 UPDATE、OU-0002 REQ-040 CREATE、
    OU-0003 REQ-021 UPDATE、OU-0004 REQ-020 UPDATE）+ TIM 語彙カタログ SPEC CREATE（OU-0005）+
    Decision CREATE（ACT-DEC-001）+ AG SPEC 更新2件（ACT-SPEC-002/003）。
    新規 REQ の採番は req-save 時に次番号（REQ-040 想定）で行われる。
    ACT-SPEC-002 は OU-0003（REQ-021）と、ACT-SPEC-003 は OU-0002（新規 REQ）と
    同一ストーリーで実装するのが自然。
  wave_hints:
    - "Wave 1: TIM 基盤（OU-0001 REQ-012、OU-0005 TIM 語彙カタログ SPEC、ACT-DEC-001 Decision）"
    - "Wave 2: Trace Query（OU-0002 新規 REQ、ACT-SPEC-003 高位問い合わせプロファイル）"
    - "Wave 3: ADF 統合と回帰（OU-0003 REQ-021、ACT-SPEC-002 ワークフロー利用、OU-0004 REQ-020）— 並列実行可"
```

# summary

RU-0001（TIM準拠トレーサビリティモデル・派生索引・目的別探索の再構成）を案Aで投影する。
合意項目12（AG-001〜012）、保存対象9 action（REQ 4件: REQ-012 UPDATE / REQ-040 CREATE / REQ-021 UPDATE / REQ-020 軽微 UPDATE、Decision 1件: tim-traceability-model、SPEC 3件: foundations/traceability-model.md CREATE / AG SPEC ワークフロー利用 UPDATE / 高位問い合わせプロファイル APPEND）、OU 5件、test strategy 10項目。

主要な判断: (1) 案A（UPDATE 維持）は AG SPEC の REQ-012 サブID 参照等の参照断絶コストを避けるため、(2) TIM 語彙カタログはモデルがスキルへ従属しないよう foundations へ新規作成、(3) Decision は DEC-007 を全体 supersede せず relates-to による部分置換、(4) graph_config_digest と既存鮮度フィールドの集約・置換の別は要件本文で前提としない（CR-003）。

RU の作業仮定6件は要件本文へ混入せず、うち語彙採用基準のみ SPEC へ反映した（RD-002）。
