---
draft_type: req_draft
topic_slug: standard-library-delegation
status: saved
created_at: 2026-08-20T17:07+09:00
source_rus:
  - RU-0002
  - RU-0003
  - RU-0004
agentdev_handoff: true
---

# draft-data

```yaml
work_type: feature

scale: large

summary: |
  ADF 固有でない一般処理（Project Extensions の YAML 構文解析、再帰ファイル探索、複雑な CLI 引数解析）を標準 API へ委譲し、ADF が所有・保守する範囲を ADF 固有の状態意味論・意味検証に限定する。
  技術選定（Bun.YAML、Zod の限定採用、node:fs glob、node:util.parseArgs）と責務分界を新規 Decision に記録し、委譲後の状態制約を新規 REQ が所有する。
  実装詳細（保証 YAML 機能一覧、Zod スキーマ対象、移行対象一覧、テスト方針）は Design 4 件（project-extensions、checker-execution-contracts、distribution-boundary、agentdev-artifact-graph）へ分離する。
  入力は session 由来 RU 3 件（RU-0002、RU-0003、RU-0004、agentdev_handoff: true、self-hosting リポジトリのため通常 workflow 入力として処理）。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      ADF は ADF 固有でない一般処理を標準 API へ委譲し、ADF 固有の状態意味論・意味検証のみを所有・保守する。
      委譲対象は次の3領域とする: (1) Project Extensions の YAML 構文解析（Bun.YAML へ委譲）と構造検証（Project Extensions に限定した Zod 採用）、(2) 再帰ファイル探索（node:fs の glob / globSync を第一候補とする。Bun.Glob 固定としない）、(3) 複雑な CLI 引数構文解析（node:util.parseArgs へ委譲。初期移行対象は repo-agentdev-integrity の cli_utils.ts、trusted-distribution-gate/cli.ts、agentdev-artifact-graph の query_graph.ts の3箇所）。
      ADF 側には Project Extensions の状態分類（missing、malformed、migration-required、schema-violation、valid）と旧kind・未知kind の意味判定、オプション間依存等の ADF 固有意味検証が残留する。
      委譲対象とした一般処理について、同一入力に対する独自解析実装と標準 API の二重経路を残存させない（RU-0002 受け入れ条件9、RU-0003 受け入れ条件8 相当）。
  - id: AG-002
    content: |
      ADF が保証する YAML 機能は、Project Extensions の現行スキーマを表現するために必要な範囲（マッピング、配列、文字列、数値、真偽値、null、入れ子構造、通常のクォート文字列）に限定する。
      YAML 1.2 の全機能保証、anchor、alias、カスタムタグ、複数ドキュメントの互換性保証は行わない。
      機能一覧の詳細、スコープ外構造の診断扱いは Design（project-extensions Design）が所有する。
  - id: AG-003
    content: |
      標準 API 移行に伴い、既存の外部契約を維持する。
      維持対象: Project Extensions の状態分類と fail-open 挙動（extension 不在時の標準動作継続、YAML 構文エラー時の当該 extension 無視、決定的検査器の不通過報告）、CLI の終了コード・stdout・stderr 契約、再帰列挙の対象ファイル集合・列挙決定性（glob の暗黙順序に依存せず明示 sort）、隠しディレクトリ（.agentdev、.opencode）の探索範囲、symlink/junction の追跡範囲、存在しないディレクトリの失敗時動作、Windows と Unix 系のパス区切り文字差の後段影響除去。
      YAML 値の型解釈差により、既存有効 extension の意味が意図せず変化しないことを回帰検証で確認する。
  - id: AG-004
    content: |
      標準 API 採用に伴う実行環境要件を事前検証する。
      対応する ADF 実行環境（Bun）で Bun.YAML、node:fs glob/globSync、node:util.parseArgs が利用できることを実行検証する。
      利用不能な対応環境がある場合は、代替 API へ無断変更せず当該移行対象を blocked として実装方針を再判断し、完了扱いにしない。
  - id: AG-005
    content: |
      新規依存（Zod）は既存の Skill 実行時パッケージ境界に従い、package.json / bun.lock で管理する。
      自己適用環境と利用先相当環境の双方で必要な依存を解決し、対象テストを実行できることを確認する。
      配布スキルの scripts への zod 依存追加は agentdev-artifact-graph の既存先例（dependencies に zod ^4.0.0）と同一の解決経路（package.json / bun.lock 配布、利用先での bun install 再生成）に従う。
  - id: AG-006
    content: |
      移行対象は限定する。単一ディレクトリ直下だけを列挙する単純な readdirSync、Dirent/stat によるファイル・ディレクトリ属性判定、数個の引数を取得するだけの単純な CLI 解析は対象外とし、標準化だけを理由に置換しない。
      全 Markdown frontmatter の一括移行、REQ・Decision 等の ID 解析の Zod 化、ADF 全体への Zod 適用強制、Project Extensions の利用者向け機能追加・スキーマ拡張、CLI 公開仕様（オプション名、サブコマンド体系、終了コード契約）の変更も対象外とする。
      標準 API が受理できる形式を、その事実だけで ADF の新しい公開 CLI 仕様として追加しない。既存互換維持のため標準 API の上に元解析器以上に複雑な再解析層が必要になる対象は、移行を強行せず blocked として再判断する。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: create
    target: new:standard-library-delegation
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006]
    content: |
      ## 目的

      ADF 固有でない一般的な構文解析・機構処理（YAML 構文解析、再帰ファイル探索、CLI 引数構文解析）の独自実装を標準 API へ委譲し、ADF が所有・保守する範囲を ADF 固有の状態意味論と意味検証に限定する。
      技術選定と責務分界の判断は Decision「一般処理の標準API委譲とADF固有意味論の所有境界」が記録し、本 REQ は委譲後の状態制約を所有する。
      実装詳細（保証 YAML 機能一覧、構造検証スキーマ対象、移行対象一覧、テスト方針）は Design が所有する。

      ## 要件

      | ID | 要件 |
      |---|---|
      | REQ-044-001 | ADF は ADF 固有でない一般処理（YAML 構文解析、再帰ファイル探索、CLI 引数構文解析）を標準 API へ委譲することとし、同一入力に対する独自解析実装と標準 API の二重経路を残存させないこと |
      | REQ-044-002 | ADF が保証する YAML 機能は Project Extensions の現行スキーマを表現するために必要な範囲に限定すること。機能一覧の詳細は Design が所有すること |
      | REQ-044-003 | 標準 API 移行に伴い、Project Extensions の状態分類と fail-open 挙動、CLI の終了コード・stdout・stderr 契約、ファイル列挙の決定性、隠しディレクトリの探索範囲、symlink/junction の扱い、存在しないディレクトリの失敗時動作、パス区切り文字差の後段影響など既存の外部契約を維持すること |
      | REQ-044-004 | 標準 API の採用に伴う新規依存は、既存の実行時パッケージ境界に従って管理し、自己適用環境と利用先相当環境の双方で解決可能であること |
      | REQ-044-005 | 対応する ADF 実行環境で標準 API が利用不能な場合は、代替 API へ無断変更せず当該移行を blocked として完了扱いにしないこと |

      ## 適用範囲

      - **対象**:
        - Project Extensions の YAML 構文解析と構造検証の標準 API 委譲（RU-0002）
        - 再帰ファイル探索実装の標準 API 委譲（RU-0003）
        - 複雑な CLI 引数解析実装の標準 API 委譲（RU-0004）
        - 委譲に伴う外部契約維持と依存管理
      - **対象外**:
        - 単一ディレクトリ直下の列挙、Dirent/stat による属性判定
        - 数個の引数を取得するだけの単純な CLI 解析
        - 全 Markdown frontmatter の一括移行、REQ・Decision 等の ID 解析の Zod 化、ADF 全体への Zod 適用強制
        - YAML 1.2 の全機能、anchor、alias、カスタムタグ、複数ドキュメントの互換性保証
        - Project Extensions の利用者向け機能追加、スキーマ拡張
        - CLI 公開仕様（オプション名、サブコマンド体系、終了コード契約）の変更
        - 標準 API の技術選定の判断根拠（Decision が所有）
  - id: ACT-DEC-001
    artifact: decision
    operation: create
    target: new:standard-library-delegation
    source_items: [AG-001, AG-002]
    content: |
      ## 背景

      ADF 固有実装の再評価（session: adf-standard-library-audit、RU-0002〜RU-0004）において、一般的な YAML 構文解析、再帰ファイル探索、CLI 引数構文解析を ADF が独自実装・保守する費用が大きい一方、ADF 固有の状態意味論（Project Extensions の状態分類、旧kind・未知kind 判定）と意味検証（オプション間依存等）は ADF 側に残すべきであると確認された。
      対論型レビューの結果、全実装の一括移行ではなく、Project Extensions に限定した Zod 採用、再帰探索だけの node:fs glob 移行、複雑な3実装だけの node:util.parseArgs 移行とする限定方針で合意した。

      ## 決定

      1. ADF 固有でない一般処理の構文解析・機構処理は標準 API へ委譲し、ADF は ADF 固有の状態意味論と意味検証のみを所有する。委譲対象と ADF 残留の境界は次のとおりとする:
         - YAML 構文解析は Bun.YAML へ委譲する。Bun.YAML.parse の例外は ADF の状態へ変換し、実行時処理を直接異常終了させない
         - 構造検証は Project Extensions に限定して Zod を採用する。Zod は構造検証のみを所有し、ADF 固有の状態意味論を所有しない
         - 再帰ファイル探索は node:fs の glob / globSync を第一候補とする（Bun.Glob 固定としない。既存の Node API 利用方針と整合）
         - CLI 引数構文解析（オプション値、真偽値オプション、短縮オプション、位置引数、サブコマンド、未知オプション）は node:util.parseArgs へ委譲する。オプション間依存、許容値、必須性等の ADF 固有意味検証は後段に残す
      2. ADF が保証する YAML 機能は、Project Extensions の現行スキーマを表現するために必要な範囲（マッピング、配列、文字列、数値、真偽値、null、入れ子構造、通常のクォート文字列）に限定する。anchor、alias、カスタムタグ、複数ドキュメントを保証対象としない
      3. 既存の外部契約（Project Extensions の状態分類と fail-open 挙動、CLI の終了コード・stdout・stderr、列挙結果の決定性、隠しディレクトリ・symlink/junction の探索範囲）は変更しない
      4. 委譲対象とした一般処理の独自実装を残存させず、同一入力に対する二重解析経路を維持しない

      ## 結果、影響

      - 新規 REQ（標準API委譲の状態制約）が本 Decision の判断を受けて CREATE される
      - Design 4 件（project-extensions、checker-execution-contracts、distribution-boundary、agentdev-artifact-graph）へ実装契約が追記・更新される
      - 対象 script 群（repo-agentdev-integrity の検査器群、agentdev-artifact-graph の scripts）の移行と回帰テスト固定化が Case で実行される
      - Zod 依存は既存の実行時パッケージ境界（package.json / bun.lock、利用先 bun install）で管理される。agentdev-artifact-graph の既存 zod 依存と同一経路であり、新規の依存境界機構は導入しない

      ## 関連する決定

      - DEC-015: relates-to。ADF 決定論的実行中核と実行基盤実行機構の責務分界（ADF vs harness）とは軸が異なる（ADF 固有 vs 一般処理の標準 API 委譲）。責務分界の類推として参照する
  - id: ACT-DESIGN-001
    artifact: design
    operation: append
    target: docs/designs/foundations/project-extensions.md
    target_area: "### 状態機械の共有実装"
    source_items: [AG-001, AG-002]
    content: |
      ### YAML 解析と構造検証の実装契約

      YAML 構文解析と構造検証は、ADF 固有の状態意味論と責務を分離して次のとおり構成する。

      - YAML 構文解析は `Bun.YAML.parse` に委譲する。`Bun.YAML.parse` の例外は ADF の状態（malformed 等）へ変換し、実行時処理を直接異常終了させない。独自の YAML 構文解析実装（parseSimpleYaml 相当）を残存させない
      - 構造検証は Zod に限定して採用する。検証対象は `version`、`kind`、`id`、`context`、`rules`、`checks`、`acceptance_gates`、`must_not` および各配列要素の構造とする。Zod は構造検証のみを所有し、状態意味論を所有しない
      - ADF が保証する YAML 機能は、本 Design のスキーマを表現するために必要な次の範囲に限定する: マッピング、配列、文字列、数値、真偽値、null、入れ子構造、通常のクォート文字列。anchor、alias、カスタムタグ、複数ドキュメントは保証対象外とする
      - `missing`、`malformed`、`migration-required`、`schema-violation`、`valid` の判定、および旧kind・未知kind の意味判定は ADF 側に残留する。kind enum は本 Design「Extension kind enum（公式）」が定める
      - 状態機械の共有実装（runtime resolver と deterministic checker の同一実装共有）は維持する。共有実装の配置は配布側（agentdev-project-extensions skill）を基点とし、repo-local checker から配布側実装を参照する方向とする。配布側実装から producer 内部成果物（repo-local 実装）への依存を作らない
      - YAML 解析結果の型差異（数値・真偽値・null の解釈差を含む）は構造検証または必要最小限の正規化で吸収し、既存有効 extension の状態分類と外部挙動を維持する
      - 回帰検証は、YAML 構文エラー、必須フィールド欠落、旧kind、未知kind、有効 extension の各ケースに加え、空入力、型不正、クォート内のコロン・`#`、CRLF、入れ子、配列を含む
  - id: ACT-DESIGN-002
    artifact: design
    operation: append
    target: docs/designs/integrity/checker-execution-contracts.md
    target_area: "## detector 命名規約"
    source_items: [AG-001, AG-003, AG-006]
    content: |
      ## 再帰ファイル探索と CLI 引数解析の標準API移行

      checker 群の再帰ファイル探索と CLI 引数解析の標準 API への移行契約を次のとおり定める。

      - 再帰的にディレクトリを列挙する独自実装（listFilesRecursive、listMarkdownRecursive、walkMarkdown 等の再帰関数）は `node:fs` の `glob` / `globSync` へ移行する。移行対象の抽出は影響範囲走査（`src/opencode/skills/agentdev-*/scripts/**`、`.opencode/skills/repo-agentdev-integrity/scripts/**` の再帰列挙実装）で確定する
      - 単一ディレクトリ直下だけを列挙する単純な `readdirSync`、`Dirent` / `stat` による属性判定は移行対象外とする。標準化だけを理由に glob へ変更しない
      - `.agentdev`、`.opencode` 等の隠しディレクトリを明示的な探索対象から除外しない。既存のパス正規化、列挙結果の決定性、存在しないディレクトリの扱い、symlink/junction の探索範囲を維持する
      - 列挙順は glob の暗黙順序に依存せず、決定性が必要な処理では正規化後のパスを sort して後段へ渡す
      - CLI 引数構文解析（オプション値、真偽値オプション、短縮オプション、位置引数、サブコマンド、未知オプション）は `node:util.parseArgs` を使用する。`cli_utils.ts`（整合性検査共通 CLI 契約）を初期移行対象とする
      - オプション間依存（例: `--profile release` 時の `--archive` 必須）、許容値、必須性等の ADF 固有意味検証は ADF 側の明示的な検証として後段に残す
      - 引数エラー時の終了コード、stdout、stderr は既存契約から変更しない。共通 CLI 契約（`--help`、`--json`、`--dry-run`、exit code 0/1/2、stdout 機械可読出力）は維持する
      - 移行前に各処理の現在の受理・拒否挙動（正常入力、空入力、値欠落、未知オプション、短縮オプション、位置引数、サブコマンド、重複オプション、`--`、`--option=value`、再帰列挙の対象ファイル集合・リンク追跡・隠しディレクトリ・欠落ディレクトリ挙動）をテストデータとして固定する
      - 標準 API が受理できる形式を、その事実だけで新規の公開 CLI 仕様として追加しない。既存仕様で保証していない形式の公開仕様化を行わない
      - 対応する ADF 実行環境で `node:fs` glob または `node:util.parseArgs` が利用不能な場合は代替 API へ無断変更せず blocked として再判断する
  - id: ACT-DESIGN-003
    artifact: design
    operation: update
    target: docs/designs/integrity/distribution-boundary.md
    target_area: "## 安定実装契約"
    source_items: [AG-001, AG-003]
    content: |
      ## 安定実装契約

      ユーザーが本 Design 候補へ配置を確定した安定実装契約。
      Epic 実装はこれに従う。
      関数署名、実装コード、内部データ表現は実装詳細として本節に含めない。

      - 共有 module: 副作用なし（side-effect-free）の canonical detector module は repo-agentdev-integrity 配下が所有する。想定モジュールパスは `.opencode/skills/repo-agentdev-integrity/scripts/lib/distribution-boundary.ts`。既存の checker はこの共有 module への adapter となる。
      - repo-local plugin: plugin パスは `.opencode/plugins/distribution-boundary-guard.ts`。
      - 事前書き込み gate: OpenCode の `tool.execute.before` フック（サポート対象は `edit`、`write`、`apply_patch`）で構成する。adapter は prospective content を評価し、違反または検査エラー時に書き込みを block する。
      - archive 公開前検査の呼び出し点: `scripts/package-release-archive.ps1` が最終公開前に一時 archive を検証する。
      - archive-installed 検証の配置: 一時的な consumer/archive-install パスを用いて archive-installed projection を検証する。`check-consumer-opencode.ps1` へ新たな責務を追加しない。
      - trusted-distribution-gate CLI（`trusted-distribution-gate/cli.ts`）の引数構文解析は `node:util.parseArgs` へ移行する。オプション間依存（`--profile release` 時の `--archive` 必須等）の意味検証は ADF 側に残留し、CLI の終了コード・stdout・stderr 契約は変更しない。移行契約の詳細は checker 共通実行契約 Design「再帰ファイル探索と CLI 引数解析の標準API移行」が定める。
  - id: ACT-DESIGN-004
    artifact: design
    operation: append
    target: docs/designs/skills/agentdev-artifact-graph.md
    target_area: "## 対象外"
    source_items: [AG-001, AG-003, AG-005]
    content: |
      ## スクリプト実装の標準API移行

      本スキル scripts の再帰ファイル探索と CLI 引数解析の標準 API 移行契約を次のとおり定める。

      - 再帰ファイル探索実装（`scripts/lib/query.ts` の walkDir、`scripts/lib/input.ts` の walk、`scripts/lib/verification.ts` の walk）は `node:fs` の `glob` / `globSync` へ移行する
      - 列挙結果の決定性は維持する。glob の暗黙順序に依存せず、正規化後のパスを sort して後段へ渡す。indexed_paths 配下の isExcludedPath による除外、ENOENT（存在しないディレクトリ）の既存扱い、パス正規化（forward slash）を維持する
      - `scripts/src/query_graph.ts` の引数構文解析は `node:util.parseArgs` へ移行する。サブコマンド（関係問い合わせ）の解釈、未知オプションの扱い、I/O 契約（argv 入力、stdout JSON、非ゼロ終了コード時の stderr）は既存契約から変更しない
      - 移行前に query、input、verification、query_graph の現在の受理・拒否挙動をテストデータとして固定し、変更前後で対象ファイル集合と問い合わせ結果が一致することを回帰検証する
      - `node:fs` glob または `node:util.parseArgs` が対応する ADF 実行環境で利用不能な場合は代替 API へ無断変更せず blocked として再判断する

conflict_resolutions: []

operation_units:
  - ou_id: OU-001
    source_ru: RU-0002
    target_req: REQ-044
    target_design: docs/designs/foundations/project-extensions.md
    operation: create
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-002
    source_ru: RU-0003
    target_req: REQ-044
    target_design: docs/designs/integrity/checker-execution-contracts.md
    operation: create
    scale: large
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}
  - ou_id: OU-003
    source_ru: RU-0004
    target_req: REQ-044
    target_design: docs/designs/integrity/distribution-boundary.md
    operation: create
    scale: large
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      移行対象の独自実装残存を確認する。repo-agentdev-integrity scripts と agentdev-artifact-graph scripts において、YAML 構文解析の独自実装（parseSimpleYaml 相当）、再帰列挙関数（listFilesRecursive、listMarkdownRecursive、walkMarkdown、walk、walkDir 相当）の残存を検索し、標準 API（Bun.YAML、node:fs glob、node:util.parseArgs）への置換と二重経路の不在を確認する。
    pass_criteria: |
      委譲対象とした一般処理の独自実装が残存せず、同一入力に対する二重解析経路が存在しない（RU-0002 受け入れ条件9、RU-0003 受け入れ条件8、RU-0004 対象3箇所の置換完了）。
    on_failure: |
      fix-and-reverify。残存実装を特定し、標準 API への置換または意図的な移行対象外としての根拠明示を行った上で再検証する。
  - id: TS-002
    target_item: AG-002
    verification: |
      Project Extensions の YAML 処理回帰検証を実行する。現在有効な extension テストデータに加え、YAML 構文エラー、必須フィールド欠落、旧kind、未知kind、有効 extension、空入力、型不正、クォート内のコロン・`#`、CRLF、入れ子、配列の各ケースで状態分類を確認する。
    pass_criteria: |
      現在有効なテストデータが変更後も同じ状態分類で valid となり、必須フィールド欠落・構造破損が malformed、旧kind が migration-required、未知kind が schema-violation となる。anchor、alias、カスタムタグ、複数ドキュメントを保証対象とする仕様・テストが追加されていない（RU-0002 受け入れ条件1、4〜7、10）。
    on_failure: |
      fix-and-reverify。状態分類の回帰を修正し、保証範囲外のテスト・仕様追加があれば除去して再検証する。
  - id: TS-003
    target_item: AG-003
    verification: |
      既存外部契約の回帰検証を実行する。移行前に固定したテストデータ（CLI の受理・拒否挙動、再帰列挙の対象ファイル集合・リンク追跡・隠しディレクトリ・欠落ディレクトリ挙動、パス区切り文字差）を用い、変更前後で結果が一致することを確認する。
    pass_criteria: |
      3 CLI 対象の既存正常系入力が同じ意味結果となり、引数エラー時の終了コード・stdout・stderr が既存契約と一致する。再帰列挙の対象ファイル集合、symlink/junction 探索範囲、存在しないディレクトリの失敗時動作が変更前と一致する。決定性が必要な処理で同一入力から同一順序の結果が得られる（RU-0003 受け入れ条件1〜6、RU-0004 受け入れ条件1〜8）。
    on_failure: |
      fix-and-reverify。外部契約の差分を既存契約へ復帰させ、テストデータを再実行する。
  - id: TS-004
    target_item: AG-004
    verification: |
      対応する ADF 実行環境での標準 API 可用性を実行検証する。Bun 実行環境で Bun.YAML、node:fs glob/globSync、node:util.parseArgs を用いた最小実行（パース、列挙、引数解析）を行い、利用可否を記録する。
    pass_criteria: |
      対応する全 ADF 実行環境で3標準 API が実行可能であることが確認され、実行結果が記録されている。利用不能な環境が判明した場合は当該対象が blocked として記録され、完了扱いとなっていない（RU-0002 受け入れ条件11、RU-0003 受け入れ条件9、RU-0004 受け入れ条件11の前提）。
    on_failure: |
      fix-and-reverify。利用不能環境が判明した場合は当該移行対象を blocked として実装方針を再判断し、代替 API の無断採用を行わない。
  - id: TS-005
    target_item: AG-005
    verification: |
      依存解決の検証を実行する。自己適用環境で Zod 依存追加後の package.json / bun.lock により対象テストが実行でき、利用先相当環境（fresh consumer 相当の依頼解決手順）でも同一テストが実行できることを確認する。
    pass_criteria: |
      自己適用環境と利用先相当環境の双方で必要な依存が解決し、対象テストが実行できる（RU-0002 受け入れ条件11）。
    on_failure: |
      fix-and-reverify。package.json / bun.lock の依存定義を修正し、双方環境で再実行する。

review_dispositions:
  - id: RD-001
    source_ru: RU-0002
    source_item: RU-0002
    disposition: covered
    reason_code: adopted
    reason: |
      Project Extensions の YAML 解析・構造検証の標準 API 委譲は ACT-REQ-001（REQ-044-001/002/003）、ACT-DEC-001（決定1、2）、ACT-DESIGN-001（YAML 解析と構造検証の実装契約）へ反映した。
      ただし RU-0002 の正規所有者とアンカー記載の docs/specs/foundations/project-extensions.md は実在しないため、正しい所有者 docs/designs/foundations/project-extensions.md へ修正して反映した。
    evidence:
      path: .agentdev/backlog/req-units/RU-0002.md
      section: 決定的受け入れ条件
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0003
    source_item: RU-0003
    disposition: covered
    reason_code: adopted
    reason: |
      再帰ファイル探索の node:fs glob 移行は ACT-REQ-001（REQ-044-001/003）、ACT-DEC-001（決定1）、ACT-DESIGN-002（再帰ファイル探索と CLI 引数解析の標準API移行）、ACT-DESIGN-004（スクリプト実装の標準API移行）へ反映した。
      非再帰列挙（fs-helpers.ts 等）・属性判定の対象外は AG-006 および REQ-044 適用範囲（対象外）へ反映した。
    evidence:
      path: .agentdev/backlog/req-units/RU-0003.md
      section: 決定的受け入れ条件
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_ru: RU-0004
    source_item: RU-0004
    disposition: covered
    reason_code: adopted
    reason: |
      3 CLI 対象の node:util.parseArgs 移行は ACT-REQ-001（REQ-044-001/003）、ACT-DEC-001（決定1）、ACT-DESIGN-002（cli_utils.ts）、ACT-DESIGN-003（trusted-distribution-gate/cli.ts、安定実装契約節への追記）、ACT-DESIGN-004（query_graph.ts）へ反映した。
      単純 CLI 解析の対象外、CLI 公開仕様不変、複雑化する対象の blocked 再判断は AG-006、AG-003 および各 Design の移行契約へ反映した。
    evidence:
      path: .agentdev/backlog/req-units/RU-0004.md
      section: 決定的受け入れ条件
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: true
  decomposition: |
    RU 単位の3子 Issue 構成を推奨する: OU-001（YAML 解析・構造検証移行、RU-0002）、OU-002（再帰ファイル探索移行、RU-0003）、OU-003（CLI 引数解析移行、RU-0004）。
    REQ-044 と Decision の保存（req-save）、Design 追記（design-save）は Epic 共通の先行工程となる。
    再帰探索実装の実測（探索結果: repo-local 5ファイル8実装、agentdev-artifact-graph 3ファイル3実装、RU-0004 CLI 3対象）を子 Issue の実装範囲特定に利用できる。
  wave_hints:
    - "Wave 1: OU-001（YAML 移行）。check_extensions.ts の主要改造を含み、状態機械共有実装の配置確定が後続の探索移行の入力になる"
    - "Wave 2: OU-002（再帰探索移行）と OU-003（CLI 解析移行）は並列実行可能。OU-002 は check_extensions.ts を含むため OU-001 完了後に実行すると競合が少ない"
```

# summary

session 由来 RU 3件（RU-0002、RU-0003、RU-0004）を統合入力とし、ADF 固有でない一般処理（YAML 構文解析、再帰ファイル探索、CLI 引数解析）の標準 API 委譲を feature large として要件定義した。

新規 REQ 1件（状態制約、ライブラリ名を含まない原則記述）、新規 Decision 1件（技術選定と責務分界、relates-to DEC-015）、Design 更新4件（project-extensions、checker-execution-contracts、distribution-boundary、agentdev-artifact-graph）を artifact_actions として構成した。

RU-0002 のアンカー誤記（docs/specs → docs/designs）は修正して反映済み。RU 3件とも `agentdev_handoff: true` を持つが、本リポジトリは self-hosting のため通常 workflow 入力として処理し、draft frontmatter へフラグを転記した。
