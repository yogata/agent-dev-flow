# IR-055 template placeholder exemption の行単位免除がプレースホルダ残置を助長する副作用の検討

## 観測内容

IR-055 の template placeholder exemption は行単位の免除（{...} を含む行全体を検査対象外）のため、プレースホルダ表記の残置を構造的に助長する副作用を持つ。PR #2187 ではプレースホルダ除去により隠蔽されていた src/opencode/、repo-local、docs/specs/ 参照 6 件が新規違反として顕在化し、即時修正した。

## 影響

- プレースホルダ表記が残る限り検査が実質無効化され、配布物・docs の参照違反が潜在化する

## 課題

exemption を「プレースホルダと同一トークン近傍」へ狭めるか、exempt 行でも strict パターンは検査する仕様変更を integrity-rule-catalog 側で検討する。

## 既存要件・成果物との関連

- 対象: integrity-rule-catalog（IR-055）
- 実績: PR #2187（隠蔽 6 件の顕在化と即時修正）
- 関連: 2026-08-16-spec-cand-ir055-exemption-new-delta-emergence.md（新規 delta 顕在化の文面化、統合候補）

## 出典

- 発生日: 2026-08-16
- 発生源: PR #2187 (Issue #2182 / OU-005, Epic #2178 Wave 2) SPEC確定候補 セクション 2
- 元 item: intake-2026-08-16-spec-cand-ir055-exemption-narrowing.md
