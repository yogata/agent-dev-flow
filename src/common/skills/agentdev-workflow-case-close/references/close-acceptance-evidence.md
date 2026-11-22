# 終了前の機械検査と後片付け

case-close の QG-4 で、契約状態記録・残存ファイルと実行担当の後片付けを評価する。終了可否を判断する前に読む。

## 契約状態記録と未追跡残存

pre-merge の `scripts/src/close_mechanical_steps.ts` で `contract-state-residue-check` を必ず実行する。モデルが正規契約から当該 Case の全状態記録パスを導き、`contractStateCheck.contractStatePaths` として渡す。一時保護用の終了判定記録 `.agentdev/close-acceptance/` は含めない。

- 状態記録は `git status --porcelain -- <状態記録パス群>`、未追跡残存は repoRoot 全体の `git ls-files --others --exclude-standard` で判定する。変更ファイルだけの確認で代替しない。
- 既存の恒久承認一覧と照合し、承認済みは報告にとどめる。未コミット、承認外残存、帰属不能は完了扱いにしない。検査は承認を自動追加しない。
- 帰属不能は人間確認を求める。`contractStateCheck.humanConfirmedPaths` には検出と同じ観測形（ディレクトリ接頭辞またはファイルパス）と確認根拠を渡す。確認なしに進めない。必要な Git 検査自体が不能なら本文の検査不能規則を適用する。
- `isCloseOperationPermitted` が終了を許可するまで Issue 終了・Epic 終了・Wave クローズを行わない。

## 検証用資材の後片付け

PR・Issue・SSoT コメントから片付けの実施結果、根拠、未処理事項を取得する。申告だけで受理しない。対象の同一性、範囲（共有物・リンク先を含む）、常備環境の利用終了条件を証拠で確認する。引継ぎは受け手・対象・状態・残る処置を確認する。管理・観測していない任意資材の不存在証明は要求しない。

既知の残存、証拠不足、回収失敗、引継ぎ不成立、確認不能を区別し、対応対象・不足・再開条件を報告して受入を拒否する。検証成功と後片付け未達を区別する。機械工程が終了判定記録を発行し、判定に必要な間だけ保護して post-merge で回収する。
