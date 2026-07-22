# TS-001 pattern の frontmatter 限定検討

## 観測内容

Issue #1542 の完了条件 TS-001 は `Select-String -Pattern '^status:\s*draft\s*$'` で `docs/specs/` 配下の frontmatter `status: draft` 行頭マッチを検出する。case-auto 前置の staleness check で対象50件に加え、`docs/specs/responsibilities/artifact-contracts.md:264` の本文中コードブロック例示（`.agentdev/drafts/` 配下の draft file frontmatter 例示）が偽陽性で1件ヒットした。

PR #1543（merge 43155347211cb0ef065b1abc8489a40fcb7b507d）では当該行に YAML コメント形式（`status: draft  # draft_type=req_draft の初期状態`）で文脈を付与して行頭マッチを回避し、TS-001 を 0件へ到達させた。ただし場当たり的回避であり、今後別のコードブロック例示で同様の偽陽性が再発する可能性がある。

## 影響

test strategy の偽陽性が継続的な再発リスクを持つ。影響範囲は `docs/specs/` 配下50ファイルの frontmatter 検査だけでなく、同種の frontmatter 行頭マッチ（`^key:\s*value\s*$` 形式）を利用する test strategy 項目を持つ他 Issue にも横展開する。現時点の影響は1件の回避済み事象に留まるが、検出精度の構造的欠陥が残存する。

## 課題

TS-001 pattern を frontmatter 限定（最初の `---` ブロック内のみ）へ狭めることで、コードブロック例示の偽陽性を構造的に回避する必要がある。`Select-String` 単体では frontmatter ブロック判定が困難なため、PowerShell スクリプトで frontmatter 部分を抽出してから pattern マッチする等の実装方式の検討が求められる。

## 既存要件・仕様との関連

- ADR-0123（SPEC lifecycle）: TS-001 が検査対象とする SPEC status の基盤。
- REQ-0154（SPEC status 単一追跡源）: TS-001 verification の前提となる追跡源。
- `docs/specs/responsibilities/artifact-contracts.md:264`: 本 PR で YAML コメント付与済み（pattern 狭め実施後はコメント付与が不要になり回帰可能性あり）。

## 対応方針の方向性

1. TS-001 pattern を frontmatter 限定へ狭める実装方法（`Select-String` 単体か、事前抽出スクリプトか）の検討。
2. 同種の「frontmatter 行頭マッチ」を利用する test strategy 項目の横展開確認。
3. 類似コードブロック例示を含む他 SPEC ファイル（draft / status 例示を含むもの）の確認。
