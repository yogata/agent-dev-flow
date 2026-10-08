---
draft_type: req_draft
topic_slug: req-structure
status: draft
created_at: 2026-10-08T16:24:00+09:00
source_rus: [RU-0186, RU-0187, RU-0188]
---

# draft-data

```yaml
work_type: maintenance

scale: standard

summary: |
  REQ 体系の構造品質を一括して是正する。retired 参照の保持基準明文化（Q3 案A）と DEC-013/DEC-022 同期、
  REQ-103 内部品質是正（AC-26 統一・RU-0181 混入除去・REQ-096 との 2 層構造の限定明記=Q4 案A）、
  REQ-008-059 のテーブル行復帰と fixture・判定ロジックの Design 分離（Q6 確定）、
  REQ 行への実装詳細残留の横断是正アンカー（観察メモ性）を含む。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      retired REQ への言及の保持基準を明文化する（壁打ち Q3 案A・ユーザー確定）:
      「歴史的説明として必要な言及は本文保持、現行契約参照と読める言及は置換」。
      保持基準は REQ-059 の宣言契約（related_reqs）と整合する形で定義する:
      Decision 本文中の retired REQ 言及のうち、当該 Decision の意思決定の経緯説明として機能する言及は保持し、
      現行 REQ への参照として機能する言及は現行側へ置換する。保持と置換の判定に迷う場合は
      言及先が意思決定当時の根拠として引用されているか（歴史的説明）で判定する。
      本基準を REQ-059 への要件行追加と document-model Design 文書ライフサイクル節への詳細基準で二層定義する。
  - id: AG-002
    content: |
      DEC-013 本文（関連情報節 :54-58 の retired REQ 言及）と README 索引の DEC-013 関連行を
      AG-001 の保持基準で同期する。同期対象の README 索引は docs/decisions/README.md である
      （:265 の DEC-013 REQ 対応表行と :224 の relates-to 行に retired 言及が実在。
      adversarial-review 両 stream の実測による。docs/README.md:265 はガイドリンク行であり
      RU-0186 側の参照誤りだった）。DEC-022 の retired REQ 取扱いの非対称（frontmatter と本文・索引の
      扱い差）を同一基準で解消する。
  - id: AG-003
    content: |
      IR-015（docs-check の検出対象）への保持基準違反検出の追加を評価し、次のとおり確定する:
      保持基準違反の検出は、誤検知（歴史的説明の保持対象）を判定材料なしに機械検出できないため、
      IR-015 への自動検出追加は行わず、inspect-docs 意味診断による順守確認に委ねる旨を
      document-model Design 側に記録する（評価結果 (b) で確定。技術的根拠は CR-005 を参照）。
  - id: AG-004
    content: |
      REQ-103-031 の AC 判定対象数を「AC-01 から AC-25 まで」から「AC-01 から AC-26 まで」へ更新する
      （受け入れ条件対応節の AC-26 行=REQ-103-031 対応との集計閉包）。あわせて Case #3530 の
      AC 判定記録（AC-26 判定の実施記録）への影響確認を処置に含め、判定記録側の集計との不整合があれば
      正規の訂正経路（完了訂正）で扱う。
  - id: AG-005
    content: |
      REQ-103 から RU-0181 特定の言及と作業経緯の混入を除去する。対象は受け入れ条件対応節の
      「RU-0181 および要件ドラフトの消費後も」（RU 一般化へ置換）と対象外節の
      「生成主体（session-supervisor）を ADF で別件正規化する作業（ユーザーの最新指示により並行作業は取り下げ…）」
      （経緯説明を削除し対象外項目のみ残す）。REQ-103-028 の baseline tag 名（baseline-v4-canonical-convergence-20261007）は
      タグ実在検証の要件実体として保持する。
  - id: AG-006
    content: |
      REQ-103 へ次の限定明記を追加する（壁打ち Q4 案A・ユーザー確定）:
      REQ-103-002〜012 は REQ-096 および Design 詳細基準節（v4-responsibility-boundaries「ADF判断アーキテクチャ詳細基準」節）が
      正規所有する判断契約の、全面再評価における再確認表現である。REQ-096 は現行契約として維持し、
      REQ-103-002〜012 の再確定後も要件行（原則水準）と詳細基準（Design 節）の 2 層構造として意味上の重複を生じない
      （RA-005 既存判定 v4-responsibility-boundaries:135 と同一範囲。REQ-103-013 は soft contract 定義行であり
      判断アーキテクチャ行ではないため対象外。RU-0187/F-03 側の「002〜013」は範囲指定が広すぎた）。
  - id: AG-007
    content: |
      REQ-008-059 をテーブル行形式へ復帰する（REQ-008-058〜062 の並びに 1 行として挿入）。
      見出し形式本文に埋め込まれていた代表 fixture（"TBD"、"TODO"、"未定"、"後続工程で確定"、"case-run で確定" 等）と
      判定ロジック詳細（決定的マーカー検査+QG-1 意味判定の組み合わせ仕様）は
      req-define command Design「未確定内容の auto_ready 抑止」節（docs/designs/commands/req-define.md:424）が
      正規所有する。要件行は判定義務と Design 節への参照のみを保持し、実装詳細を埋め込まない。
      Design 側節見出しの由来表記（REQ-004-047）は現行 REQ-ID（REQ-008-059）へ整理する。
  - id: AG-008
    content: |
      REQ 行への実装詳細残留の横断是正アンカー（F-05: REQ-090 の schema/enum/credential 残留 :18/:26/:30/:31/:41・
      F-06: REQ-061-047/048・過去 defer 同型群 RQ-01/04/06/15/16/17/27/28/29）は本要件では個別修正に着手しない
      観察メモ性を保持する。REQ-090 の Design 移管には DEC-044/DEC-052 系の合意（観測契約とスキーマ管理の所在）が
      必要であることを記録し、次回の inspect/promote サイクルで再評価する。
      個別修正の着手条件: DEC-044/052 系の合意確定、または機械走査での実害（検証不能・誤検知）発生。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-103.md
    target_area: "## 要件"
    source_items: [AG-004]
    content: |
      置換（組立検査済み: match 1 件・replace 1 件・assemble-draft-section 検証 2026-10-08）。
      REQ-103-031 行の一部:
      旧文: AC-01 から AC-25 までを少なくとも pass、fail、blocked、not applicable で個別に判定し
      新文: AC-01 から AC-26 までを少なくとも pass、fail、blocked、not applicable で個別に判定し
  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: docs/requirements/REQ-103.md
    target_area: "## 受け入れ条件対応"
    source_items: [AG-005]
    content: |
      置換（組立検査済み: match 1 件・replace 1 件）。
      旧文: 本節が AC 番号の定義所在を所有し、RU-0181 および要件ドラフトの消費後も番号、条件の定義所在、検証義務を一意に再構成できる
      新文: 本節が AC 番号の定義所在を所有し、RU および要件ドラフトの消費後も番号、条件の定義所在、検証義務を一意に再構成できる
  - id: ACT-REQ-003
    artifact: req
    operation: update
    target: docs/requirements/REQ-103.md
    target_area: "### 対象外"
    source_items: [AG-005]
    content: |
      置換（組立検査済み: match 1 件・replace 1 件）。
      旧文: - 生成主体（session-supervisor）を ADF で別件正規化する作業（ユーザーの最新指示により並行作業は取り下げ。本要件の全面再評価の評価対象からは除外しない）
      新文: - 生成主体（session-supervisor）の ADF での別件正規化
  - id: ACT-REQ-004
    artifact: req
    operation: append
    target: docs/requirements/REQ-103.md
    target_area: "## 目的"
    source_items: [AG-006]
    content: |
      目的節末尾へ次の段落を追記する:

      本要件の要件行のうち判断アーキテクチャに関わる行（REQ-103-002〜012）は、REQ-096 および
      v4-responsibility-boundaries Design「ADF判断アーキテクチャ詳細基準」節が正規所有する判断契約の、
      全面再評価における再確認表現である。REQ-096 は現行契約として維持され、本要件の完了後も
      要件行（原則水準）と詳細基準（Design 節）の 2 層構造として意味上の重複を生じない。
  - id: ACT-REQ-005
    artifact: req
    operation: update
    target: docs/requirements/REQ-008.md
    target_area: "## 要件"
    source_items: [AG-007]
    content: |
      置換（組立検査済み: match 1 件・replace 1 件・10 行→1 行・assemble-draft-section 検証 2026-10-08）。
      「### REQ-008-059: 未確定内容の auto_ready 抑止」見出しブロック（本文 3 段落・fixture 埋め込み）を
      次のテーブル行へ置換する（REQ-008-058 と REQ-008-060 の間へ挿入し ID 順を連続化する）:

      | REQ-008-059 | req-define は、後続工程で決定する必要がある未確定事項、必須内容の欠落、暫定プレースホルダーが agreed_items または artifact_actions に残る場合、auto_gate.auto_ready を true にしないこと。判定は決定的マーカー検査と QG-1 の意味判定の組み合わせにより、禁止事項や過去事例として当該文字列を引用した文を誤検知しないこと。停止時に該当 AG-ID または ACT-ID と理由を auto_gate.stop_reasons へ記録すること。代表 fixture 等の判定詳細は Design（req-define command）の該当節が所有すること |
  - id: ACT-REQ-006
    artifact: req
    operation: append
    target: docs/requirements/REQ-059.md
    target_area: "## 要件"
    source_items: [AG-001]
    content: |
      要件テーブルへ次の行を追加する（REQ-059-005 の直後・テーブル行形式 2 列）:

      | REQ-059-006 | Decision 本文および索引における retired REQ への言及は、歴史的説明として必要な言及は本文保持、現行契約参照と読める言及は現行 REQ への置換という基準に従って維持されること。判定は言及先が意思決定当時の根拠として引用されているか（歴史的説明）を基準とし、保持基準の詳細は Design（document-model）の文書ライフサイクル節が所有すること |
  - id: ACT-DEC-001
    artifact: decision
    operation: update
    target: docs/decisions/DEC-013.md
    target_area: "## 関連情報"
    source_items: [AG-002]
    content: |
      関連情報節の retired REQ 言及（REQ-010-053..057 RETIRE / REQ-036-022 UPDATE 等）について、
      AG-001 の保持基準を適用して判定・是正する:
      - 意思決定の経緯説明として機能する言及（当時の RETIRE/UPDATE 根拠の記録）は本文保持とする。
      - 現行 REQ 参照として読める言及は、参照先の現行後継 REQ へ置換する（retired REQ-ID の直接参照を残さない）。
      是正結果と判定根拠（保持・置換の各行の分類）を case 実行時の diff で提示する。
  - id: ACT-DEC-002
    artifact: decision
    operation: update
    target: docs/decisions/DEC-022.md
    source_items: [AG-002]
    content: |
      DEC-022 の retired REQ 取扱いについて、frontmatter・本文・索引の扱いを AG-001 の保持基準で統一する
      （非対称の解消）。具体的な非対称箇所は case 実行時に frontmatter と本文・README 索引の三方突合で特定し、
      保持基準適用後の状態を提示する。
  - id: ACT-DESIGN-001
    artifact: design
    operation: append
    target_design:
      operation: update
      domain: foundations
      slug: document-model
    target_area: "## 文書ライフサイクル"
    source_items: [AG-001, AG-003]
    content: |
      ### retired 文書への言及の保持基準

      retired REQ・Decision への言及の保持・置換は次の基準で判定する。

      - 歴史的説明として必要な言及（意思決定当時の根拠・経緯の引用）: 本文保持
      - 現行契約参照と読める言及（現行仕様の根拠としての参照）: 現行側への置換

      判定材料は、言及先が当該文書の意思決定の根拠として当時の文脈で引用されているかである。
      保持基準の要件上の定義は REQ-059（related_reqs 宣言契約）が所有し、本節が詳細基準を所有する。

      保持基準違反の検出は、誤検知（歴史的説明の保持対象）を判定材料なしに機械検出できないため、
      docs-check（IR-015）への自動検出追加は行わず、inspect-docs 意味診断による順守確認に委ねる。
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: commands
      slug: req-define
    target_area: "## 未確定内容の auto_ready 抑止（REQ-004-047）"
    source_items: [AG-007]
    content: |
      節見出しの由来表記を整理する: 「## 未確定内容の auto_ready 抑止（REQ-004-047）」→
      「## 未確定内容の auto_ready 抑止（REQ-008-059）」（REQ-004-047 は旧体系 ID であり、
      現行の要件行 ID へ更新する）。節本文は正規所有する判定仕様（代表 fixture・決定的マーカー検査と
      QG-1 意味判定の組み合わせ・誤検知除外）を現状どおり保持し、REQ-008-059 のテーブル行復帰
      （ACT-REQ-005）と参照関係を整合させる。

conflict_resolutions:
  - id: CR-001
    conflict: REQ-103-002〜013 と REQ-096 の恒久判断契約重複の解消方式（REQ-096 移管 / 再宣言と限定 / 寿命計画明示の 3 選択肢）。
    resolution: 壁打ち Q4 案A（ユーザー確定）: 再宣言と限定を採用。REQ-103 への限定明記（AG-006）で対応し、REQ-096 は現行契約として維持する。RA-005 既存判定（2 層構造で重複なし）と整合。
  - id: CR-002
    conflict: retired 参照の保持基準の定義先（REQ-059 拡張 / document-model Design / 新規 Decision）。
    resolution: 壁打ち Q3 案A（ユーザー確定）: REQ-059 への要件行（原則）+ document-model Design 文書ライフサイクル節（詳細基準）の 2 層で定義。Decision は新規作成しない。
  - id: CR-003
    conflict: REQ-008-059 の fixture・判定ロジックの移管先（REQ 残置 / Design 分離）。
    resolution: 壁打ち Q6（ユーザー確定）: テーブル行復帰+Design 分離。正規所有は req-define command Design の既存節（:424）であり、新規 Design は作成しない。
  - id: CR-004
    conflict: REQ-103-028 の baseline tag 名（:46）も作業経緯混入と指摘されたが、要件実体との区別。
    resolution: tag 名はタグ実在検証（REQ-103-028 の検証義務）の実体として保持し、除去対象は :53 と :102-106 の 2 箇所に限る。
  - id: CR-005
    conflict: AG-003 の IR-015 検出対象拡張の評価結果（壁打ち Q3 では評価を必須論点とし結果を先送り）。
    resolution: 評価を実施し (b) 追加しない（意味診断への委譲）で確定した。技術的根拠: 保持基準の判定材料
      （言及が歴史的説明か現行契約参照かの区別）が文書側に存在せず、機械検出は誤検知（歴史的説明の保持対象の
      検出）を避けられない。判定材料を持つ inspect-docs 意味診断への委譲を document-model Design 側に記録する。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0186
    target_req: REQ-059
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-002
    source_ru: RU-0186
    target_design: { operation: update, domain: foundations, slug: document-model }
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-003
    source_ru: RU-0187
    target_req: REQ-103
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-004
    source_ru: RU-0188
    target_req: REQ-008
    operation: update
    scale: standard
    depends_on: [OU-005]
    recommended_order: 2
    issue_policy: single
    result: {}
  - ou_id: OU-005
    source_ru: RU-0188
    target_design: { operation: update, domain: commands, slug: req-define }
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-006
    source_ru: RU-0186
    target_req: null
    operation: update
    scale: standard
    depends_on: [OU-001, OU-002]
    recommended_order: 2
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      REQ-059 の要件テーブルに REQ-059-006（保持基準の要件行）が追加されていること、
      document-model Design 文書ライフサイクル節に保持基準の詳細（2 区分と判定材料）が追記されていることを確認する。
      両者の参照関係（要件行が Design 節を参照）が整合していることを確認する。
    pass_criteria: 2 層定義（REQ 行+Design 詳細基準）が完了し、参照関係が整合していること。
    on_failure: fix-and-reverify（追記内容の欠落・参照不整合は修正して再検証する）。
  - id: TS-002
    target_item: AG-002
    verification: |
      DEC-013 関連情報節の retired 言及各行について、保持/置換の判定が AG-001 基準で実施され、
      判定根拠が diff で確認できること。DEC-022 の frontmatter・本文・索引の三方が同一基準で整理されていること。
      docs/decisions/README.md の該当行（:265 の DEC-013 REQ 対応表行・:224 の relates-to 行）が同期されていること。
    pass_criteria: DEC-013・DEC-022・README 索引の三方同期が完了し、判定根拠が提示されていること。
    on_failure: fix-and-reverify（同期漏れ・基準適用の誤りは修正して再検証する。基準解釈の設計判断を要する場合は本要件に差し戻す）。
  - id: TS-003
    target_item: AG-003
    verification: |
      document-model Design の保持基準節に、IR-015 非追加の判断（意味診断への委譲）とその理由が記録されていることを確認する。
    pass_criteria: 検出手段の所在記録が完了していること。
    on_failure: fix-and-reverify（記録漏れは修正して再検証する）。
  - id: TS-004
    target_item: AG-004
    verification: |
      REQ-103-031 が「AC-01 から AC-26 まで」となっていること、受け入れ条件対応節の AC-26 行（REQ-103-031・TS-017 対応）と
      集計が閉じていることを確認する。Case #3530 の AC 判定記録を確認し、AC-26 の判定実施記録との不整合があれば
      完了訂正経路の必要性を報告する。
    pass_criteria: AC 集計の閉包（本文記述=対応表の最終番号）と判定記録との整合確認が完了していること。
    on_failure: fix-and-reverify（本文修正漏れは修正して再検証する。判定記録側の訂正は正規の完了訂正経路で扱い、本要件の範囲外として記録する）。
  - id: TS-005
    target_item: AG-005
    verification: |
      REQ-103 全文を対象に「RU-0181」「session-supervisor」「並行作業は取り下げ」を検索し、
      混入が解消されていることを確認する。REQ-103-028 の baseline tag 名が保持されていることを確認する。
    pass_criteria: 除去対象 2 箇所の解消と保持対象（tag 名）の維持が確認できること。
    on_failure: fix-and-reverify（除去漏れ・過剰除去は修正して再検証する）。
  - id: TS-006
    target_item: AG-006
    verification: |
      REQ-103 目的節（または要件テーブル直前の導入部）に限定明記の段落が追加されていること、
      REQ-096 が変更されていないこと（現行契約として維持）を確認する。
    pass_criteria: 限定明記の追加と REQ-096 の不変が確認できること。
    on_failure: fix-and-reverify（明記内容の誤りは修正して再検証する）。
  - id: TS-007
    target_item: AG-007
    verification: |
      REQ-008 の要件テーブルで REQ-008-058〜060 が連続するテーブル行として並んでいること（見出しブロックの消滅）、
      REQ-008-059 行が Design 節への参照を含むこと、req-define command Design の節見出しが
      REQ-008-059 由来表記に更新されていることを確認する。docs-check（check_integrity）で REQ 構造エラーが
      新規発生していないことを確認する。
    pass_criteria: テーブル行復帰と Design 節参照の整合、構造検査の通過。
    on_failure: fix-and-reverify（形式不備は修正して再検証する）。
  - id: TS-008
    target_item: AG-008
    verification: |
      AG-008 は観察メモ（非実施要件）であるため、本 draft の実装では REQ-090・REQ-061 の該当行を変更しないことを確認する。
      アンカー記録（RU-0188 由来の統合表）が draft・RU 側で参照可能であることを確認する。
    pass_criteria: 個別修正の非実施とアンカー記録の保持が確認できること。
    on_failure: fix-and-reverify（スコープ超過の実施があった場合は差し戻す）。

realization_actions:
  - id: RA-001
    concern: docs/decisions/README.md の DEC-013 関連行同期と DEC-022 索引整理
    responsibility: README 索引の正確性維持
    ownership_hints:
      - docs/decisions/README.md:265（DEC-013 REQ 対応表行）と :224（relates-to 行）付近
      - docs/decisions/DEC-013.md 関連情報節
      - docs/decisions/DEC-022.md
    intent: 保持基準適用後の本文と索引の同期
    verification_refs: [TS-002]
    source_items: [AG-002]

case_open_hints:
  epic_needed: false
  wave_hints:
    - "OU-004（REQ-008 テーブル行復帰）は OU-005（Design 節見出し整理）の後に適用する（参照関係の整合）"
    - "OU-006（DEC 同期）は OU-001/002（保持基準の 2 層定義）の後に実行する"
    - "AG-008（横断是正アンカー）は実施対象外。RU-0188 のアンカー表を参照可能な形で保持する"
```

# summary

RU-0186（retired 保持基準+DEC 同期）・RU-0187（REQ-103 是正+REQ-096 2 層構造）・RU-0188（REQ-008-059 復帰+横断アンカー）の 3 RU を統合した。置換系 3 件+テーブル行復帰 1 件は assemble-draft-section による組立検査済み。Q3 案A・Q4 案A のユーザー確定内容を AG-001/AG-006 と conflict_resolutions に反映した。AG-008（横断是正アンカー）は観察メモ性を保持し実施対象外とした。
