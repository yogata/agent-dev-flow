---
draft_type: req_draft
topic_slug: inspect-docs-separation-violation-fix
status: saved
created_at: 2026-06-26T21:00:00+09:00
saved_at: 2026-06-26T23:00:00+09:00
spec_consumed: true
source_rus:
  - RU-0005
---

# draft-data

```yaml
work_type: feature

scale: standard

summary: >
  inspect-docs finding（2026-06-26、commit ef82f6ec）で検出された7件の
  SPEC 分離基準違反/安定契約例外境界を是正する。Finding 1（HIGH）は
  runtime-package-boundary.md の plugin-future 将来内容を SPEC から除去し
  REQ-0103-064 参照の1行へ縮退する。Finding 3（HIGH）は REQ-0114-024 の
  Step 番号直接参照（case-open.md Step 13a）を機能名参照へ置換する。
  Finding 4〜8（MEDIUM〜LOW）は REQ-0101-069 安定契約例外に該当する
  enum 値/フィールド名/数値上限/regex パターンについて、例外根拠を明記して
  REQ に残す方針を確定する。全 Finding の対応方針が確定しており、
  新規アーキテクチャ決定を含まないため ADR 不要。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: >
      Finding 1（HIGH）: docs/specs/local/runtime-package-boundary.md の
      plugin-future 将来内容（「将来」「現在は未対応」「（将来定義）」等）を
      SPEC から除去する。4箇所が対象: L17 のリポジトリ種別テーブル行、
      L97-100 の「### Plugin-future（将来）」セクション、L134 の導入方式
      ポリシーテーブル行、L159 の同期スクリプト範囲テーブル行。
      plugin-future リポジトリ種別は現在未対応であり、SPEC（現在どう動作して
      いるか）の対象外。REQ-0103-064 が「将来の選択肢扱い」として REQ 側で
      要約済みのため、SPEC 側は REQ-0103-064 参照の1行へ縮退する。
      SPEC 分離基準（REQ-0101-068）違反の明確な true positive。

  - id: AG-002
    content: >
      Finding 3（HIGH）: docs/requirements/REQ-0114.md の REQ-0114-024 が
      "case-open.md Step 13a" の Step 番号直接参照を含む。REQ-0136-031
      （Step 番号直接参照禁止）違反。IR-044 の true positive。
      "case-open.md Step 13a" を機能名参照（"case-open の RU 削除工程"）へ
      置換する。

  - id: AG-003
    content: >
      Finding 4（MEDIUM）: docs/requirements/REQ-0102.md の REQ-0102-074 が
      "verification（検証手順）、pass_criteria（合格基準）、on_failure
      （不合格時の処置）" のスキーマフィールド名（英名列挙）を REQ 要件行に
      残留。test_strategy の3要素構成は安定契約（req-define が生成し、
      req-save/case-open が消費する接続契約）だが、フィールド名の直接列挙は
      SPEC 分離基準（REQ-0101-068 スキーマフィールド移管候補）に抵触。
      対応: 英語フィールド名を日本語要約へ置換し、REQ-0101-069 安定契約
      例外（他コマンドとの接続契約）を明記する。フィールドスキーマ詳細は
      SPEC（docs/specs/commands/req-define.md）に既存のため SPEC 新規作成
      不要。REQ 行の UPDATE のみ。

  - id: AG-004
    content: >
      Finding 5（MEDIUM）: docs/requirements/REQ-0108.md の REQ-0108-100 が
      "strict / heuristic / observation" の severity enum 値一覧を REQ 要件行に
      残留。severity 分類体系は docs-check レポートで利用者に見える分類であり、
      REQ-0101-069 安定契約例外「利用者に見える分類体系」に該当する。
      対応: REQ 行に安定契約例外の根拠を明記する。enum 値は REQ に安定契約
      として残し、SPEC（integrity-contracts.md）に詳細な説明が既存のため
      SPEC 新規作成不要。REQ 行の UPDATE のみ。

  - id: AG-005
    content: >
      Finding 6（MEDIUM）: docs/requirements/REQ-0108.md の REQ-0108-153 が
      "full audit / delta guard / impact guard" の gate_level enum 値一覧を
      REQ 要件行に残留。3層構造は docs-check 運用で利用者に見える分類であり、
      REQ-0101-069 安定契約例外「利用者に見える分類体系」に該当する。
      Finding 5 と同方針。REQ 行に安定契約例外の根拠を明記する。
      REQ 行の UPDATE のみ。

  - id: AG-006
    content: >
      Finding 7（LOW-MEDIUM）: docs/requirements/REQ-0148.md の
      REQ-0148-007/009/018 が "3-10子Issue/上限10/5件上限/L0-L3" の実装
      パラメータ数値上限を残留。これらは並列実行の安全境界（Epic サイズ
      上限、並列実行数上限）であり、REQ-0101-069 安定契約例外「安全境界」
      に該当する。対応: 各行に安定契約例外の根拠を明記する。
      REQ 行の UPDATE のみ。

  - id: AG-007
    content: >
      Finding 8（LOW）: docs/requirements/REQ-0144.md の REQ-0144-013 が
      "Sisyphus-Junior\(ulw-loop\)" の regex パターンを残留。本パターンは
      SPEC↔source 同期検査の公開入口的識別子（誤分類表記の恒久検出）であり、
      REQ-0101-069 安定契約例外「公開入口」に該当する。
      対応: REQ 行に安定契約例外の根拠を明記する。
      REQ 行の UPDATE のみ。

artifact_actions:
  # === Finding 1: SPEC update (runtime-package-boundary.md) ===

  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-update
    target: docs/specs/local/runtime-package-boundary.md
    target_area: "## 5 種のリポジトリ種別（Repo Type）"
    source_items: [AG-001]
    content: |
      ## 4 種のリポジトリ種別（Repo Type）

      > 将来の plugin/npm/package 配布形態（`plugin-future`）は現在未対応であり、REQ-0103-064 を参照のこと。

      | Type ID | 名称 | 説明 | `.opencode/` の意味 | 典型例 |
      |---------|------|------|---------------------|--------|
      | `self-hosting` | AgentDevFlow 本体開発リポジトリ | 原本と配置先が同一リポジトリに存在 | 実行時配置先（ジャンクション → `src/opencode/`） | `agent-dev-flow` |
      | `consumer-with-agentdev` | AgentDevFlow 導入製品リポジトリ | AgentDevFlow 提供 skill/command を利用 | プロジェクトローカルカスタマイズ入口 + AgentDevFlow 実行時位置 | 各種製品開発リポジトリ |
      | `consumer-local` | 非 AgentDevFlow OpenCode プロジェクト | 独自 command/skill のみ | プロジェクトローカルカスタマイズ専用 | 実験的リポジトリ |
      | `consumer-generated` | ローカル版 OpenCode 導入リポジトリ | ローカル版 OpenCode を導入する利用側リポジトリ | link mode による AgentDevFlow 実行時位置（agentdev-gh-cli のみ `src/opencode-local/` から接続） | 個人利用環境のローカルリポジトリ |

      `consumer-generated` はローカル版 OpenCode を link mode で導入する利用側リポジトリである（REQ-0141, REQ-0134, ADR-0131）。
      `.opencode/commands/agentdev/` と `.opencode/skills/agentdev-*/`（agentdev-gh-cli 以外）を `src/opencode/` 配下へ接続し、`.opencode/skills/agentdev-gh-cli/` だけを `src/opencode-local/agentdev-gh-cli/` へ接続する。
      詳細は [ローカル版 OpenCode 生成](local-generation.md) を参照。

      ### リポジトリ種別判定基準

      | 条件 | リポジトリ種別 |
      |------|-----------|
      | `src/opencode/` が存在し `.opencode/` がジャンクション | `self-hosting` |
      | `.opencode/commands/agentdev/` または `.opencode/skills/agentdev-*/` が存在（ジャンクション、シンボリックリンク含む） | `consumer-with-agentdev` |
      | `.opencode/skills/agentdev-gh-cli/` が `src/opencode-local/agentdev-gh-cli/` への link として解決される | `consumer-generated` |
      | `.opencode/` が存在し `agentdev` 名前空間を含まない | `consumer-local` |
      | 上記いずれでもない | N/A（OpenCode 非使用リポジトリ） |

  - id: ACT-SPEC-002
    artifact: spec
    operation: spec-update
    target: docs/specs/local/runtime-package-boundary.md
    target_area: "### Plugin-future（将来）"
    source_items: [AG-001]
    content: |
      ### 将来の配布形態

      将来の plugin/npm/package 配布形態は現在未対応である（REQ-0103-064 参照）。

  - id: ACT-SPEC-003
    artifact: spec
    operation: spec-update
    target: docs/specs/local/runtime-package-boundary.md
    target_area: "## 導入方式ポリシー（Installation Method Policy）"
    source_items: [AG-001]
    content: |
      ## 導入方式ポリシー（Installation Method Policy）

      | 方式 | 状態 | 推奨度 | 備考 |
      |--------|--------|--------|------|
      | Symlink / ジャンクション | 対応済み | **推奨** | 更新自動反映、原本単一管理 |
      | Copy | 対応済み | 非推奨 | 手動更新必要、乖離リスク |
      | Git submodule | 検討可能 | 実験的 | 複雑性増加 |
      | Plugin / npm / package | 未対応 | — | REQ-0103-064 参照 |

      ### Symlink / ジャンクションの制約

      | Platform | 方法 | 制約 |
      |----------|------|------|
      | Windows | ジャンクション (`mklink /J`) | 管理者権限不要、ディレクトリのみ対応 |
      | Windows | Symlink (`mklink /D`) | 開発者モードまたは管理者権限が必要 |
      | Unix | Symlink (`ln -s`) | 権限不要 |

      ### Copy の乖離検出

      Copy ベース導入では AgentDevFlow 更新時に乖離（drift）が発生する。
      docs-check（IR-016）が乖離（divergence）を検出、報告する。

  - id: ACT-SPEC-004
    artifact: spec
    operation: spec-update
    target: docs/specs/local/runtime-package-boundary.md
    target_area: "## リポジトリ種別別同期スクリプト範囲（Sync Script Scope）"
    source_items: [AG-001]
    content: |
      ## リポジトリ種別別同期スクリプト範囲（Sync Script Scope）

      `sync-opencode.ps1` の適用範囲（REQ-0103-065）。

      | リポジトリ種別 | 同期対象 | 非対象 |
      |-----------|----------|--------|
      | `self-hosting` | `commands/agentdev/` + `skills/agentdev-*/` の選択的ジャンクション + `.gitignore` コピー | opencode 実行時ファイル（sessions, config 等） |
      | `consumer-with-agentdev` | AgentDevFlow 提供ファイルのみ | プロジェクトローカルカスタマイズ |
      | `consumer-local` | なし（適用対象外） | 全体 |
      | `consumer-generated` | なし（適用対象外）。link 設定により接続されるため同期スクリプト対象外 | 全体 |

      > 将来の plugin 配布形態（`plugin-future`）は現在未対応（REQ-0103-064 参照）。

      ### 本体リポジトリでの同期モード

      | Mode | 動作 |
      |------|------|
      | `apply` | `src/opencode/` → `.opencode/` の同期実行 |
      | `check` | 乖離検出（終了コードで判定） |
      | `dry-run` | 変更予測（実行なし） |

      ### Consumer での同期

      Consumer では AgentDevFlow 本体から提供されるファイルのみを同期対象とする。
      プロジェクトローカルカスタマイズは同期の影響を受けない。

  # === Finding 3: REQ update (REQ-0114-024) ===

  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-0114.md
    source_items: [AG-002]
    content: |
      REQ-0114-024 修正前:
      | REQ-0114-024 | case-open 相当処理で、case-open.md Step 13a と同一条件で RU ファイルを削除すること |

      REQ-0114-024 修正後:
      | REQ-0114-024 | case-auto は case-open の RU 削除工程と同一条件で RU ファイルを削除すること |

      修正理由: "case-open.md Step 13a" は Step 番号直接参照（REQ-0136-031 違反、IR-044 true positive）。
      "case-open の RU 削除工程" へ機能名参照へ置換する。

  # === Finding 4: REQ update (REQ-0102-074) ===

  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: docs/requirements/REQ-0102.md
    source_items: [AG-003]
    content: |
      REQ-0102-074 修正前:
      | REQ-0102-074 | req-define は要件展開において test_strategy（テスト戦略）を定義すること。各 test strategy 項目は verification（検証手順）、pass_criteria（合格基準）、on_failure（不合格時の処置）の3要素で構成すること |

      REQ-0102-074 修正後:
      | REQ-0102-074 | req-define は要件展開において test_strategy（テスト戦略）を定義すること。各 test strategy 項目は検証手順・合格基準・不合格時処置の3要素で構成すること（REQ-0101-069 安定契約例外: 他コマンドとの接続契約。フィールドスキーマ詳細は SPEC 参照） |

      修正理由: 英語フィールド名（verification/pass_criteria/on_failure）の直接列挙はスキーマフィールド残留（REQ-0101-068）。
      日本語要約へ置換し、安定契約例外（REQ-0101-069「他コマンドとの接続契約」）を明記。
      フィールドスキーマ詳細は docs/specs/commands/req-define.md に既存。

  # === Finding 5+6: REQ update (REQ-0108-100, REQ-0108-153) ===

  - id: ACT-REQ-003
    artifact: req
    operation: update
    target: docs/requirements/REQ-0108.md
    source_items: [AG-004, AG-005]
    content: |
      REQ-0108-100 修正前:
      | REQ-0108-100 | docs-check の検出事項は strict / heuristic / observation のいずれかに分類すること |

      REQ-0108-100 修正後:
      | REQ-0108-100 | docs-check の検出事項は severity 分類（strict / heuristic / observation）で分類すること（REQ-0101-069 安定契約例外: 利用者に見える分類体系） |

      REQ-0108-153 修正前:
      | REQ-0108-153 | 検査層は3層であること: full audit（全ルール実行）/ delta guard（変更関連ルールのみ実行）/ impact guard（影響範囲ルールのみ実行） |

      REQ-0108-153 修正後:
      | REQ-0108-153 | 検査層は3層であること: full audit（全ルール実行）/ delta guard（変更関連ルールのみ実行）/ impact guard（影響範囲ルールのみ実行）（REQ-0101-069 安定契約例外: 利用者に見える分類体系） |

      修正理由: severity/gate_level enum 値一覧は REQ-0101-068（enum 値一覧移管候補）に抵触するが、
      docs-check レポートで利用者に見える分類体系であり REQ-0101-069 安定契約例外に該当。
      enum 値は REQ に安定契約として残し、例外根拠を明記する。

  # === Finding 7: REQ update (REQ-0148-007/009/018) ===

  - id: ACT-REQ-004
    artifact: req
    operation: update
    target: docs/requirements/REQ-0148.md
    source_items: [AG-006]
    content: |
      REQ-0148-007 修正前:
      | REQ-0148-007 | case-open は依存強度（必須/弱/関連）、Epic サイズ（推奨3-10子Issue、上限10）、機能的一貫性の3軸で最終 Epic 構成を自律生成すること |

      REQ-0148-007 修正後:
      | REQ-0148-007 | case-open は依存強度（必須/弱/関連）、Epic サイズ（推奨3-10子Issue、上限10）、機能的一貫性の3軸で最終 Epic 構成を自律生成すること（REQ-0101-069 安定契約例外: 安全境界。Epic サイズ上限は並列実行の安全境界） |

      REQ-0148-009 修正前:
      | REQ-0148-009 | case-open は Epic サイズ上限10子Issueをハード制約として守ること |

      REQ-0148-009 修正後:
      | REQ-0148-009 | case-open は Epic サイズ上限10子Issueをハード制約として守ること（REQ-0101-069 安定契約例外: 安全境界） |

      REQ-0148-018 修正前:
      | REQ-0148-018 | case-auto レベルでのグローバル並列上限は設定せず、case-run 単位の5件上限（REQ-0130-026 踏襲）のみを制御対象とすること |

      REQ-0148-018 修正後:
      | REQ-0148-018 | case-auto レベルでのグローバル並列上限は設定せず、case-run 単位の5件上限（REQ-0130-026 踏襲）のみを制御対象とすること（REQ-0101-069 安定契約例外: 安全境界。並列実行数上限は実行安全境界） |

      修正理由: 数値上限は REQ-0101-068（行数上限/実装パラメータ移管候補）に抵触するが、
      並列実行の安全境界（Epic サイズ上限、並列実行数上限）であり REQ-0101-069 安定契約例外に該当。
      例外根拠を明記する。

  # === Finding 8: REQ update (REQ-0144-013) ===

  - id: ACT-REQ-005
    artifact: req
    operation: update
    target: docs/requirements/REQ-0144.md
    source_items: [AG-007]
    content: |
      REQ-0144-013 修正前:
      | REQ-0144-013 | SPEC↔source 同期検査は "Sisyphus-Junior\(ulw-loop\)" パターンを恒久的に検出する |

      REQ-0144-013 修正後:
      | REQ-0144-013 | SPEC↔source 同期検査は "Sisyphus-Junior\(ulw-loop\)" パターンを恒久的に検出する（REQ-0101-069 安定契約例外: 公開入口。誤分類表記の恒久検出識別子） |

      修正理由: regex パターンは REQ-0101-068（内部アルゴリズム移管候補）に抵触するが、
      SPEC↔source 同期検査の公開入口的識別子（誤分類表記の恒久検出）であり
      REQ-0101-069 安定契約例外に該当。例外根拠を明記する。

conflict_resolutions:
  - id: CR-001
    conflict: >
      Finding 4/5/6/7/8 について、enum 値/フィールド名/数値上限/regex パターンを
      REQ に残すか SPEC へ移管するかの判断基準が共通テーマ。
    resolution: >
      REQ 粒度判定テスト（REQ-0102-054）「当該要件行が存在しない場合、対象REQが
      何を満たすべきか不明になるか？」を各 Finding に適用し、以下の判断を確定:
      Finding 4（test_strategy 3要素）= 安定契約「他コマンドとの接続契約」該当、
      フィールド名は SPEC 参照へ要約化。Finding 5/6（severity/gate_level enum）
      = 安定契約「利用者に見える分類体系」該当、例外明記。Finding 7（数値上限）
      = 安定契約「安全境界」該当、例外明記。Finding 8（regex パターン）
      = 安定契約「公開入口」該当、例外明記。全 Finding で方針確定。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0005
    target_spec: docs/specs/local/runtime-package-boundary.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

  - ou_id: OU-002
    source_ru: RU-0005
    target_req: REQ-0114
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}

  - ou_id: OU-003
    source_ru: RU-0005
    target_req: REQ-0102
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    result: {}

  - ou_id: OU-004
    source_ru: RU-0005
    target_req: REQ-0108
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 4
    issue_policy: single
    result: {}

  - ou_id: OU-005
    source_ru: RU-0005
    target_req: REQ-0148
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 5
    issue_policy: single
    result: {}

  - ou_id: OU-006
    source_ru: RU-0005
    target_req: REQ-0144
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 6
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      docs/specs/local/runtime-package-boundary.md を読み込み、plugin-future に関連する
      将来内容（「将来」「現在は未対応」「（将来定義）」「将来対応」等）が SPEC に残留
      していないことを確認する。対象4箇所: リポジトリ種別テーブル、Plugin-future
      セクション、導入方式ポリシーテーブル、同期スクリプト範囲テーブル。
    pass_criteria: |
      plugin-future 将来内容が SPEC から除去され、REQ-0103-064 参照の事実記述のみに
      縮退されていること。SPEC に将来計画・将来内容の記述が存在しないこと。
    on_failure: |
      SPEC に将来内容が残留する場合、当該箇所を修正して再検証する（fix-and-reverify）。

  - id: TS-002
    target_item: AG-002
    verification: |
      docs/requirements/REQ-0114.md の REQ-0114-024 を読み込み、"Step 13a" 等 Step 番号
      直接参照が機能名参照に置換されていることを確認する。
    pass_criteria: |
      REQ-0114-024 に Step 番号直接参照が含まれず、"case-open の RU 削除工程" 等の
      機能名参照であること（REQ-0136-031 遵守）。
    on_failure: |
      Step 番号参照が残留する場合、機能名参照へ修正して再検証する（fix-and-reverify）。

  - id: TS-003
    target_item: AG-003
    verification: |
      docs/requirements/REQ-0102.md の REQ-0102-074 を読み込み、英語フィールド名
      （verification/pass_criteria/on_failure）の直接列挙が日本語要約へ置換され、
      REQ-0101-069 安定契約例外が明記されていることを確認する。
    pass_criteria: |
      REQ-0102-074 に英語フィールド名の直接列挙がなく、日本語要約
      （検証手順・合格基準・不合格時処置）+ SPEC 参照 + REQ-0101-069 例外明記が
      あること。
    on_failure: |
      フィールド名列挙が残留、または例外明記がない場合、修正して再検証する（fix-and-reverify）。

  - id: TS-004
    target_item: AG-004
    verification: |
      docs/requirements/REQ-0108.md の REQ-0108-100 を読み込み、REQ-0101-069 安定契約
      例外（利用者に見える分類体系）が明記されていることを確認する。
    pass_criteria: |
      REQ-0108-100 に「REQ-0101-069 安定契約例外: 利用者に見える分類体系」の明記が
      あること。
    on_failure: |
      例外明記がない場合、追加して再検証する（fix-and-reverify）。

  - id: TS-005
    target_item: AG-005
    verification: |
      docs/requirements/REQ-0108.md の REQ-0108-153 を読み込み、REQ-0101-069 安定契約
      例外（利用者に見える分類体系）が明記されていることを確認する。
    pass_criteria: |
      REQ-0108-153 に「REQ-0101-069 安定契約例外: 利用者に見える分類体系」の明記が
      あること。
    on_failure: |
      例外明記がない場合、追加して再検証する（fix-and-reverify）。

  - id: TS-006
    target_item: AG-006
    verification: |
      docs/requirements/REQ-0148.md の REQ-0148-007/009/018 を読み込み、各要件行に
      REQ-0101-069 安定契約例外（安全境界）が明記されていることを確認する。
    pass_criteria: |
      REQ-0148-007/009/018 の各要件行に「REQ-0101-069 安定契約例外: 安全境界」の
      明記があること。
    on_failure: |
      例外明記がない行がある場合、追加して再検証する（fix-and-reverify）。

  - id: TS-007
    target_item: AG-007
    verification: |
      docs/requirements/REQ-0144.md の REQ-0144-013 を読み込み、REQ-0101-069 安定契約
      例外（公開入口）が明記されていることを確認する。
    pass_criteria: |
      REQ-0144-013 に「REQ-0101-069 安定契約例外: 公開入口」の明記があること。
    on_failure: |
      例外明記がない場合、追加して再検証する（fix-and-reverify）。

adr_judgement:
  needed: false
  reason: >
    SPEC 分離基準違反是正は既存 ADR-0103（SPEC は現在仕様の基準、将来内容は
    対象外）/ADR-0123（SPEC lifecycle）/ADR-0104（command SPEC 責務）と
    REQ-0101-068/069（SPEC 分離基準・安定契約例外）が確立した原理の適用。
    新規アーキテクチャ決定、技術スタック選定、責務境界変更を含まない。
    agentdev-adr-guidelines 条件1（仕様変更のみ）および条件5（artifact contract
    変更: REQ/ADR/SPEC 等の文書形式の修正）に該当し、ADR 作成不要。

case_open_hints:
  epic_needed: false
  wave_hints: []
```

# summary

inspect-docs（2026-06-26、commit ef82f6ec）の検出事項7件（Finding 1/3/4/5/6/7/8）について、SPEC 分離基準（REQ-0101-068）違反または安定契約例外（REQ-0101-069）境界の是正方針を確定した。

Finding 1（HIGH）は SPEC update: runtime-package-boundary.md の plugin-future 将来内容を4箇所から除去し、REQ-0103-064 参照へ縮退する。Finding 3（HIGH）は REQ update: REQ-0114-024 の Step 番号直接参照を機能名参照へ置換する。

Finding 4〜8（MEDIUM〜LOW）は全て REQ-0101-069 安定契約例外に該当すると判断し、REQ に例外根拠を明記して残す方針とした。Finding 4（test_strategy フィールド名）は安定契約「他コマンドとの接続契約」該当、フィールド名を日本語要約へ置換。Finding 5/6（severity/gate_level enum）は安定契約「利用者に見える分類体系」該当。Finding 7（数値上限）は安定契約「安全境界」該当。Finding 8（regex パターン）は安定契約「公開入口」該当。

6つの operation_unit は全て独立（depends_on なし）。同一ファイルへの複数 action（REQ-0108 の Finding 5+6）は同一 OU 内で処理。ADR は不要（既存 ADR-0103/0123/0104 と REQ-0101-068/069 が原理を確立済み）。
