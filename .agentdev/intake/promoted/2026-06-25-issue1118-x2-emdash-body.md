# X-2 em-dash 本体（同格・補足・言い換え）は文脈判定必須のため機械置換対象外

## 観測内容

X-2 em-dash には 2 系統存在する。
本 PR #1122 で対応したテーブルセル `| — |`（N/A プレースホルダ用途）は機械安全置換で対応可能だった。
一方、本体の ` — `（同格・補足・言い換え）は 370 件 / 86 ファイル（retired・`src/opencode-local` 含む全件）に上り、文脈判定が必須のため機械置換対象外である。
`src/opencode/skills/agentdev-doc-writing/references/mechanical-replacement-rules.md` section 2 は「置換後の選択（括弧か句点か）は査読対象」と明記しており、自動化の余地を残していない。

## 影響

横断是正には複数 PR への分割が現実的である。
`src/opencode-local/` は 7 ディレクトリスコープ外のため、別途扱う必要がある。

## 課題

370 件 / 86 ファイルの em-dash 本体を文脈判定を伴う査読で是正する。

## 既存要件との関連

- Issue #1118（partial）、PR #1122（merged, squash bb13183）
- 機械判定基準: `mechanical-replacement-rules.md` section 2
- スコープ: 7 ディレクトリ（`src/opencode-local/` は対象外）

## 対応方針の方向性

- 対象 86 ファイルをディレクトリ群（docs/requirements, docs/adr, docs/specs, docs/guides, src/opencode/commands, src/opencode/skills, AGENTS.md）ごとに分割し、ディレクトリ単位の PR を連続実施する
- 各出現箇所で「括弧展開」「句点分割」「ママ」のいずれかを査読で判断する
- `src/opencode-local/` は本 Issue #1118 の対象外であることを明示したうえで別途扱う
