# pr_create 前段の head branch push（refspec 検査込み）手順明記

## 背景

Case #3142（case-open STEP-4）で Definition branch を worktree 上で新規作成し commit 済み・push 前の状態で agentdev_gh pr_create を呼出したところ HTTP 422 Validation Failed で失敗した。 branch の新規作成と push は呼出側の前段操作であり、Custom Tool は push を内部で行わない。 同種事象は 2026-09-16 にも発生している（push 先誤指定経路）。

## 問題

- agentdev_gh pr_create は GitHub 側に head branch が存在しない場合 PR を作成できない（構造化 failure: kind operation-failed, detail gh: Validation Failed (HTTP 422)）
- 対象 workflow reference（case-open / case-revise の Definition PR 作成手順）に「pr_create 前に head branch を origin へ push する」前段手順の記述がない（grep 検証済み: definition-pr-and-idempotency.md の pr_create 言及は L34 のみ）

## 望ましい変更

case-open / case-revise の Definition PR 作成手順に、pr_create の前段として head branch の push 手順（push 先 refspec の検査込み）を明記する。

## 対象範囲

### 対象

- agentdev-workflow-case-open references/definition-pr-and-idempotency.md（Definition PR 作成節）
- agentdev-workflow-case-revise の Definition Amendment PR 同等手順

### 寬象外

- agentdev_gh pr_create 操作契約・REQ-083 の変更（既存契約の範囲内）
- gh CLI への切替（書込み操作のため切替範囲外）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | src/opencode/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md | pr_create 前段の push 手順・refspec 検査を明記 |
| 配布skill reference | src/opencode/skills/agentdev-workflow-case-revise/references/ 配下の Amendment PR 手順 | 同前段手順を明記 |

## 既存対策確認

- **確認結果**: なし（fix gap）
- **該当ファイル**: definition-pr-and-idempotency.md（pr_create 手順あり、push 前段なし）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: push 前段手順の未記載。読み取り切替継続手順（gh CLI 切替）は書込み系 422 に言及なし

## 制約

- 配布物本文への canonical 参照は節名のみで記述する（concrete ID 直書き禁止）
- git push は worktree 上の branch で `-u origin definition/issue-{N}` 形式

## 受け入れ条件

- [ ] case-open / case-revise の reference で pr_create 前に push 前段が読み取れること
- [ ] push 先 refspec の確認手順が含まれること（誤指定経路の再発防止）

## 元 learning item / 根拠

- inbox 2026-09-26「agentdev_gh pr_create は head branch 未 push 状態で HTTP 422 を返す」（Case #3142、PR #3147）: 前段省略経路。git push -u origin definition/{branch} の前段実行で作成成功（VERIFY 通過）
- deferred「case-open が Definition 変更を main へ直接 push し Draft Definition PR を作成不能にした」（移動日 2026-09-16、Case #2870 系）: push 先誤指定経路で同一結果 422。予防策候補 (3) が pr_create 失敗時の head branch push 状態確認手順の reference 明記
- 関連： REQ-083（definition/issue-{N}）
