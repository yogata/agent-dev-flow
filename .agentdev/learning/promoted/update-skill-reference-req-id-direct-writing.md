# 配布物 references の規範参照執筆指針（REQ ID 直書き回避・宣言フィールド名・概念名での記述）

## 背景

case-run RA-005（Case #3162）で、配布物（src/opencode/skills 配下）の references への改訂において規範参照を REQ ID 直書き（例: REQ-059）で記述した結果、IR-055（runtime-unresolved-reference）strict 違反を検出した。stash 差分突合で本変更由来と特定し、fix-and-reverify で REQ ID 直書きを除去して宣言フィールド名・概念名での記述へ置換し再検証合格（1回の fix-and-reverify を要した）。

## 問題

- 配布物 references での REQ ID 直書きは runtime 未解決参照として配布依存境界の検査対象になる（宣言の裏付けのない具体 ID 参照）
- skill-authoring の配布物 skill reference 執筆基準に「REQ ID 直書き回避・宣言フィールド名・概念名で記述する」指針が未明文化で、執筆者ごとに再発の可能性が残る

## 望ましい変更

- 配布物 references の執筆・改訂時に REQ ID 直書きを避け、宣言フィールド名・概念名での記述を標準とする指針を agentdev-skill-authoring の配布物 skill reference 執筆基準へ追加する

## 対象範囲

### 対象

- agentdev-skill-authoring（配布物 skill reference 執筆基準）
- check_integrity IR-055 の該当規約（指針との相互参照候補）

### 対象外

- IR-055 検査契約自体の変更（既存契約どおりの検出であり正規の動作）
- REQ 側の ID 参照方式変更

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill | src/opencode/skills/agentdev-skill-authoring/SKILL.md（配布物 skill reference 執筆基準） | 「宣言フィールド名・概念名で記述する（REQ ID 直書き回避）」指針追加 |
| 配布skill reference | agentdev-skill-authoring references | IR-055 顕在化メカニズムとの相互参照候補 |

## 既存対策確認

- **確認結果**: あり（guardrail insufficiency）
- **該当ファイル**: なし（skill-authoring 執筆基準に REQ ID 直書き回避の指針未明文化）
- **ギャップ分類**: guardrail insufficiency
- **ギャップ詳細**: 検出側の IR-055 契約は正常機能したが、事前の執筆指針がないため fix-and-reverify での後追い修正が発生。近縁 deferred「プレースホルダ除去時の IR-055 baseline delta 再検証必須」は IR-055 顕在化メカニズムの別面。該当 deferred エントリなし

## 制約

- IR-055 は宣言の裏付けのない具体 ID 参照を検出する正規の gate であり、回避指針は検査を弱めるものではなく、検査前に構造的に適合する記述方式へ誘導するもの
- 恒久契約側（docs/ 配下）の REQ ID 参照は対象外（配布物 references の runtime 解決文脈に限定）

## 受け入れ条件

- [ ] 配布物 skill reference 執筆基準に「宣言フィールド名・概念名で記述する」指針が追加されること
- [ ] 指針違反時の IR-055 違反検出との関係が執筆基準から追跡可能であること

## 元 learning item / 根拠

- **要約**: 配布物 references の規篛参照を REQ ID 直書きで書くと IR-055 strict 違反になる執筆指針ギャップ
- **根拠**: inbox「配布物 references の規範参照を REQ ID 直書きで書くと IR-055 strict 違反になる — 宣言フィールド名・概念名での記述が安全」（Case #3162・PR #3165）: check_integrity full-audit で IR-055 違反を検出（stash 差分突合で本変更由来と特定）。REQ ID 直書きを除去し宣言フィールド名・概念名での記述へ置換して再検証合格
- **再発条件**: 配布物（src/opencode/skills 配下）の references で規範参照を REQ ID 直書きで記述する場合
- **横展開可能性**: 配布物 references を編集する全 Case で適用可能。「宣言フィールド名・概念名で書く」記述指針として他の runtime 解決参照文脈にも展開可能

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: documentation
- **関連Issue**: なし
