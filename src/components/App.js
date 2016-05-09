import React, { Component } from 'react'
import c from 'classnames'
import { Motion, spring } from 'react-motion'
import _ from 'lodash'
import Hammer from 'react-hammerjs'
import { isTouchDevice, swap, checkWin } from '../utils/appUtils'

import './app.scss'

const keys = [37, 38, 39, 40]
const [LEFT, UP, RIGHT, DOWN] = keys
const mapSwipeKeys = {2: LEFT, 8: UP, 4: RIGHT, 16: DOWN}
const springSetting = {stiffness: 800, damping: 15}

class App extends Component {

  constructor(props) {
    super(props)
    this.state = this.getGameState(props)
    this.rotateGame = this.rotateGame.bind(this)
    this.orientGame = this.orientGame.bind(this)
    this.moveTile = this.moveTile.bind(this)
    this.shuffle = this.shuffle.bind(this)
    this.changeTileNumber = this.changeTileNumber.bind(this)
    this.swipe = this.swipe.bind(this)
  }

  componentDidMount() {
    document.addEventListener('keydown', this.moveTile)
    document.addEventListener('mousemove', this.rotateGame)
    window.addEventListener('deviceorientation', this.orientGame)
  }

  orientGame(e) {
    this.gameTiles.style.transform =
      "rotateY(" + ( -e.gamma ) + "deg)" +
      "rotateX(" + (e.beta - 50) + "deg) ";
  }

  rotateGame(e) {
    const x = e.layerX || e.offsetX
    const y = e.layerY || e.offsetY

    const ax = -(window.innerWidth / 2 - x) / 35
    const ay = (window.innerHeight / 2 - y) / 25

    this.gameTiles.style.transform = `rotateY(${ax}deg) rotateX(${ay}deg)`
  }

  getGameState({ tileNumber, tileSize }) {
    const tileTotal = Math.pow(tileNumber, 2)
    return {
      tileSize,
      tileNumber,
      tileTotal,
      layout: _.range(tileTotal).map(n => {
        const row = Math.floor(n / tileNumber)
        const col = n % tileNumber
        return [tileSize * col, tileSize * row]
      }),
      order: _.range(1, tileTotal + 1),
      win: false,
      isTouch: isTouchDevice()
    }
  }

  shuffle() {
    this.recursiveShuffle(_.shuffle(keys), 1)
  }

  recursiveShuffle(shuffled, i) {
    let choice = _.take(shuffled, 3)
    _.forEach(choice, keyCode => this.moveTile({
      keyCode
    }))
    i < 100 && this.recursiveShuffle(_.shuffle(keys), i + 1)
  }

  changeTileNumber(e) {
    const { tileSize } = this.state
    const tileNumber = parseInt(e.currentTarget.value, 10)
    const newState = this.getGameState({tileNumber, tileSize})
    tileNumber > 1 && this.setState(newState)
  }

  swipe({ direction }) {
    const keyCode = mapSwipeKeys[direction]
    keyCode && this.moveTile({ keyCode })
  }

  moveTile({ keyCode }) {
    const { order, tileNumber, tileTotal } = this.state
    const emptyIndex = order.indexOf(tileTotal)

    let tileIndex = -1

    switch (keyCode) {
      case LEFT:
        (emptyIndex % tileNumber < (tileNumber - 1)) && (tileIndex = emptyIndex + 1)
        break
      case UP:
        tileIndex = emptyIndex + tileNumber
        break
      case RIGHT:
        (emptyIndex % tileNumber > 0) && (tileIndex = emptyIndex - 1)
        break
      case DOWN:
        tileIndex = emptyIndex - tileNumber
        break
    }

    if (tileIndex < 0 || tileIndex >= tileTotal) return

    const newOrder = swap(order, tileIndex, emptyIndex)
    const win = checkWin(newOrder)

    this.setState({
      order: newOrder,
      win
    })
  }

  getKeyPos(key) {
    const { order, layout } = this.state
    const pos = order.indexOf(key)
    return layout[pos]
  }

  render() {
    const { win, order, tileNumber, tileTotal, tileSize, isTouch } = this.state
    const gameClassName = c(
      'game__container', {
        'game__container--win': win
      }
    )

    return (
      <section className="game">
        <header className="game__actions">
          <button type="button" onClick={this.shuffle}>Reset</button>
          <label>
            Size:
            <input type="number"
                   size="2"
                   onChange={this.changeTileNumber}
                   onKeyDown={e => e.stopPropagation()}
                   defaultValue={tileNumber}/>
          </label>
        </header>

        {isTouch &&
        <Hammer onSwipe={this.swipe} vertical={true}>
          <div className="game__layer"></div>
        </Hammer>}

        <section className={gameClassName}>
          <div className="game__platform" ref={ref => this.gameTiles = ref}>
            <div className="game__tiles"
                 style={{width: tileSize * tileNumber, height: tileSize * tileNumber}}>
              {order.map(key => {
                const [x, y] = this.getKeyPos(key)
                const style = {
                  translateX: spring(x, springSetting),
                  translateY: spring(y, springSetting),
                }

                return (
                  <Motion key={key} style={style}>
                    {({translateX, translateY, display, width, height}) => (
                      <div className="game__tile"
                           style={{
                                display: key === tileTotal ? 'none' : 'block',
                                width: tileSize,
                                height: tileSize,
                                transform: `translate3d(${translateX}px, ${translateY}px, 0)`}}>
                        <div className="tile">
                          <span className="tile__text">{key}</span>
                        </div>
                      </div>
                    )}
                  </Motion>
                )
              })}
            </div>
            <div className="game__win">
              <span>YOU WIN</span>
            </div>
          </div>
        </section>
      </section>
    )
  }
}

App.defaultProps = {
  tileSize: 60,
  tileNumber: 4
}

export default App
