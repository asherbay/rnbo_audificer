import {useEffect, useState} from 'react'
import * as Tone from 'tone'
import RNBO from '@rnbo/js'
import styled from 'styled-components'
import Matrix from './components/Matrix'
import require from 'requirejs'
/*
  NO STATE 
    - modules and context both stored in variables
  setup function:
    - new context
    - new outputNode
    - new AudioModule for each selAudioModule (plus AudioOut)
    - new device for each AudioModule (async)
    - new send from & to each module



*/



const AudioNetwork = (props) => {
  const {selAudioModules} = props
  let WAContext = window.AudioContext || window.webkitAudioContext;
  let context = new WAContext();
  let outputNode
  let audioModules = [

  ]

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
      this.deviceJSON = require('./patchers/AudioSend.export.json')
      this.device = null
    }
  }

  class AudioModule {
    constructor(type){
      this.type = type
      this.name = type+(countModuleType(type) + 1)
      this.deviceJSON = require('./patchers/'+type+'.export.json')
      this.device = null
      this.sends = []
    }

    async sendTo(targetModule){ //this should only be called in the setup function, not every time a send is enabled like before
      let send = new Send(this, targetModule)
      send.device = await jsonToDevice(send.deviceJSON) 
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

  const jsonToDevice = async (json) => {
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


  
  const setup = async () => {
    console.log("setup")
    // new context
    

    // new outputNode
    outputNode = new GainNode(context)
    outputNode.connect(context.destination);

    // new AudioModule for each selAudioModule (plus AudioOut)
    selAudioModules.forEach((mType)=>{
      audioModules.push(new AudioModule(mType))
    })
    audioModules.unshift(new AudioModule("AudioOut"))

    // new device for each AudioModule (async)
    for (let mod of audioModules){
      mod.device = await jsonToDevice(mod.deviceJSON)
      console.log('device added for: ', mod.name)
    }

    // new send from & to each module:
      // for (let mod of audioModules){
      //   let sends = []
      //   for (let m of audioModules){
      //     let send
      //     if(mod.name!=m.name && mod.type!= "AudioOut"){
      //       await mod.sendTo(m)
      //     }
      //   }
      // }
    

    // AudioOut->outputNode
    let audioOut = audioModules.find((m)=>m.type==="AudioOut")
    audioOut.device.node.connect(context.destination)//outputNode)

  }

  /*
  NO STATE 
    - modules and context both stored in variables
  setup function:
    - new context
    - new outputNode
    - new AudioModule for each selAudioModule (plus AudioOut)
    - new device for each AudioModule (async)
    - new send from & to each module
    - connect sends  
    - AudioOut->outputNode



*/

  const startAudio = () => {
    context.resume()
  }



  setup()

  return (
    <div style={{width: "100vw", height: "100vh"}} onClick={startAudio}>
      <Matrix modules={audioModules} context={context} rnbo={RNBO}/>
    </div>
  );
}

export default AudioNetwork;


