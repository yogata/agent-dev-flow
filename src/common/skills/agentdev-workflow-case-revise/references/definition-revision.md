# Definition Revision（再合意受入、実変更判定、Definition Amendment PR 冪等作成）

case-revise workflow STEP-1〜STEP-3 の実行詳細（SKILL.md「制御平面（STEP 一覧）」から参照される）。

## STEP-1 再合意内容の受入確認

- 入力された Definition 変更が req-define で再合意済みであることを確認する。確認手段は req-define の合意記録（req_draft の合意内容、Root Case 本文の Definition Package / Execution Contract との対比）である
- 本 STEP の確認は合意変更の「受領」に該当する。合意内容そのものの「記録」は req-define の合意記録が担い、「実行への適用」は STEP-5 の Case 関連 Issue 本文更新と最新条件の引き渡しが担う（記録・受領・適用を混同しない）
- 再合意済みでない変更の反映要求は受け付けず、req-define へ差し戻して停止する。case-revise は新しい要求、Decision、対象範囲を生成しない（意味判断は req-define が所有する）
- 再合意済みの Definition 変更は req_draft を再解釈・再設計せず、合意済み内容をそのまま後続 STEP へ投影する

## STEP-2 実変更判定と冪等検索

- canonical Definition（merge 済み main の docs 永続文書（REQ / Decision / Design）と Issue / Epic 構造の確定状態）と再合意内容の差分を比較し、実変更の有無を判定する
- 実変更判定と並行して、冪等キー（case-open / case-ready Design）で同じ再合意内容に対応する既存設計修正PRの有無を検索する
- 分岐:
  - 実変更なし（差分が空）: Definition Amendment PR を作成せず STEP-5 へ進み、execution contract / execution structure の再確定を case-ready へ引き継ぐ。空の Definition Amendment PR を作る経路は存在しない
  - 実変更ありかつ既存 Definition Amendment PR あり: 既存 PR を再利用し、STEP-3 を省略して STEP-4 へ進む（重複生成しない）
  - 実変更ありかつ既存 Definition Amendment PR なし: STEP-3 へ進む

## STEP-3 設計修正PR作成

- pr_create の前段として head branch を push する（pr_create より手前に位置させる）: 作業 branch（`definition-amend/issue-{N}` 形式）を `git push -u origin definition-amend/issue-{N}` で remote へ push し、push 出力で push 先 refspec（remote branch 名と upstream 設定）が意図した先であることを確認する。pr_create は remote に存在する branch を head とする操作であり、未 push の branch での pr_create は失敗する（HTTP 422 由来の実失敗に基づく前段手順）
- 再合意済みの実変更を設計修正PRとして通常 Pull Request（GitHub Draft PR ではない）で作成する（Custom Tool `agentdev_gh` の pr_create 操作。VERIFY は Tool 内部。REQ-{NNNN}-{NNN}）
- PR 作成は Case 単位で同一再合意内容に対応するものを重複生成しない。作成前に既存 PR の再検索を実行し、検出時は新規作成を取りやめて再利用へ切り替える
- REQ / Decision / Design 変更の保存実体は `agentdev-req-file-manager` / `agentdev-decision-file-manager` / `agentdev-design-file-manager` へ委譲する（case-revise は意味判断せず、合意済み内容を投影する）
- 変更範囲は `agentdev-artifact-validation` の公開検証契約で検査する（frontmatter id↔filename 整合、README entry 存在、変更範囲検証）

## 合意変更の 5 段階区別管理

合意変更は「変更の記録」「影響対象への変更到達」「下流消費成果物への反映」「消費担当による最新条件の受領」「反映後成果物の読み戻し確認」の 5 段階を区別して扱う。本節は STEP-1 の「記録・受領・適用の区別」を置き換えず、各段階を実行 STEP へ対応付けて段階間の混同を防ぐ。

| 段階 | 意味 | 担い手・実施位置 |
|---|---|---|
| 変更の記録 | 再合意内容を合意記録として残すこと | req-define の合意記録（req_draft の合意内容、Root Case 本文の Definition Package / Execution Contract）。STEP-1 の受入確認は記録との対比消費であり、記録の再作成は行わない |
| 影響対象への変更到達 | 変更内容を影響を受ける対象へ届けること | STEP-4 の影響再評価と再評価要否マーキング、STEP-5 の Case 関連 Issue 本文更新（変更の参照先、影響範囲、処置判断、再開条件） |
| 下流消費成果物への反映 | 変更内容を消費される成果物の正本へ反映すること | STEP-3 の設計修正PR（REQ / Decision / Design への保存）、STEP-5 の Case 関連 Issue 本文更新 |
| 消費担当による最新条件の受領 | 作業担当が最新条件を受け取り、適用方針を報告すること | STEP-5 の最新条件引き渡しと作業担当による適用方針報告の確認（報告確認まで case-ready 引き継ぎへ進まない） |
| 反映後成果物の読み戻し確認 | 反映後の成果物を読み戻し、変更内容が反映されていることを確認すること | STEP-5 の読み戻し確認（`handoff-and-update.md`「反映後成果物の読み戻し確認と旧契約抑止」節） |

- 各段階は他の段階の完了をもって代替しない。記録済み・受領済みであっても、到達・反映・読み戻し確認が未完了であれば合意変更の反映は完了していない
- 5 段階の未完了段階が残る場合は case-ready 引き継ぎへ進まず、未完了段階の完了を完了報告に記録する
