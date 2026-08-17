# mechanical-replacement-rules.md §4 の ordered list 行の扱い明文化（SPEC確定候補）

## 観測内容

mechanical-replacement-rules.md §4（一文一行機械判定）はリスト行の定義を「`- ...`/`* ...`」のみ列挙しており、ordered list（`1. `）行の扱いが明文でない。実装（apply-mechanical-replacement.ps1 のリスト判定 `^\s*[-*+]\s`）と過去是正 PR（#1091）の実績では ordered list 項目は prose として分割し、継続文はマーカーなしの後続行（lazy continuation）とする運用である。

## 影響

- ordered list 適用時の機械判定結果が SPEC 文面から導出できず、実装・実績依存の運用となっている

## 課題

spec-save 経由で §4 に ordered list 項目の扱い（prose として分割、継続文はマーカーなし後続行）を明文化する。

## 既存要件・成果物との関連

- SPEC: mechanical-replacement-rules.md §4（一文一行機械判定）
- 実装: apply-mechanical-replacement.ps1（リスト判定 `^\s*[-*+]\s`）
- 実績: PR #1091

## 出典

- 発生日: 2026-08-16
- 発生源: PR #2154 (Issue #2143 / OU-009, Epic #2134 Wave 3) SPEC確定候補 セクション 1
- 元 item: intake-2026-08-16-spec-cand-mechanical-replacement-ordered-list.md
