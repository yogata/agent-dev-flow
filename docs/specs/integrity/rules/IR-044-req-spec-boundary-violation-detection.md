---
status: accepted
---

# IR-044: REQ/SPEC 境界違反検出

| Field | Value |
|-------|-------|
| rule_id | IR-044 |
| description | 現行 REQ 要件行の主たる文意がスキーマフィールド、enum 値一覧、テストデータ詳細（fixture detail）、チェッカー個別ルール、誤検知（false positive）抑制方式、Step 番号直接参照、Phase 番号、内部アルゴリズム、具体的な作業履歴のいずれかである場合、当該 SPEC 詳細の混入を検出すること（REQ-0108-259, REQ-0108-260, REQ-0108-262, REQ-0101-067〜069, REQ-0136-031）。Step 番号直接参照は現行 REQ の記述制約（REQ-0136-031）に違反する SPEC 詳細混入の代表例であり、検出シグナル、exemption 条件の詳細は下位セクション「IR-044 Step 番号直接参照検出」に配置する。exemption は META 規則行（機械的行構造マッチ）のみとし、文脈解釈を要する免除は inspect-docs へ委譲する（REQ-0145-002, REQ-0145-012）。詳細は下位セクション「IR-044 exemption 条件」 |
| severity | heuristic |
| category | canonical-conflict |
| detection_method | 現行 REQ 要件行から SPEC 詳細キーワード（スキーマ、enum、テストデータ、チェッカー個別ルール、FP 抑制、Step 番号直接参照、Phase 番号、内部アルゴリズム、作業履歴）をパターンマッチで検出。Step 番号直接参照は `Step N`、`ステップ N`、`手順 N`（N は数字、範囲表現 `N-M` 含む）の正規表現パターンで検出する（実装: `check_integrity.ts` の `IR044_SIGNAL_PATTERNS` Step number エントリ）。検出後、META 規則行 exemption（REQ-NNNN-MMM 形式 + enum/format 等の列挙パターンを行構造で機械判定、REQ-0145-012）のみを適用する。文脈解釈を要する免除（否定文脈、委譲文脈、メタスコープルール文脈、振る舞い述語文脈、安定契約パターン）は実施せず inspect-docs へ委譲する（REQ-0108-259, REQ-0145-002） |
| affected_artifacts | [現行 REQ] |
| related_req | [REQ-0108-259, REQ-0108-260, REQ-0108-262, REQ-0101-067, REQ-0101-068, REQ-0101-069, REQ-0145-002, REQ-0145-012, REQ-0136-031] |
| related_spec | [integrity-contracts.md, document-model.md] |
| gate_level | full-audit |
| false_positive_risk | 高。文脈解釈を要する免除（否定文脈、委譲文脈、メタスコープルール文脈、振る舞い述語文脈、安定契約パターン）は docs-check では実施せず inspect-docs へ委譲したため（REQ-0108-259/262, REQ-0145-002）、純粋なパターンマッチの false positive は inspect-docs での意味的再評価で事後処理する。META 規則行 exemption は行構造の機械判定に限定し、件数・内容を規定する SPEC 詳細列挙行は免除しない（REQ-0145-012）。Step 番号直接参照パターンは数字を伴わない「Step 番号」「ステップ番号」語句を検出対象とせず、REQ-0136-031 自身（原則宣言の META 規則行）を誤検知しない。これは語句「番号」と数字リテラルの機械的区別により保証し、文脈免除には依存しない。既知の true positive が META exemption により誤って免除されないことを回帰テストで検証する |
| regression_test | `scripts/check_integrity.test.ts` の IR-044 正規スイート（REQ-9001〜REQ-9007）が真陽性保護と exemption 境界を検証する。Step 番号直接参照の true positive として REQ-9005（`Step 3`）を含み、手順 N パターン、REQ-0136-031 META 規則行の誤検知非検出を追加固定する（REQ-0108-259, REQ-0108-055 準拠） |
| baseline_status | new |
| finding_route | req-define |
| triage_action | 該当要件行の詳細を SPEC、ルールカタログ、コマンドリファレンス、スキルリファレンス、テスト文書のいずれかに移管し、REQ 側は外部契約、状態要件の要約に置き換える。Step 番号直接参照の triage は機能名・フェーズ名参照への置換とする（REQ-0136-031）。文脈免除の境界判定は inspect-docs が担う |
| last_verified | 2026-06-26 |

## IR-044 exemption 条件

IR-044 の exemption は META 規則行（機械的行構造マッチ）のみに限定する（REQ-0108-259, REQ-0145-002, REQ-0145-012）。文脈解釈を要する免除（isNegationContext / isDelegationContext / isMetaScopeRuleContext / isBehaviorPredicateContext / IR044_STABLE_CONTRACT_PATTERN）は docs-check から廃止し inspect-docs へ委譲した（REQ-0108-262）。

**META 規則行 exemption（機械判定のみ）**:

REQ/SPEC 責務範囲を規定する META 規則行（enum/format/schema 等 SPEC 対象種別を名指しして責務境界を宣言する行）を機械的に判定し免除する。判定は行構造のパターンマッチ（REQ-NNNN-MMM 形式 + enum/format 等の列挙パターン）に限定し、意味判断は含めない。

| 対象 | 判定 | 根拠 |
|------|------|------|
| REQ-NNNN-MMM 形式 + SPEC 種別列挙（enum/format/schema 等）を名指しする責務範囲規定行 | 免除（META 規則行） | REQ-0145-012。当該行は SPEC 詳細の記述ではなく責務範囲の規定 |
| SPEC 詳細そのものを列挙する行（enum 値 A/B/C の一覧、テストデータ（fixture）の具体件数と内容の羅列） | 免除しない（true positive 候補） | 件数・内容を規定する行は責務範囲規定ではない |

**inspect-docs へ委譲した文脈免除（docs-check 対象外）**:

| 文脈 | 委譲先 | 根拠 |
|------|--------|------|
| isNegationContext（否定文脈: 「〜しない」「〜以外」等） | inspect-docs | 文脈解釈を要する（REQ-0108-259, REQ-0145-002） |
| isDelegationContext（委譲文脈: 「委譲先」「切り出し先」等） | inspect-docs | 文脈解釈を要する |
| isMetaScopeRuleContext（メタスコープルール文脈の意味判断範囲） | inspect-docs | 意味判断を要する範囲は META 規則行の機械判定を超える |
| isBehaviorPredicateContext（振る舞い述語文脈） | inspect-docs | 存在・状態述語の意味判断を要する |
| IR044_STABLE_CONTRACT_PATTERN（安定契約例外 REQ-0101-069） | inspect-docs | 安定契約判定は意味判断を要する |

**true positive 保護（回帰テスト）**:

回帰テストで既知の true positive（SPEC 詳細が REQ に残留している実例）が META 規則行 exemption により誤って免除されないことを検証する（REQ-0108-259, REQ-0108-055 準拠）。保護対象の真陽性は件数・内容を規定する SPEC 詳細の残留であり、META 規則行（責務範囲規定）には該当しないことをテストで固定する。

**是正済み経緯（保護対象から除外）**: REQ-0114-082、REQ-0144-008 は #1109 PR で SPEC 詳細が REQ から SPEC へ移行済みであり、真陽性保護対象から除外する（REQ-0144-017）。当該 REQ は SPEC 詳細を残留させないため META 規則行 exemption の誤免除検証の根拠とならない。保護対象の真陽性は、件数・内容を規定する SPEC 詳細の残留実例に限定する。この明記により RU-0011（検出ロジック改良）実施前に同箇所を根拠としたテスト設計の前提崩壊を防ぐ。REQ-0102-070、REQ-0151-007 は AG-002（OU-002 と source_ru 同じ RU-0003 だが別 AG/ACT）で Step 番号直接参照から機能名・フェーズ名参照へ是正済みであり、真陽性保護対象から除外する。当該 REQ は Step 番号直接参照を残留させないため、Step 番号検出の回帰テスト根拠とならない（AG-003、REQ-0136-031 の case-open 由来）。

## IR-044 Step 番号直接参照検出

REQ-0136-031 が宣言する「現行 REQ の要件行は command 定義または SPEC の Step 番号を直接参照せず、機能名・フェーズ名で参照する」原則に基づく検出セクション（REQ-0136-031 の検出委譲先 SPEC 配置）。本セクションは Step 番号直接参照パターンの機械検出仕様を規定し、exemption 境界を明示する。

**検出パターン（機械判定）**:

Step 番号直接参照は次の正規表現パターンで検出する（実装: `check_integrity.ts` の `IR044_SIGNAL_PATTERNS` Step number エントリ）。

| パターン | 正規表現 | 検出例 |
|---------|---------|--------|
| `Step N`（英語、範囲含む） | `\bStep\s*\d+(?:\s*[-–]\s*\d+)?\b` | `Step 3`、`Step 4-6`、`Step  2` |
| `ステップ N`（カタカナ、範囲含む） | `ステップ\s*\d+(?:\s*[-–]\s*\d+)?` | `ステップ 3`、`ステップ3` |
| `手順 N`（漢字、範囲含む） | `手順\s*\d+(?:\s*[-–]\s*\d+)?` | `手順 4`、`手順4-5` |

N は数字（`\d+`）。範囲表現（`N-M`、`N–M`）を含む。検出対象は現行 REQ 要件行（`| REQ-NNNN-NNN | description |` 形式のテーブル行）のみ。

**非検出語句（false positive 抑制）**:

次の語句は数字リテラルを伴わない「番号」語であり、検出対象外とする。これにより原則宣言の META 規則行（REQ-0136-031 自身を含む）が語句「Step 番号」を含んでも true positive として誤検知されない。本境界は語句と数字リテラルの機械的区別により保証し、文脈免除に依存しない。

| 語句 | 取扱い | 根拠 |
|------|--------|------|
| `Step 番号`、`ステップ番号`、`手順番号` | 非検出 | 「番号」は数字リテラルではなく一般名詞。原則宣言、責務規定の META 規則行で使用される |
| `Step番号`（空白なし） | 非検出 | 同上 |

**exemption 条件（Step 番号直接参照固有）**:

Step 番号直接参照パターンは他の SPEC 詳細キーワードと同じく META 規則行 exemption のみを適用する。Step 番号直接参照に固有の文脈免除は設けない。SPEC ファイル、コマンドリファレンス、テスト戦略セクションにおける Step 番号参照は対象外（`affected_artifacts: [現行 REQ]`）であり、exemption ではなく検出スコープ外として扱う。文脈解釈を要する免除は inspect-docs へ委譲する（REQ-0145-002, REQ-0145-012）。

**severity / 分類**:

Step 番号直接参照は REQ レベルの記述制約違反（REQ-0136-031）であり、IR-044 全体と同じく severity: `heuristic`、category: `canonical-conflict` に分類する。REQ 要件行が SPEC 詳細（Step 番号）へ依存すると SPEC↔command の Step 構成変更が REQ 側へ波及し、REQ と SPEC の責務分離（REQ-0136 体系）を損なう。

**回帰テスト**:

`scripts/check_integrity.test.ts` の IR-044 正規スイートが次を検証する。

- `Step 3` 形式の true positive 検出（REQ-9005）
- `手順 N` 形式の true positive 検出（REQ-9008）
- REQ-0136-031 META 規則行（`Step 番号` 語句のみ、数字なし）の false positive 非検出（REQ-9009）
