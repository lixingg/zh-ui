var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
import { defineComponent, computed, openBlock, createBlock, resolveDynamicComponent, normalizeStyle, unref, inject, ref, createElementBlock, normalizeClass, createElementVNode, createCommentVNode, renderSlot, provide, toRef, createVNode, withDirectives, toDisplayString, vShow, onMounted, watch, resolveComponent, Transition, withCtx, render, useSlots, onUnmounted, withModifiers, reactive, toRefs, nextTick, createTextVNode, h, Teleport } from "vue";
import { CircleCheckFilled, InfoFilled, WarningFilled, CircleCloseFilled, Close } from "@element-plus/icons-vue";
const _sfc_main$g = /* @__PURE__ */ defineComponent({
  props: {
    name: {
      type: String
    },
    color: {
      type: String,
      default: ""
    },
    size: {
      type: [Number, String],
      default: 16
    }
  },
  setup(__props) {
    const props2 = __props;
    const sizeComputed = computed(() => {
      let size = "";
      if (typeof props2.size === "number") {
        size = props2.size + "px";
      } else {
        size = props2.size;
      }
      return {
        height: size,
        width: size
      };
    });
    return (_ctx, _cache) => {
      return openBlock(), createBlock(resolveDynamicComponent(__props.name), {
        style: normalizeStyle(__spreadProps(__spreadValues({}, unref(sizeComputed)), { color: __props.color })),
        class: "inline"
      }, null, 8, ["style"]);
    };
  }
});
var zhButton_vue_vue_type_style_index_0_lang = "";
const _hoisted_1$8 = ["type", "disabled"];
const _sfc_main$f = /* @__PURE__ */ defineComponent({
  props: {
    size: {
      type: String,
      validator: (value) => {
        return ["default", "large", "small"].includes(value);
      }
    },
    type: {
      type: String,
      default: "default",
      validator: (value) => {
        return ["default", "primary", "success", "info", "warning", "danger", "text"].includes(value);
      }
    },
    plain: {
      type: Boolean,
      default: false
    },
    round: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    circle: {
      type: Boolean,
      default: false
    },
    loadingIcon: {
      type: String,
      default: "Loading"
    },
    disabled: {
      type: Boolean,
      default: false
    },
    iconColor: {
      type: String,
      default: "white"
    },
    nativeType: {
      type: String,
      default: "button"
    }
  },
  emits: ["click"],
  setup(__props, { emit: $emit }) {
    const props2 = __props;
    const classComputed = computed(() => {
      const typeInject = inject("button-group-type", ref(void 0));
      const typeClass = props2.type === "default" && typeInject.value ? "zh-button-" + typeInject.value : "zh-button-" + props2.type;
      const isPlain = props2.plain ? "zh-is-plain" : "";
      const isRound = props2.round ? "zh-is-round" : "";
      const isLoading = props2.loading ? "zh-is-disabled is-Loading" : "";
      const isDisabled = props2.disabled || props2.loading ? "zh-is-disabled" : "";
      const isCircle = props2.circle ? "zh-is-circle" : "";
      const isSize = props2.size ? `zh-is-${props2.size}` : "";
      return [typeClass, isPlain, isRound, isDisabled, isLoading, isCircle, isSize];
    });
    const disabledComputed = computed(() => {
      const isDisabled = props2.disabled || props2.loading;
      return {
        isDisabled
      };
    });
    const groupInjectComputed = computed(() => {
      var _a;
      const sizeInject = inject("button-group-size", ref(void 0));
      const typeInject = inject("button-group-type", ref(void 0));
      const classData = [];
      if (sizeInject.value) {
        const size = (_a = props2.size ? props2.size : sizeInject.value) != null ? _a : "";
        classData.push(`zh-is-${size}`);
      }
      if (typeInject.value) {
        const type = props2.type === "default" ? typeInject.value : props2.type;
        classData.push(`zh-button-${type}`);
      }
      return classData;
    });
    const clickEmit = (event) => {
      const isEmit = props2.disabled || props2.loading;
      if (!isEmit)
        $emit("click", event);
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("button", {
        class: normalizeClass(["zh-button", ...unref(groupInjectComputed), ...unref(classComputed)]),
        type: __props.nativeType,
        disabled: unref(disabledComputed).isDisabled,
        onClick: _cache[0] || (_cache[0] = ($event) => clickEmit($event))
      }, [
        createElementVNode("span", null, [
          __props.loading ? (openBlock(), createBlock(_sfc_main$g, {
            key: 0,
            name: __props.loadingIcon,
            color: __props.iconColor,
            class: "animate-spin mr-0.5"
          }, null, 8, ["name", "color"])) : createCommentVNode("", true),
          renderSlot(_ctx.$slots, "default")
        ])
      ], 10, _hoisted_1$8);
    };
  }
});
var zhButtonGroup_vue_vue_type_style_index_0_lang = "";
const _hoisted_1$7 = { class: "zh-button-group inline-block align-middle" };
const _sfc_main$e = /* @__PURE__ */ defineComponent({
  props: {
    size: {
      type: String,
      default: "default",
      validator: (value) => {
        return ["default", "large", "small"].includes(value);
      }
    },
    type: {
      type: String,
      default: "default",
      validator: (value) => {
        return ["default", "primary", "success", "info", "warning", "danger", "text"].includes(value);
      }
    }
  },
  setup(__props) {
    const props2 = __props;
    provide("button-group-size", toRef(props2, "size"));
    provide("button-group-type", toRef(props2, "type"));
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$7, [
        renderSlot(_ctx.$slots, "default")
      ]);
    };
  }
});
var button = {
  install(app) {
    app.component("ZhButton", _sfc_main$f);
    app.component("ZhButtonGroup", _sfc_main$e);
  }
};
var icon = {
  install(app) {
    app.component("ZhIcon", _sfc_main$g);
  }
};
var row = "";
const rowGutter = Symbol();
const props$1 = {
  tag: {
    type: String,
    default: "div"
  },
  gutter: {
    type: Number,
    default: 0
  },
  justify: {
    type: String,
    default: "start"
  },
  align: {
    type: String,
    default: "top"
  }
};
const ZhRow = defineComponent({
  name: "BlRow",
  props: props$1,
  setup(props2, {
    slots
  }) {
    provide(rowGutter, computed(() => props2.gutter));
    const style2 = computed(() => {
      const styles = {
        "margin-left": "",
        "margin-right": ""
      };
      if (props2.gutter) {
        styles["margin-left"] = `${props2.gutter / 2}px`;
        styles["margin-right"] = styles["margin-left"];
      }
      return styles;
    });
    const flex = computed(() => {
      const justifyClass = `justify-${props2.justify}`;
      const alignClass = `items-${props2.align}`;
      return [justifyClass, alignClass];
    });
    return () => createVNode(props2.tag, {
      "class": ["zh-row", ...flex.value],
      "style": style2.value
    }, {
      default: () => {
        var _a;
        return [(_a = slots.default) == null ? void 0 : _a.call(slots)];
      }
    });
  }
});
const props = {
  tag: {
    type: String,
    default: "div"
  },
  span: {
    type: Number,
    default: 24
  },
  offset: {
    type: Number,
    default: 0
  },
  pull: {
    type: Number,
    default: 0
  },
  push: {
    type: Number,
    default: 0
  }
};
const ZhCol = defineComponent({
  name: "BlCol",
  props,
  setup(props2, {
    slots
  }) {
    const gutter = inject(rowGutter, computed(() => 0));
    const getPercentage = (x) => x * 100;
    const style2 = computed(() => {
      let all = {};
      if (gutter.value) {
        const padding = {
          paddingLeft: `${gutter.value / 2}px`,
          paddingRight: `${gutter.value / 2}px`
        };
        all = __spreadValues(__spreadValues({}, all), padding);
      }
      if (props2.span) {
        const marginwidth = {
          maxWidth: `${getPercentage(props2.span / 24)}%`,
          flexBasis: `${getPercentage(props2.span / 24)}%`
        };
        all = __spreadValues(__spreadValues({}, all), marginwidth);
      }
      if (props2.offset) {
        const offest = {
          marginLeft: `${getPercentage(props2.offset / 24)}%`
        };
        all = __spreadValues(__spreadValues({}, all), offest);
      }
      if (props2.push || props2.pull) {
        const pushPull = {
          position: "relative"
        };
        if (props2.push)
          pushPull.left = `${getPercentage(props2.push / 24)}%`;
        if (props2.pull)
          pushPull.right = `${getPercentage(props2.pull / 24)}%`;
        all = __spreadValues(__spreadValues({}, all), pushPull);
      }
      return all;
    });
    return () => createVNode(props2.tag, {
      "class": "zh-col",
      "style": style2.value
    }, {
      default: () => {
        var _a;
        return [(_a = slots.default) == null ? void 0 : _a.call(slots)];
      }
    });
  }
});
var layout = {
  install(app) {
    app.component(ZhRow.name, ZhRow);
    app.component(ZhCol.name, ZhCol);
  }
};
var zhBadge_vue_vue_type_style_index_0_lang = "";
const _hoisted_1$6 = { class: "zh-badge relative inline-block align-middle" };
const _hoisted_2$5 = ["textContent"];
const _sfc_main$d = /* @__PURE__ */ defineComponent({
  props: {
    type: {
      type: String,
      default: "danger",
      validator: (value) => {
        return ["primary", "success", "info", "warning", "danger"].includes(value);
      }
    },
    value: {
      type: [Number, String]
    },
    max: {
      type: Number,
      default: 99
    },
    hidden: {
      type: Boolean,
      default: false
    },
    isDot: {
      type: Boolean,
      default: false
    }
  },
  setup(__props) {
    const props2 = __props;
    const content = computed(() => {
      if (props2.isDot)
        return "";
      if (typeof props2.value === "number" && typeof props2.max === "number") {
        return props2.max < props2.value ? `${props2.max}+` : `${props2.value}`;
      }
      return `${props2.value}`;
    });
    const classCom = computed(() => {
      const isDot = props2.isDot ? "zh-badge__dot" : "zh-badge__content";
      const type = props2.type ? `zh-badge__type--${props2.type}` : "";
      return [isDot, type];
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$6, [
        renderSlot(_ctx.$slots, "default"),
        withDirectives(createElementVNode("sub", {
          class: normalizeClass(["zh-sup__base", ...unref(classCom)]),
          textContent: toDisplayString(unref(content))
        }, null, 10, _hoisted_2$5), [
          [vShow, !__props.hidden && (unref(content) || unref(content) === "0" || __props.isDot)]
        ])
      ]);
    };
  }
});
var badge = {
  install(app) {
    app.component("ZhBadge", _sfc_main$d);
  }
};
const style = {
  warning: {
    icon: "WarningFilled",
    color: "#E6A23C",
    backgroundColor: "rgb(253, 246, 236)"
  },
  danger: {
    icon: "CircleCloseFilled",
    color: "#F56C6C",
    backgroundColor: "rgb(254, 240, 240)"
  },
  success: {
    icon: "CircleCheckFilled",
    color: "#67C23A",
    backgroundColor: "rgb(240, 249, 235)"
  },
  info: {
    icon: "InfoFilled",
    color: "#909399",
    backgroundColor: "#F4F4F5"
  }
};
var messageIcon_vue_vue_type_style_index_0_scoped_true_lang = "";
var _export_sfc = (sfc, props2) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props2) {
    target[key] = val;
  }
  return target;
};
const _sfc_main$c = /* @__PURE__ */ defineComponent({
  props: {
    type: {
      type: String,
      default: "success"
    },
    size: {
      type: [Number, String],
      default: 16
    }
  },
  setup(__props) {
    const props2 = __props;
    const isShow = (type) => {
      return props2.type === type;
    };
    const sizeComputed = computed(() => {
      let size = "";
      if (typeof props2.size === "number") {
        size = props2.size + "px";
      } else {
        size = props2.size;
      }
      return {
        height: size,
        width: size
      };
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("span", null, [
        isShow("success") ? (openBlock(), createBlock(unref(CircleCheckFilled), {
          key: 0,
          style: normalizeStyle(__spreadValues({ color: unref(style)[__props.type].color }, unref(sizeComputed)))
        }, null, 8, ["style"])) : createCommentVNode("", true),
        isShow("info") ? (openBlock(), createBlock(unref(InfoFilled), {
          key: 1,
          style: normalizeStyle(__spreadValues({ color: unref(style)[__props.type].color }, unref(sizeComputed)))
        }, null, 8, ["style"])) : createCommentVNode("", true),
        isShow("warning") ? (openBlock(), createBlock(unref(WarningFilled), {
          key: 2,
          style: normalizeStyle(__spreadValues({ color: unref(style)[__props.type].color }, unref(sizeComputed)))
        }, null, 8, ["style"])) : createCommentVNode("", true),
        isShow("danger") ? (openBlock(), createBlock(unref(CircleCloseFilled), {
          key: 3,
          style: normalizeStyle(__spreadValues({ color: unref(style)[__props.type].color }, unref(sizeComputed)))
        }, null, 8, ["style"])) : createCommentVNode("", true)
      ]);
    };
  }
});
var MessageIcon = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["__scopeId", "data-v-32fc5d86"]]);
var zhMessage_vue_vue_type_style_index_0_scoped_true_lang = "";
const _hoisted_1$5 = ["innerHTML"];
const _sfc_main$b = /* @__PURE__ */ defineComponent({
  props: {
    type: {
      type: String,
      default: "info",
      validator: (value) => {
        return ["success", "info", "warning", "danger"].includes(value);
      }
    },
    message: {
      type: String
    },
    duration: {
      type: Number,
      default: 3e3
    },
    showClose: {
      type: Boolean,
      default: false
    },
    center: {
      type: Boolean,
      default: false
    },
    onClose: {
      type: Function
    },
    grouping: {
      type: Boolean,
      default: false
    },
    repeatNum: {
      type: Number,
      default: 0
    }
  },
  setup(__props) {
    const props2 = __props;
    const visible = ref(false);
    const messageRef = ref();
    function close() {
      visible.value = false;
      props2.onClose && props2.onClose(messageRef);
    }
    function clearTimer() {
      clearTimeout(timer2.value);
    }
    const timer2 = ref();
    function startTimer() {
      if (props2.duration > 0) {
        timer2.value = setTimeout(() => {
          if (visible.value)
            close();
        }, props2.duration);
      }
    }
    onMounted(() => {
      startTimer();
      visible.value = true;
    });
    watch(() => props2.repeatNum, () => {
      clearTimer();
      startTimer();
    });
    return (_ctx, _cache) => {
      const _component_zh_badge = resolveComponent("zh-badge");
      return openBlock(), createBlock(Transition, { name: "message" }, {
        default: withCtx(() => [
          visible.value ? (openBlock(), createElementBlock("div", {
            key: 0,
            ref_key: "messageRef",
            ref: messageRef,
            style: normalizeStyle(unref(style)[__props.type]),
            class: normalizeClass(["zh-message w-80 h-12 rounded flex items-center px-6 mb-4", { "justify-center": __props.center }])
          }, [
            __props.repeatNum > 1 ? (openBlock(), createBlock(_component_zh_badge, {
              key: 0,
              value: __props.repeatNum,
              type: __props.type,
              class: "zh-message__badge"
            }, null, 8, ["value", "type"])) : createCommentVNode("", true),
            createVNode(MessageIcon, { type: __props.type }, null, 8, ["type"]),
            createElementVNode("span", {
              class: "pl-4 text-sm",
              innerHTML: __props.message
            }, null, 8, _hoisted_1$5),
            __props.showClose ? (openBlock(), createBlock(unref(Close), {
              key: 1,
              class: "close-btn absolute right-4 cursor-pointer",
              onClick: close
            })) : createCommentVNode("", true)
          ], 6)) : createCommentVNode("", true)
        ]),
        _: 1
      });
    };
  }
});
var BlMessage = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["__scopeId", "data-v-5f80b5c0"]]);
const messageTypes = ["success", "info", "warning", "danger"];
const boxId = "zh-message__function";
const container$2 = document.createElement("div");
document.body.appendChild(container$2);
container$2.id = boxId;
let timer;
let num = 0;
const BlMessageFn = (props2) => {
  num++;
  const containItem = document.createElement("div");
  let options = {
    message: "",
    duration: 3e3,
    grouping: false
  };
  if (typeof props2 === "string") {
    options.message = props2;
  } else {
    options = __spreadValues(__spreadValues({}, options), props2);
    if (props2.grouping)
      options.repeatNum = num;
  }
  const boxVNode = createVNode(BlMessage, options);
  renderHelper(boxVNode, containItem, options);
  timer && clearTimeout(timer);
  if (options.duration > 0)
    timer = setTimeout(() => {
      num = 0;
      render(null, container$2);
    }, options.duration + 50);
  return {
    close: () => {
      boxVNode.component.proxy.visible = false;
    }
  };
};
const renderHelper = (vm, containItem, options) => {
  if (options.grouping) {
    render(vm, container$2);
  } else {
    render(vm, containItem);
    container$2.appendChild(containItem);
  }
};
const optionHelper = (props2, type) => {
  let options = {};
  if (typeof props2 === "string") {
    options.message = props2;
    options.type = type;
  } else {
    options = __spreadProps(__spreadValues({}, props2), { type });
  }
  return options;
};
messageTypes.forEach((type) => {
  BlMessageFn[type] = (message) => BlMessageFn(optionHelper(message, type));
});
const DEFAULT_NAMESPACE = "bl";
const STATE_PREFIX = "is";
const useNamespace = (namespace) => {
  return {
    b() {
      return `${DEFAULT_NAMESPACE}-${namespace}`;
    },
    is(state, name) {
      return name && state ? `${STATE_PREFIX}-${name}` : "";
    },
    m(suffix) {
      if (suffix) {
        return `${DEFAULT_NAMESPACE}-${namespace}-${suffix}`;
      }
      return "";
    },
    sy(data, label) {
      return {
        [label]: data
      };
    },
    is_sy(is, one, two) {
      if (!two) {
        if (is)
          return one;
        return {};
      }
      if (is) {
        return one;
      } else {
        return two;
      }
    }
  };
};
var zhContainer_vue_vue_type_style_index_0_lang = "";
const _sfc_main$a = /* @__PURE__ */ defineComponent({
  props: {
    direction: {
      type: String,
      default: ""
    }
  },
  setup(__props) {
    const props2 = __props;
    const ns = useNamespace("container");
    const isVertical = computed(() => {
      if (props2.direction === "vertical") {
        return true;
      } else if (props2.direction === "horizontal") {
        return false;
      }
      const slot = useSlots();
      if (slot && slot.default) {
        const vNodes = slot.default();
        return vNodes.some((vNode) => {
          const tag = vNode.type.name;
          return tag === "BlHeader" || tag === "BlFooter";
        });
      } else {
        return false;
      }
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("section", {
        class: normalizeClass([unref(ns).b(), unref(ns).is(unref(isVertical), "vertical")])
      }, [
        renderSlot(_ctx.$slots, "default")
      ], 2);
    };
  }
});
var zhHeader_vue_vue_type_style_index_0_lang = "";
const _sfc_main$9 = defineComponent({
  name: "BlHeader",
  props: {
    height: {
      type: String,
      default: ""
    }
  },
  setup(props2) {
    const styleHeight = computed(() => props2.height ? { height: props2.height } : {});
    const ns = useNamespace("header");
    return {
      styleHeight,
      ns
    };
  }
});
function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("header", {
    style: normalizeStyle(_ctx.styleHeight),
    class: normalizeClass(_ctx.ns.b())
  }, [
    renderSlot(_ctx.$slots, "default")
  ], 6);
}
var ZhHeader = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["render", _sfc_render$4]]);
var zhMain_vue_vue_type_style_index_0_lang = "";
const _sfc_main$8 = defineComponent({
  name: "ElMain",
  setup() {
    const ns = useNamespace("main");
    return {
      ns
    };
  }
});
function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("main", {
    class: normalizeClass(_ctx.ns.b())
  }, [
    renderSlot(_ctx.$slots, "default")
  ], 2);
}
var ZhMain = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["render", _sfc_render$3]]);
var zhFooter_vue_vue_type_style_index_0_lang = "";
const _sfc_main$7 = defineComponent({
  name: "BlFooter",
  props: {
    height: {
      type: String,
      default: ""
    }
  },
  setup(props2) {
    const ns = useNamespace("footer");
    const styleHeight = computed(() => props2.height ? { height: props2.height } : {});
    return {
      ns,
      styleHeight
    };
  }
});
function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("footer", {
    class: normalizeClass(_ctx.ns.b()),
    style: normalizeStyle(_ctx.styleHeight)
  }, [
    renderSlot(_ctx.$slots, "default")
  ], 6);
}
var ZhFooter = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["render", _sfc_render$2]]);
var zhAside_vue_vue_type_style_index_0_lang = "";
const _sfc_main$6 = defineComponent({
  name: "BlAside",
  props: {
    width: {
      type: String,
      default: ""
    }
  },
  setup(props2) {
    const ns = useNamespace("aside");
    const styleWidth = computed(() => props2.width ? { width: props2.width } : {});
    return {
      ns,
      styleWidth
    };
  }
});
function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("aside", {
    style: normalizeStyle(_ctx.styleWidth),
    class: normalizeClass(_ctx.ns.b())
  }, [
    renderSlot(_ctx.$slots, "default")
  ], 6);
}
var ZhAside = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$1]]);
var container$1 = {
  install(app) {
    app.component("ZhContainer", _sfc_main$a);
    app.component("ZhHeader", ZhHeader);
    app.component("ZhMain", ZhMain);
    app.component("ZhFooter", ZhFooter);
    app.component("ZhAside", ZhAside);
  }
};
var utilModal_vue_vue_type_style_index_0_scoped_true_lang = "";
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    mask: {
      type: Boolean,
      default: true
    },
    zIndex: {
      type: String,
      default: "9"
    }
  },
  emits: ["closed"],
  setup(__props, { emit: $emit }) {
    const props2 = __props;
    const ns = useNamespace("modal");
    const closed = (type) => {
      console.log("\u70B9\u51FB\u4E86");
      $emit("closed", { type });
    };
    const keyDownHandler = (e) => {
      if (e.code === "Escape")
        closed(e.code);
    };
    const zIndexStyle = computed(() => {
      return {
        zIndex: props2.zIndex
      };
    });
    onMounted(() => {
      document.addEventListener("keydown", keyDownHandler);
    });
    onUnmounted(() => {
      document.removeEventListener("keydown", keyDownHandler);
    });
    return (_ctx, _cache) => {
      return withDirectives((openBlock(), createElementBlock("div", {
        style: normalizeStyle(unref(zIndexStyle)),
        class: normalizeClass([unref(ns).is(__props.mask, "mask"), "util-modal"]),
        onClick: _cache[0] || (_cache[0] = withModifiers(($event) => closed("click"), ["self"]))
      }, [
        renderSlot(_ctx.$slots, "default", {}, void 0, true)
      ], 6)), [
        [vShow, __props.visible]
      ]);
    };
  }
});
var UtilModal = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["__scopeId", "data-v-041a9a03"]]);
var zhMessageBox_vue_vue_type_style_index_0_scoped_true_lang = "";
const _sfc_main$4 = defineComponent({
  name: "BlMessageBox",
  components: {
    UtilModal,
    Close,
    MessageIcon,
    BlButton: _sfc_main$f
  },
  setup(props2, { emit }) {
    const ns = useNamespace("message-box");
    const visible_ = ref(false);
    const state = reactive({
      title: "",
      message: "Message",
      confirmText: "OK",
      cancelText: "Cancel",
      type: "info",
      boxType: "alert",
      distinguishCancelAndClose: false,
      showClose: true,
      showCancelButton: true,
      center: false,
      action: "",
      showInput: false
    });
    const closeModal = (e) => {
      if (state.distinguishCancelAndClose && (e.type === "click" || e.type === "Escape")) {
        closed("close");
      }
    };
    const closed = (action) => {
      state.action = action;
      if (!visible_.value)
        return;
      visible_.value = false;
      nextTick(() => {
        if (state.action)
          emit("action", state.action);
      });
    };
    const confirmAll = (type) => {
      closed(type);
    };
    return __spreadProps(__spreadValues({}, toRefs(state)), {
      confirmAll,
      closeModal,
      ns,
      visible_
    });
  }
});
const _hoisted_1$4 = { class: "flex justify-between items-center" };
const _hoisted_2$4 = { class: "text-lg" };
const _hoisted_3$3 = { class: "py-4 flex items-center" };
const _hoisted_4$2 = ["innerHTML"];
const _hoisted_5$2 = { class: "flex justify-end pt-0.5" };
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_Close = resolveComponent("Close");
  const _component_message_icon = resolveComponent("message-icon");
  const _component_zh_button = resolveComponent("zh-button");
  const _component_util_modal = resolveComponent("util-modal");
  return openBlock(), createBlock(_component_util_modal, {
    visible: _ctx.visible_,
    "z-index": "10",
    onClosed: _ctx.closeModal
  }, {
    default: withCtx(() => [
      createVNode(Transition, { name: "message-box" }, {
        default: withCtx(() => [
          withDirectives(createElementVNode("div", {
            class: normalizeClass([_ctx.ns.b()])
          }, [
            createElementVNode("div", _hoisted_1$4, [
              createElementVNode("span", _hoisted_2$4, toDisplayString(_ctx.title), 1),
              _ctx.showClose ? (openBlock(), createBlock(_component_Close, {
                key: 0,
                class: "close-btn cursor-pointer",
                onClick: _cache[0] || (_cache[0] = ($event) => _ctx.confirmAll("cancel"))
              })) : createCommentVNode("", true)
            ]),
            createElementVNode("div", _hoisted_3$3, [
              _ctx.boxType === "confirm" ? (openBlock(), createBlock(_component_message_icon, {
                key: 0,
                class: "mr-4",
                type: _ctx.type,
                size: "21"
              }, null, 8, ["type"])) : createCommentVNode("", true),
              createElementVNode("span", {
                class: "text-sm text-gray-500",
                innerHTML: _ctx.message
              }, null, 8, _hoisted_4$2)
            ]),
            createElementVNode("div", _hoisted_5$2, [
              _ctx.showCancelButton ? (openBlock(), createBlock(_component_zh_button, {
                key: 0,
                onClick: _cache[1] || (_cache[1] = ($event) => _ctx.confirmAll("cancel"))
              }, {
                default: withCtx(() => [
                  createTextVNode(toDisplayString(_ctx.cancelText), 1)
                ]),
                _: 1
              })) : createCommentVNode("", true),
              createVNode(_component_zh_button, {
                type: "primary",
                onClick: _cache[2] || (_cache[2] = ($event) => _ctx.confirmAll("confirm"))
              }, {
                default: withCtx(() => [
                  createTextVNode(toDisplayString(_ctx.confirmText), 1)
                ]),
                _: 1
              })
            ])
          ], 2), [
            [vShow, _ctx.visible_]
          ])
        ]),
        _: 1
      })
    ]),
    _: 1
  }, 8, ["visible", "onClosed"]);
}
var ZhMessageBox = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render], ["__scopeId", "data-v-6bccd106"]]);
const messageInstance = /* @__PURE__ */ new Map();
const container = document.createElement("div");
document.body.appendChild(container);
const initInstance = (props2, container2) => {
  const vNode = h(ZhMessageBox, props2);
  render(vNode, container2);
  return vNode.component;
};
const showMessage = (options = {}) => {
  const instacne = initInstance(options, container);
  const vm = instacne == null ? void 0 : instacne.proxy;
  options.onAction = (action) => {
    const currentMsg = messageInstance.get(vm);
    let resolve;
    if (options.showInput) {
      resolve = { value: vm.state.inputValue, action };
    } else {
      resolve = action;
    }
    if (options.callback) {
      options.callback(resolve, instacne.proxy);
    } else {
      if (action === "cancel" || action === "close") {
        if (options.distinguishCancelAndClose && action !== "cancel") {
          currentMsg.reject("close");
        } else {
          currentMsg.reject("cancel");
        }
      } else {
        currentMsg.resolve(resolve);
      }
    }
    render(null, container);
  };
  vm["onAction"] = options.onAction;
  for (const prop in options) {
    if (Object.hasOwn(options, prop) && !Object.hasOwn(vm.$props, prop)) {
      vm[prop] = options[prop];
    }
  }
  vm.visible_ = true;
  return vm;
};
function MessageBox(options) {
  let callback;
  if (typeof options === "string") {
    options = {
      message: options
    };
  } else {
    callback = options.callback;
  }
  return new Promise((resolve, reject) => {
    const vm = showMessage(options);
    messageInstance.set(vm, {
      options,
      callback,
      resolve,
      reject
    });
  });
}
function MessageBoxFn(message, title, options) {
  let option_ = {};
  option_.message = message;
  if (title) {
    if (typeof title === "string") {
      option_.title = title;
    } else {
      option_ = __spreadValues(__spreadValues({}, option_), title);
    }
  }
  if (options) {
    option_ = __spreadValues(__spreadValues({}, option_), options);
  }
  return MessageBox(option_);
}
MessageBox.close = () => {
  messageInstance.forEach((_, vm) => {
    vm.closed();
  });
  messageInstance.clear();
};
var zhDrawer_vue_vue_type_style_index_0_scoped_true_lang = "";
const _hoisted_1$3 = { class: "p-2 py-4 flex justify-between items-center" };
const _hoisted_2$3 = { class: "p-2 flex-1" };
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    direction: {
      type: String,
      default: "rtl",
      validator: (value) => {
        return ["rtl", "ltr", "ttb", "btt"].includes(value);
      }
    },
    title: {
      type: String,
      default: "title"
    },
    beforeClose: {
      type: Function
    },
    withHeader: {
      type: Boolean,
      default: true
    }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: $emit }) {
    const props2 = __props;
    const ns = useNamespace("drawer");
    const closed = () => {
      if (props2.beforeClose) {
        props2.beforeClose(() => $emit("update:modelValue", false));
      } else {
        $emit("update:modelValue", false);
      }
    };
    return (_ctx, _cache) => {
      const _component_zh_icon = resolveComponent("zh-icon");
      return openBlock(), createBlock(Teleport, { to: "body" }, [
        createVNode(UtilModal, {
          visible: __props.modelValue,
          class: normalizeClass([
            unref(ns).is(__props.direction === "rtl", "rtl"),
            unref(ns).is(__props.direction === "ltr", "ltr"),
            unref(ns).is(__props.direction === "ttb", "ttb"),
            unref(ns).is(__props.direction === "btt", "btt")
          ]),
          onClosed: closed
        }, {
          default: withCtx(() => [
            createElementVNode("div", {
              class: normalizeClass([[unref(ns).b()], "utils-scrollbar overflow-auto bg-white"])
            }, [
              withDirectives(createElementVNode("header", _hoisted_1$3, [
                renderSlot(_ctx.$slots, "title", {}, () => [
                  createElementVNode("span", null, toDisplayString(__props.title), 1)
                ], true),
                createVNode(_component_zh_icon, {
                  name: "close",
                  class: "cursor-pointer text-gray-600 hover:text-gray-400 ml-auto",
                  size: "20",
                  onClick: closed
                })
              ], 512), [
                [vShow, __props.withHeader]
              ]),
              createElementVNode("div", _hoisted_2$3, [
                renderSlot(_ctx.$slots, "default", {}, void 0, true)
              ]),
              renderSlot(_ctx.$slots, "footer", {}, void 0, true)
            ], 2)
          ]),
          _: 3
        }, 8, ["visible", "class"])
      ]);
    };
  }
});
var ZhDrawer = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-606f7de5"]]);
var drawer = {
  install(app) {
    app.component("ZhDrawer", ZhDrawer);
  }
};
var zhRadio_vue_vue_type_style_index_0_scoped_true_lang = "";
const _hoisted_1$2 = { class: "flex items-center" };
const _hoisted_2$2 = ["value", "name", "checked", "disabled"];
const _hoisted_3$2 = { class: "ml-1.5 text-sm" };
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  props: {
    modelValue: {
      type: String,
      default: ""
    },
    label: {
      type: [String, Number, Boolean]
    },
    size: {
      type: String,
      validator: (value) => {
        return ["default", "large", "small"].includes(value);
      }
    },
    name: {
      type: String
    },
    disabled: {
      type: Boolean,
      default: false
    },
    border: {
      type: Boolean,
      default: false
    }
  },
  emits: ["update:modelValue", "change"],
  setup(__props, { emit: $emit }) {
    const props2 = __props;
    const ns = useNamespace("radio");
    const selected = computed(() => props2.modelValue === props2.label);
    const changeRadio = () => {
      if (!props2.disabled) {
        $emit("update:modelValue", props2.label);
        $emit("change", props2.label);
      }
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("label", {
        class: normalizeClass([[
          unref(ns).b(),
          unref(ns).is(__props.border, "border"),
          unref(ns).is(__props.disabled, "disabled"),
          unref(selected) && !__props.disabled ? "selected" : ""
        ], "cursor-pointer"]),
        onClick: changeRadio
      }, [
        createElementVNode("span", _hoisted_1$2, [
          createElementVNode("input", {
            class: "cursor-pointer",
            type: "radio",
            value: __props.label,
            name: __props.name,
            checked: unref(selected),
            disabled: __props.disabled
          }, null, 8, _hoisted_2$2),
          createElementVNode("span", _hoisted_3$2, [
            renderSlot(_ctx.$slots, "default", {}, void 0, true)
          ])
        ])
      ], 2);
    };
  }
});
var ZhRadio = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-4fc8c620"]]);
var radio = {
  install(app) {
    app.component("ZhRadio", ZhRadio);
  }
};
var zhSwitch_vue_vue_type_style_index_0_scoped_true_lang = "";
const _hoisted_1$1 = ["onClick"];
const _hoisted_2$1 = ["checked", "disabled"];
const _hoisted_3$1 = {
  key: 0,
  class: "zh-switch__in left-1.5"
};
const _hoisted_4$1 = { class: "zh-switch__action" };
const _hoisted_5$1 = {
  key: 1,
  class: "zh-switch__in right-1.5"
};
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  props: {
    modelValue: {
      type: [Boolean, Number, String],
      default: false
    },
    activeValue: {
      type: [Boolean, Number, String],
      default: true
    },
    inactiveValue: {
      type: [Boolean, Number, String],
      default: false
    },
    activeColor: {
      type: String,
      default: "#409EFF"
    },
    inactiveColor: {
      type: String,
      default: "#DCDFE6"
    },
    activeText: {
      type: String
    },
    inactiveText: {
      type: String
    },
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    inlinePrompt: {
      type: Boolean,
      default: false
    }
  },
  emits: ["update:modelValue", "change"],
  setup(__props, { emit: $emit }) {
    const props2 = __props;
    const ns = useNamespace("switch");
    const checked = computed(() => props2.modelValue === props2.activeValue);
    const bgColorStyle = computed(() => {
      return checked.value ? ns.sy(props2.activeColor, "backgroundColor") : ns.sy(props2.inactiveColor, "backgroundColor");
    });
    const textStyle = computed(() => (is) => {
      const is_ = is ? checked.value : !checked.value;
      return ns.is_sy(is_, ns.sy(props2.activeColor, "color"));
    });
    const input2 = ref();
    const handleInput = () => {
      const val = checked.value ? props2.inactiveValue : props2.activeValue;
      $emit("update:modelValue", val);
      $emit("change", val);
      nextTick(() => {
        input2.value.checked = checked.value;
      });
    };
    const switchValue = () => {
      if (props2.disabled || props2.loading)
        return;
      handleInput();
    };
    return (_ctx, _cache) => {
      const _component_zh_icon = resolveComponent("zh-icon");
      return openBlock(), createElementBlock("div", {
        class: normalizeClass([
          unref(ns).b(),
          unref(ns).is(unref(checked), "checked"),
          unref(ns).is(__props.disabled, "disabled"),
          unref(ns).is(__props.loading, "loading")
        ]),
        onClick: withModifiers(switchValue, ["prevent"])
      }, [
        createElementVNode("input", {
          id: "zh-switch__input",
          ref_key: "input",
          ref: input2,
          type: "checkbox",
          class: "absolute w-0 h-0 m-0",
          checked: unref(checked),
          disabled: __props.disabled,
          onChange: handleInput
        }, null, 40, _hoisted_2$1),
        !__props.inlinePrompt && __props.activeText ? (openBlock(), createElementBlock("span", {
          key: 0,
          class: "mr-2",
          style: normalizeStyle(unref(textStyle)(false))
        }, toDisplayString(__props.activeText), 5)) : createCommentVNode("", true),
        createElementVNode("span", {
          class: "zh-switch__main-core",
          style: normalizeStyle(unref(bgColorStyle))
        }, [
          unref(checked) && __props.inlinePrompt && __props.activeText ? (openBlock(), createElementBlock("span", _hoisted_3$1, toDisplayString(__props.activeText[0]), 1)) : createCommentVNode("", true),
          createElementVNode("div", _hoisted_4$1, [
            __props.loading ? (openBlock(), createBlock(_component_zh_icon, {
              key: 0,
              name: "loading",
              class: "text-gray-400 animate-spin",
              style: normalizeStyle(unref(textStyle)(__props.loading))
            }, null, 8, ["style"])) : createCommentVNode("", true)
          ]),
          !unref(checked) && __props.inlinePrompt && __props.inactiveText ? (openBlock(), createElementBlock("span", _hoisted_5$1, toDisplayString(__props.inactiveText[0]), 1)) : createCommentVNode("", true)
        ], 4),
        !__props.inlinePrompt && __props.inactiveText ? (openBlock(), createElementBlock("span", {
          key: 1,
          class: "ml-2",
          style: normalizeStyle(unref(textStyle)(true))
        }, toDisplayString(__props.inactiveText), 5)) : createCommentVNode("", true)
      ], 10, _hoisted_1$1);
    };
  }
});
var ZhSwitch = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-0aa447ee"]]);
var BlSwitch = {
  install(app) {
    app.component("ZhSwitch", ZhSwitch);
  }
};
const useMouseEnterLeave = () => {
  const mouse_is = ref(false);
  return {
    mouse_is,
    enter: () => mouse_is.value = true,
    leave: () => mouse_is.value = false
  };
};
const useClearModel = ($emit) => {
  return () => {
    $emit("update:modelValue", "");
    $emit("change", "");
    $emit("clear");
    $emit("input", "");
  };
};
const useShowPassword = () => {
  const passwordVisible = ref(false);
  const changePasswordShow = () => {
    passwordVisible.value = !passwordVisible.value;
  };
  return {
    passwordVisible,
    changePasswordShow
  };
};
var zhInput_vue_vue_type_style_index_0_scoped_true_lang = "";
const _hoisted_1 = {
  key: 0,
  class: "zh-right__suffix mr-1"
};
const _hoisted_2 = ["disabled", "type", "value", "placeholder"];
const _hoisted_3 = {
  key: 1,
  class: "zh-right__suffix"
};
const _hoisted_4 = {
  key: 2,
  class: "zh-right__suffix"
};
const _hoisted_5 = {
  key: 3,
  class: "zh-right__suffix"
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  props: {
    modelValue: {
      type: String,
      default: ""
    },
    type: {
      type: String,
      default: "text",
      validator: (value) => {
        return ["text", "password", "textarea"].includes(value);
      }
    },
    placeholder: {
      type: String,
      default: ""
    },
    disabled: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: false
    },
    showPassword: {
      type: Boolean,
      default: false
    }
  },
  emits: ["update:modelValue", "change", "input", "clear"],
  setup(__props, { emit: $emit }) {
    const ns = useNamespace("input");
    const { mouse_is, enter, leave } = useMouseEnterLeave();
    const clearModel = useClearModel($emit);
    const inputHandler = (e) => {
      let value = e.target.value;
      $emit("update:modelValue", value);
    };
    const { passwordVisible, changePasswordShow } = useShowPassword();
    return (_ctx, _cache) => {
      const _component_zh_icon = resolveComponent("zh-icon");
      return openBlock(), createElementBlock("div", {
        class: normalizeClass([unref(ns).b()])
      }, [
        createElementVNode("div", {
          class: normalizeClass(["zh-input__wrapper", [unref(ns).is(__props.disabled, "disabled")]]),
          onMouseenter: _cache[1] || (_cache[1] = (...args) => unref(enter) && unref(enter)(...args)),
          onMouseleave: _cache[2] || (_cache[2] = (...args) => unref(leave) && unref(leave)(...args))
        }, [
          __props.type === "text" ? (openBlock(), createElementBlock("span", _hoisted_1, [
            renderSlot(_ctx.$slots, "prefix", {}, void 0, true)
          ])) : createCommentVNode("", true),
          createElementVNode("input", {
            class: "zh-input__inner",
            disabled: __props.disabled,
            type: __props.showPassword ? unref(passwordVisible) ? "text" : "password" : __props.type,
            value: __props.modelValue,
            placeholder: __props.placeholder,
            onInput: inputHandler,
            onChange: _cache[0] || (_cache[0] = ($event) => $emit("change"))
          }, null, 40, _hoisted_2),
          __props.clearable && unref(mouse_is) ? (openBlock(), createElementBlock("span", _hoisted_3, [
            createVNode(_component_zh_icon, {
              name: "close",
              class: "text-gray-400 hover:text-gray-600 hover:border-gray-600 transition cursor-pointer border rounded-full",
              onClick: unref(clearModel)
            }, null, 8, ["onClick"])
          ])) : createCommentVNode("", true),
          __props.showPassword ? (openBlock(), createElementBlock("span", _hoisted_4, [
            createVNode(_component_zh_icon, {
              class: "text-gray-400 hover:text-gray-600 transition cursor-pointer",
              name: "view",
              onClick: unref(changePasswordShow)
            }, null, 8, ["onClick"])
          ])) : createCommentVNode("", true),
          __props.type === "text" ? (openBlock(), createElementBlock("span", _hoisted_5, [
            renderSlot(_ctx.$slots, "suffix", {}, void 0, true)
          ])) : createCommentVNode("", true)
        ], 34)
      ], 2);
    };
  }
});
var ZhInput = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-637e6d0c"]]);
var input = {
  install(app) {
    app.component("ZhInput", ZhInput);
  }
};
var index$1 = "";
const components = [button, icon, layout, badge, container$1, drawer, radio, BlSwitch, input];
var index = {
  install(app) {
    components.map((item) => item.install(app));
  }
};
export { BlMessageFn, MessageBoxFn, ZhAside, _sfc_main$d as ZhBadge, _sfc_main$f as ZhButton, _sfc_main$e as ZhButtonGroup, ZhCol, _sfc_main$a as ZhContainer, ZhDrawer, ZhFooter, ZhHeader, _sfc_main$g as ZhIcon, ZhInput, ZhMain, ZhRadio, ZhRow, ZhSwitch, index as default };
