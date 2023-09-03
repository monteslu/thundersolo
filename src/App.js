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

function roll() {
  return sample(d6);
}
toggleLoc('dungeon', true);
let fs = false;
document.addEventListener("dblclick", (e) => {
  e.stopPropagation();
  e.preventDefault();
  if (fs) {
    document.exitFullscreen();
    fs = false;
  } else {
    document.documentElement.requestFullscreen();
    fs = true;
  }
});

function App() {
  const [loc, setLoc] = useState(null);
  const [turn, setTurn] = useState(0);
  const [removedCard, setRemovedCard] = useState(null);
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
      hBoard = Math.round(height * 0.97);
      wBoard = Math.round(hBoard * whRatioVilage);
    } else {
      wBoard = Math.round(width * 0.97);
      hBoard = Math.round(wBoard / whRatioVilage);
    }
    cardSize = Math.round(wBoard / 6);
  } else if (loc === 'dungeon') {
    if (landscape) {
      hBoard = Math.round(height * 0.97);
      wBoard = Math.round(hBoard * whRatioDungeon);
    } else {
      wBoard = Math.round(width * 0.97);
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

  const takePhantomTurn = () => {
    if (turn === 0) {
      nosleep.enable();
    }
    setTurn(turn + 1);
    const r1 = roll();
    const r2 = roll();
    const r3 = roll();
    let locChanged = false;
    console.log('rolls', r1, r2, r3);
    if (r1 > 3) {
      locChanged = (loc === null) || (loc === 'village');
      setLoc('dungeon');
      toggleLoc('dungeon');
      const left = (r2 < 4); // left side of dungeon
      if (locChanged) {
        if (r3 < 4) {
          setRemovedCard(left ? 1 : 2);
        } else if (r3 === 4 || r3 === 5) {
          setRemovedCard(left ? 3 : 4);
        } else {
          setRemovedCard(left ? 5 : 6);
        }
      } else { // more likely to delve deeper if stayed in dungeon
        if (r3 < 3) {
          setRemovedCard(left ? 1 : 2);
        } else if (r3 === 3 || r3 === 4) {
          setRemovedCard(left ? 3 : 4);
        } else {
          setRemovedCard(left ? 5 : 6);
        }
      }
    } else {
      locChanged = (loc === null) || (loc ===  'dungeon');
      setLoc('village');
      toggleLoc('village');
      if (r2 < 4) {
        setRemovedCard(r3)
      } else {
        setRemovedCard(r3 + 6);
      }
    }
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
    return (
      <button
        onClick={takePhantomTurn}
        style={{
          fontSize: `${hBoard * 0.08}px`,
          padding: `${hBoard * 0.01}px`,
          filter: `drop-shadow(${shadow}px ${shadow}px ${shadow}px #333)`,
        }}
      >
        {label || 'Next Turn'}
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
          {loc === 'village' ? (
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
          ) : (
            <div className={'dungeonCards'}>
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
                <div
                  className='centerContent'
                  style={{
                    height: '50%',
                  }}
                >
                  <TakeTurnButton/>
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
          )}
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
          <div className='centerContent'>
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
            }}
          >
            Solo Bot
          </div>
          <div className='centerContent'>
            <TakeTurnButton label="start"/>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
