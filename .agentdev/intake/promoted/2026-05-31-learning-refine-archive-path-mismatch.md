# learning-refine の archive.md 参照が実際のファイル構成（archive/active.md）と不一致

## 観測内容

learning-refine コマンド定義および agentdev-learning-pipeline スキルが、archive のパスを `.agentdev/learning/archive.md`（フラットファイル）として記述している。実際のファイル構成は `.agentdev/learning/archive/active.md`（ディレクトリ内のファイル）。

## 影響

- learning-refine コマンド定義内の `archive.md` 参照が実態と乖離
- agentdev-learning-pipeline スキルの Artifact Lifecycle セクションも `archive.md` を参照
- 今後の実行でパス解釈の揺れがバグを引き起こす可能性

## 既存要件との関連

- **REQ-0039 / REQ-0017-009**: `.agentdev/learning/archive/active.md` 構成を定義（README.md のディレクトリ構成記載）
- **agentdev-learning-pipeline スキル**: Artifact Lifecycle セクションで `archive.md` を参照（乖離あり）
- **learning-refine コマンド定義**: 手順内で `archive.md` を参照（乖離あり）

## 課題

コマンド定義・スキルの参照パスと実際のファイル構成に不一致がある。どちらを正とするかで対応方針が変わる。

## 対応方針の方向性

1. **案A: 実態（`archive/active.md`）にパス参照を合わせる** — README.md の構成記載を正とし、コマンド定義・スキルのパス参照を修正
2. **案B: フラット（`archive.md`）に構成を戻す** — コマンド定義・スキルに合わせて実ファイル構成を変更

案A が推奨（README.md / REQ-0039 が既に正として運用されており、変更範囲が小さいため）。

## 備考

- 今回の learning-refine 実行では正しく解釈されたが、エージェント・セッションが変わると誤動作リスクあり
- 修正対象はコマンド定義・スキル内のテキスト（コード変更なし）
