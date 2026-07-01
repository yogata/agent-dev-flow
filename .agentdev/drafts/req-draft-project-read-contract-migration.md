---
draft_type: req_draft
topic_slug: project-read-contract-migration
status: saved
created_at: 2026-07-02T00:00:00+09:00
source_rus:
  - RU-20260701-project-read-contract-migration
---

# draft-data

```yaml
work_type: feature

scale: standard

summary: >
  配布 command/skill 本文から AgentDevFlow 本体固有 docs/specs/** 直接参照（48ファイル136箇所）を除去し、
  プロジェクト別 read contract（.agentdev/config.yaml, .agentdev/read-contracts/{commands,skills}/**）経由に移行する。
  read contract 原本は各プロジェクトが所有し、agent-dev-flow は初期テンプレート、schema、検査、
  inspect-read-contracts コマンド、解決手順を提供する（ハイブリッド方式）。
  DOC-MAP は探索索引（read contract 原本ではない）に位置づけを明確化する。
  新規 ADR（read contract アーキテクチャ、ADR-0104 relates-to、supersede しない）で採用を決定し、
  ADR-0110 を DOC-MAP 責務明確化で UPDATE する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      read contract 機構を導入する。

      AgentDevFlow が利用先プロジェクトに要求する docs 構成は docs/requirements/, docs/adr/, docs/specs/, docs/DOC-MAP.md に限定する。docs/specs/ 配下の内部ディレクトリ構成（foundations, responsibilities, quality, integrity, local, authoring, commands, skills, workflows 等）は AgentDevFlow 本体リポジトリの内部構成であり、利用先プロジェクトに要求しない。

      機構は3層で構成する。第1層は .agentdev/config.yaml で、プロジェクト共通のルート設定を持つ。保持するのは version, kind, roots, read_contracts のみとする。文書分類、REQ 健全性、integrity rule catalog、command/skill 方針などの意味ロール名は共通キーとして置かない。これらは必要なコマンド・スキルの read contract から、プロジェクト固有の docs パスとして参照する。

      第2層は .agentdev/read-contracts/commands/<command>.yaml で、公開コマンドごとに1ファイルを置く。must_read, conditional_read, allowed_discovery, forbidden, read_completion の5項目を持つ。AgentDevFlow 本体リポジトリでは各 paths に現在の本体 SPEC パスを書いてよい。利用先プロジェクトでは同じコマンド ID の read contract が別パスを指してよい。

      第3層は .agentdev/read-contracts/skills/<skill>.yaml で、project docs 参照を持つスキルのみに1ファイルを置く。reference ごとの read contract は作らず、SKILL.md と references/**/*.md の project docs 依存をスキル単位で1ファイルに集約する。スキルは呼び出し元コマンドから渡された解決済み文脈を優先し、skill read contract は不足分の追加文脈として扱う。

      read contract 原本は各プロジェクトが所有する。agent-dev-flow 本体は初期テンプレート、schema、検査を提供し、consumer はテンプレートを初期値として取り込みカスタマイズする（ハイブリッド方式）。

  - id: AG-002
    content: |
      DOC-MAP（docs/DOC-MAP.md）の責務を探索索引に明確化する。

      DOC-MAP は docs 配下の REQ, ADR, SPEC, guides を探索するための AI エージェント向け文書索引とする。主要 REQ/ADR/SPEC への導線、guides 等補助文書への導線、docs 配下文書の読み方と探索順序、文書間の依存と関連、read contract で参照される docs 文書が探索可能であることを確認するための入口を持つ。

      DOC-MAP にコマンド・スキル別の must_read / conditional_read 表を持たせない。コマンド・スキル別の実行時参照契約は .agentdev/read-contracts/** に置き、DOC-MAP は read contract 原本ではない。

      この分離により、DOC-MAP は探索索引という単一責務に集中する。

  - id: AG-003
    content: |
      配布コード（src/opencode/commands/**, src/opencode/skills/**）の AgentDevFlow 本体固有 docs/specs/** 直接参照（48ファイル136箇所）を除去し、read contract 経由に切替える。

      除去対象は docs/specs/{foundations,responsibilities,quality,integrity,local,authoring,commands,skills,workflows}/** への直接参照である。実行時に読むべき docs 文書への参照は command または skill read contract の must_read, conditional_read へ移す。

      正当な例外は移行対象外とする。SPEC パスの例示、検査対象パスの指定はそのまま残す。本文説明のための例示に含まれる本体固有パスは、プロジェクト固有内部構成を前提にしない例示へ書き換える。コマンド出力テンプレートに含まれる本体固有パスは、固定出力されない汎用表現へ書き換える。

      各コマンド本文には共通の project read contract 手順を置く。手順は .agentdev/config.yaml 読込、対応する .agentdev/read-contracts/commands/<command>.yaml 読込、must_read の読込、conditional_read の該当時のみ paths 読込、read contract 未列挙の docs/specs/** 内部パスを固定知識として読みに行かない、read contract が存在しない場合は config.yaml の roots と明示入力のみを使う、の6歩からなる。

      各スキル SKILL.md には read contract 参照方針を置く。プロジェクト固有の docs/specs/** 内部構成を仮定しない、呼び出し元コマンドから渡された解決済み文脈を優先する、解決済み文脈がなく skill read contract が存在する場合のみ読む、read contract に列挙されていない docs/specs/** 内部パスを固定知識として参照しない、の4項目である。

  - id: AG-004
    content: |
      check_read_contracts.ts 検査と /agentdev/inspect-read-contracts コマンドを新設する。

      check_read_contracts.ts は repo-local 自己監査として、以下を検査する。.agentdev/config.yaml の存在と schema 適合、roots に定義されたパスの存在、read_contracts.commands と read_contracts.skills ディレクトリの存在、公開コマンドごとの command read contract の存在、各 read contract の schema 適合、read contract の paths の存在、read contract の paths が docs/DOC-MAP.md または docs 配下 README から探索可能であること、src/opencode/commands/agentdev/**/*.md に本体固有 docs/specs/** 直接参照が残っていないこと、src/opencode/skills/agentdev-*/SKILL.md と references/**/*.md に同一の直接参照が残っていないこと、.agentdev/read-contracts/** 内の docs/specs/** 参照は正当な参照として扱うこと。テスト check_read_contracts.test.ts を併設する。

      /agentdev/inspect-read-contracts は読み取り専用診断コマンドとする。.agentdev/config.yaml の検査、command と skill read contract の検査、read contract paths の存在検査、paths の DOC-MAP 探索可能性検査、command と skill 本文の固定直接参照残存検査を行い、finding を .agentdev/inspect/inbox/ に出力する。対応 SPEC docs/specs/commands/inspect-read-contracts.md と .agentdev/read-contracts/commands/inspect-read-contracts.yaml を併設する。

  - id: AG-005
    content: |
      REQ-0103 に read contract 経由の方針を最小限（1-2項目）で APPEND する。

      追記するのは、配布コマンド・スキル本文が AgentDevFlow 本体固有 docs/specs/** 内部パスを固定知識として参照しないこと、実行時 docs 参照はプロジェクト別の .agentdev/read-contracts/** 経由で解決することの2点である。

      REQ-0103 は159項目超の大規模 REQ であり、これ以上の肥大化を避けるため、詳細要件は新規 REQ（project-read-contract-migration）と新規 ADR（read-contract-architecture）に持たせ、REQ-0103 には方針のみを明示する。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: create
    target: new:project-read-contract-migration
    source_items: [AG-001, AG-003, AG-004]
    content: |
      # Project Read Contract Migration

      ## 概要

      AgentDevFlow 配布コマンド・スキル本文から、AgentDevFlow 本体固有 docs/specs/** 直接参照を除去する。実行時 docs 参照は、プロジェクト別の .agentdev/read-contracts/** 経由に移行する。

      ## 背景

      配布対象の src/opencode/** には、AgentDevFlow 本体固有 docs/specs/{foundations,responsibilities,quality,integrity,local,authoring,commands,skills,workflows}/** への直接参照が約48ファイル136箇所残る。利用先プロジェクトはこの内部構成を持たないため、参照先が存在せず、コマンド・スキルが読むべき文書を解決できない。本体固有 docs 構成を配布コードの固定知識として埋め込んでいることが原因である。

      ## 要件

      ### 利用先プロジェクトに要求する docs 構成

      - AgentDevFlow が利用先プロジェクトに要求する docs 構成は docs/requirements/, docs/adr/, docs/specs/, docs/DOC-MAP.md に限定する。
      - docs/specs/ 配下の内部ディレクトリ構成（foundations, responsibilities 等）は利用先プロジェクトに要求しない。

      ### read contract 機構

      - .agentdev/config.yaml をプロジェクト共通のルート設定として置く。保持するのは version, kind, roots, read_contracts のみとする。
      - .agentdev/config.yaml に文書分類、REQ 健全性、integrity rule catalog、command/skill 方針などの意味ロール名を共通キーとして置かない。
      - .agentdev/read-contracts/commands/<command>.yaml を公開コマンドごとに1ファイル置く。
      - command read contract は must_read, conditional_read, allowed_discovery, forbidden, read_completion を持つ。
      - .agentdev/read-contracts/skills/<skill>.yaml を、project docs 参照を持つスキルのみに1ファイル置く。reference ごとの read contract は作らない。
      - skill read contract は conditional_read, allowed_discovery, forbidden を持つ。
      - read contract 原本は各プロジェクトが所有する。agent-dev-flow 本体は初期テンプレート、schema、検査を提供し、consumer はテンプレートを初期値として取り込みカスタマイズする。
      - read contract の paths は docs/DOC-MAP.md または docs 配下 README から探索可能でなければならない。

      ### 配布コード直接参照の除去

      - src/opencode/commands/agentdev/**/*.md から AgentDevFlow 本体固有 docs/specs/{foundations,responsibilities,quality,integrity,local,authoring,commands,skills,workflows}/** 直接参照を除去する。
      - src/opencode/skills/agentdev-*/SKILL.md と src/opencode/skills/agentdev-*/references/**/*.md から同一の直接参照を除去する。
      - 例外として、SPEC パスの例示、検査対象パスの指定は移行対象外とする。
      - 各コマンド本文に共通の project read contract 手順を置く。手順は .agentdev/config.yaml 読込、対応する read contract 読込、must_read の読込、conditional_read の該当時のみ paths 読込、read contract 未列挙の docs/specs/** 内部パスを固定知識として読みに行かない、read contract が存在しない場合は roots と明示入力のみを使う、の6歩からなる。
      - 各スキル SKILL.md に read contract 参照方針を置く。

      ### 仕様文書の整備

      - docs/specs/foundations/project-read-contracts.md を追加し、config.yaml と read contract の責務、schema、command と skill 本文に残す普遍手順、本体固有 docs/specs/** 直接参照の禁止範囲、明示入力と draft/artifact 対象パスと DOC-MAP/README 探索の許可範囲、read contract paths の探索可能性要件を定義する。
      - docs/specs/authoring/command-file-format.md に、コマンド本文が project read contract 手順のみを持ち具体的な project docs 内部パスを固定しないことを追加する。
      - docs/specs/skills/agentdev-skill-authoring.md に、スキル本文と references の project docs 参照を skill read contract に集約することを追加する。
      - docs/specs/integrity/rules/IR-056-project-read-contract-integrity.md を追加し、integrity-rule-catalog.md に登録する。IR-056 は config.yaml、read contract、DOC-MAP 探索可能性、配布コマンド・スキル本文の固定直接参照排除を定義する。
      - docs/DOC-MAP.md に project-read-contracts.md への導線を追加する。

      ### 検査と診断コマンド

      - .opencode/skills/repo-agentdev-integrity/scripts/check_read_contracts.ts を新設する。検査項目は config.yaml の存在と schema 適合、roots パスの存在、read_contracts.commands と read_contracts.skills ディレクトリの存在、公開コマンドごとの command read contract の存在、各 read contract の schema 適合、paths の存在、paths の DOC-MAP 探索可能性、配布コードの直接参照残存、.agentdev/read-contracts/** 内の docs/specs/** 参照は正当な参照として扱うこと、の9点である。
      - check_read_contracts.test.ts を併設する。
      - /agentdev/inspect-read-contracts を読み取り専用診断コマンドとして新設する。対応 SPEC docs/specs/commands/inspect-read-contracts.md と .agentdev/read-contracts/commands/inspect-read-contracts.yaml を併設する。

      ### 既存ワークフローへの組み込み

      - req-save は REQ/ADR 更新後に DOC-MAP または read contract 更新要否を確認する。
      - spec-save は SPEC 追加、移動、分割後に DOC-MAP と read contract 更新要否を確認する。read contract 参照先 SPEC を移動した場合はエラーにする。
      - case-close は完了前に read contract 検査を strict に実行する。
      - inspect-docs は DOC-MAP と docs 本文の整合診断に read contract 参照先の探索可能性診断を加える。
      - inspect-skills は command と skill 本文が read contract 経由か診断する。
      - repo-local docs-check は check_read_contracts.ts を呼び出し IR-056 として診断する。

      ## 受け入れ基準

      - .agentdev/config.yaml が存在し、schema に適合する。
      - 公開コマンド分の .agentdev/read-contracts/commands/*.yaml が存在する。
      - project docs 参照を持つスキルについて .agentdev/read-contracts/skills/<skill>.yaml が存在する。
      - skill read contract はスキル単位で1ファイルに集約されている。
      - src/opencode/commands/agentdev/**/*.md に AgentDevFlow 本体固有 docs/specs/** 直接参照が残っていない（SPEC パス例示、検査対象パス指定は除く）。
      - src/opencode/skills/agentdev-*/SKILL.md と src/opencode/skills/agentdev-*/references/**/*.md に同一の直接参照が残っていない（同例外）。
      - .agentdev/read-contracts/** の paths がすべて存在する。
      - .agentdev/read-contracts/** の paths が docs/DOC-MAP.md または docs 配下 README から探索可能である。
      - docs/DOC-MAP.md は探索索引として整備され、コマンド・スキル別の must_read / conditional_read 原本を持たない。
      - .agentdev/config.yaml はルート設定に限定され、意味ロール名を共通キーとして持たない。
      - check_read_contracts.ts のテストが通る。
      - /agentdev/inspect-read-contracts が read contract 検査結果を診断として出力できる。
      - case-close または repo-local docs-check で IR-056 が strict に通る。

  - id: ACT-ADR-001
    artifact: adr
    operation: create
    target: new:read-contract-architecture
    source_items: [AG-001]
    content: |
      # ADR: Read Contract Architecture

      ## Status

      Accepted.

      ## Context

      AgentDevFlow 配布コマンド・スキル本文（src/opencode/commands/**, src/opencode/skills/**）は、AgentDevFlow 本体固有の docs/specs/{foundations,responsibilities,quality,integrity,local,authoring,commands,skills,workflows}/** への直接参照を約48ファイル136箇所で保持する。

      利用先プロジェクトはこの内部ディレクトリ構成を持たない。配布コードが参照するパスが存在せず、コマンド・スキルが読むべき文書を解決できない。本体固有 docs 構成を配布コードの固定知識として埋め込んでいることが原因である。

      この問題を解決するには、本体固有 docs 構成を配布コードから分離し、プロジェクト別に解決可能な仕組みが必要である。

      ## Decision

      project read contract を、実行時 docs 参照の外部化機構として採用する。

      project read contract は3層で構成する。

      第1層は .agentdev/config.yaml である。プロジェクト共通のルート設定を持ち、保持するのは version, kind, roots, read_contracts のみとする。文書分類、REQ 健全性、integrity rule catalog、command/skill 方針などの意味ロール名は共通キーとして置かない。

      第2層は .agentdev/read-contracts/commands/<command>.yaml である。公開コマンドごとに1ファイルを置き、must_read, conditional_read, allowed_discovery, forbidden, read_completion を持つ。AgentDevFlow 本体リポジトリでは各 paths に現在の本体 SPEC パスを書いてよい。利用先プロジェクトでは同じコマンド ID の read contract が別パスを指してよい。

      第3層は .agentdev/read-contracts/skills/<skill>.yaml である。project docs 参照を持つスキルのみに1ファイルを置き、スキル単位で1ファイルに集約する。reference ごとの read contract は作らない。

      read contract 原本は各プロジェクトが所有する。AgentDevFlow 本体は初期テンプレート、schema、検査を提供し、consumer はテンプレートを初期値として取り込みカスタマイズする（ハイブリッド方式）。

      AgentDevFlow が利用先プロジェクトに要求する docs 構成は docs/requirements/, docs/adr/, docs/specs/, docs/DOC-MAP.md に限定する。docs/specs/ 配下の内部ディレクトリ構成は要求しない。

      DOC-MAP（docs/DOC-MAP.md）は docs 配下文書の AI エージェント向け探索索引とし、read contract 原本にはしない。

      ## Considered Alternatives

      ### 代替案 A: 本体固有 docs 構成を利用先にも要求する

      利用先プロジェクトに docs/specs/{foundations,responsibilities,...} と同じ構成を要求する。採用しない。docs/specs/ 配下の内部構成は AgentDevFlow 本体の実装詳細であり、利用先プロジェクトの関心事ではないためである。

      ### 代替案 B: 配布コードから docs 参照を完全除去する

      コマンド・スキル本文から docs 参照を一切削除し、実行時にユーザーが都度指定する方式にする。採用しない。AgentDevFlow が規定する docs 構成（REQ/ADR/SPEC 等）への導線がないと、コマンドが実行時に行うべき探索手順が再現できなくなるためである。

      ### 代替案 C: DOC-MAP にコマンド・スキル別 must read 表を持たせる

      DOC-MAP に作業種別ごとの must read 表を置き、read contract を別途設けない。採用しない。DOC-MAP が探索索引という一つの責務に集中できなくなり、コマンド・スキル別の契約管理が DOC-MAP に混入するためである。DOC-MAP は探索索引、read contract は実行時参照契約と、責務を分離する。

      ## Consequences

      - 配布コードは本体固有 docs/specs/** 内部パスを固定知識として持たなくなる。
      - 利用先プロジェクトは .agentdev/config.yaml と必要な read contract を保持する義務を負う。
      - AgentDevFlow 本体リポジトリは、初期テンプレート、schema、検査、inspect-read-contracts コマンドを提供し、consumer が取り込めるようにする。
      - read contract の paths は docs/DOC-MAP.md または docs 配下 README から探索可能でなければならない。
      - 本 ADR は ADR-0104 に relates-to し、ADR-0104 を supersede しない。

      ## Relates To

      - ADR-0104

  - id: ACT-ADR-002
    artifact: adr
    operation: update
    target: ADR-0110
    source_items: [AG-002]
    content: |
      ## DOC-MAP の責務明確化

      DOC-MAP（docs/DOC-MAP.md）は docs 配下文書の AI エージェント向け探索索引とする。

      DOC-MAP が持つ内容は以下に限定する。

      - 主要 REQ への導線
      - 主要 ADR への導線
      - 主要 SPEC への導線
      - guides 等補助文書への導線
      - docs 配下文書の読み方と探索順序
      - 文書間の依存と関連
      - read contract で参照される docs 文書が探索可能であることを確認するための入口

      DOC-MAP にコマンド・スキル別の must_read / conditional_read 表を持たせない。コマンド・スキル別の実行時参照契約は .agentdev/read-contracts/** に置く。

      この明確化により、DOC-MAP は探索索引という単一責務に集中し、read contract 機構（新規 ADR: read-contract-architecture で採用）と責務が分離される。

  - id: ACT-REQ-002
    artifact: req
    operation: append
    target: REQ-0103
    source_items: [AG-005]
    content: |
      ## read contract 経由の方針

      - AgentDevFlow 配布コマンド・スキル本文（src/opencode/commands/**, src/opencode/skills/**）は、AgentDevFlow 本体固有 docs/specs/** 内部パスを固定知識として参照しない。
      - 実行時 docs 参照はプロジェクト別の .agentdev/read-contracts/** 経由で解決する。

      詳細は新規 REQ（project-read-contract-migration）と新規 ADR（read-contract-architecture）を参照。

conflict_resolutions:
  - id: CR-001
    conflict: |
      RU-1（本 RU）と RU-2 の間で DOC-MAP の責務が衝突した。RU-1 は DOC-MAP を探索索引と位置づけ、RU-2 は DOC-MAP に読み込み契約・制御面を持たせる想定だった。
    resolution: |
      RU-1 を上位方針とし、DOC-MAP は探索索引とする。RU-2 はこれに追随する。DOC-MAP に作業種別別 must read 表を持たせない。コマンド・スキル別の実行時参照契約は .agentdev/read-contracts/** に置く。この分離により、DOC-MAP は探索索引という単一責務に集中する。

operation_units:
  - ou_id: OU-001
    source_ru: RU-20260701-project-read-contract-migration
    target_req: new:project-read-contract-migration
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      issue_number: 1351
      issue_url: https://github.com/yogata/agent-dev-flow/issues/1351
      req_id: REQ-0157
      status: opened
  - ou_id: OU-002
    source_ru: RU-20260701-project-read-contract-migration
    target_req: REQ-0103
    operation: append
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-003
    verification: |
      grep で src/opencode/commands/agentdev/**/*.md と src/opencode/skills/agentdev-*/{SKILL.md,references/**/*.md} 内の docs/specs/(foundations|responsibilities|quality|integrity|local|authoring|commands|skills|workflows)/ 直接参照を検出する。続けて check_read_contracts.ts を実行し、配布コードの直接参照排除検査が通ることを確認する。
    pass_criteria: |
      配布コードに AgentDevFlow 本体固有 docs/specs/** 直接参照が残存しない。正当な例外（SPEC パス例示、検査対象パス指定）は合格扱いとする。check_read_contracts.ts の当該検査項目がすべて合格する。
    on_failure: |
      fix-and-reverify。検出された直接参照を read contract へ移行し、例外に該当する箇所は例示または検査対象パス指定として扱えるか確認した上で残す。修正後に再検査する。

case_open_hints:
  epic_needed: false
```

# summary

本 draft は RU-20260701（Project Read Contract Migration）を req-draft 化したものである。

合意内容は AG-001 から AG-005 の5項目に集約した。AG-001 は3層の read contract 機構（.agentdev/config.yaml, read-contracts/commands/**, read-contracts/skills/**）とハイブリッド方式（agent-dev-flow はテンプレート・schema・検査を提供、consumer は初期値として取り込みカスタマイズ）の導入である。AG-002 は DOC-MAP を探索索引に明確化し、read contract 原本とはしない。AG-003 は配布コード（src/opencode/commands/**, src/opencode/skills/**）の本体固有 docs/specs/** 直接参照（48ファイル136箇所）を除去し、read contract 経由に切替える。AG-004 は check_read_contracts.ts 検査と /agentdev/inspect-read-contracts 診断コマンドの新設である。AG-005 は REQ-0103 へ read contract 経由方針を最小限で APPEND する。

RU 本文が挙げる実施内容は、REQ 保存後の実装段階で以下の順序で進める。

1. docs/specs/foundations/project-read-contracts.md 追加と DOC-MAP への導線追加
2. .agentdev/config.yaml 追加
3. .agentdev/read-contracts/commands/*.yaml を公開コマンド分追加
4. src/opencode/commands/agentdev/**/*.md の直接参照を read contract へ移行
5. src/opencode/skills/agentdev-*/SKILL.md と references/**/*.md の直接参照を skill read contract へ移行
6. 必要な .agentdev/read-contracts/skills/*.yaml を作成
7. docs/specs/authoring/command-file-format.md と docs/specs/skills/agentdev-skill-authoring.md を更新
8. IR-056 を追加し integrity-rule-catalog.md に登録
9. check_read_contracts.ts とテストを追加
10. /agentdev/inspect-read-contracts と対応 SPEC, read contract を追加
11. req-save, spec-save, case-close, inspect-docs, inspect-skills, repo-local docs-check へ検査を組み込み
12. 最終検査で原本 src/opencode/** の固定直接参照残存を解消

docs 配下の永続文書には本 RU を参照元として書かない。原本は src/opencode/、配置先は .opencode/ として扱い、配布コード修正は原本を中心に行う。AgentDevFlow 本体リポジトリの .agentdev/read-contracts/** には本体固有 SPEC パスを書いてよく、禁止対象は配布されるコードが本体固有パスを固定知識として持つことである。
