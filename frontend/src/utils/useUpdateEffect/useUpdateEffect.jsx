import { useEffect, useRef } from "react";

export default function useUpdateEffect(
  effect,
  dependencies = [],
  effectArgs = []
) {
  /**
   * A custom hook that runs an effect when a component updates (and its dependencies change)
   * but not on mount.
   * @param {Function} effect - the effect function to be run
   * @param {Array} dependencies - the values that when changed should cause the effect to run
   */
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return undefined;
    }
    return effect(...effectArgs);
  }, dependencies);
}
