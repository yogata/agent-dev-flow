---
description: req-save→case-open→case-run→case-closeを順次自走実行する（明示指定時のみ）
agent: sisyphus
---

# 最大自走モード

要件docから req-save → case-open → case-run → case-close を順次実行し、repo内変更に限りマージまで自走する。標準ワークフローの置き換えではなく、ユーザーが明示的に指定した場合のみ使用する追加入口である。

## Input

- 要件doc: 明示パス指定 / `.sisyphus/drafts/req-draft-*.md` 単一自動検出 / セッション内要件doc（3段階優先順位）

## Output

- feature: REQ/ADRファイル + GitHub Issue + 実装済みブランチ + PR + マージ済み + クローズ済み
- bugfix/maintenance/docs_chore: GitHub Issue + 実装済みブランチ + PR + マージ済み + クローズ済み

## Steps

1. **入力解決**（REQ-0114-002〜005）: 明示パス→draft単一検出→セッション内要件docの順で入力を特定する。不明時は停止しreq-define実行またはパス指定を求める
2. **work_type 読取**（REQ-0114-010）: 入力要件docの draft-meta セクションから work_type を取得する
3. **工程分岐**（REQ-0114-008〜009）:
   - feature: req-save → case-open → case-run → case-close
   - bugfix / maintenance / docs_chore: case-open → case-run → case-close（req-save をスキップ）
4. **各工程の実行**（REQ-0114-006〜007）: 既存コマンド定義（req-save.md / case-open.md / case-run.md / case-close.md）を authoritative source として読み込み、各コマンドの Steps / Guardrails / Error handling に従って実行する。手順を再実装しない。各工程の後段処理（case-open の RU 削除、case-close の learning/intake capture・.agentdev/ commit/push 等）も含めて既存コマンド定義に従うこと
   - case-open 相当処理の完了後、出力を確認して以下のいずれかに分岐する:
     - **Standard flow（単一 Issue）**: 既存の直列フロー（case-run → case-close）をそのまま実行
     - **Epic Issue（マルチREQ または 単一REQ Epic flow）**: **操作単位キュープロセス**（Step 4a〜4c）に進む（REQ-0114-044）
   - **Step 4a キュー開始**（REQ-0114-045）: Epic Issue 番号を記録する。Epic Issue の子Issue一覧（Wave 構成含む）を読み取る（REQ-0114-039）。case-run 相当処理に Epic Issue 番号を渡す。case-run の Epic Orchestrator モードが全 Wave の子Issue実行を処理する。case-auto は Wave スケジューリング・依存関係分析を実装しない（REQ-0114-045）
   - **Step 4b case-close ループ**（REQ-0114-046, 047）: case-run 相当処理の完了後、その出力（成功/失敗/スキップされた子Issue一覧）から case-close 対象を決定する:
     - 正常完了した子Issue: case-close 相当処理を実行（REQ-0114-046）
     - 失敗・スキップされた子Issue: case-close を試みない（REQ-0114-047）
     - 各子Issue の case-close は既存の case-close.md 定義に従う（learning/intake capture、`.agentdev/` commit/push を含む）（REQ-0114-050）。各子Issue ごとに独立して実行し、キュー全体での一括 capture は行わない
   - **Step 4c 全体完了判定**（REQ-0114-048, 049）: 全子Issue の case-close 処理完了後:
     - Epic Issue の子Issue全ステータスが CLOSED の場合 → Epic 自動クローズ確認（case-close Step 8 相当） → 全体完了報告
     - 未クローズの子Issue が残る場合（失敗/スキップ） → 部分完了報告（REQ-0114-049）
5. **工程間の状態引き継ぎ**（REQ-0114-020）: 各工程の成果物（Issue番号、PR番号）を次工程の入力として渡す。加えて以下の引き継ぎ情報を最終工程まで保持すること: (1) 要件docの Requirement Source セクション内容（RU 削除判定に使用） (2) RU ファイルパス（case-open 相当処理の RU 削除で使用） (3) capture 対象情報（case-close 相当処理の learning/intake capture で使用）
6. **複数REQ対応**（REQ-0114-036〜037）: req-save 相当処理の出力から複数 REQ doc または scale:large を検出した場合、case-auto は REQ-0104-029〜033 で定義される case-open の Issue 構造ルールをそのまま使用する。case-auto 自体に Issue 階層決定ロジックを持ってはならない（REQ-0114-036）。req-save 相当処理から case-open 相当処理へ状態を引き継ぐ際、case-auto は複数 REQ doc の保存結果をフィルタリングや再評価なしでそのまま渡す（REQ-0114-037）
7. **停止条件の検出**（REQ-0114-016）: 以下のいずれかを検出した場合、実行を停止し停止理由・現在地点・再開可能な次コマンドを報告する:
   - (1) req-define合意要件からの逸脱
   - (2) 要件未合意のscope拡大
   - (3) repo外実体変更の必要性
   - (4) DB migration実行の必要性
   - (5) deploy/applyの必要性
   - (6) 認証・秘密・権限変更の必要性
   - (7) CI/test/lint失敗がself-healing不能
   - (8) merge conflict / remote hash不一致
   - (9) 作成元不明branch / user-owned branch / 他作業branchの削除検出
   - (10) 未コミット変更の帰属不明
7. **完了報告**: 最終工程（case-close）の完了報告をそのまま出力する。Epic Issue を伴うキュー実行時は、完了・失敗・スキップ子Issue一覧を含める（REQ-0114-049）

## Guardrails

### 自走境界
- G01: 自走対象はrepoにファイルとして残る変更に限定する（REQ-0114-011）
- G02: 以下は自走対象外とする（REQ-0114-012）: DB migration実行、deploy/apply、クラウドリソース操作、外部SaaS設定変更、課金・権限・認証情報に関わる変更、repo外の実データ操作、通知送信
- G03: migrationファイル・IaCファイルの作成・修正は対象とし、migration実行・IaC applyは対象外とする（REQ-0114-013）
- G04: GitHub Issue / PR / comment / merge / close は自走対象とする（REQ-0114-014）
- G05: remote branch削除は当該case-auto / case-runが作成したbranchに限定する（REQ-0114-015）
- G06: docs / REQ / ADR / SPEC / command reference / guide の更新を自走対象に含める（REQ-0114-021）

### 委譲・参照制約
- G07: 既存コマンドの手順をcase-auto定義内に再実装しない（REQ-0114-007）
- G08: 工程固有の詳細手順とcase-auto定義が矛盾する場合、工程固有処理は既存コマンド定義を優先し、自走境界・入力解決・工程間制御はcase-auto定義を優先する（REQ-0114-019）
- G09: 既存のreq-save / case-open / case-run / case-closeの責務を変更しない（REQ-0114-018）
- G13: case-auto は Issue 階層決定ロジックを持ってはならない。複数 REQ doc または scale:large の場合は REQ-0104-029〜033 で定義される case-open の Issue 構造ルールに委譲する（REQ-0114-036）
- G14: case-auto は req-save 相当処理から case-open 相当処理への状態引き継ぎ時、複数 REQ doc の保存結果をフィルタリングまたは再評価してはならない。保存結果をそのまま渡す（REQ-0114-037）
- G15: case-auto は Wave スケジューリング・依存関係分析・並列実行制御を実装してはならない。これらは case-run Epic Orchestrator に委譲する（REQ-0114-045）
- G16: case-auto は独自の操作単位ステータス追跡を持ってはならない。Epic Issue のステータス追跡テーブルを使用する（REQ-0114-039）

### 出力制約
- G10: サブエージェントの最終出力はverbatimで出力する（再フォーマット禁止）

### Runtime path 制約
- G11: 既存コマンド定義を読み込む際、`src/opencode/...` を runtime path に読み替えてはならない（SHALL）。コマンド定義内のパス参照は記述された通りに解釈し、`src/opencode/` を runtime 参照先として使用しない
- G12: 委譲先コマンドの実行時 Read / Glob に `src/opencode/...` 固定参照を含めない（SHALL）
