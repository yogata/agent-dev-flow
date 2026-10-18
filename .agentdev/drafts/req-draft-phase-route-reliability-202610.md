---
draft_type: req_draft
topic_slug: phase-route-reliability-202610
status: draft
created_at: 2026-10-18T09:30:29+09:00
source_rus: [RU-0236, RU-0237, RU-0238, RU-0239]
---

<!-- req_draft テンプレート
  このテンプレートは req-define が生成する構造化引き継ぎ成果物の原本である。
  後続工程（case-open/ case-ready/ case-revise/ case-auto/ case-run/ case-close）が参照する
  原本の情報源は # draft-data 内の YAML コードブロックであり、人間可読 Markdown セクションではない。
  soft contract（生成元側標準）であり、LLM 推論経由で消費される。
  厳格なスキーマバージョン、JSON Schema、バリデータは導入しない。 -->

# draft-data

```yaml
# work_type: 要件の分類（bugfix / feature / maintenance / docs_chore）
# workflow_route の派生値は保存せず、Definition 構成（artifact_actions の有無等）から各コマンドが導出する
work_type: feature

# scale: standard / large（全 work_type で設定可。未設定の場合は standard 準拠）
scale: standard

# summary: 当該 draft が何を合意したかの1段落要約。人間可読補助（処理の正ではない）
summary: 本 draft は RU-0236 から RU-0239 までの4件に対応し、工程駆動経路の信頼性改善として、正規成果物の構造再編（分割・統合・項目移動）の許可・保全・識別子・参照・検証・部分失敗再開、外部検討戻り入力の受領処理の信頼性（複数受領の区別、再投入・内容変更の重複判定、受領日時の信頼性、由来と採用根拠の区別）、検討テーマと正規成果物の採用状態の整合（未採用候補の誤認防止、採用主張の根拠照合、不整合検出・是正、採用判断と反映完了の区別）、独立レビュー所見から正規成果物修正への確実な引き継ぎ（採用所見のみ引き継ぎ、内容・対象・根拠の保持、修正前の最新照合、反映結果確認、中断後の二重修正防止）を合意した。REQ 保存は REQ-110 への11行追加（REQ-110-022〜032）と受け入れ条件対応表（TS-002/004/005 の拡張、TS-009 追加）と適用範囲の更新、REQ-111 への3行追加（REQ-111-014〜016）と適用範囲の更新である。Design 保存は v51-phase-driven-collaboration-model.md への3セクション追加（正規成果物の構造再編、受領記録の識別と信頼性、テーマと採用状態の整合）と v51-phase-transition-and-coexistence-model.md への1セクション追加（レビュー所見の成果物修正への引き継ぎ）および両 Design の ADF-COVERS 宣言更新である。RU-0236 の帰属は RU 記載の方向どおり REQ-110 への APPEND で確定し（CR-002）、session由来RU 4件の frontmatter 欠落は偏差記録（CR-001）として続行した。トレーサビリティ sidecar 3件への verification 宣言の追随内容は RA-005 に精密化して引き継ぐ。

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
    content: 利用者が対象と実施を明示した許可された範囲で、正規成果物の分割・統合・項目移動による構造再編を、既存の成果物管理経路（各成果物管理スキルへの委譲）と既存の採番・配置・照合規則に従って実行できること。専用の公開再編コマンドや再編モードを新設せず、再編を要求しない初回作成・増分更新の正常な利用経路を変更しないこと。再編対象や許可範囲が特定できない場合は対象部分の変更を保留して候補と不足を報告すること。
  - id: AG-002
    content: 構造だけを変更する再編では、再編前の各対象要求の振る舞い・成立条件・適用範囲・受け入れ条件を再編後も保持すること。識別子・件数・参照の機械的突合と内容上の同等性の確認を区別し、項目数の一致だけを根拠に要求内容の欠落や変質を見逃して再編全体を完了としないこと。内容変更が併せて許可されている場合は、構造変更と実質的な内容変更を区別し、変更根拠を確認できること。
  - id: AG-003
    content: 再編による識別子の変更は既存の採番規則に従い、旧識別子と後継対象の対応を必要な範囲で確認でき、廃止・移動した識別子を過去と異なる要求を指す形で再利用しないこと。再編の影響を受ける現在有効な参照を特定して必要な参照更新を行い、配置変更と要求内容の変更を区別して既存の差分・変更影響分析（REQ-106）に従い更新必要・更新不要・作成・未確認を判断すること。恒久的な旧新対応表の保存義務と独立した識別子履歴管理は設けないこと。
  - id: AG-004
    content: 再編の適用前に判定可能な識別子衝突・移動先不明・項目重複を検出し、適用後は実際の成果物と必要な参照関係を確認してから再編全体を完了とすること（保存操作の成功だけを完了の証拠としない）。部分失敗や検証途中の中断後の再実行では、実際に成立した変更を確認して未成立部分だけを継続し、成立済み変更の重複適用と内容の重複・消失・誤改番を生じないこと。REQ の実事例を必須の検証対象とし、Decision・Design への適用でも各成果物の既存状態管理規則を維持すること。
  - id: AG-005
    content: 同日・同一テーマで異なる受領が複数回発生しても、各受領記録を互いに区別して保存・取得でき、以前の記録を上書き・消失させないこと（1受領1ファイル契約の維持）。
  - id: AG-006
    content: 保存済み受領の再投入では、実際に確定済みの受領・採否・成果物反映を識別して不要な重複を生じず、既に採用済みの項目への同一の明示採用指示で確定済みの事実を失わせたり処理を不整合として失敗させたりしないこと。識別子・表題が一致しても本文に意味のある変更が含まれる入力を同一内容と断定して処理対象から除外せず、変更部分を新たな受理・採否の対象とするか判断不能として保留できること。
  - id: AG-007
    content: 受領日時は受領操作時点の信頼できる時計から取得し、入力ファイルの更新日時、本文中の日付、推定値を受領実施時刻として代用しないこと。取得・検証できない場合は日時を捏造せず、不足または失敗を明示すること。
  - id: AG-008
    content: 受領記録は内容の由来（利用者の明示した内容、委任された範囲から導出された内容、評価者の所見）と正式な採用根拠を区別して記録すること。正式な採用の根拠は既存の正規契約が認める利用者の明示判断または有効な正規決定に限定し、委任導出や評価所見という由来だけで採用済みと扱わないこと。受領済み内容と反映結果の対応は、既存の正規成果物・受領記録・Git 履歴からの再構成を優先し、恒久的な全文複製や専用台帳を必須としないこと。
  - id: AG-009
    content: 検討テーマに実現手段・数値条件・技術候補が記載されていても、その内容に有効な採用根拠がない場合は正式な採用済み要求として扱わないこと。テーマ内の正式な採用を示す主張は形式や参照先の存在だけで信用せず、対象内容が有効な利用者判断または正規決定によって裏付けられることを照合してから扱い、根拠が不足する場合は正式採用の主張を維持せず確認不足または候補であることを示すこと。全テーマへの個別の根拠参照の義務付けと合意を示す語句の全面禁止は行わないこと。
  - id: AG-010
    content: テーマと正規成果物で同一の判断対象の採用状態が異なる場合、不整合を検出し、根拠に基づいて是正または未確認として扱えること。テーマの記述だけを根拠に正規成果物の採用状態を書き換えないこと。語句検出や参照先の存在確認で採用状態の意味的な整合まで証明したと扱わないこと。
  - id: AG-011
    content: 利用者の採用判断の成立と正規成果物への反映の完了を区別できること。採用判断があっても正規成果物への反映が未完了であれば、正式な成果物反映まで完了したと扱わないこと。形式的な根拠参照の不足だけを理由として、正式採用を主張していない通常の参考テーマを一律に無効にしないこと。
  - id: AG-012
    content: 独立レビューの所見のうち利用者が明示的に採用した対象のみを、採用範囲と判断根拠を維持して成果物更新の正規経路へ引き継げること。未採用または採否不明の所見を修正確定済みの要求として扱わないこと。所見の自動採用、独立レビューの必須工程化、新しい公開コマンド、全所見への固定的な機械可読様式の義務付け、恒久的な所見進捗台帳は設けないこと。
  - id: AG-013
    content: 採用された所見の引き継ぎでは、対象成果物、参照する要求、元の指摘内容、判断根拠を誤転記や意味変更なく利用し、対象箇所の特定に行番号だけを依存条件としないこと。実際の修正前に最新の正規成果物を照合して指摘内容が現在も成立することを確認し、誤所見、既に解消済みの所見、対象を一意に特定できない所見をそのまま修正に使わないこと。同時に採用された複数所見の一部が不成立・衝突・未確認でも、独立して安全に修正できる部分を反映し、保留部分の理由と必要な確認を区別して報告すること。
  - id: AG-014
    content: 採用された各所見について実際の成果物変更と照合し、反映済み・未反映・保留を確認できること。修正指示の生成、作業開始、保存操作の成功だけを反映完了の証拠としないこと。一部が反映された後に中断した場合は、現在の成果物と採用済み所見を照合して残る必要な修正だけを継続し、成立済み修正の再適用による内容の重複を生じないこと。所見の反映状況は、元の所見、採用判断、正規成果物、実際の変更事実から再構成し、第二の管理台帳を作らないこと。

# artifact_actions: REQ/Decision/Design への保存対象を1つの配列に統合
# 1 action = 1 artifact × 1 editing concern
# アンカー一意性は git grep で検証済み（2026-10-18、HEAD=d50c5c46）:
#   REQ-110-021 行=1件、REQ-111-013 行=1件、TS-002/004/005/008 行=各1件、両 v51 Design covers コメント=各1件
# 挿入型編集（表行追加）は assemble-draft-section.ts の表現範囲外のため grep による anchor 一意性検証を採用
# （前例: req-draft-adf-contract-consistency-batch-202610.md と同一規律）。replace 系編集の組立検査は確定時に実行し
# assembly_evidence へ記録済み（2026-10-18。対象外行の末尾追記型置換と covers コメント4件〔両 Design 先頭部の見出し節外〕は
# 同 script の表現範囲外のため、実行結果と代替機械検査を assembly_evidence ヘッダコメントに記録）
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-110.md
    source_items: [AG-001, AG-002, AG-003, AG-004]
    content: |
      REQ-110 要件表への追加行4行（REQ-110-021 行の直後、表の連続性を維持し空行を挟まない）と受け入れ条件対応表への追加行1行。

      追加行（要件表）:

      | REQ-110-022 | 利用者が対象と実施を明示した許可された範囲で、正規成果物の分割・統合・項目移動による構造再編を、既存の成果物管理経路と採番・配置・照合の既存規則に従って実行できること。再編を要求しない初回作成・増分更新の正常な利用経路を変更せず、再編対象や許可範囲が特定できない場合は対象部分の変更を保留して不足を報告すること |
      | REQ-110-023 | 構造だけを変更する再編では、再編前の各対象要求の振る舞い・成立条件・適用範囲・受け入れ条件を再編後も保持すること。識別子・件数・参照の機械的突合に加えて内容上の同等性を確認し、項目数の一致だけを根拠に再編全体を完了としないこと |
      | REQ-110-024 | 再編による識別子の変更は既存の採番規則に従い、旧識別子と後継対象の対応を必要な範囲で確認でき、廃止・移動した識別子を過去と異なる要求を指す形で再利用しないこと。影響を受ける現在有効な参照を特定して必要な参照更新を行い、配置変更と要求内容の変更を区別して既存の差分・変更影響分析（REQ-106）に従い更新必要・更新不要・作成・未確認を判断すること |
      | REQ-110-025 | 再編の適用前に判定可能な識別子衝突・移動先不明・項目重複を検出し、適用後は実際の成果物と必要な参照関係を確認してから再編全体を完了とすること。部分失敗や検証途中の中断後の再実行では、実際に成立した変更を確認して未成立部分だけを継続し、成立済み変更の重複適用と内容の重複・消失・誤改番を生じないこと |

      追加行（受け入れ条件対応表、TS-008 行の直後）:

      | TS-009 | REQ-110-022、REQ-110-023、REQ-110-024、REQ-110-025 | 正規成果物の構造再編（分割・統合・項目移動）の検証。検証義務は phase-artifacts-update の workflow skill と command の手順契約が所有し、対応関係は traceability/agentdev-workflow-phase-artifacts-update.yaml の verification 宣言が所有する |

      適用仕様: oldText = REQ-110-021 行全体（ファイル内一意、grep 検証済み: 1件）、newText = REQ-110-021 行全体 + 改行 + 上記追加4行。TS-009 は oldText = TS-008 行全体（一意、1件）+ 改行 + TS-009 行。
  - id: ACT-REQ-002
    artifact: req
    operation: append
    target: docs/requirements/REQ-110.md
    source_items: [AG-005, AG-006, AG-007, AG-008]
    content: |
      REQ-110 要件表への追加行4行（ACT-REQ-001 適用後の REQ-110-025 行の直後。ACT-REQ-001 との逐次依存あり）と受け入れ条件対応表 TS-004/TS-005 行の置換。

      追加行（要件表）:

      | REQ-110-026 | 同日・同一テーマで異なる受領が複数回発生しても、各受領記録を互いに区別して保存・取得でき、以前の記録を上書き・消失させないこと |
      | REQ-110-027 | 保存済み受領の再投入では、実際に確定済みの受領・採否・成果物反映を識別して不要な重複を生じず、既に採用済みの項目への同一の明示採用指示で確定済みの事実を失わせたり処理を不整合として失敗させたりしないこと。識別子・表題が一致しても本文に意味のある変更が含まれる入力を同一内容と断定して処理対象から除外せず、新たな受理・採否の対象または判断不能として保留できること |
      | REQ-110-028 | 受領日時は受領操作時点の信頼できる時計から取得し、入力ファイルの更新日時、本文中の日付、推定値を受領実施時刻として代用しないこと。取得・検証できない場合は日時を捏造せず、不足または失敗を明示すること |
      | REQ-110-029 | 受領記録は内容の由来（利用者の明示した内容、委任された範囲から導出された内容、評価者の所見）と正式な採用根拠を区別して記録すること。正式な採用の根拠は既存の正規契約が認める利用者の明示判断または有効な正規決定に限定し、委任導出や評価所見という由来だけで採用済みと扱わないこと |

      置換（受け入れ条件対応表）:

      - oldText: 「| TS-004 | REQ-110-007、REQ-110-009、REQ-110-015 | 戻り入力の受理・部分反映・線形走査（O(n)）の検証。恒常検証手段: agentdev-phase-theme-collaboration の receive.test.ts。対応関係は同 sidecar の verification 宣言が所有する |」
      - newText: 「| TS-004 | REQ-110-007、REQ-110-009、REQ-110-015、REQ-110-026、REQ-110-027 | 戻り入力の受理・部分反映・線形走査（O(n)）・複数受領の区別保存と再投入・内容変更の重複判定の検証。恒常検証手段: agentdev-phase-theme-collaboration の receive.test.ts。対応関係は同 sidecar の verification 宣言が所有する |」
      - oldText: 「| TS-005 | REQ-110-013 | 受領済み知見の再取得の検証。恒常検証手段: agentdev-phase-theme-collaboration の received.test.ts。対応関係は同 sidecar の verification 宣言が所有する |」
      - newText: 「| TS-005 | REQ-110-013、REQ-110-028、REQ-110-029 | 受領済み知見の再取得・受領日時の信頼性・由来と採用根拠の区別の検証。恒常検証手段: agentdev-phase-theme-collaboration の received.test.ts。対応関係は同 sidecar の verification 宣言が所有する |」

      適用仕様: 追加行の oldText = ACT-REQ-001 適用後の REQ-110-025 行全体、newText = 同行 + 改行 + 上記追加4行。置換2件は各行ファイル内一意（grep 検証済み: 各1件）。
  - id: ACT-REQ-003
    artifact: req
    operation: append
    target: docs/requirements/REQ-110.md
    source_items: [AG-009, AG-010, AG-011]
    content: |
      REQ-110 要件表への追加行3行（ACT-REQ-002 適用後の REQ-110-029 行の直後。逐次依存あり）、受け入れ条件対応表 TS-002 行の置換、適用範囲の更新（本 action が REQ-110 への最終適用のため3系統の反映を集約）。

      追加行（要件表）:

      | REQ-110-030 | 検討テーマに実現手段・数値条件・技術候補が記載されていても、その内容に有効な採用根拠がない場合は正式な採用済み要求として扱わないこと。テーマ内の正式な採用を示す主張は、対象内容が有効な利用者判断または正規決定によって裏付けられることを照合してから扱い、根拠が不足する場合は正式採用の主張を維持せず確認不足または候補であることを示すこと |
      | REQ-110-031 | テーマと正規成果物で同一の判断対象の採用状態が異なる場合、不整合を検出し、根拠に基づいて是正または未確認として扱えること。テーマの記述だけを根拠に正規成果物の採用状態を書き換えないこと |
      | REQ-110-032 | 利用者の採用判断の成立と正規成果物への反映の完了を区別すること。採用判断があっても正規成果物への反映が未完了であれば正式な成果物反映まで完了したと扱わないこと。形式的な根拠参照の不足だけを理由として、正式採用を主張していない通常の参考テーマを一律に無効としないこと |

      置換（受け入れ条件対応表）:

      - oldText: 「| TS-002 | REQ-110-004、REQ-110-005、REQ-110-014 | テーマ正本の更新・旧新対応の検証。恒常検証手段: agentdev-phase-theme-collaboration の sections.test.ts。対応関係は traceability/agentdev-phase-theme-collaboration.yaml の verification 宣言が所有する |」
      - newText: 「| TS-002 | REQ-110-004、REQ-110-005、REQ-110-014、REQ-110-030、REQ-110-031、REQ-110-032 | テーマ正本の更新・旧新対応・テーマと採用状態の整合の検証。恒常検証手段: agentdev-phase-theme-collaboration の sections.test.ts。対応関係は traceability/agentdev-phase-theme-collaboration.yaml の verification 宣言が所有する |」

      置換（適用範囲・対象行）:

      - oldText: 「- **対象**: 取組・対象版・現在工程の特定と再開、上流不存在時の参考テーマ形成、テーマ正本の独立更新と未決事項の引継ぎ、外部検討の持出し確認と戻り受理・採用、正規成果物への反映（既存成果物への増分更新、正規成果物の初回作成、利用者の直接採用）と部分反映、工程全体像の再構成、帰納的候補調整、外部AI戻り入力の非機能受け入れ条件」
      - newText: 「- **対象**: 取組・対象版・現在工程の特定と再開、上流不存在時の参考テーマ形成、テーマ正本の独立更新と未決事項の引継ぎ、外部検討の持出し確認と戻り受理・採用、受領記録の識別と信頼性（複数受領の区別、再投入・内容変更の判定、受領日時、由来と採用根拠の区別）、テーマと採用状態の整合、正規成果物への反映（既存成果物への増分更新、正規成果物の初回作成、利用者の直接採用、構造再編〔分割・統合・項目移動〕）と部分反映、工程全体像の再構成、帰納的候補調整、外部AI戻り入力の非機能受け入れ条件」

      置換（適用範囲・対象外行、末尾への追加）:

      - oldText: 「- **対象外**: 工程全体の完了認定、検討深度・網羅範囲の自動採点、全未知要求の発見保証、全会話記録・会話URLの保存、外部AIへの自動送信、第二の正規原本、テーマと Issue の一対一必須対応、未知の秘密情報の完全自動発見、独立したテーマ履歴DB・深度採点器・作業分解管理制度の新設」
      - newText: 「- **対象外**: 工程全体の完了認定、検討深度・網羅範囲の自動採点、全未知要求の発見保証、全会話記録・会話URLの保存、外部AIへの自動送信、第二の正規原本、テーマと Issue の一対一必須対応、未知の秘密情報の完全自動発見、独立したテーマ履歴DB・深度採点器・作業分解管理制度の新設、専用の再編コマンド・再編モードの新設、全案件への恒久的な旧新対応表の保存義務、独立した識別子履歴データベース・受領履歴データベースの新設」

      適用仕様: 追加行の oldText = ACT-REQ-002 適用後の REQ-110-029 行全体。置換3件は各行ファイル内一意。
  - id: ACT-REQ-004
    artifact: req
    operation: append
    target: docs/requirements/REQ-111.md
    source_items: [AG-012, AG-013, AG-014]
    content: |
      REQ-111 要件表への追加行3行（REQ-111-013 行の直後）と適用範囲の更新。

      追加行（要件表）:

      | REQ-111-014 | 独立レビューの所見のうち利用者が明示的に採用した対象のみを、採用範囲と判断根拠を維持して成果物更新の正規経路へ引き継ぐこと。未採用または採否不明の所見を修正確定済みの要求として扱わないこと |
      | REQ-111-015 | 採用された所見の引き継ぎでは、対象成果物、参照する要求、元の指摘内容、判断根拠を誤転記や意味変更なく利用し、対象箇所の特定に行番号だけを依存条件としないこと。実際の修正前に最新の正規成果物を照合して指摘内容が現在も成立することを確認し、誤所見、既に解消済みの所見、対象を一意に特定できない所見をそのまま修正に使わないこと。一部が不成立・衝突・未確認でも独立して安全に修正できる部分を反映し、保留部分の理由と必要な確認を区別して報告すること |
      | REQ-111-016 | 採用された各所見について実際の成果物変更と照合し、反映済み・未反映・保留を確認できること。修正指示の生成、作業開始、保存操作の成功だけを反映完了の証拠としないこと。一部が反映された後に中断した場合は、現在の成果物と採用済み所見を照合して残る必要な修正だけを継続し、成立済み修正の再適用による内容の重複を生じないこと |

      置換（適用範囲・対象行、先頭への追加）:

      - oldText: 「- **対象**: 独立レビューの所見区分、利用者判断による工程遷移とその技術的分離、工程関係の解決、有限作業の独立終了、確定済み設計からの実装・検証接続、完了済み過去工程の改訂と影響伝播、変更駆動経路の独立維持と能力群の意味保存、4操作と工程遷移の GitHub/Local 両対応、移行期の権威継続」
      - newText: 「- **対象**: 独立レビューの所見区分と所見の成果物修正への引き継ぎ、利用者判断による工程遷移とその技術的分離、工程関係の解決、有限作業の独立終了、確定済み設計からの実装・検証接続、完了済み過去工程の改訂と影響伝播、変更駆動経路の独立維持と能力群の意味保存、4操作と工程遷移の GitHub/Local 両対応、移行期の権威継続」

      適用仕様: oldText = REQ-111-013 行全体（ファイル内一意、grep 検証済み: 1件）、newText = REQ-111-013 行全体 + 改行 + 上記追加3行。適用範囲行はファイル内一意。
  - id: ACT-DESIGN-001
    artifact: design
    operation: append
    target_design:
      operation: update
      domain: workflows
      slug: v51-phase-driven-collaboration-model
    target_area: "## 正規成果物の構造再編"
    placement: before_anchor
    anchor: "## 帰納的候補の調整と限界"
    source_items: [AG-001, AG-002, AG-003, AG-004]
    content: |
      v51-phase-driven-collaboration-model.md への新規セクション追加（## 正規成果物への形成と全体像 の後、## 帰納的候補の調整と限界 の前）と ADF-COVERS コメントの更新。

      追加セクション本文:

      ## 正規成果物の構造再編

      採用済み内容の新規作成・増分更新に加え、利用者が対象と実施を明示した構造再編（既存正規成果物の分割・統合・項目移動）を扱う。専用の公開再編コマンドや再編モードを新設せず、既存の成果物管理経路（各成果物管理スキルへの委譲）と既存の採番・配置・照合の規則を適用し、不足する操作のみを追加する。

      再編の実行は次の条件で成立させる。

      - 許可: 利用者が再編対象と実施を明示した範囲で実行する。対象や許可範囲が特定できない場合は対象部分の変更を保留し、候補と不足を報告する
      - 保全: 構造だけを変更する再編では、再編前の各対象要求の振る舞い・成立条件・適用範囲・受け入れ条件を再編後も保持する。識別子・件数・参照の機械的突合と内容上の同等性の確認を区別し、項目数の一致だけを根拠に完了としない。内容変更が併せて許可されている場合は構造変更と実質的な内容変更を区別し、変更根拠を確認できる
      - 識別子: 既存の採番規則に従い、旧識別子と後継対象の対応を必要な範囲で保持する。廃止・移動した識別子を過去と異なる要求を指す形で再利用しない
      - 参照: 影響を受ける現在有効な参照を特定して参照更新を行う。配置変更と要求内容の変更を区別し、更新必要・更新不要・作成・未確認の判断は既存の差分・変更影響分析（REQ-106）に従う。再編前の成果物に依拠する設計・レビュー等の下流には、既存の伝播規律を適用する
      - 検証: 適用前に識別子衝突・移動先不明・項目重複を検出し、適用後に実際の成果物と必要な参照関係を確認してから再編全体を完了とする。保存操作の成功だけを完了の証拠としない
      - 再開: 部分失敗や検証途中の中断後は、実際に成立した変更を確認して未成立部分だけを継続する。成立済み変更の重複適用を行わない

      REQ の実事例を必須の検証対象とし、Decision・Design への適用でも各成果物の既存状態管理規則を維持する。恒久的な旧新対応表の保存義務と独立した識別子履歴管理は設けない。

      covers コメント更新:
      - oldText: 「<!-- ADF-COVERS(design): REQ-110-001, REQ-110-002, REQ-110-003, REQ-110-004, REQ-110-005, REQ-110-006, REQ-110-007, REQ-110-008, REQ-110-009, REQ-110-010, REQ-110-011, REQ-110-012, REQ-110-013, REQ-110-014, REQ-110-015, REQ-110-016, REQ-110-017, REQ-110-018, REQ-110-019, REQ-110-020, REQ-110-021, REQ-104-008 -->」
      - newText: 「<!-- ADF-COVERS(design): REQ-110-001, REQ-110-002, REQ-110-003, REQ-110-004, REQ-110-005, REQ-110-006, REQ-110-007, REQ-110-008, REQ-110-009, REQ-110-010, REQ-110-011, REQ-110-012, REQ-110-013, REQ-110-014, REQ-110-015, REQ-110-016, REQ-110-017, REQ-110-018, REQ-110-019, REQ-110-020, REQ-110-021, REQ-110-022, REQ-110-023, REQ-110-024, REQ-110-025, REQ-104-008 -->」

      適用仕様: anchor 見出し「## 帰納的候補の調整と限界」はファイル内一意（grep 検証済み: 1件）。covers コメント行も一意（1件）。
  - id: ACT-DESIGN-002
    artifact: design
    operation: append
    target_design:
      operation: update
      domain: workflows
      slug: v51-phase-driven-collaboration-model
    target_area: "### 受領記録の識別と信頼性"
    placement: tail
    anchor: "### 戻り受理"
    source_items: [AG-005, AG-006, AG-007, AG-008]
    content: |
      v51-phase-driven-collaboration-model.md の ### 戻り受理 セクション末尾への新規サブセクション追加と ADF-COVERS コメントの更新（ACT-DESIGN-001 適用後の covers 行が oldText。逐次依存あり）。

      追加サブセクション本文:

      ### 受領記録の識別と信頼性

      戻り受理が同日・同一テーマで複数回発生した場合、各受領記録を互いに区別して保存・取得し、以前の記録を上書き・消失させない（1受領1ファイル契約の維持）。

      保存済み受領の再投入では、実際に確定済みの受領・採否・成果物反映を正規の受領記録と正規成果物から識別し、不要な重複を生じない。既に採用済みの項目へ同一の明示採用指示が再投入された場合も、確定済みの事実を失わせず、処理を不整合として失敗させない。識別子・表題の一致は本文の同一を意味せず、意味のある変更を含む入力を同一内容と断定して除外しない。変更部分は新たな受理・採否の対象とするか、判断不能として保留する。

      受領日時は受領操作時点の信頼できる時計から取得し、入力ファイルの更新日時・本文中の日付・推定値を代用しない。取得・検証できない場合は日時を捏造せず、不足または失敗を明示する。

      受領記録は内容の由来（利用者の明示した内容、委任された範囲から導出された内容、評価者の所見）と正式な採用根拠を区別して記録する。由来だけで採用済みと扱わない。受領済み内容と反映結果の対応は、既存の正規成果物・受領記録・Git 履歴から再構成できるかをまず評価し、新たな管理情報は既存情報だけでは必要な追跡を実現できない場合に限って検討する。

      covers コメント更新:
      - oldText: 「<!-- ADF-COVERS(design): REQ-110-001, REQ-110-002, REQ-110-003, REQ-110-004, REQ-110-005, REQ-110-006, REQ-110-007, REQ-110-008, REQ-110-009, REQ-110-010, REQ-110-011, REQ-110-012, REQ-110-013, REQ-110-014, REQ-110-015, REQ-110-016, REQ-110-017, REQ-110-018, REQ-110-019, REQ-110-020, REQ-110-021, REQ-110-022, REQ-110-023, REQ-110-024, REQ-110-025, REQ-104-008 -->」（ACT-DESIGN-001 適用後の全文。逐次依存あり）
      - newText: 「<!-- ADF-COVERS(design): REQ-110-001, REQ-110-002, REQ-110-003, REQ-110-004, REQ-110-005, REQ-110-006, REQ-110-007, REQ-110-008, REQ-110-009, REQ-110-010, REQ-110-011, REQ-110-012, REQ-110-013, REQ-110-014, REQ-110-015, REQ-110-016, REQ-110-017, REQ-110-018, REQ-110-019, REQ-110-020, REQ-110-021, REQ-110-022, REQ-110-023, REQ-110-024, REQ-110-025, REQ-110-026, REQ-110-027, REQ-110-028, REQ-110-029, REQ-104-008 -->」

      適用仕様: anchor 見出し「### 戻り受理」はファイル内一意（grep 検証済み: 1件）。placement: tail により同セクション末尾（## 正規成果物への形成と全体像 の直前）へ追加する。
  - id: ACT-DESIGN-003
    artifact: design
    operation: append
    target_design:
      operation: update
      domain: workflows
      slug: v51-phase-driven-collaboration-model
    target_area: "## テーマと採用状態の整合"
    placement: before_anchor
    anchor: "## 帰納的候補の調整と限界"
    source_items: [AG-009, AG-010, AG-011]
    content: |
      v51-phase-driven-collaboration-model.md への新規セクション追加（ACT-DESIGN-001 適用後は ## 正規成果物の構造再編 が ## 帰納的候補の調整と限界 の直前に存在するため、本セクションは構造再編セクションと帰納的候補セクションの間へ配置される）と ADF-COVERS コメントの更新（ACT-DESIGN-002 適用後の covers 行が oldText。逐次依存あり）。

      追加セクション本文:

      ## テーマと採用状態の整合

      検討テーマは参照用の検討単位としての表現力を保持し、正式な要求の第二の正本としない。テーマに実現手段・数値条件・技術候補が記載されていても、有効な採用根拠がない場合は正式な採用済み要求として扱わない。

      テーマ内に正式な採用を示す主張がある場合、その対象内容が有効な利用者判断または正規決定によって裏付けられることを照合してから扱う。参照先が存在することだけを根拠に採用を認定しない。根拠が不足する場合は正式採用の主張を維持せず、確認不足または候補であることを示す。

      テーマと正規成果物で同一の判断対象の採用状態が異なる場合は不整合を検出し、根拠に基づいて是正または未確認として扱う。テーマの記述だけを根拠に正規成果物の採用状態を書き換えない。利用者の採用判断の成立と正規成果物への反映の完了は区別し、反映が未完了の間は正式な成果物反映まで完了したと扱わない。

      語句検出や参照先の存在確認で採用状態の意味的な整合まで証明したと扱わない。形式的な根拠参照の不足だけを理由に、正式採用を主張していない通常の参考テーマを一律に無効にしない。全テーマへの個別の根拠参照の義務付けと合意を示す語句の全面禁止は行わない。

      covers コメント更新:
      - oldText: 「<!-- ADF-COVERS(design): REQ-110-001, REQ-110-002, REQ-110-003, REQ-110-004, REQ-110-005, REQ-110-006, REQ-110-007, REQ-110-008, REQ-110-009, REQ-110-010, REQ-110-011, REQ-110-012, REQ-110-013, REQ-110-014, REQ-110-015, REQ-110-016, REQ-110-017, REQ-110-018, REQ-110-019, REQ-110-020, REQ-110-021, REQ-110-022, REQ-110-023, REQ-110-024, REQ-110-025, REQ-110-026, REQ-110-027, REQ-110-028, REQ-110-029, REQ-104-008 -->」（ACT-DESIGN-002 適用後の全文。逐次依存あり）
      - newText: 「<!-- ADF-COVERS(design): REQ-110-001, REQ-110-002, REQ-110-003, REQ-110-004, REQ-110-005, REQ-110-006, REQ-110-007, REQ-110-008, REQ-110-009, REQ-110-010, REQ-110-011, REQ-110-012, REQ-110-013, REQ-110-014, REQ-110-015, REQ-110-016, REQ-110-017, REQ-110-018, REQ-110-019, REQ-110-020, REQ-110-021, REQ-110-022, REQ-110-023, REQ-110-024, REQ-110-025, REQ-110-026, REQ-110-027, REQ-110-028, REQ-110-029, REQ-110-030, REQ-110-031, REQ-110-032, REQ-104-008 -->」

      適用仕様: anchor 見出し「## 帰納的候補の調整と限界」は一意。
  - id: ACT-DESIGN-004
    artifact: design
    operation: append
    target_design:
      operation: update
      domain: workflows
      slug: v51-phase-transition-and-coexistence-model
    target_area: "## レビュー所見の成果物修正への引き継ぎ"
    placement: before_anchor
    anchor: "## 有限作業と実装接続"
    source_items: [AG-012, AG-013, AG-014]
    content: |
      v51-phase-transition-and-coexistence-model.md への新規セクション追加（## 独立レビュー の後、## 有限作業と実装接続 の前）と ADF-COVERS コメントの更新。

      追加セクション本文:

      ## レビュー所見の成果物修正への引き継ぎ

      phase-review が提示した所見のうち、利用者が明示的に採用した対象のみを成果物更新の正規経路へ引き継ぐ。採用範囲と判断根拠を維持し、未採用・採否不明の所見を修正確定済みの要求として扱わない。所見の自動採用と独立レビューの必須工程化は行わない。

      引き継ぎでは、対象成果物、参照する要求、元の指摘内容、判断根拠を誤転記や意味変更なく利用する。対象箇所の特定に行番号だけを依存条件としない。実際の修正前に最新の正規成果物を照合し、指摘内容が現在も成立することを確認する。誤所見、既に解消済みの所見、対象を一意に特定できない所見は、そのまま修正に使わない。

      同時に採用された複数所見の一部が不成立・衝突・未確認でも、独立して安全に修正できる部分を反映し、保留部分の理由と必要な確認を区別して報告する。反映結果は実際の成果物変更と照合して反映済み・未反映・保留を確認し、修正指示の生成・作業開始・保存操作の成功だけを反映完了の証拠としない。

      一部反映後に中断した場合は、現在の成果物と採用済み所見を照合して残る必要な修正だけを継続する。所見の反映状況は、元の所見、採用判断、正規成果物、実際の変更事実から再構成し、第二の管理台帳を作らない。採用後の修正は既存の正規成果物管理経路（phase-artifacts-update と各成果物管理スキル）に接続し、新しい承認段階を一律に要求しない。

      covers コメント更新:
      - oldText: 「<!-- ADF-COVERS(design): REQ-111-001, REQ-111-002, REQ-111-003, REQ-111-004, REQ-111-005, REQ-111-006, REQ-111-007, REQ-111-008, REQ-111-009, REQ-111-010, REQ-111-011, REQ-111-012, REQ-111-013 -->」
      - newText: 「<!-- ADF-COVERS(design): REQ-111-001, REQ-111-002, REQ-111-003, REQ-111-004, REQ-111-005, REQ-111-006, REQ-111-007, REQ-111-008, REQ-111-009, REQ-111-010, REQ-111-011, REQ-111-012, REQ-111-013, REQ-111-014, REQ-111-015, REQ-111-016 -->」

      検証時参照の対象範囲更新（同ファイル「## 検証時参照」節）:
      - oldText: 「REQ-111 の受け入れ条件（REQ-111-001〜013）」
      - newText: 「REQ-111 の受け入れ条件（REQ-111-001〜016）」

      適用仕様: anchor 見出し「## 有限作業と実装接続」はファイル内一意（grep 検証済み: 1件）。covers コメント行も一意（1件）。検証時参照の対象範囲更新は新規要件行3件に列挙を同期し、同節の履歴注記 TS 番号を変更しない。

# conflict_resolutions: 壁打ちで解消された衝突の記録
# Q1（契約偏差の扱い）と Q2（RU-0236 の帰属）は利用者の回答（2026-10-18、いずれも案A）を CR-001/CR-002 として記録して解消済み
conflict_resolutions:
  - id: CR-001
    conflict: session由来RU 4件（RU-0236〜0239）が session由来RU 契約の必須 frontmatter（generation_actor、agreement_confirmed_at、generation_stage、logical_key、tentative_classification）を欠落しており（REQ-008-051/056、artifact-contracts.md「RU アーティファクト契約（session由来RU）」節。契約導入 2026-07-27 は RU 作成 2026-10-18 に先行）、req-define の暫定分類最終確定の停止条件（REQ-008-056）に該当した。案A（本 draft どおり続行し、最終分類は req-define が文書7分類モデルで REQ 帰属と判定したことを偏差記録とともに残す）と案B（利用者が RU frontmatter を契約準拠に修正してから再開。req-define は編集スコープ外のため利用者作業）が未解決だった
    resolution: 案A を利用者が選択し確定。本 draft の組成（REQ 帰属の最終分類）を維持して続行し、RU frontmatter 欠落を契約からの偏差として本 CR に記録する。RU frontmatter 自体の修正は req-define の編集スコープ外のため実施せず、後続工程は本偏差を同じ内容としてユーザーへ再確認しない
  - id: CR-002
    conflict: "RU-0236（正規成果物の安全な再編）の帰属。RU 記載の方向は REQ-110 側で補う（案A・本 draft の組成）だが、REQ-110 の SPLIT 信号が 2（関心分類数 2: 段階形成と構造再編、アーティファクト種別数 3 以上: command/skill/domain state）に到達するため APPEND 実施前に SPLIT 要否の提案を実施済みで、案B（新規 REQ CREATE: 構造再編を独立関心として分離し、REQ-110 は工程駆動コラボレーションに集中）が未解決だった"
    resolution: 案A（REQ-110 への APPEND、本 draft の組成どおり）を利用者が選択し確定。SPLIT は実施しない。REQ-110-022〜025、REQ-110-026〜029、REQ-110-030〜032 の連番採番と OU-0001 の target_req（REQ-110）、ACT-DESIGN-001〜003 の covers 更新先（v51-phase-driven-collaboration-model.md）は本 draft の組成のままで確定とし、案B 向けの再組成（新規 REQ 採番への移管、行番号繰り下げ）は実行対象から除去した

# operation_units: 複数RU入力時の統合/分離結果
operation_units:
  - ou_id: OU-0001
    source_ru: RU-0236
    target_req: REQ-110
    target_design: docs/designs/workflows/v51-phase-driven-collaboration-model.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-0002
    source_ru: RU-0237
    target_req: REQ-110
    target_design: docs/designs/workflows/v51-phase-driven-collaboration-model.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}
  - ou_id: OU-0003
    source_ru: RU-0238
    target_req: REQ-110
    target_design: docs/designs/workflows/v51-phase-driven-collaboration-model.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    result: {}
  - ou_id: OU-0004
    source_ru: RU-0239
    target_req: REQ-111
    target_design: docs/designs/workflows/v51-phase-transition-and-coexistence-model.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 4
    issue_policy: single
    result: {}

# test_strategy: 各合意項目（AG-*）の検証方法。3要素（verification / pass_criteria / on_failure）必須
# 5観点境界リスク（dependency / client-server / execution / build-runtime / environment propagation）から導出した
# 検証義務を投影済み。同一ファイル（REQ-110）への複数 OU 編集はマージ競合リスクとして case-open の実行構成に伝達
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      正規成果物管理スキル（agentdev-req-file-manager / agentdev-decision-file-manager / agentdev-design-file-manager）の再編操作手順と、phase-artifacts-update の再編受理手順が、許可条件（対象と実施の明示）、許可不足時の保留と報告、既存の初回作成・増分更新経路の不変を規定していることを手順書突合で確認する。複数の関心事が混在する REQ の分割と、実施許可が不足する経路の2系統の利用経路を実行する。
    pass_criteria: |
      許可された再編が既存の成果物管理経路で成立し、未許可の変更が行われず、許可不足時に不足の報告が出ること。再編を伴わない既存成果物への項目追加と、正規成果物が存在しない初回作成の経路が従来どおり動作すること（AG-001 の共存条件）。
    on_failure: |
      fix-and-reverify（手順または実装の欠陥であるため修正して再検証する）。
  - id: TS-002
    target_item: AG-002
    verification: |
      再編前後の全対象項目を突合する検証を実行する。機械的突合（識別子・件数・参照）に加え、内容上の同等性の確認手順が規定され、項目数だけが一致し要求内容が欠落・変質している事例を不合格と判定できることを確認する。
    pass_criteria: |
      再編前の各対象要求の振る舞い・成立条件・適用範囲・受け入れ条件が再編後も保持されること。項目数一致で内容欠落がある事例が不合格になること。
    on_failure: |
      fix-and-reverify（保全検証の欠陥であるため修正して再検証する）。
  - id: TS-003
    target_item: AG-003
    verification: |
      親REQ番号を含む要件行を別 REQ へ移す事例、複数の移動先が生じる事例、既存番号との衝突事例を検査する。参照残存の確認は rg により docs/ 全体、traceability/ 配下の sidecar、.agentdev/extensions/skills/*.yaml の ADF-COVERS 宣言を網羅し（docs/reports/ は履歴記録領域として除外）、See Also 等の参照行を検出対象外とする扱いを明示する。網羅範囲と再編による参照更新対象の列挙が一致することを確認する。
    pass_criteria: |
      旧対象の追跡不能、番号衝突、別要求への誤対応が検出・防止されること。移動後の参照が正しい対象を指し、参照残存が0件であること。
    on_failure: |
      fix-and-reverify（識別子・参照管理の欠陥であるため修正して再検証する）。
  - id: TS-004
    target_item: AG-005
    verification: |
      agentdev-phase-theme-collaboration の receive.test.ts を拡張し、bun test で実行する。同日同一テーマで複数回の受領を発生させ、各記録の識別、保存内容、一覧取得を確認する。既存テスト（受理・部分反映・線形走査）が維持されることを確認する。
    pass_criteria: |
      記録の衝突・上書き・欠落がなく、各受領が互いに区別して取得できること。既存テストが1件も削除されずに通過すること。
    on_failure: |
      fix-and-reverify（実装欠陥であるため修正して再検証する）。
  - id: TS-005
    target_item: AG-006
    verification: |
      receive.test.ts を拡張する。(a) 受領・採用後、同じ入力と採用指示を再投入した場合に受領記録・採否・正規成果物へ重複や消失が生じないこと、(b) 同じ識別子・表題で本文のみが異なる入力が同一内容と断定されず、新たな受理・採否の対象または保留として扱われること、(c) 実質的に同じ入力が重複として適切に扱われることを確認する。
    pass_criteria: |
      (a)(b)(c) がすべて成立し、再投入で既存の採用が失われないこと。判定の処理量が入力サイズに対して線形（O(n)）を維持すること（REQ-110-015 との整合）。
    on_failure: |
      fix-and-reverify（実装欠陥であるため修正して再検証する）。
  - id: TS-006
    target_item: AG-007
    verification: |
      received.test.ts を拡張する。入力ファイルの日付・更新日時と実際の受領操作時刻が異なる事例を用い、記録日時が受領操作時点の時計に対応し入力側の日時に引きずられないこと、時計が取得・検証できない場合に日時の捏造なく不足または失敗が明示されることを確認する。
    pass_criteria: |
      記録日時が受領操作に対応すること。取得不能時に失敗が明示され、捏造された日時が記録されないこと。
    on_failure: |
      fix-and-reverify（実装欠陥であるため修正して再検証する）。
  - id: TS-007
    target_item: AG-008
    verification: |
      直接採用、外部からの提案、委任範囲内の導出、評価所見を含む入力を処理し、受領記録が由来と採用根拠を区別して記録することを確認する。あわせて外部受領と直接採用の双方を実行し、既存の REQ-110（007/015/018）が要求する結果（採用根拠の限定、線形走査、fail-closed、証跡量、架空の受領記録を作らない）と照合する。
    pass_criteria: |
      由来と採用根拠を取り違えた採用が成立しないこと。委任導出や評価所見という由来だけで採用済みとならないこと。既存の受理規律が維持されること。
    on_failure: |
      fix-and-reverify（実装欠陥であるため修正して再検証する）。
  - id: TS-008
    target_item: AG-009
    verification: |
      agentdev-phase-theme-collaboration の sections.test.ts を拡張する。利用者が結果要件のみを採用し具体的な技術案は未採用とした入力でテーマ形成・更新・閲覧を実行し、未採用の技術案が合意済みとして提示または正規反映されないことを確認する。参照先が存在するが未採用候補しか記載されていない事例と、有効な採用根拠がある事例の照合判定を確認する。
    pass_criteria: |
      参照先の存在だけで採用を認定しないこと。根拠不足の採用主張が確認不足または候補として示されること。通常の参考テーマが根拠参照不足で一律無効化されないこと（AG-011 の後段）。
    on_failure: |
      fix-and-reverify（実装欠陥であるため修正して再検証する）。
  - id: TS-009
    target_item: AG-010
    verification: |
      テーマに合意済み、正規REQに未採用候補と記載された事例を実行し、不整合が検出され、テーマの主張だけでREQが正式採用に変更されないことを確認する。
    pass_criteria: |
      不整合の検出と、根拠に基づく是正または未確認の扱いが成立すること。テーマ記述だけによる正規成果物の書換えが行われないこと。
    on_failure: |
      fix-and-reverify（実装欠陥であるため修正して再検証する）。
  - id: TS-010
    target_item: AG-012
    verification: |
      確定違反、証拠不足、推測、未採用改善候補を混在させた所見の一部のみを採用する経路を実行し、採用部分だけが修正対象となり残りが無断で反映されないことを確認する。対象行が移動した事例、識別子を含む所見、本文の似た複数箇所を含む事例で、別の要求や箇所へ誤って適用されないことを確認する（AG-013 の対象特定）。
    pass_criteria: |
      採用された所見のみが引き継がれ、採用範囲と判断根拠が維持されること。誤転記・誤適用が検出されること。
    on_failure: |
      fix-and-reverify（手順または実装の欠陥であるため修正して再検証する）。
  - id: TS-011
    target_item: AG-013
    verification: |
      実在する違反、既に修正済みの指摘、実在しない表現への指摘、対象が複数に解釈できる指摘を投入し、修正前の最新成果物との照合が行われることを確認する。成立する所見と不成立の所見が混在する入力で、安全な修正まで不必要に停止せず、保留すべき部分が無条件に反映されないことを確認する。
    pass_criteria: |
      成立しない所見を根拠に成果物が書き換えられないこと。保留理由と必要な確認が区別して報告されること。
    on_failure: |
      fix-and-reverify（手順または実装の欠陥であるため修正して再検証する）。
  - id: TS-012
    target_item: AG-014
    verification: |
      複数所見のうち一部だけが成果物に反映された状態で反映結果の確認を実行し、未反映所見が完了扱いされず反映先が正しく報告されることを確認する。一部の所見を反映した後に処理を中断し、同じ採用所見を再投入して、成立済み修正が保持され残る必要な修正のみが行われることを確認する。
    pass_criteria: |
      反映済み・未反映・保留の確認が実際の成果物変更と照合して成立すること。中断再開で内容の重複が生じないこと。保存操作の成功だけが完了扱いとならないこと。
    on_failure: |
      fix-and-reverify（実装欠陥であるため修正して再検証する）。
  - id: TS-013
    target_item: AG-004
    verification: |
      正常な再編と、重複・欠落・参照不整合を含む事例を実行する。適用前の識別子衝突・移動先不明・項目重複の検出と、適用後の実成果物・参照関係の確認が完了判定に前置されていることを確認する。複数ファイル再編の途中と検証前に中断を発生させ、同じ指示を再投入して、成立済み変更の保持と未成立部分だけの収束を確認する。
    pass_criteria: |
      保存操作の成功だけの完了報告が行われないこと。中断再開で内容の重複・消失・誤改番がなく、残作業が正しく収束すること。
    on_failure: |
      fix-and-reverify（実装欠陥であるため修正して再検証する）。
  - id: TS-014
    target_item: AG-011
    verification: |
      候補状態、利用者が採用を指示した直後（正規成果物への反映が未完了）、正規反映完了後の各状態を確認する。採用判断があっても反映が未完了の間は正式な成果物反映まで完了したと扱われないこと。あわせて通常の参考テーマ（形式的な根拠参照を持たない）が形成・更新・閲覧で一律無効化されないことを確認する。
    pass_criteria: |
      採用判断の成立と反映の完了の混同が生じないこと。参考テーマの表現力が不当に消失しないこと。
    on_failure: |
      fix-and-reverify（実装欠陥であるため修正して再検証する）。

# realization_actions: 実現面の変更方針（ドメイン中立契約）
realization_actions:
  - id: RA-001
    concern: 受領処理の識別と信頼性の実装
    responsibility: 受領記録の保存に受領ごとの一意識別（同一日・同一テーマ内での順序や重複しない識別子）を持たせ、保存済み記録との重複判定を識別子・表題一致と本文内容の意味のある変更の区別に基づいて行う。受領日時を受領操作時点の信頼できる時計から取得し、入力側の日付を代用しない。由来と採用根拠を受領記録様式内で区別して記録する。判定処理は入力サイズに対する線形走査と採用件数に比例する証跡量の既存規律を維持する。
    ownership_hints:
      - src/common/skills/agentdev-phase-theme-collaboration/scripts/src/receive.ts（受理処理）
      - src/common/skills/agentdev-phase-theme-collaboration/scripts/src/received.ts（受領記録の読み出し）
      - src/common/skills/agentdev-phase-theme-collaboration/scripts/tests/receive.test.ts、received.test.ts（拡張対象）
      - .agentdev/phase/received/（1受領1ファイルの保存領域。様式は phase/README.md）
    intent: 同日同一テーマの複数受領の衝突、識別子・表題のみの重複判定による変更内容の逸失、入力日付への引きずられ、由来と根拠の混同を防ぎ、受領処理の正確性と再開可能性を成立させる。
    verification_refs: [TS-004, TS-005, TS-006, TS-007]
    source_items: [AG-005, AG-006, AG-007, AG-008]
  - id: RA-002
    concern: テーマ正本の記述と採用状態の照合規律の実装
    responsibility: テーマの読み書きを行う操作（形成・更新・閲覧）が、テーマ内の合意・採用を示す主張を形式だけで信用せず、有効な利用者判断または正規決定との照合を要する規律に従うこと。テーマと正規成果物の採用状態の不整合を検出可能にし、テーマ記述だけを根拠とした正規成果物の書換えを行わない。採用判断の成立と反映の完了を区別する手順を保持する。
    ownership_hints:
      - src/common/skills/agentdev-phase-theme-collaboration/scripts/src/themes.ts（テーマ正本の操作）
      - src/common/skills/agentdev-phase-theme-collaboration/scripts/tests/sections.test.ts（拡張対象）
      - src/common/skills/agentdev-workflow-phase-tasks-create/、agentdev-workflow-phase-tasks-update/（テーマ形成・更新の workflow）
    intent: 未採用の技術候補が合意済み要求として扱われる誤認を防ぎ、テーマの参考情報としての表現力を維持したまま正規の採用状態との整合を確保する。
    verification_refs: [TS-008, TS-009, TS-014]
    source_items: [AG-009, AG-010, AG-011]
  - id: RA-003
    concern: レビュー所見の成果物修正への引き継ぎ接続の実装
    responsibility: phase-review の所見提示と phase-artifacts-update の反映受理の間の引き継ぎで、採用所見の対象・内容・根拠を保持し、修正前に最新の正規成果物と照合し、反映後に実際の変更と照合する手順を接続する。所見の構造は機械可読様式を義務付けず、引き継ぎ経路の要件充足を検証可能な範囲で保持する。中断再開では採用済み所見と現在の成果物の照合から未反映分だけを継続する。
    ownership_hints:
      - src/common/skills/agentdev-workflow-phase-review/（所見提示の workflow）
      - src/common/skills/agentdev-workflow-phase-artifacts-update/（反映受理の workflow。references/ の受理・部分反映手順）
      - docs/designs/workflows/v51-phase-transition-and-coexistence-model.md（接続規律の Design）
    intent: 所見から修正指示への変換時の変質、古い参照による誤修正、誤所見の無条件適用、反映結果の未確認を防ぎ、採用所見が正しい成果物修正へ確実に結び付くようにする。
    verification_refs: [TS-010, TS-011, TS-012]
    source_items: [AG-012, AG-013, AG-014]
  - id: RA-004
    concern: 正規成果物の構造再編操作の実装
    responsibility: REQ・Decision・Design の各成果物管理スキルに、分割・統合・項目移動の操作知識を追加する。既存の採番規則、配置解決、既存成果物との照合、インデックス更新、状態管理の既存規則を適用し、適用前検証（識別子衝突・移動先不明・項目重複）と適用後検証（内容保全・参照整合）を欠落なく持つ。恒久対応表や識別子履歴管理の新設は行わない。
    ownership_hints:
      - src/common/skills/agentdev-req-file-manager/、agentdev-decision-file-manager/、agentdev-design-file-manager/（各成果物の管理スキル）
      - src/common/skills/agentdev-workflow-phase-artifacts-update/（再編の受理と統括）
      - src/common/skills/agentdev-req-file-manager/scripts/src/alloc-req-number.ts（既存の決定的採番。再編時の後継採番もここに従う）
    intent: 増分更新だけでは是正できない既存成果物の構造問題を、専用モードを新設せず既存管理経路の拡張で安全に解決できるようにする。
    verification_refs: [TS-001, TS-002, TS-003, TS-013]
    source_items: [AG-001, AG-002, AG-003, AG-004]
  - id: RA-005
    concern: トレーサビリティ sidecar の verification 宣言の追随
    responsibility: |
      REQ-110/REQ-111 の受け入れ条件対応表の更新（TS-002/004/005 の対象要件行拡張、TS-009 追加）と新規要件行に対応し、対応する実装変更（恒常検証手段の拡張と手順契約の更新）と同一の変更で、各 sidecar の verification 宣言へ次の新規行を追加する。これは実装時点で適用する計画的な宣言追加であり、既存行の検証済み扱いを変更せず、実装前の時点で新規要件行が既存テストにより検証済みであるとは主張しない。
      - traceability/agentdev-phase-theme-collaboration.yaml:
        - verification の src/common/skills/agentdev-phase-theme-collaboration/scripts/tests/sections.test.ts へ REQ-110-030、REQ-110-031、REQ-110-032 を追加する（TS-002 拡張・テーマと採用状態の整合の検証対応）
        - verification の src/common/skills/agentdev-phase-theme-collaboration/scripts/tests/receive.test.ts へ REQ-110-026、REQ-110-027 を追加する（TS-004 拡張・複数受領の区別保存と再投入・内容変更の重複判定の検証対応）
        - verification の src/common/skills/agentdev-phase-theme-collaboration/scripts/tests/received.test.ts へ REQ-110-028、REQ-110-029 を追加する（TS-005 拡張・受領日時の信頼性・由来と採用根拠の区別の検証対応）
      - traceability/agentdev-workflow-phase-artifacts-update.yaml:
        - verification の src/common/skills/agentdev-workflow-phase-artifacts-update/SKILL.md と src/common/commands/agentdev/phase-artifacts-update.md へ REQ-110-022、REQ-110-023、REQ-110-024、REQ-110-025 を追加する（TS-009・正規成果物の構造再編の検証義務対応）
      - traceability/agentdev-workflow-phase-review.yaml:
        - verification の src/common/skills/agentdev-workflow-phase-review/SKILL.md と src/common/commands/agentdev/phase-review.md へ REQ-111-014、REQ-111-015、REQ-111-016 を追加する（所見の成果物修正への引き継ぎの検証義務対応）
      各 sidecar の implementation 宣言は、現行の implementation/verification 対同期の慣行に従い、同一変更で verification と同じ新規行を追加する。v51 両 Design の ADF-COVERS コメント更新（ACT-DESIGN-001〜004）と sidecar 宣言の整合を確認する。
    ownership_hints:
      - traceability/agentdev-phase-theme-collaboration.yaml（TS-002/004/005 対応）
      - traceability/agentdev-workflow-phase-artifacts-update.yaml（TS-009、再編の検証義務）
      - traceability/agentdev-workflow-phase-review.yaml（所見引き継ぎの検証義務）
    intent: 新規要件行の検証義務の所在を sidecar 宣言と docs 側対応表で一致させ、検証対応の追跡可能性を維持する。
    verification_refs: [TS-002, TS-003, TS-004, TS-005, TS-009, TS-010, TS-011, TS-012]
    source_items: [AG-003]

# review_dispositions: 採否判断の記録
review_dispositions:
  - id: RD-001
    source_ru: RU-0236
    source_item: RU-0236
    disposition: covered
    reason_code: fully_reflected
    reason: |
      中心的な要求（利用者の許可に基づく再編、要求内容と受け入れ条件の保全、識別子と参照の整合、実際の変更後の検証、部分失敗からの再開）を AG-001〜004、REQ-110-022〜025、ACT-DESIGN-001、TS-001〜003、RA-004 に反映した。対象外（専用再編コマンド・モードの新設、恒久対応表、識別子履歴DB、再編を伴わない更新での構造変更、全成果物再生成、無許可の内容変更）は REQ-110 対象外の追記と Design 本文で明示した。帰属（REQ-110 APPEND）は RU 記載の方向どおり案Aで確定した（CR-002。SPLIT 信号 2 の提案に対し利用者が APPEND 維持を選択）。
    evidence:
      path: .agentdev/backlog/req-units/RU-0236.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0237
    source_item: RU-0237
    disposition: covered
    reason_code: fully_reflected
    reason: |
      対象（複数受領の一意性、重複・再投入時の正しい判定、受領日時の信頼性、内容の出所と採用根拠の区別、保存済み記録からの再開、直接採用経路との整合）を AG-005〜008、REQ-110-026〜029、ACT-DESIGN-002、TS-004〜007、RA-001 に反映した。対象外（外部検討内容全体の恒久複製、受領履歴の独立DB、監督用操作日誌、外部AIによる採用判断の確定、採否未確定内容の一律採用、全入力への新たな意味評価の義務化）は REQ-110 対象外の追記と Design 本文（既存情報からの再構成優先）で維持した。
    evidence:
      path: .agentdev/backlog/req-units/RU-0237.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_ru: RU-0238
    source_item: RU-0238
    disposition: covered
    reason_code: fully_reflected
    reason: |
      対象（テーマ内の合意・採用に関する主張、採用根拠と正規成果物の状態との照合、未採用候補と未決事項の維持、工程間・別セッションでの参照時の整合、不整合の検出と是正）を AG-009〜011、REQ-110-030〜032、ACT-DESIGN-003、TS-008〜009、RA-002 に反映した。対象外（テーマの第二正本化、全テーマへの根拠参照義務付け、合意語句の全面禁止、自由記述の一律構造化、独立レビューの必須工程化、無判断の技術案の自動採用）は Design 本文で明示した。REQ-111-001 は関連だが本件では変更せず、REQ-110 側の新規行で対応した（不整合検出の独立レビュー側の接続は既存 REQ-111-001 の所見区分が包含）。
    evidence:
      path: .agentdev/backlog/req-units/RU-0238.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-004
    source_ru: RU-0239
    source_item: RU-0239
    disposition: covered
    reason_code: fully_reflected
    reason: |
      対象（採用された所見のみの引き継ぎ、対象・根拠・参照の保持と最新状態への照合、誤所見・古い所見・不明確な指示の扱い、修正後の反映結果と未反映部分の確認、部分反映や中断後の再開）を AG-012〜014、REQ-111-014〜016、ACT-DESIGN-004、TS-010〜012、RA-003 に反映した。対象外（所見の自動採用、独立レビューの必須工程化、新しい公開コマンド、全所見への固定的な機械可読様式の義務付け、恒久的な所見進捗台帳、無条件な自動修正、レビュー実施範囲の一律拡大）は Design 本文で明示した。主対象 REQ-111-001 の拡張ではなく REQ-111 への新規行採用は、同行が所見区分と完了非認定を所有するため行の長大化を避ける構造化判断である（壁打ち Q3 の案A）。
    evidence:
      path: .agentdev/backlog/req-units/RU-0239.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []

# assembly_evidence: 局所修正・追記の組立検査証拠（assemble-draft-section v0.1.0、検査のみでリポジトリ未変更、
# heading_match: exact-after-normalization、scan_scope: 対象セクション内、全操作 pre/post checks all_ok〔記録済み5件〕）
# 2026-10-18 に replace 系編集のうち適用可能な5件を実行し記録した。TS-004/005/002 の入力文字列は
# e1/e2/e3.json（C:/WINDOWS/TEMP/opencode/asm01/）と一致照合済み。適用対象外2種の機械検査結果は次のとおり:
# - REQ-110 適用範囲・対象外行（ACT-REQ-003）: 末尾追記型置換（newText = oldText + 追記節。機械確認済み）のため、
#   本 script の post 検査 old_text_removed と構造的に非両立。実行結果: ok: false、reason: old_text remained after assembly、
#   pre 検査3件は all_ok（target_unique=1件、old_text_expected_count=1件）。代替機械検査として対象見出し一意性（1件）、
#   old_text 出現件数（1件）、newText が oldText の前方一致拡張であることを文字列走査で確認済み。適用仕様自体は
#   ACT-REQ-003 の記載どおり正しく、適用時の検証は case-ready（Design 保存内部責務）が行う
# - covers コメント4件（ACT-DESIGN-001〜004）: 両 Design とも ADF-COVERS コメントが先頭部（見出し節外、
#   v51-phase-driven は covers 行=7 行目・最初の見出し=9 行目、v51-phase-transition は covers 行=8 行目・最初の見出し=10 行目）
#   のため heading スコープを持たず表現範囲外。anchor 一意性=各1件、covers 連鎖の整合
#   （ACT-DESIGN-001 の newText = ACT-DESIGN-002 の oldText、同 002 = 003）を文字列走査で確認済み
assembly_evidence:
  - id: AE-01
    op: REQ-110 受け入れ条件対応 TS-004 行の拡張置換（ACT-REQ-002）
    target_file: docs/requirements/REQ-110.md
    target_content_sha256: 407165e000e13ea226c8d4590d2396282bc3782ff7ce962bba821d3249b2e2d9
    check_scope: {heading: "## 受け入れ条件対応", start_line: 38, end_line: 52}
    execution_conditions: {operation: replace, edit_sha256: 79b1a2fd38d67fe71f995d31edc488e24db647f6a77115b31e7066fc03cb55ef, expected_old_count: 1}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-10-18T01:26:34.030Z"
  - id: AE-02
    op: REQ-110 受け入れ条件対応 TS-005 行の拡張置換（ACT-REQ-002）
    target_file: docs/requirements/REQ-110.md
    target_content_sha256: 407165e000e13ea226c8d4590d2396282bc3782ff7ce962bba821d3249b2e2d9
    check_scope: {heading: "## 受け入れ条件対応", start_line: 38, end_line: 52}
    execution_conditions: {operation: replace, edit_sha256: 8988fa97817554f1e6a377f236d85159849d428c7d0cbebc15d91e08eb05fe31, expected_old_count: 1}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-10-18T01:26:34.031Z"
  - id: AE-03
    op: REQ-110 受け入れ条件対応 TS-002 行の拡張置換（ACT-REQ-003）
    target_file: docs/requirements/REQ-110.md
    target_content_sha256: 407165e000e13ea226c8d4590d2396282bc3782ff7ce962bba821d3249b2e2d9
    check_scope: {heading: "## 受け入れ条件対応", start_line: 38, end_line: 52}
    execution_conditions: {operation: replace, edit_sha256: b42407a82fd90d620d2e72a4eab537671b0b68080b8723dac04b04df950e9461, expected_old_count: 1}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-10-18T01:26:34.031Z"
  - id: AE-04
    op: REQ-110 適用範囲 対象行の拡張置換（ACT-REQ-003）
    target_file: docs/requirements/REQ-110.md
    target_content_sha256: 407165e000e13ea226c8d4590d2396282bc3782ff7ce962bba821d3249b2e2d9
    check_scope: {heading: "## 適用範囲", start_line: 53, end_line: 57}
    execution_conditions: {operation: replace, edit_sha256: 2e2a2ebf2d377973321480effb5e039f85eee057c40c37b3ce63ac57cbd1e90f, expected_old_count: 1}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-10-18T01:26:34.031Z"
  - id: AE-05
    op: REQ-111 適用範囲 対象行の先頭拡張置換（ACT-REQ-004）
    target_file: docs/requirements/REQ-111.md
    target_content_sha256: bc04ca497e610b7d740ac36a81e959f7a10321cbfe83564b28a948ab0a9104ac
    check_scope: {heading: "## 適用範囲", start_line: 30, end_line: 34}
    execution_conditions: {operation: replace, edit_sha256: c98bfa769a3d2fc76cd63cf34baee4daf1c0769b7f9a417f321c709e109a3f3e, expected_old_count: 1}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-10-18T01:26:34.032Z"

  - id: AE-06
    op: REQ-111 検証時参照の列挙同期（ACT-DESIGN-004、最終レビュー指摘反映）
    target_file: docs/designs/workflows/v51-phase-transition-and-coexistence-model.md
    target_content_sha256: 0becf81e6b4cab45509ed7661f198e5f7886fa26817e366dd645816bb637759a
    check_scope: {heading: "## 検証時参照", start_line: 52, end_line: 65}
    execution_conditions: {operation: replace, edit_sha256: fdca005fa15a3339c006867f66b2f2697368cbc97f3243c2a4b6cf25e0d0fbd8, expected_old_count: 1}
    checker:
      name: assemble-draft-section
      version: "0.1.0"
      settings: {heading_match: exact-after-normalization, old_text_count_check: true}
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only"
      scan_scope: target section only
    checks_summary: {pre: {count: 3, all_ok: true}, post: {count: 3, all_ok: true}}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-10-18T01:52:13.144Z"

# case_open_hints: case-open 構成生成への参考情報（Issue 階層は case-open が決定する）
case_open_hints:
  epic_needed: false
  decomposition: 4 OU はいずれも単一 Issue で完結する規模。OU-0001〜0003 は同一ファイル（docs/requirements/REQ-110.md、docs/designs/workflows/v51-phase-driven-collaboration-model.md）への編集を含み、artifact_actions の逐次依存（ACT-REQ-001→002→003 の行アンカー連鎖、ACT-DESIGN-001→002→003 の covers コメント連鎖）が推奨順と一致するため、recommended_order の逐次実行（RU-0236 → RU-0237 → RU-0238 → RU-0239）を推奨する（マージ競合回避の観点からも同一ファイル編集の逐次実行が望ましい）。トレーサビリティ sidecar 3件の verification 宣言追随（RA-005）は各実装変更に同梱する計画的な宣言追加であり、既存行の検証済み扱いを変更しない
  wave_hints: []
```

# summary

本 draft は RU-0236〜0239 の要件定義ドラフト確定版である。利用者の案A／案Aという判断を CR-001/CR-002 に記録し、未解決質問と停止理由を解消した。14合意項目、REQ-110への11行追加、REQ-111への3行追加、Designへの4セクション追加、14検証項目、sidecar 3件への追随方針を保持する。

assemble-draft-section v0.1.0 の適合検査6件を AE-01〜06 に記録した。REQ-110 の対象外行は末尾追記型置換で旧文が接頭辞として残るため検査器が不合格を返し、covers コメント4件は見出し節外となる。これらは成功検査証跡に含めず、代替の出現件数・拡張関係・連鎖整合の確認を記録した。正規成果物への適用は実行していない。

組立検査後に独立委譲した最終対論型レビューで受け入れ条件と対応関係を再確認し、検出した「REQ-111 の検証時参照の列挙同期」1件を ACT-DESIGN-004 に反映した。追加編集の前後検査も合格し AE-06 に記録した。利用者判断待ち事項はなく、auto_ready は true である。
