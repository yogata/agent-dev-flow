# IR-013（variant path 実在）の検出関数が check_integrity.ts main results 統合に未接続

## 観測事実

- Case #4026 Wave 1（PR #4039）の 65 規則分類確定（REQ-047-012・IR-074 機械検査）で、IR-013 は prose-only に分類された。理由: 検出関数 checkVariantPathExistence が実装済みだが check_integrity.ts の main results 統合に未接続のため実行されない。
- PR #4039 本文 Findings で接続または廃止の判断は別検討候補として申告済み。

## 具体的な修正対象

- checkVariantPathExistence を check_integrity.ts の results 統合へ接続する（machine-check へ再分類）か、関数を廃止して IR-013 を prose-only のまま規則文書へ明記するかの判断と実装。
- 接続する場合は IR-013 の frontmatter detection_method_class・implementation_path・verification_path を IR-074 検査の機械照合対象へ追随させる。

## 関連

- Case #4026・PR #4039 本文 Findings / Capture候補（DEL-4029-1）
- IR-013（docs/designs/integrity/rules/IR-013-variant-path-existence.md）・IR-074（分類機械検査）
