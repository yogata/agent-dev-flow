# REQ-0143-004 の IR-044 exemption 境界整理

## 観測内容

PR #1198（IR-044 Step-number direct-reference detection signals）で、REQ-0143-004 が既存の IR-044 Step number warning として検出されている。REQ-0143-004 は command-file-format SPEC ↔ command 定義の Step 一致原則を述べており、原本的には SPEC 詳細の列挙ではなく原則規定に近いが、META 規則行 exemption 機械判定には引っかからない。

## 影響

- REQ-0143-004 が IR-044 Step number warning として検出され、exemption 機械判定が機能しない

## 課題

- REQ-0143-004 の IR-044 exemption 境界の整理
- 別途 inspect-docs で文脈免除判定が必要となる可能性の確認

## 既存要件との関連

- REQ-0143-004: SPEC ↔ command 定義の Step 一致原則
- IR-044: Step number warning（exemption 境界判定）
- 本 item は `2026-06-28-req0143-004-inspect-skills-promote-step-format.md` と同じ REQ-0143-004 に関連し、統合推奨

## 観測元

- PR #1198 (IR-044 Step-number direct-reference detection signals)
