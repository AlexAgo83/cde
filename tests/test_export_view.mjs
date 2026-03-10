import test from "node:test";
import assert from "node:assert/strict";

import { init, load, visibilityExportButton } from "../views/exportView.mjs";

class FakeElement {
  constructor(tagName, ownerDocument) {
    this.tagName = tagName;
    this.ownerDocument = ownerDocument;
    this.children = [];
    this.parentNode = null;
    this.style = {};
    this.listeners = new Map();
    this._id = "";
    this.content = null;
    this.attributes = new Map();
  }

  set id(value) {
    this._id = value;
    this.ownerDocument.elements.set(value, this);
  }

  get id() {
    return this._id;
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  insertAdjacentElement(_position, element) {
    element.parentNode = this.parentNode;
    if (this.parentNode) {
      this.parentNode.children.unshift(element);
    }
  }

  addEventListener(name, handler) {
    this.listeners.set(name, handler);
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  blur() {}

  querySelector(selector) {
    if (selector === "#cde") {
      return this.children.find((child) => child.id === "cde") ?? null;
    }
    return null;
  }

  cloneNode(deep = false) {
    const clone = new FakeElement(this.tagName, this.ownerDocument);
    if (this.id) {
      clone.id = this.id;
    }
    clone.style = { ...this.style };
    if (deep) {
      this.children.forEach((child) => clone.appendChild(child.cloneNode(true)));
    }
    return clone;
  }
}

function createDocument() {
  const elements = new Map();
  const document = {
    elements,
    body: new FakeElement("body", null),
    getElementById(id) {
      return elements.get(id) ?? null;
    },
    createElement(tagName) {
      return new FakeElement(tagName, document);
    },
  };
  document.body.ownerDocument = document;

  const template = new FakeElement("template", document);
  template.id = "cde-button-topbar";
  const root = new FakeElement("div", document);
  const button = new FakeElement("button", document);
  button.id = "cde";
  button.attributes.set("@click", "clickedButton");
  root.appendChild(button);
  template.content = { firstElementChild: root };

  const potionParent = new FakeElement("div", document);
  const potionAnchor = new FakeElement("div", document);
  potionAnchor.id = "page-header-potions-dropdown";
  potionParent.appendChild(potionAnchor);
  potionAnchor.parentNode = potionParent;

  return { document, template, potionParent, potionAnchor };
}

test("export view falls back to template cloning when runtime ui.create is unavailable", () => {
  const { document, template } = createDocument();
  const previousDocument = globalThis.document;
  const previousElement = globalThis.Element;
  globalThis.document = document;
  globalThis.Element = FakeElement;

  try {
    init({
      getSettings() {
        return {
          SettingsReference: { SHOW_BUTTON: "SHOW_BUTTON" },
          isCfg() {
            return true;
          },
        };
      },
      getUtils() {
        return {
          createIconCSS() {},
        };
      },
      getMelvorRuntime() {
        return {
          getUi() {
            return undefined;
          },
        };
      },
      getExport() {
        return {
          getExportJSON() {
            return {};
          },
        };
      },
    });

    document.body.appendChild(template);
    load({});

    const button = document.getElementById("cde");
    assert.ok(button);
    visibilityExportButton(false);
    assert.equal(button.style.visibility, "hidden");
  } finally {
    globalThis.document = previousDocument;
    globalThis.Element = previousElement;
  }
});
