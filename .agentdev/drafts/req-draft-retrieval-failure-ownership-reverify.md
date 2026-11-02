---
draft_type: req_draft
topic_slug: retrieval-failure-ownership-reverify
status: draft
created_at: "2026-11-02T22:29:12+09:00"
---

<!-- req_draft: req-define が生成する構造化引き継ぎ成果物。原本は下記 # draft-data YAML ブロック。 -->
<!-- 本 draft は req-draft-canonical-retrieval-anomaly-hold（commit 9758b51e3、監督者一次照合で入力逸脱と判定）を差し替える訂正版である。 -->
<!-- 2026-11-02T22:33:55+09:00 監督者の内容照合完了（未合意の一律停止・強制質問の除去と、実際に必要な対象を取得できない場合の実測と条件付き修正の分離を確認。仕様採用判断ではなく照合完了の連携）を受け、auto_ready を true へ更新した。 -->

# draft-data

```yaml
topic_slug: retrieval-failure-ownership-reverify

work_type: maintenance

scale: standard

summary: |
  RU-0255 継続検証（Case #3889 閉鎖後の独立検証）で観測された ac2 run1/run2 の挙動差について、
  前回 draft（canonical-retrieval-anomaly-hold）が含めていた未合意の基準追加（全ての索引乖離へ
  対する利用者判断・draft 非保存の一律義務付け、強制質問、全域対象化）、check-entry-existence.ts
  の再利用断定、run2 の中立扱いと差の原因特定の記述を除去し、次の位置づけに訂正する。
  (1) REQ-002 の情報が run1 の所有先判断（RU-9002→REQ-001 APPEND）に実際に必要だったかは
  未確定であり、run1 が既存規律（matching-and-merge.md「取得できた情報の範囲で成立する判断と、
  取得の失敗のために確定できない判断を区別して扱う。確定できない部分を取得結果から勝手に
  補完しない」）に照合して適合か不適合かも未確定である。(2) したがって本 draft は正規成果物の
  変更を事前に含めず、欠落対象が実際の所有先判断に必要な状態で通常入力による再現を整え、
  公開入口から実行・実測し、未取得がその判断に与える影響と既存 REQ-004-069（および上記既存
  規律）への具体的不一致の成立を先に確認する検証を実行する。(3) 具体的不一致が実測で確認
  できた場合のみ、承認済み範囲内（元条件を変更しない）で正規工程により修正・再検証する
  （失敗を拒否する実経路と通常経路の両方の検証を明示）。確認できなければ新要件・機構を
  追加せず未検証として報告する。正規要件の取得が本当に不能な部分を該当なしにせず、取得
  できた範囲で成立する独立の判断は継続し、合意済みの安全境界を保持する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      再現条件の確定。所有先判断に欠落対象が実際に必要な状態を構成する: REQ インデックスに
      掲載された REQ のうち、投入する通常入力（試験の意図・位置づけを本文に含まない要求文）の
      自然な所有先となると示唆されるタイトル・目的のものの実ファイルが、worktree・履歴・origin の
      いずれにも存在しない構成とする（ac2 の ENVIRONMENT.md と同等の実在性実測を環境構築時に
      記録する）。環境には試験の意図を伝える成果物（identity、REQ 本文、入力 RU 等）を含めない
      ことを基本とし、やむを得ず残る場合はその内容を実行記録に明示する（run2 が中立でなかった
      教訓: 意図伝達物はコミット文面以外にも存在し得る）。投入は公開入口（agentdev/req-define
      コマンド）から通常入力で行う。
  - id: AG-002
    content: |
      実測と既存規律への照合。公開入口からの実行における実挙動（索引乖離の検出の有無、判断
      保留の有無、所有先判断の継続または停止、要件doc 保存・保存 commit の有無、実行側による
      欠落対象の意味解釈の有無とその根拠）を trace と産出物の実物で実測・記録する。そのうえで、
      欠落対象の未取得が今回の所有先判断に与える影響（当該判断が「取得できた情報の範囲で成立
      する判断」か「取得の失敗のために確定できない判断」か）を判定し、既存 REQ-004-069
      （実在するREQの見落とし・取得の失敗を該当なしとして扱わず判断を保留して報告する義務）と
      matching-and-merge.md 既存規律（成立する判断と確定できない判断の区別、確定できない部分を
      取得結果から勝手に補完しない）への具体的不一致の成立/不成立を、どの条文・どの挙動への
      不一致かを特定して判定する。判定は実測証拠に基づき、未確認事項を確定扱いにせず、実際の
      失敗を成功に書き換えない。この draft は不一致の成立を前提としない。
  - id: AG-003
    content: |
      判定後の経路。AG-002 で具体的不一致の成立が確認できた場合のみ、承認済み範囲内（RU-0255
      の元条件・合意済みの安全境界を変更しない。新しい台帳・中央制御を追加しない）で正規工程に
      より修正・再検証を実施する。修正の検証は、不一致を発生させた実経路の条件（本再現条件）
      と通常経路（欠落・乖離のない状態で判断保留や質問を生じず通常の照合〜要件doc 保存が完了
      すること）の両方を明示して実行する。不一致の成立が確認できなかった場合は、新要件・新機構
      を追加せず、未検証（または不一致不成立）の記録として報告する。check-entry-existence.ts は
      指定 ID が索引本文に出現するかの確認（ID→索引方向）のみを実装し、索引掲載エントリから
      実ファイルの存在を確認する方向（索引→ファイル）は実装しない（実装読取確認済み。
      src/common/skills/agentdev-artifact-validation/scripts/src/check-entry-existence.ts の
      idExistsInContent / checkIdInFiles）。よって本件の検出手段としての再利用を断定せず、
      AG-002 の実測は実行側の実際の検出挙動を観測対象とする。

artifact_actions: []

conflict_resolutions: []

operation_units:
  - ou_id: OU-001
    description: |
      所有先判断に必要な欠落を含む状態での通常入力による再現・実測・既存規律への照合
      （AG-001、AG-002）、および判定後の条件付き経路（AG-003: 不一致成立時は範囲内修正と
      両経路の再検証、不成立時は未検証の記録と新要件追加なし）の実行
    verification_refs: [TS-001, TS-002, TS-003]
    recommended_order: 1
    issue_policy: single

result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      再現環境の構成記録（tracked ファイル一覧、索引と実ファイルの対応、欠落対象の実在性実測:
      worktree・HEAD・履歴・origin のいずれにも存在しないことの確認結果、環境に残る意図伝達物の
      有無と内容）と、通常入力の投入文と、公開入口からの実行記録（session・trace・turn 応答・
      産出物の有無）を保存する。
    pass_criteria: |
      所有先判断に欠落対象が実際に必要な状態（欠落 REQ が投入要求の自然な所有先となると
      示唆される構成）で、通常入力による公開入口からの実行が行われ、上記の実行条件と実挙動が
      証跡として保存されていること。環境の意図伝達物の有無が実行前に記録されていること。
    on_failure: |
      fix-and-reverify。再現条件の不備（欠落対象が所有先判断に必要な構成になっていない、
      入力または環境に試験意図が混入している等）を特定し、条件を修正して再実行する。
  - id: TS-002
    target_item: AG-002
    verification: |
      実測記録（TS-001 の証跡）を用いて、欠落対象の未取得が今回の所有先判断に与える影響の
      判定（成立する判断か確定できない判断か）と、REQ-004-069 ならびに matching-and-merge.md
      既存規律（区別規律）への具体的不一致の成立/不成立を、対応する条文と観測挙動を対応づけて
      記録する。
    pass_criteria: |
      判定が実測証拠に基づき、不一致と主張する場合は観測された挙動と抵触する条文が特定されて
      いること。未確認事項が確定扱いになっていないこと。実際の失敗が成功として記録されて
      いないこと。不一致の成立/不成立いずれであっても、判定根拠が第三者が証跡から再検証
      できる形で保存されていること。
    on_failure: |
      fix-and-reverify。証拠不足の場合は観測を追加実行し、判定を保留したまま確定しない。
  - id: TS-003
    target_item: AG-003
    verification: |
      AG-002 の判定後の経路を記録する。不一致成立時: 実施した修正の内容（承認済み範囲内で
      あることの根拠を含む）と、不一致を発生させた実経路の条件での再実行結果、および通常経路
      （欠落のない状態での通常実行）での再実行結果を確認する。不成立時: 新要件・新機構の追加が
      行われていないことと、未検証・不一致不成立の記録を確認する。
    pass_criteria: |
      不一致成立時は、修正が正規工程で実施され、失敗を拒否する実経路と通常経路の両方の検証
      結果が保存されていること（通常経路で過剰停止・強制質問が導入されていないこと、正規要件
      の取得が本当に不能な部分の該当なし扱いが生じていないことを含む）。不成立時は、新要件・
      新機構の追加なしで、判定と根拠が記録されていること。
    on_failure: |
      fix-and-reverify。経路の不履行（修正時の片側検証、不成立時の新設追加等）を特定し、
      該当経路をやり直す。

review_dispositions: []

assembly_evidence: []

case_open_hints:
  epic_needed: false
  wave_hints: []
```

# 訂正の経緯（前 draft の入力逸脱と除去内容）

前 draft `req-draft-canonical-retrieval-anomaly-hold`（commit 9758b51e3）は監督者一次照合で入力逸脱と判定された。指摘と本 draft での対応:

1. **未合意の基準追加** — 全ての索引乖離に対する利用者判断・要件doc 非保存の一律義務付け（旧 AG-001/REQ-004-076、旧 TS-001/TS-002 の合格基準）は元 RU1-AC1 に根拠がなく、利用者方針（未決を減らすためだけの質問禁止・判断が必要な場合のみ質問）にも反する → 除去。REQ-004-076 新行・req-define Design 節追加・照合方法論と STEP-3 の一律停止記述（旧 ACT-REQ-001/ACT-DESIGN-001/RA-001/RA-002）をすべて削除した。artifact_actions は空。
2. **既存規律の確認義務** — matching-and-merge.md「取得できた情報の範囲で成立する判断と、取得の失敗のために確定できない判断を区別して扱う。確定できない部分を取得結果から勝手に補完しない」（現行 29 行目）が既に区別機構を提供する → AG-002 の照合対象として明示。取得できた範囲で成立する独立の判断は継続する（新設ではなく既存規律の維持）。
3. **check-entry-existence.ts の再用断定** — 実装読取の結果、ID→索引方向（指定 ID が索引本文に出現するか）のみで、索引→実ファイル方向（索引掲載エントリの実ファイル存在確認）は実装しない → 再利用の主張を除去し、実測は実行側の実際の検出挙動の観測とする（AG-003 に記録）。
4. **run2 の中立扱い・原因特定記述** — 意図伝達物はコミット文面以外に identity.yaml（undertaking: RU-0255 TS-001 AC1取得失敗実経路試験）、REQ-001 本文（ac2 再検証環境の目的記述）、入力 RU-9002 本文（試験内入力の宣言）に存在し、run2 の「中立化」はコミットメッセージのみ → run2 を中立と断定せず、run1/run2 の差の原因も特定済みと記さない（本 draft の分析はすべてこの訂正後の位置づけ）。
5. **REQ-002 の必要性** — run1 の所有先判断（RU-9002→REQ-001 APPEND）に REQ-002（索引タイトル「検証trace保全要件」、本文取得不能）の情報が実際に必要だったかは未確定。run1 が既存規律に照合して適合か不適合かも未確定 → AG-002 の実測・判定で先に確認する（未確認の不一致を要件や合意済み事項として新設しない）。

# 入力と証拠（一次記録の所在）

- 元条件: RU-0255（commit 2cf279980 の .agentdev/backlog/req-units/RU-0255.md。RU1-AC1「取得に失敗する状態…実在するREQの見落としや、取得失敗を『該当なし』と扱う場合は不合格」）
- 現行正本: REQ-004-069〜075（docs/requirements/REQ-004.md）、matching-and-merge.md 既存規律（29 行目）
- 閉鎖後独立検証（ac2）: C:/Users/ogatay/work/adf-ru0255-local-ac2.evidence.d/（run1-result.md、run2-result.md、dispatch/trace-latest.txt、dispatch/run2/trace-latest.txt、pre-exercise/、ENVIRONMENT.md、run1-final-state/）
- 対象版: pinned plugin 5a06ff5d12b4faf494e56cc3a73fbecd5a2aa045（run1 baseline 4b49c7056 / run2 baseline e263aff77、tree 同一・コミットメッセージのみ相違。run2 を中立とは扱わない）。現行 HEAD fe9f04b7d でも matching-and-merge.md・requirement-development.md の該当記述は同一
- check-entry-existence.ts 実装: src/common/skills/agentdev-artifact-validation/scripts/src/check-entry-existence.ts（読取確認: idExistsInContent は content.includes(id) のみ。索引→ファイル方向の実装なし）
- GitHub 隔離検証（対照実行）: C:/Users/ogatay/work/ru0255-contrast/evidence/README.md、隔離 Issue #3（yogata/adf-ru0255-github-verify）訂正記録（issue3-body-before/after.md、issue3-correction-comment.md）— 差分比較の限界維持・実敗の成功書き換え禁止の参照
- 前 draft: .agentdev/drafts/req-draft-canonical-retrieval-anomaly-hold.md（commit 9758b51e3。本 draft で差し替え、履歴は git に保全）

# 対象外

- REQ-004-076 新行・req-define Design 節追加・照合方法論/STEP-3 の一律停止記述（前 draft 由来。未合意のため全て除外。AG-003 の条件付き経路で具体的不一致が確認された場合に、範囲内で検討する）
- 全ての索引乖離への一律停止・強制質問・全域対象化（元条件に根拠なし。判断が必要な場合のみ質問する利用者方針を維持）
- GitHub 隔離検証の case-ready gate 実敗と対照実行（REQ-007-010 適用、delta 0）の限界変更 — 対照実行は失敗した gate 実行を遡及的に合格にしない（維持）
- RU-0254、RU-0256〜0260、Case #3889 の全条件 pass 再認定
- 新規の中央判断機構・照合台帳・検査パイプラインの新設

# summary（人間可読補足）

未確認の不一致を要件化せず、所有先判断に欠落対象が実際に必要な状態での通常入力による再現・実測を先行させる検証の定義案。不一致の成立を AG-002 の実測で先に確定し、成立時のみ範囲内修正（両経路検証）、不成立時は新設なしで未検証を報告する。2026-11-02 に監督者の内容照合が完了したため（仕様採用判断ではない）、auto_ready を true へ更新し case-auto 接続可能な状態とした。
