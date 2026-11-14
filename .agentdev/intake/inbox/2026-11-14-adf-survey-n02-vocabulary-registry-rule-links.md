# 語彙対照表の規則文書への未解決リンク3件（ADF簡素化調査 N-02）

## 観測事実

- `.opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md` 340行・363行の IR-055・IR-065・IR-066 の規則文書への相対リンク3件が `../../../docs/...` で未解決。規則文書は `docs/designs/integrity/rules/` に実在し、正しい深さは `../../../../docs/...`。
- 基準コミット f7860194 にも同一のリンクが存在する。

## 具体的な修正対象

- 3リンクの修正。N-01 と同一の移動・階層変更への編集の追随漏れと推定（原因は仮説）。

## 関連

- 同一調査の N-01
