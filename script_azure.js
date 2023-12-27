import fetch from "node-fetch";
import * as fs from 'fs';

// const response = await fetch("https://dev.azure.com/openvinoci/dldt/_apis/pipelines/11/runs?api-version=7.0"); // Linux
// const response = await fetch("https://dev.azure.com/openvinoci/dldt/_apis/pipelines/13/runs?api-version=7.0"); // Windows
// const response = await fetch("https://dev.azure.com/openvinoci/dldt/_apis/pipelines/23/runs?api-version=7.0"); // Windows CC
// const response = await fetch("https://dev.azure.com/openvinoci/dldt/_apis/pipelines/32/runs?api-version=7.0"); // Linux ARM64
// const response = await fetch("https://dev.azure.com/openvinoci/dldt/_apis/pipelines/21/runs?api-version=7.0"); // Linux CC
// const response = await fetch("https://dev.azure.com/openvinoci/dldt/_apis/pipelines/31/runs?api-version=7.0"); // ANDROID ARM64
// const response = await fetch("https://dev.azure.com/openvinoci/dldt/_apis/pipelines/14/runs?api-version=7.0"); // nGraph ONNX
// const response = await fetch("https://dev.azure.com/openvinoci/dldt/_apis/pipelines/39/runs?api-version=7.0"); // CUDA
// const response = await fetch("https://dev.azure.com/openvinoci/dldt/_apis/pipelines/24/runs?api-version=7.0"); // ONNX Runtime
const response = await fetch("https://dev.azure.com/openvinoci/dldt/_apis/pipelines/36/runs?api-version=7.0"); // DEBIAN
const allPipelines = await response.json();
// console.log(allPipelines.value[0]);
// console.log(allPipelines.value[100]);

const workflowsData = []

var numberOfCollected = 0
var totalTimeOfAllPipelines = 0
const numberToCollect = 1000
const pipelineTimes = []

for (const workflowData of allPipelines.value) {
    if (numberOfCollected > numberToCollect) {
        break;
    }
    if (workflowData.state === 'completed' && workflowData.result === 'succeeded') {
        workflowsData.push({
            pipelineURL: workflowData._links.web.href,
            createdDate: workflowData.createdDate,
            finishedDate: workflowData.finishedDate,
            totalTime: Math.abs(new Date(workflowData.finishedDate) - new Date(workflowData.createdDate)) / 1000 / 60
        })
        const pipelineTime = Math.abs(new Date(workflowData.finishedDate) - new Date(workflowData.createdDate)) / 1000 / 60
        totalTimeOfAllPipelines += pipelineTime
        pipelineTimes.push(pipelineTime)
        numberOfCollected++
    }
}
// console.log(JSON.stringify(workflowsData, null, 2))

console.log(`# of COLLECTED PIPELINES: ${workflowsData.length}`)

console.log(`AVERAGE TIME (minutes): ${totalTimeOfAllPipelines / numberToCollect}`)


fs.writeFile('workflowsData_Azure.json', JSON.stringify(workflowsData), function (err) {
    if (err) {
        console.log(err);
    }
});

function median(values) {

  values.sort(function(a,b){
    return a-b;
  });

  var half = Math.floor(values.length / 2);

  if (values.length % 2)
    return values[half];

  return (values[half - 1] + values[half]) / 2.0;
}

console.log(`MEDIAN TIME (minutes): ${median(pipelineTimes)}`)