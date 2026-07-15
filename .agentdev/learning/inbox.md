# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## case-run 実行担当サブエージェント委譲不可 (ハーネス call_omo_agent 制約)

- 問題事象: case-run (Sisyphus-Junior) 実行時、call_omo_agent ツールが explore/librarian agent 型のみを許可し、agentdev-case-run-execution-adapter が定義する実行担当サブエージェント型を起動できない。Epic Wave 並列委譲 (最大5件) も同様に機能しない
- 発生局面: 実装 (case-run)
- 検知方法: call_omo_agent ツール呼出し試行時の schema 制約 ("custom agents... not supported") 確認
- 根本原因: ハーネス (oh-my-openagent) の call_omo_agent ツール schema が explore/librarian のみを許可。adapter skill が定義する実行担当サブエージェント型 (custom agent) は schema で弾かれる
- 自律対応内容: システムプロンプト「the implementation, verification, and final handoff are yours」に準拠し、case-run オーケストレータと実行担当サブエージェントを兼ねてインライン実行で完遂。全 PR の Findings セクションに delegation-chain-unavailable エントリを記録し、本来の case-run フローとの差分を明示
- ユーザー確認有無: なし
- ADR/REQ/spec影響: あり。agentdev-case-run-execution-adapter SKILL が定義する委譲プロトコルが現在のハーネス環境で機能しない。REQ-0149 (agentdev-gh-cli 委譲基盤) の実行環境前提、Epic Wave 並列委譲モデル (最大5件) の達成可能性を再確認する必要がある
- 横展開観点: 同一ハーネス環境で動作する全 case-run で同一事象が発生。Epic Wave 並列委譲の速度優位性が失われる
- 再発条件: call_omo_agent が explore/librarian のみを許可するハーネス環境で case-run を実行した場合に必ず発生
- 予防策候補: (a) call_omo_agent schema で custom agents をサポート、(b) adapter skill の委譲プロトコルにハーネス能力に応じたフォールバックを定義、(c) case-run がハーネス能力を事前検出して委譲可否を判断し Inability を冒頭で明示
- 想定反映先: agentdev-case-run-execution-adapter SKILL、agentdev-workflow-orchestration capture-boundaries.md、REQ-0149 実行環境前提
- 関連: Epic #1515 Wave 1 PR Findings delegation-chain-unavailable エントリ全件 (PR #1522/#1523/#1524/#1525)。Epic #1515 ステータス追跡テーブル Wave 1 完了 (2026-07-15)
- タグ: #delegation #harness-limitation #case-run #inline-execution #epic-wave

## QG-4 spec-bug acceptance: Issue完了条件 vs Epic対象外 の調整判断 (#1516/TS-004)

- 問題事象: #1516 (OU-001) の TS-004 (配布 command 6ファイル実行制御パラメータ直接記述 0件) が FAIL (16件残留)。case-run は QG-3 spec-bug に分類。TS-004 達成には配布 command 実装本体改修が必要だが、Epic #1515「対象外: 配布 command/skill/docs の実装本体改修」と矛盾
- 発生局面: レビュー (case-close QG-4)
- 検知方法: case-run QG-3 分類結果 (spec-bug) の case-close QG-4 最終受け入れ判定
- 根本原因: Epic 完了条件のテスト戦略 (TS-004「0件」) と Epic 対象外 («配布 command 実装本体改修») が矛盾。REQ-0162-002 (実行制御パラメータ references 集約) は要件として追加されたが、src/opencode/ command 本文からの除去は未実施で、それを要求する TS-004 がスコープ外と衝突
- 自律対応内容: case-close QG-4 で (a) Issue #1516 完了条件 5項目は全て客観的に達成 (REQ-0162-007/008, REQ-0144-025, SPEC section, baseline 11件明記)、(b) TS-001/002/003/004 は全て PR Findings に record-in-findings 済み、(c) Epic「対象外」が実装本体改修を明示的に除外していることを根拠に accepted (completed) と判定。spec-bug Findings は case-update / intake 経由で後続委譲
- ユーザー確認有無: なし (task delegation で「accepted per Epic対象外 reconciliation, or blocked」の判断を委譲)
- ADR/REQ/spec影響: あり。REQ-0162-002 (実行制御パラメータ references 集約) の実装が未完。Epic 完了条件 TS-004 checkbox は最終 Wave まで未達の可能性。document-model SPEC のテスト戦略と対象外の整合性チェック機構が必要
- 横展開観点: 同様の「テスト戦略 vs 対象外」矛盾は他の Epic でも発生し得る。Epic 完了条件策定時にテスト戦略の実現可能性を対象外と照合する手順が必要
- 再発条件: Epic 完了条件のテスト戦略が達成不可能な実装を要求し、同時に Epic がその実装を対象外とする場合
- 予防策候補: (a) case-open 時に Epic 完了条件のテスト戦略と対象外の整合性を自動検証、(b) QG-2 (Acceptance Criteria Coverage Gate) でテスト戦略の実現可能性を検証、(c) spec-bug 分類時の case-close QG-4 判断基準を SPEC 化
- 想定反映先: agentdev-quality-gates QG-2 (acceptance-criteria-coverage)、agentdev-req-analysis (テスト戦略の実現可能性検証)、agentdev-workflow-templates (Epic 完了条件テンプレート)
- 関連: Issue #1516, PR #1525, Epic #1515 Wave 1
- タグ: #qg4 #spec-bug #epic-scope #test-strategy #acceptance-judgment
