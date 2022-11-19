import React, {useEffect, useState} from 'react'
import * as Tone from 'tone'
import styled from 'styled-components'
import Matrix from './components/Matrix'
import require from 'requirejs'

const ControlPanel = (props) => {
  const {audioModules, controlModules, context, rnbo} = props

  const renderModules = () => {
    return controlModules.map((m)=>{
      if(m.type=="Trigger"){
        return <Trigger module={m} rnbo={rnbo} key={m.name}/>
      } else if(m.type=="TestEnv"){
          const manualTrig = (e, module) => {
            const event = new rnbo.MessageEvent(rnbo.TimeNow, "manual", [ "bang" ]);
            module.device.scheduleEvent(event)
          }
          return (
            <Module module={m} rnbo={rnbo} key={m.name}>
              {m.name}
              <button onClick={(e)=>{manualTrig(e, m)}}>!</button>
            </Module>
          )
      } else {
        return <Module key={m.name}>{m.name}</Module>
      }
    })
  }

  return (
    <Panel>
      {renderModules()}
    </Panel>
  )
}

export default ControlPanel

const SourceSelector = (props) => {
  const [enabled, setEnabled] = useState(false)
  
  return (
    <div>ControlPanel</div>
  )
}

export default ControlPanel

const Panel = styled.span`
    display: flex;
    gap: 5px;
    border: 1px solid black;
    align-items: start;
`

const Module = styled.span`
    display: flex;
    flex-direction: column;
    gap: 5px;
    border: 1px solid black;
    align-items: start;
    justify-content: center;
`


export const Env = () => {
  return (
    <div>Env</div>
  )
}

export const Trigger = (props) => {
  const {module, rnbo} = props

  const trig = (e) => {
    const event = new rnbo.MessageEvent(rnbo.TimeNow, "in1", [ "bang" ]);
    module.device.scheduleEvent(event)
    console.log("trigged")
  }

  return (
    <Module>
      <button onClick={trig}>!</button>
    </Module>
  )
}

export const Macro = () => {
  return (
    <div>Macro</div>
  )
}