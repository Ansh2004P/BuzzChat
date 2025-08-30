import React from 'react';
import Lottie from 'react-lottie';
import useLottieOptions from '../../hooks/useLottieOptions';

const TypingIndicator = React.memo(() => {
  const defaultOptions = useLottieOptions();

  return (
    <div className="flex w-1/4 justify-start my-3 px-4">
      <Lottie
        options={defaultOptions}
        height={50}
        width={100}
        className="mb-4"
      />
    </div>
  );
});

TypingIndicator.displayName = 'TypingIndicator';

export default TypingIndicator;
