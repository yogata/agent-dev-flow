---
draft_type: req_draft
topic_slug: textlint-gate-reuse-parallel-and-workflow
status: draft
created_at: 2026-10-05T19:05:00+09:00
source_rus:
  - RU-0161
---

# draft-data

```yaml
work_type: feature

scale: large

summary: |-
  textlint 最終検査について、対象全件の列挙と全文取得を毎回行った上で、本文と検査条件が同一と機械検証できた対象だけ規則実行を省略し、保存済みファイル単位結果を再利用して全件の結果を集約する。必須独立検査は保存結果を利用せず全件の規則を実行する。初回・失効対象・独立検査の規則実行は上限付きワーカーで CPU 並列実行する。検査の用途（書込み前検査、通常最終検査、必須独立検査、結果表示）は工程スクリプトが正規契約から決定的に選定し、入口起動・結果受理・進行判定までを一つの変更単位として接続する。REQ-053-016/032 は再利用との両立を明文で更新し、対象・規則（29規則）・合否条件の削減・変更を行わない。工程スコープシグナル（影響ファイル数10超: plugin 実装・工程スクリプト接続・配布設定・参照資料・Design 5件・REQ）により scale: large とする。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |-
      通常最終検査は、対象全件の列挙と全文取得を毎回行う。追加・削除・未追跡ファイル・外部編集・対象設定変更を現在の全件結果へ反映し、変更一覧のみを根拠とした検査省略を行わない。既存の対象0件の不合格条件を維持する。
  - id: AG-002
    content: |-
      同一性が成立した対象だけ規則実行を省略し、保存済みファイル単位結果と実検査結果から全件の結果を集約する。同一性には本文、パス、有効な規則と設定、実際のエンジンと依存成果物、標準・プロジェクト辞書と再帰的な間接依存、結果正規化の版を含める。本文同一性を更新時刻とサイズだけで判定せず、条件を追跡できない場合は再利用せず実検査する。
  - id: AG-003
    content: |-
      正常に完了した合格・不合格の双方のファイル単位結果を再利用する。異常終了、読込み失敗、タイムアウト、不完全出力を正常結果として保存・再利用しない。保存結果の欠落・破損・途中書込みの読込み・保存失敗・容量上限到達時は実検査へ戻り、実検査が不能な場合は合格としない。
  - id: AG-004
    content: |-
      保存結果は再生成可能な内部データとして扱い、プロジェクト・worktree 間の誤流用と無制限な保存を防ぐ。必須エンジン・辞書が利用不能な場合に保存済み合格結果のみで合格としない。
  - id: AG-005
    content: |-
      必須独立検査は保存済みファイル単位結果を利用せず、対象全件の規則を実行する。エンジンと辞書の初期化結果の一実行内共有を独立性違反としない。独立要求を満たさない結果で工程が進行しない。
  - id: AG-006
    content: |-
      書込み前検査は対象の完成予定全文を検査し、最終実ファイル確認の代替にしない。書込み前合格の単純継承で最終合格にならない。結果の再表示・再解析だけでは検査を起動したものとして扱わない。
  - id: AG-007
    content: |-
      検査開始時・終了時に対象集合、本文、検査条件を照合する。変化があれば未完了・未確定として工程の受理を拒否し、異時点の結果を混ぜて合格としない。複雑なロックを初期必須とせず、確認後に起きる変更は既存の工程鮮度確認で扱う。
  - id: AG-008
    content: |-
      検査の用途（書込み前検査、通常最終検査、必須独立検査、結果表示）は正規契約から決定的に選択される。工程スクリプトが入口を起動し、完結した結果を受理して進行を判定する。LLM は所定の工程入口の起動のみを行い、毎回の検査範囲・目的・再利用可否の選択を担わない。実行例の文書追加だけで接続済みとしない。結果から用途、対象範囲、対象状態、完了・未完了、合否、実規則実行数と再利用数を機械的に確認できる。表示用結果と工程受理用結果を混同しない。
  - id: AG-009
    content: |-
      初回・失効対象・独立検査に必要な規則実行は上限付きワーカーで CPU 並列実行する。単なる非同期呼出しの一括待機を CPU 並列化とみなさない。初期化負担、メモリ、複数ゲート同時実行を実測して上限を決定し、ワーカー異常・タイムアウトで未検査対象を欠落させない。並列化に伴い検査対象、規則、合否条件を削減・変更しない。
  - id: AG-010
    content: |-
      同一入力で再利用なし・あり、逐次・ワーカー並列を複数回比較し、指摘本文、ファイル、位置、重大度、合否が一致することを先に確認する。集約結果の並び順も安定する。29規則と対象範囲を維持する。単独実行と複数ゲート同時実行を分けて計測する。再利用による処理量削減と、必要な実計算の時間短縮の双方を受け入れ条件とする。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-053.md
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007, AG-008, AG-009]
    content: |
      | REQ-053-041 | 通常の完了前検査は対象全件の列挙と全文取得を毎回行った上で、本文と検査条件が同一と機械検証できた対象に限り規則実行を省略し、保存済みのファイル単位結果を再利用して全件の結果を集約できること。この再利用は REQ-053-016 の最終実ファイル再入力と REQ-053-032 の全件確認を維持するものとして適用すること |
      | REQ-053-042 | ファイル単位結果の同一性は、本文、パス、有効な規則と設定、実際のエンジンと依存成果物、標準・プロジェクト辞書と再帰的な間接依存、結果正規化の版を含めて判定すること。更新時刻とサイズのみで本文同一性を判定せず、条件を追跡できない場合は再利用せず実検査すること |
      | REQ-053-043 | 正常に完了した合格・不合格の両方のファイル単位結果を再利用対象とすること。異常終了、読込み失敗、タイムアウト、不完全出力を正常結果として保存・再利用せず、保存結果の欠落・破損・保存失敗時は実検査へ戻ること。実検査が不能な場合は合格としないこと |
      | REQ-053-044 | 保存済みファイル単位結果は再生成可能な内部データとして扱い、プロジェクト・worktree 間の誤流用、途中書込みの読込み、無制限な保存を防ぐこと。必須エンジン・辞書が利用不能な場合に保存済み合格結果のみで合格としないこと |
      | REQ-053-045 | 必須独立検査は保存済みファイル単位結果を利用せず、対象全件の規則を実行すること。エンジンと辞書の初期化結果の一実行内共有を独立性違反としないこと |
      | REQ-053-046 | 検査の開始時・終了時に対象集合、本文、検査条件を照合し、検査中に変化が生じた場合は未完了・未確定として工程の受理を拒否すること。異時点の結果を混ぜて合格としないこと |
      | REQ-053-047 | 検査の用途は正規契約から決定的に選択され、検査結果から用途、対象範囲、対象状態、完了状態、合否、実規則実行数と再利用数を機械的に確認できること。独立要求を満たさない結果で工程が進行せず、結果の再表示・再解析のみで検査を起動したものとして扱わないこと |
      | REQ-053-048 | 初回・失効対象・独立検査に必要な規則実行は上限付きワーカーで並列実行でき、ワーカー異常・タイムアウト時に未検査対象を欠落させないこと。並列化に伴い検査対象、規則、合否条件を削減・変更しないこと |
  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: docs/requirements/REQ-053.md
    source_items: [AG-002, AG-005]
    content: |
      | REQ-053-016 | 最終合否判定は、修正時の合格判断を継承しない。提出対象となる最終 HEAD の実ファイルを再入力として文章品質基準を再適用し、修正時の判断と最終確認の結果が異なる場合は最終確認の結果を優先する。再入力と再適用には、本文と検査条件が同一と機械検証できた対象の保存済みファイル単位結果の再利用（REQ-053-041〜044）を含み、書込み前検査の合格判断の継承を含まない |
      | REQ-053-032 | 完了前検査は書込み前の検査を経由しない変更を含め、解決された対象全件の全文を検査し、拒否対象の違反が残る場合は完了としないこと。全件の全文検査には、対象全件の列挙・全文取得と現在入力との照合を毎回行った上での、同一性が機械検証できた対象の規則実行省略と保存済みファイル単位結果の再利用（REQ-053-041〜044）を含むこと |
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/quality/textlint-quality-runtime.md
    target_area: "## 最終検査"
    canonical_owner: "textlint 品質基盤（docs/designs/quality/textlint-quality-runtime.md）"
    source_items: [AG-001, AG-002, AG-005, AG-006]
    content: |
      ## 最終検査

      単独実行入口は標準対象と追加対象の全件を列挙し、実ファイル全文を同じ共通基盤で検査する。
      shell、外部 editor、生成処理による変更も検出する。
      対象全件の拒否対象違反ゼロで合格とし、検査不能は不合格とする。
      差分だけ、以前の査読結果だけ、pre-write 通過だけを完了証拠にしない。
      本節の検査には、対象全件の列挙・全文取得・現在入力との照合を毎回行った上で、同一性が機械検証できた対象の規則実行省略と保存済みファイル単位結果の再利用を含める（「ファイル単位結果の再利用と同一性条件」節）。再利用は同一入力に対する同一判定の再現であり、書込み前検査の合格判断の継承ではない。
      本体の保存、完了、品質検査から利用する場合も同じ入口または同じ共通基盤を呼び出す。
      必須独立検査では保存済みファイル単位結果を利用せず、対象全件の規則を実行する（エンジンと辞書の初期化結果の一実行内共有は許容する）。
  - id: ACT-DESIGN-002
    artifact: design
    operation: append
    target: docs/designs/quality/textlint-quality-runtime.md
    target_area: "## ファイル単位結果の再利用と同一性条件"
    anchor: "## 結果"
    placement: before_anchor
    canonical_owner: "textlint 品質基盤（docs/designs/quality/textlint-quality-runtime.md）"
    source_items: [AG-002, AG-003, AG-004, AG-007, AG-008, AG-009]
    content: |
      ## ファイル単位結果の再利用と同一性条件

      通常の最終検査と書込み前検査は、対象全件の列挙と全文取得を毎回行った上で、同一性が機械検証できた対象だけ規則実行を省略し、保存済みファイル単位結果と実検査結果から全件の結果を集約する。必須独立検査は保存済み結果を利用せず対象全件の規則を実行する。

      - 同一性の構成要素: 本文、パス、有効な規則と設定、実際のエンジンと依存成果物、標準・プロジェクト辞書と再帰的な間接依存、結果正規化の版。更新時刻とサイズのみで本文同一性を判定しない。規則構成の同一性は既存の配置位置非依存の規則構成ハッシュ手順（「規則校正と移行検証」節）を再利用する。条件を追跰できない場合は再利用せず実検査する
      - 再利用対象: 正常に完了した合格・不合格の双方の結果。異常終了、読込み失敗、タイムアウト、不完全出力は正常結果として保存しない
      - 保存: 再生成可能な内部データとして扱い、容量上限を設け、プロジェクト・worktree 間の誤流用と途中書込みの読込みを防ぐ。保存の欠落・破損・失敗・容量上限到達時は実検査へ戻り、実検査不能なら合格にしない。必須エンジン・辞書が利用不能な場合は保存済み合格結果のみで合格にしない
      - 開始・終了時照合: 検査の開始時・終了時に対象集合、本文、検査条件を照合し、変化があれば未完了・未確定として工程受理を拒否する。複雑なロックを初期必須とせず、確認後に起きる変更は既存の工程鮮度確認で扱う
      - 並列実行: 初回・失効対象・独立検査の規則実行は上限付きワーカーで CPU 並列実行する。単なる非同期呼出しの一括待機を CPU 並列化と扱わない。初期化負担、メモリ、複数ゲート同時実行を実測して上限を決定する。ワーカー異常・タイムアウトで未検査対象を欠落させない
      - 用途と結果: 用途（書込み前検査、通常最終検査、必須独立検査、結果表示）は正規契約から決定的に選択する。結果から用途、対象範囲、対象状態、完了状態、合否、実規則実行数と再利用数を機械的に確認できる形式とし、表示用結果と工程受理用結果を混同しない
  - id: ACT-DESIGN-003
    artifact: design
    operation: update
    target: docs/designs/skills/agentdev-quality-gates.md
    target_area: "## QG-4 検証証拠の再利用と再実行条件"
    canonical_owner: "quality gates（docs/designs/skills/agentdev-quality-gates.md）"
    source_items: [AG-005, AG-008]
    content: |
      ## QG-4 検証証拠の再利用と再実行条件

      検証・検査の実行と、その結果の表示・解析を分離する。実行手順の正規形は `agentdev-quality-gates` スキルの references/qg-4-final-acceptance.md が所有し、本 Design は品質統制側の契約を所有する（REQ-007-014/015）。

      - 検証証跡は標準出力、標準エラー、終了コード、版、検査範囲、実行環境を保持する。保持先は既存の証跡チャネル（退避ファイル、PR 本文検証差分セクション、SSoT コメント）とし、新しい証跡基盤を追加しない
      - 件数、失敗明細、サマリーの表示変更は保存済み証跡から行い、同一情報の取得だけを目的としたテスト・検査の再実行をしない
      - 再実行は正当理由に該当する場合のみ実行する。正当理由は変更後検証、環境変更、失敗由来分類、非決定的失敗の再現確認、必須独立検査、証跡欠落とする
      - 保存出力の欠落、切断、タイムアウト、検査範囲欠落は完全な合格証拠として扱わない。既存の timeout 打ち切り扱い（fail 証跡としない）、件数突合、PowerShell コンソール表示を証跡扱いしない規律を維持する
      - QG-4 機械受理基準の記録対象に終了コード、版、検査範囲を追加する
      - 必須の版境界における再検証、close の最終検証（origin/main 取り込み済み・マージ直前の branch HEAD での実行）、QG-4 独立再検査、full suite 実行の省略禁止は維持する。同一版でも必要な再現確認・独立検査を拒否しない。裸の bun test 一発（対象ディレクトリを明示指定しない単体実行）で正規の全体網羅検証を代替しない
      - textlint 共通基盤のファイル単位結果再利用（同一性条件付きの規則実行省略）は検査基盤内部の実行形態であり、本節の検証証跡の再利用・再実行条件と区別する。QG-4 の必須独立再検査・close の最終検査の実行義務を緩和せず、工程証跡としての再実行条件は本節が所有する
  - id: ACT-DESIGN-004
    artifact: design
    operation: update
    target: docs/designs/commands/case-run.md
    target_area: "### case-run が使用する検査ツール"
    canonical_owner: "case-run Design（docs/designs/commands/case-run.md）"
    source_items: [AG-008]
    content: |
      ### case-run が使用する検査ツール

      case-run が使用する検査ツール（[integrity-contracts.md](../integrity/integrity-contracts.md)「Workflow × 使用ツールマトリックス」参照）:

      - check_changed_docs.ts（--workflow case-run）: PR 対象ファイルに docs/** 変更を含む場合、委譲前に実行（[docs/** 変更時の targeted docs guard（REQ-031-011）](#docs-変更時の-targeted-docs-guardREQ-031-011) 参照）
      - check_integrity.ts（全体監査）: PR 対象ファイルに docs/** 変更を含む case では commit 前に full 実行し、base 既知違反と新規違反を分離して新規違反 0 件を確認する（「docs 変更を含む case での commit 前 full check_integrity 工程」参照）
      - check_extensions.ts（IR-056）: `src/common/commands/agentdev/**/*.md`, `src/common/skills/agentdev-*/SKILL.md`, `src/common/skills/agentdev-*/references/**/*.md`, `.agentdev/extensions/**` のいずれかを変更した場合に実行
      - test_strategy: Issue 完了条件検証（REQ-031-008/030）
      - textlint 品質基盤（用途選択入口）: 文章品質検査の起動は、工程スクリプトが正規契約から用途（書込み前検査、通常最終検査、必須独立検査、結果表示）を決定的に選択して入口を起動し、完結した結果（用途、対象範囲、対象状態、完了状態、合否、実規則実行数と再利用数を含む）を受理して進行を判定する。LLM が毎回の検査範囲・目的・再利用可否を選択しない。同じ判定を各呼出元で再実装しない

      case-run は check_integrity.ts（全体監査）を、docs 変更を含む case での commit 前検査として条件付きで使用する（base 既知違反と新規違反の分離、新規違反 0 件確認）。targeted docs guard（PR 単位の targeted 検査）は維持する。docs 変更を含まない case での全体監査は /repo/docs-check の責務である。

      ※上記は全て肯定表現である（REQ-010-002, REQ-010-003 準拠）。
  - id: ACT-DESIGN-005
    artifact: design
    operation: update
    target: docs/designs/commands/case-close.md
    target_area: "#### 保存済み検証証跡の解析と再実行条件の適用"
    canonical_owner: "case-close Design（docs/designs/commands/case-close.md）"
    source_items: [AG-005, AG-007]
    content: |
      #### 保存済み検証証跡の解析と再実行条件の適用

      - 検証結果の件数、失敗明細、サマリーの表示変更は、保存済み証跡（退避ファイル、PR 本文検証差分セクション、SSoT コメント）から行う。同一情報の取得だけを目的とした full suite や checker の再実行をしない（REQ-007-014）
      - 再実行の正当理由（変更後検証、環境変更、失敗由来分類、非決定的失敗の再現確認、必須独立検査、証跡欠落）と証跡の必須要素の正は agentdev-quality-gates Design「QG-4 検証証拠の再利用と再実行条件」が所有し、本 Design は再規定しない
      - close の最終検証（full integrity suite、配布物変更を含む case の3検査結果確認、QG-4 checker 実測）は origin/main 取り込み済み・マージ直前の branch HEAD で実行する既存契約を維持し、case-run の保存結果だけによる省略を行わない。verify-only closure の SSoT コメント参照判定も維持する
      - textlint 共通基盤によるファイル単位結果の再利用（同一性条件付きの規則実行省略）は検査基盤内部の実行形態であり、close の最終検査の実行義務の省略を構成しない。close の最終検査は対象全件の列挙・全文取得と現在入力との照合を伴う検査基盤の実行を毎回行い、その内部で同一性が機械検証できた対象の規則実行省略が許容される
  - id: ACT-DESIGN-006
    artifact: design
    operation: update
    target: docs/designs/local/runtime-package-boundary.md
    target_area: "### repo-local Plugin の配布・投影契約"
    canonical_owner: "実行時パッケージ境界（docs/designs/local/runtime-package-boundary.md）"
    source_items: [AG-004]
    content: |
      ### repo-local Plugin の配布・投影契約

      repo-local Plugin（REQ-002-045）の配布・投影については次のとおりである。

      - repo-local Plugin の原本配置原則は `src/opencode/plugins/<agentdev-name>/` 配下である。consumer 配布系全経路（`scripts/install.ps1`、`scripts/consumer/` 配下の archive installer、`scripts/self/release/package-release-archive.ps1`）は repo-local 配布除外を実装し、3ファイルの列挙条件を同期する義務を持つ。
      - `scripts/self-sync.ps1` は repo-local Plugin を除外しない（自己ホスト投影を維持する）。理由は、consumer 配布と自己ホスト投影が非対称であるためである。repo-local Plugin は REQ-052-006 により consumer への配布対象外である一方、自己ホスト環境では Plugin を利用可能にする必要がある。自己ホスト投影は canonical チェックアウト内部の source → projection 構成（`.opencode/plugins/` への junction と depth-1 loader shim 生成）であり、consumer への配布ではないため、配布除外機構の適用対象外である。
      - 除外機構の実現方式は明示的除外リスト等とする。REQ-002-011 の repo-* prefix 方式を plugin に採用しない（shim 名が repo-*.ts になり、stale shim 検出フィルタ等の波及修正が増えるため）。
      - textlint 検査基盤の保存済みファイル単位結果（実行時データ）は配布対象外とし、投影・同期の対象にも含めない。保存先、容量上限、寿命は品質基盤 Design（textlint-quality-runtime.md「ファイル単位結果の再利用と同一性条件」節）が所有する。

      配布境界 checker の repo-local モデル: 配布境界 checker は consumer 配布系と自己ホスト投影の非対称（上記のとおり）を repo-local モデルとして前提とする。detector の列挙条件（除外対象の検出箇所一覧）は repo-local Plugin の原本配置原則（`src/opencode/plugins/<agentdev-name>/`）と同期を維持し、列挙の乖離が観測された場合は個別特例の追加ではなく検査側の一般化で解消する方針とする。
      - 将来 repo-local Plugin が複数化した時点で、マーカー方式（package.json マーカーフィールド等）への拡張条件を判断する。

conflict_resolutions:
  - id: CR-001
    conflict: |-
      REQ-053-016（最終実ファイル再入力・再適用）と REQ-053-032（全件全文検査）は、通常最終検査での同一性条件付き規則実行省略と両立するか。append-only では「最終検査」の意味が暗黙に変更される懸念がある（RU-0161 は「『最終検査』の意味を暗黫に変更しない」ことを要求）。
    resolution: |-
      REQ-053-016/032 へ再利用との両立を明文する最小 UPDATE を採用し、新規行（REQ-053-041〜048）と合わせて意味変更を明示する。design 対応事前確認を実施済み（REQ-053-016: traceability/agentdev-textlint-guard.yaml、REQ-053-032: textlint-quality-runtime.md ADF-COVERS + 同 sidecar。いずれも対応が存在し欠落なし）。アーキテクチャ助言（Oracle）の条件付き推奨に基づく親判断。
  - id: CR-002
    conflict: |-
      結果再利用レジームと LLM から工程スクリプトへの用途判断移行は、既存 Decision（DEC-028、DEC-035、DEC-047、DEC-048）と衝突するか。Decision 作成に相当するか。
    resolution: |-
      Decision は作成しない。DEC-028（共通基盤・同一検査の再現性は同一性条件で維持）、DEC-035（Evidence/Gate 枠内の Gate predicate 詳細）、DEC-047（版固定が同一性条件の基盤）、DEC-048（決定的処理への移行は規定方向）の枠内変更であり、重複確認・禁止ゲート（仕様変更のみ・workflow 定義該当）を通過した。判断根拠を本 CR に記録する。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0161
    target_req: REQ-053
    target_design: docs/designs/quality/textlint-quality-runtime.md
    operation: append
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: single

result: {}

test_strategy:
  - id: TS-001
    target_item: AG-010
    verification: |-
      固定入力（同一対象集合・同一規則・同一辞書）で、再利用なし実行と再利用あり実行、逐次実行とワーカー並列実行をそれぞれ複数回実行し、指摘本文・ファイル・位置・重大度・合否を比較する。
    pass_criteria: |-
      全比較で指摘本文、ファイル、位置、重大度、合否が一致し、集約結果の並び順が安定する。29規則と対象範囲が維持される。正常完了した不合格結果の再利用も確認できる。
    on_failure: |-
      fix-and-reverify: 品質不一致は実装不良に起因するため修正して再検証する。
  - id: TS-002
    target_item: AG-002
    verification: |-
      本文の同サイズ置換・更新時刻保持、パス変更、規則・設定変更、エンジン・依存成果物変更、標準・プロジェクト辞書と間接 import 変更の各試験を実施し、影響する保存結果が再利用されないことを確認する。
    pass_criteria: |-
      各変更が検出され、影響する結果の再利用が行われない。追跡不能な条件では実検査へ戻る。
    on_failure: |-
      fix-and-reverify: 同一性判定の実装不良に起因するため修正して再検証する。
  - id: TS-003
    target_item: AG-001
    verification: |-
      追加・削除・未追跡ファイル・外部編集・対象設定変更の試験で現在の全件結果への反映を確認する。同一入力再実行で規則実行数がゼロとなること、一部本文変更では変更した対象だけ規則実行・追加対象は実検査・削除対象は集約から除去されることを確認する。対象0件の不合格条件の維持を確認する。
    pass_criteria: |-
      変更一覧のみを根拠とした検査省略がなく、全件確認が省略されない。
    on_failure: |-
      fix-and-reverify: 全件反映の実装不良に起因するため修正して再検証する。
  - id: TS-004
    target_item: AG-003
    verification: |-
      保存結果の欠落・破損・途中書込み・保存失敗・容量上限到達と、プロジェクト・worktree 間の誤流用を試験する。必須エンジン・辞書欠落時の挙動も確認する。異常終了・タイムアウト・不完全結果の再利用禁止を確認する。
    pass_criteria: |-
      利用不能な保存結果は実検査へ戻り、実検査不能なら合格とならない。必須エンジン・辞書の欠落を保存済み合格で隠さない。異常終了・タイムアウト・不完全結果が正常結果として再利用されない。
    on_failure: |-
      fix-and-reverify: 保存・復帰の実装不良に起因するため修正して再検証する。
  - id: TS-005
    target_item: AG-005
    verification: |-
      必須独立検査で再利用数ゼロ・対象全件の規則実行を確認する。実工程の独立要求に通常結果を渡す異常系で進行拒否、正しい独立結果の正常系で進行許可を確認する。初期化共有が独立性違反扱いとならないことを確認する。
    pass_criteria: |-
      再利用数ゼロで全件実行され、異常系で進行が拒否され、正常系で進行が許可される。
    on_failure: |-
      fix-and-reverify: 用途分離の実装不良に起因するため修正して再検証する。
  - id: TS-006
    target_item: AG-008
    verification: |-
      実際の工程スクリプト（case-run / case-close 等の担当スクリプト）から用途決定、入口の起動、結果の完全消費、進行判定までの接続を検証する。不合格、未完了、欠落、不完全出力、不適切な用途の結果で進行が停止すること、同じ経路の正常系で進行することを確認する。結果の再表示・再解析だけでは検査が起動しないことを確認する。
    pass_criteria: |-
      試験専用模擬判定だけでなく実経路で接続されている。用途・対象範囲・対象状態・完了状態・合否が機械的に確認できる。
    on_failure: |-
      fix-and-reverify: 工程接続の実装不良に起因するため修正して再検証する。
  - id: TS-007
    target_item: AG-007
    verification: |-
      検査中に対象の追加・削除、本文変更、辞書・規則・設定変更を行う試験を実施する。
    pass_criteria: |-
      異時点の結果を混ぜて合格とならず、未完了・未確定として工程受理が拒否され、変更後の正常な再検査で受理できる。
    on_failure: |-
      fix-and-reverify: 照合の実装不良に起因するため修正して再検証する。
  - id: TS-008
    target_item: AG-009
    verification: |-
      ワーカー上限を超えない CPU 規則処理の並列実行、ワーカー異常・タイムアウト時の対象欠落なし、正常結果の一致と異常時の進行拒否を確認する。複数ゲート同時実行時の上限・メモリ・完結性を評価する。
    pass_criteria: |-
      上限内で CPU 並列実行され、ワーカー異常時も未検査対象が欠落しない。複数ゲート同時実行で上限・メモリ・完結性が維持される。
    on_failure: |-
      fix-and-reverify: 並列実行の実装不良に起因するため修正して再検証する。
  - id: TS-009
    target_item: AG-010
    verification: |-
      固定した入力・規則・依存・計測条件で複数回測定し、処理数、時間、並列度、メモリ、単独・同時実行条件を記録する（単独実行と複数ゲート同時実行を分離して計測する）。
    pass_criteria: |-
      通常再利用が再利用なしより短縮し、全件実計算のワーカー並列が逐次より短縮する。品質不一致や測定変動だけを短縮成功としない。未測定の短縮倍率・並列度を保証しない。
    on_failure: |-
      fix-and-reverify: 未達の場合は上限・実装を見直して再検証する。環境変動に起因する場合は測定条件を整えて再計測する。
  - id: TS-010
    target_item: AG-006
    verification: |-
      書込み前検査が対象の完成予定全文を検査すること、最終検査で実ファイルを取得すること、書込み前合格の単純継承で最終合格とならないことを確認する。
    pass_criteria: |-
      書込み前検査が最終実ファイル確認の代替になっていない。結果の再表示・再解析だけで検査起動扱いになっていない。
    on_failure: |-
      fix-and-reverify: 用途分離の実装不良に起因するため修正して再検証する。
  - id: TS-011
    target_item: AG-004
    verification: |-
      REQ-053-016/032 更新、textlint-quality-runtime・agentdev-quality-gates・case-run・case-close・runtime-package-boundary の各 Design、配布設定・関連参照資料（plugin README を含む修正対象ファイル集合）の整合を確認する。修正対象ファイル集合に限定して全文再出力要求・用途判断の LLM 残存等の古い指示を検索する（See Also 等の参照行は検出対象外とする）。
    pass_criteria: |-
      全件確認を維持した再利用の許容と独立検査の禁止が要件と Design で明示され、古い指示や文書のみの用途判断が残らない。
    on_failure: |-
      fix-and-reverify: 文書整合の不備に起因するため修正して再検証する。

realization_actions:
  - id: RA-001
    concern: textlint 検査基盤（plugin）への結果保存・同一性判定・並列化・用途入口の実装
    responsibility: |-
      src/opencode/plugins/agentdev-textlint-guard/ の gate.ts、lib/inspect.ts、および入力・規則・依存・結果を扱う共通処理に、ファイル単位結果の保存・同一性判定（本文・規則・設定・エンジン・依存・辞書・正規化版を含む）、保存結果と実検査結果の集約、開始・終了時照合、上限付きワーカーによる CPU 並列実行、用途別入口（書込み前検査、通常最終検査、必須独立検査、結果表示）と機械確認可能な結果形式を実装する。関連テストを整備する。規則・対象範囲・合否条件は変更しない。
    ownership_hints:
      - "src/opencode/plugins/agentdev-textlint-guard/gate.ts"
      - "src/opencode/plugins/agentdev-textlint-guard/lib/inspect.ts"
      - "src/opencode/plugins/agentdev-textlint-guard/lib/（入力・規則・依存・結果を扱う共通処理）"
      - "src/opencode/plugins/agentdev-textlint-guard/ 配下の関連テスト"
    intent: |-
      品質を維持した全件確認と再計算の分離、通常結果再利用、必須独立検査の全件実計算、上限付きワーカー並列化を実現する。
    verification_refs: [TS-001, TS-002, TS-003, TS-004, TS-005, TS-007, TS-008, TS-010]
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007, AG-009, AG-010]
  - id: RA-002
    concern: 工程スクリプトからの実起動・結果受理・進行判定の接続
    responsibility: |-
      case-run・case-close 等の既存の担当スクリプトへ、正規契約から用途・対象状態・独立性要求を決定し入口を起動し、完結した結果を受理して進行を判定する接続を追加する。同じ判定を各呼出元で再実装しない。
    ownership_hints:
      - "docs/designs/commands/case-run.md「case-run が使用する検査ツール」（Design 更新対象）"
      - "docs/designs/commands/case-close.md「保存済み検証証跡の解析と再実行条件の適用」（Design 更新対象）"
      - "case-run / case-close の担当スクリプト（実装接続先。case-open の execution contract から特定）"
    intent: |-
      工程からの実起動、結果受理、進行判定までを一つの変更単位として接続し、LLM による検査目的・再実行・結果再利用の都度判断を減らす。
    verification_refs: [TS-006, TS-011]
    source_items: [AG-008]
  - id: RA-003
    concern: 配布設定と関連参照資料の整合
    responsibility: |-
      plugin の配布設定（保存済み結果の実行時データ扱い、配布・投影対象外）と関連参照資料（plugin README 等）を今回の変更範囲に含めて整合させる。
    ownership_hints:
      - "src/opencode/plugins/agentdev-textlint-guard/package.json（配布設定）"
      - "src/opencode/plugins/agentdev-textlint-guard/README.md"
      - "docs/designs/local/runtime-package-boundary.md「repo-local Plugin の配布・投影契約」（Design 更新対象）"
    intent: |-
      保存結果を実行時データとして配布境界と整合させ、配布設定と参照資料を変更範囲から落とさない。
    verification_refs: [TS-011]
    source_items: [AG-004]

case_open_hints:
  epic_needed: false
  decomposition: "単一 Issue で実装。内部作業順序の参考: (1) 同一性・保存基盤と結果集約、(2) 用途入口とワーカー並列、(3) 工程スクリプト接続、(4) Design・配布設定・参照資料の整合、(5) 品質一致比較と性能計測。RU-0161 は一つの変更単位として合意済み（工程接続を含む）。"
  wave_hints: []
```

# summary

RU-0161（収束済み検討由来）を要件化した。REQ-053 へ新規8行（041〜048）を APPEND し、REQ-053-016/032 に再利用との両立を明文する最小 UPDATE を行う。Design は textlint-quality-runtime.md（最終検査セクション更新+新規セクション追記）を主対象に、agentdev-quality-gates（QG-4 境界明確化）、case-run（検査ツール接続）、case-close（証跡解析境界）、runtime-package-boundary（実行時データの配布扱い）を更新する。実装面は plugin（gate.ts、lib、共通処理、テスト）と工程スクリプト接続（RA-001〜003）。Decision は不要（CR-002 記録のとおり DEC-028/035/047/048 枠内）。改善後の短縮率・並列度・保存形式の詳細は Design・実装で確定し、未測定の倍率を保証しない。
