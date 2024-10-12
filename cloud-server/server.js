const express = require('express');
const fs = require('fs');
const https = require('https');
const socketIo = require('socket.io');
const mqtt = require('mqtt');
const mongoose = require('mongoose');
const helmet = require('helmet');

// SSL options with the generated certificates
var sslOptions = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
    passphrase: 'Jeetasha'  // Enter your passphrase here
};

// Initialize Express and enable Helmet middleware
const app = express();
app.use(helmet());  // Secure your app by setting various HTTP headers

// Serve static files from the 'web' directory
app.use(express.static('web'));

// Create an HTTPS server
const server = https.createServer(sslOptions, app);
const io = socketIo(server);

// MQTT setup
const client = mqtt.connect("mqtt://broker.hivemq.com:1883");
const topic = "/generator_jeetasha_ID";

// Connect to MongoDB
mongoose.connect('mongodb+srv://arorajeetasha:q9emFLEvzJUPa6tU@sit314.rhia6.mon>
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Emit sensor data to clients
function emitSensorDataToClients(sensordata) {
    io.emit('sensorData', sensordata);

// Fetch the latest sensor data
async function getLatestSensorData() {
    try {
        const latestData = await Sensor.findOne().sort({ time: -1 });
        console.log("sensor data", latestData);
        return latestData;
    } catch (err) {
        console.error('Error fetching latest sensor data:', err);
        return null;
    }
}

// MQTT client setup
client.on('connect', () => {
    console.log('MQTT connected');
    setInterval(sensortest, 10000); // Fetch sensor data every 10 seconds
});

// Example function to simulate sensor data for testing
function sensortest() {
    const sensordata = {
        temperature: Math.random() * 100,
        humidity: Math.random() * 100,
        time: Date.now(),
    };

    // Publish the sensor data to MQTT topic
    const message = JSON.stringify(sensordata);
    client.publish(topic, message, (error) => {
        if (error) {
            console.error('Failed to publish message:', error);
        } else {
            console.log('Message published:', message);
        }
    });

    // Save the sensor data to MongoDB
    const newSensor = new Sensor(sensordata);
    newSensor.save()
        .then(doc => {
            const time2 = Date.now();
            console.log('Data saved:', doc);
         // Emit the new sensor data to clients
            emitSensorDataToClients(sensordata);
        })
        .catch(err => console.error('Error saving data:', err));
}

// Handle Socket.IO connections
io.on('connection', (socket) => {
    console.log('New client connected');
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Handle process termination gracefully
process.on('SIGINT', () => {
    console.log('Closing connections');
    client.end();
    mongoose.connection.close()
        .then(() => process.exit())
        .catch(err => {
            console.error('Error closing MongoDB connection:', err);
            process.exit(1);
        });
});

// Start the HTTPS server on port 3060
const port = 3060;
server.listen(port, () => {
    console.log(Secure server listening on port ${port});
});
