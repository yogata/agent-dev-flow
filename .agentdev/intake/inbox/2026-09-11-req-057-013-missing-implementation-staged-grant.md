# REQ-057-013 missing-implementation の段階的宣言付与（fail-open 運用接続）

## 概要

REQ-057-013（REQ 文書の表記・文意の品質基準整合）が missing-implementation 82 件中の正当計上として現れた。旧宣言パーサでは `distribution-boundary.test.ts` 内の fixture 文字列（escape 隠蔽回帰テスト用）が REQ-057-013 の偽の実装宣言として計上されカバレッジが誤魔化されていたが、case 2771 の対象外判定実装で偽宣言が除外され、本来の missing-implementation として計上されるようになった（81 → 82 件）。REQ-057-013 の正規実装成果物は同テストファイルではないため宣言付与は case 2771 の対象外とし、REQ-057-023 の fail-open 段階的付与運用へ接続する残課題。

## 内容

- REQ-057-013 の正規実装成果物を特定し、実装対応宣言（implementation 役割）を正規配置先カタログに従い付与する
- 付与は REQ-057-023 の fail-open 段階的付与運用（missing-implementation 82 件の既知 delta 一覧と同様の段階解消）に接続する
- 対象行の特定には traceability check（missing-implementation findings の REQ-057-013 エントリ）を利用可能

## 根拠

- 観測元: PR 2772（case 2771 / issue 2771、`## Findings / Capture候補` セクション 2）、case-close（2026-09-11）で回収
- 元テキスト: 「REQ-057-013 missing-implementation の新規計上: 旧パーサでは distribution-boundary.test.ts 内の fixture 文字列（escape 隠蔽回帰テスト用）が REQ-057-013 の偽の実装宣言として計上されカバレッジが誤魔化されていた。対象外判定で偽宣言が除外され、本来の missing-implementation として計上されるようになった（81 → 82 件）。REQ-057-013（REQ 文書の表記・文意の品質基準整合）の正規実装成果物は同テストファイルではないため宣言付与は本 case の対象外とし、REQ-057-023 の fail-open 段階的付与運用へ接続」
- case-close 再確認: 実 corpus check（PR head babaedb2 / main 48b6a7b4）で missing-implementation 82 件中に REQ-057-013 の計上を確認済み
