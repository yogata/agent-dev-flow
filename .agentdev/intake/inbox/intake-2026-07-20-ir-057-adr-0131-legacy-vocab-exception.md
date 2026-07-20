# ADR-0131 IR-057 legacy vocab 例外判定ルール検討候補

## 由来
- PR #1642 (squash merge: 863f81f4), Issue #1636, Epic #1635 Wave 1
- targeted docs guard (check_changed_docs.ts --workflow case-close) で検出
- PR 本文 Findings/docs-integrity セクション記載

## 現状

`docs/adr/ADR-0131.md` に IR-057 (legacy-local-generation-vocab) の strict failure 3 件が存在:

- line 19: 「直接生成方式」
- line 26: 「transform/generate.md」
- line 44: 「transform/generate.md」

これらは ADR-0131 が link mode 移行判断を記録する歴史 ADR であり、背景説明上やむを得ず旧語彙（直接生成方式、transform/generate.md）を引用するために発生している。

Epic #1635 Wave 1 (Issue #1636) の変更（AG タグ除去と updated date 更新）に起因しない既存 failure。本変更は ADR-0131 line 11 の (AG-003、TS-003 pass_criteria 例外) タグ除去と updated date 更新のみで、IR-057 検出語彙の追加・削除を行っていない。

## 候補内容

IR-057 (legacy-local-generation-vocab) に ADR-0131 の例外判定ルールを追加するかどうかを検討:

### 選択肢 A: 例外判定ルール追加
- IR-057 ルールに「歴史 ADR における引用語彙は例外とする」判定を追加
- メリット: 歴史 ADR の記述制約を解消
- デメリット: 例外ルールの濫用リスク、IR-057 の厳格性低下

### 選択肢 B: 歴史 ADR の表現工夫
- ADR-0131 の旧語彙をコードブロック引用や footnote 形式へ変更し、IR-057 検出パターンから回避
- メリット: IR-057 厳格性維持
- デメリット: ADR 本文の可読性低下、改修コスト

### 選択肢 C: 現状維持（known issue として記録）
- ADR-0131 の 3 failure を既知 issue として記録するのみ
- メリット: コスト最小
- デメリット: targeted docs guard が常に 3 failure を報告し続ける

## 想定反映先
- `docs/specs/integrity/rules/` 配下の IR-057 定義（例外判定追加時）
- `docs/adr/ADR-0131.md`（表現工夫時）
- `.opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts`（IR-057 実装）

## 優先度
low（既存 issue、機能影響なし、targeted docs guard は警告を継続表示するが動作阻害なし）

## 関連
- Epic #1635 Wave 1: Issue #1636, PR #1642
- IR-057: legacy-local-generation-vocab
- ADR-0131: link mode 移行判断（歴史 ADR）
