---
description: 壁打ち成果物をREQ/ADRファイルとしてdocs/に保存し、コミット・プッシュする
agent: sisyphus
---

# 要件保存（壁打ち→docs永続化）

req-define（Prometheus）で壁打ちした成果物をREQ/ADRファイルとしてdocs/に保存し、コミット・プッシュする。壁打ちフェーズで使用（機能追加のみ）。

## Input

- `.agentdev/drafts/req-draft-{topic-slug}.md`（req-define で生成されたドラフト）

## Output

- `docs/requirements/REQ-{NNNN}.md`（新規/追記/更新）
- `docs/requirements/README.md`（インデックス更新）
- `docs/README.md`（ドキュメントハブ更新）
- `docs/adr/ADR-{NNNN}.md`（ADR判断がある場合のみ）
- `.agentdev/drafts/requirements-review-finding-{topic-slug}.md`（SPLIT検出時のみ。要件の膨張・関心分離によるSPLIT候補の詳細）
- `.agentdev/intake/inbox/req-restructure/*.md`（REQ再構成候補検知時のみ）

**注記**: `REQ-{NNNN}.md` を永続的な基準ファイルとする。`{area}.md` への保存は行わない。

## Steps

1. 事前チェック: `draft-meta` セクションの `work_type` を確認 → bugfixの場合は即座に中止し、エラーメッセージを表示: `バグ修正・軽微変更では req-save は不要です。直接 /agentdev/case-open を実行してください。`
2. ドラフト読込: `.agentdev/drafts/req-draft-*.md` を読み込む → 最新の1件を対象とする。見つからない場合はエラーで中止: `壁打ちドラフトが見つかりません。先に /agentdev/req-define を実行してください。`
     - **読込時 hash 記録**: `git rev-parse HEAD` で読込時点の commit hash を記録する
3. ドラフト検証: `draft-meta` セクションの必須フィールド（work_type, req-operation, topic-slug）が存在することを確認。欠損時はエラーで中止
3-1. 分類ゲート検査: CREATE対象REQの要件テーブルを検査する。詳細は `agentdev-req-file-manager` を参照。委譲接続点: サブエージェントは反映作業候補・理由・移送先候補のみを返し、親エージェントが停止とユーザー指示待ちを判断する
3-2. 文書分類適合確認: REQ/ADR 保存前に対象ドキュメント種別を確認する。詳細は `agentdev-req-file-manager` を参照。委譲接続点: サブエージェントは分類適合の判定材料のみを返し、親エージェントが保存可否を判断する
3-3. **OU 選択ゲート**: ドラフトの `operation_units` セクションを確認し、処理対象 OU を決定する（REQ-0102-039〜041）:
     - OU ID が指定されている場合 → 指定された OU のみを処理対象とする
     - OU ID 指定なし・OU 1 件 → その OU を自動選択して処理する
     - OU ID 指定なし・OU 2 件以上 → OU 一覧（`ou_id`, `target_req`, `operation`）を表示して停止する。ユーザーに OU ID の指定を求める
     - `operation_units` セクションがない場合 → 従来どおり全 req-operation を処理する（後方互換）
4. REQ ファイル操作 → `agentdev-req-file-manager` の判定ロジックと採番ルールに従って実行。Step 3-3 で選択した OU に含まれる REQ 操作のみを処理する（OU 選択ゲート通過時）。`operation_units` セクションがない場合は従来どおり全 req-operation を処理する。詳細は `agentdev-req-file-manager` を参照。委譲接続点: サブエージェントはCREATE/APPEND/UPDATE候補、SPLIT候補、REQ再構成候補を返し、親エージェントがファイル保存を行う
   - **4-0. 保存前定義完全性ゲート（QG-1）**: REQ/ADR ファイル保存前に、`agentdev-quality-gates` の QG-1（Definition Integrity Gate）に従い、保存対象の構造的完全性を最終検証する。判定基準・検査観点は同スキルの `references/qg-1-definition-integrity.md` を参照。fail 時は保存を停止し req-define へ差し戻しを推奨
4-1. **語彙・責務・runtime境界矛盾の防止**: Step 4 の保存完了後、既知の矛盾を検出可能な範囲で防止する。詳細は `agentdev-req-file-manager` を参照。委譲接続点: サブエージェントは検査結果と根拠のみを返し、親エージェントがfollow-up扱いを判断する
4-2. **Catalog entry 確認**（REQ-0108 APPEND 時）: Step 4 で REQ-0108 への APPEND 操作を実行した場合、追加した要件行に関連する `docs/specs/integrity-rule-catalog.md` の catalog entry 有無を確認する。catalog entry が未記載の場合、ユーザーに追記を促す。req-save 自身は `docs/specs/` 配下を直接編集しない（G02 制約）
5. インデックス・ハブ更新。詳細は `agentdev-req-file-manager` を参照。委譲接続点: 親エージェントのみが `docs/` ファイルを更新する
6. ADR ファイル作成（`draft-meta` の `adr-required: true` の場合のみ）→ `agentdev-adr-file-manager` に従って ADR ファイルを作成。作成後、`docs/README.md` にADRセクションが存在しない場合は追加し、ADRエントリを記載
7. docs 変更整合性検証: REQ番号の連続性確認、frontmatter の `id` とファイル名の一致を確認
8. DOC-MAP 影響確認: REQ/ADR/SPEC操作が `docs/DOC-MAP.md` に影響するか確認する。影響がある場合は DOC-MAP を更新する。影響がない場合は「DOC-MAP更新なし」とする。DOC-MAP更新は探索経路の更新であり、要件・判断・仕様の更新ではない。影響確認ルールの詳細は `agentdev-doc-map` スキルを参照
9. 変更範囲検証: `git diff --name-only` で変更ファイル一覧を取得し、`docs/` 以外の変更が含まれていればエラー内容をユーザーに報告して指示を待つ（変更の自動破棄は行わない）
9-1. リモート同期と hash 検証。詳細は `agentdev-req-file-manager` を参照。委譲接続点: 親エージェントのみが git 操作と読込やり直し判断を行う
3-4. RU パス保存禁止。詳細は `agentdev-req-file-manager` を参照。委譲接続点: サブエージェントはRU由来情報の有無だけを返し、親エージェントがdocs本文から除外する
10. ドラフトの `## draft-meta` セクションの `status` を `saved` に更新する。commit/push より前に更新し、status変更をcommitに含めることで永続化を保証する。push後のstatus更新は永続化されないため不可
11. コミット・プッシュ → `agentdev-conventional-commits` に従ってコミットメッセージを生成し、mainブランチに push。Step 10 で更新したドラフトファイルのstatus変更をcommit対象に含めること
11-1. マルチREQ操作結果の保存: ドラフトに複数の `req-operation` + `target-req` ペアが含まれる場合、以下を保存する:
      - (a) 保存したREQドキュメントのリスト（REQ番号を含む）
      - (b) 各REQ操作から保存したREQドキュメントへのマッピング
      - (c) ソースRUからREQ操作へのマッピング
      - (d) case-openで消費可能な形式での保存結果
      **OU 結果の書き戻し**: ドラフトに `operation_units` セクションがある場合、各 OU の `result` に保存結果を書き戻す（REQ-0102-042）。書き戻し内容: (a) 保存したREQドキュメント一覧 (b) OU 操作と保存先REQ doc の対応 (c) source RUとOU操作の対応 (d) case-open が入力として扱える保存結果
11-2. Issue作成の責任分離: req-saveはREQドキュメントの保存中にIssueを作成しない。Issue作成はcase-openの責任範囲とする
12. 完了報告 → 完了報告templateに従って出力。実行結果に応じたvariantを選択:
     - SPLIT検出 → .opencode/commands/agentdev/templates/req-save/split-detected.md（{docmap_status}変数あり）
     - DOC-MAP更新あり（SPLITなし）→ .opencode/commands/agentdev/templates/req-save/docmap-updated.md
     - DOC-MAP確認・更新不要（SPLITなし）→ .opencode/commands/agentdev/templates/req-save/docmap-not-needed.md
     - Epic規模 → .opencode/commands/agentdev/templates/req-save/epic.md
     - 上記以外 → .opencode/commands/agentdev/templates/req-save/standard.md

## Guardrails

### フェーズ制約
- G01: bugfixの場合は実行不可（エラーで中止）

### ファイル操作制約
- G02: ファイル編集スコープ: 以下のパスのみ作成・編集・削除を許可: `docs/requirements/**`（REQファイル）、`docs/adr/**`（ADR）、`docs/README.md`（ドキュメントハブ）、`.agentdev/drafts/**`（ドラフトstatus更新用）
- G03: 上記以外のファイル作成・編集は禁止

### 品質ゲート
- G04: ドラフトファイルが存在しない場合は実行不可（エラーで中止）
- G05: REQ番号は連番・一意であること（空き番号の再利用禁止）→ `agentdev-req-file-manager` に従う
- G06: 要件doc構造は `doc_requirement.md` テンプレートに厳密に従うこと。【必須】セクションの欠落は禁止
- G07: ドラフトのstatus更新（`saved`）は commit/push より前に実行し、commit対象に含めること。push後のstatus更新は永続化されないため禁止
- G08: Step 9-1 の `git pull --ff-only` 後、読込時 hash と pull 後 hash の一致検証を必須とすること。一致しない場合は評価・承認をやり直すこと

### ADR妥当性再検証ゲート

ADR保存の直前に、以下の妥当性を再検証すること:
- ADRが技術判断（アーキテクチャ上の決定）を含むか確認
- REQ/SPEC相当の内容のみの場合、保存を停止し理由を報告
- adr-guidelinesの判定結果を前提として検証する

### 委譲・参照制約
- G09: work_type分岐の判定基準と固有ルールは `agentdev-workflow-lifecycle` を参照

### 出力制約
- G10: 成果物本文（Issue本文・PR本文・commit message・保存対象ファイル本文・テンプレート成果物）はverbatimで返す。判定結果・調査過程・中間ログ・読解メモは要約・成果物パス・根拠・親判断事項・capture候補へ圧縮して返す

### Capture 非関与制約
- G12: req-save は intake / learning capture を行わない。例外: REQ 再構成 intake（`.agentdev/intake/inbox/req-restructure/**`）のみ生成可能。capture 境界の詳細は `agentdev-workflow-orchestration` を参照

### Issue作成制約
- G11: req-saveはIssueを作成してはならない。Issue作成はcase-openの責任範囲である
