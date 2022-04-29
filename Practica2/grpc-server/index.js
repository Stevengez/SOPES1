var PROTO_PATH = "./Proto/protoAPI.proto";

const { rps, flipit, bigBrother, smallBrother, roulette } = require('./Games');

const amqp = require('amqplib/callback_api');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { delay } = require('lodash');
const packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    }
);

const proyectDef = grpc.loadPackageDefinition(packageDefinition).protoAPI;

const ServerPort = process.env.gRPC_SERVER_PORT || 50051;
const RabbitServer = process.env.RABBIT_SERVER || "localhost";
const RabbitPort = process.env.RABBIT_PORT || 5672;
const RabbitUser = process.env.RABBIT_USER || "rabbit";
const RabbitPass = process.env.RABBIT_PASSWORD || "sopes1";
const RabbitQueue = process.env.RABBIT_QUEUE || "GameQueue";
var RabbitChannel = undefined;

function getGame(id){
    switch(id){
        case 1:
            return rps;
        case 2:
            return flipit;
        case 3:
            return bigBrother;
        case 4:
            return smallBrother;
        case 5:
            return roulette;
        default:
            return rps;
    }
}

function getGameName(id){
    switch(id){
        case 1:
            return "Piedra, Papel o Tijeras";
        case 2:
            return "Cara o Cruz";
        case 3:
            return "Numero mayor";
        case 4:
            return "Numero menor";
        case 5:
            return "Ruleta";
        default:
            return rps;
    }
}

function startGame(call, callback){
    let fgame = getGame(call.request.gameid);
    let winner = fgame(call.request.players);

    let log = {
        game_id: parseInt(call.request.gameid),
        players_num: parseInt(call.request.players),
        game_name: getGameName(call.request.gameid),
        winner: parseInt(winner),
        queue: "RabbitMQ"
    }

    RabbitChannel.sendToQueue(RabbitQueue, Buffer.from(JSON.stringify(log)));

    callback(null, {
        status: 1
    });
}

function startServer() {
    var server = new grpc.Server();
    server.addService(proyectDef.localAPI.service, {
        startGame: startGame
    });
    server.bindAsync(
        `0.0.0.0:${ServerPort}`,
        grpc.ServerCredentials.createInsecure(),
        () => {
            server.start();
        }
    );
}

const channelCreation = (error, channel) => {
    if(error){
        console.log("Error with channel creation:",error);
        return;
    }

    RabbitChannel = channel;
    RabbitChannel.assertQueue(RabbitQueue, {
        durable: false
    });
    console.log("GameQueue creation - OK");
}

const connectionResult = async (error, connection) => {
    if(error){
        console.log("Error with the connection:",error);
        return;
    }
    console.log("Connection to RabbitMQ server succeed");
    this.RabbitConn = connection;
    this.RabbitConn.createChannel(channelCreation);
}

const rabbitConnect = () => {
    amqp.connect(`amqp://${RabbitUser}:${RabbitPass}@${RabbitServer}`, connectionResult);
}

delay(rabbitConnect,10000);
delay(startServer,15000);

