# 検証ゲート、ready 遷移、クリーンアップ、冪等再実行（STEP-6 / STEP-7）

トレーサビリティ完全性ゲート、Root Case の ready 遷移、draft / RU 削除、main 同期確認、冪等再実行の実行時詳細である。

## STEP-6: 検証ゲートと ready 遷移

### トレーサビリティ完全性ゲート

- 実行対象 REQ の全対象要件行について、Design 対応が 1 件以上存在し、トレーサビリティポリシーが有効であることを確認する
- 確認は `agentdev-traceability` の check（Design 対応・トレーサビリティポリシー有効性のゲート判定）を用いる。実行失敗、空結果の場合は正規成果物（対応宣言コーパス）の直接読取で代替する（fail-open）。代替読取でも Design 対応 0 件の行が特定できない場合は検出不能として報告し、ready へ遷移しない
- required 行の verification 対応欠落（missing-verification）は本ゲートの ready 拒否条件に含めない。verification 対応の作成・更新は case-run が担い、対応完全性の最終検査は case-close の QG-4 が担う
- 対象要件行に Design 対応 0 件の行（missing-design）または policy 不正が残る場合は ready へ遷移させず、該当行一覧と停止理由を報告する

### 横断依存検査（ゲート横断次元）

共通契約の正規所有はワークフロー契約 Design「Case 投入時の横断依存検査契約」節である。本節は case-ready 側（トレーサビリティ完全性ゲート）の実行手順を定める（case-ready 実行契約 REQ の横断依存検査行に対応する）。比較手続きは case-open スキル配下の共有エンジン（単一実装）を利用し、本スキル側で重複実装しない。

- **検出源の限定**: canonical Definition（確定済み execution contract が宣言する変更対象成果物と対象要件行）と、未クローズ Case 群の宣言（Issue 本文の execution contract 系セクション）に限定する。合意済み宣言以外の読み取り、一般的な変更影響探索・依存関係探索を行わない
- **スキャン範囲**: 未クローズ Case 群の全体とする。時間窓による狭域化はしない
- **機械的比較の実行**: 検出源を検査入力 JSON に組み、共有エンジンを実行する:
  `bun .opencode/skills/agentdev-workflow-case-open/scripts/src/inspect_cross_dependencies.ts --input <input.json> --root <repo-root>`
  （投影先パスから実行する。worktree で投影が利用できない場合は worktree 構造的制約の fallback 手順に従う。入力 JSON の構成は当該 `scripts/README.md` 参照）
- **検出条件**: (a) canonical Definition と未クローズ Case 群の変更対象成果物の同一パス重複、(b) 2 以上の Case の対象要件行が同一共有領域（トレーサビリティポリシー、AUTOGEN 対象索引、対応関係領域等）への未登録行を含む重複需要
- **共有領域の解決**: 共有領域は「複数 Case から新規行登録需要が発生し得る共有ポリシー・索引・対応関係領域」として一般化して扱い、プロジェクト側の解決は project-extensions の既存の拡張点（workflow-extension の context 等）で行う。条件 (b) の検出では解決した正規成果物実ファイルの現行登録状態を機械的に読み取る（エンジンの共有領域読取による）
- **警告時の挙動**: エラーではなく警告とし、(b) 検出時は共有領域の登録重複警告（トレーサビリティ完全性ゲートの横断次元警告）とともに先行整備の選択肢を投入者（HITL）へ提示する。選択肢は (1) 先行整備 Case の切り出し提案、(2) 既存 Case への登録責務の割り当て、(3) このまま並行投入。整備 Case を自動作成せず、マージ順序を自動決定しない。case-auto 配下では警告検出時の判断を decision_context による親判断解決へ委譲する
- **ready 遷移判定への非影響**: 横断検査の警告は ready 遷移判定を変更しない（ゲートの警告提示と ready 遷移条件の既存ゲート意味論は維持）。警告の提示記録を完了報告へ含める
- **検出源取得不能時**: canonical Definition または未クローズ Case 群の取得に失敗した場合、共有領域実ファイルの読取に失敗した場合は、比較を省略せず検出不能として報告する（検査入力の `source_failures` と報告の `detection_unavailable` による）
- **Epic 経路の委譲境界**: Epic 経路の Wave 内重複（同一 Epic 配下の子 Issue 間）は Wave 構成の重複前置検出（execution-structure の前置検出）へ委譲し二重検査としない。Epic をまたぐ Case 間の重複は本検査が検出対象とする
- **冪等再実行時の再提示**: 再実行時も本検査を再実行し、警告を再提示する（エンジンは同一入力から同一の報告を返す）

### docs 文言期待テスト影響確認（Definition 品質検査）

Definition 変更が docs 文言を期待するテスト（リポジトリ固有の checker fixture を含む）に影響するかを確認する。本確認は Definition 品質検査の確認項目であり、case-ready 実行契約の品質検査行に対応する。

- **対象**: docs 文書の見出し・表構造・特定文言を期待するリポジトリ固有テスト、checker の fixture 期待値、docs 文書を直接読み取って期待値を組み立てる検査実装等。配布物テキストを固定文字列で期待するテストを含む
- **確認方法**: Definition 変更（canonical Definition との差分）で変化する docs 文書の見出し・文言・構造を抽出し、それらを期待するテスト・fixture の有無を検索する
- **対応境界**: 影響を確認した場合の対応要否は case-open / case-ready Design の Definition Package 構成の境界に従う。テスト更新は Definition Package の構成要素ではなく実現面の変更であり、realization_actions 経由で case-run へ割り当てる。本品質検査は影響の有無判定と、確認結果の test_strategy（受入条件一式）への反映までを行う。テスト本体を本検査で修正しない
- **記録**: 影響の有無の判定と根拠を完了報告へ含める（影響ありと判定した場合は、影響を受けるテスト・fixture の一覧と test_strategy への反映内容を含める）

### ready 遷移

- 実行準備条件を満たした場合のみ Root Case を ready に遷移させる
- 実行準備条件: canonical Definition 確定、Decision 受理評価完了（受理不能な proposed が残らない）、execution contract 確定、実行構造確定、検証ゲート合格
- 遷移の反映は Root Case 本文の「Case 状態と次工程」セクション更新で行う。次工程は case-run とする

## STEP-7: draft / RU 削除と同期確認

### draft / RU 削除

- 成功後に draft（`.agentdev/drafts/req-draft-*.md`）と RU（`.agentdev/backlog/req-units/RU-*.md`）を削除する
- blocked、failed、中断した場合は draft / RU を保持する
- 削除対象は明示パス指定で行い、スイープ操作（`git add -A` 等）は行わない。削除した成果物は明示パス指定で git 永続化する

### main 同期確認

- draft / RU 削除後に main ブランチの作業ディレクトリとリモートの同期を確認する
- 不一致を検出した場合は停止する（同期状況と差分を報告）

## 冪等再実行

再実行時は不足分だけを処理する:

- merge 済み Definition（Definition PR）を再利用し、merge を巻き戻さない
- 既存 Child Issue を再利用し、重複生成しない
- 既存 Wave / 依存構造を再利用し、重複確定しない
- Decision の受理記録（accepted 遷移済み）を再利用し、重複する状態遷移や承認記録を生成しない
- execution contract 確定済みの Root Case 本文は現行値を検証し、差分がある場合のみ更新する
- 冪等キーの具体形は case-open / case-ready Design の冪等性節を参照する

### GitHub I/O 失敗時の gh CLI 切替継続手順（冪等再実行の再利用検出）

冪等再実行の再利用判定（merge 済み Definition PR、既存 Child Issue 等の検出）は `agentdev_gh` の読み取り操作に依存する。`agentdev_gh` の読み取り操作が失敗し、再利用検出が完了できない場合、次の手順で継続する。

1. **切替判定**: 読み取り操作の失敗を検知した場合、同一操作を1回再試行する。再試行でも失敗する場合に gh CLI へ切替する
2. **切替範囲の限定**: gh CLI による切替は**読み取り専用の検出**に限定する。merge、Issue 更新、draft / RU 削除の git 永続化等の書込み操作を gh CLI で代替しない（GitHub I/O の正規経路は Custom Tool `agentdev_gh` に限定する契約を維持する）
3. **検出基準の不変性**: gh CLI で検出した結果も同一の冪等キー基準で解釈し、再利用判定の基準を変えない
4. **切替の記録**: 切替理由、使用した gh CLI コマンド、検出結果を検証記録へ残す
5. **切替後も検出不能な場合**: 検出不能として報告し停止する。検出不能のまま新規生成へ進まない（重複生成の防止を優先する）

## 完了報告

- case-ready 完了報告テンプレートに従い、結果（ready 遷移、execution contract 確定、実行構造、Definition PR merge の有無、横断依存検査結果（警告の提示記録または検出不能報告）、capture 結果）を報告する
- Capture結果: 自工程で実観測した deviation を capture 委譲した場合、保存した成果物のパス・分類・保存結果を含める
- 停止時は停止理由の分類（HITL 判断事項、CI 失敗、構成不備、受理不能 Decision、missing-design / policy 不正残存、同期不一致）と再開条件を報告する
