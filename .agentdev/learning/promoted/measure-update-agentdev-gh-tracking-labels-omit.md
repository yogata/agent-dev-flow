# agentdev_gh tracking Issue の本文のみ更新では labels 引数を省略する（read-back 検証失敗の予防と復帰）

## 背景

case-close で追跡Issue（#2966・role tracking）の段階一覧表行を更新する際、`agentdev_gh` issue_update に labels を現行値どおり明示渡したところ、GitHub 側には本文が正しく反映されているにもかかわらず Tool の read-back 検証が verification-incomplete（fail-closed・retryable false）を返した。Case #3036（第13段）と Case #3038（第14段）で同一現象が再発し、通算 3 回（2 Case）を数える。予防策が skill・手順へ昇華される前のため同一操作形式で再発した実績があり、当該エントリ自身が早期昇華候補と明記していた。

## 問題

tracking role の Issue は tracking 軸の物理ラベル写像を Tool 内部で管理しており、issue_update への labels 明示渡しが read-back 検証パスと干渉する。本文のみを更新したい場面で labels を渡すと、本文適用は成功しているのに検証だけが失敗し、冗長な再実行または durable state の手動確認を強いられる。case role の Issue（labels 明示渡しで成功）では発生しない、tracking 軸に特有の失敗である。

## 望ましい変更

1. 本文のみを更新する issue_update では labels 引数を省略する（不変ラベルは Tool が保持する）運用を、agentdev-issue-tracking の操作知識として明記する
2. verification-incomplete 応答時の復帰手順として「独立 issue_read で GitHub 側適用状態を確認 → 適用済みなら再実行せず完了・未適用なら labels 省略で冪等再実行」の二段構えを明記する
3. ラベル操作が必要な場合は labels 引数ではなく trackingState / kind の論理値で指示する原則を併記する

## 対象範囲

### 対象

- agentdev-issue-tracking Skill（操作表・操作知識。更新操作の labels 取扱い）
- agentdev_gh を呼び出す各 workflow（case-close の段階一覧表更新等）での呼出形式

### 対象外

- agentdev_gh Tool 内部の検証実装（物理ラベル写像の再実装は Tool 内実装の責務であり、本成果物は Tool 改修を要求しない）
- case role の Issue 操作（本事象は tracking 軸に特有）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補である。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill | src/opencode/skills/agentdev-issue-tracking/SKILL.md | 操作表の更新行に「本文のみ更新では labels を省略」を追記。検証失敗時の復帰手順（独立 read-back → 分岐）を操作知識へ追記 |
| 配布skill | src/opencode/skills/agentdev-issue-management/references/issue-operation-safety.md | 操作後 VERIFY 手順に「verification-incomplete 時は issue_read で独立確認してから再実行可否を判断」の注記候補 |
| knowledge | docs/knowledge/（新規候補） | agentdev_gh 呼出形式の tracking 例外として知識文書化する候補 |

## 既存対策確認

- **確認結果**: あり
- **該当ファイル**: src/opencode/skills/agentdev-issue-tracking/SKILL.md（操作表 L51-52）、src/opencode/skills/agentdev-issue-management/references/issue-operation-safety.md（VERIFY 手順）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 操作表の更新行は `issue_update（title、body、labels）` と labels を引数として列挙するのみで、本文のみ更新時の labels 省略規則・tracking 軸での干渉・検証失敗時の復帰分岐が未記載。issue-operation-safety.md の VERIFY は操作後検証の手順は持つが verification-incomplete 応答の解釈と再実行判断を扱わない

## 制約

- agentdev_gh の物理ラベル写像の再実装・改修は本成果物の対象外（Tool 内実装の責務）
- fail-closed 挙動自体は維持する（迂回・解除ではなく呼出形式の規約化）
- case role では labels 明示渡しが成功しているため、操作表の記載は tracking 軸に限定した例外として明示する

## 受け入れ条件

- [ ] agentdev-issue-tracking の操作表・操作知識に「本文のみ更新では labels 省略」が記載されていること
- [ ] verification-incomplete 時の復帰手順（独立 issue_read → 適用済みなら完了・未適用なら labels 省略冪等再実行）が記載されていること
- [ ] ラベル操作が必要な場合の trackingState / kind 論理値指定の原則が記載されていること

## 元learning item / 根拠

- **要約**: tracking Issue の issue_update で labels を明示渡すと read-back 検証だけが失敗する（本文反映は正常）。labels 省略で予防でき、検証失敗時は独立 read-back で分岐復帰する
- **根拠**: Case #3036（2026-09-20・第13段・#2966 段階一覧表 13 行更新）で発生。labels 省略の冪等再実行で検証付き成功を取得。Case #3038（2026-09-20・第14段・14 行更新）で同一現象が再発（通算 3 回・2 Case）。同セッション内の case role 本文更新（labels [feature] 明示渡し）では発生せず tracking 軸特性を確認
- **再発条件**: tracking role の Issue へ labels を明示渡して issue_update する場合（予防策の昇華前に同一操作形式を実施した場合）
- **横展開可能性**: 他プロジェクトでも GitHub API のラベル管理を Tool 内部に隠蔽する構成で発生し得る。本 repo では全 workflow の tracking Issue 更新に適用

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: documentation, workflow
- **関連Issue**: Case #3036、Case #3038、#2966
