# X-1 表セル除外の解釈差分（algorithm SSoT vs 子Issue 除外リスト）

## 発生源

- Epic: #1231 (Wave 1)
- PR: #1242 (子Issue #1235), #1243 (子Issue #1233)
- 発生日: 2026-06-26

## 内容

X-1（中黒並列）是正において、表セル内中黒の扱いが機械判定アルゴリズム SSoT（`src/opencode/skills/agentdev-doc-writing/references/mechanical-replacement-rules.md`）と子Issue の除外リスト定義で解釈が分かれる。

- algorithm SSoT: 表セルを除外対象に含めない（表セル中黒は是正対象）
- 子Issue 除外リスト（一部）: 表を除外（表セル中黒は非対象）

Wave 1 PR群（#1242, #1243）は algorithm SSoT に従い表セル中黒を読点へ置換した（`docs/guides/diagnostics-and-maintenance.md` L98、`docs/adr/` 配下の表セル）。`inspect-docs` 実装がどちらの解釈で finding を検出するかにより、再スキャンで再発するリスクがある。

## 推奨対応先

- `inspect-docs`（X-1 検出ロール）と `mechanical-replacement-rules.md`（algorithm SSoT）の表セル扱いの整合性確認
- 整合後、表セル除外を algorithm SSoT 側に揃えるか、子Issue 除外リスト側に揃えるかを確定し SPEC（`docs/specs/foundations/document-model.md` 関連 or integrity-rules）へ明文化

## 現在の追跡状態

- PR #1242 Findings セクションに記録済み
- PR #1243 SPEC確定候補セクションに記録済み（algorithm SSoT 準拠の方針）
- Wave 2（#1237/#1238/#1239）でも同一スクリプト適用時に再照射される見込み
