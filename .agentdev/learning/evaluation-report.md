# 評価レポート

## メタデータ
- **実行日時**: 2026-09-13
- **対象エントリ数**: 26件（inbox: 17件、deferred: 約120件をインデックススキャンし、近接9件を詳細照合・統合評価）
- **問題クラス数**: 3クラスタ + 未分類10件
- **実行範囲**: STEP-1〜STEP-3 完了（本レポートに評価・判定結果を反映）。STEP-4 以降は本レポートを対象に判定する。
- **特記事項**: ユーザー指定により deferred プールの再評価を実施（近接統合9件、前回最優先再評価候補1件、3ヶ月超過 prune スクリーニング）。

## STEP-1 正規化・既存対策照合

inbox 17件は全件13フィールド新フォーマットで読み込み（正規化は解析時のみ、元ファイル不変）。deferred.md は約120件をインデックススキャンし、突合キー（bun test / worktree・junction / baseline・IR-055 / distribution-boundary / traceability・宣言 / lint・docs-check）で近接9件を特定して詳細照合した。

既存対策照合の主要結果:

- `docs/knowledge/windows-bun-test-spawn-timeout-classification.md`（2026-09-11）: inbox #14 と同問題クラス（timeout 系由来分類）。既存は timeout 延長単独再実行、inbox #14 は main HEAD 対照実行と手法が補完的 → 統合候補
- `docs/knowledge/checker-cli-stdout-loss-on-windows-bun.md`: inbox #8 と現象は近い（stdout 消失）が対象が違う（checker CLI プロセス vs bun test runner 出力）→ 隣接知見、新規文書で関連付け
- `src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md`「bun test 実行の環境前提」: node_modules 未伝播・依存整備手順（junction 代替含む）を既に規定 → クラスタC2 は partial カバー。SoT パス起点の skill 実行規約と「src/ のみ編集で配布整合成立」の明文化は未整備（fix gap）
- `docs/knowledge/README.md`: 知識文書一覧が陳腐化（3件表記 vs 実在6件。bun-offline-bundle と windows-bun-test-spawn-timeout が未収録）→ 既存対策の更新候補として記録（本 workflow 処分対象外、別工程で是正）

promoted/ は空（前回実行分は backlog-review で処理済み）。

## 問題クラス一覧

スコア順は「発生件数/影響度/横展開性/反映先明確度/自動化適性/プロジェクト固有知識再利用性/再発可能性/費用対効果」。各1〜5、合計40点。

| クラス | 対象 | 根本原因・再発条件・予防策 | スコア | 暫定処分 |
|---|---|---|---:|---|
| C3 | #12,#13 | baseline 不在環境で gate/checker が既存違反を新規違反と区別できず failure 化。対照実行（main HEAD vs 変更 HEAD の同一環境再実行）で delta 0 を実証して合格判定 | 33 | promote（knowledge） |
| #15 | #15+deferred2 | 配布物本文 prose への REQ/DEC 具体 ID 記載は検出器違反となる。ADF-COVERS 宣言コメントの正規位置でのみ可 | 32 | promote（knowledge、deferred 同種2件統合） |
| C2 | #2,#5+deferred4 | worktree には git 管理外実体（junction 投影・node_modules）が不在。SoT パス起点実行・投影不在前提の依存整備・src/ のみ編集で配布整合 | 31 | promote（knowledge。worktree-operations.md partial カバー） |
| C1 | #3,#9,#11+deferred2 | bun test は cwd 依存で REPO_ROOT 解決系が誤動作し、dot 配下は ./ prefix 付きでのみマッチ。repo root 起 cwd + ./.opencode/... 形式に統一 | 29 | promote（knowledge） |
| #14 | #14+deferred1 | タイムアウト系 fail が環境負荷に依存して非確定的に fail。main HEAD（変更未適用）再実行の対照実行で環境起因と切り分け | 28 | promote（knowledge・既存 timeout 文書統合候補） |
| #17 | #17 | bash ツール永続シェルが worktree 内 workdir を保持し、remove 後も空ディレクトリが残留。git 管理状態のみで完了判定 | 28 | promote（knowledge・git-worktree skill 更新候補） |
| #4 | #4 | verify-only case の検証完了根拠が会話上で消失。3検査+integrity suite を SSoT コメントへ実行コマンド列付き記録する運用標準化 | 25 | promote（REQ 候補） |
| #1 | #1 | baseline-known 違反の置換語が検出器パターンに該当し新規違反。置換語彙と検出器パターン突合・置換後再検査 | 25 | HITL（promote vs deferred 境界） |
| #8 | #8 | bun test の fail 行が CR/ANSI 上書きで log に残らない。junit reporter で構造取得 | 25 | HITL（promote vs deferred 境界・既存 stdout 文書と関連） |
| #6 | #6 | fixture リテラル内の宣言マーカーが旧パーサで偽宣言として計上されカバレッジ汚染。正規位置コメント形式で書く | 24 | HITL（promote vs deferred 境界） |
| #10 | #10 | IR-062 fixture テストの checker 複製 spawn 方式（方式確立知見） | 24 | HITL（promote vs deferred 境界） |
| #16 | #16 | README・guides 構成変更では README 機械検査を初期段階で実行 | 22 | deferred 維持（単発、影響小） |
| #7 | #7 | Bun.build 焼き付きパスは多段エスケープ形で regex に4連必要 | 19 | deferred 維持（単発、影響小） |

### 軸別スコア根拠

| クラス | 発生 | 影響 | 横展開 | 明確度 | 自動化 | 固有知識 | 再発 | 費用対効果 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| C3 | 4 | 3 | 4 | 4 | 3 | 5 | 5 | 5 |
| #15 | 4 | 2 | 5 | 5 | 4 | 5 | 3 | 4 |
| C2 | 6 | 3 | 3 | 4 | 2 | 4 | 5 | 4 |
| C1 | 5 | 2 | 3 | 4 | 2 | 4 | 5 | 4 |
| #14 | 3 | 2 | 4 | 4 | 2 | 5 | 4 | 4 |
| #17 | 1 | 2 | 5 | 4 | 3 | 5 | 4 | 4 |
| #4 | 2 | 3 | 3 | 4 | 2 | 3 | 4 | 4 |
| #1 | 2 | 2 | 4 | 3 | 3 | 4 | 3 | 4 |
| #8 | 1 | 2 | 4 | 3 | 4 | 4 | 3 | 4 |
| #6 | 1 | 3 | 4 | 3 | 3 | 4 | 2 | 3 |
| #10 | 1 | 2 | 4 | 3 | 3 | 5 | 2 | 4 |
| #16 | 1 | 2 | 4 | 3 | 2 | 4 | 3 | 3 |
| #7 | 1 | 2 | 3 | 3 | 2 | 3 | 2 | 3 |

### クラスタ詳細

**C3: baseline 未整備環境での gate 誤 failure と対照実行による合格判定**
- 根本原因: baseline ファイル不在環境では gate/checker が既存違反を新規違反と区別できず failure 化する
- 再発条件: baseline 未整備環境（worktree、新環境）での gate/checker 実行
- 予防策: 対照実行（main HEAD vs 変更 HEAD の同一環境再実行）で delta 0 を実証する合格判定の標準化
- エントリ: 2026-09-12 self-sync.ps1 apply 走査対象切替×NG baseline 未整備（対照実行で由来分類）[inbox] ／ 2026-09-12 配布依存境界 gate を対照実行で delta 0 実証し合格判定 [inbox]
- 既存対策: detached worktree による baseline 比較は worktree-operations.md に規定済みだが、gate 合格判定への適用（delta 0 判定）は未文書化（fix gap）

**C2: worktree/junction 投影・依存不在前提の操作**
- 根本原因: worktree には git 管理外の実体（.opencode/skills junction 投影、node_modules）が存在せず、実体前提の操作が fail する
- 再発条件: worktree 内での skill スクリプト実行、配布整合検証、依存解決
- 予防策: SoT パス（src/opencode/skills）起点実行、投影不在前提の依存整備（bun install／メイン側 node_modules junction）、src/ のみ編集で配布整合成立の明文化
- エントリ: 2026-09-11 worktree 内 .opencode/skills/ junction 未伝播で SoT 起点実行 [inbox] ／ 2026-09-11 自己ホスト投影は junction で src/ のみ編集 [inbox] ／ 2026-09-01 worktree では node_modules も伝播しない [deferred、統合] ／ 2026-09-01 依存復元は bun install 単独では不完 [deferred、統合] ／ 2026-09-09 node_modules 非伝播で integrity suite が環境起因 fail [deferred、統合] ／ 2026-09-10 .opencode/plugins は gitignore 未伝播で source fallback [deferred、統合]
- 既存対策: worktree-operations.md「bun test 実行の環境前提」が node_modules 未伝播・依存整備手順を規定済み（partial カバー）。SoT 起点実行規約・配布整合の明文化が未整備（fix gap）

**C1: bun test 実行形態の非統一（cwd 起点・パス指定形式）**
- 根本原因: bun test は REPO_ROOT 解決系テストが cwd 依存で誤動作し、dot 配下のテストは ./ prefix 付き相対パスでのみマッチする仕様があり、実行起点・指定形式の規約が未文書化
- 再発条件: scripts 配下 cwd での実行、./ なしパス指定、worktree での integrity suite 実行
- 予防策: repo root 起 cwd + ./.opencode/... 形式への統一規約の文書化
- エントリ: 2026-09-11 integrity scripts の CWD 起点実行で環境依存 fail [inbox] ／ 2026-09-12 worktree 内 bun test は repo root 起 cwd [inbox] ／ 2026-09-12 ファイル単体指定は ./.opencode/... 形式 [inbox] ／ 2026-09-05 integrity suite の cwd 依存と dot ディレクトリ既定探索 [deferred、統合] ／ 2026-09-04 位置引数フィルタは ./ prefix 付きでのみマッチ [deferred、統合]
- 既存対策: QG-4 フル suite 正規形が agentdev-quality-gates に存在。単独実行の cwd・パス指定規約の知識文書化が未整備（load miss）

**#15: 配布物への concrete ID 記載位置制約**
- 根本原因: 配布物本文は検出器の concrete-id 検査対象であり、本文 prose への REQ/DEC 具体 ID 記載が違反となる設計制約がある
- 再発条件: 配布 skill reference・SKILL.md 本文への ID 記載
- 予防策: ADF-COVERS 宣言コメントの正規位置でのみ具体 ID を記載。本文は概念名参照へ置換
- エントリ: 2026-09-13 配布 skill reference への REQ/DEC 具体 ID は ADF-COVERS 宣言コメント位置に限る [inbox] ／ 2026-07-22 DERIVE 宣言に内部 ID を含めると IR-055 strict violation [deferred、統合] ／ 2026-08-15 STEP 表の具体番号は STEP/QG ID ファミリーに限定 [deferred、統合]
- 既存対策: 検出器（concrete-id 検査）実装済み。規約知識の統合文書化が未整備（load miss）

**#14: 対照実行による環境起因切り分け**
- 根本原因: タイムアウト系 fail が環境負荷に依存して非確定的に発生する
- 再発条件: 高負荷環境での spawnSync 系テスト実行
- 予防策: main HEAD（変更未適用・working tree clean）での再実行（対照実行）で環境起因と切り分け
- エントリ: 2026-09-12 spawnSync 系回帰テスト 5 秒タイムアウトを main HEAD 再実行で環境起因と判定 [inbox] ／ 2026-09-05 フル suite 環境依存 staging テストは基底 commit 再現比較で pre-existing 分離 [deferred、統合]
- 既存対策: windows-bun-test-spawn-timeout-classification.md（timeout 延長単独再実行）が隣接。対照実行手法は未文書化（application miss）

## deferred プール再評価（ユーザー指定）

### 近接統合（promote 判定済み成果物への統合 → prune 対象、9件）

| deferred エントリ | 日付 | 統合先 |
|---|---|---|
| integrity suite の cwd 依存と bun test の dot ディレクトリ既定探索による実行手順分断 | 2026-09-05 | C1 |
| bun test の位置引数フィルタは Windows worktree の dotfile 配下ディレクトリで ./ prefix 付き正規形でのみマッチ | 2026-09-04 | C1 |
| worktree では node_modules も伝播しないため依存パッケージのテストは事前に bun install する | 2026-09-01 | C2 |
| worktree の依存復元は bun install（worktree root）単独では不完で分散 node_modules の個別 install が必要 | 2026-09-01 | C2 |
| worktree への node_modules 非伝播で integrity suite が環境起因 fail する | 2026-09-09 | C2 |
| worktree の .opencode/plugins は gitignore 未伝播で欠落するため plugins 分割は source fallback を使う | 2026-09-10 | C2 |
| 配布物 SKILL.md の DERIVE 宣言に内部 ID を含めると IR-055 strict violation となる設計制約 | 2026-07-22 | #15 |
| 配布物へ STEP 表を書く際、具体番号を書ける ID ファミリーは STEP / QG に限定される | 2026-08-15 | #15 |
| フル suite 実行時のみ fail する環境依存 staging テストは基底 commit 再現比較で pre-existing 分離 | 2026-09-05 | #14 |

前回実行（2026-09-11）で worktree 未伝播系は defer/duplicate 判定だったが、その後の観測（case 2787 等）で発生件数が増加し、統合 promote の根拠が成立した。

### 再評価結果（維持）

| deferred エントリ | 日付 | 判定 | 理由 |
|---|---|---|---|
| Phase 0（req-save/spec-save）起因の AUTOGEN 陳腐化は case-close の dry-run ゲートで差戻しになる | 2026-08-18 | deferred 維持 | 前回「次回最優先再評価候補」の正式再評価。既存 dry-run ゲートが安全網として機能中。検出タイミング後段の改善余地はあるが REQ 化の緊急性なし（影響小・単発） |
| check_distribution_boundary.ts は --base-ref を持たず、未定義 flag 付き呼び出しは positional repoRoot 誤解釈の fail-closed になる | 2026-09-05 | deferred 維持 | gate API 仕様知見。C3（対照実行）とは別問題クラス |
| 配布依存境界 checker の unclassified-entry 分類は本文中の実在 IR 参照を新規違反と区別しない | 2026-09-01 | deferred 維持 | checker 分類挙動の知見。C3 と隣接だが別問題クラス |

### 全体スクリーニング

prune MAY 条件（3ヶ月超過+再発なし+影響度低+再発条件曖昧+横展開性低+費用対効果低）で 2026-06〜07 のエントリ約40件をスクリーニング。技術知識・判断基準・プロジェクト固有知識を含むものが大半で、prune 条件を全て満たすエントリは確認されなかった → 本実行での prune 実施なし（削除禁止原則を優先）。

## promote 時prune結果

- **対象エントリ数**: 26件（inbox 17 + deferred 統合9）
- **prune実施**: promote 判定済み成果物への統合 deferred 9件（C1: 2件、C2: 4件、#15: 2件、#14: 1件）。staged として成果物「元learning item/根拠」セクションへ証拠保存のうえ除去
- **prune候補**: なし（prune MAY 条件完備エントリなし）
- **prune却下**: なし

## 全体傾向

- bun test / worktree 系の検証環境ノウハウに集中（inbox 17件中9件）。実行形態（cwd・パス指定）、投影・依存不在、証跡取得の3系統に分かれる
- case 2766〜2791（2026-09-11〜09-13）の集中観測。worktree 検証・case-close 検証が発生源の中心
- 検証実行の正規形と証跡の SSoT 記録への標準化ニーズが高い
- docs/knowledge/README.md の知識文書一覧が陳腐化（3件表記 vs 実在6件）→ 既存対策の更新候補（本 workflow 処分対象外、別工程で是正）

## Decision候補除外記録

- **対象 item**: 全判定単位（3クラスタ+10単独、計13単位）
- **除外理由**: 技術判断（代替案選択・トレードオフ決定・アーキテクチャ選択）を含まない運用手順・検証ノウハウ・環境依存知見である（agentdev-decision-guidelines 除外基準「技術判断不在」を適用）
- **根拠事実**: 各クラスタの予防策は既存規約・手順の標準化（bun test 正規形、SoT 起点実行、対照実行判定）であり、新規の設計判断を伴わない
- **代替反映先候補**: docs/knowledge 知識文書（カテゴリ4）、workflow skill・references 更新（カテゴリ5）、case-close 運用標準化（カテゴリ1 REQ 候補）

## adversarial-review 記録

STEP-4 で adversarial-review を発動した（default-on、skip 条件非該当: inbox 17件）。Reviewer 2 stream（独立論理 stream: stream A=昇格・統合判断の反証、stream B=処分基準・schema 整合の反証）を並行起動したが、実行セッションの終了に伴い両 stream が消失した（確認時 Task not found）。対論型レビューは実施不能となったため、adversarial-review caller integration 共通契約の呼出失敗時取扱い（silent skip 禁止・利用不能の報告・従来フローと既存 QG/HITL の維持）に従い、adversarial-review なしの従来フロー（HITL 中心の判定確定）で STEP-5 以降を継続する。

従来フローでは HITL を品質保証の主たる安全境界とし、自律確定範囲を縮小する（対論型レビューによる裏付けが得られない境界判断は HITL へ移送: #4 の処分カテゴリ選択、#17 の発生1回での promote 判断を自律確定から HITL へ変更）。

## 自律確定証跡

STEP-5 判定確定（2026-09-13）。adversarial-review 呼出失敗後の従来フロー（HITL 中心）で確定した。ユーザー指示により HITL 対象は「#4 の処分カテゴリ選択」「#17 の promote 判断」「prune 承認」の3点に特定された。#1/#6/#8/#10 は当該指示により HITL 対象から除外し、評価時の推奨判定（#1: promote、#6: deferred、#8: promote、#10: deferred）で確定した（解釈違いの場合は判定結果提示にて訂正可能）。

### promote（自律確定、7件）

| 単位 | 処分カテゴリ | 主要根拠 | HITL 不要理由 |
|---|---|---|---|
| C1 bun test 実行形態の統一（cwd・パス指定） | 4（knowledge） | 発生5件相当（inbox 3+deferred 2）。REPO_ROOT 誤動作と ./ prefix 非マッチが case 2766/2768/2777/2779 で反復。QG-4 正規形と整合する実行規約として自足的 | 繰り返し発生・既存対策照合済み（QG-4 正規形との差分確認）・処分先が一意。選択肢間に本質的競合なし |
| C2 worktree/junction 投影・依存不在 | 4（knowledge） | 発生6件相当（inbox 2+deferred 4）。worktree-operations.md「bun test 実行の環境前提」と突合済みで fix gap（SoT 起点実行規約・配布整合の明文化）を特定 | 同上（既存記載との重複は partial カバーと判別済み、新規性明確） |
| C3 baseline 未整備環境での対照実行 delta 0 判定 | 4（knowledge） | 発生4件相当。gate 誤 failure が case 2787 で2系統同時観測（self-sync 走査対象切替・配布依存境界 gate）。対照実行手順が自足的 | 同上（detached worktree baseline 比較の既存規定と未文書化部分を判別済み） |
| #14 対照実行による環境起因切り分け | 4（knowledge） | 発生3件相当（inbox 1+deferred 1+近接）。既存 windows-bun-test-spawn-timeout 文書（timeout 延長単独再実行）と手法が補完的で未カバー | 同上（既存文書との判別済み） |
| #15 配布物 concrete ID 記載位置制約 | 4（knowledge） | 発生4件相当（inbox 1+deferred 2+関連）。concrete-id 検出器実装済みで規約知識が自足的。deferred 同種2件との統合で網羅性向上 | 同上 |
| #1 置換語彙×検出器パターン突合 | 4（knowledge） | 一般化置換は頻出操作（再発可能性3）。突合・置換後再検査の手順が自足的。影響度2で軽微だが予防コスト低 | ユーザー指示により HITL 対象外。推奨判定（promote）で確定 |
| #8 junit reporter による fail 構造取得 | 4（knowledge） | CI/非TTY環境で再発可能性3。即適用可能なコマンド知見。既存 checker stdout 消失知識とは対象が違うことを突合済み | 同上 |

### deferred 維持（自律確定、7件）

| 単位 | 主要根拠 | HITL 不要理由 |
|---|---|---|
| #7 Bun.build 多段エスケープ regex | スコア19、単発、影響小 | 判定基準（出現回数少・影響小）の典型例で一意 |
| #16 README 機械検査の初期段階実行 | スコア22、単発、影響小 | 同上 |
| #6 fixture 宣言マーカー偽計上 | スコア24。パーサ修正済みで再発可能性2。作成規約価値はあるが発生1回 | ユーザー指示により HITL 対象外。推奨判定（deferred 維持）で確定 |
| #10 IR-062 checker 複製 spawn 方式 | スコア24。方式確立済み（問題でなく知見）で再利用場面の頻度が不確定 | 同上 |
| Phase 0 AUTOGEN 陳腐化（deferred 再評価） | 前回最優先再評価候補の正式再評価。既存 dry-run ゲートが安全網として機能中、影響小・単発 | 安全網の実在確認済みで一意 |
| --base-ref 不在（deferred 再評価） | gate API 仕様知見。C3（対照実行）とは別問題クラス | 判定基準適用（問題クラス非同一）で一意 |
| unclassified-entry 分類（deferred 再評価） | checker 分類挙動の知見。C3 と隣接だが別問題クラス | 同上 |

### HITL として残る項目（ユーザー承認待ち、3点）

1. **#4 verify-only 実行証跡 SSoT 記録の処分カテゴリ**: (a) promote REQ 候補（case-close 運用の恒久契約化）／(b) promote knowledge（参照知識文書化）／(c) deferred 維持 — 推奨 (a)。選択肢間に本質的差（恒久契約 vs 知識参照）が残るため HITL 移送（判定表: 複数の妥当な選択肢が残る）
2. **#17 bash 永続シェル cwd 保持の promote 判断**: (a) promote knowledge（反映先候補: 知識文書＋git-worktree skill 削除手順更新）／(b) deferred 維持 — 推奨 (a)。発生1回だが横展開性5・再発可能性4。「出現回数少→deferred」原則の例外判断のため HITL 移送
3. **prune 承認（破壊的変更の明示承認）**: deferred 統合9件の除去（C1: 2件、C2: 4件、#15: 2件、#14: 1件。証拠は各成果物「元learning item/根拠」セクションへ保存）＋ promote 確定分 inbox エントリの staged prune（対象は #4/#17 の判定結果に連動）

### STEP-6 永続化実行記録（2026-09-13）

ユーザー承認: HITL 6件すべて推奨どおり（#4=(a) promote REQ候補、#17=(a) promote knowledge、#1=(a) promote knowledge、#6=(b) deferred維持、#8=(a) promote knowledge、#10=(b) deferred維持）。prune（deferred 統合9件 + promote 判定分 inbox 13件）も承認。

- **promoted 成果物生成: 9件**
  - 1-verify-only-execution-evidence-ssot.md（#4、カテゴリ1 REQ候補）
  - project-knowledge-bun-test-execution-conventions.md（C1）
  - project-knowledge-worktree-junction-projection.md（C2）
  - project-knowledge-baseline-comparison-delta-zero.md（C3）
  - project-knowledge-environment-fail-main-head-rerun.md（#14）
  - project-knowledge-distribution-concrete-id-placement.md（#15）
  - project-knowledge-vocabulary-detector-crosscheck.md（#1）
  - project-knowledge-bun-test-junit-reporter.md（#8）
  - project-knowledge-persistent-shell-cwd-worktree-residue.md（#17）
- **deferred 移動**: inbox 17件に移動日 2026-09-13 を付与して追記（H2 118→135、+17 検証）
- **inbox クリア**: ヘッダーのみ（H2 = 0 検証）
- **prune**: 22件除去（inbox 由来 staged 13件 + 既存 deferred 統合9件。H2 135→113 検証、維持4件（#6/#7/#10/#16）の残存確認済み）
- **最終 deferred 構成**: 既存維持分（Phase 0 AUTOGEN、--base-ref 不在、unclassified-entry 分類等）+ 今回移動の4件（#6/#7/#10/#16）
