/* ──────────────────────────────────────────────────────────────
 * NURI · BAKED GEOMETRY RECIPES · GENERATED · DO NOT EDIT BY HAND
 *
 * Source · the FROZEN descriptors (packages/spec/components/*.ts) resolved
 * through the single-sourced box/stack MAPPING (resolve-map STACK_FIELDS/
 * BOX_FIELDS + property-spelling `.rn` + the dimension scales).
 * Emitter · scripts/parsers/recipes.js — run `npm run build`.
 *
 * The build-time-STATIC geometry slice (Arc 2 · D11 + D5): box/stack/typography/
 * interactive resolved to concrete ViewStyle ONCE, keyed by component → part.
 * The RN factory LOADS + composes this (flattenBakedPart · resolve.ts) instead of
 * re-resolving every render. COLOUR-FREE by construction — NO backgroundColor / fg /
 * pressedBg / hex / accent·mode variant; colour is the Arc-1 runtime theme path,
 * merged on at render. Bound byte-for-byte to the TS runtime resolver by the
 * oracle-equivalence guard (factory/__tests__/geometry-bake.test.ts).
 * ────────────────────────────────────────────────────────────── */

import type { BakedComponentRecipe } from '../factory/resolve';

export const recipes: Record<string, BakedComponentRecipe> = {
  "button": {
    "root": {
      "el": "view",
      "geometry": {
        "base": {
          "flexDirection": "row",
          "alignItems": "center",
          "justifyContent": "center"
        },
        "variants": {
          "size": {
            "sm": {
              "minHeight": 36,
              "paddingHorizontal": 12,
              "borderRadius": 9999
            },
            "md": {
              "minHeight": 48,
              "paddingHorizontal": 18,
              "borderRadius": 9999
            },
            "lg": {
              "minHeight": 54,
              "paddingHorizontal": 24,
              "borderRadius": 9999
            }
          }
        }
      },
      "interactive": {
        "pressColor": true,
        "pressScale": true,
        "disabledOpacity": true,
        "pressedStatic": {
          "transform": [
            {
              "scale": 0.97
            }
          ]
        },
        "disabledStatic": {
          "opacity": 0.4
        }
      }
    },
    "label": {
      "el": "text",
      "geometry": {
        "base": {},
        "variants": {}
      },
      "typeStep": {
        "variants": {
          "size": {
            "sm": {
              "size": "sm",
              "emphasis": true
            },
            "md": {
              "size": "md",
              "emphasis": true
            },
            "lg": {
              "size": "md",
              "emphasis": true
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
          "paddingEnd": 18
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
      "el": "view",
      "geometry": {
        "base": {
          "flexDirection": "row",
          "alignItems": "center",
          "justifyContent": "center",
          "gap": 6
        },
        "variants": {
          "size": {
            "sm": {
              "minHeight": 36,
              "minWidth": 36,
              "paddingHorizontal": 6,
              "borderRadius": 9999
            },
            "md": {
              "minHeight": 48,
              "minWidth": 48,
              "paddingHorizontal": 12,
              "borderRadius": 9999
            },
            "lg": {
              "minHeight": 54,
              "minWidth": 54,
              "paddingHorizontal": 12,
              "borderRadius": 9999
            }
          }
        }
      },
      "interactive": {
        "pressColor": true,
        "pressScale": true,
        "disabledOpacity": true,
        "pressedStatic": {
          "transform": [
            {
              "scale": 0.97
            }
          ]
        },
        "disabledStatic": {
          "opacity": 0.4
        }
      }
    },
    "prefix": {
      "el": "text",
      "geometry": {
        "base": {},
        "variants": {
          "size": {
            "sm": {
              "paddingStart": 6
            },
            "md": {
              "paddingStart": 12
            },
            "lg": {
              "paddingStart": 18
            }
          }
        }
      },
      "typeStep": {
        "variants": {
          "size": {
            "sm": {
              "size": "sm",
              "emphasis": true
            },
            "md": {
              "size": "md",
              "emphasis": true
            },
            "lg": {
              "size": "md",
              "emphasis": true
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
            "md": {
              "width": 24,
              "height": 24
            },
            "lg": {
              "width": 24,
              "height": 24
            }
          }
        }
      }
    },
    "suffix": {
      "el": "text",
      "geometry": {
        "base": {},
        "variants": {
          "size": {
            "sm": {
              "paddingEnd": 6
            },
            "md": {
              "paddingEnd": 12
            },
            "lg": {
              "paddingEnd": 18
            }
          }
        }
      },
      "typeStep": {
        "variants": {
          "size": {
            "sm": {
              "size": "sm",
              "emphasis": true
            },
            "md": {
              "size": "md",
              "emphasis": true
            },
            "lg": {
              "size": "md",
              "emphasis": true
            }
          }
        }
      }
    }
  },
  "tab-bar-item": {
    "root": {
      "el": "view",
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
        "pressScale": true,
        "pressedStatic": {
          "transform": [
            {
              "scale": 0.97
            }
          ]
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
      "typeStep": {
        "base": {
          "size": "xs",
          "emphasis": true
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
  }
};
