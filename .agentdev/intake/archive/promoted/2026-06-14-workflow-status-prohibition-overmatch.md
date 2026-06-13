# workflow-status-prohibition 検査が廃止説明文を誤検出している可能性

## 観測

`workflow-status-prohibition` 検査が REQ/SPEC 内の workflow status / 6 マイクロフェーズ記述を検出したが、`docs/requirements/REQ-0105.md:113` は「status 管理廃止に伴い不要」と廃止を説明する文言であり、状態管理の定義ではない。検出 heuristic が文脈を区別できていない可能性がある。

### 対象箇所

- `docs/requirements/REQ-0105.md:79`（対象: 廃止済み lifecycle 語の列挙）
- `docs/requirements/REQ-0105.md:113`（「status 管理廃止に伴い不要」）
- `docs/specs/patterns.md:52`（`status`/`scale` フィールドを持たない、という否定記述）
- 件数: NG 3（`workflow-status-prohibition`）

## 影響

REQ-0108-123（REQ/SPEC での workflow status 定義禁止）の真正な違反を見出しにくくするノイズとなる。

## 推奨対応

(a) 該当箇所の文言を heuristic に引っかからない表現に整理する、(b) 廃止・否定文脈を除外するよう heuristic を精緻化する、のいずれかまたは両方。

## 分類

- finding category: workflow-gap
- route: intake
- 原因: 仮説（廃止説明文の誤検出の可能性、真正違反の可能性も残る）

## 根拠

- 検査: `workflow-status-prohibition`（strict）
- 根拠: REQ-0108-123
