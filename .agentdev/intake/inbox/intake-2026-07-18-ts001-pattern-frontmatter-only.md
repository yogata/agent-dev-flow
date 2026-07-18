# Intake Item: TS-001 pattern の frontmatter 限定検討

## 発生源

- PR: #1543 (Issue #1542 / OU-001, maintenance)
- 発生 phase: case-close capture 回収 (Step 10)
- capture 分類: intake (後続運用候補 = 別 Issue 検討推奨)

## 問題

Issue #1542 の完了条件 TS-001 は `Select-String -Pattern '^status:\s*draft\s*$'` で docs/specs/ 配下の frontmatter `status: draft` 行頭マッチを検出する。case-auto 前置の staleness check で対象50件に加え `docs/specs/responsibilities/artifact-contracts.md:264` の本文中コードブロック例示（`.agentdev/drafts/` 配下の draft file frontmatter 例示）が偽陽性で1件ヒットした。

PR #1543 では当該行に YAML コメント形式（`status: draft  # draft_type=req_draft の初期状態`）で文脈を付与して行頭マッチを回避し、TS-001 を 0件へ到達させた。ただし、これは場当たり的回避であり、今後別のコードブロック例示で同様の偽陽性が再発する可能性がある。

TS-001 pattern を frontmatter 限定（最初の `---` ブロック内のみへ狭める）へ変更すると、コードブロック例示の偽陽性を構造的に回避できる。`Select-String` 単体では frontmatter ブロック判定が困難なため、PowerShell スクリプトで frontmatter 部分を抽出してから pattern マッチする等の実装検討が必要。

## 推奨修正対象

別 Issue で以下を検討:

1. TS-001 pattern を frontmatter 限定へ狭める実装方法（`Select-String` 単体か、事前抽出スクリプトか）
2. 同種の「frontmatter 行頭マッチ」を利用する test strategy 項目の横展開確認（他 Issue で同様の `^key:\s*value\s*$` 形式の verification を使う場合）
3. 類似コードブロック例示の他ファイル確認（artifact-contracts.md 以外に draft / status 例示を含む SPEC）

影響範囲:
- Issue #1542 の TS-001 verification 記述（`docs/specs/` 配下50ファイルの frontmatter 検査）
- 同種の frontmatter 行頭マッチ test strategy を持つ他 Issue（運用上の再発リスク）
- artifact-contracts.md の YAML コメント付与（本 PR で実施）は、pattern 狭め実施後はコメント付与が不要になるため回帰可能性

昇格先候補: 当面 SPEC 昇格不要（test strategy 策定ガイドの改善範囲）。`src/opencode/skills/agentdev-req-analysis/references/` 配下の test strategy 策定ガイド、または case-open の test strategy 記述ガイドの改訂候補。

## 関連

- references: docs/specs/responsibilities/artifact-contracts.md (L264, YAML コメント付与済み)
- Issue: #1542 (CLOSED, TS-001)
- PR: #1543 (merge 43155347211cb0ef065b1abc8489a40fcb7b507d, Findings ### stale-reference)
- ADR/REQ: ADR-0123 (SPEC lifecycle), REQ-0154 (SPEC status 単一追跡源)
- 姉妹 Findings: なし（docs-integrity は targeted docs guard 合格の結果報告のため learning 対象外）
