# apply-mechanical-replacement.ps1 の RU化（新規共用スクリプト）

## 発生源

- Epic: #1231 (Wave 1, Wave 2 close 時回収)
- PR: #1243 (子Issue #1233), #1244 (子Issue #1234), #1245 (子Issue #1232), #1248 (子Issue #1238), #1249 (子Issue #1237)
- 発生日: 2026-06-26（Wave 1）、2026-06-27（Wave 2 追加事実）

## 観測内容

Wave 1 / Wave 2 PR 群で機械置換アルゴリズム（`mechanical-replacement-rules.md` 準拠）を一括適用するための PowerShell スクリプト `scripts/apply-mechanical-replacement.ps1` を新設した。本スクリプトは各 PR には含めず別途管理し、Wave 1 / Wave 2 で共用した。

現状では REQ/SPEC 上の位置付けが未確定（RU化未実施）。`scripts/` 配下の新規ツールとして整理し、REQ-0140-026（文書品質準拠）の実行手段として明文化するかを検討する必要がある。

Wave 2 で追加検出した事実: PR #1249（子Issue #1237, src/opencode/commands）で X-6 ヒューリスティック（`において.*置換` 等の正規表現）が通常文の「において」と「置換」の偶発共起で false negative を出す事例を検出（`spec-save.md` L176: `において action の` が `において.*置換` パターンで文脈判断により誤マッチ）。手動修正 1 件で対応。

## 影響

- 共用スクリプトの REQ/SPEC 上の位置付けが未確定で、管理体制（メンテナ、適用範囲、廃止基準）が不明確
- X-6 ヒューリスティックの false negative リスクが残存

## 課題

- `scripts/apply-mechanical-replacement.ps1` を REQ-0140-026 の実行手段として REQ/SPEC へ位置付ける（RU化）
- `scripts/` 配下の配置・命名規約を確認
- X-6 ヒューリスティックの精緻化（前後トークン境界の厳格化、または文脈判定の廃止）を RU化時に併せて精査

## 既存要件との関連

- REQ-0140-026（文書品質準拠）
- `mechanical-replacement-rules.md`（algorithm SSoT）
- 関連: runtime-package-boundary SPEC の scripts/ 配布取り扱い（別 intake あり）

## 対応方針候補

- RU化候補として REQ-0140-026 の実行手段へ位置付け、ヒューリスティック精緻化を併せて実施する
