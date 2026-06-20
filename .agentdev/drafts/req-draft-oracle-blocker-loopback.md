---
draft_type: req_draft
topic_slug: oracle-blocker-loopback
status: saved
created_at: 2026-06-20T22:30:00+09:00
source_rus: []
---

# draft-data

```yaml
# work_type: maintenance（既存仕様の実装ギャップ修正。新規ユーザー向け機能ではない）
work_type: maintenance

# scale: maintenance は未設定でよい

# summary: 選択肢A。req-define Step 4-4 の oracle ブロッカー/未決事項時の差し戻し経路を、
# QG-1 と同じ明示形式で追加する。併せて REQ-0139 に分類結果アクション規定を補完し、
# architecture-advisory スキルの表現を整合させる。auto_gate.auto_ready は後続コマンド
# 専用シグナルとして維持し、req-define 内部ループのトリガにはしない。
summary: |
  req-define Step 4-4（アーキテクチャ確認）において、oracle 助言の4分類（確定・推定・
  ユーザー確認・ブロッカー）結果に基づく差し戻し経路が暗黙であり、QG-1（Step 6-0）や
  ユーザー確認（Step 10）のような明示的ループバック記述が欠落していた。このギャップを
  3層（REQ・コマンド・スキル）で閉じる: (1) REQ-0139 に分類結果アクション規定を追加、
  (2) コマンド Step 4-4 に QG-1 と同形式の差し戻し文を追加、(3) architecture-advisory
  スキルの「完了しない」を受動表現から「Step 2 へ差し戻す」能動表現へ整合。

# auto_gate: 後続コマンド向けシグナル。本件は合意済み・未解決事項なし
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

# agreed_items: 合意された個別項目
agreed_items:
  - id: AG-001
    content: |
      [主変更] req-define コマンド Step 4-4（アーキテクチャ確認）に、oracle 分類結果に
      基づく差し戻し経路を明示的に追加する。

      現状の Step 4-4 末尾:
        「...親エージェントが確定事項・推定事項・ユーザー確認事項・ブロッカーに分類する。
         既存文書またはユーザー合意で裏付けられていない内容を要件本文へ確定事項として
         混入させない。」

      追加する文（QG-1「fail 時は壁打ち（Step 2）へ差し戻し」と同形式）:
        「分類結果にブロッカーが含まれる場合、または未決事項が解消されず残る場合、
         要件doc生成（Step 6）へ進まず壁打ち（Step 2）へ差し戻すこと
         （REQ-0139-004, REQ-0139-014）。」

      適用対象（source / projection 両方）:
        - src/opencode/commands/agentdev/req-define.md（48行目 Step 4-4）
        - .opencode/commands/agentdev/req-define.md（projection 同一行）

      設計意図:
        - oracle 利用必須は REQ-0139-009 で既規定。分類方法は REQ-0139-004 で既規定。
          欠落していたのは「分類結果がブロッカー/未決の時にどうするか」のアクションのみ。
        - auto_gate.auto_ready は後続コマンド（req-save/case-open）向け停止シグナルとして
          純粋に維持し、req-define 内部ループのトリガにはしない（責務分離の維持）。

  - id: AG-002
    content: |
      [REQ 補完] REQ-0139（外部エージェント統合契約）に、oracle 分類結果に基づくアクション
      規定を追加する。現状 REQ-0139-004 は4分類方法を規定するが、各分類結果に対する
      アクション（特にブロッカー/未決時の差し戻し）を規定していない。これがコマンド側へ
      の実装漏出の根本原因であった。

      追加する要件行（REQ-0139 要件テーブルの最終行として追加）:
        | REQ-0139-014 | oracle 分類結果にブロッカーが含まれる場合、または未決事項が解消されず残る場合、req-define は要件doc生成へ進まず壁打ちへ差し戻すこと |

      適用対象:
        - docs/requirements/REQ-0139.md（要件テーブル最終行へ追加）

      ※ architecture-advisory スキルの「未決事項が残る場合、req-define を完了しないこと」
        はこの要件のスキル側表現である。コマンド Step 4-4 はその実装である。

  - id: AG-003
    content: |
      [スキル整合] agentdev-architecture-advisory SKILL.md「親エージェント側の扱い」節の
      表現を、コマンド側の差し戻しと整合させる。

      現状（SKILL.md 親エージェント側の扱い、最終文）:
        「未決事項が残る場合、req-define を完了しないこと。」

      変更後:
        「未決事項が残る場合、req-define は要件doc生成へ進まず壁打ち（Step 2）へ
         差し戻すこと（REQ-0139-014）。」

      適用対象（source / projection 両方）:
        - src/opencode/skills/agentdev-architecture-advisory/SKILL.md
        - .opencode/skills/agentdev-architecture-advisory/SKILL.md

      設計意図: スキルは「完了しない」（受動・禁止形）から「Step 2 へ差し戻す」（能動・
      指示形）へ昇格し、コマンド・REQ・スキルの3層で同一のアクション記述を持つ。

# artifact_actions: REQ/ADR/SPEC への保存対象。コマンド・スキル変更は case-run 実装対象
# （agreed_items に記録済み・artifact_actions には含めない）
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-0139.md
    target_area: 要件テーブル最終行
    source_items: [AG-002]
    content: |
      REQ-0139 要件テーブルの REQ-0139-013 行の直後に以下の行を追加:
      | REQ-0139-014 | oracle 分類結果にブロッカーが含まれる場合、または未決事項が解消されず残る場合、req-define は要件doc生成へ進まず壁打ちへ差し戻すこと |

      関連情報節の「対象」に req-define の分類結果アクションを含めるよう調整:
      現状「対象: req-define（oracle助言）, ...」→「対象: req-define（oracle助言・分類結果アクション）, ...」

# conflict_resolutions: 壁打ちで解消された衝突の記録
conflict_resolutions:
  - id: CR-001
    conflict: |
      auto_gate.auto_ready を req-define 内部ループのトリガとして使うべきか（選択肢B）、
      それとも Step 4-4 の差し戻し明示化で対応すべきか（選択肢A）。
    resolution: |
      選択肢Aを採用。auto_gate.auto_ready は REQ-0138-013 が定める後続コマンド向け
      停止シグナルとして純粋に維持する。req-define 内部ループは QG-1 と同様にコマンド
      Step 内の明示的差し戻し文で制御する。責務分離がクリーンであり、REQ-0138 の
      soft-contract 原則に整合する。選択肢B（事後確認フェールセーフ）は本件では追加せず、
      将来的にハーネス独自委任での未決発見が頻発する場合は別途検討する。

# operation_units: 単一 REQ 操作
operation_units:
  - ou_id: OU-001
    source_ru:
    target_req: REQ-0139
    target_spec:
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

# case_open_hints: 単一 Issue で完結
case_open_hints:
  epic_needed: false
  decomposition:
  wave_hints: []
```

# summary

## 対象変更

選択肢A: req-define Step 4-4 の oracle ブロッカー/未決事項時の差し戻し経路を明示化する。

### 変更1: コマンド Step 4-4（AG-001）

ファイル（source / projection 同一変更）:
- `src/opencode/commands/agentdev/req-define.md`
- `.opencode/commands/agentdev/req-define.md`

old（48行目 Step 4-4 末尾）:
```
...親エージェントが確定事項・推定事項・ユーザー確認事項・ブロッカーに分類する。既存文書またはユーザー合意で裏付けられていない内容を要件本文へ確定事項として混入させない。
```

new（末尾に1文追加）:
```
...親エージェントが確定事項・推定事項・ユーザー確認事項・ブロッカーに分類する。既存文書またはユーザー合意で裏付けられていない内容を要件本文へ確定事項として混入させない。分類結果にブロッカーが含まれる場合、または未決事項が解消されず残る場合、要件doc生成（Step 6）へ進まず壁打ち（Step 2）へ差し戻すこと（REQ-0139-004, REQ-0139-014）。
```

### 変更2: REQ-0139 要素追記（AG-002 / ACT-REQ-001）

ファイル: `docs/requirements/REQ-0139.md`

要件テーブルへ1行追加 + 適用範囲の微修正。

### 変更3: スキル表現整合（AG-003）

ファイル（source / projection 同一変更）:
- `src/opencode/skills/agentdev-architecture-advisory/SKILL.md`
- `.opencode/skills/agentdev-architecture-advisory/SKILL.md`

old: 「未決事項が残る場合、req-define を完了しないこと。」
new: 「未決事項が残る場合、req-define は要件doc生成へ進まず壁打ち（Step 2）へ差し戻すこと（REQ-0139-014）。」

## 設計判断の記録

| 項目 | 判断 | 根拠 |
|---|---|---|
| A vs B | A のみ採用 | auto_ready の責務を後続コマンド専用に維持（REQ-0138 soft-contract 原則） |
| REQ 追記の要否 | 要（REQ-0139-014 追加） | 分類方法（004）は既規定だが分類結果アクションは未規定。REQ レベルで閉じないと再発リスク |
| ADR 要否 | 不要 | 新規アーキテクチャ判断なし。oracle 外部助言・4分類は REQ-0139 + ADR-0114 で確立済み |
| work_type | maintenance | 既存仕様の実装ギャップ修正。新規ユーザー向け機能ではない |

## 別途発見事項（本件対象外・参考記録）

原本 `src/opencode/commands/agentdev/req-define.md` の67-70行目に構造破損がある:
- 67行目: `  7. **work_type 判定**:` （インデント不正・重複）
- 68行目: `   - **6-2. artifact_actions 生成**:` （Step 6-2 の重複）
- 70行目: `7. **work_type 判定**:` （Step 7 の正本体）

これは選択肢Aの対象外だが、修正推奨。別 issue として扱うか本件に含めるかはユーザー判断。
