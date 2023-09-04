import { useState } from 'react';
import './App.css';
import { toggleLoc } from './background';
import useResize from './useResize';
import sample from 'lodash/sample';
import NoSleep from 'nosleep.js';

const d6 = [1,2,3,4,5,6];
const whRatioVilage = 1.0714285714285714;
const whRatioDungeon = 0.9523809523809523;
const nosleep = new NoSleep();
const initialStats = {
  rolls: [],
  village: 0,
  dungeon: 0,
};

function roll() {
  return sample(d6);
}
toggleLoc('dungeon', true);
document.addEventListener("dblclick", (e) => {
  e.stopPropagation();
  e.preventDefault();
  try {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      return;
    } else {
      document.documentElement.requestFullscreen();
      return;
    }
  } catch (error) {
    console.log('error', error);
  }
});

function App() {
  const [loc, setLoc] = useState(null);
  const [turn, setTurn] = useState(0);
  const [lastTurn, setLastTurn] = useState(false);
  const [lastTurnReady, setLastTurnReady] = useState(false);
  const [stats, setStats] = useState({...initialStats});
  const [removedCard, setRemovedCard] = useState(null);
  const [mat, setMat] = useState(false);
  const { width, height } = useResize();
  const [rollResultTxt, setRollResultTxt] = useState('');
  console.log('width', width, 'height', height);
  const fontSize = Math.round(height / 15);
  const padding = Math.round(height / 50);
  let landscape = false;
  if (width > height) {
    landscape = true;
  }

  let wBoard;
  let hBoard;
  let cardSize;
  

  if (loc === 'village') {
    if (landscape) {
      hBoard = Math.round(height * 0.95);
      wBoard = Math.round(hBoard * whRatioVilage);
    } else {
      wBoard = Math.round(width * 0.95);
      hBoard = Math.round(wBoard / whRatioVilage);
    }
    cardSize = Math.round(wBoard / 6);
    if (mat) {
      cardSize = Math.round(wBoard / 7);
    }
  } else if (loc === 'dungeon') {
    if (landscape) {
      hBoard = Math.round(height * 0.95);
      wBoard = Math.round(hBoard * whRatioDungeon);
    } else {
      wBoard = Math.round(width * 0.95);
      hBoard = Math.round(wBoard / whRatioDungeon);
    }
    cardSize = Math.round(wBoard / 4);
  } else {
    if (landscape) {
      hBoard = Math.round(height * 0.97);
      wBoard = hBoard;
    } else {
      wBoard = Math.round(width * 0.97);
      hBoard = wBoard;
    }
  }

  const Card = (props) => {
    const {
      name,
      selected,
    } = props;
    const margin = cardSize * 0.06;
    const radius = cardSize * 0.05;
    const shadow = cardSize * 0.03;
    const fontSize = cardSize * 0.25;
    const style = {
      display: 'flex',
      alignItems: 'center',
      alignContent: 'center',
      justifyContent: 'center',
      width: `${cardSize - (margin * 2)}px`,
      height: `${(cardSize * 1.4) - (margin * 2)}px`,
      margin: `${margin}px`,
      filter: `drop-shadow(${shadow}px ${shadow}px ${shadow}px #333)`,
      borderRadius: `${radius}px`,
    };

    const textShadow = cardSize * 0.015;
    const textStyle = {
      transform: 'rotate(-45deg)',
      // fontWeight: 'bold',
      fontSize: `${fontSize}px`,
      WebkitTextStroke: `${cardSize * 0.002}px white`,
      filter: `drop-shadow(${textShadow}px ${textShadow}px ${textShadow}px black)`,
    };

    if (name === 'weapon') {
      textStyle.color = '#A0522D';
    } else if (name === 'spell') {
      textStyle.color = 'purple';
    } else if (name === 'item') {
      textStyle.color = 'green';
    } else if (name === 'hero') {
      textStyle.color = 'blue';
    } else if (name === 'monster') {
      textStyle.color = '#800';
    }
  
    return (
      <div
        style={style}
        className='card'
      >
        <span style={textStyle}>{name}</span>
        {selected ? (
          <img
            src="/redx.png"
            alt="X"
            style={{
              position: 'absolute',
              width: `${cardSize * 0.95}px`,
              height: `${cardSize * 0.95}px`,
            }}
          />
        ) : ''}
      </div>
    )
  };

  const takePhantomTurn = (e, last = false) => {
    console.log('takePhantomTurn', last);
    if (last) {
      setLastTurn(true);
    }
    if (turn === 0) {
      nosleep.enable();
    }
    setTurn(turn + 1);
    const r1 = last ? 6 : roll();
    const r2 = roll();
    const r3 = roll();
    let locChanged = false;
    console.log('rolls', r1, r2, r3);
    let removed;
    let newLoc;
    if (r1 > 3) {
      stats.dungeon++;
      setStats({...stats});
      if (stats.dungeon > 3) {
        setLastTurnReady(true);
      }
      locChanged = (loc === null) || (loc === 'village');
      newLoc = 'dungeon';
      const left = (r2 < 4); // left side of dungeon
      if (locChanged) {
        if (r3 < 4) {
          removed = left ? 1 : 2;
        } else if (r3 === 4 || r3 === 5) {
          removed = left ? 3 : 4;
        } else {
          removed = left ? 5 : 6;
        }
      } else { // more likely to delve deeper if stayed in dungeon
        if (r3 < 3) {
          removed = left ? 1 : 2;
        } else if (r3 === 3 || r3 === 4) {
          removed = left ? 3 : 4;
        } else {
          removed = left ? 5 : 6;
        }
      }
    } else {
      stats.village++;
      setStats({...stats});
      locChanged = (loc === null) || (loc ===  'dungeon');
      newLoc = 'village';
      if (r2 < 4) {
        removed = r3;
      } else {
        removed = r3 + 6;
      }
    }
    stats.rolls.push({ vals: [r1, r2, r3], loc: newLoc, removed });
    setLoc(newLoc);
    toggleLoc(newLoc);
    if (last) {
      document.body.style.backgroundColor = 'purple';
      toggleLoc(newLoc, true);
    } else {
      toggleLoc(newLoc);
    }
    setRemovedCard(removed);
    console.log('stats', stats);
    setRollResultTxt(`${locChanged ? 'went to' : 'stayed in'} the`);
  };

  const textShadow = hBoard * 0.002;
  const textShadowColor = loc === 'village' ? 'black' : '#800';
  const textActionStyle = {
    color: 'white',
    fontSize: `${hBoard * 0.08}px`,
    WebkitTextStroke: `${hBoard * 0.001}px black`,
    fontFamily: 'Bree Serif',
    margin: `${hBoard * 0.005}px`,
    filter: `drop-shadow(${textShadow}px ${textShadow}px ${textShadow}px ${textShadowColor})`,
  }

  window.takePhantomTurn = takePhantomTurn;

  const TakeTurnButton = (props) => {
    const { label } = props;
    const shadow = hBoard * 0.01;
    const btnFont = (mat && (loc === 'village')) ? 0.06: 0.08;
    return (
      <button
        onClick={takePhantomTurn}
        style={{
          fontSize: `${hBoard * btnFont}px`,
          padding: `${hBoard * 0.01}px`,
          filter: `drop-shadow(${shadow}px ${shadow}px ${shadow}px #333)`,
        }}
      >
        {label || 'Next Turn'}
      </button>
    );
  };

  const LastTurnButton = () => {
    const shadow = hBoard * 0.01;
    const btnFont = (mat && (loc === 'village')) ? 0.04: 0.06;
    return (
      <button
        onClick={(e) => {
          takePhantomTurn(e, true);
          setLastTurn(true);
        }}
        style={{
          fontSize: `${hBoard * btnFont}px`,
          padding: `${hBoard * 0.01}px`,
          filter: `drop-shadow(${shadow}px ${shadow}px ${shadow}px #333)`,
          backgroundColor: '#800',
          color: 'white',
        }}
      >
        Take Last Turn
      </button>
    );
  };

  const RestartButton = () => {
    const shadow = hBoard * 0.01;
    const btnFont = (mat && (loc === 'village')) ? 0.04: 0.06;
    return (
      <button
        onClick={(e) => {
          setStats({...initialStats});
          setTurn(0);
          setLastTurn(false);
          setLastTurnReady(false);
          setLoc(null);
          setRemovedCard(null);
        }}
        style={{
          fontSize: `${hBoard * btnFont}px`,
          padding: `${hBoard * 0.01}px`,
          filter: `drop-shadow(${shadow}px ${shadow}px ${shadow}px #333)`,
        }}
      >
        Start Over
      </button>
    );
  };


  return (
    <div
      className='centerContent'
      style={{
        width: `${wBoard}px`,
        height: `${hBoard}px`,
      }}
    >
      {turn ? (
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
          }}
        >
          {(loc === 'village') && mat ? (
            <div className={'villageCards'}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex' }}>
                  <Card
                    name={'market'}
                    size={cardSize}
                    selected={removedCard === 1}
                  />
                  <Card
                    name={'market'}
                    size={cardSize}
                    selected={removedCard === 2}
                  />
                  <Card
                    name={'market'}
                    size={cardSize}
                    selected={removedCard === 3}
                  />
                  <Card
                    name={'market'}
                    size={cardSize}
                    selected={removedCard === 4}
                  />
                </div>
                <div style={{ display: 'flex' }}>
                  <Card
                    name={'market'}
                    size={cardSize}
                    selected={removedCard === 5}
                  />
                  <Card
                    name={'market'}
                    size={cardSize}
                    selected={removedCard === 6}
                  />
                  <Card
                    name={'market'}
                    size={cardSize}
                    selected={removedCard === 7}
                  />
                  <Card
                    name={'market'}
                    size={cardSize}
                    selected={removedCard === 8}
                  />
                </div>
                <div style={{ display: 'flex' }}>
                  <Card
                    name={'hero'}
                    size={cardSize}
                    selected={removedCard === 9}
                  />
                  <Card
                    name={'hero'}
                    size={cardSize}
                    selected={removedCard === 10}
                  />
                  <Card
                    name={'hero'}
                    size={cardSize}
                    selected={removedCard === 11}
                  />
                  <Card
                    name={'hero'}
                    size={cardSize}
                    selected={removedCard === 12}
                  />
                </div>
                <div
                  className='centerContent'
                  style={{
                    height: '20%',
                  }}
                >
                  <TakeTurnButton/>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {(lastTurnReady && !lastTurn) ? (
                  <div
                    className='centerContent'
                    style={{
                      ...textActionStyle,
                      height: '10%',
                    }}
                  >
                    <LastTurnButton/>
                  </div>
                ) : ''}
                <div
                  className='centerContent'
                  style={{
                    ...textActionStyle,
                    height: '50%',
                  }}
                >
                  Phantom Player {rollResultTxt} {loc}
                </div>
              </div>
            </div>
          ) : ''}
          {(loc === 'village') && !mat ? (
            <div className={'villageCards'}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex' }}>
                  <Card
                    name={'weapon'}
                    size={cardSize}
                    selected={removedCard === 1}
                  />
                  <Card
                    name={'spell'}
                    size={cardSize}
                    selected={removedCard === 2}
                  />
                </div>
                <div style={{ display: 'flex' }}>
                  <Card
                    name={'weapon'}
                    size={cardSize}
                    selected={removedCard === 3}
                  />
                  <Card
                    name={'spell'}
                    size={cardSize}
                    selected={removedCard === 4}
                  />
                </div>
                <div style={{ display: 'flex' }}>
                  <Card
                    name={'any'}
                    size={cardSize}
                    selected={removedCard === 5}
                  />
                  <Card
                    name={'any'}
                    size={cardSize}
                    selected={removedCard === 6}
                  />
                </div>
                <div style={{ display: 'flex' }}>
                  <Card
                    name={'item'}
                    size={cardSize}
                    selected={removedCard === 7}
                  />
                  <Card
                    name={'item'}
                    size={cardSize}
                    selected={removedCard === 8}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div
                  className='centerContent'
                  style={{
                    ...textActionStyle,
                    height: '50%',
                  }}
                >
                  Phantom Player {rollResultTxt} {loc}
                </div>
                <div style={{ display: 'flex' }}>
                  <Card
                    name={'hero'}
                    size={cardSize}
                    selected={removedCard === 9}
                  />
                  <Card
                    name={'hero'}
                    size={cardSize}
                    selected={removedCard === 10}
                  />
                  <Card
                    name={'hero'}
                    size={cardSize}
                    selected={removedCard === 11}
                  />
                  <Card
                    name={'hero'}
                    size={cardSize}
                    selected={removedCard === 12}
                  />
                </div>
                <div
                  className='centerContent'
                  style={{
                    height: '50%',
                  }}
                >
                  <div className='centerContent'><TakeTurnButton/></div>
                </div>
              </div>
            </div>
          ) : ''}
          { loc === 'dungeon' ? (
            <div className={'dungeonCards'}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {(lastTurnReady && !lastTurn) ? (
                  <div
                    className='centerContent'
                    style={{
                      ...textActionStyle,
                      height: '10%',
                    }}
                  >
                    <LastTurnButton/>
                  </div>
                ) : ''}
                <div
                  className='centerContent'
                  style={{
                    ...textActionStyle,
                    height: '40%',
                  }}
                >
                  Phantom Player {rollResultTxt} {loc}
                </div>
                {lastTurn ? (
                  <div
                    className='centerContent'
                    style={{
                      ...textActionStyle,
                      height: '40%',
                      fontSize: `${hBoard * 0.04}px`,
                    }}
                  >
                    {stats.dungeon} turns in the dungeon<br/>
                    {stats.village} turns in the village
                  </div>
                ) : ''}
                <div
                  className='centerContent'
                  style={{
                    height: '40%',
                  }}
                >
                  {!lastTurn ? (
                    <TakeTurnButton/>
                  ) : (
                    <RestartButton/>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex' }}>
                  <Card
                    name={'monster'}
                    size={cardSize}
                    selected={removedCard === 1}
                  />
                  <Card
                    name={'monster'}
                    size={cardSize}
                    selected={removedCard === 2}
                  />
                </div>
                <div style={{ display: 'flex' }}>
                  <Card
                    name={'monster'}
                    size={cardSize}
                    selected={removedCard === 3}
                  />
                  <Card
                    name={'monster'}
                    size={cardSize}
                    selected={removedCard === 4}
                  />
                </div>
                <div style={{ display: 'flex' }}>
                  <Card
                    name={'monster'}
                    size={cardSize}
                    selected={removedCard === 5}
                  />
                  <Card
                    name={'monster'}
                    size={cardSize}
                    selected={removedCard === 6}
                  />
                </div>
              </div>
            </div>
          ) : ''}
          <div style={{
            color: 'white',
            position: 'absolute',
            bottom: '0px',
            left: '0px',
            margin: `${padding}px`,
            fontSize: `${hBoard * 0.04}px`,
            WebkitTextStroke: `${hBoard * 0.001}px black`,
          }}>
            Turn {turn}
          </div>
        </div>
      ) : (
        <div className='centerContent'>
          <div
            className='centerContent'
            style={{
              height: '50%',
            }}
          >
            <img
              src="/tslogo.png"
              alt="Thunderstone Quest"
              style={{
                width: '90%',
              }}
            />
          </div>
          <div
            style={{
              color: 'white',
              fontSize: `${fontSize}px`,
              marginBottom: `${padding}px`,
              height: '20%'
            }}
          >
            Solo Bot
          </div>
          <div
            className='centerContent'
            style={{
              height: '50%',
              maxHeight: '50%',
              flexDirection: 'row',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                margin: `${hBoard * 0.01}px`,
                alignItems: 'center',
              }}
            >
              <img
                src="/mat.png"
                alt="mat"
                style={{
                  height: `${hBoard * 0.2}px`,
                  width: `${hBoard * 0.2}px`,
                  margin: `${hBoard * 0.01}px`
                }}
              />
              <button
                onClick={() => {
                  setMat(true);
                  takePhantomTurn();
                }}
                style={{
                  fontSize: `${hBoard * 0.05}px`,
                  padding: `${hBoard * 0.01}px`,
                }}
              >
                Start with Mat
              </button>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                margin: `${hBoard * 0.01}px`,
                alignItems: 'center',
              }}
            >
              <img
                src="/board.png"
                alt="board"
                style={{
                  height: `${hBoard * 0.2}px`,
                  width: `${hBoard * 0.2}px`,
                  filter: `drop-shadow(${hBoard * 0.02}px ${hBoard * 0.02}px ${hBoard * 0.02}px #333)`,
                  margin: `${hBoard * 0.01}px`
                }}
              />
              <button
                onClick={() => {
                  setMat(false);
                  takePhantomTurn();
                }}
                style={{
                  fontSize: `${hBoard * 0.05}px`,
                  padding: `${hBoard * 0.01}px`,
                  filter: `drop-shadow(${hBoard * 0.02}px ${hBoard * 0.02}px ${hBoard * 0.02}px #333)`,
                }}
              >
                Start with Board
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
