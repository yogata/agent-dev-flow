# Wave 12 draft SPEC 整理（IR-050/051 確定事項・参照リスト陳腐化）

## 観測

OU-002 Wave 1+2 で追加された IR-050/051 および skill references について、draft SPEC 側の整理が追従していない。

### 課題一覧

1. **IR-050/051 の確定事項先送り**: OU-002 Wave 2 で追加された IR-050/051（load_skills 誤指定検出・実行主体 skill 表記誤認検出）について、以下が次工程以降に委譲されたまま:
   - 語彙レジストリ（vocabulary-registry.md）の存在確認・補充
   - IR-051 の「一定文字距離内」の具体的閾値（文字数・行数）の確定
   - 機械的検出（IR-050/051）・意味的診断（inspect-skills REQ-0125-010）・査読時観点（doc-writing REQ-0140-027）の 3 層検出構造全体の責務分担を SPEC レベルで整理
2. **draft SPEC の参照リスト陳腐化**: Wave 1+2 で skill references に新規ファイルが追加されたが、対応する draft SPEC の「参照する references」セクションが更新されず陳腐化:
   - `docs/specs/skills/agentdev-doc-writing.md`（draft）: 7 ファイル列表記のままだが、今回の追加で 8 ファイルになった
   - `docs/specs/skills/agentdev-inspect-skills.md`（draft）: 「なし（SKILL.md本文に集約）」と記載されているが、新規追加により矛盾
   - 両 SPEC は draft であり、Wave Issue の修正候補外（scope 守控）とされたため対応されず

## 影響

- IR-050/051 を適用するには語彙レジストリの存在確認と閾値確定が必須
- 3 層構造の責務分担が SPEC に明示されない場合、横断検出で判定が曖昧になるリスク
- draft SPEC と実 skill の references 構成が不一致。SPEC 昇格時に突合せで再検出される可能性が高い

## 課題

- Wave 3 横断検出の入力として IR-050/051 の語彙レジストリ確認・閾値確定を先行するか、別 Issue で扱うか
- 3 層検出構造の責務分担を SPEC に整理するか
- draft SPEC の参照リスト陳腐化を Wave 3 横断検出・修正スコープに含めるか、spec-save の別 Issue として先行修正するか
- 「draft SPEC の参照リスト陳腐化」を機械的検出ルールに追加するか

## 既存要件との関連

- REQ-0125-010（inspect-skills）
- REQ-0140-027（doc-writing 査読観点）
- `docs/specs/integrity-contracts.md`
- `docs/specs/writing-style.md`
- draft SPEC: `docs/specs/skills/agentdev-doc-writing.md`・`docs/specs/skills/agentdev-inspect-skills.md`

## 根拠

- 元 inbox item:
  - `2026-06-22-epic1018-wave12-ir050-051-deferred-decisions.md`
  - `2026-06-22-epic1018-wave12-draft-spec-references-stale.md`
- Epic #1018 Wave 1+2
