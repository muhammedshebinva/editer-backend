var express = require('express');
const ffmpeg= require('fluent-ffmpeg')
const path = require('path')
const cors = require('cors');
const multer = require('multer');

var app = express();
const port= 3001;

app.use(cors());

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
const ffprobePath = require('@ffprobe-installer/ffprobe')

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);



app.get('/', function (req, res) {
   res.send('Hi');
})

// Set up storage using multer.diskStorage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Destination folder for uploaded files
    },
    filename: (req, file, cb) => {
      //cb(null, Date.now() + '-' + file.originalname); // Use current timestamp in filename
      const newFilename = 'input.mp4'; // Rename the file to 'input.mp4'
      cb(null, newFilename);
    },
  });
  
  const upload = multer({ storage });
  
  // API endpoint to handle file upload
  app.post('/upload', upload.single('file'), (req, res) => {
    res.send('File uploaded successfully.');
  });
  

app.get('/convert', (req,res)=>{
    const inputpath =path.resolve(__dirname,'input.mp4')
    const outputpath =path.resolve(__dirname,'output.mp4')

    console.log('inp path: ---',inputpath);

    const cov = new ffmpeg({source: "./input.mp4"})

    //ffmpeg().input(inputpath)
    cov
    .output(outputpath)
    .on('end', ()=>{
        console.log('Conversion finished');
        res.send('File converted successfully')
    })
    .on('error', (err) => {
        console.log("Error", err.message);
        res.status(500).send('Error converting file');
    })
    .run();
});

//trim video

app.get('/trim',(req,res)=>{
    
    const outputpath =path.resolve(__dirname,'output.mp4')

    const trim= new ffmpeg({ source: "./input.mp4"});

trim
.setStartTime(1)
.setDuration(3)
.on('start', function(commandLine){
    console.log("spawned ffmpeg with command: " + commandLine);
})
.on("error", function(err){
    console.log("error: ",+err);
})
.on("end", function(err){
    if(!err){
        console.log("conversion done");
    }
})
.saveToFile(outputpath)
})

app.get('/post', async (req,res)=> {
    
    res.send('Hello, Express!');
    
})

//send to front end
app.get('/getVideo', (req, res) => {
    const videoPath = path.join(__dirname, 'uploads', 'input.mp4');
    res.sendFile(videoPath, { headers: { 'Content-Type': 'video/mp4' } });
  });
  


app.listen(port,() => {
    console.log(`server running on port${port}`);
})

