const mqtt = require('mqtt');
const http = require('http');
const express = require('express');
const socketIo = require('socket.io');
const rateLimit = require('express-rate-limit');

// MQTT setup for local communication
const client = mqtt.connect("mqtt://broker.hivemq.com:1883");
const topic = "/generator_jeetasha_ID";


// Express setup for local API (fog node)
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Configure rate limiting middleware
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Apply to all requests


// Serve static files (optional)
app.use(express.static('web'));

app.use((req, res, next) => {
    console.log(`Received request: ${req.method} ${req.url}`);
    next();
});

// MQTT setup for receiving and publishing sensor data
client.on('connect', () => {
    console.log('MQTT connected to fog node');
    setInterval(sensortest, 10000); // Simulate sensor testing every 10 seconds
});

// Process sensor data locally and make decisions
function processSensorData(sensorData) {
    const { temperature, humidity, occupancy } = sensorData;

    // Local decision-making: turn AC on/off based on temperature and occupancy
    if (occupancy === 'yes' && temperature > 25) {
        console.log('AC ON: High temperature and occupancy detected.');
        sendToCloud(sensorData); // Send important data to the cloud
    } else if (occupancy === 'no' || temperature <= 25) {
        console.log('AC OFF: No occupancy or temperature is low.');
    }

    // You could also store data locally or in a local database if needed
}

// Simulate sensor data and process it locally
function sensortest() {
    const sensorData = {
        name: "temperaturesensor1",
        address: "221 Burwood Hwy, Burwood VIC 3125",
        time: Date.now(),
        // temperature: Math.floor(Math.random() * (30 - 10) + 10),
        temperature: 50,
        humidity: Math.floor(Math.random() * (40 - 20) + 20),
        occupancy: Math.random() > 0.5 ? "yes" : "no",
    };

    // Local processing of sensor data
    processSensorData(sensorData);
}

// Send data to the cloud (EC2) when necessary
function sendToCloud(sensorData) {
    const message = JSON.stringify(sensorData);
    // Publish filtered/aggregated data to the cloud MQTT topic
    client.publish('/cloud_sensor_data', message, (error) => {
        if (error) {
            console.error('Failed to publish to cloud:', error);
        } else {
            console.log('Data sent to the cloud:', message);
        }
    });
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('Closing connections');
    client.end();
    process.exit();
});

// Start fog node server locally (optional)
server.listen(3001, () => {
    console.log('Fog node server running on port 3001');
});
