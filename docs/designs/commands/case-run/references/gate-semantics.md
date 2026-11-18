---
title: case-run gate 意味論（前置 gate と最終 gate）と Epic Wave 実行モードの廃止
status: accepted
created: "2026-11-19"
updated: "2026-11-19"
---

<!-- 親: docs/designs/commands/case-run.md から参照される詳細仕様（遅延読み込み）。 -->

# case-run gate 意味論（前置 gate と最終 gate）と Epic Wave 実行モードの廃止

### case-run gate 意味論（前置 gate と最終 gate）

- 前置 gate 群（委譲の STEP-S3 相当、子Issue ごとの Epic Wave 委譲にも同一契約で適用）: worktree precondition gate、QG-3 前置 staleness check、docs/** 変更時の targeted docs guard、配布依存境界 事前 gate、AUTOGEN 索引再生成 前置 gate（S3-6）を適用する。AUTOGEN 索引再生成 前置 gate は、PR 対象ファイルに AUTOGEN 生成元文書（REQ、Decision、Design 実ファイル群）の変更を含む場合、AUTOGEN 索引の再生成を委譲に先行して強制する
- 配布依存境界の最終変更経路 gate（S5-1）: result が `completed-pr` の場合、クリーンアップに進む前に、実装後の実際の worktree HEAD に対して最終 gate を行う（実行担当サブエージェントが追加した変更も含めて検査する）。本 gate は src 側（原本）と `.opencode` 側（投影）の双方反映検証を要求する
- tmp 残存確認: 正常終了を前提として、当該実行で `.agentdev/tmp/` に作成した一時ファイルが残存していないことをクリーンアップ工程で確認する。workflow 側で生成した `.agentdev/tmp/` 一時ファイルは当該実行内で削除し、Custom Tool 由来の一時ファイルは Tool が操作ごとに自動削除する

#### 並列兄弟 branch 実差分交差確認（commit・push 前置）

同一 Wave 内で兄弟 Issue が並列実行中の子 Issue は、commit・push の前、委譲先の実行担当サブエージェントが commit・push する直前（commit 前 3 検査と同一位置）に、実差分交差確認を実施する。case-run の前置 gate 群（STEP-S3）は委譲開始前に実行されるため当該時点では自 branch の変更ファイルが存在せず、実施位置にはならない（前置 gate での実施を前提した記述にしない）。

対象は、並列実行中の兄弟 branch の変更ファイル集合（merge-base 起点の git diff --name-only で取得。パスは正規化して比較）と自 branch の変更ファイル集合の交差である。

交差検出時はエラーではなく競合リスク情報として警告を投入者（case-auto 配下では親判断解決）へ提示し、調整決定（マージ順序・所有正当）を調整記録として実行記録へ残し、case-close の Level 1 rebase 担当契約へ引き継ぐ。単独実行（兄弟 Issue なし）の場合は発動条件不成立としてスキップする。兄弟 branch の状態が取得不能な場合は検査省略とせず取得不能として報告する（検出不能は交差なしを意味しない）。

宣言ベースの Wave 重複前置検出（case-ready Design「v3 epic-wave-model Design からの吸収」節、REQ-061-019・REQ-035-012）とは補完関係にあり置換しない。交差未検出であっても宣言ベース前置検出の結果を無効化しない。

#### 配布物変更時の commit 前3検査工程

配布物（配布 command / skill / template / script）への実装反映を含む case では、commit 前に次の3検査を実行する（実行順を含めて以下のとおりとする）。
1. 配布依存境界検査（check_distribution_boundary.ts）
2. IR-055 検査（runtime-unresolved-reference）
3. traceability 検査（宣言整合）
突合は検出違反を全件新規扱いで行う（baseline による既知違反の区別・免除は撤廃済み、REQ-010-074/079）。
全件を修正し、再検証で違反 0 件を確認してから commit する（fix-and-reverify）。
違反の無断削除・隠蔽を行わない。

#### verify-only closure の検証実行と SSoT コメント記録工程

verify-only closure（PR も carrier commit も存在しない Issue 完了。検証のみで完了する
maintenance case を含む）では、変更が存在しないため commit 前3検査の発火条件
（配布物変更を含む case）が成立しない。この場合でも検証完了の恒久証跡を残すため、
次のとおり実行する。本工程は case 2769 で確立した運用の明文化であり、
「検証完了のために carrier commit を作成する」代替案は case 2769 で却下済みの作業仮定に基づき採用しない。

1. verify-only closure の判定: execution contract で検証のみと事前確定された case、
   または実行の結果変更不要が確定した case のいずれかを正規の判定点とする。
   判定根拠を Issue コメント（SSoT コメント）に残す
2. 3検査の実行: 配布依存境界検査（check_distribution_boundary.ts）、IR-055 検査
   （runtime-unresolved-reference）、traceability 検査（宣言整合）を通常 case と同一の手順・
   同一の水準（base 既知違反と新規違反の分離突合、新規違反 0 件確認）で実行する。
   checker コマンドの実行経路と stdout 退避形式は checker 実行契約
   （安定実行経路: モジュール import 経由、spawnSync による status/stdout 分離取得、
   fs.writeFileSync の UTF-8 明示書き出し）に従う
3. 必要な検証の実行: 正規契約（execution contract の test strategy 等）から導出した検証義務に基づく
   必要な検証を実行する。検証義務がリポジトリ全体の試験を要求する場合、または試験範囲を安全に
   限定できない場合は full integrity suite（bun test 全件）を実行し、
   「Ran N tests across M files」の N/M 件数突合と直前実績との件数急減なし確認を行う
   （case-close 最終検証の合格基準と同水準）。変更が存在しないことのみを理由に必要な検証を省略しない
4. SSoT コメントへの記録: 実行コマンド列（実行 cwd、実行形態を含み、そのまま再実行手順として
   機能する形式）と結果（3検査の new_delta 0・新規違反 0 件、実行した検証の pass/fail 件数）、
   および実行する検証と実行しない検証の範囲とその根拠を Issue コメントに記録する。
   verify-only closure では PR が存在しないため
   PR 本文を記録先に使わない
5. チャネル分離: SSoT コメントは検証証跡チャネルであり、capture（intake/learning 候補）
   チャネルではない。REQ-031-014 の capture 引き継ぎ経路（PR 本文限定）は変更しない。
   検証中に発見した本筋外の検出事項は既存の intake 起票経路で扱う

#### docs 変更を含む case での commit 前の検証エンジン全量実行工程

PR 対象ファイルに docs/** 変更を含む case では、commit 前に検証エンジン cli.ts を全量実行し、
検出違反を全件新規扱いで違反 0 件を確認する（fix-and-reverify。baseline 既知違反の区別は撤廃済み）。
これにより integrity 由来の違反（reference-path-existence 等）の検出を case-run に前段化し、
case-close 最終 gate（QG-4）での初検出・blocked を防ぐ。
違反の無断削除・隠蔽を行わない（「配布物変更時の commit 前3検査工程」と同一の扱い）。
targeted docs guard（PR 単位の targeted 検査）は維持する。

### Epic Wave 実行モードの廃止（Wave 実行制御の case-auto 移転）

Epic Wave 実行モード（case-run #epic）は実行契約から廃止された（REQ-031-015、DEC-041）。
Wave 構成の読み取り、現在 Wave 判定、fan-out/fan-in、子 Issue 並列起動の制御は case-auto の orchestration stage 3 が単一所有する。case-run は与えられた単一 Issue の実装を単一委譲で実行し、case-run 経由で case-auto の管理外の実行枠（独立実行枠）を生成できない。
同一 Wave 内の子 Issue 間の変更対象ファイル重複の実行時検出は case-auto の stage 3 実行制御が所有する（REQ-034-043）。case-run は委譲された単一 Issue の実行において、当該 Issue に関連する重複解消方針（変更対象分割・重複許容時の担当とマージ順序）を参照して実行し、変更対象集合が取得不能な場合は比較を省略せず検出不能として報告する責務を維持する（REQ-031-027）。

### クリーンアップフェーズ

- worktree クリーンアップ確認 + 完了報告
  - 未コミット変更あり: 報告してユーザーの指示に従う。自動的な破棄、コミットは行わない
  - 未コミット変更なし: 完了報告へ。runtime workspace のクリーンアップは harness の責務であり、case-run は関与しない（REQ-002-002）

