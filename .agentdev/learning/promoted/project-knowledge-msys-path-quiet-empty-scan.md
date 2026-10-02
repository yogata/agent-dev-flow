# MSYS 形式パス指定による静かな空走査の防止

処分区分: 4 project knowledge

## 背景

Case #3311 で、Windows の bash から traceability scripts へ `--root` を MSYS 形式パス（`/c/Users/...`）で渡したところ、スクリプトは静かに空走査（scan target 0 件の正常終了扱い）を行い、missing-design が偽 fail として出た。Windows 形式（`C:\...` / `C:/...`）の絶対パス指定では正常に走査される。

## 問題

- スクリプトが MSYS 形式パスを「存在しないパス」として扱う際、エラーではなく空走査として正常終了するため、検出結果（偽 fail）から原因（パス形式）を直接読み取れない
- traceability SKILL.md の実行前提は相対パスのみの記載で、Windows からの絶対パス指定時の形式制約の言及がない

## 望ましい変更

1. traceability SKILL.md の実行前提に「Windows から --root 等のパス引数を渡す場合は Windows 形式（`C:\...` / `C:/...`）の絶対パスを指定する。MSYS 形式（`/c/...`）は静かな空走査になり偽 fail の原因になる」を追記する
2. 知識文書化候補: MSYS 形式パスの静かな空走査は他スクリプトでも同様に発生し得る（汎用性のある Windows 環境知見）

## 対象範囲

### 対象

- src/common/skills/agentdev-traceability/SKILL.md（実行前提節）
- パス引数を受け取る scripts 全般（知識文書化の適用範囲）

### 対象外

- スクリプト側の MSYS パス検出・警告実装（改善候補として記録に留める）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill | src/common/skills/agentdev-traceability/SKILL.md | 実行前提へ Windows 形式絶対パス指定・MSYS 形式の静かな空走査注意を追記（fix gap 兼） |
| knowledge | docs/knowledge/（新規知識文書候補） | MSYS 形式パスの静かな空走査知見（汎用） |

## 既存対策確認

- **確認結果**: 既存対策なし
- **該当ファイル**: なし（SKILL.md 実行前提は相対パスのみで MSYS 言及なし）
- **ギャップ分類**: なし
- **ギャップ詳細**: なし

## 制約

- bash（MSYS）環境の利便性を損なわない範囲で、Windows 形式指定を前提手順とする

## 受け入れ条件

- [ ] SKILL.md 実行前提にパス形式の制約が追記されている
- [ ] 知識文書化候補として backlog-review に提示されている

## 元learning item / 根拠

- **要要約**: MSYS 形式パス指定による traceability scripts の静かな空走査と偽 fail
- **根拠**: 2026-10-02 Case #3311 STEP-4 検査期待値実測: `--root` に MSYS 形式（/c/...）を渡すと静かに空走査になり missing-design が偽 fail で出た
- **再発条件**: Windows の bash からパス引数を MSYS 形式で渡した場合
- **横展開可能性**: パス引数を受け取る全 scripts。Windows 環境運用全般に汎用する知見

## 推奨Issue分類

- **分類**: chore（ドキュメント追記・知識文書化）
- **推奨ラベル**: documentation, windows
- **関連Issue**: Case #3311
