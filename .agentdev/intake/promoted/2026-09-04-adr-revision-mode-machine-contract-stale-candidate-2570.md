# adr-revision-mode 機械契約値の陳腐化

## 観測内容
`req-save-procedure.md` に `adr-revision-mode: full-reclassification` が残るが、draft 生成側にこの値の書き手がなく、DEC-009 移行後の旧称も含む。

## 影響
実際には付与されない機械契約値と規約行だけが残り、reader の有無や語彙の現行性を誤認させる。

## 課題
値を `decision-revision-mode` 等へ改名するか、reader の不存在を確認して規約行を撤去するかを判断する。

## 既存要件・正規成果物との関連
PR #2593、Issue #2570、`agentdev-req-file-manager/references/req-save-procedure.md` §22、DEC-009。
