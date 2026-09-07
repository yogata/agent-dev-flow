# verification-scope-catalog.md の REQ-057-023 登録漏れ

## 観測内容
traceability check が REQ-057-023 を missing-verification として計上する。verification-scope-catalog.md の REQ-057 セクションに 023 が登録されていない。

## 影響
実検証済みでも分類ゲート未処理として扱われ、後続 Case の完了判定で同じ計上が再発する。

## 課題
REQ-057-023 を検証対応任意行として登録するか、REQ 行へ検証対応宣言を付与するかを判断する。REQ 追加時に分類ゲートを起動する workflow 改善も確認する。

## 既存要件・正規成果物との関連
Issue #2558、PR #2578、REQ-057-023、`docs/designs/foundations/references/verification-scope-catalog.md`。
