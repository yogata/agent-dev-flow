# document-model.md の 6 処置モデル間の相互参照

## 観測内容

`docs/specs/foundations/document-model.md` の L153 と L580 は、KEEP、MERGE、REFERENCE、MOVE、RETIRE、INFERENCE の 6 処置を定義する。
L153 は昇格前の適格性判定、L580 は cleanup 実行モデルであり、適用フェーズと参照する正規所有契約が異なる。

## 影響

同じ処置名が関係の説明なしに現れるため、読者が重複定義または競合する契約と誤認する可能性がある。

## 課題

二つのモデルを統合せず、それぞれの役割と関係を SPEC 内で追跡可能にする必要がある。

## 既存要件、仕様との関連

- `docs/specs/foundations/document-model.md` L153-201
- `docs/specs/foundations/document-model.md` L580-639
- PR #1848、Issue #1847、Epic #1845

## 対応方向

L163 の「既存成果物の6処置」から L580 の cleanup 実行契約を参照し、L607 の「6 処置モデル」から L153 の適格性判定を参照する。
統合は行わない。

## 発生源

PR #1848 の Findings / Capture候補 F-1。
