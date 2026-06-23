---
draft_type: req_draft
topic_slug: overridable-gh-cli-procedure
status: saved
spec_saved: true
spec_saved_at: 2026-06-23T20:24:00+09:00
created_at: 2026-06-23T19:30:00+09:00
source_rus:
  - RU-20260623-01-overridable-gh-cli-procedure
---

# draft-data

```yaml
work_type: feature

scale: large

summary: >
  AgentDevFlow の既存 command/skill が GitHub CLI（gh）コマンドを直接記述している問題を解消し、
  agentdev-gh-cli skill の手続き委譲へ集約する。併せて、ローカル版 OpenCode の導入方式を
  「直接生成（generate-and-place）」から「link mode + agentdev-gh-cli 差し替え」へ転換する。
  これにより、通常版とローカル版で command/skill 全体を分岐させず、agentdev-gh-cli の差し替え
  だけで済む構成にする。本要件は4つの操作単位（OU）に分割し、2本の新規ADR（ADR-0126 supersede
  含む）でアーキテクチャ判断を記録する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: >
      agentdev-gh-cli は GitHub 操作の既定実装として残す。各 command/skill は gh コマンドを
      直接記述せず、agentdev-gh-cli の手続きへ委譲する。
  - id: AG-002
    content: >
      ローカル版では agentdev-gh-cli を上書きし、標準版と同一の手続き名で Issue/PR 相当の
      読み書きを .agentdev/cases/case-{NNNN}.md へ読み替える。
  - id: AG-003
    content: >
      これは GitHub 非依存の抽象 backend 新設ではなく、GitHub 前提の gh-cli 手続き化と
      上書き可能化である。バックエンド抽象化および GitHub 互換ローカルサーバは導入しない。
  - id: AG-004
    content: >
      PR がないローカル版では、PR 関連操作を単純にスキップせず、PR 本文・PR 作成済み状態・
      merge 結果に相当する情報をローカル Case ファイル内の対応セクションへ読み替える。
  - id: AG-005
    content: >
      agentdev-gh-cli は I/O 手続きと VERIFY を担当し、本文生成・完了判定・Epic 依存判定・
      capture 分類は担当しない。agentdev-gh-cli は薄いルーティング入口とし、操作契約と
      標準版手順を references に分離する。
  - id: AG-006
    content: >
      local 版は専用の agentdev-gh-cli を用意し、別名スキルとして参照させず、上位 command/skill
      は常に agentdev-gh-cli のみを参照する。local-override-mapping.md は作成しない。
  - id: AG-007
    content: >
      src/opencode-local/agentdev-gh-cli/ は local 版 agentdev-gh-cli の原本とする。
      src/opencode-local/skills/ は作成しない。runtime-overrides/ は設けない。
  - id: AG-008
    content: >
      case-schema/ は local 版 agentdev-gh-cli 配下の操作用定義に吸収する。Case ファイル仕様の
      正本は docs/specs に置く（local 版 agentdev-gh-cli 配下の case schema は正本ではなく
      操作用定義）。
  - id: AG-009
    content: >
      通常版とローカル版の両方を link mode に寄せる。通常版では .opencode/commands/agentdev/
      および .opencode/skills/agentdev-*/ を src/opencode/ 配下へ接続する。
  - id: AG-010
    content: >
      ローカル版では agentdev-gh-cli 以外の command/skill を src/opencode/ 配下へ接続し、
      .opencode/skills/agentdev-gh-cli/ だけを src/opencode-local/agentdev-gh-cli/ へ接続する。
  - id: AG-011
    content: >
      transform/ と generation-flow.md は、ローカル版全体生成をやめるなら廃止候補とする。
      generated_by 識別子は link mode では主制御にしない。
  - id: AG-012
    content: >
      .opencode/ 実パス確認は、link mode を一律停止するのではなく、意図した link target か
      どうかを確認する方式へ見直す。
  - id: AG-013
    content: >
      ローカル版の主価値は、ローカル対応だけでなく、本体側の GitHub I/O 責務分離を進める点にも
      ある。GitHub CLI の実行手順を一箇所に集約し、Windows/PowerShell/文字化け/一時ファイル/
      --body-file/VERIFY の扱いを各 command から排除する。

artifact_actions:
  # === REQ 操作 ===

  - id: ACT-REQ-001
    artifact: req
    operation: create
    target: REQ-0149
    source_items: [AG-001, AG-005, AG-013]
    content: |
      新規 REQ: agentdev-gh-cli 手続き委譲基盤

      目的: command/skill が GitHub CLI（gh）を直接記述せず agentdev-gh-cli 手続きへ委譲する
      責務境界を確立し、GitHub I/O 操作を一箇所に集約する。

      要件（変更後仕様）:
      - GitHub Issue/PR 操作を行う command/skill は、gh コマンドを直接記述せず、agentdev-gh-cli
        の手続きへ委譲すること。
      - agentdev-gh-cli は、Issue 作成・Issue 本文読込・Issue 本文更新・Issue コメント追加・
        PR 本文読込・PR merge・Issue close・VERIFY に相当する手続きを提供すること。
      - 標準版の agentdev-gh-cli は、各手続きの既定実装として gh コマンドを実行すること。
      - agentdev-gh-cli は I/O 手続きと VERIFY を担当し、本文生成・完了判定・Epic 依存判定・
        capture 分類を担当しないこと。
      - agentdev-gh-cli は薄いルーティング入口とし、操作契約と標準版手順を references に
        分離すること。
      - command は workflow 順序・停止条件・完了判定を担当し、GitHub CLI の具体的フラグ・
        一時ファイル・エンコーディング対策・再読込 VERIFY を直接記述しないこと。
      - domain skill は本文生成・完了条件評価・Epic 表解析・capture 分類等の意味処理を担当し、
        GitHub CLI の具体操作を直接記述しないこと。
      - GitHub 版の既存 workflow は、agentdev-gh-cli 委譲後も従来と同等の Issue/PR 操作結果を
        維持すること。

      適用範囲:
      - 対象: agentdev-gh-cli の責務境界・手続き委譲規律・command/skill の I/O 責務分離
      - 対象外: agentdev-gh-cli の具体的な手続き名一覧・引数・戻り値（SPEC）。
        ローカル版 agentdev-gh-cli の実装（OU-002）。link mode の導入方式（OU-003）。

      備考: REQ-0103-078（4コマンドが agentdev-gh-cli を load）と整合する。
      REQ-0103-078 は load 関係の宣言として REQ-0103 に残し、本 REQ で責務境界を新たに定義する。

  - id: ACT-REQ-002
    artifact: req
    operation: create
    target: REQ-0150
    source_items: [AG-002, AG-003, AG-004, AG-006, AG-007, AG-008]
    content: |
      新規 REQ: ローカル版 agentdev-gh-cli 実装

      目的: ローカル版で agentdev-gh-cli を上書きし、同一手続き名で Case ファイル読み書きへ
      読み替えることで、command/skill の分岐なしにローカル運用を可能にする。

      要件（変更後仕様）:
      - ローカル版の agentdev-gh-cli は、標準版と同一の手続き名を提供し、Issue/PR 相当の
        読み書きを .agentdev/cases/case-{NNNN}.md に読み替えること。
      - ローカル版では、PR 関連手続きを単純にスキップせず、PR 本文・PR 作成済み状態・
        merge 結果に相当する情報を Case ファイル上の対応セクションから読み書きできること。
      - local 版 agentdev-gh-cli は別名スキルとせず、上位 command/skill は常に
        agentdev-gh-cli のみを参照すること。
      - src/opencode-local/agentdev-gh-cli/ を local 版 agentdev-gh-cli の原本とすること。
      - src/opencode-local/skills/ は作成しないこと。
      - case-schema/ は local 版 agentdev-gh-cli 配下の操作用定義に吸収すること。
      - Case ファイル仕様の正本は docs/specs に置くこと（local 版 agentdev-gh-cli 配下の
        case schema は正本ではなく操作用定義）。
      - GitHub 非依存の抽象 backend 新設は行わないこと（GitHub 前提の gh-cli 手続き化と
        上書き可能化であること）。

      適用範囲:
      - 対象: ローカル版 agentdev-gh-cli の位置づけ・手続き契約・Case ファイル対応づけ・
        case-schema 吸収
      - 対象外: Case ファイルの詳細スキーマ（SPEC local-case-file.md）。
        手続き名と Case ファイルセクションの対応表（SPEC）。
        link mode の接続方式（OU-003）。

  - id: ACT-REQ-003
    artifact: req
    operation: append
    target: REQ-0134
    source_items: [AG-009, AG-010, AG-011, AG-012]
    content: |
      REQ-0134（配布基盤）への APPEND: link mode 導入

      追加要件（REQ-0134 の要件テーブルへ追記）:
      - 通常版とローカル版は、.opencode/ 配下を仕様管理リポジトリへ接続する link mode を
        利用すること。
      - 通常版では、.opencode/commands/agentdev/ および .opencode/skills/agentdev-*/ を
        src/opencode/ 配下へ接続すること。
      - ローカル版では、agentdev-gh-cli 以外の command/skill を src/opencode/ 配下へ接続し、
        .opencode/skills/agentdev-gh-cli/ だけを src/opencode-local/agentdev-gh-cli/ へ
        接続すること。
      - runtime-overrides/ は設けないこと。
      - .opencode/ 実パス確認は、link mode を一律停止するのではなく、意図した link target か
        どうかを確認する方式とすること。

      備考: link mode 採用のアーキテクチャ判断は ADR（ADR-0131）で記録する。
      REQ-0134 は要件宣言を扱い、接続手順の技術詳細は SPEC（runtime-package-boundary.md）へ配置する。

  - id: ACT-REQ-004
    artifact: req
    operation: update
    target: REQ-0141
    source_items: [AG-002, AG-007, AG-008, AG-009, AG-010, AG-011, AG-012]
    content: |
      REQ-0141（ローカル版 OpenCode 生成方式とローカル Case ファイル運用）の UPDATE:
      link mode 前提への再構成

      UPDATE 対象要件行と書き換え内容:
      - REQ-0141-004: src/opencode-local/ のディレクトリ構成を link mode 前提に変更。
        README.md と agentdev-gh-cli/ を中心とし、case-schema/ は agentdev-gh-cli 配下へ吸収。
        transform/ と generation-flow.md は廃止候補とする。
      - REQ-0141-007: 直接生成 → link mode（.opencode/ 配下を src 配下へ接続）に変更。
      - REQ-0141-008: 生成物をリポジトリ管理対象外 → link による接続に変更。
      - REQ-0141-010: .opencode/ 実パス確認で停止 → 意図した link target か確認する方式に変更。
        link mode を一律停止せず、link target が意図したものであれば許可する。
      - REQ-0141-011: 生成物に generated_by 識別情報を持たせる → link mode では主制御にしない。
        link による接続のため上書き問題が発生しない。
      - REQ-0141-012: generated_by 識別情報がある場合のみ再生成・上書き許可 → link mode では
        unlink/relink による更新に変更。
      - REQ-0141-013: 識別情報不在時の生成停止 → link target 不正時の停止に変更。
      - REQ-0141-031: src/opencode-local/README.md の実行手順 → link 設定手順に変更。
      - REQ-0141-032: AI エージェントによる変換プロンプト実行 → 廃止（link mode では不要）。
      - REQ-0141-033: 全削除再生成 → unlink/relink による更新に変更。

      維持要件行（変更なし）:
      - REQ-0141-001, 002: ローカル版の位置づけ・リポジトリ分離
      - REQ-0141-016-020: Case ファイル運用（配置・スキーマ・status・labels・見出し）
      - REQ-0141-021-026: コマンド置換（case-open/run/close のローカル版動作）
      - REQ-0141-027: バックエンド抽象化・GitHub 互換ローカルサーバ不導入
      - REQ-0141-029: 残存 GitHub 固有参照の違反判定基準

      備考: 本 UPDATE は ADR-0126 supersede（ADR-0131）に基づく。
      ADR 確定後に REQ-0141 を書き換える。

  # === ADR 操作 ===

  - id: ACT-ADR-001
    artifact: adr
    operation: create
    target: ADR-0130
    source_items: [AG-001, AG-002, AG-003, AG-005, AG-006]
    content: |
      新規 ADR: agentdev-gh-cli を差し替え可能な I/O 境界として確立

      背景:
      既存の command/skill は GitHub CLI（gh）コマンドを直接記述しており、Windows/PowerShell/
      エンコーディング/--body-file/VERIFY の扱いが各ファイルに分散している。ローカル版で
      GitHub Issue/PR を使わない場合、この直接記述が差し替えの障害となる。

      決定:
      1. command/skill は gh コマンドを直接記述せず、agentdev-gh-cli の手続きへ委譲する。
      2. agentdev-gh-cli は I/O 手続きと VERIFY を担当する中央集権的な I/O 境界である。
         本文生成・完了判定・Epic 依存判定・capture 分類は担当しない。
      3. agentdev-gh-cli は薄いルーティング入口とし、操作契約と標準版手順を references に分離する。
      4. ローカル版は agentdev-gh-cli を src/opencode-local/agentdev-gh-cli/ で差し替え可能とする。
         上位 command/skill は常に agentdev-gh-cli のみを参照し、別名スキルを参照させない。
      5. ローカル版は同一手続き名で Issue/PR 相当の読み書きを Case ファイルへ読み替える。
         PR 関連操作をスキップせず、Case ファイルの対応セクションで代替する。
      6. GitHub 非依存の抽象 backend は新設せず、GitHub 前提の gh-cli 手続き化と上書き可能化とする。

      結果・影響:
      - 正: GitHub I/O が一箇所に集約され、command は workflow に、skill は意味処理に集中できる。
        ローカル版は agentdev-gh-cli 差し替えだけで対応できる。
      - 負: 全 command/skill の gh 直接記述を委譲へ書き換える移行コストが発生する。
        agentdev-gh-cli の責務が拡大し、SPEC の全面改訂が必要。

      関係:
      - relates-to: ADR-0107（コマンド・スキル・テンプレート・スクリプト責任分界）
      - relates-to: ADR-0112（サブエージェント委譲の一般化）
      - relates-to: ADR-0126（ローカル版 OpenCode 生成基盤）

      判断根拠:
      差し替え可能な I/O 境界の確立は、将来のコマンド追加時も縛る制約であり、「将来の設計・
      運用・文書システムを制約する決定」に該当する。ADR-0107/0112 の適用・具体化であるが、
      新規の責務境界（全 gh I/O の集約・担当/非担当宣言・差し替え可能性）を確立するため
      例外として ADR を認める。

  - id: ACT-ADR-002
    artifact: adr
    operation: create
    target: ADR-0131
    source_items: [AG-009, AG-010, AG-011, AG-012]
    content: |
      新規 ADR: ローカル版導入方式を link mode へ統一し生成方式を廃止

      背景:
      ADR-0126 は src/opencode-local/ を生成時ソース領域とし、AI エージェントが変換プロンプト
      に従ってローカル版を直接生成する方式（generate-and-place）を採用した。しかし、
      agentdev-gh-cli を差し替え可能な I/O 境界として確立（新規ADR）すれば、ローカル版は
      command/skill 全体を生成せず、agentdev-gh-cli の link 先だけを差し替えれば済む。

      決定:
      1. 通常版とローカル版の両方を link mode（.opencode/ 配下を src 配下へ接続）に統一する。
      2. 通常版では .opencode/commands/agentdev/ と .opencode/skills/agentdev-*/ を
         src/opencode/ 配下へ接続する。
      3. ローカル版では agentdev-gh-cli 以外を src/opencode/ 配下へ接続し、
         .opencode/skills/agentdev-gh-cli/ だけを src/opencode-local/agentdev-gh-cli/ へ接続する。
      4. ローカル版全体生成（transform/generate.md による変換プロンプト実行）を廃止する。
         transform/ と generation-flow.md は廃止候補とする。
      5. generated_by 識別子による上書き保護（ADR-0126 decision #2）は廃止する。
         link による接続のため上書き問題が発生しない。
      6. .opencode/ 実パス確認は、ジャンクション環境での一律停止（ADR-0126 decision #3）から、
         意図した link target かどうかを確認する方式へ見直す。
      7. src/opencode/ は GitHub 版専用原本（ADR-0126 decision #4）という不変量は維持する。
         ローカル版は src/opencode/ を変更せず、agentdev-gh-cli のみ src/opencode-local/ から接続する。

      結果・影響:
      - 正: 通常版とローカル版の導入方式が統一される。変換プロンプトの品質検証が不要になる。
        agentdev-gh-cli 差し替えだけでローカル版が構成できる。
      - 負: 変換プロンプト資産（transform/generate.md, review.md）が不要になる。
        runtime-package-boundary.md の consumer-generated 定義を更新する必要がある。

      関係:
      - supersedes: ADR-0126（ローカル版 OpenCode 生成基盤: source model 拡張と生成安全性制約）
      - relates-to: ADR-0105（OpenCode ソース・プロジェクション分離）

      判断根拠:
      ADR-0126 の決定 #1〜#4 を根本的に覆す変更であり、UPDATE ではなく supersede が適切。
      ローカル版導入方式の根本転換は「将来の設計・運用・文書システムを制約する決定」であり、
      ADR で判断根拠を残さないと、なぜ生成方式を捨てたかの履歴が失われる。

  # === SPEC 操作 ===

  - id: ACT-SPEC-001
    artifact: spec
    operation: update
    target: docs/specs/skills/agentdev-gh-cli.md
    source_items: [AG-001, AG-005]
    content: |
      agentdev-gh-cli SPEC の全面改訂: I/O hub + 操作契約 + references 分離

      現状（Windows PowerShell 環境での gh CLI 安全使用）から以下へ全面改訂:
      - 責務定義: I/O 手続きと VERIFY の中央集権的ハブ。本文生成・完了判定等は非担当。
      - 操作契約: Issue 作成・Issue 本文読込・Issue 本文更新・Issue コメント追加・
        PR 本文読込・PR merge・Issue close・VERIFY の各手続き定義。
      - 薄いルーティング入口 + references 分離: SKILL.md はルーティング入口とし、
        操作契約・標準版手順・VERIFY 観点・リトライロジックは references に分離。
      - 差し替え可能性: ローカル版が同一手続き名で Case ファイル読み書きへ読み替えるための
        契約を明示。

      分離根拠: 責務境界の宣言は REQ（REQ-0149）、操作手順の詳細は SPEC。

  - id: ACT-SPEC-002
    artifact: spec
    operation: update
    target: docs/specs/local-generation.md
    source_items: [AG-009, AG-010, AG-011, AG-012]
    content: |
      local-generation SPEC の改訂: link mode 前提への再構成

      現状（ローカル版生成フロー・generated_by 識別子・ジャンクション検出安全ゲート）から
      以下へ改訂:
      - 生成フロー → link mode 接続フローへ全面書き換え。
      - generated_by 識別子による上書き保護 → 廃止（link による接続のため不要）。
      - ジャンクション検出安全ゲート → link target 確認方式へ見直し。
      - ひな形変換方針・相対参照構造維持ルール → link mode では原本がそのまま接続されるため不要。
      - 更新運用（全削除再生成）→ unlink/relink による更新へ変更。
      - ガードレール一覧 → link mode 前提に再構成。

      分離根拠: link mode 採用の宣言は REQ-0134 APPEND、導入方式の詳細仕様は SPEC。

  - id: ACT-SPEC-003
    artifact: spec
    operation: update
    target: docs/specs/local-transform.md
    source_items: [AG-011]
    content: |
      local-transform SPEC の改訂: 変換プロンプト要件の廃止・整理

      ローカル版全体生成を廃止するため、transform/generate.md・review.md・spec.md の要件を
      廃止または縮小する。link mode では原本がそのまま接続されるため、変換プロンプトは不要。
      変換品質検証（REQ-0141-029 残存 GitHub 固有参照の違反判定）も、agentdev-gh-cli 差し替え版の
      品質検証（gh I/O と Case ファイル I/O の契約一致）へ読み替える。

      分離根拠: 変換方式の廃止は ADR（ADR-0131）で判断、詳細SPECは本SPEC。

  - id: ACT-SPEC-004
    artifact: spec
    operation: update
    target: docs/specs/local-case-file.md
    source_items: [AG-008]
    content: |
      local-case-file SPEC の改訂: case-schema 吸収に伴う参照更新

      case-schema/ が local 版 agentdev-gh-cli 配下の操作用定義に吸収されるため、
      local-case-file.md から case-schema/rules/ への参照を更新する。
      Case ファイル仕様の正本は docs/specs/local-case-file.md のままであり、
      local 版 agentdev-gh-cli 配下の case schema は操作用定義（正本ではない）と明記する。

      分離根拠: Case ファイル仕様の正本は本 SPEC、操作用定義の詳細は agentdev-gh-cli references。

  - id: ACT-SPEC-005
    artifact: spec
    operation: update
    target: docs/specs/runtime-package-boundary.md
    source_items: [AG-009, AG-010]
    content: |
      runtime-package-boundary SPEC の改訂: consumer-generated 定義の link mode 化

      consumer-generated リポジトリ種別の定義を「生成された実ディレクトリ（非ジャンクション）」
      から「link mode（agentdev-gh-cli のみ src/opencode-local/ から接続）」へ更新する。
      リポジトリ種別判定基準も link mode 前提に更新する。

      分離根拠: リポジトリ種別の宣言は REQ-0134、導入方式の技術詳細は SPEC。

conflict_resolutions:
  - id: CR-001
    conflict: >
      ADR-0126（ローカル版 OpenCode 生成基盤）の決定 #1〜#4 と、link mode + agentdev-gh-cli
      差し替え方式が正面衝突する。ADR-0126 は「直接生成方式・generated_by 上書き保護・
      ジャンクション環境停止・src/opencode/ 専用原本」を不変量として宣言している。
    resolution: >
      ADR-0126 を supersede する新規 ADR（ADR-0131）で判断根拠を記録する。
      supersede により ADR-0126 の決定を覆すことを明示し、履歴を保持する。
      REQ-0141 の UPDATE は ADR 確定後に実施する。ユーザー合意済み（2本分割承認）。

  - id: CR-002
    conflict: >
      REQ-0103-078（4コマンドが agentdev-gh-cli を load）と、OU-001 の新規REQ（12ファイル委譲）
      が重複する可能性。
    resolution: >
      REQ-0103-078 は load 関係の宣言として REQ-0103 に残し、新規REQ（REQ-0149）
      で責務境界（I/O hub 化・担当/非担当・12ファイル委譲）を定義する。REQ-0103 の肥大化（84行, +2シグナル）
      を避けるため、全てを REQ-0103 に詰め込まない。oracle 推奨 + ユーザー合意済み。

  - id: CR-003
    conflict: >
      req-define 時点の auto_gate.auto_ready: false の根拠（scale large/Epic 規模・ADR 作成必須）。
      case-auto が Step 3 auto_gate preflight で停止する。
    resolution: >
      ユーザー明示的承認により auto_ready を true に更新。理由: (1) scale large/Epic 規模は
      case-auto Step 4-1（Wave 反復制御）が明示的にサポートしており、ブロック理由ではない。
      (2) ADR ファイル作成（ADR-0130/0131）は req-save で完了済み（commit feb3ed6 push 済み）。
      両 stop_reason とも解消済みまたは非ブロック要因である。

operation_units:
  - ou_id: OU-001
    source_ru: RU-20260623-01-overridable-gh-cli-procedure
    target_req: REQ-0149
    operation: create
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {saved_req: REQ-0149, saved_adr: ADR-0130}

  - ou_id: OU-002
    source_ru: RU-20260623-01-overridable-gh-cli-procedure
    target_req: REQ-0150
    operation: create
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    result: {saved_req: REQ-0150}

  - ou_id: OU-003
    source_ru: RU-20260623-01-overridable-gh-cli-procedure
    target_req: REQ-0134
    operation: append
    scale: standard
    depends_on: [OU-002]
    recommended_order: 3
    issue_policy: single
    result: {appended_req: REQ-0134}

  - ou_id: OU-004
    source_ru: RU-20260623-01-overridable-gh-cli-procedure
    target_req: REQ-0141
    operation: update
    scale: large
    depends_on: [OU-003]
    recommended_order: 4
    issue_policy: single
    result: {updated_req: REQ-0141}

case_open_hints:
  epic_needed: true
  decomposition: >
    4 OU を技術的依存に基づき Wave 構成で分解。
    Wave 1: OU-001（gh-cli 委譲基盤・新規REQ + 新規ADR + SPEC改訂）
    Wave 2: OU-002（ローカル版 gh-cli・新規REQ・OU-001 に依存）
    Wave 3: OU-003（link mode 導入・REQ-0134 APPEND・OU-002 に依存）
    Wave 4: OU-004（REQ-0141 再構成・ADR-0126 supersede・OU-003 に依存）
    OU-001 は12ファイルの委譲書き換えを含むため大規模。
    OU-004 は REQ-0141 の10行超の UPDATE を含む。
  wave_hints:
    - "Wave 1: OU-001（基盤。agentdev-gh-cli SPEC 改訂 + 12ファイル委譲 + 新規REQ + 新規ADR-1）"
    - "Wave 2: OU-002（ローカル版。src/opencode-local/agentdev-gh-cli/ 構成 + 新規REQ）"
    - "Wave 3: OU-003（link mode。REQ-0134 APPEND + runtime-package-boundary SPEC 改訂 + 新規ADR-2）"
    - "Wave 4: OU-004（REQ-0141 再構成。ADR-0126 supersede 確定後。local-generation/transform/case-file SPEC 改訂）"
```

# summary

本要件は、AgentDevFlow 本体の GitHub I/O 責務境界を整理する要件である。

既存の command/skill が GitHub CLI（gh）を直接記述している問題を解消し、agentdev-gh-cli skill の手続き委譲へ集約する。併せて、ローカル版 OpenCode の導入方式を「直接生成」から「link mode + agentdev-gh-cli 差し替え」へ転換する。これにより、通常版とローカル版で command/skill 全体を分岐させず、agentdev-gh-cli の差し替えだけで済む構成にする。

本要件は4つの操作単位（OU）に分割する。SPLIT シグナル計測（+4）に基づき分割を推奨し、ユーザー合意済みである。2本の新規ADR（ADR-0130 / ADR-0131）でアーキテクチャ判断を記録し、ADR-0126 を supersede する。

実装詳細（12ファイルの委譲対象箇所）は以下の通り。これは case-run の作業記録で扱い、要件行には混入させない。

## 実装詳細: gh コマンド直接記述箇所（委譲対象12ファイル）

### Command ファイル（5件）
- case-open.md: 行84, 88, 110（gh issue create, --body-file）
- case-close.md: 行39, 42, 43, 51, 61, 65, 73, 103, 115, 119, 138（gh pr merge, gh issue close, gh pr view）
- case-update.md: 行32, 60（gh issue edit）
- case-run.md: 行138（禁止規定内の参照）
- intake-from-github.md: 行111（gh CLI）

### Skill ファイル（7件）
- agentdev-case-run-execution-adapter/SKILL.md: 行22, 37（gh pr create）
- agentdev-case-run-execution-adapter/references/oh-my-openagent.md: 行35, 110（gh pr create）
- agentdev-quality-gates/references/qg-4-final-acceptance.md: 行86（gh issue edit --body-file）
- agentdev-intake-pipeline/references/intake-extraction.md: 行11-15（gh issue/pr list, view）
- agentdev-epic-tracker/SKILL.md: 行46, 53, 226, 229（gh issue view, edit）
- agentdev-issue-management/references/issue-operation-safety.md: 行7-67（多数）
- agentdev-workflow-routing/references/case-update-procedure.md: 行14, 18, 30, 46
- agentdev-git-worktree/references/git-common-procedures.md: 行134, 159, 171, 182, 313（gh pr merge, view）

### 除外（既定実装として許容）
- agentdev-gh-cli/SKILL.md: 全315行（agentdev-gh-cli は既定実装として gh を記載する本体）
