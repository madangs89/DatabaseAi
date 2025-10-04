import React from "react";
import styled from "styled-components";

const LoaderAnimation = () => {
  return (
    <StyledWrapper>
      <div className="comic-brutalist-loader ">
        <div className="loader-container">
          <div className="comic-panel">
            <div className="speech-bubble">
              <span className="loading-text">LOADING</span>
              <div className="dots">
                <span className="dot">!</span>
                <span className="dot">?</span>
                <span className="dot">!</span>
              </div>
            </div>
            <div className="comic-character">
              <div className="character-head" />
              <div className="character-body" />
              <div className="character-eyes">
                <div className="eye left" />
                <div className="eye right" />
              </div>
              <div className="character-mouth" />
            </div>
            <div className="starburst">
              <div className="star-spike" />
              <div className="star-spike" />
              <div className="star-spike" />
              <div className="star-spike" />
              <div className="star-spike" />
              <div className="star-spike" />
              <div className="star-spike" />
              <div className="star-spike" />
            </div>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  /* Loader */
  .comic-brutalist-loader {
    --primary-color: #ff3c41;
    --secondary-color: #0055ff;
    --bg-color: #ffeb3b;
    --text-color: #000;
    --border-width: 0.25em;

    font-family: Arial, sans-serif;
    width: 20em;
    height: 20em;
    position: relative;
    margin: 2em auto;
  }

  /*  Panel */
  .loader-container {
    width: 100%;
    height: 100%;
    position: relative;
    transform: rotate(-3deg);
  }

  .comic-panel {
    width: 100%;
    height: 100%;
    background-color: #171717;
    border: var(--border-width) solid black;
    box-shadow: 0.5em 0.5em 0 black;
    position: relative;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  /* AddED dot pattern manually instead of using background-image */
  .comic-panel::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: transparent;
    opacity: 0.3;
    z-index: 0;
    box-shadow: 1em 1em 0 0.1em var(--bg-color), 3em 1em 0 0.1em var(--bg-color),
      5em 1em 0 0.1em var(--bg-color), 7em 1em 0 0.1em var(--bg-color),
      9em 1em 0 0.1em var(--bg-color), 11em 1em 0 0.1em var(--bg-color),
      13em 1em 0 0.1em var(--bg-color), 15em 1em 0 0.1em var(--bg-color),
      17em 1em 0 0.1em var(--bg-color), 19em 1em 0 0.1em var(--bg-color),
      1em 3em 0 0.1em var(--bg-color), 3em 3em 0 0.1em var(--bg-color),
      5em 3em 0 0.1em var(--bg-color), 7em 3em 0 0.1em var(--bg-color),
      9em 3em 0 0.1em var(--bg-color), 11em 3em 0 0.1em var(--bg-color),
      13em 3em 0 0.1em var(--bg-color), 15em 3em 0 0.1em var(--bg-color),
      17em 3em 0 0.1em var(--bg-color), 19em 3em 0 0.1em var(--bg-color),
      1em 5em 0 0.1em var(--bg-color), 3em 5em 0 0.1em var(--bg-color),
      5em 5em 0 0.1em var(--bg-color), 7em 5em 0 0.1em var(--bg-color),
      9em 5em 0 0.1em var(--bg-color), 11em 5em 0 0.1em var(--bg-color),
      13em 5em 0 0.1em var(--bg-color), 15em 5em 0 0.1em var(--bg-color),
      17em 5em 0 0.1em var(--bg-color), 19em 5em 0 0.1em var(--bg-color),
      1em 7em 0 0.1em var(--bg-color), 3em 7em 0 0.1em var(--bg-color),
      5em 7em 0 0.1em var(--bg-color), 7em 7em 0 0.1em var(--bg-color),
      9em 7em 0 0.1em var(--bg-color), 11em 7em 0 0.1em var(--bg-color),
      13em 7em 0 0.1em var(--bg-color), 15em 7em 0 0.1em var(--bg-color),
      17em 7em 0 0.1em var(--bg-color), 19em 7em 0 0.1em var(--bg-color),
      1em 9em 0 0.1em var(--bg-color), 3em 9em 0 0.1em var(--bg-color),
      5em 9em 0 0.1em var(--bg-color), 7em 9em 0 0.1em var(--bg-color),
      9em 9em 0 0.1em var(--bg-color), 11em 9em 0 0.1em var(--bg-color),
      13em 9em 0 0.1em var(--bg-color), 15em 9em 0 0.1em var(--bg-color),
      17em 9em 0 0.1em var(--bg-color), 19em 9em 0 0.1em var(--bg-color),
      1em 11em 0 0.1em var(--bg-color), 3em 11em 0 0.1em var(--bg-color),
      5em 11em 0 0.1em var(--bg-color), 7em 11em 0 0.1em var(--bg-color),
      9em 11em 0 0.1em var(--bg-color), 11em 11em 0 0.1em var(--bg-color),
      13em 11em 0 0.1em var(--bg-color), 15em 11em 0 0.1em var(--bg-color),
      17em 11em 0 0.1em var(--bg-color), 19em 11em 0 0.1em var(--bg-color),
      1em 13em 0 0.1em var(--bg-color), 3em 13em 0 0.1em var(--bg-color),
      5em 13em 0 0.1em var(--bg-color), 7em 13em 0 0.1em var(--bg-color),
      9em 13em 0 0.1em var(--bg-color), 11em 13em 0 0.1em var(--bg-color),
      13em 13em 0 0.1em var(--bg-color), 15em 13em 0 0.1em var(--bg-color),
      17em 13em 0 0.1em var(--bg-color), 19em 13em 0 0.1em var(--bg-color),
      1em 15em 0 0.1em var(--bg-color), 3em 15em 0 0.1em var(--bg-color),
      5em 15em 0 0.1em var(--bg-color), 7em 15em 0 0.1em var(--bg-color),
      9em 15em 0 0.1em var(--bg-color), 11em 15em 0 0.1em var(--bg-color),
      13em 15em 0 0.1em var(--bg-color), 15em 15em 0 0.1em var(--bg-color),
      17em 15em 0 0.1em var(--bg-color), 19em 15em 0 0.1em var(--bg-color),
      1em 17em 0 0.1em var(--bg-color), 3em 17em 0 0.1em var(--bg-color),
      5em 17em 0 0.1em var(--bg-color), 7em 17em 0 0.1em var(--bg-color),
      9em 17em 0 0.1em var(--bg-color), 11em 17em 0 0.1em var(--bg-color),
      13em 17em 0 0.1em var(--bg-color), 15em 17em 0 0.1em var(--bg-color),
      17em 17em 0 0.1em var(--bg-color), 19em 17em 0 0.1em var(--bg-color),
      1em 19em 0 0.1em var(--bg-color), 3em 19em 0 0.1em var(--bg-color),
      5em 19em 0 0.1em var(--bg-color), 7em 19em 0 0.1em var(--bg-color),
      9em 19em 0 0.1em var(--bg-color), 11em 19em 0 0.1em var(--bg-color),
      13em 19em 0 0.1em var(--bg-color), 15em 19em 0 0.1em var(--bg-color),
      17em 19em 0 0.1em var(--bg-color), 19em 19em 0 0.1em var(--bg-color);
  }

  /* Comic Character */
  .comic-character {
    position: absolute;
    bottom: 3em;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2;
    animation: bounce 0.8s infinite alternate ease-in-out;
  }

  .character-head {
    width: 6em;
    height: 6em;
    background-color: var(--primary-color);
    border: var(--border-width) solid black;
    border-radius: 50%;
    position: relative;
  }

  .character-body {
    width: 3em;
    height: 2em;
    background-color: var(--primary-color);
    border: var(--border-width) solid black;
    margin: -0.5em auto 0;
    border-radius: 0 0 1em 1em;
  }

  .character-eyes {
    position: absolute;
    top: 2em;
    left: 0;
    width: 100%;
    display: flex;
    justify-content: space-around;
  }

  .eye {
    width: 1.5em;
    height: 1.5em;
    background: white;
    border: var(--border-width) solid black;
    border-radius: 50%;
    position: relative;
    animation: blink 2s infinite;
  }

  .eye::after {
    content: "";
    position: absolute;
    width: 0.6em;
    height: 0.6em;
    background: black;
    border-radius: 50%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: look 3s infinite;
  }

  .character-mouth {
    position: absolute;
    bottom: 1em;
    left: 50%;
    transform: translateX(-50%);
    width: 2em;
    height: 0.5em;
    background: black;
    border-radius: 0.25em;
    animation: mouth 1.5s infinite;
  }

  /* Speech Bubble */
  .speech-bubble {
    position: absolute;
    top: 2em;
    left: 50%;
    transform: translateX(-50%);
    background: white;
    border: var(--border-width) solid black;
    border-radius: 1em;
    padding: 0.8em 1.5em;
    display: flex;
    align-items: center;
    z-index: 3;
    min-width: 10em;
  }

  .speech-bubble::after {
    content: "";
    position: absolute;
    bottom: -1.5em;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 1em solid transparent;
    border-right: 1em solid transparent;
    border-top: 1.5em solid black;
    z-index: -1;
  }

  .speech-bubble::before {
    content: "";
    position: absolute;
    bottom: -1.2em;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 0.8em solid transparent;
    border-right: 0.8em solid transparent;
    border-top: 1.2em solid white;
    z-index: 1;
  }

  .loading-text {
    font-size: 1.5em;
    font-weight: bold;
    color: var(--text-color);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-family: Arial, sans-serif;
  }

  .dots {
    display: flex;
    margin-left: 0.5em;
  }

  .dot {
    font-size: 1.5em;
    font-weight: bold;
    color: var(--secondary-color);
    margin-left: 0.2em;
    animation: pulseDot 0.6s infinite alternate;
  }

  .dot:nth-child(2) {
    animation-delay: 0.2s;
    color: var(--primary-color);
  }

  .dot:nth-child(3) {
    animation-delay: 0.4s;
    color: var(--secondary-color);
  }

  /* Starburst */
  .starburst {
    position: absolute;
    width: 8em;
    height: 8em;
    top: 60%;
    right: 2em;
    z-index: 1;
    transform: rotate(0deg);
    animation: rotate 8s linear infinite;
  }

  .star-spike {
    position: absolute;
    width: 8em;
    height: 2em;
    background: var(--secondary-color);
    top: 3em;
    left: 0;
    transform-origin: center;
  }

  .star-spike:nth-child(2) {
    transform: rotate(45deg);
  }

  .star-spike:nth-child(3) {
    transform: rotate(90deg);
  }

  .star-spike:nth-child(4) {
    transform: rotate(135deg);
  }

  .star-spike:nth-child(5) {
    transform: rotate(180deg);
  }

  .star-spike:nth-child(6) {
    transform: rotate(225deg);
  }

  .star-spike:nth-child(7) {
    transform: rotate(270deg);
  }

  .star-spike:nth-child(8) {
    transform: rotate(315deg);
  }

  /* Animations */
  @keyframes bounce {
    0% {
      transform: translateX(-50%) translateY(0);
    }
    100% {
      transform: translateX(-50%) translateY(-1em);
    }
  }

  @keyframes blink {
    0%,
    45%,
    55%,
    100% {
      transform: scaleY(1);
    }
    50% {
      transform: scaleY(0.1);
    }
  }

  @keyframes look {
    0%,
    40%,
    60%,
    100% {
      transform: translate(-50%, -50%);
    }
    50% {
      transform: translate(-30%, -50%);
    }
    90% {
      transform: translate(-70%, -50%);
    }
  }

  @keyframes mouth {
    0%,
    100% {
      height: 0.5em;
      width: 2em;
    }
    50% {
      height: 1em;
      width: 1em;
      border-radius: 50%;
    }
  }

  @keyframes pulseDot {
    0% {
      transform: scale(1);
    }
    100% {
      transform: scale(1.5);
    }
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  /*  badge */
  .comic-panel::after {
    content: "WAIT!";
    position: absolute;
    top: 0.5em;
    right: 0.5em;
    background: var(--primary-color);
    color: white;
    font-weight: bold;
    padding: 0.3em 0.6em;
    transform: rotate(5deg);
    border: var(--border-width) solid black;
    z-index: 4;
    font-size: 0.9em;
  }

  /*  noise texture   */
  .comic-character::before {
    content: "";
    position: absolute;
    top: -1em;
    left: -1em;
    right: -1em;
    bottom: -1em;
    background-image: repeating-conic-gradient(
      rgba(0, 0, 0, 0.03) 0% 25%,
      rgba(255, 255, 255, 0.03) 0% 50%
    );
    background-size: 0.5em 0.5em;
    pointer-events: none;
    z-index: 3;
    opacity: 0.3;
    mix-blend-mode: overlay;
  }
`;

export default LoaderAnimation;
