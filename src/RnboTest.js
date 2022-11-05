import {useEffect, useState} from 'react'
import * as Tone from 'tone'
import RNBO from '@rnbo/js'

import patcherData from './patch.export.json'

//const loadData = () => JSON.parse(JSON.stringify(patcherData));

function RnboTest() {
  let context
  let device

  const setParam = (e) => {
    if(device){
      device.parameters[0].value = e.target.value * 10.0
    }
  }

  // useEffect(()=>{
  //   setup()
  // }, [])
  async function setup() {
    const patchExportURL = "patch.export.json";

    // // Create AudioContext
    // context = Tone.getContext()//new Tone.Context();
    // console.log("context: ", context.name)
    // Create AudioContext
  let WAContext = window.AudioContext || window.webkitAudioContext;
  context = new WAContext();

    // Create gain node and connect it to audio output
    const outputNode = context.createGain() //new Tone.Gain(1.0).toDestination();
    outputNode.connect(context.destination);
    
    // Fetch the exported patcher
    let response, patcher;
    try {
       // response = await fetch(patchExportURL);
        patcher = await patcherData//.json()//await response.json();

        console.log("patcher", patcher)
       // if (!window.RNBO) {
            // Load RNBO script dynamically
            // Note that you can skip this by knowing the RNBO version of your patch
            // beforehand and just include it using a <script> tag
         //   await loadRNBOScript(patcher.desc.meta.rnboversion);
        //}

    } catch (err) {
        const errorContext = {
            error: err
        };
        if (response && (response.status >= 300 || response.status < 200)) {
            errorContext.header = `Couldn't load patcher export bundle`
            errorContext.description = `Check app.js to see what file it's trying to load. Currently it's` +
            ` trying to load "${patchExportURL}". If that doesn't` + 
            ` match the name of the file you exported from RNBO, modify` + 
            ` patchExportURL in app.js.`;
        }
        console.log(err)
       
       // return;
    }
    

    // Create the device
    
    //let patcherjson = await patcher.json()
    try {
        device = await RNBO.createDevice({ context, patcher });
        console.log("params", device.parameters)
    } catch (err) {
        console.log("err", err)
        //return; 
    }

    // Connect the device to the web audio graph
    device.node.connect(outputNode);

   // document.body.onclick = () => {
   //     context.resume();
   // }
  }
  

  function loadRNBOScript(version) {
    return new Promise((resolve, reject) => {
        if (/^\d+\.\d+\.\d+-dev$/.test(version)) {
            throw new Error("Patcher exported with a Debug Version!\nPlease specify the correct RNBO version to use in the code.");
        }
        const el = document.createElement("script");
        el.src = "https://c74-public.nyc3.digitaloceanspaces.com/rnbo/" + encodeURIComponent(version) + "/rnbo.min.js";
        el.onload = resolve;
        el.onerror = function(err) {
            console.log(err);
            reject(new Error("Failed to load rnbo.js v" + version));
        };
        document.body.append(el);
    });
}

  function start (){
    //Tone.start()
    context.resume();
    console.log("context state", Tone.getContext().state)
    
  }

  setup()

  return (
    <div>
      <input type="range" onChange={setParam}/>
    </div>
  );
}



export default RnboTest;
