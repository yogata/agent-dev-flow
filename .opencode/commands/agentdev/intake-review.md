---
description: inbox 内の intake item をレビューし、採用・却下・保留の判定を行う
agent: prometheus
load_skills:
  - agentdev-workflow-lifecycle
  - agentdev-workflow-reporting
---

# Intake Review

`.agentdev/intake/inbox/` 内の intake item をレビューし、各 item について採用可否の判断を行う。

**このコマンドは review・採用可否判断のみを行う。** GitHub Issue の作成・item の変更・後続コマンドの起動は行わない（REQ-0017-025）。

## Input

- レビュー対象の intake item 群（`.agentdev/intake/inbox/` 内の Markdown ファイル）
- ユーザーによる追加コンテキスト・修正指示（対話的に）

## Output

- レビュー結果レポート（ユーザー確認用）
- レビュー結果に基づく item の分類（採用 / 却下 / 保留）

## 判定値

intake-review の判定値は以下の 3 値とする（REQ-0017-028）:

| 判定 | 意味 | 後続 |
|------|------|------|
| `採用` | 対応すべきと判断。req-define または intake-promote に進む | `/agentdev/req-define` または `/agentdev/intake-promote` |
| `保留` | 判断を保留。再度 review 対象として inbox に残す | 再度 `/agentdev/intake-review` |
| `却下` | 対応不要と判断 | アーカイブ |

## Steps

1. **inbox の確認**: `.agentdev/intake/inbox/` 内の intake item を一覧表示する:
   - ファイル一覧の取得
   - item 数のカウント
   - inbox が空の場合はその旨を報告して終了

2. **item の読み込み**: 各 intake item を読み込み、内容を把握する。

3. **レビュー・評価**: 各 item について以下の観点で評価する:
   - 観測内容の妥当性・重要性
   - 影響の程度
   - 対応の緊急度・優先度
   - 既存要件・仕様との関連
   - 対応方針の方向性（要件定義が必要か、既に Issue 化可能か）
   - **learning 分岐判断**: この item は intake ではなく learning に分けるべきものではないか（capture-boundaries.md の split rule 参照）。具体的な修正対象がなく再発防止知見のみの場合は learning に委ねることを推奨

4. **ユーザーとの対話的レビュー**: 評価結果を提示し、ユーザーと対話しながら判定を確定する:
   - 各 item の評価を提示
   - ユーザーの追加コンテキストを受け付ける
   - 判定の修正指示を受け付ける
   - 全 item の判定が確定するまで対話を継続

5. **レビュー結果の整理**: 確定した判定を整理し、結果レポートを生成する:
   ```markdown
   ## Intake Review 結果

   | # | タイトル | 判定 | 後続 | 備考 |
   |---|----------|------|------|------|
   | 1 | ... | 採用 | req-define | ... |
   | 2 | ... | 採用 | intake-promote | ... |
   | 3 | ... | 保留 | - | ... |
   | 4 | ... | 却下 | - | ... |
   ```

6. **item の振り分け**: 判定に基づいて item を振り分ける:
   - `採用` → `.agentdev/intake/accepted/` に移動
   - `保留` → `.agentdev/intake/inbox/` に残す（移動しない）
   - `却下` → `.agentdev/intake/rejected/` に移動

7. **完了報告** → `agentdev-workflow-reporting` の完了報告フォーマットに従って出力:
   ```
   ✅ intake review が完了しました。
     レビュー対象: {N}件
     採用: {A}件（req-define: {R}件, intake-promote: {P}件）
     保留: {H}件
     却下: {D}件
     次のステップ:
       - 採用（要件定義が必要）: /agentdev/req-define
       - 採用（Issue 化可能）: /agentdev/intake-promote
   ```

## Guardrails

### 責務境界（REQ-0017-025, REQ-0019-025）
- G01: GitHub Issue の作成を行わない（`intake-open` が担当）
- G02: 直接 `case-run` を起動しない（REQ-0017-025）
- G03: item の内容を変更・更新しない（判定に基づく振り分けのみ）
- G04: `intake-promote` や `req-define` を自動起動しない（次ステップの提示のみ）
- G05: learning item を作成しない（REQ-0019-025）。learning に分けるべきと判断した item は learning pipeline への委ねを推奨するにとどめる
- G06: learning item の保存・分類・昇華を担当しない（REQ-0019-023）

### 形式制約（REQ-0017-032〜039）
- G07: workflow 管理 artifact として扱わない（REQ-0017-033）
- G08: review 結果を item の本文に書き込まない（REQ-0017-038）
- G09: 状態遷移を item 内に記録しない（ディレクトリ移動のみで表現）
- G10: 後続 artifact への参照を item に追記しない（REQ-0017-039）

### 実行制約
- G11: レビューはユーザーとの対話を通じて行う（AI のみでの自動判定はしない）
- G12: 判定は item ごとに個別に行う（一括判定はユーザーが明示的に指示した場合のみ）
- G13: item の移動先は `.agentdev/intake/` 配下のみ（REQ-0017-035）
- G14: ディレクトリ移動を必須の状態表現として扱わない（REQ-0017-036）
