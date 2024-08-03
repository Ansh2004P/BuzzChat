import React from "react";

const Loading = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="loadingio-spinner-ellipsis-nq4q5u6dq7r">
        <div className="ldio-x2uulkbinbj">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
      <style>{`
        @keyframes ldio-x2uulkbinbj {
          0% {
            transform: translate(18px, 86px) scale(0);
          }
          25% {
            transform: translate(18px, 86px) scale(0);
          }
          50% {
            transform: translate(18px, 86px) scale(1);
          }
          75% {
            transform: translate(86px, 86px) scale(1);
          }
          100% {
            transform: translate(154px, 86px) scale(1);
          }
        }
        @keyframes ldio-x2uulkbinbj-r {
          0% {
            transform: translate(154px, 86px) scale(1);
          }
          100% {
            transform: translate(154px, 86px) scale(0);
          }
        }
        @keyframes ldio-x2uulkbinbj-c {
          0% {
            background: #d9d7d8;
          }
          25% {
            background: #9e9f9b;
          }
          50% {
            background: #b2b2b2;
          }
          75% {
            background: #f3f3f3;
          }
          100% {
            background: #d9d7d8;
          }
        }
        .ldio-x2uulkbinbj div {
          position: absolute;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          transform: translate(86px, 86px) scale(1);
          background: #d9d7d8;
          animation: ldio-x2uulkbinbj 1.7857142857142856s infinite cubic-bezier(0, 0.5, 0.5, 1);
        }
        .ldio-x2uulkbinbj div:nth-child(1) {
          background: #f3f3f3;
          transform: translate(154px, 86px) scale(1);
          animation: ldio-x2uulkbinbj-r 0.4464285714285714s infinite cubic-bezier(0, 0.5, 0.5, 1),
            ldio-x2uulkbinbj-c 1.7857142857142856s infinite step-start;
        }
        .ldio-x2uulkbinbj div:nth-child(2) {
          animation-delay: -0.4464285714285714s;
          background: #d9d7d8;
        }
        .ldio-x2uulkbinbj div:nth-child(3) {
          animation-delay: -0.8928571428571428s;
          background: #f3f3f3;
        }
        .ldio-x2uulkbinbj div:nth-child(4) {
          animation-delay: -1.3392857142857142s;
          background: #b2b2b2;
        }
        .ldio-x2uulkbinbj div:nth-child(5) {
          animation-delay: -1.7857142857142856s;
          background: #9e9f9b;
        }
        .loadingio-spinner-ellipsis-nq4q5u6dq7r {
          width: 200px;
          height: 200px;
          display: inline-block;
          overflow: hidden;
          background: none;
        }
        .ldio-x2uulkbinbj {
          width: 100%;
          height: 100%;
          position: relative;
          transform: translateZ(0) scale(1);
          backface-visibility: hidden;
          transform-origin: 0 0;
        }
        .ldio-x2uulkbinbj div {
          box-sizing: content-box;
        }
      `}</style>
    </div>
  );
};

export default Loading;
