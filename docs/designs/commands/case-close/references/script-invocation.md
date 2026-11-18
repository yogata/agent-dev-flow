---
title: 機械工程の script 呼び出し契約
status: accepted
created: "2026-11-19"
updated: "2026-11-19"
---

<!-- 親: docs/designs/commands/case-close.md から参照される詳細仕様（遅延読み込み）。 -->

# 機械工程の script 呼び出し契約

## 機械工程の script 呼び出し契約（RU-0162）

case-close の機械工程（mergeable ポーリング、squash merge 前後のローカル状態検査、Epic 実行構成表の解析と状態更新、完了条件チェックボックス評価の機械的抽出、AUTOGEN 再生成差分検出、full integrity suite の起動と結果集約、契約状態記録・未追跡残存検査、終了判定記録（`.agentdev/close-acceptance/`）の書出し・無効化と終了後回収、worktree/branch クリーンアップ）は、工程別 script 1 回の呼び出しに束ねる。GitHub I/O（pr_merge、issue_close、Issue 本文更新）は Custom Tool agentdev_gh の境界を維持する。

- 入力 JSON / 報告 JSON / 終了コードの契約、品質ゲートの script 内実行（省略禁止）、final-acceptance.ts・inspect_cross_dependencies.ts と同じ作り（反復可能な機械処理に限り agentdev-artifact-validation 所有の共有 lib を supported lib interface 経由で利用できる。工程固有のゲート選択・順序・実行条件・結果解釈は各工程の Design が所有し続け、横断的な共通基盤を新設しない）、意味判断（警告の重要度評価、Design 確定判断、未達判定の確定）のモデル担当は、case-open Design「機械工程の script 呼び出し契約（RU-0162）」節と同一の規律に従う
- post-merge の worktree/branch クリーンアップは、main working tree 構成（worktreeRoot == repoRoot・Epic 最終close等）では worktree とその checkout ブランチが削除対象外（REQ-118-005）であるため適用対象外として pass を記録し、worktree remove と branch 残存検知を実行しない。cleanup.removeWorktree: false 指定時も worktree 削除を発行しない。通常 worktree 構成は従来どおり削除と残存検知を行い、残存時の要判断警告を維持する。明示指定された removeBranch の削除失敗はいずれの構成でも回収失敗として扱う
- 報告 JSON にはマージ・検証・クリーンアップの各結果、差分、警告、提案するコメント本文を含める
- workflow skill 参照文面は script 呼び出しと報告 JSON 解釈へ置き換えて短縮する
- 完了条件チェックボックス評価の機械的抽出（close_mechanical_steps.ts の抽出フェーズ）は、受入評価（final-acceptance.ts への入力）の母集団導出を兼ねる。抽出結果（正規完了条件の一覧とその取得成否）を受入評価入力へ渡し、報告 JSON に母集団と判定の対応を含める。抽出失敗は評価の blockers 扱いとし、空の判定入力を「条件なし」へ変換しない
- final-acceptance.ts（evaluateFinalAcceptance）は完了条件単位評価の機械評価部品として、判定入力（verdicts・crossObligations）の構造検査と必須未達・根拠欠落の検出を担う。証拠の意味対応評価（証拠が条件の意味命題を立証しているか）はモデルが担当し、機械部品の通過だけで完了を確定しない
- 受入評価の拒否・未確定の結果（closeAllowed 相当の判定とその根拠）は報告 JSON を通じて終了操作の実行抑制として消費される。STEP-5 の issue_close 実行と E1〜E6 の Epic 終了は、受入評価の許可を前提条件として扱い、拒否結果を保持したまま終了操作を実行しない
- gate 証跡保持要件: 機械工程の品質ゲート（full integrity suite 等）のうち stderr 出力ランナー（bun test 等）を含む検証は、当該ランナーの検証実行（script 外の直接実行）に stdout と stderr の分離退避を常時付与する。機械工程 script 呼び出し自体のリダイレクトラップは現行 runner が stderr を内部捕捉するため証跡成立手段にならない。件数突合系 gate の受理根拠は stderr 退避ファイル（件数サマリーの出力先）に置き、検証差分には既存の検証差分記録規約（agentdev-workflow-templates）に従い保存先・終了コード・checker の版・検査範囲・実行環境を記録する。報告 JSON の保持構造への依存（stdout のみ保持等）を証跡の成立根拠にしない

### QG-4 機械受理基準と機械判定経路の対応（RU-0226）

機械工程の full integrity suite 判定と QG-4 最終受入規範（agentdev-quality-gates の references/qg-4-final-acceptance.md）の機械受理基準との対応は本節が単一所有する。機械受理基準の記録様式の定義は QG-4 規範が正であり、本節は対応関係のみを記述し様式を再掲しない。

- 機械受理基準と機械判定経路の対応: 受理条件5（fail 全件の由来分類、由来不明 0）と受理条件7（pre-existing fail の baseline 再現確認記録）を満たす検証結果記録は、full integrity suite に fail 件数が残存していても規範が合格として認める受理経路である。機械工程は当該記録の存在・形式を機械受理基準の10項目の記録完備で検証し、終了操作許可の判定に反映する。受理条件8の「非ゼロ終了・timeout 打ち切り・切断した実行結果を pass 証拠として扱わない」は、由来分類記録を欠く生の実行結果単独を pass 証拠としない意味として適用する
- 拒否経路の背反防止: 受入評価の拒否（closeAllowed 相当）と機械工程の exitCategory による拒否の2系統は、同一入力に対して同一の判定結果へ収束すること。機械受理基準を満たす記録で分類済みの fail が残る場合、機械工程の当該 step は規範の判定に従い、機械受理基準の記録欠落、由来不明 fail の残存、未登録の既知欠陥を合格の根拠にする場合は fail-closed として終了操作を拒否する
- 終了コードの非変換: 機械工程は検証ランナーの非ゼロ終了コードを成功へ変換しない。終了コードは受理条件8の記録として保持し、分類記録の検証は終了コードの変換ではなく独立の判定層として重ねる
- 既知欠陥登録経路の対応: checker NG の登録は provenance 付き NG baseline（契約の正は checker 実行契約 Design「baseline 退避物と BaselineFile の役割分離と合否判定基準」節と integrity 契約 Design「NG baseline 運用手順」）とする。bun test suite fail の登録様式は文言統合とする（ユーザー判断 2026-10-15・判断記録 CR-003/CR-004）: 機械受理基準の記録一式（受理条件5の由来分類記録・受理条件7の baseline 再現確認記録・provenance・件数記録）を登録様式と定義し、恒久台帳は新設せず、既存の PR 本文検証差分が当該記録一式の登録として機能する。整合方向は機械工程側の修正（implementation-first）に確定済みであり、機械工程は当該記録一式の存在・形式を機械受理基準の10項目の記録完備で検証して終了操作許可の判定に反映する。未登録の既知欠陥を合格の根拠にする結果の拒否は維持する
