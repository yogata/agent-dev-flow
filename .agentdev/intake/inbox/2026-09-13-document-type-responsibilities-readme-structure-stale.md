# document-type-responsibilities.md（Design）の README 構成要素列挙が入口表削除後に陳腐化

## 概要

docs/designs/responsibilities/document-type-responsibilities.md（Design）が列挙する README 構成要素（入口表を含む）が、Issue 2792 の実施後（README.md を索引構成へ再編、入口表は command-selection.md へ一元化）に実態と不一致となっている。Design 本文変更は当該 Case のスコープ外のため未修正。

## 内容

- document-type-responsibilities.md の README 構成要素列挙（入口表を含む）が陳腐化（実態: 入口表は docs/guides/command-selection.md に一元化、README.md は索引構成）
- 修正には Design 本文の更新が必要だが、当該 Case（docs_chore）の変更対象外のため実施せず
- 優先根拠: REQ-057-016（ルート README は索引と参照リンクで足りる）。次回 Design 更新 Case で実態へ整合させる

## 根拠

- 観測元: PR 2792（case 2791 / issue 2792、`## Findings / Capture候補` intake セクション。Issue scope-affecting impact candidate の記録どおり）、case-close（2026-09-13）で回収
- 元テキスト: 「document-type-responsibilities.md（Design）の README 構成要素列挙（入口表を含む）が本 Case 実施後に陳腐化している。Design 本文変更は本 Case のスコープ外のため未修正（Issue scope-affecting impact candidate の記録どおり。優先根拠 REQ-057-016）」
