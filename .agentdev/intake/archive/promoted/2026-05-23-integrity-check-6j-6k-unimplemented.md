# integrity-check 旧 data path / 旧 terminology 検出の未実装 (6j/6k)

## 観測
check_integrity.ts の LEGACY_PATTERNS に、旧 data path（`data/` → `docs/` 移行前のパス参照）および旧 terminology（旧名前空間 `agentdev-` 以外の残余）の検出パターンが未追加である。#340 で 6j/6k として明示的に残課題として挙げられていたが、実装はスキップされた。

## 今回扱わない理由
#340 ではより優先度の高い検証項目（frontmatter 構造・必須フィールド・テンプレート適合）の実装に注力し、6j/6k は明示的にスコープ外とされた。

## 影響
- `data/` 配下の古いパスを参照するドキュメントが検出されない
- 旧名前空間の残余（命名規則変更前の artifact）が検出されない
- 移行漏れの自動検出に隙間が残る

## レビューで決めること
- 6j/6k の実装優先度（他 integrity チェック項目との相対優先度）
- 旧 data path のパターン定義（どのパスを「旧」とみなすか）
- 旧 terminology のパターン定義（移行前の名前空間一覧）

## 根拠（任意）
- 元 Issue: #340 — 「6j: 旧 data path 検出」「6k: 旧 terminology 検出」が未実装として記載
- 元 PR: PR#341 — check_integrity.ts の実装で LEGACY_PATTERNS に 6j/6k が含まれていない
