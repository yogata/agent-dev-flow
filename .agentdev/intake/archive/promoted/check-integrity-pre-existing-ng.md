# check_integrity.ts pre-existing NG 記録

## 発生日
2026-06-25

## ソース
PR #1137 (Case-close Completion Verification) 検証時の check_integrity.ts 実行結果

## 検証結果
本 PR 由来の新規 NG: 0 件（✅ 合格）
Pre-existing NG: 2 件（本 PR 前後で不変）

## Pre-existing NG 詳細

### 1. req-range-staleness
- **対象**: docs/guides/project-docs-and-specs.md の REQ 範囲表記
- **内容**: REQ-0147 で古い表記になっている
- **判定**: 本 PR 由来ではない（pre-existing）

### 2. command-capture-duty
- **対象**: case-close.md
- **内容**: '回収・保存' duty キーワード不在
- **判定**: 本 PR 由来ではない（pre-existing）

## 備考
これらの pre-existing NG は REQ-0131 (test strategy cycle) の範囲外であり、後続 intake として処理を検討する必要がある。