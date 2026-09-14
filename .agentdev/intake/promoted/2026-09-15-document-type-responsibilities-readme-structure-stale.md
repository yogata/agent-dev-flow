# document-type-responsibilities.md の README 構成要素列挙が入口表削除後に陳腐化

## 観測内容

`docs/designs/responsibilities/document-type-responsibilities.md`（Design）が列挙する README 構成要素（入口表を含む）が、Issue 2792 の実施後（README.md を索引構成へ再編、入口表は docs/guides/command-selection.md へ一元化）に実態と不一致となっている。Design 本文変更は当該 Case のスコープ外のため未修正のまま。

## 影響

- Design の README 構成記述が実態と不一致であり、参照者が旧構成（入口表を README が持つ）に誘導され得る

## 課題（対応候補と判断材料）

- 実態（入口表は docs/guides/command-selection.md に一元化、README.md は索引構成）へ Design 本文を整合させる
- 次回 Design 更新 Case での実施を想定

## 既存要件との関連

- REQ-057-016（ルート README は索引と参照リンクで足りる）: 整合の優先根拠

## 根拠

- 観測元: PR 2792（case 2791 / issue 2792）`## Findings / Capture候補` intake セクション（Issue scope-affecting impact candidate の記録どおり）、case-close（2026-09-13）で回収
- 処分経緯: intake-promote（2026-09-15）で採用を確定（ユーザー承認）
