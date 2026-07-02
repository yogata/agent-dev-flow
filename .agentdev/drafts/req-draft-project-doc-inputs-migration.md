---
draft_type: req_draft
topic_slug: project-doc-inputs-migration
status: saved
created_at: 2026-07-02T00:00:00+09:00
saved_at: 2026-07-02T00:00:00+09:00
source_rus:
  - RU-20260701
---

# draft-data

```yaml
work_type: feature

scale: large

summary: |
  AgentDevFlow 配布コマンド・スキル本文から AgentDevFlow 本体固有 docs/specs/** 直接参照を除去し、実行時 docs 参照をプロジェクト別の .agentdev/doc-inputs/** 経由に移行する。read-contracts から doc-inputs に改名し、doc-input の schema を RU-20260701 形式（version/kind/id フロントマタ + must_read{path,purpose} + conditional_read{id,when,paths,purpose} + allowed_discovery/forbidden/read_completion 説明文字列リスト）に統一する。実装本文はプロジェクト非依存・単体利用可能とし、各コマンド本文に doc-inputs 手順（6歩）、各スキル SKILL.md に doc-input 参照方針（4項目）を配置する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      実装本文（src/opencode/commands/agentdev/**/*.md, src/opencode/skills/agentdev-*/SKILL.md, src/opencode/skills/agentdev-*/references/**/*.md）をプロジェクト非依存にする。AgentDevFlow 本体固有 docs/specs/{foundations,responsibilities,quality,integrity,local,authoring,commands,skills,workflows}/** への直接参照を完全に除去する。例外として SPEC パスの例示、検査対象パスの指定は移行対象外とする。実装本文が前提としてよい固定知識は docs/ ディレクトリ構成（requirements/adr/specs）と DOC-MAP.md のみとし、docs/specs/foundations/** 等の内部構成は前提としない。
  - id: AG-002
    content: |
      実装が読む docs（インプット）を .agentdev/doc-inputs/ に外部配置する。commands と skills の両方を対象とする。doc-inputs はプロジェクト固有情報（そのプロジェクトの adr/req/spec）を具体的に参照してよい。これが doc-inputs の本質的な目的である。命名は read-contracts から doc-inputs に改名する。対象は commands と skills の両方。contract の契約ニュアンスよりも、実装本文にとっての入力（input）であることを示す命名が本質に合致する。
  - id: AG-003
    content: |
      doc-input の schema 構造を RU-20260701 形式に統一する。command doc-input はフロントマタ（version: 1, kind: command-doc-input, id: /agentdev/<command>）と must_read{path,purpose}, conditional_read{id,when,paths,purpose}, allowed_discovery, forbidden, read_completion を持つ。skill doc-input はフロントマタ（version: 1, kind: skill-doc-input, id: <skill>）と conditional_read{id,when,paths,purpose}, allowed_discovery, forbidden を持ち、must_read, read_completion を持たない。allowed_discovery, forbidden, read_completion は説明文字列のリストとする。各 doc-input オブジェクトは path と目的（purpose）を持ち、conditional_read は条件（when）と識別子（id）を持つ。
  - id: AG-004
    content: |
      各コマンド本文に doc-inputs を読んでインプットを取得する手順ブロック（6歩）を配置する。手順は .agentdev/config.yaml 読込、対応する doc-input 読込、must_read の読込、conditional_read の該当時のみ paths 読込、doc-input 未列挙の docs/specs/** 内部パスを固定知識として読みに行かない、doc-input が存在しない場合は roots と明示入力のみを使う、の6歩からなる。現状未配置のコマンド（case-auto 他）を含め全コマンドに配置する。
  - id: AG-005
    content: |
      各スキル SKILL.md に doc-input 参照方針（4項目）を配置する。参照方針は、前提とする固定知識の範囲、doc-input の読込契約、docs/specs/** 内部パスの固定知識化の禁止、doc-input 未配置時の挙動、の4項目からなる。現状未配置の13スキルを含め全スキルに配置する。
  - id: AG-006
    content: |
      doc-input の paths は docs/DOC-MAP.md または docs 配下 README から探索可能でなければならない。doc-inputs 内の docs/specs/** 参照は正当な参照として扱う（直接参照禁止の対象外）。SPEC→SPEC 参照（docs/specs/** 内部の文書間参照）は本体プロジェクト内部のことで配布外であり、問題ない。
  - id: AG-007
    content: |
      検査と診断を doc-inputs 命名・schema に対応させる。check_doc_inputs.ts は config.yaml の存在と schema 適合、roots パスの存在、doc_inputs.commands と doc_inputs.skills ディレクトリの存在、公開コマンドごとの command doc-input の存在、各 doc-input の schema 適合（フロントマタ version/kind/id、must_read/conditional_read のオブジェクト構造）、paths の存在、paths の DOC-MAP 探索可能性、配布コードの直接参照残存を検査する。inspect-doc-inputs を読み取り専用診断コマンドとして新設する。既存ワークフロー（req-save, spec-save, case-close, inspect-docs, inspect-skills, repo-local docs-check）の read-contracts 参照を doc-inputs に読み替える。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-0157.md
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007]
    content: |
      ---
      id: REQ-0157
      title: "Project Doc Inputs Migration"
      created: "2026-07-02"
      updated: "2026-07-02"
      ---

      ## 概要

      AgentDevFlow 配布コマンド・スキル本文から、AgentDevFlow 本体固有 docs/specs/** 直接参照を除去する。実行時 docs 参照は、プロジェクト別の .agentdev/doc-inputs/** 経由に移行する。doc-input の schema は RU-20260701 形式（version/kind/id フロントマタ + must_read{path,purpose} + conditional_read{id,when,paths,purpose} + allowed_discovery/forbidden/read_completion 説明文字列リスト）に統一する。

      ## 背景

      配布対象の src/opencode/** には、AgentDevFlow 本体固有 docs/specs/{foundations,responsibilities,quality,integrity,local,authoring,commands,skills,workflows}/** への直接参照が残る。利用先プロジェクトはこの内部構成を持たないため、参照先が存在せず、コマンド・スキルが読むべき文書を解決できない。本体固有 docs 構成を配布コードの固定知識として埋め込んでいることが原因である。

      実装本文と doc-inputs を分離する。実装本文（src/opencode/commands/**, src/opencode/skills/**）はプロジェクト非依存・単体利用可能とし、docs/** への直接参照を持たない。doc-inputs（.agentdev/doc-inputs/**）はプロジェクト固有情報を対象とし、そのプロジェクトの adr, req, spec を具体的に参照する。この分離により、実装は配布・単体利用可能、プロジェクト固有の docs 参照は doc-inputs に外部化される。

      ## 要件

      ### 利用先プロジェクトに要求する docs 構成

      - AgentDevFlow が利用先プロジェクトに要求する docs 構成は docs/requirements/, docs/adr/, docs/specs/, docs/DOC-MAP.md に限定する。
      - docs/specs/ 配下の内部ディレクトリ構成（foundations, responsibilities 等）は利用先プロジェクトに要求しない。

      ### 実装本文のプロジェクト非依存性

      - src/opencode/commands/agentdev/**/*.md, src/opencode/skills/agentdev-*/SKILL.md, src/opencode/skills/agentdev-*/references/**/*.md から、AgentDevFlow 本体固有 docs/specs/{foundations,responsibilities,quality,integrity,local,authoring,commands,skills,workflows}/** 直接参照を除去する。
      - 例外として、SPEC パスの例示、検査対象パスの指定は移行対象外とする。
      - 実装本文が前提としてよい固定知識は docs/ ディレクトリ構成（requirements/adr/specs）と DOC-MAP.md のみとする。docs/specs/foundations/** 等の内部構成は実装本文の前提としない。

      ### doc-inputs 機構

      - .agentdev/config.yaml をプロジェクト共通のルート設定として置く。保持するのは version, kind, roots, doc_inputs のみとする。
      - .agentdev/config.yaml に文書分類、REQ 健全性、integrity rule catalog、command/skill 方針などの意味ロール名を共通キーとして置かない。
      - .agentdev/doc-inputs/commands/<command>.yaml を公開コマンドごとに1ファイル置く。
      - .agentdev/doc-inputs/skills/<skill>.yaml を、project docs 参照を持つスキルのみに1ファイル置く。reference ごとの doc-input は作らない。
      - doc-input 原本は各プロジェクトが所有する。AgentDevFlow 本体は初期テンプレート、schema、検査を提供し、consumer はテンプレートを初期値として取り込みカスタマイズする。
      - doc-input の paths は docs/DOC-MAP.md または docs 配下 README から探索可能でなければならない。

      ### doc-input の schema

      - command doc-input はフロントマタ（version: 1, kind: command-doc-input, id: /agentdev/<command>）と must_read, conditional_read, allowed_discovery, forbidden, read_completion を持つ。
      - must_read は path, purpose を持つオブジェクトのリストである。
      - conditional_read は id, when, paths, purpose を持つオブジェクトのリストである。
      - allowed_discovery, forbidden, read_completion は説明文字列のリストである。
      - skill doc-input はフロントマタ（version: 1, kind: skill-doc-input, id: <skill>）と conditional_read, allowed_discovery, forbidden を持つ。must_read, read_completion を持たない。

      ### 配布コードへの doc-inputs 手順の組み込み

      - 各コマンド本文に共通の doc-inputs 手順を置く。手順は .agentdev/config.yaml 読込、対応する doc-input 読込、must_read の読込、conditional_read の該当時のみ paths 読込、doc-input 未列挙の docs/specs/** 内部パスを固定知識として読みに行かない、doc-input が存在しない場合は roots と明示入力のみを使う、の6歩からなる。
      - 各スキル SKILL.md に doc-input 参照方針を置く。参照方針は、前提とする固定知識の範囲、doc-input の読込契約、docs/specs/** 内部パスの固定知識化の禁止、doc-input 未配置時の挙動、の4項目からなる。

      ### 仕様文書の整備

      - docs/specs/foundations/project-doc-inputs.md を追加し、config.yaml と doc-input の責務、schema、command と skill 本文に残す普遍手順、本体固有 docs/specs/** 直接参照の禁止範囲、明示入力と draft/artifact 対象パスと DOC-MAP/README 探索の許可範囲、doc-input paths の探索可能性要件を定義する。
      - docs/specs/authoring/command-file-format.md に、コマンド本文が doc-inputs 手順のみを持ち具体的な project docs 内部パスを固定しないことを追加する。
      - docs/specs/skills/agentdev-skill-authoring.md に、スキル本文と references の project docs 参照を skill doc-input に集約することを追加する。
      - docs/specs/integrity/rules/IR-056-project-doc-input-integrity.md を追加し、integrity-rule-catalog.md に登録する。IR-056 は config.yaml、doc-input、DOC-MAP 探索可能性、配布コマンド・スキル本文の固定直接参照排除を定義する。
      - docs/DOC-MAP.md に project-doc-inputs.md への導線を追加する。

      ### 検査と診断コマンド

      - .opencode/skills/repo-agentdev-integrity/scripts/check_doc_inputs.ts を新設する。検査項目は config.yaml の存在と schema 適合、roots パスの存在、doc_inputs.commands と doc_inputs.skills ディレクトリの存在、公開コマンドごとの command doc-input の存在、各 doc-input の schema 適合（フロントマタ version/kind/id、must_read/conditional_read のオブジェクト構造）、paths の存在、paths の DOC-MAP 探索可能性、配布コードの直接参照残存、.agentdev/doc-inputs/** 内の docs/specs/** 参照は正当な参照として扱うこと、である。
      - check_doc_inputs.test.ts を併設する。
      - /agentdev/inspect-doc-inputs を読み取り専用診断コマンドとして新設する。対応 SPEC docs/specs/commands/inspect-doc-inputs.md と .agentdev/doc-inputs/commands/inspect-doc-inputs.yaml を併設する。

      ### 既存ワークフローへの組み込み

      - req-save は REQ/ADR 更新後に DOC-MAP または doc-input 更新要否を確認する。
      - spec-save は SPEC 追加、移動、分割後に DOC-MAP と doc-input 更新要否を確認する。doc-input 参照先 SPEC を移動した場合はエラーにする。
      - case-close は完了前に doc-input 検査を strict に実行する。
      - inspect-docs は DOC-MAP と docs 本文の整合診断に doc-input 参照先の探索可能性診断を加える。
      - inspect-skills は command と skill 本文が doc-input 経由か診断する。
      - repo-local docs-check は check_doc_inputs.ts を呼び出し IR-056 として診断する。

      ## 受け入れ基準

      - .agentdev/config.yaml が存在し、schema に適合する。
      - 公開コマンド分の .agentdev/doc-inputs/commands/*.yaml が存在する。
      - project docs 参照を持つスキルについて .agentdev/doc-inputs/skills/<skill>.yaml が存在する。
      - skill doc-input はスキル単位で1ファイルに集約されている。
      - 各 doc-input がフロントマタ（version, kind, id）を持つ。
      - command doc-input は must_read{path,purpose}, conditional_read{id,when,paths,purpose}, allowed_discovery, forbidden, read_completion を持つ。
      - skill doc-input は conditional_read{id,when,paths,purpose}, allowed_discovery, forbidden を持ち、must_read, read_completion を持たない。
      - src/opencode/commands/agentdev/**/*.md に AgentDevFlow 本体固有 docs/specs/** 直接参照が残っていない（SPEC パス例示、検査対象パス指定は除く）。
      - src/opencode/skills/agentdev-*/SKILL.md と src/opencode/skills/agentdev-*/references/**/*.md に同一の直接参照が残っていない（同例外）。
      - 各コマンド本文に doc-inputs 手順（6歩）が配置されている。
      - 各スキル SKILL.md に doc-input 参照方針（4項目）が配置されている。
      - .agentdev/doc-inputs/** の paths がすべて存在する。
      - .agentdev/doc-inputs/** の paths が docs/DOC-MAP.md または docs 配下 README から探索可能である。
      - docs/DOC-MAP.md は探索索引として整備され、コマンド・スキル別の must_read / conditional_read 原本を持たない。
      - .agentdev/config.yaml はルート設定に限定され、意味ロール名を共通キーとして持たない。
      - check_doc_inputs.ts のテストが通る。
      - /agentdev/inspect-doc-inputs が doc-input 検査結果を診断として出力できる。
      - case-close または repo-local docs-check で IR-056 が strict に通る。

  - id: ACT-ADR-001
    artifact: adr
    operation: update
    target: docs/adr/ADR-0133.md
    source_items: [AG-001, AG-002, AG-003, AG-006]
    content: |
      ---
      id: ADR-0133
      title: "Doc Inputs Architecture"
      status: accepted
      created: "2026-07-02"
      updated: "2026-07-02"
      ---

      # ADR-0133: Doc Inputs Architecture

      ## 背景

      AgentDevFlow 配布コマンド・スキル本文（src/opencode/commands/**, src/opencode/skills/**）は、AgentDevFlow 本体固有の docs/specs/{foundations,responsibilities,quality,integrity,local,authoring,commands,skills,workflows}/** への直接参照を保持する。

      利用先プロジェクトはこの内部ディレクトリ構成を持たない。配布コードが参照するパスが存在せず、コマンド・スキルが読むべき文書を解決できない。本体固有 docs 構成を配布コードの固定知識として埋め込んでいることが原因である。

      この問題を解決するには、本体固有 docs 構成を配布コードから分離し、プロジェクト別に解決可能な仕組みが必要である。実装本文をプロジェクト非依存にし、プロジェクト固有の docs 参照を外部化する doc-inputs 機構を採用する。

      ## 決定

      doc-inputs を、実行時 docs 参照の外部化機構として採用する。実装本文（src/opencode/commands/**, src/opencode/skills/**）はプロジェクト非依存・単体利用可能とし、docs/** への直接参照を持たない。doc-inputs（.agentdev/doc-inputs/**）はプロジェクト固有情報を対象とし、そのプロジェクトの adr, req, spec を具体的に参照してよい。

      doc-inputs は3層で構成する。

      第1層は .agentdev/config.yaml である。プロジェクト共通のルート設定を持ち、保持するのは version, kind, roots, doc_inputs のみとする。文書分類、REQ 健全性、integrity rule catalog、command/skill 方針などの意味ロール名は共通キーとして置かない。

      第2層は .agentdev/doc-inputs/commands/<command>.yaml である。公開コマンドごとに1ファイルを置く。command doc-input はフロントマタ（version: 1, kind: command-doc-input, id: /agentdev/<command>）と must_read, conditional_read, allowed_discovery, forbidden, read_completion を持つ。must_read は path, purpose を持つオブジェクトのリスト、conditional_read は id, when, paths, purpose を持つオブジェクトのリスト、allowed_discovery, forbidden, read_completion は説明文字列のリストである。AgentDevFlow 本体リポジトリでは各 paths に現在の本体 SPEC パスを書いてよい。利用先プロジェクトでは同じコマンド ID の doc-input が別パスを指してよい。

      第3層は .agentdev/doc-inputs/skills/<skill>.yaml である。project docs 参照を持つスキルのみに1ファイルを置き、スキル単位で1ファイルに集約する。reference ごとの doc-input は作らない。skill doc-input はフロントマタ（version: 1, kind: skill-doc-input, id: <skill>）と conditional_read, allowed_discovery, forbidden を持ち、must_read, read_completion を持たない。

      doc-input の schema は RU-20260701 形式に統一する。各 doc-input オブジェクトは path と目的（purpose）を持ち、conditional_read は条件（when）と識別子（id）を持つ。allowed_discovery, forbidden, read_completion は説明文字列のリストとする。

      doc-input 原本は各プロジェクトが所有する。AgentDevFlow 本体は初期テンプレート、schema、検査を提供し、consumer はテンプレートを初期値として取り込みカスタマイズする（ハイブリッド方式）。

      AgentDevFlow が利用先プロジェクトに要求する docs 構成は docs/requirements/, docs/adr/, docs/specs/, docs/DOC-MAP.md に限定する。docs/specs/ 配下の内部ディレクトリ構成は要求しない。実装本文が前提としてよい固定知識は docs/ ディレクトリ構成（requirements/adr/specs）と DOC-MAP.md のみとする。

      DOC-MAP（docs/DOC-MAP.md）は docs 配下文書の AI エージェント向け探索索引とし、doc-input 原本にはしない。

      命名は doc-inputs とする。read contract から doc-inputs に改名した。contract の契約ニュアンスよりも、実装本文にとっての入力（input）であることを示す命名が本質に合致するためである。

      ## 検討した代替案

      ### 代替案 A: 本体固有 docs 構成を利用先にも要求する

      利用先プロジェクトに docs/specs/{foundations,responsibilities,...} と同じ構成を要求する。採用しない。docs/specs/ 配下の内部構成は AgentDevFlow 本体の実装詳細であり、利用先プロジェクトの関心事ではないためである。

      ### 代替案 B: 配布コードから docs 参照を完全除去する

      コマンド・スキル本文から docs 参照を一切削除し、実行時にユーザーが都度指定する方式にする。採用しない。AgentDevFlow が規定する docs 構成（REQ/ADR/SPEC 等）への導線がないと、コマンドが実行時に行うべき探索手順が再現できなくなるためである。

      ### 代替案 C: DOC-MAP にコマンド・スキル別 must read 表を持たせる

      DOC-MAP に作業種別ごとの must read 表を置き、doc-inputs を別途設けない。採用しない。DOC-MAP が探索索引という一つの責務に集中できなくなり、コマンド・スキル別の契約管理が DOC-MAP に混入するためである。DOC-MAP は探索索引、doc-inputs は実行時参照契約と、責務を分離する。

      ## 結果

      - 配布コードは本体固有 docs/specs/** 内部パスを固定知識として持たなくなる。
      - 利用先プロジェクトは .agentdev/config.yaml と必要な doc-input を保持する義務を負う。
      - AgentDevFlow 本体リポジトリは、初期テンプレート、schema、検査、inspect-doc-inputs コマンドを提供し、consumer が取り込めるようにする。
      - doc-input の paths は docs/DOC-MAP.md または docs 配下 README から探索可能でなければならない。
      - 本 ADR は ADR-0104 に relates-to し、ADR-0104 を supersede しない。

      ## 関連

      - ADR-0104（実行時独立性）: 本 ADR は実行時独立性の具体化機構を提供する。supersede しない。

  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-update
    target: docs/specs/foundations/project-read-contracts.md
    source_items: [AG-002, AG-003, AG-004, AG-005, AG-006]
    content: |
      対象 SPEC を project-read-contracts.md から project-doc-inputs.md に改名し、全面書換える（rename は spec-save 実行時、または実装フェーズで git mv により処理）。以下を定義する。

      - config.yaml の schema: version, kind, roots, doc_inputs のみ。意味ロール名は持たない。
      - command doc-input の schema: フロントマタ（version: 1, kind: command-doc-input, id: /agentdev/<command>）、must_read{path,purpose} のリスト、conditional_read{id,when,paths,purpose} のリスト、allowed_discovery/forbidden/read_completion は説明文字列のリスト。
      - skill doc-input の schema: フロントマタ（version: 1, kind: skill-doc-input, id: <skill>）、conditional_read{id,when,paths,purpose} のリスト、allowed_discovery/forbidden は説明文字列のリスト。must_read, read_completion は持たない。
      - 各 doc-input オブジェクトの YAML 構文例（must_read, conditional_read の具体的な記述例）。
      - コマンド本文に残す doc-inputs 手順（6歩）の詳細文面。.agentdev/config.yaml 読込、対応する doc-input 読込、must_read の読込、conditional_read の該当時のみ paths 読込、doc-input 未列挙の docs/specs/** 内部パスを固定知識として読みに行かない、doc-input が存在しない場合は roots と明示入力のみを使う。
      - スキル SKILL.md に残す doc-input 参照方針（4項目）の詳細文面。前提とする固定知識の範囲、doc-input の読込契約、docs/specs/** 内部パスの固定知識化の禁止、doc-input 未配置時の挙動。
      - 本体固有 docs/specs/** 直接参照の禁止範囲。例外（SPEC パス例示、検査対象パス指定）の定義。
      - 明示入力と draft/artifact 対象パスと DOC-MAP/README 探索の許可範囲。
      - doc-input paths の探索可能性要件。DOC-MAP.md または docs 配下 README から探索可能であること。

  - id: ACT-SPEC-002
    artifact: spec
    operation: spec-update
    target: docs/specs/authoring/command-file-format.md
    target_area: "## project read contract 手順"
    source_items: [AG-004]
    content: |
      該当セクション（現在の project read contract 手順関連、§24-37 相当）を doc-inputs 命名に読み替え、コマンド本文が doc-inputs 手順（6歩）のみを持ち、具体的な project docs 内部パスを固定しないことを明記する。doc-input の schema（version/kind/id フロントマタ + must_read{path,purpose} + conditional_read{id,when,paths,purpose}）への適合をコマンド本文の要件として追加する。

  - id: ACT-SPEC-003
    artifact: spec
    operation: spec-update
    target: docs/specs/skills/agentdev-skill-authoring.md
    target_area: "## project docs 参照"
    source_items: [AG-005]
    content: |
      該当セクションに、スキル本文と references の project docs 参照を skill doc-input に集約することを追加する。スキル SKILL.md に配置する doc-input 参照方針（4項目: 前提とする固定知識の範囲、doc-input の読込契約、docs/specs/** 内部パスの固定知識化の禁止、doc-input 未配置時の挙動）を明記する。

  - id: ACT-SPEC-004
    artifact: spec
    operation: spec-update
    target: docs/specs/integrity/rules/IR-056-project-read-contract-integrity.md
    source_items: [AG-003, AG-006, AG-007]
    content: |
      対象 IR を IR-056-project-read-contract-integrity.md から IR-056-project-doc-input-integrity.md に改名し（rename は実装フェーズで処理）、検査要件を拡張する。検査項目は以下とする。
      - config.yaml の存在と schema 適合（version, kind, roots, doc_inputs のみ）。
      - roots パスの存在。
      - doc_inputs.commands と doc_inputs.skills ディレクトリの存在。
      - 公開コマンドごとの command doc-input の存在。
      - 各 doc-input の schema 適合。フロントマタ（version: 1, kind: command-doc-input または skill-doc-input, id）の存在。command doc-input の must_read{path,purpose}, conditional_read{id,when,paths,purpose} オブジェクト構造。skill doc-input の conditional_read オブジェクト構造。allowed_discovery/forbidden/read_completion が説明文字列リストであること。
      - paths の存在。
      - paths の DOC-MAP 探索可能性。
      - 配布コード（src/opencode/commands/agentdev/**/*.md, src/opencode/skills/agentdev-*/SKILL.md, src/opencode/skills/agentdev-*/references/**/*.md）の直接参照残存（例外: SPEC パス例示、検査対象パス指定）。
      - .agentdev/doc-inputs/** 内の docs/specs/** 参照は正当な参照として扱うこと。
      integrity-rule-catalog.md の登録エントリを IR-056-project-doc-input-integrity に読み替える。

conflict_resolutions:
  - id: CR-001
    conflict: |
      doc-inputs は docs/specs/** を具体的に参照してよいか。実装本文の docs/specs/** 直接参照禁止と、doc-inputs の docs/specs/** 参照許可が一見矛盾する。
    resolution: |
      実装本文（src/opencode/**）と doc-inputs（.agentdev/doc-inputs/**）は役割が異なる。実装本文は配布・単体利用可能であるためプロジェクト非依存でなければならず、docs/** 直接参照を持たない。doc-inputs はプロジェクト固有情報を対象とする機構であり、そのプロジェクトの adr/req/spec を具体的に参照することが本質的な目的である。したがって doc-inputs 内の docs/specs/** 参照は正当であり、直接参照禁止の対象外とする。AG-006 で確定。
  - id: CR-002
    conflict: |
      実装本文が前提としてよい固定知識の範囲。docs/specs/foundations/** 等の内部構成を前提としてよいか。
    resolution: |
      実装本文が前提としてよい固定知識は docs/ ディレクトリ構成（requirements/adr/specs）と DOC-MAP.md のみとする。docs/specs/foundations/** 等の内部構成は前提としない。内部構成の知識は doc-inputs が吸収する。AG-001, AG-007 で確定。
  - id: CR-003
    conflict: |
      命名を読み替える全面変更の規模。単なる実装直しか要件変更か。
    resolution: |
      命名変更（read-contracts → doc-inputs）、schema 詳細化（RU-20260701 形式への統一）、手順ブロック・参照方針の実装要件明確化を伴うため、要件レベルの変更として REQ-0157 UPDATE と ADR-0133 UPDATE で処理する。単なる実装直しではない。

operation_units:
  - ou_id: OU-001
    source_ru: RU-20260701
    target_req: REQ-0157
    target_spec: docs/specs/foundations/project-doc-inputs.md
    operation: update
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      check_doc_inputs.ts を実行し、src/opencode/commands/agentdev/**/*.md と src/opencode/skills/agentdev-*/SKILL.md と src/opencode/skills/agentdev-*/references/**/*.md における AgentDevFlow 本体固有 docs/specs/{foundations,responsibilities,quality,integrity,local,authoring,commands,skills,workflows}/** 直接参照の残存を検査する。例外（SPEC パス例示、検査対象パス指定）を除外してカウントする。
    pass_criteria: |
      直接参照残存が0件であること。
    on_failure: |
      fix-and-reverify。残存参照を doc-inputs 経由に修正し、再検証する。
  - id: TS-002
    target_item: AG-003
    verification: |
      check_doc_inputs.ts を実行し、.agentdev/doc-inputs/commands/*.yaml と .agentdev/doc-inputs/skills/*.yaml の各ファイルがフロントマタ（version: 1, kind: command-doc-input または skill-doc-input, id）を持ち、command doc-input は must_read{path,purpose}, conditional_read{id,when,paths,purpose} のオブジェクト構造を持ち、skill doc-input は conditional_read のオブジェクト構造を持ち、allowed_discovery/forbidden/read_completion が説明文字列リストであることを検査する。
    pass_criteria: |
      全 doc-input が schema に適合すること。skill doc-input が must_read, read_completion を持たないこと。
    on_failure: |
      fix-and-reverify。schema 違反の doc-input を修正し、再検証する。
  - id: TS-003
    target_item: AG-004
    verification: |
      src/opencode/commands/agentdev/*.md の各コマンド本文に doc-inputs 手順（6歩）ブロックが存在することを検査する。手順ブロックの存在と、6歩の各要素（config.yaml 読込、doc-input 読込、must_read 読込、conditional_read 該当時 paths 読込、doc-input 未列挙パスの固定知識化禁止、doc-input 未存在時の roots/明示入力使用）の記述を確認する。
    pass_criteria: |
      全コマンド本文に doc-inputs 手順（6歩）が配置されていること。
    on_failure: |
      fix-and-reverify。手順ブロックが未配置のコマンドに追加し、再検証する。
  - id: TS-004
    target_item: AG-005
    verification: |
      src/opencode/skills/agentdev-*/SKILL.md の各スキル本文に doc-input 参照方針（4項目: 前提とする固定知識の範囲、doc-input の読込契約、docs/specs/** 内部パスの固定知識化の禁止、doc-input 未配置時の挙動）が存在することを検査する。
    pass_criteria: |
      project docs 参照を持つ全スキルの SKILL.md に doc-input 参照方針（4項目）が配置されていること。
    on_failure: |
      fix-and-reverify。参照方針が未配置のスキルに追加し、再検証する。
  - id: TS-005
    target_item: AG-007
    verification: |
      /agentdev/inspect-doc-inputs コマンドを実行し、doc-input 検査結果が診断として出力されることを確認する。出力に config.yaml 適合、doc-input schema 適合、paths 存在、探索可能性、直接参照残存の各項目が含まれることを確認する。
    pass_criteria: |
      inspect-doc-inputs が検査結果を診断として出力できること。ok=true の場合は failures 0、異常時は該当項目が failures に列挙されること。
    on_failure: |
      fix-and-reverify。コマンドまたは check_doc_inputs.ts の不具合を修正し、再検証する。
  - id: TS-006
    target_item: AG-007
    verification: |
      case-close または repo-local docs-check を実行し、IR-056 が strict に通ることを確認する。
    pass_criteria: |
      IR-056 の全検査項目が strict に通ること（failures 0）。
    on_failure: |
      fix-and-reverify。不合格項目の原因を修正し、再検証する。
  - id: TS-007
    target_item: AG-006
    verification: |
      check_doc_inputs.ts を実行し、.agentdev/doc-inputs/** の全 paths が存在し、docs/DOC-MAP.md または docs 配下 README から探索可能であることを検査する。
    pass_criteria: |
      全 paths が存在し、DOC-MAP.md または README から探索可能であること。
    on_failure: |
      fix-and-reverify。存在しない paths を修正するか、DOC-MAP/README の導線を追加し、再検証する。

case_open_hints:
  epic_needed: false
  wave_hints:
    - "Wave 1: REQ-0157, ADR-0133 の UPDATE（req-save）。doc-inputs 命名と schema 形式を確定し、後続 Wave の基盤とする。"
    - "Wave 2: SPEC の更新（spec-save）。project-read-contracts.md → project-doc-inputs.md（rename + 全面書換）、command-file-format.md, agentdev-skill-authoring.md, IR-056 の読み替え。"
    - "Wave 3: 検査ツールの拡張。check_read_contracts.ts → check_doc_inputs.ts（rename + schema 拡張）、check_doc_inputs.test.ts の更新。inspect-read-contracts → inspect-doc-inputs（コマンド、SPEC、doc-input の rename）。"
    - "Wave 4: doc-inputs ファイル群の書換。.agentdev/read-contracts/** 30ファイルを .agentdev/doc-inputs/** に rename し、RU-20260701 形式（フロントマタ + must_read{path,purpose} + conditional_read{id,when,paths,purpose}）に書換える。config.yaml の read_contracts → doc_inputs 読替。"
    - "Wave 5: 実装本文への編集。各コマンド本文に doc-inputs 手順（6歩）ブロックを追加。各スキル SKILL.md に doc-input 参照方針（4項目）を追加。"
    - "Wave 6: ワークフロー組み込み箇所の読替と最終検証。req-save, spec-save, case-close, inspect-docs, inspect-skills, repo-local docs-check の read-contracts 参照を doc-inputs に読替。TS-001〜TS-007 の全検証を実施。"
```

# summary

req-define Step 1-7 を経て確定した要件。RU-20260701 の核心は実装本文と doc-inputs の分離にある。実装本文（src/opencode/**）はプロジェクト非依存・単体利用可能で docs/** 直接参照を持たず、doc-inputs（.agentdev/doc-inputs/**）はプロジェクト固有情報を対象とし adr/req/spec を具体的に参照する。

read-contracts から doc-inputs に改名し、schema を RU-20260701 形式（version/kind/id フロントマタ + must_read{path,purpose} + conditional_read{id,when,paths,purpose} + allowed_discovery/forbidden/read_completion 説明文字列リスト）に統一する。

変更は REQ-0157 UPDATE、ADR-0133 UPDATE（タイトル「Doc Inputs Architecture」）、SPEC project-doc-inputs.md 他3 SPEC 更新、IR-056 更新、check_doc_inputs.ts 拡張、doc-inputs 30ファイル書換、各コマンド本文への手順ブロック（6歩）追加、各スキル SKILL.md への参照方針（4項目）追加、inspect-doc-inputs への読替を含む。scale large、single Issue で case-open が分解を決定する。

検討経緯（RU 本質の再理解、AG-006 の撤回と doc-inputs の docs/specs/** 参照許可の確定）は conflict_resolutions に記録済み。後続コマンドは同じ内容をユーザーへ再確認しない。
