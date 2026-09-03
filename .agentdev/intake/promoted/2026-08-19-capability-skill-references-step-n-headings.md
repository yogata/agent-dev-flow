# Capability Skill references 内の `### Step N` 見出し群の是正要否

## 観測内容

Capability Skill の references に `### Step N` 形式の見出しが残存する。

- `agentdev-learning-pipeline`: 2 件
- `agentdev-learning-capture`: 12 件
- `agentdev-req-analysis`: 4 件

PR 2153 の変換対象（16 Workflow Skill）外のため未変換のまま。PR #2264（Issue #2225）の確認対象は command-file-format SPEC (a)(b)(c) の正規記載と Workflow Skill 16件の整合であり、Capability Skill references は対象外だった。SPEC (b) は SKILL.md の工程一覧表ラベルを対象としており、references 手順見出しへの適用可否は自明でない。

2026-09-03 現行確認: 3 skill の references 配下に `### Step ` 見出しが 22 件残存しており、観測は現行 main で再現する。

## 影響

工程・サブステップ識別子様式の運用が Workflow Skill と Capability Skill references で分かれた状態が継続する。

## 課題（レビューで決めること）

- references 手順見出しへのサブステップ形式適用の要否（様式の適用対象を references へ拡張するか、references 見出しは様式対象外と明文化するか）

## 既存要件・契約との関連

- command-file-format Design（docs/designs/authoring/command-file-format.md）の「順序ラベル様式」節と Capability Skill references の適用範囲境界。

## 根拠

- PR 2264 本文「Findings / Capture候補」intake 小見出し2件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2264 ）
- 2026-09-03 機械確認: `### Step ` 見出し 22 件（learning-pipeline / learning-capture / req-analysis の references 配下合計）
