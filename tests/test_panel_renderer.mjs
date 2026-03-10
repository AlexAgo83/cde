import test from "node:test";
import assert from "node:assert/strict";

import {
  injectPanel,
  displayEtaAt,
  removeInjectedPanel,
  getHeaderID,
} from "../modules/panelRenderer.mjs";

class FakeClassList {
  constructor() {
    this.values = new Set();
  }
  add(value) {
    this.values.add(value);
  }
  remove(value) {
    this.values.delete(value);
  }
  contains(value) {
    return this.values.has(value);
  }
}

class FakeElement {
  constructor(tagName, ownerDocument) {
    this.tagName = tagName;
    this.ownerDocument = ownerDocument;
    this.children = [];
    this.classList = new FakeClassList();
    this.style = {};
    this.listeners = {};
    this.parentNode = null;
    this._id = "";
  }

  set id(value) {
    this._id = value;
    this.ownerDocument.byId.set(value, this);
  }
  get id() {
    return this._id;
  }

  prepend(child) {
    child.parentNode = this;
    this.children.unshift(child);
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
  }

  addEventListener(name, handler) {
    this.listeners[name] = handler;
  }

  querySelector(selector) {
    if (selector === ".row-deck") {
      return this.rowDeck ?? null;
    }
    return null;
  }

  remove() {
    this.ownerDocument.byId.delete(this.id);
    if (this.parentNode) {
      this.parentNode.children = this.parentNode.children.filter((child) => child !== this);
    }
  }
}

function createDocument() {
  const byId = new Map();
  const container = new FakeElement("div", { byId });
  const rowDeck = new FakeElement("div", { byId });
  container.rowDeck = rowDeck;
  const doc = {
    byId,
    querySelector(selector) {
      if (selector === "#target") {
        return container;
      }
      return null;
    },
    getElementById(id) {
      return byId.get(id) ?? null;
    },
    createElement(tagName) {
      return new FakeElement(tagName, doc);
    },
  };
  container.ownerDocument = doc;
  rowDeck.ownerDocument = doc;
  return { doc, container, rowDeck };
}

test("injectPanel creates and inserts an ETA panel into the preferred row deck", () => {
  const { doc, rowDeck } = createDocument();
  const currentPanel = {
    setControlsPanelCb(cb) {
      this.controlsCb = cb;
    },
    container(parentPanel, summaryId, identifier) {
      this.parentPanel = parentPanel;
      this.summaryId = summaryId;
      this.identifier = identifier;
      return `<div>${identifier}</div>`;
    },
  };
  const chartPanel = {
    getHtmlElement(identifier) {
      const element = doc.createElement("chart");
      element.id = `chart-${identifier}`;
      return element;
    },
  };

  const rendered = injectPanel({
    documentRef: doc,
    targetPage: "#target",
    identifier: "combat",
    currPanel: currentPanel,
    chartPanel,
    isChartEnabled: true,
    controlsPosition: "left",
    onControlsPanel: () => "<controls />",
    onPanelClick() {},
  });

  assert.equal(rendered.summaryId, "cde-eta-summary-combat");
  assert.equal(rowDeck.children[0].id, getHeaderID("combat"));
  assert.equal(currentPanel.parentPanel.classList.contains("cde-justify-left"), true);
});

test("displayEtaAt updates alignment classes and removeInjectedPanel cleans up the header", () => {
  const { doc } = createDocument();
  const panel = doc.createElement("div");
  panel.id = getHeaderID("fishing");
  displayEtaAt(panel, "right");
  assert.equal(panel.classList.contains("cde-justify-right"), true);

  removeInjectedPanel(doc, "fishing");
  assert.equal(doc.getElementById(getHeaderID("fishing")), null);
});
