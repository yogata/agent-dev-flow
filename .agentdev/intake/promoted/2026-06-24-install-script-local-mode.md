# install-consumer-opencode.ps1 への local mode（consumer-generated）リンク設定欠落

## 観測内容

`scripts/install-consumer-opencode.ps1` L13-L14 は `consumer-with-agentdev`（通常版）向け実装のみを提供する。`consumer-generated`（ローカル版）向けの agentdev-gh-cli → `src/opencode-local/agentdev-gh-cli/` リンク設定を欠いている。出典: `inbox/2026-06-23-epic1093-wave3-install-script-local-mode-missing.md`。

発生源は Epic #1093 Wave 3 / Issue #1096（REQ-0134 APPEND）/ PR #1100（squash 27a28730, 2026-06-23 merge）/ case-close Step 10 Capture（F-002）。

REQ-0103-158 はローカル版 link 構成（agentdev-gh-cli のみ `src/opencode-local/` へ接続、それ以外は `src/opencode/` へ接続）を定める。本スクリプトは runtime-package-boundary SPEC が規定する「link mode の接続手順の技術詳細」に該当するが、Wave 3 #1096 の対象外であったため未実装のまま残置された。

## 影響

- ローカル版導入が手動になります: スクリプト経由で consumer-generated 構成を組めないため、ローカル版利用者は agentdev-gh-cli リンク差し替えを手作業で行う必要がある。手順の正しさが個人の文書読解に依存する。
- ADR-0131 link mode 統一の最終工程が未完: ADR-0131 は通常版とローカル版を link mode に統一する決定（決定 #1, #3）。ローカル版側の接続手順を実装するスクリプトがない状態は、決定の技術的実装が途中で止まっている。
- REQ-0103-158 違反の恐れ: 要件が定めるローカル版 link 構成を提供する配布物がないため、配布基盤としての要件充足性に疑義が生じる。

影響範囲はローカル版（consumer-generated）を採用する外部 consumer プロジェクトの導入体験と、REQ-0103-158 / ADR-0131 / runtime-package-boundary SPEC の技術的完結性。

## 課題

`scripts/install-consumer-opencode.ps1` にローカル版（consumer-generated）向けの agentdev-gh-cli リンク差し替え手順を実装する。REQ-0103-158 と ADR-0131 決定 #3 が定める構成（agentdev-gh-cli のみ `src/opencode-local/` へ、それ以外は `src/opencode/` へ）をスクリプト操作で完結させる。

## 既存要件との関連

- REQ-0103-158: ローカル版 link 構成（agentdev-gh-cli のみ `src/opencode-local/` へ接続）を定める。本件はこの要件の配布スクリプト側実装不足。
- REQ-0134（配布基盤: source/projection・sync・repo type・consumer install）: install-consumer-opencode.ps1 の位置づけ要件。Wave 3 #1096 は APPEND 対応で本件を含まなかった。
- ADR-0131（accepted, 決定 #1, #3）: 通常版とローカル版を link mode に統一し、ローカル版は agentdev-gh-cli のみ `src/opencode-local/agentdev-gh-cli/` へ接続すると決定。
- ADR-0130（accepted）: agentdev-gh-cli を差し替え可能な I/O 境界として確立。link 差し替えの前提。
- SPEC `docs/specs/runtime-package-boundary.md`: link mode の接続手順の技術詳細領域を規定。本スクリプトがその実装担当。
- ADR-0126（superseded）: 旧生成方式時代の install 想定。link mode 移行で本スクリプトも再構成が必要。

不足: local mode スイッチ（例: `-LocalMode`）または別スクリプトの設計判断が未確定。runtime-package-boundary SPEC に「link mode 接続手順技術詳細」領域の明文化も未実施（inbox 推奨対応先より）。

## 整形の方向性

種別は feature（配布スクリプト拡張）。実装は PowerShell だが、設計判断を含むため RU で要件を確定してから case 化する。

想定する RU 働き:

- 設計判断: 既存スクリプトへ `-LocalMode` スイッチを追加するか、別スクリプト（例: `install-consumer-opencode-local.ps1`）を新設するかを決定。既存 README の更新手順（`./scripts/install-consumer-opencode.ps1 -Mode apply`）との整合も考慮。
- 実装: 選択した方式で、agentdev-gh-cli のみ `src/opencode-local/agentdev-gh-cli/` へ、それ以外を `src/opencode/` へ接続するリンク作成を実装。
- SPEC 整備: runtime-package-boundary SPEC へ「link mode 接続手順技術詳細」領域を新設し、スクリプトの契約を明記。
- 受入基準候補:
  - ローカル版導入がスクリプト 1 実行で完結する。
  - 生成物が REQ-0103-158 と ADR-0131 決定 #3 の構成に一致する（agentdev-gh-cli のみ `src/opencode-local/` 接続）。
  - README と `.gitignore` 推奨設定が local mode に対応する。
  - `./scripts/check-consumer-opencode.ps1` が local mode のリンク状態を検出できる。
- 優先度目安: 中。ローカル版 consumer は限定的だが、ADR-0131 完結と REQ-0103-158 充足の観点で放置できない。
- バンドル: 単独処理。FILE 1（文書側旧用語掃除）と連動するが、本件は配布スクリプトの新規実装を含むため独立 RU が自然。FILE 1 完了後に本 RU を実行すれば、スクリプトとガイド文書の整合が同時に取れる。
