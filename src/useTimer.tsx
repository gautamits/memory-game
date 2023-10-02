import { useEffect, useMemo,  useState } from "react";
export default function useTimer() {
    const [counter, setCounter] = useState(0);
    const [counterOn, setCounterOn] = useState(false);
    
    const handleStart = (e?: any) => {
      setCounterOn((t) => !t);
    };
  
    const [hours, minutes, seconds] = useMemo(() => {
      return [
        Math.floor((counter / 10) / 3600),
        Math.floor((counter / 10) / 60),
        Math.floor((counter / 10) % 60)
      ]
    }, [counter]);
  
    const handleReset = (e?: any) => {
      setCounterOn(false);
      setCounter(0);
    };
  
    useEffect(() => {
      let t: any
      if (counterOn) {
        t = setInterval(() => {
          setCounter((counter) => counter + 1);
        }, 100);
      }
      return () => clearInterval(t);
    }, [counterOn]);

    return {
        ellapsedSeconds: counter / 10,
        seconds,
        minutes,
        hours,
        handleStart,
        handleReset
    }
  }