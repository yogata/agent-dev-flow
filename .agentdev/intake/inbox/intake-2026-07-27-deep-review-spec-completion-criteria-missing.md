# Intake Item: agentdev-deep-review SPEC の自律審議継続セクション欠落（TS-005 FAIL）

## 発生源

- PR: #1832 (Issue #1830 / OU-002, Epic #1828 Wave 1)
- 発生 phase: case-run での SPEC 内容検証（TS-005）時
- capture 分類: intake（具体的修正対象、積み残し作業候補）

## 問題

`docs/specs/skills/agentdev-deep-review.md` は AG-009 が合意した「関連コンテキストから判断可能な限り自律審議を継続すること」の肯定表現と、継続時に試みる8手続き（前提確認、根拠確認、誤解解消、適用範囲の限定、部分合意の探索、代替案の比較、追加証拠による再評価、批判内容の再構成）を明記していない。SPEC line 49「関連コンテキストから解決できない場合に限定して、未解決争点をユーザーへ返す」は対偶であり論理等価だが、肯定表現と8手続きの列挙が acceptance criteria（TS-005）で要求されている。

配布スキル references/deep-review-protocol.md「自律審議継続」セクションは8手続きを実装詳細として保持しているが、SPEC は振る舞い契約の正典であり SPEC 側での補完が必要。

## 推奨修正対象

`docs/specs/skills/agentdev-deep-review.md` へ「自律審議継続」セクションを新設し、肯定表現と8手続きを明記する。

候補セクション（PR #1832 SPEC確定候補 SC-1 より）:

```markdown
## 自律審議継続
- 関連コンテキストから判断可能な限り、自律審議を継続する。
- 継続時、次の8手続きを順不同で試みる: 前提確認、根拠確認、誤解解消、適用範囲の限定、部分合意の探索、代替案の比較、追加証拠による再評価、批判内容の再構成。
```

## 推奨対応

後続 spec-update Issue（`/agentdev/req-define` → `/agentdev/spec-save` 相当）で本 SPEC への追記を実施する。RU-20260726-01 AG-009 由来の合意事項であるため、新規 RU より既存 RU の再参照が適切。

## 関連

- SPEC: docs/specs/skills/agentdev-deep-review.md
- 正規 REQ: docs/requirements/REQ-003.md REQ-003-032（自律審議継続）
- source RU: RU-20260726-01 AG-009
- Issue: #1830 (CLOSED/COMPLETED), Epic: #1828 (CLOSED/COMPLETED)
- PR: #1832 (Findings / Capture候補 セクション F-1)
- 実装詳細参照先: src/opencode/skills/agentdev-deep-review/references/deep-review-protocol.md「自律審議継続」
