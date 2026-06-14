---
description: req-save→case-open→case-run→case-closeを順次自走実行する（明示指定時のみ）
agent: sisyphus
---

# 最大自走モード

要件docから req-save → case-open → case-run → case-close を順次実行し、repo内変更に限りマージまで自走する。標準ワークフローの置き換えではなく、ユーザーが明示的に指定した場合のみ使用する追加入口である。

## Input

- 要件doc: 明示パス指定 / `.agentdev/drafts/req-draft-*.md` 単一自動検出 / セッション内要件doc（3段階優先順位）

## Output

- feature: REQ/ADRファイル + GitHub Issue + 実装済みブランチ + PR + マージ済み + クローズ済み
- bugfix/maintenance/docs_chore: GitHub Issue + 実装済みブランチ + PR + マージ済み + クローズ済み

## Steps

1. **入力解決**: 明示パス→draft単一検出→セッション内要件docの順で入力を特定する。不明時は停止しreq-define実行またはパス指定を求める
2. **work_type 読取**: 入力要件docの draft-meta セクションから work_type を取得する
3. **工程分岐**:
   - feature: req-save → case-open → case-run → case-close
   - bugfix / maintenance / docs_chore: case-open → case-run → case-close（req-save をスキップ）
4. **各工程の実行**: 既存コマンド定義（req-save.md / case-open.md / case-run.md / case-close.md）を authoritative source として読み込み、各コマンドの Steps / Guardrails / Error handling に従って実行する。手順を再実装しない。各工程の後段処理（case-open の RU 削除、case-close の learning/intake capture・.agentdev/ commit/push 等）も含めて既存コマンド定義に従うこと
   - case-auto は req-save / case-open に draft path と OU ID のみを渡すこと（REQ-0114-052）。OU 本文の切り出しは行わない
   - case-auto は OU の統合・分割、REQ 操作分類、Issue 階層判定を再評価しないこと（REQ-0114-054）
   - case-open 相当処理の完了後、出力を確認して以下のいずれかに分岐する:
     - **Standard flow（単一 Issue）**: 既存の直列フロー（case-run → case-close）をそのまま実行
     - **Epic Issue（マルチREQ または 単一REQ Epic flow）**: Step 4-1〜4-3 のキュー処理に進む
     - **Step 4-1 キュー開始**: ドラフトの `operation_units` セクションから OU 構造を読み取り、処理順序を決定する（`recommended_order`, `depends_on` に基づく）。Epic Issue 番号を記録する。Epic Issue の子Issue一覧（Wave 構成含む）を読み取る。case-run 相当処理に Epic Issue 番号を渡す。case-run の Epic Orchestrator モードが全 Wave の子Issue実行を処理する。case-auto は Wave 実行プロトコルを実装しない（`agentdev-workflow-orchestration` を参照）
     - **Step 4-2 case-close ループ**: case-run 相当処理の完了後、その出力（成功/失敗/スキップされた子Issue一覧）から case-close 対象を決定する:
      - 正常完了した子Issue: case-close 相当処理を実行
      - 失敗・スキップされた子Issue: case-close を試みない
      - 各子Issue の case-close は既存の case-close.md 定義に従う（learning/intake capture、`.agentdev/` commit/push を含む）。各子Issue ごとに独立して実行し、キュー全体での一括 capture は行わない
      - case-auto は 1 OU を close まで完了した後に次の OU へ進むこと（REQ-0114-053）
     - **Step 4-3 全体完了判定**: 全子Issue の case-close 処理完了後:
     - Epic Issue の子Issue全ステータスが CLOSED の場合 → Epic 自動クローズ確認（case-close Step 8 相当） → 全体完了報告
      - 未クローズの子Issue が残る場合（失敗/スキップ） → 部分完了報告
     - 停止時は完了済み OU、進行中 OU、未実行 OU、再開可能な次コマンドを報告すること（REQ-0114-056）
5. **工程間の状態引き継ぎ**: 各工程の成果物（Issue番号、PR番号）を次工程の入力として渡す。加えて以下の引き継ぎ情報を最終工程まで保持すること: (1) 要件docの Requirement Source セクション内容（RU 削除判定に使用） (2) RU ファイルパス（case-open 相当処理の RU 削除で使用） (3) capture 対象情報（case-close 相当処理の learning/intake capture で使用）
6. **複数REQ対応**: req-save 相当処理の出力から複数 REQ doc または scale:large を検出した場合、case-auto は case-open の Issue 構造ルールをそのまま使用する。case-auto 自体に Issue 階層決定ロジックを持ってはならない。req-save 相当処理から case-open 相当処理へ状態を引き継ぐ際、case-auto は複数 REQ doc の保存結果をフィルタリングや再評価なしでそのまま渡す。case-auto は Epic Issue 化の判定に関与しないこと（REQ-0114-057）。case-open の判定結果に従うこと
7. **停止条件の検出**: 以下のいずれかを検出した場合、実行を停止し停止理由・現在地点・再開可能な次コマンドを報告する:
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
8. **完了報告**: 最終工程（case-close）の完了報告をそのまま出力する。Epic Issue を伴うキュー実行時は、完了・失敗・スキップ子Issue一覧を含める。停止時は完了済み OU、進行中 OU、未実行 OU、再開可能な次コマンドを報告する（REQ-0114-056）

## Guardrails

### 自走境界
- G01: 自走対象はrepoにファイルとして残る変更に限定する
- G02: 以下は自走対象外とする: DB migration実行、deploy/apply、クラウドリソース操作、外部SaaS設定変更、課金・権限・認証情報に関わる変更、repo外の実データ操作、通知送信
- G03: migrationファイル・IaCファイルの作成・修正は対象とし、migration実行・IaC applyは対象外とする
- G04: GitHub Issue / PR / comment / merge / close は自走対象とする
- G05: remote branch削除は当該case-auto / case-runが作成したbranchに限定する
- G06: docs / REQ / ADR / SPEC / command reference / guide の更新を自走対象に含める

### 委譲・参照制約
- G07: 既存コマンドの手順をcase-auto定義内に再実装しない
- G08: 工程固有の詳細手順とcase-auto定義が矛盾する場合、工程固有処理は既存コマンド定義を優先し、自走境界・入力解決・工程間制御はcase-auto定義を優先する
- G09: 既存のreq-save / case-open / case-run / case-closeの責務を変更しない
- G13: case-auto は Issue 階層決定ロジックを持ってはならない。複数 REQ doc または scale:large の場合は case-open の Issue 構造ルールに委譲する
- G14: case-auto は req-save 相当処理から case-open 相当処理への状態引き継ぎ時、複数 REQ doc の保存結果をフィルタリングまたは再評価してはならない。保存結果をそのまま渡す
- G15: case-auto は Wave 実行プロトコル（`agentdev-workflow-orchestration` 参照）を実装してはならない。これらは case-run Epic Orchestrator に委譲する
- G16: case-auto は独自の操作単位ステータス追跡を持ってはならない。Epic Issue のステータス追跡テーブルを使用する
- G18: case-auto は操作単位キューの管理・制御のみを担い、OU 本文の抽出・変換・REQ 操作解釈を行わないこと（REQ-0114-051）
- G19: case-auto は draft を OU 情報の SSoT として扱い、独自の OU 状態管理を持たないこと（REQ-0114-058）
- G20: OU 間依存は queue dependency として扱い、依存関係があるだけでは Epic Issue 化しないこと（REQ-0114-055）
- G21: case-auto は Epic Issue 化の判定に関与しないこと。case-open の判定結果に従うこと（REQ-0114-057）

### 出力制約
- G10: 成果物本文（Issue本文・PR本文・commit message・保存対象ファイル本文・テンプレート成果物）はverbatimで返す。判定結果・調査過程・中間ログ・読解メモは要約・成果物パス・根拠・親判断事項・capture候補へ圧縮して返す

### Capture 整合制約
- G17: case-auto は構成コマンド（case-run / case-close）の capture 責務境界に従う。case-auto 固有の capture 振る舞いは持たない。capture 境界の詳細は `agentdev-workflow-orchestration` を参照

### Runtime path 制約
- G11: 既存コマンド定義を読み込む際、source path を runtime path に読み替えてはならない。コマンド定義内のパス参照は記述された通りに解釈し、source path を runtime 参照先として使用しない
- G12: 委譲先コマンドの実行時 Read / Glob に source path 固定参照を含めない
