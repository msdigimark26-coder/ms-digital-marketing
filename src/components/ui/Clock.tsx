import { useEffect } from "react";

export const Clock = () => {
  useEffect(() => {
    const HOUR_COUNT = 12;
    const MINUTE_COUNT = 60;
    const HOUR_ANGLE_INCREMENT = 360 / HOUR_COUNT;
    const MINUTE_ANGLE_INCREMENT = 360 / MINUTE_COUNT;

    const container = document.querySelector(".numbers");
    const dashTemplate = document.getElementById("dash-template") as HTMLTemplateElement;
    const hourTemplate = document.getElementById("hour-template") as HTMLTemplateElement;

    if (!container || !dashTemplate || !hourTemplate) {
      console.error("Error: Clock templates or container not found.");
      return;
    }

    // Generate Hour Numerals (12 through 11)
    for (let i = 0; i < HOUR_COUNT; i++) {
      const hour = i === 0 ? 12 : i;
      const rotationAngle = i * HOUR_ANGLE_INCREMENT;
      const clone = hourTemplate.content.cloneNode(true) as DocumentFragment;
      const numberDiv = clone.firstElementChild as HTMLElement;

      if (numberDiv) {
        numberDiv.style.transform = `rotate(${rotationAngle}deg) translateY(var(--dim-numerals-offset))`;

        const numberSpan = numberDiv.querySelector("span");

        if (numberSpan) {
          numberSpan.textContent = String(hour);
          numberSpan.style.transform = `rotate(${-rotationAngle}deg)`;
        }

        container.appendChild(clone);
      }
    }

    // Generate Minute/Second Dashes (60 dashes)
    for (let i = 0; i < MINUTE_COUNT; i++) {
      const rotationAngle = i * MINUTE_ANGLE_INCREMENT;

      const clone = dashTemplate.content.cloneNode(true) as DocumentFragment;
      const dashElement = clone.firstElementChild as HTMLElement;

      if (dashElement) {
        dashElement.style.transform = `rotate(${rotationAngle}deg) translateY(var(--dim-dash-offset))`;

        if (i % 5 === 0) {
          dashElement.classList.add("numbers__dash--major");
        }

        container.appendChild(clone);
      }
    }

    function getClockAngles() {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      const secondsRotation = seconds * 6;
      const minutesRotation = minutes * 6 + seconds * 0.1;
      const twelveHour = hours % 12;
      const hoursRotation = twelveHour * 30 + minutes * 0.5;

      return {
        seconds: secondsRotation,
        minutes: minutesRotation,
        hours: hoursRotation,
      };
    }

    function updateClockHands() {
      const angles = getClockAngles();

      const secondHand = document.querySelector(".dial__second") as HTMLDivElement;
      const secondBack = document.querySelector(".dial__second-back") as HTMLDivElement;

      if (secondHand) {
        secondHand.style.transform = `rotate(${angles.seconds}deg)`;
      }
      if (secondBack) {
        secondBack.style.transform = `rotate(${angles.seconds + 180}deg)`;
      }

      const minuteHand = document.querySelector(".dial__hand--minute") as HTMLDivElement;
      if (minuteHand) {
        minuteHand.style.transform = `rotate(${angles.minutes - 1}deg)`;
      }

      const hourHand = document.querySelector(".dial__container--hours .dial__hand") as HTMLDivElement;
      if (hourHand) {
        hourHand.style.transform = `rotate(${angles.hours}deg)`;
      }
    }

    updateClockHands();
    const interval = setInterval(updateClockHands, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="clock-wrapper">
      <div className="clock">
        <div className="logo logo--ms">MS DIGI MARK</div>
        <div className="outer-rim"></div>
        <div className="outer-rim outer-rim--faint"></div>
        <div className="inner-rim"></div>
        <div className="numbers">
          <template id="dash-template">
            <span className="numbers__dash" style={{ transform: "rotate(0deg) translateY(var(--dim-dash-offset))" }}>
              <span>&nbsp;</span>
            </span>
          </template>
          <template id="hour-template">
            <div className="numbers__number" style={{ transform: "rotate(0deg) translateY(var(--dim-numerals-offset))" }}>
              <span></span>
            </div>
          </template>
        </div>

        <div className="dial">
          <div className="dial__container dial__container--seconds">
            <div className="dial__second" style={{ transform: "rotate(220deg)" }}></div>
            <div className="dial__second-back" style={{ transform: "rotate(40deg)" }}></div>
          </div>

          <div className="dial__container dial__container--minutes">
            <div className="dial__hand dial__hand--minute" style={{ transform: "rotate(40deg)" }}></div>
          </div>
          <div className="dial__container dial__container--hours">
            <div className="dial__hand" style={{ transform: "rotate(-40deg)" }}></div>
          </div>
          <div className="dial__center"></div>
        </div>
      </div>

      <style>{`
        :root {
          --color-bg-top-left: #474447;
          --color-bg-bottom-right: #0E0E0E;
          --color-shadow: #080606;
          --color-numerals: #CFD8DF;
          --color-dial-base: #060201;
          --color-dial-highlight: #D3DADE;
          --dim-max-width: 150px;
          --dim-min-width: 100px;
          --font-size-numerals: min(5vw, 10px);
          --dim-clock-size: clamp(var(--dim-min-width), 25vw, var(--dim-max-width));
          --dim-numerals-offset: calc(var(--dim-clock-size) * -0.415);
          --dim-dash-offset: calc(var(--dim-clock-size) * -0.462);
          --dim-dash-size: calc(var(--dim-clock-size) * 0.023);
          --dim-center-size: calc(var(--dim-clock-size) * 0.048);
          --dim-dash-width: calc(var(--dim-dash-size) * 0.2);
          --dim-hour-hand-height: calc(var(--dim-clock-size) * 0.28);
          --dim-hour-hand-width: calc(var(--dim-hour-hand-height) * 0.07);
          --dim-minute-hand-height: calc(var(--dim-clock-size) * 0.37);
          --dim-minute-hand-width: calc(var(--dim-minute-hand-height) * 0.04);
          --dim-second-hand-height: calc(var(--dim-clock-size) * 0.48);
          --dim-second-hand-width: calc(var(--dim-second-hand-height) * 0.02);
          --dim-inner-rim-size: 76%;
        }

        .clock-wrapper {
          width: 100%;
          height: auto;
        }

        .clock {
          position: relative;
          aspect-ratio: 1;
          width: var(--dim-clock-size);
          margin: 0 auto;
          border-radius: 50%;
          background-image: linear-gradient(to bottom right, var(--color-bg-top-left), var(--color-bg-bottom-right) 60%);
          border: 2px solid var(--color-bg-bottom-right);
          box-shadow: inset 1px 1px 1px 0px rgba(255, 255, 255, 0.25);
          overflow: hidden;
        }

        .outer-rim {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          margin: auto;
          width: 97%;
          aspect-ratio: 1;
          border-radius: 50%;
          background-color: transparent;
          box-shadow: inset 3px 3px 24px 16px var(--color-shadow);
        }

        .outer-rim--faint {
          z-index: 4;
          opacity: 0.66;
          width: 97.5%;
          box-shadow: inset -1px -1px 1px 0px rgba(255, 255, 255, 0.2), inset 3px 3px 24px 16px var(--color-shadow);
        }

        .inner-rim {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: var(--dim-inner-rim-size);
          aspect-ratio: 1;
          margin: auto;
          border-radius: 50%;
          box-shadow: inset 3px 3px 12px var(--color-shadow), inset -2px -2px 3px 0px rgba(255, 255, 255, 0.08), -1px -1px 2px 0 var(--color-shadow);
        }

        .numbers {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 0;
          height: 0;
          margin: auto;
          overflow: visible;
          font-family: Helvetica, Arial, sans-serif;
        }

        .numbers__number {
          color: var(--color-numerals);
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 0;
          height: 0;
          overflow: visible;
          font-size: var(--font-size-numerals);
          text-shadow: 0 0 1px var(--color-numerals);
        }

        .numbers__dash {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 0;
          height: 0;
          overflow: visible;
        }

        .numbers__dash span {
          display: block;
          width: var(--dim-dash-width);
          height: var(--dim-dash-size);
          background-color: var(--color-numerals);
          border-radius: 1px;
          flex: 1;
          color: transparent;
        }

        .dial {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: visible;
          width: 2px;
          height: 2px;
          margin: auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dial__hand {
          position: absolute;
          width: var(--dim-hour-hand-width);
          height: var(--dim-hour-hand-height);
          transform-origin: 50% 100%;
          bottom: 0;
          left: 0;
          border-radius: 3px;
          background-image: linear-gradient(to top, var(--color-dial-base), var(--color-dial-base) 40%, var(--color-dial-highlight) 40.5%);
          box-shadow: 2px 2px 12px rgba(0, 0, 0, 0.4);
        }

        .dial__container {
          position: absolute;
          inset: 0;
        }

        .dial__container--seconds {
          animation-duration: 60s;
          animation-name: rotation;
          animation-iteration-count: infinite;
          animation-timing-function: steps(480, end);
          z-index: 2;
        }

        .dial__container--minutes {
          animation-duration: 3600s;
          animation-name: rotation;
          animation-iteration-count: infinite;
          animation-timing-function: linear;
          z-index: 1;
        }

        .dial__container--hours {
          animation-duration: 43200s;
          animation-name: rotation;
          animation-iteration-count: infinite;
          animation-timing-function: linear;
          z-index: 1;
        }

        @keyframes rotation {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .dial__hand--minute {
          width: var(--dim-minute-hand-width);
          height: var(--dim-minute-hand-height);
          box-shadow: 2px 2px 8px rgba(0, 0, 0, 1);
        }

        .dial__second {
          position: absolute;
          width: var(--dim-second-hand-width);
          height: var(--dim-second-hand-height);
          transform-origin: 50% 100%;
          bottom: 0;
          left: calc(var(--dim-second-hand-width) / -2);
          z-index: 2;
        }

        .dial__second::after {
          content: '';
          position: absolute;
          inset: 0;
          clip-path: polygon(0 100%, 100% 100%, 80% 0, 20% 0);
          border-radius: 12px 12px 4px 4px;
          background-image: linear-gradient(to top, #2D7287, #2D7287 10%, #F56F4F 10%, #F56F4F 40%, #EF852B 40%, #EF852B 60%, #E3BAAF 60%, #E3BAAF 76%, #9ECBAF 76%);
        }

        .dial__second::before {
          content: '';
          position: absolute;
          inset: 0;
          background-color: black;
          opacity: 0.4;
          filter: blur(3px);
        }

        .dial__second-back {
          position: absolute;
          width: calc(var(--dim-second-hand-width) * 3);
          height: calc(var(--dim-second-hand-height) * 0.23);
          border-radius: 10px;
          bottom: 0;
          left: calc(var(--dim-second-hand-width) * -1.5);
          z-index: 2;
          transform-origin: 50% 100%;
          background-image: linear-gradient(to top, #2D7287, #2D7287 40%, #148BA5 40%);
        }

        .dial__center {
          width: var(--dim-center-size);
          height: var(--dim-center-size);
          border-radius: 50%;
          position: absolute;
          background-color: #2D7287;
          z-index: 3;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 6px;
          font-weight: bold;
          color: white;
          text-align: center;
          padding: 2px;
          line-height: 1;
        }

        .dial__center::before {
          position: absolute;
          inset: 20%;
          aspect-ratio: 1;
          background-color: #366269;
          content: '';
          border-radius: 50%;
          box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.66);
        }

        .dial__center::after {
          position: absolute;
          inset: calc(20% + 1px);
          aspect-ratio: 1;
          background-color: #366269;
          content: '';
          border-radius: 50%;
          box-shadow: inset 1px 1px 0px 0px rgba(255, 255, 255, 0.12);
        }

        .logo {
          position: absolute;
          width: 100%;
          height: auto;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 5;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 6px;
          font-weight: bold;
          color: #CFD8DF;
          text-align: center;
          text-shadow: 0 0 1px #CFD8DF;
        }

        .logo--ms {
          width: 80%;
          padding: 4px;
          font-size: 5px;
          line-height: 1.2;
          letter-spacing: -0.5px;
        }
      `}</style>
    </div>
  );
};
