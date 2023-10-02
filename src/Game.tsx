/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react'
import useTimer from './useTimer' 
import db from './db.json'

const question_mark =
  "https://gallery.yopriceville.com/var/albums/Free-Clipart-Pictures/Arrows-PNG/Question_Mark_Red_PNG_Transparent_Clipart.png?m=1652673278"



function useDelayedEffect(effect: Function, changingStateVars: any[] = [], delay = 500) {
  const mutable = React.useRef<any>();

  const delayedEffect = () => {
    mutable.current = setTimeout(effect, delay);
    return () => {
      clearTimeout(mutable.current);
    };
  };

  React.useEffect(delayedEffect, changingStateVars);
}

const pickRandom = (array: string[], n: number) =>  array.sort(() => Math.random() - Math.random()).slice(0, n)

export default function Game() {
  const [randomImages, setRandomImages] = React.useState<string[]>([]);
  const [clicks, setClicks] = React.useState<number>(0);
  const [opened, setOpened] = React.useState<{[k: string]: boolean}>({});
  const [solved, setSolved] = React.useState<{[k: string]: boolean}>({});
  const {ellapsedSeconds, seconds, minutes, hours, handleStart, handleReset} = useTimer()
  const [gameOn, setGameOn] = React.useState(false)
  const [showing, setShowing] = React.useState(false)
  const [gameSize, setGameSize] = React.useState(4)
  const [gameType, setGameType]  = React.useState<'fish' | 'birds' | 'beetles' | 'flowers'>('birds')

  const isCompleted = React.useMemo(() => {
    return Object.keys(solved).length === gameSize * gameSize
  }, [gameSize, solved])

  const handleCardClick = (e: any) => {
    if(!gameOn || showing) return
    setClicks((c) => c + 1);
    setShowing(true)
    const index = +e.currentTarget?.getAttribute("data-index");
    setOpened((op) => ({ ...op, ...{ [index]: true } }));
  };

  useDelayedEffect(
    () => {
      if (Object.values(opened).length === 2) {
        const sources = Object.keys(opened).map((idx: any) => randomImages[idx]);
        if (Array.from(new Set(sources)).length === 1) {
          setSolved((s) => ({ ...s, ...opened }));
        }
        setOpened({});
      }
      setShowing(false)
    },
    [opened, randomImages],
    500
  );

  React.useEffect(() => {
    if(gameOn) {
        setSolved({})
        setOpened({})
        setClicks(0)
        const images: string[] = db[gameType]
        const randomPicks = pickRandom(images, gameSize * gameSize / 2)
        setRandomImages(
            [...randomPicks, ...randomPicks].sort(() => (Math.random() > 0.5 ? 1 : -1))
        );
        if(ellapsedSeconds > 0) handleReset()
        handleStart() // start
    }
  }, [gameOn]);

  React.useEffect(() => {
    if(!isCompleted) return
    setGameOn(false)
    handleStart()
  }, [isCompleted])

  return (
    <div className='game-container' >
      {isCompleted && <div>
        <div className='fs-32 fc-red fw-7 mb-20'>CONGRATS!</div>
        <div className='fc-white mb-20'>You completed game in {hours} hours {minutes} minutes and {seconds} seconds using {clicks} clicks</div>
      </div>}
      {!gameOn && <form onSubmit={(e) => setGameOn(true)}>
        <select onChange={(e: any) => setGameSize(e.target.value)}>
            {[4, 6, 8, 10, 12, 14].map(num => <option  key={num} value={num}>{num}x{num}</option>)}
        </select>
        <select value={gameType} onChange={(e: any) => setGameType(e.target.value)}>
            {Object.keys(db).map(type => <option  value={type} key={type}>{type}</option>)}
        </select>
        <button type="submit">
            {isCompleted ? 'Play again' : 'Start'}
        </button>
    </form>}
      {gameOn && <div className='flex fd-col ai-center'>
        <div className="game grid" style={{'--row-size': gameSize, '--col-size': gameSize} as React.CSSProperties}>
        <div className='flex justify-between mb-20 w-100 game-stats'>
            <span>Clicks: {clicks}</span>
            <span>{hours}:{minutes}:{seconds}</span>
        </div>
        {randomImages.length &&
          randomImages.map((src, idx) => (
            <div
              key={idx}
              className={`card ${opened[idx] || solved[idx] ? "flipped" : ""}`}
              data-src={src}
              data-index={idx}
              onClick={handleCardClick}
            >
              <div
                style={{ backgroundImage: `url('${question_mark}')` }}
                className="front"
              ></div>
              <div
                style={{ backgroundImage: `url('${src}')` }}
                className="back"
              ></div>
            </div>
          ))}
      </div></div>}
    </div>
  );
}
