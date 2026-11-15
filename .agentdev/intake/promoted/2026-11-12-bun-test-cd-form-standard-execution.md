# bun test の directory/glob 引数が当環境で whole-cwd fallback し正規 3 分割は cd-form が標準実行形になる運用条件

## 観測内容

- Case #4005（PR #4020 本文 Findings/intake 候補・DEL-4014-2 で記録・case-close 再検証でも同条件で再現）で記録。`bun test` の directory/glob 引数が当環境で whole-cwd fallback するため、directory 引数付き実行（例: `bun test .opencode/plugins/ ./scripts/`）が意図しない cwd 全体の suite 実行に切り替わる。
- 正規 3 分割の実行は cd-form（`cd <suite-dir> && bun test`）を標準とする。②のみ単一 directory 引数 `./src/` が正規形どおり動作し、files 数 110 で fallback 無しを確認。
- 固定基線（2026-11-10・3 分割正規形 5,598 試験）の計測も cd-form を前提にしており、引数形式の混在は計数の環境差を生む。

## 影響

- bun test の実行形（directory 引数 vs cd-form）の混在が suite 計数の環境差・意図しない cwd 全体実行を生み、基線対照の突合精度を低下させ得る。運用手順の標準実行形が手順記述に明文化されていない。

## 課題

- 正規 3 分割の実行手順（機械工程 script・委譲 prompt・基線固定記録）の実行形を cd-form に統一するか、bun の directory 引数解決の挙動差を検査で明示する。要否を判断して実施する。

## 既存要件との関連

- Case #4005・PR #4020（検証差分 #3・TS-005/TS-007 正規 3 分割）・固定基線記録（.agentdev/tmp/c-alpha2-baseline/known-failures-fixed.md）
