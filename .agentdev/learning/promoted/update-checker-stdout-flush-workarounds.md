# checker CLI stdout 損失・破損に対する安定実行経路の例外補完（Bun.YAML 依存・JSON 末尾破損）

## 背景

Windows + bun は当リポジトリの標準検証環境であり、checker CLI の stdout 機械可読出力を証跡として取得する運用が日常的である。既存知識文書は「モジュール import 経路を標準、CLI 経由は flush 保証終了を例外」と定めるが、Bun.YAML 依存 checker は node モジュール import 経路を使えず、例外経路の具体的な回避手順が未整備のまま実運用で対処が繰り返された（PR #2812、PR #2817）。

## 問題

1. Bun.YAML 依存 checker は `node --experimental-strip-types` による import 経路（安定経路）を利用できないため、bun 直実行となり process.exit による stdout flush 前終了でレポートが失われる。既存知識文書に Bun.YAML 依存 checker 向けの flush 保証ラッパー実行手順が明記されていない（学びエントリが「既存知識文書に明記されていない」と未記載箇所を明示）。
2. bun CLI 経由の checker `--json` 出力が Windows で末尾破損（途中破損）する事例があり、JSON パース不能となる。既存知識は stdout 全体ロスと cp932 再解釈を扱うが、JSON 出力の部分的破損という variant とその切替手順（human readable 出力 + node 単独実行）が未記載である。

## 望ましい変更

既存知識文書（checker CLI stdout ロス）の例外経路節へ、次の2点を追記する。

- Bun.YAML 依存 checker 向け: `Bun.write(Bun.stdout)` による flush 保証ラッパー手順（stdout を一時ファイルへ書き出し、flush を保証してから出力し、実行後に一時ファイルを削除する）。
- `--json` 出力の末尾破損対処: JSON 機械可読出力が破損する場合は human readable 出力に切り替え、可能な場合は node 単独実行で再取得する手順。

併せて checker 実行契約 Design「安定実行経路」の例外経路記述に本手順を補完する候補を整理する（確定は req-define の変更影響分析による）。

## 対象範囲

### 対象

- docs/knowledge/checker-cli-stdout-loss-on-windows-bun.md（例外経路節への追記）
- docs/designs/integrity/checker-execution-contracts.md（安定実行経路の例外補完候補。情報候補として記録）

### 対象外

- checker スクリプト本体の flush 制御実装の変更
- bun / node のバージョン変更・環境変更
- stdout ロス本体（process.exit 由来）と cp932 再解釈の既存記載（変更しない）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| knowledge | docs/knowledge/checker-cli-stdout-loss-on-windows-bun.md | 知識内容・適用条件へ Bun.YAML 依存 checker 向け flush 保証ラッパー手順と JSON 末尾破損時の切替手順を追記 |
| Design | docs/designs/integrity/checker-execution-contracts.md | 安定実行経路の例外経路に Bun.YAML 依存系の具体手を補完する候補 |

## 既存対策確認

- **確認結果**: 既存対策あり（fix gap）
- **該当ファイル**: docs/knowledge/checker-cli-stdout-loss-on-windows-bun.md、docs/designs/integrity/checker-execution-contracts.md
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 既存知識はモジュール import 経路（標準）と CLI 経由 flush 保証終了（例外）を定めるが、(a) node import 経路を使えない Bun.YAML 依存 checker 向けの具体的ラッパー手順、(b) JSON 出力末尾破損 variant と human readable + node 単独実行への切替手順が未記載。

## 制約

- 知識文書は知識内容 / 適用条件 / 適用対象 / 根拠 / 関連知識の5項目構成と frontmatter 規約（title / created / updated、kebab-case slug）を維持する。
- docs/knowledge/ への直接保存は backlog-review の利用者承認後に行う（本成果物は pre-backlog-review の staging である）。
- checker 実行契約 Design の更新は別案として整理し、知識文書更新と bundling しない。

## 受け入れ条件

- [ ] Bun.YAML 依存 checker の実行時に本手順で stdout 証跡が失われず取得できることが実例で確認できる
- [ ] JSON 出力の末尾破損が発生した場合の切替手順（human readable + node 単独実行）が知識文書に記載される
- [ ] 追記後も知識文書の5項目構成・frontmatter 規約が維持される

## 元learning item / 根拠

- **要約**: Windows + bun 環境の checker CLI 実行で stdout 証跡が失われる・破損する問題のうち、既存知識が未カバーの2 variant（Bun.YAML 依存系の flush 保証ラッパー、--json 末尾破損時の切替）を例外経路手順として整備する。
- **根拠**:
  - case 2805 Wave 1 / case 2812（PR #2812、DEL-2806-1）: Bun.YAML 依存のため node import 経路が使えず、Bun.write(Bun.stdout) による flush 保証ラッパー（一時ファイル、実行後に削除）で対処。同手順は既存知識文書に明記されていなかった。
  - case 2805 OU-004（PR #2817、DEL-2809-1）: bun CLI 経由の checker --json 出力が Windows で途中破損。human readable 出力 + node 単独実行へ切り替えて回避。checker 実行契約の「stdout flush 前 exit」回避策の実例。
- **再発条件**: Bun.YAML 依存 checker、または CLI 経由で --json 出力を取得する checker を Windows + bun で実行する場合。
- **横展開可能性**: Windows + bun 環境で checker CLI を実行するプロジェクト全般（高。当リポジトリ標準環境）。

## 推奨Issue分類

- **分類**: chore
- **推奨ラベル**: documentation
- **関連Issue**: なし（観測元: PR #2812、PR #2817、Issue #2806、Issue #2809）
