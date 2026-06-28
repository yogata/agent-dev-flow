## 観測内容
2026-06-28 の `/repo/docs-check` 実行で、`check_integrity.ts` の CanonicalConflict カテゴリ（`req-spec-boundary-violation`）が WARNING 11件を検出した。対象は REQ-0101、REQ-0108、REQ-0114、REQ-0140、REQ-0144、REQ-0145 の要件行で、SPEC 詳細キーワード（fixture detail, enum value list, schema field, Step number, checker individual rule）が含まれる点を検出（route: req-define、IR-044 / REQ-0108-259 準拠）。evidence 精査により、true positive（実際の SPEC 詳細混入）と false positive（文書種別の責務を定義する META 規則行）が混在することが判明。

検出 11件の詳細:
- REQ-0101-055: fixture detail（false positive 候補：META 規則行）
- REQ-0101-067: enum value list（false positive 候補：文書種別定義）
- REQ-0101-068: schema field（false positive 候補：文書種別定義）
- REQ-0108-001: checker individual rule（false positive 候補：委譲基準の規定）
- REQ-0108-258: fixture detail（true positive 候補：実装手順の混入）
- REQ-0114-099: Step number（true positive 候補：Step 番号の混入）
- REQ-0140-028: enum value list（false positive 候補：META 規則行）
- REQ-0144-009: fixture detail（判断保留：振る舞い要件か実装詳細か）
- REQ-0144-016: fixture detail（true positive 候補：ファイルパスの混入）
- REQ-0145-001: enum value list（false positive 候補：META 規則行）
- REQ-0145-012: enum value list（false positive 候補：exemption 規則の規定）

## 影響
REQ/SPEC 境界違反の検出警告が 11 件存在。文書整合性に直接影響し、要件記述の品質に懸念がある。

## 課題
- 各要件行を精査し true positive（実際の SPEC 詳細混入）と false positive（META 規則行）を分類する
- true positive は SPEC、ルールカタログ、command reference、skill reference のいずれかへ切り出す（IR-044 基準）
- false positive（META 規則行）は `integrity-rule-catalog.md` の exemption 対象として登録し、検出から除外する（REQ-0145-012 準拠）

## 既存要件との関連
- IR-044
- REQ-0108-259
- REQ-0145-012
