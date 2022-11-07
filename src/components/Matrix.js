import React, {useState, useEffect} from 'react'
import styled from 'styled-components'
import rightOff from '../images/rightOff.png'
import leftOff from '../images/leftOff.png'
import right from '../images/right.png'
import left from '../images/left.png'
// import RNBO from '@rnbo/js'

function Matrix(props) {
  const {modules, context, rnbo} = props

  

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
            return (<Cell context={context} key={key}>{m.name}</Cell>) 
        } else if(i===0 && index!==0){
            return <Cell context={context} key={key}/>
        } else {
            return (<Send rnbo={rnbo} context={context} key={key} direction={i<index ? 'right' : 'left'} from={m} to={mod}/>)
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
  const {direction, from, to, context, rnbo} = props
  const [enabled, setEnabled] = useState(false)
  const [level, setLevel] = useState(0.)
  const [sendDevice, setSendDevice] = useState(null)

  useEffect(()=>{
    const getDev = async () => {
      if(enabled){
        let dev = await from.sendTo(to)
        console.log('dev ', dev)
        setSendDevice(dev.device)
        //may need to add await
      }
    }
    getDev()
  }, [enabled])

  // useEffect(()=>{
  //     console.log('sendDevice: ', sendDevice)
  // }, [sendDevice])

  const slide = (e) => {
    let val = (direction=="right" ? e.target.value / 100.0 : 1.0 - e.target.value / 100.0)
    if(!enabled){
      setEnabled(true)
    } else {
      if(sendDevice!=null){
        const setVal = new rnbo.MessageEvent(rnbo.TimeNow, "in2", [ val ]);
        sendDevice.scheduleEvent(setVal);
      }
    }
  }

  return (
    <Cell>
      <SendSlider enabled={enabled} type='range' direction={direction} onChange={slide}/>
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