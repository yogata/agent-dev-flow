# X-2 em-dash 本体（「 — 」同格・補足・言い換え）は文脈判定必須のため機械置換対象外

## 発生源

- Issue: #1118 (partial)
- PR: #1122 (merged, squash bb13183)
- 発生日: 2026-06-24

## 内容

X-2 em-dash には2系統存在する。本 PR #1122 で対応したテーブルセル `| — |`（N/A プレースホルダ用途）は機械安全置換で対応可能だったが、**本体の ` — `（同格・補足・言い換え）は 370 件 / 86 ファイル**（retired・`src/opencode-local` 含む全件）に上り、文脈判定が必須のため機械置換対象外である。

`src/opencode/skills/agentdev-doc-writing/references/mechanical-replacement-rules.md` section 2 は「置換後の選択（括弧か句点か）は査読対象」と明記しており、自動化の余地を残していない。横断是正には複数 PR への分割が現実的。

## 推奨対応先

別 Issue として切り出すことを推奨。作業候補:

- 対象 86 ファイルをディレクトリ群（docs/requirements, docs/adr, docs/specs, docs/guides, src/opencode/commands, src/opencode/skills, AGENTS.md）ごとに分割し、ディレクトリ単位の PR を連続実施する
- 各出現箇所で「括弧展開」「句点分割」「ママ」のいずれかを査読で判断する
- `src/opencode-local/` は 7 ディレクトリスコープ外のため、本 Issue #1118 の対象外であることを明示したうえで別途扱う

## 現在の追跡状態

- PR #1122 Findings / Capture候補（F-1）に記録済み
- 別 Issue 化: 未実施（本 intake が作業候補の起点）
