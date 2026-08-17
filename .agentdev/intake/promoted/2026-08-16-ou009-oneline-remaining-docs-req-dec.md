# 一文一行機械判定違反の未是正残存（docs/requirements・docs/decisions、編集禁止領域）

## 観測内容

X-4 一文一行機械判定で docs/requirements/** に 11 違反行、docs/decisions/** に 46 違反行が残存する。OU-009 の対象範囲宣言では当該領域を編集禁止（要件・意思決定の本文は機械是正対象外）としたため未是正のまま残った。merged main d903f85b 時点でも残存する（case-close QG-4 の再計測でも同領域は除外計測）。

## 影響

- 機械判定の全体違反計数に恒常的な残存 57 違反行が含まれ、新規違反の検出感度が下がる

## 課題

編集禁止領域の扱い（要件本文への機械是正の可否、または個別読み下し是正）を政策的に判断した上で、残存 57 違反行の是正方針を決定する。要件・Decision 本文の改変は各文書の更新手続き（req-save / Decision 更新）を経るべきかも含めて検討する。

## 既存要件・成果物との関連

- SPEC: mechanical-replacement-rules.md §4（一文一行機械判定）
- 関連: 2026-08-16-ou009-oneline-remaining-distribution.md（配布物側 716 違反行、統合候補）

## 出典

- 発生日: 2026-08-16
- 発生源: PR #2154 (Issue #2143 / OU-009, Epic #2134 Wave 3) Findings / Capture候補 セクション intake 1 の docs 側
- 元 item: intake-2026-08-16-ou009-oneline-remaining-docs-req-dec.md
