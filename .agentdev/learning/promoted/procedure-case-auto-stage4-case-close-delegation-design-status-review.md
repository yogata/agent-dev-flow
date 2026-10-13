# case-auto stage 4 の case-close 委譲指示への Design 状態評価必須項目化

## 背景

case-auto stage 4（case-close 委譲起動）で、委譲指示の MUST DO に Design 状態評価（棚卸し制）を含めなかったため、両 v51 Design（工程駆動コラボレーションモデル、工程遷移・併存モデル）が status draft のまま両 Epic がクローズされた（#3653/#3654 最終 case-close）。Design README 横断 Design 一覧への行登録も case-ready で漏れていた。STEP-8 完了報告前の親側最終検証で Epic 本文の記載と Design frontmatter 実状態の突合により draft 残存を検出し、親が case-close STEP-3-2 相当の棚卸し評価を実施して回復した（両 Design accepted 昇格・README 一覧登録・既存本文 textlint prh 違是正・昇格証跡保存・commit ee2a1bd1）。

## 問題

委譲先は指示された項目のみを実行するため、委譲指示の MUST DO から Design 状態評価が落ちると、そのまま工程漏れになる。Epic ルートの「Design 状態評価の Wave 内集約」（E4-3）を委譲指示へ明示的に列挙していなかったことが根本原因であり、case-auto Design「委譲指示の構築規律（case-ready・case-close の並列委譲起動）」節には並列実行・静的検査の規律は規定されているが、Design 状態評価・Design README status 列更新の必須項目列挙が存在しない（2026-10-13 grep 実測: case-auto.md L223-230）。

## 望ましい変更

case-auto Design「委譲指示の構築規律（case-ready・case-close の並列委譲起動）」節へ、case-close 委譲指示の MUST DO に Design 状態評価（棚卸し制）と Design README status 列更新を必須項目として含める規律を追加する。

## 対象範囲

### 対象

- case-auto Design「委譲指示の構築規律（case-ready・case-close の並列委譲起動）」節（docs/designs/commands/case-auto.md L223 付近）
- case-close 委譲指示テンプレート相当の構築手順

### 対象外

- case-close STEP-3-2 の棚卸し評価手順自体の変更（既存契約どおりの回復事例であり、工程契約は変更しない）
- Epic Wave クローズ契約・capture 回収契約の変更

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| Design | docs/designs/commands/case-auto.md | 「委譲指示の構築規律」節への Design 状態評価（棚卸し制）・Design README status 列更新の必須項目追加 |

## 既存対策確認

- **確認結果**: 既存対策あり（部分）
- **該当ファイル**: docs/designs/commands/case-auto.md「委譲指示の構築規律」節（L223-230: 並列実行・静的検査の規律を規定）
- **ギャップ分類**: fix gap（必須項目列挙の欠落）
- **ギャップ詳細**: case-close 委譲指示に Design 状態評価（棚卸し制）・Design README status 列更新を必須項目として含める規律が節内に規定されていない。委譲指示の構築時に workflow skill の STEP 表網羅確認を行う規律も明示されていない

## 制約

- 実害は回復済み（親による棚卸し評価・両 Design accepted 昇格・昇格証跡 4 必須項目の対応記録コメント保存済み・commit ee2a1bd1）
- case-close Design 状態評価の既存契約は変更せず、委譲指示構築側の列挙補完に限定する
- Design 状態評価を親実行に留保する現行契約と矛盾しない形（委譲指示への必須列挙）とする

## 受け入れ条件

- [ ] case-close 委譲指示の構築規律に Design 状態評価（棚卸し制）が必須項目として列挙される
- [ ] Design README status 列更新が必須項目として含まれる
- [ ] 既存の並列委譲起動契約・case-close Design 状態評価契約と非競合である

## 元learning item / 根拠

- **要約**: case-auto 親が case-close 委譲を起動する際の指示で Design 状態評価（棚卸し制）が漏れ、Design が draft のまま Epic クローズに至った事象（#3653/#3654 最終 case-close）
- **根拠**: 委譲先は指示された項目のみ実行するため指示漏れはそのまま工程漏れになる。Epic 本文の「status: draft は case-close の docs 検証・Design 確定工程で扱う」記載から draft 残存を検出
- **再発条件**: case-auto 親が case-close 委譲を指示するときに Design 状態評価を指示項目から落とした場合
- **横展開可能性**: 委譲プロンプトの構築は workflow skill の STEP 表を網羅確認してから行う規律は、case-ready・case-close 以外の委譲指示構築（case-run を含む）にも適用可能

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: bug
- **関連Issue**: なし（参考: commit ee2a1bd1・コメント 6131559584 / 6131562314）
