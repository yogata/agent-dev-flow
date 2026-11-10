---
draft_type: req_draft
topic_slug: adf-simplification-c-beta2-impl-contracts
status: draft
created_at: "2026-11-10T19:35+09:00"
source_rus: []
---

# 要件doc draft: 実装系契約是正7件（A-7〜A-13・C-β2）の要件定義

ADF全体簡素化調査（全2,079ファイル評価・第50報告）に基づく実装計画（第53報告 v8・2026-11-10 利用者承認）の C-β2「実装系契約是正 A-7〜A-13」を正規工程（要件改訂・Design 改訂・Case・PR・検査）で実施するための要件定義。前段の C-α1（PR #3986）・C-β（PR #3992・Issue #3988）は完了済みで、計画の定める受入条件（A-1〜A-6 の受入完了後に別 req-input で投入）が満たされたため本入力を投入した。

## 入力と区別

- 確定事実（証拠付き）: 入力ファイル `req-input-adf-simplification-c-beta2-impl-contracts.md`（外部パス C:/Users/ogatay/work/hermes-vault/project-list/。出所: 実装計画第53報告 v8・2026-11-10 利用者承認）。対象7項目の変更対象・内容・受け入れ条件は実装計画 §2 A群表の確定値。現行実装の実測（runner-local.ts L1205-1206 の最新Case推測解決、gh-command-detector.ts の明示メソッドのみ検出、stop-and-decision-resolution.md の「10分類」「9軸」混在と分類詳細参照先の dangling、case-auto Design の9分類表と L111 所有宣言、README-INSTALL.md L40 の -Target 誤指定、case-close Design の母集団導出規定に対する実装逸脱）。調査 revision 2b352f7d3c0fa980d669f2ab4af310c712c5d51e（保存時点の main は 3896e7156。対象 REQ/Design ファイルは不変を確認済み）
- 利用者の判断（確定）: A-8 の読戻し照合条件（base・head・body の3項目一致必須）と A-9 の見逃し増加禁止は本計画で固定した値であり変更しない。A-12 で新たな恒久台帳を設けない。配布物（src/ 配下）の本文に新規の REQ/DEC 識別子を書かない（IR-055・差分0件）。既存 ADF-COVERS コメント行は維持。A-13 は整合化のみで停止分類の新設・安全上必要な停止理由の削除は行わない
- 境界外（本 draft では扱わない）: E-1（参照整理）・B1〜B3（gate・lib 統合・規則集約）は別 req-input。F-2〜F-9（C-α2・req-define 稼働中）。RU-0271（並行稼働中の別 draft とは混在させない）

## 経過記録（STEP 証跡の 要約）

- STEP-3 既存REQ照合: Jev 先行評価実施（観測 20261110T100325Z-c9b2・final result 反映済み）。A-7/A-8 は REQ-011 APPEND、A-9〜A-13 は REQ操作なし（Jev は A-7 を UPDATE と判定。差異理由 semantic_disagreement: 対象識別規定は既存要件行に存在せず操作分類フロー上の新規要件行追加が正）。A-9 は REQ-011-021・Design「迂回防止」節、A-10 は REQ-029-012・Design 現行どおり、A-11 は REQ-009 既存行の枠内、A-12 は REQ-032-001/031〜038/046 と case-close Design「完了条件単位の最終評価と非循環証拠」節の規定どおり（実装逸脱が問題）、A-13 は REQ-034-022/038 が要件水準を規定（変更対象は Design・実行文書・停止報告）
- STEP-4/5: agentdev-architecture-advisory に A-13 正本所在・A-7 契約形状・A-9 境界設計・Decision 要否を照会し、4ラベル構造の助言を受理・分類採用（確定事項: A-13 正本は case-auto Design〔REQ-034-007 適用〕、A-7 は暗黙推測禁止を REQ 行に固定し機構は Design、A-9 は design-first、A-7/A-8/A-9/A-13 に新規 Decision 不要。A-10〜A-12 は親エージェントが同一根拠〔入出力形式・workflow 定義・既存 Design 適用範囲内・新機構なし〕で Decision 不要を補完確認）。助言の未確認事項（統合後の最終対応表の各セル値、GitHub 版対象識別の受理のみ扱い）は要件本文と分離し、Design 適用時の全件照合・例外宣言パターン（pr_merge commitHash と同一形式）で処理する
- STEP-6: 決定的組立・検査を assemble-draft-section.ts（version 0.2.0）で実施（5操作すべて dry-run 合格・証拠は assembly_evidence）。REQ-011 追加行は要件テーブル（2列構造 `| ID | 要件 |`、現行末尾 REQ-011-033）への追記として突合済み
- STEP-8 adversarial-review: 3論理役割・2系統の独立 stream で審議し、本質的争点 2件を受理反映。(1) REQ 行（A-7）の「作成対象の Case（Issue）」は GitHub 版の対象解決（head branch）と過剰に衝突するため「作成対象」へ一般化、(2) case-auto Design 停止伝播節の「user-decision-required は停止理由分類節の分類軸とは独立する」記述が正本テーブル統合と矛盾するため、同節の位置づけ更新を ACT-DESIGN-005 として追加。非本質的指摘（intro と既存 L310 の参照重複等）は簡約維持の判断で棄却

## 重要変更の事前通知の実施記録

- 第1次（2026-11-10T19:31+09:00）: ドラフト保存（write 実行）に先立つセッション出力として、REQ-011 への要件行2行追加、custom-tool-contracts Design 2節更新、case-auto Design 3箇所更新の事前通知（変更理由・変更内容・影響・確定事項と未確認事項の区別）を実施した

# draft-data

```yaml
work_type: feature

scale: large

summary: >-
  ADF全体簡素化実装計画（第53報告 v8・利用者承認済み）の C-β2 として、実装系契約是正7件
  （A-7〜A-13）を正規工程で実施する。REQ-011 へ pr_create の対象識別明示契約と読戻し照合
  3項目（base・head・body 一致必須）の2要件行を追加し、custom-tool-contracts Design に
  pr_create 契約・gh api 暗黙 POST を含む副作用分類境界を定める。case-auto Design の停止理由分類を
  分類・実行結果状態・利用者判断要否・再開入口の対応表を持つ単一正本に整理し、実行参照文書は
  簡約する。textlint guard の配布方針追随、README-INSTALL の導入先誤指定是正、case-close
  完了条件受け入れ判定の個別対応化は、既存 REQ・Design の規定どおりとする実装是正として
  realization_actions へ構造化する。配布物（src/ 配下）の本文に新規の REQ/DEC 識別子参照を
  追加しない（IR-055・差分0件）、A-8 の3項目一致必須と A-9 の見逃し増加禁止は固定値、
  A-12 の新たな恒久台帳は不設置、A-13 は整合化のみ（新設・削除なし）。
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []
agreed_items:
  - id: AG-001
    content: |-
      pr_create の対象明示契約（A-7）。agentdev_gh の Pull Request 作成（pr_create）は、作成対象を公開入力契約による明示的な対象識別で解決し、Local 実装が対象を「最新Case」の推測で解決する構造を採らない。対象識別を欠く要求は REQ-011-028 の一般則に従い副作用の発生前に入力契約違反として拒否される。対象識別の物理形式（公開入力への番号指定）と GitHub 実装・Local 実装の受理条件差（GitHub 実装は対象識別を受理するが PR 作成の対象解決には使用せず対象は head branch で特定する。pr_merge の commitHash と同一の Design 宣言例外形式）は custom-tool-contracts Design が定め、GitHub 版と Local 版の公開契約の同一性（REQ-011-024）を維持する。配布物内の全 pr_create 呼出元（case-open の設計PR 作成、case-auto の回復時 PR 代行等）は対象識別を渡すよう同一 Case 内で適合する。Case A 実行中に Case B が作られても A への PR 作成が誤対象にならないことを試験で証明する。
  - id: AG-002
    content: |-
      pr_create の読戻し照合 3項目（A-8）。PR 作成成功の読戻し照合（VERIFY）に base・head・body を含め、3項目とも作成時送信値と読戻し値の一致を必須とする（実装計画で固定した値であり変更しない）。各項目の不一致は成功確認を拒否し、検証不一致を伴う成功を返さない（REQ-011-023 の WRITE VERIFY 一般則の pr_create 適用）。誤対象・誤分支の PR が成功確認を通過しないことを試験で証明する。読戻しに必要な取得情報（runner-cli の取得項目、head の短縮形式と完全形式等の物理表現の正規化を含む）は Design が定める。
  - id: AG-003
    content: |-
      gh write 検出器の暗黙 POST 検出境界（A-9）。gh api の暗黙 POST（-f・-F・--raw-field・--input 等のフィールド系・入力系オプションによる、明示メソッド指定を欠く POST）を検出する境界を、副作用有無の分類範囲として先に Design（custom-tool-contracts「迂回防止」節）に定め、検出器（gh-command-detector.ts）はそれに従って修正する。明示的な GET 指定と併用するフィールド系オプション（クエリパラメータ化される読み取り）は許容対象とし、解析不能または曖昧な組合せは書込み側に分類して拒否する（検出器の over-block 許容・under-block 不許可の方針）。あわせて読み取り目的のコマンド（gh api 読み取り・gh pr view 等）への過剰拒否を見直す。対処による見逃しの増加は禁止条件とし、対象の書込み（暗黙 POST を含む）が拒否されることと許可対象の読取りが通過することの両方を試験で証明する。複合シェル構文の既存検出を退行させない。
  - id: AG-004
    content: |-
      textlint guard の配布方針追随（A-10）。配布方針変更（導入時生成・PR #3238・DEC-047）が未反映の試験と生成コード説明を現行方針へ追随し、試験・説明・README・Design の四方で配布方針（版固定情報の配布と導入時生成）が一致する。REQ-029-012 と textlint-quality-runtime Design は現行方針どおりであり変更しない。
  - id: AG-005
    content: |-
      公開導入手順の導入先是正（A-11）。README-INSTALL.md L29〜44 を初めとする公開導入手順について、アーカイブ一時展開先の .opencode を -Target に指定している導入先の誤指定を是正する。展開元（一時展開ディレクトリ）と製品リポジトリの導入先を分離し、初回導入・依存不足時の停止（終了コード 6）・依存生成後の再実行・製品リポジトリ側への最終配置・配置確認の各手順を整合させる。既存スクリプト（archive 版 install.ps1）のコピー動作は保持する。初回導入から最終配置までを一連の公開手順で実行し、各段階の結果が手順の記述どおりであることを確認する。
  - id: AG-006
    content: |-
      完了条件受け入れ判定の個別対応化（A-12）。close_mechanical_steps.ts（deriveAcceptancePopulation 等）・final-acceptance.ts の完了条件受け入れ判定が条件数のみで個別対応を持たない構造を是正し、正規の各完了条件と判定入力を、既存の条件本文・位置情報等を利用して個別に対応付ける。新たな恒久台帳は設けない。検証範囲には既存コミット再利用・途中再開・検証のみの経路（verify-only closure）を含め、いずれの経路でも最新の完了条件に対する判定の省略がないことを確認する。無関係な条件への判定・判定欠落・重複・古い条件への判定が誤って合格せず、正しい条件への判定が受理され、最終的な終了操作（issue_close の終了前提としての機械受理）まで拒否が有効であることを試験で証明する。REQ-032-001/031〜038/046 と case-close Design「完了条件単位の最終評価と非循環証拠」節の現行規定からの実装逸脱是正であり、REQ・Design は変更しない。
  - id: AG-007
    content: |-
      停止理由分類集合の整合化（A-13）。case-auto の停止理由分類の不一致（実行参照文書の10分類と Design の9分類、同一文書内の「10分類」「9軸」の共存、分類詳細の参照先 dangling、infra-transient・user-decision-required の別文脈での再使用）を是正する。停止条件・停止理由・原因分類・利用者判断の要否・実行結果状態を区別した上で、正規の分類を case-auto Design「停止理由分類」節の一箇所に定め、Workflow Skill の実行参照文書・停止報告・再開指示は分類値の列挙と名前レベル参照（配布物本文に REQ/Decision 識別子の新規参照を追加しない）へ簡約する。既存の停止分類全件（現行10分類の各々、infra-transient、user-decision-required の位置づけ）について、停止理由・実行結果状態・利用者判断の要否・再開入口の対応を一覧として照合し、同じ停止事象が実行文書・Design・停止報告・再開指示で矛盾なく解釈できることを証明する。停止分類の新設・安全上必要な停止理由の削除は行わない（整合化のみ）。所有関係は「値域・定義・対応は Design、検出・分類適用・報告手順は Workflow Skill」と分割する（REQ-034-007・DEC-010 適用）。
artifact_actions:
  - id: ACT-REQ-011-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-011.md
    source_items: [AG-001]
    content: |-
      新要件行（付与番号は保存時の採番規則に従う）: Pull Request 作成（pr_create）は、作成対象を公開入力契約による明示的な対象識別で解決すること。Local 実装が対象を最新Caseの推測で解決する構造を採らないこと。対象識別を欠く要求は REQ-011-028 の一般則に従い副作用の発生前に入力契約違反として拒否されること。対象識別の物理形式と GitHub 実装・Local 実装の受理条件差は Design が定め、公開契約の同一性（REQ-011-024）を維持すること
  - id: ACT-REQ-011-002
    artifact: req
    operation: append
    target: docs/requirements/REQ-011.md
    source_items: [AG-002]
    content: |-
      新要件行（付与番号は保存時の採番規則に従う）: Pull Request 作成（pr_create）の成功確認（VERIFY）は、作成時送信値と読戻し値の一致を base・head・body の3項目すべてについて必須とすること。各項目の不一致は成功確認を拒否し、検証不一致を伴う成功を返さないこと（REQ-011-023 の WRITE VERIFY 一般則の pr_create 適用）。照合に必要な取得情報の物理写像は Design が定めること
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: responsibilities
      slug: custom-tool-contracts
    target_area: 対象操作の境界（初期セット）
    source_items: [AG-001, AG-002]
    content: |-
      - pr_create の入力契約・対象識別契約: Pull Request 作成の公開入力契約は GitHub Draft PR を生成する入力（draft）を含まない。契約外の draft フィールドを含む要求は副作用発生前に REQ-011-028 の入力契約違反として拒否する（REQ-011-031）。Draft 状態は pr_read による観測対象であり、作成・更新操作での指定・変更の対象としない。作成対象の Case（Issue）は公開入力契約による明示的な対象識別（対象番号の指定）で解決する。Local 実装は対象を最新Caseの推測で解決せず、対象識別を欠く要求は副作用発生前に入力契約違反として拒否する。GitHub 実装は対象識別を受理するが PR 作成の対象解決には使用せず、対象は head branch で特定する（受理条件差は本 Design が宣言する例外であり、pr_merge の commitHash と同一の形式。両版の公開契約の同一性は維持する）
      - pr_create の読戻し照合: 成功確認（VERIFY）は作成時送信値と読戻し値の一致を base・head・body の3項目すべてで必須とし、各項目の不一致は成功確認を拒否する。読戻しに必要な取得情報（base・head・body の取得、head の短縮形式〔branch 名〕と完全形式〔owner:branch〕等の物理表現の正規化を含む）は runner 実装が取得し、比較は正規化後の論理値で行う
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: responsibilities
      slug: custom-tool-contracts
    target_area: 迂回防止
    source_items: [AG-003]
    content: |-
      読み取り系の許容: agentdev_gh の読み取り操作が operation-failed（安全ページ上限到達等）で継続不能になった場合の contingency として、読み取り専用 gh CLI の手動実行（gh issue list --search 等、読取形式に限定）を許容する。書込み系（作成・更新・クローズ・merge・comment）の直接実行は許容しない（gh api の読取り・書込みの区分は後述の「gh api の副作用分類境界」に従う）。この許容に基づき、配布 reference（agentdev-issue-management/references/issue-operation-safety.md、agentdev-workflow-case-open/references/definition-pr-and-idempotency.md）における読取系 gh 直記述は IR-053 の例外パス（IR053_EXEMPT_PATHS）として登録する（REQ-095-003 の contingency 原則に基づく）。

      gh api の副作用分類境界: 検出器（gh-write guard）の gh api に対する禁止範囲は次の分類に従う。(1) 明示的な書込みメソッド指定（--method / -X の POST・PATCH・PUT・DELETE）を含む gh api は書込みとして拒否する。(2) フィールド系・入力系オプション（-f / --field、-F、--raw-field、--input 等）を含み、かつ明示的な GET 指定を含まない gh api は暗黙 POST（gh CLI の既定動作）として書込みとして拒否する。(3) 明示的な GET 指定と併用するフィールド系オプション（クエリパラメータ化される読み取り）は読み取りとして許容する。(4) 判定要素の解析が不能または曖昧な組合せは書込み側に分類して拒否する（検出器の over-block 許容・under-block 不許容の方針）。境界の変更による見逃しの増加を許容せず、対象の書込み（暗黙 POST を含む）が拒否されることと許可対象の読取りが通過することの両方を検出器試験で証明する。検出器は本境界に従って実装し、検出器実装が境界を先行して決定しない。
  - id: ACT-DESIGN-003
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: commands
      slug: case-auto
    target_area: 停止理由分類（REQ-034-015/108 拡張）
    source_items: [AG-007]
    content: |-
      case-auto は停止時に停止理由を以下の分類で報告する。本節が停止理由分類の値域・定義・対応（実行結果状態、利用者判断の要否、再開入口）の単一正本であり、Workflow Skill（`agentdev-workflow-case-auto`）の実行参照文書・停止報告・再開指示は本節の分類値を列挙し本節を名前で参照する（配布物本文に REQ/Decision 識別子の新規参照を追加しない）。分類は再開コマンド選択とユーザー通知の精度向上が目的であり、HITL 境界の変更ではない。停止条件（11項目）の全量は REQ-034-015、原因別処理（8原因分類）は REQ-096-012、検出・分類適用・報告の手順は Workflow Skill が所有し、本節はこれらを複製しない。

      | 分類 | 定義 | 実行結果状態 | 利用者判断の要否 | 再開入口 |
      |---|---|---|---|---|
      | req-define 合意要件からの逸脱 | case-open または後続工程が合意済み要件、対象外、受け入れ条件を変更した場合、合意されていない機能要件または制約を追加した場合、合意済み OU を欠落・統合・分割して要件の意味を変更した場合 | blocked（要件再合意が必要） | 要 | req-define での再合意後に case-auto を再開（Root Case 指定） |
      | command 契約・実装不整合 | execution_unit へ分割可能であるにもかかわらず case-open が単一 Epic 子 Issue 上限により停止した場合、case-open または後続工程の実装が契約へ整合していない場合、構成生成事前検証（REQ-032-015）が実装されていない場合 | fail（実装・契約側の欠陥） | 原則不要（実装の修正） | 実装修正後に case-auto を再開 |
      | 要件未合意のスコープ拡大 | 合意されていないスコープが実行中に追加された場合 | blocked（要件再合意が必要） | 要 | req-define での再合意後に case-auto を再開 |
      | repo 外実体変更 | DB マイグレーション実行、デプロイ/apply、クラウドリソース操作、外部SaaS設定変更、課金、権限、認証情報変更が必要な場合 | blocked（repo 外操作の実行待ち） | 要（repo 外操作の実行判断） | 利用者による repo 外操作の実行・承認後に case-auto を再開 |
      | CI/test/lint 失敗 | コンフリクト解消モデル（v2:ADR-0132）の Level 2 まで試行しても自己修復不能な場合 | fail | 原則不要（実装・検証の修正） | 修正後に case-auto を再開 |
      | branch 削除検出 | 作成元不明 branch / user-owned branch / 他作業 branch の削除を検出した場合（停止条件(9)） | blocked（削除判断待ち） | 要（削除の判断） | 利用者の削除判断後に case-auto を再開 |
      | 未コミット変更の帰属不明 | 変更の由来が不明で安全に続行できない場合 | blocked（帰属確認待ち） | 要（帰属の確認） | 帰属確認後に case-auto を再開 |
      | 上位合意矛盾 | case-auto が受領した decision_context が現行正規成果物（REQ/Decision/Design/Issue）間の矛盾に起因する場合。当該矛盾そのものが finding の対象であり、case-auto が一方を勝手に採用できない（REQ-034-034、DEC-008 決定3） | blocked（矛盾解消待ち） | 要（矛盾の解消判断） | 矛盾解消（finding 経路を含む）後に case-auto を再開 |
      | 新規ユーザー判断事項 | case-auto が受領した decision_context が新しいユーザー価値判断、対象範囲変更、外部契約変更を必要とし、正規契約から導出できず case-auto に委譲された裁量（REQ-096-015）の範囲外である場合、すなわち人間に留保された判断（REQ-096-005）の新規確定を要する場合（REQ-034-034、DEC-008 決定4） | blocked（新規判断の確定待ち） | 要（人間に留保された判断の新規確定） | req-define での再合意後に case-auto を再開 |
      | 並列起動不能（実行環境由来） | 当該 stage の起動可能対象集合に対して背景起動が1件も成立しない場合。原因の断定を含まない。delegation-unavailable との弁別基準は「委譲起動不能時の扱い」節を参照（REQ-034-028、REQ-034-044、DEC-042）。停止報告には起動試行履歴（試行回数、起動成立数、最終成功起動時刻）を含める（REQ-034-045） | 停止（並列性の回復待ち） | 要（実行環境の回復運用） | 実行環境の回復後に durable state からの冪等再開（REQ-034-044） |
      | infra-transient（ツール基盤故障） | ツール基盤（harness・Custom Tool 実行環境）の故障に起因する停止種別。判定条件（単一ツール恒常失敗・プロセス生存・再試行無効・他経路正常の4条件同時成立）と回復経路は「infra-transient（ツール基盤故障）停止分類」節が所有する | 停止種別（Case 失敗 blocked / failed と区別して報告） | 要（harness 再起動等の回復運用） | harness 再起動後に durable state からの冪等再開 |
      | user-decision-required（adversarial-review 由来） | case-run result enum（completed-pr / blocked / failed / delegation-unavailable）の第5状態ではなく、既存結果に付随する停止理由分類である。adversarial-review 由来の decision_context は bounded parent decision resolution（REQ-034-032〜034、DEC-008）で自律解決できない場合に上位合意矛盾・新規ユーザー判断事項のいずれかに帰着して自走停止し、解決できる場合は当該下位の resume point から再開する | blocked（付随。decision_context への回答待ち） | 要（decision_context への回答） | 利用者回答後に当該 resume point から再開 |
  - id: ACT-DESIGN-004
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: commands
      slug: case-auto
    target_area: 所有関係と委譲
    source_items: [AG-007]
    content: |-
      - workflow 実装本体（orchestration stage モデル、Wave 反復制御、停止理由の検出・分類適用・報告手順、reference 構成）は Workflow Skill（`agentdev-workflow-case-auto`）が所有し、本 Design はこれらを複製しない。停止理由分類の値域・定義・対応（実行結果状態、利用者判断の要否、再開入口）は本 Design「停止理由分類」節が単一正本として所有する。各工程の output_contract（工程別契約表）も Workflow Skill が所有する。
  - id: ACT-DESIGN-005
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: commands
      slug: case-auto
    target_area: user-decision-required の位置づけ（REQ-014-012）
    source_items: [AG-007]
    content: |-
      user-decision-required は「停止理由分類（REQ-034-015/108 拡張）」節の分類一覧（adversarial-review 由来の行）に位置づけられ、本節はその停止伝播経路上の位置づけ（受領・親判断解決との順序、自走停止の条件）を定める。
conflict_resolutions:
  - id: CR-001
    conflict: A-13 の停止理由分類の正本所在。case-auto Design L111 は「停止理由分類は Workflow Skill が所有し本 Design は複製しない」と宣言する一方、REQ-034-007 は public contract（stop state を含む）の正規文書を Command Design とし、同一 Design 内に9分類の表が実在し、Workflow Skill 側は「10分類」「9軸」が混在し分類詳細の参照先が dangling である
    resolution: >-
      値域・定義・対応（実行結果状態・利用者判断要否・再開入口）は case-auto Design「停止理由分類」節を
      単一正本とし、検出・分類適用・報告手順は Workflow Skill が所有する分割を採用した
      （agentdev-architecture-advisory の確定事項を採用。REQ-034-007 と文書優先規則「文書間矛盾時は現行 REQ 優先」、
      DEC-010 の3層責務の適用。src/ 側は名前レベル参照のみで REQ/DEC 識別子の新規参照追加をしない IR-055 制約にも整合）。
  - id: CR-002
    conflict: A-7/A-8 の公開入力契約変更と A-13 の規範一元化を Decision（ADR）として記録すべきか
    resolution: >-
      Decision 不要。agentdev-decision-guidelines の禁止条件（入出力形式の変更、workflow 定義、既存文書種別への
      適合、統合・整理そのものを主題とする Decision の作成不可）に全項目が該当し、新規機構の導入を含まないため。
      architecture-advisory が A-7/A-8/A-9/A-13 の Decision 不要を確定し、A-10〜A-12 は親エージェントが同一根拠
      （実装追随・文書是正・既存規定からの実装逸脱是正で新機構なし）で補完確認した。
  - id: CR-003
    conflict: A-7 の操作分類に関する Jev との差異（Jev: UPDATE、最終判断: APPEND）
    resolution: >-
      APPEND を確定した。対象識別の規定は既存要件行（REQ-011-031 は draft 入力排除）に存在せず、操作分類フロー
      （既存REQの目的に対する追加・補強で既存行の規定だけでは要求が成立しない場合）において新規要件行の追加が正。
      差異理由 semantic_disagreement として観測（20261110T100325Z-c9b2）へ最終判断を反映済み。
  - id: CR-004
    conflict: 組立検査（assemble-draft-section.ts）の旧文残存検査が、既存行を先頭にそのまま保持する置換を拒否する
    resolution: >-
      ACT-DESIGN-001 は既存 pr_create 入力契約行を意味保存で再構成した（draft 排除・REQ-011-028/031 参照・
      Draft 状態の pr_read 観測対象という全要素を保持しつつ対象識別契約を統合）。ACT-DESIGN-002 は読み取り系許容段落に
      境界参照の橋渡し文を挿入した。双方とも組立検査5件すべて合格（dry-run）。
operation_units:
  - ou_id: OU-001
    target_req: REQ-011
    target_design: docs/designs/responsibilities/custom-tool-contracts.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
  - ou_id: OU-002
    target_req: REQ-011
    target_design: docs/designs/responsibilities/custom-tool-contracts.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
  - ou_id: OU-003
    target_req: REQ-034
    target_design: docs/designs/commands/case-auto.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
result: {}
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |-
      部品試験と誤対象シナリオ。Local 版で Case A 実行中に Case B を作成した状態（Case B が最新）で A への pr_create を対象識別付きで実行し、A が対象となることを確認する。対象識別欠落の要求が副作用発生前に入力契約違反として拒否されることを確認する。GitHub 版と Local 版の公開 Tool スキーマと実行時 validator の同一性を契約試験で確認する。配布物内の pr_create 呼出元（case-open 設計PR 作成、case-auto 回復時 PR 代行等）が対象識別を渡すことを結合試験で確認する。
    pass_criteria: |-
      Case B が最新のローカルIssueであっても A への PR 作成が誤対象にならない。対象識別欠落は副作用発生前に拒否される。GitHub 版と Local 版の公開契約（入力構造・失敗の意味）が同一に保たれる。既存 pr_create 試験に回帰なし。
    on_failure: |-
      fix-and-reverify。公開入力契約の中核変更のため実装を修正して再検証する。
  - id: TS-002
    target_item: AG-002
    verification: |-
      部品試験。pr_create 後の読戻し照合で base・head・body の3項目それぞれについて、作成時送信値と読戻し値が一致する場合に成功すること、および各項目を読戻し値が不一致になるよう変えた場合に成功確認が拒否されることを3項目分個別に証明する。head の短縮形式（branch 名）と完全形式（owner:branch）等の物理表現の正規化を含む。runner-cli の取得情報が3項目を含むことを確認する。
    pass_criteria: |-
      3項目すべての一致が必須であり、いずれか1項目の不一致で成功確認が拒否される（誤対象・誤分支の PR が成功確認を通過しない）。正規化後の論理値の比較で偽陽性・偽陰性がない。既存 pr_create・pr_read 試験に回帰なし。
    on_failure: |-
      fix-and-reverify。誤対象・誤分支の通過は安全境界の欠落のため実装を修正して再検証する。
  - id: TS-003
    target_item: AG-003
    verification: |-
      検出器の両方向部品試験。(a) 暗黙 POST（-f/-F/--raw-field/--input を含み明示 GET なし）が拒否される (b) 明示的な書込みメソッド指定（-X POST/PATCH/PUT/DELETE）が拒否される (c) 許可対象の読取り（フラグなし gh api、gh api -X GET -f …、gh pr view 等）が通過する (d) 複合シェル構文（&&、;、パイプ混在）の既存検出が退行しない (e) 曖昧な組合せが書込み側に分類される。既存検出の回帰テストを先に固定してから新パターンを追加したことを確認する。
    pass_criteria: |-
      対象の書込み（暗黙 POST を含む）がすべて拒否され、許可対象の読取りがすべて通過する。複合シェル構文の既存検出件数が検出器変更前後で減少しない（見逃し増加0件）。Design「迂回防止」節の分類境界（4分類）と検出器の判定が全試験ケースで一致する。
    on_failure: |-
      fix-and-reverify。見逃しの増加は禁止条件のため、境界定義と検出器のどちらが誤りかを特定して修正し再検証する。
  - id: TS-004
    target_item: AG-004
    verification: |-
      四方一致の照合。textlint guard の試験コード・生成コード説明・plugin README・textlint-quality-runtime Design の四文書について、配布方針（版固定情報の配布と導入時生成・PR #3238）の記述が一致することを文言と手順の突合で確認する。検索系検証の網羅範囲は修正対象（試験・説明・README）とし、Design は正本参照として検出対象外とする扱いを明示する。
    pass_criteria: |-
      四文書間で配布方釈の記述が一致する（依存実体を git 管理・配布経路に含めない、版固定情報の配布、導入時の bun install と build:engine による生成）。未反映の試験・説明が残らない。
    on_failure: |-
      fix-and-reverify。文書追随の不備は修正して再照合する。
  - id: TS-005
    target_item: AG-005
    verification: |-
      一連の公開手順の実行確認。release archive を用いて、初回導入→依存不足時の停止（終了コード 6）→依存生成（bun install・bun run build:engine）→installer 再実行→製品リポジトリ側への最終配置・配置確認までを一連の手順で実行し、各段階の結果が手順の記述どおりであることを確認する。展開元（一時展開ディレクトリ）と製品リポジトリ導入先の分離が手順全体で一貫していることを確認する。
    pass_criteria: |-
      各段階の結果（終了コード、配置先パス、配置確認）が手順の記述どおり。初回導入の -Target が製品リポジトリ側を指し、一時展開先を指さない。依存生成後の再実行で最終配置まで完了する。既存スクリプトのコピー動作が保持されている。
    on_failure: |-
      fix-and-reverify。手順と実挙動の不一致は手順文書またはスクリプト呼出方の誤りを特定して修正し、最初から一連実行で再検証する。
  - id: TS-006
    target_item: AG-006
    verification: |-
      判定個別対応の部品試験と経路試験。母集団導出（deriveAcceptancePopulation）が正規の各完了条件と判定入力を条件本文・位置情報で個別対応付けることを確認する。無関係な条件への判定・判定欠落・重複・古い条件（変更前の完了条件）への判定が誤って合格しないこと、正しい条件への判定が受理されることを、既存コミット再利用・途中再開・検証のみ（verify-only closure）の各経路で証明する。最終的な終了操作（issue_close の終了前提としての機械受理判定の消費）まで拒否が有効であることを確認する。
    pass_criteria: |-
      いずれの経路でも最新の完了条件に対する判定の省略がなく、新たな恒久台帳を設けずに個別対応が成立する。全必須条件の判定成立のみが終了操作を許可する。既存の close_mechanical_steps・final-acceptance 試験に回帰なし。
    on_failure: |-
      fix-and-reverify。判定欠落・誤対応は受け入れ安全境界の欠落のため実装を修正して全経路で再検証する。
  - id: TS-007
    target_item: AG-007
    verification: |-
      停止分類全件照合。既存の停止分類全件（現行10分類の各々、infra-transient、user-decision-required の位置づけ）について、停止理由・実行結果状態・利用者判断の要否・再開入口の対応を一覧として照合し、実行参照文書（Workflow Skill references・SKILL.md）・Design・停止報告様式・再開指示で同じ停止事象が矛盾なく解釈できることを確認する。簡約後の実行参照文書の分類値が Design 正本の分類一覧と一致すること、分類詳細の dangling 参照が解消されていることを確認する。配布物（src/ 配下）への REQ/DEC 識別子の新規参照追加の検査は TS-008 が担う。
    pass_criteria: |-
      10分類の各々と infra-transient・user-decision-required の対応が一覧で過不足なく照合され（安全上必要な停止理由の欠落0件）、四箇所（実行文書・Design・停止報告・再開指示）の記述が同一の停止事象に同一の解釈を与える。「10分類」「9軸」等の表記混在が解消する。
    on_failure: |-
      fix-and-reverify。分類の欠落・矛盾は Design 正本または簡約側のどちらかを修正して再照合する。
  - id: TS-008
    target_item: AG-001
    verification: |-
      全体完了条件の確認。A-7〜A-13 の受け入れ条件がすべて満たされていることを各 TS-001〜TS-007 の結果から確認する。試験基線（2026-11-10 C-β完了時の統合直前 HEAD 585a60708 での再試験・3分割正規形・合計5,598試験・既知不合格12件）に対し、今回の変更による新しい不合格が0件であることを3区分判定（必須検査合格／既知の不合格は残るが新しい不合格・悪化なし／合否確認不能は不合格扱い）で確認する。配布物（src/ 配下）に新規の REQ/DEC 識別子参照を追加していないことを runtime-unresolved-reference の baseline 差分0件で確認する（変更ファイル全体が網羅範囲であり修正対象列挙と一致。IR-055）。整合性検査（QG 相当）が合格することを確認する。
    pass_criteria: |-
      A-7〜A-13 の受け入れ条件すべて満たし、試験基線に対し新しい不合格0件・既知不合格の悪化なし、IR-055 差分0件、整合性検査合格。
    on_failure: |-
      fix-and-reverify。悪化の原因となった変更を特定して修正し、影響する TS-001〜TS-007 から再検証する。
realization_actions:
  - id: RA-001
    concern: pr_create 対象識別の実装（A-7）
    responsibility: agentdev_gh Tool engine の公開入力契約と Local 実装の責務
    ownership_hints:
      - src/common/tools/agentdev-gh/specs-pr.ts（公開入力契約への対象識別追加）
      - src/common/tools/agentdev-gh/local/runner-local.ts（最新Case推測解決の廃止・対象識別による解決）
      - src/common/tools/agentdev-gh/ 契約試験（GitHub 版・Local 版スキーマ同一性）
      - 配布物内 pr_create 呼出元（case-open 設計PR 作成、case-auto 回復時 PR 代行等）への対象識別渡し
    intent: >-
      公開入力への対象識別（番号指定）の追加、Local 実装の最新Case推測（runner-local.ts L1205-1206）の廃止と
      対象識別による解決、対象識別欠落の副作用発生前拒否、GitHub 版は受理するが対象解決に使用しない
      （pr_merge commitHash と同一の Design 宣言例外）。Design 境界は ACT-DESIGN-001 が定める。
    verification_refs: [TS-001]
    source_items: [AG-001]
  - id: RA-002
    concern: pr_create 読戻し照合 3項目の実装（A-8）
    responsibility: agentdev_gh Tool engine の読戻し照合と取得情報の責務
    ownership_hints:
      - src/common/tools/agentdev-gh/runner-cli.ts（base・head・body の取得と正規化）
      - 読戻し照合実装と契約試験
    intent: >-
      pr_create 成功確認の読戻し照合に base・head・body を含め、3項目とも作成時送信値との一致を必須とする。
      各項目の不一致は成功確認を拒否する。head の短縮形式・完全形式等の物理表現は正規化して比較する。
    verification_refs: [TS-002]
    source_items: [AG-002]
  - id: RA-003
    concern: gh write 検出器の暗黙 POST 検出の実装（A-9）
    responsibility: gh-write guard 検出器の実装責務
    ownership_hints:
      - src/common/guards/gh-write/gh-command-detector.ts
      - 検出器試験（既存検出の回帰テスト固定→暗黙 POST・読取り許容・曖昧block のパターン追加）
    intent: >-
      Design「迂回防止」節の副作用分類境界（ACT-DESIGN-002）に従って検出器を修正する。正規表現の追加だけでなく
      分類境界（明示メソッド・フィールド系/入力系オプション・明示 GET・曖昧時の block 側倒し）を実装し、
      既存の複合シェル構文検出を退行させない。Design が先に境界を定め、検出器が従う順序を維持する。
    verification_refs: [TS-003]
    source_items: [AG-003]
  - id: RA-004
    concern: textlint guard の配布方針追随（A-10）
    responsibility: textlint guard plugin の試験と生成コード説明の責務
    ownership_hints:
      - src/opencode/plugins/agentdev-textlint-guard/（試験・生成コード説明・README）
      - docs/designs/quality/textlint-quality-runtime.md（正本参照・変更なし）
    intent: >-
      配布方針変更（導入時生成・PR #3238）が未反映の試験と生成コード説明を現行方針へ追随し、
      試験・説明・README・Design の四方で配布方針が一致する。REQ-029-012・Design は変更しない。
    verification_refs: [TS-004]
    source_items: [AG-004]
  - id: RA-005
    concern: 公開導入手順の導入先是正（A-11）
    responsibility: 公開導入手順文書の責務
    ownership_hints:
      - README-INSTALL.md（L29〜44 ほか導入手順・依存生成手順・再実行手順）
      - scripts/consumer/archive/install.ps1（既存のコピー動作は保持）
    intent: >-
      アーカイブ一時展開先の .opencode を -Target に指定する誤りを是正し、展開元（一時展開ディレクトリ）と
      製品リポジトリの導入先を分離する。初回導入・依存不足停止（終了コード 6）・依存生成・再実行・
      最終配置・配置確認の各手順を整合させる。既存スクリプトのコピー動作は変更しない。
    verification_refs: [TS-005]
    source_items: [AG-005]
  - id: RA-006
    concern: 完了条件受け入れ判定の個別対応化（A-12）
    responsibility: case-close 機械工程 script の実装責務
    ownership_hints:
      - src/common/skills/agentdev-workflow-case-close/scripts/src/close_mechanical_steps.ts（deriveAcceptancePopulation 等）
      - src/common/skills/agentdev-workflow-case-close/scripts/src/final-acceptance.ts
      - 同 scripts/tests/（既存コミット再利用・途中再開・verify-only の経路試験）
    intent: >-
      条件数のみの受け入れ判定構造を是正し、正規の各完了条件と判定入力を既存の条件本文・位置情報等で
      個別に対応付ける。新たな恒久台帳は設けない。REQ-032-001/031〜038/046 と case-close Design
      「完了条件単位の最終評価と非循環証拠」節の現行規定に実装を追随させる（REQ・Design は変更しない）。
    verification_refs: [TS-006]
    source_items: [AG-006]
  - id: RA-007
    concern: 停止理由分類の実行参照文書簡約（A-13）
    responsibility: case-auto Workflow Skill の実行参照文書と停止報告様式の責務
    ownership_hints:
      - src/common/skills/agentdev-workflow-case-auto/references/stop-and-decision-resolution.md（分類表の値列挙と名前レベル参照への簡約、10分類/9軸表記の統一、分類詳細 dangling 参照の解消）
      - src/common/skills/agentdev-workflow-case-auto/SKILL.md（分類数表記の整合）
      - src/common/skills/agentdev-workflow-case-auto/references/conflict-resolution-and-reporting.md（停止報告様式の整合）
    intent: >-
      Design「停止理由分類」節（ACT-DESIGN-003 で正本化）を名前で参照し、分類値の列挙と簡約した記述へ置き換える。
      配布物本文に REQ/Decision 識別子の新規参照を追加しない（IR-055・差分0件）。安全上必要な停止理由の
      記述を欠落させない。
    verification_refs: [TS-007]
    source_items: [AG-007]
review_dispositions: []
assembly_evidence:
  - target_file: docs/designs/responsibilities/custom-tool-contracts.md
    target_content_sha256: 75a58d73bf500a492940bb5b6e79c9efe9e4e113f965a433227bc8631d054c86
    check_scope:
      heading: "## 対象操作の境界（初期セット）"
      start_line: 39
      end_line: 107
    execution_conditions:
      operation: replace
      edit_sha256: 57ae533729aa47aa57a72cef70f46ba81b1964c1307fd01789f6b4bf1b2d68a2
      expected_old_count: 1
    checker:
      name: assemble-draft-section
      version: 0.2.0
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: target section only
    checks_summary:
      pre:
        count: 3
        all_ok: true
      post:
        count: 3
        all_ok: true
    diff_compact:
      changed_lines_count: 2
      added: 2
      removed: 1
    executed_at: "2026-11-10T10:23:35.014Z"
  - target_file: docs/designs/responsibilities/custom-tool-contracts.md
    target_content_sha256: 75a58d73bf500a492940bb5b6e79c9efe9e4e113f965a433227bc8631d054c86
    check_scope:
      heading: "## 迂回防止"
      start_line: 113
      end_line: 126
    execution_conditions:
      operation: replace
      edit_sha256: 56db5bb0324d2a9d4d8a061aebd4a683274700c0565243d1e4cbade3fcea5383
      expected_old_count: 1
    checker:
      name: assemble-draft-section
      version: 0.2.0
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: target section only
    checks_summary:
      pre:
        count: 3
        all_ok: true
      post:
        count: 3
        all_ok: true
    diff_compact:
      changed_lines_count: 3
      added: 3
      removed: 1
    executed_at: "2026-11-10T10:23:43.752Z"
  - target_file: docs/designs/commands/case-auto.md
    target_content_sha256: a5c1a5b3cfd027443c41083613798fa969a81fd0ab5aff534875576427b62bd6
    check_scope:
      heading: "### 停止理由分類（REQ-034-015/108 拡張）"
      start_line: 285
      end_line: 311
    execution_conditions:
      operation: replace
      edit_sha256: 4ac1250019d23c8aad425b588ff08f61d44fe748c04d9af4acf81ac916ad2b0a
      expected_old_count: 1
    checker:
      name: assemble-draft-section
      version: 0.2.0
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: target section only
    checks_summary:
      pre:
        count: 3
        all_ok: true
      post:
        count: 3
        all_ok: true
    diff_compact:
      changed_lines_count: 16
      added: 16
      removed: 14
    executed_at: "2026-11-10T10:24:26.550Z"
  - target_file: docs/designs/commands/case-auto.md
    target_content_sha256: a5c1a5b3cfd027443c41083613798fa969a81fd0ab5aff534875576427b62bd6
    check_scope:
      heading: "## 所有関係と委譲"
      start_line: 108
      end_line: 115
    execution_conditions:
      operation: replace
      edit_sha256: 9f1632fd001e7ddd5cfdd6bb61beade5c1c900863c5ed6de7def14da610611e8
      expected_old_count: 1
    checker:
      name: assemble-draft-section
      version: 0.2.0
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: target section only
    checks_summary:
      pre:
        count: 3
        all_ok: true
      post:
        count: 3
        all_ok: true
    diff_compact:
      changed_lines_count: 1
      added: 1
      removed: 1
    executed_at: "2026-11-10T10:24:30.144Z"
  - target_file: docs/designs/commands/case-auto.md
    target_content_sha256: a5c1a5b3cfd027443c41083613798fa969a81fd0ab5aff534875576427b62bd6
    check_scope:
      heading: "### user-decision-required の位置づけ（REQ-014-012）"
      start_line: 526
      end_line: 539
    execution_conditions:
      operation: replace
      edit_sha256: 38118f891e87a4cef74e5ee491b15978978d616e3e099ecef51d031d94f8fa2a
      expected_old_count: 1
    checker:
      name: assemble-draft-section
      version: 0.2.0
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: target section only
    checks_summary:
      pre:
        count: 3
        all_ok: true
      post:
        count: 3
        all_ok: true
    diff_compact:
      changed_lines_count: 1
      added: 1
      removed: 1
    executed_at: "2026-11-10T10:27:03.531Z"
case_open_hints:
  epic_needed: true
  decomposition: >-
    A-7/A-8 は同一実行単位（specs-pr.ts・両 runner・呼出元適合・OU-001 の REQ/Design 適用と同じ Case）での実施を
    推奨。A-9 は Design 適用（OU-002）→検出器修正（RA-003）の順。A-13 は Design 適用（OU-003）→実行参照文書簡約
    （RA-007）の順。A-10（RA-004）・A-11（RA-005）・A-12（RA-006）は REQ/Design 操作を伴わないため
    realization_actions から execution contract を構成する。E-1・B1〜B3・F-2〜F-9 は対象外（別 req-input）。
  wave_hints:
    - A-7 と A-8 は同一ファイル群（specs-pr.ts・runner 系）を変更するため直列化を推奨
    - A-9（guards）・A-10（textlint plugin）・A-11（README-INSTALL）・A-12（case-close scripts）・A-13（case-auto skill/docs）は技術的に独立しており並列実行可能
```

## summary

- 出所: ADF全体簡素化実装計画（第53報告 v8・2026-11-10 利用者承認）§2 A群表の A-7〜A-13（確定値）。前段 C-α1・C-β 完了済み
- 操作分類: A-7/A-8 は REQ-011 への APPEND（2要件行）+ custom-tool-contracts Design 更新。A-9 は Design「迂回防止」節更新 + 検出器実装。A-10〜A-12 は既存 REQ/Design の規定どおりとする実装是正（realization のみ）。A-13 は case-auto Design 正本化 + 実行参照文書簡約
- 固定制約: 配布物本文への新規 REQ/DEC 識別子参照追加なし（IR-055・差分0件）、A-8 の3項目一致必須、A-9 の見逃し増加禁止、A-12 の恒久台帳不設置、A-13 は整合化のみ
- 試験基線: 2026-11-10 C-β完了時（統合直前 HEAD 585a60708・3分割正規形・5,598試験・既知不合格12件）。新しい不合格 0件を完了条件に含む
