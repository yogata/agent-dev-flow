---
name: agentdev-workflow-case-auto
description: "case-auto command の workflow 実装本体。case-open → case-ready → case-run → case-close（例外経路: case-revise → case-ready 経由）の自走 orchestration、orchestration stage モデル、クリーンアップ検証ゲート、stage 3 スロット型キュー制御、HITL question スキップ可能キュー、bounded parent decision resolution、コンフリクト解消 Level 2/3、停止理由分類、adversarial-review 由来の停止伝播、Root Case 再開入口（req-define）停止、v5 有限実行モード契約（責務分割・小規模連続実行・設計確定独立終了・移行期区別）、結果集約を所有する。USE FOR: case-auto 実行時の workflow 制御（入力解決・工程分岐・orchestration・停止検出・停止理由分類）。DO NOT USE FOR: 単独起動（対応する /agentdev/* コマンド経由で利用すること）。"
---

# case-auto workflow スキル

Issue 番号・URL、要件doc・明示パス、セッション指定を解決し、case-open → case-ready → case-run → case-close を駆動する。再合意済み Definition の反映では case-open の代わりに case-revise を起動する。Root Case・成果物・PR・統合結果を報告する。各工程の正規契約は下位スキルが所有する。

| STEP | 判定・実行 | 詳細 |
|---|---|---|
| STEP-1〜3 | 入力と `case_auto_started_at` を確定し、再開または継続工程を選択。auto_gate preflight 後に stage を順次実行 | [入力解決と orchestration](references/input-resolution-and-orchestration.md) |
| STEP-4〜6 | 停止理由を分類。adversarial-review の `user-decision-required` と `decision_context` は bounded parent decision resolution を先に適用 | [停止と判断解決](references/stop-and-decision-resolution.md) |
| STEP-7 | case-close の Level 1 失敗時はインライン case-run を最大2回試し、Level 3 失敗は停止 | [競合解消と報告](references/conflict-resolution-and-reporting.md) |
| STEP-8 | 停止または全 OU 完了時に結果4次元・L1 と case-run の L2 を集約。当該実行の `.agentdev/tmp/` 残存を確認 | [競合解消と報告](references/conflict-resolution-and-reporting.md) |

既存合意で解決できる判断は自律処理し、上位合意との矛盾や人間に留保された新規判断は `blocked` として Root Case 指定の req-define 再開入口を報告する。委譲起動不能は `delegation-unavailable` とし、委譲工程をインラインへ切り替えない。停止・再開は会話記憶に頼らず Issue・PR・Epic 実行構成・成果物・実行状態から未収束の最初の stage を復元する。独立した stage cursor は保存しない。起動時対象 ID は再開に必要な間だけ保持し、draft / RU の削除で対象を失わない。case-ready 成功後は Issue と Epic で再開する。

## orchestration stage モデル（case-auto 実行契約）

| stage | 工程 |
|---|---|
| stage 1 | case-open または case-revise を委譲 |
| stage 2 | case-ready を委譲。成功対象の draft・RU・設計 worktree・ブランチとリポジトリ全体の未追跡残存を検査してから stage 3 へ |
| stage 3 | case-run をインラインで実行し、実装委譲は Epic・Wave・Standard 共通の active Issue task 枠（上限5）で起動 |
| stage 4 | case-close を委譲。stage 3 内で Wave の終了処理を完遂した Epic には追加実行しない |

stage 内は独立対象を並列処理し、競合する共有書込みと OU の必須依存だけを局所直列化する。fan-in では全対象の完了または後続不能確定まで次 stage を開始せず、未実行・実行中・不明・再試行未確定を収束済みとしない。後続不能対象だけを後続から除外する。並列起動時は委譲起動ごとに10秒の起動間隔を置き、同一Tool一括ブロックでの複数起動発行は行わない。起動間隔の待機は起動だけの専用往復ターンとして発生させず、前後の他処理（result 受領と状態管理、空き枠補充候補の収集、次対象の準備等）と同一ターン内に組み合わせて消化するか、実行側の最小待機手段へ統合する（手順の正は `agentdev-case-run-execution-adapter` 配下 harness 委譲実装ノート「起動方式（委譲）」節）。起動間隔は stage 1（case-open / case-revise 委譲）・stage 2（case-ready 委譲）・stage 4（case-close 委譲）の並列委譲起動にも同一に適用する。stage 2・3・4 の並列起動を同期逐次実行で代用しない。起動可能対象に対して1件も起動できなければ直列化で完了を装わず停止し、原因を断定せず再開可能性を示す。

**依存充足ゲートとスロット型キュー**: 空き枠補充として、統合を含む依存を満たす Issue を Wave 横断で補充する。blocked、failed、delegation-unavailable は依存充足とはみなさない。最初に起動した全 task の完了を待つ固定 batch 方式を取らず、runtime 上の batch や一時直列化を Wave 分割として永続化しない。再開時は既存の active task を計上し、同一 Issue の二重起動と上限超過を防ぐ。状態不明の task は終了確認まで実行枠を解放せず、完了済み Issue を未完了に戻さない。統合は枠を消費しない。投入・重複検出・HITL キュー・cleanup は [STEP-3](references/input-resolution-and-orchestration.md) を読む。留保判断・安全承認はキューで飛ばさない。

**段階派遣の single-flight 保護**: 同じ Epic / Wave の進行中派遣があれば新規起動を止め、既存派遣の再利用へ切り替える。子 Issue の冪等前置は既存オープン Issue の検索。二重派遣の是正に先行結果の自動破棄を行わない。新規の lock / queue / scheduler は導入しない。

前工程の case-close と重ねられる後続 Issue の独立範囲を検出したら、[先行作業の投入・取り込み](references/preparation.md) を実行する。正式 case-run は既存の依存充足ゲートで判定する。

### 工程・投入境界のハンドオフ（正規原本は case-auto Design「工程・投入境界のハンドオフ」節）

- 複数 Issue の工程境界（stage 1 収束後、stage 2 収束後〔クリーンアップ検証ゲート通過後〕）または投入バッチ境界では、起動時対象の安定識別子、Root Case、関連 Issue/PR 番号、適用可能な `.agentdev/` 状態ファイルと git 側の参照、再開入口を引き渡す。工程の子結果には「親セッション向け委譲結果サマリ」を用いる
- 新規セッションは当該正規状態から最早の未収束 stage を再構成し、完了済み対象を再実行せず、稼働中のタスクを二重起動しない。case-ready 後の再開は削除された draft/RU に依存しない（Issue と Epic だけで再開成立）
- 実行を所有する監督から子 task の通知欠落・中断の照合を求められた場合も、同じ Root でこの再開入口を使う。子の稼働と前回操作の反映を読み戻し、未完了の処理だけを続ける。工程別の照合は [子 task 中断回復](../agentdev-workflow-orchestration/references/case-auto-recovery.md) に従う。
- 実行中や未確認を収束と扱わず、ハンドオフを完了報告に置換しない。ハンドオフは終了済みの証拠でも、新しい工程状態の正本でもない

## v5 有限実行モード（開発中経路・移行期）

明示指定時のみ [有限実行の詳細](references/finite-execution.md) を適用する。実現確定までは Root Case 必須の v4 標準モードが既定の正規経路であり、開発中モードによって標準遷移や停止条件を置き換えない。

### モード契約

- **v5 小規模連続実行モード**: 不要な工程・独立文書・Issue を強制せず、採用された必要な要求・制約・検証義務を維持する。連続実行した事実だけでは未成立の検証を完了扱いとせず、各段階の検証証拠に基づいて完了を判定する。
- **単独工程の独立完了**: 要件確定のみ・設計確定のみ・確定済み設計からの実装・検証のみは採用規約の解決の公開操作契約で得た基準を実行基準とし、対象作業に必要な成果物と検証の成立を確認して独立完了する。後続実装・Issue・PR の一律要求と要件定義への無条件復帰を実行経路に組み込まない。設計確定のみの作業に後続実装を要求しない。未採用の参照工程を単独工程の完了判定基準へ含めない。
- **再開**: 採用した工程構成に基づく実行（単独工程・連続実行）の双方に適用し、採用済み事項・未決事項・試作・成立済み作業を含む状態から再開しても4区分の区別を維持する。成立済み作業を不当に重複実行せず、未成立のみ継続する。
- **変更駆動能力群の維持と横断検証義務**: 自然言語の要求・不具合報告・エラーログからの直接入力、RU からの要件化、Intake・Learning・Backlog から要件化・実行への接続、小規模作業・依存作業・Epic/Wave、既存合意に基づく正規改訂、実変更・検証証拠・安全境界の確認、中断・失敗・再開、重要変更の識別・事前通知・追加通知・結果説明を維持する。意味を引き継ぐ経路が成立する前に既存能力を失効させない。横断検証は必要な代表事例の割当で行い、対象となる能力・操作・環境が未検証のまま全体を合格としない。すべての組合せを機械的に重複実行する必要はなく、実成果物と証拠を確認する。

## 重要変更の通知と結果説明

子工程からの通知を失わずに利用者へ提示する。利用者が理解する変更単位へ通知を集約し、重複通知を繰り返さない。新たな影響は重複通知と区別して追加説明する。case-auto は全変更の意味判断を行わず、判断の局所所有を維持する。未反映は正規反映前に提示し、反映済みとは区別する。実際に変更した重要事項、事前の見込みと実績の違い、残る影響、未完了事項を含める。一部成功・一部失敗・未確認・中断を実際の成立状況に応じて区別して報告する。通知と承認を区別し、通知だけで一律停止を設けない。判断手順、HITL、停止条件を通知で代替しない。

## 共通制約

編集は対象 worktree に限る。repo 内の変更のみ自走し、migration 実行・deploy/apply・クラウドや外部SaaS の変更・課金・権限・認証情報・外部データ・通知送信は対象外。remote branch 削除は当該実行で作成したものに限る。Wave 反復で Epic 本文は直接変更しない。取りまとめ反映のみ case-close と同じ per-Epic 排他制御・局所直列化の下で `agentdev-epic-tracker` を使う。Issue 構造は case-ready の確定結果を使い、親は委譲結果のみを保持する。委譲工程の結果の返却本文は、ステータス（報告用 `completed` / `blocked` / `failed`）、副作用有無を含む判定要約、変更ファイルパス一覧、コミット SHA、Issue/PR 番号、テスト結果の pass/fail 件数、未達事項/ブロッカー、詳細成果物パスの八項目からなる構造化サマリを上限目安 3〜4 KB 以内（UTF-8）で受領し、長大な詳細は退避先（PR 本文・Issue コメント等）のパス/URL 参照で到達する。必要なゲート判定は退避先の原文・証拠を参照して行う。

**直接実行の基準**: 単一ファイルの小規模確認または一〜二回のコマンドで完結する調査・検査は、新規サブエージェントを起動せず case-auto 自身が直接実行する。既存契約で必須の委譲・独立検証（工程委譲、実装実行委譲、品質ゲート等）にはこの基準を適用せず、必須委譲を省略しない（契約の正は委譲契約 Design「親セッション向け委譲結果サマリ」節）

**環境制約時の直接書込みフォールバック**: 実行担当が恒常的に書込み不能な場合、親オーケストレータ（本 workflow）が当該書込みを直接実行するフォールバックを標準動作として許容する。発動条件は環境制約に限定し、一時障害は既存の再試行・回復経路で扱う。発動時は委譲記録に発動理由（環境制約の内容）と親実施の事実を記録する。Custom Tool 境界と git 操作ガードレールを置き換えるものではなく、書込み経路の追加選択肢として機能する。詳細は case-auto Design「環境制約時の親オーケストレータ直接書込みフォールバック」節を参照する。
