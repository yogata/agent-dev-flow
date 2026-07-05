# explore 委譲スコープ絞り込み（REQ）

req-define Step 5-1（変更影響候補抽出）で explore 委譲に渡す調査スコープを絞り込む決定的前処理。
RU の frontmatter、本文から対象領域キーワードを抽出し、glob/grep で関連 REQ/ADR/SPEC を事前特定してから、explore 委譲へ調査優先対象リストをヒントとして渡す。

## 目的と位置付け

実績 ses_10c29a13 で req-define の explore 委譲に全体の約 34% の時間を消費した。
入力スコープが広すぎたことが主因であるため、決定的処理で優先調査対象を事前特定し、explore 委譲が優先的に調べるべき対象を絞り込む。

**ヒントでありハードフィルタではない**: 絞り込み結果は explore 委譲の調査優先対象リスト（priority targets）として渡す。
explore 委譲はこのリストを優先調査の目安とし、リスト外のファイルを調査対象から除外してはならない。
REQ が要求する実ファイル完全列挙は維持する。

## 前処理フロー

### 1. RU からの対象領域キーワード抽出

入力 RU（`.agentdev/backlog/req-units/RU-*.md`）の frontmatter と本文から、調査すべき対象領域を示すキーワードを抽出する。

**抽出対象**:

| 抽出元 | キーワード種別 | 例 |
|--------|---------------|-----|
| frontmatter | `source_artifact`, `target_artifact`, `area` 等の対象示唆フィールド | `REQ`, `req-define`, `agentdev-req-analysis` |
| 本文見出し | 対象 command/skill/文書名 | `case-run`, `agentdev-gh-cli` |
| 本文 | 既存 REQ/ADR/SPEC の参照 ID（`REQ-NNNN`, `ADR-NNNN`, SPEC パス） | `REQ`, `ADR`, `<command SPEC>` |
| 本文 | ドメイン用語、対象機能名 | `委譲`, `I/O 境界`, `soft-contract` |

抽出キーワードは正規化（大小区別しない、`agentdev-` 等のプレフィクス揺れの吸収）した上で重複排除する。

**除外キーワード**: 汎用語（「対応」「実装」「確認」等）はノイズになるため抽出対象外とする。
command/skill 名、REQ/ADR/SPEC ID、固有名詞に限定する。

### 2. glob/grep による関連 REQ/ADR/SPEC 事前特定

抽出したキーワードでリポジトリ内の文書群を検索し、関連候補を事前特定する。

**検索対象とコマンド**:

```
# 関連 REQ 候補
glob docs/requirements/REQ-*.md
grep -l "<keyword>" docs/requirements/REQ-*.md

# 関連 ADR 候補
glob docs/adr/ADR-*.md
grep -l "<keyword>" docs/adr/ADR-*.md

# 関連 SPEC 候補
grep -rl "<keyword>" docs/specs/
```

REQ/ADR は ID 直接参照（`REQ-NNNN`, `ADR-NNNN`）が含まれる場合は当該ファイルを確実に含める。
SPEC はパス参照（`docs/specs/...`）と用語参照の双方で検索する。

**完全列挙の維持（REQ）**: 上記 glob は関連候補の事前特定に用いるが、REQ/ADR の実ファイル完全列挙自体は別途 `agentdev-req-analysis` の「既存REQ/ADRの定量的照合」で実施する。
本前処理が完全列挙を代替、省略することはない。
完全列挙の結果（全 REQ/ADR ファイル一覧）と事前特定結果（キーワード一致ファイル）は独立に保持し、explore 委譲へ両方を渡す。

### 3. 調査優先対象リストの構築

事前特定した関連候補を優先度付きリストとして整理する。

**リスト要素**:

- `high`: キーワード一致 + ID 直接参照の文書（最優先）
- `medium`: キーワード一致のみの文書
- `unscoped`: 完全列挙結果のうちキーワード不一致の文書（REQ の完全性担保のため調査対象に含むが優先度は低い）

explore 委譲は `high` → `medium` → `unscoped` の順で調査効率を高める。
`unscoped` を飛ばしてはならない（完全性維持）。

## explore 委譲への引き渡し

調査優先対象リストは explore 委譲の入力（`inputs`）に含める。
委譲時最小契約（ADR §5）に従い、リストは探索のヒントであり、explore 委譲の出力契約（探索結果、分類候補、根拠）を変更しない。

```
inputs:
  priority_targets:    # 本前処理で事前特定した優先調査対象（ヒント）
    high: [...]
    medium: [...]
    unscoped: [...]    # REQ 完全列挙結果（優先度低、調査対象に含む）
  keywords: [...]      # 抽出キーワード（再検索・拡張調査用）
```

## 制約

- **決定的処理**: キーワード抽出、glob/grep は機械的、決定的処理であり、LLM 推論に依存しない。結果は再現可能であること
- **ヒント扱い**: 絞り込み結果をハードフィルタとして扱わない。explore 委譲が `unscoped` を調査対象から除外することを禁止する
- **完全列挙の維持**: REQ が要求する実ファイル完全列挙を本前処理で省略、代替しない
- **責務境界**: 本前処理は探索の優先付けのみを担う。探索結果のドラフト反映は親エージェント（req-define）が行う（ADR §4）

## See Also

- `agentdev-req-analysis` SKILL.md「既存REQ/ADRの定量的照合」（REQ 完全列挙）
- ADR §5（委譲時最小契約）
- REQ（本前処理の要件）
