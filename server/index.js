const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const config = require('./config');
const FakeDb = require('./fake-db');
const Rental = require('./models/rental');
const path = require('path');

const rentalRoutes = require('./routes/rentals'),
      userRoutes = require('./routes/users'),
      bookingRoutes = require('./routes/bookings'),
      paymentRoutes = require('./routes/payments'),
      imageUploadRoutes = require('./routes/image-upload');

mongoose.connect(config.DB_URI).then(() => {
  if (process.env.NODE_ENV !== 'production') {
    const fakeDb = new FakeDb();
    fakeDb.seedDb();
  }
});

const app = express();



app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname,"/public")));

app.get('/vid/:room',(req, res)=>{
    res.render('room',{roomId:req.params.room})
})

app.use('/api/v1/rentals', rentalRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1', imageUploadRoutes);
const server = require("http").Server(app);
const io = require('socket.io')(server);


if (process.env.NODE_ENV === 'production') {
  const appPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(appPath));

  app.get('*', function(req, res) {
    res.sendFile(path.resolve(appPath, 'index.html'));
  });
}else{
	const appPath = path.join(__dirname, '..', 'build');
 	app.use(express.static(appPath));

    app.get('*', function(req, res) {
		res.sendFile(path.resolve(appPath, 'index.html'));
    });
}


io.on('connection', socket=>{
  socket.on('join-room',(roomId, userid)=>{
      socket.join(roomId)
      socket.to(roomId).broadcast.emit("user-connected", userid );
      socket.on('disconnect',()=>{
          socket.to(roomId).broadcast.emit("user-disconnect", userid );
      })
  })
 
})


const PORT = process.env.PORT || 4000;

server.listen(PORT , function() {
  console.log('App is running!');
});
