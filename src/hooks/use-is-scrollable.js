import { useCallback, useLayoutEffect, useState } from "react";

export const useIsScrollable = (dependencies, _node=undefined) => {
  const [node, setNode] = useState(_node);
  const ref = useCallback((node) => {
    setNode(node);
  }, []);

  const [isScrollable, setIsScrollable] = useState(false);

  useLayoutEffect(() => {
    if (!node) return;

    setIsScrollable(node.scrollHeight > node.clientHeight);
  }, [...dependencies, node]);

  useLayoutEffect(() => {
    if (!node) return;

    const handleWindowResize = () => {
      setIsScrollable(node.scrollHeight > node.clientHeight);
    };

    window.addEventListener("resize", handleWindowResize);

    return () => window.removeEventListener("resize", handleWindowResize);
  }, [node]);

  return [isScrollable, ref, node];
};
