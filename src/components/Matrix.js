import React, {useState, useEffect} from 'react'
import styled from 'styled-components'
import rightOff from '../images/rightOff.png'
import leftOff from '../images/leftOff.png'
import right from '../images/right.png'
import left from '../images/left.png'

function Matrix(props) {
  const {modules} = props

  

  const renderModules = () => {
    console.log('numMOds: ', modules.length)
    return modules.map((m, i)=>{
      return (
        <tr key={i} id={i}>
            {renderRow(m, i)}
        </tr>
      )
    })
  }

  const renderRow = (mod, index) => {
    return modules.map((m, i)=>{
      let key = index + ", " + i
        if(i===index){
            return (<Cell key={key}>{m.name}</Cell>) 
        } else if(i===0 && index!==0){
            return <Cell key={key}/>
        } else {
            return (<Send key={key} direction={i<index ? 'right' : 'left'} from={m} to={mod}/>)
        }
    })
  }

  return (
    <Grid>
      <tbody>
        {modules.length>0 && renderModules()}
      </tbody>
    </Grid>
  )
}

export default Matrix

export const Send = (props) => {
  const {direction, from, to} = props
  const [enabled, setEnabled] = useState(false)
  const [level, setLevel] = useState(0.)
  const [sendParam, setSendParam] = useState(null)

  // useEffect(()=>{
  //   if(enabled && !sendParam){
  //     setSendParam(audio.addSend(from, to))
  //   }
  // }, [enabled])

  const slide = (e) => {
    if(!enabled){
      setEnabled(true)
    }
    setLevel(e.target.value)
    if(sendParam){
      sendParam.toneObject.gain.value = e.target.value / 100.
      // console.log('send set to:', sendParam.toneObject.gain.value )
    }
  }

  return (
    <Cell>
      <SendSlider enabled={enabled} type='range' direction={direction} onChange={slide} value={level}/>
    </Cell> //{direction==="left" ? "<" : ">"}
  )
}

export const Grid = styled.table`
  border: 1px solid black;
`
export const Cell = styled.td`
  border: 1px solid black;
  width: 50px;
`
export const SendSlider = styled.input`
    -webkit-appearance: none;
    background-color: ${props => props.enabled ? '#abd5ff' : 'silver'};
    &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 23px;
        height: 30px;
        border: 0;
        background: url(${props => props.direction==='right' ? (props.enabled ? right : rightOff) : (props.enabled ? left : leftOff)});
        cursor: pointer;
    }
`