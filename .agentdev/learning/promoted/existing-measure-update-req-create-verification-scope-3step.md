# REQ 新設時の検証スコープ 3 段確認手順を要件展開手順へ規律化する

## 背景

verification.optional 登録を伴う REQ 新設（REQ-103）で検証スコープ判断（policy.yaml 登録要否・恒常手段割当）を同一変更に含めなかったため、31 行中 missing-implementation 14 件 + missing-verification 19 件（重複計上含む計 33 件）が Wave 3 まで残存し、後置解消のコストが発生した。Wave 3 で実施した 3 段確認（要件行命題→実装実体所在→検証手段）で解消した実績がある。

## 問題

REQ-021-029「policy.yaml 登録判断を要件展開に含め判断結果を draft へ反映」は既存だが、本件はその適用漏れであり、3 段確認手順（要件行命題→実装実体所在→検証手段）としての規律化は requirement-development.md STEP-4 要件展開節に未規定（「検証スコープ」の記載は grep 0 件・実測）。

## 望ましい変更

requirement-development.md STEP-4 要件展開節へ、REQ 新設（CREATE）時に各要件行の検証対応を 3 段で確認する手順（要件行命題→実装実体所在→検証手段、REQ-021-028/029 との接続）を規律として明記する。

## 対象範囲

### 対象
- src/common/skills/agentdev-workflow-req-define/references/requirement-development.md（STEP-4 要件展開節）

### 対象外
- traceability/policy.yaml の登録様式（別契約）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | src/common/skills/agentdev-workflow-req-define/references/requirement-development.md | REQ 新設時 3 段確認手順の規律化 |

## 既存対策確認

- **確認結果**: 既存対策あり（部分）
- **該当ファイル**: REQ-021-029（登録判断の要件展開包含）
- **ギャップ分類**: application miss（＋手順の未規律化）
- **ギャップ詳細**: 適用漏れ再発防止の具体手順（3 段確認）が要件展開手順にない

## 制約

- REQ-021-028/029 の既存契約と整合する形で補足する（契約変更はしない）

## 受け入れ条件

- [ ] 要件展開節に 3 段確認手順が記載される
- [ ] REQ-021-028/029 との接続が明示される

## 元learning item / 根拠

- **要約**: REQ 新設の検証スコープ 3 段確認手順（Case #3530 Wave 2-3）
- **根拠**: REQ-103 で 33 件（重複計上含む）missing 残存の後置解消コスト、Wave 3 の 3 段確認による解消実績
- **再発条件**: verification.optional 対象行を含む REQ 新設で検証スコープ判断を後工程へ先送りする場合
- **横展開可能性**: REQ 新設全般

## 推奨Issue分類

- **分類**: docs
- **推奨ラベル**: documentation
- **関連Issue**: なし
