---
draft_type: req_draft
topic_slug: local-opencode-generation
status: saved
created_at: 2026-06-20T21:39:00+09:00
source_rus:
  - RU-20260620-01
---

# draft-data

```yaml
work_type: feature

scale: large

summary: |
  AgentDevFlow に GitHub Issue/PR を使わない個人利用環境向け「ローカル版 OpenCode」生成方式を追加する。
  仕様管理リポジトリ（AgentDevFlow 本体）の src/opencode/ と新設 src/opencode-local/ を入力とし、
  AI エージェントが変換して生成先リポジトリの .opencode/commands/ と .opencode/skills/ に直接生成する。
  ローカルCaseファイル（.agentdev/cases/case-{NNNN}.md）が GitHub Issue+PR の役割を担い、
  SPEC確定候補・Findings/Capture候補・マージ結果を集約する。生成物識別情報 generated_by と
  ジャンクション環境検出による安全ゲートで src/opencode/ 改変を防止する。
  ADR-0126 で source model 拡張（3層化）と生成安全性制約を宣言する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []
  resolved_in_session:
    - "Q1: 5番目リポジトリ種別名称 = consumer-generated（ユーザー確定）"
    - "Q2: src/opencode-local/ ディレクトリ構成 = case-schema/ + transform/ + generation-flow.md（ユーザー確定。requirements/specs は docs/ と概念衝突するため不採用）"
    - "Q3: 実行エントリポイント = src/opencode-local/README.md に生成手順を記載（generate-local-transform.md を AI エージェントに入力/ファイル参照）。ユーザー確定"
    - "Q4: ローカル版更新運用 = .opencode/commands/agentdev/ と .opencode/skills/agentdev-* を全削除して作り直す（高頻度更新を想定しない）。ユーザー確定"
    - "備考: ローカル版生成の統合動作検証は生成先リポジトリが必要だが、case-run（実装=ファイル作成）は AgentDevFlow 本体リポジトリで完結するため out_of_repo_operations から除外"

agreed_items:
  - id: AG-001
    content: |
      ローカル版 OpenCode の位置づけを定義する。ローカル版は GitHub Issue/PR を使えない個人利用環境向けの
      AgentDevFlow 利用形態であり、GitHub 版原本である src/opencode/ を改変しない。
      仕様管理リポジトリは AgentDevFlow 本体リポジトリであり、src/opencode/ と src/opencode-local/ を持つ。
      生成先リポジトリはローカル版を導入する利用側リポジトリであり、.opencode/commands/、.opencode/skills/、
      .agentdev/cases/ を持つ。バックエンド抽象化と GitHub 互換ローカルサーバは暫定ローカル版では要件化せず、
      採用しない。GitHub 版とローカル版の双方向同期および同一 .opencode/ 内での同居は対象外とする。

  - id: AG-002
    content: |
      src/opencode-local/ を生成時ソース領域として新設する。src/opencode-local/ はローカル版生成のための
      スキーマ・変換プロンプト・変換仕様のみを保持し、生成済みコマンド/スキル/ひな形は配置しない。
      src/opencode-local/_conv/、src/opencode-local/commands/、src/opencode-local/skills/、
      src/opencode-local/requirements/、src/opencode-local/specs/ は作成しない
      （requirements/specs は docs/ と概念衝突するため不採用。要件は docs/requirements/ で一元管理）。
      採用するディレクトリ構成は以下とする:
      
      ```text
      src/opencode-local/
        README.md              ← ローカル版生成の実行手順（generate.md を AI エージェントに入力/ファイル参照する手順）
        case-schema/           ← ローカルCaseファイルの定義
          case-file.md         ← スキーマ定義（YAML frontmatter, status enum, labels, headings, 採番）
          rules/
            frontmatter.yaml   ← YAML前書きスキーマ
            status.yaml        ← status enum と遷移表
            labels.yaml        ← labels 値域
            headings.yaml      ← 見出し一覧
        transform/             ← 変換プロンプトと変換仕様
          generate.md          ← 変換用プロンプト（AIエージェントがローカル版を生成するための指示）
          review.md            ← レビュー用プロンプト（生成結果を検証するための指示）
          spec.md              ← 変換仕様（変換対象・ガードレール一覧・レポートフォーマット）
        generation-flow.md     ← 生成フロー定義（手順・安全確認・generated_by 形式）
      ```
      
      AI エージェントが仕様管理リポジトリの src/opencode/ と src/opencode-local/ 配下を読み、
      生成先リポジトリの .opencode/commands/ および .opencode/skills/ にローカル版コマンド/スキル/ひな形を
      直接生成する。変換スクリプトはリポジトリ管理対象外とし、AI エージェントが変換プロンプトに従って生成する。

  - id: AG-003
    content: |
      生成物識別情報と安全ゲートを定義する。ローカル版生成物には generated_by: local-opencode-transform の
      識別情報を持たせる。Markdown または YAML 前書きを持つ生成物には YAML 前書きに、持たない生成物には
      同等の先頭コメントに記録する。同名ファイルに generated_by: local-opencode-transform 識別情報がある場合のみ
      再生成・上書きを許可する。識別情報がない場合または異なる識別情報がある場合はローカル版生成を停止する。
      ローカル版生成前に生成先リポジトリの .opencode/ の実パスを確認し、.opencode/ が src/opencode/ 配下へ
      解決される場合はローカル版生成を停止する。このジャンクション検出による生成停止は決定的な検査として
      script で実装する（ADR-0107 準拠）。src/opencode/ は GitHub 版の原本として扱い、ローカル版のために改変しない。

  - id: AG-004
    content: |
      ローカルCaseファイルの位置づけと基本構造を定義する。ローカルCaseファイルは生成先リポジトリの
      .agentdev/cases/case-{NNNN}.md で管理し、Issue/PR 相当の永続情報としてリポジトリ管理対象とする。
      {NNNN} は 4 桁ゼロ埋め番号とし、新規作成時は既存最大番号+1を使用し、欠番は再利用しない。
      同一番号のファイルが既に存在する場合、ローカル版 case-open は停止する。
      YAML前書きは id, title, status, created_at, updated_at, closed_at, labels を必須とし、
      id は case-{NNNN} 形式でファイル名と一致させる。
      closed_at は status: closed または status: cancelled の場合のみ値を持ち、それ以外では空とする。
      ブランチ情報は YAML前書きに持たせず、ブランチを使った場合のみ ## マージ結果 に記録する。
      work_type, source, branch, base_branch は YAML前書きに持たせない。

  - id: AG-005
    content: |
      ローカルCaseファイルの状態・ラベル・見出し体系を定義する。status は open, running, blocked, review,
      closed, cancelled のいずれかとし、closed と cancelled は終端状態とする。詳細な状態遷移表
      （case-open/case-run/case-close 各操作の遷移、blocked からの再開経路）は SPEC local-case-file.md に配置する。
      labels は配列とし、rules/case-labels.yaml から選定する。labels は補助分類であり、状態遷移やワークフロー状態の
      代替として扱わない。rules/case-labels.yaml は feature, bugfix, maintenance, docs, refactor, chore, epic の
      値域を定義する。ローカルCaseファイルは入力、背景、問題、目的、対象範囲、対象外、受け入れ条件、作業ログ、
      マージ前確認、SPEC確定候補、Findings/Capture候補（intake/learning サブ見出し含む）、マージ結果、残課題、完了判定
      の見出しを持つ。SPEC確定候補とFindings/Capture候補は必須とし、GitHub 版で PR本文が担っていた引き継ぎ情報の
      代替とする（安定契約例外 REQ-0101-069: 公開分類体系・利用者に見える構造のため REQ に要約記載）。
      詳細な見出し一覧と各見出しの必須/任意判定は SPEC local-case-file.md に配置する。

  - id: AG-006
    content: |
      GitHub Issue/PR 置換方針を定義する。ローカル版では GitHub Issue/PR が担う情報を .agentdev/cases/case-{NNNN}.md
      に集約する。GitHub Issue本文はローカルCaseファイル本文へ、GitHub Issueコメントは ## 作業ログ へ、
      GitHub Issueの状態はローカルCaseファイルの status へ、GitHub IssueのラベルはローカルCaseファイルの labels へ、
      GitHub PR本文は ## マージ前確認・## SPEC確定候補・## Findings/Capture候補 へ、GitHub PR取り込み結果は
      ## マージ結果 へ、GitHub Issue のクローズは status: closed と closed_at へ、それぞれ置換する。
      ローカル版 case-open は GitHub Issue 作成ではなくローカルCaseファイル作成を行う。
      ローカル版 case-run は GitHub PR 作成を行わず、PR 相当の内容をローカルCaseファイルに記録する。
      ローカル版 case-close は GitHub PR 取り込み/Issue クローズを行わず、ローカルGitの取り込み結果と完了処理を
      ローカルCaseファイルに記録する。構造的実行以降の唯一の情報源は GitHub Issue/PR ではなくローカルCaseファイルである。
      GitHub Issue 作成・PR 作成・PR 取り込み・Issue クローズおよび gh issue/gh pr をローカル版の必須操作にしない。

  - id: AG-007
    content: |
      マージ結果記録方針を定義する。ローカル版 case-close は GitHub PR 取り込みを実行せず、ローカルGit上で
      実施済みの取り込み・反映結果を ## マージ結果 に記録する。## マージ結果 には少なくとも実行した操作、
      関連するコミットハッシュ、実行日時、結果（PASS/FAIL）を記録する。ブランチを使った場合は取り込み先ブランチと
      取り込み元ブランチも記録する。ブランチを使わない場合はブランチ名の記録を必須としない。
      ローカルGit上で実施済みの取り込み・反映結果が失敗または未完了の場合、ローカル版 case-close は status を
      blocked に更新し、理由を ## 残課題 に記録する。

  - id: AG-008
    content: |
      ひな形変換方針を定義する。ローカル版生成では GitHub Issue本文、GitHub PR本文、Issueコメント、完了報告に
      関係するひな形を変換対象に含める。GitHub Issue本文向けひな形はローカルCaseファイル本文向けに変換する。
      GitHub PR本文向けひな形は ## マージ前確認・## SPEC確定候補・## Findings/Capture候補 向けに変換する。
      Issueコメント向けひな形は ## 作業ログ 向けに変換する。GitHub PR取り込み後の完了報告向けひな形は
      ローカル版完了報告または ## 完了判定 向けに変換する。ローカル版コマンド/スキルが参照するひな形は、
      既存の相対参照構造を維持して配置する。既存の相対参照構造を維持できない場合は参照元から解決できる配置へ
      変換し、その変更理由と変更内容を変換レポートに記録する。

  - id: AG-009
    content: |
      変換プロンプトとレビュープロンプトの要件を定義する。prompts/generate-local-transform.md は AI エージェントが
      ローカル版コマンド/スキル/ひな形を生成先リポジトリの .opencode/commands/ と .opencode/skills/ に生成するための
      プロンプトである。このプロンプトは src/opencode/ と src/opencode-local/ 配下の仕様・定義を入力として使用し、
      src/opencode/ を変更せず、src/opencode-local/ を変更せず、生成物を src/opencode-local/ 配下に出力せず、
      AgentDevFlow 本体リポジトリでの生成実行を禁止し、.opencode/ 実パス確認と同名ファイル確認を要求する。
      このプロンプトは目的、入力、変換対象、必須変換、ガードレール、レポート出力を含む。
      必須変換として case-open/case-run/case-close の意味変換とひな形の意味変換を要求する。
      ガードレールとして src/opencode/ 変更禁止、生成物の src/opencode-local/ 配下出力禁止、GitHub Issue/PR 作成の
      必須操作化禁止、generated_by 識別子による上書き保護等を含む。変換後にレポート出力を要求し、レポートには
      入力スナップショット、生成した出力、変換内容、.opencode/ 実パス確認結果、同名ファイル確認結果、
      ガードレール確認結果、残存する GitHub 固有参照、結果（PASS/FAIL）を含める。
      残存する GitHub 固有参照では必須操作・必須入力・必須出力として残る GitHub Issue/PR 参照を違反として扱い、
      背景説明・GitHub版との置換表・対象外の説明・用語上の参照は違反として扱わない。
      prompts/review-local-transform.md は生成先リポジトリに生成された .opencode/commands/ と .opencode/skills/ が
      src/opencode-local/ 配下の仕様・定義に合致しているか確認するプロンプトである。詳細な確認対象一覧・違反一覧・
      レビュー結果フォーマットは SPEC local-transform.md に配置する。

  - id: AG-010
    content: |
      ローカル版生成の実行環境制約を定義する。ローカル版生成は AgentDevFlow 本体リポジトリでは実行しない。
      ローカル版生成時の入力元として AgentDevFlow 本体リポジトリの src/opencode/ と src/opencode-local/ を参照する。
      ローカル版生成は .opencode/ が src/opencode/ に接続されていない導入先リポジトリで実行する。
      .opencode/ が src/opencode/ 配下へ解決される環境ではローカル版生成を停止する。
      ローカル版は GitHub 版 /agentdev/* および agentdev-* と同じ名前で生成する前提とし、
      GitHub 版とローカル版を同じ .opencode/ に同居させる利用環境は対象外とする。

  - id: AG-011
    content: |
      リポジトリ種別の拡張を定義する。既存の 4 種（self-hosting, consumer-with-agentdev, consumer-local, plugin-future）
      に加え、ローカル版を導入する利用側リポジトリを新たなリポジトリ種別 consumer-generated として追加する。
      既存の consumer-local は「非 AgentDevFlow OpenCode プロジェクト」として定義されており、
      ローカル版とは別物のため、consumer-local の再定義は行わない。
      consumer-generated は .opencode/commands/agentdev/ が実ディレクトリ（非ジャンクション）で
      generated_by: local-opencode-transform を含むことで判定する。
      runtime-package-boundary.md SPEC の予約名テーブル（agentdev/agentdev-*/.agentdev/）に consumer-generated を追加する。
      同期スクリプト（sync-self-opencode.ps1）の管理対象は src/opencode/ のみとし、
      src/opencode-local/ は生成時入力であり同期対象外とする。

  - id: AG-012
    content: |
      workflow-contracts.md SPEC にローカル版バックエンドの契約差分を追加する。既定は GitHub backend とし、
      Local backend は差分テーブルで GitHub backend との差分のみを定義する（重複定義しない）。
      差分項目: case-open 出力（GitHub Issue → .agentdev/cases/case-{NNNN}.md）、case-run 出力（PR → Case File更新）、
      case-close 入力（Issue+PR → Case File）、case-close 出力（merge+close → Case File ## マージ結果 + local git merge）、
      SSoT 構造的実行（Issue本文+Work Plan → Case File本文）、SSoT レビュー完了（PR+レビュー結果 → Case File ## マージ結果）。
      Pattern taxonomy（case-open=file-pipeline, case-run=manager-orchestrator 等）は実装構造ベースであり、
      バックエンドに依存しないため変更しない。SPEC 先頭に「本節の契約は GitHub backend を既定とする。
      Local backend は Local backend 差分節による差分適用後の契約に従う」の宣言を置く。

  - id: AG-013
    content: |
      ADR-0126 を新設し、ローカル版 OpenCode 生成基盤の source model 拡張と生成安全性制約を宣言する。
      決定内容: (1) src/opencode-local/ を生成時ソース領域として追加（ADR-0105 の source model を拡張、非置換）、
      (2) generated_by 識別子を生成物の安全識別子として採用（上書き保護のアーキテクチャ不変量）、
      (3) ジャンクション環境検出時の生成停止をアーキテクチャ安全制約として採用、
      (4) src/opencode/ は GitHub 版専用（ローカル版のための変更不可）を不変量として宣言。
      ADR-0126 は ADR-0105 とは relates-to 関係（supersede しない）、ADR-0101 とも relates-to 関係（namespace 再利用）。
      ADR 本文にはスキーマ定義・enum値・状態遷移表・プロンプト構造・ディレクトリファイル一覧を含めず、
      それらは SPEC に配置する。判断根拠: False Negative 防止基準（agentdev-adr-guidelines SKILL.md lines 49-59）—
      src/opencode-local/ の 3層 source model 導入は将来の設計・運用・文書システムを制約する決定である。

  - id: AG-014
    content: |
      REQ-0134 への最小追記を定義する。REQ-0134 の既存行 REQ-0103-061「4種のリポジトリ種別」は
      新アーキテクチャの 5 種と直接矛盾するため、これを解消する。REQ-0103-061 を「5種のリポジトリ種別」へ
      更新し、詳細は REQ-0141 を参照する旨を付記する。新規行として src/opencode-local/ が生成時ソース領域であり
      src/opencode/ とは独立に管理されること（ADR-0126, REQ-0141 参照）を追加する。
      ローカルCaseファイル schema、生成フロー、generated_by 不変量、新リポジトリ種別の特性は
      REQ-0134 には配置せず REQ-0141 と各 SPEC が所有する（RU 原則: 矛盾解消に必要な範囲に限定）。

  - id: AG-015
    content: |
      ローカル版生成の実行エントリポイントと更新運用を定義する。ローカル版生成は src/opencode-local/README.md に
      記載された実行手順に従う。手順は OpenCode 等 AI エージェントで transform/generate.md（変換用プロンプト）を
      入力またはファイル参照し、AI エージェントが src/opencode/ と src/opencode-local/ を読んで
      .opencode/commands/ と .opencode/skills/ にローカル版を生成する。変換スクリプト（決定的な変換ロジックを実装した
      プログラム）は使用せず、AI エージェントが変換プロンプトに従って生成する。
      ローカル版の高頻度更新は想定しない。更新時は .opencode/commands/agentdev/ と .opencode/skills/agentdev-* を
      全削除して作り直す（差分更新を想定しない）。全削除により generated_by 識別子の上書き保護を迂回できるが、
      これは利用者自身の明示的操作によるものであり、ローカル版生成プロンプトによる自動上書きとは区別する。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: create
    target: new:local-opencode-generation
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007, AG-008, AG-009, AG-010, AG-013, AG-015]
    content: |
      ## 目的

      GitHub Issue/PR を使えない個人利用環境向けに、AgentDevFlow のコマンド/スキル/ひな形をローカル版として生成する方式を定義する。ローカルCaseファイルが GitHub Issue+PR の役割を担い、生成物識別情報と安全ゲートで原本保護を担保する。

      ## 要件

      | ID | 要件 |
      |---|---|
      | REQ-0141-001 | ローカル版 OpenCode は GitHub Issue/PR を使わない個人利用環境向けの AgentDevFlow 利用形態であること |
      | REQ-0141-002 | 仕様管理リポジトリは AgentDevFlow 本体リポジトリであり、生成先リポジトリはローカル版を導入する利用側リポジトリであること |
      | REQ-0141-003 | 仕様管理リポジトリの `src/opencode/` と `src/opencode-local/` をローカル版生成の入力元として扱うこと |
      | REQ-0141-004 | `src/opencode-local/` は生成時ソース領域であり、生成済みコマンド/スキル/ひな形を配置しないこと。ディレクトリ構成は `README.md`、`case-schema/`、`transform/`、`generation-flow.md` とすること（`requirements/`、`specs/` は docs/ と概念衝突するため作成しない） |
      | REQ-0141-005 | `src/opencode-local/_conv/`、`src/opencode-local/commands/`、`src/opencode-local/skills/`、`src/opencode-local/requirements/`、`src/opencode-local/specs/` を作成しないこと |
      | REQ-0141-006 | ローカル版生成を AgentDevFlow 本体リポジトリでは実行しないこと |
      | REQ-0141-007 | ローカル版コマンド/スキルを生成先リポジトリの `.opencode/commands/` および `.opencode/skills/` に直接生成すること |
      | REQ-0141-008 | 生成された `.opencode/commands/`、`.opencode/skills/`、および `.opencode/` 配下ひな形をリポジトリ管理対象外とすること |
      | REQ-0141-009 | 変換スクリプトをリポジトリ管理対象外とすること |
      | REQ-0141-010 | ローカル版生成前に `.opencode/` の実パスを確認し、`.opencode/` が `src/opencode/` 配下へ解決される場合は生成を停止すること（決定的検査は script で実装） |
      | REQ-0141-011 | 生成物に `generated_by: local-opencode-transform` の識別情報を持たせること |
      | REQ-0141-012 | 同名ファイルに `generated_by: local-opencode-transform` 識別情報がある場合のみ再生成・上書きを許可すること |
      | REQ-0141-013 | 同名ファイルに識別情報がない場合または異なる識別情報がある場合、ローカル版生成を停止すること |
      | REQ-0141-014 | `src/opencode/` は GitHub 版の原本として扱い、ローカル版のために改変しないこと |
      | REQ-0141-015 | ローカル版は GitHub 版 `/agentdev/*` および `agentdev-*` と同じ名前で生成する前提とし、GitHub 版とローカル版の同一 `.opencode/` 内での同居は対象外とすること |
      | REQ-0141-016 | ローカルCaseファイルを `.agentdev/cases/case-{NNNN}.md` で管理し、Issue/PR 相当の永続情報としてリポジトリ管理対象とすること |
      | REQ-0141-017 | ローカルCaseファイルのYAML前書きは `id`, `title`, `status`, `created_at`, `updated_at`, `closed_at`, `labels` を必須とすること（`work_type`, `source`, `branch`, `base_branch` は持たせないこと） |
      | REQ-0141-018 | ローカルCaseファイルの `status` は `open`, `running`, `blocked`, `review`, `closed`, `cancelled` のいずれかとし、`closed` と `cancelled` を終端状態とすること（詳細な状態遷移表は SPEC local-case-file.md） |
      | REQ-0141-019 | ローカルCaseファイルの `labels` を `rules/case-labels.yaml` から選定し、`feature`, `bugfix`, `maintenance`, `docs`, `refactor`, `chore`, `epic` のいずれかとすること（詳細な値域定義は SPEC local-case-file.md） |
      | REQ-0141-020 | ローカルCaseファイルに `## SPEC確定候補` と `## Findings / Capture候補` セクションを必須とすること（PR本文が担っていた引き継ぎ情報の代替。詳細な見出し一覧は SPEC local-case-file.md） |
      | REQ-0141-021 | ローカル版 `case-open` が GitHub Issue 作成ではなくローカルCaseファイル作成を行うこと |
      | REQ-0141-022 | ローカル版 `case-run` が GitHub PR 作成ではなくローカルCaseファイル更新を行うこと |
      | REQ-0141-023 | ローカル版 `case-close` が GitHub PR 取り込み/Issue クローズではなくローカルCaseファイルの完了更新を行うこと |
      | REQ-0141-024 | ブランチ情報をローカルCaseファイルのYAML前書きに持たせず、ブランチ使用時のみ `## マージ結果` に記録すること |
      | REQ-0141-025 | `## マージ結果` にローカルGit上の取り込み結果（実行操作・コミットハッシュ・実行日時・結果 PASS/FAIL）を記録し、失敗/未完了時は `status` を `blocked` に更新すること |
      | REQ-0141-026 | GitHub Issue 作成・PR 作成・PR 取り込み・Issue クローズおよび `gh issue`/`gh pr` をローカル版の必須操作にしないこと |
      | REQ-0141-027 | バックエンド抽象化および GitHub 互換ローカルサーバを導入しないこと |
      | REQ-0141-028 | 変換プロンプト（`transform/generate.md`）とレビュープロンプト（`transform/review.md`）が存在し、それぞれローカル版生成・レビューの責務を担うこと（詳細な要件項目は SPEC local-transform.md） |
      | REQ-0141-029 | 残存する GitHub 固有参照のうち、必須操作・必須入力・必須出力として残るものを違反として扱い、背景説明・置換表・対象外・用語上の参照を違反として扱わないこと |
      | REQ-0141-030 | 複数利用者による同時実行時の排他制御、GitHub版との双方向同期、生成された `.opencode/` 配下成果物のリポジトリ管理を対象外とすること |
      | REQ-0141-031 | `src/opencode-local/README.md` にローカル版生成の実行手順を記載すること。手順は OpenCode 等 AI エージェントで `transform/generate.md`（変換用プロンプト）を入力またはファイル参照して実行する内容とすること |
      | REQ-0141-032 | ローカル版生成の実行は AI エージェントが変換プロンプトに従って行い、決定的な変換ロジックを実装した変換スクリプトを使用しないこと |
      | REQ-0141-033 | ローカル版の更新は `.opencode/commands/agentdev/` と `.opencode/skills/agentdev-*/` を全削除して作り直すことで行うこと（差分更新を想定しない・高頻度更新を想定しない） |

      ## 適用範囲

      - **対象**: ローカル版 OpenCode の位置づけ、仕様管理リポジトリと生成先リポジトリの分離、`src/opencode-local/` 生成時ソース領域、生成フロー、生成物識別情報、安全ゲート、ローカルCaseファイルの基本構造・状態・ラベル・見出し、GitHub Issue/PR 置換方針、マージ結果記録、変換プロンプト・レビュープロンプトの存在と責務
      - **対象外**: AgentDevFlow 本体リポジトリでのローカル版直接生成、複数利用者による同時実行排他制御、GitHub 版とローカル版の双方向同期、同一 `.opencode/` での GitHub 版とローカル版の同居、バックエンド抽象化、GitHub 互換ローカルサーバ、`src/opencode/` のローカル版向け改変、GitHub 版 case-open/case-run/case-close の改修、変換スクリプトのリポジトリ管理、生成された `.opencode/` 配下成果物のリポジトリ管理

  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: docs/requirements/REQ-0134.md
    source_items: [AG-014]
    content: |
      REQ-0134 の REQ-0103-061「4種のリポジトリ種別」を「5種のリポジトリ種別（self-hosting, consumer-with-agentdev, consumer-local, consumer-generated, plugin-future）」へ更新する。詳細は REQ-0141 を参照する旨を付記する。
      新規行として「`src/opencode-local/` は生成時ソース領域であり、`src/opencode/` とは独立に管理されること（ADR-0126, REQ-0141 参照）」を追加する。
      行IDは既存の REQ-0103-NNN シーケンスを継続するか REQ-0134-NNN とするかは req-save 判断に委ねる（採番規約の範囲）。

  - id: ACT-ADR-001
    artifact: adr
    operation: create
    target: new:local-opencode-generation
    source_items: [AG-002, AG-003, AG-013]
    content: |
      id: ADR-0126
      title: "ローカル版 OpenCode 生成基盤: source model 拡張と生成安全性制約"
      status: accepted

      ## 背景

      ADR-0105 は `src/opencode/`（ソース）→ `.opencode/`（プロジェクション）の2層 source model を確立した。
      ローカル版 OpenCode 生成方式は、GitHub Issue/PR を使わない個人利用環境向けに AgentDevFlow を提供するため、
      生成時入力としての仕様・定義・変換プロンプトを保持する新たなソース領域を必要とする。
      この領域は `src/opencode/`（ランタイムソース）でも `docs/`（リポジトリ内部設計文書）でもない、
      第3のカテゴリ「生成時ソース」として位置づける必要がある。

      ## 決定

      1. `src/opencode-local/` を生成時ソース領域として追加する。これは ADR-0105 の source model を拡張するものであり、
         ADR-0105 を置換（supersede）しない。GitHub 版は引き続き `src/opencode/` → `.opencode/` の2層 model で運用する。
      2. `generated_by: local-opencode-transform` 識別子をローカル版生成物の安全識別子として採用する。
         同名ファイル上書きはこの識別子の存在時のみ許可され、識別子不在・不一致時は生成を停止する。
         これは上書き保護のアーキテクチャ不変量である。
      3. `.opencode/` が `src/opencode/` 配下へ解決される環境（ジャンクション環境）でのローカル版生成を停止する。
         これは `src/opencode/` 改変防止のアーキテクチャ安全制約であり、決定的検査として script で実装する。
      4. `src/opencode/` は GitHub 版専用の原本であり、ローカル版のために変更しないことを不変量として宣言する。

      ## 結果・影響

      ### 正の影響
      - ローカル版生成方式が既存の source/projection 分離（ADR-0105）と整合する形で確立される
      - 生成物の上書き安全性が識別子ベースで担保される
      - ジャンクション環境での誤った src/opencode/ 改変が構造的に防止される

      ### 負の影響
      - `src/opencode-local/` という新たなソースカテゴリの導入により、学習コストが発生する
      - docs/ とのディレクトリ名衝突（requirements/specs）の管理が必要（README 宣言 + IR ルールで対応）
      - ローカル版生成の動作検証には AgentDevFlow 本体以外のリポジトリが必要

      ## 関連する決定

      - ADR-0105（relates-to: source/projection 分離の拡張）
      - ADR-0101（relates-to: namespace 再利用）
      - ADR-0103（relates-to: 文書種別責務境界）

  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-create
    target: new:local-case-file
    source_items: [AG-004, AG-005, AG-007]
    content: |
      新規 SPEC docs/specs/local-case-file.md を作成する。
      内容: ローカルCaseファイルの YAML前書きスキーマ（各フィールドの型・必須/任意・値域）、
      status enum と状態遷移表（case-open/case-run/case-close 各操作の遷移・blocked からの再開経路）、
      採番規則（4桁ゼロ埋め・欠番再利用不可・最大番号+1・同番号存在時の停止）、
      見出し一覧（入力/背景/問題/目的/対象範囲/対象外/受け入れ条件/作業ログ/マージ前確認/SPEC確定候補/
      Findings/Capture候補（intake/learning サブ見出し）/マージ結果/残課題/完了判定 の全15セクションの必須/任意）、
      src/opencode-local/case-schema/rules/ 配下の YAML ルール定義（frontmatter.yaml, status.yaml, labels.yaml, headings.yaml）。
      closed_at の値条件（status: closed または cancelled の場合のみ値を持ちそれ以外は空）。
      ブランチ情報を YAML前書きに持たせないことの明示。

  - id: ACT-SPEC-002
    artifact: spec
    operation: spec-create
    target: new:local-generation
    source_items: [AG-002, AG-003, AG-008, AG-010, AG-015]
    content: |
      新規 SPEC docs/specs/local-generation.md を作成する。
      内容: src/opencode-local/ のディレクトリ構成（README.md, case-schema/, transform/, generation-flow.md の詳細）、
      ローカル版生成フロー（AIエージェントが src/opencode/ と src/opencode-local/ を読み .opencode/commands/ と
      .opencode/skills/ に直接生成する手順）、generated_by: local-opencode-transform の記録形式
      （YAML前書きを持つ持たない別の記録方法）、上書き許可条件（識別子存在時のみ）、
      ジャンクション検出安全ゲートの仕組み（script による決定的検査）、
      ひな形変換方針（GitHub Issue本文/PR本文/Issueコメント/完了報告向けひな形の変換先）、
      相対参照構造の維持ルール（維持できない場合の変換とレポート記録）、
      生成レポートの出力フォーマット（入力スナップショット・生成出力・変換内容・各種確認結果・残存GitHub参照・結果）。
      ガードレール一覧（src/opencode/ 変更禁止等の全項目）。

  - id: ACT-SPEC-003
    artifact: spec
    operation: spec-create
    target: new:local-transform
    source_items: [AG-009]
    content: |
      新規 SPEC docs/specs/local-transform.md を作成する。
      内容: src/opencode-local/transform/generate.md（変換用プロンプト）の要件（目的/入力/変換対象/必須変換/ガードレール/レポート出力の各セクション詳細）、
      必須変換の詳細（case-open/case-run/case-close の意味変換内容、ひな形の意味変換内容）、
      ガードレール一覧（src/opencode/ 変更禁止・生成物の src/opencode-local/ 配下出力禁止・
      GitHub Issue/PR 作成の必須操作化禁止等の全項目）、レポート出力の必須項目、
      残存 GitHub 固有参照の違反判定基準（必須操作・必須入力・必須出力は違反、背景説明・置換表・対象外・用語上は非違反）、
      src/opencode-local/transform/review.md（レビュー用プロンプト）の要件（確認対象一覧・違反一覧・レビュー結果フォーマット・必須チェック失敗時の FAIL 扱い）、
      src/opencode-local/transform/spec.md（変換仕様）の要件。

  - id: ACT-SPEC-004
    artifact: spec
    operation: spec-update
    target: docs/specs/runtime-package-boundary.md
    source_items: [AG-011]
    content: |
      docs/specs/runtime-package-boundary.md を更新する。
      4種リポジトリ種別テーブルに5番目の種別 consumer-generated を追加する。
      説明: ローカル版 OpenCode を導入する利用側リポジトリ。.opencode/ の意味: 生成された AgentDevFlow 実行時位置（非ジャンクション）。
      典型例: 個人利用環境のローカルリポジトリ。
      リポジトリ種別判定基準テーブルに新行を追加: 「.opencode/commands/agentdev/ が実ディレクトリ（非ジャンクション）で
      generated_by: local-opencode-transform を含む」→ consumer-generated（仮称）。
      予約名テーブル（agentdev/agentdev-*/.agentdev/）の「使用可能リポジトリ種別」列に新種別を追加。
      同期スクリプト範囲テーブルに新種別行を追加（同期対象: なし。src/opencode-local/ は生成時入力であり同期対象外）。
      consumer-local の定義（非 AgentDevFlow OpenCode プロジェクト）は変更しない。

  - id: ACT-SPEC-005
    artifact: spec
    operation: spec-update
    target: docs/specs/workflow-contracts.md
    source_items: [AG-006, AG-012]
    content: |
      docs/specs/workflow-contracts.md を更新する。
      コマンド I/O 契約セクションの先頭に「本節の契約は GitHub backend を既定とする。
      Local backend は Local backend 差分節による差分適用後の契約に従う」の宣言を追加する。
      新規サブセクション「Local backend（差分）」を追加し、GitHub backend との差分テーブルを定義する:
      case-open 出力（GitHub Issue → .agentdev/cases/case-{NNNN}.md）、
      case-run 出力（PR → Case File のPR相当セクション追記）、
      case-close 入力（Issue+PR → Case File）、case-close 出力（merge+close → Case File ## マージ結果 + local git merge）、
      SSoT 構造的実行（Issue本文+Work Plan → Case File本文）、SSoT レビュー完了（PR+レビュー結果 → Case File ## マージ結果）。
      Pattern taxonomy（case-open=file-pipeline 等）は実装構造ベースのため変更しない。
      SSoT 遷移規則に Local backend の SSoT 位置づけを追記する。

conflict_resolutions:
  - id: CR-001
    conflict: "runtime-package-boundary.md の consumer-local は「非 AgentDevFlow OpenCode プロジェクト」と定義済み。RU のローカル版は AgentDevFlow を使うが Issue/PR 非使用であり、consumer-local とは別物"
    resolution: "5番目の新リポジトリ種別を追加し、consumer-local の再定義は行わない。consumer-local の「非 AgentDevFlow」意味は維持する（根拠: REQ-0103-056, runtime-package-boundary.md line 15, oracle advice Q3）"

  - id: CR-002
    conflict: "ADR-0105 は accepted/immutable。ローカル版の src/opencode-local/ 新設は ADR-0105 の source model と関連するが、accepted ADR は直接書き換え不可"
    resolution: "新規 ADR-0126 を作成し ADR-0105 とは relates-to 関係とする（supersede しない）。GitHub 版は引き続き ADR-0105 に従う（根拠: agentdev-adr-guidelines SKILL.md line 80, oracle advice Q4）"

  - id: CR-003
    conflict: "workflow-contracts.md の GitHub Issue/PR 前提契約とローカル版契約の二重管理リスク。読者がどちらの契約が適用されるか判別できない"
    resolution: "Local backend 差分テーブル方式を採用。GitHub backend を既定とし、Local backend は差分のみ定義。Pattern taxonomy は実装構造ベースのため共有（根拠: oracle advice Q6）"

  - id: CR-004
    conflict: "src/opencode-local/ 配下の requirements/specs サブディレクトリ名が docs/requirements/specs と概念衝突する"
    resolution: "ユーザー確定: requirements/specs ディレクトリを作成せず、case-schema/（Case File スキーマ・ルール）、transform/（変換プロンプト・変換仕様）、generation-flow.md（生成フロー）の構成を採用。要件は docs/requirements/ で一元管理し src/opencode-local/ には配置しない。docs-check は src/opencode-local/ をスキャン対象外（Command/Skill/Template/Script のいずれにも該当しないため）"

operation_units:
  - ou_id: OU-001
    source_ru: RU-20260620-01
    target_req: REQ-0141
    operation: create
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

  - ou_id: OU-002
    source_ru: RU-20260620-01
    target_req: REQ-0134
    operation: update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    result: {}

  - ou_id: OU-003
    source_ru: RU-20260620-01
    target_spec: docs/specs/local-case-file.md
    operation: spec-create
    scale: standard
    depends_on: [OU-001]
    recommended_order: 3
    issue_policy: single
    result: {}

  - ou_id: OU-004
    source_ru: RU-20260620-01
    target_spec: docs/specs/local-generation.md
    operation: spec-create
    scale: standard
    depends_on: [OU-001]
    recommended_order: 4
    issue_policy: single
    result: {}

  - ou_id: OU-005
    source_ru: RU-20260620-01
    target_spec: docs/specs/local-transform.md
    operation: spec-create
    scale: standard
    depends_on: [OU-001]
    recommended_order: 5
    issue_policy: single
    result: {}

  - ou_id: OU-006
    source_ru: RU-20260620-01
    target_spec: docs/specs/runtime-package-boundary.md
    operation: spec-update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 6
    issue_policy: single
    result: {}

  - ou_id: OU-007
    source_ru: RU-20260620-01
    target_spec: docs/specs/workflow-contracts.md
    operation: spec-update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 7
    issue_policy: single
    result: {}

case_open_hints:
  epic_needed: true
  decomposition: |
    Epic Issue 配下に OU 単位で子 Issue を作成する。
    Wave 1: OU-001（REQ-0141+ADR-0126 CREATE）→ req-save
    Wave 2: OU-002（REQ-0134 UPDATE）→ req-save（OU-001 完了後）
    Wave 3: OU-003〜OU-007（5 SPEC 操作）→ spec-save（OU-001 完了後、並列可）
    Wave 4（case-run）: src/opencode-local/ コンテンツ作成（11ファイル）
    Wave 5（case-run）: integrity-rule-catalog.md / rule-ownership.md / req-impact-map.md / guides 更新
  wave_hints:
    - wave: 1
      focus: "REQ-0141 + ADR-0126 CREATE（req-save）"
      ous: [OU-001]
    - wave: 2
      focus: "REQ-0134 最小 UPDATE（req-save）"
      ous: [OU-002]
      depends_on: [1]
    - wave: 3
      focus: "SPEC 3新設 + 2更新（spec-save、並列可）"
      ous: [OU-003, OU-004, OU-005, OU-006, OU-007]
      depends_on: [1]

draft_meta:
  split-forecast:
    target: new
    metrics:
      requirement_rows: 33
      concern_classification: 1
      artifact_types: 3
      spec_separation_violations: 0
    signals:
      requirement_rows_signal: 0
      concern_classification_signal: 0
      artifact_types_signal: 1
      spec_separation_violation_signal: 0
    total_signal: 1
    recommended_action: no-action
    thresholds_ref: docs/specs/req-health-metrics.md
    note: "REQ-0141 は33行（+0）、単一関心（+0）、REQ+SPEC+ADR の3種別（+1）、SPEC分離基準違反なし（+0）。合計1で no-action。厳密な SPEC 分離を維持すれば次回 APPEND でも健全範囲"
  adr_judgment:
    required: true
    adr_id: ADR-0126
    operation: create
    rationale: "False Negative 防止基準（agentdev-adr-guidelines lines 49-59）。src/opencode-local/ の3層 source model 導入と generated_by/junction-detection 安全性制約は将来の設計・運用・文書システムを制約する決定"
    relations:
      - type: relates-to
        target: ADR-0105
      - type: relates-to
        target: ADR-0101
    evidence:
      - "agentdev-adr-guidelines SKILL.md lines 49-59（False Negative 防止基準）"
      - "agentdev-adr-guidelines SKILL.md lines 61-77（作成可/不可条件）"
      - "ADR-0105 status=accepted（immutable、supersede 対象外）"
  oracle_advisory:
    task_id: bg_99157fe5
    classification:
      confirmed:
        - "Q1: 単一 CREATE 妥当（req-health-metrics 閾値根拠）"
        - "Q2 intent: src/opencode-local/ = 生成時ソースカテゴリ（ADR-0103/0105 根拠）"
        - "Q3: 5番目 repo type 追加（軸整合）"
        - "Q4: 新規 ADR 必須（False Negative 防止基準）"
        - "Q5: 同名 /agentdev/* 再利用 OK（ADR-0101 整合）"
        - "Q6: 差分テーブル方式（重複定義回避）"
        - "Q7: REQ-0134 最小 APPEND（矛盾解消範囲）"
        - "SPEC 分離候補：schema/enum/遷移表/ディレクトリ/プロンプト構造は全て SPEC へ"
        - "安全ゲートは script 実装（ADR-0107 準拠）"
      inferred:
        - "SPLIT シグナル現実値 0-2（関心分類・artifact 種別で +1 each if not disciplined）"
        - "ADR-0126 番号（ADR-0125 の次）"
        - "共存ガードレールの IR 化候補"
      user_decision:
        - "5番目 repo type 最終名称（oracle 推奨: consumer-generated）"
        - "src/opencode-local/ サブディレクトリ名称（oracle 推奨: リネーム または README宣言+IR除外）"
      blocker: []
```

# summary

## 合意内容の補足

本ドラフトは RU-20260620-01 の合意内容（ローカル版 OpenCode 生成仕様とローカルCaseファイル運用）を構造化したものである。主な合意事項は以下の通り:

- **ローカル版の位置づけ**: GitHub Issue/PR を使わない個人利用環境向け。仕様管理リポジトリ（AgentDevFlow 本体）と生成先リポジトリ（導入先）を分離
- **src/opencode-local/ 新設**: 生成時ソース領域。仕様・定義・変換プロンプトのみ保持。生成済みコマンド/スキル/ひな形は配置しない
- **ローカルCaseファイル**: .agentdev/cases/case-{NNNN}.md が Issue+PR の役割を担う。SPEC確定候補・Findings/Capture候補・マージ結果を集約
- **安全ゲート**: generated_by 識別子による上書き保護 + ジャンクション環境検出による生成停止
- **ADR-0126**: source model 拡張（3層化）と生成安全性制約を宣言

## oracle 相談結果（REQ-0139-002〜004 分類）

oracle に7問のアーキテクチャ相談を実施し、全て HIGH confidence で推奨方向を得た。親エージェントが4分類に振り分け:
- **確定事項**（既存文書根拠）: 単一CREATE妥当・生成時ソース解釈・5番目repo type・新規ADR必須・同名再利用OK・差分テーブル方式・REQ-0134最小APPEND等
- **ユーザー確認事項**（解決済）: 5番目repo type最終名称 = `consumer-generated`、src/opencode-local/ 構成 = `case-schema/` + `transform/` + `generation-flow.md`、実行エントリポイント = README.md 記載、更新運用 = 全削除→作り直し
- **ブロッカー**: なし

## 未解決事項

なし（auto_gate.auto_ready = true）。全ての未決事項は case-auto 起動前のユーザー確認により解決済み。

## 実装スコープ参考情報（REQ-0102-057 分離）

この要件の実装には以下のファイル群が影響する（artifact_actions には含まれない実装詳細）:

| 区分 | ファイル | 操作 |
|---|---|---|
| docs（req-save/spec-save 対象） | REQ-0141.md, REQ-0134.md, ADR-0126.md, local-case-file.md, local-generation.md, local-transform.md, runtime-package-boundary.md, workflow-contracts.md | 8ファイル |
| docs 索引（req-save/spec-save 付随） | requirements/README.md, README.md, DOC-MAP.md, specs/README.md, adr/README.md | 5ファイル |
| src/opencode-local/ コンテンツ（case-run 対象） | README.md, case-schema/case-file.md, case-schema/rules/*.yaml (4), transform/generate.md, transform/review.md, transform/spec.md, generation-flow.md | 10ファイル |
| 追加 SPEC 更新（case-run 対象） | integrity-rule-catalog.md, rule-ownership.md, req-impact-map.md | 3ファイル |
| ガイド更新（case-run 対象） | consumer-project-setup.md, glossary.md | 2ファイル |
| **合計** | | **~29ファイル** |

影響ファイル数が10超のため、scale=large に昇格（実装スコープシグナル REQ-0102-056）。
