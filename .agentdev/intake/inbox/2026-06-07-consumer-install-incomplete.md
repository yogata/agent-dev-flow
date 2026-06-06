# Consumer repo install 完了条件12項目全未チェック

consumer repo install model（REQ-0103-072~077）の実装 Issue #614 で、完了条件12項目がすべて未チェックのままクローズされている。scripts/ への新スクリプト配置、root 直下旧スクリプト削除、consumer-project-setup.md / artifacts-and-state.md / README.md の更新、推奨 .gitignore 方針の記載等、consumer 導入に必要な作業の完了確認が記録されていない。

- `scripts/` 配下に `sync-self-opencode.ps1` / `install-consumer-opencode.ps1` / `check-consumer-opencode.ps1` の配置
- root 直下の `sync-opencode.ps1` 削除
- `consumer-project-setup.md` への `.agentdev-plugin/` と script 分離の反映
- `artifacts-and-state.md` への `.agentdev-plugin/` 責務追加
- `README.md` への consumer install section 追加
- Consumer install が public runtime artifacts のみを対象としていること
- 推奨 .gitignore 方針の consumer-project-setup.md 記載
- 各 script の dry-run / check / apply モード動作確認

## 根拠

- Issue #614: feat: implement consumer repo AgentDevFlow install method (REQ-0103-072~077)
  - 完了条件9項目・テスト戦略3項目がすべて未チェックでクローズされている
