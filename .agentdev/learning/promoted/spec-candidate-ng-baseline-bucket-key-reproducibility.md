# NG baseline bucket key の再現性契約（機械生成必須・パス正規化）（spec 候補）

## 背景

PR #2151（OU-002、Epic #2134 Wave 2）の case-run / case-close で、NG baseline の bucket key が完全一致（`category\tcheck\tfile\tevidence`）で決まることに起因する2件の運用障害が発生した。(1) 手書きでの承認済み baseline entry 追加は evidence 文字列の不一致で baseline が効かない。(2) worktree 環境（junction 未伝播）で機械生成した entry のパス表記（`src/opencode/...`）が main リポジトリ junction 環境の検出パス（`.opencode/...`）と一致せず、QG-4 で承認済み entry が「新規かつ未管理」と誤差分計上された。

## 問題

integrity-contracts SPEC「NG baseline 運用手順」は、baseline entry の追加方法（対象実行の findings JSON からの機械生成 `--update-ng-baseline --ng-baseline-additions`）と生成環境のパス解決依存性を契約として明文化していない。このため手書き追加の再発、および環境をまたぐ baseline 適用での unmatched additions / unmanaged delta の対処が都度の判断に委ねられる。

## 望ましい変更

1. baseline entry の追加は対象実行の findings JSON からの機械生成に限定し、手書き追加を禁止する旨を運用手順へ明文化する
2. パス bucket key の環境依存対策として、(a) checker 側のパス正規化（`.opencode/` と `src/` の換算）、または (b) baseline 適用時の unmatched additions と unmanaged delta の対を警告する機構、のいずれかを導入する
3. baseline 生成は検出環境と同一環境（junction 実在環境）で実行する前提を明記する

## 対象範囲

### 対象

- `docs/specs/integrity/integrity-contracts.md`（「NG baseline 運用手順」節）
- `check_integrity.ts` / `check_extensions.ts` の baseline 適用ロジック（パス正規化・対警告の実装候補）

### 対象外

- NG baseline の分類体系（approved additions / baseline-known 等の報告分類。intake item spec-cand-ng-baseline-legacy-provenance-reporting が管理中）
- baseline ファイルの形式変更（bucket key 仕様自体は維持）
- DEC-013（IR 登録モデル）の変更

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| spec | `docs/specs/integrity/integrity-contracts.md` | NG baseline 運用手順へ機械生成必須・手書き禁止・生成環境のパス解決前提を追記 |
| script | `check_integrity.ts` / `check_extensions.ts` | パス正規化または unmatched additions/unmanaged delta 対警告の実装（要 case-run） |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: `docs/specs/integrity/integrity-contracts.md`「NG baseline 運用手順」節（機械生成 CLI の手順は運用実例として存在）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 手書き追加禁止の明文化なし、パス bucket key の環境依存対策（正規化・対警告）なし。intake item（spec-cand-ng-baseline-legacy-provenance-reporting）は報告分類のみで本クラスの中核（機械生成必須・パス正規化）をカバーしない

## 制約

- `applyNgBaseline` の既存分類ロジック（approved additions / baseline-known 等）との整合を維持する
- パス正規化の導入は checker 実装修正を伴うため、SPEC 明文化と実装を分離して段階対応可能とする

## 受け入れ条件

- [ ] baseline entry 追加の機械生成必須・手書き禁止が運用手順に明文化されていること
- [ ] パス bucket key の環境依存性とその対策（正規化または対警告）が規定されていること
- [ ] baseline 生成環境の前提（検出環境と同一環境）が明記されていること

## 元learning item / 根拠

- **要約**: NG baseline の bucket key は category/check/file/evidence の完全一致であり、手書き再現が困難で、生成環境のパス解決に依存する
- **根拠**: (1) PR #2151（Issue #2136）case-run: ng-baseline.json への承認済み entry 15件追加で、手書きでは evidence 文字列不一致により baseline が効かないため、findings JSON からの additions manifest 機械生成（`--update-ng-baseline --ng-baseline-additions`）で対応。(2) 同 PR case-close QG-4: merged main で delta 1件（command-capture-duty / case-close.md）が「新規かつ未管理」と計上。実体は NG21 分類 N17 の承認済み entry だが、登録パス（worktree 生成の `src/opencode/...`）と検出パス（main junction 環境の `.opencode/...`）が不一致。N17 は新規ではなく承認済み baseline entry の適用範囲と判断し QG-4 は合格判定、パス key 不整合は intake item（intake-2026-08-16-ou002-ng17-case-close-capture-boundaries-ref）へ記録済み
- **再発条件**: findings JSON を介さず手書きで baseline entry を追加する場合、worktree 等 junction 未伝播環境で生成した baseline entry を junction 実在環境の検査に適用する場合
- **横展開可能性**: 中程度。baseline ratchet 運用を持つプロジェクト全般

## 推奨Issue分類

- **分類**: chore（SPEC 明文化が主体。正規化実装は派生）
- **推奨ラベル**: documentation, integrity, baseline
- **関連Issue**: #2136 (CLOSED)
