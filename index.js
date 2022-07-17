const line = require('@line/bot-sdk')
const express = require('express')
const Axios = require('axios').default
const dotenv = require('dotenv')
const { request } = require('http')
const app = express()
const Fs = require ('fs')
const Fse = require('fs-extra')
const Path = require('path')
const vision = require('@google-cloud/vision');
const env = dotenv.config().parsed

const lineConfig = {
    channelAccessToken: env.ACCESS_TOKEN,
    channelSecret: env.SECRET_TOKEN
}

app.post('/webhook', line.middleware(lineConfig), async (req, res) => {
    try {
        const events = req.body.events[0]
                console.log(events)
        const messageId = req.body.events[0].message.id
            // console.log(replyToken)
        const replyToken = req.body.events[0].replyToken
            // console.log(replyToken)

        const Token = 'W0Z58zepimZGjsoCDNFc14WOZpeaV3l6tPW8z4deSnIXS9kIZAYNDUlfEB59ZoSre83XaUaWtIndRWIJ+LtmqQ/FU2HQnFyRHPth/05PdrA1j4Q7pz4XJ2ZoYgtRmO+mISXagdyGMC75WBZg6C/qGgdB04t89/1O/w1cDnyilFU='

        var image = `./Images/${messageId}.jpg`


        
        async function replyMessageWait(){
             const message = {
                type: 'text',
                text: 'กรุณารอซักครู่นะคะ'
              };

              const client = new line.Client({
                channelAccessToken: Token
              });
              await client.replyMessage(replyToken, message)
                .then(() => {
                  
                })
                .catch((err) => {
                  // error handling
                });
        };

        async function getImage(){

            var buffArray = []
            var jpg = ".jpg"
            var namefile = ((messageId).toString())
             pic = ((namefile+jpg).toString())

            const client = new line.Client({
                channelAccessToken: Token
              });
              
             await client.getMessageContent(messageId)
                .then((stream) => {
                  stream.on('data', (chunk) => {
                    
                    buffArray.push(chunk) 
                    stream.on('end', (chunk) => {

                      buff = Buffer.concat(buffArray)

                          Fs.writeFile(`./Images/${messageId}.jpg`, buff,  function (err) {
                            if (err) throw err;              
                          }); 

                        }) 

                  });

                  console.log('success!')
                  stream.on('error', (err) => {
                    // error handling
                  });
                });

        };

        async function ORC(){
            const client = new vision.ImageAnnotatorClient({
                    keyFilename: 'find-land-home-app-5e8702d1c4cd.json'
                  });

                        /**
                 * TODO(developer): Uncomment the following line before running the sample.
                 */
                const fileName = `./Images/16437732729230.jpg`;
                const request = {
                    image: {content: Fs.readFileSync(fileName)},
                };
                
                const [result] = await client.objectLocalization(request);
                const objects = result.localizedObjectAnnotations;
                objects.forEach(object => {
                    // console.log(`Name: ${object.name}`);
                    // console.log(`Confidence: ${object.score}`);
                    console.log(objects);
                    console.log(result);

                    const vertices = object.boundingPoly.normalizedVertices;
                    vertices.forEach(v => console.log(`x: ${v.x}, y:${v.y}`));
                });



                }         
        
                
       
     async function predictClassification() {
                    /**
             * TODO(developer): Uncomment these variables before running the sample.
             */
                         const projectId = 'find-land-home-app';
                         const location = 'us-central1';
                         const modelId = 'ICN9025601780855078912';
                         const filePath = image;
                        
             
                         // Imports the Google Cloud AutoML library
                         const {PredictionServiceClient} = require('@google-cloud/automl').v1;
                         
             
                         // Instantiates a client
                         const client = new PredictionServiceClient();
             
                         // Read the file content for translation.
                         const content = Fs.readFileSync(filePath);
             
            // Construct request
            // params is additional domain-specific parameters.
            // score_threshold is used to filter the result
            const request = {
                name: client.modelPath(projectId, location, modelId),
                payload: {
                image: {
                    imageBytes: content,
                },
                },
            };

            const [response] = await client.predict(request);

            for (const annotationPayload of response.payload) {
                console.log(`Predicted class name: ${annotationPayload.displayName}`);
                console.log(
                `Predicted class score: ${annotationPayload.classification.score}`
                );
            }
            }   
           
            // predictClassification();

        switch (events.type) {
            case 'message' :  
                switch (events.message.type){
                    case 'text' : break
                    case 'image' : 
                    replyMessageWait();
                    getImage(); 
                    // setTimeout(predictClassification,5000);             
                    
                      break
                }
            
                break

            case 'postback' : console.log('แจ่มแมว')
        }



        res.status(200).send("OK")
    } catch (error) {
        res.status(500).end()
    }
});


app.listen(4000, () => {
    console.log ('listen on 4000')
});