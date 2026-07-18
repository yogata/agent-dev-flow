# SKILL.md 500行閾値超過（agentdev-req-file-manager, agentdev-skill-authoring）

## 観測内容
- `lint_skills.ts` が SKILL.md bloat WARNING を2件検出
  - `agentdev-req-file-manager`: 513行
  - `agentdev-skill-authoring`: 523行

## 影響
- 知識の局所集中を示す兆候であり、progressive disclosure 観点から要対応
- 1ファイルあたりの認知負荷が高く、メンテナンス成本が増大

## 課題
- 両 SKILL.md を500行以下に縮約する
- 詳細記述は references/ 配下へ分離し、SKILL.md 本文ではエントリポイントと参照の一覧に絞る

## 既存要件との関連
- REQ-0113: Skill References SPEC 分離基準

## 対応方針の方向性
- 各 SKILL.md の参照可能な節を references/<topic>.md へ切り出し
- 切り出し後に `lint_skills.ts` で WARNING 0件を確認
- 既存 references/ 構成との整合性を維持

## 出典
- 元 intake item: intake-2026-07-18-1337-skill-md-bloat-req-file-manager-skill-authoring.md
