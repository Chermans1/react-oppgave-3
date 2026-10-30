import { createElement, useId } from "react";

// Static, allowlisted data only. Never evaluate source code or student input.
// A demonstrated main uses a div to avoid a nested main landmark in the app.
const previewTags = {
  h1: "h1", h2: "h2", p: "p", span: "span", article: "article", main: "div",
  section: "section", div: "div", label: "label", input: "input",
};

function PreviewNode({ node, idPrefix }) {
  const tag = previewTags[node.tag];
  if (!tag) return null;
  const props = { className: `preview-${node.tag}${node.className ? ` ${node.className}` : ""}` };
  if (node.id) props.id = `${idPrefix}-${node.id}`;
  if (tag === "label" && node.htmlFor) props.htmlFor = `${idPrefix}-${node.htmlFor}`;
  // Preview fields illustrate the result without introducing interactive form state.
  if (tag === "input") return createElement(tag, { ...props, type: "text", readOnly: true, placeholder: node.placeholder });
  return createElement(tag, props,
    node.text,
    node.children?.map((child, index) => <PreviewNode key={index} node={child} idPrefix={idPrefix} />),
  );
}

export default function VisualExample({ caption, nodes }) {
  const idPrefix = useId();
  return (
    <figure className="visual-example">
      <figcaption>{caption}</figcaption>
      <div className="preview-window">
        <div className="preview-toolbar" aria-hidden="true"><span /> <span /> <span /> <small>Nettleserresultat</small></div>
        <div className="preview-content">{nodes.map((node, index) => <PreviewNode key={index} node={node} idPrefix={idPrefix} />)}</div>
      </div>
    </figure>
  );
}
