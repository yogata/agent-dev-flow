---
draft_type: req_draft
topic_slug: doc-inputs-guard-convergence
status: saved
created_at: 2026-07-02T00:00:00+09:00
source_rus:
  - RU-20260702
---

<!-- req_draft: doc-inputs 機構・docs guard・SPEC domain 分割の収束
     後続工程（req-save/spec-save/case-open/case-auto/case-run/case-close）が参照する
     原本の情報源は # draft-data 内の YAML コードブロックである。
     soft contract（ADR-0124）であり、LLM 推論経由で消費される。 -->

# draft-data

```yaml
work_type: feature

scale: large

summary: |-
  RU-20260702 は 7/2 版で導入済みの doc-inputs 機構（REQ-0157）と targeted docs guard（REQ-0158）の仕上げを実施する。具体的には、SPEC domain 分割後の旧SPEC直下配置前提の除去、inspect-doc-inputs 診断コマンドの探索導線登録、IR-056 regression_test 記述の実態整合、check_changed_docs.ts の full_docs_check_recommended 条件拡張と workflow別検査責務明確化、保存工程（req-save/spec-save/case-close）への changed docs guard 組込、doc-inputs allowed_discovery の充実、doc-inputs 更新契約の明文化、check_doc_inputs.ts schema 検査強化と異常系 fixture 追加、IR-057 legacy 検出語の単独/近接条件つき分離と例外条件整理、関連索引・所有表・カタログの更新を含む。REQ-0157 への5サブ要件 APPEND と REQ-0158 への7サブ要件 APPEND、および約30ファイルの SPEC/command/skill/doc-inputs/script update で構成される。新規REQ/ADR は不要。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |-
      inspect-doc-inputs 診断コマンドを探索導線へ登録する。docs/specs/commands/inspect-doc-inputs.md を docs/specs/README.md の command SPEC 一覧へ追加し、docs/DOC-MAP.md から辿れるようにする。status を docs/specs/README.md の status 表と一致させる。これにより、doc-inputs 機構の運用導線（探索→読込→検査→診断）が完結する。

  - id: AG-002
    content: |-
      IR-056 regression_test 記述を実態に合わせる。現状 IR-056 の regression_test は「(未実装)」と記載されているが、check_doc_inputs.test.ts が統合テストとして存在し、7/2 移行済みリポジトリで ok=true が確認済み。異常系 fixture は未整備。regression_test 記述を「check_doc_inputs.test.ts が統合テストとして存在、正常系 ok=true、異常系 fixture は AG-005 で追加」と更新する。あわせて IR-056 に allowed_discovery 空配列許容条件（DOC-MAP または docs 配下 README から探索可能な paths を持たない場合のみ空配列を許容）と探索許可記述条件を説明する。

  - id: AG-003
    content: |-
      doc-inputs の allowed_discovery を一律既定値（空配列）から、探索が必要な command（req-define/req-save/spec-save/case-close/inspect-docs/inspect-doc-inputs）で必要最小限の探索許可へ充実させる。探索許可は DOC-MAP および docs 配下 README 経由に限定する。spec-save は document-model.md 確認を明示的に許可する。allowed_discovery が空配列であることは「探索不要」を意味し、空配列を許容する条件と探索許可を記述する条件を IR-056 が説明する。

  - id: AG-004
    content: |-
      doc-inputs 更新契約を明文化する。以下の変更発生時に doc-inputs の更新が必要であることを定義する: (a) command または skill の追加・削除・責務変更、(b) SPEC の移動・分割・改名、(c) must_read の増減、(d) conditional_read の条件変更、(e) 探索範囲（allowed_discovery）の変更、(f) DOC-MAP または docs 配下 README の入口変更。case-close profile で doc-inputs 更新要否と check_doc_inputs.ts 実行要否を判定する手順を組み込む。

  - id: AG-005
    content: |-
      check_doc_inputs.ts の schema 検査を強化する。追加する検査項目: (1) allowed_discovery の配列性と空文字検出、(2) command id の /agentdev/<command> 形式とファイル名との対応、(3) skill id のファイル名との対応、(4) must_read[].path と conditional_read[].paths[] の存在検査、(5) DOC-MAP または docs 配下 README からの探索可能性検査、(6) skill doc-input の must_read/read_completion 禁止検査、(7) command doc-input の5項目（must_read/conditional_read/allowed_discovery/forbidden/read_completion）保有検査。異常系 fixture を8種追加する: allowed_discovery 非配列、allowed_discovery 空文字含む、command id 形式違反、skill id ファイル名不一致、must_read[].path 不在、conditional_read[].paths[] 不在、skill doc-input の must_read 持ち、command doc-input の5項目欠落。

  - id: AG-006
    content: |-
      spec-save の旧SPEC直下配置前提を廃止する。現状、spec-save.md（原本）と docs/specs/commands/spec-save.md（SPEC）に docs/specs/*.md、docs/specs/{topic-slug}.md、docs/specs/<existing-spec>.md、SPEC 用 new:{topic-slug} の旧直下前提が残存。これらを docs/specs/{domain}/{topic-slug}.md、docs/specs/**/*.md、target_spec: {operation, domain, slug} 構造化へ寄せる。対象ファイル（非 retired）: src/opencode/commands/agentdev/spec-save.md、docs/specs/commands/spec-save.md、src/opencode/commands/agentdev/templates/req-define/req-draft.md、src/opencode/skills/agentdev-req-file-manager/templates/doc_requirement.md、docs/specs/foundations/document-model.md、docs/specs/commands/_template.md、docs/specs/responsibilities/artifact-responsibilities.md、src/opencode/skills/agentdev-req-analysis/SKILL.md、src/opencode/skills/agentdev-req-analysis/references/req-define-detailed-gates.md、src/opencode/skills/agentdev-learning-pipeline/SKILL.md、src/opencode/skills/agentdev-doc-map/SKILL.md、src/opencode/skills/agentdev-req-structure-diagnostics/references/req-structure-review.md、docs/guides/req-case-flow.md、docs/guides/artifacts-and-state.md、docs/guides/project-docs-and-specs.md、docs/guides/glossary.md。requirements/adr 配下の歴史記載（REQ-0101.md、ADR-0123.md、ADR-0110.md）は例外（履歴マーカー付き）として更新対象外。

  - id: AG-007
    content: |-
      DOC-MAP.md と docs/specs/README.md の SPEC 配置表現を更新する。現状、DOC-MAP.md L13 は「SPEC | specs/*.md」、docs/specs/README.md L185 は「SPEC (specs/*.md)」と旧直下前提で記載。これらを specs/**/*.md またはドメイン分割説明へ更新する。SPEC 配下の二系統（実行単位: commands/skills/workflows、基盤: foundations/responsibilities/quality/integrity/local/authoring）を説明に含める。

  - id: AG-008
    content: |-
      check_changed_docs.ts の case-close profile における full_docs_check_recommended の判定条件を拡張する。現状は3条件（integrity rules/**、document-model.md、document-type-responsibilities.md）。以下の変更でも true になるよう拡張: docs/specs/integrity/rules/**、integrity-rule-catalog.md、rule-ownership.md、document-model.md、document-type-responsibilities.md、docs/DOC-MAP.md、docs/specs/README.md、.agentdev/config.yaml、.agentdev/doc-inputs/**。

  - id: AG-009
    content: |-
      check_changed_docs.ts の workflow別検査責務（req-save/spec-save/case-close profile）を command SPEC 説明と一致させる。各 profile の検査項目を詳細規定する。JSON 出力に doc_inputs_check_required と declared_files_check を追加する（既存フィールドは維持）。--declared-files <path...> 任意引数を追加し、Issue/PR で宣言した文書更新対象と実変更ファイルの対応を検査できるようにする。

  - id: AG-010
    content: |-
      req-save、spec-save、case-close の各保存工程へ変更ファイル限定 docs ガードを組み込む。各保存工程で check_changed_docs.ts を実行し、strict failure があれば停止、修正して再実行、warning は継続確認とする手順を command 本文（原本）と SPEC の両方へ記載する。

  - id: AG-011
    content: |-
      IR-057 legacy_local_generation_vocabulary を「単独検出語」と「近接条件つき検出語」に分離する。単独検出語（即 ng）: src/opencode-local/generation-flow.md、src/opencode-local/transform/、transform/generate.md、transform/review.md、transform/spec.md、local-opencode-transform、直接生成方式、生成フロー。近接条件つき検出語（同一ファイル内または近接行に旧 local 生成方式文脈語がある場合のみ ng）: 再生成、上書き保護、generated_by。obsolete-path-map.yaml、IR-057 本文、check_changed_docs.ts、check_integrity.ts の挙動を一致させる。

  - id: AG-012
    content: |-
      IR-057 旧SPEC直下パス検出の例外条件を整理する。例外（検出対象外）: obsolete-path-map.yaml 自体、IR-057 ルール説明としての旧パス例、retired 配下、テスト fixture、コードブロック内の明示的検査 fixture。通常検出対象: command 本文の実行手順、skill 本文/references 参照先、docs 現行本文の通常説明、README/DOC-MAP 探索導線、保存工程テンプレートの生成実パス例。check_changed_docs.ts の checkObsoleteSpecPath と例外処理をこの条件に一致させる。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-0157.md
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005]
    content: |-
      ## doc-inputs 探索導線と診断コマンドの整備

      ### inspect-doc-inputs の探索導線登録

      - docs/specs/README.md の command SPEC 一覧に inspect-doc-inputs を追加する。
      - docs/DOC-MAP.md から inspect-doc-inputs SPEC への導線を追加する。
      - docs/specs/commands/inspect-doc-inputs.md の status を docs/specs/README.md の status 表と一致させる。

      ### IR-056 regression_test 記述の実態整合

      - IR-056 の regression_test 記述を「(未実装)」から実態へ更新する。check_doc_inputs.test.ts が統合テストとして存在し、正常系 ok=true を確認済み。異常系 fixture は AG-005 で追加する。
      - IR-056 に allowed_discovery 空配列許容条件を説明する。空配列は「探索不要」を意味し、DOC-MAP または docs 配下 README から探索可能な paths を持たない場合のみ許容する。
      - IR-056 に探索許可記述条件を説明する。allowed_discovery に DOC-MAP または docs 配下 README 経由の探索許可を記述した場合は、その経路で探索可能な paths を持つことを要件とする。

      ### allowed_discovery の充実

      - doc-inputs の allowed_discovery を一律既定値（空配列）から、探索が必要な command で必要最小限の探索許可へ更新する。対象 command: req-define、req-save、spec-save、case-close、inspect-docs、inspect-doc-inputs。
      - 探索許可は DOC-MAP および docs 配下 README 経由に限定する。
      - spec-save の doc-input は document-model.md 確認を明示的に許可する。

      ### doc-inputs 更新契約の明文化

      - doc-inputs 更新契約を定義する。以下の変更発生時に doc-inputs の更新が必要である: (a) command または skill の追加・削除・責務変更、(b) SPEC の移動・分割・改名、(c) must_read の増減、(d) conditional_read の条件変更、(e) 探索範囲（allowed_discovery）の変更、(f) DOC-MAP または docs 配下 README の入口変更。
      - case-close は doc-inputs 更新要否と check_doc_inputs.ts 実行要否を完了判定に組み込む。

      ### check_doc_inputs.ts schema 検査強化

      - check_doc_inputs.ts に以下の schema 検査を追加する: (1) allowed_discovery の配列性と空文字検出、(2) command id の /agentdev/<command> 形式とファイル名との対応、(3) skill id のファイル名との対応、(4) must_read[].path と conditional_read[].paths[] の存在検査、(5) DOC-MAP または docs 配下 README からの探索可能性検査、(6) skill doc-input の must_read/read_completion 禁止検査、(7) command doc-input の5項目保有検査。
      - check_doc_inputs.test.ts に異常系 fixture を8種追加する: allowed_discovery 非配列、allowed_discovery 空文字含む、command id 形式違反、skill id ファイル名不一致、must_read[].path 不在、conditional_read[].paths[] 不在、skill doc-input の must_read 持ち、command doc-input の5項目欠落。

  - id: ACT-REQ-002
    artifact: req
    operation: append
    target: docs/requirements/REQ-0158.md
    source_items: [AG-006, AG-007, AG-008, AG-009, AG-010, AG-011, AG-012]
    content: |-
      ## 旧SPEC直下配置前提の除去

      - spec-save.md（原本）と docs/specs/commands/spec-save.md（SPEC）に残存する旧SPEC直下配置前提（docs/specs/*.md、docs/specs/{topic-slug}.md、docs/specs/<existing-spec>.md、SPEC 用 new:{topic-slug}）を廃止する。
      - 新表現として docs/specs/{domain}/{topic-slug}.md、docs/specs/**/*.md、target_spec: {operation, domain, slug} 構造化へ寄せる。
      - docs/DOC-MAP.md と docs/specs/README.md の SPEC 配置表現（specs/*.md）を specs/**/*.md またはドメイン分割説明へ更新する。
      - SPEC 配下の二系統（実行単位: commands/skills/workflows、基盤: foundations/responsibilities/quality/integrity/local/authoring）を説明に含める。
      - 旧直下前提が残存する文書（非 retired 約16ファイル）をすべて更新する。requirements/adr 配下の歴史記載（履歴マーカー付き）は例外として更新対象外。

      ### full_docs_check_recommended 条件の拡張

      - case-close profile の full_docs_check_recommended の判定条件を拡張する。以下の変更で true とする: docs/specs/integrity/rules/**、integrity-rule-catalog.md、rule-ownership.md、document-model.md、document-type-responsibilities.md、docs/DOC-MAP.md、docs/specs/README.md、.agentdev/config.yaml、.agentdev/doc-inputs/**。

      ### workflow別検査責務の明確化

      - check_changed_docs.ts の req-save/spec-save/case-close 各 profile の検査項目を command SPEC 説明と一致させる。
      - JSON 出力に doc_inputs_check_required と declared_files_check を追加する（既存フィールドは維持）。
      - --declared-files <path...> 任意引数を追加し、Issue/PR で宣言した文書更新対象と実変更ファイルの対応を検査する。

      ### 保存工程への changed docs guard 組込

      - req-save、spec-save、case-close の各保存工程で check_changed_docs.ts を実行する手順を組み込む。
      - strict failure があれば停止、修正して再実行、warning は継続確認とする手順を command 本文（原本）と SPEC の両方へ記載する。

      ### IR-057 検出語の分離

      - legacy_local_generation_vocabulary を「単独検出語」と「近接条件つき検出語」に分離する。
      - 単独検出語（即 ng）: src/opencode-local/generation-flow.md、src/opencode-local/transform/、transform/generate.md、transform/review.md、transform/spec.md、local-opencode-transform、直接生成方式、生成フロー。
      - 近接条件つき検出語（同一ファイル内または近接行に旧 local 生成方式文脈語がある場合のみ ng）: 再生成、上書き保護、generated_by。
      - obsolete-path-map.yaml、IR-057 本文、check_changed_docs.ts、check_integrity.ts の挙動を一致させる。

      ### IR-057 例外条件の整理

      - 旧SPEC直下パス検出の例外条件を整理する。
      - 例外（検出対象外）: obsolete-path-map.yaml 自体、IR-057 ルール説明としての旧パス例、retired 配下、テスト fixture、コードブロック内の明示的検査 fixture。
      - 通常検出対象: command 本文の実行手順、skill 本文/references 参照先、docs 現行本文の通常説明、README/DOC-MAP 探索導線、保存工程テンプレートの生成実パス例。

  - id: ACT-SPEC-001
    artifact: spec
    operation: update
    target: docs/specs/foundations/document-model.md
    target_area: 設定規則表（SPEC 配置行）
    source_items: [AG-006, AG-007]
    content: |-
      docs/specs/foundations/document-model.md を代表として、旧SPEC直下配置前提（docs/specs/*.md 直下）を docs/specs/{domain}/**/*.md またはドメイン分割説明へ更新する。対象ファイル群（非 retired）:
      - docs/specs/foundations/document-model.md（L223 設定規則表 SPEC 配置行）
      - docs/specs/commands/spec-save.md（L12,22,35）
      - docs/specs/commands/_template.md（L45）
      - docs/specs/responsibilities/artifact-responsibilities.md（L21）
      - docs/guides/req-case-flow.md（L48）
      - docs/guides/artifacts-and-state.md（L12,61）
      - docs/guides/project-docs-and-specs.md（L51）
      - docs/guides/glossary.md（L30）
      - src/opencode/commands/agentdev/spec-save.md（L8,19,65,168）
      - src/opencode/commands/agentdev/templates/req-define/req-draft.md（L53,61,68,86 target_spec 構造化）
      - src/opencode/skills/agentdev-req-file-manager/templates/doc_requirement.md（L30,36）
      - src/opencode/skills/agentdev-req-analysis/SKILL.md（L124）
      - src/opencode/skills/agentdev-req-analysis/references/req-define-detailed-gates.md（L32,56,149,152）
      - src/opencode/skills/agentdev-learning-pipeline/SKILL.md（L330,343）
      - src/opencode/skills/agentdev-doc-map/SKILL.md（L27）
      - src/opencode/skills/agentdev-req-structure-diagnostics/references/req-structure-review.md（L189,195）
      変更方針: docs/specs/*.md → docs/specs/**/*.md または docs/specs/{domain}/{name}.md。new:{topic-slug}（SPEC用）→ target_spec: {operation, domain, slug} 構造化。docs/specs/<existing-spec>.md → docs/specs/{domain}/{existing-spec}.md または target_spec: {operation: append|update, domain, slug}。
      requirements/adr 配下の歴史記載（REQ-0101.md L25、ADR-0123.md L42,56、ADR-0110.md）は履歴マーカー（旧/移行前/廃止/前提/historical/legacy/deprecated）付きのため更新対象外。

  - id: ACT-SPEC-002
    artifact: spec
    operation: update
    target: docs/specs/README.md
    target_area: command SPEC 一覧
    source_items: [AG-001]
    content: |-
      docs/specs/README.md の command SPEC 一覧に inspect-doc-inputs を追加する。docs/specs/commands/inspect-doc-inputs.md の status を docs/specs/README.md の status 表と一致させる。docs/DOC-MAP.md から inspect-doc-inputs SPEC への導線を追加する。

  - id: ACT-SPEC-003
    artifact: spec
    operation: update
    target: docs/specs/integrity/rules/IR-056-project-doc-input-integrity.md
    target_area: regression_test 記述、空配列許容条件
    source_items: [AG-002, AG-003]
    content: |-
      IR-056 の regression_test 記述を「(未実装)」から実態へ更新する。regression_test: check_doc_inputs.test.ts が統合テストとして存在。正常系: 7/2 移行済みリポジトリで ok=true。異常系: AG-005 で8種 fixture 追加。あわせて allowed_discovery 空配列許容条件（DOC-MAP または docs 配下 README から探索可能な paths を持たない場合のみ空配列を許容）と探索許可記述条件（allowed_discovery に DOC-MAP または docs 配下 README 経由の探索許可を記述した場合は、その経路で探索可能な paths を持つことを要件）を説明に追加する。

  - id: ACT-SPEC-004
    artifact: spec
    operation: update
    target: docs/specs/foundations/project-doc-inputs.md
    target_area: allowed_discovery 充実、doc-inputs 更新契約
    source_items: [AG-003, AG-004]
    content: |-
      docs/specs/foundations/project-doc-inputs.md を更新する。allowed_discovery の契約を充実させる: 空配列は「探索不要」を意味し、探索が必要な command（req-define/req-save/spec-save/case-close/inspect-docs/inspect-doc-inputs）では必要最小限の探索許可（DOC-MAP および docs 配下 README 経由）を記述する。spec-save の doc-input は document-model.md 確認を明示的に許可する。doc-inputs 更新契約を明文化する: (a) command/skill の追加・削除・責務変更、(b) SPEC の移動・分割・改名、(c) must_read の増減、(d) conditional_read の条件変更、(e) 探索範囲の変更、(f) DOC-MAP/README の入口変更が発生した場合は doc-inputs の更新が必要。case-close は doc-inputs 更新要否と check_doc_inputs.ts 実行要否を完了判定に組み込む。

  - id: ACT-SPEC-005
    artifact: spec
    operation: update
    target: .opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts
    target_area: full_docs_check_recommended 条件、workflow profile、JSON 出力、checkObsoleteSpecPath 例外
    source_items: [AG-008, AG-009, AG-012]
    content: |-
      check_changed_docs.ts を拡張する。(1) full_docs_check_recommended の条件を拡張（L575-585 付近）: docs/specs/integrity/rules/**、integrity-rule-catalog.md、rule-ownership.md、document-model.md、document-type-responsibilities.md、docs/DOC-MAP.md、docs/specs/README.md、.agentdev/config.yaml、.agentdev/doc-inputs/** の変更で true にする。(2) workflow別検査責務を明確化: req-save/spec-save/case-close 各 profile の検査項目を command SPEC 説明と一致させる。(3) JSON 出力（TargetedDocsReport インターフェース L55-65）に doc_inputs_check_required と declared_files_check を追加（既存9フィールド維持）。(4) ParsedArgs（L67-74）に --declared-files <path...> 任意引数を追加。(5) checkObsoleteSpecPath（L341-371）の例外条件を整理: obsolete-path-map.yaml 自体、IR-057 ルール説明としての旧パス例、retired 配下、テスト fixture、コードブロック内検査 fixture を除外。

  - id: ACT-SPEC-006
    artifact: spec
    operation: update
    target: .opencode/skills/repo-agentdev-integrity/scripts/check_doc_inputs.ts
    target_area: schema 検査強化
    source_items: [AG-005]
    content: |-
      check_doc_inputs.ts の schema 検査を強化する。validateFrontmatter（L487-545）に command id のファイル名対応検査と skill id のファイル名対応検査を追加。collectDocInputPaths（L277-474）に allowed_discovery 空文字検査、command doc-input の5項目保有検査を追加。check_doc_inputs.test.ts に異常系 fixture を8種追加: (1) allowed_discovery 非配列、(2) allowed_discovery 空文字含む、(3) command id 形式違反、(4) skill id ファイル名不一致、(5) must_read[].path 不在、(6) conditional_read[].paths[] 不在、(7) skill doc-input の must_read 持ち、(8) command doc-input の5項目欠落。

  - id: ACT-SPEC-007
    artifact: spec
    operation: update
    target: docs/specs/integrity/rules/IR-057-obsolete-spec-path-after-domain-split.md
    target_area: legacy_local_generation_vocabulary 分離、例外条件
    source_items: [AG-011, AG-012]
    content: |-
      IR-057 を更新する。(1) legacy_local_generation_vocabulary を「単独検出語」と「近接条件つき検出語」に分離。単独検出語（即 ng）: src/opencode-local/generation-flow.md、src/opencode-local/transform/、transform/generate.md、transform/review.md、transform/spec.md、local-opencode-transform、直接生成方式、生成フロー。近接条件つき検出語（同一ファイル内または近接行に旧 local 生成方式文脈語がある場合のみ ng）: 再生成、上書き保護、generated_by。(2) 旧SPEC直下パス検出の例外条件を整理。例外（検出対象外）: obsolete-path-map.yaml 自体、IR-057 ルール説明としての旧パス例、retired 配下、テスト fixture、コードブロック内の明示的検査 fixture。通常検出対象: command 本文の実行手順、skill 本文/references 参照先、docs 現行本文の通常説明、README/DOC-MAP 探索導線、保存工程テンプレートの生成実パス例。

  - id: ACT-SPEC-008
    artifact: spec
    operation: update
    target: docs/specs/integrity/obsolete-path-map.yaml
    target_area: legacy_local_generation_vocabulary 分離
    source_items: [AG-011]
    content: |-
      obsolete-path-map.yaml の legacy_local_generation_vocabulary を分離する。現状は10語すべて severity: ng。単独検出語（severity: ng）: src/opencode-local/generation-flow.md、src/opencode-local/transform/、transform/generate.md、transform/review.md、transform/spec.md、local-opencode-transform、直接生成方式、生成フロー。近接条件つき検出語（severity: conditional、proximity_required: true）: 再生成、上書き保護、generated_by。generated_by_combination_rule は既存（trigger=generated_by, paired_with=local-opencode-transform, severity=ng）を維持。

  - id: ACT-SPEC-009
    artifact: spec
    operation: update
    target: src/opencode/commands/agentdev/spec-save.md
    target_area: changed docs guard 組込（req-save/case-close も含む）
    source_items: [AG-010]
    content: |-
      req-save、spec-save、case-close の各 command 本文（原本）と SPEC に changed docs guard 組込手順を記載する。各保存工程で check_changed_docs.ts を実行し、strict failure があれば停止、修正して再実行、warning は継続確認とする。対象ファイル: src/opencode/commands/agentdev/req-save.md、src/opencode/commands/agentdev/spec-save.md、src/opencode/commands/agentdev/case-close.md、docs/specs/commands/req-save.md、docs/specs/commands/spec-save.md、docs/specs/commands/case-close.md。spec-save.md を代表 target とする。

  - id: ACT-SPEC-010
    artifact: spec
    operation: update
    target: .agentdev/doc-inputs/commands/spec-save.yaml
    target_area: allowed_discovery 充実
    source_items: [AG-003]
    content: |-
      .agentdev/doc-inputs/commands/ 配下の doc-input ファイルの allowed_discovery を充実させる。対象ファイル: spec-save.yaml、req-define.yaml、req-save.yaml、case-close.yaml、inspect-docs.yaml、inspect-doc-inputs.yaml。spec-save.yaml を代表 target とする。各ファイルの allowed_discovery を空配列から、必要最小限の探索許可（DOC-MAP および docs 配下 README 経由）へ更新する。spec-save.yaml は document-model.md 確認を明示的に許可する。

  - id: ACT-SPEC-011
    artifact: spec
    operation: update
    target: docs/specs/integrity/integrity-rule-catalog.md
    target_area: IR-056/IR-057 登録内容の更新
    source_items: [AG-002, AG-011, AG-012]
    content: |-
      関連索引・所有表・カタログを更新する。対象ファイル: docs/specs/integrity/integrity-rule-catalog.md（IR-056 regression_test 記述更新、IR-057 検出語分離・例外条件整理の反映）、docs/specs/integrity/rule-ownership.md（IR-056/IR-057 所有表更新）、docs/specs/README.md（inspect-doc-inputs 追加、SPEC 配置表現更新）、docs/DOC-MAP.md（SPEC 配置表現更新、inspect-doc-inputs 導線追加）。integrity-rule-catalog.md を代表 target とする。

  - id: ACT-SPEC-012
    artifact: spec
    operation: update
    target: .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts
    target_area: legacy_local_generation_vocabulary 検出語分離連動
    source_items: [AG-011]
    content: |-
      check_integrity.ts の legacy_local_generation_vocabulary 検出ロジックを obsolete-path-map.yaml の分離（単独検出語 / 近接条件つき検出語）に連動させる。近接条件つき検出語（再生成、上書き保護、generated_by）は、同一ファイル内または近接行に旧 local 生成方式文脈語がある場合のみ検出する。

conflict_resolutions:
  - id: CR-001
    conflict: |-
      RU-001/002 の保存先REQ。当初案は REQ-0157（doc-inputs 機構）であったが、旧SPEC直下パス除去・DOC-MAP/README 更新・IR-057 との整合が主題であるため、REQ-0158（targeted docs guard）側に寄せるべきか。
    resolution: |-
      REQ-0158 側へ寄せる。RU-001/002 は旧SPEC直下パス・DOC-MAP・README・IR-057 との整合が主題であり、REQ-0158（targeted docs guard / obsolete path）の受け入れ基準により近い。REQ-0157 は doc-inputs 機構の schema/手順/検査が主題であり、RU-001/002 はその周辺の docs 整合性にあたるため。

  - id: CR-002
    conflict: |-
      target_spec: {operation, domain, slug} 構造化、doc-inputs 更新契約明文化、IR-057 検出語分離について、新規ADRが必要か。
    resolution: |-
      新規ADR不要。target_spec 構造化は ADR-0124（req_draft soft-contract）の範囲内（新規フィールド追加は soft-contract 契約）。doc-inputs 更新契約は ADR-0133 / REQ-0157 の具体化。allowed_discovery 充実は REQ-0157 / IR-056 の契約強化。full_docs_check_recommended 条件拡張は REQ-0158 受け入れ条件強化。IR-057 検出語分離は integrity rule UPDATE。旧SPEC直下パス例外条件は IR-057 UPDATE。いずれも既存ADR/REQの具体化または rule UPDATE で対応可能。

operation_units:
  - ou_id: OU-001
    source_ru: RU-20260702
    target_req: REQ-0157
    operation: append
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

  - ou_id: OU-002
    source_ru: RU-20260702
    target_req: REQ-0158
    operation: append
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-005
    verification: |-
      check_doc_inputs.ts を実行する。正常系 doc-input（7/2 移行済みリポジトリの既存 doc-inputs）で ok=true となることを確認する。check_doc_inputs.test.ts に追加した8種異常系 fixture（allowed_discovery 非配列、空文字含む、command id 形式違反、skill id ファイル名不一致、must_read[].path 不在、conditional_read[].paths[] 不在、skill doc-input の must_read 持ち、command doc-input の5項目欠落）がそれぞれ failure として検出されることを確認する。
    pass_criteria: |-
      正常系で ok=true。8種異常系 fixture がすべて failure として検出される。
    on_failure: |-
      fix-and-reverify。検査ロジックまたは fixture の実装を修正して再検証する。

  - id: TS-002
    target_item: AG-003
    verification: |-
      .agentdev/doc-inputs/commands/ 配下の各 doc-input（req-define/req-save/spec-save/case-close/inspect-docs/inspect-doc-inputs）の allowed_discovery を確認する。空配列の場合は「探索不要」であること、空配列でない場合は DOC-MAP または docs 配下 README 経由の探索許可が記述されていることを確認する。spec-save.yaml は document-model.md 確認が明示されていることを確認する。
    pass_criteria: |-
      req-define/req-save/spec-save/case-close/inspect-docs/inspect-doc-inputs の allowed_discovery が空配列または DOC-MAP/docs README 経由の探索許可。spec-save.yaml は document-model.md 確認が明示。
    on_failure: |-
      fix-and-reverify。doc-input ファイルの allowed_discovery を修正して再検証する。

  - id: TS-003
    target_item: AG-001
    verification: |-
      docs/specs/README.md の command SPEC 一覧に inspect-doc-inputs が含まれることを確認する。docs/DOC-MAP.md から inspect-doc-inputs SPEC（docs/specs/commands/inspect-doc-inputs.md）への導線が存在することを確認する。docs/specs/commands/inspect-doc-inputs.md の status が docs/specs/README.md の status 表と一致することを確認する。
    pass_criteria: |-
      specs/README.md と DOC-MAP.md に inspect-doc-inputs への導線が存在。status が一致。
    on_failure: |-
      fix-and-reverify。導線または status を修正して再検証する。

  - id: TS-004
    target_item: AG-008
    verification: |-
      check_changed_docs.ts --workflow case-close --files <対象ファイル> --json を実行する。対象ファイル（docs/specs/integrity/rules/**、integrity-rule-catalog.md、rule-ownership.md、document-model.md、document-type-responsibilities.md、docs/DOC-MAP.md、docs/specs/README.md、.agentdev/config.yaml、.agentdev/doc-inputs/**）のそれぞれについて、full_docs_check_recommended が true になることを確認する。
    pass_criteria: |-
      全対象ファイルで full_docs_check_recommended=true。
    on_failure: |-
      fix-and-reverify。判定条件の実装を修正して再検証する。

  - id: TS-005
    target_item: AG-009
    verification: |-
      check_changed_docs.ts --workflow req-save/spec-save/case-close をそれぞれ実行し、各 profile の検査項目が command SPEC（docs/specs/commands/req-save.md, spec-save.md, case-close.md）の説明と一致することを確認する。JSON 出力に doc_inputs_check_required と declared_files_check が含まれることを確認する。--declared-files <path...> 引数を指定して実行し、宣言ファイルと実変更ファイルの対応検査が機能することを確認する。
    pass_criteria: |-
      各 profile の検査項目が command SPEC と一致。JSON 出力に doc_inputs_check_required/declared_files_check が含まれる。--declared-files が機能する。
    on_failure: |-
      fix-and-reverify。profile 検査項目または JSON 出力または引数処理の実装を修正して再検証する。

  - id: TS-006
    target_item: AG-010
    verification: |-
      req-save、spec-save、case-close の各 command 本文（原本）と SPEC に changed docs guard 組込手順が記載されていることを確認する。手順に check_changed_docs.ts 実行、strict failure 停止、修正して再実行、warning 継続確認が含まれることを確認する。
    pass_criteria: |-
      各保存工程（req-save/spec-save/case-close の原本と SPEC）に changed docs guard 組込手順が記載される。
    on_failure: |-
      fix-and-reverify。command 本文または SPEC の記載を修正して再検証する。

  - id: TS-007
    target_item: AG-011
    verification: |-
      単独検出語（src/opencode-local/generation-flow.md、local-opencode-transform、直接生成方式、生成フロー 等）を含むファイルで即 ng 検出されることを確認する。近接条件つき検出語（再生成、上書き保護、generated_by）のみを含むファイルで、近接条件（旧 local 生成方式文脈語）がない場合は検出されないことを確認する。近接条件ありの場合は検出されることを確認する。obsolete-path-map.yaml、IR-057、check_changed_docs.ts、check_integrity.ts の挙動が一致することを確認する。
    pass_criteria: |-
      単独語は即検出。近接条件つき語は条件なしで非検出、条件ありで検出。4ファイルの挙動が一致。
    on_failure: |-
      fix-and-reverify。検出ロジックまたは obsolete-path-map.yaml の分離設定を修正して再検証する。

  - id: TS-008
    target_item: AG-012
    verification: |-
      例外対象（obsolete-path-map.yaml 自体、IR-057 ルール説明内の旧パス例、retired 配下、テスト fixture、コードブロック内検査 fixture）が検出されないことを確認する。通常検出対象（command 本文実行手順、skill 本文/references 参照先、docs 現行本文通常説明、README/DOC-MAP 探索導線）は検出されることを確認する。
    pass_criteria: |-
      例外は非検出。通常検出対象は検出。
    on_failure: |-
      fix-and-reverify。例外条件の実装を修正して再検証する。

  - id: TS-009
    target_item: AG-006
    verification: |-
      check_changed_docs.ts --workflow case-close を実行し、旧SPEC直下前提更新前に残存箇所（約16ファイル+DOC-MAP+specs/README）が failures として検出されることを確認する。ACT-SPEC-001 の更新後に、check_changed_docs.ts を再実行し、旧直下前提の failures=0 であることを確認する。
    pass_criteria: |-
      更新前に failures に旧直下前提が含まれる。更新後に旧直下前提の failures=0。
    on_failure: |-
      fix-and-reverify。見落とし箇所があれば追加更新して再検証する。

  - id: TS-010
    target_item: AG-010
    verification: |-
      req-save/spec-save/case-close の各保存工程で check_changed_docs.ts が実行されることを確認する。failures があれば停止し、修正後に再実行されることを確認する。統合テストとして、意図的に旧直下パスを混入したファイルを保存対象に含め、changed docs guard が failures を検出して停止することを確認する。
    pass_criteria: |-
      各保存工程で changed docs guard が機能し、failures 検出時に停止する。
    on_failure: |-
      fix-and-reverify。保存工程の手順または check_changed_docs.ts の呼び出しを修正して再検証する。

case_open_hints:
  epic_needed: true
  decomposition: |-
    2つの operation_units（OU-001: REQ-0157 APPEND、OU-002: REQ-0158 APPEND）は独立しており、並列実行可能。各 OU 内の SPEC update は editing concern ごとにグループ化される。OU-001 は doc-inputs 機構の仕上げ（AG-001〜005）、OU-002 は docs guard/obsolete path の仕上げ（AG-006〜012）。約30ファイルの更新を含むため、各 OU を Wave 分割して並列委譲することを推奨。
  wave_hints:
    - wave: 1
      items: [OU-001, OU-002]
      rationale: 両 OU は depends_on: [] で独立。REQ APPEND と SPEC update を含むため、REQ APPEND を先に確定してから SPEC update を展開する場合は Wave 1（REQ APPEND）→ Wave 2（SPEC update）の2段階も可能。ただし、REQ APPEND と SPEC update は並列で進められる（REQ は要件定義、SPEC は実装詳細のため）。
    - wave: 2
      items: [ACT-SPEC-001〜ACT-SPEC-012]
      rationale: SPEC update 群。editing concern ごとに分割し、複数 case-run で並列実行可能。ACT-SPEC-001（旧直下前提除去、約16ファイル）と ACT-SPEC-005（check_changed_docs.ts 拡張）は独立性が高く、早期に並列実行可能。ACT-SPEC-007/008（IR-057/obsolete-path-map.yaml 検出語分離）は連動するため同一 Wave で実行推奨。
```

# summary

RU-20260702 は、7/2 版で導入済みの doc-inputs 機構（REQ-0157）と targeted docs guard（REQ-0158）の仕上げを実施する要件である。13サブ要件を2つの operation_units に整理した。

OU-001（REQ-0157 APPEND）は doc-inputs 機構の仕上げ: inspect-doc-inputs 探索導線登録（AG-001）、IR-056 regression_test 記述の実態整合（AG-002）、allowed_discovery 充実（AG-003）、doc-inputs 更新契約明文化（AG-004）、check_doc_inputs.ts schema 検査強化と8種異常系 fixture 追加（AG-005）。

OU-002（REQ-0158 APPEND）は docs guard/obsolete path の仕上げ: 旧SPEC直下配置前提除去（AG-006）、DOC-MAP/README 旧配置前提除去（AG-007）、full_docs_check_recommended 条件拡張（AG-008）、workflow別検査責務明確化（AG-009）、保存工程 changed docs guard 組込（AG-010）、IR-057 検出語分離（AG-011）、IR-057 例外条件整理（AG-012）。

RU-013（索引・所有表・カタログ更新）は両 OU の副産物として ACT-SPEC-011 に集約した。

新規REQ/ADR は不要。target_spec 構造化は ADR-0124（soft-contract）の範囲内、IR-057 改良は integrity rule UPDATE、full_docs_check_recommended 条件拡張は REQ-0158 受け入れ条件強化で対応可能。

work_type は feature、scale は large。約30ファイルの更新を含み、case_open_hints.epic_needed は true。
