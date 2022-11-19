import React, {useState, useEffect} from 'react'
import styled from 'styled-components'
import rightOff from '../images/rightOff.png'
import leftOff from '../images/leftOff.png'
import right from '../images/right.png'
import left from '../images/left.png'
// import RNBO from '@rnbo/js'

function Matrix(props) {
  const {modules, context, rnbo, controlModules, ctlIO} = props

  

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
          if(m.type=="Op"){
            return (
              <Op context={context} key={key} module={m} rnbo={rnbo} controlModules={controlModules} ctlIO={ctlIO}>
                {m.name}
              </Op>)
          } 
          else {
            return (
              <Cell context={context} key={key}>
                {m.name}
              </Cell>)
          }
            
        } else if(i===0 && index!==0){
            return <Cell context={context} key={key}/>
        } else {
            return (<Send rnbo={rnbo} context={context} key={key} direction={i<index ? 'right' : 'left'} from={m} to={mod}/>)
        }
    })
  }

  console.log('mtx render with mods: ', modules)
  return (
    <Grid>
      <tbody>
        {modules.length>0 && renderModules()}
      </tbody>
    </Grid>
  )
}

export default Matrix

export const NqParam = (props) => {
  //value, modSwitch, CtlReceiver (includes a ctlSend for each added mod source)
  const {ctlInput, rnbo} = props
  const [modulated, setModulated] = useState(false)
  const [modSources, setModSources] = useState([])

  const renderReceivers = () => {
    return modSources.map((s)=>{

    })
  }

  const addReceiver = () =>{

  }

  const manualAdjust = (e) => {
    const event = new rnbo.MessageEvent(rnbo.TimeNow, "in"+ctlInput.inlet, [e.target.value]);
    ctlInput.module.device.scheduleEvent(event);
  }
  return (
    <span>
      <button onClick={(e)=>{setModulated(!modulated)}}>{modulated ? "modulated" : "manual"}</button>
      {modulated ?
        <button onClick={addReceiver}>add source</button>
        renderReceivers()
      :
        <input type="number" min={ctlInput.range[0]} max={ctlInput.range[1]} onChange={manualAdjust}/>
      }
    </span>
  )

}

export const CtlReceiver = (props) => {
  const {context, module, rnbo} = props

}

export const Op = (props) => {
  const {context, module, rnbo} = props
  const [expanded, setExpanded] = useState(false)

  const testNote = (e, op) => {
    const event = new rnbo.MessageEvent(rnbo.TimeNow, "amp", [1., 1000, 0.]);
    op.device.scheduleEvent(event);
  }

  const testParamChange = (e, op) => {
    console.log('paramchange event: ', e)
    let param = op.device.parameters.find((p)=>p.name==e.target.name)
    param.value = e.target.value
  }
  const testInportMess = (e, op) => {
    // let pitchParam = op.device.parameters.find((p)=>p.name==e.target.name)
    // pitchParam.value = e.target.value

    const event = new rnbo.MessageEvent(rnbo.TimeNow, e.target.name, [e.target.value, 1000, 0.]);
    op.device.scheduleEvent(event);
  }

  const renderNqParams = () => {
    return module.ctlIO.inputs.mod.map((nqP, i)=>{
      return (
        <NqParam ctlInput={nqP} key={i} rnbo={rnbo}/>
      )
    })
  }

  return (
    <Cell context={context}>
      {module.name}
      <button>{expanded ? "˅" : "˃"}</button>
      {expanded &&
        <span>
          <span>
            {renderNqParams()}
            
          </span>
          <span>
            <button onClick={(e)=>{testNote(e, module)}}>note</button>
            <input type="number" name="pitch" min="0" max="127" onChange={(e)=>{testParamChange(e, module)}}/>
            <input type="number" name="fb" min="0" max="1" step="0.01" onChange={(e)=>{testInportMess(e, module)}}/>
          </span>
        </span>
      }
    </Cell>)
}



export const Send = (props) => {
  const {direction, from, to, context, rnbo} = props
  const [enabled, setEnabled] = useState(false)
  const [level, setLevel] = useState(0.)
  const [sendDevice, setSendDevice] = useState(null)

  useEffect(()=>{
    const getDev = async () => {
      if(enabled){
        let dev = await from.sendTo(to)
        // console.log('dev ', dev)
        console.log('send source: ', from)

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
    let val = (direction=="right" ? e.target.value / 100.0 : 1. - e.target.value / 100.0) * 0.5
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