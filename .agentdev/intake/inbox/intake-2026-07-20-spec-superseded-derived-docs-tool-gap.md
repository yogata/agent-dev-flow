# SPEC superseded status の派生文書・ツール反映不備

## 由来
- PR #1644 (squash merge: fdfba0cf), Issue #1638, Epic #1635 Wave 2
- PR 本文 Findings / Capture候補セクション記載

## 現状

REQ-0101-076 により SPEC lifecycle に `superseded` が追加されたが、派生文書と整合性検査ツールの一部が未更新。

### 1. docs/specs/README.md の SPEC status 値記述が stale

`docs/specs/README.md` の SPEC status 追跡情報源節に「status 値: ADR-0123 で定義される draft / accepted のみ」との記載がある。REQ-0101-076 により SPEC lifecycle に `superseded` が追加されており、当該記述は現在 stale。Issue #1638 のスコープ（SC-003 superseded 表示是正）を超えるため未更新。

### 2. check_changed_docs.ts の SPEC status 扱い

`check_changed_docs.ts:551-561`（checkSpecFrontmatter）は SPEC status を `draft`/`accepted` のみ有効と判定し、`superseded` を warning 扱いする。REQ-0101-077 は superseded 宣言された SPEC を docs-check/inspect-docs の検査対象外とすることを規定するが、ツール実装が追従していない。

## 候補内容

### docs/specs/README.md の更新
- SPEC status 値記述へ `superseded` を追加
- ADR-0123 参照を REQ-0101-076 へ更新または併記

### check_changed_docs.ts の更新
- checkSpecFrontmatter で `superseded` を有効 status として扱う
- superseded SPEC の docs-check 検査対象外を実装（REQ-0101-077 準拠）

## 想定反映先
- `docs/specs/README.md`（SPEC status 値記述の更新）
- `.opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts`（checkSpecFrontmatter 実装）

## 優先度
medium（Wave 3 #1641 で派生文書再生成と docs-check 最終確認が実施されるため、同 Issue で対応可能）

## 関連
- Epic #1635 Wave 2: Issue #1638, PR #1644
- Wave 3: Issue #1641 (OU-006: 派生文書の再生成と docs-check 最終確認)
- REQ-0101-076 (SPEC lifecycle superseded 追加)
- REQ-0101-077 (superseded SPEC の docs-check 検査対象外)
- ADR-0123 (SPEC status 定義、draft/accepted)
