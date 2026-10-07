# REQ-103 受け入れ条件 AC-01〜AC-25 個別判定記録（Wave 3）

識別: Case #3538（Epic #3530 Wave 3）・DEL-3538-1・REQ-103「ADF v4 正規モデル再確定と現行規範の全面収束」。
判定規則: AC-26（REQ-103-031・TS-017）を適用する。判定値は pass、fail、blocked、not applicable の4値。not applicable には適用されない根拠を記載する。covered の自己宣言、AC 番号の言及のみ、工程終了の記録は証明としない。
本記録は今回限りの判定記録である（REQ-103-029・恒久台帳は新設しない）。
判定は main = origin/main a9535e6a から分岐した worktree（branch case-3538）の状態に有効な証拠に基づく。

## 判定サマリ

| AC | 判定 | 根拠の定義所在 | 検証義務 |
|---|---|---|---|
| AC-01 | pass | REQ-103-001、REQ-103-002 | TS-001 |
| AC-02 | pass | REQ-103-016、REQ-103-017 | TS-010 |
| AC-03 | pass | REQ-103-003 | TS-002 |
| AC-04 | pass | REQ-103-003 | TS-002 |
| AC-05 | pass | REQ-103-004、REQ-103-006 | TS-003 |
| AC-06 | pass | REQ-103-005 | TS-003 |
| AC-07 | pass | REQ-103-007 | TS-004 |
| AC-08 | pass | REQ-103-008 | TS-005 |
| AC-09 | pass | REQ-103-009 | TS-005 |
| AC-10 | pass | REQ-103-011 | TS-006 |
| AC-11 | pass | REQ-103-010、REQ-103-012 | TS-005、TS-007 |
| AC-12 | pass | REQ-103-013 | TS-008 |
| AC-13 | pass | REQ-103-014 | TS-009 |
| AC-14 | pass | REQ-103-015 | TS-009 |
| AC-15 | pass | REQ-103-022 | TS-013 |
| AC-16 | pass | REQ-103-018 | TS-011 |
| AC-17 | pass | REQ-103-019 | TS-011 |
| AC-18 | pass | REQ-103-020 | TS-012 |
| AC-19 | pass | REQ-103-021 | TS-012 |
| AC-20 | pass | REQ-103-023 | TS-013、TS-001 |
| AC-21 | pass | REQ-103-024、REQ-103-025 | TS-014 |
| AC-22 | pass | REQ-103-026 | TS-015 |
| AC-23 | pass | REQ-103-027 | TS-015 |
| AC-24 | pass | REQ-103-028 | TS-016 |
| AC-25 | pass | REQ-103-028 | TS-016 |

fail 0 件、blocked 0 件、not applicable 0 件。TS-015、TS-016、TS-017 は本 Wave の検証義務、TS-001〜TS-014 は Wave 1・2 の検証義務を本 Wave の横断再確認で実行した結果で判定する。

## 個別判定と根拠証拠の到達経路

### AC-01（pass。REQ-103-001、REQ-103-002。TS-001）

正規文書群から v4 正規モデルの全要素を一意に説明でき、判断方法・確定権限・副作用実行可否が独立軸として判別できる。横断読解の導線と突合結果。

- docs/README.md「現在像への導線」節が v4 の各要素を正規文書へ接続する（憲章と責務境界、三層責務と標準運用モデル、判断方法と確定権限の分離、文書責務）。
- docs/designs/foundations/v4-operating-model.md「正規モデル要素と正規所有 Design の対応（REQ-103-001）」節が要素と正規所有の一意対応を所有する。
- docs/designs/foundations/v4-responsibility-boundaries.md が判断方法3分類（決定的処理・閉じた意味評価・開いた推論）、確定権限3区分、副作用実行可否の契約を所有する。
- 旧設計前提の残存検索: 旧語彙（case-update、req-save、design-save）の現行規範使用 0 件（本 Wave の網羅検索。下記 AC-15 参照。本 Wave で design-save 工程言及 7 箇所と REQ-006 適用範囲を現行語彙へ修正済み）。
- 相反する説明の不在: IR 群・traceability check 9 検査・AUTOGEN 差分 0 の機械検査が通過している。

### AC-02（pass。REQ-103-016、REQ-103-017。TS-010）

評価対象集合 305 件（REQ 61・Decision 50・Design 180・Guide 14）の全件処遇判定と反映が完了している。

- 処遇判定全件一覧と機械列挙照合（305/305・未評価残存 0）: PR #3544 本文「処遇判定全件一覧（305 件）」節（TS-010 機械列挙との照合記録込み。merge commit aafcfa16）。
- keep 以外（REQ-045 retire）の反映実行: retired/ 移管・参照消去・AUTOGEN 追随・policy optional 除去の記録は同 PR「実装内容」節。
- 恒久台帳の不新設: 処遇記録の正は PR #3544 本文であり、恒久台帳・恒常 checker は新設されていない（REQ-103-017・REQ-103-019）。
- 妥当な既存成果の再利用: REQ-045 は 2026-08-22 と 2026-09-20 の 2 回の監査実行記録を保持した上で retire し、監査レポートは docs/reports/ 歴史記録として再利用している。

### AC-03、AC-04（pass。REQ-103-003。TS-002）

一意導出可能な判断が決定的処理に分類され、同じ命題の閉じた意味評価・LLM 推論の再判定経路が存在しない。

- 分類基準の正典: docs/designs/foundations/v4-responsibility-boundaries.md「意味判断・決定的処理の責務境界」節と「v4 責務分類語彙の後継」節（旧 DEC-036 決定(1) 列挙の写像を所有）。
- 決定的処理の適用例: case-ready Workflow の deterministic 境界適用判定表（src/common/skills/agentdev-workflow-case-ready/references/execution-structure.md「deterministic 境界の適用判定」節。グラフ計算・件数計数・上限判定・依存エッジ検出・一覧取得を機械側に割当て）。
- 再判定経路の不在: Jev 評価器の操作契約（docs/designs/responsibilities/custom-tool-contracts.md「Jev 先行評価」節）が Tool を構造検証に限定し、意味的完備性の自動判定・推論・補完を禁止（REQ-090-019）。confidence 閾値による LLM 推論の機械的省略・Jev 結果の直接確定 routing を禁止（REQ-090-004）。
- 入力の十分性・規則の妥当性という別命題の区別: v4-responsibility-boundaries.md の閉じた意味評価の閉包条件と、REQ-103-003 本文中の括弧書き区別が一致。

### AC-05、AC-06（pass。REQ-103-004、REQ-103-005、REQ-103-006。TS-003）

残存する閉じた意味評価で、評価前閉包・決定的処理不採用の理由・評価器適格性根拠の3点が正規文書から確認できる。

- 閉包条件の正典: docs/designs/foundations/v4-responsibility-boundaries.md「閉じた意味評価の閉包条件」節（6条件を集約所有）。
- 全件監査結果: case-ready Workflow の判断単位3件を6条件へ適用した監査結果表と既知問題5構造の横断点検記録が src/common/skills/agentdev-workflow-case-ready/references/execution-structure.md「閉じた意味評価の全件監査結果」節に実在する（3件とも適格・維持または条件付き化）。
- 評価入力の閉包実装: 同 reference「判断単位ごとの閉じた判断入力構成」節が score の離散水準・boolean の判定条件・choice の NULL 候補含否を明示判断付きで記録。
- 結果空間の有限性だけを根拠とする分類の不在: 閉包条件6条件に結果空間の有限性単独条件は存在せず、監査結果表の根拠列は入力閉包・意味解釈の必要性を根拠に記述。

### AC-07（pass。REQ-103-007。TS-004）

LLM 推論の使用箇所が開いた問題に限定され、一般 fallback 経路と新規規範自動確定経路が存在しない。

- 網羅全文検索（対象: docs、src、.opencode、traceability sidecars、.agentdev/extensions/skills yaml。歴史記録領域を除く）: 「LLM.*fallback」「fallback.*LLM」検索 23 行検出。
- 分類結果: 22 行は fallback 禁止契約の転記（REQ-103-008 の禁止文・6系統 Workflow references の共通契約・custom-tool-contracts・REQ-090・REQ-103 本体）、1 行は DEC-052 の置換理由記述（DEC-044 決定3 の問題の記述。後継 Decision による部分置換の正当記録）。
- 一般 fallback 経路の現行残存: 0 件。superseded Decision（DEC-043）本文は歴史記録として対象外（REQ-103-020）。
- 開いた問題限定の実装面: agentdev_jev evaluate 操作が閉じた質問（questions 必須・boolean/choice/score）のみを受理する Tool 契約（custom-tool-contracts.md「Jev 先行評価」節）と、開放性を要する工程（根本原因探索等）が LLM 推論の直接使用箇所である記述（v4-responsibility-boundaries.md 判断方法3分類）で成立。

### AC-08、AC-09（pass。REQ-103-008、REQ-103-009。TS-005）

評価器障害時に LLM 推論へ fallback せず、判定を未確定として依存後続を抑止する。

- 恒常テスト: src/common/tools/agentdev-jev/tests/engine.test.ts が not_configured（provider 未解決・isConfigured false）の構造化失敗と、score 正規化不能応答の response_invalid（level 0 fallback なし）を恒常検証（bun test ① 2717 pass 0 fail に含まれる）。verification 宣言は traceability/agentdev-jev.yaml に REQ-103-008、REQ-103-009 として存在する。
- Tool 契約面: custom-tool-contracts.md「Jev 先行評価」節の障害時契約（fallback しない・未確定扱い・依存後続開始せず・人間判断移行せず・復旧後再開）。
- runtime 面: docs/designs/foundations/v4-runtime-execution-model.md「判定未確定時の依存後続抑止」節。
- 正規 Decision: DEC-052（DEC-044 決定3 の部分置換）。
- 6系統 Workflow の共通契約転記: execution-structure.md、requirement-development.md、analysis-and-review.md、analysis-composition-and-review.md、auto-promote-and-review.md、classification-and-review.md の6箇所で同一文言の契約転記を確認。
- 判定不能と不合格の区別: 判定未確定を不合格または非該当へ変換しない契約が上記全箇所に記載。

### AC-10（pass。REQ-103-011。TS-006）

復旧後の正規再開経路で評価を再実行でき、影響する古い判定を再利用しない。

- 再開契約の正典: docs/designs/foundations/v4-durable-state-and-recovery.md「評価器復旧後の評価再開契約」節（再開前の変更影響確認・影響する古い判定の不使用・成功済み副作用の非重複・影響しない証拠の再利用）。
- Workflow 契約転記: 6系統 Workflow references の共通契約に「評価器復旧後は、正規の再実行・再開経路で評価を再実行する。再開前に入力・規則・成果物・証拠への変更影響を確認し…」（execution-structure.md ほか6箇所）。
- 新規状態・台帳の追加なし: 再開経路は既存 resume 契約（DEC-011・v4-durable-state-and-recovery）で成立し、新しい状態・台帳は追加していない。

### AC-11（pass。REQ-103-010、REQ-103-012。TS-005、TS-007）

評価器障害だけを理由に人間判断へ移行せず、人間判断移行条件が留保事由のみを根拠とする。

- 障害由来移行の不在: 6系統 Workflow 共通契約と custom-tool-contracts.md の障害時契約に「評価器障害だけを理由に人間判断へ移行しない」を記載（AC-08、AC-09 の証拠と同一経路）。
- 留保事由の限定: docs/designs/foundations/v4-responsibility-boundaries.md の人間判断境界（HITL 移送条件）と REQ-103-012 の列挙（新しい目的、価値、優先順位、対象範囲、外部契約、受け入れ条件、恒久規範、規範間優先順位）が一致。
- 評価器障害を移行事由に含まない契約: REQ-103-010・v4-responsibility-boundaries.md 障害時契約・DEC-052 で維持。
- 裁量内の具体化と新規規範確定の区別: v4-responsibility-boundaries.md 確定権限3区分（正規契約からの導出・委譲された裁量・人間に留保された判断）。
- 本 Wave の運用実績: 本 Wave の全判断は実行契約（Issue #3538・REQ-103）からの導出または委譲された裁量内であり、新規ユーザー判断は発生していない。

### AC-12（pass。REQ-103-013。TS-008）

soft contract が再定義どおり契約特性として扱われ、決定的処理可能部分の機械処理が契約・実装として存在する。

- 再定義の正典: docs/designs/responsibilities/artifact-contracts.md「soft contract は、厳格な API schema や過剰な互換維持機構を要求しない契約特性として定義する（REQ-103-013）。soft contract を LLM 解釈必須の理由、機械的処理を避ける理由、schema validation の全面禁止の理由として扱わない」。
- 機械処理の実装面: agentdev_gh の操作契約・fail-closed 検証（custom-tool-contracts.md）、agentdev_jev の構造検証（evaluate 入力の questions 形式・scale 適合の engine 検証）、IR 検査群の構造検査が決定的処理可能部分を機械処理している。
- LLM 解釈必須根拠記述の現行残存: 0 件。検索 15 行のうち、document-model.md:319・artifact-contracts.md:368・REQ-008-021 の「LLM 推論経由で消費され、機械的パースを前提としない」は req_draft 固有の消費形態記述（DEC-003・REQ-008-021 が所有する req_draft 文書種別の契約）であり、soft contract 全般の定義として機械処理を排除する記述ではない。REQ-103-013 が維持を明示する範囲。

### AC-13、AC-14（pass。REQ-103-014、REQ-103-015。TS-009）

主要責務の正規所有者が一意で、Wave・意味的依存・実行並列上限・競合情報の概念が一意に定まる。

- 責務と正規所有の対応: docs/designs/workflows/v4-standard-lifecycle.md（ライフサイクル責務単一所有・Wave 語彙の設計対応）、docs/designs/commands/ 配下 case-open / case-ready / case-run / case-close / case-revise / case-auto Design（Wave 2-2 merge 336095b6 で内部 lifecycle 責務単一所有へ再整合済み）、docs/designs/workflows/v4-delegation-contracts.md（委譲契約）、docs/designs/foundations/v4-runtime-execution-model.md（直列化単位・authority 格子）。
- Wave 構成純度: DEC-041（決定1〜4維持）と DEC-051（決定5の部分置換）。「Wave 同時実行上限」の検査項目不在（実行構造手順の構成検証節）と「実行並列上限は runtime 制御の単一所有」の分離を確認。
- 実行並列上限: DEC-042・v4-runtime-execution-model.md runtime 制御ループ節が正規所有。
- 重複所有の不在: traceability check 9 検査 pass（duplicate-inconsistencies 0）と IR-068 projection manifest 突合で実現物側の一意性を裏付け。

### AC-15（pass。REQ-103-022。TS-013）

廃止済み command、旧 lifecycle 名、旧成果物名等の旧語彙が、歴史的説明を除いて現行規範として使用されていない。

- 機械検査: IR-065 obsolete-vocabulary-current-use（check_integrity。baseline-known info のみ）と IR-066 docs-designs-legacy-path-declaration（0 violations。bun test ① に含まれる）。検出器語彙対照は .opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md 実体が正規所有。
- 本 Wave の網羅検索: 「case-update」「req-save」「design-save」検索 26 行。分類: retired REQ（REQ-013、REQ-033、REQ-043。対象外）・superseded Decision（DEC-029。対象外）・accepted Decision 本文の判断事実記述（DEC-003、DEC-010、DEC-011、DEC-012、DEC-026。REQ-103-020 により歴史的判断本文の事実として保持し、現行の参照導線・手順としての使用ではない）・v2:ADR-0123（歴史記録）・retired REQ 索引行（正当）・語彙対照表実体（廃止済み command 種別として本 Wave で修正済み。対照表記録として正当）。
- 本 Wave の修正: design-save 工程言及 7 箇所（agentdev-design-file-manager SKILL.md 3箇所・design-lifecycle-application.md 3箇所・qg-4-final-acceptance.md 1箇所）を「Design 保存（case-ready / case-revise 内部責務）」語彙へ修正。REQ-006.md 適用範囲の req-save・design-save を「Definition 保存工程（case-ready / case-revise 内部責務）」へ修正。vocabulary-registry 実体の case-update・req-save・design-save・case-open・case-run・case-close 行の種別を v4 公開入口モデル整合（廃止済み command・内部 lifecycle 段階）へ修正。
- 現行導線としての旧語彙使用: 0 件（上記修正後の分類結果）。

### AC-16、AC-17（pass。REQ-103-018、REQ-103-019。TS-011）

統制種別ごとに正規モデル上の必要性説明が存在し、必要性説明を欠く新規統制の追加が存在しない。

- 正規節: docs/designs/quality/v4-quality-gate-model.md「統制種別と必要性（REQ-103-018・019）」節が hard gate、fail-closed、checker、MUST NOT、禁止規則、must_not、adversarial-review、HITL、fallback、duplicated validation、state、ledger、routing、additional schema の統制種別ごとの必要性と詳細契約の正規所有を一表で所有する。
- 検証体制: 同節「統制種別の検証体制（REQ-103-018・019 の検証方法）」が機械検索による適用箇所列挙と突合の手順を所有し、恒久台帳の不新設を要求する。
- 本変更での新規統制追加: 0 件。本 Wave の変更は宣言補完・frontmatter updated 進行・語彙追随・pin 文言追随・sidecar 宣言追加のみであり、中央 router、ledger、新規状態、新規 gate、新規 schema、新規 checker、恒久台帳は追加していない。
- 検出された統制の必要性説明の不在: 0 件（統制種別節と検査実行結果の突合。IR 群・guard 群・plugin hook の必要性は統制種別節の表で説明済み）。

### AC-18、AC-19（pass。REQ-103-020、REQ-103-021。TS-012）

歴史本文の現代化改変が存在せず、歴史的成果物から現在の正規所有者へ到達できる。

- baseline からの差分分類: git diff 72e04cad..HEAD（89 files）のうち歴史記録領域の変更は docs/requirements/retired/REQ-045.md の移管・履歴注記追記（#3544）と本 Wave の ADF-COVERS 宣言行追加のみ。docs/reports/ は本 Wave の新規判定記録追加（本ファイル）を除き差分なし。superseded Decision の本文変更 0 件。
- 歴史本文の保持: accepted Decision 本文の旧語彙言及（AC-15 分類）は REQ-103-020 に従い本文不変で保持し、現在の用語へ書き換えていない。
- 到達性導線: retired/REQ-045.md 履歴注記（後継なし・REQ-103-029 正規所有・恒常責務は REQ-010 と REQ-036）、docs/requirements/README.md 廃止済み要件表、docs/decisions/README.md の superseded 分類と Decision Map（supersedes 関係）が歴史的成果物から正規所有者への導線を担保する。
- 恒久検出: IR-015（retired REQ 現行参照検出）・IR-040（retired REQ 単独参照排除）・IR-041（retired/ パス接頭辞）が REQ-103-020、REQ-103-021 の verification 宣言を持つ（bun test ① に含まれる）。

### AC-20（pass。REQ-103-023。TS-013、TS-001）

docs 配下の横断読解で、設計思想、判断責務、ライフサイクル、用語、所有関係について相互矛盾する現在像が検出されない。

- 横断読解の突合（現在像の5軸）:
  - 設計思想: docs/guides/charter.md（hard governance 限定・新規統制追加7条件）と v4-quality-gate-model.md 統制種別必要性節、REQ-103-018・019 が一致。
  - 判断責務: REQ-096、DEC-048、v4-responsibility-boundaries.md が同一の3分類・3区分構造（Wave 1 再整合済み）。
  - ライフサイクル: v4-standard-lifecycle.md、v4-lifecycle-state-machine.md、docs/guides/req-case-flow.md、README.md クイックスタートが UX 2入口収斂（req-define と case-auto）と内部 lifecycle（case-open〜case-close）で一致。本 Wave の語彙修正（design-save → Design 保存）で残存不整合を解消済み。
  - 用語: docs/guides/glossary.md、document-type-responsibilities.md 訳語表、vocabulary-registry.md 語彙レジストリが整合（IR-065・IR-066 機械検査通過）。
  - 所有関係: artifact-responsibilities.md、rule-ownership.md、req-impact-map.md、Design インデックス、traceability sidecar 群が双方向整合（IR-004、IR-023、IR-038、IR-039 機械検査通過・traceability check pass）。
- 相互矛盾の検出: 0 件。機械検査群（check_integrity、traceability check 9 検査、AUTOGEN 差分 0）が読解結果の裏付け。

### AC-21（pass。REQ-103-024、REQ-103-025。TS-014）

実現物・投影・実運用入力の検査と結果消費の接続が実経路で成立し、正規モデル上有効な検証が実行されている。

- 実現物整合: bun test 分割正規形（① worktree root 2717 pass 0 fail・② worktree root 349 pass 0 fail・③ main root 653 pass 1 fail。1 fail は REQ-061-019 pin 文言で本 Wave の case-ready-definition-readiness.test.ts 修正（worktree 内で単体実行 65 pass 0 fail を確認済み）により merge 後解消。timeout flake は本実行では発生せず）。
- 投影照合: IR-068 skill projection manifest（50 src skills match manifest。check_integrity に含まれる）、配布依存境界 checker（check_distribution_boundary.ts --profile source、exit 0・failures 0・concrete_id_hits 0）。
- 実運用入力の検査と結果消費の接続: traceability check 完全形式（REQ-103-001〜031 全行・9 検査全 pass・exit 0）が REQ-103 全行の design、implementation、verification 3 完全性を成立させた（本 Wave の宣言補完により missing-implementation 14 行、missing-verification 19 行を解消。REQ-103-008、REQ-103-009 の verification は恒常テストへの割当、残行は policy optional 登録〔v3-v4-crosswalk.md 検証スコープ節に判断記録〕）。静的呼出元の有無ではなく実行結果による成立を確認。
- 未合意の規範確定と提供能力の削減の不在: 本 Wave の変更は前 Wave 残件の解消（宣言補完・語彙追随・pin 追随・参照整合）であり、未合意の規範確定なし・提供能力の削減なし（変更 diff 19 files・全て補完と追随。実装の削除・経路の廃止なし）。
- 入力忠実性: REQ-103.md 要件行 31 行、受け入れ条件対応節、TS-001〜TS-017 が RU-0181 → REQ-103 ドラフトの投影のままで意味を保つ（REQ ドラフトは git 履歴 c77f712b・dafbf68b^ で復元照合可能）。

### AC-22、AC-23（pass。REQ-103-026、REQ-103-027。TS-015）

互換維持だけを理由とする keep が存在せず、v4 の中核が正規文書群から説明できる。

- keep 理由照合: PR #3544 本文の処遇判定全件一覧（305 件）の keep 根拠 232 行を機械照合し、「互換」を根拠に含む keep は 0 件（全 keep が固有所有・正規モデル本体・正典接続済み・現行実装一致等の根拠）。
- 提供能力の扱い: OpenCode/Senpi、GitHub/ローカル Issue 等の現在提供する能力は維持出発点として扱い、能力廃止案は発生していない（#3544 一覧の REQ-008 keep 根拠〔上位指示による生成主体契約の現行正しさ〕、vocabulary-registry 実体の対照表維持〔記録目的・検出器の語彙源〕等が能力維持の実例）。
- v4 中核の維持説明: docs/designs/foundations/v4-operating-model.md「v4 の中核と維持条件（REQ-103-027）」節が中核5要素（要件に基づく継続的な開発、要求の意味の保持、判断権限の分離、永続状態と実行安全、証拠連鎖）を正規文書で説明し、再収束後もこの中核が維持されている（横断読解・検証実行結果と矛盾しない）。
- 中核放棄の不在: 5要素の全部が現行正規文書と実行結果で成立し、放棄は検出されなかった。工程名・工程数・内部配置・実現方式の変更だけを中核放棄と判定しない契約に従い、停止は不要と判定。

### AC-24、AC-25（pass。REQ-103-028。TS-016）

baseline tag が存在し、非 SemVer 名で、指す先が作業前の main の静止点であり、移動・再利用が行われていない。before/after 差分比較が一意に実行できる。

- tag の存在と名前: `git tag -l baseline-v4-canonical-convergence-20261007` 実在。release version（vX.Y.Z 系）と混同されない非 SemVer 名（既存 tag 群は v1.0.0〜v4.0.1 と baseline-* が併存）。
- 指す先: `git rev-parse baseline-v4-canonical-convergence-20261007^{commit}` = 72e04cadc4ff8fa00b6f484f421975c99a75b449（Epic #3530 本文・Issue #3538 文脈の記録値と一致）。
- tag 形式と作成時刻: annotated tag（objecttype tag・objectname 9866ffe3）、taggerdate 2026-10-07 14:07:26 +0900。作成後の移動・再付与の痕跡なし。
- 非移動・非再利用: 本 Wave は tag 操作を行っていない（本 PR の変更に tag 操作なし・git status に tag 変更なし）。既存 tag の移動・再利用なし。
- 差分比較の一意実行: `git diff 72e04cad..HEAD --stat` が一意に実行でき、89 files changed（再収束の変更全体）を取得。before/after の差分比較が tag 起点で一意に成立。

## AC-26 判定規則の適用（REQ-103-031・TS-017）

- 全 25 AC に個別判定を記録した（本ファイルの判定サマリ表）。
- fail 0 件、blocked 0 件。not applicable 0 件（全 AC に適用根拠の証拠が存在するため NA 判定なし）。
- 各判定は受け入れ条件対応節（docs/requirements/REQ-103.md）の定義所在と検証義務から本ファイル記載の根拠証拠へ到達できる。
- covered の自己宣言、AC 番号の言及のみ、工程終了の記録を証拠として扱っていない（各判定は機械検査の出力値・実在文書の節参照・PR 本文一覧の照合結果を根拠にする）。
- 証拠の対象・鮮度・命題対応: 全証拠は worktree（branch case-3538・base a9535e6a）の本 Wave 実行時点に有効な結果であり、確定した完了条件（Issue #3538 完了条件 6 項目）に対応する。
- 無関係な改善、新しい研究、継続的再評価能力の整備は完了条件に追加していない（本 Wave の変更は前 Wave 残件解消と検証・判定記録のみ。REQ-103-029）。

## 本 Wave で解消した前 Wave 引継ぎ残件

1. bun test ③ REQ-061-019 pin 文言追随（execution-structure.md 語彙変更に対する pin 未追随）: scripts/self/release/case-ready-definition-readiness.test.ts の pin を現行文言「重複を前置検出」へ追随修正。worktree 内で単体実行 65 pass 0 fail。
2. check_integrity NG（custom-tool-contracts.md req-updated-freshness）: frontmatter updated を本 Wave 変更 commit 日（2026-10-08）へ進行し、本 Wave の宣言補完と同一 commit で解消。
3. traceability missing-implementation 14 行、missing-verification 19 行: REQ-103 全行の3完全性を宣言補完（implementation 8 ファイル・verification は sidecar 割当と policy optional 登録）で解消。実体が存在しない行は検出されなかった（全行が既存 merged 成果物に実装対応を持つ）。
4. #3536 Findings 引継ぎ: vocabulary-registry 実体の種別修正（実在した不整合のため修正）、design-save 工程言及 7 箇所の現行語彙修正、REQ-006.md 適用範囲の語彙追随（検出された現行使用のため修正）。
5. DEC-013 related_reqs の REQ-028（retired）参照: 現行関連宣言から除去（REQ-010 は維持。本文の移管記録は REQ-103-020 準拠で保持。AUTOGEN 表を再生成）。

## 検証実行の証跡一覧（実行時点の主要値）

- traceability check 完全形式（--req REQ-103-001〜031）: 9 検査全 pass・exit 0（check-after-decl2.json。最終再確認は commit 後に実施）
- bun test ①（worktree root・repo-agentdev-integrity scripts）: 2717 pass・0 fail・110 files・282.51s・exit 0（test-1-final2.txt）
- bun test ②（worktree root・src/common/skills）: 349 pass・0 fail・25 files・exit 0（test-2-final.txt）
- bun test ③（main root・plugins + scripts）: 653 pass・1 fail・39 files・180.32s（test-3-final.txt。1 fail は pin 文言・worktree 修正済み・merge 後解消）
- pin 単体（worktree root・case-ready-definition-readiness.test.ts）: 65 pass・0 fail・47.00ms
- 配布依存境界 checker（--profile source）: exit 0・failures 0・concrete_id_hits 0・scanned 332（dist-boundary-final.txt）
- TS-016 baseline 検証: tag 実在・指す先 72e04cad 一致・annotated tag・非 SemVer・diff 89 files 一意実行
- TS-015 keep 照合: PR #3544 一覧 232 keep 行のうち「互換」根拠 0 行
- TS-004 網羅検索: LLM fallback 検索 23 行・一般 fallback 経路の現行残存 0（superseded 歴史記録を除く）
- TS-008 網羅検索: soft contract 検索 15 行・LLM 解釈必須根拠の現行残存 0（req_draft 固有契約を除く）
- TS-013 網羅検索: 旧語彙検索 26 行・現行導線としての使用 0（本 Wave 修正後・歴史記録と対照表を除く）
