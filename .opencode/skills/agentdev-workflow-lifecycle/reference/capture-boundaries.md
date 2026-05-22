# Intake / Learning 境界定義

AgentDevFlow の intake workflow と learning pipeline の責任境界を定義する SSoT。

## 定義

| 領域 | 定義 | 保存先 | 目的 |
|------|------|--------|------|
| **intake** | 今回の作業本筋では扱わないが、後で対応要否を判断すべき具体的な作業候補・不整合・規約違反・未回収課題 | `.agentdev/intake/inbox/` | 積み残し作業の回収・Issue化 |
| **learning** | 作業中の失敗・回避・修正・判断ミス・手順漏れから次回以降の再発防止に使う知見 | `.agentdev/learning/` | 知見の分類・昇華・コマンド/スキル/テンプレートへの反映 |

## 判断質問

観測を記録する際、以下の質問で intake と learning を区別する:

1. **「後で対応すべき具体的な修正対象があるか？」** → **YES = intake**
   - 具体的に直すべきファイル・設定・ドキュメント・不整合が特定できる
2. **「次回同じ失敗を防ぐ知見があるか？」** → **YES = learning**
   - 再発条件・根本原因・予防策が記述できる
3. **「両方あるか？」** → **分割する**（intake item + learning item を別々に作成）

## Split Rule

```
具体的修正対象がある → intake item
再発防止知見がある → learning item
両方ある → 分割（intake item + learning item を別々に作成）
どちらでもない → 記録対象外（完了報告に候補として提示）
```

**禁止**: intake を learning pipeline の前段として扱わない。`intake-promote` は learning pipeline の入力を生成しない。

## 代表例と非対象例

### 代表例

| 観測 | 判定 | 理由 |
|------|------|------|
| コマンド定義の typo 発見 | intake | 具体的な修正対象が特定できる |
| REQ 番号の重複発見 | intake | 不整合の修正対象が明確 |
| CI 失敗を回避するためにワークアラウンドを実施 | learning | 再発防止知見 |
| テンプレートの必須セクション欠落を発見・修正 | learning | 手順漏れの知見 |
| 既存コードに規約違反を発見しつつ、修正過程で gh CLI のエスケープ問題に遭遇 | intake + learning（分割） | 規約違反は修正対象（intake）、gh CLI 問題は再発防止知見（learning） |
| integrity-check で orphan ADR を検出 | intake | 修正対象が明確 |
| case-run で自己修正ループに入り、原因がテンプレートの不備だった | learning | 再発防止知見 |

### 非対象例

| 観測 | 判定 | 理由 |
|------|------|------|
| 「もっと良い書き方がありそう」 | 記録対象外 | 具体的な修正対象も再発防止知見もない曖昧な感想 |
| ユーザー指示の追加要件 | 記録対象外 | 通常の Issue / REQ 扱い |
| 将来的な改善アイデア | 記録対象外 | 具体的な修正対象ではない（別途要件化が必要） |

## 具体例: 同じ観測からの分割

**観測**: `case-run` で `intake-promote.md` を編集中、`system.md` の記述と矛盾を発見。さらに、command-map.md の intake フロー説明が旧い（`intake-promote → learning pipeline` と書かれている）。

**分割結果**:

1. **intake item**: `system.md` の intake-promote 記述（49行目）が REQ-0019 と矛盾。修正対象: `docs/specs/system.md` line 49
2. **learning item**: command-map と REQ の整合性を case-run が自律確認できなかった。再発条件: 複数 command file 間で後続ルートの整合性が必要な場合。予防策: case-run Step 8（乖離検出）に docs/specs 内の後続ルート整合性確認を含める検討

## 各 Command の参照ルール

| Command / Skill | 参照すべきルール |
|-----------------|-----------------|
| `intake-capture` | 具体的な修正対象があるもののみを intake item として保存。作業知見のみの内容は対象外 |
| `intake-from-github` | 抽出候補が積み残し作業候補（intake）か再発防止知見（learning）かを区別し、intake のみを保存 |
| `intake-review` | review 観点に「learning に分けるべきか」を含める。learning item は作成しない |
| `intake-promote` | review 済み intake item を req-define または intake-open 用の入力 artifact にのみ整形。learning pipeline の入力は生成しない |
| `intake-open` | intake item 群から learning item を作成しない |
| `agentdev-learning-capture` | intake item を作成しない。具体的な修正対象が残る場合は intake workflow に委ねる |
| `integrity-check` | finding は原則 intake 対象。発生原因や予防策がある場合のみ learning 対象にもなりうるが、learning item の直接作成はしない |
| `case-close` | post-run capture で intake と learning を別成果物として扱う。混ぜた単一成果物にしない |

## 参照

- **REQ-0019**: intake / learning の責任境界明確化と workflow 組み込み（親要件）
- **REQ-0017-032**: intake item 定義（learning item 含まず）
- **REQ-0017-032a**: intake-promote の後続制約（learning pipeline 入力生成禁止）
- **REQ-0007**: ナレッジパイプライン高度化
- **REQ-0013**: intake 承認フロー分割
