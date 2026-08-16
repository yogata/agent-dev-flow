# Intake Item: IR-055 template placeholder exemption の行単位免除がプレースホルダ残置を助長する副作用の検討

## 発生源

- PR: #2187 (Issue #2182 / OU-005, Epic #2178 Wave 2)
- 発生 phase: case-run 実装
- capture 分類: intake（SPEC確定候補、backlog 化）

## 問題

IR-055 の template placeholder exemption は行単位の免除（{...} を含む行全体を検査対象外）のため、プレースホルダ表記の残置を構造的に助長する副作用を持つ。PR #2187 ではプレースホルダ除去により隠蔽されていた src/opencode/、repo-local、docs/specs/ 参照 6 件が新規違反として顕在化し、即時修正した。

## 推奨対応

exemption を「プレースホルダと同一トークン近傍」へ狭めるか、exempt 行でも strict パターンは検査する仕様変更を integrity-rule-catalog 側で検討する。SPEC 本文の確定は backlog 化する。

## 関連

- Issue: #2182 (CLOSED), Epic: #2178
- PR: #2187 (SPEC確定候補 セクション 2)