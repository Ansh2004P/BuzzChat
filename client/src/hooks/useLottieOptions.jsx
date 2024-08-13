// src/hooks/useLottieOptions.js

import { useMemo } from "react";
import animationData from "../assets/animations/typing.json";

const useLottieOptions = () => {
  return useMemo(
    () => ({
      loop: true,
      autoplay: true,
      animationData: animationData,
      rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
      },
    }),
    []
  );
};

export default useLottieOptions;
