---
description: 壁打ち成果物をREQ/ADRファイルとしてdocs/に保存し、コミット・プッシュする
agent: sisyphus
load_skills:
  - agentdev-req-file-manager
  - agentdev-adr-file-manager
  - agentdev-adr-guidelines
  - agentdev-workflow-lifecycle
  - agentdev-workflow-reporting
  - agentdev-conventional-commits
  - agentdev-no-ai-slop-writing
---

# 要件保存（壁打ち→docs永続化）

req-define（Prometheus）で壁打ちした成果物をREQ/ADRファイルとしてdocs/に保存し、コミット・プッシュする。壁打ちフェーズで使用（機能追加のみ）。

## Input

- `.sisyphus/drafts/req-draft-{topic-slug}.md`（req-define で生成されたドラフト）

## Output

- `docs/requirements/REQ-{NNNN}.md`（新規/追記/更新）
- `docs/requirements/README.md`（インデックス更新）
- `docs/README.md`（ドキュメントハブ更新）
- `docs/adr/ADR-{NNNN}.md`（ADR判断がある場合のみ）
- `.sisyphus/drafts/requirements-review-finding-{topic-slug}.md`（SPLIT検出時のみ。要件の膨張・関心分離によるSPLIT候補の詳細）

**注記**: `REQ-{NNNN}.md` を永続的な基準ファイルとする。`{area}.md` への保存は行わない（ADR-0007）。

## Steps

1. 事前チェック: `draft-meta` セクションの `pattern` を確認 → バグ修正・軽微変更（Pattern A）の場合は即座に中止し、エラーメッセージを表示: `バグ修正・軽微変更では req-save は不要です。直接 /agentdev/case-open を実行してください。`
2. ドラフト読込: `.sisyphus/drafts/req-draft-*.md` を読み込む → 最新の1件を対象とする。見つからない場合はエラーで中止: `壁打ちドラフトが見つかりません。先に /agentdev/req-define を実行してください。`
    - **読込時 hash 記録**: `git rev-parse HEAD` で読込時点の commit hash を記録する（SHALL — REQ-0033-005）
3. ドラフト検証: `draft-meta` セクションの必須フィールド（pattern, req-operation, topic-slug）が存在することを確認。欠損時はエラーで中止
4. REQ ファイル操作 → `agentdev-req-file-manager` の判定ロジックと採番ルールに従って実行。ドラフトに複数の `req-operation` + `target-req` ペアが含まれる場合は、各ペアを順次処理する（バルクUPDATE対応）:
    - **CREATE**: テンプレート適用（目的/要件/適用範囲構造）、最大REQ番号+1で採番、`docs/requirements/REQ-{NNNN}.md` に保存
      **テンプレート準拠検証**: 生成されたREQファイルに `doc_requirement.md` の【必須】セクション（目的、要件、適用範囲）が全て含まれていることを確認すること。frontmatterの必須フィールド（id, title, created）の存在も確認すること。
    - **APPEND**: 既存REQファイルの要件テーブルに行を追加、frontmatter updated 更新
    - **UPDATE**: 既存REQファイルの該当セクション（目的/要件/適用範囲）を更新、frontmatter updated 更新
    - **バルク処理**: 複数REQファイルのUPDATEが指示されている場合、各REQファイルに対して上記UPDATE手順を順次実行する。全UPDATEの整合性（REQ番号の重複なし、frontmatterの一貫性）を最後に一括で検証する
    - **SPLIT検出時**: 要件の膨張・関心分離により SPLIT が必要と判定された場合でも、CREATE/APPEND/UPDATE の保存可能範囲を実行し、保存全体を中止しない。SPLIT 対象は完了報告で follow-up として明示する
    - **Finding 作成**: SPLIT が検出された場合、requirements review finding を `.sisyphus/drafts/requirements-review-finding-{topic-slug}.md` に作成する。finding の形式は `agentdev-workflow-lifecycle` reference の `requirements-review-finding-protocol.md` に従う
5. インデックス・ハブ更新:
   - **docs/requirements/README.md**: CREATE時は新規行を追加、APPEND/UPDATE時は該当REQのtitle列をfrontmatter値に合わせて更新
   - **docs/README.md**: CREATE時は新規リンクをREQ番号順の正しい位置に挿入、APPEND/UPDATE時は該当REQのリンクテキスト（タイトル変更時のみ）を更新
   - 両ファイルの更新後、`agentdev-req-file-manager` の整合性チェック自動修正手順に従って検証
6. ADR ファイル作成（`draft-meta` の `adr-required: true` の場合のみ）→ `agentdev-adr-file-manager` に従って ADR ファイルを作成。作成後、`docs/README.md` にADRセクションが存在しない場合は追加し、ADRエントリを記載
7. docs 変更整合性検証: REQ番号の連続性確認、frontmatter の `id` とファイル名の一致を確認
8. DOC-MAP 影響確認: REQ/ADR/SPEC操作が `docs/DOC-MAP.md` に影響するか確認する（REQ-0035-034~037）。影響がある場合は DOC-MAP を更新する。影響がない場合は「DOC-MAP更新なし」とする。DOC-MAP更新は探索経路の更新であり、要件・判断・仕様の更新ではない（REQ-0035-037）。影響確認ルールの詳細は `agentdev-doc-map` スキルを参照
9. 変更範囲検証: `git diff --name-only` で変更ファイル一覧を取得し、`docs/` 以外の変更が含まれていればエラー内容をユーザーに報告して指示を待つ（変更の自動破棄は行わない）
9a. リモート同期と hash 検証（SHALL — REQ-0033-005）:
    - `git pull --ff-only` を実行する
    - **pull 失敗時**: fast-forward できない場合はエラーで中止する
    - **hash 一致検証**: `git rev-parse HEAD` で pull 後の commit hash を取得し、Step 2 で記録した読込時 hash と一致することを確認する
        - **一致する場合**: 次の Step へ進む（リモートに新規変更なし）
        - **一致しない場合**: リモートに新規変更が取り込まれたため、Step 2 の読込からやり直す（評価・承認を再実行）。構造化メッセージを表示:
          ```
          ## リモート変更検出

          **読込時 hash**: {original_hash}
          **pull 後 hash**: {post_pull_hash}
          **アクション**: リモートに新規変更が取り込まれたため、読込からやり直します
          ```
9b. RU ファイル削除（SHALL — REQ-0039-015, 0039-017）:
    - ドラフトの `## Requirement Source` セクションに記録されたパスのうち、`.agentdev/backlog/req-units/RU-*.md` に一致するファイルを削除する
    - **削除条件**: Step 4 の REQ ファイル保存が成功している場合のみ（SHALL）。Step 4 でエラーが発生した場合は RU を残置する
    - **削除対象外**: RU パターンに一致しない Requirement Source（promoted artifact、一般ファイル等）は削除しない
10. ドラフトの `## draft-meta` セクションの `status` を `saved` に更新する（SHALL — commit/push より前に更新し、status変更をcommitに含めることで永続化を保証する。push後のstatus更新は永続化されないため不可）
11. コミット・プッシュ → `agentdev-conventional-commits` に従ってコミットメッセージを生成し、mainブランチに push（SHALL — Step 10 で更新したドラフトファイルのstatus変更をcommit対象に含めること）
12. 完了報告 → `agentdev-workflow-reporting` の完了報告フォーマット（completion-reports.md → req-save 完了時）に従って出力
    SPLIT が必要な場合、完了報告に以下を追加:
    ```
    ⚠️ SPLIT候補: REQ-{NNNN} の要件が膨張・関心分離の基準に該当。別Issueでの review/follow-up を推奨。
    Finding を作成しました: `.sisyphus/drafts/requirements-review-finding-{topic-slug}.md`
     次のコマンド: finding ファイルを入力として `/agentdev/req-define` を実行してください
     ```
     DOC-MAP更新が不要だった場合:
     ```
     DOC-MAP更新: なし（該当する DOC-MAP エントリがないため）
     ```
     DOC-MAP更新が必要だった場合:
     ```
     DOC-MAP更新: あり（{what was updated}）
     ```

## Guardrails

### フェーズ制約
- G01: バグ修正・軽微変更（Pattern A）の場合は実行不可（エラーで中止）

### ファイル操作制約
- G02: ファイル編集スコープ: 以下のパスのみ作成・編集・削除を許可: `docs/requirements/**`（REQファイル）、`docs/adr/**`（ADR）、`docs/README.md`（ドキュメントハブ）、`.sisyphus/drafts/**`（ドラフトstatus更新用）、`.agentdev/backlog/req-units/**`（RU削除用 — REQ-0039-015）
- G03: 上記以外のファイル作成・編集は禁止

### 品質ゲート
- G04: ドラフトファイルが存在しない場合は実行不可（エラーで中止）
- G05: REQ番号は連番・一意であること（空き番号の再利用禁止）→ `agentdev-req-file-manager` に従う
- G06: 要件doc構造は `doc_requirement.md` テンプレートに厳密に従うこと。【必須】セクションの欠落は禁止
- G07: ドラフトのstatus更新（`saved`）は commit/push より前に実行し、commit対象に含めること（SHALL）。push後のstatus更新は永続化されないため禁止
- G08: Step 9a の `git pull --ff-only` 後、読込時 hash と pull 後 hash の一致検証を必須とすること（SHALL）。一致しない場合は評価・承認をやり直すこと

### 委譲・参照制約
- G09: Pattern分岐の判定基準と固有ルールは `agentdev-workflow-lifecycle` → Pattern Registry を参照

### 出力制約
- G10: サブエージェントの最終出力はverbatimで出力する（再フォーマット禁止）
