---
draft_type: req_draft
topic_slug: adf-v5-completion-enforcement
status: draft
created_at: 2026-10-09T22:43:31+09:00
source_rus: [RU-0195]
---

<!-- req-define STEP-2 進行中の working draft（durable state）。
     本ファイルの正は # draft-data YAML ブロック。未解決質問は auto_gate.unresolved_questions が正であり、
     会話履歴を権威情報源としない。STEP-3〜9 の進行に伴い冪等上書きされる。 -->

# draft-data

```yaml
# work_type: 要件の分類（bugfix / feature / maintenance / docs_chore）
work_type: feature

# scale: standard / large（STEP-7 で確定。現時点は暫定値）
scale: large

# summary: 当該 draft が何を合意したかの1段落要約（人間可読補助。処理の正ではない）
summary: |
  v5.0.0 タグ（025b2547）時点で定義と Design 確定までが完了し実装・実行時検証・完遂判定が未達の v5 要件について、
  合意済み「ADF v5 機能完遂条件（G0〜G10）」を正規要件として確立する。完遂条件体系の正規所有（新規REQ・DEC-057・
  完遂判定Design）、REQ-104〜109 への領域別実行時実証義務の追加、単一の正規完遂経路（case-close QG-4）への集約と
  迂回の機械的拒否、48条件台帳・反例検証・独立検証・保証の限界の記録、タグ・版運用、移行の非破壊照合、
  既知債務（crosswalk planned/defer・Design draft 処置）の解消、および RU-0195 の generation_actor 契約差異の解決
  （REQ-008-051 列挙化）を含む。合意内容の正投影は RU-0195 の決定的受け入れ条件8項目である（CR-001）。

# auto_gate: case-auto 自走可否の判定材料
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

# agreed_items: 合意された個別項目。RU-0195 の合意成立時刻（2026-10-09T22:31:00+09:00）以降の確定内容を逐次反映
agreed_items:
  - id: AG-001
    content: |
      完遂条件 G0〜G10 を正規要件・Design として保存し、48受け入れ条件と52要件行（REQ-104〜109 の全行）の各項目に
      pass / fail / blocked / not applicable と証拠を対応付ける。既存48条件監査の「実装済み11件」の再検証を含む
      （RU-0195 決定的受け入れ条件1）。
  - id: AG-002
    content: |
      4領域（工程・成果物／差分・影響・追跡／実行・改善循環／移行）の振る舞いを実行時に実証する。G4 の反例
      （採用成果物の欠落、根拠のない設計宣言、版不明、空の対応関係、中間版依拠、古い証拠、追跡先欠落、
      Issueなし経路の誤ったIssue強制、未充足依存、権限不足、移行情報欠落、参照不整合、中断、再実行）が
      期待どおり拒否・留保・回復を識別する（RU-0195 決定的受け入れ条件2）。
  - id: AG-003
    content: |
      検証器自身の偽陽性を隔離環境の反例投入で確認する。偽陽性がある場合は検証器側を fail として扱った記録を残す
      （RU-0195 決定的受け入れ条件3）。
  - id: AG-004
    content: |
      実装担当と区別された検証担当による独立検証を元データ（REQ・Design・証跡実体）から実施し、合格報告の再掲でない
      証拠が存在すること（RU-0195 決定的受け入れ条件4）。要件行は実装担当と検証担当の分離・元データからの再評価・
      再掲でない証拠の保存を判定可能な義務として固定し、具体的な委譲形態（別セッションの検証専用委譲等）は
      Design（v5-completion-judgment）が確定する（CR-003）。
  - id: AG-005
    content: |
      最終受入判定を正規完遂経路（case-close QG-4 最終完了判定を所有する経路）に実装する。実行担当が迂回して
      完遂状態へ変更できる経路が残らないことを反証検査で確認する（RU-0195 決定的受け入れ条件5）。
      作業規律・口頭合意のみで代用しない機械的拒否構造を優先する（RU-0195 要件化の方向）。
  - id: AG-006
    content: |
      既存 v5.0.0 タグの指すコミット（025b2547）を変更しない。完成が判定されたコミットを別途識別し、
      新しい版として付与する（RU-0195 決定的受け入れ条件6、対象外の確認）。
  - id: AG-007
    content: |
      移行（ADF自身と合意済み対象プロジェクト）が非破壊で前後照合され、未処理 Intake・Learning・Backlog の
      処理継続性が実証されていること（RU-0195 決定的受け入れ条件7。DEC-056・REQ-109 系の実行時実証）。
  - id: AG-008
    content: |
      完遂宣言は「規定した対象・前提・証拠の範囲で完遂」と保証の限界とともに記録され、「絶対保証」を宣言しない
      （RU-0195 決定的受け入れ条件8。保証の限界の明記自体が要件の一部）。
  - id: AG-009
    content: |
      対象外: v5.0.0 タグの意味変更・付け替え（タグは 025b2547 の固定点）、無条件・絶対的な動作保証の宣言、
      正規契約・リポジトリと無関係な歴史記録の一括クローズ、本RU単体での完遂（実装・検証は case-auto の各工程が担う）
      （RU-0195 対象外）。
  - id: AG-010
    content: |
      既知債務を正規の変更経路で解消する: v4-v5-crosswalk の planned/defer 6エントリ（defer 4 / keep 1 / keep・defer 1、
      全エントリ planned 状態）の処遇実行（対象 v4 要件行 REQ-005-001/010/011、REQ-030-001、REQ-035-006、
      REQ-061-007/010/013 の再定義を含む）、Design draft 2件（v5-adopted-conventions.md、v4-v5-crosswalk.md）の
      昇格判断。REQ-088-006 は DEC-053 により v5.0.0 タグ時点で再定義済みであり本案の解消操作対象から除外する
      （充足済みのため。review_dispositions RD-001〔disposition: covered〕に記録）。
  - id: AG-011
    content: |
      RU-0195 の frontmatter 契約差異（generation_actor: supervisor と現行契約固定値 req-define-parent）を本案の最初の
      保存操作として解決する: REQ-008-051 の generation_actor 列挙化（req-define-parent / supervisor）と
      artifact-contracts.md「RU アーティファクト契約」節の更新。二段階承認は値にかかわらず等しく適用する。
      配置許可を契約改訂の承認とは扱わず、解決記録（CR-002）を承認の記録とする（RU-0195 本文の指示どおり
      後工程開始前に解決。解決経路の判断記録は CR-005）。

# artifact_actions: REQ/Decision/Design への保存対象（1 action = 1 artifact × 1 editing concern）
# 既存ファイルの旧文言は機械的取得（grep/read 実測）に基づく。REQ 表構造（| ID | 要件 | 2列）・見出し構造は実ファイルと突合済み
# 新規REQ番号は case 側の決定的採番スクリプト（alloc-req-number.ts）で確定（現行最大 REQ-109・既知欠番は未満のため REQ-110 が期待値）
# 新規DEC番号は case 側で確定（現行最大 DEC-056 のため DEC-057 が期待値）
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: create
    target: new:adf-v5-completion-enforcement
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007, AG-008, AG-009, AG-010]
    content: |
      ---
      id: REQ-110
      title: "ADF v5 完遂判定の強制（単一の正規完遂経路と迂回の機械的拒否）"
      created: "2026-10-09"
      updated: "2026-10-09"
      ---

      ## 目的

      合意済みの「ADF v5 機能完遂条件（G0〜G10）」を正規要件として所有し、48受け入れ条件・52要件行への実行時実証・
      反例による拒否検証・独立検証・最終受入判定を経ない完遂宣言を拒否する境界を、正規の変更経路で実装・検証する。
      完遂条件体系は既存の原則（REQ-105-007 の別判定、REQ-107-006 と REQ-107-007 の最終受入検証義務、REQ-108-009 の
      根拠なき完了宣言禁止、DEC-055 の完了＝権限と証拠）を再定義せず、それらの v5 完遂への具体化として所有する。

      ## 要件

      | ID | 要件 |
      |---|---|
      | REQ-110-001 | 完遂条件体系（G0〜G10、4領域構成: 工程・成果物／差分・影響・追跡／実行・改善循環／移行）を REQ・Design として正規所有し、48受け入れ条件と REQ-104〜109 の全義務行（本 Case による追加行を含む）の各項目に pass / fail / blocked / not applicable の判定と証拠を対応付けること。判定と証拠の基準は採用済み規約（未宣言時は移行期デフォルト）から解決すること |
      | REQ-110-002 | 4領域の振る舞いを実行時に実証し、G4 の反例群（Design が保存する反例カタログ）の投入に対して期待どおり拒否・留保・回復を識別できること。反例投入は隔離環境で実行し、正規状態を破壊しないこと |
      | REQ-110-003 | 完遂判定に用いる検証器は自身の偽陽性を隔離環境の反例投入で確認すること。偽陽性が存在する場合は検証器側を fail として扱い、その記録を残すこと |
      | REQ-110-004 | 実装担当と区別された検証担当による独立検証を元データ（REQ・Design・証跡実体）から実施し、実装側の合格報告の再掲でない証拠を保存すること。検証担当の具体的な委譲形態は Design が確定すること |
      | REQ-110-005 | 最終受入判定を case-close QG-4 最終完了判定を中心とする単一の正規完遂経路に実装し、当該経路を経由せずに完遂状態へ変更できる経路が存在しないことを反証検査で確認すること。作業規律・口頭合意のみによる代用を行わないこと |
      | REQ-110-006 | 完遂宣言は「規定した対象・前提・証拠の範囲で完遂」という保証の限界とともに記録し、無条件・絶対的な動作保証を宣言しないこと |
      | REQ-110-007 | 既存 v5.0.0 タグの指すコミット（025b2547）を変更せず、完遂が判定されたコミットを別途識別し新しい版として付与すること |
      | REQ-110-008 | 移行（ADF自身と合意済み対象プロジェクト）を非破壊で実施し前後照合を行うこと。未処理 Intake・Learning・Backlog 情報の内容・処理状態・参照関係を失わず、処理継続性を実証すること |
      | REQ-110-009 | 既知債務（v4-v5-crosswalk の planned/defer 6エントリ、Design draft 2件の処置）を正規の変更経路で解消し、処遇を crosswalk の living tracking に記録すること |
      | REQ-110-010 | 完遂条件体系は既存要件行（REQ-105-007、REQ-107-006、REQ-107-007、REQ-108-009、REQ-109-005 等）が所有する原則を再定義せず、当該原則の v5 完遂への具体化として位置づけること。工程の独立確定・終了（REQ-108-002、REQ-108-003）と完遂宣言（最終受入）を別判定として維持すること |

      ## 適用範囲

      - **対象**: 完遂条件体系の正規所有、実行時実証と反例検証、検証器偽陽性確認、独立検証、最終受入判定の単一経路化と迂回の機械的拒否、保証の限界の記録、タグ・版運用、移行の非破壊照合、既知債務の解消
      - **対象外**: v5.0.0 タグの意味変更・付け替え、無条件・絶対的な動作保証の宣言、正規契約・リポジトリと無関係な歴史記録の一括クローズ、完遂条件体系が既存原則を置換する構成
  - id: ACT-REQ-002
    artifact: req
    operation: append
    target: docs/requirements/REQ-104.md
    target_area: "## 要件"
    source_items: [AG-001, AG-002]
    content: |
      | REQ-104-008 | 採用済み工程と必須成果物の参照・解決（REQ-104-003、REQ-104-004）および工程の分割・統合・省略での受け入れ条件・検証義務の非喪失（REQ-104-005）は、ADF v5 完遂条件（REQ-110）の実行時実証に含め、反例投入（採用成果物の欠落、未採用参照例の誤欠落判定を含む）で拒否・留保の識別を確認すること。本 REQ の全義務行は完遂条件台帳の判定（pass / fail / blocked / not applicable）と証拠に対応付けること |
  - id: ACT-REQ-003
    artifact: req
    operation: append
    target: docs/requirements/REQ-105.md
    target_area: "## 要件"
    source_items: [AG-001, AG-002]
    content: |
      | REQ-105-009 | 成果物の意味と工程別正式確定の義務（正式確定と最終的な要求充足の別判定を含む）は、ADF v5 完遂条件（REQ-110）の実行時実証に含め、反例投入（根拠のない設計宣言、正式確定をもって要求充足済みとする誤判定を含む）で拒否の識別を確認すること。本 REQ の全義務行は完遂条件台帳の判定（pass / fail / blocked / not applicable）と証拠に対応付けること |
  - id: ACT-REQ-004
    artifact: req
    operation: append
    target: docs/requirements/REQ-106.md
    target_area: "## 要件"
    source_items: [AG-001, AG-002]
    content: |
      | REQ-106-010 | 差分・変更影響と増分更新の義務（根拠なき完了判定禁止を含む）は、ADF v5 完遂条件（REQ-110）の実行時実証に含め、反例投入（版不明、中間版依拠、古い証拠、空の対応関係）で拒否・留保の識別を確認すること。本 REQ の全義務行は完遂条件台帳の判定（pass / fail / blocked / not applicable）と証拠に対応付けること |
  - id: ACT-REQ-005
    artifact: req
    operation: append
    target: docs/requirements/REQ-107.md
    target_area: "## 要件"
    source_items: [AG-001, AG-002]
    content: |
      | REQ-107-009 | 工程間追跡と品質検証の責務分離の義務（受け入れ条件の検証義務の保護と最終受入の独立評価を含む）は、ADF v5 完遂条件（REQ-110）の実行時実証に含め、反例投入（追跡先欠落、参照不整合、Issueなし経路の誤ったIssue強制）で拒否の識別を確認すること。本 REQ の全義務行は完遂条件台帳の判定（pass / fail / blocked / not applicable）と証拠に対応付けること |
  - id: ACT-REQ-006
    artifact: req
    operation: append
    target: docs/requirements/REQ-108.md
    target_area: "## 要件"
    source_items: [AG-001, AG-002]
    content: |
      | REQ-108-013 | 有限実行とワークフロー責務再編の義務（根拠不十分な完了宣言禁止を含む）は、ADF v5 完遂条件（REQ-110）の実行時実証に含め、反例投入（未充足依存、権限不足、中断、再実行）で留保・回復の識別を確認すること。本 REQ の全義務行は完遂条件台帳の判定（pass / fail / blocked / not applicable）と証拠に対応付けること |
  - id: ACT-REQ-007
    artifact: req
    operation: append
    target: docs/requirements/REQ-109.md
    target_area: "## 要件"
    source_items: [AG-001, AG-002, AG-007]
    content: |
      | REQ-109-009 | 移行と互換性の境界の義務（検証不足での移行成功宣言禁止を含む）は、ADF v5 完遂条件（REQ-110）の実行時実証に含め、移行の非破壊前後照合と反例投入（移行情報欠落、未処理情報の黙認）で拒否の識別を確認すること。本 REQ の全義務行は完遂条件台帳の判定（pass / fail / blocked / not applicable）と証拠に対応付けること |
  - id: ACT-REQ-008
    artifact: req
    operation: update
    target: docs/requirements/REQ-008.md
    target_area: "## 要件"
    source_items: [AG-011]
    content: |
      対象行: REQ-008-051（1行置換）

      旧文言:
      | REQ-008-051 | session由来RU（source_type: chat, generated_by: session）の frontmatter は、生成主体（generation_actor: req-define-parent）、合意成立時刻（agreement_confirmed_at）、生成ステージ（generation_stage: pre-req-define）、論理キー（logical_key）の4フィールドを必須とすること |

      新文言:
      | REQ-008-051 | session由来RU（source_type: chat, generated_by: session）の frontmatter は、生成主体（generation_actor: req-define-parent または supervisor のいずれか）、合意成立時刻（agreement_confirmed_at）、生成ステージ（generation_stage: pre-req-define）、論理キー（logical_key）の4フィールドを必須とすること。二段階承認の手続きは generation_actor の値にかかわらず等しく適用すること |
  - id: ACT-REQ-009
    artifact: req
    operation: update
    target: docs/requirements/REQ-005.md
    target_area: "## 要件"
    source_items: [AG-010]
    content: |
      対象行: REQ-005-001、REQ-005-010、REQ-005-011（3行置換。v4-v5-crosswalk 棚卸し記録に基づく処遇実行）

      REQ-005-001 新文言:
      | REQ-005-001 | ワークフローは壁打ち、構造的実行、レビュー完了の3つのマクロフェーズで構成すること。各フェーズと v5 責務分割語彙（要件確定、設計確定、実装・構築、検証、Issue 協調、後処理）との対応は採用規約が定めること。構造的実行フェーズの工程（case-open、case-ready、case-run、case-close、例外経路の case-revise）は内部 lifecycle として case-auto が駆動すること。現在工程を Issue に保存せず、進行は Root Case の正規状態と Epic の実行構成で表現すること |

      REQ-005-010 新文言:
      | REQ-005-010 | 全公開 command は要求入口、標準実行コマンド、補助フロー、検出フロー、repo-local 検査のいずれかに分類すること。要求入口は req-define（requirements-driven）と backlog-auto（backlog-driven）の2つとし、両経路とも実行は case-auto へ合流すること。v5 実行モデルでは各工程（要件確定、設計確定）の独立実行・独立終了が可能であること（REQ-108-002、REQ-108-003）。case-open、case-ready、case-run、case-close、case-revise は公開 command ではなく内部 lifecycle 段階とし、内部状態遷移の手動順次実行を公開 UX の標準としないこと |

      REQ-005-011 新文言:
      | REQ-005-011 | case-auto は標準実行コマンドとして標準経路（req-define → case-auto）を構成すること。標準経路を置換する別の公開実行経路を新設しないこと。各工程の独立実行・独立終了が可能な場合も、公開実行経路は本行の統合に従うこと |
  - id: ACT-REQ-010
    artifact: req
    operation: update
    target: docs/requirements/REQ-030.md
    target_area: "## 要件"
    source_items: [AG-010]
    content: |
      対象行: REQ-030-001（1行置換。v4-v5-crosswalk 棚卸し記録に基づく処遇実行）

      新文言:
      | REQ-030-001 | 価値ある有限作業を Case として実行する場合、case-open は合意済み要件doc を入力とし Root Case を GitHub Issue として確立し、対象要件（REQ 番号または Issue 内の合意済み要件）を Root Case 本文の対象範囲へ記載すること。Issue の生成を全作業に一律必須とせず、v5 実行モデルでは価値ある有限作業の必要時利用として扱うこと（REQ-108-003、REQ-108-004） |
  - id: ACT-REQ-011
    artifact: req
    operation: update
    target: docs/requirements/REQ-035.md
    target_area: "## 要件"
    source_items: [AG-010]
    content: |
      対象行: REQ-035-006（1行置換。v4-v5-crosswalk 棚卸し記録〔keep・語彙統合〕に基づく処遇実行）

      新文言:
      | REQ-035-006 | execution_unit は standard issue または epic issue とし Wave は execution_unit に含めないこと（Wave は Epic 内の子 Issue 間の意味的依存関係と並列実行可能性を表す依存のまとまりであり、Epic Issue 本文から読み取る内部構造である。並列実行上限は Wave 構成から独立した実行制御である） |
  - id: ACT-REQ-012
    artifact: req
    operation: update
    target: docs/requirements/REQ-061.md
    target_area: "## 要件"
    source_items: [AG-010]
    content: |
      対象行: REQ-061-007、REQ-061-013（2行置換。v4-v5-crosswalk 棚卸し記録〔keep・defer〕に基づく処遇実行。
      REQ-061-010 は意味処遇 keep・文言変更なしのため置換対象外とし crosswalk 記録のみに保持する）

      REQ-061-007 新文言:
      | REQ-061-007 | case-ready は canonical Definition 確定後に Standard / Epic を確定すること。Epic の場合は Child Issue を作成し Root Case の実行構成（子 Issue、Wave、意味的依存、子状態を含む一つの表）を確定すること。実行構成の確定は case-auto 経路の実行構造であり、全作業への Issue・Epic 生成を一律必須としないこと（REQ-108-003、REQ-108-004） |

      REQ-061-013 新文言:
      | REQ-061-013 | case-ready は Epic 実行構成の表に各子 Issue の Wave 所属と前提（意味的依存）を明記すること。Wave を構成しない実行構造では前提関係を同等の形式で記録すること |
  - id: ACT-DEC-001
    artifact: decision
    operation: create
    target: new:adf-v5-completion-enforcement
    source_items: [AG-005, AG-001]
    content: |
      ---
      id: DEC-057
      title: "ADF v5 完遂判定の強制（単一の正規完遂経路への集約と迂回経路の機械的拒否）"
      status: accepted
      created: "2026-10-09"
      updated: "2026-10-09"
      related_reqs: [REQ-110, REQ-032, REQ-104, REQ-105, REQ-106, REQ-107, REQ-108, REQ-109]
      relations:
        - type: relates-to
          target: DEC-055
          note: 完了は権限と証拠によって確定する原則を前提とし、単一経路集約と迂回拒否の構造要求を追加所有する
        - type: relates-to
          target: DEC-053
          note: 正式確定と最終的な要求充足の別判定原則を前提とし、最終的な要求充足側の完遂条件体系を具体化する
      ---

      ## Context

      v5.0.0 タグ時点（025b2547）で v5 要件（REQ-104〜109）の定義と Design 確定までが完了し、実装・実行時検証・完遂判定は
      未達であった（RU-0195）。48受け入れ条件・52要件行への実行時実証・反例検証・独立検証・最終受入判定を経ない完遂宣言を
      作業規律・口頭合意のみで拒否する運用は、迂回経路の残存によって恒常的に無効化され得る。既存 Decision 群は
      「完了は何によって確定するか」（DEC-055）と「正式確定と最終充足の別判定」（DEC-053）を所有するが、
      「完遂宣言の単一経路集約」と「迂回経路の機械的拒否」を所有していない。

      ## 決定

      1. 完遂宣言（最終的な要求充足の確定）は case-close QG-4 最終完了判定を中心とする単一の正規完遂経路に集約し、
         当該経路を経由しない完遂状態への遷移を正規経路として認めない
      2. 迂回経路（最終受入判定を経由せず完遂状態へ変更する経路）は機械的拒否構造（検証器、guard、完遂状態遷移の単点化）で
         拒否し、反証検査によって迂回経路が0件であることを確認する。作業規律・口頭合意のみによる代用を行わない
      3. 完遂条件体系（G0〜G10、4領域構成）と条件ごとの評価（pass / fail / blocked / not applicable + 証拠）は、
         既存の原則（DEC-053 の別判定、DEC-055 の完了＝権限と証拠、REQ-107-007 の最終受入独立評価）の具体化として確立し、
         本 Decision は当該原則を再決定しない
      4. 工程の独立確定・終了（REQ-108-002、REQ-108-003）と完遂宣言（最終受入）は別判定（DEC-053）であり、
         単一経路の要求は完遂宣言に限定され、各工程の独立終了を否定しない
      5. 機械的拒否構造の実装手段（検証器・guard・ハーネスの具体）は本 Decision が確定せず、品質ドメインの完遂判定 Design と
         実現面の変更方針（realization_actions）に委譲する

      ## 結果、影響

      - 最終的な要求充足の判定所有は case-close QG-4（REQ-021-025、REQ-032）が維持し、新たな Gate（QG-5 等）を追加しない。
        完遂条件は QG-4 の Verification Obligation の拡張として扱う（v4-quality-gate-model Design の QG 群所有規定に従う）
      - トレーサビリティ機構に恒久的な意味品質検証ゲートを追加しない（DEC-054 維持）。機械的拒否構造は case-close・品質検証系が所有する
      - 完遂条件の証拠は QG-4 の既存証拠チャネルと Case の検証記録で保持し、恒久台帳を新設しない（REQ-103-017）。
        48条件の判定・証拠対応は Report（docs/reports/）の監査記録として保存する
      - 旧タグ（v5.0.0 → 025b2547）は固定点として維持し、完遂時の完成コミットに新しい版を付与する

      ## 承認記録

      - 本 Decision は RU-0195（ADF v5 機能完遂条件）由来の要件doc（req-draft-adf-v5-completion-enforcement）の Definition 保存として確定し、照合情報（Root Case、設計PR）は case-close の品質検査が記録する
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/responsibilities/artifact-contracts.md
    target_area: "### 生成主体と生成時点"
    source_items: [AG-011]
    content: |
      ### 生成主体と生成時点

      - 生成主体: `req-define` 親エージェントまたは Supervisor（Hermes 監督セッション）。`generation_actor` に `req-define-parent` / `supervisor` のいずれかを記録する
      - 生成時点: チャット内合意成立後、req-define 開始前（`generation_stage: pre-req-define`）
      - `agreement_confirmed_at` と `generated_at` は ISO 8601 形式とし、`generated_at >= agreement_confirmed_at` を満たすこと
      - 保存完了前に req-define を開始しないこと
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target: docs/designs/responsibilities/artifact-contracts.md
    target_area: "### frontmatter 必須フィールド"
    source_items: [AG-011]
    content: |
      ### frontmatter 必須フィールド

      session由来RU の frontmatter は次を必須とする。

      | field | 値 |
      |---|---|
      | `source_type` | `chat` |
      | `generated_by` | `session` |
      | `generation_actor` | `req-define-parent` / `supervisor` のいずれか（RU 起案主体の記録。`req-define` 親エージェントと、合意成立後の session 内で Supervisor が起案する経路の双方を正規とする。二段階承認は値にかかわらず等しく適用する） |
      | `agreement_confirmed_at` | ISO 8601 形式の合意成立時刻 |
      | `generation_stage` | `pre-req-define` |
      | `generated_at` | ISO 8601 形式の生成時刻（`>= agreement_confirmed_at`） |
      | `logical_key` | RU を一意に特定する論理キー |
      | `tentative_classification` | 既存7値のいずれか（欠落時は生成停止） |
      | `agentdev_handoff` | 配布物改善の場合 `true` |
      | `depends_on` | 依存先 RU-ID のリスト（保存後） |
      | `sources` | `type: chat`、`path: session:...` 形式 |
      | `status` | `draft` |
  - id: ACT-DESIGN-003
    artifact: design
    operation: create
    target: docs/designs/quality/v5-completion-judgment.md
    target_design:
      operation: create
      domain: quality
      slug: v5-completion-judgment
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007, AG-008]
    content: |
      ---
      title: "ADF v5 完遂判定経路（完遂条件体系・反例カタログ・台帳様式・独立検証・迂回拒否の実行構造）"
      status: draft
      created: "2026-10-09"
      updated: "2026-10-09"
      ---

      <!-- ADF-COVERS(design): REQ-110-001, REQ-110-002, REQ-110-003, REQ-110-004, REQ-110-005, REQ-110-006, REQ-110-007, REQ-110-008 -->

      # ADF v5 完遂判定経路（実行構造）

      ## 位置づけ

      本 Design は REQ-110（ADF v5 完遂判定の強制）と DEC-057（単一の正規完遂経路への集約と迂回経路の機械的拒否）の実行構造を所有する。
      完遂判定の所有は case-close QG-4 最終完了判定（document-type-responsibilities Design「成果物の意味境界の運用面と工程別正式確定」節、
      REQ-021-025・REQ-032）が維持し、本 Design は QG-4 の Verification Obligation 拡張として完遂条件体系を定義する。
      新たな Gate を追加しない。既存原則（REQ-105-007、REQ-107-006、REQ-107-007、REQ-108-009、REQ-109-005）を再定義しない。

      ## 完遂条件体系の構成

      - 完遂条件は合意済みの G0〜G10（11ゲート）を 4領域（工程・成果物／差分・影響・追跡／実行・改善循環／移行）に構成する。
        合意内容の正投影は RU-0195 の決定的受け入れ条件8項目であり、G4 は差分・影響・追跡領域の反例検証ゲートである
      - 各ゲートの定義本文・48受け入れ条件の確定列挙・判定・証拠対応は完遂条件台帳（Report）に保存し、本 Design は台帳の様式と
        判定手続きを所有する。台帳確立時に合意文書本文（session:2026-10-09-adf-v5-completion-conditions）との照合機会を設け、
        本文が入手可能な場合は正投影との逐語照合を行う
      - REQ-104〜109 の全義務行（本 Case による追加行を含む）は各ゲートの判定対象であり、各行が少なくとも1つの台帳項目に対応する

      ## G4 反例カタログ（期待挙動表）

      | 反例 | 期待挙動 |
      |---|---|
      | 採用成果物の欠落 | 拒否（ファイル不在だけでは省略合格としない） |
      | 根拠のない設計宣言 | 拒否 |
      | 版不明（依拠上流の版が特定不能） | 拒否 |
      | 空の対応関係 | 拒否（空対応を無影響証明としない） |
      | 中間版依拠 | 留保（正味差分ゼロでも中間版依拠下流への影響を無条件除外しない） |
      | 古い証拠（現行対象・版・条件への適用性未確認） | 拒否（適用性確認を経て再利用可） |
      | 追跡先欠落・参照不整合 | 拒否 |
      | Issueなし経路の誤ったIssue強制 | 拒否（存在しない詳細工程への対応を強制しない） |
      | 未充足依存 | 留保（依存先行の停止だけを理由に後続を開始しない） |
      | 権限不足 | 留保（外部副作用は確認済み権限・安全条件の範囲に限定） |
      | 移行情報欠落 | 拒否（移行成功として確定しない） |
      | 中断（有限作業の未完了再開） | 回復（正規入力からの再開を確認） |
      | 再実行（冪等性・重複実行） | 回復（冪等経路の確認） |
      | 検証器偽陽性（反例を合格と誤判定） | 検証器側を fail として扱う |

      ## 完遂条件台帳の様式

      - 配置: docs/reports/（Report 層。Design インデックス対象外）。恒久台帳を新設しない（REQ-103-017）
      - 各項目の記録要素: 条件ID（G{N}-{NN}）、領域、対応要件行（REQ-NNN-MMM）、判定（pass / fail / blocked / not applicable）、
        証拠参照（PR・Issue コメント・監査記録・実行ログの所在）、判定時刻、判定主体
      - 判定値と Gate 判定値（pass / warn / fail / partial）への写像は v4-quality-gate-model Design の正規所有契約に従う
      - QG-4 実行時の証拠は既存チャネル（QG-4 結果コメント・suite 実行ログ・SSoT コメント）と PR 本文検証差分セクションで保持する

      ## 独立検証の手続き

      - 実装担当（実装を委譲された実行主体）と検証担当（完遂判定の検証主体）を分離する。検証担当は実装委譲とは別の委譲
        （別セッション）とし、委譲種別の参考分類は gate_check（書き込み禁止）+ 決定的検査の Script 優先 + 意味評価の
        semantic_review に従う（v4-delegation-contracts Design）
      - 独立検証は元データ（REQ・Design・証跡実体）から再評価し、実装側の合格報告の再掲でない証拠
        （実行セッション・作成主体・時刻・入力参照の由来情報を持つ記録）を保存する
      - 隔離環境での反例投入が環境操作を伴う場合は、反例投入ハーネス（bun test 優先、REQ-060 実行形態）経由とし、
        書込み禁止型の委譲で正規状態を操作しない

      ## 迂回経路の反証検査

      - 完遂状態（最終受入判定の合格状態）への変更経路を、正規成果物・スクリプト・ワークフロー定義の網羅探索
        （src/**、.opencode/**（ホスト側投影物）、docs/designs/**、scripts/** の完了状態遷移起動点の列挙。
        正規原本と投影物の双方を対象とする。See Also 等の参照行は検出対象外とする扱いを明示する）で列挙する
      - 列挙した全経路が最終受入判定を経由することを確認し、迂回経路0件を反証検査として台帳・検証記録に残す
      - 完了条件チェックボックスの単一書き手原則（REQ-032-001）を維持し、完遂状態遷移の起動点を単点化する

      ## 検証器偽陽性の確認手順

      - 隔離環境で合格とすべき正常系投入と反例投入（G4 カタログ）の双方を実行し、検証器自身の偽陽性
        （不合格の合格化、正常系の誤不合格化）を確認する
      - 偽陽性を検出した場合、対象機能の判定ではなく検証器側を fail として扱い、台帳に記録する

      ## タグ・版運用手順

      - 既存 v5.0.0 タグ（025b2547 固定点）の付け替え・削除を行わない。前後照合でタグ→コミット対応を確認する
      - 完遂判定後に完成コミットを別途識別し、新しい版（タグ）を付与する。版付与は移行・release 標準境界
        （v4-migration-and-release Design）に従う

      ## 移行検証の手順

      - ADF自身と合意済み対象プロジェクトについて、移行前後で未処理 Intake・Learning・Backlog の内容・処理状態・参照関係を
        前後照合する（DEC-056、REQ-109）。欠落・不整合・検証不能は移行成功として確定しない
      - 処理継続性（移行後も後続処理が継続できること）を実行時に実証し、証拠を台帳に対応付ける

      ## 保証の限界の記録様式

      - 完遂宣言の記録（完了報告・台帳・リリース記録）には「規定した対象・前提・証拠の範囲で完遂」である旨の保証の限界を明記する
      - 無条件・絶対的な動作保証を示す語を使用しない

      ## See Also

      - REQ-110（完遂判定の強制）、DEC-057（単一正規完遂経路と機械的拒否）
      - case-close QG-4 最終完了判定、v4-quality-gate-model Design（QG 群の所有と判定値写像）
      - v4-migration-and-release Design（版付与・移行標準境界）、RU-0195（合意の正投影）
  - id: ACT-DESIGN-004
    artifact: design
    operation: append
    target: docs/designs/quality/v4-quality-gate-model.md
    target_area: "## QG-2 / QG-4 の受け入れ義務保存拡張"
    source_items: [AG-005, AG-001]
    content: |
      ## QG-4 完遂判定義務（v5 完遂条件体系）

      QG-4 の Verification Obligation に ADF v5 完遂条件体系（G0〜G10、4領域構成）を追加する（REQ-110、DEC-057）。
      完了条件単位の評価（pass / fail / blocked / not applicable）と Gate 判定値への写像は既存の正規所有契約に従う。
      完遂条件の台帳様式・反例カタログ・独立検証・迂回拒否の実行構造は v5-completion-judgment Design（quality ドメイン）が所有する。
      新たな Gate は追加しない。
  - id: ACT-DESIGN-005
    artifact: design
    operation: update
    target: docs/designs/foundations/references/v4-v5-crosswalk.md
    target_area: "## 優先行の処遇記録（棚卸し対象）"
    source_items: [AG-010]
    content: |
      ## 優先行の処遇記録（棚卸し対象）

      REQ-108 と現行要件行の間で宣言の競合が観測される優先行の処遇を記録する。

      | 対象 | 現行文面の要旨 | v5 側の宣言 | 意味処遇 | 処遇時点 | 備考 |
      |---|---|---|---|---|---|
      | REQ-030-001 | case-open は合意済み要件doc を入力とし Root Case を GitHub Issue として確立する | REQ-108-003（小規模案件では Epic や Issue の生成を必須としない）、REQ-108-004（価値がある有限作業では Issue を利用でき、実行境界が要求・設計の正規情報を再所有しない） | redefine | executed | Root Case による Issue 確立は価値ある有限作業の必要時利用へ移行する再定義を実施した（完遂判定強化 Case の Definition を参照） |
      | REQ-005-001 | ワークフローは壁打ち、構造的実行、レビュー完了の 3 マクロフェーズ構成。構造的実行は Root Case 確立後の Definition 確定から進行する | REQ-108-002（要件確定、設計確定、実装・構築、検証、Issue 協調、後処理の責務分割。設計形成は実装や Issue 作成を強制されずに独立終了できる） | redefine | executed | 3 フェーズ構成の維持と責務分割語彙対応の採用規約への委譲を再定義に反映した |
      | REQ-005-010 | 公開 command は分類され、要求入口は req-define と backlog-auto の 2 つ。両経路とも実行は case-auto へ合流する | REQ-108-002（工程の独立終了）、REQ-108-003（小規模案件の連続実行） | redefine | executed | v5 の工程独立実行可能性を再定義に反映し、現行公開 UX（2 入口・case-auto 合流）は維持した |
      | REQ-005-011 | case-auto は標準実行コマンドとして標準経路を構成し、標準経路を置換する別の公開実行経路を新設しない | REQ-108-002（責務分割と工程の独立終了）、REQ-108-003（工程単独で確定・終了） | redefine | executed | 工程独立実行が可能な場合も公開実行経路は本行の統合を維持する再定義を実施した |
      | REQ-035-006 | Wave は execution_unit に含めない実行スケジューリング単位である | REQ-108-008（Wave を意味的な依存関係のまとまりとして扱う） | keep | executed | 「実行スケジューリング単位」語彙の表現統合を実施した（意味的依存のまとまりとして再定義）。実質的競合なし |
      | REQ-061-007、REQ-061-010、REQ-061-013（周辺行） | case-ready は Standard / Epic を確定し、Wave 構成を意味的依存のみから導出し、実行構成表へ Wave 所属を明記する | REQ-108-003（工程単位の確定・終了）、REQ-108-008（Wave = 意味的依存のまとまり、並列実行上限の実行制御独立） | keep（010）、redefine（007・013） | executed | Wave 構成の意味的依存導出規定（REQ-061-038/047/048、REQ-061-010）は keep（文言変更なし）。Epic 確定と Child Issue 生成の必須性撤廃（REQ-061-007・REQ-061-013）を再定義に反映した |
  - id: ACT-DESIGN-006
    artifact: design
    operation: update
    target: docs/designs/foundations/references/v4-v5-crosswalk.md
    target_area: "## 集約サマリ"
    source_items: [AG-010]
    content: |
      ## 集約サマリ

      - 優先行 6 項目（REQ-030-001、REQ-005-001、REQ-005-010、REQ-005-011、REQ-035-006、
        REQ-061 周辺行）の処遇を実行した: defer 4 項目は意味処遇を redefine に確定し対象行の再定義を完遂判定強化 Case の
        Definition で実施した、REQ-035-006 は意味処遇 keep のまま語彙統合の表現統合を実施した、REQ-061 周辺行は Wave 導出規定
        keep（REQ-061-010 を含む）+ Epic/Child Issue 生成必須性の撤廃（redefine、REQ-061-007・013）を実施した。
        全エントリの処遇時点を executed へ遷移させた
      - v5 実行モデルの実現確定と処遇実行は完遂判定強化 Case（RU-0195 由来）が担い、処遇記録の遷移を本 Design に反映した
      - v5 新規 REQ と現行要件行の宣言なし直接矛盾の検証では、競合候補は上記優先行に集約され、
        全て本 crosswalk の棚卸し対象記録または移行期権威行（REQ-108-012）により管理される。未管理矛盾 0 件
      - 本 Design は棚卸し構造であり、優先行の実際の再定義・廃止実施は正規改訂経路（当該 Case の Definition）で完了した

# conflict_resolutions: 壁打ちで解消された衝突の記録
# 記録済みの衝突について、後続コマンドは同じ内容をユーザーへ再確認しない
conflict_resolutions:
  - id: CR-001
    conflict: |
      RU-0195 は合意文書（G0〜G10・最終判定表・保証の限界・既存タグとの関係）の「そのまま正規契約への投影」を要求するが、
      合意文書本文と48条件監査（adf-v5-requirements-implementation-audit-2026-10-09.md）はリポジトリに存在しない
      （監査参照は dangling、合意文書は session:2026-10-09-adf-v5-completion-conditions のチャット添付のみ）。
      原文不在のまま「そのまま投影」は字義どおり成立しない。
    resolution: |
      Supervisor 指示（2026-10-09、本 req-define 起動指示）により「合意内容は RU-0195 の決定的受け入れ条件8項目がすべてを投影する」
      ことを正として採用する。要件定義（本 draft）は8項目投影を合意内容の正とし、G0〜G10 の定義本文・最終判定表・保証の限界の詳細と
      48受け入れ条件台帳は本案（case）の正規成果物として確立・保存する（監査台帳は docs/reports/ の Report、完遂条件体系は REQ・Design）。
      既存監査の「実装済み11件」の特定は不能のため、RU-0195 決定的受け入れ条件1が要求する全項目の判定・証拠対応（全48条件の再検証を包摂）
      によって代替する。合意文書本文が入手可能となった時点（STEP-10 提示後または case 実行時）で本文照合を行う機会を STEP-10 で明示する。
  - id: CR-002
    conflict: |
      RU-0195 の generation_actor: supervisor は現行契約（REQ-008-051、artifact-contracts.md「RU アーティファクト契約」の固定値
      req-define-parent）と差異がある。RU 本文は「完全な契約適合とは扱わず後工程開始前に解決する」「配置許可を契約改訂の承認とは扱わない」
      と指示し、Supervisor 指示も「RU 本文の記載どおり後工程開始前に解決すること」と命じる。
    resolution: |
      本案の最初の保存操作として契約改訂（REQ-008-051 の generation_actor 列挙化 + artifact-contracts.md「RU アーティファクト契約」節更新:
      生成主体を req-define-parent と supervisor の列挙に拡張し Supervisor〔Hermes 監督セッション〕起案経路を正規化）を含める。
      正規の変更経路（本 draft → case-auto 内部 lifecycle の Definition 保存）での解決であり、未解決のまま後工程へ持ち越さない。
      適用時点が case-ready（case-auto 開始後）となる字面の時差は、「未解決持ち越しの禁止」という趣旨充足として解決と位置づける。
      配置許可≠承認の原則は、本解決を Supervisor 起動指示に基づく明示的な合意記録（本 CR-002）として残すことで充足する。
  - id: CR-003
    conflict: 決定的受け入れ条件4「実装担当と区別された検証担当による独立検証」の運用定義（誰が検証担当か）が未確定。
    resolution: |
      要件行は成果を固定し手段を委任する標準パターンを採用する: REQ 側は「実装担当と検証担当の分離、元データ（REQ・Design・証跡実体）
      からの再評価、合格報告の再掲でない証拠の保存」を判定可能な義務として固定し、具体的な委譲形態（別セッションの検証専用エージェント等）は
      Design 層で確定する。
  - id: CR-004
    conflict: scale（standard/large）と構造化方針（新規REQ・REQ-104〜109 APPEND・Design 更新・realization_actions の構成）が未確認。
    resolution: |
      scale: large（Epic 想定）を採用する。根拠: 4領域×48条件の実行時実証、検証器・判定経路の実装、隔離環境での反例投入、独立検証、
      タグ・版運用、移行実証、契約改訂、既知債務解消という複数領域にわたる実装スコープシグナル。
      構造化方針: 新規REQ（完遂判定強制の本体）+ REQ-104〜109 への領域別実行時実証義務 APPEND + 完遂判定経路 Design 更新 +
      既知債務処遇 + realization_actions（検証器・台帳・反例投入環境・独立検証・タグ運用の実現面）。Epic/Wave 構成は case-open が決定する。
  - id: CR-005
    conflict: |
      STEP-5 Decision判断: 単一正規完遂経路＋機械的拒否（C1）と generation_actor 列挙化（C2）をそれぞれ Decision として
      記録するか。architecture-advisory（agentdev-architecture-advisory 委譲、2026-10-09）に判定を委譲した結果、
      C1 は Decision 必要（スコープ限定付き）、C2 は Decision 不要と助言された。
    resolution: |
      助言を採用する。C1 は DEC-057 として新設する（DEC-055・DEC-053 への relates-to 拡張。既存原則の再決定をしない、
      工程の独立終了と完遂宣言の別判定性の保存、実装手段の Design/realization 委任、QG-5 不追加・QG-4 義務拡張で対応、
      台帳は Report＋QG-4 証拠チャネルで恒久台帳新設なし、のスコープ限定付き）。
      C2 は Decision を作成せず、REQ-008-051 UPDATE + artifact-contracts Design UPDATE のみで解決する
      （可逆的なデータ契約改訂であり責務境界変更・新規コンポーネントを導入しない。作業手段Decision拒否ゲートの趣旨により
      意思決定記録に値しない。generation_actor は出所記録であり公開要求入口ではないため REQ-005-011 の2入口規定にも非該当）。

# operation_units: 実行単位（単一REQ操作も1件の OU として出力。Issue 階層・Epic/Wave 構成は case-open が決定する）
# depends_on は必須依存のみ記録する。OU-009〜012（既知債務処遇）の適用タイミングは wave_hints を参照
operation_units:
  - ou_id: OU-001
    source_ru: RU-0195
    target_req: REQ-008
    target_design: docs/designs/responsibilities/artifact-contracts.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
  - ou_id: OU-002
    source_ru: RU-0195
    target_req: new:adf-v5-completion-enforcement
    target_design:
      operation: create
      domain: quality
      slug: v5-completion-judgment
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
  - ou_id: OU-003
    source_ru: RU-0195
    target_req: REQ-104
    operation: append
    scale: standard
    depends_on: [OU-002]
    recommended_order: 3
    issue_policy: single
  - ou_id: OU-004
    source_ru: RU-0195
    target_req: REQ-105
    operation: append
    scale: standard
    depends_on: [OU-002]
    recommended_order: 4
    issue_policy: single
  - ou_id: OU-005
    source_ru: RU-0195
    target_req: REQ-106
    operation: append
    scale: standard
    depends_on: [OU-002]
    recommended_order: 5
    issue_policy: single
  - ou_id: OU-006
    source_ru: RU-0195
    target_req: REQ-107
    operation: append
    scale: standard
    depends_on: [OU-002]
    recommended_order: 6
    issue_policy: single
  - ou_id: OU-007
    source_ru: RU-0195
    target_req: REQ-108
    operation: append
    scale: standard
    depends_on: [OU-002]
    recommended_order: 7
    issue_policy: single
  - ou_id: OU-008
    source_ru: RU-0195
    target_req: REQ-109
    operation: append
    scale: standard
    depends_on: [OU-002]
    recommended_order: 8
    issue_policy: single
  - ou_id: OU-009
    source_ru: RU-0195
    target_req: REQ-005
    target_design: docs/designs/foundations/references/v4-v5-crosswalk.md
    operation: update
    scale: standard
    depends_on: [OU-002]
    recommended_order: 9
    issue_policy: single
  - ou_id: OU-010
    source_ru: RU-0195
    target_req: REQ-030
    operation: update
    scale: standard
    depends_on: [OU-002]
    recommended_order: 10
    issue_policy: single
  - ou_id: OU-011
    source_ru: RU-0195
    target_req: REQ-035
    operation: update
    scale: standard
    depends_on: [OU-002]
    recommended_order: 11
    issue_policy: single
  - ou_id: OU-012
    source_ru: RU-0195
    target_req: REQ-061
    operation: update
    scale: standard
    depends_on: [OU-002]
    recommended_order: 12
    issue_policy: single
result: {}

# test_strategy: 各合意項目（AG-*）の検証方法。全項目3要素（verification / pass_criteria / on_failure）を持つ
# 導出経路: change → risk（5観点境界）→ verification obligation → test strategy
# 5観点境界の確認記録: dependency boundary（QG-4・Gate モデル・DEC-054 との競合 → TS-002/005）、
#   client/server boundary（タグの外部・局所乖離 → TS-006）、execution boundary（実装/検査担当分離の形骸化 → TS-004）、
#   build/runtime boundary（検証器の静的検査と動的判定の混在 → TS-002/003）、
#   environment propagation boundary（反例投入が正規状態を破壊 → TS-002/003 の隔離環境実行）
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      完遂条件体系（G0〜G10・4領域構成）が REQ・Design として正規保存されていることを正規成果物の実ファイル確認で検証する。
      48受け入れ条件台帳（docs/reports/ の正規 Report）の全項目に判定（pass / fail / blocked / not applicable）と証拠参照が
      対応していることを台帳と証跡実体の突合で検証する。REQ-104〜109 の全義務行（本 Case による追加行を含む）の各行が
      台帳の対応範囲に含まれることを検証する。
    pass_criteria: |
      G0〜G10 を構成する全条件が REQ・Design に正規保存され、台帳の全48項目に判定と証拠が対応し、REQ-104〜109 の全義務行
      （本 Case による追加行を含む）の各行が少なくとも1つの台帳項目に対応する。未判定・証拠不在の項目が0件である。
    on_failure: |
      fix-and-reverify（保存漏れ・対応漏れは完遂判定の前提が欠けるため、実装を修正して再検証する）。
  - id: TS-002
    target_item: AG-002
    verification: |
      4領域（工程・成果物／差分・影響・追跡／実行・改善循環／移行）の振る舞いを実行時に実証する。
      G4 の反例14種（採用成果物の欠落、根拠のない設計宣言、版不明、空の対応関係、中間版依拠、古い証拠、追跡先欠落、
      Issueなし経路の誤ったIssue強制、未充足依存、権限不足、移行情報欠落、参照不整合、中断、再実行）を隔離環境に投入し、
      検証器の判定（拒否・留保・回復の識別）を Design 保存の期待挙動表と照合する。隔離環境での実行が正規状態を破壊しないことを確認する。
    pass_criteria: |
      反例14種すべてが期待どおり拒否・留保・回復を識別する。実行時実証の証跡が保存され、隔離環境外の正規状態に影響がない。
    on_failure: |
      fix-and-reverify（反例を見逃す検証器は完遂判定の信頼性を欠くため、修正して再検証する）。
  - id: TS-003
    target_item: AG-003
    verification: |
      隔離環境で、合格とすべき正常系投入と反例投入の両方を実行し、検証器自身の偽陽性（不合格を合格とする誤判定、
      正常系を誤って不合格とする誤判定）を確認する。偽陽性が検出された場合に検証器側を fail として扱った記録が残ることを確認する。
    pass_criteria: |
      偽陽性が0件、または検出された偽陽性すべてについて検証器を fail とする記録が存在する。
    on_failure: |
      fix-and-reverify（検証器の偽陽性は完遂判定の前提不良のため、修正して再検証する）。
  - id: TS-004
    target_item: AG-004
    verification: |
      実装担当とは別の検証担当（別セッションの検証専用委譲）による独立検証の記録を確認する。
      独立検証が元データ（REQ・Design・証跡実体）から実施され、実装担当の合格報告の再掲でないことを、
      証拠の由来（実行セッション・作成主体・時刻・入力参照）の確認で検証する。
    pass_criteria: |
      独立検証の証拠が存在し、その入力が元データを直接参照し、実装側報告と独立に作成されたことを示す由来情報を持つ。
    on_failure: |
      fix-and-reverify（独立検証の欠落は決定的受け入れ条件4の不成立のため、修正して再検証する）。
  - id: TS-005
    target_item: AG-005
    verification: |
      完遂状態（最終受入判定の合格状態）への変更経路を列挙する検索系検証（rg 等による正規成果物・スクリプト・ワークフロー定義の網羅探索。
      対象範囲: src/**、.opencode/**（ホスト側投影物）、docs/designs/**、scripts/**、完了状態遷移を起動し得る操作定義。
      正規原本と投影物の双方を列挙する。See Also 等の参照行は検出対象外とする扱いを明示する。
      検証の網羅範囲と修正対象列挙の一致を確認済み）を行い、列挙した全経路が正規完遂経路（最終受入判定）を経由することを確認する。
      正規経路を経由しない変更経路が存在しないことを反証検査で確認する。
    pass_criteria: |
      列挙された全ての完遂状態変更経路が最終受入判定を経由する。迂回経路が0件である。
    on_failure: |
      fix-and-reverify（迂回経路の残存は機械的拒否構造の不成立のため、修正して再検証する）。
  - id: TS-006
    target_item: AG-006
    verification: |
      v5.0.0 タグの指すコミットが 025b2547 から変更されていないことを前後照合（タグ→コミット対応の確認）で検証する。
      完遂判定後、完成コミットが別途識別され新しい版（タグ）として付与されていることを確認する。
    pass_criteria: |
      v5.0.0 → 025b2547 が不変であり、完成コミットを指す新しい版が付与されている。
    on_failure: |
      fix-and-reverify（タグの付け替え・意味変更は RU 対象外違反のため、修正して再検証する）。
  - id: TS-007
    target_item: AG-007
    verification: |
      ADF自身と合意済み対象プロジェクトの移行について、移行前後で未処理 Intake・Learning・Backlog の内容・処理状態・参照関係を
      前後照合する。処理継続性（移行後も後続処理が継続できること）を実行時に実証する。
    pass_criteria: |
      移行前後の照合で欠落・不整合・検証不能が0件であり、未処理情報の処理継続性が実証されている。
    on_failure: |
      fix-and-reverify（移行欠落は決定的受け入れ条件7の不成立のため、修正して再検証する）。
  - id: TS-008
    target_item: AG-008
    verification: |
      完遂宣言の記録（完了報告・台帳・リリース記録）に「規定した対象・前提・証拠の範囲で完遂」という保証の限界が明記されていることを確認する。
      検索系検証（rg 等による「絶対保証」「無条件に保証」等の絶対保証を示す宣言語の不在確認。対象範囲: 完遂宣言を記録する正規成果物。
      網羅範囲と修正対象列挙の一致確認済み）で絶対保証の宣言が存在しないことを確認する。
    pass_criteria: |
      保証の限界が明記され、絶対保証を示す語が完遂宣言記録に存在しない。
    on_failure: |
      fix-and-reverify（絶対保証の宣言は保証の限界要件の違反のため、修正して再検証する）。
  - id: TS-009
    target_item: AG-011
    verification: |
      REQ-008-051 と artifact-contracts.md「RU アーティファクト契約」節が generation_actor を列挙値
      （req-define-parent / supervisor）として定義していることを両ファイルの実確認で検証する。
      RU-0195 の frontmatter が改訂後契約に適合することを確認する。
    pass_criteria: |
      両正規成果物の列挙定義が一致し、RU-0195 の generation_actor: supervisor が改訂後契約に適合する。
    on_failure: |
      fix-and-reverify（契約差異の未解決は後工程開始条件違反のため、修正して再検証する）。
  - id: TS-010
    target_item: AG-010
    verification: |
      v4-v5-crosswalk の処遇記録について、defer 4項目（REQ-030-001、REQ-005-001、REQ-005-010、REQ-005-011）と周辺行
      （REQ-035-006 の語彙統合、REQ-061-007/013 の必須性部分）が正規改訂経路での対象行再定義とともに、意味処遇列の確定値
      （redefine / keep）と処遇時点列の executed 遷移として記録されていることを確認する。v5-adopted-conventions.md と
      v4-v5-crosswalk.md の status 処置（昇格または昇格判断の記録）が確定していることを確認する。
      REQ-088-006 が解消操作対象外であることの記録（review_dispositions）を確認する。
    pass_criteria: |
      処遇実行が正規改訂経路で実施され、crosswalk の遷移記録と対象 REQ 行の再定義が一致する。draft Design 2件の処置が確定している。
    on_failure: |
      fix-and-reverify（既知債務の未解決は RU 対象の未達のため、修正して再検証する）。

# realization_actions: 実現面の変更方針（実現面変更方針の構造化ハンドオフ契約。artifact_actions と分離した独立構造）
# case-open が本セクションを Issue / Epic の execution contract へ投影する
realization_actions:
  - id: RA-001
    concern: 完遂判定器（最終受入判定の機械的拒否構造）の実装
    responsibility: |
      case-close QG-4 最終完了判定を単点とする完遂状態遷移の実装。QG-4 を経由しない完遂状態変更経路を機械的に拒否する
      検証器・guard を実装し、完了条件チェックボックスの単一書き手原則（REQ-032-001）を維持する。
    ownership_hints:
      - "case-close workflow/skill（QG-4 最終完了判定の実行主体）"
      - "scripts（integrity 系検査・guard）"
      - "docs/designs/quality/v5-completion-judgment.md（実行構造の正規所有）"
    intent: |
      迂回経路0件を反証検査で実証する（TS-005）。作業規律・口頭合意のみで代用しない機械的拒否構造（RU-0195 要件化の方向）。
    verification_refs: [TS-005, TS-002]
    source_items: [AG-005]
  - id: RA-002
    concern: 48受け入れ条件の証拠台帳の実装
    responsibility: |
      台帳（条件ID・領域・対応要件行・判定・証拠参照・判定時刻・判定主体）を docs/reports/ の Report として実装し、
      作成・更新手続きを確立する。恒久台帳を新設しない（REQ-103-017）。判定と証拠の基準は採用済み規約から解決する。
    ownership_hints:
      - "docs/reports/（Report 層）"
      - "docs/designs/quality/v5-completion-judgment.md（台帳様式の所有）"
      - "QG-4 既存証拠チャネル（結果コメント・suite 実行ログ・SSoT コメント）"
    intent: 48条件・52要件行の各項目への判定・証拠対応の実体化（TS-001）。
    verification_refs: [TS-001]
    source_items: [AG-001]
  - id: RA-003
    concern: 反例投入ハーネス（隔離環境）の実装
    responsibility: |
      G4 反例14種を隔離環境に投入し、拒否・留保・回復の識別を検証するハーネスを実装する。決定的に実行可能な反例は
      bun test（REQ-060 実行形態）内の test として実装し、正規状態を破壊しない隔離（worktree・フィクスチャ）を保証する。
      検証対象がランタイム経路自体で test で再現できない部分は検証ハーネスとして分離実装する。
    ownership_hints:
      - "bun test / integrity 系 suite（full integrity suite は QG-4 合格基準）"
      - "隔離環境（worktree・テストフィクスチャ）"
    intent: 4領域の実行時実証と反例検証・検証器偽陽性確認の実行基盤（TS-002/003）。
    verification_refs: [TS-002, TS-003]
    source_items: [AG-002, AG-003]
  - id: RA-004
    concern: 独立検証の委譲実行経路の実装
    responsibility: |
      実装委譲とは別の委譲（別セッションの検証専用エージェント）が元データ（REQ・Design・証跡実体）から再評価し、
      合格報告の再掲でない証拠（実行セッション・作成主体・時刻・入力参照の由来情報を持つ記録）を保存する経路を実装する。
      委譲種別の参考分類は gate_check + 決定的検査の Script 優先 + 意味評価の semantic_review。
    ownership_hints:
      - "v4-delegation-contracts Design（委譲種別）"
      - "case-close QG-4 独立再検査（既存構造）"
    intent: 実装担当と検証担当の分離と再掲でない証拠の保存（TS-004）。
    verification_refs: [TS-004]
    source_items: [AG-004]
  - id: RA-005
    concern: タグ・版運用の実装
    responsibility: |
      v5.0.0 タグ（025b2547 固定点）の不変を前後照合で確認する手順と、完遂判定後の完成コミット識別・新しい版の付与手順を実装する。
      版付与は移行・release 標準境界（v4-migration-and-release Design）に従う。
    ownership_hints:
      - "v4-migration-and-release Design（版付与・移行標準境界）"
      - "git タグ操作（非対話認証: REQ-102、タグ対象は case-close 完了後）"
    intent: タグ固定点の保全と完成コミットの別途識別・新版付与（TS-006）。
    verification_refs: [TS-006]
    source_items: [AG-006]
  - id: RA-006
    concern: 移行前後照合と処理継続性実証の実装
    responsibility: |
      ADF自身と合意済み対象プロジェクトの移行について、未処理 Intake・Learning・Backlog の内容・処理状態・参照関係の
      前後照合と処理継続性の実行時実証を実装する（DEC-056、REQ-109）。
    ownership_hints:
      - "v4-migration-and-release Design"
      - "DEC-056・REQ-109（移行と互換性の境界）"
    intent: 非破壊移行の前後照合と未処理情報の処理継続性実証（TS-007）。
    verification_refs: [TS-007]
    source_items: [AG-007]

# review_dispositions: 採否判断の記録
review_dispositions:
  - id: RD-001
    source_ru: RU-0195
    source_item: 既知債務-REQ-088-006
    disposition: covered
    reason_code: already_satisfied
    reason: |
      RU-0195 の既知債務列挙に含まれる REQ-088-006 は、DEC-053（2026-10-09 受領、v5.0.0 タグ時点）により再定義済みである。
      REQ-088.md の REQ-088-006 行末尾は「工程別の成果物の正式確定と最終的な要求充足の別判定は、v5 の成果物確定要件が
      所有すること」と更新されており（updated: 2026-10-09）、DEC-053「結果、影響」節が再定義を宣言済み。
      本案の解消操作対象から除外する（充足済みのため）。
    evidence:
      path: docs/requirements/REQ-088.md
      section: REQ-088-006
      checked_at_commit: null
    related_removed_items: []

# case_open_hints: case-open 構成生成への参考情報（Issue 階層は case-open が決定する）
case_open_hints:
  epic_needed: true
  decomposition: |
    OU-001（契約改訂: REQ-008-051 列挙化 + artifact-contracts 更新）と OU-002（完遂判定の正規要件化: 新規REQ-110・DEC-057・
    quality/v5-completion-judgment Design 新設 + v4-quality-gate-model 追記）を定義 Wave として先行する。
    OU-003〜OU-008（REQ-104〜109 への領域別実行時実証義務の追加）を第2 Wave とする。
    実証フェーズ（realization_actions RA-001〜006: 完遂判定器・台帳確立・反例投入ハーネス・独立検証・迂回反証・タグ/移行実証）を
    定義確定後に実行する。OU-009〜OU-012（既知債務の処遇実行: v4 要件行再定義 + crosswalk 遷移記録）は実証フェーズ完了後の
    最終 Wave で適用する（crosswalk の処遇実行トリガー: v5 の実行モデルの実現確定）。
    最終受入判定（QG-4）と新版付与を最終段階とする。v5-adopted-conventions.md・v4-v5-crosswalk.md の draft→accepted 昇格判断は
    case-close が行う（Design README の status 運用）。
  wave_hints:
    - "Wave 1: OU-001, OU-002（定義。相互依存なし）"
    - "Wave 2: OU-003〜OU-008（領域別義務の定義追加。OU-002 依存）"
    - "実証フェーズ: RA-001〜006（台帳確立・反例投入・独立検証・迂回反証・タグ不変確認・移行照合。Wave 2 完了後）"
    - "最終 Wave: OU-009〜OU-012（既知債務の処遇実行。実証フェーズ完了後）→ 最終受入判定（QG-4）→ 新版付与"
```

# summary

（人間可読補足。処理の正は draft-data YAML ブロック）

- 入力: RU-0195（session由来RU、agentdev_handoff: true → upstream-handoff 契約により本リポジトリでは通常の req/case ワークフロー入力として扱う）
- 合意の成立: RU-0195 の受け入れと実行指示（agreement_confirmed_at: 2026-10-09T22:31:00+09:00）。
  合意内容の正投影は決定的受け入れ条件8項目（CR-001）
- 要件構成: 新規REQ-110（完遂判定の強制、10要件行）+ DEC-057（単一正規完遂経路と機械的拒否）+
  quality/v5-completion-judgment Design（実行構造・反例カタログ・台帳様式）+ REQ-104〜109 への領域別実行時実証義務（各1行追加）+
  REQ-008-051 列挙化（generation_actor 契約差異の解決、CR-002/005）+ v4-v5-crosswalk 処遇実行（REQ-005/030/035/061 の再定義、CR-001〜005 参照）
- work_type: feature / scale: large（Epic 想定、CR-004）。Epic/Wave 構成は case-open が決定
- STEP-3/4 の Jev 先行評価: 既存REQ照合（CREATE 確定、obs 20261009T135155Z-58e2）、最終分類・Design分離
  （Design行帰属・分離する、obs 20261009T135631Z-4406）。最終判断は観測へ反映済み
- architecture-advisory（2026-10-09 委譲）: C1 Decision 必要（スコープ限定付き）・C2 Decision 不要・硬直的矛盾なし・
  QG-5 不追加・台帳は Report＋QG-4 証拠チャネル・独立検証は gate_check＋Script 優先・反例投入は bun test 優先（CR-005）
- STEP-8 adversarial-review 完了（2026-10-09、読み取り専用審議）: 方針・構造は健全、STEP-5 差し戻し事項なし、
  未解約ユーザー判断事項なし。受け入れ6件を反映済み: ①crosswalk 処遇記録の意味処遇/処遇時点列分離（redefine・keep の確定値と
  executed 遷移の記録）、②RD-001 disposition を covered へ（REQ-088-006 は充足済み）、③REQ-005-001 の語彙対応委譲先を
  採用規約へ単純化（循環参照の切断）、④迂回経路反証の網羅範囲へ .opencode/**（ホスト側投影物）追加、⑤ACT-REQ-012 の
  REQ-061-010 no-op 置換除外（2行置換へ縮小）、⑥「52要件行」表記を REQ-104〜109 の全義務行（本 Case による追加行を含む）へ変更
- 探索確認済みの正規アンカー: REQ-104〜109（52要件行）、DEC-053〜056（accepted）、v5-adopted-conventions.md（draft）、
  v4-v5-crosswalk.md（draft）、完遂判定経路の所有は case-close QG-4（document-type-responsibilities.md L45）、v5.0.0 タグ → 025b2547
- 未実体化の参照: 合意文書本文（session:2026-10-09-adf-v5-completion-conditions 添付）、48条件監査
  （adf-v5-requirements-implementation-audit-2026-10-09.md、リポジトリ内不在）。台帳確立時に本文照合の機会を設ける（CR-001）。
  STEP-10 提示時に合意文書本文の提供機会をユーザーへ明示する
