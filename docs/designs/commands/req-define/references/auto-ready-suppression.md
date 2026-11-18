---
title: 未確定内容の auto_ready 抑止
status: accepted
created: "2026-11-19"
updated: "2026-11-19"
---

<!-- 親: docs/designs/commands/req-define.md から参照される詳細仕様（遅延読み込み）。 -->

# 未確定内容の auto_ready 抑止

## 未確定内容の auto_ready 抑止（REQ-008-059）

req-define は、後続工程で決定する必要がある未確定事項、必須内容の欠落、暫定プレースホルダーが `agreed_items` または `artifact_actions` に残る場合、`auto_gate.auto_ready` を `true` にしないこと（REQ-004-047）。
本抑止は REQ-008-030（`artifact_actions` の `content` 完全確定）の強制機構として働く。

### 抑止条件

auto_gate完了ゲートの判定前に、以下の2系統の検査を組み合わせて `auto_gate.auto_ready` を確定する。

#### (A) 決定的マーカー検査

`agreed_items` 各エントリの `content`、`artifact_actions` 各エントリの `content` について、以下の5種の代表マーカーのいずれかを部分文字列として含むか検査する。
検査は意味解釈を伴わない文字列一致（大文字小文字区別なし）とし、QG-1 意味判定（後述 (B)）に先立って機械的に適用する。

| # | マーカー | 意味 |
|---|---|---|
| 1 | `TBD` | 未決定事項の表明 |
| 2 | `TODO` | 未実装・未確定事項の表明 |
| 3 | `未定` | 日本語での未確定表明 |
| 4 | `後続工程で確定` | 後工程への持ち越し表明 |
| 5 | `case-run で確定` | case-run への持ち越し表明（前後の空白有無を許容） |

いずれかのマーカーを検出した場合、`auto_gate.auto_ready: false` とし、検出元の AG-ID（`agreed_items` 由来）または ACT-ID（`artifact_actions` 由来）と検出マーカーを `auto_gate.stop_reasons` へ記録する。

##### 引用・禁止事例の誤検知防止

マーカー文字列が「禁止事項や過去事例の引用」として使われている文は抑止対象外とする。
代表的な引用パターンを以下に示す。
これらは意味判定ではなく、文脈パターンの文字列一致で除外する。

| 引用パターン | 例 |
|---|---|
| 禁止を述べる文 | 「TBD を残さないこと」「TODO を含めないこと」「未定のまま保存しないこと」 |
| 過去事例の引用 | 「前回の TBD 残存事例を参考に」 |
| 検査項目としての言及 | 「TBD/ TODO/ 未定 を検出する」 |

判定は文単位で行う。
マーカーを含む文が上記いずれかの引用パターンに合致する場合、当該文のマーカーを検出扱いとしない。
同一 AG-ID/ ACT-ID 内に引用以外の未確定を示すマーカー出現が残る場合は抑止を維持する。

#### (B) QG-1 意味判定

決定的マーカー検査 (A) に加え、QG-1（Definition Integrity Gate）の意味判定観点（必須フィールド欠落、曖昧要件、測定不能条件）を `agreed_items`/ `artifact_actions` の各エントリへ適用する。
QG-1 が fail となるエントリがある場合、`auto_gate.auto_ready: false` とし、該当 AG-ID/ ACT-ID と QG-1 該当観点を `auto_gate.stop_reasons` へ記録する。

### stop_reasons 記録形式

抑止時に `auto_gate.stop_reasons` へ記録する各エントリは、対象 ID と理由を含む文字列とする。
形式は soft-contract（DEC-003）とし厳格スキーマ検証を導入しないが、少なくとも以下の情報を含むこと。

- 対象 ID（`AG-NNN` または `ACT-{ARTIFACT}-NNN`）
- 抑止理由（検出マーカー、または QG-1 該当観点）
- 該当箇所の要約（マーカー文字列、または欠落フィールド名）

記述例:

```yaml
auto_gate:
  auto_ready: false
  stop_reasons:
    - "ACT-REQ-003: 未確定マーカー 'TBD' が content に含まれる（対象: API仕様）"
    - "AG-005: QG-1 必須フィールド欠落（target_area 未設定）"
```

### 後続ステップへの引き継ぎ

抑止により `auto_ready: false` となった場合、auto_gate完了ゲートの既存手順に従い `stop_reasons` をユーザーへ提示し、壁打ち対話で解消方策を合意する。
合意により未確定事項が解消され、(A)(B) いずれの検査も該当しなくなった場合に限り `auto_ready: true` へ更新する。
ユーザーが「`auto_ready: false` のまま標準フローで手動実行する」と明示的に選択した場合は `conflict_resolutions` へ記録して継続する（REQ-004-048）。
