function TreeNode({ node }) {
  return (
    <li>
      <div className="component-tree-node"><code>{node.name}</code><span>{node.description}</span></div>
      {node.children?.length > 0 && <ul>{node.children.map((child, index) => <TreeNode key={index} node={child} />)}</ul>}
    </li>
  );
}

export default function ComponentTree({ root, caption }) {
  return (
    <figure className="component-tree">
      <figcaption>{caption}</figcaption>
      <ul><TreeNode node={root} /></ul>
    </figure>
  );
}
