// rules/index.ts — 全ルールのレジストリ（カタログ自動生成の単一ソース）。
// 契約所有: docs/designs/integrity/integrity-engine-plugin-architecture.md
// 「カタログ自動生成（単一ソース）」。残存 24 ルール + IR-075（Wave-4 登録・REQ-122-011）。

import type { IntegrityRule } from "../engine/types.ts";
import { ir001 } from "./ir-001.ts";
import { ir002 } from "./ir-002.ts";
import { ir003 } from "./ir-003.ts";
import { ir004 } from "./ir-004.ts";
import { ir007 } from "./ir-007.ts";
import { ir008 } from "./ir-008.ts";
import { ir013 } from "./ir-013.ts";
import { ir016 } from "./ir-016.ts";
import { ir024 } from "./ir-024.ts";
import { ir044 } from "./ir-044.ts";
import { ir053 } from "./ir-053.ts";
import { ir055 } from "./ir-055.ts";
import { ir056 } from "./ir-056.ts";
import { ir058 } from "./ir-058.ts";
import { ir059 } from "./ir-059.ts";
import { ir061 } from "./ir-061.ts";
import { ir062 } from "./ir-062.ts";
import { ir063 } from "./ir-063.ts";
import { ir064 } from "./ir-064.ts";
import { ir067 } from "./ir-067.ts";
import { ir068 } from "./ir-068.ts";
import { ir069 } from "./ir-069.ts";
import { ir070 } from "./ir-070.ts";
import { ir071 } from "./ir-071.ts";
import { ir075 } from "./ir-075.ts";

/** 残存 24 コアルール + IR-075 のレジストリ（IR 番号順）。 */
export const rules: IntegrityRule[] = [
  ir001,
  ir002,
  ir003,
  ir004,
  ir007,
  ir008,
  ir013,
  ir016,
  ir024,
  ir044,
  ir053,
  ir055,
  ir056,
  ir058,
  ir059,
  ir061,
  ir062,
  ir063,
  ir064,
  ir067,
  ir068,
  ir069,
  ir070,
  ir071,
  ir075,
];
