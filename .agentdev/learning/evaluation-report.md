# 評価レポート

## メタデータ

- **実行日時**: 2026-10-15（backlog-auto stage 2 learning 系統。再開実行）
- **基準 revision**: 38bc58c7（durable state 記録と同期後の HEAD の一致を確認。2026-10-15T21:08:48+09:00 に `git pull --ff-only` を実行し、`Already up to date.`（exit 0）。
- **時刻**: 親 run 開始 2026-10-15T18:08:07+09:00。learning 系統の最初の Jev observation 2026-10-15T18:53:38+09:00（親開始時刻と区別）。今回の再開は2026-10-15T20:55:09+09:00、同期ゲート到達は2026-10-15T21:05:08+09:00。
- **対象エントリ数**: inbox 41 件、deferred 227 件（見出し231行のうち4行は様式・説明見出し）
- **問題クラス数**: 31（8 クラスター + 23 単独。クラスターは根本原因・再発条件・予防策の一致で限定）
- **Jev**: 分類 4 評価・8軸評価 8 評価・処分区分 1 評価・昇華可能性 1 評価を durable observations から再構成。8軸は finalResult を用い、score の値は scale index + 1 として換算。発生件数は inbox 内同一問題クラス数から決定的に導出。
- **旧 report**: 10/13 実行の別の20件を対象にしたため、本レポートで置換。
- **extension**: `.agentdev/extensions/skills/agentdev-workflow-learning-promote.yaml` は 5 セクションすべて空。

## 判定基準

処分はスコアのみで決めず、既存恒久対策の現状、実害、情報の自足性、昇華可能性、既存プールとの関係を併せて評価した。Jev の結果は助言であり、結果を機械的に採択しない。Disposition 5 は既存対策のギャップが具体的に確認できた場合のみ promote する。十分な恒久対策により既に網羅されているものだけ duplicate とし、deferred に似た記録があるだけでは duplicate にしない。Decision 候補は禁止条件ゲート（技術判断の欠如、command 仕様、運用規則等）により全単位で除外。

## 問題クラス評価・処分

軸順: 発生件数 / 影響度 / 横展開性 / 反映先明確度 / 自動化適性 / プロジェクト固有知識再利用性 / 再発可能性 / 費用対効果。各行末の加重合計は満点40（/40）。E番号は inbox 見出しの出現順（E1〜E41）。

| 単位 | エントリ | 8軸 | 処分 | 根拠・既存対策照合 |
|---|---|---:|---|---|
| C1 | E28,E33 checker を pipe に通した終了コード誤認 | 2/2/3/3/3/3/2/3 = 21 | duplicate | `docs/knowledge/windows-checker-observation-discipline.md` L13 は `$?` が pipeline の末尾 command を返すと明記し、pipe なし実行または `PIPESTATUS` による観測を要求する。症状・予防策とも一致するため新しい成果物を生成しない。 |
| C2 | E20,E25,E34,E37 並列負荷時の test timeout と由来分離 | 3/3/4/4/4/4/4/4 = 30 | deferred | `docs/knowledge/windows-bun-test-spawn-timeout-classification.md` L11-L21 は timeout の単独再実行、実測ベースの test timeout 設定、suite 負荷下の main HEAD 対照を規定し、E20/E34/E37を覆う。一方 E25 は test 内 git commit の60秒 child timeoutであり、既存知識の test runner timeout と同一対策が十分か確認できない。安全側にliving poolへ残す。 |
| C3 | E24,E27 baseline fail と完了条件の由来分離 | 2/4/4/4/3/4/4/4 = 29 | deferred | QG-4 の既存 fail 由来分類、baseline 対照の知識がある。今回も起票済みIssue等の個別運用記録で、既存規則の適用事例か規範追加が要るかを十分に分離できない。 |
| C4 | E21,E26 worktree / package の textlint vendor 未生成 | 2/1/3/4/4/4/4/4 = 26 | duplicate | `README.md` の開発者向け依存生成手順、`agentdev-git-worktree/references/worktree-operations.md` L114、L167 が worktree 未伝播と再生成を明示する。候補本文 deferred L3532/L3616 も読戻し確認し、回復まで含めて現行の恒久手順が十分であることを確認。 |
| C5 | E2,E15 PR 非起因 gate fail 時の対照・残ゲート | 2/4/4/4/4/4/4/4 = 30 | deferred | `definition-pr-and-idempotency.md` に check_integrity の base 対照はあるが、case-ready 側の早期 return 後に残 gate を安全に消費する契約の整備は明瞭でない。一方、fail-closed 制約と後続 gate 消費方法の合意が必要で、安易な緩和はしない。 |
| C6 | E7,E23 traceability 対応宣言の集約・集合一致 | 2/3/3/4/5/4/4/4 = 29 | duplicate | `agentdev-traceability/references/sidecar-and-policy.md` L39-L56 と L134-L142 が、既存情報源の事前確認、同一 artifact × role の集約、inline/sidecar 集合の両方向一致を明示する。両例ともその既存規則に従った機械修正であり追加規範を要しない。 |
| C7 | E5,E11 Case 対象の traceability target 行選択 | 2/3/3/4/4/4/4/4 = 28 | duplicate | case-open の `references/root-case-and-definition-package.md` L56-L58 は REQ 変更行・意味変更行の coverage 対象を定め、case-ready の `references/definition-acceptance.md` L92-L95 は canonical Definition の Case 対象要件行に check を限定する。E5/E11 はともに既存 gate 範囲の選択ミスで、対策は既存契約にある。 |
| C8 | E6,E35 Windows/Bash と Node・spawnSync 間のパス表現不一致 | 2/1/4/4/4/4/4/3 = 26 | deferred | 2事例とも Windows 上で Bash/MSYS 由来のパスを Node 系プロセスに渡し、対象ファイルまたは cwd の解決に失敗。Windows native path を使う回避は共通するが、呼出し形態の網羅性は既存知識へ明確に反映されていない。 |
| E1 | 並行 case-open の共通 Jev 観測 partial commit | 1/1/3/4/3/3/3/3 = 21 | deferred | deferred L3700 の同根観測があるが、既存の learning 記録は正規対策そのものではない。再発関係を明記し、先行 commit 直前の staged 内容と message の突合を次回評価する。 |
| E3 | REQ追加時 README 手動件数の追随漏れ | 1/3/3/4/3/3/4/4 = 25 | promote（既存対策更新） | `docs/README.md` には AUTOGEN ブロック外の「現行要件は N 件」文が残る。`generate_indexes` はその文を更新しない。deferred L2486 に同じ現象の先行観測があり、本 inbox で70件目の追加時に再発したため既存対策の適用ギャップが具体化している。 |
| E4 | agentdev_gh 操作別入力契約（issue_read labels 不可） | 1/2/3/4/3/2/3/3 = 21 | duplicate | `src/common/tools/agentdev-gh/contracts.ts` L156 の `issue_read` 入力型は `{operation, number}` のみ。labels 付き要求を schema が拒否するのは既存の fail-closed 操作別契約で完全に検出される。 |
| E8 | 対照救済の比較対象は report file でなく stdout 原証跡 | 1/3/3/4/4/3/4/4 = 26 | duplicate | `case-open/references/definition-pr-and-idempotency.md` L44 は同じ検査実行の stdout/stderr 全文を step detail に保存し、summary を原結果の代替にしないと明記する。対照救済も findings 完全一致で判定するため、report file を証拠にしない既存の原証跡規律が当該誤りを覆う。 |
| E9 | extension rule 読込前に GitHub 本文を投稿 | 1/2/3/4/4/3/4/4 = 25 | promote（既存対策更新） | workflow extension の実行時ロード能力はある一方、本文書込み前に rules を必須確認する手順が case-ready の当該書込み手順に見当たらない（grep 実測）。投稿後の遡及検査ではなく前置規律を検討できる自足した候補。 |
| E10 | Root Case state 更新に trackingState を誤指定 | 1/2/2/4/3/2/2/3 = 19 | duplicate | `agentdev-issue-management/references/issue-operation-safety.md` L112-L123 と `agentdev-issue-tracking/SKILL.md` L49 は trackingState を Tool 引数から除き、Case/追跡Issue の状態を本文標準構造へ保持することを明記。誤引数は Tool が副作用前に拒否する。 |
| E12 | 親判断が確定する前に条件付き Jev choice を生成 | 1/2/4/4/3/3/4/3 = 24 | duplicate | `case-ready/references/execution-structure.md` L74-L87 は親判断の最終確定後に条件付き質問を生成し、条件不成立なら後続質問・観測を作らない契約を明記する。 |
| E13 | overlap 警告 summary が top-level warnings を読む | 1/3/2/4/4/3/5/4 = 26 | promote（既存対策更新） | `accept_definition_checks.ts` L441-L459 を実測。engine の warnings は condition_a 配下だが要約は `parsed.warnings` を読んで常に0となる。実装不備と実害が具体的、修正境界がスクリプトの summary 箇所に局在。 |
| E14 | AUTOGEN 計測日だけの差分で受入検査が warn | 1/2/3/4/4/3/5/4 = 26 | deferred | 既存の計測日収束規約がある一方、時間差だけの差分を自動で pass にするかは gate 意味論を変える。実害の緊急性はなく、決定的除外を自律採用しない。 |
| E16 | Jev references digest が SHA-256 形式でない | 1/4/4/4/4/3/3/4 = 27 | duplicate | `docs/designs/responsibilities/custom-tool-contracts.md`「Jev 先行評価」契約は再構成可能な入力参照を digest 付きで扱い、`agentdev_jev` の受理 schema は SHA-256 hex 64文字を要求する。Tool の観測永続化失敗 warning はこの契約どおりであり、caller が placeholder を送った事例を新しい対策として重複しない。 |
| E17 | issue_update 本文のバックスラッシュ逐語性 | 1/3/3/4/4/4/3/4 = 26 | deferred | Issue更新時の前後比較規律はあるが、JSON の raw 表現からの逐語コピーという追加安全策が規定済みかは確認できず、ただし既存契約の外部更新だけでなく適用手順の不足を精査要。 |
| E18 | 並行 Case で同じ pre-existing textlint を重複検出 | 1/2/3/4/4/3/4/4 = 25 | deferred | worktree/main 対照と既存債務記録の契約が存在。兄弟 Case の修正済み状況確認の細部は補足候補だが、対策を恒久化すべき範囲は未確定。 |
| E19 | worktree/main で同一 self-sync 乖離なら corpus 債務 | 1/4/4/4/3/4/4/4 = 28 | deferred | `docs/knowledge/worktree-preexisting-violation-main-crosscheck.md` L9-L19 は worktree の違反と main の解消状況を照合する規律を与えるが、「同一 self-sync 乖離なら corpus 側の構造欠落」という適用基準や処遇 Case 確認までは明記しない。追加判断を確定せずliving poolに保持。 |
| E22 | squash merge 後 git branch -d 拒否 | 1/2/4/4/4/3/5/4 = 27 | duplicate | `agentdev-git-worktree/references/worktree-operations.md` L490-L504 は squash 後の `-D` を PR MERGED 状態と branch 構成別の `git cherry` / `git diff` 実測の両条件で限定許可し、不成立時は停止する。E22 の安全確認は既存の削除境界で覆われる。 |
| E29 | Bun.YAML 依存 checker の node 実行 | 1/3/3/4/4/4/4/4 = 27 | duplicate | `checker-execution-contracts.md` に Bun 固有 API 依存 checker は Bun で実行する契約があり、Bun.YAML を node で動かせない点を既に包摂する。 |
| E30 | close_mechanical_steps が bun test stdout 先頭のみ保存 | 1/3/3/4/4/4/4/4 = 27 | duplicate | `agentdev-quality-gates/references/qg-4-final-acceptance.md` L127-L128 は機械工程 script 内の spawnSync 証跡を bun test 件数の根拠にせず、bun test を script 外で stdout/stderr 分離実行することを明記。entry の対応はこの既存手順と一致。 |
| E31 | definitionEdits を二段階構築して重複 | 1/3/3/4/5/4/4/4 = 28 | deferred | 冪等再実行、旧文完全一致は既存規則。重複編集の前置検証を script に追加するか、組立て手順で防ぐかの実現判断は未確定。 |
| E32 | wrapped retries の合計時間を timeoutMs に含める | 1/3/4/4/4/4/4/4 = 28 | deferred | `timeoutMs` は実行全体を制限する既存契約だが、retry 回数と余裕を織り込む算定規則は固定されていない。単独実測だけで具体値を規範化しない。 |
| E36 | bun install により lockfile が新規生成 | 1/1/3/4/4/3/3/4 = 23 | deferred | package/管理状態に依存する1観測。不要ファイルの status 確認は安全規律として有効だが、全 package 向けの恒久ルールに一般化するだけの範囲根拠が不足。 |
| E38 | bun test 分割の件数と実テストファイル数が乖離 | 1/3/3/4/5/4/4/4 = 28 | deferred | `agentdev-quality-gates` の件数突合規則が存在。node_modules を含む探索が主因であり、現行契約への追記が必要かを再発証拠に応じて判断する。 |
| E39 | LSP timeout 時に tsc --noEmit で型検査証拠を得る | 1/3/4/4/4/4/4/4 = 28 | deferred | tsc と LSP が完全同等ではなく、型検査対象・診断対象の差を保つ必要がある。代替受入れ条件を自動確定する証拠が不足。 |
| E40 | prepare_definition_pr に traceabilityReqIds 不在で target scope fail | 1/3/4/4/5/4/4/4 = 29 | promote（既存対策更新） | `prepare_definition_pr.ts` L168-L208 で optional 不在を空配列へ正規化し、L603/L613 で gate 判定に使う。別の `--req` 指定だけでは判定集合にならない。入力整合性の不足・実害・想定修正が具体的。 |
| E41 | Design の言い換え適用で verbatim 包含不成立 | 1/3/3/4/4/4/4/4 = 27 | duplicate | REQ-030-027 の合意済み content と適用後成果物の逐語包含確認（verbatim）を既存 Design 契約が要求しており、事象は既存契約の適用不履行。 |

### 未分類・入力正規化

なし。41 件すべて13項目形式相当。E6 の空タグおよび欠損日付は推測補完せず、元 inbox は変更していない。

### 処分サマリ（STEP-3候補）

- promote: 4 単位 / 4 entries（E3、E9、E13、E40）
- deferred: 14 単位 / 20 entries
- duplicate: 17 entries（C1:2、C4:2、C6:2、C7:2、E4、E8、E10、E12、E16、E22、E29、E30、E41）
- rejected: 0
- promote entries の除外理由（Decision 候補）: 全件 command 仕様・手続き/実装是正であり、アーキテクチャ技術選択を含まない。

## STEP-4 adversarial-review

- 発動判定: 発動（inbox 41件。空でなく、単一かつ確実な重複でもない）。
- review 呼出: explore 2本と librarian 2本の独立 challenge stream を試みたが、3本は provider の usage limit 後に fallback model `openai/gpt-6.1-luna` が解決できず失敗し、残る1本は実行枠待ちから取消した。成果を返した stream はなく、これ以上 retry しない。silent skip はせず、利用不能として記録する。
- review 状態: 未完了。独立 Reviewer / Reviewee の challenge、相互反証、convergence audit は成立せず、レビュー結果を合意済みとして扱わない。provider 利用不能を報告し、caller failure fallback と既存 HITL 判定へ移行した。
- caller failure fallback: review 利用不能を報告し、従来フローへ進む。候補処分は評価器単独で確定せず、現行の正規契約・実測対策で帰着可能な範囲のみ自律確定する。新規の目的、範囲、受入条件、fail-closed 挙動は変更しない。
- review で特に検証が要る争点（review 未成立のため結果を得ていない領域）: C2 の E25 child-process timeout を含むクラス統合妥当性、C5 の fail-closed を保った残ゲート実行、E17 の JSON 逐語転記手順と既存 snapshot/VERIFY の境界。未確定事項は deferred とした。
- 戻しループ: finding 未反映のため未発動。
- STEP-5 自律確定: promote 4単位/4件、deferred 14単位/20件、duplicate 13単位/17件、reject 0。合計41件。
- 処分判定の HITL: 0件。promotion は req-define/backlog-review 向けの提案ステージに限り、REQ/Decision/Design・受入条件の変更、gate 緩和、破壊的削除は行わない。恒久手順で覆う重複は duplicate、根拠が不十分または安全境界の再評価が必要な件は deferred とする。人間に留保された目的・優先順位・範囲・外部契約の新規確定を要する項目は確認されなかった。別途の破壊的 prune 承認は未取得。
- unresolved: 独立 review は利用不能で完了を主張しない。caller failure fallback に従い、恒久契約から導出できる処置を自律確定し、根拠・対策範囲が不十分な項目は deferred とした。ユーザー留保の目的・範囲・受入条件・gate 規範を新たに確定していない。

## 実行証跡

- deferred 見出し索引: 227 entries。全41 inbox entries について tag 一致140件、title-token 追加候補41件の本文を読み、重複なしの候補計181件を比較。直近20 entries も確認し、候補0件の inbox entry はなかった。
- 既存対策の実測: `grep` と正規文書/knowledge の直接読取で評価表各行を再確認。C1/C4/C6/C7、E4/E8/E10/E12/E16/E22/E29/E30/E41 は恒久契約・knowledge の該当条項を確認して duplicate とした。E3 は deferred L2486 の先行観測と AUTOGEN 外の README 件数記述を実測して再発 gap と判断。E9 対象書込み手順、E13/E40 現行 source も再読。
- Jev final judgments: 承認済み `observation_write` により `20261015T101814Z-dcbe.json`（処分区分31件）と `20261015T102028Z-8467.json`（昇華可能性31件）へ最終判断を追記。evaluator 結果を保持し、差異には `semantic_disagreement` を分類して読み戻し確認した。
- 同期キュー操作: 2026-10-15T21:08:48+09:00 開始、21:08:49+09:00 完了。`git pull --ff-only` は `Already up to date.`（exit 0）、HEAD は `38bc58c7` のまま。専有同期スロットは解放済み。
- STEP-6 準備済み: promote 4件の成果物を `.agentdev/learning/promoted/` に生成。atomic move procedure に従って inbox 全41件を deferred に追記し、各項目へ移動日を付し、追記件数・見出し数・日付数を照合した後に inbox を header のみにクリアした。移動前 deferred 227実エントリ + 41件 = 268実エントリ（見出し272行、構造見出し4行）。空タグ1件の末尾空白だけを除去し、項目値は空のまま保持。
- prune 実績: 2026-10-15T21:16:33+09:00 のユーザー承認は「今回の21件のみ」。staged E3/E9/E13/E40 と duplicate C1(E28,E33)、C4(E21,E26)、C6(E7,E23)、C7(E5,E11)、E4/E8/E10/E12/E16/E22/E29/E30/E41 の計21件だけを `.agentdev/learning/deferred.md` から削除。4つの promoted 成果物は保持。read-back で移動済み41件中21件が不在、残るdeferred20件が移動日付きで存在し、HEAD 時点の旧deferred 227件の本文 prefix が byte-for-byte 保持されることを検証した。結果は old 227 + current deferred 20 = 247実エントリ（見出し251行、構造見出し4行）。inbox は header のみ。
- 次の git 永続化候補パス（prune 後の最終差分を再確認してから対象確定）: `.agentdev/learning/evaluation-report.md`, `.agentdev/learning/deferred.md`, `.agentdev/learning/inbox.md`, `.agentdev/learning/promoted/existing-measure-update-req-count-prose-sync.md`, `.agentdev/learning/promoted/existing-measure-update-extension-rules-before-issue-write.md`, `.agentdev/learning/promoted/existing-measure-update-overlap-warning-summary.md`, `.agentdev/learning/promoted/existing-measure-update-traceability-target-ids.md`, `.agentdev/jev-observations/20261015T095338Z-9c80.json`, `.agentdev/jev-observations/20261015T095425Z-9f0c.json`, `.agentdev/jev-observations/20261015T095512Z-f301.json`, `.agentdev/jev-observations/20261015T095608Z-6ced.json`, `.agentdev/jev-observations/20261015T095958Z-5d54.json`, `.agentdev/jev-observations/20261015T100237Z-a16d.json`, `.agentdev/jev-observations/20261015T100435Z-31e3.json`, `.agentdev/jev-observations/20261015T100604Z-1ea4.json`, `.agentdev/jev-observations/20261015T101003Z-b48b.json`, `.agentdev/jev-observations/20261015T101127Z-6ec0.json`, `.agentdev/jev-observations/20261015T101239Z-c481.json`, `.agentdev/jev-observations/20261015T101346Z-e910.json`, `.agentdev/jev-observations/20261015T101814Z-dcbe.json`, `.agentdev/jev-observations/20261015T102028Z-8467.json`。未処理の `.agentdev/learning/learning-promote-2026-10-15-resume.md`、他 run の untracked observations、および inspect/intake の変更は候補パスに含めない。
- commit message（親キューの後続 commit grant 後のみ）: `chore(agentdev): promote learning findings`
- 状態: WARN / pending user persistence approval（STEP-1〜5完了、STEP-6 の成果物生成・deferred move・承認済み21件 prune 完了。STEP-4 は caller failure fallback、独立 review 未完了の警告を保持。同期は成功済み。パスと差分の確認後、git add/commit/push の別途許可を待つ。これらは未実施）。
