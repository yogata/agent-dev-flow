# IR-044 REQ/SPEC 境界違反の heuristic 警告 11件

## 観察

`check_integrity.ts` の CanonicalConflict カテゴリ（`req-spec-boundary-violation`）が、REQ-0101、REQ-0108、REQ-0114、REQ-0140、REQ-0144、REQ-0145 の要件行に SPEC 詳細キーワード（fixture detail, enum value list, schema field, Step number, checker individual rule）が含まれる点を WARNING 検出した（route: req-define、11件、IR-044 / REQ-0108-259 準拠）。

evidence を精査すると、true positive（実際の SPEC 詳細混入）と false positive（文書種別の責務を定義する META 規則行）が混在する可能性が高い。

## 課題

- 各要件行を精査し true positive（実際の SPEC 詳細混入）と false positive（META 規則行）を分類する（原因分類: 仮説 — evidence から META 規則行の可能性高いが個別精査が必要）
- true positive は SPEC、ルールカタログ、command reference、skill reference のいずれかへ切り出す（原因分類: 確認済 — IR-044 基準）
- false positive（META 規則行）は `integrity-rule-catalog.md` の exemption 対象として登録し、検出から除外する（REQ-0145-012 準拠）（原因分類: 確認済）

## 根拠

検出 11件の対象と evidence 抜粋:

| REQ-ID | キーワード | evidence 抜粋 | 推定分類 |
|--------|-----------|---------------|----------|
| REQ-0101-055 | fixture detail | 「SPECに置くべき...基準が定義されていること」 | false positive 候補（META 規則行） |
| REQ-0101-067 | enum value list | 「REQ は...SPEC は...を記述する文書種別であること」 | false positive 候補（文書種別定義） |
| REQ-0101-068 | schema field | 「REQ 要件行が...を主たる文意とする場合...配置する対象であること」 | false positive 候補（文書種別定義） |
| REQ-0108-001 | checker individual rule | 「checker 個別ルールと対象集合の詳細は...に委譲すること」 | false positive 候補（委譲基準の規定） |
| REQ-0108-258 | fixture detail | 「regression test の fixture copy は実ファイル構成の完全ミラーリングを行うこと」 | true positive 候補（実装手順の混入） |
| REQ-0114-099 | Step number | 「case-auto は case-run のオーケストレーション手順（Step 1-5, 7-8）を...」 | true positive 候補（Step 番号の混入） |
| REQ-0140-028 | enum value list | 「要件行は操作主体を明示すること。ただし enum 定義...主体明示が不要な場合...」 | false positive 候補（META 規則行） |
| REQ-0144-009 | fixture detail | 「copyScripts 本採用環境下で fixture drift を自動検出する仕組みを提供すること」 | 判断保留（振る舞い要件か実装詳細か） |
| REQ-0144-016 | fixture detail | 「scripts/tests/check_integrity.test.ts と scripts/check_integrity.test.ts の責務分担が SPEC に明文化されていること」 | true positive 候補（ファイルパスの混入） |
| REQ-0145-001 | enum value list | 「現行 REQ は Step 番号、fixture、enum 等 SPEC 詳細を要件行に混入させない」 | false positive 候補（META 規則行） |
| REQ-0145-012 | enum value list | 「IR-044 は...META 規則行...を exemption 対象とすること」 | false positive 候補（exemption 規則の規定） |

## 観測元

- `/repo/docs-check` 実行（2026-06-28）
- 検出カテゴリ: CanonicalConflict（`req-spec-boundary-violation` WARNING 11件）
