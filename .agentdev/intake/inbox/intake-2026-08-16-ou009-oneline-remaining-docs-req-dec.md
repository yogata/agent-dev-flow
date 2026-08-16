# Intake Item: 一文一行機械判定違反の未是正残存（docs/requirements・docs/decisions、編集禁止領域）

## 発生源

- PR: #2154 (Issue #2143 / OU-009, Epic #2134 Wave 3)
- 発生 phase: case-run 検証（ReportOnly 機械判定による計測）および case-close QG-4 再検証
- capture 分類: intake（横断是正の後続候補。OU-009 は docs/requirements/**、docs/decisions/** を編集禁止領域として対象外とした）

## 問題

X-4 一文一行機械判定で docs/requirements/** に 11 違反行、docs/decisions/** に 46 違反行が残存する。
OU-009 の対象範囲宣言では当該領域を編集禁止（要件・意思決定の本文は機械是正対象外）としたため未是正のまま残った。
merged main d903f85b 時点でも残存する（case-close QG-4 の再計測でも同領域は除外計測）。

## 推奨対応

編集禁止領域の扱い（要件本文への機械是正の可否、または個別読み下し是正）を政策的に判断した上で、残存 57 違反行の是正方針を決定する。
要件・Decision 本文の改変は各文書の更新手続き（req-save / Decision 更新）を経るべきかも含めて検討する。

## 関連

- Issue: #2143 (CLOSED), Epic: #2134
- PR: #2154 (Findings / Capture候補 セクション intake 1 の docs 側)
