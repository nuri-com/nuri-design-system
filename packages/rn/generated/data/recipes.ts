/* ──────────────────────────────────────────────────────────────
 * NURI · BAKED GEOMETRY RECIPES · GENERATED · DO NOT EDIT BY HAND
 *
 * Source · the FROZEN descriptors (packages/spec/components/*.ts) resolved
 * through the single-sourced box/stack MAPPING (resolve-map STACK_FIELDS/
 * BOX_FIELDS + property-spelling `.rn` + the dimension scales).
 * Emitter · scripts/parsers/recipes.js — run `npm run build`.
 *
 * The build-time-STATIC geometry slice (Arc 2 · D11 + D5): box/stack resolved to
 * concrete ViewStyle ONCE, keyed by component → part; typography + interactive as
 * the RAW mergeable namespace partials (merged + realized at runtime by the same
 * appliers the runtime resolver uses). The RN runtime LOADS + composes this
 * (flattenBakedPart · runtime/resolve.ts) instead of re-resolving every render. COLOUR-FREE
 * by construction — NO backgroundColor / fg / pressedBg / hex / accent·mode variant;
 * colour is the Arc-1 runtime theme path, merged on at render. Bound byte-for-byte
 * to the TS runtime resolver by the oracle-equivalence guard (full node + style ·
 * __tests__/geometry-bake.test.ts).
 * ────────────────────────────────────────────────────────────── */

import type { BakedComponentRecipe } from '../../runtime/resolve';

export const recipes: Record<string, BakedComponentRecipe> = {
  "alert": {
    "root": {
      "el": "view",
      "open": true,
      "geometry": {
        "base": {
          "flexDirection": "row",
          "alignItems": "center",
          "gap": 6
        },
        "variants": {
          "variant": {
            "soft": {
              "minHeight": 54,
              "padding": 12,
              "paddingStart": 18,
              "borderRadius": 9999
            }
          }
        }
      }
    },
    "icon": {
      "el": "icon",
      "geometry": {
        "base": {
          "width": 18,
          "height": 18
        },
        "variants": {}
      }
    },
    "message": {
      "el": "text",
      "geometry": {
        "base": {
          "flexGrow": 1,
          "flexShrink": 1,
          "minWidth": 0
        },
        "variants": {}
      },
      "typography": {
        "base": {
          "size": "sm",
          "emphasis": true,
          "align": "start",
          "flow": "truncate",
          "lines": 1
        }
      }
    }
  },
  "button": {
    "root": {
      "el": "pressable",
      "geometry": {
        "base": {
          "flexDirection": "row",
          "alignItems": "center",
          "justifyContent": "center"
        },
        "variants": {
          "size": {
            "sm": {
              "gap": 4,
              "minHeight": 36,
              "paddingHorizontal": 18,
              "borderRadius": 9999
            },
            "lg": {
              "gap": 6,
              "minHeight": 54,
              "paddingHorizontal": 24,
              "borderRadius": 9999
            }
          },
          "fill": {
            "even": {
              "flexGrow": 1,
              "flexShrink": 1,
              "flexBasis": 0,
              "minWidth": 0
            },
            "hug": {
              "flexGrow": 0,
              "flexShrink": 0
            }
          }
        }
      },
      "interactive": {
        "base": {
          "pressColor": true,
          "pressScale": true,
          "disabledOpacity": true
        }
      }
    },
    "label": {
      "el": "text",
      "geometry": {
        "base": {},
        "variants": {}
      },
      "typography": {
        "variants": {
          "size": {
            "sm": {
              "size": "sm",
              "emphasis": true,
              "flow": "truncate",
              "lines": 1
            },
            "lg": {
              "size": "md",
              "emphasis": true,
              "flow": "truncate",
              "lines": 1
            }
          }
        }
      }
    },
    "icon": {
      "el": "icon",
      "geometry": {
        "base": {},
        "variants": {
          "size": {
            "sm": {
              "width": 18,
              "height": 18
            },
            "lg": {
              "width": 24,
              "height": 24
            }
          }
        }
      }
    }
  },
  "icon-avatar": {
    "root": {
      "el": "view",
      "geometry": {
        "base": {
          "alignItems": "center",
          "justifyContent": "center",
          "width": 48,
          "height": 48,
          "borderRadius": 9999
        },
        "variants": {}
      }
    },
    "icon": {
      "el": "icon",
      "geometry": {
        "base": {
          "width": 24,
          "height": 24
        },
        "variants": {}
      }
    }
  },
  "topbar": {
    "root": {
      "el": "view",
      "open": true,
      "geometry": {
        "base": {
          "flexDirection": "row",
          "alignItems": "center",
          "gap": 6,
          "height": 54,
          "paddingStart": 18,
          "paddingEnd": 18,
          "paddingTop": 6
        },
        "variants": {}
      }
    },
    "leading": {
      "el": "view",
      "geometry": {
        "base": {
          "flexDirection": "row",
          "alignItems": "center",
          "flexGrow": 1,
          "flexShrink": 1,
          "flexBasis": 0,
          "minWidth": 0
        },
        "variants": {}
      }
    },
    "center": {
      "el": "view",
      "geometry": {
        "base": {
          "flexDirection": "row",
          "alignItems": "center",
          "justifyContent": "center"
        },
        "variants": {}
      }
    },
    "trailing": {
      "el": "view",
      "geometry": {
        "base": {
          "flexDirection": "row",
          "alignItems": "center",
          "justifyContent": "flex-end",
          "gap": 6,
          "flexGrow": 1,
          "flexShrink": 1,
          "flexBasis": 0,
          "minWidth": 0
        },
        "variants": {}
      }
    }
  },
  "icon-button": {
    "root": {
      "el": "pressable",
      "geometry": {
        "base": {
          "flexDirection": "row",
          "alignItems": "center",
          "justifyContent": "center",
          "gap": 6,
          "minHeight": 48,
          "minWidth": 48,
          "paddingHorizontal": 12,
          "borderRadius": 9999
        },
        "variants": {}
      },
      "interactive": {
        "base": {
          "pressColor": true,
          "pressScale": true,
          "disabledOpacity": true
        }
      }
    },
    "icon": {
      "el": "icon",
      "geometry": {
        "base": {
          "width": 24,
          "height": 24
        },
        "variants": {}
      }
    }
  },
  "list": {
    "root": {
      "el": "view",
      "open": true,
      "geometry": {
        "base": {
          "flexDirection": "column",
          "alignItems": "stretch",
          "paddingHorizontal": 6
        },
        "variants": {}
      }
    }
  },
  "list-action": {
    "root": {
      "el": "pressable",
      "geometry": {
        "base": {
          "flexDirection": "row",
          "alignItems": "center",
          "gap": 12,
          "padding": 12,
          "borderRadius": 18
        },
        "variants": {}
      },
      "interactive": {
        "base": {
          "pressColor": true,
          "disabledOpacity": true
        }
      }
    },
    "content": {
      "el": "view",
      "geometry": {
        "base": {
          "flexDirection": "column",
          "alignItems": "stretch",
          "justifyContent": "center",
          "flexGrow": 1,
          "flexShrink": 1,
          "minWidth": 0
        },
        "variants": {}
      }
    },
    "text": {
      "el": "text",
      "geometry": {
        "base": {},
        "variants": {}
      },
      "typography": {
        "base": {
          "size": "md",
          "emphasis": true,
          "align": "start",
          "flow": "truncate",
          "lines": 1
        }
      }
    },
    "textMuted": {
      "el": "text",
      "geometry": {
        "base": {},
        "variants": {}
      },
      "typography": {
        "base": {
          "size": "sm",
          "align": "start",
          "flow": "truncate",
          "lines": 1
        }
      }
    },
    "trailing": {
      "el": "view",
      "geometry": {
        "base": {
          "flexDirection": "column",
          "alignItems": "flex-end",
          "justifyContent": "center"
        },
        "variants": {}
      }
    },
    "trailingText": {
      "el": "text",
      "geometry": {
        "base": {},
        "variants": {}
      },
      "typography": {
        "base": {
          "size": "md",
          "emphasis": true,
          "align": "end",
          "flow": "truncate",
          "lines": 1
        }
      }
    },
    "trailingTextMuted": {
      "el": "text",
      "geometry": {
        "base": {},
        "variants": {}
      },
      "typography": {
        "base": {
          "size": "sm",
          "align": "end",
          "flow": "truncate",
          "lines": 1
        }
      }
    },
    "trailIcon": {
      "el": "icon",
      "geometry": {
        "base": {
          "width": 24,
          "height": 24
        },
        "variants": {}
      }
    }
  },
  "text-field": {
    "root": {
      "el": "view",
      "geometry": {
        "base": {
          "flexDirection": "column",
          "alignItems": "stretch",
          "gap": 12
        },
        "variants": {}
      }
    },
    "label": {
      "el": "text",
      "geometry": {
        "base": {},
        "variants": {}
      },
      "typography": {
        "base": {
          "size": "sm",
          "emphasis": true,
          "align": "start",
          "flow": "truncate",
          "lines": 1
        }
      }
    },
    "box": {
      "el": "view",
      "geometry": {
        "base": {
          "flexDirection": "row",
          "alignItems": "center",
          "height": 54,
          "paddingStart": 12,
          "paddingEnd": 6,
          "borderRadius": 9
        },
        "variants": {}
      }
    },
    "input": {
      "el": "input",
      "geometry": {
        "base": {
          "flexGrow": 1,
          "flexShrink": 1,
          "minWidth": 0
        },
        "variants": {}
      },
      "typography": {
        "base": {
          "size": "md",
          "align": "start"
        }
      }
    }
  },
  "tab-bar-item": {
    "root": {
      "el": "pressable",
      "geometry": {
        "base": {
          "flexDirection": "column",
          "alignItems": "center",
          "justifyContent": "center",
          "gap": 4,
          "flexGrow": 1,
          "flexShrink": 1,
          "flexBasis": 0,
          "minWidth": 0
        },
        "variants": {}
      },
      "interactive": {
        "base": {
          "pressScale": true
        }
      }
    },
    "icon": {
      "el": "icon",
      "geometry": {
        "base": {
          "width": 24,
          "height": 24
        },
        "variants": {}
      }
    },
    "label": {
      "el": "text",
      "geometry": {
        "base": {
          "paddingEnd": 6
        },
        "variants": {}
      },
      "typography": {
        "base": {
          "size": "xs",
          "emphasis": true,
          "flow": "truncate",
          "lines": 1
        }
      }
    }
  },
  "tab-bar": {
    "root": {
      "el": "view",
      "open": true,
      "geometry": {
        "base": {
          "flexDirection": "row",
          "alignItems": "stretch",
          "minHeight": 54,
          "paddingBottom": 12
        },
        "variants": {}
      }
    }
  },
  "bottom-sheet-panel": {
    "root": {
      "el": "view",
      "open": true,
      "geometry": {
        "base": {
          "flexDirection": "column",
          "alignItems": "stretch",
          "flexGrow": 1,
          "flexShrink": 0,
          "paddingBottom": 18,
          "borderTopLeftRadius": 18,
          "borderTopRightRadius": 18,
          "shadowOffset": {
            "width": 0,
            "height": -8
          },
          "shadowOpacity": 0.14,
          "shadowRadius": 20,
          "elevation": 16
        },
        "variants": {}
      }
    }
  }
};
