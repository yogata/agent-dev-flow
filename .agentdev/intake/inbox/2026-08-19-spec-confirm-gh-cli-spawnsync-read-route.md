# agentdev-gh-cli SPEC の READ 手続き記述への spawnSync 経路追記要否

## 観測

PR #2256 により references/standard-procedures.md へ spawnSync + fs.writeFileSync（UTF-8 明示、status/stdout 分離取得）の stdout 退避形式と execSync 維持境界（成功が見込める単発 READ は維持）が明記された。一方、docs/specs/skills/agentdev-gh-cli.md（status: accepted）の READ 手続き関連記述は詳細を references へ委任しており、SPEC 本文への同経路の追記は必須ではない状態にある。

## 今回扱わない理由

case-close STEP-3-2 判定で (c) 見送り。SPEC と references 間に矛盾はなく、SPEC は accepted のため draft → accepted 昇格対象外。

## 影響

SPEC 本文を読むだけでは spawnSync 経路の存在を認知できない。配布 Skill の詳細手順は references が原本扱いであるため運用上の支障はない。

## レビューで決めること

- SPEC「Windows 環境固有手続き」の READ 手続き関連記述へ、exit code が意味を持つコマンドの spawnSync 経路（status/stdout 分離取得 + UTF-8 明示退避）を1行レベルで言及するか、references 委任のままとするか

## 根拠

- PR 2256 本文「SPEC確定候補」（回収元: https://github.com/yogata/agent-dev-flow/pull/2256）
