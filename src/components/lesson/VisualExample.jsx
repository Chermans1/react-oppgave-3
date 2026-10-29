import { createElement } from "react";

// Previews are static, allowlisted data. No source code or student input is executed.
// Use a div for a demonstrated main to avoid a nested main landmark in the app.
const previewTags = { h1: "h1", h2: "h2", p: "p", span: "span", article: "article", main: "div" };

function PreviewNode({ node }) {
  const tag = previewTags[node.tag];
  if (!tag) return null;
  return createElement(tag, { className: `preview-${node.tag}` },
    node.text,
    node.children?.map((child, index) => <PreviewNode key={index} node={child} />),
  );
}

export default function VisualExample({ caption, nodes }) {
  return (
    <figure className="visual-example">
      <figcaption>{caption}</figcaption>
      <div className="preview-window">
        <div className="preview-toolbar" aria-hidden="true"><span /> <span /> <span /> <small>Nettleserresultat</small></div>
        <div className="preview-content">{nodes.map((node, index) => <PreviewNode key={index} node={node} />)}</div>
      </div>
    </figure>
  );
}
