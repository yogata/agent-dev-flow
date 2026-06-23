# req-save 詳細手順

req-save が req-define のドラフトを REQ/ ADR ファイルとして保存する際の詳細手順を定義する。
親エージェントは保存、インデックス更新、commit、push、ユーザー指示待ちを担当する。
サブエージェントへ委譲する場合は検査、分類、候補抽出のみを依頼する。

## 分類ゲート検査

CREATE 対象 REQ の要件テーブルに、既存成果物への反映作業のみを表す行が残っていないか検査する。

- 反映作業とは、既存成果物への更新、削除、移動、名称変更、廃止、置換、参照修正、インデックス修正、整合性修正そのものを記述する行を指す。
- 要件行の述語が「更新する」「削除する」「移動する」「改名する」「廃止する」「置換する」「修正する」だけを表し、変更後に満たすべき振る舞い、制約、状態を含まない場合は反映作業のみと判定する。
- 検出時は保存を停止し、該当行、判定理由、推奨移送先を報告する。
- 推奨移送先は対象 REQ/ ADR/ SPEC 等への UPDATE/ APPEND、または後続 Case の変更対象とする。
- 報告後はユーザー指示を待つ。単純な続行指示のみでは保存へ進まない。分類結果に対する明示的な判定変更指示がある場合のみ保存へ進む。

## 文書分類適合確認

REQ/ ADR 保存前に、対象ドキュメントの種別が `docs/specs/document-model.md` の Document Classification Policy に適合していることを確認する。
適合しない場合は保存を停止し、理由を報告する。

`draft-meta` に `adr-revision-mode: full-reclassification` が指定されている場合は、既存 ADR の full reclassification を許可する。
このモードでは既存 ADR を現行基準/ 廃止/ REQ、SPEC、guide 移管候補として再分類できる。
実行前に、移管先情報と変更内容をドラフトまたは保存結果へ明示的に記録する。

## REQ ファイル操作

ドラフトに複数の `req-operation` と `target-req` のペアが含まれる場合は、各ペアを順次処理する。
req-save が扱う operation type は REQ 操作（`create`/ `append`/ `update`）のみとする。
SPEC 操作（`spec-create`/ `spec-update`）は `target_spec` フィールドで識別され、spec-save コマンドが消費するため req-save の対象外とする。

- CREATE: テンプレートを適用し、最大 REQ 番号 + 1 で `docs/requirements/REQ-{NNNN}.md` に保存する。生成後、`doc_requirement.md` の必須セクションと frontmatter 必須フィールドを確認する。
- APPEND: 既存 REQ ファイルの要件テーブルに行を追加し、frontmatter `updated` を更新する。
 - 廃止宣言（retire 宣言）の APPEND を行う場合は、既存 REQ ファイルから同種の宣言行を検索し、precedent として書式（理由、移行先、吸収有無）を機械的に再利用する。対象 REQ 番号と理由のみ差し替え、REQ 間で宣言表記を統一する。推奨運用（必須ではない）。
- UPDATE: 既存 REQ ファイルの目的、要件、適用範囲の該当セクションを更新し、frontmatter `updated` を更新する。
- バルク UPDATE: 各 REQ ファイルに UPDATE を順次実行し、全 UPDATE 後に REQ 番号重複と frontmatter 一貫性を一括検証する。
- SPLIT 検出時: 保存可能範囲を実行し、SPLIT 対象は完了報告で follow-up として明示する。
- 検出事項の作成: requirements review の検出事項を `.agentdev/drafts/requirements-review-finding-{topic-slug}.md` に作成する。形式は `agentdev-workflow-lifecycle` reference の `requirements-review-finding-protocol.md` に従う。
- REQ 再構成候補: REQ 体系上の歪みを検知した場合、REQ 再構成 intake を `.agentdev/intake/inbox/req-restructure/` に保存する。

## 局所矛盾防止

保存完了後、draft-meta を使って、保存後に残る既知の矛盾を検出可能な範囲で防止する。

- 語彙の不整合
- 責務の重複、欠落
- 実行時コマンド境界の矛盾

SPLIT や REQ 再構成候補を検出した場合は、`/agentdev/inspect-docs` の REQ 構造レビュー検出事項として扱う。
本コマンド内では保存可能範囲を実行し、完了報告の follow-up として明示する。
この検査は保存時の局所的な矛盾防止であり、`/agentdev/inspect-docs` の全体意味レビューの代替ではない。

## インデックス、ハブ更新

1. CREATE 時は `docs/requirements/README.md` に新規行を追加する。
2. APPEND/ UPDATE 時は `docs/requirements/README.md` の該当 REQ title 列を frontmatter 値に合わせて更新する。
3. CREATE 時は `docs/README.md` に新規リンクを REQ 番号順の正しい位置へ挿入する。
4. APPEND/ UPDATE 時はタイトル変更がある場合のみ `docs/README.md` の該当 REQ リンクテキストを更新する。
5. 両ファイルの更新後、`agentdev-req-file-manager` の整合性チェック自動修正手順に従って検証する。

## リモート同期と hash 検証

1. `git pull --ff-only` を実行する。
2. fast-forward できない場合はエラーで中止する。
3. pull 後の `git rev-parse HEAD` を取得し、ドラフト読込時の hash と一致することを確認する。
4. 一致する場合は保存を継続する。
5. 一致しない場合はリモート変更検出メッセージを表示し、ドラフト読込からやり直す。

## RU パス保存禁止

docs 永続文書に RU パスを記録しない。
RU は一時成果物であり、削除は case-open の Issue 作成と VERIFY 成功後にのみ実行する。


