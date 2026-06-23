# WARNING: IR-044 req-spec-boundary-violation が META 規則行と行動要件行を誤検出

## 発生源

- コマンド: /repo/docs-check（2026-06-22 実行）
- 検出カテゴリ: CanonicalConflict（IR-044, WARNING）
- ルート: req-define

## 内容

IR-044 `req-spec-boundary-violation` 検出が以下 2 finding を出しているが、いずれも REQ/SPEC 境界違反ではない（false positive）。

### Finding 1: REQ-0101-067（docs/requirements/REQ-0101.md:70）

検出行:

> REQ-0101-067: REQ は対象が満たすべき状態・振る舞い・制約・外部契約を記述する文書種別であり、SPEC は現在の実装構成を成立させる スキーマ・ライフサイクル・コマンド構成・ルールカタログ・テストデータ詳細・判定表・enum・format・内部パラメータを記述する文書種別であること

判定: この要件行は REQ/SPEC 境界を定義する META 規則そのものであり、「enum」「format」は SPEC が扱う対象を列挙して定義している。SPEC 詳細を記述しているのではなく、SPEC の責務範囲を規定している。誤検出の原因は IR-044 が「enum value list」キーワードを機械的に検出している点。

### Finding 2: REQ-0144-009（docs/requirements/REQ-0144.md:27）

検出行:

> REQ-0144-009: copyScripts 本採用環境下で fixture drift を自動検出する仕組みが存在する

判定: 「仕組みが存在する」は振る舞い要件（存在・状態）であり、SPEC 詳細ではない。「fixture」という語は drift の対象種別を示す修飾語であり、fixture の中身（件数・内容）を規定していない。誤検出の原因は IR-044 が「fixture detail」キーワードを機械的に検出している点。

## 影響

- 同一の false positive が毎回 docs-check report に現れ、NG/WARNING ノイズが増加
- false positive に慣れ、真の violation（別 intake item 参照）が埋もれるリスク
- 運用者が「IR-044 は過検出が多い」と信用を失う

## 推奨対応先

- IR-044 検出ロジック（`check_integrity.ts` 内 `req-spec-boundary-violation` 検出関数）の改良:
  - META 規則行（REQ/SPEC 境界・責務範囲を定義する行）の exoneration 条件追加
  - 「仕組みが存在する」「機能が存在する」等の存在・振る舞い記述の exoneration 条件追加
- REQ-0145（docs-check/integrity 検出設計改善）のスコープ候補

## 原因分類

- 確認済: キーワードベースの機械的検出が META 規則記述・存在記述と衝突している
- 仮説: exoneration 条件の網羅が不足（IR-044 はキーワード一致のみで判定）

## 根拠

- 検出レポート: `.agentdev/integrity/reports/2026-06-22-integrity-report.md` CanonicalConflict セクション（REQ-0101-067, REQ-0144-009 の2件）
- 検出元スクリプト: `.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts`
- 関連要件: REQ-0108-259（IR-044）, REQ-0145（検出設計改善）
