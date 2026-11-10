---
draft_type: req_draft
topic_slug: adf-simplification-c-delta-gate-lib
status: draft
created_at: 2026-11-10T23:30:00+09:00
---

# draft-data

```yaml
work_type: maintenance
scale: large
summary: 承認済み実装計画の C-δ B1-1・B1-2 として、case-open・case-ready・case-close の3工程入口から反復可能なゲート機械処理を agentdev-artifact-validation が所有する共有 lib（supported lib interface 経由）へ抽出し、fs-helpers.ts と result.ts の正規所有を同 skill へ集約する。工程固有のゲート選択・順序・実行条件・結果解釈、公開 CLI 挙動、検証の副作用なし契約はすべて保存する。B1-2 は正規契約導出、変更前特性化、利用側ごとの前後比較、再合意判定の順を必須とし、4利用側のいずれかで受理集合が変化する場合は互換性変更として利用者再合意を必須とし、全側不変の場合のみ追加承認なしで進行する。検証は計画§4の3区分・試験項目単位・原因単位で行い、既知12不合格の非悪化と単一正規更新の自動伝播を証明する。
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []
agreed_items:
  - id: AG-001
    content: |-
      C-δ B1-1 として、workflow-case-open/scripts/src/prepare_definition_pr.ts、workflow-case-ready/scripts/src/accept_definition_checks.ts、workflow-case-close/scripts/src/close_mechanical_steps.ts の3入口から、ゲート実行体パスの解決と可用性検査、引数検査、--validate-input 相当の入力検査実行などの反復可能な機械処理を、agentdev-artifact-validation が所有する共有 lib（same-shaped な新規 lib を含む。supported lib interface 経由）へ抽出する。工程固有のゲート選択・順序・実行条件・結果解釈は各工程の Design と各入口 script が所有し続ける。B1-1 の CLI 利用側4 skill（agentdev-adopted-conventions、agentdev-artifact-semantics、agentdev-phase-theme-collaboration、agentdev-traceability）の公開 CLI 挙動は変更しない。3工程の起動・失敗分岐・--validate-input 出力が変更前後で同一であることを項目単位で証明する。
  - id: AG-002
    content: |-
      C-δ B1-2 として、fs-helpers.ts と result.ts の正規所有を agentdev-artifact-validation に集約し、4利用側（agentdev-artifact-validation、agentdev-design-file-manager、agentdev-req-file-manager、agentdev-workflow-req-define）が正規 lib 経由で動作する。req-file-manager の部分的統合（REQ helper の再 export のみで ADR helper が局所定義の状態）を解消する。実施順序として、(1) 権威ある ADR 採番契約を Design と REQ の正規文書から導出し根拠を記録する、(2) 4利用側それぞれの変更前の受理集合を特性化テストで確定する、(3) 利用側ごとの変更前後比較表を作成する、(4) 再合意判定を行う、の順を必須とする。契約導出が不能な場合は該当統合を停止して報告し、多数決や他契約（REQ の桁数上限撤廃等）の類推で代用しない。
  - id: AG-003
    content: |-
      B1-2 の対象4利用側のいずれかで、受理・拒否・対象外として扱う入力集合（受理集合）が変化する場合、他の利用側や正規契約と一致する変更も含めて互換性変更として利用者再合意を必須とする。再合意は要件修正（req amendment）経由で扱う。4利用側すべてで受理集合が不変の場合のみ、追加承認なしで進行する。
  - id: AG-004
    content: |-
      検証は承認済み実装計画§4の共通条件に従う。必須検査は合格、既存不合格は試験項目単位かつ原因単位で新規・悪化ゼロ、実行不能は理由と再実行条件の記録、の3区分で判定し、3区分目を合格扱いにしない。判定は不合格件数の比較ではなく試験項目と原因の個別比較で行う。結果・失敗分岐・副作用の等価、独立管理・同期サイトの変更前後の一覧、新規依存・例外・検査の保守費用の記録、代表変更が正規所有1点の更新で全利用側へ自動伝播すること、新規の手動同期重複を作らないことを確認する（依存数の減少は必須としない）。最終的に配布境界・投影・textlint の規則に合格する。実施報告は実際に実行した検査のみを記録し、運用上の便益を合格根拠にしない。説明不能な挙動差分は停止・報告する。
  - id: AG-005
    content: |-
      検証基線はコミット f78601947dbc73ac0f580ff98bd3263b6db78571 に対する記録 C:/Users/ogatay/work/adf-simplification/55-baseline-test-record.md（ルート bun test 2,229試験・既知不合格11件、.opencode/ 4,750試験・既知不合格1件の合計既知12不合格）を採用する。入力が参照する 55-baseline-and-alpha1.md は実在しないため、実在確認した別名の同記録を採用した。同記録は不合格の試験名を持つが原因分類が不足しているため、C-δ の検証実行時に項目・原因単位の基線証拠を補完する。将来の Case 開始時には main を取得し、承認済み順序（Cα1、Cβ、Cα2、Cγ、Cδ、Cε、Cω）に従って移動 main 上で基線を再評価する。
  - id: AG-006
    content: |-
      対象は承認済み実装計画の C-δ B1-1・B1-2 のみとし、他の Case 項目を実施しない。共有 lib に明示的な書込みなど検証操作の副作用を含めない（workflow-req-define の組立 CLI の明示 --write 契約は同 skill の公開契約が所有し続ける）。公開検証契約と supported lib interface は別契約として区別し、内部 script 直接参照の禁止は維持する。新規 Decision は作成しない（既存の共有所有・決定的処理委譲の各契約の範囲内の内部共通化であるため）。REQ への操作は行わず、互換性変更（受理集合の変化）が確定した場合に限り要件修正経由で扱う。
artifact_actions:
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/commands/case-open.md
    target_area: "### 機械工程の script 呼び出し契約（RU-0162）"
    source_items: [AG-001, AG-006]
    content: |

      case-open STEP-4（実変更判定と設計PR作成）の機械工程（専用 worktree 作成、Definition branch 作成、REQ 行編集、generate_indexes、check_integrity、traceability check、明示パス指定 stage・commit まで）は、工程別 script 1 回の呼び出しに束ねる。script はローカル決定的処理のみを担当し、GitHub I/O（Issue/PR 作成・マージ・クローズ）は Custom Tool agentdev_gh の境界を維持し、script 内で直接実行しない。

      - 入力 JSON: 対象 draft パス、Root Case 識別子、Definition branch 名など所定の入力一式を渡す
      - 報告 JSON: 実行結果（各処理の成否）、差分、警告、提案する Issue/PR 本文を stdout へ返す。提案本文の採否と報告内容の意味レビューはモデルが担当する
      - 終了コード: 成功は 0、要判断・失敗は非 0 を区別する。script は処理を省略せず、失敗時は途中結果とともに非 0 で終了する
      - 計測日収束（REQ-117-011）: check_integrity 報告の計測日不整合・req-updated-freshness NG を trigger 条件として、frontmatter updated 追随と generate_indexes 再実行を script 内の measurement-convergence step で補正 commit まで完結する。対象抽出は req-updated-freshness 報告の REQ ファイル名のみ形式（docs/requirements/ プレフィックスなしのファイル名のみ報告）とプレフィックス付き形式の双方を捕捉し、NG 報告対象と補正適用対象の差分検査（補正漏れの fail-closed 検出）を step に含める。trigger 条件が満たされない場合は本 step を生成せず、既存の一巡実行の挙動は変化しない。手動 contingency は本 step の失敗時救済として維持する
      - 既存の品質ゲート（check_integrity、traceability check、generate_indexes 差分検出）は script 内で実行し、省略しない
      - traceability gate を有効にする入力では、判定対象 REQ 集合（traceabilityReqIds）の存在と有効性を gate 実行前に検証する（REQ-030-028）。欠落・空・不整合入力は fail-closed で報告し、空配列への暗黙正規化で入力不備を隠蔽しない
      - REQ 追加を伴う Definition Package 生成時は、docs/README.md 手動管理区間の件数記述の照合を初回の変更・検証範囲に含め（REQ-030-029）、REQ 行数由来の派生物が stage paths に事前包含できない場合は既存の事後突合 contingency 手順に従う
      - script の実装は inspect_cross_dependencies.ts と同じ作りに従う。ゲート実行体の解決と可用性検査、引数検査、--validate-input 相当の入力検査実行など反復可能な機械処理に限り、agentdev-artifact-validation が所有する共有 lib（supported lib interface 経由）を利用できる。工程固有のゲート選択・順序・実行条件・結果解釈は各工程の Design が所有し続け、横断的な共通基盤を新設しない
      - 意味判断（停止判断、deviation 分類、adversarial review、警告の重要度評価）はモデルが担当し続け、script は機械的に確定した手順のみを実行する
      - workflow skill 参照文面（references/*.md）は、LLM が bash コマンドを逐次実行する指示から script 呼び出しと報告 JSON 解釈へ置き換えて短縮する
      - 本契約は Definition 編集（DefinitionEdit による対象パス + 旧文完全一致置換）の script 適用について規定するものであり、新規 REQ/Decision ファイルの worktree 内前置作成（agentdev-git-worktree 標準手順 type=definition による前置作成、node writeFileSync による UTF-8 明示配置）を排除しない。前置作成済みファイルは script の冪等再利用（branch 確認済み worktree 再利用）と整合して扱う。前置作成の具体的手順は配布 reference（definition-pr-and-idempotency.md）の STEP-4 手順が所有する
      - DefinitionEdit の入力 JSON 組立後、各編集の newText の行構造（oldText から newText への行区切りの保全）を、oldText 末尾の行末改行の有無に依存しない方法で機械検証する事前確認を script 入力検証として経る。行区切りの連結など事前確認に不合格の編集を含む入力は fail-closed で拒否する。当該確認は適用後の verbatim 包含突合（REQ-030-027）を代替しない（REQ-030-030）
      #### artifact_actions 適用後の verbatim 包含突合（REQ-030-027）

      script 呼び出しによる Definition 適用の後、設計PR作成の前に、モデル側の受入検査として適用後成果物への突合を実行する。

      - 突合対象は、当該 Case の draft の artifact_actions のうち適用済みと扱う全 action の content とする。追記・置換の各 edit について、適用後ファイルを直接読み、合意済み content の各段落・各行が逐語的に存在することを機械的検索で確認する
      - 節見出しだけが適用され本文段落が欠落している状態、置換により既存記述が黙示的に欠落している状態は突合不成立とする
      - 突合不成立が判明した場合は設計PRを作成せず停止する（fail-closed）。欠落の再適用は DefinitionEdit の旧文完全一致契約の範囲で行い、冪等再実行の手順（適用済み工程の確認と不足分のみの再適用）と非競合とする
      - 突合成立後の PR 本文の検証記録は、適用後成果物への突合結果を根拠として記録する。適用予定内容の記述を適用済みの証拠として記録しない
      - verbatim 適用を主張する検証記録には、適用後成果物への包含突合（または edit 単位の再現確認）を伴う規律を、同型の適用系操作全般へ適用する

      #### 機械工程 script の実行前提の解決（REQ-029-014〜016）

      機械工程 script は producer 側の採番・構成の前提（REQ 行IDの桁数・書式、producer 固有ツールの存在、パス引数の環境形式）を埋め込み値として要求しない。実行前提は workflow 側で Project Extensions（`.agentdev/extensions/`）等のプロジェクト固有値から解決し、script へは明示入力として渡す。script 側の既定値に producer 前提を保持しない。

      - REQ 行IDの書式検証は桁数を固定しない許容書式（traceability checker 契約と同じ REQ-{NNNN}-{MMM} 形式）で行い、存在と有効性の検証（REQ-030-028 の規律）と組み合わせる
      - producer 固有のゲート（generate_indexes、check_integrity、traceability-check 等）を必須とする場合、script は当該ゲート実行体の配布先での存在を検査してから起動する。欠落時は fail-closed で報告し、正規の代替経路（証跡化、手動相当手順、対照実行による悪化ゼロ件の機械証明）への切替を報告 JSON に含める。代替経路の履行なしに検査を省略して成功扱いとしない
      - 横断依存検査（inspect_cross_dependencies.ts）の `--root` 等のパス引数は、Windows と Unix 系 shell のパス形式の違い（Git Bash の `/c/...` 形式等）を検出または正規化して受け付ける。正規化不能な形式は検査不能（detection_unavailable）として通過させず、形式エラーとして報告し、形式の違いだけで検出不能とならない
      - 本節の規律は case-ready、case-close の機械工程 script 呼び出しにも同一に適用される（各 Design の既有の同一規律参照を維持する）
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target: docs/designs/commands/case-ready.md
    target_area: "## 機械工程の script 呼び出し契約（RU-0162）"
    source_items: [AG-001, AG-006]
    content: |

      case-ready の機械工程（設計PRの忠実性・整合性・品質検査の実行、overlap 突合、AUTOGEN 対象 block の再生成差分検出、traceability check、merge 後の canonical 再取得、draft/RU 削除の git rm と明示パス指定 commit）は、工程別 script 1 回の呼び出しに束ねる。GitHub I/O（pr_read、pr_merge、Issue 本文更新）は Custom Tool agentdev_gh の境界を維持する。REQ/Decision/Design の保存実体（Capability Skill 委譲による保存手続き）は本 script の対象外とし、保存責務の委譲構造を変更しない。

      - 入力 JSON / 報告 JSON / 終了コードの契約、品質ゲートの script 内実行（省略禁止）、inspect_cross_dependencies.ts と同じ作り（反復可能な機械処理に限り agentdev-artifact-validation 所有の共有 lib を supported lib interface 経由で利用できる。工程固有のゲート選択・順序・実行条件・結果解釈は各工程の Design が所有し続け、横断的な共通基盤を新設しない）、意味判断のモデル担当は、case-open Design「機械工程の script 呼び出し契約（RU-0162）」節と同一の規律に従う
      - canonical 再取得の fetch・ff-only merge が失敗した場合は、ローカル main と origin/main の分岐の有無（ahead/behind の件数とコミット一覧）を検出し、報告 JSON の該当 step detail へ反映する。script は分岐を自動解消せず、解消は agentdev-git-worktree の「Squash merge 後分岐ハンドリング手順」（git-common-procedures.md）に従う（REQ-061-052）。同手順の処理分岐（完全重複・部分重複・独立変更）と case-close STEP-4-3 からの既存参照を変更しない
      - 報告 JSON には検査結果、再生成差分、警告、提案する Issue/PR 本文を含め、モデルは報告 JSON の意味レビューと agentdev_gh による I/O 実行のみを担う
      - workflow skill 参照文面は script 呼び出しと報告 JSON 解釈へ置き換えて短縮する
  - id: ACT-DESIGN-003
    artifact: design
    operation: update
    target: docs/designs/commands/case-close.md
    target_area: "## 機械工程の script 呼び出し契約（RU-0162）"
    source_items: [AG-001, AG-006]
    content: |

      case-close の機械工程（mergeable ポーリング、squash merge 前後のローカル状態検査、Epic 実行構成表の解析と状態更新、完了条件チェックボックス評価の機械的抽出、AUTOGEN 再生成差分検出、full integrity suite の起動と結果集約、契約状態記録・未追跡残存検査、終了判定記録（`.agentdev/close-acceptance/`）の書出し・無効化と終了後回収、worktree/branch クリーンアップ）は、工程別 script 1 回の呼び出しに束ねる。GitHub I/O（pr_merge、issue_close、Issue 本文更新）は Custom Tool agentdev_gh の境界を維持する。

      - 入力 JSON / 報告 JSON / 終了コードの契約、品質ゲートの script 内実行（省略禁止）、final-acceptance.ts・inspect_cross_dependencies.ts と同じ作り（反復可能な機械処理に限り agentdev-artifact-validation 所有の共有 lib を supported lib interface 経由で利用できる。工程固有のゲート選択・順序・実行条件・結果解釈は各工程の Design が所有し続け、横断的な共通基盤を新設しない）、意味判断（警告の重要度評価、Design 確定判断、未達判定の確定）のモデル担当は、case-open Design「機械工程の script 呼び出し契約（RU-0162）」節と同一の規律に従う
      - post-merge の worktree/branch クリーンアップは、main working tree 構成（worktreeRoot == repoRoot・Epic 最終close等）では worktree とその checkout ブランチが削除対象外（REQ-118-005）であるため適用対象外として pass を記録し、worktree remove と branch 残存検知を実行しない。cleanup.removeWorktree: false 指定時も worktree 削除を発行しない。通常 worktree 構成は従来どおり削除と残存検知を行い、残存時の要判断警告を維持する。明示指定された removeBranch の削除失敗はいずれの構成でも回収失敗として扱う
      - 報告 JSON にはマージ・検証・クリーンアップの各結果、差分、警告、提案するコメント本文を含める
      - workflow skill 参照文面は script 呼び出しと報告 JSON 解釈へ置き換えて短縮する
      - 完了条件チェックボックス評価の機械的抽出（close_mechanical_steps.ts の抽出フェーズ）は、受入評価（final-acceptance.ts への入力）の母集団導出を兼ねる。抽出結果（正規完了条件の一覧とその取得成否）を受入評価入力へ渡し、報告 JSON に母集団と判定の対応を含める。抽出失敗は評価の blockers 扱いとし、空の判定入力を「条件なし」へ変換しない
      - final-acceptance.ts（evaluateFinalAcceptance）は完了条件単位評価の機械評価部品として、判定入力（verdicts・crossObligations）の構造検査と必須未達・根拠欠落の検出を担う。証拠の意味対応評価（証拠が条件の意味命題を立証しているか）はモデルが担当し、機械部品の通過だけで完了を確定しない
      - 受入評価の拒否・未確定の結果（closeAllowed 相当の判定とその根拠）は報告 JSON を通じて終了操作の実行抑制として消費される。STEP-5 の issue_close 実行と E1〜E6 の Epic 終了は、受入評価の許可を前提条件として扱い、拒否結果を保持したまま終了操作を実行しない
      - gate 証跡保持要件: 機械工程の品質ゲート（full integrity suite 等）のうち stderr 出力ランナー（bun test 等）を含む検証は、当該ランナーの検証実行（script 外の直接実行）に stdout と stderr の分離退避を常時付与する。機械工程 script 呼び出し自体のリダイレクトラップは現行 runner が stderr を内部捕捉するため証跡成立手段にならない。件数突合系 gate の受理根拠は stderr 退避ファイル（件数サマリーの出力先）に置き、検証差分には既存の検証差分記録規約（agentdev-workflow-templates）に従い保存先・終了コード・checker の版・検査範囲・実行環境を記録する。報告 JSON の保持構造への依存（stdout のみ保持等）を証跡の成立根拠にしない

      ### QG-4 機械受理基準と機械判定経路の対応（RU-0226）

      機械工程の full integrity suite 判定と QG-4 最終受入規範（agentdev-quality-gates の references/qg-4-final-acceptance.md）の機械受理基準との対応は本節が単一所有する。機械受理基準の記録様式の定義は QG-4 規範が正であり、本節は対応関係のみを記述し様式を再掲しない。

      - 機械受理基準と機械判定経路の対応: 受理条件5（fail 全件の由来分類、由来不明 0）と受理条件7（pre-existing fail の baseline 再現確認記録）を満たす検証結果記録は、full integrity suite に fail 件数が残存していても規範が合格として認める受理経路である。機械工程は当該記録の存在・形式を機械受理基準の10項目の記録完備で検証し、終了操作許可の判定に反映する。受理条件8の「非ゼロ終了・timeout 打ち切り・切断した実行結果を pass 証拠として扱わない」は、由来分類記録を欠く生の実行結果単独を pass 証拠としない意味として適用する
      - 拒否経路の背反防止: 受入評価の拒否（closeAllowed 相当）と機械工程の exitCategory による拒否の2系統は、同一入力に対して同一の判定結果へ収束すること。機械受理基準を満たす記録で分類済みの fail が残る場合、機械工程の当該 step は規範の判定に従い、機械受理基準の記録欠落、由来不明 fail の残存、未登録の既知欠陥を合格の根拠にする場合は fail-closed として終了操作を拒否する
      - 終了コードの非変換: 機械工程は検証ランナーの非ゼロ終了コードを成功へ変換しない。終了コードは受理条件8の記録として保持し、分類記録の検証は終了コードの変換ではなく独立の判定層として重ねる
      - 既知欠陥登録経路の対応: checker NG の登録は provenance 付き NG baseline（契約の正は checker 実行契約 Design「baseline 退避物と BaselineFile の役割分離と合否判定基準」節と integrity 契約 Design「NG baseline 運用手順」）とする。bun test suite fail の登録様式は文言統合とする（ユーザー判断 2026-10-15・判断記録 CR-003/CR-004）: 機械受理基準の記録一式（受理条件5の由来分類記録・受理条件7の baseline 再現確認記録・provenance・件数記録）を登録様式と定義し、恒久台帳は新設せず、既存の PR 本文検証差分が当該記録一式の登録として機能する。整合方向は機械工程側の修正（implementation-first）に確定済みであり、機械工程は当該記録一式の存在・形式を機械受理基準の10項目の記録完備で検証して終了操作許可の判定に反映する。未登録の既知欠陥を合格の根拠にする結果の拒否は維持する
  - id: ACT-DESIGN-004
    artifact: design
    operation: update
    target: docs/designs/skills/agentdev-artifact-validation.md
    target_area: "## 現在の動作"
    source_items: [AG-001, AG-002, AG-003, AG-006]
    content: |

      - 所有 script（`check-frontmatter-consistency.ts`、`check-entry-existence.ts`、`check-change-impact.ts`、`check-req-row-existence.ts`）は `src/common/skills/agentdev-artifact-validation/scripts/` 配下に配置する
      - script は決定的（純粋関数）、テスト可能（`tests/*.test.ts`）とする
      - I/O は argv/stdin で入力を受け取り、stdout で JSON 結果を返す
      - 利用側の保存内部責務および skill（`agentdev-req-file-manager`、`agentdev-decision-file-manager`、`agentdev-design-file-manager` 等）は内部 script パスを直接参照せず、本 skill の公開検証契約へ委譲する
      - 同一 script または共有 lib を複数 skill へ複製しない
      - 共有 lib（fs-helpers、result、および case 系 workflow script が共有するゲート機械処理 lib）の正規所有を本 skill が担う。兄弟 skill の scripts は、本 skill が公開する supported lib interface（本 skill が定義する参照経路）経由で共有 lib を利用する
      - 共有 lib の受理集合（ファイル名形式・番号桁などの解析対象範囲）を変更する場合は、影響する全利用側の変更前後比較と、受理集合が変化する利用側が存在する場合の利用者再合意を前提とする。共有 lib に明示的な書込みなど検証操作の副作用を含めない
  - id: ACT-DESIGN-005
    artifact: design
    operation: update
    target: docs/designs/skills/agentdev-artifact-validation.md
    target_area: "## 境界"
    source_items: [AG-002, AG-003, AG-006]
    content: |

      REQ 固有 script は `agentdev-req-file-manager`、Decision 固有 script は `agentdev-decision-file-manager`、Design 固有 script は `agentdev-design-file-manager` が所有する。
      利用側は本 skill の内部 script を直接参照せず、公開検証契約への委譲を基本とし、共有 lib に限り本 skill が公開する supported lib interface（本 skill が定義する参照経路）経由の利用を認める。supported lib interface は公開検証契約（操作名、入力、JSON 結果、エラー契約）とは別の内部共用契約であり、検証操作の境界と副作用なしの共通契約を緩めない。
      共有 lib が受理する解析対象の範囲（ファイル名形式、番号桁等の受理集合）の変更は、影響する全利用側の変更前後比較と、受理集合が変化する利用側が存在する場合の利用者再合意を前提とする。
      同一 script または共有 lib を複製しない。
conflict_resolutions:
  - id: CR-001
    conflict: 現行の case-open・case-ready・case-close の各 Design「機械工程の script 呼び出し契約（RU-0162）」節は共通基盤を作らないと規定しており、B1 の共有 lib 抽出と衝突する。
    resolution: 承認済み実装計画が反復可能な機械処理の共有を承認していることに基づき、共有を agentdev-artifact-validation 所有・supported lib interface 経由・反復可能な機械処理に限定し、工程固有のゲート選択・順序・実行条件・結果解釈の各工程 Design による所有を明示した狭範囲の条項修正として解消した。横断的な共通基盤の新設禁止と意味判断のモデル担当は維持する。本重要変更はドラフト保存前に利用者へ通知済みである。
  - id: CR-002
    conflict: 入力が参照する基線記録 55-baseline-and-alpha1.md が実在せず、基線証拠の正が定まらない。
    resolution: 実在する C:/Users/ogatay/work/adf-simplification/55-baseline-test-record.md（基線コミット f78601947dbc73ac0f580ff98bd3263b6db78571 固定）を読み取り、記載内容（ルート 11 不合格・.opencode 1 不合格の合計既知12不合格）を採用した。同記録は不合格の試験名を持つが原因分類が不足しているため、項目・原因単位の基線証拠は TS-007 により本 Case の検証時点で補完する。
operation_units:
  - ou_id: OU-001
    target_design:
      - docs/designs/commands/case-open.md
      - docs/designs/commands/case-ready.md
      - docs/designs/commands/case-close.md
      - docs/designs/skills/agentdev-artifact-validation.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
  - ou_id: OU-002
    target_design:
      - docs/designs/skills/agentdev-artifact-validation.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
result: {}
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      B1-1 実装の前後で、3工程入口（prepare_definition_pr.ts、accept_definition_checks.ts、close_mechanical_steps.ts）について、既存テストと追加の特性化テストにより、通常起動・失敗分岐・--validate-input（相当の入力検査）の出力（stdout/stderr の JSON 構造と終了コード）、ゲート呼び出しの対象・順序・条件、副作用の有無を試験項目単位で比較する。変更前の実行結果を記録し、変更後に同一入力で再実行して突合する。
    pass_criteria: |
      全比較項目が変更前後で同一であること（ゲート選択・順序・実行条件・結果解釈の変化なし、出力・終了コード・副作用の差分ゼロ）。
    on_failure: |
      差分が生じた場合は工程固有ポリシーと出力契約を維持するよう実装を修正して再検証する（fix-and-reverify）。説明不能な挙動差分は計画§5に従い停止・報告する。
  - id: TS-002
    target_item: AG-001
    verification: |
      B1-1 の CLI 利用側4 skill（agentdev-adopted-conventions、agentdev-artifact-semantics、agentdev-phase-theme-collaboration、agentdev-traceability）の公開 CLI について、有効入力・無効入力・ゲート不能を含む特性化テストを変更前に確定し、変更後に同一条件で再実行して、受理・拒否・対象外の判定、出力、終了コードを比較する。
    pass_criteria: |
      4 skill の公開 CLI 挙動がすべて変更前後で同一であること。
    on_failure: |
      挙動差分を生じた実装を公開契約維持側へ修正して再検証する（fix-and-reverify）。
  - id: TS-003
    target_item: AG-002
    verification: |
      B1-2 の実施記録が、(1) 正規文書（ADR 採番に関わる Design と REQ）からの受理契約導出と根拠記録、(2) 4利用側それぞれの変更前受理集合の特性化テスト、(3) 利用側ごとの変更前後比較表、(4) 再合意判定、の順で作成されていることを成果物と PR 記録で検証する。契約導出が不能だった場合は、該当統合の停止記録と報告が存在することを検証する。
    pass_criteria: |
      4工程の順序どおりの記録が存在し、導出不能時に多数決や他契約の類推による代用が行われていないこと。
    on_failure: |
      手順順序や根拠記録が欠落している場合は該当工程を実施してから先へ進まない（fix-and-reverify）。
  - id: TS-004
    target_item: AG-003
    verification: |
      4利用側（artifact-validation、design-file-manager、req-file-manager、workflow-req-define）それぞれの受理・拒否・対象外入力集合の変更前後比較表と再合意判定記録を検証する。受理集合が変化した利用側では、利用者再合意の記録（要件修正経由）が適用前に存在することを確認する。
    pass_criteria: |
      4利用側すべてで受理集合が不変であること、または変化した利用側ごとに適用前の利用者再合意記録が存在すること。
    on_failure: |
      再合意なしに受理集合を変化させた実装は適用を取り下げ、再合意取得後に再適用・再検証する（fix-and-reverify。再合意は利用者判断であり代理しない）。
  - id: TS-005
    target_item: AG-004
    verification: |
      計画§4の3区分（合格、既知不合格の非悪化、実行不能）で試験項目単位・原因単位の判定記録を作成する。3工程入口・4 CLI skill・4利用側 lib の関連スイートに加え、結果・失敗分岐・副作用の等価確認を含む。実行不能項目は理由と再実行条件を記録する。
    pass_criteria: |
      全必須検査が合格または非悪化で判定され、実行不能を合格扱いにした項目が存在しないこと。
    on_failure: |
      新規不合格・悪化が生じた場合は実装を修正して再検証する（fix-and-reverify）。実行不能が解消できない場合は理由と再実行条件を記録した上で当該項目を未完了として扱い、合格と報告しない。
  - id: TS-006
    target_item: AG-004
    verification: |
      変更前後で独立管理・同期サイトの一覧を記録し、新規依存・例外・検査の保守費用を記録する。代表変更（共有 lib の受理集合や出力形式の修正等）を正規所有1点に適用し、全利用側への自動伝播を検証する。
    pass_criteria: |
      代表変更が単一の正規更新で全利用側へ自動伝播すること、および新規の手動同期重複が存在しないこと（依存数の減少は必須としない）。
    on_failure: |
      手動同期の新設や伝播不全が検出された場合は、同期構造を正規所有への寄せへ修正して再検証する（fix-and-reverify）。
  - id: TS-007
    target_item: AG-005
    verification: |
      基線コミット f78601947dbc73ac0f580ff98bd3263b6db78571 の記録（ルート 2,229試験・既知不合格11件、.opencode/ 4,750試験・既知不合格1件の合計既知12不合格）に対し、C-δ 変更後の実行結果を試験項目単位・原因単位で比較する。基線記録に原因分類が不足している項目は、変更前実行による補完記録を本 Case の検証記録に含める。既知不合格の意図的解消は許容する。
    pass_criteria: |
      既知12不合格の悪化が皆無で、新規不合格が 0 件であること（意図的解消分を除く）。
    on_failure: |
      悪化・新規不合格は実装を修正して再検証する（fix-and-reverify）。基線再現が不能な場合は計画§4の実行不能区分として理由と再実行条件を記録し、合格扱いとしない。
  - id: TS-008
    target_item: AG-006
    verification: |
      変更後に配布境界・投影（原本から配置先への同期）・textlint の各規則を実行する。所有 skill の README・SKILL 記述（内部 script 直接参照の禁止と supported lib interface の区別）が実装と一致することを確認する。
    pass_criteria: |
      配布境界・投影・textlint の全検査が合格し、記述と実装の不一致が存在しないこと。
    on_failure: |
      不一致は記述または実装の正規所有側へ修正して再検証する（fix-and-reverify）。
realization_actions:
  - id: RA-001
    concern: B1-1 ゲート機械処理の共有 lib 抽出
    responsibility: 3工程入口 script から、ゲート実行体パスの解決と可用性検査、引数検査、--validate-input 相当の入力検査実行などの反復可能な機械処理を、agentdev-artifact-validation が所有する共有 lib（same-shaped な新規 lib を含む）へ抽出する。ゲート選択・順序・実行条件・結果解釈と工程固有の判定は各入口が保持する。
    ownership_hints:
      - 対象入口: src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts
      - 対象入口: src/common/skills/agentdev-workflow-case-ready/scripts/src/accept_definition_checks.ts
      - 対象入口: src/common/skills/agentdev-workflow-case-close/scripts/src/close_mechanical_steps.ts
      - 共有先: src/common/skills/agentdev-artifact-validation/scripts/lib/
      - 正規所有 Design: docs/designs/skills/agentdev-artifact-validation.md
    intent: 3入口の重複実装を正規所有1点へ集約し、工程契約・出力・挙動を変えずに保守対象を減らす。
    verification_refs: [TS-001, TS-002, TS-005]
    source_items: [AG-001]
  - id: RA-002
    concern: B1-2 fs-helpers・result の正規所有への集約
    responsibility: fs-helpers.ts と result.ts の正規所有を artifact-validation に集約し、4利用側の scripts を正規 lib 経由へ統合する。req-file-manager の部分的統合（REQ helper の再 export のみで ADR helper が局所定義の状態）を解消する。workflow-req-define の明示 --write 書込みは同 skill の公開契約に留め、共有 lib へ移さない。ADR 受理契約は TS-003 の導出結果を待って適用し、導出不能なら該当統合を停止する。
    ownership_hints:
      - 正規 lib: src/common/skills/agentdev-artifact-validation/scripts/lib/fs-helpers.ts、同 result.ts
      - 利用側: src/common/skills/agentdev-design-file-manager/scripts/lib/
      - 利用側: src/common/skills/agentdev-req-file-manager/scripts/lib/
      - 利用側: src/common/skills/agentdev-workflow-req-define/scripts/lib/
      - 正規所有 Design: docs/designs/skills/agentdev-artifact-validation.md
    intent: 同形 helper と結果出力の重複を正規1点へ集約し、受理集合の変更は比較と再合意の管理下で行う。
    verification_refs: [TS-003, TS-004, TS-005, TS-006]
    source_items: [AG-002, AG-003]
  - id: RA-003
    concern: 所有 skill 配布物記述と supported lib interface の整合
    responsibility: artifact-validation の README・SKILL、および利用側 skill の記述において、内部 script 直接参照の禁止と supported lib interface 経由の共有の区別を、実装後の状態に一致させる。
    ownership_hints:
      - src/common/skills/agentdev-artifact-validation/scripts/README.md
      - src/common/skills/agentdev-artifact-validation/SKILL.md
      - 各利用側 skill の README・SKILL
      - 正規所有 Design: docs/designs/skills/agentdev-artifact-validation.md
    intent: 配布物の参照規律と実装の整合を保ち、内部共用契約を公開検証契約と混同させない。
    verification_refs: [TS-008]
    source_items: [AG-006]
  - id: RA-004
    concern: 特性化テストとスイート構成
    responsibility: 3工程入口・4 CLI skill・4利用側 lib の変更前特性化テストを確定し、変更後も同一スイートが正規 lib 経由で通過する構成を保持する。共有 lib 単体テストだけで利用側テストを置き換えない。
    ownership_hints:
      - 各 scripts/tests/ 配下の既存テスト群と追加特性化テスト
    intent: 挙動保存を既存テストと同じ粒度で証明可能にする。
    verification_refs: [TS-001, TS-002, TS-003, TS-005, TS-007]
    source_items: [AG-001, AG-002, AG-004, AG-005]
assembly_evidence:
  - target_file: docs/designs/commands/case-open.md
    target_content_sha256: be06d0ba204e4aca9356a53ff44b11292b8b126ba4e1f19f0e695ef3607463b6
    check_scope:
      heading: "### 機械工程の script 呼び出し契約（RU-0162）"
      start_line: 76
      end_line: 110
    execution_conditions:
      operation: replace
      edit_sha256: aa3026fdb364be27a603600f9c08f2e68f0aa6b443bd563677148f90612c12f0
      expected_old_count: 1
    checker:
      name: assemble-draft-section
      version: 0.2.0
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan
      scan_scope: target section only
    checks_summary:
      pre: {count: 3, all_ok: true}
      post: {count: 3, all_ok: true}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-11-10T14:27:29.595Z"
  - target_file: docs/designs/commands/case-ready.md
    target_content_sha256: 7dedcd9028c2ecd9e79504f7e59b26fbc069d05811b655bedf0f0951069a6b6e
    check_scope:
      heading: "## 機械工程の script 呼び出し契約（RU-0162）"
      start_line: 89
      end_line: 97
    execution_conditions:
      operation: replace
      edit_sha256: 76217651f5c9728680d24e16e1429f2d3876eebd57a4768932744033a4a8c6c2
      expected_old_count: 1
    checker:
      name: assemble-draft-section
      version: 0.2.0
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan
      scan_scope: target section only
    checks_summary:
      pre: {count: 3, all_ok: true}
      post: {count: 3, all_ok: true}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-11-10T14:27:29.762Z"
  - target_file: docs/designs/commands/case-close.md
    target_content_sha256: 36f1acb9a488b0a51d472b5f933d702d87decc92cc52825cc2f9808ef106e251
    check_scope:
      heading: "## 機械工程の script 呼び出し契約（RU-0162）"
      start_line: 343
      end_line: 364
    execution_conditions:
      operation: replace
      edit_sha256: 8f0f5cc916d759e4d107a433d8a787a96148b41bfba2f9005ab28fac750e2045
      expected_old_count: 1
    checker:
      name: assemble-draft-section
      version: 0.2.0
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan
      scan_scope: target section only
    checks_summary:
      pre: {count: 3, all_ok: true}
      post: {count: 3, all_ok: true}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-11-10T14:27:29.870Z"
  - target_file: docs/designs/skills/agentdev-artifact-validation.md
    target_content_sha256: 4773623645ee861cb5bb8facd7f5b9e65edaba122c44c527b9ad4b5c26b1db40
    check_scope:
      heading: "## 境界"
      start_line: 66
      end_line: 71
    execution_conditions:
      operation: replace
      edit_sha256: f5ebf18ff7808f1afa23970294d2c653c6409ad0aef2783c86ad9e3afaa4ce9d
      expected_old_count: 1
    checker:
      name: assemble-draft-section
      version: 0.2.0
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan
      scan_scope: target section only
    checks_summary:
      pre: {count: 3, all_ok: true}
      post: {count: 3, all_ok: true}
    diff_compact: {changed_lines_count: 2, added: 2, removed: 1}
    executed_at: "2026-11-10T14:29:03.229Z"
  - target_file: docs/designs/skills/agentdev-artifact-validation.md
    target_content_sha256: 4773623645ee861cb5bb8facd7f5b9e65edaba122c44c527b9ad4b5c26b1db40
    check_scope:
      heading: "## 現在の動作"
      start_line: 58
      end_line: 65
    execution_conditions:
      operation: append
      edit_sha256: 5eb683726a22f183459c447201e37b81ce51ffea9c116b409160ac49d8086ed3
      expected_old_count: null
    checker:
      name: assemble-draft-section
      version: 0.2.0
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan
      scan_scope: target section only
    checks_summary:
      pre: {count: 2, all_ok: true}
      post: {count: 2, all_ok: true}
    diff_compact: {changed_lines_count: 3, added: 3, removed: 0}
    executed_at: "2026-11-10T14:27:30.095Z"
case_open_hints:
  epic_needed: false
  decomposition: OU-001（B1-1）と OU-002（B1-2）は独立に検証可能な変更であり、推奨順序は B1-1 → B1-2（実装計画の B1 順）。Issue 構成は case-open が決定する。
  wave_hints: []
```

# summary

- 対象: 承認済み実装計画 C-δ の B1-1（3工程入口のゲート機械処理を共有 lib へ抽出）と B1-2（fs-helpers・result の正規所有を artifact-validation へ集約）。対象外: C-δ 以外の Case 項目。
- Design 修正 5件: case-open・case-ready・case-close の「機械工程の script 呼び出し契約（RU-0162）」節（共通基盤禁止の狭範囲緩和。工程ポリシー・安全性・証跡規律は全維持）と、artifact-validation Design の「現在の動作」「境界」（supported lib interface と受理集合変更時の再合意条件の明記）。
- 保持条件: B1-2 で4利用側のいずれかの受理集合が変化する場合は互換性変更として利用者再合意を必須（全側不変の場合のみ無承認で進行）。ADR 受理契約は正規文書から導出できなければ該当統合を停止（AG-002、AG-003、TS-003、TS-004）。
- 検証方針: 計画§4の3区分（合格・既知12不合格の非悪化・実行不能は非合格）、試験項目単位・原因単位比較、移行前後対比証明（3工程・4 CLI・4利用側）、単一正規更新の自動伝播、配布境界・投影・textlint（AG-004、AG-005、TS-001〜TS-008）。
- 証拠源: 入力 C:/Users/ogatay/work/hermes-vault/project-list/req-input-adf-simplification-c-delta-gate-lib.md、承認済み計画 C:/Users/ogatay/work/adf-simplification/53-implementation-plan.md、進捗 54、基線 55-baseline-test-record.md（コミット f786019 固定）、静的診断 47-stage4-file-review-common-skills-references-scripts.md（C001・C002）。Design 編集の組立検査証拠は assembly_evidence 5件。
- 重要変更の事前通知: 「共通基盤は作らない」規定の狭範囲緩和（機械処理の共有のみ、工程安全性と公開契約は維持、helper の受理集合差は未統一のまま再合意ゲートで管理、基線記録の名称不一致）をドラフト保存前に利用者へ通知済み。
