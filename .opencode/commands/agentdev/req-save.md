---
description: 壁打ち成果物をREQ/ADRファイルとしてdocs/に保存し、コミット・プッシュする
agent: sisyphus
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
- `.agentdev/intake/inbox/req-restructure/*.md`（REQ再構成候補検知時のみ。REQ-0109）

**注記**: `REQ-{NNNN}.md` を永続的な基準ファイルとする。`{area}.md` への保存は行わない（ADR-0007）。

## Steps

1. 事前チェック: `draft-meta` セクションの `pattern` を確認 → bugfixの場合は即座に中止し、エラーメッセージを表示: `バグ修正・軽微変更では req-save は不要です。直接 /agentdev/case-open を実行してください。`
2. ドラフト読込: `.sisyphus/drafts/req-draft-*.md` を読み込む → 最新の1件を対象とする。見つからない場合はエラーで中止: `壁打ちドラフトが見つかりません。先に /agentdev/req-define を実行してください。`
    - **読込時 hash 記録**: `git rev-parse HEAD` で読込時点の commit hash を記録する（SHALL — REQ-0108）
3. ドラフト検証: `draft-meta` セクションの必須フィールド（pattern, req-operation, topic-slug）が存在することを確認。欠損時はエラーで中止
3a. 分類ゲート検査（REQ-0109, REQ-0109）: CREATE対象REQの要件テーブルの各要件行について、既存成果物への反映作業のみを表す行が残っていないか検査する
    - **反映作業の定義**: 既存成果物への更新・削除・移動・名称変更・廃止・置換・参照修正・インデックス修正・整合性修正そのものを記述する行
    - **判定基準**: 要件行の述語が「〜を更新/削除/移動/改名/廃止/置換/修正すること」のみを表し、変更後に満たすべき振る舞い・制約・状態を含まない場合、反映作業のみと判定する
    - **検出時の処理**: 保存を停止し、以下を報告する:
      - 該当する要件行の内容
      - 反映作業のみと判定した理由
      - 推奨移送先（対象REQ/ADR/SPEC等への UPDATE / APPEND、関連ドキュメント更新候補、または後続Caseの変更対象）
    - **ユーザー指示待ち**: 報告後、ユーザーの指示（該当行の削除・移送先変更・req-define への差し戻し等）を待つ。ユーザーの単純な続行指示のみでは Step 4 へ進めない（REQ-0102）。分類結果に対する明示的な判定変更指示（「反映作業ではなく要件行として扱う」等の理由付き指示）があった場合のみ Step 4 へ進む
4. REQ ファイル操作 → `agentdev-req-file-manager` の判定ロジックと採番ルールに従って実行。ドラフトに複数の `req-operation` + `target-req` ペアが含まれる場合は、各ペアを順次処理する（バルクUPDATE対応）:
    - **CREATE**: テンプレート適用（目的/要件/適用範囲構造）、最大REQ番号+1で採番、`docs/requirements/REQ-{NNNN}.md` に保存
      **テンプレート準拠検証**: 生成されたREQファイルに `doc_requirement.md` の【必須】セクション（目的、要件、適用範囲）が全て含まれていることを確認すること。frontmatterの必須フィールド（id, title, created）の存在も確認すること。
    - **APPEND**: 既存REQファイルの要件テーブルに行を追加、frontmatter updated 更新
    - **UPDATE**: 既存REQファイルの該当セクション（目的/要件/適用範囲）を更新、frontmatter updated 更新
    - **バルク処理**: 複数REQファイルのUPDATEが指示されている場合、各REQファイルに対して上記UPDATE手順を順次実行する。全UPDATEの整合性（REQ番号の重複なし、frontmatterの一貫性）を最後に一括で検証する
    - **SPLIT検出時**: 要件の膨張・関心分離により SPLIT が必要と判定された場合でも、CREATE/APPEND/UPDATE の保存可能範囲を実行し、保存全体を中止しない。SPLIT 対象は完了報告で follow-up として明示する
    - **Finding 作成**: SPLIT が検出された場合、requirements review finding を `.sisyphus/drafts/requirements-review-finding-{topic-slug}.md` に作成する。finding の形式は `agentdev-workflow-lifecycle` reference の `requirements-review-finding-protocol.md` に従う
    - **REQ再構成候補の検知**（SHOULD）: REQ保存処理中にREQ体系上の歪み（分散・肥大化・重複・不要化・ドリフト等）を検知した場合、REQ再構成intakeを `.agentdev/intake/inbox/req-restructure/` に保存する（REQ-0109）。検知観点は `agentdev-req-file-manager` の「REQ再構成検知観点」を参照する
  5. インデックス・ハブ更新:
   - **docs/requirements/README.md**: CREATE時は新規行を追加、APPEND/UPDATE時は該当REQのtitle列をfrontmatter値に合わせて更新
   - **docs/README.md**: CREATE時は新規リンクをREQ番号順の正しい位置に挿入、APPEND/UPDATE時は該当REQのリンクテキスト（タイトル変更時のみ）を更新
   - 両ファイルの更新後、`agentdev-req-file-manager` の整合性チェック自動修正手順に従って検証
6. ADR ファイル作成（`draft-meta` の `adr-required: true` の場合のみ）→ `agentdev-adr-file-manager` に従って ADR ファイルを作成。作成後、`docs/README.md` にADRセクションが存在しない場合は追加し、ADRエントリを記載
7. docs 変更整合性検証: REQ番号の連続性確認、frontmatter の `id` とファイル名の一致を確認
8. DOC-MAP 影響確認: REQ/ADR/SPEC操作が `docs/DOC-MAP.md` に影響するか確認する（REQ-0101~037）。影響がある場合は DOC-MAP を更新する。影響がない場合は「DOC-MAP更新なし」とする。DOC-MAP更新は探索経路の更新であり、要件・判断・仕様の更新ではない（REQ-0101）。影響確認ルールの詳細は `agentdev-doc-map` スキルを参照
9. 変更範囲検証: `git diff --name-only` で変更ファイル一覧を取得し、`docs/` 以外の変更が含まれていればエラー内容をユーザーに報告して指示を待つ（変更の自動破棄は行わない）
9a. リモート同期と hash 検証（SHALL — REQ-0108）:
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
9b. ~~RU ファイル削除~~（廃止 — REQ-0105-014）:
    - req-save は RU ファイルを削除しない。RU 削除は `case-open` の Issue作成 + VERIFY 成功後にのみ実行される（REQ-0105-015）
    - 代わりに、REQファイルの Requirement Source セクションに RU パスを記録する
10. ドラフトの `## draft-meta` セクションの `status` を `saved` に更新する（SHALL — commit/push より前に更新し、status変更をcommitに含めることで永続化を保証する。push後のstatus更新は永続化されないため不可）
11. コミット・プッシュ → `agentdev-conventional-commits` に従ってコミットメッセージを生成し、mainブランチに push（SHALL — Step 10 で更新したドラフトファイルのstatus変更をcommit対象に含めること）
12. 完了報告 → `agentdev-workflow-reporting` の完了報告variantに従って出力。実行結果に応じたvariantを選択:
    - SPLIT検出 → completion-reports/req-save/split-detected.md（{docmap_status}変数あり）
    - DOC-MAP更新あり（SPLITなし）→ completion-reports/req-save/docmap-updated.md
    - DOC-MAP確認・更新不要（SPLITなし）→ completion-reports/req-save/docmap-not-needed.md
    - Epic規模 → completion-reports/req-save/epic.md
    - 上記以外 → completion-reports/req-save/standard.md

## Guardrails

### フェーズ制約
- G01: bugfixの場合は実行不可（エラーで中止）

### ファイル操作制約
- G02: ファイル編集スコープ: 以下のパスのみ作成・編集・削除を許可: `docs/requirements/**`（REQファイル）、`docs/adr/**`（ADR）、`docs/README.md`（ドキュメントハブ）、`.sisyphus/drafts/**`（ドラフトstatus更新用）
- G03: 上記以外のファイル作成・編集は禁止

### 品質ゲート
- G04: ドラフトファイルが存在しない場合は実行不可（エラーで中止）
- G05: REQ番号は連番・一意であること（空き番号の再利用禁止）→ `agentdev-req-file-manager` に従う
- G06: 要件doc構造は `doc_requirement.md` テンプレートに厳密に従うこと。【必須】セクションの欠落は禁止
- G07: ドラフトのstatus更新（`saved`）は commit/push より前に実行し、commit対象に含めること（SHALL）。push後のstatus更新は永続化されないため禁止
- G08: Step 9a の `git pull --ff-only` 後、読込時 hash と pull 後 hash の一致検証を必須とすること（SHALL）。一致しない場合は評価・承認をやり直すこと

### 委譲・参照制約
- G09: Pattern分岐の判定基準と固有ルールは `agentdev-workflow-lifecycle` → workflow classification を参照

### 出力制約
- G10: サブエージェントの最終出力はverbatimで出力する（再フォーマット禁止）
