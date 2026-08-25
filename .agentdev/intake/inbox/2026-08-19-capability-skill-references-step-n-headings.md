# Capability Skill references 内の `### Step N` 見出し群の是正要否

## 観測

Capability Skill の references に `### Step N` 形式の見出しが残存する。

- `agentdev-learning-pipeline`: 2 件
- `agentdev-learning-capture`: 12 件
- `agentdev-req-analysis`: 4 件

PR 2153 の変換対象（16 Workflow Skill）外のため未変換のまま。

## 今回扱わない理由

PR #2264（Issue #2225）の確認対象は command-file-format SPEC (a)(b)(c) の正規記載と Workflow Skill 16件の整合であり、Capability Skill references は対象外。SPEC (b) は SKILL.md の工程一覧表ラベルを対象としており、references 手順見出しへの適用可否は自明でない。

## 影響

工程・サブステップ識別子様式の運用が Workflow Skill と Capability Skill references で分かれた状態が継続する。

## レビューで決めること

- references 手順見出しへのサブステップ形式適用の要否（様式の適用対象を references へ拡張するか、references 見出しは様式対象外と明文化するか）

## 根拠

- PR 2264 本文「Findings / Capture候補」intake 小見出し2件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2264）
