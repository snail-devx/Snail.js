//@ sourceURL=/snail.view.js
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('snail.core')) :
    typeof define === 'function' && define.amd ? define(['exports', 'snail.core'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.SnailView = global.SnailView || {}, global.Snail));
})(this, (function (exports, snail_core) { 'use strict';

    function getAnimationScope(manager, el) {
      snail_core.checkScope(manager, "getAnimationScope: manager destroyed.");
      snail_core.throwIfFalse(el instanceof HTMLElement, "getAnimationScope: el must be an HTMLElement.");
      return snail_core.useKeyScope(el, false).scope;
    }

    function useCSS() {
      function parse(css2) {
        if (snail_core.isStringNotEmpty(css2) == true) {
          return {
            class: [css2]
          };
        }
        if (snail_core.isArrayNotEmpty(css2) == true) {
          const strs = css2.filter(name => snail_core.isStringNotEmpty(name));
          return strs.length > 0 ? {
            class: strs
          } : {};
        }
        if (css2 instanceof CSSStyleDeclaration || snail_core.isObject(css2) == true) {
          return {
            style: Object.assign(Object.create(null), css2)
          };
        }
        return Object.create(null);
      }
      function operate(el, type, css2) {
        css2 && snail_core.isArrayNotEmpty(css2.class) && css2.class.forEach(name => type == "add" ? el.classList.add(name) : el.classList.remove(name));
        css2 && css2.style && Object.keys(css2.style).forEach(key => type == "add" ? el.style.setProperty(key, css2.style[key]) : el.style.removeProperty(key));
      }
      function buildStyle(options) {
        const style = Object.create(null);
        if (!!!options) {
          return style;
        }
        {
          options.color && (style.color = options.color);
          options.backgroundColor && (style.backgroundColor = options.backgroundColor);
          options.textAlign && (style.textAlign = options.textAlign);
          options.verticalAlign && (style.verticalAlign = options.verticalAlign);
          options.justifyContent && (style.justifyContent = options.justifyContent);
          options.alignItems && (style.alignItems = options.alignItems);
          options.flex && (style.flex = options.flex);
          options.flexBasis && (style.flexBasis = options.flexBasis);
          options.flexGrow > 0 && (style.flexGrow = String(options.flexGrow));
          options.flexShrink > 0 && (style.flexShrink = String(options.flexShrink));
          options.order > 0 && (style.order = String(options.order));
          options.alignSelf && (style.alignSelf = options.alignSelf);
        }
        {
          options.width && (style.width = options.width);
          options.minWidth && (style.minWidth = options.minWidth);
          options.maxWidth && (style.maxWidth = options.maxWidth);
          options.height && (style.height = options.height);
          options.minHeight && (style.minHeight = options.minHeight);
          options.maxHeight && (style.maxHeight = options.maxHeight);
          options.margin && (style.margin = options.margin);
          options.marginTop && (style.marginTop = options.marginTop);
          options.marginRight && (style.marginRight = options.marginRight);
          options.marginBottom && (style.marginBottom = options.marginBottom);
          options.marginLeft && (style.marginLeft = options.marginLeft);
          options.borderRadius && (style.borderRadius = options.borderRadius);
          options.border && (style.border = options.border);
          options.borderTop && (style.borderTop = options.borderTop);
          options.borderRight && (style.borderRight = options.borderRight);
          options.borderBottom && (style.borderBottom = options.borderBottom);
          options.borderLeft && (style.borderLeft = options.borderLeft);
          options.padding && (style.padding = options.padding);
          options.paddingTop && (style.paddingTop = options.paddingTop);
          options.paddingRight && (style.paddingRight = options.paddingRight);
          options.paddingBottom && (style.paddingBottom = options.paddingBottom);
          options.paddingLeft && (style.paddingLeft = options.paddingLeft);
        }
        {
          options.transition && (style.transition = options.transition);
          options.transitionProperty && (style.transitionProperty = options.transitionProperty);
          options.transitionDuration && (style.transitionDuration = options.transitionDuration);
          options.transitionDelay && (style.transitionDelay = options.transitionDelay);
          options.transitionTimingFunction && (style.transitionTimingFunction = options.transitionTimingFunction);
        }
        return style;
      }
      return Object.freeze({
        parse,
        operate,
        buildStyle
      });
    }
    const css = useCSS();

    function useAnimation() {
      const scopes = snail_core.useScopes();
      function transition(el, effect, time) {
        snail_core.throwIfFalse(snail_core.isObject(effect), "transition: effect must be an object.");
        const scope = scopes.add(getAnimationScope(manager, el));
        const fromCss = css.parse(effect.from);
        const toCss = css.parse(effect.to);
        const endCss = css.parse(effect.end);
        css.operate(el, "clear", toCss);
        css.operate(el, "clear", endCss);
        css.operate(el, "add", fromCss);
        setTimeout(css.operate, 1, el, "add", toCss);
        setTimeout(scope.destroy, time > 0 ? time : 200);
        return scope.onDestroy(function () {
          css.operate(el, "clear", fromCss);
          css.operate(el, "clear", toCss);
          css.operate(el, "add", endCss);
        });
      }
      const manager = snail_core.mountScope({
        transition
      });
      manager.onDestroy(scopes.destroy);
      return Object.freeze(manager);
    }

    const LINK_CONFIG = {
      theme: void 0,
      container: void 0,
      origin: void 0,
      version: void 0
    };
    const EVENT_ChangeTheme = "Snail.ChangeTheme";
    const LINK_CONTAINER_ID = "snail_link_container";
    function checkLinkOptions(options) {
      options = snail_core.extract(Object.keys(LINK_CONFIG), options);
      snail_core.hasOwnProperty(options, "theme") && (options.theme = snail_core.tidyString(options.theme));
      snail_core.hasOwnProperty(options, "origin") && (options.origin = snail_core.tidyString(options.origin));
      return options;
    }
    function getLinkDefaultContainer() {
      var container = document.getElementById(LINK_CONTAINER_ID);
      if (!container) {
        container = document.createElement("div");
        container.id = LINK_CONTAINER_ID;
        container.style.display = "none !important";
        container.style.height = "0px";
        container.style.width = "0px";
        document.body.appendChild(container);
      }
      return container;
    }
    function setlinkByTheme(links, code, options) {
      let hasMatchTheme = false;
      links.forEach(link => {
        code && link.theme == code && (hasMatchTheme = true);
        link.element.disabled = link.ref == 0 || link.theme != void 0 && link.theme != code;
      });
      let defaultTheme = hasMatchTheme ? void 0 : options.theme || LINK_CONFIG.theme;
      defaultTheme && links.forEach(link => {
        link.theme == defaultTheme && (link.element.disabled = link.ref == 0);
      });
    }
    function destroylink(links, isDel) {
      links.forEach(link => {
        link.ref = isDel ? 0 : Math.max(0, link.ref - 1);
        link.element.setAttribute("data-ref", link.ref.toString());
        link.element.disabled = link.ref == 0;
        if (isDel == true) {
          link.element.parentNode && link.element.parentNode.removeChild(link.element);
          link.element = void 0;
        }
      });
      links.splice(0);
    }

    function useLink(options) {
      options = Object.freeze(checkLinkOptions(options));
      var scopeTheme = void 0;
      const scopeLinks = [];
      function register() {
        const funclinks = [];
        for (var _len = arguments.length, files = new Array(_len), _key = 0; _key < _len; _key++) {
          files[_key] = arguments[_key];
        }
        snail_core.isArrayNotEmpty(files) && files.forEach(file => {
          const link2 = typeof file == "string" ? {
            file,
            theme: void 0
          } : file;
          let href = linkMap.get(link2.file);
          href && console.log(`map to new link file. link: ${link2.file}, new link: ${href}`);
          href = href || link2.file;
          snail_core.mustString(href, "href");
          let tmpStr = options.origin || LINK_CONFIG.origin;
          snail_core.isStringNotEmpty(tmpStr) && (href = new URL(href, tmpStr).toString());
          tmpStr = href.toLowerCase();
          let linkEle = scopeLinks.find(s => s.theme == link2.theme && s.file.toLowerCase() == tmpStr);
          if (!linkEle) {
            linkEle = {
              file: href,
              theme: link2.theme,
              ref: 0
            };
            scopeLinks.push(linkEle);
          }
          linkEle.ref += 1;
          funclinks.push(linkEle);
          if (!linkEle.element) {
            linkEle.element = document.createElement("link");
            linkEle.element.href = (options.version || LINK_CONFIG.version || snail_core.version).formart(linkEle.file);
            linkEle.element.rel = "stylesheet";
            linkEle.element.disabled = true;
            link2.theme && linkEle.element.setAttribute("data-theme", link2.theme);
            const container = options.container || LINK_CONFIG.container || getLinkDefaultContainer();
            container.appendChild(linkEle.element);
          }
          linkEle.element.setAttribute("data-ref", linkEle.ref.toString());
        });
        funclinks.length > 0 && setlinkByTheme(funclinks, scopeTheme, options);
        return snail_core.useScope().onDestroy(() => destroylink(funclinks, false));
      }
      function theme(code) {
        snail_core.mustString(code, "code");
        if (scopeTheme != code) {
          setlinkByTheme(scopeLinks, scopeTheme = code, options);
          manager === link && snail_core.event.trigger(EVENT_ChangeTheme, code, true);
        }
        return manager;
      }
      const manager = snail_core.mountScope({
        register,
        theme
      });
      {
        manager.onDestroy(() => {
          snail_core.event.off(EVENT_ChangeTheme, theme);
          destroylink(scopeLinks, true);
        });
        snail_core.event.on(EVENT_ChangeTheme, theme);
      }
      return Object.freeze(manager);
    }
    const linkMap = new Map();
    const link = useLink();
    snail_core.event.off(EVENT_ChangeTheme, link.theme);
    function configLink(options) {
      options = checkLinkOptions(options);
      Object.assign(LINK_CONFIG, options);
      return link;
    }

    function useObserver() {
      const scopes = snail_core.useScopes();
      function onEvent(target, name, fn) {
        snail_core.checkScope(manager, "onEvent: observer destroyed.");
        snail_core.throwIfFalse(target instanceof Element || target === window, "onEvent: target must be a Element or Window");
        snail_core.mustString(name, "onEvent: name");
        snail_core.mustFunction(fn, "onEvent: fn");
        target.addEventListener(name, fn);
        return scopes.get().onDestroy(() => target.removeEventListener(name, fn));
      }
      function onSize(el, fn) {
        snail_core.checkScope(manager, "onSize: observer destroyed.");
        snail_core.throwIfFalse(el instanceof Element, "onSize: el must be a Element.");
        const scope = scopes.get();
        var preSize = void 0;
        function calcSize() {
          if (scope.destroyed == false) {
            const rect = el.getBoundingClientRect();
            const isChange = preSize == void 0 || preSize.width != rect.width || preSize.height != rect.height;
            if (isChange == true) {
              preSize = Object.freeze({
                width: rect.width,
                height: rect.height
              });
              snail_core.run(fn, preSize);
            }
          }
        }
        const resizeObserver = "ResizeObserver" in window ? new ResizeObserver(calcSize) : void 0;
        const timer = resizeObserver ? resizeObserver.observe(el) : setInterval(calcSize, 100);
        setTimeout(calcSize);
        return scope.onDestroy(() => {
          resizeObserver && resizeObserver.disconnect();
          timer && clearInterval(timer);
        });
      }
      function onClient(el, fn) {
        snail_core.checkScope(manager, "onClient: observer destroyed.");
        snail_core.throwIfFalse(el instanceof Element, "onClient: el must be a Element.");
        const scope = scopes.get();
        var preRect = void 0;
        const timer = setInterval(function () {
          if (scope.destroyed == false) {
            const rect = el.getBoundingClientRect();
            const isChange = preRect == void 0 || rect.x != preRect.x || rect.y != preRect.y || rect.width != preRect.width || rect.height != preRect.height;
            if (isChange == true) {
              preRect = DOMRectReadOnly.fromRect(rect);
              snail_core.run(fn, preRect);
            }
          }
        }, 100);
        return scope.onDestroy(() => clearInterval(timer));
      }
      const manager = snail_core.mountScope({
        onEvent,
        onSize,
        onClient
      });
      manager.onDestroy(scopes.destroy);
      return Object.freeze(manager);
    }

    exports.configLink = configLink;
    exports.css = css;
    exports.link = link;
    exports.linkMap = linkMap;
    exports.useAnimation = useAnimation;
    exports.useLink = useLink;
    exports.useObserver = useObserver;

}));
