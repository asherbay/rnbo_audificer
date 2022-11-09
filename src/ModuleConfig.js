import React, {useState, useEffect} from 'react'
import styled from 'styled-components'
import AudioNetwork from './AudioNetwork'
// import AudioModule from './AudioNetwork'
import RNBO from '@rnbo/js'
import require from 'requirejs'


const ModuleConfig = () => {
    const [audioModules, setAudioModules] = useState([])
    const [context, setContext] = useState(null)


    useEffect(()=>{
        if(!context){
            let WAContext = window.AudioContext || window.webkitAudioContext;
            setContext(new WAContext())
            setAudioModules([])
        }
    })

    const countModuleType = (type) => {
    let count = 0
    audioModules.forEach((mod)=>{
      if(mod.type===type){
        count++
      }
    })
    return count
  }

  class Send {
    constructor(source, target){
      this.source = source
      this.target = target
      // this.node = context.createGain()
      this.deviceJSON = require('./patchers/AudioSend.export.json')
      this.device = null
      this.context = null
    }
  }

  class AudioModule {
    constructor(type){
      this.type = type
      this.name = type+(countModuleType(type) + 1)
      this.deviceJSON = require('./patchers/'+type+'.export.json')
      this.device = null
      this.context = null
      this.sends = []
    }

    async sendTo(targetModule){
      let send = new Send(this, targetModule)
      send.context = targetModule.context
      send.device = await jsonToDevice(send.deviceJSON, context)
      if(this.device!=null){
        this.device.node.connect(send.device.node)
      }
      if(send && targetModule.device!=null){
        send.device.node.connect(targetModule.device.node)
        this.sends.push(send)
        return send
      }
      
    }

    get receives(){
      // get all sends targeting this module
      let arr = []
      // audioModules.forEach((m)=>{
      //   if(m.){

      //   }
      // })
      return arr
    }
  }

  const jsonToDevice = async (json, context) => {
    let response, patcher, device;   
    try {
        patcher = await json
        //console.log("patcher: ", patcher)
    } catch (err) {
        console.log(err)
    }
    
    // Create the device
    try {
        device = await RNBO.createDevice({ context, patcher });
        // console.log("params", device.parameters)
    } catch (err) {
        console.log("err", err) 
    }
    return device
  }

    return (
        <div>
            <Menu>
                <span>Add: </span>
                <AddModule onClick={()=>{setAudioModules([...audioModules, new AudioModule("TestTone")])}}>TestTone</AddModule>
            </Menu>
            {context && <AudioNetwork context={context} audioModules={audioModules} setAudioModules={setAudioModules}/>}
            
        </div>
    )
}

export default ModuleConfig

const AddModule = styled.span`
    border: 1px solid black;
    width: 50px;
    &:hover{
        cursor: pointer
    }
`

const Menu = styled.span`
    display: flex;
    flex-direction: column;
    gap: 5px;
`