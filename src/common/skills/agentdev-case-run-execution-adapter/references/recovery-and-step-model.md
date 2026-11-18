---
title: 報告契約の詳細、background 委譲の回復手順、STEP model 連携
---

<!-- 親: agentdev-case-run-execution-adapter SKILL.md「実行担当の報告契約」節および「委譲起動不能時の取扱い」節から参照される詳細仕様（遅延読み込み）。 -->

# 実行担当の報告契約の詳細

実行担当サブエージェントは、取りまとめ（case-run）が記録契機に応じて記録コメント投稿と本文進行状況・結果セクション更新を行うための報告を行う。記録反映（Issue 本文・コメントへの書込み）は取りまとめの責務であり、実行担当は Issue 本文・コメントへの記録反映を行わない。

- **報告要素**: 事実・結果、停止（再開条件を含む）、判断変更の影響対象を含める。取りまとめは報告を受けて記録へ構造化・反映する
- **重要変更の識別と報告**: 実行担当サブエージェントは、実装・検証中に既存の正規成果物や既存前提への重要変更、外部仕様・互換性・データ・セキュリティへの重要な影響、進行中の別作業への重大な影響、当初想定からの重大な変更を、判明した時点でその内容と影響とともに取りまとめへ報告する。識別は変更の意味と影響に基づく判断であり、変更ファイル数やキーワードだけの機械判定に置き換えない。報告対象には、その時点で未反映の重要変更と、判明時点ですでに反映済みの内容（反映済みである事実を区別して説明する）の双方を含める。委譲された裁量の範囲内の重要変更は、報告後に追加承認なしで実行を継続する。利用者に留保された判断が必要な場合は、result 契約の `blocked` として判断事項を報告する。既存の合意内容との照合、差分・影響評価、必要な更新・再検証を通知で代替しない
- **委譲要求と実着手の区別**: 委譲起動（委譲要求）は実着手と同一視されない。実装着手の事実を報告するのは実行担当の責務であり、取りまとめの着手記録はその報告を契機に行われる
- **工程終了を待たない途中報告**: 工程終了（result 確定）を待たず、確定した停止・判断待ち・判断変更影響を報告できる。途中報告は取りまとめが受領時点で対応する記録契機の反映（停止等）に使われる。途中報告は result 契約（4状態）の最終確定値を代替せず、result は確定時に必ず返却する
- **検証用一時資材の作成報告**: 委譲内で検証用remote、clone、bare repository、退避ログ、補助スクリプト、専用server・process等の検証用一時資材を作成する場合、許可された範囲（既存の配置規則と権限に従う標準的な一時領域への作業専用領域、リポジトリ内の作業領域、許可された外部環境）で作成・利用し、利用終了時に安全条件（当該作業が作成した専用資材であることの確認、回収対象範囲の特定、正式な成果物・必要な証拠・他の作業や利用者が管理する資材の保護、既存の副作用・承認境界への適合）が成立する範囲で回収する。継続利用する資材は引継ぎ事項として報告する。後片付けの実施結果、確認根拠、未処理事項（未回収・確認不能・引継ぎ）を既存の報告経路で委譲元の実行処理へ報告する。必要な副作用が許可範囲を超える場合は既存の停止・判断経路を利用し、許可範囲を独断で拡張しない（様式の正は delegation-contracts Design「検証用一時資材の作成・報告義務」節、安全条件と配置規則の詳細は検証に伴う一時資材の取扱いと後片付け責任 Design「一時資材の配置・利用・回収」節）
- **result 契約との独立性**: 本報告契約は result 4状態（completed-pr / blocked / failed / delegation-unavailable）の追加・変更を行わない。報告は result の生成・受領に付随する情報であり、result 契約（最小契約）は維持する

# background 委譲の起動消失の回復手順

case-run は background 委譲の起動直後消失を検知した場合、委譲先の会話応答（一時コンテキスト）に依存せず、durable state で実行の帰属を確認して回復する:

1. **帰属確認（durable state）**: 次の永続状態で委譲先の実行の帰属を確認する
   - worktree の git status・commit（実行中の変更や commit の有無）
   - PR の存在（`completed-pr` の証跡）
   - Issue コメント（blocked / failed の SSoT）
2. **実行未試行と判定した場合**: 同期実行によらず background での再委譲（親 orchestration が所有する起動間隔契約に従う）を行う（実行未試行のため result 状態は付かない。委譲起動不能時の `delegation-unavailable` とは区別する）。background 再委譲の起動失敗が継続する場合は、Design が所有する再試行計上契約に基づき delegation-unavailable として再開可能な停止報告へ確定する
3. **実行中断と判定した場合**: 継続の判断（継続指示または再委譲）も当該 durable state に基づく。git status の残留変更と PR 有無を根拠とし、会話コンテキストの推定で判断しない
4. **再委譲形態限定**: 再委譲は staggered background とし、委譲方式を同期実行へ切替えない。実行並列制御（共有 active Issue task 枠）は case-auto orchestration stage 3 が単一所有する契約に従う

# STEP model 連携（workflow STEP 契約・STEP resume point と会話記憶非依存）

本スキルは Capability Skill として、case-run Workflow Skill の `execute` STEP（`agentdev-workflow-orchestration` 参照）から委譲起動される（`<workflows/workflow-skill-model>` Design）。

本スキル自身は case-run workflow の STEP を所有せず、委譲契約（4状態 result）で case-run 側 STEP へ接合する。

## 委譲コンテキストと Input Resolution

委譲起動時に case-run から引き渡される worktree root、ブランチ名、Issue 番号、実行 command 指定は、永続状態の優先順位（`<foundations/durable-state-and-recovery>` Design）に従い、case-run `execute` STEP の入力解決（Input Resolution）で解決された入力である。

実行担当サブエージェントは委譲内で Issue 本文、REQ/Decision/Design を SSoT 再構成（最上位優先）で再取得・再検証し、自然言語の前STEP result のみに依存しない。

## 委譲内シーケンスと result 接合

実行担当サブエージェントの責務（Issue 読込、context 再確認、実装・検証・PR 作成、blocker 処理、result 返却）は adapter 委譲内の内部シーケンスであり、case-run 側からは result 4状態（`completed-pr` / `blocked` / `failed` / `delegation-unavailable`）のみで観測される。

内部シーケンスの STEP 遷移を case-run workflow の STEP model へ投影せず、PR URL（成功時）または Issue コメント（blocked/failed時）を SSoT として扱う。

STEP reference 8 要素は `<foundations/durable-state-and-recovery>` Design 参照。

# 委譲起動後の異常終了との対象段階の区別

`references/harness-delegation.md`「委譲起動失敗、異常終了時事後処理」は**委譲起動後**の異常終了に対する事後処理である。委譲起動不能（事前判定）と対象段階が異なる。委譲起動失敗時の事後処理（worktree git status 確認、変更残留時の分類、残留箇所の grep 検出、手動修正または PR 化）は `references/harness-delegation.md` を参照する。
