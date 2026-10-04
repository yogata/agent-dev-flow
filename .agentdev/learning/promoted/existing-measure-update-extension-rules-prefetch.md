# project extension rules 読込前置による書込み前適用漏れの解消

## 背景

2026-10-03〜05 の case-open 並行委譲実行で、project extension rules（yomiyasu-application-before-write・REQ-098 系）の読込が docs 編集・GitHub 書込みより後段に配置され、投稿後の遡及 lint 適用で回復する適用順序違反が4件の独立した委譲実行（Case #3333・#3335・#3340/#3352・#3440）で再現した。extension は fail-open のため適用漏れが silently 継続する構造的リスクが実証された。

## 問題

workflow 委譲実行時に project extension（`.agentdev/extensions/skills/<workflow>.yaml`）の rules を読み込む契機が手順化されておらず、SKILL.md 制御平面と references だけを根拠に進行すると、extension 側 rules にのみ存在する書込み前プロシージャ（yomiyasu 読込・lint 確認）が初回 GitHub 書込み・docs 編集に適用されない。

## 望ましい変更

各 workflow skill の STEP reference および委譲 prompt テンプレートに「最初の GitHub 書込み・docs 編集の前に project extension rules を読み込み、適用契機を確認する」前置ステップを明示する。case-open の STEP-2（Root Case 作成）より前に extension 読込を配置する。

## 対象範囲

### 対象

- `src/common/skills/agentdev-workflow-case-open/references/root-case-and-definition-package.md`（STEP-1/2 前置手順。2026-10-05 時点で extension 前置の記述なしを実測済み）
- case-open 委譲 prompt を生成する orchestration 側（case-auto / backlog 由来委譲指示）のテンプレート・指示面
- 同種の書込み前プロシージャを持つ extension を持つ他 workflow（case-run・case-close 等）の横断確認

### 対象外

- extension 機構自体の仕様変更（fail-open 性質の変更）
- yomiyasu skill 本体の変更

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補である。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | src/common/skills/agentdev-workflow-case-open/references/root-case-and-definition-package.md | STEP-1 入力解決への extension rules 読込前置の明示 |
| 配布skill | src/common/skills/agentdev-project-extensions/ | 読込契機規約（workflow 側の読込タイミング指針）の整備 |
| REQ | docs/requirements/REQ-098.md 系 | 適用契機の明確化（必要な場合） |

## 既存対策確認

- **確認結果**: 既存対策あり（不備）
- **該当ファイル**: case-open SKILL.md L76（agentdev-project-extensions の Capability Skill 連携列挙）、`.agentdev/extensions/skills/agentdev-workflow-case-open.yaml` rules
- **ギャップ分類**: fix gap + application miss
- **ギャップ詳細**: 連携列挙は存在するが読込契機（書込み前という適用契機）は extension 側 rules にのみ記述され、workflow 手順側に前置がない。委譲実行者が SKILL.md のみを読むと適用漏れが生じる（4件で実証）

## 制約

- extension の fail-open 性質は維持する（変更しない）
- 既存 STEP 構成（6 STEP）を変えず、reference・委譲指示への追記で対応する
- REQ-098 系の現行契約（編集前読込・投稿前推敲・lint）の内容は変更しない

## 受け入れ条件

- [ ] case-open 委譲実行で Root Case 本文・Definition PR 本文の投稿前に extension rules が読み込まれ、yomiyasu 適用が書込み前に完了する
- [ ] 委譲 prompt テンプレートに extension 読込の前置指示が含まれる
- [ ] 同種の extension を持つ workflow での横断確認結果が記録される

## 元learning item / 根拠

- **要約**: project extension rules 読込の後置による書込み前適用漏れ（yomiyasu 遡及適用）が case-open 並行委譲で4件反復
- **根拠**: Case #3333（OU-002・遡及 lint 3対象）、Case #3335（OU-006・STEP-5 で extension 発見）、Case #3340/#3352（OU-011/012・2例目の再発で構造的リスク実証）、Case #3440（Root Case 本文未推敲で投稿、後続投稿は適用済み）
- **再発条件**: extension rules に書込み前プロシージャを持つ workflow の委譲実行で読込前置が手順化されていない場合
- **横展開可能性**: GitHub 書込み・docs 編集を持つ ADF workflow 全般（case-open/case-run/case-close/case-revise）

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: bug, workflow
- **関連Issue**: なし（Case #3333・#3335・#3340・#3352・#3440 は完了済み）
