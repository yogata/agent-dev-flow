---
id: 2026-11-22-req055-isolated-evidence-acquisition-gap
created_at: 2026-11-22T03:40:00+09:00
source: backlog-auto 一式 20261121-171426 stage5 case-close・子 Issue #4186（OU-008・TS-008）の受入評価
status: unreviewed
---

REQ-055 が定める production-equivalent 検証基準（実 workflow 実行での観測証跡）を、一式実行の工程境界内で取得できない構造上のギャップ。#4186 の完了条件1「実 req-define workflow 実行で IR-044 シグナル語を含むテスト入力の draft 組立時に走査が発火し表記ガイダンス適用が記録されること」は、(a) 新規一式禁止の境界内では req-define 単独起動の正規入口が存在せず、(b) 公開入口から STEP-6（draft 組立）のみを隔離実行する runner も実装されていないため、本一式の実行内では証拠取得手段が不在だった。

利用者仲裁（2026-11-22・案A）: 条件1は不成立と正直に記録し #4186 は blocked で追跡・完遂判定から除外。実装と条件2（IR-044 検出 0 件）は有効のまま v5.2.4 をリリースした。

観点: (1) 検証手段が実 workflow 観測を要求する要件（REQ-055 系）を一式に含める場合、証拠取得経路（当該 workflow を通る一式構成か隔離 runner）を要件定義時点で確認する手順候補。(2) req-define の STEP-6 相当を隔離実行できる検証 runner の整備要否（workflow 側の実装変更を伴うため要件化して判断）。
