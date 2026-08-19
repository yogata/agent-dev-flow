# system.md の旧 Step 構成記述が広範に残存（Issue 5箇所スコープ外・約43行）

## 観測

docs/specs/foundations/system.md の主要処理段階・内部workflow候補の記述に、旧 Step 構成（旧 command 番号 Step N 形式）が広範に残存する。req-define・req-save・spec-save・case-open・case-update・case-close・intake-promote・learning-promote・backlog-review・backlog-auto・inspect 系の各コマンド行、約43行。

## 今回扱わない理由

Issue 2238（OU-0023）の対象は5箇所列挙（case-run・intake 系・case-auto Step 7-1）と system.md の当該3行（case-run・intake-capture/intake-from-github・case-auto 行）に限定されていた。上記約43行はスコープ外のため未対応のまま正常に残存する。

## 影響

system.md はシステム仕様の正規文書であり、旧構成記述が現行 STEP 構成と乖離した状態で残る。後続の様式是正が必要。

## レビューで決めること

- 是正の実施単位（system.md 単独の様式是正 case か、他の SPEC 残存と合わせた一括是正か）
- 約43行の全数確認と現行 STEP 構成への対応表作成を含めるか

## 根拠

- PR 2281 本文「Findings / Capture候補」intake 候補1件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2281）
