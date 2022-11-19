import React, {useState, useEffect} from 'react'
import styled from 'styled-components'
import AudioNetwork from './AudioNetwork'
// import AudioModule from './AudioNetwork'
import RNBO from '@rnbo/js'
import require from 'requirejs'

const MatrixConfig = (props) => {
    const {setSelAudioModules, setSelControlModules} = props
    // const audioModuleTypes = ["Op", "TestTone", "Filter", "Comb"]
    const [audioModuleCount, setAudioModuleCount] = useState({"Op": 0, "TestTone": 0, "Filter": 0, "Comb": 0})
    const [controlModuleCount, setControlModuleCount] = useState({"TestEnv": 0, "Trigger": 0, "Env": 0, "Pulse": 0, "Stepper": 0})


    const setQuant = (e, list, setter) => {
      console.log(e)
      let type = e.target.name
      let newCount = list
      newCount[type] = e.target.value
      setter(newCount)
    }

    const addGroup = () => {
      let selAudioMods = []
      Object.keys(audioModuleCount).forEach((aType)=>{
        let i = 0
        while (i<audioModuleCount[aType]){
          selAudioMods.push(aType)
          i++
        }
      })
      let selControlMods = []
      Object.keys(controlModuleCount).forEach((cType)=>{
        let i = 0
        while (i<controlModuleCount[cType]){
          selControlMods.push(cType)
          i++
        }
      })
      // console.log('selMods: ', selAudioMods)
      setSelAudioModules(selAudioMods)
      setSelControlModules(selControlMods)

    }

    const renderAudioOptions = () => {
        return Object.keys(audioModuleCount).map((type)=>{
          return (
            <Quantity> 
              <span>{type}</span>
              <input style={{width: "30px"}} type="number" min="0" name={type} onChange={(e)=>{setQuant(e, audioModuleCount, setAudioModuleCount)}}/>
            </Quantity>)
        })
    }

    const renderControlOptions = () => {
      return Object.keys(controlModuleCount).map((type)=>{
        return (
          <Quantity> 
            <span>{type}</span>
            <input style={{width: "30px"}} type="number" min="0" name={type} onChange={(e)=>{setQuant(e, controlModuleCount, setControlModuleCount)}}/>
          </Quantity>)
      })
  }
    
  return (
    <Box>
      {renderAudioOptions()}
      <hr style={{width: "100%"}}/>
      {renderControlOptions()}
      <button style={{margin: "5px"}} onClick={addGroup}>add</button>
    </Box>
  )
}


export default MatrixConfig


export const Quantity = styled.span`
  &>*{
    margin: 5px;
  }
    display: flex;
    width: 100%;
    gap: 0px;
    
`
export const Box = styled.span`
    display: flex;
    flex-direction: column;
    gap: 5px;
    width: 130px;
    border: 1px solid black;
    align-items: start;
    justify-content: center;
`

//feature/asher.bay/GCA-dbscripting