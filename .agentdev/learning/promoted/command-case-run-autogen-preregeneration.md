# case-run/case-close の AUTOGEN 再生成前置と base drift 対策

## 背景

AUTOGEN 索引（generate_indexes.ts 生成物）の再生成 commit 欠落が後段工程で繰り返し検出されている。PR 2253（docs-only SPEC 変更）では再生成 commit 欠落が case-close E5b 前段 gate で検出され Epic Wave クローズが停止した。Epic 2205 では case-close 自身の SPEC 昇格が新たな索引差分を生んだ。PR 2270 では生成器の計測日導出規則変更を跨いだ OPEN PR の再生成結果が旧規則のままで、マージ後に新規則 dry-run で WOULD UPDATE が検出された。PR 2260 では PR 検証時 base とマージ時点 main の間の他 PR マージにより checker NG 状態が乖離した（base drift）。

## 問題

- case-run が SPEC の行数・status を変える変更（docs-only を含む）で PR 作成前の dry-run 差分確認と再生成 commit を実施しない
- case-close が SPEC 昇格後に dry-run を再実行しておらず、昇格自身の索引差分が後段で発覚する
- AUTOGEN 表を含む Design の正規化で、ブロック本文の直接編集（再生成で上書きされる）と生成元正規化の区別が手順化されていない
- PR 検証時 base とマージ時点 main の乖離（並行マージ・導出規則変更）により、PR 時点で正当な検証結果・再生成結果がマージ後に NG・差分になる

## 望ましい変更

各工程の手順に AUTOGEN 再生成の発火要因確認と dry-run 前置を組み込む:

- case-run の PR 作成手順: SPEC 行数・status を変える変更（docs-only 含む）を含む PR では PR 作成前に `bun run generate_indexes.ts --dry-run` を実行し、WOULD UPDATE があれば再生成を commit する
- case-close の SPEC 確定フロー: 昇格編集後に dry-run を再実行し、差分があれば再生成 commit を case-run 責務として case-auto（委譲元）へ引継ぎ報告する
- AUTOGEN 表を含む成果物の変更: 「生成元の正規化 → generate_indexes.ts 再生成 → 差分全行精査」を標準手順とし、ブロック本文の直接編集を禁止する
- base drift 対策: case-close の post-merge（main）checker / dry-run 再実行を維持し、AUTOGEN 再生成を含む OPEN PR は生成器の規則変更コミットが base に含まれるか（`git merge-base --is-ancestor`）を確認してから再生成する

## 対象範囲

### 対象

- case-run command / agentdev-workflow-case-run の PR 作成手順
- case-close command / agentdev-workflow-case-close の SPEC 確定フロー・post-merge 検証
- AUTOGEN 生成物を含む Design の正規化・更新手順

### 対象外

- generate_indexes.ts 自体の仕様変更（導出規則は a113bd67 で確定済み）
- autogen-freshness-gate Design（draft）の本体変更（検出側は既存）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | src/opencode/skills/agentdev-workflow-case-run/SKILL.md + references | PR 作成手順へ dry-run 前置（SPEC 行数・status 変更時）を追加 |
| skill | src/opencode/skills/agentdev-workflow-case-close/references/ | SPEC 確定フローへ昇格後 dry-run 再実行・引継ぎ報告を追加 |
| spec | docs/designs/workflows/backlog-artifact-lifecycle.md または該当 workflow Design | AUTOGEN 再生成の発火要因と標準手順（生成元正規化→再生成→精査）を明記 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: agentdev-workflow-case-close の E5b 前段 gate（autogen-index-regeneration-diff check）、autogen-freshness-gate Design（draft）
- **ギャップ分類**: application miss
- **ギャップ詳細**: 検出 gate は存在し設計どおり機能したが、case-run の PR 作成前手順に dry-run 前置が組み込まれておらず、発火要因（docs-only 変更・case-close 昇格・生成元正規化・規則変更跨ぎ）の認識が各工程にない。検出は後段に寄り、手戻りが大きい

## 制約

- AUTOGEN 索引ファイルの直接編集・commit は case-close では行わない（E5b 契約どおり停止し case-run 責務へ委譲）
- 再生成は機械生成（generate_indexes.ts）のみ。手書き編集は再生成で上書きされる
- baseline 二重更新禁止: baseline 更新は並列 Wave 実行中に実施しない

## 受け入れ条件

- [ ] case-run の PR 作成手順に「SPEC 行数・status 変更時の dry-run 前置（WOULD UPDATE あれば再生成 commit）」が明記されている
- [ ] case-close の SPEC 確定フローに「昇格後 dry-run 再実行・差分は case-run 責務として引継ぎ報告」が明記されている
- [ ] AUTOGEN 表変更の標準手順（生成元正規化→再生成→差分精査）が文書化されている
- [ ] OPEN PR の規則変更コミット base 包含確認手順が文書化されている

## 元learning item / 根拠

- **要約**: AUTOGEN 索引の再生成欠落と base drift による後段停止の再発防止
- **根拠**: PR 2253（docs-only で再生成欠落、E5b 停止）、Epic 2205（case-close 昇格が差分発火）、PR 2375（AUTOGEN 表は生成元正規化が必要）、PR 2260（checker NG base drift）、PR 2270（計測日規則変更跨ぎ）。評価スコア: A1=30/40、A2=28/40
- **再発条件**: SPEC 行数・status を変える変更で dry-run なし、並行マージ・規則変更を跨ぐ PR
- **横展開可能性**: AUTOGEN 生成物・並行マージ運用を持つプロジェクト全般

## 推奨Issue分類

- **分類**: feature（手順の正式組み込み）
- **推奨ラベル**: enhancement, workflow
- **関連Issue**: Issue 2203（PR 2253）、Issue 2209（Epic 2205）、Issue 2220（PR 2260）、Issue 2241（PR 2270）、Issue 2371（PR 2375）
